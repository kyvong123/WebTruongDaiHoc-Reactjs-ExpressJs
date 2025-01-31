import React from 'react';
import { AdminPage, FormCheckbox } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import TableSuKien from './component/tableSuKien';
import { Link } from 'react-router-dom';

class AdminSuKienPage extends AdminPage {
    constructor(props) {
        super(props);
        this.state = {
            isFilter: false
        };
    }

    handleCheckboxChange = () => {
        this.setState({ isFilter: event.target.checked });
    }

    render() {
        const permission = this.getUserPermission('ctsvSuKien', ['write', 'duyet']);
        const canDuyet = permission.duyet,
            canCreate = permission.write;
        const { isFilter } = this.state;
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Danh Sách Sự Kiện',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Sự Kiện'
            ],
            content:
                <>
                    <FormCheckbox label='Sự kiện của tôi' onChange={this.handleCheckboxChange} style={{ marginBottom: '0' }} />
                    <TableSuKien canDuyet={canDuyet} isFilter={isFilter} canCreate={canCreate} />
                </>,
            backRoute: '/user/ctsv/su-kien',
            // onCreate: (e) => e.preventDefault() || this.props.history.push('/user/ctsv/danh-sach-su-kien/edit/new')
            onCreate: canCreate ? (e) => e.preventDefault() || this.props.history.push('/user/ctsv/danh-sach-su-kien/edit/new') : undefined
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, svSuKien: state.ctsv.svSuKien });
const mapActionsToProps = {};

export default connect(mapStateToProps, mapActionsToProps)(AdminSuKienPage);
