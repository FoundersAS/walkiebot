'use strict';
import '../../../stylesheets/builder/inline-controls.scss';
import React from 'react';
import AccordionWithInput from './AccordionWithInput';
import ConfirmGroup from './Confirm';

const BuilderOption = ({
  attachmentId,
  optionId,
  actionId,
  option,
  selected,
  toggleSelected,
  changeHandler,
  removeHandler,
  moveHandler,
  onBlur,
  showUp,
  showDown
}) => {
  const changeText = e => changeHandler(attachmentId, actionId, ['options', optionId, 'text'], e.target.value);
  const changeValue = e => changeHandler(attachmentId, actionId, ['options', optionId, 'value'], e.target.value);
  const changeDesc = e => changeHandler(attachmentId, actionId, ['options', optionId, 'description'], e.target.value);
  const toggleSelectedOption = e => toggleSelected(attachmentId, actionId, optionId);
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
      onChange={e => {
        if (!option.value || option.value === option.text) changeValue(e);
        changeText(e);
      }}
      onBlur={onBlur}
      value={option.text}
    >
      <div className='inline-control-group inline-control-group--column'>
        <div className='input-group'>
          <label className='input-group__label' htmlFor={`option-selected-${attachmentId}-${actionId}-${optionId}`}>Selected</label>
          <input
            id={`option-selected-${attachmentId}-${actionId}-${optionId}`}
            type='checkbox'
            checked={selected}
            onChange={toggleSelectedOption}
            className='input input-group__input'
            />
        </div>
      </div>
      <div className='inline-control-group inline-control-group--column'>
        <div className='input-group'>
          <label className='input-group__label' htmlFor={`option-description-${attachmentId}-${actionId}-${optionId}`}>Description</label>
          <input
            id={`option-description-${attachmentId}-${actionId}-${optionId}`}
            type='text'
            value={option.description}
            onChange={changeDesc}
            onBlur={onBlur}
            placeholder='Add description...'
            className='input input-group__input'
            />
        </div>
      </div>
      <div className='inline-control-group inline-control-group--column'>
        <div className='input-group'>
          <label className='input-group__label' htmlFor={`option-value-${attachmentId}-${actionId}-${optionId}`}>Value</label>
          <input
            id={`option-value-${attachmentId}-${actionId}-${optionId}`}
            type='text'
            value={option.value}
            onChange={changeValue}
            onBlur={onBlur}
            placeholder='Add value...'
            className='input input-group__input'
            />
        </div>
      </div>
    </AccordionWithInput>
  );
};

const BuilderActionSelect = ({
  attachmentId,
  action,
  actionId,
  toggleActionSelectedOption,
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
  const changeName = e => changeHandler(attachmentId, actionId, ['name'], e.target.value);
  const changeText = e => changeHandler(attachmentId, actionId, ['text'], e.target.value);
  const changeValue = e => changeHandler(attachmentId, actionId, ['value'], e.target.value);
  const addOption = e => addOptionHandler(attachmentId, actionId);
  const onBlur = e => onblurhandler(attachmentId);
  const moveUp = () => moveHandler(attachmentId, actionId, -1);
  const moveDown = () => moveHandler(attachmentId, actionId, 1);

  return (
    <AccordionWithInput
      attachmentPlaceholder='Type menu text...'
      attachmentType='normal'
      openOnMount={!!action.options && action.options.length === 0}
      showUp={showUp}
      showDown={showDown}
      onClickUp={moveUp}
      onClickDown={moveDown}
      onClickRemove={() => removeHandler(attachmentId, actionId)}
      onChange={e => {
        if (!action.name || action.name === action.text) changeName(e);
        if (!action.value || action.value === action.text) changeValue(e);
        changeText(e);
      }}
      onBlur={onBlur}
      value={action.text}
      >
      <label className='input-group__label'>Options</label>
      {action.options.map((option, idx) => {
        return (
          <BuilderOption
            key={idx}
            attachmentId={attachmentId}
            actionId={actionId}
            optionId={idx}
            option={option}
            selected={action._selectedOption === idx}
            toggleSelected={toggleActionSelectedOption}
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

export default BuilderActionSelect;
