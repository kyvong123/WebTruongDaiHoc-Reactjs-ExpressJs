import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormDatePicker, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { SelectAdapter_DmPhongCustomFilter } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { DtTKBCustomAddTuan } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';

class AdjustTuanModal extends AdminModal {
    state = { dataTuan: {} }

    onSubmit = (e) => {
        e && e.preventDefault();
        let { dataTuan } = this.state, { phong, thu, tietBatDau, soTietBuoi, ngayHoc, coSo } = dataTuan,
            { dataTiet, listTuanHoc, fullData, listNgayLe } = this.props,
            { maMonHoc, maHocPhan, namHoc, hocKy, id: idThoiKhoaBieu } = fullData[0];
        if (!(phong && thu && tietBatDau && soTietBuoi && coSo && ngayHoc)) {
            T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
            return;
        }

        dataTuan = { ...dataTuan, maMonHoc, maHocPhan, namHoc, hocKy, idThoiKhoaBieu, dataGiangVien: this.giangVien.value() };

        let tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1,
            thoiGianBatDau = dataTiet.filter(i => i.maCoSo == coSo).find(i => i.ten == tietBatDau).thoiGianBatDau,
            thoiGianKetThuc = dataTiet.filter(i => i.maCoSo == coSo).find(i => i.ten == tietKetThuc)?.thoiGianKetThuc;

        if (thoiGianKetThuc) {
            const [gioBatDau, phutBatDau] = thoiGianBatDau.split(':'),
                [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');
            dataTuan.ngayBatDau = new Date(ngayHoc).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
            dataTuan.ngayKetThuc = new Date(ngayHoc).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
        } else {
            T.notify('Không tồn tại tiết kết thúc', 'danger');
            return;
        }

        const isTrung = listTuanHoc.find(item => !(dataTuan.ngayBatDau > item.ngayKetThuc || dataTuan.ngayKetThuc < item.ngayBatDau));
        if (isTrung) {
            T.notify('Trùng thời gian học với lịch học khác của học phần', 'danger');
            return;
        }

        const isNgayLe = listNgayLe.find(i => i.ngay == ngayHoc);
        if (isNgayLe) {
            T.confirm('Cảnh báo', `Lịch học trùng với ngày lễ ${isNgayLe.moTa}. Bạn có muốn tiếp tục không?`, 'warning', true, isConfirm => {
                if (isConfirm) {
                    this.props.DtTKBCustomAddTuan({ ...dataTuan, isNgayLe: 1 }, result => {
                        this.hide();
                        this.props.update(result);
                    });
                }
            });
        } else {
            this.props.DtTKBCustomAddTuan(dataTuan, result => {
                this.hide();
                this.props.update(result);
            });
        }
    }

    handleChangeNgay = (value) => {
        let ngayBatDau = (new Date(value)).setHours(0, 0, 0, 0);
        let thuBatDau = new Date(ngayBatDau).getDay() + 1;
        if (thuBatDau == 1) thuBatDau = 8;
        this.setState({ dataTuan: { ...this.state.dataTuan, ngayHoc: ngayBatDau, thu: thuBatDau } }, () => {
            this.thu.value(thuBatDau);
            this.phong.value('');
        });
    }

    render = () => {
        const { dataTuan } = this.state, { coSo = '', ngayHoc = Date.now(), tietBatDau, soTietBuoi } = dataTuan;
        return this.renderModal({
            title: 'Thêm tuần học mới',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-2' ref={e => this.coSo = e} label='Cơ sở' required data={SelectAdapter_DmCoSo} onChange={value => this.setState({ dataTuan: { ...dataTuan, coSo: value.id } }, () => {
                    this.tietBatDau.value('');
                    this.phong.value('');
                })} />
                <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-3' label='Ngày học' type='date' required onChange={this.handleChangeNgay} />
                <FormSelect ref={e => this.thu = e} className='col-md-2' label='Thứ' data={SelectAdapter_DtDmThu} disabled={true} />
                <FormSelect ref={e => this.tietBatDau = e} className='col-md-4' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(coSo)} minimumResultsForSearch={-1} required onChange={value => this.setState({ dataTuan: { ...dataTuan, tietBatDau: value.id } }, () => this.phong.value(''))} />
                <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-3' label='Số tiết' required onChange={value => this.setState({ dataTuan: { ...dataTuan, soTietBuoi: value } }, () => this.phong.value(''))} />
                <FormSelect ref={e => this.phong = e} className='col-md-3' label='Phòng' data={SelectAdapter_DmPhongCustomFilter({ coSo, ngayHoc, tietBatDau, soTietBuoi })} required onChange={value => this.setState({ dataTuan: { ...dataTuan, phong: value.id } })} />
                <FormSelect ref={e => this.giangVien = e} className='col-md-5' label='Giảng viên' data={SelectAdapter_FwCanBoGiangVien} allowClear={true} multiple={true} />
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { DtTKBCustomAddTuan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AdjustTuanModal);