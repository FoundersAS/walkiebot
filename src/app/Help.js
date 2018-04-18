'use strict';
import '../stylesheets/help.scss';

import React from 'react';
import Youtube from 'react-youtube';

const Help = () => (
  <div className='app__content app__content--help'>
    <div className='page page--help'>
      <div className='page__inner'>

        <div className='help__intro'>
          <h2>Introduction</h2>
          <p>Walkie helps you to mockup and test your bot conversations. It stores all the conversations in your browsers localstorage, so it's only you who have access to your converstations. You can export a full conversation or part of it. For now it's focused on Slack bots.</p>
          <p>Check out a quick intro on how to use Walkie below</p>
        </div>

        <div className='panel'>
          <Youtube videoId='5iYPa1jRFgw' />
        </div>

        <div className='panel'>
          <div className='panel__item'>
            <span className='panel__item-section'>Unfurls</span>
            <p className='panel__item-text'>
              Currently, Walkie only supports unfurling image links directly from the message text. If the server hosting the image does not provide the correct value for the <span className='code__inline'>Content-Type</span> header (e.g. <span className='code__inline'>image/*</span>) Walkie will not try to unfurl the link.
            </p>
          </div>
        </div>

        <h3 className='help__sections-titles'>Elements</h3>
        <div className='panel'>
          <div className='panel__item'>
            <span className='panel__item-section'>Bot & User</span>
            <p className='panel__item-text'>
              You start by creating your bot. You can have one bot, but as many stories as you want. Bot/User name and avatar can be updated in settings. <br /> You can use the emoji keyboard
              (
              <span className='shortcut shortcut--inline'>
                <span className='shortcut__btn'>Ctrl</span>
                +
                <span className='shortcut__btn'>Cmd</span>
                +
                <span className='shortcut__btn'>Space</span>
              </span>
              on mac) to access the emoji library or paste a url to an image.
            </p>
          </div>
          <div className='panel__item'>
            <span className='panel__item-section'>Story</span>
            <p className='panel__item-text'>A story resembles one conversation and can contain as many messages and attatchments as needed. Add a story from the sidebar or dublicate an existing one. You can rename the story by clicking the ··· in the topbar when inside a story. You can replay a story by using the controls in the topbar, it is a good way to check if the flow seems nice.</p>
          </div>
          <div className='panel__item'>
            <span className='panel__item-section'>Sidebar</span>
            <p className='panel__item-text'>Stories are order alphabetically. They can be dublicated and deleted from here as well as the topbar within a story.</p>
          </div>
          <div className='panel__item'>
            <span className='panel__item-section'>Messages</span>
            <p className='panel__item-text'>Just like you know it from slack. To swap context and post as either the bot or the user click the button on the left side of the input. You stay in the selected context until you swap it. Check out the shortcuts for easier swapping. Messages can be rearranged in the storei by click the up or down arrow in the hover controles.</p>
          </div>
          <div className='panel__item'>
            <span className='panel__item-section'>Attatchment(s)</span>
            <p className='panel__item-text'>When a field is filled it will show in the chat so you can see it and design it to look good. Add multiple fiels and actions to one attatchment or add multiple attachements. To edit and attatchment click the messeage edit button and click save when done. Attachements can be rearranged by click the up or down arrow next to the attachement title.</p>
          </div>
          <div className='panel__item'>
            <span className='panel__item-section'>Export</span>
            <p className='panel__item-text'>You can export a full conversation by clicking the export button in the topbar or pick a single message by click the export button when hovering the item. The export is in JSON so it's easy to share with a developer.</p>
          </div>
          <div className='panel__item'>
            <span className='panel__item-section'>Import</span>
            <p className='panel__item-text'>You can import a message built with slack's own message builder. As long as it is a valid slack message you should be good.</p>
          </div>
          <div className='panel__item'>
            <span className='panel__item-section'>Share</span>
            <p className='panel__item-text'>You can share your bot with everyone. Anyone with the link can continue to update the messages, stories and bot credantials. So if you do not want anyone to mess up your bot, you should consider forking and sending them that link.</p>
          </div>
          <div className='panel__item'>
            <span className='panel__item-section'>Fork</span>
            <p className='panel__item-text'>When you fork a new bot is created by copy. Any changes made to that bot will NOT reflect back on the original bot.</p>
          </div>
        </div>

        <h3 className='help__sections-titles'>Shortcuts</h3>
        <div className='panel'>
          <div className='panel__item'>
            <span className='shortcut'>
              <span className='shortcut__btn'>Ctrl</span>
              +
              <span className='shortcut__btn'>Enter</span>
            </span>
            <p className='panel__item-text'>Post as the opposite context than the one selected. Will <u>NOT</u> swap the context permanently.</p>
          </div>
        </div>

        <h3 className='help__sections-titles'>Frequently asked questions</h3>
        <div className='panel'>
          <div className='panel__item panel__item--column'>
            <span className='panel__item-section'>Trouble importing a message?</span>
            <p className='panel__item-text'>
              Slacks message builder is purely visual, meaning that there are some fields it does not require to render a message, where walkie requires a bit more info to save a message.
            </p>
            <p className='panel__item-text'>
              Namely the <span className='shortcut shortcut--inline'><span className='shortcut__btn'>attachment_type</span> and <span className='shortcut__btn'>callback_id</span></span> fields that should be at the attachment level. If you ever run into something you're not completely sure of, feel free to send us a message!
            </p>
            <p className='panel__item-text'>
              The example below will fail to import:
            </p>
            <pre className='panel__item-text'>
              {`{
  "text": "There is something wrong with this message's attachments",
  "attachments": [
    {
      "fallback": "I am a boring fallback",
      "text": "Click my buttons!",
      "actions": [
        {
          "name": "btn1",
          "text": "Nice to click",
          "type": "button",
          "value": "foo",
          "style": "primary"
        }
      ],
      "mrkdwn_in": [
        "title",
        "text",
        "pretext",
        "fields"
      ]
    }
  ]
}`}
            </pre>
            <p className='panel__item-text'>
              When you have actions in an attachment, it is required that you provide <span className='code__inline'>fallback_id</span> and <span className='code__inline'>attachment_type</span> before slack will accept the message when you send it to them.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Help;
