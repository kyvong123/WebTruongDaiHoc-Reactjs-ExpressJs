import React, { Component } from 'react';
import Pagination from 'view/component/Pagination';
import { renderDataTable, TableHead, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';


export class DanhSachTimKiem extends Component {
    state = { dssvFilter: [], filter: {}, pageNumber: 1, pageSize: 50, pageTotal: null }

    componentDidMount() {
        this.getPage(1, 50);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.dssvFilter != this.props.dssvFilter) {
            this.setState({ filter: {} }, () => this.getPage());
        }
    }

    onKeySearch = (keyCol) => {
        const [key, value] = keyCol.split(':');
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => this.getPage());
    }

    filterList = (list) => {
        let res = [...(list ?? [])];
        const filter = this.state.filter;
        Object.keys(filter).forEach(key => {
            if (filter[key]) {
                res = res.filter(item => item[key.split('_')[1]]?.toString().toLocaleLowerCase().includes(filter[key]));
            }
        });
        return res;
    }

    getPage = (number, size) => {
        let { pageNumber, pageSize, dssvFilter = [] } = this.state;

        pageNumber = number ?? pageNumber;
        pageSize = size ?? pageSize;
        dssvFilter = this.filterList(this.props.dssvFilter);
        const pageTotal = Math.ceil(dssvFilter.length / pageSize);
        const list = dssvFilter.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        this.setState({ pageNumber, pageSize, pageTotal, list });
    }

    round(num, defaultValue) {
        return num != null ? Math.round(+num * 100) / 100 : defaultValue;
    }


    render() {
        let { list, pageNumber, pageSize, pageTotal } = this.state;
        let { id } = this.props;
        // if (showDiff) dssvFilter = dssvFilter.filter(item => item.isDiff);
        return (<div>
            <div className='d-flex justify-content-end align-items-baseline mb-3'>
                <div><Pagination style={{ position: '' }} {...{ pageNumber, pageSize, pageTotal }} getPage={this.getPage} /></div>
            </div>
            {renderDataTable({
                // getDataSource: () => (dssvFilter.length ? dssvFilter : []),
                // data: this.filterlist(dssvFilter.length ? dssvFilter : [], 0),
                data: list ?? [],
                header: 'thead-light',
                className: 'table-fix-col',
                stickyHead: list?.length > 10,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>STT</th>
                        {/* <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th> */}
                        {/* <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ tên</th> */}
                        <TableHead style={{ minWidth: '125px' }} content='MSSV' keyCol='mssv' onKeySearch={this.onKeySearch} />
                        <TableHead style={{ minWidth: '150px' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.onKeySearch} />
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTBTL</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kỷ luật bổ sung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (<tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrang} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.round(item.diemTrungBinh)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.round(item.diemTrungBinhTichLuy)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThucKyLuatText || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThucKyLuatBoSungText || ''} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        {id != null ? <Tooltip title='Add' arrow>
                            <button className='btn btn-success' onClick={e => { e.preventDefault(); this.props.addSvDuKien(item); }}>
                                <i className='fa fa-lg fa-plus' />
                            </button>
                        </Tooltip> : ''}
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
