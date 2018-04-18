const asyncMap = require('map-async');
const axios = require('axios');

const urlPattern = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;

const getUnfurlsForUrls = (urls, cb) =>
  asyncMap(urls, (url, nextUnfurl) => {
    axios.head(url, { timeout: 2000 })
      .then(d => {
        if (d.headers['content-type'].indexOf('image') >= 0) {
          return nextUnfurl(null, {
            url,
            size: d.headers['content-length'],
            image: true
          });
        }
        nextUnfurl(null, { url: url, image: false });
      })
      .catch(e => {
        nextUnfurl(null, { url: url, image: false });
      });
  }, cb);

const getUnfurlsForMessages = (messages, cb) =>
  asyncMap(messages, (message, nextMessage) => {
    if (!message) return nextMessage(null, message);
    if (message.type === 'dialog') return nextMessage(null, message);
    let urls = [];
    if (message.slack.text) {
      urls = message.slack.text.match(urlPattern) || urls;
    }

    if (message.slack.attachments) {
      const imageUrls = message.slack.attachments.filter(a => !!a.image_url).map(a => a.image_url) || [];
      urls = urls.concat(imageUrls);
    }

    if (urls.length === 0) return nextMessage(null, message);

    getUnfurlsForUrls(urls, (err, unfurls) => {
      if (err) {
        // use original message if an error occurred
        return nextMessage(null, message);
      }
      message.unfurls = (unfurls || {}).reduce((prev, curr) => {
        prev[curr.url] = curr;
        return prev;
      }, {});

      return nextMessage(null, message);
    });
  }, cb);

module.exports = {
  urlPattern,
  getUnfurlsForUrls,
  getUnfurlsForMessages
};
