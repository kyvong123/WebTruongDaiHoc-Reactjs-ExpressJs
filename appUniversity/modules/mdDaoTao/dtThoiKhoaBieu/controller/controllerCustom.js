const dateformat = require('dateformat');
module.exports = app => {
    app.post('/api/dt/thoi-khoa-bieu-custom/save-gen', app.permission.orCheck('dtThoiKhoaBieu:write', 'staff:login'), async (req, res) => {
        try {
            let { dataTuan, dataHocPhan } = req.body,
                modifier = req.session.user.email,
                timeModified = Date.now();

            dataTuan = JSON.parse(dataTuan);
            dataHocPhan = JSON.parse(dataHocPhan);

            await app.model.dtThoiKhoaBieuCustom.delete({ maHocPhan: dataHocPhan[0].maHocPhan });

            // Update thoiKhoaBieu
            let fullDataTKB = await app.model.dtThoiKhoaBieu.getAll({ maHocPhan: dataHocPhan[0].maHocPhan }),
                listId = fullDataTKB.map(i => i.id),
                maLop = dataHocPhan[0].maLop;

            for (let id of fullDataTKB.map(i => i.id)) {
                await app.model.dtThoiKhoaBieuGiangVien.delete({ idThoiKhoaBieu: id });
            }

            await Promise.all([
                app.model.dtThoiKhoaBieuGiangVien.delete({
                    statement: 'idThoiKhoaBieu IN (:listId)',
                    parameter: { listId }
                }),
                app.model.dtThoiKhoaBieuNganh.delete({
                    statement: 'idThoiKhoaBieu IN (:listId)',
                    parameter: { listId }
                })
            ]);

            if (fullDataTKB.length < dataHocPhan.length) {
                let hocPhan = fullDataTKB[0];
                delete hocPhan.id;
                for (let i = 0; i < dataHocPhan.length - fullDataTKB.length; i++) {
                    await app.model.dtThoiKhoaBieu.create({ ...hocPhan });
                }
            } else if (fullDataTKB.length > dataHocPhan.length) {
                for (let item of fullDataTKB.filter(tkb => !dataHocPhan.map(i => i.id).includes(tkb.id))) {
                    await app.model.dtThoiKhoaBieu.delete({ id: item.id });
                }
            }

            fullDataTKB = await app.model.dtThoiKhoaBieu.getAll({ maHocPhan: dataHocPhan[0].maHocPhan });
            let listNgayHoc = dataTuan.filter(i => !i.isNgayLe);
            for (let i = 0; i < dataHocPhan.length; i++) {
                let { phong, thu, tietBatDau, soTietBuoi, coSo, tuanBatDau, soTuan = '', isTrungTKB = '' } = dataHocPhan[i];
                await app.model.dtThoiKhoaBieu.update({ id: fullDataTKB[i].id }, {
                    ngayBatDau: listNgayHoc[0].ngayHoc, ngayKetThuc: listNgayHoc[listNgayHoc.length - 1].ngayHoc,
                    buoi: i + 1, soBuoiTuan: dataHocPhan.length, userModified: modifier, lastModified: timeModified,
                    phong, thu, tietBatDau, soTietBuoi, coSo, tuanBatDau, soTuan, isTrung: isTrungTKB ? 1 : '',
                });
            }

            if (maLop) {
                for (let idThoiKhoaBieu of listId) {
                    for (let idNganh of maLop.split(',')) {
                        await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu, idNganh });
                    }
                }
            }

            // Update info TUAN HOC
            for (let item of dataTuan) {
                let { maHocPhan, thu, tietBatDau, originTuan } = item;
                delete item.id;
                let infoTKB = await app.model.dtThoiKhoaBieu.get({ maHocPhan, thu, tietBatDau, originTuan }, 'id'), id = infoTKB ? infoTKB.id : fullDataTKB[0].id;
                const tuan = await app.model.dtThoiKhoaBieuCustom.create({ ...item, isNgayLe: item.isNgayLe ? 1 : '', idThoiKhoaBieu: id, thoiGianBatDau: item.ngayBatDau, thoiGianKetThuc: item.ngayKetThuc, modifier, timeModified, ghiChu: '' });
                if (!item.isNgayLe) {
                    let listGV = [];
                    if (item.shccGiangVien && item.shccGiangVien.length) {
                        listGV.push(item.shccGiangVien.map(i => ({ shcc: i, type: 'GV' })));
                    }
                    if (item.shccTroGiang && item.shccTroGiang.length) {
                        listGV.push(item.shccTroGiang.map(i => ({ shcc: i, type: 'TG' })));
                    }
                    for (let gv of listGV.flat()) {
                        await app.model.dtThoiKhoaBieuGiangVien.create({
                            idThoiKhoaBieu: id, idTuan: tuan.id,
                            giangVien: gv.shcc,
                            type: gv.type, timeModified, userModified: modifier,
                            ngayBatDau: item.ngayBatDau,
                            ngayKetThuc: item.ngayKetThuc,
                        });
                    }
                }
            }

            app.dkhpRedis.initInfoHocPhan(dataHocPhan[0].maHocPhan);
            app.dkhpRedis.initSiSoHocPhan(dataHocPhan[0].maHocPhan);

            const { maHocPhan, namHoc, hocKy } = fullDataTKB[0];
            app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc, hocKy });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu-custom/tre-som', app.permission.orCheck('dtThoiKhoaBieu:write', 'staff:login'), async (req, res) => {
        try {
            let { isLate, isSoon, ghiChu, idTuan } = req.body.data,
                userModified = req.session.user.email,
                timeModified = Date.now();

            await app.model.dtThoiKhoaBieuCustom.update({ id: idTuan }, { isLate, isSoon, ghiChu, userAction: userModified, timeAction: timeModified, timeVang: timeModified, userVang: userModified }).catch(error => console.error('Update TKB', { error }));
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu-custom/bao-nghi', app.permission.orCheck('dtThoiKhoaBieu:write', 'staff:login'), async (req, res) => {
        try {
            let data = req.body.data, { idTuan, ngayKetThuc, ghiChu, isGiangVienBaoNghi, maHocPhan, thu, tietBatDau, soTietBuoi, phong, ngayHoc, isSendEmail, emailTo, isVang, namHoc, hocKy, subject, noiDung } = data,
                userModified = req.session.user.email,
                timeModified = Date.now();

            if (isVang) {
                await app.model.dtThoiKhoaBieuCustom.update({ id: idTuan }, { ghiChu, modifier: userModified, timeModified, timeVang: timeModified, userVang: userModified, isVang: 1 }).catch(error => console.error('Update TKB', { error }));
            } else {
                await app.model.dtThoiKhoaBieuCustom.update({ id: idTuan }, { ghiChu, isNghi: 1, isGiangVienBaoNghi, modifier: userModified, timeModified, timeAction: timeModified, userAction: userModified }).catch(error => console.error('Update TKB', { error }));
                await app.model.dtThoiKhoaBieuGiangVien.update({ idTuan }, { idNgayNghi: idTuan, userModified, timeModified }).catch(error => console.error('Update GV', { error }));
            }

            if (!isVang) {
                const [listDangKy, listGiangVien] = await Promise.all([
                    app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv'),
                    app.model.dtThoiKhoaBieuGiangVien.getList(idTuan).then(items => items.rows.map(i => i.email)),
                ]), title = `Ngày ${app.date.viDateFormat(new Date(parseInt(ngayHoc)))}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong}`;

                listDangKy.map(async i => app.notification.send({
                    toEmail: `${i.mssv.toLowerCase()}@hcmussh.edu.vn`, title: `Giảng viên báo nghỉ học phần ${maHocPhan}`, iconColor: 'danger',
                    subTitle: title,
                }));

                listGiangVien.map(async gv => app.notification.send({
                    toEmail: gv, title: `Giảng viên báo nghỉ học phần ${maHocPhan}`, iconColor: 'danger',
                    subTitle: title,
                }));

                if (Number(isSendEmail) && ngayKetThuc >= Date.now()) {
                    app.service.emailService.send('hocvudaotao1@hcmussh.edu.vn', 'fromMailPassword', emailTo || userModified,
                        [...listGiangVien.filter(i => i != (emailTo || req.session.user.email)), ...listDangKy.map(i => `${i.mssv.toLowerCase()}@hcmussh.edu.vn`)].toString(),
                        null, subject, '', noiDung, null);
                }
            }

            app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc, hocKy });

            let dataTuan = await app.model.dtThoiKhoaBieuCustom.getAll({
                statement: 'maHocPhan = :maHocPhan AND isNghi IS NULL AND isNgayLe IS NULL',
                parameter: { maHocPhan }
            }, 'ngayHoc', 'ngayHoc');
            await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { ngayBatDau: dataTuan[0].ngayHoc, ngayKetThuc: dataTuan.slice(-1)[0].ngayHoc });
            res.send({ dataNgay: { ngayBatDau: dataTuan[0].ngayHoc, ngayKetThuc: dataTuan.slice(-1)[0].ngayHoc } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu-custom/bao-nghi/multiple', app.permission.orCheck('dtThoiKhoaBieu:write', 'staff:login'), async (req, res) => {
        try {
            const { list, data } = req.body,
                userModified = req.session.user.email,
                timeModified = Date.now();

            for (let item of list) {
                const { idTuan, ngayKetThuc, maHocPhan, thu, tietBatDau, soTietBuoi, phong, ngayHoc, dataTenGiangVien, tenMonHoc, namHoc, hocKy } = item,
                    { ghiChu, isGiangVienBaoNghi, isSendEmail, emailTo, noiDung } = data;
                await app.model.dtThoiKhoaBieuCustom.update({ id: idTuan }, { ghiChu, isNghi: 1, isGiangVienBaoNghi, modifier: userModified, timeModified, timeAction: timeModified, userAction: userModified }).catch(error => console.error('Update TKB', { error }));
                await app.model.dtThoiKhoaBieuGiangVien.update({ idTuan }, { idNgayNghi: idTuan, userModified, timeModified }).catch(error => console.error('Update GV', { error }));

                const [listDangKy, listGiangVien] = await Promise.all([
                    app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv'),
                    app.model.dtThoiKhoaBieuGiangVien.getList(idTuan).then(items => items.rows.map(i => i.email).filter(i => i)),
                ]),
                    title = `Ngày ${app.date.viDateFormat(new Date(parseInt(ngayHoc)))}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong}`;

                listDangKy.map(async i => app.notification.send({
                    toEmail: `${i.mssv.toLowerCase()}@hcmussh.edu.vn`, title: `Giảng viên báo nghỉ học phần ${maHocPhan}`, iconColor: 'danger',
                    subTitle: title,
                }));

                listGiangVien.map(async gv => app.notification.send({
                    toEmail: gv, title: `Giảng viên báo nghỉ học phần ${maHocPhan}`, iconColor: 'danger',
                    subTitle: title,
                }));

                if (Number(isSendEmail) && ngayKetThuc >= Date.now()) {
                    app.service.emailService.send('hocvudaotao1@hcmussh.edu.vn', 'fromMailPassword', emailTo || userModified,
                        [...listGiangVien.filter(i => i != (emailTo || req.session.user.email)), ...listDangKy.map(i => `${i.mssv.toLowerCase()}@hcmussh.edu.vn`)].toString(),
                        null, `Thông báo nghỉ môn ${app.utils.parse(tenMonHoc, { vi: '' })?.vi}. – Mã lớp: ${maHocPhan}.`, '',
                        noiDung.replaceAll('{tenMonHoc}', app.utils.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan).replaceAll('{teacher}', dataTenGiangVien || '').replaceAll('{thoiGianNghi}', title).replaceAll('{lyDo}', ghiChu || ''), null);
                }

                app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc, hocKy });
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu-custom/hoan-tac-nghi', app.permission.orCheck('dtThoiKhoaBieu:write', 'staff:login'), async (req, res) => {
        try {
            let { dataTuan } = req.body, { idTuan, maHocPhan, ghiChu } = dataTuan,
                userModified = req.session.user.email,
                timeModified = Date.now();

            if (await app.model.dtThoiKhoaBieuBaoBu.get({ idNgayNghi: idTuan })) throw { message: 'Giảng viên đã đăng ký dạy bù cho ngày nghỉ!' };

            const item = await app.model.dtThoiKhoaBieuCustom.update({ id: idTuan }, { ghiChu, isNghi: '', isGiangVienBaoNghi: 0, modifier: userModified, timeModified, isHoanTac: 1, timeAction: timeModified, userAction: userModified });
            await app.model.dtThoiKhoaBieuGiangVien.update({ idNgayNghi: idTuan }, { idNgayNghi: '', userModified, timeModified, timeAction: timeModified, userAction: userModified }).catch(error => console.error(error));

            if (item.ngayHoc > Date.now()) {
                const [listDangKy, listGiangVien] = await Promise.all([
                    app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv'),
                    app.model.dtThoiKhoaBieuGiangVien.getList(idTuan).then(items => items.rows.map(i => i.email).filter(i => i)),
                ]);

                listDangKy.map(async i => app.notification.send({
                    toEmail: `${i.mssv.toLowerCase()}@hcmussh.edu.vn`, title: `Giảng viên đăng ký dạy bù học phần ${maHocPhan}`,
                    subTitle: `Ngày ${app.date.viDateFormat(new Date(parseInt(item.ngayHoc)))}, thứ ${item.thu}, tiết ${item.tietBatDau} - ${parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1}, phòng ${item.phong}`
                }));

                listGiangVien.map(async gv => app.notification.send({
                    toEmail: gv, title: `Giảng viên báo nghỉ học phần ${maHocPhan}`, iconColor: 'danger',
                    subTitle: `Ngày ${app.date.viDateFormat(new Date(parseInt(item.ngayHoc)))}, thứ ${item.thu}, tiết ${item.tietBatDau} - ${parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1}, phòng ${item.phong}`,
                }));
            }

            let data = await app.model.dtThoiKhoaBieuCustom.getAll({
                statement: 'maHocPhan = :maHocPhan AND isNghi IS NULL AND isNgayLe IS NULL',
                parameter: { maHocPhan }
            }, 'ngayHoc', 'ngayHoc');
            await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { ngayBatDau: data[0].ngayHoc, ngayKetThuc: data.slice(-1)[0].ngayHoc });
            res.send({ dataNgay: { ngayBatDau: data[0].ngayHoc, ngayKetThuc: data.slice(-1)[0].ngayHoc } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu-custom/bao-bu', app.permission.orCheck('dtThoiKhoaBieu:write', 'staff:login'), async (req, res) => {
        try {
            let { data, dataTuan } = req.body,
                { dataGiangVien, ngayBatDau, ngayKetThuc, ngayBu, coSo, isSendEmail, emailTo, noiDung, subject } = data,
                { idThoiKhoaBieu, maHocPhan, maMonHoc, namHoc, hocKy, idTuan } = dataTuan;
            let userModified = req.session.user.email;
            let timeModified = Date.now();

            let tuanBu = await app.model.dtThoiKhoaBieuCustom.create({ ...data, ngayHoc: ngayBu, thoiGianBatDau: ngayBatDau, thoiGianKetThuc: ngayKetThuc, idNgayNghi: idTuan, idThoiKhoaBieu, maHocPhan, maMonHoc, namHoc, hocKy, coSo, isBu: 1, modifier: userModified, timeModified, timeAction: timeModified, userAction: userModified });

            if (dataGiangVien && dataGiangVien.length) {
                for (let gv of dataGiangVien) {
                    await app.model.dtThoiKhoaBieuGiangVien.create({
                        idThoiKhoaBieu: idThoiKhoaBieu, idTuan: tuanBu.id,
                        giangVien: gv.giangVien,
                        type: gv.type, idNgayBu: tuanBu.id,
                        ngayBatDau: ngayBatDau,
                        ngayKetThuc: ngayKetThuc,
                        userModified, timeModified,
                    });
                }
            }

            const [listDangKy, listGiangVien] = await Promise.all([
                app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv'),
                app.model.dtThoiKhoaBieuGiangVien.getList(tuanBu.id).then(items => items.rows.filter(i => i.email)),
            ]), title = `Ngày ${app.date.viDateFormat(new Date(parseInt(ngayBu)))}, thứ ${tuanBu.thu}, tiết ${tuanBu.tietBatDau} - ${parseInt(tuanBu.tietBatDau) + parseInt(tuanBu.soTietBuoi) - 1}, phòng ${tuanBu.phong}`;

            listDangKy.map(async i => app.notification.send({
                toEmail: `${i.mssv.toLowerCase()}@hcmussh.edu.vn`, title: `Giảng viên đăng ký dạy bù học phần ${maHocPhan}`,
                subTitle: title,
            }));

            listGiangVien.map(async i => app.notification.send({
                toEmail: i.email, title: `Giảng viên đăng ký dạy bù học phần ${maHocPhan}`,
                subTitle: title,
            }));

            if (Number(isSendEmail) && ngayBatDau >= Date.now()) {
                app.service.emailService.send('hocvudaotao1@hcmussh.edu.vn', 'fromMailPassword', emailTo || req.session.user.email,
                    [...listGiangVien.map(i => i.email).filter(i => i != (emailTo || req.session.user.email)), ...listDangKy.map(i => `${i.mssv.toLowerCase()}@hcmussh.edu.vn`)].toString(), null, subject,
                    '', noiDung.replaceAll('{teacher}', listGiangVien.map(i => i.ten).join(', ') || '').replaceAll('{thoiGianBu}', title), null);
            }

            app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc, hocKy });

            let listTuan = await app.model.dtThoiKhoaBieuCustom.getAll({
                statement: 'maHocPhan = :maHocPhan AND isNghi IS NULL AND isNgayLe IS NULL',
                parameter: { maHocPhan }
            }, 'ngayHoc', 'ngayHoc');
            await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { ngayBatDau: listTuan[0].ngayHoc, ngayKetThuc: listTuan.slice(-1)[0].ngayHoc });
            res.send({ dataNgay: { ngayBatDau: listTuan[0].ngayHoc, ngayKetThuc: listTuan.slice(-1)[0].ngayHoc } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/thoi-khoa-bieu-custom/bao-bu', app.permission.orCheck('dtThoiKhoaBieu:write', 'staff:login'), async (req, res) => {
        try {
            let { data, dataTuan } = req.body,
                { phong, dataGiangVien, isSendEmail, emailTo, noiDung, subject } = data,
                { idTuan, idThoiKhoaBieu, ngayBatDau, ngayKetThuc, maHocPhan, namHoc, hocKy } = dataTuan;
            let userModified = req.session.user.email;
            let timeModified = Date.now();
            const tuan = await app.model.dtThoiKhoaBieuCustom.update({ id: idTuan }, { phong, userModified, timeModified });
            await app.model.dtThoiKhoaBieuGiangVien.delete({ idNgayBu: idTuan });
            if (dataGiangVien && dataGiangVien.length) {
                for (let gv of dataGiangVien) {
                    await app.model.dtThoiKhoaBieuGiangVien.create({
                        idThoiKhoaBieu: idThoiKhoaBieu, idTuan,
                        giangVien: gv.giangVien,
                        type: gv.type, idNgayBu: idTuan,
                        ngayBatDau: ngayBatDau,
                        ngayKetThuc: ngayKetThuc,
                        userModified, timeModified,
                    });
                }
            }

            const [listDangKy, listGiangVien] = await Promise.all([
                app.model.dtDangKyHocPhan.getAll({ maHocPhan }, 'mssv'),
                app.model.dtThoiKhoaBieuGiangVien.getList(tuan.id).then(items => items.rows.filter(i => i.email)),
            ]), title = `Ngày ${app.date.viDateFormat(new Date(parseInt(tuan.ngayHoc)))}, thứ ${tuan.thu}, tiết ${tuan.tietBatDau} - ${parseInt(tuan.tietBatDau) + parseInt(tuan.soTietBuoi) - 1}, phòng ${tuan.phong}`;

            listDangKy.map(async i => app.notification.send({
                toEmail: `${i.mssv.toLowerCase()}@hcmussh.edu.vn`, title: `Giảng viên đăng ký dạy bù học phần ${maHocPhan}`,
                subTitle: title,
            }));

            listGiangVien.map(async i => app.notification.send({
                toEmail: i.email, title: `Giảng viên đăng ký dạy bù học phần ${maHocPhan}`,
                subTitle: title,
            }));

            if (Number(isSendEmail) && ngayBatDau >= Date.now()) {
                app.service.emailService.send('hocvudaotao1@hcmussh.edu.vn', 'fromMailPassword', emailTo || req.session.user.email,
                    [...listGiangVien.map(i => i.email).filter(i => i != (emailTo || req.session.user.email)), ...listDangKy.map(i => `${i.mssv.toLowerCase()}@hcmussh.edu.vn`)].toString(), null, subject,
                    '', noiDung.replaceAll('{teacher}', listGiangVien.map(i => i.ten).join(', ') || '').replaceAll('{thoiGianBu}', title), null);
            }

            app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc, hocKy });

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/dt/thoi-khoa-bieu-custom/delete-tuan', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { dataTuan } = req.body,
                { idTuan, maHocPhan, namHoc, hocKy } = dataTuan;

            await app.model.dtThoiKhoaBieuCustom.delete({ id: idTuan });
            await app.model.dtThoiKhoaBieuGiangVien.delete({ idTuan });

            app.dkhpRedis.updateDataTuanHoc({ maHocPhan, namHoc, hocKy });

            let listTuan = await app.model.dtThoiKhoaBieuCustom.getAll({
                statement: 'maHocPhan = :maHocPhan AND isNghi IS NULL AND isNgayLe IS NULL',
                parameter: { maHocPhan }
            }, 'ngayHoc', 'ngayHoc');
            await app.model.dtThoiKhoaBieu.update({ maHocPhan }, { ngayBatDau: listTuan[0]?.ngayHoc || '', ngayKetThuc: listTuan.slice(-1)[0]?.ngayHoc || '' });
            res.send({ dataNgay: { ngayBatDau: listTuan[0]?.ngayHoc || '', ngayKetThuc: listTuan.slice(-1)[0]?.ngayHoc || '' } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu-custom/tra-cuu-phong-trong', app.permission.orCheck('dtThoiKhoaBieu:manage', 'staff:login'), async (req, res) => {
        try {
            let { filter } = req.query;
            const DATE_UNIX = 24 * 60 * 60 * 1000;
            let dataPhong = [], isSearchPhong = false;
            let { coSo, thu, ngayBatDau, ngayKetThuc, phong, tietBatDau, soTiet } = filter,
                thoiGianBatDau = '', thoiGianKetThuc = '';
            ngayBatDau = parseInt(ngayBatDau);
            ngayKetThuc = parseInt(ngayKetThuc);

            if (phong) {
                dataPhong = await app.model.dmPhong.getAll({ coSo, kichHoat: 1, ten: phong }, 'ten, sucChua', 'ten');
            } else {
                dataPhong = await app.model.dmPhong.getAll({ coSo, kichHoat: 1 }, 'ten, sucChua', 'ten');
            }

            if (tietBatDau) {
                let [batDau, ketThuc] = await Promise.all([
                    app.model.dmCaHoc.get({ coSo, ten: tietBatDau }),
                    app.model.dmCaHoc.get({
                        statement: 'maCoSo = :coSo AND ten <= :tietKetThuc',
                        parameter: { coSo, tietKetThuc: Number(tietBatDau) + Number(soTiet || 0) - 1 }
                    }, '*', 'TO_NUMBER(ten) DESC')
                ]);

                thoiGianBatDau = batDau.thoiGianBatDau.split(':');
                thoiGianKetThuc = ketThuc.thoiGianKetThuc.split(':');
            }

            const { rows: tkbHienTai, datathi: dataThi, dataevent: dataEvent } = await app.model.dtThoiKhoaBieu.searchSchedule(app.utils.stringify({ ngayBatDau, ngayKetThuc, batDau: ngayBatDau, ketThuc: new Date(ngayKetThuc).setHours(23, 59, 59, 999), searchPhong: phong, searchThu: thu }));
            let dataRet = [];
            if (phong) {
                let i = ngayBatDau;
                while (i <= ngayKetThuc) {
                    let thuCheck = new Date(i).getDay() + 1;
                    if (thuCheck == 1) thuCheck = 8;
                    if (!thu || (thu && (thu == thuCheck))) {
                        let tkbTrung = tkbHienTai.filter(tkb => parseInt(tkb.ngayHoc) == i && !tkb.isNghi),
                            examTrung = dataThi.filter(thi => i == new Date(thi.batDau).setHours(0, 0, 0, 0)),
                            eventTrung = dataEvent.filter(event => i == new Date(event.batDau).setHours(0, 0, 0, 0)),
                            dataTime = [];

                        tkbTrung = tkbTrung.map(i => ({ ...i, batDau: i.ngayBatDau, ketThuc: i.ngayKetThuc }));

                        examTrung = examTrung.map(i => ({
                            ...i, thoiGianBatDau: new Date(i.batDau).toLocaleString('vi-VN').substring(0, 5),
                            thoiGianKetThuc: new Date(i.ketThuc).toLocaleString('vi-VN').substring(0, 5),
                        }));

                        eventTrung = eventTrung.map(i => ({
                            ...i, thoiGianBatDau: new Date(i.batDau).toLocaleString('vi-VN').substring(0, 5),
                            thoiGianKetThuc: new Date(i.ketThuc).toLocaleString('vi-VN').substring(0, 5),
                        }));

                        [...examTrung, ...eventTrung, ...tkbTrung].forEach(i => {
                            let [gioBd] = i.thoiGianBatDau.split(':'),
                                [gioKt, phutKt] = i.thoiGianKetThuc.split(':');

                            if (parseInt(phutKt) > 0) {
                                gioKt = parseInt(gioKt) + 1;
                            }
                            dataTime.push(...Array.from({ length: parseInt(gioKt) - parseInt(gioBd) + 1 }, (_, i) => i + parseInt(gioBd)));
                        });

                        dataRet.push({
                            ngay: i,
                            thu: thuCheck,
                            dataTime: [...new Set(dataTime)],
                            dataTkbHienTai: tkbTrung,
                            dataThiHienTai: examTrung,
                            dataEventHienTai: eventTrung,
                        });
                    }

                    i += DATE_UNIX;
                }
                isSearchPhong = true;
            } else {
                for (let ngay = ngayBatDau; ngay <= ngayKetThuc; ngay += DATE_UNIX) {
                    let thuCheck = new Date(ngay).getDay() + 1;
                    if (thuCheck == 1) thuCheck = 8;
                    if (!thu || (thu && (thu == thuCheck))) {
                        if (!dataRet.some(item => item.thu == thuCheck)) {
                            dataRet.push({ thu: thuCheck, ngay });
                        }
                    }
                }
                dataRet = dataRet.sort((a, b) => a.thu - b.thu);

                dataRet = dataRet.map(item => {
                    let batDau = '', ketThuc = '';
                    if (thoiGianBatDau && thoiGianKetThuc) {
                        const [gioBatDau, phutBatDau] = thoiGianBatDau,
                            [gioKetThuc, phutKetThuc] = thoiGianKetThuc;
                        batDau = new Date(parseInt(item.ngay)).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
                        ketThuc = new Date(parseInt(item.ngay)).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
                    }

                    let tkbTrung = tkbHienTai.filter(tkb => tkb.ngayHoc == item.ngay && !tkb.isNghi && (batDau && ketThuc ? !((batDau > tkb.ngayKetThuc) || (ketThuc < tkb.ngayBatDau)) : true)),
                        examTrung = dataThi.filter(i => item.ngay == new Date(i.batDau).setHours(0, 0, 0, 0) && (batDau && ketThuc ? !((batDau > i.ketThuc) || (ketThuc < i.batDau)) : true)),
                        eventTrung = dataEvent.filter(i => item.ngay == new Date(i.batDau).setHours(0, 0, 0, 0) && (batDau && ketThuc ? !((batDau > i.ketThuc) || (ketThuc < i.batDau)) : true));

                    tkbTrung = tkbTrung.map(i => i.phong);
                    examTrung = examTrung.map(i => i.phong);
                    eventTrung = eventTrung.map(i => i.phong);

                    return {
                        ...item,
                        listPhong: dataPhong.filter(item => ![...tkbTrung, ...examTrung, ...eventTrung].includes(item.ten)),
                        listFull: dataPhong.filter(item => ![...tkbTrung, ...examTrung, ...eventTrung].includes(item.ten)),
                    };
                });
            }

            res.send({ dataRet, isSearchPhong });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu-custom/tra-cuu-thoi-khoa-bieu', app.permission.orCheck('dtThoiKhoaBieu:manage', 'staff:login'), async (req, res) => {
        try {
            const DATE_UNIX = 24 * 60 * 60 * 1000;
            let { filter } = req.query, sort = filter.sort,
                user = req.session.user;
            let { rows: dataTKBFull, datathi: dataThi, dataevent: dataEvent } = await app.model.dtThoiKhoaBieu.searchSchedule(app.utils.stringify({ ...filter, sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] }));
            let dataTKB = [], dataThu = [];
            let { ngayBatDau, ngayKetThuc } = filter;
            ngayBatDau = parseInt(ngayBatDau);
            ngayKetThuc = parseInt(ngayKetThuc);
            for (let ngay = ngayBatDau; ngay <= ngayKetThuc; ngay += DATE_UNIX) {
                let thuCheck = new Date(ngay).getDay() + 1;
                if (thuCheck == 1) thuCheck = 8;
                dataThu.push(thuCheck);
            }
            dataThu = [...new Set(dataThu)];
            dataTKB = dataTKBFull.filter(i => dataThu.includes(i.thu));

            if (!Number(user.isPhongDaoTao) && !user.permissions.includes('developer:login')) {
                dataThi = [];
                dataEvent = [];
            }

            res.send({ dataTKB, dataThi, dataEvent });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/thoi-khoa-bieu-custom/multiple-update', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { data, dataTuan } = req.body, { phong, isTrung, coSo, maHocPhan, changeLich, tietBatDau, soTietBuoi, newThu } = data, dataError = [];
            isTrung = Number(isTrung);
            changeLich = Number(changeLich);
            let modifier = req.session.user.email;
            let timeModified = Date.now();

            let dataCaHoc = await app.model.dmCaHoc.getAll({ maCoSo: coSo }, 'ten');
            dataCaHoc = dataCaHoc.map(i => i.ten);
            for (let tuan of dataTuan) {
                let { ngayHoc, idTuan, ngayBatDau, ngayKetThuc, tietBatDau, soTietBuoi } = tuan,
                    tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;

                if (!(dataCaHoc.includes(tietBatDau.toString()) && dataCaHoc.includes(tietKetThuc.toString()))) {
                    dataError.push({ ngayHoc, idTuan, ghiChu: 'Cơ sở không tồn tại tiết học của học phần' });
                } else {
                    let [tkb, exam, event, listGV] = await Promise.all([
                        app.model.dtThoiKhoaBieuCustom.get({
                            statement: 'id != :idTuan AND isNghi IS NULL AND isNgayLe IS NULL AND phong = :phong AND NOT ((:ngayBatDau > thoiGianKetThuc) OR (:ngayKetThuc < thoiGianBatDau))',
                            parameter: { phong, ngayBatDau, ngayKetThuc, idTuan },
                        }),
                        app.model.dtExam.get({
                            statement: 'phong = :phong AND NOT ((:ngayBatDau > ketThuc) OR (:ngayKetThuc < batDau))',
                            parameter: { phong, ngayBatDau, ngayKetThuc },
                        }),
                        app.model.dtLichEvent.get({
                            statement: 'phong = :phong AND NOT ((:ngayBatDau > thoiGianKetThuc) OR (:ngayKetThuc < thoiGianBatDau))',
                            parameter: { phong, ngayBatDau, ngayKetThuc },
                        }),
                        app.model.dtThoiKhoaBieuGiangVien.getAll({ idTuan }),
                    ]);
                    if (tkb && !isTrung) {
                        dataError.push({ ngayHoc, idTuan, ghiChu: `Trùng thời khóa biểu với ngày ${app.date.viDateFormat(new Date(Number(ngayHoc)))} của học phần ${tkb.maHocPhan}` });
                    } else if (exam && !isTrung) {
                        dataError.push({ ngayHoc, idTuan, ghiChu: `Trùng lịch thi với ngày ${app.date.viDateFormat(new Date(Number(ngayHoc)))} của học phần ${exam.maHocPhan}` });
                    } else if (event && !isTrung) {
                        dataError.push({ ngayHoc, idTuan, ghiChu: `Trùng lịch với ngày ${app.date.viDateFormat(new Date(Number(ngayHoc)))} của sự kiện ${event.ten}` });
                    } else if (changeLich) {
                        for (let gv of listGV) {
                            let gvHienTai = await app.model.dtThoiKhoaBieuGiangVien.get({
                                statement: 'giangVien = :giangVien AND idNgayNghi IS NULL AND idTuan IS NOT NULL AND idTuan != :idTuan  AND NOT ((:ngayBatDau > ngayKetThuc) OR (:ngayKetThuc < ngayBatDau))',
                                parameter: {
                                    giangVien: gv.giangVien, idTuan,
                                    ngayBatDau, ngayKetThuc,
                                }
                            });
                            if (gvHienTai) {
                                dataError.push({ ngayHoc, idTuan, ghiChu: `Trùng lịch dạy của giảng viên ngày ${app.date.viDateFormat(new Date(Number(ngayHoc)))}` });
                                break;
                            }
                        }
                    }
                }

            }
            if (!dataError.length) {
                for (let tuan of dataTuan) {
                    let { tietBatDau, soTietBuoi, ngayBatDau, ngayKetThuc, thu, newThu, ngayHoc } = tuan;
                    thu = newThu || thu;
                    await app.model.dtThoiKhoaBieuCustom.update({ id: tuan.idTuan }, {
                        phong, modifier, timeModified, coSo, tietBatDau, thu, ngayHoc,
                        soTietBuoi, thoiGianBatDau: ngayBatDau, thoiGianKetThuc: ngayKetThuc,
                    });
                    if (changeLich) {
                        await app.model.dtThoiKhoaBieuGiangVien.update({ idTuan: tuan.idTuan }, {
                            userModified: modifier, timeModified, ngayBatDau, ngayKetThuc,
                        }).catch(error => app.consoleError(req, error));
                    }
                }
                app.dkhpRedis.updateDataTuanHoc({ maHocPhan });

                let list = await app.model.dtThoiKhoaBieu.getAll({
                    statement: 'maHocPhan = :maHocPhan',
                    parameter: { maHocPhan },
                }, 'id');

                if (list.length) {
                    for (let item of list) {
                        let tuan = await app.model.dtThoiKhoaBieuCustom.getAll({
                            statement: 'idThoiKhoaBieu = :idThoiKhoaBieu AND isNghi IS NULL AND isNgayLe IS NULL AND isBu IS NULL',
                            parameter: { idThoiKhoaBieu: item.id },
                        }, 'phong, thoiGianBatDau, tietBatDau, soTietBuoi, thu', 'thoiGianBatDau ASC');

                        if (tuan.every(i => i.phong == phong && (!changeLich || (i.tietBatDau == tietBatDau && i.soTietBuoi == soTietBuoi)))) {
                            const dataUpdate = { coSo, phong, userModified: modifier, lastModified: timeModified };
                            if (changeLich) {
                                dataUpdate.tietBatDau = tietBatDau;
                                dataUpdate.soTietBuoi = soTietBuoi;
                            }
                            await app.model.dtThoiKhoaBieu.update({ id: item.id }, dataUpdate);
                        }
                        if (tuan.every(i => changeLich && newThu && i.thu == newThu)) await app.model.dtThoiKhoaBieu.update({ id: item.id }, { thu: newThu });
                    }
                }
            }

            res.send({ dataError });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/dt/thoi-khoa-bieu-custom/delete-phong', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { listTime } = req.body,
                modifier = req.session.user.email,
                timeModified = Date.now(),
                listIdThoiKhoaBieu = [];

            for (let id of listTime) {
                await app.model.dtThoiKhoaBieuCustom.update({ id }, { phong: null, modifier, timeModified }).then(custom => !listIdThoiKhoaBieu.includes(custom.idThoiKhoaBieu) && listIdThoiKhoaBieu.push(custom.idThoiKhoaBieu));
            }

            for (let idThoiKhoaBieu of listIdThoiKhoaBieu) {
                const exist = await app.model.dtThoiKhoaBieuCustom.get({
                    statement: 'idThoiKhoaBieu = :idThoiKhoaBieu AND phong IS NOT NULL',
                    parameter: { idThoiKhoaBieu }
                });
                if (!exist) await app.model.dtThoiKhoaBieu.update({ id: idThoiKhoaBieu }, { phong: null, userModified: modifier, lastModified: timeModified });
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu-custom/check-data', app.permission.orCheck('dtThoiKhoaBieu:manage', 'staff:login'), async (req, res) => {
        try {
            let { listTuanHoc } = req.body;
            listTuanHoc = JSON.parse(listTuanHoc);
            listTuanHoc = await Promise.all(listTuanHoc.map(async tuan => {
                let { maHocPhan, ngayHoc, phong, ngayBatDau, ngayKetThuc, isNgayLe } = tuan, ghiChu = '';
                if (phong && !isNgayLe) {
                    let tkbHienTai = await app.model.dtThoiKhoaBieuCustom.get({
                        statement: 'maHocPhan != :maHocPhan AND ngayHoc = :ngayHoc AND phong = :phong AND NOT ((:ngayBatDau > thoiGianKetThuc) OR (:ngayKetThuc < thoiGianBatDau))',
                        parameter: { maHocPhan, ngayHoc, phong, ngayBatDau, ngayKetThuc },
                    });
                    if (tkbHienTai) {
                        ghiChu = `Trùng thời khóa biểu với ngày ${dateformat(ngayHoc, 'dd/mm/yyyy')} của học phần ${tkbHienTai.maHocPhan}`;
                    }
                }
                if (isNgayLe) {
                    ghiChu = `Nghỉ lễ: ${tuan.ngayLe}`;
                }
                return { ...tuan, ghiChu };
            }));
            res.send({ listTuanHoc });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu-custom/check-free-phong', app.permission.orCheck('dtThoiKhoaBieu:manage', 'staff:login'), async (req, res) => {
        try {
            let { data } = req.query,
                { phong, ngayBatDau, ngayKetThuc, maHocPhan } = data, ghiChu = '';

            let [tkb, exam, event] = await Promise.all([
                app.model.dtThoiKhoaBieuCustom.get({
                    statement: 'maHocPhan != :maHocPhan AND isNghi IS NULL AND isNgayLe IS NULL AND phong = :phong AND NOT ((:ngayBatDau > thoiGianKetThuc) OR (:ngayKetThuc < thoiGianBatDau))',
                    parameter: { maHocPhan, phong, ngayBatDau, ngayKetThuc },
                }),
                app.model.dtExam.get({
                    statement: 'phong = :phong AND NOT ((:ngayBatDau > ketThuc) OR (:ngayKetThuc < batDau))',
                    parameter: { phong, ngayBatDau, ngayKetThuc },
                }),
                app.model.dtLichEvent.get({
                    statement: 'phong = :phong AND NOT ((:ngayBatDau > thoiGianKetThuc) OR (:ngayKetThuc < thoiGianBatDau))',
                    parameter: { phong, ngayBatDau, ngayKetThuc },
                })
            ]);

            if (tkb) {
                ghiChu = `Trùng thời khóa biểu với ngày ${app.date.viDateFormat(new Date(tkb.ngayHoc))} của học phần ${tkb.maHocPhan}`;
            } else if (exam) {
                ghiChu = `Trùng lịch thi với ngày ${app.date.viDateFormat(new Date(exam.batDau))} của học phần ${exam.maHocPhan}`;
            } else if (event) {
                ghiChu = `Trùng lịch với ngày ${app.date.viDateFormat(new Date(event.thoiGianBatDau))} của sự kiện ${event.ten}`;
            }
            res.send({ item: ghiChu });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu-custom/get-not-free', app.permission.orCheck('dtThoiKhoaBieu:manage', 'staff:login'), async (req, res) => {
        try {
            let { data } = req.query, statement = '', parameter = {},
                statementGv = '', parameterGv = {},
                index = 0, listTKB = [], listThi = [], listEvent = [], listTKBGv = [];
            while (data[index]) {
                let { maHocPhan, phong, weekStart, shccGV } = data[index];
                if (phong) {
                    if (statement) statement += 'OR ';
                    statement += `(maHocPhan != :maHocPhan AND ngayHoc >= :weekStart${index} AND isNghi IS NULL AND isNgayLe IS NULL AND phong = :phong${index})`;
                    parameter.maHocPhan = maHocPhan;
                    parameter[`phong${index}`] = phong;
                    parameter[`weekStart${index}`] = weekStart;

                    if (shccGV) {
                        if (statementGv) statementGv += 'OR ';
                        statementGv += `(ngayBatDau >= :weekStart${index} AND giangVien IN (:listGv${index}) AND type = \'GV\' AND idNgayNghi IS NULL) `;
                        parameterGv[`weekStart${index}`] = weekStart;
                        parameterGv[`listGv${index}`] = shccGV.split(',');
                    }
                }
                index++;
            }
            if (statement) {
                listTKB = await app.model.dtThoiKhoaBieuCustom.getAll({ statement, parameter });
                if (data.some(i => i.phong)) {
                    listThi = await app.model.dtExam.getAll({
                        statement: 'phong IN (:listPhong)',
                        parameter: { listPhong: data.map(i => i.phong) },
                    });
                    listEvent = await app.model.dtLichEvent.getAll({
                        statement: 'phong IN (:listPhong)',
                        parameter: { listPhong: data.map(i => i.phong) },
                    });
                }
            }

            if (statementGv) {
                listTKBGv = await app.model.dtThoiKhoaBieuGiangVien.getAll({ statement: statementGv, parameter: parameterGv });
            }

            res.send({ listTKB, listThi, listEvent, listTKBGv });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/thoi-khoa-bieu-custom/add-tuan', app.permission.orCheck('dtThoiKhoaBieu:manage', 'dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { dataTuan } = req.body, { dataGiangVien } = dataTuan;

            if (dataGiangVien && dataGiangVien.length) {
                const checkTrungLich = await app.model.dtThoiKhoaBieuGiangVien.get({
                    statement: 'giangVien IN (:giangVien) AND NOT ((:thoiGianBatDau > ngayKetThuc) OR (:thoiGianKetThuc < ngayBatDau)) AND idNgayNghi IS NULL',
                    parameter: { thoiGianBatDau: dataTuan.ngayBatDau, thoiGianKetThuc: dataTuan.ngayKetThuc, giangVien: dataGiangVien },
                });
                if (checkTrungLich) throw { message: 'Trùng lịch dạy của giảng viên' };
            }
            const tuan = await app.model.dtThoiKhoaBieuCustom.create({ ...dataTuan, thoiGianBatDau: dataTuan.ngayBatDau, thoiGianKetThuc: dataTuan.ngayKetThuc, modifier: req.session.user.email, timeModified: Date.now() });

            if (dataGiangVien && dataGiangVien.length) {
                for (let gv of dataGiangVien) {
                    await app.model.dtThoiKhoaBieuGiangVien.create({
                        idThoiKhoaBieu: tuan.idThoiKhoaBieu, idTuan: tuan.id,
                        giangVien: gv,
                        type: 'GV',
                        ngayBatDau: tuan.thoiGianBatDau,
                        ngayKetThuc: tuan.thoiGianKetThuc,
                        userModified: req.session.user.email, timeModified: Date.now(),
                    });
                }
            }

            app.dkhpRedis.updateDataTuanHoc({ maHocPhan: dataTuan.maHocPhan, namHoc: dataTuan.namHoc, hocKy: dataTuan.hocKy });
            let listTuan = await app.model.dtThoiKhoaBieuCustom.getAll({
                statement: 'maHocPhan = :maHocPhan AND isNghi IS NULL AND isNgayLe IS NULL',
                parameter: { maHocPhan: dataTuan.maHocPhan }
            }, 'ngayHoc', 'ngayHoc');
            await app.model.dtThoiKhoaBieu.update({ maHocPhan: dataTuan.maHocPhan }, { ngayBatDau: listTuan[0].ngayHoc, ngayKetThuc: listTuan.slice(-1)[0].ngayHoc });
            res.send({ dataNgay: { ngayBatDau: listTuan[0].ngayHoc, ngayKetThuc: listTuan.slice(-1)[0].ngayHoc } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu-custom/thong-ke', app.permission.check('dtThoiKhoaBieu:thongKe'), async (req, res) => {
        try {
            let { filter } = req.query;
            await app.model.dtAssignRole.getDataRole('dtThoiKhoaBieu', req.session.user, filter);
            let { rows, datathongke } = await app.model.dtThoiKhoaBieuCustom.thongKe(app.utils.stringify(filter));

            res.send({ items: rows, dataThongKe: datathongke });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/thoi-khoa-bieu-custom/tra-cuu-phong', app.permission.check('dtThoiKhoaBieu:lichPhong'), async (req, res) => {
        try {
            let { coSo, ngayBatDau, ngayKetThuc, typeSearch } = req.query.filter;
            ngayBatDau = parseInt(ngayBatDau);
            ngayKetThuc = parseInt(ngayKetThuc);

            let [listPhong, { rows, datathi, dataevent }] = await Promise.all([
                app.model.dmPhong.getAll({ coSo, kichHoat: 1 }, 'ten, sucChua, toaNha', 'toaNha, ten'),
                typeSearch == 3 ? app.model.dtThoiKhoaBieu.searchScheduleAll(app.utils.stringify({ coSo, ngayBatDau, ngayKetThuc })) : app.model.dtThoiKhoaBieu.searchSchedule(app.utils.stringify({ coSo, ngayBatDau, ngayKetThuc, batDau: ngayBatDau, ketThuc: new Date(ngayKetThuc).setHours(23, 59, 59, 999) })),
            ]);
            rows = rows.filter(i => !i.isNghi);
            const listTime = typeSearch == 3 ? Array.from([2, 3, 4, 5, 6, 7, 8], i => ({ thu: i, text: i == 8 ? 'Chủ nhật' : `Thứ ${i}` })) : Array.from({ length: (ngayKetThuc - ngayBatDau) / (24 * 60 * 60 * 1000) + 1 }, (_, i) => {
                let ngay = i * (24 * 60 * 60 * 1000) + ngayBatDau;
                let thuCheck = new Date(ngay).getDay() + 1;
                if (thuCheck == 1) thuCheck = 8;
                return { ngay, text: thuCheck == 8 ? `Chủ nhật (${app.date.viDateFormat(new Date(ngay))})` : `Thứ ${thuCheck} (${app.date.viDateFormat(new Date(ngay))})` };
            });

            let results = listPhong.map(phong => {
                let itemsPhong = [...rows, ...datathi, ...dataevent].filter(i => i.phong == phong.ten);
                let dataTime = listTime.map(time => {
                    let items = itemsPhong.filter(i => {
                        return typeSearch == 3 ? (i.thu == time.thu || (i.batDau && ((new Date(i.batDau).getDay() + 1) == time.thu || (time.thu == 8 && (new Date(i.batDau).getDay() + 1) == 1)))) : (new Date(i.batDau).setHours(0, 0, 0, 0) == time.ngay || new Date(i.ngayBatDau).setHours(0, 0, 0, 0) == time.ngay);
                    });
                    typeSearch != 3 && items.sort((a, b) => a.time - b.time);
                    items = items.map(item => {
                        let ten = '', time = '', gv = '', lop = '', timeStart = '';

                        if (item.isThi) {
                            ten = `* THI HỌC KỲ - ${app.utils.parse(item.tenMonHoc || { vi: '' }).vi}`;
                            time = typeSearch == 3 ? `- ${dateformat(item.batDau, 'dd/mm/yyyy')} \r\n ${dateformat(item.batDau, 'HH:MM')} - ${dateformat(item.ketThuc, 'HH:MM')}` : `- Thời gian: ${dateformat(item.batDau, 'HH:MM')} - ${dateformat(item.ketThuc, 'HH:MM')}`;
                            timeStart = dateformat(item.batDau, 'HH:MM');
                        } else if (item.isTKB) {
                            ten = `* ${app.utils.parse(item.tenMonHoc || { vi: '' }).vi}`;
                            time = typeSearch == 3 ? `- ${dateformat(item.ngayBatDau, 'dd/mm/yyyy')} - ${dateformat(item.ngayKetThuc, 'dd/mm/yyyy')} \r\n (${item.thoiGianBatDau} - ${item.thoiGianKetThuc})` : `- Thời gian: ${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`;
                            timeStart = item.thoiGianBatDau;
                            gv = item.dataTenGiangVien ? `- Giảng viên: ${item.dataTenGiangVien}` : '';
                        } else if (item.isEvent) {
                            ten = `* Sự kiện: ${item.ten}`;
                            time = typeSearch == 3 ? `- ${dateformat(item.batDau, 'dd/mm/yyyy')} - ${dateformat(item.ketThuc, 'dd/mm/yyyy')} \r\n (${item.thoiGianBatDau} - ${item.thoiGianKetThuc})` : `- Thời gian: ${dateformat(item.batDau, 'HH:MM')} - ${dateformat(item.ketThuc, 'HH:MM')}`;
                            timeStart = dateformat(item.batDau, 'HH:MM');
                        }

                        return { ten, time, lop, gv, timeStart, isThi: item.isThi, isTKB: item.isTKB, isEvent: item.isEvent };
                    });
                    items = items.filter(i => parseInt(i.timeStart) < 17);
                    return { ...time, items };
                });
                return { dataPhong: phong, dataTime };
            });

            res.send({ results, listTime });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};
