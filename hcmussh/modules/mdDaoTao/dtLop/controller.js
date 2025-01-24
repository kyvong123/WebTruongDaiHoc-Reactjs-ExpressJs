
module.exports = app => {

    const MA_DAOTAO = '33';

    const menuCtsv = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7031: { title: 'Quản lý lớp sinh viên', icon: 'fa-archive', link: '/user/dao-tao/lop', groupIndex: 1, backgroundColor: '#3A8891' }
        }
    };

    app.permission.add(
        { name: 'dtLop:read', menu: menuCtsv },
        'dtLop:write',
        'dtLop:delete'
    );

    app.permissionHooks.add('staff', 'addRoleDtLop', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == MA_DAOTAO) {
            app.permissionHooks.pushUserPermission(user, 'dtLop:read', 'dtLop:write');
            resolve();
        } else {
            resolve();
        }
    }));

    app.get('/user/dao-tao/lop', app.permission.check('dtLop:read'), app.templates.admin);
    app.get('/user/dao-tao/lop/item', app.permission.check('dtLop:read'), app.templates.admin);
    app.get('/user/dao-tao/lop/detail/:maLop', app.permission.check('dtLop:read'), app.templates.admin);


    // API --------------------------------------------------------------------
    app.get('/api/dt/lop-sinh-vien/common-page/:pageNumber/:pageSize', app.permission.check('dtLop:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : null,
                user = req.session.user;

            let filter = req.query.filter || {}, sort = filter.sort;

            const roles = await app.model.dtAssignRole.getAll({
                statement: 'shcc = :shcc AND role LIKE :role',
                parameter: { shcc: user.shcc, role: '%dtLop:manage%' }
            });

            if (roles.length && !user.permissions.includes('quanLyDaoTao:DaiHoc')) {
                filter.listKhoaSinhVienFilter = [...new Set(roles.flatMap(i => i.khoaSinhVien.split(',')))].toString();
                filter.listHeFilter = [...new Set(roles.flatMap(i => i.loaiHinhDaoTao.split(',')))].toString();
            }

            if (!Number(user.isPhongDaoTao)) {
                filter.donViFilter = user.maDonVi;
            }

            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.dtLop.commonPage(_pageNumber, _pageSize, filter, searchTerm);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lop-sinh-vien/page/:pageNumber/:pageSize', app.permission.check('dtLop:read'), async (req, res) => {
        try {
            let filter = app.utils.stringify(req.query.filter);
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : null;
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, dslopcon: dsLopCon, dssv: dsSv } = await app.model.dtLop.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            let result = list.map(lop => {
                return {
                    ...lop,
                    lopChuyenNganh: dsLopCon.filter(lopcon => lopcon.maLopCha == lop.ma)
                };
            });
            if (!list.length && dsLopCon) result = dsLopCon;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list: result, dsLopCon, dsSv } });

        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lop-sinh-vien/get-ctdt', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let filter = app.utils.stringify(req.query.filter);
            let items = await app.model.dtChuongTrinhDaoTao.getByFilter(filter);
            res.send({ items: items.rows });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/lop-sinh-vien', app.permission.check('dtLop:write'), async (req, res) => {
        try {
            const newItem = req.body.dtLop;
            newItem.userCreator = req.session.user.email;
            newItem.createTime = Date.now();
            const item = await app.model.dtLop.get({ maLop: newItem.maLop }, '*');
            if (item) {
                res.send({ error: { exist: true, message: 'Đã tồn tại mã lớp này. Vui lòng chọn mã lớp khác' } });
            } else {
                const item = await app.model.dtLop.create(newItem);
                res.send(item);
            }
        } catch (error) {
            res.send({ error });
        }

    });

    app.delete('/api/dt/lop-sinh-vien', app.permission.check('dtLop:delete'), async (req, res) => {
        try {
            await app.model.dtLop.delete({ maLop: req.body.maLop });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/lop-sinh-vien', app.permission.check('dtLop:write'), async (req, res) => {
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

    app.get('/api/dt/lop-sinh-vien/chuyen-nganh/:maNganh', app.permission.check('dtLop:read'), async (req, res) => {
        try {
            const items = await app.model.dtChuyenNganh.getAll({ maNganh: req.params.maNganh }, '*');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lop-sinh-vien/item/danh-sach/:maLop', app.permission.orCheck('dtLop:read'), async (req, res) => {
        try {
            let item = await app.model.dtLop.get({ maLop: req.params.maLop });
            item.dsSinhVien = await app.model.fwStudent.getAll({ lop: req.params.maLop }, 'mssv, ho, ten, tinhTrang');
            item.dsTuDong = await app.model.fwStudent.getAll({
                statement: 'maNganh = :maNganh AND namTuyenSinh = :namTuyenSinh AND loaiHinhDaoTao = :loaiHinhDaoTao AND lop is null AND tinhTrang NOT IN (:listTinhTrang)',
                parameter: {
                    maNganh: item.maChuyenNganh ? item.maChuyenNganh : item.maNganh,
                    namTuyenSinh: item.khoaSinhVien,
                    loaiHinhDaoTao: item.heDaoTao,
                    listTinhTrang: [3, 4, 6, 7]
                    //buoc thoi hoc: 3, thoi hoc: 4, tot nghiep: 6, chuyen truong: 7
                }
                // maNganh: item.maNganh, namTuyenSinh: item.khoaSinhVien, loaiHinhDaoTao: item.heDaoTao, lop: null
            }, 'mssv, ho, ten, tinhTrang');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/dt/lop-sinh-vien/item/danh-sach', app.permission.orCheck('dtLop:write'), async (req, res) => {
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

    // const crypto = require('crypto');
    // console.log(crypto.createHash('md5').update(`${'BIDV-XHNV'}|${'123456'}${'347002'}|${'12345'}`).digest('hex'));

    app.get('/api/dt/lop-sinh-vien/ctdt/item/:id', app.permission.check('dtLop:read'), async (req, res) => {
        try {
            const item = await app.model.dtKhungDaoTao.get({ maCtdt: req.params.id }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lop-sinh-vien/all', app.permission.orCheck('dtLop:read', 'tcHocPhiTheoMon:manage', 'staff:login'), async (req, res) => {
        try {
            let { filter, searchTerm } = req.query;
            let items = await app.model.dtLop.getAllData(app.utils.stringify({ ...filter, searchTerm }));
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lop-sinh-vien/filter', app.permission.orCheck('dtLop:read', 'staff:login'), async (req, res) => {
        try {
            let { filter, searchTerm } = req.query,
                { role, khoaSinhVien, heDaoTao, donVi } = filter;

            if (!(khoaSinhVien && heDaoTao && donVi)) {
                await app.model.dtAssignRole.getDataRole(role, req.session.user, filter);
            }

            let items = await app.model.dtLop.getAllData(app.utils.stringify({ ...filter, searchTerm }));

            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lop-sinh-vien/ctdt-all/:loaiHinhDt/:khoaSinhVien', app.permission.check('dtLop:read'), async (req, res) => {
        try {
            let searchTerm = req.query.searchTerm || '';
            const items = await app.model.dtKhungDaoTao.getAll({
                statement: '(lower(MA_NGANH) LIKE :searchTerm OR LOWER(TEN_NGANH) LIKE :searchTerm) AND KHOA_SINH_VIEN = :khoaSinhVien AND LOAI_HINH_DAO_TAO = :loaiHinhDt',
                parameter: {
                    searchTerm: `%${searchTerm.toLowerCase().trim()}%`,
                    khoaSinhVien: req.params.khoaSinhVien,
                    loaiHinhDt: req.params.loaiHinhDt
                }
            }, '*');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/lop-sinh-vien/get-multiple', app.permission.check('dtLop:write'), async (req, res) => {
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
            console.log(error);
            res.send({ error });
        }
    });

    app.post('/api/dt/lop-sinh-vien/multiple', app.permission.check('dtLop:write'), async (req, res) => {
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

    app.get('/api/dt/lop-sinh-vien/item/:maLop', app.permission.orCheck('dtLop:read', 'staff:login'), async (req, res) => {
        try {
            let item = await app.model.dtLop.get({ maLop: req.params.maLop });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.uploadHooks.add('dtLopImportSinhVien', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtLopImportSinhVien(req, fields, files, params, done), done, 'dtLop:write'));

    const dtLopImportSinhVien = async (req, fields, files, params, done) => {
        if (files.dtLopImportSinhVien && files.dtLopImportSinhVien.length && files.dtLopImportSinhVien[0].path) {
            const srcPath = files.dtLopImportSinhVien[0].path;
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

    app.get('/api/dt/lop-sinh-vien/template', app.permission.check('dtLop:write'), (req, res) => {
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

    app.get('/api/dt/lop/download-dssv-lop', app.permission.check('dtLop:read'), async (req, res) => {
        try {
            const { khoaSinhVien, heDaoTao, ma } = app.utils.parse(req.query.filter),
                listSv = await app.model.fwStudent.getAll({ lop: ma }, 'mssv, ho, ten, emailTruong', 'mssv');

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('ThoiKhoaBieu');

            let cells = [
                { cell: 'A1', value: `Mã lớp: ${ma}`, bold: true },
                { cell: 'C1', value: `Khóa sinh viên: ${khoaSinhVien}`, bold: true },
                { cell: 'E1', value: `Loại hình đào tạo: ${heDaoTao}`, bold: true },

                { cell: 'A3', value: 'STT', bold: true },
                { cell: 'B3', value: 'MSSV', bold: true },
                { cell: 'C3', value: 'Họ và tên', bold: true },
                { cell: 'D3', value: 'Email trường', bold: true },
            ];

            for (let [index, sv] of listSv.entries()) {
                cells.push({ cell: 'A' + (index + 4), border: '1234', number: index + 1 });
                cells.push({ cell: 'B' + (index + 4), border: '1234', value: sv.mssv });
                cells.push({ cell: 'C' + (index + 4), border: '1234', value: `${sv.ho} ${sv.ten}` });
                cells.push({ cell: 'D' + (index + 4), border: '1234', value: sv.emailTruong || '' });
            }
            app.excel.write(ws, cells);
            app.excel.attachment(workBook, res, `DSSV_LOP_${ma}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};