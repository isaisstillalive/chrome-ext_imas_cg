(function(){
    $(window).keydown(function(e){
        switch (e.keyCode) {
            // dキーでプロメンを呼ぶ
            case 68:
                $('#help_chk').trigger('click');
                return false;

            // 1,2,3キーでAP1,2,3消費アピール
            case 49:
            case 50:
            case 51:
                var index = e.keyCode-48;
                var battleButton = $('#dreamBattleButton > div > div:nth-child('+index+') form');
                battleButton.submit();
                return false;

        }
    });
})();
