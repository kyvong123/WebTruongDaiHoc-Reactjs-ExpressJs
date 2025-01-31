// import { getScheduleSettings } from '../svDtSetting/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, getValue, FormSelect, FormTextBox, AdminModal, loadSpinner } from 'view/component/AdminPage';
import { getBoTieuChi } from './redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getScheduleSettings } from 'modules/mdSinhVien/svDtSetting/redux';
import { Img } from 'view/component/HomePage';
import { Tooltip } from '@mui/material';

// import { SelectAdapter_HocKy } from './redux';
const TcTitle = 0, TcSelect = 1, TcRange = 2, TcScalar = 3;

const formatDate = (numDate) => {
    const date = new Date(numDate);
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
};

class UploadModal extends AdminModal {
    state = { dsMinhChung: [] }
    onShow = (item, user) => {
        let route = T.routeMatcher('/user/lop-chu-nhiem/danh-gia-drl/:mssv'),
            mssv = route.parse(window.location.pathname).mssv;
        const dsMinhChung = item.minhChung ? JSON.parse(item.minhChung) : [];
        this.setState({ maTieuChi: item.ma, dsMinhChung, mssv, index: user.index.toString() });
        this.fileBox?.setData('svMinhChungDrl:' + user);
    };

    render = () => {
        const { dsMinhChung } = this.state;
        return this.renderModal({
            title: `Chi tiết minh chứng điểm rèn luyện cho tiêu chí ${this.state.index}`,
            size: 'large',
            body: (
                <div className='row' style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
                    <h6 className='col-md-12'>Danh sách minh chứng đã có ({dsMinhChung.length})</h6>
                    {dsMinhChung.length ? dsMinhChung.map((minhChung, index) => (
                        <div className='col-md-6 mb-3' key={index}>
                            <div className='row'>
                                <div className='col-md-12 mb-4'>
                                    <h6 className='font-weight-bold'>Minh chứng {index + 1}<br />
                                        <span className='text-success'><small>Thời gian cập nhật: {T.dateToText(minhChung.timeAdded)}</small></span></h6>
                                    <a href={`/api/tccb/danh-gia-drl/minh-chung?filePath=${minhChung.filePath.split('/')[2]}&mssv=${this.state.mssv}`} target='_blank' rel='noreferrer' >
                                        <Img src={`/api/tccb/danh-gia-drl/minh-chung?filePath=${minhChung.filePath.split('/')[2]}&mssv=${this.state.mssv}`} style={{ width: '100%', height: 'auto' }} alt='Hình minh chứng' />
                                    </a>
                                </div>
                                <div className='col-md-12'>
                                    <div className='row'>
                                        <div className='col-md-12'><span className='font-weight-bold'>Tên hoạt động:</span> {minhChung.tenHoatDong || ''}</div>
                                        <div className='col-md-12'>
                                            <div className='row'>
                                                <div className='col-md-6'><span className='font-weight-bold'>Thời gian:</span> {minhChung.thoiGian ? formatDate(minhChung.thoiGian) : ''}</div>
                                                <div className='col-md-6'><span className='font-weight-bold'>Ghi chú:</span> {minhChung.ghiChu || ''}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : null}
                </div>
            ),
        });
    };
}

class UserPage extends AdminPage {
    state = { isLoading: false, lsBoTieuChi: [], lsDiemDanhGia: [], tongKetInfo: null, lsFileMinhChung: [], isSearch: false, namHocHienTai: '', hocKyHienTai: '', namHoc: '', hocKy: '', mssv: '' }

    diemTieuChiSv = {}
    diemTieuChiLt = {}
    diemTieuChiKhoa = {}
    lyDoDanhGia = {}
    lyDoDanhGiaKhoa = {}

    componentDidMount() {
        T.ready('/user/lop-chu-nhiem/danh-gia-drl/', () => {
            let route = T.routeMatcher('/user/lop-chu-nhiem/danh-gia-drl/:mssv'),
                mssv = route.parse(window.location.pathname).mssv;
            this.props.getScheduleSettings(data => {
                let namHoc = T.storage('tccbChuNhiemDrl:namHoc')?.namHoc ?? data.currentSemester.namHoc,
                    hocKy = T.storage('tccbChuNhiemDrl:hocKy')?.hocKy ?? data.currentSemester.hocKy;
                T.storage('tccbChuNhiemDrl:namHoc', { namHoc });
                T.storage('tccbChuNhiemDrl:hocKy', { hocKy });
                this.setState({ namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy, namHoc, hocKy, mssv }, () => {
                    this.loadPage();
                });
                this.hocKy.value(hocKy);
                this.namHoc.value(namHoc);
            });
        });
    }

    loadPage = () => {
        this.setState({ isLoading: true }, () => {
            const { namHoc, hocKy, mssv } = this.state;
            getBoTieuChi(namHoc, hocKy, mssv, data => this.setState({
                isLoading: false,
                lsBoTieuChi: data.lsBoTieuChi, tongKetInfo: data.tongKetInfo, diemTrungBinh: data.diemTrungBinh,
                lsDiemDanhGia: data.lsDiemDanhGia,
                lsFileMinhChung: data.lsDiemDanhGia.filter(diem => diem.minhChung != null).map(diem => ({ maTieuChi: diem.maTieuChi, filePath: diem.minhChung }))
            }, () => {
                const { lsDiemDanhGia } = this.state;
                lsDiemDanhGia.forEach(diem => {
                    this.diemTieuChiSv[diem.maTieuChi]?.value(diem.diemSv || diem.diemSv == 0 ? diem.diemSv.toString() : '');
                    this.diemTieuChiLt[diem.maTieuChi]?.value(diem.diemLt || diem.diemLt == 0 ? diem.diemLt.toString() : '');
                    this.diemTieuChiKhoa[diem.maTieuChi]?.value(diem.diemF || diem.diemF == 0 ? diem.diemF.toString() : '');
                    this.lyDoDanhGia[diem.maTieuChi]?.value(diem.lyDoLt || '');
                    this.lyDoDanhGiaKhoa[diem.maTieuChi]?.value(diem.lyDoF || '');
                });
                let tongDiem = this.state.lsBoTieuChi.reduce((init, item) => init + Number(lsDiemDanhGia.find(diem => diem.maTieuChi == item.ma)?.diemSv || 0), 0),
                    tongDiemLt = this.state.lsBoTieuChi.reduce((init, item) => init + Number(lsDiemDanhGia.find(diem => diem.maTieuChi == item.ma)?.diemLt || 0), 0),
                    tongDiemKhoa = this.state.lsBoTieuChi.reduce((init, item) => init + Number(lsDiemDanhGia.find(diem => diem.maTieuChi == item.ma)?.diemF || 0), 0);
                // tongDiemKhoaFinal = data.tongKetInfo?.fSubmit ? data.tongKetInfo?.fSubmit : tongDiemKhoa;
                tongDiem = tongDiem > 90 ? 90 : tongDiem;
                tongDiemLt = tongDiemLt > 90 ? 90 : tongDiemLt;
                tongDiemKhoa = tongDiemKhoa > 90 ? 90 : tongDiemKhoa;
                // const diemFinal = data.tongKetInfo?.tkSubmit || data.tongKetInfo?.fSubmit || '';
                const diemFinalKhoa = data.tongKetInfo?.fSubmit ? data.tongKetInfo?.fSubmit : tongDiemKhoa;
                const diemKyLuat = data.tongKetInfo?.kyLuat?.length > 0 ? Math.min(...data.tongKetInfo?.kyLuat.map(hinhThuc => hinhThuc.drlMax)) : null;
                const diemFinalDuKien = diemFinalKhoa ? Math.min(diemFinalKhoa + parseInt(data.diemTrungBinh || 0), diemKyLuat || Infinity) : null;
                const diemFinal = data.tongKetInfo?.tkSubmit;

                this.setState({
                    tongDiem, tongDiemLt, tongDiemKhoa, diemFinal, diemKyLuat, diemFinalKhoa, diemFinalDuKien
                });
                this.tongDiem?.value(tongDiem);
                this.tongDiemLt?.value(tongDiemLt);
                this.tongDiemKhoa?.value(tongDiemKhoa);
                // this.lyDoTongKetKhoa?.value(data.tongKetInfo?.lyDoF || '');
                this.diemTongKet?.value(diemFinal);
            }));
        });
    }

    loaiTcLabel = (loaiTc, diemMax) => {
        if (loaiTc == TcTitle || loaiTc == TcScalar) {
            return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{diemMax}</span>;
        } else if (loaiTc == TcSelect) {
            const data = JSON.parse(diemMax);
            return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{data.map((item) => item.diem).join(' / ')}</span>;
        } else if (loaiTc == TcRange) {
            const data = JSON.parse(diemMax);
            return <span className='font-weight-bold' style={{ whiteSpace: 'nowrap' }}>{data[0]} - {data[1]}</span>;
        } else return '';
    }

    drlMapper(diem) {
        if (diem >= 90) {
            return <span className='font-weight-bold' style={{ color: '#019445' }}>Xuất sắc</span>;
        } else if (diem >= 80 && diem < 90) {
            return <span className='font-weight-bold' style={{ color: '#91cb63' }}>Tốt</span>;
        } else if (diem >= 65 && diem < 80) {
            return <span className='font-weight-bold' style={{ color: '#fdb041' }}>Khá</span>;
        } else if (diem >= 50 && diem < 65) {
            return <span className='font-weight-bold' style={{ color: '#f25b2a' }}>Trung bình</span>;
        } else {
            return diem != 0 ? <span className='font-weight-bold' style={{ color: '#e22024' }}>Yếu</span> : '';
        }
    }

    kyLuatMapper = (danhSachKyLuat) => {
        const results = [];
        for (let i = 0; i < danhSachKyLuat.length; i++) {
            let s = danhSachKyLuat[i];
            results.push(<div key={results.length}> <span>
                {i + 1}. {s.tenKyLuat} {s.drlMax && (`(Điểm rèn luyện tối đa là ${s.drlMax})`)}
            </span></div>);
        }
        return results;
    }

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

    setDiemDanhGiaKhoa = (e, ma, maCha) => {
        const tieuChiCha = maCha ? this.findItem(this.state.lsBoTieuChi, maCha) : this.findItem(this.state.lsBoTieuChi, ma);
        let diemTong = 0;
        if (tieuChiCha.dsTieuChiCon?.length) {
            diemTong = tieuChiCha.dsTieuChiCon.reduce((init, item) => {
                const diemCong = getValue(this.diemTieuChiKhoa[item.ma]) ? Number(getValue(this.diemTieuChiKhoa[item.ma])) : 0;
                if (item.loaiTc == TcRange) {
                    const data = JSON.parse(item.diemMax);
                    if (diemCong != 0 && (diemCong < data[0] || diemCong > data[1])) {
                        T.notify('Không nằm trong khoảng cho phép', 'danger');
                        this.diemTieuChiKhoa[item.ma].value(0);
                        return init + 0;
                    } else return init + diemCong;
                } else if (item.loaiTc == TcTitle || item.loaiTc == TcScalar) {
                    if (diemCong > Number(item.diemMax)) {
                        this.diemTieuChiKhoa[item.ma].value(Number(item.diemMax));
                        return init + Number(item.diemMax);
                    } else return init + diemCong;
                } else return init + diemCong;
            }, 0);
        } else {
            diemTong = getValue(this.diemTieuChiKhoa[maCha ? maCha : ma]) || '';
            if (diemTong > Number(tieuChiCha.diemMax)) {
                diemTong = Number(tieuChiCha.diemMax);
            }
        }
        setTimeout(() => {
            this.diemTieuChiKhoa[maCha ? maCha : ma]?.value(diemTong || '');
            tieuChiCha.maCha && this.setDiemDanhGiaKhoa(e, tieuChiCha.maCha, null);
            const tongDiemKhoa = this.state.lsBoTieuChi.reduce((init, item) => init + Number(getValue(this.diemTieuChiKhoa[item.ma]) || 0), 0);
            this.tongDiemKhoa.value(tongDiemKhoa > 100 ? 100 : tongDiemKhoa);
            // this.tongDiem.value(0);
        }, 500);
    }

    getDsDrl = (list) => {
        const res = list.reduce((prev, item) => {
            if (item.dsTieuChiCon?.length) {
                prev.push({
                    maTieuChi: item.ma,
                    diemF: getValue(this.diemTieuChiKhoa[item.ma]),
                });
                prev = prev.concat(this.getDsDrl(item.dsTieuChiCon));
            } else {
                prev.push({
                    maTieuChi: item.ma,
                    diemF: getValue(this.diemTieuChiKhoa[item.ma]),
                });
            }
            return prev;
        }, []);
        return res;
    }

    setLichSuDiem = (listTieuChi, listDiem) => {
        listTieuChi.forEach(item => {
            const diem = listDiem.find(diem => diem.maTieuChi == item.ma) || null;
            this.diemTieuChiSv[item.ma]?.value((diem && diem.diemSv) ? diem.diemSv : '');
            this.diemTieuChiLt[item.ma]?.value((diem && diem.diemLt) ? diem.diemLt : '');
            this.diemTieuChiKhoa[item.ma]?.value((diem && diem.diemF) ? diem.diemF : '');
            this.lyDoDanhGia[item.ma]?.value((diem && diem.lyDoLt) ? diem.lyDoLt : '');
            this.lyDoDanhGiaKhoa[item.ma]?.value((diem && diem.lyDoF) ? diem.lyDoF : '');
            if (item.dsTieuChiCon.length) {
                this.setLichSuDiem(item.dsTieuChiCon, listDiem);
            }
        });
    }

    changeNamHoc = (value) => {
        T.storage('tccbChuNhiemDrl:namHoc', { namHoc: value.id });
        this.setState({ namHoc: value.id }, () => {
            this.loadPage();
        });
    }

    changeHocKy = (value) => {
        T.storage('tccbChuNhiemDrl:hocKy', { hocKy: value.id });
        this.setState({ hocKy: value.id }, () => {
            this.loadPage();
        });
    }

    initRows = (maCha, list, level, indexing = '') => {
        const { namHoc, hocKy, lsFileMinhChung, mssv } = this.state;
        const res = list.reduce((prev, item, index) => {
            if (item.dsTieuChiCon?.length) {
                prev.push(<tr key={`${item.ma}`}>
                    <TableCell content={indexing ? indexing + '.' + (index + 1) : (index + 1)} style={{ fontWeight: item.loaiTc == TcTitle ? 'bold' : '' }} />
                    <TableCell content={item.ten} style={{ fontWeight: item.loaiTc == TcTitle ? 'bold' : '' }} />
                    <TableCell type='text' content={this.loaiTcLabel(item.loaiTc, item.diemMax)} style={{ textAlign: 'center' }} />
                    <TableCell style={{ textAlign: 'center' }} content={
                        item.loaiTc == TcSelect ? <FormSelect className='mb-0' ref={e => this.diemTieuChiSv[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={true} /> :
                            <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiSv[item.ma] = e} readOnly={true} />
                    }
                    />
                    <TableCell style={{ textAlign: 'center' }} content={
                        item.loaiTc == TcSelect ? <FormSelect className='mb-0' ref={e => this.diemTieuChiLt[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={true} /> :
                            <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiLt[item.ma] = e} readOnly={true} />
                    }
                    />
                    <TableCell style={{ textAlign: 'center' }} content={
                        item.loaiTc == TcSelect ? <FormSelect className='mb-0' ref={e => this.diemTieuChiKhoa[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} onChange={e => this.setDiemDanhGiaKhoa(e, item.ma, maCha)} readOnly={true} /> :
                            <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiKhoa[item.ma] = e} onChange={e => this.setDiemDanhGiaKhoa(e, item.ma, maCha)} readOnly={true} />
                    }
                    />
                    <TableCell content={''} style={{ textAlign: 'center' }} />
                </tr>);
                prev = prev.concat(this.initRows(item.ma, item.dsTieuChiCon, level + 1, indexing ? indexing + '.' + (index + 1) : (index + 1)));
            } else {
                item.minhChung = lsFileMinhChung.find(file => file.maTieuChi == item.ma)?.filePath || null;
                prev.push(<tr key={`${item.ma}`}>
                    <TableCell content={indexing ? indexing + '.' + (index + 1) : (index + 1)} />
                    <TableCell content={item.ten} />
                    <TableCell content={this.loaiTcLabel(item.loaiTc, item.diemMax)} style={{ textAlign: 'center' }} />
                    <TableCell style={{ textAlign: 'center' }} content={
                        item.loaiTc == TcSelect ? <FormSelect className='mb-0' ref={e => this.diemTieuChiSv[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={true} /> :
                            <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiSv[item.ma] = e} readOnly={true} />
                    }
                    />
                    <TableCell style={{ textAlign: 'center' }} content={
                        <div className='position-relative'>
                            {item.loaiTc == TcSelect ? <FormSelect className='mb-0' style={{ display: 'inline-block' }} ref={e => this.diemTieuChiLt[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={true} /> :
                                <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiLt[item.ma] = e} readOnly={true} />
                            }
                            {item.lyDoLt ? <Tooltip title={'Lý do: ' + item.lyDoLt}><i className='text-primary fa fa-lg fa-question-circle ml-1' style={{ position: 'absolute', top: '0.3rem' }} /></Tooltip> : null}
                            {/* <FormTextBox type='text' className='text-sm mr-2 mb-0' ref={e => this.lyDoDanhGia[item.ma] = e} readOnly={true} /> */}
                        </div>
                    } />
                    <TableCell style={{ textAlign: 'center' }} content={
                        <div className='position-relative'>
                            {item.loaiTc == TcSelect ? <FormSelect className='mb-0' style={{ display: 'inline-block' }} ref={e => this.diemTieuChiKhoa[item.ma] = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={true} /> :
                                <FormTextBox className='mb-0' type='number' ref={e => this.diemTieuChiKhoa[item.ma] = e} readOnly={true} />
                            }
                            {item.lyDoF ? <Tooltip title={'Lý do: ' + item.lyDoF}><i className='text-primary fa fa-lg fa-question-circle ml-1' style={{ position: 'absolute', top: '0.3rem' }} /></Tooltip> : null}
                            {/* <FormTextBox type='text' className='text-sm mr-2 mb-0' ref={e => this.lyDoDanhGiaKhoa[item.ma] = e} readOnly={true} /> */}
                        </div>
                    }
                    />
                    <TableCell content={
                        (item.coMinhChung ?
                            (item.minhChung ?
                                <span><a href='#' onClick={() => this.uploadModal.show(item, { mssv, namHoc, hocKy, index: indexing ? indexing + '.' + (index + 1) : (index + 1) })}>
                                    <i className='fa fa-sm fa-edit mr-1' />
                                    Chi tiết
                                </a></span>
                                : <span><a href='#' className='text-danger'>
                                    <i className='fa fa-sm fa-close mr-1' />
                                    Chưa có
                                </a></span>)
                            : '')
                    } style={{ textAlign: 'center' }} />
                </tr>);
            }
            return prev;
        }, []);

        return res;

    }

    render() {
        const { namHoc, hocKy, namHocHienTai, hocKyHienTai, lsBoTieuChi, tongKetInfo, diemTrungBinh,
            tongDiemKhoa, diemFinal, diemKyLuat, diemFinalKhoa, diemFinalDuKien } = this.state;
        const readOnly = (namHoc == namHocHienTai && hocKy == hocKyHienTai) ? '' : true;
        let table = renderTable({
            getDataSource: () => lsBoTieuChi,
            emptyTable: `Không tìm thấy bộ tiêu chí cho HK${hocKy || ''}, năm học ${namHoc || ''}`,
            header: 'thead-light',
            stickyHead: false,
            multipleTbody: true,
            renderHead: () => (<tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tiêu chí</th>
                <th style={{ width: '75px', whiteSpace: 'nowrap' }}>Điểm</th>
                <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Sinh viên</th>
                <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp trưởng</th>
                <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa/BM</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Minh chứng</th>
            </tr>),
            renderRow: <>
                <tbody>
                    {this.initRows(null, lsBoTieuChi || [], 1)}
                </tbody>
                <tfoot>
                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Điểm tiêu chí</span><br />
                            <small><i>Tổng điểm các tiêu chí không vượt quá 90 điểm</i></small></span>} />
                        <TableCell content={<span className='font-weight-bold'>90</span>} style={{ textAlign: 'center' }} />
                        <TableCell content={
                            <FormTextBox className='mb-0' ref={e => this.tongDiem = e} type='number' readOnly={true} />
                        } style={{ textAlign: 'center' }} />
                        <TableCell content={
                            <FormTextBox className='mb-0' ref={e => this.tongDiemLt = e} type='number' readOnly={true} />
                        } style={{ textAlign: 'center' }} />
                        <TableCell content={<FormTextBox className='mb-0' ref={e => this.tongDiemKhoa = e} type='number' readOnly={true} />
                        } style={{ textAlign: 'center' }} />
                        <TableCell style={{ textAlign: 'right', paddingRight: '1rem' }} content={tongDiemKhoa ? <>
                            {diemFinalKhoa != tongDiemKhoa ?
                                <>
                                    <del><span className='font-weight-bold text-secondary'>{tongDiemKhoa}</span></del>
                                    <Tooltip title={tongKetInfo.lyDoF}><span className='badge-pill badge-primary ml-3'><span className={'font-weight-bold'}>{diemFinalKhoa}</span></span></Tooltip>
                                </>
                                : <span className={'font-weight-bold text-success'}>{diemFinalKhoa}</span>}
                        </> : null} />
                    </tr>
                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Điểm trung bình quy đổi {tongKetInfo && (tongKetInfo.diemTb || tongKetInfo.diemTb == 0) ? <Tooltip title='Điểm trung bình đã được khóa xét kết quả'>
                            <i className='fa fa-lg fa-lock text-primary mr-1' />
                        </Tooltip> : null}</span ><br />
                            <small style={{ display: diemTrungBinh || diemTrungBinh == 0 ? '' : 'none' }}>Lấy phần nguyên: <i>Điểm trung bình học kỳ của bạn là {diemTrungBinh} thì điểm lấy xét là {parseInt(diemTrungBinh)}</i></small></span>} style={{ fontWeight: 'bold' }} colSpan={5} />
                        <TableCell content={<>
                            <span className={(tongKetInfo && (tongKetInfo.diemTb || tongKetInfo.diemTb == 0) ? 'text-success' : 'text-secondary') + ' font-weight-bold'}>{diemTrungBinh || diemTrungBinh == 0 ? parseInt(diemTrungBinh) : ''}</span>
                        </>} style={{ textAlign: 'right', paddingRight: '1rem' }} />
                    </tr>

                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Tổng điểm</span ><br />
                            <small>Điểm tiêu chí (Khoa/BM) + Điểm trung bình học kỳ xét</small></span>} colSpan={5} />
                        <TableCell content={diemFinalKhoa ? <span className={'badge-pill ' + (diemFinal ? 'badge-success' : 'badge-secondary')}>{Number(diemFinalKhoa) + parseInt(diemTrungBinh || 0)}</span> : null} className='font-weight-bold' style={{ textAlign: 'right' }} />
                    </tr>

                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Vi phạm kỷ luật</span ><br />
                            <small><i>Áp dụng hình thức cao nhất</i></small></span>} style={{ fontWeight: 'bold' }} />
                        <TableCell content={<span>
                            {tongKetInfo?.kyLuat.length ? this.kyLuatMapper(tongKetInfo?.kyLuat) : 'Không'}
                        </span>} colSpan={4} />
                        <TableCell content={
                            diemKyLuat ? <span className='badge-pill badge-danger'>{diemKyLuat}</span> : ''
                        } className='font-weight-bold' style={{ textAlign: 'right', paddingTop: '20px', paddingBottom: '20px' }} />
                    </tr>

                    <tr>
                        <TableCell content={'#'} />
                        <TableCell content={<span><span className='font-weight-bold'>Điểm rèn luyện tổng kết</span ><br />
                            {!diemFinal ? <small><i>Đây chỉ là điểm dự kiến. Điểm sẽ bật xanh nếu đã tổng kết</i></small> : null}</span>} style={{ fontWeight: 'bold' }} colSpan={5} />
                        <TableCell content={diemFinalDuKien ?
                            <>{diemFinal && diemFinal != diemFinalDuKien ?
                                <>
                                    <del><span className='font-weight-bold text-secondary'>{diemFinalDuKien}</span></del>
                                    <Tooltip title={tongKetInfo.lyDoTk}><span className='badge-pill badge-success ml-3'><span className={'font-weight-bold'}>{diemFinal}</span></span></Tooltip>
                                </>
                                : <span className={'badge-pill ' + (diemFinal ? 'badge-success' : 'badge-secondary')}>{diemFinalDuKien || ''}</span>}</> : null
                        } className='font-weight-bold' style={{ textAlign: 'right', paddingTop: '20px', paddingBottom: '20px' }} />
                    </tr>
                </tfoot>
            </>
        });

        return this.renderPage({
            title: 'Điểm rèn luyện',
            icon: 'fa fa-graduation-cap',
            breadcrumb: ['Điểm rèn luyện'],
            backRoute: '/user/lop-chu-nhiem/quan-ly-drl',
            header: <>
                <div className='d-flex'>
                    <FormSelect ref={e => this.namHoc = e} className='mr-2' data={SelectAdapter_SchoolYear} onChange={(value) => this.changeNamHoc(value)} />
                    <FormSelect ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={(value) => this.changeHocKy(value)} />
                </div>
            </>,
            content: this.state.isLoading ? loadSpinner() : <div className='tile row'>
                <div className='col-md-12' style={{ marginTop: '2%' }}>
                    {table}
                </div>
                <UploadModal ref={e => this.uploadModal = e} readOnly={readOnly} />
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);