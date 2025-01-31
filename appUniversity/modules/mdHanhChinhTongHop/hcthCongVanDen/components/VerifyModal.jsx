
import React from 'react';
import { AdminModal, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';

export default class VerifyModal extends AdminModal {
    state = {
        congVan: null,
        danhSachNguoiKy: [],
        isSearching: false
    };

    onShow = (item) => {
        const { ma, ten } = item;
        this.setState({ isSearching: true, items: null });
        this.props.xacThucCongVan(ma, ten, (items) => {
            this.setState({ items, isSearching: false });
        });
    }

    render = () => {
        let table = renderTable({
            emptyTable: 'Chưa có người ký',
            getDataSource: () => this.state.items,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thông tin chữ ký</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thông tin người ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Ngày ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Tính toàn vẹn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Đã xác thực</th>
                </tr>),
            renderRow: (item, index) => {

                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'wrap' }} content={item.name} />
                        <TableCell type='text' style={{ whiteSpace: 'wrap' }} content={item.thongTinLienLac} />
                        <TableCell type='text' style={{ whiteSpace: 'wrap' }} content={item.reason} />
                        <TableCell type='text' style={{ whiteSpace: 'wrap' }} content={item.ngayKy ? T.dateToText(item.ngayKy, 'dd/mm/yyyy HH:MM') : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            <span style={{ color: item.integrity ? 'green' : 'red' }}>
                                <i className={item.integrity ? 'fa fa-check-circle-o fa-2x' : 'fa fa-times-circle-o fa-2x'}></i>
                            </span>
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            <span style={{ color: item.verified ? 'green' : 'red' }}>
                                <i className={item.verified ? 'fa fa-check-circle-o fa-2x' : 'fa fa-times-circle-o fa-2x'}></i>
                            </span>
                        } />
                    </tr>
                );
            }
        });

        return this.renderModal({
            title: 'Xác thực văn bản đến',
            size: 'elarge',
            body: <>
                {
                    this.state.isSearching ?
                        loadSpinner() :
                        <div>
                            <h5 className='mt-2'>Danh sách người ký</h5>
                            {table}
                        </div>
                }
            </>
        });
    }
}