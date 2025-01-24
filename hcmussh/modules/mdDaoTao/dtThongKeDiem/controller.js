module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7098: {
                title: 'Thống kê điểm', pin: true, backgroundColor: '#FFA96A', color: '#000',
                link: '/user/dao-tao/grade-manage/thong-ke-diem', icon: 'fa-table',
                parentKey: 7047
            },
        },
    };

    app.permission.add(
        { name: 'dtThongKeDiem:manage', menu },
        { name: 'dtThongKeDiem:avr', menu },
        { name: 'dtThongKeDiem:export' }
    );

    app.get('/user/dao-tao/grade-manage/thong-ke-diem', app.permission.orCheck('dtThongKeDiem:manage', 'dtThongKeDiem:avr'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/thong-ke-diem/page/:pageNumber/:pageSize', app.permission.orCheck('dtThongKeDiem:manage', 'dtThongKeDiem:avr'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

            let filter = req.query.filter || {}, sort = filter.sort;

            await app.model.dtAssignRole.getDataRole('dtThongKeDiem', req.session.user, filter);

            let listSemester = [], { tuSemester, denSemester } = filter;

            if (tuSemester == denSemester) listSemester.push(tuSemester);
            else {
                listSemester = await app.model.dtSemester.getAll({
                    statement: 'ma BETWEEN :tuSemester AND :denSemester',
                    parameter: { tuSemester, denSemester },
                }, 'ma', 'ma ASC').then(data => data.map(i => i.ma));
            }
            listSemester = listSemester.join(',');
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }, { listSemester }));

            let page = await app.model.dtLichSuDkhp.thongKeDiemTrungBinhSearchPage(_pageNumber, _pageSize, filter, searchTerm);

            page.rows = page.rows.map(item => {
                if (item.stringTl == null) {
                    item.avrTlHocKy = '0.00';
                    item.tinChiQt = '0';
                    item.tcDatQt = '0';
                    item.avrQt = '0.00';
                    item.tcTlQt = '0';
                    item.avrTlQt = '0.00';
                    return item;
                } else {
                    let obj = app.utils.parse(item.stringTl);
                    item.lastTinChiDat = obj.reduce((total, cur) => total + Number(cur.tcDat), 0);

                    obj.sort((a, b) => Number(b.maSemester) - Number(a.maSemester));

                    let objInRange = obj.filter(i => i.maSemester >= tuSemester && i.maSemester <= denSemester);
                    objInRange.sort((a, b) => Number(b.maSemester) - Number(a.maSemester));

                    item.avrTlHocKy = objInRange[0]?.avrTl || '0.00';
                    item.tinChiQt = obj.reduce((total, cur) => total + Number(cur.tcDangKy), 0);
                    item.tcDatQt = obj.reduce((total, cur) => total + Number(cur.tcDat), 0);
                    item.avrQt = (obj.reduce((total, cur) => total + Number(cur.tcTinhTrungBinh) * Number(cur.diemTrungBinh), 0) / (obj.reduce((total, cur) => total + Number(cur.tcTinhTrungBinh), 0) || 1)).toFixed(2);
                    item.tcTlQt = obj.reduce((total, cur) => total + Number(cur.tcTichLuyHK), 0);
                    item.avrTlQt = obj[0]?.avrTl || '0.00';

                    return item;
                }
            });

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-diem/diem-dat-page/:pageNumber/:pageSize', app.permission.check('dtThongKeDiem:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichSuDkhp.thongKeDiemDatSearchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-diem/diem-tong-hop-page/:pageNumber/:pageSize', app.permission.check('dtThongKeDiem:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.dtLichSuDkhp.thongKeDiemTongHopSearchPage(_pageNumber, _pageSize, filter, searchTerm);

            let listHocPhan = page.rows,
                listLoaiDiem = [];
            listHocPhan.forEach(item => {
                if (item.diem != null) {
                    let listDiem = item.diem.split(';');
                    listDiem.forEach(e => {
                        let itemDiem = e.split(':');
                        if (!listLoaiDiem.includes(itemDiem[0])) listLoaiDiem.push(itemDiem[0]);
                    });
                }
            });
            listHocPhan.map(item => {
                item.sub = [];
                if (item.diem) {
                    let listDiem = item.diem.split(';');
                    listLoaiDiem.forEach(loaiDiem => {
                        let itemSub = { loaiDiem, diem: null };
                        listDiem.forEach(e => {
                            let itemDiem = e.split(':');
                            if (itemDiem[0] == loaiDiem) itemSub.diem = parseFloat(itemDiem[1]);
                        });
                        item.sub.push(itemSub);
                    });
                } else {
                    listLoaiDiem.forEach(loaiDiem => {
                        let itemSub = { loaiDiem, diem: null };
                        item.sub.push(itemSub);
                    });
                }

                return item;
            });

            page.rows = listHocPhan;

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, listLoaiDiem } });
        } catch (error) {
            res.send({ error });
        }
    });

    //Export excel -------------------------------------------------------------------------------------------------
    app.get('/api/dt/thong-ke-diem/avr/download', app.permission.check('dtThongKeDiem:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            let listSemester = [], { tuSemester, denSemester } = filter;

            if (tuSemester == denSemester) listSemester.push(tuSemester);
            else {
                listSemester = await app.model.dtSemester.getAll({
                    statement: 'ma BETWEEN :tuSemester AND :denSemester',
                    parameter: { tuSemester, denSemester },
                }, 'ma', 'ma ASC').then(data => data.map(i => i.ma));
            }
            filter.listSemester = listSemester.join(',');

            const workBook = app.excel.create();
            const wsDK = workBook.addWorksheet('DS_DTB_SV');

            let items = await app.model.dtLichSuDkhp.thongKeDiemTrungBinhDownload(app.utils.stringify(filter)),
                cells = [
                    { cell: 'A1', value: 'MSSV', bold: true, border: '1234' },
                    { cell: 'B1', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
                    { cell: 'C1', value: 'TÊN KHOA', bold: true, border: '1234' },
                    { cell: 'D1', value: 'TÊN NGÀNH', bold: true, border: '1234' },
                    { cell: 'E1', value: 'LỚP', bold: true, border: '1234' },
                    { cell: 'F1', value: 'TÍN CHỈ ĐĂNG KÝ', bold: true, border: '1234' },
                    { cell: 'G1', value: 'TÍN CHỈ ĐẠT', bold: true, border: '1234' },
                    { cell: 'H1', value: 'ĐIỂM TRUNG BÌNH', bold: true, border: '1234' },
                    { cell: 'I1', value: 'TÍN CHỈ TÍCH LŨY', bold: true, border: '1234' },
                    { cell: 'J1', value: 'ĐIỂM TRUNG BÌNH TÍCH LŨY', bold: true, border: '1234' },
                    // { cell: 'K1', value: 'TÍN CHỈ ĐĂNG KÝ QUÁ TRÌNH', bold: true, border: '1234' },
                    // { cell: 'L1', value: 'TÍN CHỈ ĐẠT QUÁ TRÌNH', bold: true, border: '1234' },
                    // { cell: 'M1', value: 'ĐIỂM TRUNG BÌNH QUÁ TRÌNH', bold: true, border: '1234' },
                    // { cell: 'N1', value: 'TÍN CHỈ TÍCH LŨY QUÁ TRÌNH', bold: true, border: '1234' },
                    // { cell: 'O1', value: 'ĐIỂM TRUNG BÌNH TÍCH LŨY QUÁ TRÌNH', bold: true, border: '1234' },
                ];

            items = items.rows.map(item => {
                if (item.stringTl == null) {
                    item.avrTlHocKy = '0.00';
                    item.tinChiQt = '0';
                    item.tcDatQt = '0';
                    item.avrQt = '0.00';
                    item.tcTlQt = '0';
                    item.avrTlQt = '0.00';
                    return item;
                } else {
                    let obj = app.utils.parse(item.stringTl);
                    item.lastTinChiDat = obj.reduce((total, cur) => total + Number(cur.tcDat), 0);

                    obj.sort((a, b) => Number(b.maSemester) - Number(a.maSemester));

                    let objInRange = obj.filter(i => i.maSemester >= tuSemester && i.maSemester <= denSemester);
                    objInRange.sort((a, b) => Number(b.maSemester) - Number(a.maSemester));

                    item.avrTlHocKy = objInRange[0]?.avrTl || '0.00';
                    item.tinChiQt = obj.reduce((total, cur) => total + Number(cur.tcDangKy), 0);
                    item.tcDatQt = obj.reduce((total, cur) => total + Number(cur.tcDat), 0);
                    item.avrQt = (obj.reduce((total, cur) => total + Number(cur.tcTinhTrungBinh) * Number(cur.diemTrungBinh), 0) / (obj.reduce((total, cur) => total + Number(cur.tcTinhTrungBinh), 0) || 1)).toFixed(2);
                    item.tcTlQt = obj.reduce((total, cur) => total + Number(cur.tcTichLuyHK), 0);
                    item.avrTlQt = obj[0]?.avrTl || '0.00';

                    return item;
                }
            });

            for (let [index, item] of items.entries()) {
                cells.push({ cell: 'A' + (index + 2), border: '1234', value: item.mssv });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.hoTen });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.tenKhoa });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenNganh });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.lop });
                cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tinChi || '0' });
                cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tcDat || '0' });
                cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.avr || '0.00' });
                cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tinChiTlHocKy || '0' });
                cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.avrTlHocKy || 0 });
                // cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tinChiQt || 0 });
                // cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.tcDatQt || 0 });
                // cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.avrQt || '0.00' });
                // cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.tcTlQt || 0 });
                // cells.push({ cell: 'O' + (index + 2), border: '1234', value: item.avrTlQt || '0.00' });
            }

            app.excel.write(wsDK, cells);
            app.excel.attachment(workBook, res);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-diem/dat/download', app.permission.check('dtThongKeDiem:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = app.excel.create();
            const wsDK = workBook.addWorksheet('DS_hoc_phan');

            let items = await app.model.dtLichSuDkhp.thongKeDiemDatDownload(app.utils.stringify(filter)),
                cells = [
                    { cell: 'A1', value: 'MÃ HỌC PHẦN', bold: true, border: '1234' },
                    { cell: 'B1', value: 'MÃ MÔN HỌC', bold: true, border: '1234' },
                    { cell: 'C1', value: 'TÊN MÔN HỌC', bold: true, border: '1234' },
                    { cell: 'D1', value: 'TÊN KHOA', bold: true, border: '1234' },
                    { cell: 'E1', value: 'LỚP', bold: true, border: '1234' },
                    { cell: 'F1', value: 'SLSV QUA MÔN', bold: true, border: '1234' },
                    { cell: 'G1', value: 'PHẦN TRĂM QUA MÔN', bold: true, border: '1234' },
                    { cell: 'H1', value: 'SLSV RỚT MÔN', bold: true, border: '1234' },
                    { cell: 'I1', value: 'PHẦN TRĂM RỚT MÔN', bold: true, border: '1234' },
                    { cell: 'J1', value: 'TỔNG SINH VIÊN', bold: true, border: '1234' },
                ];

            for (let [index, item] of items.rows.entries()) {
                cells.push({ cell: 'A' + (index + 2), border: '1234', value: item.maHocPhan });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.maMonHoc });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenKhoa });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.lop });
                cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.quaMon ? item.quaMon : '0' });
                cells.push({ cell: 'G' + (index + 2), border: '1234', value: (item.phanTramQuaMon ? item.phanTramQuaMon : 0) + '%' });
                cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.rotMon ? item.rotMon : '0' });
                cells.push({ cell: 'I' + (index + 2), border: '1234', value: (item.phanTramRotMon ? item.phanTramRotMon : 0) + '%' });
                cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.soLuongDk ? item.soLuongDk : '0' });
            }

            app.excel.write(wsDK, cells);
            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/thong-ke-diem/tong-hop/download', app.permission.check('dtThongKeDiem:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);

            const workBook = app.excel.create();
            const wsDK = workBook.addWorksheet('DS_hoc_phan');

            let items = await app.model.dtLichSuDkhp.thongKeDiemTongHopDownload(app.utils.stringify(filter)),
                listHocPhan = items.rows,
                listLoaiDiem = [];
            listHocPhan.forEach(item => {
                if (item.diem != null) {
                    let listDiem = item.diem.split(';');
                    listDiem.forEach(e => {
                        let itemDiem = e.split(':');
                        if (!listLoaiDiem.includes(itemDiem[0])) listLoaiDiem.push(itemDiem[0]);
                    });
                }
            });
            listHocPhan.map(item => {
                item.sub = [];
                if (item.diem) {
                    let listDiem = item.diem.split(';');
                    listLoaiDiem.forEach(loaiDiem => {
                        let itemSub = { loaiDiem, diem: null };
                        listDiem.forEach(e => {
                            let itemDiem = e.split(':');
                            if (itemDiem[0] == loaiDiem) itemSub.diem = parseFloat(itemDiem[1]);
                        });
                        item.sub.push(itemSub);
                    });
                } else {
                    listLoaiDiem.forEach(loaiDiem => {
                        let itemSub = { loaiDiem, diem: null };
                        item.sub.push(itemSub);
                    });
                }

                return item;
            });


            let cells = [
                { cell: 'A1', value: 'MÃ HỌC PHẦN', bold: true, border: '1234' },
                { cell: 'B1', value: 'MÃ MÔN HỌC', bold: true, border: '1234' },
                { cell: 'C1', value: 'TÊN MÔN HỌC', bold: true, border: '1234' },
                { cell: 'D1', value: 'TÊN KHOA', bold: true, border: '1234' },
                { cell: 'E1', value: 'LỚP', bold: true, border: '1234' },
            ];

            for (let i = 0; i <= listLoaiDiem.length; i++) {
                if (i == listLoaiDiem.length) cells.push({ cell: String.fromCharCode(70 + i) + '1', value: 'TỔNG SINH VIÊN', bold: true, border: '1234' });
                else cells.push({ cell: String.fromCharCode(70 + i) + '1', value: listLoaiDiem[i], bold: true, border: '1234' });
            }

            for (let [index, item] of listHocPhan.entries()) {
                cells.push({ cell: 'A' + (index + 2), border: '1234', value: item.maHocPhan });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.maMonHoc });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenKhoa });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.lop });

                for (let i = 0; i <= listLoaiDiem.length; i++) {
                    if (i == listLoaiDiem.length) cells.push({ cell: String.fromCharCode(70 + i) + (index + 2), border: '1234', value: item.soLuong || '0' });
                    else {
                        let diem = item.sub.filter(e => e.loaiDiem == listLoaiDiem[i]);
                        cells.push({ cell: String.fromCharCode(70 + i) + (index + 2), border: '1234', value: diem[0].diem == 0 ? '0' : diem[0].diem });
                    }
                }
            }

            app.excel.write(wsDK, cells);
            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });
};
