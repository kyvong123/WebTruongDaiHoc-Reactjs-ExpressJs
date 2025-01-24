import React from 'react';
import { connect } from 'react-redux';
import { getAllSdhMonThiTuyenSinh, getSdhMonThiTuyenSinh, updateSdhMonThiTuyenSinh, deleteSdhMonThiTuyenSinh, createSdhMonThiTuyenSinh } from './redux';
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
        let { ma, ten, tenTiengAnh, kichHoat, isNgoaiNgu } = item ? item : { ma: '', ten: '', tenTiengAnh: '', kichHoat: 1, isNgoaiNgu: 0 };
        this.setState({ ma });
        this.ma.value(ma);
        this.tenTv.value(ten);
        this.tenTa.value(tenTiengAnh);
        this.isNgoaiNgu.value(isNgoaiNgu);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.tenTv),
            tenTiengAnh: getValue(this.tenTa),
            isNgoaiNgu: getValue(this.isNgoaiNgu) ? 1 : 0,
            kichHoat: getValue(this.kichHoat) ? 1 : 0
        };
        if (this.state.ma) {
            T.confirm('Lưu thay đổi', 'Xác nhận thay đổi dữ liệu?', 'warning', true, isConfirm => {
                isConfirm && this.props.update(this.state.ma, changes, this.hide);
            });
        } else this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật môn thi' : 'Tạo mới môn thi',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={true} required />
                <FormTextBox type='text' className='col-12' ref={e => this.tenTv = e} label='Tên tiếng Việt' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12' ref={e => this.tenTa = e} label='Tên tiếng Anh' readOnly={readOnly} />
                <FormCheckbox className='col-12' ref={e => this.isNgoaiNgu = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                {/* <FormSelect ref={e => this.loaiMonThi = e} label='Loại tổ hợp' className='col-md-6' readOnly={readOnly} data={SelectAdapter_SdhLoaiMonThi} required /> */}
                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                </div>
            </div>
        }
        );
    };
}

class SdhMonThiTuyenSinhPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhMonThiTuyenSinh();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (item) => {
        T.confirm('Xóa môn thi', `Xoá môn thi có thể xoá mất dữ liệu đợt đang xử lý, xác nhận xóa môn thi <b> ${item.ma} - ${item.ten}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSdhMonThiTuyenSinh(item.ma);

        });
    }

    render() {
        const permission = this.getUserPermission('sdhMonThiTuyenSinh');
        let list = this.props.sdhMonThiTuyenSinh && this.props.sdhMonThiTuyenSinh.items ? this.props.sdhMonThiTuyenSinh.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu môn thi!',
            renderHead: () => (
                <tr>
                    <th style={{ width: '20%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '40%' }}>Tên môn thi</th>
                    <th style={{ width: '40%' }}>Tên tiếng Anh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngoại ngữ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' style={{ textAlign: 'center' }} content={item.ma} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.ten} />
                    <TableCell content={item.tenTiengAnh} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateSdhMonThiTuyenSinh(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                    <TableCell type='checkbox' content={item.isNgoaiNgu} permission={permission}
                        onChanged={() => this.props.updateSdhMonThiTuyenSinh(item.ma, { isNgoaiNgu: item.isNgoaiNgu == 1 ? 0 : 1 })} />
                    <TableCell type='buttons' content={item} permission={permission} style={{ textAlign: 'left' }} >
                        <Tooltip title='Điều chỉnh' arrow>
                            <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.modal.show(item)}>
                                <i className='fa fa-lg fa-pencil-square-o' />
                            </button>
                        </Tooltip>
                        {/* Xét hồ sơ, vấn đáp => Môn đặc biệt fixed ko xoá */}
                        {item.ma == 'XHS' || item.ma == 'VD' ? null :
                            <Tooltip title='Xóa' arrow>
                                <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.delete(item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>}
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Môn thi tuyển sinh',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Môn thi tuyển sinh'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhMonThiTuyenSinh} update={this.props.updateSdhMonThiTuyenSinh} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
            onImport: e => permission.write ? e.preventDefault() || this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/mon-thi-tuyen-sinh/upload') : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhMonThiTuyenSinh: state.sdh.sdhMonThiTuyenSinh });
const mapActionsToProps = { getAllSdhMonThiTuyenSinh, getSdhMonThiTuyenSinh, updateSdhMonThiTuyenSinh, deleteSdhMonThiTuyenSinh, createSdhMonThiTuyenSinh };
export default connect(mapStateToProps, mapActionsToProps)(SdhMonThiTuyenSinhPage);