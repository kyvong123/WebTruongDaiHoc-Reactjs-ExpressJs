import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormFileBox, AdminModal, FormTextBox, FormRichTextBox, getValue } from 'view/component/AdminPage';
import { updateSdhTsBieuMau, getAllSdhTsDmBieuMau } from './redux';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {

    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });
    }
    downloadFile = (data) => {
        T.download(`/api/sdh/ts/dm-bieu-mau/download-export?outputPath=${data.src}`, data.fileName);
    }
    onShow = (item) => {
        let { id, ten, ghiChu } = item ?
            item : { id: null, ten: '', ghiChu: '' };
        this.setState({ id, item });
        this.ten.value(ten);
        this.ghiChu.value(ghiChu);
        this.fileBox.fileBox.setData('sdhTsDmBm:' + (id ? id : 'new'));
    };
    onSuccess = ({ error, item }) => {
        if (item) T.alert('Tải lên tệp tin thành công');
        else if (error) T.alert(error, 'error', false, 2000);
    }
    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            ghiChu: this.ghiChu.value() || ''
        };
        if (this.state.id) {
            if (this.fileBox.fileBox.getFile()) {
                this.fileBox.fileBox.onUploadFile({ ...changes });
            }
            else this.props.updateSdhTsBieuMau(this.state.id, changes);
        }
        this.hide();
    };

    render = () => {
        return this.renderModal({
            title: 'Cập nhật biểu mẫu',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên hiển thị' required />
                    <FormRichTextBox className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' rows='5' />
                    <div className='col-md-12' onClick={() => this.downloadFile(this.state.item)}>
                        <i className="fa fa-download" aria-hidden="true" style={{ color: 'blue' }}> Tải file mẫu tại đây</i>
                    </div>
                    <FormFileBox className='col-12' ref={e => this.fileBox = e} label='Tệp tin tải lên (.xlsx, .doc, .docx )' postUrl='/user/upload' uploadType='sdhTsDmBm' onSuccess={this.onSuccess} required pending userData='sdhTsDmBm' />
                </div>
        }
        );
    };
}
class SdhTsDmBieuMauPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhTsDmBieuMau(data => this.setState({ data }));
        });
    }

    render() {
        let list = this.state.data || [];
        const table = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            emptyTable: 'Chưa có dữ liệu biểu mẫu!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Loại biểu mẫu</th>
                    <th style={{ width: '40%' }}>Mô tả</th>
                    <th style={{ width: '10%' }}>Chỉnh sửa</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell content={item.ten} />
                    <TableCell content={item.ghiChu} />
                    <TableCell type='buttons'>
                        <Tooltip title='Chỉnh sửa'><button type='button' className='btn btn-info' onClick={() => this.modal.show(item)}><i className='fa fa-pencil'></i></button></Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Danh mục biểu mẫu',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Danh mục biểu mẫu'
            ],
            content: <>
                <EditModal ref={e => this.modal = e} updateSdhTsBieuMau={this.props.updateSdhTsBieuMau} />
                <div className='tile'>{table}</div>
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
        });
    }


}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateSdhTsBieuMau, getAllSdhTsDmBieuMau };
export default connect(mapStateToProps, mapActionsToProps)(SdhTsDmBieuMauPage);