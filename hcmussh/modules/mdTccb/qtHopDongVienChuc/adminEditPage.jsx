import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createQtHopDongVienChuc, getHopDongMoiNhat, getQtHopDongVienChucEdit, updateQtHopDongVienChuc } from './redux';
import { getPreShcc } from 'modules/mdTccb/qtHopDongLaoDong/redux';
import { AdminPage } from 'view/component/AdminPage';
import { createStaff, getStaff, updateStaff } from 'modules/mdTccb/tccbCanBo/redux';
import getDmDonVi from 'modules/mdDanhMuc/dmDonVi/redux';
import ComponentPhiaTruong from './componentPhiaTruong';
import ComponentPhiaCanBo from './componentPhiaCanBo';
import ComponentDieuKhoan from './componentDieuKhoan';

class HDLV_Details extends AdminPage {
    url = '';
    state = { canUpdate: false };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-lam-viec/:ma'),
                ma = route.parse(window.location.pathname).ma;
            this.url = ma && ma != 'new' ? ma : null;
            if (this.url) {
                this.props.getQtHopDongVienChucEdit(ma, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                    } else {
                        data.item.qtHopDongVienChuc.isCvdt = data.item.canBoDuocThue.isCvdt;
                        this.phiaTruong.setVal(data.item.qtHopDongVienChuc);
                        this.phiaCanBo.setVal(data.item.canBoDuocThue);
                        this.dieuKhoan.setVal(data.item.qtHopDongVienChuc);
                    }
                });
            } else {
                this.phiaTruong.setVal();
                this.phiaCanBo.setVal();
                this.dieuKhoan.setVal();
            }
        });
    }

    handleCanBoChange = (value) => {
        this.props.getStaff(value, data => {
            data.item.isTaoMoi = true;
            this.phiaCanBo.setVal(data.item);
        });
    };

    validateNewest = (ngayKyHopDong, shcc, done) => {
        this.props.getHopDongMoiNhat(shcc, data => {
            data ? this.setState({ canUpdate: ngayKyHopDong >= data.ngayKyHopDong }, () => {
                done(this.state.canUpdate);
            }) : done();
        });
    };

    genNewShcc = (maDonVi, preShcc, nhomNgach) => {
        this.props.getPreShcc(maDonVi, (data) => {
            preShcc = preShcc + '.' + (nhomNgach == 1 ? '0' : '5') + data.preShcc.toString().padStart(3, '0');
            this.phiaCanBo.setShcc(preShcc);
        });
    };

    save = () => {
        const dataPhiaTruong = this.phiaTruong.getValue();
        if (!dataPhiaTruong) {
            return;
        }
        const dataPhiaCanBo = this.phiaCanBo.getValue();
        if (!dataPhiaCanBo) {
            return;
        }
        const dataDieuKhoan = this.dieuKhoan.getValue();
        if (!dataDieuKhoan) {
            return;
        }
        dataDieuKhoan.nguoiDuocThue = dataPhiaCanBo.shcc;
        Object.assign(dataDieuKhoan, dataPhiaTruong);
        dataPhiaCanBo.maDonVi = dataDieuKhoan.diaDiemLamViec;
        dataPhiaCanBo.ngach = dataDieuKhoan.maNgach;
        dataPhiaCanBo.bacLuong = dataDieuKhoan.bac;
        dataPhiaCanBo.heSoLuong = dataDieuKhoan.heSo;
        dataPhiaCanBo.ngayBatDauCongTac = dataDieuKhoan.ngayBatDauLamViec;
        dataPhiaCanBo.isCvdt = dataDieuKhoan.isCvdt ? 1 : 0;
        let ma = dataDieuKhoan.ma;
        delete dataDieuKhoan.ma;
        this.validateNewest(dataDieuKhoan.ngayKyHopDong, dataDieuKhoan.nguoiDuocThue, (canUpdateCanBo) => {
            if (dataPhiaTruong && dataPhiaCanBo && dataDieuKhoan) {
                if (canUpdateCanBo) {
                    T.confirm3('Cập nhật dữ liệu cán bộ', 'Bạn có muốn <b>Lưu hợp đồng</b> và <b>cập nhật</b> dữ liệu hiện tại bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không cập nhật</b>!', 'warning', 'Không cập nhật', 'Cập nhật', isOverride => {
                        if (isOverride !== null) {
                            if (isOverride)
                                T.confirm('Xác nhận', 'Lưu hợp đồng và <b>cập nhật</b> dữ liệu cán bộ?', 'warning', true, isConfirm => {
                                    if (isConfirm) {
                                        !ma ? this.props.createQtHopDongVienChuc(dataDieuKhoan) : this.props.updateQtHopDongVienChuc(ma, dataDieuKhoan);
                                        this.props.updateStaff(dataPhiaCanBo.shcc, dataPhiaCanBo);
                                    }
                                });
                            else T.confirm('Xác nhận', 'Lưu hợp đồng và <b> không cập nhật </b> dữ liệu cán bộ?', 'warning', true, isConfirm => {
                                if (isConfirm) !ma ? this.props.createQtHopDongVienChuc(dataDieuKhoan) : this.props.updateQtHopDongVienChuc(ma, dataDieuKhoan);
                            });
                        }
                    });
                } else {
                    if (dataPhiaCanBo.isTaoMoi) T.confirm('Xác nhận', 'Lưu hợp đồng và <b> thêm dữ liệu cán bộ mới </b>?', 'warning', true, isConfirm => {
                        if (isConfirm) {
                            this.props.createStaff(dataPhiaCanBo);
                            this.props.createQtHopDongVienChuc(dataDieuKhoan);
                        }
                    });
                    else
                        !ma ? this.props.createQtHopDongVienChuc(dataDieuKhoan) : this.props.updateQtHopDongVienChuc(ma, dataDieuKhoan);
                }
            }
        });
    };

    isCanBoCu = () => this.phiaCanBo.getIsCanBoCu();

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let permissionWrite = currentPermission.includes('qtHopDongVienChuc:write');
        return this.renderPage({
            icon: 'fa fa-briefcase',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='user/tccb/hop-dong-lam-viec'>Danh sách hợp đồng</Link>,
                'Hợp đồng cán bộ'
            ],
            title: this.url ? 'Chỉnh sửa hợp đồng làm việc' : 'Tạo mới hợp đồng làm việc',
            content: <>
                <ComponentPhiaTruong ref={e => this.phiaTruong = e} />
                <ComponentPhiaCanBo ref={e => this.phiaCanBo = e}
                    onCanBoChange={(value) => this.handleCanBoChange(value)} />
                <ComponentDieuKhoan ref={e => this.dieuKhoan = e} genNewShcc={this.genNewShcc} isCanBoCu={() => this.isCanBoCu()} />
            </>,
            backRoute: '/user/tccb/qua-trinh/hop-dong-lam-viec',
            onSave: permissionWrite ? this.save : null
        });
    }

}

const mapStateToProps = state => ({ system: state.system, qtHopDongVienChuc: state.tccb.qtHopDongVienChuc });
const mapActionsToProps = {
    getQtHopDongVienChucEdit, getStaff, getHopDongMoiNhat, updateStaff, createStaff, createQtHopDongVienChuc, updateQtHopDongVienChuc,
    getDmDonVi, getPreShcc
};
export default connect(mapStateToProps, mapActionsToProps)(HDLV_Details);