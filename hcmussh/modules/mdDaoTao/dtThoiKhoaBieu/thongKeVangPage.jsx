import React from 'react';
import { connect } from 'react-redux';
import { DtTKBCustomThongKe } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, FormSelect, TableCell, renderDataTable, FormDatePicker, getValue, TableHead } from 'view/component/AdminPage';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';

class ThongKeVang extends AdminPage {
    state = { items: [], dataThongKe: [], isSearch: false }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });
    }

    getSchedule = (filter, done) => {
        this.props.DtTKBCustomThongKe({ ...filter }, result => {
            this.setState({ ...result, isSearch: true }, () => {
                done && done();
            });
        });
    }

    render() {
        let { isSearch, items, dataThongKe } = this.state;

        const componentTK = () => {
            return <div style={{ display: isSearch ? '' : 'none' }}>
                {renderDataTable({
                    data: dataThongKe,
                    stickyHead: dataThongKe.length > 10,
                    divStyle: { height: '55vh' },
                    renderHead: () => <tr>
                        <TableHead content='#' />
                        <TableHead content='Cơ cở' style={{ width: '50%' }} />
                        <TableHead content='Buổi' style={{ width: '50%' }} />
                        <TableHead content='Tổng số phòng học' style={{ minWidth: '30px' }} />
                        <TableHead content='Tổng số lớp học' style={{ minWidth: '30px' }} />
                        <TableHead content='Tổng số lớp vắng' style={{ minWidth: '30px' }} />
                    </tr>,
                    renderRow: (item, index) => {
                        return <tr key={index}>
                            <TableCell content={index + 1} />
                            <TableCell content={T.parse(item.tenCoSo, { vi: '' }).vi} />
                            <TableCell content={item.tenBuoi} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'normal' }} content={item.countPhong} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'normal' }} content={item.countLop} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'normal' }} content={item.countVang} />
                        </tr>;
                    }
                })}
            </div>;
        };

        const componentDS = () => {
            return <div style={{ display: isSearch ? '' : 'none' }}>
                {renderDataTable({
                    data: items,
                    stickyHead: dataThongKe.length > 10,
                    divStyle: { height: '55vh' },
                    renderHead: () => <tr>
                        <TableHead content='#' />
                        <TableHead content='Mã học phần' style={{ width: '10%' }} />
                        <TableHead content='Tên môn học' style={{ width: '20%' }} />
                        <TableHead content='Lớp' style={{ minWidth: '30px' }} />
                        <TableHead content='Ngày học' style={{ minWidth: '30px' }} />
                        <TableHead content='Thứ' style={{ minWidth: '30px' }} />
                        <TableHead content='Thời gian' style={{ minWidth: '30px' }} />
                        <TableHead content='Phòng' style={{ minWidth: '30px' }} />
                        <TableHead content='Cơ sở' style={{ minWidth: '30px' }} />
                        <TableHead content='Giảng viên' style={{ minWidth: '30px' }} />
                        <TableHead content='Ghi chú' style={{ width: '70%' }} />
                        <TableHead content='Loại' style={{ minWidth: '30px' }} />
                    </tr>,
                    renderRow: (item, index) => {
                        return <tr key={index}>
                            <TableCell content={index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                            <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.lop} />
                            <TableCell content={T.dateToText(item.ngayHoc, 'dd/mm/yyyy')} />
                            <TableCell content={item.thu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.tietBatDau} - ${(item.tietBatDau + item.soTietBuoi - 1)}`} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenCoSo, { vi: '' }).vi} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dataTenGiangVien && item.dataTenGiangVien.length ? item.dataTenGiangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.isVang ? 'Lớp báo vắng' : (item.isNghi ? 'Lớp nghỉ' : '')} />
                        </tr>;
                    }
                })}
            </div>;
        };

        return this.renderPage({
            icon: 'fa fa-bar-chart',
            title: 'Thống kê thời khóa biểu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao/thoi-khoa-bieu'>Thời khóa biểu</Link>,
                'Thống kê thời khóa biểu'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.maCoSo = e} label='Cơ sở' data={SelectAdapter_DmCoSo} />
                <FormDatePicker type='date' ref={e => this.fromTime = e} label='Từ thời điểm' className='col-md-4' required />
                <FormDatePicker type='date' ref={e => this.toTime = e} label='Đến thời điểm' className='col-md-4' required />
                <div className='col-md-12' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={() => {
                        if (!this.fromTime.value()) {
                            T.notify('Vui lòng nhập thời điểm bắt đầu!', 'danger');
                        } else if (!this.toTime.value()) {
                            T.notify('Vui lòng nhập thời điểm kết thúc!', 'danger');
                        } else {
                            let filter = {
                                coSo: getValue(this.maCoSo),
                                ngayBatDau: getValue(this.fromTime).setHours(0, 0, 0, 0),
                                ngayKetThuc: getValue(this.toTime).setHours(0, 0, 0, 0),
                            };
                            this.setState({ filter }, () => {
                                T.alert('Đang xử lý', 'warning', false, null, true);
                                this.getSchedule(filter, () => T.alert('Xử lý thành công', 'success', true, 5000));
                            });
                        }
                    }}>
                        <i className='fa fa-fw fa-lg fa-search' />Tìm kiếm
                    </button>
                </div>
            </div>,
            content: <div className='tile'>
                <FormTabs tabs={[
                    { title: 'Thống kê', component: componentTK() },
                    { title: 'Danh sách ngày nghỉ', component: componentDS() },
                ]} />
            </div>,
            backRoute: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-in',
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { DtTKBCustomThongKe };
export default connect(mapStateToProps, mapActionsToProps)(ThongKeVang);