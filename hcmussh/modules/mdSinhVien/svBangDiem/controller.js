module.exports = app => {
    const PERMISSION = 'student:login';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.hocTap,
            menus: {
                7715: { title: 'Bảng điểm', link: '/user/bang-diem' },
            }
        }
    });

    app.get('/user/bang-diem', app.permission.check(PERMISSION), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/sv/bang-diem', app.permission.check(PERMISSION), async (req, res) => {
        try {
            // let { filter } = req.query, { namHoc, hocKy } = filter,
            let user = req.session.user, mssv = user.studentId;

            let [dataDiem, dataThangDiem, dmHeDiem, dataThanhPhan] = await Promise.all([
                app.model.dtDiemAll.getDataDiem(app.utils.stringify({ mssv })),
                app.model.dtDiemThangDiemKhoaSv.getData(mssv),
                app.model.dtDiemDmHeDiem.getAll({ kichHoat: 1 }),
                app.model.dtDiemConfigThanhPhan.getFullDataConfig(),
            ]);
            dataDiem = dataDiem.rows.map(i => {
                let diem = i.diem ? JSON.parse(i.diem) : {},
                    lockDiem = i.lockDiem ? JSON.parse(i.lockDiem) : {};
                if (i.R != 1 && i.tinhPhi && i.noHocPhi < 0 && i.isAnDiem) {
                    diem = {};
                }

                // TODO: Trong thời gian nhập thì LOCK điểm hiển, hết thời gian nhập hiển thị điểm

                if (Object.keys(lockDiem).length) {
                    lockDiem.TK = Object.keys(lockDiem).filter(i => i != 'TK').every(i => Number(lockDiem[i]));
                }

                Object.keys(diem).filter(i => i != 'TK').forEach(i => diem[i] = Number(lockDiem[i]) ? diem[i] : '');
                diem.TK = lockDiem.TK ? diem.TK : '';

                let tpDiem = i.tpHocPhan || i.tpMonHoc || i.configDefault,
                    configQC = i.configQC ? JSON.parse(i.configQC) : [];
                tpDiem = tpDiem ? JSON.parse(tpDiem) : [];
                return { ...i, diem, tpDiem, configQC, lockDiem };
            });

            dataThangDiem = dataThangDiem.rows.map(i => ({ ...i, loaiHe: JSON.parse(i.loaiHe) }));
            res.send({ dataDiem, dataThangDiem, dmHeDiem, dataThanhPhan });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/bang-diem/info', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const key = 'rotMon';
            let user = req.session.user, mssv = user.studentId;
            let [items, diemRotMon, monKhongTinhTB, studentInfo] = await Promise.all([
                app.model.dtSemester.get({ active: 1 }, 'namHoc, hocKy'),
                app.model.dtCauHinhDiem.getValue(key),
                app.model.dtDmMonHocKhongTinhTb.getAll({}, 'maMonHoc'),
                app.model.fwStudent.getData(mssv),
            ]);

            monKhongTinhTB = monKhongTinhTB.map(monHoc => monHoc.maMonHoc);

            res.send({ items, studentInfo: studentInfo.rows[0], diemRotMon, monKhongTinhTB });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/bang-diem/export', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const user = req.session.user;
            const data = await app.model.dtDiem.generatePdfScoreFile(user.mssv);
            res.download(data.filePdfPath, `SCORE_DATA_${user.mssv}.pdf`);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/sv/get-data-scan', app.permission.check('user:login'), async (req, res) => {
        try {
            const { maHocPhan, mssv } = req.query;
            const dataScan = await app.model.dtDiemScanGradeResult.getFileScan(maHocPhan, app.utils.stringify({ mssvFilter: mssv }));

            res.send({ items: dataScan.rows });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};
