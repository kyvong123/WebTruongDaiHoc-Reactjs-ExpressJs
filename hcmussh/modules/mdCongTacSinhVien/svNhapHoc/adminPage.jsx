import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormDatePicker, FormSelect, FormTextBox, getValue, TableCell, renderTable, FormCheckbox, loadSpinner } from 'view/component/AdminPage';
import { checkSinhVienNhapHoc, setSinhVienNhapHoc, createCauHinhNhapHoc, getCauHinhNhapHoc, getLichSuChapNhanNhapHoc } from './redux';
import { Img } from 'view/component/HomePage';
import { Html5QrcodeScanner } from 'html5-qrcode';


const ttChoNhapHoc = 11;

class ScanModal extends AdminModal {
    componentDidMount() {
        this.onHidden(() => {
            let { html5QrcodeScanner } = this.state;
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear();
            }
        });
    }

    onShow = () => {
        let html5QrcodeScanner = new Html5QrcodeScanner(
            'reader',
            { fps: 10, qrbox: { width: 150, height: 150 } },
            false);
        this.setState({ html5QrcodeScanner }, () => html5QrcodeScanner.render(this.props.onScanSuccess, () => { }));
    }

    render = () => {
        return this.renderModal({
            title: 'Quét mã',
            size: 'large',
            body: <>
                <div id='reader' className='tile'></div>
            </>
        });
    }
}

class NhapHocPage extends AdminPage {
    state = { dataNhapHoc: {}, showLichSu: false, isLoading: true }
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getCauHinhNhapHoc(result => {
                let { item } = result;
                Object.keys(item).forEach(key => {
                    if (key == 'heDaoTao') item[key] = item[key].split(',');
                    this[key] && this[key].value(item[key]);
                });
            });
            this.getLichSuChapNhan();
            T.socket.on('scan-nhap-hoc', (data) => {
                let dataNhapHoc = data.dataNhapHoc;
                if (dataNhapHoc.mssv != this.mssv.value()) {
                    this.setState({ dataNhapHoc, showResult: true });
                    this.mssv.value(dataNhapHoc.mssv);
                }
            });
        });
    }

    componentWillUnmount() {
        T.socket.off('scan-nhap-hoc');
    }

    getLichSuChapNhan = () => {
        this.props.getLichSuChapNhanNhapHoc(result => {
            let { dsSinhVien, dataFee, listThaoTac } = result;
            this.setState({
                data: dsSinhVien, listThaoTac,
                dataFee,
                isLoading: false
            });
        });
    }

    checkMssv = () => {
        let mssv = this.mssv.value();
        if (mssv == '') {
            T.notify('Chưa nhập mã số sinh viên', 'danger');
            this.mssv.focus();
        } else {
            this.props.checkSinhVienNhapHoc(mssv, data => {
                let dataNhapHoc = data.dataNhapHoc;
                this.setState({ dataNhapHoc, showResult: true });
            });
        }
    }

    handleNhapHocSinhVien = (value) => {
        if (value.length == 10) {
            this.props.checkSinhVienNhapHoc(value, data => {
                let dataNhapHoc = data.dataNhapHoc;
                this.setState({ dataNhapHoc, showResult: true });
            });
        }
    }

    onScanSuccess = (decodedText) => {
        this.mssv.value(decodedText);
        this.props.checkSinhVienNhapHoc(decodedText, data => {
            let dataNhapHoc = data.dataNhapHoc;
            this.setState({ dataNhapHoc, showResult: true }, this.modal.hide);
        });
    }

    tuChoiNhapHoc = () => {
        T.confirm('TỪ CHỐI NHẬP HỌC', 'Bạn có chắc muốn TỪ CHỐI nhập học sinh viên này không', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ giây lát');
                this.props.setSinhVienNhapHoc({ mssv: this.state.dataNhapHoc.mssv, thaoTac: 'D' }, () => {
                    T.alert(`Từ chối nhập học ${this.state.dataNhapHoc.hoTen} vào ${T.dateToText(Date.now(), 'HH:mm dd/mm/yyyy')}`, 'success', null);
                    this.checkMssv();
                    this.setState({ isLoading: true }, () => {
                        this.getLichSuChapNhan();
                    });
                });
            }
        });
    }

    chapNhanNhapHoc = () => {
        let { dataNhapHoc } = this.state,
            { tinhTrang, congNo, ngayNhapHoc, isCompleteBhyt, isCompleteBhytInfo } = dataNhapHoc;

        const hocPhi = `<span'>Học phí:</span>
        <b style=${(congNo == 0 || congNo == -1) ? '"color: red;"' : (congNo == 2 ? 'text-primary' : 'text-success')}>${congNo == -1 ? 'Sinh viên chưa được định phí!' : (congNo == 0 ? 'Chưa thanh toán học phí' : (congNo == 2 ? 'Đã gia hạn thanh toán' : 'Đã thanh toán học phí'))}</b><br />`;

        const bhyt = isCompleteBhyt !== undefined ? `<div>
            <span>BHYT:</span>
            <b style=${isCompleteBhyt ? '' : '"color: red;"'}>
                ${isCompleteBhyt ? `
                    Đã đăng ký ${isCompleteBhytInfo ? `<span className='text-success'>
                        (Đã kê khai thông tin)
                    </span>` : `<span style="color: red;">
                        (Chưa kê khai thông tin)
                    </span>`}
                ` : `
                    Chưa đăng ký
                `}
            </b>
        </div>` : null;

        const keKhai = `<span>Tình trạng:</span>
        <b style=${(ngayNhapHoc && ngayNhapHoc != -1 && !tinhTrang.toLowerCase().includes('chưa')) ? '' : '"color: red"'}>${tinhTrang}</b><br />`;

        let result = '';
        result += hocPhi?.toLowerCase().includes('chưa') ? hocPhi : '';
        result += bhyt?.toLowerCase().includes('chưa') ? bhyt : '';
        result += keKhai?.toLowerCase().includes('chưa') ? keKhai : '';
        result += '<span><b>Bạn có chắc muốn chấp nhận nhập học cho sinh viên</b></span>';

        T.confirm('CHẤP NHẬN NHẬP HỌC', result, 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ giây lát');
                this.props.setSinhVienNhapHoc({ mssv: this.state.dataNhapHoc.mssv, thaoTac: 'A', lopSinhVien: this.state.dataNhapHoc.lopSinhVien, maCtdt: this.state.dataNhapHoc.maCtdt, maKhoa: this.state.dataNhapHoc.maKhoa }, () => {
                    T.alert(`SV ${this.state.dataNhapHoc.hoTen} nhập học vào ${T.dateToText(Date.now(), 'HH:mm dd/mm/yyyy')}`, 'success', null);
                    this.checkMssv();
                    this.setState({ isLoading: true }, () => {
                        this.getLichSuChapNhan();
                    });
                });
            }
        });
    }

    handleCreateCauHinh = () => {
        try {
            const data = {
                namHoc: getValue(this.namHoc),
                khoaSinhVien: getValue(this.khoaSinhVien),
                heDaoTao: getValue(this.heDaoTao).toString(),
                thoiGianBatDau: getValue(this.thoiGianBatDau).getTime(),
                thoiGianKetThuc: getValue(this.thoiGianKetThuc).getTime(),
                ghiDe: 0
            };
            this.props.createCauHinhNhapHoc(data, result => {
                delete data.ghiDe;
                if (result.warn) {
                    if (Object.keys(data).some(key => data[key] != result.warn[key])) {
                        let { namHoc, khoaSinhVien, heDaoTao, thoiGianBatDau, thoiGianKetThuc } = result.warn;
                        T.confirm('Bạn muốn ghi đè cấu hình nhập học?', `<div style="text-align: left;">
                        <p>Năm học: <span style="text-decoration: line-through;">${namHoc}</span> → <span style="color: red;">${data.namHoc}</span></p>
                        <p>Khoá sinh viên: <span style="text-decoration: line-through;">${khoaSinhVien}</span> → <span style="color: red;">${data.khoaSinhVien}</span> </p>
                        <p>Hệ đào tạo: <span style="text-decoration: line-through;">${heDaoTao}</span> → <span style="color: red;">${data.heDaoTao}</span> </p>
                        <p>Thời gian bắt đầu: <span style="text-decoration: line-through;">${T.dateToText(thoiGianBatDau, 'dd/mm/yyyy HH:MM')}</span> → <span style="color: red;">${T.dateToText(data.thoiGianBatDau, 'dd/mm/yyyy HH:MM')}</span> </p>
                        <p>Thời gian kết thúc: <span style="text-decoration: line-through;">${T.dateToText(thoiGianKetThuc, 'dd/mm/yyyy HH:MM')}</span> → <span style="color: red;">${T.dateToText(data.thoiGianKetThuc, 'dd/mm/yyyy HH:MM')}</span> </p>
                    </div>`, null, true, isConfirm => {
                            if (isConfirm) {
                                data.ghiDe = 1;
                                this.props.createCauHinhNhapHoc(data, result => {
                                    if (result.item) T.notify('Cập nhật cấu hình nhập học thành công', 'success');
                                });
                            }
                        });
                    } else {
                        T.notify('Không có thay đổi nào!', 'warning');
                    }
                } else if (result.item) T.notify('Cập nhật cấu hình nhập học thành công', 'success');
            });
        } catch (input) {
            if (input) {
                T.notify(`${input.props.label} không được trống`, 'danger');
                input.focus();
            }
        }
    }

    table = (list) => renderTable({
        emptyTable: 'Không có dữ liệu sinh viên',
        stickyHead: (list && list.length > 12) ? true : false,
        header: 'thead-light',
        getDataSource: () => list,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên lót</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoá</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email sinh viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cá nhân</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian nhập học</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell type='number' content={index + 1} />
                <TableCell type='link' url={`/user/ctsv/profile/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                    <>
                        {item.isUpToDate ? <b className='text-success'>Đã lưu trực tuyến</b> : <b className='text-secondary'>Chưa lưu trực tuyến</b>}
                        < br />
                        {this.state.dataFee.find(fee => fee.mssv == item.mssv) ? <b className='text-primary'>Đã thanh toán phí nhập học</b> : <b className='text-danger'>Chưa thanh toán phí nhập học</b>}
                    </>
                } />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh ? (item.gioiTinh == 1 ? 'Nam' : 'Nữ') : ''} />
                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngaySinh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailCaNhan || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailTruong || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dienThoaiCaNhan || ''} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>{T.dateToText(item.ngayNhapHoc, 'HH:MM:ss dd/mm/yyyy')}<br /><i>{this.state.listThaoTac.find(thaoTac => thaoTac.mssv == item.mssv)?.email || ''}</i></>} />
            </tr>
        )
    });

    render() {
        let { dataNhapHoc, showResult } = this.state,
            { mssv, hoTen, tinhTrang, nganhHoc, congNo, ngayNhapHoc, heDaoTao, invalid, lopSinhVien, maKhoa, tinhTrangSinhVien, anhThe, isCompleteBhyt, isCompleteBhytInfo } = dataNhapHoc;
        let permission = this.getUserPermission('ctsvNhapHoc', ['adminNhapHoc', 'write']),
            readOnly = !permission.adminNhapHoc;

        return this.renderPage({
            title: 'Nhập học',
            icon: 'fa fa-bookmark',
            breadcrumb: [
                <Link key={1} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Nhập học'
            ],
            content: <div className='row' >
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Cấu hình nhập học</h3>
                        <div className='tile-body'>
                            <div className='row'>
                                <FormTextBox type='scholastic' className='col-md-6' ref={e => this.namHoc = e} label='Năm học' required readOnly={readOnly} />
                                <FormTextBox type='year' ref={e => this.khoaSinhVien = e} label='Khoá sinh viên' className='col-md-6' required readOnly={readOnly} />
                                <FormSelect ref={e => this.heDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple className='col-md-12' required readOnly={readOnly} />
                                <FormDatePicker type='time-mask' className='col-md-12' ref={e => this.thoiGianBatDau = e} label='Thời gian bắt đầu' required readOnly={readOnly} />
                                <FormDatePicker type='time-mask' className='col-md-12' ref={e => this.thoiGianKetThuc = e} label='Thời gian kết thúc' required readOnly={readOnly} />
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', display: readOnly ? 'none' : '' }}>
                            <button className='btn btn-outline-success' type='button' onClick={this.handleCreateCauHinh}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <ScanModal ref={e => this.modal = e} onScanSuccess={this.onScanSuccess} />
                    <div className='tile' style={{ minHeight: '230px' }}>
                        <h3 className='tile-title'>Công tác nhập học</h3>
                        <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' onKeyDown={e => {
                            if (e.keyCode == 13) this.checkMssv();
                            // else if (e.keyCode == 8) this.setState({ showResult: false });
                        }} onChange={e => this.handleNhapHocSinhVien(e.target.value)} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-outline-primary' type='button' onClick={this.checkMssv} style={{ marginLeft: '10px' }}>
                                <i className='fa fa-fw fa-lg fa-search'></i>Kiểm tra
                            </button>
                            <button className='btn btn-outline-primary' type='button' onClick={e => e && e.preventDefault() || this.modal.show()} style={{ marginLeft: '10px' }}>
                                <i className='fa fa-fw fa-lg fa-code'></i>Quét mã
                            </button>
                        </div>
                        <div style={{ display: showResult ? '' : 'none' }} >
                            <h3 className='tile-title'>Kết quả</h3>
                            <div className='row'>
                                <div className='col-md-8'>
                                    <div className='row'>
                                        <span className='col-md-4'>Họ và tên:</span>
                                        <b className='text-primary col-md-8'><a href={`/user/ctsv/profile/${mssv}`} target='blank'>{hoTen}</a></b><br /><br />

                                        <span className='col-md-4'>MSSV:</span>
                                        <b className='col-md-8'>{mssv}</b><br /><br />

                                        <span className='col-md-4'>Hệ đào tạo:</span>
                                        <b className='col-md-8'>{heDaoTao}</b><br /><br />

                                        <span className='col-md-4'>Khoá đào tạo:</span>
                                        <b className='col-md-8'>{maKhoa}</b><br /><br />

                                        <span className='col-md-4'>Ngành học:</span>
                                        <b className='col-md-8'>{nganhHoc}</b><br /><br />

                                        <span className='col-md-4'>Lớp sinh viên:</span>
                                        <b className='col-md-8'>{lopSinhVien ? lopSinhVien : 'Không tìm thấy lớp phù hợp cho sinh viên'}</b><br /><br />

                                        <span className='col-md-4'>Học phí:</span>
                                        <b className={(congNo == 0 || congNo == -1) ? 'text-danger col-md-8' : (congNo == 2 ? 'text-primary col-md-8' : 'text-success col-md-8')}>{congNo == -1 ? 'Sinh viên chưa được định phí!' : (congNo == 0 ? 'Chưa thanh toán học phí' : (congNo == 2 ? 'Đã gia hạn thanh toán' : 'Đã thanh toán học phí'))}</b><br /><br />

                                        {isCompleteBhyt !== undefined ? <>
                                            <span className='col-md-4'>Bảo hiểm y tế:</span>
                                            <b className={isCompleteBhyt ? 'text-success col-md-8' : 'text-secondary col-md-8'}>
                                                {isCompleteBhyt ? <>
                                                    Đã đăng ký {isCompleteBhytInfo ? <span className='text-success'>
                                                        (Đã kê khai thông tin)
                                                    </span> : <span className='text-warning'>
                                                        (Chưa kê khai thông tin)
                                                    </span>}
                                                </> : <>
                                                    Chưa đăng ký
                                                </>}
                                            </b>
                                        </> : null}

                                        <span className='col-md-4'>Ảnh thẻ</span>
                                        <b className={anhThe ? 'text-success col-md-8' : 'text-secondary col-md-8'}>{anhThe ? 'Đã cập nhật' : 'Chưa cập nhật'}</b>

                                        <span className='col-md-4'>Tình trạng:</span>
                                        <b className={(ngayNhapHoc && ngayNhapHoc != -1 && !tinhTrang.toLowerCase().includes('chưa')) ? 'text-success col-md-8' : 'text-secondary col-md-8'}>{tinhTrang}</b>
                                    </div>
                                </div>
                                <div className='col-md-4'>
                                    <div className='ml-3'>
                                        {anhThe ? <div className='col-md-12 mt-2'><a href={`/api/ctsv/image-card?mssv=${mssv}&t=${new Date().getTime()}`} target='_blank' rel='noreferrer' >
                                            <Img src={`/api/ctsv/image-card?mssv=${mssv}&t=${new Date().getTime()}`} style={{ width: '150px', height: '200px' }} alt='Hình ảnh thẻ' />
                                        </a></div> : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='tile-footer' style={{ display: invalid ? 'none' : 'flex', justifyContent: 'space-between' }}>
                            {(tinhTrangSinhVien != ttChoNhapHoc && showResult) && <><button className='btn btn-outline-danger' type='button' onClick={this.tuChoiNhapHoc} >
                                <i className='fa fa-fw fa-lg fa-times' />Huỷ nhập học
                            </button><div></div></>}
                            {(!ngayNhapHoc || tinhTrangSinhVien == ttChoNhapHoc) && showResult && <><div></div><button className='btn btn-outline-success' type='button' onClick={this.chapNhanNhapHoc} >
                                <i className='fa fa-fw fa-lg fa-save' /> Chấp nhận
                            </button></>}
                        </div>
                    </div>
                </div>
                <div className='col-md-12'>
                    <div className='tile'>
                        <h3 className='tile-title'>Lịch sử chấp nhận nhập học</h3>
                        <FormCheckbox ref={e => this.showLichSu = e} label='Hiển thị tất cả' onChange={() => this.setState({ showLichSu: !this.state.showLichSu })} readOnly={''} />
                        {(this.state.showLichSu) ? (this.state.isLoading ? loadSpinner() : this.table((this.state.data || []).filter(item => item.ngayNhapHoc != null && item.ngayNhapHoc != -1))) : null}
                    </div>
                </div>
            </div>,
            backRoute: '/user/ctsv'
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    checkSinhVienNhapHoc, setSinhVienNhapHoc, createCauHinhNhapHoc, getCauHinhNhapHoc, getLichSuChapNhanNhapHoc
};
export default connect(mapStateToProps, mapActionsToProps)(NhapHocPage);
