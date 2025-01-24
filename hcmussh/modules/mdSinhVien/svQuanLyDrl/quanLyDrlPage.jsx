import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, FormTabs, FormTextBox, getValue, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStudentsPage, saoChepDiemSinhVien } from './redux';
import { Tooltip } from '@mui/material';
import { getScheduleSettings } from 'modules/mdSinhVien/svDtSetting/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { ProcessModal } from 'modules/mdDaoTao/dtCauHinhDotDkhp/adjustPage';

export class LoginToTestModal extends AdminModal {

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            email: getValue(this.email),
            pass: getValue(this.password)
        };
        this.props.loginStudentForTest(data);
    }
    render = () => {
        return this.renderModal({
            title: 'Đăng nhập tài khoản Test',
            body: <div className='row'>
                <FormTextBox type='email' ref={e => this.email = e} label='Email test' className='col-md-12' />
                <FormTextBox type='password' ref={e => this.password = e} label='Mật khẩu' className='col-md-12' />
            </div>
        });
    }
}
class AdminStudentsPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC', isHetHan: true };
    tabFilter = [{ isSvSubmited: undefined }, { isSvSubmited: 1 }]
    componentDidMount() {
        T.ready('/user', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getStudentsPage(undefined, undefined, searchText || '');
            // let { pageNumber, pageSize, pageCondition } = this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };

            let params = new URLSearchParams(window.location.search);
            let paramNamHoc = params.get('namHoc');
            let paramHocKy = params.get('hocKy');
            let tabIndex = params.get('tab');
            this.props.getScheduleSettings(data => {
                let namHoc = paramNamHoc ?? T.storage('ltDrl:namHoc')?.namHoc ?? data.currentSemester.namHoc,
                    hocKy = paramHocKy ?? T.storage('ltDrl:hocKy')?.hocKy ?? data.currentSemester.hocKy;
                T.storage('ltDrl:namHoc', { namHoc });
                T.storage('ltDrl:hocKy', { hocKy });
                this.setState({ filter: { ...this.state.filter, namHoc, hocKy } }, () => {
                    // this.getStudentsPage(pageNumber, pageSize, pageCondition);
                    this.tabs.tabClick(null, tabIndex ?? 0);
                    this.namHoc.value(namHoc);
                    this.hocKy.value(hocKy);
                });
            });
        });
    }

    saoChepDiemSinhVien = () => {
        const { namHoc, hocKy } = this.state.filter;
        T.confirm('Sao chép thông tin', 'Bạn có chắc muốn sao chép thông tin từ sinh viên qua không ?', 'warning', true, (isConfirm) => {
            if (isConfirm) {
                this.setState({ process: true });
                this.processModal.show();
                this.props.saoChepDiemSinhVien(namHoc, hocKy, () => {
                    this.setState({ process: false });
                    setTimeout(() => this.processModal.hide(), 1000);
                });
            }
        });
    }

    setThoiGianLt = (data) => {
        const { thongTinDot, canDefault } = data,
            now = new Date(),
            { timeStartLt, timeEndLt } = thongTinDot ? thongTinDot : {};
        if (timeStartLt && timeEndLt && (new Date(timeStartLt) <= now && now <= new Date(timeEndLt))) {
            this.setState({ isHetHan: false, });
        }
        this.setState({ canDefault });
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getStudentsPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, (data) => {
            this.setThoiGianLt(data);
            done && done();
        });
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getStudentsPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sinhVien && this.props.sinhVien.page ?
            this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '10%' }} content='MSSV' keyCol='mssv' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '20%' }} content='Họ và tên lót' keyCol='ho' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '10%' }} content='Tên' keyCol='ten' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Sinh viên</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp trưởng</th>
                    <th style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa / BM</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={`/user/lop-truong/danh-gia-drl/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemSv}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemLt}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemF}</b> || ''} />
                    <TableCell type='buttons' style={{}} content={item}>
                        <Tooltip title={'Chỉnh sửa'}>
                            <Link to={`/user/lop-truong/danh-gia-drl/${item.mssv}`}>
                                <button className='btn btn-primary' type='button'>
                                    <i className='fa fa-lg fa-pencil' />
                                </button>
                            </Link>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            title: 'Quản lý điểm rèn luyện',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Quản lý điểm rèn luyện'
            ],
            header: <div style={{ display: 'flex' }}>
                <FormSelect className='mr-3' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} onChange={value => {
                    if (value) {
                        T.storage('ltDrl:namHoc', { namHoc: value.id });
                        this.setState({ filter: { ...this.state.filter, namHoc: value.id } }, () => {
                            this.getStudentsPage(pageNumber, pageSize, pageCondition);
                        });
                    } else this.setState({ filter: { ...this.state.filter, namHoc: null } });
                }} />
                <FormSelect ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={value => {
                    if (value) {
                        T.storage('ltDrl:hocKy', { hocKy: value.id });
                        this.setState({ filter: { ...this.state.filter, hocKy: value.id } }, () => {
                            this.getStudentsPage(pageNumber, pageSize, pageCondition);
                        });
                    } else this.setState({ filter: { ...this.state.filter, hocKy: null } });
                }} />
            </div>,
            content: <>
                <FormTabs
                    id='sv-quan-ly-drl-tab'
                    changeOnLoad={false}
                    ref={e => this.tabs = e}
                    onChange={({ tabIndex }) => {
                        let tabFilter = this.tabFilter[tabIndex];
                        this.setState({ filter: { ...this.state.filter, ...tabFilter } }, () => this.getStudentsPage());
                    }}
                    tabs={[
                        { title: 'Tất cả' },
                        { title: 'Đẫ nộp điểm' }
                    ]}
                />
                <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getStudentsPage} pageRange={3} />
                        {this.state.canDefault && <button className='btn btn-primary' type='button' onClick={() => this.saoChepDiemSinhVien()}>
                            Điểm mặc định
                        </button>}
                    </div>
                    {table}
                </div>
                {/* <AdminBhytModal ref={e => this.bhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} /> */}
                {/* <LoginToTestModal ref={e => this.loginModal = e} loginStudentForTest={this.props.loginStudentForTest} /> */}
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} />
            </>
            ,
            backRoute: '/user',
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sinhVien: state.student.ltDanhGiaDrl });
const mapActionsToProps = {
    getStudentsPage, getScheduleSettings, saoChepDiemSinhVien
};
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsPage);