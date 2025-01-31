import React from 'react';
import { AdminModal, FormDatePicker, FormSelect, getValue } from 'view/component/AdminPage';
import { SelectAdapter_CtsvFwCanBoByDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_TccbRoleList } from 'modules/mdTccb/tccbAssignRole/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

export default class CreateModal extends AdminModal {
    state = { isUpdate: false, donVi: null }
    onShow = () => {
        this.donVi.value('');
        this.canBo.value('');
        this.role.value('');
        this.ngayBatDau.value('');
        this.ngayKetThuc.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            canBo: getValue(this.canBo),
            role: getValue(this.role),
            ngayBatDau: getValue(this.ngayBatDau) ? T.dateToNumber(getValue(this.ngayBatDau)) : Date.now(),
            ngayKetThuc: getValue(this.ngayKetThuc) ? T.dateToNumber(getValue(this.ngayKetThuc), 23, 59, 59, 999) : null
        };

        this.props.assignRole(data, () => {
            T.notify('Phân quyền mới cho cán bộ thành công', 'success');
            this.hide();
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Phân quyền mới cho người dùng',
            // isLoading: this.state.isSubmitting,
            size: 'large',
            submitText: 'Lưu',
            body: <div className='row'>
                <FormSelect className='col-md-4' data={SelectAdapter_DmDonVi} ref={e => this.donVi = e} label='Đơn vị' onChange={value => this.setState({ donVi: value.id }, () => this.canBo.value(''))} readOnly={this.state.isUpdate} />
                <FormSelect className='col-md-8' data={SelectAdapter_CtsvFwCanBoByDonVi(this.state.donVi)} ref={e => this.canBo = e} label='Cán bộ' multiple readOnly={this.state.isUpdate} />
                <FormSelect className='col-md-12' ref={e => this.role = e} data={SelectAdapter_TccbRoleList} label='Chọn quyền' readOnly={this.state.isUpdate} />
                <FormDatePicker className='col-md-6' ref={e => this.ngayBatDau = e} label='Thời gian bắt đầu' />
                <FormDatePicker className='col-md-6' ref={e => this.ngayKetThuc = e} label='Thời gian kết thúc' />
            </div>
        }
        );
    }
}
