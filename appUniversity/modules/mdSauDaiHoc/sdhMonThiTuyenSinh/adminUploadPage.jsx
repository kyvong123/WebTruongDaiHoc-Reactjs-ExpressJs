import React from 'react';
import { connect } from 'react-redux';
import { updateSdhTsMonThiMutiple } from './redux';
import { OverlayLoading } from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, FormFileBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class SdhTsMonThiUploadPage extends AdminPage {
    state = { data: [], loading: false };

    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.fileBox.setData('sdhTsMonThiImportData');
        });
    }

    onSuccess = (data) => {
        this.setState({ data: data.element });
    }

    save = () => {
        let data = this.state.data;
        if (data.length == 0) {
            T.notify('Chưa upload file data!', 'danger');
        } else {
            this.setState({ loading: true });

            this.props.updateSdhTsMonThiMutiple(data, () => {
                this.setState({ loading: false });
                this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/mon-thi-tuyen-sinh');
            });
        }
    }

    downloadExcel = () => {
        T.handleDownload('/api/sdh/mon-thi-template/download', 'DSTS_template.xlsx');
    }

    render() {
        const permission = this.getUserPermission('sdhMonThiTuyenSinh', ['read', 'write', 'delete']),
            readOnly = !permission.write;
        let list = this.state.data;
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên tiếng Việt</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên tiếng Anh</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                    <TableCell type='link' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={item.ten ? item.ten : ''} />
                    <TableCell type='text' content={item.tenTiengAnh ? item.tenTiengAnh : ''} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-cloud-upload',
            title: 'Import data',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                <Link key={2} to='/user/sau-dai-hoc/tuyen-sinh/mon-thi-tuyen-sinh'>Môn thi tuyển sinh</Link>,
                'Import data'
            ],
            content: <>
                {this.state.loading ?
                    <div className='tile'>
                        <OverlayLoading text='Đang xử lý..' />
                    </div> :
                    [<div key={0} className='tile'>
                        <button className='btn btn-warning mb-2' type='button' onClick={(e) => e.preventDefault() || this.downloadExcel()}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                        </button>
                        <div className='row  justify-content-center'>
                            <FormFileBox ref={e => this.fileBox = e} className='col-md-6' postUrl='/user/upload' uploadType='sdhTsMonThiFile' userData='sdhTsMonThiImportData' onSuccess={this.onSuccess} />
                        </div>
                    </div>,
                    list.length != 0 ?
                        <div key={1} className='tile'>{table}</div> : '']
                }
                {(readOnly || list.length == 0 || this.state.loading) ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh/mon-thi-tuyen-sinh'

        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateSdhTsMonThiMutiple };
export default connect(mapStateToProps, mapActionsToProps)(SdhTsMonThiUploadPage);