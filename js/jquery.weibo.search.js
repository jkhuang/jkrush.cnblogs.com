/**
 * jQuery Weibo Search plugin.
 * Searching weibos under the keyword.
 * Weibo api: http://open.weibo.com/wiki/2/search/topics
 * User: Jackson Huang
 * Date: 13-2-11
 * Time: 下午9:00
 * Blog: http://www.cnblogs.com/rush/
 */

;
(function ($) {
    $.fn.weiboSearch = function (options) {

        Version = "0.0.0.1";
        // weibo keyword for searching.
        if (typeof options == 'string') {
            options = {term:options};
        }

        return this.each(function () {
            var grabFlag = false,
                grabbing = false,
                $frame = $(this), text, $text, $title, $bird, $cont, height, paused = false,

            // Combines parameters.
                opts = $.extend(true, {}, $.fn.weiboSearch.defaults, options || {}, $.metadata ? $frame.metadata() : {});

            // User default formatter and filter function, or custom function.
            opts.formatter = opts.formatter || $.fn.weiboSearch.formatter;
            opts.filter = opts.filter || $.fn.weiboSearch.filter;

            // Clears default css style.
            if (!opts.applyStyles) {
                for (var css in opts.css) {
                    opts.css[css] = {};
                }
            }

            if (opts.title === null) {
                opts.title = opts.term;
            }

            opts.title = opts.title || '';
            text = opts.titleLink ? ('<a href="' + opts.titleLink + '">' + opts.title + '</a>') : ('<span>' + opts.title + '</span>');
            $text = $(text);

            // Applies css in weibo status.
            if (opts.titleLink) {
                $text.css(opts.css['titleLink']);
            }

            $title = $('<div class="weiboSearchTitle"></div>').append($text).appendTo($frame).css(opts.css['title']);

            // Adds weibo logo.
            if (opts.eye) {
                $bird = $('<img class="weiboSearchBird" src="' + opts.eyeSrc + '" />').appendTo($title).css(opts.css['eye']);
                if (opts.eyeLink)
                    $bird.wrap('<a href="' + opts.eyeLink + '"></a>');
            }

            $cont = $('<div class="weiboSearchContainter"></div>').appendTo($frame).css(opts.css['container']);
            cont = $cont[0];

            if (opts.colorExterior)
                $title.css('background-color', opts.colorExterior);
            if (opts.colorInterior)
                $cont.css('background-color', opts.colorInterior);

            $frame.css(opts.css['frame']);
            if (opts.colorExterior)
                $frame.css('border-color', opts.colorExterior);

            // Gets frame inner height and title outer height.
            height = $frame.innerHeight() - $title.outerHeight();
            // Sets contain height.
            $cont.height(height);

            if (opts.pause)
                $cont.hover(function () {
                    paused = true;
                }, function () {
                    paused = false;
                });

            $('<div class="weiboSearchLoading">Loading weibos..</div>').css(opts.css['loading']).appendTo($cont);

            // Gets weibo by ajax request.
            grabWeibos();

            /**
             * Uses ajax requst to grab weibo.
             */
            function grabWeibos() {
                var url = opts.url;
                grabFlag = false;
                grabbing = true;

                $.getJSONP({
                    url:url,
                    timeout:30000,
                    data:{
                        source:opts.appKey,
                        q:opts.term,
                        count:opts.numWeibo
                    },

                    error:function (xhr, status, e) {
                    },
                    complete:function () {
                        grabbing = false;
                        if (opts.refreshSeconds)
                            setTimeout(regrab, opts.refreshSeconds * 1000);
                    },

                    // Gets response data from weibo api.
                    success:function (json) {
                        if (json.data.error) {
                            // Can't get data displays error.
                            failEye(json.data.error);
                            return;
                        }

                        // Emptys contain with fade out effect.
                        $cont.fadeOut('fast', function () {
                            $cont.empty();

                            // iterates weibo results
                            $.each(json.data.statuses, function (i) {
                                if (!opts.filter.call(opts, this) || this.truncated)
                                    return; // skip this weibo, some weibos may be deleted.
                                var $img, $text, w,
                                    tweet = opts.formatter(this, opts),
                                    $tweet = $(tweet);

                                // Weibo data.
                                $tweet.css(opts.css['tweet']);
                                $img = $tweet.find('.weiboSearchProfileImg').css(opts.css['img']);
                                $tweet.find('.weiboSearchUser').css(opts.css['user']);
                                $tweet.find('.weiboSearchTime').css(opts.css['time']);
                                $tweet.find('a').css(opts.css['a']);
                                $tweet.appendTo($cont);
                                $text = $tweet.find('.weiboSearchText').css(opts.css['text']);

                                if (opts.avatar) {
                                    w = $img.outerWidth() + parseInt($tweet.css('paddingLeft'));
                                    $text.css('paddingLeft', w);
                                }
                            })

                            // Loads weibos with fade in effect.
                            $cont.fadeIn('fast');

                            // Invokes weibo api again.
                            if (json.data.statuses.length < 2) {
                                if (opts.refreshSeconds)
                                    setTimeout(gradWeibos, opts.refreshSeconds * 1000);
                                return;
                            }

                            // stage first animation

                            if (opts.direction === 'up' || opts.direction === '') {
                                setTimeout(weiboOut, opts.timeout);
                            }
                            else {
                                setTimeout(weiboIn, opts.timeout);
                            }
                        });
                    }
                });
            }

            function regrab() {
                grabFlag = true;
            }

            function failEye(msg) {
                var $fail = $('<div class="weiboSearchFail">' + msg + '</div>').css(opts.css['fail']);
                $cont.empty().append($fail);
            };

            /**
             * Weibos rolling from bottom to top.
             */
            function weiboOut() {
                if (paused || grabbing) {
                    setTimeout(weiboOut, 500);
                    return;
                }

                // Gets last element.
                var h, $el = $cont.children(':first'), el = $el[0];

                // Implements fade out effect.
                $el.animate(opts.animOut, opts.animOutSpeed, function () {

                    // Gets first weibo item height.
                    h = $el.outerHeight();
                    $el.animate({ marginTop:-h}, opts.animInSpeed, function () {

                        $el.css({ marginTop:0, opacity:1 });
                        /*@cc_on
                         try { el.style.removeAttribute('filter'); } // ie cleartype fix
                         catch(smother) {}
                         @*/

                        // append the last weibo item last.
                        $el.css(opts.css['tweet']).show().appendTo($cont);
                        setTimeout(grabFlag ? grabWeibos : weiboOut, opts.timeout);
                    });
                });
            }


            /**
             * Rolling from top to buttom.
             */
            function weiboIn() {
                if (paused || grabbing) {
                    setTimeout(weiboIn, 500);
                    return;
                }
                var h, $el = $cont.children(':last'), el = $el[0];
                var $elFirst = $cont.children(':first');
                h = $el.outerHeight();

                $elFirst.animate({ marginTop:h}, opts.animInSpeed, function () {
                    $elFirst.css({ marginTop:0});
                    /*@cc_on
                     try { el.style.removeAttribute('filter'); } // ie cleartype fix
                     catch(smother) {}
                     @*/

                    // append the last weibo item first.
                    $el.css(opts.css['tweet']).hide().prependTo($cont);
                    // Fade in display new item.
                    $el.fadeIn(opts.animInSpeed);

                    // Loop
                    setTimeout(grabFlag ? grabWeibos : weiboIn, opts.timeout);

                });

            }
        });
    }

    $.fn.weiboSearch.filter = function (tweet) {
        return true;
    }

    $.fn.weiboSearch.formatter = function (json, opts) {
        var str, pretty,
            text = json.text;
        if (opts.anchors) {
            text = json.text.replace(/(http:\/\/\S+)/g, '<a href="$1">$1</a>');
            text = text.replace(/\@(\w+)/g, '<a href="http://www.weibo.com/$1">@$1</a>');
        }
        str = '<div class="weiboSearchTweet">';
        if (opts.avatar)
            str += '<img class="weiboSearchProfileImg" src="' + json.user.profile_image_url + '" />';
        str += '<div><span class="weiboSearchUser"><a href="http://www.weibo.com/' + json.user.profile_url + '/status/' + json.user.idstr + '">'
            + json.user.screen_name + '</a></span>';
        pretty = relativeTime(json.created_at);
        if (opts.time && pretty)
            str += ' <span class="weiboSearchTime">(' + pretty + ')</span>'
        str += '<div class="weiboSearchText">' + text + '</div></div></div>';
        return str;
    };

    $.fn.weiboSearch.defaults = {
        url:'https://api.weibo.com/2/search/topics.json?', //'http://search.twitter.com/search.json?callback=?&q=',
        appKey:'5786724301',
        numWeibo:14,
        anchors:true, // true or false (enable embedded links in tweets)
        animOutSpeed:500, // speed of animation for top tweet when removed
        animInSpeed:500, // speed of scroll animation for moving tweets up
        animOut:{ opacity:0 }, // animation of top tweet when it is removed
        animIn:{opacity:0},
        applyStyles:true, // true or false (apply default css styling or not)
        avatar:true, // true or false (show or hide twitter profile images)
        eye:true, // true or false (show or hide twitter bird image)
        eyeLink:false, // url that twitter bird image should like to
        eyeSrc:'./images/LOGO_32x32.png', //'http://cloud.github.com/downloads/malsup/twitter/tweet.gif', // twitter bird image
        colorExterior:null, // css override of frame border-color and title background-color
        colorInterior:null, // css override of container background-color
        direction:'up',
        filter:null, // callback fn to filter tweets:  fn(tweetJson) { /* return false to skip tweet */ }
        formatter:null, // callback fn to build tweet markup
        pause:false, // true or false (pause on hover)
        refreshSeconds:0, // number of seconds to wait before polling for newer tweets
        term:'', // twitter search term
        time:true, // true or false (show or hide the time that the tweet was sent)
        timeout:4000, // delay betweet tweet scroll
        title:null, // title text to display when frame option is true (default = 'term' text)
        titleLink:null, // url for title link

        // Weibo css style.
        css:{
            // default styling
            a:{ textDecoration:'none', color:'#3B5998' },
            eye:{ width:'40px', height:'40px', position:'absolute', left:'-30px', top:'-20px', border:'none' },
            container:{ overflow:'hidden', backgroundColor:'#eee', height:'100%' },
            fail:{ background:'#6cc5c3 url(./images/error_page_small.png)  no-repeat 50% 50%', height:'100%', padding:'10px' },
            frame:{ border:'10px solid #C2CFF1', borderRadius:'10px', '-moz-border-radius':'10px', '-webkit-border-radius':'10px' },
            tweet:{ padding:'5px 10px', clear:'left' },
            img:{ 'float':'left', margin:'5px', width:'48px', height:'48px' },
            loading:{ padding:'20px', textAlign:'center', color:'#888' },
            text:{},
            time:{ fontSize:'smaller', color:'#888' },
            title:{ backgroundColor:'#C2CFF1', margin:0, padding:'0 0 5px 0', textAlign:'center', fontWeight:'bold', fontSize:'large', position:'relative' },
            titleLink:{ textDecoration:'none', color:'#3B5998' },
            user:{ fontWeight:'bold' }
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
        var t = 0, cbFn = window[cb];

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
                window[cb] = function () {
                };
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

    // Reference:　http://www.w3school.com.cn/js/jsref_obj_regexp.asp
    // https://twitter.com/javascripts/blogger.js
    // Time format pretty function.
    function relativeTime(dateString) {
        var values = dateString.split(" ");
        dateString = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
        var parsed_date = Date.parse(dateString);
        var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
        var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
        delta = delta + (relative_to.getTimezoneOffset() * 60);

        if (delta < 60) {
            return 'just now';
        } else if (delta < 120) {
            return 'a minute ago';
        } else if (delta < (60 * 60)) {
            return (parseInt(delta / 60)).toString() + ' minutes ago';
        } else if (delta < (120 * 60)) {
            return 'about an hour ago';
        } else if (delta < (24 * 60 * 60)) {
            return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
        } else if (delta < (48 * 60 * 60)) {
            return '1 day ago';
        } else {
            return (parseInt(delta / 86400)).toString() + ' days ago';
        }
    }

})(jQuery);

