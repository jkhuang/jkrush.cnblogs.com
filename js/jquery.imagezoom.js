/***********************************
* Author: Jackson Huang
* Blog: http://www.cnblogs.com/rush
* Date: 8/23/2013
* Reference: 
* http://www.sitepoint.com/html5-javascript-mouse-wheel/
* http://thecodeplayer.com/walkthrough/magnifying-glass-for-images-using-jquery-and-css3
***********************************/

;
(function ($) {

    $.fn.imageZoom = function (options) {


        // The native width and height of the image.
        var defaults = {
            scaling: 0.3
        };

        // Combines object defaults and options.
        var options = $.extend(defaults, options),
            native_width = 0,
            native_height = 0,
            current_width = 0,
            current_height = 0,
            $small = $(".small"),
            $large = $(".large");

        $(".magnify").mousemove(function (e) {
            /* Act on the event */
            if (!native_width && !native_height) {
                var image_object = new Image();
                image_object.src = $small.attr('src');

                // Gets the image native height and width.
                native_height = image_object.height;
                native_width = image_object.width;

                // Gets the image current height and width.
                current_height = $small.height();
                current_width = $small.width();

            } else {

                // Gets .maginfy offset coordinates.
                var magnify_offset = $(this).offset(),

                    // Gets coordinates within .maginfy.
                    mx = e.pageX - magnify_offset.left,
                    my = e.pageY - magnify_offset.top;

                // Checks the mouse within .maginfy or not.
                if (mx < $(this).width() && my < $(this).height() && mx >
                    0 && my > 0) {
                    $large.fadeIn(100);
                } else {
                    $large.fadeOut(100);
                } if ($large.is(":visible")) {
                    /* Gets the large image coordinate by ratio 
				   small.x / small.width = large.x / large.width
				   small.y / small.height = large.y / large.height
				   then we need to keep pointer in the centre, 
				   so deduct the half of .large width and height.
				*/
                    var rx = Math.round(mx / $small.width() * native_width - $large.width() / 2) * -1,
                        ry = Math.round(my / $small.height() * native_height - $large.height() / 2) * -1,
                        bgp = rx + "px " + ry + "px",
                        px = mx - $large.width() / 2,
                        py = my - $large.height() / 2;
                    $large.css({
                        left: px,
                        top: py,
                        backgroundPosition: bgp
                    });
                }

            }
        });

        $(".magnify").bind('DOMMouseScroll mousewheel onmousewheel', function (e) {
            var image_object = new Image();
            image_object.src = $large.attr('src');


            // cross-browser wheel delta
            var e = window.event || e; // old IE support.
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

            // Gets the image scaling height and width.
            native_height += (native_height * defaults.scaling * delta);
            native_width += (native_width * defaults.scaling * delta);

            // The image can't smaller than the original.
            if (native_height < current_height) {
                native_height = current_height;
            }

            if (native_width < current_width) {
                native_width = current_width;
            }

            // console.log("native_height: " + native_height + " native_width: " + native_width);

            // Gets .maginfy offset coordinates.
            var magnify_offset = $(this).offset(),
                mx = e.pageX - magnify_offset.left,
                my = e.pageY - magnify_offset.top;

            // Update backgroud image size.
            $large.css('background-size', native_width + "px " + native_height + "px");

            /* Gets the large image coordinate by ratio 
			   small.x / small.width = large.x / large.width
			   small.y / small.height = large.y / large.height
			   then we need to keep pointer in the centre, 
			   so deduct the half of .large width and height.
			*/
            var rx = Math.round(mx / $small.width() * native_width - $large.width() / 2) * -1,
                ry = Math.round(my / $small.height() * native_height - $large.height() / 2) * -1,
                bgp = rx + "px " + ry + "px",
                px = mx - $large.width() / 2,
                py = my - $large.height() / 2;

            $large.css({
                left: px,
                top: py,
                backgroundPosition: bgp
            });
        });
    }
})(jQuery);
