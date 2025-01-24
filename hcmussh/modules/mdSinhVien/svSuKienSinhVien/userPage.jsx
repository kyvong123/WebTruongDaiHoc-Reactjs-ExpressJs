import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { } from './redux';
import T from 'view/js/common';
import TableSuKien from 'modules/mdCongTacSinhVien/svSuKien/component/tableSuKien';

class SvSuKienPage extends AdminPage {
    componentDidMount() {
        T.ready('/user');
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Danh Sách Sự Kiện',
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Danh sách sự kiện'
            ],
            backRoute: '/user',
            content: <TableSuKien isStudent={true} />
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svSuKien: state.student.svSuKien });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps)(SvSuKienPage);