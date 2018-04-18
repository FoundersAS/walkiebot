'use strict';
import '../../../stylesheets/builder/inline-controls.scss';
import React from 'react';
import AccordionWithInput from './AccordionWithInput';
import ConfirmGroup from './Confirm';

const BuilderActionSelectExternal = ({
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
  const onBlur = e => onblurhandler(attachmentId);
  const moveUp = () => moveHandler(attachmentId, actionId, -1);
  const moveDown = () => moveHandler(attachmentId, actionId, 1);

  return (
    <AccordionWithInput
      attachmentPlaceholder='Type menu text...'
      attachmentType='external'
      hideDropdown
      openOnMount={false}
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

export default BuilderActionSelectExternal;
