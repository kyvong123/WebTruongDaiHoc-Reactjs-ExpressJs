import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableCell, TableHead, FormSelect, FormTabs } from 'view/component/AdminPage';
import AddModal from './addModal';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import Pagination from 'view/component/Pagination';
import { getPageDiemHoan, deleteDtDiemHoan } from './redux';
import ImportSection from './importSection';
import NhapDiemSection from './nhapDiemSection';
import DangKyThiSection from './dangKyThiSection';
import { Tooltip } from '@mui/material';

class dtDiemHoan extends AdminPage {

    defaultSortTerm = 'maHocPhan_ASC'
    state = { filter: {} }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namHoc.value(namHoc);
                this.hocKy.value(hocKy);
                this.setState({
                    filter: { ...this.state.filter, namHoc, hocKy }
                }, () => {
                    this.getPage(undefined, undefined, '',);
                });
            });
        });
    }

    delete = (item) => {
        T.confirm('Huỷ điểm hoãn cho sinh viên', 'Bạn có chắc chắn muốn hủy điểm hoãn cho sinh viên hay không?', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteDtDiemHoan(item, () => this.getPage(1, 50, ''));
            }
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.filter.sort || this.defaultSortTerm, ks_loaiDinhChi: 'Hoãn thi', isHoanThi: 1 };
        this.props.getPageDiemHoan(pageN, pageS, pageC, filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal, list, totalItem } = this.props.diemHoan && this.props.diemHoan.page
            ? this.props.diemHoan.page : { pageNumber: 1, pageSize: 50, pageCondition: '', pageTotal: 1, list: null, totalItem: 1 };

        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list,
            stickyHead: true,
            divStyle: { height: '65vh' },
            header: 'thead-light',
            renderHead: () => (<>
                <tr>
                    <TableHead content='#' />
                    <TableHead content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ whiteSpace: 'nowrap' }} content='Họ và tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ whiteSpace: 'nowrap' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap' }} content='Tên học phần' keyCol='tenHocPhan' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kỳ thi' keyCol='kyThi' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ghi chú' keyCol='ghiChu' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Tình trạng' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Học phần thi' keyCol='maHocPhanThi' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Lịch thi' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Điểm' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Người nhập điểm' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thời gian nhập điểm' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Người thao tác' keyCol='user' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thời gian' keyCol='time' />
                    {/* <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th> */}
                </tr>
            </>),
            renderRow: (item, index) => {
                let className = item.isThi ? 'fa fa-lg fa-check-circle text-success' : 'fa fa-lg fa-times-circle text-danger',
                    text = item.isThi ? 'Đã được xếp lịch thi' : 'Chưa được xếp lịch thi';
                return (<tr key={index}>
                    <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { 'vi': '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKyThi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }}
                        content={<Tooltip title={text}>
                            <i className={className} />
                        </Tooltip>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhanThi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.idExam ? <div>Ca {item.caThi} - Phòng {item.phong}<br />Giờ thi: {T.dateToText(item.batDauThi, 'dd/mm/yyyy HH:MM')} - {T.dateToText(item.ketThucThi, 'HH:MM')}</div> : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemDacBiet || item.diem} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.userNhapDiem} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.lastNhapDiem)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.userMod} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.timeMod)} />
                    {/* <TableCell type='buttons' style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item}>
                        <Tooltip title='Hủy' arrow>
                            <button className='btn btn-danger' onClick={e => e.preventDefault() || this.delete(item)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>
                    </TableCell> */}
                </tr>);
            }
        });

        return this.renderPage({
            icon: 'fa fa-stop',
            title: 'Quản lý điểm hoãn',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Quản lý điểm</Link>,
                'Điểm hoãn'
            ],
            content: <>
                <AddModal ref={e => this.modal = e} getPage={this.getPage} />
                <FormTabs tabs={[
                    {
                        title: 'Danh sách điểm hoãn', component: <div className='tile'>
                            <Pagination style={{ marginLeft: '10px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} pageRange={5} />
                            <div className='row'>
                                <FormSelect ref={e => this.namHoc = e} className='col-md-6' data={SelectAdapter_SchoolYear} label='Năm học'
                                    onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value.id } },
                                        () => this.getPage(undefined, undefined, '')
                                    )} />
                                <FormSelect ref={e => this.hocKy = e} className='col-md-6' data={SelectAdapter_DtDmHocKy} label='Học kỳ'
                                    onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value.id } },
                                        () => this.getPage(undefined, undefined, '')
                                    )} />
                            </div>
                            <div className='tile-body'>
                                {table}
                            </div>
                        </div>
                    },
                    { title: 'Import excel', component: <ImportSection getPage={this.getPage} /> },
                    { title: 'Hoàn trả điểm', component: <NhapDiemSection /> },
                    { title: 'Đăng ký thi', component: <DangKyThiSection /> },
                ]} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            buttons: { icon: 'fa-edit', tooltip: 'Cập nhật điểm hoãn', className: 'btn btn-primary', onClick: e => e && e.preventDefault() || this.modal.show() },
        });
    }
}

const mapStateToProps = state => ({ system: state.system, diemHoan: state.daoTao.diemHoan });
const mapActionsToProps = { getPageDiemHoan, getScheduleSettings, deleteDtDiemHoan };
export default connect(mapStateToProps, mapActionsToProps)(dtDiemHoan);