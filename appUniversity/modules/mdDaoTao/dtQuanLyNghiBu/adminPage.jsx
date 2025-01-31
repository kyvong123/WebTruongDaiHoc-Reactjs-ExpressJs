import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTabs, FormDatePicker } from 'view/component/AdminPage';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { connect } from 'react-redux';
import BaoBuSection from './section/BaoBuSection';
import BaoNghiSection from './section/BaoNghiSection';
import GiangVienBuSection from './section/GiangVienBuSection';

class QuanLyNghiBu extends AdminPage {
    componentDidMount() {
        T.ready('user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });
    }

    handleSearch = () => {
        if (!this.fromTime.value()) {
            T.notify('Vui lòng nhập thời điểm bắt đầu!', 'danger');
        } else if (!this.toTime.value()) {
            T.notify('Vui lòng nhập thời điểm kết thúc!', 'danger');
        } else {
            let filter = {
                fromTime: this.fromTime.value().setHours(0, 0, 0, 0),
                toTime: this.toTime.value().setHours(23, 59, 59, 999),
                loaiHinhDaoTaoFilter: this.loaiHinhDaoTaoFilter.value(),
                khoaSinhVienFilter: this.khoaSinhVienFilter.value(),
                donViFilter: this.donViFilter.value(),
            };
            this.setState({ filter, isSearch: 1 }, () => {
                this.bu.getData();
                this.nghi.getData();
                this.gvBu.getData();
            });
        }
    }

    render() {
        let { filter, isSearch } = this.state;
        return this.renderPage({
            icon: 'fa fa-calendar-check-o',
            title: 'Quản lý nghỉ - bù học phần',
            content: <>
                <div className='tile' style={{ display: isSearch ? '' : 'none' }}>
                    <FormTabs tabs={[
                        { title: 'Quản lý lịch bù', component: <BaoBuSection ref={e => this.bu = e} filter={filter} /> },
                        { title: 'Quản lý lịch nghỉ', component: <BaoNghiSection ref={e => this.nghi = e} filter={filter} handleBu={this.bu} /> },
                        { title: 'Lịch bù giảng viên', component: <GiangVienBuSection ref={e => this.gvBu = e} filter={filter} /> },
                    ]} />
                </div>
            </>,
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormDatePicker type='date' ref={e => this.fromTime = e} label='Từ thời điểm' className='col-md-2' required />
                <FormDatePicker type='date' ref={e => this.toTime = e} label='Đến thời điểm' className='col-md-2' required />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-2' label='Khoá' data={SelectAdapter_DtKhoaDaoTaoFilter('dtQuanLyNghiBu:manage')} allowClear />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-2' label='Loại hình' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtQuanLyNghiBu:manage')} allowClear />
                <FormSelect ref={e => this.donViFilter = e} className='col-md-2' label='Khoa' data={SelectAdapter_DtDmDonVi(1)} allowClear />
                <div className='col-md-2' style={{ textAlign: 'right', margin: 'auto' }}>
                    <button className='btn btn-success' type='button' onClick={e => e && e.preventDefault() || this.handleSearch()}>
                        <i className='fa fa-fw fa-lg fa-search' />Tìm kiếm
                    </button>
                </div>
            </div>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Quản lý nghỉ - bù học phần'
            ],
            backRoute: '/user/dao-tao/edu-schedule'
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(QuanLyNghiBu);
