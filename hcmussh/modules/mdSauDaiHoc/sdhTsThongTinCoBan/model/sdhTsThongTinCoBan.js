// eslint-disable-next-line no-unused-vars
module.exports = app => {
    const qrcode = require('qrcode');
    const jwt = require('jsonwebtoken');
    app.model.sdhTsThongTinCoBan.generatedPdfSdhDktsFile = async (data) => {
        data.name = `${data.ho} ${data.ten}`;
        //TODO: Hiện tại trên biểu mẫu chưa có đối tượng xét tuyển ( tự do, cán bộ viên chức, ...)
        data.doiTuongXT = '';
        data.tableNVN = data.maNganh;
        data.tableCCNN = data.dkNgoaiNgu ? data.dkNgoaiNgu : '';
        const idHoSo = data.id;
        const options = {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            rendererOpts: {
                quality: 0.3
            }
        };
        await app.fs.createFolder(app.path.join(app.assetPath, 'sdh'), app.path.join(app.assetPath, 'sdh', 'ket-qua-dkts'), app.path.join(app.assetPath, 'sdh', 'ket-qua-dkts', 'image'));
        qrcode.toFile(app.path.join(app.assetPath, `sdh/ket-qua-dkts/image/qrcode_${idHoSo}.png`), idHoSo.toString(), options, (err) => {
            if (err) throw err;
        });
        const qrCodeImg = app.path.join(app.assetPath, `sdh/ket-qua-dkts/image/qrcode_${idHoSo}.png`);
        let qrCode = qrCodeImg;
        const source = app.path.join('modules/mdSauDaiHoc/sdhTsThongTinCoBan/resources/sdh-dkts-template.docx');
        const { name, ngheNghiep, donVi, doiTuongXT, dienThoai, email } = data ? data : { name: '', ngheNghiep: '', donVi: '', tableCCNN: '', doiTuongXT: '', dienThoai: '', email: '' };
        const rs = await app.model.sdhTsThongTinCoBan.searchTTCB(idHoSo);
        const { hinhThuc, phanHe, namTuyenSinh, tenPhuongXa, tenQuanHuyen, tenTinhThanhPho, gioiTinh, tenNganh, tenNgoaiNgu } = rs.rows[0] ? rs.rows[0] : { hinhThuc: '', phanHe: '', namTuyenSinh: '', tenPhuongXa: '', tenQuanHuyen: '', tenTinhThanhPho: '', gioiTinh: '', tenNganh: '', tenNgoaiNgu: '' };
        let bacDaoTao = '';
        if (phanHe.includes('Tiến sĩ') || phanHe.includes('tiến sĩ') || phanHe.includes('Nghiên cứu sinh')) {
            bacDaoTao = 'Tiến sĩ';
        } else bacDaoTao = 'Thạc sĩ';
        let diaChi = '';
        tenTinhThanhPho ? diaChi += tenTinhThanhPho : null;
        tenQuanHuyen ? diaChi = tenQuanHuyen + ', ' + diaChi : null;
        tenPhuongXa ? diaChi = tenPhuongXa + ', ' + diaChi : null;
        let dataExport = {
            hinhThuc: hinhThuc.toUpperCase(), phanHe: phanHe.toUpperCase(), bacDaoTao, name, ngheNghiep, donVi, namTuyenSinh, tenNganh, tenNgoaiNgu, doiTuongXT, diaChi, dienThoai, email, qrCode, gioiTinh
        };
        dataExport = Object.fromEntries(Object.entries(dataExport).map(([key, value]) => [key, value === null ? '' : value]));
        const buffer = await app.docx.generateFileHasImage(source, dataExport);
        const filePdfPath = app.path.join(app.assetPath, `sdh/ket-qua-dkts/ket_qua_dkts_${idHoSo}.pdf`);
        const pdfBuffer = await app.docx.toPdfBuffer(buffer);
        app.fs.writeFileSync(filePdfPath, pdfBuffer);
        return ({ filePdfPath, pdfBuffer });
    };
    app.model.sdhTsThongTinCoBan.generateToken = async (data, expired) => {
        try {
            const payload = data;
            const algorithm = 'HS256';
            let options = {
                algorithm
            };
            if (expired) options.expiredIn = expired;
            const key = await app.model.sdhTsSetting.getValue('secretKey');
            let token = key && key.secretKey ? jwt.sign(payload, key.secretKey, options) : null;
            return token;
        } catch (err) {
            console.error(err);
            return err;
        }
    };
    app.model.sdhTsThongTinCoBan.verifyToken = async (req, res, next) => {
        try {
            const { maTruyXuat } = req.query;
            const key = await app.model.sdhTsSetting.getValue('secretKey');
            let check = jwt.verify(maTruyXuat, key.secretKey);
            check && next();
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    };
    app.model.sdhTsThongTinCoBan.verifyAccess = async (req, res, next) => {
        try {
            const allowAccess = await
                app.model.sdhTsSetting.getValue('allowAccess');
            if (allowAccess.allowAccess == 1) {
                next();
            } else {
                res.send({ error: 'Hệ thống đã khoá truy cập!' });
            }
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    };
    app.model.sdhTsThongTinCoBan.verifyWrite = async (req, res, next) => {
        try {
            const allowWrite = await
                app.model.sdhTsSetting.getValue('allowWrite');
            if (allowWrite.allowWrite == 1) {
                req.headers = { ...req.headers, permission: 'write' };
                next();
            } else {
                req.headers = { ...req.headers, permission: 'read' };
                next();
            }
        } catch (error) {
            console.error({ error });
            res.send({ error });
        }
    };
};