import T from 'view/js/common';

const ENewsGetPage = 'ENews:GetPage';
const ENewsGet = 'ENews:Get';
const ENewsUpdate = 'ENews:Update';
const ENewsItemGetAll = 'ENewsItem:GetAll';
const ENewsItemUpdate = 'ENewsItem:Update';
const ENewsStructureAdd = 'ENewsStructure:Add';
const ENewsStructureUpdate = 'ENewsStructure:Update';
const ENewsStructureSwap = 'ENewsStructure:Swap';
const ENewsStructureDelete = 'ENewsStructure:Delete';

export default function eNewsReducer(state = null, data) {
    switch (data.type) {
        case ENewsGetPage: {
            return { ...state, page: data.page };
        }

        case ENewsGet: {
            return { ...state, item: data.item };
        }

        case ENewsUpdate: {
            const item = { ...(state.item || {}), ...data.item };
            return { ...state, item };
        }

        case ENewsItemGetAll: {
            const newsItems = data.newsItems || [], items = {};

            newsItems.forEach(newItem => items[`${newItem.structureId}_${newItem.indexNumber}`] = newItem);
            return { ...state, items };
        }

        case ENewsItemUpdate: {
            const items = state.items || {};

            if (data.item) {
                items[`${data.item.structureId}_${data.item.indexNumber}`] = { ...(items[`${data.item.structureId}_${data.item.indexNumber}`] || {}), ...data.item };
            }
            return { ...state, items };
        }

        case ENewsStructureAdd: {
            const item = state.item || { structures: [] };
            item.structures.push(data.item);

            return { ...state, item };
        }

        case ENewsStructureUpdate: {
            const item = state.item || { structures: [] };
            const index = item.structures.findIndex(i => i.id == data.item.id);

            item.structures.splice(index, 1, data.item);
            return { ...state, item };
        }

        case ENewsStructureSwap: {
            const item = state.item || { structures: [] };

            if (data.swapItem && data.targetItem) {
                const swapIndex = item.structures.findIndex(item => item.id == data.swapItem.id);
                const targetIndex = item.structures.findIndex(item => item.id == data.targetItem.id);

                item.structures.splice(swapIndex, 1, data.swapItem);
                item.structures.splice(targetIndex, 1, data.targetItem);
            }

            item.structures = item.structures.sort((a, b) => a.thuTu - b.thuTu);

            return { ...state, item };
        }

        case ENewsStructureDelete: {
            const item = state.item || { structures: [] };

            if (data.id) {
                const index = item.structures.findIndex(item => item.id == data.id);

                item.structures.splice(index, 1);
            }

            return { ...state, item };
        }

        default:
            return state;
    }
}

// Functions
T.initPage('eNewsPage');
export function getENewsPage(pageNumber, pageSize, done) {
    const page = T.updatePage('eNewsPage', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/tt/e-news/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách e-news bị lỗi !', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: ENewsGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách e-news bị lỗi !', 'danger'));
    };
}

export function getENews(eNewsId, done) {
    return (dispatch) => {
        const url = `/api/tt/e-news/item/${eNewsId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy e-news bị lỗi !', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: ENewsGet, item: data.item });
                dispatch({ type: ENewsItemGetAll, newsItems: data.newsItems });
                done && done(data.item);
            }
        }, () => T.notify('Lấy e-news bị lỗi !', 'danger'));
    };
}

export function sendEmailENews(data, done) {
    return (dispatch) => {
        const url = '/api/tt/e-news/send-email';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Gửi email bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch({ type: ENewsGet, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Gửi email bị lỗi !', 'danger'));
    };
}

export function createENews(data, done) {
    return () => {
        const url = '/api/tt/e-news';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo mới e-news bị lỗi !', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                done && done(data);
            }
        }, () => T.notify('Tạo mới e-news bị lỗi !', 'danger'));
    };
}

export function updateENews(id, changes, done) {
    return dispatch => {
        const url = '/api/tt/e-news';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật e-news bị lỗi !', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật e-news thành công !', 'success');
                dispatch({ type: ENewsUpdate, item: data.item });
                done && done();
            }
        }, () => T.notify('Cập nhật e-news bị lỗi !', 'danger'));
    };
}

export function deleteENews(id, done) {
    return (dispatch) => {
        const url = '/api/tt/e-news';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá e-news bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xoá e-news thành công!', 'success', false, 800);
                dispatch(getENewsPage());
                done && done();
            }
        }, () => T.notify('Xoá e-news bị lỗi!', 'danger'));
    };
}


export function createENewsStructure(data, done) {
    return dispatch => {
        const url = '/api/tt/e-news/structure';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thẻ bị lỗi !', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Tạo thẻ thành công !', 'success');
                dispatch({ type: ENewsStructureAdd, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Tạo thẻ bị lỗi !', 'danger'));
    };
}

export function updateENewsStructure(id, changes, done) {
    return dispatch => {
        const url = '/api/tt/e-news/structure';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thẻ bị lỗi !', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật thẻ thành công !', 'success');
                dispatch({ type: ENewsStructureUpdate, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Tạo thẻ bị lỗi !', 'danger'));
    };
}

export function swapENewsStructure(id, isMoveUp) {
    return dispatch => {
        const url = '/api/tt/e-news/structure/swap';

        T.put(url, { id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Đổi thứ tự thẻ bị lỗi !', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch({ type: ENewsStructureSwap, swapItem: data.swapItem, targetItem: data.targetItem });
            }
        }, () => T.notify('Tạo thẻ tin tức bị lỗi !', 'danger'));
    };
}

export function deleteENewsStructure(id) {
    return dispatch => {
        const url = '/api/tt/e-news/structure';

        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thẻ bị lỗi !', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch({ type: ENewsStructureDelete, id });
                T.alert('Xoá thẻ thành công', 'success', false, 800);
            }
        }, () => T.notify('Tạo thẻ tin tức bị lỗi !', 'danger'));
    };
}


export function updateENewsItem(condition, changes, done) {
    return dispatch => {
        const url = '/api/tt/e-news/item';

        T.put(url, { condition, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật nội dung bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật nội dung thành công!', 'success');
                dispatch({ type: ENewsItemUpdate, item: data.item });
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật nội dung bị lỗi!', 'danger'));
    };
}

export function changeENewsItem(item) {
    return { type: ENewsItemUpdate, item };
}

export function deleteENewsItem(item, done) {
    return () => {
        const url = '/api/tt/enewsItem';
        T.delete(url, { item }, data => {
            if (data.error) {
                T.notify('Xoá thẻ tin tức bị lỗi !', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá thẻ tin tức thành công !', 'success');
                done && done(data.item);
            }
        }, () => T.notify('Xoá thẻ tin tức bị lỗi !', 'danger'));
    };
}

export function getNewsFromENews(ma, done) {
    const url = '/api/tt/e-news/item-news';
    T.get(url, { ma }, data => {
        if (data.error) {
            T.notify('Lấy thông tin tin tức bị lỗi!', 'danger');
            console.error(`GET: ${url}.`, data.error);
        } else {
            done && done(data.item);
        }
    }, error => console.error(`GET: ${url}.`, error));
}

export const eNewsSearchNewsAdapter = {
    ajax: true,
    url: '/api/tt/e-news/search-news',
    data: params => ({ searchTerm: params.term }),
    processResults: data => {
        return { results: data && data.items ? data.items.map(item => ({ id: item.id, text: (item.title || '').viText() })) : [] };
    },
    fetchOne: (ma, done) => getNewsFromENews(ma, item => done && done({ id: item.id, text: (item.title || '').viText() })),
};