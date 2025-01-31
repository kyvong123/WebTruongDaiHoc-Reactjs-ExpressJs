import { Tooltip } from '@mui/material';
import React from 'react';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import PdfViewer from './PdfViewer';
import SignatureConfigModal from './SignatureConfigModal';
import SubmitFileModal from './SubmitFileModal';
import ReadOnlyPdf from 'modules/mdHanhChinhTongHop/hcthCongVanDen/components/ReadOnlyPdf';
import { connect } from 'react-redux';
import { deleteFile } from '../redux/vanBanDi';
import { getAll as getLoaiKyAll } from 'modules/mdHanhChinhTongHop/hcthVanBanDiStatusSystem/redux/hcthSignType';
import { getSo } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';
import SignatureInfo, { CertificateInfo } from './signtureInfoModal';

export class VanBanDiFileV2 extends AdminPage {
    state = { files: null, signTypeList: [] }

    componentDidMount() {
        this.props.getLoaiKyAll();
        const queryParams = new URLSearchParams(window.location.search);
        const nhiemVu = queryParams.get('nhiemVu');
        this.setState({ nhiemVu });
    }

    setFiles = (files) => this.setState({ files });

    getFiles = () => this.state.files;

    canUpdateFile = () => {
        const status = this.getStatus();
        if (status.canEditFile) {
            const permissions = this.getCurrentPermissions();
            const editors = status.fileListEditor;
            return editors.some(editor => {
                if (editor.isCreator) return this.props.isCreator();
                else if (editor.isDepartment && this.props.isManager(editor.permission)) return true;
                else {
                    if (permissions.includes(editor.permission)) return true;
                }
            });
        }
        return false;
    }

    renderFileTable = () => {
        const { tenVietTatDonViGui, tenVietTatLoaiVanBan } = this.props?.hcthCongVanDi?.item || {};
        const defaultSoVanBan = `${'XXX'}/${tenVietTatLoaiVanBan ? tenVietTatLoaiVanBan + '-' : ''}XHNV-${tenVietTatDonViGui || ''}`;
        return renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            getDataSource: () => this.state.files,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tệp tin</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Phụ lục</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => {
                let fileUrl = this.props.id ? `/api/hcth/van-ban-di/file/${item.id}?` : `/api/hcth/van-ban-di/file/new/${item.fileName}?`;
                if (this.state.nhiemVu) fileUrl = fileUrl + 'nhiemVu=' + this.state.nhiemVu;
                return <tr key={item.id || index}>
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell type='link' onClick={() => ['.pdf', '.docx', '.doc'].some(extension => item.file.ten.endsWith(extension)) && this.readOnlyPdf.show({ url: `${fileUrl}&purpose=view` })} style={{ textAlign: 'left' }} content={item.file.ten} />
                    <TableCell type='checkbox' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phuLuc} />
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} type='buttons' permission={{ delete: this.props.canEdit() }} onDelete={e => this.onDeleteFile(e, item, index)} >
                        {item.id && <>
                            {!this.props.isPhysical && <Tooltip className={this.props.getMinimalDisplay() ? 'd-none' : ''} title='Cấu hình chữ ký' arrow>
                                <button className='btn btn-outline-info' onClick={(e) => e.preventDefault() || e.stopPropagation() || this.configModal.show({
                                    ...item,
                                    soVanBan: this.props.hcthCongVanDi?.item?.soVanBan?.soCongVan || defaultSoVanBan,
                                })}><i className='fa fa-lg fa-sliders' /></button>
                            </Tooltip>}
                            <Tooltip title='Thông tin chữ ký' arrow>
                                <button className='btn btn-warning' onClick={() => this.signatureInfoModal.show(item)}>
                                    <i className='fa fa-lg fa-info' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Tải xuống' arrow>
                                <button className='btn btn-info' onClick={() => T.handleDownload(fileUrl)}>
                                    <i className='fa fa-lg fa-download' />
                                </button>
                            </Tooltip>
                            {this.canUpdateFile() && <Tooltip className={this.props.getMinimalDisplay() ? 'd-none' : ''} title='Cập nhật' arrow>
                                <button className='btn btn-success' onClick={(e) => e.preventDefault() || e.stopPropagation() || this.modal.show(item)}><i className='fa fa-lg fa-upload' /></button>
                            </Tooltip>}
                        </>}
                    </TableCell>
                </tr>;
            }
        });
    }

    onAdd = () => {
        this.modal.show();
    }

    getStatus = () => {
        return this.props.hcthCongVanDi?.item?.status;
    }

    onDeleteFile = (e, item, index) => {
        e.preventDefault();
        let fileName;
        if (this.getFiles().length > 0 && !this.props.id) {
            fileName = this.getFiles()[index].fileName;
        }
        const { id, fileId } = item;
        T.confirm('Tập tin đính kèm', 'Bạn có chắc muốn xóa tập tin đính kèm này', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteFile(this.props.id ? this.props.id : null, fileId, id, fileName, () => {
                if (!this.props.id) {
                    this.state.files.splice(index, 1);
                    this.setState({ files: [...this.state.files] });
                } else {
                    this.props.getFile(this.props.id, (files) => {
                        this.setFiles(files);
                        this.props.getHistory();
                    });
                }
            }));
    }

    onSuccess = (file, done) => {
        if (!this.props.id) {
            this.setState({ files: [...this.state.files, file] }, () => done && done());
        }
        else {
            this.props.getFile(this.props.id, (files) => { this.setFiles(files) || (done && done(files)); });
            this.props.getHistory();
        }
    }

    render() {
        return (
            <div className='tile'>
                <h3 className='tile-title'>
                    Danh sách văn bản
                </h3>
                <div className='tile-body row'>
                    <div className='col-md-12'>
                        {this.renderFileTable()}
                    </div>
                    {!(this.props.status == 'DA_PHAT_HANH') && <div className='col-md-12 d-flex justify-content-end'>
                        {this.props.canEdit && <div className='d-flex justify-content-between'>
                            <button className='btn btn-success' onClick={this.onAdd}>
                                <i className='fa fa-lg fa-plus' /> Thêm
                            </button>
                        </div>}
                    </div>}
                </div>
                <SubmitFileModal ref={e => this.modal = e} success={this.onSuccess} id={this.props.id} getHistory={this.props.getHistory} />
                <PdfViewer ref={e => this.pdfModal = e} getSoVanBan={this.props.getSo} />
                <ReadOnlyPdf ref={e => this.readOnlyPdf = e} />
                <SignatureConfigModal ref={e => this.configModal = e} pdfModal={this.pdfModal} getFile={this.props.getFile} setFiles={this.setFiles} signTypeList={this.props.hcthSignType?.items} />
                <SignatureInfo ref={e => this.signatureInfoModal = e} certificateInfo={this.certificateInfo} />
                <CertificateInfo ref={e => this.certificateInfo = e} />
            </div>
        );
    }
}


const mapStateToProps = state => ({
    system: state.system,
    hcthCongVanDi: state.hcth.hcthCongVanDi,
    hcthSignType: state.hcth.hcthSignType
});
const mapActionsToProps = {
    getLoaiKyAll,
    deleteFile,
    getSo
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(VanBanDiFileV2);
