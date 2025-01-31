import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createHopDongLaoDong, getQtHopDongLaoDongEdit, updateHopDongLaoDong, suggestSoHopDong } from './redux';
import { AdminPage, FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import { SelectApdater_DaiDienKy } from 'modules/mdTccb/qtChucVu/redux';
// import getDmDonVi from '../../mdDanhMuc/dmDonVi/redux';
import { downloadWord } from './redux';
import { getStaff } from '../tccbCanBo/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_TccbCanBo } from 'modules/mdTccb/tccbCapMaCanBo/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import { SelectAdapter_DmTrinhDoV2 } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmLoaiHopDongV2 } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_BacLuong_Filter } from 'modules/mdDanhMuc/dmNgachLuong/redux';
import { ComponentDiaChi } from './component/componentDiaChi';

class HDLD_Details extends AdminPage {
    state = { isCreate: false, canUpdate: false, updatingCanBo: false, khongThoiHan: 1 };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/hop-dong-lao-dong/:ma'),
                ma = route.parse(window.location.pathname).ma,
                mscb = T.getUrlParams(window.location.pathname)?.mscb;
            if (ma == 'new') this.setState({ isCreate: true, mscb }, () => this.initHopDong());
            else {
                this.setState({ ma });
                this.props.getQtHopDongLaoDongEdit(ma, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                    }
                    else {
                        this.initHopDong(data);
                    }
                });
            }
        });

        T.socket.on('updatedThongTinCanBo', () => {
            this.getDataCanBo();
        });
    }

    initHopDong = (data) => {
        if (!data) {
            this.props.suggestSoHopDong(data => {
                data.soHopDongSuggested && this.soHopDong.value(data.soHopDongSuggested + '/' + new Date().getFullYear() + '/HĐLĐ-XHNV-TCCB');
            });
            this.ngayKy.value(new Date().getTime());
            this.state.mscb && this.canBo.value(this.state.mscb, this.getDataCanBo);
        }
        else {
            this.soHopDong.value(data.soHopDong || '');
            this.ngayKy.value(data.ngayKyHopDong || '');
            this.daiDien.value(data.nguoiKy || '');
            this.canBo.value(data.nguoiDuocThue || '', this.getDataCanBo);
            SelectAdapter_DmLoaiHopDongV2.fetchOne(data.loaiHopDong, lhd => {
                this.loaiHopDong.value(data.loaiHopDong || '');
                this.setState({ khongThoiHan: lhd?.khongThoiHan ?? 1 });
            });
            this.tuNgay.value(data.batDauLamViec ? new Date(data.batDauLamViec) : '');
            this.denNgay.value(data.ketThucHopDong ? new Date(data.ketThucHopDong) : '');
            this.batDauLamViec.value(data.batDauLamViec ? new Date(data.batDauLamViec) : '');
            this.ngayKyTiepTheo.value(data.ngayKyHdTiepTheo ? new Date(data.ngayKyHdTiepTheo) : '');
            this.setState({ ngayBatDau: data.batDauLamViec, ngayKetThuc: data.ketThucHopDong, ngayTaiKy: data.ngayKyHdTiepTheo });
            this.donVi.value(data.diaDiemLamViec || '');
            SelectAdapter_DmNgachCdnnV2.fetchOne(data.maNgach, ngach => {
                this.chucDanhChuyenMon.value(data.maNgach || '');
                this.setState({ nhomLuong: ngach?.nhomLuong || '', bacLuong: data.bac || '' }, () => {
                    this.bacLuong.value(data.bac || '');
                    this.heSoLuong.value(data.heSo || '');
                });
            });

            for (let [index, mucHuong] of data.mucHuongLuong.entries()) {
                if (index > 1) break;
                this.setState({ [`mucHuong_${index}`]: mucHuong.phanTramHuong }, () => {
                    this[`phanTramHuong_${index}`].value(mucHuong.phanTramHuong || '');
                    this[`batDauHuong_${index}`].value(mucHuong.batDau ? new Date(mucHuong.batDau) : '');
                    this[`ketThucHuong_${index}`].value(mucHuong.ketThuc ? new Date(mucHuong.ketThuc) : '');
                });
            }
        }
    };

    downloadWord = (maHd) => {
        this.props.downloadWord(maHd, (data) => {
            T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.filename);
        });
    };

    getDataCanBo = () => {
        this.setState({ canUpdate: false, mscb: null }, () => {
            this.gioiTinh.value('');
            this.quocTich.value('');
            this.danToc.value('');
            this.tonGiao.value('');
            this.cmnd.value('');
            this.cmndNgayCap.value('');
            this.cmndNoiCap.value('');
            this.email.value('');
            this.dienThoai.value('');
            this.ngaySinh.value('');
            this.noiSinh.value('', '', '');
            this.nguyenQuan.value('', '', '');
            this.thuongTru.value('', '', '', '');
            this.cuTru.value('', '', '', '');
            this.hocVi.value('');
            this.hocViChuyenNganh.value('');

            const mscb = this.canBo.value();
            mscb && this.props.getStaff(mscb, data => {
                data = data.item;
                if (data) {
                    this.setState({ mscb });
                    this.setState({ canUpdate: true });
                    this.gioiTinh.value(data.phai || (data.gioiTinh == 1 ? '01' : '00') || '');
                    this.quocTich.value(data.quocGia || '');
                    this.danToc.value(data.danToc || '');
                    this.tonGiao.value(data.tonGiao || '');
                    this.cmnd.value(data.cmnd || '');
                    this.cmndNgayCap.value(data.cmndNgayCap || '');
                    this.cmndNoiCap.value(data.cmndNoiCap || '');
                    this.email.value(data.email || data.emailTruong || '');
                    this.dienThoai.value(data.dienThoaiCaNhan || '');
                    this.ngaySinh.value(data.ngaySinh || '');
                    this.noiSinh.value(data.maTinhNoiSinh, data.maHuyenNoiSinh, data.maXaNoiSinh);
                    this.nguyenQuan.value(data.maTinhNguyenQuan, data.maHuyenNguyenQuan, data.maXaNguyenQuan);
                    this.thuongTru.value(data.thuongTruMaTinh, data.thuongTruMaHuyen, data.thuongTruMaXa, data.thuongTruSoNha);
                    this.cuTru.value(data.hienTaiMaTinh, data.hienTaiMaHuyen, data.hienTaiMaXa, data.hienTaiSoNha);
                    this.hocVi.value(data.hocVi || '');
                    this.hocViChuyenNganh.value(data.chuyenNganh || '');
                }
            });
        });
    }

    saveHopDong = () => {
        let data = {
            soHopDong: this.soHopDong.value() || '',
            ngayKyHopDong: T.dateToNumber(this.ngayKy.value() || ''),
            nguoiKy: this.daiDien.value() || '',
            nguoiDuocThue: this.canBo.value() || '',
            loaiHopDong: this.loaiHopDong.value() || '',
            batDauLamViec: T.dateToNumber(this.batDauLamViec.value() || ''),
            ketThucHopDong: T.dateToNumber(this.denNgay.value() || '', 23, 59, 59, 999),
            ngayKyHdTiepTheo: T.dateToNumber(this.ngayKyTiepTheo.value() || ''),
            diaDiemLamViec: this.donVi.value() || '',
            maNgach: this.chucDanhChuyenMon.value() || '',
            bac: this.bacLuong.value() || '',
            heSo: this.heSoLuong.value() || '',
            mucHuongLuong: [{ phanTramHuong: this.phanTramHuong_0.value(), batDau: T.dateToNumber(this.batDauHuong_0.value() || ''), ketThuc: T.dateToNumber(this.ketThucHuong_0.value() || '', 23, 59, 59, 999) }]
        };

        if (!data.soHopDong) {
            this.soHopDong.focus();
            return T.notify('Số hợp đồng không được trống!', 'danger');
        }
        if (!data.ngayKyHopDong) {
            this.ngayKy.focus();
            return T.notify('Ngày ký hợp đồng không được trống!', 'danger');
        }
        if (!data.nguoiKy) {
            this.daiDien.focus();
            return T.notify('Người ký không được trống!', 'danger');
        }
        if (!data.nguoiDuocThue) {
            this.canBo.focus();
            return T.notify('Cán bộ được thuê không được trống!', 'danger');
        }
        if (!this.state.canUpdate) {
            this.canBo.focus();
            return T.notify('Dữ liệu cán bộ không hợp lệ!', 'danger');
        }
        if (!data.loaiHopDong) {
            this.loaiHopDong.focus();
            return T.notify('Loại hợp đồng không được trống!', 'danger');
        }
        if (!data.batDauLamViec) {
            this.tuNgay.focus();
            return T.notify('Ngày bắt đầu không được trống!', 'danger');
        }
        if (!this.state.khongThoiHan && !data.ketThucHopDong) {
            this.denNgay.focus();
            return T.notify('Ngày kết thúc không được trống!', 'danger');
        }
        if (!this.state.khongThoiHan && !data.ngayKyHdTiepTheo) {
            this.ngayKyTiepTheo.focus();
            return T.notify('Ngày tái ký không được trống!', 'danger');
        }
        if (!data.diaDiemLamViec) {
            this.donVi.focus();
            return T.notify('Địa điểm làm việc không được trống!', 'danger');
        }
        if (!data.maNgach) {
            this.chucDanhChuyenMon.focus();
            return T.notify('Chức danh chuyên môn không được trống!', 'danger');
        }
        if (!data.bac) {
            this.bacLuong.focus();
            return T.notify('Bậc lương không được trống!', 'danger');
        }
        if (!this.phanTramHuong_0.value()) {
            this.phanTramHuong_0.focus();
            return T.notify('Mức hưởng lương đầu tiên không được trống!', 'danger');
        }

        // if (this.state.mucHuong_1) {
        //     if (!this.ketThucHuong_0.value() || !this.batDauHuong_1.value()) {
        //         this.ketThucHuong_0.focus();
        //         return T.notify('Ngày kết thúc mức lương không được trống!', 'danger');
        //     }
        //     data.mucHuongLuong.push({ phanTramHuong: this.phanTramHuong_1.value(), batDau: T.dateToNumber(this.batDauHuong_1.value() || ''), ketThuc: T.dateToNumber(this.ketThucHuong_1.value() || '', 23, 59, 59, 999) });
        // }

        if (this.state.isCreate) {
            let dataCanBo = {
                phai: this.gioiTinh.value(),
                quocGia: this.quocTich.value(),
                danToc: this.danToc.value(),
                tonGiao: this.tonGiao.value(),
                cmnd: this.cmnd.value(),
                cmndNgayCap: T.dateToNumber(this.cmndNgayCap.value() || ''),
                cmndNoiCap: this.cmndNoiCap.value(),
                email: this.email.value(),
                dienThoaiCaNhan: this.dienThoai.value(),
                ngaySinh: T.dateToNumber(this.ngaySinh.value() || ''),
                hocVi: this.hocVi.value(),
                chuyenNganh: this.hocViChuyenNganh.value(),
                maDonVi: this.donVi.value() || '',
                ngayBatDauCongTac: T.dateToNumber(this.batDauLamViec.value() || '')
            };

            const { phuongXa: maXaNoiSinh, quanHuyen: maHuyenNoiSinh, tinhThanh: maTinhNoiSinh } = this.noiSinh.value();
            const { phuongXa: maXaNguyenQuan, quanHuyen: maHuyenNguyenQuan, tinhThanh: maTinhNguyenQuan } = this.nguyenQuan.value();
            const { soNha: thuongTruSoNha, phuongXa: thuongTruMaXa, quanHuyen: thuongTruMaHuyen, tinhThanh: thuongTruMaTinh } = this.thuongTru.value();
            const { soNha: hienTaiSoNha, phuongXa: hienTaiMaXa, quanHuyen: hienTaiMaHuyen, tinhThanh: hienTaiMaTinh } = this.cuTru.value();

            dataCanBo = {
                ...dataCanBo,
                maXaNoiSinh, maHuyenNoiSinh, maTinhNoiSinh,
                maXaNguyenQuan, maHuyenNguyenQuan, maTinhNguyenQuan,
                thuongTruSoNha, thuongTruMaXa, thuongTruMaHuyen, thuongTruMaTinh,
                hienTaiSoNha, hienTaiMaXa, hienTaiMaHuyen, hienTaiMaTinh
            };
            T.confirm('Tạo hợp đồng lao động', `Xác nhận tạo hợp đồng cho cán bộ ${this.canBo.data()?.text}?`, true, isConfirm => {
                isConfirm && this.props.createHopDongLaoDong(data, dataCanBo, () => this.props.history.push('/user/tccb/hop-dong-lao-dong'));
            });
        }
        else {
            T.confirm('Cập nhật hợp đồng lao động', `Xác nhận cập nhật thông tin hợp đồng cho cán bộ ${this.canBo.data()?.text}?`, true, isConfirm => {
                isConfirm && this.props.updateHopDongLaoDong(this.state.ma, data);
            });
        }
    }

    render() {
        let permissions = this.getUserPermission('tccbHopDongLaoDong'),
            readOnly = !permissions || !permissions.write;

        return this.renderPage({
            icon: 'fa fa-briefcase',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/hop-dong-lao-dong'>Danh sách hợp đồng</Link>,
                'Hợp đồng cán bộ'
            ],
            title: this.state.isCreate ? 'Tạo mới hợp đồng lao động' : 'Chỉnh sửa hợp đồng lao động',
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'THÔNG TIN CHUNG'}</h4>
                        <div className='col-md-12'><hr style={{ margin: '0 0 1rem 0', padding: 0 }} /></div>
                        <FormTextBox ref={e => this.soHopDong = e} label='Số hợp đồng' className='col-md-4' required maxLength={100} readOnly={readOnly} />
                        <FormDatePicker ref={e => this.ngayKy = e} className='col-md-4' type='date-mask' label='Ngày ký' required readOnly={readOnly} />
                        <FormSelect ref={e => this.daiDien = e} data={SelectApdater_DaiDienKy} className='col-md-4' label='Đại diện ký' required />
                    </div>
                </div>

                <div className='tile'>
                    <div className='tile-body row'>
                        <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'THÔNG TIN NGƯỜI LAO ĐỘNG'}</h4>
                        <div className='col-md-12'><hr style={{ margin: '0 0 1rem 0', padding: 0 }} /></div>
                        <FormSelect ref={e => this.canBo = e} label='Cán bộ' data={SelectAdapter_TccbCanBo} className='col-md-12' onChange={this.getDataCanBo} allowClear readOnly={!this.state.isCreate} required />
                        <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' data={SelectAdapter_DmGioiTinhV2} className='col-lg-3 col-md-6' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <FormSelect ref={e => this.quocTich = e} data={SelectAdapter_DmQuocGia} className='col-lg-3 col-md-6' label='Quốc tịch' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <FormSelect ref={e => this.danToc = e} data={SelectAdapter_DmDanTocV2} className='col-lg-3 col-md-6' label='Dân tộc' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <FormSelect ref={e => this.tonGiao = e} data={SelectAdapter_DmTonGiaoV2} className='col-lg-3 col-md-6' label='Tôn giáo' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <FormTextBox ref={e => this.cmnd = e} className='col-lg-3 col-md-6' label='CMND/CCCD' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <FormDatePicker ref={e => this.cmndNgayCap = e} className='col-lg-3 col-md-6' type='date-mask' label='Ngày cấp' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <FormTextBox ref={e => this.cmndNoiCap = e} className='col-lg-6 col-md-12' label='Nơi cấp' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <FormTextBox ref={e => this.email = e} label='Email trường' className='col-md-8' readOnly={!this.state.isCreate} disabled={!this.state.mscb} />
                        <FormTextBox ref={e => this.dienThoai = e} label='Số điện thoại' className='col-md-4' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <FormDatePicker ref={e => this.ngaySinh = e} className='col-md-4' type='date-mask' label='Ngày sinh' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <ComponentDiaChi ref={e => this.noiSinh = e} label='Nơi sinh' className='col-md-8' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <ComponentDiaChi ref={e => this.nguyenQuan = e} label='Nguyên quán' className='col-md-12' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <ComponentDiaChi ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='col-md-12' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required soNha />
                        <ComponentDiaChi ref={e => this.cuTru = e} label='Địa chỉ hiện tại' className='col-md-12' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required soNha />
                        <FormSelect ref={e => this.hocVi = e} data={SelectAdapter_DmTrinhDoV2} label='Trình độ học vị' className='col-md-6' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <FormTextBox ref={e => this.hocViChuyenNganh = e} label='Chuyên ngành' className='col-md-6' readOnly={!this.state.isCreate} disabled={!this.state.mscb} required />
                        <div className='col-md-12'><hr style={{ margin: '0 0 1rem 0', padding: 0 }} /></div>
                    </div>
                </div>

                <div className='tile'>
                    <div className='tile-body row'>
                        <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'THÔNG TIN ĐIỀU KHOẢN'}</h4>
                        <div className='col-md-12'><hr style={{ margin: '0 0 1rem 0', padding: 0 }} /></div>

                        <FormSelect ref={e => this.loaiHopDong = e} data={SelectAdapter_DmLoaiHopDongV2} className='col-md-12' label='Loại hợp đồng lao động' required onChange={value => {
                            !this.state.mucHuong_0 && this.setState({ mucHuong_0: 100 }, () => this.phanTramHuong_0.value(100));
                            this.setState({ khongThoiHan: value?.khongThoiHan ?? 1 }, () => {
                                if (this.state.khongThoiHan) {
                                    this.denNgay.value('');
                                    this.ngayKyTiepTheo.value('');
                                    if (!this.state.mucHuong_1) {
                                        this.ketThucHuong_0.value('');
                                    }
                                    else {
                                        this.ketThucHuong_1.value('');
                                    }
                                }
                            });
                        }} />
                        <FormDatePicker ref={e => this.tuNgay = e} className='col-md-6' type='date-mask' label='Hiệu lực từ ngày' required readOnly={readOnly} disabled={!this.loaiHopDong?.value()} onChange={ngayBatDau => {
                            this.setState({ ngayBatDau });
                            this.batDauLamViec.value(ngayBatDau);
                            this.batDauHuong_0.value(ngayBatDau);
                        }} />
                        <FormDatePicker ref={e => this.denNgay = e} className='col-md-6' type='date-mask' label='Đến ngày' required={!this.state.khongThoiHan} disabled={this.state.khongThoiHan} onChange={ngayKetThuc => {
                            const ngayTaiKy = ngayKetThuc ? new Date(new Date(ngayKetThuc).getTime() + (1000 * 60 * 60 * 24)) : '';

                            this.ngayKyTiepTheo.value(ngayTaiKy);
                            this.setState({ ngayKetThuc, ngayTaiKy }, () => {
                                if (!this.state.mucHuong_1) {
                                    this.ketThucHuong_0.value(ngayKetThuc);
                                }
                                else {
                                    this.ketThucHuong_1.value(ngayKetThuc);
                                }
                            });
                        }} />
                        <FormDatePicker ref={e => this.batDauLamViec = e} className='col-md-6' type='date-mask' label='Ngày bắt đầu làm việc' required disabled />
                        <FormDatePicker ref={e => this.ngayKyTiepTheo = e} className='col-md-6' type='date-mask' label='Ngày tái ký' required={!this.state.khongThoiHan} disabled={this.state.khongThoiHan} onChange={ngayTaiKy => this.setState({ ngayTaiKy })} />
                        <div className='col-md-12'><hr style={{ margin: '0 0 1rem 0', padding: 0 }} /></div>

                        {/* <div className='col-md-12'><hr style={{ margin: '0 0 1rem 0', padding: 0 }} /></div> */}
                        <FormSelect ref={e => this.donVi = e} data={SelectAdapter_DmDonVi} className='col-md-12' label='Địa điểm làm việc' readOnly={readOnly} required />
                        <FormSelect ref={e => this.chucDanhChuyenMon = e} data={SelectAdapter_DmNgachCdnnV2} className='col-md-6' label='Chức danh chuyên môn' required
                            onChange={value => this.setState({ nhomLuong: value.nhomLuong }, () => {
                                this.bacLuong.value('');
                                this.heSoLuong.value('');
                            })} />
                        <FormSelect ref={e => this.bacLuong = e} label='Bậc lương' className='col-md-3' data={SelectAdapter_BacLuong_Filter(this.state.nhomLuong)} onChange={value => this.setState({ bacLuong: value.bac }, () => this.heSoLuong.value(value.heSo))} required disabled={!this.state.nhomLuong} />
                        <FormTextBox type='number' step={0.01} ref={e => this.heSoLuong = e} label='Hệ số lương' className='col-md-3' required decimalScale={2} disabled />
                        <div className='col-md-12'><hr style={{ margin: '0 0 1rem 0', padding: 0 }} /></div>

                        <FormTextBox type='number' ref={e => this.phanTramHuong_0 = e} label='Mức hưởng (%)' className='col-md-2' required disabled={!this.loaiHopDong?.value()} onChange={phanTram => this.setState({ mucHuong_0: phanTram })} />
                        <FormDatePicker ref={e => this.batDauHuong_0 = e} className='col-md-5' type='date-mask' label='Hưởng từ ngày' required disabled />
                        <FormDatePicker ref={e => this.ketThucHuong_0 = e} className='col-md-5' type='date-mask' label='Đến ngày' required={!this.state.khongThoiHan} disabled={!this.state.mucHuong_1} onChange={ngayKetThuc => this.state.mucHuong_1 && this.batDauHuong_1.value(ngayKetThuc ? new Date(new Date(ngayKetThuc).getTime() + (1000 * 60 * 60 * 24)) : '')} />
                        <FormTextBox type='number' ref={e => this.phanTramHuong_1 = e} label='Mức hưởng (%)' className='col-md-2' required={this.state.mucHuong_1} disabled={!this.loaiHopDong?.value()} onChange={phanTram => {
                            if (!phanTram) {
                                this.setState({ mucHuong_1: undefined });
                                this.ketThucHuong_0.value(this.state.ngayKetThuc);
                                this.batDauHuong_1.value('');
                                this.ketThucHuong_1.value('');
                            }
                            else {
                                this.setState({ mucHuong_1: phanTram });
                                this.ketThucHuong_0.value('');
                                this.ketThucHuong_1.value(this.state.ngayKetThuc);
                            }
                        }} />
                        <FormDatePicker ref={e => this.batDauHuong_1 = e} className='col-md-5' type='date-mask' label='Hưởng từ ngày' required={this.state.mucHuong_1} disabled />
                        <FormDatePicker ref={e => this.ketThucHuong_1 = e} className='col-md-5' type='date-mask' label='Đến ngày' required={!this.state.khongThoiHan && this.state.mucHuong_1} disabled />
                    </div>
                </div>
            </>,
            backRoute: '/user/tccb/hop-dong-lao-dong',
            onSave: !readOnly ? this.saveHopDong : null,
            buttons: [{ type: 'warning', icon: 'fa-file-word-o', className: 'btn-warning' + (this.state.isCreate ? ' d-none' : ''), tooltip: 'Tải xuống hợp đồng', onClick: e => e.preventDefault() || this.downloadWord(this.state.ma) }]
        });
    }

}

const mapStateToProps = state => ({ system: state.system, tccbHopDongLaoDong: state.tccb.tccbHopDongLaoDong });
const mapActionsToProps = {
    getQtHopDongLaoDongEdit, getStaff, createHopDongLaoDong, updateHopDongLaoDong, suggestSoHopDong, downloadWord
};
export default connect(mapStateToProps, mapActionsToProps)(HDLD_Details);