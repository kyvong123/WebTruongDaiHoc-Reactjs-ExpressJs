import { SelectAdapter_FwCanBoWithDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { create, update } from '../redux/congTac';
import { SelectAdapter_DmPhongHop } from '../redux/phongHop';
import { FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import { BaseCongTacModal } from './BaseCongTac';

class hcthCongTacModal extends BaseCongTacModal {

    onSubmit = () => {
        const data = {};
        ['ten', 'noiDung', 'chuTri', 'batDau', 'ketThuc', 'isOnline', 'dangKyPhongHop', 'duongDan', 'phongHop', 'diaDiem'].forEach(key => {
            const target = this[key];
            if (!target) throw new Error('Invalid keyword');
            else {
                data[key] = target.value();
                if (data[key] === '') {
                    if (target.props.required && !(['duongDan'].includes(key))) {
                        throw target;
                    }
                }
                if (['batDau', 'ketThuc'].includes(key)) {
                    data[key] = data[key].getTime();
                }
                if (['isOnline'].includes(key)) {
                    data[key] = Number(data[key]);
                }
            }
        });

        if (data.batDau > data.ketThuc) {
            return T.notify('Thời gian bắt đầu sau thời gian kết thúc', 'danger');
        } else if (data.isOnline && !data.duongDan) {
            return T.notify('Đường dẫn trống', 'danger');
        } else if (!data.isOnline && !data.phongHop) {
            return T.notify('Phòng họp trống', 'danger');
        }
        if (!this.state.item)
            this.props.create(data, (item) => {
                this.props.history.push('/user/vpdt/lich-hop/' + item.id);
            });
        else {
            this.props.update(this.state.item.id, data, () => window.location.reload());
        }
    }

    onShow = (data) => {
        if (!data) {
            this.setState({ item: null }, (() => {
                this.batDau.value(new Date());
            }));
        }
        else {
            this.setState({ item: data, isOnline: data.isOnline }, () => {
                this.batDau.value(data.batDau);
                this.ketThuc.value(data.ketThuc);
                this.chuDe.value(data.chuDe);
                this.noiDung.value(data.noiDung);
                this.chuTri.value(data.chuTri);
                this.duongDan.value(data.duongDan);
                this.phongHop.value(data.phongHop);
                this.isOnline.value(data.isOnline);
            });
        }
    }

    onChangeOnline = (value) => {
        this.setState({ isOnline: value }, () => {
            if (value) {
                this.duongDan.value(this.state.duongDan || '');
            } else {
                this.state.dataPhongHop?.phongHop && this.phongHop.value(this.state.dataPhongHop?.phongHop || '');
                this.state.dataPhongHop?.batDau && this.batDau.value(this.state.dataPhongHop?.batDau || '');
                this.state.dataPhongHop?.ketThuc && this.ketThuc.value(this.state.dataPhongHop?.ketThuc || '');
            }
        });
    }

    partialShow = () => {
        $(this.modal).modal('show');
    }

    partialHide = () => {
        $(this.modal).modal('hide');
    }

    onChonPhongHop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.partialHide();
        const pageModals = this.props.getPageModals();
        const modal = this;
        pageModals.chonPhongModal.getModalDom().on('hidden.bs.modal', function (e) {
            $(e.currentTarget).unbind();
        });

        pageModals.chonPhongModal.onHidden(() => {
            const data = pageModals.chonPhongModal.getValue();
            if (data) {
                modal.batDau.value(data.batDau);
                modal.ketThuc.value(data.ketThuc);
                modal.phongHop.value(data.phongHop);
                this.setState({ dataPhongHop: data });
            }
            pageModals.mainModal.partialShow();
        });
        pageModals.chonPhongModal.show({
            batDau: this.batDau.value() ? this.batDau.value()?.getTime() : '',
            ketThuc: this.ketThuc.value() ? this.ketThuc.value()?.getTime() : '',
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Lịch họp',
            icon: 'fa fa-calendar-check-o',
            size: 'elarge',
            body:
                <div className='row'>
                    <FormCheckbox isSwitch className={'col-md-12'} ref={e => this.isOnline = e} label='Trực tuyến' required onChange={(value) => this.onChangeOnline(value)} readOnly={this.state.item} />
                    <FormTextBox label='Tên' required ref={e => this.ten = e} className='col-md-12' />
                    <FormRichTextBox label='Nội dung' ref={e => this.noiDung = e} className='col-md-12' />
                    <FormSelect required data={SelectAdapter_FwCanBoWithDonVi} className='col-md-4' ref={e => this.chuTri = e} label='Chủ trì' />
                    <FormDatePicker disabled={this.state.dataPhongHop?.phongHop && !this.state.isOnline} required className='col-md-4' type='time-mask' label='Thời gian bắt đầu' ref={e => this.batDau = e} />
                    <FormDatePicker disabled={this.state.dataPhongHop?.phongHop && !this.state.isOnline} required className='col-md-4' type='time-mask' label='Dự kiến kết thúc' ref={e => this.ketThuc = e} />
                    <FormTextBox className={'col-md-12 ' + (this.state.isOnline ? '' : 'd-none')} ref={e => this.duongDan = e} label='Đường dẫn' required onChange={() => { this.setState({ duongDan: this.duongDan.value() }); }} />
                    <FormSelect className={'col-md-12 ' + (this.state.isOnline ? 'd-none' : '')} ref={e => this.phongHop = e} placeholder='Phòng họp' label={
                        <div className='d-flex'>Phòng họp <a href='#' onClick={this.onChonPhongHop}>(Nhấn vào đây để thay đổi)</a><span className='text-danger'>*</span></div>
                    } disabled onChange={(item) => { this.setState({ phongHop: item.id }); }} data={SelectAdapter_DmPhongHop} />
                </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { create, update };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(hcthCongTacModal);


