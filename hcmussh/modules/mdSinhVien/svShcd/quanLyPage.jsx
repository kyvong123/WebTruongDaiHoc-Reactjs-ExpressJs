import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { getDataCtsvShcd, setShcdDiemDanh } from './redux';
import LichShcd from 'modules/mdCongTacSinhVien/ctsvShcd/components/LichShcd';
import T from 'view/js/common';

class SinhVienShcdPage extends AdminPage {
    componentDidMount() {
        T.ready('/user', () => {
            const route = T.routeMatcher('/user/student/quan-ly-shcd/:id'), id = route.parse(window.location.pathname).id;
            this.setState({ id });
            this.getData();
        });
    }

    getData = () => {
        this.props.getDataCtsvShcd(this.state.id, () => { });
    }

    render() {
        const permission = this.getUserPermission('quanLyShcd');
        return this.renderPage({
            title: <span>
                Quản lý sinh hoạt công dân <br />
            </span>,
            icon: 'fa fa-users',
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Quản lý sinh hoạt công dân'
            ],
            backRoute: '/user/student/quan-ly-shcd/',
            content: <>
                <LichShcd getData={this.getData} id={this.state.id} setShcdDiemDanh={this.props.setShcdDiemDanh} permission={permission} />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svShcd: state.student.svShcd });
const mapActionsToProps = {
    getDataCtsvShcd, setShcdDiemDanh
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienShcdPage);