import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormDatePicker, FormSelect, FormTabs, FormTextBox, getValue, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStudentsPage, saoChepDiemLop, editDrlTongKetKhoa, getDrlGiaHanKhoa, updateDrlThoiGianPhucKhao, deleteDrlGiaHanKhoa, getSvDotDanhGiaDrlLatest } from './redux/danhGiaDrlRedux';
import { getStudentsPagePhucKhao } from './redux/reduxPhucKhao';
import { getPendingGiaHan, tuChoiGiaHan, chapNhanKienNghi, getAllGiaHanDrl } from './redux/drlGiaHanRedux';
import { Tooltip } from '@mui/material';
import { getScheduleSettings } from 'modules/mdTccb/tccbDtSetting/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { ProcessModal } from 'modules/mdDaoTao/dtCauHinhDotDkhp/adjustPage';
import GiaHanModal from './modal/giaHanModal';
import { SelectAdapter_DmSvLoaiHinhDaoTaoDrlByDot } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdTccb/tccbQuanLyLop/redux';
import { SelectApdaterDotDrlByNamHocHocKy } from 'modules/mdCongTacSinhVien/svDotDanhGiaDrl/redux';
import TccbComponentKienNghi from './componentKienNghi';
import { STATUS_MAPPER } from './danhGiaDrlPage';
import DuyetGiaHanModal from 'modules/mdCongTacSinhVien/svDotDanhGiaDrl/giaHanModal';

const APPROVED_MAPPER = {
    'A': <span className='text-success'><i className='fa fa-check' /> Chấp nhận</span>,
    'N': <span className='text-danger'><i className='fa fa-plus-square' /> Đăng ký mới</span>,
    'R': <span className='text-danger'><i className='fa fa-times' /> Từ chối</span>,
};

class AdminStudentsPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, advanceFilter: {}, sortTerm: 'ten_ASC', filterPk: {}, process: false, canEdit: false, thongTinDot: null, isHetHan: true, isInPhucKhao: false, setTimePkStart: false, dsGiaHan: [], selected: [] };
    lyDoTongKetF = {};
    diemTongKetKhoa = {};
    advanceFilterKeys = ['listTinhTrangSinhVien', 'listKhoaSinhVien', 'listLoaiHinhDaoTao', 'listLop'];

    componentDidMount() {
        T.ready('/user/khoa/quan-ly-drl', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => {
                this.getStudentsPage(undefined, undefined, searchText || '');
                this.setState({ searchText });
            };
            T.showSearchBox(() => this.changeAdvancedSearch());
            this.showAdvanceSearch();
            const isManager = this.getCurrentPermissions().includes('manager:login');
            this.props.getScheduleSettings(data => {
                let namHoc = T.storage('tccbDrl:namHoc')?.namHoc ?? data.currentSemester.namHoc,
                    hocKy = T.storage('tccbDrl:hocKy')?.hocKy ?? data.currentSemester.hocKy;
                this.setState({
                    isManager,
                    filter: { namHoc, hocKy },
                    filterPk: { namHoc, hocKy }
                }, () => {
                    const { namHoc, hocKy } = this.state.filter;
                    this.onChangeNamHocHocKy({ namHoc, hocKy });
                    this.namHoc.value(this.state.filter.namHoc);
                    this.hocKy.value(this.state.filter.hocKy);
                });
            });
        });
    }

    loadPage = (resetFilter = true) => {
        resetFilter && this.resetAdvanceSearch();
        this.getStudentsPage(undefined, undefined, undefined, (data) => {
            this.setThoiGianKhoa(data);
            this.syncAdvanceSearch();
        });
        this.getStudentsPagePk(undefined, undefined, undefined);
    }

    loadGiaHan = () => {
        this.props.getAllGiaHanDrl(this.maDot, data => {
            const { dsGiaHan, isHetHan, timeEndGiaHan } = data ?? {};
            this.setState({ dsGiaHan, isHetHan, timeEndGiaHan });
        });
    }

    onChangeNamHocHocKy = ({ namHoc, hocKy }) => {
        T.storage('tccbDrl:namHoc', { namHoc });
        T.storage('tccbDrl:hocKy', { hocKy });
        this.props.getSvDotDanhGiaDrlLatest(namHoc, hocKy, (item) => {
            if (item) {
                this.dot.value(item.id);
                this.maDot = item.id;

            } else {
                this.dot.value(null);
                this.maDot = null;
            }
            this.loadPage(true);
        });
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

    getGiaHanPage = (pageNumber, pageSize, pageCondition) => {
        this.getStudentsPage(pageNumber, pageSize, pageCondition, (data) => {
            this.setThoiGianKhoa(data);
        });
    }

    setThoiGianKhoa = (data) => {
        const { thongTinDot, phanCapQuanLy } = data;
        // const now = new Date();
        this.setState({ thongTinDot, phanCapQuanLy }, () => {
            if (thongTinDot) {
                const { timeStartFaculty, timeEndFaculty, dsGiaHan, timeStartSv, timeEndSv, timeStartLt, timeEndLt, timePkStart } = thongTinDot;
                this.timeStartF?.value(timeStartFaculty ? new Date(timeStartFaculty) : null);
                this.timeEndF?.value(timeEndFaculty ? new Date(timeEndFaculty) : null);
                this.timeStartSv?.value(timeStartSv ? new Date(timeStartSv) : null);
                this.timeEndSv?.value(timeEndSv ? new Date(timeEndSv) : null);
                this.timeStartLt?.value(timeStartLt ? new Date(timeStartLt) : null);
                this.timeEndLt?.value(timeEndLt ? new Date(timeEndLt) : null);
                this.timePkStart?.value(timePkStart ? new Date(timePkStart) : null);
                // const isInGiaHan = timeEndGiaHan ? (new Date(timeEndGiaHan) >= now) : false;
                if (timeStartFaculty && timeEndFaculty) {
                    this.setState({
                        // isInGiaHan,
                        setTimePkStart: false,
                        // isOutDot: (new Date(timeEndFaculty) < now),
                        // isHetHan: isInGiaHan ? !isInGiaHan : (timePkStart ? (new Date(timePkStart) < now) : (new Date(timeEndFaculty) < now)),
                        // isInPhucKhao: timePkStart ? (new Date(timePkStart) < now && now < new Date(timeEndFaculty)) : false,
                        isOutDot: thongTinDot.isOutDot,
                        isHetHan: thongTinDot.isHetHan,
                        canGiaHan: thongTinDot.canGiaHan,
                        canDuyetGiaHan: thongTinDot.canDuyetGiaHan,
                        dsGiaHan: dsGiaHan || []
                    });
                }
            }
        });
    }

    handleCheck = (mssv, value) => {
        const selected = this.state.selected;
        if (value) {
            selected.push(mssv);
        } else {
            const idx = selected.indexOf(mssv);
            selected.splice(idx, 1);
            this.selecteAll.value(0);
        }
        this.setState({ selected });
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => {
        const { filter = {}, advanceFilter = {} } = this.state;
        this.setState({ selected: [] }, () => {
            this.selecteAll.value(0);
            this.props.getStudentsPage(this.maDot, pageNumber, pageSize, pageCondition, { ...filter, ...advanceFilter }, this.state?.sortTerm || this.defaultSortTerm, done);
        });
    };

    getStudentsPagePk = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getStudentsPagePhucKhao(pageNumber, pageSize, pageCondition, this.state.filterPk, this.state?.sortTerm || this.defaultSortTerm, done);
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getStudentsPage(pageNumber, pageSize, pageCondition);
        });
    }

    handleKeySearchPk = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filterPk: { ...this.state.filterPk, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getStudentsPagePk(pageNumber, pageSize, pageCondition);
        });
    }

    changeAdvancedSearch = (isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props.tccbDanhGiaDrl && this.props.tccbDanhGiaDrl.page ? this.props.tccbDanhGiaDrl.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        const getPage = () => {
            this.getStudentsPage(pageNumber, pageSize, pageCondition);
            // this.getStudentsPage(pageNumber, pageSize, pageCondition, page => {
            //     if (page) {
            //         this.hideAdvanceSearch();
            //     }
            // });
        };
        if (isReset) {
            this.resetAdvanceSearch(getPage);
        } else {
            getPage();
        }

        // const filter = T.updatePage('pageTccbDanhGiaDrl').filter;
        // Object.keys(this).forEach(key => {
        //     if (filter[key]) {
        //         if (['hocKy', 'namHoc'].includes(key)) this[key].value(filter[key]);
        //         else this[key].value(filter[key].toString().split(','));
        //     }
        // });
    }

    resetAdvanceSearch = (done) => {
        const advanceFilter = { ...(this.state.advanceFilter ?? {}) };
        Object.keys(advanceFilter).forEach(key => {
            advanceFilter[key] = null;
            this[key].value && this[key].value('');
        });
        this.setState({ advanceFilter: {} }, () => done && done());
    }


    syncAdvanceSearch = () => {
        this.advanceFilterKeys.forEach(advanceFilterKey => {
            this[advanceFilterKey].value(this.state.filter[advanceFilterKey]?.replaceAll(' ', '').split(','));
        });
    }

    saoChepDiemLopProceed = () => {
        const { selected, filter, advanceFilter } = this.state;
        this.setState({ process: true });
        this.processModal.show();
        this.props.saoChepDiemLop(this.maDot, selected, { ...filter, ...advanceFilter }, () => {
            this.getStudentsPage();
            this.setState({ process: false, selected: [] });
            this.selecteAll.value(0);
            setTimeout(() => this.processModal.hide(), 1000);
        });
    }

    saoChepDiemLop = () => {
        // const { namHoc, hocKy } = this.state.filter;
        const { selected } = this.state;
        if (selected?.length) {
            T.confirm('Chấp nhận điểm lớp', '<span class="text-danger"">LƯU Ý: Hệ thống sẽ sử dụng điểm lớp cho điểm khoa cho các sinh viên được chọn</span>', 'warning', true, (isConfirm) => {
                if (isConfirm) {
                    this.saoChepDiemLopProceed();
                }
            });
        } else {
            T.confirm('Chấp nhận điểm lớp', '<span class="text-danger">LƯU Ý: Hệ thống sẽ sử dụng điểm lớp cho điểm khoa cho <b>TẤT CẢ</b> các sinh viên theo bộ lọc</span>', 'warning', true, (isConfirm) => {
                if (isConfirm) {
                    this.saoChepDiemLopProceed();
                }
            });
        }
    }

    setThoiGianPkKhoa = () => {
        const { thongTinDot } = this.state;
        const timePkStart = Number(getValue(this.timePkStart)),
            now = new Date(),
            datePkStart = new Date(timePkStart);
        if (new Date(thongTinDot.timeStartFaculty) < datePkStart && new Date(thongTinDot.timeEndFaculty) > datePkStart) {
            const changes = {
                timePkStart,
                idDot: thongTinDot.id
            };
            this.props.updateDrlThoiGianPhucKhao(changes, () => {
                this.timePkStart.value(new Date(timePkStart));
                this.setState({ isHetHan: timePkStart ? (new Date(timePkStart) < now) : (new Date(thongTinDot.timeEndFaculty) < now), isInPhucKhao: timePkStart ? (new Date(timePkStart) < now && now < new Date(thongTinDot.timeEndFaculty)) : false, setTimePkStart: false });
            });
        } else {
            T.notify('Thời gian bắt đầu phúc khảo phải nằm trong khoảng bắt đầu và kết thúc của khoa', 'danger');
        }

    }

    setDiemTongKet = () => {
        let { list } = this.props.tccbDanhGiaDrl && this.props.tccbDanhGiaDrl.page ?
            this.props.tccbDanhGiaDrl.page : { list: null };
        if (list && list.length) {
            list.forEach(item => {
                this.diemTongKetKhoa[item.mssv]?.value(((item.diemF != item.diemEditF && item.diemEditF) ? item.diemEditF : item.diemF) || 0);
                this.lyDoTongKetF[item.mssv]?.value(item.lyDoEditF || '');
            });
            this.setState({ listSinhVienUpdate: [] });
        }
    }

    changeDiem = (mssv, data) => {
        const diemEditF = getValue(this.diemTongKetKhoa[`${mssv}`]);
        this.addSvUpdate(mssv, { ...data, diemEditF });
    }

    addSvUpdate = (mssv, data) => {
        const { listSinhVienUpdate } = this.state;
        if (!listSinhVienUpdate.some(sv => sv.mssv == mssv)) {
            this.setState({
                listSinhVienUpdate: [...listSinhVienUpdate, {
                    mssv,
                    ...data
                }]
            });
        } else {
            this.setState({
                listSinhVienUpdate: listSinhVienUpdate.map(sv => {
                    if (sv.mssv == mssv) {
                        sv.diemEditF = data.diemEditF;
                    }
                    return sv;
                })
            });
        }
    }

    saveListUpdate = () => {
        const { listSinhVienUpdate } = this.state,
            { namHoc, hocKy } = this.state.filter;
        let allowSubmit = true;
        listSinhVienUpdate.forEach(item => {
            if (item.diemF == null && item.diemEditF == 0) {
                item.lyDoTongKetF = null;
            } else {
                if (item.diemEditF != item.diemF) {
                    if (this.lyDoTongKetF[item.mssv].value())
                        item.lyDoTongKetF = getValue(this.lyDoTongKetF[item.mssv]);
                    else {
                        T.notify(`Vui lòng điền lý do thay đổi điểm của mssv ${item.mssv}`, 'danger');
                        this.lyDoTongKetF[item.mssv].focus();
                        allowSubmit = false;
                    }
                } else {
                    item.lyDoTongKetF = null;
                }
            }
        });
        if (allowSubmit) {
            this.props.editDrlTongKetKhoa(listSinhVienUpdate, namHoc, hocKy, () => this.setState({ canEdit: false }));
        }
    }

    kyLuatMapper = (danhSachKyLuat, danhSachNgayXuLy, danhSachDrlMax, soKyLuat) => {
        if (soKyLuat == 0) return [];
        let danhSachKyLuats = danhSachKyLuat?.split('??') || [];
        let danhSachNgayXuLys = danhSachNgayXuLy?.split('??') || [];
        let danhSachDrlMaxs = danhSachDrlMax?.split('??') || [];
        let results = [];
        for (let i = 0; i < soKyLuat; i++) {
            danhSachKyLuats[i] = danhSachKyLuats[i]?.trim();
            danhSachNgayXuLys[i] = danhSachNgayXuLys[i]?.trim();
            danhSachDrlMaxs[i] = danhSachDrlMaxs[i]?.trim();
        }
        for (let i = 0; i < soKyLuat; i++) {
            let s = danhSachKyLuats[i];
            let drlMax = danhSachDrlMaxs[i];
            results.push(<div key={results.length}> <span>
                {i + 1}. {s} {drlMax ? `(Điểm rèn luyện tối đa ${drlMax})` : null}
            </span></div>);
        }
        return results;
    }

    thongTinDotRow = () => {
        const { thongTinDot } = this.state;
        return <>
            {thongTinDot && <>
                {/* <div className='mt-3 mb-3' style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}> */}
                <div className='mt-3 mb-3 row'>
                    {thongTinDot.timeStartSv && <div className='col-md-4'>
                        <div>
                            Thời gian cho sinh viên
                        </div>
                        <div style={{ display: 'flex', alignContent: 'center' }}>
                            <FormDatePicker className='mr-4 mb-0' ref={e => this.timeStartSv = e} label='Bắt đầu' readOnly={true} />
                            <FormDatePicker className='mb-0' ref={e => this.timeEndSv = e} label='Kết thúc' readOnly={true} />
                        </div>
                    </div>}
                    {thongTinDot.timeStartLt && <div className='col-md-4'>
                        <div>
                            Thời gian cho lớp
                        </div>
                        <div style={{ display: 'flex', alignContent: 'center' }}>
                            <FormDatePicker className='mr-4 mb-0' ref={e => this.timeStartLt = e} label='Bắt đầu' readOnly={true} />
                            <FormDatePicker className='mb-0' ref={e => this.timeEndLt = e} label='Kết thúc' readOnly={true} />
                        </div>
                    </div>}
                    {thongTinDot.timeStartFaculty && <div className='col-md-4'>
                        <div>
                            Thời gian cho khoa
                        </div>
                        <div style={{ display: 'flex', alignContent: 'center' }}>
                            <FormDatePicker className='mr-4 mb-0' ref={e => this.timeStartF = e} label='Bắt đầu' readOnly={true} />
                            <FormDatePicker className='mr-4 mb-0' ref={e => this.timeEndF = e} label='Kết thúc' readOnly={true} />
                        </div>
                        <div className='d-flex'>
                            <FormDatePicker className='mb-0 mr-2' style={{ display: 'inline-flex', alignItems: 'baseline' }} readOnlyEmptyText='Chưa xác định' ref={e => this.timePkStart = e} label='Bắt đầu phúc khảo' readOnly={!this.state.setTimePkStart} />
                            {this.state.isManager && thongTinDot.canEditPhucKhao && (!this.state.setTimePkStart ? <i className='fa fa-pencil fa-lg text-info mt-1' style={{ display: '' }} aria-hidden='true' onClick={() => this.setState({ setTimePkStart: true })}></i> :
                                <>
                                    <i className='fa fa-check fa-2x text-success mr-1 mt-1' style={{ display: '' }} aria-hidden='true' onClick={() => this.setThoiGianPkKhoa()}></i>
                                    <i className='fa fa-close fa-2x text-danger mt-1' style={{ display: '' }} aria-hidden='true' onClick={() => this.setState({ setTimePkStart: false })}></i>
                                </>)
                            }
                        </div>
                    </div>}
                </div>
            </>}
        </>;
    }

    componentDiemRenLuyen = () => {
        const { thongTinDot } = this.state;

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbDanhGiaDrl && this.props.tccbDanhGiaDrl.page ?
            this.props.tccbDanhGiaDrl.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th><FormCheckbox ref={e => this.selecteAll = e} content={this.state.selected.length ? 0 : 1} onChange={value => {
                        if (value) {
                            let { list } = (this.props.tccbDanhGiaDrl && this.props.tccbDanhGiaDrl.page ? this.props.tccbDanhGiaDrl.page : []);
                            list = list.map(item => item.mssv);
                            this.setState({ selected: list });
                        } else {
                            this.setState({ selected: [] });
                        }
                    }} style={{ marginBottom: '0' }} /></th>
                    <TableHead style={{ width: '10%' }} content='MSSV' keyCol='mssv' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '20%' }} content='Họ và tên lót' keyCol='ho' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '10%' }} content='Tên' keyCol='ten' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Sinh viên</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp trưởng</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa / BM</th>
                    {this.state.canEdit && <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Lý do</th>}
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng kết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xếp hạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='checkbox' isCheck content={this.state.selected.some(mssv => mssv == item.mssv)} onChanged={value => { this.handleCheck(item.mssv, value); }} permission={{ write: true }} />
                    <TableCell type='link' url={`/user/khoa/danh-gia-drl/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemSv}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemLt}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <div className='position-relative'>
                            {this.state.canEdit ? <FormTextBox type='number' className='mb-0' ref={e => this.diemTongKetKhoa[item.mssv] = e} onChange={() => this.changeDiem(item.mssv, { diemSv: item.diemSv, diemLt: item.diemLt, diemF: item.diemF })} />
                                : (<b>{(item.diemEditF && item.diemF != item.diemEditF) ? item.diemEditF : item.diemF}</b> || '')}
                            {(item.lyDoEditF && !this.state.canEdit) && <Tooltip className='ml-2 text-primary' title={item.lyDoEditF} arrow placeholder='right'><span style={{ position: 'absolute' }}><i className="pr-2 fa fa-lg fa-info-circle"></i></span></Tooltip>}
                        </div>
                    } />
                    {this.state.canEdit && <TableCell style={{ whiteSpace: 'nowrap' }} content={
                        <FormTextBox className='mb-0' ref={e => this.lyDoTongKetF[item.mssv] = e} style={{ width: '200px' }} onChange={() => this.changeDiem(item.mssv, { diemSv: item.diemSv, diemLt: item.diemLt, diemF: item.diemF })} />
                    } />}
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemTb}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.soKyLuat ? this.kyLuatMapper(item.danhSachKyLuat, item.danhSachNgayXuLy, item.danhSachDrlMax, item.soKyLuat) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <div className="position-relative">
                            <b>{item.diemTk || ''}</b>
                            {item.lyDoTk && <Tooltip className='ml-2 text-primary' title={item.lyDoTk} arrow placeholder='right'><span style={{ position: 'absolute' }}><i className="pr-2 fa fa-lg fa-info-circle"></i></span></Tooltip>}
                        </div>} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.drlMapper(Number(item.diemTk || 0))} />
                    <TableCell type='buttons' style={{}} content={item}>
                        {!this.state.canEdit && <Tooltip title={'Xem chi tiết'}>
                            <Link to={`/user/khoa/danh-gia-drl/${item.mssv}`}>
                                <button className='btn btn-primary' type='button'>
                                    <i className='fa fa-lg fa-pencil' />
                                </button>
                            </Link>
                        </Tooltip>}
                    </TableCell>
                </tr>
            )
        });

        return (<>
            {thongTinDot != null && <div className='mt-2' style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getStudentsPage} />
                <div className='d-flex justify-content-end'>
                    {(!this.state.isHetHan && thongTinDot.timeStartFaculty <= Date.now()) && <button className='btn btn-primary' type='button' onClick={(e) => { e.preventDefault(); this.saoChepDiemLop(); }}>
                        Điểm mặc định
                    </button>}
                    {(!this.state.canDuyetGiaHan && this.state.canGiaHan) && <button className='btn btn-warning' type='button' onClick={() => {
                        this.giaHanModal.show({ namHoc: getValue(this.namHoc), hocKy: getValue(this.hocKy), thongTinDot: this.state.thongTinDot, tinhTrang: 'N' });
                    }} >
                        Đăng ký gia hạn
                    </button>}
                </div>
            </div>}
            {table}
            {/* <AdminBhytModal ref={e => this.bhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} /> */}
            {/* <LoginToTestModal ref={e => this.loginModal = e} loginStudentForTest={this.props.loginStudentForTest} /> */}
        </>);
    }

    componentDrlPhucKhao = () => {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbDanhGiaDrlPhucKhao && this.props.tccbDanhGiaDrlPhucKhao.page ?
            this.props.tccbDanhGiaDrlPhucKhao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ minWidth: '20em' }} content='MSSV' keyCol='mssv' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPagePk(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearchPk} />
                    <TableHead style={{ minWidth: '20em' }} content='Họ và tên lót' keyCol='ho' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPagePk(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearchPk} />
                    {/* <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên lót</th> */}
                    <TableHead style={{ minWidth: '20em' }} content='Tên' keyCol='ten' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPagePk(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearchPk} />
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Lớp</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đã xử lý</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chưa xử lý</th> */}
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={`/user/khoa/danh-gia-drl/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={STATUS_MAPPER[item.tinhTrangXuLy]} />
                    {/* <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.chuaXuLy || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.daXuLy || ''} /> */}
                    <TableCell type='buttons' style={{}} content={item}>
                        <Tooltip title={'Xem chi tiết'}>
                            <Link to={`/user/khoa/danh-gia-drl/${item.mssv}`}>
                                <button className='btn btn-primary' type='button'>
                                    <i className='fa fa-lg fa-pencil' />
                                </button>
                            </Link>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });
        return (<>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                    <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getStudentsPage} pageRange={5} />
                </div>
                {table}
            </div>
            {/* <AdminBhytModal ref={e => this.bhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} /> */}
            {/* <LoginToTestModal ref={e => this.loginModal = e} loginStudentForTest={this.props.loginStudentForTest} /> */}
        </>);
    }

    componentDrlGiaHan = () => {
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: true,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: this.state.dsGiaHan,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'left' }}>Người đăng ký</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Ngày đăng ký</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Ngày kết thúc gia hạn</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Khoa</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.hoTen || ''} />
                    <TableCell style={{ textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayDangKy || ''} />
                    <TableCell style={{ textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayHetHan || ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ textAlign: 'center' }} content={<>
                        {APPROVED_MAPPER[item.tinhTrang]}
                        {item.lyDo && <Tooltip className='ml-2 text-danger' title={item.lyDo} arrow placeholder='right'><i className="pr-2 fa fa-info-circle"></i></Tooltip>}
                    </>} />
                    <TableCell type='buttons' style={{}} content={item}>
                        {!this.state.canDuyetGiaHan && <Tooltip title={'Xem chi tiết'}>
                            <button className='btn btn-primary' type='button' onClick={() => {
                                this.giaHanModal.show({ namHoc: getValue(this.namHoc), hocKy: getValue(this.hocKy), thongTinDot: this.state.thongTinDot, id: item.id, thoiGianGiaHan: item.ngayHetHan, tinhTrang: item.tinhTrang });
                            }} >
                                <i className='fa fa-lg fa-pencil' />
                            </button>
                        </Tooltip>}
                        {this.state.canDuyetGiaHan && <Tooltip title={'Duyệt'}>
                            <button className='btn btn-info' type='button' onClick={() => {
                                this.duyetGiaHanModal.show({ namHoc: getValue(this.namHoc), hocKy: getValue(this.hocKy), thongTinDot: this.state.thongTinDot, id: item.id, thoiGianGiaHan: item.ngayHetHan, tinhTrang: item.tinhTrang });
                            }} >
                                <i className='fa fa-lg fa-pencil' />
                            </button>
                        </Tooltip>}
                        {item.tinhTrang == 'N' && <Tooltip title={'Hủy'}>
                            <button className='btn btn-danger' type='button' onClick={() => {
                                T.confirm('Xác nhận hủy xin gia hạn?', '', isConfirm => isConfirm && this.props.deleteDrlGiaHanKhoa(item.id, () => {
                                    const newDsGiaHan = this.state.dsGiaHan.filter(gh => gh.id != item.id);
                                    this.setState({ dsGiaHan: newDsGiaHan });
                                }));
                            }} >
                                <i className='fa fa-lg fa-close' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            )
        });
        return (<>
            <div className='mt-3'>
                {table}
            </div>
            {/* <AdminBhytModal ref={e => this.bhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} /> */}
            {/* <LoginToTestModal ref={e => this.loginModal = e} loginStudentForTest={this.props.loginStudentForTest} /> */}
        </>);
    }

    componentKienNghi = () => {
        return <div><TccbComponentKienNghi
            searchText={this.state.searchText}
            user={this.props.system.user}
            thongTinDot={this.state.thongTinDot}
            chapNhanKienNghi={chapNhanKienNghi}
            getPendingGiaHan={this.props.getPendingGiaHan}
            tuChoiGiaHan={tuChoiGiaHan}
            namHoc={this.namHoc?.value()} hocKy={this.hocKy?.value()} onSubmitGiaHan={this.getGiaHanPage} /></div>;
    }

    onChangeAdvanceFilter = (filter) => {
        let newFilter = { ...(this.state.advanceFilter ?? {}), ...(filter ?? {}) };
        this.setState({ advanceFilter: newFilter });
    }

    render() {
        let { list } = this.props.tccbDanhGiaDrlPhucKhao?.page ?? {};
        const { namHoc, hocKy } = this.state.filter;
        const { thongTinDot, phanCapQuanLy } = this.state;
        const loaiHinhDaoTao = phanCapQuanLy?.listLhdtQuanLy?.replaceAll(' ', '') ?? thongTinDot?.loaiHinhDaoTao.replaceAll(' ', '');
        const khoaSinhVien = phanCapQuanLy?.listKhoaSvQuanLy?.replaceAll(' ', '') ?? thongTinDot?.khoaSinhVien.replace(' ', '');
        const giaHanBadge = this.state.dsGiaHan?.filter(item => item.tinhTrang == 'N').length;
        const pkBadge = list?.filter(item => item.tinhTrang == 'N').length;
        return this.renderPage({
            title: 'Quản lý điểm rèn luyện',
            icon: 'fa fa-calculator',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/tccb/diem-ren-luyen'>Điểm rèn luyện</Link>,
                'Quản lý điểm rèn luyện'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect multiple ref={e => this.listTinhTrangSinhVien = e} data={SelectAdapter_DmTinhTrangSinhVienV2} label='Tình trạng sinh viên' className='col-md-6' allowClear onChange={() => {
                        this.onChangeAdvanceFilter({ listTinhTrangSinhVien: this.listTinhTrangSinhVien.value().toString() });
                    }} />
                    <FormSelect multiple ref={e => this.listKhoaSinhVien = e} data={khoaSinhVien?.split(',') ?? []} label='Khoá sinh viên' className='col-md-6' allowClear onChange={() => {
                        this.onChangeAdvanceFilter({ listKhoaSinhVien: this.listKhoaSinhVien.value()?.toString() });
                    }} />
                    <FormSelect multiple ref={e => this.listLoaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTaoDrlByDot(this.maDot)} label='Loại hình đào tạo' className='col-md-6' allowClear onChange={() => {
                        this.onChangeAdvanceFilter({ listLoaiHinhDaoTao: this.listLoaiHinhDaoTao.value()?.toString() });
                    }} />
                    <FormSelect multiple ref={e => this.listLop = e} data={SelectAdapter_DtLopFilter(loaiHinhDaoTao ?? '', khoaSinhVien ?? '')} label='Lớp sinh viên' className='col-md-6' allowClear onChange={() => {
                        this.onChangeAdvanceFilter({ listLop: this.listLop.value()?.toString() });
                    }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-secondary' type='button' onClick={() => this.changeAdvancedSearch(true)} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' />Reset
                    </button>
                    <button className='btn btn-info' type='button' onClick={() => this.changeAdvancedSearch()}>
                        <i className='fa fa-lg fa-search-plus' />Tìm kiếm
                    </button>
                </div>
            </>,
            header: <>
                <div style={{ display: 'flex' }}>
                    <FormSelect className='mr-3' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} onChange={value => {
                        if (value) {
                            this.setState({ filter: { ...this.state.filter, namHoc: value.id }, filterPk: { ...this.state.filterPk, namHoc: value.id } }, () => {
                                this.onChangeNamHocHocKy({ hocKy: this.state.filter?.hocKy, namHoc: value.id });
                            });
                        } else this.setState({ filter: { ...this.state.filter, namHoc: null } });
                    }} />
                    <FormSelect ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={value => {
                        if (value) {
                            this.setState({ filter: { ...this.state.filter, hocKy: value.id }, filterPk: { ...this.state.filterPk, hocKy: value.id } }, () => {
                                this.onChangeNamHocHocKy({ namHoc: this.state.filter?.namHoc, hocKy: value.id });
                            });
                        } else this.setState({ filter: { ...this.state.filter, hocKy: null } });
                    }} />
                </div></>,
            content:
                <div className='tile'>
                    <FormSelect label={<h6>Đợt đánh giá</h6>} ref={e => this.dot = e} data={SelectApdaterDotDrlByNamHocHocKy({ namHoc, hocKy })} placeholder='Chọn mã đợt' onChange={value => {
                        this.maDot = value.id;
                        this.loadPage(true);
                    }} />
                    {this.thongTinDotRow()}
                    <FormTabs
                        tabs={[
                            { title: 'Danh sách sinh viên', component: this.componentDiemRenLuyen() },
                            { title: <>Phúc khảo {pkBadge > 0 && <span className='badge badge-pill badge-danger'>{pkBadge}</span>}</>, component: this.componentDrlPhucKhao() },
                            { title: <>Lịch sử gia hạn {giaHanBadge > 0 && <span className='badge badge-pill badge-danger'>{giaHanBadge}</span>}</>, component: this.componentDrlGiaHan() },
                            { title: 'Danh sách kiến nghị', component: this.componentKienNghi() },
                        ]}
                    />
                    <ProcessModal ref={e => this.processModal = e} process={this.state.process} />
                    <GiaHanModal ref={e => this.giaHanModal = e} onSubmit={this.getGiaHanPage} />
                    <DuyetGiaHanModal ref={e => this.duyetGiaHanModal = e} onSubmit={() => this.loadGiaHan()} />
                </div>,
            buttons: [
                (!this.state.canEdit && !this.state.isHetHan) && {
                    icon: 'fa-edit', className: 'btn-info', onClick: () => this.setState({ canEdit: true }, () => this.setDiemTongKet()), tooltip: 'Chế độ chỉnh sửa'
                },
                !this.state.canEdit && {
                    icon: 'fa-file-excel-o', className: 'btn-success', tooltip: 'Tải xuống Excel', onClick: () => {
                        T.notify('Danh sách sẽ được tải xuống sau vài giây', 'info');
                        T.download(`/api/tccb/danh-gia-drl/download-excel?filter=${JSON.stringify(this.state.filter)}`);
                    }
                },
                this.state.canEdit && {
                    icon: 'fa-close', className: 'btn-danger', onClick: () => this.setState({ canEdit: false }), tooltip: 'Tắt chế độ chỉnh sửa'
                },
                this.state.canEdit && {
                    icon: 'fa-save', className: 'btn-success', onClick: this.saveListUpdate, tooltip: 'Lưu thay đổi thông tin của bạn'
                },
            ],
            backRoute: '/user/tccb/diem-ren-luyen',
        });
    }
}
const mapStateToProps = state => ({ system: state.system, tccbDanhGiaDrl: state.tccb.tccbDanhGiaDrl, tccbDanhGiaDrlPhucKhao: state.tccb.tccbDanhGiaDrlPhucKhao, tccbDrlGiaHan: state.tccb.tccbDrlGiaHan });
const mapActionsToProps = {
    getStudentsPage, getScheduleSettings, getStudentsPagePhucKhao, saoChepDiemLop, editDrlTongKetKhoa, getDrlGiaHanKhoa, updateDrlThoiGianPhucKhao, deleteDrlGiaHanKhoa,
    getPendingGiaHan, tuChoiGiaHan, getSvDotDanhGiaDrlLatest, getAllGiaHanDrl
};
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsPage);