import { SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { FormSelect, FormTextBox } from 'view/component/AdminPage';
import { updateTicket, createTicket } from '../redux/congTac';
import { BaseCongTacModal } from './BaseCongTac';
import * as EasePicker from './EaseDatePicker';
import moment from 'moment';

class HcthCongTacTicketModal extends BaseCongTacModal {

    onSubmit = () => {
        const [batDau, ketThuc] = this.dateRange.value();
        const data = {
            batDau: batDau?.getTime(), ketThuc: ketThuc?.getTime(),
            donVi: this.donVi.value(),
            ghiChu: this.ghiChu.value(),
        };

        if (!data.batDau) {
            return T.notify('Thoi gian bat dau trong', 'danger');
        } else if (!data.ketThuc) {
            return T.notify('Thoi gian ket thuc trong', 'danger');
        }
        else if (data.batDau > data.ketThuc) {
            return T.notify('Thời gian bắt đầu sau thời gian kết thúc', 'danger');
        }
        if (this.state.item) {
            if (this.state.minDate && data.batDau > this.state.minDate) {
                return T.notify('Thời gian bắt đầu phải trước ' + moment(this.state.minDate).format('DD/MM/YYYY'), 'danger');
            } else if (this.state.maxDate && data.ketThuc < this.state.maxDate) {
                return T.notify('Thời gian kết thúc phải sau ' + moment(this.state.minDate).format('DD/MM/YYYY'), 'danger');
            }
        }
        // else if (data.batDau > )
        if (!this.state.item)
            this.props.create(data, (item) => {
                window.open(`/user/vpdt/cong-tac/dang-ky/${item.id}?backRoute=${window.location.pathname}`, '_blank');
                window.location.reload();
            });
        else {
            this.props.update(this.state.item.id, data, () => window.location.reload());
        }
    }

    onShow = (data) => {
        if (!data) {
            this.setState({ item: null }, (() => {
                this.dateRange.value(Date.now(), Date.now() + 7 * 24 * 3600 * 1000);
                this.donVi.value(this.getDonViQuanLy()[0]);
            }));
        }
        else {
            let items = data.congTacItems, minDate, maxDate;
            if (items.length) {
                items.sort((a, b) => a.batDau - b.batDau);
                minDate = new Date(items[0].batDau).setHours(0, 0, 0, 0);
                items.sort((a, b) => b.ketThuc - a.ketThuc);
                maxDate = new Date(items[0].ketThuc).setHours(23, 59, 59, 999);
            }
            this.setState({ item: data, isOnline: data.isOnline, minDate, maxDate }, () => {
                this.donVi.value(data.donVi);
                this.dateRange.value(data.batDau, data.ketThuc);
                this.ghiChu.value(data.ghiChu);
            });
        }
    }


    render = () => {
        return this.renderModal({
            title: 'Phiếu đăng ký lịch công tác',
            icon: 'fa fa-calendar-check-o',
            size: 'elarge',
            body:
                <div className='row'>
                    <EasePicker.EaseDateRangePicker ref={e => this.dateRange = e} placeholder={'Khoảng thời gian'} inputClassName='m-0 p-0 pl-2' className='col-md-8' middleWare={(start, end) => {
                        start.setHours(0, 0, 0, 0);
                        end.setHours(23, 59, 59, 999);
                        return [start, end];
                    }} label='Thời gian đăng ký' />
                    <FormSelect required className='col-md-4' label='Đơn vị đăng ký' data={SelectAdapter_DmDonViFilter(this.getDonViQuanLy())} ref={e => this.donVi = e} />
                    <FormTextBox className='col-md-12' label='Ghi chú' ref={e => this.ghiChu = e} />
                </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { create: createTicket, update: updateTicket };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(HcthCongTacTicketModal);


