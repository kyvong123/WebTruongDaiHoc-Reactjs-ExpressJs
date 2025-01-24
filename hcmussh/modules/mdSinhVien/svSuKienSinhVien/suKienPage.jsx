import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, renderTable, TableCell, FormEditor, AdminModal, FormTabs } from 'view/component/AdminPage';
import { getSuKienInfo, getPageSuKienNguoiThamDu, setSuKienNguoiThamDu, deleteSuKienNguoiThamDu, sinhVienDiemDanh } from './redux';
import { EaseDateRangePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Html5QrcodeScanner } from 'html5-qrcode';


class ScanModal extends AdminModal {
    onScanSuccess = (decodedText) => {
        let { id } = JSON.parse(decodedText);
        // const diemCong = this.state.diemCong;
        if (id != this.state.idSuKien) {
            return T.notify('Mã QR không phải của sự kiện này!', 'danger');
        } else {
            this.props.sinhVienDiemDanh(id, () => {
                this.setState({}, () => { this.hide(); });
            });
        }
    }

    onShow = (idSuKien = null, diemCong) => {
        let html5QrcodeScanner = new Html5QrcodeScanner(
            'reader',
            {
                fps: 10,
                qrbox: { width: 200, height: 200 },
            },
            false);
        this.setState({ html5QrcodeScanner, idSuKien, diemCong }, () => { html5QrcodeScanner.render(this.onScanSuccess, () => { }); });
    }

    renderScanner = () => {
        return <div className='tile'>
            <div id='reader'></div>
        </div>;
    }

    render = () => {
        return this.renderModal({
            title: 'Điểm danh',
            size: 'large',
            showCloseButton: false,
            body: <>

                <FormTabs
                    tabs={[
                        { title: 'Quét mã', component: this.renderScanner() },
                    ]}
                /> :
            </>,
            buttons:
                <button type='button' className='btn btn-secondary' onClick={e => e.preventDefault() || this.hide()}>
                    <i className='fa fa-fw fa-lg fa-times' />Đóng
                </button>
        });
    }
}

class SinhVienSuKienPage extends AdminPage {
    state = {
        id: '', tenSuKien: '', thoiGianBatDau: '', thoiGianKetThuc: '', soLuongThamGiaDuKien: '', diaDiem: '', moTa: '', kichHoat: '',
        isAddNguoiThamDuModal: false,
    };

    componentDidMount() {
        T.ready('/user', () => {
            let route = T.routeMatcher('/user/student/su-kien/:id'),
                id = route.parse(window.location.pathname).id;
            if (id !== 'new') {
                this.props.getSuKienInfo(id, (data) => {
                    if (data.error) {
                        T.notify('Lấy thông tin sự kiện bị lỗi!', 'danger');
                    } else {
                        this.setState({
                            id: id,
                            kichHoat: data.data.kichHoat
                        });
                        const { tenSuKien, thoiGianBatDau, thoiGianKetThuc, soLuongThamGiaDuKien, diaDiem, moTa } = data.data;
                        this.tenSuKien.value(tenSuKien ? tenSuKien : '');
                        this.timeRange.value(thoiGianBatDau, thoiGianKetThuc);
                        this.soLuongThamGiaDuKien.value(soLuongThamGiaDuKien ? soLuongThamGiaDuKien : '');
                        this.diaDiem.value(diaDiem ? diaDiem : '');
                        this.moTa.html(moTa ? moTa : '');
                    }
                });
                this.props.getPageSuKienNguoiThamDu(null, null, null, id, () => { });
            }
        });
    }

    handleDangKi = () => {
        T.confirm('Tham gia sự kiện', 'Xác nhận tham gia sự kiện này?',
            isConfirmed => isConfirmed && this.props.setSuKienNguoiThamDu(this.state.id)
        );
    }

    handleHuyDangKi = () => {
        T.confirm('Huỷ tham gia sự kiện', 'Xác nhận hủy tham gia sự kiện này?',
            isConfirmed => isConfirmed && this.props.deleteSuKienNguoiThamDu(this.state.id)
        );
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal } = this.props.svSuKien?.suKienNguoiThamDu || {},
            list = this.props.svSuKien?.suKienNguoiThamDu?.list || [];
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Thông Tin Sự Kiện',
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                <Link key={1} to='/user/student/su-kien'>Sự Kiện</Link>,
                'Thông Tin Sự Kiện'
            ],
            content:
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>Thông tin sự kiện</h3>
                        <div className='tile-body'>
                            <div className='row'>
                                <div className='form-group col-md-12'>
                                    <div className='row'>
                                        <FormTextBox ref={(e) => (this.tenSuKien = e)} label='Tên sự kiện' className='form-group col-md-6' readOnly required />
                                        <EaseDateRangePicker ref={e => this.timeRange = e} label='Thời gian diễn ra' withTime={true} format='HH:mm, DD/MM/YYYY' inputClassName='m-0 p-0 pl-2' className='col-md-6' middleWare={(start, end) => {
                                            start.setHours(0, 0, 0, 0);
                                            end.setHours(23, 59, 59, 999);
                                            return [start, end];
                                        }} required readOnly />
                                        <FormTextBox ref={(e) => (this.soLuongThamGiaDuKien = e)} label='Số lượng tham gia' className='form-group col-md-6' readOnly required />
                                        <FormTextBox ref={(e) => (this.diaDiem = e)} label='Địa điểm' className='form-group col-md-6' readOnly required />
                                        <FormEditor ref={(e) => (this.moTa = e)} className='col-md-12' label='Mô tả' placeholder='Mô tả' required height={200} readOnly /><br />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.state.id && <div className='tile'>
                        <div className='row' >
                            <div className='col-md-8'>
                                <h3 className='tile-title'>Danh sách người tham dự sự kiện </h3>
                            </div>
                            {(this.state.kichHoat == '1') && (
                                <div className='col-md-4' style={{ textAlign: 'right' }}>
                                    {this.props.svSuKien?.daThamDu ?
                                        <>
                                            <button style={{ marginRight: '10px' }} className='btn btn-success' type='button' title='Điểm danh' onClick={() => this.scanModal.show(this.state.id)}>
                                                <i className='fa fa-sm fa-qrcode' /> Điểm danh
                                            </button>
                                            <button className='btn btn-danger' onClick={this.handleHuyDangKi}>
                                                <i className='fa fa-sm fa-times' /> Hủy đăng kí
                                            </button>
                                        </>
                                        :
                                        <button className='btn btn-primary' onClick={this.handleDangKi}>
                                            <i className='fa fa-sm fa-plus' /> Đăng kí tham dự
                                        </button>

                                    }
                                </div>
                            )}

                            {/* <Pagination {...{ pageNumber, pageSize, pageCondition, pageTotal }} getPage={this.props.getPageSuKienNguoiThamDu} /> */}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <Pagination style={{ position: 'right', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageCondition, pageTotal }} getPage={(pageN, pageS, pageC, done) => this.props.getPageSuKienNguoiThamDu(pageN, pageS, pageC, this.state.id, done)} />
                        </div>
                        {renderTable({
                            getDataSource: () => list,
                            // getDataSource: () => participants,
                            renderHead: () => (<tr>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên</th>
                                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Email</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại tham dự</th>
                            </tr>),
                            renderRow: (item, index) =>
                            (<tr key={index}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiThamDu == 1 ? 'Sinh Viên' : 'Khách Mời'} />
                            </tr>)
                        })}
                        <ScanModal ref={e => this.scanModal = e} sinhVienDiemDanh={this.props.sinhVienDiemDanh} />
                    </div>
                    },
                </>,
            backRoute: '/user/student/su-kien',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, svSuKien: state.student.svSuKien });
const mapActionsToProps = {
    getSuKienInfo, getPageSuKienNguoiThamDu, setSuKienNguoiThamDu, deleteSuKienNguoiThamDu, sinhVienDiemDanh
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienSuKienPage);