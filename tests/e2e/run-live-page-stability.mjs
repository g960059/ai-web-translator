import dotenv from 'dotenv';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { basename, resolve } from 'node:path';

dotenv.config();

const args = process.argv.slice(2);
const url = args[0];
const runs = parsePositiveInt(readFlagValue(args, '--runs') || '3');
const label = (readFlagValue(args, '--label') || 'stability').trim();

if (!url) {
  throw new Error(
    'Usage: node tests/e2e/run-live-page-stability.mjs <url> [--runs 3] [--label stability]',
  );
}

const outputDir = resolve(process.cwd(), 'test-results');
await mkdir(outputDir, { recursive: true });

const targetSlug = toFileSlug(url);
const metricsPaths = [];
const screenshotPaths = [];
const runsSummary = [];

for (let runIndex = 1; runIndex <= runs; runIndex += 1) {
  const outputSuffix = `${label}-run-${runIndex}`;
  console.log(`\n=== Live run ${runIndex}/${runs}: ${url} (${outputSuffix}) ===\n`);

  await runNodeProcess('tests/e2e/run-live-page-metrics.mjs', [url], {
    ...process.env,
    E2E_OUTPUT_SUFFIX: outputSuffix,
  });

  const metricsPath = resolve(outputDir, `${targetSlug}-${toFileSlug(outputSuffix)}-metrics.json`);
  const screenshotPath = resolve(
    outputDir,
    `${targetSlug}-${toFileSlug(outputSuffix)}-translated.png`,
  );
  const metrics = JSON.parse(await readFile(metricsPath, 'utf8'));

  metricsPaths.push(metricsPath);
  screenshotPaths.push(screenshotPath);
  runsSummary.push({
    run: runIndex,
    metricsPath,
    screenshotPath,
    startedAt: metrics.startedAt,
    generatedAt: metrics.generatedAt,
    requestCount: metrics.requestCount,
    firstVisibleMs: metrics.elapsedMs?.toFirstVisibleTranslation ?? null,
    fullCompletionMs: metrics.elapsedMs?.toFullCompletion ?? null,
    totalTokens: metrics.usage?.totalTokens ?? null,
    costUsd: metrics.costUsd ?? null,
    peakInFlightRequests: metrics.concurrency?.peakInFlightRequests ?? null,
    immediateBatch: metrics.immediateBatch ?? null,
    retryCounts: metrics.retryCounts ?? null,
    pageQuality: metrics.pageQuality?.after ?? null,
    qualitySignals: metrics.finalState?.metrics?.qualitySignals ?? null,
    warningStats: metrics.warningStats ?? metrics.finalState?.warnings ?? null,
    splitEventSamples: metrics.finalState?.metrics?.splitEventSamples ?? null,
  });
}

const firstVisibleValues = numberSeries(runsSummary.map((run) => run.firstVisibleMs));
const fullCompletionValues = numberSeries(runsSummary.map((run) => run.fullCompletionMs));
const requestValues = numberSeries(runsSummary.map((run) => run.requestCount));
const tokenValues = numberSeries(runsSummary.map((run) => run.totalTokens));
const costValues = numberSeries(runsSummary.map((run) => run.costUsd));
const concurrencyValues = numberSeries(runsSummary.map((run) => run.peakInFlightRequests));
const immediateLatencyValues = numberSeries(
  runsSummary.map((run) => run.immediateBatch?.providerLatencyMs ?? null),
);
const englishResidualRatioValues = numberSeries(
  runsSummary.map((run) => run.pageQuality?.englishResidualRatio ?? null),
);
const sourceFallbackValues = numberSeries(
  runsSummary.map((run) => run.qualitySignals?.sourceFallbackFragments ?? null),
);
const protectedFallbackValues = numberSeries(
  runsSummary.map((run) => run.qualitySignals?.protectedMarkerFallbackFragments ?? null),
);
const warningBlockValues = numberSeries(
  runsSummary.map((run) => run.warningStats?.totalBlocks ?? null),
);
const warningFallbackBlockValues = numberSeries(
  runsSummary.map((run) => run.warningStats?.fallbackSourceBlocks ?? null),
);
const warningErrorBlockValues = numberSeries(
  runsSummary.map((run) => run.warningStats?.errorBlocks ?? null),
);
const mathElementValues = numberSeries(
  runsSummary.map((run) => run.pageQuality?.mathElements ?? null),
);
const fallbackImageValues = numberSeries(
  runsSummary.map((run) => run.pageQuality?.fallbackImages ?? null),
);
const mediaImageValues = numberSeries(
  runsSummary.map((run) => run.pageQuality?.mediaImages ?? null),
);

const summary = {
  scenarioId: `${targetSlug}-${toFileSlug(label)}`,
  targetUrl: url,
  runs,
  label,
  modelId:
    runsSummary.find((run) => run.metricsPath)?.metricsPath
      ? JSON.parse(await readFile(metricsPaths[0], 'utf8')).modelId
      : null,
  aggregatedAt: new Date().toISOString(),
  metrics: {
    toFirstVisibleTranslationMs: buildStats(firstVisibleValues),
    toFullCompletionMs: buildStats(fullCompletionValues),
    requestCount: buildStats(requestValues),
    totalTokens: buildStats(tokenValues),
    costUsd: buildStats(costValues),
    peakInFlightRequests: buildStats(concurrencyValues),
    immediateProviderLatencyMs: buildStats(immediateLatencyValues),
    englishResidualRatio: buildStats(englishResidualRatioValues),
    sourceFallbackFragments: buildStats(sourceFallbackValues),
    protectedMarkerFallbackFragments: buildStats(protectedFallbackValues),
    warningBlocks: buildStats(warningBlockValues),
    warningFallbackBlocks: buildStats(warningFallbackBlockValues),
    warningErrorBlocks: buildStats(warningErrorBlockValues),
    mathElements: buildStats(mathElementValues),
    fallbackImages: buildStats(fallbackImageValues),
    mediaImages: buildStats(mediaImageValues),
  },
  runsSummary,
  artifacts: {
    metricsPaths,
    screenshotPaths,
  },
};

const summaryPath = resolve(outputDir, `${targetSlug}-${toFileSlug(label)}-summary.json`);
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`\nSummary written to ${summaryPath}`);
console.log(JSON.stringify(summary.metrics, null, 2));

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer, got: ${value}`);
  }
  return parsed;
}

function readFlagValue(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

function toFileSlug(value) {
  try {
    const url = new URL(value);
    const pathPart = basename(url.pathname) || 'page';
    return `${url.hostname}-${pathPart}`
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  } catch {
    return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  }
}

async function runNodeProcess(scriptPath, scriptArgs, env) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${basename(scriptPath)} exited with code ${code}`));
    });

    child.on('error', rejectPromise);
  });
}

function numberSeries(values) {
  return values.filter((value) => typeof value === 'number' && Number.isFinite(value));
}

function buildStats(values) {
  if (!values.length) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return {
    min: sorted[0],
    median: percentile(sorted, 0.5),
    max: sorted.at(-1),
    mean: Number((sum / sorted.length).toFixed(3)),
    spread: Number((sorted.at(-1) - sorted[0]).toFixed(3)),
    values: sorted,
  };
}

function percentile(sortedValues, ratio) {
  if (sortedValues.length === 1) {
    return sortedValues[0];
  }
  const position = (sortedValues.length - 1) * ratio;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lower = sortedValues[lowerIndex];
  const upper = sortedValues[upperIndex];
  if (lowerIndex === upperIndex) {
    return lower;
  }
  return Number((lower + (upper - lower) * (position - lowerIndex)).toFixed(3));
}
