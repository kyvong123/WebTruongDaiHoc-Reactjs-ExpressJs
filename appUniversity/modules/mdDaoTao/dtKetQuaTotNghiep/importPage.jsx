import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { saveImportKetQuaTotNghiep } from './redux';
import FileBox from 'view/component/FileBox';
import xlsx from 'xlsx';


class ImportPage extends AdminPage {
    state = { error: false, status: null, items: [], falseItems: [] };

    componentDidMount() {
        T.socket.on('import-ket-qua', ({ status, items, falseItems }) => {
            if (status == 'done') T.alert('Import kết quả tốt nghiệp thành công!', 'success', false, 1000);
            else T.alert('Thực thi import kết quả tốt nghiệp!', 'warning', false, 1000);

            this.setState({ items, falseItems, status });
        });
    }

    willUnmount() {
        T.socket.off('import-ket-qua');
    }

    downloadExcel = () => {
        T.handleDownload('/api/dt/ket-qua-tot-nghiep/download-template');
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
                const { items } = this.state,
                    { idDot } = this.props.filter;

                if (!idDot) return T.alert('Chưa có đợt tốt nghiệp', 'error', false, 2000);

                T.alert('Thực thi lưu dữ liệu import!', 'warning', false, null, true);
                this.props.saveImportKetQuaTotNghiep(T.stringify(items), idDot, () => {
                    this.setState({ status: 'saving' }, () => {
                        this.props.handleSave();
                        T.alert('Lưu dữ liệu import thành công!', 'success', true, 5000);
                    });
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
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ và tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi sinh</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành tốt nghiệp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chuyên ngành tốt nghiệp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chương trình học</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức đào tạo</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm tích lũy</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Xếp loại</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Lưu ý</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Lỗi</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={`${index}${className}`}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.row} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.gioiTinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngaySinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.noiSinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganhDaoTao} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.chuyenNganh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThuc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diem} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.xepLoai} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ketQua} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.luuY} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.error} />
                </tr>
            );
        }
    });

    render() {
        let { status, items, falseItems } = this.state;
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
                !status ? <FileBox postUrl='/user/upload' uploadType='ImportKetQuaTotNghiep' userData='ImportKetQuaTotNghiep'
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
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { saveImportKetQuaTotNghiep };
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);
