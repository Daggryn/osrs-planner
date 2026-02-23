# UI Component Spec (MVP)

This document translates `PROJECT_CONTEXT.md` into concrete UI components and state contracts so implementation can proceed without re-deciding boundaries.

## 1) Design System Tokens (MVP)

Use CSS variables at app root:

- `--goal-item`: gold accent for item goals
- `--goal-quest`: blue accent for quest goals
- `--goal-skill`: green accent for skill goals
- `--goal-complete`: completion green (progress bar full state)
- `--surface-1`, `--surface-2`, `--text-1`, `--text-2`, `--border`

Rules:
- Main goals use large card tiles.
- Type colors are used for left border/accent and badge.
- Progress bars always switch to `--goal-complete` when complete.
- Dashboard goal cards use a summary presentation: goal name + progress only.

## 2) Shared Domain Types (UI-facing)

```ts
type GoalType = 'item' | 'quest' | 'skill';

type GoalStatus = 'active' | 'completed';

type SubGoal = {
  id: string;
  label: string;
  completed: boolean;
};

type Goal = {
  id: string;
  type: GoalType;
  title: string;
  description?: string;
  iconUrl?: string;
  status: GoalStatus;
  progressPct: number; // 0..100
  completedAt?: string; // ISO
  updatedAt: string; // ISO
  subGoals?: SubGoal[];
};

type ItemGoal = Goal & {
  type: 'item';
  itemId: number;
  currentPrice?: number;
  lastKnownPrice?: number;
  priceStale?: boolean;
  goldProgressPct: number; // 0..100
  powerProgressPct: number; // 0..100
};

type BankItem = {
  itemId: number;
  name: string;
  iconUrl?: string;
  quantity: number;
  unitPrice?: number;
};
```

## 3) Global Stores (Svelte)

## 3.1 `plannerStore`
Persistent (localStorage, versioned):
- `gold: number`
- `itemGoals: ItemGoal[]`
- `questGoals: Goal[]`
- `skillGoals: Goal[]`
- `bankItems: BankItem[]`
- `ui.showCompleted: boolean`
- `meta.lastOpenedAt?: string`
- `meta.schemaVersion: number`

Actions:
- `setGold(value: number)`
- `addItemGoal(item)`
- `markItemGoalComplete(goalId)`
- `undoItemGoalComplete(goalId)`
- `setGoalCompletedFromApi(type, goalId, completedAt)` (quest/skill)
- `addBankItem(item, qty)`
- `removeBankItem(itemId)`
- `setBankItemQty(itemId, qty)`
- `setShowCompleted(boolean)`
- `setLastOpenedAt(iso)`

## 3.2 `sessionStore`
In-memory only (tab lifetime):
- `reconciliationQueue: Array<{ goalId: string; itemId: number; name: string; iconUrl?: string }>`
- `showReconcileBanner: boolean`

Actions:
- `enqueueReconciliationItem(...)`
- `dismissReconciliationItem(goalId)`
- `clearReconciliationQueue()`

## 3.3 `priceStore`
In-memory + optional cached snapshot:
- `items: Record<number, { current?: number; lastKnown?: number; stale: boolean; updatedAt?: string }>`
- `isRefreshing: boolean`

Actions:
- `refreshPrices(itemIds?: number[])`
- `setPriceErrorFallback(itemId, lastKnown)`

## 4) Layout and Route Components

## 4.1 `SidebarNav.svelte`
Purpose:
- Left navigation for routes.

Props:
- `currentPath: string`

Behavior:
- Active item highlight.
- Desktop: left sidebar.
- Mobile: bottom tab navigation using same route set (no drawer default).

## 4.2 `AppShell.svelte`
Purpose:
- Global shell for sidebar + content + toast portal.

Slots:
- default content.

## 5) Core Shared UI Components

## 5.1 `GoalCard.svelte`
Purpose:
- Primary large card for main goals across item/quest/skill.

Props:
- `goal: Goal | ItemGoal`
- `showTypeBadge?: boolean`
- `compact?: boolean` (default false)
- `summaryOnly?: boolean` (default false)

Events:
- `complete` (main-goal completion)
- `undo` (item only)
- `open` (optional detail click)

UI content:
- Icon, title, optional description
- Type badge
- Progress bar (green at 100%)
- Status pill for completed

Rules:
- For item goal: render GE price + dual progress mini-bars/labels.
- For non-item goals: render single progress bar + sub-goal summary.
- Undo control appears only when `goal.type === 'item' && goal.status === 'completed'`.
- When `summaryOnly === true`: render title + progress only, and use click action to open goal detail page.

## 5.2 `SubGoalChecklist.svelte`
Purpose:
- Secondary visual for quest/skill requirement progress.

Props:
- `subGoals: SubGoal[]`
- `collapsedByDefault?: boolean` (default true)

Behavior:
- Lightweight checklist style.
- Sub-goal completion should be subtle; no heavy celebration.

## 5.3 `ProgressBar.svelte`
Props:
- `value: number`
- `complete?: boolean`
- `color?: 'item' | 'quest' | 'skill' | 'default'`
- `label?: string`

Behavior:
- Clamps 0..100.
- Uses complete green on 100%.

## 5.4 `TypeaheadItemSearch.svelte`
Purpose:
- OSRS-aware live search used in Wishlist and Bank.

Props:
- `placeholder?: string`
- `debounceMs?: number` (default 150)

Events:
- `select` with `{ itemId, name, iconUrl? }`

States:
- idle, loading, results, empty, error

## 5.5 `PriceBadge.svelte`
Props:
- `price?: number`
- `stale?: boolean`
- `updatedAt?: string`

Behavior:
- Shows formatted GP value.
- Shows stale badge when using fallback price.

## 5.6 `CompletionToast.svelte`
Purpose:
- Shared toast style for `Goal achieved`.

Props:
- `title: string` (default `Goal achieved`)
- `goalName: string`
- `goalType: GoalType`

## 5.7 `AchievementSpotlight.svelte`
Purpose:
- Full-width high-emphasis section for newly completed main goals.

Props:
- `recentCompletedGoals: Goal[]`

Behavior:
- Appears on dashboard top region when list non-empty.
- Polished emphasis (motion, highlight), no tacky effects.
- Auto-dismiss after first view in current session.

## 5.8 `ReconciliationBanner.svelte`
Purpose:
- Session-scoped prompt when item goals were completed this tab session.

Props:
- `count: number`

Events:
- `openBank`

Behavior:
- Persistent while queue count > 0.
- Links user to Bank route.

## 6) Route-Level Composition

## 6.1 Dashboard (`/`)
Component: `DashboardPage.svelte`

Sections:
- `AchievementSpotlight` (newly completed main goals)
- `ProgressSinceLastVisitPanel` (quests/skills only)
- `MarketMoversPanel`
  - Top 3 wishlist price drops
  - Top 3 bank price increases
- `GoalRow` x3 (item/quest/skill), sorted by closest to completion
  - uses `GoalCard summaryOnly` presentation

Quick actions:
- Link to add item goal
- Link to bank reconciliation when session queue exists

Interaction:
- Clicking a dashboard goal card navigates to its goal-type page for full details.

## 6.2 Item Wishlist (`/items/wishlist`)
Component: `WishlistPage.svelte`

Top area:
- `TypeaheadItemSearch`
- Manual `Refresh prices` button
- `Show completed` toggle
- `ReconciliationBanner` when queue exists

Lists:
- Active item goals (default view), cheapest-first
- Completed item goals section (shown only when toggle on)

Card behavior:
- `Mark goal complete` (no confirm)
- Completion animation + `Goal achieved` toast
- Item-only one-click undo for completed item goals

## 6.3 Bank (`/items/bank`)
Component: `BankPage.svelte`

Top area:
- Inline gold editor (save on blur), autofocus when arrived via reconciliation flow

Reconciliation section:
- `Recent item goals achieved` highlighted list at top
- Per item actions:
  - `Add to Bank` (default qty = 1)
  - `Dismiss` (session queue only, does not change goal completion)

Bank items section:
- `TypeaheadItemSearch` + quantity add
- Item list (all treated as liquid)
- Remove action means no longer counted as liquid

Feedback:
- Toast copy uses `Goal achieved` phrasing when reconciliation action completes

## 6.4 Quests (`/quests`) and Skills (`/skills`)
Components:
- `QuestPagePlaceholder.svelte`
- `SkillPagePlaceholder.svelte`

Behavior:
- Structured placeholders with clear “planned next” content.
- Preserve shared card visual language where sample/mock cards are shown.

## 7) Derived Selectors (Must Implement)

- `selectBankValue = gold + sum(bankItems.qty * price)`
- `selectPurchasingPower = selectBankValue`
- `selectWishlistTotal = sum(itemGoal.currentPrice || itemGoal.lastKnownPrice || 0)`
- `selectItemAffordability(item)` returns:
  - `goldOnlyAffordable`
  - `powerAffordable`
  - `goldProgressPct`
  - `powerProgressPct`
- `selectClosestToCompletion(goals)` sorts desc by progress, active first
- `selectProgressSinceLastVisit(lastOpenedAt)` quests/skills only
- `selectRecentMainCompletions(lastOpenedAt)` includes item/quest/skill
- `selectMarketMoversTop3(...)` for wishlist drops and bank gains

## 8) Event Flows (Decision-Critical)

## 8.1 Complete Item Goal
1. User clicks `Mark goal complete`.
2. Goal status set to completed.
3. Add item to session reconciliation queue.
4. Trigger completion animation + toast.
5. Goal moves to completed section (hidden unless toggle on).
6. Reconciliation banner appears.

## 8.2 Undo Item Goal Completion
1. User clicks undo.
2. Goal returns to active state.
3. Remove from session reconciliation queue if present.
4. Recompute ordering and progress visuals.

## 8.3 Reconcile in Bank
1. User clicks reconciliation banner.
2. Navigate to `/items/bank`, focus gold input.
3. Show highlighted queue items at top.
4. `Add to Bank` adds qty 1 liquid item.
5. `Dismiss` removes only from session queue.
6. Show toast confirming reconciliation action.

## 9) Accessibility and Interaction

- Keyboard support for typeahead result selection.
- Visible focus states on all actionable controls.
- Buttons for all completion/undo actions (no div click targets).
- Color is not sole status indicator; pair with icon/text labels.

## 10) Testing Matrix (Component-Level)

`GoalCard`
- Renders correct type accent and progress color.
- Shows undo only for completed item goals.
- In `summaryOnly` mode, renders only title + progress and emits open/navigation action.

`TypeaheadItemSearch`
- Debounced query behavior.
- Selection emits expected payload.

`ReconciliationBanner`
- Appears when queue non-empty.
- Emits navigation event.

`Bank reconciliation section`
- `Add to Bank` inserts qty 1.
- `Dismiss` only removes from session queue.

`AchievementSpotlight`
- Shows only newly completed main goals.
- Dismisses automatically after first view in session.

`WishlistPage`
- Active list cheapest-first.
- Completed list hidden by default, toggled visible.

## 11) Naming and File Targets (Proposed)

- `src/lib/components/layout/AppShell.svelte`
- `src/lib/components/layout/SidebarNav.svelte`
- `src/lib/components/goals/GoalCard.svelte`
- `src/lib/components/goals/SubGoalChecklist.svelte`
- `src/lib/components/goals/ProgressBar.svelte`
- `src/lib/components/items/TypeaheadItemSearch.svelte`
- `src/lib/components/items/PriceBadge.svelte`
- `src/lib/components/feedback/CompletionToast.svelte`
- `src/lib/components/feedback/AchievementSpotlight.svelte`
- `src/lib/components/feedback/ReconciliationBanner.svelte`
- `src/lib/stores/plannerStore.ts`
- `src/lib/stores/sessionStore.ts`
- `src/lib/stores/priceStore.ts`
