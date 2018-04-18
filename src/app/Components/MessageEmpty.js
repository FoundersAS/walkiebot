import React from 'react';
import moment from 'moment';
import Youtube from 'react-youtube';

import SlackFormat from '../utils/slack-formatter';

const MessageEmpty = ({ bot }) => {
  const message = {
    bot: true,
    slack: {
      text: '_Hello! Looks like this is the beginning of our conversation... I will remove this message once you start posting._\n*Check out the video above for a quick introduction!* You can always find it in the help section, so don\'t worry about forgetting things.',
      time: moment().format('h:mm A')
    }
  };

  return (
    <div>
      <div className='message__video-container'>
        <Youtube videoId='5iYPa1jRFgw' />
      </div>
      <div className='message message--empty'>
        <span
          className='message__avatar'
          style={{
            backgroundImage: bot.url ? `url(${bot.url})` : ''
          }}
          >
          {bot.url ? '' : bot.emoji}
        </span>
        <div className='message__content'>
          <div className='message__meta'>
            <span className='message__name'>{bot.name}</span>
            <span className='message__type'>APP</span>
            <span className='message__time'>{message.slack.time}</span>
            <span className='message__ephemeral'>Only visible to you</span>
          </div>
          <div
            className='message__text message__text--ephemeral'
            dangerouslySetInnerHTML={{
              __html: SlackFormat(message.slack.text, message.bot, message.unfurls)
            }}
            />
        </div>
      </div>
    </div>
  );
};

export default MessageEmpty;
