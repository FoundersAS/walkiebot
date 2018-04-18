import '../../../stylesheets/switcher.scss';

import React from 'react';
import classNames from 'classnames';

class UserSwitcher extends React.Component {
  render () {
    const {
      show,
      disabled,
      toggleSwitcher,
      selectedActor,
      chatContext,
      bot,
      users,
      handleContextClickBot,
      handleContextClickUser,
      hideBot
    } = this.props;

    return (
      <div>
        <div
          className={classNames('switcher__trigger', {
            'switcher__trigger--open': show,
            'switcher__trigger--disabled': disabled
          })}
          onClick={toggleSwitcher}
          >
          <div className='switcher__tooltip'>{selectedActor.name}</div>
          <div
            className='switcher__avatar'
            style={{ backgroundImage: selectedActor.url ? `url(${selectedActor.url})` : '' }}
            >
            {selectedActor.url ? '' : selectedActor.emoji}
          </div>
        </div>

        <div
          className={classNames('switcher', {
            'switcher--show': show
          })}
          >
          <div className='switcher__inner'>
            {!hideBot && (
              <div
                className={classNames('switcher__item switcher__item--bot', {
                  'switcher__item--active': chatContext.chatContext === 'bot'
                })}
                onClick={handleContextClickBot}
                >
                <div className='switcher__tooltip'>{bot.name}</div>
                <div
                  className='switcher__avatar'
                  style={{ backgroundImage: bot.url ? `url(${bot.url})` : '' }}
                  >
                  {bot.url ? '' : bot.emoji}
                </div>
              </div>
            )}
            <div className='switcher__list'>
              {users.map((user, idx) => {
                if (user.deleted) return null;
                return (
                  <div
                    className={classNames({
                      'switcher__item ': true,
                      'switcher__item--active': chatContext.chatContext === 'you' &&
                                                idx === chatContext.currentUserIdx
                    })}
                    key={idx}
                    onClick={() => handleContextClickUser(idx)}
                    >
                    <div className='switcher__tooltip'>{user.name}</div>
                    <div
                      className='switcher__avatar'
                      style={{ backgroundImage: user.url ? `url(${user.url})` : '' }}
                      >
                      {user.url ? '' : user.emoji}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UserSwitcher;
