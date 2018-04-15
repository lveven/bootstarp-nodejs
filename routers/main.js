//前台
var express=require('express');
var md5=require('md5');
var async=require('async');
var howdo=require('howdo');
//创建路由对象
var router=express.Router();
var Category=require('../model/Category');
var Content=require('../model/Content');
var User=require("../model/User");
var Comment=require("../model/Comment");
var cheerio=require('cheerio');
//设置中间件,处理通用数据
var data;
router.use('/',function(req,res,next){
    data={
        userInfo:req.userInfo,
        category:[],
    }
    //读取分类信息
    Category.find().then(function(category){
        data.category=category;
        next();
    });
});
router.get('/',function(req,res,next){
    data.category2=req.query.category||'';
    data.page=Number(req.query.page||1);
    data.limit=100,
    data.pages=0,
    data.nextPage=data.lastPage = 1,
    data.count=0
    var where={};
    //判断是否存在分类
    if(data.category2){
        where.category=data.category2
    }
    Content.where(where).count().then(function(count){
        //计算总页数,向上取整
        data.count=count;
        data.pages=Math.ceil(data.count/data.limit);
        var skip=(data.page-1)*data.limit;
        data.nextPage = Math.min(data.page + 1,data.pages);
        data.lastPage = Math.max(data.page - 1,1);
       //关联查询 .populate('category')
        return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(['user','category']).then(function(content){
            data.content=content;
            for(k in data.content){
                (function(k){
                    Comment.count({content:data.content[k]._id}).then(function(count){
                        //setTimeout(function(){
                            data.content[k].count = count   
                        //},500)  
                    })   
                })(k) 
                
                
            }
        
            res.render('home/index',data);
        });
    });
    
 });
//详情页
router.get('/detail',function(req,res,next){
    var contentId=req.query.contentId;
    Content.findOne({_id:contentId}).populate(['user','category']).then(function(content){
        data.content=content;
        content.views++;
        content.save();
        Comment.count({content:contentId}).then(function(count){
            data.count = count 
        });
        Comment.find({content:contentId}).sort({_id:-1}).populate(['user']).then(function(comment){
            data.comment=comment;
            res.render('home/detail',data);
        });
        
    });
});
router.get('/jump',function(req,res,next){
    res.render('home/jump',data);
})
router.post('/comment',function(req,res,next){
    return new Comment({
        statusvalue:req.body.statusvalue,
        content:req.body.contentId,
        user:req.userInfo._id
    }).save().then(function(comment){
        res.render('home/jump',{
            type:'success',
            message:'提交成功',
            url:"/detail?contentId="+req.body.contentId,
            time:3
        });
    });
});
//返回数据
module.exports=router;