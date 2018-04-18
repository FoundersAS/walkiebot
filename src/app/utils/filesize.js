import filesize from 'filesize';

const size = filesize.partial({ base: 10, round: 0, output: 'array' });

export default n => {
  if (!n) return '0kB';
  return size(n).join('');
};
