import React from 'react';
import BuilderInput from '../Inputs/Input';
import BuilderSwitch from '../Inputs/Switch';

import { DEFAULT_ACTION_CONFIRM } from '../../redux/ducks/attachments';

const ConfirmGroup = ({
  confirmHash,
  attachmentId,
  actionId,
  changeHandler,
  onblurhandler
}) => (
  <div>
    <div className='input-group input-group--flex'>
      <label className='input-group__label input-group__label--flex' htmlFor={`action-confirm-${attachmentId}-${actionId}`}>Confirmation</label>
      <BuilderSwitch
        id={`action-confirm-${attachmentId}-${actionId}`}
        checked={!!confirmHash}
        onChange={e => {
          const value = e.target.checked ? DEFAULT_ACTION_CONFIRM : null;
          changeHandler(attachmentId, actionId, ['confirm'], value);
        }}
        />
    </div>
    {!!confirmHash && (
      <div className='inline-control-group inline-control-group--column'>
        <BuilderInput
          id={`action-title-${attachmentId}-${actionId}`}
          type='text'
          value={confirmHash.title}
          onChange={e => changeHandler(attachmentId, actionId, ['confirm', 'title'], e.target.value)}
          onBlur={e => onblurhandler(attachmentId)}
          label='Title'
          />

        <BuilderInput
          id={`action-text-${attachmentId}-${actionId}`}
          type='text'
          value={confirmHash.text}
          onChange={e => changeHandler(attachmentId, actionId, ['confirm', 'text'], e.target.value)}
          onBlur={e => onblurhandler(attachmentId)}
          label='Text'
          />

        <BuilderInput
          id={`action-ok_text-${attachmentId}-${actionId}`}
          type='text'
          value={confirmHash.ok_text}
          onChange={e => changeHandler(attachmentId, actionId, ['confirm', 'ok_text'], e.target.value)}
          onBlur={e => onblurhandler(attachmentId)}
          label='Submit Text'
          />

        <BuilderInput
          id={`action-dismiss_text-${attachmentId}-${actionId}`}
          type='text'
          value={confirmHash.dismiss_text}
          onChange={e => changeHandler(attachmentId, actionId, ['confirm', 'dismiss_text'], e.target.value)}
          onBlur={e => onblurhandler(attachmentId)}
          label='Dismiss Text'
          />
      </div>
    )}
  </div>
);

export default ConfirmGroup;
