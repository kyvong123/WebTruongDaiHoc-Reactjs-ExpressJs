module.exports = app => {

    app.delete('/api/sdh/ts/cbhd', app.permission.orCheck('sdhDsTs:delete', 'sdhTsUngVien:login', 'sdhTsThiSinh:login'), async (req, res) => {
        try {
            const { idCbhd } = req.body;
            await Promise.all([
                app.model.sdhTsCanBoHuongDan.delete({ id: idCbhd }),
                app.model.sdhTsCongTrinhCbhd.delete({ idCbhd })
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};