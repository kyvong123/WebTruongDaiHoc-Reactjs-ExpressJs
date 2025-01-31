module.exports = app => {
    const menuDotDanhGiaDrl = {
        parentMenu: app.parentMenu.students,
        menus: {
            6130: { title: 'Đợt đánh giá điểm rèn luyện', parentKey: 6129, link: '/user/ctsv/dot-danh-gia-drl', icon: 'fa-book', backgroundColor: '#ac2d34' }
        }
    };

    app.permission.add(
        { name: 'ctsvDotDanhGiaDrl:manage', menu: menuDotDanhGiaDrl },
        { name: 'ctsvDotDanhGiaDrl:write' },
        { name: 'ctsvDotDanhGiaDrl:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleDotDanhGiaDrl', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvDotDanhGiaDrl:manage', 'ctsvDotDanhGiaDrl:write', 'ctsvDotDanhGiaDrl:delete');
            resolve();
        } else resolve();
    }));


    app.get('/user/ctsv/dot-danh-gia-drl', app.permission.check('ctsvDotDanhGiaDrl:manage'), app.templates.admin);
    app.get('/user/ctsv/dot-danh-gia-drl/edit/:id', app.permission.check('ctsvDotDanhGiaDrl:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/dot-danh-gia-drl/page/:pageNumber/:pageSize', app.permission.orCheck('ctsvDotDanhGiaDrl:manage', 'staff:drl-manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            sort && app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] });
            // filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.svDotDanhGiaDrl.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dot-danh-gia-drl/all', app.permission.check('ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            const data = await app.model.svDotDanhGiaDrl.getAll({});
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dot-danh-gia-drl/item/:id', app.permission.orCheck('ctsvDotDanhGiaDrl:manage', 'staff:drl-manage'), async (req, res) => {
        try {
            let id = req.params.id;
            const data = await app.model.svDotDanhGiaDrl.get({ id });
            if (data) {
                const dataGiaHan = await app.model.svDrlGiaHanKhoa.getData(data.id.toString());
                data.dsGiaHan = dataGiaHan.rows;
            }
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dot-danh-gia-drl/count', app.permission.check('ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            let id = req.query.id;
            const length = await app.model.svDssvDotDanhGiaDrl.count({ idDot: id, kichHoat: 1 });
            res.send({ count: length.rows[0]['COUNT(*)'] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dot-danh-gia-drl', app.permission.check('ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            let data = req.body.item;
            data.modifier = req.session.user.email;
            data.timeModified = Date.now();
            data.isDelete = 0;

            let listLoaiHinhDaoTao = data.loaiHinhDaoTao.split(', '),
                listKhoa = data.khoa.split(', '),
                listKhoaSV = data.khoaSinhVien.split(', ');

            await checkTrungLapDoiTuong(data, null);
            const newItem = await app.model.svDotDanhGiaDrl.create(data);
            let listSv = await app.model.dtCauHinhDotDkhp.getListStudents(app.utils.stringify({ listLoaiHinhDaoTao: listLoaiHinhDaoTao.toString(), listKhoa: listKhoa.toString(), listKhoaSV: listKhoaSV.toString() }));

            await Promise.all(listSv.rows.map((sinhVien) => {
                return app.model.svDssvDotDanhGiaDrl.create({
                    idDot: newItem.id,
                    mssv: sinhVien.mssv,
                    kichHoat: sinhVien.tinhTrang == 1 ? 1 : 0,
                    namHoc: newItem.namHoc,
                    hocKy: newItem.hocKy,
                    modifier: req.session.user.email,
                    timeModified: Date.now(),
                }).catch(error => app.consoleError(req, error));
            }));
            res.send({ item: newItem });
        } catch (error) {
            res.send({ error });
        }
    });

    const getThoiGianDot = (dataDot) => {
        const { timeStartSv, timeStartLt, timeStartFaculty, timeEndSv, timeEndLt, timeEndFaculty } = dataDot,
            ngayBatDau = Math.min(...[timeStartSv, timeStartLt, timeStartFaculty].filter(time => time != null)),
            ngayKetThuc = Math.max(...[timeEndSv, timeEndLt, timeEndFaculty].filter(time => time != null));
        return { ngayBatDau, ngayKetThuc };
    };

    const checkTrungLapDoiTuong = async (data, id) => {
        // Kiểm tra trùng lặp đối tượng tham gia, đảm bảo 1 sinh viên chỉ nằm trong 1 đợt tại NH,HK
        let listLoaiHinhDaoTao = data.loaiHinhDaoTao.split(', '),
            listKhoa = data.khoa.split(', '),
            listKhoaSV = data.khoaSinhVien.split(', ');
        let checkLHDT = false,
            checkKhoa = false,
            checkKhoaSV = false;
        let listDot = await app.model.svDotDanhGiaDrl.getAll({ namHoc: data.namHoc, hocKy: data.hocKy }); //list đợt ĐRL đã tạo ở NH, HK này
        if (id) listDot = listDot.filter(e => e.id != id);
        if (listDot.length != 0) {
            for (let itemDot of listDot) {
                let listLHDT = itemDot.loaiHinhDaoTao.split(', '); //Kiểm tra Loại hình đào tạo có trùng!!
                for (let itemLHDT of listLHDT) {
                    let checkItem = listLoaiHinhDaoTao.includes(itemLHDT);
                    if (checkItem == true) {
                        checkLHDT = true;
                        break;
                    }
                }
                let listKDT = itemDot.khoa.split(', '); //Kiểm tra Khoa có trùng!!
                for (let itemKDT of listKDT) {
                    let checkItem = listKhoa.includes(itemKDT.toString());
                    if (checkItem == true) {
                        checkKhoa = true;
                        break;
                    }
                }
                let listKSV = itemDot.khoaSinhVien.split(', '); //Kiểm tra Khóa sinh viên có trùng!!
                for (let itemKSV of listKSV) {
                    let checkItem = listKhoaSV.includes(itemKSV.toString());
                    if (checkItem == true) {
                        checkKhoaSV = true;
                        break;
                    }
                }
                if (checkLHDT == true && checkKhoa == true && checkKhoaSV == true) {
                    throw 'Bị trùng đối tượng đánh giá với đợt ' + itemDot.ten;
                }
            }
        }
    };


    const checkTrongDot = (dataDot) => {
        const now = Date.now(),
            { ngayBatDau, ngayKetThuc } = getThoiGianDot(dataDot);
        return dataDot.kichHoat == 1 && (ngayBatDau <= now && now <= ngayKetThuc);
    };

    // app.readyHooks.add('addSocketListener:ActiveConfigDkhp', {
    //     ready: () => app.io && app.io.addSocketListener,
    //     run: () => app.io.addSocketListener('activeConfigDkhp', socket => {
    //         const user = app.io.getSessionUser(socket);
    //         user && user.permissions.includes('dtCauHinhDotDkhp:write') && socket.join('activeConfigDkhp');
    //     }),
    // });

    app.put('/api/ctsv/dot-danh-gia-drl', app.permission.check('ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            let id = req.body.id,
                changes = req.body.changes;
            const user = req.session.user.email, now = Date.now();
            let item = await app.model.svDotDanhGiaDrl.get({ id });
            if (checkTrongDot(item)) throw 'Hiện đang trong đợt đánh giá điểm rèn luyện';
            if (changes.active != null) {
                await app.model.svDotDanhGiaDrl.update({ id }, { active: changes.active, modifier: user, timeModified: now });
            } else {
                const { ngayKetThuc } = getThoiGianDot(item);
                if (ngayKetThuc != Infinity && ngayKetThuc != item.ngayKetThuc) {
                    await checkTrungLapDoiTuong(changes, id);
                }
                item = await app.model.svDotDanhGiaDrl.update({ id }, { ...changes, modifier: user, timeModified: now });
                // Nếu có sự thay đổi đến đối tượng sinh viên đánh giá, cập nhật lại dssv drl
                if (changes.check === 'true') {
                    let listLoaiHinhDaoTao = item.loaiHinhDaoTao.split(', '),
                        listKhoa = item.khoa.split(', '),
                        listKhoaSV = item.khoaSinhVien.split(', ');

                    await app.model.svDssvDotDanhGiaDrl.delete({ idDot: id });
                    let listSv = await app.model.dtCauHinhDotDkhp.getListStudents(app.utils.stringify({ listLoaiHinhDaoTao: listLoaiHinhDaoTao.toString(), listKhoa: listKhoa.toString(), listKhoaSV: listKhoaSV.toString() }));
                    await Promise.all(listSv.rows.map((sinhVien) => app.model.svDssvDotDanhGiaDrl.create({
                        idDot: id,
                        mssv: sinhVien.mssv,
                        kichHoat: sinhVien.tinhTrang == 1 ? 1 : 0,
                        modifier: req.session.user.email,
                        namHoc: item.namHoc,
                        hocKy: item.hocKy,
                        timeModified: Date.now(),
                    }).catch(error => app.consoleError(req, error))));
                }
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/dot-danh-gia-drl', app.permission.check('ctsvDotDanhGiaDrl:delete'), async (req, res) => {
        try {
            let id = req.body.id;
            await app.model.svDotDanhGiaDrl.delete({ id });
            await app.model.svDssvDotDanhGiaDrl.delete({ idDot: id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dssv-dot-danh-gia-drl/page/:pageNumber/:pageSize', app.permission.check('ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort, idDot = parseInt(req.query.idDot);
            sort && app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] });
            let page = await app.model.svDssvDotDanhGiaDrl.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm, idDot);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dssv-dot-danh-gia-drl', app.permission.check('ctsvDotDanhGiaDrl:write'), async (req, res) => {
        try {
            let data = req.body.item;
            await app.model.svDssvDotDanhGiaDrl.create(data);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/dssv-dot-danh-gia-drl/checkDuplicated', app.permission.check('ctsvDotDanhGiaDrl:write'), async (req, res) => {
        try {
            let { maSoSV, namHoc, hocKy } = req.query;
            let message = null,
                dataSinhVien = null;

            let items = await app.model.svDssvDotDanhGiaDrl.checkDuplicated(maSoSV, namHoc, hocKy).then(value => value.rows[0]);
            if (items) message = `Sinh viên đã có trong đợt đánh giá (${namHoc} HK${hocKy}): ${items.tenDot}`;
            else {
                dataSinhVien = await app.model.fwStudent.getData(maSoSV).then(value => value.rows[0]);
            }

            res.send({ items: { message, dataSinhVien } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dssv-dot-danh-gia-drl/list', app.permission.check('ctsvDotDanhGiaDrl:write'), async (req, res) => {
        try {
            let { data } = req.body;
            let { listSV, idDot } = data;
            listSV = listSV.split('; ');
            const dotData = await app.model.svDotDanhGiaDrl.get({ id: idDot });

            for (let item of listSV) {
                let data = {
                    idDot: idDot,
                    mssv: item,
                    kichHoat: 1,
                    modifier: req.session.user.email,
                    timeModified: Date.now(),
                    namHoc: dotData.namHoc,
                    hocKy: dotData.hocKy,
                };
                await app.model.svDssvDotDanhGiaDrl.create(data);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dssv-dot-danh-gia-drl', app.permission.check('ctsvDotDanhGiaDrl:write'), async (req, res) => {
        try {
            let { mssv, namHoc, hocKy } = req.body,
                item = req.body.changes;
            let changes = {
                kichHoat: item.kichHoat,
                modifier: req.session.user.email,
                timeModified: Date.now(),
            };
            let items = await app.model.svDssvDotDanhGiaDrl.update({ mssv, namHoc, hocKy }, changes);
            item.kichHoat = items.kichHoat;
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    //Gia han khoa API
    app.put('/api/ctsv/danh-gia-drl/gia-han/khoa', app.permission.orCheck('ctsvDotDanhGiaDrl:manage', 'staff:drl-manage'), async (req, res) => {
        try {
            const { changes, id } = req.body;
            if (changes.tinhTrang == 'A' || changes.tinhTrang == 'R') {
                changes.nguoiXuLy = req.session.user.email;
                const dssv = await app.model.svDrlDssvGiaHan.getAll({ idGiaHanKhoa: id });
                await app.model.svDrlGiaHanKhoa.notifyStudents({ tinhTrang: changes.tinhTrang, dsSinhVien: dssv.map(sv => sv.mssv) });
            }
            const item = await app.model.svDrlGiaHanKhoa.update({ id }, { ...changes, ngayDangKy: new Date().getTime() });
            const khoaInfo = await app.model.dmDonVi.get({ ma: item.maKhoa }, '*');
            if (item) {
                if (changes.dsSinhVien && changes.dsSinhVien.length) {
                    const listDeleted = [], listMssv = [];
                    changes.dsSinhVien.forEach(sv => (sv.isDelete == '1' ? listDeleted : listMssv).push(sv));
                    // Tach danh sach sinh vien thanh valid va invalid
                    await app.model.svDrlDssvGiaHan.delete({ idGiaHanKhoa: id });
                    await Promise.all([
                        // Reset Kiến nghị sinh viên bị loại
                        listDeleted.length ? app.model.svDrlKienNghiGiaHan.update({
                            statement: 'idGiaHan = :idGiaHan and mssv in (:listMssv)',
                            parameter: { idGiaHan: id, listMssv: listDeleted.map(sv => sv.mssv) }
                        }, { idGiaHan: null, tinhTrang: null, timeEnd: null }) : null,
                        changes.dsSinhVien.filter(sv => sv.isDelete != '1').map(sv => app.model.svDrlDssvGiaHan.create({
                            mssv: sv.mssv,
                            idGiaHanKhoa: item.id
                        }))
                    ]);
                }
                // CTSV chap nhan va cho ngay het han gia han
                if (changes.tinhTrang == 'A') {
                    // Reset diem nhung sinh vien moi duoc them vao danh (chua co timeEnd)
                    // Truong hop sinh vien bi anh huong do khoa dieu chinh danh sach hien co
                    const listSvGiaHan = await app.model.svDrlKienNghiGiaHan.getAll({
                        idGiaHan: item.id, timeEnd: null
                    });
                    listSvGiaHan && listSvGiaHan.length && (await app.model.svDrlDanhGia.resetDiem(listSvGiaHan.map(sv => sv.mssv), item.idDot));
                    //Set tinh trang va ngay het han cho sinh vien kien nghi nam trong ds
                    await app.model.svDrlKienNghiGiaHan.update({
                        idGiaHan: item.id
                    }, { tinhTrang: 'A', timeEnd: changes.timeEnd });
                }
                if (changes.tinhTrang == 'R') {
                    await app.model.svDrlKienNghiGiaHan.update({
                        idGiaHan: item.id
                    }, { tinhTrang: 'R', lyDoTuChoi: changes.lyDo });
                }
                await app.model.svDrlGiaHanKhoa.notifyCtsv({ tinhTrang: item.tinhTrang, nguoiDangKy: item.nguoiDangKy, tenKhoa: khoaInfo.ten });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // Kiến nghị API

    app.get('/api/ctsv/dot-danh-gia-drl/kien-nghi/all', app.permission.check('ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            const idDot = req.query.idDot,
                searchTerm = req.query.condition || '',
                canBo = req.session.user,
                now = Date.now(),
                listDonViQuanLy = canBo.staff.donViQuanLy.map(donVi => donVi.maDonVi),
                phanCapCanBo = await app.model.tccbDrlRole.get({ emailCanBo: canBo.email });
            const filter = {
                listFaculty: listDonViQuanLy.toString(),
                listKhoaSv: phanCapCanBo?.khoaSv,
                listHeSv: phanCapCanBo?.heSv
            };
            const thongTinDot = await app.model.svDotDanhGiaDrl.get({ id: idDot }) || {},
                { timeEndSv, timeEndLt, timeEndFaculty } = thongTinDot,
                timeEnd = Math.max(timeEndSv, timeEndLt, timeEndFaculty);

            const items = await app.model.svDrlKienNghiGiaHan.getData(idDot, app.utils.stringify(filter), searchTerm).then(rc => rc.rows);
            const newly = items.filter(item => !item.status),
                pending = items.filter(item => item.status == 'P'),
                handled = items.filter(item => item.status == 'A'),
                reject = items.filter(item => item.status == 'R');
            res.send({
                newly, pending, reject, handled,
                isInDot: now < timeEnd
            });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dot-danh-gia-drl/kien-nghi/chap-nhan', app.permission.check('ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            await app.model.svDrlKienNghiGiaHan.chapNhanKienNghi(req, req.body.data);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/dot-danh-gia-drl/gia-han', app.permission.check('ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            const { data } = req.body;
            await app.model.svDrlKienNghiGiaHan.giaHanSinhVien(req, data);
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/dot-danh-gia-drl/kien-nghi/tu-choi', app.permission.check('ctsvDotDanhGiaDrl:manage'), async (req, res) => {
        try {
            const { id, lyDoTuChoi } = req.body.data,
                user = req.session.user;
            const item = await app.model.svDrlKienNghiGiaHan.get({ id });
            // Loại sinh viên khỏi ds gia han khoa nếu có
            if (item.idGiaHan) {
                await app.model.svDrlDssvGiaHan.delete({ mssv: item.mssv, idGiaHanKhoa: item.idGiaHan });
            }
            await app.model.svDrlKienNghiGiaHan.update({ id }, {
                lyDoTuChoi, tinhTrang: 'R', timeHandle: Date.now(), staffHandle: user.email,
                timeEnd: null, timeStart: null
            });
            await app.model.svDrlGiaHanKhoa.notifyStudents({ tinhTrang: 'R', dsSinhVien: item.mssv });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};