module.exports = app => {

    const validateLich = (data, events) => {
        events.forEach(item => {
            if (data.phong != '#Online' && data.phong == item.phong) throw 'Sự kiện bị trùng phòng!';
            if (item.giangVien == data.giangVien) throw 'Giảng viên bị trùng lịch!';
        });
    };

    app.post('/api/ctsv/shcd/event', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const { rows: events } = await app.model.svShcdLich.searchAll(app.utils.stringify({
                timeStart: data.timeStart, timeEnd: data.timeEnd,
            }));
            validateLich(data, events);
            const item = await app.model.svShcdLich.create(data);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/event/list-nganh', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            const { timeStart, timeEnd, } = req.query;
            const { rows: items } = await app.model.svShcdLich.getListNganh(timeStart, timeEnd);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/event/list-nganh', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            const { timeStart, timeEnd, } = req.query;
            const { rows: items } = await app.model.svShcdLich.getListNganh(timeStart, timeEnd);
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/shcd/event', app.permission.orCheck('ctsvShcd:write', 'student:shcd-manage'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const { rows: events } = await app.model.svShcdLich.searchAll(app.utils.stringify({
                timeStart: changes.timeStart, timeEnd: changes.timeEnd,
            }));
            validateLich(changes, events.filter(item => item.id != id));
            const item = await app.model.svShcdLich.update({ id }, changes);
            if (Number(changes.isSubmit)) {
                await Promise.all([
                    app.model.svShcdLichNganh.delete({ lichId: id }),
                    app.model.svShcdLichSinhVien.delete({ lichId: id }),
                    Number(changes.isOnline) && app.model.svShcdMeetLink.delete({ lichId: id })
                ]);
                await Promise.all(
                    (changes.listNganh || []).map(maNganh => app.model.svShcdLichNganh.create({ lichId: id, maNganh })),
                    (changes.listSinhVien || []).map(student => app.model.svShcdLichSinhVien.create({ lichId: id, ...student })),
                    (changes.listLink || []).map(({ link, sucChua }) => app.model.svShcdMeetLink.create({ lichId: id, link, sucChua }))
                );
            }
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/shcd/event/nganh', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { lichId, maNganh, changes } = req.body;
            const cur = await app.model.svShcdLichNganh.get({ lichId, maNganh });
            let item;
            if (cur) {
                item = await app.model.svShcdLichNganh.update({ lichId, maNganh }, changes);
            } else {
                item = await app.model.svShcdLichNganh.create({ lichId, maNganh, ...changes });
            }
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/shcd/event', app.permission.check('ctsvShcd:delete'), async (req, res) => {
        try {
            const { id } = req.body;
            await app.model.svShcdLich.deleteCascade({ id });
            // await Promise.all([
            //     app.model.svShcdLich.delete({ id }),
            //     app.model.svShcdLichNganh.delete({ lichId: id }),
            //     app.model.svShcdMeetLink.delete({ lichId: id })
            // ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/event/meet-link', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            const { lichId } = req.query;
            const items = await app.model.svShcdMeetLink.getAll({ lichId });
            const mapLinkSinhVien = await app.model.svShcdLichSinhVien.getAll({ lichId });
            res.send({ items, mapLinkSinhVien });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/event/list-sinh-vien', app.permission.orCheck('ctsvShcd:read', 'student:shcd-manage'), async (req, res) => {
        try {
            const { listNganh, heDaoTao, khoaSinhVien } = req.query;
            if (listNganh) {
                const { rows: items } = await app.model.fwStudent.searchAll('', app.utils.stringify({
                    tinhTrang: 1, listKhoaSinhVien: khoaSinhVien,
                    listHeDaoTao: heDaoTao,
                    listNganh: listNganh?.toString()
                }));
                res.send({ items });
            } else {
                res.send({ items: [] });
            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.get('/api/ctsv/shcd/event/qr-code', app.permission.orCheck('ctsvShcd:read', 'student:shcd-manage'), async (req, res) => {
        try {
            const { id } = req.query;
            const { qrTimeGenerate, qrValidTime } = await app.model.svShcdLich.get({ id });
            if (new Date().getTime() > qrValidTime) {
                await app.model.svShcdLich.update({ id }, { qrTimeGenerate: null, qrValidTime: null });
                res.send({ item: { qrTimeGenerate: null, qrValidTime: null } });
            }
            else res.send({ item: { qrTimeGenerate, qrValidTime } });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};