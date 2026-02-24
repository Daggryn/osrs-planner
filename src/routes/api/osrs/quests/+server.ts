import type { RequestHandler } from './$types';

const userAgent = 'osrs-planner/1.0 (https://github.com/)';
const headers = {
	'user-agent': userAgent,
	'x-user-agent': userAgent,
	from: 'noreply@example.com',
	accept: 'application/json'
};

type CategoryResponse = {
	continue?: { cmcontinue?: string };
	query?: { categorymembers?: Array<{ title: string }> };
};

let cache: string[] = [];
let cachedAt = 0;
const ttlMs = 1000 * 60 * 60;

async function loadAllQuestTitles(fetchFn: typeof fetch) {
	const titles = new Set<string>();
	let cmcontinue: string | undefined;
	for (let i = 0; i < 20; i++) {
		const url = new URL('https://oldschool.runescape.wiki/api.php');
		url.searchParams.set('action', 'query');
		url.searchParams.set('format', 'json');
		url.searchParams.set('list', 'categorymembers');
		url.searchParams.set('cmtitle', 'Category:Quests');
		url.searchParams.set('cmlimit', '500');
		if (cmcontinue) url.searchParams.set('cmcontinue', cmcontinue);
		const res = await fetchFn(url.toString(), { headers });
		if (!res.ok) break;
		const data = (await res.json()) as CategoryResponse;
		for (const row of data.query?.categorymembers ?? []) {
			const title = row.title.trim();
			if (!title) continue;
			if (title.startsWith('Category:')) continue;
			if (title.includes('(music track)')) continue;
			titles.add(title);
		}
		cmcontinue = data.continue?.cmcontinue;
		if (!cmcontinue) break;
	}
	return [...titles].sort((a, b) => a.localeCompare(b));
}

export const GET: RequestHandler = async ({ fetch }) => {
	if (cache.length > 0 && Date.now() - cachedAt < ttlMs) {
		return Response.json({ quests: cache }, { headers: { 'cache-control': 'public, max-age=900' } });
	}
	try {
		cache = await loadAllQuestTitles(fetch);
		cachedAt = Date.now();
	} catch {
		// Keep previous cache if available.
	}
	return Response.json({ quests: cache }, { headers: { 'cache-control': 'public, max-age=900' } });
};

