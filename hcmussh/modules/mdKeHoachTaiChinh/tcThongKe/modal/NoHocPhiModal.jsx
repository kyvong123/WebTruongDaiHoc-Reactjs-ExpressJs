import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { thongKeNoHocPhi, thongKeNoHocPhiLength, thongKeNoHocPhiSendEmail } from '../redux';
import FileBox from 'view/component/FileBox';

const schoolYearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const year = i + new Date().getFullYear() - 14;
        return { id: year, text: `${year} - ${year + 1}` };
    });
};

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const year = i + new Date().getFullYear() - 14;
        return { id: year, text: year };
    });
};

const loaiThongKe = [
    { id: 1, text: 'Theo bộ lọc' },
    { id: 2, text: 'Theo danh sách' }
];

class ThongKeNoHocPhi extends AdminModal {
    state = { isSubmitting: false, loaiThongKe: 1, checkSendMail: false, countSv: 0 }

    onShow = () => {
        this.loaiThongKe.value(this.state.loaiThongKe || 1);
        this.namHoc.value('');
        this.hocKy.value('');
        this.bacDaoTao.value('');
        this.heDaoTao.value('');
        this.namTuyenSinh.value('');
        this.khoaSinhVien.value('');
        this.khoa.value('');
        this.nganh.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
        const filter = {
            namHoc: getValue(this.namHoc).toString(),
            hocKy: getValue(this.hocKy).toString(),
            bacDaoTao: getValue(this.bacDaoTao).toString(),
            heDaoTao: getValue(this.heDaoTao).toString(),
            namTuyenSinh: getValue(this.namTuyenSinh).toString(),
            khoaSinhVien: getValue(this.khoaSinhVien).toString(),
            khoa: getValue(this.khoa).toString(),
            nganh: getValue(this.nganh).toString(),
        };

        if (this.state.loaiThongKe == 1) {
            this.props.thongKeNoHocPhi(T.stringify(filter), length => this.setState({ checkSendMail: true, countSv: length || 0 }));
        }
        else if (this.state.loaiThongKe == 2) {
            this.fileBox.onUploadFile({});
        }
    }

    onSuccess = (result) => {
        if (this.state.loaiThongKe == 2) {
            if (result.error) {
                T.alert('Xuất thống kê nợ học phí bị lỗi', 'danger', false, 800);
                console.error(result.error);
            } else {
                T.alert('Xuất thống kê nợ học phí thành công', 'success', false, 800);
                T.FileSaver(new Blob([new Uint8Array(result.buffer.data)]), result.filename);
                // this.setState({ checkSendMail: true });
            }
        }
    }

    sendEmailNhacNo = () => {
        const filter = {
            namHoc: getValue(this.namHoc).toString(),
            hocKy: getValue(this.hocKy).toString(),
            bacDaoTao: getValue(this.bacDaoTao).toString(),
            heDaoTao: getValue(this.heDaoTao).toString(),
            namTuyenSinh: getValue(this.namTuyenSinh).toString(),
            khoaSinhVien: getValue(this.khoaSinhVien).toString(),
            khoa: getValue(this.khoa).toString(),
            nganh: getValue(this.nganh).toString(),
        };

        T.confirm('Xác nhận gửi e-mail nhắc nợ',
            `<p>Số e-mail gửi sinh viên: <b>${this.state.countSv}</b></p><p>Vui lòng kiểm tra lại số lượng và xác nhận</p></>`,
            isConfirm => isConfirm && this.props.thongKeNoHocPhiSendEmail(T.stringify(filter), () => {
                // this.hide();
            }));
    }

    render = () => {
        return this.renderModal({
            title: 'Thống kê nợ học phí',
            size: 'large',
            isLoading: this.state.isSubmitting,
            submitText: 'Tải xuống',
            buttons: <>
                {this.state.checkSendMail && this.state.loaiThongKe == 1 && <button className='btn btn-warning' onClick={e => e.preventDefault() || this.sendEmailNhacNo()}>
                    <i className='fa fa-envelope-o' /> Gửi email nhắc nợ
                </button>}
            </>,
            body: <div className='row'>
                <FormSelect ref={e => this.loaiThongKe = e} label='Chọn loại thống kê' data={loaiThongKe} onChange={value => this.setState({ loaiThongKe: value?.id || 1, checkSendMail: false, countSv: 0 })} className='col-md-12' required />
                <FormSelect ref={e => this.namHoc = e} label='Năm học' data={schoolYearDatas()?.reverse()} onChange={() => this.setState({ checkSendMail: false, countSv: 0 })} className={`col-md-6 ${this.state.loaiThongKe == 1 ? '' : 'd-none'}`} allowClear multiple />
                <FormSelect ref={e => this.hocKy = e} label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={() => this.setState({ checkSendMail: false, countSv: 0 })} className={`col-md-6 ${this.state.loaiThongKe == 1 ? '' : 'd-none'}`} allowClear multiple />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} onChange={() => this.setState({ checkSendMail: false, countSv: 0 })} className={`col-md-6 ${this.state.loaiThongKe == 1 ? '' : 'd-none'}`} allowClear multiple />
                <FormSelect ref={e => this.heDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} onChange={() => this.setState({ checkSendMail: false, countSv: 0 })} className={`col-md-6 ${this.state.loaiThongKe == 1 ? '' : 'd-none'}`} allowClear multiple />
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={yearDatas()?.reverse()} onChange={() => this.setState({ checkSendMail: false, countSv: 0 })} className={`col-md-6 ${this.state.loaiThongKe == 1 ? '' : 'd-none'}`} allowClear multiple />
                <FormSelect ref={e => this.khoaSinhVien = e} label='Khóa sinh viên' data={yearDatas()?.reverse()} onChange={() => this.setState({ checkSendMail: false, countSv: 0 })} className={`col-md-6 ${this.state.loaiThongKe == 1 ? '' : 'd-none'}`} allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} onChange={() => this.setState({ checkSendMail: false, countSv: 0 })} className={`col-md-12 ${this.state.loaiThongKe == 1 ? '' : 'd-none'}`} allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành đào tạo' data={SelectAdapter_DtNganhDaoTao} onChange={() => this.setState({ checkSendMail: false, countSv: 0 })} className={`col-md-12 ${this.state.loaiThongKe == 1 ? '' : 'd-none'}`} allowClear multiple />
                <div className={`col-md-12 ${this.state.loaiThongKe == 2 ? '' : 'd-none'}`}>
                    Tải file excel mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/khtc/thong-ke/thong-ke-no-hoc-phi/template')}>đây</a>
                </div>
                <FileBox pending={true} ref={e => this.fileBox = e} className={`col-md-12 ${this.state.loaiThongKe == 2 ? '' : 'd-none'}`} postUrl='/user/upload' uploadType='TcUploadListNo' userData='TcUploadListNo' success={this.onSuccess} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { thongKeNoHocPhi, thongKeNoHocPhiLength, thongKeNoHocPhiSendEmail };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ThongKeNoHocPhi);
