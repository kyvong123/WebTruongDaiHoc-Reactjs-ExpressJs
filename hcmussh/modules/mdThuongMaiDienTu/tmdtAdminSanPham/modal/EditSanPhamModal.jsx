import React from 'react';
import { AdminModal, FormTextBox, FormSelect, getValue, FormImageMultiBox, FormEditor } from 'view/component/AdminPage';
import { SelectAdapter_LoaiSanPham } from 'modules/mdThuongMaiDienTu/tmdtDmLoaiSanPham/redux.jsx';
import { SelectAdapter_TmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtAdminDaiLy/redux.jsx';
import { SelectAdapter_DmTmdtTag } from 'modules/mdThuongMaiDienTu/tmdtDmTag/redux.jsx';

export default class EditSanPhamModal extends AdminModal {
    state = {};

    onShow = (item) => {
        this.props.clearImage();
        const { id, ten, moTa, maLoaiSanPham, maDaiLy, maCode, tagList, gia } = item ? item : { ten: '', moTa: '', id: null, maLoaiSanPham: null, maDaiLy: null, maCode: null, tagList: '', gia: '' };
        this.setState({ id, ten }, () => {
            this.ten.value(ten || '');
            this.gia.value(gia || '');
            this.maCode.value(maCode || '');
            this.moTa.value(moTa || '');
            this.maDaiLy.value(maDaiLy || null);
            this.maLoaiSanPham.value(maLoaiSanPham || null);
            this.tagList.value(tagList ? tagList.split(',') : []);
            this.imageMultiBox.clear();
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                ten: getValue(this.ten),
                gia: getValue(this.gia),
                moTa: this.moTa.value(),
                maDaiLy: getValue(this.maDaiLy),
                maLoaiSanPham: getValue(this.maLoaiSanPham),
                maCode: getValue(this.maCode),
                tagList: getValue(this.tagList).toString()
            };
            if (changes.ten == '') {
                this.ten.focus();
                T.notify('Không được để trống tên', 'danger');
            } else {
                if (this.state.id) {
                    this.props.update(this.state.id, changes);
                } else {
                    this.props.create(changes);
                }
                this.hide();
            }
        } catch (error) {
            console.error('error', error);
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Chỉnh sửa thông tin sản phẩm' : 'Tạo sản phẩm mới',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-12' ref={e => this.maDaiLy = e} label='Đại lý bán sản phẩm' data={SelectAdapter_TmdtDaiLy} />
                <FormTextBox readOnly={this.state.id ? true : false} className='col-12' ref={e => this.maCode = e} label='Mã code sản phẩm' required placeholder='Nhập mã code sản phẩm' />
                <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên sản phẩm' required placeholder='Nhập tên sản phẩm' />
                <FormTextBox type='number' className='col-12' ref={e => this.gia = e} label='Giá sản phẩm (VNĐ)' required placeholder='Nhập giá sản phẩm' />
                <div className='col-12' ><FormEditor label='Bài viết mô tả sản phẩm (Vui lòng không upload hình)' ref={e => this.moTa = e} height='400px' placeholder='Bài viết mô tả sản phẩm' uploadUrl='' /></div>
                <FormSelect className='col-12' ref={e => this.maLoaiSanPham = e} label='Loại sản phẩm' data={SelectAdapter_LoaiSanPham} />
                <FormSelect multiple={true} className='col-12' ref={e => this.tagList = e} label='Gắn tag' data={SelectAdapter_DmTmdtTag} />
                <FormImageMultiBox className='col-12' ref={e => this.imageMultiBox = e} label='Tải hình đính kèm tại đây' postUrl={this.state.id ? '/user/upload?category=tmdtSpUploadFile&spId=' + this.state.id : '/user/upload?category=tmdtSpUploadFile'} uploadType='tmdtSpUploadFile' userData='tmdtSpUploadFile' />
            </div>
        });
    };
}