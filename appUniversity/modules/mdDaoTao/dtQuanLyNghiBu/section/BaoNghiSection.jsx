import React from 'react';
import { AdminPage, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { getBaoNghiPage } from 'modules/mdDaoTao/dtQuanLyNghiBu/redux';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import BaoBuModal from 'modules/mdDaoTao/dtQuanLyNghiBu/modal/BaoBuModal';
import { DtThoiKhoaBieuGetDataHocPhan, DtTKBCustomBaoNghiHoanTac } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import { SelectAdapter_DmPhongCustomFilter } from 'modules/mdDanhMuc/dmPhong/redux';
import { Note } from 'modules/mdDaoTao/dtThoiKhoaBieu/section/SectionTuanHoc';

class BaoNghiSection extends AdminPage {
    state = { filter: {} }

    getData = () => {
        this.getPageNghi(1, 50, null);
    }

    onKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPageNghi(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, sort: sortTerm } }, () => this.getPageNghi(pageNumber, pageSize, pageCondition));
    }

    getPageNghi = (pageN, pageS, pageC, done) => {
        this.props.getBaoNghiPage(pageN, pageS, pageC, { ...this.props.filter, ...this.state.filter }, page => {
            this.setState({ pageNghi: page });
            done && done();
        });
    }

    hoanTacNghi = (tuan) => {
        const { phong, ngayBatDau, ngayKetThuc, id, coSo, ngayNghi: ngayHoc, maHocPhan, tietBatDau, soTietBuoi } = tuan;
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn hoàn tác nghỉ buổi học này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.DtThoiKhoaBieuGetDataHocPhan(maHocPhan, data => {
                    const { listTuanHoc } = data;
                    if (listTuanHoc.filter(i => i.idNgayNghi == id).length) {
                        T.notify('Tuần học đã có lịch bù!', 'danger');
                    } else {
                        SelectAdapter_DmPhongCustomFilter({ coSo, ngayHoc, tietBatDau, soTietBuoi }).fetchValid({ maHocPhan, ngayBatDau, ngayKetThuc, phong }, item => {
                            if (item) {
                                T.notify(item, 'warning');
                            } else {
                                this.note.show({ ...tuan, idTuan: id });
                            }
                        });
                    }
                });
            }
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.state.pageNghi || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null },
            user = this.props.system.user;

        let table = (list) => renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list, stickyHead: list?.length > 15,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày nghỉ' keyCol='ngayNghi' typeSearch='date' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Cơ sở' keyCol='coSo' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVien' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Trợ giảng' keyCol='troGiang' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='GV Báo nghỉ' keyCol='gvBaoNghi' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Người thao tác' keyCol='userMod' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian thao tác' keyCol='timeMod' typeSearch='date' onKeySearch={this.onKeySearch} onSort={this.onSort} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index} style={{ backgroundColor: item.isHoanTac ? '#f5f7a6' : '#fff' }}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayNghi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.coSo} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.isHoanTac ? 'Hoàn tác' : item.ghiChu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={Number(item.isGiangVienBaoNghi) ? 'Báo nghỉ' : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.userModified} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeModified} />
                        <TableCell type='buttons' style={{ textAlign: 'center', display: item.isHoanTac || !Number(user?.isPhongDaoTao) ? 'none' : '' }} content={item}>
                            <Tooltip title='Báo bù tuần học' arrow>
                                <button className='btn btn-info' onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, isEdit: false })}>
                                    <i className='fa fa-lg fa-retweet' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Hoàn tác nghỉ' arrow>
                                <button className='btn btn-warning' onClick={e => e.preventDefault() || this.hoanTacNghi(item)}>
                                    <i className='fa fa-lg fa-undo' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr >
                );
            }
        });

        return (
            <>
                <Note ref={e => this.note = e} DtTKBCustomBaoNghiHoanTac={this.props.DtTKBCustomBaoNghiHoanTac} handleRefresh={this.getPageNghi} />
                <BaoBuModal ref={e => this.baoBuModal = e} handleBu={this.props.handleBu} />
                <div className='d-flex'>
                    {<button className='btn btn-info' type='button' style={{ width: 'fit-content', margin: '10px' }} onClick={() => T.handleDownload(`/api/dt/quan-ly-nghi-bu/export-lich-nghi?filter=${T.stringify(this.props.filter)}`)}>
                        <i className='fa fa-lg fa-download' /> Export lịch nghỉ
                    </button>}
                </div>
                {table(list)}

                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPageNghi} pageRange={5} />
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getBaoNghiPage, DtThoiKhoaBieuGetDataHocPhan, DtTKBCustomBaoNghiHoanTac };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoNghiSection);
