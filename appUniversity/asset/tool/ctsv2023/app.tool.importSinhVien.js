let package = require('../../../package.json');
const path = require('path');
const date = require('../../../config/lib/date');
const { rejects } = require('assert');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'), path,
    publicPath: path.join(__dirname, '../../../', 'public'),
    assetPath: path.join(__dirname, '../../'),
    modulesPath: path.join(__dirname, '../../../', 'modules'),
    database: {},
    model: {},
    worker: { reset: () => { } }
};

if (!app.isDebug) package = Object.assign({}, package, require('../../config.json'));
// Configure ==================================================================
require('../../../config/common')(app);
require('../../../config/lib/fs')(app);
require('../../../config/lib/excel')(app);
require('../../../config/lib/hooks')(app);
require('../../../config/lib/utils')(app);
require('../../../config/lib/date')(app);
require('../../../config/lib/string')(app);
require('../../../config/database.oracleDB')(app, package);

// const dataPath = app.path.join('')
app.loadModules(false);
app.readyHooks.add('Run tool.importSinhVien.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.fwStudent,
    run: async () => {
        try {
            let workbook = await app.excel.readFile(app.path.join(__dirname, './data/temp.datasinhvien.xlsx'));
            if (!workbook) throw 'Error: workbook not found';
            const dataSheet = workbook.getWorksheet('Sheet1');
            if (!dataSheet) throw 'Error: dataSheet not found';

            const report = app.excel.create();
            const rps = report.addWorksheet('Result');
            rps.columns = [
                { header: 'mssv', key: 'mssv', width: 15 },
                { header: 'cmnd', key: 'cmnd', width: 15 },
                { header: 'ho', key: 'ho', width: 15 },
                { header: 'ten', key: 'ten', width: 15 },
                { header: 'loaiHinhDaoTao', key: 'loaiHinhDaoTao', width: 15 },
                { header: 'maNganh', key: 'maNganh', width: 15 },
                { header: 'khoa', key: 'khoa', width: 15 },
                { header: 'phuongThucTuyenSinh', key: 'phuongThucTuyenSinh', width: 15 },
                { header: 'diemThi', key: 'diemThi', width: 15 },
                { header: 'gioiTinh', key: 'gioiTinh', width: 15 },
                { header: 'ngaySinh', key: 'ngaySinh', width: 15 },
                { header: 'khuVucTuyenSinh', key: 'khuVucTuyenSinh', width: 15 },
                { header: 'doiTuongTuyenSinh', key: 'doiTuongTuyenSinh', width: 15 },
                { header: 'emailTruong', key: 'emailTruong', width: 15 },
                { header: 'loaiSinhVien', key: 'loaiSinhVien', width: 15 },
                { header: 'tinhTrang', key: 'tinhTrang', width: 15 },
                { header: 'maKhoa', key: 'maKhoa', width: 15 },
                { header: 'namTuyenSinh', key: 'namTuyenSinh', width: 15 },
                { header: 'ngayNhapHoc', key: 'ngayNhapHoc', width: 15 },
                { header: 'bacDaoTao', key: 'bacDaoTao', width: 15 },
                { header: 'canEdit', key: 'canEdit', width: 15 },
                { header: 'khoaSinhVien', key: 'khoaSinhVien', width: 15 },
            ]


            // Some variable    
            const lsNganh = await app.model.dtNganhDaoTao.getAll(null, 'maNganh, maLop, khoa'),
                mapMaLopNganh = Object.assign({}, ...lsNganh.map(nganh => ({ [nganh.maLop]: nganh }))),
                mapMaNganh = Object.assign({}, ...lsNganh.map(nganh => ({ [nganh.maNganh]: nganh }))),
                mapTenNganh = Object.assign({}, ...lsNganh.map(nganh => ({ [nganh.tenNganh]: nganh }))),
                lsTinhTrang = await app.model.dmTinhTrangSinhVien.getAll(null, 'ma, ten'),
                mapTenTinhTrang = Object.assign({}, ...lsTinhTrang.map(tinhTrang => ({ [tinhTrang.ten]: tinhTrang }))),
                lsHeDaoTao = await app.model.dmSvLoaiHinhDaoTao.getAll(null),
                mapMaHeDaoTao = Object.assign({}, ...lsHeDaoTao.map(he => ({ [he.ma]: he }))),
                lsDmDanToc = await app.model.dmDanToc.getAll(),
                mapTenDanToc = Object.assign({}, ...lsDmDanToc.map(danToc => ({ [danToc.ten.toLowerCase().normalize()]: danToc }))),
                lsDmTonGiao = await app.model.dmTonGiao.getAll(),
                mapTenTonGiao = Object.assign({}, ...lsDmTonGiao.map(tonGiao => ({ [tonGiao.ten.toLowerCase().normalize()]: tonGiao }))),
                lsDmQuocGia = await app.model.dmQuocGia.getAll(),
                mapTenQuocGia = Object.assign({}, ...lsDmQuocGia.map(quocGia => ({ [quocGia.tenQuocGia.toLowerCase().normalize()]: quocGia }))),
                lsDmTinhThanhPho = await app.model.dmTinhThanhPho.getAll(),
                mapTenThanhPho = Object.assign({}, ...lsDmTinhThanhPho.map(tinhThanh => ({ [tinhThanh.ten.toLowerCase().normalize()]: tinhThanh }))),
                lsPhuongThucTs = await app.model.dmPhuongThucTuyenSinh.getAll(null, 'ma, ten'),
                mapMaPhuongThucTs = Object.assign({}, ...lsPhuongThucTs.map(phuongThuc => ({ [phuongThuc.ma]: phuongThuc }))),
                lsDoiTuongTuyenSinh = await app.model.dmSvDoiTuongTs.getAll(null, 'ma, ten'),
                mapMaDoiTuongTs = Object.assign({}, ...lsDoiTuongTuyenSinh.map(doiTuong => ({ [Number(doiTuong.ma)]: doiTuong })));


            console.log('Found ', dataSheet.actualRowCount, ' rows');


            // Some helper function
            const splitDate = (dateString, _default = '') => {
                if (typeof dateString == 'string') {
                    const [d, m, y] = dateString.split(/[,.\s\/\-_]/),
                        mil = new Date(y, m - 1, d).getTime();
                    if (d && m && y) return isNaN(mil) ? _default : mil;
                }
                if (dateString instanceof Date) {
                    return dateString.getTime()
                }
                return _default;
            }

            const splitFullName = (fullName) => {
                if (!fullName) return { ho: '', ten: '' };
                const tenArr = fullName.split(' ');
                const hoArr = tenArr.splice(0, tenArr.length - 1);
                return {
                    ho: hoArr.join(' '),
                    ten: tenArr[0],
                }
            }

            const parseEmail = (email) => {
                if (typeof email == 'object') return email.text;
                return email
            }

            const parseCmnd = (cmnd) => {
                try {
                    if (typeof cmnd == 'object') return cmnd.text;
                    if (typeof cmnd == 'number') return cmnd.toString();
                    return cmnd
                } catch (error) {
                    console.log(cmnd, error);
                    return ''
                }
            }


            const splitDiaChi = async (diaChi = '') => {
                if (!diaChi) return { soNha: '', maQuanHuyen: '', maPhuongXa: '', maTinhThanh: '' }
                const reQuanHuyen = /(quận |q. |q |huyện|thị xã |thành phố )/;
                const rePhuongXa = /(phường |p. |p |xã |thị trấn )/;
                const soNha = []
                let _phuong = '', _quan = '';
                diaChi.toLowerCase().split(/\s*,\s*/).forEach(comp => {
                    if (reQuanHuyen.test(comp)) {
                        _quan = comp.replaceAll(reQuanHuyen, '');
                    } else if (rePhuongXa.test(comp)) {
                        _phuong = comp.replaceAll(rePhuongXa, '');
                    } else {
                        soNha.push(comp);
                    }
                });
                let maQuanHuyen = '', maPhuongXa = '', maTinhThanh = '';
                let objQuan = '';
                ({ maQuanHuyen, maTinhThanhPho: maTinhThanh, ...objQuan } = await app.model.dmQuanHuyen.get({
                    statement: 'regexp_like(lower(tenQuanHuyen), :quan)',
                    parameter: { quan: '(quận|huyện|thị xã|thành phố) ' + _quan.trim() }
                }) || { maQuanHuyen: '', maTinhThanhPho: '' });
                // console.log({ maQuanHuyen });
                if (maQuanHuyen) {
                    ({ maPhuongXa } = await app.model.dmPhuongXa.get({
                        statement: 'maQuanHuyen = :maQuanHuyen and regexp_like(lower(tenPhuongXa), lower(:phuong))',
                        parameter: { maQuanHuyen: maQuanHuyen, phuong: '(phường|xã |thị trấn )' + _phuong }
                    }) || { maPhuongXa: '' })
                    if (!maPhuongXa) {
                        console.log(`Phuong ${_phuong} not found`)
                    }
                } else {
                    console.log(`Quan ${_quan} not found`)
                }
                // throw { diaChi, _phuong, _quan, soNha: soNha.join(', '), maQuanHuyen, maPhuongXa, maTinhThanh }
                return { soNha: soNha.join(', '), maQuanHuyen, maPhuongXa, maTinhThanh }
            }

            let preset = {
                loaiSinhVien: 'L1',
                tinhTrang: 11,
                maKhoa: '',
                namTuyenSinh: '2023',
                ngayNhapHoc: -1,
                bacDaoTao: 'DH',
                canEdit: 0,
                khoaSinhVien: '2023',
            };
            const parseData = (row) => {
                const getText = (column, _default = '') => {
                    const val = row.getCell(column).text?.trim().normalize()
                    return val == '' ? _default : val;
                }
                const data = {
                    mssv: getText('A'),
                    cmnd: getText('B'),
                    ho: getText('C'),
                    ten: getText('D'),
                    loaiHinhDaoTao: getText('F')?.includes('CLC') ? 'CLC' : 'CQ',
                    maNganh: mapMaNganh[getText('F')]?.maNganh || '',
                    khoa: mapMaNganh[getText('F')]?.khoa || '',
                    phuongThucTuyenSinh: mapMaPhuongThucTs[getText('I')]?.ma || '',
                    diemThi: Number(getText('K')).toFixed(2),
                    gioiTinh: getText('M').toLowerCase() == 'nữ' ? '2' : '1',
                    ngaySinh: splitDate(getText('N')),
                    khuVucTuyenSinh: 'KV' + (getText('P') == '2NT' ? '2-NT' : getText('P')),
                    doiTuongTuyenSinh: mapMaDoiTuongTs[Number(getText('Q'))]?.ma || '',
                    emailTruong: getText('R'),
                    ...preset
                }
                return data;
            }

            const result = []

            for (let i = 2; i <= dataSheet.actualRowCount; ++i) {
                try {
                    const row = dataSheet.getRow(i);
                    if (!row.getCell('A').text) break;
                    // const sv = await app.model.fwStudent.get({ mssv });
                    const data = parseData(row);

                    result.push(data);
                    rps.addRow(data);
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Done ${i}/${dataSheet.actualRowCount}`)
                } catch (error) {
                    console.log('\x1b[31m%s\x1b[0m', `Error at ${rowNum}`);
                    console.error({ rowNum, error });
                    process.exit(1);
                }
            }

            // await Promise.all(result.map(async (item) => {

            // }));

            await report.xlsx.writeFile(app.path.join(__dirname, './report/report.sinhvien230630.xlsx'));
            console.log('\nFinish running')
            process.exit(1);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
});
