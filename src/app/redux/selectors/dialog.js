import {
  dialog as dialogValidator,
  dialogTextElement as textElementValidator,
  dialogTextAreaElement as textAreaElementValidator,
  dialogSelectElement as selectElementValidator
} from '../../utils/validators';

const parseErrors = (validated, prefix = '') => {
  if (!validated.error) return [];
  if (!validated.error.details) return [];

  prefix = prefix && `${prefix} `;

  const result = validated.error.details
    .map(detail => {
      if (detail.type === 'object.missing') {
        if (detail.path === 'value') {
          return `${prefix}Dialog cannot be empty`;
        }
      } else if (detail.type === 'object.with') {
        const { key, peer } = detail.context;
        return `${prefix}Cannot create ${key} without ${peer}`;
      } else if (detail.type === 'array.min') {
        return `${prefix}\`${detail.path}\` must contain at least 1 item`;
      } else if (detail.type === 'string.max') {
        return `${prefix}\`${detail.path}\` ${detail.message.replace(`"${detail.path}" `, '')}`;
      }
      return `${prefix}Missing value for ${detail.context.key} in\n\`${detail.path}\``;
    });
  return [...new Set(result)];
};

export const getDialogValidationErrors = state => {
  const { dialog } = state;
  const jsDialog = dialog.toJS();
  const validatedDialog = dialogValidator.validate(jsDialog, { allowUnknown: true, abortEarly: false });
  const validatedElements = jsDialog.elements
    .map((element, idx) => {
      const validators = {
        text: textElementValidator,
        textarea: textAreaElementValidator,
        select: selectElementValidator
      };
      const validated = validators[element.type].validate(element, { allowUnknown: true, abortEarly: false });
      return parseErrors(validated, `Elements.${idx}`);
    });

  return [
    ...parseErrors(validatedDialog),
    ...[].concat(...validatedElements)
  ];
};
