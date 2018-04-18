'use strict';
import '../../../stylesheets/attachments/accordion.scss';

import classNames from 'classnames';
import React from 'react';

class Accordion extends React.Component {
  constructor (props) {
    super(props);

    this.toggleAccordion = this.toggleAccordion.bind(this);

    this.state = {
      open: false
    };
  }

  componentDidMount () {
    if (this.props.open) this.setState({ open: true });
  }

  render () {
    const {
      title,
      notEmpty,
      children,
      attachmentList
    } = this.props;

    return (
      <div className={classNames('accordion', {
        'accordion--open': this.state.open,
        'accordion--attachment-list': attachmentList
      })}>
        <div
          className={classNames('accordion__title', {
            'accordion__title--empty': !notEmpty
          })}
          onClick={this.toggleAccordion}
          >
          {title}
        </div>
        <div className='accordion__wrap'>
          {children}
        </div>
      </div>
    );
  }

  toggleAccordion () {
    this.setState({ open: !this.state.open });
  }
}

export default Accordion;
