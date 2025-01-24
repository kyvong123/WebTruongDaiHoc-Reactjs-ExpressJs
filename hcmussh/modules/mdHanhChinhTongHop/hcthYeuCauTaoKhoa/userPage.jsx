import React from 'react';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { createRequest, getUserRequest, getKey, downloadKey } from './redux';
import { DrawSignatureModal } from './components';
const { trangThaiRequest } = require('../constant');
import { createSignatureImg, getSignature } from './redux';
import RevokeModal from './components/RevokeModal';
class CreateModal extends AdminModal {

    onShow = () => {
        this.lyDo.value('');
        this.setState({ isLoading: false });
    }

    onSubmit = () => {
        const data = {
            lyDo: this.lyDo.value()
        };
        if (!data.lyDo) {
            T.notify('Vui lòng nhập lý do', 'danger');
            this.lyDo.focus();
        } else {
            this.setState({ isLoading: true }, () => {
                this.props.create(data, () => {
                    this.props.reload();
                    this.hide();
                }, () => this.setState({ isLoading: false }));
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo yêu cầu mới',
            size: 'small',
            body: <div className='row'>
                <FormTextBox ref={e => this.lyDo = e} label='Lý do' className='col-md-12' />
            </div>
        });
    }
}

class DownloadModal extends AdminModal {

    onShow = () => {
        this.setState({ isLoading: false });
        this.passphrase.value('');
        this.confirmPassphrase.value('');
    }

    onSubmit = () => {
        const data = {
            passphrase: this.passphrase.value()
        };
        if (!data.passphrase) {
            T.notify('Vui lòng nhập lý do', 'danger');
            this.passphrase.focus();
        } else if (data.passphrase.length < 8) {
            T.notify('Mật khẩu phải có ít nhất 8 ký tự', 'danger');
            this.passphrase.focus();
        } else if (this.confirmPassphrase.value() != data.passphrase) {
            T.notify('Mật khẩu xác thực không khớp', 'danger');
            this.confirmPassphrase.focus();
        } else {
            this.setState({ isLoading: true }, () => {
                this.props.download(data, () => this.hide());
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo yêu cầu mới',
            size: 'large',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <div className='col-md-12 form-group' style={{ color: 'red', padding: 20 }}>
                    *Lưu ý: Mật khẩu này không thể thay đổi đối với mỗi chữ ký và sẽ được yêu cầu mỗi khi cài đặt chữ ký trên thiết bị
                </div>
                <FormTextBox className='col-md-12' ref={e => this.passphrase = e} label='Mật khẩu' type='password' />
                <FormTextBox className='col-md-12' ref={e => this.confirmPassphrase = e} label='Xác thực mật khẩu' type='password' />
            </div>
        });
    }
}

export class UserYeuCauTaoKhoa extends AdminPage {
    state = { key: null }

    reloadPage = () => {
        this.props.getUserRequest(0, 100);
        this.props.getKey();
        this.props.getSignature();
    }

    componentDidMount() {
        T.ready(this.pageConfig.ready, () => {
            this.props.getUserRequest(0, 100);
            this.props.getKey();
            this.props.getSignature();
        });
    }

    renderKey = () => renderTable({
        getDataSource: () => {
            const key = this.props.hcthYeuCauTaoKhoa?.key;
            if (key) {
                return key.yeuCau ? [key] : [];
            }
            return key;
        },
        loadingOverlay: false,
        emptyTable: 'Chưa có yêu cầu tạo khoá',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày duyệt</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Duyệt bởi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>,
        renderRow: ({ yeuCau, khoa }) => {
            return <tr key={khoa.id}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={yeuCau.ngayCapNhat && T.dateToText(new Date(yeuCau.ngayCapNhat), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={yeuCau.shccCanBoCapNhat ? `${yeuCau.shccCanBoCapNhat}: ` + `${yeuCau.hoCanBoCapNhat} ${yeuCau.tenCanBoCapNhat}`.trim().normalizedName() : ''} />
                <TableCell type='checkbox' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={khoa.kichHoat} onChange={() => this.onDisableKey(khoa)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' >
                    {/* {!khoa.cerfiticate && <button className='btn btn-success' onClick={() => this.downloadModal.show()}>
                        <i className='fa fa-lg fa-download' />
                    </button>} */}
                    {khoa.cerfiticate && khoa.kichHoat && <button className='btn btn-danger' onClick={() => this.onDisableKey(khoa)}>
                        <i className='fa fa-lg fa-times' />
                    </button>}
                </TableCell>
            </tr>;
        }
    })

    onDisableKey = () => {
        this.revokeModal.show();
    }

    renderTable = () => renderTable({
        getDataSource: () => this.props.hcthYeuCauTaoKhoa?.userPage?.list,
        loadingOverlay: false,
        emptyTable: 'Chưa có yêu cầu tạo khoá',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Lý do</th>
            {/* <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Người yêu cầu</th> */}
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày yêu cầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày cập nhật</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
            {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th> */}
        </tr>,
        renderRow: (item, index) => {
            return <tr key={item.id}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.R || index} />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.shcc}: ` + `${item.ho} ${item.ten}`.trim().normalizedName()} /> */}
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lyDo} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayTao && T.dateToText(new Date(item.ngayTao), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayCapNhat && T.dateToText(new Date(item.ngayCapNhat), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.trangThai ? trangThaiRequest[item.trangThai]?.text : ''} />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={''} /> */}
            </tr>;
        }
    });

    renderSignatureTable = () => renderTable({
        getDataSource: () => {
            const signature = this.props.hcthYeuCauTaoKhoa?.signature;
            if (signature) return [signature];
            else return [];
        },
        loadingOverlay: false,
        emptyTable: 'Chưa có chữ ký',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Chữ ký</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày tạo</th>
            {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th> */}
        </tr>,
        renderRow: (item, index) => {
            return <tr key={item.id}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.R || index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                    <a href={`/api/hcth/chu-ky/download?shcc=${this.props.system.user.shcc}&rawImage=1`} download={`${item.shcc}.png`}>{item.shcc}.png</a>
                </>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayTao && T.dateToText(new Date(item.ngayTao), 'HH:MM dd/mm/yyyy')} />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={<></>} /> */}
            </tr>;
        }
    });

    pageConfig = {
        title: 'Chữ ký',
        ready: '/user',
        icon: 'fa fa-key'
    }

    onDownloadKey = (data, done) => {
        this.props.downloadKey(data, () => {
            this.props.getKey(done);
        });
    }

    onShowDrawModal = () => {
        this.drawSignatureModal.show();
    }

    render() {
        const permissions = this.getCurrentPermissions();
        const buttons = [];

        buttons.push({ className: 'btn-success', icon: 'fa-pencil', onClick: this.onShowDrawModal });

        return this.renderPage({
            title: this.pageConfig.title,
            icon: this.pageConfig.icon,
            content: <>
                <div className='tile row'>
                    <h3 className='tile-header'>Chứng thư của bạn</h3>
                    <div className='col-md-12'>
                        {this.renderKey()}
                    </div>
                </div>
                <div className='tile row'>
                    <h3 className='tile-header'>Chữ ký của bạn (hình ảnh)</h3>
                    <div className='tile-body col-md-12'>
                        {this.renderSignatureTable({})}
                    </div>
                </div>
                <div className='tile row'>
                    <h3 className='tile-header'>Lịch sử yêu cầu tạo chữ ký</h3>
                    <div className='tile-body col-md-12'>
                        {this.renderTable({})}
                    </div>
                </div>
                <CreateModal ref={e => this.modal = e} create={this.props.createRequest} reload={this.reloadPage} />
                <DownloadModal ref={e => this.downloadModal = e} download={(data, done) => this.onDownloadKey(data, done)} />
                <DrawSignatureModal ref={e => this.drawSignatureModal = e} {...this.props} shcc={this.props?.system?.user?.shcc} />
                <RevokeModal ref={e => this.revokeModal = e} />
            </>,
            onCreate: permissions.some(item => ['rectors:login', 'persident:login', 'manager:write', 'hcthMocDo:write', 'hcthSignature:write'].includes(item)) ? () => this.modal.show() : null,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthYeuCauTaoKhoa: state.hcth.hcthYeuCauTaoKhoa, hcthChuKy: state.hcth.hcthChuKy });
const mapActionsToProps = { createRequest, getUserRequest, getKey, downloadKey, createSignatureImg, getSignature };
export default connect(mapStateToProps, mapActionsToProps)(UserYeuCauTaoKhoa);