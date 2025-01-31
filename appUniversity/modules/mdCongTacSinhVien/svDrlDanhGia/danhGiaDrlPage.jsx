// import { getScheduleSettings } from '../svDtSetting/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getScheduleSettings } from '../ctsvDtSetting/redux';
import { getBoTieuChi } from './redux';
import DrlTable from 'modules/mdCongTacSinhVien/svDrlDanhGia/component/drlTable';

// import { SelectAdapter_HocKy } from './redux';

class UserPage extends AdminPage {
    state = { lsBoTieuChi: [], lsDiemDanhGia: [], tongKetInfo: null, lsFileMinhChung: [], isSearch: false, namHocHienTai: '', hocKyHienTai: '', namHoc: '', hocKy: '', mssv: '', isLoading: true }
    diemTieuChiSv = {}
    diemTieuChiLt = {}
    diemTieuChiKhoa = {}
    lyDoDanhGia = {}
    lyDoDanhGiaKhoa = {}

    componentDidMount() {
        T.ready('/user/ctsv/danh-gia-drl/', () => {
            let route = T.routeMatcher('/user/ctsv/danh-gia-drl/chi-tiet/:mssv'),
                mssv = route.parse(window.location.pathname).mssv;
            let namHoc = T.storage('ctsvDrl:namHoc').namHoc, hocKy = T.storage('ctsvDrl:hocKy').hocKy;
            this.props.getScheduleSettings(data => {
                namHoc = namHoc ?? data.currentSemester.namHoc, hocKy = hocKy ?? data.currentSemester.hocKy;
                T.storage('ctsvDrl:namHoc', { namHoc });
                T.storage('ctsvDrl:hocKy', { hocKy });
                this.setState({ namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy, namHoc, hocKy, mssv });
                this.setFilter({ namHoc, hocKy }, () => this.loadPage());
            });
        });
    }

    setFilter = ({ namHoc, hocKy }, done) => {
        if (namHoc) {
            T.storage('ctsvDrl:namHoc', { namHoc });
            this.namHoc.value(namHoc);
        } else namHoc = T.storage('ctsvDrl:namHoc')?.namHoc;
        if (hocKy) {
            T.storage('ctsvDrl:hocKy', { hocKy });
            this.hocKy.value(hocKy);
        } else hocKy = T.storage('ctsvDrl:hocKy')?.hocKy;
        this.setState({ namHoc, hocKy }, () => {
            done && done();
        });
    }

    loadPage = () => {
        this.setState({ isLoading: true }, () => {
            const { namHoc, hocKy, mssv } = this.state;
            getBoTieuChi(namHoc, hocKy, mssv, data => this.setState({
                data,
                isLoading: false,
                svInfo: data.svInfo,
                lsBoTieuChi: data.lsBoTieuChi, tongKetInfo: data.tongKetInfo, diemTrungBinh: data.diemTrungBinh,
                lsDiemDanhGia: data.lsDiemDanhGia,
                lsFileMinhChung: data.lsDiemDanhGia.filter(diem => diem.minhChung != null).map(diem => ({ maTieuChi: diem.maTieuChi, filePath: diem.minhChung }))
            }));
        });
    }

    changeNamHoc = (value) => {
        this.setState({ namHoc: value.id, isLoading: false });
    }

    changeHocKy = (value) => {
        this.setState({ hocKy: value.id, isLoading: false });
    }

    render() {
        const { namHoc, hocKy, mssv, svInfo } = this.state;
        // const readOnly = (namHoc == namHocHienTai && hocKy == hocKyHienTai) ? false : true;
        return this.renderPage({
            title: 'Điểm rèn luyện',
            subTitle: svInfo != null && <>Sinh viên: <b>{svInfo.mssv ?? ''} - {svInfo.hoTen ?? ''}</b></>,
            icon: 'fa fa-graduation-cap',
            breadcrumb: ['Điểm rèn luyện'],
            backRoute: '/user/ctsv/danh-gia-drl',
            header: <>
                <div className='d-flex'>
                    <FormSelect ref={e => this.namHoc = e} className='mr-2' data={SelectAdapter_SchoolYear} onChange={(value) => this.setFilter({ namHoc: value.id }, () => this.loadPage())} />
                    <FormSelect ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={(value) => this.setFilter({ hocKy: value.id }, () => this.loadPage())} />
                </div>
            </>,
            content: <div className='tile'><DrlTable namHoc={namHoc} hocKy={hocKy} mssv={mssv} readOnly={true} data={this.state.data} /></div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);