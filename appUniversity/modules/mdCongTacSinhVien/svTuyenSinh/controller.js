module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: { 6116: { title: 'Tuyển sinh', link: '/user/ctsv/tuyen-sinh', icon: 'fa-graduation-cap' } },
    };
    app.permission.add(
        { name: 'ctsvTuyenSinh:read', menu },
        { name: 'ctsvTuyenSinh:write' },
        { name: 'ctsvTuyenSinh:delete' },
    );

    app.get('/user/ctsv/tuyen-sinh', app.permission.check('ctsvTuyenSinh:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleCtsvTuyenSinh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvTuyenSinh:read', 'ctsvTuyenSinh:write');
            resolve();
        } else resolve();
    }));


    app.uploadHooks.add('DssvImportDataTuyenSinh', (req, fields, files, params, done) =>
        app.permission.has(req, () => dssvImportDataTuyenSinh(fields, files, params, done), done, 'ctsvTuyenSinh:write')
    );

    const dssvImportDataTuyenSinh = async (fields, files, params, done) => {
        try {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'DssvImportDataTuyenSinh' && files.DssvImportDataTuyenSinh) {
                const srcPath = files.DssvImportDataTuyenSinh[0].path;
                let workbook = app.excel.create();
                workbook = await app.excel.readFile(srcPath);
                if (!workbook) throw 'Error: workbook not found';
                const dataSheet = workbook.getWorksheet(1);
                if (!dataSheet) throw 'Error: dataSheet not found';

                // Some variable    
                const lsNganh = await app.model.dtNganhDaoTao.getAll(null, 'maNganh, maLop, khoa'),
                    mapMaNganh = Object.assign({}, ...lsNganh.map(nganh => ({ [nganh.maNganh]: nganh }))),
                    lsDoiTuongTuyenSinh = await app.model.dmSvDoiTuongTs.getAll(null, 'ma, ten'),
                    mapMaDoiTuongTs = Object.assign({}, ...lsDoiTuongTuyenSinh.map(doiTuong => ({ [Number(doiTuong.ma)]: doiTuong })));


                // Some helper function
                const splitDate = (dateString, _default = '') => {
                    if (typeof dateString == 'string') {
                        const [d, m, y] = dateString.split(/[,.\s\/\-_]/),
                            mil = new Date(y, m - 1, d).getTime();
                        if (d && m && y) return isNaN(mil) ? _default : mil;
                    }
                    if (dateString instanceof Date) {
                        return dateString.getTime();
                    }
                    return _default;
                };

                let preset = {
                    loaiSinhVien: 'L1',
                    tinhTrang: 11,
                    maKhoa: '',
                    namTuyenSinh: '2023',
                    ngayNhapHoc: -1,
                    bacDaoTao: 'DH',
                    canEdit: 0,
                    khoaSinhVien: '2023',
                };
                const parseData = (row) => {
                    const getText = (column, _default = '') => {
                        const val = row.getCell(column).text?.trim().normalize();
                        return val == '' ? _default : val;
                    };
                    const data = {
                        mssv: getText('A'),
                        cmnd: getText('B'),
                        ho: getText('C'),
                        ten: getText('D'),
                        maNganh: getText('F'),
                        tenNganh: mapMaNganh[getText('F')]?.tenNganh,
                        loaiHinhDaoTao: getText('F').toLowerCase().includes('clc') ? 'CLC' : 'CQ',
                        phuongThucTuyenSinh: getText('I'),
                        diemThi: Number(getText('K')).toFixed(2),
                        gioiTinh: getText('M').toLowerCase() == 'nữ' ? 2 : 1,
                        tenGioiTinh: getText('M'),
                        ngaySinh: splitDate(getText('N')),
                        khuVucTuyenSinh: 'KV' + (getText('P') == '2NT' ? '2-NT' : getText('P')),
                        doiTuongTuyenSinh: mapMaDoiTuongTs[Number(getText('Q'))]?.ma || '',
                        emailTruong: getText('R'),
                        khoa: mapMaNganh[getText('F')]?.khoa,
                        ...preset
                    };
                    return data;
                };

                const result = [];

                dataSheet.eachRow((row, rowNum) => {
                    try {
                        if (rowNum == 1) return;
                        // const sv = await app.model.fwStudent.get({ mssv });
                        const data = parseData(row);

                        result.push(data);
                    } catch (error) {
                        console.error({ rowNum, error });
                    }
                });
                done && done({ dssvUpload: result });
            }
        } catch (error) {
            console.error({ error });
        }
    };

    app.post('/api/ctsv/tuyen-sinh/create-multi', app.permission.check('ctsvTuyenSinh:write'), async (req, res) => {
        try {
            const { dssv } = req.body;
            const result = {};
            for (let i = 0; i < dssv.length; i++) {
                const studentInfo = { ...dssv[i] };
                const checkStudent = await app.model.fwStudent.get({ mssv: studentInfo.mssv }, 'mssv, ten');
                if (!checkStudent) {
                    const item = await app.model.fwStudent.create({ ...studentInfo });
                    if (item) {
                        await Promise.all([
                            app.model.fwStudent.initCtdtRedis(studentInfo.mssv),
                            app.model.dtCauHinhDotDkhp.checkAndUpdateStudent(studentInfo.mssv)
                        ]);
                        result[item.mssv] = { tinhTrang: 1, ten: 'Tạo thành công' };
                    }
                } else {
                    result[studentInfo.mssv] = { tinhTrang: 2, ten: 'Sinh viên đã tồn tại' };
                }
            }
            res.send({ result });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/tuyen-sinh/upload-dssv/template', app.permission.check('ctsvTuyenSinh:read'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Upload dssv');
            ws.columns = [
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'CMND', key: 'cmnd', width: 15 },
                { header: 'Họ và tên lót', key: 'ho', width: 20 },
                { header: 'Tên', key: 'ten', width: 10 },
                { header: 'Thu tu NV', key: 'thuTuNv', width: 10 },
                { header: 'Mã ngành', key: 'maNganh', width: 15 },
                { header: 'Tên ngành', key: 'tenNganh', width: 15 },
                { header: 'Tổ hợp', key: 'toHop', width: 15 },
                { header: 'Mã phương thức', key: 'maPhuongThuc', width: 15 },
                { header: 'Phương thức xét tuyển', key: 'phuongThucXetTuyen', width: 15 },
                { header: 'Điểm xét tuyển', key: 'diemXetTuyen', width: 15 },
                { header: 'Điểm chuẩn', key: 'diemChuan', width: 15 },
                { header: 'Giới tính', key: 'gioiTinh', width: 15 },
                { header: 'Ngày sinh', key: 'ngaySinh', width: 15 },
                { header: 'Điểm thi (Chưa tính điểm ưu tiên)', key: 'diemThi', width: 15 },
                { header: 'KVUT', key: 'kvut', width: 15 },
                { header: 'Đối tượng', key: 'doiTuong', width: 15 },
                { header: 'Email', key: 'email', width: 15 },
                { header: 'Mật khẩu email', key: 'matKhauEmail', width: 15 },
                { header: 'Tài khoản LMS', key: 'taiKhoanLms', width: 15 },
                { header: 'Mật khẩu LMS', key: 'matKhauLms', width: 15 },
            ];
            ws.addRow({
                mssv: '12345',
                ho: 'student',
                ten: 'test',
                thuTuNv: '1',
                ngaySinh: '01/02/2023',
                cmnd: '070701011660',
                maNganh: '7320101',
                tenNganh: 'Báo chí',
                toHop: 'C00',
                maPhuongThuc: '100',
                phuongThucXetTuyen: 'Xét tuyển dựa vào kết quả kỳ thi THPT',
                diemXetTuyen: '26.4',
                diemChuan: '25.5',
                gioiTinh: 'Nữ',
                diemThi: '24.75',
                kvut: '1',
                doiTuong: '0',
                email: '12345@hcmussh.edu.vn',
                matKhauEmail: '12345',
                taiKhoanLms: '12345678',
                matKhauLms: '12345678'
            });
            app.excel.attachment(workBook, res, 'DSSV_TRUNG_TUYEN_UPLOAD_Template.xlsx');
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

};