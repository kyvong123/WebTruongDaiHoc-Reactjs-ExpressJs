module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7049: {
                title: 'Thang điểm', link: '/user/dao-tao/grade-manage/thang-diem', // backgroundColor: '#FFA96A', color: '#000', icon: 'fa-cogs',
                parentKey: 7047
            },
        }
    };
    app.permission.add(
        { name: 'dtDiemConfigChuyen:read', menu }, 'dtDiemConfigChuyen:write', 'dtDiemConfigChuyen:delete'
    );

    app.permissionHooks.add('staff', 'addRoledtDiemConfigChuyen', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiemConfigChuyen:write', 'dtDiemConfigChuyen:read', 'dtDiemConfigChuyen:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/grade-manage/thang-diem', app.permission.check('dtDiemConfigChuyen:read'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage/thang-diem/:khoaSV', app.permission.check('dtDiemConfigChuyen:read'), app.templates.admin);


    //APIs----------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/diem-config/diem-chuyen', app.permission.check('dtDiemConfigChuyen:read'), async (req, res) => {
        try {
            let { filter } = req.query;
            let [items, heDiem, xepLoai, dmXepLoai] = await Promise.all([
                app.model.dtDiemConfigChuyen.getAll({ khoaSinhVien: filter.khoaSinhVien }, '*', 'min DESC, loaiHe ASC'),
                app.model.dtDiemDmHeDiem.getAll({ kichHoat: 1 }),
                app.model.dtDiemConfigXepLoai.getAll({ khoaSinhVien: filter.khoaSinhVien }),
                app.model.dtDiemDmXepLoai.getAll({ kichHoat: 1 }),
            ]);
            xepLoai = xepLoai.map(item => {
                let maXepLoai = dmXepLoai.find(i => i.id == item.idXepLoai);
                return { ...item, ten: maXepLoai ? maXepLoai.ten : '' };
            });
            res.send({ items, heDiem, xepLoai });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-config/thang-diem', app.permission.check('dtDiemConfigChuyen:write'), async (req, res) => {
        try {
            let { rows: items, listhediem, listkhoasinhvien } = await app.model.dtDiemConfigChuyen.getData(app.utils.stringify({}));
            res.send({ items, listHeDiem: listhediem, listKhoaSinhVien: listkhoasinhvien });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/diem-config/diem-chuyen', app.permission.check('dtDiemConfigChuyen:write'), async (req, res) => {
        try {
            const { id, changes = {} } = req.body;
            await app.model.dtDiemConfigChuyen.update({ id }, changes);
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-config/diem-chuyen', app.permission.check('dtDiemConfigChuyen:write'), async (req, res) => {
        try {
            const { data, maThangDiem } = req.body;
            let userModified = req.session.user.email, timeModified = Date.now();
            await app.model.dtDiemConfigChuyen.delete({ maThangDiem });
            await app.model.dtDiemConfigXepLoai.delete({ maThangDiem });

            for (let item of data) {
                let { min, max, xepLoai: idXepLoai, listHeDiem, isDelete } = item;
                if (!isDelete) {
                    for (let loaiHe in listHeDiem) {
                        await app.model.dtDiemConfigChuyen.create({ loaiHe: loaiHe.split(':')[1], maThangDiem, min, max, giaTri: listHeDiem[loaiHe], userModified, timeModified });
                    }
                    await app.model.dtDiemConfigXepLoai.create({ maThangDiem, userModified, timeModified, min, max, idXepLoai });
                }
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/diem-config/diem-chuyen', app.permission.check('dtDiemConfigChuyen:delete'), async (req, res) => {
        try {
            const { id } = req.body;

            await app.model.dtDiemConfigChuyen.delete({ id });
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-config/thang-diem-khoa-sv', app.permission.check('dtDiemConfigChuyen:write'), async (req, res) => {
        try {
            const { maThangDiem, khoaSinhVien } = req.body;

            await app.model.dtDiemThangDiemKhoaSv.delete({ khoaSinhVien });
            await app.model.dtDiemThangDiemKhoaSv.create({ khoaSinhVien, maThangDiem, timeModified: Date.now(), userModified: req.session.user.email });

            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};