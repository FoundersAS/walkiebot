'use strict';
import '../../../stylesheets/builder/inline-controls.scss';
import '../../../stylesheets/toggle.scss';
import classNames from 'classnames';
import React from 'react';
import AccordionWithInput from './AccordionWithInput';
import BuilderInput from '../Inputs/Input';
import ConfirmGroup from './Confirm';

const BuilderAction = ({
  attachmentId,
  action,
  actionId,
  changeHandler,
  onblurhandler,
  removeHandler,
  moveHandler,
  showUp,
  showDown
}) => {
  const changeName = e => changeHandler(attachmentId, actionId, ['name'], e.target.value);
  const changeText = e => changeHandler(attachmentId, actionId, ['text'], e.target.value);
  const changeValue = e => changeHandler(attachmentId, actionId, ['value'], e.target.value);

  return (
    <AccordionWithInput
      attachmentPlaceholder='Type button text...'
      attachmentType='button'
      showUp={showUp}
      showDown={showDown}
      onClickUp={() => moveHandler(attachmentId, actionId, -1)}
      onClickDown={() => moveHandler(attachmentId, actionId, 1)}
      onClickRemove={() => removeHandler(attachmentId, actionId)}
      onChange={e => {
        if (!action.name || action.name === action.text) changeName(e);
        if (!action.value || action.value === action.text) changeValue(e);
        changeText(e);
      }}
      onBlur={e => onblurhandler(attachmentId)}
      value={action.text}
    >
      <div className='inline-control-group inline-control-group--column'>
        <BuilderInput
          id={`name-${attachmentId}-${actionId}`}
          type='text'
          value={action.name}
          onChange={changeName}
          onBlur={e => onblurhandler(attachmentId)}
          label='Name'
          />

        <BuilderInput
          id={`value-${attachmentId}-${actionId}`}
          type='text'
          value={action.value}
          onChange={changeValue}
          onBlur={e => onblurhandler(attachmentId)}
          label='Value'
          />

        <div className='input-group'>
          <label className='input-group__label'>Style</label>

          <div className='toggle toggle--small'>
            <label
              htmlFor={`action-default-${attachmentId}-${actionId}`}
              className={classNames('toggle__toggler', {
                'toggle__toggler--set': action.style === 'default'
              })}
              >
              Default
              <input
                id={`action-default-${attachmentId}-${actionId}`}
                type='radio'
                onChange={e => changeHandler(attachmentId, actionId, ['style'], 'default')}
                onBlur={e => onblurhandler(attachmentId)}
                name={`radiogroup-${attachmentId}-${actionId}`}
                />
            </label>

            <label
              htmlFor={`action-primary-${attachmentId}-${actionId}`}
              className={classNames({
                'toggle__toggler': true,
                'toggle__toggler--set': action.style === 'primary'
              })}
              >
              Primary
              <input
                id={`action-primary-${attachmentId}-${actionId}`}
                type='radio'
                onChange={e => changeHandler(attachmentId, actionId, ['style'], 'primary')}
                onBlur={e => onblurhandler(attachmentId)}
                name={`radiogroup-${attachmentId}-${actionId}`}
                />
            </label>

            <label
              htmlFor={`action-danger-${attachmentId}-${actionId}`}
              className={classNames({
                'toggle__toggler': true,
                'toggle__toggler--set': action.style === 'danger'
              })}
              >
              Danger
              <input
                id={`action-danger-${attachmentId}-${actionId}`}
                type='radio'
                onChange={e => changeHandler(attachmentId, actionId, ['style'], 'danger')}
                onBlur={e => onblurhandler(attachmentId)}
                name={`radiogroup-${attachmentId}-${actionId}`}
                />
            </label>
          </div>
        </div>

        <ConfirmGroup
          confirmHash={action.confirm}
          attachmentId={attachmentId}
          actionId={actionId}
          changeHandler={changeHandler}
          onblurhandler={onblurhandler}
          />
      </div>
    </AccordionWithInput>
  );
};
export default BuilderAction;
