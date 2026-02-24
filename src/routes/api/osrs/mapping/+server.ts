import type { RequestHandler } from './$types';

const endpoint = 'https://prices.runescape.wiki/api/v1/osrs/mapping';
const userAgent = 'osrs-planner/1.0 (https://github.com/)';
const headers = {
	'user-agent': userAgent,
	'x-user-agent': userAgent,
	from: 'noreply@example.com',
	accept: 'application/json'
};

let cache: unknown = null;
let cacheAt = 0;
const ttlMs = 1000 * 60 * 30;

export const GET: RequestHandler = async ({ fetch }) => {
	const fresh = Date.now() - cacheAt < ttlMs;
	if (cache && fresh) {
		return Response.json(cache, { headers: { 'cache-control': 'public, max-age=300' } });
	}
	const res = await fetch(endpoint, {
		headers
	});
	if (!res.ok) {
		if (cache) {
			return Response.json(cache, { headers: { 'cache-control': 'public, max-age=120' } });
		}
		return Response.json({ error: 'upstream_unavailable' }, { status: 502 });
	}
	cache = await res.json();
	cacheAt = Date.now();
	return Response.json(cache, { headers: { 'cache-control': 'public, max-age=300' } });
};
