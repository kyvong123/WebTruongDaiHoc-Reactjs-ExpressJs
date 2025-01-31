let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    publicPath: path.join(__dirname, package.path.public),
    assetPath: path.join(__dirname, ''),
    modulesPath: path.join(__dirname, '../../' + package.path.modules),
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package.db);

// Init =======================================================================
app.loadModules(false);

const run = () => {
    // app.model.qtHopDongVienChuc.getAll({}, (error, result) => {
    //     if (result) {
    //         result.forEach(item => {
    //             app.model.tchcCanBo.get({shcc: item.nguoiDuocThue}, (er, canBo) => {
    //                 if (canBo) {
    //                     if (canBo.hopDongCanBo != 'LĐ') 
    //                     app.model.tchcCanBo.update({shcc: item.nguoiDuocThue}, {hopDongCanBo: 'VC'}, (err, output) => {
    //                         console.log(output);
    //                     });
    //                 }
    //             })
    //         });
    //     }
    // });
    app.model.tchcCanBo.getAll({}, (error, result) => {
        if (result) {
            result.forEach(item => {
                if (item.hopDongCanBo != 'LĐ') {
                    app.model.qtHopDongVienChuc.getAll({ nguoiDuocThue: item.shcc }, (error, output) => {
                        if (output.length > 0) {
                            let max = 0;
                            let i = 0;
                            output.forEach(item => {
                                if (item.ngayKetThucHopDong > max) { max = item.ngayKetThucHopDong; i++; }
                            });
                            if (max != 0) {
                                app.model.tchcCanBo.update({ shcc: item.shcc }, { hopDongCanBoNgay: max }, (er, out) => {
                                    console.log(out);
                                });
                            }
                        }
                    });
                }

            });
        }
    });
}

app.readyHooks.add('Run tool.hopDong.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.tchcCanBo && app.model.dmDienHopDong && app.model.qtHopDongVienChuc,
    run,
});