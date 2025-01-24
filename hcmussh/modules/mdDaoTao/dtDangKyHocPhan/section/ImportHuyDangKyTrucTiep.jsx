import xlsx from 'xlsx';
import React from 'react';
import { connect } from 'react-redux';
import FileBox from 'view/component/FileBox';
import { FormCheckbox, renderDataTable, TableCell, FormTabs } from 'view/component/AdminPage';

import { deleteDtDangKyHocPhanImport } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
class ImportHuyDangKyTrucTiep extends React.Component {
    state = { dangKyAll: [], dangKyFalse: [], message: '', displayState: 'import', filterhp: {}, canSave: false };

    componentDidMount() {
        this.tab.tabClick(null, 0);
    }

    getSemester = () => {
        let { namHoc, hocKy } = this.props.currentSemester;
        this.setState({
            namHoc, hocKy, dangKyAll: [], dangKyFalse: [], displayState: 'import', canSave: false,
            filterhp: { ...this.state.filterhp, namHoc, hocKy }
        });
    }

    setValue = (response, done) => {
        this.setState({
            dangKyAll: response.items,
            dangKyFalse: response.falseItem,
            displayState: 'importing',
            message: `${response.items.length} hàng dự kiến đăng ký thành công`,
        }, () => done && this.notify());
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        }
    };

    notify = () => {
        const { message, dangKyFalse, dangKyAll } = this.state;
        dangKyFalse.length && T.notify(`${dangKyFalse.length} hàng đăng ký thất bại`, 'danger');
        dangKyAll.length && T.notify(message, 'success');
        this.setState({ canSave: !!dangKyAll.length, displayState: 'data' });
    }

    changeCheckAll = (value) => {
        let items = this.state.dangKyAll;
        items.map(item => item.isCheck = value);
        this.setState({ dangKyAll: items });
    }

    reLoadPage = () => {
        this.props.reload();
    }

    huyDangKy = e => {
        e && e.preventDefault();
        let list = this.state.dangKyAll;
        list = list.filter(item => item.isCheck == true);
        if (list.length == 0) {
            T.notify('Không tìm thấy dữ liệu để hủy đăng ký!', 'danger');
        } else {
            T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
            this.props.deleteDtDangKyHocPhanImport(list, () => {
                T.alert('Đăng ký học phần thành công', 'success', false, 1000);
                this.setState({ dangKyAll: [], dangKyFalse: [], message: '', displayState: 'import', filterhp: {}, canSave: false });
            });
        }
    }

    downloadExcel = () => {
        T.handleDownload('/api/dt/dang-ky-hoc-phan/download-huy-template', 'Huy_dang_ky_hoc_phan_Template.xlsx');
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.huyErrorTable')), 'Danh sách hủy đăng ký lỗi.xlsx');
    }


    renderKetQuaImport = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không có dữ liệu!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Row</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.changeCheckAll(value)} readOnly={this.state.displayState == 'importing'} />
                </th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ textAlign: 'right' }} content={item.stt} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isCheck} permission={{ write: this.state.displayState != 'importing' }}
                    onChanged={() => {
                        list[index].isCheck = !list[index].isCheck;
                        this.setState({ dangKyAll: list }, () => {
                            let dangKyAll = this.state.dangKyAll;
                            this.setState({ dangKyAll });
                        });
                    }}
                />
            </tr>)
    });

    renderKetQuaImportFalse = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không có dữ liệu!',
        header: 'thead-light',
        stickyHead: true,
        className: 'huyErrorTable',
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Row</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Ghi chú</th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ textAlign: 'right' }} content={item.stt} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
            </tr>)
    });

    render() {
        let { dangKyAll, displayState, dangKyFalse, canSave } = this.state;
        return (<>
            <div className='tile'>
                <div className='tile-body'>
                    <div className='rows' style={{ textAlign: 'right', display: displayState.startsWith('import') ? 'none' : '' }}>
                        <button className='btn btn-primary mr-2' onClick={() => this.setState({ displayState: 'import', canSave: false })} >
                            <i className='fa fa-refresh' /> ReLoad
                        </button>
                        <button className='btn btn-warning mr-2' onClick={(e) => e.preventDefault() || this.downloadErrorExcel()} style={{ display: dangKyFalse.length ? '' : 'none' }}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' /> Tải file lỗi
                        </button>
                        <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.huyDangKy()} style={{ display: (canSave == true) ? '' : 'none' }}>
                            <i className='fa fa-fw fa-lg fa-handshake-o' /> Hủy đăng ký
                        </button>
                    </div>

                    <div className='rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none', }}>
                        <button className='btn btn-warning mb-2' type='button' onClick={this.downloadExcel}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                        </button>
                        <FileBox postUrl={'/user/upload'} uploadType='DtDangKyHocPhanHuyData' userData={'DtDangKyHocPhanHuyData'}
                            accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                            style={{ width: '80%', margin: '0 auto' }}
                            ajax={true} success={this.onSuccess} />
                    </div>
                    <div className='rows' style={{ display: displayState != 'import' ? '' : 'none' }}>
                        <FormTabs contentClassName='tile' ref={e => this.tab = e}
                            tabs={[
                                { title: 'Hủy đăng ký thành công ' + (dangKyAll.length ? `(${dangKyAll.length})` : ''), component: this.renderKetQuaImport(dangKyAll || []) },
                                { title: 'Hủy đăng ký thất bại ' + (dangKyFalse.length ? `(${dangKyFalse.length})` : ''), component: this.renderKetQuaImportFalse(dangKyFalse || []) },
                            ]}
                        />

                    </div>
                </div>
            </div>
        </>);
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = { deleteDtDangKyHocPhanImport };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ImportHuyDangKyTrucTiep);
