import React from 'react';
import { AdminPage } from 'view/component/AdminPage';

export class RowThueNam extends AdminPage {
    state = { isHidden: true }

    render() {
        return <div className='p-4 d-flex justify-content-between mb-3' style={{ backgroundColor: this.props.show ? '#E1EEF2' : '#FFF' }}>
            <div>
                <div>
                    <h5>Năm {this.props?.data?.nam}</h5>
                </div>
                <div className=''>
                    <table className='table-responsive'>
                        <tbody>
                            <tr>
                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>Tổng số tiền thuế TNCN</td>
                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(this.props?.data?.soTien)} VNĐ </b></div></td>
                            </tr>
                            <tr>
                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>Tổng số tiền đã nộp</td>
                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(parseInt(this.props?.data?.soTien) - parseInt(this.props?.data?.congNo))} VNĐ </b></div></td>
                            </tr>
                            <tr>
                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>Số tiền còn lại</td>
                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(parseInt(this.props?.data?.congNo))} VNĐ </b></div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='d-flex align-self-center'>
                <div>
                    {this.props.show ? <i className='fa fa-circle'></i> : <i className='fa fa-circle-o'></i>}
                </div>
            </div>
        </div>;
    }
}
