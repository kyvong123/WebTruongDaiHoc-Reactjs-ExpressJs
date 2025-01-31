module.exports = app => {
    const beautify = require('json-beautify');
    app.post('/api/dt/dang-ky-hoc-phan', app.permission.check('dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let { list, filter } = req.body, user = req.session.user,
                { namHoc, hocKy, ghiChu } = filter,
                listCheck = [];

            for (let [index, item] of list.entries()) {
                let data = {
                    mssv: item.mssv, maHocPhan: item.maHocPhan, maMonHoc: item.maMonHoc,
                    modifier: user.email, timeModified: Date.now(),
                    tinhPhi: 0, namHoc, hocKy,
                    maLoaiDky: item.maLoaiDKy, loaiMonHoc: item.loaiMonHoc,
                };
                if (item.tinhPhi == 'true') data.tinhPhi = 1;
                else data.tinhPhi = 0;

                await app.model.dtDangKyHocPhan.create(data);
                await app.model.dtLichSuDkhp.create({
                    mssv: item.mssv, maHocPhan: item.maHocPhan,
                    tenMonHoc: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi,
                    userModified: user.email.split('@')[0], timeModified: Date.now(),
                    thaoTac: 'A', namHoc, hocKy, ghiChu: ghiChu || item.note || '',
                });
                await app.model.dtDangKyHocPhan.notify({ maHocPhan: item.maHocPhan, mssv: item.mssv, thaoTac: 'A' });

                let monHoc = await app.model.dmMonHoc.get({ ma: item.maMonHoc });
                let check = {
                    mssv: item.mssv, maHocPhan: item.maHocPhan, maMonHoc: item.maMonHoc,
                    tenMonHoc: monHoc?.ten,
                    tinChi: item.tinChi, soTiet: monHoc?.tongTiet,
                    namHoc, hocKy, status: 'I',
                    user: user.email, loaiDangKy: item.maLoaiDKy
                };
                listCheck.push(check);
                (index % 10 == 0) && app.io.to('SaveImportDkhp').emit('save-dkhp', { requester: req.session.user.email, maHocPhan: item.maHocPhan, index, isDone: false });
                // resetApDung(item.mssv, namHoc, hocKy);
            }
            let listData = list.groupBy('maHocPhan');
            for (let key of Object.keys(listData)) {
                app.dkhpRedis.createDkhpMultiple({
                    maHocPhan: key
                });
            }
            app.model.dtDangKyHocPhan.linkSoTienDinhPhi(listCheck);

            app.io.to('SaveImportDkhp').emit('save-dkhp', { requester: req.session.user.email, isDone: true });

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    const handleListSave = async (item, user, listError) => {
        const { mssv, maHocPhan, maMonHoc, namHoc, hocKy } = item;
        // check dkhp
        if (!(await app.model.fwStudent.get({ mssv }))) {
            listError.push({ mssv, maHocPhan, ghiChu: 'Sinh viên không tồn tại trong hệ thống' });
            return { error: 1 };
        }
        else if (await app.model.dtDangKyHocPhan.get({ mssv, maMonHoc, namHoc, hocKy })) {
            listError.push({ mssv, maHocPhan, ghiChu: 'Sinh viên đã đăng ký môn học trong học kỳ' });
            return { error: 1 };
        } else if (!(await app.model.dtThoiKhoaBieu.get({ maHocPhan }))) {
            listError.push({ mssv, maHocPhan, ghiChu: 'Học phần không tồn tại' });
            return { error: 1 };
        }

        let data = {
            mssv, maHocPhan, maMonHoc, tinhPhi: 0, namHoc, hocKy,
            modifier: user.email, timeModified: Date.now(),
            maLoaiDky: item.maLoaiDKy, loaiMonHoc: item.loaiMonHoc,
        };
        if (item.tinhPhi == 'true') data.tinhPhi = 1;
        else data.tinhPhi = 0;

        await app.model.dtDangKyHocPhan.create(data);
        await app.model.dtLichSuDkhp.create({
            mssv: item.mssv, maHocPhan: item.maHocPhan,
            tenMonHoc: app.utils.parse(item.tenMonHoc, { vi: '' })?.vi,
            userModified: user.email.split('@')[0], timeModified: Date.now(),
            thaoTac: 'A', namHoc, hocKy, ghiChu: item.note || '',
        });
        await app.model.dtDangKyHocPhan.notify({ maHocPhan: item.maHocPhan, mssv: item.mssv, thaoTac: 'A' });

        let monHoc = await app.model.dmMonHoc.get({ ma: item.maMonHoc });
        let check = {
            mssv: item.mssv, maHocPhan: item.maHocPhan, maMonHoc: item.maMonHoc,
            tenMonHoc: monHoc?.ten,
            tinChi: item.tinChi, soTiet: monHoc?.tongTiet,
            namHoc, hocKy, status: 'I',
            user: user.email, loaiDangKy: item.maLoaiDKy
        };
        return { check };
    };

    const handleErrorList = async (listError, taskId, filename) => {
        if (listError.length) {
            const defaultColumns = [
                { header: 'MSSV', key: 'mssv', width: 20 },
                { header: 'Học phần', key: 'maHocPhan', width: 20 },
                { header: 'Ghi chú', key: 'ghiChu', width: 20 },
            ];

            const beautifyJsonString = beautify({ defaultColumns, rows: listError, filename }, null, 4);
            app.fs.writeFileSync(app.path.join(app.assetPath, 'executeTask', 'resultTask', `${taskId}.json`), beautifyJsonString);
            await app.model.fwExecuteTask.update({ id: taskId }, { status: 3 });
        } else {
            app.fs.deleteFile(app.path.join(app.assetPath, 'executeTask', 'resultTask', `${taskId}.json`));
            app.fs.deleteFile(app.path.join(app.assetPath, 'executeTask', 'dataTask', `${taskId}.json`));
            await app.model.fwExecuteTask.update({ id: taskId }, { status: 2 });
        }
    };

    app.post('/api/dt/dang-ky-hoc-phan/save-import', app.permission.check('dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let { list, filter } = req.body, user = req.session.user,
                { taskId } = filter,
                listCheck = [], listError = [];

            const size = list.length;
            res.end();
            for (let [index, item] of list.entries()) {
                const { error, check } = await handleListSave(item, user, listError);
                if (error) continue;
                listCheck.push(check);
                (index % Math.ceil(size / 20) == 0) && app.io.to('SaveImportDkhp').emit('save-import-dkhp', { requester: req.session.user.email, index, isDone: false });
                // resetApDung(item.mssv, namHoc, hocKy);
            }

            let listData = list.groupBy('maHocPhan');
            for (let key of Object.keys(listData)) {
                app.dkhpRedis.createDkhpMultiple({
                    maHocPhan: key
                });
            }
            app.model.dtDangKyHocPhan.linkSoTienDinhPhi(listCheck);

            // export error list
            await handleErrorList(listError, taskId, 'ErrorImportDkhp.xlsx');
            app.io.to('SaveImportDkhp').emit('save-import-dkhp', { requester: req.session.user.email, isDone: true });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/dt/dang-ky-hoc-phan/save-import-du-hoc-phi', app.permission.check('dtDangKyHocPhan:write'), async (req, res) => {
        try {
            let { list, filter } = req.body, user = req.session.user,
                { taskId } = filter,
                listCheck = [], listError = [];

            const size = list.length;

            for (let [index, item] of list.entries()) {
                const { error, check } = await handleListSave(item, user, listError);
                if (error) continue;
                listCheck.push(check);
                (index % Math.ceil(size / 20) == 0) && app.io.to('SaveImportDkhp').emit('save-import-dkhp', { requester: req.session.user.email, index, isDone: false });
                // resetApDung(item.mssv, namHoc, hocKy);
            }
            let listData = list.groupBy('maHocPhan');
            for (let key of Object.keys(listData)) {
                app.dkhpRedis.createDkhpMultiple({
                    maHocPhan: key
                });
            }
            app.model.dtDangKyHocPhan.linkSoTienDinhPhi(listCheck);

            const { items } = require(app.path.join(app.assetPath, 'executeTask', 'resultTask', `${taskId}.json`)),
                falseList = items.filter(i => i.hocPhi == '0').map(i => ({
                    mssv: i.mssv, maHocPhan: i.maHocPhan,
                    ghiChu: 'Sinh viên nợ học phí'
                }));

            listError.push(...falseList);
            // export error list
            await handleErrorList(listError, taskId, 'ErrorImportKhongDuHocPhi.xlsx');
            app.io.to('SaveImportDkhp').emit('save-import-dkhp', { requester: req.session.user.email, isDone: true });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};