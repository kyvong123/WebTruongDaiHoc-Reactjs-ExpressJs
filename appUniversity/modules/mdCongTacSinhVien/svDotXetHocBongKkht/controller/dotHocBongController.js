module.exports = (app) => {
    app.put('/api/ctsv/hoc-bong-khuyen-khich/dot-hoc-bong', app.permission.check('ctsvDotXetHocBongKkht:manage'), async (req, res) => {
        try {
            let { id, changes } = req.body;
            const item = await app.model.svDotXetHocBongKkht.update({ id }, changes);
            if (!item) throw 'Không tìm thấy đợt học bổng';
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};