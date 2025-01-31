import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_FwCanBo } from '../../mdTccb/tccbCanBo/redux';
import {
    getQtSangKienPage, deleteQtSangKienStaff, createQtSangKienStaff,
    updateQtSangKienStaff, getQtSangKienGroupPage
}
    from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

const listCapAnhHuong = [
    { id: 1, text: 'Cấp bộ' },
    { id: 2, text: 'Cấp cơ sở' }
];

class EditModal extends AdminModal {
    state = {
        id: null,
    };

    onShow = (item) => {
        let { id, shcc, maSo, tenSangKien, soQuyetDinh, capAnhHuong } = item ? item : {
            id: '', shcc: '', maSo: '', tenSangKien: '', soQuyetDinh: '', capAnhHuong: ''
        };

        this.setState({
            id
        }, () => {
            this.maCanBo.value(shcc);
            this.maSo.value(maSo ? maSo : '');
            this.tenSangKien.value(tenSangKien ? tenSangKien : '');
            this.soQuyetDinh.value(soQuyetDinh ? soQuyetDinh : '');
            this.capAnhHuong.value(capAnhHuong ? capAnhHuong : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let ma = this.maCanBo.value();
        if (!ma) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.maSo.value()) {
            T.notify('Mã số sáng kiến trống', 'danger');
            this.maSo.focus();
        } else if (!this.tenSangKien.value()) {
            T.notify('Tên sáng kiến trống', 'danger');
            this.tenSangKien.focus();
        } else if (!this.soQuyetDinh.value()) {
            T.notify('Số quyết định trống', 'danger');
            this.soQuyetDinh.focus();
        } else {
            const changes = {
                shcc: ma,
                maSo: this.maSo.value(),
                tenSangKien: this.tenSangKien.value(),
                soQuyetDinh: this.soQuyetDinh.value(),
                capAnhHuong: this.capAnhHuong.value(),
            };
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật danh sách sáng kiến' : 'Tạo mới danh sách sáng kiến',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={this.state.id ? true : false} required />
                <FormTextBox className='col-md-6' ref={e => this.maSo = e} label='Mã số sáng kiến' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.soQuyetDinh = e} label='Số quyết định' readOnly={readOnly} required />
                <FormRichTextBox className='col-md-12' ref={e => this.tenSangKien = e} label='Tên sáng kiến' readOnly={readOnly} required />
                <FormSelect className='col-md-6' ref={e => this.capAnhHuong = e} label='Cấp ảnh hưởng' data={listCapAnhHuong} readOnly={readOnly} />
            </div>
        });
    }
}

class QtSangKien extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtSangKien && this.props.qtSangKien.page ? this.props.qtSangKien.page : { pageNumber: 1, pageSize: 50 };
        const listDonVi = this.maDonVi?.value().toString() || '';
        const listShcc = this.mulCanBo?.value().toString() || '';
        const filterCapAnhHuong = this.filterCapAnhHuong.value()?.toString() || '';
        const pageFilter = isInitial ? null : { listDonVi, listShcc, filterCapAnhHuong };
        this.setState({ filter: isReset ? {} : pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.maDonVi?.value(filter.listDonVi);
                    this.mulCanBo?.value(filter.listShcc);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.listShcc || filter.listDonVi)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtSangKienPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.getPage();
    }

    list = (text, i, j) => {
        if (!text) return [];
        let items = text.split('??').map(str => <p key={i--}>{j - i}. {str}</p>);
        return items;
    }

    delete = (e, item) => {
        T.confirm('Xóa danh sách sáng kiến', 'Bạn có chắc bạn muốn xóa danh sách sáng kiến này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtSangKienStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá danh sách sáng kiến bị lỗi!', 'danger');
                else T.alert('Xoá danh sách sáng kiến thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtSangKien', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtSangKien && this.props.qtSangKien.page ? this.props.qtSangKien.page
            : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu về sáng kiến',
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã số</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên sáng kiến</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cấp ảnh hưởng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                            {item.shcc}
                        </>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span> {item.tenChucVu || ''}<br /> </span>
                            {(item.tenDonVi || '')}
                        </>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(item.maSo || '')} />
                    <TableCell type='text' content={(item.tenSangKien || '')} />
                    <TableCell type='text' content={(item.soQuyetDinh || '')} />
                    <TableCell type='text' content={(item.capAnhHuong == 1 ? 'Cấp bộ' : (item.capAnhHuong == 2 ? 'Cấp cơ sở' : ''))} />
                    {
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>
                    }
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-lightbulb-o',
            title: 'Danh sách sáng kiến',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình sáng kiến'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' ref={e => this.filterCapAnhHuong = e} label='Cấp ảnh hưởng' data={listCapAnhHuong} allowClear={true} minimumResultsForSearch={-1} />
                    <div className='col-12'>
                        <div className='row justify-content-between'>
                            <div className='col-md-6'>Tìm thấy: <b>{totalItem}</b> kết quả</div>
                            <div className='form-group col-md-6' style={{ textAlign: 'right' }}>
                                <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                                    <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                                </button>
                                <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                                    <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createQtSangKienStaff} update={this.props.updateQtSangKienStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onExport: permission && permission.write ? (e) => {
                e.preventDefault();
                const filter = T.stringify(this.state.filter);
                T.download(T.url(`/api/tccb/qua-trinh/sang-kien/download-excel/${filter}`), 'sangkien.xlsx');
            } : null,
            onImport: !this.checked && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/sang-kien/upload') : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtSangKien: state.tccb.qtSangKien });
const mapActionsToProps = {
    getQtSangKienPage, deleteQtSangKienStaff, createQtSangKienStaff,
    updateQtSangKienStaff, getQtSangKienGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtSangKien);