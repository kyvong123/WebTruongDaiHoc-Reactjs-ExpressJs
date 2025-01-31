import React from 'react';
import { connect } from 'react-redux';
import FileBox from 'view/component/FileBox';
import { createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao } from './redux';
import { AdminPage, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import xlsx from 'xlsx';


class ImportChuongTrinhDaoTao extends AdminPage {
    state = { displayState: 'import', items: [], falseItems: [] };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            let ma = new URLSearchParams(window.location.search).get('id');
            this.setState({ ma: ma || 'new', maKhung: history.state.state.maKhung, data: history.state.state.data });
        });
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else {
            let { items, falseItems } = response;
            T.notify('Đọc dữ liệu import môn học thành công!', 'success');
            this.setState({ displayState: 'done', items, falseItems });
        }
    };

    downloadExcel = () => {
        T.handleDownload(`/api/dt/chuong-trinh-dao-tao/download-template?maKhung=${this.state.maKhung}`);
    }

    createCTDT = (updateDatas) => {
        T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
        this.props.createDtChuongTrinhDaoTao(updateDatas, ctdt => {
            T.alert('Tạo mới thành công', 'success', false, 1000, true);
            window.location = `/user/dao-tao/chuong-trinh-dao-tao/${ctdt.item.id}`;
        });
    }

    save = () => {
        let { ma, data, items } = this.state;
        if (data) {
            const updateDatas = { items, ...{ id: ma, data } };
            T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
            ma == 'new' ? this.createCTDT(updateDatas) : this.props.updateDtChuongTrinhDaoTao(ma, updateDatas, () => {
                T.alert('Cập nhật thành công', 'success', false, 1000);
                window.location = `/user/dao-tao/chuong-trinh-dao-tao/${ma}`;
            });
        }
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách import môn CTDT bị lỗi.xlsx');
    }

    table = items => renderTable({
        getDataSource: () => items,
        header: 'thead-light',
        emptyTable: 'Không có dữ liệu',
        renderHead: () => (
            <>
                <tr>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle' }}>Dòng</th>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã môn học</th>
                    <th rowSpan={2} style={{ width: '60%', verticalAlign: 'middle', textAlign: 'center' }}>Tên môn học</th>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tín chỉ</th>
                    <th rowSpan={1} colSpan={3} style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Số tiết</th>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Học kỳ<br />dự kiến</th>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học<br />dự kiến</th>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Khối kiến thức</th>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Khối kiến thức con</th>
                    <th rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tỷ lệ điểm</th>
                    <th rowSpan={2} style={{ width: '40%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                </tr>
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH/TN</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng</th>
                </tr>
            </>
        ),
        renderRow: (item, index) => {
            return <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.stt} />
                <TableCell content={item.maMonHoc} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonHoc} />
                <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? <i className='fa fa-fw fa-lg fa-check' /> : ''} />
                <TableCell style={{ textAlign: 'center' }} content={item.soTinChi} />
                <TableCell style={{ textAlign: 'center' }} content={item.soTietLyThuyet} />
                <TableCell style={{ textAlign: 'center' }} content={item.soTietThucHanh} />
                <TableCell style={{ textAlign: 'center' }} content={item.tongSoTiet} />
                <TableCell style={{ textAlign: 'center' }} content={item.hocKyDuKien} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.namHocDuKien} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoiKienThuc} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoiKienThucCon} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.dataTyLe?.sort((a, b) => parseInt(a.phanTram) - parseInt(b.phanTram)).map(i => <div key={`${index}${i.loaiThanhPhan}`}><b>{i.loaiThanhPhan}</b>: {i.phanTram}%</div>)}</>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.error} />
            </tr>;
        }
    });

    render() {
        let { displayState, falseItems, items } = this.state;
        return this.renderPage({
            title: 'Import chương trình đào tạo',
            icon: 'fa fa-upload',
            content: <div className='tile'>
                <div className='rows' style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <button className='btn btn-warning' type='button' onClick={this.downloadExcel}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file import
                    </button>
                    <button className='btn btn-primary' style={{ margin: '5px' }} onClick={() => this.setState({ displayState: 'import', items: [], falseItems: [] })}>
                        <i className='fa fa-refresh' /> Reload
                    </button>
                    <button className='btn btn-danger' type='button' style={{ margin: '5px', display: falseItems.length ? '' : 'none' }} onClick={() => this.downloadErrorExcel()}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file lỗi
                    </button>
                    <button className='btn btn-success' type='button' style={{ margin: '5px', display: items.length && displayState == 'done' ? '' : 'none' }} onClick={this.save}>
                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                    </button>
                </div>
                {
                    displayState == 'import' ? <FileBox postUrl={`/user/upload?maKhung=${this.state.maKhung}`} uploadType='DtChuongTrinhDaoTaoData' userData={'DtChuongTrinhDaoTaoData'}
                        accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ width: '80%', margin: '0 auto' }}
                        ajax={true} success={this.onSuccess} /> : <FormTabs tabs={[{
                            title: `Danh sách import thành công (${items.length})`,
                            component: <>{this.table(items, '')}</>
                        }, {
                            title: `Danh sách import bị lỗi (${falseItems.length})`,
                            component: <>{this.table(falseItems, 'errorTable')}</>
                        }
                        ]} />
                }
            </div>,
            backRoute: `/user/dao-tao/chuong-trinh-dao-tao/${this.state.ma}`,
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = { createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(ImportChuongTrinhDaoTao);
