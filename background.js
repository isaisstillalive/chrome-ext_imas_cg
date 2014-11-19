(function(){
    var documentUrlPatterns = [
        '*://*.mbga.jp/12008305/*',
        '*://*.mbga.jp/12008305?*',
        '*://125.6.169.35/idolmaster/*',
    ];

    var idolHashes;
    loadIdolHash(false);

    function loadIdolHash(force){
        if (force || localStorage['idolHashes'] === undefined) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function(){
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    localStorage['idolHashes'] = xmlhttp.responseText;
                }
            };
            xmlhttp.open("GET", 'https://raw.githubusercontent.com/isaisstillalive/imas_cg_hash/master/hash2id.json', true);
            xmlhttp.send();
        }

        idolHashes = JSON.parse(localStorage['idolHashes']);
    }

    var parentMenuItem;
    var contexts;
    var targetUrlPattern;

    // アイドル系
    {
        contexts = ['image'];
        targetUrlPattern = [
            '*://sp.pf-img-a.mbga.jp/12008305?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fimage_sp%2Fcard%2F*',
            '*://sp.pf-img-a.mbga.jp/12008305/?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fimage_sp%2Fcard%2F*',
            '*://125.6.169.35/idolmaster/image_sp/card/*',
        ];
        parentMenuItem = createMenuItem({
            title: 'アイドル',
            parentId: null,
        });

        //// 画像
        var imageMenuItem = createMenuItem({
            title: '画像を開く',
        });
        createShowIdolImageSubMenus(imageMenuItem, 'hash');

        //// コピー
        ////// 名前
        var copyMenuItem = createMenuItem({
            title: 'コピー',
        });
        createCopyMenuItem('名前', 'name');
        createCopyMenuItem('id', 'id');
        createCopyMenuItem('ハッシュ', 'hash');

        function createCopyMenuItem(title, key)
        {
            createMenuItem({
                title: title,
                parentId: copyMenuItem,
                onclick: function(info, tab){
                    chipboard_copy(idolHashes[getHash(info.srcUrl)][key]);
                },
            });
        }

        //// トレード
        var tradeMenu = createMenuItem({
            title: 'トレード',
        });
        createOpenImagePageMenuItem({
            title: '出品状況',
            parentId: tradeMenu,
            url: 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fauction%2Fsearch_top%2F0%2F<id>',
        });
        createOpenImagePageMenuItem({
            title: '成立履歴',
            parentId: tradeMenu,
            url: 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fauction%2Fhistory%2F<id>',
        });

        //// ホシイモノに登録
        createOpenImagePageMenuItem({
            title: 'ホシイモノ登録',
            url: 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fwish%2Fregist%2F<hash>%2F0'
        });

        //// ギャラリー
        createOpenImagePageMenuItem({
            title: 'ギャラリー',
            url: 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Farchive%2Fview%2F<id>'
        });
        //

        //// 特訓前後
        createSeparatorMenuItem({});
        createMenuItem({
            title: '特訓前',
            onclick: function(info, tab){
                var hash_type = 'prev_hash';

                var hash = getHash(info.srcUrl);
                hash = idolHashes[hash][hash_type];
                if (hash == undefined) return;

                showImage(hash, 'xs', 'jpg');
            },
        });
        createMenuItem({
            title: '特訓後',
            onclick: function(info, tab){
                var hash_type = 'next_hash';

                var hash = getHash(info.srcUrl);
                hash = idolHashes[hash][hash_type];
                if (hash == undefined) return;

                showImage(hash, 'xs', 'jpg');
            },
        });

        function createOpenImagePageMenuItem(options)
        {
            var url = options.url;
            delete options.url;

            options.onclick = function(info, tab){
                var idol = idolHashes[getHash(info.srcUrl)];
                var tradeUrl = url;
                tradeUrl = tradeUrl.replace('<id>', idol['id']);
                tradeUrl = tradeUrl.replace('<hash>', idol['hash']);
                chrome.tabs.create({
                    url: tradeUrl,
                    active: false,
                });
            };

            return createMenuItem(options);
        }
    }

    // 全ての画像
    {
        parentMenuItem = null;
        contexts = ['image'];
        targetUrlPattern = [
            '*://sp.pf-img-a.mbga.jp/12008305?*',
            '*://sp.pf-img-a.mbga.jp/12008305/*',
        ];
        // 画像の元パスに飛ぶ
        createMenuItem({
            title: '元ファイルを開く',
            onclick: function(info, tab){
                uri = getOriginal(info.srcUrl);
                chrome.tabs.create({
                    url: uri,
                    active: false,
                });
            },
        });
        // createSeparatorMenuItem({});
    }

    {
        parentMenuItem = null;
        contexts = ['page'];
        createMenuItem({
            title: 'ハッシュリスト再読み込み',
            onclick: function(info, tab){
                loadIdolHash(true);
            },
        });
    }

    // クリップボードにコピーする
    function chipboard_copy(text){
        textArea = document.createElement("textarea");
        textArea.style.position = "absolute";
        textArea.style.left = "-100%";
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        document.body.removeChild(textArea);
    }

    function createMenuItem(options)
    {
        options.contexts = contexts;
        options.documentUrlPatterns = documentUrlPatterns;
        options.targetUrlPatterns = targetUrlPattern;
        if (options.parentId == undefined) {
            options.parentId = parentMenuItem;
        }
        return chrome.contextMenus.create(options);
    }

    function createSeparatorMenuItem(options)
    {
        options.type = 'separator';
        return createMenuItem(options);
    }

    function createShowIdolImageSubMenus(parentMenu, hash_type)
    {
        var imageTypes = {
            'l':    {'type': 'l',           'format': 'jpg'},
            'ls':   {'type': 'ls',          'format': 'jpg'},
            'xs':   {'type': 'xs',          'format': 'jpg'},
            'ln':   {'type': 'l_noframe',   'format': 'jpg'},
            'quest':{'type': 'quest',       'format': 'png'},
        };
        var imageMenuItems = [
            ['すべてのサイズ',          ['l', 'ls', 'xs', 'ln', 'quest']],
            'separator',
            ['大きいサイズ',            ['l']],
            ['大きいサイズ（枠なし）',  ['ln']],
            ['ユニットバナー',          ['ls']],
            ['アルバムアイコン',        ['xs']],
            ['お仕事用',                ['quest']],
        ];
        for (var i in imageMenuItems) {
            if (imageMenuItems[i] == 'separator') {
                createSeparatorMenuItem({
                    parentId: parentMenu,
                });
                continue;
            }
            (function (title, types) {
                createMenuItem({
                    parentId: parentMenu,
                    title: title,
                    onclick: function(info, tab){
                        var hash = getHash(info.srcUrl);
                        hash = idolHashes[hash][hash_type];
                        if (hash == undefined) return;

                        for (var type in types) {
                            var typeInfo = imageTypes[types[type]];
                            showImage(hash, typeInfo.type, typeInfo.format);
                        }
                    },
                });
            })(imageMenuItems[i][0], imageMenuItems[i][1]);
        }
        return parentMenu;
    }


    function getHash(uri){
        uri = getOriginal(uri);
        var matches = uri.match(/\/card\/[^\/]+\/([0-9a-f]{32})/);
        return matches[1];
    }
    function getOriginal(uri){
        if (uri.match(/sp\.pf-img-a\.mbga\.jp/)) {
            uri = uri.replace(/http:\/\/sp\.pf-img-a\.mbga\.jp\/12008305\/?\?(guid=ON&)?url=/, '');
            uri = decodeURIComponent(uri);
        }
        return uri;
    }

    function showImage(hash, type, format){
        var imageUri = 'http://125.6.169.35/idolmaster/image_sp/card/'+type+'/'+hash+'.'+format;
        chrome.tabs.create({
            url: imageUri,
            active: false,
        });
    }
})();
