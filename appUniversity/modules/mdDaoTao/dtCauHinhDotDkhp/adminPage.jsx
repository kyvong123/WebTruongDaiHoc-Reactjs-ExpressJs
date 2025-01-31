import React from 'react';
import AddModal from './addModal';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { getScheduleSettings } from '../dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { AdminPage, renderDataTable, TableCell, TableHead, FormSelect } from 'view/component/AdminPage';
import { getDtCauHinhDotDkhpPage, deleteDtCauHinhDotDkhp, updateDtCauHinhDotDkhp } from './redux';
import { ProcessModal } from './adjustPage';
class DtCauHinhDotDkhpPage extends AdminPage {
    state = { length: 0, dssv: [], sortTerm: 'ngayBatDau_DESC', items: [] }
    defaultSortTerm = 'ngayBatDau_DESC'

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.setState({ filter: { ...this.state.filter, namFilter: namHoc, hocKyFilter: hocKy } }, () => {
                    this.getPage(undefined, undefined, '');
                });
            });
            // T.socket.on('dkhp-init-ctdt', (data) => this.setState({ process: `${parseInt((data.count / data.sum) * 100)}%` }));
        });
    }

    componentWillUnmount() {
        // T.socket.off('dkhp-init-ctdt');
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtCauHinhDotDkhpPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.dotModal.show();
    }



    deleteDot = (e, item, done) => {
        e.preventDefault();
        T.confirm('Xóa đăng ký học phần', 'Bạn có chắc bạn muốn xóa đăng ký học phần này?', true, isConfirm =>
            isConfirm && this.props.deleteDtCauHinhDotDkhp(item.id));
        done && done();
    }

    checkTime = (item) => {
        const d = Date.now();
        const permission = this.getUserPermission('dtCauHinhDotDkhp', ['write', 'delete', 'manage']);
        if (item.ngayBatDau < d && d < item.ngayKetThuc) permission.delete = false;
        else if (item.ngayKetThuc < d) {
            permission.write = false;
            permission.delete = false;
        }
        return permission;
    }

    changeActive = (value, item) => {
        this.props.updateDtCauHinhDotDkhp(item.id, { active: !!value }, () => {
            value && this.processModal.hide();
            value && T.alert('Kích hoạt hệ thống ĐKHP thành công!', 'success', true);
            this.setState({ items: this.state.items.map(element => element.id == item.id ? { ...value, active: value } : { ...element }) });
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

    render() {
        const permission = this.getUserPermission('dtCauHinhDotDkhp', ['write', 'delete', 'manage']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtCauHinhDotDkhp?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderDataTable({
            emptyTable: 'Không tìm thấy đợt đăng ký học phần',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 9 ? true : false,
            divStyle: { height: '69vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên đợt' keyCol='tenDot' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDau' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThuc' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Năm học' keyCol='namHoc' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học kỳ' keyCol='hocKy' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='LHDT' keyCol='loaiHinhDaoTao' />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa' keyCol='khoa' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khóa sinh viên' keyCol='khoaSinhVien' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Activate' keyCol='activate' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                        <TableCell type='link' contentClassName='multiple-lines-2' content={item.tenDot} onClick={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/dao-tao/edu-schedule/cau-hinh-dkhp/edit/${item.id}` })} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.getFullDateTime(item.ngayBatDau)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.getFullDateTime(item.ngayKetThuc)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                        <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: 'auto' }} content={item.loaiHinhDaoTao} />
                        <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: 'auto' }} content={item.khoa?.split(', ').map(item => item.getFirstLetters()).join(', ')} />
                        <TableCell contentClassName='multiple-lines-2' contentStyle={{ width: 'auto' }} content={item.khoaSinhVien} />
                        <TableCell type='checkbox' content={item.active} permission={this.checkTime(item)} onChanged={value => {
                            value ? T.confirm('Xác nhận', 'Kích hoạt hệ thống ĐKHP theo đợt đăng ký này. Lưu ý, để đạt chất lượng tốt nhất, vui lòng kích hoạt trước 30 phút trước khi bắt đầu!', 'warning', true, isConfirm => {
                                if (isConfirm) {
                                    this.processModal.show();
                                    this.changeActive(value, item);
                                }
                            }) : this.changeActive(value, item);
                        }} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={this.checkTime(item)}
                            onEdit={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/dao-tao/edu-schedule/cau-hinh-dkhp/edit/${item.id}` })}
                            onDelete={this.deleteDot} >
                        </TableCell>
                    </tr >
                );
            }
        });
        return this.renderPage({
            icon: 'fa fa-cogs',
            title: 'Cấu hình đợt đăng ký học phần',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Cấu hình đợt đăng ký học phần'
            ],
            header: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} style={{ width: '150px', marginBottom: '0', marginRight: '10px' }} data={SelectAdapter_SchoolYear} placeholder='Năm học'
                    onChange={value => this.setState({ filter: { ...this.state.filter, namFilter: value.id } }, () => this.getPage())} />
                <FormSelect ref={e => this.hocKyFilter = e} style={{ width: '150px', marginBottom: '0', marginRight: '10px' }} data={SelectAdapter_DtDmHocKy} placeholder='Học kỳ'
                    onChange={value => this.setState({ filter: { ...this.state.filter, hocKyFilter: value?.id } }, () => this.getPage())} />
            </div>,
            content: (<>
                <div className='tile'>
                    <div>{table}</div>
                </div>

                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} title='Kích hoạt đợt đăng ký học phần' caption='Vui lòng đừng rời trang cho đến khi hoàn thành việc kích hoạt này!' />
                <AddModal ref={e => this.dotModal = e} history={this.props.history} />
            </>),
            backRoute: '/user/dao-tao/edu-schedule',
            onCreate: (e) => permission.write ? e.preventDefault() || this.dotModal.show(null) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtCauHinhDotDkhp: state.daoTao.dtCauHinhDotDkhp });
const mapActionsToProps = { getDtCauHinhDotDkhpPage, deleteDtCauHinhDotDkhp, updateDtCauHinhDotDkhp, getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(DtCauHinhDotDkhpPage);