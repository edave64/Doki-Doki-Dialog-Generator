import { ICommand } from '@/eventbus/command';
import { IObjectsState, ICreateObjectMutation, IObject } from '@/store/objects';
import { MutationTree, ActionTree } from 'vuex';
import { TextBoxWidth, TextBoxHeight } from '@/constants/textBox';
import { IRootState } from '..';
import {
	ChoiceButtonColor,
	ChoiceY,
	ChoiceButtonWidth,
} from '@/constants/choices';
import { screenHeight, screenWidth } from '@/constants/base';
import { ISetAutoWrappingMutation } from './textbox';

export interface INotification extends IObject {
	type: 'notification';
	customColor: string;
	text: string;
	backdrop: boolean;
	autoWrap: boolean;
}

export const notificationMutations: MutationTree<IObjectsState> = {
	setNotificationColor(state, command: ISetChoiceColorMutation) {
		const obj = state.objects[command.id] as INotification;
		obj.customColor = command.customColor;
		++obj.version;
	},
	setNotificationText(state, { id, text }: ISetNotificationTextMutation) {
		const obj = state.objects[id] as INotification;
		obj.text = text;
		++obj.version;
	},
	setNotificationBackdrop(
		state,
		{ id, backdrop }: ISetNotificationBackdropMutation
	) {
		const obj = state.objects[id] as INotification;
		obj.backdrop = backdrop;
		++obj.version;
	},
	setAutoWrapping(state, command: ISetAutoWrappingMutation) {
		const obj = state.objects[command.id] as INotification;
		obj.autoWrap = command.autoWrap;
		++obj.version;
	},
};

let lastNotificationId = 0;

export const notificationActions: ActionTree<IObjectsState, IRootState> = {
	createNotification(
		{ commit, rootState },
		command: ICreateNotificationAction
	): string {
		const id = 'notification_' + ++lastNotificationId;
		commit('create', {
			object: {
				x: screenWidth / 2,
				y: screenHeight / 2,
				width: ChoiceButtonWidth,
				height: 0,
				panelId: rootState.panels.currentPanel,
				flip: false,
				autoWrap: false,
				id,
				onTop: true,
				opacity: 100,
				type: 'notification',
				version: 0,
				preserveRatio: false,
				ratio: TextBoxWidth / TextBoxHeight,
				customColor: ChoiceButtonColor,
				text: 'Click here to edit notification',
				backdrop: true,
			} as INotification,
		} as ICreateObjectMutation);
		return id;
	},
};

export interface ISetNotificationTextMutation extends ICommand {
	readonly text: INotification['text'];
}

export interface ISetNotificationBackdropMutation extends ICommand {
	readonly backdrop: INotification['backdrop'];
}

export interface ISetChoiceColorMutation extends ICommand {
	readonly customColor: INotification['customColor'];
}

export interface ICreateNotificationAction extends ICommand {}
