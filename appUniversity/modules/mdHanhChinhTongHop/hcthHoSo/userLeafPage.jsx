import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, renderTable, TableCell, FormTextBox, loadSpinner, CirclePageButton } from 'view/component/AdminPage';
import { SelectAdapter_LoaiHoSo } from 'modules/mdDanhMuc/dmLoaiHoSo/redux';
import { getHoSoSearchPage, createHoSo, getLeafPage, getVanBanDiSelector, getVanBanDenSelector, addVanBan, getHoSo, deleteHoSo } from './redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import { ThemVanBanModal } from './component';

class CreateModal extends AdminModal {
    onShow = () => {
        this.tieuDe.value('');
        this.loaiHoSo.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            tieuDe: this.tieuDe.value(),
            loaiHoSo: this.loaiHoSo.value(),
            idFather: this.props.idFather
        };
        if (!data.tieuDe) {
            T.notify('Tiêu đề hồ sơ bị trống', 'danger');
            this.tieuDe.focus();
        } else if (!data.loaiHoSo) {
            T.notify('Loại hồ sơ bị trống', 'danger');
            this.loaiHoSo.focus();
        } else {
            this.props.create(data, () => this.props.getPage(this.props.pageNumber, this.props.pageSize, null, () => this.hide()));
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

class UserLeafPage extends AdminPage {

    state = {
        filter: {},
        isLoading: true
    }

    componentDidMount() {
        const { readyUrl } = this.getSiteSetting();
        T.ready(readyUrl, () => {
            const query = new URLSearchParams(this.props.location.search);
            this.setState({
                id: query.get('id')
            }, () => this.changeAdvancedSearch());
        });
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        const father = this.props.hcthHoSo?.leafPage?.fatherItem;
        if (pathName.startsWith('/user/hcth/ho-so/leaf')) {
            return {
                readyUrl: '/user/hcth/ho-so',
                backRoute: father ? `/user/hcth/ho-so/leaf?id=${father}` : '/user/hcth/ho-so',
                baseUrl: '/user/hcth/ho-so'
            };
        }
        else {
            return {
                readyUrl: '/user/van-phong-dien-tu',
                backRoute: father ? `/user/ho-so/leaf?id=${father}` : '/user/ho-so',
                baseUrl: '/user/ho-so'
            };
        }
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize } = this.props && this.props.hcthHoSo && this.props.hcthHoSo.leafPage ? this.props.hcthHoSo.leafPage : { pageNumber: 1, pageSize: 50 };
        this.setState({ filter: { id: this.state.id } }, () => {
            this.getPage(pageNumber, pageSize, '', () => {
                this.setState({ isLoading: false });
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getLeafPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá hồ sơ', 'Tất cả các hồ sơ, văn bản liên quan sẽ bị xoá. Bạn có chắc chắn muốn xoá hồ sơ này không ?', true, isConfirm => isConfirm && this.props.deleteHoSo(item.id, this.getPage));
    }

    render() {
        const { backRoute, baseUrl } = this.getSiteSetting();
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.hcthHoSo && this.props.hcthHoSo.leafPage ?
            this.props.hcthHoSo.leafPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null },
            currentPermissions = this.getUserPermission('hcthHoSo', ['read', 'write', 'delete']);

        const table = renderTable({
            emptyTable: 'Chưa có dữ liệu hồ sơ con',
            stickyHead: true,
            getDataSource: () => this.props.hcthHoSo?.leafPage?.list,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tiêu đề</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Loại hồ sơ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>;
            },
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue', fontWeight: 'bold' }} content={`${item.hoNguoiTao} ${item.tenNguoiTao}`.trim().normalizedName()} />
                        <TableCell type='link' contentClassName='multiple-lines' contentStyle={{ width: '100%', minWidth: '300px' }} content={item.tieuDe || 'Chưa có tiêu đề'}
                            onClick={() => item.vanBanAmount && item.vanBanAmount > 0 ? window.location.assign(`${baseUrl}/${item.id}`) : window.location.assign(`${baseUrl}/leaf?id=${item.id}`)} />
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
            title: 'Hồ sơ con',
            stickyHead: true,
            content: this.state.isLoading ? loadSpinner() : (<>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <CreateModal ref={e => this.createModal = e} create={this.props.createHoSo} idFather={this.state.id} getPage={this.getPage} pageNumber={pageNumber} pageSize={pageSize} />
                <ThemVanBanModal ref={e => this.themVanBanModal = e} {...this.props} />
                <CirclePageButton type='back' to={(e) => {
                    e.preventDefault();
                    window.location.assign(backRoute);
                }} />
            </>),
            onCreate: (e) => {
                e.preventDefault();
                this.createModal.show();
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthHoSo: state.hcth.hcthHoSo });
const mapActionsToProps = { getHoSoSearchPage, getLeafPage, createHoSo, getVanBanDiSelector, getVanBanDenSelector, addVanBan, getHoSo, deleteHoSo };
export default connect(mapStateToProps, mapActionsToProps)(UserLeafPage);