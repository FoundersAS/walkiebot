'use strict';
import crypto from 'crypto';
import isUrl from 'is-url';
import filesize from './filesize';

const RE_URL = /(?:^|[^<])(https?:\/\/[^\s>|]+)/g;
const RE_FANCY_URL = /<([^>\|]+)(?:\|([^>]+))?>/g;
const RE_CHANNEL = /(?:\s|^)(#[\w-_]+)/g;
const RE_SLACK_CHANNEL = /<(#[^>\|]+)(?:\|([^>]+))?>/g;
const RE_USER = /(?:\s|^)(@[\w-_]+)/g;
const RE_SLACK_USER = /<(@[^>\|]+)(?:\|([^>]+))?>/g;
const RE_BOLD = /(?:^|[^\*])\*(.+?)\*/g;
const RE_STRIKE = /(^|\s)~(.*)~($|\s)/g;
const RE_ITALIC = /(^|\s)_([^_\n]*)_($|\s)/g;
const RE_QUOTE_MULTI = /(?:\n|^)>{3}\s?((.|[\r\n])*)/;
const RE_QUOTE = /(?:\n|^)>\s?(.*)/;
const TRIPLE_TICKS = /(?:`{3}\n?)((?:.|[\r\n])*?)(?:`{3})/;
const DOUBLE_TICKS = /(?:`{2})((?:.|[\r\n])*?)(?:`{2})/;
const SINGLE_TICKS = /(?:`{1})([^\n`]+)(?:`{1})/;

const TRIPLE_PLACEHOLDER = /(\[T_TRIPLE_TICKS\])((?:.|[\r\n])*)(\[\/T_TRIPLE_TICKS\])/g;
const DOUBLE_PLACEHOLDER = /(\[T_DOUBLE_TICKS\])((?:.|[\r\n])*)(\[\/T_DOUBLE_TICKS\])/g;
const SINGLE_PLACEHOLDER = /(\[T_SINGLE_TICKS\])(.*?)(\[\/T_SINGLE_TICKS\])/g;
const QUOTE_PLACEHOLDER = /(\[T_QUOTE\])(.*?)(\[\/T_QUOTE\])/g;
const QUOTE_MULTI_PLACEHOLDER = /(\[T_QUOTE_MULTI\])((?:.|[\r\n])*)(\[\/T_QUOTE_MULTI\])/g;
const BOLD_PLACEHOLDER = /(\[T_BOLD\])(.*?)(\[\/T_BOLD\])/g;
const CHANNEL_PLACEHOLDER = /\[T_CHANNEL id="(.*?)" name="(.*?)"\]/g;
const USER_PLACEHOLDER = /\[T_USER id="(.*?)" name="(.*?)"\]/g;
const ITALIC_PLACEHOLDER = /(\[T_ITALIC\])(.*?)(\[\/T_ITALIC\])/g;
const STRIKE_PLACEHOLDER = /(\[T_STRIKE\])(.*?)(\[\/T_STRIKE\])/g;
const URL_PLACEHOLDER = /\[T_URL url="(.*?)" text="(.*?)"\]/g;
const URL_TICKS_PLACEHOLDER = /\[T_URL_TICKS url="(.*?)" text="(.*?)"\]/g;

const hash = input => crypto.createHash('sha256').update(input).digest('hex');

const parse = (str, isBot) => {
  if (!str) return '';

  const parseUrlForTicks = str => {
    return str.replace(RE_URL, (str, match) => {
      if (str !== match) return `${str.substr(0, 1)}<${match}>`;
      return `<${match}>`;
    })
    .replace(RE_FANCY_URL, (str, url, text) => {
      if (!isUrl(url)) return str;
      if (!isBot && isUrl(url)) return `[T_URL_TICKS url="${url}" text="${url}"]`;
      if (text) return `[T_URL_TICKS url="${url}" text="${text}"]`;
      return `[T_URL_TICKS url="${url}" text="${url}"]`;
    });
  };

  const separator = hash(str) + Date.now();

  const multiQuote = str.match(RE_QUOTE_MULTI);
  if (multiQuote) {
    const firstPart = str.substr(0, multiQuote.index);
    const secondPart = multiQuote[1];
    const thirdPart = str.substr(multiQuote.index + multiQuote[0].length);
    const tmp = parse(`${firstPart}${separator}${thirdPart}`, isBot);
    return tmp.replace(separator, `[T_QUOTE_MULTI]${parse(secondPart, isBot)}[/T_QUOTE_MULTI]`);
  }

  const singleQuote = str.match(RE_QUOTE);
  if (singleQuote) {
    const firstPart = str.substr(0, singleQuote.index);
    const secondPart = singleQuote[1];
    const thirdPart = str.substr(singleQuote.index + singleQuote[0].length);
    const tmp = parse(`${firstPart}${separator}${thirdPart}`, isBot);
    return tmp.replace(separator, `[T_QUOTE]${parse(secondPart, isBot)}[/T_QUOTE]`);
  }

  const triples = str.match(TRIPLE_TICKS);
  if (triples) {
    const firstPart = str.substr(0, triples.index);
    const secondPart = triples[1];
    const thirdPart = str.substr(triples.index + triples[0].length);
    const tmp = parse(`${firstPart}${separator}${thirdPart}`);
    return tmp.replace(separator, `[T_TRIPLE_TICKS]${parseUrlForTicks(secondPart)}[/T_TRIPLE_TICKS]`);
  }

  const doubles = str.match(DOUBLE_TICKS);
  if (doubles) {
    const firstPart = str.substr(0, doubles.index);
    const secondPart = doubles[1];
    const thirdPart = str.substr(doubles.index + doubles[0].length);
    const tmp = parse(`${firstPart}${separator}${thirdPart}`, isBot);
    return tmp.replace(separator, `[T_DOUBLE_TICKS]${parseUrlForTicks(secondPart)}[/T_DOUBLE_TICKS]`);
  }

  const singles = str.match(SINGLE_TICKS);
  if (singles) {
    const firstPart = str.substr(0, singles.index);
    const secondPart = singles[1];
    const thirdPart = str.substr(singles.index + singles[0].length);
    const tmp = parse(`${firstPart}${separator}${thirdPart}`, isBot);
    return tmp.replace(separator, `[T_SINGLE_TICKS]${parseUrlForTicks(secondPart)}[/T_SINGLE_TICKS]`);
  }

  return str
    .replace(RE_ITALIC, (str, before, text, after) => {
      return `${before}[T_ITALIC]${text}[/T_ITALIC]${after}`;
    })
    .replace(RE_URL, (str, match) => {
      if (str !== match) return `${str.substr(0, 1)}<${match}>`;
      return `<${match}>`;
    })
    .replace(RE_FANCY_URL, (str, url, text) => {
      if (!isUrl(url)) return str;
      if (!isBot && isUrl(url)) return `[T_URL url="${url}" text="${url}"]`;
      if (text) return `[T_URL url="${url}" text="${text}"]`;
      return `[T_URL url="${url}" text="${url}"]`;
    })
    .replace(RE_CHANNEL, (str, match) => {
      if (str !== match) return `${str.substr(0, 1)}[T_CHANNEL id="none" name="${match}"]`;
      return `[T_CHANNEL id="none" name="${match}"]`;
    })
    .replace(RE_SLACK_CHANNEL, (str, id, name) => {
      return `[T_CHANNEL id="${id}" name="#${name}"]`;
    })
    .replace(RE_USER, (str, match) => {
      if (str !== match) return `${str.substr(0, 1)}[T_USER id="none" name="${match}"]`;
      return `[T_USER id="none" name="${match}"]`;
    })
    .replace(RE_SLACK_USER, (str, id, name) => {
      return `[T_USER id="${id}" name="@${name}"]`;
    })
    .replace(RE_BOLD, (str, match) => {
      const firstChar = str.substr(0, 1);
      if (str !== match && firstChar !== '*') {
        return `${firstChar}[T_BOLD]${match}[/T_BOLD]`;
      }
      return `[T_BOLD]${match}[/T_BOLD]`;
    })
    .replace(RE_STRIKE, (str, before, text, after) => `${before}[T_STRIKE]${text}[/T_STRIKE]${after}`);
};

export default (str, isBot = true, unfurls = {}) => {
  return parse(str, isBot, unfurls)
    .replace(TRIPLE_PLACEHOLDER, (str, start, text, end) => {
      return [
        '<div class="message__text--code-block">',
        '<span class="message__text--only-select">```</span>',
        text,
        '<span class="message__text--only-select">```</span>',
        '</div>'
      ].join('');
    })
    .replace(DOUBLE_PLACEHOLDER, (str, start, text, end) => {
      return [
        '``',
        text,
        '``'
      ].join('');
    })
    .replace(SINGLE_PLACEHOLDER, (str, start, text, end) => {
      return [
        '<div class="message__text--code">',
        '<span class="message__text--only-select">`</span>',
        text,
        '<span class="message__text--only-select">`</span>',
        '</div>'
      ].join('');
    })
    .replace(QUOTE_PLACEHOLDER, (str, start, text, end) => {
      return [
        '<div class="message__text--quote">',
        '<span class="message__text--quote-spacer"></span>',
        '<div class="message__text--quote-text">',
        '<span class="message__text--only-select">></span>',
        text,
        '</div>',
        '</div>'
      ].join('');
    })
    .replace(QUOTE_MULTI_PLACEHOLDER, (str, start, text, end) => {
      return [
        '<div class="message__text--quote">',
        '<span class="message__text--quote-spacer"></span>',
        '<div class="message__text--quote-text">',
        '<span class="message__text--only-select">>>></span>',
        text,
        '</div>',
        '</div>'
      ].join('');
    })
    .replace(BOLD_PLACEHOLDER, (str, start, text, end) => {
      return [
        '<span class="message__text--bold">',
        '<span class="message__text--only-select">*</span>',
        text,
        '<span class="message__text--only-select">*</span>',
        '</span>'
      ].join('');
    })
    .replace(ITALIC_PLACEHOLDER, (str, start, text, end) => {
      return [
        '<span class="message__text--italic">',
        '<span class="message__text--only-select">_</span>',
        text,
        '<span class="message__text--only-select">_</span>',
        '</span>'
      ].join('');
    })
    .replace(STRIKE_PLACEHOLDER, (str, start, text, end) => {
      return [
        '<span class="message__text--strike">',
        '<span class="message__text--only-select">~</span>',
        text,
        '<span class="message__text--only-select">~</span>',
        '</span>'
      ].join('');
    })
    .replace(CHANNEL_PLACEHOLDER, (str, id, name) => {
      return `<a class="message__link message__link--channel" href="#" slack-id="${id}">${name}</a>`;
    })
    .replace(USER_PLACEHOLDER, (str, id, name) => {
      return `<a class="message__link message__link--user" href="#" slack-id="${id}">${name}</a>`;
    })
    .replace(URL_PLACEHOLDER, (str, url, text) => {
      const unfurl = unfurls[url];
      if (!unfurl || !unfurl.image) return `<a class="message__link" href="${url}" target="_blank">${text}</a>`;

      return [
        '<span class="message__unfurl">',
        `<a class="message__link" href="${url}" target="_blank">${text}</a> (${filesize(unfurl.size)})`,
        '<span class="message__unfurl-caret icon-caret" onclick="onunfurlclick(event);">',
        '</span>',
        '<div>',
        `<div class="message__unfurl-image" style="background-image: url(${url})">`,
        `<a href="${url}" target="_blank">`,
        `<img onload="onimageload(this);" onerror="onunfurlerror(this);" src="${url}" />`,
        '</a>',
        '</div>',
        '</div>',
        '</span>'
      ].join('');
    })
    .replace(URL_TICKS_PLACEHOLDER, (str, url, text) => {
      return `<a class="message__link message__link--in-ticks" href="${url}" target="_blank">${text}</a>`;
    });
};
