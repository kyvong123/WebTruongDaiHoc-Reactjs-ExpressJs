import React from 'react';
import { connect } from 'react-redux';
import { FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { gvLichGiangDayBaoBuCreate, gvLichGiangDayBaoBuUpdate } from './redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getDmCaHocAll } from 'modules/mdDanhMuc/dmCaHoc/redux';
import BaseBaoBuModal from './BaseBaoBuModal';

class BaoBuModal extends BaseBaoBuModal {
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
const mapActionsToProps = { gvLichGiangDayBaoBuCreate, gvLichGiangDayBaoBuUpdate, getDmCaHocAll };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoBuModal);