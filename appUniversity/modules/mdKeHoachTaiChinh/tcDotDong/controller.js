module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5013: { title: 'Đợt đóng học phí', icon: 'fa fa-balance-scale', backgroundColor: '#F0E68C', color: '#000', link: '/user/finance/dot-dong' } },
    };

    app.permission.add(
        { name: 'tcDotDongHocPhi:manage', menu },
        { name: 'tcDotDongHocPhi:write' },
        { name: 'tcDotDongHocPhi:delete' },
    );

    app.permissionHooks.add('staff', 'addRolestcDotDongHocPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcDotDongHocPhi:manage', 'tcDotDongHocPhi:write', 'tcDotDongHocPhi:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/dot-dong', app.permission.check('tcDotDongHocPhi:manage'), app.templates.admin);
    app.get('/user/finance/cau-hinh-dot-dong', app.permission.check('tcDotDongHocPhi:manage'), app.templates.admin);
    app.get('/user/finance/khoa-giao-dich', app.permission.check('tcDotDongHocPhi:manage'), app.templates.admin);

    app.get('/api/khtc/dot-dong/page/:pageNumber/:pageSize', app.permission.check('tcDotDongHocPhi:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: '',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.tcDotDong.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ page, error });
        });
    });

    app.get('/api/khtc/dot-dong/item/:id', app.permission.check('tcDotDongHocPhi:manage'), async (req, res) => {
        try {
            const item = await app.model.tcDotDong.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/cau-hinh-dot-dong/he-dao-tao/all', app.permission.check('tcDotDongHocPhi:manage'), async (req, res) => {
        try {
            const item = await app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/khoa-giao-dich/get-all', app.permission.check('tcDotDongHocPhi:manage'), async (req, res) => {
        try {
            const filter = req.query.filter || {};

            let bacDaoTao = await app.model.dmSvBacDaoTao.getAll({ kichHoat: 1 });
            let heDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 });
            let khoaSinhVien = Array.from({ length: 8 }, (_, i) => i + new Date().getFullYear() - 7).reverse();
            let cauHinh = await app.model.tcKhoaGiaoDich.getAll({});

            filter.bacDaoTao && (bacDaoTao = bacDaoTao.filter(item => item.maBac == filter.bacDaoTao));
            filter.heDaoTao && (heDaoTao = heDaoTao.filter(item => item.ma == filter.heDaoTao));
            filter.khoaSinhVien && (khoaSinhVien = khoaSinhVien.filter(item => item == filter.khoaSinhVien));

            const item = bacDaoTao.flatMap(bac => {
                return heDaoTao.flatMap(he => {
                    return khoaSinhVien.map(khoaSV => {
                        let cauHinhBacHe = cauHinh.find(ele => (ele.bacDaoTao == bac.maBac && ele.heDaoTao == he.ma && ele.khoaSinhVien == khoaSV));
                        return {
                            bacDaoTao: bac.maBac,
                            tenBac: bac.tenBac,
                            heDaoTao: he.ma,
                            tenHe: he.ten,
                            khoaSinhVien: khoaSV,
                            ngayBatDau: cauHinhBacHe?.ngayBatDau || '',
                            ngayKetThuc: cauHinhBacHe?.ngayKetThuc || '',
                        };
                    });
                });
            });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/khoa-giao-dich/bac-he', app.permission.check('tcDotDongHocPhi:manage'), async (req, res) => {
        try {
            const data = req.body.data || {};
            const modifier = req.session?.user?.email || '';
            const timeModified = Date.now();

            let bacDaoTao = await app.model.dmSvBacDaoTao.getAll({ kichHoat: 1 });
            let heDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 });
            let khoaSinhVien = Array.from({ length: 8 }, (_, i) => i + new Date().getFullYear() - 7).reverse();

            data.bacDaoTao && (bacDaoTao = bacDaoTao.filter(item => item.maBac == data.bacDaoTao));
            data.heDaoTao && (heDaoTao = heDaoTao.filter(item => item.ma == data.heDaoTao));
            data.khoaSinhVien && (khoaSinhVien = khoaSinhVien.filter(item => item == data.khoaSinhVien));

            const listGroup = bacDaoTao.flatMap(bac => {
                return heDaoTao.flatMap(he => {
                    return khoaSinhVien.map(khoaSV => {
                        return {
                            bacDaoTao: bac.maBac,
                            heDaoTao: he.ma,
                            khoaSinhVien: khoaSV
                        };
                    });
                });
            });

            for (let condition of listGroup) {
                let item = await app.model.tcKhoaGiaoDich.get(condition);
                if (!item) {
                    await app.model.tcKhoaGiaoDich.create({ ...condition, ngayBatDau: data.ngayBatDau, ngayKetThuc: data.ngayKetThuc, ghiChu: data.ghiChu });
                }
                else {
                    await app.model.tcKhoaGiaoDich.update(condition, { ngayBatDau: data.ngayBatDau, ngayKetThuc: data.ngayKetThuc, ghiChu: data.ghiChu });
                }
            }

            let item = await app.model.tcKhoaGiaoDichLog.create({ ...data, modifier, timeModified });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/khoa-giao-dich/sinh-vien', app.permission.check('tcDotDongHocPhi:manage'), async (req, res) => {
        try {
            const mssv = req.body?.mssv || '';
            if (!mssv) {
                throw ('Không có thông tin sinh viên!');
            }
            let sinhVien = await app.model.fwStudent.get({ mssv });
            if (!sinhVien) {
                throw ('Không có thông tin sinh viên!');
            }
            const modifier = req.session?.user?.email || '';
            const timeModified = Date.now();

            await app.model.fwStudent.update({ mssv }, { khoaGiaoDich: 1 });
            await app.model.tcKhoaGiaoDichLog.create({ mssv, modifier, timeModified });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.readyHooks.add('TcKhoaGiaoDich:resetSinhVien', {
        ready: () => app.database && app.model && app.model.fwStudent && app.model.tcSetting,
        run: () => {
            app.primaryWorker && app.schedule('0 23 * * *', async () => {
                let { autoResetKhoaGiaoDich } = await app.model.tcSetting.getValue('autoResetKhoaGiaoDich');
                Number(autoResetKhoaGiaoDich) && app.model.fwStudent.update({ khoaGiaoDich: 1 }, { khoaGiaoDich: 0 });
            });
        },
    });

    app.post('/api/khtc/dot-dong', app.permission.check('tcDotDongHocPhi:write'), async (req, res) => {
        try {
            const data = req.body?.data;
            const user = req.session?.user;

            if (!data || !user) {
                throw 'Thông tin không đúng';
            }

            if (!(data.namHoc && data.hocKy && data.ten)) {
                throw 'Thông tin không đủ! Yêu cầu nhập đầy đủ thông tin';
            }

            if (data.ngayBatDau >= data.ngayKetThuc) {
                throw 'Ngày bắt đầu phải sớm hơn ngày kết thúc';
            }

            const newItem = await app.model.tcDotDong.create({
                namHoc: data.namHoc,
                hocKy: data.hocKy,
                ten: data.ten,
                modifier: user?.email || '',
                timeModified: Date.now()
            });

            res.send({ newItem });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.put('/api/khtc/dot-dong', app.permission.check('tcDotDongHocPhi:write'), async (req, res) => {
        try {
            let { keys, changes } = req.body;
            const user = req.session?.user;

            if (!keys || !changes) {
                throw 'Thông tin không đúng';
            }
            if (Object.keys(changes).includes('id')) {
                throw 'Thông tin thay đổi không được bao gồm ID';
            }

            changes = { ...changes, modifier: user?.email || '', timeModified: Date.now() };
            const newItem = await app.model.tcDotDong.update({ id: keys.id }, changes);
            res.send({ item: newItem });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/khtc/dot-dong', app.permission.check('tcDotDongHocPhi:delete'), async (req, res) => {
        try {
            const idDotDong = req.body?.idDotDong;

            await Promise.all([
                app.model.tcDotDong.delete({ id: idDotDong }),
                app.model.tcDotDongLoaiPhi.delete({ idDotDong }),
                app.model.tcDotDongCauHinhBacHe.delete({ idDotDong })
            ]);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/dot-dong/get-loai-phi', app.permission.check('tcDotDongHocPhi:write'), async (req, res) => {
        try {
            const { id: idDotDong } = req.query;
            // if (start) await app.model.tcDotDongLoaiPhi.update({ idDotDong }, { soTien: null });

            let item = await app.model.tcDotDongLoaiPhi.getAll({ idDotDong }, '*', 'uuTien');
            let mapLoaiPhi = await app.model.tcLoaiPhi.getAll();
            let mapLoaiHocPhi = await app.model.tcLoaiHocPhi.getAll();
            mapLoaiPhi = mapLoaiPhi.mapArrayToObject('id');
            mapLoaiHocPhi = mapLoaiHocPhi.mapArrayToObject('ma');

            // mapLoaiPhi = mapLoaiPhi.reduce((map, obj) => {
            //     map[obj.id] = obj.ten;
            //     return map;
            // }, {});

            // mapLoaiHocPhi = mapLoaiHocPhi.reduce((map, obj) => {
            //     map[obj.id] = obj.ten;
            //     return map;
            // }, {});

            item = item.map(loaiPhi => {
                loaiPhi['tenLoaiPhi'] = mapLoaiPhi[loaiPhi.loaiPhi]?.ten || '';
                loaiPhi['tenTamThu'] = mapLoaiPhi[loaiPhi.tamThu]?.ten || '';
                loaiPhi['tenLoaiHocPhi'] = mapLoaiHocPhi[loaiPhi.loaiHocPhi]?.ten || '';
                return loaiPhi;
            });

            res.send({ item });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong/cap-nhat-so-tien', app.permission.check('tcDotDongHocPhi:write'), async (req, res) => {
        try {
            const data = req.body?.data || [];
            if (!data) {
                throw 'Thông tin cập nhật số tiền không tồn tại';
            }
            await Promise.all([data.map(item => app.model.tcDotDongLoaiPhi.update(item[0], item[1]))]);
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong/cap-nhat-loai-phi', app.permission.check('tcDotDongHocPhi:write'), async (req, res) => {
        try {
            const { idDotDong, namHoc, hocKy, listLoaiPhi } = req?.body;
            await app.model.tcDotDongLoaiPhi.delete({ idDotDong });
            if (listLoaiPhi) {
                // const tontaiHocPhi = await app.model.tcDotDongHocPhiDetail.get({ isHocPhi: 1, namHoc, hocKy });
                for (let item of listLoaiPhi) {
                    // if (tontaiHocPhi && Number(item.isHocPhi)) {
                    //     throw ('Đã tồn tại loại phí học phí trong học kì này!');
                    // }
                    if (item.tamThu) {
                        const tamThu = await app.model.tcDotDongLoaiPhi.get({ loaiPhi: item.tamThu });
                        if (!tamThu) {
                            throw ('Loại phí tạm thu không tồn tại!');
                        }
                    }
                    await app.model.tcDotDongLoaiPhi.create({
                        idDotDong, namHoc, hocKy,
                        loaiPhi: item.loaiPhi,
                        tamThu: item.tamThu,
                        isHocPhi: item.loaiHocPhi ? 1 : 0,
                        loaiHocPhi: item.loaiHocPhi,
                        soTien: item.soTien,
                        uuTien: item.uuTien
                    });
                }
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/khtc/cau-hinh-dot-dong/detail/all', app.permission.check('tcDotDongHocPhi:manage'), async (req, res) => {
        try {
            const { khoaSinhVien, idDotDong, bacDaoTao } = req.query?.data;
            const listDetail = await app.model.tcDotDongCauHinhBacHe.getAll({ khoaSinhVien, idDotDong, bacDaoTao });
            listDetail.forEach(item => { item.loaiPhi = item.loaiPhi.split(','); });
            res.send(listDetail);
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/cau-hinh-dot-dong/save', app.permission.check('tcDotDongHocPhi:write'), async (req, res) => {
        try {
            const data = req.body?.data || '';
            const timeModified = Date.now();
            if (!data) {
                throw 'Thông tin lưu đợt đóng không tồn tại';
            }
            const { idDotDong, bacDaoTao, heDaoTao, khoaSinhVien, loaiPhi, ngayThongBao, ngayBatDau, ngayKetThuc } = data;
            await app.model.tcDotDongCauHinhBacHe.delete({ idDotDong, bacDaoTao, heDaoTao, khoaSinhVien });
            const item = await app.model.tcDotDongCauHinhBacHe.create({ idDotDong, bacDaoTao, heDaoTao, khoaSinhVien, loaiPhi, ngayThongBao, ngayBatDau, ngayKetThuc, modifier: req.session?.user?.email || '', timeModified });
            // await app.model.tcDotDongHocPhiApDungLog.create({ idDotDong, heDaoTao, khoaSinhVien, loaiPhi, ngayThongBao, ngayBatDau, ngayKetThuc, modifier: req?.session.user.email, timeModified: Date.now(), thaoTac: 'S' });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/khtc/cau-hinh-dot-dong/delete', app.permission.check('tcDotDongHocPhi:delete'), async (req, res) => {
        try {
            const data = req.body?.data || '';
            if (!data) {
                throw 'Thông tin lưu đợt đóng không tồn tại';
            }
            const { idDotDong, bacDaoTao, heDaoTao, khoaSinhVien } = data;
            // await Promise.all([app.model.tcDotDongHocPhiDetailMoi.delete({ idDotDong, heDaoTao, khoaSinhVien }), app.model.tcDotDongHocPhiApDungLog.create({ idDotDong, heDaoTao, khoaSinhVien, loaiPhi, ngayThongBao, ngayBatDau, ngayKetThuc, modifier: req?.session.user.email, timeModified: Date.now(), thaoTac: 'D' })]);
            await app.model.tcDotDongCauHinhBacHe.delete({ idDotDong, bacDaoTao, heDaoTao, khoaSinhVien });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/khtc/cau-hinh-dot-dong/ap-dung/preview', app.permission.check('tcDotDongHocPhi:manage'), async (req, res) => {
        try {
            let data = req.query?.data || '';
            if (!data) {
                throw ('Không thể xem trước danh sách áp dụng!');
            }

            let mapLoaiPhi = await app.model.tcLoaiPhi.getAll();
            mapLoaiPhi = mapLoaiPhi.reduce((map, obj) => {
                map[obj.id] = obj.ten;
                return map;
            }, {});

            const listLoaiPhi = data.loaiPhi.map(item => Object({ id: item, ten: mapLoaiPhi[item] }));
            const listSinhVienAll = {};

            for (let loaiPhi of data.loaiPhi) {
                let { listSV, isHocPhi } = await app.model.tcDotDong.apDungLoaiPhiPreview(data.idDotDong, loaiPhi, data.imssv, data.apDung, data.taiApDung, null, data.bacDaoTao, data.heDaoTao, data.khoaSinhVien);
                const daApDung = listSV.filter(item => item.daApDung == 1).length;
                listSinhVienAll[loaiPhi] = { data: listSV, length: listSV.length, daApDungLength: daApDung, chuaApDungLength: listSV.length - daApDung, isHocPhi };
            }
            res.send({ listSinhVienAll, listLoaiPhi });

        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/khtc/cau-hinh-dot-dong/ap-dung', app.permission.check('tcDotDongHocPhi:write'), async (req, res) => {
        try {
            const data = req.body?.data || '';
            if (!data) {
                throw ('Cần có bộ lọc!');
            }
            app.service.executeService.run({
                email: req.session.user.email,
                param: { data },
                task: 'apDungHocPhi',
                path: '/user/finance/dot-dong',
                isExport: 0,
                taskName: 'Áp dụng học phí',
            });
            res.send({});
        }
        catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/khtc/dot-dong/sinh-vien/info', app.permission.check('tcDotDongHocPhi:manage'), async (req, res) => {
        try {
            const mssv = req.query?.mssv || '';
            if (!mssv) {
                throw ('Không thể xem trước danh sách áp dụng!');
            }
            let item = await app.model.fwStudent.get({ mssv });
            if (!item) {
                throw ('Dữ liệu sinh viên không tồn tại, vui lòng kiểm tra lại!');
            }
            res.send(item);
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/khtc/dot-dong/roll-back', app.permission.check('tcDotDongHocPhi:write'), async (req, res) => {
        try {
            const filter = req.body?.data || '';
            if (!filter) {
                throw ('Thông tin hoàn tác đợt đóng không đúng!');
            }

            await app.model.tcDotDong.rollBack(app.utils.stringify(filter));

            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};