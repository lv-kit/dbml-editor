---
name: cloudflare-clef
license: MIT
description: >-
  Design and implement bounded decision workflows with Cloudflare Workers AI
  Clef. Use when software needs typed, probability-bearing judgments such as
  routing, ranking, triage, extraction, or verification. Keep deterministic
  rules and actions in code, and use a general LLM when the task needs open-ended
  reasoning or text generation.
---

# Build with Cloudflare Clef

Clef is a decision model: give it application state and a schema of questions,
then use its bounded answers in ordinary code. It returns probabilities for
allowed answers instead of composing a free-form response. Use `clef` when
accuracy and richer context matter; use `clef-flash` when decision latency is
the priority, and evaluate both on representative inputs before choosing.

Keep the model's role narrow. Code should gather current facts, define allowed
choices, apply thresholds and policy, perform actions, and handle failures.
Use a general-purpose LLM for open-ended reasoning, explanations, or content
generation. A model probability is evidence for a decision, not authorization
to perform a consequential or irreversible action.

## Read the current documentation

Cloudflare's model page is the source of truth for supported inputs, outputs,
limits, and request syntax. Read it before writing an integration:

- [Clef model and API](https://developers.cloudflare.com/workers-ai/models/clef/)
- [Workers AI REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)
- [Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/)

The model accepts a `state` value and one or more typed questions. Current
question types include:

- `noul`: estimate whether a condition is true.
- `choice`: choose among named alternatives and return their probabilities.
- `score`: estimate a position among ordered levels.

Use the model page for exact schemas and response fields. Clef also supports
images; check the current model documentation for image input constraints.

## Shape the decision

Start from the behavior the application needs and work backward to a small set
of judgments. Include the relevant source text, identities, relationships,
policies, and current facts in `state`. Prefer named structured fields when the
input has multiple parts.

Write each question as one useful judgment. Make instructions specific, define
the possible outcomes clearly, and include a no-match option when none of the
candidates may fit. Split independently useful dimensions into separate
questions, but keep related evidence together. Independent questions over the
same state can be sent together.

Keep exact lookups, calculations, policy enforcement, and execution in code.
For high-impact decisions, route uncertain or low-probability results to a
human or a stronger reasoning step. Tune thresholds against labeled examples
from the target workload; demo scores and latency are not guarantees for a
particular application.

## Integrate safely

Use the supported Workers AI binding or REST API shown in the current docs.
Keep Cloudflare credentials server-side, pass only the state needed for the
decision, and handle service errors and malformed or unexpected responses.
Validate representative cases and the resulting application behavior before
using decisions in production workflows.
