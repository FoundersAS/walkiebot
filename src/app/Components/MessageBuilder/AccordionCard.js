'use strict';
import '../../../stylesheets/attachments/accordion-card.scss';

import classNames from 'classnames';
import React from 'react';

class AccordionCard extends React.Component {
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
      actions,
      activeProperties,
      children
    } = this.props;

    return (
      <div className={classNames('accordion-card', {
        'accordion-card--open': this.state.open
      })}>
        <div
          className='accordion-card__title'
          onClick={this.toggleAccordion}
          >
          {title}
          <div className='accordion-card__actions'>
            {actions}
          </div>
        </div>
        <div className={classNames('accordion-card__active-properties', {
          'accordion-card__active-properties--show': !this.state.open
        })}>
          {activeProperties.join(', ')}
        </div>
        <div className='accordion-card__wrap'>
          {children}
        </div>
      </div>
    );
  }

  toggleAccordion () {
    this.setState({ open: !this.state.open });
  }
}

export default AccordionCard;
