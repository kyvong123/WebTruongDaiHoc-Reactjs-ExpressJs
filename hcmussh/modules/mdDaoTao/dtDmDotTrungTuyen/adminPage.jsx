import React from 'react';
import { connect } from 'react-redux';
import { getDtDmDotTrungTuyenAll, deleteDtDmDotTrungTuyen, createDtDmDotTrungTuyen, updateDtDmDotTrungTuyen } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderDataTable, AdminModal, FormTextBox, getValue } from 'view/component/AdminPage';
class EditModal extends AdminModal {
    componentDidMount() {
    }
    onShow = (item) => {
        let { ma, ten } = item ? item : { ma: '', ten: '' };
        this.setState({ ma, ten, item });
        this.ma.value(ma);
        this.ten.value(ten);
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
            title: this.state.ten ? 'Cập nhật đợt trúng tuyển' : 'Tạo mới đợt trúng tuyển',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã đợt' readOnly={this.state.ten ? true : false} placeholder='Mã' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên đợt' readOnly={readOnly} placeholder='Tên' required />
            </div>
        }
        );
    };
}

class DtDmDotTrungTuyenPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtDmDotTrungTuyenAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const permission = this.getUserPermission('dtDmDotTrungTuyen');
        let list = this.props.dtDmDotTrungTuyen && this.props.dtDmDotTrungTuyen.items ? this.props.dtDmDotTrungTuyen.items : [];
        const table = renderDataTable({
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 12 ? true : false,
            emptyTable: 'Chưa có dữ liệu Đợt trúng tuyển!',
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
                        onChanged={() => this.props.updateDtDmDotTrungTuyen(item.id, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Đợt trúng tuyển',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Đợt trúng tuyển'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtDmDotTrungTuyen} update={this.props.updateDtDmDotTrungTuyen} />
            </>,
            backRoute: '/user/dao-tao/data-dictionary',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }


}

const mapStateToProps = state => ({ system: state.system, dtDmDotTrungTuyen: state.daoTao.dtDmDotTrungTuyen });
const mapActionsToProps = { getDtDmDotTrungTuyenAll, deleteDtDmDotTrungTuyen, createDtDmDotTrungTuyen, updateDtDmDotTrungTuyen };
export default connect(mapStateToProps, mapActionsToProps)(DtDmDotTrungTuyenPage);
