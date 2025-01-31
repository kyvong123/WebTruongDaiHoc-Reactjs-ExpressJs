import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import { updateStaffUser, userGetStaff } from 'modules/mdTccb/tccbCanBo/redux';
import ProfileCommon from './componentNotStaff';
import Loading from 'view/component/Loading';
import SubMenusPage from 'view/component/SubMenusPage';

const ttChoNhapHoc = 11;

class ProfileCanBo extends AdminPage {
    state = { isHCMUSSH: false, isLoad: true };

    componentDidMount() {
        T.ready('/user', () => {
            if (this.props.system && this.props.system.user) {
                const user = this.props.system.user,
                    permissions = user.permissions;
                if (permissions.includes('student:pending') && user.isStudent == 1) {
                    window.location = '/user/student-enroll';
                }
                if ((user.isStaff != 1 && user.isStudent != 1 && user.isStudentSdh != 1 && user.isThiSinhSdh != 1) || user.isUnit == 1) {
                    this.setState({ isLoad: false });
                    this.profileCommon.value(user);
                } else this.setState({ isHCMUSSH: true }, () => {
                    if (user.isStudent == 1 && user.data.tinhTrang == ttChoNhapHoc) {
                        this.props.history.push('/user/profile-student');
                    }
                });
            }
        });
    }

    render = () => {
        return this.state.isHCMUSSH ? <SubMenusPage menuLink="/user" menuKey={1000} headerIcon="fa-user" /> : this.renderPage({
            icon: 'fa fa-address-card-o',
            title: 'Thông tin cá nhân',
            content:
                <>
                    {this.state.isLoad && <Loading />}
                    <ProfileCommon ref={e => this.profileCommon = e} />
                </>
        });
    };
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    userGetStaff, updateStaffUser
};
export default connect(mapStateToProps, mapActionsToProps)(ProfileCanBo);
