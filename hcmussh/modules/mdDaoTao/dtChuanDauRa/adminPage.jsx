import React from 'react';
import { connect } from 'react-redux';
import { getDtChuanDauRaAll, deleteDtChuanDauRa, createDtChuanDauRa, updateDtChuanDauRa } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue } from 'view/component/AdminPage';
class EditModal extends AdminModal {
    //Always begin with componentDidMount
    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });

    }
    onShow = (item) => {
        let { id, ten, thangDoMin, thangDoMax, moTa, kichHoat } = item ? item : { id: null, ten: '', thangDoMin: null, thangDoMax: null, moTa: '', kichHoat: true };
        this.setState({ id });
        this.ten.value(ten);
        this.thangDoMin.value(thangDoMin != null ? parseFloat(thangDoMin).toFixed(1) : '');
        this.thangDoMax.value(thangDoMax != null ? parseFloat(thangDoMax).toFixed(1) : '');
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            thangDoMin: getValue(this.thangDoMin),
            thangDoMax: getValue(this.thangDoMax),
            moTa: getValue(this.moTa),
            kichHoat: Number(getValue(this.kichHoat)),
        };

        if (changes.thangDoMax <= changes.thangDoMin) {
            T.notify('Thang đo Max phải lớn hơn Min!', 'danger');
        }
        else if (changes.thangDoMin < 0 || changes.thangDoMax > 5) {
            T.notify('Ngoài giới hạn thang đo chuẩn!', 'danger');
        }
        else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật chuẩn đầu ra' : 'Tạo mới chuẩn đầu ra',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormTextBox type='text' className='col-12' ref={e => this.thangDoMin = e} label='Thang đo Min ' readOnly={readOnly} placeholder='Thang đo Min 0-5' required />
                <FormTextBox type='text' className='col-12' ref={e => this.thangDoMax = e} label='Thang đo Max ' readOnly={readOnly} placeholder='Thang đo Max 0-5' required />
                <FormTextBox type='text' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} required />
            </div>
        }
        );
    };
}

class DtChuanDauRaPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtChuanDauRaAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa chuẩn đầu ra', `Bạn có chắc bạn muốn xóa chuẩn đầu ra ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteDtChuanDauRa(item.id);
        });
    }

    render() {
        const permission = this.getUserPermission('dtChuanDauRa');
        let list = this.props.dtChuanDauRa && this.props.dtChuanDauRa.items ? this.props.dtChuanDauRa.items : null;
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu chuẩn đầu ra!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '30%' }}>Tên</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Thang Đo Min</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Thang Đo Max</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Mô tả</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.ten} />
                    <TableCell style={{ textAlign: 'center' }} content={parseFloat(item.thangDoMin).toFixed(1)} />
                    <TableCell style={{ textAlign: 'center' }} content={parseFloat(item.thangDoMax).toFixed(1)} />
                    <TableCell content={item.moTa} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDtChuanDauRa(item.id, { kichHoat: Number(value) })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Chuẩn đầu ra',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Chuẩn đầu ra'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtChuanDauRa} update={this.props.updateDtChuanDauRa} />
            </>,
            backRoute: '/user/dao-tao/data-dictionary',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }


}

const mapStateToProps = state => ({ system: state.system, dtChuanDauRa: state.daoTao.dtChuanDauRa });
const mapActionsToProps = { getDtChuanDauRaAll, deleteDtChuanDauRa, createDtChuanDauRa, updateDtChuanDauRa };
export default connect(mapStateToProps, mapActionsToProps)(DtChuanDauRaPage);