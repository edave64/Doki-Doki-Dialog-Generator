export const baseUrl = './';
export const assetUrl =
	(typeof DDDG_ASSET_PATH !== 'undefined' ? DDDG_ASSET_PATH : baseUrl) +
	'assets/';
export const packsUrl = `${baseUrl}packs/`;

// Sets whether to allow webp assets. These are smaller than PNGs, so waste less bandwith. But are not required on a
// local deployment
export const allowWebP =
	typeof DDDG_ALLOW_WEBP !== 'undefined' ? DDDG_ALLOW_WEBP : true;

// Sets whether to allow low quality assets. These are made to go easier on mobile connections and are meaningless on
// a local enviornment
export const allowLq =
	typeof DDDG_ALLOW_LQ !== 'undefined' ? DDDG_ALLOW_LQ : true;
