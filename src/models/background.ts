import { IApp } from './app';

export class Background {
	public readonly el: HTMLImageElement;
	public readonly tab: string;
	public readonly name: string;

	public constructor(element: HTMLImageElement) {
		this.el = element;
		this.tab = element.getAttribute('tab')!;
		this.name = element.getAttribute('alt')!;
	}

	public icon(main: IApp) {
		const img = document.createElement('img');
		img.src = this.el.src;
		img.style.width = '128px';
		img.style.cssFloat = 'left';
		img.style.marginRight = '1em';

		const el = document.createElement('div');
		el.style.backgroundColor =
			this === main.currentBackground ? 'white' : 'transparent';
		el.style.color = '#555';
		el.style.fontSize = '16pt';
		el.style.height = '72px';
		el.style.padding = '5px';
		el.style.cursor = 'pointer';
		el.setAttribute('title', this.name);

		el.appendChild(img);
		el.appendChild(document.createTextNode(this.name));

		const me = this;
		el.addEventListener('click', () => {
			main.currentBackground = me;
			main.render_();
			main.close_guis();
		});

		return el;
	}
}
