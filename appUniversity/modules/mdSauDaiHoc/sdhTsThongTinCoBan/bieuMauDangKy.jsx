import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, FormSelect, FormDatePicker, renderTable, TableCell, FormRichTextBox, AdminModal, FormCheckbox, getValue } from 'view/component/AdminPage';
import './home.scss';
import { ajaxSelectTinhThanhPho } from 'modules/mdCongTacSinhVien/ctsvDmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_BmdkDmQuocGia, sendMailThongTinDangNhap } from './redux';
import { createTsSdh, sendMailXacNhanDangKy, preCheckEmailRegister } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { SelectAdapter_ChkttsNganh, SelectAdapter_CanBoHuongDan, SelectAdapter_BmdkMonThiNgoaiNgu, SelectAdapter_BmdkGioiTinh, SelectAdapter_BmdkDanToc, SelectAdapter_BmdkDoiTuongUuTien } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { getSdhTsThongTinBieuMau } from 'modules/mdSauDaiHoc/sdhTsThongTinBieuMau/redux';
import { ComponentDiaDiem } from './section/ComponentDiaDiem';
import { NgoaiNguModal } from 'modules/mdSauDaiHoc/sdhTsNgoaiNgu/NgoaiNguModal';
import { BaiBaoTSModal } from 'modules/mdSauDaiHoc/sdhTsBaiBao/BaiBaoModal';
import { SelectAdapter_DmTruong } from 'modules/mdSauDaiHoc/sdhTsDmTruong/redux';
// import { DeTaiModal } from 'modules/mdSauDaiHoc/sdhTsDeTai/DeTaiModal';
import { BaiBaoModal } from 'modules/mdSauDaiHoc/sdhTsCongTrinhCbhd/BaiBaoModal';
import T from 'view/js/common';

class ConfirmModal extends AdminModal {
    state = { timeLeft: 180 };
    timeOutId = '';
    componentDidMount() {
        this.disabledClickOutside();
    }
    componentDidUpdate() {
        const timeLeft = this.state.timeLeft;
        this.timeOutId = this.state.mail && timeLeft > 0 ? setTimeout(() => this.setState({ timeLeft: timeLeft - 1 }), 1000) : '';

    }

    onShow = (data) => {
        this.timeOutId && clearTimeout(this.timeOutId);
        const { studentData, dataXacThuc, mail } = data;
        this.setState({ studentData, dataXacThuc, mail, timeLeft: 180 });
    };
    onSubmit = (e) => {
        e.preventDefault();
        const { studentData, dataXacThuc } = this.state;
        !this.code.value() && T.notify('Xin vui lòng điền mã xác thực!', 'danger');
        const xacThuc = { ...dataXacThuc, maXacThuc: getValue(this.code) };
        T.alert('Đang tạo hồ sơ xin vui lòng đợi trong giây lát', 'info', false, null, true);

        this.props.createTsSdh(xacThuc, studentData, (item) => {
            if (item.err) {
                return T.alert(`${item.err.message}`, 'error', false, 2000);
            }
            this.code.value('');
            this.hide();
            T.alert('Hồ sơ được tạo thành công, vui lòng kiểm tra email để lấy thông tin đăng nhập!', 'success', false, null, false);
            this.props.send(item.result || {}, () => window.location.href = '/sdh/ts');
        }
        );
    };
    render = () => {
        const { email } = this.state.studentData && this.state.studentData.dataCoBan ? this.state.studentData.dataCoBan : { email: '', ho: '', ten: '' };
        return this.renderModal({
            title: 'Xác nhận đăng ký',
            size: 'large',
            body: <div className='row'>
                {/* <FormTextBox className='col-12' ref={e => this.email = e} label='Email nhận' readOnly /> */}
                <div className='col-md-3' style={{ color: this.state.timeLeft % 2 == 0 ? 'red' : 'orange' }}>Thời gian mã xác thực: <strong>{this.state.timeLeft}</strong></div>
                <div className='col-md-12'>Vui lòng kiểm tra hòm thư và nhập mã xác thực được gửi tới email {email}.</div>
                {this.state.timeLeft != 0 ?
                    <FormTextBox autoFormat={false} type='number' max={999999} className='col-md-12' ref={e => this.code = e} label='Mã xác thực gồm 6 số' required />
                    : <div className='col-md-12' style={{ color: 'red' }}>Thời gian của mã xác thực đã hết hiệu lực, xin vui lòng chọn gửi lại mã để tiếp tục! </div>
                }<div className='col-md-2' style={{ display: 'flex', gap: 10 }}>
                    <button type='button' style={{ height: '34px', alignSelf: 'flex-end' }} className='btn btn-success rounded-0' onClick={(e) =>
                        e.preventDefault() || this.props.sendMaXacNhan(this.state.mail, (item) => {
                            clearTimeout(this.timeOutId);
                            this.setState({ timeLeft: 180, dataXacThuc: { id: item.id } });
                        }
                        )}>
                        <i className="fa fa-refresh" aria-hidden="true"></i> Gửi lại mã
                    </button>
                </div>

            </div>,
            postButtons: <button className='btn btn-success' onClick={e => this.onSubmit(e)}>
                <i className='fa fa-lg fa-check' />  Xác thực
            </button>,
            isShowSubmit: false,
        }
        );
    };
}
class BieuMauTuyenSinhSdhPage extends AdminPage {
    state = { cbhds: [], cbhdLength: 1, baiBaos: [], idDot: '', phanHe: '', hinhThuc: '', idPhanHe: '', isNotVn: false, title: '', data: { chungChiNgoaiNgu: '', baiBao: [], baiBaoTs: [], deTai: {} }, thacSi: false, ttBieuMau: {}, dataBieuMau: {}, nganh: '' }

    componentDidMount() {
        const prevState = this.props.history.location.state;
        if (prevState && prevState.maPhanHe && prevState.maHinhThuc) {
            $('html, body').css({
                'overflow': 'visible'
            });
            this.props.getSdhTsThongTinBieuMau(prevState.maPhanHe, item => {
                this.optionNgoaiNgu?.value(item.isNgoaiNgu);
                let dataBieuMau = { hinhThuc: prevState.maHinhThuc, phanHe: prevState.maPhanHe, idDot: prevState.idDot };
                this.setState({ ttBieuMau: item, isCCNN: item.isNgoaiNgu, idDot: prevState.idDot, idPhanHe: prevState.idPhanHe, phanHe: prevState.maPhanHe, hinhThuc: prevState.maHinhThuc, dataBieuMau });
            });
        } else {
            this.props.history.push('/sdh/dkts');
        }
    }

    getAndValidate = () => {
        try {
            const { isVanBangDh, isVanBangTs, isDeTai } = this.state.ttBieuMau;
            let { maPhuongXa = '', maQuanHuyen = '', maTinhThanhPho = '', soNhaDuong = '' } = this.diaChi.state;
            const { ma: maNganh, ten: tenNganh, id: idNganh } = T.parse(this.nganhDuTuyen.value()) ? T.parse(this.nganhDuTuyen.value()) : { ma: '', ten: '', id: '' };
            if (!(maNganh && tenNganh && idNganh)) {
                throw this.nganhDuTuyen;
            }
            if (!(maPhuongXa && maQuanHuyen && maTinhThanhPho)) {
                Object.keys(this.diaChi.state).forEach(key => this.diaChi.state[key] == '' && this.diaChi.focus(String(key).split('ma').join('dm')));
                return false;
            }
            const dataCoBan = {
                ho: this.validation(this.ho)?.toUpperCase(),
                ten: this.validation(this.ten)?.toUpperCase(),
                ngaySinh: this.validation(this.ngaySinh).getTime(),
                gioiTinh: this.validation(this.gioiTinh),
                maNganh,
                email: this.validation(this.email)?.toLowerCase(),
                ngheNghiep: this.validation(this.ngheNghiep),
                donVi: this.validation(this.donVi),
                maPhuongXa,
                maQuanHuyen,
                maTinhThanhPho,
                soNha: soNhaDuong,
                danToc: this.state.isNotVn ? '' : this.validation(this.danToc),
                noiSinh: !this.state.isNotVn ? this.validation(this.noiSinh) : '',
                noiSinhQuocGia: this.state.isNotVn ? this.validation(this.noiSinh) : '',
                dienThoai: this.validation(this.dienThoai),
                doiTuongUuTien: this.validation(this.doiTuongUuTien),
                ghiChu: this.validation(this.ghiChu),
                idNganh,
                tenNganh,
                btkt: this.btkt?.value() ? this.btkt?.value() ? 1 : 0 : ''
            };
            const thacSi = isVanBangTs ? {
                truongTnThs: this.validation(this.truongTnThs),
                nganhTnThs: this.validation(this.nganhTnThs),
                namTnThs: this.validation(this.namTnThs),
                heTnThs: this.validation(this.heTnThs),
                diemThs: this.validation(this.diemTnThs),
                xepLoaiThs: this.xepLoaiTnThs?.value() || '',
                // maVbThs: this.validation(this.maTnThs),
            } : {
                truongTnThs: '',
                nganhTnThs: '',
                namTnThs: '',
                heTnThs: '',
                diemThs: '',
                xepLoaiThs: '',
            };
            const dataVanBang = isVanBangDh ? {
                truongTnDh: this.validation(this.truongTnDh),
                nganhTnDh: this.validation(this.nganhTnDh),
                namTnDh: this.validation(this.namTnDh),
                heDh: this.validation(this.heTnDh),
                diemDh: this.validation(this.diemTnDh),
                xepLoaiDh: this.validation(this.xepLoaiTnDh),
            } : {
                truongTnDh: '',
                nganhTnDh: '',
                namTnDh: '',
                heDh: '',
                diemDh: '',
                xepLoaiDh: '',
            };
            let dataDeTai = {};
            if (isDeTai) {
                dataDeTai.tenDeTai = this.validation(this.tenDeTai);

                const checkCbhd = (id) => {
                    // try {
                    let data = {
                        idCbhd: id,
                        hoTen: this['ghiChuCbhd' + id] && this.validation(this['ghiChuCbhd' + id])?.split('. ').join(' ').split(' - ')[0]?.trim(),
                        vaiTro: this['vaiTro' + id] && this.validation(this['vaiTro' + id]) || (this.validation(this['ghiChuCbhd' + id])?.split('.').join(' ').split(' - ')[1]?.trim() || ''),
                        shcc: this['shcc' + id] && this.validation(this['shcc' + id]),
                    };
                    if (!((data.shcc && data.hoTen) || data.vaiTro)) {
                        T.notify('Thông tin CBHD bị thiếu, cần chọn CBHD và vai trò hoặc điền ghi chú để tiếp tục!');
                        return false;
                    } else {
                        let congTrinh = this.state.data.baiBao;
                        if (this.state.phanHe == '01' && !congTrinh.filter(i => i.idCbhd == id).length) {
                            T.notify(`Thông tin đề tài đăng ký còn thiếu: Không nhận được dữ liệu công trình nghiên cứu của cán bộ thứ ${id}`, 'danger');
                            // cbhds = cbhds.filter(item => item.idCbhd != congTrinh.idCbhd);
                            return false;
                        }
                        else return data;
                    }

                };
                let cbhdAdded = true;
                let cbhdOnForm = true;
                if (this.state.cbhds?.length == 1) {
                    cbhdAdded = checkCbhd(1);
                    if (!cbhdAdded) return false;
                    cbhdOnForm = checkCbhd(2);
                    if (!cbhdOnForm) return false;
                    // if (cbhdOnForm.vaiTro != 'Đồng hướng dẫn' && cbhdOnForm.vaiTro == cbhdAdded.vaiTro) {
                    //     T.notify(`Không thể tồn tại cùng lúc hai ${cbhdOnForm.vaiTro}`, 'danger');
                    //     return false;
                    // }
                    if (cbhdOnForm.shcc && cbhdOnForm.shcc == cbhdAdded.shcc) {
                        T.notify(`Không thể đăng ký một cán bộ hướng dẫn hai lần ${cbhdOnForm.hoTen}`, 'danger');
                        return false;
                    }
                } else {
                    cbhdOnForm = checkCbhd(1);
                    if (!cbhdOnForm) return false;
                }
                if (this.state.cbhds?.length == 1 && cbhdAdded) {
                    //Quay lại sửa sau khi ấn check
                    dataDeTai.dataCbhd = [cbhdOnForm, cbhdAdded];
                    dataDeTai.dataCongTrinhCbhd = this.state.data.baiBao;
                }
                if (this.state.cbhds?.length == 0 && cbhdOnForm) {
                    //cbhd2 hoặc 1
                    dataDeTai.dataCbhd = [cbhdOnForm];
                    dataDeTai.dataCongTrinhCbhd = this.state.data.baiBao;
                }
            }
            let dataNgoaiNgu = {};
            // Không cho đăng ký hồ sơ nếu không có ngoại ngữ
            if ((!this.state.data.chungChiNgoaiNgu || !this.state.data.chungChiNgoaiNgu.idCcnn) && (!this.kiemTraNgoaiNgu || !this.kiemTraNgoaiNgu.value())) {
                T.notify('Thiếu thông tin ngoại ngữ! Xin vui lòng bổ sung', 'danger');
                return false;
            }
            if (this.state.data.chungChiNgoaiNgu && this.state.data.chungChiNgoaiNgu.idCcnn) {
                dataNgoaiNgu.ccnn = this.state.data.chungChiNgoaiNgu;
            } else {
                dataNgoaiNgu.dknn = this.kiemTraNgoaiNgu?.value();
            }
            //Vẫn cho đăng ký hồ sơ mà k có ngoại ngữ - có cảnh báo
            // if (this.optionNgoaiNgu?.value()) {
            //     if (!this.state.data.chungChiNgoaiNgu) {
            //         T.confirm('Xác nhận thông tin', 'Thông tin chứng chỉ/văn bằng ngoại ngữ còn thiếu, xác nhận bộ sung sau?', true,
            //             isConfirm => {
            //                 if (isConfirm) {
            //                     T.notify('Lưu ý bổ sung trước thời hạn đóng đăng ký');
            //                     dataNgoaiNgu.ccnn = '';
            //                 }
            //             });
            //     } else {
            //         dataNgoaiNgu.ccnn = this.state.data.chungChiNgoaiNgu;
            //     }
            // }
            // else {
            //     if (!this.kiemTraNgoaiNgu || !this.kiemTraNgoaiNgu.value()) {
            //         T.confirm('Xác nhận thông tin', 'Thông tin đăng ký thi ngoại ngữ còn thiếu, xác nhận bộ sung sau?', true,
            //             isConfirm => {
            //                 if (isConfirm) {
            //                     T.notify('Lưu ý bổ sung trước trước thời hạn đóng đăng ký');
            //                     dataNgoaiNgu.dknn = '';
            //                 }
            //             });
            //     } else
            //         dataNgoaiNgu.dknn = this.kiemTraNgoaiNgu?.value();
            // }

            const data = {
                dataCoBan,
                dataVanBang: { ...dataVanBang, ...thacSi },
                dataNgoaiNgu,
                dataBaiBaoTs: this.state.data.baiBaoTs,
                dataDeTai,
                ttBieuMau: this.state.ttBieuMau
            };
            return data;
        } catch (selector) {
            selector?.focus();
            selector?.props?.id ? T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> không hợp lệ!', 'danger')
                : T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    };
    validation = (selector) => {
        const data = selector && selector.value() || '';
        const isRequired = selector && selector.props?.required;
        if (selector && selector.props?.id && isRequired && !T.validateEmail(data)) throw selector;
        if (data) return data;
        if (isRequired) throw selector;
        return '';
    };


    handleSave = () => {
        let studentData = this.getAndValidate();
        // cmt dùng test đăng ký tuyển sinh send mail
        // let studentData = { dataCoBan: { email: 'sangnguyen@gmail.com', ho: 'nguyen', ten: 'sang' } };
        if (studentData) {
            const dataCoBan = { ...studentData.dataCoBan, idDot: this.state.idDot, phanHe: this.state.phanHe, hinhThuc: this.state.hinhThuc };
            studentData = { ...studentData, dataCoBan };
            T.confirm('Đăng ký tuyển sinh', 'Xác nhận đăng ký tuyển sinh với những thông tin trên?', true,
                isConfirm => {
                    if (isConfirm) {
                        const { email, phanHe, idDot } = dataCoBan;
                        const data = {
                            emailForm: email,
                            name: `${dataCoBan.ho} ${dataCoBan.ten}`
                        };
                        if (!data.emailForm) {
                            return T.notify('Lỗi lấy dữ liệu email', 'danger');
                        }
                        else {
                            this.props.preCheckEmailRegister({ email, phanHe, idDot }, ({ error }) => {
                                if (error) return;
                                this.props.sendMailXacNhanDangKy({ ...data },
                                    (item) => this.modalConfirm.show({ studentData, dataXacThuc: { id: item.id }, mail: { ...data } })
                                );
                            });
                        }
                    }
                }
            );
        }
    }
    validateAdd = (selector) => {
        const rs = selector.value() != null && typeof selector.value() !== 'undefined' && selector.value() != '' ? true : false;
        if (rs) {
            return true;
        } else {
            throw selector;
        }
    }
    handleChungChiNgoaiNgu = (action, changes, done) => {
        let data = this.state.data;
        if (action == 'create') {
            changes.idCcnn = 1;
            this.setState({ data: { ...data, chungChiNgoaiNgu: changes } }, () => done && done());
        } if (action == 'delete') {
            this.setState({ data: { ...data, chungChiNgoaiNgu: '' } });
        }
        if (action == 'update') {
            changes.idCcnn = 1;
            this.setState({ data: { ...data, chungChiNgoaiNgu: changes } }, () => done && done());
        }
    }
    handleBaiBao = (action, idCbhd, item) => {
        try {
            if (action == 'create') {
                let idBaiBao = this.state.data.baiBao.length + 1;
                let baiBao = {
                    idCbhd,
                    idBaiBao,
                    ten: this.validation(this['ten' + idCbhd]),
                    tenTapChi: this.validation(this['tenTapChi' + idCbhd]),
                    chiSo: this.validation(this['chiSo' + idCbhd]),
                    ngayDang: this.validation(this['ngayDang' + idCbhd]) ? this.validation(this['ngayDang' + idCbhd]).getTime() : '',
                    diem: this.validation(this['diem' + idCbhd]),
                };
                if (!(baiBao.ten || baiBao.tenTapChi || baiBao.chiSo || baiBao.ngayDang || baiBao.diem)) return 'Xin vui lòng điền ít nhất 1 trường dữ liệu của bài báo!';
                this.setState({ data: { ...this.state.data, baiBao: [...this.state.data.baiBao, { ...baiBao }] } }, () => {
                    this['ten' + idCbhd]?.value('');
                    this['tenTapChi' + idCbhd]?.value('');
                    this['chiSo' + idCbhd]?.value('');
                    this['ngayDang' + idCbhd]?.value('');
                    this['diem' + idCbhd]?.value('');
                });
            }
            else if (action == 'update') {
                const changes = idCbhd;
                const cbd = changes.idCbhd;
                let idBaiBao = changes.idBaiBao;
                this.setState({ data: { ...this.state.data, baiBao: [...this.state.data.baiBao.filter(i => i.idCbhd != cbd && i.idBaiBao == idBaiBao), { ...changes }] } });
            }
            else {
                this.setState({ data: { ...this.state.data, baiBao: [...this.state.data.baiBao.filter(i => i.idCbhd != idCbhd && i.idBaiBao != item.idBaiBao)] } });
            }
        } catch (selector) {
            T.notify('<b>' + (selector?.props?.placeholder || selector?.props?.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            selector.focus();
        }

    }
    handleBaiBaoTs = (action, item, done) => {
        try {
            if (action == 'create') {
                let idBaiBao = this.state.data.baiBaoTs.length + 1;
                let baiBao = {
                    tenBaiBao: this['tenBaiBaoTs'].value() || '',
                    tenTapChi: this['tenTapChiTs'].value() || '',
                    chiSo: this['chiSoTs'].value() || '',
                    ngayDang: this['ngayDangTs'].value() ? this['ngayDangTs'].value().getTime() : '',
                    diem: this['diemTs'].value() || '',
                };
                if (!Object.values(baiBao).filter(i => i).length) return T.notify('Xin vui lòng điền thông tin bài báo trước khi thêm', 'danger');

                this.setState({ data: { ...this.state.data, baiBaoTs: [...this.state.data.baiBaoTs, { ...baiBao, idBaiBao }] } }, () => {
                    this['tenBaiBaoTs']?.value('');
                    this['tenTapChiTs']?.value('');
                    this['chiSoTs']?.value('');
                    this['ngayDangTs']?.value('');
                    this['diemTs']?.value('');
                });
            }
            else if (action == 'update') {
                const changes = item;
                let idBaiBao = changes.idBaiBao;
                this.setState({ data: { ...this.state.data, baiBaoTs: [...this.state.data.baiBaoTs.filter(i => i.idBaiBao != idBaiBao), { ...changes }] } });
            }
            else {
                this.setState({ data: { ...this.state.data, baiBaoTs: [...this.state.data.baiBaoTs.filter(i => i.idBaiBao != item.idBaiBao)] } });
            }
            return done && done();
        } catch (selector) {
            T.notify('<b>' + (selector?.props?.placeholder || selector?.props?.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            selector.focus();
        }

    }
    handleCbhd = (action) => {
        let idCbhd = this.state.cbhds.length + 1;
        if (!action) {
            try {
                let cbhd = {
                    idCbhd,
                    hoTen: this.validation(this['ghiChuCbhd' + idCbhd])?.split('. ').join(' ').split(' - ')[0]?.trim(),
                    vaiTro: this.validation(this['vaiTro' + idCbhd]) || (this.validation(this['ghiChuCbhd' + idCbhd])?.split('.').join(' ').split(' - ')[1]?.trim() || ''),
                    shcc: this.validation(this['shcc' + idCbhd]),
                };
                if (!((cbhd.shcc && cbhd.hoTen) || cbhd.vaiTro)) {
                    T.notify('Thông tin CBHD trước đó bị thiếu, cần chọn CBHD và vai trò hoặc điền ghi chú để tiếp tục!');
                } else this.setState({ cbhds: [...this.state.cbhds.filter(i => i.idCbhd != idCbhd), { ...cbhd }] });
            } catch (selector) {
                selector?.focus();
                T.notify('<b>' + (selector.props?.placeholder || selector.props?.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            }
        } else {
            //Xóa chưa add
            this['shcc' + idCbhd + 1] = '';
            this['vaiTro' + idCbhd + 1] = '';
            this['ghiChuCbhd' + idCbhd + 1] = '';
            this['ten' + idCbhd + 1] = '';
            this['tenTapChi' + idCbhd + 1] = '';
            this['chiSo' + idCbhd + 1] = '';
            this['ngayDang' + idCbhd + 1] = '';
            this['diem' + idCbhd + 1] = '';
            this.setState({ cbhds: [] });
            this.setState({ data: { ...this.state.data, baiBao: this.state.data.baiBao.filter(item => item.idCbhd == 1) } });
        }

    }
    componentCbhd = () => {
        let idCbhdOnForm = this.state.cbhds.length + 1;
        let disableCheck = !(this['ghiChuCbhd' + idCbhdOnForm]?.value() || (this['vaiTro' + idCbhdOnForm]?.value() && this['shcc' + idCbhdOnForm]?.value()) || this.state.data.baiBao.filter(i => i.idCbhd == idCbhdOnForm).length);
        let form = (i) => <div className='row'>
            <FormSelect ref={e => this['shcc' + i] = e} label='Cán bộ hướng dẫn' data={SelectAdapter_CanBoHuongDan} className='col-md-6' allowClear readOnly={false} />
            <FormSelect ref={e => this['vaiTro' + i] = e} label='Vai trò' data={this.selectVaiTro} className='col-md-6' readOnly={false} allowClear />
            <FormRichTextBox ref={e => this['ghiChuCbhd' + i] = e} maxLength={1999} label='Ghi chú' placeholder='<Chức danh cao nhất> <Học vị cao nhất> <Họ và tên> - <Vai trò>. Vd: PGS TS Nguyễn Văn A - Cán bộ hướng dẫn 1' className='col-md-12' readOnly={false} />
            <h5 className='tile-sub col-md-12' >Công trình nghiên cứu khoa học của cán bộ hướng dẫn</h5>
            <strong className='text-danger p-15'>* Xin vui lòng điền đầy đủ thông tin bên dưới và nhấn nút thêm để lưu công trình khoa học cán bộ hướng dẫn</strong>
            <br />
            {this.componentBaiBao(i)}
        </div>;
        return (<>
            {form(1)}
            {this.state.cbhds.length == 1 ? form(2) : null}
            {this.state.cbhds.length < 1 ? <div className='d-flex justify-content-begin p-15'>
                <button type='button' className='btn btn-primary rounded-0' disabled={disableCheck} data-dismiss='modal' onClick={(e) => { e.preventDefault(); this.handleCbhd(); }}>
                    <i className='fa fa-fw fa-lg fa-plus' />Thêm CBHD
                </button>
            </div> : <div className='d-flex justify-content-begin p-15'>
                <button type='button' className='btn btn-danger rounded-0' data-dismiss='modal' onClick={(e) => { e.preventDefault(); this.handleCbhd('delete'); }}>
                    <i className='fa fa-fw fa-lg fa-plus' />Xóa CBHD
                </button>
            </div>}

        </>);
    }
    componentBaiBaoTs = () => {
        const tableBaiBao = renderTable({
            getDataSource: () => this.state.data.baiBaoTs,
            stickyHead: false,
            header: 'light',
            emptyTable: 'Chưa có bài báo được thêm',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%' }}>Tên bài báo</th>
                    <th style={{ width: '20%' }}>Tên tạp chí</th>
                    <th style={{ width: '20%' }}>Chỉ số</th>
                    <th style={{ width: '20%' }}>Thời gian đăng</th>
                    <th style={{ width: '20%' }}>Điểm bài báo</th>
                    <th style={{ width: 'auto' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.tenBaiBao} />
                    <TableCell style={{ textAlign: 'left' }} content={item.tenTapChi} />
                    <TableCell style={{ textAlign: 'left' }} content={item.chiSo} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'left' }} content={item.ngayDang} />
                    <TableCell style={{ textAlign: 'left' }} content={item.diem} />
                    <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'center' }} permission={{ write: true, delete: true }} content={item} onEdit={e => e.preventDefault() || this.modalBaiBaoTs.show(this.state.data.baiBaoTs.find(i => i.idBaiBao == item.idBaiBao))} onDelete={e => e.preventDefault() || T.confirm('Xóa bài báo', 'Bạn có Xóa xác nhận Xóa bài báo?', true, isConfirm => isConfirm && this.handleBaiBaoTs('delete', item))} />
                </tr>
            )
        });
        return <div className='row'>
            <FormTextBox ref={e => this['tenBaiBaoTs'] = e} label='Tên bài báo' className='col-md-12' />
            <FormTextBox ref={e => this['tenTapChiTs'] = e} label='Tên tạp chí' className='col-md-12' />
            <FormTextBox ref={e => this['chiSoTs'] = e} label='Chỉ số tạp chí' className='col-md-4' />
            <FormDatePicker ref={e => this['ngayDangTs'] = e} type='month-mask' label='Thời gian đăng (mm/yyyy)' className='col-md-4' />
            <FormTextBox ref={e => this['diemTs'] = e} label='Điểm bài báo' className='col-md-4' />

            {this.state.data.baiBaoTs.length <= 5 ? <div className='d-flex justify-content-end p-15 mb-5'>
                <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => { e.preventDefault() || this.handleBaiBaoTs('create'); }}>
                    <i className='fa fa-fw fa-lg fa-plus' />Thêm
                </button>
            </div> : null}

            <h6 className='tile-sub col-md-12 p-15' style={{ marginBottom: '5px' }}>Thông tin công trình nghiên cứu của cán bộ đã thêm</h6><br />
            <div className='col-md-12 p-15 mb-5'>
                {tableBaiBao}
            </div>
        </div>;
    }

    componentBaiBao = (idCbhd) => {
        const tableBaiBao = renderTable({
            getDataSource: () => this.state.data.baiBao.filter(i => i.idCbhd == idCbhd),
            stickyHead: false,
            header: 'light',
            emptyTable: 'Chưa có bài báo được thêm',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%' }}>Tên bài báo</th>
                    <th style={{ width: '20%' }}>Tên tạp chí</th>
                    <th style={{ width: '20%' }}>Chỉ số</th>
                    <th style={{ width: '20%' }}>Thời gian đăng</th>
                    <th style={{ width: '20%' }}>Điểm bài báo</th>
                    <th style={{ width: 'auto' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'left' }} content={item.tenTapChi} />
                    <TableCell style={{ textAlign: 'left' }} content={item.chiSo} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'left' }} content={item.ngayDang} />
                    <TableCell style={{ textAlign: 'left' }} content={item.diem} />
                    <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'center' }} permission={{ write: true, delete: true }} content={item} onEdit={e => e.preventDefault() || this.modalBaiBao.show({ ...item, id: item.idBaiBao })} onDelete={e => e.preventDefault() || T.confirm('Xóa bài báo', 'Bạn có Xóa xác nhận Xóa bài báo?', true, isConfirm => isConfirm && this.handleBaiBao('delete', '', item))} />
                </tr>
            )
        });
        return <div className='row'>
            <FormTextBox ref={e => this['ten' + idCbhd] = e} label='Tên bài báo' className='col-md-12' required={this.state.phanHe == '01' ? true : false} />
            <FormTextBox ref={e => this['tenTapChi' + idCbhd] = e} label='Tên tạp chí' className='col-md-12' required={this.state.phanHe == '01' ? true : false} />
            <FormTextBox ref={e => this['chiSo' + idCbhd] = e} label='Chỉ số tạp chí' className='col-md-4' required={this.state.phanHe == '01' ? true : false} />
            <FormDatePicker ref={e => this['ngayDang' + idCbhd] = e} type='month-mask' label='Thời gian đăng (mm/yyyy)' className='col-md-4' required={this.state.phanHe == '01' ? true : false} />
            <FormTextBox ref={e => this['diem' + idCbhd] = e} label='Điểm bài báo' className='col-md-4' />

            {this.state.data.baiBao.filter(i => i.idCbhd == idCbhd).length <= 5 ? <div className='d-flex justify-content-end p-15 mb-5'>
                <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => { e.preventDefault() || this.handleBaiBao('create', idCbhd); }}>
                    <i className='fa fa-fw fa-lg fa-plus' />Thêm
                </button>
            </div> : null}

            <h6 className='tile-sub col-md-12 p-15' style={{ marginBottom: '5px' }}>Thông tin đã thêm</h6><br />
            <div className='col-md-12 p-15 mb-5'>
                {tableBaiBao}
            </div>
        </div>;
    }


    onChangeCheckbox = (value, type) => {
        if (!type) {
            let data = this.state.data;
            data.chungChiNgoaiNgu = {};
            this.setState({ isCCNN: value, dknn: '', data }, () => {
                this.kiemTraNgoaiNgu?.value('');
                // const { dknn } = this.state.data?.dataNgoaiNgu ? this.state.data?.dataNgoaiNgu : { dknn: [] };
                // dknn.length && this.kiemTraNgoaiNgu.value(dknn.map(item => item.maMonThi) || []);
            });
        } else {
            this.setState({ isNotVn: value }, () => {
                this.danToc.value('');
                this.noiSinh.value('');//reload ajax từ tỉnh => quốc gia khác
            });
        }

    }
    //Bổ sung danh mục về sau;
    selectVaiTro = [{ id: 'Cán bộ hướng dẫn chính', text: 'Cán bộ hướng dẫn chính' }, { id: 'Cán bộ hướng dẫn phụ', text: 'Cán bộ hướng dẫn phụ' }, { id: 'Cán bộ hướng dẫn độc lập', text: 'Cán bộ hướng dẫn độc lập' }];
    selectLoaiTotNghiep = [{ id: 1, text: 'Trung bình' }, { id: 2, text: 'Trung bình khá' }, { id: 3, text: 'Khá' }, { id: 4, text: 'Giỏi' }, { id: 5, text: 'Xuất sắc' }];
    selectHeDaoTao = [{ id: 1, text: 'Chính quy' }, { id: 2, text: 'Không chính quy' }];

    render() {
        const { isVanBangDh, isDeTai, isVanBangTs } = this.state.ttBieuMau ? this.state.ttBieuMau : { isVanBangDh: 1, isDeTai: null, isBaiBao: null, isNgoaiNgu: 1, isVanBangTs: null, isBtkt: 0 };
        const { idDot, maPhanHe, maHinhThuc, idPhanHe } = this.props.history.location.state ? this.props.history.location.state : { idDot: null, maPhanHe: null, maHinhThuc: null, idPhanHe: null };
        let { isCCNN } = this.state;
        const { isTruongDhKhac = false, isTruongThsKhac = false } = this.state;
        const filter = { idDot, idPhanHe, maPhanHe, maHinhThuc };
        let readOnlyCCNN = false;
        if (maPhanHe == '01' || maPhanHe == '02' && maHinhThuc == '03') {
            isCCNN = true;
            readOnlyCCNN = true;
        }
        const tableChungChi = renderTable({
            getDataSource: () => this.state.data.chungChiNgoaiNgu?.idCcnn ? [this.state.data.chungChiNgoaiNgu] : [],
            stickyHead: false,
            header: 'light',
            emptyTable: 'Chưa có chứng chỉ ngoại ngữ được thêm',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%' }}>Ngoại ngữ</th>
                    <th style={{ width: '20%' }}>Loại chứng chỉ</th>
                    <th style={{ width: '20%' }}>Ngày cấp</th>
                    <th style={{ width: '20%' }}>Đơn vị cấp</th>
                    <th style={{ width: '20%' }}>Mã chứng chỉ</th>
                    <th style={{ width: 'auto' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.ngonNgu} />
                    <TableCell style={{ textAlign: 'left' }} content={item.loaiChungChi} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'left' }} content={item.ngayCap} />
                    <TableCell style={{ textAlign: 'left' }} content={item.donViCap} />
                    <TableCell style={{ textAlign: 'left' }} content={item.maChungChi} />
                    <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'center' }} permission={{ write: true, delete: true }} content={item} onEdit={e => e.preventDefault() || this.modalNgoaiNgu.show(item)} onDelete={e => e.preventDefault() || T.confirm('Xóa chứng chỉ ngoại ngữ/văn bằng', 'Bạn có Xóa chứng chỉ ngoại ngữ/văn bằng trên?', true, isConfirm => isConfirm && this.handleChungChiNgoaiNgu('delete', item))} />
                </tr>
            )
        });

        return (
            <div className='mt-5 sdh-bieu-mau'>
                <ConfirmModal ref={e => this.modalConfirm = e} send={this.props.sendMailThongTinDangNhap} sendMaXacNhan={this.props.sendMailXacNhanDangKy} createTsSdh={this.props.createTsSdh} />
                <NgoaiNguModal ref={e => this.modalNgoaiNgu = e} readOnly={false} temp={true} setData={this.handleChungChiNgoaiNgu} />
                <BaiBaoModal ref={e => this.modalBaiBao = e} readOnly={false} temp={true} setData={this.handleBaiBao} />
                <BaiBaoTSModal ref={e => this.modalBaiBaoTs = e} readOnly={false} temp={true} setData={this.handleBaiBaoTs} />

                <div className='mt-2 pa'>
                    <h1 className='text-primary text-center'>Biểu mẫu đăng ký tuyển sinh</h1>
                </div>
                <div className='tile'>
                    <h3 className='tile-title p-15'>Thông tin cơ bản</h3>
                    <div className='row'>
                        <FormTextBox type='text' ref={e => this.ho = e} label='Họ và tên lót' className='col-md-4 uppercase' required />
                        <FormTextBox ref={e => this.ten = e} label='Tên' className='col-md-4 uppercase' required />
                        <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' className='col-md-4' data={SelectAdapter_BmdkGioiTinh} required />
                        <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='col-md-3' required />
                        <FormSelect ref={e => this.noiSinh = e} data={!this.state.isNotVn ? ajaxSelectTinhThanhPho : SelectAdapter_BmdkDmQuocGia} placeholder={!this.state.isNotVn ? 'Tỉnh/Thành phố' : 'Quốc gia'} readOnly={false} className='col-md-3' labelStyle={{ marginBottom: '0' }}
                            label={<>Nơi sinh <span style={{ color: 'red' }}>*</span> &nbsp;<FormCheckbox ref={e => this.isNotVn = e} label='Khác' readOnly={false} style={{ display: 'inline' }} onChange={value => this.onChangeCheckbox(value, 'isVn')} /></>} />
                        <FormSelect ref={e => this.danToc = e} label='Dân tộc' data={SelectAdapter_BmdkDanToc} className='col-md-3' required={this.state.isNotVn ? false : true} readOnly={this.state.isNotVn} />
                        <FormSelect ref={e => this.doiTuongUuTien = e} label='Đối tượng ưu tiên' className='col-md-3' data={SelectAdapter_BmdkDoiTuongUuTien} allowClear />
                        <FormSelect ref={e => this.nganhDuTuyen = e} data={SelectAdapter_ChkttsNganh(filter)} required label='Ngành dự tuyển' className='col-md-12' />
                        {
                            //Điều kiện ẩn render Bổ túc kiến thức là cao học tuyển thẳng và xét tuyển
                            this.state.phanHe == '02' && (this.state.hinhThuc == '02' || this.state.hinhThuc == '03') ? '' : <>
                                <div className='col-md-12' style={{ color: 'red' }}>* Thí sinh tốt nghiệp ngành gần, ngành khác chưa học BSKT, phải đăng ký BSKT tại phòng Quản lý Đào tạo - Sau đại học trước ngày 16/03/2024!</div>
                                <FormCheckbox ref={e => this.btkt = e} label='Bổ sung kiến thức' readOnly={false} className='col-md-12' />
                            </>
                        }
                        <FormTextBox ref={e => this.ngheNghiep = e} label='Nghề nghiệp / Chức vụ' className='col-md-6' />
                        <FormTextBox ref={e => this.donVi = e} label='Đơn vị công tác' className='col-md-6' />
                        <FormTextBox type='phone' ref={e => this.dienThoai = e} label='Điện thoại' className='col-md-6' required />
                        <FormTextBox ref={e => this.email = e} id='email' label='Email' placeholder='Email dùng để đăng nhập sau khi đăng ký thành công' className='col-md-6' required />
                        <ComponentDiaDiem ref={e => this.diaChi = e} label='Địa chỉ liên hệ' className='col-md-12' requiredAll={true} requiredSoNhaDuong={true} />
                        <FormRichTextBox ref={e => this.ghiChu = e} label='Ghi chú' className='col-md-12' />
                    </div>
                </div><hr />
                <div className='tile'>
                    <h3 className='tile-title p-15'>Quá trình đào tạo</h3>
                    {isVanBangDh ? (
                        <>
                            <h5 className='tile-sub p-15'><i className='fa fa-pencil' aria-hidden='true'> Văn bằng đại học </i></h5>
                            <div className='row'>
                                <FormCheckbox ref={e => this.isTruongDhKhac = e} className='col-md-12' onChange={value => this.setState({ isTruongDhKhac: value })} label='Trường khác' />
                                {
                                    isTruongDhKhac ?
                                        <FormTextBox key='truongTn' ref={e => this.truongTnDh = e} label='Trường tốt nghiệp' className='col-md-4' required />
                                        : <FormSelect key='truongTn' ref={e => this.truongTnDh = e} label='Trường tốt nghiệp' className='col-md-4' data={SelectAdapter_DmTruong} required />
                                }
                                {/* <FormTextBox ref={e => this.truongTnDh = e} label='Trường tốt nghiệp' className='col-md-4' required /> */}
                                <FormTextBox ref={e => this.nganhTnDh = e} label='Ngành tốt nghiệp' className='col-md-4' required />
                                <FormTextBox type='year' ref={e => this.namTnDh = e} label='Năm tốt nghiệp' className='col-md-2' required />
                                <FormSelect ref={e => this.heTnDh = e} data={this.selectHeDaoTao} label='Hệ đại học' className='col-md-2' required />
                                <FormTextBox type='number' allowNegative={false} min='0' max='10' step={true} decimalScale='2' ref={e => this.diemTnDh = e} label='Điểm trung bình đại học' className='col-md-4' />
                                <FormSelect ref={e => this.xepLoaiTnDh = e} label='Xếp loại tốt nghiêp' data={this.selectLoaiTotNghiep} className='col-md-4' />
                                {/* <FormTextBox ref={e => this.maTnDh = e} label='Mã văn bằng' className='col-md-4' /> */}
                            </div>
                        </>) : null}
                    {isVanBangTs ? (
                        <>
                            <hr></hr>
                            <strong className='col-md-12 text-danger' style={{ paddingLeft: 15 }}>* Trường hợp không có văn bằng thạc sĩ có thể bỏ qua tuỳ chọn nhập dưới đây</strong><br />

                            <h5 className='tile-sub p-15'><i className='fa fa-pencil' aria-hidden='true'> Văn bằng thạc sĩ</i></h5>
                            <div className='row'>
                                <FormCheckbox ref={e => this.isTruongThsKhac = e} className='col-md-12' onChange={value => this.setState({ isTruongThsKhac: value })} label='Trường khác' />
                                {
                                    isTruongThsKhac ?
                                        <FormTextBox ref={e => this.truongTnThs = e} label='Trường tốt nghiệp thạc sĩ' className='col-md-4' />
                                        :
                                        <FormSelect ref={e => this.truongTnThs = e} label='Trường tốt nghiệp thạc sĩ' className='col-md-4' data={SelectAdapter_DmTruong} />
                                }
                                {/* <FormTextBox ref={e => this.truongTnThs = e} label='Trường tốt nghiệp' className='col-md-4' /> */}
                                <FormTextBox ref={e => this.nganhTnThs = e} label='Ngành tốt nghiệp ' className='col-md-4' />
                                <FormTextBox type='year' ref={e => this.namTnThs = e} label='Năm tốt nghiệp' className='col-md-2' />
                                <FormSelect ref={e => this.heTnThs = e} label='Hệ thạc sĩ' data={this.selectHeDaoTao} className='col-md-2' />
                                <FormTextBox type='number' allowNegative={false} min='0' max='10' step={true} decimalScale='2' ref={e => this.diemTnThs = e} label='Điểm trung bình thạc sĩ' className='col-md-4' />
                                <FormSelect ref={e => this.xepLoaiTnThs = e} data={this.selectLoaiTotNghiep} label='Xếp loại tốt nghiêp' className='col-md-4' />
                                {/* <FormTextBox ref={e => this.maTnThs = e} label='Mã văn bằng' className='col-md-4' /> */}
                            </div>
                        </>) : null}
                </div>
                <hr />
                <div className='tile'>
                    <h3 className='tile-title p-15' ref={e => this.ngoaiNgu = e}>Ngoại ngữ</h3>
                    {/* Tạm ẩn */}
                    {/* <strong className='text-danger p-15'> Quy trình, thông tin, quy định liên quan đến Ngoại ngữ xem chi tiết <a href='' style={{ textDecoration: 'none', color: 'red' }}>tại đây</a>. </strong><br /> */}
                    <FormCheckbox ref={e => this.optionNgoaiNgu = e} label='Xét tuyển Chứng chỉ/Văn bằng ngoại ngữ' onChange={value => this.onChangeCheckbox(value)} className='col-md-12' allowClear readOnly={readOnlyCCNN} value={isCCNN} />
                    {isCCNN ? (<>
                        <h5 className='tile-sub p-15'><i className='fa fa-pencil' aria-hidden='true'> Chứng chỉ/Văn bằng ngoại ngữ</i></h5>
                        <h5 className='tile-sub p-15' style={{ color: '#0e2399' }}><i className='fa fa-sign-in' aria-hidden='true'> Thông tin Chứng chỉ/Văn bằng ngoại ngữ đã thêm</i></h5>
                        <div className='tile-body p-15'>
                            {tableChungChi}
                        </div>
                        {!this.state.data.chungChiNgoaiNgu.idCcnn ? <div className='d-flex justify-content-begin p-15'>
                            <button type='button' className='btn btn-primary rounded-0' data-dismiss='modal' onClick={(e) => e.preventDefault() || this.modalNgoaiNgu.show({ id: this.state.data?.dataCoBan?.id })}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm
                            </button>
                        </div> : null}
                    </>) : (<>
                        <h5 className='tile-sub p-15'><i className='fa fa-pencil' aria-hidden='true'> Thi ngoại ngữ</i></h5>
                        <FormSelect ref={e => this.kiemTraNgoaiNgu = e} label='Đăng ký môn thi ngoại ngữ' className='col-md-12 p-15' data={SelectAdapter_BmdkMonThiNgoaiNgu({ idDot })} allowClear />
                    </>)}

                    <hr />
                </div>

                {isDeTai ? <div className='tile'>
                    <h3 className='tile-title p-15' style={{ marginBottom: '5px' }}>Công trình khoa học thí sinh</h3>
                    <strong className='text-danger p-15'> * Xin vui lòng điền đầy đủ thông tin bên dưới và nhấn nút thêm để lưu công trình khoa học của thí sinh</strong>
                    <div className='row'>
                        {this.componentBaiBaoTs()}
                    </div>
                    <h3 className='tile-title p-15' style={{ marginBottom: '5px' }}>Đề tài đăng ký</h3>
                    <div className='row'>
                        <FormTextBox ref={e => this.tenDeTai = e} label='Tên đề tài' className='col-md-12' required />
                        <h5 className='tile-sub col-md-12' style={{ marginBottom: '5px' }}>Thông tin nguời hướng dẫn</h5><br />
                        <strong className='col-md-12 text-danger' style={{ paddingLeft: 15 }}>*Trường hợp không tìm thấy cán bộ hướng dẫn (CBHD) hoặc CBHD là cán bộ ngoài trường, vui lòng nhập ở ghi chú theo mẫu</strong><br />
                        {this.componentCbhd()}
                        {/* <h6 className='tile-sub col-md-12' style={{ marginBottom: '5px' }}>Thông tin đã thêm</h6><br /> */}
                        {/* {tableCbhd} */}
                    </div>
                    <hr />

                </div> : null}
                <div className='d-flex justify-content-center mt-3 mb-3'>
                    <button type='button' className='btn btn-lg btn-outline-success px-5 rounded-0 mr-1' onClick={() => this.handleSave()}>
                        Đăng ký
                    </button>
                    {/* Đoạn này về sau sync
                    <button type='button' className='btn btn-lg btn-outline-secondary px-5 rounded-0' onClick={e => e.preventDefault() || !this.getAndValidate() ? T.notify('<b>' + 'Vui lòng điền đầy đủ thông tin cần thiết' + '</b> ', 'danger') : this.modal.show(this.getAndValidate())}>
                        Xem trước
                    </button> */}
                </div>

                {/* <BieuMauModal ref={e => this.modal = e} ttBieuMau={this.state.ttBieuMau} idPhanHe={idPhanHe} dataBieuMau={this.state.dataBieuMau} isCCNN={this.state.isCCNN} /> */}
            </div >

        );
    }
}

const mapStateToProps = state => ({ system: state.system, svTsSdh: state.sdh.svTsSdh });
const mapActionsToProps = {
    createTsSdh, getSdhTsThongTinBieuMau, sendMailXacNhanDangKy, preCheckEmailRegister, sendMailThongTinDangNhap
};
export default connect(mapStateToProps, mapActionsToProps)(BieuMauTuyenSinhSdhPage);
