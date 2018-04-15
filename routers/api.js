//api
var express=require('express');
var User=require('../model/User');
var md5=require('md5');
//创建路由对象
var router=express.Router();

var responseData;
//初始化,统一返回格式
router.use(function(req,res,next){
    responseData={
        //状态码
        code:0,
        //提示信息
        message:''
    }
    next();
});
/*
--------用户注册验证逻辑---------
  1.用户名不能为空
  2.密码不能为空
  3.确认密码与密码一致
  4.用户名未注册
  5.用户名密码正确
*/
//处理注册提交请求
router.post('/user/register',function(req,res,next){
    //console.log(req.body);
    //获取前台表单传递的数据
    var username=req.body.username;
    var password=req.body.password;
    var repassword=req.body.repassword;

    //逻辑判断
    if(username==''){
        responseData.code=1;
        responseData.message='用户名不能为空';
        //将信息返回给前台页面
        res.json(responseData);
        return;
    }
    if(password==''){
        responseData.code=2;
        responseData.message='密码不能为空';
        res.json(responseData);
        return;
    }
    if(password.length<6 || password.length>10){
        responseData.code=5;
        responseData.message='密码长度在6~10之间';
        res.json(responseData);
        return;
    }
    if(password!=repassword){
        responseData.code=3;
        responseData.message='两次输入的密码不一致';
        res.json(responseData);
        return;
    }
    //数据库中用户名是否被注册
    //查找一条
    User.findOne({
        username:username
    }).then(function(userInfo){
        //判断用户名是否已存在
        if(userInfo){
            responseData.code='4';
            responseData.message='用户名已经被注册了';
            res.json(responseData);
            return;
        }else{
            //不存在，保存用户信息到数据库
            var user=new User({
                username:username,
                password:md5(password)
            });
            return user.save();
        }
    }).then(function(newUserInfo){
        if(newUserInfo){
            responseData.message='注册成功';
            res.json(responseData);
        }
    });
});
//登录数据处理
router.post('/user/login',function(req,res,next){
    var username=req.body.username;
    var password=req.body.password;
    //判断输入不为空
    if(username==''||password==''){
        responseData.code=1;
        responseData.message='用户名或密码不能为空';
        res.json(responseData);
        return;
    }else{
        //否则，查找数据库中的记录,匹配用户名和密码
        User.findOne({
            username:username,
            password:md5(password)
        }).then(function(userInfo){
            //如果数据库中不存在用户名
            if(!userInfo){
                responseData.code=2;
                responseData.message='用户名或密码错误';
                res.json(responseData);
                return;
            }else{
                responseData.message='登陆成功';
                //返回用户信息
                responseData.userInfo={
                    _id:userInfo._id,
                    username:userInfo.username,
                }
                //向浏览器发送cookies数据，转成字符串保存在userInfo中
                req.cookies.set('userInfo',JSON.stringify({
                    _id:userInfo._id,
                    username:userInfo.username
                }));
                res.json(responseData);
                return;
            }
        });
    }
});
//退出登录
router.post('/user/logout',function(req,res,next){
    //清空userInfo的cookies
    req.cookies.set('userInfo',null);
    res.json(responseData);
    return; 
})
//返回数据
module.exports=router;