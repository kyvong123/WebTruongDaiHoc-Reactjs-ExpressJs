import React from 'react';
import { connect } from 'react-redux';
import { getSdhDiemDmXepLoaiAll, createSdhDiemDmXepLoai, updateSdhDiemDmXepLoai } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { id, ten, kichHoat } = item ? item : { id: '', ten: '', kichHoat: 1 };
        this.setState({ id });
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            kichHoat: Number(this.kichHoat.value()),
        };
        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật xếp loại điểm' : 'Tạo mới xếp loại điểm',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.ten = e} label='Tên' className='col-md-9' required />
                <FormCheckbox ref={e => this.kichHoat = e} style={{ marginTop: '35px' }} isSwitch={true} label='Kích hoạt' className='col-md-3' onChanged={value => this.changeKichHoat(value)} />
            </div>
        });
    }
}

class SdhDiemDmXepLoaiPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhDiemDmXepLoaiAll();
        });
    }

    delete = (item) => {
        T.confirm('Xóa xếp loại điểm', `Bạn có chắc muốn xóa xếp loại ${item.ten ? `<b> ${item.ten}<b/>` : 'này ?'}`, true, isConfirm =>
            isConfirm && this.props.deleteSdhDiemDmXepLoai(item.id));
    }
    render() {
        const permission = this.getUserPermission('sdhDiemXepLoai');
        let items = this.props.sdhDiemXepLoai ? this.props.sdhDiemXepLoai.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.ten} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateSdhDiemDmXepLoai(item.id, { kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={(e) => e && e.preventDefault() || this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Xếp loại điểm',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/quan-ly-diem'>Điểm</Link>,
                'Xếp loại điểm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createSdhDiemDmXepLoai} update={this.props.updateSdhDiemDmXepLoai} />
            </>,
            backRoute: '/user/sau-dai-hoc/quan-ly-diem',
            onCreate: permission && permission.write ? (e) => e && e.preventDefault() || this.modal.show() : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDiemXepLoai: state.sdh.sdhDiemXepLoai });
const mapActionsToProps = { getSdhDiemDmXepLoaiAll, createSdhDiemDmXepLoai, updateSdhDiemDmXepLoai };
export default connect(mapStateToProps, mapActionsToProps)(SdhDiemDmXepLoaiPage);