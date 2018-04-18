'use strict';
import { createAction, handleActions } from 'redux-actions';

export const openBuilder = createAction('OPEN_BUILDER_ATTACHMENTS', (isBot) => {
  if (isBot === undefined) return { isBot: true };
  return { isBot };
});
export const openBuilderDialog = createAction('OPEN_BUILDER_DIALOG', (isBot) => {
  if (isBot === undefined) return { isBot: true };
  return { isBot };
});
export const closeBuilder = createAction('CLOSE_BUILDER', (isBot) => {
  if (isBot === undefined) return { isBot: true };
  return { isBot };
});

const DEFAULT_BUILDER = {
  open: false,
  isBot: false,
  isDialog: false,
  isAttachments: false,
  lastOpened: 0
};

export default handleActions({
  OPEN_BUILDER_ATTACHMENTS: (state, { payload: { isBot } }) =>
    ({
      open: true,
      isBot,
      isDialog: false,
      isAttachments: true,
      lastOpened: Date.now()
    }),
  OPEN_BUILDER_DIALOG: (state) =>
    ({
      open: true,
      isBot: true,
      isDialog: true,
      isAttachments: false,
      lastOpened: Date.now()
    }),
  CLOSE_BUILDER: (state) => DEFAULT_BUILDER
}, DEFAULT_BUILDER);
