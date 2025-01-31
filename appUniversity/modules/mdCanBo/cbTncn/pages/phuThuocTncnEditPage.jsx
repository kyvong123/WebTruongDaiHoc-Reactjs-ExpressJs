import React from 'react';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTextBox, TableCell, renderDataTable } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { getPhieuDangKyDetail, createNguoiPhuThuoc, deleteNguoiPhuThuoc, updateNguoiPhuThuoc } from '../redux';
import FileBoxHidden from '../components/FileBoxHidden';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';

class LoaiPhuThuocComponent extends React.Component {
    resetAll = () => {
        ['cmndMatTruoc1', 'cmndMatSau1', 'giayKhaiSinh1', 'cnhssv1',
            'cmndMatTruoc2', 'cmndMatSau2', 'giayKhaiSinh2', 'xacNhanThuNhap2', 'soHoKhau2', 'giayKetHon2', 'minhChungKhac2',
            'cmndMatTruoc3', 'cmndMatSau3', 'giayChungNhanQuanHe3', 'xacNhanThuNhap3', 'minhChungKhac3'
        ].forEach(item => {
            this?.[item]?.reset();
        });
    }
    submit = ({ id, idDangKy }) => {
        if (this.props.loaiPhuThuoc && this.props.loaiPhuThuoc == 1) {
            this.cmndMatTruoc1.isValid() && this.cmndMatTruoc1.onUploadFile({ id, idDangKy });
            this.cmndMatSau1.isValid() && this.cmndMatSau1.onUploadFile({ id, idDangKy });
            this.giayKhaiSinh1.isValid() && this.giayKhaiSinh1.onUploadFile({ id, idDangKy });
            this.cnhssv1.isValid() && this.cnhssv1.onUploadFile({ id, idDangKy });
        } else if (this.props.loaiPhuThuoc && this.props.loaiPhuThuoc == 2) {
            this.cmndMatTruoc2.isValid() && this.cmndMatTruoc2.onUploadFile({ id, idDangKy });
            this.cmndMatSau2.isValid() && this.cmndMatSau2.onUploadFile({ id, idDangKy });
            this.giayKhaiSinh2.isValid() && this.giayKhaiSinh2.onUploadFile({ id, idDangKy });
            this.xacNhanThuNhap2.isValid() && this.xacNhanThuNhap2.onUploadFile({ id, idDangKy });
            this.soHoKhau2.isValid() && this.soHoKhau2.onUploadFile({ id, idDangKy });
            this.giayKetHon2.isValid() && this.giayKetHon2.onUploadFile({ id, idDangKy });
            this.minhChungKhac2.isValid() && this.minhChungKhac2.onUploadFile({ id, idDangKy });
        } else if (this.props.loaiPhuThuoc && this.props.loaiPhuThuoc == 3) {
            this.cmndMatTruoc3.isValid() && this.cmndMatTruoc3.onUploadFile({ id, idDangKy });
            this.cmndMatSau3.isValid() && this.cmndMatSau3.onUploadFile({ id, idDangKy });
            this.giayChungNhanQuanHe3.isValid() && this.giayChungNhanQuanHe3.onUploadFile({ id, idDangKy });
            this.xacNhanThuNhap3.isValid() && this.xacNhanThuNhap3.onUploadFile({ id, idDangKy });
            this.minhChungKhac3.isValid() && this.minhChungKhac3.onUploadFile({ id, idDangKy });
        }
    }
    objectPhuThuoc = {
        '1': <div className='row'>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>Giấy khai sinh:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='giayKhaiSinh'
                        ref={e => this.giayKhaiSinh1 = e}
                        className='col-md-4'
                        label='Tải lên giấy khai sinh'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>CCCD/CMND mặt trước:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='cmndMatTruoc'
                        ref={e => this.cmndMatTruoc1 = e}
                        className='col-md-4'
                        label='Tải lên CCCD/CMND mặt trước'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>CCCD/CMND mặt sau:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='cmndMatSau'
                        ref={e => this.cmndMatSau1 = e}
                        className='col-md-4'
                        label='Tải lên CCCD/CMND mặt sau'></FileBoxHidden>
                </div>
            </div>
            <div className="col-md-12 mt-3">
                <div className="row">
                    <b className='col-md-4'>Giấy chứng nhận học sinh/sinh viên:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='chungNhanHssv'
                        ref={e => this.cnhssv1 = e}
                        className='col-md-4'
                        label='Chứng nhận Hs/Sv'></FileBoxHidden>
                </div>
            </div>
        </div>,
        '2': <div className='row'>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>Giấy khai sinh:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='giayKhaiSinh'
                        ref={e => this.giayKhaiSinh2 = e}
                        className='col-md-4'
                        label='Tải lên giấy khai sinh'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>CCCD/CMND mặt trước:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='cmndMatTruoc'
                        ref={e => this.cmndMatTruoc2 = e}
                        className='col-md-4'
                        label='Tải lên CCCD/CMND mặt trước'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>CCCD/CMND mặt sau:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='cmndMatSau'
                        ref={e => this.cmndMatSau2 = e}
                        className='col-md-4'
                        label='Tải lên CCCD/CMND mặt sau'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>Giấy xác nhận thu nhập:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='xacNhanThuNhap'
                        ref={e => this.xacNhanThuNhap2 = e}
                        className='col-md-4'
                        label='Tải lên CCCD/CMND mặt sau'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>Sổ hộ khẩu:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='soHoKhau'
                        ref={e => this.soHoKhau2 = e}
                        className='col-md-4'
                        label='Tải lên CCCD/CMND mặt sau'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>Giấy kết hôn:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='giayKetHon'
                        ref={e => this.giayKetHon2 = e}
                        className='col-md-4'
                        label='Giấy kết hôn'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>Minh chứng khác:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='minhChungKhac'
                        ref={e => this.minhChungKhac2 = e}
                        className='col-md-4'
                        label='Minh chứng khác'></FileBoxHidden>
                </div>
            </div>
        </div>,
        '3': <div className='row'>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>Giấy chứng nhận quan hệ:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='giayChungNhanQuanHe'
                        ref={e => this.giayChungNhanQuanHe3 = e}
                        className='col-md-4'
                        label='Tải lên giấy khai sinh'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>CCCD/CMND mặt trước:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='cmndMatTruoc'
                        ref={e => this.cmndMatTruoc3 = e}
                        className='col-md-4'
                        label='Tải lên CCCD/CMND mặt trước'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>CCCD/CMND mặt sau:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='cmndMatSau'
                        ref={e => this.cmndMatSau3 = e}
                        className='col-md-4'
                        label='Tải lên CCCD/CMND mặt sau'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>Giấy xác nhận thu nhập:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='xacNhanThuNhap'
                        ref={e => this.xacNhanThuNhap3 = e}
                        className='col-md-4'
                        label='Tải lên CCCD/CMND mặt sau'></FileBoxHidden>
                </div>
            </div>
            <div className='col-md-12 mt-3'>
                <div className="row">
                    <b className='col-md-4'>Minh chứng khác:</b>
                    <FileBoxHidden
                        uploadType='PhuThuocDetail'
                        userData='minhChungKhac'
                        ref={e => this.minhChungKhac3 = e}
                        className='col-md-4'
                        label='Minh chứng khác'></FileBoxHidden>
                </div>
            </div>
        </div>
    };
    render() {
        return <div className='px-4'>
            {this.props.loaiPhuThuoc && this.objectPhuThuoc[this.props.loaiPhuThuoc]}
        </div>;
    }
}
class EditModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
    }
    onShow = ({ idDangKy, item }) => {
        this.setState({ idDangKy });
        if (!item) {
            this.loaiPhuThuoc.value('');
            this.hoVaTen.value('');
            this.quanHeVoiNguoiNop.value('');
            this.ngaySinh.value('');
            this.quocTich.value('');
            this.cmnd.value('');
            this.ngayCap.value('');
            this.maSoThue.value('');
            this.thoiDiemBatDau.value('');
            this.thoiDiemKetThuc.value('');
            this.uploadMinhChung?.resetAll();
        } else {
            this.setState({ item }, () => {
                this.loaiPhuThuoc.value(item.loaiPhuThuoc);
                this.hoVaTen.value(item.hoVaTen);
                this.quanHeVoiNguoiNop.value(item.quanHeVoiNguoiNop);
                this.ngaySinh.value(item.ngaySinh);
                this.quocTich.value(item.quocTich);
                this.cmnd.value(item.cmnd);
                this.ngayCap.value(item.ngayCap);
                this.maSoThue.value(item.maSoThue);
                this.thoiDiemBatDau.value(item.thoiDiemBatDau);
                this.thoiDiemKetThuc.value(item.thoiDiemKetThuc);
                this.setState({ loaiPhuThuoc: item.loaiPhuThuoc }, () => {
                    this.uploadMinhChung?.resetAll();
                });
            });
        }
    };
    onSubmit = () => {
        const data = {
            idDangKy: this.state.idDangKy,
            loaiPhuThuoc: this.loaiPhuThuoc.value(),
            hoVaTen: this.hoVaTen.value(),
            quocTich: this.quocTich.value(),
            cmnd: this.cmnd.value(),
            ngayCap: this.ngayCap?.value()?.getTime(),
            quanHeVoiNguoiNop: this.quanHeVoiNguoiNop.value(),
            ngaySinh: this.ngaySinh.value()?.getTime(),
            thoiDiemBatDau: this.thoiDiemBatDau.value()?.getTime(),
            thoiDiemKetThuc: this.thoiDiemKetThuc.value()?.getTime(),
            maSoThue: this.maSoThue.value(),
        };
        this.props.createNguoiPhuThuoc(data, res => {
            this.uploadMinhChung.submit({ id: res.id, idDangKy: this.state.idDangKy });
            this.props.resetPage();
            this.hide();
        });
    }
    render = () => {
        const SelectAdapter_LoaiPhuThuoc = [
            { id: 1, text: 'NPT con cái' },
            { id: 2, text: 'NPT cha mẹ' },
            { id: 3, text: 'NPT khác' },
        ];
        return this.renderModal({
            title: 'Tạo mới nguời phụ thuộc',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormSelect ref={e => this.loaiPhuThuoc = e} className='col-md-6' placeholder='Loại phụ thuộc' label='Loại phụ thuộc' data={SelectAdapter_LoaiPhuThuoc} onChange={(value) => {
                        this.setState({ loaiPhuThuoc: value.id });
                    }} required></FormSelect>
                    <FormTextBox ref={e => this.quanHeVoiNguoiNop = e} className='col-md-6' placeholder='Quan hệ với người khai' label='Quan hệ với người khai' required></FormTextBox>
                    <FormTextBox ref={e => this.hoVaTen = e} className='col-md-6' placeholder='Họ và tên' label='Họ và tên' required></FormTextBox>
                    <FormDatePicker ref={e => this.ngaySinh = e} className='col-md-6' placeholder='Ngày sinh' label='Ngày sinh' required></FormDatePicker>
                    <FormSelect ref={e => this.quocTich = e} className='col-md-6' placeholder='Quốc tịch' label='Quốc tịch' data={SelectAdapter_DmQuocGia} required></FormSelect>
                    <FormTextBox ref={e => this.cmnd = e} className='col-md-6' placeholder='CMND/CCCD' label='CMND/CCCD' ></FormTextBox>
                    <FormDatePicker ref={e => this.ngayCap = e} className='col-md-6' placeholder='Ngày cấp' label='Ngày cấp' ></FormDatePicker>
                    <FormTextBox ref={e => this.maSoThue = e} className='col-md-6' placeholder='Mã số thuế' label='Mã số thuế' ></FormTextBox>
                    <FormDatePicker ref={e => this.thoiDiemBatDau = e} className='col-md-6' placeholder='Ngày bắt đầu' label='Ngày bắt đầu' required></FormDatePicker>
                    <FormDatePicker ref={e => this.thoiDiemKetThuc = e} className='col-md-6' placeholder='Ngày kết thúc' label='Ngày kết thúc' required></FormDatePicker>
                    <LoaiPhuThuocComponent ref={e => this.uploadMinhChung = e} loaiPhuThuoc={this.state.loaiPhuThuoc}></LoaiPhuThuocComponent>
                </div>
            </>
        });
    }
}
export class TcThuePhuThuocDetail extends AdminPage {
    componentDidMount() {
        const route = T.routeMatcher('/user/tncn/phu-thuoc/:id'),
            params = route.parse(window.location.pathname);
        this.setState({ id: params.id }, () => {
            this.props.getPhieuDangKyDetail(params.id, res => {
                this.setState({ items: res.items, nguoiKeKhai: res.nguoiKeKhai });
            });
        });

    }
    getPage = () => {
        this.props.getPhieuDangKyDetail(this.state.id, res => {
            this.setState({ items: res.items });
        });
    }
    deleteNguoiPhuThuoc = (id) => {
        T.confirm('Xóa người phụ thuộc', 'Bạn có chắc bạn muốn xóa người phụ thuộc này?', true,
            isConfirm => isConfirm && this.props.deleteNguoiPhuThuoc(id, () => {
                this.getPage();
            }));

    }
    render() {
        const table = renderDataTable({
            data: this.state.items || [],
            stickyHead: true,
            divStyle: { height: '75vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'left', whiteSpace: 'nowrap' }}>STT</th>
                    <th style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap' }}>Quốc tịch</th>
                    <th style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap' }}>Quan hệ với người nộp</th>
                    <th style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='number' content={`${index + 1}`} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={item.hoVaTen} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngaySinh, 'dd/mm/yy')} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={item.quocTich} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={item.quanHeVoiNguoiNop} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayTao, 'HH:MM dd/mm/yy')} />
                    <TableCell type='buttons' content={item} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <Tooltip title='Tải minh chứng' arrow>
                            <button className='btn btn-warning' onClick={(e) => {
                                e.preventDefault();
                                T.download(`/api/cb/tncn/phu-thuoc/download/detail/tai-minh-chung?id=${item.id}&idDangKy=${this.state.id}`);
                            }} >
                                <i className='fa fa-download' />
                            </button>
                        </Tooltip>
                        {this.state.nguoiKeKhai.trangThai == 'BAN_NHAP' && <Tooltip title='Chỉnh sửa' arrow>
                            <button className='btn btn-primary'
                                onClick={e => {
                                    e.preventDefault() || this.modal.show({
                                        item,
                                        idDangKy: this.state.id
                                    });
                                }}
                            >
                                <i className='fa fa-pencil-square-o' />
                            </button>
                        </Tooltip>}
                        {this.state.nguoiKeKhai.trangThai == 'BAN_NHAP' && <Tooltip title='Xóa' arrow>
                            {/* <a href={`/user/tncn/phu-thuoc/${item.id}`}> */}
                            <button className='btn btn-danger' onClick={(e) => {
                                e.preventDefault();
                                this.deleteNguoiPhuThuoc(item.id);
                            }}>
                                <i className='fa fa-trash' />
                            </button>
                            {/* </a> */}
                        </Tooltip>}
                    </TableCell>
                </tr >),
        });
        return this.renderPage({
            title: `Đăng ký thông tin người phụ thuộc Phiếu #${this.state?.nguoiKeKhai?.id}`,
            icon: 'fa fa-id-card-o',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/tncn'>Thu nhập cá nhân</Link>,
                'Kê khai thông tin người phụ thuộc'],
            content: <div className='tile'>
                <div className='d-flex justify-content-end my-2'>
                    <button className='btn btn-outline-primary' style={{ width: '100%', maxWidth: '200px' }}
                        disabled={this.state.nguoiKeKhai && this.state.nguoiKeKhai.trangThai !== 'BAN_NHAP'}
                        onClick={e => {
                            e.preventDefault() || this.modal.show({
                                idDangKy: this.state.id
                            });
                        }
                        }> Đăng ký mới</button>
                </div>
                {table}
                <EditModal
                    createNguoiPhuThuoc={this.props.createNguoiPhuThuoc}
                    updateNguoiPhuThuoc={this.props.updateNguoiPhuThuoc}
                    resetPage={() => this.getPage()}
                    ref={e => this.modal = e}></EditModal>
            </div>
        });
    }
}




const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getPhieuDangKyDetail, createNguoiPhuThuoc, deleteNguoiPhuThuoc, updateNguoiPhuThuoc };
export default connect(mapStateToProps, mapActionsToProps)(TcThuePhuThuocDetail);
