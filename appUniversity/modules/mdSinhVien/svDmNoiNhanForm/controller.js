module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sv/dm-noi-nhan-form/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        app.model.svDmNoiNhanForm.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });
};