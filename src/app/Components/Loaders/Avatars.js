import '../../../stylesheets/avatars-loader.scss';
import React from 'react';
import classNames from 'classnames';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import Bubble from './svgs/Bubble';
import User00 from './svgs/User00';
import User01 from './svgs/User01';
import User02 from './svgs/User02';
import User03 from './svgs/User03';
import Walkie from './svgs/Walkie';

class AvatarsLoader extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      avatar: Walkie,
      avatars: [
        <User00 />,
        <User01 />,
        <User02 />,
        <User03 />,
        <Walkie />
      ]
    };
  }

  componentDidMount () {
    const avatarIndex = Math.floor(Math.random() * this.state.avatars.length);
    this.setState({
      avatar: this.state.avatars[avatarIndex]
    });
  }

  render () {
    const {
      small,
      text,
      overlay,
      show
    } = this.props;

    return (
      <CSSTransitionGroup
        transitionName={overlay ? 'avatars-loader-overlay__transition' : 'avatars-loader__transition'}
        transitionAppear
        transitionAppearTimeout={300}
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
        >
        {show && (
          <div
            className={classNames('avatars-loader avatars-loader--loading', {
              'avatars-loader--small': small,
              'avatars-loader--overlay': overlay
            })}
            >
            <div className='avatars-loader__inner'>
              {text && (
                <div className='avatars-loader__message'>{text}</div>
              )}
              <Bubble />
              {this.state.avatar}
            </div>
          </div>
        )}
      </CSSTransitionGroup>
    );
  }
}

export default AvatarsLoader;
