import { attachment as attachmentValidator } from '../../utils/validators';

export const getValidatedAttachments = state => {
  const { attachments } = state;

  const errors = attachments.map((attachment, idx) => {
    const validated = attachmentValidator.validate(attachment, { allowUnknown: true, abortEarly: false });
    if (validated.error && validated.error.details) {
      const result = validated.error.details
        .map(detail => {
          if (detail.type === 'object.missing') {
            if (detail.path === 'value') {
              return 'Attachment cannot be empty';
            }
          } else if (detail.type === 'object.with') {
            const { key, peer } = detail.context;
            return `Cannot create ${key} without ${peer}`;
          }
          return `Missing value for ${detail.context.key} in\n\`${detail.path}\``;
        });
      return { attachmentIdx: idx, errors: [...new Set(result)] };
    }
    return { attachmentIdx: idx, errors: [] };
  }).filter(validatedAttachment => !!validatedAttachment.errors.length);

  return {
    errors,
    attachments
  };
};
