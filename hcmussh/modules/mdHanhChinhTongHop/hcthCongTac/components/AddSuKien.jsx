import React from 'react';
import { connect } from 'react-redux';
import { getUserCongTacPage } from '../redux/congTac';
import { BaseCongTacModal } from './BaseCongTac';
import { CongTacListComponent } from './CongTacList';
import { addSuKien } from '../redux/congTac';

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });

class _CongTacList extends CongTacListComponent {

    getButtons = (item) => {
        return <>
            <button className='btn btn-success' type='button' onClick={() => {
                this.props.addSuKien(this.props.ticketId, [item.id], this.props.reload);
            }}>
                <i className='fa fa-plus' />
            </button>
        </>;
    }

    render() {
        return <div className='tile-body row'>
            <div className='col-md-12 d-flex justify-content-between align-items-center mb-2' >
                <p className='tile-title'> <i className='fa fa-list' />Danh sách lịch công tác/làm việc</p>
                {this.getLichPermission().isEditable() && <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.congTacModal.show()}><i className='fa fa-plus' />Tạo</button>}
            </div>
            <div className='col-md-12'>
                {this.renderShortTable()}
            </div>
        </div>;
    }
}

const CongTacList = connect(stateToProps, { addSuKien }, false, { forwardRef: true })(_CongTacList);

class _AddSuKien extends BaseCongTacModal {
    refDict = {}

    componentDidMount() {
        this.onHidden(() => {
            this.props.getData && this.props.getData();
        });
    }

    onShow = (data) => {
        this.setState({ batDau: data.batDau, ketThuc: data.ketThuc, }, () => {
            this.getPage();
        });
    }

    getPage = () => {
        const { batDau, ketThuc } = this.state;
        this.props.getUserCongTacPage(1, 500, '', { ...this.state.filter, batDau: batDau?.getTime(), ketThuc: ketThuc?.getTime(), isOrphan: 1, isCreator: 1 }, (page) => this.setState({ items: page.list.map(item => ({ ...item, thanhPhan: T.parse(item.thanhPhan) })) }));
    }


    render = () => {
        return this.renderModal({
            title: 'Danh sách sự kiện không lên lịch',
            icon: 'fa fa-calendar-check-o',
            size: 'elarge',
            body:
                <div className='row'>
                    <div className="col-md-12">
                        <CongTacList ticketId={this.props.ticketId} hideTrangThai reload={this.getPage} canEdit={false} shcc={this.getShcc()} list={this.state.items} />
                    </div>
                </div>
        });
    }
}

const actionsToProps = { getUserCongTacPage };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(_AddSuKien);


