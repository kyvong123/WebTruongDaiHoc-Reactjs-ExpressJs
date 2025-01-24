import React from 'react';
import { AdminModal, FormTextBox, FormDatePicker } from 'view/component/AdminPage';

export class BaiBaoTSModal extends AdminModal {
    state = { isXetDuyet: '', idDeTai: '', item: '' }
    componentDidMount() {
        this.disabledClickOutside();
    }
    onShow = (item) => {
        let { idBaiBao } = item || { idBaiBao: '' };
        this.setState({ idBaiBao, item }, () => {
            if (idBaiBao) {
                for (const prop in item) {
                    this[prop]?.value(item[prop] || '');
                }
            } else {
                this.tenBaiBao?.value('');
                this.tenTapChi?.value('');
                this.ngayDang?.value('');
                this.chiSo?.value('');
                this.diem.value('');
                this.ghiChu?.value('');
            }
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                idBaiBao: this.state.idBaiBao || '',
                tenBaiBao: this.tenBaiBao.value() || '',
                tenTapChi: this.tenTapChi.value() || '',
                chiSo: this.chiSo.value() || '',
                ngayDang: this.ngayDang.value() ? this.ngayDang.value().getTime() : '',
                diem: this.diem.value() || ''
            };
            if (!this.props.temp) {
                if (Object.values(changes).filter(i => i).length) {
                    changes.id = this.state.item.id;
                    this.state.idBaiBao ? this.props.update(this.state.idBaiBao, changes, () => {
                        this.props.getData();
                        this.hide();
                    }) : this.props.create(changes, () => {
                        this.props.getData();
                        this.hide();
                    });
                } else {
                    T.notify('Xin vui lòng điền thông tin bài báo!');
                }
            } else {
                changes.id = this.state.item.id;
                this.props.setData(this.state.idBaiBao ? 'update' : 'create', changes, () => this.hide());
            }
        } catch (error) {
            T.notify('Lỗi lấy dữ liệu', 'danger');
            return false;
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.idBaiBao ? 'Cập nhật bài báo' : 'Thêm bài báo',
            size: 'large',
            isShowSubmit: !readOnly,
            body: <div className='row'>
                <FormTextBox ref={e => this.tenBaiBao = e} label='Tên bài báo' className='col-md-12' readOnly={readOnly} />
                <FormTextBox ref={e => this.tenTapChi = e} label='Tên tạp chí' className='col-md-12' readOnly={readOnly} />
                <FormTextBox ref={e => this.chiSo = e} label='Chỉ số tạp chí' className='col-md-4' readOnly={readOnly} />
                <FormDatePicker ref={e => this.ngayDang = e} label='Thời gian đăng' type='month-mask' className='col-md-4' readOnly={readOnly} />
                <FormTextBox type='number' decimalScale={true} autoFormat={false} step={true} ref={e => this.diem = e} label='Điểm bài báo' className='col-md-4' readOnly={readOnly} />
            </div>
        });
    }
}