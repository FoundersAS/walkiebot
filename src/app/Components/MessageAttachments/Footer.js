'use strict';
import '../../../stylesheets/attachments/footer.scss';

import React from 'react';
import moment from 'moment';

const parseTs = (ts) => {
  if (!ts) return '';
  if (ts && ts === 'NOW') return moment().format('MMM Do, YYYY [at] H:mm A');
  ts = moment(parseInt(ts, 10));
  if (!ts.isValid()) return '';
  return ts.format('MMM Do, YYYY [at] H:mm A');
};

const Footer = ({ icon, footer, ts, parser, caret }) => {
  ts = parseTs(ts);
  return (
    <div className='footer'>
      {!!icon && (
        <span
          className='footer__icon'
          style={{ backgroundImage: `url(${icon})` }}
          />
      )}
      <div
        className='footer__text'
        dangerouslySetInnerHTML={{ __html: parser(footer) }}
        />
      {!!ts && (
        <div className='footer__ts'>{ts}</div>
      )}
      {' '}{caret}
    </div>
  );
};

export default Footer;
