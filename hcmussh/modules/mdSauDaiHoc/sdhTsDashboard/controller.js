module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7608: { title: 'Dashboard', link: '/user/sau-dai-hoc/tuyen-sinh/dashboard', icon: 'fa-area-chart', backgroundColor: '#f5c842', groupIndex: 1, parentKey: 7544 }
        }
    };

    app.permission.add(
        { name: 'sdhTsDashboard:manage', menu }
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/dashboard', app.permission.check('sdhTsDashboard:manage'), app.templates.admin);
    //API------------------------------------------------------------------------------------------------------------------------------


    app.get('/api/sdh/ts-dashboard/get-data', app.permission.check('sdhTsDashboard:manage'), (req, res) => {
        try {
            let filter = req.query.filter;
            app.model.sdhTsThongTinCoBan.getDataThongKe(app.utils.stringify(filter), (error, item) => {
                error && console.error(req.method, req.url, { error }) && res.send({ error });
                let tkAll = item.rows[0],
                    { tkXetDuyet = [], tkDknn = [], tkDkccnn = [], tkVang = [], tkKyLuat = [], tkXetTrungTuyen = [], tkPhanHe = [], tkHinhThuc = [], tkNganh = [], tkDknnByMon = [], tkCcnnByLoai = [], tkKyLuatByMucDo = [], tkTrungTuyenByNganh = [] } = item;
                res.send({ data: { tkAll, tkXetDuyet, tkDknn, tkDkccnn, tkVang, tkKyLuat, tkXetTrungTuyen, tkPhanHe, tkHinhThuc, tkNganh, tkDknnByMon, tkCcnnByLoai, tkKyLuatByMucDo, tkTrungTuyenByNganh } });
            });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};