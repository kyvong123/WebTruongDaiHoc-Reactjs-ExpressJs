import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, FormTextBox, getValue, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStudentsPage } from './redux';
import { Tooltip } from '@mui/material';
import { getScheduleSettings } from 'modules/mdSinhVien/svDtSetting/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { ProcessModal } from 'modules/mdDaoTao/dtCauHinhDotDkhp/adjustPage';
import { SelectAdapter_LopChuNhiemDanhSach } from '../tccbLopChuNhiem/redux';

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
    state = { filter: { listLop: null }, sortTerm: 'ten_ASC', isHetHan: true };
    componentDidMount() {
        T.ready('/user/lop-chu-nhiem/quan-ly-drl', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getStudentsPage(undefined, undefined, searchText || '');
            // let { pageNumber, pageSize, pageCondition } = this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
            this.props.getScheduleSettings(data => {
                let namHoc = T.storage('tccbChuNhiemDrl:namHoc')?.namHoc ?? data.currentSemester.namHoc,
                    hocKy = T.storage('tccbChuNhiemDrl:hocKy')?.hocKy ?? data.currentSemester.hocKy;
                T.storage('tccbChuNhiemDrl:namHoc', { namHoc });
                T.storage('tccbChuNhiemDrl:hocKy', { hocKy });
                this.setState({ filter: { ...this.state.filter, namHoc, hocKy } }, () => {
                    // this.getStudentsPage(pageNumber, pageSize, pageCondition, (data) => {
                    //     this.setThoiGianLt(data);
                    // });
                    this.namHoc.value(this.state.filter.namHoc);
                    this.hocKy.value(this.state.filter.hocKy);
                    this.lopChuNhiem.focus();
                });
            });
        });
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => {
        this.state.filter.listLop && this.props.getStudentsPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, done);
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getStudentsPage(pageNumber, pageSize, pageCondition);
        });
    }

    drlMapper(diem) {
        if (diem >= 90) {
            return <span className='font-weight-bold' style={{ color: '#019445' }}>Xuất sắc</span>;
        } else if (diem >= 80 && diem < 90) {
            return <span className='font-weight-bold' style={{ color: '#91cb63' }}>Tốt</span>;
        } else if (diem >= 65 && diem < 80) {
            return <span className='font-weight-bold' style={{ color: '#fdb041' }}>Khá</span>;
        } else if (diem >= 50 && diem < 65) {
            return <span className='font-weight-bold' style={{ color: '#f25b2a' }}>Trung bình</span>;
        } else {
            return diem != 0 ? <span className='font-weight-bold' style={{ color: '#e22024' }}>Yếu</span> : '';
        }
    }

    kyLuatMapper = (danhSachKyLuat, danhSachNgayXuLy, soKyLuat) => {
        if (soKyLuat == 0) return [];
        let danhSachKyLuats = danhSachKyLuat.split('??');
        let danhSachNgayXuLys = danhSachNgayXuLy.split('??');
        let results = [];
        for (let i = 0; i < soKyLuat; i++) {
            danhSachKyLuats[i] = danhSachKyLuats[i]?.trim();
            danhSachNgayXuLys[i] = danhSachNgayXuLys[i]?.trim();
        }
        for (let i = 0; i < soKyLuat; i++) {
            let s = danhSachKyLuats[i];
            results.push(<div key={results.length}> <span>
                {i + 1}. {s}
            </span></div>);
        }
        return results;
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sinhVien && this.props.sinhVien.page ?
            this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

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
                    <TableHead style={{ width: '10%' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '20%' }} content='Họ và tên lót' keyCol='ho' onKeySearch={this.handleKeySearch} />
                    {/* <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên lót</th> */}
                    <TableHead style={{ width: '10%' }} content='Tên' keyCol='ten' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Sinh viên</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng kết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xếp hạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={`/user/lop-chu-nhiem/danh-gia-drl/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemSv}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemLt}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<div className='position-relative'>
                        {<b>{(item.diemEditF && item.diemF != item.diemEditF) ? item.diemEditF : item.diemF}</b> || ''}
                        {item.lyDoEditF && <Tooltip className='ml-2 text-danger' title={item.lyDoEditF} arrow placeholder='right'><span style={{ position: 'absolute' }}><i className="pr-2 fa fa-info-circle"></i></span></Tooltip>}
                    </div>} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemTb}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.soKyLuat ? this.kyLuatMapper(item.danhSachKyLuat, item.danhSachNgayXuLy, item.soKyLuat) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <div className="position-relative">
                            <b>{item.diemTk || ''}</b>
                            {item.lyDoTk && <Tooltip className='ml-2 text-primary' title={item.lyDoTk} arrow placeholder='right'><span style={{ position: 'absolute' }}><i className="pr-2 fa fa-lg fa-info-circle"></i></span></Tooltip>}
                        </div>} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.drlMapper(Number(item.diemTk || 0))} />
                    <TableCell type='buttons' style={{}} content={item}>
                        <Tooltip title={'Chỉnh sửa'}>
                            <Link to={`/user/lop-chu-nhiem/danh-gia-drl/${item.mssv}`}>
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
            title: 'Quản lý điểm rèn luyện GVCN',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Quản lý điểm rèn luyện'
            ],
            header: <div style={{ display: 'flex' }}>
                <FormSelect className='mr-3' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} onChange={value => {
                    if (value) {
                        T.storage('tccbChuNhiemDrl:namHoc', { namHoc: value.id });
                        this.setState({ filter: { ...this.state.filter, namHoc: value.id } }, () => {
                            this.getStudentsPage(pageNumber, pageSize, pageCondition);
                        });
                    } else this.setState({ filter: { ...this.state.filter, namHoc: null } });
                }} />
                <FormSelect className='mr-3' ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={value => {
                    if (value) {
                        T.storage('tccbChuNhiemDrl:hocKy', { hocKy: value.id });
                        this.setState({ filter: { ...this.state.filter, hocKy: value.id } }, () => {
                            this.getStudentsPage(pageNumber, pageSize, pageCondition);
                        });
                    } else this.setState({ filter: { ...this.state.filter, hocKy: null } });
                }} />
                <FormSelect placeholder='Chọn lớp' minimumResultsForSearch={-1} ref={e => this.lopChuNhiem = e} data={SelectAdapter_LopChuNhiemDanhSach} onChange={value => {
                    if (value) {
                        this.setState({ filter: { ...this.state.filter, listLop: value.id.toString() } }, () => {
                            this.getStudentsPage(pageNumber, pageSize, pageCondition);
                        });
                    } else this.setState({ filter: { ...this.state.filter, listLop: null } });
                }} />,
            </div>,
            content: <>
                <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getStudentsPage} pageRange={3} />
                    </div>
                    {table}
                </div>
                {/* <AdminBhytModal ref={e => this.bhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} /> */}
                {/* <LoginToTestModal ref={e => this.loginModal = e} loginStudentForTest={this.props.loginStudentForTest} /> */}
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} />
            </>
            ,
            buttons: [
                {
                    icon: 'fa-file-excel-o', className: 'btn-success', tooltip: 'Tải xuống Excel', onClick: () => {
                        T.notify('Danh sách sẽ được tải xuống sau vài giây', 'info');
                        T.download(`/api/tccb/lop-chu-nhiem/quan-ly-drl/download-excel?filter=${JSON.stringify(this.state.filter)}`);
                    }
                },
            ],
            backRoute: '/user',
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sinhVien: state.tccb.tccbGvcnDanhGiaDrl });
const mapActionsToProps = {
    getStudentsPage, getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsPage);