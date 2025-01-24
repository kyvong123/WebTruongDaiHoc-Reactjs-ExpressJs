module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5020: { title: 'Miễn giảm', link: '/user/finance/mien-giam', icon: 'fa fa-gift', backgroundColor: '#9ACD32', color: '#000', groupIndex: 0 } },
    };

    app.permission.add(
        { name: 'tcMienGiam:read', menu },
        { name: 'tcMienGiam:write' },
        { name: 'tcMienGiam:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcMienGiam', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcMienGiam:read', 'tcMienGiam:write', 'tcMienGiam:delete');
            resolve();
        } else resolve();
    }));

    const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'hocPhiHuongDan');


    app.get('/user/finance/mien-giam', app.permission.check('tcMienGiam:read'), app.templates.admin);

    app.get('/api/khtc/mien-giam/search/:pageNumber/:pageSize', app.permission.check('tcMienGiam:read'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const settings = await getSettings();
            const namHoc = filter.namHoc || settings.hocPhiNamHoc;
            const hocKy = filter.hocKy || settings.hocPhiHocKy;
            const filterData = app.utils.stringify({ ...filter, namHoc, hocKy });
            const pageCondition = req.query.searchTerm;
            const page = await app.model.tcMienGiam.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, filter, settings: { namHoc, hocKy } }
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/mien-giam/get-dssv', app.permission.check('tcMienGiam:read'), async (req, res) => {
        try {
            const { namHoc, hocKy } = req.query;
            const { rows: items } = await app.model.svDsMienGiam.getDssv(namHoc, hocKy);
            res.send({ items: items.filter(item => item.isHoan == 0 && (!item.tcMucGiam || parseInt(item.phanTramMienGiam) > parseInt(item.tcMucGiam))) });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/mien-giam/multiple', app.permission.check('tcMienGiam:read'), async (req, res) => {
        try {
            let { namHoc, hocKy, overwrite, items: preItems } = req.body;
            namHoc = parseInt(namHoc.split('-')[0]);
            let [{ rows: listHocPhi }, listMienGiam] = await Promise.all([
                app.model.tcHocPhiDetail.getHocPhi(namHoc, hocKy),
                app.model.tcMienGiam.getAll({ namHoc, hocKy }, 'mssv')
            ]);
            if (!listHocPhi.length) throw `Chưa tạo học phí cho học kỳ ${hocKy} năm học ${namHoc}!`;
            const items = [], failed = [];

            for (let [index, row] of preItems.entries()) {
                try {
                    row.namHoc = namHoc;
                    row.hocKy = hocKy;
                    const hocPhi = listHocPhi.find(hp => hp.mssv == row.mssv);
                    if (!hocPhi) {
                        throw { rowNumber: index + 1, color: 'danger', message: `Chưa tạo học phí cho học kỳ ${hocKy} năm học ${namHoc} cho sinh viên ${row.mssv}!` };
                    } else if (listMienGiam.some(mg => mg.mssv == row.mssv)) {
                        if (parseInt(overwrite)) {
                            row.update = true;
                            failed.push({ rowNumber: index + 1, color: 'success', message: `Miễn giảm sinh viên ${row.mssv} đã được cập nhật` });
                        } else throw { rowNumber: index + 1, color: 'warning', message: `Sinh viên ${row.mssv} đã được áp dụng miễn giảm trước đó` };
                    }
                    row.hocPhi = hocPhi.soTien;
                    row.loaiPhi = hocPhi.loaiPhi;
                    const phanTramMienGiam = Number(row.phanTramMienGiam.replace('%', '').trim());
                    if (!Number.isInteger(phanTramMienGiam))
                        throw { rowNumber: index + 1, color: 'danger', message: 'Phần trăm miễn giảm không hợp lệ' };
                    row.phanTramMienGiam = phanTramMienGiam;
                    row.soTienMienGiam = row.hocPhi * row.phanTramMienGiam / 100;
                    items.push(row);
                } catch (error) {
                    console.error({ error });
                    failed.push(error);
                }
            }
            await Promise.all(items.map(async item => {
                item.update ?
                    await app.model.tcMienGiam.update({ namHoc, hocKy, mssv: item.mssv }, item)
                    :
                    await app.model.tcMienGiam.create(item);
                await app.model.tcDotDong.dongBoHocPhi(namHoc, hocKy, item.mssv, null, null, 1);
            }));
            res.send({ failed });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/mien-giam/down-load-excel', app.permission.check('tcMienGiam:read'), async (req, res) => {
        try {
            const filter = req.query.filter;
            const { rows: list } = await app.model.tcMienGiam.downloadExcel(filter);
            const { namHoc, hocKy } = app.utils.parse(filter);
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet(`Danh sách miễn giảm ${namHoc} - ${parseInt(namHoc) + 1} HK ${hocKy}`);
            ws.columns = [{ header: 'STT', key: 'stt', width: 5 }, ...Object.keys(list[0] || {}).map(key => ({ header: key.toString(), key, width: 30 }))];
            list.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });
            app.excel.attachment(workBook, res, `DanhSachMienGiam${namHoc}HK${hocKy}.xlsx`);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};
