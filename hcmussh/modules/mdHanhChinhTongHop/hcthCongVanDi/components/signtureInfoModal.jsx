import { Tooltip } from '@mui/material';
import React from 'react';
import { AdminModal, renderTable, TableCell } from 'view/component/AdminPage';
import { getSignatureInfo } from '../../hcthKyDienTu/redux';
import { connect } from 'react-redux';

export class SignatureInfo extends AdminModal {
    state = { items: null }

    onShow = (vanBan) => {
        this.setState({ items: null, title: vanBan.file.ten }, () => {
            this.props.getSignatureInfo({ id: vanBan.id }, (items) => {
                this.setState({ items });
            });
        });
    }

    renderSignatures = () => {
        return renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            getDataSource: () => this.state.items,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên chữ ký</th>
                <th style={{ width: '60%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thông tin</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Lý do</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày ký</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tính toàn vẹn</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tính xác thực</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => {
                const info = [];
                item.thongTinLienLac && info.push(item.thongTinLienLac);
                item.location && info.push(item.location);
                return <tr key={item.id || index}>
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.name} />
                    <TableCell style={{ textAlign: 'left' }} content={info.join('; ')} />
                    <TableCell style={{ textAlign: 'left' }} content={item.reason} />
                    <TableCell style={{ textAlign: 'left' }} content={T.dateToText(item.ngayKy)} />
                    <TableCell style={{ textAlign: 'left' }} type='checkbox' content={item.integrity} />
                    <TableCell style={{ textAlign: 'left' }} type='checkbox' content={item.verified} />
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} type='buttons'  >
                        <Tooltip arrow title='Thông tin chứng chỉ'>
                            <button className='btn btn-success' onClick={() => this.props.certificateInfo.show(item)}>
                                <i className='fa fa-lg fa-certificate' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>;
            }
        });
    }

    render = () => {
        return this.renderModal({
            size: 'elarge',
            title: this.state.title,
            body: <div className='row'>
                <div className='col-md-12'>
                    {this.renderSignatures()}
                </div>
            </div>
        });

    }
}

export class CertificateInfo extends AdminModal {
    state = { subject: {}, issuer: {} }

    onShow = (item) => {
        this.setState({ subject: item.subject, issuer: item.issuer });
    }

    renderSignatures = (data) => {
        return renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            getDataSource: () => Object.entries(data),
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Từ khóa</th>
                <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Giá trị</th>
            </tr>,
            renderRow: (item, index) => {
                return <tr key={item.id || index}>
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item[0]} />
                    <TableCell style={{ textAlign: 'left' }} content={item[1]} />
                </tr>;
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Thông tin chứng thư',
            size: 'elarge',
            style: { zIndex: 10000 },
            body: <div className='row'>
                <div className='col-md-12'>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <a className='nav-link active show' data-toggle='tab' href='#subjectInfo'>Thông tin</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#issuerInfo'>Cấp bởi</a>
                        </li>
                    </ul>

                    <div className='tab-content tile'>
                        <div className='tab-pane fade active show' id='subjectInfo'>
                            <div className='tile-body row'>
                                <div className='col-md-12'>
                                    {this.renderSignatures(this.state.subject)}
                                </div>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='issuerInfo'>
                            <div className='tile-body row'>
                                <div className='col-md-12'>
                                    {this.renderSignatures(this.state.issuer)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        });

    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSignatureInfo };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SignatureInfo);
