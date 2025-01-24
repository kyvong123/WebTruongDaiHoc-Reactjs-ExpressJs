import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import xlsx from 'xlsx';
import { saveImportChungChi } from './redux';


class ImportPage extends AdminPage {
    state = { error: false, status: null, items: [], falseItems: [] };

    componentDidMount() {
        T.socket.on('import-chung-chi-khac', ({ status, items, falseItems }) => {
            if (status == 'done') T.alert('Import dữ liệu chứng chỉ thành công!', 'success', false, 1000);
            else T.alert('Thực thi import dữ liệu chứng chỉ!', 'warning', false, 1000);
            this.setState({ items, falseItems, status });
        });
    }

    willUnmount() {
        T.socket.off('import-chung-chi');
    }

    downloadExcel = () => {
        T.handleDownload('/api/dt/chung-chi-tin-hoc-sinh-vien/import/download-template');
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách import chứng chỉ bị lỗi.xlsx');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        }
    };

    onSave = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn lưu dữ liệu import?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const { items } = this.state;
                T.alert('Thực thi lưu dữ liệu import!', 'warning', false, null, true);
                this.props.saveImportChungChi(T.stringify(items), () => {
                    this.setState({ status: 'saving' }, () => T.alert('Lưu dữ liệu import thành công!', 'success', true, 5000));
                });
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
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mssv</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại chứng chỉ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chứng chỉ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đủ điều kiện tốt nghiệp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>CCCD</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số hiệu văn bằng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày cấp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi cấp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Lỗi</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={`${index}${className}`}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.row} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiChungChi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenChungChi} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.isTotNghiep ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.cccd} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soHieuVanBang} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayCap ? T.dateToText(item.ngayCap, 'dd/mm/yyyy') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.noiCap} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diem} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.error} />
                </tr>
            );
        }
    });

    render() {
        let { status, items, falseItems } = this.state;
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Import chứng chỉ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={0} to='/user/dao-tao/student-others-certificate'>Chứng chỉ sinh viên</Link>,
                'Import chứng chỉ'
            ],
            content: <div className='tile'>
                <div className='rows'>
                    <button className='btn btn-warning' type='button' onClick={this.downloadExcel}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file import
                    </button>
                    <button className='btn btn-primary' style={{ margin: '5px' }} onClick={() => this.setState({ status: null, items: [], falseItems: [] })} >
                        <i className='fa fa-refresh' /> ReLoad
                    </button>
                    <button className='btn btn-danger' type='button' style={{ margin: '5px', display: status == 'done' && falseItems.length ? '' : 'none' }} onClick={() => this.downloadErrorExcel()}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file lỗi
                    </button>
                    <button className='btn btn-success' type='button' style={{ margin: '5px', display: status != 'saving' && status == 'done' && items.length ? '' : 'none' }} onClick={this.onSave}>
                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                    </button>
                    {
                        !status ? <FileBox postUrl='/user/upload' uploadType='ImportChungChiKhac' userData='ImportChungChiKhac'
                            accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                            style={{ width: '80%', margin: '0 auto' }} success={this.onSuccess}
                            ajax={true} /> : <div>
                            <FormTabs tabs={[{
                                title: `Danh sách import thành công (${items.length})`,
                                component: <>{this.table(items, '')}</>
                            }, {
                                title: `Danh sách import bị lỗi (${falseItems.length})`,
                                component: <>{this.table(falseItems, 'errorTable')}</>
                            }
                            ]} />
                        </div>
                    }
                </div>
            </div>,
            backRoute: '/user/dao-tao/student-others-certificate',
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { saveImportChungChi };
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);
