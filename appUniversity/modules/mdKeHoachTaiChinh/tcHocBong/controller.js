module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5025: { title: 'Học bổng', link: '/user/finance/hoc-bong', icon: 'fa fa-star', backgroundColor: '#FF7514', color: '#000', groupIndex: 0 } },
    };

    app.permission.add(
        { name: 'tcHocBong:manage', menu },
    );

    // app.permissionHooks.add('staff', 'addRolestcHocBong', (user, staff) => new Promise(resolve => {
    //     if (staff.maDonVi && staff.maDonVi == '34') {
    //         app.permissionHooks.pushUserPermission(user, 'tcHocBong:manage');
    //         resolve();
    //     } else resolve();
    // }));

    app.get('/user/finance/hoc-bong', app.permission.check('tcHocBong:manage'), app.templates.admin);
    app.get('/user/finance/hoc-bong/detail/:id', app.permission.check('tcHocBong:manage'), app.templates.admin);

    // API =====================================================================

    app.get('/api/khtc/hoc-bong/dot/page/:pageNumber/:pageSize', app.permission.check('tcHocBong:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            let page = await app.model.svDotXetHocBongKkht.searchPage(_pageNumber, _pageSize);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, pagecondition: pageCondition, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/hoc-bong/dssv/page/:pageNumber/:pageSize', app.permission.check('tcHocBong:manage'), async (req, res) => {
        try {
            const { pageNumber: _pageNumber, pageSize: _pageSize } = req.params;
            const { idDot, condition = '', filter = {} } = req.query;
            let { dsCauHinh, page } = await app.model.svDssvHocBongKkht
                .getDsChinhThuc(idDot, parseInt(_pageNumber), parseInt(_pageSize), condition?.toString() ?? '', app.utils.stringify(filter))
                .then(value => ({ page: { pageNumber: value.pagenumber, pageSize: value.pagesize, pageTotal: value.pagetotal, pageCondition: value.searchterm, totalItem: value.totalitem, list: value.rows }, dsCauHinh: value.dscauhinh }));
            page.list = page.list.groupBy('idCauHinh');
            res.send({ page, dsCauHinh });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.post('/api/khtc/hoc-bong/dssv/confirm', app.permission.check('tcHocBong:manage'), async (req, res) => {
        try {
            const { danhSachSinhVien } = req.body,
                handleTime = Date.now(),
                handleStaff = req.session.user.email;

            const result = await Promise.allSettled(danhSachSinhVien.map(({ mssv, idLichSu, soTienThuong }) => app.model.tcHocBong.create({ mssv, idLichSu, soTienThuong, handleStaff, handleTime })));
            const listIdLichSu = new Set(danhSachSinhVien.map(item => item.idLichSu));
            await app.model.svLichSuDssvDieuKienHbkk.update({ statement: 'id in (:listIdLichSu)', parameter: { listIdLichSu: [...listIdLichSu] } }, { tcHandled: 1 });
            res.send({ items: result.filter(item => item.status == 'fulfilled').map(item => item.value) });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/khtc/hoc-bong/dssv/confirm', app.permission.check('tcHocBong:manage'), async (req, res) => {
        try {
            const { mssv, idLichSu } = req.body;
            await app.model.tcHocBong.delete({ mssv, idLichSu });
            const countHandled = await app.model.tcHocBong.count({ idLichSu }).then(value => value.rows[0]['COUNT(*)']);
            if (countHandled == 0) await app.model.svLichSuDssvDieuKienHbkk.update({ id: idLichSu }, { tcHandled: 0 });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/hoc-bong/dssv/download-excel', app.permission.check('tcHocBong:manage'), async (req, res) => {
        try {
            const { idDot } = req.query;
            const [listLichSu, dataDot] = await Promise.all([
                app.model.svDssvHocBongKkht.getDsChinhThuc(idDot).then(value => value.dscauhinh.map(item => ({ idLichSu: item.idLichSu, tenCauHinh: item.tenCauHinh }))),
                app.model.svDotXetHocBongKkht.get({ id: idDot }),
            ]);
            const workBook = app.excel.create();
            for (let { idLichSu, tenCauHinh } of listLichSu) {
                const ws = workBook.addWorksheet(tenCauHinh);
                const result = await app.model.svLichSuDssvDieuKienHbkk.downloadExcel(idLichSu).then(value => value.rows);
                ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(result[0] || {}).map(key => ({ header: key.toString(), key, width: 20 }))];
                result.forEach((item, index) => {
                    ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
                });
            }
            app.excel.attachment(workBook, res, `DANH_SACH_HOC_BONG_${dataDot.namHoc}_KH${dataDot.hocKy}.xlsx`);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};
