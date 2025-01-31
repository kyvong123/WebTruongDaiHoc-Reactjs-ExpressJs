import React from 'react';
import { connect } from 'react-redux';
import { getAllSdhLoaiChungChiNgoaiNgu, getSdhLoaiChungChiNgoaiNgu, updateSdhLoaiChungChiNgoaiNgu, deleteSdhLoaiChungChiNgoaiNgu, createSdhLoaiChungChiNgoaiNgu } from './redux';
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
        let { ma, ngonNgu, loaiChungChi, kichHoat } = item ? item : { ma: '', ngonNgu: '', loaiChungChi: '', kichHoat: 1 };
        this.setState({ ma });
        this.ma.value(ma);
        this.ngonNgu.value(ngonNgu);
        this.loaiChungChi.value(loaiChungChi);
        this.kichHoat.value(kichHoat);

    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ngonNgu: getValue(this.ngonNgu),
            kichHoat: Number(getValue(this.kichHoat)),
            loaiChungChi: getValue(this.loaiChungChi),

        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật loại chứng chỉ/văn bằng ngoại ngữ' : 'Tạo mới chứng chỉ/văn bằng ngoại ngữ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' style={{ marginTop: this.state.ma ? '35px' : '' }} className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ngonNgu = e} label='Ngôn ngữ' readOnly={readOnly} />
                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                </div>
                <FormTextBox type='text' className='col-12' ref={e => this.loaiChungChi = e} label='Loại chứng chỉ' readOnly={readOnly} />

            </div>
        }
        );
    };
}

class SdhLoaiChungChiNgoaiNguPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhLoaiChungChiNgoaiNgu();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (item) => {
        T.confirm('Xóa chứng chỉ/văn bằng ngoại ngữ', `Bạn có chắc muốn xóa chứng chỉ/văn bằng ngoại ngữ  ${item.loaiChungChi ? `<b>${item.loaiChungChi}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhLoaiChungChiNgoaiNgu(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhLoaiChungChiNgoaiNgu');
        let list = this.props.sdhLoaiChungChiNgoaiNgu && this.props.sdhLoaiChungChiNgoaiNgu.items ? this.props.sdhLoaiChungChiNgoaiNgu.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu chứng chỉ/văn bằng ngoại ngữ!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '50%' }}>Loại chứng chỉ/văn bằng</th>
                    <th style={{ width: '50%' }}>Ngôn ngữ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>

                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={item.ma} />
                    <TableCell type='link' content={item.loaiChungChi} onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.ngonNgu} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateSdhLoaiChungChiNgoaiNgu(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
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
            title: 'Loại chứng chỉ ngoại ngữ',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                'Loại chứng chỉ ngoại ngữ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhLoaiChungChiNgoaiNgu} update={this.props.updateSdhLoaiChungChiNgoaiNgu} />
            </>,
            backRoute: '/user/sau-dai-hoc/',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhLoaiChungChiNgoaiNgu: state.sdh.sdhLoaiChungChiNgoaiNgu });
const mapActionsToProps = { getAllSdhLoaiChungChiNgoaiNgu, getSdhLoaiChungChiNgoaiNgu, updateSdhLoaiChungChiNgoaiNgu, deleteSdhLoaiChungChiNgoaiNgu, createSdhLoaiChungChiNgoaiNgu };
export default connect(mapStateToProps, mapActionsToProps)(SdhLoaiChungChiNgoaiNguPage);