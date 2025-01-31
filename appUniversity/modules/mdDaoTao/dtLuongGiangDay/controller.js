module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7063: {
                title: 'Thù lao giảng dạy', groupIndex: 0,
                link: '/user/dao-tao/thu-lao-giang-day', parentKey: 7050,
                icon: 'fa fa-cubes',
                backgroundColor: '#F99B7D',
                color: '#fff'
            }
        }
    };

    app.permission.add(
        { name: 'dtThuLaoGiangDay:manage', menu },
        { name: 'dtThuLaoGiangDay:write' },
        { name: 'dtThuLaoGiangDay:delete' },
    );

    app.get('/user/dao-tao/thu-lao-giang-day', app.permission.orCheck('dtThuLaoGiangDay:manage', 'dtThuLaoGiangDay:write', 'dtThuLaoGiangDay:delete'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtThuLaoGiangDay', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThuLaoGiangDay:manage', 'dtThuLaoGiangDay:write', 'dtThuLaoGiangDay:delete');
            resolve();
        } else resolve();
    }));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dt/thu-lao-giang-day/page/:pageNumber/:pageSize', app.permission.check('dtThuLaoGiangDay:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                { condition, filter, sortTerm = 'idGiangVien_ASC' } = req.query;
            const _searchTerm = typeof condition === 'string' ? condition : '';
            let page = await app.model.dtThuLaoGiangDay.searchPage(_pageNumber, _pageSize, _searchTerm, app.utils.stringify(filter), sortTerm.split('_')[0], sortTerm.split('_')[1]);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = _searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thu-lao-giang-day/detail/get-info', app.permission.check('dtThuLaoGiangDay:manage'), async (req, res) => {
        try {
            const { id } = req.query;
            const result = await app.model.dtThuLaoGiangDay.get({ id });
            res.send(result);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/thu-lao-giang-day/auto-gen', app.permission.check('dtThuLaoGiangDay:manage'), async (req, res) => {
        try {
            const { namHoc, hocKy } = req.body;
            app.service.executeService.run({
                email: req.session.user.email,
                param: { namHoc, hocKy, email: req.session.user.email },
                task: 'genThuLaoGiangDay',
                path: '/user/dao-tao/thu-lao-giang-day',
                isExport: 0,
                taskName: `Tạo thù lao giảng dạy HK${hocKy} NH${namHoc}`,
            });
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/thu-lao-giang-day/update', app.permission.check('dtThuLaoGiangDay:manage'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            await app.model.dtThuLaoGiangDay.update({ id }, { ...changes });
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/thu-lao-giang-day/chia-tiet/change', app.permission.check('dtThuLaoGiangDay:manage'), async (req, res) => {
        try {
            const { data } = req.body;
            const { item, list, namHoc, hocKy, maHocPhan } = data;
            const modifier = req.session.user.email;
            const { loaiHinhDaoTao, lopNuocNgoai, vietNamHoc, donGia, thue, idThoiKhoaBieu, tinhPhi, loaiHopDong } = item;
            await Promise.all(list.map(async (rowChange, index) => {
                const { idGiangVien, soLuongSinhVien, soTietDuocChia } = rowChange;
                const { rows: result } = await app.model.dtThuLaoGiangDay.getInfoGiangVien(idGiangVien);
                const { hocVi, hocHam, ngach } = result[0];
                if (index == 0) {
                    if (item.idGiangVien == idGiangVien) {
                        await app.model.dtThuLaoGiangDay.update({ namHoc, hocKy, idGiangVien: item.idGiangVien, maHocPhan }, { soLuongSv: soLuongSinhVien, soTietDuocChia, modifier });
                    } else {
                        await app.model.dtThuLaoGiangDay.update({ namHoc, hocKy, idGiangVien, maHocPhan }, { soLuongSv: soLuongSinhVien, soTietDuocChia, idGiangVien, hocVi, hocHam, ngach, modifier });
                    }
                } else {
                    const checkGiangVien = await app.model.dtThuLaoGiangDay.get({ namHoc, hocKy, idGiangVien, maHocPhan, soLuongSv: soLuongSinhVien, modifier });
                    if (checkGiangVien) {
                        await app.model.dtThuLaoGiangDay.update({ namHoc, hocKy, idGiangVien, maHocPhan }, { soTietDuocChia: parseInt(checkGiangVien.soTietDuocChia) + parseInt(soTietDuocChia), modifier });
                    } else {
                        await app.model.dtThuLaoGiangDay.create({
                            namHoc, hocKy, idGiangVien,
                            hocVi, hocHam, ngach, soLuongSv: soLuongSinhVien, soTietDuocChia,
                            maHocPhan, loaiHinhDaoTao, lopNuocNgoai, vietNamHoc,
                            donGia, thue, idThoiKhoaBieu, tinhPhi, loaiHopDong, modifier
                        });
                    }
                }
            }));
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/thu-lao-giang-day/get-list-hop-dong', app.permission.check('dtThuLaoGiangDay:manage'), async (req, res) => {
        try {
            const filter = req.query;
            if (!filter) {
                throw ('Không có thông tin giảng viên');
            }

            const { rows: item } = await app.model.dtThuLaoGiangDay.getListHopDong(app.utils.stringify(filter));
            res.send(item);
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    const tinhToanHeSoChatLuong = async ({ maHocHam, maHocVi, ngach, namHoc }) => {
        const listHeSoChatLuongNamHoc = await app.model.dtDmHeSoChatLuong.getAll({ namHoc });
        if (maHocHam) {
            const resultByHocHam = listHeSoChatLuongNamHoc.find(item => item.hocHam == maHocHam);
            return resultByHocHam.heSo;
        }
        if (maHocVi) {
            const resultByHocVi = listHeSoChatLuongNamHoc.find(item => item.hocVi == maHocVi && (ngach && item.ngach && item?.ngach.includes(ngach) || item.ngach == null));
            return resultByHocVi.heSo;
        }
        if (ngach) {
            const resultByNgach = listHeSoChatLuongNamHoc.find(item => item.ngach.includes(ngach));
            return resultByNgach.heSo;
        }
        return 1;
    };
    const tinhToanHeSoTongHop = (soLuongSinhVien, heSoKhoiLuong, heSoChatLuong, lopVietNamHoc, lopNuocNgoai, heDaoTao) => {
        if (soLuongSinhVien == 0) {
            return 0;
        }

        if (!heSoChatLuong) {
            heSoChatLuong = 1.0;
        }
        if (lopNuocNgoai) {
            heSoKhoiLuong = 0.5;
        } else if (!heSoKhoiLuong) {
            heSoKhoiLuong = 0;
        }

        if (['VHVL', 'VB2', 'VB2_TX', 'VB2_VLVH', 'LT', 'TX'].includes(heDaoTao)) {
            return (heSoChatLuong + heSoKhoiLuong + 0.5);
        }
        else {
            return (heSoChatLuong + heSoKhoiLuong);
        }
    };
    const initHopDongGiangDay = async (data, info) => {
        const source = app.path.join(__dirname, 'resource', 'HDMG - VB2-LTDH-VLVH-TX (GV TRONG TRUONG) - ver 2023.docx');

        let mapLoaiHinhDaoTao = await app.model.dmSvLoaiHinhDaoTao.get({ ma: info.loaiHinhDaoTao });
        const soCongVan = await app.model.hcthSoDangKy.get({ id: data.soHopDong });
        let { rows: listHopDong, canbo: canBo } = await app.model.dtThuLaoGiangDay.exportHopDong(app.utils.stringify(data), app.utils.stringify(info));
        canBo = canBo[0];
        canBo.ngaySinh = canBo.ngaySinh ? app.date.viDateFormat(new Date(Number(canBo.ngaySinh))) : '';
        canBo.gioiTinh = canBo.gioiTinh == '01' ? 'Nam' : 'Nữ';
        canBo.cccdNgayCap = canBo.cccdNgayCap ? app.date.viDateFormat(new Date(Number(canBo.cccdNgayCap))) : '';

        for (let item in canBo) {
            if (!canBo[item]) canBo[item] = '';
        }
        for (let [idx, item] of listHopDong.entries()) {
            item['stt'] = idx + 1;
            item.tenMonHoc = app.utils.parse(item.tenMonHoc)?.vi || '';
            item.ngayBatDau = item.ngayBatDau ? app.date.viDateFormat(new Date(Number(item.ngayBatDau))) : '';
            item.ngayKetThuc = item.ngayKetThuc ? app.date.viDateFormat(new Date(Number(item.ngayKetThuc))) : '';
            const donGia = item.donGia;
            item.donGia = donGia.toString().numberDisplay();
            item['thoiGian'] = item.ngayBatDau + '\n' + item.ngayKetThuc;
            const heSoChatLuong = await tinhToanHeSoChatLuong({ namHoc: item.namHoc, maHocHam: item.maHocHam, maHocVi: item.maHocVi, ngach: item.ngach });
            const heSoTong = tinhToanHeSoTongHop(item.soLuongSinhVien, item.hskl, heSoChatLuong, item.lopVietNamHoc, item.lopNuocNgoai, item.heDaoTao);

            item['heSo'] = heSoTong.toString().numberDisplay();
            item['thanhTien'] = (parseFloat(donGia) * parseFloat(heSoTong) * parseInt(item.soTiet)).toString().numberDisplay();
            item['tongTien'] = (parseFloat(donGia) * parseFloat(heSoTong) * parseInt(item.soTiet));

            for (let subItem in item) {
                if (!item[subItem]) item[subItem] = '';
            }
        }
        const tongTien = listHopDong.reduce((total, cur) => total + parseFloat(cur['tongTien']), 0);
        let tienHopDong = {
            tongCong: (tongTien).toString().numberDisplay(),
            thue: (10).toString().numberDisplay(),
            tienThue: (parseFloat(tongTien * 10 / 100)).toString().numberDisplay(),
            tienSauThue: (tongTien * 0.9).toString().numberDisplay(),
            soTienBangChu: `${app.utils.numberToVnText(tongTien * 0.9)} Việt Nam Đồng`
        };
        //TODO
        const dataInit = { ...canBo, ...info, tenLoaiHinhDaoTao: mapLoaiHinhDaoTao?.ten || '', ...tienHopDong, dataHd: listHopDong, soCongVan: soCongVan?.soCongVan || '' };
        const buffer = await app.docx.generateFile(source, dataInit);
        return { buffer, filename: 'HDGD' };
    };

    app.post('/api/dt/thu-lao-giang-day/export-hop-dong', app.permission.check('dtThuLaoGiangDay:manage'), async (req, res) => {
        try {
            let { data, info } = req.body;
            const { buffer, filename } = await initHopDongGiangDay(data, info);
            res.send({ content: buffer, filename: filename + '.docx' });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });


    app.post('/api/dt/thu-lao-giang-day/chot-hop-dong', app.permission.check('dtThuLaoGiangDay:manage'), async (req, res) => {
        try {
            const { data, info } = req.body;
            const { buffer } = await initHopDongGiangDay(data, info);
            // TODO init ra cái hợp đồng
            await app.model.qtHopDongGiangDay.create({
                shcc: info.idGiangVien,
                namHoc: info.namHoc,
                loaiHinhDaoTao: info.loaiHinhDaoTao,
                noiDungHopDong: buffer.toString()
            });
            const listHopDong = data.listHopDong.split(',');
            await Promise.all(listHopDong.map(async id => {
                await app.model.dtThuLaoGiangDay.update({ id }, { status: 1 });
            }));
            res.send({ data, info });

        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};