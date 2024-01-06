import { packsUrl } from '@/config';

export const NsfwPacks = {
	'dddg.buildin.backgrounds.nsfw': `${packsUrl}buildin.base.backgrounds.nsfw.json`,
	'dddg.buildin.sayori.nsfw': `${packsUrl}buildin.base.sayori.nsfw.json`,
	'dddg.buildin.base.natsuki.nsfw': `${packsUrl}buildin.base.natsuki.nsfw.json`,
	'dddg.buildin.yuri.nsfw': `${packsUrl}buildin.base.yuri.nsfw.json`,
};

export const NsfwNames = new Set(Object.keys(NsfwPacks));
export const NsfwPaths = Object.values(NsfwPacks);
