import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
// const DmPhongHopGetAll = 'DmPhongHop:GetAll';
// const DmPhongHopGetPage = 'DmPhongHop:GetPage';

// export default function dmLoaiVanBanReducer(state = null, data) {
//     switch (data.type) {
//         case DmPhongHopGetAll:
//             return Object.assign({}, state, { items: data.items });
//         case DmPhongHopGetPage:
//             return Object.assign({}, state, { page: data.page });
//         default:
//             return state;
//     }
// }

// Actions ------------------------------------------------------------------------------------------------------------
// export const PageName = 'pageDmPhongHop';
// T.initPage(PageName);
// export function getDmPhongHopPage(pageNumber, pageSize, pageCondition, done) {
//     const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
//     return dispatch => {
//         const url = `/api/hcth/phong-hop/page/${page.pageNumber}/${page.pageSize}`;
//         T.get(url, { condition: page.pageCondition }, data => {
//             if (data.error) {
//                 T.notify('Lấy danh sách phòng họp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
//                 console.error(`GET: ${url}.`, data.error);
//             } else {
//                 if (page.pageCondition) data.page.pageCondition = page.pageCondition;
//                 done && done(data.page);
//                 dispatch({ type: DmPhongHopGetPage, page: data.page });
//             }
//         }, (error) => T.notify('Lấy danh sách phòng họp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
//     };
// }

// export function getDmPhongHopAll(done) {
//     return dispatch => {
//         const url = '/api/hcth/phong-hop/all';
//         T.get(url, data => {
//             if (data.error) {
//                 T.notify('Lấy danh sách phòng họp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
//                 console.error(`GET: ${url}.`, data.error);
//             } else {
//                 done && done(data.items);
//                 dispatch({ type: DmPhongHopGetAll, items: data.items ? data.items : [] });
//             }
//         }, (error) => T.notify('Lấy danh sách phòng họp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
//     };
// }

export function getDmPhongHop(ma, done) {
    return () => {
        const url = `/api/hcth/phong-hop/item/${ma}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin phòng họp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                done && done(data.item);
            }
        }, error => {
            console.error(`GET: ${url}.`, error);
        });
    };
}

export function createDmPhongHop(item, done) {
    return () => {
        const url = '/api/hcth/phong-hop';
        T.post(url, { item }, data => {
            if (data.error) {
                console.error(`POST: ${url}.`, data.error);
            } else {
                T.notify('Tạo phòng họp thành công!', 'success');
                // dispatch(getDmPhongHopPage());
                done && done(data);
            }
        }, (error) => T.notify('Tạo phòng họp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function deleteDmPhongHop(ma) {
    return () => {
        const url = '/api/hcth/phong-hop';
        T.delete(url, { ma }, data => {
            if (data.error) {
                T.notify('Xóa danh mục phòng họp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Danh mục phòng họp đã xóa thành công!', 'success', false, 800);
                // dispatch(getDmPhongHopPage());
            }
        }, (error) => T.notify('Xóa phòng họp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export function updateDmPhongHop(id, changes, done) {
    return () => {
        const url = '/api/hcth/phong-hop';
        T.put(url, { id, changes }, data => {
            if (data.error || changes == null) {
                T.notify('Cập nhật thông phòng họp bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                console.error(`PUT: ${url}.`, data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin phòng họp thành công!', 'success');
                done && done();
                // dispatch(getDmPhongHopPage());
            }
        }, (error) => T.notify('Cập nhật thông tin phòng họp bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
    };
}

export const SelectAdapter_DmPhongHop = {
    ajax: true,
    url: '/api/hcth/phong-hop/all',
    data: params => ({ condition: params.term }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ ...item, id: item.ma, text: item.ten })) : [] }),
    fetchOne: (id, done) => (getDmPhongHop(id, (item) => done && done({ id: item.ma, text: item.ten })))(),
};


export function traCuuPhongHop(data, done, onFinish, onError) {
    return () => {
        const url = '/api/hcth/phong-hop/tra-cuu';
        T.get(url, data, (res) => {
            onFinish && onFinish();
            if (res.error) {
                console.error('GET: ' + url + '. ', res.error);
                onError && onError();
            } else {
                done && done(res.items);
            }
        }, () => T.notify('Tra cứu phòng họp lỗi', 'danger') || (onError && onError()));
    };
}
