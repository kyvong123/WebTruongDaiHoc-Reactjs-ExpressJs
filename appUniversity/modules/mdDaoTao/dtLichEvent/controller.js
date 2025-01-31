module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7045: {
                title: 'Quản lý sự kiện', link: '/user/dao-tao/lich-event',
                groupIndex: 0, parentKey: 7029,
                icon: 'fa-microphone', backgroundColor: '#0079FF'
            }
        }
    };
    app.permission.add(
        { name: 'dtLichEvent:manage', menu },
        { name: 'dtLichEvent:write' },
        { name: 'dtLichEvent:delete' },
        { name: 'dtLichEvent:export' },
    );

    app.get('/user/dao-tao/lich-event', app.permission.check('dtLichEvent:manage'), app.templates.admin);
    app.get('/user/dao-tao/lich-event/item/:id', app.permission.check('dtLichEvent:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtLichEvent', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtLichEvent:manage', 'dtLichEvent:write', 'dtLichEvent:delete', 'dtLichEvent:export');
            resolve();
        }
        else resolve();
    }));

    //APIs----------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/lich-event/page/:pageNumber/:pageSize', app.permission.check('dtLichEvent:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichEvent.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lich-event/all', app.permission.check('dtLichEvent:manage'), async (req, res) => {
        try {
            const data = await app.model.dtLichEvent.getAll({});
            res.send({ data: data });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lich-event/check-ngay-le', app.permission.check('dtLichEvent:manage'), async (req, res) => {
        try {
            let { ngayBatDau, soTuanLap } = req.query,
                listTuanTrung = [];
            for (let i = 0; i < parseInt(soTuanLap); i++) {
                let listNgayLe = await app.model.dmNgayLe.getAll({ kichHoat: 1, ngay: parseInt(ngayBatDau) + 604800000 * i });
                if (listNgayLe.length) listTuanTrung.push(parseInt(ngayBatDau) + 604800000 * i);
            }
            res.send({ listTuanTrung });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/lich-event', app.permission.check('dtLichEvent:write'), async (req, res) => {
        try {
            let i = 0,
                { changes } = req.body, user = req.session.user,
                userModified = user.email, timeModified = Date.now(),
                { ngayBatDau, ten, thoiGianBatDau, thoiGianKetThuc, soTuanLap, coSo, phong, ghiChu, khoa, lop, tietBatDau, soTiet, giangVien } = changes;
            soTuanLap = parseInt(soTuanLap);

            const baseEvent = await app.model.dtBaseLichEvent.create({ tenSuKien: ten, coSo, ngayBatDau, tietBatDau, soTiet, soTuanLap, phong, khoa, lop, giangVien, ghiChu, userModified, timeModified });

            while (i < soTuanLap) {
                let listNgayLe = await app.model.dmNgayLe.getAll({ kichHoat: 1, ngay: parseInt(ngayBatDau) + 604800000 * i });
                if (listNgayLe.length) soTuanLap++;
                else {
                    let data = {
                        ten, coSo, phong, ghiChu, khoa, lop, tietBatDau, soTiet, giangVien,
                        userModified, timeModified,
                        thoiGianBatDau: parseInt(thoiGianBatDau) + 604800000 * i,
                        thoiGianKetThuc: parseInt(thoiGianKetThuc) + 604800000 * i,
                        idEvent: baseEvent.id,
                    };
                    await app.model.dtLichEvent.create(data);
                }
                i++;
            }
            res.send();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/lich-event', app.permission.check('dtLichEvent:write'), async (req, res) => {
        try {
            let { id, changes } = req.body, user = req.session.user;
            changes.userModified = user.email;
            changes.timeModified = Date.now();
            await app.model.dtLichEvent.update({ id }, changes);
            res.send();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/lich-event', app.permission.check('dtLichEvent:delete'), async (req, res) => {
        try {
            let id = req.body.id;
            await Promise.all([
                app.model.dtBaseLichEvent.delete({ id }),
                app.model.dtLichEvent.delete({ idEvent: id })
            ]);
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const getFullDateTime = async (value) => {
        try {
            if (value == null || value == -1) return;
            const d = new Date(value);
            const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
            const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
            const year = d.getFullYear();
            const hours = ('0' + d.getHours()).slice(-2);
            const minutes = ('0' + d.getMinutes()).slice(-2);
            return `${date}/${month}/${year}  ${hours}:${minutes} `;
        } catch (error) {
            return error;
        }
    };

    app.get('/api/dt/lich-event/download', app.permission.check('dtLichEvent:export'), async (req, res) => {
        try {
            let { tuNgay, denNgay } = req.query;

            const workBook = app.excel.create(),
                workSheet = workBook.addWorksheet('Lich_su_kien');

            let list = await app.model.dtLichEvent.timeDownload(app.utils.stringify(app.clone({ tuNgay, denNgay }))),
                cells = [
                    { cell: 'A1', value: 'TÊN SỰ KIỆN', bold: true, border: '1234' },
                    { cell: 'B1', value: 'CƠ SỞ', bold: true, border: '1234' },
                    { cell: 'C1', value: 'PHÒNG', bold: true, border: '1234' },
                    { cell: 'D1', value: 'THỜI GIAN BẮT ĐẦU', bold: true, border: '1234' },
                    { cell: 'E1', value: 'THỜI GIAN KẾT THÚC', bold: true, border: '1234' },
                    { cell: 'F1', value: 'TỪ TIẾT - ĐẾN TIẾT', bold: true, border: '1234' },
                    { cell: 'G1', value: 'KHOA', bold: true, border: '1234' },
                    { cell: 'H1', value: 'LỚP', bold: true, border: '1234' },
                    { cell: 'I1', value: 'CÁN BỘ', bold: true, border: '1234' },
                    { cell: 'J1', value: 'GHI CHÚ', bold: true, border: '1234' },
                ];

            for (let [index, item] of list.rows.entries()) {
                let thoiGianBatDau = await getFullDateTime(item.thoiGianBatDau),
                    thoiGianKetThuc = await getFullDateTime(item.thoiGianKetThuc);

                cells.push({ cell: 'A' + (index + 2), border: '1234', value: item.ten });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: app.utils.parse(item.tenCoSo, { vi: '' })?.vi });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.phong });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: thoiGianBatDau });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: thoiGianKetThuc });
                cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.thoiGian == ' - ' ? '' : item.thoiGian });
                cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenKhoa });
                cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.lop });
                cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.giangVien });
                cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.ghiChu });
            }

            app.excel.write(workSheet, cells);
            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/lich-event/data', app.permission.check('dtLichEvent:manage'), async (req, res) => {
        try {
            let { idEvent } = req.query;
            let [dataLich, baseEvent] = await Promise.all([
                app.model.dtLichEvent.getData(idEvent),
                app.model.dtLichEvent.searchPage(1, 10, app.utils.stringify({ idEvent, sortKey: '', sortMode: 'ASC' }), '')
            ]);

            res.send({ dataLich: dataLich.rows, baseEvent: baseEvent.rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dt/lich-event/item', app.permission.check('dtLichEvent:manage'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.dtLichEvent.delete({ id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/lich-event/new', app.permission.check('dtLichEvent:write'), async (req, res) => {
        try {
            let i = 0,
                { changes, idEvent } = req.body, user = req.session.user,
                userModified = user.email, timeModified = Date.now(),
                { ngayBatDau, ten, thoiGianBatDau, thoiGianKetThuc, soTuanLap, coSo, phong, ghiChu, khoa, lop, tietBatDau, soTiet, giangVien } = changes;
            soTuanLap = parseInt(soTuanLap);

            await app.model.dtBaseLichEvent.update({ id: idEvent }, { tenSuKien: ten, coSo, ngayBatDau, tietBatDau, soTiet, soTuanLap, phong, khoa, lop, giangVien, ghiChu, userModified, timeModified });

            while (i < soTuanLap) {
                let listNgayLe = await app.model.dmNgayLe.getAll({ kichHoat: 1, ngay: parseInt(ngayBatDau) + 604800000 * i });
                if (listNgayLe.length) soTuanLap++;
                else {
                    let data = {
                        ten, coSo, phong, ghiChu, khoa, lop, tietBatDau, soTiet, giangVien,
                        userModified, timeModified,
                        thoiGianBatDau: parseInt(thoiGianBatDau) + 604800000 * i,
                        thoiGianKetThuc: parseInt(thoiGianKetThuc) + 604800000 * i,
                        idEvent,
                    };
                    await app.model.dtLichEvent.create(data);
                }
                i++;
            }
            res.send();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};