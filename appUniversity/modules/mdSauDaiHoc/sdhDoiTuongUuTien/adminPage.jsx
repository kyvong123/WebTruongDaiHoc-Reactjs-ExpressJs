import React from 'react';
import { connect } from 'react-redux';
import { getAllSdhDoiTuongUuTien, getSdhDoiTuongUuTien, updateSdhDoiTuongUuTien, deleteSdhDoiTuongUuTien, createSdhDoiTuongUuTien } from './redux';
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
        let { ma, ten, uuTien, ghiChu, kichHoat } = item ? item : { ma: '', ten: '', uuTien: '', ghiChu: '', kichHoat: 1 };
        this.setState({ ma });
        this.ma.value(ma);
        this.ten.value(ten);
        this.uuTien.value(uuTien);
        this.ghiChu.value(ghiChu);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            kichHoat: Number(getValue(this.kichHoat)),
            uuTien: getValue(this.uuTien),
            ghiChu: this.ghiChu.value()
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật đối tượng ưu tiên' : 'Tạo mới đối tượng ưu tiên',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' style={{ marginTop: this.state.ma ? '35px' : '' }} className='col-2' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma} required />
                <FormTextBox type='text' className='col-5' ref={e => this.uuTien = e} label='Ưu tiên' readOnly={readOnly} required />
                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                </div>
                <FormTextBox type='text' className='col-5' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />

            </div>
        }
        );
    };
}

class SdhDoiTuongUuTienPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhDoiTuongUuTien();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (item) => {
        T.confirm('Xóa đối tượng ưu tiên', `Bạn có chắc muốn xóa đối tượng ưu tiên  ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhDoiTuongUuTien(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhDoiTuongUuTien');
        let list = this.props.sdhDoiTuongUuTien && this.props.sdhDoiTuongUuTien.items ? this.props.sdhDoiTuongUuTien.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu đối tượng ưu tiên!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '20%' }}>Tên</th>
                    <th style={{ width: '20%' }}>Ưu tiên</th>
                    <th style={{ width: '60%' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.uuTien} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.ghiChu} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateSdhDoiTuongUuTien(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
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
            title: 'Đối tượng ưu tiên',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                'Đối tượng ưu tiên'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhDoiTuongUuTien} update={this.props.updateSdhDoiTuongUuTien} />
            </>,
            backRoute: '/user/sau-dai-hoc/',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhDoiTuongUuTien: state.sdh.sdhDoiTuongUuTien });
const mapActionsToProps = { getAllSdhDoiTuongUuTien, getSdhDoiTuongUuTien, updateSdhDoiTuongUuTien, deleteSdhDoiTuongUuTien, createSdhDoiTuongUuTien };
export default connect(mapStateToProps, mapActionsToProps)(SdhDoiTuongUuTienPage);