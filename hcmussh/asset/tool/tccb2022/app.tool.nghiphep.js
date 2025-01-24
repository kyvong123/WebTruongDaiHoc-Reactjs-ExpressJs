let package = require('../../../package.json');
const path = require('path');
const e = require('cors');
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
app.readyHooks.add('Run tool.nghiphep.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        const xoaDau = (str) => {
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
            str = str.replace(/đ/g, 'd');
            str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
            str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
            str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
            str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
            str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
            str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
            str = str.replace(/Đ/g, 'D');
            return str;
        };
        let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.nghiphep.xlsx'));
        if (workbook) {
            const worksheet = workbook.getWorksheet(1);
            if (worksheet) {
                let index = 3;
                await app.model.qtNghiPhep.delete();
                while (true) {
                    const getVal = (column, type = 'text', Default) => {
                        Default = Default ? Default : '';
                        let val = worksheet.getCell(column + index).value;
                        return val === '' ? Default : (val == null ? '' : val);
                    }
                    if (worksheet.getCell('A' + index).value == null) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        console.log('Running done!');
                        process.exit();
                    } else {
                        const data = {
                            ho: getVal('B').trim(),
                            ten: getVal('C').trim(),
                            tenDonVi: getVal('D'),
                            tenLyDo: getVal('E'),
                            noiDen: getVal('F'),
                            ngayBatDau: getVal('G'),
                            ngayKetThuc: getVal('H'),
                            lyDoKhac: getVal('E'),
                            lyDo: 99,
                            batDauType: 'dd/mm/yyyy',
                            ketThucType: 'dd/mm/yyyy',
                            soNgayPhep: getVal('I'),
                            ngayPhepThamNien: getVal('J'),
                            shcc: getVal('K'),
                            ngayDiDuong: 0,
                        }
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Reading line ${index}`);
                        // console.log(data);
                        const checkCanBo = await app.model.tchcCanBo.getAll({
                            statement: 'lower(ho) LIKE :ho AND lower(ten) LIKE :ten',
                            parameter: {
                                ho: data.ho.trim().toLowerCase(),
                                ten: data.ten.trim().toLowerCase(),
                            }
                        }, 'shcc,ho,ten,maDonVi');
                        if (!checkCanBo || !checkCanBo.length) {
                            console.error(`, ${data.ho} ${data.ten} doesnt exists in database`);
                        } else {
                            // if (checkCanBo.length > 1) console.log(data.ho, data.ten, data.shcc, checkCanBo);
                            for (const canBo of checkCanBo) {
                                let maDonVi = canBo.maDonVi || -1;
                                const checkDonVi = await app.model.dmDonVi.get({ ma: maDonVi });
                                if (checkDonVi && checkDonVi.ten.toLowerCase().replace('khoa', '').replace('bộ môn', '').replace('-', '').replace('và', '') == data.tenDonVi.toLowerCase().replace('khoa', '').replace('bộ môn', '').replace('t&qhdn', '').replace('-', '').replace('và', '').trim()) {
                                    data.shcc = data.shcc || canBo.shcc;
                                    data.batDau = new Date(data.ngayBatDau).getTime();
                                    if (!data.ngayKetThuc) {
                                        data.ketThuc = data.batDau + 24 * 3600 * 1000;
                                    }
                                    else data.ketThuc = new Date(data.ngayKetThuc).getTime();
                                    if (data.shcc) {
                                        await app.model.qtNghiPhep.create(data);
                                    }
                                }
                            }
                        }
                        index++
                    }
                }
            } else {
                console.log('Error: worksheet not found');
                process.exit(1);
            }
        } else {
            console.log('Error: workbook not found');
            process.exit(1);
        }
    }
});
