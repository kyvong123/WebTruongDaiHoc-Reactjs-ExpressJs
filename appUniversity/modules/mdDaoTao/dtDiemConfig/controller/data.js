module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7055: {
                title: 'Quản lý điểm sinh viên', link: '/user/dao-tao/grade-manage/data', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-file',
                parentKey: 7047
            }
        }
    };

    app.permission.add({ name: 'dtDiem:data', menu });

    app.permissionHooks.add('staff', 'addRoledtDiemConfig', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDiem:data');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/grade-manage/data', app.permission.check('dtDiem:data'), app.templates.admin);

    app.get('/api/dt/diem/data/page/:pageNumber/:pageSize', app.permission.check('dtDiem:data'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);
            const filter = app.utils.stringify(req.query.filter || {});
            const page = await app.model.dtDiemAll.searchPage(_pageNumber, _pageSize, filter);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows } = page;

            let list = rows.map(i => {
                let diem = i.diem ? JSON.parse(i.diem) : {},
                    diemDacBiet = i.diemDacBiet ? JSON.parse(i.diemDacBiet) : {},
                    phanTramDiem = i.phanTramDiem ? JSON.parse(i.phanTramDiem) : {};

                return { ...i, diem, diemDacBiet, phanTramDiem };
            });
            res.send({ page: { totalItem, pageNumber, pageTotal, pageSize, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/diem/condition', app.permission.check('dtDiem:data'), async (req, res) => {
        try {
            let { condition, changes } = req.body;
            await app.model.dtDiemAll.update(condition, changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/multiple', app.permission.check('dtDiem:write'), async (req, res) => {
        try {
            let data = req.body.data,
                duplicateData = [];
            for (const item of data) {
                const checkItem = await app.model.dtDiemAll.get({ mssv: item.mssv, maHocPhan: item.maHocPhan, loaiDiem: item.loaiDiem, namHoc: item.namHoc, hocKy: item.hocKy });
                if (checkItem) {
                    duplicateData.push(item);
                    continue;
                } else {
                    await app.model.dtDiemAll.create(item);
                }
                app.io.to('dtDiemAllImport').emit('create', { item });
            }
            res.send({ duplicateData });
        } catch (error) {
            res.send({ error });
        }
    });


    app.readyHooks.add('addSocketListener:ListenDtDiemImport', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('dtDiemAllImport', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('dtDiem:data') && socket.join('dtDiemAllImport');
        })
    });
    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('DtDiemData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtDiemImportData(fields, files, done), done, 'dtDiem:write')
    );
    const dtDiemImportData = async (fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'DtDiemData' && files.DtDiemData && files.DtDiemData.length) {
            const srcPath = files.DtDiemData[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                console.log(workbook, workbook.getWorksheet(1));
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const items = [];
                    const invalidData = [];
                    let index = 2;
                    try {
                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text.trim();
                                if (type == 'number' && val != '') {
                                    if (val == 'VT') {
                                        val = -1;
                                    } else {
                                        if (!isNaN(val)) val = Number(val).toFixed(2);
                                        else val = '';
                                    }
                                }
                                return val === '' ? Default : (val == null ? '' : val);
                            };
                            if (worksheet.getCell('A' + index).value == null) {
                                done({ items, invalidData });
                                app.io.to('dtDiemAllImport').emit('dt-diem-import', { type: 'Import done!', items });
                                break;
                            } else {
                                const data = {
                                    namHoc: getVal('A'),
                                    hocKy: getVal('B'),
                                    mssv: getVal('C'),
                                    maMonHoc: getVal('D'),
                                    maHocPhan: getVal('F'),
                                    diemGk: getVal('G', 'number'),
                                    diemCk: getVal('H', 'number'),
                                    diemTk: getVal('I', 'number'),
                                    phanTramDiemGk: getVal('J'),
                                    ghiChu: getVal('K')
                                };
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                process.stdout.write(`Import line ${index}`);
                                data.namHoc = `${data.namHoc.split('-')[0]} - ${data.namHoc.split('-')[1]}`;
                                data.hocKy = data.hocKy.slice(-1);
                                if (data.phanTramDiemGk) {
                                    data.phanTramDiemGk = Number(data.phanTramDiemGk);
                                    data.phanTramDiemCk = 100 - data.phanTramDiemGk;
                                }
                                let student = await app.model.fwStudent.get({ mssv: data.mssv }, 'ho,ten');

                                if (!student) {
                                    invalidData.push(data);
                                } else {
                                    let monHoc = await app.model.dmMonHoc.get({ ma: data.maMonHoc }, 'ma,ten,tongTinChi');
                                    if (!monHoc) {
                                        invalidData.push(data);
                                    } else {
                                        data.tenMonHoc = monHoc.ten;
                                        data.hoTen = `${student.ho} ${student.ten}`;
                                        items.push(
                                            { ...data, loaiDiem: 'GK', tenLoaiDiem: 'Giữa kỳ', diem: data.diemGk == -1 ? 0 : data.diemGk, diemDacBiet: data.diemGk == -1 ? 'VT' : '', tenDiemDacBiet: data.diemGk == -1 ? 'VẮNG THI' : '', phanTramDiem: data.phanTramDiemGk },
                                            { ...data, loaiDiem: 'CK', tenLoaiDiem: 'Cuối kỳ', diem: data.diemCk == -1 ? 0 : data.diemCk, diemDacBiet: data.diemCk == -1 ? 'VT' : '', tenDiemDacBiet: data.diemCk == -1 ? 'VẮNG THI' : '', phanTramDiem: data.phanTramDiemCk },
                                            { ...data, loaiDiem: 'TK', tenLoaiDiem: 'Tổng kết', diem: data.diemTk == -1 ? 0 : data.diemTk, diemDacBiet: data.diemTk == -1 ? 'VT' : '', tenDiemDacBiet: data.diemTk == -1 ? 'VẮNG THI' : '', phanTramDiem: '' },
                                        );
                                    }
                                }
                                if (index % 10 == 0) app.io.to('dtDiemAllImport').emit('dt-diem-import', { type: 'Importing', items });
                                index++;
                            }
                        }
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };
};