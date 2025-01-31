import React from 'react';
import { connect } from 'react-redux';
import { renderDataTable, TableCell } from 'view/component/AdminPage';
import { getDtDiemPage } from '../redux';
import Pagination from 'view/component/Pagination';

class SectionListAll extends React.Component {
    componentDidMount() {
    }

    setData = ({ namHoc, hocKy }) => {
        this.setState({ filter: { namHoc, hocKy } }, () => {
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getDtDiemPage(pageN, pageS, pageC, this.state.filter, done);
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDiem && this.props.dtDiem.page ?
            this.props.dtDiem.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null, pageCondition: null };
        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            divStyle: { height: '60vh' },
            stickyHead: list && list.length > 20,
            data: list,
            renderHead: () => <tr>
                <th style={{ width: 'auto' }}>STT</th>
                <th style={{ width: 'auto' }}>MSSV</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoá</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã học phần</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tín chỉ</th>
                {/* <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại điểm</th> */}
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm GK</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm CK</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>% GK</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>% CK</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng kết</th>
                {/* <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th> */}
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                <TableCell content={item.mssv} />
                <TableCell content={`${item.ho} ${item.ten}`} />
                <TableCell content={item.khoaSinhVien} />
                <TableCell content={item.maHocPhan} />
                <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell content={item.tongTinChi} />
                <TableCell style={{ textAlign: 'center' }} content={item.diemGk ? Number(item.diemGk).toFixed(2) : 0} />
                <TableCell style={{ textAlign: 'center' }} content={item.diemCk ? Number(item.diemCk).toFixed(2) : 0} />
                <TableCell style={{ textAlign: 'center' }} content={item.phanTramDiemGk} />
                <TableCell style={{ textAlign: 'center' }} content={item.phanTramDiemCk || (100 - parseInt(item.phanTramDiemGk))} />
                <TableCell style={{ textAlign: 'center' }} content={Number(item.diemTk).toFixed(2)} />
            </tr>
        });

        return <div>
            <Pagination style={{ position: 'absolute', bottom: '10px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} pageRange={10} />
            <div style={{ marginBottom: '35px' }}>{table}</div>
        </div>;

    }
}
const mapStateToProps = state => ({ system: state.system, dtDiem: state.daoTao.dtDiem });
const mapActionsToProps = { getDtDiemPage };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionListAll);