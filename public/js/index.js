//注册/登录切换
$(function(){
    $('.js-login').click(function(){
        $('.login').show();
        $('.register').hide();
    });
    $('.js-register').click(function(){
        $('.login').hide();
        $('.register').show();
    });
    //注册页面通过ajax提交数据
    $('.btn-register').click(function(){
        $.ajax({
            //提交方式
            type:'post',
            //url
            url:'/api/user/register',
            //提交数据
            data:{
                username:$('.register input[name="name"]').val(),
                password:$('.register input[name="password"]').val(),
                repassword:$('.register input[name="repassword"]').val()
            },
            dataType:'json',
            success:function(result){
                //在前台显示提示信息
                $('.display-info').html(result.message);
                if(!result.code){
                    //注册成功后1秒切换到登录页面
                    setTimeout(function(){
                        $('.login').show();
                        $('.register').hide();
                    },1000);
                }
            }
        });
    });
   //登录处理
   $('.btn-login').click(function(){
    $.ajax({
        //提交方式
        type:'post',
        //url
        url:'/api/user/login',
        //提交数据
        data:{
            username:$('.login input[name="name"]').val(),
            password:$('.login input[name="password"]').val(),
        },
        dataType:'json',
        success:function(result){
            $('.display-info').html(result.message);
            if(!result.code){
                //登录成功
                window.location.reload();
            }
        }
    });
  });
  //退出
  $('.btn-exit').click(function(){
    $.ajax({
        url:'/api/user/logout',
        type:'post',
        //提交数据
        success:function(result){
            if(!result.code){
                window.location.reload();
            }
        }
    });
      
  });
})