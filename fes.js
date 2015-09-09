(function(){
    $(window).keydown(function(e){
        switch (e.keyCode) {
            // 1,2,3,4,5,6キーで20%,40%,50%,60%,80%,100%アタック
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
                var index = e.keyCode-48;
                var battleButton = $('div.fes_attackCell:nth-child('+index+') form');
                battleButton.submit();
                return false;

            // rキーでリロード
            case 82:
                location.reload();
                return false;

        }
    });
})();
