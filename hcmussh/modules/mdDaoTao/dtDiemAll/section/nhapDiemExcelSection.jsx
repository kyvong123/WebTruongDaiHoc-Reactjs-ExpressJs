import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell, FormTabs, FormCheckbox } from 'view/component/AdminPage';
import { dtDiemAllSaveImport } from 'modules/mdDaoTao/dtDiemAll/redux';
import { getDtDmLoaiDiemAll } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';
import FileBox from 'view/component/FileBox';
import xlsx from 'xlsx';


class NhapDiemExcelSection extends AdminPage {
    state = { error: false, dmLoaiDiem: [], isUpload: false, items: [], falseItems: [], dataLoaiDiem: [] };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtDmLoaiDiemAll(dataLoaiDiem => this.setState({ dataLoaiDiem: dataLoaiDiem.map(loai => ({ ...loai, isCheck: true && loai.kichHoat })) }));
        });
        T.socket.on('dt-diem-all-import-data', ({ requester, items, falseItems, dmLoaiDiem, index, isDone }) => {
            if (this.props.system.user.email === requester) {
                if (!isDone) {
                    T.alert(`Đang import dữ liệu điểm hàng ${index}!`, 'warning', false, null, true);
                } else {
                    T.alert('Import dữ liệu điểm thành công', 'success', false, 1000);
                }
                this.setState({ items, falseItems, dmLoaiDiem, isUpload: true });
            }
        });
        T.socket.on('dt-diem-all-save-import-data', ({ requester, mssv, maHocPhan, isDone }) => {
            if (this.props.system.user.email === requester) {
                if (!isDone) {
                    T.alert(`Đang lưu dữ liệu điểm của sinh viên ${mssv} và học phần ${maHocPhan} thành công!`, 'warning', false, null, true);
                } else {
                    T.alert('Lưu dữ liệu điểm thành công', 'success', false, 1000);
                    window.location.search = '';
                }
            }
        });
    }

    willUnmount() {
        T.socket.off('dt-diem-all-import-data');
        T.socket.off('dt-diem-all-save-import-data');
    }

    setValue = ({ items, falseItems, dmLoaiDiem, srcPath, taskId }) => {
        this.setState({ items, falseItems, dmLoaiDiem, srcPath, isUpload: true, taskId }, () => T.alert('Load dữ liệu điểm import thành công', 'success', false, 1000));
    }

    downloadExcel = () => {
        let { dataLoaiDiem } = this.state;
        T.handleDownload(`/api/dt/diem-all/import/download-template?dataLoaiDiem=${T.stringify(dataLoaiDiem.filter(i => i.isCheck))}`);
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách import điểm bị lỗi.xlsx');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        }
    };

    onSave = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn lưu dữ liệu import?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const { items, taskId, srcPath } = this.state;
                this.props.dtDiemAllSaveImport(T.stringify(items), { taskId, srcPath });
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
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm học</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mssv</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã môn học</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Mã học phần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thành phần điểm</th>
            {
                this.state.dmLoaiDiem.map(i => (<th style={{ width: 'auto', whiteSpace: 'nowrap' }} key={i.ma}>{i.ten}</th>))
            }
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tổng kết</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lỗi</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={`${index}${className}`}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.row} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.configThanhPhan ? item.configThanhPhan.map(i => <div key={`${index}${i.tenThanhPhan}${className}`}><b>{i.tenThanhPhan}</b>: {i.phanTram}%</div>) : ''}</>} />
                    {
                        this.state.dmLoaiDiem.map(i => (<TableCell style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} key={`diem${index}${i.ma}${className}`} content={item.dataDacBiet[i.ma] || item[i.ma]} />))
                    }
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item['TK']} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.error} />
                </tr>
            );
        }
    });

    checkThanhPhan = (value, ma) => {
        let { dataLoaiDiem } = this.state;
        this.setState({ dataLoaiDiem: dataLoaiDiem.map(loai => loai.ma == ma ? ({ ...loai, isCheck: value }) : ({ ...loai })) });
    }

    render() {
        let { isUpload, items, falseItems, dataLoaiDiem, taskId } = this.state;
        return <>
            <div className='d-flex' style={{ gap: '20px', margin: '10px 50px' }}>
                <label style={{ fontWeight: 'bold' }}>Chọn các loại điểm thành phần để import: </label>
                {
                    dataLoaiDiem.map(loai => <FormCheckbox key={loai.ma} ref={e => this.ma = e} label={loai.ten} value={loai.isCheck} onChange={value => this.checkThanhPhan(value, loai.ma)} />)
                }
            </div>
            <div className='rows'>
                <button className='btn btn-warning' type='button' onClick={this.downloadExcel}>
                    <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file import
                </button>
                <button className='btn btn-primary' style={{ margin: '5px' }} onClick={() => this.setState({ isUpload: false, items: [], falseItems: [] })} >
                    <i className='fa fa-refresh' /> ReLoad
                </button>
                <button className='btn btn-danger' type='button' style={{ margin: '5px', display: falseItems.length ? '' : 'none' }} onClick={() => this.downloadErrorExcel()}>
                    <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file lỗi
                </button>
                <button className='btn btn-success' type='button' style={{ margin: '5px', display: items.length && taskId ? '' : 'none' }} onClick={this.onSave}>
                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                </button>
                {
                    !isUpload ? <FileBox postUrl='/user/upload' uploadType='ImportDiemAll' userData='ImportDiemAll'
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
        </>;
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { dtDiemAllSaveImport, getDtDmLoaiDiemAll };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(NhapDiemExcelSection);