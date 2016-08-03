$(function () {
    var idolList = $('div.idolList div.idol > div');
    var idolDesc = $('div.idolDesc li');

    var replaceImage = function (element) {
        var src = element.css('background-image').replace('url("', '').replace('")', '');

        var img = $('<img />');
        img.attr('src', src);
        img.css({
            'width': '100%',
            'height': '100%',
        });
        element.append(img);

        return src;
    };

    idolList.each(function () {
        var src = replaceImage($(this));
        $(this).data('src', src);
    });

    idolDesc.each(function (i) {
        // Not found
        if ($(this).children('img').length == 1) {
            $(this).children('img').attr('src', $(idolList[i]).data('src').replace('xs', 'l'));
        } else {
            $(this).find('div.card_img > div.rotate_img').each(function () {
                replaceImage($(this));
            });
        }
    });
});
