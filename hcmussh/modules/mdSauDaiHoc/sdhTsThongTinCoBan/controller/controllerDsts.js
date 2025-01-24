module.exports = app => {
    const { PDFDocument } = require('pdf-lib');// print preview sau

    app.get('/api/sdh/dsts/page/:pageNumber/:pageSize', app.permission.check('sdhDsTs:write'), async (req, res) => {
        try {
            const pagenumber = parseInt(req.params.pageNumber),
                pagesize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            let filter = req.query.filter;
            let { maKyThi, sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            const page = await app.model.sdhTsThongTinCoBan.searchPage(pagenumber, pagesize, filter, searchTerm, maKyThi);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition: searchTerm, list } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/dsts/download-excel', app.permission.check('sdhDsTs:export'), async (req, res) => {
        try {
            const selectHeDaoTao = [{ id: 0, text: 'Trống' }, { id: 1, text: 'Chính quy' }, { id: 2, text: 'Không chính quy' }],
                selectLoaiTotNghiep = [{ id: 0, text: 'Trống' }, { id: 1, text: 'Trung bình' }, { id: 2, text: 'Trung bình khá' }, { id: 3, text: 'Khá' }, { id: 4, text: 'Giỏi' }, { id: 5, text: 'Xuất sắc' }];
            let filter = req.query.filter;
            filter = JSON.parse(filter);
            let { maKyThi, sort } = filter || {};
            filter = app.utils.stringify(app.clone(filter, { sortKey: sort?.split('_')[0], sortMode: sort?.split('_')[1] }));
            const page = await app.model.sdhTsThongTinCoBan.searchPage(1, 10000, filter, '', maKyThi);
            const { rows: list } = page;
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('DATA');
            ws.columns = [
                { header: 'STT', key: 'stt', width: 5 },
                { header: 'SBD', key: 'soBaoDanh', width: 15 },
                { header: 'TRẠNG THÁI', key: 'isXetDuyet', width: 15 },
                { header: 'HỌ', key: 'ho', width: 15 },
                { header: 'TÊN', key: 'ten', width: 15 },
                { header: 'MÃ NGÀNH', key: 'maNganh', width: 15 },
                { header: 'TÊN NGÀNH', key: 'tenNganh', width: 50 },
                { header: 'PHÂN HỆ', key: 'phanHe', width: 15 },
                { header: 'HÌNH THỨC', key: 'hinhThuc', width: 15 },
                { header: 'BỔ SUNG KIẾN THỨC', key: 'btkt', width: 15 },
                { header: 'NGÀY SINH', key: 'ngaySinh', width: 15, alignment: { vertical: 'middle' } },
                { header: 'GIỚI TÍNH', key: 'gioiTinh', width: 10 },
                { header: 'NGHỀ NGHIỆP', key: 'ngheNghiep', width: 15 },
                { header: 'ĐƠN VỊ', key: 'donVi', width: 30 },
                { header: 'NƠI SINH', key: 'noiSinh', width: 30 },
                { header: 'DÂN TỘC', key: 'danToc', width: 15 },
                { header: 'ĐỐI TƯỢNG ƯU TIÊN', key: 'doiTuongUuTien', width: 30 },
                { header: 'PHƯỜNG/XÃ', key: 'tenPhuongXa', width: 15 },
                { header: 'QUẬN/HUYỆN', key: 'tenQuanHuyen', width: 15 },
                { header: 'TỈNH/THÀNH PHỐ', key: 'tenTinhThanhPho', width: 30 },
                { header: 'SỐ NHÀ/ĐƯỜNG', key: 'soNhaDuong', width: 15 },
                { header: 'ĐIỆN THOẠI LIÊN LẠC', key: 'dienThoai', width: 15 },
                { header: 'EMAIL', key: 'email', width: 15 },
                { header: 'TRƯỜNG TN ĐH', key: 'truongTnDh', width: 15 },
                { header: 'NGÀNH TN ĐH', key: 'nganhTnDh', width: 15 },
                { header: 'NĂM TN ĐH', key: 'namTnDh', width: 15 },
                { header: 'HỆ ĐH', key: 'heDh', width: 15 },
                { header: 'ĐIỂM TB ĐH', key: 'diemDh', width: 15 },
                { header: 'XẾP LOẠI ĐH', key: 'xepLoaiDh', width: 15 },
                { header: 'TRƯỜNG TN THS', key: 'truongTnThs', width: 15 },
                { header: 'NGÀNH TN THS', key: 'nganhTnThs', width: 15 },
                { header: 'NĂM TN THS', key: 'namTnThs', width: 15 },
                { header: 'HỆ THS', key: 'heThs', width: 15 },
                { header: 'ĐIỂM TB THS', key: 'diemThs', width: 15 },
                { header: 'XẾP LOẠI THS', key: 'xepLoaiThs', width: 15 },
                { header: 'THI NGOẠI NGỮ', key: 'thiNgoaiNgu', width: 15 },
                { header: 'NGOẠI NGỮ', key: 'xtNgoaiNgu', width: 15 },
                { header: 'LOẠI CHỨNG CHỈ', key: 'loaiChungChi', width: 15 },
                { header: 'ĐIỂM CẤU TRÚC', key: 'diemCauTruc', width: 15 },
                { header: 'ĐIỂM NGHE', key: 'diemNghe', width: 15 },
                { header: 'ĐIỂM ĐỌC', key: 'diemDoc', width: 15 },
                { header: 'ĐIỂM NÓI', key: 'diemNoi', width: 15 },
                { header: 'ĐIỂM VIẾT', key: 'diemViet', width: 15 },
                { header: 'ĐIỂM CHỨNG CHỈ', key: 'diemChungChi', width: 15 },
                { header: 'MÃ CHỨNG CHỈ', key: 'maChungChi', width: 15 },
                { header: 'TÊN ĐỀ TÀI', key: 'tenDeTai', width: 15 },
                { header: 'GHI CHÚ', key: 'ghiChu', width: 15 },
                { header: 'NGÀY ĐĂNG KÝ', key: 'ngayDangKy', width: 15 },
            ];

            list.forEach((item, index) => {
                ws.addRow(
                    {
                        stt: index + 1, ...item, ngaySinh: app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy'),
                        gioiTinh: JSON.parse(item.gioiTinh)?.vi, isXetDuyet: item.isXetDuyet == 0 ? 'Chờ duyệt' : (item.isXetDuyet == 1 ? 'Duyệt' : 'Không duyệt'),
                        btkt: item.btkt ? 'CÓ' : 'KHÔNG',
                        noiSinh: item.noiSinhTinh || item.noiSinhQuocGia,
                        heThs: selectHeDaoTao.find(i => i.id == item.heThs)?.text || item.heThs || '',
                        heDh: selectHeDaoTao.find(i => i.id == item.heDh)?.text || item.heDh || '',
                        xepLoaiDh: selectLoaiTotNghiep.find(i => i.id == item.xepLoaiDh)?.text || item.xepLoaiDh || '',
                        xepLoaiThs: selectLoaiTotNghiep.find(i => i.id == item.xepLoaiThs)?.text || item.xepLoaiThs || '',
                        xtNgoaiNgu: item.ngoaiNgu || JSON.parse(item.listMonThi)?.map(i => i.tenMonThi).join(', '),
                        dienThoai: (item.dienThoai || '').toString(),
                        thiNgoaiNgu: item.ngoaiNgu ? 'Xét tuyển' : 'Thi Tuyển',
                        ngayDangKy: app.date.dateTimeFormat(new Date(Number(item.ngayDangKy)), 'dd/mm/yyyy')
                    }, index === 0 ? 'n' : 'i');
            });
            app.excel.attachment(workBook, res, 'SDH_DSTS.xlsx');
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/dsts/item/:id', app.permission.check('sdhDsTs:write'), async (req, res) => {
        try {
            let id = req.params.id;
            let dataCoBan = await app.model.sdhTsThongTinCoBan.get({ id });
            let [dataVanBang, ccnn, dknn, dataBaiBao, dataDeTai, dataCbhd, dataCongTrinhCbhd] = await Promise.all([
                app.model.sdhTsVanBang.get({ id }),
                app.model.sdhTsNgoaiNgu.get({ id }),
                app.model.sdhTsDangKyNgoaiNgu.get({ idThiSinh: id }),
                app.model.sdhTsBaiBao.getAll({ id }),
                app.model.sdhTsDeTai.get({ idThiSinh: id }),
                app.model.sdhTsCanBoHuongDan.getAll({ idThiSinh: id }),
                app.model.sdhTsCongTrinhCbhd.getAll({}),
            ]);
            if (dataCoBan.idDot) {
                let dataDot = await app.model.sdhTsInfoTime.get({ id: dataCoBan.idDot });
                for (const key in dataDot) {
                    if (key == 'id') continue;
                    else dataCoBan[key + 'Dot'] = dataDot[key];
                }
                if (dataCoBan.phanHe) {
                    let dataPhanHe = await app.model.sdhTsInfoPhanHe.get({ idDot: dataCoBan.idDot, maPhanHe: dataCoBan.phanHe });
                    if (dataPhanHe) {
                        for (const key in dataPhanHe) {
                            if (key == 'id') dataCoBan['idPhanHe'] = dataPhanHe[key];
                            else dataCoBan[key + 'Ph'] = dataPhanHe[key];
                        }
                        let dataHinhThuc = await app.model.sdhTsInfoHinhThuc.get({ idPhanHe: dataPhanHe.id });
                        if (dataHinhThuc) {
                            for (const key in dataPhanHe) {
                                if (key == 'id') dataCoBan['idHinhThuc'] = dataHinhThuc[key];
                                else dataCoBan[key + 'Ht'] = dataHinhThuc[key];
                            }
                        }
                    }
                }
            } if (dataDeTai) {
                dataBaiBao = dataBaiBao.map(item => {
                    const { id, idBaiBao, tenBaiBao, tenTapChi, diem, chiSo, ngayDang } = item;
                    const cvBaiBao = { idBaiBao, id, tenBaiBao, tenTapChi, diem, chiSo, ngayDang };
                    return cvBaiBao;

                });
                dataCbhd = dataCbhd.map(item => ({ ...item, idCbhd: item.id }));
                dataCongTrinhCbhd = dataCongTrinhCbhd.filter(i => dataCbhd.map(item => item.idCbhd.toString()).includes(i.idCbhd)).map(item => {
                    const { id: idBaiBao, idCbhd, ten, tenTapChi, diem, chiSo, ngayDang } = item;
                    const cvBaiBao = { idBaiBao, idCbhd, ten, tenTapChi, diem, chiSo, ngayDang };
                    return cvBaiBao;
                });
                dataDeTai = { idThiSinh: dataDeTai.idThiSinh, tenDeTai: dataDeTai.tenDeTai, dataBaiBao, dataCbhd, dataCongTrinhCbhd };
            }
            res.send({ item: { dataCoBan, dataVanBang, dataNgoaiNgu: { ccnn, dknn }, dataDeTai } });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/dsts/update', app.permission.orCheck('sdhDsTs:write', 'sdhTsUngVien:login', 'sdhTsThiSinh:login'), async (req, res) => {
        try {
            const { inData, changes } = req.body;
            const { dataCoBan, dataVanBang, dataNgoaiNgu, dataDeTai } = changes;

            if (dataCoBan) {
                if (!Array.isArray(inData)) {
                    if (dataCoBan.email) {
                        let isExist = await app.model.sdhTsThongTinCoBan.getAll({ email: dataCoBan.email, isXetDuyet: 1, phanHe: dataCoBan.phanHe, idDot: dataCoBan.idDot });
                        if (isExist && isExist.length) {
                            throw 'Email đã tồn tại trên hệ thống, vui lòng nhập email khác hoặc chỉnh sửa email đã tồn tại';
                        }
                    }
                    await app.model.sdhTsThongTinCoBan.update({ id: inData }, dataCoBan);
                    dataCoBan.hinhThuc && await app.model.sdhTsLichSuHinhThuc.update({ idThiSinh: inData, active: 1 }, { maHinhThuc: dataCoBan.hinhThuc });

                } else {
                    await Promise.all(inData.map(item => app.model.sdhTsThongTinCoBan.update({ id: item }, dataCoBan)));
                }
            }
            if (dataVanBang) {
                if (!Array.isArray(inData)) {
                    const id = inData;//idThiSinh
                    const item = await app.model.sdhTsVanBang.get({ id });
                    if (item) {
                        await app.model.sdhTsVanBang.update({ id }, dataVanBang);
                    } else {
                        await app.model.sdhTsVanBang.create({ id, ...dataVanBang });
                    }
                }
                //  else {
                //     const listId = inData.map(i => Number(i));
                //     const isSync = await app.model.sdhTsThongTinCoBan.getAll({
                //         statement: 'id in (:listId) and isXetDuyet != 1',
                //         parameter: { listId }
                //     });

                //     const items = await app.model.sdhTsVanBang.getAll({});
                //     await Promise.all([
                //         ...isSync.map(item => {
                //             if (items.find(i => i.id == item)) return app.model.sdhTsVanBang.update({ id: item }, dataVanBang);
                //             else return [];
                //             // else return app.model.sdhTsVanBang.create({ id: item, ...dataVanBang });
                //         })
                //     ]);

                // }
            }
            if (dataNgoaiNgu) {
                if (dataNgoaiNgu.ccnn) {
                    const item = await app.model.sdhTsNgoaiNgu.get({ id: inData });
                    if (item) {
                        app.model.sdhTsNgoaiNgu.update({ id: item.id }, { ...dataNgoaiNgu.ccnn });
                    } else {//id:idThiSinh
                        await app.model.sdhTsNgoaiNgu.create({ id: inData, ...dataNgoaiNgu.ccnn });
                    }
                }
                if (dataNgoaiNgu.dknn) {
                    const item = await app.model.sdhTsDangKyNgoaiNgu.get({ idThiSinh: inData });
                    if (item) {
                        app.model.sdhTsDangKyNgoaiNgu.update({ id: item.id }, { maMonThi: dataNgoaiNgu.dknn });
                    } else {
                        app.model.sdhTsDangKyNgoaiNgu.create({ idThiSinh: inData, maMonThi: dataNgoaiNgu.dknn });
                    }
                }
            }
            if (dataDeTai) {
                const { dataCbhd, tenDeTai, dataCongTrinhCbhd } = dataDeTai;
                if (tenDeTai) {
                    const saved = await app.model.sdhTsDeTai.get({ idThiSinh: inData });
                    if (saved) {
                        await app.model.sdhTsDeTai.update({ idThiSinh: inData }, { tenDeTai });

                    } else await app.model.sdhTsDeTai.create({ idThiSinh: inData, tenDeTai });

                }
                if (dataCbhd) {
                    if (inData == 'Temp') {
                        let _cbhd = await app.model.sdhTsCanBoHuongDan.create(dataCbhd);
                        if (_cbhd && _cbhd.id && dataCongTrinhCbhd.length)
                            await Promise.all(dataCongTrinhCbhd.map(item => {
                                const { ten, diem, ngayDang, chiSo, tenTapChi } = item;
                                const cv = { ten, diem, ngayDang, chiSo, tenTapChi, idCbhd: _cbhd.id };
                                return app.model.sdhTsCongTrinhCbhd.create(cv);
                            }));

                    } else {
                        await app.model.sdhTsCanBoHuongDan.update({ id: inData }, dataCbhd);
                    }
                }
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/dsts/update-multiple', app.permission.check('sdhDsTs:write'), async (req, res) => {
        try {
            const { list, changes } = req.body;
            const { dataCoBan } = changes;
            if (dataCoBan && list && list.length) {
                await Promise.all(list.map(item =>
                    app.model.sdhTsThongTinCoBan.update({ id: item.id }, dataCoBan)
                ));
                res.end();
            } else {
                if (!list.length) throw 'List rỗng';
                else throw 'Lỗi cập nhật';
            }
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.delete('/api/sdh/dsts/item', app.permission.check('sdhDsTs:delete'), async (req, res) => {
        try {
            const { id, item } = req.body;
            if (item.loaiChungChi) {
                await app.model.sdhTsNgoaiNgu.delete({ id, idCcnn: item.idCcnn });
            }
            if (item.tenBaiBao) {
                for (const props in item) {
                    if (item[props] == '' || item[props] == null)
                        delete item[props];
                }
                await app.model.sdhTsBaiBao.delete({ id, idBaiBao: item.idBaiBao });
            }
            if (item.tenDeTai) {
                await Promise.all([
                    app.model.sdhTsDeTai.delete({ idThiSinh: id, idDeTai: item.idDeTai }),
                    app.model.sdhDeTaiHuongDan.delete({ idDeTai: item.idDeTai })

                ]);
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/dsts/sbd/setting', app.permission.check('sdhTsSetting:read'), async (req, res) => {
        try {
            const data = await app.model.sdhTsSetting.getValue('sbdSetting');
            res.send({ data });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/dsts/sbd/setting', app.permission.check('sdhTsSetting:write'), async (req, res) => {
        try {
            const { changes } = req.body;
            const data = await app.model.sdhTsSetting.setValue({ sbdSetting: app.utils.stringify(changes) });
            res.send({ data });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/dsts/sbd/gen', app.permission.check('sdhDsTs:write'), async (req, res) => {
        try {
            const { id, changes } = req.body;
            const isExist = await app.model.sdhTsThongTinCoBan.get(changes);
            if (isExist && changes.sbd != null) throw 'Trùng số báo danh, vui lòng kiểm tra lại ';
            await app.model.sdhTsThongTinCoBan.update({ id }, changes);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/dsts/sbd/auto-gen', app.permission.check('sdhDsTs:write'), async (req, res) => {
        const posGen = (pos, data) => {
            const { items, numPos, startValue } = data;
            let values = [];
            if (pos == 'prefix') {
                let num = numPos;
                for (const item of items) {
                    if (item['maVietTatNganh'].length < num) {
                        const value = (item['maVietTatNganh'] + '0'.repeat(num)).slice(0, num);
                        values.push(value);
                    }
                    else {
                        const value = item['maVietTatNganh'].slice(0, num);
                        values.push(value);
                    }
                }
                return values;
            }

            else if (pos == 'postfix') {
                let list = app.clone(items);
                let listByNganh = list.groupBy('maNganh');
                for (const maNganh in listByNganh) {
                    listByNganh[maNganh] = listByNganh[maNganh].sort((a, b) => {
                        if (a.ten < b.ten) return -1;
                        else if (a.ten > b.ten) return 1;
                        else return 0;
                    });
                }
                list = Object.values(listByNganh)?.flat();
                let i = startValue;
                let num = numPos;
                for (const _item of list) {
                    const value = ('0'.repeat(num) + i).substr(-num);
                    values.push({ id: _item.id, value });
                    i++;
                }
                return values;
            }
        };
        try {
            let { items, sbdSetting, genNull } = req.body;
            const dot = await app.model.sdhTsInfoTime.get({ processing: 1 });
            const setting = typeof sbdSetting == 'string' ? app.utils.parse(sbdSetting) : sbdSetting;
            const { numPrefix, numPostfix, inValue, startValue } = setting;
            const [prefixV, postfixV] = genNull == 'false' ? await Promise.all([posGen('prefix', { items, numPos: numPrefix }), posGen('postfix', { items, numPos: numPostfix, startValue })]) : [null, null];
            const _items = items.map((item, index) => ({ id: item.id, sbd: genNull == 'false' ? prefixV[index] + (inValue[item.maPhanHe]) + postfixV.find(i => i.id == item.id)?.value : null }));
            for (const { id, sbd } of _items) {
                if (sbd != null) {
                    const isExist = await app.model.sdhTsThongTinCoBan.get({ sbd, idDot: dot.id });
                    if (isExist) throw 'Trùng số báo danh, vui lòng kiểm tra lại ';
                }
                await app.model.sdhTsThongTinCoBan.update({ id }, { sbd });
            }
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/dsts/delete', app.permission.check('sdhDsTs:delete'), async (req, res) => {
        try {
            const id = req.body.id || '';
            let [listDeTai, listCaThi] = await Promise.all([
                app.model.sdhTsDeTai.getAll({ idThiSinh: id }),
                app.model.sdhTsInfoCaThiThiSinh.getAll({ idThiSinh: id })
            ]);

            await Promise.all([
                app.model.sdhTsThongTinCoBan.delete({ id }),
                app.model.sdhTsVanBang.delete({ id }),
                app.model.sdhTsNgoaiNgu.delete({ id }),
                app.model.sdhTsBaiBao.delete({ id }),
                app.model.sdhTsDeTai.delete({ idThiSinh: id }),
                app.model.sdhTsInfoCaThiThiSinh.delete({ idThiSinh: id }),
                app.model.sdhTsDangKyNgoaiNgu.delete({ idThiSinh: id }),
                app.model.sdhTsDonPhucTra.delete({ idThiSinh: id }),
                ...listDeTai?.map(item => app.model.sdhDeTaiHuongDan.delete({ idDeTai: item.idDeTai })) || null,
                ...listCaThi?.map(item => app.model.sdhTsQuanLyDiem.delete({ idCaThi: item.id }) || null)
            ]);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.delete('/api/sdh/dsts/multi-delete', app.permission.check('sdhDsTs:delete'), async (req, res) => {
        try {
            const lst = req.body.lst;
            if (lst.length) {
                let listDeTai = await Promise.all(
                    lst.map(id => app.model.sdhTsDeTai.getAll({ idThiSinh: id })),
                );
                listDeTai = listDeTai.map(listc => listc.map(i => i.idDeTai));
                listDeTai = listDeTai.flat();
                await Promise.all(['sdhTsThongTinCoBan', 'sdhTsVanBang', 'sdhTsNgoaiNgu', 'sdhTsBaiBao', 'sdhTsDeTai', 'sdhTsDangKyNgoaiNgu', 'sdhTsDonPhucTra', 'sdhTsInfoCaThiThiSinh'].map(name => {
                    if (['sdhTsDeTai', 'sdhTsDangKyNgoaiNgu', 'sdhTsDonPhucTra', 'sdhTsInfoCaThiThiSinh'].includes(name))
                        return Promise.all([app.model[name].delete({
                            statement: 'idThiSinh IN (:lstId)',
                            parameter: { lstId: lst }
                        })]);
                    else return Promise.all([app.model[name].delete({
                        statement: 'id IN (:lstId)',
                        parameter: { lstId: lst }
                    }),
                    listDeTai.length ? app.model.sdhDeTaiHuongDan.delete({
                        statement: 'idDeTai IN (:lstId)',
                        parameter: { lstId: listDeTai }
                    }) : null]);
                }
                ));
            }

            res.end();
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/dsts/send-mail', app.permission.check('sdhDsTs:write'), async (req, res) => {
        try {
            const { data } = req.body;
            let { tieuDe, noiDung } = data;
            const emailTo = !app.isDebug ? data.emailTo : 'bao.tran133@hcmut.edu.vn';
            // const mailSetting = await app.model.sdhTsSetting.getValue('email', 'emailPassword');
            const mailSetting = { email: 'sdhtuyensinh@hcmussh.edu.vn', emailPassword: 'default' };
            let { email, emailPassword } = mailSetting || {};
            app.service.emailService.send(email, emailPassword, emailTo, null, null, (app.isDebug ? 'TEST: ' : '') + tieuDe, noiDung, '', null);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.post('/api/sdh/dsts/send-mail/multiple', app.permission.check('sdhDsTs:write'), async (req, res) => {
        try {
            const { data } = req.body;
            let { tieuDe, noiDung, bcc } = data;
            const emailTo = '';
            // const mailSetting = await app.model.sdhTsSetting.getValue('email', 'emailPassword');
            const mailSetting = { email: 'sdhtuyensinh@hcmussh.edu.vn', emailPassword: 'default' };
            let { email, emailPassword } = mailSetting || {};
            app.service.emailService.send(email, emailPassword, emailTo, null, bcc, (app.isDebug ? 'TEST: ' : '') + tieuDe, noiDung, '', null);
            res.end();
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });
    app.get('/api/sdh/ts/dsts/clear-log', app.permission.check('developer:login'), async (req, res) => {
        const source = app.path.join(__dirname, '/resources/uploadLog.txt');
        let logFile = app.fs.createWriteStream(source, { flags: 'w' }); //overwrite
        logFile.write('');
        logFile.end();
        res.end();
    });

    app.post('/api/sdh/ts/dsts/multiple', app.permission.check('sdhDsTs:write'), async (req, res) => {
        let { createData, fileName } = req.body;
        let logFile;
        let promiseDelete = [], promiseDeTai = [];
        const source = app.path.join(__dirname, '/resources/uploadLog.txt');
        const writeLog = (error) => {
            logFile = app.fs.createWriteStream(source, { flags: 'a' });
            logFile.write(`${String(new Date(Date.now()))}:\n ${error} \n`);
        };
        try {
            let uploadUser = {
                modifier: req.session.user.email,
                timeModified: Date.now(),
                ngayDangKy: Date.now(), //default 
            };
            const createdData = await Promise.all(createData.map(item => app.model.sdhTsThongTinCoBan.create({ ...item.dataCoBan, ...uploadUser })));
            let listMap = createdData.map(item => ({ id: item.id, email: item.email }));
            await Promise.all(listMap.map(_i => {
                let findItem = createData.find(item => item.dataCoBan.email == _i.email);
                return Promise.all([
                    app.model.sdhTsVanBang.create({ ...findItem?.dataVanBang, id: _i.id }, (error) => {
                        if (error) {
                            !promiseDelete.includes(_i.id) && promiseDelete.push(_i.id);
                            writeLog(`Lỗi tạo văn bằng: Line ${findItem?.line} \n ${app.utils.stringify(error)}\n`);
                        }
                    }),
                    findItem?.dataNgoaiNgu?.ccnn?.loaiChungChi ? app.model.sdhTsNgoaiNgu.create({ ...findItem?.dataNgoaiNgu?.ccnn, id: _i.id }, (error) => {
                        if (error) {
                            !promiseDelete.includes(_i.id) && promiseDelete.push(_i.id);
                            writeLog(`Lỗi tạo chứng chỉ ngoại ngữ: Line ${findItem?.line} \n ${app.utils.stringify(error)}\n`);
                        }
                    }) : [],
                    findItem?.dataNgoaiNgu?.dknn?.maMonThi ? app.model.sdhTsDangKyNgoaiNgu.create({ ...findItem?.dataNgoaiNgu?.dknn, idThiSinh: _i.id }, (error) => {
                        if (error) {
                            !promiseDelete.includes(_i.id) && promiseDelete.push(_i.id);
                            writeLog(`Lỗi đăng ký thi ngoại ngữ:${findItem?.line} \n ${app.utils.stringify(error)}\n`);
                        }
                    }) : [],
                    findItem?.dataDeTai?.tenDeTai ? app.model.sdhTsDeTai.create({ tenDeTai: findItem?.dataDeTai?.tenDeTai, idThiSinh: _i.id, ghiChu: findItem?.dataDeTai?.ghiChu }, (error, res) => {
                        if (error) {
                            !promiseDelete.includes(_i.id) && promiseDelete.push(_i.id);
                            writeLog(`Lỗi tạo đề tài: Line ${findItem?.line} \n ${app.utils.stringify(error)}\n`);
                        } else {
                            promiseDeTai.push({ ...findItem?.dataDeTai, idDeTai: res.idDeTai });
                        }
                    }) : [],
                    findItem?.dataBaiBao?.tenBaiBao ? app.model.sdhTsBaiBao.create({ tenBaiBao: findItem?.dataBaiBao?.tenBaiBao || '', idThiSinh: _i.id }) : []
                ]);
            }));
            let deleteDeTai = [], idDeTais = [];
            if (promiseDelete.length) {
                deleteDeTai = await app.model.sdhTsDeTai.getAll({ statement: 'idThiSinh in (:listId)', parameter: { listId: promiseDelete || [] } });
                idDeTais = deleteDeTai?.map(item => item.idDeTai);
                await Promise.all([
                    ...promiseDelete.map(id => Promise.all([
                        app.model.sdhTsThongTinCoBan.delete({ id }),
                        app.model.sdhTsVanBang.delete({ id }),
                        app.model.sdhTsNgoaiNgu.delete({ id }),
                        app.model.sdhTsDangKyNgoaiNgu.delete({ idThiSinh: id }),
                        app.model.sdhTsBaiBao.delete({ id }),
                    ])),
                    idDeTais ? app.model.sdhTsDeTai.delete({ statement: 'idDeTai in (:listId)', parameter: { listId: idDeTais } }) : '',
                    idDeTais ? app.model.sdhDeTaiHuongDan.delete({ statement: 'idDeTai in (:listId)', parameter: { listId: idDeTais } }) : '',

                ]);
            }
            if (promiseDeTai.length) {
                await Promise.all(promiseDeTai.map(item => {
                    if (idDeTais.includes(item.idDeTai)) return [];
                    else {
                        let { ghiChu, shccs, idDeTai } = item;
                        return Promise.all(shccs?.map(shcc => app.model.sdhDeTaiHuongDan.create({ idDeTai, shcc }, (error) => {
                            if (error) {
                                ghiChu = ghiChu + ',' + shcc;
                                return app.model.sdhTsDeTai.update({ idDeTai, ghiChu });
                            }
                        })) || []);
                    }
                }));
            }
            writeLog(`Kết thúc phiên upload ${fileName}`);
            logFile.end();
            app.io.to('sdhTsImportDsts').emit('sdh-create-dsts-data', { requester: req.session.user.email });
        } catch (error) {
            writeLog(`Lỗi hệ thống: ${error}`);
            logFile.end();
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.readyHooks.add('addSocketListener:ExportSdhDsts', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('ExportSdhDsts', socket => {
            const user = app.io.getSessionUser(socket);
            user && user.permissions.includes('sdhDsTs:export') && socket.join('ExportSdhDsts');
        }),
    });

    app.post('/api/sdh/dsts/export', app.permission.check('sdhDsTs:export'), async (req, res) => {
        try {
            res.end();
            const selectLoaiTotNghiep = { 1: 'Trung bình', 2: 'Trung bình khá', 3: 'Khá', 4: 'Giỏi', 5: 'Xuất sắc' };
            const selectHeDaoTao = { 1: 'Chính quy', 2: 'Không chính quy' };
            const exportDstsTuyenThangCaoHoc = async (filter) => {
                const outputFolder = app.path.join(app.assetPath, 'sdh', 'ouputFolder');
                app.fs.createFolder(outputFolder);
                const requester = req.session.user.email;
                const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh/dsts_tuyen_thang_ket_qua.docx');
                let writeData = {};
                const { rows, dataHeader } = await app.model.sdhTsThongTinCoBan.exportDstsTuyenThangCaoHoc(JSON.stringify(filter));
                [writeData.nam, writeData.dot] = dataHeader[0].maDot.split('-');
                writeData.dataThiSinh = rows.map(item => ({ ...item, ngaySinh: app.date.dateFormat(new Date(item.ngaySinh)), xepLoaiDh: selectLoaiTotNghiep[item.xepLoaiDh], heDh: selectHeDaoTao[item.heDh] }));
                const docxBuffer = await app.docx.generateFile(source, writeData);
                let filePath = app.path.join(outputFolder, `Danh_sach_tuyen_thang_${Date.now()}.docx`);
                app.fs.writeFileSync(filePath, docxBuffer);
                const pdfBuffer = await app.docx.toPdfBuffer(docxBuffer);

                return app.io.to('ExportSdhDsts').emit('export-du-tuyen-done', { buffer: pdfBuffer, fileName: `Danh sách tuyển_thẳng_cao_học_${dataHeader[0].maDot}`, requester, filePath });
            };
            let { type, phanHe, hinhThuc, idThiSinh, idDot, nganh } = req.body.data || { type: '', phanHe: '', hinhThuc: '', idThiSinh: '', nganh: '' };
            let filter = { phanHe, hinhThuc, mucThongKe: 'tkXetDuyet', dot: idDot, nganh };
            const skillMapper = [{ id: 'Listening', text: 'Nghe' }, { id: 'Speaking', text: 'Nói' }, { id: 'Reading', text: 'Đọc' }, { id: 'Writing', text: 'Viết' }];

            const mergePdfBuffers = async (pdfBuffers) => {
                try {
                    const mergedPdf = await PDFDocument.create();
                    for (const pdfBuffer of pdfBuffers) {
                        const pdfDoc = await PDFDocument.load(pdfBuffer);
                        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                        copiedPages.forEach((page) => {
                            mergedPdf.addPage(page);
                        });
                    }
                    const mergedBuffer = await mergedPdf.save();
                    return mergedBuffer;
                } catch (error) {
                    console.error('Error merging PDF buffers:', error);
                    throw error;
                }
            };
            if (type == 'phieu-bao-1') {
                const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh/phieu_bao_template.docx');
                let listPdfBuffer = [];
                let { rows: items } = await app.model.sdhTsThongTinCoBan.getTkDetail(app.utils.stringify(filter));
                const item = items.find(i => i.id == Number(idThiSinh));
                let { ho, ten, ngaySinh, gioiTinh, sbd, noiSinh = '', noiSinhQuocGia = '', tenTinhThanhPho, tenNganh, lichThiByMon, tenPhanHe, maDot } = item;
                const dataCoBan = {
                    hoTen: `${ho} ${ten}`,
                    gioiTinh: app.utils.parse(gioiTinh, { vi: '' }).vi,
                    ngaySinh: app.date.dateTimeFormat(new Date(Number(ngaySinh)), 'dd/mm/yyyy'),
                    sbd, noiSinh, tenNganh, noiSinhQuocGia, tenTinhThanhPho
                };
                const dataLichThi = { diaDiemThi: [], thoiGianThi: [] };
                lichThiByMon = app.utils.parse(lichThiByMon);
                lichThiByMon = lichThiByMon.sort((a, b) => a.loaiMonThi < b.loaiMonThi ? -1 : 1);
                let isCCNN = await app.model.sdhTsNgoaiNgu.getAll({ id: filter.id });
                for (let { loaiMonThi, lichThiList } of lichThiByMon) {
                    let lichThiKyNang = lichThiList.filter(item => item.kyNang),
                        common = lichThiList.filter(item => !item.kyNang);
                    if (common.length) {
                        for (let item of common) {
                            let diaChiThi = app.utils.parse(item.diaDiemThi || '', { vi: '10-12 Đinh Tiên Hoàng, P.Bến Nghé, Quận 1, TP. HCM' })?.vi;
                            dataLichThi.diaDiemThi.push(`- Môn ${loaiMonThi}: ${diaChiThi}`);
                            dataLichThi.thoiGianThi.push(`- Môn ${item.maMonThi == 'XHS' ? 'Bài luận' : loaiMonThi}: ${item.tenMon}, ${app.date.viTimeFormat(new Date(Number(item.ngayThi)))} ${app.date.dateFormat(new Date(Number(item.ngayThi)), 'dd/mm/yyyy')}, Phòng ${item.phongThi} `);
                        }
                    } else {
                        if (!isCCNN.length) {
                            dataLichThi.diaDiemThi.push(`- Môn ${loaiMonThi}`);
                            dataLichThi.thoiGianThi.push(`- Môn ${loaiMonThi}`);
                            for (let kyNang of lichThiKyNang) {
                                let diaChiThi = app.utils.parse(kyNang.diaDiemThi || '', { vi: '10-12 Đinh Tiên Hoàng, P.Bến Nghé, Quận 1, TP. HCM' })?.vi;
                                dataLichThi.diaDiemThi.push(`+ ${skillMapper.find(item => item.id == kyNang.kyNang)?.text}: ${diaChiThi}`);
                                dataLichThi.thoiGianThi.push(`+ ${skillMapper.find(item => item.id == kyNang.kyNang)?.text}: ${app.date.viTimeFormat(new Date(Number(kyNang.ngayThi)))} ${app.date.dateFormat(new Date(Number(kyNang.ngayThi)), 'dd/mm/yyyy')}, Phòng ${kyNang.phongThi} `);
                            }
                        }
                    }
                }
                if (isCCNN.length) {
                    dataLichThi.diaDiemThi.push('- Môn Ngoại ngữ: Xét tuyển');
                    dataLichThi.thoiGianThi.push('- Môn Ngoại ngữ: Xét tuyển');
                }
                let data = {
                    phanHe: tenPhanHe?.toUpperCase(),
                    tenDot: `${maDot?.slice(-1) || ''}`,
                    nam: `${maDot?.slice(0, 4) || ''}`,
                    ...dataCoBan,
                    diaDiemThi: dataLichThi.diaDiemThi.join('\n'),
                    lichThi: dataLichThi.thoiGianThi.join('\n'),
                };
                const docxBuffer = await app.docx.generateFile(source, { a: [data] });
                const pdfBuffer = await app.docx.toPdfBuffer(docxBuffer);

                listPdfBuffer.push(pdfBuffer);
                const requester = req.session?.user?.email;

                app.io.to('ExportSdhDsts').emit('export-phieu-bao-1-done', { buffer: pdfBuffer, fileName: `PHIEU_BAO_${item.sbd}`, requester });
            }
            if (type == 'phieu-bao-dot') {
                const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh/phieu_bao_template.docx');
                let { rows: items } = await app.model.sdhTsThongTinCoBan.getTkDetail(app.utils.stringify(filter));
                items = items.filter(item => Array.isArray(app.utils.parse(item.lichThiByMon)) && app.utils.parse(item.lichThiByMon).length);
                // let listPdfBuffer = [];
                const tenDot = `${items[0]?.maDot?.slice(-1) || ''}`;
                let index = 0;
                let numberFile = items.length;
                const requester = req.session.user.email;
                let finalData = [];
                for (const item of items) {
                    let { ho, ten, ngaySinh, gioiTinh, sbd, noiSinh = '', noiSinhQuocGia = '', tenTinhThanhPho, tenNganh, lichThiByMon, tenPhanHe, maDot } = item;
                    const dataCoBan = {
                        hoTen: `${ho} ${ten}`,
                        gioiTinh: app.utils.parse(gioiTinh, { vi: '' }).vi,
                        ngaySinh: app.date.dateTimeFormat(new Date(Number(ngaySinh)), 'dd/mm/yyyy'),
                        sbd, noiSinh, tenNganh, noiSinhQuocGia, tenTinhThanhPho
                    };
                    const dataLichThi = { diaDiemThi: [], thoiGianThi: [] };
                    lichThiByMon = app.utils.parse(lichThiByMon);
                    lichThiByMon = lichThiByMon.sort((a, b) => a.loaiMonThi < b.loaiMonThi ? -1 : 1);
                    let isCCNN = await app.model.sdhTsNgoaiNgu.getAll({ id: item.id });
                    for (let { maMonThi, loaiMonThi, lichThiList } of lichThiByMon) {
                        let lichThiKyNang = lichThiList.filter(item => item.kyNang),
                            common = lichThiList.filter(item => !item.kyNang);
                        if (common.length) {
                            for (let item of common) {
                                let diaChiThi = app.utils.parse(item.diaDiemThi || '', { vi: '10-12 Đinh Tiên Hoàng, P.Bến Nghé, Quận 1, TP. HCM' })?.vi;
                                dataLichThi.diaDiemThi.push(`- Môn ${loaiMonThi}: ${diaChiThi}`);
                                dataLichThi.thoiGianThi.push(`- Môn ${(maMonThi == 'XHS') ? 'Bài luận' : (loaiMonThi)}: ${maMonThi == 'XHS' || maMonThi == 'VD' ? '' : (item.tenMon + ',')} ${app.date.viTimeFormat(new Date(Number(item.ngayThi)))} ${app.date.dateFormat(new Date(Number(item.ngayThi)), 'dd/mm/yyyy')}, Phòng ${item.phongThi}`);
                            }
                        } else {
                            if (!isCCNN.length) {
                                dataLichThi.diaDiemThi.push(`- Môn ${loaiMonThi}`);
                                dataLichThi.thoiGianThi.push(`- Môn ${loaiMonThi}`);
                                for (let kyNang of lichThiKyNang) {
                                    let diaChiThi = app.utils.parse(kyNang.diaDiemThi || '', { vi: '10-12 Đinh Tiên Hoàng, P.Bến Nghé, Quận 1, TP. HCM' })?.vi;
                                    dataLichThi.diaDiemThi.push(`+ ${skillMapper.find(item => item.id == kyNang.kyNang)?.text}: ${diaChiThi}`);
                                    dataLichThi.thoiGianThi.push(`+ ${skillMapper.find(item => item.id == kyNang.kyNang)?.text}: ${app.date.viTimeFormat(new Date(Number(kyNang.ngayThi)))} ${app.date.dateFormat(new Date(Number(kyNang.ngayThi)), 'dd/mm/yyyy')}, Phòng ${kyNang.phongThi}`);
                                }
                            }
                        }
                    }
                    if (isCCNN.length) {
                        dataLichThi.diaDiemThi.push('- Môn Ngoại ngữ: Xét tuyển');
                        dataLichThi.thoiGianThi.push('- Môn Ngoại ngữ: Xét tuyển');
                    }
                    let data = {
                        phanHe: tenPhanHe?.toUpperCase(),
                        tenDot: `${maDot?.slice(-1) || ''}`,
                        nam: `${maDot?.slice(0, 4) || ''}`,
                        ...dataCoBan,
                        diaDiemThi: dataLichThi.diaDiemThi.join('\n'),
                        lichThi: dataLichThi.thoiGianThi.join('\n'),
                    };
                    finalData.push(data);
                    // listPdfBuffer.push(pdfBuffer);
                    index++;
                    app.io.to('ExportSdhDsDanPhong').emit('export-phieu-bao-dot-process', { process: `${((index / numberFile) * 100).toFixed(2)}%`, requester });
                }
                // const a = [data, { ...data, phanHe: 'ABC' }];
                const docxBuffer = await app.docx.generateFile(source, { a: finalData });
                const pdfBuffer = await app.docx.toPdfBuffer(docxBuffer);
                // const buffer = await mergePdfBuffers(listPdfBuffer);
                // app.fs.writeFileSync(app.path.join(app.assetPath, 'sdh', 'test.pdf'), buffer);
                app.io.to('ExportSdhDsts').emit('export-phieu-bao-dot-done', { buffer: pdfBuffer, fileName: `PHIEU_BAO_DOT_${tenDot}`, requester });
            }
            if (type == 'du-tuyen') {
                if (hinhThuc == '03') {
                    return exportDstsTuyenThangCaoHoc({ hinhThuc, phanHe, dot: idDot });
                }
                const requester = req.session.user.email;
                const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh/sdh-ts-ds-du-tuyen-template.docx');
                let filter = { mucThongKe: 'tkXetDuyet', phanHe, hinhThuc };
                let { rows: items } = await app.model.sdhTsThongTinCoBan.getTkDetail(app.utils.stringify(filter));
                const objectNganh = items.groupBy('idNganh');
                let pdfBuffer = '', listPdfBuffer = [];
                let count = 1;
                let { tenPhanHe = '', maDot = '', tenHinhThuc = '' } = items[0] ? items[0] : {};
                let writeData = {
                    hinhThuc: tenHinhThuc?.toUpperCase(),
                    phanHe: tenPhanHe?.toUpperCase(),
                    tenDot: `ĐỢT ${maDot?.slice(-1)} NĂM ${maDot?.slice(0, 4)}`,
                    nam: maDot.split('-')[0],
                    dot: maDot.split('-')[1],
                    total: items.length,
                };
                const dataNganh = [];
                for (const key in objectNganh) {
                    const listThiSinh = objectNganh[key];
                    const { tenNganh = '' } = listThiSinh[0];
                    const nganh = {
                        tenNganh: tenNganh?.normalizedName(),
                        dataThiSinh: listThiSinh.map((_item, index) => {
                            let { ho, ten, sbd, gioiTinh, noiSinh, ngaySinh, nganhTnDh, btkt, dknn, doiTuongUuTien, ccnn, ghiChuTTCB, ghiChuCCNN } = _item;
                            ngaySinh = new Date(ngaySinh);
                            ngaySinh = app.date.dateFormat(ngaySinh);
                            return {
                                R: index + count,
                                hoTen: `${ho} ${ten}`,
                                ngaySinh: app.date.dateFormat(new Date(ngaySinh)),
                                gioiTinh: app.utils.parse(gioiTinh)?.vi,
                                sbd, noiSinh, nganhTnDh, dknn, doiTuongUuTien, ccnn,
                                ghiChu: `${ghiChuTTCB || ''}  ${ghiChuCCNN || ''}`,
                                btkt: btkt == 1 ? String.fromCharCode(0x2611) : String.fromCharCode(0x2610),
                            };
                        })
                    };
                    nganh.tenNganh && dataNganh.push(nganh);
                    count += listThiSinh.length;
                    // app.io.to('ExportSdhDsts').emit('export-phieu-bao-dot-process', { process: `${((count / items.length) * 100).toFixed(2)}%`, requester });
                }
                writeData.nganh = dataNganh;
                const docxBuffer = await app.docx.generateFile(source, writeData);
                pdfBuffer = await app.docx.toPdfBuffer(docxBuffer);
                listPdfBuffer.push(pdfBuffer);
                const buffer = listPdfBuffer.length != 1 ? await mergePdfBuffers(listPdfBuffer) : pdfBuffer;
                app.io.to('ExportSdhDsts').emit('export-du-tuyen-done', { buffer, fileName: `Danh sách dự tuyển ${items[0]?.maDot || ''}`, requester });
                //            let { rows: items } = await app.model.sdhTsThongTinCoBan.getTkDetail(app.utils.stringify(filter));

            }
        } catch (error) {
            console.error(req.method, req.url, error);
            res.send({ error });
        }
    });

    // app.get('/api/sdh/dsts/tuyen-thang/cao-hoc/export/excel', app.permission.check('sdhDsTs:export'), async (req, res) => {
    //     try {
    //         let filter = req.query.filter;
    //         console.log(filter);
    //         const { rows, dataHeader } = await app.model.sdhTsThongTinCoBan.exportDstsTuyenThangCaoHoc(filter);
    //         [dataHeader.nam, dataHeader.dot] = dataHeader[0].maDot.split('-');
    //         let cells = [];
    //         const source = app.path.join(app.assetPath, 'sdh/tuyen-sinh/DSTS_tuyen_thang_ket_qua.xlsx');
    //         const workBook = await app.excel.readFile(source);
    //         const worksheet = workBook.getWorksheet(1);
    //         let hoiDong = (worksheet.getCell('A3').value || '').toString().trim();
    //         let title = (worksheet.getCell('A6').value).toString().trim();
    //         let total = (worksheet.getCell('B11').value || '').toString().trim();
    //         let ngayThang = (worksheet.getCell('H11').value || '').toString().trim();
    //         [hoiDong, title, total, ngayThang] = app.utils.fillCells([hoiDong, title, total, ngayThang], dataHeader);

    //         cells = cells.concat([
    //             { cell: 'A3', value: hoiDong, font: { size: '12' }, bold: true },
    //             { cell: 'A6', value: title, font: { size: '14' }, bold: true },
    //         ]);
    //         let count = 9;
    //         rows.forEach((item, index) => {
    //             cells = cells.concat([
    //                 { cell: 'A' + (9 + index), value: 9 + index, border: '1234' },
    //                 { cell: 'B' + (9 + index), value: item.tenNganh || '', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }, border: '1234' },
    //                 { cell: 'C' + (9 + index), value: item.ho || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'D' + (9 + index), value: item.ten || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'E' + (9 + index), value: JSON.parse(item.gioiTinh).vi || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'F' + (9 + index), value: app.date.dateTimeFormat(new Date(Number(item.ngaySinh)), 'dd/mm/yyyy') || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'G' + (9 + index), value: item.noiSinh || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'H' + (9 + index), value: item.truongTnDh || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'I' + (9 + index), value: item.namTnDh || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'J' + (9 + index), value: item.nganhTnDh || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'K' + (9 + index), value: item.xepLoaiDh || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'L' + (9 + index), value: item.diemDh || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'M' + (9 + index), value: item.heDh || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'N' + (9 + index), value: item.ngoaiNgu ? 'XT ngoại ngữ' : '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'O' + (9 + index), value: '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //                 { cell: 'P' + (9 + index), value: item.ghiChu || '', border: '1234', alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } },
    //             ]);
    //             count += 1;
    //         });
    //         console.log(count);
    //         cells = cells.concat([
    //             { cell: 'B' + count, value: total, font: { size: '12' }, bold: true },
    //             { cell: 'H' + count, value: ngayThang, font: { size: '13' }, bold: true }
    //         ]);
    //         console.log(cells);
    //         const newWorkBook = app.excel.create();
    //         const newWorksheet = workBook.addWorksheet('DATA');
    //         app.excel.write(newWorksheet, cells);
    //         app.excel.attachment(newWorkBook, res, 'SDH_DSTS_TUYEN_THANG.xlsx');
    //         //            let { rows: items } = await app.model.sdhTsThongTinCoBan.getTkDetail(app.utils.stringify(filter));
    //     } catch (error) {
    //         console.error(req.method, req.url, error);
    //         res.send({ error });
    //     }
    // });
    //--------------Hook-----------------
    app.uploadHooks.add('sdhTsImportDsts', (req, fields, files, params, done) => {
        app.permission.has(req, () => sdhTsDstsImportData(req, fields, files, params, done), done, 'sdhDsTs:write');
    });
    app.readyHooks.add('addSocketListener:sdhTsImportDsts', {
        ready: () => app.io && app.io.addSocketListener,
        run: () => app.io.addSocketListener('sdhTsImportDsts', socket => {
            const user = app.io.getSessionUser(socket);
            if (user && user.permissions.includes('sdhDsTs:import')) {
                socket.join('sdhTsImportDsts');
            }
        }),
    });


    const sdhTsDstsImportData = async (req, fields, files, params, done) => {

        try {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'sdhTsImportDsts' && files.sdhTsDstsFile && files.sdhTsDstsFile.length > 0) {
                done({});
                const srcPath = files.sdhTsDstsFile[0].path;
                const { phanHe, hinhThuc, idDot, idPhanHe } = app.utils.parse(params.filter);
                if (!(phanHe && hinhThuc)) {
                    return app.io.to('sdhTsImportDsts').emit('sdh-import-dsts-error', { requester: req.session.user.email, error: 'Xin vui lòng chọn phân hệ và hình thức' });
                }
                let workbook = await app.excel.readFileSync(srcPath);
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), element = [];
                    const totalRow = worksheet.lastRow.number - 1;

                    let fileName = files.sdhTsDstsFile[0]?.originalFilename;

                    const dataStruc = [];
                    const falseItem = [];
                    const createItem = [];
                    const source = app.path.join(__dirname, '/resources/uploadLog.txt');
                    let logFile;
                    const writeLog = (error) => {
                        logFile = app.fs.createWriteStream(source, { flags: 'a' });
                        logFile.write(`${String(new Date(Date.now()))}:\n ${error} \n`);
                    };
                    const getDataVanBang = (item) => {
                        try {
                            const dataVanBang = {
                                truongTnDh: item.truongTn,
                                nganhTnDh: item.nganhTn,
                                namTnDh: item.namTn,
                                heDh: item.heDaoTao,
                                diemDh: item.diemTB,
                                xepLoaiDh: item.xepLoaiTn,
                            };
                            return [true, dataVanBang];
                        } catch (error) {
                            writeLog(`Lỗi lấy data văn bằng: Line ${item.line} \n ${error}`);
                            return [false, { ...item, ghiChuErr: 'Lỗi lấy data văn bằng' }];
                        }
                    };
                    const getDataNgoaiNgu = async (item) => {
                        try {
                            let monThiNgoaiNgu = item.ngoaiNgu && item.ngoaiNgu.includes('XT') ? '' : item.ngoaiNgu;
                            let { loaiChungChi, maChungChi, diemChungChi, donViCap, ghiChu } = item;
                            const ccnn = { loaiChungChi, maChungChi, diemChungChi, donViCap, ghiChu, isXetDuyet: 1 };
                            let ghiChuMapper = ['Anh', 'Nhật', 'Nga', 'Hàn', 'Trung', 'Pháp', 'Đức', 'Việt'];
                            let ngoaiNgu = '';
                            ghiChuMapper.some(item => {
                                if (ghiChu.includes(item)) { ngoaiNgu = 'Tiếng ' + item; return true; }
                                if (ghiChu.includes('TQ')) { ngoaiNgu = 'Tiếng Trung'; return true; }
                            });
                            if (loaiChungChi) {
                                ccnn.diemChungChi = diemChungChi ? Number(diemChungChi) : '';
                                let loai = await app.model.sdhLoaiChungChiNgoaiNgu.get({
                                    statement: 'lower(loaiChungChi) LIKE :loaiChungChi',
                                    parameter: { loaiChungChi: `%${loaiChungChi.trim().toLowerCase()}%` }
                                });
                                if (loai) {
                                    ['diemChungChi', 'diemNghe', 'diemNoi', 'diemDoc', 'diemCauTruc'].forEach(i => ccnn[i] = Number(item[i]));
                                    ccnn.ngoaiNgu = loai.ngonNgu ? loai.ngonNgu : ngoaiNgu;
                                } else throw `Không tìm thấy loại chứng chỉ trong hệ thống:${loaiChungChi}, vui lòng thêm mới loại chứng chỉ và cập nhật lại`;

                            }
                            const dknn = {};
                            if (monThiNgoaiNgu) {
                                let mon = await app.model.sdhMonThiTuyenSinh.get({
                                    statement: 'ten LIKE :monThi',
                                    parameter: { monThi: `%${monThiNgoaiNgu}%` }
                                });
                                if (mon && mon.ma) dknn.maMonThi = mon?.ma;
                                else throw `Không tìm thấy mã môn thi: ${monThiNgoaiNgu}`;

                            }
                            return [true, { ccnn, dknn }];
                        } catch (error) {
                            writeLog(`Lỗi lấy data ngoại ngữ: Line ${item.line} \n ${error}`);
                            return [false, { ...item, ghiChuErr: 'Lỗi lấy data ngoại ngữ' }];
                        }

                    };
                    const getDataDeTai = async (item) => {
                        try {
                            let { tenDeTai, cbhd, line } = item, ghiChu = [], shccs = [];
                            if (tenDeTai) {
                                let listHoTen = cbhd?.trim().split(',').join(';').split(';');
                                listHoTen = listHoTen.map(item => {
                                    let rs = item.split('.').slice(-1)[0].trim();
                                    ['PGS', 'TS', 'Ths', 'GS'].map(i => {
                                        if (rs.includes(i)) rs = rs.split(i).slice(-1)[0];
                                        return rs;
                                    });
                                    return rs.trim();
                                });//split chức danh học vị
                                for (const hoTen of listHoTen) {
                                    let items = await app.model.tchcCanBo.getAll({});
                                    let dbShcc = items?.map(item => ({ hoTen: `${item.ho} ${item.ten}`, shcc: item.shcc })).find(item => item.hoTen?.toLowerCase() == hoTen?.trim().toLowerCase());
                                    if (dbShcc && dbShcc.shcc) shccs.push(dbShcc.shcc);
                                    else {
                                        writeLog(`Không tìm thấy cán bộ hướng dẫn trong hệ thống:${line} - ${hoTen}`);
                                        ghiChu.push(hoTen);
                                    }
                                }
                                if (!listHoTen.length) throw `Không tìm thấy bất kỳ cán bộ hướng dẫn: ${line}`;
                            }
                            return [true, { tenDeTai, shccs, ghiChu: ghiChu.join(', ') }];
                        } catch (error) {
                            writeLog(`Lỗi lấy data đề tài: Line: ${item.line} \n ${error}`);
                            return [false, { ...item, ghiChuErr: 'Lỗi lấy data đề tài' }];
                        }

                    };
                    const getDataBaiBao = (item) => {
                        let { tenBaiBao } = item;
                        return { tenBaiBao };
                    };
                    const getDiaChi = async (item) => {
                        try {
                            let { hoTen, line } = item;

                            let rawDiaChi = item.diaChiLienLac.toLowerCase(), rawNoiSinh = item.noiSinh.toLowerCase();
                            rawDiaChi = rawDiaChi.split('.').join(' ')
                                .replace('tphcm', 'tp hcm')
                                .replace('hcm', 'hồ chí minh')
                                .replace('hn', 'hà nội')
                                .replace('tp ', 'thành phố ')
                                .replaceAll(' p ', ' phường ')
                                .replaceAll(' q ', ' quận ')
                                .replaceAll(' h ', ' huyện ')
                                .replaceAll(' tt ', ' thị trấn ')
                                .replaceAll(' tdm ', ' thủ dầu một ');
                            rawNoiSinh = rawNoiSinh.replaceAll('hcm', 'hồ chí minh').replaceAll('tp', '').replace('nha trang')
                                .split(' - ').join(' ').split('.').join('').trim();
                            // rawNoiSinh = app.toEngWord(rawNoiSinh);
                            rawDiaChi = rawDiaChi.split(', ');
                            let tinhTp = rawDiaChi.find(item => item.includes('tỉnh') || item.includes('thành phố')) || rawDiaChi.slice(-1)[0],
                                quanHuyen = rawDiaChi.find(item => item.includes('quận') || item.includes('huyện')),
                                phuongXa = rawDiaChi.find(item => item.includes('phường') || item.includes('xã') || ''),
                                maTinhThanhPho, maQuanHuyen, maPhuongXa, noiSinh;

                            let [dbTinhThanhPho, dbQuocGia] = await Promise.all([
                                app.model.dmTinhThanhPho.getAll({}),
                                app.model.dmQuocGia.getAll({}),

                            ]);
                            let dbQuanHuyen, dbPhuongXa, soNha;

                            let findNoiSinh = dbTinhThanhPho.map(item => ({ ...item, ten: app.toEngWord(item.ten.split(' - ')?.join(' ')?.toLowerCase()?.trim()) })).find(item => item.ten.includes(app.toEngWord(rawNoiSinh)));
                            if (findNoiSinh) noiSinh = findNoiSinh.ma;
                            else {
                                noiSinh = dbQuocGia.find(item => rawNoiSinh.trim()?.toLowerCase().includes(item.tenKhac?.trim().toLowerCase()))?.maCode;
                            }
                            let findTinhTp = dbTinhThanhPho.map(item => ({ ...item, ten: app.toEngWord(item.ten.split(' - ')?.join(' ')?.toLowerCase()?.trim()) })).find(item => item.ten.includes(app.toEngWord(tinhTp?.trim())));


                            if (findTinhTp) {
                                //case có kèm tỉnh tp
                                maTinhThanhPho = findTinhTp.ma;
                                soNha = rawDiaChi.slice(0, rawDiaChi.length - 3).join(' ');
                                dbQuanHuyen = await app.model.dmQuanHuyen.get({
                                    statement: 'lower(tenQuanHuyen) LIKE :quanHuyen',
                                    parameter: { quanHuyen: `%${quanHuyen?.trim()?.toLowerCase() || rawDiaChi.slice(-2)[0]?.trim()?.toLowerCase()}%` }
                                });

                                dbPhuongXa = dbQuanHuyen ? await app.model.dmPhuongXa.get({
                                    statement: 'lower(tenPhuongXa) LIKE  :phuongXa and maQuanHuyen = :maQuanHuyen',
                                    parameter: { phuongXa: `%${phuongXa?.trim()?.toLowerCase() || rawDiaChi.slice(-3)[0]?.trim()?.toLowerCase()}%`, maQuanHuyen: dbQuanHuyen?.maQuanHuyen || '' }
                                }) : '';
                            } else {
                                //case  ko có kèm tỉnh do đa số địa chỉ ở tphcm
                                maTinhThanhPho = 79;//default tphcm
                                soNha = rawDiaChi.slice(0, rawDiaChi.length - 2).join(' ');

                                dbQuanHuyen = await app.model.dmQuanHuyen.get({
                                    statement: 'lower(tenQuanHuyen) LIKE :quanHuyen',
                                    parameter: { quanHuyen: `%${quanHuyen?.trim()?.toLowerCase() || rawDiaChi.slice(-1)[0]?.trim()?.toLowerCase()}%` }
                                });

                                dbPhuongXa = dbQuanHuyen ? await app.model.dmPhuongXa.get({
                                    statement: 'lower(tenPhuongXa) LIKE  :phuongXa and maQuanHuyen = :maQuanHuyen',
                                    parameter: { phuongXa: `%${phuongXa?.trim()?.toLowerCase() || rawDiaChi.slice(-2)[0]?.trim()?.toLowerCase()}%`, maQuanHuyen: dbQuanHuyen?.maQuanHuyen || '' }
                                }) : '';

                            }
                            maQuanHuyen = dbQuanHuyen?.maQuanHuyen || '';
                            maPhuongXa = dbPhuongXa?.maPhuongXa || '';
                            let res = { soNha, maTinhThanhPho, maQuanHuyen, maPhuongXa, noiSinh };
                            for (let key in res) {
                                if (!res[key]) {
                                    if (key == 'noiSinh') {
                                        writeLog(`Không tìm thấy nơi sinh: Line ${line} - ${hoTen} - Nơi sinh nên là tên tỉnh/thành phố trực thuộc TW hoặc tên tiếng Việt của quốc gia trong danh mục`);
                                        throw `Không tìm thấy nơi sinh: Line ${line} - ${hoTen} - Nơi sinh nên là tên tỉnh/thành phố trực thuộc TW hoặc tên tiếng Việt của quốc gia trong danh mục`;
                                    }
                                    else {
                                        writeLog(`Không tìm thấy ${key} trong hệ thống:${line} - ${hoTen} - ${res[key]} - `);
                                    }
                                }
                            }
                            return [true, { soNha, maTinhThanhPho, maQuanHuyen, maPhuongXa, noiSinh }];
                        } catch (error) {
                            writeLog(`Lỗi lấy data địa chỉ: Line: ${item.line} \n ${error}`);
                            return [false, { ...item, ghiChuErr: 'Lỗi lấy thông tin nơi sinh' }];
                        }
                    };
                    writeLog(`Phiên upload ${fileName}`);

                    const handleUpload = async (index = 2) => {
                        const value = worksheet.getRow(index).values;

                        if (value.length == 0 || !value[1] || index == totalRow + 1) {
                            app.fs.deleteFile(srcPath);
                            writeLog(`Kết thúc phiên upload ${fileName}`);
                            logFile.end();
                            return app.io.to('sdhTsImportDsts').emit('sdh-import-dsts-done', { requester: req.session.user.email, createItem, falseItem, createData: dataStruc, index: index - 1, fileName });
                            // done({ data: dataStruc, createItem, falseItem });
                        } else {
                            (index - 2) % 10 == 0 && app.io.to('sdhTsImportDsts').emit('sdh-import-dsts-one', { requester: req.session.user.email, createItem, falseItem, index: index - 2 });
                            let item = {
                                line: index,
                                ngoaiNgu: value[2]?.trim().includes('Anh') ? 'Tiếng Anh' : value[2]?.trim(),
                                tenNganh: value[3]?.trim(),
                                hoTen: value[4]?.trim() ?? '',
                                gioiTinh: value[5]?.trim(),
                                ngaySinh: String(value[6]) ? new Date(String(value[6]).split('/')[2], Number(String(value[6]).split('/')[1]) - 1, String(value[6]).split('/')[0]).getTime() : '',
                                noiSinh: value[7]?.trim(),
                                truongTn: value[8]?.trim(),
                                namTn: value[9],
                                nganhTn: value[10]?.trim(),
                                xepLoaiTn: value[11]?.trim(),
                                diemTB: (value[12]) || '',
                                heDaoTao: value[13],
                                nganhTnThs: value[14]?.trim() || '',
                                cbhd: value[15]?.trim() || '',
                                tenDeTai: value[16]?.trim() || '',
                                ngheNghiep: value[17]?.trim() || '',
                                donVi: value[18]?.trim() || '',
                                ngayCongTac: value[19] || '',
                                diaChiLienLac: value[20]?.trim() || '',
                                email: value[21]?.trim() || '',
                                dtCq: value[22]?.trim() || '',
                                dtNha: value[23]?.trim() || '',
                                dienThoai: value[24] || '',
                                doiTuongUuTien: value[25]?.trim() || '',
                                loaiChungChi: value[26]?.trim() || '',
                                diemChungChi: value[27] || '',
                                donViCap: value[28]?.trim() || '',
                                ngayCap: String(value[29]) ? new Date(String(value[29]).split('/')[2], Number(String(value[29]).split('/')[1]) - 1, String(value[29]).split('/')[0]).getTime() : '',
                                diemNghe: value[30] || '',
                                diemNoi: value[31] || '',
                                diemDoc: value[32] || '',
                                diemCauTruc: value[33] || '',
                                maChungChi: value[34]?.trim() || '',
                                ghiChu: value[35]?.trim() || '',
                                btkt: String(value[36]).toLowerCase() == 'false' ? 0 : 1,
                                dtDuThi: value[37] || '',
                                deAn: value[38] || '',
                                tenBaiBao: value[39] || '',
                                nguoiNhap: value[40]?.trim() || '',
                                trungTuyen: 0,
                                isXetDuyet: 1,
                            };
                            const { ngaySinh, donVi, ngheNghiep, doiTuongUuTien, email, dienThoai, trungTuyen, isXetDuyet } = item;
                            const dataCoBan = { idDot, phanHe, hinhThuc, ngaySinh, donVi, ngheNghiep, doiTuongUuTien, email, dienThoai, trungTuyen, isXetDuyet };
                            dataCoBan.ngaySinh = Number(item.ngaySinh);
                            dataCoBan.gioiTinh = item.gioiTinh == 'Nam' ? '01' : '02';
                            if (phanHe == '03') dataCoBan.trungTuyen == 1;
                            let maTsNganh = item.tenNganh.split(')')[0]?.split('(')[1];
                            let tsNganh = await app.model.sdhTsInfoNganh.get({
                                statement: 'maTsNganh =:maTsNganh and idPhanHe =:idPhanHe',
                                parameter: { maTsNganh, idPhanHe }
                            });
                            if (item.email) {
                                dataCoBan.email = item.email.toLowerCase();
                                if (createItem.filter(i => i.email?.toLowerCase() == item.email.toLowerCase()).length > 1) {
                                    writeLog(`Tồn tại nhiều hơn 1 thí sinh có cùng email: ${item.email} \n ${app.utils.stringify(item)}`);
                                    falseItem.push({ ...item, ghiChuErr: 'Tồn tại nhiều hơn 1 thí sinh có cùng email' });
                                    return handleUpload(index + 1);
                                }
                                let isExist = await app.model.sdhTsThongTinCoBan.getAll({ email: item.email, idDot });
                                if (isExist.length) {
                                    writeLog(`Email đã đăng ký, vui lòng nhập email khác hoặc chỉnh sửa email đã tồn tại:${item.email} \n ${app.utils.stringify(item)}`);
                                    falseItem.push({ ...item, ghiChuErr: `Email đã đăng ký, vui lòng nhập email khác hoặc chỉnh sửa email đã tồn tại: ${item.email}` });
                                    return handleUpload(index + 1);
                                }
                            }

                            let hoTen = item.hoTen?.trim().split(' ');
                            dataCoBan.ten = hoTen.splice(-1)[0].toUpperCase(), dataCoBan.ho = hoTen.join(' ').toUpperCase();

                            if (tsNganh) {
                                dataCoBan.maNganh = tsNganh.maNganh;
                                dataCoBan.idNganh = tsNganh.id;
                            } else {
                                writeLog(`Không tìm thấy cấu hình ngành, vui lòng kiểm tra: ${item.tenNganh}\n ${app.utils.stringify(item)}`);
                                falseItem.push({ ...item, ghiChuErr: `Không tìm thấy cấu hình ngành, vui lòng kiểm tra: ${item.tenNganh}` });
                                return handleUpload(index + 1);
                            }


                            let dataVanBang = getDataVanBang(item, phanHe);
                            if (dataVanBang[0] == false) {
                                falseItem.push(dataVanBang[1]);
                                return handleUpload(index + 1);
                            }
                            let dataNgoaiNgu = await getDataNgoaiNgu(item);
                            if (dataNgoaiNgu[0] == false) {
                                falseItem.push(dataNgoaiNgu[1]);
                                return handleUpload(index + 1);
                            }
                            let dataDeTai = await getDataDeTai(item);
                            if (dataDeTai[0] == false) {
                                falseItem.push(dataDeTai[1]);
                                return handleUpload(index + 1);
                            }
                            let dataBaiBao = getDataBaiBao(item);
                            let dataDiaChi = await getDiaChi(item);
                            if (dataDiaChi[0] == false) {
                                falseItem.push(dataDiaChi[1]);
                                return handleUpload(index + 1);
                            } else {
                                for (const prop in dataDiaChi[1]) {
                                    dataCoBan[prop] = dataDiaChi[1][prop];
                                }
                            }
                            createItem.push(item);
                            dataStruc.push({ line: item.line, dataCoBan, dataVanBang: dataVanBang[1], dataNgoaiNgu: dataNgoaiNgu[1], dataDeTai: dataDeTai[1], dataBaiBao });
                            element.push(item);
                            handleUpload(index + 1);
                        }
                    };
                    handleUpload();
                } else {
                    app.fs.deleteFile(srcPath);
                    done({ error: 'Error' });
                }
            }
        }
        catch (error) {
            console.error(req.url, req.method, { error });
            done({ error });
        }

    };
    app.get('/api/sdh/dsts-template/download', app.permission.check('sdhDsTs:import'), async (req, res) => {
        try {
            const fileName = 'SDH_DSTS_template.xlsx', path = app.path.join(__dirname, 'resources', fileName);
            if (app.fs.existsSync(path)) {
                res.download(path, fileName);
            } else {
                console.error(req.url, req.method, { error: `Không tìm thấy đường dẫn: ${path}` });
                res.sendStatus(404);
            }
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });
    app.put('/api/sdh/dsts/lock', async (req, res) => {
        try {
            const { value, idDot } = req.body.data;
            let item = await app.model.sdhTsInfoTime.update({ id: idDot }, { isLockDsts: value == 'true' || value == true || value == 1 ? 1 : 0 });
            res.send({ item });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.post('/api/sdh/dsts/new', async (req, res) => {
        try {
            const dot = await app.model.sdhTsInfoTime.get({ processing: 1 });
            const { phanHe, idNganh, hinhThuc, email, maNganh } = req.body.data;
            let isExist = await app.model.sdhTsThongTinCoBan.getAll({ idDot: dot.id, email, phanHe });
            if (isExist.length) {
                throw 'Email đã đăng ký, vui lòng nhập email khác hoặc chỉnh sửa email đã tồn tại';
            }
            const newItem = await app.model.sdhTsThongTinCoBan.create({ idDot: dot.id, phanHe, hinhThuc, idNganh, email, maNganh });
            await app.model.sdhTsLichSuHinhThuc.create({ idThiSinh: newItem.id, maHinhThuc: hinhThuc, active: 1 });
            const accountCheck = await app.model.sdhTsAccount.checkExist(email);
            const isExisted = accountCheck.rows.length;
            if (isExisted) {
                const existedAcount = accountCheck.rows[0];
                app.model.sdhTsAccount.update({ id: existedAcount.id }, {
                    idHoSo: `${existedAcount.idHoSo},${newItem.id}`,
                });
            } else {
                const password = 'hcmussh' + (Math.floor(Math.random() * (100000 - 999999 + 1)) + 999999).toString();
                const hashedPassword = app.utils.hashPassword(password);
                await app.model.sdhTsAccount.create({
                    hashedPassword,
                    idHoSo: newItem.id,
                    email: email,
                    lastModified: Date.now(),
                    isValidation: 0
                });
            }
            res.send({ item: newItem });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/dsts/noi-sinh/adapter', async (req, res) => {
        try {
            const { searchTerm } = req.query;
            const [tp, qg] = await Promise.all([
                app.model.dmTinhThanhPho.getAll({}),
                app.model.dmQuocGia.getAll({}),
            ]);
            let items = [...tp, ...qg];
            items = items.map(item => {
                let rt = {};
                if (item.ten) rt.ten = item.ten;
                else rt.ten = item.tenKhac;
                if (item.maCode) rt.ma = item.maCode;
                else rt.ma = item.ma;
                return rt;
            });
            if (searchTerm) {
                items = searchTerm && items.filter(item => item.ten?.toLowerCase().includes(searchTerm?.toLowerCase()) || item.ma?.toLowerCase().includes(searchTerm?.toLowerCase()));
            }
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/dsts/noi-sinh/item/:ma', async (req, res) => {
        try {
            const { ma } = req.params;
            const [tp, qg] = await Promise.all([
                app.model.dmTinhThanhPho.get({ ma }),
                app.model.dmQuocGia.get({ maCode: ma }),
            ]);
            let rt = {};
            if (tp.ten) rt.ten = tp.ten;
            else rt.ten = qg.tenKhac || '';
            if (tp.maCode) rt.ma = qg.maCode;
            else rt.ma = tp.ma;
            res.send({ item: rt });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    app.get('/api/sdh/dsts/account/data/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const data = await app.model.sdhTsThongTinCoBan.getAccountById(id).then(rs => rs.rows);
            if (!data.length) return res.send({ error: 'Thí sinh chưa có tài khoản đăng nhập' });
            res.send({ data: data[0] });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });
    app.get('/api/sdh/dsts/phieu-bao-ho-so/adapter', async (req, res) => {
        try {
            let { searchTerm } = req.query;
            searchTerm = searchTerm?.toLowerCase();
            const dot = await app.model.sdhTsInfoTime.get({ processing: 1 });
            const filter = { mucThongKe: 'tkXetDuyet', idDot: dot.id };
            let { rows: items } = await app.model.sdhTsThongTinCoBan.getTkDetail(app.utils.stringify(filter));
            items = items.filter(item => Array.isArray(app.utils.parse(item.lichThiByMon)) && app.utils.parse(item.lichThiByMon).length);
            if (searchTerm) items = items.filter(item => `${item.ho} ${item.ten}`.toLowerCase().includes(searchTerm) || item.sbd.toLowerCase().includes(searchTerm));
            res.send({ items });
        } catch (error) {
            console.error(req.method, req.url, { error });
            res.send({ error });
        }
    });

    //TOOL GEN PASSWORD
    // app.get('/api/sdh/dsts/hash/password', app.permission.check('developer:login'), async (req, res) => {
    //     try {
    //         const listAccount = await app.model.sdhTsAccount.getAll();
    //         const listHash = listAccount.map(item => ({
    //             ...item, hashedPassword: app.utils.hashPassword(item.password || '')
    //         }));
    //         for (let item of listHash) {
    //             await app.model.sdhTsAccount.update({ id: item.id }, { hashedPassword: item.hashedPassword });
    //         }
    //         res.send(listHash);
    //     } catch (error) {
    //         console.error(req.url, req.method, { error });
    //         res.send({ error });
    //     }
    // });

    //TOOL BỔ SUNG DATA HINH THUC
    // app.get('/api/sdh/dsts/sync/hinh-thuc', app.permission.check('developer:login'), async (req, res) => {
    //     try {
    //         const listThiSinh = await app.model.sdhTsThongTinCoBan.getAll();
    //         const listHash = listThiSinh.map(item => ({
    //             idThiSinh: item.id,
    //             maHinhThuc: item.hinhThuc,
    //             active: 1
    //         }));
    //         for (let item of listHash) {
    //             await app.model.sdhTsLichSuHinhThuc.create(item);
    //         }
    //         res.send(listHash);
    //     } catch (error) {
    //         console.error(req.url, req.method, { error });
    //         res.send({ error });
    //     }
    // });

    app.put('/api/sdh/dsts/reset/password', app.permission.check('developer:login'), async (req, res) => {
        try {
            const { idThiSinh, email: emailThiSinh, name } = req.body.inputData;
            const listHoSo = idThiSinh;
            const lastModified = Date.now();
            const password = 'hcmussh' + (Math.floor(Math.random() * (100000 - 999999 + 1)) + 999999).toString();
            const hashedPassword = app.utils.hashPassword(password);
            const accountCheck = await app.model.sdhTsAccount.checkExist(emailThiSinh);
            const isExisted = accountCheck.rows.length;
            if (isExisted) {
                const existedAcount = accountCheck.rows[0];
                await app.model.sdhTsAccount.update({ id: existedAcount.id }, { hashedPassword, lastModified, email: emailThiSinh });
            } else {
                await app.model.sdhTsAccount.create({ email: emailThiSinh, lastModified, hashedPassword, idHoSo: listHoSo });
            }
            const emailTo = !app.isDebug ? emailThiSinh : 'sang.nguyen0302@hcmut.edu.vn';
            const mailSetting = await app.model.sdhTsSetting.getValue('email', 'emailPassword', 'emailThongTinDangNhapEditorText', 'emailThongTinDangNhapEditorHtml', 'emailThongTinDangNhapTitle', 'sdhPhone', 'sdhAddress', 'sdhSupportPhone', 'sdhEmail');
            let { email, emailPassword, emailThongTinDangNhapEditorText, emailThongTinDangNhapEditorHtml, emailThongTinDangNhapTitle, sdhPhone, sdhAddress, sdhEmail, sdhSupportPhone } = mailSetting || {};
            let text = emailThongTinDangNhapEditorText.replaceAll('{name}', name)
                .replaceAll('{sdh_address}', sdhAddress).replaceAll('{sdh_phone}', sdhPhone).replaceAll('{support_phone}', sdhSupportPhone).replaceAll('{sdh_email}', sdhEmail).replaceAll('{email}', emailThiSinh).replaceAll('{password}', password);
            let html = emailThongTinDangNhapEditorHtml.replaceAll('{name}', name)
                .replaceAll('{sdh_address}', sdhAddress).replaceAll('{sdh_phone}', sdhPhone).replaceAll('{support_phone}', sdhSupportPhone).replaceAll('{sdh_email}', sdhEmail).replaceAll('{email}', emailThiSinh).replaceAll('{password}', password);
            app.service.emailService.send(email, emailPassword, emailTo, null, null, (app.isDebug ? 'TEST: ' : '') + emailThongTinDangNhapTitle, text, html, null);
            res.end();
        } catch (error) {
            console.error(req.url, req.method, { error });
            res.send({ error });
        }
    });
};