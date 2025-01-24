module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.khcn,
        menus: {
            9502: { title: 'Bài viết khoa học', link: '/user/khcn/qua-trinh/bai-viet-khoa-hoc', icon: 'fa-file-text-o', backgroundColor: '#23a0b0' },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1008: { title: 'Bài viết khoa học', link: '/user/bai-viet-khoa-hoc', icon: 'fa-file-text-o', backgroundColor: '#23a0b0', groupIndex: 7 },
        },
    };

    const menuTCCB = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3021: { title: 'Bài viết khoa học', link: '/user/tccb/qua-trinh/bai-viet-khoa-hoc', icon: 'fa-file-text-o', backgroundColor: '#23a0b0', groupIndex: 7 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtBaiVietKhoaHoc:read', menu },
        { name: 'qtBaiVietKhoaHoc:readOnly', menu: menuTCCB },
        { name: 'qtBaiVietKhoaHoc:write' },
        { name: 'qtBaiVietKhoaHoc:delete' },
    );

    app.get('/user/khcn/qua-trinh/bai-viet-khoa-hoc', app.permission.check('qtBaiVietKhoaHoc:read'), app.templates.admin);
    app.get('/user/:khcn/qua-trinh/bai-viet-khoa-hoc/group/:shcc', app.permission.check('qtBaiVietKhoaHoc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/bai-viet-khoa-hoc', app.permission.check('qtBaiVietKhoaHoc:readOnly'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/bai-viet-khoa-hoc/group/:shcc', app.permission.check('qtBaiVietKhoaHoc:readOnly'), app.templates.admin);
    app.get('/user/bai-viet-khoa-hoc', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    //User Actions:
    app.get('/api/khcn/user/qua-trinh/bai-viet-khoa-hoc/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.qtBaiVietKhoaHoc.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    //END USER ACTIONS

    app.get('/api/khcn/qua-trinh/bai-viet-khoa-hoc/page/:pageNumber/:pageSize', app.permission.orCheck('qtBaiVietKhoaHoc:read', 'qtBaiVietKhoaHoc:readOnly'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            const page = await app.model.qtBaiVietKhoaHoc.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khcn/qua-trinh/bai-viet-khoa-hoc/group/page/:pageNumber/:pageSize', app.permission.orCheck('qtBaiVietKhoaHoc:read', 'qtBaiVietKhoaHoc:readOnly'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            const page = await app.model.qtBaiVietKhoaHoc.groupPage(_pageNumber, _pageSize, app.utils.stringify(filter), searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/khcn/qua-trinh/bai-viet-khoa-hoc', app.permission.check('qtBaiVietKhoaHoc:write'), async (req, res) => {
        try {
            let item = await app.model.qtBaiVietKhoaHoc.create(req.body.data);
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Bài viết khoa học');
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/khcn/qua-trinh/bai-viet-khoa-hoc/create-multiple', app.permission.check('qtBaiVietKhoaHoc:write'), async (req, res) => {
        try {
            const { listShcc, tenTacGia, namXuatBan, tenBaiViet, tenTapChi, soHieuIssn, sanPham, diemIf, quocTe } = req.body.data;
            const solve = async (index = 0) => {
                if (index == listShcc.length) {
                    app.tccbSaveCRUD(req.session.user.email, 'C', 'Bài viết khoa học');
                    res.end();
                    return;
                }
                const shcc = listShcc[index];
                const dataAdd = {
                    shcc, tenTacGia, namXuatBan, tenBaiViet, tenTapChi, soHieuIssn, sanPham, diemIf, quocTe
                };
                await app.model.qtBaiVietKhoaHoc.create(dataAdd);
                solve(index + 1);
            };
            solve();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/khcn/qua-trinh/bai-viet-khoa-hoc', app.permission.check('qtBaiVietKhoaHoc:write'), async (req, res) => {
        try {
            let item = await app.model.qtBaiVietKhoaHoc.update({ id: req.body.id }, req.body.changes);
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Bài viết khoa học');
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/khcn/qua-trinh/bai-viet-khoa-hoc', app.permission.check('qtBaiVietKhoaHoc:write'), async (req, res) => {
        try {
            const id = req.body.id;
            await app.model.qtBaiVietKhoaHoc.delete({ id });
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Bài viết khoa học');
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khcn/qua-trinh/bai-viet-khoa-hoc/download-excel/:listShcc/:listDv/:fromYear/:toYear/:xuatBanRange', app.permission.orCheck('qtBaiVietKhoaHoc:read', 'qtBaiVietKhoaHoc:readOnly'), async (req, res) => {
        try {
            let { listShcc, listDv, fromYear, toYear, xuatBanRange } = req.params ? req.params : { listShcc: null, listDv: null, toYear: null, xuatBanRange: null };
            if (listShcc == 'null') listShcc = null;
            if (listDv == 'null') listDv = null;
            if (fromYear == 'null') fromYear = null;
            if (toYear == 'null') toYear = null;
            if (xuatBanRange == 'null') xuatBanRange = null;
            let result = await app.model.qtBaiVietKhoaHoc.download(listShcc, listDv, fromYear, toYear, xuatBanRange);
            const workbook = app.excel.create(),
                worksheet = workbook.addWorksheet('baivietkhoahoc');
            let cells = [
                { cell: 'A1', value: '#', bold: true, border: '1234' },
                { cell: 'B1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                { cell: 'C1', value: 'Họ và tên cán bộ', bold: true, border: '1234' },
                { cell: 'D1', value: 'Tên tác giả', bold: true, border: '1234' },
                { cell: 'E1', value: 'Năm xuất bản', bold: true, border: '1234' },
                { cell: 'F1', value: 'Tên bài viết', bold: true, border: '1234' },
                { cell: 'G1', value: 'Tên tạp chí', bold: true, border: '1234' },
                { cell: 'H1', value: 'Số hiệu ISSN', bold: true, border: '1234' },
                { cell: 'I1', value: 'Sản phẩm', bold: true, border: '1234' },
                { cell: 'J1', value: 'Điểm IF', bold: true, border: '1234' },
                { cell: 'K1', value: 'Phạm vi xuất bản', bold: true, border: '1234' },
            ];
            result.rows.forEach((item, index) => {
                let hoTen = item.hoCanBo + ' ' + item.tenCanBo;
                cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                cells.push({ cell: 'C' + (index + 2), border: '1234', value: hoTen });
                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenTacGia });
                cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.namXuatBan });
                cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenBaiViet });
                cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenTapChi });
                cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.soHieuIssn });
                cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.sanPham });
                cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.diemIf });
                cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.quocTe ? (item.quocTe == 0 ? 'Trong nước' : item.quocTe == 1 ? 'Quốc tế' : 'Trong và ngoài nước') : '' });
            });
            app.excel.write(worksheet, cells);
            app.excel.attachment(workbook, res, 'baivietkhoahoc.xlsx');
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};