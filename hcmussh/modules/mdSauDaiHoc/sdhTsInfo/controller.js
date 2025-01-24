module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7615: {
                title: 'Kỳ tuyển sinh',
                link: '/user/sau-dai-hoc/tuyen-sinh/ky-tuyen-sinh',
                parentKey: 7544, groupIndex: 2
            }
        }
    };
    app.permission.add(
        { name: 'sdhTsInfo:manage', menu },
        { name: 'sdhTsInfo:write', menu },

    );
    app.permissionHooks.add('staff', 'addRoleSdhTsInfo', (user, staff) =>
        new Promise((resolve) => {
            if (staff.maDonVi && staff.maDonVi == '37') {
                app.permissionHooks.pushUserPermission(user, 'sdhTsInfo:manage', 'sdhTsInfo:write');
                resolve();
            } else resolve();
        })
    );
    app.get('/user/sau-dai-hoc/tuyen-sinh/ky-tuyen-sinh', app.permission.check('sdhTsInfo:manage'), app.templates.admin);

    //------API--------------s

    app.get('/api/sdh/ky-thi-ts', app.permission.orCheck('sdhTsInfo:manage', 'sdhInfoTime:manage'), async (req, res) => {
        try {
            let items = await app.model.sdhTsInfo.getAll({}, '*', 'namTuyenSinh DESC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ky-thi/current', async (req, res) => {
        try {
            let item = await app.model.sdhTsInfo.get({ kichHoat: 1 });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ky-thi-ts/:ma', app.permission.orCheck('sdhTsInfo:manage', 'sdhInfoTime:manage', 'sdhTsDashboard:manage'), async (req, res) => {
        try {
            const { ma } = req.params;
            let item = await app.model.sdhTsInfo.get({ ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ky-thi-ts', app.permission.check('sdhTsInfo:write'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            await app.model.sdhTsInfo.update({ ma }, changes);
            app.model.sdhTsInfoTime.update({ maInfoTs: ma }, { maInfoTs: changes.ma });
            app.model.sdhTsInfoPhanHe.update({ maInfoTs: ma }, { maInfoTs: changes.ma });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/ky-thi-ts', app.permission.check('sdhTsInfo:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const checkMa = await app.model.sdhTsInfo.get({ ma: data.ma });
            const checkYear = await app.model.sdhTsInfo.get({ namTuyenSinh: data.namTuyenSinh });
            if (checkMa || checkYear) throw 'Kỳ thi đã tồn tại';
            await app.model.sdhTsInfo.create({ ...data, kichHoat: 0 });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/sdh/ky-thi-ts', app.permission.check('sdhTsInfo:manage'), async (req, res) => {
        try {
            const ma = req.body.ma;
            let listPhanHe = await app.model.sdhTsInfoPhanHe.getAll({ maInfoTs: ma }), listPhanHeId = listPhanHe?.map(item => item.id),
                listHinhThuc = listPhanHeId.length ? await app.model.sdhTsInfoHinhThuc.getAll({
                    statement: 'idPhanHe IN (:listPhanHe)',
                    parameter: { listPhanHe: listPhanHeId }
                }) : [], listHinhThucId = listHinhThuc?.map(item => item.id),
                listNganh = listPhanHeId.length ? await app.model.sdhTsInfoNganh.getAll({
                    statement: 'idPhanHe IN (:listPhanHe)',
                    parameter: { listPhanHe: listPhanHeId }
                }) : [], listNganhId = listNganh?.map(item => item.id);
            await Promise.all([
                app.model.sdhTsInfo.delete({ ma: ma }),
                app.model.sdhTsInfoTime.delete({ maInfoTs: ma }),
                app.model.sdhTsInfoPhanHe.delete({ maInfoTs: ma }),
                listPhanHeId.length ? app.model.sdhTsInfoHinhThuc.delete({
                    statement: 'idPhanHe IN (:listPhanHe)',
                    parameter: { listPhanHe: listPhanHeId }
                }) : null,
                listHinhThucId.length ? app.model.sdhTsInfoToHopThi.delete({
                    statement: 'idHinhThuc IN (:listHinhThuc)',
                    parameter: { listHinhThuc: listHinhThucId }
                }) : null,
                listPhanHeId.length ? app.model.sdhTsInfoNganh.delete({
                    statement: 'idPhanHe IN (:listPhanHe)',
                    parameter: { listPhanHe: listPhanHeId }
                }) : null,
                listNganhId.length ? app.model.sdhTsInfoMonThi.delete({
                    statement: 'idNganh IN (:listNganh)',
                    parameter: { listNganh: listNganhId }
                }) : null
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    }
    );
    app.get('/api/sdh/tuyen-sinh/chktts', app.permission.check('sdhTsInfo:manage'), async (req, res) => {
        try {
            let { maDotTs, maInfoTs } = req.query.filter ? req.query.filter : { maDotTs: '', maInfoTs: '' };
            let [ky, dot] = await Promise.all([
                app.model.sdhTsInfo.get({ ma: maInfoTs }),
                app.model.sdhTsInfoTime.get({ id: maDotTs, maInfoTs }),
            ]);
            if (ky && dot) {
                app.model.sdhTsInfo.getDataChktts((error, item) => {
                    if (error) {
                        console.error(req.method, req.url, { error });
                        res.send({ error });
                    } else {
                        let tsPhanHe = item.rows,
                            { dmPhanHe = [], dmHinhThuc = [], dmNganh = [], dmToHopThi = [], tsHinhThuc = [], tsNganh = [], tsToHopThi = [], tsMonThi = [] } = item;
                        res.send({ data: { tsPhanHe, dmPhanHe, dmHinhThuc, dmNganh, dmToHopThi, tsHinhThuc, tsNganh, tsToHopThi, tsMonThi } });
                    }
                });
            }
            else if (!ky) throw 'Dữ liệu kỳ không tồn tại';
            else throw 'Dữ liệu đợt không tồn tại';
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};
