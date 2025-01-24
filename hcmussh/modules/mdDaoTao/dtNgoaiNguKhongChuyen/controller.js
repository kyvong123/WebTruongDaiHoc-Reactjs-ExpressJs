module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7108: {
                title: 'Ngoại ngữ không chuyên', link: '/user/dao-tao/ngoai-ngu-khong-chuyen',
                groupIndex: 1, backgroundColor: '#F9F54B', color: '#000', parentKey: 7068, icon: 'fa-language'
            }
        }
    };

    const menuTinhTrang = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7109: {
                title: 'Tình trạng ngoại ngữ', link: '/user/dao-tao/ngoai-ngu-khong-chuyen/tinh-trang',
                groupIndex: 1, backgroundColor: '#274D5A', color: 'white', parentKey: 7068, icon: 'fa-user-o'
            }
        }
    };

    app.permission.add(
        { name: 'dtNgoaiNguKhongChuyen:manage', menu },
        { name: 'dtNgoaiNguKhongChuyen:manage', menu: menuTinhTrang },
        { name: 'dtNgoaiNguKhongChuyen:write' },
        { name: 'dtNgoaiNguKhongChuyen:delete' }
    );

    app.get('/user/dao-tao/ngoai-ngu-khong-chuyen', app.permission.check('dtNgoaiNguKhongChuyen:manage'), app.templates.admin);
    app.get('/user/dao-tao/ngoai-ngu-khong-chuyen/item', app.permission.check('dtNgoaiNguKhongChuyen:manage'), app.templates.admin);
    app.get('/user/dao-tao/ngoai-ngu-khong-chuyen/tinh-trang', app.permission.check('dtNgoaiNguKhongChuyen:manage'), app.templates.admin);
    // API ===========================================================================

    app.get('/api/dt/ngoai-ngu-khong-chuyen/data-khoa-he', app.permission.check('dtNgoaiNguKhongChuyen:manage'), async (req, res) => {
        try {
            const { filter = {} } = req.query;
            const { rows: items } = await app.model.dtNgoaiNguKhongChuyen.getListKhoa(app.utils.stringify(filter));
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/ngoai-ngu-khong-chuyen/data', app.permission.check('dtNgoaiNguKhongChuyen:manage'), async (req, res) => {
        try {
            const { khoaSinhVien, loaiHinhDaoTao } = req.query;
            const [{ rows: items, listngoaingu: listNgoaiNgu }, { rows: listCondition }, { rows: listMien }] = await Promise.all([
                app.model.dtNgoaiNguKhongChuyen.getData(app.utils.stringify({ khoaSinhVien, loaiHinhDaoTao })),
                app.model.dtNgoaiNguKhongChuyenCondition.getData(app.utils.stringify({ khoaSinhVien, loaiHinhDaoTao })),
                app.model.dtNgoaiNguKhongChuyenMien.getData(app.utils.stringify({ khoaSinhVien, loaiHinhDaoTao }))
            ]);
            res.send({ items, listNgoaiNgu, listCondition, listMien });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/dt/ngoai-ngu-khong-chuyen/khoa-sinh-vien', app.permission.check('dtNgoaiNguKhongChuyen:manage'), async (req, res) => {
        try {
            const { rows: items } = await app.model.dtNgoaiNguKhongChuyen.getKhoaLoaiHinh();
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/ngoai-ngu-khong-chuyen', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const userModified = req.session.user.email,
                timeModified = Date.now(),
                { data, config } = req.body,
                { khoaSinhVien, loaiHinhDaoTao } = config;

            await app.model.dtNgoaiNguKhongChuyen.delete({ khoaSinhVien, loaiHinhDaoTao });

            await Promise.all(Object.values(data).flatMap(item => Object.values(item).map((i, index) => app.model.dtNgoaiNguKhongChuyen.create({ ...i, khoaSinhVien, loaiHinhDaoTao, isStandard: Number(index == 3), userModified, timeModified }))));
            app.dkhpRedis.initNgoaiNguAll();

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/ngoai-ngu-khong-chuyen/clone', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const userModified = req.session.user.email,
                timeModified = Date.now(),
                { data, dataClone } = req.body,
                { khoaSinhVien, loaiHinhDaoTao } = data,
                { khoaSinhVienClone, loaiHinhDaoTaoClone } = dataClone,
                num = Number(khoaSinhVien) - Number(khoaSinhVienClone);

            const [list, listCondition, listMien] = await Promise.all([
                app.model.dtNgoaiNguKhongChuyen.getAll({ khoaSinhVien: khoaSinhVienClone, loaiHinhDaoTao: loaiHinhDaoTaoClone }, 'loaiNgoaiNgu, namHoc, hocKy, semester, isStandard, maMonHoc', 'loaiNgoaiNgu, semester'),
                app.model.dtNgoaiNguKhongChuyenCondition.getAll({ khoaSinhVien: khoaSinhVienClone, loaiHinhDaoTao: loaiHinhDaoTaoClone }, 'semesterFrom, semesterEnd, isDangKy, nhomNgoaiNgu, diemDat, ctdtDangKy, tongSoTinChi, khoiKienThuc, isChungChi, isJuniorStudent, nhomNgoaiNguMien, diemMien'),
                app.model.dtNgoaiNguKhongChuyenMien.getAll({ khoaSinhVien: khoaSinhVienClone, loaiHinhDaoTao: loaiHinhDaoTaoClone }, 'maNganh, maChuyenNganh')
            ]);
            if (!list.length) throw { message: 'Khóa sinh viên sao chép không có dữ liệu!' };

            await Promise.all([
                app.model.dtNgoaiNguKhongChuyen.delete({ khoaSinhVien, loaiHinhDaoTao }),
                app.model.dtNgoaiNguKhongChuyenCondition.delete({ khoaSinhVien, loaiHinhDaoTao }),
                app.model.dtNgoaiNguKhongChuyenMien.delete({ khoaSinhVien, loaiHinhDaoTao }),
            ]);

            await Promise.all([
                ...list.map(item => {
                    const namHoc = `${parseInt(item.namHoc) + num} - ${parseInt(item.namHoc) + num + 1}`;
                    return app.model.dtNgoaiNguKhongChuyen.create({ ...item, userModified, timeModified, namHoc, semester: Number(`${namHoc.substring(2, 4)}${item.hocKy}`), khoaSinhVien, loaiHinhDaoTao });
                }),
                ...listCondition.map(item => {
                    if (item.ctdtDangKy) {
                        const listNamHoc = JSON.parse(item.ctdtDangKy);
                        item.ctdtDangKy = JSON.stringify(listNamHoc.map(i => {
                            const semester = `${Number(i.semester.substring(0, 2)) + num}${i.semester.substring(2)}`;
                            return i.soTinChi != null || i.soTinChi != '' ? { semester, soTinChi: i.soTinChi } : { semester };
                        }));
                    }
                    return app.model.dtNgoaiNguKhongChuyenCondition.create({
                        ...item, userModified, timeModified, khoaSinhVien, loaiHinhDaoTao,
                        semesterFrom: `${Number(item.semesterFrom.toString().substring(0, 2)) + num}${item.semesterFrom.toString().substring(2)}`,
                        semesterEnd: item.semesterEnd ? `${Number(item.semesterEnd.toString().substring(0, 2)) + num}${item.semesterEnd.toString().substring(2)}` : '',
                        nhomNgoaiNgu: item.nhomNgoaiNgu ? `${Number(item.nhomNgoaiNgu.toString().substring(0, 2)) + num}${item.nhomNgoaiNgu.toString().substring(2)}` : '',
                        nhomNgoaiNguMien: item.nhomNgoaiNguMien ? `${Number(item.nhomNgoaiNguMien.toString().substring(0, 2)) + num}${item.nhomNgoaiNguMien.toString().substring(2)}` : ''
                    });
                }),
                ...listMien.map(item => app.model.dtNgoaiNguKhongChuyenMien.create({ ...item, userModified, timeModified, khoaSinhVien, loaiHinhDaoTao })),
            ]);
            app.dkhpRedis.initNgoaiNguAll();

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/ngoai-ngu-khong-chuyen/condition', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const userModified = req.session.user.email,
                timeModified = Date.now(),
                { data, config } = req.body,
                { khoaSinhVien, loaiHinhDaoTao } = config;

            await app.model.dtNgoaiNguKhongChuyenCondition.create({ ...data, khoaSinhVien, loaiHinhDaoTao, userModified, timeModified });
            app.dkhpRedis.initNgoaiNguAll();

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/ngoai-ngu-khong-chuyen/condition', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const userModified = req.session.user.email,
                timeModified = Date.now(),
                { id, changes } = req.body;

            await app.model.dtNgoaiNguKhongChuyenCondition.update({ id }, { ...changes, userModified, timeModified });
            app.dkhpRedis.initNgoaiNguAll();

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/ngoai-ngu-khong-chuyen/condition', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const { id } = req.body;

            await app.model.dtNgoaiNguKhongChuyenCondition.delete({ id });
            app.dkhpRedis.initNgoaiNguAll();

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.post('/api/dt/ngoai-ngu-khong-chuyen/mien', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const userModified = req.session.user.email,
                timeModified = Date.now(),
                { data } = req.body;

            await app.model.dtNgoaiNguKhongChuyenMien.create({ ...data, userModified, timeModified });
            app.dkhpRedis.initNgoaiNguAll();

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.put('/api/dt/ngoai-ngu-khong-chuyen/mien', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const userModified = req.session.user.email,
                timeModified = Date.now(),
                { id, changes } = req.body;

            await app.model.dtNgoaiNguKhongChuyenMien.update({ id }, { ...changes, userModified, timeModified });
            app.dkhpRedis.initNgoaiNguAll();

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/ngoai-ngu-khong-chuyen/mien', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const { id } = req.body;

            await app.model.dtNgoaiNguKhongChuyenMien.delete({ id });
            app.dkhpRedis.initNgoaiNguAll();

            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const getData = async (filter) => {
        const { namHoc, hocKy, loaiHinh, khoaSinhVien, khoa, nganh, semester, ks_mssv, ks_hoTen, ks_tinhTrangNgoaiNgu } = filter;
        let namHocBefore = namHoc, hocKyBefore = hocKy;
        if (hocKy == 1) {
            const tmp = Number(namHocBefore.substring(0, 4));
            namHocBefore = `${tmp - 1} - ${tmp}`;
            hocKyBefore = 3;
        } else hocKyBefore = hocKyBefore - 1;

        let [listNgoaiNgu, condition, { rows: list }] = await Promise.all([
            app.model.dtNgoaiNguKhongChuyen.getAll({ khoaSinhVien, loaiHinhDaoTao: loaiHinh }),
            app.model.dtNgoaiNguKhongChuyenCondition.get({
                statement: 'khoaSinhVien = :khoaSinhVien AND loaiHinhDaoTao = :loaiHinhDaoTao AND ((semesterEnd IS NULL AND semesterFrom <= :semester) OR (:semester BETWEEN semesterFrom AND semesterEnd))',
                parameter: { semester, khoaSinhVien, loaiHinhDaoTao: loaiHinh }
            }),
            app.model.dtNgoaiNguKhongChuyen.tinhTrang(app.utils.stringify({ khoaSinhVien, loaiHinh, khoa, nganh, namHoc, hocKy, ks_mssv, ks_hoTen, namHocBefore, hocKyBefore })),
        ]);

        if (condition) {
            const { isDangKy, nhomNgoaiNgu, diemDat, ctdtDangKy, tongSoTinChi, khoiKienThuc, isChungChi, isJuniorStudent, diemMien, nhomNgoaiNguMien } = condition;

            list = list.map(item => {
                const listDiem = item.listDiem ? app.utils.parse(item.listDiem) : [],
                    monHocDangKy = item.monHocDangKy ? item.monHocDangKy.split(',') : [];
                if (item.isMien) item.status = 1;

                if (!item.status) {
                    if (isChungChi && (item.isDangKy || item.isChungChi || item.isJuniorStudent)) item.status = 2;
                    else if (isJuniorStudent && item.isJuniorStudent) item.status = 2;
                }

                // CHECK DANG KY NGOAI NGU KHONG CHUYEN MIEN
                if (!item.status && nhomNgoaiNguMien) {
                    const listMonHoc = listDiem.filter(diem => listNgoaiNgu.filter(nn => nn.semester >= nhomNgoaiNguMien).map(nn => nn.maMonHoc).includes(diem.maMonHoc));
                    item.status = diemMien ? (listMonHoc && listMonHoc.find(i => i.maxDiem && Number(i.maxDiem) >= Number(diemMien)) ? 3 : 0) : (listMonHoc.length ? 3 : 0);
                }

                if (isDangKy && !item.status) {
                    if (nhomNgoaiNgu) {
                        const isPass = listDiem.filter(diem => listNgoaiNgu.filter(nn => nn.semester >= nhomNgoaiNgu).map(nn => nn.maMonHoc).includes(diem.maMonHoc));
                        item.status = diemDat ? (isPass && isPass.find(i => i.maxDiem && Number(i.maxDiem) >= Number(diemDat)) ? 3 : 0) : (isPass.length ? 3 : 0);
                    } else {
                        const listMon = listNgoaiNgu.map(nn => nn.maMonHoc),
                            isPass = listDiem.filter(diem => listMon.includes(diem.maMonHoc)),
                            hasDky = monHocDangKy.find(mh => listMon.includes(mh));
                        item.status = hasDky ? (diemDat ? (isPass && isPass.find(i => i.maxDiem && Number(i.maxDiem) >= Number(diemDat)) ? 3 : 0) : 3) : 0;
                    }
                }

                return { ...item, ctdtDangKy, tongSoTinChi, khoiKienThuc };
            });
        }

        list = list.filter(item => ks_tinhTrangNgoaiNgu == null || ks_tinhTrangNgoaiNgu == '' || (ks_tinhTrangNgoaiNgu == 0 && !item.status) || (ks_tinhTrangNgoaiNgu == item.status));

        return list;
    };

    app.get('/api/dt/ngoai-ngu-khong-chuyen/page/:pageNumber/:pageSize', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);

            const list = await getData(req.query.filter);

            res.send({ page: { totalItem: list.length, pageSize: _pageSize, pageTotal: Math.ceil(list.length / _pageSize), pageNumber: _pageNumber, pageCondition: null, list: list.slice((_pageNumber - 1) * _pageSize, _pageNumber * _pageSize) } });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/ngoai-ngu-khong-chuyen/download-excel', app.permission.check('dtNgoaiNguKhongChuyen:write'), async (req, res) => {
        try {
            const filter = app.utils.parse(req.query.filter);
            const [list, dmKhoiKienThuc] = await Promise.all([
                getData(filter),
                app.model.dmKhoiKienThuc.getAll({}),
            ]);

            const dataKhoa = [0, 1, 2].flatMap(nh => [1, 2].map(hk => ({ id: Number(`${(Number(filter.khoaSinhVien) + nh).toString().substring(2, 4)}${hk}`), namHoc: `${Number(filter.khoaSinhVien) + nh} - ${Number(filter.khoaSinhVien) + 1 + nh}`, hocKy: hk }))),
                listKhoaSemester = dataKhoa.reduce((acc, cur) => {
                    const { id, namHoc, hocKy } = cur;
                    acc[id] = { id, namHoc, hocKy, text: `NH${namHoc} HK${hocKy}` };
                    return acc;
                }, {});

            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Sheet');

            ws.columns = [
                { header: 'STT', key: 'STT', width: 10 },
                { header: 'MSSV', key: 'mssv', width: 10 },
                { header: 'HỌ TÊN', key: 'hoTen', width: 10 },
                { header: 'KHOA', key: 'tenDonVi', width: 10 },
                { header: 'NGÀNH', key: 'tenNganh', width: 10 },
                { header: 'CHUYÊN NGÀNH', key: 'tenChuyenNganh', width: 10 },
                { header: 'TÌNH TRẠNG NGOẠI NGỮ', key: 'tinhTrang', width: 10 },
                { header: 'Tổng số tín chỉ đăng ký', key: 'tongSoTinChi', width: 10 },
                { header: 'Khối kiến thức', key: 'khoiKienThuc', width: 10 },
                { header: 'Năm học, học kỳ CTDT', key: 'ctdtDangKy', width: 10 },
            ];

            const mapperStatus = {
                1: 'Miễn ngoại ngữ',
                2: 'Đủ điều kiện chứng chỉ',
                3: 'Đủ điều kiện môn học',
            };

            list.forEach((item, index) => {
                item.hoTen = `${item.ho} ${item.ten}`;
                item.tenNganh = item.tenNganh || '';
                item.tenChuyenNganh = item.tenChuyenNganh || '';
                item.tinhTrang = item.status ? mapperStatus[item.status] : 'Không đủ điều kiện ngoại ngữ';

                if (item.khoiKienThuc) {
                    item.khoiKienThuc = item.khoiKienThuc.split(',').map(kkt => dmKhoiKienThuc.find(i => i.ma == kkt)?.ten || '').join('; ');
                }

                if (item.ctdtDangKy) {
                    item.ctdtDangKy = JSON.parse(item.ctdtDangKy);
                    if (item.ctdtDangKy.length) {
                        item.ctdtDangKy = item.ctdtDangKy.map(nh => {
                            const textNH = listKhoaSemester[nh.semester]?.text;
                            return nh.soTinChi != null ? `${textNH}: ${nh.soTinChi}` : textNH;
                        }).join('; ');
                    } else item.ctdtDangKy = '';
                }

                ws.addRow({ stt: index + 1, ...item, tongSoTinChi: item.tongSoTinChi ?? '', khoiKienThuc: item.khoiKienThuc || '', ctdtDangKy: item.ctdtDangKy || '' }, index === 0 ? 'n' : 'i');
            });

            let fileName = 'TINH_TRANG_NGOAI_NGU.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};