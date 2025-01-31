import React from 'react';
import { connect } from 'react-redux';
import { getAllSdhTsDmKyLuat, getSdhTsDmKyLuat, updateSdhTsDmKyLuat, deleteSdhTsDmKyLuat, createSdhTsDmKyLuat } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, getValue } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.ma.focus();
        });

    }
    onShow = (item) => {
        let { ma, kyLuat, mucDo } = item ? item : { ma: '', kyLuat: '', mucDo: '' };
        this.setState({ ma });
        this.ma.value(ma);
        this.kyLuat.value(kyLuat);
        this.mucDo.value(mucDo);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            kyLuat: getValue(this.kyLuat),
            mucDo: getValue(this.mucDo),
        }, { ma } = this.state, { listMa } = this.props;
        if (ma) {
            if (changes.ma == ma || !listMa.filter(item => item != ma).includes(changes.ma)) {
                this.props.update(this.state.ma, changes, this.hide);
            } else T.notify('Mã kỷ luật đã tồn tại!', 'danger');
        } else {
            !listMa.filter(item => item != ma).includes(changes.ma) ?
                this.props.create(changes, this.hide)
                : T.notify('Mã kỷ luật đã tồn tại!', 'danger');
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật hình thức kỷ luật' : 'Tạo mới hình thức kỷ luật',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} required />
                <FormTextBox className='col-12' ref={e => this.kyLuat = e} label='Kỷ luật' readOnly={readOnly} required />
                {/* Mức độ trừ điểm 0-100% (nếu có) */}
                <FormTextBox type='number' max={100} allowNegative={false} className='col-12' ref={e => this.mucDo = e} label='Mức độ (1-100)' readOnly={readOnly} />
            </div>
        }
        );
    };
}

class SdhTsDmKyLuatPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhTsDmKyLuat();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (item) => {
        T.confirm('Xóa hình thức kỷ luật', `Bạn có chắc muốn xóa hình thức  ${item.kyLuat ? `<b>${item.kyLuat}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhTsDmKyLuat(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhTsDmKyLuat');
        let list = this.props.sdhTsDmKyLuat && this.props.sdhTsDmKyLuat.items ? this.props.sdhTsDmKyLuat.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu hình thức kỷ luật!',
            renderHead: () => (
                <tr>
                    <th style={{ width: '20%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '60%' }}>Kỷ luật</th>
                    <th style={{ width: '20%' }}>Mức độ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell type='link' content={item.kyLuat} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.mucDo ? `${item.mucDo}%` : ''} />
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
            title: 'Danh mục kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Danh mục kỷ luật'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} listMa={list.map(item => item.ma)} create={this.props.createSdhTsDmKyLuat} update={this.props.updateSdhTsDmKyLuat} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhTsDmKyLuat: state.sdh.sdhTsDmKyLuat });
const mapActionsToProps = { getAllSdhTsDmKyLuat, getSdhTsDmKyLuat, updateSdhTsDmKyLuat, deleteSdhTsDmKyLuat, createSdhTsDmKyLuat };
export default connect(mapStateToProps, mapActionsToProps)(SdhTsDmKyLuatPage);