module.exports = app => {
    app.get('/api/sdh/bmdk/ma-truy-xuat', async (req, res) => {
        try {
            let maTruyXuat = req.query.maTruyXuat;
            const dataCoBan = await app.model.sdhTsThongTinCoBan.get({ maTruyXuat });
            if (dataCoBan && dataCoBan.id) {
                const id = dataCoBan.id;
                const [dataVanBang, ccnn, dknn, dataBaiBao, dataDeTai] = await Promise.all([
                    app.model.sdhTsVanBang.get({ id }),
                    app.model.sdhTsNgoaiNgu.getAll({ id }),
                    app.model.sdhTsDangKyNgoaiNgu.getAll({ idThiSinh: id }),
                    app.model.sdhTsBaiBao.getAll({ id }),
                    app.model.sdhTsDeTai.getAll({ idThiSinh: id }),
                ]);
                res.send({ item: { dataCoBan, dataVanBang, dataNgoaiNgu: { ccnn, dknn }, dataBaiBao, dataDeTai } });
            } else {
                throw 'Lỗi lấy thông tin đăng ký';
            }

        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/confirm-code', async (req, res) => {
        try {
            const { maXacThuc, email, dataXacThuc } = req.body.data;
            const xacThuc = await app.model.sdhTsMaXacThuc.get({ id: dataXacThuc.id, email });
            if (xacThuc.maXacThuc != maXacThuc) {
                res.send({ error: 'Mã xác thực không chính xác' });
            } else {
                res.send({ item: xacThuc });
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }

    });

    app.post('/api/sdh/bieu-mau-dang-ky', async (req, res) => {
        try {
            let { dataCoBan, dataVanBang, dataNgoaiNgu, dataDeTai, dataBaiBaoTs } = req.body.studentData ? req.body.studentData : { dataVanBang: {}, dataNgoaiNgu: { dknn: [], ccnn: [] }, dataBaiBao: [], dataDeTai: [], dataBaiBaoTs: [] };
            const { maXacThuc, id } = req.body.dataXacThuc;
            const xacThuc = await app.model.sdhTsMaXacThuc.get({ id });
            if (xacThuc.maXacThuc != maXacThuc) {
                return res.send({ error: 'Mã xác thực không chính xác' });
            }
            let checkVb = false;
            const data = { ...dataCoBan, ngayDangKy: Date.now(), latestUpdate: Date.now() };

            let item = await app.model.sdhTsThongTinCoBan.create({ ...data, isXetDuyet: 0 });
            await app.model.sdhTsLichSuHinhThuc.create({ idThiSinh: item.id, maHinhThuc: item.hinhThuc, active: 1 });

            if (item && item.id) {
                const id = item.id;
                if (dataVanBang) {
                    for (const prop in dataVanBang) {
                        if (dataVanBang[prop] && dataVanBang[prop] !== '') {
                            checkVb = true;
                            break;
                        }
                    }
                }
                if (dataBaiBaoTs && dataBaiBaoTs.length) {
                    Promise.all(dataBaiBaoTs.map(i => {
                        const { tenBaiBao, tenTapChi, chiSo, diem, ngayDang } = i;
                        const addData = { tenBaiBao, tenTapChi, chiSo, diem, ngayDang, id: item.id };
                        return app.model.sdhTsBaiBao.create(addData);
                    }));
                }
                if (checkVb) {
                    app.model.sdhTsVanBang.create({ ...dataVanBang, id });
                }
                if (dataNgoaiNgu && dataNgoaiNgu.ccnn && dataNgoaiNgu.dknn) {
                    return res.send({ error: 'Lỗi đăng ký ngoại ngữ: tìm thấy đồng thời xét chứng chỉ/văn bằng ngoại ngữ và đăng ký thi ngoại ngữ. Vui lòng chỉ chọn 1' });
                }
                else if (dataNgoaiNgu && dataNgoaiNgu.ccnn) {
                    delete dataNgoaiNgu.ccnn.idCcnn;
                    app.model.sdhTsNgoaiNgu.create({ ...dataNgoaiNgu.ccnn, id });
                }
                else if (dataNgoaiNgu && dataNgoaiNgu.dknn) {
                    await app.model.sdhTsDangKyNgoaiNgu.create({ idThiSinh: id, maMonThi: dataNgoaiNgu.dknn });
                }
                if (dataDeTai) {
                    let { tenDeTai, dataCbhd, dataCongTrinhCbhd } = dataDeTai;
                    if (!tenDeTai) return res.send({ err: 'Lỗi đăng ký đề tài: Không tìm thấy thông tin đề tài' });
                    else if (!dataCbhd.length) return res.send({ err: 'Lỗi đăng ký đề tài: Không tìm thấy thông tin cán bộ hướng dẫn' });
                    // else if (dataCongTrinhCbhd?.length) return res.send({ err: 'Lỗi đăng ký đề tài: Không tìm thấy thông tin công trình nghiên cứu' });
                    else {
                        let deTai = await app.model.sdhTsDeTai.create({ tenDeTai, idThiSinh: id });
                        if (deTai && deTai.idDeTai) {
                            for (const cbhd of dataCbhd) {
                                let { shcc, hoTen, vaiTro } = cbhd;
                                const baiBaos = dataCongTrinhCbhd && dataCongTrinhCbhd.length ? dataCongTrinhCbhd.filter(item => item.idCbhd == cbhd.idCbhd) : [];
                                app.model.sdhTsCanBoHuongDan.create({ shcc, hoTen, vaiTro, idThiSinh: id }, (error, item) => {
                                    if (item) {
                                        for (const baiBao of baiBaos) {
                                            const { ten, tenTapChi, chiSo, diem, ngayDang } = baiBao;
                                            const addData = { ten, tenTapChi, chiSo, diem, ngayDang, idCbhd: item.id };
                                            app.model.sdhTsCongTrinhCbhd.create(addData);
                                        }
                                    }
                                    if (error) console.log(error);
                                });
                            }
                        }
                    }
                }
                res.send({ item });
            }
            else {
                throw 'Lỗi tạo mới đăng ký';
            }

        } catch (error) {
            console.error(req.method, req.url, { error });
            return res.send({ error });
        }
    });

    app.post('/api/sdh/bieu-mau-dang-ky/temp', async (req, res) => {
        try {
            let { dataCoBan, dataVanBang, dataNgoaiNgu, dataDeTai } = req.body.data ? req.body.data : { dataVanBang: {}, dataNgoaiNgu: { dknn: {}, ccnn: [] }, dataDeTai: {} };
            let { idDot = '', email = '', phanHe = '' } = dataCoBan;
            let isExist = await app.model.sdhTsThongTinCoBan.getAll({ idDot, email, phanHe });
            if (isExist.length) {
                throw 'Email đã đăng ký, vui lòng nhập email khác hoặc chỉnh sửa email đã tồn tại';
            } else {
                let { ccnn: dataCcnn, dknn: dataDknn } = dataNgoaiNgu || { dataCcnn: '', dataDknn: '' };
                let { dataCongTrinhCbhd, dataCbhd: dataDeTaiHuongDan, tenDeTai } = dataDeTai;
                let tempData = {
                    dataCoBan,
                    dataVanBang,
                    dataCcnn,
                    dataDknn,
                    dataCongTrinhCbhd,
                    dataCbhd: dataDeTaiHuongDan,
                    dataDeTai: tenDeTai
                };
                for (const key in tempData) {
                    if (Array.isArray(tempData[key])) {
                        tempData[key] = { key: tempData[key] || '' };
                    }
                    tempData[key] = app.utils.stringify(tempData[key]) || '';
                }
                const timeModified = Date.now();

                const maXacNhan = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
                let done = await app.model.sdhTsTempDangKy.create({ ...tempData, email, maXacNhan, timeModified });
                if (done && done.id) {
                    res.send({ item: done });
                } else {
                    throw 'Lỗi hệ thống';
                }
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/ts/dang-ky-ho-so/check-email', async (req, res) => {
        try {
            const { email, phanHe, idDot } = req.query.data;
            const data = await app.model.sdhTsThongTinCoBan.getAll({
                email,
                phanHe,
                idDot
            });
            if (data.length) throw 'Tồn tại email cùng phân hệ';
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.post('/api/sdh/bieu-mau-dang-ky/send-mail-confirm', async (req, res) => {
        try {
            const { name = '', emailForm = '' } = req.body.data;
            let xacThuc = {};
            const confirmCode = Math.floor(Math.random() * (100000 - 999999 + 1)) + 999999;

            const emailTo = !app.isDebug ? emailForm : 'sang.nguyen0302@hcmut.edu.vn';
            const mailSetting = await app.model.sdhTsSetting.getValue('email', 'emailPassword', 'emailDangKyEditorText', 'emailForgetPasswordEditorText', 'emailDangKyEditorHtml', 'emailForgetPasswordEditorHtml', 'emailDangKyTitle', 'emailForgetPasswordTitle', 'sdhPhone', 'sdhAddress', 'sdhSupportPhone', 'sdhEmail');
            if (!emailForm) throw 'Lỗi lấy dữ liệu!';
            if (name) {//email đăng ký
                xacThuc = await app.model.sdhTsMaXacThuc.create({
                    maXacThuc: confirmCode,
                    timeGenerated: Date.now(),
                    email: emailForm
                });
                let maXacThuc = xacThuc.maXacThuc;
                let { email, emailPassword, emailDangKyEditorText, emailDangKyEditorHtml, emailDangKyTitle, sdhPhone, sdhAddress, sdhEmail, sdhSupportPhone } = mailSetting || {};
                let text = emailDangKyEditorText.replaceAll('{name}', name)
                    .replaceAll('{sdh_address}', sdhAddress).replaceAll('{sdh_phone}', sdhPhone).replaceAll('{support_phone}', sdhSupportPhone).replaceAll('{sdh_email}', sdhEmail).replaceAll('{maXacThuc}', maXacThuc);
                let html = emailDangKyEditorHtml.replaceAll('{name}', name)
                    .replaceAll('{sdh_address}', sdhAddress).replaceAll('{sdh_phone}', sdhPhone).replaceAll('{support_phone}', sdhSupportPhone).replaceAll('{sdh_email}', sdhEmail).replaceAll('{maXacThuc}', maXacThuc);
                app.service.emailService.send(email, emailPassword, emailTo, null, null, (app.isDebug ? 'TEST: ' : '') + emailDangKyTitle, text, html, null);
                res.send({ id: xacThuc.id });
            } else {//email quên mật khẩu gửi lại
                let { email, emailPassword, emailForgetPasswordEditorText, emailForgetPasswordEditorHtml, emailForgetPasswordTitle, sdhPhone, sdhAddress, sdhEmail, sdhSupportPhone } = mailSetting || {};
                let user = await app.model.sdhTsThongTinCoBan.get({ email: emailForm });
                if (user && user.id) {
                    xacThuc = await app.model.sdhTsMaXacThuc.create({
                        maXacThuc: confirmCode,
                        timeGenerated: Date.now(),
                        email: emailForm
                    });
                    let maXacThuc = xacThuc.maXacThuc;
                    let text = emailForgetPasswordEditorText.replaceAll('{name}', `${user.ho || ''} ${user.ten || ''}`)
                        .replaceAll('{sdh_address}', sdhAddress).replaceAll('{sdh_phone}', sdhPhone).replaceAll('{support_phone}', sdhSupportPhone).replaceAll('{sdh_email}', sdhEmail).replaceAll('{maXacThuc}', maXacThuc);
                    let html = emailForgetPasswordEditorHtml.replaceAll('{name}', `${user.ho} ${user.ten}`)
                        .replaceAll('{sdh_address}', sdhAddress).replaceAll('{sdh_phone}', sdhPhone).replaceAll('{support_phone}', sdhSupportPhone).replaceAll('{sdh_email}', sdhEmail).replaceAll('{maXacThuc}', maXacThuc);
                    app.service.emailService.send(email, emailPassword, emailTo, null, null, (app.isDebug ? 'TEST: ' : '') + emailForgetPasswordTitle, text, html, null);
                    res.send({ id: xacThuc.id });
                } else {
                    throw 'Email không tồn tại trong hệ thống!';
                }
            }

        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/sdh/bieu-mau-dang-ky/send-mail/thong-tin-dang-nhap', async (req, res) => {
        try {
            const candidateData = req.body.data || { name: '', email: '' };
            let name = `${candidateData.ho} ${candidateData.ten}`;
            const accountCheck = await app.model.sdhTsAccount.checkExist(candidateData.email);
            const isExisted = accountCheck.rows.length;
            if (isExisted) {
                const existedAcount = accountCheck.rows[0];
                app.model.sdhTsAccount.update({ id: existedAcount.id }, {
                    idHoSo: `${existedAcount.idHoSo},${candidateData.id}`,
                });
            } else {
                const password = 'hcmussh' + (Math.floor(Math.random() * (100000 - 999999 + 1)) + 999999).toString();
                const hashedPassword = app.utils.hashPassword(password);
                await app.model.sdhTsAccount.create({
                    hashedPassword,
                    idHoSo: candidateData.id,
                    email: candidateData.email,
                    lastModified: Date.now(),
                    isValidation: 0
                });
                const emailTo = !app.isDebug ? candidateData.email : 'sang.nguyen0302@hcmut.edu.vn';
                const mailSetting = await app.model.sdhTsSetting.getValue('email', 'emailPassword', 'emailThongTinDangNhapEditorText', 'emailThongTinDangNhapEditorHtml', 'emailThongTinDangNhapTitle', 'sdhPhone', 'sdhAddress', 'sdhSupportPhone', 'sdhEmail');

                let { email, emailPassword, emailThongTinDangNhapEditorText, emailThongTinDangNhapEditorHtml, emailThongTinDangNhapTitle, sdhPhone, sdhAddress, sdhEmail, sdhSupportPhone } = mailSetting || {};
                let text = emailThongTinDangNhapEditorText.replaceAll('{name}', name)
                    .replaceAll('{sdh_address}', sdhAddress).replaceAll('{sdh_phone}', sdhPhone).replaceAll('{support_phone}', sdhSupportPhone).replaceAll('{sdh_email}', sdhEmail).replaceAll('{email}', candidateData.email).replaceAll('{password}', password);
                let html = emailThongTinDangNhapEditorHtml.replaceAll('{name}', name)
                    .replaceAll('{sdh_address}', sdhAddress).replaceAll('{sdh_phone}', sdhPhone).replaceAll('{support_phone}', sdhSupportPhone).replaceAll('{sdh_email}', sdhEmail).replaceAll('{email}', candidateData.email).replaceAll('{password}', password);
                app.service.emailService.send(email, emailPassword, emailTo, null, null, (app.isDebug ? 'TEST: ' : '') + emailThongTinDangNhapTitle, text, html, null);
            }

            res.end();

        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    app.post('/api/sdh/bieu-mau-dang-ky/confirm', async (req, res) => {
        try {
            let { maTruyXuat } = req.body;
            let data = await app.model.sdhTsTempDangKy.get({ maTruyXuat });
            const check = app.crypt.compareSync(String(maTruyXuat), String(data.email + data.timeModified));
            res.send({ check });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });



    app.get('/api/sdh/bieu-mau-dang-ky/export', async (req, res) => {
        try {
            let filter = req.query.filter;
            filter = JSON.parse(filter);
            const data = await app.model.sdhTsThongTinCoBan.generatedPdfSdhDktsFile(filter);
            if (app.fs.existsSync(data.filePdfPath)) res.download(data.filePdfPath, `ket_qua_dkts_${filter.id}.pdf`);
            else res.send({ error: 'Không tồn tại đường dẫn' });
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.delete('/api/sdh/bieu-mau-dang-ky/update', async (req, res) => {
        try {
            const { id, item } = req.body;
            if (item.maChungChi) {
                await app.model.sdhTsNgoaiNgu.delete({ id, maChungChi: item.maChungChi });
            }
            if (item.tenBaiBao) {
                await app.model.sdhTsBaiBao.delete({ id, tenBaiBao: item.tenBaiBao });
            }
            if (item.tenDeTai) {
                await app.model.sdhTsDeTai.delete({ idThiSinh: id, tenDeTai: item.tenDeTai });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/bieu-mau-dang-ky/update', async (req, res) => {
        try {
            const { id, changes } = req.body;
            const { dataCoBan, dataVanBang, dataNgoaiNgu, dataDeTai } = changes;
            let latestUpdate = Date.now();
            if (dataCoBan) {
                if (dataCoBan.email) {
                    let isExist = await app.model.sdhTsThongTinCoBan.getAll({ email: dataCoBan.email });
                    if (isExist && isExist.find(item => item.idDot == dataCoBan.idDot && item.id != id)) throw 'Email đã đăng ký, vui lòng nhập email khác hoặc liên hệ để lấy lại link đăng ký';
                }
                await app.model.sdhTsThongTinCoBan.update({ id }, dataCoBan);
                dataCoBan.hinhThuc && await app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: id, active: 1 }, { maHinhThuc: dataCoBan.hinhThuc });

            }
            if (dataVanBang) {
                const item = await app.model.sdhTsVanBang.get({ id });
                if (item) {
                    app.model.sdhTsVanBang.update({ id }, dataVanBang);
                } else {
                    app.model.sdhTsVanBang.create({ id, ...dataVanBang });
                }
            }
            if (dataNgoaiNgu) {
                if (dataNgoaiNgu.ccnn) {
                    const item = await app.model.sdhTsNgoaiNgu.get({ id });
                    if (item) {
                        app.model.sdhTsNgoaiNgu.update({ id: item.id }, { ...dataNgoaiNgu.ccnn });
                    } else {
                        await app.model.sdhTsNgoaiNgu.create({ id, ...dataNgoaiNgu.ccnn });
                    }

                }
                if (dataNgoaiNgu.dknn) {
                    const item = await app.model.sdhTsDangKyNgoaiNgu.get({ idThiSinh: id });
                    if (item) {
                        app.model.sdhTsDangKyNgoaiNgu.update({ id: item.id }, { maMonThi: dataNgoaiNgu.dknn });
                    } else {
                        app.model.sdhTsDangKyNgoaiNgu.create({ idThiSinh: id, maMonThi: dataNgoaiNgu.dknn });
                    }

                }
            }
            if (dataDeTai) {
                app.model.sdhTsDeTai.create({ idThiSinh: id, ...dataDeTai });
            }

            app.model.sdhTsThongTinCoBan.update({ id }, { latestUpdate });


            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/bieu-mau-dang-ky/detail', app.model.sdhTsThongTinCoBan.verifyToken, app.model.sdhTsThongTinCoBan.verifyAccess, app.model.sdhTsThongTinCoBan.verifyWrite, async (req, res) => {
        try {
            let { maTruyXuat } = req.query;
            let { permission } = req.headers;
            const item = await app.model.sdhTsThongTinCoBan.get({ maTruyXuat });
            const { id, phanHe, idDot } = item ? item : { id: '', phanHe: '', idDot: '' };
            if (id) {
                const [dataCoBan, dataVanBang, ccnn, dknn, dataBaiBao, dataDeTai, idPhanHe] = await Promise.all([
                    app.model.sdhTsThongTinCoBan.get({ id }),
                    app.model.sdhTsVanBang.get({ id }),
                    app.model.sdhTsNgoaiNgu.getAll({ id }),
                    app.model.sdhTsDangKyNgoaiNgu.get({ idThiSinh: id }),

                    app.model.sdhTsBaiBao.getAll({ id }),
                    app.model.sdhTsDeTai.getAll({ idThiSinh: id }),
                    app.model.sdhTsInfoPhanHe.get({ maPhanHe: phanHe, idDot })
                ]);
                res.send({ data: { dataCoBan, dataVanBang, dataNgoaiNgu: { ccnn, dknn }, dataBaiBao, dataDeTai, idPhanHe: idPhanHe?.id || null, permission } });
            } else {
                res.send({ error: 'Thông tin đăng ký không được lưu trữ' });
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/bmdk/gioi-tinh/adapter', (req, res) => {
        app.model.dmGioiTinh.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });
    app.get('/api/sdh/bmdk/doi-tuong-uu-tien/adapter', (req, res) => {
        app.model.sdhDoiTuongUuTien.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });
    app.get('/api/sdh/bmdk/nganh/adapter', async (req, res) => {
        try {
            const { filter, searchTerm } = req.query;
            let data = await app.model.sdhTsInfoNganh.getByFilter(app.utils.stringify({ ...filter, searchTerm }));
            const items = data.rows;
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/bmdk/mon-thi-ngoai-ngu/adapter', async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber || 1),
                pageSize = parseInt(req.params.pageSize || 50);
            let statement = ['ma', 'ten'].map(i => `(lower(${i}) LIKE :searchText)`).join(' OR ');
            let condition = {
                statement,
                parameter: req.query.searchTerm ? { searchText: `%${req.query.searchTerm?.toLowerCase() || ''}%` } : '',
            };
            const page = await app.model.sdhMonThiTuyenSinh.getPage(pageNumber, pageSize, condition, '*', 'ten');
            res.send({ page });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/bmdk/cbhd/adapter', async (req, res) => {
        try {
            const { searchTerm } = req.query,
                // sortTerm = 'ten_ASC',
                st = typeof searchTerm === 'string' ? searchTerm : '';
            let [data, hocVi, hocHam] = await Promise.all([
                app.model.tchcCanBo.getAll({}),
                app.model.dmTrinhDo.getAll({}),
                app.model.dmChucDanhKhoaHoc.getAll({})
            ]);
            let items = data.map(item => ({
                shcc: item.shcc,
                ho: item.ho,
                ten: item.ten,
                maHocHam: item.chucDanh,
                tenHocHam: hocHam.find(i => i.ma == item.chucDanh)?.vietTat || '',
                maHocVi: item.hocVi,
                tenHocVi: hocVi.find(i => item.hocVi == i.ma)?.vietTat || ''
            }));
            items = items.filter(item => {
                let { ho, ten, tenHocHam, tenHocVi, maHocVi } = item;
                return `${tenHocHam} ${tenHocVi} ${ho} ${ten}`.toLowerCase().includes(st.toLowerCase()) && (maHocVi == '02' || maHocVi == '01');
            });
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/bmdk/doi-tuong-uu-tien/item/:ma', (req, res) => {
        app.model.sdhDoiTuongUuTien.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
    app.get('/api/sdh/bmdk/gioi-tinh/item/:ma', (req, res) => {
        app.model.dmGioiTinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
    app.get('/api/sdh/bmdk/nganh/item/:idNganh', async (req, res) => {
        try {
            let { idNganh: id } = req.params || {};
            const { maTsNganh: maVietTat, maNganh: ma } = id && await app.model.sdhTsInfoNganh.get({ id }) || {};
            const { ten } = ma && await app.model.dmNganhSauDaiHoc.get({ maNganh: ma }) || {};
            const item = { id, ma, ten, maVietTat };
            res.send({ item });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.get('/api/sdh/bmdk/mon-thi/item/:ma', (req, res) => {
        app.model.sdhMonThiTuyenSinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
    app.get('/api/sdh/bmdk/cbhd/item', async (req, res) => {
        try {
            const [item, hocHam, hocVi] = await Promise.all([
                app.model.tchcCanBo.get({ shcc: req.query.shcc }),
                app.model.dmChucDanhKhoaHoc.getAll({}),
                app.model.dmTrinhDo.getAll({}),
            ]);
            const fetchItem = {
                shcc: item.shcc,
                tenHocHam: hocHam.find(i => i.ma == item.chucDanh)?.vietTat || '',
                tenHocVi: hocVi.find(i => i.ma == item.hocVi)?.vietTat || '',
                hoTen: `${item.ho}  ${item.ten}`
            };
            res.send({ item: fetchItem });
        }
        catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    //copy ctsv nhưng ko cần check quyền dành cho thí sinh chưa có tài khoản hcmussh và có nơi sinh ở nước ngoài
    app.get('/api/sdh/bmdk/dm-quoc-gia/page/:pageNumber/:pageSize', async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            const statement = ['tenKhac', 'maCode', 'shortenName', 'tenQuocGia', 'country'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
            if (req.query.searchTerm) {
                condition = {
                    statement,
                    parameter: { searchText: `%${req.query.searchTerm.toLowerCase()}%` },
                };
            }
            const page = await app.model.dmQuocGia.getPage(pageNumber, pageSize, condition, '*', 'maCode');
            res.send({ page });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/bmdk/dm-quoc-gia/item/:maCode', async (req, res) => {
        try {
            let item = await app.model.dmQuocGia.get({ maCode: req.params.maCode });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });

        }
    });
    app.get('/api/sdh/bmdk/dm-dan-toc/item/:ma', async (req, res) => {
        try {
            let item = await app.model.dmDanToc.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/bmdk/dm-dan-toc/page/:pageNumber/:pageSize', async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            const statement = ['ma', 'ten'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
            if (req.query.searchTerm) {
                condition = {
                    statement,
                    parameter: { searchText: `%${req.query.searchTerm.toLowerCase()}%` },
                };
            }
            const page = await app.model.dmDanToc.getPage(pageNumber, pageSize, condition, '*', 'ten');
            res.send({ page });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
};