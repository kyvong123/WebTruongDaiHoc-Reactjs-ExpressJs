module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7037: {
                title: 'Lịch sử đăng ký học phần', link: '/user/dao-tao/edu-schedule/lich-su', groupIndex: 1, parentKey: 7029,
                icon: 'fa-history', backgroundColor: '#E893CF'
            }
        }
    };

    app.permission.add(
        { name: 'dtLichSuDkhp:manage', menu },
        { name: 'dtLichSuDkhp:write' },
        { name: 'dtLichSuDkhp:delete' },
        { name: 'dtLichSuDkhp:export' }
    );

    const linkSoTienDinhPhi = async (listThaoTac) => {
        for (let thaoTac of listThaoTac) {
            const { mssv, maHocPhan, maMonHoc, tinChi: soTinChi, namHoc, hocKy, status, user, loaiDangKy } = thaoTac;
            const time = Date.now();
            const detailMonHoc = await app.model.dmMonHoc.get({ ma: maMonHoc });
            await app.model.tcHocPhiSubDetailLog.create({
                mssv, namHoc, hocKy,
                maMonHoc, maHocPhan,
                tenMonHoc: detailMonHoc?.ten, tongSoTiet: detailMonHoc?.tongTiet,
                soTinChi, timeModified: time, thaoTac: status, loaiDangKy, modifier: user
            });
        }
    };


    app.get('/user/dao-tao/edu-schedule/lich-su', app.permission.check('dtLichSuDkhp:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleDtLichSuDkhp', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtLichSuDkhp:manage', 'dtLichSuDkhp:write', 'dtLichSuDkhp:delete', 'dtLichSuDkhp:export');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // Excel Download ----------------------------------------------------------------------------------------------------------------------------------------
    const getFullDateTime = async (value) => {
        try {
            if (value == null || value == -1) return;
            const d = new Date(value);
            const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
            const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
            const year = d.getFullYear();
            const hours = ('0' + d.getHours()).slice(-2);
            const minutes = ('0' + d.getMinutes()).slice(-2);
            return `${date}/${month}/${year}  ${hours}:${minutes} `;
        } catch (error) {
            return error;
        }
    };

    const getThaoTac = async (value) => {
        try {
            if (value == 'A') return 'Đăng ký mới';
            else if (value == 'D') return 'Hủy đăng ký';
            else if (value == 'H') return 'Hoàn tác';
            else return 'Chuyển lớp';
        } catch (error) {
            return error;
        }
    };

    const getGhiChu = async (value, item) => {
        try {
            if (value == 'C') return `Sinh viên được chuyển từ lớp học phần ${item.ghiChu}`;
            else if (value != 'A' && value != 'D' && value != 'H') return item.thaoTac;
            else return item.ghiChu;
        } catch (error) {
            return error;
        }
    };

    const getCells = async (filter) => {
        try {
            let list = await app.model.dtLichSuDkhp.timeDownload(filter);

            let cells = [
                { cell: 'A1', value: 'MSSV', bold: true, border: '1234' },
                { cell: 'B1', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
                { cell: 'C1', value: 'MÃ HỌC PHẦN', bold: true, border: '1234' },
                { cell: 'D1', value: 'MÃ MÔN HỌC', bold: true, border: '1234' },
                { cell: 'E1', value: 'TÊN MÔN', bold: true, border: '1234' },
                { cell: 'F1', value: 'NGƯỜI THAO TÁC', bold: true, border: '1234' },
                { cell: 'G1', value: 'THỜI GIAN THAO TÁC', bold: true, border: '1234' },
                { cell: 'H1', value: 'THAO TÁC', bold: true, border: '1234' },
                { cell: 'I1', value: 'GHI CHÚ', bold: true, border: '1234' },
            ];

            for (let [index, item] of list.rows.entries()) {
                let thoiGianDangKy = await getFullDateTime(item.timeModified);
                let thaoTac = await getThaoTac(item.thaoTac);
                let ghiChu = await getGhiChu(item.thaoTac, item);

                cells.push({ cell: 'A' + (index + 2), border: '1234', value: item.mssv });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.hoTen });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.maHocPhan });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.maMonHoc });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi });
                cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.userModified });
                cells.push({ cell: 'G' + (index + 2), border: '1234', value: thoiGianDangKy });
                cells.push({ cell: 'H' + (index + 2), border: '1234', value: thaoTac });
                cells.push({ cell: 'I' + (index + 2), border: '1234', value: ghiChu });
            }
            return cells;
        } catch (error) {
            return error;
        }
    };


    app.get('/api/dt/lich-su-dang-ky/download', app.permission.check('dtLichSuDkhp:export'), async (req, res) => {
        try {
            let { ngayBatDau, ngayKetThuc } = req.query;

            const workBook = app.excel.create(),
                workSheetTong = workBook.addWorksheet('Lich_su_tong'),
                workSheetMoi = workBook.addWorksheet('Lich_su_dang_ky_moi'),
                workSheetHuy = workBook.addWorksheet('Lich_su_huy_dang_ky'),
                workSheetChuyen = workBook.addWorksheet('Lich_su_chuyen_hoc_phan'),
                workSheetHoanTac = workBook.addWorksheet('Lich_su_hoan_tac');

            let cellsTong = await getCells(app.utils.stringify(app.clone({ ngayBatDau, ngayKetThuc }))),
                cellsMoi = await getCells(app.utils.stringify(app.clone({ ngayBatDau, ngayKetThuc, thaoTac: 'A' }))),
                cellsHuy = await getCells(app.utils.stringify(app.clone({ ngayBatDau, ngayKetThuc, thaoTac: 'D' }))),
                cellsChuyen = await getCells(app.utils.stringify(app.clone({ ngayBatDau, ngayKetThuc, thaoTac: 'C' }))),
                cellsHoanTac = await getCells(app.utils.stringify(app.clone({ ngayBatDau, ngayKetThuc, thaoTac: 'H' })));

            app.excel.write(workSheetTong, cellsTong);
            app.excel.write(workSheetMoi, cellsMoi);
            app.excel.write(workSheetHuy, cellsHuy);
            app.excel.write(workSheetChuyen, cellsChuyen);
            app.excel.write(workSheetHoanTac, cellsHoanTac);

            ngayBatDau = await getFullDateTime(parseInt(ngayBatDau));
            ngayKetThuc = await getFullDateTime(parseInt(ngayKetThuc));

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lich-su-dang-ky/page/:pageNumber/:pageSize', app.permission.orCheck('dtLichSuDkhp:manage', 'staff:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichSuDkhp.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lich-su-dang-ky/dash-board/:pageNumber/:pageSize', app.permission.check('dtLichSuDkhp:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichSuDkhp.timeSearchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/lich-su-dang-ky', app.permission.check('developer:login'), async (req, res) => {
        try {
            let id = req.body.id;
            await app.model.dtLichSuDkhp.delete({ id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/lich-su-dang-ky/hoan-tac-xoa', app.permission.check('dtLichSuDkhp:manage'), async (req, res) => {
        try {
            let data = req.body.data, user = req.session.user,
                { mssv, maHocPhan, thaoTac, namHoc, hocKy } = data,
                listCheck = [];
            let email = user.email;
            email = email.split('@');
            email = email[0];
            if (thaoTac == 'D') {

                let hocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan });
                let monHoc = await app.model.dmMonHoc.get({ ma: hocPhan.maMonHoc });

                hocPhan.tenMonHoc = monHoc?.ten;
                let sinhVien = await app.model.fwStudent.get({ mssv }, 'mssv, ho, ten, khoa, loaiHinhDaoTao, namTuyenSinh');


                let message = await checkDKHP(sinhVien, hocPhan, '0');
                if (message.isDangKy) {
                    let time = Date.now(),
                        tenMonHoc = app.utils.parse(message.tenMonHoc, { vi: '' })?.vi;

                    let data = {
                        mssv: mssv,
                        maHocPhan: maHocPhan,
                        modifier: user.email,
                        timeModified: time,
                        maMonHoc: message.maMonHoc,
                        maLoaiDky: message.maLoaiDKy,
                        loaiMonHoc: message.loaiMonHoc,
                        tinhPhi: 1,
                        namHoc, hocKy
                    };
                    await app.model.dtDangKyHocPhan.create(data);

                    let dataLS = {
                        mssv, maHocPhan,
                        userModified: email,
                        timeModified: time,
                        thaoTac: 'H',
                        ghiChu: `Hoàn tác hủy đăng ký học phần ${maHocPhan}`,
                        namHoc, hocKy, tenMonHoc
                    };
                    await app.model.dtLichSuDkhp.create(dataLS);

                    await app.model.dtDangKyHocPhan.notify({ maHocPhan, mssv, thaoTac: 'H' });

                    let check = {
                        mssv, maHocPhan,
                        maMonHoc: message.maMonHoc,
                        tenMonHoc: message.tenMonHoc,
                        tinChi: monHoc?.tongTinChi,
                        soTiet: monHoc?.tongTiet,
                        namHoc, hocKy,
                        status: 'I',
                        user: user.email,
                        loaiDangKy: message.maLoaiDKy
                    };
                    listCheck.push(check);

                } else throw message.ghiChu;
            }
            await linkSoTienDinhPhi(listCheck);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/lich-su-dang-ky/hoan-tac-chuyen', app.permission.check('dtLichSuDkhp:manage'), async (req, res) => {
        try {
            let data = req.body.data, user = req.session.user,
                { mssv, thaoTac, namHoc, hocKy } = data,
                curMaHocPhan = data.maHocPhan,
                oldMaHocPhan = data.ghiChu,
                listCheck = [];
            let email = user.email;
            email = email.split('@');
            email = email[0];
            if (thaoTac == 'C') {

                let hocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan: oldMaHocPhan });
                let monHoc = await app.model.dmMonHoc.get({ ma: hocPhan.maMonHoc });
                hocPhan.tenMonHoc = monHoc?.ten;

                let dk = await app.model.dtDangKyHocPhan.get({ maHocPhan: curMaHocPhan, mssv }),
                    itemHocPhan = null;
                if (dk) itemHocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan: dk.maHocPhan }, 'maMonHoc, loaiHinhDaoTao');

                if (dk && dk.maMonHoc == hocPhan.maMonHoc && itemHocPhan.loaiHinhDaoTao == hocPhan.loaiHinhDaoTao) {
                    let time = Date.now();
                    await app.model.dtDangKyHocPhan.update({ maHocPhan: curMaHocPhan, mssv }, {
                        maHocPhan: oldMaHocPhan,
                        modifier: user.email,
                        timeModified: time,
                    });

                    let dataLS = {
                        mssv,
                        maHocPhan: oldMaHocPhan,
                        userModified: email,
                        timeModified: time,
                        thaoTac: 'H',
                        ghiChu: `Hoàn tác chuyển lớp học phần ${curMaHocPhan}`,
                        namHoc, hocKy,
                        tenMonHoc: app.utils.parse(hocPhan.tenMonHoc, { vi: '' })?.vi
                    };
                    await app.model.dtLichSuDkhp.create(dataLS);

                    await app.model.dtDangKyHocPhan.notify({ maHocPhan: curMaHocPhan, modifier: user.lastName + ' ' + user.firstName, mssv, thaoTac: 'H' });

                    let checkMoi = {
                        mssv,
                        maHocPhan: oldMaHocPhan,
                        maMonHoc: hocPhan.maMonHoc,
                        tenMonHoc: hocPhan.tenMonHoc,
                        tinChi: monHoc?.tongTinChi,
                        soTiet: monHoc?.tongTiet,
                        namHoc, hocKy,
                        status: 'I',
                        user: user.email,
                        loaiDangKy: dk.maLoaiDky
                    };
                    listCheck.push(checkMoi);
                    let checkCu = {
                        mssv,
                        maHocPhan: curMaHocPhan,
                        maMonHoc: hocPhan.maMonHoc,
                        tenMonHoc: hocPhan.tenMonHoc,
                        tinChi: monHoc?.tongTinChi,
                        soTiet: monHoc?.tongTiet,
                        namHoc, hocKy,
                        status: 'D',
                        user: user.email,
                        loaiDangKy: dk.maLoaiDky
                    };
                    listCheck.push(checkCu);

                } else {
                    let sinhVien = await app.model.fwStudent.get({ mssv }, 'mssv, ho, ten, khoa, loaiHinhDaoTao, namTuyenSinh');
                    let message = await checkDKHP(sinhVien, hocPhan, 0);
                    if (message.isDangKy) {
                        let time = Date.now(),
                            tenMonHoc = app.utils.parse(message.tenMonHoc, { vi: '' })?.vi;

                        await app.model.dtDangKyHocPhan.delete({ maHocPhan: curMaHocPhan, mssv });

                        let data = {
                            mssv,
                            maHocPhan: oldMaHocPhan,
                            modifier: user.email,
                            timeModified: time,
                            maMonHoc: message.maMonHoc,
                            maLoaiDky: message.maLoaiDKy,
                            loaiMonHoc: message.loaiMonHoc,
                            tinhPhi: dk?.tinhPhi || 1,
                            namHoc, hocKy
                        };
                        await app.model.dtDangKyHocPhan.create(data);

                        let dataLS = {
                            mssv,
                            maHocPhan: oldMaHocPhan,
                            userModified: email,
                            timeModified: time,
                            thaoTac: 'H',
                            ghiChu: `Hoàn tác chuyển lớp học phần ${curMaHocPhan}`,
                            namHoc, hocKy, tenMonHoc
                        };
                        await app.model.dtLichSuDkhp.create(dataLS);

                        await app.model.dtDangKyHocPhan.notify({ maHocPhan: curMaHocPhan, mssv, thaoTac: 'H' });

                        let checkMoi = {
                            mssv,
                            maHocPhan: oldMaHocPhan,
                            maMonHoc: message.maMonHoc,
                            tenMonHoc: message.tenMonHoc,
                            tinChi: monHoc?.tongTinChi,
                            soTiet: monHoc?.tongTiet,
                            namHoc, hocKy,
                            status: 'I',
                            user: user.email,
                            loaiDangKy: message.maLoaiDKy
                        };
                        listCheck.push(checkMoi);
                        let monHocCu = await app.model.dmMonHoc.get({ ma: dk.maMonHoc });
                        let checkCu = {
                            mssv,
                            maHocPhan: curMaHocPhan,
                            maMonHoc: monHocCu.ma,
                            tenMonHoc: monHocCu?.ten,
                            tinChi: monHocCu?.tongTinChi,
                            soTiet: monHocCu?.tongTiet,
                            namHoc, hocKy,
                            status: 'D',
                            user: user.email,
                            loaiDangKy: dk.maLoaiDky
                        };
                        listCheck.push(checkCu);

                    } else throw message.ghiChu;
                }
            }
            await linkSoTienDinhPhi(listCheck);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    const checkDKHP = async (sinhVien, hocPhan, siSo) => {
        try {
            let message = {
                maHocPhan: hocPhan.maHocPhan,
                mssv: sinhVien.mssv,
                hoTen: sinhVien.ho + ' ' + sinhVien.ten,
                maMonHoc: hocPhan.maMonHoc,
                tenMonHoc: hocPhan.tenMonHoc,
                isDangKy: false,            //isDangKy (đk thành công : đk thất bại)
                isCheck: false,             //dùng để checkbox trong modal dự kiến
                ghiChu: null,
                maLoaiDKy: null,
                loaiMonHoc: null,
            };
            let items = await app.model.dtDangKyHocPhan.getAll({ mssv: sinhVien.mssv });//list HP SV da hoc
            if (items.length == 0) {//chua co hoc phan nao
                message.isDangKy = true;
            } else {
                let flag = 0;
                for (let item of items) {
                    let itemHocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan: item.maHocPhan }, 'maMonHoc, namHoc, hocKy, loaiHinhDaoTao');
                    if (itemHocPhan != null) {
                        if (hocPhan.namHoc == itemHocPhan.namHoc && hocPhan.hocKy == itemHocPhan.hocKy) {//check nam hoc, hoc ky
                            if (hocPhan.maMonHoc == itemHocPhan.maMonHoc && hocPhan.loaiHinhDaoTao == itemHocPhan.loaiHinhDaoTao) {//trùng Hp đã đk học kì này!!
                                flag = 1;
                                message.isDangKy = false;
                                message.ghiChu = 'Môn đã đăng ký trong HK này';
                                break;
                            } else if (hocPhan.maMonHoc == itemHocPhan.maMonHoc) { //trùng HP đã đk học kì này ở hệ khác!!
                                flag = 2;
                                message.isDangKy = true;
                                message.ghiChu = 'Đã đăng ký môn học ở hệ ' + hocPhan.loaiHinhDaoTao;
                            }
                        }
                    }
                }
                if (flag == 0) message.isDangKy = true;
            }

            if (message.isDangKy == true) message = await checkCTDT(sinhVien, hocPhan, message);
            if (message.isDangKy == true) {
                message.isCheck = true;
                let slDuKien = parseInt(hocPhan.soLuongDuKien);
                if (siSo >= slDuKien) message.ghiChu = message.ghiChu ? message.ghiChu + ', lớp đã đầy sĩ số' : 'Lớp đã đầy sĩ số';
            }
            return message;
        } catch (error) {
            return error;
        }
    };

    const checkCTDT = async (sinhVien, hocPhan, message) => {
        try {
            let chDiem = await app.model.dtCauHinhDiem.getAll();
            let chDiemRot = chDiem.filter(e => e.key == 'rotMon');
            let chDiemCtMin = chDiem.filter(e => e.key == 'caiThienMin');
            let chDiemCtMax = chDiem.filter(e => e.key == 'caiThienMax');
            // let chDiemCtHk = chDiem.filter(e => e.key == 'caiThienHK');

            if (sinhVien.loaiHinhDaoTao == hocPhan.loaiHinhDaoTao) {
                let listCTDT = await app.model.dtDangKyHocPhan.getListCtdt(app.utils.stringify({ mssvFilter: sinhVien.mssv }));
                listCTDT = listCTDT.rows;
                if (listCTDT.length != 0) {
                    listCTDT = listCTDT.filter(ctdt => ctdt.maMonHoc == hocPhan.maMonHoc);//check môn học có trong ctdt không
                    if (listCTDT.length == 1) {
                        let monCTDT = listCTDT[0];
                        message.loaiMonHoc = monCTDT.loaiMonHoc;

                        //check trong-ngoai KH
                        if (monCTDT.namHocDuKien == hocPhan.namHoc && monCTDT.hocKyDuKien == hocPhan.hocKy) {//check học phần có theo kế hoạch không
                            message.maLoaiDKy = 'KH';
                        } else if ((monCTDT.namHocDuKien == hocPhan.namHoc && monCTDT.hocKyDuKien > hocPhan.hocKy) || monCTDT.namHocDuKien >= hocPhan.namHoc) {
                            message.maLoaiDKy = 'HV';
                        } else message.maLoaiDKy = 'NKH';

                        //checkTienQuyet
                        let monTienQuyet = monCTDT.monTienQuyet;
                        if (monTienQuyet != null) {
                            monTienQuyet = monTienQuyet.split(';');
                            for (let mon of monTienQuyet) {
                                mon = mon.split(':');
                                if (mon[1] == '') {
                                    if (message.isDangKy == false) {
                                        message.ghiChu = message.ghiChu ? message.ghiChu + ', Chưa học môn tiên quyết ' + mon[0] : 'Chưa học môn tiên quyết ' + mon[0];
                                    } else message.ghiChu = 'Chưa học môn tiên quyết ' + mon[0];
                                    message.isDangKy = false;
                                }
                                else if (mon[1] < chDiemRot[0].value) {
                                    if (message.isDangKy == false) {
                                        message.ghiChu = message.ghiChu ? message.ghiChu + ', Chưa học môn tiên quyết ' + mon[0] : 'Chưa học môn tiên quyết ' + mon[0];
                                    } else message.ghiChu = 'Chưa học môn tiên quyết ' + mon[0];
                                    message.isDangKy = false;
                                }
                            }
                        }

                        //checkHocLai-CaiThien
                        if (message.isDangKy == true) {
                            let diemMonCtdt = monCTDT.maxDiemTK;
                            if (diemMonCtdt != null) {
                                if (diemMonCtdt < chDiemRot[0].value) message.maLoaiDKy = 'HL';
                                else if (chDiemCtMin[0].value <= diemMonCtdt && diemMonCtdt < chDiemCtMax[0].value) message.maLoaiDKy = 'CT';
                                else if ((diemMonCtdt >= chDiemCtMax[0].value) || (chDiemRot[0].value <= diemMonCtdt && diemMonCtdt < chDiemCtMin[0].value)) {
                                    message.maLoaiDKy = 'CT';
                                    message.isDangKy = false;
                                    message.ghiChu = 'Không đủ điều kiện học cải thiện';
                                }
                            }
                        }
                    }
                }
            } else message.maLoaiDKy = 'NCTDT';
            if (message.maLoaiDKy == 'NCTDT' || message.maLoaiDKy == null) {
                message.maLoaiDKy = 'NCTDT';
                message.loaiMonHoc = 1;
            }
            return message;
        } catch (error) {
            return error;
        }
    };
};
