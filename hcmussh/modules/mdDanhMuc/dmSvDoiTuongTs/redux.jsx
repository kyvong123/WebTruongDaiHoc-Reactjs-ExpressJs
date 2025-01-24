import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmSvDoiTuongTsGetPage = 'DmSvDoiTuongTs:GetPage';
const DmSvDoiTuongTsUpdate = 'DmSvDoiTuongTs:Update';

export default function DmSvDoiTuongTsReducer(state = null, data) {
  switch (data.type) {
    case DmSvDoiTuongTsGetPage:
      return Object.assign({}, state, { page: data.page });
    case DmSvDoiTuongTsUpdate:
      if (state) {
        let updatedItems = Object.assign({}, state.items),
          updatedPage = Object.assign({}, state.page),
          updatedItem = data.item;
        if (updatedItems) {
          for (let i = 0, n = updatedItems.length; i < n; i++) {
            if (updatedItems[i].ma == updatedItem.ma) {
              updatedItems.splice(i, 1, updatedItem);
              break;
            }
          }
        }
        if (updatedPage) {
          for (let i = 0, n = updatedPage.list.length; i < n; i++) {
            if (updatedPage.list[i].ma == updatedItem.ma) {
              updatedPage.list.splice(i, 1, updatedItem);
              break;
            }
          }
        }
        return Object.assign({}, state, { items: updatedItems, page: updatedPage });
      } else {
        return null;
      }
    default:
      return state;
  }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage('pageDmSvDoiTuongTs');
export function getDmSvDoiTuongTsPage(pageNumber, pageSize, pageCondition, done) {
  const page = T.updatePage('pageDmSvDoiTuongTs', pageNumber, pageSize);
  return dispatch => {
    const url = `/api/danh-muc/doi-tuong-tuyen-sinh/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, { condition: pageCondition }, data => {
      if (data.error) {
        T.notify('Lấy danh sách đối tượng bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
        dispatch({ type: DmSvDoiTuongTsGetPage, page: data.page });
      }
    }, () => T.notify('Lấy danh sách đối tượng bị lỗi!', 'danger'));
  };
}

export function getDmSvDoiTuongTs(ma, done) {
  return () => {
    const url = `/api/danh-muc/doi-tuong-tuyen-sinh/item/${ma}`;
    T.get(url, data => {
      if (data.error) {
        T.notify('Lấy thông tin đối tượng bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        done && done(data.item);
      }
    }, error => console.error(`GET: ${url}.`, error));
  };
}

export function createDmSvDoiTuongTs(item, done) {
  return dispatch => {
    const url = '/api/danh-muc/doi-tuong-tuyen-sinh';
    T.post(url, { data: item }, data => {
      if (data.error) {
        T.notify(data.error.message || 'Tạo đối tượng bị lỗi', 'danger');
        console.error(`POST: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Tạo mới thông tin đối tượng thành công!', 'success');
        dispatch(getDmSvDoiTuongTsPage());
        done && done(data);
      }
    }, () => T.notify('Tạo đối tượng bị lỗi!', 'danger'));
  };
}

export function deleteDmSvDoiTuongTs(ma) {
  return dispatch => {
    const url = '/api/danh-muc/doi-tuong-tuyen-sinh';
    T.delete(url, { ma: ma }, data => {
      if (data.error) {
        T.notify('Xóa danh mục đối tượng bị lỗi!', 'danger');
        console.error(`DELETE: ${url}.`, data.error);
      } else {
        T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
        dispatch(getDmSvDoiTuongTsPage());
      }
    }, () => T.notify('Xóa đối tượng bị lỗi!', 'danger'));
  };
}

export function updateDmSvDoiTuongTs(ma, changes, done) {
  return dispatch => {
    const url = '/api/danh-muc/doi-tuong-tuyen-sinh';
    T.put(url, { ma, changes }, data => {
      if (data.error || changes == null) {
        T.notify(data.error.message || 'Cập nhật thông tin đối tượng bị lỗi', 'danger');
        console.error(`PUT: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Cập nhật thông tin đối tượng thành công!', 'success');
        dispatch(getDmSvDoiTuongTsPage());
        done && done();
      }
    }, () => T.notify('Cập nhật thông tin đối tượng bị lỗi!', 'danger'));
  };
}

export function changeDmSvDoiTuongTs(item) {
  return { type: DmSvDoiTuongTsUpdate, item };
}

export const SelectAdapter_DmSvDoiTuongTs = {
  ajax: true,
  url: '/api/danh-muc/doi-tuong-tuyen-sinh/page/1/20',
  data: params => ({ condition: params.term }),
  processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
  getOne: getDmSvDoiTuongTs,
  processResultOne: response => response && ({ value: response.ma, text: response.ma + ': ' + response.ten }),
};