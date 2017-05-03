;
(function(w, d, $, undefined) {
	var root_path = _getZsrc(),
		libs_path = root_path.replace('js/', '') + 'libs/',
		isMobile = isMobile(),
		dateNow = new Date(),
		zShade = null,
		shades = 0,
		zBoxs = [{
			cls: '.z-alert'
		}, {
			cls: '.z-modal',
		}, {
			cls: '.z-album',
			ani: true
		}],
		_ck = 'click',
		_b = 'body',

		winWidth = $(w).innerWidth(),
		winHeight = $(w).innerHeight(),

		transTime = 200,

		aniBoxTops = [],

		z = {
			version: '2.0.0',
			root_path: root_path,
			libs_path: libs_path,
			index: 99,
			zIndex: function() {
				return ++this.index
			},
			anims: ['z-anim-upbit', 'z-anim-scale', 'z-anim-scaleSpring', 'z-anim-up', 'z-anim-downbit'],
			animCls: 'z-anim-ms3',
			libs: {
				form: libs_path + 'jquery.form.min',
				waterfall: libs_path + 'masonry-docs.min',
				jscrollpane: libs_path + 'jquery.jscrollpane.min',
				datepicker: libs_path + 'bootstrap-datetimepicker.min'
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
			active: 'z-active',
			overflow: 'z-overflow',
			dt: dateNow,
			loadingHtml: '<span class="z-anim-rotate z-icon">&#xe624;</span>',
			sliderBtn: '<button class="z-slider-btn z-icon z-slider-prev">&#xe605;</button><button class="z-slider-btn z-icon z-slider-next">&#xe61d;</button>',
			winWidth: winWidth,
			winHeight: winHeight,
		},
		log = console.log,

		sliderLeftCls = function() {
			return $(z.sliderBtn)[0].className
		}()

	$.extend({
		createShade: function(createCb, closeCb, opacity) {
			if (!zShade) {
				zShade = $('<div class="z-shade" style="z-index:' + z.zIndex() + ';' + function() {
					return _bool(opacity) ? 'opacity:' + opacity : ''
				}() + '"></div>')
				$(_b).addClass(z.overflow).css('paddingRight', '8px').append(zShade)
				zShade.fadeIn(z.transTime, createCb && createCb)
			} else {
				createCb && createCb()
			}
			++shades
			zShade.on(_ck, function() {
				closeCb && closeCb() && closeShade()
			})
		},
		closeShade: closeShade,
		resetForm: function(box) {
			if (_bool(box, true)) {
				resetForm($('.z-form input[type="radio"],.z-form input[type="checkbox"]'))
			} else {
				if (!box instanceof $) box = $(box)
				resetForm(box)
			}
		},
		submit: function(ele, cb, tip, parseJson) {
			var form = ele instanceof $ ? ele : $(ele)
			var datatip = form.zdata('tip')
			var notdatatip = _bool(datatip, true)
			parseJson = _bool(parseJson, true) ? true : _bool(parseJson)
			tip = (_bool(tip, true) && notdatatip) ? '数据提交中...' : (notdatatip ? tip : datatip)
			if (!form || !form.length || !form.attr('action')) return false
			if ($.fn.ajaxSubmit) {
				doing()
			} else {
				$.loadJs(z.libs.form, function() {
					doing()
				})
			}

			function doing() {
				if (!form.find('fieldset').length) form.wrapInner('<fieldset></fieldset>')
				var fieldset = form.find('fieldset')
				if (fieldset.attr('disabled')) return false
				fieldset.attr('disabled', true)
				if (_bool(tip)) {
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
							if ($.type(ret) === 'string' && parseJson) {
								if (w.JSON) {
									ret = JSON.parse(responseText)
								} else {
									ret = eval(responseText)
								}
							}
							cb(ret)
						}
					}
				})
			}
		},
		alert: function(content, title) {
			showMsg('alert', content, title, function(obj, i) {
				_doClose(obj)
			})
		},
		open: function(content, title, btns, cb) {
			cb = _getCb(arguments)
			showMsg('open', content, title, btns, function(obj, i) {
				if ((cb && !cb(i, obj)) || !cb) _doClose(obj)
			})
		},
		confirm: function(content, title, btns, cb) {
			cb = _getCb(arguments)
			showMsg('confirm', content, title, btns, function(obj, i) {
				cb && i > 0 && cb(i, obj)
				_doClose(obj)
			})
		},
		prompt: function(title, btns, cb) {
			cb = _getCb(arguments)
			showMsg('prompt', '<input type="text" autofocus class="z-input" placeholder="' + function() {
				return title || z.title['prompt']
			}() + '" />', title, btns, function(obj, i) {
				cb && i > 0 && cb(obj.find('.z-input').val())
				_doClose(obj)
			})
		},
		toast: function(content, color) {
			showMsg('toast', content, color || z.color[3])
		},
		success: function(content, cb) {
			showMsg('success', content, z.color[5], cb && function() {
				var html = $('<div class="z-shade" style="z-index:' + z.zIndex() + ';opacity:0;display:block;"></div>')
				$(_b).append(html)
				setTimeout(function() {
					cb()
					html.remove()
				}, z.successTime)
			})
		},
		msg: function(content) {
			showMsg('msg', content)
		},
		loadJs: function(files, cb) {
			include('js', files, cb)
		},
		loadCss: function(files, cb) {
			include('css', files, cb)
		},
		date: function(format, time) {
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
			if (/(y+)/.test(format))
				format = format.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var i in o)
				if (new RegExp("(" + i + ")").test(format))
					format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[i] : ("00" + o[i]).substr(("" + o[i]).length));
			return format;
		},
		back: function() {
			w.history.go(-1)
		},
		getFileUrl: function(file) {
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
		},
		supportCss3: supportCss3,
		loadImg: loadImg
	})

	$.fn.extend({
		tagName: function() {
			return this[0].tagName.toLowerCase()
		},
		className: function(cls) {
			$(this).each(function() {
				this.className = cls
			})
			return $(this)
		},
		zdata: function(name, val) {
			if (_bool(val, true)) {
				return $(this).attr('zdata-' + name)
			} else {
				$(this).attr('zdata-' + name, val)
				return $(this)
			}
		},
		button: function(type) {
			var _this = $(this)
			if (!_this.length) return _this
			var t = null
			if (_this.hasClass('z-disabled')) {
				t = 'reset'
			} else {
				t = 'loading'
			}
			type = type || t
			button(_this, type)
			return _this
		},
		modal: function(type) {
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
		},
		tips: function(opts) {
			var _this = $(this)
			if (!_this.length) return _this
			var inits = {
				bgColor: 'black',
				txtColor: 'white',
				autoDie: true
			}
			var options = $.extend({}, inits, opts)
			tips(_this.selector, options)
			return _this
		},
		move: function(opts) {
			var _this = $(this)
			var inits = {
				box: '.z-move',
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			}
			var options = _getOpts(_this, inits, opts)
			move(_this.selector, options)
			return _this
		},
		slider: function(opts) {
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
				var options = _getOpts($(this), inits, opts)
				slider($(this), options)
			})
			return _this
		},
		waterfall: function(opts) {
			var _this = $(this)
			if (!_this.length) return _this
			if ($.fn.masonry) {
				doing()
			} else {
				$.loadJs(z.libs.waterfall, function() {
					doing()
				})
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
		},
		datepicker: function(opts) {
			var _this = $(this)
			if (!_this.length) return _this
			if ($.fn.datetimepicker) {
				doing()
			} else {
				$.loadCss(z.libs.datepicker, function() {
					$.loadJs(z.libs.datepicker, function() {
						doing()
					})
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
		},
		hovercard: function() {
			var html, othis, cls, timer, selector = $(this).selector
			$(_b).on('mouseenter', selector, function(e) {
				var _this = $(this)
				var loading = '<div class="z-loadingbox">' + z.loadingHtml + '</div>'
				var isHover = false
				_prevent(e)
				timer && clearTimeout(timer)
				timer = setTimeout(function() {
					html = $('.z-hovercard')
					othis = _this
					if (!_this.zdata('html') && !_this.zdata('url')) return
					if (!html.length) {
						cls = 'z-dropdown-menu z-hovercard '
						var htmls = [
							'<div class="' + cls + '">',
							loading,
							'</div>'
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
					html.on('mouseenter', function() {
						isHover = true
					})
					html.on('mouseleave', function() {
						timer && clearTimeout(timer)
						html.fadeOut(z.transTime)
					})
				}, 800)

				_this.on('mouseleave', function() {
					timer && clearTimeout(timer)
					setTimeout(function() {
						!isHover && html && html.fadeOut(z.transTime)
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
					'left': targetLeft
				})
			}
		},
		goTop: function(opts) {
			var _this = $(this)
			if (!_this.length) return _this
			var inits = {
				top: 100,
				time: z.transTime
			}
			var rollBtn = _this
			var options = _getOpts(rollBtn, inits, opts)
			var onCls = 'z-on'
			$(w).on('scroll', function() {
				if (!rollBtn.length) return rollBtn
				if ($(this).scrollTop() > options.top) {
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
		},
		code: function(opts) {
			var _this = $(this)
			if (!_this.length) return _this
			_this.each(function() {
				var options = opts || {}
				var othis = $(this),
					html = othis.html()
				if (othis.zdata('title')) options.title = othis.zdata('title')
				if (othis.zdata('skin')) options.skin = othis.zdata('skin')
				if (othis.zdata('encode')) options.encode = othis.zdata('encode')
				if (othis.zdata('about-text') && othis.zdata('about-link')) options.about = '<a href="' + othis.zdata('about-link') + ' target="_blank>' + othis.zdata('about-text') + '</a>'

				if (options.encode) {
					html = html.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
						.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;')
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
		},
		aniBox: function(opts) {
			var _this = $(this)
			if (!_this.length) return _this
			var inits = {
				aniName: z.anims[0],
				aniTime: 500
			}
			var options = $.extend({}, inits, opts)
			aniBox(_this, options)
			return _this
		},
		numberBox: function(opts) {
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
			return _this
		},
		swipeleft: function(cb) {
			swipe('left', $(this), cb)
			return $(this)
		},
		swiperight: function(cb) {
			swipe('right', $(this), cb)
			return $(this)
		},
		mobileNav: function(opts) {
			var _this = $(this)
			if (!_this.length) return
			var nav = _this.first()
			var inits = {
				item: '.z-nav-item',
				logo: 'z-logo',
				navCls: 'z-nav-blue',
				menuCls: '',
				child: '.z-dropdown-menu',
				toggle: true
			}
			var options = _getOpts(nav, inits, opts)
			mobileNav(nav, options)
			return _this
		},
		flyOut: function(t, cb) {
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
		},
		flow: function(opts, done) {
			var _this = $(this)
			if (!_this.length) return _this
			if ($.type(opts) === 'function') {
				done = opts
				opts = {}
			}
			var inits = {
				scrollElem: d,
				isAuto: true,
				endTxt: '没有更多了',
				eleTxt: '加载更多',
				loadingTxt: z.loadingHtml + '  加载中...',
				isLazyimg: false,
				mb: 50,
				done: done
			}
			var options = _getOpts(_this, inits, opts)
			flow(_this, options)
			return _this
		},
		lazyimg: function(scrollEle, cb) {
			var _this = $(this)
			if (!_this.length || _this.tagName() !== 'img') return _this
			if ($.type(scrollEle) === 'function') {
				cb = scrollEle
				scrollEle = d
			}
			var sEle = scrollEle || d
			lazyimg(_this, sEle, cb)
			return _this
		},
		album: function() {
			var _this = $(this)
			if (!_this.length || _this.tagName() !== 'img') return _this
			album(_this)
			return _this
		},
		dropdown: function(type) {
			var _this = $(this)
			if (!_this.length) return _this
			var isTree = false
			var selector = _this.selector
			var cls = '.z-nav-tree'
			type = type || _ck
			if (type == 'hover') {
				$(_b).on('mouseenter', selector, function() {
					var othis = $(this)
					isTree = othis.parents(cls).length
					if(!isTree || _bool(othis.parent().zdata('toggle')))	othis.siblings(selector).removeClass(z.active)
					othis.addClass(z.active)
				})
				$(_b).on('mouseleave', selector, function() {
					$(this).removeClass(z.active)
				})
			} else if (type == _ck) {
				$(_b).on(_ck, selector, function(e) {
					var othis = $(this)
					var ev = _prevent(e)
					isTree = othis.parents(cls).length
					if (isTree && othis.context === ev.target.parentNode) ev.preventDefault()
					if (othis.hasClass(z.active)) othis.removeClass(z.active)
					else {
						if(!isTree || _bool(othis.parent().zdata('toggle')))	othis.siblings(selector).removeClass(z.active)
						othis.addClass(z.active)
					}
				})
				$(d).on(_ck, function() {
					_this.each(function() {
						if (!$(this).parents(cls).length) $(this).removeClass(z.active)
					})
				})
			}
			return _this
		}
	})

	function album(ele, opts) {
		ele.css('cursor', 'pointer')
		$(_b).on(_ck, ele.selector, function() {
			var self = this
			var _this = $(this)
			if (!this.src || _this.zdata('src')) return
			var src = _this.zdata('bigsrc') || this.src
			var tip = _this.zdata('tip') || this.title
			var groups = []
			var group = _this.zdata('group')
			var index = 0
			if (!_bool(group, true)) {
				$(ele.selector + '[zdata-group="' + group + '"]').each(function() {
					groups.push(this)
				})
			}
			if (groups.length) {
				groups.sort(function(a, b) {
					var aint = _bool($(a).zdata('index'), true) ? parseInt($(a).index()) : parseInt($(a).zdata('index'))
					var bint = _bool($(b).zdata('index'), true) ? parseInt($(b).index()) : parseInt($(b).zdata('index'))
					return aint - bint
				})
				$.each(groups, function(k, v) {
					if (v === self) index = k
				})
			}
			var group = _this.zdata('group')
			var sliderBtn = groups.length && !z.isMobile ? $(z.sliderBtn) : ''
			var htmls = [
				'<div class="z-album">',
				'<span class="z-close z-action-close" zdata-box=".z-album">&times;</span>',
				'<div class="z-album-content ' + z.animCls + ' ' + _getAnim() + '">',
				'<div class="z-imgbox"></div>',
				'<div class="z-tipbox"></div>',
				'</div>',
				'</div>',
			]
			var html = $(htmls.join(''))
			var loading = $(z.loadingHtml)
			var box = html.find('.z-album-content')
			var imgbox = html.find('.z-imgbox')
			var tipbox = html.find('.z-tipbox')
			box.append(sliderBtn)
			$.createShade(function() {
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
				src = image.src
				tip = $(image).zdata('tip') || image.title
				tip = tip ? '&nbsp;&nbsp;' + tip : ''
				loadImg(src, function(img) {
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

			if (z.isMobile) {
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
				sliderBtn.on(_ck, function() {
					if ($(this).hasClass(sliderLeftCls)) --index
					else ++index
					showImg()
				})
			}
		})
	}

	function lazyimg(ele, sEle, cb, fromFlow) {
		var index = 0,
			haveScroll = fromFlow
		var notDocment = sEle && sEle !== d
		sEle = $(sEle)

		render()

		if (!haveScroll) {
			var timer
			sEle.on('scroll', function() {
				var othis = $(this)
				if (timer) clearTimeout(timer)
				timer = setTimeout(function() {
					render(null, othis)
				}, 60)
			})
			haveScroll = true
		}

		function show(item, height) {
			var start = sEle.scrollTop(),
				end = start + height
			var elemTop = notDocment ? function() {
				return item.offset().top - sEle.offset().top + start
			}() : item.offset().top

			if (elemTop >= start && elemTop <= end) {
				if (item.zdata('src')) {
					var src = item.zdata('src')
					loadImg(src, function() {
						var next = ele.eq(index)
						item.attr('src', src).removeAttr('zdata-src')
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
				for (var i = 0; i < ele.length; i++) {
					var item = ele.eq(i),
						elemTop = notDocment ? function() {
							return item.offset().top - sEle.offset().top + start;
						}() : item.offset().top

					show(item, height)
					index = i

					if (elemTop > end) break
				}
			}
		}
	}

	function loadImg(url, cb, error) {
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

	function flow(ele, opts) {
		var more = $('<button type="button" class="z-btn z-block z-btn-flow">' + opts.eleTxt + '</button>')
		var page = 1
		var lock, isOver, lazyImgFn = _bool(opts.isLazyimg),
			timer
		var notDocment = opts.scrollElem && opts.scrollElem !== d
		if (!ele.find('.z-btn-flow').length) {
			ele.append(more)
		}
		more.on(_ck, function() {
			if (isOver) return;
			lock || done()
		})
		lazyImgFn && lazyimg(ele.find('img'), opts.scrollElem, $.type(opts.isLazyimg) === 'function' ? opts.isLazyimg : null, true)
		if (!opts.isAuto) return ele
		$(opts.scrollElem).on('scroll', function() {
			var _this = $(this),
				top = _this.scrollTop()

			if (timer) clearTimeout(timer)
			if (isOver) return ele

			timer = setTimeout(function() {
				var height = notDocment ? _this.innerHeight() : winHeight
				var scrollHeight = notDocment ? _this.prop('scrollHeight') : d.documentElement.scrollHeight
				lazyImgFn && lazyimg(ele.find('img'), opts.scrollElem, $.type(opts.isLazyimg) === 'function' ? opts.isLazyimg : null, true)
				if (scrollHeight - top - height <= opts.mb) {
					lock || done()
				}
			}, 60)
		});

		return ele

		function next(html, over) {
			more.text(opts.eleTxt).before(html)
			over = over == 0 ? true : null
			if (over) more.addClass('z-disabled').text(opts.endTxt)
			isOver = over
			lock = null
		}

		function done() {
			lock = true
			more.html(opts.loadingTxt)
			$.type(opts.done) === 'function' && opts.done(++page, next)
		}
	}

	function numberBox(ele, opts) {
		var ipt = ele.find(opts.input)
		var next = ele.find(opts.next)
		var prev = ele.find(opts.prev)
		var step = parseFloat(opts.step)
		var max = parseFloat(opts.max)
		var min = parseFloat(opts.min)
		if (!ipt || !next || !prev || !ipt.length || !next.length || !prev.length) return
		if (max && max < min) return
		ipt.off('change').on('change', function() {
			var val = parseFloat($(this).val())
			if (isNaN(val)) val = min
			if (val <= min) {
				$(this).val(min)
				prev.addClass('z-disabled')
			} else {
				prev.removeClass('z-disabled')
			}
			if (max && val >= parseFloat(max)) {
				$(this).val(max)
				next.addClass('z-disabled')
			} else {
				next.removeClass('z-disabled')
			}
		})
		next.off(_ck).on(_ck, function() {
			var val = parseFloat(ipt.val())
			if ($(this).hasClass('z-disabled')) return
			val = val + step
			ipt.val(val).change()
		})
		prev.off(_ck).on(_ck, function() {
			var val = parseFloat(ipt.val())
			if ($(this).hasClass('z-disabled')) return
			val = val - step
			ipt.val(val).change()
		})
		ipt.change()
	}

	function mobileNav(nav, opts) {
		var can = true
		var items = nav.find(opts.item)
		var fixNav = $('<ul class="z-nav z-nav-tree z-nav-mobile"></ul>')
		var logo = ''
		var menu = $('<ul class="z-menu"><li></li><li></li><li></li></ul>')
		var child = opts.child.substr(1)
		items.each(function() {
			if ($(this).hasClass(opts.logo.replace('.', ''))) logo = $(this)
			fixNav.append($(this).addClass('z-nav-item'))
		})
		nav.html(logo).append(menu).addClass('z-nav-fixed-top').removeClass('z-action-mobilenav')

		fixNav.find(opts.child).each(function() {
			$(this).removeClass(child).addClass('z-nav-child').parent().removeClass('z-dropdown')
		})
		opts.navCls && fixNav.addClass(opts.navCls)
		opts.toggle && fixNav.zdata('toggle', opts.toggle)
		opts.menuCls && menu.addClass(opts.menuCls)
		nav.after(fixNav)
		menu.on(_ck, function() {
			if (!can) return false
			can = false
			var _this = $(this)
			if (fixNav.is(':hidden')) {
				$.createShade(function() {
					fixNav.css('zIndex', z.zIndex()).show().animate({
						'left': 0
					}, z.transTime)
					_this.addClass(z.active)
					can = true
				}, function() {
					menu.click()
				}, '.12')
				nav.css('zIndex', z.zIndex())
			} else {
				fixNav.animate({
					'left': '-100%'
				}, z.transTime, function() {
					fixNav.hide()
					_this.removeClass(z.active)
					closeShade(function() {
						can = true
					})
				})
			}
		})
		if (!z.isMobile) return
		$(d).swiperight(function() {
			if (!fixNav.is(':hidden')) return false
			menu.click()
		})
		$(d).swipeleft(function() {
			if (fixNav.is(':hidden')) return false
			menu.click()
		})
	}

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

	function resetForm(ele) {
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

	function include(type, files, cb) {
		if (!files) return
		if ($.type(files) === 'string') {
			files = [files]
		}
		if ($.type(files) !== 'array') return
		var node, suffix = '.' + type
		var i = 0
		require()

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
					file = z.root_path + file
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

	function showMsg(type, content, title, btns, cb) {
		var html = ''
		var htmls = []
		var modal_arr = ['alert', 'confirm', 'prompt', 'open']
		var delay = 4000
		var closeBtn = '<button type="button" class="z-close z-action-close">&times;</button>'
		if ($.inArray(type, modal_arr) !== -1) {
			var def_title = z.title[type]
			var def_btns = z.btns
			if ($.type(title) === 'array') {
				if ($.type(btns) !== 'array') btns = title
				title = def_title
			} else if ($.type(title) === 'function') {
				if ($.type(cb) !== 'function') cb = title
				title = def_title
			}
			if ($.type(btns) === 'function') {
				if ($.type(cb) !== 'function') cb = btns
				btns = def_btns
			}
			title = title || def_title
			if (_bool(btns, true)) btns = def_btns
			if (_bool(content, true)) content = ''
			htmls = [
				'<div class="z-modal z-move ' + function() {
					return 'open' === type ? '' : 'z-modal-sm'
				}() + ' ' + z.animCls + ' ' + _getAnim() + '">',
				'<div class="z-modal-header z-move-title z-action-move">',
				closeBtn,
				'<h4 class="z-modal-title">' + title + '</h4>',
				'</div>',
				'<div class="z-modal-body">',
				content,
				'</div>',
				'<div class="z-modal-footer z-text-center">'
			]
			if ('alert' === type) btns = ['', btns.slice(-1)]
			else if ('open' !== type) btns = btns.slice(0, 2)
			for (var i = 0; i < btns.length; i++) {
				if (btns[i].length)
					htmls.push('<button type="button" class="z-btn z-btn-' + z.color[i] + '">' + btns[i] + '</button>')
			}
			htmls.push('</div></div>')
			html = $(htmls.join(''))
			$.createShade(function() {
				$(_b).append(html)
				html.css('zIndex', z.zIndex()).show()
				var win = html.innerWidth()
				var hig = html.innerHeight()
				var ww = winWidth
				var wh = winHeight
				html.css({
					'margin': 0,
					'top': (wh - hig) / 3 > 0 ? (wh - hig) / 3 : 0,
					'left': (ww - win) / 2 > 0 ? (ww - win) / 2 : 0
				})
				_modalHeight(html)
				html.find('.z-modal-footer .z-btn').on(_ck, function() {
					cb && cb(html, $(this).index())
				})
			})
		} else if (type === 'msg') {
			$('.z-msg').remove()
			html = $('<div class="z-msg ' + z.anims[2] + ' ' + z.animCls + '" style="z-index:' + z.zIndex() + '">' + content + '</div>')
			$(_b).append(html)
			html.css({
				marginTop: -html.innerHeight() / 2,
				marginLeft: -html.innerWidth() / 2
			})
			setTimeout(function() {
				html.hide(z.closeTime, function() {
					html.remove()
				})
			}, delay)
		} else {
			var color = title
			var box = $('.z-alert-box')
			cb = btns
			if (!box || !box.length) {
				box = $('<div class="z-alert-box"></div>')
				$(_b).append(box)
			}
			box.css('zIndex', z.zIndex())
			htmls = [
				'<div class="z-alert z-alert-' + color + ' z-alert-dismissible ' + z.anims[4] + ' ' + z.animCls + '">',
				closeBtn,
				content,
				'</div>'
			]
			html = $(htmls.join(''))
			box.prepend(html)
			cb && cb()
			setTimeout(function() {
				_doClose(html)
			}, delay)
		}
	}

	function button(ele, type) {
		if (type === 'loading') {
			if (ele.hasClass('z-disabled')) return false
			var txt = ele.zdata('loading-text') || 'loading'
			txt = z.loadingHtml + '  ' + txt
			ele.attr('disabled', 'true').addClass('z-disabled').attr('zdata-old-text', ele.html()).html(txt)
		} else if (type === 'reset') {
			if (!ele.hasClass('z-disabled')) return false
			var txt = ele.zdata('old-text') || 'resetBtn'
			ele.removeAttr('disabled').removeAttr('zdata-old-text').removeClass('z-disabled').html(txt)
		}
	}

	function tips(ele, opts) {
		var timer = null
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
			var htmls = [
				'<div class="z-tipsbox ' + z.anims[1] + ' ' + z.animCls + '" style="z-index:' + z.zIndex() + ';top:' + (pos.top - 40) + 'px;left:' + function() {
					var left = pos.left
					if (wid < 17) left = left - 17
					if (left < 0) left = 0
					return left
				}() + 'px">',
				'<div class="z-tipsbox-content"' + function() {
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
				content,
				'</div><i style="border-right-color:' + opts.bgColor + '"></i>',
				'</div>'
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
	}

	function move(ele, opts) {
		var isDown = false
		var mtop = 0
		var mleft = 0
		var wid = 0
		var hig = 0
		var ww = winWidth
		var wh = winHeight
		var box = null
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
	}

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
		var sliderBtn = leg > 1 && !z.isMobile ? $(z.sliderBtn) : ''

		if (_bool(opts.dots)) {
			ele.append('<div class="z-dots">' + function() {
				var li = ''
				for (var i = 0; i < leg; i++) {
					if (0 === i) li += '<a href="javascript:;" class="' + z.active + '"></a>'
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

		if (z.isMobile) {
			var touch = null
			var sx = 0
			var direction = 'left'
			var move = 0
			ele.on('touchmove', function(e) {
				_prevent(e, true)
				move = touch.clientX - sx
				touch = e.originalEvent.changedTouches[0]
				box.css(mtype, mar + move)
			})

			ele.on('touchstart', function(e) {　　　　
				_prevent(e, true)
				touch = e.originalEvent.touches[0]
				sx = touch.clientX
				clearInterval(timer)
			})
			ele.on('touchend', function(e) {　　　　
				_prevent(e, true)
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
				if (dots) dots.removeClass(z.active).eq(index).addClass(z.active)
				if (opts.complete) opts.complete(item.eq(index + 1))
				canMove = true
			})
		}
	}

	function supportCss3(style) {
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

		for (i in prefix)
			humpString.push(_toHumb(prefix[i] + '-' + style))

		humpString.push(_toHumb(style))

		for (i in humpString)
			if (humpString[i] in htmlStyle) return true

		return false
	}

	function aniBox(ele, opts) {
		var isEnd = false
		ele.each(function() {
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
				ele.each(function() {
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
						item.addClass(item.zdata('aniName')).addClass('z-anim-ms' + parseInt(item.zdata('aniTime')) / 100).removeAttr('zdata-top').removeAttr('zdata-aniName').removeAttr('zdata-aniTime').animate({
								'opacity': 1
							}, z.transTime)
							++i
					}, 100)
				}
			} else {
				ele.css('opacity', 1)
				isEnd = true
			}
		}
	}

	function isMobile() {
		return navigator.userAgent.match(/mobile/i)
	}

	function closeShade(time, cb, rm) {
		if (!zShade) return false
		if (rm) shades = 0
			--shades
		if (shades <= 0) {
			shades = 0
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

	function _getCb(args) {
		var cb
		$.each(args, function(i, v) {
			if ($.type(v) === 'function') {
				cb = v
				return false
			}
		})
		return cb
	}

	function _getZsrc(src) {
		var pt = d.getElementsByTagName('script')
		for (var i = 0; i < pt.length; i++) {
			var s = pt[i]
			if (src && s.src.indexOf(src) !== -1) {
				return true
			}
			if (!src && s.src.indexOf('js/z.js') !== -1) {
				return s.src.replace('z.js', '')
			} else if (!src && s.src.indexOf('js/z.min.js') !== -1) {
				return s.src.replace('z.min.js', '')
			}
		}
		return false
	}

	function _getAnim() {
		return z.anims[Math.floor(Math.random() * z.anims.length)]
	}

	function _doClose(box, cb, rm, anibox) {
		var anibox = anibox || box
		var delay = z.closeTime
		if (_bool(rm, true)) rm = true
		rm = _bool(rm)
		if (rm) anibox.flyOut(delay, doing)
		else box.slideUp(delay, doing)

		function doing() {
			!box.hasClass(zBoxs[0].cls.replace('.', '')) && closeShade(delay)
			if (rm) box.remove()
			if (cb) cb()
		}
	}

	function _mousePosition(ev) {
		return {
			top: ev.clientY,
			left: ev.clientX
		}
	}

	function _getOpts(ele, inits, opts) {
		var options = inits
		if (opts) options = $.extend({}, inits, opts)

		$.each(options, function(key, val) {
			if (!_bool(ele.zdata(key), true)) options[key] = ele.zdata(key)
		})
		return options
	}

	function _bool(type, isUnde) {
		var unde = $.type(type) === 'undefined'
		if (isUnde) return unde
		if (unde) return false
		else if ($.type(type) === 'boolean') return type
		else if (type == 'false') return false
		return true
	}

	function _modalHeight(ele) {
		var header = ele.children('.z-modal-header')
		var body = ele.children('.z-modal-body')
		var footer = ele.children('.z-modal-footer')
		body.css('maxHeight', ele.innerHeight() - header.innerHeight() - footer.innerHeight())
	}

	function _prevent(e, pre){
		var ev = e || event
		ev.stopPropagation()
		pre && ev.preventDefault()
		return ev
	}


	$(function() {

		// 代码修饰器
		$('.z-action-code').code()

		// 日期选择器
		$('.z-action-datepicker').datepicker()

		if (z.isMobile) {
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

		// 下拉导航 & 树形导航
		$('.z-action-dropdown').dropdown()
		$('.z-action-dropdown-hover').dropdown('hover')

		// 替换单选框和复选框
		$.resetForm()

		// 单选框
		$(_b).on(_ck, '.z-form-radio', function() {
			if ($(this).hasClass(z.active)) return
			var zid = $(this).zdata('id')
			var zname = $(this).zdata('name')
			$('.z-form-radio[zdata-name="' + zname + '"]').removeClass(z.active)
			$(this).addClass(z.active)
			$('input[type="radio"][name="' + zname + '"]').each(function() {
				this.checked = $(this).zdata('id') === zid
				$(this).change()
			})
		})

		// 复选框
		$(_b).on(_ck, '.z-form-checkbox', function() {
			var zid = $(this).zdata('id')
			var _this = $(this)
			_this.toggleClass(z.active)
			$('input[type="checkbox"][zdata-id="' + zid + '"]').each(function() {
				this.checked = _this.hasClass(z.active)
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
		$(_b).on(_ck, '.z-tab-title li', function() {
			var _this = $(this)
			var lis = _this.parent().find('li')
			var items = _this.parents('.z-tab').find('.z-tab-content .z-tab-item')
			var index = _this.index()
			if (_this.hasClass(z.active)) return
			lis.removeClass(z.active)
			_this.addClass(z.active)
			items.removeClass('z-show').eq(index).addClass('z-show')
		})

		// 固定导航
		if ($('.z-nav.z-nav-fixed-top').length) $(_b).css('paddingTop', $('.z-nav.z-nav-fixed-top').innerHeight() + 20)
		if ($('.z-nav.z-nav-fixed-bottom').length) $(_b).css('paddingBottom', $('.z-nav.z-nav-fixed-bottom').innerHeight() + 20)

		// 阻止默认
		$(d).on(_ck, '.z-disabled,:disabled', function(e) {
			_prevent(e, true)
		})

		// 变换窗体
		$(w).on('resize', function() {
			z.winWidth = winWidth = $(w).innerWidth()
			z.winHeight = winHeight = $(w).innerHeight()
		})
	})

	w.z = z
})(window, document, jQuery)