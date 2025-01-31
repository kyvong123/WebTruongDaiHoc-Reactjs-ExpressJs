import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
// import { Img } from 'view/component/HomePage';
import BhModal from './BhModal';
import { getPageSvBaoHiemYTe, deleteSvBaoHiemYTe, updateSvBaoHiemYTeAdmin, downloadWord, sendMailSvBaoHiemYTe } from './redux';
import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';

class BaoHiemAdminPage extends AdminPage {
    state = { searchTerm: '' };
    filter = { dienDong: 0, giaHan: 0, isKeKhai: null }
    subtabs = {}
    mounted = false;

    dienDongTabMaper = [0, 9, 12, 15]
    giaHanTabMapper = [1, 0]

    componentDidMount() {
        const permission = this.getUserPermission('bhyt');
        let route = T.routeMatcher('/user/bao-hiem-y-te/quan-ly/:maDot'),
            maDot = (route.parse(window.location.pathname) || {}).maDot;

        T.ready('/user/bao-hiem-y-te', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => {
                this.setState({ searchTerm: searchText });
                this.getPage(null, null, searchText || '');
            };
            T.showSearchBox();
            this.setState({ permission, maDot }, () => {
                this.mounted = true;
                this.getPage();
            });
        });
    }

    getPage = (pageNumber, pageSize, condition, done) => {
        const { maDot } = this.state;
        this.props.getPageSvBaoHiemYTe(pageNumber, pageSize, condition, { ...this.filter, maDot }, done);
    }

    onChangeTabDienDong = (tabIndex) => {
        const dienDong = this.dienDongTabMaper[tabIndex];
        if (dienDong == this.filter.dienDong) return;
        this.filter.dienDong = dienDong;
        if (this.subtabs[this.filter.dienDong]) { //Neu la dien 9, 12 hoac 15, set subtab
            const subTabIndex = this.subtabs[this.filter.dienDong].selectedTabIndex();
            this.filter.giaHan = this.giaHanTabMapper[subTabIndex];
        } else {
            this.filter.giaHan = 1;
        }
        this.mounted && this.getPage();
    }

    onChangeTabGiaHan = (tabIndex) => {
        const giahan = this.giaHanTabMapper[tabIndex];
        if (giahan == this.filter.giaHan) return;
        this.filter.giaHan = this.giaHanTabMapper[tabIndex];
        this.mounted && this.getPage();
    }

    tableDangKyMoi = (dienDong = 0) => {
        const { list = [], pageNumber, pageSize, pageTotal, totalItem } = this.props.svBaoHiemYTe && this.props.svBaoHiemYTe.page ? this.props.svBaoHiemYTe.page : {};
        return <>
            {renderTable({
                getDataSource: () => list,
                stickyHead: true,
                header: 'thead-light',
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Họ tên</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cá nhân</th>
                        <th style={{ minWidth: '300px', display: dienDong != 0 ? '' : 'none', whiteSpace: 'nowrap' }}>Đăng ký mới tại</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Thông tin chủ hộ</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Địa chỉ chủ hộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thanh toán</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell content={item.mssv} nowrap />
                        <TableCell type='link' content={`${item.ho?.toUpperCase() || ''} ${item.ten?.toUpperCase() || ''}`} nowrap onClick={() => this.infoBhytModal.show(item)} />
                        <TableCell type='text' content={item.tenTinhTrang} className={`${item.tinhTrang != 1 ? 'text-danger' : ''}`} />
                        <TableCell type='text' content={item.soDienThoaiCaNhan} />
                        <TableCell style={{ display: dienDong != 0 ? '' : 'none' }} content={item.tenBenhVien || 'Chưa kê khai'} className={`${item.tenBenhVien ? '' : 'text-danger'}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.hoTenChuHo ? <span><b>{item.hoTenChuHo.toUpperCase()}</b></span> : null}
                            <br />
                            {item.cccdChuHo ? <span><i><small>CCCD: {item.cccdChuHo}</small></i></span> : null}
                            <br />
                            {item.dienThoaiChuHo ? <span><i><small>SĐT: {item.dienThoaiChuHo}</small></i></span> : null}
                        </>} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <>
                                {item.soNhaChuHo || ''}
                                <br />
                                {item.xaChuHo || ''}
                                <br />
                                {item.huyenChuHo || ''}
                                <br />
                                {item.tinhChuHo || ''}
                            </>
                        } />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.daThanhToan ?
                            <p className='p-0 mb-0 text-success'>Đã thanh toán <i className='fa fa-check-circle' ></i></p> :
                            <p className='p-0 mb-0 text-danger'>Chưa thanh toán <i className='fa fa-clock-o'></i></p>
                        } />
                        <TableCell type='buttons' content={item} permission={this.state.permission} onDelete={this.delete}>
                            <Tooltip title='Tải tệp'><button className='btn btn-primary'
                                onClick={e => e.preventDefault() || this.props.downloadWord(item.id)}
                            ><i className='fa fa-file-word-o' /></button></Tooltip>
                        </TableCell>
                    </tr>
                ),
            })}
            <Pagination style={{ marginLeft: '65px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
        </>;
    }

    component9Thang = () => (
        <FormTabs
            ref={e => this.subtabs[9] = e}
            onChange={({ tabIndex }) => this.onChangeTabGiaHan(tabIndex)}
            tabs={[
                { id: 1, title: 'Gia hạn (đã có mã BHXH)', component: this.componentTableMienDong(9) },
                { id: 0, title: 'Đăng ký mới (chưa có mã BHXH)', component: this.tableDangKyMoi(9) },
            ]}
        />
    );

    component12Thang = () => (
        <FormTabs
            ref={e => this.subtabs[12] = e}
            onChange={({ tabIndex }) => this.onChangeTabGiaHan(tabIndex)}
            tabs={[
                { id: 1, title: 'Gia hạn (đã có mã BHXH)', component: this.componentTableMienDong(12) },
                { id: 0, title: 'Đăng ký mới (chưa có mã BHXH)', component: this.tableDangKyMoi(12) },
            ]}
        />
    );

    component15Thang = () => (
        <FormTabs
            ref={e => this.subtabs[15] = e}
            onChange={({ tabIndex }) => this.onChangeTabGiaHan(tabIndex)}
            tabs={[
                { id: 1, title: 'Gia hạn (đã có mã BHXH)', component: this.componentTableMienDong(15) },
                { id: 0, title: 'Đăng ký mới (chưa có mã BHXH)', component: this.tableDangKyMoi(15) },
            ]}
        />
    );

    componentTableMienDong = (dienDong = 0) => {
        let { list = [], pageNumber, pageSize, pageTotal, totalItem } = this.props.svBaoHiemYTe && this.props.svBaoHiemYTe.page ? this.props.svBaoHiemYTe.page : [];
        return <>
            {renderTable({
                getDataSource: () => list,
                header: 'thead-light',
                stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Họ tên</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cá nhân</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Thường trú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>BHXH hiện tại</th>
                        {dienDong != 0 && <>
                            <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>Cơ sở KCB</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thanh toán</th>
                        </>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell content={item.mssv} nowrap />
                        <TableCell type='link' content={`${item.ho?.toUpperCase() || ''} ${item.ten?.toUpperCase() || ''}`} nowrap onClick={() => this.infoBhytModal.show(item)} />
                        <TableCell type='text' content={item.tenTinhTrang} className={`${item.tinhTrang != 1 ? 'text-danger' : ''}`} />
                        <TableCell type='text' content={item.soDienThoaiCaNhan} />
                        <TableCell
                            content={
                                <>
                                    {item.soNhaThuongTru}
                                    <br />
                                    {item.xaThuongTru}
                                    <br />
                                    {item.huyenThuongTru}
                                    <br />
                                    {item.tinhThuongTru}
                                </>
                            }
                        />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maBhxhHienTai || 'Chưa kê khai'} className={`${item.maBhxhHienTai ? '' : 'text-danger'}`} />
                        {dienDong != 0 && <>
                            <TableCell content={item.tenBenhVien} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.daThanhToan ?
                                <p className='p-0 mb-0 text-success'>Đã thanh toán <i className='fa fa-check-circle' ></i></p> :
                                <p className='p-0 mb-0 text-danger'>Chưa thanh toán <i className='fa fa-clock-o'></i></p>
                            } />
                        </>}
                        <TableCell type='buttons' content={item} permission={this.state.permission} onDelete={this.delete} >
                            <Tooltip title='Tải tệp'><button className='btn btn-primary'
                                onClick={e => e.preventDefault() || this.props.downloadWord(item.id)}
                            ><i className='fa fa-file-word-o' /></button></Tooltip>
                        </TableCell>
                    </tr>
                ),
            })}
            <Pagination style={{ marginLeft: '65px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
        </>;
    };

    downloadExcel = () => {
        const maDot = this.state.maDot;
        T.customConfirm('Bạn có muốn đính kèm ảnh MẶT TRƯỚC BHYT', '', 'warning', false, {
            no: { text: 'Không', value: 1, className: 'bg-danger' },
            yes: { text: 'Có', value: 2, className: 'bg-success' },
        }, option => {
            option && T.handleDownload(`/api/bhyt/download?search=${this.state.searchTerm}&${maDot ? 'dotDangKy=' + maDot.toString() : ''}&${option == 2 ? 'img=1' : ''}`, 'ALL_COL_STUDENTS.xlsx');
        });
    }

    downloadTemplate = () => {
        const maDot = this.state.maDot;
        T.handleDownload(`/api/bhyt/dot-dang-ky/download?search=${this.state.searchTerm}&${maDot ? 'dotDangKy=' + maDot.toString() : ''}`, 'ALL_COL_STUDENTS.xlsx');
    }

    downloadHoGiaDinh = () => {
        const maDot = this.state.maDot;
        T.handleDownload(`/api/bhyt/ho-gia-dinh/download?search=${this.state.searchTerm}&${maDot ? 'dotDangKy=' + maDot.toString() : ''}`);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa bảo hiểm y tế', `Bạn có chắc bạn muốn xóa bảo hiểm y tế của ${item.ho?.toUpperCase() || ''} ${item.ten?.toUpperCase() || ''} ? `, 'warning', true, (isConfirmed) => {
            isConfirmed && this.props.deleteSvBaoHiemYTe(item.id, () => this.getPage());
        });
    };

    sendEmail = (e) => {
        e.preventDefault();
        const { maDot } = this.state;
        if (maDot) {
            T.confirm('Gửi email', 'Bạn có muốn gửi email nhắc nhở sinh viên chưa kê khai bảo hiểm y tế', isConfirm => {
                if (isConfirm) {
                    this.props.sendMailSvBaoHiemYTe(maDot, (data) => {
                        T.alert(`Đã gửi thông báo cho ${data.length} sinh viên nhắc nhở kê khai bảo hiểm y tế`, 'success', false, 2000);
                    });
                }
            });
        }
    }

    render() {
        let permission = this.getUserPermission('bhyt', ['read', 'write', 'delete', 'export']);
        return this.renderPage({
            title: 'Quản lý thông tin bảo hiểm y tế',
            subTitle: this.state.maDot ? <>
                <p className='mt-2 mb-0'><i><b>Mã đợt:</b> {this.state.maDot}</i></p>
            </> : null,
            breadcrumb: [
                <Link key={0} to='/user/bao-hiem-y-te'>Bảo hiểm y tế</Link>,
                'Quản lý thông tin bảo hiểm y tế'
            ],
            content: (
                <div className='tile'>
                    <div className='d-flex justify-content-between'>
                        <FormCheckbox ref={e => this.isKeKhai = e} label='Chưa kê khai' onChange={value => { this.filter.isKeKhai = value ? 0 : null; this.getPage(); }} />
                        <button className='btn btn-success' onClick={(e) => this.sendEmail(e)}>
                            Email nhắc nhở
                        </button>
                    </div>
                    <FormTabs
                        ref={e => this.tabs = e}
                        onChange={({ tabIndex }) => this.onChangeTabDienDong(tabIndex)}
                        tabs={[
                            { id: 0, title: 'Miễn đóng', component: this.componentTableMienDong(0) },
                            { id: 9, title: '9 tháng', component: this.component9Thang() },
                            { id: 12, title: '12 tháng', component: this.component12Thang() },
                            { id: 15, title: '15 tháng', component: this.component15Thang() },
                        ]}
                    />
                    <BhModal ref={e => this.infoBhytModal = e} update={this.props.updateSvBaoHiemYTeAdmin} getPage={this.getPage} />
                </div>
            ),
            backRoute: '/user/bao-hiem-y-te',
            collapse: [
                { icon: 'fa-print', name: 'Export', permission: permission.export, onClick: this.downloadExcel, type: 'success' },
                { icon: 'fa-file-excel-o', name: 'Export Template', permission: permission.export, onClick: this.downloadTemplate, type: 'info' },
                { icon: 'fa-file-excel-o', name: 'Xuất danh sách hộ gia đình', permission: permission.export, onClick: this.downloadHoGiaDinh, type: 'info' }
            ]
        });
    }
}
const mapStateToProps = (state) => ({ system: state.system, svBaoHiemYTe: state.ctsv.svBaoHiemYTe });
const mapActionsToProps = { getPageSvBaoHiemYTe, deleteSvBaoHiemYTe, updateSvBaoHiemYTeAdmin, downloadWord, sendMailSvBaoHiemYTe };
export default connect(mapStateToProps, mapActionsToProps)(BaoHiemAdminPage);
