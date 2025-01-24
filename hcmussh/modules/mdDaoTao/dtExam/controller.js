module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7003: {
                title: 'Lịch thi', groupIndex: 0, parentKey: 7029,
                link: '/user/dao-tao/lich-thi', icon: 'fa-pencil', backgroundColor: '#3F979B'
            }
        }
    };
    app.permission.add(
        { name: 'dtExam:manage', menu },
        { name: 'dtExam:read', menu },
        'dtExam:write',
        'dtExam:delete',
        'dtExam:import',
        'dtExam:export',
    );
    app.permissionHooks.add('staff', 'addRolesDtExam', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtExam:manage', 'dtExam:write', 'dtExam:delete', 'dtExam:import', 'dtExam:export');
            resolve();
        } else resolve();
    }));
    app.readyHooks.add('addSocketListener:ImportLichThiExcel', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ImportLichThiExcel', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('dtExam:import') && socket.join('ImportLichThiExcel');
        }),
    });
    app.get('/user/dao-tao/lich-thi', app.permission.orCheck('dtExam:manage', 'dtExam:read'), app.templates.admin);
    app.get('/user/dao-tao/lich-thi/edit/:maHocPhan', app.permission.orCheck('dtExam:manage', 'dtExam:read'), app.templates.admin);
    app.get('/user/dao-tao/lich-thi/import', app.permission.check('dtExam:import'), app.templates.admin);
    app.get('/user/dao-tao/lich-thi/hoan-cam-import', app.permission.check('dtExam:import'), app.templates.admin);

    // API -------------------------------------------------------------------------------------
    app.get('/api/dt/exam/page/:pageNumber/:pageSize', app.permission.orCheck('dtExam:manage', 'dtExam:read'), async (req, res) => {
        try {
            const { pageNumber: _pageNumber, pageSize: _pageSize } = req.params;
            let { condition, filter } = req.query, sort = filter.sort;
            filter.ks_ngayThi = parseInt(filter.ks_ngayThi);
            filter.ks_thoiGianCongBo = parseInt(filter.ks_thoiGianCongBo);
            filter.current = Date.now();

            await app.model.dtAssignRole.getDataRole('dtExam', req.session.user, filter);

            let searchFilter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.dtExam.searchPage(parseInt(_pageNumber), parseInt(_pageSize), searchFilter, condition);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows } = page;
            const pageCondition = condition;
            let list = rows.map(item => {
                let ngayThi = new Date(item.batDau).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                    batDau = new Date(item.batDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    ketThuc = new Date(item.ketThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    ngayCongBo = '', gioCongBo = '',
                    tpDiem = item.tpHocPhan || item.tpMonHoc || item.configDefault;

                if (item.thoiGianCongBo) {
                    ngayCongBo = new Date(item.thoiGianCongBo).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
                    gioCongBo = new Date(item.thoiGianCongBo).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                }
                return {
                    ...item, ngayThi, gioThi: `${batDau} - ${ketThuc}`, ngayCongBo: ngayCongBo ? `${ngayCongBo} - ${gioCongBo}` : '',
                    tpDiem: tpDiem ? app.utils.parse(tpDiem) : [],
                };
            });
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/dinh-chi-thi/page/:pageNumber/:pageSize', app.permission.orCheck('dtExam:manage', 'dtDiemHoan:write', 'dtExam:read'), async (req, res) => {
        try {
            const { pageNumber: _pageNumber, pageSize: _pageSize } = req.params;
            let { condition, filter } = req.query, sort = filter.sort;
            let searchFilter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.dtDinhChiThi.searchPage(parseInt(_pageNumber), parseInt(_pageSize), searchFilter, condition);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: condition, list: rows } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/item/:maHocPhan', app.permission.orCheck('dtExam:manage', 'dtExam:read'), async (req, res) => {
        try {
            const { maHocPhan } = req.params;
            let items = await app.model.dtExam.getAll({ maHocPhan }, '*', 'loaiKyThi,caThi,phong');
            const monHoc = await app.model.dmMonHoc.get({ ma: items[0].maMonHoc }, 'ten');
            const kyThi = await app.model.dtDiemDmLoaiDiem.getAll({ isThi: 1 });
            const hinhThucThi = await app.model.dtDiemConfigHocPhan.getAll({ maHocPhan });
            items = items.map(item => {
                let ngayThi = new Date(item.batDau).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                    batDau = new Date(item.batDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    ketThuc = new Date(item.ketThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    gioThi = `${batDau} - ${ketThuc}`;
                return {
                    ...item, tenMonHoc: monHoc?.ten || '', tenKyThi: kyThi.find(ky => ky.ma == item.loaiKyThi)?.ten,
                    tenHinhThuc: hinhThucThi?.find(hinhThuc => hinhThuc.loaiThanhPhan == item.loaiKyThi)?.hinhThucThi, ngayThi, gioThi
                };
            });

            for (let item of items) {
                let { maHocPhan, caThi, phong, loaiKyThi } = item;
                const exam = await app.model.dtExam.get({ maHocPhan, caThi, phong, loaiKyThi }, 'id');
                let listGiamThi = await app.model.dtExamGiamThi.getAll({ idExam: exam.id });
                listGiamThi = listGiamThi.map(item => item.giamThi).join(',');
                item.listGiamThi = listGiamThi;
            }
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/exam', app.permission.check('dtExam:delete'), async (req, res) => {
        try {
            let { maHocPhan, filter } = req.body,
                { namHoc, hocKy, kyThi } = filter;

            const existDiem = await app.model.dtDiemAll.get({ maHocPhan, namHoc, hocKy, loaiDiem: kyThi });

            if (existDiem) throw { message: 'Học phần đã có điểm!' };

            const items = await app.model.dtExam.getAll({ maHocPhan, namHoc, hocKy, loaiKyThi: kyThi }, 'id', 'id');
            for (let item of items) {
                await Promise.all([
                    app.model.dtExam.delete({ id: item.id }),
                    app.model.dtExamDanhSachSinhVien.delete({ idExam: item.id }),
                    app.model.dtExamGiamThi.delete({ idExam: item.id }),
                ]);
            }

            await Promise.all([
                app.model.dtAssignRoleNhapDiem.delete({ maHocPhan, kyThi }),
                app.model.dtDiemCodeFile.delete({ maHocPhan, kyThi }),
            ]);

            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/sinh-vien', app.permission.orCheck('dtExam:manage', 'dtExam:read'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.stringify(filter);
            const [items, newItems] = await Promise.all([
                app.model.dtExam.getSinhVien(filter),
                app.model.dtExam.getNew(filter)
            ]);

            res.send({ items: items.rows, newItems: newItems.rows });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/sinh-vien-dang-ky', app.permission.orCheck('dtExam:manage', 'dtExam:read'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.stringify(filter);
            const items = await app.model.dtExam.getSinhVienDangKy(filter);
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/sinh-vien-hoan-thi', app.permission.orCheck('dtExam:manage', 'dtExam:read'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter.hocKy = Number(filter.hocKy);

            const items = await app.model.dtDinhChiThi.getSvHoanThi(app.utils.stringify(filter));
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/exam/sinh-vien-hoan-thi', app.permission.check('dtExam:manage'), async (req, res) => {
        try {
            let { listSv, phongThi } = req.body;
            for (let sv of listSv) {
                let soLuong = await app.model.dtExamDanhSachSinhVien.count({ idExam: phongThi.id }),
                    modifier = req.session.user.email, timeModified = Date.now();
                soLuong = soLuong.rows[0]['COUNT(*)'];
                const hoanThi = await app.model.dtDinhChiThi.update({ mssv: sv.mssv, maHocPhan: sv.maHocPhanHoan, loaiDinhChi: 'HT', kyThi: phongThi.loaiKyThi }, { isThi: 1, idExam: phongThi.id, maHocPhanThi: phongThi.maHocPhan, userModified: modifier, timeModified });
                await app.model.dtExamDanhSachSinhVien.create({
                    idExam: phongThi.id, mssv: sv.mssv, stt: soLuong + 1,
                    modifier, timeModified, namHoc: phongThi.namHoc, hocKy: phongThi.hocKy,
                    ghiChu: `Sinh viên hoãn thi học phần ${sv.maHocPhanHoan}`, idDinhChiThi: hoanThi.id
                });
                await app.model.dtDiemAll.update({ mssv: sv.mssv, maHocPhan: sv.maHocPhanHoan, loaiDiem: phongThi.loaiKyThi }, { timeLock: '', isLock: '' });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/phong-thi', app.permission.orCheck('dtExam:manage', 'dtExam:read'), async (req, res) => {
        try {
            let { filter } = req.query;
            let items = await app.model.dtExam.getAll({
                statement: '(:maMonHoc IS NULL OR maMonHoc = :maMonHoc) AND (:idExam IS NULL OR id != :idExam) AND loaiKyThi = :kyThi',
                parameter: filter
            }, '*', 'maHocPhan,caThi,phong');
            for (let item of items) {
                let soLuong = await app.model.dtExamDanhSachSinhVien.count({ idExam: item.id });
                soLuong = soLuong.rows[0]['COUNT(*)'];
                item.soLuong = soLuong;
            }
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/giam-thi', app.permission.orCheck('dtExam:manage', 'dtCanBoNgoaiTruong:manage', 'dtExam:read'), async (req, res) => {
        try {
            let searchTerm = req.query.searchTerm || '',
                filter = req.query.filter;
            const items = await app.model.dtExam.getGiamThi(searchTerm, app.utils.stringify(filter));
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/exam/sinh-vien', app.permission.check('dtExam:manage'), async (req, res) => {
        try {
            let { sinhVien, change } = req.body,
                { mssv, hocPhan: maHocPhan, caThi, maKyThi: loaiKyThi } = sinhVien;
            const exam = await app.model.dtExam.get({ maHocPhan, caThi, loaiKyThi }, 'id');
            const item = await app.model.dtExamDanhSachSinhVien.update({ mssv, idExam: exam.id }, change);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/exam/dinh-chi-thi-sinh-vien', app.permission.check('dtExam:manage'), async (req, res) => {
        try {
            let { listSV } = req.body;
            for (let sv of listSV) {
                await app.model.dtDinhChiThi.create({ ...sv, userModified: req.session.user.email, timeModified: Date.now() });
                if (sv.loaiDinhChi == 'CT') {
                    app.notification.send({
                        toEmail: `${sv.mssv.toLowerCase()}@hcmussh.edu.vn`, title: `Bạn đã bị cấm thi học phần ${sv.maHocPhan}`, iconColor: 'danger',
                        subTitle: `Lý do: ${sv.ghiChu}`,
                    });
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/exam/dinh-chi-thi-sinh-vien', app.permission.check('dtExam:manage'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.dtDinhChiThi.delete({ id });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/exam/sinh-vien-phong-thi', app.permission.check('dtExam:manage'), async (req, res) => {
        try {
            let { listSV, listPhong } = req.body,
                { phongCurr, phongChuyen } = listPhong,
                modifier = req.session.user.email,
                timeModified = Date.now();
            for (let sinhVien of listSV) {
                await app.model.dtExamDanhSachSinhVien.update({ mssv: sinhVien.mssv, idExam: Number(phongCurr.id) }, { idExam: Number(phongChuyen.id) });
                await app.model.dtExamLichSuDssv.create({
                    mssv: sinhVien.mssv, oldIdExam: Number(phongCurr.id), newIdExam: Number(phongChuyen.id),
                    namHoc: phongCurr.namHoc, hocKy: phongCurr.hocKy,
                    userModified: modifier, timeModified
                });
            }
            let svPhongCurr = await app.model.dtExamDanhSachSinhVien.getAll({ idExam: Number(phongCurr.id) }, '*', 'mssv'),
                svPhongChuyen = await app.model.dtExamDanhSachSinhVien.getAll({ idExam: Number(phongChuyen.id) }, '*', 'mssv');

            for (let [index, sinhVien] of svPhongCurr.entries()) {
                await app.model.dtExamDanhSachSinhVien.update({ idExam: sinhVien.idExam, mssv: sinhVien.mssv }, { stt: index + 1, modifier, timeModified });
            }

            for (let [index, sinhVien] of svPhongChuyen.entries()) {
                await app.model.dtExamDanhSachSinhVien.update({ idExam: sinhVien.idExam, mssv: sinhVien.mssv }, { stt: index + 1, modifier, timeModified });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/exam/sinh-vien-bo-sung', app.permission.check('dtExam:manage'), async (req, res) => {
        try {
            let { listSV, phongGan } = req.body,
                { namHoc, hocKy } = phongGan,
                modifier = req.session.user.email,
                timeModified = Date.now();
            for (let sinhVien of listSV) {
                await app.model.dtExamDanhSachSinhVien.create({ mssv: sinhVien.mssv, idExam: Number(phongGan.id), modifier, timeModified, namHoc, hocKy });
                await app.model.dtExamLichSuDssv.create({
                    mssv: sinhVien.mssv, oldIdExam: '', newIdExam: Number(phongGan.id),
                    namHoc, hocKy, userModified: modifier, timeModified
                });
            }
            let svPhong = await app.model.dtExamDanhSachSinhVien.getAll({ idExam: Number(phongGan.id) }, '*', 'mssv');

            for (let [index, sinhVien] of svPhong.entries()) {
                await app.model.dtExamDanhSachSinhVien.update({ idExam: sinhVien.idExam, mssv: sinhVien.mssv }, { stt: index + 1, modifier, timeModified });
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/exam/thoi-gian-cong-bo', app.permission.check('dtExam:manage'), async (req, res) => {
        try {
            let { listHP, filter, change } = req.body,
                { thoiGianCongBo } = change;
            for (let hocPhan of listHP) {
                let { maHocPhan } = hocPhan,
                    { namHoc, hocKy, kyThi: loaiKyThi } = filter;
                const items = await app.model.dtExam.getAll({ maHocPhan, namHoc, hocKy, loaiKyThi });
                if (items.length) {
                    for (let item of items) {
                        await app.model.dtExam.update({ id: item.id }, { thoiGianCongBo });
                    }
                } else continue;
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/exam/multiple', app.permission.check('dtExam:write'), async (req, res) => {
        try {
            let { items, dssv, filter } = req.body,
                { email: modifier } = req.session.user;
            const { namHoc, hocKy } = filter;
            const { ma } = await app.model.dtSemester.get({ namHoc, hocKy }, '*'), timeModified = Date.now();
            items = app.utils.parse(items);
            let dssvTong = app.utils.parse(dssv);
            for (let item of items) {
                const { maMonHoc, maHocPhan, phong, coSo, batDau, ketThuc, loaiKyThi, caThi, hinhThucThi } = item;
                let phongThi = await app.model.dtExam.getAll({
                    statement: 'maHocPhan = :maHocPhan AND loaiKyThi = :loaiKyThi AND timeModified < :timeModified',
                    parameter: { maHocPhan, loaiKyThi, timeModified }
                }, 'id', 'id');
                if (phongThi.length) {
                    for (let item of phongThi) {
                        await app.model.dtExam.delete({ id: item.id });
                        await app.model.dtExamDanhSachSinhVien.delete({ idExam: item.id });
                        await app.model.dtExamGiamThi.delete({ idExam: item.id });
                    }
                }
                const create = await app.model.dtExam.create({
                    maMonHoc, maHocPhan, phong, coSo, batDau, ketThuc, loaiKyThi,
                    caThi, hinhThucThi, idSemester: ma, namHoc, hocKy, modifier, timeModified
                });

                if (item.shccGiamThi && item.shccGiamThi.length) {
                    await Promise.all(item.shccGiamThi.map(giamThi => app.model.dtExamGiamThi.create({ idExam: create.id, giamThi, batDau, ketThuc, modifier, timeModified })));
                }

                let dssv = dssvTong.filter(sv => sv.maHocPhan == maHocPhan && sv.caThi == caThi && sv.phong == phong);
                for (let item of dssv) {
                    let { mssv, isThanhToan, stt, namHoc, hocKy } = item;
                    await app.model.dtExamDanhSachSinhVien.create({
                        idExam: create.id, mssv, isThanhToan: Number(isThanhToan), stt, namHoc, hocKy,
                        modifier, timeModified, isExported: 0
                    });
                }

                const listAssign = await app.model.dtAssignRoleNhapDiem.getAll({ maHocPhan, maMonHoc, kyThi: loaiKyThi });
                await Promise.all([
                    app.model.dtAssignRoleNhapDiem.delete({ maHocPhan, maMonHoc, kyThi: loaiKyThi }),
                    app.model.dtDiemCodeFile.delete({ maHocPhan, maMonHoc, kyThi: loaiKyThi })
                ]);

                let dataAssign = await app.model.dtAssignRoleNhapDiem.parseData({ namHoc, hocKy, maHocPhan });
                for (const item of dataAssign.filter(i => i.thanhPhan && i.thanhPhan == loaiKyThi)) {
                    await Promise.all(listAssign.map(ass => app.model.dtAssignRoleNhapDiem.create({ ...item, kyThi: item.thanhPhan, userModified: modifier, timeModified: Date.now(), shcc: ass.shcc })));
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/exam/multiple', app.permission.check('dtExam:write'), async (req, res) => {
        try {
            let { items } = req.body;
            for (let item of items) {
                let { phong, batDau, ketThuc, listGiamThi, id } = item;
                await app.model.dtExam.update({ id }, { batDau, ketThuc, phong });
                await app.model.dtExamGiamThi.delete({ idExam: id });
                if (listGiamThi) {
                    listGiamThi = listGiamThi.split(',');
                    for (let giamThi of listGiamThi) {
                        await app.model.dtExamGiamThi.create({
                            idExam: id, giamThi,
                            batDau, ketThuc,
                            modifier: req.session.user.email,
                            timeModified: Date.now()
                        });
                    }
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/exam/check-if-trung-lich', app.permission.check('dtExam:write'), async (req, res) => {
        try {
            let { dssv, filter } = req.body, soLuongTrung = 0,
                { batDau, ketThuc } = filter;
            dssv = JSON.parse(dssv);
            batDau = new Date(batDau).getTime();
            ketThuc = new Date(ketThuc).getTime();
            for (let sv of dssv) {
                let listLichThi = await app.model.dtExam.getExamSinhVien(sv);
                if (listLichThi.rows.length) {
                    for (let lichThi of listLichThi.rows) {
                        let isTrung = (batDau + 1 >= lichThi.batDau && batDau + 1 <= lichThi.ketThuc) ||
                            (ketThuc - 1 >= lichThi.batDau && ketThuc - 1 <= lichThi.ketThuc) ||
                            (batDau <= lichThi.batDau && lichThi.ketThuc <= ketThuc);
                        isTrung && soLuongTrung++;
                    }
                }
            }
            if (soLuongTrung) {
                res.send({ warning: `Học phần ${dssv[0].hocPhan} có ${soLuongTrung} sinh viên bị trùng lịch thi.`, isTrung: true });
            }
            else res.send({ isTrung: false });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/exam/check-if-trung-lich-thi', app.permission.check('dtExam:write'), async (req, res) => {
        try {
            let { maHocPhan, batDau, ketThuc } = req.body;
            batDau = Number(batDau);
            ketThuc = Number(ketThuc);
            const [thoiKhoaBieu, lichThi, suKien] = await Promise.all([
                app.model.dtThoiKhoaBieuCustom.getAll({
                    statement: 'isNghi IS NULL AND isNgayLe IS NULL AND ' +
                        '(:batDau + 1 BETWEEN thoiGianBatDau AND thoiGianKetThuc ' +
                        'OR :ketThuc - 1 BETWEEN thoiGianBatDau AND thoiGianKetThuc ' +
                        'OR (:batDau <= thoiGianBatDau AND thoiGianKetThuc <= :ketThuc))',
                    parameter: { batDau, ketThuc }
                }, 'id'),
                app.model.dtExam.getAll({
                    statement: ':maHocPhan != maHocPhan AND (:batDau + 1 BETWEEN batDau AND ketThuc ' +
                        'OR :ketThuc - 1 BETWEEN batDau AND ketThuc ' +
                        'OR (:batDau <= batDau AND ketThuc <= :ketThuc))',
                    parameter: { maHocPhan, batDau, ketThuc }
                }, 'id'),
                app.model.dtLichEvent.getAll({
                    statement: ':batDau + 1 BETWEEN thoiGianBatDau AND thoiGianKetThuc ' +
                        'OR :ketThuc - 1 BETWEEN thoiGianBatDau AND thoiGianKetThuc ' +
                        'OR (:batDau <= thoiGianBatDau AND thoiGianKetThuc <= :ketThuc)',
                    parameter: { batDau, ketThuc }
                }, 'id')
            ]);
            if (!thoiKhoaBieu.length && !lichThi.length && !suKien.length) {
                res.send({ isTrung: false, thoiKhoaBieu, lichThi, suKien });
            } else res.send({ isTrung: true, thoiKhoaBieu, lichThi, suKien });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/download-import-template', app.permission.check('dtExam:import'), async (req, res) => {
        try {
            res.sendFile(app.path.join(app.publicPath, 'sample', 'TEMPLATE_IMPORT_DT_EXAM.xlsx'));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/download-import-phong-thi-template', app.permission.check('dtExam:import'), async (req, res) => {
        try {
            res.sendFile(app.path.join(app.publicPath, 'sample', 'TEMPLATE_IMPORT_PHONG_THI.xlsx'));
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/export-data', app.permission.orCheck('dtExam:manage', 'dtExam:read'), async (req, res) => {
        try {
            let filter = { ...app.utils.parse(req.query.filter) };
            await app.model.dtAssignRole.getDataRole('dtExam', req.session.user, filter);

            let data = await app.model.dtExam.exportData(JSON.stringify(filter)),
                list = data.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Data');

            if (!list.length) {
                return res.status(400).send('Không có thông tin lịch thi');
            } else {
                ws.columns = [{ header: 'STT', key: 'STT', width: 5 }, ...Object.keys(list[0]).map(key => ({ header: key.toString(), key, width: 20 }))];
                list.forEach((item, index) => {
                    item['Ngày thi'] = item['Ngày thi'] ? app.date.viDateFormat(new Date(item['Ngày thi'])) : '';
                    item['Bắt đầu'] = item['Bắt đầu'] ? app.date.viTimeFormat(new Date(item['Bắt đầu'])) : '';
                    item['Kết thúc'] = item['Kết thúc'] ? app.date.viTimeFormat(new Date(item['Kết thúc'])) : '';
                    ws.addRow({ STT: index + 1, ...item }, index === 0 ? 'n' : 'i');
                });

                let fileName = 'LICH_THI.xlsx';
                app.excel.attachment(workBook, res, fileName);
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/exam/export-data/dssv', app.permission.orCheck('dtExam:manage', 'dtExam:read'), async (req, res) => {
        try {
            let data = await app.model.dtExam.exportDataDssv(JSON.stringify(req.query)),
                list = data.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Data');

            ws.columns = Object.keys(list[0]).map(key => ({ header: key.toString(), key, width: 20 }));
            list.forEach((item, index) => {
                item['Ngày thi'] = item['Ngày thi'] ? app.date.viDateFormat(new Date(item['Ngày thi'])) : '';
                item['Bắt đầu'] = item['Bắt đầu'] ? app.date.viTimeFormat(new Date(item['Bắt đầu'])) : '';
                item['Kết thúc'] = item['Kết thúc'] ? app.date.viTimeFormat(new Date(item['Kết thúc'])) : '';
                ws.addRow({ STT: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });

            let fileName = `DANH_SACH_THI_${req.query.kyThi}_${req.query.maHocPhan}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    //Hook upload -----------------------------------------------------------------------------------------
    app.uploadHooks.add('dtExamData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtExamUploadData(req, fields, files, params, done), done, 'dtExam:import')
    );

    const dtExamUploadData = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'DtExam' && files.DtExam && files.DtExam.length) {
            const errorDescription = {
                1: 'Hàng bị thiếu dữ liệu',
                2: 'Không tìm thấy sinh viên trên hệ thống',
                3: 'Không tìm thấy học phần trong kỳ này',
                4: 'Không tìm thấy sinh viên trong lớp học phần',
                5: 'Không tìm thấy phòng trên hệ thống',
            }, warningDescription = {
                1: 'Sinh viên chưa thanh toán học phí'
            };
            const srcPath = files.DtExam[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                let dataSheet = workbook.getWorksheet('Data');
                if (!dataSheet) {
                    done && done({ error: 'Invalid worksheet' });
                } else {
                    let items = [], falseItems = [], index = 2,
                        currentSem = await app.model.dtSemester.getCurrent(),
                        { namHoc, hocKy } = currentSem;
                    try {
                        const getVal = (column, Default) => {
                            Default = Default ? Default : '';
                            let val = dataSheet.getCell(column + index).text;
                            return val === '' ? Default : (val == null ? '' : val);
                        };
                        while (true) {
                            if (dataSheet.getCell('A' + index).text == '') {
                                done && done({ items, falseItems });
                                break;
                            } else {
                                let data = {
                                    mssv: getVal('B'),
                                    maMonHoc: getVal('E'),
                                    maHocPhan: getVal('F'),
                                    ngayThi: getVal('G'),
                                    phong: getVal('H'),
                                    gioBatDau: getVal('I'),
                                    gioKetThuc: getVal('J'),
                                    errorCode: [], warningCode: []
                                };
                                let { mssv, maHocPhan, ngayThi, gioBatDau, gioKetThuc, phong, maMonHoc } = data;
                                if (!(mssv && maHocPhan && ngayThi && gioBatDau && gioKetThuc && phong)) {
                                    data.errorCode.push(1);
                                } else {
                                    let [day, month, year] = data.ngayThi.split('/').map(item => Number(item)),
                                        [startHour, startMinute] = data.gioBatDau.split(':').map(item => Number(item)),
                                        [endHour, endMinute] = data.gioKetThuc.split(':').map(item => Number(item));

                                    data.batDau = new Date(year, month - 1, day, startHour, startMinute, 0).getTime();
                                    data.ketThuc = new Date(year, month - 1, day, endHour, endMinute, 0).getTime();
                                    let checkStudent = await app.model.fwStudent.get({ mssv }, 'mssv,ho,ten');
                                    if (!checkStudent) {
                                        data.errorCode.push(2);
                                    } else {
                                        data = {
                                            ...data, ho: checkStudent.ho.toUpperCase(), ten: checkStudent.ten.toUpperCase()
                                        };
                                    }
                                    let monHoc = await app.model.dmMonHoc.get({ statement: 'lower(ma) = lower(:maMonHoc)', parameter: { maMonHoc } });
                                    if (!monHoc) {
                                        data.errorCode.push(7);
                                    } else {
                                        data = { ...data, tenMonHoc: JSON.parse(monHoc.ten).vi };
                                        let checkRoom = await app.model.dmPhong.get({ statement: 'lower(ten) = lower(:phong)', parameter: { phong } });
                                        if (!checkRoom) {
                                            data.errorCode.push(5);
                                        } else {
                                            let checkHocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan, namHoc, hocKy }, 'maHocPhan');
                                            if (!checkHocPhan) {
                                                data.errorCode.push(3);
                                            } else {
                                                let checkData = await app.model.dtDangKyHocPhan.get({ mssv, maHocPhan, namHoc, hocKy }, 'mssv');
                                                if (!checkData) {
                                                    data.errorCode.push(4);
                                                }
                                            }
                                        }
                                    }
                                }
                                data = {
                                    ...data,
                                    id: index,
                                    errorDetail: data.errorCode.map(item => errorDescription[item]),
                                    warningDetail: data.warningCode.map(item => warningDescription[item]),
                                    isValid: Number(data.errorCode.length == 0)
                                };
                                if ((data.errorCode && data.errorCode.length) || (data.warningCode && data.warningCode.length)) {
                                    falseItems.push(data);
                                } else {
                                    items.push(data);
                                }
                                app.io.to('ImportLichThiExcel').emit('import-single-done', { requester: req.session.user.email, items, falseItems, index });
                                index++;
                            }
                        }
                        app.io.to('ImportLichThiExcel').emit('import-all-done', { requester: req.session.user.email, items, falseItems });
                    } catch (error) {
                        console.error(error);
                        done && done({ error });
                    }
                }
            }
        }
    };

    app.uploadHooks.add('dtExamPhongThi', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtExamUploadPhongThi(req, fields, files, params, done), done, 'dtExam:import')
    );
    const dtExamUploadPhongThi = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'DtExamPhongThi' && files.DtExamPhongThi && files.DtExamPhongThi.length) {
            const errorDescription = {
                1: 'Hàng bị thiếu dữ liệu',
                2: 'Không tìm thấy học phần trong kỳ này',
                3: 'Không tìm thấy phòng trên hệ thống',
                4: 'Không tìm thấy môn học trên hệ thống',
                5: 'Học phần không có sinh viên',
                6: 'Số lượng sinh viên không đúng',
                7: 'Phòng đã được sử dụng',
                8: 'Không tìm thấy giám thị trên hệ thống',
                9: 'Giám thị được xếp không đúng phòng',
                10: 'Giám thị đang có lịch bận',
            }, warningDescription = {
                1: 'Sinh viên chưa thanh toán học phí'
            };
            const srcPath = files.DtExamPhongThi[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                let dataSheet = workbook.getWorksheet('Data');
                if (!dataSheet) {
                    done && done({ error: 'Invalid worksheet' });
                } else {
                    let items = [], falseItems = [], dssvTong = [], index = 2,
                        curSoLuong = 0,
                        currentSem = await app.model.dtSemester.getCurrent(),
                        { namHoc, hocKy } = params || currentSem;
                    try {
                        const getVal = (column, Default) => {
                            Default = Default ? Default : '';
                            let val = dataSheet.getCell(column + index).text;
                            return val === '' ? Default : (val == null ? '' : val);
                        };
                        while (true) {
                            if (dataSheet.getCell(`A${index}`).text == '') {
                                done && done({ items, falseItems, dssvTong });
                                break;
                            } else {
                                let data = {
                                    maHocPhan: getVal('A').trim(),
                                    phong: getVal('B').trim(),
                                    caThi: getVal('C').trim(),
                                    ngayThi: getVal('D').trim(),
                                    gioBatDau: getVal('E').trim(),
                                    thoiGianThi: getVal('F').trim(),
                                    loaiKyThi: getVal('G').trim(),
                                    giamThi: getVal('H').trim(),
                                    errorCode: [], warningCode: [], isError: false
                                }, dataPhongThi = {};
                                let { maHocPhan, caThi, ngayThi, gioBatDau, thoiGianThi, phong, loaiKyThi, giamThi } = data,
                                    maMonHoc = maHocPhan.substring(4, maHocPhan.lastIndexOf('L'));
                                if (!(maHocPhan && caThi && ngayThi && gioBatDau && thoiGianThi && phong && loaiKyThi)) {
                                    data.errorCode.push(1);
                                    data.isError = true;
                                }
                                else {
                                    let [day, month, year] = data.ngayThi.split('/').map(item => Number(item)),
                                        [startHour, startMinute] = data.gioBatDau.split(':').map(item => Number(item));
                                    thoiGianThi = Number(data.thoiGianThi);
                                    data.batDau = new Date(year, month - 1, day, startHour, startMinute, 0).getTime();
                                    data.ketThuc = data.batDau + thoiGianThi * 60 * 1000;
                                    data.thuThi = new Date(data.batDau).getDay() + 1;
                                }
                                let monHoc = await app.model.dmMonHoc.get({ statement: 'lower(ma) = lower(:maMonHoc)', parameter: { maMonHoc } }),
                                    siSo = await app.model.dtDangKyHocPhan.count({ maHocPhan });
                                siSo = siSo.rows[0]['COUNT(*)'];
                                if (!monHoc) {
                                    data.errorCode.push(4);
                                    data.isError = true;
                                } else {
                                    data = { ...data, maMonHoc, tenMonHoc: JSON.parse(monHoc.ten).vi };
                                    let checkHocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan, namHoc, hocKy }, 'maHocPhan');
                                    if (!checkHocPhan) {
                                        data.errorCode.push(2);
                                        data.isError = true;
                                    } else {
                                        if (siSo == 0) {
                                            data.errorCode.push(5);
                                            data.isError = true;
                                        }
                                    }
                                }
                                let listPhong = phong.split(';');
                                let tongSoLuong = 0, tongPhongThi = [], dssv = [];
                                for (let item of listPhong) {
                                    let [phong, soLuong] = item.split(':');
                                    let room = await app.model.dmPhong.get({ statement: 'lower(ten) = lower(:phong)', parameter: { phong } }, 'ten,coSo');
                                    if (!room) {
                                        data.errorCode.push(3);
                                        data.isError = true;
                                    }
                                    else {
                                        room.soLuong = Number(soLuong);
                                        tongPhongThi.push(room);
                                    }
                                }
                                giamThi = giamThi.split(';');
                                let listGiamThi = {};
                                for (let item of giamThi) {
                                    let phong = item.split(':')[1];
                                    listGiamThi[phong] = [];
                                }
                                for (let item of giamThi) {
                                    let [gt, phong] = item.split(':');
                                    listGiamThi[phong] = [...listGiamThi[phong], gt];
                                }

                                let filterPhongTrong = {
                                    batDau: data.batDau, ketThuc: data.ketThuc
                                },
                                    listPhongTrong = await app.model.dtExam.phongThiFilter(JSON.stringify(filterPhongTrong)),
                                    listGiamThiRanh = await app.model.dtExam.getGiamThi('', JSON.stringify(filterPhongTrong));
                                listPhongTrong = listPhongTrong.rows.map(item => item.ten);
                                listGiamThiRanh = listGiamThiRanh.rows.map(item => item.shcc);
                                for (let item of items) {
                                    let batDauLich = item.batDau, ketThucLich = item.ketThuc,
                                        isTrungLich = (data.batDau >= batDauLich && data.batDau <= ketThucLich) ||
                                            (data.ketThuc >= batDauLich && data.ketThuc <= ketThucLich) ||
                                            (data.batDau <= batDauLich && data.ketThuc >= ketThucLich);
                                    if (isTrungLich && listPhongTrong.includes(item.phong)) {
                                        let index = listPhongTrong.findIndex(phong => phong == item.phong);
                                        listPhongTrong.splice(index, 1);
                                    }
                                    if (isTrungLich) {
                                        for (let shcc of item.shccGiamThi) {
                                            if (listGiamThiRanh.includes(shcc)) {
                                                let index = listGiamThiRanh.findIndex(gt => gt == shcc);
                                                listGiamThiRanh.splice(index, 1);
                                            }
                                        }
                                    }
                                }
                                tongSoLuong = tongPhongThi.reduce((prev, cur) => prev + cur.soLuong, tongSoLuong);

                                let nextHocPhan = dataSheet.getCell(`A${index + 1}`).text;
                                curSoLuong = curSoLuong + tongSoLuong;
                                if (nextHocPhan != data.maHocPhan) {
                                    if (siSo != curSoLuong) {
                                        data.errorCode.push(6);
                                        data.isError = true;
                                        let listPhongThi = items.filter(item => item.maHocPhan == maHocPhan),
                                            index = items.findIndex(item => item.maHocPhan == maHocPhan);
                                        items.splice(index, listPhongThi.length);
                                        for (let item of listPhongThi) {
                                            listGiamThi[item.phong] = [...item.shccGiamThi];
                                        }
                                        tongPhongThi = listPhongThi.concat(tongPhongThi);
                                    }
                                    curSoLuong = 0;
                                }
                                let filter = { listMaHocPhan: maHocPhan, namHocHocPhi: namHoc, hocKyHocPhi: hocKy };
                                filter = app.utils.stringify(filter);
                                dssv = await app.model.dtExam.getSinhVienDangKy(filter);
                                dssv = dssv.rows;
                                for (let phong of tongPhongThi) {
                                    let tenPhong = phong.phong || phong.ten;
                                    dataPhongThi[tenPhong] = {
                                        ...data, phong: tenPhong, giamThi: [], shccGiamThi: [],
                                        errorCode: [...data.errorCode], warningCode: [...data.warningCode]
                                    };
                                    if (!listPhongTrong.includes(tenPhong)) {
                                        dataPhongThi[tenPhong].errorCode.push(7);
                                        data.isError = true;
                                    } else {
                                        let keyGiamThi = Object.keys(listGiamThi),
                                            giamThiPhong = listGiamThi[tenPhong];
                                        if (keyGiamThi.some(key => key == tenPhong)) {
                                            for (let gt of giamThiPhong) {
                                                const cbtt = await app.model.tchcCanBo.get({ shcc: gt }, 'ho,ten,shcc');
                                                const cbnt = await app.model.dtCanBoNgoaiTruong.get({ shcc: gt }, 'ho,ten,shcc');
                                                if (!cbtt && !cbnt) {
                                                    dataPhongThi[tenPhong].errorCode.push(8);
                                                    data.isError = true;
                                                } else {
                                                    if (!listGiamThiRanh.includes(gt)) {
                                                        dataPhongThi[tenPhong].errorCode.push(10);
                                                        data.isError = true;
                                                    } else {
                                                        let tenGiamThi = `${cbtt.ho || cbnt.ho} ${cbtt.ten || cbnt.ten}`;
                                                        dataPhongThi[tenPhong].giamThi.push(tenGiamThi);
                                                        dataPhongThi[tenPhong].shccGiamThi.push(gt);
                                                    }
                                                }
                                            }
                                        } else {
                                            dataPhongThi[tenPhong].errorCode.push(9);
                                            data.isError = true;
                                        }
                                    }
                                }
                                for (let item of tongPhongThi) {
                                    let tenPhong = item.phong || item.ten,
                                        dataPhong = {
                                            ...data, caThi: item.caThi || data.caThi, batDau: item.batDau || data.batDau, ketThuc: item.ketThuc || data.ketThuc,
                                            id: index, phong: tenPhong, siSo, coSo: item.coSo || '', soLuong: item.soLuong,
                                            giamThi: dataPhongThi[tenPhong]?.giamThi,
                                            shccGiamThi: dataPhongThi[tenPhong]?.shccGiamThi,
                                            errorCode: dataPhongThi[tenPhong]?.errorCode,
                                            warningCode: dataPhongThi[tenPhong]?.warningCode,
                                            errorDetail: dataPhongThi[tenPhong]?.errorCode.map(item => errorDescription[item]),
                                            warningDetail: dataPhongThi[tenPhong]?.warningCode.map(item => warningDescription[item]),
                                            isValid: Number(dataPhongThi[tenPhong]?.errorCode.length == 0)
                                        };
                                    if (data.isError) {
                                        falseItems.push(dataPhong);
                                    } else {
                                        items.push(dataPhong);
                                        dssvTong = [...dssvTong, ...dssv.slice(0, phong.soLuong).map((item, index) => {
                                            let { mssv, ho, ten, tinhPhi } = item,
                                                { maHocPhan, tenMonHoc, batDau, ketThuc } = data;
                                            return { mssv, ho, ten, maHocPhan, tenMonHoc, batDau, ketThuc, caThi, phong: tenPhong, namHoc, hocKy, stt: index + 1, isThanhToan: Number(tinhPhi != '0'), isValid: true };
                                        })];
                                        dssv = dssv.splice(phong.soLuong);
                                    }
                                }
                                app.io.to('ImportPhongThiExcel').emit('import-single-done', { requester: req.session.user.email, items, falseItems, dssvTong, index });
                                index++;
                            }
                        }
                        app.io.to('ImportPhongThiExcel').emit('import-all-done', { requester: req.session.user.email, items, falseItems, dssvTong });
                    } catch (error) {
                        console.error(error);
                        done && done({ error });
                    }
                }
            }
        }
    };

    app.readyHooks.add('addSocketListener:ImportHoanCamThi', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ImportHoanCamThi', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('dtExam:import')) {
                socket.join('ImportHoanCamThiSave');
                socket.join('ImportHoanCamThi');
            }
        })
    });

    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('ImportHoanCamThi', (req, fields, files, params, done) =>
        app.permission.has(req, () => importHoanCamThi(req, fields, files, done), done, 'dtExam:import')
    );

    const importHoanCamThi = async (req, fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportHoanCamThi' && files.ImportHoanCamThi && files.ImportHoanCamThi.length) {
            const srcPath = files.ImportHoanCamThi[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    try {
                        // read columns header
                        let index = 2, items = [], falseItems = [];
                        const dmLoaiDiem = await app.model.dtDiemDmLoaiDiem.getAll({}, 'ma, ten'),
                            mapperDinhChi = { 'HT': 'Hoãn thi', 'CT': 'Cấm thi' };

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
                            if (!worksheet.getCell('A' + index).text) {
                                done({});
                                break;
                            } else {
                                const data = {
                                    mssv: getVal('A'),
                                    maHocPhan: getVal('B'),
                                    kyThi: getVal('C')?.toUpperCase(),
                                    loaiDinhChi: getVal('D')?.toUpperCase(),
                                    ghiChu: getVal('E'),
                                    row: index,
                                };

                                //CHECK DATA
                                let sv = await app.model.fwStudent.get({ mssv: data.mssv }, 'mssv, ho, ten');
                                if (!sv) {
                                    falseItems.push({ ...data, error: 'Không tồn tại sinh viên' });
                                } else {
                                    let isDangKy = await app.model.dtDangKyHocPhan.get({ mssv: data.mssv, maHocPhan: data.maHocPhan });
                                    if (!isDangKy) {
                                        falseItems.push({ ...data, error: 'Sinh viên không đăng ký học phần' });
                                    } else if (await app.model.dtDinhChiThi.get({ mssv: data.mssv, maHocPhan: data.maHocPhan, loaiDinhChi: data.loaiDinhChi, kyThi: data.kyThi })) {
                                        falseItems.push({ ...data, error: 'Sinh viên đã bị cấm/hoãn thi trong kỳ thi' });
                                    } else {
                                        const loaiDiem = dmLoaiDiem.find(i => i.ma != data.kyThi);
                                        if (!loaiDiem) {
                                            falseItems.push({ ...data, error: 'Kỳ thi không hợp lệ' });
                                        } else if (!mapperDinhChi[data.loaiDinhChi]) {
                                            falseItems.push({ ...data, error: 'Loại cấm thi/hoãn thi không hợp lệ' });
                                        } else {
                                            const { namHoc, hocKy, maMonHoc } = isDangKy,
                                                { ho, ten } = sv;
                                            items.push({ ...data, tenKyThi: loaiDiem.ten, tenDinhChi: mapperDinhChi[data.loaiDinhChi], namHoc, hocKy, maMonHoc, ho, ten });
                                        }
                                    }
                                }
                            }
                            (index % 10 == 0) && app.io.to('ImportHoanCamThi').emit('import-hoan-cam-thi', { requester: req.session.user.email, items, falseItems, index });
                            index++;
                        }
                        app.io.to('ImportHoanCamThi').emit('import-hoan-cam-thi', { requester: req.session.user.email, items, falseItems, isDone: 1 });
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

    // IMPORT HOAN CAM THI
    app.get('/api/dt/exam/import-hoan-cam-thi/download-template', app.permission.check('dtExam:export'), async (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Diem');
        const defaultColumns = [
            { header: 'MSSV', key: 'mssv', width: 20 },
            { header: 'Mã học phần', key: 'maHocPhan', width: 20 },
            { header: 'Kỳ thi', key: 'kyThi', width: 20 },
            { header: 'Hoãn/Cấm thi', key: 'loaiDinhChi', width: 20 },
            { header: 'Ghi chú', key: 'ghiChu', width: 20 }
        ];
        ws.columns = defaultColumns;
        ws.getCell('A2').value = 'SV01';
        ws.getCell('B2').value = '2222DAI048L01';
        ws.getCell('C2').value = 'GK';
        ws.getCell('D2').value = 'CT';
        ws.getCell('A3').value = 'SV01';
        ws.getCell('B3').value = '2222DAI048L01';
        ws.getCell('C3').value = 'CK';
        ws.getCell('D3').value = 'HT';
        app.excel.attachment(workBook, res, 'ImportHoanCamThi.xlsx');
    });

    app.get('/api/dt/exam/hoan-cam-thi/download', app.permission.check('dtExam:export'), async (req, res) => {
        let { filter } = req.query;
        const { rows } = await app.model.dtDinhChiThi.searchPage(1, 10000000, filter, null),
            mapperDinhChi = { 'HT': 'Hoãn thi', 'CT': 'Cấm thi' };

        const workbook = app.excel.create(),
            worksheet = workbook.addWorksheet('Sheet');

        const defaultColumns = [
            { header: 'MSSV', key: 'mssv', width: 20 },
            { header: 'Họ và tên', key: 'hoTen', width: 20 },
            { header: 'Học phần', key: 'maHocPhan', width: 20 },
            { header: 'Tên học phần', key: 'tenHocPhan', width: 20 },
            { header: 'Kỳ thi', key: 'tenKyThi', width: 25 },
            { header: 'Hình thức', key: 'dinhChi', width: 25 },
            { header: 'Ghi chú', key: 'ghiChu', width: 25 },
            { header: 'Người thao tác', key: 'userMod', width: 25 },
            { header: 'Thời gian', key: 'time', width: 25 },
        ];

        worksheet.columns = defaultColumns;
        rows.forEach((row, index) => {
            row = {
                ...row, hoTen: `${row.ho} ${row.ten}`,
                tenHocPhan: app.utils.parse(row.tenMonHoc || { vi: '' }).vi,
                dinhChi: mapperDinhChi[row.loaiDinhChi],
                time: row.timeMod ? app.date.viDateFormat(new Date(row.timeMod)) : '',
            };
            worksheet.addRow(row, index === 0 ? 'n' : 'i');
        });
        app.excel.attachment(workbook, res, 'ExportDataHoanCamThi.xlsx');
    });
};