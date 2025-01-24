import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormTextBox, FormDatePicker, FormSelect, getValue } from 'view/component/AdminPage';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
// import DangKyModal from './DangKyModal';
import { SelectAdapter_DmCoSoKcbBhyt } from 'modules/mdDanhMuc/dmCoSoKcbBhyt/redux';
import { getSvBaoHiemYTeThongTin, createSvBaoHiemYTe, huyDangKySvBaoHiemYTe } from './redux';
import { updateStudentUser } from '../svInfo/redux';
import SvDangKyMoiModal from './SvDangKyMoiModal';
import DangKyModal from './DangKyModal';
import BaoHiemInfoAdminModal from './BhModal';
import FileBox from 'view/component/FileBox';
import QR_Modal from 'modules/mdSinhVien/svHocPhi/component/QrModal';
import T from 'view/js/common';
import { Img } from 'view/component/HomePage';
import { SelectAdapter_DmDienDongBhyt } from 'modules/mdCongTacSinhVien/svDmDienDongBhyt/redux';
import ComponentBhytInfo from 'modules/mdSinhVien/svNewStudent/component/componentBhytInfo';

const APPROVED_MAPPER = {
    2: <span className='text-success'><i className='fa fa-check' /> Đã nhận</span>,
    1: <span className='text-info'><i className='fa fa-clock-o' /> Đã Hoàn Thành</span>,
    0: <span className='text-danger'><i className='fa fa-plus-square' /> Đăng ký mới</span>,
    [-1]: <span className='text-danger'><i className='fa fa-times' /> Từ chối</span>,
};

const DIEN_DONG_MAPPER = {
    15: <span className='text-success'>Diện bảo hiểm y tế 15 tháng</span>,
    12: <span className='text-success'>Diện bảo hiểm y tế 12 tháng</span>,
    9: <span className='text-success'>Diện bảo hiểm y tế 9 tháng</span>,
    0: <span className='text-success'>Miễn đóng</span>,
};

// const SO_TIEN_MAPPER = {
//     12: <span className='text-success'>680.400 đồng</span>,
//     15: <span className='text-success'>850.500 đồng</span>,
//     0: <span className='text-success'>0 đồng</span>,
// };

const prefixBillBhyt = 'BH';

class SinhVienManageBhytPage extends AdminPage {
    state = { dienDong: null, canEdit: 0, canDangKy: false, coMaBhyt: true, filePath: null, isGiaHan: false, thoiGianBatDau: null, thoiGianKetThuc: null, maDotDangKy: null }
    componentDidMount() {
        T.ready('/user/quan-ly-bhyt', () => {
            this.getData();
        });

        T.socket.on('updateThanhToanBhyt', () => {
            this.getData();
        });
    }

    getData = () => {
        this.props.getSvBaoHiemYTeThongTin((data) => {
            const { dataSinhVien } = data;
            const { thoiGianBatDau, thoiGianKetThuc, ma } = dataSinhVien.currentDotDangKy ? dataSinhVien.currentDotDangKy : { thoiGianBatDau: null, thoiGianKetThuc: null, ma: null };
            this.setState({ canEdit: dataSinhVien.canEdit, dataSinhVien: dataSinhVien, thoiGianBatDau, thoiGianKetThuc, maDotDangKy: ma }, () => {
                const now = new Date().getTime();
                this.setState({ canDangKy: (this.checkThoiGian(now) && dataSinhVien.isValidKhoaHe) });
            });
            this.setFormValue(data.dataSinhVien);
        });
    }

    componentWillUnmount() {
        T.socket.off('updateThanhToanBhyt');
    }

    onSuccess = (data) => {
        this.setState({ filePath: data.image }, () => {
            T.notify('Upload thành công', 'success');
        });
    }

    checkThoiGian = (itemTime) => {
        const { thoiGianBatDau, thoiGianKetThuc } = this.state;
        const start = new Date(thoiGianBatDau);
        const end = new Date(thoiGianKetThuc);
        const thoiGianDangKy = new Date(itemTime);
        const now = new Date();
        return (thoiGianDangKy >= start && thoiGianDangKy <= end && now <= thoiGianKetThuc);
    }

    setFormValue = (item) => {
        this.hoTen?.value(`${item.ho} ${item.ten}`);
        this.mssv?.value(item.mssv || '');
        this.ngaySinh?.value(item.ngaySinh || '');
        this.noiSinhMaTinh?.value(item.noiSinhMaTinh || '');
        this.maBhxhHienTai?.value(item.maBhxhHienTai || '');
        this.noiKhamChuaBenh?.value(item.benhVienDangKy || '');
        this.thuongTru?.value(item.thuongTruMaTinh || '', item.thuongTruMaHuyen || '', item.thuongTruMaXa || '', item.thuongTruSoNha || '');
        this.cmnd?.value(item.cmnd);
        this.setState({ filePath: item.matTruocThe });
    }

    handleCheckBenhVien = (value) => {
        if (value.loaiDangKy == 1 && this.state.coMaBhyt == true) {
            T.confirm('Lưu ý', `${value.ten} chỉ cho phép gia hạn đối với những thẻ BHYT đã đăng ký trước đó, không chấp nhận đăng ký mới hay đổi nơi khám chữa bệnh`, false, isConfirm => {
                if (!isConfirm) {
                    this.benhVienDangKy?.value(null);
                }
            });
        }
    };

    handleSizeBhxh = (value) => {
        if (value && value.toString().length > 10) {
            this.maBhxhHienTai.value(value.toString().substring(0, 10));
        }
    };

    handleDangKiBhyt = (e) => {
        const { dienDong, filePath, isGiaHan } = this.state;
        try {
            e.preventDefault();
            const svBaoHiemYTe = {
                mssv: getValue(this.mssv),
                dienDong: getValue(this.dienDongBhyt),
                maBhxhHienTai: getValue(this.maBhxhHienTai),
                benhVienDangKy: dienDong == 0 ? null : getValue(this.noiKhamChuaBenh),
                namDangKy: Number(new Date().getFullYear()) + 1,
                matTruocThe: (dienDong == 0 || isGiaHan == true) ? filePath : null,
                cmnd: getValue(this.cmnd),
                coBhxh: 1,
                giaHan: 1,
            };
            if ((dienDong == 0 || isGiaHan == true) && filePath == null) {
                T.notify('Hình ảnh mặt trước thẻ BHYT bị trống!', 'danger');
            } else {
                T.confirm('Xác nhận đăng ký BHYT', `Bạn có chắc bạn muốn đăng ký BHYT mức ${dienDong} tháng!`, isConfirm => isConfirm && this.props.createSvBaoHiemYTe(svBaoHiemYTe));
            }
        } catch (error) {
            console.error(error);
            T.notify(`${error.props.placeholder} bị trống!`, 'danger');
        }
    }

    renderSwitch(param) {
        switch (param) {
            case null: // New
                return APPROVED_MAPPER[0];
            case 'A':  // Accept
                return APPROVED_MAPPER[1];
            case 'C': //Complete
                return APPROVED_MAPPER[2];
            case 'R': //Reject
                return APPROVED_MAPPER[-1];
            default:
                return 'Unknown state';
        }
    }

    updateStudent = (e) => {
        e.preventDefault();
        const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.thuongTru.value();
        const changes = {
            mssv: getValue(this.mssv),
            ngaySinh: getValue(this.ngaySinh).getTime(),
            noiSinh: getValue(this.noiSinhMaTinh),
            thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha
        };
        T.confirm('Cập nhật thông tin cá nhân', 'Vui lòng kiểm tra kỹ thông tin trước khi cập nhật', 'warning', true, (isConfirm) => {
            isConfirm && this.props.updateStudentUser({ ...changes, lastModified: new Date().getTime() }, () => {
                T.notify('Cập nhật thông tin cá nhân thành công', 'success');
            });
        });
    }

    thongTinCoBan = () => {
        const readOnly = true;
        const { isGiaHan, dienDong, filePath, maDotDangKy } = this.state;
        return (<div className='tile'>
            <div className='tile-title'>
                <h3>Thông tin cơ bản</h3>
                <label className='text-danger' style={{ fontSize: '1rem' }}>Vui lòng kiểm tra thông tin trước khi đăng ký bảo hiểm y tế . Nếu có sai sót, vui lòng cập nhật thông tin tại <Link key={0} to='/user/profile-student'>Thông tin cá nhân sinh viên</Link>. <span>Nếu chưa có mã BHYT vui lòng ấn vào {<a href='#' onClick={() => this.setState({ coMaBhyt: false }, () => this.dangKyMoiModal.show())}>đây</a>} để đăng ký mới</span></label>
            </div>

            <div className='tile-body'>
                <div className='row'>
                    <FormTextBox type='text' className='col-md-6' ref={e => this.hoTen = e} label='Họ và tên' required readOnly />
                    <FormTextBox type='text' className='col-md-6' ref={e => this.mssv = e} label='MSSV' required readOnly />
                    <FormDatePicker type='date-mask' className='form-group col-md-4' ref={e => this.ngaySinh = e} label='Ngày sinh' required readOnly={readOnly} />
                    <FormSelect className='col-md-4' ref={e => this.noiSinhMaTinh = e} data={ajaxSelectTinhThanhPho} label='Nơi sinh' required readOnly={readOnly} />
                    <FormTextBox ref={e => this.cmnd = e} label='CCCD/Mã định danh' className='col-md-4' required readOnly={readOnly} />
                    <ComponentDiaDiem className='form-group col-md-12' ref={e => this.thuongTru = e} label='Địa chỉ thường trú' requiredSoNhaDuong readOnly={readOnly} />
                    <FormTextBox type='phone' ref={e => this.maBhxhHienTai = e} label={'Mã BHYT hiện tại (10 số cuối)'} className='col-md-4' required readOnly={''} onChange={e => this.handleSizeBhxh(e.target.value)} />
                    <FormSelect ref={e => this.dienDongBhyt = e} label={<span>Diện đăng ký BHYT {<a href='#' onClick={() => this.chiTietDienDong.show()}>(Chi tiết diện BHYT)</a>}</span>} placeholder='Diện đăng ký BHYT' className='form-group col-md-4' data={SelectAdapter_DmDienDongBhyt} required readOnly={''} onChange={value => this.setState({ dienDong: value.id, filePath: null })} />
                    {dienDong == 0 ? null : <FormSelect ref={e => this.noiKhamChuaBenh = e} label='Nơi khám chữa bệnh ban đầu' placeholder='Nơi khám chữa bệnh ban đầu' className='form-group col-md-4' data={SelectAdapter_DmCoSoKcbBhyt(0)} required readOnly={''} onChange={this.handleCheckBenhVien} />}
                    {(dienDong == 0 || isGiaHan == true) && <>
                        <div className='col-md-6'>
                            <p>{filePath ? 'Chọn ảnh mặt trước BHYT khác' : 'Vui lòng Upload mặt trước thẻ BHYT hiện tại'}</p>
                            <FileBox postUrl='/user/upload' uploadType='BHYTSV_FRONT' userData={`BHYTSV_FRONT:${maDotDangKy}`}
                                accept='.png, .jpg'
                                ajax={true} success={this.onSuccess}
                                label='Thêm minh chứng'
                                ref={e => this.matTruocThe = e}
                                description={
                                    <div>
                                        Độ lớn của file ảnh <b className='text-danger'>không quá 1MB</b>. Giảm kích thước file ảnh tại{' '}
                                        <a href='https://www.iloveimg.com/compress-image' target='_blank' rel='noreferrer'>
                                            đây
                                        </a>
                                    </div>
                                }
                            />
                        </div>
                        {filePath ? <div className='col-md-6'>
                            <h6 className='font-weight-bold'>Mặt trước thẻ BHYT hiện tại</h6>
                            <a href={`/api/sv/bhyt/front?filePath=${filePath.split('/')[3]}&maDot=${filePath.split('/')[1]}`} target='_blank' rel='noreferrer'>
                                <Img src={`/api/sv/bhyt/front?filePath=${filePath.split('/')[3]}&maDot=${filePath.split('/')[1]}`} style={{ width: '500px', height: 'auto' }} alt='Ảnh mặt trước thẻ BHYT' />
                            </a>
                        </div> : null}
                    </>}
                </div>
                {this.state.canDangKy ? <div className='d-flex justify-content-end'>
                    {/* {(this.state.canEdit) ? <button className='btn btn-info mr-2' onClick={e => this.updateStudent(e)}>Cập nhật thông tin</button> : null} */}
                    <button className='btn btn-success' onClick={e => this.handleDangKiBhyt(e)}>Đăng ký</button>
                </div> : null}
            </div>
        </div>);
    }

    thanhToanBhyt = () => {
        T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
        T.post('/api/sv/hoc-phi/qr-bidv', { prefixBillBhyt }, result => {
            if (result.error) {
                T.alert(`${result.error.message} Vui lòng liên hệ Phòng Kế hoạch - Tài chính`, 'error', false, 5000);
            } else {
                T.alert('Kết nối thành công! Vui lòng quét mã QR để thanh toán.', 'success', false, 2000, true);
                this.qrModal.show(result.base64, 'BH');
                // window.open(result.path, '_blank');
            }
        });
    }

    render() {
        let items = this.props.svManageBhyt?.items ?? [];
        const { canDangKy } = this.state;
        const table = renderTable({
            getDataSource: () => items ? items : [],
            style: { display: items ? '' : 'none' },
            stickyHead: items && items.length > 10 ? true : false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Loại bảo hiểm</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Mã BHYT</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày đăng ký</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi khám chữa bệnh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giá tiền</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th> */}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.id || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={DIEN_DONG_MAPPER[item.dienDong.toString()]} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.maBhxhHienTai || 'Chưa có'} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap' }} content={item.thoiGian || ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='text' content={item.tenBenhVien || ''} />
                    {/* <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={SO_TIEN_MAPPER[item.dienDong.toString()]} /> */}
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={Number(item.soTien).toLocaleString()} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.daThanhToan != 1 ? <strong className='text-danger'>
                        <i className='fa fa-clock-o mr-1'></i>Chưa thanh toán
                    </strong> : <strong className='text-success'>
                        <i className='fa fa-check mr-1'></i>Đã thanh toán
                    </strong>} />
                    <TableCell type='text' content={item.daKeKhaiThongTin != 1 ? <>
                        <strong className='text-warning'>
                            <i className='fa fa-exclamation mr-1'></i>Chưa kê khai thông tin
                        </strong><br />
                    </> : <>
                        <strong className='text-success'>
                            <i className='fa fa-check mr-1'></i>Đã kê khai thông tin
                        </strong>
                    </>} />
                </tr>
            )
        });
        return this.renderPage({
            title: 'Đăng ký tham gia bảo hiểm y tế',
            icon: 'fa fa-medkit',
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Đăng ký tham gia bảo hiểm y tế'
            ],
            content: <>
                <SvDangKyMoiModal ref={e => this.dangKyMoiModal = e} canDangKy={canDangKy} />
                <DangKyModal ref={e => this.chiTietDienDong = e} />
                <BaoHiemInfoAdminModal ref={e => this.editModal = e} />
                <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <div><h3>Lịch sử đăng ký</h3></div>
                        {!!canDangKy && <button className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.thanhToanBhyt()}>Thanh toán</button>}
                        <QR_Modal ref={e => this.qrModal = e} />
                    </div>
                    {table}
                </div>
                {canDangKy ? <ComponentBhytInfo /> : <div className='tile'>
                    <strong className='text-danger'><i className='fa fa-exclamation mr-1'></i>Hiện tại chưa có đợt đăng ký Bảo hiểm y tế nào đang mở</strong>
                </div>}
            </>,
            backRoute: '/user'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svManageBhyt: state.student.svManageBhyt });
const mapActionsToProps = { getSvBaoHiemYTeThongTin, createSvBaoHiemYTe, updateStudentUser, huyDangKySvBaoHiemYTe };
export default connect(mapStateToProps, mapActionsToProps)(SinhVienManageBhytPage);