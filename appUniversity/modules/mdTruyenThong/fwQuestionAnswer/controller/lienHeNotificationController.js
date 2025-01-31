module.exports = app => {
    // Constant
    // const { MdTruyenThong } = require('../constant');

    // Config
    const { userPermission } = require('./config')(app);

    // Socket emit

    // Util method
    // const { getUserTtLienUploadFolder, getFwQaMessageUploadFolder } = require('./util')(app);


    app.get('/api/tt/lien-he/notification/page/:pageNumber/:pageSize', app.permission.check(userPermission), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            const user = req.session.user;
            let email = user.email;
            let page = await app.model.fwQuestionAnswerNotification.searchPage(pageNumber, pageSize, email);
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // Phải dùng cứng user:login vì còn lấy cả thông báo thông thường nữa
    app.get('/api/tt/lien-he/notification/mobile/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            const user = req.session.user;
            let email = user.email;
            let page = await app.model.fwQuestionAnswerNotification.mobileSearchPage(_pageNumber, _pageSize, email);
            let { pagenumber: pageNumber, pagesize: pageSize, pagetotal: pageTotal, totalitem: totalItem, rows: list } = page;
            list.forEach(dbItem => {
                dbItem.mobileArguments = app.utils.parse(dbItem.mobileArguments);
            });
            res.send({ page: { pageNumber, pageSize, pageTotal, totalItem, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/lien-he/notification/read', app.permission.check(userPermission), async (req, res) => {
        try {
            const { read } = req.body.changes;
            const id = req.body.id;
            const item = await app.model.fwQuestionAnswerNotification.update({ id }, { read });
            if (item.mobileArguments) {
                item.mobileArguments = app.utils.parse(item.mobileArguments);
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/lien-he/notification/read-all', app.permission.check(userPermission), async (req, res) => {
        try {
            const idList = req.body.idList.substring(1, req.body.idList.length - 1) ?? '';
            const item = await app.model.fwQuestionAnswerNotification.update({
                statement: 'ID IN (SELECT regexp_substr(:idList, \'[^,]+\', 1, level) from dual connect by regexp_substr(:idList, \'[^,]+\', 1, level) is not null)',
                parameter: { idList },
            }, { read: 1 });
            if (item.mobileArguments) {
                item.mobileArguments = app.utils.parse(item.mobileArguments);
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    // API Mobile -----------------------------------------------------------------------------------------------------------------------------------------
};