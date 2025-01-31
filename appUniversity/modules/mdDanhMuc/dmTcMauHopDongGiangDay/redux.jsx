import T from "view/js/common";

// Reducer ------------------------------------------------------------------------------------------------------------
const DmTcMauHopDongGiangDayGetAll = "DmTcMauHopDongGiangDay:GetAll";
const DmTcMauHopDongGiangDayGetPage = "DmTcMauHopDongGiangDay:GetPage";

export default function DmTcMauHopDongGiangDayReducer(state = null, data) {
  switch (data.type) {
    case DmTcMauHopDongGiangDayGetAll:
      return Object.assign({}, state, { items: data.items });
    case DmTcMauHopDongGiangDayGetPage:
      return Object.assign({}, state, { page: data.page });
    default:
      return state;
  }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initPage("pageDmTcMauHopDongGiangDay");
export function getDmTcMauHopDongGiangDayPage(
  pageNumber,
  pageSize,
  pageCondition,
  done
) {
  const page = T.updatePage(
    "pageDmTcMauHopDongGiangDay",
    pageNumber,
    pageSize,
    pageCondition
  );
  return (dispatch) => {
    const url = `/api/danh-muc/mau-hop-dong-giang-day/page/${page.pageNumber}/${page.pageSize}`;
    T.get(
      url,
      { condition: page.pageCondition },
      (data) => {
        if (data.error) {
          T.notify("Lấy danh sách mẫu hợp đồng giảng dạy bị lỗi!", "danger");
          console.error(`GET: ${url}.`, data.error);
        } else {
          if (page.pageCondition) data.page.pageCondition = page.pageCondition;
          done && done(data.page);
          dispatch({ type: DmTcMauHopDongGiangDayGetPage, page: data.page });
        }
      },
      () => T.notify("Lấy danh sách mẫu hợp đồng giảng dạy bị lỗi!", "danger")
    );
  };
}

export function getDmTcMauHopDongGiangDayAll(done) {
  return (dispatch) => {
    const url = "/api/danh-muc/mau-hop-dong-giang-day/all";
    T.get(
      url,
      (data) => {
        if (data.error) {
          T.notify("Lấy danh sách mẫu hợp đồng giảng dạy bị lỗi!", "danger");
          console.error(`GET: ${url}.`, data.error);
        } else {
          done && done(data.items);
          dispatch({
            type: DmTcMauHopDongGiangDayGetAll,
            items: data.items ? data.items : [],
          });
        }
      },
      () => T.notify("Lấy danh sách mẫu hợp đồng giảng dạy bị lỗi!", "danger")
    );
  };
}

export function getDmTcMauHopDongGiangDay(ma, done) {
  return () => {
    const url = `/api/danh-muc/mau-hop-dong-giang-day/item/${ma}`;
    T.get(
      url,
      (data) => {
        if (data.error) {
          T.notify("Lấy thông tin mẫu hợp đồng giảng dạy bị lỗi!", "danger");
          console.error(`GET: ${url}.`, data.error);
        } else {
          done && done(data.item);
        }
      },
      (error) => console.error(`GET: ${url}.`, error)
    );
  };
}

export function createDmTcMauHopDongGiangDay(item, done) {
  return (dispatch) => {
    const url = "/api/danh-muc/mau-hop-dong-giang-day";
    T.post(
      url,
      { item },
      (data) => {
        if (data.error) {
          T.notify("Tạo mẫu hợp đồng giảng dạy bị lỗi!", "danger");
          console.error(`POST: ${url}.`, data.error);
        } else {
          T.notify("Tạo mẫu hợp đồng giảng dạy thành công!", "success");
          dispatch(getDmTcMauHopDongGiangDayPage());
          done && done(data);
        }
      },
      () => T.notify("Tạo mẫu hợp đồng giảng dạy bị lỗi!", "danger")
    );
  };
}

export function deleteDmTcMauHopDongGiangDay(ma) {
  return (dispatch) => {
    const url = "/api/danh-muc/mau-hop-dong-giang-day";
    T.delete(
      url,
      { ma },
      (data) => {
        if (data.error) {
          T.notify("Xóa danh mục mẫu hợp đồng giảng dạy bị lỗi!", "danger");
          console.error(`DELETE: ${url}.`, data.error);
        } else {
          T.alert("Danh mục đã xóa thành công!", "success", false, 800);
          dispatch(getDmTcMauHopDongGiangDayPage());
        }
      },
      () => T.notify("Xóa mẫu hợp đồng giảng dạy bị lỗi!", "danger")
    );
  };
}

export function updateDmTcMauHopDongGiangDay(ma, changes, done) {
  return (dispatch) => {
    const url = "/api/danh-muc/mau-hop-dong-giang-day";
    T.put(
      url,
      { ma, changes },
      (data) => {
        if (data.error || changes == null) {
          T.notify(
            "Cập nhật thông tin mẫu hợp đồng giảng dạy bị lỗi!",
            "danger"
          );
          console.error(`PUT: ${url}.`, data.error);
          done && done(data.error);
        } else {
          T.notify(
            "Cập nhật thông tin mẫu hợp đồng giảng dạy thành công!",
            "success"
          );
          done && done(data.item);
          dispatch(getDmTcMauHopDongGiangDayPage());
        }
      },
      () =>
        T.notify("Cập nhật thông tin mẫu hợp đồng giảng dạy bị lỗi!", "danger")
    );
  };
}

export function downloadFileWord(ma) {
  return () => {
    const url = `/api/danh-muc/mau-hop-dong-giang-day/download/${ma}`;
    T.get(
      url,
      (res) => {
        if (res.error) {
          T.notify(
            "Tải mẫu hợp đồng bị lỗi" +
              (res.error.message && ":<br>" + res.error.message),
            "danger"
          );
          console.error(`GET: ${url}.`, res.error);
        } else {
          T.handleDownload(
            `/api/danh-muc/mau-hop-dong-giang-day/download/${ma}`
          );
        }
      },
      (error) =>
        T.notify(
          "Tải mẫu hợp đồng bị lỗi" +
            (error.error.message && ":<br>" + error.error.message),
          "danger"
        )
    );
  };
}

export const SelectAdapter_DmTcMauHopDongGiangDay = (loaiHinhDaoTao) => {
  return {
    ajax: true,
    url: "/api/danh-muc/mau-hop-dong-giang-day/page/1/20",
    data: (params) => ({ condition: params.term, loaiHinhDaoTao }),
    processResults: (data) => ({
      results: !loaiHinhDaoTao
        ? data.page.list.map((item) => ({ id: item.ma, text: item.ten }))
        : data && data.page && data.page.list
        ? data.page.list
            .filter(
              (item) => item && item.loaiHinhDaoTao.includes(loaiHinhDaoTao)
            )
            .map((item) => ({ id: item.ma, text: item.ten }))
        : [],
    }),
    fetchOne: (ma, done) =>
      getDmTcMauHopDongGiangDay(
        ma,
        (item) => item && done && done({ id: item.ma, text: item.ten })
      )(),
  };
};
