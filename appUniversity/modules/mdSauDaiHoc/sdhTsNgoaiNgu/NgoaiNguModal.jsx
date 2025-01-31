import React from 'react';
import { SelectAdapter_SdhLoaiChungChiNgoaiNguV3 } from 'modules/mdSauDaiHoc/sdhLoaiChungChiNgoaiNgu/redux';
import { AdminModal, FormTextBox, FormDatePicker, FormSelect, getValue, FormRichTextBox } from 'view/component/AdminPage';
export class NgoaiNguModal extends AdminModal {
    state = { isXetDuyet: '', id: '', ccnn: false, vbnn: false }
    componentDidMount() {
        this.disabledClickOutside();
    }
    onShow = (item) => {
        let id = item?.idCcnn || '';
        this.setState({ id, item }, () => {
            if (id) {
                for (const prop in item) {
                    if (prop == 'loaiChungChi') this.loaiChungChi.value(item.ma);
                    else if (prop == 'diemChungChi') this.diemChungChi.value(item[prop] || '');
                    else {
                        this[prop]?.value(item[prop] || '');
                    }
                }
            } else {
                this.loaiChungChi?.value('');
                this.maChungChi?.value('');
                this.ngayCap?.value('') ? this.ngayCap.value('').getTime() : '';
                this.donViCap?.value('');
                this.diemNghe?.value('');
                this.diemDoc?.value('');
                this.diemNoi?.value('');
                this.diemViet?.value('');
                this.diemCauTruc?.value('');
                this.diemChungChi?.value('');
                this.ghiChu?.value('');
            }
        });
    }
    onChangeLoai = (value) => {
        this.setState({ item: { ...this.state.item, ma: value?.id, ngonNgu: value?.ngonNgu, loaiChungChi: value?.loaiChungChi } });
    }
    onSubmit = (e) => {
        e.preventDefault();
        let item = this.state.item;
        let { ma, ngonNgu, loaiChungChi } = item;
        const changes = {
            ma, loaiChungChi, ngonNgu,
            ngoaiNgu: ngonNgu,
            diemNghe: getValue(this.diemNghe),
            diemNoi: getValue(this.diemNoi),
            diemDoc: getValue(this.diemDoc),
            diemViet: getValue(this.diemViet),
            diemCauTruc: getValue(this.diemCauTruc),
            diemChungChi: getValue(this.diemChungChi),
            ngayCap: this.ngayCap.value() ? this.ngayCap.value().getTime() : '',
            donViCap: getValue(this.donViCap),
            maChungChi: getValue(this.maChungChi),
            ghiChu: getValue(this.ghiChu),
            isXetDuyet: this.state.item.isXetDuyet,
        };

        if (!this.props.temp) {
            changes.id = this.state.item.id; //idThiSinh
            this.state.id ? this.props.update(this.state.id, changes, () => {
                this.props.getData();
                this.hide();
            }) : this.props.create(changes, () => {
                this.props.getData();
                this.hide();
            });
        } else {
            if (!ma) {
                T.notify('Lấy dữ liệu chứng chỉ/văn bằng ngoại ngữ bị lỗi');
            } else {
                this.props.setData(this.state.id ? 'update' : 'create', changes, this.hide);
            }
        }

    }


    mapperStyle = {
        0: 'btn-secondary',
        1: 'btn-success',
        2: 'btn-danger',
    }

    selectXetDuyet = [{ id: 0, text: 'Chờ duyệt' }, { id: 1, text: 'Duyệt' }, { id: 2, text: 'Không duyệt' }]


    onXetDuyet = value => this.isXetDuyet.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật chứng chỉ/văn bằng ngoại ngữ' : 'Thêm mới chứng chỉ/văn bằng ngoại ngữ',
            size: 'large',

            body: <div className='row'>
                <FormSelect ref={e => this.loaiChungChi = e} label='Loại chứng chỉ/văn bằng' className='col-md-12' readOnly={readOnly} data={SelectAdapter_SdhLoaiChungChiNgoaiNguV3} onChange={value => this.onChangeLoai(value)} />
                <FormTextBox ref={e => this.maChungChi = e} maxLength={19} label='Mã chứng chỉ' className='col-md-4' readOnly={readOnly} />
                <FormDatePicker ref={e => this.ngayCap = e} label='Ngày cấp' type='date-mask' className='col-md-4' readOnly={readOnly} />
                <FormTextBox ref={e => this.donViCap = e} maxLength={99} label='Đơn vị cấp' className='col-md-4' readOnly={readOnly} />
                <FormTextBox type='number' max={2000} allowNegative={false} step={true} decimalScale='2' ref={e => this.diemNghe = e} label='Điểm nghe' className='col-md-3' readOnly={readOnly} />
                <FormTextBox type='number' max={2000} allowNegative={false} step={true} decimalScale='2' ref={e => this.diemNoi = e} label='Điểm nói' className='col-md-3' readOnly={readOnly} />
                <FormTextBox type='number' max={2000} allowNegative={false} step={true} decimalScale='2' ref={e => this.diemDoc = e} label='Điểm đọc' className='col-md-3' readOnly={readOnly} />
                <FormTextBox type='number' max={2000} allowNegative={false} step={true} decimalScale='2' ref={e => this.diemViet = e} label='Điểm viết' className='col-md-3' readOnly={readOnly} />
                <FormTextBox type='number' max={2000} allowNegative={false} step={true} decimalScale='2' ref={e => this.diemChungChi = e} label='Tổng điểm' className='col-md-6' readOnly={readOnly} />
                <FormTextBox type='number' max={2000} allowNegative={false} step={true} decimalScale='2' ref={e => this.diemCauTruc = e} label='Điểm cấu trúc' className='col-md-6' readOnly={readOnly} />
                <strong className='text-danger' style={{ paddingLeft: '15px' }}>Trường hợp chứng chỉ/văn bằng ngoại ngữ đánh giá bằng trình độ, vui lòng điền ở ghi chú</strong><br />
                {/* Văn bằng ngoại ngữ lưu ghi chú chuyên ngành || trường, Chứng chỉ nếu dùng điểm thì có tổng điểm, chứng chỉ nếu dùng cấp độ/trình độ thì lưu ở ghi chú để xuất biểu mẫu có sẵn*/}
                <FormRichTextBox row={1} ref={e => this.ghiChu = e} maxLength={199} label='Ghi chú' readOnlyText='Trình độ' className='col-md-12' readOnly={readOnly} />
            </div>
        });
    }
}