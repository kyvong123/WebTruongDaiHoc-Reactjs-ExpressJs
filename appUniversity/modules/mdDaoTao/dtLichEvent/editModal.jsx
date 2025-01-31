import React from 'react';
import { connect } from 'react-redux';
import { createDtLichEvent, updateDtLichEvent, checkNgayLe, } from './redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DmCaHoc, getDmCaHocAll } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DmPhongGetPhongEvent } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminModal, FormTextBox, FormSelect, FormDatePicker, FormRichTextBox, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = {
        item: {}, caHoc: []
    }
    ngayTrongTuan = [
        { id: 'Mon', text: 'Thứ hai' },
        { id: 'Tue', text: 'Thứ ba' },
        { id: 'Wed', text: 'Thứ tư' },
        { id: 'Thu', text: 'Thứ năm' },
        { id: 'Fri', text: 'Thứ sáu' },
        { id: 'Sat', text: 'Thứ bảy' },
        { id: 'Sun', text: 'Chủ nhật' },
    ]

    componentDidMount() {
        this.props.getDmCaHocAll(value => this.setState({ caHoc: value }));
        this.disabledClickOutside();
        this.onHidden(() => {
            this.setState({ item: {}, coSo: null, thoiGianBatDau: null, thoiGianKetThuc: null, khoa: '', ngayBatDau: null, tietBatDau: '', soTiet: '' }, () => {
                this.coSo.value('');
                this.phong.value('');
                this.ghiChu.value('');
                this.thoiGianBatDau.value('');
                this.thoiGianKetThuc.value('');
                this.ngayBatDau.value('');
                this.thu.value('');
                this.tietBatDau.value('');
                this.soTiet.value('');
            });
        });
    }

    onShow = (item) => {
        let { thoiGianBatDau, thoiGianKetThuc, coSo, phong, ghiChu, tietBatDau, soTiet } = item,
            ngayBatDau = null, thu = null;

        thoiGianBatDau = new Date(thoiGianBatDau);
        thoiGianKetThuc = new Date(thoiGianKetThuc);

        ngayBatDau = this.getFullDateTime(thoiGianBatDau, 'ngay').split('/');
        ngayBatDau = new Date(ngayBatDau[2], parseInt(ngayBatDau[1]) - 1, ngayBatDau[0]);

        thu = ngayBatDau.toDateString().slice(0, 3);

        this.setState({ item, coSo, thoiGianBatDau: thoiGianBatDau.getTime(), thoiGianKetThuc: thoiGianKetThuc.getTime(), ngayBatDau, tietBatDau, soTiet }, () => {
            this.coSo.value(coSo);
            this.phong.value(phong);
            this.ghiChu.value(ghiChu);
            this.thoiGianBatDau.value(thoiGianBatDau);
            this.thoiGianKetThuc.value(thoiGianKetThuc);
            this.ngayBatDau.value(ngayBatDau);
            this.thu.value(thu);
            this.tietBatDau.value(tietBatDau);
            this.soTiet.value(soTiet);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let thoiGianBatDau = getValue(this.thoiGianBatDau).getTime(),
            thoiGianKetThuc = getValue(this.thoiGianKetThuc).getTime(),
            ngayBatDau = getValue(this.ngayBatDau).getTime();

        const changes = {
            thoiGianBatDau, thoiGianKetThuc,
            coSo: getValue(this.coSo),
            phong: getValue(this.phong),
            ghiChu: this.ghiChu.value(),
            tietBatDau: getValue(this.tietBatDau),
            soTiet: getValue(this.soTiet),
        };

        this.props.checkNgayLe(ngayBatDau, 1, (data) => {
            if (data.listTuanTrung) {
                if (data.listTuanTrung.length) T.alert('Ngày cập nhật sự kiện bị trùng với ngày lễ. Bạn hãy chọn ngày khác', 'error', false, 1000);
                else {
                    T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                    this.props.updateDtLichEvent(this.state.item.id, changes, (value) => {
                        if (value.error) T.alert('Cập nhật thông tin sự kiện thất bại', 'error', false, 1000);
                        else {
                            this.hide();
                            this.props.handleUpdate();
                            T.alert('Cập nhật thông tin sự kiện thành công', 'success', false, 1000);
                        }
                    });
                }
            }
        });
    }

    getFullDateTime = (value, ma) => {
        if (value == null) return;
        const d = new Date(value);
        const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
        const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
        const year = d.getFullYear();
        const hours = ('0' + d.getHours()).slice(-2);
        const minutes = ('0' + d.getMinutes()).slice(-2);
        const seconds = ('0' + d.getSeconds()).slice(-2);
        if (ma == 'ngay') return `${date}/${month}/${year}`;
        else if (ma == 'gio') return `${hours}:${minutes}:${seconds}`;
        else return `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    handleNgay = () => {
        let ngayBatDau = getValue(this.ngayBatDau).getTime(),
            thu = (new Date(ngayBatDau)).toDateString().slice(0, 3),
            thoiGianBatDau = new Date(ngayBatDau);
        this.setState({ ngayBatDau, thoiGianBatDau: ngayBatDau, thoiGianKetThuc: ngayBatDau }, () => {
            this.thu.value(thu);
            this.tietBatDau.value('');
            this.soTiet.value('');
            this.phong.value('');
            this.thoiGianBatDau.value(thoiGianBatDau);
            this.thoiGianKetThuc.value(thoiGianBatDau);
        });
    }

    handleTiet = (value) => {
        let hours = value.item.thoiGianBatDau,
            ngayBatDau = this.getFullDateTime(this.state.ngayBatDau, 'ngay');

        ngayBatDau = ngayBatDau.split('/');
        hours = hours.split(':');
        let thoiGianBatDau = new Date(ngayBatDau[2], parseInt(ngayBatDau[1]) - 1, ngayBatDau[0], hours[0], hours[1]);
        this.setState({ thoiGianBatDau: thoiGianBatDau.getTime(), thoiGianKetThuc: thoiGianBatDau.getTime(), tietBatDau: value.id }, () => {
            this.thoiGianBatDau.value(thoiGianBatDau);
            this.thoiGianKetThuc.value(thoiGianBatDau);
            this.soTiet.value('');
            this.phong.value('');
        });
    }

    handleSoTiet = () => {
        let soTiet = this.soTiet.value(),
            { coSo, tietBatDau, caHoc, ngayBatDau } = this.state;
        caHoc = caHoc.filter(e => e.maCoSo == coSo && parseInt(e.ten) == (parseInt(tietBatDau + soTiet - 1)));
        if (caHoc.length) {
            caHoc = caHoc[0];
            let hours = caHoc.thoiGianKetThuc;
            ngayBatDau = this.getFullDateTime(ngayBatDau, 'ngay');
            ngayBatDau = ngayBatDau.split('/');
            hours = hours.split(':');
            let thoiGianKetThuc = new Date(ngayBatDau[2], parseInt(ngayBatDau[1]) - 1, ngayBatDau[0], hours[0], hours[1]);
            this.setState({ thoiGianKetThuc: thoiGianKetThuc.getTime(), soTiet }, () => {
                this.thoiGianKetThuc.value(thoiGianKetThuc);
                this.phong.value('');
            });
        } else {
            T.notify('Không tìm thấy tiết kết thúc!', 'danger');
            this.soTiet.focus();
        }
    }

    render = () => {
        let { item } = this.state;
        return this.renderModal({
            title: `Cập nhật sự kiện ${item?.ten}`,
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <FormSelect ref={e => this.coSo = e} className='col-md-4' label='Cơ sở' data={SelectAdapter_DmCoSo}
                            onChange={(value) => this.setState({ coSo: value.id }, () => {
                                this.phong.value('');
                                this.tietBatDau.value('');
                                this.soTiet.value('');
                            })} required />

                        <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-4' label='Ngày bắt đầu' type='date' required
                            onChange={(value) => this.setState({ ngayBatDau: value.getTime() }, () => this.handleNgay())} />
                        <FormSelect ref={e => this.thu = e} className='col-md-4' label='Thứ' data={this.ngayTrongTuan} disabled={true} />

                        <FormSelect ref={e => this.tietBatDau = e} className='col-md-4' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(this.state.coSo)} required
                            onChange={(value) => this.setState({ tietBatDau: value.id }, () => this.handleTiet(value))} />
                        <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-4' label='Số tiết' min={1} max={20} required
                            onChange={(value) => this.setState({ soTiet: value }, () => this.handleSoTiet())} />

                        <FormSelect ref={e => this.phong = e} className='col-md-4' label='Phòng' data={SelectAdapter_DmPhongGetPhongEvent({
                            thoiGianBatDau: this.state.thoiGianBatDau,
                            thoiGianKetThuc: this.state.thoiGianKetThuc,
                            soTuanLap: 1,
                            coSo: this.state.coSo,
                        })} required />

                        <FormDatePicker ref={e => this.thoiGianBatDau = e} className='col-md-6' label='Thời gian bắt đầu' type='time' disabled={true} />
                        <FormDatePicker ref={e => this.thoiGianKetThuc = e} className='col-md-6' label='Thời gian kết thúc' type='time' disabled={true} />
                        <FormRichTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú' />
                    </div>
                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDtLichEvent, updateDtLichEvent, getDmCaHocAll, checkNgayLe };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(EditModal);