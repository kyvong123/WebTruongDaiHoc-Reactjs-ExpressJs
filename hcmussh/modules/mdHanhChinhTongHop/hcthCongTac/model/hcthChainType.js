// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.hcthChainType.foo = async () => { };
    app.model.hcthChainType.getType = async (itemType) => {
        const data = await app.model.hcthChainType.getAll({ itemType });
        return data.reduce((total, cur) => ({ [cur.fieldName]: cur, ...total }), {});
    };

    app.model.hcthChainType.resolveFieldType = async (fieldType) => {
        switch (fieldType) {
            case 'number':
                return Number;
            case 'THANH_PHAN':
            case 'string':
            default:
                return String;
        }
    };

    app.model.hcthChainType.isChainObjectType = (fieldType) => {
        return !['number', 'string'].includes(fieldType);
    };

    app.model.hcthChainType.resolveFieldValue = async (fieldType, fieldValue, fieldTypeItem) => {
        const func = await app.model.hcthChainType.resolveFieldType(fieldType, fieldTypeItem);
        return func(fieldValue);
    };



};