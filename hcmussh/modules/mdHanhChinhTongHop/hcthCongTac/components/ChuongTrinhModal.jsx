import { SelectAdapter_FwCanBoWithDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { createChuongTrinh, updateChuongTrinh } from '../redux/congTac';
import { FormDatePicker, FormRichTextBox, FormSelect } from 'view/component/AdminPage';
import { BaseCongTacModal } from './BaseCongTac';
import FileBox from 'view/component/FileBox';

class HcthChuongTrinhHopModal extends BaseCongTacModal {

    onShow = (data) => {
        this.setState({ chuongTrinh: data.chuongTrinh }, () => {
            this.moTa.value(data.chuongTrinh?.moTa || '');
            this.batDau.value(data.chuongTrinh?.batDau || Date.now());
            this.canBo.value(data.chuongTrinh?.canBo || '');
        });
    }

    onSubmit = () => {
        const data = {};
        ['moTa', 'canBo', 'batDau',].forEach(key => {
            const target = this[key];
            if (!target) throw new Error('Invalid keyword');
            if (target.props.disabled) return;
            else {
                data[key] = target.value();
                if (data[key] === '') {
                    if (target.props.required) {
                        throw target;
                    }
                }
                if (['batDau'].includes(key)) {
                    data[key] = data[key].getTime();
                }
            }
        });

        if (data.batDau > this.getItem().ketThuc && data.batDau < this.getItem().batDau) {
            return T.notify('Thời gian bắt đầu không hợp lệ', 'danger');
        }

        if (this.state.chuongTrinh?.id) {
            this.props.updateChuongTrinh(this.state.chuongTrinh.id, this.getItem().id, data, (item) => {
                this.fileBox.getFile() && this.fileBox.onUploadFile({ chuongTrinhId: item.id });
                this.hide();
            });
        } else {
            data.congTacItemId = this.getItem().id;
            this.props.createChuongTrinh(data, (item) => {
                this.fileBox.getFile() && this.fileBox.onUploadFile({ chuongTrinhId: item.id });
                this.hide();
            });
        }
    }

    render = () => {

        return this.renderModal({
            title: 'Chương trình họp',
            icon: 'fa fa-calendar-check-o',
            size: 'elarge',
            body:
                <div className='row'>
                    <FormRichTextBox label='Mô tả' ref={e => this.moTa = e} className='col-md-12' />
                    <FormSelect data={SelectAdapter_FwCanBoWithDonVi} className='col-md-6' ref={e => this.canBo = e} label='Cán bộ' />
                    <FormDatePicker required className='col-md-6' type='time-mask' label='Thời gian bắt đầu' ref={e => this.batDau = e} />
                    <FileBox className='col-md-12' label='Tệp tin đính kèm' postUrl='/user/upload' uploadType='hcthChuongTrinhFile' uploadData='hcthChuongTrinhFile' pending={true} ref={e => this.fileBox = e} />
                </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { createChuongTrinh, updateChuongTrinh };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(HcthChuongTrinhHopModal);


