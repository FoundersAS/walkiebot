'use strict';
import '../../../stylesheets/builder/inline-controls.scss';
import React from 'react';
import classNames from 'classnames';
import emojiRegex from 'emoji-regex';
import AccordionWithInput from './AccordionWithInput';
import ConfirmGroup from './Confirm';

const BuilderOption = ({
  attachmentId,
  optionId,
  actionId,
  option,
  type,
  changeHandler,
  removeHandler,
  moveHandler,
  onBlur,
  showUp,
  showDown
}) => {
  const changeText = e => {
    changeHandler(attachmentId, actionId, ['options', optionId, 'text'], e.target.value);
    changeHandler(attachmentId, actionId, ['options', optionId, 'value'], e.target.value);
  };

  const changeAvatar = e => {
    const { value } = e.target;
    if (emojiRegex().test(value)) {
      changeHandler(attachmentId, actionId, ['options', optionId, 'emoji'], value);
      changeHandler(attachmentId, actionId, ['options', optionId, 'url'], '');
      return;
    }
    changeHandler(attachmentId, actionId, ['options', optionId, 'emoji'], '');
    changeHandler(attachmentId, actionId, ['options', optionId, 'url'], value);
  };
  const changeType = e => changeHandler(attachmentId, actionId, ['options', optionId, 'type'], e.target.value);
  const changeActive = e => changeHandler(attachmentId, actionId, ['options', optionId, 'active'], e.target.checked);

  const removeOption = e => removeHandler(attachmentId, actionId, optionId);
  const moveUp = () => moveHandler(attachmentId, actionId, optionId, -1);
  const moveDown = () => moveHandler(attachmentId, actionId, optionId, 1);

  return (
    <AccordionWithInput
      attachmentPlaceholder='Menu option text...'
      attachmentOption
      showUp={showUp}
      showDown={showDown}
      onClickUp={moveUp}
      onClickDown={moveDown}
      onClickRemove={removeOption}
      onChange={changeText}
      onBlur={onBlur}
      value={option.text}
      type={option.type}
      userState={option.active}
      hideDropdown={type === 'channels'}
    >
      {type === 'conversations' && (
        <div className='input-group'>
          <label className='input-group__label'>Type</label>

          <div className='toggle toggle--small'>
            <label
              htmlFor={`option-type-${attachmentId}-${actionId}-${optionId}-channel`}
              className={classNames('toggle__toggler', {
                'toggle__toggler--set': option.type === 'channel'
              })}
              >
              Channel
              <input
                id={`option-type-${attachmentId}-${actionId}-${optionId}-channel`}
                type='radio'
                onChange={changeType}
                value='channel'
                name={`radiogroup-${attachmentId}-${actionId}-${optionId}`}
                />
            </label>

            <label
              htmlFor={`option-type-${attachmentId}-${actionId}-${optionId}-user`}
              className={classNames('toggle__toggler', {
                'toggle__toggler--set': option.type === 'user'
              })}
              >
              User
              <input
                id={`option-type-${attachmentId}-${actionId}-${optionId}-user`}
                type='radio'
                onChange={changeType}
                value='user'
                name={`radiogroup-${attachmentId}-${actionId}-${optionId}`}
                />
            </label>
          </div>
        </div>
      )}
      {option.type === 'user' && (
        <div className='inline-control-group inline-control-group--column'>
          <div className='input-group'>
            <label className='input-group__label' htmlFor={`option-active-${attachmentId}-${actionId}-${optionId}`}>Active</label>
            <input
              id={`option-active-${attachmentId}-${actionId}-${optionId}`}
              type='checkbox'
              checked={option.active}
              onChange={changeActive}
              className='input input-group__input'
              />
          </div>
        </div>
      )}
      {option.type === 'user' && (
        <div className='inline-control-group inline-control-group--column'>
          <div className='input-group'>
            <label className='input-group__label' htmlFor={`option-avatar-${attachmentId}-${actionId}-${optionId}`}>Avatar</label>
            <input
              id={`option-avatar-${attachmentId}-${actionId}-${optionId}`}
              type='text'
              value={option.url || option.emoji}
              onChange={changeAvatar}
              className='input input-group__input'
              />
          </div>
        </div>
      )}
    </AccordionWithInput>
  );
};

const BuilderActionSelectPrefilled = ({
  attachmentId,
  action,
  actionId,
  addOptionHandler,
  removeOptionHandler,
  changeHandler,
  onblurhandler,
  removeHandler,
  moveHandler,
  moveActionSelectOptionHandler,
  showUp,
  showDown
}) => {
  const changeName = e => {
    changeHandler(attachmentId, actionId, ['name'], e.target.value);
    changeHandler(attachmentId, actionId, ['text'], e.target.value);
    changeHandler(attachmentId, actionId, ['value'], e.target.value);
  };
  const addOption = e => {
    const newOptionId = action.options.length;
    addOptionHandler(attachmentId, actionId);
    if (action.data_source === 'channels') {
      changeHandler(attachmentId, actionId, ['options', newOptionId, 'type'], 'channel');
    }
  };
  const onBlur = e => onblurhandler(attachmentId);
  const moveUp = () => moveHandler(attachmentId, actionId, -1);
  const moveDown = () => moveHandler(attachmentId, actionId, 1);
  const menuType = action.data_source;

  return (
    <AccordionWithInput
      attachmentPlaceholder='Type menu text...'
      attachmentType={`${menuType}`}
      showUp={showUp}
      showDown={showDown}
      onClickUp={moveUp}
      onClickDown={moveDown}
      onClickRemove={() => removeHandler(attachmentId, actionId)}
      onChange={changeName}
      onBlur={onBlur}
      value={action.text}
      >
      <label className='input-group__label'>Options</label>
      {action.options.map((option, idx) => {
        return (
          <BuilderOption
            key={idx}
            attachmentId={attachmentId}
            type={menuType}
            actionId={actionId}
            optionId={idx}
            option={option}
            changeHandler={changeHandler}
            removeHandler={removeOptionHandler}
            moveHandler={moveActionSelectOptionHandler}
            onBlur={onBlur}
            showUp={idx !== 0}
            showDown={idx !== action.options.length - 1}
            />
        );
      })}
      <div
        className='btn-as-input'
        onClick={addOption}
        >
        Add option...
      </div>

      <ConfirmGroup
        confirmHash={action.confirm}
        attachmentId={attachmentId}
        actionId={actionId}
        changeHandler={changeHandler}
        onblurhandler={onblurhandler}
        />
    </AccordionWithInput>
  );
};

export default BuilderActionSelectPrefilled;
