module.exports = (app) => {
    const { trangThaiPhongHopTicketDict, trangThaiPhongHopTicket, phongHopCensorNotification, getEmailFromShcc, phongHopRequestNotification } = require('../tools')(app);
    const moment = require('moment');
    app.put('/api/hcth/cong-tac/phong-hop-ticket', app.permission.orCheck('staff:login', 'hcthCongTac:write'), async (req, res) => {
        try {
            const { phongHopTicketId, changes: { trangThai } } = req.body;
            let item = await app.model.hcthPhongHopTicket.get({ id: phongHopTicketId });
            let congTacItem = await app.model.hcthCongTacItem.getItem(item.congTacItemId);
            if (!app.model.hcthCongTacItem.getPermissionChecker(congTacItem, req.session.user).isEditable()) {
                throw 'Bạn không có quyền cập nhật';
            }
            const timeStamp = Date.now();
            if (trangThai === trangThaiPhongHopTicketDict.DA_DANG_KY.id) {
                const { rows: checker } = await app.model.hcthPhongHopTicket.getPhongHop(app.utils.stringify({ startAt: congTacItem.batDau, endAt: congTacItem.ketThuc, phongHop: item.phongHop }));
                if (checker.length) {
                    throw 'Phòng họp không khả dụng';
                }
            }
            item = await app.model.hcthPhongHopTicket.update({ id: phongHopTicketId }, { trangThai, thoiGianCapNhat: timeStamp, canBoCapNhat: req.session.user.shcc });
            congTacItem = await app.model.hcthCongTacItem.getItem(item.congTacItemId);
            app.model.hcthCongTacLog.createLog(congTacItem.id, req);

            if (item.trangThai == trangThaiPhongHopTicketDict.DA_DANG_KY.id) {
                await app.model.hcthPhongHopTicket.update({ id: phongHopTicketId }, { thoiGianTao: timeStamp });
                const emails = await app.model.hcthDoiTuongKiemDuyet.getDepartmentStaff('29', 'hcthCongTac:manage', Date.now()).then(({ rows: items }) => items.map(i => i.email));
                phongHopRequestNotification(congTacItem, app.utils.getUserFullName(req.session.user), emails);
            }

            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    //TODO: Long thu hoi
    app.put('/api/hcth/cong-tac/phong-hop-ticket/phong-hop', app.permission.check('hcthCongTac:write'), async (req, res) => {
        try {
            //TODO: Long
            const { phongHopTicketId, phongHop } = req.body;
            let item = await app.model.hcthPhongHopTicket.get({ id: phongHopTicketId });
            let congTacItem = await app.model.hcthCongTacItem.getItem(item.congTacItemId);
            if (item.phongHop == phongHop) {
                throw 'Vui lòng chọn phòng họp khác';
            }
            const { rows: checker } = await app.model.hcthPhongHopTicket.getPhongHop(app.utils.stringify({ startAt: congTacItem.batDau, endAt: congTacItem.ketThuc, phongHop: item.phongHop }));
            if (checker.length) {
                throw 'Phòng họp không khả dụng';
            }
            app.model.hcthCongTacLog.createLog(congTacItem.id, req);


            res.send({ item });
        } catch (error) {
            console.error(new Date(), req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/phong-hop-ticket/censor', app.permission.check('hcthCongTac:write'), async (req, res) => {
        try {
            //TODO: Long check update permission 
            const { phongHopTicketId, changes: { trangThai, lyDo, isDeleted } } = req.body;
            const shcc = req.session.user?.staff?.shcc;
            const thoiGianCapNhat = Date.now();

            let item = await app.model.hcthPhongHopTicket.get({ id: phongHopTicketId });
            let congTacItem = await app.model.hcthCongTacItem.getItem(item.congTacItemId);
            if (!item) {
                throw 'Phiếu đăng ký không tồn tại';
            }

            if (Number(isDeleted)) {
                item = await app.model.hcthPhongHopTicket.update({ id: phongHopTicketId }, { isDeleted: Number(!item.isDeleted) });
                return res.send({ item });
            }
            else if (!trangThaiPhongHopTicket.filter(i => i.censor).some(i => i.id == trangThai))
                throw 'Trạng thái cập nhật không hợp lệ';

            if (trangThaiPhongHopTicketDict[trangThai].lyDoRequired && !lyDo)
                throw 'Vui lòng nhập lý do';

            if (trangThaiPhongHopTicketDict[trangThai].checkRequired) {
                const { rows: checker } = await app.model.hcthPhongHopTicket.getPhongHop(app.utils.stringify({ startAt: congTacItem.batDau, endAt: congTacItem.ketThuc, phongHop: item.phongHop }));
                if (checker.length) {
                    throw 'Phòng họp không khả dụng';
                }
            }

            app.model.hcthCongTacLog.createLog(congTacItem.id, req);

            item = await app.model.hcthPhongHopTicket.update({ id: phongHopTicketId }, { trangThai, lyDo: lyDo || '', thoiGianCapNhat, canBoCapNhat: shcc, canBoKiemDuyet: shcc });
            congTacItem = await app.model.hcthCongTacItem.getItem(item.congTacItemId);

            phongHopCensorNotification(congTacItem, app.utils.getUserFullName(req.session.user), item.trangThai, lyDo, await getEmailFromShcc([congTacItem.nguoiTao]));
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/phong-hop-ticket/page/:pageNumber/:pageSize', app.permission.orCheck('hcthCongTac:read', 'staff:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber);
            const _pageSize = parseInt(req.params.pageSize);
            const filterData = req.query.filter;
            const pageCondition = req.query.condition;
            filterData.todayTime = Date.now();
            const page = await app.model.hcthPhongHopTicket.searchPage(_pageNumber, _pageSize, app.utils.stringify(filterData), pageCondition);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/phong-hop-ticket/download', app.permission.check('hcthCongTac:read'), async (req, res) => {
        try {
            const filterData = req.query.filter;
            const pageCondition = req.query.condition;
            filterData.todayTime = Date.now();
            let page = await app.model.hcthPhongHopTicket.searchPage(1, 1, app.utils.stringify(filterData), pageCondition);
            const { totalitem: totalItem } = page;
            page = await app.model.hcthPhongHopTicket.searchPage(1, totalItem, app.utils.stringify(filterData), pageCondition);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Danh sách phòng họp');
            let counter = 2;
            ws.getCell(`A${counter}`).value = 'STT';
            ws.getCell(`B${counter}`).value = 'Thời gian';
            ws.getCell(`C${counter}`).value = 'Phòng họp';
            ws.getCell(`D${counter}`).value = 'Giờ';
            ws.getCell(`E${counter}`).value = 'Nội dung';
            ws.getCell(`F${counter}`).value = 'Người tạo';

            ws.getColumn(2).width = 20;
            ws.getColumn(3).width = 20;
            ws.getColumn(4).width = 10;
            ws.getColumn(5).width = 15;
            ws.getColumn(6).width = 20;
            ws.getColumn(7).width = 35;
            const weekDays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật',];


            ws.getRow(counter).font = {
                name: 'Times New Roman',
                bold: true,
                family: 4,
                size: 12,
                color: { argb: 'FF000000' }
            };
            let currentDayInWeek = -1;
            let padding = 0;

            page.rows.forEach((item, index) => {
                const dayInWeek = (new Date(item.batDau).getDay() + 6) % 7;
                if (currentDayInWeek == -1) {
                    currentDayInWeek = dayInWeek;
                }
                if (dayInWeek != currentDayInWeek) {
                    padding++;
                    currentDayInWeek = dayInWeek;
                }
                const row = counter + index + 1 + padding;
                const batDau = new Date(item.batDau);
                const ketThuc = new Date(item.ketThuc);
                // let timeRange;
                // if (batDau.toDateString() == ketThuc.toDateString())
                //     timeRange = moment(batDau).format(`HH:mm-[${moment(ketThuc).format('HH:mm')}], DD/MM/YYYY`);
                // else {
                //     timeRange = `${moment(batDau).format('HH:mm, DD/MM/YYYY')} - ${moment(ketThuc).format('HH:mm, DD/MM/YYYY')}`;
                // }
                ws.getCell(`A${row}`).value = index + 1;
                ws.getCell(`B${row}`).value = weekDays[dayInWeek] + ` (${moment(batDau).format('DD/MM')})`;
                ws.getCell(`C${row}`).value = item.tenPhongHop;
                ws.getCell(`D${row}`).value = `${moment(batDau).format('HH:mm')} - ${moment(ketThuc).format('HH:mm')}`;
                ws.getCell(`E${row}`).value = item.ten;
                ws.getCell(`F${row}`).value = item.tenNguoiTao?.normalizedName() + (item.tenDonVi ? ` (${item.tenDonVi})` : '');

                ws.getRow(row).font = {
                    name: 'Times New Roman',
                    // bold: true,
                    family: 4,
                    size: 12,
                    color: { argb: 'FF000000' }
                };

            });
            let fileName = 'DANH SACH PHONG HOP.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });
};