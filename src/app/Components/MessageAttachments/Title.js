'use strict';
import '../../../stylesheets/attachments/title.scss';

import React from 'react';
import emoji from '../../utils/emoji';

const TitleLink = ({ title, link }) => (
  <a
    className='title--link'
    target='_blank'
    href={link}
    dangerouslySetInnerHTML={{ __html: emoji.toImage(title) }}
    />
);

const Title = ({ title, link, caret }) => (
  link
  ? <div className='title'>
    <TitleLink title={title} link={link} />{' '}
    {caret}
  </div>
  : <div
    className='title'
    >
    <span dangerouslySetInnerHTML={{ __html: emoji.toImage(title) }} />{' '}
    {caret}
  </div>
);

export default Title;
