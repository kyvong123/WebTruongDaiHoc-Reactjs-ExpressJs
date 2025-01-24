import React from 'react';
import { connect } from 'react-redux';
import { createQuanLyDeTaiMutiple } from './redux';
import { OverlayLoading } from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, FormFileBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class AdminSvSdhUploadPage extends AdminPage {
    state = { data: [], loading: false };

    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.fileBox.setData('fwQuanLyDeTaiImportData');
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
            this.props.createQuanLyDeTaiMutiple(data, () => {
                this.setState({ loading: false });
                this.props.history.push('/user/sau-dai-hoc/quan-ly-de-tai');
            });

        }
    }

    getSampleFile = (e) => {
        e.preventDefault();
        this.props.getSampleFile();
    }

    render() {
        const permission = this.getUserPermission('sdhDmQuanLyDeTai', ['read', 'write', 'delete', 'import']),
            readOnly = !permission.write;
        let list = this.state.data;
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Mã số sinh viên</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Họ tên</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Tên đề tài</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Giảng viên hướng dẫn</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='text' content={item.ma} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ho + ' ' + item.ten} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenDeTai} />
                    <TableCell type='text' content={item.gvhd} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-cloud-upload',
            title: 'Import data',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/quan-ly-de-tai'>Quản lý đề tài</Link>,
                'Import data'
            ],
            content: <>
                {this.state.loading ?
                    <div className='tile'>
                        <OverlayLoading text='Đang xử lý..' />
                    </div> :
                    [<div key={0} className='tile'>
                        <div className='row  justify-content-center'>
                            <FormFileBox ref={e => this.fileBox = e} className='col-md-6' postUrl='/user/upload' uploadType='fwQuanLyDeTaiSdhFile' userData='fwQuanLyDeTaiImportData' onSuccess={this.onSuccess} />
                        </div>
                    </div>,
                    list.length != 0 ?
                        <div key={1} className='tile'>{table}</div> : '']
                }
                {(readOnly || list.length == 0) ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </>,
            backRoute: '/user/sau-dai-hoc/sinh-vien',

        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createQuanLyDeTaiMutiple };
export default connect(mapStateToProps, mapActionsToProps)(AdminSvSdhUploadPage);