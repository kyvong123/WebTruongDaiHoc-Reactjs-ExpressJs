module.exports = (app) => {

    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7612: {
                title: 'Ngoại ngữ',
                link: '/user/sau-dai-hoc/tuyen-sinh/lich-thi-nn',
                parentKey: 7544,
                icon: 'fa-language',
                backgroundColor: '#2962ff'
            }
        }
    };

    app.permission.add(
        { name: 'sdhTuyenSinhLichThi:read', menu },
        { name: 'sdhTuyenSinhLichThi:manage', menu },
        { name: 'sdhTuyenSinhLichThi:write', menu },
        { name: 'sdhTuyenSinhLichThi:delete', menu },
    );

    app.get('/user/sau-dai-hoc/tuyen-sinh/lich-thi-nn', app.permission.orCheck('sdhTuyenSinhLichThi:manage', 'sdhTuyenSinhLichThi:read', 'sdhTuyenSinhLichThi:write', 'sdhTuyenSinhLichThi:delete'), app.templates.admin);


    app.get('/api/sdh/lich-thi-nn/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:read'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const { sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            const page = await app.model.sdhTsInfoLichThi.lichThiNNSearchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/lich-thi-nn/dsts/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:read'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const { sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            const page = await app.model.sdhTsInfoLichThi.dstsNNSearchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/lich-thi-nn/dsdk/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:read'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const { sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            const page = await app.model.sdhTsDangKyNgoaiNgu.searchPage(pagenumber, pagesize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/lich-thi-nn/them-thi-sinh/page/:pageNumber/:pageSize', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            const { idLichThi, kyNang, sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            const page = await app.model.sdhTsDangKyNgoaiNgu.searchPage(pagenumber, pagesize, filter, searchTerm);
            let { pagesize: pageSize, pagenumber: pageNumber, rows: rawList } = page;
            const listChuaXep = app.clone(rawList).filter(item => {
                const listLichThi = app.utils.parse(item.arrLichThi)?.length ? app.utils.parse(item.arrLichThi) : [];
                if (!listLichThi.map(item => item.idLichThi).includes(idLichThi)) {
                    if (!listLichThi.map(item => item.kyNang).includes(kyNang)) {
                        return { ...item };
                    }
                }
            });
            const totalItem = listChuaXep.length, pageTotal = Math.ceil(totalItem / pageSize);
            pageNumber = Math.min(pageNumber, pageTotal);
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, listChuaXep } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/lich-thi-nn', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const { data } = req.body;
            //debug data
            // const data = {
            //     tenPhongThi: 'abc', gioThi: { Listening: 3811468320000, Writing: 3811468320000, Reading: 3811468320000, Speaking: 3811468320000 }, maMonThi: 'NN0001', capacity: 5, idDot: 243
            // };
            let { tenPhongThi, gioThi, maMonThi, capacity, idDot } = data;

            let [tsDangKyNN, tsDangKy, lichThiDsts, lichThi, sbdSetting] = await Promise.all([
                app.model.sdhTsDangKyNgoaiNgu.getAll({ maMonThi }),
                app.model.sdhTsThongTinCoBan.getAll({ idDot }),
                app.model.sdhTsInfoCaThiThiSinh.getAll({ maMonThi }),
                app.model.sdhTsInfoLichThi.getAll({ idDot, monThi: maMonThi }),
                app.model.sdhTsSetting.getValue('sbdSetting')

            ]);
            tsDangKyNN = tsDangKyNN?.filter(item =>
                tsDangKy?.map(item => item.id)?.includes(Number(item.idThiSinh))
            );
            let { numPostfix } = sbdSetting || { numPostfix: 4 };
            numPostfix = Number(numPostfix);
            for (const skill in gioThi) {
                if (gioThi[skill] == 'NaN') {
                    continue;
                } else {
                    const lichThiSkill = lichThi?.filter(item => item.kyNang == skill)?.map(item => item.id);//idLichThi của lịch thi nn có skill == skill
                    const lichThiSkillDsts = lichThiDsts?.filter(item => lichThiSkill?.includes(Number(item.idLichThi))).map(item => Number(item.idThiSinh)) || [];//thi sinh dc xep lt cathi có skill  
                    let tsCanXep = tsDangKyNN?.filter(item => !lichThiSkillDsts.includes(item.idThiSinh)).map(item => item.idThiSinh);
                    let infoTs = tsDangKy?.filter(item => tsCanXep?.includes(item.id) && item.isXetDuyet == 1 && item.sbd);
                    let tsCanXepSorted = infoTs.sort((x, y) => x?.sbd?.slice(numPostfix) < y?.sbd?.slice(numPostfix) ? -1 : 1); //sort theo thành phần postfix của số báo danh
                    const total = tsCanXepSorted.length;
                    let nganh = '';
                    if (total) {
                        nganh = tsCanXepSorted.map(i => i.idNganh).join(',');
                    }
                    const created = await app.model.sdhTsInfoLichThi.create({ ...data, siSo: capacity, tenPhongThi: `${tenPhongThi} - ${skill}`, idDot: Number(idDot), ngayThi: Number(gioThi[skill]), kyNang: skill, nganh, maToHop: 'NN', monThi: maMonThi });
                    if (total >= Number(capacity)) {
                        for (let i = 1; i <= Number(capacity); i++) {
                            const data = {
                                maMonThi,
                                idThiSinh: tsCanXepSorted[i - 1]?.id || 'error',
                                idLichThi: created?.id || 'error',
                            };
                            await app.model.sdhTsInfoCaThiThiSinh.create(data);
                        }
                    } else {
                        for (let i = 1; i <= total; i++) {
                            const data = {
                                maMonThi,
                                idThiSinh: tsCanXepSorted[i - 1].id || 'error',
                                idLichThi: created?.id || 'error',
                            };
                            await app.model.sdhTsInfoCaThiThiSinh.create(data);
                        }
                    }
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/lich-thi-nn', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            changes.modifier = req.session.user.email;
            changes.timeModified = Date.now();
            const item = await app.model.sdhTsInfoLichThi.update({ id }, changes);
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/lich-thi-nn', app.permission.check('sdhTuyenSinhLichThi:delete'), async (req, res) => {
        try {
            const { id } = req.body;
            await Promise.all([
                app.model.sdhTsInfoLichThi.delete({ id }),
                app.model.sdhTsInfoCaThiThiSinh.delete({ idLichThi: id })
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/lich-thi-nn/get-sldk', app.permission.check('sdhTuyenSinhLichThi:read'), async (req, res) => {
        try {
            const { maMonThi } = req.query;
            const items = await app.model.sdhTsDangKyNgoaiNgu.getAll({ maMonThi });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/sdh/lich-thi-nn/dsts', app.permission.check('sdhTuyenSinhLichThi:delete'), async (req, res) => {
        try {
            const { data } = req.body;
            await app.model.sdhTsInfoCaThiThiSinh.delete({ ...data });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/sdh/lich-thi-nn/dsdk', app.permission.check('sdhTuyenSinhLichThi:delete'), async (req, res) => {
        try {
            const { data } = req.body;
            const { idThiSinh, maMonThi } = data,
                processingDot = await app.model.sdhTsInfoTime.get({ processing: 1 });
            const idLichThis = await app.model.sdhTsDangKyNgoaiNgu.getAll({ maMonThi, idDot: processingDot.id });

            await Promise.all([
                app.model.sdhTsDangKyNgoaiNgu.delete({ idThiSinh, maMonThi }),
                idLichThis.length ?
                    app.model.sdhTsInfoCaThiThiSinh.delete({
                        statement: 'idLichThi in (:idLichThis) and idThiSinh=:idThiSinh',
                        parameter: { idLichThis, idThiSinh }
                    }) : null
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


    app.get('/api/sdh/lich-thi-nn/dan-phong', app.permission.check('sdhTuyenSinhLichThi:export'), async (req, res) => {
        try {
            const { filter } = req.query;
            const { idDot, maMonThi } = filter || {};
            const items = await app.model.sdhTsInfoLichThi.getAll({ idDot, maMonThi });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.put('/api/sdh/lich-thi-nn/dsts', app.permission.check('sdhTuyenSinhLichThi:write'), async (req, res) => {
        try {

            const { listChosen, idLichThi } = req.body.data;
            if (!idLichThi) res.end();
            const [stored, info] = await Promise.all([
                app.model.sdhTsInfoCaThiThiSinh.getAll({ idLichThi }),
                app.model.sdhTsThongTinCoBan.getAll({})

            ]);
            const listIdStored = stored.map(item => item.idThiSinh), listIdChosen = listChosen?.map(item => item.idThiSinh),
                listInfo = info.filter(item => listIdChosen?.includes(item.id.toString()));
            const nganh = listInfo.map(item => item.idNganh).join(',');
            const [creates, deletes] = [
                listChosen?.filter(item => !listIdStored.includes(item.idThiSinh)) || [],
                listIdStored?.filter(item => !listIdChosen.includes(item)) || []
            ];
            await Promise.all([
                ...creates.map(item => app.model.sdhTsInfoCaThiThiSinh.create({ ...item, idLichThi })),
                ...deletes.map(item => app.model.sdhTsInfoCaThiThiSinh.delete({ idThiSinh: item, idLichThi })),
                app.model.sdhTsInfoLichThi.update({ id: idLichThi }, { nganh })

            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};
