module.exports = app => {
    const assignChuDeMenu = {
        parentMenu: app.parentMenu.lienHe,
        menus: {
            4504: { title: 'Phân quyền phụ trách chủ đề', link: '/user/tt/lien-he/assign-chu-de', icon: 'fa fa-envelope-o', groupIndex: 0 },
        },
    };

    const { managerPermission } = require('./config')(app);

    app.permission.add(
        { name: managerPermission, menu: assignChuDeMenu },
    );

    app.get('/user/tt/lien-he/assign-chu-de', app.permission.check(managerPermission), app.templates.admin);

    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/qa/doi-tuong/page/:pageNumber/:pageSize', app.permission.check('user:login'), async (req, res) => {
        try {
            const user = req.session.user;
            let filter = { kichHoat: 1, doiTuong: (user.isStaff) ? 1 : 2 };
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dmChuDe.searchChuDeQAPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, 'Q&A');
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/tt/lien-he/danh-muc/chu-de-chat/qa/by-don-vi/phan-quyen/:pageNumber/:pageSize', app.permission.check(managerPermission), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const user = req.session.user;
            const { rows: list } = await app.model.dmChuDe.searchCanBoPhuTrachChuDeQAPage(_pageNumber, _pageSize, searchTerm, user.maDonVi, 'Q&A');
            res.send({ page: { list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });


    app.post('/api/tt/lien-he/assign-chu-de', app.permission.check(managerPermission), async (req, res) => {
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

    app.put('/api/tt/lien-he/assign-chu-de', app.permission.check(managerPermission), async (req, res) => {
        try {
            const changes = req.body.changes;
            if (changes.thoiGianXuLy) changes.thoiGianXuLy = changes.thoiGianXuLy * 3600000;
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
                    await app.model.fwQuestionAnswerAssignChuDe.create({ emailCanBo: email, emailAssigner: user.email, maChuDe: req.body.id, maDonVi: user.maDonVi, tenDonVi: user.tenDonVi, shcc: assignedCanBo.shcc, tenChuDe: item.ten });
                }
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tt/lien-he/assign-chu-de', app.permission.check(managerPermission), async (req, res) => {
        try {
            let item = await app.model.fwQuestionAnswerAssignChuDe.delete({ id: req.body.id });
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};