/**
 * Version: 2.0.0
 * Author: Parker
 * Title: z ui 简便快捷组件集
 * Site: http://my.hellowmonkey.com
 */
;
(function(thisModule) {
    if (typeof define === 'function' && define.amd) {
        // AMD。注册为一个匿名的模块。
        define(['jquery'], thisModule)
    } else if ((typeof module !== "undefined" && module !== null) && module.exports) {
        module.exports = thisModule
    } else {
        // 浏览器全局
        window.z = thisModule(jQuery)
    }
})(function($, undefined) {
    // 注册全局变量
    var w = window,
        d = document,
        log = console.log,
        _ck = 'click',
        _b = 'body',
        winWidth = $(w).innerWidth(),
        winHeight = $(w).innerHeight(),
        transTime = 200,
        rootPath = _getZsrc(),
        libsPath = rootPath.replace('js/', '') + 'libs/',
        isMobile = function() {
            return navigator.userAgent.match(/mobile/i)
        }(),
        dateNow = new Date(),
        zShade = null,
        zShades = 0,
        zBoxs = [{
            cls: '.z-alert'
        }, {
            cls: '.z-modal',
        }, {
            cls: '.z-album',
            ani: true
        }],
        progressTimer = null,
        aniBoxTops = [],
        // 最终返回的变量，可以修改对应的值来修改部分组件的默认参数 如：通过修改z.rootPath的值来指定要动态加载的js或css的默认路径
        z = {
            version: '2.0.0',
            rootPath: rootPath,
            libsPath: libsPath,
            index: 99,
            zIndex: function() {
                return ++this.index
            },
            anims: ['z-anim-upbit', 'z-anim-scale', 'z-anim-scaleSpring', 'z-anim-up', 'z-anim-downbit'],
            animCls: 'z-anim-ms3',
            libs: {
                form: libsPath + 'jquery.form.min',
                waterfall: libsPath + 'masonry-docs.min',
                jscrollpane: libsPath + 'jquery.jscrollpane.min',
                datepicker: libsPath + 'bootstrap-datetimepicker.min'
            },
            title: {
                alert: '警告框',
                confirm: '询问框',
                prompt: '输入框',
                open: '提示窗体'
            },
            btns: ['取消', '确认'],
            color: ['default', 'blue', 'yellow', 'red', 'dark', 'green'],
            isMobile: isMobile,
            transTime: transTime,
            closeTime: transTime * 0.6,
            successTime: transTime * 8,
            delayTime: 4000,
            active: 'z-active',
            disabled: 'z-disabled',
            overflow: 'z-overflow',
            dt: dateNow,
            loadingHtml: '<span class="z-anim-rotate z-icon">&#xe624;</span>',
            sliderBtn: '<button class="z-slider-btn z-icon z-slider-prev">&#xe605;</button><button class="z-slider-btn z-icon z-slider-next">&#xe61d;</button>',
            winWidth: winWidth,
            winHeight: winHeight,
        },
        sliderLeftCls = function() {
            return $(z.sliderBtn)[0].className
        }()
    //////////
    // $ 拓展 //
    //////////
    /**
     * 创建遮罩
     * @param  {fn} createCb 成功后的回调
     * @param  {fn} closeCb  关闭时的回调
     * @param  {str} opacity  透明度
     */
    $.createShade = function(createCb, closeCb, opacity) {
        if (!zShade) {
            zShade = $('<div class="z-shade" style="z-index:' + z.zIndex() + ';' + function() {
                return _bool(opacity) ? 'opacity:' + opacity : ''
            }() + '"></div>')
            $(_b).addClass(z.overflow)
            if (!isMobile) {
                $(_b).css('paddingRight', '8px')
            }
            $(_b).append(zShade)
            zShade.fadeIn(z.transTime, createCb && createCb)
        } else {
            createCb && createCb()
        }
        ++zShades
        zShade.on(_ck, function() {
            closeCb && closeCb() && $.closeShade()
        })
        return zShade
    }
    /**
     * 关闭遮罩层
     * @param  {num}   time 过渡时间
     * @param  {fn} cb   关闭后的回调
     * @param  {bool}   rm   是否强制关闭
     */
    $.closeShade = function(time, cb, rm) {
        if (!zShade) return false
        if (rm) zShades = 0
            --zShades
        if (zShades <= 0) {
            zShades = 0
            if ($.type(time) === 'function') {
                cb = time
                time = z.transTime
            }
            time = time || z.transTime
            zShade.fadeOut(time, function() {
                zShade.remove()
                $(_b).removeClass(z.overflow).css('paddingRight', '')
                zShade = null
                cb && cb()
            })
        }
    }
    /**
     * 替换radio、checkbox样式
     * @param  {str} box 要操作的元素集合
     */
    $.resetForm = function(box) {
        if (_bool(box, true)) {
            doing($('.z-form input[type="radio"],.z-form input[type="checkbox"]'))
        } else {
            if (!box instanceof $) box = $(box)
            doing(box)
        }

        function doing(ele) {
            ele.length && ele.each(function(i) {
                var isCheck = this.checked
                var zname = this.name
                var zid = zname + i.toString()
                var type = this.type
                if (_bool($(this).zdata('noreform'))) {
                    $(this).show()
                    return true
                }
                if (_bool($(this).zdata('name'), true)) {
                    var html = '<div class="z-unselect z-form-' + type + function() {
                        return isCheck ? " " + z.active : ""
                    }() + '" zdata-id="' + zid + '" zdata-name="' + zname + '"><i class="z-anim z-icon">' + function() {
                        return type == 'radio' ? "&#xe998;" : "&#xe615;"
                    }() + '</i><span>' + this.title + '</span></div>'
                    $(this).zdata('id', zid)
                    $(this).after(html)
                }
            })
        }
    }
    /**
     * ajax提交表单
     * @param  {str}   ele       要操作的form
     * @param  {fn} cb        成功后的回调
     * @param  {str}   tip       提示
     * @return {data}             服务器返回值
     */
    $.submit = function(ele, cb, tip) {
        var form = ele instanceof $ ? ele : $(ele)
        var datatip = form.zdata('tip')
        var notdatatip = _bool(datatip, true)
        tip = (_bool(tip, true) && notdatatip) ? '数据提交中...' : (notdatatip ? tip : datatip)
        if (!form || !form.length || !form.attr('action')) return false
        if ($.fn.ajaxSubmit) {
            doing()
        } else {
            $.loadJs(z.libs.form, doing)
        }

        function doing() {
            if (!form.find('fieldset').length) form.wrapInner('<fieldset></fieldset>')
            var fieldset = form.find('fieldset')
            if (fieldset.attr('disabled')) return false
            fieldset.attr('disabled', true)
            if (_bool(tip)) {
                $('.z-msg').remove()
                var html = $('<div class="z-msg" style="z-index:' + z.zIndex() + '">' + tip + '</div>')
                $(_b).append(html)
                html.css({
                    marginTop: -html.innerHeight() / 2,
                    marginLeft: -html.innerWidth() / 2
                })
            }
            form.ajaxForm()
            form.ajaxSubmit({
                success: function(responseText, statusText, xhr, $form) {
                    if (statusText == "success") {
                        var ret = responseText
                        fieldset.removeAttr('disabled')
                        if (tip) html.remove()
                        if (likeObject(ret)) {
                            if (w.JSON) {
                                ret = JSON.parse(responseText)
                            } else {
                                eval('ret = ' + responseText)
                            }
                        }
                        cb(ret)
                    }
                }
            })
        }

        function likeObject(str) {
            if ($.type(str) !== 'string') return false
            str = str.replace(/\s/g, '').replace(/\n|\r/, '')
            if (/^\{(.*?)\}$/.test(str)) return /"(.*?)":(.*?)/g.test(str)
            return false;
        }
    }
    /**
     * 日期格式化
     * @param  {str} format 格式化的格式
     * @param  {date | num} time   要处理的时间：当前时间
     * @return {str}        格式后的日期格式
     */
    $.date = function(format, time) {
        var dt = dateNow
        var defaultFormat = 'yyyy/MM/dd H:mm'
        var defaultTime = dt.getTime()
        var hasDt = false
        if ($.type(format) === 'date' || $.type(format) === 'number') {
            time = format
            format = defaultFormat
        } else if (_bool(format, true)) {
            format = defaultFormat
            time = defaultTime
        }
        if (_bool(time, true)) {
            time = defaultTime
        } else if ($.type(time) === 'string') {
            time = parseInt(time)
        } else if ($.type(time) === 'date') {
            dt = time
            hasDt = true
        }
        if (!hasDt) dt = new Date(time)
        var y = dt.getFullYear(),
            M = dt.getMonth(),
            d = dt.getDate(),
            h = dt.getHours(),
            m = dt.getMinutes(),
            s = dt.getSeconds(),
            ms = dt.getMilliseconds(),
            z = dt.getTimezoneOffset(),
            wd = dt.getDay(),
            w = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
        var h12 = h > 12 ? h - 12 : h
        var o = {
            "y+": y, //年份
            "M+": M + 1, //月份
            "d+": d, //月份中的天数 
            "H+": h, //小时24H制            
            "h+": h12 == 0 ? 12 : h12, //小时12H制
            "m+": m, //分钟
            "s+": s, //秒
            "ms": ms, //毫秒
            "a+": h > 12 || h == 0 ? "PM" : "AM", //AM/PM 标记 
            "w+": wd, //星期 数字格式
            "W+": w[wd], //星期 中文格式
            "q+": Math.floor((m + 3) / 3), //一月中的第几周
            "z+": z //时区
        }
        if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var i in o)
            if (new RegExp("(" + i + ")").test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[i] : ("00" + o[i]).substr(("" + o[i]).length));
        return format;
    }
    /**
     * 获取file路径
     * @param  {dom} file 要处理的file元素
     * @return {str | arr}      文件路径
     */
    $.getFileUrl = function(file) {
        var url = null
        var urls = []
        var files = file.files
        if (!files || !files.length) return
        $.each(files, function(k, v) {
            urls.push(getUrl(v))
        })
        if (urls.length > 1) return urls
        else return urls[0]

        function getUrl(f) {
            var _url = null
            if (w.createObjectURL != undefined) {
                _url = w.createObjectURL(f)
            } else if (w.URL != undefined) {
                _url = w.URL.createObjectURL(f)
            } else if (w.webkitURL != undefined) {
                _url = w.webkitURL.createObjectURL(f)
            }
            return _url
        }
    }
    /**
     * 判断是否支持css3
     * @param  {str} style 要检查的样式
     * @return {bool}       是否支持
     */
    $.supportCss3 = function(style) {
        var prefix = ['webkit', 'Moz', 'ms', 'o'],
            i,
            humpString = [],
            htmlStyle = d.documentElement.style,
            _toHumb = function(string) {
                return string.replace(/-(\w)/g, function($0, $1) {
                    return $1.toUpperCase()
                })
            }
        style = style || 'animation'
        for (i in prefix) humpString.push(_toHumb(prefix[i] + '-' + style))
        humpString.push(_toHumb(style))
        for (i in humpString)
            if (humpString[i] in htmlStyle) return true
        return false
    }
    /**
     * 加载图片
     * @param  {str}   url   图片路径
     * @param  {fn} cb    成功的回调
     * @param  {fn}   error 失败的回调
     */
    $.loadImg = function(url, cb, error) {
        var img = new Image()
        img.src = url
        if (img.complete) {
            return cb(img)
        }
        img.onload = function() {
            img.onload = null
            cb(img)
        }
        img.onerror = function(e) {
            img.onerror = null
            error && error(e)
        }
    }
    /**
     * 滚动到底部加载
     * @param  {str}   ele  滚动元素
     * @param  {fn} cb   回调函数
     * @param  {json}   opts 参数
     * @return {json}        操作对象
     */
    $.flow = function(ele, cb, opts) {
        if ($.type(ele) === 'string' || !ele instanceof $) ele = $(ele)
        var inits = {
            scrollElem: d,
            isAuto: true,
            endTxt: '没有更多了',
            eleTxt: '加载更多',
            loadingTxt: '加载中...'
        }
        opts = $.extend({}, inits, opts)
        var moreBtn = $('<button type="button" class="z-btn z-block" zdata-loading-text="' + opts.loadingTxt + '">' + opts.eleTxt + '</button>'),
            beforeBtn = moreBtn.clone().addClass('z-btn-link'),
            content = $('<div class="z-wrap"></div>'),
            page = 1,
            lock, isOver, timer
        var notDocment = opts.scrollElem && opts.scrollElem !== d
        var sElem = $(opts.scrollElem)
        var backs = {
            reset: function() {
                page = 1
                lock = null
                isOver = false
                moreBtn.html(opts.eleTxt).button('reset')
            },
            refresh: function() {
                this.reset()
                ele.prepend(beforeBtn)
                beforeBtn.button('loading')
                moreBtn.hide()
                lock = true
                cb(page, content)
            },
            disabled: function() {
                lock = true
                moreBtn.addClass(z.disabled)
            },
            done: function(over) {
                lock = null
                moreBtn.show()
                if (over) {
                    isOver = over
                    moreBtn.html(opts.endTxt).addClass(z.disabled)
                } else {
                    moreBtn.button('reset')
                }
                beforeBtn.remove()
            }
        }
        ele.wrapInner(content).append(moreBtn)
        content = ele.children('div.z-wrap')
        moreBtn.on(_ck, function() {
            if (isOver) return
            lock || done()
        })
        if (!opts.isAuto) return backs
        _scroll(function() {
            if (isOver) return backs
            var _this = sElem,
                top = _this.scrollTop()
            var height = notDocment ? _this.innerHeight() : winHeight
            var scrollHeight = notDocment ? _this.prop('scrollHeight') : d.documentElement.scrollHeight
            if (scrollHeight - top - height <= 0) {
                lock || done()
            }
        }, sElem)
        return backs

        function done() {
            lock = true
            moreBtn.button('loading')
            cb(++page, content)
        }
    }
    /**
     * 加载进度条
     * @param  {str} type start|done
     */
    $.progressBar = function(type) {
        var bar = $('.z-progress-fix'),
            num = 0,
            step = 10,
            time = 0
        if ('start' == type && bar.length) return
        if ('done' == type && !bar.length) return
        if (bar.length) {
            bar.css('opacity', 0).width('100%')
            setTimeout(function() {
                bar.remove()
                clearInterval(progressTimer)
            }, 300)
        } else {
            bar = $('<div class="z-progress-fix"></div>')
            $(_b).append(bar)
            progressTimer = setInterval(function() {
                num += step
                    ++time
                bar.width(num + '%')
                if (num === 99) step /= 10
                if (time >= 9) {
                    time = 0
                    step /= 10
                }
            }, 300)
        }
        return bar
    }
    /**
     * 自定义弹框
     * @param  {str}   content 内容
     * @param  {str}   title   标题
     * @param  {arr}   btns    按钮
     * @param  {str}   width   宽度
     * @param  {json}   offset  位置(top，left)
     * @param  {fn} cb      点击按钮的回调
     * @return {ele}           弹框元素
     */
    $.open = function(content, title, btns, width, offset, cb) {
        var isFirstArr = true,
            html
        var opts = {}
        var args = arguments
        $.each(args, function(k, arg) {
            if ($.type(arg) === 'array') {
                if (isFirstArr) {
                    isFirstArr = false
                    opts.btns = arg
                    if ($.type(args[k + 1]) === 'string') {
                        opts.width = args[k + 1]
                    }
                } else {
                    opts.offset = arg
                }
            } else if (($.type(arg) === 'function')) {
                cb = arg
            }
        })
        content = $.type(content) === 'string' ? content : ''
        title = $.type(title) === 'string' ? title : z.title['open']
        btns = opts.btns ? opts.btns : z.btns
        width = $.type(width) === 'string' ? width : opts.width ? opts.width : null
        offset = opts.offset ? opts.offset : null
        html = getOpenHtml(content, title, btns)
        html.removeClass('z-modal-sm')
        width && html.width(width)
        appendOpen(html, function(i) {
            if ((cb && !cb(i)) || !cb) _doClose(html)
        }, offset)
        return html
    }
    /**
     * 消息提示框
     * @param  {str} content 内容
     * @param  {str} title   标题
     * @param  {str} btn     按钮文字
     * @return {ele}         弹框元素
     */
    $.alert = function(content, title, btn) {
        var btns, html
        content = content || ''
        title = title || z.title['alert']
        btns = btn ? ['', btn] : ['', z.btns[1]]
        html = getOpenHtml(content, title, btns)
        appendOpen(html, function() {
            _doClose(html)
        })
        return html
    }
    /**
     * 询问框
     * @param  {str}   content 内容
     * @param  {str}   title   标题
     * @param  {arr}   btns    按钮
     * @param  {fn} cb      点击确认时的回调
     * @return {ele}           弹框元素
     */
    $.confirm = function(content, title, btns, cb) {
        var opts = {},
            html
        $.each(arguments, function(k, arg) {
            if ($.type(arg) === 'array') {
                opts.btns = arg
            } else if (($.type(arg) === 'function')) {
                cb = arg
            }
        })
        content = $.type(content) === 'string' ? content : ''
        title = $.type(title) === 'string' ? title : z.title['confirm']
        btns = opts.btns ? opts.btns : z.btns
        html = getOpenHtml(content, title, btns)
        appendOpen(html, function(i) {
            cb && i > 0 && cb(i)
            _doClose(html)
        })
        return html
    }
    /**
     * 输入询问框
     * @param  {str}   title  标题
     * @param  {str}   holder placeholder文字
     * @param  {arr}   btns   按钮
     * @param  {fn} cb     点击确认的回调
     * @return {ele}          弹框元素
     */
    $.prompt = function(title, holder, btns, cb) {
        var opts = {}
        var html, content
        $.each(arguments, function(k, arg) {
            if ($.type(arg) === 'array') {
                opts.btns = arg
            } else if (($.type(arg) === 'function')) {
                cb = arg
            }
        })
        title = $.type(title) === 'string' ? title : z.title['prompt']
        holder = $.type(holder) === 'string' ? holder : title
        btns = opts.btns ? opts.btns : z.btns
        content = '<input type="text" autofocus class="z-input" placeholder="' + holder + '" />'
        html = getOpenHtml(content, title, btns)
        appendOpen(html, function(i) {
            cb && i > 0 && cb(html.find('.z-input').val())
            _doClose(html)
        })
        return html
    }
    /**
     * 自动消失的提示框
     * @param  {str} content 内容
     * @param  {str} color   弹框颜色
     * @return {ele}         弹框元素
     */
    $.toast = function(content, color) {
        return getToastHtml(content, color)
    }
    /**
     * 成功提示框
     * @param  {str}   content 内容
     * @param  {fn} cb      回调
     * @return {ele}           弹框元素
     */
    $.success = function(content, cb) {
        cb && function() {
            var html = $('<div class="z-shade" style="z-index:' + z.zIndex() + ';opacity:0;display:block;"></div>')
            $(_b).append(html)
            setTimeout(function() {
                cb()
                html.remove()
            }, z.successTime)
        }()
        return getToastHtml(content, z.color[5])
    }
    /**
     * 自动消失的半透明居中的提示框
     * @param  {str} content 内容
     * @return {ele}         弹框元素
     */
    $.msg = function(content) {
        $('.z-msg').remove()
        var html = $('<div class="z-msg ' + z.anims[2] + ' ' + z.animCls + '" style="z-index:' + z.zIndex() + '">' + content + '</div>')
        $(_b).append(html)
        html.css({
            marginTop: -html.innerHeight() / 2,
            marginLeft: -html.innerWidth() / 2
        })
        setTimeout(function() {
            html.hide(z.closeTime, function() {
                html.remove()
            })
        }, z.delayTime)
        return html
    }
    // 异步加载js
    $.loadJs = function(files, cb) {
        return include('js', files, cb)
    }
    // 异步加载css
    $.loadCss = function(files, cb) {
        return include('css', files, cb)
    }
    // 返回上一页
    $.back = function() {
        w.history.go(-1)
    }
    /**
     * 简易数据驱动(mvvm)
     * @param  {json} opts 数据对象(必须包含$ele)
     * @return {json}      数据整合结果和set函数
     */
    $.viewModel = function(opts) {
        var callbacks = opts
        var selector = opts.$ele
        var eves = ['animationend', 'blur', 'change', 'input', 'click', 'dblclick', 'focus', 'keydown', 'keypress', 'keyup', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'scroll', 'submit']
        var attrs = ['attr', 'className', 'css', 'text', 'html', 'addClass', 'addAttr', 'addData', 'removeClass', 'removeAttr', 'removeData', 'visible']
        var event_models = []
        var attr_models = []
        var ele = selector
        if (_bool(ele, true)) {
            throw new Error('需指定驱动元素')
        }
        if ($.type(ele) === 'string' || !ele instanceof $) {
            ele = $(ele)
        } else {
            selector = ele.selector
        }
        putModels()

        function putModels() {
            $.each(eves.concat(attrs), function(i, on) {
                var model = 'z-' + on
                var objs = $(selector + ' [' + model + ']')
                objs.length && objs.each(function() {
                    var _this = $(this)
                    var tar = _this.attr(model)
                    var val = {
                        ele: _this,
                        eve: on,
                        tar: tar
                    }
                    if ($.inArray(val, event_models) !== -1 || $.inArray(val, attr_models) !== -1) return true
                    _this.removeAttr(model)
                    if ($.inArray(on, eves) !== -1) {
                        event_models.push(val)
                        _this.on(on, opts[tar])
                    } else if ($.inArray(on, attrs) !== -1) {
                        attr_models.push(val)
                        _this.on(on, function() {
                            var target = opts[tar]
                            try {
                                target = JSON.parse(target)
                            } catch (e) {}
                            if ('visible' == on) {
                                if (_bool(target)) {
                                    _this.show()
                                } else {
                                    _this.hide()
                                }
                            } else {
                                _this[on](target)
                            }
                        })
                        if (!_bool(opts[tar], true)) {
                            _this.trigger(on)
                        }
                    }
                })
            })
        }

        function setModels(key, val, doPut) {
            opts[key] = val
            $.each(attr_models, function(i, item) {
                if (item.tar == key) {
                    item.ele.trigger(item.eve)
                }
            })
            _bool(doPut) && callbacks._put()
            return callbacks
        }
        callbacks.$events = event_models
        callbacks.$attrs = attr_models
        callbacks._put = putModels
        callbacks._set = setModels
        return callbacks
    }
    /////////////
    // $.fn 拓展 //
    /////////////
    /**
     * 获取标签名
     */
    $.fn.tagName = function() {
        return this[0].tagName.toLowerCase()
    }
    /**
     * 处理元素class
     * @param  {str} cls class
     */
    $.fn.className = function(cls) {
        if (_bool(cls, true)) {
            return this.className
        } else {
            $(this).each(function() {
                this.className = cls
            })
            return $(this)
        }
    }
    /**
     * z属性的获取 赋值
     * @param  {str} name 属性名
     * @param  {str} val  属性值
     */
    $.fn.zdata = function(name, val) {
        if (_bool(val, true)) {
            return $(this).attr('zdata-' + name)
        } else {
            $(this).attr('zdata-' + name, val)
            return $(this)
        }
    }
    /**
     * 按钮loading
     * @param  {str} type reset | loading
     */
    $.fn.button = function(type) {
        var _this = $(this)
        var disabled = z.disabled
        if (!_this.length) return _this
        var t = null
        if (_this.hasClass(disabled)) {
            t = 'reset'
        } else {
            t = 'loading'
        }
        type = type || t
        if (type === 'loading') {
            if (_this.hasClass(disabled)) return false
            var txt = _this.zdata('loading-text') || 'loading'
            txt = z.loadingHtml + '  ' + txt
            _this.attr('disabled', 'true').addClass(disabled).attr('zdata-old-text', _this.html()).html(txt)
        } else if (type === 'reset') {
            if (!_this.hasClass(disabled)) return false
            var txt = _this.zdata('old-text') || 'resetBtn'
            _this.removeAttr('disabled').removeAttr('zdata-old-text').removeClass(disabled).html(txt)
        }
        return _this
    }
    /**
     * 模态框
     * @param  {str} type show|hide
     */
    $.fn.modal = function(type) {
        var _this = $(this)
        if (!_this.length) return _this
        if (!_this.hasClass('z-modal')) return _this
        var isHidden = _this.is(':hidden')
        if ('show' === type && !isHidden) return _this
        if ('hide' === type && isHidden) return _this
        if (isHidden) {
            $.createShade(function() {
                _this.css('zIndex', z.zIndex()).show().css({
                    'left': '50%',
                    'marginLeft': -_this.innerWidth() / 2
                }).addClass(z.anims[4] + ' ' + z.animCls)
                _modalHeight(_this)
            }, function() {
                _doClose(_this, null, false)
            })
        } else {
            _doClose(_this, null, false)
        }
        return _this
    }
    /**
     * 鼠标悬停提示
     */
    $.fn.tips = function(opts) {
        var _this = $(this)
        var inits = {
            bgColor: 'black',
            txtColor: 'white',
            autoDie: true
        }
        var ele = _this.selector
        var timer = null
        opts = $.extend({}, inits, opts)
        $(_b).on('mouseenter', ele, function(e) {
            var title = this.title
            var ztitle = $(this).zdata('title')
            var _this = $(this)
            _prevent(e)
            if (!title && !ztitle) return
            if (title) {
                $(this).zdata('title', title)
                $(this).removeAttr('title')
            }
            opts = _getOpts(_this, opts)
            var wid = this.offsetWidth
            var pos = _this.offset()
            var content = _this.zdata('title')
            var html = ''
            var htmls = ['<div class="z-tipsbox ' + z.anims[1] + ' ' + z.animCls + '" style="z-index:' + z.zIndex() + ';top:' + (pos.top - 40) + 'px;left:' + function() {
                    var left = pos.left
                    if (wid < 17) left = left - 17
                    if (left < 0) left = 0
                    return left
                }() + 'px">', '<div class="z-tipsbox-content"' + function() {
                    var str = 'style="'
                    if (opts.bgColor !== 'black') {
                        str += 'background-color: ' + opts.bgColor + ';'
                    }
                    if (opts.txtColor !== 'white') {
                        str += 'color: ' + opts.txtColor + ';'
                    }
                    str += '"'
                    return str
                }() + '>',
                content, '</div><i style="border-right-color:' + opts.bgColor + '"></i>', '</div>'
            ]
            html = $(htmls.join(''))
            $('.z-tipsbox').remove()
            $(_b).append(html)
            var hig = pos.top - html.innerHeight() - 10
            if ((hig - $(d).scrollTop()) < 0) {
                html.css('top', pos.top + _this.innerHeight() + 10).find('i').css({
                    top: '-8px',
                    bottom: 'auto'
                })
            } else {
                html.css('top', hig)
            }
            if (_bool(opts.autoDie)) {
                if (timer) clearTimeout(timer)
                timer = setTimeout(function() {
                    html.remove()
                }, 5000)
            }
            _this.on('mouseleave', function() {
                if (timer) clearTimeout(timer)
                $('.z-tipsbox').remove()
            })
        })
        return _this
    }
    /**
     * 拖动组件
     */
    $.fn.move = function(opts) {
        var _this = $(this)
        var inits = {
            box: '.z-move',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
        var ele = _this.selector
        var isDown = false
        var mtop = 0
        var mleft = 0
        var wid = 0
        var hig = 0
        var ww = winWidth
        var wh = winHeight
        var box = null
        opts = _getOpts(_this, inits, opts)
        $(w).on('mousemove', function(e) {
            if (!isDown || !box) return
            var ev = _prevent(e, true)
            var mpos = _mousePosition(ev)
            var left = mpos.left - mleft
            var top = mpos.top - mtop
            if (top < opts.top) top = opts.top
            if (left < opts.left) left = opts.left
            if (top > (wh - hig - opts.bottom)) top = wh - hig - opts.bottom
            if (left > (ww - wid - opts.right)) left = ww - wid - opts.right
            box.css({
                'left': left,
                'top': top
            })
        })
        $(_b).on('mousedown', ele, function(e) {
            isDown = true
            var ev = _prevent(e, true)
            box = $(this).parents(opts.box)
            var pos = box.offset()
            var mpos = _mousePosition(ev)
            wid = box.innerWidth()
            hig = box.innerHeight()
            mtop = mpos.top - (pos.top - $(d).scrollTop())
            mleft = mpos.left - (pos.left - $(d).scrollLeft())
            box.css('zIndex', z.zIndex())
            ww = winWidth
            wh = winHeight
        })
        $(_b).on('mouseup', ele, function() {
            isDown = false
            box = null
        })
        return _this
    }
    /**
     * 幻灯
     */
    $.fn.slider = function(opts) {
        var _this = $(this)
        if (!_this.length) return _this
        var inits = {
            speed: 500,
            delay: 5000,
            complete: null,
            keys: true,
            dots: true,
            items: 'ul',
            item: 'li'
        }
        _this.each(function() {
            slider($(this), _getOpts($(this), inits, opts))
        })

        function slider(ele, opts) {
            opts = _getOpts(ele, opts)
            var width = ele.innerWidth()
            var item = ele.find(opts.item)
            var items = ele.find(opts.items)
            var leg = item.length
            var timer = null
            var canMove = true
            var index = 0
            var dots = null
            var box = null
            var mar = -width
            var mtype = 'marginLeft'
            var sliderBtn = leg > 1 && !isMobile ? $(z.sliderBtn) : ''
            var active = z.active
            if (_bool(opts.dots)) {
                ele.append('<div class="z-dots">' + function() {
                    var li = ''
                    for (var i = 0; i < leg; i++) {
                        if (0 === i) li += '<a href="javascript:;" class="' + active + '"></a>'
                        else li += '<a href="javascript:;"></a>'
                    }
                    return li
                }() + '</div>')
                dots = ele.find('.z-dots>a')
                if (_bool(opts.keys)) {
                    dots.on(_ck, function() {
                        movement(-($(this).index() + 1) * width)
                    })
                }
            }
            ele.width(width).append(sliderBtn)
            if (leg > 1) {
                var f = item.eq(0).clone()
                var l = item.eq(leg - 1).clone()
                items.prepend(l)
                items.append(f)
                item = ele.find(opts.item)
                leg = item.length
                items.wrap('<div></div>')
                box = items.parent()
                box.css(mtype, mar)
            } else return
            item.width(width)
            items.height(item.innerHeight()).width(leg * width)
            timer = setInterval(movement, opts.delay)
            if (isMobile) {
                var touch = null
                var sx = 0
                var direction = 'left'
                var move = 0
                ele.on('touchmove', function(e) {
                    _prevent(e)
                    move = touch.clientX - sx
                    touch = e.originalEvent.changedTouches[0]
                    box.css(mtype, mar + move)
                })
                ele.on('touchstart', function(e) {　　　　
                    _prevent(e)
                    touch = e.originalEvent.touches[0]
                    sx = touch.clientX
                    clearInterval(timer)
                })
                ele.on('touchend', function(e) {　　　　
                    _prevent(e)
                    touch = e.originalEvent.changedTouches[0]
                    if (touch.clientX - sx > 0) direction = 'right'
                    else direction = 'left'
                    movement(direction)
                    timer = setInterval(movement, opts.delay)
                })
            } else {
                ele.on('mouseenter', function() {
                    clearInterval(timer)
                })
                ele.on('mouseleave', function() {
                    timer = setInterval(movement, opts.delay)
                })
                sliderBtn.on(_ck, function() {
                    clearInterval(timer)
                    if (!canMove) return
                    if ($(this).hasClass(sliderLeftCls)) movement('left')
                    else movement('right')
                })
            }

            function movement(direction) {
                canMove = false
                direction = direction || 'left'
                if (direction === 'left') {
                    if (Math.abs(mar) >= (leg - 2) * width) {
                        mar = 0
                        box.css(mtype, mar)
                    }
                    mar = mar - width
                } else if (direction === 'right') {
                    if (Math.abs(mar) <= width) {
                        mar = -(leg - 1) * width
                        box.css(mtype, mar)
                    }
                    mar = mar + width
                } else {
                    mar = direction
                }
                box.animate({
                    'marginLeft': mar
                }, opts.speed, function() {
                    index = parseInt((Math.abs(mar) - width) / width)
                    if (dots) dots.removeClass(active).eq(index).addClass(active)
                    if (opts.complete) opts.complete(item.eq(index + 1))
                    canMove = true
                })
            }
        }
        return _this
    }
    /**
     * 瀑布流
     */
    $.fn.waterfall = function(opts) {
        var _this = $(this)
        if (!_this.length) return _this
        if ($.fn.masonry) {
            doing()
        } else {
            $.loadJs(z.libs.waterfall, doing)
        }
        return _this

        function doing() {
            var inits = {
                itemSelector: '.z-waterfall-item',
                gutter: 0,
                isAnimated: true
            }
            var options = _getOpts(_this, inits, opts)
            _this.css('opacity', 0).imagesLoaded(function() {
                _this.masonry(opts)
                _this.css('opacity', 1)
            })
        }
    }
    /**
     * 日历
     */
    $.fn.datepicker = function(opts) {
        var _this = $(this)
        var lib = z.libs.datepicker
        if (!_this.length) return _this
        if ($.fn.datetimepicker) {
            doing()
        } else {
            $.loadCss(lib, function() {
                $.loadJs(lib, doing)
            })
        }
        return _this

        function doing() {
            var inits = {
                minView: "month",
                format: "yyyy-mm-dd",
                autoclose: true
            }
            var options = _getOpts(_this, inits, opts)
            _this.datetimepicker(options)
        }
    }
    /**
     * 悬停卡片
     */
    $.fn.hovercard = function() {
        var html, othis, cls, timer, selector = $(this).selector
        $(_b).on('mouseenter', selector, function(e) {
            var _this = $(this)
            var loading = '<div class="z-loadingbox">' + z.loadingHtml + '</div>'
            var isHover = false
            var transTime = z.transTime
            _prevent(e)
            clearTimeout(timer)
            timer = setTimeout(function() {
                html = $('.z-hovercard')
                othis = _this
                if (!_this.zdata('html') && !_this.zdata('url')) return
                if (!html.length) {
                    cls = 'z-dropdown-menu z-hovercard '
                    var htmls = ['<div class="' + cls + '">',
                        loading, '</div>'
                    ]
                    html = $(htmls.join(''))
                    $(_b).append(html)
                }
                if (_this.zdata('html')) {
                    html.html(_this.zdata('html'))
                    show()
                } else if (_this.zdata('url')) {
                    html.html(loading)
                    show()
                    $.get(_this.zdata('url'), function(data) {
                        html.html(data)
                        show()
                    })
                }
                if (!html) return
                html.off('mouseenter').on('mouseenter', function() {
                    isHover = true
                })
                html.off('mouseleave').on('mouseleave', function() {
                    clearTimeout(timer)
                    html.fadeOut(transTime)
                })
            }, 800)
            _this.off('mouseleave').on('mouseleave', function() {
                clearTimeout(timer)
                setTimeout(function() {
                    !isHover && html && html.fadeOut(transTime)
                }, 400)
            })
        })

        function show() {
            var offset = othis.offset()
            var width = othis.innerWidth()
            var height = othis.innerHeight()
            var targetWidth = html.innerWidth()
            var targetHeight = html.innerHeight()
            var scrollTop = $(d).scrollTop()
            var scrollLeft = $(d).scrollLeft()
            var targetTop, targetLeft, wayCls
            var arrowSize = 10
            if (winHeight - (offset.top - scrollTop + height + targetHeight + arrowSize) >= 0) {
                targetTop = offset.top + height + arrowSize;
                targetLeft = offset.left;
                wayCls = "";
            } else if ((offset.top - scrollTop) - (targetHeight + arrowSize) >= 0) {
                targetTop = offset.top - targetHeight - arrowSize;
                targetLeft = offset.left;
                wayCls = "z-dropdown-menu-bottom";
            } else if ((offset.left - scrollLeft) - (targetWidth + arrowSize) >= 0) {
                targetTop = offset.top
                targetLeft = offset.left - targetWidth - arrowSize;
                wayCls = "z-dropdown-menu-right z-dropdown-menu-child";
            } else {
                targetTop = offset.top
                targetLeft = offset.left + width + arrowSize;
                wayCls = "z-dropdown-menu-child";
            }
            html.show().className(cls + wayCls).css({
                'top': targetTop,
                'left': targetLeft,
                'bottom': 'auto',
                'right': 'auto',
                'zIndex': z.zIndex()
            })
        }
    }
    /**
     * 返回顶部
     */
    $.fn.goTop = function(opts) {
        var _this = $(this)
        if (!_this.length) return _this
        var inits = {
            top: 100,
            time: z.transTime
        }
        var rollBtn = _this
        var options = _getOpts(rollBtn, inits, opts)
        var onCls = 'z-on'
        _scroll(function() {
            if ($(d).scrollTop() > options.top) {
                rollBtn.addClass(onCls)
            } else {
                rollBtn.removeClass(onCls)
            }
        })
        rollBtn.on(_ck, function(e) {
            _prevent(e, true)
            $('body,html').animate({
                scrollTop: 0,
            }, options.time)
        })
        return rollBtn
    }
    /**
     * 代码修饰器
     */
    $.fn.code = function(opts) {
        var _this = $(this)
        if (!_this.length) return _this
        _this.each(function() {
            var options = opts || {}
            var othis = $(this),
                html = othis.html(),
                zdata = othis.zdata
            if (othis.zdata('title')) options.title = othis.zdata('title')
            if (othis.zdata('skin')) options.skin = othis.zdata('skin')
            if (othis.zdata('encode')) options.encode = othis.zdata('encode')
            if (othis.zdata('about-text') && othis.zdata('about-link')) options.about = '<a href="' + othis.zdata('about-link') + ' target="_blank>' + othis.zdata('about-text') + '</a>'
            if (options.encode) {
                html = html.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;')
            }
            othis.html('<ol class="z-code-ol"><li>' + html.replace(/[\r\t\n]+/g, '</li><li>') + '</li></ol>')
            if (!othis.find('>.z-code-h3')[0] && (options.title || options.about)) {
                othis.prepend('<h3 class="z-code-h3">' + (options.title || 'code') + (options.about || '') + '</h3>')
            }
            var ol = othis.find('>.z-code-ol')
            othis.addClass('z-code-view')
            if (options.skin) othis.addClass('z-code-' + options.skin)
            if ((ol.find('li').length / 100 | 0) > 0) {
                ol.css('margin-left', (ol.find('li').length / 100 | 0) + 'px')
            }
            othis.find('li').each(function() {
                $(this).html('<span>' + $(this).html() + '</span>')
            })
        })
        return _this
    }
    /**
     * 动态进入盒子
     */
    $.fn.aniBox = function(opts) {
        var _this = $(this)
        if (!_this.length) return _this
        var inits = {
            aniName: z.anims[0],
            aniTime: 500
        }
        var isEnd = false
        opts = $.extend({}, inits, opts)
        _this.each(function() {
            var top = $(this).offset().top
            aniBoxTops.push(top)
            $(this).css('opacity', 0).zdata('top', top)
            if (!$(this).zdata('aniName')) {
                $(this).zdata('aniName', opts.aniName ? opts.aniName : _getAnim())
            }
            if (!$(this).zdata('aniTime')) {
                $(this).zdata('aniTime', opts.aniTime)
            }
        })
        var maxHig = Math.max.apply({}, aniBoxTops)
        maxHig = Math.min(maxHig, ($(d).innerHeight() - winHeight))
        doing()
        $(w).on('scroll', doing)

        function doing() {
            if (isEnd) return
            var dtop = $(d).scrollTop()
            if (dtop <= maxHig) {
                var queue = []
                _this.each(function() {
                    var _this = $(this)
                    if (_this.zdata('aniName') && parseInt(_this.zdata('top')) <= (dtop + winHeight)) {
                        queue.push(_this)
                    }
                })
                if (queue.length) {
                    var i = 0
                    var timer = setInterval(function() {
                        if (i >= queue.length) {
                            clearInterval(timer)
                            return
                        }
                        var item = queue[i]
                        if (item.zdata('aniTime')) {
                            item.addClass(item.zdata('aniName')).addClass('z-anim-ms' + parseInt(item.zdata('aniTime')) / 100).removeAttr('zdata-top').removeAttr('zdata-aniName').removeAttr('zdata-aniTime').animate({
                                    'opacity': 1
                                }, z.transTime)
                                ++i
                        }
                    }, 100)
                }
            } else {
                _this.css('opacity', 1)
                isEnd = true
            }
        }
        return _this
    }
    /**
     * 数字输入框
     */
    $.fn.numberBox = function(opts) {
        var _this = $(this)
        if (!_this.length) return _this
        var inits = {
            prev: '.z-btn.z-sub',
            next: '.z-btn.z-add',
            input: 'input',
            min: 1,
            max: null,
            step: 1
        }
        _this.each(function() {
            var options = _getOpts($(this), inits, opts)
            numberBox($(this), options)
        })

        function numberBox(ele, opts) {
            var ipt = ele.find(opts.input)
            var next = ele.find(opts.next)
            var prev = ele.find(opts.prev)
            var step = parseFloat(opts.step)
            var max = parseFloat(opts.max)
            var min = parseFloat(opts.min)
            var disabled = z.disabled
            if (!ipt || !next || !prev || !ipt.length || !next.length || !prev.length) return
            if (max && max < min) return
            ipt.off('change').on('change', function() {
                var val = parseFloat($(this).val())
                if (isNaN(val)) val = min
                if (val <= min) {
                    $(this).val(min)
                    prev.addClass(disabled)
                } else {
                    prev.removeClass(disabled)
                }
                if (max && val >= parseFloat(max)) {
                    $(this).val(max)
                    next.addClass(disabled)
                } else {
                    next.removeClass(disabled)
                }
            })
            next.off(_ck).on(_ck, function() {
                var val = parseFloat(ipt.val())
                if ($(this).hasClass(disabled)) return
                val = val + step
                ipt.val(val).change()
            })
            prev.off(_ck).on(_ck, function() {
                var val = parseFloat(ipt.val())
                if ($(this).hasClass(disabled)) return
                val = val - step
                ipt.val(val).change()
            })
            ipt.change()
        }
        return _this
    }
    /**
     * 手指左划
     */
    $.fn.swipeleft = function(cb) {
        swipe('left', $(this), cb)
        return $(this)
    }
    /**
     * 手指右划
     */
    $.fn.swiperight = function(cb) {
        swipe('right', $(this), cb)
        return $(this)
    }
    /**
     * 移动端导航
     */
    $.fn.mobileNav = function(opts) {
        var _this = $(this)
        if (!_this.length) return
        var nav = _this.first()
        var inits = {
            item: '.z-nav-item,.z-nav-box',
            logo: 'z-logo',
            navCls: '',
            menuCls: '',
            child: '.z-dropdown-menu',
            toggle: true
        }
        var options = _getOpts(nav, inits, opts)
        var can = true
        var items = nav.find(options.item)
        var fixNav = $('<ul class="z-nav z-nav-tree z-nav-mobile"></ul>')
        var logo = ''
        var menu = $('<ul class="z-menu"><li></li><li></li><li></li></ul>')
        var child = options.child.replace('.', '')
        var transtime = z.transTime
        var active = z.active
        items.each(function() {
            if ($(this).hasClass(options.logo.replace('.', ''))) logo = $(this).clone()
            if ($(this).children(options.child).length) $(this).children('a').attr('href', 'javascript:;').removeAttr('target')
            fixNav.append($(this).addClass('z-nav-item'))
        })
        nav.html(logo).append(menu).addClass('z-nav-fixed-top').removeClass('z-action-mobilenav')
        fixNav.find(options.child).each(function() {
            $(this).removeClass(child).addClass('z-nav-child').parent().removeClass('z-dropdown')
        })
        options.navCls && fixNav.addClass(options.navCls)
        options.toggle && fixNav.zdata('toggle', options.toggle)
        options.menuCls && menu.addClass(options.menuCls)
        nav.after(fixNav)
        menu.on(_ck, function() {
            if (!can) return false
            can = false
            var _this = $(this)
            if (fixNav.is(':hidden')) {
                $.createShade(function() {
                    fixNav.css('zIndex', z.zIndex()).show().animate({
                        'left': 0
                    }, transtime)
                    _this.addClass(active)
                    can = true
                }, function() {
                    menu.click()
                }, '.12')
                nav.css('zIndex', z.zIndex())
            } else {
                fixNav.animate({
                    'left': '-100%'
                }, transtime, function() {
                    fixNav.hide()
                    _this.removeClass(active)
                    $.closeShade(function() {
                        can = true
                    })
                })
            }
        })
        if (!isMobile) return
        $(d).swiperight(function() {
            if (!fixNav.is(':hidden')) return false
            menu.click()
        })
        $(d).swipeleft(function() {
            if (fixNav.is(':hidden')) return false
            menu.click()
        })
        return _this
    }
    /**
     * 向右华丽消失
     * @param  {num}   t  过渡时间
     * @param  {fn} cb 完成后的回调
     */
    $.fn.flyOut = function(t, cb) {
        var _this = $(this)
        var alpha = _this.css('opacity')
        var left = 0
        var skew = 0
        var wid = winWidth - _this.offset().left
        var st = 0
        var interval = 13
        var speed = t / interval
        var s_alpha = alpha / speed
        var s_left = (Math.min(wid, 200)) / speed
        var s_skew = 10 / speed
        t = t || z.transTime
        var timer = setInterval(function() {
            st = st + interval
            alpha -= s_alpha
            left += s_left
            skew += s_skew
            _this.css({
                opacity: alpha,
                transform: 'translate3d(' + left + 'px,0,0) skew(' + skew + 'deg, 0deg)'
            })
            if (st >= t) {
                clearInterval(timer)
                cb && cb()
            }
        }, interval)
        return _this
    }
    /**
     * 图片懒加载
     * @param  {str}   scrollEle 滚动元素
     * @param  {fn} cb        加载完成回调
     */
    $.fn.lazyimg = function(scrollEle, cb) {
        var _this = $(this)
        if (!_this.length) return _this
        if ($.type(scrollEle) === 'function') {
            cb = scrollEle
            scrollEle = d
        }
        var sEle = scrollEle || d
        var index = 0,
            haveScroll
        var notDocment = sEle && sEle !== d
        sEle = $(sEle)
        render()
        _scroll(function() {
            render(null, sEle)
        }, sEle)
        return _this

        function show(item, height) {
            var start = sEle.scrollTop(),
                end = start + height
            var elemTop = notDocment ? function() {
                return item.offset().top - sEle.offset().top + start
            }() : item.offset().top
            if (elemTop >= start && elemTop <= end) {
                if (item.zdata('src')) {
                    var src = item.zdata('src')
                    $.loadImg(src, function() {
                        var next = _this.eq(index)
                        if (item.tagName() === 'img') {
                            item.attr('src', src)
                        } else {
                            item.css('backgroundImage', 'url("' + src + '")')
                        }
                        item.removeAttr('zdata-src')
                        cb && cb(item)
                        next[0] && render(next)
                        index++
                    })
                }
            }
        }

        function render(othis, scroll) {
            var height = notDocment ? (scroll || sEle).height() : winHeight
            var start = sEle.scrollTop(),
                end = start + height
            if (othis) {
                show(othis, height)
            } else {
                for (var i = 0; i < _this.length; i++) {
                    var item = _this.eq(i),
                        elemTop = notDocment ? function() {
                            return item.offset().top - sEle.offset().top + start
                        }() : item.offset().top
                    show(item, height)
                    index = i
                    if (elemTop > end) break
                }
            }
        }
    }
    /**
     * 相册
     */
    $.fn.album = function() {
        var _this = $(this)
        var selector = _this.selector
        $(_b).on(_ck, selector, function() {
            var self = this
            var othis = $(self)
            var src = getSrc(othis)
            if (!src || othis.zdata('src')) return _this
            var groups = []
            var group = othis.zdata('group')
            var index = 0
            $(selector + function() {
                return _bool(group, true) ? '' : '[zdata-group="' + group + '"]'
            }()).each(function() {
                groups.push(this)
            })
            if (!groups.length) return _this
            groups.sort(function(a, b) {
                var aint = _bool($(a).zdata('index'), true) ? parseInt($(a).index()) : parseInt($(a).zdata('index'))
                var bint = _bool($(b).zdata('index'), true) ? parseInt($(b).index()) : parseInt($(b).zdata('index'))
                return aint - bint
            })
            $.each(groups, function(k, v) {
                if (v === self) index = k
            })
            var sliderBtn = groups.length > 1 && !isMobile ? $(z.sliderBtn) : ''
            var htmls = ['<div class="z-album">', '<span class="z-close z-action-close" zdata-box=".z-album">&times;</span>', '<div class="z-album-content ' + z.animCls + ' ' + _getAnim() + '">', '<div class="z-imgbox"></div>', '<div class="z-tipbox"></div>', '</div>', '</div>', ]
            var html = $(htmls.join(''))
            var loading = $(z.loadingHtml).html('&#xe623;')
            var box = html.find('.z-album-content')
            var imgbox = html.find('.z-imgbox')
            var tipbox = html.find('.z-tipbox')
            box.append(sliderBtn)
            $.createShade(function() {
                $('.z-album').remove()
                $(_b).append(html)
                showImg()
            }, function() {
                _doClose(html, null, true, box)
            })

            function showImg() {
                html.css('zIndex', z.zIndex())
                html.append(loading)
                if (index > groups.length - 1) index = 0
                if (index < 0) index = groups.length - 1
                var image = groups[index]
                var oimage = $(image)
                var tip = oimage.zdata('tip') || image.title
                var src = getSrc(oimage)
                tip = tip ? '&nbsp;&nbsp;' + tip : ''
                $.loadImg(src, function(img) {
                    var blank = winWidth > 768 ? 100 : 20
                    var imgWidth = img.width
                    var imgHeight = img.height
                    var wWidth = winWidth - blank
                    var wHeight = winHeight - blank
                    var width = imgWidth
                    var height = imgHeight
                    if (imgWidth / imgHeight > wWidth / wHeight) {
                        width = Math.min(imgWidth, wWidth)
                        height = imgHeight * width / imgWidth
                        $(img).css('maxHeight', '100%')
                    } else {
                        height = Math.min(imgHeight, wHeight)
                        width = imgWidth * height / imgHeight
                        $(img).css('maxWidth', '100%')
                    }
                    box.width(width).height(height)
                    box.show().css({
                        'marginLeft': -width / 2 - 2,
                        'marginTop': -height / 2 - 2
                    })
                    loading.remove()
                    imgbox.html(img)
                    tipbox.html(index + 1 + '/<b>' + groups.length + '</b>' + tip)
                })
            }

            function getSrc(ele) {
                if (ele.tagName() === 'img') {
                    var src = ele[0].src
                } else {
                    var src = ele.css('backgroundImage').replace(/url\([\'\"]{1}(.*)[\'\"]{1}\)/, '$1').toString()
                }
                src = ele.zdata('bigsrc') || src
                return src
            }
            if (groups.length > 1) {
                if (isMobile) {
                    html.swipeleft(function(e) {
                        _prevent(e, true)
                            --index
                        showImg()
                    })
                    html.swiperight(function(e) {
                        _prevent(e, true)
                            ++index
                        showImg()
                    })
                } else {
                    sliderBtn && sliderBtn.on(_ck, function() {
                        if ($(this).hasClass(sliderLeftCls)) --index
                        else ++index
                        showImg()
                    })
                }
            }
            $(w).on('keyup', function(e) {
                var code = e.which
                if (groups.length > 1) {
                    if (37 == code) {
                        --index
                        showImg()
                    } else if (39 == code) {
                        ++index
                        showImg()
                    }
                }
                if (27 == code) {
                    _doClose(html, null, true, box)
                }
            })
        })
        return _this
    }
    /**
     * 下拉组件
     * @param  {str} type hover|click:click
     * @param  {bool} isTree
     */
    $.fn.dropdown = function(type, isTree) {
        var _this = $(this)
        var selector = _this.selector
        var active = z.active
        type = type || _ck
        if (isTree) {
            var affair = type
            if ('hover' == affair) affair = 'mouseenter'
            $(_b).on(affair, selector, function(e) {
                var othis = $(this)
                if (othis.hasClass(active)) othis.removeClass(active)
                else {
                    if (_bool(othis.parent().zdata('toggle'))) othis.siblings(selector).removeClass(active)
                    othis.addClass(active)
                }
            })
            _this.find('.z-nav-child').on(_ck, function(event) {
                event.stopPropagation()
            })
        } else {
            if (type == 'hover') {
                $(_b).on('mouseenter', selector, function() {
                    var othis = $(this)
                    othis.addClass(active)
                    othis.on('mouseleave', function() {
                        $(this).removeClass(active)
                    })
                })
            } else if (type == _ck) {
                $(_b).on(_ck, selector, function(e) {
                    var othis = $(this)
                    _prevent(e)
                    if (othis.hasClass(active)) othis.removeClass(active)
                    else {
                        $(selector).removeClass(active)
                        othis.addClass(active)
                    }
                })
                $(d).on(_ck, function() {
                    $(selector).removeClass(active)
                })
            }
        }
        return _this
    }
    /**
     * 手指事件
     * @param  {str}   type left|right
     * @param  {str}   ele  触发元素
     * @param  {fn} cb   触发后的回调
     */
    function swipe(type, ele, cb) {
        var sx = 0
        var sy = 0
        var ev = event
        var can = false
        var timer = null
        ele.on('touchstart', function(e) {
            _prevent(e)
            ev = e.originalEvent.touches[0]
            sx = ev.clientX
            sy = ev.clientY
            can = true
            timer = setTimeout(function() {
                can = false
            }, z.transTime)
        })
        ele.on('touchend', function(e) {
            _prevent(e)
            ev = e.originalEvent.changedTouches[0]
            var offset = 'left' === type ? (sx - ev.clientX) : (ev.clientX - sx)
            if (offset > 50 && Math.abs(sy - ev.clientY) < 50) {
                if (cb && can) cb(e)
                if (timer) clearTimeout(timer)
            }
        })
    }
    /**
     * @param  {[str]}   type  js|css
     * @param  {[str | arr]}   files 文件路径
     * @param  {fn} cb    成功后的回调
     */
    function include(type, files, cb) {
        if (!files) return
        if ($.type(files) === 'string') {
            files = [files]
        }
        if ($.type(files) !== 'array') return
        var node, suffix = '.' + type
        var i = 0
        require()
        return node

        function require() {
            if (i < files.length) {
                var file = files[i]
                if (_getZsrc(file)) {
                    onload()
                    return
                }
                if (file.substr(-(suffix.length)) !== suffix) {
                    file += suffix
                }
                if (file.indexOf('://') === -1) {
                    file = z.rootPath + file
                }
                if ('js' === type) {
                    node = d.createElement('script')
                    node.src = file
                } else if ('css' === type) {
                    node = d.createElement('link')
                    node.rel = 'stylesheet'
                    node.href = file
                }
                d.head.appendChild(node)
                node.onload = function() {
                    onload()
                }
            }
        }

        function onload() {
            if (i === files.length - 1) {
                if (cb) cb()
            } else {
                i++
                require()
            }
        }
    }
    /**
     * 生成open类型的弹框dom
     */
    function getOpenHtml(content, title, btns) {
        var htmls = ['<div class="z-modal z-move z-modal-sm ' + z.animCls + ' ' + _getAnim() + '">', '<div class="z-modal-header z-move-title z-action-move">', '<button type="button" class="z-close z-action-close">&times;</button>', '<h4 class="z-modal-title">' + title + '</h4>', '</div>', '<div class="z-modal-body">',
            content, '</div>', '<div class="z-modal-footer z-text-center">'
        ]
        for (var i = 0; i < btns.length; i++) {
            if (btns[i].length) htmls.push('<button type="button" class="z-btn z-btn-' + z.color[i] + '">' + btns[i] + '</button>')
        }
        htmls.push('</div></div>')
        return $(htmls.join(''))
    }
    /**
     * 生成toast类型的弹框dom
     */
    function getToastHtml(content, color) {
        var box = $('.z-alert-box')
        color = color || z.color[3]
        content = content || ''
        if (!box || !box.length) {
            box = $('<div class="z-alert-box"></div>')
            $(_b).append(box)
        }
        box.css('zIndex', z.zIndex())
        htmls = ['<div class="z-alert z-alert-' + color + ' z-alert-dismissible ' + z.anims[4] + ' ' + z.animCls + '">', '<button type="button" class="z-close z-action-close">&times;</button>',
            content, '</div>'
        ]
        var html = $(htmls.join(''))
        box.prepend(html)
        setTimeout(function() {
            _doClose(html)
        }, z.delayTime)
        return html
    }
    /**
     * open dom 生成后的操作
     */
    function appendOpen(html, cb, offset) {
        $.createShade(function() {
            $(_b).append(html)
            html.css('zIndex', z.zIndex()).show()
            var win = html.innerWidth()
            var hig = html.innerHeight()
            var ww = winWidth
            var wh = winHeight
            html.css({
                'margin': 0,
                'top': (offset && offset[0]) ? offset[0] : (wh - hig) / 3 > 0 ? (wh - hig) / 3 : 0,
                'left': (offset && offset[1]) ? offset[1] : (ww - win) / 2 > 0 ? (ww - win) / 2 : 0
            })
            _modalHeight(html)
            html.find('.z-modal-footer .z-btn').on(_ck, function() {
                cb && cb($(this).index())
            })
        })
        $(w).on('keyup', function(e) {
            if (27 == e.which) {
                _doClose(html)
            }
        })
    }
    /**
     * 选项卡
     * @param  {dom} ele 触发元素
     */
    function tabs(ele) {
        var active = z.active
        var _this = $(ele)
        var lis = _this.parent().find('li')
        var items = _this.parents('.z-tab').find('.z-tab-content>.z-tab-item')
        var index = _this.index()
        if (_this.hasClass(active)) return
        lis.removeClass(active)
        _this.addClass(active)
        items.hide().eq(index).show()
    }
    /**
     * 获取z的路径，判断文件是否已加载
     * @param  {str} src 路径
     * @return {bool}     是否存在
     */
    function _getZsrc(src) {
        var pt = d.getElementsByTagName('script')
        var reg = /[\\\/]z\.(min\.)?js/
        for (var i = 0; i < pt.length; i++) {
            var s = pt[i].src
            if (src) {
                if (s.indexOf(src) !== -1) return true
                else continue
            } else {
                if (s.match(reg)) return s.replace(/z\.(min\.)?js/, '')
            }
        }
        return false
    }
    /**
     * 获得随机动画
     */
    function _getAnim() {
        var anims = z.anims
        return anims[Math.floor(Math.random() * anims.length)]
    }
    /**
     * 关闭弹框
     * @param  {str}   box    弹框元素
     * @param  {fn} cb     成功的回调
     * @param  {bool}   rm     是否删除元素：false
     * @param  {str}   anibox 动画元素
     */
    function _doClose(box, cb, rm, anibox) {
        var anibox = anibox || box
        var delay = z.closeTime
        if (_bool(rm, true)) rm = true
        rm = _bool(rm)
        if (rm) anibox.flyOut(delay, doing)
        else box.slideUp(delay, doing)

        function doing() {
            !box.hasClass(zBoxs[0].cls.replace('.', '')) && $.closeShade(delay)
            if (rm) box.remove()
            if (cb) cb()
        }
    }
    /**
     * 获取鼠标位置
     */
    function _mousePosition(ev) {
        return {
            top: ev.clientY,
            left: ev.clientX
        }
    }
    /**
     * 获取优先级处理后的参数
     * @param  {str} ele   元素
     * @param  {json} inits 初始化参数
     * @param  {json} opts  传入参数
     * @return {json}       处理后的参数
     */
    function _getOpts(ele, inits, opts) {
        var options = inits
        if (opts) options = $.extend({}, inits, opts)
        $.each(options, function(key, val) {
            if (!_bool(ele.zdata(key), true)) options[key] = ele.zdata(key)
        })
        return options
    }
    /**
     * 转bool
     * @param  {str}  type   要判断的属性
     * @param  {bool} isUnde 是否要判断undefined
     * @return {bool}
     */
    function _bool(type, isUnde) {
        var unde = $.type(type) === 'undefined'
        if (isUnde) return unde
        if (unde) return false
        else if ($.type(type) === 'boolean') return type
        else if (type == 'false') return false
        return true
    }
    /**
     * modal滚动条处理
     * @param  {str} ele 要处理元素
     */
    function _modalHeight(ele) {
        var header = ele.children('.z-modal-header')
        var body = ele.children('.z-modal-body')
        var footer = ele.children('.z-modal-footer')
        body.css('maxHeight', winHeight - header.innerHeight() - footer.innerHeight() - 20)
    }
    /**
     * 统一滚动处理
     * @param  {fn} cb  回调
     * @param  {str}   ele 滚动元素
     */
    function _scroll(cb, ele) {
        var timer
        ele = ele || $(d)
        ele.on('scroll', function() {
            clearTimeout(timer)
            timer = setTimeout(cb, 60)
        })
    }
    /**
     * 阻止冒泡和默认事件
     */
    function _prevent(e, pre) {
        var ev = e || event
        ev.stopPropagation()
        pre && ev.preventDefault()
        return ev
    }
    /**
     * 初始化
     */
    $(function() {
        var active = z.active
        // 代码修饰器
        $('.z-action-code').code()
        // 日期选择器
        $('.z-action-datepicker').datepicker()
        if (isMobile) {
            // 移动端替换导航
            $('.z-action-mobilenav').mobileNav()
        } else {
            // 悬浮卡片
            $('.z-action-hovercard').hovercard()
            // tips
            $('.z-action-tips').tips()
            // 拖动组件
            $('.z-action-move').move()
        }
        // 返回顶部
        $('.z-action-gotop').goTop()
        // 幻灯
        $('.z-action-slider').slider()
        // 动态进入
        $('.z-action-anibox').aniBox()
        // 图片懒加载
        $('.z-action-lazyimg').lazyimg()
        // 图片相册
        $('.z-action-album').album()
        // 数字输入框
        $('.z-action-numberbox').numberBox()
        // 下拉导航
        $('.z-action-dropdown').dropdown()
        $('.z-action-dropdown-hover').dropdown('hover')
        // 树形导航
        $('.z-action-tree').dropdown(_ck, true)
        $('.z-action-tree-hover').dropdown('hover', true)
        // 替换单选框和复选框
        $.resetForm()
        // 单选框
        $(_b).on(_ck, '.z-form-radio', function() {
            if ($(this).hasClass(active)) return
            var zid = $(this).zdata('id')
            var zname = $(this).zdata('name')
            $('.z-form-radio[zdata-name="' + zname + '"]').removeClass(active)
            $(this).addClass(active)
            $('input[type="radio"][name="' + zname + '"]').each(function() {
                this.checked = $(this).zdata('id') === zid
                $(this).change()
            })
        })
        // 复选框
        $(_b).on(_ck, '.z-form-checkbox', function() {
            var zid = $(this).zdata('id')
            var _this = $(this)
            _this.toggleClass(active)
            $('input[type="checkbox"][zdata-id="' + zid + '"]').each(function() {
                this.checked = _this.hasClass(active)
                $(this).change()
            })
        })
        // modal
        $(_b).on(_ck, '.z-action-modal', function() {
            var tar = $(this).zdata('target')
            if (!tar || !tar.length || !$(tar).length) return
            $(tar).modal()
        })
        // 关闭按钮
        $(_b).on(_ck, '.z-action-close', function() {
            var _this = $(this)
            var box = null
            var ibox = null
            $.each(zBoxs, function(i, val) {
                var cls = val.cls
                var ani = val.ani
                if (_this.parents(cls).length) {
                    box = _this.parents(cls)
                    if (ani) ibox = box.find(cls + '-content')
                    return false
                }
            })
            if (!box) box = _this.parents(_this.zdata('box'))
            ibox = ibox || box
            if (box && box.length) _doClose(box, null, _this.zdata('remove'), ibox)
        })
        // 上一页
        $(_b).on(_ck, '.z-action-back', function() {
            $.back()
        })
        // tabs
        $(_b).on(_ck, '.z-tab-title>li', function() {
            tabs(this)
        })
        $(_b).on(_ck, '.z-tab-title .z-tab-close', function(e) {
            _prevent(e)
            var li = $(this).parent()
            if(li.hasClass(active)){
                var next = li.next().length ? li.next() : li.prev()
                next.length && next.click()
            }
            $(this).parents('.z-tab').find('.z-tab-content>.z-tab-item:eq(' + li.index() + ')').remove()
            li.remove()
        })
        $('.z-tab-title').each(function() {
            $(this).children('li:first').click()
        })
        // 固定导航
        if ($('.z-nav.z-nav-fixed-top').length) $(_b).css('paddingTop', $('.z-nav.z-nav-fixed-top').innerHeight() + 20)
        if ($('.z-nav.z-nav-fixed-bottom').length) $(_b).css('paddingBottom', $('.z-nav.z-nav-fixed-bottom').innerHeight() + 20)
        // 阻止默认
        $(d).on(_ck, '.z-disabled,:disabled', function(e) {
            _prevent(e, true)
            return false
        })
        $('.z-disabled,:disabled').on(_ck, function(e) {
            _prevent(e, true)
            return false
        })
        // 变换窗体
        $(w).on('resize', function() {
            z.winWidth = winWidth = $(w).innerWidth()
            z.winHeight = winHeight = $(w).innerHeight()
        })
    })
    return z
})