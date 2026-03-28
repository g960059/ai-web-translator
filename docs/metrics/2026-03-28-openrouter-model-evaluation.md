# OpenRouter Model Evaluation: Translation Fixture Shootout

Date:
2026-03-28 JST

Scenario:
- Fixture: [wikipedia-representation-theory.html](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/fixtures/wikipedia-representation-theory.html)
- Served locally via ephemeral `http://127.0.0.1:<port>/wikipedia-representation-theory.html`
- Content profile:
  - inline math
  - `\begin{cases}` and `\begin{pmatrix}` fallback images
  - a commutative-diagram image
  - Wikipedia-style links / bold / mixed inline HTML
- Harness: [run-live-fixture-model-eval.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/run-live-fixture-model-eval.mjs)
- Provider: `openrouter`
- Target language: `ja`
- Scope: `main`
- Style: `auto`
- Cache: `false`

Goal:
- Find the best practical OpenRouter model for this extension without using obviously expensive premium-tier models.
- Score not only time and cost, but also:
  - completion / stability
  - math / HTML / diagram preservation
  - terminology consistency
  - Japanese fluency

## Shortlist Logic

I used three inputs:
- Artificial Analysis pages to shortlist current low/mid-cost models with decent general capability and latency.
- OpenRouter model pages / model catalog for exact current OpenRouter IDs and pricing.
- Live translation runs inside this extension on the same high-difficulty fixture.

External references used for shortlisting:
- Artificial Analysis:
  - [Gemini 3.1 Flash-Lite Preview](https://artificialanalysis.ai/models/gemini-3-1-flash-lite-preview/)
  - [Gemini 3 Flash Preview](https://artificialanalysis.ai/models/gemini-3-flash)
  - [DeepSeek V3.1 (Non-reasoning)](https://artificialanalysis.ai/models/deepseek-v3-1)
  - [Qwen3.5 35B A3B (Non-reasoning)](https://artificialanalysis.ai/models/qwen3-5-35b-a3b-non-reasoning/)
- OpenRouter:
  - [Gemini 3.1 Flash Lite Preview](https://openrouter.ai/google/gemini-3.1-flash-lite-preview)
  - [Gemini 3 Flash Preview](https://openrouter.ai/google/gemini-3-flash-preview)
  - [DeepSeek V3.1](https://openrouter.ai/deepseek/deepseek-chat-v3.1)
  - [Qwen3.5-35B-A3B](https://openrouter.ai/qwen/qwen3.5-35b-a3b)
  - [Qwen3.5-Flash](https://openrouter.ai/qwen/qwen3.5-flash-02-23)
  - [Mistral Small 4](https://openrouter.ai/mistralai/mistral-small-2603)

Notes from those sources that materially influenced the shortlist:
- Artificial Analysis positions `Gemini 3.1 Flash-Lite Preview` and `Gemini 3 Flash Preview` as strong models in their price tiers.
- Artificial Analysis rates `Qwen3.5 35B A3B` highly on intelligence, but also calls out verbosity and relatively high price for its class.
- OpenRouter pricing made `Gemini 3.1 Flash Lite`, `DeepSeek V3.1`, and `Mistral Small 4` attractive practical candidates.
- I intentionally skipped premium models such as Pro / Max / Opus-class options because the user explicitly does not want translation built around expensive models.

## Scoring Rubric

Total score: `100`

- Completion / stability: `15`
- Structure preservation: `25`
  - math element count
  - fallback image count
  - commutative diagram image
  - key links
- Terminology consistency / technical accuracy: `20`
- Japanese fluency: `20`
- Speed: `10`
- Cost: `10`

Scoring notes:
- `Japanese fluency` is independent from raw correctness. A model can preserve formulas but still lose points for awkward Japanese.
- `Speed` and `Cost` are relative to the successful runs in this shootout, not a global benchmark.
- Models that did not complete reliably were not ranked as viable recommendations.

## Raw Results

| Model | Started (UTC) | Status | Req | First visible | Full completion | Prompt | Completion | Est. cost | Peak conc. | Raw files |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `google/gemini-3.1-flash-lite-preview` | `2026-03-28T06:55:26.366Z` | success | 2 | 6.706s | 6.708s | 1,726 | 1,655 | `$0.002914` | 2 | [json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/google-gemini-3-1-flash-lite-preview.json), [png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/google-gemini-3-1-flash-lite-preview-translated.png) |
| `mistralai/mistral-small-2603` | `2026-03-28T06:59:17.776Z` | success | 2 | 6.591s | 6.592s | 1,855 | 1,799 | `$0.001358` | 2 | [json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/mistralai-mistral-small-2603.json), [png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/mistralai-mistral-small-2603-translated.png) |
| `deepseek/deepseek-chat-v3.1` | `2026-03-28T06:56:06.639Z` | success | 2 | 20.901s | 20.903s | 1,928 | 1,951 | `$0.001752` | 2 | [json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/deepseek-deepseek-chat-v3-1.json), [png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/deepseek-deepseek-chat-v3-1-translated.png) |
| `google/gemini-3-flash-preview` | `2026-03-28T06:55:37.284Z` | success | 6 | 25.377s | 25.379s | 3,785 | 3,704 | `$0.013005` | 2 | [json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/google-gemini-3-flash-preview.json), [png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/google-gemini-3-flash-preview-translated.png) |
| `qwen/qwen3.5-35b-a3b` | `2026-03-28T06:57:39.556Z` | failure | 1 | n/a | n/a | n/a | n/a | n/a | 4 | [json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/qwen-qwen3-5-35b-a3b.json) |
| `qwen/qwen3.5-flash-02-23` | `2026-03-28T06:58:28.683Z` | failure | 0 | n/a | n/a | n/a | n/a | n/a | 4 | [json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/model-evals/qwen-qwen3-5-flash-02-23.json) |

## Quality Scores

| Model | Completion / Stability (15) | Structure / Math / Diagram (25) | Terminology (20) | Japanese Fluency (20) | Speed (10) | Cost (10) | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `google/gemini-3.1-flash-lite-preview` | 15 | 25 | 19 | 18 | 10 | 5 | **92** |
| `mistralai/mistral-small-2603` | 15 | 25 | 15 | 14 | 10 | 10 | **89** |
| `deepseek/deepseek-chat-v3.1` | 15 | 25 | 13 | 10 | 3 | 8 | **74** |
| `google/gemini-3-flash-preview` | 12 | 16 | 12 | 11 | 3 | 1 | **55** |
| `qwen/qwen3.5-35b-a3b` | 0 | 0 | 0 | 0 | 0 | 0 | **not ranked** |
| `qwen/qwen3.5-flash-02-23` | 0 | 0 | 0 | 0 | 0 | 0 | **not ranked** |

## Review Notes

### 1. `google/gemini-3.1-flash-lite-preview`

Verdict:
- Best overall.

Why:
- Preserved all math/image/link counts exactly.
- Japanese was the most natural among the successful models.
- Terminology was consistent:
  - `線形表現`
  - `群準同型`
  - `自己同型群`
  - `同変写像`
- Very fast on this fixture and still reasonably cheap.

Weak points:
- `G-linear` became `G線形`, which is acceptable but slightly rough.
- It was not the cheapest successful run.

### 2. `mistralai/mistral-small-2603`

Verdict:
- Best pure budget option.

Why:
- Cheapest successful run.
- Essentially tied for speed with Gemini 3.1 Flash Lite.
- Structure preservation was perfect.

Weak points:
- Japanese was less polished.
- It tends to sound more literal / slightly awkward:
  - `以下の V を K 線型空間とし`
  - `G に関する 同変写像`
- Technical meaning stayed mostly intact, but the prose felt less native.

### 3. `deepseek/deepseek-chat-v3.1`

Verdict:
- Good structure preservation, weaker prose.

Why:
- Preservation was perfect.
- Cost stayed low.

Weak points:
- Much slower than Gemini 3.1 Flash Lite and Mistral Small 4.
- Fluency was noticeably worse:
  - `Vを V とする。 K ベクトル空間`
- This is not a catastrophic failure, but it is below the bar I would want for a default reading experience.

### 4. `google/gemini-3-flash-preview`

Verdict:
- Not recommended anymore for this extension.

Why:
- It was by far the most expensive run here.
- It was also the slowest successful run.
- Structure drift occurred:
  - math element count changed from `17` to `18`
  - fallback image count changed from `17` to `18`
- Japanese was serviceable, but technical phrasing was sloppier than the cheaper Gemini 3.1 Flash Lite run.

Example problem:
- `G の線型表現とは、G から群準同型のことである。`
- This drops the target of the homomorphism and is less precise than the cheaper model.

### 5. Qwen candidates

Verdict:
- Not recommended for the current extension path.

Observed behavior:
- `qwen/qwen3.5-35b-a3b`
- `qwen/qwen3.5-flash-02-23`
- Both failed to start cleanly in this harness with:
  - `A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received`

Interpretation:
- I would not conclude from this alone that Qwen is a bad translation model in general.
- I would conclude that these models are not currently safe default picks for this extension until the startup/channel failure is understood and reproduced more narrowly.

## Recommendation

Recommended default:
- `google/gemini-3.1-flash-lite-preview`

Reason:
- It had the best overall balance of:
  - stability
  - structure preservation
  - terminology consistency
  - Japanese fluency
  - latency

Budget fallback:
- `mistralai/mistral-small-2603`

Reason:
- If absolute cost is the priority and slightly rougher Japanese is acceptable, Mistral Small 4 is the best cheap fallback from this run.

Models I would not choose now:
- `google/gemini-3-flash-preview`
- `deepseek/deepseek-chat-v3.1`
- `qwen/qwen3.5-35b-a3b`
- `qwen/qwen3.5-flash-02-23`

Why:
- `Gemini 3 Flash Preview`: too expensive and surprisingly weaker than the cheaper Gemini 3.1 Flash Lite on this fixture.
- `DeepSeek V3.1`: preserved structure, but the Japanese was too awkward for a default reader experience.
- `Qwen` runs: current extension/harness stability is not good enough.

## Caveats

- This is a small, deliberately difficult fixture, not a full-web benchmark.
- The scores are useful for this extension's translation path, especially:
  - HTML preservation
  - inline math preservation
  - diagram preservation
  - Japanese reading quality
- Cost here is harness-estimated from current OpenRouter pricing, not activity-log verified.
- For a final production switch, I would still rerun the top 2 models on:
  - this fixture
  - one long Wikipedia page
  - one non-Wikipedia article page
