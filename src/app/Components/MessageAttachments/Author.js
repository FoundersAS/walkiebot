'use strict';
import '../../../stylesheets/attachments/author.scss';

import classNames from 'classnames';
import React from 'react';
import emoji from '../../utils/emoji';

const AuthorLink = ({ href, children }) => (
  <a
    className='author__link'
    target='_blank'
    href={href}
    onClick={(e) => {
      if (!href) e.preventDefault();
    }}
    >
    {children}
  </a>
);

const AuthorIcon = ({ icon }) => (
  <span
    className={classNames('author__image', 'author__image--profile', {
      'author__image--hidden': !icon
    })}
    style={{ backgroundImage: `url(${icon})` }}
    />
);

const Author = ({ name, subname, link, icon, caret }) => (
  <div className={classNames('author', { 'author--hidden': !name })}>
    <div className='author__wrap'>
      {
        link
        ? <AuthorLink href={link}><AuthorIcon icon={icon} /></AuthorLink>
        : <AuthorIcon icon={icon} />
      }
      {
        link
        ? <AuthorLink href={link}>{name}</AuthorLink>
        : <span dangerouslySetInnerHTML={{ __html: emoji.toImage(name) }} />
      }
      {subname && <span className='author__spacer' />}
      {
        link
        ? <AuthorLink href={link}>{subname}</AuthorLink>
        : <span dangerouslySetInnerHTML={{ __html: emoji.toImage(subname) }} />
      }
      {' '}{caret}
    </div>
  </div>
);

export default Author;
