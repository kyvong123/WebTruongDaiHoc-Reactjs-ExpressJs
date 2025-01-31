import React from 'react';
import { connect } from 'react-redux';
import { getDtThoiKhoaBieuPage, updateDtThoiKhoaBieu, updateDtThoiKhoaBieuCondition, deleteDtThoiKhoaBieu, deleteMultipleDtThoiKhoaBieu, updateTinhTrangHocPhan, updateTinhTrangKhoaHocPhan } from './redux';
import { Link } from 'react-router-dom';
// import { getValidOlogy } from '../dtDanhSachChuyenNganh/redux';
import { SelectAdapter_DmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, renderDataTable, TableCell, TableHead, getValue, AdminModal } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter, SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getDmCaHocAll } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import UpdateMultiModal from './modal/UpdateMultiModal';
import ChangeTKBModal from './modal/ChangeTKBModal';
// import PrintScanFileModal from './modal/PrintScanFileModal';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { getAllDtDmTinhTrangHocPhan } from 'modules/mdDaoTao/dtDmTinhTrangHocPhan/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtKhoaDaoTao, SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2, SelectAdapter_DmDonViFaculty_V3 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { ProcessModal } from 'modules/mdDaoTao/dtCauHinhDotDkhp/adjustPage';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import ExportTkbPhongModal from './modal/ExportTkbPhongModal';
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
                <FormSelect className='col-md-3' ref={e => this.khoaSV = e} data={SelectAdapter_DtKhoaDaoTao} label='Khoá sinh viên' placeholder='Tất cả khoá SV' multiple allowClear />
                <FormSelect className='col-md-3' ref={e => this.loaiHinh = e} data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} label='Loại hình đào tạo' onChange={this.handleLoaiHinh} allowClear />
                <FormSelect className='col-md-6' ref={e => this.donVi = e} data={SelectAdapter_DmDonViFaculty_V3} label='Đơn vị (theo mã lớp)' placeholder='Tất cả khoa' multiple />
                <FormSelect className='col-md-6' ref={e => this.donViChuQuan = e} data={SelectAdapter_DmDonViFaculty_V2} label='Đơn vị chủ quản' placeholder='Tất cả khoa' multiple />
                <FormSelect className='col-md-12' ref={e => this.cheDo = e} data={dataCheDo} label='Chọn chế độ' required />
            </div>,
        });
    }
}
class DtThoiKhoaBieuPage extends AdminPage {
    defaultSortTerm = 'maHocPhan_ASC'
    check = {}
    state = {
        page: null, isEdit: {}, sucChua: {}, filter: {}, changeFilter: {}, namFilter: '', hocKy: '', listChosen: [], isCoDinh: true, sortTerm: 'maHocPhan_ASC', datas: {}, rows: {},
        isTinhTrang: false, isTuChon: false, isTongTiet: false, isSLTD: false, isLop: false, isKhoaBoMon: false, isGiangVien: false, isTroGiang: false, isLoaiHinh: false, isKhoaSV: false, checked: false,
        isKeySearch: true, isSort: true, isFixCol: true,
    }

    componentDidMount() {
        // let listHideCol = T.storage('dtThoiKhoaBieuAdminPageHideCol');
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
                // this.changeAdvancedSearch(true);
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
            this.sltd?.value(isSLTD);
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

    getVal = (index) => {
        return {
            phong: getValue(this.state.rows[index]?.phong),
            tietBatDau: getValue(this.state.rows[index]?.tietBatDau),
            soTietBuoi: getValue(this.state.rows[index]?.soTiet),
            soLuongDuKien: getValue(this.state.rows[index]?.sldk),
            maLop: getValue(this.state.rows[index]?.maLop),
            giangVien: getValue(this.state.rows[index]?.giangVien),
            troGiang: getValue(this.state.rows[index]?.troGiang),
        };
    }

    setVal = (rows, index, item) => {
        rows[index]?.phong?.value(item.phong || '');
        rows[index]?.tietBatDau?.value(item.tietBatDau || '');
        rows[index]?.soTiet?.value(item.soTietBuoi || '');
        rows[index]?.sldk?.value(item.soLuongDuKien || '');
        rows[index]?.maLop?.value(item.maLop?.split(', ') || '');
        rows[index]?.giangVien?.value(item.shccGV ? item.shccGV.split(',') : '');
        rows[index]?.troGiang?.value(item.shccTG ? item.shccTG.split(',') : '');
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

    delete = (item) => {
        T.confirm('Xóa môn học', `Bạn sẽ xóa môn ${item.maMonHoc} - Lớp ${item.nhom}`, 'warning', 'true', isConfirm => {
            if (isConfirm) {
                this.props.deleteDtThoiKhoaBieu(item.maHocPhan);
            }
        });
    }

    handleCheckLoaiMonHoc = (value, item) => {
        this.props.updateDtThoiKhoaBieuCondition(item.id, { loaiMonHoc: Number(value) });
    }

    handleAutoGen = (e) => {
        e?.preventDefault();
        T.confirm('Lưu ý', 'Hãy chắc chắn rằng bạn đã chọn mở các môn theo đúng đợt', 'warning', true, isConfirm => isConfirm && this.props.history.push('/user/dao-tao/thoi-khoa-bieu/auto-generate'));
    }

    deleleMultiple = () => {
        T.confirm('Xác nhận', 'Bạn chắc chắn muốn xoá những học phần đã chọn', 'warning', true, isConfirm => {
            if (isConfirm) {
                let list = this.state.listChosen.filter(i => !i.siSo).map(i => i.maHocPhan);
                this.props.deleteMultipleDtThoiKhoaBieu(list, () => {
                    this.updateModal.hide();
                    this.setState({ listChosen: [], checked: false });
                });
            }
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

    selectTinhTrang = (hocPhan, permission) => {
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
                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={item.ma}
                                    onClick={() => permission.write && this.props.updateTinhTrangHocPhan(hocPhan.maHocPhan, { tinhTrang: item.ma })}>
                                    {item.ten}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        );
    }

    setMultiTinhTrang = (item) => {
        T.confirm('Thay đổi tình trạng', `Bạn muốn thay đổi tình trạng của ${this.state.listChosen.length} học phần này thành ${item.ten}`, 'warning', 'true', isConfirm => {
            if (isConfirm) {
                let listHocPhan = this.state.listChosen.map(i => i.maHocPhan);
                this.props.updateTinhTrangHocPhan(listHocPhan, { tinhTrang: item.ma }, () => {
                    this.setState({ listChosen: [], checked: false });
                });
            }
        });
    }

    selectMultiTinhTrang = () => {
        return this.state.isTinhTrang && this.state.listChosen.length > 1 ? (
            <> Tình trạng học phần <br />
            </>
        ) : (<>Tình trạng học phần</>);
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

    edit = (e, item, index) => {
        e && e.preventDefault();
        const edit = this.state.datas[index]?.edit;
        if (edit) {
            let changes = {};
            if (item.soTuan) {
                changes = {
                    soLuongDuKien: getValue(this.state.rows[index]?.sldk),
                    maLop: getValue(this.state.rows[index]?.maLop),
                    giangVien: getValue(this.state.rows[index]?.giangVien),
                    troGiang: getValue(this.state.rows[index]?.troGiang),
                    phong: item.phong, tietBatDau: item.tietBatDau, soTietBuoi: item.soTietBuoi,
                };
            } else {
                changes = this.getVal(index);
            }
            if (item.siSo > changes.soLuongDuKien) {
                T.notify('Số lượng dự kiến nhỏ hơn sĩ số hiện tại', 'warning');
                this.state.rows[index]?.sldk.focus();
            } else {
                let { coSo, maHocPhan, namHoc, hocKy, thu, id, tenMonHoc } = item;
                this.changeTKBModal.show({ ...changes, coSo, maHocPhan, namHoc, hocKy, thu, id, tenMonHoc });
            }
        } else {
            Object.keys(this.state.datas).forEach(item => this.state.datas[item].edit = false);
            this.setState({
                datas: { ...this.state.datas, [index]: { edit: !edit } },
            }, () => {
                this.setVal(this.state.rows, index, item);
            });
        }
    }

    selectPhong = (item, index) => {
        let edit = this.state.datas && this.state.datas[index]?.edit && !item.soTuan;
        return edit ? <FormSelect className='input-group' ref={e => { if (this.state.rows[index]) this.state.rows[index].phong = e; }} readOnly={!edit} data={SelectAdapter_DmPhongAll(item.coSo)} /> : item.phong;
    }

    selectTietBatDau = (item, index) => {
        let edit = this.state.datas && this.state.datas[index]?.edit && !item.soTuan;
        return edit ? <FormSelect className='input-group' style={{ width: '150px' }} ref={e => { if (this.state.rows[index]) this.state.rows[index].tietBatDau = e; }} readOnly={!edit} data={SelectAdapter_DmCaHoc(item.coSo)} /> : item.tietBatDau;
    }

    selectSoTiet = (item, index) => {
        let edit = this.state.datas && this.state.datas[index]?.edit && !item.soTuan;
        return edit ? <FormTextBox type='number' ref={e => { if (this.state.rows[index]) this.state.rows[index].soTiet = e; }} readOnly={!edit} /> : item.soTietBuoi;
    }

    selectSLDK = (item, index) => {
        let edit = this.state.datas && this.state.datas[index]?.edit;
        return edit ? <FormTextBox type='number' ref={e => { if (this.state.rows[index]) this.state.rows[index].sldk = e; }} readOnly={!edit} /> : item.soLuongDuKien;
    }

    selectLop = (item, index) => {
        let edit = this.state.datas && this.state.datas[index]?.edit;
        return edit ? <FormSelect className='input-group' ref={e => { if (this.state.rows[index]) this.state.rows[index].maLop = e; }} multiple data={SelectAdapter_DtLopFilter()} readOnly={!edit} /> : item.maLop;
    }

    selectGiangVien = (item, index) => {
        let edit = this.state.datas && this.state.datas[index]?.edit;
        return edit ? <FormSelect style={{ minWidth: '250px' }} className='input-group' ref={e => { if (this.state.rows[index]) this.state.rows[index].giangVien = e; }} multiple data={SelectAdapter_FwCanBoGiangVien} readOnly={!edit} /> : (item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((gv, i) => <div key={i}>{gv}</div>) : '');
    }

    selectTroGiang = (item, index) => {
        let edit = this.state.datas && this.state.datas[index]?.edit;
        return edit ? <FormSelect style={{ minWidth: '250px' }} className='input-group' ref={e => { if (this.state.rows[index]) this.state.rows[index].troGiang = e; }} multiple data={SelectAdapter_FwCanBoGiangVien} readOnly={!edit} /> : (item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((tg, i) => <div key={i}>{tg}</div>) : '');
    }

    handleUpdateTinhTrangKhoa = (value, maHocPhan) => {
        this.props.updateTinhTrangKhoaHocPhan(maHocPhan, value);
    }

    render() {
        const permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete', 'manage', 'export', 'import']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtThoiKhoaBieu?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };
        let { isTinhTrang, isTongTiet, isSLTD, isLop, isKhoaBoMon, isGiangVien, isTroGiang, isLoaiHinh, isKhoaSV } = this.state;
        let { khoaSinhVienFilter, loaiHinhDaoTaoFilter } = this.state.filter;
        let { listChosen, filter } = this.state;
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
            stickyHead: this.state.isCoDinh,
            divStyle: { height: this.state.displayCol ? '53vh' : '59vh' },
            style: { fontSize: '0.8rem' },
            header: 'thead-light',
            className: permission.write ? (this.state.isFixCol ? 'table-fix-col table-pin' : 'table-pin') : '',
            customClassName: 'table-pin-wrapper',
            renderHead: () => (
                <tr>
                    {/* <TableHead content='#' /> */}
                    <TableHead className='sticky-col pin-1-col' content={
                        <span className='animated-checkbox d-flex flex-column'>
                            <label>Chọn</label>
                            <label style={{ marginBottom: '0' }}>
                                <input type='checkbox' disabled={!permission.write} ref={e => this.checkAll = e} onChange={() => this.setState({ checked: !this.state.checked, listChosen: !this.state.checked ? list.map(item => ({ maHocPhan: item.maHocPhan, maMonHoc: item.maMonHoc, soLuongDuKien: item.soLuongDuKien, tenMonHoc: item.tenMonHoc, siSo: item.siSo || 0, idSemester: item.idSemester, coSo: item.coSo, soTuan: item.soTuan })) : [] })} checked={this.state.checked} />
                                <s className='label-text' />
                            </label>
                        </span>
                    } style={{ textAlign: 'center' }} />
                    <TableHead className='sticky-col pin-2-col' content='Mã học phần' keyCol='maHocPhan' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead className='sticky-col pin-3-col' content='Tên môn học' style={{ width: '100%', minWidth: '200px', maxWidth: '200px' }} keyCol='tenMonHoc' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', display: isTinhTrang ? '' : 'none' }} content='TT' keyCol='tinhTrang' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Tổng tiết' style={{ display: isTongTiet ? '' : 'none', minWidth: '30px' }} keyCol='tongTiet' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='SLĐK' style={{ width: 'auto', minWidth: '30px' }} keyCol='slDangKy' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='SLTĐ' style={{ display: isSLTD ? '' : 'none', minWidth: '70px' }} keyCol='soLuongDuKien' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Thứ' keyCol='thu' style={{ minWidth: '30px' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Tiết' keyCol='tietBatDau' style={{ minWidth: '30px' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Số tiết' keyCol='soTiet' style={{ minWidth: '30px' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Phòng' keyCol='phong' style={{ minWidth: '90px' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Lớp' keyCol='lop' style={{ minWidth: '70px', display: isLop ? '' : 'none' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead content='Ngày bắt đầu' keyCol='ngayBatDauBuoi' style={{ width: 'auto' }} onKeySearch={onKeySearch} typeSearch='date' onSort={onSort} />
                    <TableHead content='Ngày kết thúc' keyCol='ngayKetThucBuoi' style={{ width: 'auto' }} onKeySearch={onKeySearch} typeSearch='date' onSort={onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', display: isGiangVien ? '' : 'none' }} content='Giảng viên' keyCol='giangVien' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', display: isTroGiang ? '' : 'none' }} content='Trợ giảng' keyCol='troGiang' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead style={{ minWidth: '100px', textAlign: 'center', display: isLoaiHinh ? '' : 'none' }} content='Loại hình' keyCol='he' onKeySearch={loaiHinhDaoTaoFilter ? null : onKeySearch} typeSearch='select' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} onSort={onSort} />
                    <TableHead style={{ minWidth: '100px', textAlign: 'right', whiteSpace: 'nowrap', display: isKhoaSV ? '' : 'none' }} content='Khoá SV' keyCol='khoaSV' onKeySearch={khoaSinhVienFilter ? null : onKeySearch} typeSearch='select' data={this.state.dataKhoaSinhVien || []} onSort={onSort} />
                    <TableHead style={{ whiteSpace: 'nowrap', display: isKhoaBoMon ? '' : 'none' }} content='Khoa - Bộ môn' keyCol='khoa' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead style={{ whiteSpace: 'nowrap', width: 'auto' }} content='Chỉ cho phép khoa đăng ký' />
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                const rows = [];
                let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                    rowSpan = listHocPhan.length;
                let edit = this.state.datas && this.state.datas[indexOfItem]?.edit;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const hocPhan = listHocPhan[i];
                        if (i == 0) {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: '#fff' }}>
                                    {/* <TableCell style={{ textAlign: 'right' }} content={indexOfItem} rowSpan={rowSpan} /> */}
                                    <TableCell className='sticky-col pin-1-col' type='checkbox' isCheck style={{ textAlign: 'center' }} content={this.state.listChosen.map(item => item.maHocPhan).includes(hocPhan.maHocPhan)} onChanged={value => this.setState({ listChosen: value ? [...this.state.listChosen, { maHocPhan: hocPhan.maHocPhan, maMonHoc: hocPhan.maMonHoc, soLuongDuKien: hocPhan.soLuongDuKien, tenMonHoc: hocPhan.tenMonHoc, siSo: hocPhan.siSo, idSemester: hocPhan.idSemester, coSo: hocPhan.coSo, soTuan: hocPhan.soTuan }] : this.state.listChosen.filter(i => i.maHocPhan != hocPhan.maHocPhan) })} permission={permission} rowSpan={rowSpan} />

                                    <TableCell className='sticky-col pin-2-col' style={{ width: 'auto' }} type='link' content={hocPhan.maHocPhan} url={`${window.location.origin}/user/dao-tao/thoi-khoa-bieu/edit/${hocPhan.maHocPhan}`} rowSpan={rowSpan} />
                                    <TableCell className='sticky-col pin-3-col' content={
                                        <Tooltip title={hocPhan.tenKhoaBoMon} arrow placement='right-end'>
                                            <span style={{ color: 'blue' }}>{T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi}</span>
                                        </Tooltip>
                                    } rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center', display: isTinhTrang ? '' : 'none' }} content={this.selectTinhTrang(hocPhan, permission)} rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', display: isTongTiet ? '' : 'none', fontWeight: 'normal' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={hocPhan.siSo || 0} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ display: isSLTD ? '' : 'none', textAlign: 'center' }} content={this.selectSLDK(hocPhan, indexOfItem)} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ textAlign: 'center' }} content={hocPhan.thu} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.selectTietBatDau(hocPhan, indexOfItem)} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.selectSoTiet(hocPhan, indexOfItem)} />
                                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={<Tooltip title={this.state.filter.sucChua || hocPhan.sucChua || ''} arrow ><span>{this.selectPhong(hocPhan, indexOfItem)}</span></Tooltip>} />
                                    <TableCell style={{ width: 'auto', minWidth: '75px', whiteSpace: 'pre-wrap', display: isLop ? '' : 'none' }} content={this.selectLop(hocPhan, indexOfItem)} rowSpan={rowSpan} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDauBuoi} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThucBuoi} />
                                    <TableCell style={{ whiteSpace: 'nowrap', display: isGiangVien ? '' : 'none' }} content={this.selectGiangVien(hocPhan, indexOfItem)} />
                                    <TableCell style={{ whiteSpace: 'nowrap', display: isTroGiang ? '' : 'none' }} content={this.selectTroGiang(hocPhan, indexOfItem)} />
                                    <TableCell style={{ textAlign: 'center', display: isLoaiHinh ? '' : 'none' }} content={hocPhan.loaiHinhDaoTao} rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'right', display: isKhoaSV ? '' : 'none' }} content={hocPhan.khoaSinhVien} rowSpan={rowSpan} />
                                    <TableCell style={{ textAlign: 'center', display: isKhoaBoMon ? '' : 'none' }} content={hocPhan.tenKhoaDangKy} rowSpan={rowSpan} />
                                    <TableCell type='checkbox' isSwitch key={Number(hocPhan.isOnlyKhoa)} content={Number(hocPhan.isOnlyKhoa)} permission={permission} rowSpan={rowSpan} onChanged={value => this.handleUpdateTinhTrangKhoa(value, hocPhan.maHocPhan)} />
                                    <TableCell type='buttons' style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={hocPhan} permission={permission} rowSpan={rowSpan}>
                                        {(permission.write || permission.manage) && hocPhan.soBuoi == 1 && <Tooltip title={edit ? 'Hoàn tất' : 'Chỉnh sửa nhanh'} arrow>
                                            <button className='btn btn-primary' onClick={(e) => e && e.preventDefault() || this.edit(e, hocPhan, indexOfItem)}>
                                                <i className={'fa fa-lg ' + (edit ? 'fa-check' : 'fa-edit')} />
                                            </button>
                                        </Tooltip>}
                                        {edit && hocPhan.soBuoi == 1 && <Tooltip title='Hủy chỉnh sửa' arrow>
                                            <button className='btn btn-danger' onClick={(e) => e && e.preventDefault() || this.setState({ datas: { ...this.state.datas, [indexOfItem]: { edit: !edit } } })}>
                                                <i className={'fa fa-lg fa-ban'} />
                                            </button>
                                        </Tooltip>}
                                        {((permission.write || permission.manage) && !edit) && <Tooltip title='Quản lý chi tiết' arrow>
                                            <button className='btn btn-warning' onClick={(e) => e.preventDefault() || this.props.history.push(`/user/dao-tao/thoi-khoa-bieu/edit/${hocPhan.maHocPhan}`)}>
                                                <i className='fa fa-lg fa-cog' />
                                            </button>
                                        </Tooltip>}
                                        {((permission.write || permission.manage) && !hocPhan.siSo && !edit) && <Tooltip title='Xóa' arrow>
                                            <button className='btn btn-danger' onClick={e => e.preventDefault() || this.delete(hocPhan)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </button>
                                        </Tooltip>}
                                    </TableCell>
                                </tr>);
                        } else {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: '#fff' }}>
                                    <TableCell type='number' style={{ textAlign: 'center' }} content={hocPhan.thu} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.selectTietBatDau(hocPhan, indexOfItem)} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.selectSoTiet(hocPhan, indexOfItem)} />
                                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={<Tooltip title={this.state.filter.sucChua || hocPhan.sucChua || ''} arrow ><span>{this.selectPhong(hocPhan, indexOfItem)}</span></Tooltip>} />
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
                    <ChangeTKBModal ref={e => this.changeTKBModal = e} dataTiet={this.state.dataTiet} update={this.props.updateDtThoiKhoaBieu} handleUpdate={() => {
                        Object.keys(this.state.datas).forEach(item => this.state.datas[item].edit = false);
                        this.setState({ datas: { ...this.state.datas } });
                    }} />
                    <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                        <div className='title'>
                            <div style={{ gap: 10, display: 'inline-flex' }}>
                                <FormCheckbox label='Tìm theo cột' value={true} onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Điều chỉnh cột hiển thị' onChange={value => this.displayColumn(value)} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Sort' value={true} onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                                <div style={{ gap: 10, margin: '0 50px', display: listChosen.length ? 'flex' : 'none' }}>
                                    <Tooltip title={`Xoá ${listChosen.length} lớp`} arrow>
                                        <button className='btn btn-danger' type='button' style={{}} onClick={() => this.updateModal.show({ isDelete: 1 })}>
                                            <i className='fa fa-sm fa-trash' />
                                        </button>
                                    </Tooltip>
                                    <div className='btn-group' role='group'>
                                        <Tooltip title={`Cập nhật tình trạng ${listChosen.length} lớp`} arrow>
                                            <button id='updateStatus' type='button' className='btn btn-primary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                                <i className='fa fa-lg fa-cogs' />
                                            </button>
                                        </Tooltip>
                                        <div className='dropdown-menu' aria-labelledby='updateStatus'>
                                            {
                                                this.state.dataTinhTrang && this.state.dataTinhTrang.map((item) => {
                                                    return (
                                                        <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={item.ma}
                                                            onClick={() => this.setMultiTinhTrang(item)}>
                                                            {item.ten}
                                                        </p>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                    <Tooltip title={`Cập nhật số lượng dự kiến ${listChosen.length} lớp`} arrow>
                                        <button className='btn btn-info' type='button' onClick={() => this.updateModal.show({ isUpdate: 1 })}>
                                            <i className='fa fa-sm fa-repeat' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title={`Xếp thời khóa biểu ${listChosen.length} học phần`} arrow>
                                        <button className='btn btn-secondary' type='button' onClick={() => {
                                            if (!listChosen.every(i => i.idSemester == listChosen[0].idSemester)) {
                                                T.notify('Vui lòng chọn các học phần trong cùng một học kỳ!', 'danger');
                                            } else if (listChosen.some(i => i.soTuan)) {
                                                listChosen.filter(i => i.soTuan).forEach(i => T.notify(`Học phần ${i.maHocPhan} đã có tuần học!`, 'danger'));
                                            } else {
                                                this.props.history.push({ pathname: '/user/dao-tao/thoi-khoa-bieu/gen-schedule', state: { filter, listChosen } });
                                            }
                                        }}>
                                            <i className='fa fa-sm fa-leaf' />
                                        </button>
                                    </Tooltip>
                                    {/* <Tooltip title='In file scan lớp' arrow>
                                    <button className='btn btn-warning' type='button' onClick={() => this.printScanFileModal.show()}>
                                        <i className='fa fa-sm fa-print' />
                                    </button>
                                </Tooltip> */}
                                </div>
                            </div>
                        </div>
                        {/* <span className='font-weight-bold'>Số học phần: {(list || []).length} / {totalItem}</span> */}
                        <div style={{ gap: 10 }} className='btn-group'>
                            <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} pageRange={6} />
                            {/* <button className='btn btn-info' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                                <i className='fa fa-lg fa-search-plus' /> Tìm kiếm
                            </button> */}
                        </div>
                    </div>
                    {table}
                </div>
                {/* <AddHocPhanModal ref={e => this.addModal = e} filter={this.state.filter} /> */}
                <UpdateMultiModal ref={e => this.updateModal = e} listChosen={this.state.listChosen} update={() => {
                    this.updateModal.hide();
                    this.setState({ listChosen: [], checked: false });
                }} delete={this.deleleMultiple} />
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
                {/* <PrintScanFileModal ref={e => this.printScanFileModal = e} listChosen={this.state.listChosen} showProcessModal={() => this.processModal.show()} hideProcessModal={() => this.processModal.hide()} updateProcess={(process) => this.setState({ process })} /> */}
                <ExportTkbModal ref={e => this.exportTkbModal = e} filter={this.state.filter} />
                <ExportTkbPhongModal ref={e => this.tkbPhongModal = e} />
            </>,
            backRoute: '/user/dao-tao/danh-muc/thoi-khoa-bieu',
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
                        <FormCheckbox ref={e => this.sltd = e} label='Số lượng tối đa' onChange={value => this.setState({ isSLTD: value }, () => T.cookie('isSLTD', value))} style={{ marginBottom: '0' }} />
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
                // { icon: 'fa-plus', name: 'Tạo lớp học phần', permission: permission.write, onClick: e => e.preventDefault() || this.addingModal.show(), type: 'info' },
                { icon: 'fa-plus-square', name: 'Tạo học phần', permission: permission.write, type: 'purple', onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/thoi-khoa-bieu/new', { filter: this.state.filter }) },
                // { icon: 'fa-cogs', name: 'Auto generating schedule', permission: permission.write, type: 'warning', onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/thoi-khoa-bieu/auto-generate') },
                { icon: 'fa-sliders', name: 'Sinh thời khóa biểu', permission: permission.write, type: 'success', onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/thoi-khoa-bieu/auto-generate-schedule') },
                // { icon: 'fa-search', name: 'Available room', permission: permission.read, type: 'danger', onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/thoi-khoa-bieu/tra-cuu') },
                { icon: 'fa-cloud-upload', name: 'Import thời khóa biểu', permission: permission.write, type: 'warning', onClick: e => e.preventDefault() || this.props.history.push({ pathname: '/user/dao-tao/thoi-khoa-bieu/import-thoi-khoa-bieu', state: { filter: this.state.filter } }) },
                { icon: 'fa-table', name: 'Thống kê thời khóa biểu', permission: permission.write, type: 'purple', onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/thoi-khoa-bieu/thong-ke-tuan-hoc') },
                { icon: 'fa-file-text', name: 'Export thời khóa biểu phòng', permission: permission.export || permission.manage, onClick: e => e.preventDefault() || this.tkbPhongModal.show(), type: 'danger' },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getDtThoiKhoaBieuPage, updateDtThoiKhoaBieu, updateDtThoiKhoaBieuCondition, deleteDtThoiKhoaBieu, getDmCaHocAll, deleteMultipleDtThoiKhoaBieu, updateTinhTrangHocPhan, getAllDtDmTinhTrangHocPhan, getScheduleSettings, updateTinhTrangKhoaHocPhan };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuPage);
