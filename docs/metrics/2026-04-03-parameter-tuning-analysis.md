# 2026-04-03: Parameter Tuning Analysis

## Scope

This note is based on:

- [2026-04-03-fullpage-model-benchmark.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-04-03-fullpage-model-benchmark.md)
- [openrouter.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/core/providers/openrouter.ts)
- [translation-controller.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/content/translation-controller.ts)

Important caveat: the 2026-04-03 benchmark itself was run with a separate eval harness (`eval/fullpage-model-benchmark.mjs`) that used fixed `BATCH_SIZE=15`, `max_tokens=4000`, `temperature=0.2`, and `REQUEST_TIMEOUT=120_000`. Production is different:

- OpenRouter timeout is fixed at `30s`
- temperature defaults to `0.2`
- `max_tokens` is estimated dynamically with `1.65x` headroom and capped at `16000`
- batching is adaptive
- invalid payloads trigger batch splitting
- warning repair already forces smaller batches and `concurrency=1`

So the benchmark is directionally useful, but some of its failure rates are partly harness-specific.

## What Production Already Does

The current pipeline is not purely one-size-fits-all:

- `openrouter.ts` already has dynamic `max_tokens` estimation and JSON recovery logic.
- `translation-controller.ts` already adapts batch size indirectly through `batchScale`.
- On failure, the controller reduces `maxConcurrency`, shrinks batch scale, and splits batches.
- On warning repair, it uses a much more conservative runtime state (`batchScale <= 0.75`, `maxConcurrency = 1`).

That matters because a lot of the easy tuning wins are already present as runtime adaptation.

## 1. Is Per-Model Tuning Worth It?

Short answer: not full per-model tuning, but a small per-model override table is worth it.

I would not build a large matrix of model-specific settings for every provider/model combination. The controller already does a meaningful amount of adaptive recovery, so a full bespoke tuning layer would add complexity faster than it adds quality.

I would add a very small model-profile layer for outliers only. The knobs with the best ROI are:

1. `maxConcurrencyCap`
2. `batchScaleMultiplier` or per-model batch token/item cap
3. `timeoutMs`

The knobs with lower ROI are:

1. `temperature`
2. `max_tokens` headroom

Reasoning:

- `batch size` and `concurrency` strongly affect malformed JSON, empty responses, latency spikes, and timeout probability.
- `timeout` matters for slow-but-good models, but only if you actually want to support them.
- `temperature` usually gives incremental gains for translation determinism, not order-of-magnitude reliability changes.
- `max_tokens` helps mainly when the real issue is truncation (`finish_reason=length`), not when the model returns the wrong schema or breaks placeholders.

Recommendation:

- Keep one global default path.
- Add a tiny override map for 2-3 outlier models at most.
- Do not expose or maintain per-model tuning for every knob unless a model is on the default or near-default path.

## 2. Gemma 4 31B: Can Marker Breakage Be Fixed by Tuning?

My view: mostly no. This looks like a model limitation for raw placeholder fidelity, not a parameter-tuning problem.

Why:

- The benchmark shows `0%` request failure but severe content-integrity failure.
- That means the model is not failing at transport or JSON generation. It is failing at exact token copying.
- The failure mode is specifically the hard part of this task: exact preservation of `[[x0]]`-style markers and math-adjacent notation.
- Lower temperature or smaller batches may reduce the frequency slightly, but they do not change the underlying capability.

Evidence from the saved benchmark artifacts is consistent with this:

- On `rep-theory-finite-groups`, Gemma leaked unresolved `[[...]]` markers in `104/430` blocks.
- The same run also showed many math/escape corruptions (`\rho`, `\text`, etc.).
- On `rep-theory`, the problem was smaller but still present.

The production pipeline is somewhat stronger than the benchmark harness because it sends fragment ids, roles, preceding context, and explicit marker lists (`m`). That could improve Gemma somewhat. But I would still treat this as a structural compatibility issue, not a tuning issue.

Conclusion:

- `temperature`: worth one quick check at `0.0`, but I do not expect a decisive fix.
- `batch size`: may lower the incidence a bit, but it will not make the model trustworthy.
- `prompt`: a stronger prompt may help a little, but prompt wording alone is unlikely to solve exact marker copying.

If you want to salvage Gemma, the likely path is not parameter tuning. It is a pipeline redesign for marker-heavy text, for example:

- translate smaller marker-delimited segments
- keep protected spans completely out of model-visible text when possible
- route marker-dense paragraphs away from Gemma

Operational recommendation:

- Do one conservative confirmation run with production-style payloads, `temperature=0`, and reduced batch scale.
- If marker exact-match is still not near-perfect, drop Gemma from marker-heavy routes.

## 3. Gemini 3.1 Flash Lite: How To Reduce the 14% JSON Parse Errors?

First, interpret the `14%` carefully.

In the saved benchmark artifact for `rep-theory-finite-groups`, Gemini had exactly `60` failed blocks out of `430`, and they were four contiguous failed batches:

- blocks `30-44`
- blocks `60-74`
- blocks `120-134`
- blocks `165-179`

That is strong evidence that the problem is batch-level, not uniformly random model behavior.

Also, production already has a much more forgiving JSON parser than the benchmark harness. The harness did a strict `JSON.parse(content)`, while production:

- unwraps Markdown fences
- extracts balanced JSON candidates
- accepts several payload shapes
- splits batches on invalid payloads

So before tuning parameters, first confirm how much of the `14%` survives in the real extension path.

### Most likely helpful changes

1. Smaller batch size for marker-heavy text
2. Lower concurrency cap for this model on difficult pages
3. Lower temperature to `0.0` or `0.1`

### Less likely to help

1. Increasing `max_tokens` blindly

Why:

- The failure appears on the more marker-dense page and in whole failed batches.
- That points to schema drift under complex batch composition, not just truncation.
- If the real issue is malformed JSON or wrong fragment count, `max_tokens` is not the main lever.

### Recommended Gemini tuning direction

- For production: reduce deferred text-batch aggressiveness for marker-heavy batches only.
- For the benchmark harness: test `BATCH_SIZE=8` and `BATCH_SIZE=10` before touching anything else.
- Set Gemini temperature to `0.0` or `0.1` for structured translation output.
- Only increase `max_tokens` if logs show `finish_reason=length`.

If you want one concrete first move, it is this:

- smaller marked-text batches
- temperature `0.0`
- concurrency cap `2` or `3`

I would try that before changing `max_tokens`.

## 4. Qwen 3.5 35B A3B: Retry or Drop?

My recommendation: one cheap salvage attempt, then drop quickly if it still fails.

Reasoning:

- The failure mode is severe: `~55%` timeout/empty response in the 2026-04-03 note.
- Separate earlier fixture evaluation already failed this model as well.
- This is not a narrow quality problem. It is a serviceability problem.
- Production currently has a `30s` timeout, so the production path will be worse than the benchmark harness, not better.

This is the kind of model where prompt or temperature tuning is very unlikely to matter. The only parameters worth trying are the transport/throughput ones:

- `concurrency = 1`
- much smaller batch size
- longer timeout (`180-240s`)

If it still shows timeout/empty-response behavior under those settings, drop it. Do not spend more time on it unless Qwen is strategically important.

## 5. Recommended Experiments, In Priority Order

## Experiment 1: Reproduce on the production path

Goal:

- Separate harness artifacts from true extension behavior.

Run:

- same two Wikipedia pages
- same models
- actual extension batching/retry path, not the fixed benchmark harness

Record:

- invalid payload count
- fragment-count mismatch count
- `finish_reason=length`
- timeout count
- empty-response count
- warning blocks
- marker exact-match rate

Why first:

- Otherwise you risk tuning around benchmark-only failures.

## Experiment 2: Gemini stability sweep

Goal:

- Reduce malformed-output / failed-batch rate without losing Gemini’s current speed advantage.

Suggested grid:

- temperature: `0.0`, `0.1`, `0.2`
- batch size or batch-scale: `1.0`, `0.75`, `0.6`
- concurrency cap: `2`, `3`, `5`

If using the benchmark harness directly:

- `BATCH_SIZE=15`, `10`, `8`
- keep `max_tokens=4000` constant first

Success criteria:

- failed-batch rate near zero
- minimal regression in elapsed time
- no material quality drop

Priority:

- highest, because Gemini is the current default path.

## Experiment 3: Gemma marker-fidelity gate

Goal:

- Determine whether Gemma is salvageable at all for marker-heavy content.

Suggested grid:

- temperature: `0.0`, `0.1`, `0.2`
- batch scale: `0.75`, `0.5`
- concurrency cap: `1`, `2`

Measure:

- exact marker preservation rate
- unresolved `[[...]]` leak count
- math/escape corruption count
- human quality score on prose

Decision rule:

- if marker exact-match is not effectively perfect, stop tuning and treat Gemma as unsupported for marker-heavy routes

Priority:

- second, because Gemma’s prose quality is high, but only valuable if structural fidelity can be made reliable

## Experiment 4: Qwen salvage / no-go

Goal:

- Confirm whether Qwen is recoverable with conservative transport settings.

Suggested settings:

- timeout: `180s`, then `240s`
- concurrency: `1`
- batch scale: `0.5`
- temperature: leave at `0.2` or `0.0`; it is not the main variable

Decision rule:

- if timeout + empty-response rate stays above `10%`, drop

Priority:

- low, because current evidence says the bottleneck is infrastructure/reliability, not translation quality

## Experiment 5: Minimal model-profile implementation

Only do this after Experiments 1-4.

If the results justify it, add a minimal profile layer with fields such as:

- `maxConcurrencyCap`
- `batchScaleMultiplier`
- `timeoutMs`
- optional `temperature`

This should be a small override map for proven outliers, not a general tuning framework.

## Final Recommendations

1. Do not build a full per-model tuning system.
2. Add a tiny outlier-only profile layer if Experiments 1-4 justify it.
3. Focus tuning effort on `batch size`, `concurrency`, and `timeout`, not on `temperature`.
4. Treat Gemma marker failure as a structural model limitation unless a conservative confirmation run proves otherwise.
5. Treat Gemini parse failures as mostly a batch-composition problem until proven otherwise.
6. Give Qwen one conservative salvage attempt, then drop it fast if it still times out or returns empty output.

## Bottom Line

- `gemini-3.1-flash-lite`: worth tuning, mainly via smaller marked-text batches and lower temperature
- `gemma-4-31b-it`: not worth much parameter tuning; likely needs routing or representation changes instead
- `qwen3.5-35b-a3b`: not worth sustained effort unless a single conservative retry changes the result dramatically
