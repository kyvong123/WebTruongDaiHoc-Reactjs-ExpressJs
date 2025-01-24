module.exports = app => {

    app.post('/api/tccb/staff/trinh-do-nn', app.permission.check('staff:write'), (req, res) => {
        let shcc = app.model.tchcCanBo.validShcc(req, req.body.shcc);
        shcc ? app.model.trinhDoNgoaiNgu.create(req.body.data, (error, item) => res.send({ error, item })) : res.send({ error: 'No permission' });
    });

    app.put('/api/tccb/staff/trinh-do-nn', app.permission.check('staff:write'), (req, res) => {
        let shcc = app.model.tchcCanBo.validShcc(req, req.body.shcc);
        shcc ? app.model.trinhDoNgoaiNgu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })) : res.send({ error: 'No permission' });
    });

    app.delete('/api/tccb/staff/trinh-do-nn', app.permission.check('staff:write'), (req, res) => {
        let shcc = app.model.tchcCanBo.validShcc(req, req.body.shcc);
        shcc ? app.model.trinhDoNgoaiNgu.delete({ id: req.body.id }, (error) => res.send(error)) : res.send({ error: 'No permission' });
    });

};