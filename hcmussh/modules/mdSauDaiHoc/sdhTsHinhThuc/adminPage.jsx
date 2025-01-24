import React from 'react';
import { connect } from 'react-redux';
import { getAllSdhHinhThucTuyenSinh, getSdhHinhThucTuyenSinh, updateSdhHinhThucTuyenSinh, deleteSdhHinhThucTuyenSinh, createSdhHinhThucTuyenSinh } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.ma.focus();
        });

    }
    onShow = (item) => {
        let { ma, tenHinhThuc, tenVietTat, kichHoat } = item ? item : { ma: '', tenHinhThuc: '', tenVietTat, kichHoat: 1 };
        this.setState({ ma });
        this.ma.value(ma);
        this.ten.value(tenHinhThuc);
        this.kichHoat.value(kichHoat);
        this.tenVietTat.value(tenVietTat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            tenHinhThuc: getValue(this.ten),
            tenVietTat: getValue(this.tenVietTat),
            kichHoat: Number(getValue(this.kichHoat))
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật hình thức tuyển sinh' : 'Tạo mới hình thức tuyển sinh',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Hình thức tuyển sinh' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12' ref={e => this.tenVietTat = e} label='Tên viết tắt' readOnly={readOnly} required />

                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                </div>
            </div>
        }
        );
    };
}

class SdhHinhThucTuyenSinhPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhHinhThucTuyenSinh();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (item) => {
        T.confirm('Xóa hình thức tuyển sinh', `Bạn có chắc muốn xóa hình thức  ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhHinhThucTuyenSinh(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhHinhThucTuyenSinh');
        let list = this.props.sdhHinhThucTuyenSinh && this.props.sdhHinhThucTuyenSinh.items ? this.props.sdhHinhThucTuyenSinh.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu hình thức tuyển sinh!',
            renderHead: () => (
                <tr>
                    <th style={{ width: '20%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '60%' }}>Hình thức tuyển sinh</th>
                    <th style={{ width: '20%' }}>Tên viết tắt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell type='link' content={item.tenHinhThuc} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.tenVietTat} />

                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateSdhHinhThucTuyenSinh(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                    <TableCell type='buttons' content={item} permission={permission} style={{ textAlign: 'left' }} >
                        <Tooltip title='Điều chỉnh' arrow>
                            <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.modal.show(item)}>
                                <i className='fa fa-lg fa-pencil-square-o' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Xóa' arrow>
                            <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.delete(item)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Hình thức tuyển sinh',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Hình thức tuyển sinh'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhHinhThucTuyenSinh} update={this.props.updateSdhHinhThucTuyenSinh} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhHinhThucTuyenSinh: state.sdh.sdhHinhThucTuyenSinh });
const mapActionsToProps = { getAllSdhHinhThucTuyenSinh, getSdhHinhThucTuyenSinh, updateSdhHinhThucTuyenSinh, deleteSdhHinhThucTuyenSinh, createSdhHinhThucTuyenSinh };
export default connect(mapStateToProps, mapActionsToProps)(SdhHinhThucTuyenSinhPage);