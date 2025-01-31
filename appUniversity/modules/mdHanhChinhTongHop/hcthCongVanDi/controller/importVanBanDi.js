module.exports = (app) => {


    app.uploadHooks.add('hcthVanBanDiImport', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthVanBanDiImport(req, fields, files, params, done), done, 'hcthCongVanDi:write'));


    app.get('/user/hcth/van-ban-di/import', app.permission.check('hcthCongVanDi:write'), app.templates.admin);

    const hcthVanBanDiImport = async (req, fields, files, params, done) => {
        try {
            const type = fields.userData?.length && fields.userData[0];
            // data = fields.data && fields.data[0] && app.utils.parse(fields.data[0]);
            if (type == 'hcthVanBanDiImport') {
                const
                    file = files.hcthVanBanDiImport[0],
                    { path } = file,
                    validFileType = ['.xlsx'], //TODO: allow doc and docx
                    fileName = path.replace(/^.*[\\\/]/, ''),
                    extName = app.path.extname(fileName);
                if (!validFileType.includes(extName))
                    return done && done({ error: 'Định dạng file không hợp lệ' });
                else {
                    app.fs.renameSync(path, app.path.join(app.assetPath, 'congVanDi', 'import', fileName));
                    done && done({ fileName });
                }
            }

        } catch (error) {
            console.error(error);
            done && done({ error });
        }
    };

    const listToSet = (list) => {
        const data = {};
        list.forEach(item => { data[item] = true; });
        return Object.keys(data);
    };

    app.get('/api/hcth/van-ban-di/import/:fileName', app.permission.check('hcthCongVanDi:write'), async (req, res) => {
        try {
            const { fileName } = req.params;
            const { quySo, donVi: maDonVi, trichYeuColumn = 'D', ngayGuiColumn = 'B', ngayKyColumn = 'C', shccColumn = 'G', loaiVanBanColumn = 'H', soVanBanColumn = 'A', index: startAt } = req.query;
            const workBook = await app.excel.readFile(app.path.join(app.assetPath, 'congVanDi', 'import', fileName));
            const quySoItem = await app.model.hcthQuySo.get({ ma: quySo });

            const workSheet = workBook.getWorksheet(1);
            let index = parseInt(startAt) || 2;
            const data = [];
            const donVi = await app.model.dmDonVi.get({ ma: maDonVi });
            const loaiVanBanData = {}, loaiVanBanItems = await app.model.dmLoaiVanBan.getAll();
            loaiVanBanItems.forEach(item => {
                loaiVanBanData[item.ma.toLowerCase()] = item;
            });
            while (true) {
                const trichYeu = workSheet.getCell(trichYeuColumn + index).text;
                if (!trichYeu)
                    break;
                else {
                    let ngayGui = workSheet.getCell(ngayGuiColumn + index).value,
                        ngayKy = workSheet.getCell(ngayKyColumn + index).value,
                        loaiVanBan = workSheet.getCell(loaiVanBanColumn + index).value,
                        soDi = workSheet.getCell(soVanBanColumn + index).value,
                        shcc = workSheet.getCell(shccColumn + index).value || req.session?.user?.shcc || '';
                    ngayGui = ngayGui instanceof Date ? ngayGui.getTime() : null;
                    ngayKy = ngayKy instanceof Date ? ngayKy.getTime() : null;
                    data.push({
                        trichYeu: trichYeu.trim(), shcc, ngayGui, ngayKy, loaiVanBan, soDi, quySo, maQuySo: quySoItem.ma, namHanhChinh: quySoItem.namHanhChinh
                    });
                    index++;
                }
            }
            const rawShcc = listToSet(data.map(item => item.shcc).filter(item => item));
            req.session?.user?.shcc && rawShcc.push(req.session.user.shcc);
            const shccList = rawShcc.length ? await app.model.tchcCanBo.getAll({
                statement: 'shcc in (:shccs)', parameter: { shccs: listToSet(data.map(item => item.shcc).filter(item => item)) }
            }) : [];
            const shccData = {};
            shccList.forEach(item => { shccData[item.shcc] = item; });
            const items = await Promise.all(data.map(async item => {
                let loaiVanBanItem;
                if (!item.loaiVanBan) {
                    const tempLoaiVanBan = item.trichYeu.slice(0, 2);
                    loaiVanBanItem = loaiVanBanData[tempLoaiVanBan.toLowerCase()];
                } else {
                    loaiVanBanItem = loaiVanBanData[item.loaiVanBan.toLowerCase()];
                }
                const canBo = shccData[item.shcc];
                let soVanBan = item.soDi, soDi;

                if (Number.isInteger(Number(item.soDi))) {
                    soDi = Number(item.soDi);
                } else {
                    soDi = null;
                }
                soVanBan += '/';
                if (loaiVanBanItem && loaiVanBanItem.tenVietTat) {
                    soVanBan += loaiVanBanItem.tenVietTat + '-';
                }
                soVanBan += 'XHNV';
                if (donVi && donVi.tenVietTat) {
                    soVanBan += '-' + donVi.tenVietTat;
                }
                return { ...item, loaiVanBanItem, soVanBan, soDi, canBo };

            }));
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });


    app.post('/api/hcth/van-ban-di/import/new', app.permission.check('hcthCongVanDi:write'), async (req, res) => {
        try {
            const items = req.body.items || [];
            await Promise.all(items.map(async item => {
                const soVanBan = await app.model.hcthSoDangKy.create(
                    { 'soCongVan': item.soVanBan, 'soDi': item.soDi, 'loaiVanBan': item.loaiVanBanItem?.id, 'donViGui': req.body.donVi, 'ngayTao': Date.now(), 'tuDong': 0, 'suDung': 1, 'nguoiTao': item.shcc || req.session.user.shcc, namHanhChinh: item.namHanhChinh, maQuySo: item.maQuySo, 'capVanBan': 'TRUONG' }
                );
                const vanBan = await app.model.hcthCongVanDi.create({
                    'trichYeu': item.trichYeu, 'ngayGui': item.ngayGui, 'ngayKy': item.ngayKy, 'donViGui': req.body.donVi, 'loaiVanBan': item.loaiVanBanItem?.id, 'trangThai': 'DA_PHAT_HANH', 'ngayTao': Date.now(), 'nguoiTao': item.shcc || req.session.user.shcc, 'soDangKy': soVanBan.id, 'isPhysical': 1, 'capVanBan': 'TRUONG', 'isConverted': 1, 'systemId': req.body.systemId, 'vanBanCongKhai': 0, 'namHanhChinh': item.namHanhChinh, 'doKhanVanBan': 'THUONG'
                });
                await app.model.hcthSoDangKy.update({ id: soVanBan.id }, { ma: vanBan.id });
            }));
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const getDonViQuanLy = (req) => req.session?.user?.staff?.donViQuanLy?.map(item => item.maDonVi) || [];
    const getDonVi = (req) => req.session?.user?.staff?.maDonVi;
    const getShcc = (req) => req.session.user?.shcc;

    app.post('/api/hcth/cong-van-di/admin/bulk', app.permission.check('developer:switched'), async (req, res) => {
        try {
            const data = req.body;
            const quantity = Number(data.quantity);
            const userDepartments = getDonViQuanLy(req);
            if (getDonVi(req))
                userDepartments.push(getDonVi(req));
            if (!userDepartments.includes(data.donVi)) {
                throw 'Đơn vị không hợp lệ';
            }
            const items = [];
            for (let i = 0; i < quantity; i++) {
                let item = await app.model.hcthYeuCauCapSo.create({ ...data, ngayTao: Date.now(), shcc: getShcc(req), trangThai: 'waiting' });
                let { loaiVanBan, donVi } = item;
                let administrativeYear = await app.model.hcthSetting.get({ key: 'administrativeYear' });
                if (!administrativeYear) throw 'Không tồn tại năm hành chính';
                const nam = parseInt(administrativeYear.value);

                const ngayTao = new Date().getTime();
                let result;
                try {
                    if (item.soLuiNgay) {
                        result = await app.model.hcthSoDangKy.createSoLui(donVi, 'TRUONG', loaiVanBan, nam, 1, ngayTao, getShcc(req), null, item.ngayLui);
                    } else {
                        result = await app.model.hcthSoDangKy.createSoVanBanMain(donVi, 'TRUONG', loaiVanBan, nam, 1, ngayTao, getShcc(req), null);
                    }
                    if (!result.outBinds?.ret) throw new Error();
                } catch (error) {
                    console.error(error);
                    throw { message: 'Số văn bản không hợp lệ' };
                }
                const soVanBanItem = await app.model.hcthSoDangKy.get({ ngayTao, soCongVan: result.outBinds?.ret });
                if (!soVanBanItem) throw 'Tạo số văn bản gặp lỗi';
                item = await app.model.hcthYeuCauCapSo.update({ id: item.id }, { soVanBan: soVanBanItem.id, trangThai: 'success' });

                const { canBoNhan = [], donViNhan = [], donViNhanNgoai = [], banLuu = [], nhomDonViNhan = [], ...itemData } = { trichYeu: data.lyDo, banLuu: [29], capVanBan: 'TRUONG', donViGui: data.donVi, loaiVanBan: data.loaiVanBan, ngoaiNgu: 10, isPhysical: 1, vanBanCongKhai: 0, doKhanVanBan: 'THUONG', systemId: data.systemId, vanBanChonDonVi: 0, donViSoanThao: data.donVi, ngayTao: Date.now(), isConverted: 0 };

                let soDangKy = soVanBanItem;

                const { capVanBan = 'TRUONG', isPhysical = 1, donViGui = data.donVi, isConverted = 0 } = {};
                const initialStatus = await app.model.hcthCongVanDi.getStatus(capVanBan, donViGui, isPhysical, null, isConverted, true, data.systemId);

                const instance = await app.model.hcthCongVanDi.create({ ...itemData, nguoiTao: req.session.user.shcc, ngayTao: new Date().getTime(), trangThai: initialStatus.trangThai, soDangKy: soDangKy ? soDangKy.id : null });
                const id = instance.id;
                const LOAI_VAN_BAN = 'DI';

                // cap nhat soDangKy voi ma la id congvan
                if (soDangKy)
                    await app.model.hcthSoDangKy.update({ id: soDangKy.id }, { ma: id, suDung: 1 });

                try {
                    //create don vi nhan from list
                    await app.model.hcthDonViNhan.createFromList(donViNhan, instance.id, LOAI_VAN_BAN);

                    //create don vi nhan ngoai from list
                    await app.model.hcthDonViNhan.createFromList(donViNhanNgoai, instance.id, LOAI_VAN_BAN, { donViNhanNgoai: 1, });

                    //create nhom don vi nhan from list
                    await app.model.hcthDonViNhan.createFromList(nhomDonViNhan, instance.id, LOAI_VAN_BAN, { isNhomDonVi: 1, });

                    // create ban luu
                    await app.model.hcthBanLuu.createFromList(banLuu, instance.id, LOAI_VAN_BAN,);

                    //create can bo nhan from list
                    await app.model.hcthCanBoNhan.listCreate(canBoNhan.map(shcc => ({ canBoNhan: shcc, ma: instance.id, loai: LOAI_VAN_BAN })));

                    //handle list file
                    app.fs.createFolder(app.path.join(app.assetPath, 'congVanDi', `${instance.id}`));
                    // await Promise.all(files.map(item => createFileVanBanDi(item, instance.id, req.session.user.shcc)));

                    //create history
                    await app.model.hcthHistory.create({ loai: 'DI', key: instance.id, shcc: req.session?.user?.shcc, hanhDong: 'CREATE', thoiGian: instance.ngayTao });
                    await app.model.hcthVanBanDiStaging.create({ loai: 'DI', ma: instance.id, shcc: req.session?.user?.shcc, thoiGian: instance.ngayTao, maTrangThai: initialStatus.trangThai });


                } catch (error) {
                    console.error(error);
                    // deleteCongVan(id, () => res.send({ error }));
                    // res.send({ error });
                }
                items.push({ instance, soVanBanItem });
            }

            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};