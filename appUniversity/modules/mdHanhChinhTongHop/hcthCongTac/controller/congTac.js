module.exports = (app) => {
    /**!SECTION
     * thong bao them vao lich hop
     * thong bao xac nhan tham gia lich hop
     * thong bao xac them bien ban ket luan
     * tuong tac
     */
    const { LichPermission } = require('../permissionClasses')(app);
    const { adminStatisticNotification, userDailyMailNotification, getEmailFromShcc, trangThaiCongTacTicketDict, trangThaiPhongHopTicketDict, phongHopRequestNotification } = require('../tools')(app);
    const { CongTacTicketPermission } = require('../permissionClasses')(app);
    app.permission.add({ name: 'hcthCongTac:read' }, 'hcthCongTac:write');

    const hcthMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            522: { title: 'Quản lý đăng ký phòng họp', link: '/user/hcth/phong-hop-ticket', icon: 'fa-building', backgroundColor: '#4895ef', groupIndex: 1 },
        },
    };

    const hcthCongTacTicketMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            523: { title: 'Quản lý đăng ký công tác', link: '/user/hcth/cong-tac/dang-ky', icon: 'fa-calendar', backgroundColor: '#12AFB3', groupIndex: 1 },
        },
    };

    app.get('/user/vpdt/cong-tac/dang-ky', app.permission.orCheck('staff:login', 'hcthCongTac:manage'), app.templates.admin);
    app.get('/user/hcth/cong-tac/dang-ky', app.permission.orCheck('hcthCongTac:manage'), app.templates.admin);
    app.get('/user/vpdt/cong-tac/dang-ky/:id', app.permission.orCheck('staff:login', 'hcthCongTac:manage'), app.templates.admin);
    app.get('/user/vpdt/cong-tac/:id', app.permission.orCheck('staff:login', 'hcthCongTac:read'), app.templates.admin);
    app.get('/user/hcth/phong-hop-ticket', app.permission.orCheck('hcthCongTac:read'), app.templates.admin);
    app.get('/user/vpdt/lich-cong-tac', app.permission.orCheck('staff:login', 'hcthCongTac:read'), app.templates.admin);
    app.get('/user/vpdt/lich-cong-tac/:id', app.permission.orCheck('staff:login', 'hcthCongTac:read'), app.templates.admin);
    app.get('/user/vpdt/phong-hop/tra-cuu', app.permission.orCheck('staff:login', 'hcthCongTac:read'), app.templates.admin);

    const menu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            436: { title: 'Lịch công tác', link: '/user/vpdt/lich-cong-tac', icon: 'fa-calendar-check-o', backgroundColor: '#6b4226', groupIndex: 1 },
        },
    };
    const ticketMenu = {
        parentMenu: app.parentMenu.vpdt,
        menus: {
            437: { title: 'Đăng ký công tác', link: '/user/vpdt/cong-tac/dang-ky', icon: 'fa-calendar-plus-o', backgroundColor: '#9a8c98', groupIndex: 1 },
        },
    };

    app.permission.add({ name: 'staff:login', menu });
    app.permission.add({ name: 'hcthCongTac:manage', menu: hcthMenu });
    app.permission.add({ name: 'hcthCongTac:manage', menu: hcthCongTacTicketMenu });
    app.permission.add({ name: 'staff:login', menu: ticketMenu });

    app.post('/api/hcth/cong-tac/censor-message', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const { id, noiDung } = req.body.data;
            const item = await app.model.hcthCongTacItem.getItem(id);
            const ticket = await app.model.hcthCongTacTicket.get({ id: item.congTacTicketId });
            const lich = (ticket || item.lichId) ? await app.model.hcthLichCongTac.get({ id: ticket?.lichCongTacId || item.lichId }) : null;
            if (!lich || lich.canBoKiemDuyet != req.session.user.shcc) {
                throw 'Bạn không đủ quyền để kiểm duyệt';
            } else if (!noiDung) {
                throw 'Nội dung trống';
            }
            await app.model.hcthPhanHoi.create({ noiDung, ngayTao: Date.now(), key: item.id, canBoGui: req.session.user.shcc, loai: 'CONG_TAC_CENSOR_MESSAGE' });
            res.send({});
        } catch (error) {
            console.error(new Date(), req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/censor-message/:id', app.permission.orCheck('rectors:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            res.send({ items: await app.model.hcthPhanHoi.getAll({ key: req.params.id, loai: 'CONG_TAC_CENSOR_MESSAGE' }, '*', 'isResolved, id') });
        } catch (error) {
            console.error(new Date(), req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/censor-message/resolve', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const { id } = req.body.data;
            const phanHoi = await app.model.hcthPhanHoi.get({ id, loai: 'CONG_TAC_CENSOR_MESSAGE' });
            if (!phanHoi || phanHoi.isResovled) {
                throw 'Thao tác không hợp lệ';
            } else if (!new LichPermission({}, req.session.user).canResolveCensorMessages(phanHoi)) {
                throw 'Bạn không có quyền cập nhật';
            }

            await app.model.hcthPhanHoi.update({ id, loai: 'CONG_TAC_CENSOR_MESSAGE' }, { isResolved: 1 });
            res.send({});
        } catch (error) {
            console.error(new Date(), req.originalUrl, error);
            res.send({ error });
        }
    });


    app.get('/api/hcth/cong-tac/:id', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const { version } = req.query;
            let item;
            if (!version) {
                item = await app.model.hcthCongTacItem.getItem(req.params.id);
                item.congTacTicket = item.congTacTicketId ? await app.model.hcthCongTacTicket.get({ id: item.congTacTicketId }) : null;
            }
            else {
                const log = await app.model.hcthCongTacLog.get({ id: req.params.id, thoiGian: version });
                item = app.utils.parse(log.itemData);
            }
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/:id/logs', app.permission.orCheck('hcthCongTac:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const logs = await app.model.hcthCongTacItem.getLogs(app.utils.stringify({ congTacId: id })).then(({ rows }) => rows);
            res.send({ items: logs });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/user/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'hcthCongTac:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber);
            const _pageSize = parseInt(req.params.pageSize);
            let filterData = req.query.filter || {};
            filterData = { ...filterData, batDau: Number(filterData.batDau) || null, ketThuc: Number(filterData.ketThuc) || null, userShcc: req.session.user?.staff?.shcc };
            const pageCondition = req.query.condition;
            const page = await app.model.hcthCongTacItem.searchPage(_pageNumber, _pageSize, app.utils.stringify(filterData), pageCondition);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/cong-tac/global-status', app.permission.orCheck('hcthCongTac:write'), async (req, res) => {
        try {
            const { objectType, id, trangThai } = req.body;
            const model = {
                congTacItem: app.model.hcthCongTacItem,
                congTacTicket: app.model.hcthCongTacTicket,
                lichCongTac: app.model.hcthLichCongTac,
            }[objectType];
            const item = await model.get({ id });
            await model.update({ id: item.id }, { trangThai });
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/remove', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const { id } = req.body;
            const item = await app.model.hcthCongTacItem.getItem(id);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                throw 'Bạn không có quyền cập nhật';
            }
            await app.model.hcthCongTacItem.update({ id: item.id }, { lichId: null, congTacTicketId: null });
            await app.model.hcthCongTacLog.createLog(item.id, req);
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/hcth/cong-tac', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            let { thanhPhan, guiPhieu, ...data } = req.body.data;
            if (!(await app.model.tchcCanBo.get({shcc: req.session.user.shcc}))) {
                throw 'Permission denied';
            }
            const shcc = req.session.user.shcc;
            const chainItem = await app.model.hcthChainItem.create({ loai: 'CONG_TAC_ITEM', version: 1 });
            if (Number(data.dangKyPhongHop)) {
                const { rows: phongHopBan } = await app.model.hcthPhongHopTicket.getPhongHop(app.utils.stringify({ startAt: data.batDau, endAt: data.ketThuc, phongHop: data.phongHop }));
                if (phongHopBan.length) {
                    throw 'Phòng họp không hợp lệ. Vui lòng tra cứu lại và chọn phòng hợp lệ.';
                }
            }
            const lichItem = data.lichId ? await app.model.hcthLichCongTac.get({ id: data.lichId }) : null;
            const item = await app.model.hcthCongTacItem.create({ ...data, nguoiTao: shcc, id: chainItem.id, trangThai: lichItem ? lichItem.trangThai == 'DA_PHAT_HANH' ? 'DUYET' : 'DANG_KY' : 'KHOI_TAO' });
            if (thanhPhan && thanhPhan.length) {
                if (data.chuTri && !thanhPhan.includes(data.chuTri)) {
                    thanhPhan.unshift(data.chuTri);
                }
                await app.model.hcthCanBoNhan.listCreate(thanhPhan.map((i, index) => ({
                    ordinal: index, canBoNhan: i, loai: 'CONG_TAC_ITEM', 'ma': item.id, vaiTro: i == data.chuTri ? 'CHU_TRI' : 'CAN_BO_THAM_GIA', nguoiTao: req.session.user.shcc, trangThai: i == shcc ? 'INVITED' : 'PENDING',
                })));
            }

            if (item.dangKyPhongHop) {
                guiPhieu = Number(guiPhieu);
                const chainPhongHopTicketItem = await app.model.hcthChainItem.create({ loai: 'PHONG_HOP_TICKET', version: 1 }); // item
                const phongHopTicketItem = await app.model.hcthPhongHopTicket.create({ id: chainPhongHopTicketItem.id, phongHop: data.phongHop, congTacItemId: item.id, trangThai: 'CHUA_DANG_KY' });
                await app.model.hcthCongTacItem.update({ id: item.id }, { phongHopTicketId: phongHopTicketItem.id });
                if (guiPhieu) {
                    await app.model.hcthPhongHopTicket.update({ id: phongHopTicketItem.id }, { thoiGianTao: Date.now(), trangThai: trangThaiPhongHopTicketDict.DA_DANG_KY.id });
                    const emails = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff('29', 'hcthCongTac:manage', Date.now()).then(({ rows: items }) => items.map(i => i.email));
                    phongHopRequestNotification(await app.model.hcthCongTacItem.getItem(item.id), app.utils.getUserFullName(req.session.user), emails);
                }
            }
            await app.model.hcthCongTacLog.createLog(item.id, req);
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/cong-tac', app.permission.orCheck('staff:login', 'hcthCongTac:manage'), async (req, res) => {
        try {
            const { id } = req.body;
            const item = await app.model.hcthCongTacItem.getItem(id);
            const ticket = item.congTacTicketId ? await app.model.hcthCongTacTicket.getItem(item.congTacTicketId) : null;
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isDeletable() && (!ticket || !(new CongTacTicketPermission(ticket, req.session.user).isEditable()))) {
                throw 'Permission denied';
            }
            await app.model.hcthCongTacItem.deleteItem(item.id);
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac', app.permission.orCheck('staff:login', 'hcthCongTac:manage'), async (req, res) => {
        try {
            const { dangKyPhongHop, phongHop, batDau, ketThuc, guiPhieu, ...data } = req.body.changes;
            const id = req.body.id;
            const item = await app.model.hcthCongTacItem.getItem(id, true);
            if (!app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).isEditable()) {
                throw 'Bạn không có quyền cập nhật';
            }
            if (item.dangKyPhongHop && dangKyPhongHop) {
                const phongHopTicket = item.phongHopTicket;
                if (phongHopTicket.phongHop != phongHop || batDau != item.batDau || ketThuc != item.ketThuc) {
                    if (app.model.hcthCongTacItem.getPermissionChecker(item, req.session.user).canUpdatePhongHop()) {
                        const { rows: phongHopBan } = await app.model.hcthPhongHopTicket.getPhongHop(app.utils.stringify({ startAt: batDau, endAt: ketThuc, phongHop: phongHop, excludeId: item.id }));
                        if (phongHopBan.find(i => i.phongHop == 'D201 - D202'))
                            phongHopBan.push({ phongHop: 'D201' }, { phongHop: 'D202' });
                        else if (phongHopBan.find(i => ['D201', 'D202'].includes(i.phongHop))) {
                            phongHopBan.push({ phongHop: 'D201 - D202' });
                        }
                        if (phongHopBan.length) {
                            throw 'Phòng họp không hợp lệ. Vui lòng tra cứu lại và chọn phòng hợp lệ.';
                        }
                        data.batDau = batDau;
                        data.ketThuc = ketThuc;
                        await app.model.hcthPhongHopTicket.update({ id: phongHopTicket.id }, { phongHop, trangThai: Number(guiPhieu) ? 'DA_DANG_KY' : 'CHUA_DANG_KY' });
                        if (Number(guiPhieu)) {
                            const emails = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff('29', 'hcthCongTac:manage', Date.now()).then(({ rows: items }) => items.map(i => i.email));
                            phongHopRequestNotification(await app.model.hcthCongTacItem.getItem(item.id), app.utils.getUserFullName(req.session.user), emails, true);
                        }
                    } else
                        throw 'Bạn không thể cập nhật thông tin đăng ký phòng họp';
                }
            } else {
                data.batDau = batDau;
                data.ketThuc = ketThuc;
            }

            await app.model.hcthCongTacItem.update({ id }, data);
            app.model.hcthCongTacLog.createLog(item.id, req);
            res.send({ item: await app.model.hcthCongTacItem.getItem(item.id) });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    app.get('/api/hcth/cong-tac/range', app.permission.orCheck('staff:login', 'hcthCongTac:read'), async (req, res) => {
        try {
            const { startAt, endAt } = req.query;
            const { rows: items } = await app.model.hcthCongTacItem.getList(app.utils.stringify({ startAt, endAt, shccCanBo: req.session.user.shcc }));
            const data = {};
            items.forEach(meeting => {
                const batDau = new Date(meeting.batDau);
                const key = `${batDau.getFullYear()}-${batDau.getMonth()}-${batDau.getDate()}`;
                if (!data[key]) {
                    data[key] = [meeting];
                } else
                    data[key].push(meeting);
            });
            res.send({ data });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/decline', app.permission.check('hcthCongTac:manage'), async (req, res) => {
        try {
            let item = await app.model.hcthCongTacItem.getItem(req.body.id);
            await app.model.hcthCongTacItem.update({ id: item.id }, { trangThai: trangThaiCongTacTicketDict.TU_CHOI.id });
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    const hcthCongTacPermission = 'hcthCongTac:manage';

    app.assignRoleHooks.addRoles(hcthCongTacPermission, { id: hcthCongTacPermission, text: 'Hành chính tổng hợp: Quản lý công tác' });

    app.assignRoleHooks.addHook(hcthCongTacPermission, async (req, roles) => {
        // const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole === hcthCongTacPermission && req.session.user?.staff?.listChucVu?.some(item => item.maDonVi == '29' && item.isManager == 1)) {
            const assignRolesList = app.assignRoleHooks.get(hcthCongTacPermission).map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleLichHop', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == hcthCongTacPermission);
        inScopeRoles.forEach(role => {
            if (role.tenRole === hcthCongTacPermission) {
                app.permissionHooks.pushUserPermission(user, hcthCongTacPermission, 'hcthCongTac:read', 'hcthCongTac:write', 'hcthCongTac:notify');
            }
        });
        resolve();
    }));

    //TODO: Long

    const sendUserNotification = async () => {
        try {
            const filter = {
                batDau: new Date().setHours(0, 0, 0, 0) + 24 * 3600 * 1000,
                ketThuc: new Date().setHours(23, 59, 59, 999) + 24 * 3600 * 1000
            };
            const { rows: items } = await app.model.hcthCongTacItem.getDailyData(app.utils.stringify(filter));
            if (!items.length) return console.info('hcthCongTac:DailyNotification', 'done');
            const canBoData = {};
            items.forEach(item => {
                item.thanhPhan = app.utils.parse(item.thanhPhan, []) || [];
                const thanhPhan = item.thanhPhan?.filter(i => {
                    if (!item.congTacTicketId && !item.lichId) {
                        return i.trangThai == 'INVITED';
                    } else
                        return true;
                });
                thanhPhan?.forEach(i => {
                    if (canBoData[i.shcc]) {
                        canBoData[i.shcc].push(item);
                    } else {
                        canBoData[i.shcc] = [item];
                    }
                });
            });

            Object.keys(canBoData).forEach(async shcc => {
                userDailyMailNotification(canBoData[shcc], await getEmailFromShcc([shcc]));
            });
        } catch (error) {
            console.error('hcthCongTac:DailyNotification', error);
        }
    };

    (app.isDebug || app.appName == 'mdHanhChinhTongHopService') && app.readyHooks.add('hcthCongTac:DailyNotification', {
        ready: () => app.database && app.assetPath,
        run: () => app.primaryWorker && app.schedule('0 7 * * *', () => sendUserNotification().catch(error => console.error(error))),
        // run: () => app.primaryWorker && sendUserNotification().catch(error => console.error(error)),
    });

    const resendEmail = async () => {
        try {
            const now = Date.now();
            console.info('hcthCongTac:CheckMail start');
            const errorMails = await app.model.fwEmailTask.getAll({
                statement: 'state = :errorStatus AND createDate > :rangeStart and createDate <= :rangeEnd',
                parameter: {
                    errorStatus: 'error',
                    rangeStart: now - 2 * 3600 * 1000,
                    rangeEnd: now,
                }
            });
            if (!errorMails.length) {
                console.info('hcthCongTac:CheckMail no errors');
                return;
            }
            await app.model.fwEmailTask.update({
                statement: 'state = :errorStatus AND createDate > :rangeStart and createDate <= :rangeEnd',
                parameter: {
                    errorStatus: 'error',
                    rangeStart: now - 2 * 3600 * 1000,
                    rangeEnd: now,
                }
            }, { state: 'waiting' });
            for (const mailItem of errorMails)
                app.messageQueue.send('emailService:send', { id: mailItem.id });

            const sendStatistic = async (errorMails) => {
                if (!errorMails) return;
                const statistic = errorMails.reduce((total, current) => ({ ...total, [current.mailFrom]: total[current.mailFrom] ? total[current.mailFrom] + 1 : 1 }), {});
                adminStatisticNotification(statistic, ['long.nguyen0709@hcmut.edu.vn'], 'nqlong0709@gmail.com,baoid0001@gmail.com');
            };
            console.log({ errorMails, abc: new Date(now).getHours() });
            if (new Date(now).getHours() % 2 == 1) {
                sendStatistic(errorMails);
            }
        } catch (error) {
            console.error('hcthCongTac:CheckMail', error);
        }
    };

    (app.isDebug || app.appName == 'mdHanhChinhTongHopService') && app.readyHooks.add('hcthCongTac:CheckMail', {
        ready: () => app.database && app.assetPath,
        run: () => app.primaryWorker && !app.isDebug && app.schedule('*/30 6-19 * * *', () => resendEmail().catch(error => console.error(error))),
    });
};
