# Atlas Sanctum — Moral Tradeoff Dashboard

> **Make the consequences of consequential decisions visible.**

The **Moral Tradeoff Dashboard** is a decision-intelligence interface for situations where no meaningful choice is purely positive or negative.

Build a dam.

It may increase electricity generation.

It may reduce energy insecurity.

It may create jobs.

It may alter river ecosystems.

It may displace communities.

It may change cultural landscapes.

It may create long-term benefits while imposing immediate costs.

Traditional dashboards tend to flatten this complexity into a handful of KPIs.

Atlas does something different.

It turns the decision into a **multi-dimensional impact surface**.

```text
                    DECISION
                       │
         ┌─────────────┼─────────────┐
         ↓             ↓             ↓
      ECONOMIC      HUMAN          ECOLOGICAL
         │             │             │
         ↓             ↓             ↓
      CULTURAL      SOCIAL        LONG-TERM
         │             │             │
         └─────────────┼─────────────┘
                       ↓
                MORAL LANDSCAPE
```

The dashboard does not decide which tradeoff humanity should accept.

It makes the tradeoff difficult to ignore.

---

# 01 — Product Purpose

The Moral Tradeoff Dashboard exists to help decision-makers answer:

```text
What do we gain?

What do we give up?

Who benefits?

Who bears the cost?

What changes across time?

Which consequences are reversible?

Which are difficult or impossible to reverse?

How certain are we?

What alternative paths exist?
```

The core principle is:

> **Atlas surfaces consequences. Humans retain responsibility for the decision.**

---

# 02 — Why This Dashboard Exists

Complex decisions rarely behave like simple optimization problems.

A conventional dashboard might present:

```text
Energy Output       +24%
Economic Value      +18%
Implementation Cost -12%
```

That representation is incomplete.

A morally consequential decision may simultaneously produce:

```text
Economic Gain        ↑
Energy Security      ↑
Employment           ↑
Ecosystem Integrity  ↓
Displacement         ↑
Cultural Continuity  ↓
Long-Term Risk       ?
```

There may be no single metric that legitimately collapses those dimensions into one answer.

The dashboard therefore preserves the multidimensional structure.

---

# 03 — Product Philosophy

The interface is built around six principles.

## Reveal, Don't Conceal

Positive outcomes should never erase negative consequences.

## Separate Facts From Judgments

Observed outcomes, modeled effects, assumptions, and value judgments should remain distinguishable.

## Show Distribution

A benefit at national scale can coexist with a serious cost concentrated in one community.

## Show Time

Short-term gains may produce long-term costs, and vice versa.

## Make Uncertainty Visible

An uncertain consequence should look uncertain.

## Preserve Human Agency

Atlas should inform a decision without declaring which moral choice is correct.

---

# 04 — Core Experience

The dashboard takes a proposed intervention and constructs a **Decision Surface**.

Example:

```text
DECISION
Build River Valley Dam
```

The system then maps consequences across multiple domains:

```text
Economic
Environmental
Human Wellbeing
Community
Cultural
Infrastructure
Energy Security
Climate Resilience
Long-Term Risk
```

---

# 05 — Dashboard Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│ DECISION HEADER                                             │
│ Proposal · Geography · Time Horizon · Status               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                 IMPACT SURFACE                              │
│                                                              │
│         Economic   Human   Ecology   Culture   Risk         │
│                                                              │
├──────────────────────────┬───────────────────────────────────┤
│ WHO BENEFITS?            │ WHO BEARS COSTS?                  │
├──────────────────────────┼───────────────────────────────────┤
│ TIME HORIZON             │ REVERSIBILITY                     │
├──────────────────────────┴───────────────────────────────────┤
│ ALTERNATIVE PATHWAYS                                        │
├──────────────────────────────────────────────────────────────┤
│ EVIDENCE · ASSUMPTIONS · UNCERTAINTY                        │
├──────────────────────────────────────────────────────────────┤
│ DECISION RECORD / HUMAN REVIEW                              │
└──────────────────────────────────────────────────────────────┘
```

The visual rhythm should move from:

> **What is the choice? → What changes? → Who experiences it? → How certain are we? → What alternatives exist?**

---

# 06 — Decision Header

## `DecisionHeader`

The top of the interface establishes context.

Example:

```text
┌─────────────────────────────────────────────────────────────┐
│ RIVER VALLEY DAM                                           │
│ Proposed hydropower + water infrastructure project         │
│                                                             │
│ Region       Rift Valley                                   │
│ Horizon      30 years                                      │
│ Status       Under Review                                  │
│                                                             │
│ [ Compare Alternatives ] [ View Evidence ] [ Scenario ]    │
└─────────────────────────────────────────────────────────────┘
```

Important metadata:

* decision name
* decision category
* geography
* decision-maker
* time horizon
* current stage
* last updated
* evidence version
* scenario version

---

# 07 — Multi-Dimensional Impact Surface

## `ImpactSurface`

This is the centerpiece.

Possible visualization formats:

* radar / spider chart
* parallel coordinates
* multidimensional matrix
* radial surface
* coordinated small multiples
* tradeoff scatterplot

The dashboard should not force every decision into one visualization.

It should choose the representation that best reveals the structure of the tradeoff.

### Example dimensions

```text
Economic Value
Energy Security
Environmental Integrity
Human Wellbeing
Community Stability
Cultural Continuity
Climate Resilience
Infrastructure Capacity
Long-Term Risk
```

---

# 08 — Impact Vector

Each decision can expose a directional impact vector.

```text
ECONOMIC VALUE
████████████████░░ +16

ENERGY SECURITY
██████████████████ +22

HUMAN WELLBEING
███████████░░░░░░ +6

ECOSYSTEM INTEGRITY
█████░░░░░░░░░░░ -19

COMMUNITY STABILITY
████████░░░░░░░░ -8

CULTURAL CONTINUITY
██████░░░░░░░░░░ -13
```

The positive/negative direction is descriptive of modeled change relative to a baseline.

It should not be presented as a moral verdict.

---

# 09 — Impact Matrix

## `TradeoffMatrix`

For users who prefer structured analysis:

| Dimension                 | Baseline | Projected | Change | Confidence | Evidence          |
| ------------------------- | -------: | --------: | -----: | ---------: | ----------------- |
| Energy Generation         |        0 |   4.2 TWh |   +4.2 |       High | Grid model        |
| Household Income          |      100 |       108 |    +8% |     Medium | Economic model    |
| River Ecosystem Integrity |      100 |        76 |   -24% |     Medium | Ecological model  |
| Local Displacement        |        0 |     3,200 | +3,200 |       High | Census + planning |
| Cultural Site Exposure    |        0 |  12 sites |    +12 |     Medium | Heritage survey   |

The table ensures that the visualization never becomes a substitute for the underlying evidence.

---

# 10 — Distribution of Benefits & Costs

A critical feature is to show **who experiences the consequences**.

## `DistributionPanel`

Example:

```text
BENEFITS

National Grid
██████████████████

Urban Consumers
██████████████

Industrial Users
████████████

Project Workforce
██████


COST EXPOSURE

Displaced Households
████████████████

Downstream Ecosystems
██████████████

Cultural Sites
████████

Local Agriculture
██████████
```

The interface should distinguish:

```text
Beneficiary
Affected Group
Indirectly Affected
Uncertain
```

This prevents aggregate gains from hiding concentrated costs.

---

# 11 — Who Benefits / Who Bears the Cost

## `StakeholderImpactMap`

Users can inspect impacts by stakeholder group:

```text
Government
Communities
Households
Businesses
Farmers
Workers
Future Generations
Ecosystems
```

Selecting a group opens:

```text
Expected Benefit
Expected Cost
Time Horizon
Confidence
Mitigation Options
Evidence
```

---

# 12 — Temporal Tradeoff Analysis

## `TemporalImpactChart`

Many ethical tradeoffs are temporal.

Example:

```text
Impact
 ^
 |     Economic Gain
 |       ╭──────────────
 |    ╭──╯
 |  ╭─╯
 | ╭╯
 |╱
 └──────────────────────────→ Time

Ecosystem Cost
      ╲
       ╲
        ╲───────
```

Users can switch between:

```text
1Y
5Y
10Y
30Y
50Y
Intergenerational
```

A decision that looks attractive over two years may look materially different over thirty.

The UI should make that visible.

---

# 13 — Reversibility

Not all consequences are equally reversible.

## `ReversibilityPanel`

Each major consequence can be classified:

```text
REVERSIBLE
Recoverable with reasonable intervention.

DIFFICULT TO REVERSE
Requires major cost or long recovery.

IRREVERSIBLE / NEAR-IRREVERSIBLE
Loss cannot realistically be restored within the decision horizon.
```

Example:

```text
Infrastructure investment
→ Reversible / Adjustable

Household relocation
→ Difficult to reverse

Species habitat loss
→ Potentially difficult or impossible to reverse

Cultural heritage site destruction
→ Irreversible
```

The dashboard should show the evidence underlying these classifications.

---

# 14 — Uncertainty Layer

## `UncertaintyPanel`

Each modeled consequence needs uncertainty context.

Example:

```text
ENERGY OUTPUT
4.2 TWh
Confidence: High

ECOSYSTEM LOSS
-24%
Confidence: Moderate

EMPLOYMENT EFFECT
+8,000
Confidence: Low

CULTURAL IMPACT
12 sites exposed
Confidence: Moderate
```

Use visual distinctions between:

```text
Observed
Modeled
Forecast
Scenario
Expert Assessment
Community Report
```

---

# 15 — Evidence Drawer

## `EvidenceDrawer`

For every consequential claim, users should be able to inspect:

```text
Source
Method
Dataset
Timestamp
Model
Assumptions
Geographic Scope
Limitations
Reviewer
```

Example:

```text
ECOSYSTEM IMPACT

Source:
Watershed ecological model

Inputs:
River flow
Sediment transport
Fish habitat
Seasonality

Model:
Ecology Simulation v1.8

Confidence:
Moderate

Limitation:
Long-term species response is uncertain.
```

---

# 16 — Ethical Assumptions

The dashboard should explicitly separate **empirical assumptions** from **normative assumptions**.

Example:

```text
EMPIRICAL

"Flood risk is expected to decrease by 31%."

NORMATIVE / VALUE CHOICE

"Reduced flood exposure should be prioritized over
preservation of the current land-use pattern."
```

This distinction is crucial.

A model can estimate consequences.

It should not disguise a value judgment as scientific fact.

---

# 17 — Alternative Pathways

## `AlternativeScenarios`

The user should never see only one proposed future.

Example:

```text
OPTION A
Build Dam

OPTION B
Distributed Solar + Storage

OPTION C
Grid Efficiency + Small Hydro

OPTION D
No-Build / Conservation Strategy
```

Each alternative receives the same analytical treatment.

```text
Energy
Cost
Environment
Community
Culture
Resilience
Implementation
Uncertainty
```

This supports comparison without selecting a winner for the user.

---

# 18 — Scenario Comparison

```text
┌───────────────┬────────┬────────┬────────┬────────┐
│ Dimension     │ Dam    │ Solar  │ Hydro  │ No-Build│
├───────────────┼────────┼────────┼────────┼────────┤
│ Energy        │ High   │ Medium │ Medium │ Low     │
│ Cost          │ High   │ Medium │ Medium │ Low     │
│ Ecology       │ -      │ +      │ Mixed  │ +++     │
│ Jobs          │ +      │ ++     │ +      │ +       │
│ Displacement  │ High   │ Low    │ Low    │ None    │
│ Resilience    │ Mixed  │ High   │ Medium │ Mixed   │
└───────────────┴────────┴────────┴────────┴────────┘
```

The table should avoid a single aggregate "winner" unless the user explicitly chooses a weighting framework.

---

# 19 — Preference / Weighting Model

Different decision-makers may legitimately assign different importance to dimensions.

Rather than hiding this, Atlas can allow users to define transparent priorities.

```text
Economic Value          20%
Environmental Integrity 25%
Human Wellbeing         25%
Energy Security         15%
Cultural Continuity     10%
Fiscal Cost              5%
```

The system can then show:

> **How the comparison changes under these stated priorities.**

It should not label the resulting ranking as objectively correct.

---

# 20 — Weight Sensitivity

## `SensitivityExplorer`

Users can adjust weights and observe how conclusions change.

```text
ENVIRONMENT
───────●────────
       25%

ECONOMY
────●───────────
    20%

COMMUNITY
──────●────────
      25%
```

The interface can show:

```text
"Comparison is sensitive to environmental weighting."

"At >35% environmental weighting, Alternative C
becomes materially more attractive relative to the baseline."

```

This exposes the role of values in the decision.

---

# 21 — Moral Landscape View

## `MoralLandscape`

A higher-level visualization can position alternatives across multiple dimensions.

Example:

```text
                         HUMAN BENEFIT
                              ↑
                              │
                   B          │        A
                              │
──────────────────────────────┼────────────────→
                              │
                  C           │        D
                              │
                              ↓
                         ECOLOGICAL COST
```

The intent is not to call one quadrant "good" and another "bad."

The visual exposes the structure of the decision space.

---

# 22 — Tradeoff Tension

The UI can identify major tensions.

```text
TRADEOFF TENSIONS

Energy Security
        ↕
Ecosystem Integrity

Infrastructure Expansion
        ↕
Community Continuity

Short-Term Growth
        ↕
Long-Term Resilience
```

Selecting a tension opens evidence and scenario details.

---

# 23 — Mitigation Layer

## `MitigationPanel`

Tradeoffs should not stop at:

> "Benefit X comes with cost Y."

The platform can explore mitigation strategies.

Example:

```text
IDENTIFIED COST
3,200 households displaced

MITIGATION OPTIONS

A — Resettlement + Livelihood Compensation
B — Redesign reservoir boundary
C — Phased construction
D — Alternative project site
```

Each mitigation option can be evaluated against:

```text
Cost
Impact Reduction
Implementation Time
Residual Risk
Confidence
```

---

# 24 — Ethical Decision Record

## `DecisionRecord`

Once analysis is complete, the interface can produce a structured record.

```text
Decision
Project: River Valley Dam

Key Benefits
- Increased energy generation
- Improved regional grid stability

Key Costs
- Household displacement
- Ecosystem alteration
- Cultural-site exposure

Major Uncertainties
- Long-term ecological recovery
- Regional demand growth

Mitigations Considered
- Resettlement program
- Habitat restoration
- Alternative reservoir boundary

Decision Status
Under Human Review
```

The record preserves the reasoning context without pretending that ethics has been solved numerically.

---

# 25 — Human Review

## `HumanReviewPanel`

Authorized reviewers can add:

```text
Comment
Evidence
Concern
Mitigation
Decision Rationale
```

Possible states:

```text
UNDER REVIEW
COMMUNITY REVIEW
TECHNICAL REVIEW
ETHICS REVIEW
DECISION RECORDED
```

A final decision should preserve the human rationale alongside the model outputs.

---

# 26 — Community Perspective

## `CommunityVoice`

A consequential decision may contain knowledge unavailable in centralized datasets.

The dashboard can include structured community inputs:

```text
Local Knowledge
Cultural Sites
Livelihood Dependency
Perceived Risks
Community Priorities
Mitigation Preferences
```

Community evidence should remain identifiable as community evidence rather than being silently converted into scientific certainty.

---

# 27 — Counterfactual Analysis

## `CounterfactualPanel`

A key question:

> **What would need to change for the tradeoff to look materially different?**

Example:

```text
CURRENT
Dam construction

COUNTERFACTUAL
If distributed solar reaches 60% target:
→ energy gap narrows
→ dam benefit decreases

If resettlement quality improves:
→ social disruption decreases

If fish habitat restoration succeeds:
→ ecological impact improves
```

Counterfactuals are powerful because they move the conversation from:

> "Which side is right?"

to:

> **"Which conditions could change the consequences?"**

---

# 28 — Decision Provenance

Every dashboard conclusion should retain its lineage.

```text
QUESTION
   ↓
SCENARIO
   ↓
DATA
   ↓
MODEL
   ↓
ASSUMPTIONS
   ↓
IMPACT ESTIMATES
   ↓
UNCERTAINTY
   ↓
HUMAN REVIEW
   ↓
DECISION
```

This allows future auditors to reconstruct how the decision was understood at the time.

---

# 29 — Core Components

Suggested component architecture:

```text
src/
├── components/
│   ├── decision/
│   │   ├── DecisionHeader
│   │   ├── ImpactSurface
│   │   ├── TradeoffMatrix
│   │   └── DecisionRecord
│   │
│   ├── stakeholders/
│   │   ├── DistributionPanel
│   │   └── StakeholderImpactMap
│   │
│   ├── scenarios/
│   │   ├── AlternativeScenarios
│   │   ├── ScenarioComparison
│   │   └── CounterfactualPanel
│   │
│   ├── evidence/
│   │   ├── EvidenceDrawer
│   │   ├── AssumptionPanel
│   │   └── UncertaintyPanel
│   │
│   ├── ethics/
│   │   ├── ReversibilityPanel
│   │   ├── TradeoffTension
│   │   ├── PreferenceWeights
│   │   └── SensitivityExplorer
│   │
│   ├── community/
│   │   └── CommunityVoice
│   │
│   └── governance/
│       ├── HumanReviewPanel
│       └── AuditTimeline
```

---

# 30 — Domain Model

```ts
export interface DecisionScenario {
  id: string;
  title: string;
  description: string;

  geography: string;

  horizonYears: number;

  status:
    | "draft"
    | "under_review"
    | "community_review"
    | "technical_review"
    | "decision_recorded";
}
```

---

# 31 — Impact Dimension

```ts
export interface ImpactDimension {
  id: string;

  name:
    | "economic"
    | "environmental"
    | "human"
    | "community"
    | "cultural"
    | "infrastructure"
    | "resilience"
    | "security";

  baseline: number;
  projected: number;
  change: number;

  confidence: number;

  evidenceIds: string[];

  reversibility:
    | "reversible"
    | "difficult_to_reverse"
    | "near_irreversible";
}
```

---

# 32 — Stakeholder Impact

```ts
export interface StakeholderImpact {
  stakeholderId: string;

  expectedBenefit?: number;
  expectedCost?: number;

  affectedPopulation?: number;

  confidence: number;

  evidenceIds: string[];
}
```

---

# 33 — Alternative Model

```ts
export interface AlternativeScenario {
  id: string;
  name: string;

  impacts: ImpactDimension[];

  implementationCost: number;
  implementationYears: number;

  majorRisks: string[];
  mitigations: string[];

  confidence: number;
}
```

---

# 34 — Weighting Model

```ts
export interface ValueWeights {
  economic: number;
  environmental: number;
  human: number;
  community: number;
  cultural: number;
  infrastructure: number;
  resilience: number;
}
```

The UI should show the weights explicitly.

A computed aggregate is a reflection of the user's chosen criteria—not an objective moral truth.

---

# 35 — Evidence Model

```ts
export interface EvidenceRecord {
  id: string;

  source: string;
  sourceType:
    | "sensor"
    | "satellite"
    | "survey"
    | "administrative"
    | "research"
    | "community";

  collectedAt: string;

  methodology?: string;

  limitations: string[];

  confidence: number;
}
```

---

# 36 — Technical Stack

Recommended:

```text
React
TypeScript
Next.js / Vite
Tailwind CSS
TanStack Query
Zustand
ECharts / Recharts
MapLibre
Framer Motion
Zod
Storybook
```

The visualization layer should remain replaceable.

The data model should not depend on a specific charting library.

---

# 37 — Visualization Strategy

### Use radar charts for

Comparing multidimensional profiles at a glance.

### Use parallel coordinates for

Exploring many dimensions across several alternatives.

### Use matrices for

Detailed evidence-oriented comparison.

### Use scatter plots for

Exploring tradeoffs between two dimensions.

### Use timelines for

Short-term vs long-term effects.

### Use maps for

Distributional and geographic consequences.

### Use Sankey diagrams for

Flows of benefits, costs, and resources.

Avoid forcing every ethical question into a radar chart.

---

# 38 — Dark Institutional Visual Language

The dashboard should feel:

* calm
* sober
* analytical
* consequential
* human

Suggested foundation:

```text
Deep Midnight
Slate
Soft White
Muted Cyan
Emerald
Amber
Red
```

Use colors semantically, not decoratively.

A negative modeled impact should not automatically be styled as moral "badness."

Use language such as:

```text
Projected Decline
Projected Gain
Material Exposure
Uncertain
High Confidence
```

instead of:

```text
GOOD
BAD
```

---

# 39 — Interaction Design

The interface should encourage exploration.

Example interaction:

```text
CLICK:
Ecosystem Integrity

        ↓

OPEN:
Ecological Impact Drawer

        ↓

SHOW:
Baseline
Projected State
Evidence
Uncertainty
Affected Areas

        ↓

COMPARE:
Alternative B

        ↓

TEST:
Mitigation Scenario
```

The user should be able to move between abstraction levels without losing the decision context.

---

# 40 — Accessibility

High-stakes analytical interfaces should support:

* keyboard navigation
* screen readers
* chart text alternatives
* non-color statuses
* reduced motion
* readable contrast
* responsive layouts

Every chart should have a text or table equivalent.

---

# 41 — Performance

Complex scenarios may contain many dimensions and stakeholders.

Use:

```text
Lazy-loaded charts
Memoized selectors
Virtualized tables
Incremental rendering
Code splitting
Chart downsampling
```

Do not calculate every scenario variant on the client if the scenario engine is intended to become computationally expensive.

---

# 42 — Auditability

The decision surface must be reproducible.

Store:

```text
Scenario Version
Data Version
Model Version
Weights
Assumptions
Evidence
Human Comments
Review Events
Final Decision
```

A future user should be able to answer:

> **"Why did Atlas show this tradeoff six months ago?"**

---

# 43 — MVP Scope

A focused MVP should ship:

```text
✓ Decision Header
✓ Impact Surface
✓ Tradeoff Matrix
✓ Stakeholder Distribution
✓ Alternative Scenarios
✓ Uncertainty
✓ Evidence Drawer
✓ Reversibility
✓ Weighting Controls
✓ Human Review
✓ Decision Record
```

The map, community input, and advanced simulation layers can follow.

---

# 44 — Example MVP Journey

A policy team opens:

```text
RIVER VALLEY DAM
```

The dashboard immediately shows:

```text
Economic Value       ↑
Energy Security      ↑
Ecosystem Integrity  ↓
Displacement         ↑
Cultural Exposure    ↑
Long-Term Risk       ?
```

The team then asks:

```text
Who benefits?
Who bears the cost?
Which impacts are reversible?
Which assumptions matter?
What alternatives exist?
What mitigations are available?
```

They compare:

```text
Dam
Solar + Storage
Small Hydro
No-Build / Conservation
```

They inspect evidence.

They adjust explicit weighting assumptions.

They examine counterfactuals.

Then they record the human decision and rationale.

That is the product loop.

---

# 45 — What This Dashboard Is Not

It is not:

```text
A moral scoring machine
An AI judge
An automated policy-maker
A "good vs bad" calculator
A replacement for public deliberation
A substitute for affected communities
```

It is:

```text
A decision landscape
An evidence interface
A tradeoff explorer
A scenario instrument
A governance record
```

---

# 46 — The Philosophical Core

The most important design decision is what the dashboard refuses to do.

It refuses to hide difficult consequences behind a single score.

It refuses to turn uncertainty into certainty.

It refuses to let aggregate benefit erase distributional cost.

It refuses to confuse a model's output with a moral conclusion.

Instead:

```text
FACT
+
EVIDENCE
+
UNCERTAINTY
+
VALUES
+
ALTERNATIVES
=
BETTER HUMAN DELIBERATION
```

That is the purpose of the interface.

---

# 47 — Final System Model

```text
                         DECISION
                            │
                            ↓
                    ┌───────────────┐
                    │   SCENARIO    │
                    └───────┬───────┘
                            ↓
          ┌─────────────────┼─────────────────┐
          ↓                 ↓                 ↓
       ECONOMIC           HUMAN           ECOLOGICAL
          ↓                 ↓                 ↓
       CULTURAL         COMMUNITY        INFRASTRUCTURE
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ↓
                     MORAL LANDSCAPE
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
          EVIDENCE      UNCERTAINTY    DISTRIBUTION
              │             │             │
              └─────────────┼─────────────┘
                            ↓
                     ALTERNATIVES
                            │
                            ↓
                      MITIGATIONS
                            │
                            ↓
                     HUMAN REVIEW
                            │
                            ↓
                    DECISION RECORD
```

---

# Atlas Sanctum

## **Make the tradeoff visible.**

Real-world decisions are rarely about choosing between pure good and pure bad.

They are about navigating competing goods, real costs, uncertainty, unequal burdens, irreversible consequences, and imperfect information.

The Moral Tradeoff Dashboard gives those tensions a place to be seen.

> **Not to decide what humanity should choose.**

> **To make it harder for humanity to forget what its choices cost.**

**Observe the landscape. Examine the evidence. Compare the paths. Own the decision.**
