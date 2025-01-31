import React from 'react';
import { connect } from 'react-redux';
import { getSdhDotDangKyPage, updateSdhDotDangKy, deleteSdhDotDangKy, createSdhDotDangKy, deleteSdhCauHinhDotDkhp } from './redux';
import { AdminPage, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import T from 'view/js/common';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import AddModal from './addModal';
class sdhDmDotDangKyPage extends AdminPage {

    state = { length: 0, dssv: [], sortTerm: 'ngayBatDau_DESC', items: [] }
    defaultSortTerm = 'ngayBatDau_DESC'

    componentDidMount() {
        this.getPage(undefined, undefined, '' || '');
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
        });
    }

    deleteDot = (e, item, done) => {
        e.preventDefault();
        T.confirm('Xóa đăng ký học phần', 'Bạn có chắc bạn muốn xóa đăng ký học phần này?', true, isConfirm =>
            isConfirm && this.props.deleteSdhCauHinhDotDkhp(item.id));
        done && done();
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDotDangKyPage(pageN, pageS, pageC, filter, done);
    }
    changeActive = (value, item) => {
        this.props.updateSdhDotDangKy(item.id, { kichHoat: !!value }, () => {
            value && T.alert('Kích hoạt hệ thống ĐKHP thành công!', 'success', true);
            this.setState({ items: this.state.items.map(element => element.id == item.id ? { ...value, kichHoat: value } : { ...element }) });
        });
    }

    getFullDateTime = (value) => {
        if (value == null) return;
        const d = new Date(value);
        const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
        const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
        const year = d.getFullYear();
        const hours = ('0' + d.getHours()).slice(-2);
        const minutes = ('0' + d.getMinutes()).slice(-2);
        const seconds = ('0' + d.getSeconds()).slice(-2);
        return `${date}/${month}/${year}  ${hours}:${minutes}:${seconds} `;
    }

    checkTime = (item) => {
        const d = Date.now();
        const permission = this.getUserPermission('sdhDmDotDangKy', ['write', 'delete', 'manage']);
        if (item.ngayBatDau < d && d < item.ngayKetThuc) permission.delete = false;
        else if (item.ngayKetThuc < d) {
            permission.write = false;
            permission.delete = false;
        }
        return permission;
    }

    handleChange = (e, item) => {
        e ? T.confirm('Xác nhận', 'Kích hoạt hệ thống ĐKHP theo đợt đăng ký này. Lưu ý, để đạt chất lượng tốt nhất, vui lòng kích hoạt trước 30 phút trước khi bắt đầu!', 'warning', true, isConfirm => {
            if (isConfirm) {
                // this.processModal.show();
                this.changeActive(e, item);
            }
        }) : this.changeActive(e, item);
    }

    render() {
        const permission = this.getUserPermission('sdhDmDotDangKy', ['manage', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhDmDotDangKy ? this.props.sdhDmDotDangKy.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        let table = 'Chưa có dữ liệu';
        if (list && list.length > 0) {
            table = renderDataTable({
                data: list,
                stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <TableHead style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên đợt' keyCol='tenDot' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDau' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThuc' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Năm học' keyCol='namHoc' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học kỳ' keyCol='hocKy' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='LHDT' keyCol='loaiHinhDaoTao' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa' keyCol='khoa' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khóa sinh viên' keyCol='khoaSinhVien' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Activate' keyCol='activate' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' />
                    </tr>),
                renderRow: (item, index) => {
                    let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                    return (
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                            <TableCell type='link' contentClassName='multiple-lines-2' content={item.tenDot} onClick={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/sau-dai-hoc/cau-hinh-dot-dkhp/edit/${item.id}` })} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.getFullDateTime(item.ngayBatDau)} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.getFullDateTime(item.ngayKetThuc)} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                            <TableCell contentClassName='multiple-lines-3' content={item.loaiHinhDaoTao} />
                            <TableCell contentClassName='multiple-lines-3' content={item.khoa} />
                            <TableCell contentClassName='multiple-lines-2' content={item.khoaSinhVien} />
                            <TableCell type='checkbox' content={item.kichHoat} permission={this.checkTime(item)} onChanged={value => {
                                value ? T.confirm('Xác nhận', 'Kích hoạt hệ thống ĐKHP theo đợt đăng ký này. Lưu ý, để đạt chất lượng tốt nhất, vui lòng kích hoạt trước 30 phút trước khi bắt đầu!', 'warning', true, isConfirm => {
                                    if (isConfirm) {
                                        this.changeActive(value, item);
                                    }
                                }) : this.changeActive(value, item);
                            }} />
                            <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={this.checkTime(item)}
                                onEdit={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/sau-dai-hoc/cau-hinh-dot-dkhp/edit/${item.id}` })}
                                onDelete={this.deleteDot} >
                            </TableCell>
                        </tr >
                    );
                }
            });
        }



        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Đợt đăng ký',
            breadcrumb: [
                <Link key={0} to={'/user/sau-dai-hoc'}>{'Sau đại học'}</Link>,
                'Đợt đăng ký'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} />
                <AddModal ref={e => this.modal = e} update={this.props.updateSdhDotDangKy} create={this.props.createSdhDotDangKy} permission={permission.write} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            onCreate: permission && permission.write ? () => this.modal.show() : null
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sdhDmDotDangKy: state.sdh.sdhDmDotDangKy });
const mapActionsToProps = { getSdhDotDangKyPage, updateSdhDotDangKy, deleteSdhDotDangKy, createSdhDotDangKy, deleteSdhCauHinhDotDkhp };
export default connect(mapStateToProps, mapActionsToProps)(sdhDmDotDangKyPage);