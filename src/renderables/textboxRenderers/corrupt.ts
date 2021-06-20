import {
	TextBoxCorruptedWidth,
	TextBoxWidth,
} from '@/constants/game_modes/ddlc/textBox';
import { Default } from './default';

export class Corrupted extends Default {
	static readonly id = 'corrupt';
	static readonly label = 'Corrupted';
	static readonly priority = 1;
	static readonly gameMode = 'ddlc';

	protected backgroundImage = 'textbox_monika';
	protected xOffset = (TextBoxWidth - TextBoxCorruptedWidth) / 2;

	public appliesTo(type: string): boolean {
		return type === Corrupted.id;
	}
}
