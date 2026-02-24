export async function fetchQuestMetadata(title: string) {
	const name = title.trim();
	if (!name) return { questIds: [], skillReqs: [] as Array<{ skill: string; level: number }> };
	const res = await fetch(`/api/osrs/quest-meta?title=${encodeURIComponent(name)}`);
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

