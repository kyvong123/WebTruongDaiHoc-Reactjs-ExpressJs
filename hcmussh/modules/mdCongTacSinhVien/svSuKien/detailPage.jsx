import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, renderTable, TableHead, TableCell, AdminModal, getValue, FormSelect, FormEditor, FormDatePicker, FormTabs } from 'view/component/AdminPage';
import {
    getSuKienInfo, getPageSuKienNguoiThamDu, createSuKien, updateSuKien, createNguoiThamDu, updateNguoiThamDu, deleteNguoiThamDu,
    downloadDanhSachNguoiThamDu, suKienDiemDanh, getSuKienQr, updateQrCodeTime, getSuKienAllVersion
} from './redux';
import Pagination from 'view/component/Pagination';
import FileBox from 'view/component/FileBox';
import { SelectAdapter_FwStudentsSuKien } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmTheTieuChi } from 'modules/mdCongTacSinhVien/dmTheTieuChi/redux';
import { getScheduleSettings } from '../ctsvDtSetting/redux';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';

class QrCodeModal extends AdminModal {
    onShow = (item) => {
        const { idSuKien, tenSuKien, thoiGianBatDau, thoiGianKetThuc, diaDiem, versionNumber } = item || {};
        this.props.getSuKienQr(idSuKien, (data) => this.setState({ idSuKien, tenSuKien, thoiGianBatDau, thoiGianKetThuc, diaDiem, versionNumber, qrTimeGenerate: data.qrTimeGenerate, qrValidTime: data.qrValidTime }, () => {
            this.qrCode();
            this.setData();
        }));
    }

    setData = () => {
        const { tenSuKien, thoiGianBatDau, thoiGianKetThuc, diaDiem, qrValidTime } = this.state;
        this.tenSuKien?.value(tenSuKien);
        this.thoiGianBatDau?.value(thoiGianBatDau ? thoiGianBatDau : ''),
            this.thoiGianKetThuc?.value(thoiGianKetThuc ? thoiGianKetThuc : ''),
            this.diaDiem?.value(diaDiem);
        this.qrValidTime?.value(qrValidTime ? qrValidTime : new Date().getTime() + 5 * 60 * 1000);
    }

    qrCode = () => {
        if (!this.state.qrTimeGenerate) return;
        const qrcode = require('qrcode');
        let opts = {
            errorCorrectionLevel: 'H',
            type: 'image/jpeg',
            quality: 1,
            margin: 1,
            scale: 10
        };

        qrcode.toDataURL(JSON.stringify({ id: this.state.idSuKien }), opts, function (err, url) {
            if (err) throw err;
            document.getElementById('qrImg').src = url;
        });
    }

    removeQrCode = () => {
        const { idSuKien, versionNumber } = this.state;
        const changes = {
            qrTimeGenerate: null,
            qrValidTime: null
        };
        this.props.updateQrCodeTime(idSuKien, versionNumber, changes, () => { this.setState({ qrTimeGenerate: changes.qrTimeGenerate }, this.setData); });
    }

    generateQrCode = () => {
        const { idSuKien, versionNumber } = this.state;
        const changes = {
            qrTimeGenerate: new Date().getTime(),
            qrValidTime: this.qrValidTime.value().getTime()
        };
        this.props.updateQrCodeTime(idSuKien, versionNumber, changes, () => { this.setState({ qrTimeGenerate: changes.qrTimeGenerate, qrValidTime: changes.qrValidTime }, this.qrCode); });
    }

    render = () => {
        const { qrTimeGenerate = null } = this.state;
        return this.renderModal({
            title: qrTimeGenerate ? 'Tạo mã QR' : 'Mã QR',
            showCloseButton: false,
            body:
                qrTimeGenerate ? <>
                    <FormDatePicker ref={e => this.qrValidTime = e} label='Thời điểm mã hết hạn:' type='time-mask' value={this.state.qrValidTime} readOnly />
                    <img id='qrImg'></img>
                </> :
                    <>
                        <FormTextBox ref={e => this.tenSuKien = e} label='Tên sự kiện' readOnly />
                        <FormDatePicker type='time' ref={e => this.thoiGianBatDau = e} label='Thời gian bắt đầu' readOnly />
                        <FormDatePicker type='time' ref={e => this.thoiGianKetThuc = e} label='Thời gian kết thúc' readOnly />
                        <FormTextBox ref={e => this.diaDiem = e} label='Địa điểm' readOnly />
                        <FormDatePicker ref={e => this.qrValidTime = e} label='Thời điểm mã hết hạn:' type='time-mask' />
                    </>,
            buttons:
                qrTimeGenerate ?
                    <>
                        <button type='button' className='btn btn-secondary' onClick={e => e.preventDefault() || this.hide()}>
                            <i className='fa fa-fw fa-lg fa-times' />Đóng
                        </button>
                        <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.removeQrCode()}>
                            <i className='fa fa-fw fa-lg fa-times' />Xóa mã
                        </button>
                    </> :
                    <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.generateQrCode()}>
                        <i className='fa fa-fw fa-lg fa-plus-square' />Tạo mã
                    </button>
        });
    }
}
class ScanModal extends AdminModal {
    onScanSuccess = (decodedText) => {
        //CTSV quét mã của sinh viên:
        let { mssv } = JSON.parse(decodedText);
        this.props.suKienDiemDanh({
            mssv,
            idSuKien: this.state.idSuKien,
            tinhTrang: 1,
            diemCong: this.state.diemCong,
        }, () => {
            this.setState({}, () => { this.hide(); });
        });
    }

    onShow = (idSuKien = null, diemCong) => {
        let html5QrcodeScanner = new Html5QrcodeScanner(
            'reader',
            {
                fps: 10,
                qrbox: { width: 200, height: 200 },
                // supportedScanTypes: [ Html5QrcodeScanType.SCAN_TYPE_CAMERA ],
            },
            false);
        this.setState({ html5QrcodeScanner, idSuKien, diemCong }, () => { html5QrcodeScanner.render(this.onScanSuccess, () => { }); });
    }

    setSvDiemDanh = () => {
        const mssv = this.mssv.value();
        this.props.suKienDiemDanh({
            mssv,
            idSuKien: this.state.idSuKien,
            tinhTrang: 1,
            diemCong: this.state.diemCong,
        }, () => {
            this.setState({});
        });
    }


    renderScanner = () => {
        return <div className='tile'>
            <div id='reader'></div>
        </div>;
    }

    renderInput = () => {
        return <div className='tile'>
            <FormSelect ref={e => this.mssv = e}
                data={SelectAdapter_FwStudent}
                label='Mã số sinh viên'
            />
            <div style={{ textAlign: 'right' }}>
                <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.setSvDiemDanh()}>
                    Xác nhận
                </button>
            </div>
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
                        { title: 'Nhập MSSV', component: this.renderInput() },
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

export class ImportModal extends AdminModal {
    state = { result: null }

    onShow = (idSuKien) => {
        this.setState({ result: null });
        this.fileBox.setData('ctsvUploadDanhSachNguoiThamDu:' + idSuKien);
    }

    onSuccess = (res) => {
        this.setState({ result: res }, this.props.getPage);
    }

    render = () => {
        return this.renderModal({
            title: 'Tải lên danh sách người tham dự',
            size: 'large',
            body: <div className='row'>
                {this.state.result == null ? <>
                    <div className='col-md-12'><p className='pt-3'>Tải lên danh sách người tham dự bằng tệp Excel(.xlsx).Tải tệp tin mẫu tại <a href='' onClick={e => e.preventDefault() || T.download('/api/ctsv/su-kien-nguoi-tham-du/import/template')}>đây</a>
                    </p> <p className='text-danger mb-3' >Lưu ý: Mọi giá trị trùng lặp sẽ được cập nhật theo dữ liệu mới nhất.</p> </div>
                    <FileBox className='col-md-12' postUrl='/user/upload' ref={e => this.fileBox = e} uploadType='ctsvUploadDanhSachNguoiThamDu' userData={'ctsvUploadDanhSachNguoiThamDu'} success={this.onSuccess} />
                </>
                    : <>
                        <p className='col-md-12'>Tải lên thành công <b>{this.state.result.success || 0}</b> dòng.</p>
                        <div className='col-md-12'>
                            {renderTable({
                                getDataSource: () => this.state.result?.failed || [],
                                emptyTable: 'Không có thông báo',
                                renderHead: () => (<tr>
                                    <th style={{ whiteSpace: 'nowrap' }}>Dòng</th>
                                    <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thông báo</th>
                                </tr>),
                                renderRow: (item, index) => (<tr key={index}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{item.rowNumber}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{item.message}</td>
                                </tr>)
                            })}
                        </div>
                    </>
                }
            </div>
        });
    }
}


class AddNguoiThamDuModal extends AdminModal {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            loaiThamDu: '',
            mssv: '',
        };
    }

    onShow = (item) => {
        const { id = '', email = '', ten = '', loaiThamDu = '', diemCong = '0', mssv = '' } = item || {};
        this.setState({ id, email, ten, loaiThamDu, diemCong, mssv }, () => {
            this.email.value(email);
            this.hoTen.value(ten);
            this.loaiThamDu.value(loaiThamDu);
            if (item && item.loaiThamDu == 1) {
                this.diemCong.value(diemCong);
            }
        });
    }

    onSubmit = () => {
        let data = {};
        if (this.state.id) {
            data = {
                diemCong: getValue(this.diemCong)
            };
        } else {
            const getValueLoaiThamDu = getValue(this.loaiThamDu);
            getValueLoaiThamDu == 1 ? (data = {
                email: getValue(this.email),
                loaiThamDu: getValue(this.loaiThamDu),
                ten: getValue(this.hoTen),
                mssv: getValue(this.mssv),
                diemCong: 0,
            }) : (data = {
                email: getValue(this.email),
                loaiThamDu: getValue(this.loaiThamDu),
                ten: getValue(this.hoTen),
            });
        }
        if (data.email && !T.validateEmail(data.email)) {
            this.email.focus();
            T.notify('Email không hợp lệ', 'danger');
            return false;
        }
        this.state.id ? this.props.update(this.state.id, data, this.hide()) : this.props.create(data, this.hide());
    }

    changeSinhVien = (value) => {
        const { mssv = '', hoTen = '', email = '' } = value || {};
        this.mssv.value(mssv);
        this.hoTen.value(hoTen);
        this.email.value(email);
    }

    handleLoaiThamDuChange = (value) => {
        this.setState({ loaiThamDu: value });
    }


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật người tham dự sự kiện' : 'Tạo thêm người tham dự sự kiện',
            size: 'large',
            body: <div className="row">
                <FormSelect ref={e => this.loaiThamDu = e} className='col-md-12' label='Loại Tham Dự' required readOnly={(this.state.id) ? true : readOnly} data={[
                    { id: '1', text: 'Sinh Viên' },
                    { id: '2', text: 'Khách Mời' }
                ]}
                    onChange={this.handleLoaiThamDuChange}
                />
                {this.state.loaiThamDu && this.state.loaiThamDu.id === '1' && (
                    <>
                        <FormSelect ref={e => this.mssv = e} className='col-md-12' label='MSSV' data={SelectAdapter_FwStudentsSuKien} required readOnly={readOnly} onChange={this.changeSinhVien} />
                    </>
                )}
                <FormTextBox ref={e => this.email = e} className='col-md-6' label='Email' required readOnly={(this.state.loaiThamDu == '1') ? true : readOnly} />
                <FormTextBox ref={e => this.hoTen = e} className='col-md-6' label='Tên' required readOnly={(this.state.loaiThamDu == '1') ? true : readOnly} />
                {this.state.loaiThamDu == '1' && (
                    <>
                        <FormTextBox ref={e => this.diemCong = e} className='col-md-6' label='Điểm cộng' required readOnly={this.state.id ? readOnly : true} />
                    </>
                )}

            </div>
        });
    }
}
const JOIN_MAPPER = {
    1: <span className='text-success'><i className='fa fa-check' /> Đã tham dự</span>,
    0: <span className='text-info'><i className='fa fa-clock-o' /> Chưa tham dự</span>,
    [-1]: <span className='text-danger'><i className='fa fa-times' /> Vắng</span>,
};

class SuKienDetailPage extends AdminPage {
    state = {
        historyList: [],
    };

    componentDidMount() {
        T.ready('/user/ctsv/danh-sach-su-kien', () => {
            let route = T.routeMatcher('/user/ctsv/danh-sach-su-kien/edit/:id'),
                id = route.parse(window.location.pathname).id;
            this.props.getScheduleSettings(data => {
                this.setState({
                    currentSemester: data.currentSemester,
                    namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy,
                    namHoc: '',
                    hocKy: '',
                });
            });
            if (id !== 'new') {
                this.props.getSuKienInfo(id, (data) => {
                    if (data.error) {
                        T.notify('Lấy thông tin sự kiện bị lỗi!', 'danger');
                    } else {
                        this.setState({
                            id: id,
                            diemRenLuyenCong: data.data.diemRenLuyenCong,
                            data: data.data,
                            filter: {
                                idSuKien: id
                            },
                            sortTerm: {}
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
            }

        });
    }

    componentSuKienInfo = (isNguoiTao = false) => {
        let readOnly = (!this.state.id || (this.state.id && isNguoiTao)) ? this.props.readOnly : true;
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin sự kiện</h3>
                <div className='tile-body'>
                    <div className='row'>
                        <div className='form-group col-md-12'>
                            <div className='row'>
                                <FormTextBox ref={(e) => (this.tenSuKien = e)} label='Tên sự kiện' className='form-group col-md-12' readOnly={readOnly} required />
                                <FormSelect className='form-group col-md-6' style={{ width: '120px' }} ref={e => this.namHoc = e} label='Năm học' data={SelectAdapter_SchoolYear} onChange={(value) => this.changeNamHoc(value)} readOnly={readOnly} />
                                <FormSelect className='form-group col-md-6' style={{ width: '100px' }} ref={e => this.hocKy = e} label='Học Kỳ' data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={(value) => this.changeHocKy(value)} readOnly={readOnly} />
                                <FormDatePicker type='time' ref={e => this.thoiGianBatDau = e} className='col-md-6' label='Thời gian bắt đầu' readOnly={readOnly} required />
                                <FormDatePicker type='time' ref={e => this.thoiGianKetThuc = e} className='col-md-6' label='Thời gian kết thúc' readOnly={readOnly} required />
                                <FormDatePicker type='time' ref={e => this.thoiGianBatDauDangKy = e} className='col-md-6' label='Thời gian bắt đầu đăng ký' readOnly={readOnly} required />
                                <FormTextBox type='number' ref={(e) => (this.soLuongThamGiaDuKien = e)} allowNegative={false} label='Số lượng tham gia dự kiến' className='form-group col-md-6' readOnly={readOnly} required />
                                <FormTextBox type='number' ref={(e) => (this.soLuongThamGiaToiDa = e)} allowNegative={false} label='Số lượng tham gia tối đa' className='form-group col-md-6' readOnly={readOnly} />
                                <FormTextBox ref={(e) => (this.diaDiem = e)} label='Địa điểm' className='form-group col-md-6' readOnly={readOnly} required />
                                <FormSelect ref={(e) => (this.maTieuChi = e)} label='Tiêu chí đánh giá' className='form-group col-md-6' readOnly={readOnly} data={SelectAdapter_DmTheTieuChi} />
                                <FormTextBox type='number' ref={(e) => (this.diemRenLuyenCong = e)} allowNegative={false} label='Điểm cộng tối đa' className='form-group col-md-6' readOnly={readOnly} required />
                                <FormTextBox ref={(e) => (this.trangThai = e)} label='Trạng thái' className='form-group col-md-6' readOnly={true} />
                                <FormTextBox ref={(e) => (this.lyDoTuChoi = e)} label='Lý do từ chối' className='form-group col-md-6' readOnly={true} />
                                <FormEditor ref={(e) => (this.moTa = e)} className='col-md-12' label='Mô tả' placeholder='Mô tả' required height={200} readOnly={readOnly} /><br />

                            </div>
                        </div>
                    </div>
                </div>

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

    saveSuKien = async () => {
        let isDuyet = false;
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
            diemRenLuyenCong: Number(getValue(this.diemRenLuyenCong)),
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
            if (this.state.id && this.state.id != 'new') {
                const newData = { ...data };
                if (this.trangThai.state.value == 'Đã Duyệt') {
                    newData.trangThai = 'U';
                }
                this.props.updateSuKien(this.state.id, newData, isDuyet, (result) => {
                    this.updatePageData(result);
                });
            }
            else {
                this.props.createSuKien(data, (result) => {
                    if (result) {
                        this.props.history.push(`/user/ctsv/danh-sach-su-kien/edit/${result.idSuKien}`);
                        this.updatePageData(result);

                    }
                });
            }
        } catch (error) {
            console.error('Lỗi khi gọi createSuKien:', error);
            T.notify('Có lỗi xảy ra khi tạo thêm sự kiện!', 'danger');
        }
    }

    updatePageData = (result) => {
        const id = result.idSuKien;
        this.setState({
            id: id,
            diemRenLuyenCong: result.diemRenLuyenCong,
            data: result,
            filter: {
                idSuKien: id
            },
            sortTerm: {}
        });

        this.props.getSuKienAllVersion(id, (data) => {
            this.setState({
                id: id,
                historyList: data.data,
            });
        });
    }

    createNguoiThamDu = async (data) => {
        this.props.createNguoiThamDu(this.state.id, data);
    }

    updateNguoiThamDu = async (id, changes) => {
        this.props.updateNguoiThamDu(this.state.id, id, changes);
    }

    handleDeleteNguoiThamDu = (id) => {
        T.confirm('Xóa người tham dự sự kiện', 'Bạn có chắc muốn xóa người tham dự này?', isConfirmed => isConfirmed && this.props.deleteNguoiThamDu(this.state.id, id));
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getPageSuKienNguoiThamDu(pageN, pageS, pageC, this.state.id, done);
    }

    getPageSuKienNguoiThamDu = (pageNumber, pageSize, pageCondition, done) => {
        let idSuKien = this.state.id;
        let filter = { ...this.state.filter };
        this.props.getPageSuKienNguoiThamDu(pageNumber, pageSize, pageCondition, idSuKien, filter, done);
    };

    handleKeySearch = (data) => {
        const [keyOfNewData, value] = data.split(':');
        this.setState({ filter: { ...this.state.filter, [keyOfNewData]: value } }, () => {
            this.getPageSuKienNguoiThamDu();
        });
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

    changeNamHoc = (value) => {
        this.setState({ namHoc: value.id });
    }

    changeHocKy = (value) => {
        this.setState({ hocKy: value.id });
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal } = this.props.svSuKien?.suKienNguoiThamDu || {},
            list = this.props.svSuKien?.suKienNguoiThamDu?.list || [],
            permission = this.getUserPermission('ctsvSuKien');
        let { user } = this.props.system ? this.props.system : {};
        const isNguoiTao = (this.state.data ? this.state.data.nguoiTao == user.email : null) ? true : false;

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
                        { title: 'Thông tin sự kiên', component: this.componentSuKienInfo(isNguoiTao) },
                        { title: 'Lịch sử chỉnh sửa', component: this.componentHistory() }
                    ]} />
                    {this.state.id && <div className="tile">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                            <h3 className='tile-title'>Danh sách người tham dự sự kiện</h3>
                            {isNguoiTao &&
                                <div style={{ display: 'flex', justifyContent: 'end', alignContent: 'center' }}>
                                    <div className="dropdown">
                                        <button type='button' className='btn btn-primary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                            <i className='fa fa-lg fa-bars' />Tuỳ chọn
                                        </button>
                                        <div className="dropdown-menu " aria-labelledby="dropdownMenuButton">
                                            <button className='dropdown-item btn' type='button' onClick={() => this.scanModal.show(this.state.id, this.state.diemRenLuyenCong)}>
                                                <i className='fa fa-sm fa-qrcode' /> Điểm danh
                                            </button>
                                            <button className='dropdown-item btn' type='button' onClick={() => this.qrCodeModal.show(this.state.data)}>
                                                <i className='fa fa-sm fa-qrcode' /> Mã QR
                                            </button>
                                            <button className='dropdown-item btn' type='button' onClick={() => this.props.downloadDanhSachNguoiThamDu('DS_NGUOI_THAM_DU_SU_KIEN', pageCondition, this.state.filter)}>
                                                <i className='fa fa-sm fa-download' /> Tải xuống danh sách
                                            </button>
                                            <button className='dropdown-item btn' type='button' onClick={() => this.importModal.show(this.state.id)}>
                                                <i className='fa fa-sm fa-upload' /> Tải lên danh sách
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <button className='btn btn-info' style={{ marginLeft: '10px' }} type='button' title='Thêm người tham dự' onClick={() => this.addNguoiThamDuModal.show()}>
                                            <i className='fa fa-sm fa-plus' /> Thêm người tham dự
                                        </button>
                                    </div>
                                </div>
                            }
                        </div>

                        {renderTable({
                            getDataSource: () => list,
                            renderHead: () => (<tr>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                                <TableHead style={{ width: '30%' }} content='Tên' keyCol='ten' onKeySearch={this.handleKeySearch} />
                                <TableHead style={{ width: '30%' }} content='Email' keyCol='email' onKeySearch={this.handleKeySearch} />
                                <TableHead style={{ width: '10%' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                                <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Loại tham dự</th>
                                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Điểm cộng</th>
                                {isNguoiTao && <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Thao tác</th>}


                            </tr>),
                            renderRow: (item, index) =>
                            (<tr key={index}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiThamDu == 1 ? 'Sinh Viên' : 'Khách Mời'} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={this.renderSwitch(item.tinhTrang)} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diemCong} />
                                {isNguoiTao && <TableCell type='buttons' style={{ width: 'auto', whiteSpace: 'nowrap' }} permission={permission} onEdit={() => this.addNguoiThamDuModal.show(item)} onDelete={() => this.handleDeleteNguoiThamDu(item.id)} />}



                            </tr>)
                        })}
                        <div style={{ marginBottom: '10px' }}>
                            <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageCondition, pageTotal }} getPage={this.getPage} />
                        </div>
                        <ImportModal ref={e => this.importModal = e} permission={permission} getPage={this.getPage} />
                        <AddNguoiThamDuModal ref={e => this.addNguoiThamDuModal = e}
                            create={this.createNguoiThamDu}
                            update={this.updateNguoiThamDu}
                            readOnly={!permission.write}
                        />
                        <ScanModal ref={e => this.scanModal = e} permission={permission} suKienDiemDanh={this.props.suKienDiemDanh} />
                        <QrCodeModal ref={e => this.qrCodeModal = e} item={this.state.item} updateQrCodeTime={this.props.updateQrCodeTime} getData={this.props.getData} getSuKienQr={this.props.getSuKienQr} />
                    </div>
                    },
                </>,
            backRoute: '/user/ctsv/danh-sach-su-kien',
            onSave: () => this.saveSuKien()
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, svSuKien: state.ctsv.svSuKien });
const mapActionsToProps = {
    getSuKienInfo, getPageSuKienNguoiThamDu, createSuKien, updateSuKien, createNguoiThamDu, updateNguoiThamDu, deleteNguoiThamDu,
    downloadDanhSachNguoiThamDu, getScheduleSettings, suKienDiemDanh, getSuKienQr, updateQrCodeTime, getSuKienAllVersion
};
export default connect(mapStateToProps, mapActionsToProps)(SuKienDetailPage);