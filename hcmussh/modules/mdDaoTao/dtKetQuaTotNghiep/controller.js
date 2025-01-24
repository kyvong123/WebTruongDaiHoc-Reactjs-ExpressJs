module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7112: {
                title: 'Kết quả xét tốt nghiệp', link: '/user/dao-tao/ket-qua-tot-nghiep',
                groupIndex: 1, icon: 'fa-archive', backgroundColor: '#E36273', color: 'black', parentKey: 7080
            },
        },
    };

    app.permission.add(
        { name: 'dtKetQuaTotNghiep:manage', menu },
    );

    app.get('/user/dao-tao/ket-qua-tot-nghiep', app.permission.check('dtKetQuaTotNghiep:manage'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dt/ket-qua-tot-nghiep/page/:pageNumber/:pageSize', app.permission.check('dtKetQuaTotNghiep:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize);

            let filter = req.query.filter || {};

            let page = await app.model.dtKetQuaTotNghiep.searchPage(_pageNumber, _pageSize, app.utils.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });

    app.get('/api/dt/ket-qua-tot-nghiep/download-template', app.permission.check('dtKetQuaTotNghiep:manage'), async (req, res) => {
        // let [xepLoai, dsNganh, dsChuyenNganh, dsLoaiHinh, dsHinhThuc] = await Promise.all([
        //     app.model.dtDiemDmXepLoai.getAll({}, '*'),
        //     app.model.dtNganhDaoTao.getAll({}, '*', 'tenNganh'),
        //     app.model.dtChuyenNganh.getAll({}, '*', 'ten'),
        //     app.model.dmSvLoaiHinhDaoTao.getAll({}, '*', 'ten'),
        //     app.model.dmHinhThucDaoTao.getAll({}, '*', 'ma'),
        // ]);

        const workBook = app.excel.create(),
            ws = workBook.addWorksheet('Kết quả tốt nghiệp');
        // wsNganh = workBook.addWorksheet('Danh sách ngành'),
        // wsChuyenNganh = workBook.addWorksheet('Danh sách chuyên ngành'),
        // wsLoaiHinh = workBook.addWorksheet('Danh sách chương trình học'),
        // wsHinhThuc = workBook.addWorksheet('Danh sách hình thức'),
        // wsXepLoai = workBook.addWorksheet('Xếp loại');

        const defaultColumns = [
            { header: 'Mssv', key: 'mssv', width: 20 },
            { header: 'Họ và tên', key: 'hoTen', width: 20 },
            { header: 'Giới tính', key: 'gioiTinh', width: 20 },
            { header: 'Ngày sinh', key: 'ngaySinh', width: 20 },
            { header: 'Nơi sinh', key: 'noiSinh', width: 20 },
            { header: 'Ngành đào tạo', key: 'maNganh', width: 20 },
            { header: 'Chuyên ngành', key: 'chuyenNganh', width: 20 },
            { header: 'Chương trình học', key: 'loaiHinh', width: 20 },
            { header: 'Hình thức đào tạo', key: 'hinhThuc', width: 20 },
            { header: 'Điểm trung bình', key: 'diem', width: 20 },
            { header: 'Xếp loại', key: 'xepLoai', width: 20 },
            { header: 'Kết quả', key: 'ketQua', width: 30 },
            { header: 'Lưu ý', key: 'luuY', width: 100 },
        ];

        ws.columns = defaultColumns;
        ws.getCell('A2').value = 'SV01';
        ws.getCell('B2').value = 'SV 01';
        ws.getCell('C2').value = 'Nam';
        ws.getCell('D2').value = '10/02/2003';
        ws.getCell('E2').value = 'Việt Nam';
        ws.getCell('F2').value = 'Ngữ văn Anh';
        ws.getCell('G2').value = 'Biên dịch';
        ws.getCell('H2').value = 'Chất lượng cao';
        ws.getCell('I2').value = 'CHính quy';
        ws.getCell('J2').value = '8.5';
        ws.getCell('K2').value = 'Giỏi';
        ws.getCell('L2').value = 'Đủ điều kiện TN';
        ws.getCell('M2').value = 'Sinh viên kiểm tra các thông tin trên, trong trường hợp có điều chỉnh/ thắc mắc/ khiếu nại sinh viên liên hệ phòng Quản lý đào tạo để được giải quyết.';

        // wsNganh.columns = [
        //     { header: 'MÃ NGÀNH', key: 'maNganh', width: 20 },
        //     { header: 'TÊN NGÀNH', key: 'tenNganh', width: 20 },
        // ];
        // dsNganh.forEach(item => wsNganh.addRow(item));

        // wsChuyenNganh.columns = [
        //     { header: 'MÃ CHUYÊN NGÀNH', key: 'ma', width: 20 },
        //     { header: 'TÊN CHUYÊN NGÀNH', key: 'ten', width: 20 },
        //     { header: 'TÊN NGÀNH', key: 'tenNganh', width: 20 },
        // ];
        // dsChuyenNganh.forEach(item => wsChuyenNganh.addRow({ ...item, tenNganh: dsNganh.find(i => i.maNganh == item.maNganh)?.tenNganh || '' }));

        // wsLoaiHinh.columns = [
        //     { header: 'MÃ CHƯƠNG TRÌNH HỌC', key: 'ma', width: 20 },
        //     { header: 'TÊN', key: 'ten', width: 20 },
        // ];
        // dsLoaiHinh.forEach(item => wsLoaiHinh.addRow(item));

        // wsHinhThuc.columns = [
        //     { header: 'MÃ HÌNH THỨC', key: 'ma', width: 20 },
        //     { header: 'TÊN', key: 'ten', width: 20 },
        // ];
        // dsHinhThuc.forEach(item => wsHinhThuc.addRow(item));

        // wsXepLoai.columns = [
        //     { header: 'MÃ', key: 'id', width: 20 },
        //     { header: 'TÊN', key: 'ten', width: 20 },
        // ];
        // xepLoai.forEach(item => wsXepLoai.addRow(item));

        app.excel.attachment(workBook, res, 'ImportKetQuaTotNghiep.xlsx');
    });

    app.get('/api/dt/ket-qua-tot-nghiep/export', app.permission.check('dtKetQuaTotNghiep:manage'), async (req, res) => {

        const workBook = app.excel.create(),
            ws = workBook.addWorksheet('Kết quả tốt nghiệp');

        let { rows: list } = await app.model.dtKetQuaTotNghiep.searchPage(1, 1000000, req.query.filter);

        const defaultColumns = [
            { header: 'Mssv', key: 'mssv', width: 20 },
            { header: 'Họ và tên', key: 'hoTen', width: 20 },
            { header: 'Giới tính', key: 'gioiTinh', width: 20 },
            { header: 'Ngày sinh', key: 'ngaySinh', width: 20 },
            { header: 'Nơi sinh', key: 'noiSinh', width: 20 },
            { header: 'Ngành đào tạo', key: 'nganhDaoTao', width: 20 },
            { header: 'Chuyên ngành', key: 'chuyenNganh', width: 20 },
            { header: 'Chương trình học', key: 'loaiHinh', width: 20 },
            { header: 'Hình thức đào tạo', key: 'hinhThuc', width: 20 },
            { header: 'Điểm trung bình', key: 'diem', width: 20 },
            { header: 'Xếp loại', key: 'xepLoai', width: 20 },
            { header: 'Kết quả', key: 'ketQua', width: 30 },
            { header: 'Lưu ý', key: 'luuY', width: 100 },
        ];

        ws.columns = defaultColumns;

        list.forEach(item => ws.addRow(item));

        app.excel.attachment(workBook, res, 'KetQuaTotNghiep.xlsx');
    });

    app.post('/api/dt/ket-qua-tot-nghiep/save-import', app.permission.check('dtKetQuaTotNghiep:manage'), async (req, res) => {
        try {
            let { items, idDot } = req.body;
            items = JSON.parse(items);

            await Promise.all(items.map(async item => {
                const { mssv } = item;
                const exist = await app.model.dtKetQuaTotNghiep.get({ mssv, idDot });
                exist ? await app.model.dtKetQuaTotNghiep.update({ id: exist.id }, { ...item }) : await app.model.dtKetQuaTotNghiep.create({ ...item, idDot });
            }));
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/dt/ket-qua-tot-nghiep', app.permission.check('dtKetQuaTotNghiep:manage'), async (req, res) => {
        try {
            let { id } = req.body;
            await app.model.dtKetQuaTotNghiep.delete({ id });
            res.end();
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('ImportKetQuaTotNghiep', (req, fields, files, params, done) =>
        app.permission.has(req, () => ImportKetQuaTotNghiep(req, fields, files, done), done, 'dtKetQuaTotNghiep:manage')
    );

    const ImportKetQuaTotNghiep = async (req, fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'ImportKetQuaTotNghiep' && files.ImportKetQuaTotNghiep && files.ImportKetQuaTotNghiep.length) {
            const srcPath = files.ImportKetQuaTotNghiep[0].path;
            let workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                worksheet = workbook.getWorksheet(1);
                app.fs.deleteFile(srcPath);

                // let [xepLoai, dsNganh, dsChuyenNganh, dsLoaiHinh, dsHinhThuc] = await Promise.all([
                //     app.model.dtDiemDmXepLoai.getAll({}, '*'),
                //     app.model.dtNganhDaoTao.getAll({}, '*', 'tenNganh'),
                //     app.model.dtChuyenNganh.getAll({}, '*', 'ten'),
                //     app.model.dmSvLoaiHinhDaoTao.getAll({}, '*', 'ten'),
                //     app.model.dmHinhThucDaoTao.getAll({}, '*', 'ma'),
                // ]);

                if (worksheet) {
                    try {
                        done({});
                        let items = [], falseItems = [], index = 2;

                        while (true) {
                            const getVal = (column, type = 'text', Default) => {
                                Default = Default ? Default : '';
                                let val = worksheet.getCell(column + index).text?.trim();
                                if (type == 'number' && val != '') {
                                    if (!isNaN(Number(val))) return Number(val);
                                    else val = '';
                                }
                                return val === '' ? Default : (val == null ? '' : val.toString());
                            };
                            if (!(worksheet.getCell('A' + index).value)) {
                                break;
                            } else {
                                const data = {
                                    mssv: getVal('A'),
                                    hoTen: getVal('B'),
                                    gioiTinh: getVal('C'),
                                    ngaySinh: getVal('D'),
                                    noiSinh: getVal('E'),
                                    nganhDaoTao: getVal('F'),
                                    chuyenNganh: getVal('G'),
                                    loaiHinh: getVal('H'),
                                    hinhThuc: getVal('I'),
                                    diem: getVal('J'),
                                    xepLoai: getVal('K'),
                                    ketQua: getVal('L'),
                                    luuY: getVal('M'),
                                    row: index,
                                };

                                let sv = await app.model.fwStudent.get({ mssv: data.mssv });
                                if (!sv) {
                                    falseItems.push({ ...data, error: 'Không tồn tại sinh viên!' });
                                } else {
                                    // data.hoTen = `${sv.ho || ''} ${sv.ten || ''}`;

                                    // if (data.ctdtTotNghiep) {
                                    //     let ctdt = await app.model.dtKhungDaoTao.get({ maCtdt: data.ctdtTotNghiep });
                                    //     if (!ctdt) {
                                    //         falseItems.push({ ...data, error: 'Không tồn tại chương trình đào tạo!' });
                                    //         index++;
                                    //         continue;
                                    //     }
                                    // }

                                    // const ndt = dsNganh.find(i => i.maNganh == data.nganhDaoTao),
                                    //     cn = dsChuyenNganh.find(i => i.ma == data.chuyenNganh),
                                    //     lh = dsLoaiHinh.find(i => i.ma == data.loaiHinh),
                                    //     ht = dsHinhThuc.find(i => i.ma == data.hinhThuc);

                                    // if (!ndt) {
                                    //     falseItems.push({ ...data, error: 'Không tồn tại ngành đào tạo!' });
                                    //     index++;
                                    //     continue;
                                    // }
                                    // data.tenNganh = ndt.tenNganh;

                                    // if (data.loaiHinh && !lh) {
                                    //     falseItems.push({ ...data, error: 'Không tồn tại chương trình học!' });
                                    //     index++;
                                    //     continue;
                                    // } else data.tenLoaiHinh = lh?.ten;

                                    // if (data.hinhThuc && !ht) {
                                    //     falseItems.push({ ...data, error: 'Không tồn tại hình thức đào tạo!' });
                                    //     index++;
                                    //     continue;
                                    // } else data.tenHinhThuc = ht?.ten;

                                    // if (data.chuyenNganh) {
                                    //     if (!cn) {
                                    //         falseItems.push({ ...data, error: 'Không tồn tại chuyên ngành!' });
                                    //         index++;
                                    //         continue;
                                    //     }
                                    //     if (cn.maNganh == data.maNganh) {
                                    //         falseItems.push({ ...data, error: 'Chuyên ngành không phù hợp với ngành đào tạo!' });
                                    //         index++;
                                    //         continue;
                                    //     }
                                    //     data.tenChuyenNganh = cn.ten;
                                    // }

                                    // data.isTotNghiep = data.isTotNghiep == '0' || !data.isTotNghiep ? 0 : 1;

                                    // let xl = xepLoai.find(i => i.id == data.xepLoai);
                                    // if (data.xepLoai && !xl) {
                                    //     falseItems.push({ ...data, error: 'Không tồn tại xếp loại!' });
                                    //     index++;
                                    //     continue;
                                    // }
                                    // data.tenXepLoai = xl.ten;
                                    data.diem = !isNaN(Number(data.diem)) ? Number(data.diem).toFixed(2) : data.diem;
                                    items.push({ ...data });
                                }
                                (index % 10 == 0) && app.io.to(req.session.user.email).emit('import-ket-qua', { status: 'importing', items, falseItems });
                            }
                            index++;
                        }
                        app.io.to(req.session.user.email).emit('import-ket-qua', { status: 'done', items, falseItems });
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };
};