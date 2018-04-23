'use strict';
import '../stylesheets/app.scss';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import slug from 'slug';

import Alert from './Components/Alert';
import SystemAlert from './Components/SystemAlert';
import TeamSwitcher from './Components/TeamSwitcher';
import Modal from './Components/Modals/Modal';
import Loading from './Components/Loading';
import Help from './Help';
import FullJsonImport from './Components/FullJsonImport';
import AvatarsLoader from './Components/Loaders/Avatars';

import { errorHandler } from './utils/error-handler';
import * as api from './utils/api';
import { resetAttachments } from './redux/ducks/attachments';
import { closeBuilder } from './redux/ducks/builder';
import { resetMessageSettings } from './redux/ducks/message-settings';
import { resetReactions } from './redux/ducks/message-reactions';
import {
  addStory,
  duplicateStory,
  removeStory,
  cancelEditMessage
} from './redux/ducks/stories';
import {
  loadStateAndCheckToken,
  addLocalBot,
  loadLocalBots,
  migrateBotToTeam
} from './redux/actions';
import { triggerNotification, dismissNotification } from './redux/ducks/notification';
import { dismissSystemNotification } from './redux/ducks/system-notifications';
import { getMe } from './redux/ducks/meta';

require('../static/illustrations/free-month.svg');
require('../static/illustrations/not-signed-in.svg');
require('../static/illustrations/no-local-bots.svg');
require('../static/illustrations/no-team-bots.svg');
require('../static/illustrations/local-bots.svg');
require('../static/illustrations/bot-avatar.svg');
require('../static/illustrations/user-team.svg');
require('../static/illustrations/user-avatar.svg');
require('../static/illustrations/user-avatar--0.svg');
require('../static/illustrations/user-avatar--1.svg');
require('../static/illustrations/user-avatar--2.svg');
require('../static/illustrations/user-avatar--3.svg');

class App extends React.Component {
  constructor (props) {
    super(props);

    this.loadBot = this.loadBot.bind(this);
    this.dismissAlert = this.dismissAlert.bind(this);
    this.dismissSystemNotification = this.dismissSystemNotification.bind(this);
    this.toggleUserList = this.toggleUserList.bind(this);
    this.toggleTeamList = this.toggleTeamList.bind(this);
    this.closeTeamAndUserList = this.closeTeamAndUserList.bind(this);

    this.showHelpOverlay = this.showHelpOverlay.bind(this);
    this.closeHelpOverlay = this.closeHelpOverlay.bind(this);
    this.closeHelpOverlayOnEscape = this.closeHelpOverlayOnEscape.bind(this);

    this.showImportOverlay = this.showImportOverlay.bind(this);
    this.closeImportOverlay = this.closeImportOverlay.bind(this);
    this.closeImportOverlayOnEscape = this.closeImportOverlayOnEscape.bind(this);

    this.showExportOverlay = this.showExportOverlay.bind(this);
    this.closeExportOverlay = this.closeExportOverlay.bind(this);
    this.closeExportOverlayOnEscape = this.closeExportOverlayOnEscape.bind(this);

    this.exportData = this.exportData.bind(this);

    this.state = {
      showHelpOverlay: false,
      showImportOverlay: false,
      showExportOverlay: false,
      userListOpen: false,
      teamListOpen: false,

      exportLoading: false,
      exportFileUrl: null,
      exportErrors: []
    };
  }

  showHelpOverlay () {
    this.setState({ showHelpOverlay: true });
  }

  closeHelpOverlay () {
    this.setState({ showHelpOverlay: false });
  }
  closeHelpOverlayOnEscape (e) {
    if (e.which === 27) this.closeHelpOverlay();
  }

  showImportOverlay () {
    this.setState({ showImportOverlay: true, showExportOverlay: false });
  }

  closeImportOverlay () {
    this.setState({ showImportOverlay: false });
  }
  closeImportOverlayOnEscape (e) {
    if (e.which === 27) this.closeImportOverlay();
  }

  showExportOverlay () {
    this.setState({ showExportOverlay: true, showImportOverlay: false });
  }

  closeExportOverlay () {
    this.setState({
      showExportOverlay: false,
      exportLoading: false,
      exportFileUrl: null,
      exportErrors: []
    });
  }
  closeExportOverlayOnEscape (e) {
    if (e.which === 27) this.closeExportOverlay();
  }

  exportData () {
    this.setState({ exportLoading: true });
    api.exportJson(this.props.meta.botId)
      .then(res => {
        const blob = new Blob([JSON.stringify(res.data.data)], { type: 'text/json' });
        const fileUrl = window.URL.createObjectURL(blob);
        this.setState({
          exportFileUrl: fileUrl,
          exportErrors: res.data.errors,
          exportLoading: false
        });
      })
      .catch((err) => {
        this.setState({ exportLoading: false });
        errorHandler(err);
      });
  }

  closeTeamAndUserList () {
    this.setState({ userListOpen: false, teamListOpen: false });
  }

  toggleUserList () {
    const { meta } = this.props;
    this.setState({ userListOpen: !this.state.userListOpen, teamListOpen: false });
  }

  toggleTeamList () {
    const { meta } = this.props;
    this.setState({ teamListOpen: !this.state.teamListOpen, userListOpen: false });
  }

  loadBot () {
    const {
      params: { teamDomain, bot, storyId },
      dispatch,
      params,
      meta
    } = this.props;
    const { router } = this.context;
    if (Object.keys(this.props.stories).length > 0) return;

    const lastUsedBot = window.localStorage.getItem('lastUsedBot');
    const isAddingBot = window.sessionStorage.getItem('isAddingBot') || window.sessionStorage.getItem('isAddingAnonBot');

    if ((!bot && !lastUsedBot) || isAddingBot) {
      const token = window.localStorage.getItem('user_token');
      if (token && !meta.signedIn) dispatch(getMe(token));
      if (router.location.query.signIn) this.setState({ teamListOpen: true });
      return router.replace({
        pathname: '/stories',
        query: router.location.query
      });
    }

    this.props.dispatch(loadStateAndCheckToken(bot || lastUsedBot, router))
      .then(res => {
        if (res.teamDomain !== teamDomain) {
          return router.replace({
            pathname: `/${res.teamDomain}/${res.id}/stories`,
            query: router.location.query
          });
        }
        if (params.bot && !(storyId in res.stories)) {
          return router.replace({
            pathname: `/${res.teamDomain}/${res.id}/stories`,
            query: router.location.query
          });
        }
      });
  }

  componentDidMount () {
    this.props.dispatch(loadLocalBots());
    this.loadBot();
  }

  deleteStoryHandler (story) {
    if (!(story.id in this.props.stories)) return console.error('Story doesn\'t exist');

    const storyIds = Object.keys(this.props.stories).filter(storyId => storyId !== story.id);

    if (window.confirm(`Are you sure you want to remove ${story.name}?`)) {
      const { meta } = this.props;
      this.props.dispatch(removeStory(story.id));
      if (this.props.params.storyId !== story.id) return;
      if (storyIds.length) {
        this.context.router.replace(`/${meta.team.domain}/${meta.botId}/story/${storyIds[0]}`);
        return;
      }
      this.context.router.replace('/settings');
    }
  }

  duplicateStoryHandler (story) {
    const { dispatch, router, meta } = this.props;
    dispatch(duplicateStory(story.id))
      .then((newId) => {
        router.push(`/${meta.teamDomain}/${meta.botId}/story/${newId}`);
      });
  }

  addStoryHandler (event) {
    if (event.which === 27) return event.target.blur();
    if (event.which === 13) {
      if (event.target.value === '') return;
      const { dispatch, meta, stories } = this.props;
      const storyId = slug(event.target.value).toLowerCase();

      if (Object.keys(stories).find(s => s.toLowerCase() === storyId)) {
        dispatch(triggerNotification(
          'Error',
          'A story already exists with that name!',
          'error',
          10000
        ));
        return;
      }

      dispatch(addStory(storyId, event.target.value))
        .then(() => {
          this.context.router.replace(`/${meta.team.domain}/${meta.botId}/story/${storyId}`);
        });
      event.target.blur();
    }
  }

  migrateToTeamBotHandler () {
    const { dispatch, bot } = this.props;
    if (!window.confirm(`Are you sure you want to migrate ${bot.name}? *This action cannot be undone!*`)) return;

    dispatch(migrateBotToTeam());
  }

  saveLocalBotHandler (event) {
    const { dispatch, meta, bot } = this.props;
    dispatch(addLocalBot({
      id: meta.botId,
      user: 'anon',
      teamDomain: 'anon',
      name: bot.name,
      url: bot.url,
      emoji: bot.emoji
    }))
    .catch(errorHandler(dispatch));
  }

  onSideBarLinkClick (event, nextStoryId) {
    const { dispatch, stories, params } = this.props;
    if (!stories[params.storyId]) return;

    const hasChanges = stories[params.storyId].editingMessageChanged;
    const confirmMessage = 'You have unsaved changes\nDo you want to discard them?';

    if (params.storyId === nextStoryId) return event.preventDefault();
    if (hasChanges && !window.confirm(confirmMessage)) return event.preventDefault();

    dispatch(cancelEditMessage(params.storyId));
    dispatch(closeBuilder());
    dispatch(resetMessageSettings());
    dispatch(resetReactions());
    dispatch(resetAttachments());
  }

  dismissAlert () {
    this.props.dispatch(dismissNotification());
  }

  dismissSystemNotification (id) {
    this.props.dispatch(dismissSystemNotification(id));
  }

  render () {
    const { children, meta, localBots, teamBots, notification, systemNotifications } = this.props;
    return (
      <div className='app'>
        <Alert
          dismissable
          isGlobal
          show={notification.show}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClick={this.dismissAlert}
          />
        <SystemAlert
          notifications={systemNotifications}
          onClick={this.dismissSystemNotification}
          />
        <Loading show={meta.loading} />
        {this.state.showHelpOverlay && (
          <Modal
            closeOnEscape={this.closeHelpOverlayOnEscape.bind(this)}
            onClick={this.closeHelpOverlay}
            title='Help'
            fullWidth
            >
            <Help />
          </Modal>
        )}
        {this.state.showImportOverlay && (
          <Modal
            closeOnEscape={this.closeImportOverlayOnEscape.bind(this)}
            onClick={this.closeImportOverlay}
            title='Import JSON file from Walkie export'
          >
            <p>If you have done a full export of your bot, you can restore it here by navigating to the JSON file you downloaded and uploading it</p>
            <FullJsonImport />
          </Modal>
        )}
        {this.state.showExportOverlay && (
          <Modal
            closeOnEscape={this.closeExportOverlayOnEscape}
            onClick={this.closeExportOverlay}
            title='Export data'
            >
            <p>This will export all bots, stories and messages associated to your user and team (if you are logged in)</p>
            {!this.state.exportFileUrl && (
              <div>
                {!this.state.exportLoading && (
                  <a
                    onClick={this.exportData}
                    className={classNames('btn', {
                      'btn--disabled': this.exportLoading
                    })}
                  >
                    Export my data
                  </a>
                )}
                <AvatarsLoader show={this.state.exportLoading} text='Crunching and collecting!' />
              </div>
            )}
            {this.state.exportFileUrl && (
              <a
                className='btn btn--success'
                download='walkie-data.json'
                href={this.state.exportFileUrl}
              >
                Click here to download your data
              </a>
            )}
            {this.state.exportErrors.length > 0 && (
              <div>
                <h3>There were {this.state.exportErrors.length} errors exporting your data</h3>
                <h4>These bots will not be included in your download</h4>
                {this.state.exportErrors.map(error => {
                  return (
                    <div key={error.id}>Bot with id {error.id}: {error.message}</div>
                  );
                })}
              </div>
            )}

          </Modal>
        )}
        <TeamSwitcher
          bots={this.state.userListOpen ? localBots.bots : teamBots}
          meta={meta}
          closeTeamAndUserList={this.closeTeamAndUserList}
          toggleUserList={this.toggleUserList}
          toggleTeamList={this.toggleTeamList}
          userListOpen={this.state.userListOpen}
          teamListOpen={this.state.teamListOpen}
          listOpen={this.state.userListOpen || this.state.teamListOpen}
          showHelpOverlay={this.showHelpOverlay}
          showImportOverlay={this.showImportOverlay}
          showExportOverlay={this.showExportOverlay}
          />
        {children}
        <div className='mobile-disclaimer'>
          <img src={require('../static/illustrations/face-sad.svg')} className='mobile-disclaimer__image' />
          <div>
            <h2>Bummer!</h2>
            <p>We are sorry but Walkie is not ready for mobile just yet. Please use the desktop version for now.</p>
          </div>
        </div>
      </div>
    );
  }
}

App.contextTypes = {
  router: PropTypes.object.isRequired
};

const mapStateToProps = ({ bot, stories, meta, users, teamBots, localBots, notification, systemNotifications }, ownProps) => ({
  stories,
  meta,
  bot,
  users,
  teamBots,
  localBots,
  notification,
  systemNotifications
});

export default connect(mapStateToProps)(App);
