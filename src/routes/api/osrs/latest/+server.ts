import type { RequestHandler } from './$types';

const endpoint = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const userAgent = 'osrs-planner/1.0 (https://github.com/)';
const headers = {
	'user-agent': userAgent,
	'x-user-agent': userAgent,
	from: 'noreply@example.com',
	accept: 'application/json'
};

type UpstreamPriceRow = {
	high?: number;
	low?: number;
};

type UpstreamLatestPayload = {
	data?: Record<string, UpstreamPriceRow>;
};

let snapshot: Record<string, UpstreamPriceRow> = {};
let snapshotSavedAt = 0;

function filterSnapshotByIds(idsRaw: string | null) {
	if (!idsRaw) return { ...snapshot };
	const ids = idsRaw
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);
	if (ids.length === 0) return { ...snapshot };
	const filtered: Record<string, UpstreamPriceRow> = {};
	for (const id of ids) {
		if (snapshot[id]) filtered[id] = snapshot[id];
	}
	return filtered;
}

export const GET: RequestHandler = async ({ fetch, url }) => {
	const ids = url.searchParams.get('ids');
	const target = ids ? `${endpoint}?ids=${encodeURIComponent(ids)}` : endpoint;
	try {
		const res = await fetch(target, {
			headers
		});
		if (!res.ok) throw new Error('upstream_unavailable');
		const data = (await res.json()) as UpstreamLatestPayload;
		const rows = data.data ?? {};
		if (Object.keys(rows).length > 0) {
			snapshot = { ...snapshot, ...rows };
			snapshotSavedAt = Date.now();
		}
		return Response.json(
			{ ...data, stale: false },
			{ headers: { 'cache-control': 'public, max-age=30' } }
		);
	} catch {
		const fallbackData = filterSnapshotByIds(ids);
		if (Object.keys(fallbackData).length > 0) {
			return Response.json(
				{
					data: fallbackData,
					stale: true,
					snapshotSavedAt: snapshotSavedAt ? new Date(snapshotSavedAt).toISOString() : undefined
				},
				{ headers: { 'cache-control': 'public, max-age=15' } }
			);
		}
		return Response.json({ error: 'upstream_unavailable', data: {}, stale: true }, { status: 502 });
	}
};
