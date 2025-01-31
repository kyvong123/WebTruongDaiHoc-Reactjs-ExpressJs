import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import RectorsPage from './rectorsPage';
import StaffEditPage from './staffEditPage';
class EditPage extends AdminPage {

    render() {
        const permissions = this.getCurrentPermissions();
        if (permissions.includes('rectors:login')) {
            return <RectorsPage />;
        } else {
            return <StaffEditPage />;
        }
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(EditPage);
