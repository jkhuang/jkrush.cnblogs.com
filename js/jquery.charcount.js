/**
 * Created with JetBrains WebStorm.
 * User: Jackson Huang
 * Description: The char count plugin.
 * Date: 2013-1-20
 * Update: 2013-05-12
 */

;
(function ($) {
    $.fn.charCount = function (options) {

        // The default limitation.
        var defaults = {
            allowed:140, // the max of char enter.
            warning:25, // the rest of 25 char.
            css:'counter',
            counterElement:'span',
            cssWarning:'warning',
            cssExceeded:'exceeded',
            counterText:''
        };

        // Combines object defaults and options.
        var options = $.extend(defaults, options);

        /**
         * Get the length of string.
         * @param Input str.
         * @return The length of str.
         */
        function getLength(str) {
            var totLen = 0;
            for (var i = 0; i < str.length; i++) {
                // If the char is Chinese.
                if (str.charCodeAt(i) > 256) {
                    totLen += 1;
                }
                // Otherwise, the length of str adds 0.5.
                else {
                    totLen += 0.5;
                }
            }
            return Math.floor(totLen);
        }


        /**
         * Get the length of string (More efficient).
         * You can get test case thru the link as below:
         * http://jsperf.com/get-the-length-of-string
         * @param Input str.
         * @return The length of str.
         */
        function getStringLength(str) {
            return Math.floor(str.replace(/[^\x00-\xff]/g, "**").length / 2);
        }

        /***
         * Calculates the char.
         * @param obj
         */
        function calculate(obj) {

            // Get the count.
            var count = getStringLength($(obj).val());
            var available = options.allowed - count;

            if (available <= options.warning && available >= 0) {
                $(obj).next().addClass(options.cssWarning);
            }
            else {
                $(obj).next().removeClass(options.cssWarning);
            }
            if (available < 0) {
                $(obj).next().addClass(options.cssExceeded);
            }
            else {
                $(obj).next().removeClass(options.cssExceeded);
            }
            $(obj).next().html(options.counterText + available);
        }

        /**
         * Stores user data into local storage.
         * @param obj
         */
        function storeWeibo(obj) {

            // Checks the browser supports local storage or not.
            if (window.localStorage) {
                localStorage.setItem('publisherTop_word', $(obj).val());
            }
            else {

                // For instance, ie 6 and 7 do not support local storage,
                // so we need to provider other way.
                window.localStorage = {
                    getItem:function (sKey) {
                        if (!sKey || !this.hasOwnProperty(sKey)) {
                            return null;
                        }
                        return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g,
                            "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
                    },
                    key:function (nKeyId) {
                        return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
                    },
                    setItem:function (sKey, sValue) {
                        if (!sKey) {
                            return;
                        }
                        document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
                        this.length = document.cookie.match(/\=/g).length;
                    },
                    length:0,
                    removeItem:function (sKey) {
                        if (!sKey || !this.hasOwnProperty(sKey)) {
                            return;
                        }
                        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                        this.length--;
                    },
                    hasOwnProperty:function (sKey) {
                        return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
                    }
                };
                window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
            }
        }

        // Binds text area keyup, keydown and change event.
        this.each(function () {
            $(this).after('<' + options.counterElement + ' class="' + options.css + '">' + options.counterText + '</' +
                options.counterElement + '>');

            $(this).val(window.localStorage.getItem('publisherTop_word'));
            calculate(this);
            $(this).keyup(function () {
                calculate(this), storeWeibo(this)
            });
            $(this).keydown(function () {
                calculate(this), storeWeibo(this)
            });
            $(this).change(function () {
                calculate(this)
            });

            // Catchs right paste changed teatarea.
            $(this).bind('input propertychange', function () {
                calculate(this)
            });

        });
    }

})(jQuery);

