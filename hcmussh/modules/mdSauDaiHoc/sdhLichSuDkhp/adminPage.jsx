import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, getValue, FormDatePicker } from 'view/component/AdminPage';
import { getSdhDangKyHocPhanPage, getSoLuongSinhVienDky } from 'modules/mdSauDaiHoc/sdhDangKyHocPhan/redux';
import LichSuDKHP from './section/LichSuDKHP';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';


class DashboardDt extends AdminPage {
    state = { filter: {}, filterhp: {}, sortTerm: 'thoiGianDangKy_DESC' }
    check = [];

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.tab.tabClick(null, 0);
            let ngayKetThuc = new Date().setHours(23, 59, 59, 0);
            let ngayBatDau = ngayKetThuc - 259100000;
            this.ngayBatDau.value(ngayBatDau);
            this.ngayKetThuc.value(ngayKetThuc);
            this.setState({
                filter: { ngayBatDau, ngayKetThuc }
            }, () => this.GetDashboard());
        });
    }

    GetDashboard = () => {
        this.list.getLichSu();
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

        T.handleDownload(`/api/sdh/lich-su-dang-ky/download?ngayBatDau=${ngayBatDau}&ngayKetThuc=${ngayKetThuc}`,
            `Lich_su_dang_ky_hoc_phan_tu_${ngayBD}_den_${ngayKT}.xlsx`);
    }

    render() {
        return this.renderPage({
            title: 'Lịch sử đăng ký học phần',
            icon: 'fa fa-tachometer',
            backRoute: '/user/sau-dai-hoc/',
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
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>, 'Quản lý lịch sử học phần'
            ],
            content: <div>
                <>
                    <FormTabs ref={e => this.tab = e} tabs={[
                        { title: 'Lịch sử đăng ký học phần', component: <div className='tile'><LichSuDKHP filter={this.state.filter} ref={e => this.list = e} /></div> },
                    ]} />
                </>
            </div>,
            buttons: { icon: 'fa-print', tooltip: 'Export', className: 'btn btn-success', onClick: e => this.downloadExcel(e) },

        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhLichSuDkhp: state.sdh.sdhLichSuDkhp });
const mapActionsToProps = {
    getSdhDangKyHocPhanPage,
    getSoLuongSinhVienDky, getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DashboardDt);
