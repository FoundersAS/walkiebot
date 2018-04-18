'use strict';
import React from 'react';

const InlineInput = (props) => (
  <input
    className='input input--inline'
    autoFocus
    type='text'
    {...props}
    />
);

export default InlineInput;
