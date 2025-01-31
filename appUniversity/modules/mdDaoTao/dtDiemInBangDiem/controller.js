module.exports = app => {
    const moment = require('moment');

    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7060: {
                title: 'Quản lý in phiếu điểm', link: '/user/dao-tao/in-phieu-diem', pin: true, color: '#000', backgroundColor: '#FFA96A', icon: 'fa-print',
                parentKey: 7047
            }

        }
    };

    app.permission.add(
        { name: 'dtDiemInBangDiem:manage', menu },
        { name: 'dtDiemInBangDiem:write' },
        { name: 'dtDiemInBangDiem:delete' }, 'dtDiemInBangDiem:export'
    );

    // app.permissionHooks.add('staff', 'addRolesDtDiemInBangDiem', (user, staff) => new Promise(resolve => {
    //     if (staff.maDonVi && staff.maDonVi == '80') {
    //         app.permissionHooks.pushUserPermission(user, 'dtDiemInBangDiem:manage', 'dtDiemInBangDiem:write', 'dtDiemInBangDiem:delete', 'dtDiemInBangDiem:export');
    //         resolve();
    //     } else resolve();
    // }));

    app.get('/user/dao-tao/in-phieu-diem', app.permission.check('dtDiemInBangDiem:manage'), app.templates.admin);

    // API -------------------------------------------------------------------------------------------------------

    const folderBangDiemCaNhan = app.path.join(app.assetPath, 'bang-diem-ca-nhan'),
        zipToPrintFolder = app.path.join(folderBangDiemCaNhan, 'print');
    app.fs.createFolder(folderBangDiemCaNhan, zipToPrintFolder);

    app.readyHooks.add('addSocketListener:ListenResultBangDiemCaNhan', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('BangDiemCaNhan', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('dtDiemInBangDiem:write') && socket.join('BangDiemCaNhan');
        }),
    });

    const get2 = (x) => ('0' + x).slice(-2);

    const mapperGhiChu = {
        'M': 'Miễn điểm',
        'I': 'Hoãn thi'
    };

    const diemTrungBinhHK = (list, monKhongTinhTB) => {
        let tongTC = 0, tongDiem = 0;
        list.filter(i => i.diem).forEach(item => {
            const { configQC, diem } = item,
                diemDacBiet = configQC.find(i => i.ma == diem['TK']);
            item.diem['TK'] = item.diem['TK'] ? item.diem['TK'] : '0';
            if (item.diem['TK'] && isNaN(item.diem['TK'])) {
                item.diem['TK'] = '0';
            }
            if (!monKhongTinhTB.includes(item.maMonHoc) && !diemDacBiet) {
                tongDiem += Number(item.diem['TK']) * Number(item.tinChi);
                tongTC += Number(item.tinChi);
            }
        });
        return tongTC == 0 ? '' : (tongDiem / tongTC).toFixed(2);
    };

    const diemTrungBinhTichLuyHK = (list, rotMon, monKhongTinhTB) => {
        const listMonHoc = (list || []).groupBy('maMonHoc');
        let soTCTichLuy = 0, diemTB = 0, soTCDky = 0;
        Object.keys(listMonHoc).forEach(key => {
            const monHoc = listMonHoc[key].filter(monHoc => monHoc.diem);
            let maxDiem = monHoc[0];

            if (monHoc.length != 1) {
                maxDiem = monHoc.reduce((prev, current) => ((Number(prev.diem['TK'] || 0) > Number(current.diem['TK'])) ? prev : current), { ...maxDiem });
            }

            const { diem, tinChi, configQC, diemDat } = maxDiem;
            if (tinChi) {
                const diemDacBiet = configQC.find(i => i.ma == diem['TK']);
                if (diemDacBiet) {
                    let { tinhTinChi } = diemDacBiet;
                    tinhTinChi = Number(tinhTinChi);
                    if (tinhTinChi) soTCTichLuy = soTCTichLuy + Number(tinChi);
                } else {
                    if (Number(diem['TK']) >= Number(diemDat || rotMon || 5)) {
                        soTCTichLuy += Number(tinChi);
                    }
                }
                if (!monKhongTinhTB.includes(key) && !diemDacBiet && Number(diem['TK'] || 0) >= Number(diemDat || rotMon || 5)) {
                    soTCDky = soTCDky + Number(tinChi);
                    diemTB = diemTB + Number(tinChi) * Number(diem['TK'] || 0);
                }
            }
        });
        return { diemTrungBinhTichLuy: soTCDky == 0 ? '' : (diemTB / soTCDky || 0).toFixed(2), soTCTichLuy };
    };

    const handleDataToPrint = async (filter, { heDiem, rotMon, monKhongTinhTB, tiengViet }, userPrint, res) => {
        let { listSv, cheDoIn, ngayKy, thuaLenh, chucVu, quaTrinh, diemDat } = filter,
            dataToPrint = [], dataDiemSv = [], dataDiem = [], page = 0;
        if (cheDoIn == '1') {
            let dataAll = await app.model.dtDiemAll.exportBangDiem(JSON.stringify({ listSv: listSv.map(i => i.mssv).toString() }));
            dataDiemSv = dataAll.rows.groupBy('mssv');
            if (!dataAll.rows.length) {
                app.io.to('BangDiemCaNhan').emit('bang-diem-ca-nhan-error', { userPrint });
                return res.send({ warning: 'Không có thông tin điểm sinh viên' });
            }
            for (let sv of listSv) {
                let listDiemNienKhoa = [], checkLength = 0, dataCheckPrint = [],
                    dataThangDiem = await app.model.dtDiemThangDiemKhoaSv.getData(sv.mssv),
                    page = 1;

                dataDiem = dataDiemSv[sv.mssv] || [];
                dataDiem = dataDiem.filter(i => (!sv.fromSem || i.idSem >= sv.fromSem) && (!sv.toSem || i.idSem <= sv.toSem)).map(item => {
                    item.ho = item.ho?.replaceAll('&apos;', '\'') || '';
                    item.ten = item.ten?.replaceAll('&apos;', '\'') || '';
                    if (!tiengViet) {
                        item.ho = app.toEngWord(item.ho).toUpperCase();
                        item.ten = app.toEngWord(item.ten).toUpperCase();
                        item.date = moment(ngayKy).format('MMM DD, YYYY');
                    }
                    item.ngaySinh = item.ngaySinh ? app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy') : '';
                    item.noiSinh = (tiengViet ? item.noiSinh : item.noiSinhTiengAnh) || '';
                    item.tenNganh = (tiengViet ? item.tenNganh : item.tenNganhTiengAnh) || '';
                    item.loaiHinhDaoTao = (tiengViet ? item.loaiHinhDaoTao : item.loaiHinhDaoTaoTiengAnh) || '';
                    item.lp = item.maHocPhan.substr(-2);
                    return item;
                });

                let diemNienKhoa = dataDiem.groupBy('namHoc'), listNamHoc = Object.keys(diemNienKhoa);
                dataThangDiem = dataThangDiem.rows.map(i => ({ ...i, loaiHe: JSON.parse(i.loaiHe) }));
                const listHocKy = [1, 2, 3];
                for (let namHoc of listNamHoc) {
                    let diemNamHoc = diemNienKhoa[namHoc];
                    diemNamHoc = diemNamHoc.groupBy('hocKy');
                    for (let hocKy of listHocKy) {
                        let diem = diemNamHoc[hocKy];
                        if (diem && diem.length) {
                            diem = diem.map(item => {
                                item.tenMonHoc = item.tenMonHoc ? (tiengViet ? JSON.parse(item.tenMonHoc).vi : JSON.parse(item.tenMonHoc).en) : '';
                                item.mmh = item.maMonHoc;
                                item.tuChon = item.tuChon ? 'x' : '';
                                item.diem = item.diem ? JSON.parse(item.diem) : { TK: '' };
                                if (item.R != 1 && item.tinhPhi && item.noHocPhi < 0 && item.isAnDiem) {
                                    diem = { TK: '' };
                                }
                                item.diemTk = item.diem['TK'];
                                item.diemTk = item.diemTk ? (isNaN(item.diemTk) ? item.diemTk : Number(item.diemTk).toFixed(1)) : '';
                                item.dTK = item.diemTk;
                                item.configQC = item.configQC ? JSON.parse(item.configQC) : [];
                                let ddb = item.configQC.find(i => i.ma == item.diemTk);
                                item.ghiChu = ddb ? (tiengViet ? ddb.moTa : ddb.moTaTiengAnh) : '';
                                let diemHe = heDiem.map(he => {
                                    let diem = isNaN(item.diemTk) ? '' : Number(item.diemTk);
                                    let thangDiem = dataThangDiem.find(i => (Number(i.min) <= diem && Number(i.max) > diem) || (diem == 10 && Number(i.max) == 10));
                                    return { he: he.id, diem: isNaN(item.diemTk) ? '' : (thangDiem ? thangDiem.loaiHe[he.id.toString()] : '') };
                                });
                                let diemBon = diemHe.find(item => !isNaN(item.diem)),
                                    diemChu = diemHe.find(item => isNaN(item.diem));
                                item.dHB = item.diemTk && diemBon ? diemBon.diem : '';
                                item.dHC = item.diemTk && diemChu ? diemChu.diem : '';
                                return item;
                            });
                            if (!quaTrinh) {
                                diem = diem.filter(item => item.loaiDky == 'KH');
                            }
                            if (diemDat) {
                                diem = diem.filter(item => isNaN(item.diemTk) || Number(item.diemTk) >= (Number(rotMon) || 5));
                            }
                            const tongTinChiHk = diem.reduce((prev, cur) => prev + cur.tinChi, 0),
                                soTinChiDat = diem.reduce((prev, cur) => {
                                    let diemDat = Number(rotMon) || 5;
                                    if (Number(cur.diemTk) > diemDat) {
                                        return prev + cur.tinChi;
                                    } else return prev + 0;
                                }, 0),
                                diemTbtlHk = diemTrungBinhHK(diem, monKhongTinhTB);

                            if (diem.length + 3 + checkLength < 26) {
                                listDiemNienKhoa.push({ namHoc, hocKy, diem, tongTinChiHk, stcd: soTinChiDat, diemTbtlHk });
                                checkLength += diem.length + 3;
                            } else {
                                dataCheckPrint.push({
                                    ...dataDiem[0], listDiemNienKhoa, page,
                                });
                                page += 1;
                                checkLength = diem.length + 3;
                                listDiemNienKhoa = [{ namHoc, hocKy, diem, tongTinChiHk, stcd: soTinChiDat, diemTbtlHk }];
                            }
                        }
                    }
                }
                let tongTinChi = dataDiem.reduce((prev, cur) => prev + Number(cur.tinChi), 0);

                const { diemTrungBinhTichLuy: diemTbtl, soTCTichLuy: tongTinChiTl } = diemTrungBinhTichLuyHK(dataDiem, Number(rotMon), monKhongTinhTB);
                if (checkLength > 20) {
                    dataCheckPrint.push({
                        ...dataDiem[0], listDiemNienKhoa, page,
                    });
                    page += 1;
                    dataCheckPrint.push({
                        ...dataDiem[0], listDiemNienKhoa: [], tongTinChi, diemTbtl, ttctl: tongTinChiTl, thuaLenh, chucVu, page,
                        dd: get2(ngayKy.getDate()), mm: get2(ngayKy.getMonth() + 1), yyyy: ngayKy.getFullYear(),
                    });
                } else {
                    dataCheckPrint.push({
                        ...dataDiem[0], listDiemNienKhoa, tongTinChi, diemTbtl, ttctl: tongTinChiTl, thuaLenh, chucVu, page,
                        dd: get2(ngayKy.getDate()), mm: get2(ngayKy.getMonth() + 1), yyyy: ngayKy.getFullYear(),
                    });
                }
                dataCheckPrint = dataCheckPrint.map(i => ({ ...i, pageTotal: page, isGen: i.page == page }));
                dataToPrint.push(...dataCheckPrint);
            }
        } else {
            for (let sv of listSv) {
                page = 0;
                let data = await app.model.dtDiem.bangDiemTotNghiep(JSON.stringify({ mssv: sv.mssv })),
                    bangDiemAll = [],
                    dataThangDiem = await app.model.dtDiemThangDiemKhoaSv.getData(sv.mssv);
                let diemTn = data.rows.filter(item => item.maxDiemTK && item.idSemester),
                    dataSv = data.datasv;
                dataThangDiem = dataThangDiem.rows.map(i => ({ ...i, loaiHe: JSON.parse(i.loaiHe) }));
                dataSv = dataSv.map(item => {
                    item.ho = item.ho?.replaceAll('&apos;', '\'') || '';
                    item.ten = item.ten?.replaceAll('&apos;', '\'') || '';
                    if (!tiengViet) {
                        item.ho = app.toEngWord(item.ho).toUpperCase();
                        item.ten = app.toEngWord(item.ten).toUpperCase();
                        item.date = moment(ngayKy).format('MMM DD, YYYY');
                    }
                    item.ngaySinh = item.ngaySinh ? app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy') : '';
                    item.noiSinh = (tiengViet ? item.noiSinh : item.noiSinhTiengAnh) || '';
                    item.tenNganh = (tiengViet ? item.tenNganh : item.tenNganhTiengAnh) || '';
                    item.loaiHinhDaoTao = (tiengViet ? item.loaiHinhDaoTao : item.loaiHinhDaoTaoTiengAnh) || '';
                    item.chuyenNganh = (tiengViet ? item.chuyenNganh : item.tenChuyenNganhTiengAnh) || '';
                    return { ...item, page };
                });
                bangDiemAll = diemTn.map((item, index) => {
                    let diem = {};
                    diem.stt = index + 1;
                    diem.maMonHoc = item.maMonHoc;
                    diem.mmh = item.maMonHoc;
                    diem.tenMonHoc = item.tenMonHoc ? (tiengViet ? JSON.parse(item.tenMonHoc).vi : JSON.parse(item.tenMonHoc).en) : '';
                    diem.nhhk = item.nhhk;
                    diem.tinChi = item.tinChi;
                    diem.diemTk = item.maxDiemTK;
                    diem.diemTk = diem.diemTk ? (isNaN(diem.diemTk) ? diem.diemTk : Number(diem.diemTk).toFixed(1)) : '';
                    diem.dTK = diem.diemTk;
                    let diemHe = heDiem.map(he => {
                        let d = isNaN(diem.diemTk) ? diem.diemTk : Number(diem.diemTk);
                        let thangDiem = dataThangDiem.find(i => (Number(i.min) <= d && Number(i.max) > d) || (d == 10 && Number(i.max) == 10));
                        return { he: he.id, diem: isNaN(diem.diemTk) ? '' : (thangDiem ? thangDiem.loaiHe[he.id.toString()] : '') };
                    });
                    let diemBon = diemHe.find(item => !isNaN(item.diem)),
                        diemChu = diemHe.find(item => isNaN(item.diem));
                    diem.dHB = diem.diemTk && diemBon ? diemBon.diem : '';
                    diem.dHC = diem.diemTk && diemChu ? diemChu.diem : '';
                    item.configQC = item.configQC ? JSON.parse(item.configQC) : [];
                    let ddb = item.configQC.find(i => i.ma == item.diemTk);
                    diem.ghiChu = ddb ? (tiengViet ? ddb.moTa : ddb.moTaTiengAnh) : '';
                    diem.isTinhTongKet = ddb ? Number(ddb.tinhTrungBinh) : 0;
                    diem.tinhTrungBinh = item.tinhTrungBinh;
                    return diem;
                });
                let tongTinChi = bangDiemAll.reduce((prev, cur) => prev + cur.tinChi, 0),
                    tcTinhDiem = bangDiemAll.filter(i => !i.isTinhTongKet && i.tinhTrungBinh && !isNaN(Number(i.diemTk))).reduce((prev, cur) => prev + cur.tinChi, 0),
                    tongDiem = bangDiemAll.filter(i => !i.isTinhTongKet && i.tinhTrungBinh && !isNaN(Number(i.diemTk))).reduce((prev, cur) => prev + Number(cur.diemTk) * cur.tinChi, 0);

                while (bangDiemAll.length) {
                    page = page + 1;
                    let bangDiem = bangDiemAll.splice(0, 24);

                    if (bangDiemAll.length) {
                        dataToPrint.push({ ...dataSv[0], bD: bangDiem, page });
                    } else {
                        if (bangDiem.length > 20) {
                            dataToPrint.push({ ...dataSv[0], bD: bangDiem, page });
                            page += 1;
                            dataToPrint.push({
                                ...dataSv[0], bD: [], tongTinChi, diemTbtl: (tongDiem / tcTinhDiem).toFixed(2), thuaLenh, chucVu,
                                dd: get2(ngayKy.getDate()), mm: get2(ngayKy.getMonth() + 1), yyyy: ngayKy.getFullYear(), page,
                            });
                        } else {
                            dataToPrint.push({
                                ...dataSv[0], bD: bangDiem, tongTinChi, diemTbtl: (tongDiem / tcTinhDiem).toFixed(2), thuaLenh, chucVu,
                                dd: get2(ngayKy.getDate()), mm: get2(ngayKy.getMonth() + 1), yyyy: ngayKy.getFullYear(), page,
                            });
                        }
                    }
                }
                dataToPrint = dataToPrint.map(item => {
                    return item.mssv == sv.mssv ? { ...item, pageTotal: page, isGen: item.page == page, isGenTable: item.page != page } : item;
                });
            }
        }
        return dataToPrint;
    };

    app.get('/api/dt/diem/get-sinh-vien', app.permission.check('dtDiemInBangDiem:manage'), async (req, res) => {
        try {
            let { filter } = req.query;
            const items = await app.model.dtDiem.getStudentDetail(app.utils.stringify(filter));
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/get-diem-sinh-vien', app.permission.check('dtDiemInBangDiem:manage'), async (req, res) => {
        try {
            let sv = req.query.sv;
            let [dataDiem, heDiem, dataThangDiem, rotMon, monKhongTinhTB] = await Promise.all([
                app.model.dtDiemAll.exportBangDiem(JSON.stringify({ listSv: sv.toString() })),
                app.model.dtDiemDmHeDiem.getAll({ kichHoat: 1 }),
                app.model.dtDiemThangDiemKhoaSv.getData(sv[0]),
                app.model.dtCauHinhDiem.getValue('rotMon'),
                app.model.dtDmMonHocKhongTinhTb.getAll({}, 'maMonHoc')
            ]);
            res.send({ dataDiem: dataDiem.rows.map(item => ({ ...item, diemDat: item.diemDat || Number(rotMon) || 5, monKhongTinhTB })), heDiem, dataThangDiem: dataThangDiem.rows.map(i => ({ ...i, loaiHe: JSON.parse(i.loaiHe) })) });
        } catch (error) {
            console.error(req.method, req.error, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/import-in-phieu-diem/download-template', app.permission.check('dtDiemInBangDiem:export'), async (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Diem');
        const wsNamHoc = workBook.addWorksheet('Năm học - học kỳ');

        const defaultColumns = [
            { header: 'Mssv', width: 20 },
            { header: 'Từ học kỳ', width: 20 },
            { header: 'Đến học kỳ', width: 20 }
        ];
        ws.columns = defaultColumns;
        wsNamHoc.columns = [
            { header: 'Mã', key: 'id', width: 20 },
            { header: 'Năm học - học kỳ', key: 'ten', width: 20 },
        ];

        let items = await app.model.dtSemester.getAll({}, '*', 'namHoc DESC, hocKy DESC');
        items.forEach(item => wsNamHoc.addRow({ id: item.ma, ten: `${item.namHoc}, HK${item.hocKy}` }));

        ws.getCell('A2').value = 'SV01';
        ws.getCell('B2').value = '231';
        ws.getCell('C2').value = '232';

        app.excel.attachment(workBook, res, 'ImportDanhSach.xlsx');
    });

    app.readyHooks.add('addSocketListener:ListenDtDiemInPhieuDiemImport', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('dtDiemInPhieuDiemImport', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('dtDiemInBangDiem:write');
            // && socket.join('dtDiemAllImport');
        })
    });
    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('ImportDanhSachInPhieuDiem', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtDiemImportData(req, fields, files, params, done), done, 'dtDiemInBangDiem:write')
    );
    const dtDiemImportData = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportDanhSachInPhieuDiem' && files.ImportDanhSachInPhieuDiem && files.ImportDanhSachInPhieuDiem.length) {
            const errorDescription = {
                1: 'Không tìm thấy sinh viên trên hệ thống',
                2: 'Sinh viên không thuộc chế độ in',
            };
            const srcPath = files.ImportDanhSachInPhieuDiem[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                let worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    let { cheDoIn } = params, index = 2, items = [], falseItems = [];
                    if (!cheDoIn) done({ error: 'Vui lòng chọn chế độ in' });
                    else {
                        try {
                            const getVal = (column, Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text;
                                return val === '' ? Default : (val == null ? '' : val);
                            };
                            while (true) {
                                if (worksheet.getCell(`A${index}`).text == '') {
                                    done && done({ items, falseItems });
                                    break;
                                } else {
                                    let data = {
                                        mssv: getVal('A').trim(),
                                        fromSem: getVal('B').trim(),
                                        toSem: getVal('C').trim(),
                                        errorCode: []
                                    };

                                    const sv = await app.model.fwStudent.get({ mssv: data.mssv }, 'mssv');
                                    if (!sv) {
                                        data.errorCode.push(1);
                                    } else {
                                        if (data.fromSem && data.toSem && Number(data.fromSem) > Number(data.toSem)) {
                                            let tmp = data.fromSem;
                                            data.fromSem = data.toSem;
                                            data.toSem = tmp;
                                        }
                                        let listSv = await app.model.dtDiem.getStudentDetail(app.utils.stringify({ condition: data.mssv, cheDoIn })),
                                            dataSv = listSv.rows.find(item => item.mssv == data.mssv);
                                        if (!dataSv) {
                                            data.errorCode.push(2);
                                            const sv = await app.model.fwStudent.get({ mssv: data.mssv }, 'ho,ten');
                                            data = { ...data, ...sv };
                                        } else {
                                            data = { ...data, ...dataSv };
                                        }
                                    }

                                    data = {
                                        ...data,
                                        id: index,
                                        errorDetail: data.errorCode.map(item => errorDescription[item])
                                    };
                                    if (data.errorCode && data.errorCode.length) {
                                        falseItems.push(data);
                                    } else {
                                        items.push(data);
                                    }
                                    index++;
                                }
                            }
                            // app.io.to('ImportPhongThiExcel').emit('import-all-done', { requester: req.session.user.email, items, falseItems, dssvTong });
                        } catch (error) {
                            console.error(error);
                            done && done({ error });
                        }
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };

    app.get('/api/dt/diem/bang-diem-ca-nhan', app.permission.check('dtDiemInBangDiem:export'), async (req, res) => {
        let {
            listSv, cheDoIn, ngayKy, thuaLenh, chucVu, tiengViet, quaTrinh, diemDat,
        } = {},
            dataToPrint = [], userPrint = req.session.user.email;
        let printTime = new Date();
        const outputFolder = app.path.join(zipToPrintFolder, `${printTime.getTime()}`);
        app.fs.createFolder(outputFolder);
        try {
            let data = req.query.data;
            listSv = data.listSv;
            cheDoIn = data.cheDoIn;
            ngayKy = new Date(data.ngayKy);
            thuaLenh = data.thuaLenh;
            chucVu = data.chucVu;
            tiengViet = data.tiengViet == '1';
            quaTrinh = data.quaTrinh == '1';
            diemDat = data.diemDat == '1';

            let [heDiem, rotMon, monKhongTinhTB] = await Promise.all([
                app.model.dtDiemDmHeDiem.getAll({ kichHoat: 1 }),
                app.model.dtCauHinhDiem.getValue('rotMon'),
                app.model.dtDmMonHocKhongTinhTb.getAll({}, 'maMonHoc'),
            ]);
            let filter = { listSv, cheDoIn, ngayKy, thuaLenh, chucVu, quaTrinh, diemDat };
            res.end();
            dataToPrint = await handleDataToPrint(filter, { heDiem, rotMon, monKhongTinhTB: monKhongTinhTB.map(item => item.maMonHoc), tiengViet }, userPrint, res);

            if (!dataToPrint.length) {
                return dataToPrint;
            }

            const srcName = cheDoIn == '1' ? (tiengViet ? 'bdcn-template.docx' : 'bdcn-template-en.docx') : (tiengViet ? 'bdcntn-template.docx' : 'bdcntn-template-en.docx'),
                source = app.path.join(app.assetPath, 'dtResource', srcName);
            let listFilePath = await Promise.all(dataToPrint.map(async data => app.docx.generateFile(source, { ...data })
                .then(buf => {
                    let filepath = app.path.join(outputFolder, `${data.mssv}_${data.page}.docx`);
                    app.fs.writeFileSync(filepath, buf);
                    return filepath;
                })
            )),
                fileName = cheDoIn == '1' ? (tiengViet ? `bdcn_${printTime.getTime()}.pdf` : `bdcn_${printTime.getTime()}_en.pdf`) : (tiengViet ? `bdcntn_${printTime.getTime()}.pdf` : `bdcntn_${printTime.getTime()}_en.pdf`);
            let mergedPath = app.path.join(zipToPrintFolder, fileName);
            await app.docx.toPdf(listFilePath, outputFolder, mergedPath);
            app.io.to('BangDiemCaNhan').emit(mergedPath ? 'bang-diem-ca-nhan-done' : 'bang-diem-ca-nhan-error', { mergedPath, userPrint, tabId: data.tabId, typePrint: data.typePrint });
            app.fs.deleteFolder(outputFolder);
        } catch (error) {
            console.error(req.method, req.url, { error });
            app.fs.deleteFolder(outputFolder);
            app.io.to('BangDiemCaNhan').emit('bang-diem-ca-nhan-error', { userPrint, error });
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/in-bang-diem/download-export', app.permission.check('dtDiemInBangDiem:export'), async (req, res) => {
        try {
            let outputPath = req.query.outputPath;
            res.sendFile(outputPath);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/bang-diem-ca-nhan/excel', app.permission.check('dtDiemInBangDiem:export'), async (req, res) => {
        let { listSv, fromSem, toSem, cheDoIn,
            // tiengViet,
            quaTrinh, diemDat
            // ngayKy, thuaLenh, chucVu 
        } = {},
            dataDiemSv = [], dataDiem = [];
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet();
        try {
            let data = JSON.parse(req.query.data);
            listSv = data.listSv;
            fromSem = data.fromSem;
            toSem = data.toSem;
            cheDoIn = data.cheDoIn;
            // tiengViet = data.tiengViet == '1';
            quaTrinh = data.quaTrinh == '1';
            diemDat = data.diemDat == '1';
            // ngayKy = new Date(data.ngayKy);
            // thuaLenh = data.thuaLenh;
            // chucVu = data.chucVu;
            let [heDiem, rotMon, monKhongTinhTB] = await Promise.all([
                app.model.dtDiemDmHeDiem.getAll({ kichHoat: 1 }),
                app.model.dtCauHinhDiem.getValue('rotMon'),
                app.model.dtDmMonHocKhongTinhTb.getAll({}, 'maMonHoc'),
            ]);
            if (cheDoIn == '1') {
                let dataAll = await app.model.dtDiemAll.exportBangDiem(JSON.stringify({ listSv: listSv.toString(), fromSem, toSem }));
                dataDiemSv = dataAll.rows.groupBy('mssv');
                const bdcnHeader = ['Mã MH', 'Tên môn học', 'Số TC', 'Lớp', 'Điểm 10', 'Điểm 4', 'Điểm chữ', 'Ghi chú'];
                ws.columns = bdcnHeader.map(key => ({ header: '', key, width: 15 }));
                for (let sv of listSv) {
                    let listDiemNienKhoa = [];
                    let dataThangDiem = await app.model.dtDiemThangDiemKhoaSv.getData(sv);
                    dataDiem = dataDiemSv[sv] || [];
                    dataDiem = dataDiem.map(item => {
                        item.ho = item.ho?.replaceAll('&apos;', '\'') || '';
                        item.ten = item.ten?.replaceAll('&apos;', '\'') || '';
                        item.ngaySinh = item.ngaySinh ? app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy') : '';
                        item.noiSinh = item.noiSinh || '';
                        item.lop = item.maHocPhan.substr(-2);
                        return item;
                    });
                    let diemNienKhoa = dataDiem.groupBy('namHoc'), listNamHoc = Object.keys(diemNienKhoa);
                    dataThangDiem = dataThangDiem.rows.map(i => ({ ...i, loaiHe: JSON.parse(i.loaiHe) }));
                    listNamHoc = listNamHoc.sort((a, b) => a < b ? -1 : 0);
                    const listHocKy = [1, 2, 3];
                    for (let namHoc of listNamHoc) {
                        let diemNamHoc = diemNienKhoa[namHoc];
                        diemNamHoc = diemNamHoc.groupBy('hocKy');
                        for (let hocKy of listHocKy) {
                            let diem = diemNamHoc[hocKy];
                            if (diem) {
                                diem = diem.map(item => {
                                    item.tenMonHoc = item.tenMonHoc ? JSON.parse(item.tenMonHoc).vi : '';
                                    item.diem = item.diem ? JSON.parse(item.diem) : { TK: '' };
                                    item.diemTk = item.diem['TK'];
                                    item.diemTk = item.diemTk ? (isNaN(item.diemTk) ? item.diemTk : Number(item.diemTk).toFixed(1)) : '';
                                    item.configQC = item.configQC ? JSON.parse(item.configQC) : [];
                                    item.ghiChu = mapperGhiChu[item.diemTk] || '';
                                    let diemHe = heDiem.map(he => {
                                        let diem = isNaN(item.diemTk) ? item.diemTk : Number(item.diemTk);
                                        let thangDiem = dataThangDiem.find(i => (Number(i.min) <= diem && Number(i.max) > diem) || (diem == 10 && Number(i.max) == 10));
                                        return { he: he.id, diem: isNaN(item.diemtK) ? '' : (thangDiem ? thangDiem.loaiHe[he.id.toString()] : '') };
                                    });
                                    let diemBon = diemHe.find(item => !isNaN(item.diem)),
                                        diemChu = diemHe.find(item => isNaN(item.diem));
                                    item.diemHeBon = diemBon ? diemBon.diem : '';
                                    item.diemHeChu = diemChu ? diemChu.diem : '';
                                    return item;
                                });
                                if (!quaTrinh) {
                                    diem = diem.filter(item => item.loaiDky == 'KH');
                                }
                                if (diemDat) {
                                    diem = diem.filter(item => !isNaN(item.diemTk) && Number(item.diemTk) >= (Number(rotMon) || 5));
                                }
                                const tongTinChiHk = diem.reduce((prev, cur) => prev + cur.tinChi, 0),
                                    soTinChiDat = '',
                                    diemTbtlHk = diemTrungBinhHK(diem, monKhongTinhTB);
                                listDiemNienKhoa.push({ namHoc, hocKy, diem, tongTinChiHk, soTinChiDat, diemTbtlHk });
                            }
                        }
                    }
                    let tongTinChi = dataDiem.reduce((prev, cur) => prev + Number(cur.tinChi), 0);

                    const { diemTrungBinhTichLuy: diemTbtl, soTCTichLuy: tongTinChiTl } = diemTrungBinhTichLuyHK(dataDiem, Number(rotMon), monKhongTinhTB);

                    ws.getCell(`A${ws._rows.length}`).value = `MSSV: ${sv}`;
                    ws.getCell(`B${ws._rows.length}`).value = `Họ và tên sinh viên: ${dataDiem[0].ho} ${dataDiem[0].ten}`;
                    ws.addRow({});
                    for (let nienKhoa of listDiemNienKhoa) {
                        let { namHoc, hocKy, tongTinChiHk, diemTbtlHk } = nienKhoa;
                        ws.mergeCells(`A${ws._rows.length}:H${ws._rows.length}`);
                        ws.getCell(`A${ws._rows.length}`).value = `Niên khoá: ${namHoc} - Học kỳ: ${hocKy}`;
                        ws.getCell(`A${ws._rows.length}`).alignment = { vertical: 'bottom', horizontal: 'center' };
                        ws.getCell(`A${ws._rows.length}`).font = { bold: true };
                        ws.getCell(`A${ws._rows.length}`).border = { top: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' } };
                        let header = Object.assign({}, ...bdcnHeader.map((x) => ({ [x]: x })));
                        ws.addRow(header, 'i');
                        let diemHk = nienKhoa.diem.map(item => {
                            let data = {};
                            data['Mã MH'] = item.maMonHoc;
                            data['Tên môn học'] = item.tenMonHoc;
                            data['Số TC'] = item.tinChi;
                            data['Lớp'] = Number(item.lop);
                            data['Điểm 10'] = item.diemTk ? (!isNaN(item.diemTk) ? Number(item.diemTk) : item.diemTk) : ' ';
                            data['Điểm 4'] = item.diemHeBon ? Number(item.diemHeBon) : ' ';
                            data['Điểm chữ'] = item.diemHeChu || ' ';
                            data['Ghi chú'] = item.ghiChu;
                            return data;
                        });
                        let start = { row: ws._rows.length + 1, col: 1 };
                        diemHk.forEach((item) => {
                            ws.addRow(item);
                        });
                        ws.addRow({});
                        ws.mergeCells(`A${ws._rows.length}:D${ws._rows.length}`);
                        ws.getCell(`A${ws._rows.length}`).value = `Tổng TC ĐK: ${tongTinChiHk}`;
                        ws.getCell(`A${ws._rows.length}`).alignment = { vertical: 'bottom', horizontal: 'right' };
                        ws.mergeCells(`E${ws._rows.length}:H${ws._rows.length}`);
                        ws.getCell(`E${ws._rows.length}`).value = `Điểm TBTL HK: ${diemTbtlHk}`;
                        ws.getCell(`E${ws._rows.length}`).alignment = { vertical: 'bottom', horizontal: 'center' };
                        let end = { row: ws._rows.length, col: ws._columns.length };
                        app.utils.borderCells(ws, start, end);
                        ws.addRow({});
                        ws.addRow({});
                    }
                    ws.getCell(`A${ws._rows.length}`).value = `Tổng số TC: ${tongTinChi}`;
                    ws.getCell(`A${ws._rows.length}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, left: { style: 'thin' } };
                    ws.getCell(`B${ws._rows.length}`).value = `Tổng số TC đạt: ${tongTinChiTl}`;
                    ws.getCell(`B${ws._rows.length}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, left: { style: 'thin' } };
                    ws.addRow({});
                    ws.getCell(`A${ws._rows.length}`).value = `ĐTB tích luỹ: ${diemTbtl}`;
                    ws.getCell(`A${ws._rows.length}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, left: { style: 'thin' } };
                    ws.addRow({});
                    ws.addRow({});
                }
            } else {
                const bdcnHeader = ['STT', 'Mã MH', 'Tên môn học', 'Học kỳ', 'Số TC', 'Điểm 10', 'Điểm 4', 'Điểm chữ', 'Ghi chú'];
                ws.columns = bdcnHeader.map(key => ({ header: '', key, width: 15 }));
                for (let mssv of listSv) {
                    let data = await app.model.dtDiem.bangDiemTotNghiep(JSON.stringify({ mssv })),
                        bangDiem = [],
                        dataThangDiem = await app.model.dtDiemThangDiemKhoaSv.getData(mssv);
                    let diemTn = data.rows.filter(item => item.maxDiemTK && item.idSemester),
                        dataSv = data.datasv;
                    dataThangDiem = dataThangDiem.rows.map(i => ({ ...i, loaiHe: JSON.parse(i.loaiHe) }));
                    dataSv = dataSv.map(item => {
                        item.ho = item.ho?.replaceAll('&apos;', '\'') || '';
                        item.ten = item.ten?.replaceAll('&apos;', '\'') || '';
                        item.ngaySinh = item.ngaySinh ? app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy') : '';
                        item.noiSinh = item.noiSinh || '';
                        item.chuyenNganh = item.chuyenNganh || '';
                        return item;
                    });
                    bangDiem = diemTn.map((item, index) => {
                        let diem = {};
                        diem.stt = index + 1;
                        diem.maMonHoc = item.maMonHoc;
                        diem.tenMonHoc = item.tenMonHoc ? JSON.parse(item.tenMonHoc).vi : '';
                        diem.hocKy = '';
                        diem.tinChi = item.tinChi;
                        diem.diemTk = item.maxDiemTK;
                        let diemHe = heDiem.map(he => {
                            let d = Number(diem.diemTk);
                            let thangDiem = dataThangDiem.find(i => (Number(i.min) <= d && Number(i.max) > d) || (d == 10 && Number(i.max) == 10));
                            return { he: he.id, diem: isNaN(Number(diem.diemTk)) ? '' : (thangDiem ? thangDiem.loaiHe[he.id.toString()] : '') };
                        });
                        let diemBon = diemHe.find(item => !isNaN(item.diem)),
                            diemChu = diemHe.find(item => isNaN(item.diem));
                        diem.diemHeBon = diemBon ? diemBon.diem : '';
                        diem.diemHeChu = diemChu ? diemChu.diem : '';
                        diem.ghiChu = mapperGhiChu[diem.diemTk] || '';
                        return diem;
                    });
                    ws.getCell(`A${ws._rows.length}`).value = `MSSV: ${mssv}`;
                    ws.getCell(`B${ws._rows.length}`).value = `Họ và tên sinh viên: ${dataSv[0].ho} ${dataSv[0].ten}`;
                    ws.addRow({});

                    let header = Object.assign({}, ...bdcnHeader.map((x) => ({ [x]: x })));
                    ws.addRow(header);
                    let diemHk = bangDiem.map((item, index) => {
                        let data = {};
                        data['STT'] = index + 1;
                        data['Mã MH'] = item.maMonHoc;
                        data['Tên môn học'] = item.tenMonHoc;
                        data['Lớp'] = Number(item.hocKy) || ' ';
                        data['Số TC'] = item.tinChi;
                        data['Điểm 10'] = item.diemTk ? (!isNaN(item.diemTk) ? Number(item.diemTk) : item.diemTk) : ' ';
                        data['Điểm 4'] = Number(item.diemHeBon) || ' ';
                        data['Điểm chữ'] = item.diemHeChu || ' ';
                        data['Ghi chú'] = item.ghiChu;
                        return data;
                    });
                    let start = { row: ws._rows.length, col: 1 };
                    diemHk.forEach((item) => {
                        ws.addRow(item);
                    });
                    let end = { row: ws._rows.length, col: ws._columns.length };
                    app.utils.borderCells(ws, start, end);
                    ws.addRow({});
                    ws.addRow({});

                    let tongTinChi = bangDiem.reduce((prev, cur) => prev + cur.tinChi, 0),
                        tongDiem = bangDiem.reduce((prev, cur) => prev + Number(cur.diemTk) * cur.tinChi, 0);
                    ws.getCell(`A${ws._rows.length}`).value = `Tổng số tín chỉ: ${tongTinChi}`;
                    ws.getCell(`A${ws._rows.length}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, left: { style: 'thin' } };
                    ws.addRow({});
                    ws.getCell(`A${ws._rows.length}`).value = `Điểm trung bình tích luỹ: ${(tongDiem / tongTinChi).toFixed(2)}`;
                    ws.getCell(`A${ws._rows.length}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, left: { style: 'thin' } };
                    ws.addRow({});
                    ws.addRow({});
                }
            }
            let fileName = cheDoIn == '1' ? 'BDCN_HK.xlsx' : 'BDCN_TN.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};
