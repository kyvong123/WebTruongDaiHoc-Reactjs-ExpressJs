import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, FormSelect, FormTabs, FormCheckbox } from 'view/component/AdminPage';
import DanhSachDiemThiPage from './section/diemThiPage';
import NhapDiemThiSinh from './section/nhapDiemThiSinh';
import NhapDiemThiSinhGV from './section/nhapDiemThiSinhGV';
import NhapDiemPhongThi from './section/nhapDiemPhongThi';
import LichSuNhapDiem from './section/quanLyNhapDiem';
import NhapDiemExcel from './section/nhapDiemExcel';
import { Link } from 'react-router-dom';
import { getSdhTsProcessingDot, updateSdhTsInfoTimeStatus } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import { SelectAdapter_PhanHe } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { SelectAdapter_NganhTsAll } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
import { SelectAdapter_HinhThuc } from 'modules/mdSauDaiHoc/sdhTsHinhThuc/redux';
import { ProcessModal } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/processModal';
import { exportSdhTsKetQuaThiPdf } from './redux';
import PreviewPdf from 'modules/mdSauDaiHoc/sdhTsDmBieuMau/PreviewPdf';

class ExportDiemThiModal extends AdminModal {
    state = { cheDoIn: 'pdf' };

    onShow = () => {
        this.cheDoIn.value(this.state.cheDoIn);
    }

    onSubmit = () => {
        const { maPhanHe, maNganh, maHinhThuc } = this.state;
        const data = { idDot: this.props.idDot, maPhanHe, maNganh, maHinhThuc };
        if (this.state.cheDoIn == 'excel') {
            T.handleDownload(`/api/sdh/ts/ket-qua-thi/export-scan-excel?data=${T.stringify(data)}`);
            this.hide();
        } else {
            this.props.exportPdf(data, () => {
                this.hide();
                this.props.processModal.show();
            });
        }
    }


    render = () => {
        return this.renderModal({
            title: 'Xuất kết quả thi',
            size: 'elarge',
            isShowSubmit: this.state.selectedNganh,
            submitText: 'In kết quả thi',
            body: <div className='row' >
                <FormSelect className='col-md-3' ref={e => this.phanHe = e} data={SelectAdapter_PhanHe(this.props.idDot)} label='Phân hệ' required onChange={value => this.setState({ selectedPhanHe: value.idPhanHe, maPhanHe: value.id }, () => {
                    this.nganh.value('');
                    this.hinhThuc.value('');
                })} />
                <FormSelect className='col-md-3' ref={e => this.hinhThuc = e} data={SelectAdapter_HinhThuc(this.state.selectedPhanHe)} label='Phương thức' required onChange={value => this.setState({ maHinhThuc: value.id }, () => this.nganh.value(''))} />
                <FormSelect className='col-md-3' ref={e => this.nganh = e} data={SelectAdapter_NganhTsAll(this.state.selectedPhanHe)} label='Ngành' onChange={(value) => this.setState({ idNganh: value.idNganh, maNganh: value.id })} />
                <FormSelect className='col-md-3' ref={e => this.cheDoIn = e} data={[{ id: 'pdf', text: 'Pdf' }, { id: 'excel', text: 'Exel' }]} label='Chế độ in' onChange={({ id }) => this.setState({ cheDoIn: id })} />
            </div>
        });
    }

}
class QuanLyDiemThiPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = {};
    componentWillUnmount() {
        T.socket.off('export-diem-thi-done');
    }
    componentDidMount() {
        const user = this.props.system.user.email;
        this.props.getSdhTsProcessingDot(data => {
            if (data && data.id) {
                this.triggerDiem.value(data.isDiemPublic ? true : false);
                this.setState({ idDot: data.id });
                T.socket.on('export-diem-thi-done', ({ buffer, requester }) => {
                    if (requester == user) {
                        this.processModal.hide();
                        this.previewPdf.show(buffer);
                    }
                    // T.download(`/api/sdh/ts/ket-qua-thi/download-export?outputPath=${path}`, fileName);
                });
            } else {
                this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh');
            }
        });
    }
    render() {
        const isManager = this.getCurrentPermissions('manager').includes('manager:write');
        //Chuyên viên + giáo viên
        const diemThiPage = {
            key: 'diemThi', title: 'Điểm thi', component: <DanhSachDiemThiPage ref={e => this.diemPage = e} idDot={this.state.idDot} />
        };
        //Chuyên viên || Giáo viên
        const nhapDiemThiSinh = isManager ? {
            key: 'diemThiSinh', title: 'Nhập điểm thí sinh', component: <NhapDiemThiSinh idDot={this.state.idDot} isDiemPublic={this.triggerDiem ? this.triggerDiem.value() : false} />
        } : {
            key: 'diemThiSinhGv', title: 'Nhập điểm thí sinh', component: <NhapDiemThiSinhGV idDot={this.state.idDot} isDiemPublic={this.triggerDiem ? this.triggerDiem.value() : false} />
        };
        //Chuyên viên + giáo viên
        const nhapDiemPhongThi = {
            key: 'diemPhongThi', title: 'Nhập điểm môn thi', component: <NhapDiemPhongThi idDot={this.state.idDot} />
        };
        //Giáo viên
        const nhapDiemExcel = {
            key: 'diemExcel', title: 'Nhập điểm Excel', component: <NhapDiemExcel idDot={this.state.idDot} />
        };
        //Chuyên viên
        const quanLyNhapDiem = {
            key: 'lichSuNhapDiem', title: 'Lịch sử nhập điểm', component: <LichSuNhapDiem idDot={this.state.idDot} />
        };
        const tabs = [diemThiPage, nhapDiemThiSinh, nhapDiemPhongThi, nhapDiemExcel, quanLyNhapDiem];
        // isManager && tabs.concat(quanLyNhapDiem);
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Quản lý điểm thi tuyển sinh',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Quản lý điểm thi'
            ],
            content: <>
                <div className='tile'>
                    <FormCheckbox isSwitch={true} ref={e => this.triggerDiem = e} label='Công bố điểm'
                        onChange={(value) => {
                            const title = value ? 'Xác nhận công bố điểm' : 'Xác nhận hủy công bố điểm',
                                text = value ? 'Sau khi kích hoạt thí sinh sẽ thấy được điểm của mình!' : 'Sau khi hủy kích hoạt thí sinh sẽ không thấy được điểm của mình!';
                            T.confirm(title, text, true, isConfirm => {
                                if (isConfirm) this.setState({ isTriggerDiem: value }, () => this.props.updateSdhTsInfoTimeStatus(this.state.idDot, { isDiemPublic: value ? 1 : 0 }));
                                else this.triggerDiem.value(!value);
                            });
                        }} />
                    <hr></hr>
                    <FormTabs tabs={tabs} />
                </div>
                <PreviewPdf ref={e => this.previewPdf = e} />
                <ProcessModal ref={e => this.processModal = e} process={this.state.process || ''} />
                <ExportDiemThiModal ref={e => this.exportDiemThiModal = e} idDot={this.state.idDot} exportPdf={this.props.exportSdhTsKetQuaThiPdf} processModal={this.processModal} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            buttons: { icon: 'fa fa-sm fa-print', tooltip: 'Export', className: 'btn btn-warning', onClick: e => e.preventDefault() || this.exportDiemThiModal.show(e) },

        });

    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhTsProcessingDot, exportSdhTsKetQuaThiPdf, updateSdhTsInfoTimeStatus
};
export default connect(mapStateToProps, mapActionsToProps)(QuanLyDiemThiPage);
