(function(){
    var matches = location.href.match(/%3Ftype%3D(\d+)%26/);
    var type = matches[1];

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

        // 直接編成を変える
        $.each([0,1,2,3], function(index, new_pos){
            if (new_pos == pos) return true;
            var set_position = $('<div class="grayButton80" style="width:58px; margin:0 6px 0 0;">' + (new_pos+2) + '番手</div>');
            idols_buttons.append(set_position);

            var count = Math.abs(pos - new_pos);
            var lift = new Array(count);
            if (new_pos < pos) {
                // 上げる
                for (var i = 0; i < count; i++) {
                    lift[i] = instanceId;
                }
            }
             else {
                // 下げるために、一つ下のアイドルを上げることを繰り返す
                for (var i = 0; i < count; i++) {
                    lift[i] = instanceIds[pos + 1 + i];
                }
            }

            set_position.click(function(){
                if (is_disabled()) return;
                var promise = disable_all_buttons();

                $.each(lift, function(index, id){
                    promise = promise.then(lift_position(id, type));
                })

                promise.done(function(){
                    location.reload();
                });
            });
        });

        // リーダーにする
        var set_leader_button = $('<div class="grayButton80" style="width:98px; margin:0;">ﾘｰﾀﾞｰにする</div>');
        idols_buttons.append(set_leader_button);
        set_leader_button.click(function(){
            if (is_disabled()) return;

            disable_all_buttons()
            .then(remove_unit(instanceId, 0))
            .then(remove_unit(instanceId, 1))
            .then(set_leader(instanceId))
            .done(function(){
                location.reload();
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
        var d = $.Deferred();
        $('[class*=grayButton],submit').attr('disabled', 'disabled');
        $('[class*=grayButton],submit').text('送信中');
        d.resolve();
        return d.promise();
    }

    function lift_position(id, type)
    {
        return function(){
            return $.get(convertUri('deck/act_priority_up_dec?no=1&s=' + id + '&type=' + type + '&l_frm=Deck_1'));
        };
    }
    function remove_unit(id, type)
    {
        return function(){
            return $.get(convertUri('deck/deck_remove_card_check?no=1&rs=' + id + '&type=' + type + '&l_frm=Deck_1'));
        };
    }
    function set_leader(id)
    {
        return function(){
            return $.get(convertUri('card_list/set_leader/' + id + '?l_frm=Card_list_1'));
        };
    }
})();
