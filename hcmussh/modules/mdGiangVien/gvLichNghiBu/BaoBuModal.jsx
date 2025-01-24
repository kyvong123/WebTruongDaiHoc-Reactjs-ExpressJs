import React from 'react';
import { connect } from 'react-redux';
import { FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { gvLichGiangDayBaoBuCreate, gvLichGiangDayBaoBuUpdate, getLichHocPhan } from 'modules/mdGiangVien/gvLichGiangDay/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getDmCaHocAll } from 'modules/mdDanhMuc/dmCaHoc/redux';
import BaseBaoBuModal from 'modules/mdGiangVien/gvLichGiangDay/BaseBaoBuModal';

class BaoBuModal extends BaseBaoBuModal {
    state = { dataTuan: [] }

    checkBu = (item, soTietBuoi) => {
        let { dataTuan } = this.state;
        let dataBu = this.state.isEdit ? dataTuan.filter(i => i.idNgayNghi == item.idNgayNghi) : dataTuan.filter(i => i.idNgayNghi == item.idTuan),
            sumTietBu = dataBu.reduce((a, b) => a + parseInt(b.soTietBuoi), 0);
        console.log(this.state.item, dataTuan);
        if ((sumTietBu + soTietBuoi) > (this.state.isEdit ? dataTuan.find(i => i.idTuan == item.idNgayNghi).soTietBuoi : item.soTietBuoi)) {
            T.notify('Tổng số tiết bù lớn hơn số tiết của ngày nghỉ', 'danger');
            return false;
        }
        return true;
    }

    onShow = (item) => {
        this.props.getLichHocPhan(item.maHocPhan, dataTuan => {
            if (item.isEdit) {
                let { ngayHoc, thu, tietBatDau, soTietBuoi, coSo } = item.bu;
                let ngayNghi = dataTuan.find(i => i.idTuan == item.bu.idNgayNghi);

                ngayHoc = Number(ngayHoc);
                thu = Number(thu);
                tietBatDau = Number(tietBatDau);
                soTietBuoi = Number(soTietBuoi);

                this.setState({
                    coSo, item: item.bu, isEdit: item.isEdit, isChooseNgay: true, isChooseTiet: true, isChooseSoTiet: true,
                    dataBu: { ngayBu: ngayHoc, tietBatDau, thu, soTietBuoi }, dataTuan,
                }, () => {
                    this.ngayNghi.value(`Ngày ${T.dateToText(ngayNghi.ngayHoc, 'dd/mm/yyyy')}, thứ ${ngayNghi.thu}, tiết ${ngayNghi.tietBatDau} - ${ngayNghi.tietBatDau + ngayNghi.soTietBuoi - 1}, tuần ${new Date(ngayNghi.ngayHoc).getWeek()}`);
                    this.ngayBatDau.value(ngayHoc);
                    this.thu.value(thu);
                    this.tietBatDau.value(tietBatDau);
                    this.soTiet.value(soTietBuoi);
                    this.coSo.value(coSo);
                });
            } else {
                const tuan = dataTuan.find(i => i.idTuan == item.nghi.idTuan);
                this.setState({ coSo: tuan.coSo, item: tuan, isEdit: item.isEdit, dataTuan }, () => {
                    this.ngayNghi.value(`Ngày ${T.dateToText(tuan.ngayHoc, 'dd/mm/yyyy')}, thứ ${tuan.thu}, tiết ${tuan.tietBatDau} - ${tuan.tietBatDau + tuan.soTietBuoi - 1}, tuần ${new Date(tuan.ngayHoc).getWeek()}`);
                    this.coSo.value(tuan.coSo);
                });
            }
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
                <FormSelect ref={e => this.coSo = e} className='col-md-2' label='Cơ sở' data={SelectAdapter_DmCoSo} required readOnly />
                <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-3' label='Ngày bù' type='date' required onChange={this.handleChangeNgay} />
                <FormSelect ref={e => this.thu = e} className='col-md-2' label='Thứ' data={SelectAdapter_DtDmThu} disabled={true} />
                <FormSelect ref={e => this.tietBatDau = e} className='col-md-3' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(coSo)} minimumResultsForSearch={-1} required onChange={(value) => this.setState({ isChooseTiet: true, dataBu: { ...dataBu, tietBatDau: value.id } })} />
                <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-2' label='Số tiết bù' required onChange={(value) => this.setState({ isChooseSoTiet: !!value, dataBu: { ...dataBu, soTietBuoi: value } })} />
                <FormTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú (Đề xuất của giảng viên)' />
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { gvLichGiangDayBaoBuCreate, gvLichGiangDayBaoBuUpdate, getDmCaHocAll, getLichHocPhan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoBuModal);