import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormRichTextBox, FormTextBox, FormSelect, FormCheckbox, FormDatePicker, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { updateThiSinh, SelectAdapter_BmdkMonThiNgoaiNgu, SelectAdapter_ChkttsNganh, SelectAdapter_BmdkDanToc, SelectAdapter_BmdkDoiTuongUuTien, preCheckTargetPhanHe } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { getSdhTsThongTinBieuMau } from 'modules/mdSauDaiHoc/sdhTsThongTinBieuMau/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_CstvDmQuocGia } from 'modules/mdCongTacSinhVien/ctsvDmQuocGia/redux';
import { getSdhTsThiSinhProfile, copyHsdk, huyDangKy, triggerPhanHe, deleteSdhTsDangKyNgoaiNgu, deleteSdhTsNgoaiNguByIdThiSinh, deleteSdhTsDeTaiByIdThiSinh } from './redux';
import { ComponentDiaDiem } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/section/ComponentDiaDiem';
import { SelectAdapter_DotThiTS } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import { SelectAdapter_HinhThuc } from 'modules/mdSauDaiHoc/sdhTsHinhThuc/redux';
import { deleteSdhTsCbhd } from 'modules/mdSauDaiHoc/sdhTsCanBoHuongDan/redux';
import { NgoaiNguModal } from 'modules/mdSauDaiHoc/sdhTsNgoaiNgu/NgoaiNguModal';
import { DeTaiModal } from 'modules/mdSauDaiHoc/sdhTsDeTai/DeTaiModal';
import { BaiBaoModal } from 'modules/mdSauDaiHoc/sdhTsCongTrinhCbhd/BaiBaoModal';
import { BaiBaoTSModal } from 'modules/mdSauDaiHoc/sdhTsBaiBao/BaiBaoModal';
import { SelectAdapter_PhanHeMoDangKy } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { CopyHsdkModal } from './CopyHsdkModal';
import { OverlayLoading } from 'view/component/Pagination';
import { FormChildren } from './FormChildren';
import DataBaiBaoTs from './section/componentBaiBaoTs';
import DataDeTai from './section/componentDeTai';
import DataChungChi from './section/componentCcnn';
import T from 'view/js/common';

class ThiSinhTuyenSinhSdhPage extends AdminPage {
    state = {
        id: '',
        ttBieuMau: null,
        multiple: false,
        lock: false,
        active: '',
        data: [],
        tempBaiBao: [],
        tempCbhd: '',
        loading: false,
        isNotVn: false,
        onShow: { ttcb: true, qtdt: true, nn: true, deTai: true, sub: { old: true, new: false } }
    }
    selectLoaiTotNghiep = [{ id: 1, text: 'Trung bình' }, { id: 2, text: 'Trung bình khá' }, { id: 3, text: 'Khá' }, { id: 4, text: 'Giỏi' }, { id: 5, text: 'Xuất sắc' }];
    selectHeDaoTao = [{ id: 1, text: 'Chính quy' }, { id: 2, text: 'Không chính quy' }];
    componentDidMount() {
        T.ready('/user', () => {
            this.getData();
        });
    }
    //ko cho dổi phân hệ, chỉ đăng ký thêm, copy hồ sơ => nhưng khác phân hệ
    //chỉ cho phép xoá hồ sơ khi có 2 phân hệ trở lên, 1 phân hệ ko đc xoá, xoá trên sdh_ts_thong_tin_co_ban
    //trường hợp đổi email nhắc nhở người dùng đăng nhập bằng email khác + xoá email này trên fw user.

    getData = () => {
        this.props.getSdhTsThiSinhProfile(data => {
            let phanHe = data.length;
            if (phanHe > 1) {
                this.setState({ multiple: true, data, phanHeList: data.map(item => ({ id: item.dataCoBan.phanHe, text: item.dataCoBan.tenPhanHe })), loading: false, isNotVn: (/^[a-zA-Z]+$/).test((data[0].dataCoBan.noiSinh)) }, () => {
                    let userPhanHe = this.props.system.user.phanHe;
                    this.hsdk.value(userPhanHe);
                    this.onChangePhanHe({ id: userPhanHe });

                });
            } else if (phanHe == 1) {
                this.setState({ multiple: false, data, active: data[0].dataCoBan.phanHe, maHinhThuc: data[0].dataCoBan.hinhThuc, isNotVn: (/^[a-zA-Z]+$/).test((data[0].dataCoBan.noiSinh)) }, () => {
                    this.props.getSdhTsThongTinBieuMau(data[0].dataCoBan.phanHe, item => {
                        this.setState({ ttBieuMau: item, loading: false }, () => {
                            this.setVal(data);
                        });
                    });
                });
            } else {
                this.props.history.push('/sdh');
            }
        });
    }
    //refresh hồ sơ đang active
    refresh = () => {
        this.setState({ loading: true }, () => {
            let maPhanHe = this.state.active;
            this.props.getSdhTsThiSinhProfile(rs => {
                let data = rs.filter(item => item.dataCoBan?.phanHe == maPhanHe);
                this.props.getSdhTsThongTinBieuMau(data[0].dataCoBan.phanHe, item => {
                    this.setState({ ttBieuMau: item, loading: false, data: [...data, ...rs.filter(item => item.dataCoBan?.phanHe != maPhanHe)] }, () => {
                        this.setVal(data);
                    });
                });
            });
        });
    }
    onChangePhanHe = (value) => {
        let maPhanHe = value.id;
        this.setState({ active: maPhanHe, loading: true }, () => {
            let data = this.state.data.filter(item => item.dataCoBan.phanHe == maPhanHe);
            this.props.triggerPhanHe(maPhanHe);
            this.props.getSdhTsThongTinBieuMau(maPhanHe, item => {
                this.setState({ ttBieuMau: item, loading: false }, () => {
                    this.setVal(data);
                });
            });
        });
    }



    onChangeCheckbox = (value, type) => {
        const idThiSinh = this.state.data.find(item => item.dataCoBan.phanHe == this.state.active).id;
        if (!type) {
            T.confirm('Xác nhận đổi cách thức xét ngoại ngữ', 'Thao tác này sẽ xóa các nội dung liên quan ngoại ngữ?', true, isConfirm => {
                if (isConfirm) {
                    this.setState({ isCCNN: value }, () => {
                        if (value) {
                            this.props.deleteSdhTsDangKyNgoaiNgu(idThiSinh);
                            this.dknn?.value([]);
                        } else {
                            this.props.deleteSdhTsNgoaiNguByIdThiSinh(idThiSinh);
                        }
                    });
                }
                else this.optionNgoaiNgu.value(!value);
            });
        } else {
            this.setState({ isNotVn: value }, () => {
                this.noiSinh?.value('');
            });
        }

    }
    onChangeSelect = (value, type) => {
        const dataThiSinh = this.state.data.find(item => item.dataCoBan.phanHe == this.state.active);
        const { id: idThiSinh, dataCoBan } = dataThiSinh;
        const phanHe = value?.id || '';
        if (type == 'phanHe') {
            const changes = {
                dataCoBan: {
                    phanHe: phanHe,
                    idNganh: '',
                    maNganh: '',
                    hinhThuc: '',
                }
            };
            this.props.preCheckTargetPhanHe({ idDot: dataCoBan.idDot, email: dataCoBan.email }, phanHe, isExist => {
                if (isExist) {
                    this.phanHe.value(dataCoBan.phanHe);
                    return T.alert('Email đã được sử dụng trong phân hệ này', 'error', false, 1500);
                } else {
                    T.confirm('Đổi phân hệ', 'Xác nhận đổi phân hệ?', true, isConfirm => {
                        if (isConfirm) {
                            this.hinhThuc?.value('');
                            this.maNganh?.value('');
                            if (phanHe == '02' || phanHe == '04') {
                                if (this.state.active != '02' && this.state.active != '04') this.props.deleteSdhTsDeTaiByIdThiSinh(idThiSinh);
                            }
                            this.props.updateThiSinh(idThiSinh, changes, () => this.setState({ active: value.id }, () => this.refresh()));
                        }
                        else this.phanHe.value(dataCoBan.phanHe);
                    });
                }
            });

        }
        if (type == 'hinhThuc') {
            // const hinhThucOld = dataCoBan.hinhThuc;
            const changes = {
                dataCoBan: {
                    hinhThuc: value?.id || '',
                }
            };
            T.confirm('Đổi hình thức', 'Đổi hình thức sẽ xoá ngành đang có, xác nhận đổi?', true, isConfirm => {
                if (isConfirm) {
                    this.maNganh?.value('');
                    this.props.updateThiSinh(idThiSinh, changes, () => this.setState({ maHinhThuc: value?.id || '' }, () => this.maNganh.value('')));
                    // this.props.updateBackUpDiem(idThiSinh, hinhThucOld);
                }
                else this.hinhThuc.value(dataCoBan.hinhThuc);
            });

        }
        if (type == 'nganh') {
            let nganh = T.parse(value?.id, { ma: '', id: '' });
            let { ma: maNganh, id: idNganh } = nganh;
            const changes = {
                dataCoBan: { maNganh, idNganh }
            };
            this.props.updateThiSinh(idThiSinh, changes);
        }
    }

    setVal = (data) => {
        const { dataCoBan, dataVanBang, dataNgoaiNgu, dataDeTai } = data[0] ? data[0] : { dataCoBan: [], dataVanBang: null, dataNgoaiNgu: null, dataDeTai: null };
        const { isDeTai, isVanBangDh } = this.state.ttBieuMau ? this.state.ttBieuMau : { isVanBangDh: null, isDeTai: null, isBaiBao: null, isNgoaiNgu: null, isVanBangTs: null };
        const { onShow } = this.state;
        let isEdit = dataCoBan.isEdit;
        const { ccnn, dknn } = dataNgoaiNgu;
        const fixed = {
            tenDot: dataCoBan.tenDot,
        };
        for (let key in fixed) {
            this[key]?.value(fixed[key]);
        }
        if (dataCoBan) {
            const { maTinhThanhPho, maQuanHuyen, maPhuongXa, soNha: soNhaDuong } = dataCoBan;
            this.diaChi.value(maTinhThanhPho, maQuanHuyen, maPhuongXa, soNhaDuong);
            if (!(maTinhThanhPho && maPhuongXa && maQuanHuyen)) {
                T.notify('Địa chỉ liên hệ còn thiếu');
                this.diaChi.focus(Object.keys(dataCoBan).find(item => ['maTinhThanhPho', 'maQuanHuyen', 'maPhuongXa'].includes(item) && !dataCoBan[item]).split('ma').join('dm'));
            }
            for (let key in dataCoBan) {
                if (key == 'btkt') this[key]?.value(dataCoBan[key] == 1 ? true : false);
                else if (key == 'maNganh') this[key]?.value(dataCoBan['idNganh']);
                else if (key == 'noiSinh' || key == 'noiSinhQuocGia') {
                    let { noiSinh, noiSinhQuocGia } = dataCoBan;
                    if (!noiSinh && !noiSinhQuocGia) {
                        T.notify('Nơi sinh bị trống!', 'danger');
                    } else {
                        const isNotVn = noiSinhQuocGia ? true : false;
                        this.setState({ isNotVn }, () => {
                            this.isNotVn?.value(isNotVn);
                            this.noiSinh?.value(noiSinh || noiSinhQuocGia);
                        });
                    }
                }
                // if (['maTinhThanhPho', 'maQuanHuyen', 'maPhuongXa','idNganh'].includes(key)) continue;
                else if (['dienThoai', 'email', 'danToc', 'gioiTinh', 'ngaySinh'].includes(key) && !dataCoBan[key]) {
                    this.setState({ onShow: { ...onShow, ttcb: true } });
                    this[key]?.props?.label && T.notify(`${this[key]?.props?.label} bị trống!`, 'danger');
                    this[key].focus();
                } else this[key]?.value(dataCoBan[key] || '');
            }
        }
        if (dataVanBang) {
            for (let key in dataVanBang) {
                if (isVanBangDh && key.includes('Dh') && !dataVanBang[key]) {
                    if (key.includes('xepLoai') || key.includes('diem')) continue;
                    this.setState({ onShow: { ...onShow, qtdt: true } });
                    this[key]?.props?.label && T.notify(`${this[key]?.props?.label} bị trống!`, 'danger');
                    this[key]?.focus();
                }
                if (key.includes('he')) {
                    this[key]?.value(this.selectHeDaoTao.find(item => item.id == dataVanBang[key])?.id || '');
                }
                this[key]?.value(dataVanBang[key] || '');
            }
        }
        let isCCNN = dataNgoaiNgu.ccnn?.loaiChungChi ? true : false;
        if (!dknn && !ccnn) {
            this.setState({ onShow: { ...onShow, nn: false } });
        }
        if (dknn) {
            this.setState({ isCCNN }, () => {
                this.optionNgoaiNgu?.value(isCCNN);
                this.dknn?.value(dknn.maMonThi);
            });
        } else if (ccnn) {
            this.setState({ isCCNN }, () => {
                this.optionNgoaiNgu?.value(isCCNN);
            });
        }

        if (isDeTai && dataDeTai) {
            const { tenDeTai = [] } = dataDeTai || {};
            this.tenDeTai?.value(tenDeTai);
        }
        //lock theo trạng thái mở đăng ký đợt
        this.setState({ lock: !isEdit });

    }
    handleDangKyNgoaiNgu = () => {
        const findItem = this.state.data.find(item => item.dataCoBan.phanHe == this.state.active)?.dataCoBan?.id;
        const changes = {
            dataNgoaiNgu: {
                dknn: this.dknn.value()
            }
        };
        if (changes.dataNgoaiNgu.dknn) this.props.updateThiSinh(findItem, changes);
        else T.notify('Không có môn thi được chọn, vui lòng chọn ít nhất một môn', 'danger');
    }

    handleCoBan = (e) => {
        e.preventDefault();
        try {
            let { maPhuongXa = '', maQuanHuyen = '', maTinhThanhPho = '', soNhaDuong = '' } = this.diaChi.value();
            if (!(maQuanHuyen && maPhuongXa && maTinhThanhPho)) {
                T.notify('Địa chỉ còn thiếu!', 'danger');
                return false;
            }
            const { isNotVn } = this.state;

            const dataCoBan = {
                ho: getValue(this.ho)?.toUpperCase(),
                ten: getValue(this.ten)?.toUpperCase(),
                ngaySinh: getValue(this.ngaySinh)?.getTime(),
                gioiTinh: getValue(this.gioiTinh),
                // maNganh,
                ngheNghiep: getValue(this.ngheNghiep),
                noiSinh: !isNotVn && getValue(this.noiSinh) || '',
                noiSinhQuocGia: isNotVn && getValue(this.noiSinh) || '',
                donVi: getValue(this.donVi),
                danToc: getValue(this.danToc),
                email: getValue(this.email),
                maTinhThanhPho,
                maQuanHuyen,
                maPhuongXa,
                soNha: soNhaDuong,
                dienThoai: getValue(this.dienThoai),
                doiTuongUuTien: getValue(this.doiTuongUuTien),
                ghiChu: getValue(this.ghiChu)
                // idNganh,
            };
            const changes = { dataCoBan };
            const { data, active } = this.state;
            if (data.length == 2) {
                T.confirm('Lưu thông tin cơ bản', 'Thông tin cơ bản bạn lưu sẽ đồng bộ với bộ hồ sơ còn lại, xác nhận?', true,
                    isConfirm => isConfirm && this.props.updateThiSinh(data.map(item => item.dataCoBan.id), changes)
                );
            } else T.confirm('Lưu thông tin cơ bản', 'Bạn có muốn lưu những thông tin cơ bản trên?', true,
                isConfirm => isConfirm && this.props.updateThiSinh(data.find(({ dataCoBan }) => dataCoBan.phanHe == active).dataCoBan.id, changes)
            );
        } catch (selector) {
            selector.focus();
            selector.props.id ? T.validateEmail(this.email.value()) && T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> không hợp lệ!', 'danger')
                : T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    };

    handleVanBang = (e) => {
        e.preventDefault();
        try {
            const { isVanBangDh, isVanBangTs } = this.state.ttBieuMau;
            const thacSi = isVanBangTs ? {
                truongTnThs: getValue(this.truongTnThs),
                nganhTnThs: getValue(this.nganhTnThs),
                namTnThs: getValue(this.namTnThs),
                heThs: getValue(this.heThs),
                diemThs: getValue(this.diemThs),
                xepLoaiThs: getValue(this.xepLoaiThs),
            } : {
                truongTnThs: '',
                nganhTnThs: '',
                namTnThs: '',
                heThs: '',
                diemThs: '',
                xepLoaiThs: '',
            };
            const dataDh = isVanBangDh ? {
                truongTnDh: getValue(this.truongTnDh),
                nganhTnDh: getValue(this.nganhTnDh),
                namTnDh: getValue(this.namTnDh),
                heDh: getValue(this.heDh),
                diemDh: getValue(this.diemDh),
                xepLoaiDh: getValue(this.xepLoaiDh),
            } : {
                truongTnDh: '',
                nganhTnDh: '',
                namTnDh: '',
                heDh: '',
                diemDh: '',
                xepLoaiDh: '',
            };
            const changes = { dataVanBang: { ...dataDh, ...thacSi } };
            const { data, active } = this.state;
            // if (data.length == 2) {
            //     T.confirm('Lưu thông tin văn bằng', 'Thông tin văn bằng bạn lưu sẽ đồng bộ với bộ hồ sơ còn lại, xác nhận?', true,
            //         isConfirm => isConfirm && this.props.updateThiSinh(data.map(item => item.dataCoBan.id), changes, () => this.refresh())
            //     );
            // } else 
            T.confirm('Lưu thông tin văn bằng', 'Bạn có xác nhận lưu những thông tin trên?', true,
                isConfirm => isConfirm && this.props.updateThiSinh(data.find(i => i.dataCoBan.phanHe == active)?.dataCoBan.id, changes)
            );
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    };

    handleDeTai = () => {
        try {
            const { data, active } = this.state;
            const findItem = data.find(item => item.dataCoBan?.phanHe == active)?.dataCoBan?.id;
            const tenDeTai = getValue(this.tenDeTai);
            const changes = {
                dataDeTai: {
                    tenDeTai
                }
            };
            this.props.updateThiSinh(findItem, changes, () => this.setState({ tenDeTai }));
        } catch (selector) {
            selector.focus();
            selector.props.id ? T.validateEmail(this.email.value()) && T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> không hợp lệ!', 'danger')
                : T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    render() {
        let permissionDangKy = this.getUserPermission('sdhTsUngVien', ['login']);
        const { active, data, multiple, onShow, maHinhThuc } = this.state;
        const { isVanBangDh, isDeTai, isBtkt, isVanBangTs } = this.state.ttBieuMau ? this.state.ttBieuMau : { isVanBangDh: null, isDeTai: null, isBaiBao: null, isNgoaiNgu: null, isVanBangTs: null };
        const { id, dataCoBan, dataNgoaiNgu } = data.find(item => item.dataCoBan?.phanHe == active) ? data.find(item => item.dataCoBan?.phanHe == active) : { dataCoBan: {}, dataNgoaiNgu: { dknn: '', ccnn: '' }, dataDeTai: [] };
        const { idDot, idPhanHe } = dataCoBan;
        const { ccnn, dknn } = dataNgoaiNgu;
        const { loading } = this.state;
        const trangThaiHoSo = data.find(item => item.dataCoBan?.phanHe == active)?.dataCoBan?.isXetDuyet;
        const noteText = trangThaiHoSo == 1 ?
            <div className='tile'>
                <div className='d-flex justify-content-center'>
                    <strong className='text-success'> <i className='fa fa-check-square' aria-hidden='true' /> Hồ sơ đã được xét duyệt </strong>
                </div>
            </div> : (
                trangThaiHoSo == 2 ?
                    <div className='tile d-flex justify-content-center'>
                        <strong className='text-danger'> <i className='fa fa-clock-o' aria-hidden='true' />  Hồ sơ đã bị từ chối  </strong>
                    </div> :
                    <div className='tile d-flex justify-content-center'>
                        <strong className='text-info'> <i className='fa fa-clock-o' aria-hidden='true' />  Hồ sơ đang chờ xét duyệt  </strong>
                    </div>
            );


        const readOnly = this.state.lock ? true : (dataCoBan.isXetDuyet ? true : false);
        //fix here

        //fix here
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Thông tin đăng ký',
            header: multiple ? <FormSelect data={this.state.phanHeList} ref={e => this.hsdk = e} label='Chọn bộ hồ sơ' onChange={value => this.onChangePhanHe(value)} readOnly={false} /> : null,
            content: loading ? <OverlayLoading text='Loading..' /> :
                active ? <>
                    <NgoaiNguModal ref={e => this.modalNgoaiNgu = e} permission={permissionDangKy} readOnly={readOnly} getData={this.refresh} create={this.props.createSdhTsNgoaiNgu} update={this.props.updateSdhTsNgoaiNgu} />
                    <DeTaiModal ref={e => this.modalDeTai = e} permission={permissionDangKy} readOnly={readOnly} getData={this.refresh} create={this.props.createSdhTsDeTai} update={this.props.updateSdhTsDeTai} />
                    <BaiBaoTSModal ref={e => this.modalBaiBaoTs = e} permission={permissionDangKy} readOnly={readOnly} getData={this.refresh} create={this.props.createSdhTsBaiBao} update={this.props.updateSdhTsBaiBao} />
                    <BaiBaoModal ref={e => this.modalBaiBao = e} permission={permissionDangKy} readOnly={readOnly} getData={this.refresh} create={this.props.createSdhTsCongTrinhCbhd} update={this.props.updateSdhTsCongTrinhCbhd} />
                    <CopyHsdkModal ref={e => this.modalCopyHsdk = e} copy={this.props.copyHsdk} idDot={idDot} active={active} readOnly={dataCoBan.isEdit ? false : true} getData={this.getData} />
                    <div className='tile'>
                        <div className='row' style={{ color: 'red' }}>
                            <div className='col-md-12' style={{ fontWeight: 'bold' }}>  * Ghi chú. </div>
                            <div className='col-md-12'> - Nếu chưa nộp hồ sơ bản cứng ứng viên vui lòng nộp hồ sơ bản cứng đến phòng Quản lý Đào tạo - Sau đại học để hoàn tất quá trình đăng ký tuyển sinh. </div>
                            <div className='col-md-12'> - Nếu hồ sơ đang trạng thái <strong>chờ xét duyệt</strong>, ứng viên có thể điều chỉnh hồ sơ nếu cần thiết và đợi kết quả xét duyệt hồ sơ. </div>
                            <div className='col-md-12'> - Nếu hồ sơ đang trạng thái <strong>đã duyệt</strong> thí sinh có thể theo dõi lịch thi, điểm thi, đăng ký phúc khảo nếu có. </div>
                            <div className='col-md-12'> - Nếu hồ sơ đang trạng thái <strong>bị từ chối</strong> xin vui lòng liên hệ phòng Quản lý Đào tạo - Sau đại học để được hỗ trợ. </div>
                        </div>
                    </div>
                    {noteText}
                    <div className='tile'>
                        <div className='d-flex justify-content-end'>
                            <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={() => this.refresh()}>
                                <i className='fa fa-fw fa-lg fa-refresh' />Refresh
                            </button>
                        </div>
                        <div className='row'>
                            <FormSelect ref={e => this.idDot = e} label='Đợt tuyển sinh' data={SelectAdapter_DotThiTS} onChange={value => this.onChangeSelect(value, 'dot')} className='col-md-12' readOnly={true} />
                            <FormSelect ref={e => this.phanHe = e} label='Phân hệ dự tuyển' className='col-md-6' data={SelectAdapter_PhanHeMoDangKy(idDot, active)} onChange={value => this.onChangeSelect(value, 'phanHe')} readOnly={multiple == true ? true : readOnly} required />
                            <FormSelect ref={e => this.hinhThuc = e} label='Hình thức dự tuyển' className='col-md-6' data={SelectAdapter_HinhThuc(idPhanHe)} onChange={value => this.onChangeSelect(value, 'hinhThuc')} readOnly={readOnly} required allowClear />
                            <FormSelect ref={e => this.maNganh = e} label='Ngành dự tuyển' className='col-md-6' data={SelectAdapter_ChkttsNganh({ idPhanHe, maHinhThuc })} onChange={value => this.onChangeSelect(value, 'nganh')} readOnly={readOnly} required allowClear />
                            {isBtkt ? <FormCheckbox ref={e => this.btkt = e} inline={false} label='Đăng ký bổ sung kiến thức' className='col-md-6' onChange={value => T.confirm('Thay đổi bổ sung kiến thức', 'Xác nhận thay đổi?', true, isConfirm => {
                                if (isConfirm) {
                                    this.props.updateThiSinh(this.state.id, { dataCoBan: { btkt: value ? 1 : 0 } });
                                }
                                else this.btkt.value(!value);
                            })} readOnly={readOnly} /> : null}
                        </div>
                    </div>
                    <FormChildren title='Thông tin cơ bản' className='tile' titleClassName='tile-title' showing={onShow.ttcb} content={<>
                        <div className='row'>
                            <FormTextBox ref={e => this.sbd = e} label='Số báo danh' className='col-md-12' readOnly={true} />
                            <FormTextBox maxLength={39} ref={e => this.ho = e} label='Họ và tên lót' className='col-md-4' readOnly={readOnly} required />
                            <FormTextBox maxLength={19} ref={e => this.ten = e} label='Tên' className='col-md-4' readOnly={readOnly} required />
                            <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' className='col-md-4' readOnly={readOnly} data={SelectAdapter_DmGioiTinhV2} required />
                            <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='col-md-3' readOnly={readOnly} required />
                            <FormSelect ref={e => this.noiSinh = e} required allowClear value={''} placeholder={!this.state.isNotVn ? 'Tỉnh/Thành phố' : 'Quốc gia'} data={!this.state.isNotVn ? ajaxSelectTinhThanhPho : SelectAdapter_CstvDmQuocGia} readOnly={readOnly} className='col-md-3' labelStyle={{ marginBottom: '0' }}
                                label={<>Nơi sinh &nbsp;<FormCheckbox ref={e => this.isNotVn = e} label='Khác' readOnly={readOnly} style={{ display: 'inline' }} onChange={value => this.onChangeCheckbox(value, 'isVn')} /></>} />
                            <FormSelect ref={e => this.danToc = e} label='Dân tộc' data={SelectAdapter_BmdkDanToc} className='col-md-3' allowClear readOnly={readOnly} required />
                            <FormSelect ref={e => this.doiTuongUuTien = e} label='Đối tượng ưu tiên' className='col-md-3' readOnly={readOnly} data={SelectAdapter_BmdkDoiTuongUuTien} allowClear />
                            <FormTextBox maxLength={19} ref={e => this.ngheNghiep = e} label='Nghề nghiệp / Chức vụ' className='col-md-4' readOnly={readOnly} />
                            <FormTextBox maxLength={39} ref={e => this.donVi = e} label='Đơn vị công tác' className='col-md-8' readOnly={readOnly} />
                            <ComponentDiaDiem ref={e => this.diaChi = e} label='Địa chỉ liên hệ' className='col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} requiredAll={true} />
                            <FormTextBox type='phone' ref={e => this.dienThoai = e} label='Điện thoại' className='col-md-4' readOnly={readOnly} required />
                            <FormTextBox maxLength={49} ref={e => this.email = e} label='Email' className='col-md-4' readOnly={readOnly} required />
                            <FormRichTextBox ref={e => this.ghiChu = e} label='Ghi chú' className='col-md-12' readOnly={readOnly} />
                        </div>
                        {!readOnly ? <div className='d-flex justify-content-end'>
                            <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => this.handleCoBan(e)}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div> : null}
                    </>
                    } />
                    {isVanBangDh || isVanBangTs ?
                        <FormChildren className='tile' title={'Quá trình đào tạo'} titleClassName='tile-title' showing={onShow.qtdt} titleStyle={{ marginBottom: '5px' }}
                            content={<>
                                {isVanBangDh ? <>
                                    <h5 className='tile-sub'><i className='fa fa-pencil' aria-hidden='true'> Văn bằng đại học </i></h5>
                                    <div className='row'>
                                        <FormTextBox ref={e => this.truongTnDh = e} label='Trường tốt nghiệp' className='col-md-4' readOnly={readOnly} required />
                                        <FormTextBox ref={e => this.nganhTnDh = e} label='Ngành tốt nghiệp' className='col-md-4' readOnly={readOnly} required />
                                        <FormTextBox type='year' ref={e => this.namTnDh = e} label='Năm tốt nghiệp' className='col-md-2' readOnly={readOnly} required />
                                        <FormSelect data={this.selectHeDaoTao} ref={e => this.heDh = e} label='Hệ đại học' className='col-md-2' readOnly={readOnly} required />
                                        <FormTextBox type='number' allowNegative={false} min='0' max='10' step={true} decimalScale='2' ref={e => this.diemDh = e} label='Điểm trung bình' className='col-md-4' readOnly={readOnly} />
                                        <FormSelect data={this.selectLoaiTotNghiep} ref={e => this.xepLoaiDh = e} label='Xếp loại tốt nghiêp' className='col-md-4' readOnly={readOnly} allowClear />
                                    </div>
                                    {!readOnly ? <div className='d-flex justify-content-end p-15'>
                                        <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => this.handleVanBang(e)}>
                                            <i className='fa fa-fw fa-lg fa-save' />Lưu
                                        </button>
                                    </div> : null}
                                </> : null}
                                {isVanBangTs ? <>
                                    <strong className='col-md-12 text-danger' style={{ paddingLeft: 15 }}>Trường hợp không có văn bằng thạc sĩ có thể bỏ qua tuỳ chọn nhập dưới đây</strong><br />

                                    <h5 className='tile-sub'><i className='fa fa-pencil' aria-hidden='true'> Văn bằng thạc sĩ</i></h5>
                                    <div className='row'>
                                        <FormTextBox ref={e => this.truongTnThs = e} label='Trường tốt nghiệp thạc sĩ' className='col-md-4' readOnly={readOnly} />
                                        <FormTextBox ref={e => this.nganhTnThs = e} label='Ngành tốt nghiệp thạc sĩ' className='col-md-4' readOnly={readOnly} />
                                        <FormTextBox type='year' ref={e => this.namTnThs = e} label='Năm tốt nghiệp thạc sĩ' className='col-md-2' readOnly={readOnly} />
                                        <FormSelect data={this.selectHeDaoTao} ref={e => this.heThs = e} label='Hệ thạc sĩ' className='col-md-2' readOnly={readOnly} />
                                        <FormTextBox type='number' allowNegative={false} min='0' max='10' step={true} decimalScale='2' ref={e => this.diemThs = e} label='Điểm trung bình thạc sĩ' className='col-md-4' readOnly={readOnly} />
                                        <FormSelect data={this.selectLoaiTotNghiep} ref={e => this.xepLoaiThs = e} label='Xếp loại tốt nghiêp thạc sĩ' className='col-md-4' readOnly={readOnly} allowClear />
                                    </div>
                                    {!readOnly ? <div className='d-flex justify-content-end p-15'>
                                        <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => this.handleVanBang(e)}>
                                            <i className='fa fa-fw fa-lg fa-save' />Lưu
                                        </button>
                                    </div> : null}
                                </> : null}
                            </>} /> : null

                    }
                    <FormChildren className='tile' titleClassName='tile-title' tileStyle={{ marginBottom: 5 }} showing={onShow.nn} title='Ngoại ngữ' content={<>
                        {data.length == 2 ? <strong className='col-md-12 text-danger' style={{ paddingLeft: 15 }}>Lưu ý, do chuẩn ngoại ngữ của mỗi phân hệ khác nhau, hệ thống không hỗ trợ đồng bộ hồ sơ, vui lòng kiểm tra thông tin ngoại ngữ của mỗi hồ sơ</strong> : ''}
                        <br></br>
                        {!ccnn && !dknn.id ? <strong className='col-md-12 text-danger' style={{ paddingLeft: 15 }}>Thông tin ngoại ngữ còn thiếu</strong> : ''}
                        <FormCheckbox ref={e => this.optionNgoaiNgu = e} label='Xét tuyển Chứng chỉ/Văn bằng ngoại ngữ' onChange={value => this.onChangeCheckbox(value)} readOnly={readOnly} className='col-md-12' />
                        {this.state.isCCNN ?
                            <DataChungChi idThiSinh={id} onShow={onShow} readOnly={readOnly} permissionDangKy={permissionDangKy} />
                            : <>
                                <FormSelect ref={e => this.dknn = e} label='Đăng ký môn thi ngoại ngữ' className='col-md-12' data={SelectAdapter_BmdkMonThiNgoaiNgu({ idDot: dataCoBan.idDot })} readOnly={readOnly} allowClear />
                                {!readOnly ? <div className='d-flex justify-content-end p-15'>
                                    <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={() => this.handleDangKyNgoaiNgu({ id })}>
                                        <i className='fa fa-fw fa-lg fa-save' />Lưu
                                    </button>
                                </div> : null}
                            </>
                        } </>
                    } />
                    {isDeTai ? <>
                        <FormChildren className='tile' titleClassName='title-sub' titleSize='h5' title='Công trình nghiên cứu của thí sinh' showing={onShow.deTai} titleStyle={{ margin: '5px 5px' }}
                            content={
                                <>
                                    <DataBaiBaoTs ref={e => this.dataBaiBaoTs = e} readOnly={readOnly} idThiSinh={id} />
                                </>
                            } />
                        <FormChildren className='tile' titleClassName='tile-title' tileStyle={{ marginBottom: 5 }} showing={onShow.deTai} title='Đề tài đăng ký' content={<>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='tile'>
                                        <FormTextBox ref={e => this.tenDeTai = e} label='Tên đề tài' className='col-md-12' required readOnly={readOnly} />
                                        {!readOnly ? <div className='col-md-12 d-flex justify-content-end'>
                                            <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => e.preventDefault() || this.handleDeTai()}>
                                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                            </button>
                                        </div> : null}
                                    </div>
                                </div>
                                <DataDeTai idThiSinh={id} onShow={onShow} tenDeTai={this.state.tenDeTai} readOnly={readOnly} permissionDangKy={permissionDangKy} updateThiSinh={this.props.updateThiSinh} />
                            </div>
                        </>} />
                    </> : null}
                    {!multiple ? <div className='d-flex justify-content-center'>
                        <button type='button' className='btn btn-primary rounded-0' data-dismiss='modal' onClick={(e) => e.preventDefault() || this.modalCopyHsdk.show(dataCoBan)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Đăng ký phân hệ mới
                        </button>
                    </div> : !dataCoBan.isXetDuyet ?
                        <div className='d-flex justify-content-center'>
                            <button type='button' className='btn btn-danger rounded-0' data-dismiss='modal' onClick={(e) => e.preventDefault() || T.confirm('Cảnh báo', 'Xác nhận huỷ hồ sơ này?', true, isConfirm => isConfirm && this.props.huyDangKy(dataCoBan.id, () => this.getData()))}>
                                <i className='fa fa-fw fa-lg fa-minus' />Huỷ đăng ký
                            </button>
                        </div> : null}
                </> : null,
            backRoute: '/user',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    triggerPhanHe, updateThiSinh, getSdhTsThiSinhProfile, getSdhTsThongTinBieuMau, copyHsdk, huyDangKy, deleteSdhTsCbhd, deleteSdhTsDangKyNgoaiNgu, deleteSdhTsNgoaiNguByIdThiSinh, deleteSdhTsDeTaiByIdThiSinh, preCheckTargetPhanHe
};
export default connect(mapStateToProps, mapActionsToProps)(ThiSinhTuyenSinhSdhPage);
