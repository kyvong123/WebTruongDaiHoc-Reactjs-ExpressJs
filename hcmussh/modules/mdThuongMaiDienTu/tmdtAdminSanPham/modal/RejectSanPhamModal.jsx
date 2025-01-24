import React from 'react';
import { AdminModal, FormTextBox, FormRichTextBox, FormSelect, getValue, FormEditor } from 'view/component/AdminPage';
import { SelectAdapter_LoaiSanPham } from 'modules/mdThuongMaiDienTu/tmdtDmLoaiSanPham/redux.jsx';
import { SelectAdapter_TmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtAdminDaiLy/redux.jsx';
import { SelectAdapter_DmTmdtTag } from 'modules/mdThuongMaiDienTu/tmdtDmTag/redux.jsx';

export default class RejectModal extends AdminModal {
    state = {};

    onShow = (item) => {
        const { id, ten, moTa, maLoaiSanPham, maDaiLy, maCode, tagList, shippingInfo, paymentInfo } = item ? item : { ten: '', moTa: '', id: null, maLoaiSanPham: null, maDaiLy: null, maCode: null, tagList: '' };
        this.setState({ id, ten }, () => {
            this.ten.value(ten || '');
            this.maCode.value(maCode || '');
            this.moTa.value(moTa || '');
            this.shippingInfo.value(shippingInfo || '');
            this.paymentInfo.value(paymentInfo || '');
            this.maDaiLy.value(maDaiLy || null);
            this.maLoaiSanPham.value(maLoaiSanPham || null);
            this.tagList.value(tagList ? tagList.split(',') : []);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const id = this.state.id;
            const rejectComment = getValue(this.rejectComment);
            if (rejectComment == '') {
                this.ten.focus();
                T.notify('Không được để lý do reject trống!', 'danger');
            } else {
                this.props.reject(id, rejectComment);
                this.hide();
            }
        } catch (error) {
            console.error('error', error);
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    render = () => {
        return this.renderModal({
            title: 'Reject upload thông tin sản phẩm',
            size: 'elarge',
            body: <div className='row'>
                <FormRichTextBox readOnly={false} className='col-12' ref={e => this.rejectComment = e} label='Lý do reject sản phẩm' required placeholder='Lý do reject sản phẩm' />
                <FormSelect readOnly={true} className='col-12' ref={e => this.maDaiLy = e} label='Đại lý bán sản phẩm' data={SelectAdapter_TmdtDaiLy} />
                <FormTextBox readOnly={true} className='col-12' ref={e => this.maCode = e} label='Mã code sản phẩm' required placeholder='Nhập mã code sản phẩm' />
                <FormTextBox readOnly={true} className='col-12' ref={e => this.ten = e} label='Tên sản phẩm' required placeholder='Nhập tên sản phẩm' />
                <FormTextBox type='number' readOnly={true} className='col-12' ref={e => this.gia = e} label='Giá sản phẩm (VNĐ)' required placeholder='Nhập giá sản phẩm' />
                <div className='col-12' >Mô tả sản phẩm: <FormEditor readOnly={true} ref={e => this.moTa = e} height='400px' placeholder='Bài viết mô tả sản phẩm' uploadUrl='' /></div>
                <FormSelect readOnly={true} className='col-12' ref={e => this.maLoaiSanPham = e} label='Loại sản phẩm' data={SelectAdapter_LoaiSanPham} />
                <FormRichTextBox readOnly={true} className='col-12' ref={e => this.shippingInfo = e} label='Thông tin giao hàng' required placeholder='Nhập thông tin giao hàng' />
                <FormRichTextBox readOnly={true} className='col-12' ref={e => this.paymentInfo = e} label='Thông tin thanh toán' required placeholder='Nhập thông tin thanh toán' />
                <FormSelect readOnly={true} multiple={true} className='col-12' ref={e => this.tagList = e} label='Gắn tag' data={SelectAdapter_DmTmdtTag} />
            </div>
        });
    };
}
