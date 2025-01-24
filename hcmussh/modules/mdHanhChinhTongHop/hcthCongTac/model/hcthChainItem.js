// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.hcthChainItem.foo = async () => { };
    app.model.hcthChainItem.createCongTacTicket = async (data, nguoiTao, thoiGian) => {
        const itemType = 'CONG_TAC_TICKET';
        const itemTypeObject = await app.model.hcthChainType.getType(itemType);
        const createData = await Object.keys(itemTypeObject).reduce(async (total, key) => {
            total = await total;
            const typeItem = itemTypeObject[key];
            if (!data[key]) {
                if (typeItem.isRequired) throw `${typeItem.verboseName || typeItem.fieldName} trống`;
                return total;
            }
            const value = await app.model.hcthChainType.resolveFieldValue(itemTypeObject[key].fieldType, data[key]);
            if (!value && !Number.isInteger(value)) throw 'Invcalid value ' + key;
            return { ...total, [key]: value };
        }, Promise.resolve({}));
        if (!Object.keys(createData).length)
            throw 'no data';
        const item = await app.model.hcthChainItem.create({
            version: 1, loai: itemType
        });
        const versionItem = await app.model.hcthChainVersion.create({
            shcc: nguoiTao, version: 1, thoiGian, itemId: item.id
        });
        await Promise.all(Object.keys(createData).map((fieldName) => {
            return app.model.hcthChainValue.create({
                fieldName, itemId: item.id, version: versionItem.version, fieldValue: createData[fieldName], fieldType: itemTypeObject[fieldName].fieldType
            });
        }));
        return item;
    };

    app.model.hcthChainItem.createLichCongTac = async (data, nguoiTao) => {
        const itemType = 'LICH_CONG_TAC';
        const lichCongTactype = await app.model.hcthChainType.getType(itemType);
        const createData = await Object.keys(lichCongTactype).reduce(async (total, key) => {
            total = await total;
            const typeItem = lichCongTactype[key];
            if (!data[key]) {
                if (typeItem.isRequired) throw `${typeItem.verboseName || typeItem.fieldName} trống`;
                return total;
            }
            const value = await app.model.hcthChainType.resolveFieldValue(lichCongTactype[key].fieldType, data[key]);
            if (value == null || isNaN(value)) throw 'Invcalid value ' + key;
            return { ...total, [key]: value };
        }, Promise.resolve({}));
        if (!Object.keys(createData).length)
            throw 'no data';
        const item = await app.model.hcthChainItem.create({
            version: 1, loai: itemType
        });
        const versionItem = await app.model.hcthChainVersion.create({
            shcc: nguoiTao, version: 1, thoiGian: Date.now(), itemId: item.id
        });
        await Promise.all(Object.keys(createData).map((fieldName) => {
            return app.model.hcthChainValue.create({
                fieldName, itemId: item.id, version: versionItem.version, fieldValue: createData[fieldName], fieldType: lichCongTactype[fieldName].fieldType
            });
        }));
        return item;
    };



    app.model.hcthChainItem.getLichCongTacItem = async (id, version) => {
        const itemType = 'LICH_CONG_TAC';
        const lichCongTactype = await app.model.hcthChainType.getType(itemType);
        const item = await app.model.hcthChainItem.get({ id, loai: itemType });
        if (!item)
            throw 'Lịch họp không tồn tại';
        if (version == null) {
            version = item.version;
        } else if (version > item.version) {
            throw 'Phiên bản không hợp lệ';
        }
        const versionItem = await app.model.hcthChainVersion.get({ itemId: item.id }, '*', 'version');
        const itemValues = await app.model.hcthChainValue.getAll({ itemId: item.id });
        // process data - group data into array if it is an array field
        const literalFieldValues = itemValues.filter(item => !lichCongTactype[item.fieldName].isArray);
        const arrayFieldValues = itemValues.filter(item => lichCongTactype[item.fieldName].isArray).reduce((total, current) => {
            if (total[current.fieldName]) {
                total[current.fieldName].push(current);
            } else {
                total[current.fieldName] = [current];
            }
            return total;
        }, {});
        const literalData = await app.model.hcthChainValue.resolveValues(literalFieldValues);
        const arrayData = await app.model.hcthChainValue.resolveArrayValues(arrayFieldValues, lichCongTactype);
        return {
            ...item,
            version: versionItem.version,
            updator: versionItem.shcc,
            ...literalData,
            ...arrayData,
        };
    };

    app.model.hcthChainItem.createThanhPhan = async (data, nguoiTao, parent, ordinal) => {
        const itemType = 'THANH_PHAN';
        const thanhPhanType = await app.model.hcthChainType.getType(itemType);
        const createData = await Object.keys(thanhPhanType).reduce(async (total, key) => {
            total = await total;
            const typeItem = thanhPhanType[key];
            if (!data[key]) {
                if (typeItem.isRequired) throw `${typeItem.verboseName || typeItem.fieldName} trống`;
                return total;
            }
            const value = await app.model.hcthChainType.resolveFieldValue(thanhPhanType[key].fieldType, data[key]);
            if (value == null || isNaN(value)) throw 'Invcalid value ' + key;
            return { ...total, [key]: value };
        }, Promise.resolve({}));
        if (!Object.keys(createData).length)
            throw 'no data';
        const item = await app.model.hcthChainItem.create({
            version: 1, loai: itemType, parentId: parent?.id
        });
        if (parent) {
            await app.model.hcthChainValue.create({
                itemId: parent.id, fieldName: 'thanhPhan', fieldType: 'THANH_PHAN', fieldValue: item.id, ordinal: ordinal || 0, version: parent.version
            });
        }
        const versionItem = await app.model.hcthChainVersion.create({
            shcc: nguoiTao, version: 1, thoiGian: Date.now(), itemId: item.id
        });
        await Promise.all(Object.keys(createData).map((fieldName) => {
            return app.model.hcthChainValue.create({
                fieldName, itemId: item.id, version: versionItem.version, fieldValue: createData[fieldName], fieldType: thanhPhanType[fieldName].fieldType
            });
        }));
    };

    app.model.hcthChainItem.getItem = async (id) => {
        const item = await app.model.hcthChainItem.get({ id });
        if (!item) throw 'đối tượng không tồn tại';
        switch (item) {
            case 'LICH_CONG_TAC':
                return app.model.hcthChainItem.getLichCongTacItem(item.id);
            case 'THANH_PHAN':
                return app.model.hcthChainItem.get;
        }
    };

};