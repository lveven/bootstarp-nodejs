/*
* author lveven
* date 2018年4月13日19:03:40
* 应用程序的启动（入口)文件
*/

var express=require('express');

//加载模板处理模块,设置前后端分离
var swig=require('swig');

//引入mongoose模块，数据库操作模块
var mongoose=require('mongoose');

//加载body-parser,解析前端提交的数据
var bodyParser=require('body-parser');

//加载cookies模块，用来存储数据
var Cookies=require('cookies');
//加载用户模块
var User=require('./model/User');
var path = require('path');
var http = require('http');
//文件上传
var multer  = require('multer');
//juquery
var $  = require('jquery');

//创建app应用
var app=express();

var ueditor = require("ueditor")  

app.use(bodyParser.urlencoded({  
    extended: true  
}))  
app.use(bodyParser.json()); 

// 支持七牛上传，如有需要请配置好qn参数，如果没有qn参数则存储在本地
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), {
    qn: {
        accessKey: 'IrFPtVc2TPwaTG9WXKNKJl2OMMXMLJ-vTVmzw7ja',
        secretKey: 'zQ81EB2Cdsa5_vCW-NRl0jGwcfpHnSPYB42WW-eS',
        bucket: 'lvphp',
        origin: 'http://{bucket}.u.qiniudn.com'
    },
    local:true
}, function(req, res, next) {
  // ueditor 客户发起上传图片请求
  var imgDir = '/img/ueditor/'
  if(req.query.action === 'uploadimage'){
    var foo = req.ueditor;
    var imgname = req.ueditor.filename;
    res.ue_up(imgDir); //你只要输入要保存的地址 。保存操作交给ueditor来做
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage'){
    
    res.ue_list(imgDir);  // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {

    res.setHeader('Content-Type', 'application/json');
    res.redirect('/ueditor/ueditor.config.json')
}}));



app.use(multer({
    dest: './public/images',
    rename: function (fieldname, filename) {
      return filename;
    }
}));

//静态文件请求处理
//设置静态文件托管use,当用户访问url以/public开始，那么直接返回对应的__dirname+'/public'
app.use('/public',express.static(__dirname+'/public'));

//配置应用模板，第一个参数代表模板名称，也是文件的后缀，第二个处理模板的是方法
app.engine('html',swig.renderFile);

//设置模板文件存放的目录，第一个参数必须是views,第二个是目录
app.set('views','./views');

//注册使用的模板引擎,第一个参数必须是view engine，第二个是模板名称
app.set('view engine','html');

//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

//配置bodyParser
app.use(bodyParser.urlencoded({extended:true}));

//设置cookie
app.use(function(req,res,next){
    //实例化cookies
    req.cookies=new Cookies(req,res);
    //读取cookies,并解析成对象
    req.userInfo={};
    //判断用户是否有登录
    if(req.cookies.get('userInfo')){
        try{
            //解析用户信息
            req.userInfo=JSON.parse(req.cookies.get('userInfo'));
            //获取当前用户的类型，判断是否管理员
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin=Boolean(userInfo.isAdmin);
                next();
            });
        }catch(e){

        }
    }else{
        next();
    }
});
//根据不同功能划分模块
//后台
app.use('/admin',require('./routers/admin'));
//前台
app.use('/',require('./routers/main'));
//api
app.use('/api',require('./routers/api'));

//首页，动态文件请求处理
app.get('/',function(req,res,next){
    //向客户端发送数据
    // res.send('<h1>欢迎来我的博客</h1>');
    /*
    读取views目录下的指定文件,解析并返回给客户端
    */
    res.render('index');//相当于./views/index.html
});

//连接数据库
mongoose.connect('mongodb://localhost:27017/blogDB',function(err){
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');
        app.listen(8010);
    }
});

// //监听
// app.listen(8081);


