module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3034: { title: 'Đánh giá năm', link: '/user/tccb/danh-gia', icon: 'fa-pencil-square-o', backgroundColor: '#2a99b8', groupIndex: 6 },
        }
    };

    const menuHoiDongDonVi = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3039: { title: 'Hội đồng đánh giá cấp đơn vị', link: '/user/tccb/hoi-dong-danh-gia-don-vi', icon: 'fa-gavel', backgroundColor: '#7554AA', groupIndex: 6 }
        }
    };

    app.permission.add(
        { name: 'tccbDanhGiaNam:manage', menu },
        { name: 'tccbDanhGiaNam:write' },
        { name: 'tccbDanhGiaNam:delete' },
        { name: 'tccbDanhGia:unitCouncil', menu: menuHoiDongDonVi }
    );

    app.permissionHooks.add('staff', 'addRoleDanhGiaNam', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbDanhGiaNam:manage', 'tccbDanhGiaNam:write', 'tccbDanhGiaNam:delete');
            resolve();
        } else resolve();
    }));

    app.permissionHooks.add('staff', 'addRoleHoiDongDanhGiaDonVi', (user) => new Promise(resolve => {
        app.model.tccbDanhGiaHoiDongCapDonVi.getAll({ shcc: user.shcc }, (error, items) => {
            if (error || !items || !items.length) {
                resolve();
            } else {
                user.tccbDonViNam = items.map(item => item.nam);
                app.permissionHooks.pushUserPermission(user, 'tccbDanhGia:unitCouncil');
                resolve();
            }
        });
    }));

    app.get('/user/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:manage'), app.templates.admin);
    app.get('/user/tccb/danh-gia/:nam', app.permission.check('tccbDanhGiaNam:manage'), app.templates.admin);
    app.get('/user/tccb/hoi-dong-danh-gia-don-vi', app.permission.check('tccbDanhGia:unitCouncil'), app.templates.admin);
    app.get('/user/tccb/hoi-dong-danh-gia-don-vi/:nam', app.permission.check('tccbDanhGia:unitCouncil'), app.templates.admin);
    app.get('/user/tccb/hoi-dong-danh-gia-don-vi/:nam/:shcc', app.permission.check('tccbDanhGia:unitCouncil'), app.templates.admin);
    app.get('/user/tccb/hoi-dong-danh-gia-giang-day/:nam/:shcc', app.permission.check('tccbDanhGia:unitCouncil'), app.templates.admin);
    app.get('/user/tccb/hoi-dong-danh-gia-khong-giang-day/:nam/:shcc', app.permission.check('tccbDanhGia:unitCouncil'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/danh-gia/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {};
        app.model.tccbDanhGiaNam.getPage(pageNumber, pageSize, condition, '*', 'nam DESC', (error, page) => res.send({ error, page }));
    });

    app.get('/api/tccb/danh-gia/all', app.permission.check('staff:login'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            const dmCongViec = await app.model.tccbDinhMucCongViecGvVaNcv.searchAll(null, 0);
            const items = await app.model.tccbDanhGiaNam.getAll(condition, '*', 'nam DESC');
            res.send({ items, dmCongViec: dmCongViec.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/hoi-dong', app.permission.check('tccbDanhGia:unitCouncil'), (req, res) => {
        const tccbDonViNam = req.session.user.tccbDonViNam || [];
        app.model.tccbDanhGiaNam.getAll({
            statement: 'nam IN (:nam)',
            parameter: { nam: tccbDonViNam }
        }, '*', 'nam DESC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/item/:id', app.permission.check('staff:login'), (req, res) => {
        app.model.tccbDanhGiaNam.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDanhGiaNam.get({ nam: Number(newItem.nam) }, (error, item) => {
            if (!error && item) {
                res.send({ error: 'Năm đánh giá đã tồn tại' });
            } else {
                app.model.tccbDanhGiaNam.create(newItem, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDanhGiaNam.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:delete'), async (req, res) => {
        try {
            const item = await app.model.tccbDanhGiaNam.get({ id: req.body.id });
            const nam = parseInt(item.nam);
            await Promise.all([
                app.model.tccbKhungDanhGiaCanBo.delete({ nam }),
                app.model.tccbKhungDanhGiaDonVi.update({ nam }, { isDelete: 1 }),
                app.model.tccbDiemThuong.delete({ nam }),
                app.model.tccbDiemTru.delete({ nam }),
                app.model.tccbTyLeDiem.delete({ nam }),
                app.model.tccbDanhGiaNam.delete({ id: req.body.id }),
                app.model.tccbDinhMucCongViecGvVaNcv.deleteByYear(nam),
                app.model.tccbDanhGiaFormChuyenVienParent.deleteByYear(nam),
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia/clone', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        try {
            const id = req.body.id, newItem = req.body.newItem;
            let item = await app.model.tccbDanhGiaNam.get({ nam: Number(newItem.nam) });
            if (item) {
                throw 'Năm đánh giá đã tồn tại';
            }
            item = await app.model.tccbDanhGiaNam.get({ id });
            const nam = item.nam;
            let [itemsCanBo, itemsDonVi, itemsDiemThuong, itemsDiemTru, itemsTyLeDiem] = await Promise.all([
                app.model.tccbKhungDanhGiaCanBo.getAll({ nam }),
                app.model.tccbKhungDanhGiaDonVi.getAll({ nam, isDelete: 0 }),
                app.model.tccbDiemThuong.getAll({ nam }),
                app.model.tccbDiemTru.getAll({ nam }),
                app.model.tccbTyLeDiem.getAll({ nam }),
            ]);
            itemsCanBo = itemsCanBo.map(canBo => {
                delete canBo.id;
                delete canBo.nam;
                return { ...canBo, nam: Number(newItem.nam) };
            });
            itemsDiemThuong = itemsDiemThuong.map(item => {
                delete item.id;
                delete item.nam;
                return { nam: Number(newItem.nam), ...item };
            });
            itemsDiemTru = itemsDiemTru.map(item => {
                delete item.id;
                delete item.nam;
                return { nam: Number(newItem.nam), ...item };
            });
            itemsTyLeDiem = itemsTyLeDiem.map(item => {
                delete item.id;
                delete item.nam;
                return { nam: Number(newItem.nam), ...item };
            });

            itemsDonVi = itemsDonVi.map(donVi => {
                delete donVi.nam;
                return { ...donVi, nam: Number(newItem.nam) };
            });
            const parentItems = itemsDonVi.filter(item => !item.parentId);
            const sortChildItems = parentItems.map(parent => ({ ...parent, submenus: itemsDonVi.filter(item => item.parentId == parent.id) }));
            const listNewParent = await Promise.all(parentItems.map(parentItem => {
                delete parentItem.id;
                delete parentItem.submenus;
                return app.model.tccbKhungDanhGiaDonVi.create(parentItem);
            }));
            let listNewChild = sortChildItems.map((parentItem, index) =>
                parentItem.submenus.map(submenu => {
                    delete submenu.id;
                    delete submenu.parentId;
                    return { ...submenu, parentId: listNewParent[index].id };
                })
            );
            listNewChild = listNewChild.reduce((prev, cur) => prev.concat(cur));

            let listPromise = [
                itemsCanBo.map(item => app.model.tccbKhungDanhGiaCanBo.create(item)),
                itemsDiemThuong.map(item => app.model.tccbDiemThuong.create(item)),
                itemsDiemTru.map(item => app.model.tccbDiemTru.create(item)),
                itemsTyLeDiem.map(item => app.model.tccbTyLeDiem.create(item)),
                listNewChild.map(item => app.model.tccbKhungDanhGiaDonVi.create(item)),
            ];
            await Promise.all(listPromise.reduce((prev, cur) => prev.concat(cur)));
            await Promise.all([
                app.model.tccbDinhMucCongViecGvVaNcv.cloneByYear(nam, newItem.nam),
                app.model.tccbDanhGiaFormChuyenVienParent.cloneByYear(nam, newItem.nam),
            ]);
            item = await app.model.tccbDanhGiaNam.create(newItem);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};