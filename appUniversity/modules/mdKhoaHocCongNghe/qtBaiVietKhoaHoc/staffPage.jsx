import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderDataTable, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtBaiVietKhoaHocUserPage,
} from './redux';

class QtBaiVietKhoaHocUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, xuatBanRange: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtBaiVietKhoaHocUserPage(pageN, pageS, pageC, this.state.filter, done);
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: true,
                delete: true
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.userPage ? this.props.qtBaiVietKhoaHoc.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderDataTable({
            data: list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tác giả</th>
                    <TableHead style={{ width: 'auto' }} content='Bài viết' keyCol='baiviet' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tạp chí</th>
                    <TableHead style={{ width: 'auto' }} content='Số hiệu ISSN' keyCol='issn' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Xuất bản</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={() => this.modal.show({ item, shcc })} content={(item.tenTacGia || '')} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(<b>{item.tenBaiViet}</b>)} />
                    <TableCell type='text' content={(<i>{item.tenTapChi}</i>)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soHieuIssn} />
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
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-file-text-o',
            title: 'Bài viết khoa học',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Bài viết khoa học'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBaiVietKhoaHoc: state.khcn.qtBaiVietKhoaHoc });
const mapActionsToProps = {
    getQtBaiVietKhoaHocUserPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtBaiVietKhoaHocUserPage);