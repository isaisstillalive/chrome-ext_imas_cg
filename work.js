(function(){
    $(window).keydown(function(e){
        switch (e.keyCode) {
            // wキーでお仕事を続ける
            case 87:
                $('#play_button').trigger('mouseup');
                return false;

        }
    });
})();
