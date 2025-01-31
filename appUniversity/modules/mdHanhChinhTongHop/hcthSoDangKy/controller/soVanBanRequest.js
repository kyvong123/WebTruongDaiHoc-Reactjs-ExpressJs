module.exports = app => {
    app.permission.add('hcthYeuCauCapSo:read', 'hcthYeuCauCapSo:write', 'hcthYeuCauCapSo:delete');
    const hcthMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            508: { title: 'Yêu cầu cấp số văn bản', link: '/user/hcth/so-van-ban/request', icon: 'fa-tags', backgroundColor: '#b52b79' }
        }
    };

    app.permission.add({ name: 'hcthSoVanBan:write', menu: hcthMenu });
    const getDonViQuanLy = (req) => req.session?.user?.staff?.donViQuanLy?.map(item => item.maDonVi) || [];
    const getDonVi = (req) => req.session?.user?.staff?.maDonVi;
    const getShcc = (req) => req.session.user?.shcc;

    app.get('/user/so-van-ban/request', app.permission.orCheck('staff:login'), app.templates.admin);
    app.get('/user/hcth/so-van-ban/request', app.permission.check('hcthSoVanBan:write'), app.templates.admin);

    app.get('/api/hcth/so-van-ban/request/search/page/:pageNumber/:pageSize', app.permission.orCheck('donViCongVanDi:edit', 'hcthSoVanBan:write'), async (req, res) => {
        try {
            const filter = req.query.filter || {};
            const permissions = req.session.user.permissions;
            const userDepartments = getDonViQuanLy(req);
            if (getDonVi(req))
                userDepartments.push(getDonVi(req));
            filter.userDepartments = userDepartments.toString();
            filter.isAdmin = filter.isAdmin == null ? 0 : filter.isAdmin;
            if (filter.isAdmin == 1 && !permissions.includes('hcthSoVanBan:write')) {
                filter.isAdmin = 0;
            }
            const { rows: list, pagenumber, pagesize, totalitem, pagetotal } = await app.model.hcthYeuCauCapSo.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), app.utils.stringify(filter), req.query.condition);
            res.send({ page: { list, pageNumber: pagenumber, pageSize: pagesize, totalItem: totalitem, pageTotal: pagetotal } });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.post('/api/hcth/so-van-ban/request', app.permission.check('donViCongVanDi:edit'), async (req, res) => {
        try {
            const data = req.body;
            const userDepartments = getDonViQuanLy(req);
            if (getDonVi(req))
                userDepartments.push(getDonVi(req));
            if (!userDepartments.includes(data.donVi)) {
                throw 'Đơn vị không hợp lệ';
            }
            let item = await app.model.hcthYeuCauCapSo.create({ ...data, ngayTao: Date.now(), shcc: getShcc(req), trangThai: 'waiting' });
            const settings = await app.model.hcthSetting.getValue('duyetSoTuDong');
            if (settings.duyetSoTuDong) {
                let { loaiVanBan, donVi } = item;
                let administrativeYear = await app.model.hcthSetting.get({ key: 'administrativeYear' });
                if (!administrativeYear) throw 'Không tồn tại năm hành chính';
                const nam = parseInt(administrativeYear.value);

                const ngayTao = new Date().getTime();
                let result;
                try {
                    if (item.soLuiNgay) {
                        result = await app.model.hcthSoDangKy.createSoLui(donVi, 'TRUONG', loaiVanBan, nam, 1, ngayTao, getShcc(req), null, item.ngayLui);
                    } else {
                        result = await app.model.hcthSoDangKy.createSoVanBanMain(donVi, 'TRUONG', loaiVanBan, nam, 1, ngayTao, getShcc(req), null);
                    }
                    if (!result.outBinds?.ret) throw new Error();
                } catch (error) {
                    console.error(error);
                    throw { message: 'Số văn bản không hợp lệ' };
                }
                const soVanBanItem = await app.model.hcthSoDangKy.get({ ngayTao, soCongVan: result.outBinds?.ret });
                if (!soVanBanItem) throw 'Tạo số văn bản gặp lỗi';
                item = await app.model.hcthYeuCauCapSo.update({ id: item.id }, { soVanBan: soVanBanItem.id, trangThai: 'success' });
            } else {
                let { loaiVanBan, donVi } = item;

                const soVanBanItem = await app.model.hcthSoDangKy.create({
                    soCongVan: 'Yêu cầu đang được kiểm duyệt',
                    capVanBan: 'TRUONG',
                    loaiVanBan,
                    donViGui: donVi,
                    suDung: 0,
                    tuDong: 1
                });

                item = await app.model.hcthYeuCauCapSo.update({ id: item.id }, { soVanBan: soVanBanItem.id });
            }
            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.put('/api/hcth/so-van-ban/request/accept', app.permission.check('hcthSoVanBan:write'), async (req, res) => {
        try {
            const id = req.body.id;
            const item = await app.model.hcthYeuCauCapSo.get({ id });
            if (!item)
                throw 'Không tìm thấy yêu cầu';
            else if (item.trangThai != 'waiting')
                throw 'Trạng thái không hợp lệ';
            let { loaiVanBan, donVi } = item;

            let administrativeYear = await app.model.hcthSetting.get({ key: 'administrativeYear' });
            if (!administrativeYear) throw 'Không tồn tại năm hành chính';
            const nam = parseInt(administrativeYear.value);

            const ngayTao = new Date().getTime();
            let result;
            try {
                if (item.soLuiNgay) {
                    result = await app.model.hcthSoDangKy.createSoLui(donVi, 'TRUONG', loaiVanBan, nam, 1, ngayTao, getShcc(req), item.soVanBan, item.ngayLui);
                } else {
                    result = await app.model.hcthSoDangKy.createSoVanBanMain(donVi, 'TRUONG', loaiVanBan, nam, 1, ngayTao, getShcc(req), item.soVanBan);
                }
                if (!result.outBinds?.ret) throw new Error();
            } catch {
                throw { message: 'Số văn bản không hợp lệ' };
            }
            const soVanBanItem = await app.model.hcthSoDangKy.get({ ngayTao, soCongVan: result.outBinds?.ret });
            if (!soVanBanItem) throw 'Tạo số văn bản gặp lỗi';
            const newItem = await app.model.hcthYeuCauCapSo.update({ id: item.id }, { soVanBan: soVanBanItem.id, trangThai: 'success' });
            res.send({ item: newItem });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/so-van-ban/request/decline', app.permission.check('hcthSoVanBan:write'), async (req, res) => {
        try {
            const id = req.body.id;
            const item = await app.model.hcthYeuCauCapSo.get({ id });
            if (!item)
                throw 'Không tìm thấy yêu cầu';
            else if (item.trangThai != 'waiting')
                throw 'Trạng thái không hợp lệ';
            const newItem = await app.model.hcthYeuCauCapSo.update({ id: item.id }, { trangThai: 'decline' });
            if (newItem.soVanBan) await app.model.hcthSoDangKy.update({ id: newItem.soVanBan }, { soCongVan: 'Đã bị từ chối' });
            res.send({ item: newItem });
        } catch (error) {
            res.send({ error });
        }
    });
    app.delete('/api/hcth/so-van-ban/request/:id', app.permission.check('donViCongVanDi:edit'), async (req, res) => {
        try {
            const id = req.params.id;
            if (!parseInt(id)) {
                throw 'Dữ liệu không hợp lệ';
            }
            const item = await app.model.hcthYeuCauCapSo.get({ id });
            const userDepartments = getDonViQuanLy(req);
            if (getDonVi(req))
                userDepartments.push(getDonVi(req));
            if (item.trangThai != 'waiting' || (item.shcc != req.shcc && !req.session.user.permissions.includes('donViCongVanDi:manage') && !userDepartments.includes(req.donVi)))
                throw 'Bạn không đủ quyền để xóa yêu cầu này.';
            await app.model.hcthYeuCauCapSo.delete({ id });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};