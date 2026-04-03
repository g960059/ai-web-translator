/**
 * Quick translation benchmark: translate a sample batch with multiple models
 * and compare quality, speed, and cost.
 */
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.E2E_OPENROUTER_API_KEY;
if (!API_KEY) throw new Error('Missing E2E_OPENROUTER_API_KEY');

const MODELS = [
  'google/gemini-3.1-flash-lite-preview',  // current baseline
  'google/gemini-2.0-flash-lite-001',
  'google/gemini-2.5-flash-lite',
  'google/gemini-2.5-flash',
  'qwen/qwen3-235b-a22b-2507',
  'mistralai/mistral-small-3.1-24b-instruct',
  'deepseek/deepseek-v3.2',
  'meta-llama/llama-4-scout',
];

// Same system prompt as the extension
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

// Representative fragments from the Wikipedia article
const FRAGMENTS = [
  { t: "Representation theory", r: "heading" },
  { t: "Definitions and concepts", r: "heading" },
  { t: "Finite groups", r: "heading" },
  { t: "See also", r: "heading" },
  { t: "References", r: "heading" },
  { t: "Representation theory is a branch of mathematics that studies abstract algebraic structures by representing their elements as linear transformations of vector spaces." },
  { t: "The direct sum of two representations carries no more information about the group G than the two representations do individually. If a representation is the direct sum of two proper nontrivial subrepresentations, it is said to be decomposable. Otherwise, it is said to be indecomposable." },
  { t: "generalizes Fourier analysis via harmonic analysis," },
  { t: "In favorable circumstances, every finite-dimensional representation is a direct sum of irreducible representations: such representations are said to be semisimple. Examples include finite groups (see Maschke's theorem), compact groups, and semisimple Lie algebras." },
  { t: "A Lie algebra over a field F is a vector space over F equipped with a skew-symmetric bilinear operation called the Lie bracket, which satisfies the Jacobi identity. Lie algebras arise in particular as tangent spaces to Lie groups at the identity element." },
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
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        model: modelId,
        max_tokens: 4000,
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
    const finishReason = payload.choices?.[0]?.finish_reason;

    let translations = [];
    try {
      const parsed = JSON.parse(content.replace(/^```json\s*/, '').replace(/\s*```$/, ''));
      translations = parsed.translations || parsed;
    } catch {
      return { modelId, error: 'JSON parse failed', content: content?.slice(0, 200), elapsedMs };
    }

    return {
      modelId,
      elapsedMs,
      finishReason,
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      fragmentCount: translations.length,
      translations,
    };
  } catch (error) {
    return { modelId, error: error.message, elapsedMs: Date.now() - startMs };
  }
}

async function main() {
  console.log(`Benchmarking ${MODELS.length} models with ${FRAGMENTS.length} fragments...\n`);

  const results = await Promise.all(MODELS.map(benchmarkModel));

  console.log('='.repeat(100));
  console.log('MODEL BENCHMARK RESULTS');
  console.log('='.repeat(100));

  for (const r of results) {
    console.log(`\n--- ${r.modelId} ---`);
    if (r.error) {
      console.log(`  ERROR: ${r.error}`);
      continue;
    }
    console.log(`  Time: ${r.elapsedMs}ms | Tokens: ${r.promptTokens}p/${r.completionTokens}c | Fragments: ${r.fragmentCount}/${FRAGMENTS.length}`);

    // Show translations side by side
    for (let i = 0; i < FRAGMENTS.length; i++) {
      const src = FRAGMENTS[i].t.slice(0, 50);
      const tgt = (r.translations[i] || '[MISSING]').slice(0, 60);
      const role = FRAGMENTS[i].r ? ` [${FRAGMENTS[i].r}]` : '';
      console.log(`  ${i}: "${src}..."${role}`);
      console.log(`     → "${tgt}"`);
    }
  }

  // Summary table
  console.log('\n' + '='.repeat(100));
  console.log('SUMMARY');
  console.log('='.repeat(100));
  console.log(`${'Model'.padEnd(45)} ${'Time'.padStart(7)} ${'Tok(p/c)'.padStart(12)} ${'Frags'.padStart(6)} ${'decomp→?'.padStart(20)}`);

  for (const r of results) {
    if (r.error) {
      console.log(`${r.modelId.padEnd(45)} ${'ERROR'.padStart(7)}`);
      continue;
    }
    // Check decomposable/indecomposable translation
    const decomp = r.translations[6] || '';
    const hasDecomp = /分解/.test(decomp) ? '分解✓' : /可約/.test(decomp) ? '可約✗(誤訳)' : '?';
    console.log(`${r.modelId.padEnd(45)} ${(r.elapsedMs + 'ms').padStart(7)} ${(r.promptTokens + '/' + r.completionTokens).padStart(12)} ${(r.fragmentCount + '/' + FRAGMENTS.length).padStart(6)} ${hasDecomp.padStart(20)}`);
  }
}

main().catch(console.error);
