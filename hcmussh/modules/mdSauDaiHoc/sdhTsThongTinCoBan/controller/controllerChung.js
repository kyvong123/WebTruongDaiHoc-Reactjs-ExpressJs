module.exports = app => {
    app.get('/api/sdh/ts/download-hsdk', async (req, res) => {
        try {
            let { filter } = req.query;
            filter = app.utils.parse(filter);
            const { maPhanHe } = filter ? filter : { maPhanHe: '' };
            const item = await app.model.sdhTsHsdk.get({ category: maPhanHe, active: 1 });
            if (item) {
                const fileName = item && item.path,
                    path = app.path.join(app.assetPath, 'sdh', fileName);
                if (app.fs.existsSync(path) && fileName) {
                    res.download(path, fileName);
                } else {
                    res.sendStatus(404);
                }
            } else {
                res.sendStatus(404);

            }
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/ho-so/check-phan-he', async (req, res) => {
        try {
            const { dataCoBan, phanHeTarget } = req.query;
            const { email, idDot } = dataCoBan;
            const result = await app.model.sdhTsThongTinCoBan.get({ email, idDot, phanHe: phanHeTarget });
            res.send({ result: result && result.id ? true : false });
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};