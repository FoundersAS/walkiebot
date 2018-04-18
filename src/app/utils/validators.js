'use strict';
import Joi from 'joi';

export const field = Joi.object({
  title: [Joi.string().allow(''), Joi.number()],
  value: [Joi.string().allow(''), Joi.number()],
  short: Joi.boolean().required()
});

export const option = Joi.object({
  text: Joi.string().required(),
  value: Joi.string().required(),
  description: Joi.string().allow('')
});

export const optionGroup = Joi.object({
  text: Joi.string().required(),
  options: Joi.array().items(option).min(1).required()
});

export const action = Joi.object({
  name: [Joi.string().required(), Joi.number().required()],
  text: [Joi.string().required(), Joi.number().required()],
  style: Joi.string().allow(''),
  type: Joi.string().required(),
  value: Joi.string().allow(''),
  confirm: [
    Joi.object({
      title: Joi.string().allow(''),
      text: [Joi.string().required(), Joi.number().required()],
      ok_text: Joi.string().allow(''),
      dismiss_text: Joi.string().allow('')
    }).requiredKeys('text'),
    null
  ],
  options: Joi.array().items(option).min(1).max(100),
  selected_options: Joi.array().items(option).min(1),
  option_groups: Joi.array().items(optionGroup).min(1),
  min_query_length: Joi.number(),
  data_source: Joi.string().allow(['static', 'users', 'channels', 'conversations', 'external', 'default'])
});

export const attachment = Joi.object({
  mrkdwn_in: Joi.array().items(Joi.string()),
  attachment_type: Joi.string().allow(''),
  callback_id: [Joi.string().allow(''), Joi.number()],
  pretext: [Joi.string().allow(''), Joi.number()],
  author_name: [Joi.string().allow(''), Joi.number()],
  author_subname: [Joi.string().allow(''), Joi.number()],
  author_link: Joi.string().allow(''),
  author_icon: Joi.string().allow(''),
  title: [Joi.string().allow(''), Joi.number()],
  title_link: Joi.string().allow(''),
  text: [Joi.string().allow(''), Joi.number(), null],
  fallback: [Joi.string().allow(''), Joi.number()],
  thumb_url: Joi.string().allow(''),
  image_url: Joi.string().allow(''),
  footer_icon: Joi.string().allow(''),
  footer: [Joi.string().allow(''), Joi.number()],
  ts: [Joi.string().valid(['NOW', 'now']), Joi.date().timestamp('unix')],
  fields: Joi.array().items(field),
  actions: Joi.array().items(action).max(5),
  color: [Joi.string().allow(['good', 'warning', 'danger']), Joi.string().hex()]
})
.with('actions', ['callback_id', 'attachment_type', 'fallback'])
.or([
  'pretext',
  'author_name',
  'title',
  'text',
  'thumb_url',
  'image_url',
  'footer',
  'fields',
  'actions'
]);

export const message = Joi.object({
  text: [Joi.string(), Joi.number(), null],
  attachments: Joi.array().items(attachment).max(20),
  response_type: Joi.string()
}).or('text', 'attachments');

export const dialogTextElement = Joi.object({
  label: Joi.string().required().max(24),
  name: Joi.string().required().max(300),
  type: Joi.string().required().allow(['text']),
  max_length: Joi.number().min(0).max(150),
  min_length: Joi.number().min(0).max(150),
  optional: Joi.boolean(),
  hint: Joi.string().allow('').max(150),
  subtype: Joi.string().allow(['email', 'number', 'tel', 'url', '']),
  value: Joi.string().allow('').max(500),
  placeholder: Joi.string().allow('').max(150)
});

export const dialogTextAreaElement = Joi.object({
  label: Joi.string().required().max(24),
  name: Joi.string().required().max(300),
  type: Joi.string().required().allow(['textarea']),
  max_length: Joi.number().min(0).max(500),
  min_length: Joi.number().min(0).max(500),
  optional: Joi.boolean(),
  hint: Joi.string().allow('').max(150),
  subtype: Joi.string().allow(['email', 'number', 'tel', 'url', '']),
  value: Joi.string().allow('').max(500),
  placeholder: Joi.string().allow('').max(150)
});

export const dialogSelectOptionElement = Joi.object({
  label: Joi.string().required().max(75),
  value: Joi.string().required().max(75)
});

export const dialogSelectElement = Joi.object({
  label: Joi.string().required().max(24),
  name: Joi.string().required().max(300),
  type: Joi.string().required().allow(['select']),
  optional: Joi.boolean(),
  hint: Joi.string().allow('').max(150),
  value: Joi.string().allow('').max(500),
  placeholder: Joi.string().allow('').max(150),
  options: Joi.array().required().items(dialogSelectOptionElement).max(100).min(1)
});

export const dialogElement = Joi.alternatives().try([dialogTextElement, dialogTextAreaElement, dialogSelectElement]);

export const dialog = Joi.object({
  title: Joi.string().required().max(24),
  callback_id: Joi.string().required(),
  elements: Joi.array().required().min(1).max(5),
  submit_label: Joi.string().required().max(24)
});

export const isNumber = i => typeof i === 'number' && !isNaN(i);
