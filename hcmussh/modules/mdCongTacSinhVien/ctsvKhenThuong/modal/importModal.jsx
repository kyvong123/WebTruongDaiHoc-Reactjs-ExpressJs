import React from 'react';
import { AdminModal, FormFileBox, renderTable } from 'view/component/AdminPage';

export default class ImportModal extends AdminModal {
    state = { result: null }

    onShow = () => {
        this.setState({ result: null });
    }

    onSuccess = (res) => {
        this.setState({ result: res }, this.props.getPage);
    }

    render = () => {
        return this.renderModal({
            title: 'Tải lên dữ liệu khen thưởng',
            body: <div className='row'>
                {this.state.result == null ? <>
                    <div className='col-md-12'><p className='pt-3'>Tải lên dữ liệu khen thưởng bằng tệp Excel(.xlsx). Tải tệp tin mẫu tại <a href='' onClick={e => e.preventDefault() || T.download('/api/ctsv/khen-thuong/import/template')}>đây</a></p></div>
                    <FormFileBox className='col-md-12' ref={e => this.uploadFile = e} uploadType='ctsvUploadKhenThuong' onSuccess={this.onSuccess} />
                </>
                    : <>
                        <p className='col-md-12'>Tải lên thành công <b>{this.state.result.success || 0}</b> dòng.</p>
                        <div className='col-md-12'>
                            {renderTable({
                                getDataSource: () => this.state.result?.failed || [],
                                emptyTable: 'Không có thông báo',
                                renderHead: () => (<tr>
                                    <th style={{ whiteSpace: 'nowrap' }}>Dòng</th>
                                    <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thông báo</th>
                                </tr>),
                                renderRow: (item, index) => (<tr key={index}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{item.rowNumber}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{item.message}</td>
                                </tr>)
                            })}
                        </div>
                    </>
                }
            </div>
        });
    }
}