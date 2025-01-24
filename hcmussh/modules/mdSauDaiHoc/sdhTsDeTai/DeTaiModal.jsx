import React from 'react';
import { AdminModal, FormTextBox, getValue, FormRichTextBox } from 'view/component/AdminPage';

export class DeTaiModal extends AdminModal {
    state = { isXetDuyet: '', idDeTai: '', item: '' }
    componentDidMount() {
        this.disabledClickOutside();
    }
    onShow = (item) => {
        let { idDeTai } = item || { idDeTai: '' };
        if (!this.props.temp) {
            this.setState({ idDeTai, item }, () => {
                if (idDeTai) {
                    for (const prop in item) {
                        if (prop == 'listCbhd') this.shccs.value(item.listCbhd.map(item => item.shcc));
                        else {
                            this[prop]?.value(item[prop] || '');
                        }
                    }
                } else {
                    this.tenDeTai?.value('');
                    this.ghiChu?.value('');
                    this.shccs?.value([]);
                }
            });
        } else {
            this.setState({ idDeTai, item }, () => {
                if (idDeTai) {
                    for (const prop in item) {

                        this[prop]?.value(item[prop] || '');

                    }
                } else {
                    this.tenDeTai?.value('');
                    this.ghiChu?.value('');
                    this.shccs?.value([]);
                }
            });
        }

    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            tenDeTai: getValue(this.tenDeTai),
            ghiChu: getValue(this.ghiChu),
            shccs: getValue(this.shccs),
            isXetDuyet: this.state.item.isXetDuyet,
        };
        if (!this.props.temp) {
            changes.idThiSinh = this.state.item.idThiSinh;
            this.state.idDeTai ? this.props.update(this.state.idDeTai, changes, () => {
                this.props.permission && this.props.getData();
                this.hide();
            }) : this.props.create(changes, () => {
                this.props.permission && this.props.getData();
                this.hide();
            });
        } else {
            changes.idDeTai = this.state.idDeTai;
            changes.listCbhd = this.shccs.data()?.map(item => ({ tenCbhd: item.text }));
            this.props.setData(this.state.idDeTai ? 'update' : 'create', changes, () => this.hide());//set temp not database
        }
    }
    selectVaiTro = [{ id: 'Cán bộ hướng dẫn chính', text: 'Cán bộ hướng dẫn chính' }, { id: 'Cán bộ hướng dẫn phụ', text: 'Cán bộ hướng dẫn phụ' }, { id: 'Cán bộ hướng dẫn độc lập', text: 'Cán bộ hướng dẫn độc lập' }]; //phân biệt 1 2 và đồng hướng dẫn;

    render = () => {
        const readOnly = this.props.readOnly;

        return this.renderModal({
            title: this.state.idDeTai ? 'Cập nhật đề tài' : 'Thêm đề tài',
            size: 'large',

            body: <div className='row'>
                {/* <strong className='text-danger' style={{ paddingLeft: 15 }}>Trường hợp không tìm thấy cán bộ hướng dẫn (CBHD), vui lòng điền ở ghi chú họ tên CBHD</strong><br /> */}
                <FormTextBox ref={e => this.tenDeTai = e} maxLength={244} label='Tên đề tài' className='col-md-12' readOnly={readOnly} />

                {/* <FormSelect ref={e => this.shccs = e} label='Cán bộ hướng dẫn' data={SelectAdapter_CanBoHuongDan} className='col-md-6' readOnly={readOnly} />
                <FormSelect ref={e => this.shccs = e} label='Vai trò' data={SelectAdapter_CanBoHuongDan} className='col-md-6' readOnly={readOnly} />

                <FormSelect ref={e => this.shccs = e} label='Cán bộ hướng dẫn' data={SelectAdapter_CanBoHuongDan} className='col-md-6' readOnly={readOnly} />
                <FormSelect ref={e => this.shccs = e} label='Vai trò' data={SelectAdapter_CanBoHuongDan} className='col-md-6' readOnly={readOnly} /> */}
                <FormRichTextBox ref={e => this.ghiChu = e} maxLength={1999} label='Ghi chú' className='col-md-12' readOnly={readOnly} />
            </div>
        });
    }
}