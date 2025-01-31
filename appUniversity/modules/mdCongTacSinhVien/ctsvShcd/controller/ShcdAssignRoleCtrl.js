module.exports = app => {
    // API =================================================================================================================================

    app.get('/api/ctsv/shcd/assign-role', app.permission.check('ctsvShcd:read'), async (req, res) => {
        try {
            const id = req.query.id;

            const { rows: items } = await app.model.svShcdAssignRole.getData(null, null, id);

            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/ctsv/shcd/assign-role', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { data } = req.body;
            const { shcdId, nguoiDuocGan, ngayBatDau, ngayKetThuc } = data,
                nguoiGan = req.session.user.shcc;
            const [checkRoleExist, checkStudentExist] = await Promise.all([
                app.model.fwAssignRole.get({ nguoiDuocGan, tenRole: 'student:shcd-manage' }),
                app.model.svShcdAssignRole.get({ shcdId, nguoiDuocGan })
            ]);
            let item;
            if (!checkStudentExist) {
                item = await app.model.svShcdAssignRole.create({ nguoiDuocGan, nguoiGan, ngayBatDau, ngayKetThuc, shcdId });
            } else throw 'Sinh viên đã có quyền cho buổi shcd này rồi';
            if (!checkRoleExist) {
                await app.model.fwAssignRole.create({ nguoiDuocGan, nguoiGan, tenRole: 'student:shcd-manage', nhomRole: 'ctsvShcd', ngayBatDau, ngayKetThuc });
            } else {
                let shcdRoleList = await app.model.svShcdAssignRole.getAll({ nguoiDuocGan }, 'ngayBatDau,ngayKetThuc');
                let ngayBatDau = Math.min(...shcdRoleList.map(item => item.ngayBatDau)),
                    ngayKetThuc = Math.max(...shcdRoleList.map(item => item.ngayKetThuc));
                await app.model.fwAssignRole.update({ nguoiDuocGan, tenRole: 'student:shcd-manage' }, { ngayBatDau, ngayKetThuc });
            }

            // const item = await app.model.svShcdAssignRole.updateDanhSach({ nguoiGan: req.session.user.shcc, ...data });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.put('/api/ctsv/shcd/assign-role', app.permission.check('ctsvShcd:write'), async (req, res) => {
        try {
            const { shcdId, nguoiDuocGan, changes } = req.body,
                nguoiGan = req.session.user.shcc;
            // const fwAssignRole = await app.model.fwAssignRole.get({ nguoiDuocGan, tenRole: 'student:shcd-manage' });
            let item;
            item = await app.model.svShcdAssignRole.update({ nguoiDuocGan, shcdId }, changes);

            const checkRoleExist = app.model.fwAssignRole.get({ nguoiDuocGan, tenRole: 'student:shcd-manage' });
            if (!checkRoleExist) {
                await app.model.fwAssignRole.create({ nguoiDuocGan, nguoiGan, tenRole: 'student:shcd-manage', nhomRole: 'ctsvShcd', ngayBatDau: changes.ngayBatDau, ngayKetThuc: changes.ngayKetThuc });
            } else {
                let shcdRoleList = await app.model.svShcdAssignRole.getAll({ nguoiDuocGan }, 'ngayBatDau,ngayKetThuc');
                let ngayBatDau = Math.min(...shcdRoleList.map(item => item.ngayBatDau)),
                    ngayKetThuc = Math.max(...shcdRoleList.map(item => item.ngayKetThuc));
                await app.model.fwAssignRole.update({ nguoiDuocGan, tenRole: 'student:shcd-manage' }, { ngayBatDau, ngayKetThuc });
            }
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.delete('/api/ctsv/shcd/assign-role', app.permission.check('ctsvShcd:delete'), async (req, res) => {
        try {
            const { data } = req.body;
            const { nguoiDuocGan, shcdId } = data;
            await app.model.svShcdAssignRole.delete({ shcdId, nguoiDuocGan });

            const checkRoleExist = app.model.fwAssignRole.get({ nguoiDuocGan, tenRole: 'student:shcd-manage' });
            if (checkRoleExist) {
                let shcdRoleList = await app.model.svShcdAssignRole.getAll({ nguoiDuocGan }, 'ngayBatDau,ngayKetThuc');
                if (shcdRoleList.length) {
                    let ngayBatDau = Math.min(...shcdRoleList.map(item => item.ngayBatDau)),
                        ngayKetThuc = Math.max(...shcdRoleList.map(item => item.ngayKetThuc));
                    await app.model.fwAssignRole.update({ nguoiDuocGan, tenRole: 'student:shcd-manage' }, { ngayBatDau, ngayKetThuc });
                } else {
                    await app.model.fwAssignRole.delete({ nguoiDuocGan, tenRole: 'student:shcd-manage' });
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
};