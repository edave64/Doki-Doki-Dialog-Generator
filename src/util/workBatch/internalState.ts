import { Component, Vue } from 'vue-property-decorator';

@Component({})
export class InternalState extends Vue {
	public busy: boolean = false;
	public error: string | null = null;
	public completed = 0;
	public fullCount = 0;
}
