(function ($) {
    $.fn.loadMore = function () {
        'use strict';
        var trackLoad = { groupNumber: 1, loading: false },
            totalGroups = 12;  //hard code the total groups.

        // The scroll event.
        $(window).scroll(function () {
            // When scrollbar at bottom, invoked getData() function.
            if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                if (trackLoad.groupNumber <= totalGroups && !trackLoad.loading) {
                    trackLoad.loading = true;      // Blocks other loading data again.
                    $('.animation_image').show();
                    $.getData(trackLoad);
                }
            }
        });

        $.getData(trackLoad);
    };
    
    $.fn.loadMore.defaults = {
        url: 'RabbitWS.asmx/GetListMessages',
        groupNumber: 1,
        loading: false
    };

    /**
     * Sends same origin request with ajax and json.
     * @param options
     * The options need to send to server.
     * For instance: url and groupNumber.
     */
    $.getData = function (options) {

        var opts = $.extend(true, {}, $.fn.loadMore.defaults, options);
        
        $.ajax({
            url: opts.url,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: "{groupNumber:" + opts.groupNumber + "}",
            success: function (data, textStatus, xhr) {
                if (data.d) {
                    // We need to convert JSON string to object, then
                    // iterate thru the JSON object array.
                    $.each($.parseJSON(data.d), function () {
                        $("#result").append('<li id="">' +
                            this.Id + ' - ' + '<strong>' +
                            this.Name + '</strong>' + ' — ' + '<span class="page_message">' +
                            this.Comment + '</span></li>');
                    });
                    $('.animation_image').hide();
                    options.groupNumber++;
                    options.loading = false;
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                options.loading = true;
                console.log(errorThrown.toString());
            }
        });
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
                window[cb] = function () { };
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
