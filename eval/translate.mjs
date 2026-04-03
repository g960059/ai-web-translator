/**
 * Standalone translation script using the same OpenRouter system prompt
 * as the ai-web-translator Chrome extension.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.OPENROUTER_API_KEY || process.env.E2E_OPENROUTER_API_KEY;
const MODEL = process.env.TRANSLATION_MODEL || 'google/gemini-2.5-flash';

if (!API_KEY) {
  console.error('Set OPENROUTER_API_KEY or E2E_OPENROUTER_API_KEY');
  process.exit(1);
}

// Same system prompt structure as src/core/providers/openrouter.ts
function buildSystemPrompt() {
  return [
    'Translate English -> Japanese.',
    'Input is JSON array.',
    'Each fragment is plain text (markdown-formatted article section).',
    'Style: fluent expository prose that reads naturally on the page.',
    'Japanese register: dearu. Do not mix dearu and desu-masu styles.',
    'Return JSON: {"translations":["...","..."]}.',
    'Same count. No prose.',
  ].join('\n');
}

async function translateBatch(fragments) {
  const systemPrompt = buildSystemPrompt();
  const userPayload = JSON.stringify(fragments);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 7000,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPayload },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(`OpenRouter error ${response.status}: ${err?.error?.message || 'unknown'}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');

  const parsed = JSON.parse(content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, ''));
  const translations = parsed.translations || parsed;

  console.log(`  Batch done: ${translations.length} fragments, usage: ${JSON.stringify(payload.usage || {})}`);
  return translations;
}

// Split the markdown into sections for batch translation
function splitIntoSections(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let current = [];

  for (const line of lines) {
    if (/^#{1,4}\s/.test(line) && current.length > 0) {
      sections.push(current.join('\n').trim());
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    sections.push(current.join('\n').trim());
  }

  // Merge very short sections with next
  const merged = [];
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].length < 100 && i + 1 < sections.length) {
      sections[i + 1] = sections[i] + '\n\n' + sections[i + 1];
    } else {
      merged.push(sections[i]);
    }
  }
  return merged;
}

async function main() {
  const originalPath = join(__dirname, 'original.md');
  const original = readFileSync(originalPath, 'utf-8');
  const sections = splitIntoSections(original);

  console.log(`Translating ${sections.length} sections with model: ${MODEL}`);
  console.log(`System prompt:\n${buildSystemPrompt()}\n`);

  // Translate in batches of ~5 sections to stay within token limits
  const BATCH_SIZE = 5;
  const allTranslations = [];

  for (let i = 0; i < sections.length; i += BATCH_SIZE) {
    const batch = sections.slice(i, i + BATCH_SIZE);
    console.log(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1}: sections ${i + 1}-${i + batch.length}`);
    const translations = await translateBatch(batch);
    allTranslations.push(...translations);
  }

  // Build translated document
  const translatedDoc = allTranslations.join('\n\n');
  const translatedPath = join(__dirname, 'translated_ja.md');
  writeFileSync(translatedPath, translatedDoc, 'utf-8');
  console.log(`\nTranslation saved to ${translatedPath}`);

  // Also save a side-by-side comparison
  const comparisonPath = join(__dirname, 'comparison.md');
  let comparison = '# Translation Comparison: Representation Theory\n\n';
  comparison += `Model: ${MODEL}\n`;
  comparison += `System prompt style: ai-web-translator extension (dearu register, fluent expository)\n\n`;
  comparison += '---\n\n';

  for (let i = 0; i < sections.length; i++) {
    comparison += `## Section ${i + 1}\n\n`;
    comparison += `### Original (English)\n\n${sections[i]}\n\n`;
    comparison += `### Translation (Japanese)\n\n${allTranslations[i] || '[MISSING]'}\n\n`;
    comparison += '---\n\n';
  }

  writeFileSync(comparisonPath, comparison, 'utf-8');
  console.log(`Comparison saved to ${comparisonPath}`);
}

main().catch((err) => {
  console.error('Translation failed:', err);
  process.exit(1);
});
