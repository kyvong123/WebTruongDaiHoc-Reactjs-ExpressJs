import React from 'react';
import { AdminModal, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
// import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';

const DataHocVi = [{ id: '02', text: 'Thạc sĩ' }, { id: '03', text: 'Tiến sĩ' }];
const DataHocHam = [{ id: '01', text: 'Giáo sư' }, { id: '02', text: 'Phó giáo sư' }];
export class DetailModal extends AdminModal {

    onShow = (item) => {
        this.setState({
            ...item,
            changes: {}
        });
        this.props.getInfoDetailPage(item.id, result => {
            this.giangVien?.value(result.idGiangVien);
            this.hocVi?.value(result.hocVi);
            this.hocHam?.value(result.hocHam);
            this.ngach?.value(result.ngach);
            this.tongSoSinhVien?.value(result.soLuongSv);
            this.tinhPhi?.value(!!result.tinhPhi);
            this.soTietDuocChia?.value(result.soTietDuocChia);
            this.donGia?.value(result.donGia);
        });

    }

    onSubmit = () => {
        const changes = {
            idGiangVien: this.giangVien.value(),
            ngach: this.ngach.value(),
            hocVi: this.hocVi.value(),
            hocHam: this.hocHam.value(),
            soLuongSv: parseInt(this.tongSoSinhVien.value()),
            soTietDuocChia: this.soTietDuocChia.value(),
            lopNuocNgoai: Number(this.lopNuocNgoai.value()),
            vietNamHoc: Number(this.vietNamHoc.value()),
            tinhPhi: Number(this.tinhPhi.value()),
            donGia: parseInt(this.donGia.value()),
            thue: parseFloat(this.thue.value()) || 0
        };

        this.props.updateThuLaoGiangDay(this.state.id, changes, () => {
            this.hide();
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Điều chỉnh học phần',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-3' label='Giảng viên' data={SelectAdapter_FwCanBoGiangVien} ref={e => this.giangVien = e}></FormSelect>
                <FormSelect className='col-md-3' label='Ngạch' data={SelectAdapter_DmNgachCdnnV2} ref={e => this.ngach = e}></FormSelect>
                <FormSelect className='col-md-3' label='Học vị' data={DataHocVi} ref={e => this.hocVi = e}></FormSelect>
                <FormSelect className='col-md-3' label='Học hàm' data={DataHocHam} ref={e => this.hocHam = e}></FormSelect>

                <FormTextBox className='col-md-4' label='Tổng số sinh viên' ref={e => this.tongSoSinhVien = e}></FormTextBox>
                <FormTextBox className='col-md-4' label='Số tiết được chia' ref={e => this.soTietDuocChia = e}></FormTextBox>
                <FormTextBox className='col-md-4' label='Đơn giá (VNĐ)' ref={e => this.donGia = e} type='number' allowNegative={false}> </FormTextBox>

                <FormCheckbox className='col-md-4' label='Lớp nước ngoài' ref={e => this.lopNuocNgoai = e}></FormCheckbox>
                <FormCheckbox className='col-md-4' label='Lớp VNH' ref={e => this.vietNamHoc = e}></FormCheckbox>
                <FormCheckbox className='col-md-4' label='Tính phí' ref={e => this.tinhPhi = e}></FormCheckbox>
                <FormTextBox type='number' className='col-md-4' label='Thuế (%)' ref={e => this.thue = e}></FormTextBox>
            </div>

        });
    }
}