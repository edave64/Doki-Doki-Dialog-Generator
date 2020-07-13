import { Component, Vue } from 'vue-property-decorator';

@Component({})
export class EnvState extends Vue {
	public tempInstalled: string[] = [];
	public tempUninstalled: string[] = [];

	public active: string[] = [];
	public inactive: string[] = [];
}
