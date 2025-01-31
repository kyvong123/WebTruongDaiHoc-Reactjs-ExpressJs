import React from 'react';
import { connect } from 'react-redux';

import { createDtLichEvent, updateDtLichEvent, checkNgayLe, dtLichEventCreateNew } from './redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DmCaHoc, getDmCaHocAll } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmPhongGetPhongEvent } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminModal, FormTextBox, FormSelect, FormDatePicker, FormRichTextBox, getValue } from 'view/component/AdminPage';

class AddModal extends AdminModal {
    state = {
        item: {}, filter: {}, caHoc: []
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
        this.disabledClickOutside();
        this.props.getDmCaHocAll(value => this.setState({ caHoc: value }));
    }

    onShow = (item) => {

        const { ten, coSo, phong, ngayBatDau, ghiChu, khoa, lop, tietBatDau, soTiet, giangVien, soTuanLap, id } = item && item.baseEvent ? item.baseEvent[0] : { ten: '', coSo: 2, ngayBatDau: null, tietBatDau: '', soTiet: '', soTuanLap: 1, khoa: '', lop: '', ghiChu: '', giangVien: '', phong: '' },
            { caHoc } = this.state;
        let thu = '', thoiGianBatDau = null, thoiGianKetThuc = null;
        if (ngayBatDau) {
            thu = (new Date(ngayBatDau)).toDateString().slice(0, 3);
            if (tietBatDau && soTiet) {
                let caHocCoSo = caHoc.filter(i => i.maCoSo == coSo);
                caHocCoSo.sort((a, b) => Number(a.ten) - Number(b.ten));

                let batDau = caHoc.filter(i => i.maCoSo == coSo).find(item => item.ten == tietBatDau).thoiGianBatDau,
                    ketThuc = caHocCoSo.find(item => item.ten == Number(tietBatDau) + Number(soTiet) - 1);

                if (ketThuc) ketThuc = ketThuc.thoiGianKetThuc;
                else ketThuc = caHocCoSo.slice(-1)[0].thoiGianKetThuc;

                const [gioBatDau, phutBatDau] = batDau.split(':'),
                    [gioKetThuc, phutKetThuc] = ketThuc.split(':');
                thoiGianBatDau = new Date(ngayBatDau).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
                thoiGianKetThuc = new Date(ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
            }
        }

        this.setState({ id, coSo, ngayBatDau, tietBatDau, soTiet, thoiGianBatDau, thoiGianKetThuc, soTuanLap, khoa }, () => {
            this.ten.value(ten);
            this.coSo.value(coSo);
            this.ngayBatDau.value(ngayBatDau);
            this.thu.value(thu);
            this.tietBatDau.value(tietBatDau);
            this.soTiet.value(soTiet);
            this.soTuanLap.value(soTuanLap);
            this.phong.value(phong);
            this.thoiGianBatDau.value(thoiGianBatDau);
            this.thoiGianKetThuc.value(thoiGianKetThuc);
            this.khoa.value(khoa);
            this.lop.value(lop ? lop.split(', ') : '');
            this.giangVien.value(giangVien);
            this.ghiChu.value(ghiChu);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();

        const handleSave = (changes) => {
            T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
            if (this.state.id) {
                this.props.dtLichEventCreateNew(this.state.id, changes, () => {
                    this.hide();
                    this.props.handleUpdate();
                    T.alert('Tạo mới sự kiện thành công', 'success', false, 1000);
                });
            } else {
                this.props.createDtLichEvent(changes, () => {
                    this.hide();
                    T.alert('Tạo mới sự kiện thành công', 'success', false, 1000);
                });
            }
        };

        if (!getValue(this.ngayBatDau)) {
            T.notify('Chưa chọn ngày bắt đầu!', 'danger');
            this.ngayBatDau.focus();
        } else {
            let thoiGianBatDau = getValue(this.thoiGianBatDau),
                thoiGianKetThuc = getValue(this.thoiGianKetThuc),
                ngayBatDau = getValue(this.ngayBatDau).getTime(),
                lop = this.lop.value().join(', ');

            const changes = {
                ten: this.ten.value(),
                thoiGianBatDau: thoiGianBatDau?.getTime(),
                thoiGianKetThuc: thoiGianKetThuc?.getTime(),
                ngayBatDau,
                soTuanLap: this.soTuanLap.value(),
                coSo: this.coSo.value(),
                phong: this.phong.value(),
                ghiChu: this.ghiChu.value(),
                giangVien: this.giangVien.value(),
                khoa: this.khoa.value(),
                tietBatDau: this.tietBatDau.value(),
                soTiet: this.soTiet.value(),
                lop,
            };

            if (changes.ten == '') {
                T.notify('Tên sự kiện bị trống!', 'danger');
                this.ten.focus();
            } else if (changes.coSo == '') {
                T.notify('Chưa chọn cơ sở!', 'danger');
                this.coSo.focus();
            } else if (changes.tietBatDau == '') {
                T.notify('Chưa chọn tiết bắt đầu!', 'danger');
                this.tietBatDau.focus();
            } else if (changes.soTiet == '') {
                T.notify('Chưa nhập số tiết!', 'danger');
                this.soTiet.focus();
            } else if (changes.soTuanLap == '') {
                T.notify('Chưa nhập số tuần lặp!', 'danger');
                this.soTuanLap.focus();
            } else if (changes.phong == '' || changes.phong == null) {
                T.notify('Chưa chọn phòng!', 'danger');
                this.phong.focus();
            } else {
                this.props.checkNgayLe(ngayBatDau, changes.soTuanLap, (data) => {
                    if (data.listTuanTrung) {
                        if (data.listTuanTrung.length) {
                            let listTuanTrung = data.listTuanTrung;
                            listTuanTrung = listTuanTrung.map(e => {
                                return this.getFullDateTime(e, 'ngay');
                            });
                            listTuanTrung = listTuanTrung.join(', ');
                            T.confirm('Cảnh báo', `Ngày ${listTuanTrung} bị trùng với ngày lễ. Bạn có muốn tự động rải lịch không?`, 'warning', true, isConfirm => {
                                if (isConfirm) {
                                    handleSave(changes);
                                }
                            });
                        } else {
                            handleSave(changes);
                        }
                    }
                });
            }
        }
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
        if (!ngayBatDau) {
            this.tietBatDau.value('');
            return T.notify('Vui lòng chọn ngày bắt đầu!', 'danger');
        }
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
        caHoc = caHoc.filter(e => e.maCoSo == coSo && parseInt(e.ten) == (Number(tietBatDau) + Number(soTiet || 0) - 1));
        if (caHoc.length) {
            caHoc = caHoc[0];
            let hours = caHoc.thoiGianKetThuc;
            ngayBatDau = this.getFullDateTime(ngayBatDau, 'ngay');
            if (!ngayBatDau) {
                this.soTiet.value('');
                return T.notify('Vui lòng chọn ngày bắt đầu!', 'danger');
            }
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
        let { id } = this.state;
        return this.renderModal({
            title: id ? 'Cập nhật sự kiện' : 'Tạo sự kiện mới',
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <FormTextBox ref={e => this.ten = e} className='col-md-12' label='Tên sự kiện' required readOnly={id} />

                        <FormSelect ref={e => this.coSo = e} className='col-md-4' label='Cơ sở' data={SelectAdapter_DmCoSo}
                            onChange={(value) => this.setState({ coSo: value.id }, () => {
                                this.phong.value('');
                                this.tietBatDau.value('');
                                this.soTiet.value('');
                            })} required />
                        <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-4' label='Ngày bắt đầu' type='date' required
                            onChange={(value) => this.setState({ ngayBatDau: value.getTime() }, () => this.handleNgay())} />
                        <FormSelect ref={e => this.thu = e} className='col-md-4' label='Thứ' data={this.ngayTrongTuan} disabled={true} />

                        <FormSelect ref={e => this.tietBatDau = e} className='col-md-3' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(this.state.coSo)} required
                            onChange={(value) => this.setState({ tietBatDau: value.id }, () => this.handleTiet(value))} />
                        <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-3' label='Số tiết' min={1} max={20} required
                            onChange={(value) => this.setState({ soTiet: value }, () => this.handleSoTiet())} />
                        <FormTextBox type='number' ref={e => this.soTuanLap = e} className='col-md-3' label='Số tuần lặp' placeholder='Từ 1 đến 10'
                            onChange={(value) => this.setState({ soTuanLap: value }, () => this.phong.value(''))} min={1} max={10} required />

                        <FormSelect ref={e => this.phong = e} className='col-md-3' label='Phòng' data={SelectAdapter_DmPhongGetPhongEvent({
                            thoiGianBatDau: this.state.thoiGianBatDau,
                            thoiGianKetThuc: this.state.thoiGianKetThuc,
                            soTuanLap: this.state.soTuanLap,
                            coSo: this.state.coSo,
                        })} required />

                        <FormDatePicker ref={e => this.thoiGianBatDau = e} className='col-md-6' label='Thời gian bắt đầu' type='time' disabled={true} />
                        <FormDatePicker ref={e => this.thoiGianKetThuc = e} className='col-md-6' label='Thời gian kết thúc' type='time' disabled={true} />

                        <FormSelect ref={(e) => (this.khoa = e)} className='col-md-12' label='Khoa' data={SelectAdapter_DtDmDonVi()}
                            onChange={(value) => this.setState({ khoa: value.id }, () => this.lop.value(''))} allowClear />
                        <FormSelect ref={(e) => (this.lop = e)} className='col-md-12' label='Lớp' data={SelectAdapter_DtLopFilter({ donVi: this.state.khoa })} multiple allowClear />

                        <FormRichTextBox ref={e => this.giangVien = e} className='col-md-12' label='Cán bộ' />
                        <FormRichTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú' />
                    </div>
                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDtLichEvent, updateDtLichEvent, getDmCaHocAll, checkNgayLe, dtLichEventCreateNew };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);