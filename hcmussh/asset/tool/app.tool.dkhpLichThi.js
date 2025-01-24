let package = require('../../package.json');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'), path,
    publicPath: path.join(__dirname, '../../', 'public'),
    assetPath: path.join(__dirname, '../'),
    modulesPath: path.join(__dirname, '../../', 'modules'),
    database: {},
    model: {},
    worker: { reset: () => { } }
};

if (!app.isDebug) package = Object.assign({}, package, require('../config.json'));
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/hooks')(app);
require('../../config/lib/utils')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);

app.loadModules(false);

app.readyHooks.add('Run tool.dkhpLichThi.js', {
    ready: () => app.database.oracle.connected && app.model,
    run: async () => {
        console.log('Start update dkhp data');
        let listDKHP = await app.model.dtDangKyHocPhan.getAll({ namHoc: '2022 - 2023', hocKy: 2 });
        for (let row of listDKHP) {
            let { mssv, maHocPhan } = row;
            let listPrint = await app.model.dtDiemScanFile.getAll({ maHocPhan }, 'id, stuIdIndex', 'id');
            for (let print of listPrint) {
                let { stuIdIndex } = print;
                if (stuIdIndex && Object.values(JSON.parse(stuIdIndex)).includes(mssv)) {
                    await app.model.dtDangKyHocPhan.update({ mssv, maHocPhan }, { idDiemScanFile: print.id });
                }
            }
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Update id scan file for ${mssv} - ${maHocPhan} done`);
        }
        console.log('Update dkhp data done!');
    }
});