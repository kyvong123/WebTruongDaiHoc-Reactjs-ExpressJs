import React from 'react';
import { connect } from 'react-redux';
import { traCuuPhongHop } from '../redux/phongHop';
import { FormDatePicker } from 'view/component/AdminPage';
import { FormCheckbox } from '../../../../view/component/AdminPage';
import { BaseCongTacModal } from './BaseCongTac';

class ChonPhongHopModal extends BaseCongTacModal {
    state = { isLoading: false, items: [] }
    phongHopRef = {}

    onSubmit = () => {
        const value = this.getValue();
        if (value)
            this.hide();
    }

    onHide = () => {
        this.state.onHidden && this.state.onHidden();
    }

    setOnHiddenFunction = (func) => {
        this.setState({ onHidden: func });
    }

    getValue = () => {
        const data = {};
        data.batDau = this.ketThuc.value() ? this.batDau.value().getTime() : '';
        data.ketThuc = this.ketThuc.value() ? this.ketThuc.value().getTime() : '';
        data.phongHop = this.state.items.reduce((total, current) => {
            if (this.phongHopRef[current.ma].value())
                return current.ma;
            return total;
        }, null);
        if (!data.batDau || !data.ketThuc || !data.phongHop) {
            T.notify('Dữ liệu phòng họp không hợp lệ', 'danger');
            return;
        }
        return data;
    }

    onShow = (data) => {
        this.setState({ items: [], datekey: Date.now() }, () => {
            this.batDau.value(data.batDau || '');
            this.ketThuc.value(data.ketThuc || '');
            setTimeout(() => this.lookup(), 500);
        });
    }

    getModalDom = () => {
        return $(this.modal);
    }

    partialShow = () => {
        $(this.modal).modal('show');
    }

    partialHide = () => {
        $(this.modal).modal('hide');
    }

    onChangeOnline = (value) => {
        this.setState({ isOnline: value }, () => {
            if (value) {
                this.duongDan.value(this.state.duongDan || '');
            } else {
                this.phongHop.value(this.state.phongHop || '');
            }
        });
    }

    lookup = () => {
        const data = {};
        data.startAt = this.ketThuc.value() ? this.batDau.value().getTime() : '';
        data.endAt = this.ketThuc.value() ? this.ketThuc.value().getTime() : '';
        if (!data.startAt || !data.endAt) {
            return T.notify('Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc', 'danger');
        }
        this.setState({ isLoading: true }, () => {
            this.props.traCuuPhongHop(data, (items) => {
                this.setState({ items });
            }, () => this.setState({ isLoading: false }));
        });
    }

    onChangePhong = (ma) => {
        this.state.items.forEach(item => {
            if (item.ma != ma)
                this.phongHopRef[item.ma].value(false);
        });
    }

    renderPhongHop = () => {
        if (this.state.items.length)
            return <div className='list-group text-dark'>
                {this.state.items.map((item) => <a href='#' className='list-group-item list-group-item-action' key={item.ma}><FormCheckbox ref={e => this.phongHopRef[item.ma] = e} label={`${item.ten}${item.sucChua ? ` (${item.sucChua} nguời)` : ''}`} onChange={() => this.onChangePhong(item.ma)} /></a>)}
            </div>;
        else
            return <span className='text-muted'>Không có phòng hợp lệ</span>;
    }

    render = () => {
        return this.renderModal({
            isLoading: this.state.isLoading,
            title: 'Tra cứu phòng họp',
            icon: 'fa fa-calendar-check-o',
            size: 'elarge',
            body: <div className='row'>
                <div className='col-md-12'>
                    Bạn có thể xem danh các phòng họp được đăng ký tại <a href='#' onClick={(e) => {
                        e.preventDefault();
                        window.open('/user/vpdt/phong-hop/tra-cuu', '_blank');
                    }}>đây</a>
                </div>
                <FormDatePicker disabled={this.state.items.length} required className='col-md-6' type='time-mask' label='Thời gian bắt đầu' ref={e => this.batDau = e} />
                <FormDatePicker disabled={this.state.items.length} required className='col-md-6' type='time-mask' label='Dự kiến kết thúc' ref={e => this.ketThuc = e} />
                <div className='col-md-12 d-flex justify-content-end align-items-center'>
                    {!!this.state.items.length && <button className='btn btn-danger' onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.setState({ items: [] });
                    }}><i className='fa fa-lg fa-times' />Tra cứu lại</button>}
                    {!this.state.items.length && <button className='btn btn-success' onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.lookup();
                    }}><i className='fa fa-lg fa-search' />Tra cứu</button>}
                </div>
                <div className='col-md-12 pt-1'>
                    {this.renderPhongHop()}
                </div>
            </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { traCuuPhongHop };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(ChonPhongHopModal);


