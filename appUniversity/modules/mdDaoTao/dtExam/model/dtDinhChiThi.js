// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.dtDinhChiThi.foo = async () => { };

    app.model.dtDinhChiThi.getInfoDinhChi = async (maHocPhan, loaiDiem) => {
        const config = await app.model.dtDiemAll.getInfo(maHocPhan);

        let { configDefault, tpHocPhan, tpMonHoc } = config.rows[0],
            tpDiem = tpHocPhan || tpMonHoc || configDefault;
        tpDiem = tpDiem ? app.utils.parse(tpDiem) : [];

        return tpDiem.find(tp => tp.thanhPhan == loaiDiem);
    };
};