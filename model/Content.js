//content模型
var mongoose=require('mongoose');
//加载
var contentSchema=require('../schemas/content');
//创建模型Content
module.exports=mongoose.model('Content',contentSchema);