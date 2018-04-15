//数据库表结构
var mongoose=require('mongoose');
 
//定义文章表结构
module.exports=new mongoose.Schema({
    //关联字段--分类
    content:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用模型
        ref:'Content'
    },
    //关联字段--用户
    user:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:'User'
    },
    //创建时间
    addTime:{
        type:Date,
        default:new Date()//当前时间
    },
    statusvalue:{
        type:String,
        default:''
    }
});
