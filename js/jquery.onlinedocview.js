(function ($) {

    /*****
    * The viewer function, when user click #forwardpage, #backpage or image directly,
    * load the corrosponding image.
    ******/
    $.fn.viewer = function (options) {
        'use strict';

        var opts = $.extend(true, {}, $.fn.viewer.defaults, options);

        var $docImage = $('#doccontainer > img');

        // Implements the image click function.
        $docImage.on('click', function (e) {
            e.preventDefault();
            var currentId = $(this).attr('data-page'),
                // Gets next page id.
                nextImgId = parseInt(currentId) + 1,
                nextImgSrc = opts.imgDirectory;

            if (currentId == opts.lastDocNum) {
                // If the last page, then do nothing
                return false;
            }

            nextImgSrc += getFile(nextImgId);
            $(this).attr('data-page', nextImgId);
            $(this).attr('src', nextImgSrc);
        })

        // Implements #forwardpage and #backpage control click function.
        $('#controls > #forwardpage, #controls > #backpage').on('click', function (e) {
            e.preventDefault();

            var currentId = $docImage.attr('data-page'),
                nextImgSrc = opts.imgDirectory;

            if ($(this).attr('id') == 'backpage') {
                var nextImgId = parseInt(currentId) - 1;
            } else if ($(this).attr('id') == 'forwardpage') {
                var nextImgId = parseInt(currentId) + 1;
            }

            if ((currentId == opts.lastDocNum && $(this).attr('id') == 'forwardpage') ||
                (currentId == 1 && $(this).attr('id') == 'backpage')) {
                // If the last page or the first page, then do nothing.
                return false;
            }

            // Loads corresponding image file.
            nextImgSrc += getFile(nextImgId);
            $docImage.attr('data-page', nextImgId);
            $docImage.attr('src', nextImgSrc);

        })

        // Constructs the image file name.
        function getFile(n) {
            return n + '.' + opts.fileType;
        }

    };

    $.fn.viewer.defaults = {
    	imgDirectory : "img/", // The image location.
    	fileType : "jpg",      // The image type.
    	lastDocNum : 13         // The last number of doc.
    };

})(jQuery);