import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';

export default interface ISave {
	version: '2.4';
	unsafe: boolean;
	panels: IPanels;
	uploadUrls: string[];
	content: Array<string | ContentPack<IAssetSwitch>>;
}

export interface IPanels {
	[id: string]: IPanel;
}

export interface IPanel {
	id: number;
	background: {
		color: string;
		current: string;
		flipped: false;
		scaling: number;
		variant: number;
		composite: CompositeMode;
		filters: IFilter[];
	};
}

type CompositeMode =
	| 'source-over'
	| 'source-in'
	| 'source-out'
	| 'source-atop'
	| 'destination-over'
	| 'destination-in'
	| 'destination-out'
	| 'destination-atop'
	| 'lighter'
	| 'copy'
	| 'xor'
	| 'multiply'
	| 'screen'
	| 'overlay'
	| 'darken'
	| 'lighten'
	| 'color-dodge'
	| 'color-burn'
	| 'hard-light'
	| 'soft-light'
	| 'difference'
	| 'exclusion'
	| 'hue'
	| 'saturation'
	| 'color'
	| 'luminosity';

export interface IAssetSwitch {
	hq: string;
	lq: string;
	sourcePack: string;
}
