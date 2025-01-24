import { AdminPage, FormFileBox, renderTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import React from 'react';
import { createMultipleNguoiNhan } from './reduxNguoiNhan';
class NguoiNhanImportPage extends AdminPage {
    state = { items: [] }
    onSuccess = (response) => {
        if (response.error) {
            T.alert(`Lỗi tải file template: ${response.error}`, 'error', true, null);
        } else {
            const items = response.items;
            this.setState({ items });
        }
    }

    saveAll = () => {
        const data = this.state.items.filter(item => !item.errors.length);
        if (data.length) {
            this.props.createMultipleNguoiNhan(data, () => {
                T.alert('Lưu dữ liệu thành công', 'success', isCheck => {
                    isCheck && this.props.history.goBack();
                });
            });
        }
    }

    render() {
        const { items } = this.state;
        return this.renderPage({
            title: 'Import email người nhận',
            icon: 'fa fa-upload',
            content: <>
                {items.length ? <></> : <div className='tile'>
                    <FormFileBox uploadType='ENewsNguoiNhan' accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' onSuccess={this.onSuccess} />
                    <div className='text-center'>
                        <button className='btn btn-success' onClick={e => e.preventDefault() || T.download('/api/tt/e-news/nguoi-nhan/import/download-template')}>
                            <i className='fa fa-file-excel-o' /> Tải về file template
                        </button>
                    </div>
                </div>}
                {items.length ? <div className='tile'>
                    {renderTable({
                        getDataSource: () => items,
                        stickyHead: true,
                        renderHead: () => <tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                            <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Email</th>
                            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tên</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại người nhận</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Status</th>
                        </tr>,
                        renderRow: (item, index) => <tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={<span className={item.idLoaiNguoiNhan ? 'text-success' : 'text-danger'}>{item.loaiNguoiNhan}</span>} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                            <TableCell style={{ whiteSpace: 'nowrap', }} content={item.errors.length ? <>{item.errors.map((i, j) => <div key={j} className='text-danger'>{i}</div>)}</> : <span className='text-success'><i className='fa fa-check' /></span>} />
                        </tr>
                    })}
                </div> : <></>}
            </>,
            onSave: items.length && items.filter(item => !item.errors.length).length ? () => {
                T.confirm('Xác nhận lưu', 'Xác nhận lưu danh sách người nhận hợp lệ', 'info', true, isConfirm => {
                    isConfirm && this.saveAll();
                });
            } : null,
            onRefresh: items.length ? () => {
                T.confirm('Huỷ dữ liệu đọc', 'Bạn muốn huỷ dữ liệu và import file khác?', 'warning', true, isConfirm => {
                    isConfirm && this.setState({ items: [] });
                });
            } : null,
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createMultipleNguoiNhan };
export default connect(mapStateToProps, mapActionsToProps)(NguoiNhanImportPage);