import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoDrl } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
// import { SelectAdapter_DmLoaiSinhVienV2 } from 'modules/mdDanhMuc/dmLoaiSinhVien/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTextBox, getValue, renderDataTable, TableCell, TableHead, FormTabs } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStudentsPage, editDrlTongKet, lockDrlTongKet, getDrlPage, multiAddDssvDrl } from './redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DtLopAdvancedFilter } from '../ctsvDtLop/redux';
import { getScheduleSettings } from '../ctsvDtSetting/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import T from 'view/js/common';
import { getPageDrlXepLoai } from '../dmDrlXepLoai/redux';


// const tinhTrangConHoc = 1;
const allTab = 0, completeTab = 1;

class AdminStudentsPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { tabIndex: 0, filter: {}, sortTerm: 'ten_ASC', canEdit: false, tabMounted: false, listSinhVienUpdate: [] };
    diemTongKet = {}
    lyDoTongKet = {}
    componentDidMount() {
        T.ready('/user/ctsv/danh-gia-drl', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getStudentsPage(undefined, undefined, searchText || '');
            // T.showSearchBox(() => this.changeAdvancedSearch());
            this.showAdvanceSearch();
            this.props.getScheduleSettings(data => {
                // let namHoc = T.storage('ctsvDrl:namHoc') ?? data.currentSemester.namHoc,
                //     hocKy = T.storage('ctsvDrl:hocKy') ?? data.currentSemester.hocKy;
                let namHoc = T.storage('ctsvDrl:namHoc').namHoc,
                    hocKy = T.storage('ctsvDrl:hocKy').hocKy;
                if (!namHoc || !hocKy) {
                    namHoc = data.currentSemester.namHoc, hocKy = data.currentSemester.hocKy;
                    T.storage('ctsvDrl:namHoc', { namHoc });
                    T.storage('ctsvDrl:hocKy', { hocKy });
                }
                this.setState({ filter: { ...this.state.filter, namHoc, hocKy } }, () => {
                    this.namHoc.value(namHoc);
                    this.hocKy.value(hocKy);
                    // let { pageNumber, pageSize, pageCondition } = this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
                    // this.getStudentsPage(pageNumber, pageSize, pageCondition);
                });
            });
            this.props.getPageDrlXepLoai();
        });
    }

    drlMapper(diem) {
        const allDrlXeploai = this.props.dmDrlXepLoai ? this.props.dmDrlXepLoai.page.list : [];
        const allKichHoatXepLoai = allDrlXeploai.filter(item => item.kichHoat == 1);

        let xeploai = allKichHoatXepLoai.find(item => Number(item.drlMin) <= diem && diem <= Number(item.drlMax));
        if (!this.props.dmDrlXepLoai) {
            return '';
        }
        else {
            if (xeploai) {
                return <span className='font-weight-bold' style={{ color: xeploai.mauSac }}>{xeploai.ten}</span>;
            }
            return <span className='font-weight-bold' style={{ color: '#019445' }}>Chưa Xếp loại</span>;
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

    drlMaxExtractor = (danhSachDrlMax = '') => {
        let danhSachDrlMaxs = danhSachDrlMax ? danhSachDrlMax.split('??') : [];
        return danhSachDrlMaxs.length && danhSachDrlMaxs[0] != '' ? Math.min(...danhSachDrlMaxs) : null;
    }

    setDiemTongKet = () => {
        let { list } = this.props.sinhVien && this.props.sinhVien.page ?
            this.props.sinhVien.page : { list: null };
        if (list && list.length) {
            list.forEach(item => this.diemTongKet[item.mssv]?.value(item.diemTk));
            this.setState({ listSinhVienUpdate: [] });
        }
    }

    changeAdvancedSearch = (isReset = false) => {
        // let { pageNumber, pageSize, pageCondition } = this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        this.getStudentsPage();
        const filter = this.state.filter;
        Object.keys(this).forEach(key => {
            if (filter[key]) {
                if (['hocKy', 'namHoc'].includes(key)) this[key].value(filter[key]);
                else this[key].value(filter[key].toString().split(','));
            }
        });
        if (isReset) {
            Object.keys(this).forEach(key => {
                if (!['hocKy', 'namHoc'].includes(key) && this[key].value && this[key].value()) this[key].value('');
            });
        }
    }

    setFilter = (filter, done) => {
        this.setState({
            filter: { ...this.state.filter, ...filter }
        }, () => done && done());
    }

    getStudentsPage = (tabIndex, pageNumber, pageSize, pageCondition, done) => {
        this.setState({ canEdit: false });
        tabIndex = tabIndex ?? this.state.tabIndex;
        // const { tabIndex } = this.state;
        if (tabIndex == allTab) {
            this.props.getStudentsPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, done);
        } else {
            this.props.getDrlPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, tabIndex == completeTab, done);
        }
    };

    handleKeySearch = (data) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getStudentsPage();
        });
    }

    changeDiem = (value, mssv, data) => {
        this.addSvUpdate(mssv, { ...data, diemEditTk: value });

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
                        sv.diemEditTk = data.diemEditTk;
                    }
                    return sv;
                })
            });
        }
    }

    saveListUpdate = () => {
        const { listSinhVienUpdate } = this.state,
            { namHoc, hocKy } = this.state.filter;
        if (listSinhVienUpdate.length == 0) {
            T.notify('Không có sự thay đổi!', 'danger');
            return;
        }
        for (let sinhVien of listSinhVienUpdate) {
            const lyDo = getValue(this.lyDoTongKet[sinhVien.mssv]),
                { diemF, diemEditTk, danhSachDrlMax } = sinhVien;
            const diemDuKien = Math.min(diemF, this.drlMaxExtractor(danhSachDrlMax));
            if (diemEditTk && diemEditTk != diemDuKien && lyDo == '') {
                T.notify('Vui lòng bổ sung lý do chỉnh sửa điểm!', 'danger');
                this.lyDoTongKet[sinhVien.mssv].focus();
                return;
            }
            sinhVien.lyDoTk = lyDo;
        }
        T.confirm('Xác nhận cập nhật điểm cho sinh viên!', '', isConfirm => {
            isConfirm && this.props.editDrlTongKet(listSinhVienUpdate, namHoc, hocKy, () => this.setState({ canEdit: false }, () => this.getStudentsPage()));
        });
    }

    lockDrlTongKet = () => {
        const { namHoc, hocKy, ...filter } = this.state.filter;
        T.confirm('Xác nhận tính và khóa điểm tổng kết của các sinh viên?', '<p class="text-danger">Lưu ý: Những sinh viên chưa đánh giá sẽ không được tính điểm DRL</p>', isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng đợi giây lát!', 'info');
                this.props.lockDrlTongKet(namHoc, hocKy, filter, () => {
                    this.getStudentsPage();
                    T.alert('Hoàn thành', 'success');
                });
            }
        });
    }

    componentTable = () => {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sinhVien && this.props.sinhVien.page ?
            this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        const { filter } = this.state;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: this.props.dmDrlXepLoai ? list : null,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '10%' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '20%' }} content='Họ và tên lót' keyCol='ho' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '10%' }} content='Tên' keyCol='ten' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Sinh viên</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp trưởng</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa / BM</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                    <th style={{ width: '45%', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng kết</th>
                    {this.state.canEdit && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Lý do</th>}
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian tổng kết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xếp hạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={`/user/ctsv/danh-gia-drl/chi-tiet/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemSv}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemLt}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<div className='position-relative'>
                        {<b>{(item.diemEditF && item.diemF != item.diemEditF) ? item.diemEditF : item.diemF}</b> || ''}
                        {item.lyDoEditF && <Tooltip className='ml-2 text-primary' title={item.lyDoEditF} arrow placeholder='right'><span style={{ position: 'absolute' }}><i className='pr-2 fa fa-lg fa-info-circle'></i></span></Tooltip>}
                    </div>} />
                    <Tooltip title={item.timeModifiedDiemTbHk ? `Lần cập nhật cuối: ${T.dateToText(item.timeModifiedDiemTbHk, 'dd/mm/yyyy HH:MM:ss')}` : ''} placement="right" arrow>
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}><b>{item.diemTbHocKy || ''}</b></td>
                    </Tooltip>
                    {/* <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <Tooltip title={`Lần cập nhật cuối: ${T.dateToText(item.timeModifiedDiemTbHk, 'dd/mm/yyyy HH:MM:ss')}`}>
                            <b>{item.diemTbHocKy || ''}</b>
                        </Tooltip>
                    } /> */}
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.soKyLuat ? this.kyLuatMapper(item.danhSachKyLuat, item.danhSachNgayXuLy, item.danhSachDrlMax, item.soKyLuat) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                        {this.state.canEdit ? <>
                            <FormTextBox type='number' className='mb-0' ref={e => this.diemTongKet[item.mssv] = e}
                                onChange={(value) => this.changeDiem(value, item.mssv, { diemSv: item.diemSv, diemLt: item.diemLt, diemF: (item.diemEditF && item.diemF != item.diemEditF) ? item.diemEditF : item.diemF, danhSachDrlMax: item.danhSachDrlMax })} />
                        </> : <div className='position-relative'>
                            {(<b>{item.diemTk}</b> || '')}
                            {item.lyDoTk && <Tooltip className='ml-2 text-primary' title={item.lyDoTk} arrow placeholder='right'><span style={{ position: 'absolute' }}><i className='pr-2 fa fa-lg fa-info-circle'></i></span></Tooltip>}
                        </div>}
                    </>} />
                    {this.state.canEdit && < TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                        <FormTextBox className='mb-0' style={{ width: '200px' }} ref={e => this.lyDoTongKet[item.mssv] = e} />
                    </>
                    } />}
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianTk} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.drlMapper(Number(item.diemTk || 0))} />
                    <TableCell type='buttons' style={{}} content={item}>
                        <Tooltip title={'Xem chi tiết'}>
                            <Link to={`/user/ctsv/danh-gia-drl/chi-tiet/${item.mssv}?namHoc=${filter.namHoc}&hocKy=${filter.hocKy}`}>
                                <button className='btn btn-primary' type='button'>
                                    <i className='fa fa-lg fa-eye' />
                                </button>
                            </Link>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });
        // return index == this.state.tabIndex && <div className='tile'>
        return <div className='tile'>
            <div className='mb-2 d-flex justify-content-between'>
                <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={(pageNumber, pageSize, pageCondition, done) => this.getStudentsPage(undefined, pageNumber, pageSize, pageCondition, done)} pageRange={5} />
                <div className='d-flex'>
                    {this.state.tabIndex == 1 && <>
                        {!this.state.canEdit ? <div><button className='btn btn-warning'
                            onClick={(e) => e.preventDefault() || this.setState({ canEdit: true }, () => this.setDiemTongKet())}
                        ><i className='fa fa-edit' />Chỉnh sửa tổng kết</button></div>
                            :
                            <div>
                                <button className='btn btn-success'
                                    onClick={(e) => e.preventDefault() || this.saveListUpdate()}
                                ><i className='fa fa-save' />Lưu</button>
                                <button className='btn btn-danger'
                                    onClick={(e) => e.preventDefault() || this.setState({ canEdit: false })}
                                ><i className='fa fa-times' />Hủy</button>
                            </div>
                        }
                    </>}
                    <div>
                        <button className='btn btn-info'
                            type='button'
                            onClick={() => this.lockDrlTongKet()}
                        ><i className='fa fa-calculator' />Khóa điểm</button>
                    </div>
                </div>
            </div>
            {table}
        </div>;
    }

    render() {
        return this.renderPage({
            title: 'Quản lý điểm rèn luyện',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Quản lý điểm rèn luyện'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect multiple ref={e => this.listFaculty = e} data={SelectAdapter_DmDonViFaculty_V2} label='Lọc theo khoa' className='col-md-4' allowClear onChange={() => {
                        this.setFilter({ listFaculty: this.listFaculty.data()?.map(item => item.id).toString() }, () => this.listLop.value(null));
                    }} />
                    <FormSelect multiple ref={e => this.listTinhTrangSinhVien = e} data={SelectAdapter_DmTinhTrangSinhVienV2} label='Lọc theo tình trạng SV' className='col-md-4' allowClear onChange={() => {
                        this.setFilter({ listTinhTrangSinhVien: this.listTinhTrangSinhVien.data()?.map(item => item.id).toString() });
                    }} />
                    <FormSelect multiple ref={e => this.listKhoaSinhVien = e} data={Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i)} label='Khoá SV' className='col-md-4' allowClear onChange={() => {
                        this.setFilter({ listKhoaSinhVien: this.listKhoaSinhVien.data()?.map(item => item.id).toString() }, () => this.listLop.value(null));
                    }} />
                    <FormSelect multiple ref={e => this.listLoaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTaoDrl} label='Lọc theo loại hình đào tạo' className='col-md-4' allowClear onChange={() => {
                        this.setFilter({ listLoaiHinhDaoTao: this.listLoaiHinhDaoTao.data()?.map(item => item.id).toString() }, () => this.listLop.value(null));
                    }} />
                    <FormSelect multiple ref={e => this.listLop = e} data={SelectAdapter_DtLopAdvancedFilter(this.state.filter)} label='Lọc theo lớp sinh viên' className='col-md-4' allowClear onChange={() => {
                        this.setFilter({ listLop: this.listLop.data()?.map(item => item.id).toString() });
                    }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.changeAdvancedSearch(true)} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' />Reset
                    </button>
                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-lg fa-search-plus' />Tìm kiếm
                    </button>
                </div>
            </>,
            header: <>
                <div style={{ display: 'flex' }}>
                    <FormSelect className='mr-3' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} onChange={value => {
                        T.storage('ctsvDrl:namHoc', { namHoc: value.id });
                        this.setFilter({ namHoc: value.id }, () => this.getStudentsPage());
                    }} />
                    <FormSelect ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={value => {
                        T.storage('ctsvDrl:hocKy', { hocKy: value.id });
                        this.setFilter({ hocKy: value.id }, () => this.getStudentsPage());
                    }} />
                </div>
            </>,
            content: <>
                <FormTabs
                    onChange={({ tabIndex }) => this.setState({ tabIndex }, () => this.getStudentsPage())}
                    tabs={[
                        { title: 'Tất cả' },
                        { title: 'Hoàn thành' },
                        { title: 'Chưa hoàn thành' },
                    ]}
                />
                {this.componentTable()}
            </>
            ,
            buttons: [
                {
                    icon: 'fa-file-excel-o', className: 'btn-success', onClick: () => {
                        T.notify('Danh sách sẽ được tải xuống sau vài giây', 'info');
                        T.download(`/api/ctsv/danh-gia-drl/download-excel?filter=${JSON.stringify(this.state.filter)}`);
                    }, tooltip: 'Tải xuống Excel'
                },
                {
                    icon: 'fa-upload', className: 'btn-primary', onClick: () => {
                        this.props.history.push('/user/ctsv/danh-gia-drl/upload');
                    }, tooltip: 'Tải lên điểm rèn luyện'
                },
            ],
            backRoute: '/user/ctsv/diem-ren-luyen',
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sinhVien: state.ctsv.ctsvDanhGiaDrl, dmDrlXepLoai: state.ctsv.dmDrlXepLoai });
const mapActionsToProps = {
    getStudentsPage, getScheduleSettings, editDrlTongKet, lockDrlTongKet, getDrlPage, multiAddDssvDrl, getPageDrlXepLoai
};
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsPage);