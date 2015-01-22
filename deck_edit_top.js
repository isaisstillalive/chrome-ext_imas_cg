var front_idol = $('section:has(h3:contains(ﾌﾛﾝﾄﾒﾝﾊﾞｰ))').find('div.idolStatus');

// ユニットメンバーのインスタンスIDを求める
var instanceIds = [];
front_idol.each(function(pos)
{
    var href = $(this).find('.nameArea a').attr('href');
    var matches = href.match(/card_list%2Fdesc%2F(\d+)%3F/);
    instanceIds[pos] = matches[1];
});

// ユニットメンバーごとに機能を追加する
front_idol.each(function(pos)
{
    var instanceId = instanceIds[pos];

    var idols_buttons = $('<div style="max-width:298px; margin:2px 0 6px;" class="displayBox right_float" />');
    $(this).append(idols_buttons);

    // 直接編成を変える
    front_idol.each(function(new_pos){
        // 同じ場所ならスキップ
        if (new_pos === pos) return true;

        var set_position = $('<div class="grayButton80" style="width:58px; margin:0 6px 0 0;"><a href="#" onclick="return false;">' + (new_pos+2) + '番手</a></div>');
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
            if (is_disabled($(this))) return;
            var promise = disable_all_buttons();

            $.each(lift, function(index, id){
                promise = promise.then(lift_position(id, page_params['type']));
            })
            promise.done(reload());
        });
    });

    // リーダーにする
    var set_leader_button = $('<div class="grayButton80" style="width:98px; margin:0;"><a href="#" onclick="return false;">ﾘｰﾀﾞｰにする</a></div>');
    idols_buttons.append(set_leader_button);

    var leader_type;
    var leader_remove_types;
    // 通常の編成画面の場合、リーダーに設定するには0,1（攻守フロント）両方から外す必要がある
    if (page_base === 'deck') {
        leader_type = null;
        leader_remove_types = [0,1]
    } else {
        leader_type = page_params['type'];
        leader_remove_types = [page_params['type']];
    }
    set_leader_button.click(function(){
        if (is_disabled($(this))) return;
        var promise = disable_all_buttons();

        $.each(leader_remove_types, function(index, remove_type){
            promise = promise.then(remove_unit(instanceId, remove_type))
        })
        promise.then(set_leader(instanceId, leader_type, page_params['position']))
        .done(reload());
    });
});

function lift_position(id, type, position)
{
    if (position === undefined) position = 1;

    return imas_cg_get('act_priority_up_dec', {
        no: 1,
        s: id,
        position: position,
        type: type,
    });
}
function remove_unit(id, type, position)
{
    if (position === undefined) position = 1;

    return imas_cg_get('deck_remove_card_check', {
        no: 1,
        rs: id,
        position: position,
        type: type,
    });
}
function set_leader(id, type, position)
{
    if (position === undefined) position = 1;

    return imas_cg_post('deck_set_leader_card', {
        no: 1,
    }, {
        sleeve: id,
        position: position,
        type: type,
    });
}
