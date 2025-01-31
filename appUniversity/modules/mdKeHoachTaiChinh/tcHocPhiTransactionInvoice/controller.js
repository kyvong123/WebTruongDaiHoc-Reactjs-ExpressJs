module.exports = app => {
    const moment = require('moment');
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5007: { title: 'Danh sách hóa đơn', link: '/user/finance/invoice', icon: 'fa fa-list-alt', groupIndex: 1, backgroundColor: '#AC2D34' },
        },
    };
    const request = require('request');
    const axios = require('axios');

    app.permission.add({ name: 'tcInvoice:read', menu }, 'tcInvoice:write', 'tcInvoice:delete', 'tcInvoice:export');

    app.permissionHooks.add('staff', 'addRolesTcInvoice', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcInvoice:read', 'tcInvoice:write', 'tcInvoice:delete');
            resolve();
        } else resolve();
    }));


    const url = {
        login: '/auth/token',
        hsmPublish: '/code/itg/invoicepublishing/publishhsm',
        view: '/invoicepublished/linkview',
        download: '/code/itg/invoicepublished/downloadinvoice',
        cancel: '/code/itg/invoicepublished/cancel',
        convert: '/code/itg/invoicepublished/voucher-paper',
        checkStatus: '/code/itg/invoicepublished/invoicestatus'
    };

    app.get('/user/finance/invoice', app.permission.check('tcInvoice:read'), app.templates.admin);


    const getMisaToken = async () => {
        try {
            const { meinvoiceAppId: appid, meinvoiceMaSoThue: taxcode, meinvoiceUsername: username, matKhauMeinvoice: password } = await app.model.tcSetting.getValue('meinvoiceAppId', 'meinvoiceMaSoThue', 'meinvoiceUsername', 'matKhauMeinvoice');
            const instance = await app.getMisaAxiosInstance(false);
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

    app.getMisaAxiosInstance = async (errorHandler = true) => {
        const baseUrl = (await app.model.tcSetting.getValue('meinvoiceUrl')).meinvoiceUrl;
        const axiosInstance = axios.create({
            baseURL: baseUrl,
            timeout: 100000,
            headers: {
                Authorization: 'Bearer ' + app.misaInvoiceAccessToken,
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
                            app.misaInvoiceAccessToken = newToken;
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return (await app.getMisaAxiosInstance(false))(originalRequest);
                        }
                    }
                }
                return Promise.reject(response.data);
            }
            return response.data;
        }, (error) => {
            console.error('MisaInvoice: error', error);
            return Promise.reject(error);
        });
        return axiosInstance;
    };
    app.misaInvoiceAccessToken = 'Bearer Token';

    const compileInvoice = (hocPhi, details, mauHoaDon, transId) => {

        const invoiceDate = new Date(),
            refID = `${hocPhi.mssv}-${hocPhi.namHoc}-${hocPhi.hocKy}-${invoiceDate.getTime()}-${transId}`,
            totalAmountOC = details.reduce((partialSum, detail) => partialSum + parseInt(detail.soTien), 0);
        return {
            'RefID': refID,
            'OriginalInvoiceData': {
                'RefID': refID,
                'InvSeries': mauHoaDon,
                'InvoiceName': 'Hóa đơn thu học phí',
                'InvDate': app.utils.toIsoString(invoiceDate),
                'CurrencyCode': 'VND',
                'ExchangeRate': 1.0,
                'PaymentMethodName': 'CK',
                'IsInvoiceSummary': false,
                'SellerTaxCode': '0101243150-382',
                //MSSV
                'Customfield1': hocPhi.mssv,
                //Khóa lớp
                'Customfield2': hocPhi.tenLoaiHinhDaoTao,
                //Khoa
                'Customfield3': hocPhi.tenKhoa,
                // 'SellerAddress': 'Tầng X, Tòa nhà Y, Số zzz Cầu Giấy - Hà Nội',
                // 'BuyerLegalName': 'Công ty cổ phần MISA (Test - 666)',
                // 'BuyerTaxCode': '0101243150-666',
                'BuyerFullName': `${hocPhi.ho} ${hocPhi.ten}`.trim().toUpperCase(),
                // 'BuyerAddress': '',
                'BuyerEmail': hocPhi.email,
                'ContactName': null,
                'DiscountRate': 0,
                'TotalAmountWithoutVATOC': null,
                // 'TotalVATAmountOC': 15000.0,
                'TotalDiscountAmountOC': 0,
                'TotalAmountOC': totalAmountOC,
                'TotalAmountInWords': app.utils.numberToVnText(`${totalAmountOC}`) + ' đồng.',
                'OriginalInvoiceDetail': details.length ? details.map((detail, index) => {
                    return {
                        'ItemType': 1,
                        'LineNumber': index + 1,
                        'SortOrder': index + 1,
                        'ItemCode': 'HOC-PHI',
                        'ItemName': detail.tenLoaiPhi,
                        'UnitName': 'Học kỳ',
                        'Quantity': 1,
                        'UnitPrice': parseInt(detail.soTien),
                        'DiscountRate': null,
                        'DiscountAmountOC': null,
                        'DiscountAmount': null,
                        'AmountOC': parseInt(detail.soTien),
                        'Amount': parseInt(detail.soTien),
                        'AmountWithoutVATOC': parseInt(detail.soTien),
                        'AmountWithoutVAT': parseInt(detail.soTien),
                        // 'VATRateName': '10%',
                        // 'VATAmountOC': 15000.0,
                        // 'VATAmount': 15000.0
                    };
                }) : null,
                'TaxRateInfo': [
                    // {
                    //     // 'VATRateName': '10%',
                    //     // 'AmountWithoutVATOC': 150000.0,
                    //     // 'VATAmountOC': 15000.0
                    // }
                ],
                'FeeInfo': null,
                // 'OptionUserDefined': {
                //     'MainCurrency': 'VND',
                //     'AmountDecimalDigits': '2',
                //     'AmountOCDecimalDigits': '2',
                //     'UnitPriceOCDecimalDigits': '2',
                //     'UnitPriceDecimalDigits': '2',
                //     'QuantityDecimalDigits': '3',
                //     'CoefficientDecimalDigits': '2',
                //     'ExchangRateDecimalDigits': '2',
                //     'ClockDecimalDigits': '4'
                // },
                'TotalAmount': totalAmountOC,
                'TotalAmountWithoutVAT': null,
                'TotalVATAmount': null,
                'TotalDiscountAmount': 0,
                'TotalSaleAmountOC': 0,
                'TotalSaleAmount': null,
                'IsTaxReduction43': null,
                'IsTaxReduction': null,
                'TotalAmountInWordsVN': null,
                'TotalAmountInWordsUnsignNormalVN': null
            }
        };
    };


    const getInvoiceDetail = async (namHoc, hocKy, mssv, loaiPhi) => {
        let { rows: detailList } = await app.model.tcHocPhi.sinhVienGetHocPhi(app.utils.stringify({ mssv, namHoc, hocKy }));
        detailList = detailList.filter(item => (item.isTamThu == 0 || item.isTamThu == 1 && !detailList.find(loaiPhi => loaiPhi.tamThu == item.idLoaiPhi)));
        if (!loaiPhi || !loaiPhi.length || !detailList.length || new Set(loaiPhi).size != loaiPhi.length || loaiPhi.some(item => !detailList.some(detail => detail.idLoaiPhi == item))) {
            throw 'Dữ liệu không hợp lệ';
        } else {
            const checkHocPhi = detailList.find(item => parseInt(item.daDong) == 0);
            if (checkHocPhi) {
                throw `${checkHocPhi.tenLoaiPhi} chưa được thanh toán`;
            }
            else {
                const result = await Promise.all(loaiPhi.map(async (item) => {
                    return { loaiPhi: item, tenLoaiPhi: (await app.model.tcLoaiPhi.get({ id: item })).ten, soTien: detailList.find(detail => detail.idLoaiPhi == item).daDong };
                }));
                return result;
            }

        }
    };

    app.post('/api/khtc/invoice', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const { mssv, hocKy, namHoc, loaiPhi } = req.body;
            if (await app.model.tcHocPhiTransactionInvoice.get({ mssv, hocKy, namHoc, lyDoHuy: null })) {
                throw 'Hóa đơn đã tồn tại';
            }
            let hocPhi = await app.model.tcHocPhi.getInvoiceInfo(mssv, parseInt(namHoc), parseInt(hocKy));
            if (!hocPhi.rows || !hocPhi.rows.length) {
                throw 'Không có dữ liệu hóa đơn';
            }
            hocPhi = hocPhi.rows[0];
            const details = await getInvoiceDetail(namHoc, hocKy, mssv, loaiPhi);
            if (!details.length) {
                throw 'Không có dữ liệu giao dịch';
            }
            const mauHoaDon = await app.model.tcSetting.getValue('meinvoiceMauHoaDon');
            let response = null;
            try {
                const misaInstance = await app.getMisaAxiosInstance();
                response = await misaInstance.post(
                    url.hsmPublish,
                    [compileInvoice(hocPhi, details, mauHoaDon.meinvoiceMauHoaDon)]
                );
            } catch (error) {
                throw { message: 'Tạo hóa đơn lỗi', error };
            }

            const data = app.utils.parse(response.Data);
            if (!data || !data.length || data[0].ErrorCode) {
                throw { message: 'Tạo hóa đơn lỗi', error: data[0].ErrorCode };
            }
            const emails = await getMailConfig();
            const email = emails.splice(Math.floor(Math.random() * emails.length), 1).pop();
            const invoices = await Promise.all(data.map(async invoice => {
                const refId = invoice.RefID;
                const [mssv, namHoc, hocKy, ngayPhatHanh] = refId.split('-');
                const newInvoice = await app.model.tcHocPhiTransactionInvoice.create({
                    refId,
                    invoiceTransactionId: invoice.TransactionID,
                    invoiceNumber: invoice.InvNo,
                    mssv, namHoc, hocKy, ngayPhatHanh,
                    serial: mauHoaDon.meinvoiceMauHoaDon,
                    mailBy: email.email
                });
                sendSinhVienInvoice(newInvoice, null, null, email);
                return newInvoice;
            }));
            res.send({ items: invoices });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/khtc/invoice/list/length', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            let data = req.body;
            // const email = req.session.user.email;
            // data['email'] = email;
            const filter = app.utils.stringify(data);
            let { rows: list } = await app.model.tcHocPhi.getInvoiceListByTransaction(filter);
            list = await setupDataInvoiceList(list);
            res.send({ length: list.length, list });
        } catch (error) {
            res.send({ error });
        }
    });

    const setupDataInvoiceList = async (list, user = null) => {
        const listPhiXuatHoaDon = await app.model.tcLoaiPhi.getAll({ xuatHoaDon: 1 });
        const listReturn = await Promise.all(list.map(async hocPhi => {
            if (hocPhi.khoanThu) {
                if (user) {
                    app.model.tcHocPhiTransaction.update({ transId: hocPhi.transId }, { sessionInvoice: user });
                }
                const khoanThuParse = app.utils.parse(hocPhi.khoanThu);
                const detailList = Object.keys(khoanThuParse).map(item => {
                    return { loaiPhi: item, tenLoaiPhi: khoanThuParse[item].ten, soTien: khoanThuParse[item].soTien };
                });
                hocPhi.details = detailList.filter(item => listPhiXuatHoaDon.find(loaiPhi => loaiPhi.id == parseInt(item.loaiPhi) && loaiPhi.xuatHoaDon == 1));
            }
            return hocPhi;
        }));
        return listReturn.filter(item => item.details?.length);
    };

    app.post('/api/khtc/invoice/list', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const data = req.body;
            const filter = app.utils.stringify(data);
            const user = req.session.user.email;
            let { rows: list } = await app.model.tcHocPhi.getInvoiceListByTransaction(filter);
            await setupDataInvoiceList(list, user);
            app.messageQueue.send('invoiceService:send', { data, user });
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/invoice/view/:id', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const instance = await app.getMisaAxiosInstance();
            const invoice = await app.model.tcHocPhiTransactionInvoice.get({ id });
            if (!invoice) throw 'Hóa đơn không tồn tại';
            const response = await instance.post(url.view, [invoice.invoiceTransactionId]);
            request(response.Data).pipe(res);
        } catch (error) {
            console.error(error);
            res.status(400).send({ error });
        }
    });

    const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'hocPhiHuongDan');

    app.get('/api/khtc/invoice/page/:pageNumber/:pageSize', app.permission.check('tcInvoice:read'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const settings = await getSettings();
            const namHoc = filter.namHoc || settings.hocPhiNamHoc;
            const hocKy = filter.hocKy || settings.hocPhiHocKy;
            filter.tuNgay = filter.tuNgay || '';
            filter.denNgay = filter.denNgay || '';
            const filterData = app.utils.stringify({ ...filter, namHoc, hocKy });
            const pageCondition = req.query.searchTerm;
            const page = await app.model.tcHocPhiTransactionInvoice.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, filter, settings: { namHoc, hocKy } }
            });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const getAllMailConfig = async () => {
        const mailConfig = await app.model.tcSetting.getValue('taiChinhEmailPrefix', 'taiChinhEmailPassword');
        const mailList = [...Array(25).keys()].map(key => {
            return {
                email: mailConfig.taiChinhEmailPrefix + `0${key + 1}`.slice(-2) + '@hcmussh.edu.vn',
                password: mailConfig.taiChinhEmailPassword
            };
        });
        return mailList;
    };

    const getMailConfig = async () => {
        const mailConfig = await app.model.tcSetting.getValue('taiChinhEmailList', 'taiChinhEmailPassword');
        if (mailConfig.taiChinhEmailList) {
            return mailConfig.taiChinhEmailList.split(',').map(item => ({ email: item, password: mailConfig.taiChinhEmailPassword }));
        } else
            return [];
    };

    const sendSinhVienInvoice = async (invoice, sinhVien, config, email) => {
        sinhVien = sinhVien || await app.model.fwStudent.get({ mssv: invoice.mssv });
        config = config || await app.model.tcSetting.getValue('hocPhiEmailTraHoaDonEditorHtml', 'hocPhiEmailTraHoaDonEditorText', 'hocPhiEmailTraHoaDonTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail', 'meinvoiceMaSoThue');

        const url = `${app.isDebug ? app.debugUrl : app.rootUrl}/user/hoc-phi/invoice`;
        const title = config.hocPhiEmailTraHoaDonTitle.replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim());
        const html = config.hocPhiEmailTraHoaDonEditorHtml.replace('{đ&acirc;y}', 'đây').replace(/href=.*?>/, `href="${url}">`).replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim()).replace('{mssv}', sinhVien.mssv).replace('{hoc_ky}', invoice.hocKy).replace('{nam_hoc}', invoice.namHoc).replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail).replace('{No.}', invoice.invoiceNumber).replace('{Serial}', invoice.serial).replace('{Date}', app.date.dateTimeFormat(new Date(invoice.ngayPhatHanh), 'dd/mm/yyyy')).replace('{Code}', config.meinvoiceMaSoThue);
        const text = config.hocPhiEmailTraHoaDonEditorText.replace('{đây}', url).replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim()).replace('{mssv}', sinhVien.mssv).replace('{hoc_ky}', invoice.hocKy).replace('{nam_hoc}', invoice.namHoc).replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail).replace('{No.}', invoice.invoiceNumber).replace('{Serial}', invoice.serial).replace('{Date}', app.date.dateTimeFormat(new Date(invoice.ngayPhatHanh), 'dd/mm/yyyy')).replace('{Code}', config.meinvoiceMaSoThue);
        if (!app.isDebug) {
            app.service.emailService.send(email.email, email.password, sinhVien.emailTruong, null, null, (app.isDebug ? 'TEST: ' : '') + title, text, html, null);
            // await app.email.normalSendEmail(email.email, email.password, sinhVien.emailTruong, [], (app.isDebug ? 'TEST: ' : '') + title, text, html, []);
        } else {
            app.service.emailService.send(email.email, email.password, 'vucong2018@gmail.com', null, null, (app.isDebug ? 'TEST: ' : '') + title, text, html, null);
            // await app.email.normalSendEmail(email.email, email.password, 'nqlong0709@gmail.com', [], (app.isDebug ? 'TEST: ' : '') + title, text, html, []);
        }
    };

    app.post('/api/khtc/invoice/mail', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const id = req.body.id;
            const invoice = await app.model.tcHocPhiTransactionInvoice.get({ id });
            const sinhVien = await app.model.fwStudent.get({ mssv: invoice.mssv });
            const mailData = await app.model.tcSetting.getValue('hocPhiEmailTraHoaDonEditorHtml', 'hocPhiEmailTraHoaDonEditorText', 'hocPhiEmailTraHoaDonTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');
            const emails = await getMailConfig();
            const email = emails.splice(Math.floor(Math.random() * emails.length), 1).pop();
            await app.model.tcHocPhiTransactionInvoice.update({ id: invoice.id }, { mailBy: email.email });
            await sendSinhVienInvoice(invoice, sinhVien, mailData, email);
            res.send();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/invoice/cancel/:id', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const id = parseInt(req.params.id), lyDo = req.body.lyDo;
            if (!id || !lyDo) throw 'Dữ liệu không hợp lệ';
            const invoice = await app.model.tcHocPhiTransactionInvoice.get({ id });
            if (!invoice) throw 'Không tìm được hóa đơn';
            else if (invoice.lyDoHuy) throw 'Hóa đơn đã bị hủy';
            const invoiceDate = new Date(invoice.ngayPhatHanh);
            const instance = await app.getMisaAxiosInstance();
            const response = await instance.post(url.cancel, {
                TransactionID: invoice.invoiceTransactionId,
                InvNo: invoice.invoiceNumber,
                // RefDate: `${invoiceDate.getFullYear()}-${invoiceDate.getMonth() + 1}-${invoiceDate.getDate()}`,
                RefDate: app.utils.toIsoString(invoiceDate).slice(0, 10),
                CancelReason: lyDo,
            });
            if (response.ErrorCode)
                throw 'Lỗi hệ thống';
            // TODO CANCELED
            /*
            1. Xoa ben transaction
            2. Xoa ben invoice
             */
            const checkTransaction = await app.model.tcHocPhiTransaction.get({ invoiceId: id });
            if (checkTransaction) {
                await app.model.tcHocPhiTransaction.update({ invoiceId: id }, { invoiceId: null });
            }
            await app.model.tcHocPhiTransactionInvoice.update({ id }, { lyDoHuy: lyDo, trangThai: 'CANCELED' });

            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    // download excel
    app.get('/api/khtc/invoice/download-excel', app.permission.check('tcInvoice:export'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter, {});
            let data = await app.model.tcHocPhiTransactionInvoice.downloadExcel('', app.utils.stringify({
                namHoc: filter.namHoc,
                hocKy: filter.hocKy,
            }));

            const list = data.rows;
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet(`${filter.namHoc}_${filter.hocKy}`);
            ws.columns = [
                { header: 'STT', key: 'stt', width: 10 },
                { header: 'HỌC KỲ', key: 'hocKy', width: 20 },
                { header: 'MSSV', key: 'mssv', width: 20 },
                { header: 'HỌ VÀ TÊN', key: 'hoTen', width: 30 },
                { header: 'SỐ HÓA ĐƠN', key: 'soHoaDon', width: 20 },
                { header: 'KHOA', key: 'khoa', width: 30 },
                { header: 'NGÀNH', key: 'nganh', width: 30 },
                { header: 'BẬC', key: 'bac', width: 20 },
                { header: 'HỆ ĐÀO TẠO', key: 'he', width: 20 },
                { header: 'NGÀY PHÁT HÀNH', key: 'ngayPhatHanh', width: 20 },
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = { name: 'Times New Roman' };

            list.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    hocKy: `${item.namHoc} - HK0${item.hocKy}`,
                    mssv: item.mssv,
                    hoTen: `${item.ho?.toUpperCase() || ''} ${item.ten?.toUpperCase() || ''}`,
                    soHoaDon: item.invoiceNumber,
                    khoa: item.tenKhoa,
                    nganh: item.tenNganh,
                    bac: item.tenBacDaoTao,
                    he: item.tenLoaiHinhDaoTao,
                    ngayPhatHanh: item.ngayPhatHanh ? app.date.viDateFormat(new Date(Number(item.ngayPhatHanh))) : '',
                }, 'i');
            });
            const fileName = `DANH_SACH_GIAO_DICH_${filter.namHoc}_HK0${filter.hocKy}.xlsx`;
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/invoice/detail', app.permission.check('tcHocPhi:write'), async (req, res) => {
        try {
            const { namHoc, hocKy, mssv, loaiPhi } = req.query;
            const result = await getInvoiceDetail(namHoc, hocKy, mssv, loaiPhi);
            res.send({ result });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/invoice/mail/init', app.permission.check('developer:login'), async (req, res) => {
        try {
            const mails = await getAllMailConfig();
            const result = await Promise.all(mails.map(async mail => {
                try {
                    await app.email.normalSendEmail(mail.email, mail.password, 'nqlong0709@gmail.com', [], (app.isDebug ? 'TEST: ' : '') + 'init email list', 'init email list', 'init email list', []);
                    return mail;
                } catch {
                    return null;
                }
            }));

            if (await app.model.tcSetting.get({ key: 'taiChinhEmailList' }))
                await app.model.tcSetting.update({ key: 'taiChinhEmailList' }, { value: result.filter(item => item).map(item => item.email).toString() });
            else
                await app.model.tcSetting.create({ key: 'taiChinhEmailList', value: result.filter(item => item).map(item => item.email).toString() });
            res.send({ result });
        } catch (error) {
            console.error(error);
            res.send(error);
        }
    });

    app.post('/api/khtc/invoice-transaction', app.permission.check('tcGiaoDich:write'), async (req, res) => {
        try {
            const { transId } = req.body?.data;
            let { rows: list } = await app.model.tcHocPhi.getInvoiceListByTransaction(app.utils.stringify({ transactionId: transId }));
            // let hocPhi = await app.model.tcHocPhi.getInvoiceInfo(mssv, parseInt(namHoc), parseInt(hocKy));
            if (!list || !list.length) {
                throw 'Không có dữ liệu hóa đơn';
            }
            list = await setupDataInvoiceList(list, req.session.user.email);
            const mauHoaDon = await app.model.tcSetting.getValue('meinvoiceMauHoaDon');
            const config = await app.model.tcSetting.getValue('meinvoiceMauHoaDon', 'hocPhiEmailTraHoaDonEditorHtml', 'hocPhiEmailTraHoaDonEditorText', 'hocPhiEmailTraHoaDonTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail', 'meinvoiceMaSoThue');

            let response = null;
            try {
                const misaInstance = await app.getMisaAxiosInstance();
                response = await misaInstance.post(
                    url.hsmPublish,
                    [compileInvoice(list[0], list[0].details, config.meinvoiceMauHoaDon, transId)]
                );
                try {
                    await app.model.tcHocPhiInvoiceMisaLog.create({ timeRespone: Date.now(), body: app.utils.stringify(response), type: 'one' });
                } catch (error) {
                    console.error(error);
                }
            } catch (error) {
                throw { message: 'Tạo hóa đơn lỗi', error };
            }

            const data = app.utils.parse(response.Data);
            if (!data || !data.length || data[0].ErrorCode) {
                throw { message: 'Tạo hóa đơn lỗi', error: data[0].ErrorCode };
            }
            const invoices = await Promise.all(data.map(async invoice => {
                const refId = invoice.RefID;
                const [mssv, namHoc, hocKy, ngayPhatHanh] = refId.split('-');
                const newInvoice = await app.model.tcHocPhiTransactionInvoice.create({
                    transId,
                    refId,
                    invoiceTransactionId: invoice.TransactionID,
                    invoiceNumber: invoice.InvNo,
                    mssv, namHoc, hocKy, ngayPhatHanh,
                    serial: mauHoaDon.meinvoiceMauHoaDon,
                });
                return newInvoice;
            }));
            if (invoices) {
                const invoice = await app.model.tcHocPhiTransaction.update({ transId }, { invoiceId: invoices[0].id });
                res.send({ items: invoice });
            }

        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/khtc/add-invoice', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const data = req.body?.data;
            const transaction = await app.model.tcHocPhiTransaction.get({ transId: data.transId });
            if (transaction) {
                const invoice = await app.model.tcHocPhiTransactionInvoice.create({
                    refId: data.refId,
                    namHoc: data.namHoc, hocKy: data.hocKy,
                    invoiceTransactionId: data.invoiceTransactionId,
                    mssv: data.mssv,
                    invoiceNumber: data.invoiceNumber,
                    ngayPhatHanh: data.ngayPhatHanh,
                    modifyBy: `${req.session.user.email} in ${new Date()}`,
                    serial: data.meinvoiceMauHoaDon,
                    transId: data.transId
                });
                await app.model.tcHocPhiTransaction.update({ transId: data.transId }, { invoiceId: invoice.id });
            } else {
                throw 'Giao dịch không tồn tại';
            }
            res.send({});
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });



    /// <summary>
    /// Trạng thái gửi hóa đơn sang Cơ quan thuế
    ///     - Không có mã: (0: chưa gửi CQT; 1: Đã gửi CQT; 2: CQT tiếp nhận; 3: CQT không tiếp nhận; 4: gửi lỗi)
    ///     - Có mã: (0: chờ cấp mã; 1: gửi lỗi; 2: đã cấp mã; 3: từ chối cấp mã; 4: gửi lỗi)
    /// Mô tả theo <see cref="Enum.SendToTaxStatus"/>
    /// </summary>
    /// SendTaxStatus { get; set; }

    const trangThaiHoaDon = [
        { id: 0, trangThai: 'CHO_CAP_MA', text: 'Chờ cấp mã' },
        { id: 1, trangThai: 'GUI_LOI', text: 'Gửi lỗi' },
        { id: 2, trangThai: 'DA_CAP_MA', text: 'Đã cấp mã' },
        { id: 3, trangThai: 'TU_CHOI_CAP_MA', text: 'Từ chối cấp mã' },
        { id: 4, trangThai: 'GUI_LOI_4', text: 'Gửi lỗi' },
        { id: 5, trangThai: 'INVOICE_NOT_EXIST', text: 'Hóa đơn không tồn tại' },
        { id: 6, trangThai: 'CANCELED', text: 'Đã hủy' },
        { id: 7, trangThai: 'UNKNOWN', text: 'Không xác định' },
    ];

    const trangThaiHoaDonDict = trangThaiHoaDon.reduce((total, cur) => ({ ...total, [cur.trangThai]: cur }), {});

    const addData = (data, key, value) => {
        if (!data[key]) {
            data[key] = value;
        } else {
            data[key].push(...value);
        }
    };

    const checkInvoiceChunk = async (invoices, misaInstance) => {
        try {
            const response = await misaInstance.post(
                url.checkStatus,
                invoices.map(i => i.invoiceTransactionId)
            );
            const responseData = response.Data;
            const misaInvoices = app.utils.parse(responseData);
            const invoiceData = misaInvoices.reduce((total, cur) => ({ ...total, [cur.TransactionID]: cur }), {});
            const returnData = invoices.reduce((total, invoice) => {
                const item = invoiceData[invoice.invoiceTransactionId];
                if (!item) {
                    addData(total, 'unknown', [invoice.invoiceTransactionId]);
                } else {
                    addData(total, trangThaiHoaDon[item.SendTaxStatus].trangThai, [invoice.invoiceTransactionId]);
                }
                return total;
            }, {});
            if (returnData.unknown?.length) {
                return handleUnknown(returnData, misaInstance);
            }
            return returnData;
        } catch (error) {

            console.error('checkInvoiceChunk', error);
        }
        return {};
    };

    const handleUnknown = async (data, misaInstance) => {
        try {
            const response = await misaInstance.post(url.download, data.unknown, { params: { downloadDataType: 'xml' } });
            const responseData = response.Data;
            const misaInvoices = app.utils.parse(responseData);
            const invoiceData = misaInvoices.reduce((total, cur) => ({ ...total, [cur.TransactionID]: cur }), {});

            const returnData = data.unknown.reduce((total, transactionId) => {
                const item = invoiceData[transactionId];
                if (item && item.ErrorCode == 'InvoiceNotExist') {
                    addData(total, 'INVOICE_NOT_EXIST', [transactionId]);
                } else {
                    addData(total, 'unknown', [transactionId]);
                }
                return total;
            }, { unknown: [] });
            return { ...data, ...returnData };
        } catch (error) {
            console.error('handleUnknown', error);
        }
    };

    const handleChunkResult = async (data) => {

        for (let key of Object.keys(data)) {
            if (key == trangThaiHoaDonDict.DA_CAP_MA.trangThai && data[key].length) {
                //update trang thai hoa don only
                await app.model.tcHocPhiTransactionInvoice.update({
                    statement: 'invoiceTransactionId in (:ids)',
                    parameter: {
                        ids: data[key]
                    }
                }, { trangThai: key });

                const dataUpdated = await app.model.tcHocPhiTransactionInvoice.getAll({
                    statement: 'invoiceTransactionId in (:ids)',
                    parameter: {
                        ids: data[key]
                    }
                });
                const emails = await getMailConfig();
                const email = emails.splice(Math.floor(Math.random() * emails.length), 1).pop();
                await Promise.all(dataUpdated.filter(invoice => !invoice.mailBy && invoice.trangThai == trangThaiHoaDonDict.DA_CAP_MA.trangThai).map(async invoice => {
                    await app.model.tcHocPhiTransactionInvoice.update({ id: invoice.id }, { mailBy: email.email });
                    sendSinhVienInvoice(invoice, null, null, email);
                }));

            } else if ([
                trangThaiHoaDonDict.GUI_LOI.trangThai,
                trangThaiHoaDonDict.TU_CHOI_CAP_MA.trangThai,
                trangThaiHoaDonDict.GUI_LOI_4.trangThai,
                trangThaiHoaDonDict.INVOICE_NOT_EXIST.trangThai,
            ].includes(key) && data[key].length) {
                //unbind transaction and invoice
                try {
                    try {
                        await app.model.tcHocPhiTransaction.update({
                            statement: 'invoiceId is not null and invoiceId in (select TC_HOC_PHI_TRANSACTION_INVOICE.ID from TC_HOC_PHI_TRANSACTION_INVOICE where TC_HOC_PHI_TRANSACTION_INVOICE.INVOICE_TRANSACTION_ID IN (:ids))',
                            parameter: {
                                ids: data[key]
                            }
                        }, { invoiceId: null });
                    } catch {
                        //      skip
                    }
                    // update trang thai hoa don
                    await app.model.tcHocPhiTransactionInvoice.update({
                        statement: 'invoiceTransactionId in (:ids)',
                        parameter: {
                            ids: data[key]
                        }
                    }, { trangThai: key });

                } catch (error) {
                    console.error('update error', error);
                    //skip
                }
            }
        }
    };

    const compileMessage = (data) => {
        const template = `Thông điệp kiểm tra hóa đơn lúc ${moment(new Date()).format('HH:mm, [ngày] DD/MM/YYYY')}. \n${Object.keys(trangThaiHoaDonDict).map(key => {
            return `${trangThaiHoaDonDict[key].text}: ${data[key]?.length || 0}`;
        }).join('\n')}`;
        return template;
    };

    const checkInvoice = async () => {
        try {
            const items = await app.model.tcHocPhiTransactionInvoice.getAll({
                trangThai: trangThaiHoaDonDict.CHO_CAP_MA.trangThai
            }, '*', 'ngayPhatHanh desc');
            try {
                await app.model.tcHocPhiTransactionInvoice.update({
                    trangThai: trangThaiHoaDonDict.CHO_CAP_MA.trangThai
                }, { capNhatLuc: Date.now() });
            } catch {
                //skip
            }
            const chunks = items.chunk(30);
            const misaInstance = await app.getMisaAxiosInstance();
            const data = {};
            for (let i = 0; i < chunks.length; i++) {
                const chunkResult = await checkInvoiceChunk(chunks[i], misaInstance);
                handleChunkResult(chunkResult).catch(error => console.error('handleChunkResult', error));
                Object.keys(chunkResult).forEach(key => addData(data, key, chunkResult[key]));
            }

            const { emailInvoice } = await app.model.tcSetting.getValue('emailInvoice');
            app.service.emailService.send('no-reply@hcmussh.edu.vn', 'email.password', emailInvoice, null, 'baoid0001@gmail.com', 'Kiểm tra tình trạng hóa đơn', compileMessage(data), null, null);
        } catch (error) {
            console.error('checkInvoice', error);
        }
    };

    (app.isDebug || app.appName == 'mdKeHoachTaiChinhService') && app.readyHooks.add('mdKeHoachTaiChinhService:checkInvoice', {
        ready: () => app.database && app.assetPath,
        run: () => app.primaryWorker && app.schedule('0 8 * * *', () => checkInvoice().catch(error => console.error('mdKeHoachTaiChinhService:checkInvoice', error))),
    });

    app.get('/api/khtc/invoice/check-invoice', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            checkInvoice().catch(error => console.error('mdKeHoachTaiChinhService:checkInvoice', error));
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
};

