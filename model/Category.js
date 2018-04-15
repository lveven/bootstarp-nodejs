//category模型
var mongoose=require('mongoose');
//加载
var categorySchema=require('../schemas/category');
//创建模型Category
module.exports=mongoose.model('Category',categorySchema);