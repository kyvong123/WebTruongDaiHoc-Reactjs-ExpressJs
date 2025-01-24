import T from 'view/js/common';
import { getStaffByEmail } from '../../../../mdTccb/tccbCanBo/redux';
import { getUser } from 'modules/_default/fwUser/reduxUser';

// Reducer ------------------------------------------------------------------------------------------------------------
const FwQuestionAnswerNotificationGetPage = 'FwQuestionAnswerNotification:GetPage';

const DmChuDeDonViGetPage = 'DmChuDe:GetPage';
const DmChuDeFormSelect = 'DmChuDe:FormSelect';
const DmDonViChuDeFormSelect = 'DmDonViChuDe:FormSelect';

export default function FwQuestionAnswerReducer(state = null, data) {
  switch (data.type) {
    case FwQuestionAnswerNotificationGetPage:
      return Object.assign({}, state, { notificationPage: data.page });
    case DmChuDeDonViGetPage:
      return Object.assign({}, state, { dmChuDeDonViPage: data.page });
    case DmChuDeFormSelect:
      return Object.assign({}, state, { dmChuDeFormSelect: data.page });
    case DmDonViChuDeFormSelect:
      return Object.assign({}, state, { dmDonViChuDeFormSelect: data.items });
    default:
      return state;
  }
}

export function getFwQuestionAnswer(id, done) {
  return () => {
    const url = `/api/tt/lien-he/quan-ly/item/${id}`;
    T.get(url, data => {
      if (data.error) {
        T.notify('Lấy thông tin QA box bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        done && done(data.item);
      }
    }, error => console.error(`GET: ${url}.`, error));
  };
}

// Common Actions ------------------------------------------------------------------------------------------------------------

// export function deleteFwQuestionAnswerMessage(fwQaMessageId, done) {
//     return dispatch => {
//         const url = '/api/tt/lien-he/delete-message';
//         T.delete(url, { fwQaMessageId }, data => {
//             if (data.error) {
//                 T.notify('Xóa tin nhắn nháp bị lỗi!', 'danger');
//                 console.error(`GET: ${url}.`, data.error);
//             } else {
//                 done && done(data.page);
//             }
//         }, () => T.notify('Xóa tin nhắn nháp bị lỗi!', 'danger'));
//     }
// }

T.initPage('pageFwQuestionAnswerNotification');
export function getFwQuestionAnswerNotificationPage(pageNumber, pageSize, pageCondition, done) {
  const page = T.updatePage('pageFwQuestionAnswerNotification', pageNumber, pageSize, pageCondition);
  return dispatch => {
    const url = `/api/tt/lien-he/notification/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, { condition: pageCondition }, data => {
      if (data.error) {
        T.notify('Lấy danh sách thông báo Q&A/Blackbox bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (page.pageCondition) data.page.pageCondition = page.pageCondition;
        done && done(data.page);
        dispatch({ type: FwQuestionAnswerNotificationGetPage, page: data.page });
      }
    }, () => T.notify('Lấy danh sách thông báo Q&A/Blackbox bị lỗi!', 'danger'));
  };
}

export function readFwQuestionAnswerNotification(id, done) {
  return dispatch => {
    const url = '/api/tt/lien-he/notification/read';
    T.put(url, { id, changes: { read: 1 } }, data => {
      if (data.error) {
        T.notify('Đọc notification liên hệ bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        done && done(data.item);
        dispatch(getFwQuestionAnswerNotificationPage());
      }
    });
  };
}

export function readAllFwQuestionAnswerNotification(idList, done) {
  return dispatch => {
    const url = '/api/tt/lien-he/notification/read-all';
    T.put(url, { idList, changes: { read: 1 } }, data => {
      if (data.error) {
        T.notify('Đọc notification liên hệ bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        done && done(data.item);
        dispatch(getFwQuestionAnswerNotificationPage());
      }
    });
  };
}

// Assign Chu De API ---------------------------------------------------------------------------------------------------
export function getDmChuDeDonVi() {
  return dispatch => {
    const url = '/api/tt/lien-he/danh-muc/chu-de-chat/qa/by-don-vi/phan-quyen/1/50';
    T.get(url, {}, data => {
      if (data.error) {
        T.notify('Lấy danh sách chủ đề đơn vị bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        dispatch({ type: DmChuDeDonViGetPage, page: data.page });
      }
    }, () => T.notify('Lấy danh sách chủ đề đơn vị bị lỗi!', 'danger'));
  };
}

export function createDmChuDeDonVi(item, done) {
  return dispatch => {
    const url = '/api/tt/lien-he/assign-chu-de';
    T.post(url, { data: item }, data => {
      if (data.error) {
        T.notify(data.error.message || 'Tạo chủ đề bị lỗi', 'danger');
        console.error(`POST: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Tạo chủ đề thành công!', 'success');
        dispatch(getDmChuDeDonVi());
        done && done();
      }
    }, () => T.notify('Tạo chủ đề bị lỗi!', 'danger'));
  };
}


export function updateDmChuDeDonVi(id, changes, done) {
  return dispatch => {
    const url = '/api/tt/lien-he/assign-chu-de';
    T.put(url, { id, changes }, data => {
      if (data.error || changes == null) {
        T.notify(data.error.message || 'Cập nhật chủ đề bị lỗi', 'danger');
        console.error(`PUT: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Cập nhật chủ đề thành công!', 'success');
        dispatch(getDmChuDeDonVi());
        done && done();
      }
    }, () => T.notify('Cập nhật chủ đề bị lỗi!', 'danger'));
  };
}

// Form select chủ đề và đơn vị phụ trách cho user -------------------------------------------------------------------
export function getDmChuDeFormSelect(done) {
  return dispatch => {
    const url = '/api/tt/lien-he/danh-muc/chu-de-chat/qa/all';
    T.get(url, {}, data => {
      if (data.error) {
        T.notify('Lấy danh sách chủ đề đơn vị bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        let donViList = [];
        if (data.page) {
          donViList = (data.page.map(item => ({ id: item.maDonVi, text: item.tenDonVi }))).filter((value, index, self) => self.findIndex(t => t.id === value.id) === index);
        }
        dispatch({ type: DmDonViChuDeFormSelect, items: donViList });
        dispatch({ type: DmChuDeFormSelect, page: data.page });
        done && done(data.page);
      }
    });
  };
}

// export const SelectAdapter_FwQuestionAnswer = {
//     ajax: true,
//     url: '/api/tt/lien-he/quan-ly/page/1/20',
//     data: params => ({ condition: params.term, kichHoat: 1 }),
//     processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
//     getOne: getFwQuestionAnswer,
//     fetchOne: (id, done) => (getFwQuestionAnswer(id, item => done && done({ id: item.id, text: item.ten })))(),
//     processResultOne: response => response && ({ value: response.id, text: response.id + ': ' + response.ten })
// };

export const SelectAdapter_CanBoDonVi = (maDonVi) => ({
  ajax: true,
  url: `/api/tccb/staff/dm-chu-de/can-bo-phu-trach-don-vi/${maDonVi}/1/100`,
  data: params => ({ condition: params.term }),
  processResults: response => ({
    results: response && response.page && response.page.list ? response.page.list.map(item => ({
      id: item.email, text: `${(item.ho + ' ' + item.ten).normalizedName()} (${item.email})`
    })) : []
  }),
  fetchOne: (email, done) => (getStaffByEmail(email, (item) => done && done({ id: item.email, text: `${(item.ho + ' ' + item.ten).normalizedName()} (${item.email})` })))(),
});

export const SelectAdapter_FwBlackbox_SearchCanBoTraLoi = {
  ajax: true,
  url: '/api/tt/lien-he/an-danh/get-university-staff/1/20',
  data: params => ({ condition: params.term }),
  processResults: response => ({
    results: response && response.page && response.page.list ? response.page.list.map(item => ({
      id: item.email, text: `${item.email}: ${item.ho} ${item.ten} (MSCB: ${item.shcc})`
    })) : []
  }),
  fetchOne: (email, done) => {
    (getUser(email, (item) => {
      done && done({ id: item.email, text: `${(item.lastName + ' ' + item.firstName).normalizedName()} (${item.email})` });
    }))();
  },
};