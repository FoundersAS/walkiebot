'use strict';
import classNames from 'classnames';
import { connect } from 'react-redux';
import React from 'react';
import { ChromePicker } from 'react-color';
import Textarea from 'react-textarea-autosize';

import BuilderField from './Field';
import BuilderActions from './Action';
import BuilderActionSelect from './ActionSelect';
import BuilderActionSelectExternal from './ActionSelectExternal';
import BuilderActionSelectGroups from './ActionSelectGroups';
import BuilderActionSelectPrefilled from './ActionSelectPrefilled';
import BuilderInput from '../Inputs/Input';
import Accordion from './Accordion';
import AccordionCard from './AccordionCard';

import { DEFAULT_ATTACHMENT } from '../../redux/ducks/attachments';

const noop = () => {};

class BuilderAttachment extends React.Component {
  constructor (props) {
    super(props);

    this.toggleActionMenu = this.toggleActionMenu.bind(this);

    this.duplicateAttachment = this.duplicateAttachment.bind(this);
    this.removeAttachment = this.removeAttachment.bind(this);
    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);

    this.state = { showColorPicker: false, showActionMenu: false };
  }

  mapFieldsToView (field, idx) {
    return (
      <BuilderField
        key={idx}
        field={field}
        fieldId={idx}
        attachmentId={this.props.attachmentId}
        changeHandler={this.props.fieldChangeHandler}
        onblurhandler={this.props.onblurhandler || noop}
        removeHandler={this.props.removeField}
        moveHandler={this.props.moveField}
        showUp={idx !== 0}
        showDown={idx !== this.props.attachment.fields.length - 1}
        />
    );
  }

  mapActionsToView (action, idx) {
    if (action.type === 'button') {
      return (
        <BuilderActions
          key={idx}
          action={action}
          actionId={idx}
          attachmentId={this.props.attachmentId}
          changeHandler={this.props.actionChangeHandler}
          onblurhandler={this.props.onblurhandler || noop}
          removeHandler={this.props.removeAction}
          moveHandler={this.props.moveAction}
          showUp={idx !== 0}
          showDown={idx !== this.props.attachment.actions.length - 1}
          />
      );
    }

    if (action.option_groups) {
      return (
        <BuilderActionSelectGroups
          key={idx}
          action={action}
          actionId={idx}
          attachmentId={this.props.attachmentId}
          toggleActionSelectedOption={this.props.toggleActionSelectedOption}
          addGroupHandler={this.props.addActionSelectGroupsGroup}
          addOptionHandler={this.props.addActionSelectGroupsGroupOption}
          removeActionSelectGroupsGroupHandler={this.props.removeActionSelectGroupsGroup}
          removeActionSelectGroupsGroupOptionHandler={this.props.removeActionSelectGroupsGroupOption}
          changeHandler={this.props.actionChangeHandler}
          onblurhandler={this.props.onblurhandler || noop}
          removeHandler={this.props.removeAction}
          removeOptionHandler={this.props.removeActionSelectOption}
          moveHandler={this.props.moveAction}
          moveActionSelectGroupHandler={this.props.moveActionSelectGroup}
          moveActionSelectGroupOptionHandler={this.props.moveActionSelectGroupOption}
          showUp={idx !== 0}
          showDown={idx !== this.props.attachment.actions.length - 1}
          />
      );
    }

    if (['users', 'channels', 'conversations'].indexOf(action.data_source) > -1) {
      return (
        <BuilderActionSelectPrefilled
          key={idx}
          action={action}
          actionId={idx}
          attachmentId={this.props.attachmentId}
          addOptionHandler={this.props.addActionSelectPrefilledOption}
          changeHandler={this.props.actionChangeHandler}
          onblurhandler={this.props.onblurhandler || noop}
          removeHandler={this.props.removeAction}
          removeOptionHandler={this.props.removeActionSelectOption}
          moveHandler={this.props.moveAction}
          moveActionSelectOptionHandler={this.props.moveActionSelectOption}
          showUp={idx !== 0}
          showDown={idx !== this.props.attachment.actions.length - 1}
          />
      );
    }

    if (action.data_source === 'external') {
      return (
        <BuilderActionSelectExternal
          key={idx}
          action={action}
          actionId={idx}
          attachmentId={this.props.attachmentId}
          addOptionHandler={this.props.addActionSelectPrefilledOption}
          changeHandler={this.props.actionChangeHandler}
          onblurhandler={this.props.onblurhandler || noop}
          removeHandler={this.props.removeAction}
          removeOptionHandler={this.props.removeActionSelectOption}
          moveHandler={this.props.moveAction}
          moveActionSelectOptionHandler={this.props.moveActionSelectOption}
          showUp={idx !== 0}
          showDown={idx !== this.props.attachment.actions.length - 1}
          />
      );
    }

    return (
      <BuilderActionSelect
        key={idx}
        action={action}
        actionId={idx}
        attachmentId={this.props.attachmentId}
        toggleActionSelectedOption={this.props.toggleActionSelectedOption}
        addOptionHandler={this.props.addActionSelectOption}
        changeHandler={this.props.actionChangeHandler}
        onblurhandler={this.props.onblurhandler || noop}
        removeHandler={this.props.removeAction}
        removeOptionHandler={this.props.removeActionSelectOption}
        moveHandler={this.props.moveAction}
        moveActionSelectOptionHandler={this.props.moveActionSelectOption}
        showUp={idx !== 0}
        showDown={idx !== this.props.attachment.actions.length - 1}
        />
    );
  }

  toggleActionMenu () {
    this.setState({ showActionMenu: !this.state.showActionMenu });
  }

  render () {
    const {
      idx,
      addField,
      addAction,
      addActionSelectGroups,
      addActionSelectUsers,
      addActionSelectChannels,
      addActionSelectConversations,
      addActionSelect,
      attachment,
      attachmentId,
      changeHandler,
      removeAttachment,
      moveAttachment,
      showUp,
      showDown
    } = this.props;
    const onblurhandler = this.props.onblurhandler || noop;
    const prefillFallbackAndCallbackId = () => {
      if (!attachment.actions.length) {
        if (!attachment.fallback) {
          changeHandler(
            attachmentId,
            ['fallback'],
            'Pre-filled because you have actions in your attachment.'
          );
        }
        if (!attachment.callback_id) {
          changeHandler(
            attachmentId,
            ['callback_id'],
            'Pre-filled because you have actions in your attachment.'
          );
        }
      }
    };
    const colorPicker = (
      <div
        className='input-colorpicker input-colorpicker__container'
        >
        <ChromePicker
          color={attachment.color || DEFAULT_ATTACHMENT.color}
          onChange={(e) => changeHandler(attachmentId, ['color'], e.hex)}
          onBlur={() => onblurhandler(attachmentId)}
          />
      </div>
    );
    const addActionBtn = (
      <div
        className='builder__message-input--control'
        >
        <div
          className='builder__message-attachment-action btn btn--small btn--text-icon icon-plus'
          onClick={this.toggleActionMenu}
        >
          Add action
          {this.state.showActionMenu && (
            <div className='builder__message-attachment-options'>
              <div
                className='builder__message-attachment-options-backdrop'
                onClick={this.toggleActionMenu}
              />
              <div
                className='builder__message-attachment-option-item icon-message-menu'
                onClick={() => {
                  prefillFallbackAndCallbackId();
                  addActionSelect(attachmentId);
                }}
                >
                Message menu <span className='builder__message-attachment-option-item-type'>Normal</span>
              </div>

              <div
                className='builder__message-attachment-option-item icon-message-menu'
                onClick={() => {
                  prefillFallbackAndCallbackId();
                  addActionSelectGroups(attachmentId);
                }}
                >
                Message menu <span className='builder__message-attachment-option-item-type'>Groups</span>
              </div>

              <div
                className='builder__message-attachment-option-item icon-message-menu'
                onClick={() => {
                  prefillFallbackAndCallbackId();
                  addActionSelectUsers(attachmentId);
                }}
                >
                Message menu <span className='builder__message-attachment-option-item-type'>Users</span>
              </div>

              <div
                className='builder__message-attachment-option-item icon-message-menu'
                onClick={() => {
                  prefillFallbackAndCallbackId();
                  addActionSelectChannels(attachmentId);
                }}
                >
                Message menu <span className='builder__message-attachment-option-item-type'>Channels</span>
              </div>

              <div
                className='builder__message-attachment-option-item icon-message-menu'
                onClick={() => {
                  prefillFallbackAndCallbackId();
                  addActionSelectConversations(attachmentId);
                }}
                >
                Message menu <span className='builder__message-attachment-option-item-type'>Conversations</span>
              </div>

              <div
                className='builder__message-attachment-option-item icon-button'
                onClick={() => {
                  prefillFallbackAndCallbackId();
                  addAction(attachmentId);
                }}
                >
                Button
              </div>
            </div>
          )}
        </div>
      </div>
    );
    const upBtn = (
      <div
        className='btn btn--small btn--icon icon-arrow-up'
        onClick={this.moveUp}
        />
    );
    const downBtn = (
      <div
        className='btn btn--small btn--icon icon-arrow-down'
        onClick={this.moveDown}
        />
    );

    return (
      <div
        className={classNames({
          'builder__message-attachment': true,
          'input-colorpicker--show': this.state.showColorPicker
        })}>
        <div
          className='input-colorpicker__backdrop'
          onClick={(e) => this.setState({ showColorPicker: false })}
          />

        <div
          style={{ backgroundColor: attachment.color }}
          className='builder__message-attachment-color'
          />

        <AccordionCard
          open={attachment.attachmentId === 1}
          title={`Attachment #${attachment.attachmentId}`}
          actions={[
            (<div key={1} className='builder__message-header-action-group'>{showUp && upBtn}{showDown && downBtn}</div>),
            (<div key={2} className='btn btn--small btn--icon icon-stack-2' onClick={this.duplicateAttachment} />),
            (<div key={3} className='btn btn--small btn--icon icon-trash' onClick={this.removeAttachment} />)
          ]}
          activeProperties={[
            (
              attachment.pretext !== '' ||
              attachment.color !== ''
            ) && 'General',
            (
              attachment.author_name !== '' ||
              attachment.author_link !== '' ||
              attachment.author_icon !== ''
            ) && 'Author',
            (
              attachment.title !== '' ||
              attachment.title_link !== '' ||
              attachment.text !== '' ||
              attachment.fallback !== '' &&
              attachment.fallback !== 'Pre-filled because you have actions in your attachment.'
            ) && 'Message',
            (
              attachment.image_url !== '' ||
              attachment.thumb_url !== ''
            ) && 'Media',
            (
              attachment.fields.length > 0
            ) && 'Fields',
            (
              attachment.footer_icon !== '' ||
              attachment.footer !== '' ||
              attachment.ts !== ''
            ) && 'Footer',
            (
              attachment.actions.length > 0
            ) && 'Actions'
          ].filter(s => !!s)}
          >
          <div className='builder__message-attachment-content'>

            <Accordion
              title='General'
              notEmpty={attachment.pretext !== '' || attachment.color !== ''}
              attachmentList
              >
              <BuilderInput
                id='pretext'
                type='text'
                value={attachment.pretext}
                onChange={(e) => changeHandler(attachmentId, ['pretext'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                label='Pre-text'
              />
              <div className='input-group'>
                <label className='input-group__label' htmlFor='colorbar'>Colorbar</label>

                <div className='input-group__container'>
                  <div
                    className='input-colorpicker__placeholder'
                    onClick={() => this.setState({ showColorPicker: true })}
                    >
                    <div
                      className='input-colorpicker__color'
                      style={{
                        backgroundColor: attachment.color || DEFAULT_ATTACHMENT.color
                      }}
                      />
                    <div className='input-colorpicker__colorcode'>
                      {attachment.color || DEFAULT_ATTACHMENT.color}
                    </div>
                  </div>

                  {this.state.showColorPicker && colorPicker}
                </div>
              </div>
            </Accordion>

            <Accordion
              title='Author'
              notEmpty={attachment.author_name !== '' || attachment.author_link !== '' || attachment.author_icon !== ''}
              attachmentList
              >
              <BuilderInput
                id={`author-name-${idx}`}
                type='text'
                onChange={(e) => changeHandler(attachmentId, ['author_name'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                value={attachment.author_name}
                label='Name'
              />
              <BuilderInput
                id={`author-sub-name-${idx}`}
                type='text'
                onChange={(e) => changeHandler(attachmentId, ['author_subname'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                value={attachment.author_subname}
                label='Sub name'
              />
              <BuilderInput
                id={`author-link-${idx}`}
                type='url'
                value={attachment.author_link}
                onChange={(e) => changeHandler(attachmentId, ['author_link'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                label='Link'
              />
              <BuilderInput
                id={`author-icon-${idx}`}
                type='url'
                onChange={(e) => changeHandler(attachmentId, ['author_icon'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                value={attachment.author_icon}
                label='Avatar'
              />
            </Accordion>

            <Accordion
              title='Message'
              notEmpty={attachment.title !== '' ||
                    attachment.title_link !== '' ||
                    attachment.text !== '' ||
                    attachment.fallback !== '' &&
                    attachment.fallback !== 'Pre-filled because you have actions in your attachment.'}
              attachmentList
              >
              <BuilderInput
                id={`title-${idx}`}
                type='text'
                value={attachment.title}
                onChange={(e) => changeHandler(attachmentId, ['title'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                label='Title'
              />
              <BuilderInput
                id={`title-link-${idx}`}
                type='url'
                value={attachment.title_link}
                onChange={(e) => changeHandler(attachmentId, ['title_link'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                label='Title link'
              />
              <BuilderInput
                id={`message-${idx}`}
                type='textarea'
                value={attachment.text}
                onChange={(e) => changeHandler(attachmentId, ['text'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                label='Message'
              />
              <BuilderInput
                id={`fallback-${idx}`}
                type='textarea'
                value={attachment.fallback}
                onChange={(e) => changeHandler(attachmentId, ['fallback'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                label='Fallback'
              />
            </Accordion>

            <Accordion
              title='Media'
              notEmpty={attachment.image_url !== '' || attachment.thumb_url !== ''}
              attachmentList
              >
              <BuilderInput
                id={`image-url-${idx}`}
                type='url'
                onChange={(e) => changeHandler(attachmentId, ['image_url'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                value={attachment.image_url}
                label='Image'
                helptext='If a image is set the thumbnail will NOT be displayed.'
              />

              <BuilderInput
                id={`thumbnail-url-${idx}`}
                type='url'
                onChange={(e) => changeHandler(attachmentId, ['thumb_url'], e.target.value)}
                onBlur={() => onblurhandler(attachmentId)}
                value={attachment.thumb_url}
                label='Thumbnail'
              />
            </Accordion>

            <Accordion
              title='Fields'
              notEmpty={attachment.fields.length > 0}
              attachmentList
              >
              <div
                className='builder__message-attachment-fields'>
                {
                  attachment.fields.length > 0
                  ? attachment.fields.map(this.mapFieldsToView.bind(this))
                  : (<p className='accordion__description'>You can add multiple fields.</p>)
                }
              </div>
              <div className='builder__message-input--control'>
                <div
                  onClick={() => addField(attachmentId)}
                  className={classNames({
                    'builder__message-input': true,
                    'btn': true,
                    'btn--naked': true,
                    'btn--small': true
                  })}
                  >
                  + Add field
                </div>
              </div>
            </Accordion>

            <Accordion
              title='Footer'
              notEmpty={attachment.footer_icon !== '' || attachment.footer !== '' || attachment.ts !== ''}
              attachmentList
              >
                <BuilderInput
                  id={`footer-icon-${idx}`}
                  type='url'
                  onChange={(e) => changeHandler(attachmentId, ['footer_icon'], e.target.value)}
                  onBlur={onblurhandler}
                  value={attachment.footer_icon}
                  label='Image'
                  />

                <BuilderInput
                  id={`footer-${idx}`}
                  type='text'
                  value={attachment.footer}
                  onChange={(e) => changeHandler(attachmentId, ['footer'], e.target.value)}
                  onBlur={() => onblurhandler(attachmentId)}
                  label='Footer'
                  />

                <BuilderInput
                  id={`timestamp-${idx}`}
                  type='text'
                  value={attachment.ts}
                  onChange={(e) => changeHandler(attachmentId, ['ts'], e.target.value)}
                  onBlur={() => onblurhandler(attachmentId)}
                  label='Timestamp'
                  helptext='Unix timestamp or "NOW" Actions'
                  />
            </Accordion>

            <Accordion
              title='Actions'
              notEmpty={attachment.actions.length > 0}
              attachmentList
              >
              <div className='builder__message-attachment-actions'>
                {
                  attachment.actions.length > 0
                  ? attachment.actions.map(this.mapActionsToView.bind(this))
                  : (<p className='accordion__description'>You can add multiple action buttons.</p>)
                }
              </div>
              {attachment.actions.length < 5 && addActionBtn}
              {attachment.actions.length > 0 && (
                <BuilderInput
                  id={`callbackid-${idx}`}
                  type='text'
                  autoFocus={false}
                  value={attachment.callback_id}
                  onChange={(e) => changeHandler(attachmentId, ['callback_id'], e.target.value)}
                  onBlur={() => onblurhandler(attachmentId)}
                  label='Callback ID'
                  helptext='Callback IDs are required for messages with buttons'
                  />
              )}
            </Accordion>
          </div>
        </AccordionCard>
      </div>
    );
  }

  duplicateAttachment (e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.duplicateAttachment(this.props.attachmentId);
  }

  removeAttachment (e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.removeAttachment(this.props.attachmentId);
  }

  moveUp (e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.moveAttachment(this.props.attachmentId, -1);
  }

  moveDown (e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.moveAttachment(this.props.attachmentId, 1);
  }
}

export default connect()(BuilderAttachment);
