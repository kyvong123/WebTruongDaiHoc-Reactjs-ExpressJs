module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5003: { title: 'Quản lý học phí', link: '/user/finance/hoc-phi', icon: 'fa fa-table', backgroundColor: '#F5C842', groupIndex: 1 },
        },
    };

    const menuStatistic = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5006: { title: 'Thống kê', link: '/user/finance/statistic', icon: 'fa fa-pie-chart', groupIndex: 1 },
        },
    };

    app.permission.add({ name: 'tcHocPhi:read', menu }, { name: 'tcHocPhi:manage', menu }, { name: 'tcHocPhi:manage', menu: menuStatistic },
        'tcHocPhi:write', 'tcHocPhi:delete', 'tcHocPhi:export'
    );

    app.permissionHooks.add('staff', 'addRolesTcHocPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcHocPhi:manage', 'tcHocPhi:write', 'tcHocPhi:delete', 'tcHocPhi:read', 'tcHocPhi:export');
            resolve();
        } else resolve();
    }));


    app.get('/user/finance/hoc-phi', app.permission.check('tcHocPhi:read'), app.templates.admin);
    // app.get('/user/finance/bhyt', app.permission.check('tcHocPhi:write'), app.templates.admin);
    app.get('/user/finance/hoc-phi/:mssv', app.permission.check('tcHocPhi:manage'), app.templates.admin);
    app.get('/user/finance/statistic', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/finance/statistic/khac', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/finance/import-hoc-phi', app.permission.check('tcHocPhi:manage'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/khtc/page/:pageNumber/:pageSize', app.permission.check('tcHocPhi:read'), async (req, res) => {
        let { pageNumber, pageSize } = req.params;
        let searchTerm = `%${req.query.searchTerm || ''}%`;
        let filter = req.query.filter || {};
        if (!filter.namHoc || !filter.hocKy) {
            const settings = await getSettings();
            if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
            if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
        }
        const { namHoc, hocKy } = filter;
        filter = app.utils.stringify(filter, '');
        let mssv = '';

        app.model.tcHocPhi.searchPage(parseInt(pageNumber), parseInt(pageSize), mssv, searchTerm, filter, (error, page) => {
            if (error || !page) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, totalpaid: totalPaid, totalcurrent: totalCurrent } = page;
                const pageCondition = searchTerm;
                res.send({
                    list: list.map(item => item.mssv),
                    page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, settings: { namHoc, hocKy, totalPaid, totalCurrent } }
                });
            }
        });
    });

    app.get('/api/khtc/hoc-phi-transactions/:mssv', app.permission.check('tcHocPhi:manage'), async (req, res) => {
        try {
            const { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await getSettings(),
                mssv = req.params.mssv;
            let sinhVien = await app.model.fwStudent.get({ mssv });
            if (!sinhVien) throw 'Not found student!';
            else {
                const items = await app.model.tcHocPhiTransaction.getAll({
                    customerId: mssv,
                    hocKy,
                    namHoc
                });
                res.send({ items, sinhVien, hocKy, namHoc });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/user/hoc-phi', app.permission.check('tcHocPhi:read'), async (req, res) => {
        try {

            const mssv = req.query.mssv;
            const hocPhiLast = await app.model.tcHocPhi.get({ mssv }, 'namHoc, hocKy', 'namHoc, hocKy DESC');
            const { namHoc, hocKy } = hocPhiLast;
            const [hocPhi, hocPhiDetail] = await Promise.all([app.model.tcHocPhi.get({ mssv, namHoc, hocKy }), app.model.tcHocPhiDetail.getAll({ mssv, namHoc, hocKy })]);
            for (const item of hocPhiDetail) {
                const loaiPhi = await app.model.tcLoaiPhi.get({ id: item.loaiPhi });
                if (loaiPhi) item.tenLoaiPhi = loaiPhi.ten;
            }
            res.send({ hocPhi, hocPhiDetail });
        } catch (error) {
            console.error('ERROR Get student fee: ', error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/user/get-all-hoc-phi', app.permission.check('tcHocPhi:read'), async (req, res) => {
        try {
            const mssv = req.query.mssv,
                data = await app.model.tcHocPhi.getAllFeeOfStudent(mssv),
                { rows: hocPhiAll, hocphidetailall: hocPhiDetailAll } = data;
            res.send({ hocPhiAll: hocPhiAll.groupBy('namHoc'), hocPhiDetailAll: hocPhiDetailAll.groupBy('namHoc') });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/khtc/hoc-phi', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            const { item: { mssv, namHoc, hocKy }, changes } = req.body;
            delete changes['congNo'];
            let item = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy });
            if (item) {
                const hocPhiCu = item.hocPhi;
                item.hocPhi = changes.hocPhi;
                let congNo = await getCongNo(item);
                changes.congNo = congNo;
                const updateItem = await app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, changes);
                if (updateItem) {
                    const logItem = {
                        mssv: mssv,
                        hocKy: hocKy,
                        namHoc: namHoc,
                        duLieuCu: JSON.stringify({ hocPhi: hocPhiCu }),
                        duLieuMoi: JSON.stringify({ hocPhi: item.hocPhi })
                    };
                    app.tcHocPhiSaveLog(req.session.user.email, 'U', logItem);
                    item.congNo = congNo;
                    res.send({ item });
                } else throw 'Lỗi cập nhật học phí';
            } else throw 'Không tồn tại học phí';
        } catch (error) {
            res.send({ error });
        }

    });

    app.put('/api/khtc/hoc-phi/trang-thai', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            const { item: { mssv, namHoc, hocKy }, changes } = req.body;
            let item = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy });
            if (item) {
                const updateItem = await app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, { trangThai: changes.trangThai, ghiChu: changes.ghiChu });
                if (updateItem) {
                    res.send({});
                } else throw 'Lỗi cập nhật trạng thái';
            } else {
                throw 'Lỗi cập nhật trạng thái';
            }
        } catch (error) {
            res.send(error);
        }
    });
    app.post('/api/khtc/hoc-phi/multiple', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const ngayTao = Date.now();
            const dataMergeMssv = data.groupBy('mssv');
            let dataHocPhi = {};
            for (const sinhVien of Object.keys(dataMergeMssv)) {
                for (let index = 0; index < dataMergeMssv[sinhVien].length; index++) {
                    let { mssv, namHoc, hocKy } = dataMergeMssv[sinhVien][index];
                    const condition = { mssv, namHoc, hocKy };
                    let sumHocPhi = dataMergeMssv[sinhVien].filter(item => item.hocKy == hocKy && item.namHoc == namHoc).reduce((sum, item) => sum + parseInt(item.soTien), 0);
                    dataHocPhi = await app.model.tcHocPhi.get(condition);
                    if (dataHocPhi) {
                        let allTracsactionsCurrent = await app.model.tcHocPhiTransaction.getAll({ customerId: mssv, namHoc, hocKy });
                        const newCongNo = sumHocPhi - allTracsactionsCurrent.reduce((sumCurrentCongNo, item) => sumCurrentCongNo + parseInt(item.amount || 0), 0);
                        dataHocPhi = await app.model.tcHocPhi.update(condition, { hocPhi: sumHocPhi, ngayTao, congNo: newCongNo });
                    } else {
                        dataHocPhi = await app.model.tcHocPhi.create({ ...condition, hocPhi: sumHocPhi, congNo: sumHocPhi, ngayTao });
                    }
                    if (!dataHocPhi) throw 'Cập nhật học phí lỗi!';
                }

            }
            for (const khoanPhi of data) {
                let { mssv, soTien, loaiPhi, namHoc, hocKy } = khoanPhi;
                if (!khoanPhi.ngayTao) khoanPhi.ngayTao = ngayTao;
                const currentLoaiPhi = await app.model.tcHocPhiDetail.get({ mssv, namHoc, hocKy, loaiPhi });
                if (!currentLoaiPhi) {
                    await app.model.tcHocPhiDetail.create({ ...khoanPhi });
                } else {
                    await app.model.tcHocPhiDetail.update({ mssv, namHoc, hocKy, loaiPhi }, { soTien, ngayTao: khoanPhi.ngayTao });
                }
            }
            res.send({ item: dataHocPhi });
        } catch (error) {
            console.error('Error import', error);
            res.send({ error });
        }
    });

    const getCongNo = async (item) => {
        const { mssv, hocKy, namHoc, hocPhi } = item;
        const items = await app.model.tcHocPhiTransaction.getAll({
            customerId: mssv,
            hocKy,
            namHoc
        });
        const congNo = hocPhi - items.reduce((partialSum, item) => partialSum + parseInt(item.amount), 0);
        return congNo;
    };

    app.get('/api/khtc/download-excel-tach-mssv/:fileName', app.permission.check('tcHocPhi:write'), (req, res) => {
        let fileName = req.params.fileName;
        const srcPath = app.path.join(app.assetPath, 'tempTcHocPhiTachMssv', fileName);
        res.download(srcPath, 'TACH_MSSV_BIDV.xlsx');
    });

    app.post('/api/khtc/hoc-phi/remind-mail', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            let filter = req.body.filter || {};
            const settings = await getSettings();

            filter.namHoc = settings.hocPhiNamHoc;
            filter.hocKy = settings.hocPhiHocKy;

            filter = app.utils.stringify(filter, '');
            app.service.executeService.run({
                email: req.session.user.email,
                param: { filter },
                task: 'sendNotifyNhacNoHocPhi',
                path: '/user/finance/hoc-phi',
                isExport: 0,
                taskName: 'Gửi email nhắc nhở học phí',
            });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/hoc-phi/remind-mail/length', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            let filter = req.body.filter || {};
            const settings = await getSettings();

            filter.namHoc = settings.hocPhiNamHoc;
            filter.hocKy = settings.hocPhiHocKy;

            filter = app.utils.stringify(filter, '');

            let { rows: data } = await app.model.tcHocPhi.remindMail(filter);
            res.send({ length: data.length });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.readyHooks.add('TcHocPhi:deleteTempFolder', {
        ready: () => app.database && app.assetPath,
        run: () => {
            app.primaryWorker && app.schedule('0 0 * * *', () => {
                app.fs.deleteFolder(app.path.join(app.assetPath, 'tempTcHocPhiTachMssv'));
            });
        },
    });

    //Hook upload -----------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('TcHocPhiNoCu', (req, fields, files, params, done) =>
        app.permission.has(req, () => tcHocPhiImportNoCu(fields, files, done), done, 'tcHocPhi:write')
    );

    app.uploadHooks.add('TcHocPhiData', (req, fields, files, params, done) =>
        app.permission.has(req, () => tcHocPhiImportData(fields, files, done), done, 'tcHocPhi:write')
    );

    app.uploadHooks.add('TachMssv', (req, fields, files, params, done) =>
        app.permission.has(req, () => tcHocPhiTransactionTachMssv(fields, files, done), done, 'tcHocPhi:write')
    );

    const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'hocPhiHuongDan');

    app.get('/api/khtc/huong-dan-dong-hoc-phi', app.permission.check('tcHocPhi:manage'), async (req, res) => {
        const { hocPhiHuongDan } = await getSettings();
        res.send({ hocPhiHuongDan });
    });

    const tcHocPhiImportData = async (fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'TcHocPhiData' && files.TcHocPhiData && files.TcHocPhiData.length) {
            const srcPath = files.TcHocPhiData[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const items = [];
                    const duplicateDatas = [];
                    let index = 2;
                    try {
                        while (true) {
                            if (!worksheet.getCell('A' + index).value) {
                                done({ items, duplicateDatas });
                                break;
                            } else {
                                const namHoc = worksheet.getCell('A' + index).value;
                                const hocKy = (worksheet.getCell('B' + index).value || 'HK').replace('HK', '');
                                let loaiPhi = worksheet.getCell('D' + index).value;
                                const soTien = worksheet.getCell('E' + index).value;
                                const mssv = worksheet.getCell('C' + index).value?.toString().trim() || '';
                                const itemLoaiPhi = await app.model.tcLoaiPhi.get({ ten: loaiPhi });
                                loaiPhi = itemLoaiPhi.id;
                                const row = { namHoc, hocKy, mssv, soTien, loaiPhi, tenLoaiPhi: itemLoaiPhi.ten };
                                if (mssv) {
                                    //check MSSV
                                    let student = await app.model.fwStudent.get({ mssv });
                                    if (student) {
                                        let hoTenSinhVien = `${student.ho} ${student.ten}`,
                                            tmpRow = { ...row, hoTenSinhVien };
                                        let hocPhi = await app.model.tcHocPhiDetail.get({ mssv, namHoc, hocKy, loaiPhi });
                                        if (hocPhi) {
                                            const { soTien: curFee } = hocPhi;
                                            tmpRow = { ...tmpRow, curFee };
                                            duplicateDatas.push(mssv);
                                        }
                                        items.push(tmpRow);
                                    }
                                }
                                index++;

                            }
                        }
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

    const tcHocPhiTransactionTachMssv = async (fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'TachMssv' && files.TachMssv && files.TachMssv.length) {
            app.fs.createFolder(app.path.join(app.assetPath, 'tempTcHocPhiTachMssv'));
            const srcPath = files.TachMssv[0].path,
                fileName = app.path.basename(srcPath),
                newPath = app.path.join(app.assetPath, 'tempTcHocPhiTachMssv', fileName);
            let workbook = await app.excel.readFile(srcPath);

            if (workbook) {
                app.fs.deleteFile(srcPath);
                // app.fs.renameSync(srcPath, newPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    let index = 14;
                    try {
                        while (true) {
                            if (!worksheet.getCell('G' + index).value) {
                                await workbook.xlsx.writeFile(newPath);
                                done({ srcPath: fileName });
                                break;
                            } else {
                                let data = worksheet.getCell('G' + index).text,
                                    regex = /_96234(.*)_/,
                                    mssv = data.match(regex) ? data.match(regex)[1].substring(0, 10) : '';
                                worksheet.getCell('I' + index).value = mssv;
                                index++;
                            }
                        }

                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else done({ error: 'No worksheet!' });
            } else done({ error: 'No workbook!' });
        }
    };

    const yearDatas = () => {
        return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
    };

    const termDatas = ['HK1', 'HK2', 'HK3'];

    //Export xlsx
    app.get('/api/khtc/hoc-phi/download-template', app.permission.check('tcHocPhi:export'), async (req, res) => {
        let loaiPhiData = await app.model.tcLoaiPhi.getAll({ kichHoat: 1 });
        loaiPhiData = loaiPhiData.map(item => item.ten);
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Hoc_phi_Template');
        const defaultColumns = [
            { header: 'NĂM HỌC', key: 'namHoc', width: 20 },
            { header: 'HỌC KỲ', key: 'hocKy', width: 20 },
            { header: 'MSSV', key: 'maSoSinhVien', width: 20 },
            { header: 'LOẠI PHÍ', key: 'loaiPhi', width: 20 },
            { header: 'SỐ TIỀN', key: 'soTien', width: 25, style: { numFmt: '###,###' } },
        ];
        ws.columns = defaultColumns;
        const { dataRange: years } = workBook.createRefSheet('NAM_HOC', yearDatas());
        const { dataRange: terms } = workBook.createRefSheet('HOC_KY', termDatas);
        const { dataRange: type } = workBook.createRefSheet('LOAI_PHI', loaiPhiData);
        const rows = ws.getRows(2, 1000);
        rows.forEach((row) => {
            row.getCell('namHoc').dataValidation = { type: 'list', allowBlank: true, formulae: [years] };
            row.getCell('hocKy').dataValidation = { type: 'list', allowBlank: true, formulae: [terms] };
            row.getCell('loaiPhi').dataValidation = { type: 'list', allowBlank: true, formulae: [type] };
        });
        app.excel.attachment(workBook, res, 'Hoc_phi_Template.xlsx');
    });

    // const getTenLoaiPhi = (item, listLoaiPhi) => {
    //     return listLoaiPhi.filter(loaiPhi => loaiPhi.id == item)[0].ten;
    // };

    const tcHocPhiImportNoCu = async (fields, files, done) => {

        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'TcHocPhiNoCu' && files.TcHocPhiNoCu && files.TcHocPhiNoCu.length) {
            const srcPath = files.TcHocPhiNoCu[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                try {
                    app.fs.deleteFile(srcPath);
                    let index = 2;
                    const time = Date.now();
                    let listError = [];
                    let listSuccess = [];
                    let typeReturn = 0;
                    worksheet = workbook.getWorksheet('DS GUI BK');
                    const { namHoc, hocKy, loaiPhi, dotDong } = app.utils.parse(fields.data[0]);
                    const thongTinDotDong = await app.model.tcDotDong.get({ id: dotDong });


                    while (true) {
                        if (!worksheet.getCell('A' + index).value) {
                            break;
                        }
                        const checkLoaiPhi = await app.model.tcDotDongLoaiPhi.get({ loaiPhi, idDotDong: dotDong });
                        if (!thongTinDotDong || thongTinDotDong?.namHoc != namHoc || thongTinDotDong?.hocKy != hocKy || !checkLoaiPhi) {
                            typeReturn = 1;
                        } else {
                            while (true) {
                                if (!worksheet.getCell('A' + index).value) {
                                    break;
                                } else {
                                    const mssv = worksheet.getCell('B' + index).value;
                                    const soTien = worksheet.getCell('P' + index).value;
                                    const fullName = worksheet.getCell('C' + index).value;
                                    const checkDetail = await app.model.tcHocPhiDetail.get({ mssv, namHoc, hocKy, dotDong, loaiPhi });
                                    const hocPhi = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy });

                                    if (checkDetail) {
                                        await app.model.tcHocPhiDetail.update({ mssv, namHoc, hocKy, dotDong, loaiPhi }, { soTienDaDong: checkDetail.soTien - soTien, ghiChu: `Timestamp: ${time}, Còn nợ: ${soTien}` });

                                        if (hocPhi) {
                                            await app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, { congNo: soTien });
                                            listSuccess.push({ fullName, mssv, soTien });
                                        } else {
                                            listError.push({ fullName, mssv, soTien });
                                        }
                                    } else {
                                        await app.model.tcHocPhiDetail.create({ mssv, namHoc, hocKy, loaiPhi, soTien, active: 1, dotDong, ghiChu: `Timestamp: ${time}, Còn nợ: ${soTien}`, ngayTao: time });
                                        listSuccess.push({ fullName, mssv, soTien });
                                        if (hocPhi) {
                                            await app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, { hocPhi: hocPhi.hocPhi + soTien, congNo: hocPhi.congNo + soTien, ghiChu: `Timestamp: ${time}, Còn nợ thêm: ${soTien}` });
                                        } else {
                                            await app.model.tcHocPhi.create({ mssv, hocKy, namHoc, hocPhi: soTien, congNo: soTien, ngayTao: time, trangThai: 'MO', ghiChu: `Timestamp: ${time}` });
                                        }
                                        listSuccess.push({ fullName, mssv, soTien });
                                    }
                                }
                                index++;
                            }
                        }
                    }

                    done({ typeReturn, listError, listSuccess });
                } catch (error) {
                    console.error(error);
                    done({ error });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };

    app.get('/api/khtc/hoc-phi/download-excel', app.permission.check('tcHocPhi:export'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter, {});
            const settings = await getSettings();

            if (!filter.namHoc || !filter.hocKy) {
                if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
                if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
            }
            // filter = ;
            let data = await app.model.tcHocPhi.downloadExcelDetail('', app.utils.stringify(filter, ''));

            const list = data.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet(`${filter.namHoc}_${filter.hocKy}`);
            ws.columns = [
                { header: 'STT', key: 'stt', width: 10 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ VÀ TÊN LÓT', key: 'ho', width: 30 },
                { header: 'TÊN', key: 'ten', width: 10 },
                { header: 'GIỚI TÍNH', key: 'gioiTinh', width: 10 },
                { header: 'NGÀY SINH', key: 'ngaySinh', width: 10 },
                { header: 'BẬC ĐÀO TẠO', key: 'bacDaoTao', width: 10 },
                { header: 'HỆ ĐÀO TẠO', key: 'heDaoTao', width: 10 },
                { header: 'KHOA/BỘ MÔN', key: 'donVi', width: 20 },
                { header: 'MÃ NGÀNH', key: 'maNganh', width: 10 },
                { header: 'TÊN NGÀNH HỌC', key: 'tenNganh', width: 20 },
                { header: 'HỌC KỲ', key: 'term', width: 10 },
                { header: 'NĂM HỌC', key: 'year', width: 20 },
                { header: 'SỐ TIỀN THU (VND)', key: 'hocPhi', width: 15 },
                { header: 'ĐÃ THU (VND)', key: 'congNo', width: 15 },
                { header: 'THỜI GIAN ĐÓNG', key: 'thoiGian', width: 20 },
                { header: 'MÃ HOÁ ĐƠN', key: 'idTrans', width: 40 },
                { header: 'GHI CHÚ', key: 'ghiChu', width: 40 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            // ws.getRow(1).height = 0;
            ws.getRow(1).font = {
                name: 'Times New Roman',
                family: 4,
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };
            list.forEach((item, index) => {
                item.nganHang = item.nganHang.split(', ');
                item.ghiChu = item.ghiChu.split(', ');
                for (let i = 0; i < item.ghiChu.length; i++) {
                    if (item.nganHang[i] != 'n/a') { item.ghiChu[i] = item.nganHang[i]; }
                }

                ws.getRow(index + 2).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
                ws.getRow(index + 2).font = { name: 'Times New Roman' };
                ws.getCell('A' + (index + 2)).value = index + 1;
                ws.getCell('B' + (index + 2)).value = item.mssv;
                ws.getCell('C' + (index + 2)).value = item.ho?.toUpperCase() || '';
                ws.getCell('D' + (index + 2)).value = item.ten?.toUpperCase() || '';
                ws.getCell('E' + (index + 2)).value = item.gioiTinh == 1 ? 'Nam' : 'Nữ';
                ws.getCell('F' + (index + 2)).value = app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy');
                ws.getCell('G' + (index + 2)).value = item.tenBacDaoTao;
                ws.getCell('H' + (index + 2)).value = item.tenLoaiHinhDaoTao;
                ws.getCell('I' + (index + 2)).value = item.tenKhoa;
                ws.getCell('J' + (index + 2)).value = item.maNganh;
                ws.getCell('K' + (index + 2)).value = item.tenNganh;
                ws.getCell('L' + (index + 2)).value = filter.hocKy;
                ws.getCell('M' + (index + 2)).value = `${filter.namHoc} - ${parseInt(filter.namHoc) + 1}`;
                ws.getCell('N' + (index + 2)).value = item.hocPhi.toString().numberDisplay();
                ws.getCell('O' + (index + 2)).value = (parseInt(item.hocPhi) - parseInt(item.congNo)).toString().numberDisplay();
                ws.getCell('P' + (index + 2)).value = item.ngayGiaoDich ? app.date.dateTimeFormat(new Date(Number(item.ngayGiaoDich)), 'HH:MM:ss dd/mm/yyyy') : '';
                ws.getCell('Q' + (index + 2)).value = item.TransactionId;
                ws.getCell('R' + (index + 2)).value = item.ghiChu.join('\n');
                ws.getCell('L' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'right' };
                ws.getCell('M' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'right' };
                ws.getCell('N' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'right' };
                ws.getCell('O' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'right' };
                ws.getCell('P' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'center' };
                ws.getCell('E' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'center' };
                ws.getCell('F' + (index + 2)).alignment = { ...ws.getRow(index + 2).alignment, horizontal: 'center' };

            });

            let fileName = `HOC_PHI_NH_${filter.namHoc}_${parseInt(filter.namHoc) + 1}_HK${filter.hocKy}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const countGroupBy = (array, key) => {
        let data = array.groupBy(key);
        Object.keys(data).forEach(item => {
            data[item] = data[item].length;
        });
        return data;
    };

    app.get('/api/khtc/hoc-phi/item/:mssv', app.permission.check('tcHocPhi:read'), async (req, res) => {
        try {
            let mssv = req.params.mssv,
                { namHoc, hocKy } = req.query;
            namHoc = parseInt(namHoc);
            hocKy = parseInt(hocKy);
            if (!mssv || !Number.isInteger(namHoc) || !Number.isInteger(hocKy)) throw { errorMessage: 'Dữ liệu học phí không hợp lệ' };
            const hocPhi = await app.model.tcHocPhi.get({ mssv, hocKy, namHoc });
            const transaction = await app.model.tcHocPhiTransaction.getAll({ customerId: mssv, hocKy, namHoc });
            if (!hocPhi) throw { errorMessage: 'Không tìm thấy dữ liệu học phí' };
            res.send({ hocPhi, transaction });
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/khtc/get-hoc-phi-sinh-vien', app.permission.check('tcHocPhi:read'), async (req, res) => {
        try {
            let filter = req.query.data;
            const tongHocPhiSinhVien = await app.model.tcHocPhi.get(filter, 'hocPhi, congNo,namHoc,hocKy, soDuPsc');
            filter = app.utils.stringify({ ...filter, isStaff: 1 });
            const data = await app.model.tcHocPhi.sinhVienGetHocPhi(filter);
            res.send({ hocPhiDetail: data.rows, hocPhiTong: tongHocPhiSinhVien });
        } catch (error) {
            res.send({ error });
        }
    });
    app.get('/api/khtc/hoc-phi-sub-detail/all', app.permission.check('tcHocPhi:read'), async (req, res) => {
        try {
            let filter = req.query.data;
            if (!filter) {
                throw ('Không thể truy cập học phí, vui lòng thử lại sau');
            }
            let sinhVien = await app.model.fwStudent.get({ mssv: (filter.mssv || '') });
            let { rows: subDetail } = await app.model.tcHocPhi.getDetailHocPhi(filter.mssv);
            subDetail = subDetail.filter(item => item.namHoc == filter.namHoc && item.hocKy == filter.hocKy);
            res.send({ subDetail, khoaSinhVien: sinhVien.namTuyenSinh });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/khtc/hoc-phi/active-loai-phi', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            let { data, value } = req.body;
            if (!data || value === null) throw 'Thông tin cập nhật không chính xác!';

            const { mssv, namHoc, hocKy, loaiPhi, dotDong } = data;
            const active = Number(value);
            const detail = await app.model.tcHocPhiDetail.get({ mssv, namHoc, hocKy, dotDong, loaiPhi, active: Number(!active) });

            if (!detail) throw 'Không tồn tại loại phí của sinh viên!';
            const ghiChu = `${active ? 'Kích hoạt' : 'Tắt kích hoạt'} bởi ${req.session?.user?.email}`;

            if (!active) {
                await app.model.tcHocPhiDetail.update({ mssv, namHoc, hocKy, dotDong, loaiPhi }, { active, ghiChu, soTienDaDong: 0 });
                let soDuHocPhi = await app.model.tcSoDuHocPhi.get({ mssv });
                if (!soDuHocPhi) soDuHocPhi = await app.model.tcSoDuHocPhi.create({ mssv, soTien: 0 });
                await app.model.tcSoDuHocPhi.update({ mssv }, { soTien: parseInt(soDuHocPhi.soTien) + parseInt(detail.soTienDaDong) });
            }
            else {
                await app.model.tcHocPhiDetail.update({ mssv, namHoc, hocKy, dotDong, loaiPhi }, { active, ghiChu });
            }

            await app.model.tcDotDong.capNhatDongTien(mssv);
            res.send({ mssv, namHoc, hocKy });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
    //Statistic -------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/khtc/statistic', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const settings = await getSettings();

            if (!filter.namHoc || !filter.hocKy) {
                if (!filter.namHoc) filter.namHoc = settings.hocPhiNamHoc;
                if (!filter.hocKy) filter.hocKy = settings.hocPhiHocKy;
            }
            filter = app.utils.stringify(filter);
            const data = await app.model.tcHocPhi.getStatistic(filter);

            let dataByStudents = data.rows,
                dataTransactions = data.transactions;
            let dataByDate = dataTransactions.map(item => ({ ...item, 'date': app.date.viDateFormat(new Date(Number(item.ngayDong))) })),
                dataInvoiceByDate = data.invoice.map(item => ({ ...item, date: app.date.viDateFormat(new Date(Number(item.ngayPhatHanh))) }));
            let totalStudents = dataByStudents.length,
                totalByDate = countGroupBy(dataByDate, 'date'),
                totalTransactions = dataTransactions.length,
                totalCurrentMoney = dataTransactions.reduce((sum, item) => sum + parseInt(item.khoanDong), 0),
                totalInvoices = data.invoice.length,
                totalInvoiceByDate = countGroupBy(dataInvoiceByDate, 'date'),
                totalCancelInvoices = dataInvoiceByDate.reduce((total, item) => item.lydoHuy ? total + 1 : total, 0),
                amountByDepartment = countGroupBy(dataTransactions, 'tenNganh'),
                amountByBank = countGroupBy(dataTransactions, 'nganHang'),
                amountByEduLevel = countGroupBy(dataByStudents, 'tenBacDaoTao'),
                amountByEduMethod = countGroupBy(dataByStudents, 'loaiHinhDaoTao'),
                amountPaid = dataByStudents.filter(item => item.congNo <= 0).length,
                amountNotPaid = totalStudents - amountPaid;
            //
            const statistic = { totalStudents, totalTransactions, totalInvoices, amountByBank, amountByEduLevel, amountByEduMethod, amountPaid, amountNotPaid, totalCurrentMoney, amountByDepartment, totalByDate, totalInvoiceByDate, totalCancelInvoices };
            res.send({ statistic, settings });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/thong-ke-theo-mon', app.permission.check('tcHocPhi:export'), async (req, res) => {
        try {
            let filter = req.query.filter;
            if (!filter) {
                throw ('Dữ liệu gặp sự cố, vui lòng thử lại sau');
            }

            const { rows: data } = await app.model.tcHocPhi.excelThongKeTongHop(filter);

            if (!data) {
                throw ('Dữ liệu gặp sự cố, vui lòng thử lại sau');
            }

            const workBook = app.excel.create();
            let fileName = 'Thống kê theo môn học.xlsx';

            const ws = workBook.addWorksheet('Danh sách');
            let listHeader = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'Họ và tên', key: 'mssv', width: 45 },
                { header: 'Năm học', key: 'namHoc', width: 10 },
                { header: 'Học kỳ', key: 'hocKy', width: 10 },
                { header: 'Mã môn học', key: 'maMonHoc', width: 30 },
                { header: 'Tên môn học', key: 'tenMonHoc', width: 45 },
                { header: 'Số tiền', key: 'soTien', width: 20 },
                { header: 'Đã đóng', key: 'daDong', width: 20 },
                { header: 'Còn lại', key: 'conLai', width: 20 },
            ];
            ws.columns = listHeader;
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = {
                name: 'Times New Roman',
                size: 12,
                bold: true,
                color: { argb: 'FF000000' }
            };

            data.forEach((item, index) => {
                item.tenMonHoc = app.utils.parse(item.tenMonHoc)?.vi || '';

                ws.getRow(index + 2).font = { name: 'Times New Roman' };
                ws.getCell('A' + (index + 2)).value = index + 1;
                ws.getCell('B' + (index + 2)).value = item.mssv;
                ws.getCell('C' + (index + 2)).value = item.hoVaTen;
                ws.getCell('D' + (index + 2)).value = `${item.namHoc} - ${item.namHoc + 1}`;
                ws.getCell('E' + (index + 2)).value = item.hocKy;
                ws.getCell('F' + (index + 2)).value = item.maMonHoc;
                ws.getCell('G' + (index + 2)).value = item.tenMonHoc;
                ws.getCell('H' + (index + 2)).value = item.soTien;
                ws.getCell('I' + (index + 2)).value = item.daDong;
                ws.getCell('J' + (index + 2)).value = item.conLai;
            });

            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/khtc/hoc-phi/xoa-psc', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            const { mssv, namHoc, hocKy } = req.body;
            const hocPhi = await app.model.tcHocPhi.get({ mssv, namHoc, hocKy });
            if (!hocPhi?.soDuPsc || hocPhi.soDuPsc == 0) {
                throw 'Không tồn tại số dư PSC';
            } else {
                const { rows: listAllLoaiPhi } = await app.model.tcDotDong.getAllDotDongHocPhi(mssv);
                const loaiPhiHocPhi = listAllLoaiPhi.find(item => item.namHoc == namHoc && item.hocKy == hocKy);
                const { idDotDong, loaiPhi } = loaiPhiHocPhi;
                const checkLoaiPhi = await app.model.tcHocPhiDetail.get({ mssv, namHoc, hocKy, loaiPhi });
                if (checkLoaiPhi) {
                    const hocPhiMoi = await app.model.tcHocPhi.update({ mssv, namHoc, hocKy }, { congNo: hocPhi.hocPhi, soDuPsc: 0 });
                    await app.model.tcHocPhiDetail.update({ mssv, namHoc, hocKy, loaiPhi }, { soTienDaDong: 0 });
                    await app.model.tcHocPhiSubDetail.update({ mssv, idDotDong, loaiPhi }, { soTienDaDong: 0 });
                    const logItem = {
                        mssv,
                        namHoc,
                        hocKy,
                        duLieuCu: JSON.stringify({ hocPhi }),
                        duLieuMoi: JSON.stringify({ hocPhi: hocPhiMoi })
                    };
                    app.tcHocPhiSaveLog(req.session.user.email, 'P', logItem);
                } else {
                    throw 'Sinh viên không có học phí ở đợt đóng này';
                }
                res.send({});
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // AP DUNG LOAI PHI

    app.put('/api/khtc/hoc-phi/tat-tinh-phi', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            const { item } = req.body;
            const { namHoc, hocKy, mssvInDKHP: mssv, maHocPhan, maMonHoc, tenLoaiPhi: tenMonHoc, tongTinChi, tongSoTiet } = item;

            const checkDangKyHocPhan = await app.model.dtDangKyHocPhan.get({ mssv, maHocPhan, namHoc: `${namHoc} - ${parseInt(namHoc) + 1}`, hocKy });

            const timeModified = Date.now();
            const modifier = req.session.user.email;

            if (!checkDangKyHocPhan) {
                throw 'Học phần không tồn tại';
            }

            await app.model.dtDangKyHocPhan.update({ mssv, maHocPhan, namHoc: `${namHoc} - ${parseInt(namHoc) + 1}`, hocKy }, { tinhPhi: checkDangKyHocPhan.tinhPhi ? 0 : 1, timeModified });
            // await app.model.tcDotDong.syncFilter(mssv, parseInt(namHoc), hocKy, modifier);
            await app.model.tcDotDong.dongBoHocPhi(parseInt(namHoc), hocKy, mssv, modifier, 1, 1);
            await app.model.tcHocPhiSubDetailLog.create({
                mssv, maHocPhan, maMonHoc, tenMonHoc,
                namHoc: `${namHoc} - ${parseInt(namHoc) + 1}`, hocKy,
                soTinChi: tongTinChi, tongSoTiet,
                modifier, timeModified,
                thaoTac: 'L', sync: 1
            });
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/hoc-phi/bhyt/data', app.permission.check('tcHocPhi:read'), async (req, res) => {
        try {
            const { item } = req.query;
            if (!item) throw 'Không tìm thấy thông tin sinh viên!';

            let checkBhyt = await app.model.svBaoHiemYTe.get({ mssv: item.mssv, namDangKy: parseInt(item.namHoc) + 1 });
            res.send(checkBhyt);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/hoc-phi/bhyt/change-dien-dong', app.permission.check('tcHocPhi:read'), async (req, res) => {
        try {
            const { id, dienDong } = req.body;
            const email = req.session?.user?.email || '';
            const currentDotDangKy = await app.model.svDotDangKyBhyt.get({}, '*', 'timeModified DESC');

            if (!id || !dienDong) throw 'Thông tin lỗi, vui lòng kiểm tra lại!';

            let item = await app.model.svBaoHiemYTe.update({ id }, { dienDong, userModified: email });
            if (!item) throw 'Gặp lỗi trong lúc cập nhật thông tin!';
            await app.model.svBaoHiemYTe.themTaiChinhBhyt(item.mssv, parseInt(currentDotDangKy.namDangKy) - 1, 2, dienDong);
            res.send(item);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/hoc-phi/thongBao/length', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            let filter = req.body.filter || {};
            filter = app.utils.stringify(filter, '');
            let { rows: data } = await app.model.fwStudent.getEmailSvAll(filter);
            res.send({ length: data.length });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/hoc-phi/thongBao', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            let { filter, content } = req.body;
            filter = app.utils.stringify(filter || {}, '');
            app.service.executeService.run({
                email: req.session.user.email,
                param: {
                    filter,
                    title: content.title,
                    targetLink: '/user/hoc-phi',
                    subTitle: content.subTitle,
                    icon: content.icon,
                    iconColor: content.iconColor
                },
                task: 'sendNotifySv',
                path: '/user/finance/hoc-phi',
                isExport: 0,
                taskName: 'Gửi thông báo nhắc nhở học phí',
            });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

};