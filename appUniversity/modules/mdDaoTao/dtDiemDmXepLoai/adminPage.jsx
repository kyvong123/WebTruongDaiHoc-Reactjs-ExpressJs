import React from 'react';
import { connect } from 'react-redux';
import { getDtDmXepLoaiAll, updateDtDmXepLoai, createDtDmXepLoai } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { id, ten, kichHoat } = item ? item : { id: '', ten: '', kichHoat: 1 };
        this.setState({ id });

        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

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
            title: this.state.id ? 'Cập nhật điểm xếp loại' : 'Tạo mới điểm xếp loại',
            body: <div className='row'>
                <FormTextBox ref={e => this.ten = e} label='Tên' className='col-md-10' required />
                <FormCheckbox ref={e => this.kichHoat = e} style={{ whiteSpace: 'nowrap', flexWrap: 'wrap' }} isSwitch={true} label='Kích hoạt' className='col-md-2' onChanged={value => this.kichHoat.value(Number(value))} />
            </div>
        });
    }
}

class DtDiemPage extends AdminPage {
    componentDidMount() {
        this.props.getDtDmXepLoaiAll();
    }

    render() {
        let items = this.props.xepLoai ? this.props.xepLoai.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: items.length > 10,
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
                    <TableCell type='checkbox' content={item.kichHoat} permission={{ write: true }}
                        onChanged={value => this.props.updateDtDmXepLoai(item.id, { kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' content={item} permission={{ write: true }}
                        onEdit={(e) => e && e.preventDefault() || this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách điểm xếp loại',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Cấu hình điểm</Link>,
                'Xếp loại'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e}
                    create={this.props.createDtDmXepLoai} update={this.props.updateDtDmXepLoai} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            onCreate: e => e && e.preventDefault() || this.modal.show(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, xepLoai: state.daoTao.xepLoai });
const mapActionsToProps = { getDtDmXepLoaiAll, updateDtDmXepLoai, createDtDmXepLoai };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemPage);