import type { RequestHandler } from './$types';

const endpoint = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const userAgent = 'osrs-planner/1.0 (https://github.com/)';
const headers = {
	'user-agent': userAgent,
	'x-user-agent': userAgent,
	from: 'noreply@example.com',
	accept: 'application/json'
};

export const GET: RequestHandler = async ({ fetch, url }) => {
	const ids = url.searchParams.get('ids');
	const target = ids ? `${endpoint}?ids=${encodeURIComponent(ids)}` : endpoint;
	const res = await fetch(target, {
		headers
	});
	if (!res.ok) {
		return Response.json({ error: 'upstream_unavailable' }, { status: 502 });
	}
	const data = await res.json();
	return Response.json(data, { headers: { 'cache-control': 'public, max-age=30' } });
};
