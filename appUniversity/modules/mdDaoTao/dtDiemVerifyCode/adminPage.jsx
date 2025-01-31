import { connect } from 'react-redux';
import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import FolderVerifyPage from './folderVerifyPage';
import CodeFilePage from './codeFilePage';

class adminVerifyPage extends AdminPage {

    render() {
        return this.renderPage({
            icon: 'fa fa-codepen',
            title: 'Xác thực mã',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Quản lý điểm</Link>,
                'Xác thực mã'
            ],
            content: <>
                <FormTabs tabs={[
                    { title: 'Danh sách mã', component: <CodeFilePage /> },
                    { title: 'Gói mã', component: <FolderVerifyPage /> },
                ]} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
        });
    }
}

const mapStateToProps = state => ({ state: state.system, verifyReducer: state.daoTao.verifyReducer });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(adminVerifyPage);