import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, renderTable, TableCell, getValue, FormEditor, FormSelect, FormDatePicker, FormTabs } from 'view/component/AdminPage';
import { getSuKienInfo, getPageSuKienNguoiThamDu, createSuKien, updateDuyetSuKien, updateSuKien, getSuKienAllVersion } from './redux';
// import { EaseDateRangePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmTheTieuChi } from 'modules/mdCongTacSinhVien/dmTheTieuChi/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getScheduleSettings } from '../ctsvDtSetting/redux';
import LyDoTuChoiModal from './modal/lyDoTuChoiModal';

const JOIN_MAPPER = {
    1: <span className='text-success'><i className='fa fa-check' /> Đã tham dự</span>,
    0: <span className='text-info'><i className='fa fa-clock-o' /> Chưa tham dự</span>,
    [-1]: <span className='text-danger'><i className='fa fa-times' /> Vắng</span>,
};
class DuyetSuKienDetailPage extends AdminPage {
    state = {
        data: {},
        versionNumber: 1,
        historyList: [],
        isEditing: false,
    };

    componentDidMount() {
        T.ready('/user/ctsv/danh-sach-su-kien', () => {
            let route = T.routeMatcher('/user/ctsv/duyet-su-kien/edit/:id');
            let id;
            id = route.parse(window.location.pathname).id;
            this.props.getScheduleSettings(data => {
                this.setState({
                    currentSemester: data.currentSemester,
                    namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy,
                    namHoc: '',
                    hocKy: '',
                });
            });
            this.props.getSuKienInfo(id, (data) => {
                if (data.error) {
                    T.notify('Lấy thông tin sự kiện bị lỗi!', 'danger');
                } else {
                    this.setState({
                        id: id,
                        trangThai: data.data.trangThai,
                        versionNumber: Number(data.data.versionNumber),
                        data: data.data,
                    });
                    const { tenSuKien, thoiGianBatDau, thoiGianKetThuc, thoiGianBatDauDangKy, soLuongThamGiaDuKien, soLuongThamGiaToiDa, diaDiem, trangThai, lyDoTuChoi, moTa, maTieuChi, diemRenLuyenCong, namHoc, hocKy } = data.data;
                    this.tenSuKien.value(tenSuKien ? tenSuKien : '');
                    this.namHoc.value(namHoc ? namHoc : '');
                    this.hocKy.value(hocKy ? hocKy : '');
                    this.thoiGianBatDau.value(thoiGianBatDau ? thoiGianBatDau : '');
                    this.thoiGianKetThuc.value(thoiGianKetThuc ? thoiGianKetThuc : '');
                    this.thoiGianBatDauDangKy.value(thoiGianBatDauDangKy ? thoiGianBatDauDangKy : '');
                    this.soLuongThamGiaDuKien.value(soLuongThamGiaDuKien ? soLuongThamGiaDuKien : '');
                    this.soLuongThamGiaToiDa.value(soLuongThamGiaToiDa ? soLuongThamGiaToiDa : '');
                    this.diaDiem.value(diaDiem ? diaDiem : '');
                    this.trangThai.value(trangThai ? (trangThai == 'A' ? 'Đã Duyệt' : trangThai == 'R' ? 'Từ Chối' : 'Đã cập nhật') : 'Chờ duyệt');
                    this.lyDoTuChoi.value(lyDoTuChoi ? lyDoTuChoi : 'Không có');
                    this.moTa.html(moTa ? moTa : '');
                    this.maTieuChi.value(maTieuChi?.split(',') || '');
                    this.diemRenLuyenCong.value(diemRenLuyenCong ? diemRenLuyenCong : '');
                }
            });
            this.props.getPageSuKienNguoiThamDu(null, null, null, id);
            this.props.getSuKienAllVersion(id, (data) => {
                this.setState({
                    id: id,
                    historyList: data.data,
                });
            });

        });
    }

    handleDuyetSuKien = (id, versionNumber) => {
        const data = {
            trangThai: 'A',
            lyDoTuChoi: ''
        };
        T.confirm('Duyệt sự kiện', 'Bạn có chắc muốn duyệt sự kiện này?', isConfirmed => isConfirmed && this.props.updateDuyetSuKien(id, versionNumber, data, () => {
            this.setState({
                trangThai: 'A',
            });
            this.trangThai.value('Đã Duyệt');
            this.lyDoTuChoi.value('Không có');
        }));
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getPageSuKienNguoiThamDu(pageN, pageS, pageC, this.state.id, done);
    }
    renderSwitch(param) {
        switch (param) {
            case null:
                return JOIN_MAPPER[0];
            case '1':
                return JOIN_MAPPER[1];
            case '-1':
                return JOIN_MAPPER[-1];
            default:
                return 'Unknown State';
        }
    }

    handleEdit = (id) => {
        this.setState({
            id,
            isEditing: true,
        });
    };

    handleSave = async () => {
        let isDuyet = true;
        const data = {
            tenSuKien: this.tenSuKien.state.value,
            thoiGianBatDau: Number(getValue(this.thoiGianBatDau)),
            thoiGianKetThuc: Number(getValue(this.thoiGianKetThuc)),
            thoiGianBatDauDangKy: Number(getValue(this.thoiGianBatDauDangKy)),
            soLuongThamGiaDuKien: Number(getValue(this.soLuongThamGiaDuKien)),
            soLuongThamGiaToiDa: Number(getValue(this.soLuongThamGiaToiDa)) || Number(getValue(this.soLuongThamGiaDuKien)),
            diaDiem: this.diaDiem.state.value,
            moTa: this.moTa.html(),
            maTieuChi: getValue(this.maTieuChi) ? getValue(this.maTieuChi).toString() : '',
            namHoc: this.state.namHoc ? this.state.namHoc : this.state.namHocHienTai,
            hocKy: this.state.hocKy ? this.state.hocKy : this.state.hocKyHienTai,
            diemRenLuyenCong: this.diemRenLuyenCong.state.value,
        };

        if (!data.thoiGianBatDau || !data.thoiGianKetThuc) {
            return T.notify('Thời gian bắt đầu và kết thúc không được để trống!', 'danger');
        }
        if (data.thoiGianBatDau > data.thoiGianKetThuc) {
            return T.notify('Thời gian kết thúc phải sau thời gian bắt đầu!', 'danger');
        }
        if (data.thoiGianBatDauDangKy > data.thoiGianBatDau) {
            return T.notify('Thời gian bắt đầu đăng ký phải trước thời gian bắt đầu!', 'danger');
        }
        if (data.soLuongThamGiaDuKien > data.soLuongThamGiaToiDa) {
            return T.notify('Số lượng dự kiến không được vượt quá số lượng tối đa!', 'danger');
        }
        try {
            this.props.updateSuKien(this.state.id, data, isDuyet, (result) => {
                this.setState({
                    id: result.idSuKien,
                    trangThai: result.trangThai,
                    versionNumber: Number(result.versionNumber),
                    data: result,
                });
            });
        } catch (error) {
            console.error('Lỗi khi gọi updateSuKien:', error);
            T.notify('Có lỗi xảy ra khi chỉnh sửa sự kiện!', 'danger');
        }

        this.setState({
            isEditing: false,
        });
    };

    tuChoiSuKien = (idSuKien, versionNumber, changes, done) => {
        this.props.updateDuyetSuKien(idSuKien, versionNumber, changes, () => {
            this.setState({
                trangThai: 'R',
            });
            this.trangThai.value('Từ Chối');
            this.lyDoTuChoi.value(changes.lyDoTuChoi);
            done();
        });
    }

    componentSuKienInfo = () => {
        const buttonText = this.state.isEditing ? 'Lưu' : 'Chỉnh sửa';
        const readOnly = this.state.isEditing ? (this.props.readOnly) : true;
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin sự kiện</h3>
                <div className='tile-body'>
                    <div className='row'>
                        <div className='form-group col-md-12'>
                            <div className='row'>
                                <FormTextBox ref={(e) => (this.tenSuKien = e)} label='Tên sự kiện' className='form-group col-md-12' readOnly={readOnly} required />
                                <FormSelect className='form-group col-md-6' style={{ width: '120px' }} ref={e => this.namHoc = e} label='Năm học' data={SelectAdapter_SchoolYear} readOnly={readOnly} />
                                <FormSelect className='form-group col-md-6' style={{ width: '100px' }} ref={e => this.hocKy = e} label='Học Kỳ' data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} readOnly={readOnly} />
                                <FormDatePicker type='time' ref={e => this.thoiGianBatDau = e} className='col-md-6' label='Thời gian bắt đầu' readOnly={readOnly} required />
                                <FormDatePicker type='time' ref={e => this.thoiGianKetThuc = e} className='col-md-6' label='Thời gian kết thúc' readOnly={readOnly} required />
                                <FormDatePicker type='time' ref={e => this.thoiGianBatDauDangKy = e} className='col-md-6' label='Thời gian bắt đầu đăng ký' readOnly={readOnly} required />
                                <FormTextBox type='number' ref={(e) => (this.soLuongThamGiaDuKien = e)} allowNegative={false} label='Số lượng tham gia dự kiến' className='form-group col-md-6' readOnly={readOnly} required />
                                <FormTextBox type='number' ref={(e) => (this.soLuongThamGiaToiDa = e)} allowNegative={false} label='Số lượng tham gia tối đa' className='form-group col-md-6' readOnly={readOnly} />
                                <FormTextBox ref={(e) => (this.diaDiem = e)} label='Địa điểm' className='form-group col-md-6' readOnly={readOnly} required />
                                <FormSelect ref={(e) => (this.maTieuChi = e)} label='Tiêu chí đánh giá' className='form-group col-md-6' data={SelectAdapter_DmTheTieuChi} readOnly={readOnly} />
                                <FormTextBox type='number' ref={(e) => (this.diemRenLuyenCong = e)} allowNegative={false} label='Điểm cộng tối đa' className='form-group col-md-6' readOnly={readOnly} required />
                                <FormTextBox ref={(e) => (this.trangThai = e)} label='Trạng thái' className='form-group col-md-6' readOnly={true} />
                                <FormTextBox ref={(e) => (this.lyDoTuChoi = e)} label='Lý do từ chối' className='form-group col-md-6' readOnly={true} />
                                <FormEditor ref={(e) => (this.moTa = e)} className='col-md-12' label='Mô tả' placeholder='Mô tả' readOnly={readOnly} required height={200} /><br />
                                <div className='col-md-12' style={{ display: 'flex', justifyContent: 'end' }}>
                                    <button
                                        style={{ marginRight: '10px' }}
                                        className='btn btn-info'
                                        type='button'
                                        title={this.state.isEditing ? 'Lưu' : 'Chỉnh sửa'}
                                        onClick={this.state.isEditing ? this.handleSave : () => this.handleEdit(this.state.id)}
                                    >
                                        <i className='fa fa-fw fa-lg fa fa-pencil-square-o' /> {buttonText}
                                    </button>
                                    {this.state.trangThai !== 'A' && (
                                        <>
                                            <button style={{ marginRight: '10px' }} className='btn btn-success' type='button' title='Duyệt' onClick={() => this.handleDuyetSuKien(this.state.id, this.state.versionNumber)} >
                                                <i className='fa fa-fw fa-lg fa fa-check' /> Duyệt
                                            </button>
                                        </>
                                    )}
                                    {this.state.trangThai !== 'R' && (
                                        <>
                                            <button className='btn btn-danger' type='button' title='Từ Chối' onClick={() => this.lydotuchoiModal.show(this.state.data)}>
                                                <i className='fa fa-fw fa-lg fa fa-times' /> Từ chối
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <LyDoTuChoiModal ref={e => this.lydotuchoiModal = e}
                    update={this.tuChoiSuKien}
                // onHide={() => this.props.getPageSuKien()}
                // readOnly={!permission.write}
                />
            </div>
        );
    }

    componentHistory = () => {
        return <>
            <div className='tile'>
                <div className='tile-body'>
                    <h3>Lịch sử chỉnh sửa</h3>
                    {this.state.historyList.map((item, index) => (
                        <div key={index} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', marginLeft: '20px' }}>
                            <Link to={'/user/ctsv/su-kien/view/' + item.idSuKien + '/' + (item.versionNumber)}>
                                <span style={{ fontSize: '1.2em' }}>Phiên bản sự kiện ngày </span>
                                <span style={{ fontSize: '1.2em' }}>{T.dateToText(item.createTime, 'dd/mm/yyyy HH:MM')}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

        </>;
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal } = this.props.svSuKien?.suKienNguoiThamDu || {},
            list = this.props.svSuKien?.suKienNguoiThamDu?.list || [];
        // permission = this.getUserPermission('ctsvSuKien', ['read', 'write', 'delete', 'duyet']);
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Thông Tin Sự Kiện',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công Tác Sinh Viên</Link>,
                <Link key={1} to='/user/ctsv/danh-sach-su-kien'>Sự Kiện</Link>,
                'Thông Tin Sự Kiện'
            ],

            content:
                <>
                    <FormTabs tabs={[
                        { title: 'Thông tin sự kiên', component: this.componentSuKienInfo() },
                        { title: 'Lịch sử chỉnh sửa', component: this.componentHistory() }
                    ]} />

                    {this.state.id && <div className="tile">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }} >
                            <h3 className='tile-title'>Danh sách người tham dự sự kiện </h3>
                        </div >

                        {renderTable({
                            getDataSource: () => list,
                            renderHead: () => (<tr>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên</th>
                                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Email</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại tham dự</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                            </tr>),
                            renderRow: (item, index) =>
                            (<tr key={index}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiThamDu == 1 ? 'Sinh Viên' : 'Khách Mời'} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={this.renderSwitch(item.tinhTrang)} />
                            </tr>)
                        })}
                        <div style={{ marginBottom: '10px' }}>
                            <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageCondition, pageTotal }} getPage={this.getPage} />
                        </div>
                    </div>
                    },
                </>,
            backRoute: '/user/ctsv/duyet-su-kien',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, svSuKien: state.ctsv.svSuKien });
const mapActionsToProps = { getSuKienInfo, getPageSuKienNguoiThamDu, createSuKien, updateDuyetSuKien, updateSuKien, getScheduleSettings, getSuKienAllVersion };
export default connect(mapStateToProps, mapActionsToProps)(DuyetSuKienDetailPage);