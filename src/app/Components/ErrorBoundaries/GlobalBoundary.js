import '../../../stylesheets/errors/global.scss';

import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor (props) {
    super(props);

    this.state = { error: false, info: '' };
  }

  componentDidCatch (error, info) {
    this.setState({
      error: error,
      info: info
    });
  }

  render () {
    if (this.state.error) {
      return (
        <div className='global-error'>
          <div className='global-error__wrap'>
            <h1 className='global-error__header'>Oh no! An error occurred.</h1>
            <h4 className='global-error__header global-error__header--sub'>
              Please reload walkie, if the error persists, let us know.
            </h4>
            <img className='global-error__img' src='/static/illustrations/face-sad.svg' />
          </div>
          <pre>
            {this.state.error && this.state.error.toString()}
            {this.state.info.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
