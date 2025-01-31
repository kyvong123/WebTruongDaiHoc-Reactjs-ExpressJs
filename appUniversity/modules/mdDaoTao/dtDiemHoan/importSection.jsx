import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { dtDiemHoanSaveImport } from './redux';
import FileBox from 'view/component/FileBox';
import xlsx from 'xlsx';



class importSection extends AdminPage {
    state = { isUpload: false, items: [], falseItems: [] };

    componentDidMount() {
        this.tab.tabClick(null, 0);
        T.socket.on('import-diem-hoan', ({ requester, items, falseItems, index, isDone }) => {
            if (this.props.system.user.email === requester) {
                if (!isDone) {
                    T.alert(`Đang import dữ liệu điểm hàng ${index}!`, 'warning', false, null, true);
                } else {
                    T.alert('Import dữ liệu điểm thành công', 'success', false, 1000);
                }
                this.setState({ items, falseItems, isUpload: true });
            }
        });
        T.socket.on('save-import-diem-hoan', ({ requester, mssv, maHocPhan, isDone }) => {
            if (this.props.system.user.email === requester) {
                if (!isDone) {
                    T.alert(`Đang lưu dữ liệu điểm của sinh viên ${mssv} và môn học ${maHocPhan} thành công!`, 'warning', false, null, true);
                } else {
                    T.alert('Lưu dữ liệu điểm thành công', 'success', false, 1000);
                    this.props.getPage(1, 50, '');
                }
            }
        });
    }

    willUnmount() {
        T.socket.off('import-diem-mien');
        T.socket.off('save-import-diem-mien');
    }

    downloadExcel = () => {
        T.handleDownload('/api/dt/diem-hoan/import/download-template');
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách import điểm bị lỗi.xlsx');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        }
    }

    onSave = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn lưu dữ liệu import?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const { items } = this.state;
                this.props.dtDiemHoanSaveImport(T.stringify(items));
            }
        });
    }

    table = (list, className) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Hiện chưa có dữ liệu nào!',
        header: 'thead-light',
        className,
        stickyHead: list.length > 15,
        divStyle: { height: '50vh' },
        renderHead: () => (<tr>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Dòng</th>
            <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mssv</th>
            <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Họ tên</th>
            <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã học phần</th>
            <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên môn học</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Học kỳ</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kỳ thi</th>
            <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>{className ? 'Lỗi' : 'Ghi chú'}</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={`${index}${className}`}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.row} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.kyThi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.error || item.ghiChu} />
                </tr>
            );
        }
    });

    render() {
        let { isUpload, items, falseItems } = this.state;
        return <>
            <div className='tile'>
                <div className='rows' style={{ textAlign: 'right' }}>
                    <button className='btn btn-warning ' type='button' onClick={this.downloadExcel}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file import
                    </button>
                    <button className='btn btn-primary ml-2' style={{ display: isUpload ? '' : 'none' }} onClick={() => this.setState({ isUpload: false, items: [], falseItems: [] })} >
                        <i className='fa fa-refresh' /> ReLoad
                    </button>
                    <button className='btn btn-danger ml-2' type='button' style={{ display: falseItems.length ? '' : 'none' }} onClick={() => this.downloadErrorExcel()}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file lỗi
                    </button>
                    <button className='btn btn-success ml-2' type='button' style={{ display: items.length ? '' : 'none' }} onClick={this.onSave}>
                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                    </button>
                </div>
                <div className='rows mt-3' style={{ textAlign: 'right', display: !isUpload ? 'block' : 'none', }}>
                    <FileBox postUrl='/user/upload' uploadType='ImportDiemHoan' userData='ImportDiemHoan'
                        accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ width: '80%', margin: '0 auto' }} success={this.onSuccess} ajax={true} />
                </div>
                <div className='rows' style={{ display: isUpload ? '' : 'none' }}>
                    <FormTabs ref={e => this.tab = e} tabs={[{
                        title: `Danh sách import thành công (${items.length})`,
                        component: <>{this.table(items, '')}</>
                    }, {
                        title: `Danh sách import bị lỗi (${falseItems.length})`,
                        component: <>{this.table(falseItems, 'errorTable')}</>
                    }
                    ]} />
                </div>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { dtDiemHoanSaveImport };
export default connect(mapStateToProps, mapActionsToProps)(importSection);