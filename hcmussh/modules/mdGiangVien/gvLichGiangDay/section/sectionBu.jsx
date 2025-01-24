import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { gvLichGiangDayBaoBuGet, gvLichGiangDayBaoBuDelete } from 'modules/mdGiangVien/gvLichGiangDay/redux';
import BaoBuModal from 'modules/mdGiangVien/gvLichGiangDay/BaoBuModal';

class SectionBu extends AdminPage {
    state = { listData: [] }

    getData = (ma, done) => {
        this.props.gvLichGiangDayBaoBuGet(ma, items => {
            this.setState({ listData: items }, () => done && done());
        });
    }

    mapperStatus = {
        0: { icon: 'fa fa-lg fa-file-o', text: 'Đang xử lý', color: 'orange' },
        1: { icon: 'fa fa-lg fa-check-circle', text: 'Đã duyệt', color: 'green' },
        2: { icon: 'fa fa-lg fa-ban', text: 'Từ chối', color: 'red' },
    }

    handleDeleteTuan = (item) => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn xóa lịch bù này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xóa lịch bù. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.gvLichGiangDayBaoBuDelete(item.idTuan, () => {
                    this.getData(this.props.maHocPhan, () => T.alert('Xóa lịch bù thành công', 'success', false, 500));
                });
            }
        });
    }

    render() {
        let table = (list) => renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list, stickyHead: list?.length > 15,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bù' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Cơ sở' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày nghỉ' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ nghỉ' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết nghỉ' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian đăng ký' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng' />
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const icon = this.mapperStatus[item.status].icon,
                    text = this.mapperStatus[item.status].text,
                    color = this.mapperStatus[item.status].color;
                return (
                    <tr key={index} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenCoSo, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu == 8 ? 'Chủ nhật' : item.thu} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={`${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${T.dateToText(item.thoiGianBatDau, 'HH:MM')} - ${T.dateToText(item.thoiGianKetThuc, 'HH:MM')}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayNghi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thuNghi == 8 ? 'Chủ nhật' : item.thuNghi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(item.tietNghi && item.soTietNghi) ? `${item.tietNghi} - ${item.tietNghi + item.soTietNghi - 1}` : ''} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeCreated} />
                        <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                        <TableCell type='buttons' style={{ textAlign: 'center', display: !item.status ? '' : 'none' }} content={item}>
                            <Tooltip title='Cập nhật lịch bù' arrow>
                                <button className='btn btn-info' onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, isEdit: true })}>
                                    <i className='fa fa-lg fa-edit' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Xóa lịch bù' arrow>
                                <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.handleDeleteTuan(item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr >
                );
            }
        });

        return <>
            <BaoBuModal ref={e => this.baoBuModal = e} dataTuan={this.props.dataTuan} baoBu={() => this.getData(this.props.maHocPhan)} />
            {table(this.state.listData)}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { gvLichGiangDayBaoBuGet, gvLichGiangDayBaoBuDelete };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionBu);