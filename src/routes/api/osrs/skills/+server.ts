import type { RequestHandler } from './$types';

const skills = [
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

export const GET: RequestHandler = async () => {
	return Response.json({ skills }, { headers: { 'cache-control': 'public, max-age=86400' } });
};

