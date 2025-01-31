import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import xlsx from 'xlsx';
import { saveImportStatusChungChi } from './redux';


class ImportStatusPage extends AdminPage {
    state = { error: false, dmLoaiDiem: [], status: null, items: [], falseItems: [] };

    mapperSkill = {
        'L': 'Nghe',
        'R': 'Đọc',
        'S': 'Nói',
        'W': 'Viết',
    }

    componentDidMount() {
        T.socket.on('import-status-chung-chi', ({ status, items, falseItems }) => {
            if (status == 'done') T.alert('Import dữ liệu chứng chỉ thành công!', 'success', false, 1000);
            else T.alert('Thực thi import dữ liệu chứng chỉ!', 'warning', false, 1000);
            this.setState({ items, falseItems, status });
        });
    }

    willUnmount() {
        T.socket.off('import-status-chung-chi');
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
                this.props.saveImportStatusChungChi(T.stringify(items), () => {
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
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mssv</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngoại ngữ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chứng chỉ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đủ điều kiện đăng ký</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đủ điều kiện tốt nghiệp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đủ điều kiện xét năm 3</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Không đủ điều kiện</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Lỗi</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={`${index}${className}`}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.row} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ma} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNgoaiNgu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenChungChi} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.isDangKy ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.isTotNghiep ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.isJuniorStudent ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.isNotQualified ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} />
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
                <Link key={0} to='/user/dao-tao/student-certificate-management'>Chứng chỉ sinh viên</Link>,
                'Import chứng chỉ'
            ],
            content: <div className='tile'>
                <div className='rows'>
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
                        !status ? <FileBox postUrl='/user/upload' uploadType='ImportStatusChungChi' userData='ImportStatusChungChi'
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
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { saveImportStatusChungChi };
export default connect(mapStateToProps, mapActionsToProps)(ImportStatusPage);
