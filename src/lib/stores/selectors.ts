import type { BankItem, Goal, ItemGoal, QuestGoal, SkillGoal } from '$lib/domain/types';

function effectivePrice(item: {
	currentPrice?: number;
	lastKnownPrice?: number;
	current?: number;
	lastKnown?: number;
}) {
	return item.currentPrice ?? item.lastKnownPrice ?? item.current ?? item.lastKnown ?? 0;
}

export function formatGp(value: number) {
	return `${Math.floor(value).toLocaleString()} gp`;
}

export function bankValue(gold: number, bankItems: BankItem[], priceMap: Record<number, { current?: number; lastKnown?: number }>) {
	const liquid = bankItems.reduce((sum, item) => {
		const price = effectivePrice(priceMap[item.itemId] ?? item);
		return sum + price * item.quantity;
	}, 0);
	return gold + liquid;
}

export function wishlistTotal(itemGoals: ItemGoal[]) {
	return itemGoals.reduce((sum, goal) => sum + effectivePrice(goal), 0);
}

export function itemWithProgress(
	item: ItemGoal,
	gold: number,
	power: number
): ItemGoal {
	const price = Math.max(1, effectivePrice(item));
	const goldProgressPct = Math.min(100, Math.floor((gold / price) * 100));
	const powerProgressPct = Math.min(100, Math.floor((power / price) * 100));
	return {
		...item,
		goldProgressPct,
		powerProgressPct,
		progressPct: item.status === 'completed' ? 100 : Math.max(goldProgressPct, powerProgressPct)
	};
}

export function skillProgress(goal: SkillGoal) {
	if (goal.status === 'completed') return 100;
	const denom = Math.max(1, goal.targetXp - goal.startXp);
	return Math.min(100, Math.max(0, Math.floor(((goal.currentXp - goal.startXp) / denom) * 100)));
}

export function splitCompleted<T extends Goal>(goals: T[]) {
	return {
		active: goals.filter((g) => g.status === 'active'),
		completed: goals.filter((g) => g.status === 'completed')
	};
}

export function sortByCheapest(items: ItemGoal[]) {
	return [...items].sort((a, b) => effectivePrice(a) - effectivePrice(b));
}

export function sortByClosest(goals: Goal[]) {
	return [...goals].sort((a, b) => b.progressPct - a.progressPct);
}

export function sinceLastVisit(goals: Goal[], lastOpenedAt?: string) {
	if (!lastOpenedAt) return [];
	const last = new Date(lastOpenedAt).getTime();
	return goals.filter((g) => g.completedAt && new Date(g.completedAt).getTime() > last);
}

export function topWishlistDrops(
	items: ItemGoal[],
	priceMap: Record<number, { current?: number; lastKnown?: number }>
) {
	const deltas = items
		.map((item) => {
			const live = priceMap[item.itemId];
			const current = effectivePrice(live ?? item);
			const previous = item.lastKnownPrice ?? current;
			return { item, delta: current - previous };
		})
		.filter((x) => Number.isFinite(x.delta))
		.sort((a, b) => a.delta - b.delta);
	return deltas.slice(0, 3);
}

export function topBankGains(
	bankItems: BankItem[],
	priceMap: Record<number, { current?: number; lastKnown?: number }>
) {
	const deltas = bankItems
		.map((item) => {
			const live = priceMap[item.itemId];
			const current = effectivePrice(live ?? item);
			const previous = live?.lastKnown ?? item.lastKnownPrice ?? current;
			return { item, delta: (current - previous) * item.quantity };
		})
		.sort((a, b) => b.delta - a.delta);
	return deltas.slice(0, 3);
}

export function questRequirementTracker(questGoals: QuestGoal[]) {
	const allQuestReqs = new Set<string>();
	const doneQuestReqs = new Set<string>();
	const allSkillReqs = new Set<string>();
	const doneSkillReqs = new Set<string>();

	for (const goal of questGoals) {
		for (const questId of goal.requirements.questIds) {
			allQuestReqs.add(questId);
		}
		for (const skillReq of goal.requirements.skillReqs) {
			allSkillReqs.add(`${skillReq.skill}:${skillReq.level}`);
		}
		for (const questId of goal.completedQuestReqIds) {
			doneQuestReqs.add(questId);
		}
		for (const skillReq of goal.completedSkillReqs) {
			doneSkillReqs.add(`${skillReq.skill}:${skillReq.level}`);
		}
	}

	return {
		questsDone: doneQuestReqs.size,
		questsTotal: allQuestReqs.size,
		skillsDone: doneSkillReqs.size,
		skillsTotal: allSkillReqs.size
	};
}

export function skillHeaderTracker(skillGoals: SkillGoal[]) {
	const gained = skillGoals.reduce((sum, goal) => sum + Math.max(0, goal.currentLevel - goal.startLevel), 0);
	const needed = skillGoals.reduce((sum, goal) => sum + Math.max(0, goal.targetLevel - goal.startLevel), 0);
	return { gained, needed };
}

export function progressColor(pct: number) {
	if (pct >= 100) return '#49b06e';
	if (pct > 75) return '#7cad57';
	if (pct > 50) return '#b8a24f';
	if (pct > 25) return '#c88957';
	return '#c75b5b';
}
