import React from 'react';
import { connect } from 'react-redux';
import { getSdhDiemDacBietAll, createSdhDiemDacBiet, updateSdhDiemDacBiet } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: 1 };
        this.setState({ ma });
        this.ma.value(ma);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            moTa: getValue(this.moTa),
            kichHoat: Number(this.kichHoat.value()),
        };
        this.state.ma ? this.props.update(changes, this.hide) : this.props.create(changes, this.hide);
    }

    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật điểm đặc biệt' : 'Tạo mới điểm đặc biệt',
            body: <div className='row'>
                <FormTextBox ref={e => this.ma = e} label='Mã' className='col-md-8' required readOnly={this.state.ma} />
                <FormCheckbox ref={e => this.kichHoat = e} isSwitch={true} label='Kích hoạt' className='col-md-4' onChanged={value => this.changeKichHoat(value)} />
                <FormTextBox ref={e => this.moTa = e} label='Mô tả' className='col-md-12' required />
            </div>
        });
    }
}

class SdhDiemPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhDiemDacBietAll();
        });
    }

    render() {
        const permission = this.getUserPermission('sdhDiemDacBiet');
        let items = this.props.sdhDiemDacBiet ? this.props.sdhDiemDacBiet.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '70%' }}>Mô tả</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tính tổng kết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell content={item.moTa} />
                    <TableCell type='checkbox' content={item.tinhTongKet} permission={permission}
                        onChanged={value => this.props.updateSdhDiemDacBiet({ ma: item.ma, tinhTongKet: value ? 1 : 0 })} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateSdhDiemDacBiet({ ma: item.ma, kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={(e) => e && e.preventDefault() || this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách điểm đặc biệt',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/quan-ly-diem'>Điểm</Link>,
                'Điểm đặc biệt'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createSdhDiemDacBiet} update={this.props.updateSdhDiemDacBiet} />
            </>,
            backRoute: '/user/sau-dai-hoc/quan-ly-diem',
            onCreate: permission && permission.write ? (e) => e && e.preventDefault() || this.modal.show() : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDiemDacBiet: state.sdh.sdhDiemDacBiet });
const mapActionsToProps = { getSdhDiemDacBietAll, createSdhDiemDacBiet, updateSdhDiemDacBiet };
export default connect(mapStateToProps, mapActionsToProps)(SdhDiemPage);