import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, AdminModal, FormSelect, FormTextBox, FormRichTextBox, FormTabs, TableHead, renderDataTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtBaiVietKhoaHocPage, updateQtBaiVietKhoaHocStaff,
    deleteQtBaiVietKhoaHocStaff, createQtBaiVietKhoaHocMultiple, getQtBaiVietKhoaHocGroupPage,
} from './redux';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

const quocTeList = [
    { id: 0, text: 'Trong nước' },
    { id: 1, text: 'Quốc tế' },
    { id: 2, text: 'Trong và ngoài nước' }
];

class EditModal extends AdminModal {
    state = {
        id: '',
    };
    multiple = false;
    listName = [];
    onShow = (item, multiple = true) => {
        this.listName = [];
        this.multiple = multiple;

        let { id, shcc, tenTacGia, namXuatBan, tenBaiViet, tenTapChi, soHieuIssn, sanPham, diemIf, quocTe } = item ? item : {
            id: null, shcc: '', tenTacGia: '', namXuatBan: null, tenBaiViet: '', tenTapChi: '', soHieuIssn: '', sanPham: '', diemIf: '',
            quocTe: 0
        };

        this.setState({ id: id });

        setTimeout(() => {
            this.maCanBo.value(shcc);
            this.tenTacGia.value(tenTacGia ? tenTacGia : '');
            if (namXuatBan) this.namXuatBan.setVal(new Date(namXuatBan.toString()));
            this.tenBaiViet.value(tenBaiViet ? tenBaiViet : '');
            this.tenTapChi.value(tenTapChi ? tenTapChi : '');
            this.soHieuIssn.value(soHieuIssn ? soHieuIssn : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.diemIf.value(diemIf ? diemIf : '');
            this.quocTe.value(quocTe ? quocTe : '');
        }, 500);
    };

    onSubmit = (e) => {
        e.preventDefault();
        let listMa = this.maCanBo.value();
        if (!Array.isArray(listMa)) {
            listMa = [listMa];
        }
        let changes = {
            tenTacGia: this.tenTacGia.value(),
            namXuatBan: this.namXuatBan.getVal() ? new Date(this.namXuatBan.getVal()).getFullYear() : null,
            tenBaiViet: this.tenBaiViet.value(),
            tenTapChi: this.tenTapChi.value(),
            soHieuIssn: this.soHieuIssn.value(),
            sanPham: this.sanPham.value(),
            diemIf: this.diemIf.value(),
            quocTe: this.quocTe.value(),
        };
        if (listMa.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.tenTacGia.value()) {
            T.notify('Tên tác giả trống', 'danger');
            this.tenTacGia.focus();
        } else if (!this.tenTapChi.value()) {
            T.notify('Tên tạp chí trống', 'danger');
            this.tenTapChi.focus();
        } else if (!this.soHieuIssn.value()) {
            T.notify('Số hiệu ISSN trống', 'danger');
            this.soHieuIssn.focus();
        } else if (!this.namXuatBan.getVal()) {
            T.notify('Năm xuất bản trống', 'danger');
            this.namXuatBan.focus();
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

    removeName = (listName, name) => {
        const index = listName.indexOf(name);
        if (index > -1) {
            listName.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    convertName = (listName) => {
        if (listName.length == 0) return '';
        let result = '';
        for (let i = 0; i < listName.length; i++) {
            let name = listName[i];
            let index = name.indexOf(':');
            name = name.substring(index + 2);
            name = name.trim();
            name = name.normalizedName();
            if (i > 0) result += ', ';
            result += name;
        }
        return result;
    }
    handleTacGia = (item) => {
        if (!this.state.id) {
            if (item.selected) this.listName.push(item.text);
            else this.removeName(this.listName, item.text);
            this.tenTacGia.value(this.convertName(this.listName));
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật bài viết khoa học' : 'Tạo mới bài viết khoa học',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={(item) => this.handleTacGia(item)} readOnly={readOnly} required />
                <FormTextBox className='col-12' ref={e => this.tenTacGia = e} label={'Tác giả'} type='text' required readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.tenBaiViet = e} label={'Tên bài viết'} type='text' readOnly={readOnly} />
                <FormTextBox className='col-9' ref={e => this.tenTapChi = e} label={'Tên tạp chí'} type='text' required readOnly={readOnly} />
                <FormTextBox className='col-3' ref={e => this.soHieuIssn = e} label={'Số hiệu ISSN'} type='text' required readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' readOnly={readOnly} />
                <div className='form-group col-md-4'><DateInput ref={e => this.namXuatBan = e} label='Năm xuất bản' type='year' required readOnly={readOnly} /></div>
                <FormSelect className='col-md-4' ref={e => this.quocTe = e} label='Phạm vi xuất bản' data={quocTeList} readOnly={readOnly} />
                <FormTextBox className='col-4' ref={e => this.diemIf = e} label={'Điểm If'} type='text' readOnly={readOnly} />
            </div>
        });
    }
}

class QtBaiVietKhoaHoc extends AdminPage {
    state = { filter: {} };
    menu = '';
    componentDidMount() {
        this.menu = T.routeMatcher('/user/:khcn/qua-trinh/bai-viet-khoa-hoc').parse(window.location.pathname).khcn;
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
        let { pageNumber, pageSize } = this.props && this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.page ? this.props.qtBaiVietKhoaHoc.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear.value() == '' ? null : Number(this.fromYear.value());
        const toYear = this.toYear.value() == '' ? null : Number(this.toYear.value());
        const listDv = this.maDonVi.value().toString() || '';
        const listShcc = this.mulCanBo.value().toString() || '';
        const xuatBanRange = this.xuatBanRange.value() == '' ? null : this.xuatBanRange.value();
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc, xuatBanRange };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear.value(filter.fromYear || '');
                    this.toYear.value(filter.toYear || '');
                    this.maDonVi.value(filter.listDv);
                    this.mulCanBo.value(filter.listShcc);
                    this.xuatBanRange.value(filter.xuatBanRange);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.listShcc || filter.listDv || filter.xuatBanRange)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtBaiVietKhoaHocGroupPage(pageN, pageS, pageC, this.state.filter, done);
        this.props.getQtBaiVietKhoaHocPage(pageN, pageS, pageC, this.state.filter, done);
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    list = (text, n, listYear) => {
        if (!text) return [];
        let deTais = text.split('??');
        let years = listYear.split('??');
        let results = [];
        let choose = n > 5 ? 5 : n;
        for (let k = 0; k < choose; k++) {
            results.push(<div key={results.length}> <span>
                {k + 1}. {deTais[k]} ({years[k].trim()})
            </span></div>);
        }
        if (n > 5) {
            results.push(<div key={results.length}> <span>
                .........................................
            </span></div>);
            let k = n - 1;
            results.push(<div key={results.length}> <span>
                {k + 1}. {deTais[k]} ({years[k].trim()})
            </span></div>);
        }
        return results;
    }

    delete = (e, item) => {
        T.confirm('Xóa bài viết khoa học', 'Bạn có chắc bạn muốn xóa bài viết khoa học này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBaiVietKhoaHocStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá bài viết khoa học bị lỗi!', 'danger');
                else T.alert('Xoá bài viết khoa học thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const permission = this.getUserPermission('qtBaiVietKhoaHoc', ['read', 'write', 'delete', 'readOnly']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.page ? this.props.qtBaiVietKhoaHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let { pageNumber: groupByShccPageNumber, pageSize: groupByShccPageSize, pageTotal: groupByShccPageTotal, totalItem: groupByShccTotalItem, pageCondition: groupByShccPageCondition, list: groupByShccList } = this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.pageGr ? this.props.qtBaiVietKhoaHoc.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let fullTable = renderDataTable({
            data: list,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '50%' }} content='Tác giả' keyCol='tacgia' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto' }} content='Bài viết' keyCol='baiviet' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto' }} content='Số hiệu ISSN' keyCol='issn' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tạp chí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Xuất bản</th>
                    <TableHead style={{ width: 'auto' }} content='Cán bộ' keyCol='canbo' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh<br />nghề nghiệp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={((pageNumber - 1) * pageSize + index + 1)} />
                    <TableCell type='link' onClick={() => this.modal.show(item, false)} content={(item.tenTacGia || '')} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(<b>{item.tenBaiViet}</b>)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soHieuIssn} />
                    <TableCell type='text' content={(<i>{item.tenTapChi}</i>)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            {item.quocTe != null && <span>{item.quocTe == '0' ? <span style={{ color: 'red' }}>Trong nước</span>
                                : item.quocTe == '1' ? <span style={{ color: 'orange' }}>Quốc tế</span>
                                    : item.quocTe == '2' ? <span style={{ color: 'green' }}>Trong và ngoài nước</span> :
                                        ''}<br /></span>}
                            <span style={{ whiteSpace: 'nowrap' }}>Năm: <b>{item.namXuatBan}</b> </span>

                        </>
                    )}
                    />
                    <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                            {item.shcc}
                        </>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenChucDanhNgheNghiep || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span> {item.tenChucVu || ''}<br /> </span>
                            {(item.tenDonVi || '')}
                        </>
                    )} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                    </TableCell>
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
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số bài viết</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách bài viết</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={((pageNumber - 1) * pageSize + index + 1)} />
                    <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                            {item.shcc}
                        </>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenChucDanhNgheNghiep || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span> {item.tenChucVu || ''}<br /> </span>
                            {(item.tenDonVi || '')}
                        </>
                    )} />
                    <TableCell type='text' content={item.soBaiViet} />
                    <TableCell type='text' content={this.list(item.danhSachBaiViet, item.soBaiViet, item.danhSachNamXuatBan)} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                        <Link className='btn btn-success' to={`/user/${this.menu}/qua-trinh/bai-viet-khoa-hoc/group/${item.shcc}`} >
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
            icon: 'fa fa-file-text',
            title: 'Bài viết khoa học',
            breadcrumb: [
                <Link key={0} to={'/user/' + this.menu}>{this.menu == 'tccb' ? 'Tổ chức cán bộ' : 'Khoa học công nghệ'}</Link>,
                'Bài viết khoa học'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-4' ref={e => this.fromYear = e} label='Từ năm (năm xuất bản)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-4' ref={e => this.toYear = e} label='Đến năm (năm xuất bản)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-md-4' ref={e => this.xuatBanRange = e} label='Phạm vi xuất bản' data={quocTeList} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
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
                    create={this.props.createQtBaiVietKhoaHocMultiple} update={this.props.updateQtBaiVietKhoaHocStaff}
                />
            </>,

            backRoute: '/user/' + this.menu,

            onCreate: (permission && permission.write) ? (e) => this.showModal(e) : null,
            onExport: (e) => {
                e.preventDefault();
                const { fromYear, toYear, listShcc, listDv, xuatBanRange } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, xuatBanRange: null };

                T.download(T.url(`/api/khcn/qua-trinh/bai-viet-khoa-hoc/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${xuatBanRange ? xuatBanRange : null}`), 'baivietkhoahoc.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBaiVietKhoaHoc: state.khcn.qtBaiVietKhoaHoc });
const mapActionsToProps = {
    getQtBaiVietKhoaHocPage, deleteQtBaiVietKhoaHocStaff, createQtBaiVietKhoaHocMultiple,
    updateQtBaiVietKhoaHocStaff, getQtBaiVietKhoaHocGroupPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtBaiVietKhoaHoc);