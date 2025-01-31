module.exports = app => {
    const serviceId = '347002';
    const crypto = require('crypto');
    const types = {
        SANDBOX: 'sandbox',
        PRODUCTION: 'production'
    };
    const { reduceBill, addBill } = require('./reduceBill')(app);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    // production
    app.post('/api/bidv-nvxhhcm/getbill', async (req, res) => {
        try {
            await getBill(types.PRODUCTION, req, res);
            app.model.tcBankRequest.create({
                url: '/api/bidv-nvxhhcm/getbill',
                method: 'POST',
                body: JSON.stringify(req.body),
                userId: req.body.customer_id,
                isSuccess: 1,
                dataReturn: '',
                timeReturn: Date.now()
            }).catch(error => console.error(req.method, req.url, error));
        } catch (error) {
            app.model.tcBankRequest.create({
                url: '/api/bidv-nvxhhcm/getbill',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: req.body.customer_id,
                isSuccess: 0,
                dataReturn: JSON.stringify({ error }),
                timeReturn: Date.now()
            }).catch(error => console.error(req.method, req.url, error));
            console.error('GET BILL BIDV: ', error);
            res.send({ result_code: '096' });
        }
    });

    // sandbox
    app.post('/api/bidv-nvxhhcm/sandbox/getbill', async (req, res) => {
        try {
            await getBill(types.SANDBOX, req, res);
        } catch (error) {
            console.error('GET BILL BIDV: ', error);
            res.send({ result_code: '096' });
        }
    });

    const getBill = async (type, req, res) => {
        const bank = await app.model.dmBank.get({ ma: 'BIDV' });
        if (!bank || !bank.kichHoat) {
            throw 'Kênh ngân hàng không khả dụng';
        }
        let { secretCodeBidv, secretCodeBidvSandbox } = await app.model.tcSetting.getValue('secretCodeBidv', 'secretCodeBidvSandbox');
        const secretCode = type === types.PRODUCTION ? secretCodeBidv : secretCodeBidvSandbox;
        const { service_id, checksum } = req.body, customer_id = req.body?.customer_id?.toString() || '';

        const myChecksum = crypto.createHash('md5').update(`${secretCode}|${service_id}|${customer_id}`).digest('hex');

        if (!(customer_id && service_id && checksum)) {
            return res.send({ result_code: '145' });
        }
        if (service_id != serviceId) {
            return res.send({ result_code: '020' });
        }
        if (checksum != myChecksum) {
            return res.send({ result_code: '007' });
        }

        const listLoaiGiaoDich = await app.model.tcDmLoaiGiaoDich.getAll({ active: 1 }, '*', 'prefixGiaoDich DESC NULLS LAST');
        const loaiGiaoDich = listLoaiGiaoDich.find(item => customer_id.toUpperCase().startsWith(item.prefixGiaoDich || ''));
        const mssv = customer_id.substr((loaiGiaoDich.prefixGiaoDich || '').length);

        let student = await app.model.fwStudent.get({ mssv });
        if (!student) {
            return res.send({ result_code: '017' });
        }

        await app.model.tcDotDong.capNhatDongTien(mssv);

        let result = await getBillByType(type, loaiGiaoDich.ma, mssv);
        if (result.error) {
            return res.send(result.error);
        }

        let name = `USSH ${student.ho} ${student.ten} ${result.toString().numberDisplay()}`.toUpperCase();
        if (name.length > 40) name = `USSH ${student.ho.getFirstLetters()}. ${student.ten} ${result.toString().numberDisplay()}`.toUpperCase();
        res.send({
            result_code: '000', result_desc: 'success',
            data: {
                service_id,
                customer_id: customer_id.toString(), customer_name: name, customer_addr: '',
                type: 0, matchAmount: result,
            },
        });
    };

    const getBillByType = async (type, loaiGd, mssv) => {
        let tongCongNo;
        if (loaiGd == 'HP') {
            const khoaDotDong = await app.model.tcDotDong.khoaDotDong(mssv, Date.now()).then(item => parseInt(item.outBinds.ret));
            const statusGd = await app.model.tcDmLoaiGiaoDich.get({ ma: 'HP', active: 1 });
            const model = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
            const hocPhi = await model.getAll({ mssv });
            if (!hocPhi || !hocPhi.length || khoaDotDong === 0 || !statusGd) {
                return ({ error: { result_code: '001' } });
            }

            tongCongNo = await app.model.tcHocPhiTransaction.getCongNo(mssv).then(item => parseInt(item.outBinds.ret));
            if (!tongCongNo || tongCongNo <= 0) {
                return ({ error: { result_code: '025' } });
            }
        }
        else if (loaiGd == 'BH') {
            const statusGd = await app.model.tcDmLoaiGiaoDich.get({ ma: 'BH', active: 1 });
            if (!statusGd) {
                return ({ error: { result_code: '001' } });
            }

            tongCongNo = await app.model.tcHocPhiTransaction.getCongNoBhyt(mssv).then(item => parseInt(item.outBinds.ret));
            if (!tongCongNo || tongCongNo <= 0) {
                return ({ error: { result_code: '025' } });
            }
        }

        return tongCongNo;
    };

    // production
    app.post('/api/bidv-nvxhhcm/paybill', async (req, res) => {
        const trans_id = req.body.trans_id;
        try {
            await payBill(types.PRODUCTION, req, res);
            app.model.tcBankRequest.create({
                url: '/api/bidv-nvxhhcm/paybill',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: req.body.customer_id,
                isSuccess: 1,
                dataReturn: '',
                timeReturn: Date.now()
            }).catch(error => console.error(req.method, req.url, error));
        } catch (error) {
            console.error(error);
            try {
                if (trans_id) {
                    const item = await app.model.tcHocPhiTransaction.update({ transId: trans_id }, { status: 0 });
                    if (!item) throw 'No transaction!';
                    const { namHoc, hocKy, customerId } = item;
                    const hocPhi = await app.model.tcHocPhi.get({ mssv: customerId, namHoc, hocKy });
                    await app.model.tcHocPhi.update({ mssv: customerId, namHoc, hocKy }, { congNo: parseInt(hocPhi.congNo) + parseInt(item.amount) });
                } else res.send({ result_code: '145' });
            } catch (error) {
                res.send({ result_code: '096' });
            }
            app.model.tcBankRequest.create({
                url: '/api/bidv-nvxhhcm/paybill',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: req.body.customer_id,
                isSuccess: 0,
                dataReturn: '',
                timeReturn: Date.now()
            }).catch(error => console.error(req.method, req.url, error));
        }
    });

    // sandbox
    app.post('/api/bidv-nvxhhcm/sandbox/paybill', async (req, res) => {
        try {
            await payBill(types.SANDBOX, req, res);
        } catch (error) {
            console.log({ error });
            res.send({ result_code: '096' });
        }
    });

    const payBill = async (type, req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeBidv, secretCodeBidvSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeBidv', 'secretCodeBidvSandbox');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const secretCode = type === types.PRODUCTION ? secretCodeBidv : secretCodeBidvSandbox;
        const { trans_id, trans_date, bill_id, service_id, amount, checksum } = req.body,
            customer_id = req.body?.customer_id?.toString() || '',
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${trans_id}|${bill_id}|${amount}`).digest('hex');

        const bank = await app.model.dmBank.get({ ma: 'BIDV' });
        if (!bank || !bank.kichHoat) {
            return res.send({ result_code: '031' });
        }

        if (!(trans_id && trans_date && customer_id && bill_id && service_id && amount && checksum)) {
            return res.send({ result_code: '145' });
        }
        if (service_id != serviceId) {
            return res.send({ result_code: '020' });
        }
        if (checksum != myChecksum) {
            return res.send({ result_code: '007' });
        }

        const listLoaiGiaoDich = await app.model.tcDmLoaiGiaoDich.getAll({ active: 1 }, '*', 'prefixGiaoDich DESC NULLS LAST');
        const loaiGiaoDich = listLoaiGiaoDich.find(item => customer_id.toUpperCase().startsWith(item.prefixGiaoDich || ''));
        const mssv = customer_id.substr((loaiGiaoDich.prefixGiaoDich || '').length);

        let student = await app.model.fwStudent.get({ mssv });
        if (!student) {
            return res.send({ result_code: '017' });
        }

        if (loaiGiaoDich.ma == 'HP') {
            const khoaDotDong = await app.model.tcDotDong.khoaDotDong(mssv, Date.now()).then(item => parseInt(item.outBinds.ret));
            const statusGd = await app.model.tcDmLoaiGiaoDich.get({ ma: 'HP', active: 1 });
            const model = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
            const hocPhi = await model.getAll({ mssv });
            if (!hocPhi || !hocPhi.length || khoaDotDong === 0 || !statusGd) {
                return res.send({ result_code: '001' });
            }

            const tongCongNo = await app.model.tcHocPhiTransaction.getCongNo(mssv).then(item => parseInt(item.outBinds.ret));
            if (!tongCongNo || tongCongNo <= 0) {
                return res.send({ result_code: '025' });
            }
            const { dungSoTien: isCheck } = await app.model.tcSetting.getValue('dungSoTien');
            if (parseInt(amount) != tongCongNo && isCheck == '1') {
                return res.send({ result_code: '022' });
            }

            const contentBill = await reduceBill(customer_id, parseInt(amount));
            await addBill(namHoc, hocKy, customer_id, parseInt(amount), app.date.fullFormatToDate(trans_date).getTime(), bill_id, service_id, checksum, `BIDV-${trans_id}`, 'BIDV', contentBill.result, app.date.fullFormatToDate(trans_date).getTime());
            type == types.PRODUCTION && app.model.tcHocPhiTransaction.notify('PAYBILL-BIDV', { student, hocKy, namHoc, amount: parseInt(amount), payDate: trans_date.toString() });
        }
        else if (loaiGiaoDich.ma == 'BH') {
            const statusGd = await app.model.tcDmLoaiGiaoDich.get({ ma: 'BH', active: 1 });
            if (!statusGd) {
                return ({ error: { result_code: '001' } });
            }

            const tongCongNo = await app.model.tcHocPhiTransaction.getCongNoBhyt(mssv).then(item => parseInt(item.outBinds.ret));
            if (!tongCongNo || tongCongNo <= 0) {
                return res.send({ result_code: '025' });
            }
            if (parseInt(amount) != tongCongNo) {
                return res.send({ result_code: '022' });
            }

            await app.model.tcGiaoDichBhyt.create({
                namHoc, hocKy,
                bank: 'BIDV', transId: `BIDV-${trans_id}`,
                transDate: app.date.fullFormatToDate(trans_date).getTime(),
                customerId: mssv,
                billId: bill_id, serviceId: service_id, checksum,
                amount: parseInt(amount),
                status: 1,
                thoiGianSoPhu: app.date.fullFormatToDate(trans_date).getTime(),
                originalCustomerId: mssv
            });

            const checkDotBhyt = await app.model.svDotDangKyBhyt.getAll({
                statement: ':timeNow BETWEEN THOI_GIAN_BAT_DAU AND THOI_GIAN_KET_THUC',
                parameter: { timeNow: Date.now() }
            }).then(data => data.map(item => item.ma));

            checkDotBhyt && checkDotBhyt.length && await app.model.svBaoHiemYTe.update({
                statement: 'MSSV = :mssv AND ID_DOT IN (:listDot)',
                parameter: { mssv, listDot: checkDotBhyt.toString() }
            }, { idGiaoDich: trans_id });
            app.messageQueue.send('thanhToanBhyt:send', { mssv });
        }
        res.send({ result_code: '000', result_desc: 'success' });
    };
};