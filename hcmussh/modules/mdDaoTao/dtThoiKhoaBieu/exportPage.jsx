import React from 'react';
import { connect } from 'react-redux';
import { getDtThoiKhoaBieuPage } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormSelect, renderDataTable, TableCell, TableHead, getValue, AdminModal } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getDmCaHocAll } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { getAllDtDmTinhTrangHocPhan } from 'modules/mdDaoTao/dtDmTinhTrangHocPhan/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmDonViByFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import ExportTkbPhongModal from './modal/ExportTkbPhongModal';
import ExportFileModal from './modal/ExportFileModal';
import './card.scss';

class ExportTkbModal extends AdminModal {
    state = { filter: {} };
    componentDidMount = () => {
        this.onHidden(this.onHide);
    }

    onShow = () => {
        let { namFilter, hocKyFilter, khoaSinhVienFilter, loaiHinhDaoTaoFilter } = this.props.filter;
        this.setState({ filter: { ...this.props.filter, namFilter, hocKyFilter, khoaSinhVien: khoaSinhVienFilter, loaiHinh: loaiHinhDaoTaoFilter } }, () => {
            this.namHoc.value(namFilter);
            this.hocKy.value(hocKyFilter);
            this.khoaSV.value(khoaSinhVienFilter);
            this.loaiHinh.value(loaiHinhDaoTaoFilter);
            this.cheDo.value('tong');
        });
    }

    onHide = () => {
        this.setState({ filter: {} }, () => {
            this.donVi.value('');
            this.donViChuQuan.value('');
            this.cheDo.value('');
        });
    }

    onSubmit = () => {
        let donVi = getValue(this.donVi),
            donViChuQuan = getValue(this.donViChuQuan),
            tenDonVi = this.donVi.data().map(item => item.text),
            listKhoaSV = getValue(this.khoaSV),
            cheDo = getValue(this.cheDo);
        if (cheDo) {
            let filter = {
                ...this.state.filter,
                listKhoaSV: listKhoaSV.join(','),
                listKhoa: donVi.join(','),
                listTenKhoa: tenDonVi.join(','),
                listDonViChuQuan: donViChuQuan.join(',')
            };
            if (cheDo == 'tong') {
                T.handleDownload(`/api/dt/thoi-khoa-bieu/export-tong?filter=${T.stringify(filter)}`);
            } else if (cheDo == 'import') {
                T.handleDownload(`/api/dt/thoi-khoa-bieu/export-file-import?filter=${T.stringify(filter)}`);
            } else {
                T.handleDownload(`/api/dt/thoi-khoa-bieu/export-theo-mon?filter=${T.stringify(filter)}`);
            }
            this.hide();
        }
    }

    handleNamHoc = (value) => {
        this.setState({ filter: { ...this.state.filter, namFilter: value.id } });
    }

    handleHocKy = (value) => {
        this.setState({ filter: { ...this.state.filter, hocKyFilter: value.id } });
    }

    handleLoaiHinh = (value) => {
        this.setState({ filter: { ...this.state.filter, loaiHinh: value.id } });
    }

    render = () => {
        let dataCheDo = [
            { id: 'tong', text: 'Export tổng' },
            { id: 'mon', text: 'Export theo môn' },
            { id: 'import', text: 'Xuất dữ liệu import' },
        ];
        return this.renderModal({
            title: 'Export nâng cao',
            size: 'large',
            submitText: 'Export TKB',
            body: <div className='row'>
                <FormSelect className='col-md-3' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} label='Năm học' onChange={this.handleNamHoc} />
                <FormSelect className='col-md-3' ref={e => this.hocKy = e} data={SelectAdapter_DtDmHocKy} label='Học kỳ' onChange={this.handleHocKy} allowClear />
                <FormSelect className='col-md-3' ref={e => this.khoaSV = e} data={SelectAdapter_DtKhoaDaoTaoFilter('dtThoiKhoaBieu')} label='Khoá sinh viên' placeholder='Tất cả khoá SV' multiple allowClear />
                <FormSelect className='col-md-3' ref={e => this.loaiHinh = e} data={SelectAdapter_LoaiHinhDaoTaoFilter('dtThoiKhoaBieu')} label='Loại hình đào tạo' onChange={this.handleLoaiHinh} allowClear />
                <FormSelect className='col-md-6' ref={e => this.donVi = e} data={SelectAdapter_DmDonViByFilter('dtThoiKhoaBieu')} label='Đơn vị (theo mã lớp)' placeholder='Tất cả khoa' multiple />
                <FormSelect className='col-md-6' ref={e => this.donViChuQuan = e} data={SelectAdapter_DmDonViByFilter('dtThoiKhoaBieu')} label='Đơn vị chủ quản' placeholder='Tất cả khoa' multiple />
                <FormSelect className='col-md-12' ref={e => this.cheDo = e} data={dataCheDo} label='Chọn chế độ' required />
            </div>,
        });
    }
}
class ExportPage extends AdminPage {
    defaultSortTerm = 'maHocPhan_ASC'
    check = {}
    state = {
        page: null, isEdit: {}, sucChua: {}, filter: {}, changeFilter: {}, namFilter: '', hocKy: '', listChosen: [], isCoDinh: true, sortTerm: 'maHocPhan_ASC', datas: {}, rows: {},
        isTinhTrang: false, isTuChon: false, isTongTiet: false, isSLTD: false, isLop: false, isKhoaBoMon: false, isGiangVien: false, isTroGiang: false, isLoaiHinh: false, isKhoaSV: false, checked: false,
        isKeySearch: true, isSort: true, isFixCol: true,
    }

    componentDidMount() {
        if (!$('.app').hasClass('sidenav-toggled')) {
            $('.app').addClass('sidenav-toggled');
        }
        this.isCoDinh.value(this.state.isCoDinh);
        this.props.getDmCaHocAll(items => {
            items = [...new Set(items.map(item => ({
                id: item.ten,
                text: item.ten,
                coSo: item.maCoSo,
                buoi: item.buoi
            })
            ))];
            this.setState({ dataTiet: items });
        });
        this.props.getAllDtDmTinhTrangHocPhan((items) => {
            let mapper = {};
            items.forEach(item => {
                mapper[item.ma] = item.ten;
            });
            this.setState({ tinhTrang: mapper, dataTinhTrang: items });
        });

        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            this.changeAdvancedSearch(true);
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });
        this.initData();
    }

    initData = () => {
        const isTinhTrang = T.cookie('isTinhTrang') || true, isTongTiet = T.cookie('isTongTiet') || true,
            isLop = T.cookie('isLop') || true, isGiangVien = T.cookie('isGiangVien') || true, isSLTD = T.cookie('isSLTD') || true;

        this.setState({ isTinhTrang, isTongTiet, isLop, isGiangVien, isSLTD }, () => {
            this.tinhTrang?.value(isTinhTrang);
            this.tongTiet?.value(isTongTiet);
            this.lop?.value(isLop);
            this.giangVien?.value(isGiangVien);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.dtThoiKhoaBieu && this.props.dtThoiKhoaBieu.page ? this.props.dtThoiKhoaBieu.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        let { filter } = cookie;
        if (!filter || (typeof filter == 'string' && filter.includes('%'))) filter = {};
        if (isInitial) {
            this.showAdvanceSearch();
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.setState({
                    filter: { ...this.state.filter, namFilter: namHoc, hocKyFilter: hocKy }
                }, () => this.getPage(pageNumber, pageSize, pageCondition));
            });
        } else {
            this.getPage(pageNumber, pageSize, pageCondition);
        }
    }

    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtThoiKhoaBieuPage(pageN, pageS, pageC, filter, (data) => {
            let { pageNumber, pageSize } = data, datas = { ...this.state.datas }, rows = { ...this.state.rows };
            Object.keys(this.state.datas).forEach(item => datas[item].edit = false);
            for (let index = 0; index < pageSize; index++) {
                let i = (pageNumber - 1) * pageSize + index + 1;
                datas[i] = { edit: false };
                rows[i] = { phong: null, tietBatDau: null, soTiet: null, sldk: null, maLop: null };
            }
            this.setState({ datas, rows });
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    mapperStyle = {
        1: 'btn-secondary',
        2: 'btn-success',
        3: 'btn-danger',
        4: 'btn-primary'
    }

    mapperIcon = {
        1: <i className='fa fa-pencil-square-o' />,
        2: <i className='fa fa-check-square-o' />,
        3: <i className='fa fa-lock' />,
        4: <i className='fa fa-ban' />
    }

    selectTinhTrang = (hocPhan) => {
        return (
            <div className='btn-group' role='group'>
                <button id='btnGroupDrop1' type='button' className={'btn dropdown-toggle ' + this.mapperStyle[hocPhan.tinhTrang || 1]} style={{ fontWeight: 'normal' }} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <Tooltip title={this.state.tinhTrang ? this.state.tinhTrang[hocPhan.tinhTrang || 1] : ''} arrow placement='right-end'>
                        <span>
                            {this.mapperIcon[hocPhan.tinhTrang || 1]}
                        </span>
                    </Tooltip>
                </button>
                <div className='dropdown-menu' aria-labelledby='btnGroupDrop1' style={{ position: 'absolute' }}>
                    {
                        this.state.dataTinhTrang && this.state.dataTinhTrang.map((item) => {
                            return (
                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={item.ma}>
                                    {item.ten}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        );
    }

    displayColumn = (value) => {
        this.setState({ displayCol: value }, () => {
            this.tuChon?.value(this.state.isTuChon);
            this.tinhTrang?.value(this.state.isTinhTrang);
            this.tongTiet?.value(this.state.isTongTiet);
            this.lop?.value(this.state.isLop);
            this.giangVien?.value(this.state.isGiangVien);
        });
    }

    render() {
        const permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete', 'manage', 'export', 'import']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtThoiKhoaBieu?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };
        let { isTinhTrang, isTongTiet, isLop, isKhoaBoMon, isGiangVien, isTroGiang, isLoaiHinh, isKhoaSV, displayCol, isCoDinh, isFixCol, isSort, isKeySearch, checked, listChosen } = this.state;

        const onKeySearch = isKeySearch ? this.handleKeySearch : null,
            onSort = isSort ? this.onSort : null;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            data: list == null ? null : Object.keys(list.groupBy('maHocPhan')), stickyHead: isCoDinh,
            divStyle: { height: displayCol ? '53vh' : '59vh' },
            style: { fontSize: '0.8rem' },
            header: 'thead-light',
            className: permission.write ? (isFixCol ? 'table-fix-col' : '') : '',
            renderHead: () => (
                <tr>
                    <TableHead content={
                        <span className='animated-checkbox d-flex flex-column'>
                            <label>Chọn</label>
                            <label style={{ marginBottom: '0' }}>
                                <input type='checkbox' ref={e => this.checkAll = e} onChange={() => this.setState({ checked: !checked, listChosen: !checked ? [...new Set(list.filter(i => i.siSo).map(i => i.maHocPhan))] : [] })} checked={checked} />
                                <s className='label-text' />
                            </label>
                        </span>
                    } style={{ textAlign: 'center' }} />
                    <TableHead content='Mã học phần' keyCol='maHocPhan' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Tên môn học' style={{ width: '100%', minWidth: '200px', maxWidth: '200px' }} keyCol='tenMonHoc' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', display: isTinhTrang ? '' : 'none' }} content='Tình trạng' keyCol='tinhTrang' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Tổng tiết' style={{ display: isTongTiet ? '' : 'none', minWidth: '30px' }} keyCol='tongTiet' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='SLĐK' style={{ width: 'auto', minWidth: '30px' }} keyCol='slDangKy' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Thứ' keyCol='thu' style={{ minWidth: '30px' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Tiết' keyCol='tietBatDau' style={{ minWidth: '30px' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Số tiết' keyCol='soTiet' style={{ minWidth: '30px' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Phòng' keyCol='phong' style={{ minWidth: '90px' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Lớp' keyCol='lop' style={{ minWidth: '70px', display: isLop ? '' : 'none' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Ngày bắt đầu' keyCol='ngayBatDauBuoi' style={{ width: 'auto' }} onKeySearch={onKeySearch} typeSearch='date' onSort={onSort} />
                    <TableHead content='Ngày kết thúc' keyCol='ngayKetThucBuoi' style={{ width: 'auto' }} onKeySearch={onKeySearch} typeSearch='date' onSort={onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', display: isGiangVien ? '' : 'none' }} content='Giảng viên' keyCol='giangVien' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', display: isTroGiang ? '' : 'none' }} content='Trợ giảng' keyCol='troGiang' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead style={{ minWidth: '100px', textAlign: 'center', display: isLoaiHinh ? '' : 'none' }} content='Loại hình' keyCol='he' />
                    <TableHead style={{ minWidth: '100px', textAlign: 'right', whiteSpace: 'nowrap', display: isKhoaSV ? '' : 'none' }} content='Khoá sinh viên' keyCol='khoaSV' />
                    <TableHead style={{ whiteSpace: 'nowrap', display: isKhoaBoMon ? '' : 'none' }} content='Đơn vị tổ chức' keyCol='khoa' onKeySearch={onKeySearch} onSort={onSort} />
                </tr>),
            renderRow: (item, index) => {
                const rows = [];
                let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                    rowSpan = listHocPhan.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const hocPhan = listHocPhan[i];
                        if (i == 0) {
                            rows.push(
                                <tr key={index + 1} style={{ backgroundColor: '#fff' }}>
                                    <TableCell type='checkbox' rowSpan={rowSpan} isCheck style={{ textAlign: 'center' }} content={listChosen.includes(hocPhan.maHocPhan)} onChanged={value => this.setState({ listChosen: value ? [...listChosen, hocPhan.maHocPhan] : listChosen.filter(i => i != hocPhan.maHocPhan) })} permission={{ write: true }} readOnly={!hocPhan.siSo} />
                                    <TableCell style={{ width: 'auto' }} type='link' content={hocPhan.maHocPhan} rowSpan={rowSpan} url={`${window.location.origin}/user/dao-tao/thoi-khoa-bieu/view/${hocPhan.maHocPhan}`} />
                                    <TableCell content={
                                        <Tooltip title={hocPhan.tenKhoaBoMon} arrow placement='right-end'>
                                            <span style={{ color: 'blue' }}>{T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi}</span>
                                        </Tooltip>
                                    } rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center', display: isTinhTrang ? '' : 'none' }} content={this.selectTinhTrang(hocPhan)} rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', display: isTongTiet ? '' : 'none', fontWeight: 'normal' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={hocPhan.siSo || 0} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ textAlign: 'center' }} content={hocPhan.thu} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.soTietBuoi} />
                                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={<Tooltip title={this.state.filter.sucChua || hocPhan.sucChua || ''} arrow ><span>{hocPhan.phong}</span></Tooltip>} />
                                    <TableCell style={{ width: 'auto', minWidth: '75px', whiteSpace: 'pre-wrap', display: isLop ? '' : 'none' }} content={hocPhan.maLop} rowSpan={rowSpan} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDauBuoi} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThucBuoi} />
                                    <TableCell style={{ whiteSpace: 'nowrap', display: isGiangVien ? '' : 'none' }} content={(hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((gv, i) => <div key={i}>{gv}</div>) : '')} />
                                    <TableCell style={{ whiteSpace: 'nowrap', display: isTroGiang ? '' : 'none' }} content={(hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((tg, i) => <div key={i}>{tg}</div>) : '')} />
                                    <TableCell style={{ textAlign: 'center', display: isLoaiHinh ? '' : 'none' }} content={hocPhan.loaiHinhDaoTao} rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center', display: isKhoaSV ? '' : 'none' }} content={hocPhan.khoaSinhVien} rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center', display: isKhoaBoMon ? '' : 'none' }} content={hocPhan.tenKhoaDangKy} rowSpan={rowSpan} />
                                </tr>);
                        } else {
                            rows.push(
                                <tr key={index + 1} style={{ backgroundColor: '#fff' }}>
                                    <TableCell type='number' style={{ textAlign: 'center' }} content={hocPhan.thu} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.soTietBuoi} />
                                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={<Tooltip title={this.state.filter.sucChua || hocPhan.sucChua || ''} arrow ><span>{hocPhan.phong}</span></Tooltip>} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDauBuoi} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThucBuoi} />
                                    <TableCell style={{ whiteSpace: 'nowrap', display: isGiangVien ? '' : 'none' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap', display: isTroGiang ? '' : 'none' }} className='not-last-col' content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                </tr>
                            );
                        }
                    }
                }
                return rows;
            }
        });

        return this.renderPage({
            advanceSearchTitle: '',
            icon: 'fa fa-calendar',
            title: 'Quản lý thời khoá biểu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Quản lý thời khoá biểu'
            ],
            content: <>
                <div className='tile mb-0'>
                    <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                        <div className='title'>
                            <div style={{ gap: 10, display: 'inline-flex' }}>
                                <FormCheckbox label='Tìm theo cột' value={true} onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Điều chỉnh cột hiển thị' onChange={value => this.displayColumn(value)} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Sort' value={true} onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                                <div style={{ gap: 10, display: listChosen.length ? 'flex' : 'none' }}>
                                    <Tooltip title='Xuất danh sách' arrow>
                                        <button className='btn btn-warning' type='button' onClick={() => this.exportFileModal.show()}>
                                            <i className='fa fa-sm fa-print' /> Xuất danh sách
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div style={{ gap: 10 }} className='btn-group'>
                            <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} pageRange={6} />
                        </div>
                    </div>
                    {table}
                </div>
                <ExportTkbModal ref={e => this.exportTkbModal = e} filter={this.state.filter} />
                <ExportTkbPhongModal ref={e => this.tkbPhongModal = e} />
                <ExportFileModal ref={e => this.exportFileModal = e} listChosen={listChosen} listDataFull={list} />
            </>,
            backRoute: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-in',
            // advanceSearchTitle: 'Chọn các tham số',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} data={SelectAdapter_SchoolYear} className='col-md-3' label='Năm học' onChange={value => this.setState({ filter: { ...this.state.filter, namFilter: value.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-3' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.setState({ filter: { ...this.state.filter, hocKyFilter: value?.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} allowClear />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-3' label='Khoá' data={SelectAdapter_DtKhoaDaoTaoFilter('dtThoiKhoaBieu')} onChange={value => this.setState({ filter: { ...this.state.filter, khoaSinhVienFilter: value?.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} allowClear />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtThoiKhoaBieu')} onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTaoFilter: value?.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} allowClear />
                {this.state.displayCol &&
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='form-group col-md-12'>
                        <FormCheckbox ref={e => this.tinhTrang = e} label='Tình trạng học phần' onChange={value => this.setState({ isTinhTrang: value }, () => T.cookie('isTinhTrang', value))} style={{ marginBottom: '0' }} />
                        <FormCheckbox ref={e => this.tongTiet = e} label='Tổng tiết' onChange={value => this.setState({ isTongTiet: value }, () => T.cookie('isTongTiet', value))} style={{ marginBottom: '0' }} />
                        <FormCheckbox ref={e => this.lop = e} label='Lớp' onChange={value => this.setState({ isLop: value }, () => T.cookie('isLop', value))} style={{ marginBottom: '0' }} />
                        <FormCheckbox ref={e => this.khoaBoMon = e} label='Khoa Bộ môn' onChange={value => this.setState({ isKhoaBoMon: value }, () => T.cookie('isKhoaBoMon', value))} style={{ marginBottom: '0' }} />
                        <FormCheckbox ref={e => this.giangVien = e} label='Giảng viên' onChange={value => this.setState({ isGiangVien: value }, () => T.cookie('isGiangVien', value))} style={{ marginBottom: '0' }} />
                        <FormCheckbox ref={e => this.troGiang = e} label='Trợ giảng' onChange={value => this.setState({ isTroGiang: value }, () => T.cookie('isTroGiang', value))} style={{ marginBottom: '0' }} />
                        <FormCheckbox ref={e => this.loaiHinh = e} label='Loại hình' onChange={value => this.setState({ isLoaiHinh: value }, () => T.cookie('isLoaiHinh', value))} style={{ marginBottom: '0' }} />
                        <FormCheckbox ref={e => this.khoaSV = e} label='Khoá SV' onChange={value => this.setState({ isKhoaSV: value }, () => T.cookie('isKhoaSV', value))} style={{ marginBottom: '0' }} />
                    </div>
                }
            </div>,
            collapse: [
                { icon: 'fa-print', name: 'Export', permission: permission.export, onClick: e => e.preventDefault() || T.handleDownload(`/api/dt/thoi-khoa-bieu/download-excel?filter=${T.stringify(this.state.filter)}`, 'THOI_KHOA_BIEU.xlsx'), type: 'success' },
                { icon: 'fa-th-list', name: 'Export nâng cao', permission: permission.export, onClick: e => e.preventDefault() || this.exportTkbModal.show(), type: 'info' },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getDtThoiKhoaBieuPage, getDmCaHocAll, getAllDtDmTinhTrangHocPhan, getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(ExportPage);
