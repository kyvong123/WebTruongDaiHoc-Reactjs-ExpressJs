import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormSelect, renderDataTable, TableCell, TableHead, AdminModal, FormDatePicker, getValue } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getDtDiemPage, updateTinhTrangDiem } from './redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import PrintScanFileModal from 'modules/mdDaoTao/dtThoiKhoaBieu/modal/PrintScanFileModal';
import { ProcessModal } from 'modules/mdDaoTao/dtCauHinhDotDkhp/adjustPage';
import { updateTimeConfig } from 'modules/mdDaoTao/dtDiemConfig/redux';
import { SelectAdapter_DtDmHinhThucThi } from 'modules/mdDaoTao/dtDmHinhThucThi/redux';
import { getAllDtDiemDmTinhTrang } from 'modules/mdDaoTao/dtDiemDmTinhTrang/redux';
import UpdateMultiModal from './modal/updateMultiModal';
import UpdateTimeModal from './modal/updateTimeModal';
import UpdateRateModal from './modal/updateRateModal';

export class FolderSection extends React.Component {
    componentDidMount() {
    }

    render() {
        let { type, icon = 'fa-folder-open', title, onClick, description, className = 'col-md-4' } = this.props;
        const content = (
            <div className={'widget-small coloured-icon ' + type} style={{ marginBottom: '10px', border: 'solid' }}>
                <i className={'icon fa fa-3x ' + icon} />
                <div className='info'>
                    <h5 style={{ marginBottom: '0' }}>{title}</h5>
                    <i style={{ fontSize: '0.7rem' }} className='text-secondary'>{description}</i>
                </div>
            </div>
        );
        return (<>
            {onClick ? <a onClick={onClick} style={{ textDecoration: 'none', cursor: 'pointer' }} className={className}>{content}</a> : content}
        </>);
    }
}


class AdjustModal extends AdminModal {
    hinhThucThi = {}
    state = { configThi: [] }

    componentDidMount() {
        $(document).ready(() => {
            this.onHidden(() => {
                this.setState({ configThi: [] });
            });
        });
    }

    onShow = (item) => {
        let { maHocPhan, maMonHoc, thoiGianBatDauNhap, thoiGianKetThucNhap, maHinhThucThi } = item;

        let tpDiem = item.tpHocPhan || item.tpMonHoc,
            defaultConfig = item.configDefault ? T.parse(item.configDefault) : {};
        if (tpDiem) {
            tpDiem = T.parse(tpDiem);
        } else {
            tpDiem = {};
            Object.keys(defaultConfig).forEach(tp => tpDiem[tp] = defaultConfig[tp]?.default || 50);
        }
        let configThi = Object.keys(defaultConfig).filter(key => defaultConfig[key].isThi && Object.keys(tpDiem).includes(key)),
            hinhThucThi = T.parse(maHinhThucThi || '{}');

        this.setState({ maHocPhan, maMonHoc, configThi, hinhThucThi, tpDiem }, () => {
            this.thoiGianBatDauNhap.value(thoiGianBatDauNhap);
            this.thoiGianKetThucNhap.value(thoiGianKetThucNhap);
            configThi.forEach(i => this.hinhThucThi[i]?.value(hinhThucThi[i]?.split(', ') || ''));
        });
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        let { maHocPhan, maMonHoc, tpDiem, configThi } = this.state;
        const data = {
            thoiGianBatDauNhap: getValue(this.thoiGianBatDauNhap).setHours(0, 0, 0, 0),
            thoiGianKetThucNhap: getValue(this.thoiGianKetThucNhap).setHours(23, 59, 59, 999),
            maHocPhan, maMonHoc, tpDiem
        };

        configThi.forEach(i => data[i] = this.hinhThucThi[i].value());
        if (data.thoiGianBatDauNhap > data.thoiGianKetThucNhap) {
            T.notify('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!', 'danger');
            return;
        }

        this.props.update(data, () => {
            this.hide();
            this.props.save();
        });
    }

    render = () => {
        let { configThi } = this.state;
        return this.renderModal({
            title: `Cập nhật thông số thời gian nhập điểm của học phần ${this.state.maHocPhan}`,
            size: 'large',
            body: <div className='row'>
                <FormDatePicker type='date' ref={e => this.thoiGianBatDauNhap = e} label='Thời gian bắt đầu nhập điểm' className='col-md-12' />
                <FormDatePicker type='date' ref={e => this.thoiGianKetThucNhap = e} label='Thời gian kết thúc nhập điểm' className='col-md-12' />
                {
                    configThi.map(i => <>
                        <label style={{ padding: '0 15px' }}>Hình thức thi {i}</label>
                        <FormSelect className='col-md-12' ref={e => this.hinhThucThi[i] = e} data={SelectAdapter_DtDmHinhThucThi} multiple allowClear />
                    </>)
                }
            </div>
        });
    }
}

class DtDiemPage extends AdminPage {
    state = { listChosen: [], filter: { onlyHasNumbers: 1 }, isSort: true, isKeySearch: true }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                // this.changeAdvancedSearch(true);
                this.showAdvanceSearch();
            });
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.setState({
                    filter: { ...this.state.filter, namFilter: namHoc, hocKyFilter: hocKy }
                }, () => {
                    this.getPage(undefined, undefined, '');
                });
            });
            this.props.getAllDtDiemDmTinhTrang((items) => {
                let mapper = {};
                items.forEach(item => {
                    mapper[item.ma] = item.ten;
                });
                this.setState({ tinhTrang: mapper, dataTinhTrang: items });
            });
            T.socket.on('change-multi-thanh-phan', ({ requester, isStart, isDone }) => {
                if (requester == this.props.system.user.email) {
                    if (isStart && !isDone) {
                        T.alert('Đang cập nhật điểm sinh viên!', 'warning', false, null, true);
                    } else if (isDone) {
                        T.alert('Cập nhật điểm sinh viên thành công', 'success', false, 1000);
                    }
                }
            });
            this.setState({ tabId: Math.floor(Math.random() * 1000000) });
        });
    }

    componentWillUnmount() {
        T.socket.off('change-multi-thanh-phan');
    }

    getPage = (pN, pS, pC) => {
        this.props.getDtDiemPage(pN, pS, pC, this.state.filter);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        let [key, value] = data.split(':');
        if (key == 'ks_ngayKetThucNhap') {
            value = new Date(parseInt(value)).setHours(23, 59, 59, 999);
        }
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, sortKey: sortTerm.split('_')[0], sortMode: sortTerm.split('_')[1] } }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    mapperStyle = {
        1: 'btn-secondary',
        2: 'btn-success',
        3: 'btn-primary',
        4: 'btn-danger',
    }

    mapperIcon = {
        1: <i className='fa fa-pencil-square-o' />,
        2: <i className='fa fa-check-square-o' />,
        3: <i className='fa fa-eye' />,
        4: <i className='fa fa-lock' />
    }

    selectTinhTrang = (item) => {
        return (
            <div className='btn-group' role='group'>
                <button id='btnGroupDrop1' type='button' className={'btn dropdown-toggle ' + this.mapperStyle[item.tinhTrangDiem || 1]} style={{ fontWeight: 'normal' }} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <Tooltip title={this.state.tinhTrang ? this.state.tinhTrang[item.tinhTrangDiem || 1] : ''} arrow placement='right-end'>
                        <span>
                            {this.mapperIcon[item.tinhTrangDiem || 1]}
                        </span>
                    </Tooltip>
                </button>
                <div className='dropdown-menu' aria-labelledby='btnGroupDrop1'>
                    {
                        this.state.dataTinhTrang && this.state.dataTinhTrang.map((tt) => {
                            return (
                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={tt.ma}
                                    onClick={() => this.props.updateTinhTrangDiem([item.maHocPhan], { tinhTrangDiem: tt.ma })}>
                                    {tt.ten}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        );
    }

    setMultiTinhTrang = (item) => {
        T.confirm('Thay đổi tình trạng', `Bạn muốn thay đổi tình trạng điểm của ${this.state.listChosen.length} học phần này thành ${item.ten}`, 'warning', 'true', isConfirm => {
            if (isConfirm) {
                let listHocPhan = this.state.listChosen.map(i => i.maHocPhan);
                this.props.updateTinhTrangDiem(listHocPhan, { tinhTrangDiem: item.ma }, () => {
                    this.setState({ listChosen: [], checked: false });
                });
            }
        });
    }

    handleChange = (value, key) => {
        const { pageNumber, pageSize, pageCondition } = this.props.dtDiem?.page || { pageNumber: 1, pageSize: 50, pageCondition: '', };
        this.setState({ filter: { ...this.state.filter, [key]: value }, listChosen: [] }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const permission = this.getUserPermission('dtDiem', ['read', 'write', 'delete', 'manage', 'export', 'import']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDiem?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        const { listChosen, dataTinhTrang, filter, tabId } = this.state;
        const table = renderDataTable({
            data: list,
            stickyHead: this.state.isCoDinh,
            divStyle: { height: '69vh' },
            style: { fontSize: '0.8rem' },
            header: 'thead-light',
            renderHead: () => {
                let rowSpan = list && list.length ? 2 : 1,
                    firstItem = list && list.length && list[0].configDefault ? T.parse(list[0].configDefault) : {},
                    configThi = Object.keys(firstItem).filter(key => firstItem[key].isThi);
                return (<><tr>
                    <TableHead rowSpan={rowSpan} content='#' />
                    <TableHead rowSpan={rowSpan} style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content='TT' keyCol='tinhTrang' />
                    <TableHead rowSpan={rowSpan} content={
                        <span className='animated-checkbox d-flex flex-column'>
                            <label>Chọn</label>
                            <label style={{ marginBottom: '0' }}>
                                <input type='checkbox' ref={e => this.checkAll = e} onChange={() => this.setState({ checked: !this.state.checked, listChosen: !this.state.checked ? list : [] })} checked={this.state.checked} />
                                <s className='label-text' />
                            </label>
                        </span>
                    } style={{ textAlign: 'center' }} />
                    <TableHead rowSpan={rowSpan} content='Mã học phần' keyCol='maHocPhan' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead rowSpan={rowSpan} content='Tên môn học' style={{ width: '100%' }} keyCol='tenMonHoc' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead rowSpan={rowSpan} content='Điểm thành phần (%)' keyCol='tpDiem' onKeySearch={onKeySearch} />
                    <TableHead rowSpan={rowSpan} content={'Ngày bắt đầu nhập'} style={{ width: 'auto', textAlign: 'center' }} keyCol='ngayBatDauNhap' onKeySearch={onKeySearch} onSort={onSort} typeSearch='date' />
                    <TableHead rowSpan={rowSpan} content={'Ngày kết thúc nhập'} style={{ width: 'auto', textAlign: 'center' }} keyCol='ngayKetThucNhap' onKeySearch={onKeySearch} onSort={onSort} typeSearch='date' />
                    <TableHead rowSpan={rowSpan} content='Lớp' style={{ minWidth: '100px' }} keyCol='lop' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead rowSpan={rowSpan} content='Sĩ số' style={{ minWidth: '50px' }} keyCol='siSo' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead rowSpan={rowSpan} content='Giảng viên' style={{ width: 'auto' }} keyCol='giangVien' onKeySearch={onKeySearch} onSort={onSort} />
                    {/* <TableHead rowSpan={rowSpan} content='Mã xác thực' keyCol='code' style={{ width: 'auto' }} /> */}
                    <TableHead style={{ minWidth: '50px', textAlign: 'center', display: configThi.length ? '' : 'none' }} rowSpan={list && list.length ? 1 : 2} colSpan={configThi.length} content={'Hình thức thi'} />
                    <TableHead style={{ minWidth: '50px', textAlign: 'center', display: configThi.length ? '' : 'none' }} rowSpan={list && list.length ? 1 : 2} colSpan={configThi.length} content={'Ngày thi'} />
                    <TableHead rowSpan={rowSpan} content='Thao tác' style={{ width: 'auto' }} />
                </tr>
                    {list && list.length && configThi.length ? <tr>
                        {configThi.map(key => <th style={{ textAlign: 'center' }} key={'HinhThuc' + key}>{key}</th>)}
                        {configThi.map(key => <th style={{ textAlign: 'center' }} key={'THI' + key}>{key}</th>)}
                    </tr> : null}
                </>);
            },
            renderRow: (item, index) => {
                let dataDiem = [], tpDiem = item.tpHocPhan || item.tpMonHoc,
                    defaultConfig = item.configDefault ? T.parse(item.configDefault) : {},
                    dataThi = T.parse(item.thi) || {},
                    configThi = Object.keys(defaultConfig).filter(key => defaultConfig[key].isThi),
                    hinhThucThi = T.parse(item.hinhThucThi) || {};
                if (tpDiem) {
                    tpDiem = T.parse(tpDiem);
                    dataDiem = Object.keys(tpDiem).map(key => ({ loaiDiem: key, phanTram: tpDiem[key], loaiLamTron: defaultConfig[key]?.loaiLamTron || 0.5 })).sort((a, b) => a.phanTram - b.phanTram ? -1 : 0);
                } else {
                    tpDiem = defaultConfig;
                    dataDiem = Object.keys(tpDiem).map(key => ({ loaiDiem: key, phanTram: defaultConfig[key].default, loaiLamTron: defaultConfig[key]?.loaiLamTron || 0.5 })).sort((a, b) => a.phanTram - b.phanTram ? -1 : 0);
                }
                return <tr key={index}>
                    <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={this.selectTinhTrang(item)} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={this.state.listChosen.map(item => item.maHocPhan).includes(item.maHocPhan)} onChanged={value => this.setState({ listChosen: value ? [...this.state.listChosen, { ...item }] : this.state.listChosen.filter(i => i.maHocPhan != item.maHocPhan) })} permission={permission} readOnly={!item.siSo} />
                    <TableCell content={item.maHocPhan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{dataDiem.sort((a, b) => parseInt(a.phanTram) - parseInt(b.phanTram)).map(i => <div key={`${index}${i.loaiDiem}`}><b>{i.loaiDiem}</b>: {i.phanTram}%</div>)}</>} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianBatDauNhap} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianKetThucNhap} />
                    <TableCell style={{ whiteSpace: 'pre-wrap', textAlign: 'center' }} content={item.maLop} />
                    <TableCell content={item.siSo || 0} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    {/* <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bolder' }} content={
                        <Tooltip arrow title={item.isVerified ? 'Đã xác nhận' : 'Chưa xác nhận'}>
                            <i className={item.isVerified ? 'text-success' : 'text-danger'}>{item.code}</i>
                        </Tooltip>
                    } /> */}
                    {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} /> */}
                    {configThi.map((i, j) => <React.Fragment key={item.maHocPhan + i + j} >
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hinhThucThi[i]?.split(', ').map(idx => <div key={`${index}${i}ht`}>{idx}</div>)} />
                    </React.Fragment>)}
                    {configThi.map((i, j) => <React.Fragment key={item.maHocPhan + i + j} >
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={dataThi[i]?.batDau || ''} />
                    </React.Fragment>)}
                    <TableCell type='buttons' content={item} onEdit={() => this.modal.show(item)} permission={permission}></TableCell>
                    {/* <TableCell content={!item.siSo ? <Tooltip title={'Không có danh sách'} arrow placement='top'>
                        <button className='btn btn-secondary'>
                            <i className='fa fa-lg fa-times' />
                        </button>
                    </Tooltip> : <Tooltip title={'Khoá bảng điểm'} arrow placement='top'>
                        <button className='btn btn-danger'>
                            <i className='fa fa-lg fa-lock' />
                        </button>
                    </Tooltip>} /> */}
                </tr>;
            }
        });
        return this.renderPage({
            title: 'Quản lý bảng điểm',
            icon: 'fa fa-leaf',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Quản lý bảng điểm'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} data={SelectAdapter_SchoolYear} className='col-md-3' label='Năm học' onChange={value => this.handleChange(value.id, 'namFilter')} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-3' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.handleChange(value?.id, 'hocKyFilter')} allowClear />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-3' label='Khoá' data={SelectAdapter_DtKhoaDaoTaoFilter('dtDiemSinhVien:manage')} onChange={value => this.handleChange(value?.id, 'khoaSinhVienFilter')} allowClear />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-3' label='Loại hình' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtDiemSinhVien:manage')} onChange={value => this.handleChange(value?.id, 'loaiHinhDaoTaoFilter')} allowClear />
            </div>,
            backRoute: '/user/dao-tao/grade-manage',
            content: <>
                <div className='tile'>
                    <UpdateMultiModal ref={e => this.multiUpdate = e} listChosen={listChosen} save={() => this.getPage(pageNumber, pageSize, pageCondition)} />
                    <UpdateTimeModal ref={e => this.timeModal = e} listChosen={listChosen} save={() => this.getPage(pageNumber, pageSize, pageCondition)} />
                    <UpdateRateModal ref={e => this.rateModal = e} listChosen={listChosen} filter={this.state.filter} />
                    <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                        <div className='title'>
                            <div style={{ gap: 10, display: 'inline-flex' }}>
                                <FormCheckbox label='Chỉ hiện đủ sĩ số' onChange={value => this.setState({ filter: { ...this.state.filter, onlyHasNumbers: Number(value) } }, () => this.getPage(pageNumber, pageSize, pageCondition))} style={{ marginBottom: '0' }} value={this.state.filter.onlyHasNumbers} />
                                <FormCheckbox label='Tìm theo cột' value={this.state.isKeySearch} onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Sort' value={this.state.isSort} onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                                <div style={{ gap: 10, display: listChosen.length ? 'flex' : 'none' }}>
                                    <Tooltip title='In file scan lớp' arrow>
                                        <button className='btn btn-warning' type='button' onClick={() => this.printScanFileModal.show({
                                            namHocHocPhi: filter.namFilter,
                                            hocKyHocPhi: filter.hocKyFilter,
                                        })}>
                                            <i className='fa fa-sm fa-print' />
                                        </button>
                                    </Tooltip>
                                    <div className='btn-group' role='group'>
                                        <Tooltip title={`Cập nhật tình trạng điểm ${listChosen.length} học phần`} arrow>
                                            <button id='updateStatus' type='button' className='btn btn-primary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                                <i className='fa fa-lg fa-cogs' />
                                            </button>
                                        </Tooltip>
                                        <div className='dropdown-menu' aria-labelledby='updateStatus'>
                                            {
                                                dataTinhTrang && dataTinhTrang.map((item) => {
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
                                    <Tooltip title={`Cập nhật hình thức thi ${listChosen.length} học phần`} arrow>
                                        <button className='btn btn-info' type='button' onClick={() => this.multiUpdate.show()}>
                                            <i className='fa fa-sm fa-repeat' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title={`Cập nhật thời gian nhập điểm ${listChosen.length} học phần`} arrow>
                                        <button className='btn btn-success' type='button' onClick={() => this.timeModal.show()}>
                                            <i className='fa fa-sm fa-clock-o' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title={`Cập nhật tỉ lệ điểm ${listChosen.length} học phần`} arrow>
                                        <button className='btn btn-secondary' type='button' onClick={() => this.rateModal.show()}>
                                            <i className='fa fa-sm fa-edit' />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div style={{ gap: 10 }} className='btn-group'>
                            <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} pageRange={5} />
                            {/* <button className='btn btn-info' onClick={e => e.preventDefault() || this.getPage()}>
                                <i className='fa fa-lg fa-search-plus' /> Tìm kiếm
                            </button> */}
                        </div>
                    </div>
                    {table}
                    <AdjustModal ref={e => this.modal = e} update={this.props.updateTimeConfig} save={() => this.getPage(pageNumber, pageSize, pageCondition)} />
                    <ProcessModal ref={e => this.processModal = e} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
                    <PrintScanFileModal ref={e => this.printScanFileModal = e} listChosen={this.state.listChosen} isThi={false} tabId={tabId}
                        showProcessModal={() => this.processModal.show()} hideProcessModal={() => this.processModal.hide()}
                        getDtDiemPage={() => this.getPage(pageNumber, pageSize, pageCondition)} />
                </div>
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiem: state.daoTao.dtDiem });
const mapActionsToProps = { getDtDiemPage, getScheduleSettings, updateTimeConfig, getAllDtDiemDmTinhTrang, updateTinhTrangDiem };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemPage);