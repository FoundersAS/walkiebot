'use strict';
import Imm from 'immutable';
import { createAction, handleActions } from 'redux-actions';

export const DEFAULT_DIALOG_FIELD_SELECT_OPTION = Imm.fromJS({
  value: '',
  label: ''
});
export const DEFAULT_DIALOG_FIELD_SELECT = Imm.fromJS({
  type: 'select',
  label: '',
  name: '',
  hint: '',
  optional: false,
  options: []
});
export const DEFAULT_DIALOG_FIELD_TEXT = Imm.fromJS({
  type: 'text',
  label: '',
  name: '',
  placeholder: '',
  value: '',
  hint: '',
  optional: false,
  subtype: 'text',
  min_length: 0,
  max_length: 150
});
export const DEFAULT_DIALOG_FIELD_TEXTAREA = Imm.fromJS({
  type: 'textarea',
  label: '',
  name: '',
  placeholder: '',
  value: '',
  hint: '',
  optional: false,
  subtype: 'text',
  min_length: 0,
  max_length: 500
});
export const DEFAULT_DIALOG = Imm.fromJS({
  callback_id: 'DIALOG_CALLBACK_ID',
  title: '',
  submit_label: 'Submit',
  elements: []
});

export const resetDialog = createAction('DIALOG_RESET');
export const loadDialog = createAction('DIALOG_LOAD', (dialog) => ({ dialog }));
export const updateValue = createAction('DIALOG_UPDATE_VALUE', (updatePath, value) => ({ updatePath, value }));
export const removeElement = createAction('DIALOG_REMOVE_ELEMENT', (elementPath) => ({ elementPath }));
export const moveElement = createAction('DIALOG_MOVE_ELEMENT_IN_DIALOG', (updatePath, oldPos, newPos) => ({ updatePath, oldPos, newPos }));
export const addTextElement = createAction('DIALOG_ADD_TEXT_ELEMENT');
export const addTextAreaElement = createAction('DIALOG_ADD_TEXTAREA_ELEMENT');
export const addSelectElement = createAction('DIALOG_ADD_SELECT_ELEMENT');
export const addSelectOptionElement = createAction('DIALOG_ADD_SELECT_OPTION', (selectElementIdx) => ({ selectElementIdx }));

export default handleActions({
  DIALOG_RESET: (state) => DEFAULT_DIALOG,
  DIALOG_LOAD: (state, { payload: { dialog } }) => Imm.fromJS(dialog),
  DIALOG_UPDATE_VALUE: (state, { payload: { updatePath, value } }) =>
    state.setIn(updatePath, value),
  DIALOG_REMOVE_ELEMENT: (state, { payload: { elementPath } }) =>
    state.deleteIn(['elements', ...elementPath]),
  DIALOG_MOVE_ELEMENT_IN_DIALOG: (state, { payload: { updatePath, oldPos, newPos } }) =>
    state.updateIn(['elements', ...updatePath], items =>
      items.delete(oldPos).insert(newPos, items.get(oldPos))),
  DIALOG_ADD_TEXT_ELEMENT: (state) =>
    state.update('elements', elements => elements.push(DEFAULT_DIALOG_FIELD_TEXT)),
  DIALOG_ADD_TEXTAREA_ELEMENT: (state) =>
    state.update('elements', elements => elements.push(DEFAULT_DIALOG_FIELD_TEXTAREA)),
  DIALOG_ADD_SELECT_ELEMENT: (state) =>
    state.update('elements', elements => elements.push(DEFAULT_DIALOG_FIELD_SELECT)),
  DIALOG_ADD_SELECT_OPTION: (state, { payload: { selectElementIdx } }) =>
    state.updateIn(['elements', selectElementIdx, 'options'], options => options.push(DEFAULT_DIALOG_FIELD_SELECT_OPTION))
}, DEFAULT_DIALOG);
