import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_TcNhomFilter } from 'modules/mdKeHoachTaiChinh/tcNhom/redux';
import React from 'react';
import { connect } from 'react-redux';
// import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { createDinhMucDetail, updateDinhMucDetail } from '../redux';
const loaiHocPhan = [{ id: 'CT', text: 'Học cải thiện' }, { id: 'HL', text: 'Học lại' }, { id: 'TKH', text: 'Theo kế hoạch' }];
class DinhMucDetailModal extends AdminModal {
    onShow = (item) => {
        if (item.id) {
            this.setState({ ...item, thuHocPhiHocKy: !!item.thuHocPhiHocKy }, () => {
                this.nhom.value(item?.idNhom ? item.idNhom.split(', ') : '');
                this.nganh.value(item?.maNganh ? item.maNganh.split(', ') : '');
                this.loaiHocPhan.value(item?.loaiHocPhan ? item.loaiHocPhan.split(',') : '');
                this.loaiHinhDaoTao.value(item.he);
                this.soTien.value(item.soTien);
                this.soTienThanhChu?.value(item.soTien ? T.numberToVnText(item.soTien) + ' đồng' : '');
                this.thuHocPhiHocKy.value(!!item.thuHocPhiHocKy);
                this.hocPhiHocKy.value(item?.hocPhiHocKy ? item.hocPhiHocKy : '');
                this.hocPhiHocKyThanhChu?.value(item.hocPhiHocKy ? T.numberToVnText(item.hocPhiHocKy) + ' đồng' : '');
                this.gioiHan.value(item?.gioiHan ? item.gioiHan : '');
                this.gioiHanThanhChu?.value(item.gioiHan ? T.numberToVnText(item.gioiHan) + ' đồng' : '');
            });
        } else {
            this.loaiHinhDaoTao.value('');
            this.nhom.value('');
            this.loaiHocPhan.value('');
            this.soTien.value('');
            this.soTienThanhChu.value('');
            this.gioiHan.value('');
            this.gioiHanThanhChu.value('');
            this.thuHocPhiHocKy.value(true);
            this.hocPhiHocKy.value('');
            this.hocPhiHocKyThanhChu.value('');
            this.nganh.value('');
            this.setState({ id: null, namHoc: item.namHoc, hocKy: item.hocKy, namTuyenSinh: item.namTuyenSinh, bac: item.bac, thuHocPhiHocKy: true }, () => {
                this.nhom.value('');
            });
        }
    }

    onSubmit = () => {
        const data = {
            namHoc: this.state.namHoc,
            hocKy: this.state.hocKy,
            namTuyenSinh: this.state.namTuyenSinh,
            nhom: this.nhom.value(),
            nganh: this.nganh.value(),
            soTien: this.soTien.value() || null,
            hocPhiHocKy: this.state.thuHocPhiHocKy ? (this.hocPhiHocKy.value() || null) : null,
            gioiHan: this.gioiHan.value() || null,
            bac: this.state.bac,
            loaiHocPhan: this.loaiHocPhan.value().toString(),
            loaiHinhDaoTao: this.loaiHinhDaoTao.value(),
            thuHocPhiHocKy: Number(this.state.thuHocPhiHocKy)
        };

        if (!data.soTien) {
            data.soTien = 0;
        }
        if (!data.loaiHocPhan) {
            data.loaiHocPhan = 'HL,CT,TKH';
        }
        if (!data.loaiHinhDaoTao) {
            return T.notify('Loại hình đào tạo trống', 'danger');
        }
        else {
            if (this.state.id) {
                this.props.updateDinhMucDetail(this.state.id, data, () => this.props.getData(() => this.hide()));
            } else
                this.props.createDinhMucDetail(data, () => this.props.getData(() => this.hide()));
        }
    }

    onChangeSoTien = () => {
        if (this.soTien?.value()) {
            this.soTienThanhChu?.value(T.numberToVnText(this.soTien.value()) + ' đồng');
        } else {
            this.soTienThanhChu?.value('');
        }

        if (this.hocPhiHocKy?.value()) {
            this.hocPhiHocKyThanhChu?.value(T.numberToVnText(this.hocPhiHocKy.value()) + ' đồng');
        } else {
            this.hocPhiHocKyThanhChu?.value('');
        }

        if (this.gioiHan?.value()) {
            this.gioiHanThanhChu?.value(T.numberToVnText(this.gioiHan.value()) + ' đồng');
        } else {
            this.gioiHanThanhChu?.value('');
        }
    }

    render = () => {
        // const permission = this.props.permission;

        // let tableLoaiPhi = renderTable({
        //     emptyTable: 'Không có dữ liệu danh sách loại phí',
        //     stickyHead: false,
        //     header: 'thead-light',
        //     getDataSource: () => loaiHocPhan || [],
        //     renderHead: () => (<tr>
        //         <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
        //         <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại học phần</th>
        //         <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền (VNĐ)</th>
        //     </tr>),
        //     renderRow: (item, index) => (
        //         <tr style={{ background: this[item.id]?.value() ? '#FEFFDC' : '' }} key={index}>
        //             <TableCell style={{ textAlign: 'center' }} content={index + 1} />
        //             <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.text} />
        //             <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
        //                 content={<FormTextBox type='number' className='col-md-12' ref={e => this[`soTien_${item.id}`] = e} style={{ margin: 0, padding: 0 }} />}
        //             />
        //         </tr>
        //     )
        // });
        return this.renderModal({
            title: 'Định mức',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} required />
                <FormSelect className='col-md-6' ref={e => this.loaiHocPhan = e} label='Loại Học Phần' data={loaiHocPhan} required multiple />
                <FormTextBox type='number' className='col-md-4' ref={e => this.soTien = e} label='Học phí theo tín chỉ (VNĐ)' onChange={this.onChangeSoTien} required />
                <FormTextBox className='col-md-8' ref={e => this.soTienThanhChu = e} label='Học phí theo tín chỉ (thành chữ)' disabled />
                <FormCheckbox className='col-md-12' ref={e => this.thuHocPhiHocKy = e} label='Thu học phí học kỳ' onChange={value => this.setState({ thuHocPhiHocKy: value })} />
                <FormTextBox type='number' className='col-md-4 mt-2' ref={e => this.hocPhiHocKy = e} label='Học phí theo học kỳ (VNĐ)' onChange={this.onChangeSoTien} disabled={!this.state.thuHocPhiHocKy} required />
                <FormTextBox className='col-md-8 mt-2' ref={e => this.hocPhiHocKyThanhChu = e} label='Học phí theo học kỳ (thành chữ)' disabled />
                <FormTextBox type='number' className='col-md-4' ref={e => this.gioiHan = e} label='Giới hạn thu (VNĐ) (khóa 2022)' onChange={this.onChangeSoTien} required />
                <FormTextBox className='col-md-8' ref={e => this.gioiHanThanhChu = e} label='Giới hạn thu (thành chữ)' disabled />
                <FormSelect multiple className='col-md-12' ref={e => this.nhom = e} label='Nhóm ngành' data={SelectAdapter_TcNhomFilter(this.state.namHoc, this.state.hocKy)} />
                <FormSelect multiple className='col-md-12' ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} />
            </div>
        });
    }
}

const mapActionsToProps = { createDinhMucDetail, updateDinhMucDetail };
export default connect(null, mapActionsToProps, null, { forwardRef: true })(DinhMucDetailModal);
