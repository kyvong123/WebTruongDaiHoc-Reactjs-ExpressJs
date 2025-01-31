module.exports = app => {
    app.executeTask.importDiem = async ({ srcPath, dmLoaiDiem, columns }) => {
        let workbook = await app.excel.readFile(srcPath),
            worksheet = workbook.getWorksheet(1);
        // read columns header
        let items = [], falseItems = [], index = 2;
        while (true) {
            const getVal = (column, type = 'text', Default) => {
                Default = Default ? Default : '';
                let val = worksheet.getCell(column + index).text?.trim();
                if (type == 'number' && val != '') {
                    if (!isNaN(val)) val = Number(val).toFixed(2);
                    else val = '';
                }
                return val === '' ? Default : (val == null ? '' : val.toString());
            };
            if (!(worksheet.getCell('A' + index).value && worksheet.getCell('B' + index).value)) {
                break;
            } else {
                const data = {
                    mssv: getVal('A'),
                    maHocPhan: getVal('B'),
                    loaiHinhDaoTao: getVal('C'),
                    ghiChu: getVal(columns.find(i => i.name == 'Ghi chú').column),
                    row: index, dataDacBiet: {},
                };

                data.maMonHoc = data.maHocPhan.substring(data.loaiHinhDaoTao.length + 3);

                dmLoaiDiem.forEach(loai => {
                    let exist = columns.find(i => i.name.toLowerCase() == loai.ten.trim().toLowerCase());
                    if (exist) {
                        data[loai.ma] = getVal(exist.column)?.toUpperCase();
                    }
                });

                //Check data
                let sv = await app.model.fwStudent.get({ mssv: data.mssv }, 'mssv');
                if (!sv) {
                    falseItems.push({ ...data, error: 'Không tồn tại sinh viên' });
                } else {
                    let isDangKy = await app.model.dtDangKyHocPhan.getAll({
                        statement: 'mssv = :mssv AND maHocPhan LIKE :maHocPhan AND maMonHoc = :maMonHoc',
                        parameter: { mssv: data.mssv, maHocPhan: `%${data.maHocPhan}%`, maMonHoc: data.maMonHoc }
                    });

                    if (!isDangKy.length) {
                        data.maMonHoc = data.maMonHoc.substring(0, data.maMonHoc.length - 1);
                        isDangKy = await app.model.dtDangKyHocPhan.getAll({
                            statement: 'mssv = :mssv AND maHocPhan LIKE :maHocPhan AND maMonHoc = :maMonHoc',
                            parameter: { mssv: data.mssv, maHocPhan: `%${data.maHocPhan}%`, maMonHoc: data.maMonHoc }
                        });
                    }

                    if (!isDangKy.length) {
                        falseItems.push({ ...data, error: 'Sinh viên không đăng ký học phần' });
                    } else if (isDangKy.length >= 2) {
                        falseItems.push({ ...data, error: 'Sinh viên đăng ký nhiều hơn 1 học phần' });
                    } else {
                        let { namHoc, hocKy, maHocPhan } = isDangKy[0], dataDacBiet = {};
                        data.namHoc = namHoc;
                        data.hocKy = hocKy;
                        data.maHocPhan = maHocPhan;

                        let hp = await app.model.dtThoiKhoaBieu.get({ maHocPhan }, 'tinhTrangDiem');
                        if (hp && hp.tinhTrangDiem == 4) {
                            falseItems.push({ ...data, error: 'Học phần bị khóa bảng điểm' });
                        } else {
                            let config = await app.model.dtDiemConfig.getData(app.utils.stringify({
                                namHoc, hocKy, maHocPhan, maMonHoc: data.maMonHoc
                            }));

                            let configThanhPhan = [];
                            if (config.dataconfighocphan.length) {
                                configThanhPhan = config.dataconfighocphan.map(i => ({ loaiThanhPhan: i.loaiThanhPhan, tenThanhPhan: i.tenThanhPhan, phanTram: i.phanTram, loaiLamTron: i.loaiLamTron }));
                            } else if (config.dataconfigmonhoc.length) {
                                configThanhPhan = config.dataconfigmonhoc.map(i => ({ loaiThanhPhan: i.loaiThanhPhan, tenThanhPhan: i.tenThanhPhan, phanTram: i.phanTram, loaiLamTron: i.loaiLamTron }));
                            } else {
                                configThanhPhan = config.dataconfigthanhphan.map(i => ({ loaiThanhPhan: i.loaiThanhPhan, tenThanhPhan: i.tenThanhPhan, phanTram: i.phanTramMacDinh, loaiLamTron: i.loaiLamTron }));
                            }

                            if (!configThanhPhan.length) {
                                falseItems.push({ ...data, error: 'Học phần chưa có phần trăm điểm' });
                            } else {
                                const listTp = configThanhPhan.map(i => i.loaiThanhPhan),
                                    dataConfigQuyChe = config.dataconfigquyche.filter(i => listTp.length && i.loaiApDung && listTp.some(tp => i.loaiApDung.split(', ').includes(tp))),
                                    allDiem = await app.model.dtDiemAll.getAll({ mssv: data.mssv, maHocPhan, maMonHoc: data.maMonHoc, namHoc, hocKy });

                                // check valid diem
                                configThanhPhan.forEach(tp => {
                                    const value = data[tp.loaiThanhPhan],
                                        diemTp = allDiem.find(i => i.loaiDiem == tp.loaiThanhPhan);

                                    if (value && diemTp && diemTp.diemDacBiet == 'I') {
                                        falseItems.push({ ...data, error: 'Điểm hiện tại của sinh viên là điểm hoãn!' });
                                    } else if (isNaN(value)) {
                                        const key = dataConfigQuyChe.filter(i => i.ma != 'I').find(item => item.loaiApDung.split(', ').includes(tp.loaiThanhPhan) && item.ma == value);
                                        if (key) {
                                            if (!key.tinhTongKet) {
                                                data[tp.loaiThanhPhan] = '0';
                                            }
                                            dataDacBiet[tp.loaiThanhPhan] = value;
                                            data.khongTinhPhi = key.khongTinhPhi;
                                        } else {
                                            falseItems.push({ ...data, error: 'Điểm không hợp lệ!' });
                                        }
                                    } else {
                                        if (parseFloat(value) < 0 || parseFloat(value) > 10) {
                                            falseItems.push({ ...data, error: 'Điểm không hợp lệ!' });
                                        } else if (parseFloat(value) >= 0 || parseFloat(value) <= 10) {
                                            const rate = parseFloat(tp.loaiLamTron) / 0.1;
                                            data[tp.loaiThanhPhan] = (Math.round(value * (10 / rate)) / (10 / rate)).toString();
                                        }
                                    }
                                });

                                if (!falseItems.find(i => i.row == index)) {
                                    let sumDiem = '';
                                    for (const tp of configThanhPhan) {
                                        const diemTp = data[tp.loaiThanhPhan];
                                        if (diemTp && isNaN(diemTp)) {
                                            sumDiem = diemTp;
                                            break;
                                        } else if (diemTp != '' && diemTp != null) {
                                            if (sumDiem == '') sumDiem = parseFloat(diemTp) * parseInt(tp.phanTram);
                                            else sumDiem += parseFloat(diemTp) * parseInt(tp.phanTram);
                                        }
                                    }
                                    if (!isNaN(parseFloat(sumDiem))) {
                                        sumDiem = Math.round((2 * sumDiem) / 100) / 2;
                                    }

                                    dmLoaiDiem.forEach(loai => {
                                        if (!configThanhPhan.find(tp => tp.loaiThanhPhan == loai.ma)) {
                                            delete data[loai.ma];
                                        }
                                    });

                                    items.push({ ...data, configThanhPhan, 'TK': sumDiem, dataDacBiet });
                                }
                            }
                        }
                    }
                }
            }
            index++;
        }
        return ({ items, falseItems, dmLoaiDiem, srcPath });
    };
};