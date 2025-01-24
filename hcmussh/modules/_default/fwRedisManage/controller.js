module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2090: { title: 'RedisManage', link: '/user/redis-manage', icon: 'fa-database', backgroundColor: '#5F556A' }
        },
    };
    app.permission.add(
        { name: 'fwRedis:manage', menu },
    );

    app.get('/user/redis-manage', app.permission.check('fwRedis:manage'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.post('/api/redis-manage/init', app.permission.check('fwRedis:manage'), async (req, res) => {
        try {
            let { key } = req.body;
            app.dkhpRedis[key]();
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/redis-manage/dot-active', app.permission.check('fwRedis:manage'), async (req, res) => {
        try {
            const items = await app.model.dtCauHinhDotDkhp.getAll({ active: 1 }, 'id, tenDot, namHoc, hocKy');
            res.send({ items: items.map(i => ({ ...i, text: i.tenDot })) });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/redis-manage/data', app.permission.check('fwRedis:manage'), async (req, res) => {
        try {
            const { keyRedis, idDot, mssv, maHocPhan } = req.query.data;
            let item = '';
            if (['settingTKB', 'settingDiem', 'semester', 'listMonHoc', 'listMonKhongPhi'].includes(keyRedis)) {
                item = await app.database.dkhpRedis.get(keyRedis);
            } else if (['SiSo', 'SLDK', 'infoHocPhan'].includes(keyRedis)) {
                if (maHocPhan) item = await app.database.dkhpRedis.get(`${keyRedis}:${maHocPhan}|${idDot}`);
                else {
                    const allKeys = await app.database.dkhpRedis.keys(`${keyRedis}:*|${idDot}`);
                    let data = {};
                    for (let key of allKeys) {
                        data[key] = await app.database.dkhpRedis.get(key);
                    }
                    item = app.utils.stringify(data);
                }
            } else if (keyRedis == 'CTDT') {
                if (mssv) item = await app.database.dkhpRedis.get(`${keyRedis}:${mssv}|${idDot}`);
                else {
                    const allKeys = await app.database.dkhpRedis.keys(`${keyRedis}:*|${idDot}`);
                    let data = {};
                    for (let key of allKeys) {
                        data[key] = await app.database.dkhpRedis.get(key);
                    }
                    item = app.utils.stringify(data);
                }
            } else if (['DIEM', 'NGOAI_NGU'].includes(keyRedis)) {
                if (mssv) item = await app.database.dkhpRedis.get(`${keyRedis}:${mssv}`);
                else {
                    const allKeys = await app.database.dkhpRedis.keys(`${keyRedis}:*`);
                    let data = {};
                    for (let key of allKeys) {
                        data[key] = await app.database.dkhpRedis.get(key);
                    }
                    item = app.utils.stringify(data);
                }
            } else if (keyRedis == 'listDataTuanHoc') {
                const dot = await app.model.dtCauHinhDotDkhp.get({ id: idDot }, 'namHoc,hocKy');
                if (dot) item = await app.database.dkhpRedis.get(`${keyRedis}|${dot.namHoc}|${dot.hocKy}`);
            } else if (keyRedis == 'dataMaHocPhan') {
                item = await app.database.dkhpRedis.get(`${keyRedis}|${idDot}`);
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};