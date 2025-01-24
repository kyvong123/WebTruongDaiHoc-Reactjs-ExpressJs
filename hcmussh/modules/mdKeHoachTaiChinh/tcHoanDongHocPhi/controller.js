module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5014: { title: 'Gia hạn học phí', link: '/user/finance/hoan-dong-hoc-phi', icon: 'fa fa-pause', color: '#000', groupIndex: 2, backgroundColor: '#FFA07A' } },
    };

    app.permission.add(
        { name: 'tcHoanDongHocPhi:read', menu },
        { name: 'tcHoanDongHocPhi:write' },
        { name: 'tcHoanDongHocPhi:delete' },
        { name: 'tcHoanDongHocPhi:export' },
    );

    app.permissionHooks.add('staff', 'addRolesTcHoanDongHocPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcHoanDongHocPhi:read', 'tcHoanDongHocPhi:write', 'tcHoanDongHocPhi:delete', 'tcHoanDongHocPhi:export');
            resolve();
        } else resolve();
    }));

    app.readyHooks.add('addSocketListener:ListenManageHoanDong', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('tcManageHoanDong', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('tcHoanDongHocPhi:read') && socket.join('tcManageHoanDong');
        })
    });

    app.get('/user/finance/hoan-dong-hoc-phi', app.permission.check('tcHoanDongHocPhi:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/khtc/hoan-dong-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('tcHoanDongHocPhi:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);

            let searchTerm = `%${req.query.searchTerm || ''}%`;

            await app.model.tcHoanDongHocPhi.searchPage(pageNumber, pageSize, searchTerm, '', (error, page) => {
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
            res.send({ error });
        }
    });

    app.post('/api/khtc/hoan-dong-hoc-phi', app.permission.check('tcHoanDongHocPhi:write'), async (req, res) => {
        try {
            const data = req.body?.data;
            if (!data) {
                throw 'Thông tin không đúng';
            }

            const { mssv, lyDo, soTienThuTruoc, thoiHanThanhToan, ghiChu } = data;
            const ngayTao = Date.now();
            const modifier = req.session?.user?.email || '';

            if (!(mssv && lyDo && thoiHanThanhToan)) {
                throw 'Thông tin không đủ! Yêu cầu nhập đầy đủ thông tin';
            }

            // const checkSV = await app.model.tcHoanDongHocPhi.get({ mssv, namHoc, hocKy });
            // if (checkSV) {
            //     throw 'Đã tồn tại đơn hoãn đóng cho sinh viên';
            // }

            const item = await app.model.tcHoanDongHocPhi.create({
                mssv, lyDo, soTienThuTruoc, thoiHanThanhToan, ghiChu, timeCreated: ngayTao, timeModified: ngayTao, modifier, status: 1
            });

            // await Promise.all(listLoaiPhi.map(item => app.model.tcHocPhiSubDetail.update({ id: item.id }, { daHoanDongHocPhi: item.daHoanDongHocPhi })));

            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/khtc/hoan-dong-hoc-phi', app.permission.check('tcHoanDongHocPhi:write'), async (req, res) => {
        try {
            const { keys, changes } = req.body;
            if (!(keys && changes)) {
                throw 'Thông tin không đúng';
            }

            const modifier = req.session?.user?.email || '';
            const timeModified = Date.now();

            const item = await app.model.tcHoanDongHocPhi.get(keys);
            if (!item) {
                throw 'Thông tin không đúng';
            }

            let checkChanges = false;
            for (let field in changes) {
                if ((item[field] || changes[field]) && item[field] != changes[field]) checkChanges = true;
            }

            if (!checkChanges) throw ('Không có thay đổi dữ liệu');

            const newItem = await app.model.tcHoanDongHocPhi.update(keys, { ...changes, modifier, timeModified });
            res.send({ newItem });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // app.get('/api/khtc/hoan-dong-hoc-phi/get-cong-no', app.permission.check('tcHoanDongHocPhi:write'), async (req, res) => {
    //     try {
    //         let mssv = '2056181009', transDate = Date.now();
    //         const item = await app.model.tcHocPhiTransaction.getCongNo('2056181009', Date.now());
    //         // let hoanDong = await app.model.tcHoanDongHocPhi.get({
    //         //     statement: 'mssv = :mssv AND thoi_han_thanh_toan >= :transDate AND da_thanh_toan < so_tien_thu_truoc',
    //         //     parameter: { mssv, transDate }
    //         // });

    //         // if (hoanDong) {
    //         //     await app.model.tcHoanDongHocPhi.update({ id: hoanDong.id }, { daThanhToan: parseInt(hoanDong.daThanhToan) + parseInt(500000) });
    //         // }
    //         res.send({ item });
    //     } catch (error) {
    //         console.error(req.method, req.url, error);
    //         res.send({ error });
    //     }
    // });

    app.post('/api/khtc/hoan-dong-hoc-phi/xac-nhan', app.permission.check('tcHoanDongHocPhi:write'), async (req, res) => {
        try {
            const { id } = req.body;
            if (!id) {
                throw 'Thông tin không đúng';
            }

            const modifier = req.session?.user?.email || '';
            const timeModified = Date.now();

            const item = await app.model.tcHoanDongHocPhi.get({ id });

            if (!item) throw 'Không có thông tin đơn hoãn đóng!';
            if (parseInt(item.xacNhan)) throw 'Đơn hoãn đóng đã được xác nhận trước đó!';
            if (item.daThanhToan < item.soTienThuTruoc) throw 'Sinh viên chưa thanh toán khoản thu trước!';

            await app.model.tcHoanDongHocPhi.update({ id }, { xacNhan: 1, modifier, timeModified });
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/hoan-dong-hoc-phi/delete', app.permission.check('tcHoanDongHocPhi:delete'), async (req, res) => {
        try {
            const id = req.body.id || '';
            if (!id) {
                throw 'Thông tin không đúng';
            }

            const item = await app.model.tcHoanDongHocPhi.get({ id });
            if (!item) {
                throw 'Không tồn tại đơn hoãn đóng học phí';
            }

            await app.model.tcHoanDongHocPhi.update({ id }, { status: 0 });
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    const initDonHoanDong = async (data) => {
        const source = app.path.join(app.assetPath, 'khtc', 'hoanDongHocPhiTemplate', 'HDHP-template.docx');
        let dataInit = data;

        dataInit.soTienThuTruoc = dataInit.soTienThuTruoc.toString().numberDisplay() + ' đ (' + app.utils.numberToVnText(dataInit.soTienThuTruoc).trim() + ' đồng)';
        dataInit.thoiHanThanhToan = app.date.dateTimeFormat(new Date(Number(dataInit.thoiHanThanhToan)), 'dd/mm/yyyy');
        dataInit.ngayTao = app.date.viDateFormatString(new Date());
        const buffer = await app.docx.generateFile(source, dataInit);
        return { buffer, filename: `HDHP - ${data.mssv}` };
    };

    app.get('/api/khtc/hoan-dong-hoc-phi/export-don-hoan-dong', app.permission.check('tcHoanDongHocPhi:export'), async (req, res) => {
        try {
            let { id } = req.query;
            const data = await app.model.tcHoanDongHocPhi.downloadWord(id).then(res => res.rows?.[0]);

            if (!data || !id) {
                throw ('Không tìm thấy đơn hoãn đóng học phí của sinh viên');
            }

            const { buffer, filename } = await initDonHoanDong(data);
            res.send({ content: buffer, filename: filename + '.docx' });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/hoan-dong-hoc-phi/upload-template', app.permission.check('tcHoanDongHocPhi:write'), async (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Template');
            ws.columns = [
                { header: 'MSSV', key: 'mssv', width: 15, style: { numFmt: '@' } },
                { header: 'Họ và tên', key: 'hoVaTen', width: 30 },
                { header: 'Lý do xin hoãn đóng', key: 'lyDo', width: 70 },
                { header: 'Thời hạn thanh toán (dd/mm/yyyy)', key: 'thoiHanThanhToan', width: 35, style: { numFmt: '@' } },
                { header: 'Số tiền thu trước (VNĐ)', key: 'soTienThuTruoc', width: 25, style: { numFmt: '###,###' } },
                { header: 'Ghi chú', key: 'ghiChu', width: 40 },
            ];
            ws.addRow({
                mssv: '1912811', hoVaTen: 'TEST',
                lyDo: 'Gia đình có khó khăn về tài chính',
                thoiHanThanhToan: '25/11/2024',
                soTienThuTruoc: 1000000,
                ghiChu: ''
            });
            app.excel.attachment(workBook, res, 'TemplateDsGiaHan.xlsx');
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.uploadHooks.add('TcUploadListGiaHan', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadListGiaHan(req, fields, files, params, done), done, 'tcThongKe:export')
    );

    const uploadListGiaHan = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'TcUploadListGiaHan' && files.TcUploadListGiaHan && files.TcUploadListGiaHan.length) {

            const srcPath = files.TcUploadListGiaHan[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                try {
                    app.fs.deleteFile(srcPath);
                    const worksheet = workbook.getWorksheet(1);
                    let index = 2;
                    let countSuccess = 0;
                    let countFail = 0;
                    while (true) {
                        if (!worksheet.getCell('A' + index).value) {
                            break;
                        }
                        else {
                            worksheet.getCell('G1').value = 'Trạng thái';
                            worksheet.getCell('H1').value = 'Nội dung';

                            const mssv = `${worksheet.getCell('A' + index).value}`;
                            const lyDo = `${worksheet.getCell('C' + index).value}`;
                            let thoiHanThanhToan = `${worksheet.getCell('D' + index).value}`;
                            const soTienThuTruoc = `${worksheet.getCell('E' + index).value}`;
                            const ghiChu = `${worksheet.getCell('F' + index).value}`;
                            try {
                                const checkSv = await app.model.tcHocPhi.get({ mssv });
                                if (!checkSv) {
                                    throw 'Thông tin sinh viên không tồn tại';
                                }
                                if (!lyDo || !thoiHanThanhToan) {
                                    throw 'Thiếu lý do hoặc thời hạn thanh toán';
                                }
                                if (soTienThuTruoc && isNaN(soTienThuTruoc)) {
                                    throw 'Định dạng số tiền không hợp lệ';
                                }

                                const [day, month, year] = thoiHanThanhToan.split('/');
                                if (!day || !month || !year) {
                                    throw 'Định dạng thời gian không hợp lệ';
                                }

                                thoiHanThanhToan = new Date(`${month}/${day}/${year}`).getTime();
                                if (isNaN(thoiHanThanhToan)) {
                                    throw 'Định dạng thời gian không hợp lệ';
                                }

                                const checkExistGiaHan = await app.model.tcHoanDongHocPhi.get({
                                    statement: 'mssv = :mssv AND status = 1 AND thoiHanThanhToan >= :timeNow AND daThanhToan < soTienThuTruoc',
                                    parameter: { mssv, timeNow: Date.now() }
                                });
                                if (checkExistGiaHan) {
                                    throw 'Đang tồn tại đơn gia hạn có hiệu lực';
                                }
                                const ngayTao = Date.now();
                                const modifier = req.session?.user?.email || '';
                                await app.model.tcHoanDongHocPhi.create({
                                    mssv, lyDo, soTienThuTruoc: soTienThuTruoc || 0, thoiHanThanhToan, ghiChu, timeCreated: ngayTao, timeModified: ngayTao, modifier, status: 1
                                });
                                worksheet.getCell('G' + index).value = 'Thành công';
                                countSuccess++;

                            } catch (error) {
                                console.error({ error, mssv });
                                worksheet.getCell('G' + index).value = 'Không thành công';
                                worksheet.getCell('H' + index).value = error;
                                countFail++;
                            }
                        }
                        index++;
                    }
                    const buffer = await workbook.xlsx.writeBuffer();
                    done({ countFail, countSuccess, buffer, filename: 'Status_DS_Upload_GiaHan.xlsx' });
                }
                catch (error) {
                    console.error(error);
                    done && done({ error });
                }
            }
        }
    };
};