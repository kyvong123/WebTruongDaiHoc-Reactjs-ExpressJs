import React from 'react';
import { FormTabs, TableCell, renderTable } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';



class UploadDssv extends React.Component {
    state = { dssvUpload: [], dssvFailed: [], saveNumber: 0, isSaving: true, editIndex: null, isLoading: false }

    onUploadSuccess = (res) => {
        if (res.error) {
            T.notify(res.error, 'danger');
        } else {
            this.setState({
                // listMssv: this.parseData(res.items),
                dssvUpload: res.dssvUpload,
                dssvFailed: res.failed || [], isSaving: false,
                editIndex: null
            });
        }
    }

    parseData = (items) => {
        return items.map(item => {
            this.fields.forEach(field => this[field].value[item.mssv] = item[field]);
            return item.mssv;
        });
    }

    saveDssv = () => {
        T.confirm('Lưu danh sách', 'Bạn có chắc muốn lưu những sinh viên mới này?', isConfirm => {
            if (isConfirm) {
                const { dssvUpload } = this.state,
                    chunkSize = 300;
                if (dssvUpload.length) {
                    this.setState({ isSaving: true, isLoading: true, saveNumber: 0 });
                    const fetchChunk = (i) => {
                        if (i < dssvUpload.length) {
                            const chunk = dssvUpload.slice(i, i + chunkSize);
                            this.props.multiAddDssvAdmin(chunk, (data) => {
                                this.setState({
                                    saveNumber: this.state.saveNumber + chunk.length, dssvUpload: dssvUpload.map(item => {
                                        if (data[item.mssv]) {
                                            item.tinhTrang = data[item.mssv];
                                        }
                                        return item;
                                    })
                                });
                                fetchChunk(i + chunkSize);
                            });
                        } else {
                            T.alert('Lưu tất cả thành công', 'success', false, 1500);
                            this.setState({ isLoading: false });
                        }
                    };
                    fetchChunk(0);
                } else {
                    T.notify('Danh sách sinh viên hợp lệ rỗng', 'danger');
                }
            }
        });
    }

    buildRow = (item, index) => {
        return <tr key={index}>
            <TableCell type='number' content={index + 1} />
            <TableCell content={item.mssv} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
            <TableCell content={item.ten} />
            <TableCell content={item.tenGioiTinh} />
            <TableCell type='date' content={item.ngaySinh} dateFormat='dd/mm/yyyy' />
            <TableCell content={item.namTuyenSinh} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrang ? <b className={item.tinhTrang.tinhTrang == 1 ? 'text-success' : 'text-warning'}>{item.tinhTrang.ten}</b> : ''} />
        </tr>;
    }


    render = () => {
        const { dssvUpload, dssvFailed, editIndex } = this.state;
        const table = renderTable({
            getDataSource: () => dssvUpload,
            emptyTable: '',
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '10%' }}>MSSV</th>
                    <th style={{ width: '20%' }}>Họ</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Giới tính</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm tuyển sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Tên ngành</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Tinh trang</th>
                </tr>
            ), renderRow: (item, index) => {
                return this.buildRow(item, index);
            }
        });

        const failedTable = renderTable({
            getDataSource: () => dssvFailed,
            emptyTable: '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '10%' }}>MSSV</th>
                    <th style={{ width: '25%' }}>Vị trí</th>
                    <th style={{ width: '65%' }}>Thông tin</th>
                </tr>
            ), renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`Dòng số ${item.rowIndex} trong file`} />
                    <TableCell className='text-danger' style={{ whiteSpace: 'nowrap' }} content={item.message} />
                </tr>;
            }
        });
        return (
            <div className='tile'>
                <h6>Thêm file excel danh sách sinh viên. Tải file mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/ctsv/tuyen-sinh/upload-dssv/template')}>đây</a></h6>
                <FileBox className='col-md-12 mb-3' postUrl={'/user/upload'} uploadType='DssvImportDataTuyenSinh' userData={'DssvImportDataTuyenSinh'}
                    accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' label={''}
                    ajax={true} success={this.onUploadSuccess} />
                {(dssvUpload.length || dssvFailed.length) ? <FormTabs
                    tabs={[
                        {
                            title: `Danh sách hợp lệ (${dssvUpload.length})`, component: <>
                                {table}
                                {dssvUpload.length && editIndex == null ? <button className='btn btn-success' disabled={this.state.isSaving} onClick={(e) => { e.preventDefault; this.saveDssv(); }}>{this.state.isSaving ? <>
                                    {this.state.isLoading && <i className='fa fa-spin fa-lg fa-spinner mr-2' />} Đang lưu ({this.state.saveNumber} / {dssvUpload.length})
                                </> : 'Lưu danh sách'}</button> : ''}
                            </>
                        },
                        {
                            title: `Danh sách lỗi (${dssvFailed.length})`, component: <>
                                {failedTable}
                            </>
                        },
                    ]}
                /> : ''}
            </div >
        );
    }
}

export default UploadDssv;