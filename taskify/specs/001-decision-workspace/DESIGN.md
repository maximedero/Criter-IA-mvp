# Decision Framework — UI Design Contract

> Normative UI contract for the Decision Framework MVP.
> Visual language is inspired by the Dimension reference system, adapted to a decision workspace where evidence, uncertainty, AI assistance, human review, and decision readiness must remain explicit.

## 1. Purpose

This document is the normative visual and interaction contract for the Decision Framework MVP.

All UI implementation MUST comply with this document unless `spec.md` explicitly defines an approved exception.

The interface exists to improve decision quality, traceability, and reviewability. Visual novelty is secondary to clarity, consistency, accessibility, and auditability.

### 1.1 Scope

This contract applies to the MVP areas:

- Inbox
- Canvas
- Review
- Brief
- Approval

It covers:

- design tokens;
- typography;
- spacing and layout;
- surfaces and elevation;
- component appearance and behavior;
- semantic and interactive states;
- evidence and epistemic states;
- AI interaction states;
- accessibility;
- responsive behavior;
- motion;
- overlays and layering;
- page-level patterns;
- visual Definition of Done.

### 1.2 Non-goals

The MVP MUST NOT attempt to reproduce the Dimension marketing site.

The following reference patterns are OUT OF SCOPE unless promoted by `spec.md`:

- marketing hero with 72px headline;
- laptop/device mockup;
- marketing status banner;
- numbered marketing accordion;
- decorative multi-section landing page;
- floating marketing navigation copied verbatim from Dimension.

---

## 2. Normative language

The keywords in this document have the following meanings:

- **MUST**: mandatory requirement.
- **MUST NOT**: prohibited behavior.
- **SHOULD**: expected behavior; exceptions require a documented reason.
- **SHOULD NOT**: generally prohibited; exceptions require a documented reason.
- **MAY**: optional behavior.
- **REFERENCE**: non-normative visual inspiration.

Where prose conflicts with a normative MUST or MUST NOT rule, the normative rule wins.

Where `design.md` conflicts with an implementation convenience, `design.md` wins unless `spec.md` explicitly documents an exception.

---

## 3. Design principles

1. **Evidence before decoration.**
2. **State MUST always be visible.**
3. **AI assistance MUST be distinguishable from human approval.**
4. **Uncertainty MUST be visible, not hidden.**
5. **Equivalent actions MUST look and behave equivalently.**
6. **Semantic meaning MUST NOT depend on color alone.**
7. **Visual hierarchy SHOULD reduce cognitive load.**
8. **The interface SHOULD make the decision process easier to audit.**
9. **Generated does not mean Approved.**
10. **READY is a governed state, not a decoration.**
11. **The UI MUST remain predominantly achromatic.**
12. **New patterns SHOULD reuse existing tokens and components before introducing new ones.**

---

## 4. Foundations

### 4.1 Colors

| Name | Value | Token | Normative role |
|---|---:|---|---|
| Void Canvas | `#0a0a0a` | `--color-void-canvas` | Primary application background |
| Graphite | `#161616` | `--color-graphite` | Elevated panels, controls, modal bodies |
| Frosted Glass | `#d4d4d4` | `--color-frosted-glass` | Frosted overlays at 10% opacity |
| Ink Black | `#000000` | `--color-ink-black` | High-contrast text/icons on light surfaces |
| Snow White | `#ffffff` | `--color-snow-white` | Primary CTA fill, high-priority text, inverted surfaces |
| Bone | `#ededed` | `--color-bone` | Default body text on dark surfaces |
| Ash | `#c2c2c2` | `--color-ash` | Secondary text and helper copy |
| Slate | `#686868` | `--color-slate` | Tertiary metadata only when contrast remains compliant |
| Smoke | `#b2b2b2` | `--color-smoke` | Disabled/idle text |
| Hairline | `#e5e5e5` | `--color-hairline` | 1px control boundaries on dark surfaces |
| Dusk Violet | `#6b62f2` | `--color-dusk-violet` | Decorative gradient accent only |

#### Chromatic discipline

- Application surfaces MUST use the defined surface tokens.
- Body text on dark surfaces MUST default to `--color-bone`.
- Primary actions MUST use `--color-snow-white` with dark text.
- `--color-dusk-violet` MUST NOT be used as a solid CTA, text color, or general background.
- New brand colors MUST NOT be introduced.
- Semantic colors MAY be used only for state communication.
- Semantic colors MUST NOT be repurposed as decorative or brand colors.

### 4.2 Semantic colors

| State | Token | Base color | Overlay |
|---|---|---:|---:|
| Success | `--color-state-success` | `#22c55e` | 16% |
| Warning | `--color-state-warning` | `#f59e0b` | 16% |
| Error | `--color-state-error` | `#ef4444` | 16% |
| Information | `--color-state-info` | `#38bdf8` | 16% |

Semantic state styling MUST contain a textual label and SHOULD contain an icon. Color alone MUST NOT communicate meaning.

### 4.3 Typography

The MVP uses **DM Sans** as the primary application family.

Fallback stack:

```css
--font-primary: 'DM Sans', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

Geist MAY be retained for future editorial or marketing surfaces but MUST NOT be required for the core MVP.

| Role | Size | Weight | Line height | Token |
|---|---:|---:|---:|---|
| Caption | 13px | 400/500 | 1.5 | `--text-caption` |
| Metadata / compact label | 14px | 500 | 1.4 | `--text-meta` |
| Body | 16px | 400/500 | 1.5 | `--text-body` |
| Component title | 18px | 500 | 1.4 | `--text-component-title` |
| Section title | 24px | 500 | 1.33 | `--text-section-title` |
| Page title | 36px | 500 | 1.11 | `--text-page-title` |
| Display | 72px | 500 | 1.0 | `--text-display` |

Rules:

- Core workspace page titles MUST NOT exceed 36px on desktop.
- `--text-display` is reserved for optional marketing/onboarding surfaces and MUST NOT be used in the primary decision workspace.
- Application headings MUST NOT use weight 700+.
- Body text SHOULD use 400 or 500.
- Arbitrary font sizes SHOULD NOT be introduced.

### 4.4 Spacing

The MVP uses an intentionally reduced spacing scale:

| Token | Value |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |
| `--space-9` | 80px |

Rules:

- Component-internal gaps SHOULD be 8–16px.
- Card padding SHOULD be 24px or 32px depending on density.
- Major section gaps SHOULD be 48–80px.
- Arbitrary spacing values MUST NOT be introduced unless the exception is documented.

### 4.5 Radius

```css
--radius-icon: 4px;
--radius-control: 10px;
--radius-card: 24px;
--radius-large-card: 40px;
--radius-panel: 42px;
--radius-pill: 9999px;
```

Rules:

- Primary buttons, compact tags, and pills MUST use `--radius-pill`.
- Standard inputs and secondary rectangular controls MUST use `--radius-control`.
- Standard content cards SHOULD use `--radius-card`.
- Large decision panels MAY use `--radius-large-card` or `--radius-panel`.
- New radius values SHOULD NOT be introduced.

### 4.6 Surfaces

| Level | Token | Value | Purpose |
|---|---|---:|---|
| 0 | `--surface-canvas` | `#0a0a0a` | Page shell |
| 1 | `--surface-elevated` | `#161616` | Panels and controls |
| 2 | `--surface-frosted` | `rgba(212,212,212,0.10)` | Frosted grouped content |
| 3 | `--surface-inverted` | `#ffffff` | Primary CTA / exceptional inverted panel |

A frosted surface SHOULD use `backdrop-filter: blur(4px)` where supported and MUST degrade gracefully to a stable translucent fill.

### 4.7 Borders and elevation

```css
--border-hairline: 1px solid #e5e5e5;
--border-hairline-muted: 1px solid rgba(229,229,229,0.22);
--shadow-subtle: inset 0 0 0 1px rgba(255,255,255,0.10);
```

- Components MUST NOT use drop shadows as the primary elevation mechanism.
- Elevation MUST be expressed through surface contrast, translucency, and hairline borders.
- `--shadow-subtle` MAY be used as inset definition only.
- Heavy 2px+ decorative borders MUST NOT be used.

### 4.8 Gradient system

#### Dusk Violet Wash

```css
--gradient-dusk-violet: linear-gradient(
  90deg,
  rgba(0,0,0,0),
  rgba(0,0,0,0) 40%,
  rgba(107,98,242,0.565) 50%,
  rgba(0,0,0,0) 60%,
  rgba(0,0,0,0)
);
```

- Gradients MAY be used for a spotlight, onboarding/marketing surface, or narrow accent strip.
- Gradients MUST NOT be applied to normal buttons, cards, body text, inputs, status badges, evidence badges, or approval states.
- Multiple gradients MUST NOT be combined on the same element.
- A warm-to-cool hero gradient is REFERENCE-only for the MVP unless explicitly required by `spec.md`.

---

## 5. Interaction states

```css
--opacity-hover: 0.92;
--opacity-active: 0.84;
--opacity-disabled: 0.48;
--focus-ring-width: 2px;
--focus-ring-color: #ffffff;
--focus-ring-offset: 2px;
```

Every interactive component MUST define applicable states from:

- default;
- hover;
- active;
- focus-visible;
- disabled;
- loading;
- error where relevant;
- selected where relevant.

### 5.1 Focus

- Keyboard focus MUST be visible.
- Focus style MUST NOT rely on color change alone.
- Focus rings MUST remain visible against dark and light surfaces.

### 5.2 Disabled

- Disabled controls MUST use reduced opacity and block interaction.
- Disabled controls MUST remain legible.
- A disabled state SHOULD expose its reason contextually when the reason is not obvious.

### 5.3 Loading

- Loading state MUST preserve component dimensions where practical.
- Button loading MUST NOT shift label baseline or control width unexpectedly.
- Loading controls MUST prevent duplicate submission where applicable.

---

## 6. Core UI components

### 6.1 Primary Action Button

Purpose: primary action for the current decision step.

```text
background: #ffffff
text: #161616 or #000000
radius: 9999px
min-height: 44px
horizontal padding: 16–24px
font: DM Sans 14–16px / 500
```

Rules:

- A view SHOULD expose one visually dominant primary action per action group.
- The primary button MUST support hover, active, focus-visible, disabled, and loading.
- Dusk Violet MUST NOT be used as its fill.

### 6.2 Secondary / Ghost Button

```text
background: transparent
text: #ededed
border: 1px hairline-muted
radius: 10px or pill where semantic role is tag-like
min-height: 44px
```

Secondary actions MUST remain visibly subordinate to the primary action.

### 6.3 Destructive Button

- Destructive actions MUST be textually explicit.
- Error red MAY identify destructive intent but MUST NOT be the sole indicator.
- Irreversible destructive actions MUST require confirmation appropriate to the consequence.

### 6.4 Input / Select / Textarea

```text
surface: #161616
text: #ededed
border: hairline-muted
radius: 10px
minimum interactive height: 44px
```

States:

- default;
- hover;
- focus-visible;
- error;
- disabled.

Error state MUST include an explanatory message, not only a red border.

### 6.5 Tabs / Chips

- Default: dark surface and hairline boundary.
- Hover: subtle contrast/opacity change only.
- Selected: higher contrast without new decorative hues.
- Focus-visible: standard focus token.
- Selected state MUST be perceivable without relying only on color.

### 6.6 Card

Standard card:

```text
surface: graphite or frosted
radius: 24px
padding: 24–32px
shadow: none
border: optional hairline-muted
```

Card hierarchy MUST be established by typography, spacing, surface contrast, and semantic state rather than drop shadows.

### 6.7 Modal

- Modal MUST use `--z-modal`.
- Modal MUST trap focus while open.
- Closing MUST return focus to the triggering control where possible.
- Dismiss controls MUST be keyboard accessible.
- Critical confirmation modals MUST state consequence and action clearly.

### 6.8 Alert / Banner

- Alerts MUST use semantic tokens only for semantic meaning.
- Alert text MUST describe the state or required action.
- Alerts MUST NOT rely on color alone.
- Persistent blockers SHOULD remain visible until resolved.

### 6.9 Badge

Badges MUST communicate a named state. Decorative badges without informational value SHOULD NOT be added to core workflow views.

### 6.10 Icon Glyph

- 16–20px recommended size.
- Approximate stroke weight: 1.5px.
- Monochrome by default.
- Color MAY reflect a semantic state only when accompanied by a non-color cue.
- Icon-only interactive controls MUST expose an accessible name.

---

## 7. Decision Framework domain components

### 7.1 Decision Case Row

Used in Inbox.

MUST expose:

- case title;
- owner or ownership state where applicable;
- last-updated information;
- workflow/status label;
- unresolved blocker/warning signal when applicable;
- primary row action.

Supported workflow states SHOULD include:

- Draft;
- In Review;
- Blocked;
- Ready;
- Approved.

State MUST be communicated by text plus shape/icon/structure, not color alone.

### 7.2 Decision Dimension Card

Used in Canvas.

MUST expose:

- dimension name;
- completion state;
- editable content;
- evidence state where applicable;
- unresolved issue count where applicable.

Supported states:

- Empty;
- Partial;
- Complete;
- Warning;
- Blocked.

A Complete card MUST NOT imply that the underlying evidence has been human-approved.

### 7.3 Epistemic Selector

Purpose: classify the epistemic status of information contributing to a decision.

Canonical values:

- **Fact**
- **Inference**
- **Assumption**
- **Missing Evidence**

Every value MUST have:

- a textual label;
- a persistent visual marker;
- an accessible name;
- styling distinguishable without color alone.

Recommended symbols:

- `✓` Fact
- `≈` Inference
- `?` Assumption
- `○` Missing Evidence

The selector MUST remain visible or readily inspectable when the classified content contributes to a recommendation.

### 7.4 Evidence Indicator

Purpose: expose evidential status without forcing the user to infer confidence from prose.

Canonical display:

| State | Label | Suggested marker |
|---|---|---|
| Confirmed | Fact | `✓` |
| Derived | Inference | `≈` |
| Unverified | Assumption | `?` |
| Missing | Evidence needed | `○` |

Rules:

- AI-generated or inferred information MUST NOT be visually indistinguishable from user-confirmed facts.
- Evidence indicators SHOULD be compact but inspectable.
- Evidence source/details SHOULD be reachable from the indicator when available.

### 7.5 Coverage Panel

Purpose: summarize how complete the decision canvas is.

MUST show:

- required dimensions;
- completed dimensions;
- missing required input;
- blockers;
- warnings.

Coverage MUST NOT be represented by a single percentage if that percentage would hide blockers or missing critical evidence.

### 7.6 Finding Row

Used in Review.

MUST contain:

- finding title/summary;
- severity/type;
- affected dimension or brief section;
- explanation;
- available resolution action;
- resolved/unresolved state.

Finding types SHOULD include:

- Blocker;
- Warning;
- Information.

### 7.7 Decision Brief

The Brief MUST visually distinguish:

- factual input;
- inferred content;
- recommendations;
- unresolved assumptions;
- missing evidence;
- AI-generated content requiring review.

Editable and reviewed states MUST be distinguishable.

### 7.8 Approval Checklist

The Approval checklist MUST expose each gate independently.

A gate MUST NOT appear satisfied because unrelated gates are complete.

Each gate needs:

- label;
- status;
- explanation when blocked;
- resolution path when applicable.

### 7.9 Decision Readiness Panel

Purpose: state whether the decision is sufficiently complete and reviewed to proceed.

Canonical states:

#### NOT READY

Use when one or more blocking conditions exist.

Examples:

- required dimension incomplete;
- blocking finding unresolved;
- critical evidence missing;
- mandatory review not completed.

#### REVIEW REQUIRED

Use when there are no blockers but one or more review conditions remain.

Examples:

- unresolved warnings;
- AI-generated recommendation awaiting human review;
- assumption accepted provisionally but not reviewed.

#### READY

READY MUST require all MVP readiness gates defined by `spec.md`.

At minimum, READY SHOULD mean:

- required dimensions are complete;
- blocking findings are resolved;
- required human review is complete;
- no critical missing evidence remains.

**AI generation completing successfully MUST NOT be sufficient to produce READY.**

#### APPROVED

APPROVED MUST represent an explicit human or authorized workflow action separate from READY.

READY MUST NOT be styled or worded as if approval already occurred.

---

## 8. AI interaction states

AI-assisted UI MUST make machine participation visible when it materially affects decision content.

Canonical states:

- Idle
- Generating
- Generated
- Needs Review
- Accepted
- Rejected
- Failed

### 8.1 Rules

- Generated content MUST expose a visible AI-produced or AI-assisted indicator.
- AI-generated content MUST NOT visually mimic final human approval.
- `Generated` MUST NOT imply `Accepted`.
- `Accepted` MUST NOT imply `Approved` unless the workflow explicitly defines the accepting actor as the authorized approver.
- `Failed` MUST explain that generation failed and provide an appropriate retry or recovery path where possible.
- `Needs Review` SHOULD be a first-class visible state, not hidden in metadata.
- AI activity SHOULD NOT unexpectedly overwrite user-authored content.

### 8.2 AI provenance

Where technically available, AI-derived content SHOULD expose inspectable provenance such as:

- source material used;
- whether content was inferred;
- generation/revision event;
- human acceptance state.

The MVP MAY simplify provenance presentation, but MUST preserve the distinction between confirmed human input and AI-derived material.

---

## 9. Accessibility

Minimum target: WCAG AA for the MVP.

```css
--a11y-contrast-target: 4.5;
--a11y-target-min-size: 44px;
```

Requirements:

- Body text MUST target at least 4.5:1 contrast.
- Interactive targets MUST be at least 44px × 44px where practical.
- Keyboard focus MUST be visible.
- Core workflows MUST be operable by keyboard.
- State MUST NOT rely on color alone.
- Icon-only controls MUST have accessible labels.
- Inputs MUST have programmatic labels.
- Error messages SHOULD be associated with the affected field.
- Modal focus MUST be managed correctly.
- Reduced-motion preferences MUST be respected.

If `--color-slate` does not meet contrast requirements in a given context, a higher-contrast token MUST replace it.

---

## 10. Responsive behavior

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--page-max-width: 1200px;
```

### `< 768px`

- Core layout MUST collapse to one column.
- Interactive target size MUST remain at least 44px.
- Horizontal information density MUST reduce before font size becomes unreadable.
- Tables SHOULD transform to stacked/scrollable patterns without hiding essential decision state.
- Page titles SHOULD be 24–32px.

### `768px–1023px`

- Hybrid layout MAY be used.
- Primary decision content MUST retain readable line length.
- Side panels MAY collapse into drawers or stacked sections.

### `>= 1024px`

- Full workspace layout MAY be used.
- Content SHOULD remain inside a centered max-width shell unless a full-width workspace interaction requires otherwise.
- Major section spacing SHOULD stay within 64–80px for editorial areas and may be denser inside work surfaces.

---

## 11. Motion

```css
--motion-duration-fast: 120ms;
--motion-duration-base: 180ms;
--motion-duration-slow: 280ms;
--motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
--motion-ease-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);
```

Rules:

- Base UI transitions SHOULD use `--motion-duration-base`.
- Emphasized transitions MAY use `--motion-duration-slow`.
- Motion MUST NOT obscure state changes or delay access to critical information.
- Reduced-motion mode MUST disable non-essential animation.
- Loading animation MUST have a non-motion semantic equivalent, such as text or ARIA state.

---

## 12. Layers and overlays

```css
--z-base: 0;
--z-dropdown: 1000;
--z-banner: 1100;
--z-sticky: 1200;
--z-toast: 1300;
--z-modal: 1400;
--z-tooltip: 1500;
```

| Layer | Token | Use |
|---|---|---|
| Base | `--z-base` | Normal document flow |
| Dropdown | `--z-dropdown` | Menus / popovers |
| Banner | `--z-banner` | Global status |
| Sticky | `--z-sticky` | Persistent navigation/actions |
| Toast | `--z-toast` | Transient notifications |
| Modal | `--z-modal` | Dialog/overlay |
| Tooltip | `--z-tooltip` | Context help above modal content |

New z-index values MUST NOT be introduced ad hoc.

---

## 13. Application layout

- Default page background MUST be Void Canvas.
- Main content SHOULD use a centered shell up to 1200px where appropriate.
- Core workspaces MAY use the available viewport width when decision content benefits from it.
- Primary content SHOULD remain left-aligned.
- Dense card walls SHOULD be avoided.
- Single-column and two-column content + context layouts are preferred.
- Navigation MUST reflect the Decision Framework workflow rather than reproduce a marketing-site navigation pattern.

Recommended workflow navigation:

```text
Inbox → Canvas → Review → Brief → Approval
```

Navigation MUST expose the current location and SHOULD expose blocked/incomplete steps when helpful.

---

## 14. Page-level patterns

### 14.1 Inbox

Purpose: locate and resume decision cases.

MUST include:

- page title;
- case collection;
- visible case status;
- filters/search if required by `spec.md`;
- empty state;
- clear create/open primary action.

Empty state MUST explain the next useful action.

### 14.2 Canvas

Purpose: structure the decision and expose evidence quality.

MUST prioritize:

- Decision Dimension Cards;
- epistemic state;
- evidence indicators;
- coverage;
- unresolved blockers/warnings;
- editability.

AI assistance SHOULD remain subordinate to the decision structure rather than dominate the screen.

### 14.3 Review

Purpose: identify and resolve issues before brief/approval.

MUST prioritize:

- blockers first;
- warnings second;
- informational findings third;
- clear resolution actions;
- resolved/unresolved state.

Review MUST NOT visually imply that an AI finding is automatically correct.

### 14.4 Brief

Purpose: create a defensible executive representation of the decision.

MUST distinguish:

- confirmed facts;
- inference;
- assumptions;
- recommendations;
- unresolved evidence gaps;
- AI-assisted text requiring review.

The visual hierarchy SHOULD favor decision-relevant information over generation controls.

### 14.5 Approval

Purpose: make final governance state explicit.

MUST include:

- approval gates/checklist;
- readiness panel;
- unresolved conditions;
- explicit approval action;
- confirmation for consequential transitions.

READY and APPROVED MUST be separate states.

---

## 15. Empty, error, success and feedback states

### Empty

Every meaningful empty collection or workspace MUST tell the user:

1. what is empty;
2. why it matters when useful;
3. what action can be taken next.

### Error

Errors MUST:

- identify the failed action or affected content;
- provide recovery guidance when possible;
- persist long enough to be read;
- not rely solely on red coloring.

### Success

Success feedback SHOULD be brief and SHOULD NOT interrupt the next workflow step unnecessarily.

### Toasts

- Toasts MAY be used for transient confirmations.
- Blockers MUST NOT exist only in a disappearing toast.
- Critical errors SHOULD remain locally visible near the affected content.

---

## 16. Content and labeling rules

- Labels MUST describe actions or states clearly.
- Buttons SHOULD use verbs for actions.
- Destructive actions MUST be explicit.
- AI labels MUST avoid implying certainty where the system has generated or inferred content.
- `READY`, `APPROVED`, `FACT`, `INFERENCE`, `ASSUMPTION`, and `MISSING EVIDENCE` are governed semantic labels and MUST NOT be used decoratively.
- Status terminology SHOULD remain consistent across Inbox, Canvas, Review, Brief, and Approval.

---

## 17. MVP token → component matrix

| Area | Foundation tokens | Required key components |
|---|---|---|
| Inbox | surfaces, typography, spacing, workflow states | Decision Case Row, filters, row actions, empty state |
| Canvas | surfaces, radius, interaction, accessibility | Decision Dimension Card, editor, Epistemic Selector, Evidence Indicator, Coverage Panel |
| Review | semantic state, layers, motion | Finding Row, blocker/warning badges, resolution actions |
| Brief | typography, spacing, evidence/AI states | executive sections, expanded view, editing controls, review indication |
| Approval | semantic state, focus, layers | Approval Checklist, confirmation dialog, Decision Readiness Panel |

---

## 18. Definition of Done — UI

A UI task MUST NOT be considered complete until all applicable checks pass.

### Visual consistency

- [ ] Uses tokens defined in this document.
- [ ] Does not introduce arbitrary color, radius, type size, spacing, shadow, or z-index values without documentation.
- [ ] Equivalent components look and behave consistently.
- [ ] Uses the approved dark surface hierarchy.

### Interaction

- [ ] Default, hover, active, focus-visible, disabled, and loading states are implemented where applicable.
- [ ] Error and selected states are implemented where applicable.
- [ ] Loading does not cause avoidable layout shifts.

### Decision semantics

- [ ] Epistemic state is visible where required.
- [ ] Evidence gaps are distinguishable from assumptions and inferences.
- [ ] AI-generated content is distinguishable from human-confirmed content.
- [ ] Generated does not visually imply Approved.
- [ ] READY is only displayed when the readiness rules are satisfied.
- [ ] READY and APPROVED remain distinct.

### Accessibility

- [ ] Body text targets WCAG AA 4.5:1 contrast.
- [ ] Keyboard focus is visible.
- [ ] Essential workflow can be operated by keyboard.
- [ ] Interactive targets are at least 44px where practical.
- [ ] State does not depend on color alone.
- [ ] Inputs and icon-only controls have accessible names.
- [ ] Reduced motion is respected.

### Responsive

- [ ] Critical workflow remains usable below 768px.
- [ ] No essential state becomes unavailable on compact layouts.
- [ ] Tables/workspace structures have an intentional narrow-screen behavior.

### Evidence

- [ ] Component tests cover structural/role requirements where applicable.
- [ ] E2E tests cover key workflow states where applicable.
- [ ] Critical UI states have visual review evidence or snapshots if the project uses visual regression testing.

---

## 19. Governance

Any UI change MUST follow these rules:

1. If the visual norm changes, update `design.md`.
2. If product scope or behavior changes, update `spec.md`.
3. If implementation strategy changes materially, update `plan.md`.
4. If implementation work changes, update `tasks.md`.
5. If expected observable behavior changes, update the relevant tests.

A local implementation MUST NOT silently redefine a design-system rule.

Exceptions MUST be documented with:

- affected component/view;
- reason;
- duration or permanence;
- follow-up action if temporary.

---

# Appendix A — CSS custom properties

```css
:root {
  /* Colors */
  --color-void-canvas: #0a0a0a;
  --color-graphite: #161616;
  --color-frosted-glass: #d4d4d4;
  --color-ink-black: #000000;
  --color-snow-white: #ffffff;
  --color-bone: #ededed;
  --color-ash: #c2c2c2;
  --color-slate: #686868;
  --color-smoke: #b2b2b2;
  --color-hairline: #e5e5e5;
  --color-dusk-violet: #6b62f2;

  /* Semantic state */
  --color-state-success: #22c55e;
  --color-state-warning: #f59e0b;
  --color-state-error: #ef4444;
  --color-state-info: #38bdf8;

  /* Gradient */
  --gradient-dusk-violet: linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0) 40%, rgba(107,98,242,0.565) 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0));

  /* Typography */
  --font-primary: 'DM Sans', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --text-caption: 13px;
  --text-meta: 14px;
  --text-body: 16px;
  --text-component-title: 18px;
  --text-section-title: 24px;
  --text-page-title: 36px;
  --text-display: 72px;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 80px;

  /* Radius */
  --radius-icon: 4px;
  --radius-control: 10px;
  --radius-card: 24px;
  --radius-large-card: 40px;
  --radius-panel: 42px;
  --radius-pill: 9999px;

  /* Surfaces */
  --surface-canvas: #0a0a0a;
  --surface-elevated: #161616;
  --surface-frosted: rgba(212,212,212,0.10);
  --surface-inverted: #ffffff;

  /* Borders */
  --border-hairline: 1px solid #e5e5e5;
  --border-hairline-muted: 1px solid rgba(229,229,229,0.22);
  --shadow-subtle: inset 0 0 0 1px rgba(255,255,255,0.10);

  /* Layout */
  --page-max-width: 1200px;

  /* Interaction */
  --opacity-hover: 0.92;
  --opacity-active: 0.84;
  --opacity-disabled: 0.48;
  --focus-ring-width: 2px;
  --focus-ring-color: #ffffff;
  --focus-ring-offset: 2px;

  /* Accessibility */
  --a11y-contrast-target: 4.5;
  --a11y-target-min-size: 44px;

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;

  /* Motion */
  --motion-duration-fast: 120ms;
  --motion-duration-base: 180ms;
  --motion-duration-slow: 280ms;
  --motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --motion-ease-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);

  /* Layers */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-banner: 1100;
  --z-sticky: 1200;
  --z-toast: 1300;
  --z-modal: 1400;
  --z-tooltip: 1500;
}
```

---

# Appendix B — Tailwind v4 mapping

The implementation MAY map the canonical tokens into Tailwind v4. The canonical semantic meaning remains defined by this document, not by utility-class names.

```css
@theme {
  --color-void-canvas: #0a0a0a;
  --color-graphite: #161616;
  --color-ink-black: #000000;
  --color-snow-white: #ffffff;
  --color-bone: #ededed;
  --color-ash: #c2c2c2;
  --color-slate: #686868;
  --color-smoke: #b2b2b2;
  --color-hairline: #e5e5e5;
  --color-dusk-violet: #6b62f2;
  --color-state-success: #22c55e;
  --color-state-warning: #f59e0b;
  --color-state-error: #ef4444;
  --color-state-info: #38bdf8;

  --font-primary: 'DM Sans', Inter, ui-sans-serif, system-ui, sans-serif;

  --text-caption: 13px;
  --text-meta: 14px;
  --text-body: 16px;
  --text-component-title: 18px;
  --text-section-title: 24px;
  --text-page-title: 36px;

  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 24px;
  --spacing-6: 32px;
  --spacing-7: 48px;
  --spacing-8: 64px;
  --spacing-9: 80px;

  --radius-icon: 4px;
  --radius-control: 10px;
  --radius-card: 24px;
  --radius-large-card: 40px;
  --radius-panel: 42px;
  --radius-pill: 9999px;
}
```

---

# Appendix C — Visual inspiration, non-normative

The original visual reference is characterized by:

- dusk-lit dark canvas;
- restrained monochromatic palette;
- frosted surfaces;
- lightweight hairline borders;
- pill actions;
- medium-weight typography;
- generous editorial spacing;
- sparse chromatic accent;
- warm-to-cool hero treatment.

Comparable visual references include Linear, Vercel, Raycast, and Arc Browser.

These references are inspiration only. They MUST NOT override Decision Framework workflow, accessibility, evidence, AI-state, review, readiness, or approval requirements.
