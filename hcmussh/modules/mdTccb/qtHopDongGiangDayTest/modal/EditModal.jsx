import React from "react";
import { getValue, AdminModal, FormTextBox } from "view/component/AdminPage";

export class EditModal extends AdminModal {
  onShow = (item) => {
    let { maHocPhan, nguoiDuocThue, tongSoTiet, soSinhVien, loaiHinhDaoTao } =
      item;
    this.soTiet.value(tongSoTiet || "");
    this.soSinhVien.value(soSinhVien || "");
    this.maHocPhan.value(maHocPhan);
    this.setState({ giangVien: nguoiDuocThue, loaiHinhDaoTao });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const changes = {
      tongSoTiet: getValue(this.soTiet),
      soSinhVien: getValue(this.soSinhVien),
    };

    this.props.update(
      this.maHocPhan.value(),
      this.state.giangVien,
      changes,
      this.state.loaiHinhDaoTao,
      this.props.getPage
    );
    this.hide();
  };

  render = () => {
    return this.renderModal({
      title: "Cập nhật Học phần giảng dạy",
      body: (
        <div className="row">
          <FormTextBox
            type="text"
            className="col-md-6"
            ref={(e) => (this.maHocPhan = e)}
            label="Mã học phần"
            readOnly
            required
          />
          <div className="col-md-12">
            <hr style={{ margin: "0 0 1rem 0", padding: 0 }} />
          </div>
          <FormTextBox
            type="text"
            className="col-md-6"
            ref={(e) => (this.soTiet = e)}
            label="Số tiết thực tế"
            required
          />
          <FormTextBox
            type="text"
            className="col-md-6"
            ref={(e) => (this.soSinhVien = e)}
            label="Số sinh viên thực tế"
            required
          />
        </div>
      ),
    });
  };
}
