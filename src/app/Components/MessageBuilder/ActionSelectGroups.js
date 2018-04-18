'use strict';
import '../../../stylesheets/builder/inline-controls.scss';
import React from 'react';
import AccordionWithInput from './AccordionWithInput';
import BuilderInput from '../Inputs/Input';
import BuilderSwitch from '../Inputs/Switch';
import ConfirmGroup from './Confirm';

const BuilderOption = ({
  attachmentId,
  actionId,
  groupId,
  optionId,
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
  const changeText = e => changeHandler(attachmentId, actionId, ['option_groups', groupId, 'options', optionId, 'text'], e.target.value);
  const changeValue = e => changeHandler(attachmentId, actionId, ['option_groups', groupId, 'options', optionId, 'value'], e.target.value);
  const changeDesc = e => changeHandler(attachmentId, actionId, ['option_groups', groupId, 'options', optionId, 'description'], e.target.value);
  const toggleSelectedOption = e => toggleSelected(attachmentId, actionId, [groupId, optionId]);
  const removeOption = e => removeHandler(attachmentId, actionId, groupId, optionId);
  const moveUp = () => moveHandler(attachmentId, actionId, groupId, optionId, -1);
  const moveDown = () => moveHandler(attachmentId, actionId, groupId, optionId, 1);

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
        <div className='input-group input-group--flex input-group--switch'>
          <label className='input-group__label input-group__label--flex' htmlFor={`option-selected-${attachmentId}-${actionId}-${optionId}`}>Selected</label>
          <BuilderSwitch
            id={`option-selected-${attachmentId}-${actionId}-${optionId}`}
            checked={selected}
            onChange={toggleSelectedOption}
            />
        </div>
        <BuilderInput
          id={`option-description-${attachmentId}-${actionId}-${optionId}`}
          type='text'
          value={option.description}
          onChange={changeDesc}
          onBlur={onBlur}
          label='Description'
          />
        <BuilderInput
          id={`option-value-${attachmentId}-${actionId}-${optionId}`}
          type='text'
          value={option.value}
          onChange={changeValue}
          onBlur={onBlur}
          label='Value'
          />
      </div>
    </AccordionWithInput>
  );
};

const BuilderGroup = ({
  attachmentId,
  group,
  actionId,
  groupId,
  selectedPath,
  toggleActionSelectedOption,
  addOptionHandler,
  removeOptionHandler,
  changeHandler,
  onBlur,
  removeHandler,
  moveHandler,
  removeActionSelectOptionHandler,
  moveActionSelectOptionHandler,
  showUp,
  showDown
}) => {
  const addGroupOption = e => addOptionHandler(attachmentId, actionId, groupId);
  const changeText = e => changeHandler(attachmentId, actionId, ['option_groups', groupId, 'text'], e.target.value);
  const moveUp = () => moveHandler(attachmentId, actionId, groupId, -1);
  const moveDown = () => moveHandler(attachmentId, actionId, groupId, 1);

  return (
    <AccordionWithInput
      attachmentPlaceholder='Type group name...'
      openOnMount={group.options.length === 0}
      showUp={showUp}
      showDown={showDown}
      onClickUp={moveUp}
      onClickDown={moveDown}
      onClickRemove={() => removeHandler(attachmentId, actionId, groupId)}
      onChange={changeText}
      onBlur={onBlur}
      value={group.text}
      >
      <label className='input-group__label'>Options</label>
      {group.options.map((option, idx) => {
        return (
          <BuilderOption
            key={idx}
            attachmentId={attachmentId}
            actionId={actionId}
            groupId={groupId}
            optionId={idx}
            selected={Array.isArray(selectedPath) && (selectedPath[0] === groupId && selectedPath[1] === idx)}
            toggleSelected={toggleActionSelectedOption}
            option={option}
            changeHandler={changeHandler}
            removeHandler={removeOptionHandler}
            moveHandler={moveActionSelectOptionHandler}
            onBlur={onBlur}
            showUp={idx !== 0}
            showDown={idx !== group.options.length - 1}
            />
        );
      })}
      <div
        className='btn-as-input'
        onClick={addGroupOption}
        >
        Add option...
      </div>
    </AccordionWithInput>
  );
};

const BuilderActionSelectGroups = ({
  attachmentId,
  action,
  actionId,
  toggleActionSelectedOption,
  addGroupHandler,
  addOptionHandler,
  removeActionSelectGroupsGroupHandler,
  removeActionSelectGroupsGroupOptionHandler,
  changeHandler,
  onblurhandler,
  removeHandler,
  moveHandler,
  moveActionSelectGroupHandler,
  moveActionSelectGroupOptionHandler,
  showUp,
  showDown
}) => {
  const changeName = e => changeHandler(attachmentId, actionId, ['name'], e.target.value);
  const changeText = e => changeHandler(attachmentId, actionId, ['text'], e.target.value);
  const changeValue = e => changeHandler(attachmentId, actionId, ['value'], e.target.value);
  const addGroup = e => addGroupHandler(attachmentId, actionId);
  const onBlur = e => onblurhandler(attachmentId);
  const moveUp = () => moveHandler(attachmentId, actionId, -1);
  const moveDown = () => moveHandler(attachmentId, actionId, 1);

  return (
    <AccordionWithInput
      attachmentPlaceholder='Type menu text...'
      attachmentType='groups'
      openOnMount={action.option_groups.length === 0}
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
      <label className='input-group__label'>Groups</label>
      {action.option_groups.map((group, idx) => {
        return (
          <BuilderGroup
            key={idx}
            attachmentId={attachmentId}
            actionId={actionId}
            groupId={idx}
            group={group}
            selectedPath={action._selectedOption}
            toggleActionSelectedOption={toggleActionSelectedOption}
            addOptionHandler={addOptionHandler}
            changeHandler={changeHandler}
            removeHandler={removeActionSelectGroupsGroupHandler}
            removeOptionHandler={removeActionSelectGroupsGroupOptionHandler}
            moveHandler={moveActionSelectGroupHandler}
            moveActionSelectOptionHandler={moveActionSelectGroupOptionHandler}
            onBlur={onBlur}
            showUp={idx !== 0}
            showDown={idx !== action.option_groups.length - 1}
            />
        );
      })}
      <div
        className='btn-as-input'
        onClick={addGroup}
        >
        Add group...
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

export default BuilderActionSelectGroups;
