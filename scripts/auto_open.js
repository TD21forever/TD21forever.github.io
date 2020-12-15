let spawn = require('hexo-util/lib/spawn');
hexo.on('new', (data) => {
  spawn("D:/\Typora/\Typora.exe", [data.path]);
});