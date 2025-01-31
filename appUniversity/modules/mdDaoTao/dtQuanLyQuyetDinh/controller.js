module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7043: {
                title: 'Quản lý quyết định', groupIndex: 1,
                link: '/user/dao-tao/quan-ly-quyet-dinh',
                icon: 'fa-book'
            },
        },
    };

    app.permission.add(
        { name: 'dtQuanLyQuyetDinh:manage', menu },
        { name: 'dtQuanLyQuyetDinh:write' },
        { name: 'dtQuanLyQuyetDinh:delete' }
    );

    app.permissionHooks.add('staff', 'addRolesDtQuanLyQuyetDinh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtQuanLyQuyetDinh:manage', 'dtQuanLyQuyetDinh:write', 'dtQuanLyQuyetDinh:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/quan-ly-quyet-dinh', app.permission.check('dtQuanLyQuyetDinh:manage'), app.templates.admin);

    app.get('/api/dt/quan-ly-quyet-dinh/page/:pageNumber/:pageSize', app.permission.orCheck('dtQuanLyQuyetDinh:manage', 'manageQuyetDinh:ctsv'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber), _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            filter = { ...filter, isDeleted: 0, maDonVi: 33, kieuQuyetDinh: 3 };
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = await app.model.svManageQuyetDinh.searchPage(_pageNumber, _pageSize, searchTerm, app.utils.stringify(filter));
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/quan-ly-quyet-dinh/thong-tin-sinh-vien', app.permission.check('dtQuanLyQuyetDinh:manage'), async (req, res) => {
        try {
            const { mssv } = req.query;
            // let dataSinhVien = await app.model.fwStudent.getData({ mssv }, 'tinhTrang, loaiHinhDaoTao, maNganh, lop, ho, ten');
            let { rows: [{ tinhTrang, loaiHinhDaoTao, heDaoTao, maNganh, tenNganh, lop, ho, ten }] } = (await app.model.fwStudent.getData(mssv)) || { rows: [] };
            const dataLop = lop ? await app.model.dtLop.get({ maLop: lop }, 'khoaSinhVien, maCtdt') : { khoaSinhVien: '', maCtdt: '' };
            const dataSinhVien = app.clone({}, { tinhTrang, loaiHinhDaoTao, heDaoTao, maNganh, tenNganh, lop, ho, ten }, dataLop || {});
            res.send({ item: dataSinhVien });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/quan-ly-quyet-dinh/danh-sach-sinh-vien', app.permission.orCheck('dtQuanLyQuyetDinh:manage', 'manageQuyetDinh:ctsv'), async (req, res) => {
        try {
            const { idQd } = req.query;
            const { rows: items } = await app.model.svDtQuyetDinhSinhVien.getDssv(idQd);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/quan-ly-quyet-dinh/check/:soquyetdinh', app.permission.check('dtQuanLyQuyetDinh:write'), async (req, res) => {
        try {
            let dataQd = await app.model.svManageQuyetDinh.get({ soQuyetDinh: req.params.soquyetdinh, isDeleted: 0 }, '*', '');
            if (dataQd) {
                let soQd = await app.model.hcthSoDangKy.get({ id: req.params.soquyetdinh }, 'id, soCongVan');
                res.send({ error: `Đã tồn tại quyết định có số ${soQd.soCongVan}` });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    const processSinhVien = async ({ sinhVien, user, idQd }) => {
        const changes = {};
        const { heDtMoi, lopMoi, nganhMoi } = sinhVien;
        heDtMoi && (changes.loaiHinhDaoTao = heDtMoi);
        lopMoi && (changes.lop = lopMoi);
        if (nganhMoi) {
            let itemNganh = await app.model.dtNganhDaoTao.get({ maNganh: nganhMoi }, 'khoa');
            changes.khoa = itemNganh.khoa;
            changes.maNganh = nganhMoi;
        }
        const now = Date.now();
        // const studentUpdate = await app.model.fwStudent.get({ emailTruong: sinhVien.emailStudent }, 'loaiHinhDaoTao, maNganh, lop, khoa');
        await app.model.fwStudentQuyetDinhLog.createLog({ mssv: sinhVien.mssv, handleTime: now });
        await app.model.fwStudent.updateWithLog(user, { emailTruong: sinhVien.emailStudent }, changes);
        return await Promise.all([
            app.model.svDtQuyetDinhSinhVien.create({ ...sinhVien, idQd }),
            app.model.fwStudent.initCtdtRedis(sinhVien.mssv),
            app.model.dtCauHinhDotDkhp.checkAndUpdateStudent(sinhVien.mssv),
            // app.model.fwStudent.update({ emailTruong: dtQuanLyQuyetDinh.student }, changes),
            // app.model.fwStudentUpdateLog.create({
            //     mssv: dtQuanLyQuyetDinh.mssv,
            //     dataTruoc: JSON.stringify(studentUpdate),
            //     dataSau: JSON.stringify(changes),
            //     staffHandle: user.email,
            //     handleTime: Date.now()
            // })
        ]);
    };

    app.post('/api/dt/quan-ly-quyet-dinh/multiple', app.permission.check('dtQuanLyQuyetDinh:write'), async (req, res) => {
        try {
            const user = req.session.user;
            const { dtQuanLyQuyetDinh } = req.body,
                { soQuyetDinh } = dtQuanLyQuyetDinh;
            let data = await app.model.svManageQuyetDinh.get({ soQuyetDinh, isDeleted: 0 }, '*', ''),
                now = Date.now();
            const dataSoCongVan = await app.model.hcthSoDangKy.get({ id: soQuyetDinh });
            if (data) {
                res.send({ error: `Đã tồn tại quyết định có số ${dataSoCongVan.soCongVan}` });
            } else {
                let item = null;
                let itemCvd;
                if (dataSoCongVan.suDung == 0) {
                    itemCvd = await app.model.hcthCongVanDi.linkQuyetDinh({ ...dtQuanLyQuyetDinh, tenForm: 'Quyết định chuyển hệ' }, user);
                    await app.model.hcthSoDangKy.update({ id: soQuyetDinh }, { suDung: 1 });
                    // item = await app.model.svManageQuyetDinh.create({ ...dtQuanLyQuyetDinh, staffHandle: user.email, isDeleted: 0, idCvd: itemCvd.id, handleTime: now });
                }
                item = await app.model.svManageQuyetDinh.create({ ...dtQuanLyQuyetDinh, staffHandle: user.email, isDeleted: 0, handleTime: now, idCvd: itemCvd?.id });
                Array.isArray(dtQuanLyQuyetDinh.dsSinhVien) && (await Promise.all([
                    ...dtQuanLyQuyetDinh.dsSinhVien.map(async sinhVien => {
                        return await processSinhVien({ sinhVien, user, dtQuanLyQuyetDinh, idQd: item.id });
                    })]));
                res.send({ item });
            }
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/quan-ly-quyet-dinh', app.permission.check('dtQuanLyQuyetDinh:write'), async (req, res) => {
        try {
            const user = req.session.user;
            const { dtQuanLyQuyetDinh } = req.body,
                { soQuyetDinh } = dtQuanLyQuyetDinh;
            let data = await app.model.svManageQuyetDinh.get({ soQuyetDinh, isDeleted: 0 }, '*', '');
            const dataSoCongVan = await app.model.hcthSoDangKy.get({ id: soQuyetDinh });
            if (data) {
                res.send({ error: `Đã tồn tại quyết định có số ${dataSoCongVan.soCongVan}` });
            } else {
                let item = null;
                if (dataSoCongVan.suDung == 0) {
                    let itemCvd = await app.model.hcthCongVanDi.linkQuyetDinh({ ...dtQuanLyQuyetDinh, tenForm: 'Quyết định chuyển hệ' }, user);
                    item = await app.model.svManageQuyetDinh.create({ ...dtQuanLyQuyetDinh, staffHandle: user.email, isDeleted: 0, idCvd: itemCvd.id, handleTime: new Date().getTime() });
                    await app.model.hcthSoDangKy.update({ id: item.soQuyetDinh }, { suDung: 1 });
                } else {
                    item = await app.model.svManageQuyetDinh.create({ ...dtQuanLyQuyetDinh, staffHandle: user.email, isDeleted: 0, handleTime: new Date().getTime() });
                }
                await app.model.svManageQuyetDinhVao.create({ ...dtQuanLyQuyetDinh.dataUpdate, qdId: item.id });
                const changes = {};
                const { lhdtMoi, lopMoi, nganhMoi } = dtQuanLyQuyetDinh.dataUpdate;
                lhdtMoi && (changes.loaiHinhDaoTao = lhdtMoi);
                lopMoi && (changes.lop = lopMoi);
                if (nganhMoi) {
                    let itemNganh = await app.model.dtNganhDaoTao.get({ maNganh: nganhMoi }, 'khoa');
                    changes.khoa = itemNganh.khoa;
                    changes.maNganh = nganhMoi;
                }
                // const studentUpdate = await app.model.fwStudent.get({ emailTruong: dtQuanLyQuyetDinh.student }, 'loaiHinhDaoTao, maNganh, lop, khoa');
                // const student = await app.model.fwStudent.update({ emailTruong: dtQuanLyQuyetDinh.student }, changes);
                const { item: student } = await app.model.fwStudent.updateWithLog(req.session.user, { emailTruong: dtQuanLyQuyetDinh.student }, changes);
                await Promise.all([
                    app.model.fwStudent.initCtdtRedis(student.mssv),
                    app.model.dtCauHinhDotDkhp.checkAndUpdateStudent(student.mssv),
                    // app.model.fwStudentUpdateLog.create({
                    //     mssv: dtQuanLyQuyetDinh.mssv,
                    //     dataTruoc: JSON.stringify(studentUpdate),
                    //     dataSau: JSON.stringify(changes),
                    //     staffHandle: user.email,
                    //     handleTime: Date.now()
                    // })
                ]);
                res.send({ item });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/quan-ly-quyet-dinh/multiple', app.permission.orCheck('dtQuanLyQuyetDinh:write', 'manageQuyetDinh:write'), async (req, res) => {
        try {
            const user = req.session.user;
            const { id, dtQuanLyQuyetDinh } = req.body;
            await app.model.svManageQuyetDinh.update({ id }, { ...dtQuanLyQuyetDinh, staffHandle: user.email, handleTime: new Date().getTime() });
            Array.isArray(dtQuanLyQuyetDinh.dsSinhVien) && (await Promise.all([
                app.model.svDtQuyetDinhSinhVien.delete({ idQd: id }),
                ...dtQuanLyQuyetDinh.dsSinhVien.map(async sinhVien => {
                    return await processSinhVien({ sinhVien, user, dtQuanLyQuyetDinh, idQd: id });
                })]));
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.put('/api/dt/quan-ly-quyet-dinh', app.permission.orCheck('dtQuanLyQuyetDinh:write', 'manageQuyetDinh:write'), async (req, res) => {
        try {
            const user = req.session.user;
            const { id, dtQuanLyQuyetDinh } = req.body;
            await app.model.svManageQuyetDinh.update({ id }, { ...dtQuanLyQuyetDinh, staffHandle: user.email, handleTime: new Date().getTime() });
            const itemQdVao = await app.model.svManageQuyetDinhVao.update({ qdId: id }, { ...dtQuanLyQuyetDinh.dataUpdate });
            const { lhdtMoi, lopMoi, nganhMoi } = itemQdVao;
            const changes = {};
            lhdtMoi && (changes.loaiHinhDaoTao = lhdtMoi);
            lopMoi && (changes.lop = lopMoi);
            if (nganhMoi) {
                let itemNganh = await app.model.dtNganhDaoTao.get({ maNganh: nganhMoi }, 'khoa');
                changes.khoa = itemNganh.khoa;
                changes.maNganh = nganhMoi;
            }
            // const studentUpdate = await app.model.fwStudent.get({ emailTruong: dtQuanLyQuyetDinh.student }, 'loaiHinhDaoTao, maNganh, lop, khoa');
            // const student = await app.model.fwStudent.update({ emailTruong: dtQuanLyQuyetDinh.student }, changes);
            const { item: student } = await app.model.fwStudent.updateWithLog(req.session.user, { emailTruong: dtQuanLyQuyetDinh.student }, changes);
            await Promise.all([
                app.model.fwStudent.initCtdtRedis(student.mssv),
                app.model.dtCauHinhDotDkhp.checkAndUpdateStudent(student.mssv),
                // app.model.fwStudentUpdateLog.create({
                //     mssv: dtQuanLyQuyetDinh.mssv,
                //     dataTruoc: JSON.stringify(studentUpdate),
                //     dataSau: JSON.stringify(changes),
                //     staffHandle: user.email,
                //     handleTime: Date.now()
                // })
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/quan-ly-quyet-dinh/huy', app.permission.check('dtQuanLyQuyetDinh:delete'), async (req, res) => {
        try {
            await Promise.all[
                app.model.svManageQuyetDinh.update({ id: req.body.id }, { isDeleted: 1 }),
                app.model.svManageQuyetDinhRa.delete({ qdId: req.body.id }),
                app.model.svManageQuyetDinhVao.delete({ qdId: req.body.id }),
                app.model.hcthSoDangKy.update({ id: req.body.idSoQuyetDinh }, { suDung: 0 }),
                app.model.hcthCongVanDi.delete({ soDangKy: req.body.idSoQuyetDinh })
            ];
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    const initForm = async (id, res) => {
        try {
            let formData = await app.model.svManageQuyetDinh.getData(id);
            let hocKy = await app.model.dtSemester.get({ active: 1 });
            if (!formData) return res.send({ error: 'Không tồn tại mã đăng ký!' });
            formData = formData.rows[0];
            const source = app.path.join(__dirname, 'resources', 'QD_CHUYEN_NGANH.docx');
            let data = await app.model.fwStudent.getDataForm(formData.mssv, id, formData.kieuForm);
            data = data.rows.length ? data.rows[0] : {};
            data.hocKy = hocKy.hocKy;
            let customParam = formData.dataCustom ? JSON.parse(formData.dataCustom) : {};
            data = app.clone({}, data, customParam, formData);
            Object.keys(data).forEach(key => { if (data[key] == null || data[key] == undefined) data[key] = ''; });
            let result = await app.docx.generateFile(source, data);
            res.send({ data: result });
        } catch (error) {
            res.send({ error });
        }
    };

    app.get('/api/dt/quan-ly-quyet-dinh/download/:id', app.permission.orCheck('dtQuanLyQuyetDinh:delete', 'manageQuyetDinh:write'), async (req, res) => {
        try {
            initForm(req.params.id, res);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/quan-ly-quyet-dinh/danh-sach-sinh-vien/template', app.permission.check('dtQuanLyQuyetDinh:write'), async (req, res) => {
        try {
            const workbook = await app.excel.create();
            const worksheet = workbook.addWorksheet('DS Sinh viên');
            worksheet.columns = [
                { header: 'MSSV', width: '20' },
                { header: 'Khóa sinh viên mới', width: '20' },
                { header: 'Mã hệ đào tạo mới', width: '20' },
                { header: 'Mã ngành mới', width: '20' },
            ];
            worksheet.addRow({});
            const danhMuc = [
                { name: 'DmHeDaoTao', column: 'C' },
                { name: 'DmNganh', column: 'D' },
            ];
            [danhMuc[0].data, danhMuc[1].data] = await Promise.all([
                app.model.dmSvLoaiHinhDaoTao.getAll({}, 'ma,ten'),
                app.model.dtNganhDaoTao.getAll({}, 'maNganh, tenNganh'),
            ]);

            danhMuc.forEach(dm => {
                const ws = workbook.addWorksheet(dm.name);
                ws.columns = Object.keys(dm.data[0] || {}).map(key => ({ header: key, key, width: '20' }));
                dm.data.forEach(item => ws.addRow(item));
                worksheet.dataValidations.add(`${dm.column}2:${dm.column}9999`, {
                    type: 'list',
                    allowBlank: false,
                    formulae: [`${dm.name}!A2:A${dm.data?.length + 1}`, `${dm.name}!B2:B${dm.data?.length + 1}`]
                });
            });

            app.excel.attachment(workbook, res, 'DS_Sinh_viên.xlsx');
        } catch (error) {
            res.send({ error });
        }
    });

    app.uploadHooks.add('DtQuyetDinhDssv', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDsSinhVien(req, fields, files, params, done), done, 'dtQuanLyQuyetDinh:write'));

    const uploadDsSinhVien = async (req, fields, files, params, done) => {
        if (files.DtQuyetDinhDssv?.length) {
            try {
                const srcPath = files.DtQuyetDinhDssv[0].path;
                let workbook = app.excel.create();
                workbook = await app.excel.readFile(srcPath);
                if (!workbook) throw 'No workbook!';
                app.fs.deleteFile(srcPath);
                let worksheet = workbook.getWorksheet(1);
                if (!worksheet) throw 'No worksheet!';
                const items = [], visited = {};
                const failed = [];
                let index = 2;
                while (true) {
                    if (!worksheet.getCell('A' + index).text) {
                        done && done({ items, failed });
                        break;
                    }
                    const mssv = worksheet.getCell('A' + index).text?.trim() || '';
                    const khoaDtMoi = worksheet.getCell('B' + index).text?.trim() || '';
                    const heDtMoi = worksheet.getCell('C' + index).text?.trim() || '';
                    const nganhMoi = worksheet.getCell('D' + index).text?.trim() || '';
                    const [checkSv, checkHeDt, checkNganh] = await Promise.all([
                        app.model.fwStudent.get({ mssv }),
                        app.model.dmSvLoaiHinhDaoTao.get({ ma: heDtMoi }),
                        app.model.dtNganhDaoTao.get({ maNganh: nganhMoi }),
                    ]);
                    if (visited[mssv]) {
                        failed.push({ index, message: `Sinh viên ${mssv} đã tồn tại trong danh sách!` });
                    } else if (!checkSv) {
                        failed.push({ index, message: `Không tìm thấy mã số sinh viên ${mssv}!` });
                    } else if (!checkHeDt) {
                        failed.push({ index, message: `Không tìm thấy hệ đào tạo ${heDtMoi}!` });
                    } else if (!checkNganh) {
                        failed.push({ index, message: `Không tìm thấy mã ngành ${nganhMoi}!` });
                    } else {
                        visited[checkSv.mssv] = true;
                        const findCtdt = await app.model.dtKhungDaoTao.get({ maNganh: checkNganh.maNganh, khoaSinhVien: khoaDtMoi, loaiHinhDaoTao: heDtMoi });
                        const findLop = findCtdt ? await app.model.dtLop.get({ maCtdt: findCtdt.maCtdt }) : null;
                        const findCurLop = checkSv.lop ? await app.model.dtLop.get({ maLop: checkSv.lop }) : null;
                        items.push({
                            mssv: checkSv.mssv,
                            emailStudent: checkSv.emailTruong,
                            hoTen: `${checkSv.ho}  ${checkSv.ten}`,
                            heDtMoi: checkHeDt.ma,
                            tenHeDtMoi: checkHeDt.ten,
                            nganhMoi: checkNganh.maNganh,
                            tenNganhMoi: checkNganh.tenNganh,
                            khoaDtMoi,
                            ctdtMoi: findCtdt?.maCtdt,
                            lopMoi: findLop?.maLop,
                            tinhTrangHienTai: checkSv.tinhTrang,
                            heDtHienTai: checkSv.loaiHinhDaoTao,
                            khoaDtHienTai: checkSv.khoaSinhVien,
                            nganhHienTai: checkSv.maNganh,
                            lopHienTai: findCurLop?.maLop,
                            ctdtHienTai: findCurLop?.maCtdt,
                        });
                    }
                    index++;
                }
                done && done({ items, failed });
            }
            catch (error) {
                console.error(req.method, req.url, error);
                done && done({ error });
            }

        }
    };
};