import EmojiShort from 'emoji-shortname-to-image';

const emoji = new EmojiShort('/emoji/apple/64/');

const toUnicode = emoji.toUnicode;
emoji.toUnicode = string => {
  if (!string) return null;
  return toUnicode(string);
};

const toImage = emoji.toImage;
emoji.toImage = string => {
  if (!string) return null;
  return toImage(string);
};

const unicodeToImage = emoji.unicodeToImage;
emoji.unicodeToImage = string => {
  if (!string) return null;
  return unicodeToImage(string);
};
export default emoji;
