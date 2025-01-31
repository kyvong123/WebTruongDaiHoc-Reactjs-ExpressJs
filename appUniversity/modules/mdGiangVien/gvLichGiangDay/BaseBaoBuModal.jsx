import React from 'react';
import { AdminModal, FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';


export default class BaoBuModal extends AdminModal {
    state = { dataBu: {} }

    componentDidMount() {
        this.disabledClickOutside();
        $(document).ready(() => {
            this.onHidden(() => {
                this.setState({
                    isChooseNgay: false, isChooseTiet: false, isChooseSoTiet: false,
                    dataBu: {}, idBu: null, isWait: null,
                }, () => {
                    this.ngayBatDau.value('');
                    this.thu.value('');
                    this.tietBatDau.value('');
                    this.soTiet.value('');
                    this.ngayNghi.value('');
                    this.coSo.value('');
                });
            });
        });
    }

    onShow = (item) => {
        let { ngayHoc, thu, tietBatDau, soTietBuoi, coSo, isEdit } = item;

        if (isEdit) {
            let ngayNghi = this.props.dataTuan.find(i => i.idTuan == item.idNgayNghi);
            this.setState({
                coSo, item, isEdit, isChooseNgay: true, isChooseTiet: true, isChooseSoTiet: true,
                dataBu: { ngayBu: ngayHoc, tietBatDau, thu, soTietBuoi }
            }, () => {
                this.ngayNghi.value(`Ngày ${T.dateToText(ngayNghi.ngayHoc, 'dd/mm/yyyy')}, thứ ${ngayNghi.thu}, tiết ${ngayNghi.tietBatDau} - ${ngayNghi.tietBatDau + ngayNghi.soTietBuoi - 1}, tuần ${new Date(ngayNghi.ngayHoc).getWeek()}`);
                this.ngayBatDau.value(ngayHoc);
                this.thu.value(thu);
                this.tietBatDau.value(tietBatDau);
                this.soTiet.value(soTietBuoi);
                this.coSo.value(coSo);
            });
        } else {
            this.setState({ coSo, item, isEdit }, () => {
                this.ngayNghi.value(`Ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${tietBatDau + soTietBuoi - 1}, tuần ${new Date(ngayHoc).getWeek()}`);
                this.coSo.value(coSo);
            });
        }
    }

    checkBu = (item, soTietBuoi) => {
        let { dataTuan } = this.props;
        let dataBu = this.state.isEdit ? dataTuan.filter(i => i.idNgayNghi == item.idNgayNghi) : dataTuan.filter(i => i.idNgayNghi == item.idTuan),
            sumTietBu = dataBu.reduce((a, b) => a + parseInt(b.soTietBuoi), 0);

        if ((sumTietBu + soTietBuoi) > (this.state.isEdit ? dataTuan.find(i => i.idTuan == item.idNgayNghi).soTietBuoi : item.soTietBuoi)) {
            T.notify('Tổng số tiết bù lớn hơn số tiết của ngày nghỉ', 'danger');
            return false;
        }
        return true;
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        let { dataBu, isEdit, item, coSo } = this.state;
        let { ngayBu, tietBatDau, thu, soTietBuoi } = dataBu;

        if (!ngayBu) return T.alert('Vui lòng chọn ngày bù!', 'error', 'false', 2000);
        else if (!tietBatDau) return T.alert('Vui lòng chọn tiết bắt đầu!', 'error', 'false', 2000);
        else if (!soTietBuoi) return T.alert('Vui lòng chọn số tiết!', 'error', 'false', 2000);

        if (!this.checkBu(item, soTietBuoi)) {
            return;
        }

        this.props.getDmCaHocAll(dataTiet => {
            let tietHoc = dataTiet.filter(i => i.maCoSo == coSo).find(tiet => tiet.ten == tietBatDau);
            let tietKetThuc = dataTiet.filter(i => i.maCoSo == coSo).find(tiet => tiet.ten == (tietBatDau + soTietBuoi - 1));

            if (!tietKetThuc) return T.alert('Không tồn tại tiết kết thúc!', 'error', 'false', 2000);

            let [gioBatDau, phutBatDau] = tietHoc.thoiGianBatDau.split(':');
            let [gioKetThuc, phutKetThuc] = tietKetThuc.thoiGianKetThuc.split(':');

            let ngayBatDau = new Date(ngayBu).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
            let ngayKetThuc = new Date(ngayBu).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

            if (ngayBatDau <= Date.now()) return T.alert('Vui lòng chọn thời gian bù lớn hơn thời gian hiện tại!', 'error', 'false', 2000);

            let data = {
                thu, tietBatDau, soTietBuoi, ngayBatDau, ngayKetThuc, ngayBu, coSo, ghiChu: this.ghiChu.value(),
            };

            if (isEdit) {
                let { idTuan } = item;
                T.alert('Đang cập nhật lịch bù. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.gvLichGiangDayBaoBuUpdate({ idTuan }, data, () => {
                    this.hide();
                    this.props.baoBu();
                });
            } else {
                T.alert('Đang tạo mới lịch bù. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.gvLichGiangDayBaoBuCreate(data, item, () => {
                    this.hide();
                    this.props.baoBu();
                });
            }
        });
    }

    handleChangeNgay = (value) => {
        let ngayBatDau = (new Date(value)).setHours(0, 0, 0, 0);
        let thuBatDau = new Date(ngayBatDau).getDay() + 1;
        if (thuBatDau == 1) thuBatDau = 8;
        this.setState({ isChooseNgay: true, dataBu: { ...this.state.dataBu, ngayBu: ngayBatDau, thu: thuBatDau } }, () => {
            this.thu.value(thuBatDau);
        });
    }

    render = () => {
        let { isChooseNgay, isChooseTiet, isChooseSoTiet, dataBu, coSo, isWait } = this.state,
            isShow = isChooseNgay && isChooseTiet && isChooseSoTiet;
        return this.renderModal({
            title: 'Đăng ký lịch báo bù học phần',
            size: 'large',
            isShowSubmit: isShow,
            isLoading: isWait,
            body: <div className='row' >
                <FormTextBox ref={e => this.ngayNghi = e} readOnly={true} className='col-md-12' label='Ngày nghỉ' required />
                <FormSelect ref={e => this.coSo = e} className='col-md-2' label='Cơ sở' data={SelectAdapter_DmCoSo} required onChange={value => this.setState({ coSo: value.id, dataBu: { ...dataBu, tietBatDau: null } }, () => {
                    this.tietBatDau.value('');
                })} />
                <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-3' label='Ngày bù' type='date' required onChange={this.handleChangeNgay} />
                <FormSelect ref={e => this.thu = e} className='col-md-2' label='Thứ' data={SelectAdapter_DtDmThu} disabled={true} />
                <FormSelect ref={e => this.tietBatDau = e} className='col-md-3' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(coSo)} minimumResultsForSearch={-1} required onChange={(value) => this.setState({ isChooseTiet: true, dataBu: { ...dataBu, tietBatDau: value.id } })} />
                <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-2' label='Số tiết bù' required onChange={(value) => this.setState({ isChooseSoTiet: !!value, dataBu: { ...dataBu, soTietBuoi: value } })} />
                <FormTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú (Đề xuất của giảng viên)' />
            </div>,
        });
    }
}