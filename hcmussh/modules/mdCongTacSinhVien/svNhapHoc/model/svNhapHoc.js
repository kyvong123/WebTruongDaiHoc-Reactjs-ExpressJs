// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svNhapHoc.foo = () => { };
    app.model.svNhapHoc.daThanhToanHocPhi = async (mssv) => {
        try {
            let checkHocPhi = await app.model.tcHocPhi.get({mssv});
            if (!checkHocPhi) return -1;
            
            let hocPhi = await app.model.tcHocPhi.get({
                statement: 'congNo <= 0 AND mssv = :mssv',
                parameter: { mssv }
            });
            let hoanDong = await app.model.tcHoanDongHocPhi.get({
                statement: 'mssv = :mssv AND thoi_han_thanh_toan >= :dateNow AND da_thanh_toan >= so_tien_thu_truoc AND xac_nhan = 1',
                parameter: { mssv, dateNow: Date.now() }
            });

            if (hocPhi?.hocPhi) return 1;
            if (hoanDong) return 2;
            return 0;
        }
        catch (error) {
            console.error(error);
        }
    };
};