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

export function buildFremennikRequirements(fixture: QuestRequirementsFixture) {
	const directQuestIds = dedupeQuestIds(fixture.directQuestReqs);
	const cascadedQuestIds = dedupeQuestIds(
		fixture.cascadedQuestReqs.filter((quest) => quest.trim() && !directQuestIds.includes(quest))
	);
	const questIds = dedupeQuestIds([...directQuestIds, ...cascadedQuestIds]);

	const directSkillReqs = mergeSkillReqsMax(fixture.directSkillReqs);
	const cascadedSkillReqs = mergeSkillReqsMax(fixture.cascadedSkillReqs);
	const mergedSkillReqs = mergeSkillReqsMax([
		...directSkillReqs,
		...cascadedSkillReqs,
		...fixture.mergedSkillReqsMax
	]);

	return {
		directQuestIds,
		cascadedQuestIds,
		questIds,
		directSkillReqs,
		cascadedSkillReqs,
		mergedSkillReqs
	};
}
