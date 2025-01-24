const { rejects } = require('assert');
let package = require('../../../package.json');
const path = require('path');
// const file = require('modules/mdHanhChinhTongHop/hcthCongVanDen/controller/file');
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

const yearMilli = 31556926000;


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
app.readyHooks.add('Run tool.importLoaiDangKy.js', {
    ready: () => (app.database.oracle.connected
        && app.model
        && app.model.svDsMienGiam
        && app.model.svManageMienGiam
        && app.model.dmSvDoiTuongMienGiam
        && app.model.dtSemester),
    run: async () => {
        try {
            let workbook = await app.excel.readFile(app.path.join(__dirname, './data/data.miengiam.xlsx'));
            if (!workbook) throw 'Error: workbook not found';
            const dataSheet = workbook.getWorksheet('main');
            const [, , ...listMssv] = dataSheet.getColumn(1).values.map(item => item.toString());
            // Fetch all needed list
            const listDtmg = await app.model.dmSvDoiTuongMienGiam.getAll();
            const listSemester = await app.model.dtSemester.getAll();
            const listSv = await app.model.fwStudent.getAll({ statement: 'mssv in (:listMssv)', parameter: { listMssv } }, 'mssv,ngayNhapHoc, lop');
            const listLop = await app.model.dtLop.getAll({ statement: 'maLop in (:listLop)', parameter: { listLop: listSv.map(item => item.lop).filter(item => item != null) } }, 'maLop, nienKhoa');
            // Build object
            const objDtmg = {}, objSemester = {}, objSv = {}, objLop = {};
            listDtmg.forEach(item => { item.maDoiTuong && (objDtmg[item.maDoiTuong] = item); });
            listSemester.forEach(item => { objSemester[item.ma] = item });
            listSv.forEach(item => objSv[item.mssv] = item);
            listLop.forEach(item => objLop[item.maLop] = item);
            //Helper function
            const calcEndTime = (semester, mssv, tgmg) => {
                const startTime = semester.beginTime;
                let endTime = null;
                if (tgmg == 'NTC') {
                    endTime = yearMilli * Math.floor((startTime / yearMilli) + 1) - 25200000;
                } else if (tgmg == 'TK') {
                    const sv = objSv[mssv];
                    const [sY, eY] = objLop[sv.lop]?.nienKhoa?.split('-') || [0, 4];
                    endTime = sv.ngayNhapHoc + (eY - sY) * yearMilli;
                }
                return endTime;
            }

            // Build So QD mapper
            const dataSqd = workbook.getWorksheet('So QD'),
                objSqd = {
                    '868': 165,
                    '866': 166,
                    '867': 167,
                    '1950': 168,
                    '1951': 169,
                    '1952': 170,
                    '1970': 171,
                    '1971': 172,
                };

            // await new Promise((resolve, rejects) => {
            //     try {
            //         dataSqd.eachRow(async (row, index) => {
            //             const [, scv, id, yyyy, dd, mm, namHoc, hocKy] = row.values,
            //                 sqd = scv.split(/\s*\//)[0];
            //             const item = await app.model.svManageMienGiam.create({
            //                 soQuyetDinh: id,
            //                 staffSign: '001.0068',
            //                 staffSignPosition: 'Hiệu trưởng',
            //                 formType: 'QDMHP',
            //                 staffHandle: 'vuha@hcmussh.edu.vn',
            //                 ngayKy: new Date(yyyy, mm - 1, dd).setHours(0, 0, 0)
            //             });
            //             objSqd[sqd] = item.id;
            //             if (index == dataSqd.rowCount) resolve();
            //         })
            //     } catch (error) {
            //         console.log(error);
            //         process.exit(1);
            //     }
            // })

            console.log('Finish SQD Mapper', { objSqd });

            await new Promise((resolve, reject) => {
                try {
                    dataSheet.eachRow(async (row, index) => {
                        if (index == 1) return;
                        const [, mssv, maDt, namHoc, hocKy, scv] = row.values;
                        const semester = objSemester[namHoc.substring(2, 4) + hocKy.toString()];
                        const data = {
                            mssv, namHoc, hocKy,
                            loaiMienGiam: objDtmg[maDt].ma,
                            timeStart: semester.beginTime,
                            timeEnd: calcEndTime(semester, mssv, objDtmg[maDt].thoiGian),
                            qdId: objSqd[scv.split(/\s*\//)[0]]
                        };

                        await app.model.svDsMienGiam.create(data);

                        if (index == dataSheet.rowCount) resolve();
                    })
                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            })

            // await app.fs.writeFileSync('./data/DataMapper.json', app.utils.stringify(dataMapper));
            console.log('Finish running')
            process.exit(1);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
});
