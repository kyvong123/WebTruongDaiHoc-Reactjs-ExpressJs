module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: {
            6102: { title: 'Cấu hình', link: '/user/ctsv/setting', pin: true, icon: 'fa-sliders' },
        },
    };

    const menuDashboad = {
        parentMenu: app.parentMenu.students,
        menus: {
            6105: { title: 'Dashboard nhập học', link: '/user/ctsv/dashboard', icon: 'fa-tachometer', backgroundColor: '#319DA0', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'student:manage', menu },
        { name: 'student:dashboard', menu: menuDashboad },
    );

    app.get('/user/ctsv/dashboard', app.permission.check('student:dashboard'), app.templates.admin);

    app.get('/user/ctsv/setting', app.permission.check('student:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/ctsv/setting/dashboard', app.permission.check('student:dashboard'), async (req, res) => {
        try {
            const { listthaotac: listThaoTac, rows: data } = await app.model.svNhapHoc.getDashboard(app.utils.stringify(req.query.filter));
            const listHeDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll();
            const { rows: dataFee } = await app.model.tcHocPhi.CheckPhiNhapHoc();
            res.send({ data, dataFee, listThaoTac, listHeDaoTao });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/setting/keys', app.permission.orCheck('student:manage', 'student:login'), async (req, res) => {
        try {
            const { keys } = req.query;
            const items = await app.model.svSetting.getValue(...keys);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/setting/all', app.permission.check('student:manage'), async (req, res) => {
        app.model.svSetting.getAll({}, (error, items) => res.send({ error, items }));
    });

    app.put('/api/ctsv/setting', app.permission.check('student:manage'), async (req, res) => {
        const { changes } = req.body;
        app.model.svSetting.setValue(changes, error => res.send({ error }));
    });

    app.get('/api/ctsv/setting/dashboard/download-excel', app.permission.check('student:dashboard'), async (req, res) => {
        try {
            const { xKey, yKey, filter } = req.query;
            const { rows: data } = await app.model.svNhapHoc.getDashboard(app.utils.stringify(filter));
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Result');

            let xSet = new Set(), //Ten cot
                ySet = new Set();  //Ten hang
            data.forEach(item => {
                xSet.add(item[xKey]); ySet.add(item[yKey]);
            });
            xSet = [...xSet].filter(item => !!item).sort();
            ySet = [...ySet].filter(item => !!item).sort();

            ws.columns = [{ header: '', key: 'yKey', width: '20' }, ...xSet.map(xVal => ({ header: xVal, key: xVal, width: xVal.toString().length }))];
            ySet.forEach(yVal => {
                ws.addRow(
                    Object.assign({ yKey: yVal }, ...xSet.map(xVal => ({
                        [xVal]: data.filter(item => item[xKey] == xVal && item[yKey] == yVal).length
                    }))));
            });
            // Build summary
            ws.addRow({
                yKey: 'Tổng cộng', ...Object.assign({}, ...xSet.map(xVal => ({ [xVal]: data.filter(item => item[xKey] == xVal).length })))
            });
            // Sendback result
            const buffer = await workBook.xlsx.writeBuffer();
            res.send({ buffer });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};