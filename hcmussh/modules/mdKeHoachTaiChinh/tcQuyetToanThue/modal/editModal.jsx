
import { Tooltip } from '@mui/material';
import React from 'react';
import { AdminModal, FormTextBox, renderDataTable, TableCell } from 'view/component/AdminPage';

const tinhTrangMapper = {
    'CHUA_DONG': <span className='badge badge-pill badge-warning p-1' style={{ width: '80px' }}>Chưa đóng</span>,
    'DA_DONG': <span className='badge badge-pill badge-success p-1' style={{ width: '80px' }}>Đã đóng</span>
};
class RowEditComponent extends React.Component {
    componentDidMount() {
        this.soTienThanhToan?.value(this?.props.item?.soTienThanhToan);
    }
    value = () => {
        return {
            soTienThanhToan: this.soTienThanhToan.value() || 0,
            dot: this.props?.item.dot,
            tinhTrang: this.props?.item?.tinhTrang
        };
    }
    render() {
        const { item } = this.props;
        return <tr>
            {/* <TableCell style={{ textAlign: 'left' }} type='number' content={index + 1} /> */}
            <TableCell style={{ textAlign: 'left' }} type='number' content={item.dot} />
            <TableCell style={{ textAlign: 'left' }} type='text' content={
                <FormTextBox type='number' disabled={item.tinhTrang == 'DA_DONG'}
                    ref={e => this.soTienThanhToan = e}
                    onChange={() => {
                        this.props.onChangeSoTien();
                    }} className='m-0 p-0'></FormTextBox>}
            />
            <TableCell style={{ textAlign: 'left' }} type='number' content={tinhTrangMapper[item.tinhTrang]} />
            {
                item.tinhTrang == 'CHUA_DONG' && <TableCell style={{ textAlign: 'left' }} type='buttons' >
                    <Tooltip title='Chỉnh sửa' arrow>
                        <button className='btn btn-danger' onClick={() => {
                            this.props.deleteDot(item.dot);
                        }}>
                            <i className='fa fa-trash' />
                        </button>
                    </Tooltip>
                </TableCell>
            }
        </tr>;
    }
}

export default class EditModal extends AdminModal {
    listRow = {}
    onShow = ({ shcc, nam, congNo }) => {
        this.props.getDetailDotDongThue(shcc, nam, res => {
            this.setState({ list: res.items, congNoHienTai: congNo, congNoThayDoi: congNo, shcc, nam });
        });
    }
    resetPage = () => {
        this.props.getDetailDotDongThue(this.state.shcc, this.state.nam, res => {
            this.setState({ list: res.items });
        });
    }
    createDot = () => {
        this.setState({ list: [...this.state.list, { dot: this.state.list?.length + 1, soTien: 0, tinhTrang: 'CHUA_DONG' }] });
    }
    deleteDot = (dot) => {
        this.setState({ list: this.state.list?.filter(item => item.dot != dot) }, () => {
            delete this.listRow[dot];
            this.onChangeSoTien();
        });
    }
    onChangeSoTien = () => {
        let sum = 0;
        for (let i = 0; i < this.state.list.length; i++) {
            if (this.listRow[i + 1].value().tinhTrang == 'CHUA_DONG') {
                sum += parseInt(this.listRow[i + 1].value().soTienThanhToan ?? '0');
            }
        }
        this.setState({ congNoThayDoi: sum });
    }
    onSubmit = () => {
        const changes = [];
        for (let i = 0; i < this.state.list.length; i++) {
            if (this.listRow[i + 1].value().tinhTrang == 'CHUA_DONG') {
                if (this.listRow[i + 1].value().soTienThanhToan == 0) {
                    T.notify('Vui lòng không để trống số tiền', 'danger');
                    return;
                }
                changes.push(this.listRow[i + 1].value());
            }
        }
        this.props.updateDetailThue(this.state.shcc, this.state.nam, changes, () => {
            T.notify('Cập nhật thành công', 'success');
            this.hide();
        });
    }
    render = () => {
        const table = renderDataTable({
            data: this.state.list || [],
            divStyle: { height: '50vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Đợt</th>
                    <th style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap' }}>Số tiền</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: <tbody>

                {this.state?.list?.map((item, index) => <RowEditComponent ref={e => this.listRow[item.dot] = e}
                    key={index}
                    item={item}
                    deleteDot={this.deleteDot}
                    onChangeSoTien={this.onChangeSoTien}
                ></RowEditComponent>)}
                <tr>
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} colSpan={4}
                        content={
                            <div className='d-flex justify-content-center'>
                                <button className='btn btn-success' style={{ minWidth: '200px' }} onClick={() => this.createDot()}>
                                    <i className='fa fa-plus' /> Thêm đợt đóng thuế mới cho cán bộ
                                </button>
                            </div>
                        }
                    >
                    </TableCell>
                </tr>
            </tbody>
        });
        return this.renderModal({
            title: `Chỉnh sửa chi tiết đợt đóng thuế ${this.state.shcc} - ${this.state.nam}`,
            size: 'large',
            isLoading: this.state.isLoading,
            submitText: 'Thay đổi',
            body: <div>
                <h5><strong>Tổng công nợ trước thay đổi: </strong> {T.numberDisplay(this.state.congNoHienTai || '0')} VNĐ</h5>
                <h5><strong>Tổng công nợ sau thay đổi: </strong> <span className='text-primary'>{T.numberDisplay(this.state.congNoThayDoi || '0')} VNĐ</span></h5>
                <br />
                {table}
            </div>
        });
    }
}


