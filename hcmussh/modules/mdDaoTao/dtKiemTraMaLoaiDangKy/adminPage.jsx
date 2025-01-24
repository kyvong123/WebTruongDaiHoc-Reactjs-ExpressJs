import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import SectionEditSinhVien from './section/SectionEditSinhVien';
import SectionEditHocPhan from './section/SectionEditHocPhan';
import SectionEditLop from './section/SectionEditLop';


class DtKiemTraMaLoaiDangKyPage extends AdminPage {

    componentDidMount() {
        this.tab.tabClick(null, 0);
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-check-square-o',
            title: 'Kiểm tra mã loại đăng ký',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Kiểm tra mã loại đăng ký'
            ],
            content: <>
                <FormTabs ref={e => this.tab = e} tabs={[
                    {
                        title: 'Cập nhật theo sinh viên',
                        component: <SectionEditSinhVien ref={e => this.sinhVien = e} history={this.props.history} />
                    },
                    {
                        title: 'Cập nhật lớp học phần',
                        component: <SectionEditHocPhan ref={e => this.sinhVien = e} history={this.props.history} />
                    },
                    {
                        title: 'Cập nhật lớp sinh viên',
                        component: <SectionEditLop ref={e => this.sinhVien = e} history={this.props.history} />
                    }
                ]} />
            </>,
            backRoute: '/user/dao-tao/edu-schedule',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtKiemTraMaLoaiDangKy: state.daoTao.dtKiemTraMaLoaiDangKy });
const mapActionsToProps = { getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(DtKiemTraMaLoaiDangKyPage);
