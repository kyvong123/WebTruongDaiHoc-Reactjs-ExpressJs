import React from 'react';
import { AdminModal, FormTextBox, getValue, FormDatePicker } from 'view/component/AdminPage';

export class BaiBaoModal extends AdminModal {
    state = { isXetDuyet: '', idDeTai: '', item: '' }
    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = (item) => {
        let { id, idCbhd } = item || { id: '' };
        this.setState({ id, idCbhd, item }, () => {
            if (id) {
                this.ten?.value(item.ten);
                this.tenTapChi?.value(item.tenTapChi);
                this.ngayDang?.value(item.ngayDang);
                this.chiSo?.value(item.chiSo);
                this.diem.value(item.diem);
            } else {
                this.ten?.value('');
                this.tenTapChi?.value('');
                this.ngayDang?.value('');
                this.chiSo?.value('');
                this.diem.value('');
            }
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                idCbhd: this.state.item.idCbhd,
                ten: getValue(this.ten),
                tenTapChi: getValue(this.tenTapChi),
                chiSo: getValue(this.chiSo),
                ngayDang: getValue(this.ngayDang)?.getTime(),
                diem: getValue(this.diem),
            };
            if (!this.props.temp) {
                this.state.id ? this.props.update(this.state.id, changes, () => {
                    this.props.getData();
                    this.hide();
                }) : this.props.create(changes, () => {
                    this.props.getData();
                    this.hide();
                });
                this.setState({ id: '', item: {} });
            } else {
                this.props.setData(changes.idCbhd ? 'update' : 'create', changes);
                this.hide();
            }
        } catch (error) {
            T.notify('Lỗi lấy dữ liệu, dữ liệu yêu cầu còn trống', 'danger');
            return false;
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật bài báo' : 'Thêm bài báo',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.ten = e} label='Tên bài báo' className='col-md-12' readOnly={readOnly} required />
                <FormTextBox ref={e => this.tenTapChi = e} label='Tên tạp chí' className='col-md-12' readOnly={readOnly} required />
                <FormTextBox ref={e => this.chiSo = e} label='Chỉ số tạp chí' className='col-md-4' readOnly={readOnly} required />
                <FormDatePicker ref={e => this.ngayDang = e} label='Thời gian đăng' type='month-mask' className='col-md-4' readOnly={readOnly} required />
                <FormTextBox ref={e => this.diem = e} type='number' step={true} decimalScale={2} label='Điểm bài báo' className='col-md-4' readOnly={readOnly} />
            </div>
        });
    }
}