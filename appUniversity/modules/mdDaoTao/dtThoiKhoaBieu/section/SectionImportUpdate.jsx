import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell, FormCheckbox, AdminModal } from 'view/component/AdminPage';
import { DtThoiKhoaBieuImportUpdate, getDtThoiKhoaBieuPage } from '../redux';


class ModalHocPhan extends AdminModal {
    state = { curData: [], newData: [] }
    maHocPhan = ''

    componentDidMount() {
        this.onHidden(() => {
            this.setState({ curData: [], newData: [] });
            this.maHocPhan = '';
        });
    }

    onShow = (item) => {
        this.props.getPage(1, 50, '', { ks_maHocPhan: item.maHocPhan, sort: 'maHocPhan_ASC' }, (data) => {
            this.maHocPhan = item.maHocPhan;
            this.setState({ curData: data.list, newData: [item] });
        });
    }

    table = (list, type) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Hiện chưa có dữ liệu nào!',
        header: 'thead-light',
        stickyHead: list.length > 15,
        renderHead: () => (<tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Thứ</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Tiết</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>SLDK</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Lớp</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Giảng viên</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Trợ giảng</th>
        </tr>),
        renderRow: (item, index) => {
            let lop = '', giangVien = '', troGiang = '';
            if (type == 'A') {
                lop = item.lop;
                giangVien = item.canBoGV;
                troGiang = item.canBoTG;
            }
            else {
                lop = item.maLop;
                giangVien = item.giangVien;
                troGiang = item.troGiang;
            }
            return (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tietBatDau ? `${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}` : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soLuongDuKien} />
                    <TableCell style={{ width: 'auto', minWidth: '75px', whiteSpace: 'pre-wrap' }} content={lop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(item.ngayBatDau ? T.dateToText(item.ngayBatDau, 'dd/mm/yyyy') : '')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={giangVien && giangVien.length ? giangVien.split(', ').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={troGiang && troGiang.length ? troGiang.split(', ').map((item, i) => <div key={i}>{item}</div>) : ''} />
                </tr>
            );
        }
    });

    render = () => {
        return this.renderModal({
            title: `Danh sách học phần ${this.maHocPhan} hiện tại`,
            size: 'large',
            body: <div className='row'>
                <div className='col-md-12'>
                    <h5>Thông tin học phần</h5>
                    {this.table(this.state.newData, 'A')}
                </div>
                <div className='col-md-12' style={{ marginTop: '35px' }}>
                    <h5>Thông tin học phần được cập nhật</h5>
                    {this.table(this.state.curData, 'O')}
                </div>
            </div>,
        });
    }
}

class SectionImportUpdate extends AdminPage {
    state = { datas: [] }

    setValue = (datas) => {
        this.setState({ datas }, () => {
            this.checkAll?.value(true);
        });
    }

    handleCheck = (item, list) => {
        item.isCheck = !item.isCheck;
        this.setState({ datas: list }, () => {
            this.checkAll.value(list.every(i => i.isCheck));
            this.props.isSave(list.some(i => i.isCheck));
        });
    }

    onSave = () => {
        let data = this.state.datas.filter(i => i.isCheck);
        data.length && this.props.DtThoiKhoaBieuImportUpdate(this.props.filter, this.state.datas.filter(i => i.isCheck), () => {
            T.notify('Import dữ liệu cập nhật học phần thành công', 'success');
        });
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Hiện chưa có dữ liệu nào!',
        header: 'thead-light',
        divStyle: { height: '50vh' },
        stickyHead: list.length > 15,
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
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
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
                    <TableCell type='buttons' content={item} onEdit={(e) => e && e.preventDefault() || this.modal.show(item)} />
                </tr>
            );
        }
    });

    render() {
        return (
            <>
                <ModalHocPhan ref={e => this.modal = e} getPage={this.props.getDtThoiKhoaBieuPage} />
                {this.table(this.state.datas || [])}
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { DtThoiKhoaBieuImportUpdate, getDtThoiKhoaBieuPage };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionImportUpdate);