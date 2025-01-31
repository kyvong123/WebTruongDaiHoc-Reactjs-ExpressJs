export const SelectAdapter_DmNoiNhanForm = {
    ajax: true,
    url: '/api/sv/dm-noi-nhan-form/page/1/25',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: `${item.ghiChu}` })) : [] }),
};