import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { SelectAdapter_DtDmHocKy } from "modules/mdDaoTao/dtDmHocKy/redux";
import {
  AdminPage,
  TableHead,
  TableCell,
  FormCheckbox,
  renderDataTable,
  FormSelect,
} from "view/component/AdminPage";
import {
  getHocPhanGiangDayPage,
  exportExcelHocPhan,
  updateHocPhanGiangDay,
  updateChiaTiet,
  updateHopDongGiangDayTest,
} from "./redux";
import Pagination from "view/component/Pagination";
// import { EditModal } from "./modal/EditModal";
// import { ChiaTietModal } from "./modal/ChiaTietModal";
import { ThanhToanHocPhanModal } from "./modal/ThanhToanHocPhanModal";
import { Tooltip } from "@mui/material";
import { getHocPhanTheoCanBo } from "./redux";

const yearDatas = () => {
  return Array.from({ length: 15 }, (_, i) => {
    const year = i + new Date().getFullYear() - 14;
    return { id: year, text: `${year} - ${year + 1}` };
  });
};

class DanhSachHocPhanGiangDayPage extends AdminPage {
  defaultSortTerm = "hoTenCanBo_ASC";
  state = {
    filter: { sortKey: "hoTenCanBo", sortMode: "ASC" },
    searchText: "",
    hocKy: 1,
    namHoc: 2023,
  };
  componentDidMount() {
    T.ready("/user/tccb", () => {
      this.getPage(undefined, undefined);
      this.changeAdvancedSearch(true, false);
    });
    this.getPage();
  }

  changeAdvancedSearch = (isInitial = false, isReset = false) => {
    let { pageNumber, pageSize } =
      this.props &&
      this.props.danhSachHocPhanGiangDay &&
      this.props.danhSachHocPhanGiangDay.page
        ? this.props.danhSachHocPhanGiangDay.page
        : { pageNumber: 1, pageSize: 50, pageCondition: {} };
    const hocKy = this.hocKy?.value();
    const namHoc = this.namHoc?.value();
    const pageFilter = isInitial || isReset ? {} : { hocKy, namHoc };
    this.setState({ filter: pageFilter }, () => {
      this.getPage(pageNumber, pageSize, (page) => {
        if (isInitial) {
          const filter = page.filter || {};
          const { namHoc, hocKy } = filter;
          this.setState({ namHoc, hocKy, filter });
          this.hocKy?.value(filter.hocKy || "");
          this.namHoc?.value(filter.namHoc || "");
        } else if (isReset) {
          ["hocKy", "namHoc"].forEach((e) => this[e]?.value(""));
        }
      });
    });
  };

  getPage = (pageN, pageS, done) => {
    this.props.getHocPhanGiangDayPage(pageN, pageS, this.state.filter, done);
  };

  handleKeySearch = (data, pageNumber, pageSize) => {
    this.setState(
      {
        filter: {
          ...this.state.filter,
          [data.split(":")[0]]: data.split(":")[1],
        },
      },
      () => {
        this.getPage(pageNumber, pageSize);
      }
    );
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
      this.getPage
    );
  };

  export = (e) => {
    e.preventDefault();
    this.props.exportExcelHocPhan(this.state.filter);
  };

  downloadWord = () => {
    this.props.xuatThongKe((data) => {
      T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.filename);
    });
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
      this.props.danhSachHocPhanGiangDay &&
      this.props.danhSachHocPhanGiangDay.page
        ? this.props.danhSachHocPhanGiangDay.page
        : {
            pageNumber: 1,
            pageSize: 50,
            pageTotal: 1,
            totalItem: 0,
            pageCondition: {},
            list: [],
          };
    let table = renderDataTable({
      emptyTable: "Không có học phần giảng dạy",
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
            content="Số HĐGD"
            keyCol="soHopDong"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 60, width: "auto", textAlign: "center" }}
            content="Mã số thuế"
            keyCol="maSoThue"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Mã giảng viên"
            keyCol="nguoiDuocThue"
            onKeySearch={onKeySearch}
            onSort={this.onSort}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Họ tên"
            keyCol="hoTenCanBo"
            onKeySearch={onKeySearch}
            onSort={this.onSort}
          />
        
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Tên môn học"
            keyCol="tenMonHoc"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 60, width: "auto", textAlign: "center" }}
            content="Năm học"
            keyCol="namHoc"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Học kỳ"
            keyCol="hocKy"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Lớp"
            keyCol="maHocPhan"
            onKeySearch={onKeySearch}
            onSort={this.onSort}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Số sinh viên"
            keyCol="soSinhVien"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Tổng số tiết"
            keyCol="soTietChuan"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Số tín chỉ"
            keyCol="soTinChi"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Tổng hệ số"
            keyCol="heSo"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Mức thù lao"
            keyCol="donGiaChuan"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Thành tiền "
            keyCol="thanhTienHocPhan"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Khấu trừ thuế TNCN"
            keyCol="khauTruThueTncnHocPhan"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Thực nhận"
            keyCol="thucNhanHocPhan"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Ghi chú"
            keyCol="ghiChu"
            onKeySearch={onKeySearch}
          />
          <TableHead
            style={{ minwidth: 90, width: "auto", textAlign: "center" }}
            content="Tình trạng thanh toán"
            keyCol="tinhTrangThanhToan"
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
            content={item.soHopDong || "Chưa có hợp đồng"}
          />
          <TableCell style={{ whiteSpace: "nowrap" }} content={item.maSoThue} />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.nguoiDuocThue}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={"GiANG VIEN TEST" + (index + 1)}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.tenMonHoc}
          />
          <TableCell style={{ whiteSpace: "nowrap" }} content={item.namHoc} />
          <TableCell style={{ whiteSpace: "nowrap" }} content={item.hocKy} />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.maHocPhan}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.soSinhVien}
          />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.tongSoTiet}
          />
          <TableCell style={{ whiteSpace: "nowrap" }} content={item.soTinChi} />
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            content={item.heSo?.toFixed(1)}
          />
          <TableCell
            style={{ whiteSpace: "nowrap", textAlign: "right" }}
            content={item.donGiaChuan?.toString().numberDisplay()}
          />
          <TableCell
            style={{ whiteSpace: "nowrap", textAlign: "right" }}
            content={item.thanhTienHocPhan?.toString().numberDisplay()}
          />
          <TableCell
            style={{ whiteSpace: "nowrap", textAlign: "right" }}
            content={item.khauTruThueTncnHocPhan?.toString().numberDisplay()}
          />
          <TableCell
            style={{ whiteSpace: "nowrap", textAlign: "right" }}
            content={item.thucNhanHocPhan?.toString().numberDisplay()}
          />
          <TableCell style={{ whiteSpace: "nowrap" }} content={item.ghiChu} />
          <TableCell
            style={{
              whiteSpace: "nowrap",
              color: item.tinhTrangThanhToan ? "green" : "red",
            }}
            content={
              item.tinhTrangThanhToan ? "Đã thanh toán" : "Chưa thanh toán"
            }
          />
          <TableCell
            type="buttons"
            style={{ textAlign: "center" }}
            content={item}
            permission={permission}
            onEdit={() => permission.write && this.modal.show(item)}
            onDelete={this.delete}
          >
            <Tooltip title="Thanh toán học phàn" arrow>
              <button
                className="btn btn-danger"
                onClick={(e) =>
                  e.preventDefault() || !item.tinhTrangThanhToan
                    ? this.thanhToanHocPhanModal.show(item)
                    : T.notify("Học này đã được thanh toán !", "danger")
                }
              >
                <i className="fa fa-gavel" />
              </button>
            </Tooltip>
            {/* <Tooltip title='Chia lại tiết giảng viên' arrow>
                            <button className='btn btn-warning' onClick={e => e.preventDefault() || this.chiaTietModal.show(item, this.state.filter)}>
                                <i className='fa fa-pie-chart' />
                            </button>
                        </Tooltip> */}
            {!item.maHopDong && (
              <>
                <Tooltip title="Tạo hợp đồng" arrow>
                  <button
                    className="btn btn-success"
                    onClick={(e) =>
                      e.preventDefault() ||
                      this.props.history.push({
                        pathname: "/user/tccb/hop-dong-giang-day-test/new",
                        search: `?shcc=${item.nguoiDuocThue}`,
                      })
                    }
                  >
                    <i className="fa fa-plus-circle" />
                  </button>
                </Tooltip>
              </>
            )}
          </TableCell>
        </tr>
      ),
    });
    return this.renderPage({
      icon: "fa fa-briefcase",
      title: "Học phần giảng dạy",
      header: (
        <>
          <FormSelect
            ref={(e) => (this.namHoc = e)}
            style={{ width: "120px", marginBottom: "0", marginRight: 10 }}
            placeholder="Năm học"
            data={yearDatas()?.reverse()}
            onChange={() => this.changeAdvancedSearch()}
          />
          <FormSelect
            ref={(e) => (this.hocKy = e)}
            style={{ width: "100px", marginBottom: "0" }}
            placeholder="Học kỳ"
            data={SelectAdapter_DtDmHocKy}
            onChange={() => this.changeAdvancedSearch()}
          />
        </>
      ),
      breadcrumb: [
        <Link key={0} to="/user/tccb">
          Tổ chức cán bộ
        </Link>,
        "Học phần giảng dạy",
      ],
      advanceSearch: (
        <>
          <div className="row">
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
              Kết quả: {<b>{totalItem}</b>} Danh sách học phần giảng dạy
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
                {/* <EditModal
                  ref={(e) => (this.modal = e)}
                  permission={permission}
                  getPage={this.changeAdvancedSearch}
                  update={this.props.updateHocPhanGiangDay}
                /> */}
                {/* <ChiaTietModal
                  ref={(e) => (this.chiaTietModal = e)}
                  permission={permission}
                  getPage={this.changeAdvancedSearch}
                  updateChiaTiet={this.props.updateChiaTiet}
                /> */}
                <ThanhToanHocPhanModal
                  ref={(e) => (this.thanhToanHocPhanModal = e)}
                  permission={permission}
                  getPage={this.changeAdvancedSearch}
                  getHocPhanTheoCanBo={this.props.getHocPhanTheoCanBo}
                  updateHocPhanGiangDay={this.props.updateHocPhanGiangDay}
                  updateHopDongGiangDayTest={
                    this.props.updateHopDongGiangDayTest
                  }
                />
              </div>
            </div>
            {table}
          </div>
        </>
      ),
      backRoute: "/user/tccb/hop-dong-giang-day-test",
      onExport: permission && permission.export ? (e) => this.export(e) : null,
    });
  }
}

const mapStateToProps = (state) => ({
  system: state.system,
  danhSachHocPhanGiangDay: state.tccb.qtHopDongGiangDayTest,
});
const mapActionsToProps = {
  getHocPhanGiangDayPage,
  exportExcelHocPhan,
  updateHocPhanGiangDay,
  updateChiaTiet,
  getHocPhanTheoCanBo,
  updateHopDongGiangDayTest,
};
export default connect(
  mapStateToProps,
  mapActionsToProps
)(DanhSachHocPhanGiangDayPage);
