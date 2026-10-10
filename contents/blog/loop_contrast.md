*Junran Wang · Notes from a probe of loop contrast (LoopCD) on Ouro-1.4B-Thinking.*

Loop contrast makes a looped language model worse at predicting human-written text, yet improves its answers to difficult math problems. At uncertain tokens, it also ranks the model's own correct reasoning traces above wrong ones, while temperature and a stronger weak copy do not. This is the signature of autoguidance: guide a model away from a weaker version of itself.

The token dynamics reject the rival account that LoopCD corrects an over-confident early loop. The contrast promotes candidates that later loops brought into play from near-zero probability. The overruled token also gains probability with depth. LoopCD amplifies alternatives discovered by extra computation rather than finishing an early correction.

## A weak copy inside the model

A looped language model repeatedly applies the same block of layers. Loop contrast, studied by [Apple (2610.02185)](https://arxiv.org/abs/2610.02185) and [Yu, So & Park (2609.24196)](https://arxiv.org/abs/2609.24196), contrasts the final loop with an earlier one:

$$z_{\mathrm{LoopCD}} = z_4 + w(z_4-z_1).$$

The first loop is the weak copy. The contrast rewards tokens whose relative support increased through the loops, which can improve generation without improving the model of text.

On AIME24, Ouro-1.4B-Thinking uses a 32k-token budget, temperature 1.0 and top-p 0.7. With $w=0.5$, accuracy rises from 53.8% to 58.6%. Across three seeds, the paired gain is +4.9 points, with a 95% bootstrap interval of [+1.7, +8.1].

## Worse on reference text, better at ranking its own traces

We first measure the negative log-likelihood of the next token in human-written text. Lower is better. On MATH-500 solutions, every tested positive contrast weight makes it worse, including at uncertain tokens with final-loop entropy $H>0.8$.

Across 300 solutions, NLL rises from 0.726 to 0.811 at $w=0.5$, and from 1.876 to 2.082 at uncertain tokens (Figure 1, left). On 300 WikiText paragraphs, negative log-likelihood likewise rises from 2.862 to 3.094 at $w=0.5$. The non-Thinking model also worsens on both datasets. The best tested temperature on the MATH references is 1.1, which slightly flattens the distribution. The loop contrast does not correct general underconfidence in the final loop.

We then rescore 720 unguided AIME traces using mean log-likelihood at uncertain positions. Within-problem AUC compares correct and wrong traces for the same problem; 21 of 30 problems have both outcomes.

![Left: reference-text NLL change versus contrast weight. Right: within-problem AUC of the model's own traces under each scoring.](static/assets/img/blog/loopcd_likelihood.png)

*Figure 1. Left: change in negative log-likelihood of human-written MATH-500 solutions as the contrast weight grows; the best weight is about zero. Right: within-problem AUC for ranking the model's own correct AIME traces above wrong ones, scored at uncertain tokens; the dashed line is chance. The interval on LoopCD w = 1 is the bootstrap interval of its gain over the plain model.*

The plain model scores 0.43, below chance. At $w=1$, the contrast raises this to 0.53, an improvement of +0.10 with interval [+0.01, +0.19]. Temperature and the stronger weak copy do not reproduce it. Fluent, repetitive wrong traces are a possible reason ordinary likelihood ranks them poorly.

This matches the autoguidance signature described by [Karras et al. (2024; 2406.02507)](https://arxiv.org/abs/2406.02507): worse density, better samples. A weaker version of the same model exaggerates shared deficiencies, so guidance suppresses them. Here reference likelihood deteriorates while generation and self-trace ranking improve.

## Later loops introduce the promoted candidates

We examine 3,899 changes of the top-ranked token at uncertain positions in 30 unguided traces, following the promoted and overruled choices through the loops.

![Mean probability across loops for tokens promoted and overruled by LoopCD.](static/assets/img/blog/loopcd_emergent.png)

*Figure 2. Mean probabilities at uncertain positions where LoopCD changes the top choice. The promoted candidate emerges after loop 1; the overruled candidate also ends above its initial probability.*

The promoted token's mean probability rises from 0.048 to 0.263. Most of that emergence happens between the first and second loops. In 64% of switches, the candidate meets the explicit emergence criterion: probability below 0.05 at loop 1 and above 0.1 at loop 4. For an equal-norm random direction, the corresponding share is 30%.

The overruled token also rises, from 0.340 to 0.426. It peaks at loop 2 and then eases, but later computation has not discarded it. LoopCD promotes the alternative because its relative growth was larger, not because the original choice collapsed.

The promoted token is usually a problem-specific word replacing generic scaffolding. The contrast moves away from tokens such as `\n`, `the`, `So`, `problem` and `wait`; examples include `Find → Check`, `But → We` and `the → sides`. “Created” means brought from near-zero probability into contention, not a token literally absent from the vocabulary.

This differs from Yu, So & Park's account of correcting early overconfidence. At these switches, the overruled token is not an early belief that subsequent loops steadily undo. The promoted candidate is the distinctive part of the depth change. Promoting depth-emerging tokens is also familiar from [DoLa (2309.03883)](https://arxiv.org/abs/2309.03883); here we measure both candidates across the loops where LoopCD actually switches.

## The contrast direction and the quality gap matter

Several generic substitutes could explain a generation gain: sharpening, perturbing fragile choices, or discouraging common scaffolding tokens. None reproduces the gain here.

![Accuracy changes and confidence intervals for LoopCD, restricted interventions and generic controls.](static/assets/img/blog/loopcd_controls.png)

*Figure 3. AIME24 accuracy change relative to the plain model, with paired per-problem bootstrap 95% intervals. Full LoopCD uses three seeds; most targeted interventions use one.*

The grey rows replace one part of LoopCD's formula $h_4 + w(h_4-h_1)$ and keep the rest:

| Row in Figure 3 | What changes |
|---|---|
| Temperature 0.8 | No contrast; the plain distribution is sharpened |
| Random direction, length of $h_4-h_1$ | A fresh random direction at every token replaces $h_4-h_1$; its length is $0.5\lVert h_4-h_1\rVert$ |
| $h_4-h_1$ with dimensions shifted | The true difference vector, with its coordinates cyclically shifted by 777 positions: same size at every token, wrong direction |
| Penalise 300 common tokens | No loops at all; at uncertain positions the logits of the 300 most common tokens are lowered by 1.5, so the top choice changes as often as under LoopCD |
| $h_4-h_3$ instead of $h_4-h_1$ | Loop 3 serves as the weak copy; $w=2$ makes the output shift as large as LoopCD's |

Lowering temperature to 0.8 falls 4.4 points below LoopCD. A random direction of the same length falls 6.9 points below it, and $h_4-h_1$ with its dimensions shifted falls 11.5 points below it. The random perturbation also reduces truncation without improving accuracy, separating the gain from simply helping traces finish.

Penalising the 300 most common tokens at uncertain positions is a more targeted substitute. Its switch rate is matched to LoopCD's, but it falls 6.5 points below LoopCD. Moving away from common scaffolding is insufficient: which alternative receives the probability matters.

A stronger weak copy provides another test. At the same weight, contrasting against loop 3 makes a much smaller change than contrasting against loop 1, and accuracy barely moves (+0.6 points over the plain model, not shown). We therefore raise the loop-3 contrast weight to 2. This gives a KL shift of 0.038, compared with 0.033 for the usual first-loop contrast. Even with comparable distribution movement, accuracy falls 10.7 points below LoopCD, with interval [−17.8, −3.8].

The quality gap must therefore be large enough. Extending the last refinement step cannot substitute for a substantially weaker copy.

The controls also address a critique from multimodal contrastive decoding. Studies [2607.25196](https://arxiv.org/abs/2607.25196) and [2504.10020](https://arxiv.org/abs/2504.10020) attribute gains in their settings to plausibility truncation rather than the contrast. Here there is no additional contrastive plausibility filter. Changing the direction removes the gain, so the contrast term itself does useful work.

## The opening window is enough

Applying LoopCD only in the opening roughly 2k tokens gives +4.6 points, with interval [+0.7, +8.2]. Its difference from full-trace LoopCD is −0.3 points, with interval [−3.6, +3.1]. The cutoff at absolute position 2048 covers roughly 1.9k generated tokens. Base traces average about 14.6k, so guidance during the opening seventh recovers the observed full gain.

The effect can therefore be set early in a long reasoning trace. This echoes the guidance-interval result of [Kynkäänniemi et al. (2024; 2404.07724)](https://arxiv.org/abs/2404.07724) in image diffusion and the front-loaded CFG gains reported by [Zhou et al. (2608.08082)](https://arxiv.org/abs/2608.08082) for masked diffusion language models.

Restricting LoopCD to uncertain tokens gives +6.7 points. Restricting its reordering to word tokens gives +7.1 points. Restricting it to number, operator and LaTeX tokens gives +2.1 points, which is not significant. The vocabulary interventions preserve each class's total probability mass, isolating choices within a class.

Uncertainty and word-level localization are not new discoveries here. Yu et al. already localize gains to difficult tokens and find weaker numeric-only gains. [Minimal Test-Time Intervention (2510.13940)](https://arxiv.org/abs/2510.13940) applies CFG selectively at high-entropy tokens. Our evidence connects this localization to worse reference likelihood, emergent candidates and matched controls in long autoregressive reasoning.

## What the evidence leaves open

We have not shown that an individual promoted token causes a better final answer. Single-switch rollouts on GSM8K gave a null result, and the corresponding MATH experiment was underpowered. The two token-selection definitions from this work and Yu et al. have not been compared on the same traces.

The clearest trace-ranking result uses $w=1$, while the generation result uses $w=0.5$; the ranking gain at $w=0.5$ is not significant. Multiple scoring rules, token subsets and trace filters were examined, so this is evidence for the account rather than a validated verifier. The ranking effect also disappears when scores use only the opening window, so it does not explain why early guidance suffices.

Worse reference likelihood is not universal. [APD (2411.01610)](https://arxiv.org/abs/2411.01610) reports improved answer-token perplexity on Pythia QA using candidate filtering, a plausibility filter and task-tuned temperature. We evaluate full reference text at fixed contrast weights without that filter.

The central generation claim remains limited to one model size and one benchmark. The remaining gap is causal: identifying which changed choices carry the improvement to the final answer.

## Why looped models are a useful testbed

Looped models carry their own weak copy for free: the first loop. That makes them a natural testbed for autoguidance in language models. Diffusion results suggest what to look for: the weak copy should be the same model, degraded along the axis that matters, by enough to expose shared errors. Uniform tricks such as temperature and noise fail here, as they do for images.
