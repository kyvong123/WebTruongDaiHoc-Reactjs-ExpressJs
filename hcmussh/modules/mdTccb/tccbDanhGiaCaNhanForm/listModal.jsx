import React from 'react';
import { SelectAdapter_TccbDiemThuong } from '../tccbDanhGiaDiemThuong/redux';
import { AdminModal, FormTextBox, getValue, FormRichTextBox, FormSelect, FormDatePicker, FormFileBox } from 'view/component/AdminPage';

export class EditNoiDungModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.noiDung.focus()));
    }

    onShow = ({ item, idFormChuyenVien }) => {
        let { noiDung, moTa, thoiHan, diemLonNhat } = item ? item : { noiDung: '', moTa: '', diemLonNhat: 0 };
        this.noiDung.value(noiDung || '');
        this.moTa.value(moTa || '');
        this.thoiHan.value(thoiHan ? Number(thoiHan) : '');
        this.diemLonNhat.value(Number(diemLonNhat || 0).toFixed(2));
        this.setState({ item, idFormChuyenVien });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let { item, idFormChuyenVien } = this.state;
        const changes = {
            noiDung: getValue(this.noiDung),
            moTa: getValue(this.moTa),
            thoiHan: getValue(this.thoiHan) ? getValue(this.thoiHan).getTime() : null,
            diemLonNhat: Number(getValue(this.diemLonNhat)).toFixed(2),
            loaiCongViec: 1
        };
        if (!item || !item.id) {
            this.props.create({ ...changes, nam: this.props.nam, shcc: this.props.shcc, idFormChuyenVien }, this.hide);
        } else {
            this.props.update(item.id, changes, this.hide);
        }
    };


    render = () => {
        return this.renderModal({
            title: this.state.item && this.state.item.id ? 'Cập nhật nội dung' : 'Tạo mới nội dung',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.noiDung = e} label='Nội dung' placeholder='Nội dung' required />
                <FormRichTextBox className='col-12' ref={e => this.moTa = e} label='Mô tả công việc' rows={5} />
                <FormDatePicker type='time-mask' ref={e => this.thoiHan = e} className='col-12' label='Thời hạn hoàn thành' />
                <FormTextBox type='number' min={0} step={true} className='col-12' ref={e => this.diemLonNhat = e} label='Điểm tối đa' placeholder='Điểm tối đa' required />
            </div>
        });
    }
}

export class EditDiemThuongModal extends AdminModal {
    state = { item: {} }
    onShow = (item) => {
        let { maDiemThuong } = item ? item : { maDiemThuong: '' };
        this.maDiemThuong.value(maDiemThuong);
        this.fileBox.setData('TccbCaNhanMinhChungByDonVi:' + (item && item.id ? item.id : 'new'));
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let { item } = this.state;
        const { shcc } = this.props;
        const changes = {
            nam: this.props.nam,
            maDiemThuong: getValue(this.maDiemThuong),
            shcc
        };
        if (this.fileBox.fileBox.getFile()) {
            this.fileBox.fileBox.onUploadFile(changes);
        } else {
            if (!item) {
                this.props.create(changes, this.hide);
            } else {
                this.props.update(item.id, changes, this.hide);
            }
        }
    };

    onSuccess = () => {
        this.props.load(() => this.hide());
    }

    onDownload = (e) => {
        e.preventDefault();
        const item = this.state.item;
        const extname = item.minhChung.substring(item.minhChung.lastIndexOf('.'));
        const tenFile = `${item.shcc} minh chứng ${item.tenKhenThuong}${extname}`;
        T.download(T.url('/api/tccb/danh-gia-ca-nhan-diem-thuong-minh-chung/' + this.state.item.id), tenFile);
    }

    render = () => {
        return this.renderModal({
            title: this.state.item ? 'Cập nhật điểm thưởng' : 'Tạo mới điểm thưởng',
            body: <div className='row'>
                <FormSelect className='col-12' ref={e => this.maDiemThuong = e} data={SelectAdapter_TccbDiemThuong(this.props.nam)} label='Điểm thưởng' required />
                <FormFileBox ref={e => this.fileBox = e} className='col-12' label='Minh chứng' uploadType='TccbCaNhanMinhChungByDonVi' userData='TccbCaNhanMinhChungByDonVi' pending onDownload={this.state.item && this.state.item.minhChung ? (e) => this.onDownload(e) : null} onSuccess={this.onSuccess} />
            </div>
        });
    }
}