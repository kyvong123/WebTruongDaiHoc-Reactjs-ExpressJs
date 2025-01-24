import T from 'view/js/common';

export function getSvDmFormType(ma, done) {
    return () => {
        const url = '/api/sv/form-type/item';
        T.get(url, { ma }, result => {
            if (result.error) {
                T.notify('Lấy biểu mẫu bị lỗi', 'danger');
                console.error(result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}

export const SelectAdapter_SvDmFormType = (namHoc, kieuForm) => ({
    ajax: true,
    url: '/api/sv/form-type/all',
    data: params => ({ condition: params.term, kieuForm, namHoc }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: `${item.ten} (${item.namHoc})`, ten: item.ten, customParam: item.customParam })) : [] }),
    fetchOne: (ma, done) => (getSvDmFormType(ma, item => done && done({ id: item.ma, text: item.ten })))(),
});