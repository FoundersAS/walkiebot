import React from 'react';
import { Router, browserHistory } from 'react-router';
import GlobalErrorBoundary from './app/Components/ErrorBoundaries/GlobalBoundary';

class Root extends React.Component {
  render () {
    return (
      <GlobalErrorBoundary>
        <Router history={browserHistory}>
          {this.props.routes()}
        </Router>
      </GlobalErrorBoundary>
    );
  }
}

export default Root;
