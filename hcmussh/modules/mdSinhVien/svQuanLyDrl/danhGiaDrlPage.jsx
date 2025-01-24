// import { getScheduleSettings } from '../svDtSetting/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
import { getBoTieuChi, submitBangDanhGiaLt } from './redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getScheduleSettings } from 'modules/mdSinhVien/svDtSetting/redux';
// import { Img } from 'view/component/HomePage';
import T from 'view/js/common';

import DrlTable from 'modules/mdCongTacSinhVien/svDrlDanhGia/component/drlTable';
// import { SelectAdapter_HocKy } from './redux';

class UserPage extends AdminPage {
    state = {
        isLoading: false, canEdit: false, isInGiaHan: false, lsBoTieuChi: [], lsDiemDanhGia: [], lsFileMinhChung: [], lsDiemDiff: [], isSearch: false, namHocHienTai: '', hocKyHienTai: '', namHoc: '', hocKy: '', mssv: '', maLyDoEdit: null, lyDoEditElement: null,
        lyDoDanhGia: {}
    }
    timeoutId = {}
    diemTieuChiSv = {}
    diemTieuChiLt = {}
    diemTieuChiKhoa = {}
    lyDoDanhGiaKhoa = {}

    componentDidMount() {
        T.ready('/user/lop-truong/danh-gia-drl/', () => {
            let route = T.routeMatcher('/user/lop-truong/danh-gia-drl/:mssv'),
                mssv = route.parse(window.location.pathname).mssv;
            this.mssv = mssv;
            this.props.getScheduleSettings(data => {
                let namHoc = T.storage('ltDrl:namHoc')?.namHoc ?? data.currentSemester.namHoc,
                    hocKy = T.storage('ltDrl:hocKy')?.hocKy ?? data.currentSemester.hocKy;
                T.storage('ltDrl:namHoc', { namHoc });
                T.storage('ltDrl:hocKy', { hocKy });
                this.setState({ namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy, namHoc, hocKy, mssv }, () => {
                    this.loadPage();
                });
                this.hocKy.value(hocKy);
                this.namHoc.value(namHoc);
            });
        });
    }

    loadPage = (needLoading = true) => {
        this.setState({ isLoading: needLoading }, () => {
            const { namHoc, hocKy, mssv } = this.state;
            getBoTieuChi(namHoc, hocKy, mssv, data => this.setState({
                data,
                isLoading: false,
                svInfo: data.svInfo,
                canEdit: data.canEdit, isInGiaHan: data.isInGiaHan,
                timeStart: data.timeStart, timeEnd: data.timeEnd,
            }));
        });
    }

    changeNamHoc = (value) => {
        T.storage('ltDrl:namHoc', { namHoc: value.id });
        this.setState({ namHoc: value.id }, () => {
            this.loadPage();
        });
    }

    changeHocKy = (value) => {
        T.storage('ltDrl:hocKy', { hocKy: value.id });
        this.setState({ hocKy: value.id }, () => {
            this.loadPage();
        });
    }

    render() {
        const { namHoc, hocKy, svInfo } = this.state;
        // const readOnly = (namHoc == namHocHienTai && hocKy == hocKyHienTai) ? '' : true;

        return this.renderPage({
            title: 'Điểm rèn luyện',
            subTitle: svInfo != null && <>Sinh viên: <b>{svInfo.mssv ?? ''} {svInfo?.hoTen ?? ''}</b></>,
            icon: 'fa fa-graduation-cap',
            breadcrumb: ['Điểm rèn luyện'],
            backRoute: '/user/lop-truong/quan-ly-drl',
            header: <>
                <div className='d-flex'>
                    <FormSelect ref={e => this.namHoc = e} className='mr-2' data={SelectAdapter_SchoolYear} onChange={(value) => this.changeNamHoc(value)} />
                    <FormSelect ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={(value) => this.changeHocKy(value)} />
                </div>
            </>,
            content: <div className='tile'>
                <div className='tile-body'>
                    {/* <div className='d-flex justify-content-between align-items-center mb-3'>
                        {timeStart && timeEnd && <span>Thời gian: {(() => {
                            const now = Date.now();
                            const periodText = `${T.dateToText(timeStart)} - ${T.dateToText(timeEnd)}`;
                            if (now < timeStart) {
                                return <b className='text-primary'><i className='fa fa-clock-o pr-1' />{periodText}</b>;
                            } else if (now < timeEnd) {
                                return <b className='text-success'><i className='fa fa-check pr-1' />{periodText}</b>;
                            } else {
                                return <b className='text-danger'><i className='fa fa-times pr-1' />{periodText} </b>;
                            }
                        })()}</span>}
                    </div> */}
                    <DrlTable namHoc={namHoc} hocKy={hocKy} mssv={this.state.mssv} user={'lopTruong'} readOnly={!this.state.canEdit} submit={submitBangDanhGiaLt} data={this.state.data} loadPage={this.loadPage} />

                </div>
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);