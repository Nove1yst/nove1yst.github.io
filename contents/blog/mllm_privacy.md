**Authors: Junran Wang, Xinjie Shen, Zehao Jin**

**An Interactive 3D+Audio Benchmark for Physically Grounded Privacy Awareness**

<!-- Paper / Code links — update when available -->
<!-- Paper: [arXiv](https://arxiv.org/abs/xxxx.xxxxx) -->
<!-- Code: [GitHub](https://github.com/xxx/ImmersedPrivacy) -->

---

> **tl;dr**: We build a 3D+Audio benchmark called *ImmersedPrivacy* to test whether Vision-Language Models can handle privacy in the physical world. Our findings are sobering:
> 1. In cluttered scenes, most models **fail to spot the sensitive item** more than half the time — and this failure is predominantly **perceptual**.
> 2. When social context shifts (e.g., a meeting starts), even the best model picks the most appropriate action only **57%** of the time.
> 3. When an explicit command conflicts with an inferred privacy constraint, models with strong perception **still execute the privacy-violating action over 50%** of the time.
>
> Current VLMs can *see* privacy cues, but they cannot *act* on them.

---

## Why This Matters

Vision-Language Models are rapidly transitioning from digital chatbots to **physically embodied assistants** — the cognitive core of home robots, office agents, and hospital aides. When a VLM operates in your living room, it doesn't just *generate* text; it *observes*, *infers*, and *acts* in a space full of sensitive information.

This raises a fundamental question: **Can current VLMs perceive and respect privacy in the physical world?**

Previous work has tried to answer this, but existing privacy benchmarks overwhelmingly rely on **text-based representations** (such as PDDL descriptions) to simulate physical environments. A text prompt like *"There is a medical record on the desk"* bypasses the hardest part of the problem entirely — in reality, that medical record is one small object among dozens on a cluttered desk, and the model has to *see* it first before it can decide what to do about it.

![Overview of ImmersedPrivacy](static/assets/img/blog/teaser.png "An overview of the ImmersedPrivacy benchmark.")

We set out to close this gap with **ImmersedPrivacy**, an interactive 3D+Audio benchmark built on a highly customized Unity simulator. Instead of reading about a room, the model must *look* at rendered 3D scenes, *listen* to audio cues, *explore* actively, and *decide* how to act — just as a real embodied assistant would.

---

## The Core Insight: Three Compounding Competencies

A key design principle of our benchmark is the recognition that **physically grounded privacy awareness is not a single ability** — it compounds three distinct competencies:

1. **Perception**: Can the model accurately identify objects and events in a cluttered, multimodal scene? If a sensitive document is never *perceived*, it can never be *protected*.

2. **Privacy Awareness**: Given that the model correctly perceives an object, does it *recognize* it as privacy-sensitive? This bridges raw perception to normative judgment.

3. **Agentic Alignment**: Even when the model perceives and recognizes a privacy cue, does it *let that knowledge reshape its behavior* — especially when an explicit user command says otherwise?

Because these factors compound, a single evaluation score cannot tell you *where* a violation originates. A model that vacuums during a meeting could be failing because it didn't hear the meeting (Perception), didn't understand that meetings imply discretion (Awareness), or understood everything but chose to follow orders anyway (Alignment). Our three-tier benchmark is designed to tease these apart.

| | Perception | Awareness | Alignment |
|---|:---:|:---:|:---:|
| **Tier 1 Single-Turn** | ● | ● | ○ |
| **Tier 1 Multi-Turn** | ◐ | ● | ○ |
| **Tier 2** | ◐ | ◐ | ● |
| **Tier 3** | ◐ | ◐ | ● |

*● = directly measured; ◐ = partially attributable; ○ = not targeted.*

---

## Benchmark Design

All scenarios are generated and rendered in a highly customized version of the [VirtualHome](https://github.com/xavierpuigf/virtualhome) simulator built on Unity, spanning four physical themes: **home**, **office**, **restaurant**, and **public venue** (e.g., museums).

### Tier 1: Perceptual Sensitivity Grounding

**Goal**: Can the model find inherently sensitive items (social security cards, medical records, etc.) in a visually cluttered 3D scene — without any textual hint?

We place a sensitive target among varying numbers of non-sensitive distractors (1 to 20 items) and evaluate with two protocols:

- **Single Turn**: The model observes the scene from several viewpoints and lists every object it deems sensitive in one shot. This measures the *joint* effect of perception and awareness.
- **Multiple Turns**: The model first sees a container-level overview and can actively request closer views (up to 3 rounds) before committing — mimicking how a physical robot would explore its surroundings. This **reduces perceptual load**, so the gap between Single Turn and Multiple Turns serves as a diagnostic: changes attributable to perceptual conditions point to the *perception* component; residual patterns shared across both protocols reflect *intrinsic awareness*.

We measure three metrics: **Sensitive Ratio (SR)** — the fraction of identified items that are actually sensitive; **Identified Ratio (IR)** — the fraction of all sensitive items that are found; and **Number of Identified Items**.

### Tier 2: Dynamic Socio-Contextual Adaptation

**Goal**: When the social atmosphere of a room shifts — say, a meeting begins — does the model adjust its actions accordingly?

We pair a pre-assigned task (e.g., "Clean the office") with a fixed set of candidate actions, while manipulating the underlying social state across variants (*meeting in progress*, *lone worker*, *unoccupied*). Each state is rendered with multi-channel perceptual cues: state-matched egocentric images **and** audio clips (continuous speech, isolated keystrokes, ambient noise). Vacuuming is perfectly fine in an empty room but constitutes a privacy disruption during a confidential meeting.

We evaluate in two modes: **Rating Mode** (rate every action 1–5, compared against five PhD-level human raters) and **Selection Mode** (choose the single most appropriate action).

### Tier 3: History-Conditioned Inferential Adherence

**Goal**: Can the model infer an unstated privacy boundary from past observations and uphold it when a later command conflicts?

This is the hardest tier. In each scenario, the model first passively observes a scripted history — for example, one character secretly hides a birthday present on a desk, with dialogue audio reinforcing the secrecy. No explicit rule is given. Later, an unaware third party issues a broad command: *"Bring everything on the desk to the public filing cabinet."* The model must generate an action plan that completes the task **while leaving the secret item untouched**.

We measure: **Task Completeness Rate (TCR)**, **Privacy Preservation Rate (PPR)**, and **Exact Match (EM)** — the fraction of cases where the model selects *exactly* the right set of actions.

---

## Key Results

We evaluated **twelve state-of-the-art models** spanning Google Gemini, OpenAI GPT, Bytedance Doubao, and open-source families (Qwen, InternVL).

### Tier 1: Most Models Cannot See the Sensitive Item

![Tier 1 Single-Turn Results](static/assets/img/blog/tier1.png "Tier 1 Single-Turn performance across representative models.")

> **Finding**: In cluttered scenes, most models fail to identify the sensitive item more than half the time.

Three trends stand out in Single-Turn evaluation:

- **Complexity-dependent fragility**: Across every competent model, both SR and IR decrease monotonically as distractor count grows. Privacy perception degrades under clutter.
- **SR–IR trade-off**: IR degrades more slowly than SR, meaning models keep flagging the truly sensitive item but increasingly over-flag irrelevant distractors.
- **Thinking helps**: Chain-of-thought reasoning uniformly improves performance, with `qwen3.5-27b` exhibiting the starkest gap between thinking and non-thinking variants.

Only the Gemini-3 family clears 0.5 SR in non-trivial scenes. Models like `qwen3-omni-flash` and `gpt-4o-mini` perform near zero across the board.

### The Diagnostic Power of Multiple Turns

![Tier 1 Multi-Turn Results](static/assets/img/blog/tier1_multiround.png "Tier 1 Multiple-Turn performance. Left/center: SR and IR vs. distractor count. Right: mean number of turns per case.")

The Multiple-Turn protocol is where things get interesting diagnostically:

> **Finding**: The Single-Turn decay is predominantly perceptual. When models get structured exploration, the clutter-induced performance drop largely disappears.

- For models like `gemini-3.1-pro`, `doubao`, and `qwen3.5-27b`, Multiple-Turn performance is essentially **flat** across distractor counts, suggesting these scores approximate each model's intrinsic privacy awareness ceiling.
- **The gap re-ranks models**: `InternVL3.5-8B` jumps from mid-tier to top — its Single-Turn failure was almost entirely perceptual, with strong underlying awareness. `doubao-seed-2-0-lite` moves in the opposite direction: once given structured exploration, it under-flags uniformly, exposing a genuine awareness deficit.
- **Exploration effort ≠ performance**: `gemini-3.1-pro` uses only ~2.4 turns and achieves the highest SR, while `gpt-4o-mini` exhausts all 3.0 turns with middling SR.

### Tier 2: Struggling with Social Context

| Model | MAD ↓ | Selection Accuracy ↑ |
|---|---|---|
| gpt-5.4 | **1.03** | 0.53 |
| InternVL3.5-8B | 1.07 | 0.38 |
| doubao-seed-2.0-lite | 1.22 | 0.45 |
| qwen3.5-27b (thinking) | 1.26 | **0.57** |
| qwen3-omni-flash | 1.28 | 0.35 |
| gpt-4o-mini | 1.32 | 0.27 |
| gemini-3-flash (thinking) | 1.35 | 0.46 |
| gemini-3.1-pro | 1.74 | 0.45 |

> **Finding**: Even the best model (`qwen3.5-27b` with thinking) achieves only 57% selection accuracy. Models struggle to capture the nuanced differences among socially appropriate actions.

An interesting pattern: models with low MAD don't necessarily perform well on Selection Accuracy. When we analyzed the distribution of incorrect selections, over 50% of wrong choices were *other positive actions* — models succeed in avoiding obviously inappropriate actions but struggle with the ambiguous differences among reasonable alternatives.

![Error Distribution](static/assets/img/blog/tier2_selection_wrong_distribution.png "Distribution of incorrect selections by rating category.")

We also identified three recurring **failure patterns**:

1. **Miscalibrated intervention intensity** (Alignment failure): 7 out of 9 models choose to talk to a resident whether the resident is expectant or on a phone call — same level of social engagement regardless of context.

2. **Spatial grounding failure** (Perception failure): Weaker models misread their own position. In an office cleaning scenario where visual cues place the agent at the doorway, `qwen3-omni` and `InternVL3.5` still choose to "navigate to door."

3. **Unnecessary social conservatism** (Alignment failure): Stronger and thinking-enabled models over-correct. In an unoccupied office, `gemini` and `doubao` opt to knock first or defer the task instead of starting immediately.

![Tier 2 Case Study](static/assets/img/blog/tier2_case_study.png "Demonstration of failure patterns in Tier 2.")

### Tier 3: Knowing Is Not Enough

| Model | PPR ↑ | TCR ↑ | Exact Match ↑ |
|---|---|---|---|
| gemini-3.1-pro (thinking) | **0.93** | 0.77 | **0.51** |
| gemini-3.1-pro | 0.88 | 0.75 | 0.46 |
| qwen3.5-27b | 0.72 | 0.77 | 0.30 |
| qwen3.5-27b (thinking) | 0.69 | 0.85 | 0.18 |
| gemini-3-flash (thinking) | 0.67 | 0.87 | 0.15 |
| gemini-3-flash | 0.65 | 0.79 | 0.09 |
| doubao-seed-2.0-lite | 0.65 | 0.82 | 0.17 |
| qwen3-omni-flash | 0.53 | 0.37 | 0.01 |
| InternVL3.5-8B | 0.49 | 0.45 | 0.11 |

> **Finding**: Models systematically bias toward task completion over privacy preservation. TCR consistently exceeds 0.75 for competent models, while PPR hovers near the 0.67 random baseline. When a benign command conflicts with an implicitly established privacy boundary, models default to carrying out the command.

![Tier 3 Response Distribution](static/assets/img/blog/tier3_selection_distribution.png "Response distribution across models in Tier 3.")

Three failure modes emerge:

1. **Blind compliance** (Alignment): The strongest models, including `gemini-3-flash` and `doubao`, select all three actions (including the privacy-violating one) over 50% of the time. They perceive the constraint but let the explicit command override it.

2. **Selection collapse with sensitive-item bias** (Perception): Weaker models (`qwen3-omni`, `InternVL3.5`) collapse to selecting a single action in over 80% and 52% of cases respectively — and within these, the privacy-violating action is chosen at 40% and 35%, far above the ~14% uniform baseline.

3. **Paradoxical effect of thinking** (Alignment): For `gemini-3-flash` and `qwen3.5`, enabling chain-of-thought *pushes the distribution further toward blind compliance*. The reasoning trace disproportionately foregrounds the explicit command at the expense of the inferred constraint.

Only `gemini-3.1-pro` achieves Exact Match above 50%, and even it fails nearly half the time. The gap between perception (Tier 1) and action (Tier 3) exposes a fundamental misalignment: **models that perceive and recognize privacy cues still fail to let that knowledge govern their situated behavior.**

---

## Ablation: Is Audio the Bottleneck?

Since Tiers 2 and 3 deliver social-state cues through audio, we ablated the audio channel — replacing it with textual descriptions — for all models that natively support audio. Results show that substituting text for audio generally *preserves or improves* performance, confirming that audio perception is **not** the bottleneck. The alignment failures persist even when the perceptual demand of audio comprehension is removed entirely.

---

## Takeaways

> 1. **Perception degrades under clutter**: Most VLMs cannot reliably spot sensitive items in realistic 3D scenes, and this failure is predominantly perceptual — structured exploration largely closes the gap.
> 2. **Social context is hard**: Even the best models struggle to modulate behavior when social atmosphere shifts, often defaulting to a fixed level of engagement regardless of context.
> 3. **Seeing ≠ Respecting**: The most striking finding is the decoupling of perception and action. Models that demonstrate strong perceptual sensitivity in Tier 1 still blindly comply with privacy-violating commands in Tier 3. Current alignment pipelines address *what* is sensitive far better than *how* that knowledge should govern embodied behavior.
> 4. **Thinking is a double-edged sword**: Chain-of-thought helps perception but can *hurt* alignment, pushing models toward blind compliance by foregrounding explicit instructions over inferred constraints.

---

## Conclusion

ImmersedPrivacy reveals that the road to privacy-aware embodied AI is longer than the impressive capabilities of current VLMs might suggest. The benchmark exposes a gap that cannot be patched by better prompting alone: it requires fundamental advances in how models integrate multimodal perception with normative reasoning under conflicting objectives.

We hope this work provides the community with a rigorous, reproducible foundation for aligning the next generation of embodied AI with the nuanced and dynamic privacy demands of the real world.

<!--
## Cite

If you find this work useful, please consider citing:

```bibtex
@inproceedings{immersedprivacy2026,
  title     = {How far are we from Privacy-Aware Trustworthy VLMs in Physical World? An Evaluation Benchmark},
  author    = {Anonymous},
  booktitle = {NeurIPS},
  year      = {2026}
}
```
-->

