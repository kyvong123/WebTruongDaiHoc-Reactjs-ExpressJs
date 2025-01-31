module.exports = app => {

    const MA_CTSV = '32';

    const menuCtsv = {
        parentMenu: app.parentMenu.students,
        menus: {
            6113: { title: 'Lớp sinh viên', icon: 'fa-archive', link: '/user/ctsv/lop', groupIndex: 2, backgroundColor: '#3A8891' }
        }
    };

    app.permission.add(
        { name: 'ctsvLop:read', menu: menuCtsv },
        'ctsvLop:write',
        'ctsvLop:delete'
    );

    app.permissionHooks.add('staff', 'addRoleCtsvLop', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == MA_CTSV) {
            app.permissionHooks.pushUserPermission(user, 'ctsvLop:read', 'ctsvLop:write');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/ctsv/lop', app.permission.check('ctsvLop:read'), app.templates.admin);
    app.get('/user/ctsv/lop/item', app.permission.check('ctsvLop:read'), app.templates.admin);
    app.get('/user/ctsv/lop/detail/:maLop', app.permission.check('ctsvLop:read'), app.templates.admin);


    // API --------------------------------------------------------------------
    app.get('/api/ctsv/lop-sinh-vien/common-page/:pageNumber/:pageSize', app.permission.orCheck('ctsvLop:read', 'tccbLop:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : null;
            let filter = req.query.filter || {};
            filter = app.utils.stringify(filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dtLop.commonPage(_pageNumber, _pageSize, filter, searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lop-sinh-vien/page/:pageNumber/:pageSize', app.permission.check('ctsvLop:read'), async (req, res) => {
        try {
            let filter = app.utils.stringify(req.query.filter);
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : null;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, dslopcon: dsLopCon } = await app.model.dtLop.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const result = list.map(lop => {
                return {
                    ...lop,
                    lopChuyenNganh: dsLopCon.filter(lopcon => lopcon.maLopCha == lop.ma)
                };
            });
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list: result, dsLopCon } });

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/lop-sinh-vien', app.permission.check('ctsvLop:write'), async (req, res) => {
        try {
            const newItem = req.body.ctsvLop;
            newItem.userCreator = req.session.user.email;
            newItem.createTime = Date.now();
            const item = await app.model.dtLop.get({ maLop: newItem.maLop }, '*');
            if (item) {
                res.send({ error: { exist: true, message: 'Đã tồn tại mã lớp này. Vui lòng chọn mã lớp khác' } });
            } else {
                const item = await app.model.dtLop.create(newItem);
                res.send({ item });
            }
        } catch (error) {
            res.send({ error });
        }

    });

    app.delete('/api/ctsv/lop-sinh-vien', app.permission.check('ctsvLop:delete'), async (req, res) => {
        try {
            await app.model.dtLop.delete({ maLop: req.body.maLop });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/lop-sinh-vien', app.permission.check('ctsvLop:write'), async (req, res) => {
        try {
            const item = await app.model.dtLop.update({ maLop: req.body.maLop }, req.body.changes);
            if (req.body.changes.kichHoat == 0) {
                await app.model.fwStudent.update({ lop: req.body.maLop }, { lop: null });
            }
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lop-sinh-vien/chuyen-nganh/:maNganh', app.permission.check('ctsvLop:read'), async (req, res) => {
        try {
            const items = await app.model.dtChuyenNganh.getAll({ maNganh: req.params.maNganh }, '*');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    // const crypto = require('crypto');
    // console.log(crypto.createHash('md5').update(`${'BIDV-XHNV'}|${'123456'}${'347002'}|${'12345'}`).digest('hex'));

    app.get('/api/ctsv/lop-sinh-vien/ctdt/item/:id', app.permission.check('ctsvLop:read'), async (req, res) => {
        try {
            const item = await app.model.dtKhungDaoTao.get({ maCtdt: req.params.id }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lop-sinh-vien/all', app.permission.check('ctsvLop:read'), async (req, res) => {
        try {
            let { filter } = req.query;
            let items = await app.model.dtLop.getAllData(app.utils.stringify(filter || {}));
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lop-sinh-vien/ctdt-all/:khoaSinhVien', app.permission.check('ctsvLop:read'), async (req, res) => {
        try {
            let searchTerm = req.query.searchTerm || '';
            const items = await app.model.dtKhungDaoTao.getAll({
                statement: '(lower(MA_NGANH) LIKE :searchTerm OR LOWER(TEN_NGANH) LIKE :searchTerm) AND KHOA_SINH_VIEN = :khoaSinhVien',
                parameter: {
                    searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
                    khoaSinhVien: req.params.khoaSinhVien
                }
            }, '*');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lop-sinh-vien/filter', app.permission.check('ctsvLop:read'), async (req, res) => {
        try {
            const { loaiHinhDaoTao, khoaSinhVien } = req.query.filter;
            let searchTerm = req.query.searchTerm || '';
            const param = {
                searchTerm: `%${searchTerm.toLowerCase().trim()}%`
            };
            loaiHinhDaoTao.length && (param.listHeDaoTao = loaiHinhDaoTao.split(','));
            khoaSinhVien.length && (param.listKhoaSinhVien = khoaSinhVien.split(','));
            const items = await app.model.dtLop.getAll({
                statement: `(lower(MA_LOP) LIKE :searchTerm OR LOWER(TEN_LOP) LIKE :searchTerm)${loaiHinhDaoTao.length ? ' AND heDaoTao IN (:listHeDaoTao)' : ''}${khoaSinhVien.length ? ' AND khoaSinhVien IN (:listKhoaSinhVien)' : ''}`,
                parameter: param
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lop-sinh-vien/advanced-filter', app.permission.check('ctsvLop:read'), async (req, res) => {
        try {
            const filter = req.query.filter || {};
            // let searchTerm = req.query.searchTerm || '';
            const items = await app.model.dtLop.getAllData(app.utils.stringify(filter)).then(ref => ref.rows);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/lop-sinh-vien/get-multiple', app.permission.check('ctsvLop:write'), async (req, res) => {
        try {
            let { listNganh, listChuyenNganh, config } = req.body,
                { heDaoTao, khoaSinhVien } = config;
            let dataCreate = [];
            if (listNganh) {
                for (const nganh of listNganh) {
                    let ctdt = await app.model.dtKhungDaoTao.get({
                        statement: 'chuyenNganh IS NULL AND maNganh = :maNganh AND khoaSinhVien = :khoaSinhVien AND loaiHinhDaoTao =: heDaoTao',
                        parameter: {
                            maNganh: nganh.maNganh, khoaSinhVien, heDaoTao
                        }
                    });
                    if (ctdt) {
                        let { maCtdt, thoiGianDaoTao } = ctdt;
                        nganh.maCtdt = maCtdt;
                        nganh.nienKhoa = `${khoaSinhVien} - ${parseInt(khoaSinhVien) + Math.round(thoiGianDaoTao)}`;
                    }
                    else nganh.maCtdt = '';
                    nganh.loaiLop = 'N';
                    nganh.heDaoTao = heDaoTao;
                    nganh.khoaSinhVien = khoaSinhVien;
                    dataCreate.push(nganh);
                }

            }
            if (listChuyenNganh) {
                for (const chuyenNganh of listChuyenNganh) {
                    let ctdt = await app.model.dtKhungDaoTao.get({
                        statement: 'chuyenNganh = :chuyenNganh AND maNganh = :maNganh AND khoaSinhVien = :khoaSinhVien AND loaiHinhDaoTao =: heDaoTao',
                        parameter: {
                            maNganh: chuyenNganh.maNganh, chuyenNganh: chuyenNganh.ma, khoaSinhVien, heDaoTao
                        }
                    });
                    if (ctdt) {
                        let { maCtdt, thoiGianDaoTao } = ctdt;
                        chuyenNganh.maCtdt = maCtdt;
                        chuyenNganh.nienKhoa = `${khoaSinhVien} - ${parseInt(khoaSinhVien) + Math.round(thoiGianDaoTao) - 1}`;
                    }
                    else chuyenNganh.maCtdt = '';
                    chuyenNganh.loaiLop = 'CN';
                    chuyenNganh.heDaoTao = heDaoTao;
                    chuyenNganh.khoaSinhVien = khoaSinhVien;
                    chuyenNganh.maChuyenNganh = chuyenNganh.ma;

                    if (listNganh.some(item => item.maNganh == chuyenNganh.maNganh)) {
                        chuyenNganh.maLopCha = listNganh.find(item => item.maNganh == chuyenNganh.maNganh).maLop;
                    } else {
                        let maLopCha = await app.model.dtLop.get({ khoaSinhVien, heDaoTao, maNganh: chuyenNganh.maNganh });
                        if (maLopCha) chuyenNganh.maLopCha = maLopCha.maLop;
                    }
                    dataCreate.push(chuyenNganh);
                }
            }


            res.send({ dataCreate });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/lop-sinh-vien/multiple', app.permission.check('ctsvLop:write'), async (req, res) => {
        try {
            let data = req.body.data;
            let listPromise = data.map(lop => {
                lop.userCreator = req.session.user.email;
                lop.createTime = Date.now();
                app.model.dtLop.create(lop);
            });
            await Promise.all(listPromise);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lop-sinh-vien/item/:maLop', app.permission.orCheck('ctsvLop:read', 'student:login', 'dtQuanLyHocPhan:manage'), async (req, res) => {
        try {
            let item = await app.model.dtLop.get({ maLop: req.params.maLop });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/lop-sinh-vien/item/danh-sach/:maLop', app.permission.orCheck('ctsvLop:read'), async (req, res) => {
        try {
            let item = await app.model.dtLop.get({ maLop: req.params.maLop });
            ({ dstudong: item.dsTuDong, rows: item.dsSinhVien } = await app.model.dtLop.getDssv(req.params.maLop));
            let { rows } = await app.model.svQuanLyLop.getAllBanCanSu(req.params.maLop);
            item.dsBanCanSu = rows;
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/ctsv/lop-sinh-vien/item/danh-sach', app.permission.orCheck('ctsvLop:write'), async (req, res) => {
        try {
            const { maLop, changes } = req.body;
            await Promise.all[
                changes.dsSinhVien && changes.dsSinhVien.map(sv => app.model.fwStudent.update({ mssv: sv.mssv }, { lop: maLop })),
                changes.dsSinhVien && changes.dsSinhVien.map(sv => app.model.fwStudent.initCtdtRedis(sv.mssv)),
                changes.dsTuDong && changes.dsTuDong.map(sv => app.model.fwStudent.update({ mssv: sv.mssv }, { lop: null }))
            ];
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-lop/all', app.permission.orCheck('ctsvLop:read'), async (req, res) => {
        try {
            const { maNganh } = req.query,
                items = await app.model.dtChuyenNganh.getAll({ maNganh, kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-lop', app.permission.check('ctsvLop:read'), async (req, res) => {
        try {
            const { ma } = req.query,
                item = await app.model.dtNganhDaoTao.get({ ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-lop/item/:ma', app.permission.orCheck('ctsvLop:read', 'student:login'), async (req, res) => {
        try {
            const item = await app.model.dtLop.get({ maLop: req.params.ma }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-lop/ctdt/:ctdt', app.permission.orCheck('ctsvLop:read', 'dtLop:read'), async (req, res) => {
        try {
            const items = await app.model.dtLop.getAll({ maCtdt: req.params.ctdt });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/danh-sach-lop/filter', app.permission.orCheck('ctsvLop:read', 'dtLop:read'), async (req, res) => {
        try {
            const { maNganh, khoaSinhVien, heDaoTao } = req.query.filter || {};
            const items = await app.model.dtLop.getAll({ maNganh, khoaSinhVien, heDaoTao });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.uploadHooks.add('ctsvDtLopImportSinhVien', (req, fields, files, params, done) =>
        app.permission.has(req, () => ctsvDtLopImportSinhVien(req, fields, files, params, done), done, 'ctsvLop:write'));

    const ctsvDtLopImportSinhVien = async (req, fields, files, params, done) => {
        if (files.ctsvDtLopImportSinhVien && files.ctsvDtLopImportSinhVien.length && files.ctsvDtLopImportSinhVien[0].path) {
            const srcPath = files.ctsvDtLopImportSinhVien[0].path;
            const workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                const worksheet = workbook.worksheets[0];
                if (worksheet) {
                    const items = [];
                    const failed = [];
                    const visited = {};
                    const { maLop } = params;
                    const dataLop = await app.model.dtLop.get({ maLop });
                    const dsSinhVien = await app.model.fwStudent.getAll(
                        {
                            statement: '(maNganh = :maNganh AND loaiHinhDaoTao = :loaiHinhDaoTao)',
                            parameter: { maNganh: dataLop.maNganh, loaiHinhDaoTao: dataLop.heDaoTao }
                        }
                        , 'mssv, ho, ten, tinhTrang, lop');

                    const dsTinhTrang = await app.model.dmTinhTrangSinhVien.getAll(),
                        mapTinhTrang = Object.assign({}, ...dsTinhTrang.map(tinhTrang => ({ [tinhTrang.ma]: tinhTrang.ten })));

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
                                ...sinhVien, tenTinhTrang: mapTinhTrang[sinhVien.tinhTrang]
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

    app.get('/api/ctsv/lop-sinh-vien/template', app.permission.check('ctsvLop:write'), (req, res) => {
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

    app.get('/api/ctsv/lop-sinh-vien/page/download-excel', app.permission.check('ctsvLop:read'), async (req, res) => {
        try {
            let filter = req.query.filter;
            const { rows: list, dslopcon: dsLopCon } = await app.model.dtLop.searchPage(1, 1000, filter, null);
            const result = list.map(lop => {
                return {
                    ...lop,
                    lopChuyenNganh: dsLopCon.filter(lopcon => lopcon.maLopCha == lop.ma)
                };
            });
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS_LOP');
            ws.columns = [
                { header: 'MÃ LỚP', key: 'ma', width: 30 },
                { header: 'TÊN LỚP', key: 'ten', width: 15 },
                { header: 'SĨ SỐ', key: 'siSo', width: 15 },
                { header: 'MÃ NGÀNH', key: 'maNganh', width: 15 },
                { header: 'TÊN NGÀNH', key: 'tenNganh', width: 15 },
                { header: 'MÃ CTDT', key: 'maCtdt', width: 15 },
                { header: 'KHÓA SINH VIÊN', key: 'khoaSinhVien', width: 15 },
                { header: 'NIÊN KHÓA', key: 'nienKhoa', width: 15 },
                { header: 'HỆ ĐÀO TẠO', key: 'heDaoTao', width: 15 },
            ];

            result.forEach((item) => {
                ws.addRow({
                    ma: item.ma,
                    ten: item.ten,
                    siSo: item.siSo,
                    maNganh: item.maNganh,
                    tenNganh: item.tenNganh,
                    maCtdt: item.maCtdt,
                    khoaSinhVien: item.khoaSinhVien,
                    nienKhoa: item.nienKhoa,
                    heDaoTao: item.heDaoTao
                }, 'i');
                if (item.lopChuyenNganh && item.lopChuyenNganh.length) {
                    item.lopChuyenNganh.forEach(lop => {
                        ws.addRow({
                            ma: lop.ma,
                            ten: lop.ten,
                            siSo: lop.siSo,
                            maNganh: lop.maNganh,
                            tenNganh: lop.tenNganh,
                            maCtdt: lop.maCtdt,
                            khoaSinhVien: lop.khoaSinhVien,
                            nienKhoa: lop.nienKhoa,
                            heDaoTao: lop.heDaoTao
                        }, 'i');
                    });
                }
            });

            app.excel.attachment(workBook, res, 'DS_LOP.xlsx');
        } catch (error) {
            res.send({ error });
        }
    });
};