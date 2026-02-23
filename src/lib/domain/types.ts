export type GoalType = 'item' | 'quest' | 'skill';

export type GoalStatus = 'active' | 'completed';

export type SubGoal = {
	id: string;
	label: string;
	completed: boolean;
};

export type Goal = {
	id: string;
	type: GoalType;
	title: string;
	status: GoalStatus;
	progressPct: number;
	completedAt?: string;
	updatedAt: string;
	subGoals?: SubGoal[];
};

export type ItemGoal = Goal & {
	type: 'item';
	itemId: number;
	iconUrl?: string;
	currentPrice?: number;
	lastKnownPrice?: number;
	priceStale?: boolean;
	goldProgressPct: number;
	powerProgressPct: number;
};

export type QuestGoal = Goal & {
	type: 'quest';
};

export type SkillGoal = Goal & {
	type: 'skill';
	levelCurrent: number;
	levelTarget: number;
};

export type BankItem = {
	itemId: number;
	name: string;
	iconUrl?: string;
	quantity: number;
};

export type CatalogItem = {
	itemId: number;
	name: string;
	icon: string;
	basePrice: number;
};

