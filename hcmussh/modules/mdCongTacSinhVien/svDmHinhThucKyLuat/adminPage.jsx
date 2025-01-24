import React from 'react';
import { connect } from 'react-redux';
import { createSvDmHinhThucKyLuat, updateSvDmHinhThucKyLuat, deleteSvDmHinhThucKyLuat, getSvDmHinhThucKyLuatPage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, getValue, FormCheckbox, FormRichTextBox, FormTextBox, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { id, ten, moTa, drlMax, kichHoat, chuyenTinhTrang } = item ? item : { id: '', ten: '', moTa: '', drlMax: '', kichHoat: 1, chuyenTinhTrang: '' };
        this.setState({ id, item });
        this.ten.value(ten || '');
        this.moTa.value(moTa || '');
        this.drlMax.value(drlMax || '');
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.chuyenTinhTrang.value(chuyenTinhTrang || '');
    };

    onSubmit = (e) => {
        const changes = {
            ten: getValue(this.ten),
            moTa: getValue(this.moTa),
            drlMax: getValue(this.drlMax),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            chuyenTinhTrang: getValue(this.chuyenTinhTrang)
        };
        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        e.preventDefault();
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật hình thức' : 'Tạo mới hình thức',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên'
                    readOnly={readOnly} required />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả'
                    readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.chuyenTinhTrang = e} label='Chuyển tình trạng' data={SelectAdapter_DmTinhTrangSinhVienV2} readOnly={readOnly} />
                <FormTextBox type='number' className='col-md-12' ref={e => this.drlMax = e} label='Điểm rèn luyện tối đa'
                    readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class SvDmHinhThucKyLuatPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.onSearch = (searchText) => this.props.getSvDmHinhThucKyLuatPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getSvDmHinhThucKyLuatPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa hình thức', 'Bạn có chắc bạn muốn xóa hình thức kỷ luật này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteSvDmHinhThucKyLuat(item.id));
    };

    changeActive = item => this.props.updateSvDmHinhThucKyLuat(item.id, { kichHoat: Number(!item.kichHoat) });


    render() {
        const permission = this.getUserPermission('dmHinhThucKyLuat');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmHinhThucKyLuat && this.props.dmHinhThucKyLuat.page ?
            this.props.dmHinhThucKyLuat.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
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
                    getPage={this.props.getSvDmHinhThucKyLuatPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createSvDmHinhThucKyLuat} update={this.props.updateSvDmHinhThucKyLuat} />
            </>,
            backRoute: '/user/ctsv/ky-luat',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const idpStateToProps = state => ({ system: state.system, dmHinhThucKyLuat: state.ctsv.dmHinhThucKyLuat });
const idpActionsToProps = { createSvDmHinhThucKyLuat, updateSvDmHinhThucKyLuat, deleteSvDmHinhThucKyLuat, getSvDmHinhThucKyLuatPage };
export default connect(idpStateToProps, idpActionsToProps)(SvDmHinhThucKyLuatPage);