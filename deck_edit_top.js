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

    // リーダーにする
    var set_leader_button = append_lift_button(idols_buttons, 'ﾘｰﾀﾞｰ', 0, true);
    create_set_leader_button(set_leader_button, instanceId);

    // 直接編成を変える
    front_idol.each(function(new_pos){
        var title = (new_pos+2) + '番手';

        // 同じ場所ならスキップ
        if (new_pos === pos) {
            append_lift_button(idols_buttons, title, (1+new_pos)%5, false);
            return true;
        }

        var set_position_button = append_lift_button(idols_buttons, title, (1+new_pos)%5, true);
        create_set_position_button(set_position_button, pos, new_pos);
    });
});

function append_lift_button(base, title, index, enabled)
{
    var width = 53;
    var margin = '0 0 0 6px';
    if (index == 0) {
        margin = '0';
    } else if (index == 2) {
        width -= 1;
    }

    var set_leader_button;
    if (enabled) {
        set_leader_button = $('<div class="grayButton80" style="width:' + width + 'px; margin:' + margin + ';"><a href="#" onclick="return false;">' + title + '</a></div>');
    } else {
        set_leader_button = $('<div class="dark_gray a_link" style="width:' + width + 'px; margin:' + margin + '; padding: 0;">' + title + '</div>');
    }
    base.append(set_leader_button);
    return set_leader_button;
}

function create_set_leader_button(button, instanceId)
{
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
    button.click(function(){
        if (is_disabled($(this))) return;
        var promise = disable_all_buttons();

        $.each(leader_remove_types, function(index, remove_type){
            promise = promise.then(remove_unit(instanceId, remove_type))
        })
        promise.then(set_leader(instanceId, leader_type, page_params['position']))
        .done(reload());
    });
}
function create_set_position_button(button, pos, new_pos)
{
    var count = Math.abs(pos - new_pos);
    var lift = new Array(count);
    if (new_pos < pos) {
        // 上げる
        for (var i = 0; i < count; i++) {
            lift[i] = instanceIds[pos];
        }
    }
     else {
        // 下げるために、一つ下のアイドルを上げることを繰り返す
        for (var i = 0; i < count; i++) {
            lift[i] = instanceIds[pos + 1 + i];
        }
    }

    button.click(function(){
        if (is_disabled($(this))) return;
        var promise = disable_all_buttons();

        $.each(lift, function(index, id){
            promise = promise.then(lift_position(id, page_params['type']));
        })
        promise.done(reload());
    });
}

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
