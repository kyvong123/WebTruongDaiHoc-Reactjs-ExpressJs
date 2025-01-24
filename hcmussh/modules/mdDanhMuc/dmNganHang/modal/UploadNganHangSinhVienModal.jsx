import React from 'react';
import { AdminModal } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

export default class UploadNganHangSinhVienModal extends AdminModal {

    onSuccess = (data) => {
        if (!data.error)
            this.props.createMultipleThongTinNganHangSinhVien(data, item => {
                if (item) this.hide();
            });
    }
    render = () => {
        return this.renderModal({
            title: 'Tải lên danh sách danh sách thông tin ngân hàng',
            size: 'large',
            isLoading: this.state.isLoading,
            submitText: 'Tải lên',
            body: <div className='row'>
                <div className='col-md-12'>
                    Thêm danh sách thông tin ngân hàng bằng file excel. Tải file mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/danh-muc/ngan-hang-sinh-vien/download-template')}>đây</a>
                </div>
                <div className='col-md-12'>
                    <FileBox pending={false} ref={e => this.fileBox = e} postUrl='/user/upload' uploadType='DmNganHangData' userData='DmNganHangData' success={this.onSuccess} />
                </div>
            </div>

        });
    }
}


