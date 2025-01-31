import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { getInstructionPage } from './redux';


class userPage extends AdminPage {
    state = { page: {} }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getInstructionPage(1, 50, page => this.setState({ page }));
        });
    }

    render() {
        const { pageNumber, pageSize, list } = this.state.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            permission = this.getUserPermission('developer', ['login']);

        const table = renderTable({
            emptyTable: 'Chưa có dữ liệu hướng dẫn sử dụng',
            getDataSource: () => list,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }} >#</th>
                    <th style={{ width: '100%' }} >Tiêu đề</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' contentStyle={{ width: '100%', minWidth: '300px' }} content={item.tieuDe || 'Chưa có tiêu đề'} url={`/user/dao-tao/instruction/${item.id}`} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} onDelete={(e) => this.onDelete(e, item)} permission={{ delete: permission.login }} />
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Hướng dẫn sử dụng',
            content: <>
                <div className='tile'>
                    {table}
                </div>
            </>,
            onCreate: permission && permission.login ? () => this.props.history.push('/user/dao-tao/instruction/new') : null,
            breadcrumb: ['Danh sách hướng dẫn sử dụng'],
            backRoute: '/user/dao-tao',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getInstructionPage };
export default connect(mapStateToProps, mapActionsToProps)(userPage);
