module.exports = app => {
    // const serviceId = 'HocPhi';
    // const trangThaiGiaoDich = 0;
    // const crypto = require('crypto');
    // const types = {
    //     SANDBOX: 'sandbox',
    //     PRODUCTION: 'production'
    // };
    // const { reduceBill, addBill } = require('./reduceBill')(app);
    // // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    // // production
    // app.post('/api/agri-nvxhhcm/getbill', async (req, res) => {
    //     try {
    //         await getBill(types.PRODUCTION, req, res);
    //         app.model.tcBankRequest.create({
    //             url: '/api/agri-nvxhhcm/getbill',
    //             method: 'POST',
    //             body: JSON.stringify(req.body),
    //             userId: req.body.customer_id,
    //             isSuccess: 1,
    //             dataReturn: '',
    //             timeReturn: Date.now()
    //         }).catch(error => console.error(req.method, req.url, error));
    //     } catch (error) {
    //         app.model.tcBankRequest.create({
    //             url: '/api/agri-nvxhhcm/getbill',
    //             method: 'POST',
    //             body: JSON.stringify({ ...req.body }),
    //             userId: req.body.customer_id,
    //             isSuccess: 1,
    //             dataReturn: JSON.stringify({ error }),
    //             timeReturn: Date.now()
    //         }).catch(error => console.error(req.method, req.url, error));
    //         console.error('GET BILL AGRI: ', error);
    //         res.send({ result_code: '096' });
    //     }
    // });

    // // sandbox
    // app.post('/api/agri-nvxhhcm/sandbox/getbill', async (req, res) => {
    //     try {
    //         await getBill(types.SANDBOX, req, res);
    //     } catch (error) {
    //         console.error('GET BILL AGRI: ', error);
    //         res.send({ result_code: '096' });
    //     }
    // });

    // const getBill = async (type, req, res) => {
    //     let { secretCodeAgri, secretCodeAgriSandbox } = await app.model.tcSetting.getValue('secretCodeAgri', 'secretCodeAgriSandbox');
    //     const secretCode = type === types.PRODUCTION ? secretCodeAgri : secretCodeAgriSandbox;
    //     const { customer_id, service_id, checksum } = req.body,
    //         myChecksum = crypto.createHash('md5').update(`${secretCode}|${service_id}|${customer_id}`).digest('hex');

    //     if (!(customer_id && service_id && checksum)) {
    //         res.send({ result_code: '145' });
    //     }
    //     else if (service_id != serviceId) {
    //         res.send({ result_code: '020' });
    //     } else if (checksum != myChecksum) {
    //         res.send({ result_code: '007' });
    //     } else {
    //         const khoaDotDong = await app.model.tcDotDong.khoaDotDong(customer_id, Date.now());
    //         const model = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
    //         const hocPhi = await model.getAll({ mssv: customer_id.toString() });
    //         if (!hocPhi || !hocPhi.length || khoaDotDong?.outBinds?.ret === 0 || !trangThaiGiaoDich) {
    //             res.send({ result_code: '001' });
    //         } else {
    //             const tongCongNo = hocPhi.reduce((sum, item) => sum + parseInt(item.congNo), 0);
    //             if (tongCongNo <= 0) {
    //                 res.send({ result_code: '025' });
    //             } else {
    //                 let student = await app.model.fwStudent.get({ mssv: customer_id.toString() });
    //                 if (!student || parseInt(student.namTuyenSinh) == 2023) {
    //                     res.send({ result_code: '017' });
    //                 } else {

    //                     let name = `USSH ${student.ho} ${student.ten} ${tongCongNo.toString().numberDisplay()}`.toUpperCase();
    //                     if (name.length > 40) name = `USSH ${student.ho.getFirstLetters()}. ${student.ten} ${tongCongNo.toString().numberDisplay()}`.toUpperCase();
    //                     res.send({
    //                         result_code: '000', result_desc: 'success',
    //                         data: {
    //                             service_id,
    //                             customer_id: customer_id.toString(), customer_name: name, customer_addr: '',
    //                             type: 0, matchAmount: tongCongNo,
    //                         },
    //                     });
    //                 }
    //             }

    //         }
    //     }
    // };

    // // production
    // app.post('/api/agri-nvxhhcm/paybill', async (req, res) => {
    //     const trans_id = req.body.trans_id;
    //     try {
    //         await payBill(types.PRODUCTION, req, res);
    //         app.model.tcBankRequest.create({
    //             url: '/api/agri-nvxhhcm/paybill',
    //             method: 'POST',
    //             body: JSON.stringify({ ...req.body }),
    //             userId: req.body.customer_id,
    //             isSuccess: 1,
    //             dataReturn: '',
    //             timeReturn: Date.now()
    //         }).catch(error => console.error(req.method, req.url, error));
    //     } catch (error) {
    //         console.error(error);
    //         try {
    //             if (trans_id) {
    //                 const item = await app.model.tcHocPhiTransaction.update({ transId: trans_id }, { status: 0 });
    //                 if (!item) throw 'No transaction!';
    //                 const { namHoc, hocKy, customerId } = item;
    //                 const hocPhi = await app.model.tcHocPhi.get({ mssv: customerId, namHoc, hocKy });
    //                 await app.model.tcHocPhi.update({ mssv: customerId, namHoc, hocKy }, { congNo: parseInt(hocPhi.congNo) + parseInt(item.amount) });
    //             } else res.send({ result_code: '145' });
    //         } catch (error) {
    //             res.send({ result_code: '096' });
    //         }
    //         app.model.tcBankRequest.create({
    //             url: '/api/agri-nvxhhcm/paybill',
    //             method: 'POST',
    //             body: JSON.stringify({ ...req.body }),
    //             userId: req.body.customer_id,
    //             isSuccess: 0,
    //             dataReturn: '',
    //             timeReturn: Date.now()
    //         }).catch(error => console.error(req.method, req.url, error));
    //     }
    // });

    // // sandbox
    // app.post('/api/agri-nvxhhcm/sandbox/paybill', async (req, res) => {
    //     try {
    //         await payBill(types.SANDBOX, req, res);
    //     } catch (error) {
    //         res.send({ result_code: '096' });
    //     }
    // });

    // const payBill = async (type, req, res) => {
    //     let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeAgri, secretCodeAgriSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeAgri', 'secretCodeAgriSandbox');
    //     namHoc = Number(namHoc);
    //     hocKy = Number(hocKy);
    //     const secretCode = type === types.PRODUCTION ? secretCodeAgri : secretCodeAgriSandbox;
    //     const { trans_id, trans_date, customer_id, bill_id, service_id, amount, checksum } = req.body,
    //         myChecksum = crypto.createHash('md5').update(`${secretCode}|${trans_id}|${bill_id}|${amount}`).digest('hex');

    //     if (!(trans_id && trans_date && customer_id && bill_id && service_id && amount && checksum)) {
    //         res.send({ result_code: '145' });
    //     } else if (service_id != serviceId) {
    //         res.send({ result_code: '020' });
    //     } else if (checksum != myChecksum) {
    //         res.send({ result_code: '007' });
    //     } else {
    //         const khoaDotDong = await app.model.tcDotDong.khoaDotDong(customer_id, Date.now());
    //         const modelHocPhi = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
    //         // const modelHocPhiTransaction = type === types.PRODUCTION ? app.model.tcHocPhiTransaction : app.model.tcHocPhiTransactionSandbox;
    //         let hocPhi = await modelHocPhi.getAll({ mssv: customer_id });
    //         if (!hocPhi || !hocPhi.length || khoaDotDong?.outBinds?.ret === 0 || !trangThaiGiaoDich) {
    //             res.send({ result_code: '025' });
    //         } else {
    //             const tongCongNo = hocPhi.reduce((sum, item) => sum + parseInt(item.congNo), 0);
    //             const { dungSoTien: isCheck } = await app.model.tcSetting.getValue('dungSoTien');
    //             if (parseInt(amount) != tongCongNo && isCheck == '1') {
    //                 res.send({ result_code: '022' });
    //             } else {
    //                 let student = await app.model.fwStudent.get({ mssv: customer_id });
    //                 if (!student || parseInt(student.namTuyenSinh) == 2023) {
    //                     res.send({ result_code: '017' });
    //                 } else {
    //                     const contentBill = await reduceBill(customer_id, parseInt(amount));
    //                     // (mssv, amount, transDate, billId, serviceId, checkSum, transId, bank, contentBill) 
    //                     await addBill(namHoc, hocKy, customer_id, parseInt(amount), app.date.fullFormatToDate(trans_date).getTime(), bill_id, service_id, checksum, `agri-${trans_id}`, 'AGRI', contentBill.result, app.date.fullFormatToDate(trans_date).getTime());
    //                     // await modelHocPhiTransaction.addBill(namHoc, hocKy, 'AGRI', `agri-${trans_id}`, app.date.fullFormatToDate(trans_date).getTime(), customer_id, bill_id, service_id, parseInt(amount), checksum, contentBill.result);
    //                     // if (customer_id == '12345' && type == types.PRODUCTION) await app.model.tcHocPhi.update({ namHoc, hocKy, mssv: '12345' }, { congNo: '10000' });
    //                     res.send({ result_code: '000', result_desc: 'success' });
    //                     type == types.PRODUCTION && app.model.tcHocPhiTransaction.notify('PAYBILL-AGRI', { student, hocKy, namHoc, amount: parseInt(amount), payDate: trans_date.toString() });
    //                 }
    //             }
    //         }
    //     }
    // };
};