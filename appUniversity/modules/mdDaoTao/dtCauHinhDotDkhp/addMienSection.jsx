import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, TableCell, renderTable } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import xlsx from 'xlsx';
import { getDtDotDkhpMienNgoaiNguPage, createDtDotDkhpMienNgoaiNgu, deleteDtDotDkhpMienNgoaiNgu } from 'modules/mdDaoTao/dtDssvTrongDotDkhp/redux';
import Pagination from 'view/component/Pagination';


class AddSection extends AdminPage {
    state = { error: false, status: null, items: [], falseItems: [] };

    setValue = (idDot) => {
        this.props.getDtDotDkhpMienNgoaiNguPage(1, 50, { idDot }, () => {
            this.setState({ idDot });
        });
    }

    componentDidMount() {
        T.socket.on('import-mien-chung-chi', ({ status, items, falseItems }) => {
            if (status == 'done') T.alert('Import dữ liệu miễn chứng chỉ thành công!', 'success', false, 1000);
            else T.alert('Thực thi import miễn chứng chỉ!', 'warning', false, 1000);
            this.setState({ items, falseItems, status });
        });
    }

    willUnmount() {
        T.socket.off('import-mien-chung-chi');
    }

    downloadExcel = () => {
        T.handleDownload('/api/dt/cau-hinh-dot/mien/download-template');
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
                this.props.createDtDotDkhpMienNgoaiNgu(this.state.idDot, items, () => {
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
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
            <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Lỗi</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={`${index}${className}`}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.row} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.error} />
                </tr>
            );
        }
    });

    tableDS = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Hiện chưa có dữ liệu nào!',
        header: 'thead-light',
        stickyHead: list?.length > 15,
        divStyle: { height: '50vh' },
        renderHead: () => (<tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap' }}>MSSV</th>
            <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Họ và tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={`DS_${index}`}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell type='buttons' content={item} permission={{ delete: true }} onDelete={() => this.handleDelete(item)} />
                </tr>
            );
        }
    });

    handleDelete = (item) => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn xóa sinh viên miễn ngoại ngữ không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang thực thi xóa miễn ngoại ngữ cho sinh viên. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.deleteDtDotDkhpMienNgoaiNgu(item.id, () => {
                    T.alert('Xóa sinh viên miễn thành công!', 'success', false, 2000);
                });
            }
        });
    }

    componentDanhSach = () => {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtDssvTrongDotDkhp?.pageMien || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: [] };
        return <>
            {this.tableDS(list)}
            <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition: null }}
                getPage={this.getPage} pageRange={6} />
        </>;
    }

    componentImport = () => {
        const { status, items, falseItems } = this.state;
        return <div className='rows'>
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
                !status ? <FileBox postUrl={`/user/upload?idDot=${this.props.idDot}`} uploadType='ImportSinhVienMien' userData='ImportSinhVienMien'
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
        </div>;
    }

    render() {
        return <div className='tile'>
            <FormTabs tabs={[
                { title: 'Danh sách sinh viên', component: this.componentDanhSach() },
                { title: 'Import sinh viên', component: this.componentImport() },
            ]} />
        </div>;
    }
}


const mapStateToProps = state => ({ system: state.system, dtDssvTrongDotDkhp: state.daoTao.dtDssvTrongDotDkhp });
const mapActionsToProps = { getDtDotDkhpMienNgoaiNguPage, createDtDotDkhpMienNgoaiNgu, deleteDtDotDkhpMienNgoaiNgu };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddSection);