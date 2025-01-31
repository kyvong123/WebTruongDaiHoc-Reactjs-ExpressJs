import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTabs } from 'view/component/AdminPage';

import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

import SectionSinhVienQuiMo from './section/SectionSinhVienQuiMo';
import SectionSinhVienDangKy from './section/SectionSinhVienDangKy';
import SectionSinhVienHocLaiCaiThien from './section/SectionSinhVienHocLaiCaiThien';
import SectionSinhVienDongHocPhi from './section/SectionSinhVienDongHocPhi';
// import SectionSinhVienDiemTrungBinh from './section/SectionSinhVienDiemTrungBinh';
class dtThongKe extends AdminPage {
    state = { filter: {} }

    componentDidMount() {
        this.tab.tabClick(null, 0);
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getScheduleSettings(data => {
                let { namHoc } = data.currentSemester;
                namHoc = parseInt(namHoc.split(' - ')[0]);
                let dataNamHoc = Array.from({ length: 5 }, (_, i) => `${namHoc - i}`);
                dataNamHoc = dataNamHoc.reverse();

                this.setState({ filter: { ...this.state.filter, loaiHinhDaoTao: 'CQ', khoaSinhVien: dataNamHoc.join(',') } }, () => {
                    this.khoaSinhVien.value(dataNamHoc);
                    this.loaiHinhDaoTao.value('CQ');
                    this.changeSchedule();
                });
            });
        });
    }

    changeSchedule = () => {
        this.setState({ filter: this.state.filter }, () => {
            this.quiMo.getData();
            this.dangKy.getData();
            this.hocLai.getData();
            this.hocPhi.getData();
            // this.diemTrungBinh.getData();
        });
    }

    downloadExcel = (e) => {
        let tabIndex = this.tab.selectedTabIndex();

        if (tabIndex == 0) this.quiMo.downloadExcel(e);
        else if (tabIndex == 1) this.dangKy.downloadExcel(e);
        else if (tabIndex == 2) this.hocLai.downloadExcel(e);
        else if (tabIndex == 3) this.hocPhi.downloadExcel(e);
        // else if (tabIndex == 4) this.diemTrungBinh.downloadExcel(e);
    }

    render() {
        return this.renderPage({
            title: 'Thống kê',
            icon: 'fa fa-table',
            backRoute: '/user/dao-tao',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Thống kê'
            ],
            header: <div className='row'>
                <FormSelect ref={e => this.loaiHinhDaoTao = e} style={{ width: '250px', marginBottom: '0', marginRight: '10px' }} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo'
                    onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTao: value.id } }, () => this.changeSchedule())} />
                <FormSelect ref={e => this.khoaSinhVien = e} style={{ width: '500px', marginBottom: '0', marginRight: '10px' }} data={SelectAdapter_DtKhoaDaoTao} label='Khóa sinh viên' multiple
                    onChange={() => {
                        let khoaSinhVien = this.khoaSinhVien.value();
                        khoaSinhVien = khoaSinhVien.sort().join(',');
                        this.setState({ filter: { ...this.state.filter, khoaSinhVien: khoaSinhVien } }, () => this.changeSchedule());
                    }} />
            </div>,
            content:
                <>
                    <FormTabs ref={e => this.tab = e} tabs={[
                        {
                            title: 'Qui mô sinh viên',
                            component: <SectionSinhVienQuiMo ref={e => this.quiMo = e} filter={this.state.filter} history={this.props.history} />
                        },
                        {
                            title: 'Số lượng sinh viên đăng ký tín chỉ',
                            component: <SectionSinhVienDangKy ref={e => this.dangKy = e} filter={this.state.filter} history={this.props.history} />
                        },
                        {
                            title: 'Số lượng sinh viên đăng ký tín chỉ học lại, học cải thiện',
                            component: <SectionSinhVienHocLaiCaiThien ref={e => this.hocLai = e} filter={this.state.filter} history={this.props.history} />
                        },
                        {
                            title: 'Thống kê đóng học phí',
                            component: <SectionSinhVienDongHocPhi ref={e => this.hocPhi = e} filter={this.state.filter} history={this.props.history} />
                        },
                        // {
                        //     title: 'Thống kê điểm trung bình',
                        //     component: <SectionSinhVienDiemTrungBinh ref={e => this.diemTrungBinh = e} filter={this.state.filter} history={this.props.history} />
                        // }
                    ]} />

                </>
            ,
            buttons: { icon: 'fa-print', tooltip: 'Export', className: 'btn btn-success', onClick: e => this.downloadExcel(e) },
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThongKe: state.daoTao.dtThongKe });
const mapActionsToProps = {
    getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps)(dtThongKe);
