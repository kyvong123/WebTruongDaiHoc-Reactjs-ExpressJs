import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, FormTabs, renderTable, TableCell, AdminModal, FormRichTextBox } from 'view/component/AdminPage';
import { getTccbCapMaCanBoPage, checkExist, createCapMa, acceptCapMa, rejectCapMa, huyMscb } from './redux';
import DetailModal from './modal/editModal';
import CreateModal from './modal/createModal';
import { Tooltip } from '@mui/material';

class HuyMaSoModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item) => {
        this.setState({ ...item }, () => {
            this.ghiChu.value('');
        });
    }

    onSubmit = () => {
        T.confirm('Cảnh báo', `Xác nhận hủy mã số cán bộ cho CB ${this.state.hoVaTen?.normalizedName() || ''}?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.setState({ isSubmitting: true }, () => {
                    this.props.delete(this.state.id, this.ghiChu.value() || '', () => {
                        this.hide();
                        this.setState({ isSubmitting: false });
                        T.alert('Hủy mã số cán bộ thành công', 'success', false, 800);
                    });
                });
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: `Hủy mã số cán bộ - ${this.state.mscb}`,
            isLoading: this.state.isSubmitting,
            size: 'large',
            body: <div className='row'>
                <FormRichTextBox disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.ghiChu = e} label='Lý do hủy' />
            </div>
        });
    }
}

class tccbCapMaCanBoAdminPage extends AdminPage {
    state = { filter: { trangThai: 'CHO_KY' } }
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.getPage(undefined, undefined, '');
            this.tabPage.tabClick(null, 0);
            // this.setState({ filter: { trangThai: 1 } });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTccbCapMaCanBoPage(pageN, pageS, pageC, this.state.filter, done);
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, listTotalItem, list } = this.props.tccbCapMaCanBo && this.props.tccbCapMaCanBo.page ?
            this.props.tccbCapMaCanBo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, listTotalItem: [], list: [] };

        const mapTrangThai = {
            CHO_KY: 'Chờ ký',
            CHO_HIEU_LUC: 'Chờ hiệu lực',
            CO_HIEU_LUC: 'Có hiệu lực',
            HUY: 'Đã hủy'
        };

        const mapGioiTinh = { 0: 'Nữ', 1: 'Nam' };

        const renderTabs = (data) => <div className='tile'>{table(data)}</div>;

        const table = (data) => renderTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => data,
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày tạo</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>{this.state.filter.trangThai == 'CHO_KY' ? 'Mã dự kiến' : 'Mã số cán bộ'}</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày sinh</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Giới tính</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Đơn vị</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại cán bộ</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Email trường</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>T.trạng email</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianTao} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mscb || `QSX${new Date(item.ngaySinh).getFullYear().toString().substring(2)}${item.gioiTinh}${item.dinhDanh.toString().padStart(4, '0')}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hoVaTen?.toUpperCase()} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngaySinh} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={mapGioiTinh[item.gioiTinh] || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenDonVi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.loaiCanBo} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.emailTruong || item.emailTruongSuggest || 'Chưa có'} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.emailTruong ? 'Đã cấp' : (item.emailTruongSuggest ? 'Chờ duyệt' : '')} />
                    <TableCell type='buttons' content={item} onEdit={() => this.detailModal.show(item)}>
                        <Tooltip style={this.state.filter.trangThai == 'XAC_NHAN' ? {} : { display: 'none' }} title='Hủy mã số' arrow>
                            <button className='btn btn-danger' onClick={e => e.preventDefault() || this.huyMaSoModal.show(item)}><i className='fa fa-lg fa-ban' content={item} /></button>
                        </Tooltip>
                        <Tooltip style={this.state.filter.trangThai != 'HUY' ? {} : { display: 'none' }} title='Tạo hợp đồng' arrow>
                            <button className='btn btn-warning' onClick={e => e.preventDefault() || window.open(`/user/tccb/hop-dong-lao-dong/new?mscb=${item.mscb}`)}><i className='fa fa-lg fa-file-text' content={item} /></button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Quản lý mã số cán bộ',
            breadcrumb: [
                'Quản lý mã số cán bộ'
            ],
            content: <>
                <FormTabs contentClassName='tile-body' id='test-data' ref={e => this.tabPage = e} onChange={tab => this.setState({ filter: { ...this.state.filter, trangThai: Object.keys(mapTrangThai)[tab.tabIndex] } }, () => this.getPage())} tabs={Object.keys(mapTrangThai).map(item => {
                    const listData = list;
                    return Object({ title: <> {mapTrangThai[item]} {list && <span className="badge badge-secondary">{listTotalItem.find(ele => ele.trangThai == item)?.totalItem || 0}</span>}</>, component: renderTabs(listData) });
                })} />
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                <DetailModal ref={e => this.detailModal = e} check={this.props.checkExist} accept={this.props.acceptCapMa} reject={this.props.rejectCapMa} mapTrangThai={mapTrangThai} />
                <CreateModal ref={e => this.createModal = e} check={this.props.checkExist} create={this.props.createCapMa} />
                <HuyMaSoModal ref={e => this.huyMaSoModal = e} delete={this.props.huyMscb} />
            </>,
            onCreate: e => e.preventDefault() || this.createModal.show()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbCapMaCanBo: state.tccb.tccbCapMaCanBo });
const mapActionsToProps = { getTccbCapMaCanBoPage, checkExist, createCapMa, acceptCapMa, rejectCapMa, huyMscb };
export default connect(mapStateToProps, mapActionsToProps)(tccbCapMaCanBoAdminPage);