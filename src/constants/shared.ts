export enum SelectedState {
	None = 0b00,
	Selected = 0b001,
	Focused = 0b010,
	Indirectly = 0b100,
}

export const selectionColors = {
	[SelectedState.None]: undefined,
	[SelectedState.Selected]: '#f00',
	[SelectedState.Focused]: '#00f',
	[SelectedState.Selected + SelectedState.Focused]: '#f0f',
	[SelectedState.Indirectly]: '#f66',
	[SelectedState.Indirectly + SelectedState.Focused]: '#f6f',
};
