module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7546: { title: 'Lớp học viên', icon: 'fa-archive', backgroundColor: '#3A8891', groupIndex: 3, link: '/user/sau-dai-hoc/lop-hoc-vien' },
        },
    };

    app.permission.add(
        { name: 'sdhLopHocVien:read', menu },
        { name: 'sdhLopHocVien:write' },
        { name: 'sdhLopHocVien:delete' },
    );

    app.get('/user/sau-dai-hoc/lop-hoc-vien', app.permission.check('sdhLopHocVien:read'), app.templates.admin);
    app.get('/user/sau-dai-hoc/lop/item', app.permission.check('sdhLopHocVien:read'), app.templates.admin);
    app.get('/user/sau-dai-hoc/lop/detail/:maLop', app.permission.check('sdhLopHocVien:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/lop-hoc-vien/page/:pageNumber/:pageSize', app.permission.check('sdhLopHocVien:read'), async (req, res) => {
        try {
            let filter = app.utils.stringify(req.query.filter);
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : null;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, dssv: dsSv } = await app.model.sdhLopHocVien.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list, dsSv } });

        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/lop-hoc-vien/common-page/:pageNumber/:pageSize', app.permission.check('sdhLopHocVien:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : null;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.sdhLopHocVien.commonPage(_pageNumber, _pageSize, searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/lop-hoc-vien/common-page/:pageNumber/:pageSize', app.permission.check('sdhLopHocVien:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : null;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.sdhLopHocVien.commonPage(_pageNumber, _pageSize, searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/lop-hoc-vien/multiple', app.permission.check('sdhLopHocVien:write'), async (req, res) => {
        try {
            let { data, idInfoPhanHe } = req.body;
            const user = req.session.user.email, now = Date.now();
            for (const datatem of data) {
                let filter = {
                    maKhoa: datatem.maKhoa,
                    maNganh: datatem.maNganh,
                    heDaoTao: datatem.heDaoTao,
                    khoaSinhVien: datatem.khoaSinhVien,
                    idKhoaDaoTao: datatem.idKhoaDaoTao
                };
                const dotTrungTuyen = await app.model.sdhTsInfoPhanHe.get({ id: idInfoPhanHe }, 'idDot');
                const khungDaoTao = await app.model.sdhLopHocVien.checkMaKhung(app.utils.stringify(filter));
                if (khungDaoTao && khungDaoTao.rows.length > 0) {
                    await app.model.sdhLopHocVien.create({ ...datatem, maCtdt: khungDaoTao.rows[0].maCtdt, ma: datatem.maLop, khoa: datatem.maKhoa, nganh: datatem.maNganh, heDaoTao: datatem.heDaoTao, namBatDau: datatem.namHocBatDau, ten: datatem.tenLop, kichHoat: parseInt(datatem.kichHoat), khungDaoTao: khungDaoTao.rows[0].khungDaoTao, nienKhoa: datatem.nienKhoa, idKhoaDaoTao: datatem.idKhoaDaoTao });
                } else {
                    const maCtdt = `N${datatem.maNganh || ''}K${datatem.maKhoa || ''}H${datatem.heDaoTao || ''}K${datatem.khoaSinhVien || ''}D${datatem.dotThiTuyen || ''}`;
                    await app.model.sdhKhungDaoTao.create({ ...filter, maCtdt: maCtdt, maKhoa: filter.maKhoa, bacDaoTao: filter.heDaoTao, khoaHocVien: filter.khoaSinhVien, dotTrungTuyen: dotTrungTuyen.idDot, userModified: user, lastModified: now });
                    await app.model.sdhLopHocVien.create({ ...datatem, maCtdt: maCtdt, ma: datatem.maLop, khoa: datatem.maKhoa, nganh: datatem.maNganh, heDaoTao: datatem.heDaoTao, namBatDau: datatem.namHocBatDau, ten: datatem.tenLop, kichHoat: parseInt(datatem.kichHoat), khungDaoTao: '', nienKhoa: datatem.nienKhoa, idKhoaDaoTao: datatem.idKhoaDaoTao });
                }
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/lop-hoc-vien/get-multiple', app.permission.check('sdhLopHocVien:write'), async (req, res) => {
        try {
            let { listNganh, config } = req.body,
                { heDaoTao, khoaSinhVien, idKhoaDaoTao } = config;
            let dataCreate = [];
            if (listNganh) {
                for (const nganh of listNganh) {
                    const check = await app.model.sdhLopHocVien.get({ nganh: nganh.maNganh, idKhoaDaoTao: idKhoaDaoTao, heDaoTao: heDaoTao, khoaSinhVien });
                    let ctdt = await app.model.sdhKhungDaoTao.get({
                        statement: 'maNganh = :maNganh AND bacDaoTao =: heDaoTao',
                        parameter: {
                            maNganh: nganh.maNganh, heDaoTao
                        }
                    });

                    if (ctdt) {
                        let { maCtdt, thoiGianDaoTao } = ctdt;
                        nganh.maCtdt = maCtdt;
                        nganh.nienKhoa = `${khoaSinhVien} - ${parseInt(khoaSinhVien) + Math.round(thoiGianDaoTao)}`;
                    }
                    else {
                        nganh.maCtdt = '';
                        nganh.nienKhoa = `${khoaSinhVien} - ${parseInt(khoaSinhVien) + Math.round(4)}`;

                    }
                    nganh.loaiLop = 'N';
                    nganh.heDaoTao = heDaoTao;
                    nganh.khoaSinhVien = khoaSinhVien;
                    nganh.idKhoaDaoTao = idKhoaDaoTao;
                    nganh.kichHoat = 1;

                    if (!check) {
                        nganh.isExist = false;

                    } else {
                        nganh.isExist = true;
                    }
                    dataCreate.push(nganh);
                }

            }
            res.send({ dataCreate });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/sdh/lop-hoc-vien/item/danh-sach/:maLop', app.permission.orCheck('sdhLopHocVien:write'), async (req, res) => {
        try {
            let item = await app.model.sdhLopHocVien.get({ ma: req.params.maLop });
            item.dsSinhVien = await app.model.fwSinhVienSdh.getAll({ lop: req.params.maLop }, 'mssv, ho, ten, tinhTrang');
            item.dsTuDong = await app.model.fwSinhVienSdh.getAll({
                statement: 'maNganh = :maNganh AND namTuyenSinh = :namTuyenSinh AND bacDaoTao = :bacDaoTao AND lop is null and tinhTrang not in (:listTinhTrang)',
                parameter: {
                    maNganh: item.nganh,
                    namTuyenSinh: item.khoaSinhVien,
                    bacDaoTao: item.heDaoTao,
                    listTinhTrang: [3, 4, 6, 7]
                    //buoc thoi hoc: 3, thoi hoc: 4, tot nghiep: 6, chuyen truong: 7
                }
            }, 'mssv, ho, ten, tinhTrang');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/lop-hoc-vien', app.permission.check('sdhLopHocVien:write'), async (req, res) => {
        try {
            const item = await app.model.sdhLopHocVien.create(req.body.item);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/lop-hoc-vien', app.permission.check('sdhLopHocVien:write'), async (req, res) => {
        try {
            const item = await app.model.sdhLopHocVien.update({ ma: req.body.ma }, req.body.changes);
            if (req.body.changes.kichHoat == 0) {
                await app.model.fwSinhVienSdh.update({ lop: req.body.ma }, { lop: '' });
            }
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/sdh/lop-hoc-vien', app.permission.check('sdhLopHocVien:delete'), async (req, res) => {
        try {
            await app.model.sdhLopHocVien.delete({ ma: req.body.maLop });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/lop-hoc-vien/get-ctdt', app.permission.check('sdhLopHocVien:write'), async (req, res) => {
        try {
            let filter = app.utils.stringify(req.query.filter);
            let items = await app.model.sdhChuongTrinhDaoTao.getByFilter(filter);
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/lop-hoc-vien/get-danh-sach-nganh', app.permission.check('sdhLopHocVien:write'), async (req, res) => {
        try {
            let idKhoaDaoTao = req.query._id;
            let items = await app.model.sdhLopHocVien.filterDanhSachNganh(idKhoaDaoTao);
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/lop-hoc-vien/detail/:_id', app.permission.check('sdhLopHocVien:write'), async (req, res) => {
        try {
            let ma = req.params._id;
            let items = await app.model.sdhLopHocVien.get({ ma });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    // app.delete('/api/sdh/lop-hoc-vien', app.permission.check('sdhLopHocVien:delete'), (req, res) => {
    //     app.model.sdhLopHocVien.delete({ ma: req.body._id }, error => res.send({ error }));
    // });

    app.put('/api/sdh/lop-hoc-vien/item/danh-sach', app.permission.orCheck('sdhLopHocVien:write'), async (req, res) => {
        try {
            const { maLop, changes } = req.body;
            await Promise.all[
                changes.dsSinhVien && changes.dsSinhVien.map(sv => app.model.fwSinhVienSdh.update({ mssv: sv.mssv }, { lop: maLop })),
                // changes.dsSinhVien && changes.dsSinhVien.map(sv => app.model.fwSinhVienSdh.initCtdtRedis(sv.mssv)),
                changes.dsTuDong && changes.dsTuDong.map(sv => app.model.fwSinhVienSdh.update({ mssv: sv.mssv }, { lop: null }))
            ];
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.uploadHooks.add('sdhLopImportSinhVien', (req, fields, files, params, done) =>
        app.permission.has(req, () => sdhLopImportSinhVienSdh(req, fields, files, params, done), done, 'sdhLopHocVien:write'));


    const sdhLopImportSinhVienSdh = async (req, fields, files, params, done) => {
        if (files.sdhLopImportSinhVienSdh && files.sdhLopImportSinhVienSdh.length && files.sdhLopImportSinhVienSdh[0].path) {
            const srcPath = files.sdhLopImportSinhVienSdh && files.sdhLopImportSinhVienSdh[0].path;
            const workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                const worksheet = workbook.worksheets[0];
                if (worksheet) {
                    const items = [];
                    const failed = [];
                    const visited = {};
                    const { maLop } = params;
                    const dataLop = await app.model.sdhLopHocVien.get({ ma: maLop });
                    const dsSinhVien = await app.model.fwSinhVienSdh.getAll(
                        {
                            statement: '(maNganh = :maNganh AND bacDaoTao = :loaiHinhDaoTao AND lop is null) OR lop = :maLop ',
                            parameter: { maLop, maNganh: dataLop.nganh, loaiHinhDaoTao: dataLop.heDaoTao }
                        }
                        , 'mssv, ho, ten, tinhTrang, lop');
                    worksheet.eachRow((row, rowNumber) => {
                        try {
                            if (rowNumber == 1) return; //Skip header row
                            const [, mssv] = row.values;
                            const sinhVien = dsSinhVien.find(sv => sv.mssv == mssv);
                            if (visited[mssv]) {
                                throw { rowNumber, color: 'danger', message: `MSSV ${mssv} bị lặp trong danh sách` };
                            } else if (sinhVien == undefined) {
                                throw { rowNumber, color: 'danger', message: `MSSV ${mssv} không phù hợp với lớp ${maLop} hoặc không tồn tại` };
                            } else if (sinhVien.lop == maLop) {
                                throw { rowNumber, color: 'danger', message: `MSSV ${mssv} đã là thành viên của lớp ${maLop}` };
                            } else {
                                visited[mssv] = true;
                            }
                            items.push({
                                ...sinhVien
                            });
                        } catch (error) {
                            error.rowNumber || console.error(error);
                            failed.push(error);
                        }
                    });
                    done({ items, failed });
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else {
                done({ error: 'No workbook!' });
            }
        }
    };
    app.get('/api/sdh/lop-hoc-vien/template', app.permission.check('sdhLopHocVien:write'), (req, res) => {
        try {
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('MAIN');
            ws.columns = [
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ', key: 'ho', width: 30 },
                { header: 'TÊN', key: 'ten', width: 15 },
            ];
            app.excel.attachment(workBook, res, 'DS_LOP_DSSV_Template.xlsx');
        } catch (error) {
            res.send({ error });
        }
    });
};