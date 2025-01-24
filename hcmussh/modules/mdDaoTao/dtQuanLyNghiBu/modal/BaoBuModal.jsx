import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox, getValue, FormDatePicker, FormCheckbox, FormEditor } from 'view/component/AdminPage';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DmPhongCustomFilter } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import { DtTKBCustomBaoBuCreate, DtTKBCustomBaoBuUpdate, DtThoiKhoaBieuGetDataHocPhan } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';



class BaoBuModal extends AdminModal {
    state = { dataBu: {} }

    template = `
    <p>Ch&agrave;o c&aacute;c bạn sinh vi&ecirc;n,</p>

    <p>Ph&ograve;ng Quản l&yacute; Đ&agrave;o tạo gửi c&aacute;c bạn th&ocirc;ng tin học b&ugrave; như sau:</p>

    <ul>
	    <li>M&ocirc;n học: {tenMonHoc}</li>
	    <li>M&atilde; lớp học phần: {maHocPhan}</li>
	    <li>Giảng vi&ecirc;n phụ tr&aacute;ch: {teacher}</li>
	    <li>Thời gian b&ugrave;: {thoiGianBu}</li>
    </ul>

    <p>Email n&agrave;y được gửi từ hệ thống email tự động.</p>

    <p>Xin vui l&ograve;ng kh&ocirc;ng trả lời email n&agrave;y.</p>

    <p>Th&acirc;n mến.</p>
    `;

    componentDidMount() {
        $(document).ready(() => {
            this.onHidden(() => {
                this.setState({
                    isChooseNgay: false, isChooseTiet: false, isChooseSoTiet: false,
                    dataBu: {}, idBu: null, isWait: null, isMail: false,
                }, () => {
                    this.ngayBatDau.value('');
                    this.thu.value('');
                    this.tietBatDau.value('');
                    this.soTiet.value('');
                    this.ngayNghi.value('');
                    this.coSo.value('');
                    this.isSendEmail.value('');
                });
            });
        });
    }

    onShow = (item) => {
        T.alert('Đang load dữ liệu', 'warning', false, null, true);
        this.props.DtThoiKhoaBieuGetDataHocPhan(item.maHocPhan, data => {
            const { dataTiet, listTuanHoc } = data,
                tuanHoc = listTuanHoc.find(i => i.idTuan == item.id);

            let { maHocPhan, ngayHoc, thu, tietBatDau, phong, soTietBuoi, coSo, shccGiangVien, shccTroGiang } = tuanHoc;
            if (item.isEdit) {
                let ngayNghi = listTuanHoc.find(i => i.idTuan == item.idNgayNghi);
                this.setState({
                    coSo, item: tuanHoc, isEdit: item.isEdit, isChooseNgay: true, isChooseTiet: true, isChooseSoTiet: true,
                    dataBu: { ngayBu: ngayHoc, tietBatDau, thu, soTietBuoi }, maHocPhan, dataTiet, listTuanHoc
                }, () => {
                    this.ngayNghi.value(`Ngày ${T.dateToText(ngayNghi.ngayHoc, 'dd/mm/yyyy')}, thứ ${ngayNghi.thu}, tiết ${ngayNghi.tietBatDau} - ${ngayNghi.tietBatDau + ngayNghi.soTietBuoi - 1}, tuần ${new Date(ngayNghi.ngayHoc).getWeek()}`);
                    this.ngayBatDau.value(ngayHoc);
                    this.thu.value(thu);
                    this.tietBatDau.value(tietBatDau);
                    this.soTiet.value(soTietBuoi);
                    this.phong.value(phong);
                    this.giangVien.value(shccGiangVien);
                    this.troGiang.value(shccTroGiang);
                    this.coSo.value(coSo);
                });
            } else {
                this.setState({ maHocPhan, coSo, item: tuanHoc, dataTiet, isEdit: item.isEdit, listTuanHoc }, () => {
                    this.ngayNghi.value(`Ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${tietBatDau + soTietBuoi - 1}, tuần ${new Date(ngayHoc).getWeek()}`);
                    this.giangVien.value(shccGiangVien);
                    this.troGiang.value(shccTroGiang);
                    this.coSo.value(coSo);
                });
            }
            T.alert('Load dữ liệu thành công', 'success', false, 1000);
        });
    }

    checkTrung = (data) => {
        const { soTietBuoi, tietBatDau, ngayBu } = data, { listTuanHoc } = this.state;
        return listTuanHoc.find(item => {
            const { soTietBuoi: iSoTietBuoi, tietBatDau: iTietBatDau, ngayHoc } = item;
            let tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;
            let iTietKetThuc = parseInt(iTietBatDau) + parseInt(iSoTietBuoi) - 1;
            return !(iTietKetThuc < parseInt(tietBatDau) || parseInt(iTietBatDau) > tietKetThuc) && ngayHoc == ngayBu;
        });
    }

    checkBu = (item, soTietBuoi) => {
        let { listTuanHoc } = this.state;
        let dataBu = listTuanHoc.filter(i => i.idNgayNghi == item.idTuan),
            sumTietBu = dataBu.reduce((a, b) => a + parseInt(b.soTietBuoi), 0);

        if ((sumTietBu + soTietBuoi) > item.soTietBuoi) {
            T.notify('Tổng số tiết bù lớn hơn số tiết của ngày nghỉ', 'danger');
            return false;
        }
        return true;
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        try {
            let { dataBu, isEdit, item, dataTiet, coSo } = this.state;
            let { ngayBu, tietBatDau, thu, soTietBuoi } = dataBu;

            if (!isEdit && !this.checkBu(item, soTietBuoi)) {
                return;
            }

            let tietHoc = dataTiet.filter(i => i.maCoSo == coSo).find(tiet => tiet.ten == tietBatDau);
            let tietKetThuc = dataTiet.filter(i => i.maCoSo == coSo).find(tiet => tiet.ten == (tietBatDau + soTietBuoi - 1));

            if (!tietKetThuc) {
                T.notify('Không tồn tại tiết kết thúc', 'danger');
                return;
            }

            let [gioBatDau, phutBatDau] = tietHoc.thoiGianBatDau.split(':');
            let [gioKetThuc, phutKetThuc] = tietKetThuc.thoiGianKetThuc.split(':');

            let ngayBatDau = new Date(ngayBu).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
            let ngayKetThuc = new Date(ngayBu).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

            let data = {
                thu, tietBatDau, soTietBuoi, ngayBatDau, ngayKetThuc,
                phong: getValue(this.phong), ngayBu, coSo,
                isSendEmail: Number(this.isSendEmail.value()),
                emailTo: this.emailTo.value(),
                noiDung: this.noiDung?.value(),
                subject: this.subject?.value(),
            };
            if (!isEdit && this.checkTrung(data)) {
                T.notify('Trùng thời gian với lịch học khác của học phần!', 'danger');
                return;
            }

            let dataGiangVien = [];
            if (getValue(this.giangVien)) {
                this.giangVien.value().forEach(i => {
                    dataGiangVien.push({ giangVien: i, type: 'GV' });
                });
            }
            if (getValue(this.troGiang)) {
                this.troGiang.value().forEach(i => {
                    dataGiangVien.push({ giangVien: i, type: 'TG' });
                });
            }
            data.dataGiangVien = dataGiangVien;
            if (isEdit) {
                let { idTuan, idThoiKhoaBieu, ngayBatDau, ngayKetThuc, tenMonHoc, maHocPhan, namHoc, hocKy } = item;
                this.setState({ isWait: true });
                this.props.DtTKBCustomBaoBuUpdate({ idTuan, idThoiKhoaBieu, ngayBatDau, ngayKetThuc, tenMonHoc, maHocPhan, namHoc, hocKy }, data, () => {
                    this.hide();
                    this.props.handleBu();
                });
            } else {
                this.setState({ isWait: true });
                this.props.DtTKBCustomBaoBuCreate(data, item, () => {
                    this.hide();
                    this.props.handleBu.getPageBu();
                });
            }
        } catch (error) {
            console.error(error);
        }
    }

    handleChangeNgay = (value) => {
        let ngayBatDau = (new Date(value)).setHours(0, 0, 0, 0);
        let thuBatDau = new Date(ngayBatDau).getDay() + 1;
        if (thuBatDau == 1) thuBatDau = 8;
        this.setState({ isChooseNgay: true, dataBu: { ...this.state.dataBu, ngayBu: ngayBatDau, thu: thuBatDau } }, () => {
            this.thu.value(thuBatDau);
            this.phong.value('');
        });
    }

    render = () => {
        let { isChooseNgay, isChooseTiet, isChooseSoTiet, dataBu, isEdit, coSo, isWait, item, isMail } = this.state,
            { tenMonHoc, maHocPhan } = item || {},
            isShow = isChooseNgay && isChooseTiet && isChooseSoTiet;

        return this.renderModal({
            title: `Lịch báo bù học phần ${maHocPhan || ''}`,
            size: 'large',
            isShowSubmit: isShow,
            isLoading: isWait,
            body: <div className='row' >
                <FormTextBox ref={e => this.ngayNghi = e} readOnly={true} className='col-md-12' label='Bù cho ngày nghỉ' required />
                <FormSelect ref={e => this.coSo = e} className='col-md-2' readOnly={isEdit} label='Cơ sở' data={SelectAdapter_DmCoSo} required onChange={value => this.setState({ coSo: value.id }, () => {
                    this.phong.value('');
                    this.tietBatDau.value('');
                })} />
                <FormDatePicker ref={e => this.ngayBatDau = e} readOnly={isEdit} className='col-md-3' label='Ngày bù' type='date' required onChange={this.handleChangeNgay} />
                <FormSelect ref={e => this.thu = e} readOnly={isEdit} className='col-md-2' label='Thứ' data={SelectAdapter_DtDmThu} disabled={true} />
                <FormSelect ref={e => this.tietBatDau = e} readOnly={isEdit} className='col-md-3' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(coSo)} minimumResultsForSearch={-1} required onChange={(value) => this.setState({ isChooseTiet: true, dataBu: { ...dataBu, tietBatDau: value.id } }, () => this.phong.value(''))} />
                <FormTextBox type='number' ref={e => this.soTiet = e} readOnly={isEdit} className='col-md-2' label='Số tiết bù' required onChange={(value) => this.setState({ isChooseSoTiet: !!value, dataBu: { ...dataBu, soTietBuoi: value } }, () => this.phong.value(''))} />
                <FormSelect style={{ display: isShow ? '' : 'none' }} ref={e => this.phong = e} className='col-md-2' label='Phòng' data={SelectAdapter_DmPhongCustomFilter({ coSo, ngayHoc: dataBu.ngayBu, tietBatDau: dataBu.tietBatDau, soTietBuoi: dataBu.soTietBuoi })} required />
                <FormSelect style={{ display: isShow ? '' : 'none' }} ref={e => this.giangVien = e} className='col-md-5' label='Chọn giảng viên' data={SelectAdapter_FwCanBoGiangVien} allowClear={true} multiple={true} />
                <FormSelect style={{ display: isShow ? '' : 'none' }} ref={e => this.troGiang = e} className='col-md-5' label='Chọn trợ giảng' data={SelectAdapter_FwCanBoGiangVien} allowClear={true} multiple={true} />
                <FormCheckbox ref={e => this.isSendEmail = e} className='col-md-4' label='Gửi email' value={false} onChange={e => this.setState({ isMail: e }, () => {
                    let noiDung = this.template.replaceAll('{tenMonHoc}', T.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan);
                    this.subject.value(`Thông báo học bù môn ${T.parse(tenMonHoc, { vi: '' })?.vi}. – Mã lớp: ${maHocPhan}.`);
                    this.noiDung.html(noiDung);
                })} />
                <FormTextBox ref={e => this.emailTo = e} className='col-md-8' label='EmailTo' />
                <FormTextBox ref={e => this.subject = e} className='col-md-12' label='Tiêu đề' style={{ display: isMail ? '' : ' none' }} />
                <FormEditor ref={e => this.noiDung = e} className='col-md-12' label='Nội dung' height={400} style={{ display: isMail ? '' : ' none' }} />
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { DtTKBCustomBaoBuCreate, DtTKBCustomBaoBuUpdate, DtThoiKhoaBieuGetDataHocPhan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoBuModal);