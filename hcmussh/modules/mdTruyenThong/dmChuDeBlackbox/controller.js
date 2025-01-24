module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.lienHe,
        menus: {
            4121: { title: 'Chủ đề Blackbox', link: '/user/category/chu-de-chat/blackbox', icon: 'fa fa-envelope-o', backgroundColor: '#5a5a5a', groupIndex: 1 },
        },
    };

    const donViMenu = {
        parentMenu: app.parentMenu.lienHe,
        menus: {
            4122: { title: 'Chủ đề Blackbox đơn vị', link: '/user/category/chu-de-chat/blackbox/don-vi', icon: 'fa fa-envelope-o', backgroundColor: '#5a5a5a', groupIndex: 1 },
        },
    };

    const { blackBoxManagePermission } = require('../fwQuestionAnswer/controller/config')(app);

    app.permission.add(
        { name: 'dmChuDeBlackbox:manage', menu },
        { name: 'dmChuDeBlackbox:read' },
        { name: 'dmChuDeBlackbox:write' },
        { name: 'dmChuDeBlackbox:delete' },
        { name: blackBoxManagePermission, menu: donViMenu }
    );

    app.get('/user/category/chu-de-chat/blackbox', app.permission.check('dmChuDeBlackbox:manage'), app.templates.admin);
    app.get('/user/category/chu-de-chat/blackbox/don-vi', app.permission.check(blackBoxManagePermission), app.templates.admin);

    // User APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/doi-tuong/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const user = req.session.user;
            let filter = { kichHoat: 1, doiTuong: (user.isStaff) ? 1 : 2 };
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dmChuDe.searchChuDeQAPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, 'BLACKBOX');
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // API cho cán bộ đơn vị 70, 71 -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/don-vi/page/:pageNumber/:pageSize', app.permission.check(blackBoxManagePermission), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const user = req.session.user;
            let filter = { maDonVi: user.maDonVi };
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dmChuDe.searchChuDeQAPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, 'BLACKBOX');
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/don-vi', app.permission.check(blackBoxManagePermission), async (req, res) => {
        try {
            const newItem = req.body.data;
            newItem.thoiGianXuLy = newItem.thoiGianXuLy * 3600000;
            let item = await app.model.dmChuDe.create({ ...newItem, type: 'BLACKBOX' });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/don-vi', app.permission.check(blackBoxManagePermission), async (req, res) => {
        try {
            const changes = req.body.changes;
            if (changes.thoiGianXuLy) {
                changes.thoiGianXuLy = changes.thoiGianXuLy * 3600000;
            }
            const user = req.session.user;
            let item = await app.model.dmChuDe.update({ id: req.body.id }, changes);
            if (changes.canBoPhuTrach || typeof changes.canBoPhuTrach == 'string') {
                const newCanBoPhuTrachEmailList = changes.canBoPhuTrach ? changes.canBoPhuTrach.split(',') : [];
                const currentCanBoPhuTrachEmailList = (await app.model.fwQuestionAnswerAssignChuDe.getAll({ maChuDe: req.body.id }, 'emailCanBo')).map(object => object.emailCanBo);
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

    app.delete('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/don-vi', app.permission.check(blackBoxManagePermission), async (req, res) => {
        try {
            let item = await app.model.dmChuDe.delete({ id: req.body.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // Admin APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/page/:pageNumber/:pageSize', app.permission.check('dmChuDeBlackbox:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dmChuDe.searchChuDeQAPage(_pageNumber, _pageSize, null, searchTerm, 'BLACKBOX');
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/all', app.permission.check('dmChuDeBlackbox:read'), async (req, res) => {
        try {
            const searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
            let page = await app.model.dmChuDe.getAll({
                statement: 'TYPE = \'BLACKBOX\' AND KICH_HOAT = 1 AND TRIM(LOWER(TEN)) LIKE LOWER(\'%\' || :searchTerm || \'%\')',
                parameter: { searchTerm: searchTerm.trim() }
            });
            res.send({ page });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox/item/:ma', app.permission.check('user:login'), async (req, res) => {
        try {
            let item = await app.model.dmChuDe.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox', app.permission.check('dmChuDeBlackbox:write'), async (req, res) => {
        try {
            const newItem = req.body.data;
            newItem.thoiGianXuLy = newItem.thoiGianXuLy * 3600000;
            let item = await app.model.dmChuDe.create({ ...newItem, type: 'BLACKBOX' });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox', app.permission.check('dmChuDeBlackbox:write'), async (req, res) => {
        try {
            const changes = req.body.changes;
            if (changes.thoiGianXuLy) {
                changes.thoiGianXuLy = changes.thoiGianXuLy * 3600000;
            }
            const user = req.session.user;
            let item = await app.model.dmChuDe.update({ id: req.body.id }, changes);
            if (changes.canBoPhuTrach || typeof changes.canBoPhuTrach == 'string') {
                const newCanBoPhuTrachEmailList = changes.canBoPhuTrach ? changes.canBoPhuTrach.split(',') : [];
                const currentCanBoPhuTrachEmailList = (await app.model.fwQuestionAnswerAssignChuDe.getAll({ maChuDe: req.body.id }, 'emailCanBo')).map(object => object.emailCanBo);
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

    app.delete('/api/tt/lien-he/danh-muc/chu-de-chat/blackbox', app.permission.check('dmChuDeBlackbox:delete'), async (req, res) => {
        try {
            let item = await app.model.dmChuDe.delete({ id: req.body.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};
