'use strict';
import classNames from 'classnames';
import React from 'react';
import scrollIntoView from 'scroll-into-view';
import omitEmpty from 'omit-empty';
import Actions from './Actions';
import Author from './Author';
import Footer from './Footer';
import Fields from './Fields';
import Title from './Title';
import Image from './Image';
import ImageCaret from './ImageCaret';

class Attachment extends React.Component {
  constructor (props) {
    super(props);

    this.toggleImageCaret = this.toggleImageCaret.bind(this);
    this.isAttachmentEmpty = this.isAttachmentEmpty.bind(this);

    this.state = { imageCaretOpen: true };
  }

  componentDidUpdate () {
    if (this.props.editingMessageId !== this.props.messageIdx) return;
    if (this.props.attachmentId !== this.props.mostRecentlyEditedAttachmentId) return;
    if ((Date.now() - this.props.lastOpenedBuilder) < 1000) return;

    if (this._lastScrolled && (Date.now() - this._lastScrolled < 5000)) return;
    this._lastScrolled = Date.now();
    scrollIntoView(this._attachment);
  }

  componentWillUnmount () {
    clearTimeout(this._scrollTimeout);
  }

  render () {
    const isEmpty = this.isAttachmentEmpty();
    if (isEmpty) return null;

    const {
      messageId,
      messageIdx,
      attachmentId,
      ephemeral,
      attachment,

      unfurls,

      triggers,
      handleTriggers,

      openMenuAttachmentIdx,
      openMenuMessageIdx,
      openMenuIdx,
      openMenuUpwards,

      openActionModal,
      openDialogModal,
      parser,
      showAttachment
    } = this.props;

    const imageSize = unfurls && unfurls[attachment.image_url] && unfurls[attachment.image_url].size;

    let showCaretInImage = false;
    let showCaretInTitle = false;
    let showCaretInFooter = false;
    let showCaretInAuthor = false;
    let showCaretInText = false;

    if (attachment.image_url) {
      showCaretInImage = true;
      showCaretInTitle = false;
      showCaretInFooter = false;
      showCaretInAuthor = false;
      showCaretInText = false;
    }
    if (attachment.author_name && attachment.fields.length === 0) {
      showCaretInImage = false;
      showCaretInTitle = false;
      showCaretInFooter = false;
      showCaretInAuthor = true;
      showCaretInText = false;
    }
    if (attachment.title && attachment.fields.length === 0) {
      showCaretInImage = false;
      showCaretInTitle = true;
      showCaretInFooter = false;
      showCaretInAuthor = false;
      showCaretInText = false;
    }
    if (attachment.text && attachment.fields.length === 0) {
      showCaretInImage = false;
      showCaretInTitle = false;
      showCaretInFooter = false;
      showCaretInAuthor = false;
      showCaretInText = true;
    }
    if (attachment.ts || attachment.footer) {
      showCaretInImage = false;
      showCaretInTitle = false;
      showCaretInFooter = true;
      showCaretInAuthor = false;
      showCaretInText = false;
    }
    if (!attachment.image_url) {
      showCaretInImage = false;
      showCaretInTitle = false;
      showCaretInFooter = false;
      showCaretInAuthor = false;
      showCaretInText = false;
    }

    const imageCaretComponent = (
      <ImageCaret
        size={imageSize}
        onClick={this.toggleImageCaret}
        open={this.state.imageCaretOpen}
        block={showCaretInImage}
        />
    );

    return (
      <div
        ref={el => { this._attachment = el; }}
        className={classNames('message__attachment', {
          'message__attachment--ephemeral': ephemeral
        })}
        >
        {attachment.pretext && (
          <div
            className='message__attachment-pretext'
            dangerouslySetInnerHTML={{ __html: attachment.pretext && parser(attachment.pretext) }}
            />
        )}
        <div className={classNames('message__attachment-content', {
          'hidden': !showAttachment
        })}>
          <span
            style={
              attachment.color.indexOf('#') > -1
              ? { backgroundColor: attachment.color }
              : {}
            }
            className={classNames('message__attachment-spacer', {
              'message__attachment-spacer--good': attachment.color === 'good',
              'message__attachment-spacer--warning': attachment.color === 'warning',
              'message__attachment-spacer--danger': attachment.color === 'danger'
            })}>
          </span>

          <div
            className={classNames('message__attachment-wrap', {
              'message__attachment-wrap--flush-text': (attachment.text.length === 0 && attachment.author_name.length === 0 && attachment.fields.length === 0)
            })}>
            {!!attachment.author_name && (
              <Author
                name={attachment.author_name}
                subname={attachment.author_subname}
                link={attachment.author_link}
                icon={attachment.author_icon}
                caret={showCaretInAuthor && imageCaretComponent}
                />
            )}
            {!!attachment.title && (
              <Title title={attachment.title} link={attachment.title_link} caret={showCaretInTitle && imageCaretComponent} />
            )}
            {!!attachment.text && (
              <div className='message__attachment-text'>
                <span dangerouslySetInnerHTML={{ __html: parser(attachment.text) }} />{' '}
                {showCaretInText && imageCaretComponent}
              </div>
            )}
            {attachment.fields.length > 0 && (
              <Fields fields={attachment.fields} parser={parser} />
            )}
            {(attachment.ts || attachment.footer) && (
              <Footer
                icon={attachment.footer_icon}
                footer={attachment.footer}
                ts={attachment.ts}
                parser={parser}
                caret={showCaretInFooter && imageCaretComponent}
                />
            )}
            {attachment.image_url && (
              <Image
                url={attachment.image_url}
                hidden={!this.state.imageCaretOpen}
                caret={showCaretInImage && imageCaretComponent}
                />
            )}
            {attachment.actions.length > 0 && (
              <Actions
                attachmentIdx={attachmentId}
                messageId={messageId}
                messageIdx={messageIdx}

                triggers={triggers}
                handleTriggers={handleTriggers}

                openMenuAttachmentIdx={openMenuAttachmentIdx}
                openMenuMessageIdx={openMenuMessageIdx}
                openMenuIdx={openMenuIdx}
                openMenuUpwards={openMenuUpwards}
                toggleMessageMenu={this.props.toggleMessageMenu}
                cancelMessageMenu={this.props.cancelMessageMenu}

                openActionModal={openActionModal}
                openDialogModal={openDialogModal}
                actions={attachment.actions}
                scrollMessageListDelta={this.props.scrollMessageListDelta}
                />
            )}
          </div>
          {
            attachment.thumb_url
            ? <div className={classNames('message__attachment-image message__attachment-image--thumb', {
              'hidden': !!attachment.image_url
            })}>
              {
                attachment.title_link
                ? (
                  <a
                    href={attachment.title_link} target='_blank'
                    style={{ backgroundImage: `url(${attachment.thumb_url})` }}
                    className='message__attachment-image-wrap'>
                    <img src={attachment.thumb_url} />
                  </a>
                  )
                : (
                  <div
                    className='message__attachment-image-wrap'
                    style={{ backgroundImage: `url(${attachment.thumb_url})` }}
                    >
                    <img src={attachment.thumb_url} />
                  </div>
                )
              }
            </div>
            : null
          }
        </div>
      </div>
    );
  }

  toggleImageCaret (e) {
    this.setState({ imageCaretOpen: !this.state.imageCaretOpen });
  }

  isAttachmentEmpty () {
    // Check to see if an attachment is empty, but removing all "empty-ish"
    // properties, then remove the base ones and see if there are any left.
    const emptyAttachmentCheck = omitEmpty(this.props.attachment);

    delete emptyAttachmentCheck.callback_id;
    delete emptyAttachmentCheck.attachmentId;
    delete emptyAttachmentCheck.attachment_type;
    delete emptyAttachmentCheck.color;
    delete emptyAttachmentCheck.lastUpdated;
    delete emptyAttachmentCheck.mrkdwn_in;

    const isEmpty = !Object.keys(emptyAttachmentCheck).length;
    return isEmpty;
  }
}

export default Attachment;
