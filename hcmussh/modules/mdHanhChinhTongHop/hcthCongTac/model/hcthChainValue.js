// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.hcthChainValue.foo = async () => { };
    app.model.hcthChainValue.resolveValues = async (data) => {
        const sortData = data.sort((a, b) => a.version - b.version);
        return await sortData.reduce(async (total, row) => ({
            ...(await total), [row.fieldName]: await app.model.hcthChainType.resolveFieldValue(row.fieldType, row.fieldValue)
        }), Promise.resolve({}));
    };

    app.model.hcthChainValue.resolveArrayValues = async (fieldData, itemType) => {
        return await Promise.all(Object.keys(fieldData).map(async (fieldName) => {
            // TODO: resolve item to get value first
            const values = fieldData[fieldName];
            if (app.model.hcthChainType.isChainObjectType(itemType[fieldName].fieldType)) {
                const itemValues = await app.model.hcthChainValue.getAll({
                    statement: 'itemId in (:ids)',
                    parameter: { ids: values.map(i => i.fieldValue) }
                });
                const groupItemValues = itemValues.reduce((total, current) => {
                    if (total[current.itemId]) {
                        total[current.itemId].push(current);
                    } else {
                        total[current.itemId] = [current];
                    }
                    return total;
                }, {});
                return [fieldName, await Promise.all(Object.keys(groupItemValues).map(itemId => app.model.hcthChainValue.resolveValues(groupItemValues[itemId]).then(v => ({ ...v, id: itemId }))))];
            } else {
                return [fieldName, await Promise.all(values.map(row => app.model.hcthChainType.resolveFieldValue(row.fieldType, row.fieldValue)))];
            }
        })).then(items => items.reduce((total, current) => ({
            ...total, [current[0]]: current[1]
        }), {}));
    };
};