import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderDataTable, AdminModal, FormTextBox, getValue } from 'view/component/AdminPage';
import { getDtDmHinhThucThiAll, createDtDmHinhThucThi, updateDtDmHinhThucThi, deleteDtDmHinhThucThi } from './redux';
class EditModal extends AdminModal {
    componentDidMount() {
    }
    onShow = (item) => {
        let { ma, ten } = item ? item : { ma: '', ten: '' };
        this.setState({ ma, ten, item }, () => {
            this.ma.value(ma);
            this.ten.value(ten);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
        };
        this.state.ma != '' ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ten ? 'Cập nhật hình thức thi' : 'Tạo mới hình thức thi',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã hình thức thi' readOnly={this.state.ten ? true : false} placeholder='Mã' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên hình thức thi' readOnly={readOnly} placeholder='Tên' required />
            </div>
        }
        );
    };
}

class DtDmHinhThucThiPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtDmHinhThucThiAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const permission = this.getUserPermission('dtDmHinhThucThi');
        let list = this.props.dtDmHinhThucThi && this.props.dtDmHinhThucThi.items ? this.props.dtDmHinhThucThi.items : [];
        const table = renderDataTable({
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 12 ? true : false,
            emptyTable: 'Chưa có dữ liệu Hình thức thi!',
            renderHead: () => (
                <tr>
                    <th style={{ width: '20%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '80%', textAlign: 'center' }}>Tên</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.ten} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateDtDmHinhThucThi(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Hình thức thi',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Hình thức thi'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtDmHinhThucThi} update={this.props.updateDtDmHinhThucThi} />
            </>,
            backRoute: '/user/dao-tao/data-dictionary',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmHinhThucThi: state.daoTao.dtDmHinhThucThi });
const mapActionsToProps = {
    getDtDmHinhThucThiAll, createDtDmHinhThucThi, updateDtDmHinhThucThi, deleteDtDmHinhThucThi
};
export default connect(mapStateToProps, mapActionsToProps)(DtDmHinhThucThiPage);
