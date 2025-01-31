import React from 'react';
import AddModal from './addModal';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
// import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
// import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { AdminPage, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { getSvDotDanhGiaDrlPage, createSvDotDanhGiaDrl, updateSvDotDanhGiaDrl, deleteSvDotDanhGiaDrl } from './redux';
import { ProcessModal } from './adjustPage';
class SvDotDanhGiaDrlPage extends AdminPage {
    state = { length: 0, dssv: [], sortTerm: 'timeModified_DESC' }
    defaultSortTerm = 'timeModified_DESC'

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(undefined, undefined, '');
            // T.socket.on('dkhp-init-ctdt', (data) => this.setState({ process: `${parseInt((data.count / data.sum) * 100)}%` }));
        });
    }

    componentWillUnmount() {
        // T.socket.off('dkhp-init-ctdt');
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSvDotDanhGiaDrlPage(pageN, pageS, pageC, filter, done);
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

    createDot = (item, done) => this.props.createSvDotDanhGiaDrl(item, (value) => {
        this.props.history.push({ pathname: `/user/ctsv/dot-danh-gia-drl/edit/${value.id}` });
        done && done();
    });

    deleteDot = (e, item, done) => {
        e.preventDefault();
        T.confirm('Xóa đợt đánh giá ', 'Bạn có chắc bạn muốn xóa đợt đánh giá điểm rèn luyện này?', true, isConfirm =>
            isConfirm && this.props.deleteSvDotDanhGiaDrl(item.id));
        done && done();
    }

    checkTime = (item) => {
        const d = Date.now();
        const permission = this.getUserPermission('ctsvDotDanhGiaDrl', ['write', 'delete', 'manage']);
        if (item.ngayBatDau < d && d < item.ngayKetThuc) permission.delete = false;
        else if (item.ngayKetThuc < d) {
            permission.write = false;
            permission.delete = false;
        }
        return permission;
    }

    changeActive = (value, item) => {
        this.props.updateSvDotDanhGiaDrl(item.id, { active: value ? 1 : 0 }, () => {
            value && T.alert('Kích hoạt đợt đánh giá điểm rèn luyện thành công!', 'success', true);
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
        const permission = this.getUserPermission('ctsvDotDanhGiaDrl', ['write', 'delete', 'manage']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.svDotDanhGiaDrl?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderDataTable({
            emptyTable: 'Không tìm thấy đợt đánh giá điểm rèn luyện',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 12 ? true : false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'left' }} content='Tên đợt' keyCol='tenDot' />
                    <TableHead style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'left' }} content='Giai đoạn cá nhân và lớp' keyCol='tenDot' />
                    <TableHead style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giai đoạn khoa' keyCol='tenDot' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Năm học' keyCol='namHoc' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học kỳ' keyCol='hocKy' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Loại hình đào tạo' keyCol='loaiHinhDaoTao' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khóa sinh viên' keyCol='khoaSinhVien' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Kích hoạt' keyCol='activate' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                const giaiDoanContent = (...giaiDoan) => <>
                    {giaiDoan.map(({ ten, thoiGian }, index) => <p key={index}><b>{ten}:</b> {this.getFullDateTime(thoiGian)}</p>)}
                </>;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.tenDot} onClick={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/ctsv/dot-danh-gia-drl/edit/${item.id}` })} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={giaiDoanContent(
                            { ten: 'Bắt đầu', thoiGian: item.timeStartSv },
                            { ten: 'Hạn chát cá nhân', thoiGian: item.timeEndSv },
                            { ten: 'Hạn chát lớp', thoiGian: item.timeEndLt })} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left', verticalAlign: 'top' }} content={giaiDoanContent(
                            { ten: 'Bắt đầu', thoiGian: item.timeStartFaculty },
                            { ten: 'Hạn chót', thoiGian: item.timeEndFaculty },
                        )} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.namHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.hocKy} />
                        <TableCell contentClassName='multiple-lines-3' content={item.loaiHinhDaoTao} />
                        <TableCell contentClassName='multiple-lines-2' content={item.khoaSinhVien} />
                        <TableCell type='checkbox' content={item.active} permission={this.checkTime(item)} onChanged={value => {
                            value ? T.confirm('Xác nhận', 'Kích hoạt đợt đánh giá điểm rèn luyện. Lưu ý, để đạt chất lượng tốt nhất, vui lòng kích hoạt trước 30 phút trước khi bắt đầu!', 'warning', true, isConfirm => {
                                if (isConfirm) {
                                    this.changeActive(value, item);
                                }
                            }) : this.changeActive(value, item);
                        }} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={this.checkTime(item)}
                            onEdit={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/ctsv/dot-danh-gia-drl/edit/${item.id}` })}
                            onDelete={this.deleteDot} >
                        </TableCell>
                    </tr >
                );
            }
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Cấu hình đợt đánh giá điểm rèn luyện',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                <Link key={1} to='/user/ctsv/diem-ren-luyen'>Điểm rèn luyện</Link>,
                'Cấu hình đợt đánh giá'
            ],
            content: (<>
                <div className='tile'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 className='tile-title'>Danh sách cấu hình đợt đánh giá</h4>
                            </div>
                        </div>
                    </div>
                    <div>{table}</div>
                </div>

                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />

                <AddModal ref={e => this.dotModal = e}
                    createDot={this.createDot}
                />
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} />
            </>),
            backRoute: '/user/ctsv/diem-ren-luyen',
            onCreate: (e) => permission.write ? e.preventDefault() || this.dotModal.show(null) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svDotDanhGiaDrl: state.ctsv.svDotDanhGiaDrl });
const mapActionsToProps = { getSvDotDanhGiaDrlPage, createSvDotDanhGiaDrl, updateSvDotDanhGiaDrl, deleteSvDotDanhGiaDrl };
export default connect(mapStateToProps, mapActionsToProps)(SvDotDanhGiaDrlPage);