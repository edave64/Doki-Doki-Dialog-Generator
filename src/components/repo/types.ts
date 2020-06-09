import { IPack } from '@edave64/dddg-repo-filters/dist/pack';
import { PackState } from '@/store/content';

export interface SelectedEvent {
	id: string;
	source: 'keyboard' | 'pointer';
}

export interface IPackWithState extends IPack {
	state: PackState | 'Unknown';
	inLocalRepo: boolean;
}
