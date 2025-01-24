import React, { Component } from 'react';
import Pagination from 'view/component/Pagination';
import { renderDataTable, TableHead, TableCell, FormTextBox, getValue, FormCheckbox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';


export class DanhSachDuKien extends Component {
    state = { dssvBiKyLuat: [], mssvEdit: null, filter: {}, showDiff: false, pageNumber: 1, pageSize: 50, pageTotal: null }

    componentDidMount() {
        let { dssvBiKyLuat } = this.props;
        this.setState({ dssvBiKyLuat }, () => this.getPage(1, 50));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.dssvBiKyLuat != this.props.dssvBiKyLuat) {
            let { dssvBiKyLuat } = this.props;
            this.setState({ dssvBiKyLuat, filter: {} }, () => this.getPage());
        }
    }


    onKeySearch = (keyCol) => {
        const [key, value] = keyCol.split(':');
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => this.getPage());
    }

    filterList = (list) => {
        let res = [...list];
        const filter = this.state.filter;
        Object.keys(filter).forEach(key => {
            if (filter[key]) {
                res = res.filter(item => item[key.split('_')[1]]?.toString().toLocaleLowerCase().includes(filter[key]));
            }
        });
        return res;
    }

    saveGhiChu = (id) => {
        try {
            this.props.ghiChuSvKyLuatDssvDuKien(id, { ghiChuCtsv: getValue(this.ghiChuCtsv) }, (data) => this.props.onSaveGhiChu && this.props.onSaveGhiChu(data));
        } catch (error) {
            console.error(error);
            error.props && T.notify(error.props.label + ' bị trống!', 'danger');
        }
    }

    getPage = (number, size) => {
        let { pageNumber, pageSize, dssvBiKyLuat = [] } = this.state;
        pageNumber = number ?? pageNumber;
        pageSize = size ?? pageSize;
        dssvBiKyLuat = this.filterList(dssvBiKyLuat);
        const pageTotal = Math.ceil(dssvBiKyLuat.length / pageSize);
        const list = dssvBiKyLuat.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        this.setState({ pageNumber, pageSize, pageTotal, list });
    }

    onChangeDiff = (value) => {
        let { dssvBiKyLuat } = this.props;
        if (value) {
            dssvBiKyLuat = dssvBiKyLuat.filter(item => item.isDiff);
        }
        this.setState({ dssvBiKyLuat }, () => this.getPage());
    }

    round(num, defaultValue) {
        return num != null ? Math.round(+num * 100) / 100 : defaultValue;
    }


    render() {
        let { list, pageNumber, pageSize, pageTotal, mssvEdit } = this.state;
        let { id } = this.props;
        // if (showDiff) dssvBiKyLuat = dssvBiKyLuat.filter(item => item.isDiff);
        return (<div>
            <div className='d-flex justify-content-between align-items-baseline mb-3'>
                <div className='d-flex justify-content-end align-items-baseline' style={{ gap: '1rem' }}>
                    {id != null && <button className='btn btn-success' type='button' onClick={() => {
                        T.download(`/api/ctsv/qua-trinh/ky-luat/cau-hinh-dssv/download-excel?id=${JSON.stringify(id)}`);
                    }}><i className='fa fa-file-excel-o mr-1' />Xuất Excel</button>}
                    <FormCheckbox label='Chỉ hiện thay đổi' onChange={this.onChangeDiff} />
                </div>
                <div className='d-flex justify-content-end align-items-baseline'>
                    <Pagination style={{ position: '' }} {...{ pageNumber, pageSize, pageTotal }} getPage={this.getPage} />
                </div>
            </div>

            {renderDataTable({
                // getDataSource: () => (dssvBiKyLuat.length ? dssvBiKyLuat : []),
                // data: this.filterlist(dssvBiKyLuat.length ? dssvBiKyLuat : [], 0),
                data: list ?? [],
                header: 'thead-light',
                className: 'table-fix-col',
                stickyHead: list?.length > 10,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>STT</th>
                        {/* <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ tên</th> */}
                        <TableHead style={{ minWidth: '125px' }} content='MSSV' keyCol='mssv' onKeySearch={this.onKeySearch} />
                        <TableHead style={{ minWidth: '150px' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.onKeySearch} />
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTBTL</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kỷ luật bổ sung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú khoa</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú ctsv</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (<tr key={index} style={{ backgroundColor: (!item.hinhThucKyLuatText || item.ghiChuKhoa) ? '#f7de97' : '' }}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrangTruoc} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.round(item.diemTrungBinh)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.round(item.diemTrungBinhTichLuy)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThucKyLuatText || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', background: (!item.tinhBoSung && item.hinhThucKyLuatBoSungText) ? '#f5e97a' : '' }} content={((!item.tinhBoSung && item.hinhThucKyLuatBoSungText) ? <s>{item.hinhThucKyLuatBoSungText}</s> : item.hinhThucKyLuatBoSungText) || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChuKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={
                        mssvEdit == item.mssv ? <FormTextBox className='mb-0' ref={e => this.ghiChuCtsv = e} /> : (item.ghiChuCtsv || '')
                    } />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        {/* Thao tác ghi chú */}
                        {mssvEdit != item.mssv ?
                            <Tooltip title='Thêm ghi chú' arrow>
                                <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.setState({ mssvEdit: item.mssv }, () => this.ghiChuCtsv.value(item.ghiChuCtsv || '')); }}>
                                    <i className='fa fa-lg fa-pencil' />
                                </button>
                            </Tooltip> : <>
                                <Tooltip title='Lưu ghi chú' arrow>
                                    <button className='btn btn-success' onClick={e => { e.preventDefault(); this.saveGhiChu(item.id); }}>
                                        <i className='fa fa-lg fa-check' />
                                    </button>
                                </Tooltip>
                                <Tooltip title='Hủy' arrow>
                                    <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.setState({ mssvEdit: null }); }}>
                                        <i className='fa fa-lg fa-close' />
                                    </button>
                                </Tooltip>
                            </>}
                        {/* Thao tác tính kỷ luật bổ sung */}
                        {(item.hinhThucKyLuatBoSungText && item.tinhBoSung == 1 && mssvEdit != item.mssv && id) && <Tooltip title='Không tính bổ sung' arrow>
                            <button className='btn btn-info' onClick={e => { e.preventDefault(); this.props.setBoSungSvDuKien(item, 0); }}>
                                <i className='fa fa-2x fa-arrow-down' />
                            </button>
                        </Tooltip>}
                        {(item.hinhThucKyLuatBoSungText && item.tinhBoSung == 0 && mssvEdit != item.mssv && id) && <Tooltip title='Tính bổ sung' arrow>
                            <button className='btn btn-success' onClick={e => { e.preventDefault(); this.props.setBoSungSvDuKien(item, 1); }}>
                                <i className='fa fa-2x fa-arrow-up' />
                            </button>
                        </Tooltip>}
                        {/* Cứu xét */}
                        {mssvEdit != item.mssv && id ? <Tooltip title='Cứu xét' arrow>
                            <button className='btn btn-warning' onClick={e => { e.preventDefault(); this.props.setCuuXetSvDuKien(item, 1); }}>
                                <i className='fa fa-lg fa-flag' />
                            </button>
                        </Tooltip> : null}
                        {mssvEdit != item.mssv && id ? <Tooltip title='Xóa' arrow>
                            <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.props.deleteSvDuKien(item); }}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip> : null}
                    </TableCell>
                </tr>)
            })}
            {/* {id != null && <h6>Tải xuống danh sách trên tại <span className='text-info' style={{ cursor: 'pointer' }}
                onClick={(e) => {
                    e.preventDefault();
                    T.download(`/api/ctsv/qua-trinh/ky-luat/cau-hinh-dssv/download-excel?id=${JSON.stringify(id)}`);
                }}
            >đây</span></h6>} */}
        </div>);
    }
}
