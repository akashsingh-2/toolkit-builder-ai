# Toolkit Builder — AI-native concept

A working prototype exploring how Diligent's Toolkit Builder could evolve with AI. Describe a workflow in plain language, and the AI drafts the toolkit, with its reasoning shown, per-capability confidence thresholds, and human-in-the-loop guardrails.

**Live demo:** https://akashsingh-2.github.io/toolkit-builder-ai/

## What to try
- Pick an example prompt, or describe your own workflow
- Review the "Why it's set up this way" reasoning panel
- Adjust confidence thresholds and guardrails
- Test scenarios: high-confidence actions run automatically, low-confidence ones are escalated to a human
- Browse the dashboard to see toolkits in progress, approved and sent back for changes

## Design principles
- **Reasoning shown, not hidden:** every AI decision comes with a plain-language explanation
- **User stays in control:** every field is editable, and follow-up commands refine the draft instead of replacing it
- **Friction scales with risk:** below the confidence threshold, a human approves, edits or escalates
- **Graceful fallback:** if the model can't be reached, a local draft is created and clearly labelled

## Notes
- Self-directed concept, not a Diligent product. Dashboard data is mock data.
- The hosted demo runs in offline draft mode; live drafting calls Claude when run in an environment with API access.
- `index.html` is the runnable prototype; `toolkit-builder-full.jsx` is the React source.

## About
Designed and built by Akash Singh, Staff Product Designer.
[Portfolio](https://akashsingh-2.github.io/portfolio/) · [LinkedIn](https://linkedin.com/in/akash02)
