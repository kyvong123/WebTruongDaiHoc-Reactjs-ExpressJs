import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, TableCell, renderTable, FormTabs } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { saveImportDiemSinhVien } from './redux';


class ImportModal extends AdminModal {
    state = { isUpload: false, items: [], falseItems: [], isSave: false }

    componentDidMount() {
        this.disabledClickOutside();
    }

    downloadExcel = () => {
        T.handleDownload(`/api/dt/gv/import-diem/template?id=${this.props.id}`);
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
                const { dataStudent, tpDiem, dataHocPhan, readOnly } = this.props,
                    { items } = this.state,
                    listStudent = items.map(item => {
                        let { idDinhChiThi } = dataStudent.find(i => i.mssv == item.mssv) || { idDinhChiThi: '' };
                        return { ...item, idDinhChiThi };
                    });

                if (readOnly) return T.alert('Không trong thời gian nhập điểm', 'warning', false, 5000);

                T.alert('Đang cập nhật điểm sinh viên!', 'warning', false, null, true);
                this.props.saveImportDiemSinhVien(T.stringify({ dataStudent: listStudent, tpDiem, dataHocPhan }), () => {
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
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mssv</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ và tên</th>
            {
                this.props.tpDiem.map(i => (<th style={{ width: 'auto', whiteSpace: 'nowrap' }} key={i.thanhPhan}>{i.tenThanhPhan}</th>))
            }
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
                    {
                        this.props.tpDiem.map(i => (<TableCell style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} key={`diem${index}${i.thanhPhan}${className}`} content={item.dataDacBiet[i.thanhPhan] || item[i.thanhPhan]} />))
                    }
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.error} />
                </tr>
            );
        }
    });

    render = () => {
        let { isUpload, items, falseItems, isSave } = this.state,
            { listTpThi = [], tpDiem = [], dataStudent = [], kyThi, configQC = [], codeStatus = [] } = this.props,
            data = {
                listTpThi, tpDiem, kyThi, configQC, codeStatus,
                dataStudent: dataStudent.map(i => ({ mssv: i.mssv, lockDiem: i.lockDiem }))
            };

        return this.renderModal({
            title: 'Import điểm',
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
                        !isUpload ? <FileBox postUrl={`/user/upload?data=${T.stringify(data)}`} uploadType='GvImportDiem' userData='GvImportDiem'
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
const mapActionsToProps = { saveImportDiemSinhVien };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ImportModal);