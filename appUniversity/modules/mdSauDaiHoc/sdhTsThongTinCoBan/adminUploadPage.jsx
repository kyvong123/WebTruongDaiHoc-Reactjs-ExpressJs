import React from 'react';
import { connect } from 'react-redux';
import { createSdhTsDsts } from './redux';
import { AdminPage, FormSelect, FormTabs } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import SectionImportError from './section/SectionImportError';
import SectionImportNew from './section/SectionImportNew';
import FileBox from 'view/component/FileBox';
import { SelectAdapter_HinhThuc } from 'modules/mdSauDaiHoc/sdhTsHinhThuc/redux';
import { SelectAdapter_PhanHe } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { ProcessModal } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/processModal';

class SdhTsDstsUploadPage extends AdminPage {
    state = { data: [], idDot: '', idPhanHe: '', phanHe: '', hinhThuc: '', fileName: '', loading: false, filter: {}, current: 0, createItem: [], updateItem: [], falseItem: [], isUpload: false };

    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.setState({ idDot: data.id });
                } else {
                    this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh');
                }
            });

        });
        T.socket.on('sdh-import-dsts-done', ({ requester, createItem, falseItem, filName, createData }) => {
            if (requester == this.props.system.user.email) {
                this.setState({ current: 0, isUpload: true, isDone: true, createItem, falseItem, isSave: !!(createItem.length), filName, createData });
                // T.alert(`Đang import hàng ${index}`, 'info', false, null, true);
                T.alert('Import dữ liệu thành công!', 'success', false, 1000);
            }
        });
        T.socket.on('sdh-import-dsts-one', ({ requester, createItem, falseItem, index }) => {
            if (requester == this.props.system.user.email) {
                this.setState({ current: index, isUpload: true, isDone: false, createItem, falseItem, isSave: !!(createItem.length) });
                T.alert(`Đang import hàng ${index}`, 'info', false, null, true);
            }
        });
        T.socket.on('sdh-import-dsts-error', ({ requester, error }) => {
            if (requester == this.props.system.user.email) {
                T.alert(error, 'warning', false, 1000);
            }
        });
        T.socket.on('sdh-create-dsts-data', ({ requester }) => {
            if (requester == this.props.system.user.email) {
                this.processModal.hide();
                T.notify('Lưu dữ liệu thí sinh thành công', 'success');
                this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/danh-sach-tuyen-sinh');
            }
        });
    }
    componentWillUnmount() {
        T.socket.off('sdh-import-dsts-done');
        T.socket.off('sdh-import-dsts-one');
        T.socket.off('sdh-import-dsts-error');
        T.socket.off('sdh-create-dsts-data');
    }

    onSave = () => {
        const { createData, fileName } = this.state;
        if (createData && createData.length) {
            this.processModal.show();
            this.props.createSdhTsDsts(createData, fileName);
        } else {
            T.notify('Không có dữ liệu để tạo', 'danger');
        }
    }

    downloadExcel = () => {
        T.handleDownload('/api/sdh/dsts-template/download', 'SDH_DSTS_template.xlsx');
    }

    onChangeSelect = (value, type) => {
        this.setState({ [type]: value?.id, idPhanHe: type == 'phanHe' ? value?.idPhanHe : this.state.idPhanHe }, () => {
            type == 'phanHe' && this.hinhThuc.value('');
        });
    }

    render() {
        const permission = this.getUserPermission('sdhDsTs', ['write']),
            readOnly = !permission.write;
        let { createItem, falseItem, isUpload, isSaveCreate = true, isSave = false, idDot, idPhanHe, phanHe, hinhThuc } = this.state;
        const filter = { idDot, phanHe, hinhThuc, idPhanHe };
        return this.renderPage({
            icon: 'fa fa-cloud-upload',
            title: 'Import data',
            header: <div className='row'>
                <FormSelect ref={e => this.phanHe = e} label='Phân hệ' className='col-md-6' data={SelectAdapter_PhanHe(idDot)} onChange={value => this.onChangeSelect(value, 'phanHe')} readOnly={readOnly} required allowClear />
                <FormSelect ref={e => this.hinhThuc = e} label='Hình thức dự tuyển' className='col-md-6' data={SelectAdapter_HinhThuc(idPhanHe)} onChange={value => this.onChangeSelect(value, 'hinhThuc')} readOnly={readOnly} required allowClear />
            </div>,
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                <Link key={2} to='/user/sau-dai-hoc/tuyen-sinh/danh-sach-tuyen-sinh'>Danh sách tuyển sinh</Link>,
                'Import data'
            ],
            content: <>

                <ProcessModal ref={e => this.processModal = e} caption='Vui lòng đừng rời khỏi trang cho tới khi dữ liệu được tạo xong' />

                <div className='tile'>
                    <div className='rows'>
                        <button className='btn btn-warning' type='button' style={{ margin: '5px' }} onClick={this.downloadExcel}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                        </button>
                        <button className='btn btn-primary' style={{ margin: '5px' }} onClick={() => this.setState({ isUpload: false, createItem: [], updateItem: [], falseItem: [], isSave: false })} >
                            <i className='fa fa-refresh' /> ReLoad
                        </button>
                        <button className='btn btn-danger' type='button' style={{ margin: '5px', display: falseItem.length ? '' : 'none' }} onClick={() => this.importError.downloadErrorExcel()}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file lỗi
                        </button>
                        <button className='btn btn-success' type='button' style={{ margin: '5px', display: (isSave && isSaveCreate) ? '' : 'none' }} onClick={this.onSave}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                        {
                            !isUpload ?
                                <FileBox ref={e => this.fileBox = e} postUrl={`/user/upload?filter=${JSON.stringify(filter)}`} uploadType='sdhTsDstsFile' userData={'sdhTsImportDsts'}
                                    accept='.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                                    ajax={true} /> : <>
                                    <FormTabs tabs={[{
                                        title: `Danh sách thí sinh thành công (${createItem.length})`,
                                        component: <SectionImportNew ref={e => this.importNew = e} data={createItem} isSave={(value) => this.setState({ isSaveCreate: value })} />
                                    }, {
                                        title: `Danh sách thí sinh bị lỗi (${falseItem.length})`,
                                        component: <SectionImportError ref={e => this.importError = e} data={falseItem} />
                                    }
                                    ]} />
                                </>
                        }
                    </div>
                </div>
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh/danh-sach-tuyen-sinh',

        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createSdhTsDsts, getSdhTsProcessingDot };
export default connect(mapStateToProps, mapActionsToProps)(SdhTsDstsUploadPage);