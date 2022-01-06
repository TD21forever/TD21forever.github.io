// let spawn = require('hexo-util/lib/spawn');
// hexo.on('new', (data) => {
//   spawn("D:/\Typora/\Typora.exe", [data.path]);
// });


var exec = require('child_process').exec;
// Hexo 2.x 用户复制这段
// hexo.on('new', function(path){
//    exec('open -a "Typora编辑器绝对路径.app" ' + path);
//});
// Hexo 3 用户复制这段
hexo.on('new', function(data){
    exec('open -a "/Applications/Typora.app" ' + data.path);
});
