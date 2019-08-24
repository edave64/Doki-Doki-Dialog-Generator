import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';

export class Background {
	public readonly path: string;
	public constructor(path: string, public readonly name: string) {
		this.path = '/backgrounds/' + path;
	}

	public async render(rx: RenderContext): Promise<void> {
		rx.drawImage(await getAsset(this.path, rx.hq), 0, 0);
	}
}

export const transparent = new Background('transparent', 'Transparent');
transparent.render = async function(rx: RenderContext) {
	if (!rx.preview) return;
	return await Background.prototype.render.call(this, rx);
};
