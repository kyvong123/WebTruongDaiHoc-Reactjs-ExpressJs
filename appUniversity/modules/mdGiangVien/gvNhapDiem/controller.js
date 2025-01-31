module.exports = app => {
    // const bwipjs = require('bwip-js');
    const menu = {
        parentMenu: app.parentMenu.giangVien,
        menus: {
            7623: {
                title: 'Nhập điểm học phần',
                link: '/user/affair/nhap-diem', icon: 'fa-pencil-square'
            }
        }
    };

    app.permission.add({
        name: 'staff:teacher', menu
    });

    app.get('/user/affair/nhap-diem', app.permission.check('staff:teacher'), app.templates.admin);
    app.get('/user/affair/nhap-diem/edit/:id', app.permission.check('staff:teacher'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleTeacherNhapDiem', (user, staff) => new Promise(resolve => {
        if (staff.shcc) {
            app.model.dtAssignRoleNhapDiem.get({ shcc: staff.shcc }, (error, item) => {
                if (!error && item) {
                    app.permissionHooks.pushUserPermission(user, 'staff:teacher');
                }
                resolve();
            });
        } else resolve();
    }));
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/dt/gv/get-role-nhap-diem', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         const items = await app.model.dtAssignRoleNhapDiem.getHocPhan(app.utils.stringify({ userShcc: req.session.user.shcc, ...req.query.filter }));
    //         res.send({ items: items.rows });
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.get('/api/dt/gv/nhap-diem/get-data', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         const { id } = req.query,
    //             { shcc } = req.session.user,
    //             item = await app.model.dtAssignRoleNhapDiem.getHocPhan(app.utils.stringify({ userShcc: shcc, idRole: id }));

    //         let dataStudent = [], infoHocPhan = {}, listTpThi = [], listDinhChi = [];

    //         if (item.rows.length) {
    //             const { maHocPhan, idExam, kyThi } = item.rows[0];

    //             [listTpThi, listDinhChi] = await Promise.all([
    //                 app.model.dtAssignRoleNhapDiem.getAll({
    //                     statement: 'maHocPhan = :maHocPhan AND shcc = :shcc AND idExam IS NULL AND kyThi != :kyThi',
    //                     parameter: { maHocPhan, shcc, kyThi },
    //                 }, 'kyThi'),
    //                 app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan, kyThi })
    //             ]);

    //             if (idExam) {
    //                 listTpThi = [];
    //                 dataStudent = await app.model.dtExamDanhSachSinhVien.getAll({ idExam });
    //             } else {
    //                 dataStudent = await app.model.dtDangKyHocPhan.getAll({ maHocPhan });
    //                 listDinhChi = listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id }));
    //                 dataStudent.push(...listDinhChi);
    //             }

    //             dataStudent = dataStudent.map(i => ({ mssv: i.mssv, idDinhChiThi: i.idDinhChiThi }));

    //             dataStudent = await Promise.all(dataStudent.sort((a, b) => a.mssv - b.mssv).map(async stu => {
    //                 let maHocPhanThi = maHocPhan;
    //                 if (stu.idDinhChiThi) {
    //                     await app.model.dtDinhChiThi.get({ id: stu.idDinhChiThi }).then(dinhChi => maHocPhanThi = dinhChi.maHocPhan);
    //                 }
    //                 let dataStu = await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ student: stu.mssv, maHocPhan: maHocPhanThi }));
    //                 return { ...dataStu.rows[0], ...stu };
    //             }));

    //             dataStudent = dataStudent.map(item => ({
    //                 ...item, diem: app.utils.parse(item.diem), diemDacBiet: app.utils.parse(item.diemDacBiet),
    //                 timeModified: app.utils.parse(item.timeModified), userModified: app.utils.parse(item.userModified),
    //                 lockDiem: app.utils.parse(item.lockDiem),
    //             }));

    //             infoHocPhan = await app.model.dtThoiKhoaBieu.getInfo(item.rows[0].maHocPhan);
    //             infoHocPhan = infoHocPhan.rows[0];
    //         }

    //         res.send({ item: item.rows[0], infoHocPhan, dataStudent, timeNow: Date.now(), listTpThi: listTpThi.map(i => i.kyThi) });
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // app.post('/api/dt/gv/nhap-diem/diem-sinh-vien', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         let { changes } = req.body,
    //             { listStudent, tpDiem, dataHocPhan } = JSON.parse(changes),
    //             userModified = req.session.user.email,
    //             timeModified = Date.now();

    //         for (let stu of listStudent) {
    //             let { mssv, diem, diemDacBiet, ghiChu, idDinhChiThi } = stu,
    //                 { maHocPhan, namHoc, hocKy, maMonHoc } = dataHocPhan;

    //             if (idDinhChiThi) {
    //                 await app.model.dtDinhChiThi.get({ id: idDinhChiThi }).then(dinhChi => {
    //                     maHocPhan = dinhChi.maHocPhan;
    //                     namHoc = dinhChi.namHoc;
    //                     hocKy = dinhChi.hocKy;
    //                 });
    //             }

    //             let condition = { maHocPhan, namHoc, hocKy, maMonHoc, mssv };

    //             for (let tp of tpDiem) {
    //                 let isExist = await app.model.dtDiemAll.get({ ...condition, loaiDiem: tp.thanhPhan }),
    //                     diemSv = diem && diem[tp.thanhPhan] != null ? diem[tp.thanhPhan] : '',
    //                     diemDb = diemDacBiet && diemDacBiet[tp.thanhPhan] ? diemDacBiet[tp.thanhPhan] : '';

    //                 if (isExist) {
    //                     await app.model.dtDiemAll.update({ ...condition, loaiDiem: tp.thanhPhan }, { diem: diemSv, diemDacBiet: diemDb });
    //                 } else {
    //                     await app.model.dtDiemAll.create({ ...condition, loaiDiem: tp.thanhPhan, phanTramDiem: tp.phanTram, diem: diemSv, diemDacBiet: diemDb });
    //                 }

    //                 if ((isExist?.diem ?? '') != diemSv) {
    //                     await app.model.dtDiemHistory.create({ userModified, timeModified, ...condition, phanTramDiem: tp.phanTram, oldDiem: isExist?.diem ?? '', newDiem: diemSv, loaiDiem: tp.thanhPhan, diemDacBiet: diemDb, hinhThucGhi: 3 });
    //                 }
    //             }
    //             if (diem) {
    //                 let isTK = await app.model.dtDiemAll.get({ ...condition, loaiDiem: 'TK' });
    //                 if (isTK) {
    //                     await app.model.dtDiemAll.update({ ...condition, loaiDiem: 'TK' }, { diem: diem['TK'] ?? '' });
    //                 } else {
    //                     await app.model.dtDiemAll.create({ ...condition, loaiDiem: 'TK', diem: diem['TK'] ?? '' });
    //                 }
    //             }
    //             await app.model.dtDiemGhiChu.delete({ mssv, maHocPhan });
    //             await app.model.dtDiemGhiChu.create({ mssv, maHocPhan, ghiChu, userModified, timeModified });
    //         }

    //         if (dataHocPhan.idExam) {
    //             let isGenCode = await app.model.dtDiemHistory.get({ ...dataHocPhan, timeModified });
    //             if (isGenCode) await app.model.dtDiemCodeFile.genCode({ ...dataHocPhan, thanhPhan: dataHocPhan.kyThi }, userModified);
    //         } else {
    //             let listTpThi = await app.model.dtAssignRoleNhapDiem.getAll({
    //                 statement: 'maHocPhan = :maHocPhan AND shcc = :shcc AND idExam IS NULL',
    //                 parameter: { maHocPhan: dataHocPhan.maHocPhan, shcc: req.session.user.shcc },
    //             }, 'kyThi');
    //             for (let tp of listTpThi) {
    //                 let isGenCode = await app.model.dtDiemHistory.get({ ...dataHocPhan, timeModified, loaiDiem: tp.kyThi });
    //                 if (isGenCode) await app.model.dtDiemCodeFile.genCode({ ...dataHocPhan, thanhPhan: tp.kyThi }, userModified);
    //             }
    //         }
    //         res.end();
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });

    // const genBarCode = async (code, image) => {
    //     const png = await bwipjs.toBuffer({
    //         bcid: 'code128',
    //         text: code.toString(),
    //         includetext: true,
    //         textxalign: 'center',
    //     });
    //     app.fs.writeFileSync(image, png);
    // };

    // const handleGetStudent = async (listStudent, maHocPhan) => {
    //     return Promise.all(listStudent.sort((a, b) => a.mssv - b.mssv).map(async stu => {
    //         let maHocPhanThi = maHocPhan;
    //         if (stu.idDinhChiThi) {
    //             await app.model.dtDinhChiThi.get({ id: stu.idDinhChiThi }).then(dinhChi => maHocPhanThi = dinhChi.maHocPhan);
    //         }
    //         let dataStu = await app.model.dtAssignRoleNhapDiem.getStudent(app.utils.stringify({ student: stu.mssv, maHocPhan: maHocPhanThi }));
    //         return { ...dataStu.rows[0], ...stu };
    //     }));
    // };

    // const handleParseStudent = (listStudent, kyThi) => {
    //     const parseDiem = (diem, loaiDiem) => (!isNaN(parseFloat(diem[loaiDiem]))) ? parseFloat(diem[loaiDiem]).toFixed(1).toString() : diem[loaiDiem];
    //     return listStudent.map((item, index) => {
    //         let diem = item.diem ? app.utils.parse(item.diem) : {},
    //             diemDacBiet = item.diemDacBiet ? app.utils.parse(item.diemDacBiet) : {},
    //             diemSv = parseDiem(diem, kyThi),
    //             diemTX = parseDiem(diem, 'DGTX'),
    //             diemGK = parseDiem(diem, 'GK');

    //         return {
    //             ...item, R: index + 1,
    //             ho: item.ho.replaceAll('&apos;', '\''),
    //             ten: item.ten.replaceAll('&apos;', '\''),
    //             diemSv: (diemDacBiet[kyThi] || diemSv) ?? '',
    //             diemTX: (diemDacBiet['DGTX'] || diemTX) ?? '',
    //             diemGK: (diemDacBiet['GK'] || diemGK) ?? '',
    //         };
    //     });
    // };

    // app.get('/api/dt/gv/nhap-diem/bang-diem-xac-nhan', app.permission.check('staff:teacher'), async (req, res) => {
    //     try {
    //         const { id } = req.query,
    //             { shcc, email } = req.session.user;

    //         const kyThiMapper = {
    //             'CK': 'ĐIỂM CUỐI KỲ',
    //             'GK': 'ĐIỂM GIỮA KỲ',
    //         };

    //         let item = await app.model.dtAssignRoleNhapDiem.getHocPhan(app.utils.stringify({ userShcc: shcc, idRole: id })),
    //             printTime = new Date(), dataToPrint = [];

    //         app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-xac-nhan'));

    //         if (item.rows.length) {
    //             const { maHocPhan, idExam, configDefault, tpHocPhan, tpMonHoc } = item.rows[0];

    //             let infoHocPhan = await app.model.dtThoiKhoaBieu.getInfo(item.rows[0].maHocPhan);
    //             infoHocPhan = infoHocPhan.rows[0];

    //             let tpDiem = tpHocPhan || tpMonHoc || configDefault;
    //             tpDiem = tpDiem ? JSON.parse(tpDiem) : [];

    //             let { namHoc, hocKy, tenMonHoc, tenHe, listNienKhoa, tenNganh, ngayBatDau, ngayKetThuc, lichThi, maMonHoc } = infoHocPhan,
    //                 listBarCodeImg = [];

    //             const dataSample = { maHocPhan, namHoc, hocKy, dd: new Date().getDate(), mm: new Date().getMonth() + 1, yyyy: new Date().getFullYear() };
    //             dataSample.tenMonHoc = tenMonHoc ? JSON.parse(tenMonHoc).vi : '';
    //             dataSample.tenHe = tenHe || '';
    //             dataSample.listNienKhoa = listNienKhoa || '';
    //             dataSample.tenNganh = tenNganh || '';
    //             dataSample.ngayBatDau = ngayBatDau ? app.date.dateTimeFormat(new Date(ngayBatDau), 'dd/mm/yyyy') : '';
    //             dataSample.ngayKetThuc = ngayKetThuc ? app.date.dateTimeFormat(new Date(ngayKetThuc), 'dd/mm/yyyy') : '';
    //             if (dataSample.ngayBatDau && dataSample.ngayKetThuc) dataSample.ngayBatDau = `${dataSample.ngayBatDau} - `;
    //             const outputFolder = app.path.join(app.assetPath, 'bang-diem-xac-nhan', `${printTime.getTime()}`);
    //             app.fs.createFolder(outputFolder);

    //             if (idExam) {
    //                 let { batDau, ketThuc, phong, kyThi } = lichThi ? JSON.parse(lichThi).find(item => item.idExam == idExam) : {},
    //                     page = 0,
    //                     listStudentExam = await app.model.dtExamDanhSachSinhVien.getAll({ idExam });

    //                 dataSample.titleThi = kyThiMapper[kyThi];
    //                 dataSample.kyThi = kyThi;
    //                 if (kyThi == 'CK') {
    //                     const tp = tpDiem.find(tp => tp.thanhPhan == kyThi);
    //                     dataSample.tenKyThi = tp.tenThanhPhan;
    //                     dataSample.tyLe = tp.phanTram;
    //                 } else {
    //                     dataSample.tlTX = tpDiem.find(tp => tp.thanhPhan == 'DGTX')?.phanTram || '0';
    //                     dataSample.tlGK = tpDiem.find(tp => tp.thanhPhan == 'GK')?.phanTram || '0';
    //                 }

    //                 const codeFile = await app.model.dtDiemCodeFile.getCode({ maHocPhan, maMonHoc, namHoc, hocKy, kyThi, idExam }, email);

    //                 let barCodeImage = app.path.join(app.assetPath, '/barcode-verifyDiem', maHocPhan + idExam + '.png');
    //                 app.fs.createFolder(app.path.join(app.assetPath, '/barcode-verifyDiem'));
    //                 await genBarCode(codeFile, barCodeImage);
    //                 dataSample.code = barCodeImage;
    //                 listBarCodeImg.push(barCodeImage);

    //                 listStudentExam = await handleGetStudent(listStudentExam, maHocPhan);

    //                 listStudentExam = handleParseStudent(listStudentExam, kyThi);

    //                 while (listStudentExam.length) {
    //                     page = page + 1;
    //                     let dataStudent = listStudentExam.splice(0, 28);
    //                     dataToPrint.push({
    //                         ...dataSample, page, idExam,
    //                         ngayThi: app.date.dateTimeFormat(new Date(Number(batDau)), 'dd/mm/yyyy'),
    //                         gioThi: `${app.date.viTimeFormat(new Date(Number(batDau)))} - ${app.date.viTimeFormat(new Date(Number(ketThuc)))}`,
    //                         phongThi: phong, a: dataStudent
    //                     });
    //                 }
    //             } else {
    //                 let [listTpThi, listDinhChi, listStudent] = await Promise.all([
    //                     app.model.dtAssignRoleNhapDiem.getAll({
    //                         statement: 'maHocPhan = :maHocPhan AND shcc = :shcc AND idExam IS NULL',
    //                         parameter: { maHocPhan, shcc },
    //                     }, 'kyThi'),
    //                     app.model.dtDinhChiThi.getAll({ maHocPhanThi: maHocPhan }),
    //                     app.model.dtDangKyHocPhan.getAll({ maHocPhan }),
    //                 ]);

    //                 listStudent.push(...listDinhChi.map(i => ({ mssv: i.mssv, idDinhChiThi: i.id, kyThiDinhChi: i.kyThi })));
    //                 listStudent = await handleGetStudent(listStudent, maHocPhan);

    //                 for (let tpThi of listTpThi) {
    //                     const kyThi = tpThi.kyThi;
    //                     if (kyThi == 'CK') {
    //                         const tp = tpDiem.find(tp => tp.thanhPhan == kyThi);
    //                         dataSample.tenKyThi = tp.tenThanhPhan;
    //                         dataSample.tyLe = tp.phanTram;
    //                         dataSample.titleThi = kyThiMapper[kyThi];
    //                     } else {
    //                         dataSample.tlTX = tpDiem.find(tp => tp.thanhPhan == 'DGTX')?.phanTram || '0';
    //                         dataSample.tlGK = tpDiem.find(tp => tp.thanhPhan == 'GK')?.phanTram || '0';
    //                     }

    //                     const codeFile = await app.model.dtDiemCodeFile.getCode({ maHocPhan, maMonHoc, namHoc, hocKy, kyThi }, email);

    //                     let barCodeImage = app.path.join(app.assetPath, '/barcode-verifyDiem', maHocPhan + kyThi + '.png');
    //                     listBarCodeImg.push(barCodeImage);
    //                     app.fs.createFolder(app.path.join(app.assetPath, '/barcode-verifyDiem'));
    //                     await genBarCode(codeFile, barCodeImage);

    //                     let listStudentExam = listStudent.filter(i => !i.idDinhChiThi || i.kyThiDinhChi == kyThi);

    //                     listStudentExam = handleParseStudent(listStudentExam, kyThi);
    //                     while (listStudentExam.length) {
    //                         let dataStudent = listStudentExam.splice(0, 28);
    //                         dataToPrint.push({
    //                             ...dataSample, idExam, a: dataStudent,
    //                             ngayThi: '', gioThi: '', phongThi: '',
    //                             code: barCodeImage,
    //                             kyThi
    //                         });
    //                     }
    //                 }
    //             }

    //             dataToPrint = dataToPrint.map((item, index) => ({
    //                 ...item, printTimeId: printTime.getTime() + index, printTime: printTime.getTime() + index
    //             }));

    //             const source = app.path.join(__dirname, './resource', 'FormConfirm.docx'),
    //                 sourceQt = app.path.join(__dirname, './resource', 'FormConfirmQT.docx');
    //             let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFileHasImage(data.kyThi == 'CK' ? source : sourceQt, { ...data, printTime: app.date.dateTimeFormat(printTime, 'HH:MM:ss dd/mm/yyyy') }, [50, 53])
    //                 .then(buf => {
    //                     let filepath = app.path.join(outputFolder, `${data.maHocPhan}_${data.printTimeId}.docx`);
    //                     app.fs.writeFileSync(filepath, buf);
    //                     return filepath;
    //                 })
    //             ));
    //             let mergedPath = app.path.join(app.assetPath, 'bang-diem-xac-nhan', `output_${printTime.getTime()}.pdf`);
    //             await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
    //             app.fs.deleteFolder(outputFolder);
    //             listBarCodeImg.map(i => app.fs.deleteFile(i));
    //             res.download(mergedPath, `${maHocPhan}.pdf`);
    //         }
    //     } catch (error) {
    //         console.error(req.method, req.url, { error });
    //         res.send({ error });
    //     }
    // });
};