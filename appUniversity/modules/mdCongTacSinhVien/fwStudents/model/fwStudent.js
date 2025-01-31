// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwStudent.foo = () => { };

    app.model.fwStudent.initCtdtRedis = async (mssv) => {
        let fullDataDotDk = await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id', 'ngayBatDau');
        if (fullDataDotDk && fullDataDotDk.length) {
            let dataDangKySinhVien = await app.model.dtDssvTrongDotDkhp.getAll({
                statement: 'idDot IN (:listId) AND kichHoat = 1 AND mssv = :mssv',
                parameter: {
                    listId: fullDataDotDk.map(item => item.id),
                    mssv: mssv
                }
            });
            if (!dataDangKySinhVien || !dataDangKySinhVien.length) {
                fullDataDotDk = [];
                return;
            }
            let chuongTrinhDaoTao = await app.model.dtDangKyHocPhan.getListCtdt(JSON.stringify({ mssvFilter: mssv }));

            if (chuongTrinhDaoTao && chuongTrinhDaoTao.rows.length) {
                chuongTrinhDaoTao = chuongTrinhDaoTao.rows;
                await Promise.all(fullDataDotDk.map(item => {
                    return (async id => {
                        await app.database.dkhpRedis.set(`CTDT:${mssv}|${id}`, JSON.stringify(chuongTrinhDaoTao));
                    })(item.id);
                }));
                app.arrayFunc.clearData(fullDataDotDk, dataDangKySinhVien, chuongTrinhDaoTao);
            }
        }
    };

    app.model.fwStudent.updateCtdtRedis = async (idKDT) => {
        let listSv = (await app.model.fwStudent.getSvCtdt(idKDT)).rows.map(sv => sv.mssv);
        let allKeys = await app.database.dkhpRedis.keys('CTDT:*|*');
        let listReinitCtdt = allKeys
            .map(key => key.substring(key.indexOf(':') + 1, key.indexOf('|')))
            .filter(mssv => listSv.includes(mssv));
        listReinitCtdt.map(sv => app.model.fwStudent.initCtdtRedis(sv));
        app.arrayFunc.clearData(listSv, allKeys, listReinitCtdt);
        console.log(` - DKHP Redis: Reinit CTDT #${idKDT} done at ${app.date.dateTimeFormat(new Date(), 'HH:MM:ss dd/mm/yyyy')}. HeapUsed: ${process.memoryUsage().heapUsed} | HeapTotal: ${process.memoryUsage().heapTotal}`);
    };

    // const qrCode = require('qrcode');
    const bwipjs = require('bwip-js');
    app.model.fwStudent.initSyll = async (req) => {
        const source = app.path.join(app.publicPath, 'sample', 'syll2024.docx');
        const user = req.session.user;
        const now = new Date().yyyymmdd();
        let data = await app.model.fwStudent.getData(user.studentId);
        data = data.rows[0];
        data.ngaySinh = app.date.viDateFormat(new Date(data.ngaySinh));
        data.noiSinh = data.noiSinh ? data.noiSinh : data.noiSinhQuocGia;
        data.cmndNgayCap = app.date.viDateFormat(new Date(data.cmndNgayCap));
        if (data.ngayVaoDang) {
            data.dav = 'X';
            data.ngayVaoDang = app.date.viDateFormat(new Date(data.ngayVaoDang));
        } else {
            data.ngayVaoDang = '';
            data.dav = '';
        }
        if (data.ngayVaoDoan) {
            data.dov = 'X';
            data.ngayVaoDoan = app.date.viDateFormat(new Date(data.ngayVaoDoan));
        } else {
            data.dov = '';
            data.ngayVaoDoan = '';
        }
        data.diemThi = Number(data.diemThi).toFixed(2);
        data.ngaySinhCha = data.ngaySinhCha ? new Date(data.ngaySinhCha).getFullYear() : '';
        data.tenCha = data.tenCha || '';
        data.ngheNghiepCha = data.ngheNghiepCha || '';
        data.sdtCha = data.sdtCha || '';
        data.ngaySinhMe = data.ngaySinhMe ? new Date(data.ngaySinhMe).getFullYear() : '';
        data.tenMe = data.tenMe || '';
        data.ngheNghiepMe = data.ngheNghiepMe || '';
        data.sdtMe = data.sdtMe || '';
        data.thuongTru = (data.soNhaThuongTru ? data.soNhaThuongTru + ', ' : '')
            + (data.xaThuongTru ? data.xaThuongTru + ', ' : '')
            + (data.huyenThuongTru ? data.huyenThuongTru + ', ' : '')
            + (data.tinhThuongTru ? data.tinhThuongTru : '');

        data.thuongTruCha = (data.soNhaThuongTruCha ? data.soNhaThuongTruCha + ', ' : '')
            + (data.xaThuongTruCha ? data.xaThuongTruCha + ', ' : '')
            + (data.huyenThuongTruCha ? data.huyenThuongTruCha + ', ' : '')
            + (data.tinhThuongTruCha ? data.tinhThuongTruCha : '');

        data.thuongTruMe = (data.soNhaThuongTruMe ? data.soNhaThuongTruMe + ', ' : '')
            + (data.xaThuongTruMe ? data.xaThuongTruMe + ', ' : '')
            + (data.huyenThuongTruMe ? data.huyenThuongTruMe + ', ' : '')
            + (data.tinhThuongTruMe ? data.tinhThuongTruMe : '');

        data.lienLac = (data.soNhaLienLac ? data.soNhaLienLac + ', ' : '')
            + (data.xaLienLac ? data.xaLienLac + ', ' : '')
            + (data.huyenLienLac ? data.huyenLienLac + ', ' : '')
            + (data.tinhLienLac ? data.tinhLienLac : '');
        data.yyyy = now.substring(0, 4);
        data.mm = now.substring(4, 6);
        data.dd = now.substring(6, 8);
        data.image = '';
        data.timeModified = new Date().toTimeString().split(' ')[0];

        let hoSo = await app.model.svDmHoSoNhapHoc.getAllByKhoaHe(data.namTuyenSinh, data.loaiHinhDaoTao, app.utils.stringify({ kichHoat: 1 })).then(mc => mc.rows);
        data.hoSo = hoSo.map((item, i) => ({ i: i + 1, tenHoSo: item.ten }));

        Object.keys(data).forEach(key => {
            if (data[key] == null || data[key] == undefined) data[key] = '';
        });

        let barCodeImage = app.path.join(app.assetPath, '/qr-syll', data.mssv + '.png');
        app.fs.createFolder(app.path.join(app.assetPath, '/qr-syll'));
        const png = await bwipjs.toBuffer({
            bcid: 'code128',
            text: data.mssv.toString(),
            textxalign: 'center',
            includetext: true,
        });
        app.fs.writeFileSync(barCodeImage, png);

        data.qrCode = barCodeImage;
        let buffer = await app.docx.generateFileHasImage(source, data, [80, 82]);
        app.fs.createFolder(app.path.join(app.assetPath, 'so-yeu-ly-lich'));
        app.fs.createFolder(app.path.join(app.assetPath, 'so-yeu-ly-lich', data.namTuyenSinh?.toString() || new Date().getFullYear().toString()));
        const filePdfPath = app.path.join(app.assetPath, 'so-yeu-ly-lich', data.namTuyenSinh?.toString() || new Date().getFullYear().toString(), data.mssv + '.pdf');
        const pdfBuffer = await app.docx.toPdfBuffer(buffer);
        app.fs.writeFileSync(filePdfPath, pdfBuffer);
        app.fs.deleteFile(barCodeImage);
        return { data, filePdfPath, pdfBuffer };
    };

    app.model.fwStudent.updateWithLog = async (user, condition, changes) => {
        let listSinhVien = await app.model.fwStudent.getAll(condition);
        let updateLog = await Promise.all(listSinhVien.map(async dataSinhVien => {
            let { mssv, ...rest } = dataSinhVien;
            let dataTruoc = {}, dataSau = {};
            for (let key in rest) {
                if (key == 'canEdit') {
                    continue;
                }
                if (changes[key] != undefined) {
                    if ((changes[key] ?? '') != (dataSinhVien[key] ?? '')) {
                        dataTruoc[key] = dataSinhVien[key] ?? '';
                        dataSau[key] = changes[key] ?? '';
                    }
                }
            }
            if (Object.keys(dataSau).length) {
                let log = {
                    mssv,
                    dataTruoc: JSON.stringify(dataTruoc),
                    dataSau: JSON.stringify(dataSau),
                    staffHandle: user.email,
                    handleTime: Date.now()
                };
                return app.model.fwStudentUpdateLog.create(log);
            }
            return {};
        }));
        let item = await app.model.fwStudent.update(condition, { ...changes });
        return { item, updateLog };
    };
};