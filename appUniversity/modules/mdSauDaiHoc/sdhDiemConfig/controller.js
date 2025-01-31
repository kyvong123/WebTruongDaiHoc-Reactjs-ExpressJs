module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7579: {
                title: 'Cấu hình điểm', link: '/user/sau-dai-hoc/grade-manage/setting', parentKey: 7560
            }
        }
    };
    app.permission.add(
        { name: 'sdhDiemConfig:manage', menu }, 'sdhDiemConfig:write', 'sdhDiemConfig:delete', 'sdhDiemConfig:read'
    );

    app.get('/user/sau-dai-hoc/grade-manage/setting', app.permission.check('sdhDiemConfig:read'), app.templates.admin);
    app.get('/user/sau-dai-hoc/grade-manage/semester/:ma', app.permission.check('sdhDiemConfig:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesSdhDiemConfig', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDiemConfig:manage', 'sdhDiemConfig:write', 'sdhDiemConfig:delete', 'sdhDiemConfig:read');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/grade-manage/all', app.permission.check('sdhDiemConfig:read'), async (req, res) => {
        try {
            let items = await app.model.sdhSemester.getAll({}, 'ma, namHoc, hocKy', ' namHoc DESC, hocKy DESC');
            items = await Promise.all(items.map(async ({ namHoc, hocKy, ma }) => {
                let configThanhPhan = await app.model.sdhDiemConfigThanhPhan.getAll({ namHoc, hocKy }, 'ma, phanTramMax, phanTramMin, phanTramMacDinh, loaiLamTron', 'ma DESC'),
                    configQuyChe = await app.model.sdhDiemConfigQuyChe.getAll({ hocKy, namHoc }, 'ma, giaTri,tinhTinChi,tinhTrungBinh,loaiApDung', 'ma DESC');
                return ({ ma, namHoc, hocKy, configQuyChe, configThanhPhan });
            }));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/grade-manage/semester', app.permission.check('sdhDiemConfig:read'), async (req, res) => {
        try {
            const { namHoc, hocKy } = req.query;
            let allPhanHe = await app.model.dmHocSdh.getAll({}, '*', 'tenVietTat ASC');
            let phanHeConfig = await app.model.sdhDiemConfig.getAll({ nam: namHoc, hocKy: hocKy }, '*', 'namHoc DESC, hocKy DESC ');
            let items = allPhanHe.map((i) => {
                let result = { id: null, hocKy: '', thoiGianNhap: '', thoiGianKetThucNhap: '', loaiHinhDaoTao: '', ten: '', tenVietTat: '' };
                let temp = phanHeConfig.find(e => e.loaiHinhDaoTao === i.ma);
                if (!temp) {
                    result.loaiHinhDaoTao = i.ma;
                }
                else {
                    result = { ...temp };
                }
                result.tenVietTat = i.tenVietTat;
                result.ten = i.ten;
                return result;
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/grade-manage/semester/phan-he', app.permission.check('sdhDiemConfig:write'), async (req, res) => {
        try {
            let { data } = req.body;
            data.userModified = req.session.user.email;
            data.timeModified = Date.now();
            await app.model.sdhDiemConfig.create(data);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/grade-manage/semester/phan-he', app.permission.check('sdhDiemConfig:write'), async (req, res) => {
        try {
            let { id, data } = req.body;
            data.userModified = req.session.user.email;
            data.timeModified = Date.now();
            await app.model.sdhDiemConfig.update({ id }, data);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/grade-manage/semester/clone', app.permission.check('sdhDiemConfig:manage'), async (req, res) => {
        try {
            let { semester, data } = req.body;
            let userModified = req.session.user.email,
                timeModified = Date.now();
            //remove old value when force write
            await Promise.all([
                app.model.sdhDiemConfigThanhPhan.delete({ namHoc: semester.namHoc, hocKy: semester.hocKy }),
                app.model.sdhDiemConfigQuyChe.delete({ namHoc: semester.namHoc, hocKy: semester.hocKy }),
            ]);
            if (data.configThanhPhan.length) {
                for (let i = 0; i < data.configThanhPhan.length; i++) {
                    let item = { ...data.configThanhPhan[i], ...semester, userModified, timeModified };
                    await app.model.sdhDiemConfigThanhPhan.create(item);
                }
            }
            if (data.configQuyChe.length) {
                for (let i = 0; i < data.configQuyChe.length; i++) {
                    let item = { ...data.configQuyChe[i], ...semester, userModified, timeModified };
                    await app.model.sdhDiemConfigQuyChe.create(item);
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

};
