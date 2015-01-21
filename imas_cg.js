// 現在の画面のパラメータを取得
var matches = location.href.match(/url=.*%2F(\w+)%2F(\w+)%3F(.*)/);
var page_base = matches[1];
var page_path = matches[2];

var page_params = {};
$.each(decodeURIComponent(matches[3]).split('&'), function(index, pair_string){
    var pair = pair_string.split('=');
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    page_params[key] = value;
});

function convertUri(uri, params)
{
    params['l_frm'] = page_params['l_frm'];
    params['rnd'] = Math.floor(Math.random()*1000000000);

    var params_string = $.param(params);
    return 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2F' + encodeURIComponent(page_base + '/' + uri + '?' + params_string);
}

function is_disabled()
{
    return ($(this).attr('disabled') === 'disabled');
}
function disable_all_buttons()
{
    var d = $.Deferred();
    $('[class*=grayButton],submit').attr('disabled', 'disabled');
    $('[class*=grayButton]>a,submit').text('送信中');
    d.resolve();
    return d.promise();
}
