import React from 'react';
import { AdminPage, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { getBaoBuPage } from 'modules/mdDaoTao/dtQuanLyNghiBu/redux';
import { DtTKBCustomDeleteTuan } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import BaoBuModal from 'modules/mdDaoTao/dtQuanLyNghiBu/modal/BaoBuModal';
import { Tooltip } from '@mui/material';

class BaoBuSection extends AdminPage {
    state = { filter: {} }

    getData = () => {
        this.getPageBu(1, 50, null);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPageBu(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, sort: sortTerm } }, () => this.getPageBu(pageNumber, pageSize, pageCondition));
    }

    getPageBu = (pageN, pageS, pageC, done) => {
        this.props.getBaoBuPage(pageN, pageS, pageC, { ...this.props.filter, ...this.state.filter }, page => {
            this.setState({ pageBu: page });
            done && done();
        });
    }

    handleDeleteTuan = (item) => {
        let { id, idThoiKhoaBieu, ngayBatDau, ngayKetThuc, maHocPhan } = item;
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn xóa lịch bù này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.DtTKBCustomDeleteTuan({ idTuan: id, idThoiKhoaBieu, ngayBatDau, ngayKetThuc, maHocPhan }, () => {
                    this.getPageBu();
                });
            }
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.state.pageBu || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null },
            user = this.props.system.user;

        let table = (list) => renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list, stickyHead: list?.length > 15,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bù' typeSearch='date' keyCol='ngayBu' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Cơ sở' keyCol='coSo' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Trợ giảng' keyCol='troGiang' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày nghỉ' typeSearch='date' keyCol='ngayNghi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ nghỉ' keyCol='thuNghi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết nghỉ' keyCol='tietNghi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Người thao tác' keyCol='userMod' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian thao tác' typeSearch='date' keyCol='timeMod' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayBu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.coSo} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayNghi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thuNghi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={(item.tietNghi && item.soTietNghi) ? `${item.tietNghi} - ${item.tietNghi + item.soTietNghi - 1}` : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.userModified} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeModified} />
                        <TableCell type='buttons' style={{ textAlign: 'center', display: !Number(user?.isPhongDaoTao) ? 'none' : '' }} content={item}>
                            <Tooltip title='Cập nhật lịch bù' arrow>
                                <button className='btn btn-info' onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, isEdit: true })}>
                                    <i className='fa fa-lg fa-retweet' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Xóa tuần học' arrow>
                                <button className='btn btn-warning' onClick={(e) => e.preventDefault() || this.handleDeleteTuan(item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr >
                );
            }
        });

        return (
            <>
                <BaoBuModal ref={e => this.baoBuModal = e} handleBu={this.getPageBu} />
                <div className='d-flex'>
                    {<button className='btn btn-info' type='button' style={{ width: 'fit-content', margin: '10px' }} onClick={() => T.handleDownload(`/api/dt/quan-ly-nghi-bu/export-lich-bu?filter=${T.stringify(this.props.filter)}`)}>
                        <i className='fa fa-lg fa-download' /> Export lịch bù
                    </button>}
                </div>
                {table(list)}

                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPageBu} pageRange={5} />
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getBaoBuPage, DtTKBCustomDeleteTuan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoBuSection);
