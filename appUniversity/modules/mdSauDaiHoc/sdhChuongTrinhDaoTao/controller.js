module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7502: {
                title: 'Danh sách chương trình đào tạo',
                link: '/user/sau-dai-hoc/chuong-trinh-dao-tao', icon: 'fa-university',
                parentKey: 7541
            },
        },
    };
    app.permission.add(
        { name: 'sdhChuongTrinhDaoTao:manage', menu },
        { name: 'sdhChuongTrinhDaoTao:write' },
        { name: 'sdhChuongTrinhDaoTao:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleSdhChuongTrinhDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhChuongTrinhDaoTao:manage', 'sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/chuong-trinh-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:manage', 'sdhChuongTrinhDaoTao:write'), app.templates.admin);
    app.get('/user/sau-dai-hoc/chuong-trinh-dao-tao/:ma', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/ke-hoach-dao-tao/:ma', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/duyet-ke-hoach-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sdh/chuong-trinh-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('sdhChuongTrinhDaoTao:manage', 'sdhChuongTrinhDaoTao:write'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.searchTerm == 'string' ? req.query.searchTerm : '';
        let filter = req.query.filter || {};
        filter = app.utils.stringify(app.clone(filter));

        app.model.sdhKhungDaoTao.searchPage(pageNumber, pageSize, searchTerm, filter, (error, result) => {
            if (error) res.send({ error });
            else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
                let pageCondition = {
                    searchTerm,
                };

                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list, pageCondition } });
            }
        });
    });

    app.get('/api/sdh/chuong-trinh-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:manage', 'sdhChuongTrinhDaoTao:write'), async (req, res) => {
        try {
            const maKhungDaoTao = req.query.maKhungDaoTao;
            let khungDT = await app.model.sdhKhungDaoTao.get({ id: maKhungDaoTao });
            const maHocKy = khungDT.hocKyBatDau;
            let allYear = await app.model.sdhSemester.getAll({
                statement: 'TO_NUMBER(MA) >= :hocKy ',
                parameter: {
                    hocKy: maHocKy
                }
            }, '*', 'namHoc ASC, ma ASC');
            let listCTDT = await app.model.sdhChuongTrinhDaoTao.searchPage(1, 200, app.utils.stringify({ maKhung: maKhungDaoTao }), '');
            let items = listCTDT.rows.map(item => {
                if (!item.hocKy)
                    return ({ ...item, hocKyNam: '', maHocKy: '', namHoc: '' });
                else if (item.hocKy <= allYear.length)
                    return ({ ...item, hocKyNam: allYear[item.hocKy - 1].hocKy, maHocKy: allYear[item.hocKy - 1].ma, namHoc: allYear[item.hocKy - 1].namHoc });
                else
                    return ({ ...item, hocKyNam: '', maHocKy: '', namHoc: '' });

            });
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/sdh/chuong-trinh-dao-tao/all-nam-dao-tao/', app.permission.orCheck('sdhChuongTrinhDaoTao:manage', 'sdhChuongTrinhDaoTao:write'), (req, res) => {
        const { maKhoa } = req.query;
        const condition = maKhoa ? { maKhoa } : {};
        app.model.sdhCauTrucKhungDaoTao.getAllNamDaoTao(condition, 'id, namDaoTao', 'namDaoTao ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/sdh/khung-dao-tao/:ma', app.permission.orCheck('sdhChuongTrinhDaoTao:manage', 'sdhChuongTrinhDaoTao:write'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.sdhKhungDaoTao.get(condition, '*', 'id ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/sdh/khung-dao-tao/item/:id', app.permission.orCheck('sdhChuongTrinhDaoTao:manage', 'sdhChuongTrinhDaoTao:write'), async (req, res) => {
        try {
            let pageKDT = await app.model.sdhKhungDaoTao.searchPage(1, 1, '', `{ ks_id: ${req.params.id} }`);
            let item = pageKDT.rows[0],
                lop = await app.model.sdhLopHocVien.get({ maCtdt: item.maCtdt }),
                cauTrucKhung = await app.model.sdhCauTrucKhungDaoTao.get({ id: item.maKhung });
            res.send({ item, cauTrucKhung, lop });
        } catch (error) {
            res.send({ error });
        }
    });

    //Create new CTDT from page CTDT
    app.post('/api/sdh/chuong-trinh-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), (req, res) => {
        let dataKhung = req.body.item.data, dataMon = req.body.item.items || [], maLopHocVien = req.body.item.maLopHocVien;
        const condition = {
            statement: 'khoaHocVien = :khoaHocVien AND maNganh = :maNganh AND dotTrungTuyen = :dotTrungTuyen',
            parameter: {
                khoaHocVien: dataKhung.khoaHocVien, maNganh: dataKhung.maNganh, dotTrungTuyen: dataKhung.dotTrungTuyen
            }
        };
        //not duplicate CTDT
        app.model.sdhKhungDaoTao.get(condition, (error, createdCTDT) => {
            if (!error && !createdCTDT) {
                //create khungDT - CTDT
                app.model.sdhKhungDaoTao.create(dataKhung, (error, item) => {
                    if (!error) {
                        const create = (index = 0) => {
                            if (index == dataMon.length) {
                                res.send({ error, item, warning: (!dataMon || !dataMon.length) ? 'Chưa có môn học nào được chọn' : null });
                            } else {
                                dataMon[index].maKhungDaoTao = item.id;
                                delete dataMon[index].id;
                                app.model.sdhChuongTrinhDaoTao.create(dataMon[index], (error, item1) => {
                                    if (error || !item1) res.send({ error });
                                    else create(index + 1);
                                });
                            }
                        };
                        create();
                        //update maCTDT to corresponding LopHocVien 
                        app.model.sdhLopHocVien.update({ ma: maLopHocVien }, { maCtdt: dataKhung.maCtdt });
                    } else res.send({ error });
                });


            } else res.send({ error: 'Chuyên ngành/Ngành đã tồn tại!' });
        });

    });


    //pass 0 at page ctdt, pass new hoc ky at kehoach page to update hocky
    //can extends at change sthing else
    app.put('/api/sdh/chuong-trinh-dao-tao/multiple', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), async (req, res) => {
        const id = parseInt(req.body.id),
            updateDatas = req.body.updateDatas,
            deleteList = req.body.deleteList,
            hocKy = parseInt(req.body.hocKy),
            duKien = req.body.duKien;
        let errorList = [];

        try {
            //update hocKy in kehoach page
            if (hocKy && hocKy > 0) {
                if (updateDatas && updateDatas.items.length) {
                    let hocKyDuKien = duKien.hocKy,
                        namDuKien = duKien.namHoc;

                    for (let i = 0; i < updateDatas.items.length; i++) {
                        try {
                            await app.model.sdhChuongTrinhDaoTao.update({ id: updateDatas.items[i].id }, { hocKy, hocKyDuKien, namDuKien });
                        } catch (error) {
                            errorList.push(error);
                        }
                    }
                }
            }
            //update in edit ctdt page
            else {
                if (updateDatas.data) {
                    delete updateDatas.data.dotTrungTuyen;
                    await app.model.sdhKhungDaoTao.update({ id }, updateDatas.data);
                }
                if (updateDatas.items && updateDatas.items.length) {
                    for (let i = 0; i < updateDatas.items.length; i++) {
                        if (updateDatas.items[i].id > 0) { continue; }
                        else {

                            try {
                                let monHoc = { ...updateDatas.items[i] };
                                monHoc.maKhungDaoTao = id;
                                delete monHoc.id;
                                await app.model.sdhChuongTrinhDaoTao.create(monHoc);
                            } catch (error) {
                                errorList.push(error);
                            }
                        }
                    }
                }
                if (deleteList && deleteList.items.length) {
                    for (let j = 0; j < deleteList.items.length; j++) {
                        try {
                            await app.model.sdhChuongTrinhDaoTao.delete({ maKhungDaoTao: id, maMonHoc: deleteList.items[j].maMonHoc });
                        } catch (error) {
                            errorList.push(error);
                        }
                    }
                }
            }
            res.send({ error: errorList.length ? errorList : null });
        } catch (error) {
            res.send({ error });
        }
    });


    app.delete('/api/sdh/chuong-trinh-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:delete', 'sdhChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.sdhChuongTrinhDaoTao.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

    // //Phân quyền ------------------------------------------------------------------------------------------
    // app.assignRoleHooks.addRoles('daoTao', { id: 'sdhChuongTrinhDaoTao:manage', text: 'Đào tạo: Quản lý Chương trình đào tạo' });

    // app.permissionHooks.add('staff', 'checkRoleDTQuanLyCTDT', (user, staff) => new Promise(resolve => {
    //     if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
    //         app.permissionHooks.pushUserPermission(user, 'sdhChuongTrinhDaoTao:manage');
    //     }
    //     resolve();
    // }));

    // app.permissionHooks.add('assignRole', 'checkRoleDTQuanLyCTDT', (user, assignRoles) => new Promise(resolve => {
    //     const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
    //     inScopeRoles.forEach(role => {
    //         if (role.tenRole == 'sdhChuongTrinhDaoTao:manage') {
    //             app.permissionHooks.pushUserPermission(user, 'sdhChuongTrinhDaoTao:manage', 'dMonHoc:manage', 'dtNganhDaoTao:manage');
    //         }
    //     });
    //     resolve();
    // }));

    app.get('/api/sdh/chuong-trinh-dao-tao/download-word/:id', app.permission.check('sdhChuongTrinhDaoTao:manage'), async (req, res) => {
        if (req.params && req.params.id) {
            const id = req.params.id;
            let kdt = await app.model.sdhKhungDaoTao.get({ id }, '*', 'id ASC');
            const { maNganh, tenNganh, trinhDoDaoTao,
                bacDaoTao, thoiGianDaoTao, tenVanBang, maKhoa, maKhung } = kdt;
            let khoa = await app.model.dmKhoaSauDaiHoc.get({ ma: maKhoa });
            let bac = await app.model.dmHocSdh.get({ ma: bacDaoTao });
            let ctkdt = await app.model.sdhCauTrucKhungDaoTao.get({ id: maKhung }, '*', 'id ASC');
            //let ctkdt = dataKhung.cauTrucKhung;
            const mucCha = JSON.parse(ctkdt.mucCha || '{}');
            const mucCon = JSON.parse(ctkdt.mucCon || '{}');
            const chuongTrinhDaoTao = { parents: mucCha?.chuongTrinhDaoTao, childs: mucCon?.chuongTrinhDaoTao };
            const ctdt = [];
            let allmonHocs = await app.model.sdhChuongTrinhDaoTao.getAll({ maKhungDaoTao: id }, '*', 'id ASC');
            let monHocs = [...(new Map(allmonHocs.map(item => [item.maMonHoc, item]))).values()];
            let sumLt = monHocs.map(item => item.tinChiLyThuyet).reduce((prev, cur) => prev + cur, 0),
                sumTh = monHocs.map(item => item.tinChiThucHanh).reduce((prev, cur) => prev + cur, 0),
                sumTong = sumLt + sumTh;
            const pushMhToObj = (idKkt, idKhoi, obj) => {
                monHocs.forEach(monHoc => {
                    if ((idKkt && idKhoi && monHoc.maKhoiKienThucCon == idKkt && monHoc.maKhoiKienThuc == idKhoi) || (idKhoi && !idKkt && monHoc.maKhoiKienThuc == idKhoi)) {
                        const { maMonHoc, tenMonHoc, loaiMonHoc, tinChiLyThuyet, tinChiThucHanh } = monHoc;
                        const loaiMonHocStr = loaiMonHoc == 0 ? 'Bắt buộc' : 'Tự chọn';
                        obj.mh.push({ maMonHoc, tenMonHoc, loaiMonHoc: loaiMonHocStr, tinChiLyThuyet, tinChiThucHanh, tongTinChi: tinChiLyThuyet + tinChiThucHanh });
                    }
                });
            };
            Object.keys(chuongTrinhDaoTao.parents).forEach((key, idx) => {
                const khoi = chuongTrinhDaoTao.parents[key];
                const { id: idKhoi, text } = khoi;
                const tmpCtdt = {
                    stt: idx + 1,
                    name: text,
                    mh: [],
                };
                if (chuongTrinhDaoTao.childs[key]) {
                    ctdt.push(tmpCtdt);
                    chuongTrinhDaoTao.childs[key].forEach(kkt => {
                        const { id: idKkt, value } = kkt;
                        const tmpCtdt = {
                            stt: '',
                            name: value.text,
                            mh: [],
                        };
                        pushMhToObj(idKkt, idKhoi, tmpCtdt);
                        ctdt.push(tmpCtdt);
                    });
                } else {
                    pushMhToObj(null, idKhoi, tmpCtdt);
                    ctdt.push(tmpCtdt);
                }
            });
            const source = app.path.join(__dirname, 'resource', 'ctdt_word.docx');
            new Promise(resolve => {
                const data = {
                    tenNganhVi: JSON.parse(tenNganh).vi,
                    tenNganhEn: JSON.parse(tenNganh).en,
                    maNganh,
                    trinhDoDaoTao,
                    bacDaoTao: bac.ten,
                    tenKhoa: khoa.ten,
                    thoiGianDaoTao, sumLt, sumTh, sumTong,
                    tenVanBangVi: JSON.parse(tenVanBang).vi,
                    tenVanBangEn: JSON.parse(tenVanBang).en,
                    ctdt,
                };
                resolve(data);
            }).then((data) => {
                app.docx.generateFile(source, data, (error, data) => {
                    res.send({ error, data });
                });
            });
        } else {
            res.send({ error: 'No permission' });
        }
    });

    app.put('/api/sdh/khung-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            app.model.sdhKhungDaoTao.update({ id: req.body.id }, req.body.changes, errors => res.send({ errors }));
        } catch (error) {
            console.error(error);
            res.send(error);
        }
    });

    //update keHoach for hocPhan
    app.post('/api/sdh/chuong-trinh-dao-tao/hoc-phan/multiple', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const data = req.body.data,
                preLength = parseInt(req.body.preLength),
                rawData = req.body.rawData;
            let errorList = [], currLength = data.length;
            if (currLength < preLength) {
                for (let i = currLength; i < preLength; i++) {
                    try {
                        await app.model.sdhChuongTrinhDaoTao.delete({ id: parseInt(rawData[i].id) });
                    } catch (error) {
                        errorList.push(error);
                    }
                }
            }
            else if (currLength > preLength) {
                for (let i = preLength; i < currLength; i++) {
                    let item = { ...data[i] };
                    //remove attr not in database
                    delete item.R; delete item.hocKyNam;
                    delete item.maHocKy; delete item.namHoc;
                    delete item.id; delete item.tenGiangVien;
                    try {
                        await app.model.sdhChuongTrinhDaoTao.create(item);
                    } catch (error) {
                        errorList.push(error);
                    }
                }

                for (let i = 0; i < preLength; i++) {
                    let item = { ...data[i] };
                    delete item.id;
                    try {
                        await app.model.sdhChuongTrinhDaoTao.update({ id: data[i].id }, item);
                    } catch (error) {
                        errorList.push(error);
                    }
                }
            }
            else {
                for (let i = 0; i < currLength; i++) {
                    const isDuyet = data[0].isDuyet;
                    let item = { ...data[i] };
                    //remove id and map exact hocKy in year 
                    delete item.id;
                    try {
                        await app.model.sdhChuongTrinhDaoTao.update({ id: data[i].id }, item);
                        if (isDuyet) {
                            item.hocKy = item.hocKyNam;
                            await app.model.sdhThoiKhoaBieu.update({ id: data[i].id }, item);
                        }
                    } catch (error) {
                        errorList.push(error);
                    }
                }
            }

            res.send({ error: errorList.length ? errorList : null });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send(error);
        }
    });
    app.put('/api/sdh/chuong-trinh-dao-tao/remove', app.permission.orCheck('sdhChuongTrinhDaoTao:delete', 'sdhChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            const list = req.body.list,
                changes = { hocKy: '', thu: '', tietBatDau: '', giangVien: '', ngayBatDau: '', ngayKetThuc: '', maHocPhan: '', isDuyet: '', hocKyDuKien: '', namDuKien: '' };
            let errorList = [];
            if (list.length >= 2) {
                if (list[0].moLai) {
                    for (let i = 0; i < list.length; i++) {
                        try {
                            await app.model.sdhChuongTrinhDaoTao.delete({ id: list[i].id });
                        } catch (error) {
                            errorList.push(error);
                        }
                    }
                    res.send({ error: errorList.length ? errorList : null });
                }
                else {
                    for (let i = 1; i < list.length; i++) {
                        try {
                            await app.model.sdhChuongTrinhDaoTao.delete({ id: list[i].id });
                        } catch (error) {
                            errorList.push(error);
                        }
                    }
                    await app.model.sdhChuongTrinhDaoTao.update({ id: list[0].id }, changes);
                    res.send({ error: errorList.length ? errorList : null });
                }
            }
            else {
                await app.model.sdhChuongTrinhDaoTao.update({ id: list[0].id }, changes);
                res.send({ error: errorList.length ? errorList : null });
            }
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
    app.get('/api/sdh/khung-dao-tao/all', app.permission.orCheck('sdhChuongTrinhDaoTao:manage', 'sdhChuongTrinhDaoTao:write'), async (req, res) => {
        try {
            let items = await app.model.sdhKhungDaoTao.getAll({}, '*', 'id ASC');
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    //get exist hocPhan to compound
    app.post('/api/sdh/check-exist-hoc-phan', app.permission.check('sdhChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let { chuongTrinhDaoTao, khungDaoTao } = req.body, statement = '', dsMaHocPhan = {};
            let phanHe = await app.model.dmHocSdh.get({ ma: khungDaoTao.item.bacDaoTao });

            chuongTrinhDaoTao.forEach((item, index) => {
                let maHocPhan = phanHe.tenVietTat + item.data[0].maHocKy + item.maMonHoc,
                    thu = {};
                statement += index == 0 ? `lower(trim(maHocPhan)) like lower(${maHocPhan}) ` : `OR like lower(${maHocPhan})`;
                item.data.forEach(i => {
                    if (!thu[i.thu]) thu[i.thu] = [];
                    let tietBD = Number(i.tietBatDau),
                        tietKT = tietBD + Number(i.soTietBuoi) - 1;
                    for (let j = tietBD; j <= tietKT; j++)
                        thu[i.thu].push(j);
                    thu[i.thu].sort();
                });
                item['checkInfo'] = thu;
            });

            dsMaHocPhan = (await app.model.sdhLopHocVienHocPhan.getAll({
                statement: statement,
                parameter: null
            }, '*', ' maHocPhan ASC')).map(i => i.maHocPhan);
            let dsHocPhan = {};
            if (dsMaHocPhan && dsMaHocPhan.length) {
                let allHocPhan = (await app.model.sdhThoiKhoaBieu.getAll({
                    statement: 'maHocPhan IN (:dsMaHocPhan)',
                    parameter: { dsMaHocPhan: dsMaHocPhan }
                })).groupBy('maMonHoc');

                dsHocPhan = { ...allHocPhan };
                Object.keys(dsHocPhan).forEach(item => {
                    dsHocPhan[item] = dsHocPhan[item].groupBy('maHocPhan');
                });

                for (const monHoc in dsHocPhan) {
                    for (const hocPhan in dsHocPhan[monHoc]) {
                        let thu = {}, data = [...dsHocPhan[monHoc][hocPhan]];
                        dsHocPhan[monHoc][hocPhan].map(item => {
                            let tietBD = Number(item.tietBatDau), tietKT = tietBD + Number(item.soTietBuoi) - 1;
                            if (!thu[item.thu]) {
                                thu[item.thu] = [];
                            }
                            thu[item.thu].push(tietKT, tietBD);
                            thu[item.thu].sort();
                        });

                        dsHocPhan[monHoc][hocPhan] = {};
                        dsHocPhan[monHoc][hocPhan]['data'] = [...data];
                        dsHocPhan[monHoc][hocPhan]['checkInfo'] = { ...thu };
                    }
                }


                const removeConflict = (item) => {
                    // remove if hocPhan conflict keHoach that is mandatory
                    const keHoachInfo = item.checkInfo;
                    for (const monHoc in dsHocPhan) {
                        for (const hocPhan in dsHocPhan[monHoc]) {
                            let hocPhanInfo = dsHocPhan[monHoc][hocPhan].checkInfo;
                            for (const thu in keHoachInfo) {
                                let flag = false;
                                if (hocPhanInfo[thu]) {
                                    for (let k = 0; k < hocPhanInfo[thu].length; k++) {
                                        if (keHoachInfo[thu].includes(hocPhanInfo[thu][k])) {
                                            flag = true;
                                            break;
                                        }
                                    }
                                }
                                if (flag) {
                                    delete dsHocPhan[monHoc][hocPhan];
                                    break;
                                }
                            }
                        }
                    }
                };
                chuongTrinhDaoTao.forEach((item, index) => {
                    let notloop = [];
                    if (!dsHocPhan[item.maMonHoc]) {
                        removeConflict(item);
                    }
                    // to reloop to ensure that keHoach from optional => mandantory
                    else {
                        notloop.push(item);
                    }
                    //reloop with case : keHoach become mandatory after first loop because all hphan hass been remove.
                    if (index == chuongTrinhDaoTao.length - 1) {
                        notloop.forEach(item => {
                            removeConflict(item);
                        });
                    }
                });
            }

            res.send({ dsHocPhan: dsHocPhan, chuongTrinhDaoTao });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/duyet-ke-hoach-dao-tao', app.permission.check('sdhChuongTrinhDaoTao:manage'), async (req, res) => {

        try {
            let { chuongTrinhDaoTao, dsHocPhan, compoundList, dataKhung } = req.body,
                userModified = req.session.user.email;
            const namHoc = chuongTrinhDaoTao[0].data[0].namHoc,
                hocKy = chuongTrinhDaoTao[0].data[0].hocKy,
                hocKyNam = chuongTrinhDaoTao[0].data[0].hocKyNam,
                maKhungDaoTao = chuongTrinhDaoTao[0].data[0].maKhungDaoTao,
                maPhanHe = dataKhung.bacDaoTao,
                maLopHocVien = dataKhung.maLop;
            const phanHe = await app.model.dmHocSdh.get({ ma: maPhanHe });

            for (let index = 0; index < chuongTrinhDaoTao.length; index++) {
                let item = chuongTrinhDaoTao[index],
                    maMonHoc = item.maMonHoc;
                if (compoundList && compoundList[item.maMonHoc]) {
                    let idList = item.data.map(i => { return i.id; }),
                        monHoc = item.data[0];
                    const maHocPhan = compoundList[item.maMonHoc],  // exist maHocPhan
                        khung = dsHocPhan[maMonHoc][maHocPhan].data[0].maKhungDaoTao;
                    let newKeHoach = await app.model.sdhChuongTrinhDaoTao.getAll({ maHocPhan: maHocPhan, maKhungDaoTao: khung });

                    newKeHoach.forEach(i => {
                        i.maKhungDaoTao = maKhungDaoTao; i.hocKy = hocKy; i.namHoc = namHoc;
                        i.moLai = monHoc.moLai; i.maKhoiKienThuc = monHoc.maKhoiKienThuc;
                        i.maKhoiKienThucCon = monHoc.maKhoiKienThucCon;
                        delete i.id;
                    });
                    await Promise.all([
                        app.model.sdhChuongTrinhDaoTao.delete({
                            statement: 'id IN (:idList)',
                            parameter: { idList: idList }
                        }),
                        app.model.sdhLopHocVienHocPhan.create({ maHocPhan: maHocPhan, maLopHocVien: maLopHocVien, maMonHoc: maMonHoc })
                    ]);
                    newKeHoach && await Promise.all(newKeHoach.map(async item => {
                        item['userModified'] = userModified;
                        item['lastModified'] = Date.now();

                        await app.model.sdhChuongTrinhDaoTao.create(item);
                    }));

                }
                else {
                    let maHocPhan = phanHe.tenVietTat + item.data[0].maHocKy + item.maMonHoc, count = 0;
                    await app.model.sdhThoiKhoaBieu.count({ maMonHoc: maMonHoc, hocKy: hocKy, nam: item.data[0].namHoc }, (error, data) => count = data ? data.rows[0]['COUNT(*)'] : 0);
                    maHocPhan += count < 9 ? `L0${count + 1}` : `L${count + 1}`;

                    await Promise.all(item.data.map(async item => {
                        item.maHocPhan = maHocPhan;
                        item.isMo = 1; item.nam = namHoc;
                        item.hocKy = hocKyNam;
                        item['loaiHinhDaoTao'] = maPhanHe;
                        item['bacDaoTao'] = 'SDH';
                        item['userModified'] = userModified;
                        item['lastModified'] = Date.now();
                        item['khoaSinhVien'] = dataKhung.khoaHocVien;
                        await app.model.sdhThoiKhoaBieu.create(item);
                        await app.model.sdhChuongTrinhDaoTao.update({ id: item.id }, { isDuyet: 1, maHocPhan: maHocPhan });
                    }));
                    await app.model.sdhLopHocVienHocPhan.delete({ maHocPhan: maHocPhan, maLopHocVien: maLopHocVien });
                    await app.model.sdhLopHocVienHocPhan.create({ maHocPhan: maHocPhan, maLopHocVien: maLopHocVien, maMonHoc: maMonHoc });

                }

            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};