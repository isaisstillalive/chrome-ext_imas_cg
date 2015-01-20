(function(){
    var instanceIds = [];
    $('div#headerAcdPanel > section:nth-child(4) > div.idolStatus').each(function(pos)
    {
        var href = $(this).find('.nameArea a').attr('href');
        var matches = href.match(/card_list%2Fdesc%2F(\d+)%3F/);
        instanceIds[pos] = matches[1];
    });

    $('div#headerAcdPanel > section:nth-child(4) > div.idolStatus').each(function(pos)
    {
        var instanceId = instanceIds[pos];

        var idols_buttons = $('<div style="max-width:298px; margin:2px 0 6px;" class="displayBox right_float" />');
        $(this).append(idols_buttons);

        // リーダーにする
        var set_leader = $('<div class="grayButton80" style="width:98px; margin:0;">ﾘｰﾀﾞｰにする</div>');
        idols_buttons.append(set_leader);
        set_leader.click(function(){
            if (is_disabled()) return;
            disable_all_buttons();

            $.get(convertUri('deck/deck_remove_card_check?no=1&rs=' + instanceId + '&type=0&l_frm=Deck_1'), function(){
                $.get(convertUri('deck/deck_remove_card_check?no=1&rs=' + instanceId + '&type=1&l_frm=Deck_1'), function (){
                    $.get(convertUri('card_list/set_leader/' + instanceId + '?l_frm=Card_list_1'), function (){
                        location.reload();
                    });
                });
            });
        });
    });

    function convertUri(uri)
    {
        return 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2F' + encodeURIComponent(uri) + '%26rnd%3D' + Math.floor(Math.random()*1000000000);
    }

    function is_disabled()
    {
        return ($(this).attr('disabled') == 'disabled');
    }
    function disable_all_buttons()
    {
        $('[class*=grayButton],submit').attr('disabled', 'disabled');
        $('[class*=grayButton],submit').text('送信中');
    }
})();
