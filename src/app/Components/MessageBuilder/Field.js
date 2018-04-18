'use strict';
import '../../../stylesheets/builder/inline-controls.scss';

import classNames from 'classnames';
import React from 'react';
import Textarea from 'react-textarea-autosize';
import AccordionWithInput from './AccordionWithInput';

const BuilderField = ({
  field,
  fieldId,
  attachmentId,
  changeHandler,
  onblurhandler,
  removeHandler,
  moveHandler,
  showUp,
  showDown
}) => {
  return (
    <AccordionWithInput
      attachmentPlaceholder='Type field title...'
      showUp={showUp}
      showDown={showDown}
      onClickUp={() => moveHandler(attachmentId, fieldId, -1)}
      onClickDown={() => moveHandler(attachmentId, fieldId, 1)}
      onClickRemove={() => removeHandler(attachmentId, fieldId)}
      onChange={e => changeHandler(attachmentId, fieldId, ['title'], e.target.value)}
      onBlur={e => onblurhandler(attachmentId)}
      value={field.title}
      >
      <div className='inline-control-group inline-control-group--column'>
        <div className='input-group'>
          <label className='input-group__label' htmlFor={`value-${attachmentId}-${fieldId}`}>Value</label>
          <Textarea
            id={`value-${attachmentId}-${fieldId}`}
            className='input input-group__input'
            placeholder='Value'
            onChange={e => changeHandler(attachmentId, fieldId, ['value'], e.target.value)}
            onBlur={() => onblurhandler(attachmentId)}
            value={field.value}
            />
        </div>

        <div className='input-group'>
          <label className='input-group__label'>Type</label>
          <div className='toggle'>
            <label
              htmlFor={`short-${attachmentId}-${fieldId}`}
              className={classNames({
                'toggle__toggler': true,
                'toggle__toggler--set': field.short
              })}
            >Short
              <input
                id={`short-${attachmentId}-${fieldId}`}
                type='radio'
                onChange={e => changeHandler(attachmentId, fieldId, ['short'], true)}
                onBlur={() => onblurhandler(attachmentId)}
                name={`radiogroup-${fieldId}`}
                />
            </label>

            <label
              htmlFor={`long-${attachmentId}-${fieldId}`}
              className={classNames({
                'toggle__toggler': true,
                'toggle__toggler--set': !field.short
              })}
              >Long
              <input
                id={`long-${attachmentId}-${fieldId}`}
                type='radio'
                onChange={e => changeHandler(attachmentId, fieldId, ['short'], false)}
                onBlur={() => onblurhandler(attachmentId)}
                name={`radiogroup-${fieldId}`}
                />
            </label>
          </div>
        </div>

      </div>
    </AccordionWithInput>
  );
};

export default BuilderField;
