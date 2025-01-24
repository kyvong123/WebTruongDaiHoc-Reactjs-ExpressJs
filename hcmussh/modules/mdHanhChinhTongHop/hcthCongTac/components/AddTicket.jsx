import React from 'react';
import { connect } from 'react-redux';
import { getCongTacTicketPage } from '../redux/congTac';
import { BaseCongTacModal } from './BaseCongTac';
import TicketPage from './TicketPage';
import { addTicketToLich } from '../redux/lichCongTac';

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });

class _TicketList extends TicketPage {

    componentDidMount() { }

    getItemButtons = (item) => {
        return <>
            <button className='btn btn-success' type='button' onClick={() => {
                addTicketToLich(this.props.lichId, item.id, () => {
                    this.getPage();
                    this.props.setFlag(true);
                })();
            }}>
                <i className='fa fa-plus' />
            </button>
        </>;
    }

    getPage = (done) => {
        const { batDau, ketThuc } = this.props;
        getCongTacTicketPage(1, 500, '', { trangThai: 'DA_NHAN', batDau: batDau?.getTime(), ketThuc: ketThuc?.getTime() }, (page) => this.setState({ list: page.list }, () => done && done(page)))(() => null);
    }

    render() {
        return this.renderTicketTable(this.state.list, 1, 500);
    }
}

const TicketList = connect(stateToProps, {}, false, { forwardRef: true })(_TicketList);

class _AddTicket extends BaseCongTacModal {
    refDict = {}
    state = { flag: false }


    setFlag = (flag) => this.setState({ flag });

    componentDidMount() {
        this.onHidden(() => {
            if (this.state.flag) {
                window.location.reload();
            }
        });
    }

    onShow = (data) => {
        this.setState({ batDau: data.batDau, ketThuc: data.ketThuc, flag: false }, () => {
            this.ticketList?.getPage();
        });
    }


    render = () => {
        return this.renderModal({
            title: 'Phiếu đăng ký lịch công tác',
            icon: 'fa fa-calendar-check-o',
            size: 'elarge',
            body:
                <div className='row'>
                    <div className="col-md-12">
                        <TicketList setFlag={this.setFlag} ref={e => this.ticketList = e} lichId={this.props.lichId} shcc={this.getShcc()} />
                    </div>
                </div>
        });
    }
}

export default connect(stateToProps, {}, false, { forwardRef: true })(_AddTicket);


