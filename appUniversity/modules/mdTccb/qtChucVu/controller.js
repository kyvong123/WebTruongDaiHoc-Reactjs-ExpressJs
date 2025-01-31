module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3004: { title: 'Quá trình chức vụ', link: '/user/tccb/qua-trinh/chuc-vu', icon: 'fa-black-tie', backgroundColor: '#F5D7B0', groupIndex: 0, color: '#000' },
        },
    };

    /*
        Must be included in try-catch block
        Params:
        - colId starts from 0
    */
    const colNumToExcelColName = (colId) => {
        if (isNaN(colId) || !isNaN(colId) && Number(colId) < 0) {
            throw new Error('Invalid column id');
        }
        const colRes = [];
        let onlyCol = true;
        while (Math.trunc(colId / 26) != 0) {
            onlyCol = false;
            colRes.push(colId % 26);
            colId = Math.trunc(colId / 26);
        }
        /* onlyCol == true when colId: 0 -> 25, == false if colId > 25 */
        colRes.push(onlyCol ? colId : colId - 1);
        colRes.reverse();
        const excelColName = colRes.map(id => String.fromCharCode(id + 65));
        return excelColName.reduce((res, curColId) => res + curColId, '');
    };

    app.permission.add(
        { name: 'qtChucVu:read', menu },
        { name: 'qtChucVu:write' },
        { name: 'qtChucVu:delete' },
        { name: 'qtChucVu:import' },
        { name: 'qtChucVu:export' },
    );
    app.get('/user/tccb/qua-trinh/chuc-vu/:stt', app.permission.check('qtChucVu:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/chuc-vu/group/:shcc', app.permission.check('qtChucVu:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtChucVu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtChucVu:read', 'qtChucVu:write', 'qtChucVu:export', 'qtChucVu:import');
            resolve();
        } else resolve();
    }));

    /// API -----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/chuc-vu/check-da-su-dung', app.permission.check('qtChucVu:read'), async (req, res) => {
        try {
            const { idSoDangKy, shcc, maChucVu } = req.query;
            let chucVu = await app.model.qtChucVu.get({ idSoDangKy, shcc, maChucVu });
            res.send({ isExist: chucVu ? 1 : '' });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/page/:pageNumber/:pageSize', app.permission.orCheck('qtChucVu:read', 'staff:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = app.utils.stringify(req.query.filter || {});
            const page = await app.model.qtChucVu.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        }
        catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/group/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = app.utils.stringify(req.query.filter || {});
            const page = await app.model.qtChucVu.groupPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/group-by-don-vi/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = app.utils.stringify(req.query.filter || {});
            /**
             * Routine return results as getPage but short by maDonVi, maChucVu
             */
            const page = await app.model.qtChucVu.groupPageByDonVi(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            const qtChucVuByDonViObject = {};
            list.forEach((qtChucVuItem) => {
                if (!(qtChucVuItem.tenDonVi in qtChucVuByDonViObject)) {
                    qtChucVuByDonViObject[qtChucVuItem.tenDonVi] = {};
                }
                if (!(qtChucVuItem.tenChucVu in qtChucVuByDonViObject[qtChucVuItem.tenDonVi])) {
                    qtChucVuByDonViObject[qtChucVuItem.tenDonVi][qtChucVuItem.tenChucVu] = [];
                }
                qtChucVuByDonViObject[qtChucVuItem.tenDonVi][qtChucVuItem.tenChucVu].push(qtChucVuItem);
            });
            let qtChucVuByDonViList = [];
            for (let donViKey of Object.keys(qtChucVuByDonViObject)) {
                qtChucVuByDonViList.push({
                    tenDonVi: donViKey,
                    itemGroup: qtChucVuByDonViObject[donViKey],
                    itemsNum: Object.keys(qtChucVuByDonViObject[donViKey]).reduce((total, currKey) => total + qtChucVuByDonViObject[donViKey][currKey].length, 0)
                });
            }
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list: qtChucVuByDonViList } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/all', app.permission.check('qtChucVu:read'), async (req, res) => {
        try {
            const { shcc } = req.query;
            const items = await app.model.qtChucVu.getByShcc(shcc);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), async (req, res) => {
        try {
            const { data } = req.body;
            let targetEmail = await app.getEmailByShcc(data.shcc);
            let item = await app.model.qtChucVu.create(data);
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Chức vụ');
            app.session.refresh(targetEmail);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), async (req, res) => {
        try {
            const { changes, stt } = req.body;
            let targetEmail = await app.getEmailByShcc(changes.shcc);
            if (changes && changes.thoiChucVu == 1) changes.chucVuChinh = 0;
            let item = await app.model.qtChucVu.update({ stt }, changes);
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Chức vụ');
            app.session.refresh(targetEmail);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), async (req, res) => {
        try {
            const { shcc, stt } = req.body;
            let targetEmail = await app.getEmailByShcc(shcc);
            await app.model.qtChucVu.delete({ stt });
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Chức vụ');
            app.session.refresh(targetEmail);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    /// Others APIs ----------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/chuc-vu/download-excel/:listShcc/:listDonVi/:fromYear/:toYear/:timeType/:listChucVu/:gioiTinh/:thoiChucVu/:listChucDanh', app.permission.check('qtChucVu:export'), async (req, res) => {
        try {
            const workbook = app.excel.create();
            await addSheetChucVuToWorkbook(workbook, req.params);

            app.excel.attachment(workbook, res, 'chucvu.xlsx');
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/tccb/qua-trinh/chuc-vu/bo-nhiem-thoi-chuc-vu', app.permission.check('qtChucVu:import', 'qtChucVu:write'), async (req, res) => {
        let result = [];
        try {
            const { data } = req.body;
            for (let donViQuyetDinhObject of data) {
                for (let quyetDinhItem of donViQuyetDinhObject.itemGroup) {
                    const qtChucVuItem = await app.model.qtChucVu.get({ shcc: quyetDinhItem.mscb, maDonVi: quyetDinhItem.maDonVi, maChucVu: quyetDinhItem.maChucVu, thoiChucVu: 0 });
                    /**
                     * BoNhiem has chucVuChinh property, ThoiChucVu not
                     */
                    if (quyetDinhItem.chucVuChinh == undefined) {
                        const updatedItem = await app.model.qtChucVu.update({ stt: qtChucVuItem.stt }, { chucVuChinh: 0, thoiChucVu: 1, soQdThoiChucVu: quyetDinhItem.soQuyetDinh, ngayRaQdThoiChucVu: quyetDinhItem.ngayQuyetDinh });
                        result.push({
                            type: 'Thôi chức vụ',
                            item: updatedItem
                        });
                    } else {
                        const createdItem = await app.model.qtChucVu.create({ ...quyetDinhItem, shcc: quyetDinhItem.mscb, soQd: quyetDinhItem.soQuyetDinh, ngayRaQd: quyetDinhItem.ngayQuyetDinh });
                        const tchcCanBoItem = await app.model.tchcCanBo.get({ shcc: createdItem.shcc });
                        if (createdItem.chucVuChinh == 1 && tchcCanBoItem.maDonVi != createdItem.maDonVi) {
                            const chucVuChinhCu = await app.model.qtChucVu.get({ shcc: tchcCanBoItem.shcc, chucVuChinh: 1 });
                            await app.model.qtChucVu.update({ stt: chucVuChinhCu.stt }, { chucVuChinh: 0 });
                            const updatedTchcCanBoItem = await app.model.tchcCanBo.update({ shcc: tchcCanBoItem.shcc }, { maDonVi: createdItem.maDonVi });
                            result.push({
                                type: 'Chuyển đơn vị công tác',
                                item: updatedTchcCanBoItem
                            });
                        }
                        result.push({
                            type: 'Bổ nhiệm',
                            item: createdItem
                        });
                    }
                }
            }
            res.send({ result });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error, result });
        }
    });

    const addSheetChucVuToWorkbook = async (workbook, reqParams) => {
        const worksheet = workbook.addWorksheet('chucvu');
        let { listDonVi, fromYear, toYear, listShcc, timeType, listChucVu, gioiTinh, thoiChucVu, listChucDanh } = reqParams ? reqParams : { fromYear: null, toYear: null, listShcc: null, listDonVi: null, timeType: 0, listChucVu: null, gioiTinh: null, listChucDanh: null, thoiChucVu: null };
        if (listShcc == 'null') listShcc = null;
        if (listDonVi == 'null') listDonVi = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (listChucVu == 'null') listChucVu = null;
        if (gioiTinh == 'null') gioiTinh = null;
        if (listChucDanh == 'null') listChucDanh = null;
        thoiChucVu = 0;
        const result = await app.model.qtChucVu.download(listShcc, listDonVi, fromYear, toYear, timeType, listChucVu, gioiTinh, thoiChucVu, listChucDanh);
        let newRows = [];
        for (let idx = 0; idx < result.rows.length; idx++) {
            if (result.rows[idx].soChucVuKiemNhiem == 0 && !result.rows[idx].itemChinh) continue;
            newRows.push(result.rows[idx]);
        }
        let maxSoLuongKiemNhiem = 0;
        for (let idx = 0; idx < newRows.length; idx++) {
            let value = newRows[idx].soChucVuKiemNhiem;
            if (value > maxSoLuongKiemNhiem) {
                maxSoLuongKiemNhiem = value;
            }
        }
        let cells = [
            // Table name: QT_CHUC_VU { stt, shcc, maChucVu, maDonVi, maBoMon, soQd, ngayRaQd, chucVuChinh, thoiChucVu, soQdThoiChucVu, ngayThoiChucVu, ngayRaQdThoiChucVu }
            { cell: 'A1', value: 'STT', bold: true, border: '1234' },
            { cell: 'B1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
            { cell: 'C1', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
            { cell: 'D1', value: 'NGÀY THÁNG NĂM SINH', bold: true, border: '1234' },
            { cell: 'E1', value: 'GIỚI TÍNH', bold: true, border: '1234' },
            { cell: 'F1', value: 'ĐƠN VỊ CÔNG TÁC', bold: true, border: '1234' },
            { cell: 'G1', value: 'BỘ MÔN', bold: true, border: '1234' },
            { cell: 'H1', value: 'CHỨC VỤ CHÍNH', bold: true, border: '1234' },
            { cell: 'I1', value: 'HỆ SỐ PHỤ CẤP', bold: true, border: '1234' },
            { cell: 'J1', value: 'SỐ QĐ BỔ NHIỆM', bold: true, border: '1234' },
            { cell: 'K1', value: 'NGÀY RA QĐ', bold: true, border: '1234' },
        ];
        for (let idx = 0, col = 11; idx < maxSoLuongKiemNhiem; idx++) {
            cells.push({ cell: colNumToExcelColName(col) + '1', value: 'CHỨC VỤ KIÊM NHIỆM ' + (idx + 1).toString(), bold: true, border: '1234' });
            cells.push({ cell: colNumToExcelColName(col + 1) + '1', value: 'ĐƠN VỊ CÔNG TÁC', bold: true, border: '1234' });
            cells.push({ cell: colNumToExcelColName(col + 2) + '1', value: 'BỘ MÔN', bold: true, border: '1234' });
            cells.push({ cell: colNumToExcelColName(col + 3) + '1', value: 'HỆ SỐ PHỤ CẤP', bold: true, border: '1234' });
            cells.push({ cell: colNumToExcelColName(col + 4) + '1', value: 'SỐ QĐ BỔ NHIỆM', bold: true, border: '1234' });
            cells.push({ cell: colNumToExcelColName(col + 5) + '1', value: 'NGÀY RA QĐ', bold: true, border: '1234' });
            col += 6;
        }
        newRows.forEach((item, index) => {
            let danhSachChinh = null, chucVuChinh = null, donViChinh = null, boMonChinh = null, ngayRaQdChinh = null, soQdChinh = null, heSoPhuCap = null;
            if (item.itemChinh) {
                danhSachChinh = item.itemChinh.split('??');
                chucVuChinh = danhSachChinh[0].trim();
                donViChinh = danhSachChinh[1].trim();
                boMonChinh = danhSachChinh[2].trim();
                ngayRaQdChinh = Number(danhSachChinh[3].trim());
                soQdChinh = danhSachChinh[4].trim();
                heSoPhuCap = parseFloat(danhSachChinh[5].trim());
            }
            let hoTen = item.ho + ' ' + item.ten;
            cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
            cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
            cells.push({ cell: 'C' + (index + 2), border: '1234', value: hoTen });
            cells.push({ cell: 'D' + (index + 2), alignment: 'center', border: '1234', value: item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '' });
            cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.gioiTinh == '01' ? 'Nam' : 'Nữ' });
            cells.push({ cell: 'F' + (index + 2), border: '1234', value: donViChinh });
            cells.push({ cell: 'G' + (index + 2), border: '1234', value: boMonChinh });
            cells.push({ cell: 'H' + (index + 2), border: '1234', value: chucVuChinh });
            cells.push({ cell: 'I' + (index + 2), border: '1234', value: heSoPhuCap });
            cells.push({ cell: 'J' + (index + 2), border: '1234', value: soQdChinh });
            cells.push({ cell: 'K' + (index + 2), border: '1234', value: ngayRaQdChinh ? app.date.dateTimeFormat(new Date(ngayRaQdChinh), 'dd/mm/yyyy') : '' });
            let idx = 0, col = 11;
            if (item.soChucVuKiemNhiem > 0) {
                let danhSachChucVuKiemNhiem = item.danhSachChucVuKiemNhiem.split('??');
                let danhSachSoQdKiemNhiem = item.danhSachSoQdKiemNhiem.split('??');
                let danhSachNgayQdKiemNhiem = item.danhSachNgayQdKiemNhiem.split('??');
                let danhSachHeSoPhuCapKiemNhiem = item.danhSachHeSoPhuCapKiemNhiem.split('??');
                let danhSachDonViKiemNhiem = item.danhSachDonViKiemNhiem.split('??');
                let danhSachBoMonKiemNhiem = item.danhSachBoMonKiemNhiem.split('??');
                for (; idx < item.soChucVuKiemNhiem; idx++) {
                    cells.push({ cell: colNumToExcelColName(col) + (index + 2), border: '1234', value: danhSachChucVuKiemNhiem[idx].trim() });
                    cells.push({ cell: colNumToExcelColName(col + 1) + (index + 2), border: '1234', value: danhSachDonViKiemNhiem[idx].trim() });
                    cells.push({ cell: colNumToExcelColName(col + 2) + (index + 2), border: '1234', value: danhSachBoMonKiemNhiem[idx].trim() });
                    cells.push({ cell: colNumToExcelColName(col + 3) + (index + 2), border: '1234', value: parseFloat(danhSachHeSoPhuCapKiemNhiem[idx].trim()) });
                    cells.push({ cell: colNumToExcelColName(col + 4) + (index + 2), border: '1234', value: danhSachSoQdKiemNhiem[idx].trim() });
                    cells.push({ cell: colNumToExcelColName(col + 5) + (index + 2), border: '1234', value: danhSachNgayQdKiemNhiem[idx].trim() ? app.date.dateTimeFormat(new Date(Number(danhSachNgayQdKiemNhiem[idx].trim())), 'dd/mm/yyyy') : '' });
                    col += 6;
                }
            }
            for (; idx < maxSoLuongKiemNhiem; idx++) {
                cells.push({ cell: colNumToExcelColName(col) + (index + 2), border: '1234', value: '' });
                cells.push({ cell: colNumToExcelColName(col + 1) + (index + 2), border: '1234', value: '' });
                cells.push({ cell: colNumToExcelColName(col + 2) + (index + 2), border: '1234', value: '' });
                cells.push({ cell: colNumToExcelColName(col + 3) + (index + 2), border: '1234', value: '' });
                cells.push({ cell: colNumToExcelColName(col + 4) + (index + 2), border: '1234', value: '' });
                cells.push({ cell: colNumToExcelColName(col + 5) + (index + 2), border: '1234', value: '' });
                col += 6;
            }
        });
        app.excel.write(worksheet, cells);
    };

    app.get('/api/tccb/qua-trinh/chuc-vu/dai-dien-ky', app.permission.check('staff:read'), async (req, res) => {
        try {
            const items = await app.model.qtChucVu.getDaiDienKy();
            res.send({ items: items.rows });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/qua-trinh/chuc-vu-by-shcc/:shcc', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { shcc } = req.params;
            let item = await app.model.qtChucVu.get({ shcc });
            if (item) {
                const canBo = await app.model.tchcCanBo.get({ shcc });
                item = { ...item, maChucVu: canBo.maChucVu, tenCanBo: canBo ? canBo.ho + ' ' + canBo.ten : '' };
                const chucVu = await app.model.dmChucVu.get({ ma: item.maChucVu });
                item = { ...item, tenChucVu: chucVu ? chucVu.ten : '' };
                res.send({ item });
            } else {
                res.send({ item: {} });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // TEMPLATE -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/bo-nhiem-thoi-chuc-vu-template', app.permission.check('qtChucVu:import'), async (req, res) => {
        try {
            let workbook = app.excel.create();
            const worksheetBoNhiem = workbook.addWorksheet('BoNhiem');
            const worksheetThoiChucVu = workbook.addWorksheet('ThoiChucVu');

            worksheetBoNhiem.columns = [
                { header: 'Mã số cán bộ', key: 'mscb', width: 20 },
                { header: 'Họ', key: 'ho', width: 20 },
                { header: 'Tên', key: 'ten', width: 20 },
                { header: 'Tên chức vụ', key: 'tenChucVu', width: 20 },
                { header: 'Tên đơn vị', key: 'tenDonVi', width: 20 },
                { header: 'Tên bộ môn', key: 'tenBoMon', width: 20 },
                { header: 'Chức vụ chính? (1/0)', key: 'chucVuChinh', width: 20 },
                { header: 'Số quyết định', key: 'soQuyetDinh', width: 20 },
                { header: 'Ngày ra quyết định', key: 'ngayQuyetDinh', width: 20 },
            ];

            worksheetThoiChucVu.columns = [
                { header: 'Mã số cán bộ', key: 'mscb', width: 20 },
                { header: 'Họ', key: 'ho', width: 20 },
                { header: 'Tên', key: 'ten', width: 20 },
                { header: 'Tên chức vụ', key: 'tenChucVu', width: 20 },
                { header: 'Tên đơn vị', key: 'tenDonVi', width: 20 },
                { header: 'Tên bộ môn', key: 'tenBoMon', width: 20 },
                { header: 'Số quyết định', key: 'soQuyetDinh', width: 20 },
                { header: 'Ngày ra quyết định', key: 'ngayQuyetDinh', width: 20 },
            ];

            let dsTenDonVi = await app.model.dmDonVi.getAll({ kichHoat: 1 }, 'ten');
            dsTenDonVi = dsTenDonVi.map(ele => ele.ten).sort();
            let dsTenBoMon = await app.model.dmBoMon.getAll({ kichHoat: 1 }, 'ten');
            dsTenBoMon = dsTenBoMon.map(ele => ele.ten).sort();
            let dsTenChucVu = await app.model.dmChucVu.getAll({ kichHoat: 1 }, 'ten');
            dsTenChucVu = dsTenChucVu.map(ele => ele.ten).sort();

            const { dataRange: donViSelect } = workbook.createRefSheet('DON_VI', dsTenDonVi);
            const { dataRange: chucVuSelect } = workbook.createRefSheet('CHUC_VU', dsTenChucVu);
            const { dataRange: boMonSelect } = workbook.createRefSheet('BO_MON', dsTenBoMon);

            const boNhiemRows = worksheetBoNhiem.getRows(2, 1000);
            const thoiChucVuRows = worksheetThoiChucVu.getRows(2, 1000);

            boNhiemRows.forEach(row => {
                row.getCell('tenChucVu').dataValidation = { type: 'list', allowBlank: false, formulae: [chucVuSelect] };
                row.getCell('tenDonVi').dataValidation = { type: 'list', allowBlank: false, formulae: [donViSelect] };
                row.getCell('tenBoMon').dataValidation = { type: 'list', allowBlank: true, formulae: [boMonSelect] };
            });
            thoiChucVuRows.forEach(row => {
                row.getCell('tenChucVu').dataValidation = { type: 'list', allowBlank: false, formulae: [chucVuSelect] };
                row.getCell('tenDonVi').dataValidation = { type: 'list', allowBlank: false, formulae: [donViSelect] };
                row.getCell('tenBoMon').dataValidation = { type: 'list', allowBlank: true, formulae: [boMonSelect] };
            });

            await addSheetChucVuToWorkbook(workbook, req.params);

            app.excel.attachment(workbook, res, 'TEMPLATE_BO_NHIEM_THOI_CHUC_VU.xlsx');
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    /// HOOKs -----------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('tccbQtChucVuBoNhiemThoiChucVu', (req, fields, files, params, done) => app.permission.has(req, () => qtChucVuBoNhiemThoiChucVuUploadHook(req, fields, files, params, done), done, 'qtChucVu:import'));

    const checkBoNhiemSheetDataFormat = async (boNhiemSheet) => {
        let boNhiemItems = [];
        let invalidBoNhiemItems = [];

        let index = 2;
        const getVal = (column, Default) => {
            Default = Default ? Default : '';
            let val = boNhiemSheet.getCell(column + index).text;
            return val ? val : Default;
        };
        while (true) {
            if (boNhiemSheet.getCell(`A${index}`).text == '') {
                break;
            } else {
                let boNhiemData = {
                    mscb: getVal('A').trim(),
                    ho: getVal('B').trim(),
                    ten: getVal('C').trim(),
                    tenChucVu: getVal('D').trim(),
                    maChucVu: null,
                    tenDonVi: getVal('E').trim(),
                    maDonVi: null,
                    tenBoMon: getVal('F').trim(),
                    maBoMon: null,
                    chucVuChinh: getVal('G').trim(),
                    soQuyetDinh: getVal('H').trim(),
                    ngayQuyetDinh: getVal('I').trim(),
                    errorCode: [],
                    errorDetail: [],
                    warningCode: [],
                    warningDetail: [],
                    infoDetail: [],
                    isError: false,
                    isIllegal: false
                };

                /**
                 * Kiểm tra thông tin cán bộ
                 */
                let canBo = null;
                if (!boNhiemData.mscb) {
                    boNhiemData.errorCode.push(1);
                    boNhiemData.isError = true;
                } else {
                    canBo = await app.model.tchcCanBo.get({ shcc: boNhiemData.mscb });
                    if (!canBo) {
                        boNhiemData.errorCode.push(2);
                        boNhiemData.isError = true;
                    } else {
                        if (!boNhiemData.ho || !boNhiemData.ten) {
                            boNhiemData.errorCode.push(3);
                            boNhiemData.isError = true;
                        } else {
                            if (!(boNhiemData.ho.trim().toLowerCase() == canBo.ho.trim().toLowerCase() && boNhiemData.ten.trim().toLowerCase() == canBo.ten.trim().toLowerCase())) {
                                boNhiemData.errorCode.push(4);
                                boNhiemData.isError = true;
                            } else {
                                boNhiemData.ho = boNhiemData.ho.trim().toUpperCase();
                                boNhiemData.ten = boNhiemData.ten.trim().toUpperCase();
                            }
                        }
                    }
                }

                /**
                 *  Kiểm tra tên chức vụ có tồn tại
                 */
                let chucVu = null;
                if (!boNhiemData.tenChucVu) {
                    boNhiemData.errorCode.push(7);
                    boNhiemData.isError = true;
                } else {
                    chucVu = await app.model.dmChucVu.get({
                        statement: 'LOWER(ten) = :boNhiemDataTenChucVu',
                        parameter: { boNhiemDataTenChucVu: boNhiemData.tenChucVu.trim().toLowerCase() }
                    });
                    if (!chucVu) {
                        boNhiemData.errorCode.push(8);
                        boNhiemData.isError = true;
                    } else {
                        boNhiemData.maChucVu = chucVu.ma;
                        boNhiemData.tenChucVu = boNhiemData.tenChucVu.trim().toUpperCase();
                    }
                }

                /**
                 * Kiểm tra tên đơn vị có tồn tại
                 */
                let donVi = null;
                if (!boNhiemData.tenDonVi) {
                    boNhiemData.errorCode.push(9);
                    boNhiemData.isError = true;
                } else {
                    donVi = await app.model.dmDonVi.get({
                        statement: 'LOWER(ten) = :boNhiemDataTenDonVi',
                        parameter: { boNhiemDataTenDonVi: boNhiemData.tenDonVi.trim().toLowerCase() }
                    });
                    if (!donVi) {
                        boNhiemData.errorCode.push(10);
                        boNhiemData.isError = true;
                    } else {
                        boNhiemData.maDonVi = donVi.ma;
                        boNhiemData.tenDonVi = boNhiemData.tenDonVi.trim().toUpperCase();
                    }
                }

                /**
                 * Kiểm tra tên bộ môn có hợp lệ cho phép rỗng
                 */
                let boMon = null;
                if (boNhiemData.tenBoMon) {
                    boMon = await app.model.dmBoMon.get({
                        statement: 'LOWER(ten) = :boNhiemDataTenBoMon',
                        parameter: { boNhiemDataTenBoMon: boNhiemData.tenBoMon.trim().toLowerCase() }
                    });
                    if (!boMon) {
                        boNhiemData.errorCode.push(12);
                        boNhiemData.isError = true;
                    } else {
                        boNhiemData.maBoMon = boMon.ma;
                        boNhiemData.tenBoMon = boNhiemData.tenBoMon.trim().toUpperCase();
                    }
                }

                /**
                 * Kiểm tra thông tin chức vụ chính
                 */
                if (!boNhiemData.chucVuChinh) {
                    boNhiemData.errorCode.push(13);
                    boNhiemData.isError = true;
                } else if (boNhiemData.chucVuChinh.trim() != '0' && boNhiemData.chucVuChinh.trim() != '1') {
                    boNhiemData.errorCode.push(14);
                    boNhiemData.isError = true;
                }

                /**
                 * Kiểm tra số quyết định
                 */
                if (!boNhiemData.soQuyetDinh) {
                    /**
                     * TODO
                     */
                } else {
                    /**
                     * TODO
                     */
                }
                /***************************************************************************************/

                /**
                 * Kiểm tra ngày quyết định
                 */
                if (!boNhiemData.ngayQuyetDinh) {
                    /**
                     * TODO
                     */
                    boNhiemData.errorCode.push(5);
                    boNhiemData.isError = true;
                } else if (!boNhiemData.ngayQuyetDinh.includes('/') && !boNhiemData.ngayQuyetDinh.includes('-')) {
                    /**
                     * TODO
                     */
                    boNhiemData.errorCode.push(6);
                    boNhiemData.isError = true;
                } else {
                    let [day, month, year] = boNhiemData.ngayQuyetDinh.includes('/') ? boNhiemData.ngayQuyetDinh.split('/').map(item => Number(item)) : boNhiemData.ngayQuyetDinh.split('-').map(item => Number(item));
                    boNhiemData.ngayQuyetDinh = new Date(year, month - 1, day, 0, 0, 0).getTime();
                }

                boNhiemData = {
                    ...boNhiemData,
                    errorDetail: boNhiemData.errorCode.map(id => errorDescription[id]),
                    warningDetail: boNhiemData.warningCode.map(id => warningDescription[id])
                };

                if (boNhiemData.isError) {
                    invalidBoNhiemItems.push(boNhiemData);
                } else {
                    boNhiemItems.push(boNhiemData);
                }
            }
            index += 1;
        }
        return { boNhiemItems, invalidBoNhiemItems };
    };

    const checkThoiChucVuSheetDataFormat = async (thoiChucVuSheet) => {
        let thoiChucVuItems = [];
        let invalidThoiChucVuItems = [];

        let index = 2;
        const getVal = (column, Default) => {
            Default = Default ? Default : '';
            let val = thoiChucVuSheet.getCell(column + index).text;
            return val ? val : Default;
        };

        while (true) {
            if (thoiChucVuSheet.getCell(`A${index}`).text == '') {
                break;
            } else {
                let thoiChucVuData = {
                    mscb: getVal('A').trim(),
                    ho: getVal('B').trim(),
                    ten: getVal('C').trim(),
                    tenChucVu: getVal('D').trim(),
                    maChucVu: null,
                    tenDonVi: getVal('E').trim(),
                    maDonVi: null,
                    tenBoMon: getVal('F').trim(),
                    maBoMon: null,
                    soQuyetDinh: getVal('G').trim(),
                    ngayQuyetDinh: getVal('H').trim(),
                    errorCode: [],
                    errorDetail: [],
                    warningCode: [],
                    warningDetail: [],
                    infoDetail: [],
                    isError: false,
                    isIllegal: false
                };

                /**
                 * Kiểm tra thông tin cán bộ
                 */
                let canBo = null;
                if (!thoiChucVuData.mscb) {
                    thoiChucVuData.errorCode.push(1);
                    thoiChucVuData.isError = true;
                } else {
                    canBo = await app.model.tchcCanBo.get({ shcc: thoiChucVuData.mscb });
                    if (!canBo) {
                        thoiChucVuData.errorCode.push(2);
                        thoiChucVuData.isError = true;
                    } else {
                        if (!thoiChucVuData.ho || !thoiChucVuData.ten) {
                            thoiChucVuData.errorCode.push(3);
                            thoiChucVuData.isError = true;
                        } else {
                            if (!(thoiChucVuData.ho.trim().toLowerCase() == canBo.ho.trim().toLowerCase() && thoiChucVuData.ten.trim().toLowerCase() == canBo.ten.trim().toLowerCase())) {
                                thoiChucVuData.errorCode.push(4);
                                thoiChucVuData.isError = true;
                            }
                        }
                    }
                }

                /**
                 *  Kiểm tra tên chức vụ có tồn tại
                 */
                let chucVu = null;
                if (!thoiChucVuData.tenChucVu) {
                    thoiChucVuData.errorCode.push(7);
                    thoiChucVuData.isError = true;
                } else {
                    chucVu = await app.model.dmChucVu.get({
                        statement: 'LOWER(ten) = :thoiChucVuDataTenChucVu',
                        parameter: { thoiChucVuDataTenChucVu: thoiChucVuData.tenChucVu.trim().toLowerCase() }
                    });
                    if (!chucVu) {
                        thoiChucVuData.errorCode.push(8);
                        thoiChucVuData.isError = true;
                    } else {
                        thoiChucVuData.maChucVu = chucVu.ma;
                        thoiChucVuData.tenChucVu = thoiChucVuData.tenChucVu.trim().toUpperCase();
                    }
                }

                /**
                 * Kiểm tra tên đơn vị có tồn tại
                 */
                let donVi = null;
                if (!thoiChucVuData.tenDonVi) {
                    thoiChucVuData.errorCode.push(9);
                    thoiChucVuData.isError = true;
                } else {
                    donVi = await app.model.dmDonVi.get({
                        statement: 'LOWER(ten) = :thoiChucVuDataTenDonVi',
                        parameter: { thoiChucVuDataTenDonVi: thoiChucVuData.tenDonVi.trim().toLowerCase() }
                    });
                    if (!donVi) {
                        thoiChucVuData.errorCode.push(10);
                        thoiChucVuData.isError = true;
                    } else {
                        thoiChucVuData.maDonVi = donVi.ma;
                        thoiChucVuData.tenDonVi = thoiChucVuData.tenDonVi.trim().toUpperCase();
                    }
                }

                /**
                 * Kiểm tra tên bộ môn có hợp lệ cho phép rỗng
                 */
                let boMon = null;
                if (thoiChucVuData.tenBoMon) {
                    boMon = await app.model.dmBoMon.get({
                        statement: 'LOWER(ten) = :thoiChucVuDataTenBoMon',
                        parameter: { thoiChucVuDataTenBoMon: thoiChucVuData.tenBoMon.trim().toLowerCase() }
                    });
                    if (!boMon) {
                        thoiChucVuData.errorCode.push(12);
                        thoiChucVuData.isError = true;
                    } else {
                        thoiChucVuData.maBoMon = boMon.ma;
                        thoiChucVuData.tenBoMon = thoiChucVuData.tenBoMon.trim().toUpperCase();
                    }
                }


                /**
                 * Kiểm tra số quyết định
                 */
                if (!thoiChucVuData.soQuyetDinh) {
                    /**
                     * TODO
                     */
                } else {
                    /**
                     * TODO
                     */
                }
                /***************************************************************************************/

                /**
                 * Kiểm tra ngày quyết định
                 */
                if (!thoiChucVuData.ngayQuyetDinh) {
                    /**
                     * TODO
                     */
                    thoiChucVuData.errorCode.push(5);
                    thoiChucVuData.isError = true;
                } else if (!thoiChucVuData.ngayQuyetDinh.includes('/') && !thoiChucVuData.ngayQuyetDinh.includes('-')) {
                    /**
                     * TODO
                     */
                    thoiChucVuData.errorCode.push(6);
                    thoiChucVuData.isError = true;
                } else {
                    let [day, month, year] = thoiChucVuData.ngayQuyetDinh.includes('/') ? thoiChucVuData.ngayQuyetDinh.split('/').map(item => Number(item)) : thoiChucVuData.ngayQuyetDinh.split('-').map(item => Number(item));
                    thoiChucVuData.ngayQuyetDinh = new Date(year, month - 1, day, 0, 0, 0).getTime();
                }

                thoiChucVuData = {
                    ...thoiChucVuData,
                    errorDetail: thoiChucVuData.errorCode.map(id => errorDescription[id]),
                    warningDetail: thoiChucVuData.warningCode.map(id => warningDescription[id])
                };

                if (thoiChucVuData.isError) {
                    invalidThoiChucVuItems.push(thoiChucVuData);
                } else {
                    thoiChucVuItems.push(thoiChucVuData);
                }
            }
            index += 1;
        }

        return { thoiChucVuItems, invalidThoiChucVuItems };
    };

    const checkBoNhiemThoiChucVuLogic = async (boNhiemItems, thoiChucVuItems) => {
        boNhiemItems = boNhiemItems.sort((lhs, rhs) => {
            return ((lhs.mscb < rhs.mscb) || (lhs.mscb == rhs.mscb && lhs.maDonVi < rhs.maDonVi) || (lhs.mscb == rhs.mscb && lhs.maDonVi == rhs.maDonVi && lhs.maChucVu < rhs.maChucVu)) ? -1 : 1;
        });
        thoiChucVuItems = thoiChucVuItems.sort((lhs, rhs) => {
            return (lhs.mscb < rhs.mscb) || (lhs.mscb == rhs.mscb && lhs.maDonVi < rhs.maDonVi) || (lhs.mscb == rhs.mscb && lhs.maDonVi == rhs.maDonVi && lhs.maChucVu < rhs.maChucVu) ? -1 : 1;
        });

        const failedItemGroupsObject = {};

        /**
         * Kiểm tra dữ liệu bị trùng
         */
        for (let i = 0; i < boNhiemItems.length - 1; i += 1) {
            if (boNhiemItems[i].isIllegal) {
                continue;
            }
            let idx = 1;
            let lhs = boNhiemItems[i];
            let duplicateItemGroup = [];
            while (i + idx < boNhiemItems.length) {
                let rhs = boNhiemItems[i + idx];
                if (lhs.mscb == rhs.mscb && lhs.maDonVi == rhs.maDonVi && lhs.maChucVu == rhs.maChucVu) {
                    if (duplicateItemGroup.length == 0) {
                        boNhiemItems[i].isIllegal = true;
                        duplicateItemGroup.push(lhs);
                    }
                    boNhiemItems[i + idx].isIllegal = true;
                    duplicateItemGroup.push(rhs);
                    idx += 1;
                } else {
                    break;
                }
            }
            if (duplicateItemGroup.length > 0) {
                let failedItemGroupsIdx = Object.keys(failedItemGroupsObject).length;
                failedItemGroupsObject[failedItemGroupsIdx] = {
                    message: 'Trùng lặp dữ liệu cán bộ, đơn vị, chức vụ',
                    itemGroup: duplicateItemGroup
                };
            }
        }

        for (let i = 0; i < thoiChucVuItems.length - 1; i += 1) {
            if (thoiChucVuItems[i].isIllegal) {
                continue;
            }
            let idx = 1;
            let lhs = thoiChucVuItems[i];
            let duplicateItemGroup = [];
            while (i + idx < thoiChucVuItems.length) {
                let rhs = thoiChucVuItems[i + idx];
                if (lhs.mscb == rhs.mscb && lhs.maDonVi == rhs.maDonVi && lhs.maChucVu == rhs.maChucVu) {
                    if (duplicateItemGroup.length == 0) {
                        thoiChucVuItems[i].isIllegal = true;
                        duplicateItemGroup.push(lhs);
                    }
                    thoiChucVuItems[i + idx].isIllegal = true;
                    duplicateItemGroup.push(rhs);
                    idx += 1;
                } else {
                    break;
                }
            }
            if (duplicateItemGroup.length > 0) {
                let failedItemGroupsIdx = Object.keys(failedItemGroupsObject).length;
                failedItemGroupsObject[failedItemGroupsIdx] = {
                    message: 'Trùng lặp dữ liệu cán bộ, đơn vị, chức vụ',
                    itemGroup: duplicateItemGroup
                };
            }
        }

        /**
         * Kiểm tra vô tình vừa thôi chức vụ, vừa tái bộ nhiệm 1 cán bộ cùng 1 chức vụ tại 1 đơn vị
         */
        let boNhiemItemsIdx = 0;
        let thoiChucVuItemsIdx = 0;
        while (boNhiemItemsIdx < boNhiemItems.length && thoiChucVuItemsIdx < thoiChucVuItems.length) {
            let boNhiemItem = boNhiemItems[boNhiemItemsIdx];
            let thoiChucVuItem = thoiChucVuItems[thoiChucVuItemsIdx];
            if (thoiChucVuItem.isIllegal || (boNhiemItem.mscb > thoiChucVuItem.mscb) || (boNhiemItem.mscb == thoiChucVuItem.mscb && boNhiemItem.maDonVi > thoiChucVuItem.maDonVi) || (boNhiemItem.mscb == thoiChucVuItem.mscb && boNhiemItem.maDonVi == thoiChucVuItem.maDonVi && boNhiemItem.maChucVu > thoiChucVuItem.maChucVu)) {
                thoiChucVuItemsIdx += 1;
            } else if (boNhiemItem.isIllegal || (boNhiemItem.mscb < thoiChucVuItem.mscb) || (boNhiemItem.mscb == thoiChucVuItem.mscb && boNhiemItem.maDonVi < thoiChucVuItem.maDonVi) || (boNhiemItem.mscb == thoiChucVuItem.mscb && boNhiemItem.maDonVi == thoiChucVuItem.maDonVi && boNhiemItem.maChucVu < thoiChucVuItem.maChucVu)) {
                boNhiemItemsIdx += 1;
            } else {
                boNhiemItems[boNhiemItemsIdx].isIllegal = true;
                thoiChucVuItems[thoiChucVuItemsIdx].isIllegal = true;
                let failedItemGroupsIdx = Object.keys(failedItemGroupsObject).length;
                failedItemGroupsObject[failedItemGroupsIdx] = {
                    message: 'Lỗi vừa thôi chức vụ, vừa tái bổ nhiệm một cán bộ cùng một chức vụ, tại cùng 1 đơn vị',
                    itemGroup: [
                        boNhiemItem,
                        thoiChucVuItem
                    ]
                };
                boNhiemItemsIdx += 1;
                thoiChucVuItemsIdx += 1;
            }
        }

        /**
         * Kiểm tra cán bộ có đang giữ chức vụ bị thôi
         */
        for (const thoiChucVuItem of thoiChucVuItems) {
            if (thoiChucVuItem.isIllegal) {
                continue;
            }
            const qtChucVuBiThoi = await app.model.qtChucVu.get({
                statement: 'TRIM(SHCC) = :mscb AND TRIM(MA_CHUC_VU) = :maChucVu AND TRIM(MA_DON_VI) = :maDonVi AND THOI_CHUC_VU = 0',
                parameter: {
                    mscb: thoiChucVuItem.mscb.trim(),
                    maChucVu: thoiChucVuItem.maChucVu.trim(),
                    maDonVi: thoiChucVuItem.maDonVi
                }
            });
            if (!qtChucVuBiThoi) {
                thoiChucVuItem.isIllegal = true;
                let failedItemGroupsIdx = Object.keys(failedItemGroupsObject).length;
                failedItemGroupsObject[failedItemGroupsIdx] = {
                    message: 'Cán bộ hiện đang không giữ chức vụ này nên không thể bị thôi chức vụ',
                    itemGroup: [thoiChucVuItem]
                };
            }
        }

        /**
         * Cán bộ bổ nhiệm một lúc nhiều chức vụ bị trùng đơn vị
         */
        for (let i = 0; i < boNhiemItems.length - 1; i += 1) {
            if (boNhiemItems[i].isIllegal) {
                continue;
            }
            let idx = 1;
            let lhs = boNhiemItems[i];
            let duplicateItemGroup = [];
            while (i + idx < boNhiemItems.length) {
                let rhs = boNhiemItems[i + idx];
                if (lhs.mscb == rhs.mscb && lhs.maDonVi == rhs.maDonVi) {
                    if (duplicateItemGroup.length == 0) {
                        boNhiemItems[i].isIllegal = true;
                        duplicateItemGroup.push(lhs);
                    }
                    boNhiemItems[i + idx].isIllegal = true;
                    duplicateItemGroup.push(rhs);
                    idx += 1;
                } else {
                    break;
                }
            }
            if (duplicateItemGroup.length > 0) {
                let failedItemGroupsIdx = Object.keys(failedItemGroupsObject).length;
                failedItemGroupsObject[failedItemGroupsIdx] = {
                    message: 'Cán bộ được bổ nhiểm 2 chức vụ hay nhiều hơn cho cùng 1 đơn vị',
                    itemGroup: duplicateItemGroup
                };
            }
        }

        /**
         * Cán bộ chỉ bổ nhiệm 1 chức vụ ở 1 đơn vị, tuy nhiên đã nắm 1 chức vụ ở đơn vị đó và không xuất hiện combo:(cán bộ,chức vụ,đơn vị) đó trong import thôi chức vụ
         */
        for (let i = 0; i < boNhiemItems.length; i += 1) {
            if (boNhiemItems[i].isIllegal) {
                continue;
            }
            const qtChucVuItem = await app.model.qtChucVu.get({
                statement: 'MA_DON_VI = :maDonVi AND SHCC = :mscb AND THOI_CHUC_VU = 0',
                parameter: {
                    maDonVi: boNhiemItems[i].maDonVi,
                    mscb: boNhiemItems[i].mscb
                }
            });
            if (qtChucVuItem) {
                const thoiChucVuItem = thoiChucVuItems.filter((item) => item.maDonVi == qtChucVuItem.maDonVi && item.mscb == qtChucVuItem.shcc && item.maChucVu == qtChucVuItem.maChucVu)[0];
                if (!thoiChucVuItem) {
                    let failedItemGroupsIdx = Object.keys(failedItemGroupsObject).length;
                    failedItemGroupsObject[failedItemGroupsIdx] = {
                        message: 'Cán bộ hiện đã nắm giữ 1 chức vụ trong đơn vị, không được phép bổ nhiệm nếu không thôi chức vụ cũ của cán bộ trong đơn vị',
                        itemGroup: [boNhiemItems[i]]
                    };
                    boNhiemItems[i].isIllegal = true;
                }
            }
        }


        /**
         * Gom dữ liệu từ boNhiemItems và thoiChucVuItems về itemGroupsByShcc (Bổ nhiệm/thôi chức vụ theo 1 cán bộ)
         */
        let itemGroupsByShcc = {};
        let shccList = (boNhiemItems.concat(thoiChucVuItems)).map(item => item.mscb);
        shccList.forEach((shcc) => {
            if (!(shcc in itemGroupsByShcc)) {
                itemGroupsByShcc[shcc] = {
                    boNhiem: [],
                    thoiChucVu: []
                };
            }
        });

        boNhiemItems.forEach(boNhiemItem => {
            if (!boNhiemItem.isIllegal) {
                itemGroupsByShcc[boNhiemItem.mscb].boNhiem.push(boNhiemItem);
            }
        });

        thoiChucVuItems.forEach(thoiChucVuItem => {
            if (!thoiChucVuItem.isIllegal) {
                itemGroupsByShcc[thoiChucVuItem.mscb].thoiChucVu.push(thoiChucVuItem);
            }
        });

        /**
         * Đếm số chức vụ chính trong cả import bổ nhiệm của cán bộ:
         * 0 cái -> Kiểm tra coi có cái qtChucVu nào chính chưa hoặc có bổ nhiệm cái chính nào mới không, nếu không thì trừ trường hợp cán bộ bị thôi hết tất cả chức vụ sẽ báo lỗi
         * 1 cái -> Ok
         * 2 hoặc nhiều hơn -> Lỗi
         */
        let boNhiemChucVuChinhByShcc = {};
        for (let shcc of Object.keys(itemGroupsByShcc)) {
            boNhiemChucVuChinhByShcc[shcc] = itemGroupsByShcc[shcc].boNhiem.filter(item => item.chucVuChinh == 1);

            if (boNhiemChucVuChinhByShcc[shcc].length >= 2) {
                let failedItemGroupsIdx = Object.keys(failedItemGroupsObject).length;
                failedItemGroupsObject[failedItemGroupsIdx] = {
                    message: 'Không được bổ nhiệm nhiều hơn 1 chức vụ chính đồng thời cho 1 cán bộ',
                    itemGroup: boNhiemChucVuChinhByShcc[shcc]
                };
                boNhiemChucVuChinhByShcc[shcc].forEach((refItem) => {
                    refItem.isIllegal = true;
                });
            }
            else if (boNhiemChucVuChinhByShcc[shcc].length == 1) {
                let canBo = await app.model.tchcCanBo.get({ shcc });
                if (boNhiemChucVuChinhByShcc[shcc][0].maDonVi != canBo.maDonVi) {
                    const donVi = await app.model.dmDonVi.get({ ma: canBo.maDonVi });
                    boNhiemChucVuChinhByShcc[shcc][0].infoDetail.push(`Cán bộ sẽ chuyển đơn vị từ '${donVi.ten}' sang '${boNhiemChucVuChinhByShcc[shcc][0].tenDonVi}'`);
                }
            }
            else {
                let qtChucVuChinh = await app.model.qtChucVu.get({ shcc, chucVuChinh: 1, thoiChucVu: 0 });
                if (qtChucVuChinh) {
                    let thoiChucVuChinhItem = (itemGroupsByShcc[shcc].thoiChucVu.filter(item => item.maDonVi == qtChucVuChinh.maDonVi && item.maChucVu == qtChucVuChinh.maChucVu && item.mscb == qtChucVuChinh.shcc))[0];
                    if (thoiChucVuChinhItem) {
                        /**
                         * Trừ khi cán bộ A bị thôi tất cả các chức vụ cũ và không hề được bổ nhiệm bất cứ chức vụ mới, không được phép thôi chức vụ hiện tại
                         */
                        const checkIsAllChucVuBiThoi = async () => {
                            let allQtChucVuByShcc = await app.model.qtChucVu.getAll({ shcc, thoiChucVu: 0 });
                            let countThoiChucVu = 0;
                            allQtChucVuByShcc.forEach((qtChucVuItem) => {
                                let matchedThoiChucVuItem = (itemGroupsByShcc[shcc].thoiChucVu.filter(thoiChucVuItem => thoiChucVuItem.maDonVi == qtChucVuItem.maDonVi && thoiChucVuItem.maChucVu == qtChucVuItem.maChucVu && thoiChucVuItem.mscb == qtChucVuItem.shcc))[0];
                                if (matchedThoiChucVuItem) {
                                    countThoiChucVu += 1;
                                }
                            });
                            return countThoiChucVu == allQtChucVuByShcc.length;
                        };
                        if (itemGroupsByShcc[shcc].boNhiem.length > 0 || !(await checkIsAllChucVuBiThoi())) {
                            let failedItemGroupsIdx = Object.keys(failedItemGroupsObject).length;
                            failedItemGroupsObject[failedItemGroupsIdx] = {
                                message: 'Những cán bộ có nắm ít nhất 1 chức vụ trong trường thì yêu cầu bắt buộc phải có 1 chức vụ là chức vụ chính và là đơn vị công tác của cán bộ đó (hệ thống sẽ tự động luân chuyển đơn vị công tác cho cán bộ trong trường hợp chức vụ chính nằm ở đơn vị mới)',
                                itemGroup: [thoiChucVuChinhItem]
                            };
                            thoiChucVuChinhItem.isIllegal = true;
                        }
                    }
                } else {
                    let boNhiemChucVuChinhItem = itemGroupsByShcc[shcc].boNhiem.filter(item => item.chucVuChinh == 1)[0];
                    if (!boNhiemChucVuChinhItem) {
                        let failedItemGroupsIdx = Object.keys(failedItemGroupsObject).length;
                        failedItemGroupsObject[failedItemGroupsIdx] = {
                            message: 'Bổ nhiệm 1 hay nhiều chức vụ cho cán bộ chưa nắm chức vụ nào trước đó thì yêu cầu tồn tại một quyết định bổ nhiệm chức vụ chính',
                            itemGroup: itemGroupsByShcc[shcc].boNhiem
                        };
                        itemGroupsByShcc[shcc].boNhiem.forEach(item => {
                            item.isIllegal = true;
                        });
                    }
                }
            }
        }

        const validBoNhiemItems = boNhiemItems.filter(item => !item.isIllegal);
        const validThoiChucVuItems = thoiChucVuItems.filter(item => !item.isIllegal);

        const validItemGroupsByDonViObject = {};
        const donViList = validThoiChucVuItems.concat(validBoNhiemItems).map(item => ({ maDonVi: item.maDonVi, tenDonVi: item.tenDonVi }));
        donViList.forEach(({ maDonVi, tenDonVi }) => {
            if (!(maDonVi in validItemGroupsByDonViObject)) {
                validItemGroupsByDonViObject[maDonVi] = {
                    tenDonVi,
                    itemsNum: 0,
                    itemGroup: []
                };
            }
        });

        (validBoNhiemItems.concat(validThoiChucVuItems)).forEach((validItem) => {
            const { maDonVi } = validItem;
            validItemGroupsByDonViObject[maDonVi].itemGroup.push(validItem);
            validItemGroupsByDonViObject[maDonVi].itemsNum += 1;
        });

        let failedItemGroups = [];
        for (let index of Object.keys(failedItemGroupsObject)) {
            failedItemGroups.push(failedItemGroupsObject[index]);
        }
        let validItemGroupsByDonVi = [];
        for (let maDonVi of Object.keys(validItemGroupsByDonViObject)) {
            validItemGroupsByDonVi.push({
                maDonVi,
                itemsNum: validItemGroupsByDonViObject[maDonVi].itemsNum,
                tenDonVi: validItemGroupsByDonViObject[maDonVi].tenDonVi,
                itemGroup: validItemGroupsByDonViObject[maDonVi].itemGroup
            });
        }

        return { failedItemGroups, validItemGroupsByDonVi };
    };

    const errorDescription = {
        1: 'Thiếu mã số cán bộ',
        2: 'Không tồn tại cán bộ với mã số cán bộ này',
        3: 'Thiếu họ hoặc tên',
        4: 'Họ tên của cán bộ với mã số này không khớp với thông tin lưu trong hệ thống',
        5: 'Thiếu ngày quyết định',
        6: 'Ngày quyết định không hợp lệ (dd/mm/yyyy hoặc dd-mm-yyyy)',
        7: 'Thiếu tên chức vụ',
        8: 'Không tồn tại tên chức vụ này (tham khảo ở sheet TEN_CHUC_VU gửi kèm trong template)',
        9: 'Thiếu tên đơn vị',
        10: 'Không tồn tại tên đơn vị này (tham khảo ở sheet TEN_DON_VI gửi kèm trong template)',
        11: '',
        12: 'Không tồn tại tên bộ môn này (tham khảo ở sheet TEN_BO_MON gửi kèm trong template)',
        13: 'Thiếu thông tin chức vụ chính hay phụ, vui lòng điền 1 (chính) hay 0 (phụ)',
        14: 'Thông tin chức vụ chính phụ không hợp lệ, vui lòng điền 1 (chính) hay 0 (phụ)',
    };
    const warningDescription = {};

    const qtChucVuBoNhiemThoiChucVuUploadHook = async (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'tccbQtChucVuBoNhiemThoiChucVu' && files.tccbQtChucVuBoNhiemThoiChucVu && files.tccbQtChucVuBoNhiemThoiChucVu.length) {
            const srcPath = files.tccbQtChucVuBoNhiemThoiChucVu[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                const boNhiemSheet = workbook.getWorksheet('BoNhiem');
                const thoiChucVuSheet = workbook.getWorksheet('ThoiChucVu');

                if (!boNhiemSheet && !thoiChucVuSheet) {
                    done && done({ error: 'Invalid worksheet!' });
                } else {
                    let boNhiemItems = [],
                        invalidBoNhiemItems = [],
                        thoiChucVuItems = [],
                        invalidThoiChucVuItems = [];
                    /**
                     * Kiểm tra dòng dữ liệu về hoạt động bổ nhiệm/thôi chức vụ có đúng đắn về mặt dữ liệu thành phần (format trong từng cell, check trùng khớp với dữ liệu đã có trong database)
                     */
                    if (boNhiemSheet) {
                        const results = await checkBoNhiemSheetDataFormat(boNhiemSheet);
                        boNhiemItems = results.boNhiemItems;
                        invalidBoNhiemItems = results.invalidBoNhiemItems;
                    }
                    if (thoiChucVuSheet) {
                        const results = await checkThoiChucVuSheetDataFormat(thoiChucVuSheet);
                        thoiChucVuItems = results.thoiChucVuItems;
                        invalidThoiChucVuItems = results.invalidThoiChucVuItems;
                    }

                    /**
                     * Kiểm tra dữ liệu bổ nhiệm về hoạt động bổ nhiệm/thôi chức vụ có đúng đắn về mặt nghiệp vụ
                     */
                    const { failedItemGroups, validItemGroupsByDonVi } = await checkBoNhiemThoiChucVuLogic(boNhiemItems, thoiChucVuItems);


                    done && done({ invalidBoNhiemItems, invalidThoiChucVuItems, validItemGroupsByDonVi, failedItemGroups });
                }
            }
        }
    };
};

/// End Others APIs -------------------------------------------------------------------------------------------------------------------------------