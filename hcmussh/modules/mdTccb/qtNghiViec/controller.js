module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3030: { title: 'Cán bộ Nghỉ việc', link: '/user/tccb/qua-trinh/nghi-viec', icon: 'fa-user-times', backgroundColor: '#2a99b8', groupIndex: 0 }
        }
    };
    app.permission.add(
        { name: 'qtNghiViec:read', menu },
        { name: 'qtNghiViec:write' },
        { name: 'qtNghiViec:delete' },
        { name: 'qtNghiViec:export' }
    );
    app.get('/user/tccb/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-viec/create-list', app.permission.check('qtNghiViec:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtNghiViec', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtNghiViec:read', 'qtNghiViec:write', 'qtNghiViec:delete', 'qtNghiViec:export');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/nghi-viec/page/:pageNumber/:pageSize', app.permission.check('qtNghiViec:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = req.query.condition || '';
        let filter = app.utils.stringify(req.query.filter || {});
        app.model.qtNghiViec.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/tccb/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:write'), (req, res) => {
        let data = req.body.data;
        const create = (index = 0) => {
            if (index > data.listShcc.length - 1) {
                app.tccbSaveCRUD(req.session.user.email, 'U', 'Nghỉ việc');
                res.send({ item: 'Success' });
            } else {
                app.model.qtNghiViec.create({ ...data, shcc: data.listShcc[index] }, (error, item) => {
                    if (error) {
                        res.send({ error });
                        return;
                    }
                    app.model.tchcCanBo.update({ shcc: item.shcc }, { ngayNghi: data.ngayNghi }, () => {
                        create(index + 1);
                    });
                });
            }
        };
        create();
    });

    app.put('/api/tccb/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:write'), (req, res) => {
        let changes = req.body.changes;
        app.model.qtNghiViec.update({ ma: req.body.ma }, changes, (error, item) => {
            if (item.shcc) {
                app.model.tchcCanBo.get({ shcc: item.shcc }, (error, canBo) => {
                    if (error || !canBo) res.send({ error, item });
                    else {
                        app.model.tchcCanBo.update({ shcc: item.shcc }, { ngayNghi: item.ngayNghi }, (error, canBo) => {
                            res.send({ error, item, isUpdatedStaff: canBo });
                        });
                    }
                });
            } else res.send({ error, item });
        });
    });

    app.delete('/api/tccb/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:delete'), (req, res) => {
        app.model.qtNghiViec.delete({ ma: req.body.ma }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Nghỉ việc');
            res.send({ error });
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-viec/download-excel/:filter', app.permission.check('qtNghiViec:export'), (req, res) => {
        app.model.qtNghiViec.downloadExcel(req.params.filter, (error, result) => {
            if (error || !result) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('Danh sách nghỉ việc');
                new Promise(resolve => {
                    let cells = [
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'SỐ QĐ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'LÝ DO NGHỈ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'HỌC VỊ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
                        { cell: 'F1', value: 'HỌ TÊN', bold: true, border: '1234' },
                        { cell: 'G1', value: 'GIỚI TÍNH', bold: true, border: '1234' },
                        { cell: 'H1', value: 'NGÀY SINH', bold: true, border: '1234' },
                        { cell: 'I1', value: 'CHỨC DANH NGHỀ NGHIỆP', bold: true, border: '1234' },
                        { cell: 'J1', value: 'CHỨC VỤ', bold: true, border: '1234' },
                        { cell: 'K1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'L1', value: 'NỘI DUNG', bold: true, border: '1234' },
                        { cell: 'M1', value: 'NGÀY NGHỈ', bold: true, border: '1234' },
                        { cell: 'N1', value: 'GHI CHÚ', bold: true, border: '1234' }
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), alignment: 'center', border: '1234', value: item.soQuyetDinh || '' });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.tenLyDo || '' });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenHocVi || '' });

                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.shcc || '' });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.hoTen?.toUpperCase() || `${item.hoCanBo} ${item.tenCanBo}` });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.phai == '01' ? 'Nam' : 'Nữ' });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep || '' });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.tenChucVu || '' });

                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tenDonVi || '' });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.noiDung || '' });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.ngayNghi ? app.date.dateTimeFormat(new Date(item.ngayNghi), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.ghiChu || '' });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'NGHIVIEC.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-viec/get-nghi-huu-year', app.permission.check('qtNghiViec:read'), (req, res) => {
        const yearCalc = req.query.year;
        const endYear = new Date(yearCalc, 11, 31, 23, 59, 59, 999);
        // 1419120000000 = 45 * 365 * 24 * 3600 * 10000 (45 năm)
        app.model.tchcCanBo.getAll({
            statement: 'ngayNghi IS NULL AND (ngaySinh IS NULL OR ngaySinh + 1419120000000 <= :year)',
            parameter: { year: endYear.getTime() }
        }, '*', 'chucDanh', (error, data) => {
            if (error) {
                res.send({ error, items: null });
                return;
            }
            let items = [];
            const solve = (index = 0) => {
                if (index >= data.length) {
                    res.send({ error: null, items });
                    return;
                }
                const item = data[index];
                app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, data) => {
                    if (data) {
                        let canExtend = item.chucDanh == '01' ? 10 : item.chucDanh == '02' ? 7 : (item.hocVi == '01' || item.hocVi == '02') ? 5 : 0;
                        let end = new Date(data.resultDate);
                        end.setFullYear(end.getFullYear() + canExtend);
                        let tenChucDanh = '', tenHocVi = '', tenChucDanhNgheNghiep = '', tenChucVu = '', tenDonVi = '';

                        if (end.getFullYear() == yearCalc) {
                            app.model.dmChucDanhKhoaHoc.get({ ma: item.chucDanh }, (error, itemCD) => {
                                app.model.dmTrinhDo.get({ ma: item.hocVi }, (error, itemHV) => {
                                    app.model.dmNgachCdnn.get({ ma: item.ngach }, (error, itemCDNN) => {
                                        app.model.qtChucVu.get({ shcc: item.shcc, chucVuChinh: 1 }, (error, itemCV) => {
                                            app.model.dmChucVu.get({ ma: itemCV?.maChucVu || '' }, (error, chucVu) => {
                                                app.model.dmDonVi.get({ ma: item.maDonVi }, (error, itemDV) => {
                                                    if (itemCD) tenChucDanh = itemCD.ten;
                                                    if (itemHV) tenHocVi = itemHV.ten;
                                                    if (itemCDNN) tenChucDanhNgheNghiep = itemCDNN.ten;
                                                    if (chucVu) tenChucVu = chucVu.ten;
                                                    if (itemDV) tenDonVi = itemDV.ten;

                                                    let dataAdd = {
                                                        shcc: item.shcc,
                                                        hoCanBo: item.ho,
                                                        tenCanBo: item.ten,
                                                        tenChucDanh,
                                                        tenHocVi,
                                                        tenChucVu,
                                                        tenDonVi,
                                                        tenChucDanhNgheNghiep,
                                                        thoiDiemNghiHuuSauKeoDai: end.getTime(),
                                                        ngayNghiHuu: data.resultDate,
                                                        ngaySinh: item.ngaySinh,
                                                        phai: item.phai,
                                                        dienNghi: item.ngayBienChe ? 1 : 2,
                                                        trinhDoPhoThong: item.trinhDoPhoThong
                                                    };
                                                    items.push(dataAdd);
                                                    solve(index + 1);
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        } else solve(index + 1);
                    } else solve(index + 1);
                });
            };
            solve();
        });
    });

    app.post('/api/tccb/qua-trinh/nghi-viec/multiple-nghi-huu', app.permission.check('qtNghiViec:write'), (req, res) => {
        const listData = req.body.listData, errorList = [];
        const solve = (index = 0) => {
            if (index == listData.length) {
                res.send({ error: errorList });
                return;
            }
            const item = listData[index];
            const data = {
                shcc: item.shcc,
                noiDung: 'QĐ về việc nghỉ việc hưởng chế độ hưu trí',
                lyDoNghi: 'H',
                dienNghi: item.dienNghi
            };
            app.model.qtNghiViec.create(data, (error) => {
                if (error) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.get('/api/tccb/qua-trinh/download-nghi-huu-du-kien', app.permission.check('qtNghiViec:export'), (req, res) => {
        const yearCalc = req.query.year;
        const endYear = new Date(yearCalc, 11, 31, 23, 59, 59, 999);
        // 1419120000000 = 45 * 365 * 24 * 3600 * 10000 (45 năm)
        app.model.tchcCanBo.getAll({
            statement: 'ngayNghi IS NULL AND (ngaySinh IS NULL OR ngaySinh + 1419120000000 <= :year)',
            parameter: { year: endYear.getTime() }
        }, 'shcc,ho,ten,phai,ngach,hocVi,chucDanh,maDonVi,ngaySinh,trinhDoPhoThong,ngayBienChe', 'chucDanh', async (error, data) => {
            if (error) {
                return res.send({ error, items: null });
            }

            let items = [];
            let getDataNghiHuu = () => new Promise(resolve => {
                const init = (index = 0) => {
                    if (index == data.length) {
                        resolve(items);
                    } else {
                        const item = data[index];
                        app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, data) => {
                            if (data) {
                                let canExtend = item.chucDanh == '01' ? 10 : item.chucDanh == '02' ? 7 : (item.hocVi == '01' || item.hocVi == '02') ? 5 : 0;
                                let end = new Date(data.resultDate);
                                end.setFullYear(end.getFullYear() + canExtend);
                                let tenChucDanh = '', tenHocVi = '', tenChucDanhNgheNghiep = '', tenChucVu = '', tenDonVi = '';

                                if (end.getFullYear() == yearCalc) {
                                    app.model.dmChucDanhKhoaHoc.get({ ma: item.chucDanh }, (error, itemCD) => {
                                        app.model.dmTrinhDo.get({ ma: item.hocVi }, (error, itemHV) => {
                                            app.model.dmNgachCdnn.get({ ma: item.ngach }, (error, itemCDNN) => {
                                                app.model.qtChucVu.get({ shcc: item.shcc, chucVuChinh: 1 }, (error, itemCV) => {
                                                    app.model.dmChucVu.get({ ma: itemCV?.maChucVu || '' }, (error, chucVu) => {
                                                        app.model.dmDonVi.get({ ma: item.maDonVi }, (error, itemDV) => {
                                                            if (itemCD) tenChucDanh = itemCD.ten;
                                                            if (itemHV) tenHocVi = itemHV.ten;
                                                            if (itemCDNN) tenChucDanhNgheNghiep = itemCDNN.ten;
                                                            if (chucVu) tenChucVu = chucVu.ten;
                                                            if (itemDV) tenDonVi = itemDV.ten;

                                                            let dataAdd = {
                                                                shcc: item.shcc,
                                                                hoCanBo: item.ho,
                                                                tenCanBo: item.ten,
                                                                tenChucDanh,
                                                                tenHocVi,
                                                                tenChucVu,
                                                                tenDonVi,
                                                                tenChucDanhNgheNghiep,
                                                                thoiDiemNghiHuuSauKeoDai: end.getTime(),
                                                                ngayNghiHuu: data.resultDate,
                                                                ngaySinh: item.ngaySinh,
                                                                phai: item.phai,
                                                                dienNghi: item.ngayBienChe ? 1 : 2,
                                                                trinhDoPhoThong: item.trinhDoPhoThong
                                                            };
                                                            items.push(dataAdd);
                                                            init(index + 1);
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                } else init(index + 1);
                            } else init(index + 1);
                        });
                    }
                };
                init();
            });
            try {
                let dataNghiHuu = await getDataNghiHuu();
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('Danh sách nghỉ hưu dự kiến');
                new Promise(solve => {
                    let cells = [
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Họ và tên', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Nam', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Nữ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Chức danh GS, PGS', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Trình độ chuyên môn', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Chức danh nghề nghiệp', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Chức vụ', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Đơn vị công tác', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Ngày đủ tuổi nghỉ hưu', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Nghỉ hưu từ', bold: true, border: '1234' }
                    ];
                    dataNghiHuu.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.hoCanBo + ' ' + item.tenCanBo });
                        cells.push({ cell: 'C' + (index + 2), alignment: 'center', border: '1234', value: item.phai == '01' && item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.phai == '02' && item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tenChucDanh || '' });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenHocVi || item.trinhDoPhoThong || '' });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep || '' });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tenChucVu || '' });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenDonVi || '' });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: app.date.dateTimeFormat(new Date(item.ngayNghiHuu), 'dd/mm/yyyy') });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: app.date.dateTimeFormat(new Date(item.thoiDiemNghiHuuSauKeoDai), 'dd/mm/yyyy') });
                    });
                    solve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'Danh sách nghỉ hưu dự kiến.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            } catch (error) {
                res.send({ error });
            }
        });

    });
};