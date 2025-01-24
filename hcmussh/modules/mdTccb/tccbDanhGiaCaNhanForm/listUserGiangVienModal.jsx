import React from 'react';
import { SelectAdapter_TccbDiemThuong } from '../tccbDanhGiaDiemThuong/redux';
import { AdminModal, FormTextBox, getValue, FormRichTextBox, FormSelect, FormDatePicker, FormFileBox } from 'view/component/AdminPage';

export class EditNoiDungModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.moTa.focus()));
    }

    onShow = ({ item }) => {
        let { noiDung, moTa, thoiHan, chatLuong, diemLonNhat, diemTuDanhGia } = item ? item : { noiDung: '', moTa: '', thoiHan: 0, chatLuong: '', diemTuDanhGia: 0, diemLonNhat: 0 };
        this.noiDung.value(noiDung || '');
        this.moTa.value(moTa || '');
        this.thoiHan.value(thoiHan ? Number(thoiHan) : '');
        this.chatLuong?.value(chatLuong || '');
        this.diemLonNhat.value(Number(diemLonNhat || 0).toFixed(2));
        this.diemTuDanhGia?.value(Number(diemTuDanhGia || 0).toFixed(2));
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const { isDangKy, isTuDanhGia } = this.props;
        const { item } = this.state;
        const changes = {};
        if (isDangKy) {
            changes.noiDung = getValue(this.noiDung);
            changes.moTa = getValue(this.moTa);
            changes.thoiHan = getValue(this.thoiHan) ? getValue(this.thoiHan).getTime() : null;
            changes.diemLonNhat = Number(getValue(this.diemLonNhat)).toFixed(2);
        }
        if (isTuDanhGia) {
            changes.diemTuDanhGia = Number(getValue(this.diemTuDanhGia)).toFixed(2);
            changes.chatLuong = getValue(this.chatLuong);
        }

        this.props.create({ ...item, ...changes, nam: this.props.nam, loaiCongViec: 1 }, this.hide);
    };

    render = () => {
        const { isDangKy, isTuDanhGia } = this.props;
        return this.renderModal({
            title: 'Cập nhật công việc',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.noiDung = e} label='Nội dung' required readOnly={!isDangKy} />
                <FormRichTextBox className='col-12' ref={e => this.moTa = e} label='Mô tả công việc' rows={5} required readOnly={!isDangKy} />
                <FormDatePicker type='time-mask' ref={e => this.thoiHan = e} className='col-12' label='Thời hạn hoàn thành' readOnly={!isDangKy} />
                <FormTextBox type='number' min={0} step={true} className='col-12' ref={e => this.diemLonNhat = e} label='Điểm tối đa' required readOnly={!isDangKy} />
                {isTuDanhGia && <FormTextBox className='col-12' ref={e => this.chatLuong = e} label='Chất lượng công việc' required />}
                {isTuDanhGia && <FormTextBox type='number' min={0} step={true} className='col-12' ref={e => this.diemTuDanhGia = e} label='Điểm tự đánh giá' placeholder='Điểm tự đánh giá' required />}
            </div>
        });
    }
}

export class EditDanhGiaModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.diemTuDanhGia.focus()));
    }

    onShow = (item) => {
        let { diemTuDanhGia } = item ? item : { diemTuDanhGia: 0 };
        this.diemTuDanhGia.value(Number(diemTuDanhGia || 0).toFixed(2));
        this.setState({ item });
    };

    onSubmit = (e) => {
        try {
            const { item } = this.state;
            const nam = this.props.nam;
            e.preventDefault();
            const changes = {
                diemTuDanhGia: Number(getValue(this.diemTuDanhGia)).toFixed(2),
            };
            this.props.create({ ...item, ...changes, nam }, this.hide);
        } catch (error) {
            T.notify('Có lỗi xảy ra!', 'danger');
            console.error(error);
        }

    };

    render = () => {
        return this.renderModal({
            title: 'Tự đánh giá',
            body: <div className='row'>
                <FormTextBox type='number' min={0} step={true} className='col-12' ref={e => this.diemTuDanhGia = e} label='Điểm tự đánh giá' placeholder='Điểm tự đánh giá' required />
            </div>
        });
    }
}

export class EditDiemThuongModal extends AdminModal {
    state = { item: {} }
    onShow = (item) => {
        let { maDiemThuong } = item ? item : { maDiemThuong: '' };
        this.maDiemThuong.value(maDiemThuong);
        this.fileBox.setData('TccbCaNhanMinhChung:' + (item && item.id ? item.id : 'new'));
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const { item } = this.state;
        const changes = {
            nam: this.props.nam,
            maDiemThuong: getValue(this.maDiemThuong)
        };
        if (this.fileBox.fileBox.getFile()) {
            this.fileBox.fileBox.onUploadFile(changes);
        } else {
            if (item.id) {
                this.props.update(item.id, changes, () => this.hide());
            } else {
                this.props.create(changes, () => this.hide());
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
            title: this.state.item && this.state.item.id ? 'Cập nhật điểm thưởng' : 'Tạo mới điểm thưởng',
            body: <div className='row'>
                <FormSelect className='col-12' ref={e => this.maDiemThuong = e} data={SelectAdapter_TccbDiemThuong(this.props.nam)} label='Điểm thưởng' required />
                <FormFileBox ref={e => this.fileBox = e} className='col-12' label='Minh chứng' uploadType='TccbCaNhanMinhChung' userData='TccbCaNhanMinhChung' pending onDownload={this.state.item && this.state.item.minhChung ? (e) => this.onDownload(e) : null} onSuccess={this.onSuccess} />
            </div>
        });
    }
}