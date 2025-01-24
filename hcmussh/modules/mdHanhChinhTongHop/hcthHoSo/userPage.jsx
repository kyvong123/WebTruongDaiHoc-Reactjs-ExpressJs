import { Tooltip } from '@mui/material';
import { SelectAdapter_LoaiHoSo } from 'modules/mdDanhMuc/dmLoaiHoSo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, FormTextBox, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { ThemVanBanModal } from './component';
import { addVanBan, createHoSo, getHoSo, getHoSoSearchPage, getVanBanDenSelector, getVanBanDiSelector, deleteHoSo } from './redux';


class CreateModal extends AdminModal {
    onShow = () => {
        this.tieuDe.value('');
        this.loaiHoSo.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            tieuDe: this.tieuDe.value(),
            loaiHoSo: this.loaiHoSo.value()
        };
        if (!data.tieuDe) {
            T.notify('Tiêu đề hồ sơ bị trống', 'danger');
            this.tieuDe.focus();
        } else if (!data.loaiHoSo) {
            T.notify('Loại hồ sơ bị trống', 'danger');
            this.loaiHoSo.focus();
        } else {
            this.props.create(data, this.hide);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo hồ sơ',
            body: <div className='row'>
                <FormTextBox ref={e => this.tieuDe = e} className='col-md-12' label='Tiêu đề' type='text' required />
                <FormSelect ref={e => this.loaiHoSo = e} data={SelectAdapter_LoaiHoSo} label='Loại hồ sơ' className='col-md-12' required />
            </div>
        });
    }
}


class HcthHoSo extends AdminPage {
    state = {
        filter: {},
        isLoading: true
    };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    'Danh sách hồ sơ',
                ],
                backRoute: '/user/hcth',
                baseUrl: '/user/hcth/ho-so',
            };
        else
            return {
                readyUrl: '/user/van-phong-dien-tu',
                breadcrumb: [
                    <Link key={0} to='/user/'>...</Link>,
                    <Link key={1} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                    'Danh sách hồ sơ',
                ],
                backRoute: '/user/van-phong-dien-tu',
                baseUrl: '/user/ho-so',
            };
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthHoSo && this.props.hcthHoSo.page ? this.props.hcthHoSo.page : { pageNumber: 1, pageSize: 50 };
        let pageFilter = isInitial ? {} : {};
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', () => {
                this.setState({ isLoading: false });
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHoSoSearchPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá hồ sơ', 'Tất cả các hồ sơ, văn bản liên quan sẽ bị xoá. Bạn có chắc chắn muốn xoá hồ sơ này không ?', true, isConfirm => isConfirm && this.props.deleteHoSo(item.id, this.getPage));
    }

    render() {
        const { baseUrl, breadcrumb, backRoute } = this.getSiteSetting();
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.hcthHoSo && this.props.hcthHoSo.page ?
            this.props.hcthHoSo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null },
            currentPermissions = this.getUserPermission('hcthHoSo', ['read', 'write', 'delete']);

        const table = renderTable({
            emptyTable: 'Chưa có dữ liệu hồ sơ',
            stickyHead: true,
            getDataSource: () => this.props.hcthHoSo?.page?.list,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tiêu đề</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Loại hồ sơ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr >;
            },
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue', fontWeight: 'bold' }} content={`${item.hoNguoiTao} ${item.tenNguoiTao}`.trim().normalizedName()} />
                        <TableCell type='link' contentClassName='multiple-lines' contentStyle={{ width: '100%', minWidth: '300px' }} content={item.tieuDe || 'Chưa có tiêu đề'} url={item.vanBanAmount && item.vanBanAmount > 0 ? `${baseUrl}/${item.id}` : `${baseUrl}/leaf?id=${item.id}`} />
                        <TableCell type='text' style={{ fontWeight: 'bold' }} content={item.loaiHoSo || ''} />
                        <TableCell style={{ textAlign: 'center' }} permission={{ delete: currentPermissions.delete }} type='buttons' content={item} onDelete={e => this.onDelete(e, item)}>
                            {(item.childAmount && item.childAmount > 0) ? null : <Tooltip title='Thêm văn bản' arrow>
                                <button className='btn btn-success' onClick={e => {
                                    e.preventDefault();
                                    this.props.getHoSo(Number(item.id), () => this.themVanBanModal.show(item));
                                }}>
                                    <i className='fa fa-lg fa-plus' />
                                </button>
                            </Tooltip>}
                        </TableCell>
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-file-text',
            title: 'Hồ sơ',
            stickyHead: true,
            content: this.state.isLoading ? loadSpinner() : (<>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <CreateModal ref={e => this.createModal = e} create={this.props.createHoSo} />
                <ThemVanBanModal ref={e => this.themVanBanModal = e} {...this.props} />
            </>),
            backRoute: backRoute,
            breadcrumb: breadcrumb,
            onCreate: (e) => {
                e.preventDefault();
                this.createModal.show(null);
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthHoSo: state.hcth.hcthHoSo });
const mapActionsToProps = { getHoSoSearchPage, createHoSo, getHoSo, getVanBanDiSelector, getVanBanDenSelector, addVanBan, deleteHoSo };
export default connect(mapStateToProps, mapActionsToProps)(HcthHoSo);