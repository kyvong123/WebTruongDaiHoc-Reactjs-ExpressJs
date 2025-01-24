import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTabs, FormDatePicker } from 'view/component/AdminPage';

import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTaoFilter } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

import SectionTongQuanDangKy from './section/SectionTongQuanDangKy';
import SectionDanhSachDkMonHoc from './section/SectionDanhSachDkMonHoc';
import SectionSinhVienKhongDangKy from './section/SectionSinhVienKhongDangKy';
import SectionDsDangKyTinChi from './section/SectionDsDangKyTinChi';

class DashboardDt extends AdminPage {
    state = { filter: {}, khoaDaoTao: null, nganhDaoTao: null }
    check = [];

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.tab.tabClick(null, 0);
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester,
                    ngayKetThuc = new Date().setHours(23, 59, 59, 0),
                    ngayBatDau = new Date().setHours(0, 0, 0, 0);

                let khoaSinhVien = Array.from({ length: 5 }, (_, i) => `${parseInt(namHoc.split(' - ')[0]) - i}`);
                khoaSinhVien = khoaSinhVien.reverse();

                this.setState({
                    filter: { namHoc, hocKy, loaiHinhDaoTao: 'CQ', khoaSinhVien: khoaSinhVien.join(',') },
                    filterNgay: { ngayBatDau, ngayKetThuc }
                }, () => {
                    this.namHoc.value(namHoc);
                    this.hocKy.value(hocKy);
                    this.ngayBatDau.value(ngayBatDau);
                    this.ngayKetThuc.value(ngayKetThuc);
                    this.loaiHinhDaoTao.value('CQ');
                    this.khoaSinhVien.value(khoaSinhVien);
                    this.khoaDaoTao.value('');
                    this.nganhDaoTao.value('');
                    this.lopSinhVien.value('');
                    this.getData(0);
                });
            });
        });
    }

    getData = (value) => {
        this.tongQuan.getData(value);
        this.listStudents.getData(value);
        this.listStudentsNot.getData(value);
        this.listDkMon.getData(value);
    }

    downloadExcel = (e) => {
        let tabIndex = this.tab.selectedTabIndex();

        if (tabIndex == 0) this.tongQuan.downloadExcel(e);
        else if (tabIndex == 1) this.listStudents.downloadExcel(e);
        else if (tabIndex == 2) this.listStudentsNot.downloadExcel(e);
        else if (tabIndex == 3) this.listDkMon.downloadExcel(e);
    }

    render() {
        let { filter, filterNgay } = this.state;

        return this.renderPage({
            title: 'Thống kê đăng ký học phần',
            icon: 'fa fa-window-maximize',
            backRoute: '/user/dao-tao',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Thống kê đăng ký học phần'
            ],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect className='col-md-3' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} label='Năm học' allowClear
                            onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value?.id || '' } }, () => this.getData(0))} />
                        <FormSelect className='col-md-3' ref={e => this.hocKy = e} data={SelectAdapter_DtDmHocKy} label='Học kỳ' allowClear
                            onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value?.id || '' } }, () => this.getData(0))} />

                        <div className='col-md-6' >
                            <div className='row'>
                                <FormDatePicker className='col-md-5' type='time' ref={e => this.ngayBatDau = e} label='Từ ngày'
                                    onChange={value => this.setState({ filterNgay: { ...this.state.filterNgay, ngayBatDau: value.getTime() } })} />
                                <FormDatePicker className='col-md-5' type='time' ref={e => this.ngayKetThuc = e} label='Đến ngày'
                                    onChange={value => this.setState({ filterNgay: { ...this.state.filterNgay, ngayKetThuc: value.getTime() } })} />
                                <div className='col-md-2'>
                                    <div className='rows' style={{ textAlign: 'right' }}>
                                        <Tooltip title='Lọc theo ngày' arrow>
                                            <button className='btn btn-success' onClick={e => {
                                                e.preventDefault();
                                                let { ngayBatDau, ngayKetThuc } = filterNgay;
                                                if (!ngayBatDau || !ngayKetThuc) T.notify('Khoảng thời gian trống', 'danger');
                                                else if (ngayKetThuc <= ngayBatDau) T.notify('Khoảng thời gian không hợp lệ', 'danger');
                                                else if ((ngayKetThuc - ngayBatDau) > 31536000000) T.notify('Vượt khoảng thời gian cho phép: 365 ngày', 'danger');
                                                else this.getData(1);
                                            }}>
                                                <i className='fa fa-filter' />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='row'>
                        <FormSelect className='col-md-2' ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo'
                            onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTao: value.id } }, () => this.getData(0))} />
                        <FormSelect className='col-md-4' ref={e => this.khoaSinhVien = e} data={SelectAdapter_DtKhoaDaoTao} label='Khóa sinh viên' multiple
                            onChange={() => {
                                let khoaSinhVien = this.khoaSinhVien.value();
                                khoaSinhVien = khoaSinhVien.sort().join(',');
                                this.setState({ filter: { ...this.state.filter, khoaSinhVien: khoaSinhVien } }, () => this.getData(0));
                            }} />
                        <FormSelect className='col-md-2' ref={(e) => (this.khoaDaoTao = e)} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa đào tạo'
                            onChange={value => this.setState({ filter: { ...this.state.filter, khoaDaoTao: value?.id || '', nganhDaoTao: '', lopSinhVien: '' }, khoaDaoTao: value?.id || null }, () => {
                                this.nganhDaoTao.value('');
                                this.lopSinhVien.value('');
                                this.getData(0);
                            })} allowClear />
                        <FormSelect className='col-md-2' ref={(e) => (this.nganhDaoTao = e)} data={SelectAdapter_DtNganhDaoTaoFilter(this.state.khoaDaoTao)} label='Ngành đào tạo'
                            onChange={value => this.setState({ filter: { ...this.state.filter, nganhDaoTao: value?.id || '', lopSinhVien: '' }, nganhDaoTao: value?.id || null }, () => {
                                this.lopSinhVien.value('');
                                this.getData(0);
                            })} allowClear />
                        <FormSelect className='col-md-2' ref={(e) => (this.lopSinhVien = e)} data={SelectAdapter_DtLopFilter({
                            listKhoaSv: this.state.filter?.khoaSinhVien,
                            heDaoTao: this.state.filter?.loaiHinhDaoTao,
                            donVi: this.state.khoaDaoTao,
                            nganh: this.state.nganhDaoTao
                        })} label='Lớp sinh viên'
                            onChange={(value) => this.setState({ filter: { ...this.state.filter, lopSinhVien: value?.id || '' } }, () => this.getData(0))} allowClear
                        />
                    </div>
                </div>
                <FormTabs ref={e => this.tab = e} tabs={[
                    {
                        title: 'Tổng quan đăng ký học phần',
                        component: <SectionTongQuanDangKy ref={e => this.tongQuan = e} filter={filter} filterNgay={filterNgay} />
                    },
                    {
                        title: 'Danh sách đăng ký tín chỉ',
                        component: <SectionDsDangKyTinChi ref={e => this.listDkMon = e} filter={filter} filterNgay={filterNgay} />
                    },
                    {
                        title: 'Danh sách đăng ký môn học',
                        component: <SectionDanhSachDkMonHoc ref={e => this.listStudents = e} filter={filter} filterNgay={filterNgay} />
                    },
                    {
                        title: 'Danh sách sinh viên không đăng ký tín chỉ',
                        component: <SectionSinhVienKhongDangKy ref={e => this.listStudentsNot = e} filter={filter} filterNgay={filterNgay} />
                    },
                ]} />
            </>,
            buttons: { icon: 'fa-print', tooltip: 'Export', className: 'btn btn-success', onClick: e => this.downloadExcel(e) },
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyHocPhan: state.daoTao.dtDangKyHocPhan });
const mapActionsToProps = {
    getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DashboardDt);
