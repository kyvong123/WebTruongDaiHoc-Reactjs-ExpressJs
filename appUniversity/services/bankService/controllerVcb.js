module.exports = app => {
    // const serviceIdVcb = 'BILLC2';
    // const providerIdVcb = 'DHKHXHVNVHCM';

    const VCBProviders = {
        DHKHXHVNVHCM: {
            serviceIdVcb: ['BILLC2'],
            providerIdVcb: 'DHKHXHVNVHCM'
        },
        KHXHVNVHCM: {
            serviceIdVcb: ['BILLC2'],
            providerIdVcb: 'KHXHVNVHCM'
        },
        XHVNVHCM: {
            serviceIdVcb: ['BILLC2'],
            providerIdVcb: 'XHVNVHCM'
        }
    };
    const crypto = require('crypto');
    const types = {
        SANDBOX: 'sandbox',
        PRODUCTION: 'production'
    };
    const { reduceBill, addBill } = require('./reduceBill')(app);

    class BaseVcbError extends Error {
        constructor(errorCode, context, payload, signature, message = 'BaseVcbError') {
            super(message);
            this.context = context || {};
            this.context.status = 'FAILURE';
            this.context.errorCode = errorCode;
            this.payload = payload;
            this.signature = signature;
        }

        toJson() {
            return {
                context: this.context,
                payload: this.payload,
                signature: this.signature
            };
        }
    }

    class InvalidInquiryError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'InvalidInquiryError');
        }
    }

    class BankConfigError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'BankConfigError');
        }
    }

    class InvalidTimeInquiryError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'InvalidTimeInquiryError');
        }
    }

    class InvalidSignatureError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'InvalidSignatureError');
        }
    }

    class InvalidBankConfigError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'InvalidBankConfig');
        }
    }

    class LockTransactionError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'LockTransactionError');
        }
    }

    class NoDebtError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'NoDebtError');
        }
    }

    class DifferrentDebtError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'DifferrentDebtError');
        }
    }

    class InvalidUserError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'InvalidUserError');
        }
    }

    class OtherError extends BaseVcbError {
        constructor(errorCode, context, payload, signature) {
            super(errorCode, context, payload, signature, 'OtherError');
        }
    }
    // VCB --------------------------------------------------------------------------------------------------------------------------------------
    // production
    app.post('/api/VCBPayment/Inquiry', async (req, res) => {
        console.log('Check getBill VCB: ', req.body, req.query);
        try {
            await getBill(types.PRODUCTION, req, res);
            app.model.tcBankRequest.create({
                url: '/api/VCBPayment/Inquiry',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: req.body.payload?.customerCode || '',
                isSuccess: 1,
                dataReturn: '',
                timeReturn: Date.now()
            }).catch(error => console.error(req.method, req.url, error));
        } catch (error) {
            res.status(error.toJson ? 200 : 400).send(error.toJson ? error.toJson() : error);
            app.model.tcBankRequest.create({
                url: '/api/VCBPayment/Inquiry',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: req.body.payload?.customerCode || '',
                isSuccess: 0,
                dataReturn: '',
                timeReturn: Date.now()
            }).catch(error => console.error(req.method, req.url, error));
        }
    });

    // sandbox
    app.post('/api/VCBPayment/Sandbox/Inquiry', async (req, res) => {
        try {
            await getBill(types.SANDBOX, req, res);
            app.model.tcBankRequest.create({
                url: '/api/VCBPayment/Sandbox/Inquiry',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: 'VCB' + (req.body.context?.channelRefNumber || 'NULL'),
                isSuccess: 1,
                dataReturn: 1,
                timeReturn: Date.now()
            }).catch(error => console.error('SandBox Inquiry Error', error));
        }
        catch (error) {
            console.error({ error });
            res.status(error.toJson ? 200 : 400).send(error.toJson ? error.toJson() : error);
            app.model.tcBankRequest.create({
                url: '/api/VCBPayment/Sandbox/Inquiry',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: 'VCB' + (req.body.context?.channelRefNumber || 'NULL'),
                isSuccess: 0,
                dataReturn: 1,
                timeReturn: Date.now()
            }).catch(error => console.error('SandBox Inquiry Error', error));
        }
    });

    const getBillCanBo = async ({ customerCode, context, signatureResponse, res, signature }) => {
        const canBoRegex = /[0-9]{4,4}QSX[A-Za-z0-9]{7,7}$/;
        const customerProcessedCode = canBoRegex.test(customerCode) ? customerCode.match(canBoRegex)[0] : customerCode;
        const mscb = customerProcessedCode.slice(-10);
        const nam = customerProcessedCode.slice(0, 4);
        const data = await app.model.tcTncnQuyetToanThue.getAll({ shcc: mscb });
        if (!data || !data.length) {
            throw new LockTransactionError(17, context, { customerCode }, signatureResponse);
        } else {

            const tongCongNo = await app.model.tcTncnQuyetToanThueDetail.get({ shcc: mscb, tinhTrang: 'CHUA_DONG', nam }, '*', 'dot ASC').then(data => data?.soTienThanhToan);
            if (!tongCongNo || tongCongNo <= 0) {
                throw new NoDebtError(1, context, { customerCode }, signatureResponse);
            } else {
                const canBo = await app.model.tchcCanBo.get({ shcc: mscb });
                if (!canBo) {
                    throw new InvalidUserError(17, context, { customerCode }, signatureResponse);
                } else {
                    let bills = [
                        {
                            billId: `${customerCode}`,
                            amount: tongCongNo.toString(),
                            addnlFields: [
                                {
                                    fieldId: 'CustomerName',
                                    fieldValue: `USSH ${canBo.shcc} ${tongCongNo}`,
                                },
                                {
                                    fieldId: 'CustomerAddress',
                                    fieldValue: 'DHKHXHNV',
                                },
                            ],
                        }
                    ];
                    context.status = 'SUCCESS';
                    context.errorCode = 0;

                    res.send({ context, payload: { bills, customerCode, paymentSequence: 1 }, signature, });
                }
            }
        }
    };
    const getBillSinhVien = async ({ customerCode, context, signatureResponse, res, type, signature }) => {
        const mssvRegex = /[A-Za-z0-9]{10,10}$/;
        const customerProcessedCode = customerCode.startsWith('USSH') && mssvRegex.test(customerCode) ? customerCode.match(mssvRegex)[0] : customerCode;

        const khoaDotDong = type === types.PRODUCTION ? await app.model.tcDotDong.khoaDotDong(customerProcessedCode, Date.now()) : 1;
        const model = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
        const data = await model.getAll({ mssv: customerProcessedCode });
        if (!data || !data.length || khoaDotDong?.outBinds?.ret === 0) {
            throw new LockTransactionError(17, context, { customerCode }, signatureResponse);
        } else {
            await app.model.tcDotDong.capNhatDongTien(customerProcessedCode);
            const tongCongNo = await (type === types.PRODUCTION ? app.model.tcHocPhiTransaction : app.model.tcHocPhiTransactionSandbox).getCongNo(customerProcessedCode).then(item => item.outBinds.ret);
            if (tongCongNo <= 0) {
                throw new NoDebtError(1, context, { customerCode }, signatureResponse);
            } else {
                const student = await app.model.fwStudent.get({ mssv: customerProcessedCode });
                if (!student) {
                    throw new InvalidUserError(17, context, { customerCode }, signatureResponse);
                } else {
                    let bills = [
                        {
                            billId: `${customerCode}`,
                            amount: tongCongNo.toString(),
                            addnlFields: [
                                {
                                    fieldId: 'CustomerName',
                                    fieldValue: `USSH ${student.mssv} ${tongCongNo}`,
                                },
                                {
                                    fieldId: 'CustomerAddress',
                                    fieldValue: 'DHKHXHNV',
                                },
                            ],
                        }
                    ];
                    context.status = 'SUCCESS';
                    context.errorCode = 0;
                    if (type != types.PRODUCTION) {
                        if (customerCode == 'USSH000002356179997') {
                            return setTimeout(() => res.status(504).send({ error: 'server time out' }), 1000 * 60 * 5);
                        }
                        console.info('Sand box return data', JSON.stringify({
                            context,
                            payload: {
                                bills, customerCode, paymentSequence: 1
                            },
                            signature,
                        }, null, '\t'));
                    }
                    res.send({ context, payload: { bills, customerCode, paymentSequence: 1 }, signature, });
                }
            }
        }

    };
    const getBill = async (type, req, res) => {
        try {
            let { secretCodeVcb, secretCodeVcbSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeVcb', 'secretCodeVcbSandbox');
            const bank = await app.model.dmBank.get({ ma: 'VIETCOMBANK' });
            const secretCode = type === types.PRODUCTION ? secretCodeVcb : secretCodeVcbSandbox;
            let { context, payload, signature } = req.body;
            if (!(context && payload)) {
                console.error('Invalid request');
                res.sendStatus(400);
            } else {
                if (!bank || !bank.kichHoat) {
                    throw new BankConfigError(400, context, {}, signature);
                }
                let { channelId, channelRefNumber, requestDateTime } = context,  // Nếu thiếu báo lỗi thiếu params
                    { customerCode, providerId, serviceId } = payload;
                const responseMsgId = `${customerCode}?${Date.now()}`;
                context.responseMsgId = responseMsgId;

                if (!(channelId && channelRefNumber && requestDateTime && providerId && serviceId && customerCode)) {
                    throw new InvalidInquiryError(10, context, { customerCode }, signature);
                } else {
                    requestDateTime = requestDateTime.toString();
                    let hour = requestDateTime.substring(11, 13),
                        minute = requestDateTime.substring(14, 16),
                        second = requestDateTime.substring(17, 19),
                        day = requestDateTime.substring(0, 2),
                        month = requestDateTime.substring(3, 5),
                        year = requestDateTime.substring(6, 10);

                    let time = new Date(year, month - 1, day, hour, minute, second).getTime();
                    if (isNaN(time)) {
                        throw new InvalidTimeInquiryError(20, context, { customerCode }, signature);
                    }

                    const dataRequest = `${channelId}|${channelRefNumber}|${secretCode}`,
                        mySignatureRequest = crypto.createHash('md5').update(dataRequest).digest('hex');

                    const dataResponse = `${channelId}|${channelRefNumber}|${responseMsgId}|${secretCode}`,
                        signatureResponse = crypto.createHash('md5').update(dataResponse).digest('hex');
                    console.log(`- Signature from VCB: ${signature}`);
                    console.log(`- Signature for check: ${mySignatureRequest}`);
                    if (!signature || mySignatureRequest != signature) {
                        throw new InvalidSignatureError(18, context, { customerCode }, signatureResponse);
                    } else if (!VCBProviders[providerId] || !VCBProviders[providerId].serviceIdVcb.includes(serviceId)) {
                        throw new InvalidBankConfigError(21, context, { customerCode }, signatureResponse);
                    } else {
                        if (customerCode.startsWith('XHNV')) {
                            return await getBillCanBo({ customerCode, context, signatureResponse, res, signature });
                        }
                        else {
                            return await getBillSinhVien({ customerCode, context, type, signatureResponse, res, signature });
                        }
                    }
                }
            }
        } catch (error) {
            if (!(error instanceof BaseVcbError)) {
                console.error(error);
                throw new OtherError(400, {}, {}, '');
            } else {
                throw error;
            }
        }

    };

    // production
    app.post('/api/VCBPayment/Payment', async (req, res) => {
        console.log('Check payBill VCB: ', req.body, req.query);
        try {
            await paybill(types.PRODUCTION, req, res);
            app.model.tcBankRequest.create({
                url: '/api/VCBPayment/Payment',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: req.body.payload?.customerCode || '',
                isSuccess: 1,
                dataReturn: '',
                timeReturn: Date.now()
            }).catch(error => console.error(req.method, req.url, error));
        } catch (error) {
            res.status(error.toJson ? 200 : 400).send(error.toJson ? error.toJson() : error);
            app.model.tcBankRequest.create({
                url: '/api/VCBPayment/Payment',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: req.body.payload?.customerCode || '',
                isSuccess: 0,
                dataReturn: '',
                timeReturn: Date.now()
            }).catch(error => console.error(req.method, req.url, error));
        }

    });

    // sandbox
    app.post('/api/VCBPayment/Sandbox/Payment', async (req, res) => {
        try {
            await paybill(types.SANDBOX, req, res);
            app.model.tcBankRequest.create({
                url: '/api/VCBPayment/Sandbox/Payment',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: 'VCB' + (req.body.context?.channelRefNumber || 'NULL'),
                isSuccess: 1,
                dataReturn: '',
                timeReturn: Date.now()
            }).catch(error => console.error('Sanbox payment', error));
        } catch (error) {
            res.status(error.toJson ? 200 : 400).send(error.toJson ? error.toJson() : error);
            app.model.tcBankRequest.create({
                url: '/api/VCBPayment/Sandbox/Payment',
                method: 'POST',
                body: JSON.stringify({ ...req.body }),
                userId: req.body.payload?.customerCode || '',
                isSuccess: 0,
                dataReturn: '',
                timeReturn: Date.now()
            }).catch(error => console.error(req.method, req.url, error));
        }
    });

    const paybillCanBo = async ({ customerCode, context, signature, totalPaymentAmount, providerId, serviceId, bills, time, internalTransactionRefNo, res }) => {
        const canBoRegex = /[0-9]{4,4}[A-Za-z0-9]{10,10}$/;
        const customerProcessedCode = canBoRegex.test(customerCode) ? customerCode.match(canBoRegex)[0] : customerCode;
        const mscb = customerProcessedCode.slice(-10);
        const nam = customerProcessedCode.slice(0, 4);
        const data = await app.model.tcTncnQuyetToanThue.getAll({ shcc: mscb });
        if (!data || !data.length) {
            throw new LockTransactionError(17, context, { customerCode }, signature);
        } else {
            let canBo = await app.model.tchcCanBo.get({ shcc: mscb });
            if (!canBo) {
                throw new InvalidUserError(17, context, { providerId, serviceId }, signature);
            } else {
                // const tongCongNo = data.reduce((total, item) => total + parseInt(item.congNo), 0);
                const rowCongNo = await app.model.tcTncnQuyetToanThue.get({ shcc: mscb, nam });
                const congNoDetail = await app.model.tcTncnQuyetToanThueDetail.get({ shcc: mscb, tinhTrang: 'CHUA_DONG', nam }, '*', 'dot ASC');
                const tongCongNo = congNoDetail?.soTienThanhToan || 0;
                if (!tongCongNo || tongCongNo <= 0) {
                    throw new NoDebtError(1, context, { customerCode }, signature);
                } else if (tongCongNo != parseInt(totalPaymentAmount)) {
                    throw new DifferrentDebtError(3, context, { providerId, serviceId }, signature);

                } else {
                    await app.model.tcTncnQuyetToanThueTransaction.create({
                        customerId: mscb,
                        nam,
                        amount: parseInt(totalPaymentAmount),
                        status: 1,
                        thoiGianSoPhu: time,
                        transDate: time,
                        serviceId,
                        billId: bills[0].billId,
                        checksum: signature,
                        bank: 'VCB',
                        transId: `VCB-${internalTransactionRefNo}`
                    });

                    const congNoAfterUpdated = await app.model.tcTncnQuyetToanThue.update({ shcc: mscb, nam: rowCongNo.nam }, { congNo: parseInt(rowCongNo.congNo) - parseInt(totalPaymentAmount) });
                    await app.model.tcTncnQuyetToanThueDetail.update({ shcc: mscb, nam, dot: congNoDetail.dot }, { tinhTrang: 'DA_DONG' });
                    // NOTIFICATION
                    try {
                        // Notification
                        await app.notification.send({
                            toEmail: canBo.email,
                            title: 'Thanh toán thành công',
                            subTitle: `Số tiền thuế: ${parseInt(totalPaymentAmount).toString().numberDisplay()} VNĐ của năm 2023`,
                            icon: 'fa-usd', iconColor: 'success'
                        });
                        // Sms
                        const contentSms = `Thay/Co ${canBo.ho} ${canBo.ten} da thanh toan thanh cong so tien ${parseInt(totalPaymentAmount).toString().numberDisplay()} VND thue TNCN nam ${nam}. Tran trong.`;
                        await app.sms.sendByViettel(canBo.email, canBo.dienThoaiCaNhan, app.toEngWord(contentSms));
                        // Email
                        const { value: contentEmail } = await app.model.tcSetting.get({ key: 'thueEmailDongEditorHtml' });
                        const { value: contentEmailText } = await app.model.tcSetting.get({ key: 'thueEmailDongEditorText' });
                        const { value: titleEmail } = await app.model.tcSetting.get({ key: 'thueEmailDongTitle' });
                        const emailHtml = contentEmail.replaceAll('{name}', `${canBo.ho} ${canBo.ten}`)
                            .replaceAll('{soTien}', `${parseInt(totalPaymentAmount).toString().numberDisplay()}`)
                            .replaceAll('{nam}', `${nam}`)
                            .replaceAll('{congNoConLai}', `${congNoAfterUpdated.congNo?.toString().numberDisplay()}`);
                        const emailText = contentEmailText.replaceAll('{name}', `${canBo.ho} ${canBo.ten}`)
                            .replaceAll('{soTien}', `${parseInt(totalPaymentAmount).toString().numberDisplay()}`)
                            .replaceAll('{nam}', `${nam}`)
                            .replaceAll('{congNoConLai}', `${congNoAfterUpdated.congNo?.toString().numberDisplay()}`);
                        await app.email.normalSendEmail('no-reply-khtc04@hcmussh.edu.vn', 'passFromMail', canBo.email, null, null, titleEmail, emailText, emailHtml, null);
                    } catch (error) {
                        console.error('Error in push notification:: ', error);
                    }
                    try {
                        console.info('Create queue to::', mscb);
                        app.messageQueue.send('quyetToanThue:send', { mscb: mscb });
                    }
                    catch (e) {
                        console.error('Add queue Transaction Fail', { e });
                    }
                    bills[0].billErrCode = '0';
                    context.status = 'SUCCESS';
                    context.errorCode = 0;

                    res.send({
                        context, payload: {
                            providerId, serviceId, bills: [
                                {
                                    billId: bills[0].billId,
                                    amount: bills[0].amount,
                                    billErrCode: '0'
                                }
                            ]
                        }, signature
                    });
                }
            }
        }
    };

    const paybillSinhvien = async ({ namHoc, hocKy, bank, type, customerCode, context, signature, totalPaymentAmount, providerId, serviceId, bills, time, internalTransactionRefNo, timeDetails, res }) => {
        const mssvRegex = /[A-Za-z0-9]{10,10}$/;
        const customerProcessedCode = mssvRegex.test(customerCode) ? customerCode.match(mssvRegex)[0] : customerCode;

        const khoaDotDong = type === types.PRODUCTION ? await app.model.tcDotDong.khoaDotDong(customerProcessedCode, Date.now()) : 1;
        const modelHocPhi = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
        const data = await modelHocPhi.getAll({ mssv: customerProcessedCode });

        if (!data || !data.length || khoaDotDong?.outBinds?.ret === 0) {
            throw new LockTransactionError(17, context, { providerId, serviceId }, signature);
        } else {
            let student = await app.model.fwStudent.get({ mssv: customerProcessedCode });
            if (!student) {
                throw new InvalidUserError(17, context, { providerId, serviceId }, signature);
            } else {
                const tongCongNo = await (type === types.PRODUCTION ? app.model.tcHocPhiTransaction : app.model.tcHocPhiTransactionSandbox).getCongNo(customerProcessedCode).then(item => item.outBinds.ret);
                const { dungSoTien: isCheck } = await app.model.tcSetting.getValue('dungSoTien');
                if (tongCongNo <= 0) {
                    throw new NoDebtError(1, context, { providerId, serviceId }, signature);
                } else if (tongCongNo != parseInt(totalPaymentAmount) && isCheck == '1') {
                    throw new DifferrentDebtError(3, context, { providerId, serviceId }, signature);

                } else {
                    if (type === types.PRODUCTION) {
                        const contentBill = await reduceBill(customerProcessedCode, parseInt(totalPaymentAmount));
                        await addBill(namHoc, hocKy, customerProcessedCode, parseInt(totalPaymentAmount), time, bills[0].billId, serviceId, signature, `VCB-${internalTransactionRefNo}`, 'VCB', contentBill.result, time);
                    }
                    else {
                        if (customerCode == 'USSH000002257060001') {
                            return setTimeout(() => res.status(504).send({ error: 'server time out' }), 1000 * 60 * 5);
                        } else if (customerCode == 'USSH000002056180094') {
                            throw new DifferrentDebtError(3, context, { providerId, serviceId }, signature);
                        }
                        await app.model.tcHocPhiTransactionSandbox.create({
                            namHoc, hocKy,
                            bank: bank.ma, transId: `VCB-${internalTransactionRefNo}`, transDate: time,
                            customerId: customerProcessedCode,
                            billId: bills[0].billId, serviceId, checksum: signature, amount: parseInt(totalPaymentAmount),
                            status: 1,
                        });
                    }
                    bills[0].billErrCode = '0';
                    context.status = 'SUCCESS';
                    context.errorCode = 0;

                    res.send({
                        context, payload: {
                            providerId, serviceId, bills: [
                                {
                                    billId: bills[0].billId,
                                    amount: bills[0].amount,
                                    billErrCode: '0'
                                }
                            ]
                        }, signature
                    });
                    if (type == types.PRODUCTION) {
                        try {
                            await app.model.tcHocPhiTransaction.notify('PAYBILL-VCB', { student, hocKy, namHoc, amount: totalPaymentAmount, payDate: `${timeDetails.year}${timeDetails.month}${timeDetails.day}${timeDetails.hour}${timeDetails.minute}${timeDetails.second}` });
                        }
                        catch (error) {
                            console.error('Notify Transaction Fail', { error });
                        }
                    }

                }
            }
        }
    };
    const paybill = async (type, req, res) => {
        try {

            let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeVcb, secretCodeVcbSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeVcb', 'secretCodeVcbSandbox');
            namHoc = Number(namHoc);
            hocKy = Number(hocKy);
            const secretCode = type === types.PRODUCTION ? secretCodeVcb : secretCodeVcbSandbox;
            let { context, payload, signature } = req.body;
            if (!(context && payload)) {
                res.sendStatus(400);
            } else {
                let { channelId, channelRefNumber, requestDateTime } = context,
                    { bills, customerCode, providerId, serviceId, internalTransactionRefNo, totalPaymentAmount, paymentMode } = payload;
                const responseMsgId = `${customerCode}?${Date.now()}`;
                context.responseMsgId = responseMsgId;

                const bank = await app.model.dmBank.get({ ma: 'VIETCOMBANK' });
                if (!bank || !bank.kichHoat) {
                    throw new BankConfigError(400, context, {}, signature);
                }
                if (!(channelId && channelRefNumber && requestDateTime && providerId && serviceId && customerCode && totalPaymentAmount && paymentMode && ['A', 'C', 'D'].includes(paymentMode) && internalTransactionRefNo)) {
                    throw new InvalidInquiryError(10, context, { customerCode }, signature);
                } else if (requestDateTime) {
                    requestDateTime = requestDateTime.toString();
                    let hour = requestDateTime.substring(11, 13),
                        minute = requestDateTime.substring(14, 16),
                        second = requestDateTime.substring(17, 19),
                        day = requestDateTime.substring(0, 2),
                        month = requestDateTime.substring(3, 5),
                        year = requestDateTime.substring(6, 10);
                    const timeDetails = {
                        hour,
                        minute,
                        second,
                        day,
                        month,
                        year
                    };
                    let time = new Date(year, parseInt(month) - 1, day, hour, minute, second).getTime();
                    if (isNaN(time)) {
                        throw new InvalidTimeInquiryError(20, context, { providerId, serviceId }, signature);
                    } else {
                        const dataRequest = `${channelId}|${channelRefNumber}|${secretCode}`,
                            mySignatureRequest = crypto.createHash('md5').update(dataRequest).digest('hex');

                        if (mySignatureRequest != signature) {
                            throw new InvalidSignatureError(18, context, { providerId, serviceId }, signature);
                        } else {
                            const dataResponse = `${channelId}|${channelRefNumber}|${responseMsgId}|${secretCode}`,
                                signature = crypto.createHash('md5').update(dataResponse).digest('hex');
                            if (!VCBProviders[providerId] || !VCBProviders[providerId].serviceIdVcb.includes(serviceId)) {
                                throw new InvalidBankConfigError(21, context, { providerId, serviceId }, signature);
                            }
                            else {
                                if (customerCode.startsWith('XHNV')) {
                                    return await paybillCanBo({ customerCode, context, signature, totalPaymentAmount, providerId, serviceId, bills, time, internalTransactionRefNo, res });
                                }
                                else {
                                    return await paybillSinhvien({ namHoc, hocKy, bank, type, customerCode, context, signature, totalPaymentAmount, providerId, serviceId, bills, time, internalTransactionRefNo, timeDetails, res });
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            if (!(error instanceof BaseVcbError)) {
                console.error(error);
                throw new OtherError(400, {}, {}, '');
            } else {
                throw error;
            }
        }
    };
};