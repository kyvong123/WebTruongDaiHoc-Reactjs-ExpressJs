import React from 'react';
import { connect } from 'react-redux';
import { getSdhDmLoaiDiemAll, createSdhDmLoaiDiem, updateSdhDmLoaiDiem, deleteSdhDmLoaiDiem } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, getValue, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });

    }
    onShow = (item) => {
        let { ma, ten, isThi, kichHoat } = item ? item : { ma: '', ten: '', isThi: '', kichHoat: '' };
        this.setState({ ma });
        this.ma.value(ma);
        this.ten.value(ten);
        this.isThi.value(isThi ? 1 : 0);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            isThi: Number(this.isThi.value()),
            kichHoat: Number(this.kichHoat.value()),
            timeModified: Date.now()
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);

    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật loại điểm' : 'Tạo mới loại điểm',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-6' ref={e => this.ma = e} label='Mã' readOnly={readOnly} required />
                <FormCheckbox ref={e => this.kichHoat = e} isSwitch={true} label='Kích hoạt' className='col-md-4' onChanged={value => this.kichHoat.value(Number(value))} />
                <FormCheckbox ref={e => this.isThi = e} label='Thi' className='col-md-2' onChanged={value => this.isThi.value(Number(value))} />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />

            </div>
        }
        );
    };
}

class SdhDmLoaiDiemPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhDmLoaiDiemAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa loại điểm', `Bạn có chắc bạn muốn xóa loại điểm ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhDmLoaiDiem(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhDmLoaiDiem');
        let list = this.props.sdhDmLoaiDiem && this.props.sdhDmLoaiDiem.items ? this.props.sdhDmLoaiDiem.items : null;
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu loại điểm!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%' }}>Mã</th>
                    <th style={{ width: '70%' }}>Tên</th>
                    <th style={{ width: 'auto' }}>Thi</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.ma} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.isThi ? <i className='fa fa-fw fa-lg fa-check' /> : ''} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={{ write: true }}
                        onChanged={value => this.props.updateSdhDmLoaiDiem(item.ma, { kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={(e) => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Loại điểm',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/quan-ly-diem'>Điểm</Link>,
                'Loại điểm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhDmLoaiDiem} update={this.props.updateSdhDmLoaiDiem} />
            </>,
            backRoute: '/user/sau-dai-hoc/quan-ly-diem',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhDmLoaiDiem: state.sdh.sdhDmLoaiDiem });
const mapActionsToProps = { getSdhDmLoaiDiemAll, createSdhDmLoaiDiem, updateSdhDmLoaiDiem, deleteSdhDmLoaiDiem };
export default connect(mapStateToProps, mapActionsToProps)(SdhDmLoaiDiemPage);