module.exports = app => {
    const PERMISSION = 'developer:login';

    // app.permission.add({
    //     name: PERMISSION, menu: {
    //         parentMenu: app.parentMenu.daoTao,
    //         menus: {
    //             7101: {
    //                 title: 'Quản lý redis', link: '/user/dao-tao/quan-ly-redis',
    //                 groupIndex: 1, parentKey: 7029, icon: 'fa-certificate', backgroundColor: '#ffe599'
    //             },
    //         }
    //     }
    // });

    app.get('/user/dao-tao/quan-ly-redis', app.permission.check(PERMISSION), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/quan-ly-redis', app.permission.check(PERMISSION), async (req, res) => {
        try {
            const allKeys = ['CTDT:*|*', 'DOT:*', 'settingTKB', 'settingDiem', 'semester',
                'listMonHoc', 'DIEM:*', 'SiSo:*|*', 'SLDK:*|*', 'infoHocPhan:*|*', 'dataMaHocPhan|*'];

            let data = {};

            for (let key of allKeys) {
                data[key] = [];
                let items = await app.database.dkhpRedis.keys(key);
                for (let item of items) {
                    let value = await app.database.dkhpRedis.get(item);
                    data[key].push({ key: item, value });
                }
            }

            res.send({ allKeys, data });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

};
