module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5008: { title: 'Định mức học phí', link: '/user/finance/dinh-muc', icon: 'fa fa-calculator', backgroundColor: '#FFE4C4', color: '#000' } },
    };

    app.permission.add(
        { name: 'tcDinhMuc:manage', menu },
        { name: 'tcDinhMuc:write' },
        { name: 'tcDinhMuc:delete' },
        { name: 'tcDinhMuc:read' },
    );

    app.permissionHooks.add('staff', 'addRolesTcDinhMuc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcDinhMuc:manage', 'tcDinhMuc:write', 'tcDinhMuc:delete', 'tcDinhMuc:read');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/dinh-muc', app.permission.check('tcDinhMuc:manage'), app.templates.admin);
    app.get('/user/finance/dinh-muc/:namHoc/:hocKy/:namTuyenSinh', app.permission.check('tcDinhMuc:manage'), app.templates.admin);
    // api

    const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');

    app.post('/api/khtc/dinh-muc', app.permission.check('tcDinhMuc:write'), async (req, res) => {
        try {
            let { namHoc, hocKy, namTuyenSinh } = req.body;
            namHoc = parseInt(namHoc);
            hocKy = parseInt(hocKy);
            namTuyenSinh = parseInt(namTuyenSinh);
            if (!namHoc || ![1, 2, 3].includes(hocKy)) {
                throw 'Dữ liệu không hợp lệ';
            }
            if (await app.model.tcDinhMuc.get({ namHoc, hocKy, namTuyenSinh }))
                throw `Định mức cho năm học ${namHoc} học kỳ ${hocKy} đã tồn tại!`;
            const item = await app.model.tcDinhMuc.create({ namHoc, hocKy, namTuyenSinh });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/khtc/dinh-muc/page/:pageNumber/:pageSize', app.permission.check('tcDinhMuc:manage'), async (req, res) => {
        try {
            const { filter } = req.query;
            const settings = await getSettings();
            let namHoc, hocKy;
            if (!filter) {
                namHoc = settings.hocPhiNamHoc;
                hocKy = settings.hocPhiHocKy;
            } else {
                namHoc = filter.namHoc;
                hocKy = filter.hocKy;
            }
            const { pageNumber, pageSize } = req.params;
            const condition = {
                statement: 'namHoc = :namHoc AND hocKy = :hocKy',
                parameter: {
                    namHoc,
                    hocKy
                }
            };
            const page = await app.model.tcDinhMuc.getPage(pageNumber, pageSize, condition);
            res.send({ page, settings: { namHoc, hocKy } });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/khtc/dinh-muc/item/:namHoc/:hocKy/:namTuyenSinh', app.permission.check('tcDinhMuc:write'), async (req, res) => {
        try {
            const { namHoc, hocKy, namTuyenSinh } = req.params;
            const item = await app.model.tcDinhMuc.get({ namHoc, hocKy, namTuyenSinh });
            if (!item) throw 'Định phí không tồn tại';
            const details = await app.model.tcDinhMucDetail.getList(item.id);
            const listBac = await app.model.dmSvBacDaoTao.getAll({ kichHoat: 1 });
            const list = await Promise.all(listBac.map(async bac => {
                return {
                    ...bac,
                    details: details.rows.filter(item => item.maBac == bac.maBac)
                };
            }));
            res.send({ item: { ...item, bac: list } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/dinh-muc/detail', app.permission.check('tcDinhMuc:write'), async (req, res) => {
        try {
            const { nhom = [], nganh = [], namHoc, hocKy, namTuyenSinh, ...data } = req.body;
            const dinhMuc = await app.model.tcDinhMuc.get({ namHoc, hocKy, namTuyenSinh });
            const detail = await app.model.tcDinhMucDetail.create({ ...data, dinhMuc: dinhMuc.id });
            detail.nhom = await app.model.tcDinhMucNhom.bulkCreate(nhom.map(item => ({ nhom: item, dinhMucDetail: detail.id })));
            detail.nganh = await app.model.tcDinhMucNganh.bulkCreate(nganh.map(item => ({ nganh: item, dinhMucDetail: detail.id })));
            res.send({ item: nganh });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/khtc/dinh-muc/detail/:id', app.permission.check('tcDinhMuc:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const { nhom = [], nganh = [], ...data } = req.body;
            const detail = await app.model.tcDinhMucDetail.get({ id });
            if (!detail) throw 'Định mức không tồn tại';
            await app.model.tcDinhMucDetail.update({ id }, data);
            await app.model.tcDinhMucNhom.delete({ dinhMucDetail: id });
            await app.model.tcDinhMucNganh.delete({ dinhMucDetail: id });
            await app.model.tcDinhMucNganh.bulkCreate(nganh.map(item => ({ nganh: item, dinhMucDetail: id })));
            await app.model.tcDinhMucNhom.bulkCreate(nhom.map(item => ({ nhom: item, dinhMucDetail: id })));
            res.send();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/khtc/dinh-muc/detail/:id', app.permission.check('tcDinhMuc:delete'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (!id || !await app.model.tcDinhMucDetail.get({ id })) {
                throw 'Không tìm thấy đinh mức';
            }
            await app.model.tcDinhMucDetail.delete({ id });
            await app.model.tcDinhMucNganh.delete({ dinhMucDetail: id });
            await app.model.tcDinhMucNhom.delete({ dinhMucDetail: id });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });


    app.post('/api/khtc/dinh-muc/lookup', app.permission.check('tcDinhMuc:write'), async (req, res) => {
        try {
            let { namHoc, hocKy, mssv, namTuyenSinh, bac, loaiHinhDaoTao, loaiSinhVien, nganh } = req.body;
            namHoc = parseInt(namHoc);
            hocKy = parseInt(hocKy);
            if (!namHoc || !hocKy) throw 'Dữ liệu không hợp lệ';
            if (mssv) {
                const student = await app.model.fwStudent.get({ mssv });
                if (!student) throw 'Không tìm được dữ liệu sinh viên';
                namTuyenSinh = student.namTuyenSinh;
                bac = student.bacDaoTao;
                loaiHinhDaoTao = student.loaiHinhDaoTao;
                loaiSinhVien = student.loaiSinhVien;
                nganh = student.maNganh;
            } else {
                namTuyenSinh = parseInt(namTuyenSinh);
                if (!(namTuyenSinh && bac && loaiHinhDaoTao && loaiSinhVien && nganh))
                    throw 'Dữ liệu không hợp lệ';
            }
            const dinhMuc = await app.model.tcDinhMuc.get({ namHoc, hocKy, namTuyenSinh });
            if (!dinhMuc) {
                throw `Dữ liệu định mức năm ${namHoc}-HK${hocKy} không tồn tại`;
            }
            let detailList = await app.model.tcDinhMucDetail.getAll({ dinhMuc: dinhMuc.id, bac });
            if (!detailList.length)
                throw 'Định mức chưa được cấu hình';

            // lookup via detail with direct nganh
            let dinhMucNganh = await app.model.tcDinhMucNganh.get({
                statement: 'nganh = :nganh and dinhMucDetail in (:dinhMucDetail)',
                parameter: { nganh, dinhMucDetail: detailList.map(item => item.id) }
            }, '*', 'dinhMucDetail DESC');
            if (dinhMucNganh)
                return res.send({ item: detailList.find(item => item.id == dinhMucNganh.dinhMucDetail) });

            //lookup via nhom
            let nhom = await app.model.tcNhomNganh.getNhom(namHoc, hocKy, nganh);
            let nhomIDs = nhom.rows.map(item => item.id);
            if (nhomIDs.length) {
                let dinhMucNhom = await app.model.tcDinhMucNhom.get({
                    statement: 'nhom in (:nhom) and dinhMucDetail in (:dinhMucDetail)',
                    parameter: { nhom: nhomIDs, dinhMucDetail: detailList.map(item => item.id) }
                }, '*', 'dinhMucDetail DESC');
                if (dinhMucNhom) {
                    return res.send({ item: detailList.find(item => item.id == dinhMucNhom.dinhMucDetail) });
                }
            }

            // lookup via default -> 0 nhom, 0 nganh
            const defaultDetail = await app.model.tcDinhMucDetail.get({
                statement: 'dinhMuc = :dinhMuc and not EXISTS(select TC_DINH_MUC_NGANH.NGANH from TC_DINH_MUC_NGANH where TC_DINH_MUC_NGANH.DINH_MUC_DETAIL =ID) and not EXISTS(select TC_DINH_MUC_NHOM.NHOM from TC_DINH_MUC_NHOM  where TC_DINH_MUC_NHOM.DINH_MUC_DETAIL=ID)',
                parameter: { dinhMuc: dinhMuc.id }
            });
            if (defaultDetail) {
                return res.send({ item: defaultDetail });
            }
            throw 'Ngành chưa được cấu hình định mức';
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.post('/api/khtc/dinh-muc/clone', app.permission.check('tcDinhMuc:write'), async (req, res) => {
        try {
            const { item, namTuyenSinh } = req.body;
            const checkTrung = await app.model.tcDinhMuc.get({ namHoc: item.namHoc, hocKy: item.hocKy, namTuyenSinh });
            if (!checkTrung) {

                const [newDinhMuc, dinhMucDetailCu, listDinhMucNhom, listDinhMucNganh] = await Promise.all([
                    app.model.tcDinhMuc.create({ namHoc: item.namHoc, hocKy: item.hocKy, namTuyenSinh }),
                    app.model.tcDinhMucDetail.getAll({ dinhMuc: item.id }),
                    app.model.tcDinhMucNhom.getAll({}),
                    app.model.tcDinhMucNganh.getAll({})
                ]);

                await Promise.all(dinhMucDetailCu.map(async detail => {
                    const { bac, loaiHinhDaoTao, soTien, loaiSinhVien, loaiHocPhan, hocPhiHocKy } = detail;
                    const newDetail = await app.model.tcDinhMucDetail.create({ dinhMuc: newDinhMuc.id, bac, loaiHinhDaoTao, soTien, loaiSinhVien, loaiHocPhan, hocPhiHocKy });
                    const dinhMucNhom = listDinhMucNhom.find(cur => cur.dinhMucDetail == detail.id);
                    if (dinhMucNhom) {
                        await app.model.tcDinhMucNhom.create({ nhom: dinhMucNhom.nhom, dinhMucDetail: newDetail.id });
                    } else {
                        const dinhMucNganh = listDinhMucNganh.find(cur => cur.dinhMucDetail == detail.id);
                        if (dinhMucNganh) {
                            await app.model.tcDinhMucNganh.create({ nganh: dinhMucNganh.nganh, dinhMucDetail: newDetail.id });
                        }
                    }
                }));
                res.send({});
            } else {
                throw 'Đã tồn tại định mức';
            }

            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/dinh-muc/hoc-phi-khac', app.permission.check('tcDinhMuc:manage'), async (req, res) => {
        try {
            const { namHoc, hocKy } = req.query;
            let listDinhPhi = await app.model.tcDinhMucMonHoc.getAll({ namHoc, hocKy });
            listDinhPhi = listDinhPhi.groupBy('loaiHocPhi');
            let listLoaiPhi = await app.model.tcLoaiHocPhi.getAll({ active: 1, main: 0 });

            res.send({ listDinhPhi, listLoaiPhi });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};