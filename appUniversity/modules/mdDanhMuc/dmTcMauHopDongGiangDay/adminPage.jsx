import React from "react";
import { connect } from "react-redux";
import {
  getDmTcMauHopDongGiangDayPage,
  getDmTcMauHopDongGiangDayAll,
  deleteDmTcMauHopDongGiangDay,
  createDmTcMauHopDongGiangDay,
  updateDmTcMauHopDongGiangDay,
  downloadFileWord,
} from "./redux";
import { Link } from "react-router-dom";
import Pagination from "view/component/Pagination";
import {
  AdminPage,
  AdminModal,
  TableCell,
  renderTable,
  FormTextBox,
  FormFileBox,
  getValue,
  FormSelect,
} from "view/component/AdminPage";
import { Tooltip } from "@mui/material";
import { SelectAdapter_DmSvLoaiHinhDaoTao } from "modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux";

class EditModal extends AdminModal {
  componentDidMount() {
    $(document).ready(() =>
      this.onShown(() => {
        !this.ma.value() ? this.ma.focus() : this.ten.focus();
      })
    );
  }

  onShow = (item) => {
    let { ma, ten, loaiHinhDaoTao } = item
      ? item
      : { ma: "", ten: "", loaiHinhDaoTao: "" };
    this.ma.value(ma || "");
    this.ten.value(ten || "");
    this.loaiHinhDaoTao.value(loaiHinhDaoTao || "");
    this.setState({ isCreate: !item, ma, item });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      ma: getValue(this.ma),
      ten: getValue(this.ten),
      loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
    };
    let isCreate = this.state.isCreate;
    if (!isCreate) {
      if (this.fileBox.fileBox.getFile()) {
        this.fileBox.fileBox.onUploadFile(changes);
        this.hide();
      } else {
        this.props.update(this.state.ma, changes, this.hide);
      }
    } else {
      this.fileBox.fileBox.onUploadFile({ ...changes, isCreate });
      this.hide();
    }
  };

  onSuccess = ({ error, item }) => {
    if (item) T.notify("Tải lên tệp tin thành công!", "success");
    else if (error) T.notify(error, "danger");
    this.props.getDmTcMauHopDongGiangDayPage();
  };

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.ma
        ? "Cập nhật danh mục mẫu hợp đồng giảng dạy"
        : "Tạo mới danh mục mẫu hợp đồng giảng dạy",
      body: (
        <div className="row">
          <FormTextBox
            type="text"
            className="col-md-12"
            ref={(e) => (this.ma = e)}
            label="Mã"
            readOnly={this.state.ma || readOnly}
            required
          />
          <FormTextBox
            type="text"
            className="col-md-12"
            ref={(e) => (this.ten = e)}
            label="Tên mẫu hợp đồng giảng dạy"
            readOnly={readOnly}
            required
          />
          <FormSelect
            className="col-md-12"
            ref={(e) => (this.loaiHinhDaoTao = e)}
            data={SelectAdapter_DmSvLoaiHinhDaoTao}
            label="Loại hình đào tạo"
            allowClear
            multiple
            required
          />
          <FormFileBox
            className="col-md-12"
            ref={(e) => (this.fileBox = e)}
            label="Tệp tin tải lên"
            postUrl="/user/upload"
            uploadType="dmTcMauHopDongGiangDayFile"
            onSuccess={this.onSuccess}
            required
            pending
          />
        </div>
      ),
    });
  };
}

class DmTcMauHopDongGiangDayPage extends AdminPage {
  componentDidMount() {
    T.ready("/user/category", () => {
      T.onSearch = (searchText) =>
        this.props.getDmTcMauHopDongGiangDayPage(
          undefined,
          undefined,
          searchText || ""
        );
      T.showSearchBox();
      this.props.getDmTcMauHopDongGiangDayPage();
    });
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  };

  delete = (e, item) => {
    e.preventDefault();
    T.confirm(
      "Xóa mẫu hợp đồng giảng dạy",
      "Bạn có chắc bạn muốn xóa danh mục này?",
      true,
      (isConfirm) =>
        isConfirm && this.props.deleteDmTcMauHopDongGiangDay(item.ma)
    );
  };

  downloadFileWord = (ma) => {
    this.props.downloadFileWord(ma);
  };

  render() {
    const permission = this.getUserPermission("dmTcMauHopDongGiangDay", [
      "read",
      "write",
      "delete",
      "export",
    ]);
    const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
      this.props.dmTcMauHopDongGiangDay &&
      this.props.dmTcMauHopDongGiangDay.page
        ? this.props.dmTcMauHopDongGiangDay.page
        : {
            pageNumber: 1,
            pageSize: 50,
            pageTotal: 1,
            totalItem: 0,
            list: null,
          };
    let table = renderTable({
      getDataSource: () => list?.sort((a, b) => (a.ma < b.ma ? -1 : 1)),
      stickyHead: false,
      renderHead: () => (
        <tr>
          <th style={{ width: "auto", textAlign: "center" }}>#</th>
          <th style={{ width: "20%", whiteSpace: "nowrap" }}>Mã</th>
          <th style={{ width: "30%", whiteSpace: "nowrap" }}>
            Tên mẫu hợp đồng giảng dạy
          </th>
          <th style={{ width: "25%", whiteSpace: "nowrap" }}>
            Loại hình đào tạo
          </th>
          <th style={{ width: "auto" }}>Thao tác</th>
        </tr>
      ),
      renderRow: (item, index) => (
        <tr key={index}>
          <TableCell
            style={{ textAlign: "right" }}
            content={(pageNumber - 1) * pageSize + index + 1}
          />
          <TableCell
            type="link"
            content={item.ma}
            onClick={() => this.modal.show(item)}
          />
          <TableCell type="text" content={item.ten} />
          <TableCell type="text" content={item.tenLoaiHinhDaoTao} />
          <TableCell
            type="buttons"
            style={{ textAlign: "center" }}
            content={item}
            permission={permission}
            onEdit={() => this.modal.show(item)}
            onDelete={(e) => this.delete(e, item)}
          >
            <Tooltip title="Tải xuống" arrow>
              <span>
                <button
                  className="btn btn-success"
                  onClick={(e) =>
                    e.preventDefault() || this.downloadFileWord(item.ma)
                  }
                >
                  <i className="fa fa-lg fa-download" content={item} />
                </button>
              </span>
            </Tooltip>
          </TableCell>
        </tr>
      ),
    });

    return this.renderPage({
      icon: "fa fa-list-alt",
      title: "Danh mục mẫu hợp đồng giảng dạy",
      breadcrumb: [
        <Link key={0} to="/user/category">
          Danh mục
        </Link>,
        "Danh mục mẫu hợp đồng giảng dạy",
      ],
      content: (
        <>
          <div className="tile">{table}</div>
          <Pagination
            style={{ marginLeft: "70px" }}
            {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
            getPage={this.props.getDmTcMauHopDongGiangDayPage}
          />
          <EditModal
            ref={(e) => (this.modal = e)}
            permission={permission}
            getDmTcMauHopDongGiangDayPage={
              this.props.getDmTcMauHopDongGiangDayPage
            }
            create={this.props.createDmTcMauHopDongGiangDay}
            update={this.props.updateDmTcMauHopDongGiangDay}
          />
        </>
      ),
      backRoute: "/user/category",
      onCreate:
        permission && permission.write ? (e) => this.showModal(e) : null,
    });
  }
}

const mapStateToProps = (state) => ({
  system: state.system,
  dmTcMauHopDongGiangDay: state.danhMuc.dmTcMauHopDongGiangDay,
});
const mapActionsToProps = {
  getDmTcMauHopDongGiangDayPage,
  getDmTcMauHopDongGiangDayAll,
  deleteDmTcMauHopDongGiangDay,
  createDmTcMauHopDongGiangDay,
  updateDmTcMauHopDongGiangDay,
  downloadFileWord,
};
export default connect(
  mapStateToProps,
  mapActionsToProps
)(DmTcMauHopDongGiangDayPage);
