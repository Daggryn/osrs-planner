import type { RequestHandler } from './$types';

const userAgent = 'osrs-planner/1.0 (https://github.com/)';
const headers = {
	'user-agent': userAgent,
	'x-user-agent': userAgent,
	from: 'noreply@example.com',
	accept: 'application/json'
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
	'Farming'
];

function extractRequirementsText(wikitext: string) {
	const requirementsBlockMatch =
		wikitext.match(/\|\s*requirements?\s*=\s*([\s\S]*?)(?:\n\||\n}})/i) ??
		wikitext.match(/\{\{Quest requirements\|([\s\S]*?)\}\}/i);
	return requirementsBlockMatch?.[1] ?? wikitext;
}

function parseSkillReqs(requirementsText: string) {
	const out: Array<{ skill: string; level: number }> = [];
	for (const skill of skillNames) {
		const pattern = new RegExp(`(\\d{1,2})\\s*\\[\\[${skill}(?:\\|[^\\]]+)?\\]\\]`, 'gi');
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(requirementsText))) {
			const level = Number(match[1]);
			if (Number.isFinite(level)) out.push({ skill, level });
		}
	}
	const dedup = new Map<string, { skill: string; level: number }>();
	for (const req of out) {
		dedup.set(`${req.skill}:${req.level}`, req);
	}
	return [...dedup.values()];
}

function parseQuestReqs(requirementsText: string, questTitles: Set<string>, currentQuestTitle: string) {
	const out = new Set<string>();
	const linkRegex = /\[\[([^[\]|#]+)(?:\|[^[\]]+)?\]\]/g;
	let match: RegExpExecArray | null;
	while ((match = linkRegex.exec(requirementsText))) {
		const name = match[1].trim();
		if (!name) continue;
		if (name === currentQuestTitle) continue;
		if (questTitles.has(name)) out.add(name);
	}
	return [...out];
}

export const GET: RequestHandler = async ({ fetch, url }) => {
	const title = url.searchParams.get('title')?.trim();
	if (!title) {
		return Response.json({ questIds: [], skillReqs: [] });
	}

	const target = `https://oldschool.runescape.wiki/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json&formatversion=2`;
	let wikitext = '';
	try {
		const res = await fetch(target, { headers });
		if (!res.ok) return Response.json({ questIds: [], skillReqs: [] });
		const data = (await res.json()) as { parse?: { wikitext?: string } };
		wikitext = data.parse?.wikitext ?? '';
	} catch {
		return Response.json({ questIds: [], skillReqs: [] });
	}

	const requirementsText = extractRequirementsText(wikitext);
	let questTitles = new Set<string>();
	try {
		const questListRes = await fetch('/api/osrs/quests');
		if (questListRes.ok) {
			const questData = (await questListRes.json()) as { quests?: string[] };
			questTitles = new Set((questData.quests ?? []).map((q) => q.trim()).filter(Boolean));
		}
	} catch {
		// Keep empty set fallback; no quest reqs will be inferred in this case.
	}

	return Response.json({
		questIds: parseQuestReqs(requirementsText, questTitles, title),
		skillReqs: parseSkillReqs(requirementsText)
	});
};
