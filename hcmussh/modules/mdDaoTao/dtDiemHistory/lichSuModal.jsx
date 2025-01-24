import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getDtDiemHistoryModal } from './redux';

class LichSuNhapDiem extends AdminModal {
    defaultSortTerm = 'maHocPhan_ASC'
    state = {
        page: null, filter: {}, sortTerm: 'maHocPhan_ASC'
    }

    onShow = ({ mssv, maHocPhan, showInfo }) => {
        this.setState({ filter: { ks_mssv: mssv, ks_maHocPhan: maHocPhan }, showInfo }, () => this.getPage(1, 50, ''));
    }

    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtDiemHistoryModal(pageN, pageS, pageC, filter, page => this.setState({ page }));
    }

    render = () => {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.state?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null },
            { showInfo } = this.state;

        let table = renderDataTable({
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 11,
            // divStyle: { height: '50vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                {showInfo ? <>
                    <TableHead content='MSSV' style={{ width: '100px' }} />
                    <TableHead content='Họ tên' style={{ width: '50%' }} />
                </> : <>
                    <TableHead content='Học phần' style={{ width: '150px' }} />
                    <TableHead content='Tên học phần' style={{ width: '50%' }} />
                </>}
                <TableHead content='Loại' style={{ width: '10%' }} keyCol='loaiDiem' />
                <TableHead content='%' style={{ width: '10%' }} keyCol='phanTram' />
                <TableHead content='Điểm mới' style={{ width: '20%', textAlign: 'center' }} />
                <TableHead content='Điểm cũ' style={{ width: '20%', textAlign: 'center' }} />
                <TableHead content='Điểm khác' style={{ width: '10%', textAlign: 'center' }} />
                <TableHead content='Người chỉnh sửa' style={{ width: '10%', textAlign: 'center' }} />
                <TableHead content='Thời gian chỉnh sửa' style={{ width: '10%', textAlign: 'center' }} />
                <TableHead content='Hình thức ghi' style={{ whiteSpace: 'nowrap', width: 'auto', textAlign: 'center' }} />
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={item.R} />
                {showInfo ? <>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<><span className='text-primary'>{item.mssv}</span></>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                </> : <>
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc)?.vi} />
                </>}
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phanTramDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.newDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.oldDiem} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemDacBiet} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.userModified} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.dateToText(item.timeModified)} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hinhThucGhi} />
            </tr>
        });


        return this.renderModal({
            title: 'Lịch sử nhập điểm',
            size: 'elarge',
            body: <>
                {table}
                <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtDiemHistoryModal };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(LichSuNhapDiem);