module.exports = app => {
    const menuCtsv = {
        parentMenu: app.parentMenu.baoHiemYTe,
        menus: {
            7901: { title: 'Cấu hình đợt đăng ký BHYT', icon: 'fa-cogs', link: '/user/bao-hiem-y-te/cau-hinh', backgroundColor: '#808080' }
        }
    };

    app.permission.add(
        { name: 'ctsvDotBhyt:read', menu: menuCtsv },
        'ctsvDotBhyt:write',
        'ctsvDotBhyt:delete'
    );

    app.permissionHooks.add('staff', 'addRoleCtsvDottBhyt', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == 32) {
            app.permissionHooks.pushUserPermission(user, 'ctsvDotBhyt:read', 'ctsvDotBhyt:write');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/bao-hiem-y-te/cau-hinh', app.permission.check('ctsvDotBhyt:read'), app.templates.admin);

    // API ==============================================================================================
    const mapperDienDong = { 12: 23, 15: 41 },
        mapperSoTien = { 15: 704025, 12: 563220, 0: 0 };

    app.get('/api/bhyt/dot-dang-ky-bhyt/all', app.permission.check('ctsvDotBhyt:read'), async (req, res) => {
        try {
            const items = await app.model.svDotDangKyBhyt.getAll({}, '*', 'thoiGianBatDau DESC');
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/bhyt/dot-dang-ky-bhyt', app.permission.check('ctsvDotBhyt:read'), async (req, res) => {
        try {
            const { ma } = req.query;
            const item = await app.model.svDotDangKyBhyt.get({ ma });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/bhyt/dot-dang-ky-bhyt/data', app.permission.check('ctsvDotBhyt:read'), async (req, res) => {
        try {
            const { ma } = req.query;
            const searchTerm = req.query.condition ? req.query.condition : '';
            const filter = req.query?.filter || {};
            const item = await app.model.svDotDangKyBhyt.get(ma ? { ma } : {}, '*', 'timeModified DESC');
            filter.thoiGianBatDau = item.thoiGianBatDau;
            filter.thoiGianKetThuc = item.thoiGianKetThuc;
            let { rows: dataBhyt, datachuho: dataChuHo, datathanhvien: dataThanhVien } = await app.model.svBaoHiemYTe.searchPage(searchTerm, app.utils.stringify(filter));
            res.send({ item, dataBhyt, dataChuHo, dataThanhVien });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/bhyt/dot-dang-ky-bhyt', app.permission.check('ctsvDotBhyt:write'), async (req, res) => {
        try {
            const { data } = req.body,
                user = req.session.user,
                timeModified = Date.now();
            if (data.thoiGianBatDau && data.thoiGianKetThuc) {
                // Tìm những đọt trùng với đợt mới
                const items = await app.model.svDotDangKyBhyt.getAll({
                    statement: ' thoiGianKetThuc >= :thoiGianBatDau and thoiGianBatDau <= :thoiGianKetThuc ',
                    parameter: { thoiGianBatDau: data.thoiGianBatDau, thoiGianKetThuc: data.thoiGianKetThuc }
                }, '*', 'thoiGianBatDau DESC');
                if (items && items.length) throw `Thời gian bị chồng với đợt ${items[0].ma}`;
            }
            const item = await app.model.svDotDangKyBhyt.create({ ...data, userModified: user.email, timeModified });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/bhyt/dot-dang-ky-bhyt', app.permission.check('ctsvDotBhyt:write'), async (req, res) => {
        try {
            const { ma, changes = {} } = req.body,
                user = req.session.user,
                timeModified = Date.now();
            if (changes.thoiGianBatDau && changes.thoiGianKetThuc) {
                // Tìm những đọt trùng với đợt mới
                const items = await app.model.svDotDangKyBhyt.getAll({
                    statement: ' thoiGianKetThuc >= :thoiGianBatDau and thoiGianBatDau <= :thoiGianKetThuc and ma != :ma',
                    parameter: { thoiGianBatDau: changes.thoiGianBatDau, thoiGianKetThuc: changes.thoiGianKetThuc, ma: changes.ma }
                }, '*', 'thoiGianBatDau DESC');
                if (items && items.length) throw `Thời gian bị chồng với đợt ${items[0].ma}`;
            }
            const item = await app.model.svDotDangKyBhyt.update({ ma }, { ...changes, userModified: user.email, timeModified });
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/bhyt/dot-dang-ky-bhyt/khoan-thu', app.permission.check('ctsvDotBhyt:write'), async (req, res) => {
        try {
            const { data: dataDotDangKy } = req.body,
                { thoiGianBatDau, thoiGianKetThuc, namDangKy } = dataDotDangKy,
                thoiGian = Date.now();
            const dataBhyt = await app.model.svBaoHiemYTe.getAll({
                statement: '(:thoiGianBatDau <= thoiGian AND thoiGian <= :thoiGianKetThuc) AND namDangKy = :namDangKy AND maThanhToan is NULL',
                parameter: {
                    thoiGianBatDau,
                    thoiGianKetThuc,
                    namDangKy
                }
            }, '*');
            let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');

            const listMssv = dataBhyt.map(item => item.mssv);
            // namHoc, hocKy, mssv, loaiPhi: mapperDienDong[item.dienDong]
            const dataHocPhiDetail = await app.model.tcHocPhiDetail.getAll({
                statement: 'namHoc = :namHoc AND hocKy = :hocKy AND mssv in (:listMssv)',
                parameter: {
                    namHoc, hocKy, listMssv
                }
            });
            // let currentFee = await app.model.tcHocPhi.get({ namHoc, hocKy, mssv });
            const dataHocPhi = await app.model.tcHocPhi.getAll({
                statement: 'namHoc = :namHoc AND hocKy = :hocKy AND mssv in (:listMssv)',
                parameter: {
                    namHoc, hocKy, listMssv
                }
            });
            dataBhyt.forEach(async item => {
                const { mssv } = item;
                // nếu người dùng được miến trước đó thì không có loại phí
                let loaiPhi = { soTien: 0 };
                if (mapperDienDong[item.dienDong])
                    // loaiPhi = await app.model.tcHocPhiDetail.get({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[item.dienDong] });
                    loaiPhi = dataHocPhiDetail.find(hp => (hp.mssv == mssv && hp.loaiPhi == mapperDienDong[item.dienDong]));

                const diff = mapperSoTien[item.dienDong] - loaiPhi.soTien;

                // Tạm không cho sinh viên thay đổi gói bhyt nếu đã đóng tiền
                // let currentFee = await app.model.tcHocPhi.get({ namHoc, hocKy, mssv });
                let currentFee = dataHocPhi.find(hp => hp.mssv = mssv);
                if (!currentFee || (currentFee.hocPhi != currentFee.congNo)) throw `Sinh viên ${mssv} không đủ điều kiện để thay đổi Bảo hiểm y tế!`;
                const { hocPhi, congNo } = currentFee;
                await app.model.tcHocPhi.update({ namHoc, hocKy, mssv }, {
                    hocPhi: parseInt(hocPhi) + diff,
                    congNo: parseInt(congNo) + diff,
                    ngayTao: thoiGian
                });
                if (loaiPhi && loaiPhi.soTien != 0)
                    await app.model.tcHocPhiDetail.delete({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[item.dienDong] });
                if (mapperDienDong[item.dienDong])
                    await app.model.tcHocPhiDetail.create({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[item.dienDong], soTien: mapperSoTien[item.dienDong], ngayTao: thoiGian });
            });
            await app.model.svBaoHiemYTe.update({
                statement: '(:thoiGianBatDau <= thoiGian AND thoiGian <= :thoiGianKetThuc) AND namDangKy = :namDangKy AND maThanhToan is NULL',
                parameter: {
                    thoiGianBatDau,
                    thoiGianKetThuc,
                    namDangKy
                }
            }, { maThanhToan: 1 });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/bhyt/dot-dang-ky-bhyt/email-chua-ke-khai', app.permission.check('ctsvDotBhyt:write'), async (req, res) => {
        try {
            const { ma } = req.query;
            const item = await app.model.svDotDangKyBhyt.get(ma ? { ma } : {}, '*', 'timeModified DESC');
            const { dschuakekhai: dsChuaKeKhai } = await app.model.svBaoHiemYTe.getData('-1', ma);

            const subject = 'Nhắc nhở kê khai thông tin bảo hiểm y tế',
                text = '',
                html = `
                <p><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="background-color:#ffffff"><span style="font-family:'Times New Roman'"><span style="color:#222222">Ch&agrave;o c&aacute;c bạn sinh vi&ecirc;n,</span></span></span></span></span></span></p>
            
                <p><span style="font-size:11pt"><span style="background-color:#ffffff"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">
                    Phòng CTSV nhắc nhở các bạn kê khai thông tin đăng ký bảo hiểm y tế trước ${app.date.viDateFormat(new Date(item.thoiGianKetThuc))}
                </span></span></span></span></span></span></p>

                <p><span style="font-size:11pt"><span style="background-color:#ffffff"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">
                    Nếu bạn đã kê khai thông tin bảo hiểm y tế, vui lòng bỏ qua email này
                </span></span></span></span></span></span></p>
                
                <p style="text-align:left"><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'">Email n&agrave;y được gửi từ hệ thống email tự động.</span></span></span></span></p>
                <p style="text-align:left"><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'">Xin vui l&ograve;ng kh&ocirc;ng trả lời email n&agrave;y.</span></span></span></span></p>
                <p><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">Th&acirc;n mến.</span></span></span></span></span></p>
                `;

            dsChuaKeKhai.map(async i => app.notification.send({
                toEmail: `${i.mssv.toLowerCase()}@hcmussh.edu.vn`, title: 'Nhắc nhở kê khai BHYT', iconColor: 'danger',
                subTitle: `Hạn chót ${app.date.viDateFormat(new Date(item.thoiGianKetThuc))}`,
            }));
            app.service.emailService.send('no-reply-ctsv01@hcmussh.edu.vn', 'fromMailPassword', dsChuaKeKhai[0].emailTruong, dsChuaKeKhai.map(item => item.emailTruong).toString(), null, subject, text, html, null);

            res.send({ items: dsChuaKeKhai });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const getCellsDKHLCT = async (data) => {
        try {
            const dataDot = await app.model.svDotDangKyBhyt.get({ ma: data.dotDangKy });
            const filter = dataDot ? {
                thoiGianBatDau: dataDot.thoiGianBatDau,
                thoiGianKetThuc: dataDot.thoiGianKetThuc,
            } : {};
            const items = await app.model.svBaoHiemYTe.downloadExcel(data.search, app.utils.stringify(filter)),
                list = items.rows;
            let returnData = {
                'cellMienDong': { items: [], index: 0 },
                'cell12CoMa': { items: [], index: 0 },
                'cell12KoMa': { items: [], index: 0 },
                'cell15CoMa': { items: [], index: 0 },
                'cell15KoMa': { items: [], index: 0 },
                'cell9CoMa': { items: [], index: 0 },
                'cell9KoMa': { items: [], index: 0 },
            };

            const cellReturnMaper = (item) => {
                if (item['Mã diện tham gia'] == '12') {
                    if (item['Mã BHXH']) return 'cell12CoMa';
                    else return 'cell12KoMa';
                }
                if (item['Mã diện tham gia'] == '15') {
                    if (item['Mã BHXH']) return 'cell15CoMa';
                    else return 'cell15KoMa';
                }
                if (item['Mã diện tham gia'] == '9') {
                    if (item['Mã BHXH']) return 'cell9CoMa';
                    else return 'cell9KoMa';
                }
                return 'cellMienDong';
            };

            list.forEach((item) => {
                // if (cell12CoMa == '12' || item['Mã diện tham gia'] == '15') {
                //     let cellReturn = (item['Mã BHXH'] ? (item['Mã diện tham gia'] == '12' ? 'cell12CoMa' : 'cell15CoMa') : (item['Mã diện tham gia'] == '12' ? 'cell12KoMa' : 'cell15KoMa'));
                // }
                let cellReturn = cellReturnMaper(item);
                const { index } = returnData[cellReturn];
                returnData[cellReturn].items.push({ cell: 'A' + (index + 3), border: '1234', value: item.MSSV });
                returnData[cellReturn].items.push({ cell: 'B' + (index + 3), border: '1234', value: index + 1 });
                returnData[cellReturn].items.push({ cell: 'C' + (index + 3), border: '1234', value: `${item['Họ']} ${item['Tên']}` });
                returnData[cellReturn].items.push({ cell: 'D' + (index + 3), border: '1234', value: `${item['Mã BHXH'] || ''}` });
                returnData[cellReturn].items.push({ cell: 'E' + (index + 3), border: '1234', value: `${item['Ngày sinh']}` });
                returnData[cellReturn].items.push({ cell: 'F' + (index + 3), border: '1234', value: `${item['Mã giới tính'] == 1 ? '' : 'x'} ` });
                returnData[cellReturn].items.push({ cell: 'H' + (index + 3), border: '1234', value: `${item['CCCD/CMND']}` });
                returnData[cellReturn].items.push({ cell: 'I' + (index + 3), border: '1234', value: `${item['CMND/CCCD ngày cấp']}` });
                returnData[cellReturn].items.push({ cell: 'J' + (index + 3), border: '1234', value: `${item['Thường trú mã tỉnh']}` });
                returnData[cellReturn].items.push({ cell: 'K' + (index + 3), border: '1234', value: `${item['Nơi sinh mã tỉnh']}` });
                // cellsHL.push({ cell.items: 'L' + (index + 3), index r: '1234', value: `${item['Nơi sinh']}` });
                returnData[cellReturn].items.push({ cell: 'M' + (index + 3), border: '1234', value: `${item['Số nhà thường trú']}` });
                returnData[cellReturn].items.push({ cell: 'N' + (index + 3), border: '1234', value: `${item['Thường trú mã tỉnh']}#${item['Thường trú mã huyện']}#${item['Thường trú mã xã']}` });
                returnData[cellReturn].items.push({ cell: 'O' + (index + 3), border: '1234', value: `${item['Số nhà liên lạc']}` });
                returnData[cellReturn].items.push({ cell: 'P' + (index + 3), border: '1234', value: `${item['Liên lạc mã tỉnh']}#${item['Liên lạc mã huyện']}#${item['Liên lạc mã xã']}` });
                returnData[cellReturn].items.push({ cell: 'Q' + (index + 3), border: '1234', value: `${item['Mã cơ sở khám chữa bệnh'] || ''}` });
                returnData[cellReturn].items.push({ cell: 'AF' + (index + 3), border: '1234', value: `${item['SĐT cá nhân'] || ''}` });
                returnData[cellReturn].items.push({ cell: 'AG' + (index + 3), border: '1234', value: `${item['khoa'] || ''}` });
                returnData[cellReturn].items.push({ cell: 'AH' + (index + 3), border: '1234', value: `${item['daThanhToan'] || ''}` });
                returnData[cellReturn].index++;
            });
            return { returnData };
        } catch (error) {
            return error;
        }
    };



    app.get('/api/bhyt/dot-dang-ky/download', app.permission.check('student:export'), async (req, res) => {
        try {
            let data = req.query;
            const workBook = await app.excel.readFile(app.path.join(__dirname, 'resource/BHYT_TEMPLATE.xlsx')),
                workMienDong = workBook.getWorksheet('Miễn đóng'),
                work12ThangCoMa = workBook.getWorksheet('12 tháng có mã'),
                work12ThangKoMa = workBook.getWorksheet('12 tháng không mã'),
                work15ThangCoMa = workBook.getWorksheet('15 tháng có mã'),
                work15ThangKoMa = workBook.getWorksheet('15 tháng không mã'),
                work9ThangCoMa = workBook.getWorksheet('9 tháng có mã'),
                work9ThangKoMa = workBook.getWorksheet('9 tháng không mã');

            let { returnData } = await getCellsDKHLCT(data);

            const { cellMienDong, cell12CoMa, cell12KoMa, cell15CoMa, cell15KoMa, cell9CoMa, cell9KoMa } = returnData;

            if (cellMienDong.items.length) app.excel.write(workMienDong, cellMienDong.items);
            if (cell12CoMa.items.length) app.excel.write(work12ThangCoMa, cell12CoMa.items);
            if (cell12KoMa.items.length) app.excel.write(work12ThangKoMa, cell12KoMa.items);
            if (cell15CoMa.items.length) app.excel.write(work15ThangCoMa, cell15CoMa.items);
            if (cell15KoMa.items.length) app.excel.write(work15ThangKoMa, cell15KoMa.items);
            if (cell9CoMa.items.length) app.excel.write(work9ThangCoMa, cell9CoMa.items);
            if (cell9KoMa.items.length) app.excel.write(work9ThangKoMa, cell9KoMa.items);


            let fileName = 'BHYT_DATA.xlsx';
            app.excel.attachment(workBook, res, fileName);

        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

};