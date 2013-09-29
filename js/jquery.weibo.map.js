(function ($) {
    $.fn.weiboMap = function (options) {
        'use strict';
        // Version = '0.0.0.1';
        var opts = $.extend(true, {}, options, $.fn.weiboMap.defaults),
        ey, my, mouseDown = false, geoCoder;


        $.fn.weiboMap.init();

        // Gets the list of weibo screen name
        // from the .get div.
        function getUsers() {
            var arr = new Array();
            $('.get').find('input').each(function (i) {
                var $element = $(this);
                arr[i] = $element.val();
            });
            return arr;
        }

        show();

        // Get weibo user show and binding data
        // with google map.
        function show() {

            // Gets the weibo user screen name.
            var users = getUsers();
            for (var i = users.length - 1; i >= 0; i--) {

                // Invokes the weibo api to get data.
                $.getJSONP({
                    url: opts.url,
                    timeout: 30000,
                    data: {
                        source: opts.appKey,
                        access_token: opts.accessToken,
                        screen_name: users[i]
                    },
                    error: function (xhr, status, e) {
                        console.log(e);
                    },
                    complete: function () {

                    },
                    success: function (json) {
                        if (json.data.error) {
                            // log the error.
                            return;
                        }

                        var arr = new Array(),
                            img = json.data.profile_image_url,
                            screen_name = json.data.screen_name;

                        // Initalizes the geo coder instance.    
                        geocoder.geocode({
                            address: json.data.location
                        }, function (response, status) {
                            if (status == google.maps.GeocoderStatus.OK) {

                                // Sets latitude and longitude by location name.
                                var x = response[0].geometry.location.lat(),
                                    y = response[0].geometry.location.lng(),
                                    blogUrl,
                                marker = new google.maps.Marker({
                                    icon: img,
                                    map: map,
                                    title: screen_name,
                                    animation: google.maps.Animation.DROP,
                                    position: new google.maps.LatLng(x, y)
                                });

                                // Creates user information.
                                blogUrl = json.data.url !== '' ? json.data.url : 'http://www.weibo.com/u/' + json.data.id;
                                arr.push('<div class="item">');
                                arr.push('<p class="img"><a href="#" class="open" rel="' + screen_name + '"><img src="' + img + '" alt="" /></a></p>');
                                arr.push('<div class="entry">');
                                arr.push('<a href="#" class="open title" rel="' + screen_name + '">' + json.data.name + '</a>');
                                arr.push('<p class="description">' + json.data.description + '</p>');
                                arr.push('<p class="url"><a href="' + blogUrl + '" target="_blank">' + blogUrl + '</a></p>');
                                arr.push('<p class="count">粉丝: ' + json.data.followers_count + ', 关注: ' + json.data.friends_count + '</p>');
                                arr.push('</div>');
                                arr.push('</div>');
                                var html = arr.join('');
                                arr = [];
                                $('.weibo').find('.inside').append(html);

                                // Clicks the user image showing relative user's weibo.
                                google.maps.event.addListener(marker, 'click', function () {
                                    open(this.title);
                                });
                            }

                        });
                    }
                });
            };

        }

        // When click the user image, then showing the user weibo.
        function click() {
            // toggleBounce();
            $('.weibo').find('.open').live('click', function () {
                var t = $(this),
                    rel = t.attr('rel');
                open(rel);
            });
        }

        // Displays the user weibo.
        function open(user) {
            var posts = $('.posts'),
                arr = new Array;
            $.getJSONP({
                url: opts.urlTimeline,
                timeout: 30000,
                data: {
                    source: opts.appKey,
                    access_token: opts.accessToken,
                    screen_name: user
                },
                error: function (xhr, status, e) {
                    console.log(e);
                },
                complete: function () {

                },
                success: function (json) {
                    // Displays the weibo in post div.
                    $.each(json.data.statuses, function (i, post) {
                        arr.push('<div class="post">');
                        arr.push(post.text);
                        arr.push('</div>');
                    });
                    var html = arr.join('');
                    posts.html(html).fadeIn();
                }
            });
        }

        // Gets mouse Y coordinate.
        function getYCoordinate(e) {
            var y = e.pageY;
            return y;
        }

        // Checks move size.
        function checkYCoordinate(y) {
            var all = $('.weibo').height(),
                inside = $('.weibo').find('.inside').height();
            // The max move size |all - inside|.    
            if (y < (all - inside)) {
                y = all - inside;
            } else if (y > 0) {
                y = 0;
            }
            return y;
        }

        // Updates inside top css.
        function update(e) {
            // Gets the current Y coordinate.
            var y = getYCoordinate(e),
                // The move size, if move up movey < 0,
                // otherwise movey >= 0.
                movey = y - my,

                // Changes Y coordinate.
                top = ey + movey,
            check = checkYCoordinate(top);
            console.log(top, check);
            $('.weibo').find('.inside').css({
                top: check + 'px'
            });
        }

        init();

        function init() {
            $('.weibo').find('.inside').bind({
                mousedown: function (e) {
                    e.preventDefault();
                    mouseDown = true;
                    var mouseY = getYCoordinate(e),
                    // Gets element coordinate.
                    element = $(this).position();

                    // Gets Y coordinate move.
                    my = mouseY;
                    ey = element.top;
                    update(e);
                },
                mousemove: function (e) {
                    if (mouseDown)
                        update(e);
                    return false;
                },
                mouseup: function () {
                    if (mouseDown)
                        mouseDown = false;
                    return false;
                },
                mouseleave: function () {
                    if (mouseDown)
                        mouseDown = false;
                    return false;
                }
            });
        }
    };

    // Gets the size of window .
    $.fn.weiboMap.size = function () {
        var w = $(window).width(),
            h = $(window).height();
        return {
            width: w,
            height: h
        };
    }

    // Initalizes the google map
    $.fn.weiboMap.init = function () {

        // Sets the size of map.
        var size = $.fn.weiboMap.size();
        $('#map').css({
            width: size.width,
            height: size.height
        });

        // Creates a google map instance.
        map = new google.maps.Map(document.getElementById('map'), $.fn.weiboMap.defaults.data);

        // Creates a geo coder instance.
        geocoder = new google.maps.Geocoder();
        google.maps.event.addListener(map, 'dragstart', function () {
            $('.posts').hide();
        });
    }

    $.fn.weiboMap.defaults = {
        url: 'https://api.weibo.com/2/users/show.json?',
        urlTimeline: 'https://api.weibo.com/2/statuses/user_timeline.json?',
        appKey: '82966982',
        accessToken: '5Jao51NF1i5PDC91hhI3ID86ucoDtn4C',
        uid: '',
        screenName: '',
        data: {
            zoom: 4,
            center: new google.maps.LatLng(39, 115), // Sets map init center location.
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
    };


    /**
     * Sends cross origin request with ajax and jsonp.
     * @param s
     * The params need to send to server.
     * For instance, url, appkey, q or count and so forth.
     */
    $.getJSONP = function (s) {

        // Due to cross origin request, so we to use jsonp format.
        s.dataType = "jsonp";
        $.ajax(s);

        // figure out what the callback fn is
        var $script = $(document.getElementsByTagName('head')[0].firstChild);
        var url = $script.attr('src') || '';

        // Gets callback function
        var cb = (url.match(/callback=(\w+)/) || [])[1];

        if (!cb)
            return; // bail
        var t = 0,
            cbFn = window[cb];

        $script[0].onerror = function (e) {
            $script.remove();
            handleError(s, {}, "error", e);
            clearTimeout(t);
        };

        if (!s.timeout)
            return;

        window[cb] = function (json) {
            clearTimeout(t);
            cbFn(json);
            cbFn = null;
        };

        // Gets time out function flag.
        t = setTimeout(function () {
            $script.remove();
            handleError(s, {}, "timeout");
            if (cbFn)
                window[cb] = function () {};
        }, s.timeout);

        /**
         * Fix issue: "jQuery.handleError is not a function"
         * @param s
         * @param xhr
         * @param msg
         * @param e
         */

        function handleError(s, xhr, msg, e) {
            s.error && s.error.call(s.context, xhr, msg, e);
            s.global && $.event.trigger("ajaxError", [xhr, s, e || msg]);
            s.complete && s.complete.call(s.context, xhr, e || msg);
        }
    };

})(jQuery);

// var map, geocoder, marker,
// 	ey, my, mouseDown = false;
// var o = {
// 	init: function(){
// 		this.map.init();
// 		this.twitter.show();
// 		this.twitter.click();
// 		this.scroll.init();
// 	},
// 	twitter: {
// 		get: function(){
// 			var arr = new Array;
// 			$('.get').find('input').each(function(i){
// 				var t = $(this), 
// 					val = t.val();
// 				arr[i] = val;				
// 			});
// 			return arr;
// 		},
// 		show: function(){
// 			var users = o.twitter.get(), arr = new Array;
// 			for (i in users){
// 				var user = users[i];
// 				$.getJSON('https://api.weibo.com/2/users/show.json?uid=1904178193&access_token=2.00sr7reCxEt2SE4b5b64eb1bJegkYC&callback=?', function(data) {
// 					var img = data.data.profile_image_url,
// 						screen_name = data.data.screen_name;
// 					geocoder.geocode({ address: data.data.location }, function(response, status){
// 						if (status == google.maps.GeocoderStatus.OK) {
// 							var x = response[0].geometry.location.lat(),
// 								y = response[0].geometry.location.lng();
// 							marker = new google.maps.Marker({
// 								icon: img,
// 								map: map,
// 								title: screen_name,
// 								position: new google.maps.LatLng(x, y)
// 							});
// 							arr.push('<div class="item">');
// 							arr.push('<p class="img"><a href="#" class="open" rel="'+screen_name+'"><img src="'+img+'" alt="" /></a></p>');
// 							arr.push('<div class="entry">');
// 							arr.push('<a href="#" class="open title" rel="'+screen_name+'">'+data.name+'</a>');
// 							arr.push('<p class="description">'+data.description+'</p>');
// 							arr.push('<p class="url"><a href="'+data.url+'" target="_blank">'+data.url+'</a></p>');
// 							arr.push('<p class="count">Followers: '+data.followers_count+', Following: '+data.friends_count+'</p>');
// 							arr.push('</div>');
// 							arr.push('</div>');
// 							var html = arr.join('');
// 							arr = [];
// 							$('.twitter').find('.inside').append(html);
// 							google.maps.event.addListener(marker, 'click', function(){
// 								o.twitter.open(this.title);
// 							}); 
// 						}
// 					});
// 				});
// 			}
// 		},
// 		click: function(){
// 			$('.twitter').find('.open').live('click', function(){
// 				var t = $(this), rel = t.attr('rel');
// 				o.twitter.open(rel);
// 			});
// 		},
// 		open: function(user){
// 			var posts = $('.posts'), arr = new Array;
// 			$.getJSON('http://twitter.com/status/user_timeline/'+user+'.json?count=5&callback=?', function(data) {
// 				$.each(data, function(i, post){
// 					arr.push('<div class="post">');
// 					arr.push(post.text);
// 					arr.push('</div>');
// 				});
// 				var html = arr.join('');
// 				posts.html(html).fadeIn();
// 			});
// 		}
// 	},
// 	map: {
// 		size: function(){
// 			var w = $(window).width(),
// 				h = $(window).height();
// 			return { width: w, height: h }
// 		},
// 		data: {
// 			zoom: 3,
// 			center: new google.maps.LatLng(52, 23),
// 			mapTypeId: google.maps.MapTypeId.ROADMAP
// 		},
// 		init: function(){
// 			var size = o.map.size();
// 			$('#map').css({ width: size.width, height: size.height });
// 			map = new google.maps.Map(document.getElementById('map'), o.map.data),
// 			geocoder = new google.maps.Geocoder();
// 			google.maps.event.addListener(map, 'dragstart', function(){
// 				$('.posts').hide();
// 			}); 
// 		}
// 	},
// 	scroll: {
// 		mouse: function(e){
// 			var y = e.pageY; 
// 			return y;
// 		},
// 		check: function(y){
// 			var all = $('.twitter').height(),
// 				inside = $('.twitter').find('.inside').height();
// 			if (y < (all - inside)) {
// 				y = all - inside;
// 			} else if (y > 0) {
// 				y = 0;
// 			}
// 			return y;
// 		},
// 		update: function(e){
// 			var y = o.scroll.mouse(e),
// 				movey = y-my,
// 				top = ey+movey;
// 				check = o.scroll.check(top);
// 			$('.twitter').find('.inside').css({ top: check+'px' });
// 		},
// 		init: function(){
// 			$('.twitter').find('.inside').bind({
// 				mousedown: function(e){
// 					e.preventDefault();
// 					mouseDown = true;
// 					var mouse = o.scroll.mouse(e);
// 						my = mouse;
// 					var element = $(this).position();
// 						ey = element.top;
// 					o.scroll.update(e);
// 				},
// 				mousemove: function(e){
// 					if (mouseDown)
// 						o.scroll.update(e);
// 					return false;
// 				},
// 				mouseup: function(){
// 					if (mouseDown)
// 						mouseDown = false;
// 					return false;
// 				},
// 				mouseleave: function(){
// 					if (mouseDown)
// 						mouseDown = false;
// 					return false;
// 				}
// 			});
// 		}
// 	}
// }

// $(function(){ o.init(); });
