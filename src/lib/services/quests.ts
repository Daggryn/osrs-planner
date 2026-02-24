export async function fetchQuestMetadata(title: string, options?: { cascade?: boolean }) {
	const name = title.trim();
	if (!name) return { questIds: [], skillReqs: [] as Array<{ skill: string; level: number }> };
	const params = new URLSearchParams({ title: name });
	if (options?.cascade) params.set('cascade', '1');
	const res = await fetch(`/api/osrs/quest-meta?${params.toString()}`);
	if (!res.ok) return { questIds: [], skillReqs: [] as Array<{ skill: string; level: number }> };
	const data = (await res.json()) as {
		questIds?: string[];
		skillReqs?: Array<{ skill: string; level: number }>;
	};
	return {
		questIds: data.questIds ?? [],
		skillReqs: data.skillReqs ?? []
	};
}
