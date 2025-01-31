import T from 'view/js/common';

export function getBankItem(ma, done) {
    return () => {
        const url = `/api/danh-muc/bank/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngân hàng bị lỗi!', 'danger');
                console.error('GET:', url, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin ngân hàng bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmBank = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/bank/page/1/20',
    processResults: response => {
        const list = response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ten}` })) : [];
        list.push({ id: 'Khác', text: 'Khác' });
        return ({ results: list });
    },
    fetchOne: (ma, done) => (getBankItem(ma, item => done && done({ id: item.ma, text: `${item.ten}` })))(),
};

export function getPhuongThucThanhToanItem(ma, done) {
    return () => {
        const url = `/api/danh-muc/phuong-thuc-thanh-toan/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngân hàng bị lỗi!', 'danger');
                console.error('GET:', url, data.error);
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy thông tin ngân hàng bị lỗi!', 'danger'));
    };
}


export function getAllBank(done) {
    return () => {
        const url = '/api/danh-muc/bank/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngân hàng bị lỗi!', 'danger');
                console.error('GET:', url, data.error);
            } else {
                done && done(data.items);
            }
        }, () => T.notify('Lấy thông tin ngân hàng bị lỗi!', 'danger'));
    };
}

export const SelectAdapter_DmPhuongThucThanhToan = {
    ajax: true,
    data: params => ({ condition: params.term, kichHoat: 1 }),
    url: '/api/danh-muc/phuong-thuc-thanh-toan/page/1/20',
    processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ bankConfig: item.bankConfig, id: item.ma, text: `${item.bank} (${item.ma})` })) : [] }),
    fetchOne: (ma, done) => (getPhuongThucThanhToanItem(ma, item => done && done({ bankConfig: item.bankConfig, id: item.ma, text: `${item.bank} (${item.ma})` })))(),
};

