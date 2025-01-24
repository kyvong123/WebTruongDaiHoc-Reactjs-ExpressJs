module.exports = app => {
    const PERMISSION = 'student:login';

    app.permission.add({
        name: PERMISSION, menu: {
            parentMenu: app.parentMenu.hocTap,
            menus: {
                7720: { title: 'Đăng ký học phần', link: '/user/dang-ky-hoc-phan' },
            }
        }
    });

    app.get('/user/dang-ky-hoc-phan', app.permission.check(PERMISSION), app.templates.admin);

    // app.readyHooks.add('Init data DKHP', {
    //     ready: () => app.model && app.model.dtDangKyHocPhan && app.model.dtCauHinhDotDkhp && app.model.dtDssvTrongDotDkhp && app.dkhpRedis,
    //     run: async () => {
    //         if (app.primaryWorker && (app.isDebug || !app.appName.includes('hcmussh'))) {
    //             await app.dkhpRedis.deleteAllKey();
    //             app.dkhpRedis.initConfig();
    //             // app.dkhpRedis.initCtdtStudentAll();
    //             app.dkhpRedis.initInfoHocPhan();
    //             app.dkhpRedis.initSiSoHocPhan();
    //             app.dkhpRedis.initConfigDotDky();
    //         }
    //     }
    // });

    app.get('/api/sv/dkmh/lich-su', app.permission.check(PERMISSION), async (req, res) => {
        try {
            let user = req.session.user, mssv = user.studentId,
                filter = req.query.filter, { namHoc, hocKy, cauHinh } = filter;
            let items = [];
            if (cauHinh) {
                items = await app.model.dtLichSuDkhp.getAll({
                    statement: 'namHoc = :namHoc AND hocKy = :hocKy AND timeModified >= :ngayBatDau AND timeModified <= :ngayKetThuc',
                    parameter: {
                        namHoc, hocKy,
                        ngayBatDau: cauHinh.ngayBatDau,
                        ngayKetThuc: cauHinh.ngayKetThuc,
                    },
                }, '*', 'timeModified DESC');
            } else {
                items = await app.model.dtLichSuDkhp.getAll({ mssv, namHoc, hocKy }, '*', 'timeModified DESC');
            }
            res.send({ items: items });
        } catch (error) {
            res.send({ error });
        }
    });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
};
