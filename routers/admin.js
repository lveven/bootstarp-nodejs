//后台
var express=require('express');
var User=require('../model/User');
var Category=require('../model/Category');
var Content=require('../model/Content');
var md5=require('md5');

//创建路由对象
var router=express.Router();
//验证管理员
router.use(function(req,res,next){
    if(!req.userInfo.isAdmin){
        res.send('对不起，只有管理员才可以进入后台管理');
        return;
    }
    next();
});

//后台首页
router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo:req.userInfo  //模板
    });
});
//用户管理
router.get('/user',function(req,res,next){
    /*
    查找数据库中的用户信息，分页显示
    limit(Number)  限制显示的条数
    skip()   忽略数据的条数
    */
    var page=Number(req.query.page||1);//设置默认显示第一页
    var limit=20;//每页显示5条数据
    var pages=0;
    var nextPage = lastPage = 1;
    
    //统计总共的记录数
    User.count().then(function(count){
        //计算总页数,向上取整
        pages=Math.ceil(count/limit);
        /*
        //当前页数不能超过总页数
        page=Math.min(page,pages);
        //当前页数不能少于1页
        page=Math.max(page,1);
        */
        //忽略当前页之前页面的数据
        var skip=(page-1)*limit;
        nextPage = Math.min(page + 1,pages);
        lastPage = Math.max(page - 1,1);
        //查找数据并显示
        User.find().limit(limit).skip(skip).then(function(users){
            res.render('admin/user',{//模板
                userInfo:req.userInfo,  //用户信息
                users:users, 
                page:page,    //当前页数
                pages:pages,  //总页数
                count:count,  //数据总条数
                limit:limit,   //每页显示条数
                lastPage:lastPage,
                nextPage:nextPage
            });
        });
    });
});
//编辑用户
router.get('/user_edit',function(req,res,next){
    var id=req.query.id||'';
    if(id==''){
        res.render('admin/error',{
            message:'缺少必要数据'
        });
        return;
    }
    User.findOne({
        _id:id
    }).then(function(result){
        //判断分类信息是否存在
        if(!result){
            res.render('admin/error',{
                message:'不存在此会员'
            });
        }else{
            res.render('admin/user_edit',{
                user:result
            });
        }
    });
})
//编辑用户保存
router.post('/user_edit',function(req,res){
    //获取通过post提交的数据
    var id=req.body.id||'';
    var username=req.body.username||'';
    var password = req.body.password||'';
    var isAdmin = req.body.isAdmin || false;
    isAdmin = Boolean(isAdmin);
    console.log(isAdmin)
    User.findOne({
        _id:id
    }).then(function(user){
        if(!user){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'不存在该会员'
            });
        }else{
            if(username==user.username && password == '' && isAdmin == user.isAdmin){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'未修改信息',
                    url:'/admin/user'
                });
                return Promise.reject();
            }else{
                Category.findOne({
                    _id:{$ne:id},//$ne表示不相等
                    username:username
                })
            }
        }
    }).then(function(sameUserName){
        if(sameUserName){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'用户名已经存在'
            });
            return Promise.reject();
        }else{
            if(password == ''){
                var updateArr = {
                    username:username,
                    isAdmin:isAdmin
                }
            }else{
                var updateArr = {
                    username:username,
                    password:md5(password),
                    isAdmin:isAdmin
                } 
            }
            return User.update({
                _id:id
            },updateArr);
        }
    }).then(function(){
        if(req.userInfo._id == id){
            req.cookies.set('userInfo',null);
            res.render('admin/success',{
                userInfo:req.userInfo,
                message:'修改成功,正在退出',
                url:'/'
            });
        }else{
            res.render('admin/success',{
                userInfo:req.userInfo,
                message:'修改成功',
                url:'/admin/user'
            });
        }
         
    });
});
//添加用户
router.get('/user_add',function(req,res,next){
    res.render('admin/user_add');
})
//添加用户保存
router.post('/user_add',function(req,res,next){
     //获取表单提交的数据
     var username=req.body.username||'';
     var password = req.body.password||'';
     var isAdmin = req.body.isAdmin|| false;
     isAdmin = Boolean(isAdmin);

     //判断输入不为空
     if(username==''){
         res.render('admin/error',{
             message:'姓名不能为空'
         });
         return;
     }
     if(password == ''){
        res.render('admin/error',{
            message:'密码不能为空'
        });
        return; 
     }

     //判断数据中是否存在
     User.findOne({
         username:username
     }).then(function(rs){
         if(rs){
             res.render('admin/error',{
                 message:'用户名已经存在'
             });
             return Promise.reject();
         }else{
             return new User({
                 username:username,
                 password:md5(password),
                 isAdmin:isAdmin
             }).save();
         }
     }).then(function(newCategory){
         res.render('admin/success',{
             userInfo:req.userInfo,
             message:'添加成功',
             url:'/admin/user'
         });
     });
})

//删除用户
router.get('/user_del',function(req,res,next){
    //获取要删除的分类id
    var id=req.query.id||'';
    User.remove({
        _id:id
    }).then(function(category){
        res.render('admin/success',{//模板
            message:'删除成功',
            url:'/admin/user'
        });
    });
})
//分类管理
router.get('/category',function(req,res,next){
    var page=Number(req.query.page||1);//设置默认显示第一页
    var limit=5;//每页显示5条数据
    var pages=0;
    var nextPage = lastPage = 1;
    
    //统计总共的记录数
    Category.count().then(function(count){
        //计算总页数,向上取整
        pages=Math.ceil(count/limit);
        /*
        //当前页数不能超过总页数
        page=Math.min(page,pages);
        //当前页数不能少于1页
        page=Math.max(page,1);
        */
        //忽略当前页之前页面的数据
        var skip=(page-1)*limit;
        nextPage = Math.min(page + 1,pages);
        lastPage = Math.max(page - 1,1);
        //查找数据并降序排列显示
        /*
        排序
        sort()
        eg:sort({_id:1})
        1:代表升序
        -1：代表降序
        */
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(category){
            res.render('admin/category',{//模板
                userInfo:req.userInfo,  //用户信息
                category:category, 
                page:page,    //当前页数
                pages:pages,  //总页数
                count:count,  //数据总条数
                limit:limit,   //每页显示条数
                lastPage:lastPage,
                nextPage:nextPage
            });
        });
    });
});
//添加分类
router.get('/category/add',function(req,res,next){
    res.render('admin/category_add',{
        userInfo:req.userInfo
    });
 });
 //处理分类提交数据
 router.post('/category/add',function(req,res){
     //获取表单提交的数据
    var name=req.body.name||'';

    //判断输入不为空
    if(name==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'名称不能为空'
        });
        return;
    }
    //判断数据中是否存在
    Category.findOne({
        name:name
    }).then(function(rs){
        if(rs){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类已经存在'
            });
            return Promise.reject();
        }else{
            //保存数据到数据库
            return new Category({
                name:name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'分类保存成功',
            url:'/admin/category'
        });
    });
});
//分类修改
router.get('/category/edit',function(req,res){
    //获取要修改的分类id
    var id=req.query.id||'';
    //console.log(id);
    //获取分类信息
    Category.findOne({
        _id:id
    }).then(function(category){
        //判断分类信息是否存在
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
        }else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            });
        }
    });
})
//分类修改保存
router.post('/category/edit',function(req,res){
    //获取通过post提交的数据
    var id=req.query.id||'';
    var name=req.body.name||'';
    //在数据库中查找分类信息
    Category.findOne({
        _id:id
    }).then(function(category){
        //判断分类信息是否存在
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
        }else{
            //当分类信息没有修改提交的时候
            if(name==category.name){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            }else{
                Category.findOne({
                    //查找数据库中是否存在当前修改后的分类名称
                    _id:{$ne:id},//$ne表示不相等
                    name:name
                })
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'数据库中已存在同名分类'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            });
        }
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'分类修改成功',
            url:'/admin/category'
        }); 
    });
});
//分类删除
router.get('/category/delete',function(req,res,next){
    //获取要删除的分类id
    var id=req.query.id||'';
    Category.remove({
        _id:id
    }).then(function(category){
        res.render('admin/success',{//模板
            userInfo:req.userInfo,  //用户信息
            message:'删除成功',
            url:'/admin/category'
        });
    });
})
//文章管理
router.get('/content',function(req,res,next){
    var page=Number(req.query.page||1);//设置默认显示第一页
    var limit=5;//每页显示5条数据
    var pages=0;
    var nextPage = lastPage = 1;
    
    //统计总共的记录数
    Content.count().then(function(count){
        //计算总页数,向上取整
        pages=Math.ceil(count/limit);
        var skip=(page-1)*limit;
        nextPage = Math.min(page + 1,pages);
        lastPage = Math.max(page - 1,1);

       //关联表查询 .populate()
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['user','category']).then(function(content){
            res.render('admin/content',{//模板
                userInfo:req.userInfo,  //用户信息
                content:content,
                page:page,    //当前页数
                pages:pages,  //总页数
                count:count,  //数据总条数
                limit:limit,   //每页显示条数
                lastPage:lastPage,
                nextPage:nextPage
            });
            
        });
    });
});
//添加文章
router.get('/content/add',function(req,res,next){
    Category.find().then(function(category){
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            category:category,
        })
    });
    
})
//内容保存
router.post('/content/add',function(req,res){
    if(req.body.category==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类列表内容不能为空'
        })
        return;
    }
    if(req.body.title==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'文章标题不能为空'
        })
        return;
    }
    new Content({
        category:req.body.category,
        user:req.userInfo._id.toString(),
        title:req.body.title,
        description:req.body.description,
        content:req.body.content,
    }).save().then(function(rs){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'文章保存成功',
            url:'/admin/content'
        })
    });
   
})
//文章删除
router.get('/content/delete',function(req,res,next){
    //获取要删除的分类id
    var id=req.query.id||'';
    Content.remove({
        _id:id
    }).then(function(category){
        res.render('admin/success',{//模板
            userInfo:req.userInfo,  //用户信息
            message:'删除成功',
            url:'/admin/content'
        });
    });
})

//文章修改
router.get('/content/edit',function(req,res){
    //获取要修改的分类id
    var id=req.query.id||'';
    var category=[];
    Category.find().sort({_id:-1}).then(function(rs){
        category=rs; 
        return Content.findOne({
            _id:id
        }).then(function(content){
            //判断分类信息是否存在
            if(!content){
                res.render('admin/error',{
                    userInfo:req.userInfo,
                    message:'分类信息不存在'
                });
                return Promise.reject();
            }else{
                res.render('admin/content_edit',{
                    userInfo:req.userInfo,
                    category:category,
                    content:content   
                });
            }
        });
    }); 
})
//文章修改保存
router.post('/content/edit',function(req,res){
    //获取通过post提交的数据
    var id=req.query.id||'';
    if(req.body.category==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类列表内容不能为空'
        })
        return;
    }
    if(req.body.title==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'文章标题不能为空'
        })
        return;
    }
    //在数据库中查找分类信息
    Content.findOne({
        _id:id
    }).then(function(content){
        //判断分类信息是否存在
        if(!content){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'文章不存在'
            });
        }else{
            return Content.update({
                _id:id
            },{
                category:req.body.category,
                users:req.body.users,
                title:req.body.title,
                description:req.body.description,
                content:req.body.content,
            });
        }
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'文章修改成功',
            url:'/admin/content'
        }); 
    });
});
//返回数据
module.exports=router;