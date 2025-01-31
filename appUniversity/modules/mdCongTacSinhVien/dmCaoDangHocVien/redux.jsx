import T from 'view/js/common';

const DmCaoDangGetPage = 'DmCaoDang:GetPage';

export default function DmCaoDangReducer(state = null, data) {
    switch (data.type) {
        case DmCaoDangGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('PageCtsvDmCaoDang');
export function getPageDmCaoDang( pageNumber, pageSize, pageCondition, done ){
    const page = T.updatePage('PageCtsvDmCaoDang', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/ctsv/dm-cao-dang/page';
        T.get(url, { ...page }, data => {
            if (data.error){    
                T.notify('Lấy danh mục cao đẳng bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: DmCaoDangGetPage, page: data.page});
                done && done(data.page);
            }
        });
    };
}

export function getDmCaoDang(ma, done) {
    return () => {
        const url = '/api/ctsv/dm-cao-dang/item';
        T.get(url, { ma }, data => {
            if (data.error){
                T.nofity('Lấy danh mục cao đẳng bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function createDmCaoDang( data, done ){
    return dispatch => {
        const url = '/api/ctsv/dm-cao-dang';
        T.post(url, {data}, data => {
            if (data.error){
                T.notify('Tạo danh mục cao đẳng bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch(getPageDmCaoDang());
                T.notify('Tạo danh mục cao đẳng thành công', 'success');
                done && done(data.items);
            }
        });
    };
}

export function updateDmCaoDang(ma, changes, done){
    return dispatch => {
        const url = '/api/ctsv/dm-cao-dang';
        T.put(url, { ma, changes }, data => {
            if (data.error){
                T.notify('Cập nhật danh mục cao đẳng bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật danh mục cao đẳng thành công', 'success');
                dispatch(getPageDmCaoDang());
                done && done();
            }
        });
    };
}

export function deleteDmCaoDang(ma, done){
    return dispatch => {
        const url = '/api/ctsv/dm-cao-dang';
        T.delete(url, { ma }, data => {
            if (data.error){
                T.notify('Xóa danh mục cao đẳng bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                T.notify('Xóa danh mục cao đẳng thành công', 'success');
                dispatch(getPageDmCaoDang());
                done && done();
            }
        });
    };
}

export const SelectAdapter_DmCaoDang = ({
    ajax: true,
    url: '/api/ctsv/dm-cao-dang/active/all',
    data: params => ({ searchTerm: params.term }),
    processResults: res => ({results: res && res.items? res.items.map(item => ({id: item.ma, text: item.tenTruong}) ): [] }),
    fetchOne: (ma, done) => (getDmCaoDang(ma, item => done && done({ id: item.ma, text: item.tenTruong})))()
});