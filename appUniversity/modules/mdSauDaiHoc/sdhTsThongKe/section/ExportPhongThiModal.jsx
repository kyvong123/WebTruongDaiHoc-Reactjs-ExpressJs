import React from 'react';
import { connect } from 'react-redux';
import { AdminModal } from 'view/component/AdminPage';
import { FormSelect } from 'view/component/AdminPage';
class ExportPhongThiModal extends AdminModal {
    componentDidMount() {
        T.socket.on('export-ds-dan-phong-sdh-ts-done', ({ path, fileName }) => {
            this.props.processModal.hide();
            T.download(`/api/sdh/ts/lich-thi/download-export?outputPath=${path}`, fileName);
        });
        T.socket.on('export-ds-dan-phong-sdh-ts-error', ({ err }) => {
            this.props.processModal.hide();
            T.notify(err, 'danger');
        });

    }
    componentWillUnmount() {
        T.socket.off('export-ds-dan-phong-sdh-ts-done');
        T.socket.off('export-ds-dan-phong-sdh-ts-error');
    }
    onShow = (dataExport) => {
        this.setState({ dataExport });
    }
    onSubmit = () => {
        const { type, dataExport } = this.state;
        if (!type) return T.notify('Vui lòng chọn loại danh sách phòng thi', 'danger');
        const data = { ...dataExport, type, idDot: dataExport.dot };
        this.props.exportPdf(data, () => {
            this.hide();
            this.props.processModal.show();
        });

    }


    render = () => {
        return this.renderModal({
            title: 'Xuất danh sách phòng thi',
            size: 'elarge',
            isShowSubmit: this.state.type,
            submitText: 'In danh sách phòng thi',
            body: <div className='row' >
                <FormSelect className='col-md-4' ref={e => this.phanHe = e} data={[{ id: 'danPhong', text: 'In danh sách dán phòng' }, { id: 'kyTen', text: 'In danh sách ký tên' }]} label='Loại danh sách phòng thi' required onChange={value => this.setState({ type: value.id })} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ExportPhongThiModal);
