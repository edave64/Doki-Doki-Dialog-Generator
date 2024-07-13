import type { IPack } from '@edave64/dddg-repo-filters/dist/pack';

export interface SelectedEvent {
	id: string;
	source: 'keyboard' | 'pointer';
}

export enum PackStates {
	Unknown = 0b00,
	Installed = 0b01,
	Active = 0b10,
}

export interface IPackWithState extends IPack {
	state: PackStates;
}
