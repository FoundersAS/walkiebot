'use strict';
import { createAction, handleActions } from 'redux-actions';
import Imm from 'immutable';

export const addAttachment = createAction('ADD_ATTACHMENT');
export const duplicateAttachment = createAction(
  'DUPLICATE_ATTACHMENT',
  (attachmentId) => ({ attachmentId })
);

export const addField = createAction(
  'ADD_FIELD',
  (attachmentId) => ({ attachmentId })
);
export const removeField = createAction(
  'REMOVE_FIELD',
  (attachmentId, id) => ({ attachmentId, id })
);
export const addAction = createAction(
  'ADD_ACTION',
  (attachmentId) => ({ attachmentId })
);

export const toggleActionSelectedOption = createAction(
  'TOGGLE_ACTION_SELECTED_OPTION',
  (attachmentId, actionId, optionPath) => ({ attachmentId, actionId, optionPath })
);

export const addActionSelect = createAction(
  'ADD_ACTION_SELECT',
  (attachmentId) => ({ attachmentId })
);
export const addActionSelectOption = createAction(
  'ADD_ACTION_SELECT_OPTION',
  (attachmentId, id) => ({ attachmentId, id })
);
export const removeActionSelectOption = createAction(
  'REMOVE_ACTION_SELECT_OPTION',
  (attachmentId, actionId, optionId) => ({ attachmentId, actionId, optionId })
);

export const addActionSelectUsers = createAction(
  'ADD_ACTION_SELECT_USERS',
  (attachmentId, options) => ({ attachmentId, options })
);
export const addActionSelectChannels = createAction(
  'ADD_ACTION_SELECT_CHANNELS',
  (attachmentId, options) => ({ attachmentId, options })
);
export const addActionSelectConversations = createAction(
  'ADD_ACTION_SELECT_CONVERSATIONS',
  (attachmentId, options) => ({ attachmentId, options })
);
export const addActionSelectPrefilledOption = createAction(
  'ADD_ACTION_SELECT_PREFILLED_OPTION',
  (attachmentId, id) => ({ attachmentId, id })
);

export const addActionSelectGroups = createAction(
  'ADD_ACTION_SELECT_GROUPS',
  (attachmentId) => ({ attachmentId })
);
export const addActionSelectGroupsGroup = createAction(
  'ADD_ACTION_SELECT_GROUPS_GROUP',
  (attachmentId, actionId) => ({ attachmentId, actionId })
);
export const addActionSelectGroupsGroupOption = createAction(
  'ADD_ACTION_SELECT_GROUPS_GROUP_OPTION',
  (attachmentId, actionId, optionGroupId) => ({ attachmentId, actionId, optionGroupId })
);
export const removeActionSelectGroupsGroup = createAction(
  'REMOVE_ACTION_SELECT_GROUPS_GROUP',
  (attachmentId, actionId, groupId) => ({ attachmentId, actionId, groupId })
);
export const removeActionSelectGroupsGroupOption = createAction(
  'REMOVE_ACTION_SELECT_GROUPS_GROUP_OPTION',
  (attachmentId, actionId, groupId, optionId) => ({ attachmentId, actionId, groupId, optionId })
);

export const removeAction = createAction(
  'REMOVE_ACTION',
  (attachmentId, id) => ({ attachmentId, id })
);
export const removeAttachment = createAction(
  'REMOVE_ATTACHMENT',
  (id) => ({ id })
);
export const resetAttachments = createAction('RESET_ATTACHMENTS');
export const updateAttachmentObj = createAction(
  'UPDATE_ATTACHMENT_OBJ',
  (id, path, value) => ({ id, path, value })
);
export const updateField = createAction(
  'UPDATE_FIELD',
  (attachmentId, id, path, value) => ({ attachmentId, id, path, value })
);
export const updateAction = createAction(
  'UPDATE_ACTION',
  (attachmentId, id, path, value) => ({ attachmentId, id, path, value })
);
export const moveAttachment = createAction(
  'MOVE_ATTACHMENT',
  (oldPos, newPos) => ({ oldPos, newPos })
);
export const moveAction = createAction(
  'MOVE_ACTION',
  (attachmentId, oldPos, newPos) => ({ attachmentId, oldPos, newPos })
);
export const moveActionSelectionOption = createAction(
  'MOVE_ACTION_SELECT_OPTION',
  (attachmentId, actionId, oldPos, newPos) => ({ attachmentId, actionId, oldPos, newPos })
);
export const moveActionSelectGroup = createAction(
  'MOVE_ACTION_SELECT_GROUP',
  (attachmentId, actionId, oldPos, newPos) => ({ attachmentId, actionId, oldPos, newPos })
);
export const moveActionSelectGroupOption = createAction(
  'MOVE_ACTION_SELECT_GROUP_OPTION',
  (attachmentId, actionId, groupId, oldPos, newPos) => ({ attachmentId, actionId, groupId, oldPos, newPos })
);
export const moveField = createAction(
  'MOVE_FIELD',
  (attachmentId, oldPos, newPos) => ({ attachmentId, oldPos, newPos })
);
export const loadAttachments = createAction('LOAD_ATTACHMENTS');

export const DEFAULT_ATTACHMENT = {
  mrkdwn_in: ['text', 'pretext', 'fields'],
  attachment_type: 'default',
  callback_id: '',
  pretext: '',
  author_name: '',
  author_link: '',
  author_icon: '',
  title: '',
  title_link: '',
  text: '',
  fallback: '',
  thumb_url: '',
  image_url: '',
  footer_icon: '',
  footer: '',
  ts: '',
  fields: [],
  actions: [],
  color: '#d2dde1',
  lastUpdated: 0
};

export const DEFAULT_FIELD = {
  title: '',
  value: '',
  short: true
};

export const DEFAULT_ACTION = {
  text: 'Button text',
  name: 'Button text',
  value: 'Button text',
  style: 'default',
  type: 'button'
};

export const DEFAULT_ACTION_CONFIRM = {
  title: 'Confirmation Title',
  text: 'Confirmation Text',
  ok_text: 'Okay',
  dismiss_text: 'Cancel'
};

export const DEFAULT_ACTION_SELECT = {
  _selectedOption: null,
  text: 'Message menu text',
  name: 'Message menu text',
  value: 'Message menu text',
  type: 'select',
  data_source: 'static',
  options: []
};

export const DEFAULT_ACTION_SELECT_USERS = {
  text: 'Message menu w/ users',
  name: 'Message menu w/ users',
  type: 'select',
  data_source: 'users',
  options: []
};

export const DEFAULT_ACTION_SELECT_CHANNELS = {
  text: 'Message menu w/ channels',
  name: 'Message menu w/ channels',
  type: 'select',
  data_source: 'channels',
  options: []
};

export const DEFAULT_ACTION_SELECT_CONVERSATIONS = {
  text: 'Message menu w/ conversations',
  name: 'Message menu w/ conversations',
  type: 'select',
  data_source: 'conversations',
  options: []
};

export const DEFAULT_ACTION_SELECT_GROUP = {
  _selectedOption: null,
  text: 'Message menu w/ groups text',
  name: 'Message menu w/ groups text',
  value: 'Message menu w/ groups text',
  type: 'select',
  data_source: 'static',
  option_groups: []
};

export const DEFAULT_ACTION_SELECT_OPTION_GROUP = {
  text: 'Group text',
  options: []
};

export const DEFAULT_ACTION_SELECT_OPTION = {
  text: 'Option text',
  value: 'Option text',
  description: ''
};

export const DEFAULT_ACTION_SELECT_OPTION_PREFILLED = {
  text: 'Option text',
  value: 'Option text',
  active: true,
  type: 'user',
  url: '/static/illustrations/user-avatar--0.svg',
  emoji: ''
};

const getHighestId = ids => {
  const highest = Math.max.apply(Math, ids);
  if (highest === -Infinity) return 0;
  return highest;
};

export default handleActions({
  UPDATE_ATTACHMENT_OBJ: (state, { payload }) => {
    return Imm.fromJS(state)
      .update(payload.id, a => a.updateIn(payload.path, () => payload.value)
        .update('lastUpdated', () => Date.now()))
      .toJS();
  },
  ADD_ATTACHMENT: (state, { payload }) => {
    const nextId = getHighestId(state.map(a => a.attachmentId)) + 1;
    const attachment = Imm.fromJS(DEFAULT_ATTACHMENT).set('attachmentId', nextId);
    return Imm.fromJS(state)
      .push(attachment)
      .toJS();
  },
  DUPLICATE_ATTACHMENT: (state, { payload: { attachmentId } }) => {
    const nextId = getHighestId(state.map(a => a.attachmentId)) + 1;
    state = Imm.fromJS(state);
    const attachment = state.get(attachmentId).set('attachmentId', nextId);
    return state.push(attachment).toJS();
  },
  ADD_FIELD: (state, { payload }) => {
    const { attachmentId } = payload;
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'fields'], fields => fields.push(DEFAULT_FIELD))
      .toJS();
  },
  REMOVE_FIELD: (state, { payload }) => {
    return Imm.fromJS(state)
      .deleteIn([payload.attachmentId, 'fields', payload.id])
      .toJS();
  },
  UPDATE_FIELD: (state, { payload }) => {
    const { attachmentId, id, path, value } = payload;
    const updatePath = [attachmentId, 'fields', id].concat(path);
    return Imm.fromJS(state)
      .updateIn(updatePath, () => value)
      .toJS();
  },
  ADD_ACTION: (state, { payload }) => {
    const { attachmentId } = payload;
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions'], actions => actions.push(DEFAULT_ACTION))
      .toJS();
  },
  TOGGLE_ACTION_SELECTED_OPTION: (state, { payload }) => {
    const { attachmentId, actionId, optionPath } = payload;
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions', actionId, '_selectedOption'], selectedOption => {
        if (Imm.List.isList(selectedOption)) {
          if (selectedOption.get(0) === optionPath[0] && selectedOption.get(1) === optionPath[1]) {
            return null;
          }
        }
        if (selectedOption === optionPath) return null;
        return optionPath;
      })
      .toJS();
  },

  ADD_ACTION_SELECT_USERS: (state, { payload }) => {
    const { attachmentId, options } = payload;
    const action = Imm.fromJS(DEFAULT_ACTION_SELECT_USERS)
      .set('options', options);
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions'], actions => actions.push(action))
      .toJS();
  },
  ADD_ACTION_SELECT_CHANNELS: (state, { payload }) => {
    const { attachmentId, options } = payload;
    const action = Imm.fromJS(DEFAULT_ACTION_SELECT_CHANNELS)
      .set('options', options);
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions'], actions => actions.push(action))
      .toJS();
  },
  ADD_ACTION_SELECT_CONVERSATIONS: (state, { payload }) => {
    const { attachmentId, options } = payload;
    const action = Imm.fromJS(DEFAULT_ACTION_SELECT_CONVERSATIONS)
      .set('options', options);
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions'], actions => actions.push(action))
      .toJS();
  },
  ADD_ACTION_SELECT_PREFILLED_OPTION: (state, { payload }) => {
    const { attachmentId, id } = payload;
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions', id, 'options'], options => options.push(DEFAULT_ACTION_SELECT_OPTION_PREFILLED))
      .toJS();
  },

  ADD_ACTION_SELECT: (state, { payload }) => {
    const { attachmentId } = payload;
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions'], actions => actions.push(DEFAULT_ACTION_SELECT))
      .toJS();
  },
  ADD_ACTION_SELECT_OPTION: (state, { payload }) => {
    const { attachmentId, id } = payload;
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions', id, 'options'], options => options.push(DEFAULT_ACTION_SELECT_OPTION))
      .toJS();
  },
  REMOVE_ACTION_SELECT_OPTION: (state, { payload }) => {
    return Imm.fromJS(state)
      .deleteIn([payload.attachmentId, 'actions', payload.actionId, 'options', payload.optionId])
      .toJS();
  },

  ADD_ACTION_SELECT_GROUPS: (state, { payload }) => {
    const { attachmentId } = payload;
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions'], actions => actions.push(DEFAULT_ACTION_SELECT_GROUP))
      .toJS();
  },
  ADD_ACTION_SELECT_GROUPS_GROUP: (state, { payload }) => {
    const { attachmentId, actionId } = payload;
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions', actionId, 'option_groups'], groups => groups.push(DEFAULT_ACTION_SELECT_OPTION_GROUP))
      .toJS();
  },
  ADD_ACTION_SELECT_GROUPS_GROUP_OPTION: (state, { payload }) => {
    const { attachmentId, actionId, optionGroupId } = payload;
    return Imm.fromJS(state)
      .updateIn([attachmentId, 'actions', actionId, 'option_groups', optionGroupId, 'options'], options => options.push(DEFAULT_ACTION_SELECT_OPTION))
      .toJS();
  },
  REMOVE_ACTION_SELECT_GROUPS_GROUP: (state, { payload }) => {
    const { attachmentId, actionId, groupId } = payload;
    return Imm.fromJS(state)
      .deleteIn([attachmentId, 'actions', actionId, 'option_groups', groupId])
      .toJS();
  },
  REMOVE_ACTION_SELECT_GROUPS_GROUP_OPTION: (state, { payload }) => {
    const { attachmentId, actionId, groupId, optionId } = payload;
    return Imm.fromJS(state)
      .deleteIn([attachmentId, 'actions', actionId, 'option_groups', groupId, 'options', optionId])
      .toJS();
  },

  REMOVE_ACTION: (state, { payload }) => {
    return Imm.fromJS(state)
      .deleteIn([payload.attachmentId, 'actions', payload.id])
      .toJS();
  },
  UPDATE_ACTION: (state, { payload }) => {
    const { attachmentId, id, path, value } = payload;
    const updatePath = [attachmentId, 'actions', id].concat(path);
    return Imm.fromJS(state)
      .updateIn(updatePath, () => value)
      .toJS();
  },
  REMOVE_ATTACHMENT: (state, { payload }) => {
    return Imm.fromJS(state)
      .delete(payload.id)
      .toJS();
  },
  RESET_ATTACHMENTS: (state) => {
    return [];
  },
  LOAD_ATTACHMENTS: (state, { payload }) => {
    return [].concat(payload.map((a, idx) => {
      a.attachmentId = a.attachmentId || idx + 1;
      return a;
    }));
  },
  MOVE_ATTACHMENT: (state, { payload }) => {
    const { newPos, oldPos } = payload;
    return Imm.fromJS(state)
      .delete(oldPos)
      .insert(newPos, state[oldPos])
      .toJS();
  },
  MOVE_ACTION: (state, { payload }) => {
    const { attachmentId, newPos, oldPos } = payload;
    return Imm.fromJS(state)
      .update(attachmentId, attachment =>
        attachment.update('actions', actions =>
          actions
            .delete(oldPos)
            .insert(newPos, actions.get(oldPos))
        )
      )
      .toJS();
  },
  MOVE_ACTION_SELECT_OPTION: (state, { payload }) => {
    const { attachmentId, actionId, newPos, oldPos } = payload;
    return Imm.fromJS(state)
      .update(attachmentId, attachment =>
        attachment.updateIn(['actions', actionId, 'options'], options =>
          options
            .delete(oldPos)
            .insert(newPos, options.get(oldPos))
        )
      )
      .toJS();
  },
  MOVE_ACTION_SELECT_GROUP: (state, { payload }) => {
    const { attachmentId, actionId, newPos, oldPos } = payload;
    return Imm.fromJS(state)
      .update(attachmentId, attachment =>
        attachment.updateIn(['actions', actionId, 'option_groups'], optionGroups =>
          optionGroups
            .delete(oldPos)
            .insert(newPos, optionGroups.get(oldPos))
        )
      )
      .toJS();
  },
  MOVE_ACTION_SELECT_GROUP_OPTION: (state, { payload }) => {
    const { attachmentId, actionId, groupId, newPos, oldPos } = payload;
    return Imm.fromJS(state)
      .update(attachmentId, attachment =>
        attachment.updateIn(['actions', actionId, 'option_groups', groupId, 'options'], options =>
          options
            .delete(oldPos)
            .insert(newPos, options.get(oldPos))
        )
      )
      .toJS();
  },
  MOVE_FIELD: (state, { payload }) => {
    const { attachmentId, newPos, oldPos } = payload;
    return Imm.fromJS(state)
      .update(attachmentId, attachment =>
        attachment.update('fields', fields =>
          fields
            .delete(oldPos)
            .insert(newPos, fields.get(oldPos))
        )
      )
      .toJS();
  }
}, []);
