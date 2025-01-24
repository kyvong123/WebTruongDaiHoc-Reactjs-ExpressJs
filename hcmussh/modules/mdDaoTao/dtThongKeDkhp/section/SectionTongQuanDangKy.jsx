import React from 'react';
import { connect } from 'react-redux';
import { renderDataTable, TableHead, TableCell } from 'view/component/AdminPage';

import { getDtThongKeDangKyAll } from 'modules/mdDaoTao/dtThongKe/redux';
class SectionTongQuanDangKy extends React.Component {
    state = { isHien: true, sortTerm: 'mssv_ASC', ksSearch: {}, data: [] }
    defaultSortTerm = 'mssv_ASC'

    getData = (value) => {
        let { filter, filterNgay } = this.props;
        if (value && value == 1) filter = { ...filter, ...filterNgay };

        this.setState({ filter }, () => this.getPage());
    }

    downloadExcel = (e) => {
        e.preventDefault();
        let { filter } = this.state;
        filter = JSON.stringify(filter);
        T.handleDownload(`/api/dt/thong-ke-dkhp/tong-quan/download?filter=${filter}`,
            'Thong_ke_dang_ky_hoc_phan.xlsx');
    }

    getPage = () => {
        let filter = this.state.filter;
        this.props.getDtThongKeDangKyAll(filter, value => {
            this.setState({ data: value.items, khoaSinhVien: value.listKhoaSV });
        });
    }

    render() {
        let { data, khoaSinhVien } = this.state;

        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: data,
            header: 'thead-light',
            stickyHead: data && data.length > 10 ? true : false,
            divStyle: { height: '50vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã ngành' keyCol='maNganh' />
                    <TableHead style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên ngành' keyCol='maNganh' />
                    <TableHead style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên khoa' keyCol='tenKhoa' />
                    {khoaSinhVien?.map(item => {
                        return <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} key={'khoa' + item}>{item}</th>;
                    })}
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng sinh viên' keyCol='tongSL' />
                </tr>),
            renderRow: (item, index) => {
                let count = 0;
                item.sub.forEach(e => count = count + e.soLuong);
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        {item.sub?.map(e =>
                            <React.Fragment key={'khoa' + e.khoaSinhVien} >
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={e.soLuong} />
                            </React.Fragment>
                        )}
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={count} />
                    </tr>
                );
            },
        });

        return (
            <div className='tile'>
                {table}
            </div>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDtThongKeDangKyAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionTongQuanDangKy);