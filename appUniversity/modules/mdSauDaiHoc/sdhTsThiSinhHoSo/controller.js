module.exports = app => {

    let menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1014: { title: 'Hồ sơ thí sinh', link: '/user/sdh/ts/thi-sinh/ho-so', icon: 'fa-user', backgroundColor: '#eb9834', groupIndex: 0 }
        }
    };

    app.permission.add(
        { name: 'sdhTsUngVien:login', menu },
        { name: 'sdhTsThiSinh:login', menu },
        { name: 'sdhTsThiSinh:reject', menu },
    );
    app.get('/user/sdh/ts/thi-sinh/ho-so', app.permission.orCheck('sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), app.templates.admin);
    //--------------API-------------------
    app.get('/api/sdh/ts/thi-sinh/get-profile', app.permission.orCheck('sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            let email = req.session.user?.email;
            let item = await app.model.sdhTsInfoTime.get({ processingTs: 1 });
            let dataCoBan = await app.model.sdhTsThongTinCoBan.getAll({ email, idDot: item.id });
            let data = [];
            if (dataCoBan.length) {
                for (const hsdk of dataCoBan) {
                    if (hsdk && hsdk.id) {
                        let dataDot = await app.model.sdhTsInfoTime.get({ id: hsdk.idDot });
                        for (const key in dataDot) {
                            if (key == 'id') continue;
                            else if (key == 'kichHoat') {
                                hsdk.isEdit = dataDot.kichHoat ? true : false;
                            }
                            else hsdk[key + 'Dot'] = dataDot[key];
                        }
                        if (hsdk.phanHe) {
                            let [dataPhanHe, dmPhanHe] = await Promise.all([
                                app.model.sdhTsInfoPhanHe.get({ idDot: hsdk.idDot, maPhanHe: hsdk.phanHe }),
                                app.model.dmHocSdh.get({ ma: hsdk.phanHe }),
                            ]);
                            if (dmPhanHe) {
                                hsdk['tenPhanHe'] = dmPhanHe.ten;
                            }
                            if (dataPhanHe) {
                                for (const key in dataPhanHe) {
                                    if (key == 'id') hsdk['idPhanHe'] = dataPhanHe[key];
                                    else hsdk[key + 'Ph'] = dataPhanHe[key];
                                }
                                let dataHinhThuc = await app.model.sdhTsInfoHinhThuc.get({ idPhanHe: dataPhanHe.id });
                                if (dataHinhThuc) {
                                    for (const key in dataPhanHe) {
                                        if (key == 'id') hsdk['idHinhThuc'] = dataHinhThuc[key];
                                        else hsdk[key + 'Ht'] = dataHinhThuc[key];
                                    }
                                }
                            }
                        }
                        if (hsdk.idNganh && hsdk.maNganh) {
                            let dataNganh = await app.model.sdhTsInfoNganh.get({ id: hsdk.idNganh });
                            for (const key in dataNganh) {
                                if (key == 'id') hsdk['idNganh'] = dataNganh[key];
                                else hsdk[key + 'Nganh'] = dataNganh[key];
                            }
                        }
                        let { id } = hsdk;
                        let [dataVanBang, dknn, ccnn, dataBaiBao, dataDeTai, dataCbhd, dataCongTrinhCbhd] = await Promise.all([
                            app.model.sdhTsVanBang.get({ id }),
                            app.model.sdhTsDangKyNgoaiNgu.get({ idThiSinh: id }),
                            app.model.sdhTsNgoaiNgu.get({ id }),
                            app.model.sdhTsBaiBao.getAll({ id }),
                            app.model.sdhTsDeTai.get({ idThiSinh: id }),
                            app.model.sdhTsCanBoHuongDan.getAll({ idThiSinh: id }),
                            app.model.sdhTsCongTrinhCbhd.getAll({}),

                        ]);
                        let listCbhd = dataCbhd.map(item => item.id?.toString());
                        dataCongTrinhCbhd = dataCongTrinhCbhd.filter(i => listCbhd.includes(i.idCbhd));
                        dataCongTrinhCbhd = dataCongTrinhCbhd.map(item => {
                            const { id: idBaiBao, idCbhd, ten: tenBaiBao, tenTapChi, chiSo, diem: diemBaiBao, ngayDang } = item;
                            return { idBaiBao, idCbhd, tenBaiBao, tenTapChi, chiSo, diemBaiBao, ngayDang };
                        });
                        dataBaiBao = dataBaiBao.map(item => {
                            const { idBaiBao, idCbhd, tenBaiBao, tenTapChi, chiSo, diem: diemBaiBao, ngayDang } = item;
                            return { idBaiBao, idCbhd, tenBaiBao, tenTapChi, chiSo, diemBaiBao, ngayDang };
                        });
                        if (dataDeTai) {
                            dataDeTai = { tenDeTai: dataDeTai.tenDeTai, dataCongTrinhCbhd, dataBaiBao, dataCbhd };
                        }

                        if (ccnn) {
                            let loaiChungChi = await app.model.sdhLoaiChungChiNgoaiNgu.get({ ma: ccnn.ma });
                            for (const key in loaiChungChi) {
                                ccnn[key] = loaiChungChi[key];
                            }
                        }
                        data.push({ id: hsdk.id, dataCoBan: hsdk, dataVanBang, dataNgoaiNgu: { dknn, ccnn }, dataDeTai });
                    }
                }
            }
            else if (dataCoBan.length == 0) {
                throw 'Không tìm thấy hồ sơ thí sinh trong đợt được thiết lập, vui lòng liên hệ để được hỗ trợ';
            }
            res.send({ data });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/ts/thi-sinh/dang-ky-them', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            const { dataCoBan, newData } = req.body;
            const item = await app.model.sdhTsThongTinCoBan.get({ id: dataCoBan.id });
            let newItem = {};
            for (const col in item) {
                if (Object.keys(newData).includes(col)) {
                    newItem[col] = newData[col];
                } else
                    newItem[col] = item[col];
            }
            const [ccnn, dknn, dataVanBang] = await Promise.all([
                app.model.sdhTsNgoaiNgu.get({ id: dataCoBan.id }),
                app.model.sdhTsDangKyNgoaiNgu.get({ idThiSinh: dataCoBan.id }),
                app.model.sdhTsVanBang.get({ id: dataCoBan.id })
            ]);
            newItem.latestUpdate = Date.now();
            newItem.modifier = req.session.user.email;
            delete newItem.id;
            ccnn && ccnn.idCcnn && delete ccnn.idCcnn;
            for (const dk of dknn) {
                dk.id && delete dk.id;//idThisinh
            }
            const created = await app.model.sdhTsThongTinCoBan.create({ ...newItem, isXetDuyet: 0, sbd: '' });
            await app.model.sdhTsLichSuHinhThuc.create({ idThiSinh: created.id, maHinhThuc: created.hinhThuc, active: 1 });
            if (created && created.id) {
                ccnn && await app.model.sdhTsNgoaiNgu.create({ ...ccnn, id: created.id });
                dknn.length && await Promise.all(dknn.map(i => app.model.sdhTsDangKyNgoaiNgu.create({ ...i, idThiSinh: created.id })));
                dataVanBang && await app.model.sdhTsVanBang.create({ ...dataVanBang, id: created.id });
            }
            // const accountCheck = app.model.sdhTsAccount.checkExist(created.email);
            // const isExisted = accountCheck.rows.length;
            // if (isExisted) {
            //     const existedAcount = accountCheck.rows[0];
            //     app.model.sdhTsAccount.update({ id: existedAcount.id }, {
            //         idHoSo: `${existedAcount.idHoSo},${created.id}`,
            //     });
            // } else {

            // }
            res.send({ item: created });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });


    app.delete('/api/sdh/ts/thi-sinh/delete', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login', 'sdhTsThiSinh:login'), async (req, res) => {
        try {
            const id = req.body.id || '';
            let cbhd = await app.model.sdhTsCanBoHuongDan.getAll({ idThiSinh: id });
            let listIdCbhd = cbhd.map(item => item.id);
            await Promise.all([
                app.model.sdhTsThongTinCoBan.delete({ id }),
                app.model.sdhTsVanBang.delete({ id }),
                app.model.sdhTsNgoaiNgu.delete({ id }),
                app.model.sdhTsBaiBao.delete({ id }),
                app.model.sdhTsDeTai.delete({ idThiSinh: id }),
                app.model.sdhTsDangKyNgoaiNgu.delete({ idThiSinh: id }),
                app.model.sdhTsCanBoHuongDan.delete({ idThiSinh: id }),
                listIdCbhd.length ? app.model.sdhTsCongTrinhCbhd.delete({
                    statement: 'idCbhd IN (:lstId)',
                    parameter: { lstId: listIdCbhd }
                }) : null,
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/ts/thi-sinh/trigger', app.permission.orCheck('sdhTsUngVien:login', 'sdhTsThiSinh:login', 'sdhTsThiSinh:reject'), async (req, res) => {
        try {
            const { phanHe: newPhanHe } = req.body;
            const { email, dot, phanHe } = req.session.user;
            const items = await app.model.sdhTsThongTinCoBan.getAll({ email, idDot: dot.id });
            const target = items.find(i => i.phanHe == newPhanHe);
            await Promise.all([
                app.model.sdhTsThongTinCoBan.update({ id: target.id }, { triggerPh: 1 }),
                app.model.sdhTsThongTinCoBan.update({ email, phanHe, idDot: dot.id }, { triggerPh: 0 }),
            ]);
            await app.updateSessionUserSdh(req, req.session.user);
            res.send({});
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts/thi-sinh/dang-ky-ngoai-ngu', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const idThiSinh = req.body.idThiSinh || '';
            app.model.sdhTsDangKyNgoaiNgu.delete({ idThiSinh });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts/thi-sinh/chung-chi-ngoai-ngu', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const idThiSinh = req.body.idThiSinh || '';
            app.model.sdhTsNgoaiNgu.delete({ id: idThiSinh });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/ts/thi-sinh/de-tai', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login'), async (req, res) => {
        try {
            const idThiSinh = req.body.idThiSinh || '';
            let listCbhd = await app.model.sdhTsCanBoHuongDan.getAll({ idThiSinh });
            listCbhd = listCbhd.map(i => i.id);
            listCbhd.length ? app.model.sdhTsCongTrinhCbhd.delete({
                statement: 'idCbhd IN (:listCbhd)',
                parameter: { listCbhd }
            }) : null;
            app.model.sdhTsBaiBao.delete({ id: idThiSinh });
            app.model.sdhTsDeTai.delete({ idThiSinh });
            app.model.sdhTsCanBoHuongDan.delete({ idThiSinh });
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};