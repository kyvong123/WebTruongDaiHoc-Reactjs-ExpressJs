module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5010: { title: 'Nhóm', link: '/user/finance/nhom', icon: 'fa fa-object-group', groupIndex: 0, color: '#000', backgroundColor: '#DE602F' } },
    };
    app.permission.add(
        { name: 'tcNhom:read', menu: menu },
        { name: 'tcNhom:write' },
        { name: 'tcNhom:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesNhomNganh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcNhom:read', 'tcNhom:write', 'tcNhom:delete');
            resolve();
        } else resolve();
    }));



    app.get('/user/finance/nhom', app.permission.check('tcNhom:read'), app.templates.admin);
    app.get('/user/finance/nhom/:namHoc/:hocKy', app.permission.check('tcNhom:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/khtc/nhom/page/:pageNumber/:pageSize', app.permission.orCheck('tcNhom:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            const condition = {
                statement: 'ten like :ten',
                parameter: { ten: `%${req.query.condition || ''}%` }
            };
            if (req.query.namHoc) {
                condition.statement += ' and namHoc=:namHoc';
                condition.parameter.namHoc = parseInt(req.query.namHoc);
            }
            if (req.query.hocKy) {
                condition.statement += ' and hocKy=:hocKy';
                condition.parameter.hocKy = parseInt(req.query.hocKy);
            }
            const page = await app.model.tcNhom.getPage(pageNumber, pageSize, condition);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/nhom', app.permission.check('tcNhom:write'), async (req, res) => {
        try {
            const { nganh, ...data } = req.body;
            data.heSo = 0;
            const latest = await app.model.tcNhom.get({ nhomCha: data.nhomCha || null }, 'id,heSo', 'id DESC');
            if (latest) data.heSo = latest.heSo + 1;
            const nhom = await app.model.tcNhom.create(data);
            nhom.nganh = nganh?.length ? await app.model.tcNhomNganh.bulkCreate(nganh.map(nganh => ({ nhom: nhom.id, nganh }))) : [];
            return res.send({ nhom });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/khtc/nhom', app.permission.check('tcNhom:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.tcNhom.update({ ma: req.body._id }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/khtc/nhom', app.permission.check('tcNhom:delete'), (req, res) => {
        app.model.tcNhom.delete({ ma: req.body._id }, error => res.send({ error }));
    });

    app.get('/api/khtc/nhom/item/:id', app.permission.check('tcNhom:read'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (!id) throw 'Dữ liệu không hợp lệ';
            const item = await app.model.tcNhom.get({ id });
            if (!item) throw 'Nhóm không tồn tại';
            item.nganh = await app.model.tcNhomNganh.getAll({ nhom: item.id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/khtc/nhom/item/:id', app.permission.check('tcNhom:write'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { nganh: dataNganh, ...changes } = req.body;
            if (!id) throw 'Dữ liệu không hợp lệ';
            let item = await app.model.tcNhom.get({ id });
            if (!item) throw 'Nhóm không tồn tại';
            const nganh = await app.model.tcNhomNganh.getAll({ nhom: item.id });
            const newNganh = dataNganh.difference(nganh, (a, b) => a == b.nganh);
            const deleteNganh = nganh.difference(dataNganh, (a, b) => a.nganh == b);
            if (deleteNganh.length)
                await app.model.tcNhomNganh.delete({
                    statement: 'id in (:id)',
                    parameter: { id: deleteNganh.map(item => item.id) }
                });
            if (newNganh.length) {
                await app.model.tcNhomNganh.bulkCreate(newNganh.map(item => ({ nhom: id, nganh: item })));
            }
            await app.model.tcNhom.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    const deleteNhom = async (nhom) => {
        await app.model.tcNhom.delete({ id: nhom.id });
        const children = await app.model.tcNhom.getAll({ nhomCha: nhom.id });
        await app.model.tcNhomNganh.delete({ nhom: nhom.id });
        await Promise.all(children.map(item => deleteNhom(item)));
    };

    app.delete('/api/khtc/nhom/item/:id', app.permission.check('tcNhom:delete'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (!id) throw 'Dữ liệu không hợp lệ';
            const item = await app.model.tcNhom.get({ id });
            if (!item) throw 'Nhóm không tồn tại';
            await deleteNhom(item);
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/nhom/:namHoc/:hocKy', app.permission.check('tcNhom:read'), async (req, res) => {
        try {
            const list = await app.model.tcNhom.getAll({ hocKy: req.params.hocKy, namHoc: req.params.namHoc, nhomCha: null }, '*', 'heSo');
            const initNhomNganh = async (list) => {
                await Promise.all(list.map(async item => {
                    const nganh = (await app.model.tcNhom.getNhomNganh(item.id)).rows;
                    if (!nganh.length) {
                        item.subItem = await app.model.tcNhom.getAll({ nhomCha: item.id }, '*', 'heSo');
                        await initNhomNganh(item.subItem);
                    } else {
                        item.subItem = nganh;
                    }
                }));
            };
            await initNhomNganh(list);
            res.send({ items: list });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/nhom', app.permission.orCheck('tcNhom:read'), async (req, res) => {
        try {
            const item = await app.model.tcNhom.getNamHocHocKy();
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/nhom/clone', app.permission.check('tcNhom:write'), async (req, res) => {
        try {
            const { namHoc, hocKy, item } = req.body;
            const checkTrung = await app.model.tcNhom.getAll({ namHoc, hocKy });
            if (!checkTrung.length) {
                const listNhomCu = await app.model.tcNhom.getAll({ namHoc: item.namHoc, hocKy: item.hocKy });
                const nhomNganh = await app.model.tcNhomNganh.getAll({});
                let mapper = {};
                await Promise.all(listNhomCu.map(async nhom => {
                    const nhomMoi = await app.model.tcNhom.create({ namHoc, hocKy, nhomCha: null, ten: nhom.ten, heSo: nhom.heSo });
                    mapper[nhom.id] = nhomMoi.id;
                    if (nhomNganh.find(cur => cur.nhom == nhom.id)) {
                        const nhomNganhCu = nhomNganh.filter(cur => cur.nhom == nhom.id);
                        await Promise.all(nhomNganhCu.map(async cur => {
                            await app.model.tcNhomNganh.create({ nganh: cur.nganh, nhom: mapper[nhom.id] });
                        }));
                    }
                }));

                await Promise.all(listNhomCu.map(async cur => {
                    if (cur.nhomCha) {
                        await app.model.tcNhom.update({ id: mapper[cur.id] }, { nhomCha: mapper[cur.nhomCha] });
                    }
                }));

                const dinhMucCu = await app.model.tcDinhMuc.get({ namHoc: item.namHoc, hocKy: item.hocKy, namTuyenSinh: 2022 });
                const [dinhMucMoi, dinhMucDetailCu, listDinhMucNhomCu, listDinhMucNganhCu] = await Promise.all([
                    app.model.tcDinhMuc.create({ namHoc, hocKy, namTuyenSinh: 2022 }),
                    app.model.tcDinhMucDetail.getAll({ dinhMuc: dinhMucCu.id }),
                    app.model.tcDinhMucNhom.getAll({}),
                    app.model.tcDinhMucNganh.getAll({})
                ]);

                await Promise.all(dinhMucDetailCu.map(async detail => {

                    const { bac, loaiHinhDaoTao, soTien, loaiSinhVien, loaiHocPhan, hocPhiHocKy } = detail;
                    const newDetail = await app.model.tcDinhMucDetail.create({ dinhMuc: dinhMucMoi.id, bac, loaiHinhDaoTao, soTien, loaiSinhVien, loaiHocPhan, hocPhiHocKy });
                    const dinhMucNhom = listDinhMucNhomCu.find(cur => cur.dinhMucDetail == detail.id);
                    if (dinhMucNhom) {
                        await app.model.tcDinhMucNhom.create({ nhom: mapper[dinhMucNhom.nhom], dinhMucDetail: newDetail.id });
                    } else {
                        const dinhMucNganh = listDinhMucNganhCu.find(cur => cur.dinhMucDetail == detail.id);
                        if (dinhMucNganh) {
                            await app.model.tcDinhMucNganh.create({ nganh: dinhMucNganh.nganh, dinhMucDetail: newDetail.id });
                        }
                    }
                }));
            } else {
                throw 'Trùng lặp năm học, học kỳ';
            }
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};