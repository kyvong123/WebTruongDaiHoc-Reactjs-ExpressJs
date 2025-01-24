import React from 'react';
import { connect } from 'react-redux';
import { getSdhDiemHocPhanPage, updateSdhTinhTrangDiemMulti, updateSdhTinhTrangDiem } from './redux';
import { getSdhDiemConfigThanhPhanAll } from '../sdhDiemConfigThanhPhan/redux';
import { getSdhSemesterCurrent, SelectAdapter_SchoolYear } from '../sdhSemester/redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableCell, TableHead, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DmHocSdh } from '../dmHocSdh/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { getAllSdhDmTinhTrangDiem } from '../sdhDmTinhTrangDiem/redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import { SelectAdapter_SdhKhoaHocVien } from '../sdhKhoaDaoTao/redux';
import RateModal from './modal/updateGradeRate';
import TimeModal from './modal/timeModal';

class SdhDiemPage extends AdminPage {
    state = { isFixCol: true, isKeySearch: true, isCoDinh: true, isSort: true, filter: {}, sortTerm: '', dataTinhTrang: [], dataThanhPhan: [], chosenList: [], checked: false }
    defaultSortTerm = 'maHocPhan_ASC';
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.showAdvanceSearch();
            this.initData(() => this.getPage(undefined, undefined, '', {}));
        });
    }

    getPage = (pageNumber, pageSize, pageCondition) => {
        this.setState({ checked: false, chosenList: [] });
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDiemHocPhanPage(pageNumber, pageSize, pageCondition, filter);
    }

    initData = (done) => {
        this.props.getAllSdhDmTinhTrangDiem(items => this.setState({ dataTinhTrang: items }));
        this.props.getSdhSemesterCurrent(data => {
            this.getDefaultConfig(data.namHoc, data.hocKy);
            this.namHoc.value(data.namHoc);
            this.hocKy.value(data.hocKy);
            this.khoaHocVien.value('');
            this.phanHe.value('');
            this.setState({ filter: { khoaHocVienFilter: '', phanHeFilter: '', hocKyFilter: data.hocKy, namHocFilter: data.namHoc } }, () => done && done());
        });
    }

    getDefaultConfig = (namHoc, hocKy) => {
        this.props.getSdhDiemConfigThanhPhanAll({ namHoc, hocKy }, items => this.setState({ dataThanhPhan: items && items.reduce((obj, item) => Object.assign(obj, { [item.ma]: item }), {}) }));
    }

    changeFilter = (key, value, pageNumber, pageSize, pageCondition) => {
        let filter = { ...this.state.filter };
        filter[key] = value;
        this.setState({ filter }, () => {
            this.getDefaultConfig(filter.namHocFilter, filter.hocKyFilter);
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    mapperStyle = {
        1: 'btn-secondary',
        2: 'btn-success',
        3: 'btn-info',
        4: 'btn-danger',
    }

    mapperIcon = {
        1: <i className=' fa fa-list-alt' />,
        2: <i className='fa fa-pencil-square-o' />,
        3: <i className='fa fa-eye' />,
        4: <i className='fa fa-lock' />,
    }
    selectTinhTrang = (hocPhan) => {
        return (
            <div className='btn-group' role='group'>
                <button id='btnGroupDrop1' type='button' className={'btn dropdown-toggle ' + this.mapperStyle[parseInt(hocPhan.tinhTrangDiem) || 1]} style={{ fontWeight: 'normal' }} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <span>
                        {this.mapperIcon[hocPhan.tinhTrangDiem || 1]}
                    </span>
                </button>
                <div className='dropdown-menu' aria-labelledby='btnGroupDrop1'>
                    {
                        this.state.dataTinhTrang && this.state.dataTinhTrang.map((item) => {
                            return (
                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={item.ma}
                                    onClick={() => {
                                        if (!this.state.chosenList.length)
                                            this.props.updateSdhTinhTrangDiem(hocPhan.maHocPhan, { tinhTrangDiem: item.ma });
                                        else
                                            //reset choosen item
                                            this.props.updateSdhTinhTrangDiemMulti(this.state.chosenList, { tinhTrangDiem: item.ma }, () => {
                                                this.setState({ chosenList: [], checked: false });
                                            });

                                    }}>
                                    {item.ten}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        );
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    handleSeleted = (value, item) => {
        let chosenList = this.state.chosenList;
        chosenList = value ? [...chosenList, item.maHocPhan] : chosenList.filter(i => i != item.maHocPhan);
        this.setState({ chosenList, checked: chosenList.length && chosenList.length == this.props.sdhDiemManage.page.list.length });
    }

    resetSelected = () => {
        this.setState({ chosenList: [], checked: false });
    }

    updateTinhTrang = (item) => {
        const chosenList = [...this.state.chosenList];
        this.props.updateSdhTinhTrangDiemMulti(chosenList, { tinhTrangDiem: item.ma }, () => this.resetSelected());
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhDiemManage && this.props.sdhDiemManage.page ? this.props.sdhDiemManage.page
            : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] },
            permission = this.getUserPermission('sdhDiemManage', ['read', 'write', 'manage', 'delete']),
            onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        const defaultConfig = this.state.dataThanhPhan,
            { chosenList, dataTinhTrang } = this.state;
        const table = renderDataTable({
            data: list,
            stickyHead: true,
            divStyle: { height: '65vh' },
            style: { fontSize: '0.8rem' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (<>
                <tr>
                    <TableHead content={'#'} />
                    <TableHead content={
                        <span className='animated-checkbox d-flex flex-column'>
                            <label>Chọn</label>
                            <label style={{ marginBottom: '0' }}>
                                <input type='checkbox' ref={e => this.checkAll = e} onChange={() => this.setState({ checked: !this.state.checked, chosenList: !this.state.checked ? list.map(item => item.maHocPhan) : [] })} checked={this.state.checked} />
                                <s className='label-text' />
                            </label>
                        </span>
                    } style={{ textAlign: 'center' }} />
                    <TableHead keyCol='tinhTrang' onKeySearch={onKeySearch} onSort={onSort} content={'TT'} />
                    <TableHead keyCol='maHocPhan' onKeySearch={onKeySearch} onSort={onSort} content={'Mã học phần'} />
                    <TableHead keyCol='tenMonHoc' onKeySearch={onKeySearch} onSort={onSort} content={'Tên môn học'} />
                    <TableHead keyCol='thoiGianNhap' onKeySearch={onKeySearch} onSort={onSort} content={'Ngày bắt đầu nhập'} typeSearch='date' />
                    <TableHead keyCol='thoiGianKetThucNhap' onKeySearch={onKeySearch} onSort={onSort} content={'Ngày kết thúc nhập'} typeSearch='date' />
                    <TableHead keyCol='lop' onKeySearch={onKeySearch} content={'Lớp'} style={{ minWidth: '100px' }} />
                    <TableHead keyCol='siSo' onKeySearch={onKeySearch} onSort={onSort} content={'Sỉ số'} style={{ minWidth: '100px' }} />
                    <TableHead keyCol='giangVien' onKeySearch={onKeySearch} content={'Giảng viên'} />
                    <th colSpan={2} style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        Điểm thành phần
                        <tr>
                            <th style={{ textAlign: 'center' }}>GK</th>
                            <th className='not-last-col' style={{ textAlign: 'center' }}>CK</th>
                        </tr>
                    </th>
                    <TableHead content={'Thao tác'} />
                </tr>
            </>
            ),
            renderRow: (item, index) => {
                const listLop = JSON.parse(item.listLop),
                    config = JSON.parse(item.config);
                return (
                    <tr key={index}>
                        <TableCell style={{ width: 'auto' }} content={index + 1} />
                        <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={this.state.chosenList.includes(item.maHocPhan)} onChanged={value => this.handleSeleted(value, item)} permission={permission} />
                        <TableCell style={{ width: 'auto' }} content={this.selectTinhTrang(item)} />
                        <TableCell style={{ width: '20%' }} content={item.maHocPhan} />
                        <TableCell style={{ width: '30%' }} content={item.tenMonHoc} />
                        <TableCell style={{ width: '25%' }} type='date' dateFormat='dd/mm/yyyy HH:mm' content={item.thoiGianNhap || ''} />
                        <TableCell style={{ width: '25%' }} type='date' dateFormat='dd/mm/yyyy HH:mm' content={item.thoiGianKetThucNhap || ''} />
                        <TableCell style={{ width: 'auto' }} content={listLop.length ? listLop.map((i) => { return <> <span> {i.maLop}</span><br /></>; }) : ''} />
                        <TableCell style={{ width: 'auto' }} content={item.siSo} />
                        <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((gv, i) => <div key={i}>{gv}</div>) : ''} />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={config && config['GK'] ? config['GK'].phanTramDiem : !config && defaultConfig['GK'] ? defaultConfig['GK'].phanTramMacDinh : ''} />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={config && config['CK'] ? config['CK'].phanTramDiem : !config && defaultConfig['CK'] ? defaultConfig['CK'].phanTramMacDinh : ''} />
                        <TableCell style={{ width: 'auto' }} content={item} type='buttons' onEdit={() => this.timeModal.show(item)} permission={{ write: permission.manage }} />
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quản lý điểm học phần',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/quan-ly-diem'>Điểm</Link>,
                'Điểm học phần'
            ],
            advanceSearchTitle: '',
            content: <>
                <div className='tile mb-0'>
                    <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                        <div className='title' style={{ gap: 10, display: 'inline-flex' }}>
                            <FormCheckbox label='Tìm theo cột' value={true} onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Cố định bảng' value={true} onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Thao tác nhanh' value={true} onChange={value => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Sort' value={true} onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                            <div style={{ gap: 10, display: chosenList.length ? 'flex' : 'none', left: '10px' }}>
                                <div className='btn-group' role='group'>
                                    <Tooltip title={`Cập nhật tình trạng điểm ${chosenList.length} học phần`} arrow>
                                        <button id='updateStatus' type='button' className='btn btn-primary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                            <i className='fa fa-lg fa-cogs' />
                                        </button>
                                    </Tooltip>
                                    <div className='dropdown-menu' aria-labelledby='updateStatus'>
                                        {
                                            dataTinhTrang && dataTinhTrang.map((item) => {
                                                return (
                                                    <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={item.ma}
                                                        onClick={() => this.updateTinhTrang(item)}>
                                                        {item.ten}
                                                    </p>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                                {permission.write && <Tooltip title={`Cập nhật tỉ lệ điểm ${chosenList.length} học phần`} arrow>
                                    <button className='btn btn-secondary' type='button' onClick={() => this.rateModal.show()}>
                                        <i className='fa fa-sm fa-edit' />
                                    </button>
                                </Tooltip>}
                            </div>
                        </div>
                        <div style={{ gap: 10 }} className='btn-group'>
                            <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} pageRange={3} style={{ position: '', marginBottom: '0' }} />
                        </div>
                    </div>
                    {table}
                </div>
                <RateModal ref={e => this.rateModal = e} dataThanhPhan={this.state.dataThanhPhan} listDiemHocPhan={list} chosenList={chosenList} defaultConfig={defaultConfig} resetSelected={this.resetSelected} permission={permission} />
                <TimeModal ref={e => this.timeModal = e} defaultConfig={defaultConfig} resetSelected={this.resetSelected} permission={permission} />
            </>,
            advanceSearch: <div className="row">
                <FormSelect className='col-md-3' label='Năm học' allowClear={true} ref={e => this.namHoc = e} placeholder='Năm học' data={SelectAdapter_SchoolYear} onChange={value => this.changeFilter('namHocFilter', value ? value.id : '', pageNumber, pageSize, pageCondition)} />
                <FormSelect className='col-md-3' label='Học kì' allowClear={true} ref={e => this.hocKy = e} placeholder='Học kì' data={SelectAdapter_DtDmHocKy} onChange={value => this.changeFilter('hocKyFilter', value ? value.id : '', pageNumber, pageSize, pageCondition)} />
                <FormSelect className='col-md-3' label='Khóa học viên' allowClear={true} ref={e => this.khoaHocVien = e} placeholder='Khóa học viên' data={SelectAdapter_SdhKhoaHocVien} onChange={value => this.changeFilter('khoaHocVienFilter', value ? value.id : '', pageNumber, pageSize, pageCondition)} />
                <FormSelect className='col-md-3' label='Phân hệ' allowClear={true} ref={e => this.phanHe = e} placeholder='Phân hệ' data={SelectAdapter_DmHocSdh} onChange={value => this.changeFilter('phanHeFilter', value ? value.id : '', pageNumber, pageSize, pageCondition)} />
            </div>,
            backRoute: '/user/sau-dai-hoc/quan-ly-diem',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDiemManage: state.sdh.sdhDiemManage });
const mapActionsToProps = { getSdhDiemConfigThanhPhanAll, getSdhSemesterCurrent, getSdhDiemHocPhanPage, getAllSdhDmTinhTrangDiem, updateSdhTinhTrangDiemMulti, updateSdhTinhTrangDiem };
export default connect(mapStateToProps, mapActionsToProps)(SdhDiemPage);