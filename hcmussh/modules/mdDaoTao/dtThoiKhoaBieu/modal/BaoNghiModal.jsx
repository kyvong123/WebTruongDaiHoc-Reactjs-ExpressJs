import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormRichTextBox, FormCheckbox, FormTextBox, FormEditor } from 'view/component/AdminPage';
import { DtTKBCustomBaoNghiCreate } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';

class BaoNghiModal extends AdminModal {

    template = `
    <p><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="background-color:#ffffff"><span style="font-family:'Times New Roman'"><span style="color:#222222">Ch&agrave;o c&aacute;c bạn sinh vi&ecirc;n,</span></span></span></span></span></span></p>

    <p><span style="font-size:11pt"><span style="background-color:#ffffff"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">Ph&ograve;ng Quản l&yacute; Đ&agrave;o tạo gửi c&aacute;c bạn th&ocirc;ng tin b&aacute;o nghỉ như sau:</span></span></span></span></span></span></p>
    
    <ul>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">M&ocirc;n học: {tenMonHoc}</span></span></span></span></li>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">M&atilde; lớp học phần: {maHocPhan}</span></span></span></span></li>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">Giảng vi&ecirc;n phụ tr&aacute;ch: {teacher}</span></span></span></span></li>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">Thời gian nghỉ: {thoiGianNghi}</span></span></span></span></li>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">L&yacute; do nghỉ: {lyDo}</span></span></span></span></li>
    </ul>
    
    <p style="text-align:left"><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'">Email n&agrave;y được gửi từ hệ thống email tự động.</span></span></span></span></p>
    <p style="text-align:left"><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'">Xin vui l&ograve;ng kh&ocirc;ng trả lời email n&agrave;y.</span></span></span></span></p>
    <p><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">Th&acirc;n mến.</span></span></span></span></span></p>
    `;

    onShow = (item) => {
        this.setState({ ngayNghi: item, isWait: null, isMail: false }, () => {
            this.isSendEmail.value('');
            this.emailTo.value('');
        });
    }

    onSubmit = () => {
        let { ngayNghi } = this.state,
            { idTuan, idThoiKhoaBieu, maHocPhan, ngayHoc, ngayBatDau, ngayKetThuc, thu, tietBatDau, soTietBuoi, phong, dataTenGiangVien, tenMonHoc, isVang } = ngayNghi;
        const isSendEmail = Number(this.isSendEmail.value()),
            emailTo = this.emailTo.value(),
            noiDung = this.noiDung?.value(),
            subject = this.subject?.value();

        this.setState({ isWait: 1 });
        this.props.DtTKBCustomBaoNghiCreate({
            maHocPhan, ngayBatDau, idTuan, idThoiKhoaBieu, ngayHoc, ngayKetThuc,
            thu, tietBatDau, soTietBuoi, phong, dataTenGiangVien, tenMonHoc,
            ghiChu: this.lyDo.value(), isGiangVienBaoNghi: Number(this.isGiangVienBaoNghi.value()),
            isSendEmail, emailTo, isVang, noiDung, subject,
        }, (data) => {
            this.props.baoNghi(data);
            this.lyDo.value('');
            this.hide();
        });
    }

    render = () => {
        let { ngayHoc, thu, tietBatDau, soTietBuoi, isVang, tenMonHoc, maHocPhan, dataTenGiangVien, phong } = this.state.ngayNghi || {}, { isWait, lyDo, isMail } = this.state,
            display = isVang ? 'none' : '';

        return this.renderModal({
            title: `Báo ${isVang ? 'vắng' : 'nghỉ'} ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${tietBatDau + soTietBuoi - 1}, tuần ${new Date(ngayHoc).getWeek()}`,
            size: 'large',
            isShowSubmit: false,
            body: <div className='row'>
                <FormRichTextBox ref={e => this.lyDo = e} type='text' className='col-md-12' label={`Lý do ${isVang ? 'vắng' : 'nghỉ'}`} onChange={e => this.setState({ lyDo: e.target.value }, () => {
                    if (isMail && !isVang) {
                        let noiDung = e ? this.template.replaceAll('{tenMonHoc}', T.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan).replaceAll('{teacher}', dataTenGiangVien || '').replaceAll('{thoiGianNghi}', `Ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong}`).replaceAll('{lyDo}', e.target.value || '') : '';
                        this.noiDung.html(noiDung);
                    }
                })} />
                <FormCheckbox ref={e => this.isGiangVienBaoNghi = e} className='col-md-6' label='Giảng viên báo nghỉ' value={true} style={{ display }} />
                <FormCheckbox ref={e => this.isSendEmail = e} className='col-md-6' label='Gửi email' value={false} style={{ display }} onChange={e => {
                    this.setState({ isMail: e }, () => {
                        if (e) {
                            let noiDung = e ? this.template.replaceAll('{tenMonHoc}', T.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan).replaceAll('{teacher}', dataTenGiangVien || '').replaceAll('{thoiGianNghi}', `Ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong}`).replaceAll('{lyDo}', lyDo || '') : '';

                            this.subject.value(`Thông báo nghỉ môn ${T.parse(tenMonHoc, { vi: '' })?.vi}. – Mã lớp: ${maHocPhan}.`);
                            this.noiDung.html(noiDung);
                        }
                    });
                }} />
                <FormTextBox ref={e => this.emailTo = e} className='col-md-12' label='EmailTo' style={{ display }} />
                <FormTextBox ref={e => this.subject = e} className='col-md-12' label='Tiêu đề' style={{ display: isVang || !isMail ? 'none' : '' }} />
                <FormEditor ref={e => this.noiDung = e} className='col-md-12' label='Nội dung' style={{ display: isVang || !isMail ? 'none' : '' }} height={400} />
            </div>,
            postButtons: <button type='submit' className='btn btn-danger' disabled={isWait}>
                <i className={isWait ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-fw fa-lg fa-power-off'} /> Báo {isVang ? 'vắng' : 'nghỉ'}
            </button>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtTkbConfig: state.daoTao.dtTkbConfig });
const mapActionsToProps = {
    DtTKBCustomBaoNghiCreate
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoNghiModal);