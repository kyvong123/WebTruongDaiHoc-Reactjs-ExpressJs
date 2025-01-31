module.exports = app => {
    app.permissionHooks.add('staff', 'addRolesDtThoiKhoaBieu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:write', 'dtThoiKhoaBieu:delete', 'dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:import', 'dtDmTinhTrangHocPhan:manage');
            resolve();
        } else resolve();
    }));

    app.readyHooks.add('addSocketListener:ImportTKBData', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ImportTKBData', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('dtThoiKhoaBieu:write')) {
                socket.join('ImportTKBData');
                socket.join('SaveImportTKBData');
                socket.join('GenTKBData');
                socket.join('SaveGenTKBData');
            }
        }),
    });

    // Schedule
    app.readyHooks.add('dtThoiKhoaBieu:DeleteIdThoiKhoaBieu', {
        ready: () => app.database && app.model,
        run: () => {
            app.primaryWorker && app.appName == 'mdDaoTaoService' && app.schedule('0 7 * * *', async () => {
                try {
                    console.info('dtThoiKhoaBieu:DeleteIdThoiKhoaBieu is starting');
                    await Promise.all([
                        app.model.dtThoiKhoaBieuCustom.delete({
                            statement: 'idThoiKhoaBieu NOT IN (SELECT ID FROM DT_THOI_KHOA_BIEU)',
                            parameter: {}
                        }),
                        app.model.dtThoiKhoaBieuGiangVien.delete({
                            statement: 'idThoiKhoaBieu NOT IN (SELECT ID FROM DT_THOI_KHOA_BIEU)',
                            parameter: {}
                        }),
                    ]);
                } catch (error) {
                    console.error('dtThoiKhoaBieu:DeleteIdThoiKhoaBieu', error);
                }
            });
        },
    });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/thoi-khoa-bieu/page/:pageNumber/:pageSize', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage', 'dtThuLaoGiangDay:manage', 'dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const user = req.session.user;
            let filter = req.query.filter || {}, sort = filter.sort,
                donVi = filter.donVi || '';

            await app.model.dtAssignRole.getDataRole('dtThoiKhoaBieu', user, filter);

            if (filter.ks_thu?.toString().toLowerCase() == 'cn') filter.ks_thu = '8';
            filter = app.utils.stringify(app.clone(filter, { donVi, sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtThoiKhoaBieu.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, thoigianphancong } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, thoiGianPhanCong: thoigianphancong } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/thong-ke/page/:pageNumber/:pageSize', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            let page = await app.model.dtThoiKhoaBieu.thongKeSearchPage(_pageNumber, _pageSize, app.utils.stringify({ ...filter, sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/all', app.permission.check('dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            let filter = req.query.filter;
            let listMaMonHoc = await app.model.dtThoiKhoaBieu.searchPage(1, 5000, filter, '');
            listMaMonHoc = listMaMonHoc.rows.map(item => { return { maMonHoc: item.maMonHoc, tenMonHoc: item.tenMonHoc }; });
            let listMa = new Set();
            listMaMonHoc = listMaMonHoc.reduce((ma, item) => {
                if (!listMa.has(item.maMonHoc)) {
                    item.tenMonHoc = app.utils.parse(item.tenMonHoc)?.vi || '';
                    listMa.add(item.maMonHoc);
                    ma.push(item);
                }
                return ma;
            }, []);
            res.send({ items: listMaMonHoc });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/giang-vien/:id', app.permission.check('dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            let id = req.params.id;
            const data = await app.model.dtThoiKhoaBieu.getScheduleGiangVien(id);
            res.send({ data: data.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dtThoiKhoaBieu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/dt/thoi-khoa-bieu/hocPhan/student-list', app.permission.orCheck('dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:read', 'dtDiemAll:read', 'dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let { maHocPhan, filter } = req.query;
            let items = await app.model.dtThoiKhoaBieu.getStudent(maHocPhan, app.utils.stringify(filter));
            items = items.rows.map(item => ({
                ...item, diem: app.utils.parse(item.diem), diemDacBiet: app.utils.parse(item.diemDacBiet),
                timeModified: app.utils.parse(item.timeModified), userModified: app.utils.parse(item.userModified)
            }));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu/multiple', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let item = req.body.item || [],
                settings = req.body.settings;
            let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
                { loaiHinhDaoTao, bacDaoTao } = settings;
            thoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == loaiHinhDaoTao && item.bacDaoTao == bacDaoTao);
            let { nam, hocKy } = (item.nam && item.hocKy) ? item : thoiGianMoMon;
            for (let index = 0; index < item.length; index++) {
                let monHoc = item[index];
                delete monHoc.id;
                let { maMonHoc, loaiMonHoc, khoaSv, chuyenNganh, soTietBuoi, soBuoiTuan, soLuongDuKien, soLop, maNganh } = monHoc;
                ['chuyenNganh', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(key => delete monHoc[key]);
                const tkb = await app.model.dtThoiKhoaBieu.get({ maMonHoc, loaiMonHoc, khoaSinhVien: khoaSv, maNganh, loaiHinhDaoTao, bacDaoTao });
                if (!tkb) {
                    if (chuyenNganh) {
                        if (Array.isArray(chuyenNganh) && chuyenNganh.every(item => typeof item == 'object')) {
                            for (let index = 0; index < parseInt(chuyenNganh.length); index++) {
                                let soTiet = parseInt(soTietBuoi[index]), soBuoi = parseInt(soBuoiTuan[index]), sldk = parseInt(soLuongDuKien[index]), chNg = chuyenNganh[index];
                                if (soBuoi > 1) {
                                    for (let buoi = 1; buoi <= parseInt(soBuoi); buoi++) {
                                        let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom: index + 1, buoi, nam, hocKy, soTietBuoi: soTiet, soLuongDuKien: sldk, loaiHinhDaoTao, bacDaoTao, soBuoiTuan: soBuoi });
                                        if (item) {
                                            for (const nganh of chNg) {
                                                let idNganh = `${maNganh}##${nganh}`;
                                                await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh });
                                            }
                                        }
                                    }
                                } else {
                                    let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom: index + 1, buoi: 1, nam, hocKy, soTietBuoi: soTiet, soLuongDuKien: sldk, loaiHinhDaoTao, bacDaoTao, soBuoiTuan: soBuoi });
                                    if (item) {
                                        for (const nganh of chNg) {
                                            let idNganh = `${maNganh}##${nganh}`;
                                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh });
                                        }
                                    }
                                }
                            }
                        } else {
                            soLop = parseInt(soLop);
                            for (let nhom = 1; nhom <= parseInt(soLop); nhom++) {
                                let soBuoi = parseInt(soBuoiTuan);
                                if (soBuoi > 1) {
                                    for (let buoi = 1; buoi <= parseInt(soBuoi); buoi++) {
                                        let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), chuyenNganh: chuyenNganh.toString(), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                        if (item) {
                                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh: `${maNganh}##${chuyenNganh}` });
                                        }
                                    }
                                } else {
                                    let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi: 1, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), chuyenNganh: chuyenNganh.toString(), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                    if (item) {
                                        await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh: `${maNganh}##${chuyenNganh}` });
                                    }
                                }
                            }
                        }
                    } else {
                        soLop = parseInt(soLop);
                        for (let nhom = 1; nhom <= soLop; nhom++) {
                            let soBuoi = parseInt(soBuoiTuan);
                            if (soBuoi > 1) {
                                for (let buoi = 1; buoi <= soBuoi; buoi++) {
                                    let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                    if (item) {
                                        await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh: maNganh });
                                    }
                                }
                            } else {
                                let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi: 1, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                if (item) {
                                    await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh: maNganh });
                                }
                            }
                        }
                    }
                }
            }
            await app.model.dtDangKyMoMon.update({ id: settings.idMoMon }, { isDuyet: 1, thoiGian: new Date().getTime() });
            res.end();
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.put('/api/dt/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { changes, id } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();
            if (changes.loaiMonHoc != null && !isNaN(changes.loaiMonHoc)) {
                await app.model.dtThoiKhoaBieu.update({ id }, changes);
            } else {
                if (changes.fullData) {
                    let { tinhTrang = 2, soLuongDuKien, fullData, listTuanHoc, maHocPhan, lop, isUpdateThongTin } = changes;
                    fullData = JSON.parse(fullData);
                    listTuanHoc = JSON.parse(listTuanHoc);

                    // Update thoiKhoaBieu
                    let fullDataTKB = await app.model.dtThoiKhoaBieu.getAll({ maHocPhan }),
                        listId = fullDataTKB.map(i => i.id);

                    await app.model.dtThoiKhoaBieuNganh.delete({
                        statement: 'idThoiKhoaBieu IN (:listId)',
                        parameter: { listId }
                    });

                    if (isUpdateThongTin) {
                        if (lop && lop.length) {
                            for (let idThoiKhoaBieu of listId) {
                                for (let idNganh of lop) {
                                    await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu, idNganh });
                                }
                            }
                            let lopSV = await app.model.dtLop.get({ maLop: lop[0] });
                            await app.model.dtThoiKhoaBieu.update({
                                statement: 'id IN (:listId)',
                                parameter: { listId }
                            }, { khoaSinhVien: lopSV.khoaSinhVien });
                        }

                        await app.model.dtThoiKhoaBieu.update({ maHocPhan }, {
                            userModified, lastModified: timeModified, soLuongDuKien, tinhTrang,
                        });
                    } else {
                        await app.model.dtThoiKhoaBieuGiangVien.delete({
                            statement: 'idThoiKhoaBieu IN (:listId)',
                            parameter: { listId }
                        });

                        if (fullDataTKB.length < fullData.length) {
                            let hocPhan = fullDataTKB[0];
                            delete hocPhan.id;
                            for (let i = 0; i < fullData.length - fullDataTKB.length; i++) {
                                await app.model.dtThoiKhoaBieu.create({ ...hocPhan, giangVien: hocPhan.shccGV });
                            }
                        } else if (fullDataTKB.length > fullData.length) {
                            for (let item of fullDataTKB.filter(tkb => !fullData.map(i => i.id).includes(tkb.id))) {
                                await app.model.dtThoiKhoaBieu.delete({ id: item.id });
                            }
                        }

                        fullDataTKB = await app.model.dtThoiKhoaBieu.getAll({ maHocPhan }, '*', 'id');
                        let listNgayHoc = listTuanHoc.filter(i => !i.isNgayLe);
                        for (let i = 0; i < fullData.length; i++) {
                            let { phong, thu, tietBatDau, soTietBuoi, coSo, tuanBatDau, soTuan = '', isTrungTKB = '', shccGV } = fullData[i];
                            await app.model.dtThoiKhoaBieu.update({ id: fullDataTKB[i].id }, {
                                ngayBatDau: listNgayHoc[0]?.ngayHoc || '', ngayKetThuc: listNgayHoc[listNgayHoc.length - 1]?.ngayHoc || '',
                                buoi: i + 1, soBuoiTuan: fullData.length, userModified, lastModified: timeModified, giangVien: shccGV,
                                phong, thu, tietBatDau, soTietBuoi, coSo, soLuongDuKien, tinhTrang, tuanBatDau, soTuan, isTrung: isTrungTKB ? 1 : '',
                            });
                        }

                        listId = fullDataTKB.map(i => i.id);
                        // Update thong tin lop
                        if (lop && lop.length) {
                            for (let idThoiKhoaBieu of listId) {
                                for (let idNganh of lop) {
                                    await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu, idNganh });
                                }
                            }
                            let lopSV = await app.model.dtLop.get({ maLop: lop[0] });
                            await app.model.dtThoiKhoaBieu.update({
                                statement: 'id IN (:listId)',
                                parameter: { listId }
                            }, { khoaSinhVien: lopSV.khoaSinhVien });
                        }

                        // Update info TUAN HOC
                        await app.model.dtThoiKhoaBieuCustom.delete({ maHocPhan });
                        for (let item of listTuanHoc) {
                            let { maHocPhan, thu, tietBatDau, ngayBatDau, ngayKetThuc, originTuan } = item;
                            delete item.id;
                            let infoTKB = await app.model.dtThoiKhoaBieu.get({ maHocPhan, thu, tietBatDau, tuanBatDau: originTuan }, 'id, giangVien'), id = infoTKB ? infoTKB.id : fullDataTKB[0].id;
                            const tuan = await app.model.dtThoiKhoaBieuCustom.create({ ...item, isNgayLe: item.isNgayLe ? 1 : '', idThoiKhoaBieu: id, thoiGianBatDau: ngayBatDau, thoiGianKetThuc: ngayKetThuc, modifier: userModified, timeModified, ghiChu: '' });
                            if (!item.isNgayLe) {
                                await Promise.all((infoTKB && infoTKB.giangVien ? infoTKB.giangVien.split(',') : []).map(async gv => {
                                    await app.model.dtThoiKhoaBieuGiangVien.create({ idThoiKhoaBieu: id, giangVien: gv, type: 'GV', ngayBatDau, ngayKetThuc, userModified, timeModified, idTuan: tuan.id });
                                }));
                            }
                        }
                        await app.model.dtThoiKhoaBieuCustom.delete({
                            statement: 'idThoiKhoaBieu NOT IN (SELECT ID FROM DT_THOI_KHOA_BIEU)',
                            parameter: {}
                        });

                        app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc: fullDataTKB[0].namHoc, hocKy: fullDataTKB[0].hocKy });
                    }

                    app.dkhpRedis.initInfoHocPhan(maHocPhan);
                    app.dkhpRedis.updateSiSoHocPhan({ maHocPhan, soLuongDuKien });
                } else {
                    let { dataChange, dataGV } = changes;
                    await Promise.all([
                        app.model.dtThoiKhoaBieuNganh.delete({ idThoiKhoaBieu: id }),
                        app.model.dtThoiKhoaBieuGiangVien.delete({ idThoiKhoaBieu: id }),
                        app.model.dtThoiKhoaBieu.update({ id }, { ...dataChange, userModified, lastModified: timeModified, tinhTrang: 2 }),
                    ]);
                    if (dataChange.maLop && dataChange.maLop.length) {
                        for (let idNganh of dataChange.maLop) {
                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: id, idNganh });
                        }
                        let lopSV = await app.model.dtLop.get({ maLop: dataChange.maLop[0] });
                        await app.model.dtThoiKhoaBieu.update({ id }, { khoaSinhVien: lopSV.khoaSinhVien });
                    }

                    const dataTuan = await app.model.dtThoiKhoaBieuCustom.getAll({ idThoiKhoaBieu: id });
                    if (dataTuan && dataTuan.length) {
                        for (let tuan of dataTuan) {
                            if (!tuan.isNgayLe && dataGV && dataGV.length) {
                                for (let gv of dataGV) {
                                    await app.model.dtThoiKhoaBieuGiangVien.create({
                                        idThoiKhoaBieu: id, idTuan: tuan.id,
                                        giangVien: gv.giangVien,
                                        type: gv.type, timeModified, userModified,
                                        ngayBatDau: tuan.thoiGianBatDau,
                                        ngayKetThuc: tuan.thoiGianKetThuc,
                                    });
                                }
                            }
                        }
                    } else {
                        if (dataGV && dataGV.length) {
                            for (let gv of dataGV) {
                                await app.model.dtThoiKhoaBieuGiangVien.create({
                                    idThoiKhoaBieu: id,
                                    giangVien: gv.giangVien,
                                    type: gv.type, timeModified, userModified,
                                    ngayBatDau: '', ngayKetThuc: '',
                                });
                            }
                        }
                    }

                    app.dkhpRedis.updateSiSoHocPhan({
                        maHocPhan: dataChange.maHocPhan,
                        soLuongDuKien: dataChange.soLuongDuKien,
                    });
                    app.dkhpRedis.initInfoHocPhan(dataChange.maHocPhan);
                }
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/thoi-khoa-bieu/delete-thong-tin-hoc-phan', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { maHocPhan } = req.body;
            await app.model.dtThoiKhoaBieuCustom.delete({ maHocPhan });

            let dataTKB = await app.model.dtThoiKhoaBieu.getAll({ maHocPhan });

            let listId = dataTKB.map(item => item.id);
            await app.model.dtThoiKhoaBieuGiangVien.delete({
                statement: 'idThoiKhoaBieu IN (:listId)',
                parameter: { listId }
            });

            let tkbNganh = (await app.model.dtThoiKhoaBieuNganh.getAll({
                statement: 'idThoiKhoaBieu IN (:listId)',
                parameter: { listId }
            }, 'idNganh')).map(i => i.idNganh);

            await app.model.dtThoiKhoaBieuNganh.delete({
                statement: 'idThoiKhoaBieu IN (:listId)',
                parameter: { listId }
            });

            await app.model.dtThoiKhoaBieu.delete({ maHocPhan });

            let { maMonHoc, nhom, namHoc, hocKy, khoaDangKy, soLuongDuKien, soTietLyThuyet, soTietThucHanh, tongTiet, loaiHinhDaoTao, bacDaoTao, khoaSinhVien, coSo, tinhTrang = 2, isOnlyKhoa } = dataTKB[0];
            let item = await app.model.dtThoiKhoaBieu.create({
                maMonHoc, nhom, namHoc, hocKy, khoaDangKy, soLuongDuKien, soTietLyThuyet, soTietThucHanh, tongTiet, loaiHinhDaoTao, bacDaoTao, khoaSinhVien, coSo, tinhTrang, isOnlyKhoa,
                maHocPhan, thu: '', phong: '', tietBatDau: '', soTietBuoi: '', ngayBatDau: '', ngayKetThuc: '', soTuan: '', tuanBatDau: '', buoi: 1, soBuoiTuan: 1, isMo: 1, isTrung: '',
            });

            if (tkbNganh && tkbNganh.length) {
                for (let idNganh of tkbNganh) {
                    await app.model.dtThoiKhoaBieuNganh.create({ idNganh, idThoiKhoaBieu: item.id });
                }
            }
            app.dkhpRedis.initInfoHocPhan(maHocPhan);

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send(error);
        }
    });

    app.put('/api/dt/thoi-khoa-bieu-condition', app.permission.orCheck('dtThoiKhoaBieu:write', 'dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            let { condition, changes, config } = req.body,
                { tietBatDau, soTietBuoi, thu } = changes;
            tietBatDau = parseInt(tietBatDau);
            soTietBuoi = parseInt(soTietBuoi);
            thu = parseInt(thu);
            let warning = '';
            if (!isNaN(condition)) {
                let data = await app.model.dtThoiKhoaBieu.getAllLop(JSON.stringify({ condition, ...config }));
                if (data && data.rows.length) {
                    const itemCheck = data.rows.find(item => item.thu == thu
                        && (
                            (tietBatDau <= (parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1)
                                && tietBatDau >= parseInt(item.tietBatDau)) ||
                            ((tietBatDau + soTietBuoi - 1) >= parseInt(item.tietBatDau)
                                && (tietBatDau + soTietBuoi - 1) <= (parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1))
                        )
                    );
                    if (itemCheck) {
                        warning = `Trùng thời gian học phần ${itemCheck.maHocPhan} của lớp`;
                    }
                    if (changes.phong) {
                        let hocPhan = await app.model.dtThoiKhoaBieu.get({ id: condition }),
                            { namHoc, hocKy, maHocPhan } = hocPhan;

                        let listCurrentRoom = await app.model.dtThoiKhoaBieu.getAll({
                            statement: 'namHoc = :namHoc AND hocKy = :hocKy AND maHocPhan != :maHocPhan AND phong = :phong AND thu IS NOT NULL AND tietBatDau IS NOT NULL',
                            parameter: { namHoc, hocKy, phong: changes.phong, maHocPhan }
                        });
                        if (listCurrentRoom.length && listCurrentRoom.some(item => item.thu == thu
                            && (
                                (tietBatDau <= (parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1)
                                    && tietBatDau >= parseInt(item.tietBatDau)) ||
                                ((tietBatDau + soTietBuoi - 1) >= parseInt(item.tietBatDau)
                                    && (tietBatDau + soTietBuoi - 1) <= (parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1))
                            )
                        )) {
                            throw `Phòng ${changes.phong} bị trùng giờ`;
                        }
                    }

                    ['thu', 'tietBatDau', 'soTietBuoi', 'soLuongDuKien'].forEach(key => {
                        if (!changes[key]) changes[key] = '';
                    });

                    let item = await app.model.dtThoiKhoaBieu.update({ id: condition }, changes);

                    if (changes.maLop) {
                        await app.model.dtThoiKhoaBieuNganh.delete({ idThoiKhoaBieu: condition });
                        for (let idNganh of changes.maLop) {
                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: condition, idNganh });
                        }
                    }
                    const dataLop = await app.model.dtThoiKhoaBieuNganh.getAll({ idThoiKhoaBieu: item.id });
                    res.send({ item: { ...item, maLop: dataLop.map(item => item.idNganh).toString() }, warning });
                } else {
                    if (changes.maLop) {
                        let item = await app.model.dtThoiKhoaBieu.update({ id: condition }, changes);
                        await app.model.dtThoiKhoaBieuNganh.delete({ idThoiKhoaBieu: condition });
                        for (let idNganh of changes.maLop) {
                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: condition, idNganh });
                        }
                        const dataLop = await app.model.dtThoiKhoaBieuNganh.getAll({ idThoiKhoaBieu: item.id });
                        res.send({ item: { ...item, maLop: dataLop.map(item => item.idNganh).toString() }, warning });
                    }
                }
            }
            else if (typeof condition == 'object') {
                let { nam, hocKy, maMonHoc, loaiHinhDaoTao, bacDaoTao, khoaSinhVien } = condition;
                let item = await app.model.dtThoiKhoaBieu.update({ maMonHoc, nam, hocKy, loaiHinhDaoTao, bacDaoTao, khoaSinhVien }, changes);
                res.send({ item, warning });
            }
        } catch (error) {
            console.log(error);
            res.send({ error });
        }

    });

    app.put('/api/dt/thoi-khoa-bieu/update-check', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let id = req.body.id;
            if (typeof id == 'object') {
                const item = await app.model.dtThoiKhoaBieu.update({
                    statement: 'id in (:id)',
                    parameter: { id }
                }, { isMo: Number(req.body.isMo) });
                res.send({ item });
            } else {
                const item = await app.model.dtThoiKhoaBieu.update({ id }, { isMo: Number(req.body.isMo) });
                res.send({ item });
            }


        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/thoi-khoa-bieu/tinh-trang', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { maHocPhan, changes } = req.body;
            await app.model.dtThoiKhoaBieu.update({
                statement: 'maHocPhan IN (:maHocPhan)',
                parameter: { maHocPhan }
            }, { tinhTrang: changes.tinhTrang });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/thoi-khoa-bieu/so-luong-du-kien-multiple', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { listHocPhan, soLuongDuKien } = req.body,
                userModified = req.session.user.email,
                lastModified = Date.now();
            if (listHocPhan) {
                for (let maHocPhan of listHocPhan) {
                    await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { soLuongDuKien, userModified, lastModified });
                }

                for (let maHocPhan of listHocPhan) {
                    const allKeys = await app.database.dkhpRedis.keys(`SLDK:${maHocPhan}|*`);
                    for (let key of allKeys) {
                        await app.database.dkhpRedis.set(key, parseInt(soLuongDuKien));
                    }
                }
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:delete'), async (req, res) => {
        try {
            let maHocPhan = req.body.maHocPhan, user = req.session.user;
            const dssv = await app.model.dtDangKyHocPhan.count({ maHocPhan });
            if (dssv.rows[0]['COUNT(*)']) {
                throw 'Học phần đã có sinh viên đăng ký!';
            }
            let hocPhanDeleted = await app.model.dtThoiKhoaBieu.getAll({ maHocPhan }, 'maHocPhan,maMonHoc,hocKy,namHoc,thu,phong,tietBatDau,soBuoiTuan,buoi,soTietBuoi,soLuongDuKien,soTietLyThuyet,soTietThucHanh,loaiHinhDaoTao,khoaSinhVien,ngayBatDau,ngayKetThuc');

            let listId = await app.model.dtThoiKhoaBieu.getAll({ maHocPhan }, 'id');
            listId = listId.map(item => item.id);

            let condition = {
                statement: 'idThoiKhoaBieu IN (:listId)',
                parameter: { listId }
            };
            await Promise.all([
                app.model.dtThoiKhoaBieu.delete({ maHocPhan }),
                app.model.dtThoiKhoaBieuGiangVien.delete(condition),
                app.model.dtThoiKhoaBieuNganh.delete(condition),
                app.model.dtThoiKhoaBieuCustom.delete({ maHocPhan }),
            ]);

            res.send();
            for (let hocPhan of hocPhanDeleted) {
                let monHoc = await app.model.dmMonHoc.get({ ma: hocPhan.maMonHoc }, 'tietLt,tietTh');
                await app.model.dtThoiKhoaBieuDeleted.create({ ...hocPhan, soTietLyThuyet: monHoc?.tietLt, soTietThucHanh: monHoc?.tietTh, modifier: user.email, timeModified: Date.now() });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/thoi-khoa-bieu/condition', app.permission.check('dtThoiKhoaBieu:delete'), async (req, res) => {
        try {
            let listChosen = req.body.listChosen, user = req.session.user;
            let errorList = [], dataHocPhanDeleted = [];
            if (listChosen && listChosen.length) {
                for (let maHocPhan of listChosen) {
                    const dssv = await app.model.dtDangKyHocPhan.count({ maHocPhan });
                    if (dssv.rows[0]['COUNT(*)']) {
                        errorList.push(maHocPhan);
                    }
                    let hocPhanDeleted = await app.model.dtThoiKhoaBieu.getAll({ maHocPhan }, 'maHocPhan,maMonHoc,hocKy,namHoc,thu,phong,tietBatDau,soBuoiTuan,buoi,soTietBuoi,soLuongDuKien,soTietLyThuyet,soTietThucHanh,loaiHinhDaoTao,khoaSinhVien,ngayBatDau,ngayKetThuc');
                    dataHocPhanDeleted = [...dataHocPhanDeleted, ...hocPhanDeleted];
                }

                listChosen = listChosen.filter(item => !errorList.includes(item));

                if (listChosen.length) {
                    let condition1 = {
                        statement: 'maHocPhan IN (:listChosen)',
                        parameter: { listChosen }
                    };

                    let listId = await app.model.dtThoiKhoaBieu.getAll(condition1, 'id');
                    listId = listId.map(item => item.id);
                    let condition2 = {
                        statement: 'idThoiKhoaBieu IN (:listId)',
                        parameter: { listId }
                    };

                    await Promise.all([
                        app.model.dtThoiKhoaBieu.delete(condition1),
                        app.model.dtThoiKhoaBieuNganh.delete(condition2),
                        app.model.dtThoiKhoaBieuGiangVien.delete(condition2),
                        app.model.dtThoiKhoaBieuCustom.delete(condition1),
                    ]);
                }
            }
            res.send({ errorList });
            if (dataHocPhanDeleted.length > 0) {
                for (let hocPhan of dataHocPhanDeleted) {
                    let monHoc = await app.model.dmMonHoc.get({ ma: hocPhan.maMonHoc }, 'tietLt,tietTh');
                    await app.model.dtThoiKhoaBieuDeleted.create({ ...hocPhan, soTietLyThuyet: monHoc?.tietLt, soTietThucHanh: monHoc?.tietTh, modifier: user.email, timeModified: Date.now() });
                }
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/get-schedule', app.permission.check('dtThoiKhoaBieu:read'), async (req, res) => {
        let phong = req.query.phong;
        let listNgayLe = await app.model.dmNgayLe.getAllNgayLeTrongNam();
        app.model.dtThoiKhoaBieu.getCalendar(phong, '2022 - 2023', '1', (error, items) => {
            res.send({ error, items: items?.rows || [], listNgayLe });
        });
    });

    app.post('/api/dt/thoi-khoa-bieu/giang-vien', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            const data = req.body.data,
                { dataTuan, dataGV, dataTG, maHocPhan } = data,
                userModified = req.session.user.email,
                timeModified = Date.now();
            for (let tuan of dataTuan) {
                await app.model.dtThoiKhoaBieuGiangVien.delete({
                    idTuan: tuan.idTuan,
                    type: dataGV.type,
                });
                if (dataGV.giangVien?.length) {
                    for (let giangVien of dataGV.giangVien) {
                        await app.model.dtThoiKhoaBieuGiangVien.create({
                            idThoiKhoaBieu: tuan.id, idTuan: tuan.idTuan,
                            giangVien: giangVien,
                            type: dataGV.type,
                            ngayBatDau: tuan.ngayBatDau,
                            ngayKetThuc: tuan.ngayKetThuc,
                            userModified, timeModified,
                        });
                    }
                }

                await app.model.dtThoiKhoaBieuGiangVien.delete({
                    idTuan: tuan.idTuan,
                    type: dataTG.type,
                });
                if (dataTG.giangVien?.length) {
                    for (let troGiang of dataTG.giangVien) {
                        await app.model.dtThoiKhoaBieuGiangVien.create({
                            idThoiKhoaBieu: tuan.id, idTuan: tuan.idTuan,
                            giangVien: troGiang,
                            type: dataTG.type,
                            ngayBatDau: tuan.ngayBatDau,
                            ngayKetThuc: tuan.ngayKetThuc,
                            userModified, timeModified,
                        });
                    }
                }
            }
            app.dkhpRedis.initInfoHocPhan(maHocPhan);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/get-not-free', app.permission.check('dtThoiKhoaBieu:read'), async (req, res) => {
        try {
            let { filter, dataGiangVien } = req.query, gvHienTai = '', { idThoiKhoaBieu } = filter;

            const dataTuan = await app.model.dtThoiKhoaBieuCustom.getAll({ idThoiKhoaBieu });
            if (dataTuan && dataTuan.length) {
                if (dataGiangVien && dataGiangVien.length) {
                    for (let tuan of dataTuan.filter(i => !i.isNgayLe)) {
                        for (let gv of dataGiangVien) {
                            gvHienTai = await app.model.dtThoiKhoaBieuGiangVien.get({
                                statement: 'giangVien = :giangVien AND idNgayNghi IS NULL AND idThoiKhoaBieu != :idThoiKhoaBieu AND NOT ((:ngayBatDau > ngayKetThuc) OR (:ngayKetThuc < ngayBatDau))',
                                parameter: {
                                    giangVien: gv,
                                    ngayBatDau: tuan.thoiGianBatDau,
                                    ngayKetThuc: tuan.thoiGianKetThuc,
                                    idThoiKhoaBieu: tuan.idThoiKhoaBieu,
                                }
                            });
                            if (gvHienTai) break;
                        }
                        if (gvHienTai) break;
                    }
                }
            }
            res.send({ gvHienTai });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu/get-by-config', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            const { config } = req.body;
            let dataFree = await app.model.dtThoiKhoaBieu.getFree(JSON.stringify({ ...config }));
            let { rows: dataCanGen, hocphandaxep: dataCurrent } = dataFree;
            dataCanGen = dataCanGen.map(item => {
                if (!item.soTietBuoi) item.isMo = 0;
                return item;
            });

            res.send({ dataCanGen, dataCurrent });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }

    });

    app.put('/api/dt/thoi-khoa-bieu/save-gen-data', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { data, config } = req.body;

            const currentYear = new Date().getFullYear();
            let [listNgayLe, dataTiet] = await Promise.all([
                app.model.dmNgayLe.getAll({
                    statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear AND kichHoat = 1',
                    parameter: {
                        startDateOfYear: new Date(currentYear, 0, 1).setHours(0, 0, 0, 1),
                        endDateOfYear: new Date(currentYear + 1, 11, 31).setHours(23, 59, 59, 999)
                    }
                }, 'ngay', 'ngay'),
                app.model.dmCaHoc.getAll({ maCoSo: config.coSo, kichHoat: 1 }),
            ]);
            res.end();
            const dataGroupBy = data.groupBy('maHocPhan');
            for (let i = 0; i < Object.keys(dataGroupBy).length; i++) {
                const maHocPhan = Object.keys(dataGroupBy)[i];
                let fullData = dataGroupBy[maHocPhan], dataTuan = [];

                if (fullData.every(item => item.thu && item.ngayBatDau && item.tietBatDau && item.soTietBuoi)) {
                    fullData = fullData.map(i => {
                        let thoiGianBatDau = dataTiet.find(item => item.ten == i.tietBatDau).thoiGianBatDau;
                        let thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(i.tietBatDau) + parseInt(i.soTietBuoi) - 1).thoiGianKetThuc;
                        return { ...i, thoiGianBatDau, thoiGianKetThuc, ngayBatDau: parseInt(i.ngayBatDau) };
                    });

                    dataTuan = await app.model.dtThoiKhoaBieu.generateSchedule({
                        fullData, listNgayLe, dataTiet, dataTeacher: []
                    });
                }

                for (let hocPhan of fullData) {
                    let id = hocPhan.id;
                    delete hocPhan.id;
                    await app.model.dtThoiKhoaBieu.update({ id }, {
                        ...hocPhan, ngayBatDau: dataTuan.length ? dataTuan[0].ngayHoc : '', ngayKetThuc: dataTuan.length ? dataTuan.slice(-1)[0].ngayHoc : '',
                        userModified: req.session.user.email, lastModified: Date.now(), isTrung: '',
                    });
                }

                await app.model.dtThoiKhoaBieuCustom.delete({ maHocPhan });
                for (let tuan of dataTuan) {
                    let { id } = tuan;
                    delete tuan.id;
                    await app.model.dtThoiKhoaBieuCustom.create({ ...tuan, isNgayLe: tuan.isNgayLe ? 1 : '', idThoiKhoaBieu: id, thoiGianBatDau: tuan.ngayBatDau, thoiGianKetThuc: tuan.ngayKetThuc, modifier: req.session.user.email, timeModified: Date.now(), ghiChu: '' });
                }

                app.dkhpRedis.initInfoHocPhan(maHocPhan);
                app.dkhpRedis.initSiSoHocPhan(maHocPhan);
                app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc: config.nam, hocKy: config.hocKy });
                app.io.to('SaveGenTKBData').emit('save-gen-tkb-data', { requester: req.session.user.email, maHocPhan, status: i == Object.keys(dataGroupBy).length - 1 ? 'saveDone' : 'saving' });
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu/generate-time', app.permission.check('dtThoiKhoaBieu:write'), app.model.dtThoiKhoaBieu.getDataGenerateSchedule);

    app.post('/api/dt/thoi-khoa-bieu/generate-room-end-date', app.permission.check('dtThoiKhoaBieu:write'), app.model.dtThoiKhoaBieu.getDataRoomAndEndDate);

    // Upload Hooks----------------------------------------------------------------------------------------------
    app.uploadHooks.add('DtThoiKhoaBieuData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtThoiKhoaBieuImportDiemData(fields, files, params, done), done, 'dtThoiKhoaBieu:write')
    );

    const dtThoiKhoaBieuImportDiemData = async (fields, files, params, done) => {
        let ws = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'DtThoiKhoaBieuData' && files.DtThoiKhoaBieuData && files.DtThoiKhoaBieuData.length) {
            const srcPath = files.DtThoiKhoaBieuData[0].path;
            // const { maHocPhan } = params;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                ws = workbook.getWorksheet(1);
                let checkDiem = (diem) => {
                    return diem >= 0 && diem <= 10;
                };
                if (ws) {
                    const items = [];
                    try {
                        let index = 7;
                        let phanTramGk = parseInt(ws.getCell('J6').value.split('(')[1], 10),
                            phanTramCk = parseInt(ws.getCell('K6').value.split('(')[1], 10);
                        while (index <= ws._rows.length) {
                            let row = {
                                index,
                                mssv: ws.getCell('B' + index).value,
                                hoTen: `${ws.getCell('C' + index).value} ${ws.getCell('D' + index).value}`,
                                lop: ws.getCell('E' + index).value,
                                diemGk: ws.getCell('J' + index).value,
                                phanTramDiemGk: phanTramGk,
                                diemCk: ws.getCell('K' + index).value,
                                phanTramDiemCk: phanTramCk,
                                message: []
                            };
                            if ((row.diemGk || row.diemGk != 0) && !checkDiem(row.diemGk)) {
                                row.diemGk = null;
                                row.message.push('Điểm giữa kỳ không hợp lệ, vui lòng nhập lại!');
                            }
                            if (!row.diemCk && row.diemCk != 0) {
                                row.message.push('Vui lòng nhập điểm cuối kỳ!');
                            } else if (!checkDiem(row.diemCk)) {
                                row.diemCk = null;
                                row.message.push('Điểm cuối kỳ không hợp lệ, vui lòng nhập lại!');
                            }
                            items.push(row);
                            index++;
                        }
                        done({ items });
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };

    //Tra cứu phòng trống------------------------------------------------------------------------------------------
    app.get('/api/dt/thoi-khoa-bieu/tra-cuu', app.permission.check('dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            let allFreeRoom = await app.model.dmPhong.getAll({ coSo: req.query.maCoSo }, 'ten, sucChua, toaNha', 'ten asc');
            if (!allFreeRoom || !allFreeRoom.length) res.send({ items: [] });
            const { thu, fromTime, namHoc, hocKy, loaiHinh } = req.query;
            let roomCondition = {
                statement: 'thu= :thu AND ngayBatDau <= :currTime AND ngayKetThuc >= :currTime AND (:namHoc IS NULL OR namHoc = :namHoc) AND (:hocKy IS NULL OR hocKy = :hocKy) AND (:loaiHinh IS NULL OR loaiHinhDaoTao = :loaiHinh)',
                parameter: { thu, currTime: fromTime || Date.now(), namHoc, hocKy, loaiHinh }
            };
            let [busyRoom, caHoc] = await Promise.all([
                app.model.dtThoiKhoaBieu.getAll(roomCondition, 'maMonHoc, nhom, hocKy, phong, ngayBatDau,tietBatDau,soTietBuoi, ngayKetThuc,loaiHinhDaoTao, khoaSinhVien, maHocPhan'),
                app.model.dmCaHoc.getAll({ maCoSo: req.query.maCoSo, kichHoat: 1 }, 'ten')
            ]);
            let monHoc = await app.model.dmMonHoc.getAll({
                statement: 'ma IN (:listMaMonHoc)',
                parameter: {
                    listMaMonHoc: [...new Set(busyRoom.map(item => item.maMonHoc))]
                }
            }, 'ma,ten');
            let listCaHoc = caHoc.map(item => parseInt(item.ten));
            listCaHoc.sort(function (a, b) { return a - b; });
            allFreeRoom = allFreeRoom.map(item => ({ ...item, available: [...listCaHoc] }));
            if (busyRoom) {
                for (const tkb of busyRoom) {
                    let phong = allFreeRoom.find(item => item.ten == tkb.phong);
                    if (phong) {
                        phong[tkb.tietBatDau] = { ...tkb, tenMonHoc: app.utils.parse(monHoc.find(item => item.ma == tkb.maMonHoc).ten, { vi: '' }).vi };
                        for (let i = tkb.tietBatDau; i < (tkb.tietBatDau + tkb.soTietBuoi); i++) {
                            let index = phong.available.indexOf(i);
                            if (index != -1) {
                                phong.available.splice(index, 1);
                            }
                        }

                    }
                }
            }
            res.send({ items: allFreeRoom });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }

    });

    app.get('/api/dt/thoi-khoa-bieu/tra-cuu-phong-trong', app.permission.check('dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            let { filter } = req.query;
            const DATE_UNIX = 24 * 60 * 60 * 1000;
            let statement = '', parameter = {}, dataPhong = [];
            let { coSo, thu, tietBatDau, soTietBuoi, ngayBatDau, ngayKetThuc, phong } = filter;
            ngayBatDau = parseInt(ngayBatDau);
            ngayKetThuc = parseInt(ngayKetThuc);

            if (phong) {
                dataPhong = await app.model.dmPhong.getAll({ coSo, kichHoat: 1, ten: phong }, 'ten, sucChua', 'ten');
            } else {
                dataPhong = await app.model.dmPhong.getAll({ coSo, kichHoat: 1 }, 'ten, sucChua', 'ten');
            }

            statement += '(:ngayBatDau BETWEEN ngayBatDau AND ngayKetThuc OR :ngayKetThuc BETWEEN ngayBatDau AND ngayKetThuc) AND coSo = :coSo';
            parameter.ngayBatDau = ngayBatDau;
            parameter.ngayKetThuc = ngayKetThuc;
            parameter.coSo = coSo;

            if (thu) {
                statement += ' AND thu = :thu ';
                parameter.thu = thu;
            }

            if (tietBatDau && soTietBuoi) {
                statement += ' AND (tietBatDau IS NOT NULL) AND (soTietBuoi IS NOT NULL) AND (NOT (((tietBatDau + soTietBuoi - 1) < :tietBatDau) OR (tietBatDau > (:tietBatDau + :soTietBuoi - 1))))';
                parameter.tietBatDau = parseInt(tietBatDau);
                parameter.soTietBuoi = parseInt(soTietBuoi);
            }

            if (phong) {
                statement += ' AND phong = :phong';
                parameter.phong = phong;
            }

            let tkbHienTai = await app.model.dtThoiKhoaBieu.getAll({ statement, parameter }, 'phong, sucChua, thu, ngayBatDau, ngayKetThuc, maHocPhan, tietBatDau, soTietBuoi', 'ngayBatDau, thu');

            let dataRet = [], caHoc = [];
            if (phong) {
                if (tietBatDau && soTietBuoi) {
                    tietBatDau = parseInt(tietBatDau);
                    let tietKetThuc = tietBatDau + parseInt(soTietBuoi) - 1;
                    for (let tiet = tietBatDau; tiet <= tietKetThuc; tiet++) {
                        caHoc.push(tiet);
                    }
                } else {
                    caHoc = await app.model.dmCaHoc.getAll({ maCoSo: coSo, kichHoat: 1 }, 'ten');
                    caHoc = caHoc.map(item => parseInt(item.ten)).sort(function (a, b) { return a - b; });
                }

                let i = ngayBatDau;
                while (i <= ngayKetThuc) {
                    let thuCheck = new Date(i).getDay() + 1;
                    if (thuCheck == 1) thuCheck = 8;
                    if (!thu || (thu && (thu == thuCheck))) {
                        let tkbTrung = tkbHienTai.filter(tkb => parseInt(tkb.ngayBatDau) <= i && parseInt(tkb.thu) == thuCheck);
                        let dataTietHienTai = [];
                        for (let hocPhan of tkbTrung) {
                            let { tietBatDau, soTietBuoi } = hocPhan;
                            for (let i = 1; i <= soTietBuoi; i++) {
                                dataTietHienTai.push(tietBatDau);
                                tietBatDau++;
                            }
                        }
                        dataRet.push({
                            ngay: i,
                            thu: thuCheck,
                            dataTietHienTai: [...new Set(dataTietHienTai)],
                        });
                    }

                    i += DATE_UNIX;
                }

            } else {
                for (let ngay = ngayBatDau; ngay <= ngayKetThuc; ngay += DATE_UNIX) {
                    let thuCheck = new Date(ngay).getDay() + 1;
                    if (thuCheck == 1) thuCheck = 8;
                    if (!thu || (thu && (thu == thuCheck))) {
                        if (!dataRet.some(item => item.thu == thuCheck)) {
                            dataRet.push({ thu: thuCheck });
                        }
                    }
                }
                dataRet = dataRet.sort((a, b) => a.thu - b.thu);

                dataRet = dataRet.map(item => {
                    let tkbTrung = tkbHienTai.filter(tkb => parseInt(tkb.thu) == item.thu);
                    tkbTrung = tkbTrung.map(item => item.phong);

                    return {
                        ...item,
                        listPhong: dataPhong.filter(item => !tkbTrung.includes(item.ten)),
                        listFull: dataPhong.filter(item => !tkbTrung.includes(item.ten)),
                    };
                });
            }

            res.send({ dataRet, caHoc, tkbHienTai });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu/tra-cuu-thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const DATE_UNIX = 24 * 60 * 60 * 1000;
            let { filter } = req.query;
            let { rows: dataTKBFull, datathi: dataThi } = await app.model.dtThoiKhoaBieu.searchSchedule(app.utils.stringify(filter));
            let dataTKB = [], dataThu = [];
            let { ngayBatDau, ngayKetThuc } = filter;
            ngayBatDau = parseInt(ngayBatDau);
            ngayKetThuc = parseInt(ngayKetThuc);
            for (let ngay = ngayBatDau; ngay <= ngayKetThuc; ngay += DATE_UNIX) {
                let thuCheck = new Date(ngay).getDay() + 1;
                if (thuCheck == 1) thuCheck = 8;
                dataThu.push(thuCheck);
            }
            dataThu = [...new Set(dataThu)];
            dataTKB = dataTKBFull.filter(i => dataThu.includes(i.thu) && !i.isNghi);

            res.send({ dataTKB, dataThi });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    //Upload hook
    app.uploadHooks.add('ImportTKBData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtThoiKhoaBieuImportData(req, fields, files, params, done), done, 'dtThoiKhoaBieu:write')
    );

    const dtThoiKhoaBieuImportData = async (req, fields, files, params, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportTKBData' && files.ImportTKBData && files.ImportTKBData.length) {
            let { namHoc, hocKy, loaiHinhDaoTao, coSo } = app.utils.parse(params.filter);
            if (!(namHoc && hocKy && loaiHinhDaoTao && coSo)) {
                done({ error: 'Vui lòng điền đầy đủ dữ liệu trên bộ lọc!' });
            } else {
                const srcPath = files.ImportTKBData[0].path;
                let workbook = app.excel.create();
                workbook = await app.excel.readFile(srcPath);
                if (workbook) {
                    app.fs.deleteFile(srcPath);
                    worksheet = workbook.getWorksheet(1);
                    if (worksheet) {
                        let index = 2;
                        let items = [], createItem = [], updateItem = [], falseItem = [];

                        let [listNgayLe, tietHoc] = await Promise.all([
                            app.model.dmNgayLe.getAll({
                                statement: 'ngay >= :startDateOfYear',
                                parameter: {
                                    startDateOfYear: new Date(parseInt(namHoc), 0, 1).setHours(0, 0, 0, 0),
                                }
                            }),
                            app.model.dmCaHoc.getAll({ maCoSo: coSo }, '*')
                        ]);

                        try {
                            done({ items });
                            const getVal = (column) => {
                                let val = worksheet.getCell(column + index).text.trim();
                                return val == null ? '' : val;
                            };
                            const nextLoop = (index, createItem, updateItem, falseItem) => {
                                index % 10 == 0 && app.io.to('ImportTKBData').emit('import-tkb-single-done', { requester: req.session.user.email, createItem, updateItem, falseItem, index });
                                return index + 1;
                            };
                            while (true) {
                                if (!worksheet.getCell('A' + index).text) {
                                    break;
                                } else {
                                    const data = {
                                        maHocPhan: getVal('A') + 'L' + (getVal('B') ? ('0' + getVal('B')).slice(-2) : '01'),
                                        nhom: getVal('B') ? ('0' + getVal('B')).slice(-2) : '01',
                                        tenMonHoc: getVal('C'),
                                        maMonHoc: getVal('A').substring(4),
                                        thu: getVal('E'),
                                        tietBatDau: getVal('F'),
                                        soTietBuoi: getVal('G'),
                                        phong: getVal('D').trim(),
                                        lop: getVal('I').replaceAll(/ - nhom ./g, ''),
                                        soLuongDuKien: getVal('H'),
                                        startDate: getVal('J'), //date
                                        endDate: getVal('K'), //date
                                        maCanBoGV: getVal('L'),
                                        canBoGV: getVal('M').replaceAll('  ', ' '),
                                        maCanBoTG: getVal('N'),
                                        canBoTG: getVal('O').replaceAll('  ', ' '),
                                        isCheck: true,
                                        khoaDangKy: getVal('P'),
                                        row: index,
                                    };
                                    data.soTietBuoi = data.soTietBuoi ? parseInt(data.soTietBuoi) : '';
                                    data.tietBatDau = data.tietBatDau ? parseInt(data.tietBatDau) : '';
                                    data.thu = data.thu ? parseInt(data.thu) : '';

                                    if (data.startDate) {
                                        let date = data.startDate;
                                        data.ngayBatDau = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).getTime();
                                        if (isNaN(data.ngayBatDau)) data.ngayBatDau = '';
                                    }
                                    if (data.endDate) {
                                        let date = data.endDate;
                                        data.ngayKetThuc = new Date(date.substring(6, 11), Number(date.substring(3, 5)) - 1, date.substring(0, 2)).setHours(0, 0, 0, 0);
                                        if (isNaN(data.ngayKetThuc)) data.ngayKetThuc = '';
                                    }

                                    if (falseItem.map(i => i.maHocPhan).includes(data.maHocPhan)) {
                                        falseItem.push({ ...data, ghiChu: 'Buổi khác của học phần này bị lỗi' });
                                        index = nextLoop(index, createItem, updateItem, falseItem);
                                        continue;
                                    }
                                    let subject = await app.model.dmMonHoc.get({ ma: data.maMonHoc }, 'ma,khoa,tietLt,tietTh');
                                    if (subject) {
                                        data.khoaDangKy = data.khoaDangKy || subject.khoa;
                                        data.soTietLyThuyet = subject.tietLt;
                                        data.soTietThucHanh = subject.tietTh;
                                        data.tongTiet = parseInt(subject.tietLt) + parseInt(subject.tietTh);

                                        if (data.phong) {
                                            let room = await app.model.dmPhong.get({ ten: data.phong }, 'sucChua');
                                            if (!room) {
                                                falseItem.push({ ...data, ghiChu: `Phòng ${data.phong} không tồn tại` });
                                                index = nextLoop(index, createItem, updateItem, falseItem);
                                                continue;
                                            }
                                        }
                                        let tietBatDau = tietHoc.find(i => parseInt(i.ten) == parseInt(data.tietBatDau));
                                        let tietKetThuc = tietHoc.find(i => parseInt(i.ten) == (parseInt(data.tietBatDau) + parseInt(data.soTietBuoi) - 1));
                                        if (data.tietBatDau && !tietBatDau) {
                                            falseItem.push({ ...data, ghiChu: 'Tiết bắt đầu không tồn tại' });
                                            index = nextLoop(index, createItem, updateItem, falseItem);
                                            continue;
                                        }
                                        if (data.tietBatDau && data.soTietBuoi && !tietKetThuc) {
                                            falseItem.push({ ...data, ghiChu: 'Tiết kết thúc không tồn tại' });
                                            index = nextLoop(index, createItem, updateItem, falseItem);
                                            continue;
                                        }
                                        if (data.thu) {
                                            let thu = await app.model.dtDmThu.get({ ma: data.thu });
                                            if (!thu) {
                                                falseItem.push({ ...data, ghiChu: 'Thứ không tồn tại' });
                                                index = nextLoop(index, createItem, updateItem, falseItem);
                                                continue;
                                            }
                                        }

                                        if (data.lop) {
                                            const listLop = data.lop.split(', ');
                                            let isExist = true, nonLop = [];
                                            for (const maLop of listLop) {
                                                let lop = await app.model.dtLop.get({ maLop });
                                                if (!lop) {
                                                    isExist = false;
                                                    nonLop.push(maLop);
                                                }
                                            }
                                            if (!isExist) {
                                                falseItem.push({ ...data, ghiChu: `Lớp ${nonLop.join(', ')} không tồn tại` });
                                                index = nextLoop(index, createItem, updateItem, falseItem);
                                                continue;
                                            }
                                            let lopSV = await app.model.dtLop.get({ maLop: listLop[0] });
                                            data.khoaSinhVien = lopSV.khoaSinhVien;
                                        } else {
                                            falseItem.push({ ...data, ghiChu: 'Học phần không có lớp' });
                                            index = nextLoop(index, createItem, updateItem, falseItem);
                                            continue;
                                        }

                                        if (data.maCanBoGV) {
                                            const listGiangVien = data.maCanBoGV.split(', ');
                                            let isGV = true;
                                            for (let gv of listGiangVien) {
                                                if (gv) {
                                                    const giangVien = await app.model.tchcCanBo.get({ shcc: gv }, 'shcc');
                                                    if (!giangVien) {
                                                        const canBoNgoaiTruong = await app.model.dtCanBoNgoaiTruong.get({ shcc: gv });
                                                        if (!canBoNgoaiTruong) {
                                                            falseItem.push({ ...data, ghiChu: `Mã giảng viên ${gv} không tồn tại` });
                                                            isGV = false;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            if (!isGV) {
                                                index = nextLoop(index, createItem, updateItem, falseItem);
                                                continue;
                                            }
                                        }
                                        if (data.maCanBoTG) {
                                            const listTroGiang = data.maCanBoTG.split(', ');
                                            let isTG = true;
                                            for (let tg of listTroGiang) {
                                                if (tg) {
                                                    const giangVien = await app.model.tchcCanBo.get({ shcc: tg }, 'shcc');
                                                    if (!giangVien) {
                                                        const canBoNgoaiTruong = await app.model.dtCanBoNgoaiTruong.get({ shcc: tg });
                                                        if (!canBoNgoaiTruong) {
                                                            falseItem.push({ ...data, ghiChu: `Mã trợ giảng ${tg} không tồn tại` });
                                                            isTG = false;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            if (!isTG) {
                                                index = nextLoop(index, createItem, updateItem, falseItem);
                                                continue;
                                            }
                                        }

                                        let exist = await app.model.dtThoiKhoaBieu.get({ maHocPhan: data.maHocPhan, namHoc, hocKy });
                                        if (exist) {
                                            updateItem.push({ ...data });
                                        } else {
                                            createItem.push({ ...data });
                                        }
                                    } else {
                                        falseItem.push({ ...data, ghiChu: `Môn học ${data.maMonHoc} không tồn tại` });
                                    }
                                    index = nextLoop(index, createItem, updateItem, falseItem);
                                }
                            }

                            let errListMa = falseItem.map(i => i.maHocPhan);
                            let errItem = [...createItem, ...updateItem].filter(item => errListMa.includes(item.maHocPhan));
                            errItem = errItem.map(i => ({ ...i, ghiChu: 'Buổi khác của học phần này bị lỗi' }));
                            falseItem.push(...errItem);
                            falseItem.sort((a, b) => a.row - b.row);

                            createItem = createItem.filter(item => !errListMa.includes(item.maHocPhan));
                            updateItem = updateItem.filter(item => !errListMa.includes(item.maHocPhan));

                            let checkUpdate = await checkUpdateItem({ updateItem });
                            let checkCreate = await checkCreateItem({ createItem, listNgayLe, tietHoc });

                            falseItem.push(...checkCreate, ...checkUpdate);
                            falseItem.sort((a, b) => a.row - b.row);

                            let listFalse = falseItem.map(i => i.maHocPhan);
                            createItem = createItem.filter(item => !listFalse.includes(item.maHocPhan));
                            updateItem = updateItem.filter(item => !listFalse.includes(item.maHocPhan));

                            app.io.to('ImportTKBData').emit('import-tkb-all-done', { requester: req.session.user.email, createItem, updateItem, falseItem, index });
                        } catch (error) {
                            console.error(error);
                            done({ error });
                        }

                    } else {
                        done({ error: 'No worksheet!' });
                    }
                } else done({ error: 'No workbook!' });
            }
        }
    };

    app.post('/api/dt/thoi-khoa-bieu/import-new-data', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            const { filter, datas } = req.body,
                userModified = req.session.user.email, lastModified = Date.now();

            let nam = new Date().getFullYear();
            let [listNgayLe, dataTiet] = await Promise.all([
                app.model.dmNgayLe.getAll({
                    statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear and kichHoat = 1',
                    parameter: {
                        startDateOfYear: new Date(nam - 1, 0, 1).setHours(0, 0, 0, 0),
                        endDateOfYear: new Date(nam + 1, 11, 31).setHours(23, 59, 59, 999)
                    }
                }),
                app.model.dmCaHoc.getAll({ maCoSo: filter.coSo }, '*')
            ]);
            let dataGroup = datas.groupBy('maHocPhan');
            for (let i = 0; i < Object.keys(dataGroup).length; i++) {
                let maHocPhan = Object.keys(dataGroup)[i];
                i % 10 == 0 && app.io.to('SaveImportTKBData').emit('save-import-tkb-single-done', { requester: req.session.user.email, maHocPhan });

                let fullData = dataGroup[maHocPhan];
                fullData = fullData.map((item, index) => {
                    let { tongTiet, ngayBatDau, thu, tietBatDau, soTietBuoi, ngayKetThuc } = item;
                    return {
                        ...item, ...filter, tongTiet: parseInt(tongTiet), ngayBatDau: ngayBatDau ? parseInt(ngayBatDau) : '',
                        thu: thu ? parseInt(thu) : '', tietBatDau: tietBatDau ? parseInt(tietBatDau) : '', soTietBuoi: soTietBuoi ? parseInt(soTietBuoi) : '',
                        isMo: 1, tinhTrang: 2, bacDaoTao: 'DH', buoi: (index + 1), soBuoiTuan: fullData.length, ngayKetThuc: ngayKetThuc ? parseInt(ngayKetThuc) : '',
                    };
                });

                let dataCreated = [];
                for (let item of fullData) {
                    let data = await app.model.dtThoiKhoaBieu.create({ ...item, userModified, lastModified });
                    dataCreated.push({ ...item, ...data });
                }


                let dataToCreate = [];
                if (dataCreated.every(item => item.thu && item.ngayBatDau && item.tietBatDau && item.soTietBuoi)) {
                    dataCreated.sort((a, b) => parseInt(a.ngayBatDau) - parseInt(b.ngayBatDau));
                    dataCreated = dataCreated.map(i => {
                        let thoiGianBatDau = dataTiet.find(item => item.ten == i.tietBatDau).thoiGianBatDau;
                        let thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(i.tietBatDau) + parseInt(i.soTietBuoi) - 1).thoiGianKetThuc;
                        return { ...i, thoiGianBatDau, thoiGianKetThuc };
                    });
                    dataToCreate = await app.model.dtThoiKhoaBieu.customGenerateSchedule({
                        fullData: dataCreated, listNgayLe, dataTiet, dataTeacher: []
                    });
                }

                for (let data of dataCreated) {
                    let { thu, soTietBuoi, tietBatDau, phong } = data,
                        listGV = data.maCanBoGV.split(', ').map(i => ({ shcc: i, type: 'GV' })),
                        listTG = data.maCanBoTG.split(', ').map(i => ({ shcc: i, type: 'TG' }));

                    if (data.lop) {
                        const listLop = data.lop.split(', ');
                        for (const maLop of listLop) {
                            await app.model.dtThoiKhoaBieuNganh.create({
                                idThoiKhoaBieu: data.id,
                                idNganh: maLop
                            });
                        }
                    }

                    const listDataTuan = dataToCreate.filter(i => i.thu == thu && i.tietBatDau == tietBatDau && i.soTietBuoi == soTietBuoi && i.phong == phong);
                    if (listDataTuan.length) {
                        for (let tuan of listDataTuan) {
                            let { id } = tuan;
                            delete tuan.id;
                            const tuanCreated = await app.model.dtThoiKhoaBieuCustom.create({ ...tuan, isNgayLe: tuan.isNgayLe ? 1 : '', idThoiKhoaBieu: id, thoiGianBatDau: tuan.ngayBatDau, thoiGianKetThuc: tuan.ngayKetThuc, modifier: req.session.user.email, timeModified: Date.now(), ghiChu: '' });
                            if (!tuan.isNgayLe) {
                                for (let gv of [...listGV, ...listTG]) {
                                    gv.shcc && await app.model.dtThoiKhoaBieuGiangVien.create({
                                        idThoiKhoaBieu: data.id, idTuan: tuanCreated.idTuan,
                                        type: gv.type, giangVien: gv.shcc,
                                        ngayBatDau: tuan.ngayBatDau,
                                        ngayKetThuc: tuan.ngayKetThuc,
                                    });
                                }
                            }
                        }
                    } else {
                        for (let gv of [...listGV, ...listTG]) {
                            gv.shcc && await app.model.dtThoiKhoaBieuGiangVien.create({
                                idThoiKhoaBieu: data.id,
                                type: gv.type,
                                giangVien: gv.shcc,
                                ngayBatDau: '',
                                ngayKetThuc: '',
                            });
                        }
                    }
                }

                dataToCreate = dataToCreate.filter(i => !i.isNgayLe);
                let ngayBatDau = dataToCreate.length ? (new Date(dataToCreate[0].ngayBatDau).setHours(0, 0, 0, 0)) : '';

                await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { ngayKetThuc: dataToCreate.length ? (new Date(dataToCreate.slice(-1)[0].ngayKetThuc).setHours(0, 0, 0, 0)) : '', ngayBatDau: ngayBatDau || dataCreated[0].ngayBatDau || '' });
                app.dkhpRedis.initInfoHocPhan(maHocPhan);
                app.dkhpRedis.initSiSoHocPhan(maHocPhan);
                app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc: dataCreated[0].namHoc, hocKy: dataCreated[0].hocKy });
            }
            app.io.to('SaveImportTKBData').emit('save-import-tkb-all-done', { requester: req.session.user.email });
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/dt/thoi-khoa-bieu/import-update-data', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { filter, datas } = req.body, userModified = req.session.user.email, lastModified = Date.now();
            let nam = new Date().getFullYear();
            let listNgayLe = await app.model.dmNgayLe.getAll({
                statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear',
                parameter: {
                    startDateOfYear: new Date(nam - 1, 0, 1).setHours(0, 0, 0, 0),
                    endDateOfYear: new Date(nam + 1, 11, 31).setHours(23, 59, 59, 999)
                }
            });
            let dataGroup = datas.groupBy('maHocPhan');
            for (let i = 0; i < Object.keys(dataGroup).length; i++) {
                let maHocPhan = Object.keys(dataGroup)[i];
                i % 10 == 0 && app.io.to('SaveImportTKBData').emit('save-import-tkb-single-done', { requester: req.session.user.email, maHocPhan });

                let { rows: dataHocPhan, datacahoc: dataTiet } = await app.model.dtThoiKhoaBieu.getData(maHocPhan);
                let fullData = dataGroup[maHocPhan];

                if (fullData.length > dataHocPhan.length) {
                    for (let hocPhan of fullData.slice(dataHocPhan.length)) {
                        await app.model.dtThoiKhoaBieu.create({
                            ...hocPhan, ...filter, isMo: 1, tinhTrang: 2, bacDaoTao: 'DH',
                            khoaDangKy: dataHocPhan[0].khoaDangKy,
                            soTietLyThuyet: dataHocPhan[0].tietLyThuyet,
                            soTietThucHanh: dataHocPhan[0].tietThucHanh,
                            tongTiet: dataHocPhan[0].tongTiet,
                        });
                    }
                    dataHocPhan = (await app.model.dtThoiKhoaBieu.getData(maHocPhan)).rows;
                }

                if (fullData.length == dataHocPhan.length) {
                    dataHocPhan = dataHocPhan.map((hocPhan, index) => {
                        let { phong, thu, soTietBuoi, tietBatDau, ngayBatDau, ngayKetThuc, lop, maCanBoGV, maCanBoTG, soLuongDuKien, khoaDangKy = '', khoaSinhVien } = fullData[index];
                        return {
                            ...hocPhan, phong, ngayBatDau: ngayBatDau ? parseInt(ngayBatDau) : '', thu: thu ? parseInt(thu) : '',
                            tietBatDau: tietBatDau ? parseInt(tietBatDau) : '', soTietBuoi: soTietBuoi ? parseInt(soTietBuoi) : '',
                            lop, maCanBoGV, maCanBoTG, soLuongDuKien, ngayKetThuc: ngayKetThuc ? parseInt(ngayKetThuc) : '', khoaDangKy, khoaSinhVien
                        };
                    });

                    let dataTuan = [];
                    if (dataHocPhan.every(item => item.thu && item.ngayBatDau && item.tietBatDau && item.soTietBuoi)) {
                        dataHocPhan.sort((a, b) => parseInt(a.ngayBatDau) - parseInt(b.ngayBatDau));

                        dataHocPhan = dataHocPhan.map(i => {
                            let thoiGianBatDau = dataTiet.find(item => item.ten == i.tietBatDau).thoiGianBatDau;
                            let thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(i.tietBatDau) + parseInt(i.soTietBuoi) - 1).thoiGianKetThuc;
                            return { ...i, thoiGianBatDau, thoiGianKetThuc };
                        });
                        dataTuan = await app.model.dtThoiKhoaBieu.customGenerateSchedule({
                            fullData: dataHocPhan, listNgayLe, dataTiet, dataTeacher: []
                        });
                    }

                    let ngayKetThuc = dataTuan.length ? (new Date(dataTuan.slice(-1)[0].ngayKetThuc).setHours(0, 0, 0, 0)) : '';
                    let ngayBatDau = dataTuan.length ? (new Date(dataTuan[0].ngayBatDau).setHours(0, 0, 0, 0)) : '';

                    await app.model.dtThoiKhoaBieuCustom.delete({ maHocPhan });

                    let index = 1;
                    for (let hocPhan of dataHocPhan) {
                        await app.model.dtThoiKhoaBieuNganh.delete({ idThoiKhoaBieu: hocPhan.id });
                        await app.model.dtThoiKhoaBieuGiangVien.delete({ idThoiKhoaBieu: hocPhan.id });

                        let listGV = hocPhan.maCanBoGV.split(', ').map(i => ({ shcc: i, type: 'GV' })),
                            listTG = hocPhan.maCanBoTG.split(', ').map(i => ({ shcc: i, type: 'TG' }));

                        if (hocPhan.lop) {
                            const listLop = hocPhan.lop.split(', ');
                            for (const maLop of listLop) {
                                await app.model.dtThoiKhoaBieuNganh.create({
                                    idThoiKhoaBieu: hocPhan.id,
                                    idNganh: maLop
                                });
                            }
                        }

                        const listTuanByTkb = dataTuan.filter(i => i.id == hocPhan.id);
                        if (listTuanByTkb.length) {
                            for (let tuan of listTuanByTkb) {
                                let { id } = tuan;
                                delete tuan.id;
                                const tuanCreated = await app.model.dtThoiKhoaBieuCustom.create({ ...tuan, isNgayLe: tuan.isNgayLe ? 1 : '', idThoiKhoaBieu: id, thoiGianBatDau: tuan.ngayBatDau, thoiGianKetThuc: tuan.ngayKetThuc, modifier: req.session.user.email, timeModified: Date.now(), ghiChu: '' });

                                if (!tuan.isNgayLe) {
                                    for (let gv of [...listGV, ...listTG]) {
                                        gv.shcc && await app.model.dtThoiKhoaBieuGiangVien.create({
                                            idThoiKhoaBieu: hocPhan.id, idTuan: tuanCreated.id,
                                            type: gv.type, giangVien: gv.shcc,
                                            ngayBatDau: tuan.ngayBatDau,
                                            ngayKetThuc: tuan.ngayKetThuc,
                                        });
                                    }
                                }
                            }
                        } else {
                            for (let gv of [...listGV, ...listTG]) {
                                gv.shcc && await app.model.dtThoiKhoaBieuGiangVien.create({
                                    idThoiKhoaBieu: hocPhan.id,
                                    type: gv.type,
                                    giangVien: gv.shcc,
                                    ngayBatDau: '',
                                    ngayKetThuc: '',
                                });
                            }
                        }

                        let id = hocPhan.id;
                        delete hocPhan.id;
                        await app.model.dtThoiKhoaBieu.update({ id }, { ...hocPhan, userModified, lastModified, ngayKetThuc, ngayBatDau: ngayBatDau || hocPhan.ngayBatDau || '', buoi: index, soBuoiTuan: dataHocPhan.length });
                        index++;
                    }

                    app.dkhpRedis.initInfoHocPhan(maHocPhan);
                    app.dkhpRedis.initSiSoHocPhan(maHocPhan);
                    app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc: fullData[0].namHoc, hocKy: fullData[0].hocKy });
                }
            }
            app.io.to('SaveImportTKBData').emit('save-import-tkb-all-done', { requester: req.session.user.email });

            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const checkUpdateItem = async ({ updateItem }) => {
        let data = [...updateItem];
        let dataGroup = data.groupBy('maHocPhan'), dataMiss = [], dataTrungTKB = [], dataTrungGV = [];
        for (let i = 0; i < Object.keys(dataGroup).length; i++) {
            let maHocPhan = Object.keys(dataGroup)[i];
            let fullData = dataGroup[maHocPhan];
            let { rows: dataHocPhan, datacahoc: dataTiet, datangayLe } = await app.model.dtThoiKhoaBieu.getData(maHocPhan);

            if (fullData.length < dataHocPhan.length) {
                dataMiss.push(...fullData.map(i => ({ ...i, ghiChu: 'Học phần cập nhật có số buổi nhỏ hơn số buổi hiện có' })));
                continue;
            }

            let { isTrungTKB, isTrungGV, ghiChu } = await app.model.dtThoiKhoaBieuCustom.checkTrungLich(fullData, datangayLe, dataTiet);
            if (isTrungTKB) {
                dataTrungTKB.push(...fullData.map(i => ({ ...i, ghiChu, isTrungTKB, isUpdate: 1 })));
            } else if (isTrungGV || ghiChu) {
                dataTrungGV.push(...fullData.map(i => ({ ...i, ghiChu })));
            }
        }
        return [...dataMiss, ...dataTrungGV, ...dataTrungTKB];
    };

    const checkCreateItem = async ({ createItem, listNgayLe, tietHoc: dataTiet }) => {
        let data = [...createItem];
        let dataGroup = data.groupBy('maHocPhan'), dataTrungTKB = [], dataTrungGV = [];

        for (let i = 0; i < Object.keys(dataGroup).length; i++) {
            let maHocPhan = Object.keys(dataGroup)[i];

            let fullData = dataGroup[maHocPhan];
            let { isTrungTKB, isTrungGV, ghiChu } = await app.model.dtThoiKhoaBieuCustom.checkTrungLich(fullData, listNgayLe, dataTiet);
            if (isTrungTKB) {
                dataTrungTKB.push(...fullData.map(i => ({ ...i, ghiChu, isTrungTKB, isCreate: 1 })));
            } else if (isTrungGV || ghiChu) {
                dataTrungGV.push(...fullData.map(i => ({ ...i, ghiChu })));
            }
        }
        return [...dataTrungGV, ...dataTrungTKB];
    };

    app.put('/api/dt/thoi-khoa-bieu/tinh-trang-khoa', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            const { maHocPhan, isOnlyKhoa } = req.body;
            await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { isOnlyKhoa });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};