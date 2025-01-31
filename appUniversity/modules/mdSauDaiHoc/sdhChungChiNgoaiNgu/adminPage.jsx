import React from 'react';
import { connect } from 'react-redux';
import { getAllSdhChungChiNgoaiNgu, getSdhChungChiNgoaiNgu, updateSdhChungChiNgoaiNgu, deleteSdhChungChiNgoaiNgu, createSdhChungChiNgoaiNgu } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue, FormSelect } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { SelectAdapter_SdhLoaiChungChiNgoaiNgu } from '../sdhLoaiChungChiNgoaiNgu/redux';
class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.ma.focus();
        });

    }
    onShow = (item) => {
        let { ma, loaiChungChi, trinhDo, kichHoat } = item ? item : { ma: '', loaiChungChi: '', trinhDo: '', kichHoat: 1 };
        this.setState({ ma });
        this.ma.value(ma);
        this.loaiChungChi.value(loaiChungChi);
        this.trinhDo.value(trinhDo);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            loaiChungChi: getValue(this.loaiChungChi),
            kichHoat: Number(getValue(this.kichHoat)),
            trinhDo: getValue(this.trinhDo)
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật chứng chỉ ngoại ngữ' : 'Tạo mới chứng chỉ ngoại ngữ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma} required />
                {this.state.ma ?
                    <FormTextBox type='text' className='col-12' ref={e => this.loaiChungChi = e} label='Loại chứng chỉ' readOnly required /> :
                    <FormSelect className='col-12' ref={e => this.loaiChungChi = e} readOnly={readOnly} data={SelectAdapter_SdhLoaiChungChiNgoaiNgu} required label='Loại chứng chỉ' />
                }
                <FormTextBox type='text' className='col-12' ref={e => this.trinhDo = e} label='Trình độ' readOnly={readOnly} required />
                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                </div>
            </div>
        }
        );
    };
}

class SdhChungChiNgoaiNguPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhChungChiNgoaiNgu();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (item) => {
        T.confirm('Xóa chứng chỉ ngoại ngữ', `Bạn có chắc muốn xóa chứng chỉ ngoại ngữ  ${item.loaiChungChi ? `<b>${item.loaiChungChi} : ${item.trinhDo}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhChungChiNgoaiNgu(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhChungChiNgoaiNgu');
        let list = this.props.sdhChungChiNgoaiNgu && this.props.sdhChungChiNgoaiNgu.items ? this.props.sdhChungChiNgoaiNgu.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu Chứng chỉ ngoại ngữ!',
            renderHead: () => (
                <tr>
                    <th style={{ width: '20%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '40%' }}>Loại chứng chỉ</th>
                    <th style={{ width: '40%' }}>Trình độ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell type='link' content={item.loaiChungChi} onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={item.trinhDo} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateSdhChungChiNgoaiNgu(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
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
            title: 'Chứng chỉ ngoại ngữ',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                'Chứng chỉ ngoại ngữ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhChungChiNgoaiNgu} update={this.props.updateSdhChungChiNgoaiNgu} />
            </>,
            backRoute: '/user/sau-dai-hoc/',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhChungChiNgoaiNgu: state.sdh.sdhChungChiNgoaiNgu });
const mapActionsToProps = { getAllSdhChungChiNgoaiNgu, getSdhChungChiNgoaiNgu, updateSdhChungChiNgoaiNgu, deleteSdhChungChiNgoaiNgu, createSdhChungChiNgoaiNgu };
export default connect(mapStateToProps, mapActionsToProps)(SdhChungChiNgoaiNguPage);