'use strict';
import moment from 'moment';
import omitEmpty from 'omit-empty';

const parseTs = (ts) => {
  if (!ts) return;
  if (ts === 'NOW') return moment().format('x');
  return moment(ts).format('x');
};

const mapAction = action => {
  const newAction = {
    name: action.name,
    text: action.text,
    type: 'button',
    style: action.style,
    value: action.value,
    confirm: action.confirm || {}
  };

  if (action.type === 'select') {
    delete newAction.style;

    const isPrefilledSelect = ['users', 'channels', 'conversations'].indexOf(action.data_source) >= 0;

    newAction.type = 'select';
    newAction.data_source = action.data_source;
    newAction.min_query_length = action.min_query_length;

    if (action.options && !isPrefilledSelect) {
      newAction.options = action.options;

      if (action._selectedOption !== null && !Array.isArray(action._selectedOption)) {
        newAction.selected_options = [action.options[action._selectedOption]];
      }
    }

    if (action.option_groups) {
      delete newAction.options;

      newAction.option_groups = action.option_groups;

      if (Array.isArray(action._selectedOption)) {
        const [ groupId, optionId ] = action._selectedOption;
        newAction.selected_options = [action.option_groups[groupId].options[optionId]];
      }
    }
  }

  return newAction;
};

export const slackExporter = (message) => {
  if (message.type === 'dialog') return message.slack;

  const result = {
    text: message.slack.text || null,
    attachments: message.slack.attachments && message.slack.attachments.map(a => (
      Object.assign(
        {},
        a,
        {
          title: a.title,
          author_name: a.author_name,
          pretext: a.pretext,
          text: a.text,
          // Leaving this commented out because not sure it's needed
          // thumb_url: a.text && a.thumb_url,
          fields: a.fields && a.fields.map(field => ({
            title: field.title,
            value: field.value,
            short: field.short
          })),
          actions: a.actions && a.actions.map(mapAction),
          footer: a.footer,
          ts: parseTs(a.ts),
          callback_id: a.callback_id
        }
      )
    ))
  };

  if (message.slack.ephemeral) result.response_type = 'ephemeral';
  if (message.slack.delete) result.delete_original = message.slack.delete;
  if (message.slack.replace) result.replace_original = message.slack.replace;

  if (result.attachments) {
    result.attachments.forEach(attachment => {
      delete attachment.storyId;
      delete attachment.id;
      delete attachment.attachmentId;
      delete attachment.lastUpdated;
    });
  }
  return omitEmpty(result);
};
