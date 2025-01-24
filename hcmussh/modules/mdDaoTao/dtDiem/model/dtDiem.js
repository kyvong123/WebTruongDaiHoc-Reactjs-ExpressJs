// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtDiem.foo = () => { };
    app.model.dtDiem.getFullDataOfStudent = async (mssv) => {
        let stuData = await app.model.fwStudent.getData(mssv);
        stuData = stuData.rows[0];
        stuData.ngaySinh = app.date.viDateFormat(new Date(stuData.ngaySinh));
        stuData.noiSinh = stuData.noiSinh ? stuData.noiSinh : stuData.noiSinhQuocGia;
        let [items, monKhongTinhTB, diemRotMon] = await Promise.all([
            app.model.dtDiem.getAll({ mssv }, '*', 'namHoc ASC, hocKy ASC'),
            app.model.dtDmMonHocKhongTinhTb.getAll({}, 'maMonHoc'),
            app.model.dtCauHinhDiem.getValue('rotMon')
        ]);

        monKhongTinhTB = monKhongTinhTB.map(item => item.maMonHoc);
        let dataDiem = await Promise.all(items.map(async item => {
            let mon = await app.model.dmMonHoc.get({ ma: item.maMonHoc }, 'ten, tongTinChi');
            return { ...item, tenMonHoc: mon.ten, tc: mon.tongTinChi };
        }));
        let dataGroupBy = [], allTc = 0, allTcDat = 0, sumTbTichLuy = 0, sumTcTichLuy = 0;
        dataDiem.forEach(item => {
            let { namHoc, hocKy, maMonHoc, tenMonHoc, tc, diemTk, maHocPhan } = item;
            allTc += parseInt(tc);
            tenMonHoc = app.utils.parse(tenMonHoc).vi;
            let maLop = maHocPhan.slice(-2);
            const index = dataGroupBy.findIndex(diem => diem.namHoc == namHoc && diem.hocKy == hocKy);
            if (index != -1) {
                dataGroupBy[index].s.push({ maMonHoc, tenMonHoc, tc, diemTk, maLop, ghiChu: '' });
                dataGroupBy[index].tongTc += parseInt(tc);

                if (!monKhongTinhTB.includes(maMonHoc)) {
                    dataGroupBy[index].tongTcTinhTB += parseInt(tc);
                    dataGroupBy[index].tongDiemTinhTB += parseInt(tc) * parseFloat(diemTk);
                }
            } else {
                let tongTcTinhTB = parseInt(tc), tongDiemTinhTB = parseFloat(diemTk) * tongTcTinhTB;
                if (monKhongTinhTB.includes(maMonHoc)) {
                    tongTcTinhTB = 0;
                    tongDiemTinhTB = 0;
                }
                dataGroupBy.push({
                    namHoc, hocKy, s: [{ maMonHoc, tenMonHoc, tc, diemTk, maLop, ghiChu: '' }], tongTc: tc, tongTcTinhTB, tongDiemTinhTB
                });
            }
        });
        let dataMonHoc = dataDiem.filter(item => !monKhongTinhTB.includes(item.maMonHoc) && !isNaN(item.diemTk)).groupBy('maMonHoc');

        for (let dataDiemMaMon of Object.values(dataMonHoc)) {
            let diemTrungBinhMon = Math.max(...dataDiemMaMon.map(item => Number(item.diemTk)));
            sumTbTichLuy += diemTrungBinhMon * parseInt(dataDiemMaMon[0].tc);
            sumTcTichLuy += parseInt(dataDiemMaMon[0].tc);
            if (diemTrungBinhMon >= Number(diemRotMon.rotMon)) {
                allTcDat += parseInt(dataDiemMaMon[0].tc);
            }
        }

        let dd = new Date().getDate(), mm = new Date().getMonth() + 1, yyyy = new Date().getFullYear();

        dataGroupBy = dataGroupBy.map((item, index) => {
            let { tongDiemTinhTB, tongTcTinhTB } = item,
                diemHk = '';
            if (tongTcTinhTB != 0) {
                diemHk = (tongDiemTinhTB / tongTcTinhTB).toFixed(2);
            }

            if (index == dataGroupBy.length - 1) {
                item.a = [{ allTc, allTcDat, allDiemTb: (sumTbTichLuy / sumTcTichLuy).toFixed(2), dd, mm, yyyy }];
            } else item.a = [];
            return { ...item, diemHk };
        });

        return { stuData, scoreData: dataGroupBy };
    };

    app.model.dtDiem.generatePdfScoreFile = async (mssv) => {
        const source = app.path.join(app.publicPath, 'sample', 'score-template.docx');
        const { stuData, scoreData } = await app.model.dtDiem.getFullDataOfStudent(mssv);
        const buffer = await app.docx.generateFile(source, { ...stuData, data: scoreData });
        app.fs.createFolder(app.path.join(app.assetPath, 'bang-diem-sv'));
        const filePdfPath = app.path.join(app.assetPath, 'bang-diem-sv', mssv + '.pdf');
        const pdfBuffer = await app.docx.toPdfBuffer(buffer);
        app.fs.writeFileSync(filePdfPath, pdfBuffer);
        return ({ filePdfPath, pdfBuffer });
    };


    app.model.dtDiem.hashPassword = (password) => app.crypt.hashSync(password, app.crypt.genSaltSync(8), null);
    app.model.dtDiem.checkEqualPassword = (password, encryptedPassword) => app.crypt.compareSync(password, encryptedPassword);
};