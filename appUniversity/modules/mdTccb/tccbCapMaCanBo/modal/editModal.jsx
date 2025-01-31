import React from 'react';

import { AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';

export default class DetailModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item) => {
        this.setState({ ...item, mapTrangThai: this.props.mapTrangThai || {} }, () => {
            this.hoVaTen.value(this.state.hoVaTen?.normalizedName() || '');
            this.gioiTinh.value(this.state.gioiTinh || '');
            this.ngaySinh.value(new Date(this.state.ngaySinh).ddmmyyyy());
            this.emailCaNhan.value(this.state.emailCaNhan || '');
            this.tenDonVi.value(this.state.tenDonVi || '');
            this.ghiChu.value(this.state.ghiChu || '');
            this.emailTruong.value(this.state.emailTruong || this.state.emailTruongSuggest || 'Chưa có');
            this.trangThaiEmail.value(this.state.emailTruong ? 'Đã cấp' : (this.state.emailTruongSuggest ? 'Chờ duyệt' : ''));

            const dateNgaySinh = new Date(this.state.ngaySinh).getFullYear().toString();
            this.mscb?.value(this.state.mscb || `QSX${dateNgaySinh.substring(2)}${this.state.gioiTinh}${this.state.dinhDanh.toString().padStart(4, '0')}`);
            this.trangThai.value(this.state.mapTrangThai[this.state.trangThai]?.toUpperCase() || '');
            this.nguoiGui.value(this.state.nguoiGui || '');
            this.ngayGui.value(new Date(this.state.thoiGianTao).ddmmyyyy());
            this.modifier?.value(this.state.modifier || '');
            this.timeModified?.value(new Date(this.state.timeModified).ddmmyyyy());
        });
    }

    onAccept = () => {
        const { id } = this.state;
        T.confirm('Cảnh báo', 'Xác nhận CÓ HIỆU LỰC mã số cho cán bộ này?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.setState({ isSubmitting: true }, () => {
                    this.props.accept({ id, ghiChu: this.ghiChu.value() || '' }, () => {
                        this.hide();
                        this.setState({ isSubmitting: false });
                        T.alert('Cấp mới mã số cán bộ thành công!', 'success', false, 800);
                    });
                });
            }
        });
    }

    onReject = () => {
        T.confirm('Cảnh báo', `Xác nhận hủy yêu cầu cấp mã số cho cán bộ ${this.state.hoVaTen?.normalizedName() || ''}?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.setState({ isSubmitting: true }, () => {
                    this.props.reject(this.state.id, this.ghiChu.value() || '', () => {
                        this.hide();
                        this.setState({ isSubmitting: false });
                        T.alert('Hủy yêu cầu cấp mã số cán bộ thành công', 'success', false, 800);
                    });
                });
            }
        });

    }

    render = () => {
        return this.renderModal({
            title: 'Thông tin yêu cầu cấp Mã số cán bộ',
            isLoading: this.state.isSubmitting,
            isShowSubmit: false,
            size: 'large',
            body: <div className='row'>
                <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{`THÔNG TIN CÁN BỘ${this.state.trangThai == 'XAC_NHAN' ? ` - ${this.state.mscb}` : ''}`}</h4>
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.hoVaTen = e} label='Họ và tên' readOnly />
                {/* <FormTextBox disabled={this.state.isSubmitting} className='col-md-3' ref={e => this.gioiTinh = e} label='Giới tính' readOnly /> */}
                <FormSelect disabled={this.state.isSubmitting} data={[{ id: 0, text: 'Nữ' }, { id: 1, text: 'Nam' }]} className='col-md-3' ref={e => this.gioiTinh = e} label='Giới tính' readOnly />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-3' ref={e => this.ngaySinh = e} label='Ngày sinh' readOnly />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.emailCaNhan = e} label='Email cá nhân' readOnly />
                {this.state.trangThai != 3 && <FormTextBox disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.mscb = e} label={`Mã số cán bộ${this.state.trangThai == 'CHO_KY' ? ' (dự kiến)' : ''}`} readOnly />}
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.trangThai = e} label='Trạng thái cán bộ' readOnly />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.emailTruong = e} label='Email trường' readOnly />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.trangThaiEmail = e} label='Trạng thái' readOnly />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={this.state.trangThai != 1} />
                <hr className='col-12' style={{ margin: '0 0 1rem 0', padding: 0 }} />
                <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>THÔNG TIN PHÍA ĐƠN VỊ</h4>
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.tenDonVi = e} label='Đơn vị yêu cầu' readOnly />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-8' ref={e => this.nguoiGui = e} label='Người gửi yêu cầu' readOnly />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.ngayGui = e} label='Ngày tạo yêu cầu' readOnly />
                {this.state.trangThai != 'CHO_KY' && <>
                    <hr className='col-12' style={{ margin: '0 0 1rem 0', padding: 0 }} />
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>THÔNG TIN PHÍA TIẾP NHẬN</h4>
                    <FormTextBox disabled={this.state.isSubmitting} className='col-md-8' ref={e => this.modifier = e} label='Người cập nhật' readOnly />
                    <FormTextBox disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.timeModified = e} label='Ngày cập nhật' readOnly />
                </>}
            </div>,
            buttons: this.state.trangThai == 'CHO_KY' ? <>
                <button className='btn btn-success' onClick={e => e.preventDefault() || this.onAccept()}>
                    <i className='fa fa-fw fa-lg fa-plus' /> Xác nhận
                </button>
                <button className='btn btn-danger' onClick={e => e.preventDefault() || this.onReject()} >Từ chối</button>
            </> : <></>
        });
    }
}