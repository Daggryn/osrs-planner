# OSRS Goal Planner

Forward-looking progression dashboard for Old School RuneScape.

## Product Purpose

OSRS Goal Planner is a goal-setting and goal-tracking app that helps players plan progression and feel momentum while pursuing meaningful account milestones.

This is not a trade simulator. It is a planning and decision-support tool.

## Core Philosophy

1. Planning, not economy simulation
- No GE tax/slippage simulation
- No auto-liquidation logic
- No transaction history modeling

2. User maintains economic truth
- User manually maintains gold value
- Bank data is user-declared
- App estimates value from live prices, but does not fabricate sales/events

3. Goal-first UX
- The core user experience is adding OSRS-aware goals and completing them
- Item, Quest, and Skill goals should feel unified in quality and flow

## Scope

## MVP In Scope
- Item goals (wishlist) with live GE pricing
- Bank modeling (gold + liquid assets)
- Affordability and progress indicators
- Dashboard summaries and goal rows
- Structured placeholder routes for Quests and Skills

## MVP Out of Scope
- Trade simulation and tax accounting
- Auto-conversion of items to gold
- Complex portfolio accounting
- Full quest/skill dependency engine implementation

## Route Structure

- `/` Dashboard
- `/items/wishlist` Item goals
- `/items/bank` Bank management
- `/quests` Quest goals (structured placeholder first)
- `/skills` Skill goals (structured placeholder first)

## Navigation and Layout

- Left sidebar navigation (desktop)
- Responsive layout on mobile with same behavior (no separate mobile logic)

## Goal System Model

Three main goal types:
- Item goals
- Quest goals
- Skill goals

Visual unification:
- All main goals use large card tiles (not compact list rows)
- All main goals include progress bars
- Progress bar turns green at completion

Type identity colors:
- Items: gold
- Quests: blue
- Skills: green

Sub-goals (requirements):
- Sub-goals are visually secondary (compact checklist/panel), not full main cards
- Sub-goal completion increments parent goal progress
- Sub-goal completion feedback is subtle

## Completion UX Rules

Main goals (Item, Quest, Skill):
- High-emphasis, premium-feeling celebration on completion
- No tacky/confetti-heavy treatment
- Include subtle animation + toast for completion events

Item goals:
- User action: `Mark goal complete`
- No confirmation dialog
- Item goals support one-click `Undo`

Quest/Skill goals:
- Completion/progress should be API-driven where possible
- No undo control required in UI

Completed visibility:
- Default view hides completed goals
- `Show completed` toggle reveals completed section below active goals

## Item Goals (Wishlist) UX

Add flow:
- Live typeahead search for OSRS items

Goal card/row content:
- Item icon
- Item name
- Current GE price

Sorting:
- Default sort is cheapest item first

Progress semantics for item goals (dual progress):
- Gold-only progress
- Purchasing-power progress

Price refresh behavior:
- Fetch on page load
- Manual refresh control
- If refresh fails: show last known price with `stale` badge

## Bank UX

Gold editing:
- Inline editable gold value at top
- Save on blur

Bank items:
- Add via live typeahead + quantity
- Default quantity for reconciliation add: `1`

Liquidity rule:
- Any item in Bank is treated as liquid asset value
- If user does not want item counted as liquid, they remove it from Bank

Copy intent:
- Explain clearly that Bank items contribute to purchasing power if user is willing to sell them

Recommended copy:
- Title: `Recent item goals achieved`
- Description: `Add any items you are willing to sell. Added items are counted toward your purchasing power.`

## Item Completion Reconciliation Flow

When item goals are completed:
- Show persistent banner in current tab session
- Banner directs user to Bank for reconciliation

Banner/session rules:
- Session means current tab lifetime only
- Reconciliation queue resets on reload/new tab
- Queue contains newly completed item goals since current session start

Bank reconciliation behavior:
- Clicking banner navigates to `/items/bank`
- Focus user on gold update first
- Newly completed items appear at top, highlighted
- Per highlighted item actions:
  - `Add to Bank` (adds qty 1)
  - `Dismiss` (removes from session queue only)
- `Dismiss` never changes completion state

Reconciliation feedback:
- Completion toast language should use `Goal achieved` phrasing

## Dashboard UX

Dashboard is summary + quick actions only (not full goal management page).

Section 1: Progress since last visit
- Includes quest completions and skill level gains
- Excludes item goals in this section
- Visit boundary: previous app-open timestamp

Section 2: Market movers
- Top 3 wishlist items with biggest price drop
- Top 3 bank items with biggest price increase

Section 3: Goal focus rows
- Three rows of main goal cards:
  - Items
  - Quests
  - Skills
- Each row sorted by closest to completion

Section 4: Newly completed goals spotlight
- Full-width achievement spotlight panel near top
- Includes all newly completed main goals (Item, Quest, Skill)
- High-emphasis but polished (not tacky)

## Data and Value Semantics

Gold:
- User-entered and authoritative

Bank value:
- `gold + sum(liquid item current value)`

Wishlist value:
- Sum of current item goal prices

Affordability statuses:
- Gold-only affordability
- Purchasing-power affordability

No automatic economic mutation:
- Completing item goals does not auto-adjust gold
- Completing item goals does not auto-insert/remove bank items

## Persistence and Session Rules

Persistent local data:
- Browser-local storage for goals, bank, and core settings
- Versioned schema with migration path for future updates

Session-only data (in-memory):
- Newly completed item-goal reconciliation queue
- Session-scoped reconciliation banner state

## API and Data Integration Direction

Primary pricing source:
- OSRS Wiki / GE API

Intent:
- Minimize manual entry
- Use OSRS-aware lookup for item metadata and prices
- Expand later to quest and skill data sources for dependency/progress automation

## Testing Priorities

Unit tests:
- Value calculations (bank value, affordability, dual progress)
- Session queue and dismissal behavior
- Schema version migration behavior

Component tests:
- Typeahead add flows
- Completion and undo for item goals
- Completed-goals toggle/section behavior
- Reconciliation highlight actions in Bank

Route smoke tests:
- Dashboard, Wishlist, Bank, Quests, Skills render correctly

Acceptance checks:
- UI reflects all locked behaviors in this document
- No automatic economic state mutation beyond explicit user actions
- Responsive layout preserves same interactions as desktop

## Future Expansion (After MVP)

- Quest dependency graph with auto-fetched requirements
- Skill milestone planning and deeper progress forecasting
- Linked cross-goal prioritization logic
- Enhanced historical market analytics

Guiding principle remains:

The app assists decision-making.  
The user maintains economic truth.
