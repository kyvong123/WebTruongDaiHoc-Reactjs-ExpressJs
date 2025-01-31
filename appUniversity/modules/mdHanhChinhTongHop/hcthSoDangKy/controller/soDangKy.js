module.exports = app => {
    const moment = require('moment');
    const hcthMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            507: { title: 'Quản lý số văn bản', link: '/user/hcth/so-dang-ky', icon: 'fa-sign-in', backgroundColor: '#b52b79' }
        }
    };
    const menu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            407: { title: 'Quản lý số văn bản', link: '/user/so-dang-ky', icon: 'fa-sign-in', backgroundColor: '#b52b79' }
        }
    };

    const editPermission = 'donViCongVanDi:edit',
        soVanBanPermission = 'hcthSoVanBan:write';

    app.permission.add({ name: soVanBanPermission, menu: hcthMenu });
    app.permission.add({ name: 'hcthSoVanBan:write', menu });
    app.permission.add('hcthSoVanBan:delete');
    app.permission.add({ name: 'donViCongVanDi:edit', menu });

    app.get('/user/so-dang-ky', app.permission.orCheck(editPermission, soVanBanPermission), app.templates.admin);
    app.get('/user/hcth/so-dang-ky', app.permission.check(soVanBanPermission), app.templates.admin);
    app.permissionHooks.add('staff', 'addRolesHcthSoDangKy', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '29') {
            app.permissionHooks.pushUserPermission(user, 'hcthSoVanBan:write', 'hcthSoVanBan:delete',);
            resolve();
        } else resolve();
    }));


    const getDonViQuanLy = (req) => req.session?.user?.staff?.donViQuanLy?.map(item => item.maDonVi) || [];
    const getDonVi = (req) => req.session?.user?.staff?.maDonVi;
    const getCurrentPermissions = (req) => (req.session && req.session.user && req.session.user.permissions) || [];

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/so-dang-ky/search/page/:pageNumber/:pageSize', app.permission.orCheck(editPermission, soVanBanPermission, 'staff:login'), async (req, res) => {
        try {
            const pageNumber1 = parseInt(req.params.pageNumber),
                pageSize1 = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
                permissions = req.session.user.permissions;

            let { tab, donViGui, capVanBan, loaiVanBan, maCongVan, isSelector, donViGuiSelector, maLoaiVanBan, quySo } = req.query.filter ? req.query.filter : {},
                tabValue = parseInt(tab);

            let soVanBanPermission = Number(permissions.includes('hcthSoVanBan:write'));

            const userDepartments = new Set(getDonViQuanLy(req));
            if (getDonVi(req))
                userDepartments.add(getDonVi(req));
            const filterData = { maQuySo: quySo, userDepartments: [...userDepartments].toString(), donViGui, capVanBan, loaiVanBan, maCongVan, isSelector, donViGuiSelector, soVanBanPermission, maLoaiVanBan };

            const page = await app.model.hcthSoDangKy.searchPage(pageNumber1, pageSize1, tabValue, app.utils.stringify(filterData), searchTerm);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;

            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });

        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/so-dang-ky/export', app.permission.check('hcthCongVanDi:manage'), async (req, res) => {
        try {
            const { donVi, startAt, endAt, namHanhChinh } = req.query;
            const { rows: data } = await app.model.hcthSoDangKy.export(app.utils.stringify({ donVi: donVi?.toString() || '', startAt: Number(startAt), endAt: Number(endAt), namHanhChinh: namHanhChinh?.toString() || '' }));
            const dictData = {};
            data.forEach(item => {
                if (!dictData[item.maDonVi]) {
                    dictData[item.maDonVi] = {
                        tenDonVi: item.tenDonVi,
                        items: [item]
                    };
                } else {
                    dictData[item.maDonVi].items.push(item);
                }
            });
            const wb = app.excel.create();
            Object.values(dictData).forEach(donVi => {
                const ws = wb.addWorksheet(donVi.tenDonVi);
                let columns = [
                    { header: 'STT', key: 'stt', width: 10 },
                    { header: 'Số văn bản', key: '', width: 30 },
                    { header: 'Ngày lấy số', key: 'nganh', width: 0 },
                    { header: 'Ngày gửi', key: 'nganh', width: 0 },
                    { header: 'Ngày ký', width: 0 },
                    { header: 'Loại văn bản', width: 0 },
                    { header: 'Trích yếu', width: 50 },
                    { header: 'Cán bộ lấy số', width: 30 },
                    { header: 'Năm hành chính', width: 0 },

                ];
                ws.columns = columns;
                ws.getRow(1).alignment = {
                    ...ws.getRow(1).alignment,
                    vertical: 'middle',
                    horizontal: 'center',
                };
                let cells = [];
                donVi.items.forEach((item, index) => {
                    cells.push({ cell: 'A' + (index + 3), border: '1234', value: index + 1, font: { size: 12 } });
                    cells.push({ cell: 'B' + (index + 3), border: '1234', value: item.soVanBan, font: { size: 12 } });
                    cells.push({ cell: 'C' + (index + 3), border: '1234', value: item.ngayLaySo ? moment(new Date(item.ngayLaySo)).format('DD/MM/YYYY') : '', font: { size: 12 } });
                    cells.push({ cell: 'D' + (index + 3), border: '1234', value: item.ngayGui ? moment(new Date(item.ngayGui)).format('DD/MM/YYYY') : '', font: { size: 12 } });
                    cells.push({ cell: 'E' + (index + 3), border: '1234', value: item.ngayKy ? moment(new Date(item.ngayKy)).format('DD/MM/YYYY') : '', font: { size: 12 } });
                    cells.push({ cell: 'F' + (index + 3), border: '1234', value: item.tenLoaiVanBan, font: { size: 12 } });
                    cells.push({ cell: 'G' + (index + 3), border: '1234', value: item.trichYeu || '', font: { size: 12 } });
                    cells.push({ cell: 'H' + (index + 3), border: '1234', value: item.tenCanBo || '', font: { size: 12 } });
                    cells.push({ cell: 'J' + (index + 3), border: '1234', value: item.namHanhChinh, font: { size: 12 } });
                });
                app.excel.write(ws, cells);
            });
            app.excel.attachment(wb, res, 'DuLieuSoVanBan.xlsx');

        } catch (error) {
            console.error(error);
            res.status(404).send({ error });
        }
    });

    app.get('/api/hcth/so-dang-ky/:id', app.permission.orCheck(editPermission, soVanBanPermission, 'staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw { status: 400, message: 'Invalid id' };
            }
            const soDangKy = await app.model.hcthSoDangKy.get({ id });
            res.send({ item: soDangKy });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/so-dang-ky/tu-dong', app.permission.orCheck(editPermission, soVanBanPermission), async (req, res) => {
        try {
            const data = req.body.data,
                permissions = getCurrentPermissions(req);
            if (!(permissions.includes(editPermission) || permissions.includes(soVanBanPermission))) throw 'Bạn không có quyền để tạo số';
            let { capVanBan, loaiVanBan, donViGui, tuDong, nguoiTao, soLuiNgay = 0, ngayLui = null } = data;
            soLuiNgay = Number(soLuiNgay);
            let administrativeYear = await app.model.hcthSetting.get({ key: 'administrativeYear' });
            nguoiTao = req.session.user.shcc;
            if (loaiVanBan) {
                if (!parseInt(loaiVanBan)) {
                    const loaiVanBanItem = await app.model.dmLoaiVanBan.get({ ma: loaiVanBan });
                    if (!loaiVanBanItem) throw 'loại văn bản không hợp lệ';
                    loaiVanBan = loaiVanBanItem.id;
                }
            }
            if (!administrativeYear) throw 'Không tồn tại năm hành chính';
            const nam = parseInt(administrativeYear.value);

            const ngayTao = new Date().getTime();
            let result;
            try {
                if (soLuiNgay) {
                    result = await app.model.hcthSoDangKy.createSoLui(donViGui, capVanBan, loaiVanBan, nam, tuDong, ngayTao, nguoiTao, null, ngayLui);
                } else {
                    result = await app.model.hcthSoDangKy.createSoVanBanMain(donViGui, capVanBan, loaiVanBan, nam, tuDong, ngayTao, nguoiTao, null);
                }
                if (!result.outBinds?.ret) throw new Error();
            } catch {
                throw { message: 'Số văn bản không hợp lệ' };
            }
            const soVanBanItem = await app.model.hcthSoDangKy.get({ soCongVan: result.outBinds?.ret, capVanBan: capVanBan });
            if (!soVanBanItem) throw 'Tạo số văn bản gặp lỗi';
            res.send({ item: soVanBanItem });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/so-dang-ky/nhap-tay', app.permission.orCheck(editPermission, soVanBanPermission), async (req, res) => {
        try {
            const data = req.body.data,
                permissions = getCurrentPermissions(req);
            if (!(permissions.includes(editPermission) || permissions.includes(soVanBanPermission))) throw 'Bạn không có quyền để tạo số';
            let { soDangKy, capVanBan, donViGui, tuDong, nguoiTao, loaiVanBan } = data;
            let administrativeYear = await app.model.hcthSetting.get({ key: 'administrativeYear' });
            if (!administrativeYear) throw 'Không tồn tại năm hành chính';
            // const nam = parseInt(administrativeYear.value);
            const phanCapQuySo = await app.model.hcthPhanCapQuySo.get({ capVanBan, maDonVi: donViGui });
            const quySo = await app.model.hcthQuySo.get({ ma: phanCapQuySo.quySo });
            try {
                await app.model.hcthSoDangKy.validateSoCongVan(soDangKy, capVanBan, Number(donViGui), quySo.namHanhChinh, phanCapQuySo.quySo);
            } catch {
                throw { message: 'Số văn bản không hợp lệ' };
            }
            const item = await app.model.hcthSoDangKy.create({
                soCongVan: soDangKy,
                capVanBan: capVanBan,
                donViGui: donViGui,
                ngayTao: new Date().getTime(),
                tuDong: tuDong,
                suDung: 0, nguoiTao,
                namHanhChinh: quySo.namHanhChinh,
                maQuySo: phanCapQuySo.quySo,
                loaiVanBan
            });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    // Phân quyền quản lý số văn bản trường trong phòng HCTH
    const soVanBan = 'hcthSoVanBan';

    app.assignRoleHooks.addRoles(soVanBan, { id: soVanBanPermission, text: 'Hành chính - Tổng hợp: Quản lý số văn bản' });

    app.assignRoleHooks.addHook(soVanBan, async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === soVanBan && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get(soVanBan).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleSoVanBan', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == soVanBan);
        inScopeRoles.forEach(role => {
            if (role.tenRole === soVanBanPermission) {
                app.permissionHooks.pushUserPermission(user, soVanBanPermission);
            }
        });
        resolve();
    }));

    app.delete('/api/hcth/so-dang-ky', app.permission.check('hcthSoVanBan:delete'), async (req, res) => {
        try {
            const id = req.body.id;
            if (id) {
                await app.model.hcthSoDangKy.delete({ id });
                await app.model.hcthYeuCauCapSo.delete({ soVanBan: id });
                await app.model.hcthCongVanDi.update({ soDangKy: id }, { soDangKy: null });
                res.send({});
            } else
                res.send({});
        } catch (error) {
            console.error(req.method, req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/so-dang-ky', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { soCongVan, loaiVanBan, id } = req.body;
            const permissions = getCurrentPermissions(req);
            const soDangKy = await app.model.hcthSoDangKy.get({ id });
            const donVi = getDonViQuanLy(req);
            if (getDonVi(req)) donVi.push(getDonVi(req));
            if ((donVi.includes(soDangKy.donViGui) && permissions.includes('donViCongVanDi:manage')) || soDangKy.nguoiTao == req.session.user.shcc || permissions.includes('hcthCongVanDi:manage')) {
                await app.model.hcthSoDangKy.update({ id }, { soCongVan, loaiVanBan });
            }
            else {
                throw 'Bạn không có quyền cập nhật';
            }
            res.send({});
        } catch (error) {
            console.error(req.method, req.originalUrl, req.error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/so-dang-ky/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            let { listDonVi = [], listLoaiVanBan = [], suDung, capVanBan = 'TRUONG' } = req.query.filter;
            if (!req.session.user.permissions?.includes('hcth:login')) {
                //check possible department
                const userDepartments = [req.session.user.staff.maDonVi, ...(req.session.user.staff?.listChucVu || []).map(i => i.maDonVi)];
                if (req.session.user.permissions?.includes('quanLyDaoTao:login')) {
                    userDepartments.push(33);
                }
                if (!listDonVi.length) {
                    listDonVi = userDepartments;
                } else {
                    listDonVi = listDonVi.intersect(userDepartments);
                }
            }
            const filter = { listDonVi: listDonVi.toString(), listLoaiVanBan: listLoaiVanBan.toString(), capVanBan, suDung: Number(suDung) };
            const page = await app.model.hcthSoDangKy.newSearchPage(Number(req.params.pageNumber), Number(req.params.pageSize), app.utils.stringify(filter), req.query.condition);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;

            const pageCondition = req.query.condition;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/so-dang-ky/item', app.permission.check(''), async (req, res) => {
        try {
            const { id, soVanBan, loaiVanBan } = req.body.data;
            const item = await app.model.hcthSoDangKy.update({ id }, { soCongVan: soVanBan, loaiVanBan: loaiVanBan });
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });



};
