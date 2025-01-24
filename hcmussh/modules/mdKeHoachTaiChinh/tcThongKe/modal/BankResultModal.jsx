import React from 'react';
import { AdminModal, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';

export default class BankResultModal extends AdminModal {
    onShow = data => {
        this.setState({ data }, () => {
            this.soLuong.value(data.stat.soLuong);
            this.soTien.value(data.stat.soTien);
        });
    }
    render = () => {
        return this.renderModal({
            title: 'Kết quả tra cứu',
            size: 'large',
            body: <div className="row">
                <FormTextBox ref={e => this.soLuong = e} className='col-md-6' label='Số lượng' disabled />
                <FormTextBox ref={e => this.soTien = e} className='col-md-6' label='Số Tiền' type='number' disabled/>

                <div className='col-md-12'>

                    {renderTable({
                        getDataSource: () => Object.entries(this.state.data || []),
                        renderHead: () => <tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ngân hàng</th>
                            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Số lượng sinh viên</th>
                            <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số tiền</th>
                        </tr>,
                        renderRow: ([key, value], index) => {
                            if (key != 'stat')
                                return <tr key={key}>
                                    <TableCell content={index + 1} />
                                    <TableCell content={key} />
                                    <TableCell type='number' content={value.stat.soLuong} />
                                    <TableCell type='number' content={value.stat.soTien} />
                                </tr>;
                        },
                    })}
                </div>
            </div>
        });
    }
}