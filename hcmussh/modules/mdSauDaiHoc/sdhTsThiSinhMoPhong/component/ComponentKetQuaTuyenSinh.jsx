import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell } from 'view/component/AdminPage';
import { getSdhTsTrungTuyenThiSinh } from 'modules/mdSauDaiHoc/sdhTsXetTrungTuyen/redux';
import { getAllSdhHinhThucTuyenSinh } from 'modules/mdSauDaiHoc/sdhTsHinhThuc/redux';
class ComponentTrungTuyen extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { infoDot: {}, listDon: [], listMon: [] };
    componentDidMount() {
        this.getData();
        this.props.getAllSdhHinhThucTuyenSinh(data => {
            this.setState({ listHinhThuc: data.map(item => ({ ma: item.ma, text: item.tenHinhThuc })) });
        });
    }

    getData = () => {
        const user = this.props.user;
        this.props.getSdhTsTrungTuyenThiSinh(user.id, listResult =>
            this.setState({ listResult })
        );
    }

    render() {
        const { sbd, firstName, lastName } = this.props.user;
        const listResult = this.state.listResult || [];
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu kết quả tuyển sinh',
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            stickyHead: false,
            data: listResult.length ? listResult.sort((a, b) => b.id - a.id) : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hình thức</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Kết quả</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Ngày công bố</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Ghi chú</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index} className={item.congBoTrungTuyen ? (item.trungTuyen ? 'table-success' : 'table-danger') : ''}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={this.state.listHinhThuc?.find(i => i.ma == item.maHinhThuc).text} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.congBoTrungTuyen ? (item.trungTuyen ? 'Đạt' : 'Không đạt') : ''} />
                    <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayCongBo} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.ghiChu} />
                </tr>
            )
        });
        return <div className='tile'>
            <h5 style={{ textAlign: 'center', padding: '10px' }}><strong>Kết quả tuyển sinh</strong></h5>
            <h6 >Họ tên: <span style={{ color: '#007bff' }}>{`${firstName} ${lastName} ${sbd ? '(' + sbd + ')' : ''}`}</span> </h6>
            {table}
        </div>;

    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhTsTrungTuyenThiSinh, getAllSdhHinhThucTuyenSinh
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTrungTuyen);
