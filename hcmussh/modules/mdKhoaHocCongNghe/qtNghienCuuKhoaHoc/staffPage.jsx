import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderDataTable, TableHead } from 'view/component/AdminPage';
import {
    getQtNckhUserPage
} from './redux';

import Pagination from 'view/component/Pagination';
import T from 'view/js/common';

class QtNghienCuuKhoaHocStaffUserPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { maSoCanBo: shcc, maDonVi: '', fromYear: null, toYear: null, timeType: 0, loaiHocVi: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNckhUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.pageUser ? this.props.qtNghienCuuKhoaHoc.pageUser : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = renderDataTable({
            data: list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '50%' }} content='Đề tài nghiên cứu khoa học' keyCol='detai' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '50%' }} content='Mã số và cấp quản lý' keyCol='maso' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thực hiện</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kinh phí <br /><small>(triệu đồng)</small></th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Vai trò</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Nghiệm thu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kết quả</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={<>
                        <div><br />{item.tenDeTai || ''}</div> <br />
                    </>
                    } />
                    <TableCell type='text' content={item.maSoCapQuanLy || ''} />
                    <TableCell type='text' content={(
                        <>
                            {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            {item.ketThuc && item.ketThuc == -1 ? <span style={{ whiteSpace: 'nowrap', color: 'red' }}>Đang diễn ra<br /></span> : null}
                        </>
                    )}
                    />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.kinhPhi || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.vaiTro == 'CN' ? 'Chủ nhiệm' : 'Tham gia'} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        item.ngayNghiemThu ?
                            <span style={{ color: 'red' }}>{item.ngayNghiemThu == -1 ? 'Chưa nghiệm thu' : T.dateToText(item.ngayNghiemThu, item.ngayNghiemThuType ? item.ngayNghiemThuType : 'dd/mm/yyyy')}</span>
                            : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ketQua} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-wpexplorer',
            title: 'Thông tin nghiên cứu khoa học',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Nghiên cứu khoa học'
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

const mapStateToProps = state => ({ system: state.system, qtNghienCuuKhoaHoc: state.khcn.qtNghienCuuKhoaHoc });
const mapActionsToProps = {
    getQtNckhUserPage

};
export default connect(mapStateToProps, mapActionsToProps)(QtNghienCuuKhoaHocStaffUserPage);