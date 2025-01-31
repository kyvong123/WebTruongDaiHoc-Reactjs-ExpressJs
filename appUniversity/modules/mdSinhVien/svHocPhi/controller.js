module.exports = app => {
    const axios = require('axios');
    const { QRCodeStyling } = require('qr-code-styling-node/lib/qr-code-styling.common.js');
    const nodeCanvas = require('canvas');
    const { VietQr, BankCode } = require('./../../../config/genQR')();
    app.permission.add({
        name: 'student:login', menu: { parentMenu: app.parentMenu.hocPhi }
    });

    app.get('/user/hoc-phi', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/hoc-phi-page', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/hoc-phi/invoice', app.permission.check('student:login'), app.templates.admin);
    const dateFormat = require('dateformat');
    const querystring = require('qs');
    const crypto = require('crypto');

    function sortObject(obj) {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
        }
        return sorted;
    }

    app.get('/api/sv/vnpay/start-thanh-toan/:bank', app.permission.check('student:login'), async (req, res) => {
        try {
            const student = req.session.user;
            const bank = req.params.bank;
            let { vnp_TmnCodeAgribank, vnp_TmnCodeVnpayAgribank, vnp_HashSecretAgribank, vnp_TmnCodeVcb, vnp_TmnCodeVnpayVcb, vnp_HashSecretVcb, vnp_Version, vnp_Command, vnp_CurrCode, vnp_ReturnUrl, hocPhiHocKy: hocKy, hocPhiNamHoc: namHoc, vnpayUrl } = await app.model.tcSetting.getValue('vnp_TmnCodeAgribank', 'vnp_TmnCodeVnpayAgribank', 'vnp_HashSecretAgribank', 'vnp_TmnCodeVcb', 'vnp_TmnCodeVnpayVcb', 'vnp_HashSecretVcb', 'vnp_Version', 'vnp_Command', 'vnp_CurrCode', 'vnp_ReturnUrl', 'hocPhiHocKy', 'hocPhiNamHoc', 'vnpayUrl');
            const bankMapper = {
                'agri': vnp_TmnCodeAgribank,
                'vnpay-agri': vnp_TmnCodeVnpayAgribank,
                'vcb': vnp_TmnCodeVcb,
                'vnpay-vcb': vnp_TmnCodeVnpayVcb
            }, hashMapper = {
                'agri': vnp_HashSecretAgribank,
                'vnpay-agri': vnp_HashSecretAgribank,
                'vcb': vnp_HashSecretVcb,
                'vnpay-vcb': vnp_HashSecretVcb
            },
                bankCodeMapper = {
                    'agri': 'VNBANK',
                    'vnpay-agri': 'AGRIBANKMC',
                    'vcb': 'VNBANK',
                    'vnpay-vcb': 'VIETCOMBANK'
                };

            if (!bank || !Object.keys(bankMapper).includes(bank)) throw 'Permission reject!';
            if (!student || !student.data || !student.data.mssv) throw 'Permission reject!';
            const mssv = student.data.mssv;
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            let vnp_BankCode = bankCodeMapper[bank];
            const dataHocPhi = await app.model.tcHocPhi.get({ mssv, hocKy, namHoc });
            let { congNo } = dataHocPhi;
            const vnp_OrderInfo = `USSH: Hoc phi SV ${mssv}, HK ${hocKy} NH ${namHoc} - ${parseInt(namHoc) + 1}`;
            const now = new Date(), vnp_CreateDate = dateFormat(now, 'yyyymmddHHmmss', false, true),
                vnp_IpAddr = ipAddr,
                vnp_Locale = 'vn',
                vnp_TxnRef = `USSH_${mssv}_${vnp_CreateDate}`;


            const vnp_Amount = congNo * 100, vnp_TmnCode = bankMapper[bank], vnp_HashSecret = hashMapper[bank];

            let params = { vnp_Version, vnp_BankCode, vnp_Command, vnp_TmnCode, vnp_Locale, vnp_CurrCode, vnp_TxnRef, vnp_OrderInfo, vnp_Amount, vnp_ReturnUrl, vnp_IpAddr, vnp_CreateDate };
            params = sortObject(params);

            const signData = querystring.stringify(params, { encode: false });
            const hmac = crypto.createHmac('sha512', vnp_HashSecret);

            const vnp_SecureHash = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
            params = app.clone(params, { vnp_SecureHash });
            const urlRequest = vnpayUrl + '?' + querystring.stringify(params, { encode: false });
            await app.model.tcHocPhiOrders.create({ hocKy, namHoc, refId: vnp_TxnRef, amount: congNo, bank: 'VNPAY', orderInfo: vnp_OrderInfo, fullRequest: urlRequest });
            console.log(` - Request to VNPAY: ${urlRequest}`);
            res.send(urlRequest);
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/sv/hoc-phi/all', app.permission.check('student:login'), async (req, res) => {
        try {
            const mssv = req.session.user.studentId,
                data = await app.model.tcHocPhi.getAllFeeOfStudent(mssv),
                { rows: hocPhiAll, hocphidetailall: hocPhiDetailAll } = data;
            res.send({ hocPhiAll: hocPhiAll.groupBy('namHoc'), hocPhiDetailAll: hocPhiDetailAll.groupBy('namHoc') });
        } catch (error) {
            res.send({ error });
        }
    });
    // const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');

    const objectGioiHan = async (namHoc, hocKy, namTuyenSinh) => {
        const { rows: listDinhMucNhom } = await app.model.tcDinhMuc.getHocPhiNhomAll(namHoc, hocKy, namTuyenSinh);
        const { rows: listDinhMucNganh } = await app.model.tcDinhMuc.getHocPhiNganhAll(namHoc, hocKy, namTuyenSinh);
        let objectDinhPhiTheoNhom = {};
        for (let item of listDinhMucNhom) {
            if (item.listNganhCon) {
                let listNganhCon = item.listNganhCon.split(',');
                for (let nganhCon of listNganhCon) {
                    objectDinhPhiTheoNhom[nganhCon] = item.gioiHan;
                }
            }
            else {
                objectDinhPhiTheoNhom[item.loaiHinhDaoTao] = item.gioiHan;
            }
        }
        for (let item of listDinhMucNganh) {
            objectDinhPhiTheoNhom[item.maNganh] = item.gioiHan;
        }
        return objectDinhPhiTheoNhom;
    };

    app.get('/api/sv/hoc-phi-page/all', app.permission.check('student:login'), async (req, res) => {
        try {
            let filter = {
                mssv: req.session.user.studentId
            };
            await app.model.tcDotDong.capNhatDongTien(filter.mssv);
            const tongHocPhiSinhVien = await app.model.tcHocPhi.getAll(filter, '*');
            let { rows: listMonHoc } = await app.model.tcHocPhi.getDetailHocPhi(req.session.user.studentId);
            // console.log(tongHocPhiSinhVien);
            if (tongHocPhiSinhVien.length > 0) {
                const soDuHocPhi = await app.model.tcSoDuHocPhi.get(filter).then(data => data.soTien);
                const mienGiam = await app.model.tcMienGiam.getAll(filter);
                filter = app.utils.stringify(filter);
                const data = await app.model.tcHocPhi.sinhVienGetHocPhi(filter);
                const sinhVien = await app.model.fwStudent.get({ mssv: req.session.user.studentId });
                const mapGioiHan = await objectGioiHan(tongHocPhiSinhVien[0].namHoc, tongHocPhiSinhVien[0].hocKy, sinhVien.namTuyenSinh);
                let soTienGioiHan = mapGioiHan[sinhVien.loaiHinhDaoTao] ? mapGioiHan[sinhVien.loaiHinhDaoTao] : mapGioiHan[sinhVien.maNganh];
                const { noiDungLuuYEditorHtml: noiDungLuuY } = await app.model.tcSetting.getValue('noiDungLuuYEditorHtml');
                res.send({ hocPhiDetail: data.rows, hocPhiTong: tongHocPhiSinhVien, soDuHocPhi, namTuyenSinh: sinhVien.namTuyenSinh, gioiHan: soTienGioiHan, mienGiam: mienGiam || 0, listMonHoc, noiDungLuuY: `${noiDungLuuY}` || '' });
            }
            else {
                res.send({});
            }

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/sv/mobile/hoc-phi', app.permission.check('student:login'), async (req, res) => {
        try {
            const mssv = req.session.user.studentId;
            await app.model.tcDotDong.capNhatDongTien(mssv);

            const filter = req.query || {}; // namHoc, hocKy, daThanhToan

            const tongCongNo = await app.model.tcHocPhiTransaction.getCongNo(mssv).then(data => data.outBinds.ret);
            let detailHocPhi = await app.model.tcHocPhi.sinhVienGetHocPhi(app.utils.stringify({ mssv, ...filter })).then(data => data.rows.filter(item => item.active));

            detailHocPhi = detailHocPhi.map(item => {
                const { tenLoaiPhi, namHoc, hocKy, daDong, canDong } = item;
                return {
                    tenLoaiPhi, namHoc, hocKy,
                    canDong: parseInt(canDong || 0),
                    daDong: parseInt(daDong || 0),
                    conLai: parseInt(canDong || 0) - parseInt(daDong || 0),
                };
            });
            const tinhTrang = await app.model.tcDotDong.khoaDotDong(mssv, Date.now()).then(data => !!data);
            res.send({ tongCongNo, detailHocPhi, tinhTrang });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/sv/hoc-phi-sub-detail/all', app.permission.check('student:login'), async (req, res) => {
        try {
            // TODO - namHoc - hocKy
            // const settings = await getSettings();
            const idDotDong = req.query?.idDotDong || '';
            if (!idDotDong) {
                throw ('Không thể truy cập học phí, vui lòng thử lại sau');
            }
            const filter = {
                idDotDong,
                mssv: req.session.user.studentId
            };

            let sinhVien = await app.model.fwStudent.get({ mssv: (filter.mssv || '') });
            // let lopSinhVien = await app.model.dtLop.get({ maLop: sinhVien.lop });

            // if ((!lopSinhVien || !lopSinhVien.khoaSinhVien) && sinhVien.namTuyenSinh == 2022) {
            //     sinhVien.namTuyenSinh = 2022;
            // }
            // else {
            //     sinhVien.namTuyenSinh = lopSinhVien.khoaSinhVien;
            // }
            const subDetail = await app.model.tcHocPhiSubDetail.getAll(filter);
            res.send({ subDetail, khoaSinhVien: sinhVien.namTuyenSinh });
        } catch (error) {
            res.send({ error });
        }
    });

    const https = require('https');

    // app.get('/api/sv/hoc-phi/qr-vcb/cancel', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
    //     try {
    //         res.send({ result_code: '0000', result_message: 'OK' });
    //     }
    //     catch (error) {
    //         console.error({ error });
    //     }
    // });


    const getVietComBankQr = async (mssv, soTien, res) => {
        const studentInfo = await app.model.fwStudent.get({ mssv: mssv.startsWith('BH') ? mssv.substr('BH'.length) : mssv }, 'ho,ten,mssv');

        const qrCodeImage = new QRCodeStyling({
            nodeCanvas, // this is required
            width: 400,
            height: 400,
            // data: VietQr.getContent(BankCode.BIDV, '96234' + mssv, soTien, app.toEngWord(`USSH ${studentInfo.ho} ${studentInfo.ten} ${soTien.toString().numberDisplay()}`.toUpperCase())).sign(), //for BIDV
            data: VietQr.getContent(BankCode.Vietcombank, 'USSH' + VietQr.pad(mssv, 15), soTien, app.toEngWord(`USSH ${studentInfo.mssv} ${soTien.toString().numberDisplay()}`.toUpperCase())).sign(), //for Vietcombank
            // data: VietQr.getContent(BankCode.Vietcombank, 9785788177, soTien, app.toEngWord(`USSH ${studentInfo.ho} ${studentInfo.ten} ${soTien.toString().numberDisplay()}`.toUpperCase())).sign(),
            image: app.fs.readFileSync(app.path.join(app.publicPath, 'img', 'hcmussh.png')),
            dotsOptions: {
                color: '#102a54',
                type: 'rounded',
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 0.2,
                hideBackgroundDots: false,
                imageSize: 0.4,
            },
            cornersSquareOptions: {
                type: 'extra-rounded',
                color: '#1E4199',

            },
            cornersDotOptions: {
                color: '#27303D',
                type: 'square',
            },
        });

        const buffer = await qrCodeImage.getRawData();
        const image = new app.jimp(500, 600, 'white');
        // const titleFont = await app.jimp.loadFont(app.jimp.FONT_SANS_32_BLACK);
        const titleFont = await app.jimp.loadFont(app.path.join(app.assetPath, 'pdf/fonts/roboto32.fnt'));
        const textFont = await app.jimp.loadFont(app.path.join(app.assetPath, 'pdf/fonts/roboto20.fnt'));
        // const textFont = await app.jimp.loadFont(app.jimp.FONT_SANS_16_BLACK);
        const drawText = (font, height, text) => {
            const stat = app.jimp.measureText(font, text);
            image.print(font, Math.floor((500 - stat) / 2), height, text);
        };
        drawText(titleFont, 470, app.toEngWord(`${studentInfo.ho} ${studentInfo.ten}`));
        drawText(textFont, 510, 'USSH' + VietQr.pad(mssv, 15));
        drawText(titleFont, 538, `${soTien.toString().numberDisplay()} VND`);
        image.composite(await app.jimp.read(buffer), 50, 50);
        res.send({
            base64: await image.getBufferAsync(app.jimp.AUTO).then(buffer => buffer.toString('base64'))
            // image.getBase64Sync(app.jimp.AUTO,)
        });
        return;
    };


    app.post('/api/sv/hoc-phi/qr-vcb', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let user = req.session.user,
                { studentId: mssv } = user;
            const studentInfo = await app.model.fwStudent.get({ mssv }, 'ho,ten');
            if (!studentInfo) {
                return res.send({ result_code: '017' });
            }
            const khoaDotDong = await app.model.tcDotDong.khoaDotDong(mssv, Date.now());
            if (req.body.prefixBillBhyt == 'BH') {
                const tongCongNo = await app.model.tcHocPhiTransaction.getCongNoBhyt(mssv).then(item => item.outBinds.ret);
                return await requestToBidvQr('BH' + mssv.toString(), tongCongNo, res);
            }
            else {
                if (khoaDotDong?.outBinds?.ret === 0) {
                    return res.send({ error: 'Không thể thực hiện giao dịch ngoài thời gian cho phép' });
                }
            }
            const hocPhi = await app.model.tcHocPhi.getAll({ mssv });
            if (!hocPhi || !hocPhi.length) {
                return res.send({ error: 'Không tồn tại học phí!' });
            }
            const tongCongNo = await app.model.tcHocPhiTransaction.getCongNo(mssv).then(item => parseInt(item.outBinds.ret));
            if (tongCongNo <= 0) throw 'Không tìm thấy khoản cần thanh toán';
            await getVietComBankQr(mssv, tongCongNo, res);
            // crypto.createHash('md5').update(`${secretCodeBidv}|${requestId}|${serviceId}|${mssv}|${null}|${null}|${null}|${null}|${null}`).digest('hex')
        } catch (dataError) {
            console.error(dataError);
            res.send({ error: 'Lỗi khi thanh toán bằng QR-VCB!' });
        }
    });

    const requestToBidvQr = async (mssv, soTien, res) => {
        if (!mssv.startsWith('BH')) {
            return getVietComBankQr(mssv, soTien, res);
        }
        if (soTien <= 0) throw 'Không tìm thấy công nợ';
        const serviceId = '347002';

        const { secretCodeBidv } = await app.model.tcSetting.getValue('secretCodeBidv'),
            requestId = `${mssv}t${Date.now()}`,
            studentInfo = await app.model.fwStudent.get({ mssv: mssv.startsWith('BH') ? mssv.substr('BH'.length) : mssv }, 'ho,ten');

        const dataRequest = {
            msg: {
                header: {
                    appCode: 'BIDVPAYGATE',
                    requestId: requestId,
                    username: 'USSH',
                    password: 'USSH',
                    secureCode: crypto.createHash('md5').update(`${secretCodeBidv}|${requestId}|${serviceId}|${mssv}|${null}|${null}|${null}|${null}|${null}`).digest('hex'),
                    accessToken: ''
                },
                body: {
                    serviceId,
                    channelId: null,
                    code: mssv,
                    amount: soTien,
                    name: app.toEngWord(`${studentInfo.ho} ${studentInfo.ten}`),
                    description: app.toEngWord(`USSH ${studentInfo.ho} ${studentInfo.ten} ${soTien.toString().numberDisplay()}`.toUpperCase()),
                    extraInfo1: null,
                    extraInfo2: null,
                    extraInfo3: null,
                    extraInfo4: null,
                    extraInfo5: null,
                }
            }
        }, postBody = JSON.stringify(dataRequest),
            option = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postBody.length
                },
                timeout: 10000, // in ms
            };
        console.log(` + Requesting to BIDV QR: ${postBody}`);
        const requestToBidv = () => new Promise((resolve, rejects) => {
            const url = 'https://www.bidv.net/global/vn/paygate-gateway/genVietQR/v002';
            const request = https.request(url, option, (responseBidv) => {
                if (responseBidv.statusCode < 200 || responseBidv.statusCode > 299) {
                    console.error(`BIDV-QR: HTTPS status code ${responseBidv.statusCode}`);
                    rejects({ error: `BIDV-QR: HTTPS status code ${responseBidv.statusCode}`, body: postBody });
                }
                const body = [];
                responseBidv.on('data', (chunk) => body.push(chunk));
                responseBidv.on('end', () => {
                    const resString = Buffer.concat(body).toString();
                    resolve(resString);
                });
            });
            request.on('error', (err) => {
                console.error('BIDV-QR: Error', err);
                rejects({ error: err, body: postBody });
            });

            request.on('timeout', () => {
                request.destroy();
                console.error({ error: 'BIDV-QR: Timeout (10000ms)', body: postBody });
                rejects();
            });
            request.write(postBody);
            request.end();
        });

        const data = JSON.parse(await requestToBidv());

        if (data.msg?.body) {
            const base64Image = data.msg.body.vietQRImage;
            res.send({ base64: base64Image });
        } else {
            throw `Lỗi kết nối đến BIDV: ${data}`;
        }
        app.model.tcBankRequest.create({
            url: '/api/sv/hoc-phi/qr-bidv',
            timeReturn: Date.now(),
            isSuccess: 1,
            dataReturn: JSON.stringify(data),
            userId: mssv,
            method: 'POST',
            body: postBody,
        });
    };

    app.post('/api/sv/hoc-phi/qr-bidv', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
        try {
            let user = req.session.user,
                { studentId: mssv } = user;
            const studentInfo = await app.model.fwStudent.get({ mssv }, 'ho,ten');
            if (!studentInfo) {
                return res.send({ result_code: '017' });
            }
            const khoaDotDong = await app.model.tcDotDong.khoaDotDong(mssv, Date.now());
            if (req.body.prefixBillBhyt == 'BH') {
                const tongCongNo = await app.model.tcHocPhiTransaction.getCongNoBhyt(mssv).then(item => item.outBinds.ret);
                return await requestToBidvQr('BH' + mssv.toString(), tongCongNo, res);
            }
            else {
                if (khoaDotDong?.outBinds?.ret === 0) {
                    return res.send({ error: 'Không thể thực hiện giao dịch ngoài thời gian cho phép' });
                }
            }
            const hocPhi = await app.model.tcHocPhi.getAll({ mssv });
            if (!hocPhi || !hocPhi.length) {
                return res.send({ error: 'Không tồn tại học phí!' });
            }
            const tongCongNo = await app.model.tcHocPhiTransaction.getCongNo(mssv).then(item => parseInt(item.outBinds.ret));
            if (tongCongNo <= 0) throw 'Không tìm thấy khoản cần thanh toán';
            await requestToBidvQr(mssv, tongCongNo, res);
            // crypto.createHash('md5').update(`${secretCodeBidv}|${requestId}|${serviceId}|${mssv}|${null}|${null}|${null}|${null}|${null}`).digest('hex')
        } catch (dataError) {
            app.model.tcBankRequest.create({
                url: '/api/sv/hoc-phi/qr-bidv',
                timeReturn: Date.now(),
                dataReturn: JSON.stringify(dataError.error),
                userId: req.session.user.studentId || -1,
                method: 'POST',
                body: dataError.body,
            });
            // app.fs.deleteImage(app.path.join('img', 'BIDV_QR', `QR_${req.session.user.studentId}.png`));
            console.error(dataError);
            res.send({ error: 'Lỗi khi thanh toán bằng QR-BIDV!' });
        }
    });

    // const FormData = require('form-data');

    // app.post('/api/sv/hoc-phi/qr-vcb', app.permission.orCheck('student:login', 'student:pending'), async (req, res) => {
    //     try {
    //         let user = req.session.user,
    //             { studentId: mssv, email } = user;

    //         const studentInfo = await app.model.fwStudent.get({ mssv });

    //         const { merchantSitecodeVcb: merchantSitecode, merchantPasscodeVcb: merchantPasscode } = await app.model.tcSetting.getValue('merchantSitecodeVcb', 'merchantPasscodeVcb'),
    //             requestId = `${mssv}`;
    //         // requestId = `${mssv}t${Date.now()}`;

    //         let postBody = new FormData();
    //         let dataRequest = {
    //             function: 'CreateOrder',
    //             merchant_site_code: merchantSitecode,
    //             order_code: requestId,
    //             order_description: '',
    //             amount: 20000,
    //             currency: 'VND',
    //             buyer_fullname: app.toEngWord(`${studentInfo.ho} ${studentInfo.ten}`),
    //             buyer_email: email || studentInfo.emailTruong || '',
    //             buyer_mobile: '0854557858',
    //             buyer_address: 'USSH',
    //             return_url: 'https://hcmussh.edu.vn/user',
    //             cancel_url: 'http://localhost:7012/api/sv/hoc-phi/qr-vcb/cancel',
    //             notify_url: '',
    //             language: 'vi',
    //             version: '2.0',
    //             payment_method_code: 'QRCODE',
    //             bank_code: 'VCB',
    //         };

    //         dataRequest['checksum'] = crypto.createHash('md5').update(`${7}|${requestId}|${''}|${20000}|${'VND'}|${dataRequest.buyer_fullname}|${dataRequest.buyer_email}|${dataRequest.buyer_mobile}|${dataRequest.buyer_address}|${dataRequest.return_url}|${dataRequest.cancel_url}|${dataRequest.notify_url}|${'vi'}|${merchantPasscode}`).digest('hex');

    //         Object.keys(dataRequest).map(item => postBody.append(item, dataRequest[item]));


    //         console.log(` + Requesting to VCB QR: ${postBody}`);
    //         const requestToVcb = () => new Promise((resolve, rejects) => {
    //             const url = 'https://vietcombank.nganluong.vn/api/web/checkout/version_1_0/';
    //             const option = {
    //                 method: 'POST',
    //                 headers: postBody.getHeaders(),
    //                 timeout: 10000, // in ms
    //             };
    //             const request = https.request(url, option, responseVcb => {
    //                 if (responseVcb.statusCode < 200 || responseVcb.statusCode > 299) {
    //                     console.error(`VCB-QR: HTTPS status code ${responseVcb.statusCode}`);
    //                     rejects({ error: `VCB-QR: HTTPS status code ${responseVcb.statusCode}`, body: postBody });
    //                 }
    //                 const body = [];
    //                 responseVcb.on('data', (chunk) => body.push(chunk));
    //                 responseVcb.on('end', () => {
    //                     const resString = Buffer.concat(body).toString();
    //                     resolve(resString);
    //                 });
    //             });

    //             request.on('error', (err) => {
    //                 console.error('VCB-QR: Error', err);
    //                 rejects({ error: err, body: postBody });
    //             });

    //             request.on('timeout', () => {
    //                 request.destroy();
    //                 console.error({ error: 'VCB-QR: Timeout (10000ms)', body: postBody });
    //                 rejects();
    //             });

    //             postBody.pipe(request);
    //             request.end();
    //         });

    //         const requestToVcbQr = (urlGetQr) => new Promise((resolve, rejects) => {
    //             const request = https.get(urlGetQr, responseVcb => {
    //                 if (responseVcb.statusCode < 200 || responseVcb.statusCode > 299) {
    //                     console.error(`VCB-QR: HTTPS status code ${responseVcb.statusCode}`);
    //                     rejects({ error: `VCB-QR: HTTPS status code ${responseVcb.statusCode}` });
    //                 }
    //                 const body = [];
    //                 responseVcb.on('data', (chunk) => body.push(chunk));
    //                 responseVcb.on('end', () => {
    //                     const resString = Buffer.concat(body).toString();
    //                     resolve(resString);
    //                 });
    //             });

    //             request.on('error', (error) => {
    //                 console.error('VCB-QR: Error', error);
    //                 rejects({ error });
    //             });

    //             request.end();
    //         });

    //         const data = app.utils.parse(await requestToVcb());
    //         if (data.result_code != '0000') {
    //             console.error(`VCB-QR: Error code (${data.result_code}): ${data.result_message}`);
    //             throw data.result_message;
    //         }

    //         const { checkout_url: checkoutUrl, token_code: tokenCode } = data.result_data;
    //         console.log({ tokenCode });

    //         const dataQr = app.utils.parse(await requestToVcbQr(checkoutUrl));
    //         if (dataQr.result_code != '0000') {
    //             console.error(`VCB-QR: Error code (${data.result_code}): ${data.result_message}`);
    //             throw data.result_message;
    //         }

    //         const base64Image = dataQr.result_data.data_qr;

    //         console.log({ base64Image });
    //         res.send({ base64: base64Image });
    //     } catch (dataError) {
    //         app.consoleError(req, dataError);
    //         res.send({ dataError });
    //     }
    // });

    app.get('/api/sv/invoice/page', app.permission.check('student:login'), async (req, res) => {
        const mssv = req.session.user.studentId;
        let list = await app.model.tcHocPhiTransaction.getAll({ customerId: mssv, status: 1 }, '*');
        res.send({ list });
    });
    // API
    const url = {
        login: '/auth/token',
        hsmPublish: '/code/itg/invoicepublishing/publishhsm',
        view: '/invoicepublished/linkview',
        download: '/code/itg/invoicepublished/downloadinvoice',
        cancel: '/code/itg/invoicepublished/cancel',
        convert: '/code/itg/invoicepublished/voucher-paper'
    };


    const getMisaToken = async () => {
        try {
            const { meinvoiceAppId: appid, meinvoiceMaSoThue: taxcode, meinvoiceUsername: username, matKhauMeinvoice: password } = await app.model.tcSetting.getValue('meinvoiceAppId', 'meinvoiceMaSoThue', 'meinvoiceUsername', 'matKhauMeinvoice');
            const instance = await getMisaAxiosInstance(false);
            const response = await instance.post(url.login, {
                appid,
                taxcode,
                username,
                password,
            });
            return response.Data;
        } catch (error) {
            return null;
        }
    };

    const getMisaAxiosInstance = async (errorHandler = true) => {
        const baseUrl = (await app.model.tcSetting.getValue('meinvoiceUrl')).meinvoiceUrl;
        const axiosInstance = axios.create({
            baseURL: baseUrl,
            timeout: 100000,
            headers: {
                Authorization: 'Bearer ' + app.misaInvoiceAccessTokenSv,
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        });

        axiosInstance.interceptors.response.use(async (response) => {
            const data = response.data || {};
            if (!data.Success) {
                const originalRequest = response.config;
                if (originalRequest.url.endsWith(url.login)) {
                    console.error('MisaInvoice: Đăng nhập thất bại', data.ErrorCode, data.Errors);
                    return Promise.reject('MisaInvoice: Đăng nhập thất bại');
                } else if (errorHandler) {
                    if (['InvalidTokenCode', 'TokenExpiredCode'].includes(data.ErrorCode)) {
                        const newToken = await getMisaToken();
                        if (newToken) {
                            app.misaInvoiceAccessTokenSv = newToken;
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return (await getMisaAxiosInstance(false))(originalRequest);
                        }
                    }
                }
                return Promise.reject(response.data);
            }
            return response.data;
        }, (error) => {
            console.error('MisaInvoice Error:: ', error);
            return Promise.reject(error);
        });
        return axiosInstance;
    };
    app.misaInvoiceAccessTokenSv = 'Bearer Token';

    app.get('/api/sv/invoice/paper/download/:id', app.permission.check('student:login'), async (req, res) => {
        try {
            const id = req.params.id;
            const name = req.query.converter || `${req.session.user.lastName || ''} ${req.session.user.firstName || ''}`;
            const instance = await getMisaAxiosInstance();
            const invoice = await app.model.tcHocPhiTransactionInvoice.get({ id });
            if (!invoice) throw 'Hóa đơn không tồn tại';
            if (!req.session.user.permissions.includes('developer:login') && invoice.mssv != req.session.user.studentId) {
                return res.status(401).send({ error: 'permission denied' });
            }
            const response = await instance.post(url.convert, {
                'Converter': name,
                'ConvertDate': app.utils.toIsoString(new Date()).slice(0, 10),
                'TransactionIDList': [invoice.invoiceTransactionId]
            });
            let data = app.utils.parse(response.Data);
            if (!data.length) throw 'invalid response';
            let item = data[0];
            if (item.ErrorCode) throw data.ErrorCode;
            const file = item.Data;
            res.writeHead(200, [['Content-Type', 'application/pdf'], ['Content-Disposition', 'attachment;filename=' + `${invoice.mssv}-${invoice.namHoc}-${invoice.hocKy}.pdf`]]);
            res.end(Buffer.from(file, 'base64'));
        } catch (error) {
            console.error('GET /api/sv/invoice/paper/download/:id', error);
            res.status(400).send({ error });
        }
    });

    // const listData = require('./data.json');
    // app.get('/api/sv/test/123', app.permission.check('user:login'), async (req, res) => {
    //     try {
    //         const ngayTao = Date.now();
    //         let chunks = listData.chunk(50);
    //         await Promise.all(chunks.map(async chunk => {
    //             for (let item of chunk) {
    //                 await app.model.tccbCapMaCanBo.create({ ...item, ngaySinh: new Date(Date(item.ngaySinh)).getTime(), trangThai: 2, nguoiGui: 'Dữ liệu cũ', modifier: 'bao.lethpttpcb@hcmut.edu.vn', thoiGianTao: ngayTao, timeModified: ngayTao });
    //             }
    //         }));
    //         res.send({ chunks });
    //     } catch (error) {
    //         console.error({ error });
    //         res.send({ error });
    //     }
    // });
};
