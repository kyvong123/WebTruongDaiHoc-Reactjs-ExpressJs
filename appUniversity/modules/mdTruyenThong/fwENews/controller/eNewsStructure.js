module.exports = app => {
    app.post('/api/tt/e-news/structure', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const data = req.body.data;
            if (data.eNewsId) {
                const lastItem = await app.model.fwENewsStructure.get({ eNewsId: data.eNewsId }, '*', 'thuTu desc');

                data.thuTu = lastItem && lastItem.thuTu ? lastItem.thuTu + 1 : 1;

                const item = await app.model.fwENewsStructure.create(data);

                res.send({ item });
            } else {
                throw 'Tạo thẻ bị lỗi!';
            }
        } catch (error) {
            console.error('POST /api/tt/e-news/structure', error);
            res.send({ error });
        }
    });

    app.put('/api/tt/e-news/structure', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const item = await app.model.fwENewsStructure.update({ id }, changes);

            res.send({ item });
        } catch (error) {
            console.error('PUT /api/tt/e-news/structure', error);
            res.send({ error });
        }
    });

    app.put('/api/tt/e-news/structure/swap', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const data = req.body;
            let swapItem = await app.model.fwENewsStructure.get({ id: data.id }), targetItem = null;

            data.isMoveUp = data.isMoveUp == true || data.isMoveUp == 'true';

            if (swapItem) {
                targetItem = await app.model.fwENewsStructure.get({
                    statement: `eNewsId = :eNewsId AND thuTu ${data.isMoveUp ? '<' : '>'} :thuTu`,
                    parameter: { eNewsId: swapItem.eNewsId, thuTu: swapItem.thuTu }
                }, '*', `thuTu ${data.isMoveUp ? 'desc' : 'asc'}`);

                if (targetItem) {
                    const tempThuThu = swapItem.thuTu;

                    swapItem = await app.model.fwENewsStructure.update({ id: swapItem.id }, { thuTu: targetItem.thuTu });
                    targetItem = await app.model.fwENewsStructure.update({ id: targetItem.id }, { thuTu: tempThuThu });
                }
            }

            res.send({ swapItem, targetItem });
        } catch (error) {
            console.error('PUT /api/tt/e-news/structure/swap', error);
            res.send({ error });
        }
    });

    app.delete('/api/tt/e-news/structure', app.permission.check('fwENews:write'), async (req, res) => {
        try {
            const items = await app.model.fwENewsItem.getAll({ structureId: req.body.id });

            items.forEach(item => item.image && app.fs.deleteImage(item.image));

            await app.model.fwENewsItem.delete({ structureId: req.body.id });
            await app.model.fwENewsStructure.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            console.error('DELETE /api/tt/e-news/structure', error);
            res.send({ error });
        }
    });
};