import { Background } from '../asset-manager';

export interface IApp {
	currentBackground: Background | null;
	render_(): void;
	close_guis(): void;
}
