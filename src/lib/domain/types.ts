export type GoalType = 'item' | 'quest' | 'skill';

export type GoalStatus = 'active' | 'completed';

export type SubGoal = {
	id: string;
	label: string;
	completed: boolean;
	kind?: 'quest_requirement' | 'skill_requirement';
	parentGoalTitle?: string;
};

export type Goal = {
	id: string;
	type: GoalType;
	title: string;
	status: GoalStatus;
	progressPct: number;
	completedAt?: string;
	createdAt: string;
	updatedAt: string;
	subGoals?: SubGoal[];
};

export type ItemGoal = Goal & {
	type: 'item';
	itemId: number;
	imageUrl?: string;
	currentPrice?: number;
	lastKnownPrice?: number;
	priceStale?: boolean;
	goldProgressPct: number;
	powerProgressPct: number;
};

export type QuestGoal = Goal & {
	type: 'quest';
	requirements: {
		directQuestIds?: string[];
		cascadedQuestIds?: string[];
		directSkillReqs?: Array<{ skill: string; level: number }>;
		cascadedSkillReqs?: Array<{ skill: string; level: number }>;
		mergedSkillReqs?: Array<{ skill: string; level: number }>;
		questIds: string[];
		skillReqs: Array<{ skill: string; level: number }>;
	};
	completedQuestReqIds: string[];
	completedSkillReqs: Array<{ skill: string; level: number }>;
};

export type SkillGoal = Goal & {
	type: 'skill';
	skill: string;
	startLevel: number;
	startXp: number;
	currentLevel: number;
	currentXp: number;
	targetLevel: number;
	targetXp: number;
	iconUrl?: string;
};

export type BankItem = {
	itemId: number;
	name: string;
	imageUrl?: string;
	quantity: number;
	currentPrice?: number;
	lastKnownPrice?: number;
};

export type CatalogItem = {
	itemId: number;
	name: string;
	icon?: string;
	imageUrl?: string;
	currentPrice?: number;
};
