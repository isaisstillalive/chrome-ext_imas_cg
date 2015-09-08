(function(){
    $(window).keydown(function(e){
        switch (e.keyCode) {
            // rキーでリロード
            case 82:
                location.reload();
                return false;

        }
    });
})();
