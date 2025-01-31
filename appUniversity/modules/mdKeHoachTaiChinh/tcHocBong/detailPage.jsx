import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableHead, TableCell, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { getDanhSachHocBongTc, xuLyTcHocBong, hoanTacTcHocBong, downloadExcelTcHocBong } from './redux';
import { SelectAdapter_CtsvCauHinhHocBong } from 'modules/mdCongTacSinhVien/svDotXetHocBongKkht/redux/dieuKienRedux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';

class TcHocBongDetailPage extends AdminPage {
    state = { collapse: {}, isMultiSelect: false, selectedItems: {} };
    filter = {}
    componentDidMount() {
        T.ready('/user/finance', () => {
            this.id = T.routeMatcher('/user/finance/hoc-bong/detail/:id').parse(window.location.pathname)?.id;
            const params = new URL(window.location.href).searchParams;
            for (let [key, value] of params.entries()) {
                this.filter[key] = value;
            }
            this.filter['idCauHinh'] != null && this.cauHinhFilter.value(this.filter['idCauHinh'].split(','));
            T.showSearchBox();
            T.onSearch = this.onSearch;
            this.getPage(undefined, undefined, undefined, page => T.setTextSearchBox(page.pageCondition));
            // this.getPage();
        });
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getDanhSachHocBongTc(this.id, pageNumber, pageSize, pageCondition, this.filter, done);
    }

    onSearch = (searchTerm) => {
        this.getPage(undefined, undefined, searchTerm);
    }

    keySearch = (data) => {
        const [key, value] = data.split(':');
        this.filter[key] = value;
        this.getPage();
    }

    xuLyTcHocBong = ({ mssv, idLichSu, soTienNhan }) => {
        T.confirm('Xác nhận đã xử lý học bổng cho sinh viên', '', isConfirm => isConfirm && this.props.xuLyTcHocBong(this.id, [{ mssv, idLichSu, soTienThuong: soTienNhan }]));
    }

    xuLyMultipleTcHocBong = () => {
        const selectedItems = this.state.selectedItems;
        const danhSachSinhVien = Object.values(selectedItems).filter(item => item).map(item => ({ mssv: item.mssv, idLichSu: item.idLichSu, soTienThuong: item.soTienNhan }));
        if (danhSachSinhVien.length) T.confirm('Xác nhận đã xử lý học bổng cho sinh viên', '', isConfirm => isConfirm && this.props.xuLyTcHocBong(this.id, danhSachSinhVien, () => this.setState({ isMultiSelect: false, selectedItems: {} })));
        else T.notify('Vui lòng chọn ít nhất 1 sinh viên');
    }

    hoanTacTcHocBong = ({ mssv, idLichSu }) => {
        T.confirm('Xác nhận hoàn tác học bổng cho sinh viên', '', isConfirm => isConfirm && this.props.hoanTacTcHocBong(this.id, mssv, idLichSu));
    }

    onSelect = (item, value) => {
        this.setState({ selectedItems: { ...this.state.selectedItems, [`${item.idLichSu}:${item.mssv}`]: value && item } });
    }

    onSelectCauHinh = (idCauHinh, value) => {
        const { list = [] } = this.props.tcHocBong?.page ?? {};
        const newSelected = list[idCauHinh]?.reduce((cur, item) => (cur[`${item.idLichSu}:${item.mssv}`] = value && item, cur), {});
        this.setState({ selectedItems: { ...this.state.selectedItems, ...newSelected } });
    }

    render() {
        const { page = {}, dsCauHinh } = this.props.tcHocBong ?? {};
        const { pageNumber, pageSize, pageTotal, list } = page;
        const { isMultiSelect, selectedItems } = this.state;
        let indexPrefix = 0;
        return this.renderPage({
            title: 'Học bổng khuyến khích',
            icon: 'fa fa-star',
            breadcrumb: [
                <Link key={1} to={'/user/finance'}>Kế hoạch tài chính</Link>,
                <Link key={2} to={'/user/finance/hoc-bong'}>Học bổng khuyến khích học tập</Link>,
                'Danh sách chính thức',
            ],
            content: <>
                <div className='tile'>
                    <div className='d-flex justify-content-between align-items-baseline'>
                        <h5 className='tile-title'>Danh sách chính thức</h5>
                        <div className='d-flex justify-content-between align-items-start' style={{ gap: '0.5rem' }}>
                            {/* Chọn nhiều */}
                            {!isMultiSelect ?
                                <button className='btn btn-primary' type='button' onClick={() => this.setState({ isMultiSelect: true })}><i className='fa fa-list' />Chọn nhiều</button> :
                                <>
                                    <button className='btn btn-success' type='button' onClick={this.xuLyMultipleTcHocBong}><i className='fa fa-check' />Xác nhận đã xử lý</button>
                                    <button className='btn btn-danger' type='button' onClick={() => this.setState({ isMultiSelect: false, selectedItems: {} })}><i className='fa fa-times' />Hủy</button>
                                </>
                            }
                            {/* Xuất Excel */}
                            <button className='btn btn-success' type='button' onClick={() => downloadExcelTcHocBong(this.id)}><i className='fa fa-file-excel-o' />Xuất excel</button>
                        </div>
                    </div>
                    <div className='d-flex justify-content-between align-items-start'>
                        <FormSelect ref={e => this.cauHinhFilter = e} multiple allowClear style={{ marginRight: '1rem', flexGrow: 1 }} placeholder='Loại cấu hình học bổng' data={SelectAdapter_CtsvCauHinhHocBong(this.id)} onChange={() => {
                            this.filter.idCauHinh = this.cauHinhFilter.data().map(item => item.id).toString();
                            this.getPage();
                        }} />
                        <div><Pagination style={{ position: '' }} {...{ pageNumber, pageSize, pageTotal }} getPage={this.getPage} /></div>
                    </div>
                    {renderTable({
                        getDataSource: () => [{}],
                        header: 'thead-light',
                        multipleTbody: true,
                        stickyHead: true,
                        hover: false,
                        renderHead: (() => <tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>{isMultiSelect ? <h3 className='badge badge-pill badge-primary'>{Object.keys(selectedItems).filter(key => selectedItems[key]).length}</h3> : '#'}</th>
                            <TableHead style={{ minWidth: '15rem', whiteSpace: 'nowrap' }} keyCol='mssv' onKeySearch={this.keySearch} content='MSSV' />
                            <TableHead style={{ width: '100%', whiteSpace: 'nowrap' }} keyCol='hoTen' onKeySearch={this.keySearch} content='Họ và tên' />
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mức học bổng </th>
                            {!isMultiSelect && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác </th>}
                        </tr>),
                        renderRow: <>
                            {dsCauHinh?.map((item, index) => {
                                let subList = list[item.idCauHinh]?.length && <React.Fragment key={index}>
                                    <tbody>
                                        <tr className='font-weight-bold'>
                                            {isMultiSelect && <td><FormCheckbox onChange={(value) => this.onSelectCauHinh(item.idCauHinh, value)} /></td>}
                                            <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} colSpan={3 - Number(isMultiSelect)} content={<h5>{item.tenCauHinh}</h5>} />
                                            <TableCell style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }} type='number' content={item.tongHocBong} />
                                            {!isMultiSelect && <td></td>}
                                        </tr>
                                        {list[item.idCauHinh]?.map((subItem, subIndex) => (!isMultiSelect || !subItem.daXuLy) && <tr key={subIndex} style={{ backgroundColor: selectedItems[`${subItem.idLichSu}:${subItem.mssv}`] ? '#80ff80' : '' }}>
                                            {isMultiSelect ? <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} type='checkbox' permission={{ write: true }} isCheck content={!!selectedItems[`${subItem.idLichSu}:${subItem.mssv}`]} onChanged={value => this.onSelect(subItem, value)} /> :
                                                <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + indexPrefix + subIndex + 1} />}
                                            <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={subItem.mssv} />
                                            <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={subItem.hoTen} />
                                            <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} type='number' content={subItem.soTienNhan} />
                                            {!isMultiSelect && <TableCell type='buttons'>
                                                {subItem.daXuLy == 0 ? <Tooltip title='Đã xử lý'><button className='btn btn-success' type='button' onClick={() => this.xuLyTcHocBong(subItem)}><i className='fa fa-check' /></button></Tooltip> :
                                                    <Tooltip title='Hoàn tác'><button className='btn btn-danger' type='button' onClick={() => this.hoanTacTcHocBong(subItem)}><i className='fa fa-undo' /></button></Tooltip>}
                                            </TableCell>}
                                        </tr>)}
                                    </tbody>
                                </React.Fragment>;
                                indexPrefix += list[item.idCauHinh]?.length ?? 0;
                                return subList;
                            })}
                        </>
                    })}
                </div>
            </>
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, tcHocBong: state.finance.tcHocBong });

const mapDispatchToProps = { getDanhSachHocBongTc, xuLyTcHocBong, hoanTacTcHocBong };

export default connect(mapStateToProps, mapDispatchToProps)(TcHocBongDetailPage);