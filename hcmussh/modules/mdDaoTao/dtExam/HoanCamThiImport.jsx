import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, renderTable, TableCell, TableHead } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import xlsx from 'xlsx';
import { dinhChiThiSinhVien } from './redux';


class HoanCamThiImport extends AdminPage {
    state = { items: [], falseItems: [] }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.socket.on('import-hoan-cam-thi', ({ requester, items, falseItems, index, isDone }) => {
                if (this.props.system.user.email === requester) {
                    console.log('?');
                    if (!isDone) {
                        T.alert(`Đang import dữ liệu điểm hàng ${index}!`, 'warning', false, null, true);
                    } else {
                        T.alert('Import dữ liệu điểm thành công', 'success', false, 1000);
                    }
                    this.setState({ items, falseItems, isUpload: true });
                }
            });
        });
    }

    componentWillUnmount() {
        T.socket.off('import-hoan-cam-thi');
    }

    onSuccess = (result) => {
        if (result.error) {
            T.alert('Xảy ra lỗi trong quá trình import', 'danger', true);
        }
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách import điểm bị lỗi.xlsx');
    }

    onSave = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn lưu dữ liệu import?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const { items } = this.state;
                T.alert('Đang lưu dữ liệu import! Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.dinhChiThiSinhVien(items, () => T.alert('Lưu dữ liệu thành công', 'success', false, 1000));
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
        renderHead: () => (<>
            <tr>
                <TableHead content='#' />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dòng</th>
                <TableHead style={{ whiteSpace: 'nowrap' }} content='Năm học' />
                <TableHead style={{ whiteSpace: 'nowrap' }} content='Học kỳ' />
                <TableHead content='MSSV' />
                <TableHead style={{ whiteSpace: 'nowrap' }} content='Họ và tên' />
                <TableHead style={{ whiteSpace: 'nowrap' }} content='Mã học phần' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kỳ thi' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Hình thức' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ghi chú' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Lỗi' />
            </tr>
        </>),
        renderRow: (item, index) => {
            return (<tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.row} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namHoc} />
                <TableCell content={item.hocKy} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap', width: '30%' }} content={`${item.ho || ''} ${item.ten || ''}`} />
                <TableCell style={{ whiteSpace: 'nowrap', width: '30%' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKyThi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenDinhChi} />
                <TableCell style={{ whiteSpace: 'nowrap', width: '40%' }} content={item.ghiChu} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.error} />
            </tr>);
        }
    });

    render() {
        let { isUpload, items, falseItems } = this.state;

        return this.renderPage({
            advanceSearchTitle: '',
            icon: 'fa fa-pencil',
            title: 'Quản lý Lịch thi: Import',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Quản lý Lịch thi - Import'
            ],
            backRoute: '/user/dao-tao/lich-thi',
            content: <div className='tile'>
                <button className='btn btn-warning' type='button' onClick={() => T.handleDownload('/api/dt/exam/import-hoan-cam-thi/download-template')}>
                    <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file import
                </button>
                <button className='btn btn-primary' style={{ margin: '5px' }} onClick={() => this.setState({ isUpload: false, items: [], falseItems: [] })} >
                    <i className='fa fa-refresh' /> ReLoad
                </button>
                <button className='btn btn-danger' type='button' style={{ margin: '5px', display: falseItems.length ? '' : 'none' }} onClick={() => this.downloadErrorExcel()}>
                    <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file lỗi
                </button>
                <button className='btn btn-success' type='button' style={{ margin: '5px', display: items.length ? '' : 'none' }} onClick={this.onSave}>
                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                </button>
                {
                    !isUpload ? <FileBox postUrl='/user/upload' uploadType='ImportHoanCamThi' userData='ImportHoanCamThi'
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
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { dinhChiThiSinhVien };
export default connect(mapStateToProps, mapActionsToProps)(HoanCamThiImport);