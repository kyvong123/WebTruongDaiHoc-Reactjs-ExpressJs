module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7054: {
                title: 'Quản lý scan điểm', link: '/user/dao-tao/grade-manage/import', pin: true, backgroundColor: '#FFA96A', color: '#000', icon: 'fa-key',
                parentKey: 7047
            },
        }
    };

    app.permission.add(
        { name: 'dtDiemScan:manage', menu },
    );

    const checkTimeLeftSession = (req, res, next) => {
        let { idSemester } = req.query,
            { accessGradeData } = req.session.user;
        if (accessGradeData && accessGradeData[idSemester] && accessGradeData[idSemester] < Date.now()) {
            delete req.session.user.accessGradeData;
            res.send({ error: { backPath: '/user/dao-tao/diem', reason: 'end session' } });
        }
        else next && next();
    };

    app.get('/api/dt/diem/check-session', checkTimeLeftSession);
    app.get('/user/dao-tao/grade-manage/import', app.permission.check('dtDiemScan:manage'), app.templates.admin);
    app.get('/user/dao-tao/grade-manage/import/scan', app.permission.check('dtDiemScan:manage'), app.templates.admin);

    // API --------------------------------------------------------------------------------------------
    app.get('/api/dt/diem/folder-scan', app.permission.check('dtDiemFolderScan:read'), checkTimeLeftSession, async (req, res) => {
        try {
            let { idSemester } = req.query, condition = { idSemester }, { user } = req.session;
            if (user && user.permissions && !user.permissions.includes('developer:login')) {
                condition.modifier = user.email;
            }
            const items = await app.model.dtDiemFolderScan.getAll(condition, '*', 'lastModified DESC');
            res.send({ items });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/folder-scan/page-file', app.permission.check('dtDiemFolderScan:read'), checkTimeLeftSession, async (req, res) => {
        try {
            let { filter } = req.query;
            let items = await app.model.dtDiemScanFile.searchPage(JSON.stringify({ ...filter, sortMode: 'ASC', sortKey: 'maHocPhan' }));
            let resultScanFiles = [], gradeResult = [], { idFolder, idSemester } = filter;
            let { rows } = items;
            if (rows.length) {
                resultScanFiles = await app.model.dtDiemScanResult.getAll({
                    statement: 'idFolder = :idFolder AND idSemester = :idSemester AND sheetCode in (:listSheetCode)',
                    parameter: { idFolder, idSemester, listSheetCode: rows.map(item => item.id) }
                }, '*', 'requestTime');
                if (resultScanFiles.length) {
                    gradeResult = await app.model.dtDiemScanGradeResult.getAll({
                        statement: 'idFolder = :idFolder AND idSemester = :idSemester AND idFile IN (:listSheetCode) AND idResult IN (:listIdResult)',
                        parameter: { idFolder, idSemester, listSheetCode: rows.map(item => item.id), listIdResult: resultScanFiles.map(item => item.id) }
                    });
                }
            }
            rows = rows.map(item => {
                item.resultScan = resultScanFiles
                    .filter(rsf => rsf.idSemester == item.idSemester && rsf.idFolder == item.idFolder && rsf.sheetCode == item.id).map(rsf => {
                        rsf.gradeResult = gradeResult.filter(gr => gr.idSemester == item.idSemester && gr.idFolder == item.idFolder && gr.idFile == item.id && gr.idResult == rsf.id);
                    });
                let tpDiem = item.tpHocPhan || item.tpMonHoc || item.configDefault;
                tpDiem = tpDiem ? JSON.parse(tpDiem) : [];
                let { phanTram: phanTramDiem, loaiLamTron } = tpDiem.find(tp => tp.thanhPhan == item.kyThi) || { phanTram: '0', loaiLamTron: '0.5' };
                return { ...item, phanTramDiem, loaiLamTron };
            });
            res.send({ items: rows });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/folder-scan/grade-result', app.permission.check('dtDiemFolderScan:write'), checkTimeLeftSession, async (req, res) => {
        try {
            let { idSemester, idFolder } = req.query.filter;
            const [items, scanResult] = await Promise.all([
                app.model.dtDiemScanResult.searchPage(JSON.stringify({ idSemester, idFolder })),
                app.model.dtDiemScanResult.getAll({ idSemester, idFolder }, '*', 'fileName')
            ]);
            res.send({ items: items.rows, scanResult });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem/folder-scan/result-image', app.permission.orCheck('student:login', 'dtDiemFolderScan:write', 'staff:login'), checkTimeLeftSession, async (req, res) => {
        try {
            const { idSemester, idFolder, idResult, filename } = req.query;
            let path = app.path.join(resultScannedFolder, idSemester.toString(), idFolder.toString(), `${idResult}.jpg`);
            if (app.fs.existsSync(path)) {
                res.sendFile(path);
            } else {
                path = app.path.join(jpgUploadedFolder, idSemester.toString(), idFolder.toString(), filename);
                if (app.fs.existsSync(path)) {
                    res.sendFile(path);
                } else {
                    res.end();
                }
            }

        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dt/diem/folder-scan', app.permission.check('dtDiemFolderScan:write'), async (req, res) => {
        try {
            let { data, idSemester } = req.body,
                { email: modifier } = req.session.user,
                lastModified = Date.now();
            let { folderName } = data;
            folderName = folderName.trim();
            const checkFolderName = await app.model.dtDiemFolderScan.get({ folderName, idSemester, modifier });
            if (checkFolderName) throw 'Vui lòng nhập tên gói khác!';
            if (data.isPrivate && data.pass) {
                data.pass = app.model.dtDiem.hashPassword(data.pass);
            }
            const item = await app.model.dtDiemFolderScan.create({ ...data, modifier, lastModified, idSemester });
            res.send({ item });
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    });

    app.post('/api/dt/diem-scan/check-status', app.permission.check('dtDiemScan:manage'), async (req, res) => {
        try {
            let { listMaHocPhan } = req.body;
            let checkData = await Promise.all(listMaHocPhan.map(async ({ maHocPhan, idSemester }) => app.model.dtDiemScanFile.getAll({ maHocPhan, idSemester }, 'id,maHocPhan')));
            res.send({ items: checkData.filter(item => item.length).map(item => ({ [item[0].maHocPhan]: item.length })) });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-scan/download-origin', app.permission.check('dtDiemScan:manage'), async (req, res) => {
        try {
            let { filename, idSemester, idFolder } = req.query;
            const path = app.path.join(jpgUploadedFolder, idSemester.toString(), idFolder.toString(), filename);
            app.fs.existsSync(path) ? res.sendFile(path) : res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dt/diem-scan/download-scan-result', app.permission.check('dtDiemScan:manage'), async (req, res) => {
        try {
            let { idSemester, idFolder, id } = req.query;
            const path = app.path.join(resultScannedFolder, idSemester.toString(), idFolder.toString(), `${id}.jpg`);
            app.fs.existsSync(path) ? res.sendFile(path) : res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    //Set up folder ----------------------------------------------
    const folderGradeScan = app.path.join(app.assetPath, 'grade-scan'),
        zipToPrintFolder = app.path.join(folderGradeScan, 'print'),
        jpgUploadedFolder = app.path.join(folderGradeScan, 'jpg-uploaded'),
        resultScannedFolder = app.path.join(folderGradeScan, 'result-scan'),
        pdfToScanFolder = app.path.join(folderGradeScan, 'pdf-to-scan');
    app.fs.createFolder(folderGradeScan);
    app.fs.createFolder(zipToPrintFolder);
    app.fs.createFolder(jpgUploadedFolder);
    app.fs.createFolder(resultScannedFolder);
    app.fs.createFolder(pdfToScanFolder);

};
