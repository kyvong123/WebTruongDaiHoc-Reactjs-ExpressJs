import React from 'react';
import { searchDmNguoiNhanAdapter } from './reduxDmLoaiNguoiNhan';
import { AdminModal, FormTextBox, FormColorPicker, getValue, FormSelect } from 'view/component/AdminPage';

export class TypeEmail extends AdminModal {
    state = { receiverType: 'other' }

    componentDidMount() {
        this.receiverType.value(this.state.receiverType);
        this.onShown(() => this.subject.focus());
    }

    onShow = () => {
        this.setState({ receiverType: 'other' });
        this.receiverType.value(this.state.receiverType);
        this.dmNguoiNhan.value(null);
        this.email.value('');
        this.subject.value('');
    }

    onTypeChange = value => {
        this.setState({ receiverType: value.id });
    }

    onSubmit = () => {
        const data = {
            receiverType: getValue(this.receiverType),
            subject: getValue(this.subject)
        };

        if (data.receiverType == 'group') {
            data.dmNguoiNhan = getValue(this.dmNguoiNhan);
        }

        if (data.receiverType == 'other') {
            data.email = getValue(this.email);
            if (!T.validateEmail(data.email)) {
                T.notify('Email không hợp lệ', 'danger');
                return this.email.focus();
            }
        }

        if (data.receiverType == 'student' || data.receiverType == 'staff') {
            T.confirm(`Gửi mail cho ${data.receiverType == 'student' ? 'toàn bộ sinh viên' : 'toàn bộ nhân viên'}?`, 'Bạn có chắc chắn thực hiện thao tác này không?', true, isConfirm => {
                if (isConfirm) {
                    this.props.send(data);
                    this.hide();
                }
            });
        } else {
            this.props.send(data);
            this.hide();
        }
    }

    render = () => {
        const receiverType = this.state.receiverType;

        return this.renderModal({
            title: 'Gửi email',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.receiverType = e} className='col-md-6' label='Loại người nhận' onChange={this.onTypeChange} minimumResultsForSearch={-1}
                    data={[{ id: 'staff', text: 'Nhân viên' }, { id: 'student', text: 'Sinh viên' }, { id: 'group', text: 'Nhóm người nhận' }, { id: 'other', text: 'Người nhận cụ thể' }]}
                />
                <FormSelect ref={e => this.dmNguoiNhan = e} className={'col-md-6 ' + (receiverType != 'group' ? 'd-none' : '')} label='Nhóm người nhận'
                    data={searchDmNguoiNhanAdapter} required minimumResultsForSearch={-1}
                />
                <div className='w-100' />
                <FormTextBox ref={e => this.subject = e} className='col-md-12' label='Nhập chủ để email' />
                <FormTextBox ref={e => this.email = e} className={'col-md-6 ' + (receiverType != 'other' ? 'd-none' : '')} label='Nhập email cần gửi' required />
            </div>
        });
    }
}

export class EditTitle extends AdminModal {
    componentDidMount() {
        this.onShown(() => this.title.focus());
    }

    onShow = () => {
        this.title.value(this.props.item.title || '');
    }

    onSubmit = () => {
        const title = getValue(this.title);
        this.props.updateENews(this.props.item.id, { title }, () => {
            this.hide();
        });
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa thông tin eNews',
        body: <FormTextBox ref={e => this.title = e} label='Tiêu đề' readOnly={this.props.readOnly} required />
    })
}

export class EditUI extends AdminModal {
    onShow = () => {
        this.background.value(this.props.item.backgroundColor || '');
    }

    onSubmit = () => {
        const backgroundColor = getValue(this.background);
        this.props.updateENews(this.props.item.id, { backgroundColor }, () => {
            this.hide();
        });
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa giao diện',
        body: <FormColorPicker ref={e => this.background = e} label='Màu nền email' readOnly={this.props.readOnly} />
    })
}