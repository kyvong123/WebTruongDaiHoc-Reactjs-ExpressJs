module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.lienHe,
        menus: {
            4022: { title: 'Chủ đề Q&A', link: '/user/category/chu-de-chat/qa', icon: 'fa fa-envelope-o', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'dmChuDe:manage', menu },
        { name: 'dmChuDe:read' },
        { name: 'dmChuDe:write' },
        { name: 'dmChuDe:delete' },
    );

    app.get('/user/category/chu-de-chat/qa', app.permission.check('dmChuDe:manage'), app.templates.admin);

    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/qa/page/:pageNumber/:pageSize', app.permission.check('dmChuDe:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dmChuDe.searchChuDeQAPage(_pageNumber, _pageSize, null, searchTerm, 'Q&A');
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/qa/all', app.permission.check('user:login'), async (req, res) => {
        try {
            let doiTuong = (req.session.user.isStaff) ? 1 : 2;
            const searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
            let page = await app.model.dmChuDe.getAll({
                statement: 'TYPE=\'Q&A\' AND KICH_HOAT = 1 AND TRIM(LOWER(TEN)) LIKE LOWER(\'%\' || :searchTerm || \'%\') AND (:doiTuong IS NULL OR :doiTuong IN (SELECT regexp_substr(DOI_TUONG, \'[^,]+\', 1, level) from DUAL connect by regexp_substr(DOI_TUONG, \'[^,]+\', 1, level) is not null))',
                parameter: { searchTerm: searchTerm.trim(), doiTuong }
            });
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/qa/item/:ma', app.permission.check('dmChuDe:read'), async (req, res) => {
        try {
            let item = await app.model.dmChuDe.get({ id: req.params.id, type: 'Q&A' });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tt/lien-he/danh-muc/chu-de-chat/qa', app.permission.check('dmChuDe:write'), async (req, res) => {
        try {
            const newItem = req.body.data;
            newItem.thoiGianXuLy = newItem.thoiGianXuLy * 3600000;
            let item = await app.model.dmChuDe.create({ ...newItem, type: 'Q&A' });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/lien-he/danh-muc/chu-de-chat/qa', app.permission.check('dmChuDe:write'), async (req, res) => {
        try {
            const changes = req.body.changes;
            if (changes.thoiGianXuLy) {
                changes.thoiGianXuLy = changes.thoiGianXuLy * 3600000;
            }
            const user = req.session.user;
            let item = await app.model.dmChuDe.update({ id: req.body.id }, changes);
            if (changes.canBoPhuTrach || typeof changes.canBoPhuTrach == 'string') {
                const newCanBoPhuTrachEmailList = changes.canBoPhuTrach ? changes.canBoPhuTrach.split(',') : [];
                const currentCanBoPhuTrachEmailList = (await app.model.fwQuestionAnswerAssignChuDe.getAll({ maChuDe: req.body.id, type: 'Q&A' }, 'emailCanBo')).map(object => object.emailCanBo);
                const deleteList = currentCanBoPhuTrachEmailList.difference(newCanBoPhuTrachEmailList);
                const createList = newCanBoPhuTrachEmailList.difference(currentCanBoPhuTrachEmailList);
                for (const email of deleteList) {
                    await app.model.fwQuestionAnswerAssignChuDe.delete({ emailCanBo: email, maChuDe: req.body.id });
                }
                for (const email of createList) {
                    const assignedCanBo = await app.model.tchcCanBo.get({ email });
                    await app.model.fwQuestionAnswerAssignChuDe.create({
                        emailCanBo: email,
                        emailAssigner: user.email,
                        maChuDe: req.body.id,
                        maDonVi: user.maDonVi,
                        tenDonVi: user.tenDonVi,
                        shcc: assignedCanBo.shcc,
                        tenChuDe: item.ten
                    });
                }
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tt/lien-he/danh-muc/chu-de-chat/qa', app.permission.check('dmChuDe:delete'), async (req, res) => {
        try {
            let item = await app.model.dmChuDe.delete({ id: req.body.id, type: 'Q&A' });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};
