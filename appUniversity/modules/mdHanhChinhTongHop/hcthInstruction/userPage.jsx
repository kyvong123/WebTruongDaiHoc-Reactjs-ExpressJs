import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

import { getInstructionPage, deleteInstruction } from './redux';
import { Link } from 'react-router-dom';


class userPage extends AdminPage {
    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            this.props.getInstructionPage(1, 50);
        });
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth')) {
            return {
                readyUrl: '/user/hcth',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    'Danh sách hướng dẫn sử dụng',
                ],
                backRoute: '/user/hcth',
                baseUrl: '/user/hcth/instruction',
            };
        } else {
            return {
                readyUrl: '/user',
                breadcrumb: [
                    <Link key={0} to='/user/'>...</Link>,
                    <Link key={1} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                    'Danh sách hướng dẫn sử dụng',
                ],
                backRoute: '/user/van-phong-dien-tu',
                baseUrl: '/user/instruction',
            };
        }
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá hướng dẫn sử dụng', 'Bạn có chắc muốn xoá hướng dẫn sử dụng này?', true, isConfirm => isConfirm && this.props.deleteInstruction(item.id));
    }

    render() {
        const { pageNumber, pageSize, list } = this.props.hcthInstruction && this.props.hcthInstruction.page ? this.props.hcthInstruction.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            permission = this.getUserPermission('developer', ['login']),
            { baseUrl, breadcrumb, backRoute } = this.getSiteSetting();

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
                        <TableCell type='link' contentStyle={{ width: '100%', minWidth: '300px' }} content={item.tieuDe || 'Chưa có tiêu đề'} url={`${baseUrl}/${item.id}`} />
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
            onCreate: permission && permission.login ? () => this.props.history.push(`${baseUrl}/new`) : null,
            backRoute,
            breadcrumb
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthInstruction: state.hcth.hcthInstruction });
const mapActionsToProps = { getInstructionPage, deleteInstruction };
export default connect(mapStateToProps, mapActionsToProps)(userPage);
