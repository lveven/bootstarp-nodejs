//数据库表结构
var mongoose=require('mongoose');
 
//定义文章表结构
module.exports=new mongoose.Schema({
    //关联字段--分类
    category:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用关联的模型
        ref:'Category'
    },
    //关联字段--用户
    user:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用关联的模型
        ref:'User'
    },
    comment:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用关联的模型
        ref:'Comment'
    },
    //创建时间
    addTime:{
        type:Date,
        default:new Date()//当前时间
    },
    //阅读量
    views:{
        type:Number,
        default:0
    },
    title:{
        type:String,
        default:''
    },
    description:{
        type:String,
        default:''
    },
    content:{
        type:String,
        default:''
    }
});
