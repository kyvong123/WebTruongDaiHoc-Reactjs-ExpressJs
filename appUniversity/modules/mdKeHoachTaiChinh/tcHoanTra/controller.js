module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5011: { title: 'Hoàn trả', link: '/user/finance/hoan-tra', icon: 'fa fa-retweet', color: '#000', backgroundColor: '#D8BFD8', groupIndex: 2 } },
    };

    app.permission.add(
        { name: 'tcHoanTra:read', menu },
        { name: 'tcHoanTra:write' },
        { name: 'tcHoanTra:delete' },
        { name: 'tcHoanTra:export' },
    );

    app.permissionHooks.add('staff', 'addRolesTcHoanTra', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcHoanTra:read', 'tcHoanTra:write', 'tcHoanTra:delete', 'tcHoanTra:export');
            resolve();
        } else resolve();
    }));


    app.get('/user/finance/hoan-tra', app.permission.check('tcHoanTra:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/khtc/hoan-tra/page/:pageNumber/:pageSize', app.permission.check('tcHoanTra:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);

            let searchTerm = `%${req.query.searchTerm || ''}%`;

            await app.model.tcHoanTra.searchPage(pageNumber, pageSize, searchTerm, '', (error, page) => {
                if (error || !page) {
                    res.send({ error });
                } else {
                    const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                    const pageCondition = searchTerm;
                    res.send({
                        page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list }
                    });
                }
            });

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/hoan-tra', app.permission.check('tcHoanTra:write'), async (req, res) => {
        try {
            const data = req.body?.data;
            if (!data) {
                throw 'Thông tin không đúng';
            }

            const { mssv, namHoc, hocKy, soTien, lyDo, ghiChu, soQuyetDinh, ngayRaQuyetDinh, chuTaiKhoan, stk, nganHang, tinhTrangHoanTra } = data;

            if (!(mssv && namHoc && hocKy && soTien && lyDo && soQuyetDinh && ngayRaQuyetDinh && chuTaiKhoan && stk && nganHang && tinhTrangHoanTra)) {
                throw 'Thông tin không đủ! Yêu cầu nhập đầy đủ thông tin';
            }

            const sinhVien = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy });
            if (!sinhVien) throw 'Thông tin sinh viên không đúng';
            if (sinhVien.hoanTra != 0) throw 'Sinh viên đã hoàn trả';
            // if (data.soTien > sinhVien.hocPhi - sinhVien.congNo) {
            //     throw 'Số tiền hoàn trả lớn hơn số tiền đã đóng';
            // }
            const checkHoanTra = await app.model.tcHoanTra.get({ mssv: data.mssv, namHoc: data.namHoc, hocKy: data.hocKy });
            if (checkHoanTra) {
                throw 'Sinh viên đã hoàn trả';
            }

            const checkSoDu = await app.model.tcSoDuHocPhi.get({ mssv });
            if (!checkSoDu?.soTien) {
                throw 'Sinh viên không có số dư';
            }

            if (parseInt(checkSoDu.soTien) - parseInt(soTien) < 0) {
                throw 'Số tiền hoàn trả lớn hơn số dư học phí';
            }

            const item = await app.model.tcHoanTra.create({
                mssv, namHoc, hocKy, soTien, lyDo, ghiChu, soQuyetDinh, ngayRaQuyetDinh, chuTaiKhoan, stk, nganHang, tinhTrangHoanTra
            });
            await app.model.fwStudent.update({ mssv }, { tenNganHang: nganHang, soTkNh: stk });
            await app.model.tcTaiKhoanNganHangUpdateLog.create({ mssv, tenNganHang: nganHang, soTkNh: stk, handleTime: Date.now(), modifier: req.session?.user?.email });

            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/khtc/hoan-tra', app.permission.check('tcHoanTra:write'), async (req, res) => {
        try {
            const { mssv, namHoc, hocKy } = req.body?.keys;
            if (!mssv | !namHoc | !hocKy) {
                throw 'Thông tin không đúng';
            }
            const item = await app.model.tcHoanTra.get({ mssv, namHoc, hocKy });
            // const sinhVien = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy });
            if (!item) {
                throw 'Sinh viên không có đơn hoàn trả';
            }
            const changes = req.body?.changes;
            if (!changes) {
                throw 'Thông tin thay đổi không tồn tại';
            }
            if (Object.keys(changes).includes('mssv') || Object.keys(changes).includes('namHoc') || Object.keys(changes).includes('hocKy')) {
                throw 'Thông tin thay đổi không được bao gồm MSSV, năm học, học kỳ';
            }

            const checkSoDu = await app.model.tcSoDuHocPhi.get({ mssv });
            if (!checkSoDu?.soTien) {
                throw 'Sinh viên không có số dư';
            }

            if (parseInt(checkSoDu.soTien) - parseInt(changes.soTien || 0) < 0) {
                throw 'Số tiền hoàn trả lớn hơn số dư học phí';
            }

            await app.model.fwStudent.update({ mssv }, { tenNganHang: changes.nganHang, soTkNh: changes.stk });
            await app.model.tcTaiKhoanNganHangUpdateLog.create({ mssv, tenNganHang: changes.nganHang, soTkNh: changes.stk, handleTime: Date.now(), modifier: req.session?.user?.email });
            const new_item = await app.model.tcHoanTra.update({ mssv, namHoc, hocKy }, { ...changes, ngayHoanTra: Date.now() });
            res.send({ item: new_item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/khtc/hoan-tra', app.permission.check('tcHoanTra:delete'), async (req, res) => {
        try {
            const data = req.body || '';
            if (!data) {
                throw 'Thông tin không đúng';
            }
            if (!data.mssv || !data.namHoc || !data.hocKy) {
                throw 'Thiếu thông tin cơ bản (MSSV, năm học, học kỳ)';
            }
            const item = await app.model.tcHoanTra.get({ mssv: data.mssv, namHoc: data.namHoc, hocKy: data.hocKy });
            if (!item) {
                throw 'Sinh viên không có đơn hoàn trả!';
            }
            if (item.tinhTrangHoanTra) {
                await app.model.tcHocPhi.update(data, { hoanTra: 0 });

                let checkSoDu = await app.model.tcSoDuHocPhi.get({ mssv: data.mssv });
                if (!checkSoDu) checkSoDu = await app.model.tcSoDuHocPhi.create({ mssv: data.mssv, soTien: 0 });
                await app.model.tcSoDuHocPhi.update({ mssv: data.mssv }, { soTien: parseInt(item.soTien) + parseInt(checkSoDu.soTien) });
            }
            await app.model.tcHoanTra.delete(data);
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/hoan-tra/so-du-hoc-phi', app.permission.check('tcHoanTra:read'), async (req, res) => {
        try {
            const mssv = req.query?.mssv || '';
            if (!mssv) {
                throw 'Thông tin MSSV không đúng!';
            }

            await app.model.tcDotDong.capNhatDongTien(mssv);

            const sinhVien = await app.model.tcSoDuHocPhi.get({ mssv });
            if (!sinhVien) {
                throw 'Sinh viên không có số dư cần hoàn trả';
            }

            res.send({ soTien: sinhVien.soTien });
            // res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/hoan-tra/xac-nhan', app.permission.check('tcHoanTra:read'), async (req, res) => {
        try {
            const filter = req.body;
            console.log(filter);
            if (!filter) {
                throw 'Thông tin yêu cầu xác nhận không đúng!';
            }

            const checkHocPhi = await app.model.tcHocPhi.get(filter);
            if (!checkHocPhi) throw `Sinh viên không có học phí ${filter.namHoc}-${parseInt(filter.namHoc) + 1} HK${filter.hocKy}`;

            const checkHoanTra = await app.model.tcHoanTra.get(filter);
            if (!checkHoanTra) throw 'Sinh viên không có đơn hoàn trả!';

            const checkSoDu = await app.model.tcSoDuHocPhi.get({ mssv: filter.mssv });
            if (!checkSoDu?.soTien) throw 'Sinh viên không có số dư, vui lòng xóa đơn hoàn trả!';

            if (checkHoanTra.soTien > checkSoDu.soTien) throw 'Số tiền hoàn trả lớn hơn số dư của sinh viên';

            await app.model.tcSoDuHocPhi.update({ mssv: checkSoDu.mssv }, { soTien: parseInt(checkSoDu.soTien) - parseInt(checkHoanTra.soTien) });
            await app.model.tcHocPhi.update(filter, { hoanTra: 1 });
            await app.model.tcHoanTra.update(filter, { tinhTrangHoanTra: 1 });

            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    // EXCEL ---------------------------------------------------------------------------------------------------
    app.get('/api/khtc/hoan-tra/download-excel', app.permission.check('tcHoanTra:export'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Danh sách hoàn trả');
            let data = await app.model.tcHoanTra.downloadExcel(''), list = data.rows;
            const defaultColumns = [
                { header: 'STT', key: 'stt', width: 10 },
                ...Object.keys(list[0]).map(key => ({ header: key.toString(), key, width: 20 }))
            ];
            ws.columns = defaultColumns;

            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
            ws.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };

            list.forEach((item, index) => {
                item['Số tiền hoàn trả'] = parseInt(item['Số tiền hoàn trả']).toString().numberDisplay();
                item['Ngày ra quyết định'] = app.date.dateTimeFormat(new Date(Number(item['Ngày ra quyết định'])), 'dd/mm/yyyy');
                ws.addRow({ stt: index + 1, ...item });
                ws.getRow(index + 2).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws.getRow(index + 2).font = { name: 'Times New Roman' };
            });
            app.excel.attachment(workBook, res, 'HOAN_TRA.xlsx');
        }
        catch (error) {
            app.consoleError(req, error);
            res.status(500).send({ error });
        }
    });


    //----DOCX-------------------
    // const toPdf = require('office-to-pdf');

    const initHoSoHoanTra = async (data) => {
        const source = app.path.join(app.assetPath, 'khtc', 'hoanTraHocPhiTemplate', 'template.docx');
        if (!data) {
            throw 'Thông tin sinh viên không đúng, vui lòng kiểm tra lại';
        }

        data = data.rows[0];
        data.namHoc = `${data.namHoc} - ${data.namHoc + 1}`;
        data.thanhChu = (app.utils.numberToVnText(data.soTien) + ' đồng').trim();
        data.thanhChu = data.thanhChu[0].toUpperCase() + data.thanhChu.substring(1);
        data.soTien = data.soTien.toString().numberDisplay();
        data.ngaySinh = data.ngaySinh ? app.date.dateTimeFormat(new Date(Number(data.ngaySinh)), 'dd/mm/yyyy') : '';
        data.noiSinh = data.noiSinh ? data.noiSinh : '\t';
        data.ngayRaQuyetDinh = data.ngayRaQuyetDinh ? app.date.dateTimeFormat(new Date(Number(data.ngayRaQuyetDinh)), 'dd/mm/yyyy') : '';
        data.chuTaiKhoan = data.chuTaiKhoan.toUpperCase().trim();
        data.ngayTao = app.date.viDateFormatString(new Date());
        Object.keys(data).forEach((key) => {
            data[key] = data[key] ? data[key] : '';
        });

        const buffer = await app.docx.generateFile(source, data);
        return { buffer, filename: `${data.namHoc}_HK${data.hocKy}_${data.mssv}` };
    };

    app.get('/api/khtc/hoan-tra/get-don-xin-rut-hoc-phi', async (req, res) => {
        try {
            let item = req.query;
            if (!item) {
                throw 'Thông tin sinh viên không đúng, vui lòng kiểm tra lại';
            }

            let data = await app.model.tcHoanTra.getDonXinRut(item.mssv, parseInt(item.namHoc), parseInt(item.hocKy));

            if (!data) {
                throw 'Thông tin sinh viên không đúng, vui lòng kiểm tra lại';
            }

            const { buffer, filename } = await initHoSoHoanTra(data);
            res.send({ content: buffer, filename: filename + '.docx' });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });


    //TODO: =Bão= Phân quyền Permission Hook

    // app.assignRoleHooks.addRoles('tcThemGiaoDich', { id: 'tcGiaoDich:check', text: 'Quản lý giao dịch: Thêm giao dịch' });

    // app.assignRoleHooks.addHook('tcThemGiaoDich', async (req, roles) => {
    //     const userPermissions = req.session.user ? req.session.user.permissions : [];
    //     if (req.query.nhomRole && req.query.nhomRole == 'tcThemGiaoDich' && userPermissions.includes('manager:write')) {
    //         const assignRolesList = app.assignRoleHooks.get('tcThemGiaoDich').map(item => item.id);
    //         return roles && roles.length && assignRolesList.contains(roles);
    //     }
    // });

    // app.permissionHooks.add('staff', 'checkRoleQuanLyThemGiaoDich', (user, staff) => new Promise(resolve => {
    //     if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi && staff.maDonVi == '34') {
    //         app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:manage', 'tcGiaoDich:check', 'tcGiaoDich:cancel');
    //     }
    //     resolve();
    // }));

    // app.permissionHooks.add('assignRole', 'checkRoleQuanLyThemGiaoDich', (user, assignRoles) => new Promise(resolve => {
    //     const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'tcThemGiaoDich');
    //     inScopeRoles.forEach(role => {
    //         if (role.tenRole == 'tcGiaoDich:check') {
    //             app.permissionHooks.pushUserPermission(user, 'tcGiaoDich:check');
    //         }
    //     });
    //     resolve();
    // }));

    app.get('/api/khtc/hoan-tra/get-ngan-hang', app.permission.check('tcHoanTra:read'), async (req, res) => {
        try {
            const item = await app.model.fwStudent.get({ mssv: req.query.mssv });
            if (!item) {
                throw 'Dữ liệu sinh viên không tồn tại!';
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};