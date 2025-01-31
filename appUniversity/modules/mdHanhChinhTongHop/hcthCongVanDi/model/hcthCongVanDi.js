// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthCongVanDi.foo = () => { };
    const statusArrayKey = ['minimalSwitchStatusModal', 'visibility', 'minimalDisplay', 'censor', 'notifyRecipient', 'editor', 'fileListEditor', 'partialEditors', 'deletor'];

    app.model.hcthCongVanDi.getInstance = async (id) => {
        const instance = await app.model.hcthCongVanDi.get({ id });
        const { capVanBan, trangThai, donViGui, isPhysical, isConverted, soDangKy } = instance;
        instance.soVanBan = await app.model.hcthSoDangKy.get({ id: soDangKy });
        if (!instance) throw 'Văn bản đi không tồn tại';
        instance.status = await getStatus(capVanBan, donViGui, isPhysical, trangThai, isConverted, false, instance.systemId);
        return instance;
    };

    const getStatusSystem = async (capVanBan, donVi, isPhysical, isConverted = 0) => {
        let system = await app.model.hcthVanBanDiStatusSystem.get({ capVanBan, donVi, isPhysical, isConverted });
        if (!system) {
            system = await app.model.hcthVanBanDiStatusSystem.get({ capVanBan, donVi: null, isPhysical, isConverted });
        }
        return system;
    };

    const getStatus = async (capVanBan, donVi, isPhysical, trangThai, isConverted = 0, isInitial = false, systemId = null) => {
        let system;
        if (systemId)
            system = await app.model.hcthVanBanDiStatusSystem.get({ id: systemId });
        else
            system = await getStatusSystem(capVanBan, donVi, isPhysical, isConverted);
        if (!system) throw 'Không tồn tại trạng thái văn bản hợp lệ';
        let status;
        if (isInitial) {
            status = await app.model.hcthVanBanDiStatusDetail.get({ systemId: system.id, isInitial: 1, });
        } else if (trangThai) {
            status = await app.model.hcthVanBanDiStatusDetail.get({ systemId: system.id, trangThai, });
        } else {
            throw 'Dữ liệu trạng thái không hợp lệ';
        }
        const signType = status.signType;
        if (signType) {
            status.signTypeObject = await app.model.hcthSignType.get({ ma: signType });
        }
        status.info = await app.model.hcthVanBanDiStatus.get({ ma: status.trangThai });
        await getStatusAttribute(status);
        return status;
    };

    const getStatusAttribute = async (status) => {
        await Promise.all(statusArrayKey.map(async key => {
            const data = await app.model.hcthDoiTuongTrangThai.getList(status.id, key);
            status[key] = data.rows;
        }));
    };
    app.model.hcthCongVanDi.getStatus = getStatus;
    app.model.hcthCongVanDi.getStatusAttribute = getStatusAttribute;
    app.model.hcthCongVanDi.statusArrayKey = statusArrayKey;

    app.model.hcthCongVanDi.linkQuyetDinh = async (data, staff) => {
        const { administrativeYear } = await app.model.hcthSetting.getValue('administrativeYear'),
            { systemId } = await app.model.svSetting.getValue('systemId');

        const itemCvd = await app.model.hcthCongVanDi.create({
            soDangKy: data.soQuyetDinh,
            nguoiTao: staff.shcc,
            ngayTao: data.handleTime,
            trangThai: 'NHAP',
            ngayKy: data.ngayKy,
            capVanBan: 'TRUONG',
            loaiVanBan: 42,
            donViGui: staff.maDonVi,
            ngoaiNgu: 10,
            isPhysical: 1,
            namHanhChinh: administrativeYear,
            systemId,
            doKhanVanBan: 'THUONG',
            trichYeu: data.tenForm
        });

        await app.model.hcthDonViNhan.create({
            donViNhan: '29',
            ma: itemCvd.id,
            loai: 'BAN_LUU',
        });

        if (data.student) {
            const dataStudent = await app.model.fwStudent.get({ emailTruong: data.student }, 'mssv, khoa');
            if (dataStudent && dataStudent.khoa)
                await app.model.hcthDonViNhan.create({
                    donViNhan: dataStudent.khoa,
                    ma: itemCvd.id,
                    loai: 'DI'
                });
        }

        return itemCvd;
    };

    app.model.hcthCongVanDi.createFile = async (user, rawData, fileName, idVanBanDi) => {
        const now = Date.now(),
            dataCvd = await app.model.hcthCongVanDi.get({ id: idVanBanDi });
        const parentPath = app.path.join(app.assetPath, 'congVanDi', idVanBanDi.toString());
        const path = app.path.join(parentPath, fileName);
        app.fs.createFolder(parentPath);
        await app.fs.writeFileSync(path, rawData);
        const file = await app.model.hcthFile.create({ ten: dataCvd.trichYeu + '.docx', thoiGian: now, loai: 'FILE_VBD', nguoiTao: user.shcc, tenFile: fileName });
        await app.model.hcthVanBanDiFile.create({ fileId: file.id, vanBanDi: idVanBanDi });
    };
};