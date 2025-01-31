import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getSdhCauTrucKhungDaoTaoPage } from './redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';


class SdhCauTrucKhungDaoTaoPage extends AdminPage {
    state = { donViFilter: '' }
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            this.setState({ donViFilter: this.props.system.user.staff?.maDonVi });
            T.onSearch = (searchText) => this.props.getSdhCauTrucKhungDaoTaoPage(undefined, undefined, {
                searchTerm: searchText || '',
            });
            T.showSearchBox();
            this.props.getSdhCauTrucKhungDaoTaoPage(undefined, undefined, { searchTerm: '' });

        });
    }

    delete = (item) => {
        T.confirm('Xóa cấu trúc khung đào tạo', 'Bạn có chắc bạn muốn xóa cấu trúc khung đào tạo này?', true, isConfirm =>
            isConfirm && this.props.deleteSdhCauTrucKhungDaoTao(item.id));
    }

    render() {
        const permission = this.getUserPermission('sdhCauTrucKhungDaoTao');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhCauTrucKhungDaoTao && this.props.sdhCauTrucKhungDaoTao.page ?
            this.props.sdhCauTrucKhungDaoTao.page : {
                pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: [], pageCondition: {
                    searchTerm: '', donViFilter: this.state.donViFilter
                }
            };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu cấu trúc khung đào tạo',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>STT</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã khung</th>
                    <th style={{ width: '80%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên khung</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.maKhung} />
                    <TableCell style={{ textAlign: 'left' }} content={item.tenKhung} />

                    <TableCell style={{ textAlign: 'left' }} type='buttons' content={item} permission={permission}
                        onEdit={permission.write ? (e) => e.preventDefault() || this.props.history.push(`/user/sau-dai-hoc/cau-truc-khung-dao-tao/${item.id}`) : null}
                        onDelete={permission.delete && !item.inUsed ? (e) => e.preventDefault() || this.delete(item) : null}
                    >
                        <Tooltip title='Sao chép' arrow>
                            <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || permission.write ? this.props.history.push(`/user/sau-dai-hoc/cau-truc-khung-dao-tao/new?id=${item.id}`) : T.notify('Vui lòng liên hệ người quản lý đào tạo!', 'danger')}>
                                <i className='fa fa-lg fa-clone ' />
                            </a>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Cấu trúc khung chương trình đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                'Cấu trúc khung CTĐT'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getSdhCauTrucKhungDaoTaoPage} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/sau-dai-hoc/cau-truc-khung-dao-tao/new') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhCauTrucKhungDaoTao: state.sdh.sdhCauTrucKhungDaoTao });
const mapActionsToProps = { getSdhCauTrucKhungDaoTaoPage, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(SdhCauTrucKhungDaoTaoPage);