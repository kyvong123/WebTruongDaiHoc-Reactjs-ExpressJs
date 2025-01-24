import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  AdminPage,
  TableHead,
  TableCell,
  FormCheckbox,
  renderDataTable,
  FormDatePicker,
  FormSelect,
} from "view/component/AdminPage";
import {
  getQTHopDongGiangDayTestPage,
  downloadWord,
  deleteHopDongGiangDayTest,
  exportExcel,
} from "./redux";
import { SelectAdapter_DmDonVi } from "modules/mdDanhMuc/dmDonVi/redux";
import { SelectAdapter_FwCanBo } from "../tccbCanBo/redux";
import { SelectAdapter_DmNgachCdnnV2 } from "modules/mdDanhMuc/dmNgachCdnn/redux";
import Pagination from "view/component/Pagination";

class DanhSachQTHopDongGiangDayPage extends AdminPage {
  defaultSortTerm = "ngayKy_DESC";
  state = { filter: { sortKey: "ngayKy", sortMode: "DESC" }, searchText: "" };
  componentDidMount() {
    T.ready("/user/tccb", () => {
      T.clearSearchBox();
      T.onSearch = (searchText) => {
        this.getPage(undefined, undefined, searchText || "");
        this.setState({ searchText });
      };
      T.showSearchBox(() => {
        setTimeout(() => this.changeAdvancedSearch(), 50);
      });
      this.getPage(undefined, undefined, "");
      this.changeAdvancedSearch(true);
    });
    this.getPage();
  }

  changeAdvancedSearch = (isInitial = false, isReset = false) => {
    let { pageNumber, pageSize, pageCondition } =
      this.props &&
      this.props.danhSachHopDongGiangDayTest &&
      this.props.danhSachHopDongGiangDayTest.page
        ? this.props.danhSachHopDongGiangDayTest.page
        : { pageNumber: 1, pageSize: 50, pageCondition: {} };

    if (pageCondition && typeof pageCondition == "string")
      T.setTextSearchBox(pageCondition);

    const listDonVi = this.maDonVi?.value().toString() || "";
    const listNguoiDuocThue = this.nguoiDuocThue?.value().toString() || "";
    const listNgach = this.maNgach?.value().toString() || "";
    const listNguoiKy = this.nguoiKy?.value().toString() || "";
    const fromDate = Number(this.fromDate?.value());
    const toDate = Number(this.toDate?.value());
    const pageFilter =
      isInitial || isReset
        ? { sortKey: "ngayKy", sortMode: "DESC" }
        : {
            listNgach,
            listDonVi,
            listNguoiDuocThue,
            listNguoiKy,
            fromDate,
            toDate,
          };
    this.setState({ filter: pageFilter }, () => {
      this.getPage(pageNumber, pageSize, pageCondition, (page) => {
        if (isInitial) {
          const filter = page.filter || {};
          this.setState({
            filter: !$.isEmptyObject(filter) ? filter : pageFilter,
          });
          this.maDonVi?.value(filter.listDonVi || "");
          this.maNgach?.value(filter.listNgach || "");
          this.nguoiDuocThue?.value(filter.listNguoiDuocThue || "");
          this.nguoiKy?.value(filter.listNguoiKy);
          this.fromDate?.value(filter.fromDate || "");
          this.toDate?.value(filter.toDate || "");
        } else if (isReset) {
          [
            "fromDate",
            "toDate",
            "nguoiDuocThue",
            "maDonVi",
            "nguoiKy",
            "maNgach",
          ].forEach((e) => this[e]?.value(""));
        }
      });
    });
  };

  getPage = (pageN, pageS, pageC, done) => {
    this.props.getQTHopDongGiangDayTestPage(
      pageN,
      pageS,
      pageC,
      this.state.filter,
      done
    );
  };

  downloadWord = (item) => {
    this.props.downloadWord(item.id, (data) => {
      T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.filename);
    });
  };

  handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
    this.setState(
      {
        filter: {
          ...this.state.filter,
          [data.split(":")[0]]: data.split(":")[1],
        },
      },
      () => {
        this.getPage(pageNumber, pageSize, pageCondition);
      }
    );
  };

  export = (e) => {
    e.preventDefault;
    this.props.exportExcel(this.state.filter, this.state.searchText);
  };

  delete = (e, item) => {
    T.confirm(
      "Xóa hợp đồng",
      "Bạn có chắc bạn muốn xóa hợp đồng này?",
      "warning",
      true,
      (isConfirm) => {
        isConfirm &&
          this.props.deleteHopDongGiangDayTest(item.id, (error) => {
            if (error)
              T.notify(
                error.message ? error.message : "Xoá hợp đồng bị lỗi!",
                "danger"
              );
            else T.alert("Xoá hợp đồng thành công!", "success", false, 800);
          });
      }
    );
    e.preventDefault();
  };

  onSort = (sortTerm) => {
    this.setState(
      {
        filter: {
          ...this.state.filter,
          sortKey:
            (sortTerm || this.defaultSortTerm)?.split("_")[0].toString() || "",
          sortMode:
            (sortTerm || this.defaultSortTerm)?.split("_")[1].toString() || "",
        },
      },
      () => {
        this.getPage();
      }
    );
  };

  render() {
    const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
    const permission = this.getUserPermission("qtHopDongGiangDayTest", [
      "read",
      "write",
      "delete",
      "export",
    ]);
    let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
      this.props.danhSachHopDongGiangDayTest &&
      this.props.danhSachHopDongGiangDayTest.page
        ? this.props.danhSachHopDongGiangDayTest.page
        : {
            pageNumber: 1,
            pageSize: 50,
            pageTotal: 1,
            totalItem: 0,
            pageCondition: {},
            list: [],
          };
    let table = renderDataTable({
      emptyTable: "Không có hợp đồng giảng dạy",
      data: list,
      divStyle: { height: "80vh" },
      header: "thead-light",
      className: this.state.isFixCol ? "table-fix-col" : "",
      renderHead: () => (
        <tr>
          <TableHead
            style={{ width: "auto", textAlign: "center" }}
            content="STT"
          />
          <TableHead
            style={{ minwidth: 60, width: "auto", textAlign: "center" }}
            content="Số hợp đồng"
            keyCol="soHopDong"
            onKeySearch={onKeySearch}
            onSort={this.onSort}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Ngày ký"
            keyCol="ngayKy"
            onKeySearch={onKeySearch}
            onSort={this.onSort}
            typeSearch="date"
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Số cán bộ"
            keyCol="nguoiDuocThue"
            onKeySearch={onKeySearch}
            onSort={this.onSort}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Họ tên giảng viên"
            keyCol="hoTenCanBo"
            onKeySearch={onKeySearch}
            onSort={this.onSort}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Ngày sinh"
            keyCol="ngaySinh"
            onKeySearch={onKeySearch}
            typeSearch="date"
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Giới tính"
            keyCol="gioiTinh"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Đơn vị"
            keyCol="donVi"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Chức danh chuyên môn"
            keyCol="chucDanhChuyenMon"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Mã người ký"
            keyCol="maNguoiKy"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Người ký"
            keyCol="hoVaTenNguoiKy"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Thao tác"
          ></TableHead>
        </tr>
      ),
      renderRow: (item, index) => (
        <tr key={index}>
          <TableCell
            style={{ whiteSpace: "nowrap", textAlign: "center" }}
            content={(pageNumber - 1) * pageSize + index + 1}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.soHopDong}
            type="link"
            onClick={() =>
              window.open(
                `/user/tccb/hop-dong-giang-day-test/${item.id}`,
                "_blank"
              )
            }
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.ngayKy ? new Date(item.ngayKy).ddmmyyyy() : ""}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.nguoiDuocThue}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.hoTenCanBo}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.ngaySinh ? new Date(item.ngaySinh).ddmmyyyy() : ""}
          />
          <TableCell style={{ whiteSpace: "nowrap" }} content={item.gioiTinh} />
          <TableCell style={{ whiteSpace: "nowrap" }} content={item.donVi} />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.chucDanhChuyenMon}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.maNguoiKy}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.hoTenNguoiKy}
          />
          <TableCell
            type="buttons"
            style={{ textAlign: "center" }}
            content={item}
            permission={permission}
            onEdit={() =>
              permission.write
                ? this.props.history.push(
                    `/user/tccb/hop-dong-giang-day-test/${item.id}`
                  )
                : T.notify("Vui lòng liên hệ phòng Tổ chức - Cán bộ", "warning")
            }
            onDelete={this.delete}
          ></TableCell>
        </tr>
      ),
    });
    return this.renderPage({
      icon: "fa fa-briefcase",
      title: "Hợp đồng giảng dạy",
      header: <></>,
      breadcrumb: [
        <Link key={0} to="/user/tccb">
          Tổ chức cán bộ
        </Link>,
        "Hợp đồng giảng dạy",
      ],
      advanceSearch: (
        <>
          <div className="row">
            <FormDatePicker
              type="date-mask"
              ref={(e) => (this.fromDate = e)}
              className="col-12 col-md-4"
              label="Từ thời gian"
            />
            <FormDatePicker
              type="date-mask"
              ref={(e) => (this.toDate = e)}
              className="col-12 col-md-4"
              label="Đến thời gian"
            />
            <FormSelect
              className="col-12 col-md-4"
              multiple
              ref={(e) => (this.maDonVi = e)}
              label="Đơn vị"
              data={SelectAdapter_DmDonVi}
              allowClear
            />
            <FormSelect
              className="col-12 col-md-4"
              multiple
              ref={(e) => (this.nguoiDuocThue = e)}
              label="Người được thuê"
              data={SelectAdapter_FwCanBo}
              allowClear
            />
            <FormSelect
              className="col-12 col-md-4"
              multiple
              ref={(e) => (this.nguoiKy = e)}
              label="Người ký"
              data={SelectAdapter_FwCanBo}
              allowClear
            />
            <FormSelect
              className="col-12 col-md-4"
              multiple
              ref={(e) => (this.maNgach = e)}
              label="Ngạch"
              data={SelectAdapter_DmNgachCdnnV2}
              allowClear
            />
            <div className="col-12">
              <div className="row justify-content-between">
                <div
                  className="form-group col-md-12"
                  style={{ textAlign: "right" }}
                >
                  <button
                    className="btn btn-danger"
                    style={{ marginRight: "10px" }}
                    type="button"
                    onClick={(e) =>
                      e.preventDefault() ||
                      this.changeAdvancedSearch(false, true)
                    }
                  >
                    <i className="fa fa-fw fa-lg fa-times" />
                    Xóa bộ lọc
                  </button>
                  <button
                    className="btn btn-info"
                    type="button"
                    onClick={(e) =>
                      e.preventDefault() || this.changeAdvancedSearch()
                    }
                  >
                    <i className="fa fa-fw fa-lg fa-search-plus" />
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
      content: (
        <>
          <div className="tile">
            <div style={{ marginBottom: "10px" }}>
              Kết quả: {<b>{totalItem}</b>} Hợp đồng giảng dạy
            </div>
            <div className="tile-title-w-btn" style={{ marginBottom: "5" }}>
              <div className="title">
                <div style={{ gap: 10, display: "inline-flex" }}>
                  <FormCheckbox
                    label="Tìm theo cột"
                    onChange={(value) => this.setState({ isKeySearch: value })}
                    style={{ marginBottom: "0" }}
                  />
                  <FormCheckbox
                    label="Thao tác nhanh"
                    onChange={(value) => this.setState({ isFixCol: value })}
                    style={{ marginBottom: "0" }}
                  />
                </div>
              </div>
              <div className="btn-group">
                <Pagination
                  style={{ position: "", marginBottom: "0" }}
                  {...{
                    pageNumber,
                    pageSize,
                    pageTotal,
                    totalItem,
                    pageCondition,
                  }}
                  getPage={this.getPage}
                  pageRange={3}
                />
              </div>
            </div>
            {table}
          </div>
        </>
      ),
      backRoute: "/user/tccb",
      collapse: [
        {
          icon: "fa-plus-square",
          name: "Thêm hợp đồng mới",
          permission: permission.write,
          type: "info",
          onClick: (e) =>
            e.preventDefault() ||
            window.open("/user/tccb/hop-dong-giang-day-test/new", "_blank"),
        },
        {
          icon: "fa-print",
          name: "Export",
          permission: permission.export,
          onClick: (e) => this.export(e),
          type: "success",
        },
        {
          icon: "fa-list",
          name: "Chi tiết hợp đồng",
          permission: permission.write,
          onClick: () =>
            this.props.history.push(
              "/user/tccb/hop-dong-giang-day-test/hoc-phan-giang-day-test"
            ),
          type: "warning",
        },
      ],
    });
  }
}

const mapStateToProps = (state) => ({
  system: state.system,
  danhSachHopDongGiangDayTest: state.tccb.qtHopDongGiangDayTest,
});
const mapActionsToProps = {
  getQTHopDongGiangDayTestPage,
  downloadWord,
  deleteHopDongGiangDayTest,
  exportExcel,
};
export default connect(
  mapStateToProps,
  mapActionsToProps
)(DanhSachQTHopDongGiangDayPage);
