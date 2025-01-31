import React from 'react';
import { connect } from 'react-redux';
import FileBox from 'view/component/FileBox';
import { createDtDiemImportExcel } from 'modules/mdDaoTao/dtDiem/redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class ImportDiem extends AdminPage {
    state = { displayState: 'import', error: false };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/thoi-khoa-bieu/import-diem/:maHocPhan'),
                maHocPhan = route.parse(window.location.pathname).maHocPhan;
            let { namHoc, hocKy, maMonHoc } = history.state.state;
            maMonHoc = maMonHoc.split(':')[0];
            this.setState({ maHocPhan, namHoc, hocKy, maMonHoc });
        });
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else if (response.items) {
            let { items } = response;
            this.setState({ displayState: 'data', totalItem: items });
        }
    };

    save = () => {
        let { totalItem, maHocPhan, namHoc, hocKy, maMonHoc } = this.state;
        console.log(maMonHoc);
        totalItem = totalItem.map(item => item = {
            ...item,
            diemTk: ((item.diemGk * item.phanTramDiemGk / 100 + item.diemCk * item.phanTramDiemCk / 100)).toFixed(2),
            maHocPhan, namHoc, hocKy: parseInt(hocKy), maMonHoc
        });
        this.props.createDtDiemImportExcel(totalItem, () => {
            this.props.history.push(`/user/dao-tao/thoi-khoa-bieu/edit/${maHocPhan}`);
        });
    }

    downloadExcel = () => {
        T.handleDownload(`/api/dt/thoi-khoa-bieu/sinh-vien/download-dssv-hoc-phan?maHocPhan=${this.state.maHocPhan}`);
    }

    render() {
        let { displayState, totalItem, error } = this.state;
        totalItem?.forEach(item => {
            item.message.length > 0 ? error = true : null;
        });
        let table = renderTable({
            getDataSource: () => totalItem,
            header: 'thead-light',
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ width: '40%', verticalAlign: 'middle', textAlign: 'center' }}>Họ và tên</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Lớp</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm<br />giữa kỳ</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm<br />cuối kỳ</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm<br />tổng kết</th>
                        <th style={{ width: '60%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    </tr>
                </>
            ),
            renderRow: (item, index) => {
                return <tr key={index} style={{ backgroundColor: item.message.length > 0 ? '#ffdad9' : '' }}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ textAlign: 'center' }} content={item.lop} />
                    <TableCell style={{ textAlign: 'center' }} content={item.diemGk} />
                    <TableCell style={{ textAlign: 'center' }} content={item.diemCk} />
                    <TableCell style={{ textAlign: 'center' }} content={((item.diemGk * item.phanTramDiemGk / 100 + item.diemCk * item.phanTramDiemCk / 100)).toFixed(2)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.message.map((item, i) => <div key={i}>{item}</div>)} />
                </tr>;
            }
        });
        return this.renderPage({
            title: 'Import Điểm sinh viên',
            icon: 'fa fa-upload',
            content: <div className='tile'>
                <div className='rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none' }}>
                    <FileBox postUrl={`/user/upload?maHocPhan=${this.state.maHocPhan}`} uploadType='DtThoiKhoaBieuData' userData={'DtThoiKhoaBieuData'}
                        accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ width: '80%', margin: '0 auto' }}
                        ajax={true} success={this.onSuccess} />
                    <button className='btn btn-warning' type='button' onClick={this.downloadExcel}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải danh sách sinh viên
                    </button>
                </div>
                <div className='rows' style={{ display: displayState == 'import' ? 'none' : 'block' }}>
                    {displayState != 'import' && <>
                        <h4>Danh sách điểm lớp: {this.state.maHocPhan}</h4>
                        <div className='rows' style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' onClick={() => this.setState({ displayState: 'import' })}>
                                <i className='fa fa-refresh' /> ReLoad
                            </button>
                        </div>
                        {table}
                    </>};
                </div>
            </div>,
            backRoute: `/user/dao-tao/thoi-khoa-bieu/edit/${this.state.maHocPhan}`,
            buttons: displayState == 'import' ? null : error ? null : { icon: 'fa-save', tooltip: 'Lưu', className: 'btn btn-primary', onClick: e => e.preventDefault() || this.save() }
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = { createDtDiemImportExcel };
export default connect(mapStateToProps, mapActionsToProps)(ImportDiem);
