import T from 'view/js/common';

const DmDaiHocGetPage = 'DmDaiHoc:GetPage';

export default function DmDaiHocReducer(state = null, data) {
    switch (data.type) {
        case DmDaiHocGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

T.initPage('PageCtsvDmDaiHoc');
export function getPageDmDaiHoc( pageNumber, pageSize, pageCondition, done ){
    const page = T.updatePage('PageCtsvDmDaiHoc', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/ctsv/dm-dai-hoc/page';
        T.get(url, { ...page }, data => {
            if (data.error){    
                T.notify('Lấy danh mục đại học bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch({ type: DmDaiHocGetPage, page: data.page});
                done && done(data.page);
            }
        });
    };
}


export function createDmDaiHoc( data, done ){
    return dispatch => {
        const url = '/api/ctsv/dm-dai-hoc';
        T.post(url, {data}, data => {
            if (data.error){
                T.notify('Tạo danh mục đại học bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                dispatch(getPageDmDaiHoc());
                T.notify('Tạo danh mục đại học thành công', 'success');
                done && done(data.items);
            }
        });
    };
}

export function getDmDaiHoc(ma, done) {
    return () => {
        const url = '/api/ctsv/dm-dai-hoc/item';
        T.get(url, { ma }, data => {
            if (data.error){
                T.notify('Lấy danh mục đại học bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                done && done(data.item);
            }
        });
    };
}

export function updateDmDaiHoc(ma, changes, done){
    return dispatch => {
        const url = '/api/ctsv/dm-dai-hoc';
        T.put(url, { ma, changes }, data => {
            if (data.error){
                T.notify('Cập nhật danh mục đại học bị lỗi', 'danger');
                console.error('GET: ', data.error);
            } else {
                T.notify('Cập nhật danh mục đại học thành công', 'success');
                dispatch(getPageDmDaiHoc());
                done && done();
            }
        });
    };
}

export function deleteDmDaiHoc(ma, done){
    return dispatch => {
        const url = '/api/ctsv/dm-dai-hoc';
        T.delete(url, { ma }, data => {
            if (data.error){
                T.notify('Xóa danh mục đại học bị lỗi', 'danger');
                console.error('GET: ', data.error.message);
            } else {
                T.notify('Xóa danh mục đại học thành công', 'success');
                dispatch(getPageDmDaiHoc());
                done && done();
            }
        });
    };
}



export const SelectAdapter_DmDaiHoc = ({
    ajax: true,
    url: '/api/ctsv/dm-dai-hoc/active/all',
    data: params => ({ searchTerm: params.term }),
    processResults: res => ({results: res && res.items? res.items.map(item => ({id: item.ma, text: item.tenTruong}) ): [] }),
    fetchOne: (ma, done) => (getDmDaiHoc(ma, item => done && done({ id: item.ma, text: item.tenTruong})))()
});