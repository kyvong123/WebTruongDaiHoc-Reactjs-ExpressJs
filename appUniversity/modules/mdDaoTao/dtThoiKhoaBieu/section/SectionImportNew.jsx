import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import { DtThoiKhoaBieuImportNew } from '../redux';

class SectionImportNew extends AdminPage {
    state = { datas: [] }

    handleCheck = (item, list) => {
        item.isCheck = !item.isCheck;
        this.setState({ datas: list }, () => {
            this.checkAll.value(list.every(i => i.isCheck));
            this.props.isSave(list.some(i => i.isCheck));
        });
    }

    setValue = (datas) => {
        this.setState({ datas }, () => {
            this.checkAll?.value(true);
        });
    }

    onSave = () => {
        let data = this.state.datas.filter(i => i.isCheck);
        data.length && this.props.DtThoiKhoaBieuImportNew(this.props.filter, data, () => {
            T.notify('Import dữ liệu tạo mới học phần thành công', 'success');
        });
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Hiện chưa có dữ liệu nào!',
        header: 'thead-light',
        stickyHead: list.length > 15,
        divStyle: { height: '50vh' },
        renderHead: () => (<tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                <FormCheckbox ref={e => this.checkAll = e} onChange={(value) => {
                    this.setState({ datas: list.map(i => ({ ...i, isCheck: value })) });
                    this.props.isSave(value);
                }} />
            </th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã học phần</th>
            <th style={{ width: '70%', minWidth: '200px', maxWidth: '200px' }}>Môn học</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tiết</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SLDK</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giảng viên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trợ giảng</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isCheck} permission={{ write: true }} onChanged={() => this.handleCheck(item, list)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell content={item.tenMonHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tietBatDau ? `${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}` : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soLuongDuKien} />
                    <TableCell style={{ width: 'auto', minWidth: '75px', whiteSpace: 'pre-wrap' }} content={item.lop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(item.ngayBatDau ? T.dateToText(item.ngayBatDau, 'dd/mm/yyyy') : '')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(item.ngayKetThuc ? T.dateToText(item.ngayKetThuc, 'dd/mm/yyyy') : '')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.canBoGV && item.canBoGV.length ? item.canBoGV.split(', ').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.canBoTG && item.canBoTG.length ? item.canBoTG.split(', ').map((item, i) => <div key={i}>{item}</div>) : ''} />
                </tr>
            );
        }
    });

    render() {
        return (
            <>
                {
                    this.table(this.state.datas || [])
                }
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { DtThoiKhoaBieuImportNew };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionImportNew);