import React from 'react';

import { AdminModal, FormTextBox } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

export default class DanhSachGiaHanModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = () => {

    }

    onSubmit = (e) => {
        e.preventDefault();
        T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
        this.fileBox.onUploadFile({});
    }

    onSuccess = (result) => {
        this.fileBox.setData(null, true);
        this.props.getPage();
        this.countSuccess.value('');
        this.countFail.value('');
        if (result.error) {
            T.alert('Tải lên danh sách gia hạn bị lỗi', 'danger', false, 800);
            console.error(result.error);
        } else {
            this.countSuccess.value(result?.countSuccess || '0');
            this.countFail.value(result?.countFail || '0');
            T.alert('Tải lên danh sách gia hạn thành công', 'success', false, 800);
            T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), result.filename);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tải lên danh sách SV gia hạn học phí',
            size: 'large',
            isLoading: this.state.isSubmitting,
            submitText: 'Tải xuống',
            body: <div className='row'>
                <div className='col-md-12'>
                    Tải file excel mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/khtc/hoan-dong-hoc-phi/upload-template')}>đây</a>
                </div>
                <FileBox pending={true} ref={e => this.fileBox = e} className='col-md-12' postUrl='/user/upload' uploadType='TcUploadListGiaHan' userData='TcUploadListGiaHan' success={this.onSuccess} />
                <FormTextBox type='text' readOnly className='col-md-12' label='Số đơn gia hạn thành công' ref={e => this.countSuccess = e} />
                <FormTextBox type='text' readOnly className='col-md-12' label='Số đơn gia hạn thất bại' ref={e => this.countFail = e} />
            </div>
        });
    }
}