import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import xlsx from 'xlsx';
import { DtThoiKhoaBieuImportUpdate, DtThoiKhoaBieuImportNew } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';


class SectionImportError extends AdminPage {
    state = { datas: [] }

    setValue = (datas) => {
        this.setState({ datas });
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách import lỗi.xlsx');
    }

    handleCheck = (item, list) => {
        item.isTrungTKB = !item.isTrungTKB;
        this.setState({ datas: list });
    }

    onSave = () => {
        let data = this.state.datas.filter(i => i.isTrungTKB);
        if (!data.length) {
            T.notify('Vui lòng chọn học phần!', 'warning');
        } else {
            let dataCreate = data.filter(i => i.isCreate),
                dataUpdate = data.filter(i => i.isUpdate);

            dataUpdate.length && this.props.DtThoiKhoaBieuImportUpdate(this.props.filter, dataUpdate, () => {
                T.notify('Import dữ liệu học phần trùng thành công', 'success');
            });

            dataCreate.length && this.props.DtThoiKhoaBieuImportNew(this.props.filter, dataCreate, () => {
                T.notify('Import dữ liệu tạo mới học phần thành công', 'success');
            });
        }
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Hiện chưa có dữ liệu nào!',
        className: 'errorTable',
        header: 'thead-light',
        divStyle: { height: '50vh' },
        stickyHead: list.length > 15,
        renderHead: () => (<tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chọn</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dòng lỗi</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã học phần</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap', minWidth: '200px', maxWidth: '200px' }}>Môn học</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tiết</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SLDK</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giảng viên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trợ giảng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isTrungTKB} permission={{ write: item.isTrungTKB != null }} onChanged={() => this.handleCheck(item, list)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.row} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell content={item.tenMonHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tietBatDau ? `${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}` : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soLuongDuKien} />
                    <TableCell style={{ width: 'auto', minWidth: '75px', whiteSpace: 'pre-wrap' }} content={item.lop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(item.ngayBatDau ? T.dateToText(item.ngayBatDau, 'dd/mm/yyyy') : '')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.canBoGV && item.canBoGV.length ? item.canBoGV.split(', ').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.canBoTG && item.canBoTG.length ? item.canBoTG.split(', ').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                </tr>
            );
        }
    });

    render() {
        return (
            <div>
                <div>
                    <button className='btn btn-warning' type='button' style={{ margin: '5px' }} onClick={e => e && e.preventDefault() || this.onSave()}>
                        <i className='fa fa-fw fa-lg fa-save' />Lưu học phần trùng thời khóa biểu
                    </button>
                </div>
                <div>
                    {this.table(this.state.datas || [])}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { DtThoiKhoaBieuImportUpdate, DtThoiKhoaBieuImportNew };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionImportError);