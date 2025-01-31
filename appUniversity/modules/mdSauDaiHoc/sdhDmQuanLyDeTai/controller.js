module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7525: {
                title: 'Quản lý đề tài', parentKey: 7543,
                link: '/user/sau-dai-hoc/quan-ly-de-tai'
            },
        },
    };

    app.permission.add(
        { name: 'sdhDmQuanLyDeTai:manage', menu },
        { name: 'sdhDmQuanLyDeTai:write' },
        { name: 'sdhDmQuanLyDeTai:delete' },
        'sdhDmQuanLyDeTai:import'
    );

    app.permissionHooks.add('staff', 'addRolesSdhDmQuanLyDeTai', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhDmQuanLyDeTai:manage', 'sdhDmQuanLyDeTai:write', 'sdhDmQuanLyDeTai:delete', 'sdhDmQuanLyDeTai:import');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/quan-ly-de-tai', app.permission.orCheck('sdhDmQuanLyDeTai:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/quan-ly-de-tai/item/:id', app.permission.orCheck('sdhDmQuanLyDeTai:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/quan-ly-de-tai/upload', app.permission.orCheck('sdhDmQuanLyDeTai:manage'), app.templates.admin);

    //API----------------------------------------------------------------------------------------------------
    app.get('/api/sdh/quan-ly-de-tai/page/:pageNumber/:pageSize', app.permission.check('sdhDmQuanLyDeTai:manage'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
            const data = await app.model.sdhDmQuanLyDeTai.searchPage(pagenumber, pagesize, searchTerm);
            data.rows.forEach(element => {
                const gv = element.gvhd ? element.gvhd.trim().split('-') : [];
                let listName = [];
                let listShcc = [];
                for (let ele of gv) {
                    listShcc.push(ele.split(':')[0]);
                    listName.push(ele.split(':')[1]);
                }
                element.listName = listName;
                element.listShcc = listShcc;
            });
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber } = data;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list: data.rows } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sdh/quan-ly-de-tai/item/:ma', app.permission.check('sdhDmQuanLyDeTai:write'), (req, res) => {
        const ma = req.params.ma;
        app.model.sdhDmQuanLyDeTai.searchMa(ma, (err, data) => {
            if (err) {
                res.send({ err });
            }
            else {
                const gv = data.rows[0];
                const gvS = gv.gvhd ? gv.gvhd.trim().split('-') : [];
                let listName = [];
                let listShcc = [];
                for (let ele of gvS) {
                    listShcc.push(ele.split(':')[0]);
                    listName.push(ele.split(':')[1]);
                }
                gv.listName = listName;
                gv.listShcc = listShcc;
                res.send({ err, item: gv });
            }
        });
    });

    app.put('/api/sdh/quan-ly-de-tai', app.permission.check('sdhDmQuanLyDeTai:write'), async (req, res) => {
        try {
            let newItem = req.body.changes;
            const item = await app.model.sdhDmQuanLyDeTai.update({ ma: req.body.ma }, newItem);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sdh/quan-ly-de-tai', app.permission.check('sdhDmQuanLyDeTai:write'), async (req, res) => {
        try {
            const data = req.body.changes;
            const item = await app.model.sdhDmQuanLyDeTai.create(data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sdh/quan-ly-de-tai', app.permission.check('sdhDmQuanLyDeTai:delete'), async (req, res) => {
        try {
            await app.model.sdhDmQuanLyDeTai.delete({ ma: req.body.id });
        } catch (error) {
            res.send({ error });
        }
    });


    app.post('/api/sdh/quan-ly-de-tai/multiple', app.permission.check('sdhDmQuanLyDeTai:write'), (req, res) => {
        const data = req.body.data;
        let canBoMapping = {};
        new Promise(resolve => {
            app.model.tchcCanBo.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => item.ho && item.ten ? canBoMapping[item.ho.toLowerCase() + ' ' + item.ten.toLowerCase()] = item.shcc : '');
                resolve();
            });
        }).then(() => {
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

                if (index < data.length && item.tenDeTai) {
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
                        app.model.sdhDmQuanLyDeTai.get({ hocVien: item.hocVien }, (error, svSdh) => {
                            // ma, ho, ten, gioiTinh, ngaySinh, danToc, tonGiao, quocTich, nguyenQuanMaTinh, hienTaiSoNha, hienTaiMaXa, hienTaiMaHuyen, hienTaiMaTinh, noiSinhSoNha, noiSinhMaXa, noiSinhMaHuyen, noiSinhMaTinh, maKhoa, maNganh, thuongTruSoNha, thuongTruMaXa, thuongTruMaHuyen, thuongTruMaTinh, namTuyenSinh, nienKhoa, bacDaoTao, chuongTrinhDaoTao, sdtCaNhan, sdtLienHe, email, coQuan, gvhd, tenDeTai, tinhTrang, heDaoTao
                            const newData = {
                                tenDeTai: item.tenDeTai,
                                hocVien: item.hocVien,
                                giaoVienHd: item.gvhd ? getGvhd(item.gvhd) : '',
                                nam: item.namTuyenSinh,
                                tinhTrang: item.tinhTrang,
                            };
                            if (svSdh) {
                                app.model.sdhDmQuanLyDeTai.update({ hocVien: item.hocVien }, newData, () => {
                                    handleCreateItem(index + 1);
                                });
                            } else {
                                app.model.sdhDmQuanLyDeTai.create(newData, () => {
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

    app.uploadHooks.add('fwQuanLyDeTaiImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => fwQuanLyDeTaiImportData(req, fields, files, params, done), done, 'svSdh:write'));

    const fwQuanLyDeTaiImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'fwQuanLyDeTaiImportData' && files.fwQuanLyDeTaiSdhFile && files.fwQuanLyDeTaiSdhFile.length > 0) {
            const srcPath = files.fwQuanLyDeTaiSdhFile[0].path;
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
                                ma: value[1],
                                ho: value[2] ? value[2].trim() : '',
                                ten: value[3] ? value[3].trim() : '',
                                namTuyenSinh: value[15],
                                tinhTrang: value[20],
                                tenDeTai: value[25],
                                gvhd: value[26]
                            };
                            if (data.tenDeTai) {
                                element.push(data);
                            }
                            handleUpload(index + 1);
                        }
                    };
                    handleUpload();
                } else {
                    app.fs.deleteFile(srcPath);
                    done({ error: 'Error' });
                }
            });
        }
    };
};