module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7082: {
                title: 'Phân quyền nhập điểm', link: '/user/dao-tao/grade-manage/assign-role', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-users',
                parentKey: 7047
            },
        }
    };

    const menuTinhTrang = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7106: {
                title: 'Tình trạng nhập điểm', link: '/user/dao-tao/grade-manage/tinh-trang-diem', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-stack-overflow',
                parentKey: 7047
            },
        }
    };
    app.permission.add(
        { name: 'dtAssignRoleNhapDiem:manage', menu },
        { name: 'dtTinhTrangDiem:manage', menu: menuTinhTrang },
    );

    app.assignRoleHooks.addRoles('daoTaoDiem', { id: 'dtAssignRoleNhapDiem:manage', text: 'Phân quyền nhập điểm' });

    app.permissionHooks.add('assignRole', 'checkRoleAssignRoleNhapDiem', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTaoDiem');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'dtAssignRoleNhapDiem:manage' && user.permissions.includes('faculty:login')) {
                app.permissionHooks.pushUserPermission(user, 'dtAssignRoleNhapDiem:manage', 'dtGrade:manage');
            }
        });
        resolve();
    }));

    app.permissionHooks.add('staff', 'addRoleAssignRoleNhapDiem', (user) => new Promise(resolve => {
        if (user.permissions.includes('manager:login')) {
            // app.permissionHooks.pushUserPermission(user, 'dtAssignRoleNhapDiem:manage', 'dtGrade:manage');
        }
        resolve();
    }));

    app.assignRoleHooks.addHook('daoTaoDiem', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === 'daoTaoDiem' && userPermissions.includes('manager:login')) {
            const assignRolesList = app.assignRoleHooks.get('daoTaoDiem').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.get('/user/dao-tao/grade-manage/assign-role', app.permission.check('dtAssignRoleNhapDiem:manage'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage/tinh-trang-diem', app.permission.check('dtTinhTrangDiem:manage'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage/import-ty-le', app.permission.check('dtAssignRoleNhapDiem:manage'), app.templates.admin);
    // API ===========================================

    app.get('/api/dt/assign-role-nhap-diem/data/:pageNumber/:pageSize', app.permission.check('dtAssignRoleNhapDiem:manage'), async (req, res) => {
        try {
            const { filter } = req.query, user = req.session.user,
                _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);

            if (!user.isPhongDaoTao) filter.khoaDangKy = user.maDonVi;

            let items = await app.model.dtAssignRoleNhapDiem.parseData(filter, _pageNumber, _pageSize);
            let listTruongMon = await app.model.dtDmTruongBoMon.getAll({ shcc: user.shcc });

            if (listTruongMon.length) {
                listTruongMon = listTruongMon.map(i => i.maMonHoc);
                items = items.filter(i => listTruongMon.includes(i.maMonHoc));
            }

            items = await Promise.all(items.map(async item => {
                if (!item.thanhPhan) return item;
                const { maHocPhan, thanhPhan, idExam } = item;
                let countStudent = 0, countDinhChi = 0;
                if (idExam) {
                    countStudent = await app.model.dtExamDanhSachSinhVien.count({ idExam }).then(count => count.rows[0]['COUNT(*)']);
                } else {
                    [countStudent, countDinhChi] = await Promise.all([
                        app.model.dtDangKyHocPhan.count({ maHocPhan }).then(count => count.rows[0]['COUNT(*)']),
                        app.model.dtDinhChiThi.count({ maHocPhanThi: maHocPhan, kyThi: thanhPhan }).then(count => count.rows[0]['COUNT(*)'])
                    ]);
                    countStudent += countDinhChi;
                }
                return { ...item, countStudent };
            }));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/assign-role-nhap-diem/data', app.permission.check('dtAssignRoleNhapDiem:manage'), async (req, res) => {
        try {
            const { data } = req.body,
                { listData = [], listCanBo = [] } = data,
                { email } = req.session.user;

            await Promise.all(listData.map(i => app.model.dtAssignRoleNhapDiem.delete({ ...i, kyThi: i.thanhPhan })));

            for (const canBo of listCanBo) {
                await Promise.all(listData.map(i => app.model.dtAssignRoleNhapDiem.create({ ...i, kyThi: i.thanhPhan, userModified: email, timeModified: Date.now(), shcc: canBo.shcc })));
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/assign-role-nhap-diem/default', app.permission.check('dtAssignRoleNhapDiem:manage'), async (req, res) => {
        try {
            const { filter } = req.body,
                { email } = req.session.user;
            await app.service.executeService.run({
                email,
                param: { filter, email },
                path: '/user/dao-tao/grade-manage/assign-role',
                task: 'assignRoleNhapDiem',
                taskName: 'Cấu hình mặc định giảng viên nhập điểm',
                customUrlParam: {}
            });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/tinh-trang-diem/page/:pageNumber/:pageSize', app.permission.check('dtTinhTrangDiem:manage'), async (req, res) => {
        try {
            const { filter } = req.query, user = req.session.user,
                _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            if (!user.isPhongDaoTao) {
                filter.khoaDangKy = user.maDonVi;
            }

            let [items, statusCode] = await Promise.all([
                app.model.dtAssignRoleNhapDiem.parseData(filter, _pageNumber, _pageSize),
                app.model.dtDiemCodeFile.getStatus(app.utils.stringify(filter)),
            ]);

            items = await Promise.all(items.map(async item => {
                const code = statusCode.rows.find(i => (!item.idExam || i.idExam == item.idExam) && i.maHocPhan == item.maHocPhan && i.kyThi == item.thanhPhan),
                    { idCode, userPrint, printTime } = code || {};
                if (!item.thanhPhan) return item;
                const { maHocPhan, thanhPhan, idExam } = item;
                let countStudent = 0, countDinhChi = 0;
                if (idExam) {
                    countStudent = await app.model.dtExamDanhSachSinhVien.count({ idExam }).then(count => count.rows[0]['COUNT(*)']);
                } else {
                    [countStudent, countDinhChi] = await Promise.all([
                        app.model.dtDangKyHocPhan.count({ maHocPhan }).then(count => count.rows[0]['COUNT(*)']),
                        app.model.dtDinhChiThi.count({ maHocPhanThi: maHocPhan, kyThi: thanhPhan }).then(count => count.rows[0]['COUNT(*)'])
                    ]);
                    countStudent += countDinhChi;
                }
                return { ...item, countStudent, isVerified: code && code.isVerified, idCode, userPrint, printTime, status: code && code.isVerified ? 3 : (idCode ? 2 : 1) };
            }));

            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/assign-role-nhap-diem', app.permission.check('dtAssignRoleNhapDiem:manage'), async (req, res) => {
        try {
            const { list = [] } = req.body;
            await Promise.all(list.map(id => app.model.dtAssignRoleNhapDiem.delete({ id })));
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/assign-role-nhap-diem/export', app.permission.check('dtAssignRoleNhapDiem:manage'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter), user = req.session.user;

            if (!user.isPhongDaoTao) filter.khoaDangKy = user.maDonVi;

            app.service.executeService.run({
                email: req.session.user.email,
                param: { filter },
                task: 'exportAssignRoleNhapDiem',
                path: '/user/dao-tao/grade-manage/assign-role',
                isExport: 1,
                taskName: 'Export dữ liệu phân quyền nhập điểm',
            });

            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/tinh-trang-diem/export', app.permission.check('dtTinhTrangDiem:manage'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter), user = req.session.user;

            if (!user.isPhongDaoTao) filter.khoaDangKy = user.maDonVi;

            let [items, statusCode] = await Promise.all([
                app.model.dtAssignRoleNhapDiem.parseData({ ...filter, isAll: 1 }),
                app.model.dtDiemCodeFile.getStatus(app.utils.stringify(filter)),
            ]);

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DATA_TINH_TRANG_NHAP_DIEM');

            ws.columns = [
                { header: 'STT', key: 'stt', width: 5 },
                { header: 'Mã học phần', key: 'maHocPhan', width: 20 },
                { header: 'Tên học phần', key: 'tenMonHoc', width: 20 },
                { header: 'Điểm thành phần', key: 'diemThanhPhan', width: 20 },
                { header: 'Lớp', key: 'maLop', width: 20 },
                { header: 'Số lượng sinh viên', key: 'slsv', width: 20 },
                { header: 'Ca thi', key: 'caThi', width: 20 },
                { header: 'Giảng viên nhập điểm', key: 'giangVienNhap', width: 20 },
                { header: 'Giảng viên', key: 'giangVien', width: 20 },
                { header: 'Tình trạng', key: 'tinhTrang', width: 20 },
            ];

            items = items.filter(i => i.thanhPhan && (filter.kyThi == 'QT' ? i.thanhPhan != 'CK' : i.thanhPhan == 'CK'));
            items = await Promise.all(items.map(async item => {
                item.tenMonHoc = app.utils.parse(item.tenMonHoc || { vi: '' }).vi;
                item.caThi = item.idExam ? `Ca thi: ${item.caThi} \r\n Phòng:${item.phong} \r\n Ngày:${item.batDau ? app.date.viDateFormat(new Date(item.batDau)) : ''}` : '';
                item.giangVien = item.tenGiangVien ? item.tenGiangVien.split(',').map(gv => `${gv}`).join(', \r\n') : '';

                const roleNhapDiem = item.roleNhapDiem.filter(i => i.idExam ? (i.idExam == item.idExam) : (i.kyThi == item.thanhPhan));

                item.giangVienNhap = roleNhapDiem.length ? roleNhapDiem.map(role => role.tenGiangVien).map(gv => `${gv}`).join(', \r\n') : '';
                item.diemThanhPhan = item.tpDiem.filter(tp => filter.kyThi == 'QT' ? tp.thanhPhan != 'CK' : tp.thanhPhan == 'CK').sort((a, b) => a.priority - b.priority).map(tp => `${tp.tenThanhPhan}: ${tp.phanTram}%`).join(', \r\n');

                if (!item.thanhPhan) return item;
                const { maHocPhan, thanhPhan, idExam } = item;
                let countStudent = 0, countDinhChi = 0;
                if (idExam) {
                    countStudent = await app.model.dtExamDanhSachSinhVien.count({ idExam }).then(count => count.rows[0]['COUNT(*)']);
                } else {
                    [countStudent, countDinhChi] = await Promise.all([
                        app.model.dtDangKyHocPhan.count({ maHocPhan }).then(count => count.rows[0]['COUNT(*)']),
                        app.model.dtDinhChiThi.count({ maHocPhanThi: maHocPhan, kyThi: thanhPhan }).then(count => count.rows[0]['COUNT(*)'])
                    ]);
                    countStudent += countDinhChi;
                }

                const code = statusCode.rows.find(i => (!item.idExam || i.idExam == item.idExam) && i.maHocPhan == item.maHocPhan && i.kyThi == item.thanhPhan),
                    { idCode } = code || {};

                item.tinhTrang = code && code.isVerified ? 'Đã xác nhận' : (idCode ? 'Đã nhập điểm' : 'Chưa nhập điểm');
                return { ...item, slsv: countStudent, status: code && code.isVerified ? 3 : (idCode ? 2 : 1) };
            }));

            if (filter.status) items = items.filter(i => i.status == filter.status);

            items.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });

            app.excel.attachment(workBook, res, 'DATA_TINH_TRANG_NHAP_DIEM.xlsx');
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/assign-role-nhap-diem/download-template', app.permission.check('dtAssignRoleNhapDiem:manage'), async (req, res) => {
        let loaiDiem = await app.model.dtDiemDmLoaiDiem.getAll({ kichHoat: 1 }, '*', 'priority DESC');

        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Diem');
        const defaultColumns = [
            { header: 'Mã học phần', key: 'maHocPhan', width: 20 },
            ...loaiDiem.map(i => ({ header: i.ten, key: i.ma, width: 20 })),
        ];

        ws.columns = defaultColumns;
        ws.getCell('A2').value = '231016.016L01';
        loaiDiem.forEach((_, index) => {
            ws.getCell(`${app.excel.numberToExcelColumn(index + 2)}2`).value = 10;
        });
        app.excel.attachment(workBook, res, 'ImportTyLeDiem.xlsx');
    });

    app.post('/api/dt/assign-role-nhap-diem/ty-le-diem', app.permission.check('dtAssignRoleNhapDiem:manage'), async (req, res) => {
        try {
            const listHP = app.utils.parse(req.body.data),
                modifier = req.session.user.email,
                lastModified = Date.now();
            await Promise.all(listHP.map(async hp => {
                try {
                    let { maHocPhan, tpDiem } = hp,
                        { maMonHoc, namHoc, hocKy } = await app.model.dtThoiKhoaBieu.get({ maHocPhan }),
                        statusCode = await app.model.dtDiemCodeFile.getStatus(app.utils.stringify({ namHoc, hocKy, maHocPhan }));

                    if (statusCode.rows.find(i => i.isVerified)) throw { message: `Học phần ${maHocPhan} đã được xác nhận điểm. Không thể thao tác chỉnh sửa điểm thành phần!` };

                    await app.model.dtDiemConfigHocPhan.delete({ maHocPhan, maMonHoc });
                    for (let tp of tpDiem) {
                        let { thanhPhan, phanTram, loaiLamTron } = tp;
                        await app.model.dtDiemConfigHocPhan.create({ maHocPhan, maMonHoc, loaiThanhPhan: thanhPhan, phanTram, loaiLamTron, modifier, lastModified });
                    }

                    let listStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv');

                    await Promise.all(listStudent.map(async stu => {
                        let condition = { maHocPhan, namHoc, hocKy, maMonHoc, mssv: stu.mssv };

                        if (stu.id) {
                            condition.maHocPhan = stu.maHocPhan;
                            condition.namHoc = stu.namHoc;
                            condition.hocKy = stu.hocKy;
                        }
                        const allDiem = await app.model.dtDiemAll.getAll(condition);

                        await app.model.dtDiemAll.delete(condition);

                        for (let tp of tpDiem) {
                            let { thanhPhan, phanTram } = tp;
                            const exist = allDiem.find(i => i.loaiDiem == thanhPhan && i.diem != null);
                            if (exist) {
                                await app.model.dtDiemAll.create({ ...condition, loaiDiem: thanhPhan, phanTramDiem: phanTram, diem: exist.diem ?? '', diemDacBiet: exist.diemDacBiet ?? '', isLock: exist.isLock, timeLock: exist.isLock ? lastModified : '' });
                                await app.model.dtDiemHistory.create({ ...condition, loaiDiem: thanhPhan, oldDiem: exist?.diem ?? '', newDiem: exist?.diem ?? '', diemDacBiet: exist.diemDacBiet ?? '', phanTramDiem: phanTram, hinhThucGhi: 5, userModified: modifier, timeModified: lastModified });
                            }
                        }

                        if (allDiem.filter(i => i.diem != null && i.loaiDiem != 'TK').length) {
                            const { isTK, sumDiem } = await app.model.dtDiemAll.updateDiemTK(condition);

                            if (isTK) {
                                await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: sumDiem });
                            } else {
                                await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: sumDiem });
                            }
                        }
                    }));

                    await app.model.dtAssignRoleNhapDiem.updateThanhPhan({ maHocPhan, maMonHoc, namHoc, hocKy, modifier, lastModified });
                } catch (error) {
                    app.consoleError(req, error);
                }
            }));
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('ImportTyLeDiem', (req, fields, files, params, done) =>
        app.permission.has(req, () => ImportTyLeDiem(req, fields, files, done), done, 'dtAssignRoleNhapDiem:manage')
    );

    const ImportTyLeDiem = async (req, fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportTyLeDiem' && files.ImportTyLeDiem && files.ImportTyLeDiem.length) {
            const srcPath = files.ImportTyLeDiem[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                worksheet = workbook.getWorksheet(1);
                app.fs.deleteFile(srcPath);
                let dmLoaiDiem = await app.model.dtDiemDmLoaiDiem.getAll({}, '*', 'priority DESC');
                if (worksheet) {
                    try {
                        // read columns header
                        let i = 1, columns = [];
                        while (true) {
                            let column = app.excel.numberToExcelColumn(i),
                                value = worksheet.getCell(`${column}1`).text?.trim();
                            if (value) {
                                columns.push({ column, name: value });
                            } else {
                                break;
                            }
                            i++;
                        }
                        dmLoaiDiem = dmLoaiDiem.filter(loai => columns.find(i => i.name.toLowerCase() == loai.ten.trim().toLowerCase()));
                        done({});
                        let items = [], falseItems = [], index = 2;

                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text?.trim();
                                if (type == 'number' && val != '') {
                                    if (!isNaN(Number(val))) return Math.round(Number(val));
                                    else val = '';
                                }
                                return val === '' ? Default : (val == null ? '' : val.toString());
                            };
                            if (!(worksheet.getCell('A' + index).value)) {
                                break;
                            } else {
                                const data = {
                                    maHocPhan: getVal('A'),
                                    row: index,
                                };

                                dmLoaiDiem.forEach(loai => {
                                    let exist = columns.find(i => i.name.toLowerCase() == loai.ten.trim().toLowerCase());
                                    if (exist) {
                                        data[loai.ma] = getVal(exist.column, 'number');
                                    }
                                });

                                let hocPhan = await app.model.dtThoiKhoaBieu.get({ maHocPhan: data.maHocPhan });
                                if (!hocPhan) {
                                    falseItems.push({ ...data, error: 'Không tồn tại mã học phần!' });
                                } else {
                                    const exist = items.find(i => i.maHocPhan == data.maHocPhan);
                                    if (exist) {
                                        falseItems.push({ ...data, error: `Trùng học phần cập nhật với dòng ${exist.row}!` });
                                        index++;
                                        continue;
                                    }

                                    let config = await app.model.dtDiemAll.getInfo(data.maHocPhan),
                                        { configDefault } = config.rows[0];

                                    configDefault = configDefault ? app.utils.parse(configDefault) : [];

                                    let tpDiem = configDefault;

                                    tpDiem.sort((a, b) => b.priority - a.priority);

                                    if (!configDefault.length) {
                                        falseItems.push({ ...data, error: 'Học kỳ chưa cấu hình tỷ lệ điểm!' });
                                        index++;
                                        continue;
                                    }

                                    tpDiem = tpDiem.map(tp => {
                                        let { phanTramMax, phanTramMin } = configDefault.find(cf => cf.thanhPhan == tp.thanhPhan) || { phanTramMax: tp.thanhPhan == 'CK' ? 100 : 50, phanTramMin: tp.thanhPhan == 'CK' ? 50 : 0 };
                                        return { ...tp, phanTramMax, phanTramMin, phanTram: data[tp.thanhPhan] ?? '' };
                                    });

                                    if (!tpDiem.filter(i => i.phanTram).length) {
                                        falseItems.push({ ...data, tpDiem, error: 'Tỷ lệ thành phần điểm bị lỗi!' });
                                        index++;
                                        continue;
                                    }

                                    tpDiem = tpDiem.filter(i => i.phanTram);
                                    if (!tpDiem.find(i => i.thanhPhan == 'CK')) {
                                        falseItems.push({ ...data, tpDiem, error: 'Thành phần điểm phải có cuối kỳ!' });
                                        index++;
                                        continue;
                                    }

                                    let check = tpDiem.find(i => Number(i.phanTramMax) < Number(i.phanTram) || Number(i.phanTramMin) > Number(i.phanTram));
                                    if (check) {
                                        falseItems.push({ ...data, tpDiem, error: `Phần trăm điểm của thành phần ${check.tenThanhPhan} phải nằm trong khoảng từ ${check.phanTramMin} đến ${check.phanTramMax}!` });
                                        index++;
                                        continue;
                                    }

                                    let sum = tpDiem.reduce((x, y) => x + Number(y.phanTram), 0);
                                    if (sum != 100) {
                                        falseItems.push({ ...data, tpDiem, error: 'Tổng phần trăm điểm phải là 100%' });
                                        index++;
                                        continue;
                                    }

                                    items.push({ ...data, tpDiem });
                                }
                                (index % 10 == 0) && app.io.to(req.session.user.email).emit('update-ty-le-diem', { status: 'importing', items, falseItems, dmLoaiDiem });
                            }
                            index++;
                        }
                        app.io.to(req.session.user.email).emit('update-ty-le-diem', { status: 'done', items, falseItems, dmLoaiDiem });
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
};