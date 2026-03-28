# Real-Page Model Comparison: Representation Theory

Date:
2026-03-28 JST

Target URL:
`https://en.wikipedia.org/wiki/Representation_theory`

Goal:
- Compare the two best candidates from the small high-difficulty fixture shootout on a real, long Wikipedia page.
- Models compared:
  - `google/gemini-3.1-flash-lite-preview`
  - `mistralai/mistral-small-2603`

Execution:
- Provider: `openrouter`
- Scope: `page` (`translateFullPage: true`)
- Target language: `ja`
- Style: `auto`
- Cache: `false`
- Harness: [run-live-page-metrics.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/run-live-page-metrics.mjs)

## Raw Results

| Model | Started (UTC) | Status | Req | First visible | Full completion | Prompt | Completion | Total | Est. cost | Peak conc. | Metrics | Screenshot |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `google/gemini-3.1-flash-lite-preview` | `2026-03-28T07:16:58.110Z` | success | 82 | 98.974s | 270.160s | 76,082 | 74,580 | 150,662 | `$0.130891` | 3 | [json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-google-gemini-3-1-flash-lite-preview-metrics.json) | [png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-google-gemini-3-1-flash-lite-preview-translated.png) |
| `mistralai/mistral-small-2603` | `2026-03-28T07:21:39.670Z` | success | 163 | 117.977s | 388.863s | 129,765 | 128,071 | 257,836 | `$0.096307` | 3 | [json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-mistralai-mistral-small-2603-metrics.json) | [png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-mistralai-mistral-small-2603-translated.png) |

## Preservation Checks

| Model | Math elements | Fallback images | Media images | Verdict |
| --- | ---: | ---: | ---: | --- |
| `google/gemini-3.1-flash-lite-preview` before | 129 | 118 | 5 | baseline |
| `google/gemini-3.1-flash-lite-preview` after | 129 | 118 | 5 | exact preservation |
| `mistralai/mistral-small-2603` before | 129 | 118 | 5 | baseline |
| `mistralai/mistral-small-2603` after | 129 | 126 | 5 | fallback-image drift |

Interpretation:
- `Gemini 3.1 Flash Lite` preserved the page structure exactly on the coarse checks this harness tracks.
- `Mistral Small 4` finished successfully, but the fallback image count increased from `118` to `126`, which strongly suggests duplicated or structurally altered math/image wrappers somewhere in the page.

## Quality Review

Scoring rubric on the real page:
- Completion / stability: `15`
- Structure preservation: `25`
- Terminology consistency: `20`
- Japanese fluency: `20`
- Speed: `10`
- Cost: `10`

| Model | Stability | Structure | Terminology | Fluency | Speed | Cost | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `google/gemini-3.1-flash-lite-preview` | 15 | 25 | 18 | 18 | 10 | 5 | **91** |
| `mistralai/mistral-small-2603` | 15 | 17 | 12 | 10 | 4 | 10 | **68** |

### `google/gemini-3.1-flash-lite-preview`

Strengths:
- Best overall balance on the real page.
- Exact coarse preservation of math / fallback images / media images.
- Considerably fewer requests than Mistral: `82` vs `163`.
- Much lower token volume than Mistral: `150,662` vs `257,836`.
- Japanese reads naturally enough to use as a default reader experience.

Sample translated lead:
> 表現理論は、数学の一分野であり、抽象的な代数構造の元をベクトル空間の線形変換として表現することによって研究し...

Weak points:
- It is not the cheapest run.
- First visible translation is still slow at about `99s` for this long page, so the runtime pipeline still has room to improve independent of model choice.

### `mistralai/mistral-small-2603`

Strengths:
- Cheapest of the two runs.
- Completed successfully without crashing.

Weak points:
- Much slower:
  - first visible: `117.977s`
  - full completion: `388.863s`
- Request count nearly doubled.
- Token volume was much larger.
- Japanese quality degraded noticeably.
- Structural drift appeared in fallback image count.

Sample translated lead:
> 表現理論は、数学の一分野であり、抽象的な代数構造の要素を線形変換としてベクトル空間上に「表現」することでそれらを研究し、加群のような抽象代数構造の上で定義される加群について。

The sentence above is grammatically broken and ends mid-thought. That is not acceptable for a default “read the web” experience.

## Practical Recommendation

Recommended default for the extension:
- `google/gemini-3.1-flash-lite-preview`

Reason:
- On the small difficult fixture, it was the best overall model.
- On the real long Wikipedia page, it again won on:
  - quality
  - structural preservation
  - request count
  - total token volume
  - speed
- `Mistral Small 4` only won on direct estimated dollar cost, but lost too much on quality and runtime behavior.

When to use `mistralai/mistral-small-2603` anyway:
- Only if minimizing raw cost matters more than:
  - Japanese fluency
  - math/HTML preservation confidence
  - overall completion time

My blunt take:
- `Gemini 3.1 Flash Lite` is the sensible production default.
- `Mistral Small 4` is a budget fallback, not the main recommendation.

## Follow-up Metrics Worth Adding

- Activity-log verified cost for both runs, if an OpenRouter CSV is provided later.
- Per-phase timing:
  - immediate visible work
  - deferred lazy work
- Recovery counters:
  - invalid payload retries
  - fragment-count mismatch retries
  - output-limit shrink retries
