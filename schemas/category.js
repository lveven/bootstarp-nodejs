//数据库表结构
var mongoose=require('mongoose');
 
//定义分类表结构
module.exports=new mongoose.Schema({
    //分类名称
    name:String
});
