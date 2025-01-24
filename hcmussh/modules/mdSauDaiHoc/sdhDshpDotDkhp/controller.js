module.exports = app => {
    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/dshp-dot-dang-ky/page/:pageNumber/:pageSize', app.permission.orCheck('sdhDmDotDangKy:read', 'sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            let filter = req.query.filter || {};
            filter = app.utils.stringify(app.clone(filter));
            let page = await app.model.sdhDshpDotDkhp.searchPage(_pageNumber, _pageSize, filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: data } = page;
            const list = data && Object.values(data.reduce((acc, curr) => {
                acc[curr.maHocPhan] = acc[curr.maHocPhan] || { maHocPhan: curr.maHocPhan, data: [] };
                acc[curr.maHocPhan].data.push(curr);
                return acc;
            }, {}));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/dshp-dot-dang-ky', app.permission.orCheck('sdhDmDotDangKy:read', 'sdhDmDotDangKy:manage'), async (req, res) => {
        try {
            let { listHp, idDot } = req.body.changes || { listHp: [], listHpChon: [], idDot: null },
                item = req.body.item;
            if (listHp.filter(ele => ele.isChon == 1).length == 0) {
                let changes = {
                    kichHoat: item.data[0].kichHoat,
                    modifier: req.session.user.email,
                    timeModified: Date.now(),
                };
                await app.model.sdhDshpDotDkhp.update({ idDot: idDot, maHocPhan: item.maHocPhan }, changes);
            } else if (listHp.filter(ele => ele.isChon == 1).length > 0) {
                listHp.filter(ele => ele.isChon == 1).forEach(async ele => {
                    let changes = {
                        kichHoat: item.data[0],
                        modifier: req.session.user.email,
                        timeModified: Date.now(),
                    };
                    await app.model.sdhDshpDotDkhp.update({ idDot: idDot, maHocPhan: ele.maHocPhan }, changes);
                });
                if (listHp.filter(ele => ele.isChon == 1).every(ele => ele.maHocPhan != item.maHocPhan)) {
                    let changes = {
                        kichHoat: item.data[0].kichHoat,
                        modifier: req.session.user.email,
                        timeModified: Date.now(),
                    };
                    await app.model.sdhDshpDotDkhp.update({ idDot: idDot, maHocPhan: item.maHocPhan }, changes);
                }
            }
            res.send({ item: idDot });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/dshp-trong-dot-dkhp/checkDuplicated', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        try {
            let { maHp, ngayBatDau, ngayKetThuc } = req.query;
            let message = null,
                items = await app.model.sdhDshpDotDkhp.checkDuplicated(maHp, ngayBatDau, ngayKetThuc);
            items = items.rows;
            let monHoc = null;
            if (items.length != 0) {
                message = 'Học phần đã có trong đợt đăng ký học phần: ' + items[0].tenDot;
            }
            else {
                monHoc = await app.model.sdhDshpDotDkhp.getInfoHocPhan(maHp);
            }
            res.send({ items: { message, dataHocPhan: monHoc && monHoc.rows && monHoc.rows[0] } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/dshp-trong-dot-dkhp/list', app.permission.check('sdhDmDotDangKy:write'), async (req, res) => {
        try {
            let { data } = req.body;
            let { listHpAdd, idDot } = data;
            listHpAdd = listHpAdd.split('; ');

            for (let item of listHpAdd) {
                let data = {
                    idDot: idDot,
                    maHocPhan: item,
                    kichHoat: 1,
                    modifier: req.session.user.email,
                    timeModified: Date.now(),
                };
                await app.model.sdhDshpDotDkhp.create(data);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};