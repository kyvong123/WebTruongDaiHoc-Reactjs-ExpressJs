module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7006: {
                title: 'Danh sách Chương trình đào tạo', parentKey: 7028,
                link: '/user/dao-tao/chuong-trinh-dao-tao', icon: 'fa-university', backgroundColor: '#384C46'
            },
        },
    };
    app.permission.add(
        { name: 'dtChuongTrinhDaoTao:read', menu },
        { name: 'dtChuongTrinhDaoTao:manage', menu },
        { name: 'dtChuongTrinhDaoTao:write' },
        { name: 'dtChuongTrinhDaoTao:delete' },
        { name: 'dtChuongTrinhDaoTao:import' },
        { name: 'dtChuongTrinhDaoTao:export' },
    );

    app.permissionHooks.add('staff', 'addRolesDtChuongTrinhDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:write', 'dtChuongTrinhDaoTao:delete', 'dtChuongTrinhDaoTao:manage', 'dtChuongTrinhDaoTao:import', 'dtChuongTrinhDaoTao:export');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), app.templates.admin);
    app.get('/user/dao-tao/chuong-trinh-dao-tao/:ma', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:write', 'dtChuongTrinhDaoTao:manage'), app.templates.admin);
    app.get('/user/dao-tao/chuong-trinh-dao-tao/import', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'dtChuongTrinhDaoTao:manage'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/chuong-trinh-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.searchTerm == 'string' ? req.query.searchTerm : '',
            filter = req.query.filter || {},
            { donViFilter } = filter;
        const user = req.session.user;

        const roles = await app.model.dtAssignRole.getAll({
            statement: 'shcc = :shcc AND role LIKE :role',
            parameter: { shcc: user.shcc, role: '%dtEduProgram%' }
        });
        if (roles.length && !user.permissions.includes('quanLyDaoTao:DaiHoc')) {
            filter.listKhoaSinhVienFilter = [...new Set(roles.flatMap(i => i.khoaSinhVien.split(',')))].toString();
            filter.listHeFilter = [...new Set(roles.flatMap(i => i.loaiHinhDaoTao.split(',')))].toString();
        }

        if (!Number(user.isPhongDaoTao) && !user.permissions.includes('dtChuongTrinhDaoTao:manage')) {
            donViFilter = user.maDonVi;
        }

        filter = { ...filter, donViFilter };
        filter = JSON.stringify(filter);
        app.model.dtKhungDaoTao.searchPage(pageNumber, pageSize, searchTerm, filter, (error, result) => {
            if (error) res.send({ error });
            else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
                let pageCondition = {
                    searchTerm,
                };
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list, filter: req.query.filter, pageCondition } });
            }
        });
    });

    app.get('/api/dt/chuong-trinh-dao-tao/all', app.permission.check('user:login'), async (req, res) => {
        try {
            let data = await app.model.dtChuongTrinhDaoTao.getAll(req.query.condition, '*', 'id ASC');
            let items = [...new Set(data.map(item => item.maKhungDaoTao))];
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/chuong-trinh-dao-tao/filter', app.permission.check('user:login'), async (req, res) => {
        try {
            let { filter, searchTerm } = req.query;
            let items = await app.model.dtKhungDaoTao.khungDtGetAll(app.utils.stringify({ ...filter, searchTerm }));
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/chuong-trinh-dao-tao/role', app.permission.check('user:login'), async (req, res) => {
        try {
            const { shcc, permissions, maDonVi } = req.session.user;
            let items = [], list,
                { filter, searchTerm } = req.query,
                { role } = filter;

            const roles = await app.model.dtAssignRole.getAll({
                statement: 'shcc = :shcc AND role LIKE :role',
                parameter: { shcc, role: `%${role}%` }
            });

            list = await app.model.dtKhungDaoTao.khungDtGetAll(app.utils.stringify({ ...filter, searchTerm }));

            if (roles.length && !permissions.includes('quanLyDaoTao:DaiHoc')) {
                let lhdt = roles.flatMap(i => i.loaiHinhDaoTao.split(',')),
                    khoaSv = roles.flatMap(i => i.khoaSinhVien.split(','));

                list.rows.forEach(item => {
                    if (maDonVi == item.khoa
                        && lhdt.includes(item.loaiHinhDaoTao)
                        && khoaSv.includes(item.khoaSinhVien?.toString())) items.push(item);
                });
            } else items = list.rows;

            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtChuongTrinhDaoTao.getAll(req.query.condition, '*', 'namHocDuKien DESC,hocKyDuKien DESC,maMonHoc', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dt/chuong-trinh-dao-tao/all-nam-dao-tao/', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        const { maKhoa } = req.query;
        const condition = maKhoa ? { maKhoa } : {};
        app.model.dtCauTrucKhungDaoTao.getAllNamDaoTao(condition, 'id, namDaoTao', 'namDaoTao DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dt/chuong-trinh-dao-tao/all-mon-hoc', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let { khoaSv, maNganh, loaiHinhDaoTao, bacDaoTao } = req.query.condition;
            let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
            //Lấy tất cả CTDT của ngành đó trong năm (e.g, Ngành Báo chí có 2 chuyên ngành vào năm 2022: Báo điện tử, Báo chính thống --> Lấy hết)
            thoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == loaiHinhDaoTao && item.bacDaoTao == bacDaoTao);
            let item = await app.model.dtCauTrucKhungDaoTao.get({ khoa: khoaSv });
            const items = await app.model.dtKhungDaoTao.getAll({ namDaoTao: item.id, maNganh, loaiHinhDaoTao, bacDaoTao });
            if (!items.length) throw 'Không có chương trình đào tạo nào của hệ này';
            let listPromise = items.map(item => {
                return new Promise(resolve =>
                    app.model.dtChuongTrinhDaoTao.getAll({
                        statement: 'maKhungDaoTao = :maKhungDaoTao AND khoa != 33 AND khoa != 32',
                        parameter: { maKhungDaoTao: item.id }
                    }, (error, listMonHocCtdt) => {
                        listMonHocCtdt.forEach(monHocCTDT => monHocCTDT.chuyenNganh = item.chuyenNganh);
                        resolve(listMonHocCtdt || []);
                    }));
            });
            const danhSachMonMo = await app.model.dtDanhSachMonMo.getAll({ nam: item.id, maNganh, hocKy: thoiGianMoMon.hocKy });
            let danhSachMonMoChung = danhSachMonMo.filter(item => !item.chuyenNganh || item.chuyenNganh == ''),
                danhSachMonMoChuyenNganh = danhSachMonMo.filter(item => item.chuyenNganh && item.chuyenNganh != ''),
                danhSachMonMoNgoaiCtdt = danhSachMonMo;
            const danhSachChuyenNganh = await app.model.dtDanhSachChuyenNganh.getAll({ namHoc: item.namDaoTao });
            let chuyenNganhMapper = {};
            danhSachChuyenNganh.forEach(item => chuyenNganhMapper[item.id] = item.ten);

            Promise.all(listPromise).then(listMonHocCtdt => {
                let listMonHoc = listMonHocCtdt.flat().map(item => {
                    item.maNganh = maNganh;
                    return item;
                });
                let listMonHocChung = listMonHoc.filter((value, index, self) =>
                    index === self.findIndex((t) => (
                        t.maMonHoc === value.maMonHoc && t.tinhChatMon === 0
                    ))
                ).map(item => {
                    item.isMo = danhSachMonMoChung.map(item => item.maMonHoc).includes(item.maMonHoc);
                    if (item.isMo) {
                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => item[textBox] = danhSachMonMoChung.find(monChung => monChung.maMonHoc == item.maMonHoc)[textBox]);
                    }
                    item.chuyenNganh = '';
                    return item;
                });
                let monTheoChuyenNganh = listMonHoc
                    .filter(item => item.tinhChatMon == 1)
                    .map(item => {
                        item.isMo = danhSachMonMoChuyenNganh.map(item => item.maMonHoc).includes(item.maMonHoc);
                        item.tenChuyenNganh = chuyenNganhMapper[item.chuyenNganh];
                        if (item.isMo) {
                            ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => item[textBox] = JSON.parse(danhSachMonMoChuyenNganh.find(monChuyenNganh => monChuyenNganh.maMonHoc == item.maMonHoc)[textBox]));
                            item.currentCn = JSON.parse(danhSachMonMoChuyenNganh.find(monChuyenNganh => monChuyenNganh.maMonHoc == item.maMonHoc)['chuyenNganh']);
                        }
                        return item;
                    });
                let tmp = monTheoChuyenNganh.reduce((prev, curr) => {
                    delete curr.id;
                    if (prev.some(item => item.maMonHoc == curr.maMonHoc)) {
                        let element = prev.find(item => item.maMonHoc == curr.maMonHoc);
                        element.chuyenNganh = [...element.chuyenNganh, curr.chuyenNganh];
                        element.tenChuyenNganh = [...element.tenChuyenNganh, curr.tenChuyenNganh];
                    } else {
                        curr.chuyenNganh = [curr.chuyenNganh];
                        curr.tenChuyenNganh = [curr.tenChuyenNganh];
                        prev.push(curr);
                    }
                    return prev;
                }, []);
                let listMonHocNgoaiCtdt = listMonHoc
                    .filter(item => item.tinhChatMon == 0)
                    .map(item => {
                        item.isMo = danhSachMonMoNgoaiCtdt.map(item => item.maMonHoc).includes(item.maMonHoc);
                        if (item.isMo) {
                            ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => item[textBox] = danhSachMonMoNgoaiCtdt.find(monAll => monAll.maMonHoc == item.maMonHoc)[textBox]);
                        }
                        item.chuyenNganh = '';
                        return item;
                    });
                res.send({ listMonHocChung, listMonHocChuyenNganh: tmp, listMonHocNgoaiCtdt });
            });
        } catch (error) {
            res.send({ error });
        }
    });


    app.get('/api/dt/khung-dao-tao/:ma', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const item = await app.model.dtKhungDaoTao.get({ id: req.params.ma });
            let lop = await app.model.dtLop.getAll({ maCtdt: item.maCtdt }, 'maLop');
            let dssv = [];
            for (let lopInfo of lop) {
                let listSv = await app.model.fwStudent.getAll({ lop: lopInfo.maLop }, 'mssv, ho, ten, lop', 'mssv');
                dssv = [...dssv, ...listSv];
            }

            item.listLop = lop.map(i => i.maLop).toString();
            item.dssv = dssv;

            let khoaDt = await app.model.dtKhoaDaoTao.get({ maKhoa: item.dotTrungTuyen }, 'dotTuyenSinh');
            item.maDotTrungTuyen = khoaDt?.dotTuyenSinh;
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/khung-dao-tao/ctdt/:ma', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const item = await app.model.dtKhungDaoTao.get({ maCtdt: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let dataKhung = req.body.item.data, dataMon = req.body.item.items || [], user = req.session.user,
                { maCtdt } = dataKhung;
            // const condition = {
            //     statement: 'maKhung = :maKhung AND maNganh = :maNganh AND (chuyenNganh is NULL OR chuyenNganh = :chuyenNganh) AND loaiHinhDaoTao = :loaiHinhDaoTao AND khoaSinhVien = :khoaSinhVien',
            //     parameter: {
            //         maKhung, maNganh, chuyenNganh, khoaSinhVien, loaiHinhDaoTao
            //     }
            // };
            const items = await app.model.dtKhungDaoTao.getAll({ maCtdt });
            if (items.length != 0) throw 'Mã chương trình đào tạo đã được sử dụng!';
            else {
                const item = await app.model.dtKhungDaoTao.create(app.clone(dataKhung, { maCtdt, userModified: `${user.email}`, lastModified: Date.now() }));
                if (!dataMon || !dataMon.length) return res.send({ item, warning: 'Chưa có môn học nào được chọn' });
                else {
                    for (let index = 0; index < dataMon.length; index++) {
                        dataMon[index].maKhungDaoTao = item.id;
                        dataMon[index].tinhChatMon = 0;
                        delete dataMon[index].id;
                        await app.model.dtChuongTrinhDaoTao.create(dataMon[index]);
                    }
                    // await app.model.dtCauTrucTinChiCtdt.setDefault(item.id);
                }
                app.model.fwStudent.updateCtdtRedis(item.id);
                res.send({ item });
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let id = req.body.id, changes = req.body.changes, user = req.session.user;
            let cur = await app.model.dtKhungDaoTao.get({ id });
            if (!cur) {
                res.send({ error: 'Không tồn tại CTĐT!' });
            } else {
                let listCtdt = await app.model.dtKhungDaoTao.getAll({ maCtdt: changes.data.maCtdt });
                if (listCtdt.length) {
                    for (let ctdt of listCtdt) {
                        if (ctdt.id != id) throw 'Mã CTDT đã được dùng!';
                    }
                }
                let { maNganh } = cur;
                const dataNganh = await app.model.dtNganhDaoTao.get({ maNganh });
                await Promise.all([
                    app.model.dtKhungDaoTao.update({ id }, { ...changes.data, maKhoa: dataNganh.khoa, userModified: `${user.email}`, lastModified: Date.now() }),
                    app.model.dtChuongTrinhDaoTao.delete({ maKhungDaoTao: id }),
                ]);
                if (changes.items) {
                    for (const monHoc of changes.items) {
                        monHoc.maKhungDaoTao = parseInt(id);
                        delete monHoc.id;
                        await app.model.dtChuongTrinhDaoTao.create(app.clone(monHoc, { maKhoa: dataNganh.khoa, tinhChatMon: 0 }));
                    }
                }

                if (changes.data.listLop && changes.data.maCtdt) {
                    let maCtdt = changes.data.maCtdt;
                    await Promise.all(changes.data.listLop.split(',').map(async i => {
                        app.model.dtLop.update({ maLop: i }, { maCtdt });
                    }));
                }

                // if (changes.data.maCtdt) {
                //     let listTinChi = await app.model.dtCauTrucTinChiCtdt.getAll({ maCtdt: cur.maCtdt });
                //     await Promise.all(listTinChi.map(tc => app.model.dtCauTrucTinChiCtdt.update({ id: tc.id }, { maCtdt: changes.data.maCtdt })));
                // }

                // await app.model.dtCauTrucTinChiCtdt.setDefault(id);

                app.model.fwStudent.updateCtdtRedis(id);
                changes.items ? res.end() : res.send({ warning: 'Chưa có môn học nào được chọn' });
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:delete', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let listSv = (await app.model.fwStudent.getSvCtdt(req.body.id)).rows.map(sv => sv.mssv);
            for (let sv of listSv) {
                const allKeys = await app.database.dkhpRedis.keys(`CTDT:${sv}|*`);
                if (allKeys.length) {
                    await app.database.dkhpRedis.del(allKeys);
                }
            }
            let item = await app.model.dtKhungDaoTao.get({ id: req.body.id });
            await Promise.all([
                app.model.dtChuongTrinhDaoTao.delete({ maKhungDaoTao: req.body.id }),
                app.model.dtKhungDaoTao.delete({ id: req.body.id }),
                app.model.dtLop.update({ maCtdt: item.maCtdt }, { maCtdt: null }),
                // app.model.dtCauTrucTinChiCtdt.delete({ maCtdt: item.maCtdt }),
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send(error);
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/sv', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let { listSv, id } = req.body;
            listSv = app.utils.parse(listSv);
            let ctdt = await app.model.dtKhungDaoTao.get({ id }, 'maCtdt'),
                lop = await app.model.dtLop.get({ maCtdt: ctdt.maCtdt }, 'maLop');
            for (let sv of listSv) {
                await Promise.all([
                    app.model.fwStudent.update({ mssv: sv.mssv }, { lop: lop.maLop }),
                    app.model.fwStudent.initCtdtRedis(sv.mssv)
                ]);
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/chuong-trinh-dao-tao/sv', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let { listSv, id } = req.body;
            listSv = app.utils.parse(listSv);
            let ctdt = await app.model.dtKhungDaoTao.get({ id }, 'maCtdt'),
                lop = await app.model.dtLop.get({ maCtdt: ctdt.maCtdt }, 'maLop');
            for (let sv of listSv) {
                await Promise.all([
                    app.model.fwStudent.update({ mssv: sv.mssv }, { lop: lop.maLop }),
                    app.model.fwStudent.initCtdtRedis(sv.mssv)
                ]);
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/chuong-trinh-dao-tao/sv', app.permission.orCheck('dtChuongTrinhDaoTao:delete', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let { listSv } = req.body;
            listSv = app.utils.parse(listSv);
            for (let sv of listSv) {
                await app.model.fwStudent.update({ mssv: sv.mssv }, { lop: null });
                const allKeys = await app.database.dkhpRedis.keys(`CTDT:${sv.mssv}|*`);
                if (allKeys.length) {
                    await app.database.dkhpRedis.del(allKeys);
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chuong-trinh-dao-tao/export', app.permission.check('dtChuongTrinhDaoTao:export'), async (req, res) => {
        let { maKhung } = req.query;
        let KDT = await app.model.dtKhungDaoTao.get({ id: maKhung }, 'maKhung'),
            cauTrucKDT = await app.model.dtCauTrucKhungDaoTao.get({ maKhung: KDT.maKhung }, 'mucCha, mucCon'),
            mucCha = app.utils.parse(cauTrucKDT.mucCha), mucCon = app.utils.parse(cauTrucKDT.mucCon), index = 2;
        const workBook = app.excel.create();
        const [listMonCtdt, loaiDiem] = await Promise.all([
            app.model.dtChuongTrinhDaoTao.exportCtdt(maKhung),
            app.model.dtDiemDmLoaiDiem.getAll({ kichHoat: 1 }),
        ]);
        const wsData = workBook.addWorksheet('DANH SÁCH MÔN');
        const wsDiem = workBook.addWorksheet('LOẠI ĐIỂM');
        wsDiem.columns = [{ header: 'MÃ', key: 'ma', width: 20 }, { header: 'TÊN', key: 'ten', width: 20 }, { header: 'VÍ DỤ', key: 'viDu', width: 20 }];
        wsData.columns = [...Object.keys(listMonCtdt.rows[0]).map(key => ({ header: key.toString(), key, width: 20 }))];

        loaiDiem.forEach((item, index) => {
            item.viDu = app.utils.stringify({ loaiThanhPhan: item.ma, loaiLamTron: 0.5, phanTram: 30 });
            wsDiem.addRow({ ...item }, index == 0 ? 'n' : 'i');
        });

        listMonCtdt.rows.forEach((item, index) => {
            if (!item['TỶ LỆ ĐIỂM']) item['TỶ LỆ ĐIỂM'] = app.utils.stringify([]);
            wsData.addRow({ ...item }, index === 0 ? 'n' : 'i');
        });
        const wsKhoiKienThuc = workBook.addWorksheet('KHỐI KIẾN THỨC');
        let khoiKienThucCells = [
            { cell: 'A1', bold: true, border: '1234', value: 'MÃ' },
            { cell: 'B1', bold: true, border: '1234', value: 'TÊN KHỐI KIẾN THỨC' },
            { cell: 'C1', bold: true, border: '1234', value: 'MÃ KHỐI KIẾN THỨC CHA' }
        ];
        Object.keys(mucCha.chuongTrinhDaoTao).forEach(cha => {
            khoiKienThucCells.push({ cell: `A${index}`, border: '1234', value: `${mucCha.chuongTrinhDaoTao[cha].id}` });
            khoiKienThucCells.push({ cell: `B${index}`, border: '1234', value: mucCha.chuongTrinhDaoTao[cha].text });
            khoiKienThucCells.push({ cell: `C${index}`, border: '1234' });
            index++;
        });
        Object.keys(mucCon.chuongTrinhDaoTao).forEach(con => {
            mucCon.chuongTrinhDaoTao[con].forEach(item => {
                khoiKienThucCells.push({ cell: `A${index}`, border: '1234', value: `${item.id}` });
                khoiKienThucCells.push({ cell: `B${index}`, border: '1234', value: item.value.text });
                khoiKienThucCells.push({ cell: `C${index}`, border: '1234', value: `${mucCha.chuongTrinhDaoTao[con].id}` });
                index++;
            });
        });
        app.excel.write(wsKhoiKienThuc, khoiKienThucCells);
        app.excel.attachment(workBook, res, 'CTDT_template.xlsx');
    });

    app.get('/api/dt/chuong-trinh-dao-tao/download-template', app.permission.check('dtChuongTrinhDaoTao:export'), async (req, res) => {
        let { maKhung } = req.query;
        let cauTrucKDT = await app.model.dtCauTrucKhungDaoTao.get({ maKhung }, 'mucCha, mucCon'),
            mucCha = app.utils.parse(cauTrucKDT.mucCha), mucCon = app.utils.parse(cauTrucKDT.mucCon), index = 2;
        const workBook = app.excel.create(),
            wsData = workBook.addWorksheet('DANH SÁCH MÔN'),
            wsKhoiKienThuc = workBook.addWorksheet('KHỐI KIẾN THỨC'),
            wsDiem = workBook.addWorksheet('LOẠI ĐIỂM'),
            loaiDiem = await app.model.dtDiemDmLoaiDiem.getAll({ kichHoat: 1 });

        wsDiem.columns = [{ header: 'MÃ', key: 'ma', width: 20 }, { header: 'TÊN', key: 'ten', width: 20 }, { header: 'VÍ DỤ', key: 'viDu', width: 20 }];
        loaiDiem.forEach((item, index) => {
            item.viDu = app.utils.stringify({ loaiThanhPhan: item.ma, loaiLamTron: 0.5, phanTram: 30 });
            wsDiem.addRow({ ...item }, index == 0 ? 'n' : 'i');
        });

        let dataCells = [
            { cell: 'A1', bold: true, border: '1234', value: 'STT' },
            { cell: 'B1', bold: true, border: '1234', value: 'MÃ MÔN HỌC' },
            { cell: 'C1', bold: true, border: '1234', value: 'TỰ CHỌN (0 hoặc 1)' },
            { cell: 'D1', bold: true, border: '1234', value: 'HỌC KỲ DỰ KIẾN' },
            { cell: 'E1', bold: true, border: '1234', value: 'NĂM HỌC DỰ KIẾN' },
            { cell: 'F1', bold: true, border: '1234', value: 'MÃ KHỐI KIẾN THỨC' },
            { cell: 'G1', bold: true, border: '1234', value: 'MÃ KHỐI KIẾN THỨC CON' },
            { cell: 'H1', bold: true, border: '1234', value: 'TỶ LỆ ĐIỂM' },
        ];
        let khoiKienThucCells = [
            { cell: 'A1', bold: true, border: '1234', value: 'MÃ' },
            { cell: 'B1', bold: true, border: '1234', value: 'TÊN KHỐI KIẾN THỨC' },
            { cell: 'C1', bold: true, border: '1234', value: 'MÃ KHỐI KIẾN THỨC CHA' }
        ];
        Object.keys(mucCha.chuongTrinhDaoTao).forEach(cha => {
            khoiKienThucCells.push({ cell: `A${index}`, border: '1234', value: `${mucCha.chuongTrinhDaoTao[cha].id}` });
            khoiKienThucCells.push({ cell: `B${index}`, border: '1234', value: mucCha.chuongTrinhDaoTao[cha].text });
            khoiKienThucCells.push({ cell: `C${index}`, border: '1234' });
            index++;
        });
        Object.keys(mucCon.chuongTrinhDaoTao).forEach(con => {
            mucCon.chuongTrinhDaoTao[con].forEach(item => {
                khoiKienThucCells.push({ cell: `A${index}`, border: '1234', value: `${item.id}` });
                khoiKienThucCells.push({ cell: `B${index}`, border: '1234', value: item.value.text });
                khoiKienThucCells.push({ cell: `C${index}`, border: '1234', value: `${mucCha.chuongTrinhDaoTao[con].id}` });
                index++;
            });
        });

        wsData.getCell('A2').value = 1;
        wsData.getCell('B2').value = 'DAI007';
        wsData.getCell('C2').value = 0;
        wsData.getCell('D2').value = '1';
        wsData.getCell('E2').value = '2023 - 2024';
        wsData.getCell('F2').value = '1';
        wsData.getCell('H2').value = app.utils.stringify([{ loaiThanhPhan: 'CK', loaiLamTron: 0.5, phanTram: 100 }]);


        app.excel.write(wsData, dataCells);
        app.excel.write(wsKhoiKienThuc, khoiKienThucCells);

        app.excel.attachment(workBook, res, 'CTDT_template.xlsx');
    });

    //Hook upload -----------------------------------------------------------------------------------------
    app.uploadHooks.add('DtChuongTrinhDaoTaoData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtChuongTrinhDaoTaoImportData(fields, files, params, done), done, 'dtChuongTrinhDaoTao:write')
    );

    const dtChuongTrinhDaoTaoImportData = async (fields, files, params, done) => {
        let dataWS = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'DtChuongTrinhDaoTaoData' && files.DtChuongTrinhDaoTaoData && files.DtChuongTrinhDaoTaoData.length) {
            const srcPath = files.DtChuongTrinhDaoTaoData[0].path;
            const { maKhung } = params;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                dataWS = workbook.getWorksheet(1);
                if (dataWS) {
                    let items = [], falseItems = [], index = 2;
                    try {
                        const maKhoiKienThuc = [];
                        const maKhoiKienThucCon = {};
                        let cauTrucKhungDt = await app.model.dtCauTrucKhungDaoTao.get({ maKhung }, 'mucCha,mucCon'),
                            mucCha = app.utils.parse(cauTrucKhungDt.mucCha).chuongTrinhDaoTao,
                            mucCon = app.utils.parse(cauTrucKhungDt.mucCon).chuongTrinhDaoTao;
                        Object.keys(mucCha).forEach(cha => {
                            maKhoiKienThuc.push({ id: mucCha[cha].id, text: mucCha[cha].text });
                            let maCon = [];
                            mucCon[cha] && mucCon[cha].forEach(con => {
                                maCon.push({ id: con.id, text: con.value.text });
                            });
                            maKhoiKienThucCon[mucCha[cha].id] = maCon;
                        });

                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = dataWS.getCell(column + index).text?.trim();
                                if (type == 'number' && val != '') {
                                    if (!isNaN(val)) val = Number(val).toFixed(2);
                                    else val = '';
                                }
                                return val === '' ? Default : (val == null ? '' : val.toString());
                            };

                            if (!(dataWS.getCell('A' + index).value)) {
                                break;
                            } else {
                                const data = {
                                    stt: getVal('A'),
                                    maMonHoc: getVal('B'),
                                    loaiMonHoc: getVal('C'),
                                    hocKyDuKien: getVal('D'),
                                    namHocDuKien: getVal('E'),
                                    maKhoiKienThuc: getVal('F'),
                                    maKhoiKienThucCon: getVal('G'),
                                    tyLeDiem: getVal('H'),
                                };

                                const duplicate = items.find(i => i.maMonHoc == data.maMonHoc);
                                if (duplicate) {
                                    falseItems.push({ ...data, error: `Trùng môn học ở hàng ${duplicate.stt}` });
                                    index++;
                                    continue;
                                }

                                const monHoc = await app.model.dmMonHoc.get({ ma: data.maMonHoc });
                                if (!monHoc) {
                                    falseItems.push({ ...data, error: 'Môn học không tồn tại' });
                                    index++;
                                    continue;
                                }
                                data.tenMonHoc = app.utils.parse(monHoc.ten).vi;
                                data.soTinChi = monHoc.tongTinChi;
                                data.soTietLyThuyet = monHoc.tietLt;
                                data.soTietThucHanh = monHoc.tietTh;
                                data.tongSoTiet = monHoc.tongTiet;
                                data.khoa = monHoc.khoa;

                                const khoiCha = maKhoiKienThuc.find(kkt => kkt.id == data.maKhoiKienThuc);
                                if (!khoiCha) {
                                    falseItems.push({ ...data, error: 'Mã khối kiến thức không tồn tại' });
                                    index++;
                                    continue;
                                }
                                data.tenKhoiKienThuc = khoiCha.text;

                                if (data.maKhoiKienThucCon) {
                                    const khoiCon = maKhoiKienThucCon[data.maKhoiKienThuc]?.find(kkt => kkt.id == data.maKhoiKienThucCon);
                                    if (!khoiCon) {
                                        falseItems.push({ ...data, error: 'Mã khối kiến thức con không tồn tại' });
                                        index++;
                                        continue;
                                    }
                                    data.tenKhoiKienThucCon = khoiCon.text;
                                }
                                data.loaiMonHoc = data.loaiMonHoc == '0' || data.loaiMonHoc == '' ? 0 : 1;

                                try {
                                    data.dataTyLe = data.tyLeDiem ? app.utils.parse(data.tyLeDiem) : [];
                                    data.tyLeDiem = data.tyLeDiem == '[]' ? '' : data.tyLeDiem;
                                    if (data.dataTyLe.find(i => i.loaiThanhPhan == 'CK' && (isNaN(Number(i.phanTram)) || Number(i.phanTram) < 50 || Number(i.phanTram) > 100))) {
                                        falseItems.push({ ...data, error: 'Tỷ lệ điểm cuối kỳ không hợp lệ' });
                                        index++;
                                        continue;
                                    }

                                    if (data.dataTyLe.find(i => i.loaiThanhPhan != 'CK' && (isNaN(Number(i.phanTram)) || Number(i.phanTram) < 0 || Number(i.phanTram) > 50))) {
                                        falseItems.push({ ...data, error: 'Tỷ lệ điểm thành phần không hợp lệ' });
                                        index++;
                                        continue;
                                    }

                                    if (data.dataTyLe.find(i => i.loaiThanhPhan == 'CK' && (isNaN(Number(i.phanTram)) || Number(i.phanTram) < 50 || Number(i.phanTram) > 100))) {
                                        falseItems.push({ ...data, error: 'Tỷ lệ điểm cuối kỳ không hợp lệ' });
                                        index++;
                                        continue;
                                    }

                                    if (data.dataTyLe.find(i => !i.loaiLamTron || ['0.1', '0.2', '0.5'].includes(i.loaiLamTron))) {
                                        falseItems.push({ ...data, error: 'Loại làm tròn phải thuộc 0,1 hoặc 0.2 hoặc 0.5' });
                                        index++;
                                        continue;
                                    }
                                } catch (_) {
                                    falseItems.push({ ...data, error: 'Tỷ lệ điểm sai định dạng' });
                                    index++;
                                    continue;
                                }

                                items.push(data);
                                index++;
                            }
                        }
                        done({ items, falseItems });
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };

    //Phân quyền ------------------------------------------------------------------------------------------
    // app.assignRoleHooks.addRoles('daoTao', { id: 'dtChuongTrinhDaoTao:read', text: 'Đào tạo: Quản lý chương trình đào tạo' });

    // app.permissionHooks.add('staff', 'checkRoleDTQuanLyCTDT', (user) => new Promise(resolve => {
    //     if (user.permissions.includes('manager:login')) {
    //         app.permissionHooks.pushUserPermission(user, 'dtChuongTrinhDaoTao:read');
    //     }
    //     resolve();
    // }));

    // app.permissionHooks.add('assignRole', 'checkRoleDTQuanLyCTDT', (user, assignRoles) => new Promise(resolve => {
    //     const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
    //     inScopeRoles.forEach(role => {
    //         if (role.tenRole == 'dtChuongTrinhDaoTao:manage' && user.permissions.includes('faculty:login')) {
    //             app.permissionHooks.pushUserPermission(user, 'dtChuongTrinhDaoTao:read', 'dtEduProgram:manage');
    //         } else if (role.tenRole == 'dtChuongTrinhDaoTao:read' && user.permissions.includes('faculty:login')) {
    //             app.permissionHooks.pushUserPermission(user, 'dtChuongTrinhDaoTao:read', 'dtEduProgram:manage');
    //         }
    //     });
    //     resolve();
    // }));

    app.get('/api/dt/chuong-trinh-dao-tao/download-word/:id', app.permission.check('dtChuongTrinhDaoTao:read'), (req, res) => {
        if (req.params && req.params.id) {
            const id = req.params.id;
            app.model.dtKhungDaoTao.get({ id }, '*', 'id ASC', (error, kdt) => {
                if (error) {
                    res.send({ error });
                    return;
                }
                const { maNganh, tenNganh, trinhDoDaoTao,
                    loaiHinhDaoTao, thoiGianDaoTao, tenVanBang, namDaoTao
                } = kdt;
                app.model.dtCauTrucKhungDaoTao.get({ id: namDaoTao }, '*', 'id ASC', (error, ctkdt) => {
                    if (error) {
                        res.send({ error });
                        return;
                    }
                    const mucCha = JSON.parse(ctkdt.mucCha || '{}');
                    const mucCon = JSON.parse(ctkdt.mucCon || '{}');
                    const chuongTrinhDaoTao = { parents: mucCha?.chuongTrinhDaoTao, childs: mucCon?.chuongTrinhDaoTao };
                    const ctdt = [];
                    app.model.dtChuongTrinhDaoTao.getAll({ maKhungDaoTao: id }, '*', 'id ASC', (error, monHocs) => {
                        if (error) {
                            res.send({ error });
                            return;
                        }
                        const pushMhToObj = (idKkt, idKhoi, obj) => {
                            monHocs.forEach(monHoc => {
                                if ((idKkt && idKhoi && monHoc.maKhoiKienThucCon == idKkt && monHoc.maKhoiKienThuc == idKhoi) || (idKhoi && !idKkt && monHoc.maKhoiKienThuc == idKhoi)) {
                                    const { maMonHoc, tenMonHoc, loaiMonHoc, tongSoTiet, soTietLyThuyet, soTietThucHanh } = monHoc;
                                    const loaiMonHocStr = loaiMonHoc == 0 ? 'Bắt buộc' : 'Tự chọn';
                                    obj.mh.push({ maMonHoc, tenMonHoc, loaiMonHoc: loaiMonHocStr, tongSoTiet: parseInt(tongSoTiet / 15), soTietLyThuyet: parseInt(soTietLyThuyet / 15), soTietThucHanh: parseInt(soTietThucHanh / 15) });
                                }
                            });
                        };
                        Object.keys(chuongTrinhDaoTao.parents).forEach((key, idx) => {
                            const khoi = chuongTrinhDaoTao.parents[key];
                            const { id: idKhoi, text } = khoi;
                            const tmpCtdt = {
                                stt: idx + 1,
                                name: text,
                                mh: [],
                            };
                            if (chuongTrinhDaoTao.childs[key]) {
                                ctdt.push(tmpCtdt);
                                chuongTrinhDaoTao.childs[key].forEach(kkt => {
                                    const { id: idKkt, value } = kkt;
                                    const tmpCtdt = {
                                        stt: '',
                                        name: value.text,
                                        mh: [],
                                    };
                                    pushMhToObj(idKkt, idKhoi, tmpCtdt);
                                    ctdt.push(tmpCtdt);
                                });
                            } else {
                                pushMhToObj(null, idKhoi, tmpCtdt);
                                ctdt.push(tmpCtdt);
                            }
                        });
                        const source = app.path.join(__dirname, 'resource', 'ctdt_word.docx');
                        new Promise(resolve => {
                            const data = {
                                tenNganhVi: JSON.parse(tenNganh).vi,
                                tenNganhEn: JSON.parse(tenNganh).en,
                                maNganh,
                                trinhDoDaoTao,
                                loaiHinhDaoTao,
                                thoiGianDaoTao,
                                tenKhoa: '',
                                tenVanBangVi: JSON.parse(tenVanBang).vi,
                                tenVanBangEn: JSON.parse(tenVanBang).en,
                                ctdt: ctdt,
                            };
                            resolve(data);
                        }).then((data) => {
                            app.docx.generateFile(source, data, (error, data) => {
                                res.send({ error, data });
                            });
                        });
                    });
                });

            });
        } else {
            res.send({ error: 'No permission' });
        }
    });

    app.get('/api/dt/chuong-trinh-dao-tao/tin-chi-ctdt', app.permission.orCheck('dtChuongTrinhDaoTao:manage', 'dtChuongTrinhDaoTao:read'), async (req, res) => {
        try {
            let { maCtdt } = req.query,
                list = await app.model.dtCauTrucTinChiCtdt.getAll({ maCtdt }, '*', 'viTriKhoiKienThuc ASC');

            res.send({ list });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/tin-chi-ctdt', app.permission.check('dtChuongTrinhDaoTao:write'), async (req, res) => {
        try {
            let { items } = req.body,
                maCtdt = items[0].maCtdt;
            await app.model.dtCauTrucTinChiCtdt.delete({ maCtdt });
            for (let item of items) {
                await app.model.dtCauTrucTinChiCtdt.create(item);
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/tin-chi-ctdt-multiple', app.permission.check('dtChuongTrinhDaoTao:write'), async (req, res) => {
        try {
            let { listCtdt, items } = req.body;

            for (let maCtdt of listCtdt) {
                await app.model.dtCauTrucTinChiCtdt.delete({ maCtdt });
                for (let item of items) {
                    item.maCtdt = maCtdt;
                    await app.model.dtCauTrucTinChiCtdt.create(item);
                }
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/chuong-trinh-dao-tao/download-dssv', app.permission.check('staff:login'), async (req, res) => {
        try {
            const item = await app.model.dtKhungDaoTao.get({ id: req.query.maKhung });
            let lop = await app.model.dtLop.getAll({ maCtdt: item.maCtdt }, 'maLop');
            let dssv = [];
            for (let lopInfo of lop) {
                let listSv = await app.model.fwStudent.getAll({ lop: lopInfo.maLop }, 'mssv, ho, ten, lop, emailTruong, dienThoaiCaNhan', 'mssv');
                dssv = [...dssv, ...listSv];
            }

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Dssv');

            let cells = [
                { cell: 'A1', value: 'STT', bold: true },
                { cell: 'B1', value: 'MSSV', bold: true },
                { cell: 'C1', value: 'Họ và tên', bold: true },
                { cell: 'D1', value: 'Lớp', bold: true },
                { cell: 'E1', value: 'Email trường', bold: true },
                { cell: 'F1', value: 'Số điện thoại', bold: true },
            ];

            for (let [index, sv] of dssv.entries()) {
                cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: sv.mssv });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: `${sv.ho} ${sv.ten}` });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: sv.lop || '' });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: sv.emailTruong || '' });
                cells.push({ cell: 'F' + (index + 2), border: '1234', value: sv.dienThoaiCaNhan || '' });
            }
            app.excel.write(ws, cells);
            app.excel.attachment(workBook, res, `DSSV_CTDT_${item.maCtdt}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/khung-tin-chi/default', app.permission.check('dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const { maKhungDaoTao } = req.body;

            await Promise.all([
                app.model.dtKhungTinChiDaoTao.delete({ maKhungDaoTao }),
                app.model.dtKhungTinChiMonHoc.delete({ maKhungDaoTao }),
            ]);
            let [khungDaoTao, ctdt] = await Promise.all([
                app.model.dtKhungDaoTao.get({ id: maKhungDaoTao }),
                app.model.dtChuongTrinhDaoTao.getAll({ maKhungDaoTao }),
            ]);

            ctdt = ctdt.map(i => ({ id: i.id, maMonHoc: i.maMonHoc, maKhoiKienThuc: i.maKhoiKienThuc, maKhoiKienThucCon: i.maKhoiKienThucCon, soTinChi: i.soTinChi, loaiMonHoc: i.loaiMonHoc }));

            let cauTrucKhung = await app.model.dtCauTrucKhungDaoTao.get({ maKhung: khungDaoTao.maKhung }),
                { mucCha, mucCon } = cauTrucKhung;

            mucCha = mucCha ? app.utils.parse(mucCha).chuongTrinhDaoTao : {};
            mucCon = mucCon ? app.utils.parse(mucCon).chuongTrinhDaoTao : {};

            let listKhungTinChi = [];

            Object.keys(mucCha).forEach(key => {
                let { id } = mucCha[key],
                    children = mucCon[key];

                if (children && children.length) {
                    for (let child of children) {
                        let listTuChon = ctdt.filter(i => i.maKhoiKienThuc == id && i.maKhoiKienThucCon == child.id && i.loaiMonHoc == 1),
                            listBatBuoc = ctdt.filter(i => i.maKhoiKienThuc == id && i.maKhoiKienThucCon == child.id && i.loaiMonHoc == 0);

                        if (listTuChon.length) {
                            listKhungTinChi.push({
                                maKhoiKienThuc: id, maKhoiKienThucCon: child.id, maKhungDaoTao, loaiKhung: 'TC',
                                tongSoTinChi: listTuChon.reduce((total, cur) => total + Number(cur.soTinChi), 0),
                            });
                        }

                        if (listBatBuoc.length) {
                            listKhungTinChi.push({
                                maKhoiKienThuc: id, maKhoiKienThucCon: child.id, maKhungDaoTao, loaiKhung: 'BB',
                                tongSoTinChi: listBatBuoc.reduce((total, cur) => total + Number(cur.soTinChi), 0),
                            });
                        }
                    }
                }

                let listTuChon = ctdt.filter(i => i.maKhoiKienThuc == id && i.loaiMonHoc == 1),
                    listBatBuoc = ctdt.filter(i => i.maKhoiKienThuc == id && i.loaiMonHoc == 0);

                if (listTuChon.length) {
                    listKhungTinChi.push({
                        maKhoiKienThuc: id, maKhoiKienThucCon: '', maKhungDaoTao, loaiKhung: 'TC',
                        tongSoTinChi: listTuChon.reduce((total, cur) => total + Number(cur.soTinChi), 0),
                    });
                }

                if (listBatBuoc.length) {
                    listKhungTinChi.push({
                        maKhoiKienThuc: id, maKhoiKienThucCon: '', maKhungDaoTao, loaiKhung: 'BB',
                        tongSoTinChi: listBatBuoc.reduce((total, cur) => total + Number(cur.soTinChi), 0),
                    });
                }
            });

            listKhungTinChi = await Promise.all(listKhungTinChi.map(i => app.model.dtKhungTinChiDaoTao.create({ ...i })));

            await Promise.all(ctdt.map(i => {
                let idKhungTinChi = listKhungTinChi.find(tc => (i.loaiMonHoc == 0 ? tc.loaiKhung == 'BB' : tc.loaiKhung == 'TC') && tc.maKhoiKienThuc == i.maKhoiKienThuc && (!i.maKhoiKienThucCon || i.maKhoiKienThucCon == tc.maKhoiKienThucCon))?.id || '';
                delete i.id;
                return app.model.dtKhungTinChiMonHoc.create({ ...i, idKhungTinChi, maKhungDaoTao });
            }));

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/chuong-trinh-dao-tao/khung-tin-chi', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let { maKhungDaoTao } = req.query,
                [khungDaoTao, monCtdt, khungTinChi, monTuongDuong] = await Promise.all([
                    app.model.dtKhungDaoTao.get({ id: maKhungDaoTao }),
                    app.model.dtChuongTrinhDaoTao.getCtdt(app.utils.stringify({ maKhungDaoTao })),
                    app.model.dtKhungTinChiDaoTao.getAll({ maKhungDaoTao }),
                    app.model.dtChuongTrinhDaoTao.getTuongDuong(app.utils.stringify({ maKhungDaoTao })),
                ]);

            let cauTrucKhung = await app.model.dtCauTrucKhungDaoTao.get({ maKhung: khungDaoTao.maKhung }),
                { mucCha, mucCon } = cauTrucKhung || { mucCha: null, mucCon: null };

            mucCha = mucCha ? app.utils.parse(mucCha).chuongTrinhDaoTao : {};
            mucCon = mucCon ? app.utils.parse(mucCon).chuongTrinhDaoTao : {};

            res.send({ mucCha, mucCon, khungTinChi, monCtdt: monCtdt.rows, monTuongDuong: monTuongDuong.rows });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/nhom-tu-chon', app.permission.check('dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const { dataKhung, listNhom } = req.body,
                { maKhoiKienThuc, maKhoiKienThucCon, isDinhHuong, loaiKhung, maKhungDaoTao, tongSoTinChi, isNhom } = dataKhung;

            await Promise.all([
                app.model.dtKhungTinChiDaoTao.update({ id: dataKhung.id }, { tongSoTinChi, isNhom, isDinhHuong }),
                app.model.dtKhungTinChiMonHoc.delete({ idKhungTinChi: dataKhung.id })
            ]);

            for (let nhom of listNhom) {
                const { listMon, tenNhomDinhHuong, tongSoTinChi } = nhom;
                const khungTinChi = await app.model.dtKhungTinChiDaoTao.create({ maKhoiKienThuc, maKhoiKienThucCon, tenNhomDinhHuong, isDinhHuong, isNhom, tongSoTinChi, loaiKhung, maKhungDaoTao, parentId: dataKhung.id });
                await Promise.all(listMon.map(i => app.model.dtKhungTinChiMonHoc.create({ ...i, maKhungDaoTao, idKhungTinChi: khungTinChi.id })));
            }

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/nhom-tu-chon/cancel', app.permission.check('dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const { id, maKhungDaoTao, maKhoiKienThuc, maKhoiKienThucCon } = req.body.item;

            const childKhung = await app.model.dtKhungTinChiDaoTao.getAll({ parentId: id });

            let listMon = await Promise.all(childKhung.map(khung => app.model.dtKhungTinChiMonHoc.getAll({ idKhungTinChi: khung.id }, 'maMonHoc, soTinChi')));
            listMon = listMon.flat();
            listMon = listMon.filter((mon, index, self) => index == self.findIndex((i) => i.maMonHoc === mon.maMonHoc));

            await Promise.all([
                app.model.dtKhungTinChiDaoTao.delete({ parentId: id }),
                app.model.dtKhungTinChiMonHoc.delete({
                    statement: 'idKhungTinChi IN (:list)',
                    parameter: { list: childKhung.map(i => i.id) }
                })
            ]);

            const tongSoTinChi = listMon.reduce((acc, cur) => acc + Number(cur.soTinChi), 0);

            await Promise.all([
                ...listMon.map(async mon => app.model.dtKhungTinChiMonHoc.create({ ...mon, maKhungDaoTao, maKhoiKienThuc, maKhoiKienThucCon, loaiMonHoc: 1, idKhungTinChi: id })),
                app.model.dtKhungTinChiDaoTao.update({ id }, { tongSoTinChi, isNhom: '', isDinhHuong: '', khoiKienThucTuongDuong: '' }),
            ]);

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/tong-tin-chi', app.permission.check('dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const { id, tongSoTinChi } = req.body.item;
            await app.model.dtKhungTinChiDaoTao.update({ id }, { tongSoTinChi });

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/nhom-tuong-duong', app.permission.check('dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const { id, khoiKienThucTuongDuong } = req.body.item;
            await app.model.dtKhungTinChiDaoTao.update({ id }, { khoiKienThucTuongDuong });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    app.get('/api/dt/chuong-trinh-dao-tao/sinh-vien/template', app.permission.check('dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('MSSV');
            const defaultColumns = [
                { header: 'Mã số sinh viên', key: 'mssv', width: 20 },
            ];
            ws.columns = defaultColumns;
            ws.getCell('A2').value = 'SV01';
            app.excel.attachment(workBook, res, 'ImportSinhVien.xlsx');
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/save-import-sinh-vien', app.permission.check('dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let { items, maKhung } = req.body;
            items = app.utils.parse(items);

            const { maCtdt } = await app.model.dtKhungDaoTao.get({ id: maKhung }, 'loaiHinhDaoTao, maNganh, maKhoa, maCtdt');
            const lop = await app.model.dtLop.get({ maCtdt }, 'maLop');
            await Promise.all(items.map(async item => app.model.fwStudent.update({ mssv: item.mssv }, { lop: lop.maLop, chuongTrinhDaoTao: maCtdt })));

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send(error);
        }
    });

    app.uploadHooks.add('ImportSvCtdt', (req, fields, files, params, done) =>
        app.permission.has(req, () => ImportSvCtdt(req, fields, files, params, done), done, 'dtChuongTrinhDaoTao:write')
    );

    const ImportSvCtdt = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportSvCtdt' && files.ImportSvCtdt && files.ImportSvCtdt.length) {
            const srcPath = files.ImportSvCtdt[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                worksheet = workbook.getWorksheet(1);
                app.fs.deleteFile(srcPath);
                if (worksheet) {
                    try {
                        let items = [], falseItems = [], index = 2,
                            maKhung = params.ma;

                        const { maCtdt } = await app.model.dtKhungDaoTao.get({ id: maKhung }, 'loaiHinhDaoTao, maNganh, maKhoa, maCtdt');
                        const lop = await app.model.dtLop.get({ maCtdt }, 'maLop');

                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text?.trim();
                                if (type == 'number' && val != '') {
                                    if (!isNaN(val)) val = Number(val).toFixed(2);
                                    else val = '';
                                }
                                return val === '' ? Default : (val == null ? '' : val.toString());
                            };

                            if (!(worksheet.getCell('A' + index).value)) {
                                break;
                            } else {
                                const data = {
                                    mssv: getVal('A'),
                                    row: index,
                                };

                                //Check data
                                let sv = await app.model.fwStudent.get({ mssv: data.mssv }, 'mssv, ho, ten');
                                if (!sv) {
                                    falseItems.push({ ...data, error: 'Không tồn tại sinh viên' });
                                    index++;
                                    continue;
                                }
                                data.hoTen = `${sv.ho} ${sv.ten}`;

                                if (!lop) {
                                    falseItems.push({ ...data, error: 'Chương trình đào tạo không có lớp' });
                                    index++;
                                    continue;
                                }
                                data.lop = lop.maLop;

                                if (!falseItems.find(i => i.row == index)) {
                                    items.push({ ...data });
                                }
                            }
                            index++;
                        }

                        done({ items, falseItems });
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };

    app.post('/api/dt/chuong-trinh-dao-tao/ty-le-diem', app.permission.check('dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const { items, maKhungDaoTao, tyLeDiem } = req.body;

            await app.model.dtChuongTrinhDaoTao.update({
                statement: 'maKhungDaoTao = :maKhungDaoTao AND maMonHoc IN (:items)',
                parameter: { maKhungDaoTao, items }
            }, { tyLeDiem });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/chuong-trinh-dao-tao/ke-hoach-chuyen-nganh', app.permission.check('dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const { items, maKhungDaoTao } = req.body;

            const [listInfo, infoKhung] = await Promise.all([
                app.model.dtChuongTrinhDaoTao.getAll({
                    statement: 'maMonHoc IN (:items) AND maKhungDaoTao = :maKhungDaoTao',
                    parameter: { items, maKhungDaoTao }
                }, 'maMonHoc, namHocDuKien, hocKyDuKien'),
                app.model.dtKhungDaoTao.get({ id: maKhungDaoTao }, 'maNganh, khoaSinhVien, loaiHinhDaoTao'),
            ]);
            const listChuyenNganh = await app.model.dtKhungDaoTao.getAll({
                statement: 'maNganh = :maNganh AND khoaSinhVien = :khoaSinhVien AND loaiHinhDaoTao = :loaiHinhDaoTao AND chuyenNganh IS NOT NULL',
                parameter: { maNganh: infoKhung.maNganh, khoaSinhVien: infoKhung.khoaSinhVien, loaiHinhDaoTao: infoKhung.loaiHinhDaoTao },
            }, 'id');
            if (!listChuyenNganh.length) throw { message: 'Không tìm thấy chương trình đào tạo chuyên ngành' };

            for (const chuyenNganh of listChuyenNganh) {
                await Promise.all(listInfo.map(item => app.model.dtChuongTrinhDaoTao.update({ maMonHoc: item.maMonHoc, maKhungDaoTao: chuyenNganh.id }, { namHocDuKien: item.namHocDuKien, hocKyDuKien: item.hocKyDuKien }).catch(err => console.error(`CN${chuyenNganh.id}-MH${item.maMonHoc}-${err}`))));
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/chuong-trinh-dao-tao/khung-tin-chi/export', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let { maKhungDaoTao } = req.query,
                [khungDaoTao, monCtdt, khungTinChi, monTuongDuong] = await Promise.all([
                    app.model.dtKhungDaoTao.get({ id: maKhungDaoTao }),
                    app.model.dtChuongTrinhDaoTao.getCtdt(app.utils.stringify({ maKhungDaoTao })),
                    app.model.dtKhungTinChiDaoTao.getAll({ maKhungDaoTao }),
                    app.model.dtChuongTrinhDaoTao.getTuongDuong(app.utils.stringify({ maKhungDaoTao })),
                ]);

            let cauTrucKhung = await app.model.dtCauTrucKhungDaoTao.get({ maKhung: khungDaoTao.maKhung }),
                { mucCha, mucCon } = cauTrucKhung || { mucCha: null, mucCon: null };

            mucCha = mucCha ? app.utils.parse(mucCha).chuongTrinhDaoTao : {};
            mucCon = mucCon ? app.utils.parse(mucCon).chuongTrinhDaoTao : {};
            monCtdt = monCtdt.rows;
            monTuongDuong = monTuongDuong.rows;

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('KHUNG_TIN_CHI');

            ws.mergeCells('A1:D1');
            ws.getCell('A1').value = `MÃ CHƯƠNG TRÌNH ĐÀO TẠO: ${khungDaoTao.maCtdt}`;

            ws.getCell('A3').value = 'STT';
            ws.getCell('B3').value = 'MÃ MÔN HỌC';
            ws.getCell('C3').value = 'TÊN MÔN HỌC';
            ws.getCell('D3').value = 'SỐ TÍN CHỈ';


            let index = 4, stt = 1;

            Object.keys(mucCha).map(key => {
                const children = mucCon[key];
                let datas = [{ title: mucCha[key].text.toUpperCase() }];
                if (children && children.length) {
                    children.forEach(child => {
                        let dataTinChi = khungTinChi.filter(i => i.maKhoiKienThuc == mucCha[key].id && i.maKhoiKienThucCon == child.id && i.parentId == null);
                        if (dataTinChi.length) {
                            datas.push({ title: child.value.text });
                            let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                            if (nhomBatBuoc) {
                                datas.push({ ...nhomBatBuoc });
                                monCtdt.filter(i => i.idKhungTinChi == nhomBatBuoc.id && i.loaiMonHoc == 0).map((mon, index) => {
                                    datas.push({ ...mon, index });
                                });
                            }

                            let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                            if (nhomTuChon) {
                                if (nhomTuChon.isDinhHuong || nhomTuChon.isNhom) {
                                    let childTuChon = khungTinChi.filter(i => i.parentId == nhomTuChon.id);
                                    childTuChon = childTuChon.flatMap(child => {
                                        return [child, ...monCtdt.filter(i => i.loaiMonHoc == 1 && i.idKhungTinChi == child.id).map((mon, index) => ({ ...mon, index }))];
                                    });
                                    datas.push({ ...nhomTuChon, childTuChon });
                                } else {
                                    datas.push({ ...nhomTuChon });
                                    monCtdt.filter(i => i.idKhungTinChi == nhomTuChon.id && i.loaiMonHoc == 1).map((mon, index) => {
                                        datas.push({ ...mon, index });
                                    });
                                }
                            }
                        }
                    });
                } else {
                    let dataTinChi = khungTinChi.filter(i => i.maKhoiKienThuc == mucCha[key].id && i.maKhoiKienThucCon == null && i.parentId == null);
                    if (dataTinChi.length) {
                        let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                        if (nhomBatBuoc) {
                            datas.push({ ...nhomBatBuoc });
                            monCtdt.filter(i => i.idKhungTinChi == nhomBatBuoc.id && i.loaiMonHoc == 0).map((mon, index) => {
                                datas.push({ ...mon, index });
                            });
                        }

                        let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                        if (nhomTuChon) {
                            if (nhomTuChon.isDinhHuong || nhomTuChon.isNhom) {
                                let childTuChon = khungTinChi.filter(i => i.parentId == nhomTuChon.id);
                                childTuChon = childTuChon.flatMap(child => {
                                    return [child, ...monCtdt.filter(i => i.loaiMonHoc == 1 && i.idKhungTinChi == child.id)].map((mon, index) => ({ ...mon, index }));
                                });
                                datas.push({ ...nhomTuChon, childTuChon });
                            } else {
                                datas.push({ ...nhomTuChon });
                                monCtdt.filter(i => i.idKhungTinChi == nhomTuChon.id && i.loaiMonHoc == 1).map((mon, index) => {
                                    datas.push({ ...mon, index });
                                });
                            }
                        }
                    }
                }

                ws.getColumn(1).width = 15;
                ws.getColumn(2).width = 30;
                ws.getColumn(3).width = 50;
                ws.getColumn(4).width = 20;

                datas.forEach(item => {
                    if (item.childTuChon) {
                        ws.mergeCells(`A${index}:C${index}`);
                        ws.getCell(`A${index}`).value = item.isDinhHuong ? 'Nhóm tự chọn định hướng' : 'Nhóm tự chọn';

                        item.childTuChon.forEach(child => {
                            index++;
                            if (!child.idMon) {
                                ws.mergeCells(`A${index}:C${index}`);
                                ws.getCell(`A${index}`).value = (child.isDinhHuong ? 'Tự chọn định hướng: ' : 'Tự chọn nhóm: ') + child.tenNhomDinhHuong;
                                ws.getCell(`D${index}`).value = child.tongSoTinChi;
                            } else {
                                ws.getCell(`A${index}`).value = stt;
                                ws.getCell(`B${index}`).value = child.maMonHoc;
                                ws.getCell(`C${index}`).value = JSON.parse(child.tenMonHoc)?.vi;
                                ws.getCell(`D${index}`).value = child.soTinChi;
                                stt++;
                            }
                        });
                    } else {
                        if (item.title) {
                            ws.mergeCells(`A${index}:D${index}`);
                            ws.getCell(`A${index}`).value = item.title;
                            ws.getCell(`A${index}`).font = { bold: true };
                        } else if (!item.idMon) {
                            ws.mergeCells(`A${index}:C${index}`);
                            ws.getCell(`A${index}`).value = item.isDinhHuong ? 'Tự chọn định hướng: ' + item.tenNhomDinhHuong : (item.loaiKhung == 'BB' ? 'Môn bắt buộc' : 'Môn tự chọn');
                            ws.getCell(`D${index}`).value = item.tongSoTinChi;
                        } else {
                            ws.getCell(`A${index}`).value = stt;
                            ws.getCell(`B${index}`).value = item.maMonHoc;
                            ws.getCell(`C${index}`).value = JSON.parse(item.tenMonHoc)?.vi;
                            ws.getCell(`D${index}`).value = item.soTinChi;
                            stt++;
                        }
                    }
                    index++;
                });
            });

            const wsTuongDuong = workBook.addWorksheet('DANH_SACH_MON_TUONG_DUONG');
            wsTuongDuong.columns = [
                { header: 'STT', key: 'stt', width: 10 },
                { header: 'MÔN HỌC', key: 'monHoc', width: 50 },
                { header: 'MÔN TƯƠNG ĐƯƠNG', key: 'monTuongDuong', width: 50 },
                { header: 'SỐ TÍN CHỈ', key: 'soTinChi', width: 20 },
            ];
            monTuongDuong.forEach((item, index) => {
                let rowData = {
                    stt: index + 1,
                    monHoc: `${item.maMonHoc}: ${JSON.parse(item.tenMon).vi}`,
                    monTuongDuong: `${item.maMonPhuThuoc}: ${JSON.parse(item.tenMonPhuThuoc).vi}`,
                    soTinChi: item.tongTinChiPhuThuoc,
                };
                wsTuongDuong.addRow(rowData, index === 0 ? 'n' : 'i');
            });

            let fileName = `KHUNG_TIN_CHI_${khungDaoTao.maCtdt}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};