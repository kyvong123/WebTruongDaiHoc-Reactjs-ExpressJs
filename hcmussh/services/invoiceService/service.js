module.exports = (app, serviceConfig) => {
    require('../config/initService')(app, serviceConfig);
    app.service = app.service || {};

    app.service.emailService = {
        send: async (mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments) => {
            try {
                const item = await app.model.fwEmailTask.create({ mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments, state: 'waiting', createDate: new Date().getTime() });
                app.messageQueue.send('emailService:send', { id: item.id });
                return null;
            } catch (error) {
                console.error(error);
                return error;
            }
        },
    };
    const getMailConfig = async () => {
        const mailConfig = await app.model.tcSetting.getValue('taiChinhEmailList', 'taiChinhEmailPassword');
        if (mailConfig.taiChinhEmailList) {
            return mailConfig.taiChinhEmailList.split(',').map(item => ({ email: item, password: mailConfig.taiChinhEmailPassword }));
        } else
            return [];
    };
    const url = {
        login: '/auth/token',
        hsmPublish: '/code/itg/invoicepublishing/publishhsm',
        view: '/invoicepublished/linkview',
        download: '/code/itg/invoicepublished/downloadinvoice',
        cancel: '/code/itg/invoicepublished/cancel',
        convert: '/code/itg/invoicepublished/voucher-paper',
        checkStatus: '/code/itg/invoicepublished/invoicestatus'
    };
    const compileInvoice = (hocPhi, details, mauHoaDon, transId) => {

        const invoiceDate = new Date(),
            refID = `${hocPhi.mssv}-${hocPhi.namHoc}-${hocPhi.hocKy}-${invoiceDate.getTime()}-${transId}`,
            totalAmountOC = details.reduce((partialSum, detail) => partialSum + parseInt(detail.soTien), 0);
        console.log('Compile invoice: DONE');
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
        console.log('Setup data invoice list: DONE');
        return listReturn.filter(item => item.details?.length);
    };

    const createInvoiceList = async (list, config, email, meinvoiceMauHoaDon) => {
        try {
            const invoiceMapper = {};
            const invoiceList = list.map(item => {
                const compileData = compileInvoice(item, item.details, meinvoiceMauHoaDon, item.transId);
                invoiceMapper[compileData.RefID] = [compileData, item.transId];
                return compileData;
            });

            const instance = await app.model.tcHocPhiTransactionInvoice.getMisaAxiosInstance();
            const response = await instance.post(url.hsmPublish, invoiceList);

            const timeRespone = Date.now();
            const data = app.utils.parse(response.Data);
            try {
                await app.model.tcHocPhiInvoiceMisaLog.create({ timeRespone, body: app.utils.stringify(response), type: 'many' });
            } catch (error) {
                console.error(error);
            }
            const invoices = await Promise.all(data.map(async invoice => {
                if (invoice.ErrorCode)
                    return null;
                const refId = invoice.RefID;
                const transId = invoiceMapper[refId][1];
                const [mssv, namHoc, hocKy, ngayPhatHanh] = refId.split('-');
                try {
                    const item = await app.model.tcHocPhiTransactionInvoice.create({
                        refId: refId,
                        invoiceTransactionId: invoice.TransactionID,
                        invoiceNumber: invoice.InvNo,
                        mssv, hocKy, namHoc, ngayPhatHanh,
                        serial: meinvoiceMauHoaDon,
                        mailBy: '',
                    });
                    // await sendSinhVienInvoice(item, null, config, email);
                    await app.model.tcHocPhiTransaction.update({ transId }, { invoiceId: item.id });
                    return item;
                } catch (createError) {
                    console.error(createError);
                    await app.model.tcHocPhiTransaction.update({ transId }, { sessionInvoice: null });
                    return null;
                }
            }));

            console.log('Create invoice list: DONE');
            return invoices.reduce((stat, invoice) => {
                if (invoice)
                    stat.success += 1;
                else
                    stat.error += 1;
                return stat;
            }, { success: 0, error: 0 });
        } catch (error) {
            return {
                success: 0,
                error: list.length
            };
        }
    };

    const misaChunkSize = 30;

    app.readyHooks.add('consumeInvoice', {
        ready: () => app.model && app.model.tcSetting && app.model.tcHocPhi && app.model.tcHocPhiTransactionInvoice,
        run: () => {
            if (app.primaryWorker)
                app.messageQueue.consume(`${serviceConfig.name}:send`, async (message) => {
                    try {
                        const wait = (time) => new Promise((resolve) => {
                            setTimeout(resolve, time);
                        });
                        const { data, user } = app.utils.parse(message);
                        console.info('invoiceList:send', message, data, user);
                        data['email'] = user;
                        const filter = app.utils.stringify(data);
                        let { rows: list } = await app.model.tcHocPhi.getInvoiceListByTransaction(filter);
                        list = await setupDataInvoiceList(list, user);
                        const chunkList = app.utils.arrayToChunk(list, misaChunkSize);
                        const result = {
                            totalInvoice: list.length,
                            success: 0,
                            error: 0
                        };
                        const emails = await getMailConfig();
                        let mailList = [...emails];
                        const config = await app.model.tcSetting.getValue('meinvoiceMauHoaDon', 'hocPhiEmailTraHoaDonEditorHtml', 'hocPhiEmailTraHoaDonEditorText', 'hocPhiEmailTraHoaDonTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail', 'meinvoiceMaSoThue');
                        for (let i = 0; i < chunkList.length; i++) {
                            if (!mailList || !mailList.length)
                                mailList = [...emails];
                            const email = mailList.splice(Math.floor(Math.random() * mailList.length), 1).pop();
                            const ret = await createInvoiceList(chunkList[i], config, email, config.meinvoiceMauHoaDon);
                            await wait(5000);
                            result.success += ret.success;
                            result.error += ret.error;
                        }

                        console.log('Send invoice: DONE');

                        // Gửi mail khi thực hiện xong
                        const title = 'Thông báo hoàn thành xuất hóa đơn trên hệ thống';
                        const text = `Tổng số hóa đơn đã xuất ${result.totalInvoice} trong đó: ${result.success} thành công, ${result.error} thất bại`;
                        const email = emails.splice(Math.floor(Math.random() * emails.length), 1).pop();
                        if (!app.isDebug) {
                            app.service.emailService.send(email.email, email.password, user, null, null, (app.isDebug ? 'TEST: ' : '') + title, text, null, null);
                        } else {
                            app.service.emailService.send(email.email, email.password, 'vucong2018@gmail.com', null, null, (app.isDebug ? 'TEST: ' : '') + title, text, null, null);
                        }

                        // send notification
                        app.notification.send({
                            toEmail: user,
                            title: 'Thông báo hoàn thành xuất hóa đơn',
                            subTitle: `Tổng số hóa đơn đã xuất ${result.totalInvoice} trong đó: ${result.success} thành công, ${result.error} thất bại`,
                            icon: 'fa-universal-access',
                            iconColor: 'success',
                        });

                    } catch (error) {
                        console.error('invoiceList:send:', error);
                    }
                });
        }
    });
};


