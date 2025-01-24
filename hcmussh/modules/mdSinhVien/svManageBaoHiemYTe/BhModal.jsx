import { SelectAdapter_DmCoSoKcbBhyt } from 'modules/mdDanhMuc/dmCoSoKcbBhyt/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmQuanHeGiaDinh } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormDatePicker, FormImageBox, FormRichTextBox, FormSelect, FormTextBox, getValue, renderTable, TableCell, loadSpinner } from 'view/component/AdminPage';
import { updateSvBaoHiemYTeBhyt, createSvBaoHiemYTe, getSvBaoHiemYTeLichSuDangKy, getSvBaoHiemYTeThongTin } from './redux';
import { Img } from 'view/component/HomePage';
import { SelectAdapter_DmDienDongBhyt } from 'modules/mdCongTacSinhVien/svDmDienDongBhyt/redux';

function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
class BaoHiemInfoAdminModal extends AdminModal {
    state = {
        isLoading: true, dienDong: null, canEdit: 0, canDangKy: false, canUpdate: 0, coMaBhyt: true, filePath: null, isGiaHan: false, thoiGianBatDau: null, thoiGianKetThuc: null, maDotDangKy: null, timeLine: [], dataThanhVien: [], dataChuHo: {}, addIndex: null
    };

    componentDidMount() {
        this.disabledClickOutside();
    }

    // onShow = () => {}

    onShow = (item) => {
        this.getThongTinBaoHiemYTe(item);
    };

    getThongTinBaoHiemYTe = (item) => {
        this.setState({ isLoading: true }, () => {
            this.props.getSvBaoHiemYTeLichSuDangKy(item.id, (data) => {
                const { dataSinhVien } = data;
                const { thoiGianBatDau, thoiGianKetThuc, ma } = dataSinhVien.currentDotDangKy ? dataSinhVien.currentDotDangKy : { thoiGianBatDau: null, thoiGianKetThuc: null, ma: null };
                this.setState({ isLoading: false, dataSinhVien: dataSinhVien, coMaBhyt: true, canEdit: dataSinhVien.canEdit, thoiGianBatDau, thoiGianKetThuc, maDotDangKy: ma, thongTinDotDangKy: dataSinhVien.currentDotDangKy, lichSuDangKy: dataSinhVien.lichSuDangKy, dienDong: item.dienDong, filePath: dataSinhVien.lichSuDangKy ? (dataSinhVien.lichSuDangKy.matTruocThe || null) : null }, () => {
                    this.setState({ canUpdate: 1 }, () => {
                        if (this.state.lichSuDangKy) {
                            this.setThongTinBoSung(this.state.lichSuDangKy);
                        }
                    });
                });
            });
        });
    };

    setThongTinBoSung = (item) => {
        const { maDotDangKy } = this.state;
        if (item.dienDong == 0) {
            this.maBhxhHienTai?.value(item.maBhxhHienTai || '');
            this.setState({ filePath: item.matTruocThe }, () =>
                this.matTruocThe.setData(`BHYTSV_FRONT:${maDotDangKy}`, this.state.filePath ? `/api/sv/bhyt/front?filePath=${this.state.filePath.split('/')[3]}&maDot=${this.state.filePath.split('/')[1]}&t=${new Date().getTime()}` : '')
            );
        } else {
            if (!item.maBhxhHienTai && item.dataChuHo) {
                this.setState({
                    coMaBhyt: false, dataThanhVien: item.dataThanhVien?.map((item, index) => {
                        item.indexItem = index;
                        return item;
                    })
                }, () => {
                    this.noiKhamChuaBenh?.value(item.benhVienDangKy || '');
                    if (item.dataChuHo) {
                        const { dataChuHo } = item;
                        this.isHaveMaBhyt?.value(1);
                        this.hoTenChuHo?.value(dataChuHo.hoTenChuHo || '');
                        this.cccdChuHo?.value(dataChuHo.cccdChuHo || '');
                        this.diaChiChuHo?.value(dataChuHo.maTinhChuHo || '', dataChuHo.maHuyenChuHo || '', dataChuHo.maXaChuHo || '', dataChuHo.soNhaChuHo || '');
                        this.dienThoaiChuHo?.value(dataChuHo.dienThoaiChuHo ? dataChuHo.dienThoaiChuHo : '');
                        this.ngaySinhChuHo?.value(dataChuHo.ngaySinhChuHo || '');
                        this.maHoGiaDinh?.value(dataChuHo.maHoGiaDinh || '');
                    }
                });
            } else {
                this.maBhxhHienTai?.value(item.maBhxhHienTai || '');
                this.noiKhamChuaBenh?.value(item.benhVienDangKy || '');
            }
        }
    };

    handleSize = (value) => {
        if (value && value.toString().length > 10) {
            this.maBhxhHienTai?.value(value.toString().substring(0, 10));
        }
    };

    handleSizeBhxh = (value, key) => {
        if (value && value.toString().length > 10) {
            this[key]?.value(value.toString().substring(0, 10));
        }
    };

    handleSizeMaHoGiaDinh = () => {
        const text = this.maHoGiaDinh.value();
        if (text && text.toString().length > 15) {
            this.maHoGiaDinh?.value(text.toString().substring(0, 15));
        }
    }

    handleSizeCccd = (value, key) => {
        if (value && value.toString().length > 12) {
            this[key]?.value(value.toString().substring(0, 12));
        }
    };

    handleSizeSdtCaNhan = (value, ref) => {
        if (value && value.toString().length > 10) {
            this[ref]?.value(value.toString().substring(0, 10));
        }
    };

    handleCheckBenhVien = (value) => {
        if (value.loaiDangKy == 1 && this.state.coMaBhyt == false) {
            T.notify(`${value.ten} không cho phép đăng ký mới. Vui lòng chọn cơ sở khác!`, 'danger');
            this.noiKhamChuaBenh?.value(null);
        } else if (value.loaiDangKy == 1 && this.state.coMaBhyt == true) {
            T.confirm('Lưu ý', `${value.ten} chỉ cho phép gia hạn đối với những thẻ BHYT đã đăng ký trước đó, không chấp nhận đăng ký mới hay đổi nơi khám chữa bệnh`, false, isConfirm => {
                if (!isConfirm) {
                    this.noiKhamChuaBenh?.value(null);
                }
            });
        }
    };

    componentThongTinCoBan = (isDone) => {
        const { lichSuDangKy, canUpdate } = this.state;
        return (
            <>
                <p className='tile-title font-weight-bold text-primary'>Lịch sử đăng ký</p>
                {!isDone ? <div className='row tile-body'>
                    <FormTextBox type='text' className='col-md-4' ref={e => this.hoTen = e} label='Họ và tên' required readOnly />
                    <FormTextBox type='text' className='col-md-4' ref={e => this.mssv = e} label='MSSV' required readOnly />
                    <FormTextBox type='text' className='col-md-4' ref={e => this.cmnd = e} label='CCCD/CMND' required readOnly />
                    <FormSelect ref={e => this.lichSuDienDong = e} label={'Diện tham gia BHYT'} placeholder='Diện đăng ký BHYT' className='col-md-4' data={SelectAdapter_DmDienDongBhyt} required
                        readOnly />
                    {lichSuDangKy?.dienDong != 0 ? <p className='col-md-4'>Tình trạng: <strong className={lichSuDangKy?.isThanhToan ? 'text-success' : 'text-danger'}>{lichSuDangKy?.isThanhToan ? <>
                        <i className='fa fa-check mr-1'></i>Đã thanh toán
                    </> : <>
                        <i className='fa fa-clock-o mr-1'></i>Chưa thanh toán
                    </>}</strong></p> : null}
                    {(canUpdate && !lichSuDangKy?.isThanhToan) ? <div className='col-md-12 text-center'>
                        {/* {(this.state.canEdit) ? <button className='btn btn-info mr-2' onClick={e => this.updateStudent(e)}>Cập nhật thông tin</button> : null} */}
                        <button className='btn btn-danger' onClick={e => {
                            e.preventDefault();
                            T.confirm('Xác nhận hủy đăng ký BHYT', 'Tất cả thông tin đăng ký sẽ bị hủy. Bạn có chắc bạn muốn hủy đăng ký BHYT!', isConfirm => isConfirm && this.props.huyDangKySvBaoHiemYTe(lichSuDangKy?.id, () => {
                                this.getThongTinBaoHiemYTe();
                                this.props.onUnComplete();
                            }));
                        }}><i className='fa fa-lg fa-times' /> Hủy/Chuyển đăng ký
                        </button>
                    </div> : null}
                </div> : null}
            </>
        );
    };

    thanhVienCell = () => this.state.dataThanhVien.map((item, index) =>
        <tr key={index}>
            <TableCell type='number' style={{ textAlign: 'center' }} content={item.indexItem + 1} />
            <TableCell content={item.hoTen} />
            <TableCell type='date' content={parseInt(item.ngaySinh)} dateFormat='dd/mm/yyyy' />
            <TableCell content={item.cccd} />
            <TableCell content={item.tenGioiTinh}></TableCell>
            <TableCell content={item.tenMoiQuanHeChuHo} />
            <TableCell content={item.maSoBhxh} />
            <TableCell content={item.sdtCaNhan} />
            <TableCell content={item.tenPhuongXa ? `${item.tenPhuongXa}, ${item.tenQuanHuyen}, ${item.tenTinhThanhPho}` : ''} />
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
                        this.gioiTinh?.value('0' + item.gioiTinh);
                        this.noiCapKhaiSinh?.value(item.maTinhNoiCapKhaiSinh, item.maHuyenNoiCapKhaiSinh, item.maXaNoiCapKhaiSinh);
                    })
                }
                onDelete={() => this.setState({ dataThanhVien: this.state.dataThanhVien.filter((item) => item.indexItem != index).map((item, index) => ({ ...item, indexItem: index })) })}
            />
        </tr>
    );

    getDataThanhVien = (indexItem) => {
        try {
            let data = {};
            const { maTinhThanhPho: maTinhNoiCapKhaiSinh, maQuanHuyen: maHuyenNoiCapKhaiSinh, maPhuongXa: maXaNoiCapKhaiSinh } = this.noiCapKhaiSinh?.value(),
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
            } else {
                let tenGioiTinh = this.gioiTinh.data().text,
                    tenMoiQuanHeChuHo = this.moiQuanHeChuHo.data().text;
                data = Object.assign({}, data, { maTinhNoiCapKhaiSinh, maHuyenNoiCapKhaiSinh, maXaNoiCapKhaiSinh, tenPhuongXa, tenQuanHuyen, tenTinhThanhPho, tenGioiTinh, tenMoiQuanHeChuHo, indexItem });
                data.ngaySinh = getValue(this.ngaySinh).getTime();
                return data;
            }
        }
        catch (error) {
            T.notify('Vui lòng điền đủ các thông tin bắt buộc!', 'danger');
            return false;
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
                            })
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

    elementPhuLucGiaDinh = () => {
        let dataThanhVien = this.state.dataThanhVien || [];
        return (
            <div>
                <div className='row'>
                    <h4 className='col-12' style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                        PHỤ LỤC THÀNH VIÊN HỘ GIA ĐÌNH
                    </h4>
                    <h5 className='col-12'>1. Thông tin chủ hộ</h5>
                    <FormTextBox ref={(e) => (this.hoTenChuHo = e)} label='Họ và tên chủ hộ' className='col-md-3' required />
                    <FormDatePicker type='date-mask' ref={(e) => (this.ngaySinhChuHo = e)} label='Ngày sinh chủ hộ' className='col-md-3' required />
                    <FormTextBox ref={(e) => (this.cccdChuHo = e)} label='CMND/CCCD chủ hộ' className='col-md-3' onChange={e => this.handleSizeCccd(e.target.value, 'cccdChuHo')} required />
                    <FormTextBox ref={(e) => (this.dienThoaiChuHo = e)} label='Số điện thoại chủ hộ' className='col-md-3' required
                        onChange={e => this.handleSizeSdtCaNhan(e.target.value, 'dienThoaiChuHo')} />

                    <ComponentDiaDiem label='Địa chỉ chủ hộ' ref={(e) => (this.diaChiChuHo = e)} className='form-group col-md-12' requiredSoNhaDuong />
                    <FormTextBox ref={e => this.maHoGiaDinh = e}
                        label={<span>Mã số hộ gia đình <a href={'https://baohiemxahoi.gov.vn/tracuu/Pages/tra-cuu-ho-gia-dinh.aspx'} target='_blank' rel='noreferrer'>(Tra cứu)</a></span>}
                        placeholder={'Mã số hộ gia đình'}
                        className='col-md-12'
                        smallText='Nếu như không có mã hộ gia đình phải kê khai bảng 2 đầy đủ.'
                        onChange={() => this.handleSizeMaHoGiaDinh()} />
                    <h5 className='col-12'>2. Bảng thông tin thành viên hộ gia đình:</h5>
                    <div className='col-12 my-3'>
                        {renderTable({
                            getDataSource: () => (dataThanhVien.length ? dataThanhVien : []),
                            emptyTable: 'Chưa có dữ liệu thành viên',
                            header: 'thead-light',
                            renderHead: () => (
                                <tr>
                                    <th style={{ width: 'auto' }}>STT</th>
                                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>CMND/CCCD/Hộ chiếu</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mối quan hệ với <br /> chủ hộ </th>
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
                                </>
                            )
                        })}
                    </div>
                    <div className='col-md-12'>
                        {this.state.addIndex != null ? (this.state.addIndex == dataThanhVien.length ? this.addCell(dataThanhVien.length) : this.addCell(this.state.addIndex)) : null}
                    </div>
                    {this.state.canUpdate ? <div className='form-group col-md-12' style={{ textAlign: 'center', display: this.state.addIndex == null ? '' : 'none' }}>
                        <button className='btn btn-success mr-2' type='button' onClick={e => this.handleUpdateBhyt(e)}>
                            <i className='fa fa-sm fa-save' /> Lưu thông tin
                        </button>
                        <button className='btn btn-info' type='button' onClick={(e) => e.preventDefault() || this.setState({ addIndex: dataThanhVien.length })}>
                            <i className='fa fa-sm fa-plus' /> Thêm thành viên
                        </button>
                    </div> : null}
                </div>
            </div>
        );
    };

    addCell = (index) => (
        <div className='row'>
            <FormTextBox ref={(e) => (this.hoTen = e)} label='Họ và tên thành viên' className='col-md-4' required />
            <FormDatePicker type='date-mask' ref={(e) => (this.ngaySinh = e)} label='Ngày sinh' className='col-md-4' required />
            <FormTextBox ref={(e) => (this.cccd = e)} label='CMND/CCCD/Hộ chiếu' className='col-md-4' onChange={e => this.handleSizeCccd(e.target.value, 'cccd')} required />
            <FormSelect ref={(e) => (this.gioiTinh = e)} label='Giới tính' data={SelectAdapter_DmGioiTinhV2} className='col-md-2'
                required />
            <FormSelect ref={(e) => (this.moiQuanHeChuHo = e)} label='Quan hệ với chủ hộ' data={SelectAdapter_DmQuanHeGiaDinh} className='col-md-2' required />
            <FormTextBox ref={(e) => (this.maSoBhxh = e)} label='Mã số BHXH (nếu có)' className='col-md-4'
                onChange={(e) => this.handleSizeBhxh(e.target.value, 'maSoBhxh')} />
            <FormTextBox ref={(e) => (this.sdtCaNhan = e)} label='Số điện thoại' className='col-md-4'
                onChange={(e) => this.handleSizeSdtCaNhan(e.target.value, 'sdtCaNhan')} />
            <ComponentDiaDiem ref={(e) => (this.noiCapKhaiSinh = e)} placeholder='Nơi cấp khai sinh' label='Nơi cấp khai sinh' className='col-md-12' />
            <FormRichTextBox ref={(e) => (this.ghiChu = e)} label='Ghi chú' className='col-md-12' />
            <div className='form-group col-md-12' style={{ textAlign: 'center' }}>
                <button className='btn btn-success mr-1' type='button' onClick={(e) => e.preventDefault() || this.updateThanhVien(false, index)}>
                    <i className='fa fa-lg fa-check' /> Thêm thành viên
                </button>
                <button className='btn btn-danger' type='button' onClick={(e) => e.preventDefault() || this.setState({ addIndex: null })}>
                    <i className='fa fa-lg fa-trash' /> Hủy
                </button>
            </div>
        </div>
    );

    onSuccess = (data) => {
        this.setState({ filePath: data.image }, () => {
            T.notify('Upload thành công', 'success');
            this.matTruocThe.setData(`BHYTSV_FRONT:${this.state.maDotDangKy}`, this.state.filePath ? `/api/sv/bhyt/front?filePath=${this.state.filePath.split('/')[3]}&maDot=${this.state.filePath.split('/')[1]}&t=${new Date().getTime()}` : '');
        });
    };

    getDataChuHo = () => {
        const { soNhaDuong: soNhaChuHo, maQuanHuyen: maHuyenChuHo, maPhuongXa: maXaChuHo, maTinhThanhPho: maTinhChuHo } = this.diaChiChuHo.value();
        if (!(soNhaChuHo && maHuyenChuHo && maTinhChuHo && maXaChuHo)) {
            return ({ error: 'Địa chỉ chủ hộ bị trống' });
        } else if (!this.hoTenChuHo?.value()) {
            this.hoTenChuHo?.focus();
            return ({ error: 'Họ tên chủ hộ bị trống' });
        } else if (!this.ngaySinhChuHo?.value()) {
            this.ngaySinhChuHo?.focus();
            return ({ error: 'Ngày sinh chủ hộ bị trống' });
        } else if (!this.dienThoaiChuHo?.value()) {
            this.dienThoaiChuHo?.focus();
            return ({ error: 'Số điện thoại chủ hộ bị trống' });
        } else if (!this.cccdChuHo?.value()) {
            this.cccdChuHo?.focus();
            return ({ error: 'CCCD/CMND chủ hộ bị trống' });
        }
        const dataChuHo = {
            hoTenChuHo: getValue(this.hoTenChuHo),
            dienThoaiChuHo: getValue(this.dienThoaiChuHo),
            ngaySinhChuHo: Number(this.ngaySinhChuHo?.value()),
            maHoGiaDinh: getValue(this.maHoGiaDinh),
            cccdChuHo: getValue(this.cccdChuHo),
            soNhaChuHo,
            maXaChuHo,
            maHuyenChuHo,
            maTinhChuHo
        };
        let thanhVien = this.state.dataThanhVien;
        if (thanhVien.length == 0) {
            return ({ error: 'Danh sách thành viên hộ gia đình trống!' });
        }
        return {
            dataChuHo,
            dataThanhVien: thanhVien
        };
    };

    handleUpdateBhyt = (e) => {
        const { dienDong, filePath, coMaBhyt, lichSuDangKy } = this.state;
        try {
            e.preventDefault();
            const thongTinBoSung = {
                maBhxhHienTai: coMaBhyt ? getValue(this.maBhxhHienTai) : null,
                benhVienDangKy: dienDong != 0 ? getValue(this.noiKhamChuaBenh) : null,
                matTruocThe: dienDong == 0 ? filePath : null,
                coBhxh: coMaBhyt ? 1 : 0
            };
            if (!coMaBhyt && dienDong != 0) {
                const dataChuHo = this.getDataChuHo();
                if (dataChuHo.error) {
                    T.notify(dataChuHo.error, 'danger');
                    return;
                } else {
                    thongTinBoSung.dataChuHo = dataChuHo.dataChuHo;
                    thongTinBoSung.dataThanhVien = dataChuHo.dataThanhVien;
                }
            }
            if (dienDong == 0 && !filePath) {
                T.notify('Vui lòng bổ sung hình ảnh mặt trước thẻ BHYT hiện tại', 'danger');
            } else {
                T.confirm('Lưu thông tin', 'Bạn có chắc muốn lưu thông tin bổ sung cho BHYT', isConfirm => isConfirm && this.props.updateSvBaoHiemYTeBhyt(lichSuDangKy?.id, thongTinBoSung, () => {
                    this.getThongTinBaoHiemYTe({ dienDong, id: lichSuDangKy.id });
                    this.props.getSvBaoHiemYTeThongTin();
                }));
            }
        }
        catch (error) {
            console.error(error);
            T.notify(`${error.props?.placeholder} bị trống!`, 'danger');
        }
    };

    setThongTinChuHo = (item) => {
        this.setState({
            dataThanhVien: item.dataThanhVien?.map((item, index) => {
                item.indexItem = index;
                return item;
            })
        }, () => {
            this.noiKhamChuaBenh?.value(item.benhVienDangKy || '');
            if (item.dataChuHo) {
                const { dataChuHo } = item;
                this.isHaveMaBhyt?.value(1);
                this.hoTenChuHo?.value(dataChuHo.hoTenChuHo || '');
                this.cccdChuHo?.value(dataChuHo.cccdChuHo || '');
                this.diaChiChuHo?.value(dataChuHo.maTinhChuHo || '', dataChuHo.maHuyenChuHo || '', dataChuHo.maXaChuHo || '', dataChuHo.soNhaChuHo || '');
                this.dienThoaiChuHo?.value(dataChuHo.dienThoaiChuHo ? dataChuHo.dienThoaiChuHo : '');
                this.ngaySinhChuHo?.value(dataChuHo.ngaySinhChuHo || '');
                this.maHoGiaDinh?.value(dataChuHo.maHoGiaDinh || '');
            }
        });
    }

    componentThongTinBoSungBhyt = () => {
        const { dienDong, filePath, maDotDangKy, thoiGianKetThuc } = this.state;
        return (
            <div className='col-md-12'>
                <p className='font-weight-bold text-primary'>Kê khai thông tin BHYT {thoiGianKetThuc ? <span className='text-danger'>(Đến ngày <span><i
                    className='fa fa-clock-o mr-1'></i>{formatDateFromTimestamp(thoiGianKetThuc)}</span>)</span> : ''}</p>
                <div className='row align-items-center'>
                    {dienDong != 0 && <FormCheckbox className='col-md-12 my-2' ref={e => this.isHaveMaBhyt = e} label='Vui lòng chọn nếu sinh viên chưa có mã BHYT/đăng ký tham gia BHYT lần đầu'
                        onChange={() => this.setState({ coMaBhyt: !this.state.coMaBhyt }, () => {
                            // const { thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha } = this.state.dataSinhVien;
                            // this.diaChiChuHo?.value(thuongTruMaTinh || '', thuongTruMaHuyen || '', thuongTruMaXa || '', thuongTruSoNha || '');
                            if (!this.state.coMaBhyt)
                                this.setThongTinChuHo(this.state.lichSuDangKy);
                            else {
                                this.maBhxhHienTai?.value(this.state.lichSuDangKy?.maBhxhHienTai || '');
                                this.noiKhamChuaBenh?.value(this.state.lichSuDangKy?.benhVienDangKy || '');
                            }

                        })} />}
                    <div className={`col-md-${(this.state.coMaBhyt && this.state.dienDong != 0) ? '8' : '12'}`}>
                        <div className='row'>
                            {this.state.coMaBhyt &&
                                <FormTextBox ref={e => this.maBhxhHienTai = e}
                                    label={<span>Nhập mã số BHXH hay 10 số cuối trên thẻ BHYT <a href={'https://baohiemxahoi.gov.vn/tracuu/Pages/tra-cuu-ho-gia-dinh.aspx'} target='_blank'
                                        rel='noreferrer'>(Tra cứu)</a></span>} placeholder='Mã số BHXH hay 10 số cuối thẻ BHYT'
                                    className='col-md-12'
                                    required
                                    readOnly={''} onChange={e => this.handleSizeBhxh(e.target.value, 'maBhxhHienTai')} />}
                            {dienDong != 0 && <FormSelect ref={e => this.noiKhamChuaBenh = e} label='Đăng ký nơi khám chữa bệnh' placeholder='Đăng ký nơi khám chữa bệnh'
                                className='col-md-12 input-group'
                                data={SelectAdapter_DmCoSoKcbBhyt(0)} required readOnly={''} onChange={this.handleCheckBenhVien} />}
                            {(dienDong == 0) ? <>
                                <div className='col-md-8'>
                                    <FormImageBox label={filePath ? 'Thẻ BHYT hiện tại' : 'Nhấp hoặc kéo ảnh vào khung dưới để tải lên mặt trước thẻ BHYT hiện tại'} ref={e => this.matTruocThe = e}
                                        uploadType='BHYTSV_FRONT'
                                        userData={`BHYTSV_FRONT:${maDotDangKy}`} boxUploadStye={{ borderRadius: '10px' }} height='200px' onSuccess={this.onSuccess}
                                        description={
                                            <div>
                                                Độ lớn của file ảnh <b className='text-danger'>không quá 1MB</b>. Giảm kích thước file ảnh tại{' '}
                                                <u> <a href='https://www.iloveimg.com/compress-image' target='_blank' rel='noreferrer'>
                                                    đây
                                                </a></u>
                                            </div>
                                        } />
                                </div>
                                {this.state.coMaBhyt && <div className='col-md-4 text-center'>
                                    <h6 className='font-weight-bold'>Ảnh mẫu thẻ BHYT</h6>
                                    <Img style={{ width: '100%', height: 'auto' }} src={'https://bhyt.hcmussh.edu.vn/TheBHYTMT_example.png'} alt='Ảnh mặt trước thẻ BHYT' />
                                </div>}
                            </> : <>
                                <div className='col-md-12 mb-3'>
                                    <div className='row'>
                                        {!this.state.coMaBhyt && <div className='col-md-12'>
                                            {this.elementPhuLucGiaDinh()}
                                        </div>}
                                    </div>
                                </div>
                            </>}
                            {(this.state.coMaBhyt && this.state.canUpdate) &&
                                <div className='col-md-12 text-center'>
                                    <button className='btn btn-success' type='button' onClick={e => this.handleUpdateBhyt(e)}>
                                        <i className='fa fa-save' /> Hoàn tất kê khai
                                    </button>
                                </div>}
                        </div>
                    </div>
                    {(this.state.coMaBhyt && this.state.dienDong != 0) && <div className='col-md-4 text-center'>
                        <Img style={{ width: '100%', height: 'auto' }} src={'https://bhyt.hcmussh.edu.vn/TheBHYTMT_example.png'} alt='Ảnh mặt trước thẻ BHYT' />
                        <h6 className='font-weight-bold'>Ảnh mẫu thẻ BHYT</h6>
                    </div>}
                </div>
            </div>
        );
    };

    render = () => {
        return this.renderModal({
            title: (
                <>
                    Hoàn thành thông tin BHYT <br />
                </>
            ),
            size: 'elarge',
            isLoading: this.state.isLoading,
            body: <>
                <div className='row'>
                    {!this.state.isLoading ? this.componentThongTinBoSungBhyt() : <div className='col-md-12'>{loadSpinner()}</div>}
                </div>
            </>,
            isShowSubmit: false
        });
    };
}
const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = {
    updateSvBaoHiemYTeBhyt, createSvBaoHiemYTe, getSvBaoHiemYTeLichSuDangKy, getSvBaoHiemYTeThongTin
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoHiemInfoAdminModal);
