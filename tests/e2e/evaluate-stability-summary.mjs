import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';

const args = process.argv.slice(2);

if (args.length < 2) {
  throw new Error(
    'Usage: node tests/e2e/evaluate-stability-summary.mjs <summary.json> <gate.json> [--out file.md]',
  );
}

const summaryPath = resolve(process.cwd(), args[0]);
const gatePath = resolve(process.cwd(), args[1]);
const outArgIndex = args.indexOf('--out');
const outputPath =
  outArgIndex >= 0 && args[outArgIndex + 1]
    ? resolve(process.cwd(), args[outArgIndex + 1])
    : resolve(
        process.cwd(),
        'docs/metrics/comparisons',
        `${stripExtension(basename(summaryPath))}-gate.md`,
      );

const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
const gate = JSON.parse(await readFile(gatePath, 'utf8'));

const checks = (gate.checks ?? []).map((check) => evaluateCheck(summary, check));
const overallPass = checks.every((check) => check.pass);

const markdown = [
  '# Stability Gate Evaluation',
  '',
  `Summary: \`${summaryPath}\``,
  `Gate: \`${gatePath}\``,
  '',
  'Scenario:',
  `- Gate ID: \`${gate.id ?? 'unknown'}\``,
  `- URL: \`${summary.targetUrl ?? 'unknown'}\``,
  `- Model: \`${summary.modelId ?? 'unknown'}\``,
  `- Runs: \`${summary.runs ?? 'unknown'}\``,
  '',
  `Overall result: **${overallPass ? 'pass' : 'fail'}**`,
  '',
  '| Check | Actual | Threshold | Result |',
  '| --- | --- | --- | --- |',
  ...checks.map(
    (check) =>
      `| ${check.label} | ${check.actualLabel} | ${check.thresholdLabel} | ${check.pass ? 'pass' : 'fail'} |`,
  ),
  '',
  `Generated at: ${new Date().toISOString()}`,
  '',
].join('\n');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${markdown}\n`, 'utf8');
console.log(outputPath);

function evaluateCheck(summaryPayload, check) {
  const actual = resolveMetric(summaryPayload, check.metric);
  const threshold = check.threshold;
  const operator = check.operator ?? '<=';
  const pass = compare(actual, threshold, operator);

  return {
    label: check.label ?? check.metric,
    actualLabel: formatValue(actual),
    thresholdLabel: `${operator} ${formatValue(threshold)}`,
    pass,
  };
}

function resolveMetric(summaryPayload, metricPath) {
  return metricPath.split('.').reduce((value, key) => value?.[key], summaryPayload.metrics);
}

function compare(actual, threshold, operator) {
  if (typeof actual !== 'number' || !Number.isFinite(actual)) {
    return false;
  }
  switch (operator) {
    case '<=':
      return actual <= threshold;
    case '<':
      return actual < threshold;
    case '>=':
      return actual >= threshold;
    case '>':
      return actual > threshold;
    case '==':
      return actual === threshold;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function formatValue(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'n/a';
  }
  return Number.isInteger(value) ? `${value}` : `${value.toFixed(3)}`;
}

function stripExtension(filename) {
  return filename.replace(/\.[^.]+$/, '');
}
