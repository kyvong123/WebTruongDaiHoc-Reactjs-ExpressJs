module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1015: { title: 'Thông tin cá nhân sinh viên', link: '/user/sinh-vien-sau-dai-hoc/info', icon: 'fa-user', backgroundColor: '#eb9834', groupIndex: 0 }
        }
    };

    const menuSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7501: { title: 'Danh sách học viên', link: '/user/sau-dai-hoc/sinh-vien', icon: 'fa-users', backgroundColor: '#eb9834', groupIndex: 3 }
        }
    };

    app.permission.add(
        { name: 'studentSdh:login', menu },
        { name: 'svSdh:manage', menu: menuSdh },
        { name: 'svSdh:write' },
        { name: 'svSdh:delete' },
        'svSdh:export',
        'svSdh:import'
    );

    app.get('/user/sau-dai-hoc/sinh-vien', app.permission.check('svSdh:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/upload', app.permission.orCheck('svSdh:manage', 'svSdh:import'), app.templates.admin);
    app.get('/user/sau-dai-hoc/sinh-vien/item/:mssv', app.permission.check('svSdh:write'), app.templates.admin);
    app.get('/user/sinh-vien-sau-dai-hoc/info', app.permission.check('studentSdh:login'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleStudentSdh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && ['37'].includes(staff.maDonVi)) {
            app.permissionHooks.pushUserPermission(user, 'svSdh:manage', 'svSdh:write', 'svSdh:delete', 'svSdh:export', 'svSdh:import');
            resolve();
        } else resolve();
    }));
    //API----------------------------------------------------------------------------------------------------------------

    app.get('/api/sdh/sinh-vien/page/:pageNumber/:pageSize', app.permission.check('svSdh:manage'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'ten_ASC' } = req.query,
                searchTerm = typeof condition === 'string' ? condition : '';
            const page = await app.model.fwSinhVienSdh.searchPage(pagenumber, pagesize, searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/sinh-vien/item/:mssv', app.permission.check('svSdh:manage'), async (req, res) => {
        try {
            const mssv = req.params.mssv;
            let item = await app.model.fwSinhVienSdh.get({ mssv });
            const itemDeTai = await app.model.sdhDmQuanLyDeTai.get({ hocVien: mssv });
            if (itemDeTai) {
                item = { ...item, tenDeTai: itemDeTai.tenDeTai, gvhd: itemDeTai.giaoVienHd };
            }
            res.send({ item });
        }
        catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/user/sinh-vien/edit/item', app.permission.check('studentSdh:login'), async (req, res) => {
        try {
            let mssv = req.session.user?.studentId || '';
            let item = await app.model.fwSinhVienSdh.get({ mssv });
            const itemDeTai = await app.model.sdhDmQuanLyDeTai.get({ hocVien: mssv });
            if (itemDeTai) {
                item = { ...item, tenDeTai: itemDeTai.tenDeTai, gvhd: itemDeTai.giaoVienHd };
            }
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/sinh-vien', app.permission.check('svSdh:write'), async (req, res) => {
        try {
            const data = req.body.data;
            const item = await app.model.fwSinhVienSdh.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/sinh-vien', app.permission.check('svSdh:write'), async (req, res) => {
        try {
            const mssv = req.body.mssv,
                data = req.body.changes;
            const deTai = await app.model.sdhDmQuanLyDeTai.get({ hocVien: mssv }, '*');
            if (deTai && deTai.ma) {
                await app.model.sdhDmQuanLyDeTai.update({ hocVien: mssv }, { tenDeTai: data.tenDeTai, giaoVienHd: data.gvhd });
            } else {
                await app.model.sdhDmQuanLyDeTai.create({ ...data, giaoVienHd: data.gvhd, hocVien: mssv });
            }
            const item = await app.model.fwSinhVienSdh.update({ mssv }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/sdh/user/sinh-vien', app.permission.check('studentSdh:login'), async (req, res) => {
        try {
            let mssv = req.session.user?.studentId || '',
                data = req.body.changes;
            const item = await app.model.fwSinhVienSdh.update({ mssv }, data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sdh/sinh-vien', app.permission.check('svSdh:delete'), async (req, res) => {
        try {
            const mssv = req.body.mssv;
            app.model.fwSinhVienSdh.delete({ mssv });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/sinh-vien/multiple', app.permission.check('svSdh:write'), (req, res) => {
        const data = req.body.data;
        let gioiTinhMapping = {}, quocGiaMapping = {}, danTocMapping = {}, tonGiaoMapping = {}, tinhTpMapping = {}, huyenMapping = {}, xaMapping = {}, donViMapping = {}, nganhSdhMapping = {},
            bacDaoTaoMapping = {}, heDaoTaoMapping = {}, tinhTrangMapping = {}, canBoMapping = {};

        new Promise(resolve => {
            app.model.dmGioiTinh.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => gioiTinhMapping[JSON.parse(item.ten).vi.toLowerCase()] = item.ma);
                resolve();
            });
        }).then(() => new Promise(resolve => {
            app.model.dmQuocGia.getAll((error, items) => {
                (items || []).forEach(item => quocGiaMapping[item.tenQuocGia.toLowerCase()] = item.maCode);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmDanToc.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => danTocMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTonGiao.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => tonGiaoMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTinhThanhPho.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => tinhTpMapping[item.ten.toLowerCase().replace('tỉnh', '').replace('thành phố', '').trim()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmQuanHuyen.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => huyenMapping[item.tenQuanHuyen.toLowerCase()] = item.maQuanHuyen);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmPhuongXa.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => xaMapping[item.tenPhuongXa.toLowerCase()] = item.maPhuongXa);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmDonVi.getAll((error, items) => {
                (items || []).forEach(item => donViMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmNganhSauDaiHoc.getAll((error, items) => {
                (items || []).forEach(item => nganhSdhMapping[item.ten.toLowerCase()] = item.maNganh);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmHocSdh.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => bacDaoTaoMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => heDaoTaoMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTinhTrangSinhVien.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => tinhTrangMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.tchcCanBo.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => item.ho && item.ten ? canBoMapping[item.ho.toLowerCase() + ' ' + item.ten.toLowerCase()] = item.shcc : '');
                resolve();
            });
        })).then(() => {
            let errors = [];
            const getGvhd = (gvhd) => {
                let gvhdString = gvhd.replaceAll('PGS.TS', '').replaceAll('PGS.TS.', '').replaceAll('TS.', '').replaceAll('TS', '').replaceAll('GS.TS.', '').replaceAll('GS.TS', '');
                let listGvhd = [];
                if (gvhdString.includes('CBHD1:') && gvhdString.includes('CBHD2:')) {
                    let gvhd1 = gvhdString.substring(6, gvhdString.indexOf('CBHD2:')).trim().replaceAll(',', '').replaceAll(';', ''),
                        gvhd2 = gvhdString.substring(gvhdString.indexOf('CBHD2:') + 6).trim();
                    if (canBoMapping[gvhd1.toLowerCase()]) listGvhd.push(canBoMapping[gvhd1.toLowerCase()]);
                    if (canBoMapping[gvhd2.toLowerCase()]) listGvhd.push(canBoMapping[gvhd2.toLowerCase()]);
                } else if (gvhdString.includes(';') || gvhdString.includes(',')) {
                    let gvhdStringList;
                    if (gvhdString.includes(';')) gvhdStringList = gvhdString.split(';'); else gvhdStringList = gvhdString.split(',');
                    if (canBoMapping[gvhdStringList[0].trim().toLowerCase()]) listGvhd.push(canBoMapping[gvhdStringList[0].toLowerCase()]);
                    if (canBoMapping[gvhdStringList[1].trim().toLowerCase()]) listGvhd.push(canBoMapping[gvhdStringList[1].toLowerCase()]);
                } else {
                    if (canBoMapping[gvhdString.trim().toLowerCase()]) listGvhd.push(canBoMapping[gvhdString.trim().toLowerCase()]);
                }
                return JSON.stringify(listGvhd);
            };
            let result = [];
            const handleCreateItem = (index = 0) => {
                let item = data[index];

                if (index < data.length) {
                    new Promise(resolve => {
                        if (item.maNganh) {
                            app.model.dmNganhSauDaiHoc.get({ maNganh: item.maNganh }, (error, nganhSdh) => {
                                if (!error && !nganhSdh) {
                                    app.model.dmNganhSauDaiHoc.create({ maNganh: item.maNganh, ten: item.nganh, kichHoat: 1, maKhoa: item.maKhoa }, () => {
                                        resolve();
                                    });
                                } else resolve();
                            });
                        } else resolve();
                    }).then(() => {
                        app.model.fwSinhVienSdh.get({ mssv: item.mssv }, (error, svSdh) => {
                            // mssv, ho, ten, gioiTinh, ngaySinh, danToc, tonGiao, quocTich, nguyenQuanMaTinh, hienTaiSoNha, hienTaiMaXa, hienTaiMaHuyen, hienTaiMaTinh, noiSinhSoNha, noiSinhMaXa, noiSinhMaHuyen, noiSinhMaTinh, maKhoa, maNganh, thuongTruSoNha, thuongTruMaXa, thuongTruMaHuyen, thuongTruMaTinh, namTuyenSinh, nienKhoa, bacDaoTao, chuongTrinhDaoTao, sdtCaNhan, sdtLienHe, email, coQuan, gvhd, tenDeTai, tinhTrang, heDaoTao
                            const newData = {
                                ho: item.ho.toUpperCase(),
                                ten: item.ten.toUpperCase(),
                                gioiTinh: item.gioiTinh ? item.gioiTinh == 'Nam' ? '01' : '02' : '',
                                ngaySinh: item.ngaySinh,
                                danToc: item.danToc && danTocMapping[item.danToc.toLowerCase()] ? danTocMapping[item.danToc.toLowerCase()] : '',
                                tonGiao: item.tonGiao && tonGiaoMapping[item.tonGiao.toLowerCase()] ? tonGiaoMapping[item.tonGiao.toLowerCase()] : '00',
                                quocTich: item.quocTich && quocGiaMapping[item.quocTich.toLowerCase()] ? quocGiaMapping[item.quocTich.toLowerCase()] : '',
                                noiSinhMaTinh: item.noiSinh ? item.noiSinh.toLowerCase().includes('hcm') || item.noiSinh.toLowerCase().includes('hồ chí minh') ? tinhTpMapping['hồ chí minh'] : tinhTpMapping[item.noiSinh.toLowerCase().trim()] ? tinhTpMapping[item.noiSinh.toLowerCase().trim()] : '' : '',
                                maKhoa: item.khoa && donViMapping[item.khoa.toLowerCase()] ? donViMapping[item.khoa.toLowerCase()] : '',
                                maNganh: item.maNganh,
                                namTuyenSinh: item.namTuyenSinh,
                                nienKhoa: item.nienKhoa,
                                bacDaoTao: item.bacDaoTao && bacDaoTaoMapping[item.bacDaoTao.toLowerCase()] ? bacDaoTaoMapping[item.bacDaoTao.toLowerCase()] : '',
                                chuongTrinhDaoTao: item.chuongTrinhDaoTao,
                                sdtCaNhan: item.sdtCaNhan,
                                sdtLienHe: item.sdtLienHe,
                                email: item.email,
                                coQuan: item.tenCoQuan,
                                gvhd: item.gvhd ? getGvhd(item.gvhd) : '',
                                tenDeTai: item.tenDeTai,
                                tinhTrang: item.tinhTrang,
                                heDaoTao: item.heDaoTao && heDaoTaoMapping[item.heDaoTao.toLowerCase()] ? heDaoTaoMapping[item.heDaoTao.toLowerCase()] : '',
                                hienTaiSoNha: item.hienTaiSoNha || ''
                            };
                            if (svSdh) {
                                app.model.fwSinhVienSdh.update({ mssv: item.mssv }, newData, () => {
                                    handleCreateItem(index + 1);
                                });
                            } else {
                                newData.mssv = item.mssv;
                                app.model.fwSinhVienSdh.create(newData, () => {
                                    handleCreateItem(index + 1);
                                });
                            }

                        });
                    });
                } else {
                    res.send({ errors, result });
                }
            };
            handleCreateItem();
        });
    });
    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('fwSinhVienSdhImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => fwSinhVienSdhImportData(req, fields, files, params, done), done, 'svSdh:write'));

    const fwSinhVienSdhImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'fwSinhVienSdhImportData' && files.fwSinhVienSdhFile && files.fwSinhVienSdhFile.length > 0) {
            const srcPath = files.fwSinhVienSdhFile[0].path;
            let tinhTrangMapping = {};
            new Promise(resolve => {
                app.model.dmTinhTrangSinhVien.getAll({ kichHoat: 1 }, (error, items) => {
                    (items || []).forEach(item => tinhTrangMapping[item.ma] = item.ten);
                    resolve();
                });
            }).then(() => {
                app.excel.readFile(srcPath, workbook => {
                    if (workbook) {
                        const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                        const handleUpload = (index = 2) => {
                            const value = worksheet.getRow(index).values;
                            if (value.length == 0 || index == totalRow + 1) {
                                app.fs.deleteFile(srcPath);
                                done({ element });
                            } else {
                                let data = {
                                    mssv: value[1],
                                    ho: value[2] ? value[2].trim() : '',
                                    ten: value[3] ? value[3].trim() : '',
                                    gioiTinh: value[4],
                                    ngaySinh: value[5] ? new Date(value[5].split('/')[2], Number(value[5].split('/')[1]) - 1, value[5].split('/')[0]).getTime() : '',
                                    quocTich: value[6],
                                    danToc: value[7],
                                    tonGiao: value[8],
                                    noiSinh: value[9],
                                    hienTaiSoNha: value[10],
                                    maKhoa: value[11] ? value[11].result : '',
                                    khoa: value[12],
                                    maNganh: value[13],
                                    nganh: value[14],
                                    namTuyenSinh: value[15],
                                    nienKhoa: value[16],
                                    bacDaoTao: value[17],
                                    heDaoTao: value[18],
                                    chuongTrinhDaoTao: value[19],
                                    tinhTrang: value[20],
                                    sdtCaNhan: value[21],
                                    sdtLienHe: value[22],
                                    email: value[23],
                                    tenCoQuan: value[24],
                                    tenDeTai: value[25],
                                    gvhd: value[26]
                                };

                                element.push(data);
                                handleUpload(index + 1);
                            }
                        };
                        handleUpload();
                    } else {
                        app.fs.deleteFile(srcPath);
                        done({ error: 'Error' });
                    }
                });
            });

        }
    };

    app.get('/api/sdh/sinh-vien/download-excel', app.permission.check('svSdh:export'), async (req, res) => {
        try {
            let { filter } = req.query;
            const data = await app.model.fwSinhVienSdh.downloadExcel(filter),
                list = data.rows;
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Students List');

            ws.columns = [{ header: 'stt', key: 'stt', width: 5 }, ...Object.keys(list[0]).map(key => ({ header: key.toString(), key, width: 20 }))];
            list.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });
            let fileName = 'STUDENT_SDH_DATA.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


};