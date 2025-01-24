module.exports = app => {
    const moment = require('moment');
    const template = `<p><span style="font-family:Times New Roman,Times,serif"><span style="font-size:16px">Hệ thống văn ph&ograve;ng điện tử xin th&ocirc;ng b&aacute;o đến qu&yacute; thầy/c&ocirc; về lịch họp <a href="{link}">#{id}</a>,</span></span></p>

    <p style="margin-left:40px"><span style="font-family:Times New Roman,Times,serif"><span style="font-size:16px">{noi_dung_thong_bao}</span></span></p>
    
    <p><span style="font-family:Times New Roman,Times,serif"><span style="font-size:16px">Th&ocirc;ng tin lịch họp:</span></span></p>
    
    <ul>
        <li><span style="font-family:Times New Roman,Times,serif"><span style="font-size:16px"><strong>Chủ đề</strong>: {chu_de}.</span></span></li>
        <li><span style="font-family:Times New Roman,Times,serif"><span style="font-size:16px"><strong>Nội dung</strong>: {noi_dung}.</span></span></li>
        <li><span style="font-family:Times New Roman,Times,serif"><span style="font-size:16px"><strong>Địa điểm</strong>: {dia_diem}.</span></span></li>
        <li><span style="font-family:Times New Roman,Times,serif"><span style="font-size:16px"><strong>Thời gian bắt đầu</strong>: {bat_dau}.</span></span></li>
        <li><span style="font-family:Times New Roman,Times,serif"><span style="font-size:16px"><strong>Thời gian dự kiến kết th&uacute;c</strong>: {ket_thuc}.</span></span></li>
    </ul>
    
    <p><span style="font-family:Times New Roman,Times,serif"><span style="font-size:16px">Qu&yacute; thầy c&ocirc; vui l&ograve;ng truy cập đường dẫn <a href="{link}">sau</a> đề biết th&ecirc;m chi tiết về lịch họp.</span></span></p>
    
    <hr />
    <blockquote>
    <p><em><span style="font-family:Times New Roman,Times,serif">Trường Đại học Khoa học X&atilde; hội v&agrave; Nh&acirc;n văn.</span></em></p>
    
    <p><em><span style="font-family:Times New Roman,Times,serif">Hệ thống Văn ph&ograve;ng điện tử HCMUSSH-EOFFICE.</span></em></p>
    </blockquote>
`;


    const taskTableTemplate = `
    <table border="1" cellpadding="1" cellspacing="1" style="width:100%">
    <thead>
        <tr style="text-align:center;">
            <th style="white-space:nowrap; width:auto">STT</th>
            <th style="white-space:nowrap; width:30%">Th&agrave;nh phần</th>
            <th style="white-space:nowrap; width:auto">Thời gian</th>
            <th style="white-space:nowrap; width:40%">Nội dung</th>
            <th style="white-space:nowrap; width:30%">Địa điểm</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="width:auto">STT</td>
            <td style="width:30%">Th&agrave;nh phần</td>
            <td style="width:auto">Thời gian</td>
            <td style="width:40%">Nội dung</td>
            <td style="width:30%">Địa điểm</td>
        </tr>
    </tbody>
    </table>`;

    const lichTemplate = `
    <div style="border-radius:20px; border:2px outset blue; overflow:hidden; padding-bottom:20px; text-align:center; min-width:500px; max-width: 1000px;font-family:Times New Roman,Times,serif"><img alt="" src="https://hcmussh.edu.vn/img/logo-ussh.png" style="width:110%" />
    <div style="padding:20px; text-align:justify"><span style="font-size:18px"><span style="font-family:Times New Roman,Times,serif">{noi_dung_thong_bao}.</span></span></div>

    <div style="padding:0px; text-align:justify">
    {table_task}
    </div>
    </div>

    <hr />
    <blockquote>
    <p><span style="font-size:12px"><span style="font-family:Times New Roman,Times,serif">Hệ thống văn ph&ograve;ng điện tử E-office.</span></span></p>

    <p><span style="font-size:12px"><span style="font-family:Times New Roman,Times,serif">Trường Đại học Khoa học X&atilde; hội v&agrave; Nh&acirc;n văn - Đại học Quốc gia Th&agrave;nh phố Hồ Ch&iacute; Minh.&nbsp;</span></span></p>
    </blockquote>
`;

    const weekDays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật',];

    const arrayToDict = (array) => array.reduce((total, item) => {
        total[item.id] = item;
        return total;
    }, {});

    const trangThaiCongTacItem = [
        { id: 'KHOI_TAO', text: 'Khởi tạo', level: 'danger', isEditable: 1, defaultFilter: 1 },
        { id: 'DANG_KY', text: 'Đã đăng ký', level: 'primary', defaultFilter: 1 },
        { id: 'DUYET', text: 'Đã duyệt', level: 'success', isInvitable: 1, defaultFilter: 1 },
        { id: 'TU_CHOI', text: 'Từ chối', level: 'danger', isEditable: 1, },
    ];

    const trangThaiCongTacTicket = [
        { id: 'KHOI_TAO', text: 'Khởi tạo', level: 'danger', isEditable: 1, isDeletable: 1 },
        { id: 'DA_GUI', text: 'Đã gửi', level: 'primary', adminFilter: 1, defaultAdminFilter: 1 },
        { id: 'DA_NHAN', text: 'Đã nhận', level: 'warning', adminFilter: 1, defaultAdminFilter: 1 },
        { id: 'DANG_XU_LY', text: 'Đang xử lý', level: 'warning', adminFilter: 1, defaultAdminFilter: 1 },
        { id: 'HOAN_TAT', text: 'Hoàn tất', level: 'success', adminFilter: 1 },
        { id: 'TU_CHOI', text: 'Từ chối', level: 'danger', isEditable: 1, isDeletable: 1, adminFilter: 1 },
    ];

    const vaiTroCanBo = [
        { id: 'THU_KY', text: 'Thư ký', level: 'success' },
        { id: 'CHU_TRI', text: 'Chủ trì', level: 'danger' },
        { id: 'CAN_BO_THAM_GIA', text: 'Cán bộ tham gia', level: 'primary' },
    ];

    const trangThaiXacNhan = [
        { id: 'PENDING', text: 'Khởi tạo', level: 'primary' },
        { id: 'ACCEPTED', text: 'Đã xác nhận', level: 'success' },
        { id: 'DECLINED', text: 'Từ chối', level: 'danger' },
        { id: 'INVITED', text: 'Đã gửi lời mời', level: 'warning' },
    ];

    const trangThaiLichHop = [
        { id: 'DANG_KY', text: 'Đăng ký mới', level: 'primary' },
        { id: 'CHUA_DIEN_RA', text: 'Chưa diễn ra', level: 'warning' },
        { id: 'DANG_DIEN_RA', text: 'Đang diễn ra', level: 'success' },
        { id: 'TU_CHOI', text: 'Đăng ký bị từ chối', level: 'danger' },
        { id: 'KET_THUC', text: 'Kết thúc', level: 'danger' },
    ];

    const trangThaiPhongHopTicket = [
        { id: 'CHUA_DANG_KY', text: 'Chưa đăng ký', level: 'primary', valid: 1, warning: 1 },
        { id: 'DA_DANG_KY', text: 'Đã đăng ký', level: 'warning', allowFilter: 1, valid: 1, allowUserFilter: 1, checkReqired: 1 },
        { id: 'TU_CHOI', text: 'Từ chối', level: 'danger', lyDoRequired: 1, censor: 1, allowFilter: 1, allowUserFilter: 1, },
        { id: 'DA_DUYET', allowUserFilter: 1, text: 'Đã duyệt', level: 'success', censor: 1, allowFilter: 1 },
    ];

    const trangThaiLichCongTac = [
        { id: 'TONG_HOP', text: 'Đang tổng hợp', level: 'primary', canRequest: 1, canEdit: 1 },
        { id: 'DA_PHAT_HANH', text: 'Đã phát hành', level: 'success', canEdit: 1 },
        { id: 'KIEM_DUYET', text: 'Kiểm duyệt', level: 'warning', censor: 1, canRevoke: 1 },
        { id: 'TU_CHOI', text: 'Từ chối', level: 'danger', canRequest: 1, canEdit: 1, censor: 1 },
        { id: 'DA_DUYET', text: 'Đã duyệt', level: 'primary', canRequest: 1, canEdit: 1, censor: 1 },
    ];

    const trangThaiLichCongTacDict = arrayToDict(trangThaiLichCongTac);
    const trangThaiPhongHopTicketDict = arrayToDict(trangThaiPhongHopTicket);
    const vaiTroCanBoDict = arrayToDict(vaiTroCanBo);
    const trangThaiLichHopDict = arrayToDict(trangThaiLichHop);
    const trangThaiXacNhanDict = arrayToDict(trangThaiXacNhan);
    const trangThaiCongTacItemDict = arrayToDict(trangThaiCongTacItem);
    const trangThaiCongTacTicketDict = arrayToDict(trangThaiCongTacTicket);

    const resolveTrangThai = (item, timeStamp) => {
        let trangThai = item.trangThai;
        if (item.trangThai == 'CHUA_DIEN_RA') {
            if (item.ketThuc < timeStamp) {
                trangThai = 'KET_THUC';
            }
            if (timeStamp >= item.batDau && timeStamp < item.ketThuc) {
                trangThai = 'DANG_DIEN_RA';
            }
        } else if (item.trangThai == 'DANG_DIEN_RA') {
            if (item.ketThuc < timeStamp) {
                trangThai = 'KET_THUC';
            }
        }
        return trangThai;
    };

    const userDailyMailNotification = (lichHopData, userEmail) => {
        try {
            const message = 'Hệ thống văn phòng điện tử xin gửi quý Thầy/Cô lịch làm việc, công tác';
            const mailTemplate = lichTemplate.replaceAll('{noi_dung_thong_bao}', message).replaceAll('{table_task}', fillSchedule(lichHopData, taskTableTemplate));
            const notification = { emailContent: { mailHtml: mailTemplate, mailText: '', mailTitle: `[HCMUSSH-EOFFICE]: Thông báo lịch làm việc, công tác ngày ${moment(new Date(new Date().getTime() + 24 * 3600 * 1000)).format('DD/MM/YYYY')}` } };
            createNotification(userEmail, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('userDailyMailNotification', error);
        }
    };

    const adminStatisticNotification = (statisticData, userEmail, bcc) => {
        try {
            const message = `Hệ thống thông báo thông số email gửi thất bại 2h trước<br/>
            ${Object.entries(statisticData).map(([email, amount]) => {
                return `<div>${email}: ${amount}</div>`;
            }).join('\n')}`;
            const mailTemplate = lichTemplate.replaceAll('{noi_dung_thong_bao}', message).replaceAll('{table_task}', '');
            const notification = { emailContent: { mailHtml: mailTemplate, mailText: '', mailTitle: '[HCMUSSH-EOFFICE]: thông báo thông số email', bcc } };
            createNotification(userEmail, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('userDailyMailNotification', error);
        }
    };

    const fillLichHopInfo = (content, item) => content.replaceAll('{chu_de}', item.chuDe).replaceAll('{noi_dung}', item.noiDung)
        .replaceAll('{dia_diem}', (item.isOnline ? `<a href="${item.duongDan}">${item.duongDan}</a>` : `phòng ${item.phongHopItem.ten}`) || '').replaceAll('{bat_dau}', moment(new Date(item.batDau)).format('HH:mm, [ngày] DD/MM/YYYY'))
        .replaceAll('{ket_thuc}', moment(new Date(item.ketThuc)).format('HH:mm, [ngày] DD/MM/YYYY')).replaceAll('{id}', item.id);

    const userAddNotification = (item, fromUserName, toUsers) => {
        try {
            const subTitle = `Bạn đã được mời tham dự "${item.ten}" diễn ra vào lúc ${moment(new Date(item.batDau)).format('HH:mm, [ngày] DD/MM/YYYY')} bởi ${fromUserName}`,
                iconColor = 'success',
                icon = 'fa-calendar-check-o',
                title = 'Lịch công tác';
            const link = (app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + `/user/vpdt/cong-tac/${item.id}`;
            const mailMessage = `${subTitle}. Quý thầy/cô vui lòng nhấn vào <a href="${link}">đây</a> để biết thêm chi tiết`;
            const content = lichTemplate.replaceAll('{noi_dung_thong_bao}', mailMessage).replaceAll('{table_task}', '');

            const notification = { emailContent: { mailHtml: content, mailText: '', mailTitle: '[HCMUSSH-EOFFICE]: Công tác và Lịch họp' }, subTitle, iconColor, icon, title };
            createNotification(toUsers, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('userAddNotification', error);
        }
    };

    const userUpdateStatusNotification = (item, fromUserName, newTrangThai, toUsers) => {
        try {
            const subTitle = `Cán bộ ${fromUserName} đã ${newTrangThai == 'DECLINED' ? 'từ chối' : 'xác nhận'} tham dự buổi họp "${item.chuDe}".`,
                iconColor = trangThaiXacNhanDict[newTrangThai].level,
                icon = 'fa-calendar-check-o',
                title = 'Lịch họp';
            const content = template.replaceAll('{link}', app.isDebug ? `http://localhost:7012/user/vpdt/lich-hop/${item.id}` : `https://hcmussh.edu.vn/user/vpdt/lich-hop/${item.id}`);

            const notification = { emailContent: { mailHtml: fillLichHopInfo(content, item).replaceAll('{noi_dung_thong_bao}', subTitle), mailText: '', mailTitle: `[HCMUSSH-EOFFICE]: Lịch họp #${item.id}: ${item.chuDe}` }, subTitle, iconColor, icon, title };
            createNotification(toUsers, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('userUpdateStatusNotification', error);
        }
    };

    const fillSchedule = (tasks, template) => {
        const pattern = new RegExp('<tbody>.*?</tbody>', 'gs');
        let mailTemplate = template;
        const cloneTasks = [...tasks].sort((a, b) => {
            const value = a.batDau - b.batDau;
            if (value != 0) return value;
            return a.id - b.id;
        });
        let currentDayInWeek = -1;
        let currentDate = -1;
        return mailTemplate.replace(pattern, `
        <tbody>
        ${cloneTasks.flatMap((item, index) => {
            const batDau = new Date(item.batDau);
            const dayInWeek = (batDau.getDay() + 6) % 7;
            let timeRange = moment(batDau).format('HH:mm');
            const res = [];
            const date = new Date(item.batDau).getDate();
            if (dayInWeek != currentDayInWeek || date != currentDate) {
                res.push(`<tr><td style="text-align:center;padding:5px;font-weight:bold;background-color: #bddef5;" colspan="5">${`${weekDays[dayInWeek]}, ngày ${moment(batDau).format('DD/MM/YYYY')}`}</td></tr>`);
                currentDayInWeek = dayInWeek;
                currentDate = date;
            }
            res.push(`
        <tr>
            <td style="text-align:right;padding:5px;">${index + 1}</td>
            <td style="text-align:justify;padding:5px;">${item.banTheHienThanhPhan || getThanhPhanSummary(item.thanhPhan)}</td>
            <td style="text-align:justify;padding:5px;">${timeRange}</td>
            <td style="text-align:justify;padding:5px;"><a href="${(app.isDebug ? app.debugUrl : app.rootUrl) + '/user/vpdt/cong-tac/' + item.id}">${item.ten}</a></td>
            <td style="text-align:justify">${item.isOnline ? 'Trực tuyến' : item.dangKyPhongHop ? `Phòng ${item.tenPhongHop}` + (item.diaDiem ? `, ${item.diaDiem}` : '') : item.diaDiem}</td>
        </tr>
        `);
            return res;
        }).join('')}
        </tbody>`);
    };


    const userApproveOrDeclineRegisterNotification = (item, fromUserName, newTrangThai, toUsers, lyDo) => {
        try {
            const subTitle = `Cán bộ ${fromUserName} đã ${newTrangThai == 'TU_CHOI' ? 'từ chối' : 'xác nhận'} phiếu đăng ký công tác của bạn.`,
                iconColor = trangThaiCongTacTicketDict[newTrangThai].level,
                icon = 'fa-calendar-check-o',
                title = 'Lịch họp',
                htmlMessage = subTitle + (lyDo ? `<div style="white-space: break-spaces; margin-left: 20px">"${lyDo || ''}"</div>` : '');
            const link = (app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + `/user/vpdt/cong-tac/dang-ky/${item.id}`;
            const notification = { emailContent: { mailHtml: lichTemplate.replaceAll('{noi_dung_thong_bao}', htmlMessage).replaceAll('{table_task}', ''), mailText: '', mailTitle: '[HCMUSSH-EOFFICE]: Đăng ký công tác' }, subTitle, iconColor, icon, title, targetLink: link };
            createNotification(toUsers, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('userUpdateStatusNotification', error);
        }
    };

    const staffRequestNotification = (item, fromUserName, tenDonVi, toUsers) => {
        try {
            const subTitle = `Cán bộ ${fromUserName} đã gửi phiếu đăng ký công tác của đơn vị ${tenDonVi} từ ngày ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ngày ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')}`,
                iconColor = 'primary',
                icon = 'fa-calendar-check-o',
                title = 'Đăng ký công tác';
            const link = (app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + `/user/vpdt/cong-tac/dang-ky/${item.id}`;
            const email_message = `${subTitle}. Quý thầy/cô vui lòng nhấn vào <a href="${link}">đây</a> để truy cập`;
            const notification = { emailContent: { mailHtml: lichTemplate.replaceAll('{table_task}', fillSchedule(item.congTacItems, taskTableTemplate)).replaceAll('{noi_dung_thong_bao}', email_message), mailText: '', mailTitle: '[HCMUSSH-EOFFICE]: Đăng ký công tác' }, subTitle, iconColor, icon, title, targetLink: link };
            createNotification(toUsers, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('staffRequestNotification', error);
        }
    };

    const lichCensorNotification = (item, fromUserName, trangThai, lyDo, toUsers) => {
        try {
            const subTitle = `Cán bộ ${fromUserName} đã ${trangThai == 'TU_CHOI' ? 'từ chối' : 'duyệt'} lịch công tác từ ngày ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ngày ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')}`,
                iconColor = trangThai == 'TU_CHOI' ? 'danger' : 'success',
                icon = 'fa-calendar-check-o',
                title = 'Kiểm duyệt lịch công tác trường';
            const link = (app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + `/user/vpdt/lich-cong-tac/${item.id}`;
            const email_message = `${subTitle}${lyDo ? ` với lý do "${lyDo}"` : ''}. Quý thầy/cô vui lòng nhấn vào <a href="${link}">đây</a> để biết thêm chi tiết`;
            const notification = { emailContent: { mailHtml: lichTemplate.replaceAll('{noi_dung_thong_bao}', email_message).replaceAll('{table_task}', ''), mailText: '', mailTitle: '[HCMUSSH-EOFFICE]: Kiểm duyệt lịch công tác trường' }, subTitle, iconColor, icon, title, notificationCategory: 'LICH_CONG_TAC:' + item.id, targetLink: link };
            createNotification(toUsers, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('lichCensorNotification', error);
        }
    };

    const phongHopCensorNotification = (item, fromUserName, trangThai, lyDo, toUsers) => {
        try {
            const subTitle = `Cán bộ ${fromUserName} đã ${trangThai == 'TU_CHOI' ? 'từ chối' : 'duyệt'} đăng ký sử dụng phòng họp ${item.phongHopItem?.ten} cho "${item.ten}" của bạn`,
                iconColor = trangThai == 'TU_CHOI' ? 'danger' : 'success',
                icon = 'fa-calendar-check-o',
                title = 'Kiểm duyệt đăng ký phòng họp';
            const link = (app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + `/user/vpdt/cong-tac/${item.id}`;
            const email_message = `${subTitle.replace(`"${item.ten}"`, `<a href="${link}">"${item.ten}"</a>`)}${lyDo ? ` với lý do "${lyDo}"` : ''}`;
            const notification = { emailContent: { mailHtml: lichTemplate.replaceAll('{noi_dung_thong_bao}', email_message).replaceAll('{table_task}', ''), mailText: '', mailTitle: '[HCMUSSH-EOFFICE]: Kiểm duyệt đăng ký phòng họp' }, subTitle, iconColor, icon, title, notificationCategory: 'CONG_TAC_ITEM:' + item.id, targetLink: link };
            createNotification(toUsers, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('lichCensorNotification', error);
        }
    };

    const phongHopRequestNotification = (item, fromUserName, toUsers, update) => {
        try {
            const subTitle = update ? `Cán bộ ${fromUserName} đã thay đổi đăng ký sử dụng phòng họp cho "${item.ten}" với phòng ${item.phongHopItem?.ten} từ ${moment(new Date(item.batDau)).format('HH:mm, DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('HH:mm, DD/MM/YYYY')}` : `Cán bộ ${fromUserName} đã đăng ký sử dụng phòng họp ${item.phongHopItem?.ten} từ ${moment(new Date(item.batDau)).format('HH:mm, DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('HH:mm, DD/MM/YYYY')} cho "${item.ten}"`,
                iconColor = 'primary',
                icon = 'fa-calendar-check-o',
                title = 'Kiểm duyệt đăng ký phòng họp';
            const link = (app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + `/user/hcth/phong-hop-ticket?focusItem=${item.phongHopTicket.id}`;
            const email_message = `${subTitle.replace(`"${item.ten}"`, `<a href="${link}">"${item.ten}"</a>`)}`;
            const notification = { emailContent: { mailHtml: lichTemplate.replaceAll('{noi_dung_thong_bao}', email_message).replaceAll('{table_task}', ''), mailText: '', mailTitle: '[HCMUSSH-EOFFICE]: Kiểm duyệt đăng ký phòng họp' }, subTitle, iconColor, icon, title, notificationCategory: 'CONG_TAC_ITEM:' + item.id, targetLink: link };
            createNotification(toUsers, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('lichCensorNotification', error);
        }
    };

    const staffLichRequestCensorNotification = (item, fromUserName, toUsers) => {
        try {
            const subTitle = `Cán bộ ${fromUserName} đã trình kiểm duyệt lịch công tác từ ngày ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ngày ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')}`,
                iconColor = 'primary',
                icon = 'fa-calendar-check-o',
                title = 'Kiểm duyệt lịch công tác trường';
            const link = (app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + `/user/vpdt/lich-cong-tac/${item.id}`;
            const email_message = `${subTitle}. Quý thầy/cô vui lòng nhấn vào <a href="${link}">đây</a> để biết thêm chi tiết`;
            let tasks = item.ticketItems.flatMap(i => i.congTacItems);
            tasks.push(...item.directTasks);
            tasks = tasks.filter(i => i.trangThai != 'TU_CHOI');
            // tasks.sort((a, b) => b.batDau - a.batDau);
            const notification = { emailContent: { mailHtml: lichTemplate.replaceAll('{table_task}', fillSchedule(tasks, taskTableTemplate)).replaceAll('{noi_dung_thong_bao}', email_message), mailText: '', mailTitle: '[HCMUSSH-EOFFICE]: Kiểm duyệt lịch công tác' }, subTitle, iconColor, icon, title, notificationCategory: 'LICH_CONG_TAC:' + item.id, targetLink: link };
            createNotification(toUsers, notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('staffRequestCensor', error);
        }
    };

    const publishLichNotification = (item, toUsers) => {
        try {
            const subTitle = `Hệ thống văn phòng điện tử gửi đến quý Thầy/Cô lịch công tác trường từ ngày ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ngày ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')}`,
                iconColor = 'primary',
                icon = 'fa-calendar-check-o',
                title = 'Kiểm duyệt lịch công tác trường';
            const link = (app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn') + `/user/vpdt/lich-cong-tac/${item.id}`;
            const email_message = `${subTitle}. Quý thầy/cô vui lòng nhấn vào <a href="${link}">đây</a> để biết thêm chi tiết`;
            let tasks = item.ticketItems.flatMap(i => i.congTacItems);
            tasks.push(...item.directTasks);
            tasks = tasks.filter(i => i.trangThai != 'TU_CHOI');
            const notification = { emailContent: { bcc: toUsers.slice(1).toString(), mailHtml: lichTemplate.replaceAll('{table_task}', fillSchedule(tasks, taskTableTemplate)).replaceAll('{noi_dung_thong_bao}', email_message), mailText: '', mailTitle: '[HCMUSSH-EOFFICE]: Lịch công tác' }, subTitle, iconColor, icon, title, notificationCategory: 'LICH_CONG_TAC:' + item.id, targetLink: link };
            createNotification(toUsers.slice(0, 1), notification).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error('staffRequestCensor', error);
        }
    };

    const createNotification = async (emails, notification, done) => {
        const prmomises = [];
        emails.forEach(email => {
            notification.subTitle && prmomises.push(app.notification.send({
                toEmail: email,
                ...notification,
                icon: 'fa-calendar-check-o'
            }));
            if (notification.emailContent) {
                const { mailTitle, mailText, mailHtml, bcc = null } = notification.emailContent;
                if (app.isDebug)
                    prmomises.push(app.service.emailService.send('no-reply-eoffice@hcmussh.edu.vn', 'fromMailPassword', 'nqlong0709@gmail.com', null, 'long.nguyen0709@hcmut.edu.vn,superlong2017@gmail.com', mailTitle, mailText, mailHtml, null));
                else {
                    prmomises.push(app.service.emailService.send('no-reply-eoffice@hcmussh.edu.vn', 'fromMailPassword', email, null, bcc, mailTitle, mailText, mailHtml, null));
                }
            }
        });
        return await Promise.all(prmomises).then(() => done && done(null)).catch(error => done && done(error));
    };

    const getEmailFromShcc = async (shccs) => {
        const canBo = await app.model.tchcCanBo.getAll({
            statement: 'shcc in (:shccs)',
            parameter: { shccs }
        }, 'email', 'email');
        return canBo.map(i => i.email);
    };

    const getUserAvailableDepartments = (user) => {
        const data = new Set();
        user?.staff?.listChucVu?.forEach(i => {
            data.add(i.maDonVi);
        });
        user?.staff?.maDonVi && data.add(user?.staff?.maDonVi);
        return Array.from(data);
    };

    const getThanhPhanSummary = (thanhPhan = []) => {
        if (!thanhPhan) return '';
        let groupArray = thanhPhan.reduce((total, current) => {
            if (!total.length) {
                total.push([current]);
            } else {
                const sample = total[total.length - 1][0];
                if (sample.tenVietTatDonVi == current.tenVietTatDonVi) {
                    total[total.length - 1].push(current);
                } else {
                    total.push([current]);
                }
            }
            return total;
        }, []);
        const reduceGroup = (group) => {
            let result = group.map((current) => {
                let text = '';
                text += current.gioiTinh == '01' ? 'Ô. ' : 'B. ';
                text += current.tenCanBoNhan?.normalizedName();
                return text;
            }).join(', ');
            if (group[0].tenVietTatDonVi) {
                result += ` (${group[0].tenVietTatDonVi})`;
            }
            return result;
        };
        return groupArray.map(reduceGroup).join('; ');
    };

    return ({
        userAddNotification,
        userUpdateStatusNotification,
        userApproveOrDeclineRegisterNotification,
        userDailyMailNotification, publishLichNotification,
        getEmailFromShcc, getUserAvailableDepartments,
        vaiTroCanBo, vaiTroCanBoDict,
        trangThaiXacNhan, trangThaiXacNhanDict,
        trangThaiLichHop, trangThaiLichHopDict,
        trangThaiCongTacItem, trangThaiCongTacItemDict,
        trangThaiCongTacTicket, trangThaiCongTacTicketDict,
        trangThaiPhongHopTicket, trangThaiPhongHopTicketDict,
        trangThaiLichCongTac, trangThaiLichCongTacDict,
        staffLichRequestCensorNotification, lichCensorNotification, phongHopCensorNotification,
        staffRequestNotification, phongHopRequestNotification,
        resolveTrangThai, getThanhPhanSummary, adminStatisticNotification
    });

};