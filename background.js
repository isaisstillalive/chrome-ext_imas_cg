function IdolHashList()
{
    this.load();
}
IdolHashList.key = 'idolHashList';
IdolHashList.prototype = {
    load: function (force)
    {
        var idolHashList = this;
        idolHashList.loaded = false;

        chrome.storage.local.get(IdolHashList.key, function(data) {
            idolHashList.list = data[IdolHashList.key];
            if (idolHashList.list == undefined) {
                idolHashList.reload();
            } else {
                idolHashList.loaded = true;
            }
        });
    },

    save: function(data)
    {
        var storageData = {};
        this.list = data;
        storageData[IdolHashList.key] = this.list;
        chrome.storage.local.set(storageData, function(data) {});
    },

    reload: function()
    {
        var idolHashList = this;
        idolHashList.loaded = false;

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                idolHashList.save(JSON.parse(xmlhttp.responseText));
                idolHashList.loaded = true;
            }
        };
        xmlhttp.open("GET", 'https://raw.githubusercontent.com/isaisstillalive/imas_cg_hash/master/hash2id.json', true);
        xmlhttp.send();
    },

    get: function(hash)
    {
        return this.list[hash];
    }
}

var idolHashList = new IdolHashList();

(function(){
    var documentUrlPatterns = [
        '*://*.mbga.jp/12008305/*',
        '*://*.mbga.jp/12008305?*',
        '*://125.6.169.35/idolmaster/*',
    ];

    var parentMenuItem;
    var contexts;
    var targetUrlPattern;

    // アイドル系
    {
        contexts = ['image'];
        targetUrlPattern = [
            '*://sp.pf-img-a.mbga.jp/12008305?*url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fimage_sp%2Fcard%2F*',
            '*://sp.pf-img-a.mbga.jp/12008305/?*url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fimage_sp%2Fcard%2F*',
            '*://125.6.169.35/idolmaster/image_sp/card/*',
        ];
        parentMenuItem = createMenuItem({
            title: 'アイドル(&I)',
            parentId: null,
        });

        //// 画像
        var imageMenuItem = createMenuItem({
            title: '画像を開く(&I)',
        });
        createShowIdolImageSubMenus(imageMenuItem, 'hash');

        //// コピー
        ////// 名前
        var copyMenuItem = createMenuItem({
            title: 'コピー(&C)',
        });
        createCopyMenuItem('名前(&N)', 'name');
        createCopyMenuItem('&ID', 'id');
        createCopyMenuItem('ハッシュ(&H)', 'hash');

        function createCopyMenuItem(title, key)
        {
            createMenuItem({
                title: title,
                parentId: copyMenuItem,
                onclick: function(info, tab){
                    chipboard_copy(idolHashList.get(getHash(info.srcUrl))[key]);
                },
            });
        }

        //// トレード
        var tradeMenu = createMenuItem({
            title: 'トレード(&T)',
        });
        createOpenImagePageMenuItem({
            title: '出品状況(&E)',
            parentId: tradeMenu,
            url: 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fauction%2Fsearch_top%2F0%2F<id>',
        });
        createOpenImagePageMenuItem({
            title: '成立履歴(&H)',
            parentId: tradeMenu,
            url: 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fauction%2Fhistory%2F<id>',
        });

        //// ホシイモノに登録
        createOpenImagePageMenuItem({
            title: 'ホシイモノ登録(&W)',
            url: 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fwish%2Fregist%2F<hash>%2F0',
        });

        //// ギャラリー
        createOpenImagePageMenuItem({
            title: 'ギャラリー(&G)',
            url: 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Farchive%2Fview%2F<id>',
        });

        //// 外部サービス
        var otherMenu = createMenuItem({
            title: '外部サービス(&E)',
        });

        //// あおしらぼ アイドルマスターシンデレラガールズデータベース
        createOpenImagePageMenuItem({
            title: 'あおしらぼ',
            url: 'http://aoshirobo.net/imas_cg/detail.php?id=<id>',
            parentId: otherMenu,
        });

        //// アイドルマスターシンデレラガールズDB
        createOpenImagePageMenuItem({
            title: 'imas.cg.db',
            url: 'http://imas.cg.db.n-hokke.com/idols?utf8=%E2%9C%93&q=id%3A<id>',
            parentId: otherMenu,
        });

        //// 相場
        createOpenImagePageMenuItem({
            title: '相場データ情報',
            url: 'http://imascg.info/idol/detail/<id>',
            parentId: otherMenu,
        });


        //// 特訓前後
        createSeparatorMenuItem({});
        createMenuItem({
            title: '特訓前(&P)',
            onclick: function(info, tab){
                showFamilyImage(info.srcUrl, 'prev_hash');
            },
        });
        createMenuItem({
            title: '特訓後(&N)',
            onclick: function(info, tab){
                showFamilyImage(info.srcUrl, 'next_hash');
            },
        });

        function showFamilyImage(url, hash_type)
        {
            var hashAndType = getHashAndType(url);
            var hash = hashAndType.hash;

            hash = idolHashList.get(hash)[hash_type];
            if (hash == undefined) return;

            showImage(hash, hashAndType.type);
        }

        function createOpenImagePageMenuItem(options)
        {
            var url = options.url;
            delete options.url;

            options.onclick = function(info, tab){
                var idol = idolHashList.get(getHash(info.srcUrl));
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
                idolHashList.reload(true);
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
        var imageMenuItems = [
            ['すべてのサイズ',          ['l', 'ls', 'xs', 'l_noframe', 'quest']],
            'separator',
            ['大きいサイズ',            ['l']],
            ['大きいサイズ（枠なし）',  ['l_noframe']],
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
                        hash = idolHashList.get(hash)[hash_type];
                        if (hash == undefined) return;

                        for (var type in types) {
                            showImage(hash, types[type]);
                        }
                    },
                });
            })(imageMenuItems[i][0], imageMenuItems[i][1]);
        }
        return parentMenu;
    }


    function getHash(uri){
        var hashAndType = getHashAndType(uri)
        return hashAndType.hash;
    }
    function getHashAndType(uri){
        uri = getOriginal(uri);
        var matches = uri.match(/\/card\/([^\/]+)\/([0-9a-f]{32})/);
        return {type: matches[1], hash: matches[2]};
    }
    function getOriginal(uri){
        if (uri.match(/sp\.pf-img-a\.mbga\.jp/)) {
            uri = uri.replace(/http:\/\/sp\.pf-img-a\.mbga\.jp\/12008305\/?\?(guid=ON&)?url=/, '');
            uri = decodeURIComponent(uri);
        }
        return uri;
    }

    function showImage(hash, type){
        if (type == 'quest') {
            format = 'png';
        } else {
            format = 'jpg';
        }

        var imageUri = 'http://125.6.169.35/idolmaster/image_sp/card/'+type+'/'+hash+'.'+format;
        chrome.tabs.create({
            url: imageUri,
            active: false,
        });
    }
})();
