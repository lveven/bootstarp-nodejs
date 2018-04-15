//comments模型
var mongoose=require('mongoose');
//加载
var commentSchema=require('../schemas/comment');
//创建模型Category
module.exports=mongoose.model('Comment',commentSchema);