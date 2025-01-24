import React from 'react';
import { connect } from 'react-redux';
import { getDtDmLoaiDiemAll, updateDtDmLoaiDiem, createDtDmLoaiDiem } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { ma, ten, isThi, kichHoat, priority } = item ? item : { ma: '', ten: '', isThi: 1, kichHoat: 1, priority: '' };
        this.setState({ ma });

        this.ma.value(ma);
        this.ten.value(ten);
        this.isThi.value(isThi ? 1 : 0);
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.priority.value(priority || '');
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            isThi: Number(this.isThi.value()),
            kichHoat: Number(this.kichHoat.value()),
            priority: this.priority.value(),
        };
        this.state.ma ? this.props.update(changes, this.hide) : this.props.create(changes, this.hide);
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật loại điểm' : 'Tạo mới lọai điểm',
            body: <div className='row'>
                <FormTextBox ref={e => this.ma = e} label='Mã' className='col-md-6' required readOnly={this.state.ma} />
                <FormCheckbox ref={e => this.kichHoat = e} isSwitch={true} label='Kích hoạt' className='col-md-4' onChanged={value => this.kichHoat.value(Number(value))} />
                <FormCheckbox ref={e => this.isThi = e} label='Thi' className='col-md-2' onChanged={value => this.isThi.value(Number(value))} />
                <FormTextBox ref={e => this.ten = e} label='Tên' className='col-md-12' required />
                <FormTextBox type='number' ref={e => this.priority = e} label='Độ ưu tiên' className='col-md-12' required allowNegative={false} min={1} />
            </div>
        });
    }
}

class DtDiemPage extends AdminPage {
    componentDidMount() {
        this.props.getDtDmLoaiDiemAll();
    }

    render() {
        let items = this.props.loaiDiem ? this.props.loaiDiem.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '70%' }}>Tên</th>
                    <th style={{ width: 'auto' }}>Thi</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Độ ưu tiên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell content={item.ten} />
                    <TableCell content={item.isThi ? <i className='fa fa-fw fa-lg fa-check' /> : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.priority} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={{ write: true }}
                        onChanged={value => this.props.updateDtDmLoaiDiem({ ma: item.ma, kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' content={item} permission={{ write: true }}
                        onEdit={(e) => e && e.preventDefault() || this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách loại điểm',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Cấu hình điểm</Link>,
                'Loại điểm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e}
                    create={this.props.createDtDmLoaiDiem} update={this.props.updateDtDmLoaiDiem} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            onCreate: e => e && e.preventDefault() || this.modal.show(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, loaiDiem: state.daoTao.loaiDiem });
const mapActionsToProps = { getDtDmLoaiDiemAll, updateDtDmLoaiDiem, createDtDmLoaiDiem };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemPage);