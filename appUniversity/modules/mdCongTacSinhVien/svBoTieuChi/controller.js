module.exports = app => {
    const menuBoTieuChi = {
        parentMenu: app.parentMenu.students,
        menus: {
            6120: { title: 'Bộ tiêu chí', parentKey: 6129, link: '/user/ctsv/bo-tieu-chi', icon: 'fa-book', backgroundColor: '#ac2d34' }
        }
    };

    app.permission.add(
        { name: 'ctsvBoTieuChi:manage', menu: menuBoTieuChi },
        { name: 'ctsvBoTieuChi:write' },
        { name: 'ctsvBoTieuChi:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleBoTieuChi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvBoTieuChi:manage', 'ctsvBoTieuChi:write');
            resolve();
        } else resolve();
    }));


    app.get('/user/ctsv/bo-tieu-chi', app.permission.check('ctsvBoTieuChi:manage'), app.templates.admin);
    app.get('/user/ctsv/bo-tieu-chi/:ma', app.permission.check('ctsvBoTieuChi:manage'), app.templates.admin);

    // Helper =========================================================================================
    const getChildrenId = async ({ ma, idBo }) => {
        const listTieuChi = await app.model.svBoTieuChi.getAll({ idBo });

        let queue = listTieuChi.filter(subItem => subItem.maCha == ma),
            listMa = [];
        while (queue.length) {
            const candidate = queue.pop();
            listMa.push(candidate.ma);
            queue = queue.concat(listTieuChi.filter(subItem => subItem.maCha == candidate.ma));
        }
        return listMa;
    };

    const checkCanEdit = async (idBo) => {
        const listDot = await app.model.svDotDanhGiaDrl.getAll({ maBoTc: idBo, active: 1 }, '*', 'timeModified');
        let canEdit = true;
        for (let dotDrl of listDot) {
            const now = Date.now();
            const { timeStartSv, timeStartLt, timeStartFaculty, timeEndSv, timeEndLt, timeEndFaculty } = dotDrl,
                ngayBatDau = Math.min(...[timeStartSv, timeStartLt, timeStartFaculty].filter(item => item != null)),
                ngayKetThuc = Math.max(...[timeEndSv, timeEndLt, timeEndFaculty].filter(item => item != null));
            canEdit = canEdit && now <= ngayBatDau || ngayKetThuc <= now;
            if (!canEdit) return canEdit;
        }
        return canEdit;
    };

    //  API ============================================================================================================================

    app.get('/api/ctsv/bo-tieu-chi', app.permission.orCheck('ctsvBoTieuChi:manage', 'student:login'), async (req, res) => {
        try {
            const { idBo, isDeleted = 0 } = req.query;
            const [dataBotieuChi, preItems] = await Promise.all([
                app.model.svManageBoTieuChi.get({ id: idBo }),
                app.model.svBoTieuChi.getAll({ idBo }, '*', 'kichHoat DESC, stt')
            ]);
            let items = [];
            if (isDeleted == 0) {
                const buildTree = (item) => {
                    const subItems = preItems.filter(_item => _item.maCha == item.ma && _item.isDelete == false).map(_item => buildTree(_item));
                    const totalMax = subItems.filter(subItem => subItem.kichHoat == 1).reduce((cur, v) => cur + parseInt(v.diemMax), 0);
                    item.subItems = subItems;
                    item.totalMax = totalMax;
                    return { ...item };
                };

                items = preItems.filter(item => item.maCha == null && item.isDelete == isDeleted).map(item => buildTree(item));
                dataBotieuChi && (dataBotieuChi.canEdit = await checkCanEdit(idBo));
            }
            if (isDeleted == 1) {
                let tempItems = {};
                let list = [];
                tempItems = preItems.filter(_item => _item.isDelete == 1);
                const buildChild = (item) => {
                    const subItems = preItems.filter(_item => _item.maCha == item.ma).map(_item => buildChild(_item));
                    item.subItems = subItems;
                    return { ...item };
                };
                for (let i = 0; i < tempItems.length; i++) {
                    let count = 0;
                    for (let j = 0; j < tempItems.length; j++) {
                        if (tempItems[i].maCha == tempItems[j].ma) {
                            count++;
                            break;
                        }
                    }
                    if (count == 0) {
                        list.push(tempItems[i]);
                    }
                }
                // items = list.map(_it => ({ ..._it, subItems: [] }));
                items = list.map(item => buildChild(item));
                dataBotieuChi && (dataBotieuChi.canEdit = await checkCanEdit(idBo));
            }

            res.send({ items, dataBotieuChi });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.get('/api/ctsv/bo-tieu-chi/tieu-chi-con', app.permission.check('user:login'), async (req, res) => {
        try {
            const { idBo, searchTerm } = req.query;
            if (!idBo) throw 'Missing required parameters';
            const items = await app.model.svBoTieuChi.searchAll(searchTerm, app.utils.stringify({ idBo })).then(value => value.rows);
            res.send({ items, length: items.length });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/bo-tieu-chi/item', app.permission.orCheck('ctsvBoTieuChi:write', 'student:login'), async (req, res) => {
        try {
            const { ma } = req.query;
            // const item = await app.model.svBoTieuChi.get({ ma });
            const item = await app.model.svBoTieuChi.searchAll(undefined, app.utils.stringify({ ma })).then(value => value.rows[0]);
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.put('/api/ctsv/bo-tieu-chi', app.permission.check('ctsvBoTieuChi:write'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            const staffHandle = req.session.user.email;
            const timeModified = Date.now();
            const item = await app.model.svBoTieuChi.update({ ma }, { ...changes, staffHandle, timeModified });

            if (await checkCanEdit(changes.idBo)) {
                if (typeof changes.kichHoat == 'string') {
                    const listUpdate = await getChildrenId(item);
                    listUpdate.length > 0 && (await app.model.svBoTieuChi.update({
                        statement: 'ma in (:listUpdate)',
                        parameter: { listUpdate }
                    }, { kichHoat: changes.kichHoat, staffHandle, timeModified }));
                }
                res.send({ item });
            } else {
                throw 'Hiện đang trong đợt sử dụng bộ tiêu chí này';
            }
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.put('/api/ctsv/bo-tieu-chi-da-xoa', app.permission.check('ctsvBoTieuChi:write'), async (req, res) => {
        try {
            const { ma, changes } = req.body;
            const staffHandle = req.session.user.email;
            const timeModified = Date.now();
            if (await checkCanEdit(changes.idBo)) {
                const item = await app.model.svBoTieuChi.update({ ma }, { ...changes, staffHandle, timeModified });
                const listUpdate = await getChildrenId(item);
                listUpdate.length > 0 && (await app.model.svBoTieuChi.update({
                    statement: 'ma in (:listUpdate)',
                    parameter: { listUpdate }
                }, { isDelete: changes.isDelete, staffHandle, timeModified }));
                res.send({ item });
            } else {
                throw 'Hiện đang trong đợt sử dụng bộ tiêu chí này';
            }
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/bo-tieu-chi', app.permission.check('ctsvBoTieuChi:write'), async (req, res) => {
        try {
            const { data } = req.body;
            if (await checkCanEdit(data.idBo)) {
                if (data.maCha) {
                    const tieuChiTop = await app.model.svBoTieuChi.get({ maCha: data.maCha }, '*', 'stt DESC');
                    data.stt = (parseInt(tieuChiTop?.stt) || 0) + 1;
                } else {
                    const tieuChiTop = await app.model.svBoTieuChi.get({ maCha: null }, '*', 'stt DESC');
                    data.stt = (parseInt(tieuChiTop?.stt) || 0) + 1;
                }
                data.staffHandle = req.session.user.email;
                data.timeModified = Date.now();
                const item = await app.model.svBoTieuChi.create(data);
                res.send({ item });
            } else {
                throw 'Hiện đang trong đợt đánh giá điểm rèn luyện';
            }
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/bo-tieu-chi', app.permission.check('ctsvBoTieuChi:delete'), async (req, res) => {
        try {
            const { ma } = req.body;
            const item = await app.model.svBoTieuChi.get({ ma });

            if (await checkCanEdit(item.idBo)) {
                const listId = await getChildrenId(item);
                listId.push(item.ma);
                await app.model.svBoTieuChi.delete({
                    statement: 'ma in (:listId)',
                    parameter: { listId }
                });
                res.end();
            } else {
                throw 'Hiện đang trong đợt sử dụng bộ tiêu chí này';
            }
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.put('/api/ctsv/bo-tieu-chi/sort', app.permission.check('ctsvBoTieuChi:manage'), async (req, res) => {
        try {
            const { ma, maCha, oldIndex, newIndex } = req.body;
            await app.model.svBoTieuChi.updateSort(ma, maCha, oldIndex, newIndex);
            res.end();
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.put('/api/ctsv/bo-tieu-chi/swap', app.permission.check('ctsvBoTieuChi:manage'), async (req, res) => {
        try {
            const { srcMa, destMa, srcStt, destStt } = req.body;
            await app.model.svBoTieuChi.updateSwap(srcMa, destMa, srcStt, destStt);
            res.end();
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    // Common page ==============================================================

    app.get('/api/ctsv/bo-tieu-chi/list/all', app.permission.check('ctsvBoTieuChi:manage'), async (req, res) => {
        try {
            const items = await app.model.svManageBoTieuChi.getAll({}, '*', 'namHoc DESC, hocKy DESC');
            res.send({ items });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.get('/api/ctsv/bo-tieu-chi/list', app.permission.check('ctsvBoTieuChi:manage'), async (req, res) => {
        try {
            const id = req.query.id;
            const item = await app.model.svManageBoTieuChi.get({ id }, '*', 'namHoc DESC, hocKy DESC');
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.post('/api/ctsv/bo-tieu-chi/list', app.permission.check('ctsvBoTieuChi:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.svManageBoTieuChi.create(data);
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.post('/api/ctsv/bo-tieu-chi/clone', app.permission.check('ctsvBoTieuChi:write'), async (req, res) => {
        try {
            const { id } = req.body;
            const [mngBoTieuChi, lsTieuChi] = await Promise.all([
                app.model.svManageBoTieuChi.get({ id }),
                app.model.svBoTieuChi.getAll({ idBo: id })
            ]);
            // Clone khung tieu chi
            delete mngBoTieuChi.id;
            const { id: newIdBo } = await app.model.svManageBoTieuChi.create({ ...mngBoTieuChi, ten: mngBoTieuChi.ten + ' bản sao' });
            // Map mã tiêu chí cũ với tiêu chí mới, theo dõi những tiêu chí đã sao chép
            const mapTieuChi = {};
            // Lặp khi danh sách còn tiêu chí
            while (lsTieuChi.length) {
                const head = lsTieuChi.splice(0, 1)[0];
                // Nếu tiêu chí mồi coi hoặc cha của tiêu chí đã được sao chép, sao chép tiêu chí và liên kết với cha. 
                // Không thì đẩy về cuối hàng
                if (!head.maCha || mapTieuChi[head.maCha]) {
                    const { ma: maOld, ...tieuChiOld } = head;
                    const tieuChiChaNew = mapTieuChi[head.maCha];
                    const tieuChiNew = await app.model.svBoTieuChi.create({ ...tieuChiOld, idBo: newIdBo, maCha: tieuChiChaNew?.ma });
                    mapTieuChi[maOld] = tieuChiNew; //Đánh dấu tiêu chí đã được sao chép
                } else {
                    lsTieuChi.push(head);
                }
            }
            res.end();
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.put('/api/ctsv/bo-tieu-chi/list', app.permission.check('ctsvBoTieuChi:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.svManageBoTieuChi.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/bo-tieu-chi/list', app.permission.check('ctsvBoTieuChi:write'), async (req, res) => {
        try {
            const { id } = req.body;
            const item = await app.model.svManageBoTieuChi.delete({ id });
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });
};