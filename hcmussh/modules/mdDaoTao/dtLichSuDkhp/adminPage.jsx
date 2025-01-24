import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, getValue, FormDatePicker } from 'view/component/AdminPage';
import { getDtDangKyHocPhanPage, getSoLuongSinhVienDky } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { getCauHinh } from '../dtCauHinhDotDkhp/redux';
import LichSuDKHP from './section/LichSuDKHP';
import LichSuMoi from './section/LichSuMoi';
import LichSuHuy from './section/LichSuHuy';
import LichSuChuyen from './section/LichSuChuyen';
import LichSuHoanTac from './section/LichSuHoanTac';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';


class DashboardDt extends AdminPage {
    state = { filter: {}, filterhp: {}, sortTerm: 'thoiGianDangKy_DESC' }
    check = [];

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.tab.tabClick(null, 0);
            let ngayKetThuc = new Date().setHours(23, 59, 59, 0);
            let ngayBatDau = new Date().setHours(0, 0, 0, 0);
            this.ngayBatDau.value(ngayBatDau);
            this.ngayKetThuc.value(ngayKetThuc);
            this.setState({
                filter: { ngayBatDau, ngayKetThuc }
            }, () => this.GetDashboard());
        });
    }

    GetDashboard = () => {
        this.list.getLichSu();
        this.listMoi.getLichSu();
        this.listHuy.getLichSu();
        this.listChuyen.getLichSu();
        this.listHoanTac.getLichSu();
    }

    getFullDateTime = (value) => {
        if (value == null) return;
        const d = new Date(value);
        const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
        const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
        const year = d.getFullYear();
        return `${date}-${month}-${year}`;
    }

    downloadExcel = (e) => {
        e.preventDefault();
        let { ngayBatDau, ngayKetThuc } = this.state.filter,
            ngayBD = this.getFullDateTime(ngayBatDau),
            ngayKT = this.getFullDateTime(ngayKetThuc);

        T.handleDownload(`/api/dt/lich-su-dang-ky/download?ngayBatDau=${ngayBatDau}&ngayKetThuc=${ngayKetThuc}`,
            `Lich_su_dang_ky_hoc_phan_tu_${ngayBD}_den_${ngayKT}.xlsx`);
    }

    render() {
        return this.renderPage({
            title: 'Lịch sử đăng ký học phần',
            icon: 'fa fa-history',
            backRoute: '/user/dao-tao/edu-schedule',
            header: <>
                <div className='d-flex justify-content-right align-items-center'>
                    <FormDatePicker type='time' ref={e => this.ngayBatDau = e} className='mr-3' label='Từ ngày' />
                    <FormDatePicker type='time' ref={e => this.ngayKetThuc = e} className='mr-3' label='Đến ngày' />
                    <button className='btn btn-info ' onClick={e => {
                        e.preventDefault();
                        let ngayBatDau = getValue(this.ngayBatDau).getTime();
                        let ngayKetThuc = getValue(this.ngayKetThuc).getTime();
                        if (!ngayBatDau || !ngayKetThuc) T.notify('Khoảng thời gian trống', 'danger');
                        else if (ngayKetThuc <= ngayBatDau) T.notify('Khoảng thời gian không hợp lệ', 'danger');
                        else if ((ngayKetThuc - ngayBatDau) > 31536000000) T.notify('Vượt khoảng thời gian cho phép: 365 ngày', 'danger');
                        else {
                            this.setState({
                                filter: {
                                    ngayBatDau: ngayBatDau,
                                    ngayKetThuc: ngayKetThuc
                                }
                            }, () => this.GetDashboard());
                        }
                    }}>
                        <i className='fa fa-filter'></i>
                    </button>
                </div>
            </>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Lịch sử đăng ký học phần'
            ],
            content: <div>
                <>
                    <FormTabs ref={e => this.tab = e} tabs={[
                        { title: 'Lịch sử đăng ký học phần', component: <div className='tile'><LichSuDKHP filter={this.state.filter} ref={e => this.list = e} /></div> },
                        { title: 'Lịch sử đăng ký mới', component: <div className='tile'><LichSuMoi filter={this.state.filter} ref={e => this.listMoi = e} /></div> },
                        { title: 'Lịch sử hủy học phần', component: <div className='tile'><LichSuHuy filter={this.state.filter} ref={e => this.listHuy = e} /></div> },
                        { title: 'Lịch sử chuyển học phần', component: <div className='tile'><LichSuChuyen filter={this.state.filter} ref={e => this.listChuyen = e} /></div> },
                        { title: 'Lịch sử hoàn tác', component: <div className='tile'><LichSuHoanTac filter={this.state.filter} ref={e => this.listHoanTac = e} /></div> },
                    ]} />
                </>
            </div>,
            buttons: { icon: 'fa-print', tooltip: 'Export', className: 'btn btn-success', onClick: e => this.downloadExcel(e) },

        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtLichSuDkhp: state.daoTao.dtLichSuDkhp });
const mapActionsToProps = {
    getDtDangKyHocPhanPage, getCauHinh, getSoLuongSinhVienDky, getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DashboardDt);
