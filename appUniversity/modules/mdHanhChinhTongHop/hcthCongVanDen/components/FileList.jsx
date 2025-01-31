import React from 'react';
import { AdminModal, AdminPage, FormFileBox, TableCell, renderTable, FormTextBox, loadSpinner } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { connect } from 'react-redux';
import ReadOnlyPdf from './ReadOnlyPdf';
import { xacThucCongVan, getFileList, deleteFile } from '../redux';
import FileBox from 'view/component/FileBox';
import FileHistoryModal from './FileHistoryModal';

class VerifyModal extends AdminModal {
    state = {
        congVan: null,
        danhSachNguoiKy: [],
        isSearching: false
    };

    onShow = (item) => {
        const { ma, ten } = item;
        this.setState({ isSearching: true, items: null });
        this.props.xacThucCongVan(ma, ten, (items) => {
            this.setState({ items, isSearching: false });
        });
    }

    render = () => {
        let table = renderTable({
            emptyTable: 'Chưa có người ký',
            getDataSource: () => this.state.items,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thông tin chữ ký</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thông tin người ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Ngày ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Tính toàn vẹn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Đã xác thực</th>
                </tr>),
            renderRow: (item, index) => {

                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'wrap' }} content={item.name} />
                        <TableCell type='text' style={{ whiteSpace: 'wrap' }} content={item.thongTinLienLac} />
                        <TableCell type='text' style={{ whiteSpace: 'wrap' }} content={item.reason} />
                        <TableCell type='text' style={{ whiteSpace: 'wrap' }} content={item.ngayKy ? T.dateToText(item.ngayKy, 'dd/mm/yyyy HH:MM') : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            <span style={{ color: item.integrity ? 'green' : 'red' }}>
                                <i className={item.integrity ? 'fa fa-check-circle-o fa-2x' : 'fa fa-times-circle-o fa-2x'}></i>
                            </span>
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            <span style={{ color: item.verified ? 'green' : 'red' }}>
                                <i className={item.verified ? 'fa fa-check-circle-o fa-2x' : 'fa fa-times-circle-o fa-2x'}></i>
                            </span>
                        } />
                    </tr>
                );
            }
        });

        return this.renderModal({
            title: 'Xác thực văn bản đến',
            size: 'elarge',
            body: <>
                {
                    this.state.isSearching ?
                        loadSpinner() :
                        <div>
                            <h5 className='mt-2'>Danh sách người ký</h5>
                            {table}
                        </div>
                }
            </>
        });
    }
}


class FileList extends AdminPage {
    listFileRefs = {};

    componentDidMount() {
        const queryParams = new URLSearchParams(window.location.search);
        const nhiemVu = queryParams.get('nhiemVu');
        this.setState({ nhiemVu });
    }

    onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.item) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.item);
            this.setState({ listFile });
        }
    }

    fetchListFile = () => {
        this.props.getFileList(this.props.id, this.setListFile);
    }



    onShowVerifyModal = (e, item) => {
        e.preventDefault();
        this.verifyModal.show(item);
    }


    onViTriChange = (e, id, index) => {
        let listFile = [...this.state.listFile];
        listFile[index].viTri = this.listFileRefs[id].value() || '';
        setTimeout(() => this.setState({ listFile }), 500);
    }

    deleteFile = (e, index, item) => {
        e.preventDefault();
        const { id: fileId, tenFile: file } = item;
        T.confirm('Tập tin đính kèm', 'Bạn có chắc muốn xóa tập tin đính kèm này, tập tin sau khi xóa sẽ không thể khôi phục lại được', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteFile(this.props.id ? this.props.id : null, fileId, file, () => {
                if (this.props.id)
                    this.fetchListFile();
                else {
                    let listFile = [...this.state.listFile];
                    listFile.splice(index, 1);
                    this.setState({ listFile });
                }
            }));
    }


    tableListFile = (data, id, permission, readOnly) => {
        const files = data?.filter(i => i.ten.endsWith('.pdf')).map(item => ({ ...item, linkFile: `/api/hcth/van-ban-den/download/${id || 'new'}/${item.tenFile}` }));

        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            emptyTable: 'Chưa có file văn bản nào!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tên tập tin</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Vị trí</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                const
                    timeStamp = item.thoiGian,
                    originalName = item.ten,
                    linkFile = `/api/hcth/van-ban-den/download/${id || 'new'}/${item.tenFile}`,
                    permissions = this.getCurrentPermissions();

                return (
                    <tr key={item.id}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' style={{ wordBreak: 'break-all' }} content={originalName} onClick={() => originalName.endsWith('.pdf') && this.readOnlyModal.show({ url: linkFile + '?' + (this.state.nhiemVu ? `&nhiemVu=${this.state.nhiemVu}` : ''), index, files })} />
                        <TableCell content={(
                            permission.write && !readOnly ? <FormTextBox type='text' placeholder='Nhập vị trí' style={{ marginBottom: 0 }} ref={e => this.listFileRefs[item.id] = e} onChange={e => this.onViTriChange(e, item.id, index)} /> : item.viTri
                        )} />
                        <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={readOnly ? null : e => this.deleteFile(e, index, item)}>
                            <a className='btn btn-info' href={linkFile + (this.state.nhiemVu ? `?nhiemVu=${this.state.nhiemVu}` : '')} download title='Tải về'>
                                <i className='fa fa-lg fa-download' />
                            </a>
                            {this.props.id && <>
                                {permissions?.includes('hcth:login') && <Tooltip title='Cập nhật' arrow>
                                    <button className='btn btn-success' onClick={(e) => e.preventDefault() || e.stopPropagation() || this.setState({ updateId: item.id }, () => this.updateFileBox.uploadInput.click())}><i className='fa fa-lg fa-upload' /></button>
                                </Tooltip>}
                                <Tooltip title='Lịch sử cập nhật' arrow>
                                    <button className='btn btn-warning' onClick={(e) => e.preventDefault() || e.stopPropagation() || this.fileHistoryModal.show(item)}><i className='fa fa-lg fa-history' /></button>
                                </Tooltip>
                                <a className='btn btn-success' onClick={e => this.onShowVerifyModal(e, item)} title='Xác thực' href='#'>
                                    <i className='fa fa-lg fa-file' />
                                </a>
                            </>}
                        </TableCell>
                    </tr>
                );
            }
        });
    }

    setListFile = (listFile) => {
        this.setState({ listFile }, () => {
            listFile.map((item) => this.listFileRefs[item.id]?.value(item.viTri || ''));
        });
    }

    getListFile = () => this.state.listFile

    setFormData = (value) => this.fileBox?.setData(value)

    onUpdateFileChange = () => {
        const id = this.state.updateId;
        this.setState({ updateId: null }, () => {
            this.updateFileBox.onUploadFile({ id });
        });
    }

    render() {
        const readOnly = this.props.readOnly;
        return <div className='tile'>
            <div className='form-group'>
                <h3 className='tile-title'>Danh sách văn bản</h3>
                <div className='tile-body row'>
                    <div className={'form-group ' + (readOnly ? 'col-md-12' : 'col-md-8')}>
                        {this.tableListFile(this.state.listFile, this.props.id, this.props.permission, readOnly)}
                    </div>
                    {!readOnly && <FormFileBox className='col-md-3' ref={e => this.fileBox = e} label='Tải lên tập tin văn bản' postUrl='/user/upload' uploadType='hcthCongVanDenFile' userData='hcthCongVanDenFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.props.id ? this.fetchListFile : this.onSuccess} />}
                    <FileBox pending className='d-none' ref={e => this.updateFileBox = e} label='Tải lên tập tin văn bản' postUrl='/user/upload' uploadType='hcthCongVanDenUpdateFile' userData='hcthCongVanDenUpdateFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} success={this.fetchListFile} onFileChange={this.onUpdateFileChange} />
                </div>
            </div>
            <VerifyModal ref={(e) => (this.verifyModal = e)} {...this.props} />
            <ReadOnlyPdf ref={e => this.readOnlyModal = e} />
            <FileHistoryModal ref={e => this.fileHistoryModal = e} />
        </div>;
    }
}

const stateToProps = state => ({ system: state.system });
const actionsToProps = { xacThucCongVan, getFileList, deleteFile };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(FileList);