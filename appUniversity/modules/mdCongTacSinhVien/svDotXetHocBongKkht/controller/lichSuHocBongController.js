module.exports = app => {
    app.get('/api/ctsv/lich-su-hbkk/dssv/download-excel-all', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Students List');
            const { id } = req.query;
            const result = await app.model.svLichSuDssvDieuKienHbkk.downloadExcelRest(id);
            ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(result.rows[0] || {}).map(key => ({ header: key.toString(), key, width: 20 }))];
            result.rows.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });
            app.excel.attachment(workBook, res, 'STUDENT_HBKK.xlsx');
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/lich-su-hbkk/dssv', app.permission.check('ctsvDotXetHocBongKkht:write'), async (req, res) => {
        try {
            const user = req.session.user;
            const { idDieuKien, data } = req.body;
            const item = await app.model.svLichSuDssvDieuKienHbkk.create({
                staffModified: user.email,
                timeModified: new Date().getTime(),
                idDieuKien
            });
            await Promise.all([
                ...data.map(sv => {
                    app.model.svDssvHocBongKkht.create({
                        mssv: sv.mssv,
                        dtb: sv.diemTrungBinh,
                        drl: sv.diemRenLuyen,
                        tinChiDangKy: sv.tinChiDangKy,
                        tinhTrangXetHocBong: sv.loaiHocBong,
                        idLichSuDs: item.id,
                        soTienNhan: sv.tienHocBong
                    });
                })
            ]);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/lich-su-hbkk/phan-bo-con-lai', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { idLichSu } = req.body;
            const { rows: listDatHocBong } = await app.model.svHocBongNhom.getDsSinhVienDatDieuKien(idLichSu);
            if (listDatHocBong.length == 0) throw 'Không thể phân bổ học bổng được nữa!';
            await Promise.all(listDatHocBong.map(({ mssv, loaiHocBong, diemTrungBinh, diemRenLuyen, tinChiDangKy, tienHocBong }) => app.model.svDssvHocBongKkht.create({
                idLichSuDs: idLichSu,
                mssv: mssv,
                tinhTrangXetHocBong: loaiHocBong,
                dtb: diemTrungBinh,
                drl: diemRenLuyen,
                tinChiDangKy,
                soTienNhan: tienHocBong
            })));
            res.send({ soLuongSinhVien: listDatHocBong.length });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/lich-su-hbkk/dssv', app.permission.check('ctsvDotXetHocBongKkht:write'), async (req, res) => {
        try {
            const { id } = req.body;
            await Promise.all([
                app.model.svLichSuDssvDieuKienHbkk.delete({ id }),
                app.model.svDssvHocBongKkht.delete({ idLichSuDs: id })
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lich-su-hbkk/dssv/download-excel', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Students List');
            const { id } = req.query;
            const result = await app.model.svLichSuDssvDieuKienHbkk.downloadExcel(id);
            ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(result.rows[0] || {}).map(key => ({ header: key.toString(), key, width: 20 }))];
            result.rows.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });
            app.excel.attachment(workBook, res, 'STUDENT_HBKK.xlsx');
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });


    app.put('/api/ctsv/lich-su-hbkk', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const result = await app.model.svLichSuDssvDieuKienHbkk.update({ id }, { ...changes, staffModified: req.session.user.email, timeModified: new Date().getTime() });
            if ('kichHoat' in changes) {
                await app.model.svLichSuDssvDieuKienHbkk.update({
                    statement: 'idDieuKien = :idDieuKien AND id != :id',
                    parameter: {
                        id, idDieuKien: result.idDieuKien
                    }
                }, { kichHoat: 0 }).catch(e => console.error(req.method, req.url, e));
            }
            res.send({ item: result });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/lich-su-hbkk/forward', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { id, isForward, notify } = req.body;
            const result = await app.model.svLichSuDssvDieuKienHbkk.update({ id }, { kichHoat: isForward == 1 ? 2 : 1, staffModified: req.session.user.email, timeModified: new Date().getTime() });
            await app.model.svLichSuDssvDieuKienHbkk.update({
                statement: 'idDieuKien = :idDieuKien AND id != :id',
                parameter: {
                    id, idDieuKien: result.idDieuKien
                }
            }, { kichHoat: 0 }).catch(e => console.error(req.method, req.url, e));

            if (notify == 1) {
                const [cauHinhData, { emailHocBong }] = await Promise.all([
                    app.model.svDieuKienXetHocBong.get({ id: result.idDieuKien }),
                    app.model.tcSetting.getValue('emailHocBong'),
                ]);
                await app.notification.send({
                    toEmail: emailHocBong,
                    title: 'Đã có danh sách học bổng chính thức',
                    icon: 'fa-info',
                    iconColor: 'info',
                    subTitle: 'Vui lòng vào trang',
                    link: `/user/finance/hoc-bong/detail/${cauHinhData.idDot}?idCauHinh=${result.idDieuKien}`,
                });
            }
            res.send({ item: result });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });


    app.post('/api/ctsv/lich-su-hbkk/dssv/add-sinh-vien', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { data } = req.body;
            const item = await app.model.svDssvHocBongKkht.get({ idLichSuDs: data.idLichSuDanhSach, mssv: data.mssv });
            if (!item) {
                await app.model.svDssvHocBongKkht.create(data);
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });


    app.get('/api/ctsv/lich-su-hbkk/danh-sach-hoc-bong', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { idLichSu, filter } = req.query;
            const { rows: result } = await app.model.svLichSuDssvDieuKienHbkk.getDssv(idLichSu, app.utils.stringify(filter));
            // dsDatDieuKien = dsDatDieuKien.filter(item => !result.some(sv => sv.mssv == item.mssv));
            res.send({ items: result });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lich-su-hbkk/danh-sach-con-lai/page/:pageNumber/:pageSize', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { idLichSu, filter } = req.query;
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            const { pagenumber, pagesize, pagecondition, pagetotal, totalitem, rows: dsKhongNhan } = await app.model.svLichSuDssvDieuKienHbkk.searchPageRest(idLichSu, _pageNumber, _pageSize, app.utils.stringify(filter));

            res.send({ page: { pageNumber: pagenumber, pageSize: pagesize, pageCondition: pagecondition, pageTotal: pagetotal, totalItem: totalitem, list: dsKhongNhan } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lich-su-hbkk', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            const { id } = req.query;
            const { rows: result } = await app.model.svLichSuDssvDieuKienHbkk.searchAll(id);
            res.send({ items: result });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};