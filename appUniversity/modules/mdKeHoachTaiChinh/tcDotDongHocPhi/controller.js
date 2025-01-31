module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.finance,
    //     menus: { 5012: { title: 'Đợt đóng học phí', link: '/user/finance/dot-dong-hoc-phi' } },
    // };

    app.permission.add(
        { name: 'tcDotDong:manage' },
        { name: 'tcDotDong:write' },
        { name: 'tcDotDong:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcDotDong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcDotDong:manage', 'tcDotDong:write', 'tcDotDong:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/dot-dong-hoc-phi', app.permission.check('tcDotDong:manage'), app.templates.admin);

    app.get('/api/khtc/dot-dong-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('tcDotDong:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: '',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.tcDotDongHocPhi.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.post('/api/khtc/dot-dong-hoc-phi', app.permission.check('tcDotDong:write'), async (req, res) => {
        try {
            const data = req.body?.data;
            if (!data) {
                throw 'Thông tin không đúng';
            }

            if (!(data.namHoc && data.hocKy && data.ten && data.ngayBatDau && data.ngayKetThuc)) {
                throw 'Thông tin không đủ! Yêu cầu nhập đầy đủ thông tin';
            }

            if (data.ngayBatDau >= data.ngayKetThuc) {
                throw 'Ngày bắt đầu phải sớm hơn ngày kết thúc';
            }

            const newItem = await app.model.tcDotDongHocPhi.create({
                namHoc: data.namHoc, hocKy: data.hocKy,
                ten: data.ten, ngayBatDau: data.ngayBatDau, ngayKetThuc: data.ngayKetThuc
            });

            res.send({ newItem });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/khtc/dot-dong-hoc-phi', app.permission.check('tcDotDong:write'), async (req, res) => {
        try {
            const { keys, changes } = req.body;

            if (!keys || !changes) {
                throw 'Thông tin không đúng';
            }
            if (changes.ngayBatDau >= changes.ngayKetThuc) {
                throw 'Ngày bắt đầu phải sớm hơn ngày kết thúc';
            }
            if (Object.keys(changes).includes('id')) {
                throw 'Thông tin thay đổi không được bao gồm ID';
            }
            const newItem = await app.model.tcDotDongHocPhi.update({ id: keys.id }, changes);
            res.send({ item: newItem });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/khtc/dot-dong-hoc-phi', app.permission.check('tcDotDong:delete'), async (req, res) => {
        try {
            const idDotDong = req.body?.idDotDong;
            await app.model.tcDotDongHocPhiDetail.delete({ idDotDong });
            await app.model.tcDotDongHocPhi.delete({ id: idDotDong });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong-hoc-phi/get-loai-phi', app.permission.check('tcDotDong:write'), async (req, res) => {
        try {
            const idDotDong = req.body?.id;
            const item = await app.model.tcDotDongHocPhiDetail.getAll({ idDotDong });
            let mapLoaiPhi = await app.model.tcLoaiPhi.getAll();
            mapLoaiPhi = mapLoaiPhi.reduce((map, obj) => {
                map[obj.id] = obj.ten;
                return map;
            }, {});
            item.map(loaiPhi => {
                loaiPhi['tenLoaiPhi'] = mapLoaiPhi[loaiPhi.loaiPhi];
                loaiPhi['tenTamThu'] = mapLoaiPhi[loaiPhi.tamThu] || '';
            });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong-hoc-phi/cap-nhat-loai-phi', app.permission.check('tcDotDong:write'), async (req, res) => {
        try {
            const { idDotDong, namHoc, hocKy, listLoaiPhi } = req?.body;
            await app.model.tcDotDongHocPhiDetail.delete({ idDotDong });
            if (listLoaiPhi) {
                // const tontaiHocPhi = await app.model.tcDotDongHocPhiDetail.get({ isHocPhi: 1, namHoc, hocKy });
                for (let item of listLoaiPhi) {
                    // if (tontaiHocPhi && Number(item.isHocPhi)) {
                    //     throw ('Đã tồn tại loại phí học phí trong học kì này!');
                    // }
                    if (item.tamThu) {
                        const tamThu = await app.model.tcDotDongHocPhiDetail.get({ loaiPhi: item.tamThu, namHoc, hocKy });
                        if (!tamThu) {
                            throw ('Loại phí tạm thu không tồn tại!');
                        }
                    }
                    await app.model.tcDotDongHocPhiDetail.create({ idDotDong, namHoc, hocKy, loaiPhi: item.loaiPhi, tamThu: item.tamThu, isHocPhi: item.isHocPhi });
                }
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong-hoc-phi/ap-dung-dot-dong/length', app.permission.check('tcDotDong:write'), async (req, res) => {
        try {
            const filter = req.body?.filter;
            let length = await app.model.tcDotDongHocPhi.getSinhVien(app.utils.stringify(filter));
            length = length.outBinds.ret;
            res.send({ length });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const objectDinhMuc = async (namHoc, hocKy, namTuyenSinh) => {
        const { rows: listDinhMucNhom } = await app.model.tcDinhMuc.getHocPhiNhomAll(namHoc, hocKy, namTuyenSinh);
        const { rows: listDinhMucNganh } = await app.model.tcDinhMuc.getHocPhiNganhAll(namHoc, hocKy, namTuyenSinh);
        let objectDinhPhiTheoNhom = {};
        for (let item of listDinhMucNhom) {
            if (item.listNganhCon) {
                let listNganhCon = item.listNganhCon.split(',');
                for (let nganhCon of listNganhCon) {
                    objectDinhPhiTheoNhom[nganhCon] = item.soTien;
                }
            }
            else {
                objectDinhPhiTheoNhom[item.loaiHinhDaoTao] = item.soTien;
            }
        }
        for (let item of listDinhMucNganh) {
            objectDinhPhiTheoNhom[item.maNganh] = item.soTien;
        }
        return objectDinhPhiTheoNhom;
    };

    app.post('/api/khtc/dot-dong-hoc-phi/ap-dung-hoc-phi/length', app.permission.check('tcDotDong:write'), async (req, res) => {
        try {
            let { listLoaiPhi, filter } = req.body;
            let loaiPhiHocPhi = null;

            listLoaiPhi = listLoaiPhi || [];

            for (let loaiPhi of listLoaiPhi) {
                if (loaiPhi.isHocPhi == true) {
                    if (loaiPhiHocPhi) {
                        throw ('Có nhiều hơn 1 loại phí học phí trong đợt đóng này!');
                    }
                    loaiPhiHocPhi = loaiPhi;
                    break;
                }
            }

            if (loaiPhiHocPhi) {
                let dsSinhVien = await app.model.tcDotDongHocPhi.getMonHocSinhVienLength(app.utils.stringify(filter), app.utils.stringify(loaiPhiHocPhi));
                res.send({ length: dsSinhVien.outBinds.ret });
            }
            else {
                res.send({ length: '' });
            }

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong-hoc-phi/ap-dung-dot-dong', app.permission.check('tcDotDong:write'), async (req, res) => {
        try {
            const { listLoaiPhi, filter } = req.body;
            const { namHoc, hocKy, namTuyenSinh } = filter;
            const mapDinhMuc = await objectDinhMuc(namHoc, hocKy, namTuyenSinh);
            if (namTuyenSinh <= 2021) {
                mapDinhMuc['CLC'] = 0;
            }
            const ngayTao = new Date().getTime();
            let loaiPhiCoDinh = [];
            let loaiPhiHocPhi = null;

            if (!listLoaiPhi) {
                throw ('Vui lòng chọn ít nhất 1 loại phí để áp dụng');
            }

            for (let loaiPhi of listLoaiPhi) {
                if (loaiPhi.soTien && loaiPhi.isHocPhi == true) {
                    throw ('Không thể cài đặt số tiền cho học phí!');
                }
                if (loaiPhi.soTien) {
                    loaiPhiCoDinh.push(loaiPhi);
                }
                else if (loaiPhi.isHocPhi == true) {
                    loaiPhiHocPhi = loaiPhi;
                }
                else {
                    throw ('Thiếu dữ liệu số tiền!');
                }
            }

            for (let loaiPhi of loaiPhiCoDinh) {
                await app.model.tcDotDongHocPhi.apDungCoDinh(app.utils.stringify(filter), app.utils.stringify(loaiPhi), ngayTao);
            }

            if (loaiPhiHocPhi) {
                let { rows: listSinhVienMonHoc, listMssv: listSinhVien } = await app.model.tcDotDongHocPhi.getMonHocSinhVien(app.utils.stringify(filter));
                // TODO SUA SAU BEGIN
                listSinhVienMonHoc.forEach(item => {
                    let loaiDangKy = item.loaiDangKy ? item.loaiDangKy : 'KH';
                    if (mapDinhMuc[item.heDaoTao] == null && mapDinhMuc[item.maNganh] == null) {
                        throw (`Chưa có định mức học phí cho sinh viên ${item.mssv}`);
                    }
                    let soTienDinhPhi = mapDinhMuc[item.heDaoTao] ? mapDinhMuc[item.heDaoTao] : mapDinhMuc[item.maNganh];
                    if (item.heDaoTao == 'CLC' && namTuyenSinh <= 2021) {
                        soTienDinhPhi = 0;
                        if (loaiDangKy == 'HV' || loaiDangKy == 'CT' || loaiDangKy == 'HL') {
                            soTienDinhPhi = 840000;
                        }
                    }
                    if (item.heDaoTao == 'CQ' && namTuyenSinh <= 2021 && item.loaiSinhVien == 'L2') {
                        soTienDinhPhi = 1200000;
                    }
                    if (item.maHocPhan && item.maHocPhan.substring(0, 3) == 'VNH') {
                        soTienDinhPhi = 1200000;
                    }
                    item.tongTinChi = parseInt(namTuyenSinh) > 2021 ? (item.tongTinChi || 0) : (parseInt(item.tongTietHoc) / 15 || 0);
                    item['soTien'] = soTienDinhPhi * item.tongTinChi;
                });

                listSinhVien.forEach(item => {
                    item['soTien'] = listSinhVienMonHoc.filter(new_item => new_item.mssv == item.mssv)
                        .map(new_item => new_item.soTien)
                        .reduce((tot, curr) => tot + curr, 0);
                    if (item.heDaoTao == 'CLC' && namTuyenSinh <= 2021 && namTuyenSinh >= 2019) {
                        item['soTien'] += 18000000;
                    }
                });

                for (let sinhVien of listSinhVien) {
                    if (!sinhVien.mssv || !sinhVien.soTien) {
                        continue;
                    }
                    const checkHocPhiDetail = await app.model.tcHocPhiDetail.get({ mssv: sinhVien.mssv, loaiPhi: loaiPhiHocPhi.loaiPhi, dotDong: loaiPhiHocPhi.idDotDong, namHoc, hocKy });
                    if (!checkHocPhiDetail) {
                        let checkHocPhi = await app.model.tcHocPhi.get({ mssv: sinhVien.mssv, namHoc, hocKy });
                        if (!checkHocPhi) {
                            checkHocPhi = await app.model.tcHocPhi.create({ mssv: sinhVien.mssv, namHoc, hocKy, hocPhi: 0, congNo: 0, ngayTao, hoanTra: 0, trangThai: 'MO' });
                        }
                        await app.model.tcHocPhiDetail.create({ mssv: sinhVien.mssv, namHoc, hocKy, loaiPhi: loaiPhiHocPhi.loaiPhi, dotDong: loaiPhiHocPhi.idDotDong, soTien: sinhVien.soTien, active: 1, ngayTao });
                        let soTienTamThu = await app.model.tcHocPhiDetail.get({ mssv: sinhVien.mssv, loaiPhi: loaiPhiHocPhi.tamThu, namHoc, hocKy });
                        soTienTamThu = soTienTamThu ? soTienTamThu.soTien : 0;
                        await app.model.tcHocPhi.update({ mssv: sinhVien.mssv, namHoc, hocKy }, { congNo: checkHocPhi.congNo + sinhVien.soTien - soTienTamThu, hocPhi: checkHocPhi.hocPhi + sinhVien.soTien - soTienTamThu });

                        for (let svMonHoc of listSinhVienMonHoc) {
                            if (svMonHoc.mssv == sinhVien.mssv) {
                                await app.model.tcHocPhiSubDetail.create({ mssv: svMonHoc.mssv, idDotDong: loaiPhiHocPhi.idDotDong, maMonHoc: svMonHoc.maMonHoc, tenMonHoc: svMonHoc.tenMonHoc, soTinChi: svMonHoc.tongTinChi, soTien: svMonHoc.soTien, active: 1 });
                            }
                        }
                    }
                }
            }
            // TODO SUA SAU END
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const getMailConfig = async () => {
        const mailConfig = await app.model.tcSetting.getValue('taiChinhEmailList', 'taiChinhEmailPassword');
        if (mailConfig.taiChinhEmailList) {
            return mailConfig.taiChinhEmailList.split(',').map(item => ({ email: item, password: mailConfig.taiChinhEmailPassword }));
        } else
            return [];
    };

    const sendSinhVienRemindMail = async (sinhVien, config, email) => {
        const emailTruong = sinhVien.emailTruong;
        sinhVien.ngayKetThuc = app.date.dateTimeFormat(new Date(Number(sinhVien.ngayKetThuc)), 'dd/mm/yyyy');
        config = config || await app.model.tcSetting.getValue('hocPhiEmailPhatSinhEditorText', 'hocPhiEmailPhatSinhEditorHtml', 'hocPhiEmailPhatSinhTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');

        const title = config.hocPhiEmailPhatSinhTitle.replace('{hoc_ky}', sinhVien.hocKy).replace('{nam_hoc}', `${sinhVien.namHoc} - ${sinhVien.namHoc + 1}`);

        let html = config.hocPhiEmailPhatSinhEditorHtml.replace('{hoc_ky}', sinhVien.hocKy).replace('{nam_hoc}', `${sinhVien.namHoc} - ${sinhVien.namHoc + 1}`).replace('{mssv}', sinhVien.mssv)
            .replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim()).replaceAll('{tong_hoc_phi}', sinhVien.tongSoTien.toString().numberDisplay()).replace('{tong_tin_chi}', sinhVien.tongTinChi)
            .replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail).replace('{ngay_ket_thuc}', sinhVien.ngayKetThuc);

        const text = config.hocPhiEmailPhatSinhEditorText.replace('{hoc_ky}', sinhVien.hocKy).replace('{nam_hoc}', `${sinhVien.namHoc} - ${sinhVien.namHoc + 1}`).replace('{mssv}', sinhVien.mssv)
            .replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim()).replaceAll('{tong_hoc_phi}', sinhVien.tongSoTien.toString().numberDisplay()).replace('{tong_tin_chi}', sinhVien.tongTinChi)
            .replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail).replace('{ngay_ket_thuc}', sinhVien.ngayKetThuc);

        let [head, body] = html.split('<tbody>');
        let row_data = body.substring(0, body.indexOf('</tr>') + '</tr>'.length);
        body = body.substring(row_data.length);

        for (let i = sinhVien.listMonHoc.length - 1; i >= 0; i--) {
            body = row_data.replace('&nbsp;', i + 1).replace('&nbsp;', sinhVien.listMonHoc[i].tenMonHoc.vi).replace('&nbsp;', sinhVien.listMonHoc[i].soTinChi).replace('&nbsp;', sinhVien.listMonHoc[i].donGia.toString().numberDisplay()).replace('&nbsp;', sinhVien.listMonHoc[i].thanhTien.toString().numberDisplay()) + body;
        }

        html = head + '<tbody>' + body;

        if (!app.isDebug) {
            await app.service.emailService.send(email.email, email.password, emailTruong, null, null, (app.isDebug ? 'TEST: ' : '') + title, text, html, null);
            // await app.email.normalSendEmail(email.email, email.password, sinhVien.emailTruong, [], (app.isDebug ? 'TEST: ' : '') + title, text, html, []);
        } else {
            app.service.emailService.send(email.email, email.password, 'orenomagi@gmail.com', null, null, (app.isDebug ? 'TEST: ' : '') + title, text, html, null);
            // await app.email.normalSendEmail(email.email, email.password, 'nqlong0709@gmail.com', [], (app.isDebug ? 'TEST: ' : '') + title, text, html, []);
        }
    };

    app.post('/api/khtc/dot-dong-hoc-phi/mail-phat-sinh/length', app.permission.check('tcDotDong:write'), async (req, res) => {
        try {
            const filter = req.body?.filter || {};
            let { rows: item } = await app.model.tcHocPhi.mailPhatSinh(app.utils.stringify(filter));
            res.send({ length: item.length });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong-hoc-phi/mail-phat-sinh', app.permission.check('tcDotDong:write'), async (req, res) => {
        try {
            const filter = req.body.filter || {};
            let { rows: data } = await app.model.tcHocPhi.mailPhatSinh(app.utils.stringify(filter));
            const mailData = await app.model.tcSetting.getValue('hocPhiEmailPhatSinhEditorText', 'hocPhiEmailPhatSinhEditorHtml', 'hocPhiEmailPhatSinhTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');
            const emails = await getMailConfig();

            data.forEach(item => {
                item.listMonHoc = app.utils.parse(item.listMonHoc);
                item.listMonHoc.forEach(subItem => {
                    subItem.tenMonHoc = app.utils.parse(subItem.tenMonHoc);
                });
            });

            let mailList = [...emails];
            for (let i = 0; i < data.length; i++) {
                if (mailList.length == 0)
                    mailList = [...emails];
                const email = mailList.splice(Math.floor(Math.random() * mailList.length), 1).pop();
                await sendSinhVienRemindMail(data[i], mailData, email);
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
    app.get('/api/khtc/dot-dong-hoc-phi/item/:id', app.permission.check('tcDotDong:manage'), async (req, res) => {
        try {
            const item = await app.model.tcDotDongHocPhi.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong-hoc-phi/roll-back/length', app.permission.check('tcDotDong:manage'), async (req, res) => {
        try {
            const filter = req.body?.filter;
            if (!filter) {
                throw ('Thông tin hoàn tác đợt đóng không đúng!');
            }
            const item = await app.model.tcDotDongHocPhi.rollBackLength(app.utils.stringify(filter));
            res.send({ length: item.outBinds.ret });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong-hoc-phi/roll-back', app.permission.check('tcDotDong:manage'), async (req, res) => {
        try {
            const filter = req.body?.filter;
            if (!filter) {
                throw ('Thông tin hoàn tác đợt đóng không đúng!');
            }
            await app.model.tcDotDongHocPhi.rollBack(app.utils.stringify(filter));
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};

