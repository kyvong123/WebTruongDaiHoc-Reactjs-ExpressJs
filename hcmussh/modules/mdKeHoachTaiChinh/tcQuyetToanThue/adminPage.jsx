import React from 'react';
import { AdminPage, FormCheckbox, FormSelect, TableCell, renderDataTable } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getPage, deleteItems, getDetailDotDongThue, updateDetailThue } from './redux';
import Pagination from 'view/component/Pagination';
import ImportQuyetToanThue from './modal/uploadNoModal';
import EditModal from './modal/editModal';
import { NumberIcon } from '../tcHocPhi/adminPage';
import { Tooltip } from '@mui/material';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const nam = i + new Date().getFullYear() - 10;
        return { id: nam, text: `${nam}` };
    });
};
const trangThai = [
    {
        id: 'TAT_CA',
        text: 'Tất cả'
    },
    {
        id: 'CHUA_NOP',
        text: 'Chưa nộp'
    },
    {
        id: 'NOP_DU',
        text: 'Nộp đủ'
    }
];
export class TcQuyetToanThue extends AdminPage {
    state = { listSelected: [] }
    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => {
                this.getPage(undefined, undefined, searchText || '');
                this.setState({ searchText: searchText || '' });
            };
            T.showSearchBox(true);
        });
        const nam = (new Date()).getFullYear() - 1;
        this.setState({ filter: { nam } }, () => {
            this.year.value(nam);
            this.trangThai.value('TAT_CA');
            this.handleChange();
        });
    }
    getPage = (pageN, pageS, pageC, done) => {
        this.props.getPage(pageN, pageS, pageC, this.state.filter, done);
    }
    handleChange = () => {
        this.setState({ filter: { nam: this.year.value(), trangThai: this.trangThai.value() }, listSelected: [] }, () => {
            this.props.getPage(undefined, undefined, undefined, this.state.filter, undefined);

        });
    }
    exportFilter = () => {
        T.download(`/api/khtc/quyet-toan-thue/export?nam=${this.year.value()}&searchTerm=${this.state.searchText || ''}`);
    }
    onCheckBox = (id, value) => {
        let listSelected = this.state.listSelected;
        if (value) {
            this.setState({ listSelected: [...listSelected, id] });
        } else {
            this.setState({ listSelected: listSelected.filter(item => item != id) });
        }
    }
    onDelete = () => {
        if (!this.state.listSelected.length) {
            T.notify('Vui lòng chọn hàng cần xóa', 'danger');
            return;
        }
        T.confirm('Xác nhận xóa các dòng đã chọn', '', isConfirm => {
            if (!isConfirm) return;
            this.props.deleteItems(this.state.listSelected, this.year.value());
        });

    }

    onEdit = (e, item) => {
        e.preventDefault();
        this.editModal.show(item);
    }
    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list, totalDongDu } = this.props.tcQuyetToanThue && this.props.tcQuyetToanThue.page ? this.props.tcQuyetToanThue.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null, totalDongDu: 0
        };
        const table = renderDataTable({
            data: list || [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}></th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã cán bộ</th>
                    <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Họ và tên lót</th>
                    <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Số tiền (VNĐ)</th>
                    <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Số tiền đã nộp (VNĐ)</th>
                    <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Công nợ (VNĐ)</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày cập nhật</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'left' }} type='number' content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                        content={<FormCheckbox readOnly={item.transactionId} key={item.shcc} className='mb-0' labelClassName='mb-0' onChange={(value) => this.onCheckBox(item.shcc, value)} />}
                    />
                    <TableCell style={{ textAlign: 'center' }} type='text' content={item.shcc} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ textAlign: 'left' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={T.numberDisplay(item.soTien)} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={T.numberDisplay(parseInt(item.soTien) - parseInt(item.congNo))} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={T.numberDisplay(item.congNo)} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayUpdate, 'HH:MM dd/mm/yy')} />
                    {/* <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='buttons' content={T.dateToText(item.ngayUpdate, 'HH:MM dd/mm/yy')} /> */}
                    <TableCell type='buttons' content={item} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <Tooltip title='Chỉnh sửa' arrow>
                            <button className='btn btn-primary' onClick={(e) => this.onEdit(e, item)}>
                                <i className='fa fa-pencil-square-o' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>),
        });
        return this.renderPage({
            title: 'Quản lý quyết toán thuế',
            icon: 'fa fa-id-card-o',
            header: <>
                <FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm' data={yearDatas()} onChange={() => this.handleChange()} />
                <FormSelect ref={e => this.trangThai = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm' data={trangThai} onChange={() => this.handleChange()} />
            </>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/tncn'>Thu nhập cá nhân</Link>,
                'Quyết toán thuế'],
            content: <div>
                <div className='row'>
                    <div className='col-md-6'>
                        <NumberIcon type='primary' icon='fa-users' title='Tổng số  cán bộ nộp thuế tncn' value={totalItem || 0} />
                    </div>
                    <div className='col-md-6'>
                        <NumberIcon type='info' icon='fa-money' title='Tổng số  cán bộ đã nộp đủ' value={totalDongDu || 0} />
                    </div>
                </div>
                <div className='tile'>
                    <div className='d-flex justify-content-end mb-2'>
                        <div>
                            <button className='btn btn-danger' onClick={(e) => {
                                e.preventDefault();
                                this.onDelete();
                            }}>
                                <div className='d-flex justify-content-baseline'>
                                    <i className='fa fa-trash'> </i> Xóa
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {table}
                            <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} />
                        </div>
                    </div>
                    <ImportQuyetToanThue ref={e => this.modal = e} reset={() => this.handleChange()}></ImportQuyetToanThue>
                    <EditModal ref={e => this.editModal = e}
                        getDetailDotDongThue={this.props.getDetailDotDongThue}
                        updateDetailThue={this.props.updateDetailThue}
                    > </EditModal>
                </div>
            </div>,
            onExport: () => this.exportFilter(),
            onImport: () => this.modal.show({ nam: this.year?.value() }),
        });
    }
}




const mapStateToProps = state => ({ system: state.system, tcQuyetToanThue: state.finance.tcQuyetToanThue });
const mapActionsToProps = { getPage, deleteItems, getDetailDotDongThue, updateDetailThue };
export default connect(mapStateToProps, mapActionsToProps)(TcQuyetToanThue);
