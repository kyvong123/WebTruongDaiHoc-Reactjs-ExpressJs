module.exports = (app) => {
    return {
        reduceBill: async (mssv, amount) => {
            try {
                let soDuHocPhi = await app.model.tcSoDuHocPhi.get({ mssv });
                if (!soDuHocPhi) {
                    soDuHocPhi = await app.model.tcSoDuHocPhi.create({ mssv, soTien: parseInt(amount) });
                }
                else {
                    await app.model.tcSoDuHocPhi.update({ mssv }, { soTien: parseInt(soDuHocPhi.soTien) + parseInt(amount) });
                }

                let { rows: hocPhiDetail } = await app.model.tcHocPhiTransaction.getHocPhiCanTru(mssv);
                let soTienConLai = parseInt(amount);
                let result = {};
                hocPhiDetail = hocPhiDetail.filter(cur => !hocPhiDetail.find(item => item.tamThu == cur.loaiPhi));
                for (let [index, row] of hocPhiDetail.entries()) {
                    const { loaiPhi, soTien, soTienDaDong, ten } = row;

                    const soTienCanDong = parseInt(soTien) - parseInt(soTienDaDong);
                    if (soTienConLai == 0) {
                        break;
                    } else if (soTienCanDong > 0 && soTienConLai >= soTienCanDong && index != hocPhiDetail.length - 1) {
                        soTienConLai -= soTienCanDong;
                        result[loaiPhi.toString()] = { soTien: soTienCanDong, ten };
                    } else if (soTienCanDong > 0 && soTienConLai < soTienCanDong) {
                        result[loaiPhi.toString()] = { soTien: soTienConLai, ten };
                        soTienConLai = 0;
                    } else if (soTienConLai > 0 && index == hocPhiDetail.length - 1) {
                        result[loaiPhi.toString()] = { soTien: soTienConLai, ten };
                        soTienConLai = 0;
                    }
                }

                await app.model.tcDotDong.capNhatDongTien(mssv);
                return { result: `${app.utils.stringify(result)}` };
            } catch (error) {
                console.error(error);
                return { result: null };
            }
        },
        addBill: async (namHoc, hocKy, mssv, amount, transDate, billId, serviceId, checksum, transId, bank, contentBill, thoiGianSoPhu, flag = 1) => {
            const { dungSoTien: isCheck } = await app.model.tcSetting.getValue('dungSoTien');
            if (isCheck == '1' && flag) {
                await app.model.tcHocPhi.update({ mssv }, { congNo: 0 });
            }
            await app.model.tcDotDong.capNhatDongTien(mssv);
            await app.model.tcHocPhiTransaction.create({
                namHoc, hocKy,
                bank, transId, transDate,
                customerId: mssv,
                billId, serviceId, checksum, amount,
                status: 1,
                khoanThu: contentBill,
                thoiGianSoPhu,
                originalCustomerId: mssv,
                loaiGiaoDich: 'HP'
            });

            let hoanDong = await app.model.tcHoanDongHocPhi.get({
                statement: 'mssv = :mssv AND thoi_han_thanh_toan >= :transDate AND da_thanh_toan < so_tien_thu_truoc',
                parameter: { mssv, transDate }
            });

            if (hoanDong) {
                await app.model.tcHoanDongHocPhi.update({ id: hoanDong.id }, { daThanhToan: parseInt(hoanDong.daThanhToan) + parseInt(amount) });
            }

            await app.model.dtCauHinhDotDkhp.checkAndUpdateStudent(mssv);

            // MESSAGE QUEUE
            try {
                app.messageQueue.send('thanhToanNhapHoc:send', { mssv });
            }
            catch (e) {
                console.error('Add queue Transaction Fail', { e });
            }

            const hocPhiDaKichHoat = await app.model.tcHocPhi.getAll({
                statement: 'congNo <= 0 and mssv = :mssv',
                parameter: { mssv }
            });
            const transList = hocPhiDaKichHoat.map(item => {
                return { namHoc: `${item.namHoc} - ${item.namHoc + 1}`, hocKy: item.hocKy };
            });
            for (const item of transList) {
                const checkTonTai = await app.model.dtExamDanhSachSinhVien.get({ mssv, namHoc: item.namHoc, hocKy: item.hocKy });
                if (checkTonTai) {
                    try {
                        await app.model.dtExamDanhSachSinhVien.update({ mssv, namHoc: item.namHoc, hocKy: item.hocKy }, { isThanhToan: 1 });
                    } catch (error) {
                        throw new Error('cập nhật phòng thi lỗi');
                    }
                }
            }
        }
    };
};