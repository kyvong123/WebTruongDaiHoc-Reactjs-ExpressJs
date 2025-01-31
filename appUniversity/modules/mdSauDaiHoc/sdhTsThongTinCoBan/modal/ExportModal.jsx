import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_PhanHe } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { SelectAdapter_SdhHinhThucTuyenSinh } from 'modules/mdSauDaiHoc/sdhTsHinhThuc/redux';
import { SelectAdapter_PhieuBaoHoSo, exportPdf } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { SelectAdapter_NganhByDot } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';

// Print preview
class ExportModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
        T.socket.on('export-phieu-bao-1-done', ({ buffer, requester }) => {
            if (requester == this.props.user) {
                this.props.processModal.hide();
                this.props.previewPdf.show(buffer);
            }
        });
        T.socket.on('export-phieu-bao-dot-done', ({ buffer, requester }) => {
            if (requester == this.props.user) {
                this.props.processModal.hide();
                this.props.previewPdf.show(buffer);
            }
        });
        T.socket.on('export-du-tuyen-done', ({ buffer, requester, fileName, filePath }) => {
            if (requester == this.props.user) {
                this.props.processModal.hide();
                this.props.previewPdf.show({ buffer, fileName, filePath });

            }
        });

    }
    componentWillUnmount() {
        T.socket.off('export-phieu-bao-dot-done');
        T.socket.off('export-phieu-bao-1-done');
        T.socket.off('export-du-tuyen-done');

    }
    onShow = () => {
        this.loaiBieuMau?.value('');
        this.phanHe?.value('');
        this.hinhThuc?.value('');
        this.thiSinh?.value('');

    }

    onSubmit = () => {
        const { type, phanHe, hinhThuc, idThiSinh, nganh } = this.state;
        if (!type) return T.notify('Vui lòng chọn loại biểu mẫu', 'danger');
        else if (type == 'du-tuyen') {
            if (!phanHe && !hinhThuc) return T.notify('Vui lòng chọn phân hệ', 'danger');
            // else {
            //     if (hinhThuc == '03') T.handleDownload(`/api/sdh/dsts/tuyen-thang/cao-hoc/export/excel?filter= ${JSON.stringify({ dot: this.props.idDot, phanHe, hinhThuc })}`);
            //     this.hide();
            //     return;
            // }
        } else if (type == 'phieu-bao-1') {
            if (!idThiSinh) return T.notify('Vui lòng chọn thí sinh', 'danger');
        }

        const data = { type, phanHe, hinhThuc, idThiSinh, idDot: this.props.idDot, nganh };
        this.props.exportPdf(data, () => {
            this.hide();
            // Print preview
            this.props.processModal.show();
        });

    }
    selectLoaiBieuMau = [
        { id: 'phieu-bao-1', text: 'Phiếu báo dự thi (1 người)' },
        { id: 'phieu-bao-dot', text: 'Phiếu báo dự thi (đợt)' },
        { id: 'du-tuyen', text: 'Danh sách dự tuyển' },
    ];


    render = () => {
        const { type } = this.state;
        const { idDot } = this.props;
        return this.renderModal({
            title: 'Xuất biểu mẫu',
            size: 'elarge',
            isShowSubmit: this.state.type,
            submitText: 'In biểu mẫu',
            body: <div className='row' >
                <FormSelect className='col-md-4' key='type' ref={e => this.loaiBieuMau = e} data={this.selectLoaiBieuMau} label='Loại biểu mẫu' required onChange={value => this.setState({ type: value.id })} />
                {type == 'du-tuyen' ? <>
                    <FormSelect className='col-md-4' key='dt-phan-he' ref={e => this.phanHe = e} data={SelectAdapter_PhanHe(idDot)} label='Phân hệ' required onChange={value => this.setState({ phanHe: value.id })} />
                    <FormSelect className='col-md-4' key='dt-hinh-thuc' ref={e => this.hinhThuc = e} data={SelectAdapter_SdhHinhThucTuyenSinh} label='Hình thức' onChange={value => this.setState({ hinhThuc: value.id })} />
                </> :
                    (type == 'phieu-bao-1' ?
                        <>
                            <FormSelect key='phieu-bao-1' className='col-md-4' ref={e => this.thiSinh = e} data={SelectAdapter_PhieuBaoHoSo} label='Thí sinh' required onChange={value => this.setState({ idThiSinh: value.id })} />
                        </> : (type == 'phieu-bao-dot') ?
                            <FormSelect className='col-md-4' key='dt-nganh' ref={e => this.nganh = e} data={SelectAdapter_NganhByDot(idDot)} label='Ngành' onChange={value => this.setState({ nganh: value.id })} /> : null)
                }
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    exportPdf
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ExportModal);
