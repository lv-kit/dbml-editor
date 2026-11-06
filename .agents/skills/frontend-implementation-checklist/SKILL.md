---
name: frontend-implementation-checklist
description: Use this checklist when designing or implementing frontend UI to decide responsive sizing, typography, text overflow, interaction states, errors, empty states, and animation behavior.
---

# Frontend Implementation Checklist

Apply this checklist whenever designing or implementing frontend UI. Resolve each relevant item before implementation when it affects the design or behavior, then verify it in the finished UI. A checklist item that does not apply to the current UI can be marked not applicable. Do not leave relevant behavior undefined: ask for requirements when they cannot be determined from the brief or existing product behavior.

## 1. Viewport and sizing

- Check the layout at the smallest and largest supported viewport widths and ensure it remains usable without unintended clipping or overlap.
- Define which elements grow, shrink, wrap, scroll, or keep a fixed size. Apply those rules to each major layout region.

## 2. Typography

- Confirm the font's license permits the intended use before adding or bundling it.
- Account for font availability and rendering differences across supported operating systems. Provide suitable fallbacks and check that substitutions do not break the layout.

## 3. Text

- Identify meaningful maximum text lengths for user-entered or externally supplied content where the product defines them.
- Define behavior when content exceeds its display area, such as wrapping, truncation with an accessible way to read the full value, or scrolling. Check long words and localized text where relevant.

## 4. UI states and overlays

- Specify and implement hover, active, disabled, and keyboard-focus states for interactive buttons and controls.
- Check dialogs and other overlays at the smallest supported viewport so their content and actions remain reachable, including when scrolling is needed.
- Reserve space and define presentation for form validation messages so errors do not obscure fields or actions.

## 5. Errors and empty results

- Define how API failures are communicated at each relevant call site, including what the user can do next when recovery is possible.
- Define the zero-results or empty-data state for each relevant collection or data view.

## 6. Animation

- Identify where motion is used and describe the intended effect and purpose before implementing it.
- Respect reduced-motion preferences and ensure motion does not obscure content or delay essential interaction.

## Completion check

Before considering frontend work complete, review the relevant items against the rendered UI at supported viewport extremes and inspect the implemented control, loading, error, and empty states. Record or report unresolved requirements instead of silently choosing behavior that changes the product contract.
