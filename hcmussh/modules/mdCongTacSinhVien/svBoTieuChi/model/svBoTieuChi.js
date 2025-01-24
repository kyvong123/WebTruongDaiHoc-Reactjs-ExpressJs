// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.svBoTieuChi.foo = () => { };
    app.model.svBoTieuChi.updateSort = async (ma, maCha, oldIndex, newIndex) => {
        oldIndex = parseInt(oldIndex);
        newIndex = parseInt(newIndex);
        let [condition, changes] = [null, null];
        if (newIndex < oldIndex) {
            condition = maCha ? {
                statement: 'stt >= :newIndex AND maCha = :maCha',
                parameter: { newIndex, maCha }
            } : {
                statement: 'stt >= :newIndex AND maCha IS NULL',
                parameter: { newIndex }
            };
            changes = {
                statement: 'stt=stt + 1',
                parameter: {}
            };
        } else {
            condition = maCha ? {
                statement: 'stt <= :newIndex AND maCha = :maCha',
                parameter: { newIndex, maCha }
            } : {
                statement: 'stt <= :newIndex AND maCha IS NULL',
                parameter: { newIndex }
            };
            changes = {
                statement: 'stt=stt - 1',
                parameter: {}
            };
        }
        await app.model.svBoTieuChi.update(condition, changes);
        await app.model.svBoTieuChi.update({ ma }, { stt: newIndex });
    };

    app.model.svBoTieuChi.updateSwap = async (srcMa, destMa, srcStt, destStt) => {
        await app.model.svBoTieuChi.update({ ma: srcMa }, { stt: destStt });
        await app.model.svBoTieuChi.update({ ma: destMa }, { stt: srcStt });
    };
};
