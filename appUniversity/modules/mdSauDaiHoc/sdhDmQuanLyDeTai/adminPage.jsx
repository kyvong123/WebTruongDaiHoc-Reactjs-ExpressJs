import React from 'react';
import { connect } from 'react-redux';
import { getSdhQuanLyDeTaiPage, deleteSdhQuanLyDeTai } from './redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class sdhQuanLyDeTaiPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.props.getSdhQuanLyDeTaiPage(undefined, undefined, {
                searchTerm: searchText || '',
            });
            T.showSearchBox();
            this.props.getSdhQuanLyDeTaiPage(undefined, undefined, { searchTerm: '' });

        });
    }

    delete = (e, item) => {
        T.confirm('Xóa loại học viên', `Bạn có chắc muốn xóa đề tài ${item.tenDeTai ? `<b>${item.tenDeTai}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSdhQuanLyDeTai(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá đề tài ${item.tenDeTai} bị lỗi!`, 'danger');
                else T.alert('Xoá thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const permission = this.getUserPermission('sdhDmQuanLyDeTai', ['write', 'delete', 'manage', 'import']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhDmQuanLyDeTai && this.props.sdhDmQuanLyDeTai.page ? this.props.sdhDmQuanLyDeTai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: { searchTerm: '' }, list: [] };
        let table = 'Chưa có dữ liệu';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list,
                stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }}>Tên đề tài</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Học viên</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Giảng viên hướng dẫn</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='text' content={<a href={`/user/sau-dai-hoc/quan-ly-de-tai/item/${item.ma}`}>{item.tenDeTai}</a>} />
                        <TableCell type='text' content={<a href={`/user/sau-dai-hoc/sinh-vien/item/${item.mssv}`}>{item.hoSV + ' ' + item.tenSV}</a>} />
                        <TableCell type='text' content={
                            item.listShcc.map((element, i) =>
                                <div key={i}><a href={`/user/sau-dai-hoc/giang-vien-huong-dan/${element}`}>{item.listName[i]}</a ></div>
                            )
                        } />
                        <TableCell type='text' content={item.nam} />
                        <TableCell type='text' content={item.tenTinhTrang} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={`/user/sau-dai-hoc/quan-ly-de-tai/item/${item.ma}`} onDelete={this.delete} />
                    </tr>
                )
            });
        }



        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quản lý đề tài',
            breadcrumb: [
                <Link key={0} to={'/user/sau-dai-hoc'}>{'Sau đại học'}</Link>,
                'Đề tài'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getSdhQuanLyDeTaiPage} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            collapse:
                [
                    { icon: 'fa-upload', name: 'Import', permission: permission && permission.import, onClick: () => this.props.history.push('/user/sau-dai-hoc/quan-ly-de-tai/upload'), type: 'danger' },
                    { icon: 'fa-plus', name: 'Create', permission: permission && permission.write, onClick: () => this.props.history.push('/user/sau-dai-hoc/quan-ly-de-tai/item/new'), type: 'primary' }
                ]
        });
    }

}
const mapStateToProps = state => ({ system: state.system, sdhDmQuanLyDeTai: state.sdh.sdhDmQuanLyDeTai });
const mapActionsToProps = { getSdhQuanLyDeTaiPage, deleteSdhQuanLyDeTai };
export default connect(mapStateToProps, mapActionsToProps)(sdhQuanLyDeTaiPage);