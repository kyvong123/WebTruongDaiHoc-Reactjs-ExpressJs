module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7601: {
                title: 'Đợt tuyển sinh',
                link: '/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh', icon: 'fa-cube', parentKey: 7544, groupIndex: 0
            }
        }
    };
    app.permission.add(
        { name: 'sdhTsInfoTime:manage', menu },
        { name: 'sdhTsInfoTime:read', menu },
        { name: 'sdhTsInfoTime:write', menu },
        { name: 'sdhTsInfoTime:delete', menu },
    );




    app.get('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh', app.permission.check('sdhTsInfoTime:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh/setting/:maKyThi/:maDotTs', app.permission.orCheck('sdhTsInfoTime:manage', 'sdhTsInfoTime:write', 'sdhTsInfoTime:delete'), app.templates.admin);



    //------------------------API-------------------------//
    app.get('/api/sdh/dot-tuyen-sinh/page/:pageNumber/:pageSize', app.permission.orCheck('user:login', 'sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            let { sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            const page = await app.model.sdhTsInfoTime.searchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/dot-tuyen-sinh/processing', app.permission.orCheck('sdhEnrollment:manage', 'sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const item = await app.model.sdhTsInfoTime.get({ processing: 1 });
            if (item) {
                res.send({ item });
            } else {
                throw 'Lỗi lấy dữ liệu xử lý';
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/dot-tuyen-sinh/processing-thi-sinh', app.permission.orCheck('sdhEnrollment:manage', 'sdhTsInfoTime:manage', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            const item = await app.model.sdhTsInfoTime.get({ processingTs: 1 });
            if (item) {
                res.send({ item });
            } else {
                throw 'Lỗi lấy dữ liệu xử lý';
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


    app.get('/api/sdh/ts-info/time/current/:maKyThi', async (req, res) => {
        try {
            let items = await app.model.sdhTsInfoTime.getAll({ maInfoTs: req.params.maKyThi, kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts-info-time/:id', app.permission.check('user:login'), async (req, res) => {
        try {
            const { id } = req.params;
            let item = await app.model.sdhTsInfoTime.get({ id });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/ts-info/time', app.permission.orCheck('sdhTsInfo:write', 'sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            if (changes.processing) {
                let items = await app.model.sdhTsInfoTime.getAll();
                items = items.filter(item => item.id != id);
                await Promise.all([app.model.sdhTsInfoTime.update({ id }, changes)].concat(
                    items.map(item =>
                        app.model.sdhTsInfoTime.update({ id: item.id }, { processing: 0 })
                    )
                ));
            } else if (changes.processingTs) {
                let items = await app.model.sdhTsInfoTime.getAll();
                items = items.filter(item => item.id != id);
                await Promise.all([app.model.sdhTsInfoTime.update({ id }, changes)].concat(
                    items.map(item =>
                        app.model.sdhTsInfoTime.update({ id: item.id }, { processingTs: 0 })
                    )
                ));
            } else if (changes.kichHoat) {
                if (changes.kichHoat == 1) {
                    let [items, itemsKy] = await Promise.all([
                        app.model.sdhTsInfoTime.getAll(),
                        app.model.sdhTsInfo.getAll()
                    ]);

                    items = items.filter(item => item.id != id);
                    itemsKy = itemsKy?.filter(item => item.ma != changes.maInfoTs);

                    await Promise.all([
                        app.model.sdhTsInfoTime.update({ id }, changes),
                        app.model.sdhTsInfo.update({ ma: changes.maInfoTs }, changes)
                    ].concat(items.map(item => app.model.sdhTsInfoTime.update({ id: item.id }, { kichHoat: 0 }))
                    ).concat(itemsKy.map(item => app.model.sdhTsInfo.update({ ma: item.ma }, { kichHoat: 0 }))));

                } else {
                    await app.model.sdhTsInfoTime.update({ id }, changes);
                }
            }
            else {
                await app.model.sdhTsInfoTime.update({ id }, changes);
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/ts-info/time', app.permission.orCheck('sdhTsInfo:write', 'sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let { data } = req.body;
            let { maDot } = data || {};
            let namTuyenSinh = maDot?.slice(0, 4) || new Date().getFullYear();


            const [existKy, existDot] = await Promise.all([
                app.model.sdhTsInfo.get({ namTuyenSinh }),
                app.model.sdhTsInfoTime.get({ maDot })
            ]);

            if (!existDot) {
                if (existKy) {
                    data.maInfoTs = existKy.ma;
                    data.processing = 0;
                    data.kichHoat = 0;

                    let items = await app.model.sdhTsInfoTime.create(data);
                    res.send({ items });

                } else {
                    const newKy = {
                        ma: 'TS' + namTuyenSinh.slice(2, 4),
                        ten: `Tuyển sinh Sau đại học năm ${namTuyenSinh}`,
                        namTuyenSinh,
                        kichHoat: 0
                    };
                    app.model.sdhTsInfo.create(newKy);

                    data.maInfoTs = newKy.ma;
                    data.processing = 0;
                    data.kichHoat = 0;

                    let items = await app.model.sdhTsInfoTime.create(data);
                    res.send({ items });
                }
            } else {
                throw 'Đã tồn tại đợt tuyển sinh';
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts-info/time', app.permission.orCheck('sdhTsInfo:delete', 'sdhTsInfoTime:manage'), async (req, res) => {
        try {
            const id = req.body.id;
            let listPhanHe = await app.model.sdhTsInfoPhanHe.getAll({ idDot: id }),
                listPhanHeId = listPhanHe.map(item => item.id),
                listHinhThuc = listPhanHeId.length ? await app.model.sdhTsInfoHinhThuc.getAll({
                    statement: 'idPhanHe IN (:listPhanHe)',
                    parameter: { listPhanHe: listPhanHeId }
                }) : [],
                listHinhThucId = listHinhThuc.map(item => item.id),
                listNganh = listPhanHeId.length ? await app.model.sdhTsInfoNganh.getAll(
                    {
                        statement: 'idPhanHe IN (:listPhanHe)',
                        parameter: { listPhanHe: listPhanHeId }
                    }) : [],
                listNganhId = listNganh.map(item => item.id);
            await Promise.all([
                app.model.sdhTsInfoTime.delete({ id }),
                app.model.sdhTsInfoPhanHe.delete({ idDot: id }),
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
    });
    app.post('/api/sdh/ts-info/copy/time', app.permission.orCheck('sdhTsInfo:write', 'sdhTsInfoTime:manage'), async (req, res) => {
        try {
            //Tạo đợt tuyển sinh
            let { data, idDot } = req.body;
            let { maDot } = data || {};
            let namTuyenSinh = maDot?.slice(0, 4) || new Date().getFullYear();
            const [existKy, existDot] = await Promise.all([
                app.model.sdhTsInfo.get({ namTuyenSinh }),
                app.model.sdhTsInfoTime.get({ maDot })
            ]);
            let newDot = {};
            if (!existDot) {
                if (existKy) {
                    data.maInfoTs = existKy.ma;
                    data.processing = 0;
                    data.kichHoat = 0;
                    newDot = await app.model.sdhTsInfoTime.create(data);
                } else {
                    const newKy = {
                        ma: 'TS' + namTuyenSinh.slice(2, 4),
                        ten: `Tuyển sinh Sau đại học năm ${namTuyenSinh}`,
                        namTuyenSinh,
                        kichHoat: 0
                    };
                    app.model.sdhTsInfo.create(newKy);
                    data.maInfoTs = newKy.ma;
                    data.processing = 0;
                    data.processingTs = 0;
                    data.kichHoat = 0;
                    newDot = await app.model.sdhTsInfoTime.create(data);
                }
            } else {
                throw 'Đã tồn tại đợt tuyển sinh';
            }
            const maKy = 'TS' + namTuyenSinh.slice(2, 4);
            //Tạo phân hệ
            let listPhanHe = await app.model.sdhTsInfoPhanHe.getAll({ idDot });
            let listPhanHeId = listPhanHe.map(i => i.id);
            listPhanHe.forEach(i => delete i.id);
            let listPhanHeNew = await Promise.all(listPhanHe.map(phanHe =>
                app.model.sdhTsInfoPhanHe.create({ ...phanHe, idDot: newDot.id, maInfoTs: maKy })));
            for (let i = 0; i < listPhanHeId.length; i++) {
                listPhanHeNew[i]['oldPhanHe'] = listPhanHeId[i];
            }
            //Tạo ngành, hình thức
            let [listNganh, listHinhThuc] = listPhanHeId.length ? await Promise.all([
                app.model.sdhTsInfoNganh.getAll({
                    statement: 'idPhanHe IN (:listPhanHe)',
                    parameter: { listPhanHe: listPhanHeId }
                }),
                app.model.sdhTsInfoHinhThuc.getAll({
                    statement: 'idPhanHe IN (:listPhanHe)',
                    parameter: { listPhanHe: listPhanHeId }
                })]) : [[], []];
            let listNganhId = listNganh.map(item => item.id);
            let listHinhThucId = listHinhThuc.map(item => item.id);
            listNganh.forEach(i => delete i.id);
            listHinhThuc.forEach(i => delete i.id);
            let listHinhThucNew = await Promise.all(listHinhThuc.map(hinhThuc => {
                let idPhanHe = listPhanHeNew.find(i => i.oldPhanHe == hinhThuc.idPhanHe).id;
                return app.model.sdhTsInfoHinhThuc.create({ ...hinhThuc, idPhanHe });
            }));
            for (let i = 0; i < listHinhThucId.length; i++) {
                listHinhThucNew[i]['oldHinhThuc'] = listHinhThucId[i];
            }
            listNganh = listNganh.map(i => {
                let listIdHinhThuc = i.listIdHinhThuc?.split(',') || [];
                // TODO
                listIdHinhThuc = listIdHinhThuc.map(i => listHinhThucNew.find(j => j.oldHinhThuc == i).id);
                i.listIdHinhThuc = listIdHinhThuc.join(',');
                return i;
            });
            let listNganhNew = await Promise.all(listNganh.map(nganh => {
                let idPhanHe = listPhanHeNew.find(i => i.oldPhanHe == nganh.idPhanHe).id;
                return app.model.sdhTsInfoNganh.create({ ...nganh, idPhanHe });
            }));

            for (let i = 0; i < listNganhId.length; i++) {
                listNganhNew[i]['oldNganh'] = listNganhId[i];
            }
            // Tạo tổ hợp thi
            let listToHop = await app.model.sdhTsInfoToHopThi.getAll({
                statement: 'idHinhThuc IN (:listHinhThuc)',
                parameter: { listHinhThuc: listHinhThucId }
            });
            let listToHopId = listToHop.map(item => item.id);
            listToHop.forEach(i => delete i.id);
            let listToHopNew = await Promise.all(listToHop.map(toHop => {
                let hinhThuc = listHinhThucNew.find(i => i.oldHinhThuc == toHop.idHinhThuc);
                let { id, idPhanHe } = hinhThuc;
                return app.model.sdhTsInfoToHopThi.create({ ...toHop, idHinhThuc: id, idPhanHe });
            }));
            for (let i = 0; i < listToHopId.length; i++) {
                listToHopNew[i]['oldToHop'] = listToHopId[i];
            }
            //Tạo môn thi
            let listMonThi = await app.model.sdhTsInfoMonThi.getAll({
                statement: 'idNganh IN (:listNganh)',
                parameter: { listNganh: listNganhId }
            });
            listMonThi.forEach(i => delete i.id);
            await Promise.all(listMonThi.map(monThi => {
                let idNganh = listNganhNew.find(i => i.oldNganh == monThi.idNganh).id;
                let idToHop = listToHopNew.find(i => i.oldToHop == monThi.idToHop).id;
                return app.model.sdhTsInfoMonThi.create({ ...monThi, idNganh, idToHop });
            }));
            res.send(newDot);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts-info/time/update-status', app.permission.orCheck('sdhTsInfo:write', 'sdhTsInfoTime:manage'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            await app.model.sdhTsInfoTime.update({ id }, changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};
