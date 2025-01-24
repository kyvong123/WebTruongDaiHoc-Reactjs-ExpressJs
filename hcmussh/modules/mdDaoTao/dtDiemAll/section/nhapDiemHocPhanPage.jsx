import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import SectionHPStudent from 'modules/mdDaoTao/dtThoiKhoaBieu/section/SectionHPStudent';
import { DtThoiKhoaBieuGetDataHocPhan } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';

class NhapDiemHocPhanPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/grade-manage/nhap-diem/:maHocPhan'),
                maHocPhan = route.parse(window.location.pathname).maHocPhan;

            T.alert('Loading...', 'warning', false, null, true);
            this.props.DtThoiKhoaBieuGetDataHocPhan(maHocPhan, items => {
                this.setState({ maHocPhan }, () => {
                    let { maMonHoc, tenMonHoc, tenKhoaBoMon, tongTiet, maHocPhan, tietLyThuyet, tietThucHanh } = items.fullData[0];
                    this.tongTiet.value(tongTiet);
                    this.monHoc.value(maMonHoc + ': ' + T.parse(tenMonHoc, { vi: '' })?.vi);
                    this.khoa.value(tenKhoaBoMon?.getFirstLetters());
                    this.maHocPhan.value(maHocPhan);
                    this.tietLyThuyet.value(tietLyThuyet);
                    this.tietThucHanh.value(tietThucHanh || '0');
                    this.sectionStudent.setData(items.fullData, () => T.alert('Load thành công', 'success', false, 500));
                });
            });
        });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Nhập điểm học phần',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage/nhap-diem'>Quản lý nhập điểm</Link>,
                'Nhập điểm học phần'
            ],
            content: <div className='tile'>
                <div className='row'>
                    <FormTextBox ref={e => this.maHocPhan = e} className='col-md-4' readOnly label='Mã học phần' />
                    <FormTextBox ref={e => this.khoa = e} className='col-md-2' readOnly label='Khoa, bộ môn' />
                    <FormTextBox ref={e => this.tongTiet = e} className='col-md-2' readOnly label='Tổng số tiết' />
                    <FormTextBox type='number' ref={e => this.tietLyThuyet = e} className='col-md-2' readOnly label='Số tiết lý thuyết' />
                    <FormTextBox type='number' ref={e => this.tietThucHanh = e} className='col-md-2' readOnly label='Số tiết thực hành' />
                    <FormTextBox ref={e => this.monHoc = e} className='col-md-12' label='Môn học' readOnly />
                </div>
                <SectionHPStudent ref={e => this.sectionStudent = e} maHocPhan={this.state.maHocPhan} isManage={true} />
            </div>,
            backRoute: '/user/dao-tao/grade-manage/nhap-diem',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtTkbConfig: state.daoTao.dtTkbConfig });
const mapActionsToProps = { DtThoiKhoaBieuGetDataHocPhan };
export default connect(mapStateToProps, mapActionsToProps)(NhapDiemHocPhanPage);