import React from 'react';
import { connect } from 'react-redux';
import { FormTextBox, FormSelect } from 'view/component/AdminPage';
import { createLich, updateLich } from '../redux/lichCongTac';
import { BaseCongTacModal } from './BaseCongTac';
import * as EaseDatePicker from './EaseDatePicker';
import { SelectAdapter_FwBosses } from 'modules/mdTccb/tccbCanBo/redux';
class ReportModal extends BaseCongTacModal {

    onSubmit = () => {
        const [batDau, ketThuc] = this.dateRange.value();
        const data = {
            batDau: batDau?.getTime(), ketThuc: ketThuc?.getTime(),
            ghiChu: this.ghiChu.value(),
            items: this.state.items,
            canBoKiemDuyet: this.canBoKiemDuyet.value()
        };

        if (!data.batDau) {
            return T.notify('Thời gian bắt đầu trống', 'danger');
        } else if (!data.ketThuc) {
            return T.notify('Thời gian kết thúc trống', 'danger');
        } else if (!data.canBoKiemDuyet.length) {
            return T.notify('Cán bộ kiểm duyệt trống', 'danger');
        }

        if (this.state.data.id) {
            this.props.update(this.state.data.id, data, () => window.location.reload());
        } else
            this.props.create(data, (item) => {
                window.open(`/user/hcth/cong-tac/tong-hop/${item.id}`, '_blank');
            });
    }

    onShow = (data) => {
        if (!data.id) {
            this.dateRange.value(data.batDau, data.ketThuc);
            this.soLuong.value(data.items.length);
            this.setState({ items: data.items, item: data.item, data }, () => {
                this.canBoKiemDuyet.value(data.item?.canBoKiemDuyet || '');
            });
        } else {
            this.dateRange.value(data.batDau, data.ketThuc);
            this.setState({ items: data.items, item: data.item, data }, () => {
                this.canBoKiemDuyet.value(data.canBoKiemDuyet || '');
            });
            this.ghiChu.value(data.ghiChu);
        }
    }


    render = () => {
        return this.renderModal({
            title: 'Tổng hợp phiếu đăng ký lịch công tác',
            icon: 'fa fa-calendar-check-o',
            size: 'elarge',
            body:
                <div className='row'>
                    <EaseDatePicker.EaseDateRangePicker label='Khoảng thời gian' ref={e => this.dateRange = e} className='col-md-4' disabled={!this.state.data?.id} />
                    {!this.state.data?.id && <FormTextBox className='col-md-4' ref={e => this.soLuong = e} disabled label='Số lượng phiếu đăng ký công tác' />}
                    <FormSelect multiple className='col-md-4' ref={e => this.canBoKiemDuyet = e} label={'Cán bộ kiểm duyệt'} data={SelectAdapter_FwBosses} />
                    <FormTextBox className='col-md-12' label='Ghi chú' ref={e => this.ghiChu = e} />
                </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { create: createLich, update: updateLich };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(ReportModal);


