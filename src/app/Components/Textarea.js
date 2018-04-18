'use strict';
import '../../stylesheets/input.scss';

import React from 'react';
import PropTypes from 'prop-types';

export default class Textarea extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      overflowsAt: 0
    };
  }

  prepareProps (props) {
    const newProps = Object.assign({}, props);
    delete newProps.maxRows;
    delete newProps.minRows;

    return newProps;
  }

  isOverflowing (target) {
    const currentOverflow = target.style.overflow;
    if (!currentOverflow || currentOverflow === 'visible') {
      target.style.overflow = 'hidden';
    }

    return target.clientWidth < target.scrollWidth ||
           target.clientHeight < target.scrollHeight;
  }

  onchange (event) {
    const actualLines = event.target.value.split(/\r*\n/).length;

    if (actualLines < this.props.minRows) {
      event.target.rows = this.props.minRows;
      return;
    }

    if (actualLines > this.props.maxRows) {
      event.target.rows = this.props.maxRows;
      return;
    }

    event.target.rows = (actualLines - event.target.rows) + event.target.rows;

    if (this.props.onChange) return this.props.onChange();
  }

  render () {
    return (
      <textarea
        onChange={this.onchange.bind(this)}
        {...this.prepareProps(this.props)}
        />
    );
  }
}

Textarea.propTypes = {
  maxRows: PropTypes.number,
  minRows: PropTypes.number
};

Textarea.defaultProps = {
  maxRows: Infinity,
  minRows: 1
};
