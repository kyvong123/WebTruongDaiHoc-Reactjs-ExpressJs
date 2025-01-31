import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { saveImportTyLeDiem } from './redux';
import FileBox from 'view/component/FileBox';
import xlsx from 'xlsx';


class ImportPage extends AdminPage {
    state = { error: false, dmLoaiDiem: [], status: null, items: [], falseItems: [] };

    componentDidMount() {
        T.socket.on('update-ty-le-diem', ({ status, items, falseItems, dmLoaiDiem }) => {
            if (status == 'done') T.alert('Import dữ liệu tỷ lệ điểm thành công!', 'success', false, 1000);
            else T.alert('Thực thi import dữ liệu tỷ lệ điểm!', 'warning', false, 1000);

            this.setState({ items, falseItems, dmLoaiDiem, status });
        });
    }

    willUnmount() {
        T.socket.off('update-ty-le-diem');
    }

    downloadExcel = () => {
        T.handleDownload('/api/dt/assign-role-nhap-diem/download-template');
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách import tỷ lệ điểm bị lỗi.xlsx');
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
                this.props.saveImportTyLeDiem(T.stringify(items), () => {
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
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã học phần</th>
            {
                this.state.dmLoaiDiem.map(i => (<th style={{ width: 'auto', whiteSpace: 'nowrap' }} key={i.ma}>{i.ten}</th>))
            }
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Lỗi</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={`${index}${className}`}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.row} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    {
                        this.state.dmLoaiDiem.map(i => (<TableCell className='font-weight-bold' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} key={`${index}${i.ma}${className}`} content={item.tpDiem.find(tp => tp.thanhPhan == i.ma)?.phanTram || ''} />))
                    }
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.error} />
                </tr>
            );
        }
    });

    render() {
        let { status, items, falseItems } = this.state;
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Import tỷ lệ điểm',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={0} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Import tỷ lệ điểm'
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
                        !status ? <FileBox postUrl='/user/upload' uploadType='ImportTyLeDiem' userData='ImportTyLeDiem'
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
const mapActionsToProps = { saveImportTyLeDiem };
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);
