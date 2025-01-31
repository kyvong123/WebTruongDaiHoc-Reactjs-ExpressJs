module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7555: {
                title: 'Lịch sử đăng ký học phần', link: '/user/sau-dai-hoc/lich-su',
                icon: 'fa-history', backgroundColor: '#F7C04A',
                parentKey: 7557
            }
        }
    };

    app.permission.add(
        { name: 'sdhLichSuDkhp:manage', menu },
        { name: 'sdhLichSuDkhp:write' },
        { name: 'sdhLichSuDkhp:delete' },
        { name: 'sdhLichSuDkhp:export' }
    );

    app.get('/user/sau-dai-hoc/lich-su', app.permission.check('sdhLichSuDkhp:manage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleSdhLichSuDkhp', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhLichSuDkhp:manage', 'sdhLichSuDkhp:write', 'sdhLichSuDkhp:delete', 'sdhLichSuDkhp:export');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // Excel Download ----------------------------------------------------------------------------------------------------------------------------------------
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

    const getThaoTac = async (value) => {
        try {
            if (value == 'A') return 'Đăng ký mới';
            else if (value == 'D') return 'Hủy đăng ký';
            else if (value == 'H') return 'Hoàn tác';
            else return 'Chuyển lớp';
        } catch (error) {
            return error;
        }
    };

    const getGhiChu = async (value, item) => {
        try {
            if (value == 'C') return `Sinh viên được chuyển từ lớp học phần ${item.ghiChu}`;
            else if (value != 'A' && value != 'D' && value != 'H') return item.thaoTac;
            else return item.ghiChu;
        } catch (error) {
            return error;
        }
    };

    const getCells = async (filter) => {
        try {
            let list = await app.model.sdhLichSuDkhp.timeDownload(filter);

            let cells = [
                { cell: 'A1', value: 'MSSV', bold: true, border: '1234' },
                { cell: 'B1', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
                { cell: 'C1', value: 'MÃ HỌC PHẦN', bold: true, border: '1234' },
                { cell: 'D1', value: 'MÃ MÔN HỌC', bold: true, border: '1234' },
                { cell: 'E1', value: 'TÊN MÔN', bold: true, border: '1234' },
                { cell: 'F1', value: 'NGƯỜI THAO TÁC', bold: true, border: '1234' },
                { cell: 'G1', value: 'THỜI GIAN THAO TÁC', bold: true, border: '1234' },
                { cell: 'H1', value: 'THAO TÁC', bold: true, border: '1234' },
                { cell: 'I1', value: 'GHI CHÚ', bold: true, border: '1234' },
            ];

            for (let [index, item] of list.rows.entries()) {
                let thoiGianDangKy = await getFullDateTime(item.timeModified);
                let thaoTac = await getThaoTac(item.thaoTac);
                let ghiChu = await getGhiChu(item.thaoTac, item);

                cells.push({ cell: 'A' + (index + 2), border: '1234', value: item.mssv });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.hoTen });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.maHocPhan });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.maMonHoc });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi });
                cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.userModified });
                cells.push({ cell: 'G' + (index + 2), border: '1234', value: thoiGianDangKy });
                cells.push({ cell: 'H' + (index + 2), border: '1234', value: thaoTac });
                cells.push({ cell: 'I' + (index + 2), border: '1234', value: ghiChu });
            }
            return cells;
        } catch (error) {
            return error;
        }
    };


    app.get('/api/sdh/lich-su-dang-ky/download', app.permission.check('sdhLichSuDkhp:export'), async (req, res) => {
        try {
            let { ngayBatDau, ngayKetThuc } = req.query;

            const workBook = app.excel.create(),
                workSheetTong = workBook.addWorksheet('Lich_su_tong');

            let cellsTong = await getCells(app.utils.stringify(app.clone({ ngayBatDau, ngayKetThuc })));

            app.excel.write(workSheetTong, cellsTong);

            ngayBatDau = await getFullDateTime(parseInt(ngayBatDau));
            ngayKetThuc = await getFullDateTime(parseInt(ngayKetThuc));

            app.excel.attachment(workBook, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/lich-su-dang-ky/page/:pageNumber/:pageSize', app.permission.check('sdhLichSuDkhp:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.sdhLichSuDkhp.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/lich-su-dang-ky/dash-board/:pageNumber/:pageSize', app.permission.check('sdhLichSuDkhp:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter || {}, sort = filter.sort;
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let page = await app.model.sdhLichSuDkhp.timeSearchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sdh/lich-su-dang-ky', app.permission.check('developer:login'), async (req, res) => {
        try {
            let id = req.body.id;
            await app.model.sdhLichSuDkhp.delete({ id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};