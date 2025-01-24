module.exports = (app) => {
    const { QRCodeStyling } = require('qr-code-styling-node/lib/qr-code-styling.common.js');
    const nodeCanvas = require('canvas');
    const { VietQr, BankCode } = require('./../../../config/genQR')();
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5026: { title: 'Quản lý quyết toán thuế', link: '/user/finance/quyet-toan-thue', icon: 'fa fa-tasks', color: '#000', groupIndex: 3, backgroundColor: '#FFA07A' } },
    };

    app.permission.add(
        { name: 'tcQuyetToanThue:read', menu },
        { name: 'tcQuyetToanThue:write' },
        { name: 'tcQuyetToanThue:delete' },
        { name: 'tcQuyetToanThue:export' },
    );

    app.permissionHooks.add('staff', 'addRolesTcQuyetToanThue', async (user, staff) => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcQuyetToanThue:read', 'tcQuyetToanThue:write', 'tcQuyetToanThue:delete', 'tcQuyetToanThue:export');
        }
    });

    app.get('/user/finance/quyet-toan-thue', app.permission.check('tcQuyetToanThue:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/khtc/quyet-toan-thue/page/:pageNumber/:pageSize', app.permission.check('tcQuyetToanThue:read'), async (req, res) => {
        try {
            let filter = req.query.filter || { nam: 2021, tinhTrang: 'TAT_CA' };
            const pageCondition = req.query.searchTerm;
            const page = await app.model.tcTncnQuyetToanThue.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, JSON.stringify(filter));
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, totaldongdu: totalDongDu } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, totalDongDu, list }
            });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/quyet-toan-thue/export', app.permission.check('tcQuyetToanThue:read'), async (req, res) => {
        try {
            const nam = req.query.nam || 2024;
            const pageCondition = req.query.searchTerm || '';
            const { rows: list } = await app.model.tcTncnQuyetToanThue.exportExcell(pageCondition, JSON.stringify({ nam, tinhTrang: 'TAT_CA' }));
            const workBook = app.excel.create(),
                ws = workBook.addWorksheet('Sheet 1');
            ws.columns = [{ header: 'STT', key: 'stt', width: 5 }, ...Object.keys(list[0] || {}).map(key => ({ header: key.toString(), key, width: 30 }))];
            list.forEach((item, index) => {
                ws.addRow({ stt: index + 1, ...item }, index === 0 ? 'n' : 'i');
            });
            app.excel.attachment(workBook, res, `Danh sách quyết toán thuế năm ${nam}.xlsx`);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const uploadQuyetToanThue = async (req, fields, files, done) => {
        try {
            let worksheet = null;
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'TcQuyetToanThue' && files.TcQuyetToanThue && files.TcQuyetToanThue.length) {
                const srcPath = files.TcQuyetToanThue[0].path;
                let workbook = await app.excel.readFile(srcPath);
                if (workbook) {
                    try {
                        app.fs.deleteFile(srcPath);
                        let index = 2;
                        const time = Date.now();
                        worksheet = workbook.getWorksheet(1);
                        const { nam } = app.utils.parse(fields.data[0]);
                        while (true) {
                            if (!worksheet.getCell('A' + index).value) {
                                break;
                            }
                            else {
                                const shcc = worksheet.getCell('A' + index).value;
                                const soTien = worksheet.getCell('B' + index).value || 0;
                                const congNo = worksheet.getCell('C' + index).value || 0;
                                const soTienDot1 = worksheet.getCell('D' + index).value?.result || worksheet.getCell('D' + index).value || 0;
                                const soTienDot2 = worksheet.getCell('E' + index).value?.result || worksheet.getCell('E' + index).value || 0;
                                const soTienDot3 = worksheet.getCell('F' + index).value?.result || worksheet.getCell('F' + index).value || 0;
                                const soTienDot4 = worksheet.getCell('G' + index).value?.result || worksheet.getCell('G' + index).value || 0;
                                const soTienDot = [soTienDot1, soTienDot2, soTienDot3, soTienDot4];

                                try {
                                    const current = await app.model.tcTncnQuyetToanThue.get({ shcc, nam });
                                    if (!current) {
                                        const row = await app.model.tcTncnQuyetToanThue.create({ shcc, nam, soTien, congNo, ngayUpdate: time });
                                        for (let index = 0; index < 4; index++) {
                                            await app.model.tcTncnQuyetToanThueDetail.create({ shcc, nam, soTienThanhToan: soTienDot[index], dot: index + 1, tinhTrang: soTienDot[index] ? 'CHUA_DONG' : 'DA_DONG' });
                                        }
                                        await app.model.tcQuyetToanThueLog.create({ mscb: shcc, nam, userId: req.session.user.email, thaoTac: 'C', duLieuCu: '{}', duLieuMoi: app.utils.stringify(row), ngayUpdate: time });
                                    } else {
                                        const checkTransaction = await app.model.tcTncnQuyetToanThueTransaction.get({ customerId: shcc, nam, status: 1 });
                                        if (!checkTransaction) {
                                            if (parseInt(soTien) != parseInt(current.soTien) || parseInt(congNo) != parseInt(current.congNo)) {
                                                const row = await app.model.tcTncnQuyetToanThue.update({ shcc, nam }, { soTien, congNo, ngayUpdate: time });
                                                for (let index = 0; index < 4; index++) {
                                                    await app.model.tcTncnQuyetToanThueDetail.update({ shcc, nam, dot: index + 1 }, { soTienThanhToan: soTienDot[index], tinhTrang: soTienDot[index] ? 'CHUA_DONG' : 'DA_DONG' });
                                                }
                                                await app.model.tcQuyetToanThueLog.create({ mscb: shcc, nam, userId: req.session.user.email, thaoTac: 'U', duLieuCu: '{}', duLieuMoi: app.utils.stringify(row), ngayUpdate: time });
                                            }
                                        }
                                    }
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                            index++;
                        }

                        done({});
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No workbook!' });
                }
            }
        } catch (error) {
            console.error(error);
        }


    };
    app.uploadHooks.add('TcQuyetToanThue', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadQuyetToanThue(req, fields, files, done), done, 'tcQuyetToanThue:write')
    );

    app.get('/api/khtc/quyet-toan-thue/template', app.permission.check('tcQuyetToanThue:read'), async (req, res) => {
        try {
            const path = app.path.join(app.assetPath, 'khtc', 'uploadQuyetToanThueTemplate', 'Template_import_quyet_toan_thue.xlsx');
            res.download(path);
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    const getVietComBankQr = async (mscb, soTien, nam, res) => {
        const canBo = await app.model.tchcCanBo.get({ shcc: mscb });
        const qrCodeImage = new QRCodeStyling({
            nodeCanvas, // this is required
            width: 400,
            height: 400,
            // data: VietQr.getContent(BankCode.BIDV, '96234' + mssv, soTien, app.toEngWord(`USSH ${studentInfo.ho} ${studentInfo.ten} ${soTien.toString().numberDisplay()}`.toUpperCase())).sign(), //for BIDV
            data: VietQr.getContent(BankCode.Vietcombank, 'XHNV' + VietQr.pad(`${nam}${mscb}`, 15), soTien, app.toEngWord(`TNCN ${mscb} nam ${nam} ${soTien.toString().numberDisplay()}`.toUpperCase())).sign(), //for Vietcombank
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
        drawText(titleFont, 470, app.toEngWord(`${canBo.ho} ${canBo.ten}`));
        drawText(textFont, 510, 'XHNV' + VietQr.pad(`${nam}${mscb}`, 15));
        drawText(titleFont, 538, `${soTien.toString().numberDisplay()} VND`);
        image.composite(await app.jimp.read(buffer), 50, 50);
        res.send({
            base64: await image.getBufferAsync(app.jimp.AUTO).then(buffer => buffer.toString('base64'))
        });
        return;
    };

    app.get('/api/khtc/quyet-toan-thue/genQR', app.permission.check('cbQuyetToanThue:read'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const { soTien, nam, isCustom } = req.query;
            if (isCustom == 1) {
                const congNo = await app.model.tcTncnQuyetToanThue.get({ shcc, nam }).then(item => parseInt(item.congNo));
                const dotDongMax = await app.model.tcTncnQuyetToanThueDetail.get({ shcc, nam, tinhTrang: 'DA_DONG' }, '*', 'dot DESC').then(item => item ? parseInt(item.dot) : 0);
                await app.model.tcTncnQuyetToanThueDetail.delete({ shcc, nam, tinhTrang: 'CHUA_DONG' });
                await app.model.tcTncnQuyetToanThueDetail.create({ shcc, nam, dot: dotDongMax + 1, soTienThanhToan: soTien, tinhTrang: 'CHUA_DONG' });
                if (congNo > soTien) {
                    await app.model.tcTncnQuyetToanThueDetail.create({ shcc, nam, dot: dotDongMax + 2, soTienThanhToan: congNo - soTien, tinhTrang: 'CHUA_DONG' });
                }
            }
            return await getVietComBankQr(shcc, soTien, nam, res);

        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.delete('/api/khtc/quyet-toan-thue/delete', app.permission.check('cbQuyetToanThue:delete'), async (req, res) => {
        try {
            const { listShcc, nam } = req.body;
            for (const shcc of listShcc) {
                const row = await app.model.tcTncnQuyetToanThue.get({ shcc, nam });
                const time = Date.now();
                if (row) {
                    await app.model.tcTncnQuyetToanThue.delete({ shcc, nam });
                    await app.model.tcTncnQuyetToanThueDetail.delete({ shcc, nam });
                    await app.model.tcQuyetToanThueLog.create({ mscb: shcc, nam, userId: req.session.user.email, thaoTac: 'D', duLieuMoi: '{}', duLieuCu: app.utils.stringify(row), ngayUpdate: time });
                }
            }
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

    app.get('/api/khtc/quyet-toan-thue/detail', app.permission.check('tcQuyetToanThue:read'), async (req, res) => {
        try {
            const { shcc, nam } = req.query;
            const items = await app.model.tcTncnQuyetToanThueDetail.getAll({ shcc, nam });
            res.send({ items });
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });
    app.put('/api/khtc/quyet-toan-thue/detail', app.permission.check('tcQuyetToanThue:read'), async (req, res) => {
        try {
            const { shcc, nam, changes } = req.body;
            const items = await app.model.tcTncnQuyetToanThueDetail.getAll({ shcc, nam });
            if (items.length) {
                await app.model.tcTncnQuyetToanThueDetail.delete({ shcc, nam, tinhTrang: 'CHUA_DONG' });
            }
            for (const item of changes) {
                await app.model.tcTncnQuyetToanThueDetail.create({ shcc, nam, soTienThanhToan: item.soTienThanhToan, dot: item.dot, tinhTrang: 'CHUA_DONG' });
            }
            const dataUpdated = await app.model.tcTncnQuyetToanThueDetail.getAll({ shcc, nam });
            const tongTienThanhToan = dataUpdated.reduce((total, cur) => total + parseInt(cur.soTienThanhToan), 0);
            const tongCongNo = changes.reduce((total, cur) => total + parseInt(cur.soTienThanhToan), 0);
            const beforeUpdated = await app.model.tcTncnQuyetToanThue.get({ shcc, nam });
            const afterUpdated = await app.model.tcTncnQuyetToanThue.update({ shcc, nam }, { congNo: tongCongNo, soTien: tongTienThanhToan, ngayUpdate: Date.now() });
            await app.model.tcQuyetToanThueLog.create({ mscb: shcc, nam, userId: req.session.user.email, thaoTac: 'C', duLieuCu: app.utils.stringify(beforeUpdated), duLieuMoi: app.utils.stringify(afterUpdated), ngayUpdate: Date.now() });
            res.send({});
        } catch (error) {
            app.consoleError(req, error);
            res.send({ error });
        }
    });

};
