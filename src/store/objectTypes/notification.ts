import {
	ICreateObjectMutation,
	IObject,
	IObjectMutation,
} from '@/store/objects';
import { IPanel, IPanels } from '@/store/panels';
import { ActionTree, MutationTree } from 'vuex';
import { IRootState } from '..';
import { baseProps } from './baseObjectProps';
import getConstants from '@/constants';

export interface INotification extends IObject {
	type: 'notification';
	customColor: string;
	text: string;
	backdrop: boolean;
	autoWrap: boolean;
}

export const notificationMutations: MutationTree<IPanels> = {
	setNotificationProperty<T extends NotificationSimpleProperties>(
		state: IPanels,
		command: ISetNotificationProperty<T>
	) {
		const obj = state.panels[command.panelId].objects[
			command.id
		] as INotification;
		obj[command.key] = command.value;
		++obj.version;
	},
};

let lastNotificationId = 0;

export const notificationActions: ActionTree<IPanels, IRootState> = {
	createNotification(
		{ commit, rootState, state },
		command: ICreateNotificationAction
	): IObject['id'] {
		const constants = getConstants();
		const id = state.panels[command.panelId].lastObjId + 1;
		commit('create', {
			object: {
				...baseProps(),
				y: constants.Base.screenHeight / 2,
				width: constants.Choices.ChoiceButtonWidth,
				height: 0,
				panelId: rootState.panels.currentPanel,
				autoWrap: false,
				id,
				onTop: true,
				type: 'notification',
				preserveRatio: false,
				ratio: constants.TextBox.TextBoxWidth / constants.TextBox.TextBoxHeight,
				customColor: constants.Choices.ChoiceButtonColor,
				text: 'Click here to edit notification',
				backdrop: true,
			} as INotification,
		} as ICreateObjectMutation);
		return id;
	},
};

export type NotificationSimpleProperties = Exclude<
	keyof INotification,
	keyof IObject
>;

export interface ISetNotificationProperty<
	T extends NotificationSimpleProperties
> extends IObjectMutation {
	readonly key: T;
	readonly value: INotification[T];
}

export interface ICreateNotificationAction {
	readonly panelId: IPanel['id'];
}
