import React from 'react';

import { AdminModal, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
// import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

export default class EditModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item) => {
        const { id, hoVaTen, shcc, lyDo, maSoThue } = item;
        this.setState({ id }, () => {
            this.hoVaTen.value(hoVaTen);
            this.mscb.value(shcc);
            this.maSoThue.value(maSoThue);
            this.lyDo.value(lyDo);
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        let item = {
            maSoThue: this.maSoThue.value(),
            lyDo: this.lyDo.value(),
        };
        this.props.update({ id: this.state.id }, item, error => {
            if (!error) this.hide();
        });
    }


    render = () => {
        // const permission = this.props.permission;

        return this.renderModal({
            title: 'Thông tin yêu cầu cấp MST',
            isLoading: this.state.isSubmitting,
            size: 'large',
            body: <div className='row'>
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-8' ref={e => this.hoVaTen = e} label='Họ và tên' readOnly />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.mscb = e} label='Mã cán bộ' readOnly />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.maSoThue = e} label='Mã số thuế' required />
                <FormRichTextBox disabled={this.state.isSubmitting} type='text' className='col-md-12' ref={e => this.lyDo = e} label='Lý do' required />

                {/* <div className='col-md-12'>
                    <div className='tile'>{tableLoaiPhi}</div>
                </div> */}

            </div>
        }
        );
    }
}