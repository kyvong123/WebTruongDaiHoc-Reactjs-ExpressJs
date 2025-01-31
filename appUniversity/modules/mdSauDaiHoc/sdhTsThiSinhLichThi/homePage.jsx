import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell } from 'view/component/AdminPage';
import { getSdhTsDiemThiThiSinh } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';

class ThiSinhLichThiPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { infoDot: {}, listDon: [], listMon: [] };
    componentDidMount() {
        this.getData();
    }
    getData = () => {
        const { idThiSinh } = this.props.system.user;
        this.props.getSdhTsDiemThiThiSinh(idThiSinh, listMon =>
            this.setState({ listMon })
        );
    }

    render() {
        const { sbd, firstName, lastName } = this.props.system.user || {};
        const listMon = this.state.listMon;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu lịch thi',
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            stickyHead: false,
            data: listMon.length ? listMon.sort((a, b) => a.ngayThi - b.ngayThi) : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%', textAlign: 'center' }}>Môn thi</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Cơ sở</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Phòng thi</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Ngày thi</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.monThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.coSo} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phongThi} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayThi} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Lịch thi',
            breadcrumb: [
                'Lịch thi'
            ],
            content: <>
                <div className='tile'>
                    <h5 style={{ textAlign: 'center', padding: '10px' }}><strong>Lịch thi tuyển sinh</strong></h5>
                    <h6 >Họ tên: <span style={{ color: '#007bff' }}>{`${firstName} ${lastName} ${sbd ? '(' + sbd + ')' : ''})`}</span> </h6>
                    {table}
                </div>
            </>,
            backRoute: '/user',
        });

    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhTsDiemThiThiSinh
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ThiSinhLichThiPage);
