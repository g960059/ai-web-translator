/**
 * Model benchmark v2: broader model set with longer sample text.
 * Results will be evaluated by external LLM judges.
 */
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.E2E_OPENROUTER_API_KEY;
if (!API_KEY) throw new Error('Missing E2E_OPENROUTER_API_KEY');

const MODELS = [
  // Previous top performers
  'google/gemini-2.5-flash-lite',       // $0.40/M — prev winner
  'meta-llama/llama-4-scout',           // $0.30/M — prev runner-up
  // New candidates
  'google/gemini-3-flash-preview',      // $3.00/M — gemini 3 flash
  'moonshotai/kimi-k2-0905',            // $2.00/M — Kimi
  'z-ai/glm-4.7-flash',                // $0.40/M — GLM cheap
  'z-ai/glm-4.5-air',                  // $0.85/M — GLM mid
  'minimax/minimax-m2.5',              // $1.15/M — MiniMax latest
  'minimax/minimax-m2.7',              // $1.20/M — MiniMax newest
  // Baselines
  'google/gemini-3.1-flash-lite-preview', // $1.50/M — current default
  'google/gemini-2.5-flash',            // $2.50/M — high-quality ref
  'deepseek/deepseek-v3.2',            // $0.38/M — DeepSeek
];

const SYSTEM_PROMPT = [
  'Translate English -> Japanese.',
  'Input is JSON array of fragment objects.',
  'Each fragment object uses t=source text, optional r=role.',
  'Each fragment is plain text.',
  'Style: fluent expository prose that reads naturally on the page.',
  'Japanese register: dearu. Do not mix dearu and desu-masu styles.',
  'If r=heading, translate it as a concise section heading.',
  'Translate every fragment including headings and list items. Do not leave source-language text untranslated.',
  'Return JSON: {"translations":["...","..."]}.',
  'Same count. Plain text only. No prose.',
].join('\n');

// Longer, more diverse fragments for better quality assessment
const FRAGMENTS = [
  { t: "Representation theory", r: "heading" },
  { t: "Finite groups", r: "heading" },
  { t: "Harmonic analysis", r: "heading" },
  { t: "See also", r: "heading" },
  { t: "References", r: "heading" },
  { t: "Lie superalgebras", r: "heading" },
  { t: "Representation theory is a branch of mathematics that studies abstract algebraic structures by representing their elements as linear transformations of vector spaces, and studies modules over these abstract algebraic structures. In essence, a representation makes an abstract algebraic object more concrete by describing its elements by matrices and their algebraic operations." },
  { t: "The direct sum of two representations carries no more information about the group G than the two representations do individually. If a representation is the direct sum of two proper nontrivial subrepresentations, it is said to be decomposable. Otherwise, it is said to be indecomposable." },
  { t: "generalizes Fourier analysis via harmonic analysis," },
  { t: "In favorable circumstances, every finite-dimensional representation is a direct sum of irreducible representations: such representations are said to be semisimple. This occurs for finite groups, compact groups, and semisimple Lie algebras." },
  { t: "A Lie algebra over a field F is a vector space over F equipped with a skew-symmetric bilinear operation called the Lie bracket, which satisfies the Jacobi identity. Lie algebras arise in particular as tangent spaces to Lie groups at the identity element, leading to their interpretation as \"infinitesimal symmetries.\"" },
  { t: "Lie superalgebras are generalizations of Lie algebras in which the underlying vector space has a Z₂-grading, and skew-symmetry and Jacobi identity properties of the Lie bracket are modified by signs." },
  { t: "The character of a representation φ: G → GL(V) is the class function χ_φ: G → F defined by χ_φ(g) = Tr(φ(g)), where Tr is the trace." },
];

async function benchmarkModel(modelId) {
  const startMs = Date.now();
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        model: modelId,
        max_tokens: 5000,
        response_format: { type: 'json_object' },
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(FRAGMENTS) },
        ],
      }),
    });

    const elapsedMs = Date.now() - startMs;
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      return { modelId, error: `HTTP ${response.status}: ${err?.error?.message || 'unknown'}`, elapsedMs };
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    const usage = payload.usage;

    let translations = [];
    try {
      const parsed = JSON.parse(content.replace(/^```json\s*/, '').replace(/\s*```$/, ''));
      translations = parsed.translations || parsed;
    } catch {
      return { modelId, error: 'JSON parse failed', excerpt: content?.slice(0, 200), elapsedMs };
    }

    return { modelId, elapsedMs, promptTokens: usage?.prompt_tokens, completionTokens: usage?.completion_tokens, translations };
  } catch (error) {
    return { modelId, error: error.message, elapsedMs: Date.now() - startMs };
  }
}

// Pricing lookup
const PRICING = {
  'google/gemini-2.5-flash-lite': { p: 0.10, c: 0.40 },
  'meta-llama/llama-4-scout': { p: 0.08, c: 0.30 },
  'google/gemini-3-flash-preview': { p: 0.50, c: 3.00 },
  'moonshotai/kimi-k2-0905': { p: 0.40, c: 2.00 },
  'z-ai/glm-4.7-flash': { p: 0.06, c: 0.40 },
  'z-ai/glm-4.5-air': { p: 0.13, c: 0.85 },
  'minimax/minimax-m2.5': { p: 0.19, c: 1.15 },
  'minimax/minimax-m2.7': { p: 0.30, c: 1.20 },
  'google/gemini-3.1-flash-lite-preview': { p: 0.25, c: 1.50 },
  'google/gemini-2.5-flash': { p: 0.30, c: 2.50 },
  'deepseek/deepseek-v3.2': { p: 0.26, c: 0.38 },
};

async function main() {
  console.log(`Benchmarking ${MODELS.length} models with ${FRAGMENTS.length} fragments...\n`);

  const results = await Promise.all(MODELS.map(benchmarkModel));

  // Build evaluation file for external judges
  let evalDoc = '# Model Translation Benchmark\n\n';
  evalDoc += `Fragments: ${FRAGMENTS.length} | System prompt: dearu register, fluent expository\n\n`;

  for (const r of results) {
    evalDoc += `## ${r.modelId}\n\n`;
    if (r.error) {
      evalDoc += `**ERROR**: ${r.error}\n\n`;
      continue;
    }
    const pricing = PRICING[r.modelId] || { p: 0, c: 0 };
    const cost = (r.promptTokens * pricing.p + r.completionTokens * pricing.c) / 1e6;
    evalDoc += `- Time: ${r.elapsedMs}ms | Tokens: ${r.promptTokens}p/${r.completionTokens}c | Cost: $${cost.toFixed(6)}\n\n`;
    evalDoc += '| # | Original | Translation |\n|---|----------|-------------|\n';
    for (let i = 0; i < FRAGMENTS.length; i++) {
      const src = FRAGMENTS[i].t.replace(/\|/g, '\\|').slice(0, 80);
      const role = FRAGMENTS[i].r ? ` **[${FRAGMENTS[i].r}]**` : '';
      const tgt = (r.translations[i] || '[MISSING]').replace(/\|/g, '\\|');
      evalDoc += `| ${i} | ${src}...${role} | ${tgt} |\n`;
    }
    evalDoc += '\n';
  }

  // Summary
  evalDoc += '## Summary\n\n';
  evalDoc += `| Model | Time | Cost | decomposable | Tr=trace |\n`;
  evalDoc += `|-------|------|------|:---:|:---:|\n`;
  for (const r of results) {
    if (r.error) { evalDoc += `| ${r.modelId} | ERROR | - | - | - |\n`; continue; }
    const pricing = PRICING[r.modelId] || { p: 0, c: 0 };
    const cost = (r.promptTokens * pricing.p + r.completionTokens * pricing.c) / 1e6;
    const decomp = (r.translations[7] || '');
    const decompOk = /分解/.test(decomp) ? '正確' : /可約/.test(decomp) ? '誤訳' : '?';
    const trace = (r.translations[12] || '');
    const traceOk = /トレース|跡/.test(trace) ? '正確' : /指標/.test(trace) ? '誤訳' : '?';
    evalDoc += `| ${r.modelId} | ${r.elapsedMs}ms | $${cost.toFixed(6)} | ${decompOk} | ${traceOk} |\n`;
  }

  writeFileSync(resolve(__dirname, 'benchmark-v2-results.md'), evalDoc);
  console.log('Results saved to eval/benchmark-v2-results.md');

  // Console summary
  console.log('\n' + '='.repeat(110));
  console.log(`${'Model'.padEnd(45)} ${'Time'.padStart(8)} ${'Cost'.padStart(12)} ${'decomp'.padStart(8)} ${'trace'.padStart(8)} ${'register'.padStart(10)}`);
  for (const r of results) {
    if (r.error) { console.log(`${r.modelId.padEnd(45)} ${'ERROR'.padStart(8)} ${r.error.slice(0,40)}`); continue; }
    const pricing = PRICING[r.modelId] || { p: 0, c: 0 };
    const cost = (r.promptTokens * pricing.p + r.completionTokens * pricing.c) / 1e6;
    const decomp = (r.translations[7] || '');
    const decompOk = /分解/.test(decomp) ? '✓' : /可約/.test(decomp) ? '✗' : '?';
    const trace = (r.translations[12] || '');
    const traceOk = /トレース|跡/.test(trace) ? '✓' : /指標/.test(trace) ? '✗' : '?';
    const regOk = (r.translations.slice(6).join('')).match(/です|ます/) ? 'ですます混' : 'である✓';
    console.log(`${r.modelId.padEnd(45)} ${(r.elapsedMs+'ms').padStart(8)} ${('$'+cost.toFixed(6)).padStart(12)} ${decompOk.padStart(8)} ${traceOk.padStart(8)} ${regOk.padStart(10)}`);
  }
}

main().catch(console.error);
