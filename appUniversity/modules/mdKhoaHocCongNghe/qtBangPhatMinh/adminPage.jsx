import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTextBox, TableCell, FormTabs, TableHead, renderDataTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_FwCanBo } from '../../mdTccb/tccbCanBo/redux';
import {
    getQtBangPhatMinhPage, deleteQtBangPhatMinhStaff, createQtBangPhatMinhMultiple,
    updateQtBangPhatMinhStaff, getQtBangPhatMinhGroupPage
}
    from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    state = {
        id: null,
    };
    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, shcc, tenBang, soHieu, namCap, noiCap, tacGia, sanPham, loaiBang } = item ? item : {
            id: '', shcc: '', tenBang: '', soHieu: '', namCap: '', noiCap: '', tacGia: '', sanPham: '', loaiBang: ''
        };

        this.setState({
            id
        }, () => {
            const d = new Date(namCap, 1);
            this.maCanBo.value(shcc);
            this.tenBang.value(tenBang ? tenBang : '');
            this.soHieu.value(soHieu ? soHieu : '');
            this.namCap.value(d ? d.getTime() : '');
            this.noiCap.value(noiCap ? noiCap : '');
            this.tacGia.value(tacGia ? tacGia : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.loaiBang.value(loaiBang ? loaiBang : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let listMa = this.maCanBo.value();
        if (!Array.isArray(listMa)) {
            listMa = [listMa];
        }
        let changes = {
            tenBang: this.tenBang.value(),
            soHieu: this.soHieu.value(),
            namCap: this.namCap.value().getYear() + 1900,
            noiCap: this.noiCap.value(),
            tacGia: this.tacGia.value(),
            sanPham: this.sanPham.value(),
            loaiBang: this.loaiBang.value(),
        };
        if (listMa.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.tenBang.value()) {
            T.notify('Tên bằng phát minh trống', 'danger');
            this.tenBang.focus();
        } else if (!this.soHieu.value()) {
            T.notify('Số hiệu bằng phát minh trống', 'danger');
            this.soHieu.focus();
        } else if (!this.namCap.value()) {
            T.notify('Năm cấp bằng phát minh trống', 'danger');
            this.namCap.focus();
        } else {
            if (this.state.id) {
                changes.shcc = listMa[0];
                this.props.update(this.state.id, changes, this.hide);
            } else {
                changes.listShcc = listMa;
                this.props.create(changes, this.hide);
            }
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình bằng phát minh' : 'Tạo mới quá trình bằng phát minh',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required />
                <FormTextBox className='col-md-12' ref={e => this.tenBang = e} label='Tên bằng phát minh' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.soHieu = e} label='Số hiệu bằng phát minh' readOnly={readOnly} required />
                <FormDatePicker className='col-md-6' type='year-mask' ref={e => this.namCap = e} label='Năm cấp bằng phát minh' placeholder='Năm cấp' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.noiCap = e} label='Nơi cấp bằng phát minh' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.tacGia = e} label='Tác giả bằng phát minh' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.loaiBang = e} label='Loại bằng phát minh' readOnly={readOnly} />
            </div>
        });
    }
}

class QtBangPhatMinh extends AdminPage {
    state = { filter: {} };
    menu = '';
    componentDidMount() {
        this.menu = T.routeMatcher('/user/:khcn/qua-trinh/bang-phat-minh').parse(window.location.pathname).khcn;
        T.clearSearchBox();
        T.ready('/user/' + this.menu, () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {

            });

            this.changeAdvancedSearch(false, true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtBangPhatMinh && this.props.qtBangPhatMinh.page ? this.props.qtBangPhatMinh.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : (this.fromYear?.value().getYear() == 0 ? null : this.fromYear?.value().getYear() + 1900);
        const toYear = this.toYear?.value() == '' ? null : (this.toYear?.value().getYear() == 0 ? null : this.toYear?.value().getYear() + 1900);
        const listDv = this.maDonVi?.value().toString() || '';
        const listShcc = this.mulCanBo?.value().toString() || '';
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.listDv);
                    this.mulCanBo?.value(filter.listShcc);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.listShcc || filter.listDv)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtBangPhatMinhGroupPage(pageN, pageS, pageC, this.state.filter, done);
        this.props.getQtBangPhatMinhPage(pageN, pageS, pageC, this.state.filter, done);
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    list = (text, i, j) => {
        if (!text) return [];
        let items = text.split('??').map(str => <p key={i--}>{j - i}. {str}</p>);
        return items;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình bằng phát minh', 'Bạn có chắc bạn muốn xóa quá trình bằng phát minh này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBangPhatMinhStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá quá trình bằng phát minh bị lỗi!', 'danger');
                else T.alert('Xoá quá trình bằng phát minh thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtBangPhatMinh', ['read', 'write', 'delete', 'readOnly']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtBangPhatMinh && this.props.qtBangPhatMinh.page ? this.props.qtBangPhatMinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let { pageNumber: groupByShccPageNumber, pageSize: groupByShccPageSize, pageTotal: groupByShccPageTotal, totalItem: groupByShccTotalItem, pageCondition: groupByShccPageCondition, list: groupByShccList } = this.props.qtBangPhatMinh && this.props.qtBangPhatMinh.pageGr ? this.props.qtBangPhatMinh.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let fullTable = renderDataTable({
            data: list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '50%' }} content='Tên bằng' keyCol='tenbang' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto' }} content='Số hiệu' keyCol='sohieu' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Năm cấp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Nơi cấp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tác giả</th>
                    <TableHead style={{ width: 'auto' }} content='Cán bộ' keyCol='canbo' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh<br />nghề nghiệp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={(item.tenBang || '')} />
                    <TableCell type='text' content={(item.soHieu || '')} />
                    <TableCell type='text' content={(<span style={{ color: 'blue' }}>{item.namCap}</span>)} />
                    <TableCell type='text' content={(item.noiCap)} />
                    <TableCell type='text' content={(item.tacGia)} />
                    <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
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
                    {
                        !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                        </TableCell>
                    }
                    {
                        this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                            <Link className='btn btn-success' to={`/user/${this.menu}/qua-trinh/bang-phat-minh/group/${item.shcc}`} >
                                <i className='fa fa-lg fa-compress' />
                            </Link>
                        </TableCell>
                    }
                </tr>
            )
        });

        let fullPage = <>
            {fullTable}
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
        </>;

        let groupTable = renderDataTable({
            data: groupByShccList, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto' }} content='Cán bộ' keyCol='canbogroup' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh<br />nghề nghiệp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số bằng phát minh</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách tên bằng phát minh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
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
                    <TableCell type='text' content={item.soBang} />
                    <TableCell type='text' content={this.list(item.danhSachTenBang, item.soBang, item.soBang)} />

                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                        <Link className='btn btn-success' to={`/user/${this.menu}/qua-trinh/bang-phat-minh/group/${item.shcc}`} >
                            <i className='fa fa-lg fa-compress' />
                        </Link>
                    </TableCell>
                </tr>
            )
        });

        let groupByShccPage = <>
            {groupTable}
            <Pagination style={{ marginLeft: '70px' }} pageNumber={groupByShccPageNumber} pageSize={groupByShccPageSize} pageTotal={groupByShccPageTotal} totalItem={groupByShccTotalItem} pageCondition={groupByShccPageCondition} getPage={this.getPage} />
        </>;


        return this.renderPage({
            icon: 'fa fa-cogs',
            title: ' Quá trình bằng phát minh',
            breadcrumb: [
                <Link key={0} to={'/user/' + this.menu}>{this.menu == 'tccb' ? 'Tổ chức cán bộ' : 'Quản lý khoa học'}</Link>,
                'Quá trình bằng phát minh'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='year-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian (năm cấp)' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='year-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian (năm cấp)' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormTabs
                        tabs={[
                            { title: 'Hiển thị tất cả', component: fullPage },
                            { title: 'Hiển thị theo cán bộ', component: groupByShccPage },
                        ]}
                    />
                </div>

                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createQtBangPhatMinhMultiple} update={this.props.updateQtBangPhatMinhStaff}
                />
            </>,
            backRoute: '/user/' + this.menu,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBangPhatMinh: state.khcn.qtBangPhatMinh });
const mapActionsToProps = {
    getQtBangPhatMinhPage, deleteQtBangPhatMinhStaff, createQtBangPhatMinhMultiple,
    updateQtBangPhatMinhStaff, getQtBangPhatMinhGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtBangPhatMinh);