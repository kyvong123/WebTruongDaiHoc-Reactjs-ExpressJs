// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.svSuKienC.foo = async () => { };
    app.model.svSuKien.createSuKien = async (data) => {
        const itemKey = await app.model.svSuKien.create({ latestVersionNumber: 1 });
        data.idSuKien = itemKey.id;
        data.versionNumber = itemKey.latestVersionNumber;
        const item = await app.model.svSuKienData.create(data);
        return item;
    };
    app.model.svSuKien.updateSuKien = async (id, changes) => {
        const itemKey = await app.model.svSuKien.get({ id });
        const versionNumber = itemKey.latestVersionNumber;
        const preEditItem = await app.model.svSuKienData.get({ idSuKien: id, versionNumber: versionNumber });
        let item;
        if (preEditItem && preEditItem.trangThai === 'A') {
            const data = { ...changes };
            data.idSuKien = id;
            data.maDonVi = preEditItem.maDonVi;
            data.versionNumber = Number(versionNumber) + 1;
            data.createTime = Date.now();
            data.nguoiTao = preEditItem.nguoiTao;
            item = await app.model.svSuKienData.create(data);
            await app.model.svSuKien.update({ id }, { latestVersionNumber: item.versionNumber });
        } else {
            item = await app.model.svSuKienData.update({ idSuKien: id }, changes);
        }
        return { item, preEditItem };
    };
};