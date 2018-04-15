//users模型
var mongoose=require('mongoose');
//加载
var usersSchema=require('../schemas/user');
//创建模型User
module.exports=mongoose.model('User',usersSchema);