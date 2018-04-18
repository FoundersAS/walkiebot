import React from 'react';
import classNames from 'classnames';

class UserSettingsCard extends React.PureComponent {
  constructor (props) {
    super(props);

    this.showRemoveUser = this.showRemoveUser.bind(this);
    this.removeUser = this.removeUser.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.changeName = this.changeName.bind(this);
    this.changeAvatar = this.changeAvatar.bind(this);
    this.cancelUrlInput = this.cancelUrlInput.bind(this);
    this.showUrlInput = this.showUrlInput.bind(this);
    this.chooseAvatar = this.chooseAvatar.bind(this);

    this.state = {
      isDeleting: false,
      isAddingAvatarUrl: false,
      url: '',
      name: ''
    };
  }

  render () {
    const { user, userIdx, userAvatars } = this.props;
    const userAvatarIdx = userAvatars.indexOf(user.url);

    return (
      <div
        className={classNames('list__item', {
          open: this.state.isAddingAvatarUrl,
          deleting: this.state.isDeleting
        })}
        >

        <div className='selector__item-url-input'>
          <input
            type='url'
            onKeyDown={this.changeAvatar}
            onBlur={this.cancelUrlInput}
            className='input input--inline settings__input'
            placeholder='Add url or emoji'
            />
          <span className='input-feedback' />
        </div>

        <div
          className='settings__avatar settings__avatar--user selector__parent'
          style={{ backgroundImage: user.url ? `url(${user.url})` : '' }}
          >
          {user.url ? '' : user.emoji}

          <div className='selector selector--avatar'>
            <div className={`selector__inner selector__inner--${userAvatarIdx}`}>
              {userAvatars.map((avatarUrl, avatarUrlIdx) => {
                return (
                  <div
                    key={avatarUrlIdx}
                    onClick={() => this.chooseAvatar(avatarUrl)}
                    className='selector__item'
                    >
                    <div
                      className='settings__avatar'
                      style={{ backgroundImage: `url('${avatarUrl}')` }}
                      />
                  </div>
                );
              })}

              <div
                onClick={this.showUrlInput}
                className='selector__item selector__item--url'
                >

                <span className='settings__avatar--icon icon-plus' />
                <div
                  className='settings__avatar settings__avatar--add'
                  style={{ backgroundImage: `url('${userAvatarIdx === -1 ? user.url : undefined}')` }}
                  />

              </div>
            </div>
          </div>
        </div>
        <div className='list__content'>
          <input
            tabIndex={4 + userIdx}
            defaultValue={user.name}
            maxLength='21'
            onKeyDown={this.changeName}
            onBlur={this.onBlur}
            type='text'
            className='input input--inline settings__input'
            placeholder='Username (Max 21 characters)'
            />
          <div className='settings__handle'>
            {user.handle || '@handle'}
          </div>

        </div>
        <div
          className='btn btn--naked btn--small list__action icon-cross'
          onClick={() => this.props.removeUser(userIdx)}
          />
      </div>
    );
  }

  changeName (e) {
    if (e.which === 27) {
      e.stopPropagation();
      e.preventDefault();
      e.target.blur();
      this.setState({ name: '' });
      return;
    }
    e.persist();
    this.setState({ name: e.target.value }, () => {
      if (e.which === 13) return this.onBlur(e);
    });
  }

  chooseAvatar (avatarUrl) {
    this.setState({ url: avatarUrl }, () => {
      return this.onBlur();
    });
  }

  changeAvatar (e) {
    if (e.which === 27) {
      e.stopPropagation();
      e.preventDefault();
      e.target.blur();
      this.setState({ url: '', isAddingAvatarUrl: false });
      return;
    }

    if (!e.target.validity.valid) return;
    e.persist();

    this.setState({ url: e.target.value }, () => {
      if (e.which === 13) {
        if (!e.target.value) {
          this.setState({ url: '', isAddingAvatarUrl: false });
          return e.target.blur();
        }
        return this.onBlur(e);
      }
    });
  }

  cancelUrlInput (e) {
    this.setState({ url: '', isAddingAvatarUrl: false });
    e.target.blur();
    return;
  }

  onBlur (e) {
    e && e.target.blur();
    this.props.onBlur(this.props.userIdx, {
      name: this.state.name || this.props.user.name,
      url: this.state.url || this.props.user.url
    });
  }

  showUrlInput () {
    this.setState({ isAddingAvatarUrl: true });
  }

  showRemoveUser () {
    this.setState({ isDeleting: true });
  }

  removeUser () {
    const { removeUser, userIdx } = this.props;
    return removeUser(userIdx);
  }
}

export default UserSettingsCard;
