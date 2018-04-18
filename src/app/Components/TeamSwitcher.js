'use strict';
import '../../stylesheets/team-switcher.scss';

import classNames from 'classnames';
import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

class ContextAvatar extends React.Component {
  render () {
    const { name, url } = this.props;
    return (
      <div>
        <div
          className='team-switcher__avatar'
          style={{ backgroundImage: `url(${url})` }}
          title={name}
          />
        <div className='team-switcher__name'>
          {name}
        </div>
      </div>
    );
  }
}

class BotAvatar extends React.Component {
  render () {
    const { name, url, emoji, fork, forkedFromName, teamName } = this.props;
    const indicator = (
      <span
        className='team-switcher__indicator icon-fork'
        title={`Forked from ${forkedFromName}`}
        />
    );

    return (
      <div
        className='team-switcher__bot-list-avatar'>
        <div
          className='team-switcher__avatar'
          style={{ backgroundImage: url ? `url(${url})` : '' }}
          >
          {url ? '' : emoji || name.substr(0, 1).toLowerCase()}
          {fork && indicator}
        </div>
        <div className='team-switcher__bot-list-content'>
          <div
            className='team-switcher__name'
            title={name}
            >
            {name}
          </div>
          <div className='team-switcher__meta'>
            {teamName}
          </div>
        </div>
      </div>
    );
  }
}

class BotList extends React.Component {
  constructor (props) {
    super(props);

    this.onClickAddBot = this.onClickAddBot.bind(this);
    this.onClickBot = this.onClickBot.bind(this);
    this.generateSlackSignInUrl = this.generateSlackSignInUrl.bind(this);
    this.generateLogOutUrl = this.generateLogOutUrl.bind(this);
  }

  render () {
    const { meta, bots, isAnonList } = this.props;
    return (
      <div className='team-switcher__level team-switcher__level--2'>
        {!meta.signedIn && !isAnonList && (
          // Not signed in
          <div className='team-switcher__signup'>
            <div className='team-switcher__column team-switcher__column--signup'>
              <img src='/static/illustrations/not-signed-in.svg' className='team-switcher__signup-image' />
              <div className='team-switcher__level-header-title'>
                Sign in with Slack
              </div>
              <div className='team-switcher__level-meta'>When you sign in you can share your bot with teammates, access your bot from any computer.</div>
              <a
                className='btn btn--slack btn--primary team-switcher__btn'
                title='Sign in'
                href={this.generateSlackSignInUrl()}
                >
                <span className='icon-slack' />
                Sign in with Slack
              </a>
              <div className='type__tiny type--right'>No credit card required</div>
            </div>
            <div className='team-switcher__column team-switcher__column--pricing'>

              <div className='pricing__title'>Walkie Pro (Beta)</div>
              <div className='pricing__meta'>With Walkie Pro we aim to make your workflow smarter, faster and more playful.</div>

              <div className='pricing__options'>
                <div className='pricing__options-item'>Share bots with your Slack team</div>
                <div className='pricing__options-item pricing__options-item--sub'>- No more sending links to everyone.</div>
                <div className='pricing__options-item'>Convert anonymous bots to team bots</div>
                <div className='pricing__options-item pricing__options-item--sub'>- Already in deep with Walkie? You can still share it with your team.</div>
                <div className='pricing__options-item'>Save your list of anonymous bots</div>
                <div className='pricing__options-item pricing__options-item--sub'>- Deleted your browser cache? Now you can still see your anonymous bots.</div>
                <div className='pricing__options-item'>Get notified of future updates</div>
                <div className='pricing__options-item pricing__options-item--sub'>- Find out about new exciting Walkie features.</div>
              </div>
            </div>
          </div>
        )}

        {meta.signedIn && !isAnonList && (
          // Team
          <div className='team-switcher__level-inner'>
            <div className='team-switcher__level-pane'>
              <Scrollbars
                autoHide
                autoHideTimeout={1000}
                autoHideDuration={200}
                >
                <div className='team-switcher__level-header'>
                  <div className='team-switcher__level-header-title'>
                    <div>Team bots</div>
                    <div className='meta'>{meta.team.name}</div>
                  </div>
                  <div className='team-switcher__level-header-tools'>
                    <a
                      className='team-switcher__level-header-tool-icon icon-logout'
                      title='Sign out'
                      href={this.generateLogOutUrl()}
                      />
                  </div>
                </div>
                {bots.map(bot => {
                  return (
                    <a
                      key={bot.id}
                      href={`/${bot.teamDomain}/${bot.id}`}
                      className={classNames('team-switcher__bot-list-link', {
                        'team-switcher__bot-list-link--active': meta.botId === bot.id
                      })}
                      title={bot.name}
                      onClick={this.onClickBot}
                      >
                      <BotAvatar {...bot} />
                    </a>
                  );
                })}

                {!bots.length && (
                  <div className='team-switcher__level-header team-switcher__level-header--login'>
                    <div className='team-switcher__level-header-image-wrap'>
                      <img src='/static/illustrations/no-team-bots.svg' className='team-switcher__level-header-image' />
                    </div>
                    <div className='meta'>There are no team bots available. Team bots are collborative and visible to all team members.</div>
                  </div>
                )}
              </Scrollbars>
            </div>
            <div className='team-switcher__level-footer'>
              <a href='/' className='team-switcher__add-bot' onClick={this.onClickAddBot}>
                <span className='team-switcher__add-bot-icon icon-plus' />
                Add team bot
              </a>
            </div>
          </div>
        )}

        {isAnonList && (
          // Local
          <div className='team-switcher__level-inner'>
            <div className='team-switcher__level-pane'>
              <Scrollbars
                autoHide
                autoHideTimeout={1000}
                autoHideDuration={200}
                >
                <div className='team-switcher__level-header'>
                  <div className='team-switcher__level-header-title'>
                    <div>Local bots</div>
                    {bots.length !== 0 && (
                      <div className='meta'>Local bots are only available on this computer. Convert to a team bot to get access from any computer.</div>
                    )}
                  </div>
                </div>
                {bots.map(bot => {
                  return (
                    <a
                      key={bot.id}
                      href={`/${bot.teamDomain}/${bot.id}`}
                      className={classNames('team-switcher__bot-list-link', {
                        'team-switcher__bot-list-link--active': meta.botId === bot.id
                      })}
                      title={bot.name}
                      onClick={this.onClickBot}
                      >
                      <BotAvatar {...bot} />
                    </a>
                  );
                })}

                {!bots.length && (
                  <div className='team-switcher__level-header team-switcher__level-header--login'>
                    <div className='team-switcher__level-header-image-wrap'>
                      <img src='/static/illustrations/no-local-bots.svg' className='team-switcher__level-header-image' />
                    </div>
                    <div className='meta'>There are no local bots available. Local bots are only available on they computer they are first created on.</div>
                  </div>
                )}
              </Scrollbars>
            </div>
            <div className='team-switcher__level-footer'>
              <a href='/' className='team-switcher__add-bot' onClick={this.onClickAddBot}>
                <span className='team-switcher__add-bot-icon icon-plus' />
                Add local bot
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  onClickAddBot (e) {
    e.preventDefault();
    window.sessionStorage.setItem('isAddingBot', true);
    if (this.props.isAnonList) window.sessionStorage.setItem('addingAnonBot', true);
    window.location = '/';
  }

  onClickBot (e) {
    window.sessionStorage.removeItem('addingAnonBot');
    window.sessionStorage.removeItem('isAddingBot');
  }

  generateLogOutUrl () {
    const { meta } = this.props;
    if (meta.botId && meta.isPublicBot) return `/logout?next=/anon/${meta.botId}/settings`;
    return '/logout';
  }

  generateSlackSignInUrl () {
    const { meta } = this.props;
    const localBotId = window.localStorage.getItem('localBotId');
    if (meta.botId) {
      return `https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=${window.SLACK_CLIENT_ID}&redirect_uri=${window.SLACK_LOGIN_REDIRECT_URL}&state=/${meta.team.domain}/${meta.botId}/settings||${localBotId}`;
    }
    return `https://slack.com/oauth/authorize?scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=${window.SLACK_CLIENT_ID}&redirect_uri=${window.SLACK_LOGIN_REDIRECT_URL}&state=||${localBotId}`;
  }
}

class TeamSwitcher extends React.Component {
  render () {
    const {
      bots,
      meta,
      closeTeamAndUserList,
      toggleUserList,
      toggleTeamList,
      userListOpen,
      teamListOpen,
      listOpen,
      showHelpOverlay
    } = this.props;

    const isAnonContext = meta.teamDomain === 'anon' || !meta.teamDomain;

    return (
      <div className={classNames('team-switcher', {
        'team-switcher--open': listOpen
      })}>

        <div className='team-switcher__level team-switcher__level--1'>
          <div>
            {listOpen && (
              <CSSTransitionGroup
                transitionName='open-bot-switcher-transition-backdrop'
                transitionEnterTimeout={1000}
                transitionLeaveTimeout={1200}
                >
                <div className='team-switcher__backdrop' onClick={closeTeamAndUserList} />
              </CSSTransitionGroup>
            )}
            <div
              onClick={toggleTeamList}
              className={classNames('team-switcher__link', {
                'team-switcher__link--active': !isAnonContext && !!meta.botId,
                'team-switcher__link--open': teamListOpen
              })}
              >
              <ContextAvatar
                name={meta.signedIn ? meta.team.name : 'Sign in'}
                url={meta.team.avatar}
                />
              <CSSTransitionGroup
                transitionName='open-bot-switcher-transition'
                transitionEnterTimeout={300}
                transitionLeaveTimeout={300}
                >
                {listOpen && !userListOpen && (
                  <BotList bots={bots} meta={meta} isAnonList={userListOpen} key={'teamList'} />
                )}
              </CSSTransitionGroup>

            </div>
            <div
              onClick={toggleUserList}
              className={classNames('team-switcher__link', {
                'team-switcher__link--active': isAnonContext && !!meta.botId,
                'team-switcher__link--open': userListOpen
              })}
              >
              <ContextAvatar
                name='Anon'
                url='/static/illustrations/local-bots.svg'
                />
              <CSSTransitionGroup
                transitionName='open-bot-switcher-transition'
                transitionEnterTimeout={300}
                transitionLeaveTimeout={300}
                >
                {listOpen && userListOpen && (
                  <BotList bots={bots} meta={meta} isAnonList={userListOpen} key={'annonList'} />
                )}
              </CSSTransitionGroup>
            </div>
          </div>
          <div>
            <div className='team-switcher__item' onClick={showHelpOverlay}>
              <div className='team-switcher__item-icon icon-help' />
              <div className='team-switcher__item-name'>help</div>
            </div>
            <div
              className='team-switcher__item'
              onClick={e => {
                e.preventDefault();

                try {
                  if (window.driftSidebarOpen) {
                    window.driftApi.sidebar.close();
                  } else {
                    window.driftApi.sidebar.open();
                  }
                } catch (e) {
                  window.alert('It looks like something went wrong, do you have an adblocker active?');
                  throw e;
                }
              }}
              >
              <div className='team-switcher__item-icon icon-speech-bubble' />
              <div className='team-switcher__item-name'>Chat</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TeamSwitcher;
