import React from 'react';
import { connect } from 'react-redux';
import { getAllSdhLoaiMonThi, getSdhLoaiMonThi, updateSdhLoaiMonThi, deleteSdhLoaiMonThi, createSdhLoaiMonThi } from './redux';
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
        let { ma = '', loaiMonThi = '', kichHoat } = item ? item : { ma: '', loaiMonThi: '', kichHoat: 1 };
        this.setState({ ma });
        this.ma.value(ma);
        this.loaiMonThi.value(loaiMonThi);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            loaiMonThi: getValue(this.loaiMonThi),
            kichHoat: Number(getValue(this.kichHoat))
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật' : 'Tạo mới',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma} required />
                <FormTextBox type='text' className='col-12' ref={e => this.loaiMonThi = e} label='Loại môn thi' readOnly={readOnly} required />
                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                </div>
            </div>
        }
        );
    };
}

class SdhLoaiMonThiPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhLoaiMonThi();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (item) => {
        T.confirm('Xóa loại môn thi', `Bạn có chắc muốn xóa loại môn thi  ${item.loaiMonThi ? `<b>${item.loaiMonThi}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhLoaiMonThi(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhLoaiMonThi');
        let list = this.props.sdhLoaiMonThi && this.props.sdhLoaiMonThi.items ? this.props.sdhLoaiMonThi.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu loại môn thi!',
            renderHead: () => (
                <tr>
                    <th style={{ width: '20%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '80%' }}>Loại môn thi</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell type='link' content={item.loaiMonThi} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateSdhLoaiMonThi(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
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
            title: 'Loại môn thi',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                <Link key={0} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Loại môn thi'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhLoaiMonThi} update={this.props.updateSdhLoaiMonThi} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhLoaiMonThi: state.sdh.sdhLoaiMonThi });
const mapActionsToProps = { getAllSdhLoaiMonThi, getSdhLoaiMonThi, updateSdhLoaiMonThi, deleteSdhLoaiMonThi, createSdhLoaiMonThi };
export default connect(mapStateToProps, mapActionsToProps)(SdhLoaiMonThiPage);