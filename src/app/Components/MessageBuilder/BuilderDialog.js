'use strict';
import '../../../stylesheets/builder-dialog.scss';

import classNames from 'classnames';
import { connect } from 'react-redux';
import React from 'react';

import Alert from '../Alert';
import Accordion from './Accordion';
import AccordionWithInput from './AccordionWithInput';
import BuilderInput from '../Inputs/Input';
import BuilderSwitch from '../Inputs/Switch';

import { getDialogValidationErrors } from '../../redux/selectors/dialog';
import {
  cancelEditMessage
} from '../../redux/ducks/stories';
import {
  resetDialog,
  updateValue,
  removeElement,
  moveElement,
  addTextElement,
  addTextAreaElement,
  addSelectElement,
  addSelectOptionElement
} from '../../redux/ducks/dialog';
import { closeBuilder } from '../../redux/ducks/builder';

const DialogInput = ({
  element,
  elementIdx,
  updateLabel,
  updatePlaceholder,
  updateValue,
  updateHint,
  updateSubtype,
  updateOptional,

  removeElement,
  moveUp,
  moveDown,
  showUp,
  showDown
}) => {
  return (
    <AccordionWithInput
      attachmentOption
      attachmentPlaceholder={`Type ${element.get('type')} label`}
      value={element.get('label')}
      onChange={updateLabel}
      onClickRemove={removeElement}
      onClickUp={moveUp}
      onClickDown={moveDown}
      showUp={showUp}
      showDown={showDown}
      >
      <div className='input-group input-group--flex'>
        <label className='input-group__label input-group__label--flex' htmlFor={`element-optional-${elementIdx}`}>Optional</label>
        <BuilderSwitch
          id={`element-optional-${elementIdx}`}
          checked={element.get('optional')}
          onChange={updateOptional}
          />
      </div>
      <DialogInputOption
        element={element}
        elementIdx={elementIdx}
        updatePlaceholder={updatePlaceholder}
        updateValue={updateValue}
        updateHint={updateHint}
        updateSubtype={updateSubtype}
        />
    </AccordionWithInput>
  );
};

const DialogInputOption = ({
  element,
  elementIdx,
  updatePlaceholder,
  updateValue,
  updateHint,
  updateSubtype
}) => {
  return (
    <div className='inline-control-group inline-control-group--column'>
      <BuilderInput
        id={`option-value-placeholder-${elementIdx}`}
        type='text'
        label='Placeholder'
        value={element.get('placeholder')}
        onChange={updatePlaceholder}
        />
      <BuilderInput
        id={`option-value-input-${elementIdx}`}
        type='text'
        label='Default value'
        value={element.get('value')}
        onChange={updateValue}
        />
      <BuilderInput
        id={`option-hint-input-${elementIdx}`}
        type='text'
        label='Hint text'
        value={element.get('hint')}
        onChange={updateHint}
        />
        <div className='toggle toggle--small'>
          {['Text', 'Url', 'Tel', 'Number', 'Email'].map(key => {
            const lowerKey = key.toLowerCase();
            return (
              <label
                key={key}
                htmlFor={`action-default-dialog-${elementIdx}-${key}`}
                className={classNames('toggle__toggler', {
                  'toggle__toggler--set': element.get('subtype') === lowerKey
                })}
                >
                {key}
                <input
                  id={`action-default-dialog-${elementIdx}-${key}`}
                  type='radio'
                  onChange={e => updateSubtype(lowerKey)}
                  name={`radiogroup-dialog-${elementIdx}`}
                  />
              </label>
            );
          })}
        </div>
    </div>
  );
};

const DialogSelect = ({
  element,
  elementIdx,
  updateLabel,

  addOption,
  updateOptionLabel,
  updateOptionValue,
  updateHint,
  updateOptional,

  moveOptionUp,
  moveOptionDown,
  removeOption,

  removeElement,
  moveUp,
  moveDown,
  showUp,
  showDown
}) => {
  return (
    <AccordionWithInput
      attachmentOption
      attachmentPlaceholder='Type Select label'
      value={element.get('label')}
      onChange={updateLabel}
      onClickRemove={removeElement}
      onClickUp={moveUp}
      onClickDown={moveDown}
      showUp={showUp}
      showDown={showDown}
      >
      <div className='input-group input-group--flex'>
        <label className='input-group__label input-group__label--flex' htmlFor={`element-optional-${elementIdx}`}>Optional</label>
        <BuilderSwitch
          id={`element-optional-${elementIdx}`}
          checked={element.get('optional')}
          onChange={updateOptional}
          />
      </div>
      <BuilderInput
        id={`option-hint-input-${elementIdx}`}
        type='text'
        label='Hint text'
        value={element.get('hint')}
        onChange={updateHint}
        />
      <label className='input-group__label'>Options</label>
      {element.get('options').map((option, idx) => {
        const updateValue = (e) => updateOptionValue(idx, e);
        const updateLabel = (e) => {
          if (option.get('value') === option.get('label')) updateValue(e);
          updateOptionLabel(idx, e);
        };
        const remove = () => removeOption(idx);
        const moveUp = () => moveOptionUp(idx, -1);
        const moveDown = () => moveOptionDown(idx, +1);
        const showUp = idx !== 0;
        const showDown = idx !== element.get('options').size - 1;

        return (
          <DialogSelectOption
            key={idx}
            option={option}
            optionIdx={idx}
            elementIdx={elementIdx}

            updateValue={updateValue}
            updateLabel={updateLabel}

            remove={remove}
            moveUp={moveUp}
            moveDown={moveDown}
            showUp={showUp}
            showDown={showDown}
            />
        );
      })}
      <div
        className='btn-as-input'
        onClick={addOption}
        >
        Add option...
      </div>
    </AccordionWithInput>
  );
};

const DialogSelectOption = ({
  option,
  optionIdx,
  elementIdx,

  updateValue,
  updateLabel,

  remove,
  moveUp,
  moveDown,
  showUp,
  showDown
}) => {
  return (
    <AccordionWithInput
      attachmentOption
      attachmentPlaceholder='Option text...'
      value={option.get('label')}
      onChange={updateLabel}
      onClickRemove={remove}
      onClickUp={moveUp}
      onClickDown={moveDown}
      showUp={showUp}
      showDown={showDown}
      >
      <div className='inline-control-group inline-control-group--column'>
        <BuilderInput
          id={`option-value-dialog-${elementIdx}-${optionIdx}`}
          type='text'
          label='Value'
          value={option.get('value')}
          onChange={updateValue}
          />
      </div>
    </AccordionWithInput>
  );
};

class BuilderDialog extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      showAddElementsMenu: false,
      showAlert: false
    };

    this.toggleAlert = this.toggleAlert.bind(this);

    this.mapElementsToView = this.mapElementsToView.bind(this);

    this.cancelAddElement = this.cancelAddElement.bind(this);
    this.openAddElementsMenu = this.openAddElementsMenu.bind(this);
    this.closeAddElementsMenu = this.closeAddElementsMenu.bind(this);
    this.toggleAddElementsMenu = this.toggleAddElementsMenu.bind(this);
  }

  render () {
    const {
      cancel,
      save,
      dialog,
      errors,
      updateTitle,
      updateSubmitLabel,
      updateCallbackId,
      addTextElement,
      addTextAreaElement,
      addSelectElement
    } = this.props;

    const addElementsBtn = (
      <div className='builder__message-input--control' >
        <div
          className='builder__message-attachment-dialog btn btn--xsmall btn--text-icon icon-plus'
          onClick={this.toggleAddElementsMenu}
          >
          Add element
          {this.state.showAddElementsMenu && (
            <div className='builder__message-attachment-options builder__message-attachment-options--small'>
              <div
                className='builder__message-attachment-options-backdrop'
                onClick={this.cancelAddElement}
              />
              <div
                className='builder__message-attachment-option-item icon-input'
                onClick={addTextElement}
                >
                Text
              </div>

              <div
                className='builder__message-attachment-option-item icon-textarea'
                onClick={addTextAreaElement}
                >
                Textarea
              </div>

              <div
                className='builder__message-attachment-option-item icon-message-menu'
                onClick={addSelectElement}
                >
                Select
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className='builder-dialog'>
        <div className='builder__message'>
          <div className='builder-dialog__header'>
            <div className='builder-dialog__header-headline'>
              Dialog builder
            </div>
          </div>

          <div>

            <div className='builder-dialog__content'>
              <div className='builder-dialog__dialog'>

                <Accordion
                  title='General'
                  notEmpty={dialog.get('title') || dialog.get('submit_label')}
                  attachmentList
                  open
                  >
                  <BuilderInput
                    id='dialog-title'
                    type='text'
                    value={dialog.get('title')}
                    onChange={updateTitle}
                    label='Title'
                    autoFocus={!dialog.get('title')}
                    />
                  <BuilderInput
                    id='submit-label'
                    type='text'
                    value={dialog.get('submit_label')}
                    onChange={updateSubmitLabel}
                    label='Submit label'
                    autoFocus={!dialog.get('submit_label')}
                    />
                  <BuilderInput
                    id='dialog-callback-id'
                    type='text'
                    value={dialog.get('callback_id')}
                    onChange={updateCallbackId}
                    label='Callback ID'
                    autoFocus={!dialog.get('callback_id')}
                    />
                </Accordion>

                <Accordion
                  title='Elements'
                  notEmpty={dialog.get('elements').size > 0}
                  open={dialog.get('elements').size > 0}
                  attachmentList
                  >
                  <div className='builder__message-attachment-actions'>
                    {
                      dialog.get('elements').size > 0
                      ? dialog.get('elements').map(this.mapElementsToView)
                      : (<p className='accordion__description'>You can add up to 5 elements.</p>)
                    }
                  </div>
                  {dialog.get('elements').size < 5 && addElementsBtn}
                </Accordion>
              </div>
            </div>

          </div>

        </div>
        <div className='builder__controls'>
          <Alert
            isGlobal={false}
            show={this.state.showAlert && !!errors.length}
            dismissable
            onClick={this.toggleAlert}
            title='Dialog validation error!'
            type='error'
            >
            <pre>
              {errors && errors.map((error, i) => (
                <div key={`error-${i}`}>{error}</div>
              ))}
            </pre>
          </Alert>

          {!!errors.length && (
            <div
              className='btn btn--small icon-alert-triangle btn--naked toggle-alert'
              onClick={this.toggleAlert}
              />
          )}

          <div
            className='btn btn--small'
            onClick={cancel}
            >
            Cancel
          </div>
          <div
            className='btn btn--small btn--primary'
            onClick={save}
            >
            Save
          </div>
        </div>
      </div>
    );
  }

  toggleAlert (e) {
    this.setState({ showAlert: !this.state.showAlert });
  }

  mapElementsToView (element, idx) {
    const { dialog } = this.props;
    const updateValue = e => this.props.updateValue(['elements', idx, 'value'], e);
    const updateLabel = e => {
      this.props.updateValue(['elements', idx, 'label'], e);
      this.props.updateValue(['elements', idx, 'name'], e);
    };
    const updateOptional = e => this.props.updateValueBool(['elements', idx, 'optional'], !element.get('optional'));
    const updatePlaceholder = e => this.props.updateValue(['elements', idx, 'placeholder'], e);
    const updateHint = e => this.props.updateValue(['elements', idx, 'hint'], e);
    const updateSubtype = key => this.props.updateValue(['elements', idx, 'subtype'], { target: { value: key } });
    const removeElement = () => this.props.removeElement(idx);
    const moveUp = () => this.props.moveElement(idx, dialog.get('elements').size, -1);
    const moveDown = () => this.props.moveElement(idx, dialog.get('elements').size, +1);

    const showUp = idx !== 0;
    const showDown = idx !== this.props.dialog.get('elements').size - 1;

    if (element.get('type') === 'select') {
      const addOption = () =>
        this.props.addSelectOptionElement(idx);
      const moveOption = (optionIdx, direction) =>
        this.props.moveOptionElement(idx, optionIdx, element.get('options').size, direction);
      const updateOptionLabel = (optionIdx, e) =>
        this.props.updateValue(['elements', idx, 'options', optionIdx, 'label'], e);
      const updateOptionValue = (optionIdx, e) =>
        this.props.updateValue(['elements', idx, 'options', optionIdx, 'value'], e);
      const removeOption = (optionIdx) =>
        this.props.removeSelectOptionElement(idx, optionIdx);

      return (
        <DialogSelect
          key={idx}
          element={element}
          elementIdx={idx}

          removeElement={removeElement}
          moveUp={moveUp}
          moveDown={moveDown}
          showUp={showUp}
          showDown={showDown}

          addOption={addOption}
          updateOptional={updateOptional}
          updateOptionLabel={updateOptionLabel}
          updateOptionValue={updateOptionValue}
          moveOptionUp={moveOption}
          moveOptionDown={moveOption}
          removeOption={removeOption}

          updateLabel={updateLabel}
          updatePlaceholder={updatePlaceholder}
          updateValue={updateValue}
          updateHint={updateHint}
          />
      );
    }
    if (element.get('type') === 'text') {
      return (
        <DialogInput
          key={idx}
          element={element}
          elementIdx={idx}

          removeElement={removeElement}
          moveUp={moveUp}
          moveDown={moveDown}
          showUp={showUp}
          showDown={showDown}

          updateOptional={updateOptional}
          updateLabel={updateLabel}
          updatePlaceholder={updatePlaceholder}
          updateValue={updateValue}
          updateHint={updateHint}
          updateSubtype={updateSubtype}
          />
      );
    }
    if (element.get('type') === 'textarea') {
      return (
        <DialogInput
          key={idx}
          element={element}
          elementIdx={idx}

          removeElement={removeElement}
          moveUp={moveUp}
          moveDown={moveDown}
          showUp={showUp}
          showDown={showDown}

          updateOptional={updateOptional}
          updateLabel={updateLabel}
          updatePlaceholder={updatePlaceholder}
          updateValue={updateValue}
          updateHint={updateHint}
          updateSubtype={updateSubtype}
          />
      );
    }
    return null;
  }

  cancelAddElement () {
    this.closeAddElementsMenu();
  }

  openAddElementsMenu () {
    this.setState({ showAddElementsMenu: true });
  }

  closeAddElementsMenu () {
    this.setState({ showAddElementsMenu: false });
  }

  toggleAddElementsMenu () {
    this.setState({ showAddElementsMenu: !this.state.showAddElementsMenu });
  }
}

const mapStateToProps = (state) => {
  return {
    dialog: state.dialog,
    errors: getDialogValidationErrors(state)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    cancel: () => {
      dispatch(closeBuilder());
      dispatch(resetDialog());
      dispatch(cancelEditMessage());
    },
    save: () => ownProps.save(),
    updateTitle: e =>
      dispatch(updateValue(['title'], e.target.value)),
    updateSubmitLabel: e =>
      dispatch(updateValue(['submit_label'], e.target.value)),
    updateCallbackId: e =>
      dispatch(updateValue(['callback_id'], e.target.value)),
    updateValue: (updatePath, e) =>
      dispatch(updateValue(updatePath, e.target.value)),
    updateValueBool: (updatePath, value) =>
      dispatch(updateValue(updatePath, value)),
    addTextElement: () =>
      dispatch(addTextElement()),
    addTextAreaElement: () =>
      dispatch(addTextAreaElement()),
    addSelectElement: () =>
      dispatch(addSelectElement()),
    addSelectOptionElement: (selectElementIdx) =>
      dispatch(addSelectOptionElement(selectElementIdx)),
    moveElement: (position, max, direction) => {
      const newPos = position + direction;
      if (newPos === -1) return;
      if (newPos > max) return;
      dispatch(moveElement([], position, newPos));
    },
    moveOptionElement: (selectPosition, position, max, direction) => {
      const newPos = position + direction;
      if (newPos === -1) return;
      if (newPos > max) return;
      dispatch(moveElement([selectPosition, 'options'], position, newPos));
    },
    removeElement: (elementIdx) =>
      dispatch(removeElement([elementIdx])),
    removeSelectOptionElement: (selectIdx, optionIdx) =>
      dispatch(removeElement([selectIdx, 'options', optionIdx]))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BuilderDialog);
