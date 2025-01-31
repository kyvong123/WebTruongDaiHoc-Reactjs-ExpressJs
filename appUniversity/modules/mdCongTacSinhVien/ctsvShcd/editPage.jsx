import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { getDataCtsvShcd, downloadExcelCtsvShcd } from './redux/shcdRedux';
import { setShcdDiemDanh } from './redux/shcdDiemDanhRedux';
import './style.scss';

import LichShcd from './components/LichShcd';
class AdminShcdDetailPage extends AdminPage {
    state = { listGuestFilted: [], editIndex: null }
    boardFilter = {}

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            const route = T.routeMatcher('/user/ctsv/shcd/edit/:id'), id = route.parse(window.location.pathname).id;
            this.setState({ id });
            this.getData();
        });
    }

    getData = (done) => {
        this.props.getDataCtsvShcd(this.state.id, done);
    }

    render() {
        const permission = this.getUserPermission('ctsvShcd');
        const { item = {} } = this.props.ctsvShcd || {};
        return this.renderPage({
            title: <span>
                Chi tiết sinh hoạt công dân <br />
            </span>,
            subTitle: this.props.ctsvShcd?.item ? <p className='mt-1'><b>Tiêu đề: </b>{this.props.ctsvShcd.item.ten || ''}</p> : '',
            icon: 'fa fa-users',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                <Link key={0} to='/user/ctsv/shcd'>Danh sách Kế hoạch SHCD</Link>,
                'Chi tiết sinh hoạt công dân'
            ],
            backRoute: '/user/ctsv/shcd',
            content: <>
                <LichShcd getData={this.getData} id={this.state.id} setShcdDiemDanh={this.props.setShcdDiemDanh} permission={permission} />
            </>
            ,
            onExport: () => this.props.downloadExcelCtsvShcd(item?.id)
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvShcd: state.ctsv.ctsvShcd });
const mapActionsToProps = { getDataCtsvShcd, downloadExcelCtsvShcd, setShcdDiemDanh };

export default connect(mapStateToProps, mapActionsToProps)(AdminShcdDetailPage);