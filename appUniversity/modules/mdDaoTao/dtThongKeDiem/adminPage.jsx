import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';

import { getDtAssignRole } from 'modules/mdDaoTao/dtAssignRole/redux';

import SectionThongKeAvr from './section/SectionThongKeAvr';
import SectionThongKeDiemDat from './section/SectionThongKeDiemDat';
import SectionThongKeDiemTongHop from './section/SectionThongKeDiemTongHop';
class ThongKeDiem extends AdminPage {
    state = { role: {} }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const { user } = this.props.system;
            let { maDonVi } = user,
                isPhongDaoTao = false;
            if (user.permissions.includes('quanLyDaoTao:DaiHoc')) isPhongDaoTao = true;
            this.props.getDtAssignRole(user.shcc, (value) => {

                let khoa = [maDonVi],
                    lhdt = [null],
                    khoaSv = [null];
                if (value && value.loaiHinhDaoTao) lhdt = value.loaiHinhDaoTao.split(',');
                if (value && value.khoaSinhVien) khoaSv = value.khoaSinhVien.split(',');

                this.setState({
                    role: {
                        khoa: khoa[0],
                        loaiHinhDaoTao: lhdt[0],
                        khoaSinhVien: khoaSv[0],
                        isPhongDaoTao
                    }
                }, () => {
                    this.tab.tabClick(null, 0);
                    this.setData();
                });
            });
        });
    }

    setData = () => {
        const perm = this.getUserPermission('dtThongKeDiem', ['avr', 'manage']);

        if (perm.manage || perm.avr) this.thongKeAvr.setData();
        if (perm.manage) this.thongKeDiemDat.setData();
        if (perm.manage) this.thongKeDiemTongHop.setData();
    }

    downloadExcel = (e) => {
        let tabIndex = this.tab.selectedTabIndex();

        if (tabIndex == 0) this.thongKeAvr.downloadExcel(e);
        else if (tabIndex == 1) this.thongKeDiemDat.downloadExcel(e);
        else if (tabIndex == 2) this.thongKeDiemTongHop.downloadExcel(e);
    }

    render() {
        const perm = this.getUserPermission('dtThongKeDiem', ['avr', 'manage']);
        const tabs = [];

        if (perm.manage || perm.avr) tabs.push({
            title: 'Thống kê điểm trung bình',
            component: <SectionThongKeAvr ref={e => this.thongKeAvr = e} role={this.state.role} />
        });

        if (perm.manage) tabs.push({
            title: 'Thống kê điểm đạt',
            component: <SectionThongKeDiemDat ref={e => this.thongKeDiemDat = e} role={this.state.role} />
        });

        if (perm.manage) tabs.push({
            title: 'Thống kê điểm tổng hợp',
            component: <SectionThongKeDiemTongHop ref={e => this.thongKeDiemTongHop = e} role={this.state.role} />
        });

        return this.renderPage({
            title: 'Thống kê điểm',
            icon: 'fa fa-table',
            backRoute: '/user/dao-tao/grade-manage',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Quản lý điểm</Link>,
                'Thống kê điểm'
            ],
            content: <>
                <FormTabs ref={e => this.tab = e} tabs={tabs} />
            </>,
            buttons: { icon: 'fa-print', tooltip: 'Export', className: 'btn btn-success', onClick: e => this.downloadExcel(e) },

        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThongKeDiem: state.daoTao.dtThongKeDiem });
const mapActionsToProps = {
    getDtAssignRole
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ThongKeDiem);
