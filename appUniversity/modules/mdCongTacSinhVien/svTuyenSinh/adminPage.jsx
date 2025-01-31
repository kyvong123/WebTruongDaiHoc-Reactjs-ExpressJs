import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import UploadDssv from './component/UploadDssvTuyenSinh';
import { multiAddDssvAdmin } from './redux';


class AdminStudentsTuyenSinhPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC', selected: [], filterDotChinhSua: {} };
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.clearSearchBox();
        });
    }

    render() {
        return this.renderPage({
            title: 'Upload danh sách tuyển sinh CQ, CLC',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh sách sinh viên'
            ],
            content: <>
                <FormTabs
                    tabs={[
                        {
                            title: 'Upload sinh viên', component: <>
                                <UploadDssv multiAddDssvAdmin={this.props.multiAddDssvAdmin} />
                            </>
                        }
                    ]}
                />
                {/* <AdminBhytModal ref={e => this.bhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} /> */}
                {/* <LoginToTestModal ref={e => this.loginModal = e} loginStudentForTest={this.props.loginStudentForTest} /> */}
            </>
            ,
            backRoute: '/user/ctsv',
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { multiAddDssvAdmin };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsTuyenSinhPage);