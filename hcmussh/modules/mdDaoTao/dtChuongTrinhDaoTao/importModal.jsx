import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, TableCell, renderTable, FormTabs } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { saveImportSinhVien } from './redux';


class ImportModal extends AdminModal {
    state = { isUpload: false, items: [], falseItems: [], isSave: false }

    componentDidMount() {
        this.disabledClickOutside();
    }

    downloadExcel = () => {
        T.handleDownload('/api/dt/chuong-trinh-dao-tao/sinh-vien/template');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.alert(response.error, 'error', false, 2000);
        } else {
            this.setState({ isUpload: true, ...response });
        }
    };

    onSave = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn lưu dữ liệu import?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const { items } = this.state;

                T.alert('Đang cập nhật điểm sinh viên!', 'warning', false, null, true);
                this.props.saveImportSinhVien(T.stringify(items), this.props.maKhung, () => {
                    this.setState({ isSave: true });
                    this.props.handleSetData();
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
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mssv</th>
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

    render = () => {
        let { isUpload, items, falseItems, isSave } = this.state;

        return this.renderModal({
            title: 'Import sinh viên',
            size: 'elarge',
            isShowSubmit: false,
            body: <div>
                <div className='rows'>
                    <button className='btn btn-warning' type='button' onClick={this.downloadExcel}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file import
                    </button>
                    <button className='btn btn-primary' style={{ margin: '5px' }} onClick={() => this.setState({ isUpload: false, isSave: false, items: [], falseItems: [] })} >
                        <i className='fa fa-refresh' /> Tải lại
                    </button>
                    <button className='btn btn-danger' type='button' style={{ margin: '5px', display: falseItems.length ? '' : 'none' }} onClick={() => this.downloadErrorExcel()}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file lỗi
                    </button>
                    <button className='btn btn-success' type='button' style={{ margin: '5px', display: !isSave && items.length ? '' : 'none' }} onClick={this.onSave}>
                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                    </button>
                    {
                        !isUpload ? <FileBox postUrl={`/user/upload?ma=${this.props.maKhung}`} uploadType='ImportSvCtdt' userData='ImportSvCtdt'
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
        });
    }
}

const mapStateToProps = state => ({ system: state.system, });
const mapActionsToProps = { saveImportSinhVien };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ImportModal);