import { Tooltip } from '@mui/material';
import React from 'react';
// import { getHoaDonHocPhi } from '../redux';
import { AdminModal, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';

export default class CreateInvoice extends AdminModal {
    onShow = (item) => {
        let { mssv, namHoc, hocKy } = item;
        this.props.getHocPhi(mssv, result => {
            this.setState({ hocPhiDetail: result.hocPhiDetail || [], mssv, hocKy, namHoc, loaiPhi: [], hocPhiInvocieDetail: [], isLoading: false });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { mssv, hocKy, namHoc, loaiPhi } = this.state;

        if (loaiPhi.length == 0) {
            T.notify('Bạn chưa chọn loại phí', 'danger');
        } else {
            this.setState({ isLoading: true }, () => {
                this.props.create(mssv, hocKy, namHoc, loaiPhi, () => {
                    this.hide();
                }, () => this.setState({ isLoading: false }));
            });
        }
    }

    onAdd = (e) => {
        e.preventDefault();
        let { mssv, namHoc, hocKy, loaiPhi = [] } = this.state;

        try {
            const selectedItem = this.loaiPhi.data();
            const data = {
                mssv, namHoc, hocKy
            };

            if (loaiPhi.includes(selectedItem.loaiPhi)) {
                T.notify('Đã chọn xuất hóa đơn cho loại phí này', 'danger');
                return;
            }

            data.loaiPhi = [...loaiPhi, selectedItem.loaiPhi];

            this.setState({ hocPhiInvocieDetail: null }, () => {
                this.props.getHoaDonDetail(data, result => {
                    this.setState({ hocPhiInvocieDetail: result, loaiPhi: data.loaiPhi });
                    this.loaiPhi.value('');
                }, () => this.setState({ hocPhiInvocieDetail: [], loaiPhi: [] }));
            });

        } catch {
            T.notify('Loại phí bị trống', 'danger');
            this.loaiPhi.focus();
        }
    }
    renderSelectBox = (dataSource) => {
        return (<FormSelect key={T.stringify(dataSource, '', true)} className='col-md-10' data={dataSource} ref={e => this.loaiPhi = e} label='Loại phí' required />);
    }
    render = () => {
        const SelectAdapter_TcLoaiPhiInvoice = this.props.tcHocPhi?.data?.hocPhiDetail?.map((item, index) => ({ id: index, loaiPhi: item.loaiPhi, text: item.tenLoaiPhi, soTien: item.soTien })) || [];
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#1b489f', color: '#fff' });
        let table = renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            header: 'thead-light',
            getDataSource: () => this.state.hocPhiInvocieDetail,
            renderHead: () => (
                <tr>
                    <th style={style()}>STT</th>
                    <th style={style('100%')}>Loại phí</th>
                    <th style={style('auto', 'right')}>Số tiền</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiPhi} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={item.soTien || ''} />
                </tr>
            )
        });

        return this.renderModal({
            title: 'Chọn loại phí để xuất hóa đơn',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                {this.renderSelectBox(SelectAdapter_TcLoaiPhiInvoice)}
                {/* <FormTextBox className='col-md-4' ref={e => this.soTien = e} label='Số tiền' disabled /> */}
                <div className='form-group col-md-2 d-flex align-items-end justify-content-end' >
                    <Tooltip title='Thêm' arrow>
                        <button className='btn btn-success' onClick={(e) => this.onAdd(e)}>
                            <i className='fa fa-lg fa-plus' />
                        </button>
                    </Tooltip>
                </div>
                <div className='form-group col-md-12' style={{ marginTop: '30px' }}>{table}</div>
            </div>
        });
    }
}