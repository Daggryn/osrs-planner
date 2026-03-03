import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:5173';
const title = 'The Fremennik Exiles';
const fixturePath = resolve('src/lib/data/fixtures/the-fremennik-exiles.requirements.json');

function dedupe(values) {
	return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function mergeSkillReqsMax(skillReqs) {
	const maxBySkill = new Map();
	for (const req of skillReqs) {
		const skill = String(req.skill ?? '').trim();
		if (!skill) continue;
		const level = Math.max(1, Math.min(99, Math.floor(Number(req.level) || 1)));
		const existing = maxBySkill.get(skill);
		if (!existing || level > existing.level) maxBySkill.set(skill, { skill, level });
	}
	return [...maxBySkill.values()].sort((a, b) => a.skill.localeCompare(b.skill));
}

async function fetchMeta(questTitle, cascade = false) {
	const params = new URLSearchParams({ title: questTitle });
	if (cascade) params.set('cascade', '1');
	const res = await fetch(`${baseUrl}/api/osrs/quest-meta?${params.toString()}`);
	if (!res.ok) throw new Error(`Failed to fetch ${res.url}: ${res.status}`);
	return res.json();
}

async function buildQuestTree(questTitle, path = new Set()) {
	const normalized = questTitle.trim();
	if (!normalized || path.has(normalized)) {
		return {
			quest: normalized,
			directSkillReqs: [],
			directQuestReqs: [],
			children: []
		};
	}

	const meta = await fetchMeta(normalized, false);
	const directQuestReqs = dedupe(meta.questIds ?? []);
	const directSkillReqs = mergeSkillReqsMax(meta.skillReqs ?? []);
	const nextPath = new Set(path);
	nextPath.add(normalized);
	const children = [];
	for (const reqQuest of directQuestReqs) {
		children.push(await buildQuestTree(reqQuest, nextPath));
	}

	return {
		quest: normalized,
		directSkillReqs,
		directQuestReqs,
		children
	};
}

async function main() {
	const [direct, cascaded] = await Promise.all([fetchMeta(title, false), fetchMeta(title, true)]);
	const directQuestReqs = dedupe(direct.questIds ?? []);
	const cascadedQuestReqs = dedupe((cascaded.questIds ?? []).filter((quest) => !directQuestReqs.includes(quest)));
	const directSkillReqs = mergeSkillReqsMax(direct.skillReqs ?? []);
	const cascadedSkillReqs = mergeSkillReqsMax(cascaded.skillReqs ?? []);
	const mergedSkillReqsMax = mergeSkillReqsMax([...directSkillReqs, ...cascadedSkillReqs]);

	const topLevelQuestDeps = [];
	for (const reqQuest of directQuestReqs) {
		topLevelQuestDeps.push(await buildQuestTree(reqQuest, new Set([title])));
	}

	const snapshot = {
		title,
		capturedAt: new Date().toISOString(),
		source: `${baseUrl}/api/osrs/quest-meta`,
		directQuestReqs,
		cascadedQuestReqs,
		directSkillReqs,
		cascadedSkillReqs,
		mergedSkillReqsMax,
		topLevelQuestDeps
	};

	await writeFile(fixturePath, `${JSON.stringify(snapshot, null, '\t')}\n`, 'utf8');
	console.log(`Wrote ${fixturePath}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
