
import React from 'react';
import { AdminModal, FormSelect } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';


const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const nam = i + new Date().getFullYear() - 10;
        return { id: nam, text: `${nam}` };
    });
};
export default class ImportQuyetToanThue extends AdminModal {

    onShow = ({ nam }) => {
        this.setState({ isLoading: false });
        this.year?.value(nam);
    }
    componentDidMount() {
        this.fileBox.setData('TcQuyetToanThue');
        this.setState({ isLoading: false });
    }
    onSubmit = () => {
        this.setState({ isLoading: true });
        const data = {
            nam: this.year.value(),
        };
        this.fileBox.onUploadFile(data);
    }
    onSuccess = () => {
        T.notify('Upload thành công', 'success');
        this.props.reset();
        this.hide();
    }
    render = () => {
        return this.renderModal({

            title: 'Tải lên danh sách quyết toán thuế',
            size: 'large',
            isLoading: this.state.isLoading,
            submitText: 'Tải lên',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.year = e} placeholder='Năm' data={yearDatas()} disabled={this.state.isLoading} />
                <div className='col-md-12'>Tải file theo <a href='/api/khtc/quyet-toan-thue/template'>mẫu sau</a></div>
                <div className='col-md-12'>
                    <FileBox pending={true} ref={e => this.fileBox = e} postUrl='/user/upload' uploadType='TcQuyetToanThue' userData='TcQuyetToanThue' success={this.onSuccess} />

                </div>
            </div>
        });
    }
}


