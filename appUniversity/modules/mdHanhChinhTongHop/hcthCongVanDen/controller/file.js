module.exports = app => {

    app.get('/api/hcth/van-ban-den/file/history/:id', app.permission.orCheck('staff:login', 'hcthCongVanDen:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const { rows: items } = await app.model.hcthCongVanDen.getFileHistory(id, 'DEN');
            res.send({ items });
        } catch (error) {
            console.error('/api/hcth/van-ban-den/file/history/:id', error);
            res.send({ error });
        }
    });

    app.get('/api/hcth/van-ban-den/file/list/:ma', app.permission.orCheck('staff:login', 'hcthCongVanDen:write'), async (req, res) => {
        try {
            const ma = req.params.ma;
            const items = await app.model.hcthFile.getAll({
                statement: 'ma =:ma and loai = :loai and nextVersionId is Null',
                parameter: { ma: ma, loai: 'DEN' }
            }, '*', 'thoiGian');
            res.send({ items });
        } catch (error) {
            console.error('/api/hcth/van-ban-den/file/history/:id', error);
            res.send({ error });
        }
    });

    app.put('/api/hcth/email-task/resend-multiple', app.permission.check('emailTask:manage'), async (req, res) => {
        try {
            const { list } = req.body;
            if (!list.length)
                throw 'Danh sách email rỗng';
            const items = await app.model.fwEmailTask.getAll({ statement: 'id in (:list)', parameter: { list } });
            await app.model.fwEmailTask.update({ statement: 'id in (:list)', parameter: { list: items.map(i => i.id) } }, { state: 'waiting' });
            for (const item of items) {
                app.messageQueue.send('emailService:send', { id: item.id });
            }
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};