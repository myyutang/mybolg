var http=require('http');
var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var session=require('express-session');
var ws=require('socket.io');
module.exports=app;
/*app.use(express.static(__dirname+'/public'));//设置静态文件目录*/
app.use('/public',express.static(__dirname+'/public'));//设置静态文件目录(方式2，与第一个的区别)
app.set('views',__dirname+'/views');//设置模板位置
app.set('view engine','ejs');//设置模板引擎是什么
/*body-parser配置*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended:true } ));
/*cookie-parser配置*/
app.use(cookieParser('key199537'));// 密钥
app.use(session( { secret:'node' } ));
require('./module/configdata');
app.use('/public/ueditor/ue',require('./ue'));
app.use('/',require('./routor/index'));
let server=http.createServer(app).listen(3333);
let io=ws(server);
//接收前端发送过来的聊天内容
io.on('connection',socket=>{
    socket.on('msg',(data)=>{
        //把内容广播出去
        io.emit('xiaoxi',data)
    })
    socket.on('msg2',(data)=>{
        //把内容广播出去
        io.emit('xiaoxi2',data)
    })
})//监听事件，前端页面（使用socket）