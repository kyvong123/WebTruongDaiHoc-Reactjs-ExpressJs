import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormRichTextBox, FormTextBox, FormEditor } from 'view/component/AdminPage';
import { gvLichGiangDayBaoNghi } from './redux';
import { getEmailSettings } from 'modules/mdDaoTao/dtSettings/redux';

class BaoNghiModal extends AdminModal {

    state = { emailSetting: {} }
    componentDidMount() {
        this.props.getEmailSettings(['baoNghiTitle', 'baoNghiEditorText', 'baoNghiEditorHtml'], value => this.setState({ emailSetting: value }));
    }

    onShow = (item) => {
        this.setState({ ngayNghi: item, isWait: null }, () => {
            const { ngayHoc, thu, tietBatDau, soTietBuoi, maHocPhan, tenMonHoc, dataTenGiangVien, phong } = item,
                { emailSetting } = this.state;
            let noiDung = emailSetting['baoNghiEditorHtml'].replaceAll('{tenMonHoc}', T.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan).replaceAll('{teacher}', dataTenGiangVien || '').replaceAll('{thoiGianNghi}', `Ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong}`).replaceAll('{lyDo}', '');

            this.subject.value(emailSetting['baoNghiTitle'].replaceAll('{tenMonHoc}', T.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan));
            this.noiDung.html(noiDung);
        });
    }

    onSubmit = () => {
        let { ngayNghi } = this.state,
            { idTuan, idThoiKhoaBieu, maHocPhan, ngayHoc, ngayBatDau, ngayKetThuc, thu, tietBatDau, soTietBuoi, phong, dataTenGiangVien, tenMonHoc } = ngayNghi,
            noiDung = this.noiDung?.value(),
            subject = this.subject?.value(),
            mailCc = this.mailCc?.value();

        if (mailCc && !T.validateEmail(mailCc)) return T.alert('Email không hợp lệ!', 'error', false, 2000);

        this.setState({ isWait: 1 });
        T.alert('Đang xử lý!', 'warning', false, null, true);
        this.props.gvLichGiangDayBaoNghi({
            maHocPhan, ngayBatDau, idTuan, idThoiKhoaBieu, ngayHoc, ngayKetThuc,
            thu, tietBatDau, soTietBuoi, phong, dataTenGiangVien, tenMonHoc,
            ghiChu: this.lyDo.value(), isGiangVienBaoNghi: 1, noiDung, subject, mailCc,
        }, () => {
            this.props.baoNghi();
            this.lyDo.value('');
            this.subject?.value('');
            this.noiDung?.value('');
            this.hide();
        });
    }

    render = () => {
        let { ngayHoc, thu, tietBatDau, soTietBuoi, maHocPhan, tenMonHoc, dataTenGiangVien, phong } = this.state.ngayNghi || {}, { isWait, emailSetting } = this.state;

        return this.renderModal({
            title: `Báo nghỉ ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${tietBatDau + soTietBuoi - 1}, tuần ${new Date(ngayHoc).getWeek()}`,
            size: 'large',
            isShowSubmit: false,
            body: <div className='row'>
                <FormRichTextBox ref={e => this.lyDo = e} type='text' className='col-md-12' label='Lý do nghỉ' onChange={e => this.setState({ lyDo: e.target.value }, () => {
                    let noiDung = emailSetting['baoNghiEditorHtml'].replaceAll('{tenMonHoc}', T.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan).replaceAll('{teacher}', dataTenGiangVien || '').replaceAll('{thoiGianNghi}', `Ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${phong}`).replaceAll('{lyDo}', e.target.value || '');
                    this.noiDung.html(noiDung);
                })} />
                <FormTextBox label='Ghi chú' className='col-md-12' value='Thông báo nghỉ này sẽ được gửi email cho tất cả sinh viên trong lớp học phần này' readOnly />
                <FormTextBox ref={e => this.mailCc = e} className='col-md-12' label='MailCC' />
                <FormTextBox ref={e => this.subject = e} className='col-md-12' label='Tiêu đề' readOnly />
                <FormEditor ref={e => this.noiDung = e} className='col-md-12' label='Nội dung' readOnly height={400} />
            </div>,
            postButtons: <button type='submit' className='btn btn-danger' disabled={isWait}>
                <i className={isWait ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-fw fa-lg fa-power-off'} /> Báo nghỉ
            </button>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtTkbConfig: state.daoTao.dtTkbConfig });
const mapActionsToProps = {
    gvLichGiangDayBaoNghi, getEmailSettings,
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoNghiModal);