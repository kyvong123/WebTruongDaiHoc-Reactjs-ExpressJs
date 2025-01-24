import React from 'react';
import { connect } from 'react-redux';
import { SelectAdapter_DmHinhThucKyLuat } from 'modules/mdCongTacSinhVien/svDmHinhThucKyLuat/redux';
import { createSvDmCauHinhKyLuat, updateSvDmCauHinhKyLuat, deleteSvDmCauHinhKyLuat, getSvDmCauHinhKyLuatPage, getSvDmCauHinhKyLuatDsDieuKien } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, getValue, FormRichTextBox, FormCheckbox, FormTextBox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { dsDieuKien: [], addIndex: null, id: null }

    dataSelect = [
        { id: 'DIEM_TRUNG_BINH', text: 'Điểm trung bình', ghiChu: 'diemTrungBinh' },
        { id: 'DIEM_TRUNG_BINH_TICH_LUY', text: 'Điểm trung bình tích lũy', ghiChu: 'diemTrungBinhTichLuy' },
        { id: 'KY_LUAT_LIEN_TIEP', text: 'Cảnh cáo học vụ liên tiếp', ghiChu: 'kyLuatLienTiep' },
        { id: 'KY_LUAT_KHONG_LIEN_TIEP', text: 'Cảnh cáo học vụ không liên tiếp', ghiChu: 'kyLuatKhongLienTiep' },
        { id: 'QUA_HAN_NHTT', text: 'Học kỳ nghỉ học tạm thời quá hạn ', ghiChu: 'quaHanNhtt' },
    ];

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { id, ten, moTa, kichHoat } = item ? item : { id: null, ten: '', moTa: '', kichHoat: 0 };
        this.setState({ id, addIndex: null }, () => {
            this.props.getDsDieuKien(this.state.id, data => {
                this.setState({ dsDieuKien: data.map((dk, index) => ({ ...dk, indexItem: index })) });
            });
            this.ten.value(ten || '');
            this.moTa.value(moTa || '');
            this.kichHoat.value(kichHoat ? 1 : 0);
        });
    };

    updateDieuKien = (onSubmit = false, indexItem) => {
        try {
            const data = {
                keyColumn: getValue(this.keyColumn),
                keyColumnText: this.keyColumn.data().text,
                expression: getValue(this.expression),
                value: getValue(this.value),
                hinhThucKyLuat: getValue(this.hinhThucKyLuat),
                hinhThucKyLuatText: this.hinhThucKyLuat.data().text,
                ghiChu: this.keyColumn.data().ghiChu,
            };
            let currentData = this.state.dsDieuKien;
            this.setState({ addIndex: null });
            if (onSubmit) {
                return [...currentData, data];
            } else {
                currentData = currentData.map((item, index) => index == indexItem ? { ...item, ...data } : item);
                if (indexItem == currentData.length) currentData.push(data);
                else currentData = currentData.map((item, index) => index == indexItem ? { ...item, ...data } : item);
                this.setState({ dsDieuKien: [...currentData] }, () => {
                    this.setEditDieuKien();
                });
            }
        } catch (error) {
            console.error(error);
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    addCell = (index) => {

        return (
            <tr key={index}>
                <TableCell type='number' content={index + 1} />
                <TableCell content={<FormSelect className='mb-0' ref={(e) => (this.keyColumn = e)} data={this.dataSelect} placeholder='Điều kiện' required />} />
                <TableCell content={<FormSelect className='mb-0' ref={(e) => (this.expression = e)} data={['>', '>=', '<', '<=', '=='].map(item => ({ id: item, text: item }))} placeholder='So sánh' />} />
                <TableCell content={<FormTextBox type='number' step={0.1} decimalScale={1} allowNegative={false} className='mb-0' ref={(e) => (this.value = e)} placeholder='Giá trị' style={{ width: '120px' }} />} />
                <TableCell content={<FormSelect className='mb-0' ref={(e) => (this.hinhThucKyLuat = e)} data={SelectAdapter_DmHinhThucKyLuat} placeholder='Kỷ luật' required />} />
                <TableCell style={{ textAlign: 'center' }} type='buttons'>
                    <button className='btn btn-success' type='button' onClick={(e) => e.preventDefault() || this.updateDieuKien(false, index)}>
                        <i className='fa fa-lg fa-check' />
                    </button>
                    <button className='btn btn-danger' type='button' onClick={(e) => e.preventDefault() || this.setState({ addIndex: null })}>
                        <i className='fa fa-lg fa-trash' />
                    </button>
                </TableCell>
            </tr>
        );
    }

    setEditDieuKien = (item) => {
        ['keyColumn', 'expression', 'value', 'hinhThucKyLuat'].forEach((key) => {
            this[key]?.value(item[key] ?? '');
        });
    }

    deleteDieuKien = (index) => {
        T.confirm('Xác nhận xóa điều kiện?', '', isConfirm => isConfirm && this.setState({ dsDieuKien: this.state.dsDieuKien.filter((_, indexItem) => indexItem != index) }));
    }

    swapDieuKien = (index, isUp) => {
        console.log(index, isUp);
        const { dsDieuKien: leftSide } = this.state;
        const [item] = leftSide.splice(index, 1);
        const rightSide = leftSide.splice(Math.max(index + (isUp ? -1 : 1), 0));
        console.log({ item });
        this.setState({ dsDieuKien: [...leftSide, item, ...rightSide] });
    }


    thanhVienCell = () => this.state.dsDieuKien.map((item, index) =>
        this.state.addIndex == index ? (
            this.addCell(index)
        ) : (
            <tr key={index}>
                <TableCell type='number' content={index + 1} />
                <TableCell content={item.keyColumnText} />
                <TableCell content={item.expression} />
                <TableCell content={item.value} />
                <TableCell content={item.hinhThucKyLuatText} />
                <TableCell
                    type='buttons'
                    content={item}
                    permission={{ write: true, delete: true }}
                    onEdit={() => this.setState({ addIndex: index }, () => this.setEditDieuKien(item))}
                    onDelete={() => this.deleteDieuKien(index)}
                    onSwap={(_, item, isUp) => this.swapDieuKien(index, isUp)}
                />
            </tr>
        )
    );

    componentDanhSachDieuKien = () => {
        const { dsDieuKien, addIndex } = this.state;
        return (<>
            <div className='col-md-12 mt-3'>
                {renderTable({
                    getDataSource: () => (dsDieuKien.length ? dsDieuKien : [{}]),
                    header: 'thead-light',
                    className: 'table-fix-col',
                    renderHead: () => (
                        <tr>
                            <th style={{ width: 'auto' }}>STT</th>
                            <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Điều kiện</th>
                            <th style={{ width: '25%', whiteSpace: 'nowrap' }}>So sánh</th>
                            <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Giá trị</th>
                            <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Hình thức xử lý</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    ),
                    renderRow: (
                        <>
                            {dsDieuKien.length ? this.thanhVienCell() : null}
                            {addIndex == dsDieuKien.length ? this.addCell(dsDieuKien.length) : null}
                        </>
                    ),
                })}
            </div>
            <div className='form-group col-md-12' style={{ textAlign: 'center', display: this.state.addIndex == null ? '' : 'none' }}>
                <button className='btn btn-info' type='button' onClick={() => this.setState({ addIndex: dsDieuKien.length })}>
                    <i className='fa fa-sm fa-plus' /> Thêm điều kiện
                </button>
            </div>
        </>);
    }

    onSubmit = (e) => {
        const { dsDieuKien } = this.state;
        const changes = {
            ten: getValue(this.ten),
            moTa: getValue(this.moTa),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            dsDieuKien
        };
        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        e.preventDefault();
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            size: 'elarge',
            title: this.state.id ? 'Cập nhật danh mục cấu hình kỷ luật' : 'Tạo mới danh mục cấu hình kỷ luật',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên'
                    readOnly={readOnly} required />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả'
                    readOnly={readOnly} />
                {this.componentDanhSachDieuKien()}
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class SvDmCauHinhKyLuatPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.onSearch = (searchText) => this.props.getSvDmCauHinhKyLuatPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getSvDmCauHinhKyLuatPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa hình thức', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteSvDmCauHinhKyLuat(item.id));
    };

    changeActive = item => this.props.updateSvDmCauHinhKyLuat(item.id, { kichHoat: Number(!item.kichHoat) });


    render() {
        const permission = this.getUserPermission('dmCauHinhKyLuat');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmCauHinhKyLuat && this.props.dmCauHinhKyLuat.page ?
            this.props.dmCauHinhKyLuat.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }} >Tên</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }} >Mô tả</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='link' content={item.ten ? item.ten : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={item.moTa ? item.moTa : ''} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                        onChanged={() => this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục hình thức kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh mục hình thức kỷ luật'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getSvDmCauHinhKyLuatPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createSvDmCauHinhKyLuat} update={this.props.updateSvDmCauHinhKyLuat} getDsDieuKien={this.props.getSvDmCauHinhKyLuatDsDieuKien} />
            </>,
            backRoute: '/user/ctsv/ky-luat',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const idpStateToProps = state => ({ system: state.system, dmCauHinhKyLuat: state.ctsv.dmCauHinhKyLuat });
const idpActionsToProps = { createSvDmCauHinhKyLuat, updateSvDmCauHinhKyLuat, deleteSvDmCauHinhKyLuat, getSvDmCauHinhKyLuatPage, getSvDmCauHinhKyLuatDsDieuKien };
export default connect(idpStateToProps, idpActionsToProps)(SvDmCauHinhKyLuatPage);