import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, FormTabs } from 'view/component/AdminPage';
import { getLichGiangDayHocPhan } from './redux';
import SectionHPStudent from './section/SectionHPStudent';
import SectionTuanHoc from './section/SectionTuanHoc';
import SectionDiemDanh from './section/SectionDiemDanh';
import SectionBu from './section/sectionBu';

class adjustPage extends AdminPage {
    state = {
        filter: {}, fullFilter: {}, tkbItem: {}, dataGiangVien: [], listTuanHoc: [],
        dataTiet: [], dataNgayLe: [],
    }

    ma = '';

    componentDidMount() {
        T.ready('/user/affair', () => {
            const route = T.routeMatcher('/user/affair/lich-giang-day/detail/:maHocPhan'),
                maHocPhan = route.parse(window.location.pathname).maHocPhan;
            this.ma = maHocPhan;
            this.setState({ maHocPhan });
            this.getData();
        });
    }

    getData = () => {
        T.alert('Loading...', 'warning', false, null, true);
        this.props.getLichGiangDayHocPhan(this.ma, items => {
            items.fullData = items.fullData.map(item => ({ ...item }));

            this.setState({ ...items }, () => {
                this.setUp(items);
                this.sectionTuan.setValue(items.listTuanHoc);
                this.sectionDiemDanh.setValue(this.ma);
                this.sectionBu?.getData(this.ma);
                this.sectionStudent.setData(items.fullData, () => T.alert('Load thành công', 'success', false, 500));
            });
        });
    }

    refreshData = (done) => {
        this.props.getLichGiangDayHocPhan(this.ma, items => {
            items.fullData = items.fullData.map(item => ({ ...item }));

            this.setState({ ...items }, () => {
                this.sectionTuan.setValue(items.listTuanHoc);
                this.sectionDiemDanh.setValue(this.ma);
                this.sectionBu?.getData(this.ma);
                done && done();
            });
        });
    }

    setUp = (items) => {
        let { namHoc, hocKy, maMonHoc, tenMonHoc, tongTiet, maHocPhan, tenNganh, tenHe, listNienKhoa } = items.infoHocPhan;
        this.tongTiet.value(tongTiet);
        this.monHoc.value(maMonHoc + ': ' + T.parse(tenMonHoc, { vi: '' })?.vi);
        this.maHocPhan.value(maHocPhan);
        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);
        this.tenNganh.value(tenNganh);
        this.tenHe.value(tenHe);
        this.listNienKhoa.value(listNienKhoa);
    }

    tabChanged = value => {
        this.setState({ ...value });
    }

    render() {
        let { isEdit, fullData, maHocPhan, dataTiet, listNgayLe } = this.state;

        const tabs = [
            { title: 'Lịch giảng dạy', component: <SectionTuanHoc ref={e => this.sectionTuan = e} maHocPhan={this.ma} fullData={fullData} dataTiet={dataTiet} listNgayLe={listNgayLe} getData={this.refreshData} /> },
            { title: 'Danh sách điểm danh', component: <SectionDiemDanh ref={e => this.sectionDiemDanh = e} /> },
            { title: 'Danh sách sinh viên', component: this.state.maHocPhan ? <SectionHPStudent ref={e => this.sectionStudent = e} isEdit={isEdit} maHocPhan={maHocPhan} data={fullData} /> : <></> },
        ];

        if (this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test')) tabs.push({ title: 'Đăng ký dạy bù', component: <SectionBu ref={e => this.sectionBu = e} maHocPhan={maHocPhan} dataTuan={this.state.listTuanHoc} /> });

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thông tin học phần',
            content: <div>
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-4' readOnly label='Năm học' />
                        <FormTextBox ref={e => this.hocKy = e} className='col-md-4' readOnly label='Học kỳ' />
                        <FormTextBox ref={e => this.listNienKhoa = e} className='col-md-4' readOnly label='Khóa' />
                        <FormTextBox ref={e => this.tenHe = e} className='col-md-4' readOnly label='Hệ' />
                        <FormTextBox ref={e => this.tenNganh = e} className='col-md-4' readOnly label='Ngành/Chuyên ngành' />
                        <FormTextBox ref={e => this.tongTiet = e} className='col-md-4' readOnly label='Tổng số tiết' />
                        <FormTextBox ref={e => this.maHocPhan = e} className='col-md-12' readOnly label='Mã học phần' />
                        <FormTextBox ref={e => this.monHoc = e} className='col-md-12' label='Môn học' readOnly />
                    </div>
                </div>
                <div className='tile'>
                    <FormTabs ref={e => this.tab = e} tabs={tabs} onChange={this.tabChanged} />
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getLichGiangDayHocPhan };
export default connect(mapStateToProps, mapActionsToProps)(adjustPage);