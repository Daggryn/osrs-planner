import type { QuestDependencyNode } from '$lib/domain/types';

export type SkillReq = { skill: string; level: number };

export type QuestRequirementsFixture = {
	title: string;
	capturedAt: string;
	source: string;
	directQuestReqs: string[];
	cascadedQuestReqs: string[];
	directSkillReqs: SkillReq[];
	cascadedSkillReqs: SkillReq[];
	mergedSkillReqsMax: SkillReq[];
	topLevelQuestDeps?: QuestDependencyNode[];
};

export type QuestDisplayNode = {
	quest: string;
	completed: boolean;
	ready: boolean;
	unmetSkills: SkillReq[];
	children: QuestDisplayNode[];
};

function normalizeSkillName(skill: string) {
	return skill.trim();
}

function normalizeSkillLevel(level: number) {
	if (!Number.isFinite(level)) return 1;
	return Math.max(1, Math.min(99, Math.floor(level)));
}

export function dedupeQuestIds(questIds: string[]) {
	return [...new Set(questIds.map((q) => q.trim()).filter(Boolean))];
}

export function mergeSkillReqsMax(skillReqs: SkillReq[]) {
	const maxBySkill = new Map<string, SkillReq>();
	for (const req of skillReqs) {
		const skill = normalizeSkillName(req.skill);
		if (!skill) continue;
		const level = normalizeSkillLevel(req.level);
		const existing = maxBySkill.get(skill);
		if (!existing || level > existing.level) {
			maxBySkill.set(skill, { skill, level });
		}
	}
	return [...maxBySkill.values()].sort((a, b) => a.skill.localeCompare(b.skill));
}

function sortSkillsByLevelDesc(reqs: SkillReq[]) {
	return [...reqs].sort((a, b) => b.level - a.level || a.skill.localeCompare(b.skill));
}

function normalizeQuestNode(node: QuestDependencyNode): QuestDependencyNode {
	return {
		quest: node.quest.trim(),
		completed: Boolean(node.completed),
		directSkillReqs: mergeSkillReqsMax(node.directSkillReqs ?? []),
		directQuestReqs: dedupeQuestIds(node.directQuestReqs ?? []),
		children: (node.children ?? []).map(normalizeQuestNode)
	};
}

type EvaluateOptions = {
	completedQuestIds?: string[];
	userSkills?: Record<string, number>;
};

function hasSkillRequirement(req: SkillReq, userSkills: Record<string, number>) {
	return (userSkills[req.skill] ?? 0) >= req.level;
}

function evaluateQuestNode(
	node: QuestDependencyNode,
	options: EvaluateOptions,
	path: Set<string> = new Set()
): QuestDisplayNode {
	const normalizedQuest = node.quest.trim();
	const completedQuests = new Set((options.completedQuestIds ?? []).map((q) => q.trim()).filter(Boolean));
	const userSkills = options.userSkills ?? {};
	const isCompleted = Boolean(node.completed) || completedQuests.has(normalizedQuest);

	// Cycle guard: treat already-visited node as terminal to avoid recursive loops.
	if (path.has(normalizedQuest)) {
		return {
			quest: normalizedQuest,
			completed: isCompleted,
			ready: !isCompleted,
			unmetSkills: [],
			children: []
		};
	}

	const nextPath = new Set(path);
	nextPath.add(normalizedQuest);

	const unmetSkills = sortSkillsByLevelDesc(
		mergeSkillReqsMax(node.directSkillReqs).filter((req) => !hasSkillRequirement(req, userSkills))
	);
	const children = node.children.map((child) => evaluateQuestNode(child, options, nextPath));
	const allChildReqsMet = children.every((child) => child.completed || child.ready);
	const ready = !isCompleted && unmetSkills.length === 0 && allChildReqsMet;

	return {
		quest: normalizedQuest,
		completed: isCompleted,
		ready,
		unmetSkills,
		children: sortTopLevelQuests(children)
	};
}

export function sortTopLevelQuests(nodes: QuestDisplayNode[]) {
	return [...nodes].sort((a, b) => {
		const score = (node: QuestDisplayNode) => (node.completed ? 2 : node.ready ? 0 : 1);
		return score(a) - score(b) || a.quest.localeCompare(b.quest);
	});
}

export function buildQuestDisplayModel(
	topLevelQuestDeps: QuestDependencyNode[],
	options: EvaluateOptions
) {
	const evaluated = topLevelQuestDeps
		.map(normalizeQuestNode)
		.filter((node) => Boolean(node.quest))
		.map((node) => evaluateQuestNode(node, options));
	return sortTopLevelQuests(evaluated);
}

export function buildFremennikRequirements(fixture: QuestRequirementsFixture) {
	const directQuestIds = dedupeQuestIds(fixture.directQuestReqs);
	const cascadedQuestIds = dedupeQuestIds(
		fixture.cascadedQuestReqs.filter((quest) => quest.trim() && !directQuestIds.includes(quest))
	);
	const questIds = dedupeQuestIds([...directQuestIds, ...cascadedQuestIds]);

	const directSkillReqs = sortSkillsByLevelDesc(mergeSkillReqsMax(fixture.directSkillReqs));
	const cascadedSkillReqs = mergeSkillReqsMax(fixture.cascadedSkillReqs);
	const mergedSkillReqs = mergeSkillReqsMax([
		...directSkillReqs,
		...cascadedSkillReqs,
		...fixture.mergedSkillReqsMax
	]);
	const normalizedTopLevelQuestDeps = (fixture.topLevelQuestDeps ?? []).map(normalizeQuestNode);

	return {
		directQuestIds,
		cascadedQuestIds,
		questIds,
		directSkillReqs,
		cascadedSkillReqs,
		mergedSkillReqs,
		topLevelQuestDeps: normalizedTopLevelQuestDeps
	};
}
