import { SelectAdapter_DmCoSoKcbBhyt } from 'modules/mdDanhMuc/dmCoSoKcbBhyt/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmQuanHeGiaDinh } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormDatePicker, FormImageBox, FormRichTextBox, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { updateSvBaoHiemYTeBhyt, createSvBaoHiemYTe } from './redux';
class SvDangKyMoiModal extends AdminModal {
    state = { id: null, coBhxh: false, dataThanhVien: [], isLoading: false, dataChuHo: {}, addIndex: null, isGiaHan: false };

    componentDidMount() {
        this.disabledClickOutside();
    }

    // onShow = () => {}

    onShow = (item) => {
        let { dienDong, id, dataChuHo, dataThanhVien, maBhxhHienTai, benhVienDangKy, giaHan } = item ? item : { dienDong: null, dataChuHo: {}, dataThanhVien: [], maBhxhHienTai: null, benhVienDangKy: null, giaHan: null };
        this.setState({ dienDong, id, coBhxh: maBhxhHienTai == null ? false : true, isGiaHan: giaHan == null || giaHan == 0 ? false : true }, () => {
            switch (dienDong) {
                case '0':
                    this.matTruocThe.setData(`BHYTSV_FRONT:${new Date().getFullYear()}_${id}`);
                    this.maBhxhHienTai.value(maBhxhHienTai);
                    break;
                case '12':
                case '15':
                    this.benhVienDangKy.value(benhVienDangKy ? benhVienDangKy : '');
                    if (maBhxhHienTai != null) {
                        this.matTruocThe.setData(`BHYTSV_FRONT:${new Date().getFullYear()}_${id}`);
                        this.maBhxhHienTai.value(maBhxhHienTai ? maBhxhHienTai : '');
                    } else {
                        if (dataChuHo) {
                            this.hoTenChuHo.value(dataChuHo.hoTenChuHo || '');
                            this.diaChiChuHo.value(dataChuHo.maTinhChuHo || '', dataChuHo.maHuyenChuHo || '', dataChuHo.maXaChuHo || '', dataChuHo.soNhaChuHo || '');
                            this.dienThoaiChuHo.value(dataChuHo.dienThoaiChuHo ? dataChuHo.dienThoaiChuHo : '');
                        } else {
                            this.hoTenChuHo.value('');
                            this.diaChiChuHo.value('', '', '', '');
                            this.dienThoaiChuHo.value('');
                        }
                    }
                    break;
                default:
                    break;
            }
        });
        this.setState({
            dataThanhVien: dataThanhVien?.map((item, index) => {
                item.indexItem = index;
                return item;
            }),
        });
    };

    handleSize = (value) => {
        if (value && value.toString().length > 10) {
            this.maBhxhHienTai.value(value.toString().substring(0, 10));
        }
    };

    handleSizeBhxh = (value) => {
        if (value && value.toString().length > 10) {
            this.maSoBhxh.value(value.toString().substring(0, 10));
        }
    };

    handleSizeSdtCaNhan = (value, ref) => {
        if (value && value.toString().length > 10) {
            this[ref].value(value.toString().substring(0, 10));
        }
    };

    handleSizeCccd = (value, key) => {
        if (value && value.toString().length > 12) {
            this[key]?.value(value.toString().substring(0, 12));
        }
    };

    toggleCheckBhxh = (e) => {
        e.preventDefault();
        this.setState({ coBhxh: !this.state.coBhxh });
    };

    addCell = (index) => (
        <tr key={index}>
            <TableCell type='number' content={index + 1} />
            <TableCell content={<FormTextBox ref={(e) => (this.hoTen = e)} placeholder='Họ và tên' style={{ marginBottom: 0, width: '200px' }} required />} />
            <TableCell content={<FormDatePicker type='date-mask' ref={(e) => (this.ngaySinh = e)} placeholder='Ngày sinh' style={{ marginBottom: 0, width: '100px' }} required />} />
            <TableCell content={<FormTextBox ref={(e) => (this.cccd = e)} placeholder='CMND/CCCD/Hộ chiếu' style={{ marginBottom: 0, width: '200px' }} onChange={e => this.handleSizeCccd(e.target.value, 'cccd')} required />} />
            <TableCell content={<FormSelect ref={(e) => (this.gioiTinh = e)} placeholder='Giới tính' data={SelectAdapter_DmGioiTinhV2} style={{ marginBottom: 0, width: '100px' }} required />} />
            <TableCell content={<FormSelect ref={(e) => (this.moiQuanHeChuHo = e)} placeholder='Quan hệ' data={SelectAdapter_DmQuanHeGiaDinh} style={{ marginBottom: 0, width: '100px' }} required />} />
            <TableCell content={<FormTextBox type='phone' ref={(e) => (this.maSoBhxh = e)} placeholder='Mã số BHXH' style={{ marginBottom: 0, width: '120px' }} onChange={e => this.handleSizeBhxh(e.target.value)} />} />
            <TableCell content={<FormTextBox ref={(e) => (this.sdtCaNhan = e)} placeholder='Số điện thoại cá nhân' style={{ marginBottom: 0, width: '120px' }} onChange={(e) => this.handleSizeSdtCaNhan(e.target.value, 'sdtCaNhan')} />} />
            <TableCell content={<ComponentDiaDiem ref={(e) => (this.noiCapKhaiSinh = e)} placeholder='Nơi cấp khai sinh' fullDisplay noLabel />} />
            <TableCell content={<FormRichTextBox ref={(e) => (this.ghiChu = e)} placeholder='Ghi chú' style={{ marginBottom: 0, width: '200px' }} />} />
            <TableCell style={{ textAlign: 'center' }} type='buttons'>
                <button className='btn btn-success' type='button' onClick={(e) => e.preventDefault() || this.updateThanhVien(false, index)}>
                    <i className='fa fa-lg fa-check' />
                </button>
                <button className='btn btn-danger' type='button' onClick={(e) => e.preventDefault() || this.setState({ addIndex: null })}>
                    <i className='fa fa-lg fa-trash' />
                </button>
            </TableCell>
        </tr>
    );

    getDataThanhVien = (indexItem) => {
        try {
            let data = {};
            const { maTinhThanhPho: maTinhNoiCapKhaiSinh, maQuanHuyen: maHuyenNoiCapKhaiSinh, maPhuongXa: maXaNoiCapKhaiSinh } = this.noiCapKhaiSinh.value(),
                { tenPhuongXa, tenQuanHuyen, tenTinhThanhPho } = this.noiCapKhaiSinh.getText();
            ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'gioiTinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach((key) => {
                if (key == 'gioiTinh') data[key] = parseInt(getValue(this[key]));
                else data[key] = getValue(this[key]);
            });
            if (data.maSoBhxh && data.maSoBhxh.toString().length != 10) {
                this.maSoBhxh.focus();
                T.notify('Mã số BHXH phải chứa 10 ký tự!', 'danger');
                return false;
            } else if (!data.cccd) {
                T.notify('Căn cước công dân bị trống!', 'danger');
                return false;
            }
            else {
                let tenGioiTinh = this.gioiTinh.data().text,
                    tenMoiQuanHeChuHo = this.moiQuanHeChuHo.data().text;
                data = Object.assign({}, data, { maTinhNoiCapKhaiSinh, maHuyenNoiCapKhaiSinh, maXaNoiCapKhaiSinh, tenPhuongXa, tenQuanHuyen, tenTinhThanhPho, tenGioiTinh, tenMoiQuanHeChuHo, indexItem });
                data.ngaySinh = getValue(this.ngaySinh).getTime();
                return data;
            }
        } catch (error) {
            T.notify('Vui lòng điền đầy đủ thông tin!', 'danger');
            return false;
        }
    };

    addThanhVien = (onSubmit = false, indexItem) => {
        const data = this.getDataThanhVien(indexItem),
            currentData = this.state.dataThanhVien;
        if (data) {
            this.setState({ addIndex: null });
            if (onSubmit) {
                return [...currentData, data];
            } else {
                if (currentData.some((item) => item.indexItem == indexItem)) {
                    for (let i = 0, n = currentData.length; i < n; i++) {
                        if (currentData[i].indexItem == data.indexItem) {
                            currentData.splice(i, 1, data);
                            break;
                        }
                    }
                    this.setState({ dataThanhVien: currentData }, () => {
                        ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'gioiTinh', 'ngaySinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach((key) => {
                            this[key]?.value('');
                        });
                    });
                } else {
                    this.setState({ dataThanhVien: [...this.state.dataThanhVien, data] }, () => {
                        ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'gioiTinh', 'ngaySinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach((key) => {
                            this[key]?.value('');
                        });
                    });
                }
            }
        }
    };

    updateThanhVien = (onSubmit = false, indexItem) => {
        const data = this.getDataThanhVien(indexItem),
            currentData = this.state.dataThanhVien;
        if (data) {
            this.setState({ addIndex: null });
            if (onSubmit) {
                return [...currentData, data];
            } else {
                if (currentData.some((item) => item.indexItem == indexItem)) {
                    this.setState(
                        {
                            dataThanhVien: this.state.dataThanhVien.map((item) => {
                                if (item.indexItem == indexItem) {
                                    item = { ...item, ...data };
                                }
                                return item;
                            }),
                        },
                        () => {
                            ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'gioiTinh', 'ngaySinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach((key) => {
                                this[key]?.value('');
                            });
                        }
                    );
                } else {
                    this.setState({ dataThanhVien: [...this.state.dataThanhVien, data] }, () => {
                        ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'gioiTinh', 'ngaySinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach((key) => {
                            this[key]?.value('');
                        });
                    });
                }
            }
        }
    };

    handleCheckBenhVien = (value) => {
        if (value.loaiDangKy == 1) {
            T.notify(`${value.ten} không cho phép đăng ký mới. Vui lòng chọn cơ sở khác!`, 'danger');
            this.benhVienDangKy.value(null);
        }
    };

    elementMienDong = () => {
        return (
            <div className='row'>
                <FormTextBox type='number' autoFormat={false} label='Nhập số BHXH hiện tại' className='col-md-6' smallText='10 chữ số cuối cùng trên thẻ BHYT' onChange={this.handleSize} ref={(e) => (this.maBhxhHienTai = e)} required />
                <FormImageBox
                    className='col-md-6'
                    ref={(e) => (this.matTruocThe = e)}
                    label={
                        <>
                            Ảnh <b>MẶT TRƯỚC</b> thẻ BHYT hiện tại
                        </>
                    }
                    uploadType='BHYTSV_FRONT'
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
        );
    };

    elementXacNhan = () => {
        return (
            <div className='row'>
                <FormTextBox type='number' autoFormat={false} label='Nhập số BHXH hiện tại' className='col-md-12' smallText='10 chữ số cuối cùng trên thẻ BHYT' onChange={this.handleSize} ref={(e) => (this.maBhxhHienTai = e)} required />
                <FormSelect ref={(e) => (this.benhVienDangKy = e)} label='Đăng ký nơi khám chữa bệnh ban đầu' className='col-md-12' data={SelectAdapter_DmCoSoKcbBhyt()} onChange={this.handleCheckBenhVien} required />
                <FormImageBox

                    className='col-md-12'
                    ref={(e) => (this.matTruocThe = e)}
                    label={
                        <>
                            Ảnh <b>MẶT TRƯỚC</b> thẻ BHYT hiện tại
                        </>
                    }
                    uploadType='BHYTSV_FRONT'
                    style={{ display: this.state.isGiaHan ? '' : 'none' }}
                    description={
                        <div>
                            Độ lớn của file ảnh <b className='text-danger'>không quá 1MB</b>. Giảm kích thước tại{' '}
                            <a href='https://www.iloveimg.com/compress-image' target='_blank' rel='noreferrer'>
                                đây
                            </a>
                        </div>
                    }
                />
            </div>
        );
    };

    thanhVienCell = () => this.state.dataThanhVien.map((item, index) =>
        this.state.addIndex == item.indexItem ? (
            this.addCell(item.indexItem)
        ) : (
            <tr key={index}>
                <TableCell type='number' content={item.indexItem + 1} />
                <TableCell content={item.hoTen} />
                <TableCell type='date' content={parseInt(item.ngaySinh)} dateFormat='dd/mm/yyyy' />
                <TableCell content={item.cccd} />
                <TableCell content={item.tenGioiTinh}></TableCell>
                <TableCell content={item.tenMoiQuanHeChuHo} />
                <TableCell content={item.maSoBhxh} />
                <TableCell content={item.sdtCaNhan} />
                <TableCell content={`${item.tenPhuongXa}, ${item.tenQuanHuyen}, ${item.tenTinhThanhPho}`} />
                <TableCell content={item.ghiChu} />
                <TableCell
                    type='buttons'
                    content={item}
                    permission={{ write: true, delete: true }}
                    onEdit={() =>
                        this.setState({ addIndex: item.indexItem }, () => {
                            ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'moiQuanHeChuHo', 'cccd', 'ghiChu', 'ngaySinh'].forEach((key) => {
                                this[key]?.value(item[key]);
                            });
                            this.gioiTinh.value('0' + item.gioiTinh);
                            this.noiCapKhaiSinh.value(item.maTinhNoiCapKhaiSinh, item.maHuyenNoiCapKhaiSinh, item.maXaNoiCapKhaiSinh);
                        })
                    }
                    onDelete={() => this.setState({ dataThanhVien: this.state.dataThanhVien.filter((item) => item.indexItem != index) })}
                />
            </tr>
        )
    );

    elementPhuLucGiaDinh = () => {
        let dataThanhVien = this.state.dataThanhVien;
        return (
            <div style={{ height: '70vh', overflow: 'scroll', margin: '0 20 0 20' }}>
                <div className='row'>
                    <FormSelect ref={(e) => (this.benhVienDangKy = e)} label='Đăng ký nơi khám chữa bệnh ban đầu' className='col-md-6' data={SelectAdapter_DmCoSoKcbBhyt(1)} required onChange={this.handleCheckBenhVien} />
                    <FormSelect ref={(e) => (this.dienDongBhxh = e)} label='Diện đăng ký bảo hiểm xã hội' className='col-md-6' data={[{ id: 12, text: 'Bảo hiểm y tế 12 tháng' }, { id: 15, text: 'Bảo hiểm y tế 15 tháng' }]} required onChange={(value) => this.setState({ dienDong: value.id })} />
                    <h5 className='col-12' style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        PHỤ LỤC THÀNH VIÊN HỘ GIA ĐÌNH
                    </h5>
                    <FormTextBox ref={(e) => (this.hoTenChuHo = e)} label='Họ và tên chủ hộ' className='col-md-3' required />
                    <FormDatePicker type='date-mask' ref={(e) => (this.ngaySinhChuHo = e)} label='Ngày sinh chủ hộ' className='col-md-3' required />
                    <FormTextBox ref={(e) => (this.cccdChuHo = e)} label='CMND/CCCD chủ hộ' className='col-md-3' onChange={e => this.handleSizeCccd(e.target.value, 'cccdChuHo')} required />
                    <FormTextBox type='phone' ref={(e) => (this.dienThoaiChuHo = e)} label='Số điện thoại chủ hộ' className='col-md-3' required onChange={e => this.handleSizeSdtCaNhan(e.target.value, 'dienThoaiChuHo')} />
                    <ComponentDiaDiem label='Địa chỉ chủ hộ' ref={(e) => (this.diaChiChuHo = e)} className='form-group col-md-12' requiredSoNhaDuong />
                    <div className='col-12'>Kê khai đầy đủ, chính xác các thành viên hộ gia đình:</div>
                    <div className='form-group col-12'>
                        {renderTable({
                            getDataSource: () => (dataThanhVien.length ? dataThanhVien : [{}]),
                            header: 'thead-light',
                            className: 'table-fix-col',
                            renderHead: () => (
                                <tr>
                                    <th style={{ width: 'auto' }}>STT</th>
                                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên <span className='text-danger'>*</span></th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh <span className='text-danger'>*</span></th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>CMND/CCCD/Hộ chiếu <span className='text-danger'>*</span></th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính <span className='text-danger'>*</span></th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                                        Mối quan hệ <br /> với chủ hộ <span className='text-danger'>*</span>
                                    </th>
                                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã số BHXH</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số điện thoại</th>
                                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi cấp giấy khai sinh</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            ),
                            renderRow: (
                                <>
                                    {dataThanhVien.length ? this.thanhVienCell() : null}
                                    {this.state.addIndex != null && this.state.addIndex == dataThanhVien.length ? this.addCell(dataThanhVien.length) : null}
                                </>
                            ),
                        })}
                    </div>
                    <div className='form-group col-md-12' style={{ textAlign: 'center', display: this.state.addIndex == null ? '' : 'none' }}>
                        <button className='btn btn-info' type='button' onClick={(e) => e.preventDefault() || this.setState({ addIndex: dataThanhVien.length })}>
                            <i className='fa fa-sm fa-plus' /> Thêm thành viên
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    onSubmit = (e, isComplete = false) => {
        e.preventDefault();
        let create = (data, done) => this.props.createSvBaoHiemYTe(data, done);
        T.confirm('XÁC NHẬN', 'Bạn cam đoan những nội dung kê khai là đúng và chịu trách nhiệm trước pháp luật về những nội dung đã kê khai', 'warning', true, (isConfirm) => {
            if (isConfirm) {
                this.setState({ isLoading: true });
                switch (this.state.dienDong) {
                    case '12':
                    case '15': {
                        const data = {
                            benhVienDangKy: getValue(this.benhVienDangKy),
                            dienDong: getValue(this.dienDongBhxh),
                            namDangKy: Number(new Date().getFullYear()) + 1,
                            coBhxh: 0,
                            giaHan: 0,
                            isComplete
                        };
                        const { soNhaDuong: soNhaChuHo, maQuanHuyen: maHuyenChuHo, maPhuongXa: maXaChuHo, maTinhThanhPho: maTinhChuHo } = this.diaChiChuHo.value();
                        if (!(soNhaChuHo && maHuyenChuHo && maTinhChuHo && maXaChuHo)) {
                            T.notify('Thông tin địa chỉ chủ hộ trống!', 'danger');
                            this.setState({ isLoading: false });
                            break;
                        } else if (!this.hoTenChuHo.value()) {
                            T.notify('Họ tên chủ hộ trống!', 'danger');
                            this.setState({ isLoading: false });
                            break;
                        } else if (!this.ngaySinhChuHo.value()) {
                            T.notify('Ngày sinh chủ hộ trống!', 'danger');
                            this.setState({ isLoading: false });
                            break;
                        } else if (!this.dienThoaiChuHo.value()) {
                            T.notify('Điện thoại chủ hộ trống!', 'danger');
                            this.setState({ isLoading: false });
                            break;
                        } else if (!this.cccdChuHo.value()) {
                            T.notify('Cccd/Cmnd chủ hộ trống!', 'danger');
                            this.setState({ isLoading: false });
                            break;
                        }
                        const dataChuHo = {
                            hoTenChuHo: getValue(this.hoTenChuHo),
                            dienThoaiChuHo: getValue(this.dienThoaiChuHo),
                            ngaySinhChuHo: Number(this.ngaySinhChuHo.value()),
                            cccdChuHo: getValue(this.cccdChuHo),
                            soNhaChuHo,
                            maXaChuHo,
                            maHuyenChuHo,
                            maTinhChuHo,
                        };
                        let thanhVien = this.state.dataThanhVien;
                        if (thanhVien.length == 0) {
                            T.notify('Danh sách thành viên phụ lục gia đình trống!', 'danger');
                            this.setState({ isLoading: false });
                            break;
                        }
                        create({ ...data, dataChuHo, dataThanhVien: thanhVien, coBhxh: Number(this.state.coBhxh) }, (result) => {
                            !result.error && this.hide();
                            this.setState({ isLoading: false });
                        });

                        break;
                    }
                    default:
                        T.notify('Vui lòng điền đầy đủ thông tin!', 'danger');
                        this.setState({ isLoading: false });
                        break;
                }
            }
        });
    };

    render = () => {
        // const user = this.props.system.user;
        let bodyToRender = <></>,
            subTitle = '';
        bodyToRender = this.elementPhuLucGiaDinh();
        subTitle = (
            <small>
                {this.state.dienDong ? <>Bạn đã đăng ký tham gia BHYT <b>{this.state.dienDong} tháng</b></> : 'Đăng ký mới BHYT'}
            </small>
        );
        return this.renderModal({
            title: (
                <>
                    Hoàn thành thông tin BHYT <br />
                    {subTitle}
                </>
            ),
            size: 'elarge',
            isLoading: this.state.isLoading,
            body: bodyToRender,
            // postButtons: user && user.permissions.includes('student:login') ? <button className='btn btn-success' onClick={e => this.onSubmit(e, true)}>
            //     <i className='fa fa-lg fa-check' />  Xác nhận hoàn thành
            // </button> : null,
            showCloseButton: true,
            isShowSubmit: this.props.canDangKy
        });
    };
}
const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = {
    updateSvBaoHiemYTeBhyt, createSvBaoHiemYTe
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SvDangKyMoiModal);
