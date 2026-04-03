/**
 * Full-page translation benchmark: translates actual Wikipedia pages
 * using the same prompt pipeline as the Chrome extension, then evaluates
 * fluency with Claude Opus and Codex 5.4 xhigh.
 */
import dotenv from 'dotenv';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.E2E_OPENROUTER_API_KEY;
if (!API_KEY) throw new Error('Missing E2E_OPENROUTER_API_KEY');

const MODELS = [
  'google/gemma-4-31b-it',
  'google/gemini-3.1-flash-lite-preview',
  // 'qwen/qwen3.5-35b-a3b', // Excluded: unstable (timeouts + empty responses)
];

const PAGES = [
  {
    url: 'https://en.wikipedia.org/wiki/Representation_theory_of_finite_groups',
    slug: 'rep-theory-finite-groups',
  },
  {
    url: 'https://en.wikipedia.org/wiki/Representation_theory',
    slug: 'rep-theory',
  },
];

const SYSTEM_PROMPT = [
  'Translate English -> Japanese.',
  'Input is JSON array of fragment objects.',
  'Each fragment: t=source text, optional r=role.',
  'Each fragment is plain text.',
  'Style: fluent expository prose that reads naturally on the page.',
  'Japanese register: dearu. Do not mix dearu and desu-masu styles.',
  'If r=heading, translate it as a concise section heading.',
  'Translate every fragment completely. Never leave a source-language sentence or clause untranslated.',
  'CRITICAL: Every [[…]] marker token is a protected placeholder. Copy each marker exactly once in the same order. Never drop any marker.',
  'Return JSON: {"translations":["...","..."]}.',
  'Same count. Plain text only. No prose.',
].join('\n');

const BATCH_SIZE = 15;
const MAX_TOKENS = 4000;
const REQUEST_TIMEOUT = 120_000;

// Skip already completed (model, page) combinations
import { existsSync } from 'fs';
function isAlreadyDone(outDir, pageSlug, modelId) {
  const file = `${pageSlug}_${modelId.replace(/\//g, '_')}.json`;
  return existsSync(resolve(outDir, file));
}

/** Extract translatable text blocks from Wikipedia HTML */
function extractBlocks(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Remove non-content elements
  doc.querySelectorAll('script, style, nav, .navbox, .mw-editsection, .reference, .reflist, .toc, .sidebar, .infobox, .metadata, .noprint, .catlinks, #mw-navigation, #footer, .mw-indicators').forEach(el => el.remove());

  const main = doc.querySelector('.mw-parser-output') || doc.querySelector('#mw-content-text') || doc.body;
  const blocks = [];

  main.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, caption, figcaption, dt, dd').forEach(el => {
    // Remove MathML annotation text (it leaks LaTeX like {\displaystyle ...})
    el.querySelectorAll('annotation').forEach(a => a.remove());
    el.querySelectorAll('.mwe-math-mathml-a11y').forEach(a => a.remove());

    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < 5) return;
    if (text.length > 2000) return; // Skip extremely long blocks

    const tag = el.tagName.toLowerCase();
    const role = /^h[1-6]$/.test(tag) ? 'heading'
      : tag === 'li' ? 'list-item'
      : tag === 'caption' || tag === 'figcaption' ? 'caption'
      : undefined;

    blocks.push({ text, role, tag });
  });

  return blocks;
}

/** Translate a batch of fragments */
async function translateBatch(modelId, fragments) {
  const payload = fragments.map(f => {
    const obj = { t: f.text };
    if (f.role) obj.r = f.role;
    return obj;
  });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    body: JSON.stringify({
      model: modelId,
      max_tokens: MAX_TOKENS,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(payload) },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(`${response.status}: ${err?.error?.message || 'unknown'}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response');

  const parsed = JSON.parse(content);
  const translations = parsed.translations || parsed;
  const usage = result.usage || {};

  return { translations, usage };
}

/** Translate an entire page */
async function translatePage(modelId, blocks) {
  const allTranslations = [];
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let requestCount = 0;

  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    const batch = blocks.slice(i, i + BATCH_SIZE);
    try {
      const { translations, usage } = await translateBatch(modelId, batch);
      requestCount++;
      totalPromptTokens += usage.prompt_tokens || 0;
      totalCompletionTokens += usage.completion_tokens || 0;

      if (Array.isArray(translations)) {
        for (let j = 0; j < batch.length; j++) {
          const t = typeof translations[j] === 'string' ? translations[j] : translations[j]?.t || '';
          allTranslations.push({ source: batch[j].text, translation: t, role: batch[j].role });
        }
      }
    } catch (err) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${err.message}`);
      // Push source text as fallback
      batch.forEach(b => allTranslations.push({ source: b.text, translation: `[FAILED] ${b.text}`, role: b.role }));
      requestCount++;
    }

    // Rate limit courtesy
    if (i + BATCH_SIZE < blocks.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return { translations: allTranslations, totalPromptTokens, totalCompletionTokens, requestCount };
}

/** Evaluate translation fluency using an LLM judge */
async function evaluateFluency(judgeModel, judgeLabel, modelId, pageSlug, translations) {
  // Sample up to 20 representative fragments
  const sample = translations
    .filter(t => !t.translation.startsWith('[FAILED]') && t.translation.length > 20)
    .filter(t => !t.role || t.role !== 'heading')
    .slice(0, 20);

  if (sample.length === 0) return { score: 0, comment: 'No valid translations' };

  const evalPrompt = `You are a Japanese language quality evaluator. Rate the following EN→JA translations for fluency on a scale of 1-10.

Criteria:
- Natural Japanese expression (不自然な日本語がないか)
- Consistent register (である調の統一)
- Technical term accuracy (専門用語の正確さ)
- Sentence flow and readability (文の流れと読みやすさ)
- No untranslated English fragments remaining

Model: ${modelId}
Page: ${pageSlug}

Translations (source → translation):
${sample.map((t, i) => `${i + 1}. "${t.source.slice(0, 100)}..." → "${t.translation.slice(0, 150)}..."`).join('\n')}

Respond in JSON: {"score": <1-10>, "comment": "<brief evaluation in Japanese, 2-3 sentences>", "issues": ["<specific issue 1>", ...]}`;

  // All judges via OpenRouter
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      model: judgeModel,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
      temperature: 0,
      messages: [
        { role: 'system', content: 'You are a Japanese language quality evaluator. Always respond in valid JSON.' },
        { role: 'user', content: evalPrompt },
      ],
    }),
  });
  if (!resp.ok) {
    console.error(`  Judge ${judgeModel} failed: ${resp.status}`);
    return { score: 0, comment: `Eval failed: ${resp.status}` };
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content || '';
  try { return JSON.parse(text); } catch { return { score: 0, comment: text.slice(0, 200) }; }
}

// --- Main ---
async function main() {
  const results = [];
  const outDir = resolve(__dirname, 'fullpage-benchmark');
  mkdirSync(outDir, { recursive: true });

  for (const page of PAGES) {
    console.log(`\n=== Fetching ${page.slug} ===`);
    const html = await fetch(page.url).then(r => r.text());
    const blocks = extractBlocks(html);
    console.log(`  ${blocks.length} blocks extracted`);

    for (const modelId of MODELS) {
      if (isAlreadyDone(outDir, page.slug, modelId)) {
        console.log(`\n--- ${modelId} on ${page.slug} --- SKIPPED (already done)`);
        continue;
      }
      console.log(`\n--- ${modelId} on ${page.slug} ---`);
      const startMs = Date.now();

      try {
        const { translations, totalPromptTokens, totalCompletionTokens, requestCount } = await translatePage(modelId, blocks);
        const elapsedMs = Date.now() - startMs;
        const elapsedSec = (elapsedMs / 1000).toFixed(1);

        console.log(`  Done: ${translations.length} blocks, ${requestCount} requests, ${elapsedSec}s`);
        console.log(`  Tokens: ${totalPromptTokens} prompt + ${totalCompletionTokens} completion`);

        // Save translations
        const translationFile = `${page.slug}_${modelId.replace(/\//g, '_')}.json`;
        writeFileSync(resolve(outDir, translationFile), JSON.stringify({ modelId, page: page.slug, translations, totalPromptTokens, totalCompletionTokens, requestCount, elapsedMs }, null, 2));

        // Translation only — evaluation done externally via subagent + codex CLI
        results.push({
          model: modelId,
          page: page.slug,
          blocks: translations.length,
          failedBlocks: translations.filter(t => t.translation.startsWith('[FAILED]')).length,
          requests: requestCount,
          elapsedSec: parseFloat(elapsedSec),
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
        });
      } catch (err) {
        console.error(`  FAILED: ${err.message}`);
        results.push({
          model: modelId,
          page: page.slug,
          error: err.message,
        });
      }
    }
  }

  // Write summary
  writeFileSync(resolve(outDir, 'results.json'), JSON.stringify(results, null, 2));

  // Generate markdown report
  const report = generateReport(results);
  writeFileSync(resolve(outDir, 'report.md'), report);
  console.log(`\n=== Report saved to eval/fullpage-benchmark/report.md ===`);
  console.log(report);
}

function generateReport(results) {
  const lines = [
    `# Full-Page Translation Benchmark`,
    ``,
    `Date: ${new Date().toISOString().split('T')[0]}`,
    `Pages: ${PAGES.map(p => p.slug).join(', ')}`,
    `Models: ${MODELS.join(', ')}`,
    ``,
    `## Results`,
    ``,
    `| Model | Page | Blocks | Failed | Time | Requests | Prompt Tokens | Completion Tokens |`,
    `|-------|------|:------:|:------:|:----:|:--------:|:-------------:|:-----------------:|`,
  ];

  for (const r of results) {
    if (r.error) {
      lines.push(`| ${r.model} | ${r.page} | ERROR | - | - | - | - | - |`);
    } else {
      lines.push(`| ${r.model} | ${r.page} | ${r.blocks} | ${r.failedBlocks} | ${r.elapsedSec}s | ${r.requests} | ${r.promptTokens} | ${r.completionTokens} |`);
    }
  }

  return lines.join('\n');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
