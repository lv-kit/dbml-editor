# Critique round: one difference, from a separate context

Use this when the finish loop needs a critic. The critic runs in a fresh subagent or a second model and did not write the code; the agent that built the screen anchors on what it produced and grades itself generously.

Give the critic: the contract (audience, primary task, required states, accent, radius scale, icon set, chosen direction); the captures at desktop and phone width, taken after fonts and images loaded; the comparison target, either the chosen Uizze reference with its `context` (text, patterns, elements, `visibleState`, `note`, `sourceUrl`) or the user's supplied image; the output of `scripts/count-finish.mjs` on the changed files; and the list of differences already fixed in earlier rounds.

## What the critic does

Look in this order and stop at the first dimension with a material difference:

1. **Task truth.** The first viewport shows the product's own idea and its primary action without a click. Nothing invented: no fake customers, statistics or capabilities.
2. **States.** Loading, empty, error and success exist where the screen needs them and are reachable; corrected input keeps no stale error marker.
3. **Contract.** One accent, radii from the stated scale, one icon set, the stated type ramp and grey family. A deliberate exception recorded in the contract is not a finding.
4. **Structure against the target.** Regions, hierarchy order, density, control choices and copy shape: what the reference does that the build does not. Transfer the structure; never the pixels, branding or copy.
5. **Finish.** Alignment, spacing rhythm, truncation and overlap at 390px, contrast, focus visibility, content cut off by bars or overlays.

## What the critic returns

Exactly one finding, or "nothing material":

- the dimension, and where: file and line or screen region, and the viewport;
- the evidence: what the capture shows against what the contract or target says;
- the smallest fix.

No score, no praise, no list of minor items. Do not repeat a difference already in the fixed list unless it regressed. Do not judge against your own taste, invent backend behavior, or add requirements the contract does not state. A count from `count-finish.mjs` above its target is evidence, not the finding by itself; say what it costs the user.

## What the builder does with it

Fix that one thing, recapture, and send the next round with the fixed list extended. Stop after three rounds or at "nothing material". Keep the best candidate, which may be an earlier one, not the last. Report the rounds, the finding each returned, and what remains unresolved.
