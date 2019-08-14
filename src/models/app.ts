import { Background } from './background';

export interface IApp {
	currentBackground: Background | null;
	render_(): void;
	close_guis(): void;
}
