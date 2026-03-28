import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';

const DEFAULT_BASELINE = resolve(
  process.cwd(),
  'docs/metrics/baselines/representation-theory.json',
);
const DEFAULT_CANDIDATE = resolve(
  process.cwd(),
  'test-results/en-wikipedia-org-representation-theory-metrics.json',
);

const args = process.argv.slice(2);
const baselinePath = resolve(process.cwd(), args[0] || DEFAULT_BASELINE);
const candidatePath = resolve(process.cwd(), args[1] || DEFAULT_CANDIDATE);
const outArgIndex = args.indexOf('--out');
const outputPath =
  outArgIndex >= 0 && args[outArgIndex + 1]
    ? resolve(process.cwd(), args[outArgIndex + 1])
    : resolve(
        process.cwd(),
        'docs/metrics/comparisons',
        `${stripExtension(basename(candidatePath))}-vs-${stripExtension(basename(baselinePath))}.md`,
      );

const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
const candidate = JSON.parse(await readFile(candidatePath, 'utf8'));

const baselineCost = resolveCost(baseline);
const candidateCost = resolveCost(candidate);

const rows = [
  metricRow('Request count', baseline.requestCount, candidate.requestCount, true),
  metricRow(
    'Prompt tokens',
    baseline.usage?.promptTokens ?? 0,
    candidate.usage?.promptTokens ?? 0,
    true,
  ),
  metricRow(
    'Completion tokens',
    baseline.usage?.completionTokens ?? 0,
    candidate.usage?.completionTokens ?? 0,
    true,
  ),
  metricRow(
    'Total tokens',
    baseline.usage?.totalTokens ?? 0,
    candidate.usage?.totalTokens ?? 0,
    true,
  ),
  metricRow(
    'Time to first visible translation (ms)',
    baseline.elapsedMs?.toFirstVisibleTranslation ?? 0,
    candidate.elapsedMs?.toFirstVisibleTranslation ?? 0,
    true,
  ),
  metricRow(
    'Time to full completion (ms)',
    baseline.elapsedMs?.toFullCompletion ?? 0,
    candidate.elapsedMs?.toFullCompletion ?? 0,
    true,
  ),
  metricRow(
    'Peak in-flight requests',
    baseline.concurrency?.peakInFlightRequests ?? 0,
    candidate.concurrency?.peakInFlightRequests ?? 0,
    false,
  ),
  metricRow('Cost (USD)', baselineCost, candidateCost, true),
  ...buildOptionalRows(baseline, candidate),
];

const markdown = [
  '# Live Metrics Comparison',
  '',
  `Baseline: \`${baselinePath}\``,
  `Candidate: \`${candidatePath}\``,
  '',
  'Scenario:',
  `- URL: \`${candidate.targetUrl || baseline.targetUrl || 'unknown'}\``,
  `- Provider: \`${candidate.provider || baseline.provider || 'openrouter'}\``,
  `- Model: \`${candidate.modelId || baseline.modelId || 'unknown'}\``,
  `- Scope: \`${candidate.scope || candidate.finalState?.scope || baseline.scope || 'unknown'}\``,
  '',
  '| Metric | Baseline | Candidate | Delta | Delta % | Interpretation |',
  '| --- | ---: | ---: | ---: | ---: | --- |',
  ...rows.map(
    (row) =>
      `| ${row.label} | ${row.baseline} | ${row.candidate} | ${row.delta} | ${row.deltaPercent} | ${row.interpretation} |`,
  ),
  '',
  'Cost source:',
  `- Baseline: \`${baseline.costSource || 'metrics-json'}\``,
  `- Candidate: \`${candidate.costSource || 'metrics-json'}\``,
  '',
  `Generated at: ${new Date().toISOString()}`,
  '',
].join('\n');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${markdown}\n`, 'utf8');
console.log(outputPath);

function resolveCost(metrics) {
  if (typeof metrics.costUsd === 'number') {
    return metrics.costUsd;
  }
  return 0;
}

function metricRow(label, baselineValue, candidateValue, lowerIsBetter) {
  const delta = candidateValue - baselineValue;
  const deltaPercent =
    baselineValue === 0 ? 'n/a' : formatPercent((delta / baselineValue) * 100);

  return {
    label,
    baseline: formatValue(label, baselineValue),
    candidate: formatValue(label, candidateValue),
    delta: formatSignedValue(label, delta),
    deltaPercent,
    interpretation: interpretDelta(delta, lowerIsBetter),
  };
}

function interpretDelta(delta, lowerIsBetter) {
  if (delta === 0) {
    return 'no change';
  }

  if (!lowerIsBetter) {
    return delta > 0 ? 'higher' : 'lower';
  }

  return delta < 0 ? 'improved' : 'regressed';
}

function formatValue(label, value) {
  if (label.includes('Cost')) {
    return `$${value.toFixed(6)}`;
  }
  return Number.isInteger(value) ? `${value}` : `${value.toFixed(3)}`;
}

function formatSignedValue(label, value) {
  const formatted = formatValue(label, Math.abs(value));
  if (value === 0) {
    return formatted;
  }
  return value > 0 ? `+${formatted}` : `-${formatted}`;
}

function formatPercent(value) {
  const rounded = value.toFixed(2);
  return value > 0 ? `+${rounded}%` : `${rounded}%`;
}

function stripExtension(filename) {
  return filename.replace(/\.[^.]+$/, '');
}

function buildOptionalRows(baseline, candidate) {
  const optionalMetrics = [
    {
      label: 'Immediate phase complete (ms)',
      baseline: baseline.phaseTimings?.immediateCompletedMs,
      candidate: candidate.phaseTimings?.immediateCompletedMs,
      lowerIsBetter: true,
    },
    {
      label: 'Lazy-visible phase complete (ms)',
      baseline: baseline.phaseTimings?.lazyVisibleCompletedMs,
      candidate: candidate.phaseTimings?.lazyVisibleCompletedMs,
      lowerIsBetter: true,
    },
    {
      label: 'Retry count',
      baseline: baseline.retryCounts?.total,
      candidate: candidate.retryCounts?.total,
      lowerIsBetter: true,
    },
    {
      label: 'Batch splits',
      baseline: baseline.retryCounts?.batchSplits,
      candidate: candidate.retryCounts?.batchSplits,
      lowerIsBetter: true,
    },
    {
      label: 'Fragment splits',
      baseline: baseline.retryCounts?.fragmentSplits,
      candidate: candidate.retryCounts?.fragmentSplits,
      lowerIsBetter: true,
    },
    {
      label: 'Persistent cache hits',
      baseline: baseline.cacheStats?.persistentHits,
      candidate: candidate.cacheStats?.persistentHits,
      lowerIsBetter: false,
    },
    {
      label: 'Cache misses',
      baseline: baseline.cacheStats?.misses,
      candidate: candidate.cacheStats?.misses,
      lowerIsBetter: true,
    },
    {
      label: 'Immediate requests',
      baseline: baseline.requestCountsByPhase?.immediate,
      candidate: candidate.requestCountsByPhase?.immediate,
      lowerIsBetter: true,
    },
    {
      label: 'Lazy-visible requests',
      baseline: baseline.requestCountsByPhase?.lazyVisible,
      candidate: candidate.requestCountsByPhase?.lazyVisible,
      lowerIsBetter: true,
    },
    {
      label: 'Deferred requests',
      baseline: baseline.requestCountsByPhase?.deferred,
      candidate: candidate.requestCountsByPhase?.deferred,
      lowerIsBetter: true,
    },
  ];

  return optionalMetrics
    .filter((metric) => typeof metric.baseline === 'number' || typeof metric.candidate === 'number')
    .map((metric) =>
      metricRow(
        metric.label,
        metric.baseline ?? 0,
        metric.candidate ?? 0,
        metric.lowerIsBetter,
      ),
    );
}
