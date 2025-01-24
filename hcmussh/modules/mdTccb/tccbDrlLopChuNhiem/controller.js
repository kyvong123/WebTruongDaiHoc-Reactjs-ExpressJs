module.exports = app => {
    const menuStaff = {
        parentMenu: app.parentMenu.students,
        menus: {
            6173: { title: 'Điểm rèn luyện', subTitle: 'Giáo viên chủ nhiệm', link: '/user/lop-chu-nhiem/quan-ly-drl', icon: 'fa-calculator', backgroundColor: '#ac2d34', groupIndex: 2 },
        },
    };

    app.permission.add(
        { name: 'staff:form-teacher', menu: menuStaff },
    );


    app.permissionHooks.add('staff', 'addRoleLopChuNhiemDrl', (user, staff) => new Promise(resolve => {
        if (user) {
            app.dkhpRedis.getBanCanSuLop({ userId: staff.shcc }, (item) => {
                if (item) {
                    app.permissionHooks.pushUserPermission(user, 'staff:form-teacher');
                    resolve();
                } else resolve();
            });
        } else resolve();
    }));

    app.get('/user/lop-chu-nhiem/quan-ly-drl', app.permission.check('staff:form-teacher'), app.templates.admin);
    app.get('/user/lop-chu-nhiem/danh-gia-drl/:mssv', app.permission.check('staff:form-teacher'), app.templates.admin);

    //  API ============================================================================================================================
    app.get('/api/tccb/lop-chu-nhiem/quan-ly-drl/page/:pageNumber/:pageSize', app.permission.orCheck('staff:form-teacher'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            let { condition, filter, sortTerm = 'ten_ASC' } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            const thongTinDot = await app.model.svDotDanhGiaDrl.get({ namHoc: filter.namHoc, hocKy: filter.hocKy }, '*', 'ID DESC');
            let page = await app.model.svDrlDanhGia.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list }, thongTinDot });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/lop-chu-nhiem/danh-gia-drl/tieu-chi', app.permission.check('staff:form-teacher'), async (req, res) => {
        try {
            const { namHoc, hocKy, mssv } = req.query,
                svDot = await app.model.svDotDanhGiaDrl.get({ namHoc, hocKy }, '*', 'ID DESC'),
                dsTieuChi = await app.model.svBoTieuChi.getAll({ maCha: null, kichHoat: 1, idBo: svDot ? svDot.maBoTc : null }, '*', 'STT ASC');
            const lsDiemDanhGia = await app.model.svDrlDanhGia.getAll({ mssv, namHoc, hocKy }, '*', 'MA ASC'),
                // Build Map tiêu chí theo mã
                objDiemDanhGia = Object.assign({}, ...lsDiemDanhGia.map(tieuChi => ({ [tieuChi.maTieuChi]: tieuChi })));
            const initDsTieuChi = async (list) => {
                await Promise.all(list.map(async item => {
                    item.lyDoLt = objDiemDanhGia[item.ma]?.lyDoLt;
                    item.lyDoF = objDiemDanhGia[item.ma]?.lyDoF;
                    const tieuChiCon = (await app.model.svBoTieuChi.getAll({ maCha: item.ma, kichHoat: 1 }, '*', 'STT ASC'));
                    if (!tieuChiCon.length) {
                        item.dsTieuChiCon = [];
                    } else {
                        item.dsTieuChiCon = tieuChiCon;
                        await initDsTieuChi(item.dsTieuChiCon);
                    }
                }));
            };
            await initDsTieuChi(dsTieuChi);

            const tongKetInfo = await app.model.svDiemRenLuyen.get({ mssv, namHoc, hocKy }, '*') || {};
            tongKetInfo.kyLuat = await app.model.svQtKyLuat.getDrlMapKyLuat(mssv, namHoc, hocKy);
            if (tongKetInfo.tkSubmit) { //Đã tổng kết
                tongKetInfo.tkSubmitChu = app.utils.numberToVnText(tongKetInfo.tkSubmit);
            }
            // else if (tongKetInfo.fSubmit) { //Đã có điểm chỉnh sửa khoa
            //     tongKetInfo.tkSubmitChu = app.utils.numberToVnText(tongKetInfo.fSubmit);
            // } else { //Điểm khoa chấm như điểm LT
            //     const fSubmit = dsTieuChi.reduce((cumm, tieuChi) => cumm + parseInt(objDiemDanhGia[tieuChi.ma]?.diemF || 0), 0);
            //     fSubmit > 0 && (tongKetInfo.fSubmit = fSubmit);
            //     tongKetInfo.tkSubmitChu = app.utils.numberToVnText(tongKetInfo.fSubmit);
            // }

            let diemTrungBinh;
            if (tongKetInfo && (tongKetInfo.diemTb || tongKetInfo.diemTb == 0))
                diemTrungBinh = tongKetInfo.diemTb;
            else
                ({ diemTrungBinh } = (await app.model.dtDiemTrungBinh.get({ mssv, namHoc, hocKy })) || {});

            const items = {
                lsBoTieuChi: dsTieuChi,
                lsDiemDanhGia,
                tongKetInfo,
                diemTrungBinh
            };
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/tccb/lop-chu-nhiem/quan-ly-drl/download-excel', app.permission.check('staff:form-teacher'), async (req, res) => {
        try {
            const { condition, filter } = req.query;
            const searchTerm = typeof condition === 'string' ? condition : '';
            let data = await app.model.svDrlDanhGia.downloadExcel(searchTerm, filter);
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('DS_SV_DRL');
            ws.columns = [
                { header: 'STT', key: 'stt', width: 8 },
                { header: 'MSSV', key: 'mssv', width: 15 },
                { header: 'HỌ', key: 'hoSinhVien', width: 20 },
                { header: 'TÊN', key: 'tenSinhVien', width: 20 },
                { header: 'KHOA', key: 'khoa', width: 15, wrapText: false },
                { header: 'ĐIỂM SV', key: 'diemSv', width: 15 },
                { header: 'ĐIỂM LỚP', key: 'diemLt', width: 15 },
                { header: 'ĐIỂM KHOA', key: 'diemF', width: 15 },
                { header: 'ĐIỂM TỔNG KẾT', key: 'diemTk', width: 15 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: false };
            ws.getRow(1).font = { name: 'Times New Roman' };

            data.rows.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    mssv: item.mssv,
                    hoSinhVien: item.ho,
                    tenSinhVien: item.ten,
                    khoa: item.tenKhoa,
                    diemSv: item.diemSv,
                    diemLt: item.diemLt,
                    diemF: item.diemF,
                    diemTk: item.diemTk
                }, 'i');
            });
            const fileName = `DS_SV_DRL_${JSON.parse(filter).namHoc}_HK${JSON.parse(filter).hocKy}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};