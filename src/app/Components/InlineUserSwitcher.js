import '../../stylesheets/inline-user-switcher.scss';

import React from 'react';

const Avatar = ({ url }) => (
  <span
    className='message__avatar'
    style={{ backgroundImage: `url(${url})` }}
    />
);

class InlineUserSwitcher extends React.Component {
  state = { open: false }

  open = () => this.setState({ open: true })
  close = () => this.setState({ open: false })
  toggle = () => this.setState({ open: !this.state.open })

  mapUsersToView = (user, idx) => {
    if (user.deleted) return;
    if (idx === this.props.currentUserIndex) return;
    const onClick = e => this.onClick(idx, e);
    return (
      <div key={idx} className='inline-user-switcher__avatar' onClick={onClick} alt={user.handle}>
        <Avatar url={user.url} />
      </div>
    );
  }

  onClick = (userIndex, e) => {
    this.close();
    this.props.onClick(userIndex, e);
  }

  render () {
    return (
      <div className='inline-user-switcher'>
        {this.state.open && (
          <div className='inline-user-switcher__underlay' onClick={this.close} />
        )}
        <div className='inline-user-switcher__avatar' onClick={this.toggle}>
          <Avatar url={this.props.user.url} />
          <div className='inline-user-switcher__avatar-overlay' />
        </div>
        {this.state.open && (
          <div className='inline-user-switcher__avatars'>
            {this.props.users.map(this.mapUsersToView)}
          </div>
        )}
      </div>
    );
  }
}

export default InlineUserSwitcher;
