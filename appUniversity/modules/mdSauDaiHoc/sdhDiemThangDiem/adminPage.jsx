import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import SdhThangDiemPage from './thangDiemPage';
import SdhThangDiemKhoaHvPage from './thangDiemKhoaHv';

class SdhThangDiemAdminPage extends AdminPage {
    updateThangDiemKhoaHv = () => {
        this.diemKhoaHv?.getData();
    }
    render() {
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Thang điểm - Xếp loại',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/quan-ly-diem'>Điểm</Link>,
                'Thang điểm - Xếp loại'
            ],
            content: <FormTabs tabs={[
                {
                    title: 'Danh sách thang điểm',
                    component: <SdhThangDiemPage updateThangDiemKhoaHv={this.updateThangDiemKhoaHv} />
                },
                {
                    title: 'Thang điểm khóa học viên',
                    component: <SdhThangDiemKhoaHvPage ref={e => this.diemKhoaHv = e} />
                },
            ]} ref={e => this.editTab = e} />,
            backRoute: '/user/sau-dai-hoc/quan-ly-diem',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(SdhThangDiemAdminPage);