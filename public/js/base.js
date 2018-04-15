/**
 * RainJS
 *
 *  依赖artDialog
 *  <link href="static/art-dialog/css/ui-dialog.css" rel="stylesheet" />
 *  <script src="static/art-dialog/dist/dialog-min.js"></script>
 *
 *  <link href="static/rain/css/base.css" rel="stylesheet" />
 *  <script src="static/rain/base.js"></script>
 *
 * @author  Zou Yiliang
 * @date 20150531
 */

window.rain = function () {
};

$(function () {

    /**
     * 弹窗提示
     *
     * rain.alert("提示信息", callback)
     * rain.alert("提示信息", "标题", callback)
     */
    rain.alert = function (content, title, success) {
        success = success || function () {
        };

        if (typeof title == "function") {
            success = title;
            title = undefined;
        }

        title = title || "系统提示";
        var d = dialog({
            zIndex: 2048,
            backdropOpacity: 0.4,
            title: title,
            content: "<div style='min-width:18em'>" + content + "</div>",
            okValue: "确定",
            autofocus: true,
            ok: function () {
            },
            onclose: success
        });
        d.showModal();
    }

    /**
     * 显示loading图标
     *
     * var load = rain.loading();   或者 var load = rain.loading(按扭对象或选择器);
     * load.start();
     * setTimeout(function(){load.stop()},3000);
     */
    rain.loading = function (btn, content) {
        if (btn) {
            var d = {};
        } else {
            content = content || "正在加载, 请稍后 ...";
            var d = dialog({
                content: '<div class="ui-dialog-loading" style="margin-top:0px">Loading..</div><div style="margin-top: 10px">' + content + '</div>',
                backdropOpacity: 0.05
            });
        }

        d.btn = btn ? $(btn) : false;
        d.start = function () {
            if (d.btn) {

                d.btn.addClass('disabled').attr("disabled", "disabled");

                var loadingText = content || (d.btn.get(0).hasAttribute("data-loading-text") ? d.btn.attr("data-loading-text") : "正在加载...");

                d.btn.data('oldHtml', d.btn.html());
                d.btn.html("<span class='rain-icon-loading'></span> " + loadingText);

            } else {
                d.showModal();
            }
            return d;
        };
        d.stop = function () {

            if (d.btn) {
                d.btn.removeClass('disabled').removeAttr("disabled");
                d.btn.html(d.btn.data('oldHtml'));
            } else {
                d.close().remove();
            }

        };
        return d;
    }

    /**
     * 自动消失 弹窗提示
     *
     * rain.cute()
     * rain.cute('操作成功')
     * rain.cute('操作成功', 3000)
     * rain.cute('操作成功',function(){})
     */
    rain.cute = function (content, time, callback) {

        content = content || '操作成功';
        time = time || 2000;
        if (typeof time == "function") {
            callback = time;
            time = 2000;
        }
        callback = callback || function () {
        }

        var d = dialog({
            zIndex: 2048,
            content: "<div style='_width:120px;min-width: 120px;text-align: center;padding-top:15px;padding-bottom: 15px;'>" + content + "</div>",
            backdropOpacity: 0.05
        });
        d.showModal();
        setTimeout(function () {
            d.close().remove();
            callback();
        }, time);
    }

    /**
     * 确认弹框
     *
     * rain.confirm("你确定要执行xxx吗", function(){
     *   alert('执行');
     * },function(){
     *   alert('不执行');
     * });
     *
     * @param content 提示信息
     * @param success 点击确定后的回调函数
     * @param cancel 点击取消后的回调函数
     */
    rain.confirm = function (content, success, cancel) {

        success = success || function () {
        };
        cancel = cancel || function () {
        };

        var d = dialog({
            zIndex: 2048,
            backdropOpacity: 0.4,
            title: '系统提示',
            content: "<div style='min-width:18em'>" + content + "</div>",
            okValue: "确定",
            autofocus: false,
            ok: function () {
                this.close().remove();
                success();
            },
            cancelValue: "取消",
            cancel: function () {
                this.close().remove();
                cancel();
            }
        });
        d.showModal();
    }

    /**
     * 弹出显示页面隐藏的内容
     * @param selector 需要弹出元素的jQuery选择器
     * @param callback 关闭时回调函数
     */
    rain.show = function (selector, callback) {

        callback = callback || function () {
        };

        var elem = $(selector);
        elem.show();

        //弹出层初始化 参数都在这里配置
        var dia = dialog({
            content: elem.get(0),
            backdropOpacity: 0.4
        });

        dia.showModal();//show()显示 showModal()有遮盖层
        this.close = function () {
            dia.close();
            callback();
        };
        return this;
    }

    /**
     * 弹出显示ajax获取的内容
     * @param url
     */
    rain.ajaxShow = function (url, data) {
        var layerId = "rainAjaxPopupLayer";
        var div;
        if ($("#" + layerId).length == 0) {
            div = $("<div id=\"" + layerId + "\" style=\"display:none;\"></div>");
            div.appendTo($("body"));
        } else {
            div = $("#" + layerId);
        }

        $.get(url, data, function (str) {
            div.html(str);
            this.close = rain.show("#" + layerId).close;
        });
        return this;
    }

    /**
     * 中文验证
     *
     * 示例
     * rain.isChinese('我是中文');
     *
     * @param str
     * @returns boolean
     */
    rain.isChinese = function (str) {
        var reg = /^[\u4E00-\u9FA5]+$/;
        return reg.test(str);
    }

    /**
     * 邮箱验证
     *
     * 示例
     * rain.isEmail('123456@qq.com');
     *
     * @param str
     * @returns boolean
     */
    rain.isEmail = function (str) {
        var reg = /^[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&\'*+\\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
        return reg.test(str);
    }

    /**
     * 手机验证
     *
     * 示例
     * rain.isMobile('13888888888');
     *
     * @param str
     * @returns boolean
     */
    rain.isMobile = function (str) {
        var reg = /^1\d{10}$/;
        return reg.test(str);
    }

    /**
     * 数字验证
     *
     * 示例
     * rain.isNumber('123');
     *
     * @param str
     * @returns boolean
     */
    rain.isNumber = function (str) {
        var reg = /^\d+$/;
        return reg.test(str);
    }

    /**
     * 将 Date 转化为指定格式的String
     * @param date
     * @param format "yyyy-m-d h:i:s"
     * @returns string
     */
    rain.dateFormat = function (date, fmt) {
        // 月(m)、日(d)、小时(h)、分(i)、秒(s)、季度(q) 可以用 1-2 个占位符，
        // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
        // 例子：
        // (new Date()).Format("yyyy-m-dd hh:ii:ss.S") ==> 2006-07-02 08:09:04.423
        // (new Date()).Format("yyyy-m-d h:i:s.S")      ==> 2006-7-2 8:9:4.18

        var o = {
            "m+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "i+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
        return fmt;
    };


    //重要操作的confirm
    //<a href="delete.php" class="rain-confirm" data-dialog-content="您确定执行此操作吗">删除</a>
    $(document).on("click", "a.rain-confirm", function () {

        var _this = this;

        var content = _this.hasAttribute("data-dialog-content") ? _this.getAttribute("data-dialog-content") : "您确定执行此操作吗?";
        var title = _this.hasAttribute("data-dialog-title") ? _this.getAttribute("data-dialog-title") : "提示";

        var d = dialog({
            zIndex: 2048,
            autofocus: false,
            title: title,
            content: "<div style='min-width:18em'>" + content + "</div>",
            okValue: "确定",
            ok: function () {
                var url = _this.href;
                window.location = url;
            },
            cancelValue: "取消",
            cancel: function () {
            }
        });
        d.showModal();

        return false;
    });

    //全选
    //data-selector是目录对象jQuery选择器
    //<input type="checkbox" class="rain-select-all" data-selector=":checkbox[name='id[]']" />
    $(".rain-select-all").click(function () {
        var _this = this;
        var selector = $(this).attr("data-selector");
        $(selector).each(function () {
            this.checked = _this.checked;
        });
    });

    //批量操作
    $(".rain-batch").click(function () {
        var $this = $(this);
        var url = $this.attr("href");

        //操作确认
        var content = this.hasAttribute("data-dialog-content") ? this.getAttribute("data-dialog-content") : "您确定执行此操作吗?";
        var title = "提示";

        //没有选择数据警告
        var warningMessage = "请选择需要操作的数据";

        var arr = $(".rain-batch-item:checked");

        var data = "";

        var field = "id[]";
        arr.each(function () {
            data = (data == "") ? "" : (data + "&");
            data += field + "=" + this.value;
        });

        if (data == "") {
            rain.alert(warningMessage);
            return false;
        }

        var d = dialog({
            zIndex: 2048,
            autofocus: false,
            title: title,
            content: "<div style='min-width:18em'>" + content + "</div>",
            okValue: "确定",
            ok: function () {
                window.location = url + "?" + data;
            },
            cancelValue: "取消",
            cancel: function () {
            }
        });
        d.showModal();

        //阻止默认事件行为和事件冒泡
        return false;
    });

});
