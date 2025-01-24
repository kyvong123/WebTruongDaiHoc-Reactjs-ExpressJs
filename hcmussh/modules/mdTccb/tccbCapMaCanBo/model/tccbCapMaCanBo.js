// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    app.model.tccbCapMaCanBo.initMaSo = async () => {
        const listMscb = await app.model.tccbCapMaCanBo.getAll({}, 'dinhDanh', 'dinhDanh').then(data => data.map(item => item.dinhDanh));
        const listUpper = listMscb.map(item => item + 1);

        return listUpper.difference(listMscb)?.filter(item => item >= 1500)?.[0] || 1500;
    };
};