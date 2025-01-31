module.exports = app => {
    app.get('/api/tt/e-news/item-news', app.permission.check('fwENews:read'), async (req, res) => {
        try {
            const item = await app.model.fwNews.get({ id: req.query.ma }, 'id, title');
            res.send({ item });
        } catch (error) {
            console.error('GET /api/tt/e-news/item-news', error);
            res.send({ error });
        }
    });

    app.get('/api/tt/e-news/search-news', app.permission.check('fwENews:read'), async (req, res) => {
        try {
            const searchTerm = req.query.searchTerm ? req.query.searchTerm : '';
            const condition = {};

            if (searchTerm) {
                condition.statement = 'lower(TITLE) like :searchTerm';
                condition.parameter = { searchTerm: `%${searchTerm.toLowerCase()}%` };
            }

            const page = await app.model.fwNews.getPage(1, 30, condition, 'id, title', 'priority DESC');

            res.send({ items: page ? page.list : [] });
        } catch (error) {
            console.error('GET /api/tt/e-news/search-news', error);
            res.send({ error });
        }
    });

    app.put('/api/tt/e-news/item', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const { condition, changes } = req.body;

            if (condition.eNewsId && condition.structureId && condition.indexNumber) {
                let item = await app.model.fwENewsItem.createOrUpdate(condition, changes);

                if (item.type != 'image' && item.image) {
                    app.fs.deleteImage(item.image);
                    item = await app.model.fwENewsItem.update(condition, { image: '', imageLink: '', imageCaption: '' });
                }

                if (item.type == 'newsItem' && item.newsId) {
                    const news = await app.model.fwNews.get({ id: item.newsId }, 'title, abstract, image');
                    
                    item.tieuDe = news ? news.title : '';
                    item.tomTat = news ? news.abstract : '';
                    item.imageTinTuc = news ? news.image : '';
                }
                
                res.send({ item });
            } else {
                throw 'Tạo nội dung bị lỗi!';
            }
        } catch (error) {
            console.error('PUT /api/tt/e-news/item', error);
            res.send({ error });
        }
    });

    // Upload hook
    app.fs.createFolder(app.path.join(app.publicPath, '/img/fwENews'));

    const uploadENewsImage = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('fwENews:') && files.ENewsImage && files.ENewsImage.length > 0) {
            console.log('Hook: uploadENewsImage => fwENews image upload');
            const srcPath =  files.ENewsImage[0].path;
            const condition = fields.userData[0].substring(8);
            const [eNewsId, structureId, indexNumber ] = condition.split('_');

            try {
                const condition = { eNewsId, structureId, indexNumber };
                let item = await app.model.fwENewsItem.get(condition);
                let image = '/img/fwENews/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);

                if (item) app.fs.deleteImage(item.image);
                app.fs.renameSync(srcPath, app.path.join(app.publicPath, image));
                image += '?t=' + (new Date().getTime()).toString().slice(-8);
                item = await app.model.fwENewsItem.createOrUpdate(condition, { type: 'image', image });

                done({ item, image });
            } catch (error) {
                done({ error: 'Tải hình bị lỗi' });
            }
        }
    };

    app.uploadHooks.add('uploadENewsImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadENewsImage(req, fields, files, params, done), done, 'fwENews:write'));

    app.uploadHooks.add('uploadENewsItemCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('fwENews', fields, files, params, done), done, 'fwENews:write'));
};