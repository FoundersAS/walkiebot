'use strict';
import '../../../stylesheets/attachments/fields.scss';

import classNames from 'classnames';
import React from 'react';
import emoji from '../../utils/emoji';

const Field = ({ short, title, value, parser }) => (
  <div className={classNames({
    'field': true,
    'field--long': !short
  })}>
    <div
      className='field__title'
      dangerouslySetInnerHTML={{ __html: emoji.toImage(title) }}
      />
    <div
      className='field__value'
      dangerouslySetInnerHTML={{ __html: parser(value) }}
      />
  </div>
);

const Fields = ({ fields, parser }) => (
  <div className='fields'>
    {fields.map((field, idx) => (
      <Field key={idx} parser={parser} {...field} />
    ))}
  </div>
);

export default Fields;
