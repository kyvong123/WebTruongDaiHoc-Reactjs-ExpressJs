import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createQtHopDongDvtl, getHopDongMoiNhat, getQtHopDongDvtlEdit, updateQtHopDongDvtl } from './redux';
import { getPreShcc } from 'modules/mdTccb/qtHopDongLaoDong/redux';
import { AdminPage } from 'view/component/AdminPage';
import ComponentPhiaTruong from './componentPhiaTruong';
import ComponentPhiaCanBo from './componentPhiaCanBo';
import { createCanBoDonVi, getCanBoDonVi, updateCanBoDonVi } from 'modules/mdTccb/tccbCanBoDonVi/redux';
import ComponentDieuKhoan from './componentDieuKhoan';
import getDmDonVi from 'modules/mdDanhMuc/dmDonVi/redux';

class HDDVTL_Details extends AdminPage {
    urlMa = '';
    state = { canUpdate: false };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-dvtl/:id');
            this.id = route.parse(window.location.pathname).id;
            this.urlMa = this.id && this.id != 'new' ? this.id : null;
            if (this.urlMa) {
                this.props.getQtHopDongDvtlEdit(this.id, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                    } else {
                        this.phiaTruong.setVal(data.item.qtHopDongDvtl);
                        this.phiaCanBo.setVal(data.item.canBoDuocThue);
                        this.dieuKhoan.setVal(data.item.qtHopDongDvtl);
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
        this.props.getCanBoDonVi(value, data => {
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
        dataDieuKhoan.shcc = dataPhiaCanBo.shcc;
        Object.assign(dataDieuKhoan, dataPhiaTruong);
        dataPhiaCanBo.maDonVi = dataDieuKhoan.diaDiemLamViec;
        dataPhiaCanBo.bacLuong = dataDieuKhoan.bac;
        dataPhiaCanBo.heSoLuong = dataDieuKhoan.heSo;
        dataPhiaCanBo.ngayBatDauCongTac = dataDieuKhoan.batDauLamViec;
        let id = dataDieuKhoan.id;
        let shcc = dataPhiaCanBo.shcc;
        delete dataDieuKhoan.id;
        this.validateNewest(dataDieuKhoan.ngayKyHopDong, dataDieuKhoan.shcc, (canUpdateCanBo) => {
            if (dataPhiaTruong && dataPhiaCanBo && dataDieuKhoan) {
                if (canUpdateCanBo) {
                    T.confirm3('Cập nhật dữ liệu cán bộ', 'Bạn có muốn <b>Lưu hợp đồng</b> và <b>cập nhật</b> dữ liệu hiện tại bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không cập nhật</b>!', 'warning', 'Không cập nhật', 'Cập nhật', isOverride => {
                        if (isOverride !== null) {
                            if (isOverride)
                                T.confirm('Xác nhận', 'Lưu hợp đồng và <b>cập nhật</b> dữ liệu cán bộ?', 'warning', true, isConfirm => {
                                    if (isConfirm) {
                                        !id ? this.props.createQtHopDongDvtl(dataDieuKhoan) : this.props.updateQtHopDongDvtl(id, dataDieuKhoan);
                                        this.props.updateCanBoDonVi(shcc, dataPhiaCanBo);
                                    }
                                });
                            else T.confirm('Xác nhận', 'Lưu hợp đồng và <b> không cập nhật </b> dữ liệu cán bộ?', 'warning', true, isConfirm => {
                                if (isConfirm) !id ? this.props.createQtHopDongDvtl(dataDieuKhoan) : this.props.updateQtHopDongDvtl(id, dataDieuKhoan);
                            });
                        }
                    });
                } else {
                    if (dataPhiaCanBo.isTaoMoi) T.confirm('Xác nhận', 'Lưu hợp đồng và <b> thêm dữ liệu cán bộ mới </b>?', 'warning', true, isConfirm => {
                        if (isConfirm) {
                            this.props.createCanBoDonVi(dataPhiaCanBo);
                            this.props.createQtHopDongDvtl(dataDieuKhoan);
                        }
                    });
                    else
                        !id ? this.props.createQtHopDongDvtl(dataDieuKhoan) : this.props.updateQtHopDongDvtl(id, dataDieuKhoan);
                }
            }
        });
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let permissionWrite = currentPermission.includes('qtHopDongDvtl:write');
        return this.renderPage({
            icon: 'fa fa-briefcase',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='user/tccb/hop-dong-dvtl'>Danh sách hợp đồng</Link>,
                'Hợp đồng cán bộ'
            ],
            title: this.urlMa ? 'Chỉnh sửa hợp đồng đơn vị' : 'Tạo mới hợp đồng đơn vị',
            content: <>
                <ComponentPhiaTruong ref={e => this.phiaTruong = e}/>
                <ComponentPhiaCanBo ref={e => this.phiaCanBo = e}
                                    onCanBoChange={(value) => this.handleCanBoChange(value)}/>
                <ComponentDieuKhoan ref={e => this.dieuKhoan = e} genNewShcc={this.genNewShcc}/>
            </>,
            backRoute: '/user/tccb/qua-trinh/hop-dong-dvtl',
            onSave: permissionWrite ? this.save : null
        });
    }

}

const mapStateToProps = state => ({ system: state.system, qtHopDongDvtl: state.tccb.qtHopDongDvtl });
const mapActionsToProps = {
    getQtHopDongDvtlEdit, getCanBoDonVi, getHopDongMoiNhat, updateCanBoDonVi, createCanBoDonVi, createQtHopDongDvtl, updateQtHopDongDvtl,
    getDmDonVi, getPreShcc
};
export default connect(mapStateToProps, mapActionsToProps)(HDDVTL_Details);