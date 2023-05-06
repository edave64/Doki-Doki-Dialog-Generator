import { baseUrl } from '@/asset-manager';

export const NsfwPacks = {
	'dddg.buildin.backgrounds.nsfw': `${baseUrl}packs/buildin.base.backgrounds.nsfw.json`,
	'dddg.buildin.sayori.nsfw': `${baseUrl}packs/buildin.base.sayori.nsfw.json`,
	'dddg.buildin.base.natsuki.nsfw': `${baseUrl}packs/buildin.base.natsuki.nsfw.json`,
	'dddg.buildin.yuri.nsfw': `${baseUrl}packs/buildin.base.yuri.nsfw.json`,
};

export const NsfwNames = new Set(Object.keys(NsfwPacks));
export const NsfwPaths = Object.values(NsfwPacks);
