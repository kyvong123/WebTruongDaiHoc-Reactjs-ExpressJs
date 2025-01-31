module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7083: {
                title: 'Danh sách môn tương đương', link: '/user/dao-tao/mon-tuong-duong',
                groupIndex: 1, icon: 'fa-university', backgroundColor: '#3bbf34', color: 'black', parentKey: 7080
            },
        },
    };

    app.permission.add(
        { name: 'dtMonTuongDuong:manage', menu },
    );

    app.get('/user/dao-tao/mon-tuong-duong', app.permission.check('dtMonTuongDuong:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/mon-tuong-duong/list-nhom', app.permission.check('dtMonTuongDuong:manage'), async (req, res) => {
        try {
            let items = await app.model.dtMonTuongDuong.getAll({}, '*');
            res.send({ items: [...new Set(items.map(i => i.maNhom))], nhomData: items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/mon-tuong-duong/nhom', app.permission.check('dtMonTuongDuong:manage'), async (req, res) => {
        try {
            let { maNhom, data } = req.body,
                timeModified = Date.now(),
                userModified = req.session.user.email;

            await app.model.dtMonTuongDuong.delete({ maNhom });
            await Promise.all(data.map(item => app.model.dtMonTuongDuong.create({ maMon: item.maMon, maMonTuongDuong: item.maMonTuongDuong, maNhom, userModified, timeModified })));

            res.end();
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.get('/api/dt/mon-tuong-duong/nhom-ap-dung', app.permission.check('dtMonTuongDuong:manage'), async (req, res) => {
        try {
            let items = await app.model.dtNhomMonTuongDuong.getAll({}, '*', 'id');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/mon-tuong-duong/nhom-ap-dung', app.permission.check('dtMonTuongDuong:manage'), async (req, res) => {
        try {
            let { maNhom, khoaApDung, loaiHinhApDung, ctdtApDung } = req.body.data,
                timeModified = Date.now(),
                userModified = req.session.user.email,
                listCtdt = [];

            const listMonTuongDuong = await app.model.dtMonTuongDuong.getAll({ maNhom });
            if (ctdtApDung && ctdtApDung.length) {
                listCtdt = await app.model.dtKhungDaoTao.getAll({
                    statement: 'id IN (:listId)',
                    parameter: { listId: ctdtApDung },
                });
            } else {
                let statement = '', parameter = {};
                if (loaiHinhApDung) {
                    statement += '(loaiHinhDaoTao IN (:loaiHinh))';
                    parameter.loaiHinh = loaiHinhApDung;
                }

                if (khoaApDung) {
                    if (statement) statement += ' AND ';
                    statement += '(khoaSinhVien IN (:khoaSv))';
                    parameter.khoaSv = khoaApDung;
                }
                listCtdt = await app.model.dtKhungDaoTao.getAll({
                    statement, parameter,
                });
            }
            if (req.body.id) {
                await app.model.dtNhomMonTuongDuong.update({ id: req.body.id }, { maNhom, khoaApDung: khoaApDung?.toString() || '', loaiHinhApDung: loaiHinhApDung?.toString() || '', ctdtApDung: ctdtApDung && ctdtApDung.length ? listCtdt.map(i => i.maCtdt).toString() : '', userModified, timeModified });
            } else {
                await app.model.dtNhomMonTuongDuong.create({ maNhom, khoaApDung: khoaApDung?.toString() || '', loaiHinhApDung: loaiHinhApDung?.toString() || '', ctdtApDung: ctdtApDung && ctdtApDung.length ? listCtdt.map(i => i.maCtdt).toString() : '', userModified, timeModified });
            }

            await Promise.all(listCtdt.map(async ctdt => {
                await app.model.dtKeHoachDaoTao.delete({ maKhungDaoTao: ctdt.id, loai: 'TD' });
                let monCtdt = await app.model.dtChuongTrinhDaoTao.getAll({
                    statement: 'maKhungDaoTao = :idKhung',
                    parameter: { idKhung: ctdt.id }
                }, 'maMonHoc');
                monCtdt = monCtdt.map(i => i.maMonHoc);
                const listMon = listMonTuongDuong.filter(i => !monCtdt.includes(i.maMonTuongDuong));

                await Promise.all(monCtdt.map(async mon => {
                    let monTuongDuong = listMon.find(i => i.maMon == mon);
                    if (monTuongDuong) return app.model.dtKeHoachDaoTao.create({ maKhungDaoTao: ctdt.id, maMonHoc: monTuongDuong.maMon, maMonPhuThuoc: monTuongDuong.maMonTuongDuong, loai: 'TD' });
                }));
            }));

            res.end();
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });
};