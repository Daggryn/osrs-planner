import type { RequestHandler } from './$types';

const userAgent = 'osrs-planner/1.0 (https://github.com/)';
const headers = {
	'user-agent': userAgent,
	'x-user-agent': userAgent,
	from: 'noreply@example.com',
	accept: 'application/json'
};

type QuestMeta = {
	questIds: string[];
	skillReqs: Array<{ skill: string; level: number }>;
};

type CachedQuestMeta = {
	savedAt: number;
	value: QuestMeta;
};

const skillNames = [
	'Attack',
	'Strength',
	'Defence',
	'Ranged',
	'Prayer',
	'Magic',
	'Runecraft',
	'Construction',
	'Hitpoints',
	'Agility',
	'Herblore',
	'Thieving',
	'Crafting',
	'Fletching',
	'Slayer',
	'Hunter',
	'Mining',
	'Smithing',
	'Fishing',
	'Cooking',
	'Firemaking',
	'Woodcutting',
	'Farming',
	'Sailing'
];

const directMetaCache = new Map<string, CachedQuestMeta>();
const directMetaTtlMs = 1000 * 60 * 60 * 6;

function cleanTitle(title: string) {
	return title.trim();
}

function dedupeQuestReqs(reqs: string[]) {
	return [...new Set(reqs.map((r) => r.trim()).filter(Boolean))];
}

function dedupeSkillReqs(reqs: Array<{ skill: string; level: number }>) {
	const map = new Map<string, { skill: string; level: number }>();
	for (const req of reqs) {
		if (!Number.isFinite(req.level)) continue;
		const level = Math.max(1, Math.min(99, Math.floor(req.level)));
		map.set(`${req.skill}:${level}`, { skill: req.skill, level });
	}
	return [...map.values()];
}

function extractRequirementsText(wikitext: string) {
	const requirementsBlockMatch =
		wikitext.match(/\|\s*requirements?\s*=\s*([\s\S]*?)(?:\n\||\n}})/i) ??
		wikitext.match(/\{\{Quest requirements\|([\s\S]*?)\}\}/i);
	return requirementsBlockMatch?.[1] ?? wikitext;
}

function escapeRegex(text: string) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectLevelHits(source: string, regex: RegExp, into: Set<number>) {
	let match: RegExpExecArray | null;
	while ((match = regex.exec(source))) {
		const level = Number(match[1]);
		if (Number.isFinite(level) && level >= 1 && level <= 99) into.add(level);
	}
}

function parseSkillReqs(requirementsText: string) {
	const out: Array<{ skill: string; level: number }> = [];
	const normalizedText = requirementsText.replace(/<[^>]+>/g, ' ');

	for (const skill of skillNames) {
		const levels = new Set<number>();
		const escaped = escapeRegex(skill);

		// Examples: "70 [[Agility]]", "[[Agility]] 70", "70 Agility", "Agility 70"
		collectLevelHits(
			normalizedText,
			new RegExp(`\\b(\\d{1,2})\\s*\\[\\[${escaped}(?:\\|[^\\]]+)?\\]\\]`, 'gi'),
			levels
		);
		collectLevelHits(
			normalizedText,
			new RegExp(`\\[\\[${escaped}(?:\\|[^\\]]+)?\\]\\]\\s*(?:level\\s*)?(\\d{1,2})\\b`, 'gi'),
			levels
		);
		collectLevelHits(normalizedText, new RegExp(`\\b(\\d{1,2})\\s+${escaped}\\b`, 'gi'), levels);
		collectLevelHits(normalizedText, new RegExp(`\\b${escaped}\\s+(\\d{1,2})\\b`, 'gi'), levels);

		// Template-oriented fallback for requirement blocks where the skill appears with a level in the same line.
		const lineRegex = new RegExp(`[^\\n]*\\b${escaped}\\b[^\\n]*`, 'gi');
		let lineMatch: RegExpExecArray | null;
		while ((lineMatch = lineRegex.exec(normalizedText))) {
			const numbers = lineMatch[0].match(/\b([1-9]\d?)\b/g) ?? [];
			for (const raw of numbers) {
				const level = Number(raw);
				if (level >= 1 && level <= 99) levels.add(level);
			}
		}

		for (const level of levels) out.push({ skill, level });
	}

	return dedupeSkillReqs(out);
}

function parseQuestReqs(requirementsText: string, questTitles: Set<string>, currentQuestTitle: string) {
	const out = new Set<string>();
	const linkRegex = /\[\[([^[\]|#]+)(?:\|[^[\]]+)?\]\]/g;
	let match: RegExpExecArray | null;
	while ((match = linkRegex.exec(requirementsText))) {
		const name = cleanTitle(match[1]);
		if (!name) continue;
		if (name === currentQuestTitle) continue;
		if (questTitles.has(name)) out.add(name);
	}
	return [...out];
}

async function loadQuestTitles(fetchFn: typeof fetch) {
	try {
		const questListRes = await fetchFn('/api/osrs/quests');
		if (!questListRes.ok) return new Set<string>();
		const questData = (await questListRes.json()) as { quests?: string[] };
		return new Set((questData.quests ?? []).map((q) => cleanTitle(q)).filter(Boolean));
	} catch {
		return new Set<string>();
	}
}

async function loadDirectQuestMeta(fetchFn: typeof fetch, title: string, questTitles: Set<string>) {
	const normalizedTitle = cleanTitle(title);
	if (!normalizedTitle) return { questIds: [], skillReqs: [] } satisfies QuestMeta;

	const cached = directMetaCache.get(normalizedTitle);
	if (cached && Date.now() - cached.savedAt < directMetaTtlMs) {
		return cached.value;
	}

	const target = `https://oldschool.runescape.wiki/api.php?action=parse&page=${encodeURIComponent(normalizedTitle)}&prop=wikitext&format=json&formatversion=2`;
	let wikitext = '';
	try {
		const res = await fetchFn(target, { headers });
		if (!res.ok) return { questIds: [], skillReqs: [] } satisfies QuestMeta;
		const data = (await res.json()) as { parse?: { wikitext?: string } };
		wikitext = data.parse?.wikitext ?? '';
	} catch {
		return { questIds: [], skillReqs: [] } satisfies QuestMeta;
	}

	const requirementsText = extractRequirementsText(wikitext);
	const value: QuestMeta = {
		questIds: dedupeQuestReqs(parseQuestReqs(requirementsText, questTitles, normalizedTitle)),
		skillReqs: dedupeSkillReqs(parseSkillReqs(requirementsText))
	};
	directMetaCache.set(normalizedTitle, { savedAt: Date.now(), value });
	return value;
}

async function loadCascadedQuestMeta(fetchFn: typeof fetch, title: string, questTitles: Set<string>) {
	const rootTitle = cleanTitle(title);
	const root = await loadDirectQuestMeta(fetchFn, rootTitle, questTitles);
	const allQuestReqs = new Set<string>(root.questIds);
	const skillMap = new Map<string, { skill: string; level: number }>();
	for (const req of root.skillReqs) {
		skillMap.set(`${req.skill}:${req.level}`, req);
	}

	const visited = new Set<string>([rootTitle]);
	const queue = [...root.questIds];
	while (queue.length > 0) {
		const nextQuest = cleanTitle(queue.shift() ?? '');
		if (!nextQuest || visited.has(nextQuest)) continue;
		visited.add(nextQuest);
		const nextMeta = await loadDirectQuestMeta(fetchFn, nextQuest, questTitles);
		for (const reqQuest of nextMeta.questIds) {
			if (!allQuestReqs.has(reqQuest)) {
				allQuestReqs.add(reqQuest);
				queue.push(reqQuest);
			}
		}
		for (const reqSkill of nextMeta.skillReqs) {
			skillMap.set(`${reqSkill.skill}:${reqSkill.level}`, reqSkill);
		}
	}

	return {
		questIds: [...allQuestReqs].filter((q) => q !== rootTitle),
		skillReqs: [...skillMap.values()]
	} satisfies QuestMeta;
}

export const GET: RequestHandler = async ({ fetch, url }) => {
	const title = cleanTitle(url.searchParams.get('title') ?? '');
	if (!title) {
		return Response.json({ questIds: [], skillReqs: [] });
	}
	const questTitles = await loadQuestTitles(fetch);
	const cascade = url.searchParams.get('cascade') === '1';

	const meta = cascade
		? await loadCascadedQuestMeta(fetch, title, questTitles)
		: await loadDirectQuestMeta(fetch, title, questTitles);

	return Response.json(meta);
};
