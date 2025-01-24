import { getScheduleSettings } from '../svDtSetting/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, FormSelect, FormTabs } from 'view/component/AdminPage';
import { getBoTieuChi, getSvDrlPhucKhaoAll, submitBangDanhGia, createSvDrlPhucKhao, huySvDrlPhucKhao, deleteMinhChung } from './redux';
// import FileBox from 'view/component/FileBox';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
// import { Img } from 'view/component/HomePage';
import { Tooltip } from '@mui/material';
import PhucKhaoModal from './phucKhaoModal';
import KienNghiComponent from './componentKienNghi';
// import UploadModal from './minhChungModal';
import DrlTable from 'modules/mdCongTacSinhVien/svDrlDanhGia/component/drlTable';
// import { SelectAdapter_HocKy } from './redux';

// const TcTitle = 0, TcSelect = 1, TcRange = 2, TcScalar = 3;
const STATUS_MAPPER = {
    'D': <span className='text-success'><i className='fa fa-check' /> Đã Xử Lý</span>,
    'N': <span className='text-danger'><i className='fa fa-plus-square' /> Đăng ký mới</span>,
};

const TcTitle = 0, TcSelect = 1, TcRange = 2, TcScalar = 3, TcLinkSuKien = 4;


class UserPage extends AdminPage {
    state = { isLoading: false, canEdit: false, isInGiaHan: false, canPhucKhao: false, lsBoTieuChi: [], lsDiemDanhGia: [], lsFileMinhChung: [], tongKetInfo: null, isSearch: false, namHocHienTai: '', hocKyHienTai: '', namHoc: '', hocKy: '' }
    timeoutId = {}
    diemTieuChi = {}
    diemTieuChiLt = {}
    diemTieuChiKhoa = {}
    lyDoDanhGia = {}
    lyDoDanhGiaKhoa = {}

    componentDidMount() {
        T.ready('/user/danh-gia-drl', () => {
            this.props.getScheduleSettings(data => {
                let namHoc = T.storage('svDrl:namHoc')?.namHoc ?? data.currentSemester.namHoc,
                    hocKy = T.storage('svDrl:hocKy')?.hocKy ?? data.currentSemester.hocKy;
                T.storage('svDrl:namHoc', { namHoc });
                T.storage('svDrl:hocKy', { hocKy });
                this.setState({ namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy, namHoc, hocKy }, () => {
                    this.loadPage();
                });
                this.hocKy.value(hocKy);
                this.namHoc.value(namHoc);
            });
        });
    }

    loadPage = (needLoading = true) => {
        this.setState({ isLoading: needLoading }, () => {
            const { namHoc, hocKy } = this.state;
            this.props.getSvDrlPhucKhaoAll(namHoc, hocKy);
            getBoTieuChi(namHoc, hocKy,
                data => this.setState({
                    isLoading: false,
                    data,
                    canEdit: data.canEdit, isInGiaHan: data.isInGiaHan, tongKetInfo: data.tongKetInfo,
                    diemTrungBinh: data.diemTrungBinh,
                    canPhucKhao: data.canPhucKhao, lsBoTieuChi: data.lsBoTieuChi,
                    timeEnd: data.timeEnd,
                    timeStart: data.timeStart,
                    canGiaHan: data.canGiaHan,
                    idBo: data.idBo,
                    lsDiemDanhGia: data.lsDiemDanhGia,
                    lsFileMinhChung: data.lsDiemDanhGia
                        .filter(diem => diem.minhChung != null)
                        .map(diem => ({ maTieuChi: diem.maTieuChi, filePath: diem.minhChung }))
                }));
        });
    }

    loaiTcLabel = (loaiTc, diemMax) => {
        if (loaiTc == TcTitle || loaiTc == TcScalar || loaiTc == TcLinkSuKien) {
            return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{diemMax}</span>;
        } else if (loaiTc == TcSelect) {
            const data = JSON.parse(diemMax);
            return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{data.map((item) => item.diem).join(' / ')}</span>;
        } else if (loaiTc == TcRange) {
            const data = JSON.parse(diemMax);
            return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{data[0]} - {data[1]}</span>;
        } else return '';
    };

    genDataNamHoc = (nam) => {
        const currYear = new Date().getFullYear();
        this.setState({ namHoc: Array.from({ length: currYear - nam + 1 }, (_, i) => `${nam + i} - ${nam + i + 1} `) });
    }

    findItem = (list, ma) => {
        for (let item of list) {
            if (item.ma === ma) {
                return item;
            } else if (item.dsTieuChiCon) {
                let foundItem = this.findItem(item.dsTieuChiCon, ma);
                if (foundItem) {
                    return foundItem;
                }
            }
        }
        return null;
    }


    updateLsMinhChung = (filePath, maTieuChi) => {
        let { lsFileMinhChung } = this.state;
        if (lsFileMinhChung.some(item => item.maTieuChi == maTieuChi)) {
            lsFileMinhChung = lsFileMinhChung.map(item => {
                if (item.maTieuChi == maTieuChi) {
                    item.filePath = filePath;
                }
                return item;
            });
        } else {
            lsFileMinhChung = [...lsFileMinhChung, { maTieuChi, filePath }];
        }
        this.setState({ lsFileMinhChung: lsFileMinhChung });
    }



    changeNamHoc = (value) => {
        T.storage('svDrl:namHoc', { namHoc: value.id });
        this.setState({ namHoc: value.id }, () => {
            const { namHoc, hocKy } = this.state;
            this.loadPage(namHoc, hocKy);
        });
    }



    changeHocKy = (value) => {
        T.storage('svDrl:hocKy', { hocKy: value.id });
        this.setState({ hocKy: value.id }, () => {
            const { namHoc, hocKy } = this.state;
            this.loadPage(namHoc, hocKy);
        });
    }



    componentPhucKhaoDiem = () => {
        const { namHoc, hocKy, canPhucKhao } = this.state;
        const user = this.props.system.user;
        const list = this.props.svDrlPhucKhao ? this.props.svDrlPhucKhao.dsPhucKhao : [];
        let table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có lịch sử đăng ký',
            header: 'thead-light',
            stickyHead: false,
            // multipleTbody: true,
            renderHead: () => (<tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tiêu chí</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Thông tin điểm</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Phúc khảo</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell type='text' content={item.tenTieuChi || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={this.loaiTcLabel(item.loaiTc, item.diemMax)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                        Sinh viên: {JSON.parse(item.dataTruoc).diemSv}<br />
                        Lớp: {JSON.parse(item.dataTruoc).diemLt}<br />
                        Khoa: {JSON.parse(item.dataTruoc).diemF}<br />
                    </>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.dataSau ? <>
                        Sinh viên: {JSON.parse(item.dataSau).diemSv}<br />
                        Lớp: {JSON.parse(item.dataSau).diemLt}<br />
                        Khoa: {JSON.parse(item.dataSau).diemF}<br />
                    </> : ''} />
                    <TableCell type='text' content={STATUS_MAPPER[item.tinhTrang]} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                        {<Tooltip title='Hủy đăng ký' arrow>
                            <button className='btn btn-primary' onClick={e => {
                                e.preventDefault();
                                this.phucKhaoModal.show({ mssv: user.mssv, namHoc, hocKy }, item);
                            }}>
                                <i className='fa fa-lg fa-eye' />
                            </button>
                        </Tooltip>}
                        {(item.tinhTrang == 'N' && canPhucKhao) && <Tooltip title='Hủy đăng ký' arrow>
                            <button className='btn btn-danger' onClick={e => {
                                e.preventDefault();
                                T.confirm('Xác nhận hủy đăng kí', 'Bạn có chắc bạn muốn hủy đăng ký phúc khảo điểm rèn luyện!', isConfirm => isConfirm && this.props.huySvDrlPhucKhao(item.id, namHoc, hocKy));
                            }}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>}
                    </>} />
                </tr>)
        });
        return (<>
            <div className='row'>
                <div className='col-md-12' style={{ marginTop: '2%' }}>
                    <div className='mb-2'>
                        {canPhucKhao && <button className='btn btn-success float-right mb-2' onClick={e => e.preventDefault() || this.phucKhaoModal.show({ mssv: user.mssv, namHoc, hocKy })}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Đăng ký mới
                        </button>}
                    </div>
                    {table}
                    <PhucKhaoModal ref={e => this.phucKhaoModal = e} lsDiemDanhGia={this.state.lsDiemDanhGia} createSvDrlPhucKhao={this.props.createSvDrlPhucKhao} dataNamHoc={{ namHoc, hocKy }} huySvDrlPhucKhao={this.props.huySvDrlPhucKhao} idBo={this.state.idBo} deleteMinhChung={deleteMinhChung} onSubmit={this.loadPage} />
                </div>
            </div>
        </>);
    }

    componentBangDanhGia = () => {
        //     tongDiemKhoa, diemFinal, diemKyLuat, diemFinalKhoa, diemFinalDuKien, timeStart, timeEnd } = this.state;
        const { namHoc, hocKy } = this.state;
        const user = this.props.system.user;
        const readOnly = !this.state.canEdit;
        return (<>
            <div className='row'>
                <div className='col-md-12 mt-3'>
                    <div className='d-flex justify-content-start'>
                        {/* {timeEnd && <p>Thời gian: {(() => {
                            const now = Date.now();
                            const periodText = `${T.dateToText(timeStart)} - ${T.dateToText(timeEnd)}`;
                            if (now < timeStart) {
                                return <b className='text-primary'><i className='fa fa-clock-o pr-1' />{periodText}</b>;
                            } else if (now < timeEnd) {
                                return <b className='text-success'><i className='fa fa-check pr-1' />{periodText}</b>;
                            } else {
                                return <b className='text-danger'><i className='fa fa-times pr-1' />{periodText} </b>;
                            }
                        })()}
                            {tongKetInfo.svSubmit ? <b className='text-success'> - Đã nộp</b> : null}
                        </p>} */}
                    </div>
                    <DrlTable isLoading={this.state.isLoading} namHoc={namHoc} hocKy={hocKy} mssv={user.mssv} user={'sinhVien'} readOnly={readOnly} submit={submitBangDanhGia} loadPage={this.loadPage} data={this.state.data} />
                </div>
                {/* <UploadModal ref={e => this.uploadModal = e} updateLsMinhChung={this.updateLsMinhChung} readOnly={readOnly} deleteMinhChung={deleteMinhChung} /> */}
            </div>
        </>);
    }

    render() {
        return this.renderPage({
            title: 'Điểm rèn luyện',
            icon: 'fa fa-graduation-cap',
            breadcrumb: ['Điểm rèn luyện'],
            header: <>
                <div className='d-flex'>
                    <FormSelect ref={e => this.namHoc = e} className='mr-2' data={SelectAdapter_SchoolYear} onChange={(value) => this.changeNamHoc(value)} />
                    <FormSelect ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={(value) => this.changeHocKy(value)} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <h5><b className='text-danger'>Lưu ý: </b>Sinh viên xem hướng dẫn tại <a href='https://www.youtube.com/watch?v=A9JUlOwhk4M' target='_blank' rel="noreferrer">đây</a> trước khi tiến hành đánh giá điểm rèn luyện.</h5>
                </div>
                {<div className='tile'>
                    <FormTabs
                        tabs={[
                            { title: 'Bảng đánh giá', component: this.componentBangDanhGia() },
                            { title: 'Đăng ký phúc khảo', component: this.componentPhucKhaoDiem() },
                            { title: 'Xin gia hạn', component: <KienNghiComponent user={this.props.system.user} namHoc={this.state.namHoc} hocKy={this.state.hocKy} canGiaHan={this.state.canGiaHan} /> },
                        ]}
                    />
                </div>}</>,
        });
    }
}


const mapStateToProps = state => ({ system: state.system, svDrlPhucKhao: state.student.svDrlPhucKhao });
const mapActionsToProps = { getScheduleSettings, getSvDrlPhucKhaoAll, createSvDrlPhucKhao, huySvDrlPhucKhao, deleteMinhChung };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);