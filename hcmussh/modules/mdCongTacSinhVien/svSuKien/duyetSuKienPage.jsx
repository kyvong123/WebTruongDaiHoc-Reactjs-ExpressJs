import React from 'react';
import { AdminPage } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import TableSuKien from './component/tableSuKien';
import { Link } from 'react-router-dom';

class DuyetSuKienPage extends AdminPage {

    render() {
        const permission = this.getUserPermission('ctsvSuKien', ['duyet', 'manage', 'read']);
        const canDuyet = permission.duyet;
        const canCreate = permission.write;
        const isDuyetPage = true;
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Duyệt Sự Kiện',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Sự Kiện'
            ],
            content: <TableSuKien canDuyet={canDuyet} canCreate={canCreate} isDuyetPage={isDuyetPage} />,
            backRoute: '/user/ctsv/su-kien'
        });
    }
}
const mapStateToProps = (state) => ({ system: state.system, svSuKien: state.ctsv.svSuKien });
const mapActionsToProps = {
};
export default connect(mapStateToProps, mapActionsToProps)(DuyetSuKienPage);
