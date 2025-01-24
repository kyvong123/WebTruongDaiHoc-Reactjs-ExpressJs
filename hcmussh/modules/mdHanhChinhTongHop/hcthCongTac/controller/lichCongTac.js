module.exports = app => {
    const { lichCensorNotification, trangThaiCongTacTicketDict, trangThaiLichCongTacDict, getThanhPhanSummary, trangThaiCongTacItemDict, trangThaiLichCongTac, staffLichRequestCensorNotification, getEmailFromShcc, publishLichNotification } = require('../tools')(app);
    const { LichPermission } = require('../permissionClasses')(app);
    const moment = require('moment');
    const weekDays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

    app.get('/user/hcth/cong-tac/tong-hop/:id', app.permission.check('hcthCongTac:write'), app.templates.admin);

    app.get('/api/hcth/cong-tac/lich/download/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const item = await app.model.hcthLichCongTac.getItem(req.params.id);
            let tasks = item.ticketItems.flatMap(i => i.congTacItems);
            tasks.push(...item.directTasks);
            tasks = tasks.filter(i => i.trangThai != 'TU_CHOI');
            tasks.sort((a, b) => {
                const value = a.batDau - b.batDau;
                if (value != 0) return value;
                return a.id - b.id;
            });
            let dayTasks = tasks.reduce((total, item) => {
                const ngayBatDau = new Date(item.batDau);
                const dayInWeek = (ngayBatDau.getDay() + 6) % 7;
                const value = `${weekDays[dayInWeek]}, ngày ${moment(ngayBatDau).format('DD/MM/YYYY')}`;
                const data = { thanhPhan: item.banTheHienThanhPhan || getThanhPhanSummary(item.thanhPhan), gio: moment(new Date(item.batDau)).format('HH:mm'), noiDung: item.ten, diaDiem: item.isOnline ? item.duongDan : item.dangKyPhongHop ? 'Phòng ' + item.tenPhongHop + (item.diaDiem ? `, ${item.diaDiem}` : '') : item.diaDiem };
                const gio = new Date(item.batDau);
                const batDau = moment(gio);
                const ketThuc = moment(new Date(item.ketThuc));
                if (gio.getHours() >= 12) {
                    data.gioTrua = moment(new Date(item.batDau)).format('HH:mm') + '\r\n'.repeat(item.spaces);
                } else {
                    data.gioSang = moment(new Date(item.batDau)).format('HH:mm') + '\r\n'.repeat(item.spaces);
                }
                if (batDau.format('DD/MM/YYYY') == ketThuc.format('DD/MM/YYYY')) {
                    data.timeRange = '';
                } else {
                    data.timeRange = `(${batDau.format('DD/MM')} - ${ketThuc.format('DD/MM')})`;
                }
                if (total[value]) {
                    total[value].tasks.push(data);
                } else {
                    total[value] = {
                        ngayTask: value,
                        tasks: [data]
                    };
                }
                return total;
            }, {});
            const data = {
                ngayBatDau: moment(new Date(item.batDau)).format('DD-MM-YYYY'),
                ngayKetThuc: moment(new Date(item.ketThuc)).format('DD-MM-YYYY'),
                dayTasks: Object.values(dayTasks),
            };
            const luuY = await app.model.hcthLichCongTacNote.getAll({ lichId: item.id }, '*', 'id');
            if (luuY.length) {
                data.hasLuuY = { luuY };
            }
            const templatePath = app.path.join(app.assetPath, 'hcth', 'hcthCongTac', 'template.docx');
            let buffer = await app.docx.generateFile(templatePath, data);
            if (req.query.type == 'pdf') {
                buffer = await app.docx.toPdfBuffer(buffer);
                res.setHeader('Content-Type', 'application/pdf');
            } else {
                res.setHeader('Content-Disposition', 'attachment;filename=' + `lich cong tac ${data.ngayBatDau} den ${data.ngayKetThuc}.${req.query.type == 'pdf' ? 'pdf' : 'docx'}`);
            }
            return res.end(buffer);
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/lich/range/:startTime/:endTime', app.permission.check('user:login'), async (req, res) => {
        try {
            const items = await app.model.hcthLichCongTac.getItems(app.utils.stringify({
                startTime: Number(req.params.startTime),
                endTime: Number(req.params.endTime),
            })).then(i => i.rows).then(items => items.map(i => ({ ...i, thanhPhan: i.thanhPhan || '[]' })));
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });


    app.post('/api/hcth/cong-tac/lich', app.permission.check('hcthCongTac:write'), async (req, res) => {
        try {
            const { items, ...data } = req.body.data;
            const checkItem = await app.model.hcthCongTacTicket.get({
                statement: 'id in (:ids) and lichCongTacId is not null',
                parameter: {
                    ids: items
                }
            });
            if (checkItem) {
                const item = await app.model.hcthCongTacTicket.getItem(checkItem.id);
                throw `Lịch công tác từ ngày ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ngày ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')} tạo bởi ${item.nguoiTaoItem?.ho + item.nguoiTaoItem?.ten} đã được xử lý trước đó hoặc không phù hợp để tổng hợp`;
            }
            const shcc = req.session.user?.staff?.shcc;
            data.canBoKiemDuyet = app.utils.stringify(data.canBoKiemDuyet);
            const chainItem = await app.model.hcthChainItem.create({ loai: 'LICH_CONG_TAC', version: 1 }); //TODO: Long using chainItem createITem
            const item = await app.model.hcthLichCongTac.create({ ...data, nguoiTao: shcc, id: chainItem.id, trangThai: 'TONG_HOP' });
            await app.model.hcthCongTacTicket.update({
                statement: 'id in (:ids)',
                parameter: {
                    ids: items
                }
            }, { lichCongTacId: item.id, trangThai: trangThaiCongTacTicketDict.DANG_XU_LY.id });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/lich', app.permission.check('hcthCongTac:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const lich = await app.model.hcthLichCongTac.getItem(id);
            if (!new LichPermission(lich, req.session.user).isEditable()) {
                throw 'Thao tác không hợp lệ';
            }
            changes.canBoKiemDuyet = app.utils.stringify(changes.canBoKiemDuyet);
            await app.model.hcthLichCongTac.update({ id }, changes);
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/lich/revoke', app.permission.check('hcthCongTac:manage'), async (req, res) => {
        try {
            const { id } = req.body;
            const lich = await app.model.hcthLichCongTac.getItem(id);
            if (!new LichPermission(lich, req.session.user).isRevokable()) {
                throw 'Thao tác không hợp lệ';
            }
            await app.model.hcthLichCongTac.update({ id }, { trangThai: 'TONG_HOP' });
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/lich/add', app.permission.check('hcthCongTac:write'), async (req, res) => {
        try {
            const { id, ticketId } = req.body.data;
            const lich = await app.model.hcthLichCongTac.getItem(id);
            const ticket = await app.model.hcthCongTacTicket.getItem(ticketId);
            if (!new LichPermission(lich, req.session.user).isEditable() || ticket.trangThai != 'DA_NHAN') {
                throw 'Thao tác không hợp lệ';
            }
            await app.model.hcthCongTacTicket.update({ id: ticket.id }, { trangThai: trangThaiCongTacTicketDict.DANG_XU_LY.id, lichCongTacId: lich.id });
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const roomCheck = (tasks) => {
        const roomData = tasks.reduce((total, current) => {
            if (current.phongHop) {
                if (!total[current.phongHop])
                    total[current.phongHop] = [current];
                else {
                    total[current.phongHop].push(current);
                }
            }
            return total;
        }, {});
        Object.values(roomData).forEach(roomTasks => {
            roomTasks.sort((a, b) => a.batDau - b.batDau);
            roomTasks.forEach((task, index) => {
                const remainTasks = roomTasks.slice(index + 1);
                if (!remainTasks.length) return;
                for (const otherTask of remainTasks) {
                    if (otherTask.batDau >= task.ketThuc)
                        break;
                    if (otherTask.batDau < task.ketThuc) {
                        task.problems.push({ type: 'Trùng thời gian sử dụng phòng', with: otherTask.id, level: 'danger' });
                        otherTask.problems.push({ type: 'Trùng thời gian sử dụng phòng', with: task.id, level: 'danger' });
                    }
                }
            });
        });
        return roomData;
    };


    const staffCheck = (tasks) => {
        const staffData = tasks.reduce((total, current) => {
            current.thanhPhan?.forEach(staff => {
                if (staff.shcc) {
                    if (!total[staff.shcc])
                        total[staff.shcc] = [current];
                    else {
                        total[staff.shcc].push(current);
                    }
                }
            });
            return total;
        }, {});
        Object.entries(staffData).forEach(([staff, staffTasks]) => {
            staffTasks.sort((a, b) => a.batDau - b.batDau);
            staffTasks.forEach((task, index) => {
                const remainTasks = staffTasks.slice(index + 1);
                if (!remainTasks.length) return;
                for (const otherTask of remainTasks) {
                    if (otherTask.batDau >= task.ketThuc)
                        break;
                    if (otherTask.batDau < task.ketThuc) {
                        task.problems.push({ type: 'Trùng thời gian tham gia công tác', with: otherTask.id, staff, level: 'danger' });
                        otherTask.problems.push({ type: 'Trùng thời gian tham gia công tác', with: task.id, staff, level: 'danger' });
                    }
                }
            });
        });
        Object.entries(staffData).forEach(([staff, staffTasks]) => {
            const taskByDay = staffTasks.reduce((total, current) => {
                const day = moment(new Date(current.batDau)).format('DD/MM/YYYY');
                if (!total[day]) {
                    total[day] = [current];
                } else {
                    total[day].push(current);
                }
                return total;
            }, {});
            Object.values(taskByDay).forEach((tasks) => {
                const checkList = tasks.slice(1).map((i, index) => [i, tasks[index]]);
                checkList.forEach(([nextTask, task]) => {
                    const staffItem = task.thanhPhan.find(i => i.shcc == staff);
                    const staffName = `${staffItem.hoCanBoNhan || ''} ${staffItem.tenCanBoNhan || ''}`.normalizedName();
                    if (nextTask.phongHop && task.phongHop && nextTask.coSoPhongHop == task.coSoPhongHop) {
                        return;
                    } else if (nextTask.isOnline || task.isOnline) {
                        return;
                    } else if (nextTask.phongHop && task.phongHop && nextTask.coSoPhongHop != task.coSoPhongHop) {
                        if (nextTask.batDau - task.ketThuc <= 3600 * 1000) {
                            nextTask.problems.push({ message: `Lưu ý thời gian di chuyển giữa 2 cơ sở của cán bộ ${staffName}`, type: 'Thời gian di chuyển', staff, level: 'warning', with: task.id });
                        }
                    } else {
                        nextTask.problems.push({ message: `Lưu ý thời gian di chuyển của cán bộ ${staffName}`, type: 'Thời gian di chuyển', staff, level: 'warning', with: task.id });
                    }
                });
            });
        });
        return staffData;
    };


    app.get('/api/hcth/cong-tac/lich/censors', app.permission.check('hcthCongTac:manage'), async (req, res) => {
        try {
            res.send({ items: await app.model.hcthLichCongTac.getCensorsStaff() });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/lich/preview', app.permission.orCheck('hcthCongTac:write'), async (req, res) => {
        try {
            let tickets = await app.model.hcthCongTacTicket.getAll({
                statement: 'trangThai in (:trangThaiList)',
                parameter: { trangThaiList: ['DA_NHAN', 'DANG_XU_LY', 'DA_GUI'] }
            });
            tickets = await Promise.all(tickets.map(i => app.model.hcthCongTacTicket.getItem(i.id).then(item => ({ ...i, ...item }))));
            let tasks = tickets.flatMap(i => i.congTacItems);
            tasks.forEach(i => (i.problems = []));
            roomCheck(tasks.filter(i => i.trangThai != 'TU_CHOI'));
            staffCheck(tasks.filter(i => i.trangThai != 'TU_CHOI'));
            res.send({ tasks, tickets });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/lich/:id', app.permission.orCheck('hcthCongTac:write', 'staff:login'), async (req, res) => {
        try {
            const item = await app.model.hcthLichCongTac.getItem(req.params.id);
            if (!new LichPermission(item, req.session.user).isReadable()) {
                throw 'Permission denied';
            }
            const tasks = item.ticketItems.flatMap(i => i.congTacItems);
            tasks.push(...item.directTasks);
            tasks.forEach(i => (i.problems = []));
            roomCheck(tasks.filter(i => i.trangThai != 'TU_CHOI'));
            staffCheck(tasks.filter(i => i.trangThai != 'TU_CHOI'));
            res.send({ item, tasks });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/lich/publish', app.permission.check('hcthCongTac:manage'), async (req, res) => {
        try {
            const { id } = req.body;
            let item = await app.model.hcthLichCongTac.getItem(id);
            await app.model.hcthLichCongTac.update({ id: item.id }, { trangThai: trangThaiLichCongTacDict.DA_PHAT_HANH.id });
            let tasks = item.ticketItems.flatMap(i => i.congTacItems);
            tasks.push(...item.directTasks);
            tasks = tasks.filter(i => i.trangThai != 'TU_CHOI');
            await app.model.hcthCongTacTicket.update({
                statement: 'id in (:ids) and trangThai = :trangThai',
                parameter: {
                    ids: item.ticketItems.map(i => i.id),
                    trangThai: 'DANG_XU_LY',
                }
            }, { trangThai: 'HOAN_TAT' });
            await app.model.hcthCongTacItem.update({
                statement: 'id in (:tasksId) and trangThai != :trangThai',
                parameter: {
                    tasksId: tasks.map(i => i.id),
                    trangThai: trangThaiCongTacItemDict.TU_CHOI.id
                },
            }, { trangThai: trangThaiCongTacItemDict.DUYET.id }).catch(error => console.error('update hcthCongTacItem error', error));
            publishNotification(item);

            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    const publishNotification = async (item) => {
        try {
            const deparmentsEmail = ['vankhoaussh@hcmussh.edu.vn', 'vunguyenanh@hcmussh.edu.vn', 'baotang@hcmussh.edu.vn', 'nnh@hcmussh.edu.vn', 'itadep@hcmussh.edu.vn', 'nguvantaybannha@hcmussh.edu.vn', 'dulich@hcmussh.edu.vn', 'luutru@hcmussh.edu.vn', 'doanhnghiep@hcmussh.edu.vn', 'buihaphuong81@hcmussh.edu.vn', 'haidangbui@hcmussh.edu.vn', 'buihanhquyen@hcmussh.edu.vn', 'bttnga@hcmussh.edu.vn', 'bthang@hcmussh.edu.vn', 'vinhthai@hcmussh.edu.vn', 'chauthuy@hcmussh.edu.vn', 'ctpdung@hcmussh.edu.vn', 'caonga@hcmussh.edu.vn', 'caoxuanlong@hcmussh.edu.vn', 'quangchien@hcmussh.edu.vn', 'csthuduc@hcmussh.edu.vn', 'congdoan@hcmussh.edu.vn', 'congtacsinhvien@hcmussh.edu.vn', 'phamthihongcuc@hcmussh.edu.vn', 'danghoanglan0708@hcmussh.edu.vn', 'danguy@hcmussh.edu.vn', 'daotuanhau@hcmussh.edu.vn', 'giangdl@hcmussh.edu.vn', 'dothinga@hcmussh.edu.vn', 'dtthuyhang@hcmussh.edu.vn', 'doantn@hcmussh.edu.vn', 'ducnhat@hcmussh.edu.vn', 'locttnctg@hcmussh.edu.vn', 'duongthanhthong@hcmussh.edu.vn', 'duongchi@hcmussh.edu.vn', 'tudv@hcmussh.edu.vn', 'era@hcmussh.edu.vn', 'hcth@hcmussh.edu.vn', 'vanhokhanh@hcmussh.edu.vn', 'quangho@hcmussh.edu.vn', 'maikhanhhoang@hcmussh.edu.vn', 'hoangngocminhchau@hcmussh.edu.vn', 'tranghoangws@hcmussh.edu.vn', 'ccb.ussh@hcmussh.edu.vn', 'hsv@hcmussh.edu.vn', 'youthcoop@hcmussh.edu.vn', 'tranthanhhuong@hcmussh.edu.vn', 'daohuynh@hcmussh.edu.vn', 'hmtuan@hcmussh.edu.vn', 'hnthu76@hcmussh.edu.vn', 'phuonganhjps@hcmussh.edu.vn', 'honghanhht@hcmussh.edu.vn', 'tronghienjapan@hcmussh.edu.vn', 'huynhvanchan@hcmussh.edu.vn', 'finceo@hcmussh.edu.vn', 'baochi@hcmussh.edu.vn', 'ctxh@hcmussh.edu.vn', 'dialy@hcmussh.edu.vn', 'dothihoc@hcmussh.edu.vn', 'dongphuonghoc@hcmussh.edu.vn', 'giaoduc@hcmussh.edu.vn', 'hanquoc@hcmussh.edu.vn', 'fis@hcmussh.edu.vn', 'lichsu@hcmussh.edu.vn', 'nguvanduc@hcmussh.edu.vn', 'nguvannga@hcmussh.edu.vn', 'nguvanphap@hcmussh.edu.vn', 'khoatbnita@hcmussh.edu.vn', 'nguvantrung@hcmussh.edu.vn', 'nhanhoc@hcmussh.edu.vn', 'nhatban@hcmussh.edu.vn', 'qhqt@hcmussh.edu.vn', 'tamlyhoc@hcmussh.edu.vn', 'thuvienthongtin@hcmussh.edu.vn', 'triethoc@hcmussh.edu.vn', 'vanhoahoc@hcmussh.edu.vn', 'vanhoc_ngonngu@hcmussh.edu.vn', 'vietnamhoc@hcmussh.edu.vn', 'xahoihoc@hcmussh.edu.vn', 'kingsejonghcm6@hcmussh.edu.vn', 'lathithanhphung@hcmussh.edu.vn', 'baotram@hcmussh.edu.vn', 'lehoangdung@hcmussh.edu.vn', 'lehongphuoc@hcmussh.edu.vn', 'thaolp@hcmussh.edu.vn', 'lequangtruong@hcmussh.edu.vn', 'hoalethanh@hcmussh.edu.vn', 'mailien.lethi@hcmussh.edu.vn', 'lethingocdiep@hcmussh.edu.vn', 'sinhhien.fos@hcmussh.edu.vn', 'mackhai@hcmussh.edu.vn', 'vinhletrong@hcmussh.edu.vn', 'lecongctxh@hcmussh.edu.vn', 'lexuangiao@hcmussh.edu.vn', 'lvanhdung@hcmussh.edu.vn', 'luuvanquyet@hcmussh.edu.vn', 'mkimchi@hcmussh.edu.vn', 'kimkhanhmai@hcmussh.edu.vn', 'duongminhquang@hcmussh.edu.vn', 'quynhnga@hcmussh.edu.vn', 'anhdao81@hcmussh.edu.vn', 'thanhan@hcmussh.edu.vn', 'ngohuyen@hcmussh.edu.vn', 'ngophuonglan@hcmussh.edu.vn', 'thutrangnt@hcmussh.edu.vn', 'ngotienquan81@hcmussh.edu.vn', 'ngotuanphuong@hcmussh.edu.vn', 'ngoctrinh@hcmussh.edu.vn', 'nguvananh@hcmussh.edu.vn', 'nguyenbachquynhchi@hcmussh.edu.vn', 'mylannh@hcmussh.edu.vn', 'nguyenhoangphuong@hcmussh.edu.vn', 'hoangtrung@hcmussh.edu.vn', 'nguyen1975hongphan@hcmussh.edu.vn', 'nguyenhuynhlam@hcmussh.edu.vn', 'minhthuynguyen@hcmussh.edu.vn', 'caonguyendinh@hcmussh.edu.vn', 'nguyendangnguyen@hcmussh.edu.vn', 'nguyen.nunguyetanh@hcmussh.edu.vn', 'vietngan@hcmussh.edu.vn', 'nguyentangnghifir@hcmussh.edu.vn', 'thanhhuyng@hcmussh.edu.vn', 'thanhtuan@hcmussh.edu.vn', 'thaochinguyen@hcmussh.edu.vn', 'hanguyen@hcmussh.edu.vn', 'bichphuongnt@hcmussh.edu.vn', 'haonguyenpy2@hcmussh.edu.vn', 'nguyenchau@hcmussh.edu.vn', 'nguyenthihue@hcmussh.edu.vn', 'nguyenthikimchau@hcmussh.edu.vn', 'kimloanctsv@hcmussh.edu.vn', 'lynguyen.hcmussh@gmail.com', 'nguyenngochanh@hcmussh.edu.vn', 'nguyenthingockhanh@hcmussh.edu.vn', 'nhungoc@hcmussh.edu.vn', 'nguyenphuong@hcmussh.edu.vn', 'phuongmai@hcmussh.edu.vn', 'ntthanhha@hcmussh.edu.vn', 'tunguyen.fmm@hcmussh.edu.vn', 'nguyenthithuy@hcmussh.edu.vn', 'duyenussh@hcmussh.edu.vn', 'nguyenthivanhanh@hcmussh.edu.vn', 'baunv@hcmussh.edu.vn', 'hiepnguyen@hcmussh.edu.vn', 'phainvfir@hcmussh.edu.vn', 'tuongnguyen@hcmussh.edu.vn', 'nguyenvohoangmai@hcmussh.edu.vn', 'huongchinv@hcmussh.edu.vn', 'ngxuananh@hcmussh.edu.vn', 'nhanlacan@hcmussh.edu.vn', 'ncnb@hcmussh.edu.vn', 'nthai@hcmussh.edu.vn', 'ntnkhanh@hcmussh.edu.vn', 'oce@hcmussh.edu.vn', 'phamduyphuc@hcmussh.edu.vn', 'phamhonghai@hcmussh.edu.vn', 'thuyvitw@hcmussh.edu.vn', 'phamtanha@hcmussh.edu.vn', 'duy.pham@hcmussh.edu.vn', 'thoipham@hcmussh.edu.vn', 'pham.ngoc@hcmussh.edu.vn', 'phamthuynguyet@hcmussh.edu.vn', 'trangpham@hcmussh.edu.vn', 'truongtho204@hcmussh.edu.vn', 'phananhtu@hcmussh.edu.vn', 'hungphanmanh@hcmussh.edu.vn', 'phanthanhdinh@hcmussh.edu.vn', 'anhthu@hcmussh.edu.vn', 'xuan.pth@hcmussh.edu.vn', 'testassess@hcmussh.edu.vn', 'phongdaotao@hcmussh.edu.vn', 'tccb@hcmussh.edu.vn', 'phucle@hcmussh.edu.vn', 'qlkh_da@hcmussh.edu.vn', 'qttb@hcmussh.edu.vn', 'saudaihoc@hcmussh.edu.vn', 'thaivandong@hcmussh.edu.vn', 'ttpc@hcmussh.edu.vn', 'thuvien@hcmussh.edu.vn', 'tokiemtoan@hcmussh.edu.vn', 'toxe@hcmussh.edu.vn', 'trantien@hcmussh.edu.vn', 'tranbahung@hcmussh.edu.vn', 'tdminh@hcmussh.edu.vn', 'hoatranhtran@hcmussh.edu.vn', 'trannam@hcmussh.edu.vn', 'tranthanhhuong@hcmussh.edu.vn', 'anhthutranthi@hcmussh.edu.vn', 'tvthang09@hcmussh.edu.vn', 'letrieuthanh@hcmussh.edu.vn', 'huyentth@hcmussh.edu.vn', 'ttdtptnnl@hcmussh.edu.vn', 'cpsd@hcmussh.edu.vn', 'thaicenter@hcmussh.edu.vn', 'aseancenter@hcmussh.edu.vn', 'mhrs@hcmussh.edu.vn', 'huongnghiepnhanvan@hcmussh.edu.vn', 'acss@hcmussh.edu.vn', 'giaquyen@hcmussh.edu.vn', 'truonghoangtruong@hcmussh.edu.vn', 'hoidongtruong@hcmussh.edu.vn', 'lamha@hcmussh.edu.vn', 'lamha@hcmussh.edu.vn', 'hangtruong@hcmussh.edu.vn', 'cie@hcmussh.edu.vn', 'tthqhoc@hcmussh.edu.vn', 'huongnghiepnhanvan@hcmussh.edu.vn', 'crd-su@hcmussh.edu.vn', 'hcmcois@hcmussh.edu.vn', 'css@hcmussh.edu.vn', 'crshcm@hcmussh.edu.vn', 'cvseas@hcmussh.edu.vn', 'cfl@hcmussh.edu.vn', 'tttinhoc@hcmussh.edu.vn', 'ttvanhoahoc@hcmussh.edu.vn', 'dulichvankhoa@hcmussh.edu.vn', 'havan.fos@hcmussh.edu.vn', 'vbnguyen@hcmussh.edu.vn', 'thinh.vo@hcmussh.edu.vn', 'vothanhtuyen@hcmussh.edu.vn', 'huynhnhu@hcmussh.edu.vn', 'nuanhvo@hcmussh.edu.vn', 'senvv@hcmussh.edu.vn', 'vhphong@hcmussh.edu.vn', 'vutoan@hcmussh.edu.vn', 'yte@hcmussh.edu.vn'];
            let tasks = item.ticketItems.flatMap(i => i.congTacItems);
            tasks.push(...item.directTasks);
            tasks = tasks.filter(i => i.trangThai != 'TU_CHOI');
            const users = tasks.flatMap(i => i.thanhPhan || []).map(i => i.shcc);
            const emails = await getEmailFromShcc(users);
            const finalEmails = Array.from(new Set([emails, deparmentsEmail].flat()));
            const chunks = finalEmails.chunk(30);
            // console.log(chunks.map(i => i.toString().length));
            chunks.forEach(chunk => publishLichNotification(item, chunk));
        } catch (error) {
            console.error(error);
        }
    };

    app.get('/api/hcth/cong-tac/lich/notify/:id', app.permission.check('hcthCongTac:notify'), async (req, res) => {
        try {
            const item = await app.model.hcthLichCongTac.getItem(req.params.id);
            publishNotification(item);
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
        }
    });

    app.put('/api/hcth/cong-tac/lich/request', app.permission.check('hcthCongTac:manage'), async (req, res) => {
        try {
            const { id, canBoKiemDuyet } = req.body;
            let item = await app.model.hcthLichCongTac.getItem(id);
            if (!trangThaiLichCongTac.filter(i => i.canRequest).map(i => i.id).includes(item.trangThai)) {
                throw 'Lịch công tác không thể duyệt khi ở trạng thái ' + (trangThaiLichCongTacDict[item.trangThai]?.text ?? 'này');
            }
            const tasks = item.ticketItems.flatMap(i => i.congTacItems);
            const invalidTask = tasks.find(i => i.trangThai == 'DANG_KY' && i.trangThaiPhongHopTicket && i.trangThaiPhongHopTicket != 'DA_DUYET');
            if (invalidTask) {
                throw 'Danh sách công tác tồn tại đăng ký phòng họp chưa được duyệt';
            }
            item = await app.model.hcthLichCongTac.update({ id: item.id }, { trangThai: trangThaiLichCongTacDict.KIEM_DUYET.id });
            const shcc = canBoKiemDuyet;
            if (shcc) {
                const userName = `${req.session.user?.lastName || ''} ${req.session.user?.firstName || ''}`.trim().normalizedName();
                const email = await getEmailFromShcc(shcc);
                item = await app.model.hcthLichCongTac.getItem(item.id);
                staffLichRequestCensorNotification(item, userName, email);
            }
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/lich/censor', app.permission.orCheck('hcthCongTac:manage', 'staff:login'), async (req, res) => {
        try {
            let { id, approve, decline, lyDo } = req.body;
            let item = await app.model.hcthLichCongTac.get({ id });
            if (!new LichPermission(item, req.session.user).isCensorable()) {
                throw 'permission denied';
            }
            approve = Number(approve); decline = Number(decline);
            if (approve) {
                item = await app.model.hcthLichCongTac.update({ id: item.id }, { trangThai: trangThaiLichCongTacDict.DA_DUYET.id, kiemDuyetBoi: req.session.user.shcc });
            } else if (decline) {
                if (!lyDo) {
                    throw 'Vui lòng nhập lý do';
                }
                item = await app.model.hcthLichCongTac.update({ id: item.id }, { trangThai: trangThaiLichCongTacDict.TU_CHOI.id, lyDoTuChoi: lyDo, kiemDuyetBoi: req.session.user.shcc });
            }
            const userName = `${req.session.user?.lastName || ''} ${req.session.user?.firstName || ''}`.trim().normalizedName();
            item = await app.model.hcthLichCongTac.getItem(item.id);
            lichCensorNotification(item, userName, item.trangThai, lyDo, await getEmailFromShcc([item.nguoiTao]));
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/lich/page/:pageNumber/:pageSize', app.permission.orCheck('hcthCongTac:read', 'staff:login'), async (req, res) => {
        try {
            const permissions = req.session.user.permissions;
            const _pageNumber = parseInt(req.params.pageNumber);
            const _pageSize = parseInt(req.params.pageSize);
            const filterData = req.query.filter;
            if (!permissions.includes('hcthCongTac:read')) {
                filterData.isAdmin = 0;
            }
            if (!permissions.includes('rectors:login')) {
                filterData.isRectors = 0;
            }
            filterData.userShcc = req.session.user?.staff?.shcc;
            const pageCondition = req.query.condition;
            const page = await app.model.hcthLichCongTac.searchPage(_pageNumber, _pageSize, app.utils.stringify(filterData), pageCondition);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });


    app.post('/api/hcth/cong-tac/lich/luu-y', app.permission.check('hcthCongTac:write'), async (req, res) => {
        try {
            const { noiDung, lichId } = req.body.data;
            const item = await app.model.hcthLichCongTacNote.create({ lichId, noiDung });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/cong-tac/lich/luu-y/:lichId', app.permission.check('hcthCongTac:write'), async (req, res) => {
        try {
            res.send({ items: await app.model.hcthLichCongTacNote.getAll({ lichId: req.params.lichId }, '*', 'id') });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/cong-tac/lich/luu-y', app.permission.check('hcthCongTac:write'), async (req, res) => {
        try {
            const { noiDung, noteId } = req.body.data;
            const item = await app.model.hcthLichCongTacNote.update({ id: noteId }, { noiDung });
            res.send({ item });
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

    app.delete('/api/hcth/cong-tac/lich/luu-y', app.permission.check('hcthCongTac:write'), async (req, res) => {
        try {
            const { noteId } = req.body;
            await app.model.hcthLichCongTacNote.delete({ id: noteId });
            res.send({});
        } catch (error) {
            console.error(req.originalUrl, error);
            res.send({ error });
        }
    });

};
