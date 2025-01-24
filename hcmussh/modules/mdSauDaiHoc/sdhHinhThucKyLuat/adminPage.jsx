import React from 'react';
import { connect } from 'react-redux';
import { getAllSdhKyLuat, getSdhKyLuat, updateSdhKyLuat, deleteSdhKyLuat, createSdhKyLuat } from './redux';
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
        let { ma, ten, ghiChu, kyLuat, kichHoat } = item ? item : { ma: '', ten: '', ghiChu: '', kyLuat: '', kichHoat: 1 };
        this.setState({ ma });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kyLuat.value(kyLuat);
        this.ghiChu.value(ghiChu);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            kyLuat: getValue(this.kyLuat),
            ghiChu: this.ghiChu.value(),
            kichHoat: Number(getValue(this.kichHoat))
        };

        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật hình thưc kỷ luật' : 'Tạo mới hình thức kỷ luật',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Hình thức kỷ luật' readOnly={readOnly} required />
                <FormTextBox type='number' className='col-12' ref={e => this.kyLuat = e} label='Mức kỷ luật' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                </div>
            </div>
        }
        );
    };
}

class SdhKyLuatPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhKyLuat();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (item) => {
        T.confirm('Xóa hình thức kỷ luật', `Bạn có chắc muốn xóa hình thức kỷ luật  ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhKyLuat(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhKyLuat');
        let list = this.props.sdhKyLuat && this.props.sdhKyLuat.items ? this.props.sdhKyLuat.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu hình thức kỷ luật!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto%' }}>Mã</th>
                    <th style={{ width: '30%' }}>Hình thức kỷ luật</th>
                    <th style={{ width: '20%' }}>Mức phạt</th>
                    <th style={{ width: '50%' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={item.ma} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.kyLuat ? item.kyLuat : ''} />
                    <TableCell content={item.ghiChu} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateSdhKyLuat(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
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
            title: 'Hình thức kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={0} to='/user/sau-dai-hoc/data-dictionary'>Từ điển dữ liệu</Link>,
                'Hình thức kỷ luật'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhKyLuat} update={this.props.updateSdhKyLuat} />
            </>,
            backRoute: '/user/sau-dai-hoc/data-dictionary',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhKyLuat: state.sdh.sdhKyLuat });
const mapActionsToProps = { getAllSdhKyLuat, getSdhKyLuat, updateSdhKyLuat, deleteSdhKyLuat, createSdhKyLuat };
export default connect(mapStateToProps, mapActionsToProps)(SdhKyLuatPage);