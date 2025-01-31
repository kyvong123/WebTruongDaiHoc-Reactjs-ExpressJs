module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7630: {
                title: 'Quản lý phúc tra',
                link: '/user/sau-dai-hoc/tuyen-sinh/quan-ly-phuc-tra',
                parentKey: 7544,
                icon: 'fa-book',
                backgroundColor: 'orange'
            }
        }
    };

    app.permission.add(
        { name: 'sdhTsQuanLyPhucTra:manage', menu },
        { name: 'sdhTsQuanLyPhucTra:read', menu },
        { name: 'sdhTsQuanLyPhucTra:write', menu },
        'sdhTsQuanLyPhucTra:delete',
    );
    app.get('/user/sau-dai-hoc/tuyen-sinh/quan-ly-phuc-tra', app.permission.orCheck('sdhTsQuanLyPhucTra:read', 'sdhTsQuanLyPhucTra:write'), app.templates.admin);

    app.get('/api/sdh/ts/quan-ly-don-phuc-tra/page/:pageNumber/:pageSize', app.permission.orCheck('sdhTsQuanLyPhucTra:read', 'sdhTsQuanLyPhucTra:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            filter.ngayPhucTra = Date.now();
            const sort = filter ? filter.sort : 'ten_ASC';
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const page = await app.model.sdhTsDonPhucTra.searchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/quan-ly-don-phuc-tra', app.permission.check('sdhTsQuanLyPhucTra:write'), async (req, res) => {
        try {
            const { changes } = req.body;
            if (changes.tinhTrang == 3) {
                if (!changes.diemMoi) {
                    return res.send({ error: 'Vui lòng cập nhật điểm mới' });
                }
                await Promise.all([
                    app.model.sdhTsInfoCaThiThiSinh.update({ id: changes.idCaThi }, { diem: changes.diemMoi }),
                    app.model.sdhTsQuanLyDiem.create({
                        modifier: req.session.user.email,
                        timeModified: Date.now(),
                        diemMoi: changes.diemCu,
                        diemCu: changes.diemMoi,
                        hinhThuc: 'Phúc tra',
                        idCaThi: changes.idCaThi
                    })]);
            } else if (changes.tinhTrang == 4) {
                await app.model.sdhTsInfoCaThiThiSinh.update({ id: changes.idCaThi }, { phucTra: 0 });
            }
            await app.model.sdhTsDonPhucTra.update({ id: changes.id }, { tinhTrang: changes.tinhTrang, ngayTraKetQua: Date.now(), diemMoi: changes.diemMoi });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }

    });

};