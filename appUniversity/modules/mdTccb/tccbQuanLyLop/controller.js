module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.students,
        menus: {
            6175: { title: 'Quản lý lớp sinh viên', icon: 'fa-archive', link: '/user/tccb/lop', groupIndex: 2, backgroundColor: '#3A8891' }
        }
    };

    app.permission.add(
        { name: 'tccbLop:manage', menu },
    );

    app.assignRoleHooks.addRoles('tccbQuanLyLop',
        { id: 'tccbLop:manage', text: 'Công tác sinh viên: Quản lý lớp sinh viên theo đơn vị' }
    );

    app.assignRoleHooks.addHook('tccbQuanLyLop', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === 'tccbQuanLyLop' && userPermissions.includes('manager:login')) {
            const assignRolesList = app.assignRoleHooks.get('tccbQuanLyLop').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'addRoleTccbLop', (user) => new Promise(resolve => {
        if (['manager:login', 'deputy:login'].some(chucVu => (user.permissions.includes(chucVu))) && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'tccbLop:manage');
            resolve();
        } else {
            resolve();
        }
    }));

    app.permissionHooks.add('assignRole', 'checkRoleManageLop', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'tccbQuanLyLop');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'tccbLop:manage' && user.permissions.includes('faculty:login')) {
                app.permissionHooks.pushUserPermission(user, 'tccbLop:manage');
            }
        });
        resolve();
    }));


    app.get('/user/tccb/lop', app.permission.check('tccbLop:manage'), app.templates.admin);
    app.get('/user/tccb/lop/item', app.permission.check('tccbLop:manage'), app.templates.admin);
    app.get('/user/tccb/lop/detail/:maLop', app.permission.check('tccbLop:manage'), app.templates.admin);


    // API --------------------------------------------------------------------
    app.get('/api/tccb/lop-sinh-vien/common-page/:pageNumber/:pageSize', app.permission.check('tccbLop:manage'), async (req, res) => {
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

    app.get('/api/tccb/lop-sinh-vien/page/:pageNumber/:pageSize', app.permission.orCheck('tccbLop:manage', 'staff:drl-manage'), async (req, res) => {
        try {
            const maKhoa = req.session.user.maDonVi;
            let filter = req.query.filter;
            filter.maKhoa = maKhoa;
            filter = app.utils.stringify(filter);
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

    app.post('/api/tccb/lop-sinh-vien', app.permission.check('ctsvLop:write'), async (req, res) => {
        try {
            const newItem = req.body.ctsvLop;
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

    app.delete('/api/tccb/lop-sinh-vien', app.permission.check('ctsvLop:delete'), async (req, res) => {
        try {
            await app.model.dtLop.delete({ maLop: req.body.maLop });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/lop-sinh-vien', app.permission.check('ctsvLop:write'), async (req, res) => {
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

    app.get('/api/tccb/lop-sinh-vien/chuyen-nganh/:maNganh', app.permission.check('tccbLop:manage'), async (req, res) => {
        try {
            const items = await app.model.dtChuyenNganh.getAll({ maNganh: req.params.maNganh }, '*');
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    // const crypto = require('crypto');
    // console.log(crypto.createHash('md5').update(`${'BIDV-XHNV'}|${'123456'}${'347002'}|${'12345'}`).digest('hex'));

    app.get('/api/tccb/lop-sinh-vien/ctdt/item/:id', app.permission.check('tccbLop:manage'), async (req, res) => {
        try {
            const item = await app.model.dtKhungDaoTao.get({ maCtdt: req.params.id }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/lop-sinh-vien/all', app.permission.check('tccbLop:manage'), async (req, res) => {
        try {
            let { filter } = req.query;
            let items = await app.model.dtLop.getAllData(app.utils.stringify(filter || {}));
            res.send({ items: items.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/lop-sinh-vien/ctdt-all/:khoaSinhVien', app.permission.check('tccbLop:manage'), async (req, res) => {
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

    app.get('/api/tccb/lop-sinh-vien/filter', app.permission.orCheck('tccbLop:manage', 'staff:drl-manage'), async (req, res) => {
        try {
            const { loaiHinhDaoTao, khoaSinhVien } = req.query.filter;
            const maKhoa = req.session.user.maDonVi;
            const dsNganh = await app.model.dtNganhDaoTao.getAll({ khoa: maKhoa }, 'maNganh');
            let searchTerm = req.query.searchTerm || '';
            const param = {
                searchTerm: `%${searchTerm.toLowerCase().trim()}%`
            };
            loaiHinhDaoTao.length && (param.listHeDaoTao = loaiHinhDaoTao.split(','));
            khoaSinhVien.length && (param.listKhoaSinhVien = khoaSinhVien.split(','));
            dsNganh.length && (param.listMaNganh = dsNganh.map(nganh => nganh.maNganh));
            const items = await app.model.dtLop.getAll({
                statement: `(lower(MA_LOP) LIKE :searchTerm OR LOWER(TEN_LOP) LIKE :searchTerm)${loaiHinhDaoTao.length ? ' AND heDaoTao IN (:listHeDaoTao)' : ''}${khoaSinhVien.length ? ' AND khoaSinhVien IN (:listKhoaSinhVien)' : ''}${dsNganh.length ? '  AND maNganh IN (:listMaNganh)' : ''}`,
                parameter: param
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/lop-sinh-vien/get-multiple', app.permission.check('ctsvLop:write'), async (req, res) => {
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

    app.post('/api/tccb/lop-sinh-vien/multiple', app.permission.check('ctsvLop:write'), async (req, res) => {
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

    app.get('/api/tccb/lop-sinh-vien/item/:maLop', app.permission.orCheck('tccbLop:manage', 'student:login', 'staff:drl-manage'), async (req, res) => {
        try {
            let item = await app.model.dtLop.get({ maLop: req.params.maLop });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/lop-sinh-vien/item/danh-sach/:maLop', app.permission.orCheck('tccbLop:manage'), async (req, res) => {
        try {
            let item = await app.model.dtLop.get({ maLop: req.params.maLop });
            item.dsSinhVien = await app.model.fwStudent.getAll({ lop: req.params.maLop }, 'mssv, ho, ten, tinhTrang');
            item.dsTuDong = await app.model.fwStudent.getAll({
                statement: 'maNganh = :maNganh AND khoaSinhVien = :khoaSinhVien AND loaiHinhDaoTao = :loaiHinhDaoTao AND lop is null AND tinhTrang NOT IN (:listTinhTrang)',
                parameter: {
                    maNganh: item.maChuyenNganh ? item.maChuyenNganh : item.maNganh,
                    khoaSinhVien: item.khoaSinhVien,
                    loaiHinhDaoTao: item.heDaoTao,
                    listTinhTrang: [3, 4, 6, 7]
                    //buoc thoi hoc: 3, thoi hoc: 4, tot nghiep: 6, chuyen truong: 7
                }
                // maNganh: item.maNganh, namTuyenSinh: item.khoaSinhVien, loaiHinhDaoTao: item.heDaoTao, lop: null
            }, 'mssv, ho, ten, tinhTrang');
            let { rows } = await app.model.svQuanLyLop.getAllBanCanSu(req.params.maLop);
            item.dsBanCanSu = rows;
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-sach-lop/all', app.permission.orCheck('tccbLop:manage'), async (req, res) => {
        try {
            const { maNganh } = req.query,
                items = await app.model.dtChuyenNganh.getAll({ maNganh, kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-sach-lop', app.permission.check('tccbLop:manage'), async (req, res) => {
        try {
            const { ma } = req.query,
                item = await app.model.dtNganhDaoTao.get({ ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-sach-lop/item/:ma', app.permission.orCheck('tccbLop:manage', 'student:login'), async (req, res) => {
        try {
            const item = await app.model.dtLop.get({ maLop: req.params.ma }, '*');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-sach-lop/:ctdt', app.permission.check('tccbLop:manage'), async (req, res) => {
        try {
            const items = await app.model.dtLop.getAll({ maCtdt: req.params.ctdt });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    // QUAN LY CHUC VU ========================================================================
    app.post('/api/tccb/quan-ly-lop/ban-can-su', app.permission.check('tccbLop:manage'), async (req, res) => {
        try {
            const { changes } = req.body;
            let item = await app.model.svQuanLyLop.createBanCanSu(changes);
            // await app.dkhpRedis.createBanCanSuLop(changes);
            await app.dkhpRedis.syncWithDb(item.userId);
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/quan-ly-lop/ban-can-su', app.permission.check('tccbLop:manage'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            let item = await app.model.svQuanLyLop.update({ id }, changes);
            // await app.dkhpRedis.createBanCanSuLop(changes);
            await app.dkhpRedis.syncWithDb(item.userId);
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/tccb/quan-ly-lop/ban-can-su', app.permission.check('tccbLop:manage'), async (req, res) => {
        try {
            const { id, userId } = req.body;
            console.log(id);
            await app.model.svQuanLyLop.delete({ id });
            // await app.dkhpRedis.deleteBanCanSuLop({ userId, maLop, maChucVu });
            await app.dkhpRedis.syncWithDb(userId);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};