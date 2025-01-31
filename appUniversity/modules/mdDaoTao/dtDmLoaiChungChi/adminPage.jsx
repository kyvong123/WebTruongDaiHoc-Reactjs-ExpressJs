import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDtDmLoaiChungChiAll, createDtDmLoaiChungChi, updateDtDmLoaiChungChi } from './redux';
import { AdminPage, AdminModal, TableCell, renderDataTable, FormTextBox, getValue, FormCheckbox } from 'view/component/AdminPage';
class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.ma.focus();
        });
    }
    onShow = (item) => {
        let { ma, ten, kichHoat, isXetTotNghiep } = item ? item : { ma: '', ten: '', kichHoat: 0, isXetTotNghiep: 0 };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.isXetTotNghiep.value(isXetTotNghiep);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            kichHoat: Number(getValue(this.kichHoat)),
            isXetTotNghiep: Number(getValue(this.isXetTotNghiep)),
        };

        this.state.ma ? this.props.update(this.state.ma, changes, () => this.props.get() || this.hide()) : this.props.create(changes, () => this.props.get() || this.hide());
    };

    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật loại chứng chỉ' : 'Tạo mới loại chứng chỉ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-6' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : false} required />
                <FormTextBox type='text' className='col-6' ref={e => this.ten = e} label='Loại chứng chỉ' required />
                <FormCheckbox className='col-2' ref={e => this.kichHoat = e} isSwitch label='Kích hoạt' required />
                <FormCheckbox className='col-2' ref={e => this.isXetTotNghiep = e} isSwitch label='Xét tốt nghiệp' required />
            </div>
        });
    };
}

class DtDmLoaiChungChiPage extends AdminPage {
    componentDidMount() {
        T.showSearchBox();
        this.props.getDtDmLoaiChungChiAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDtDmLoaiChungChi(item.ma, { kichHoat: Number(!item.kichHoat) }, this.props.getDtDmLoaiChungChiAll);

    changeTotNghiep = item => this.props.updateDtDmLoaiChungChi(item.ma, { isXetTotNghiep: Number(!item.isXetTotNghiep) }, this.props.getDtDmLoaiChungChiAll);

    render() {
        const permission = this.getUserPermission('dtDmLoaiChungChi', ['manage', 'write', 'delete']);
        let items = this.props.dtDmLoaiChungChi ? this.props.dtDmLoaiChungChi.items : [];
        const table = renderDataTable({
            data: items,
            header: 'thead-light',
            stickyHead: items && items.length > 10 ? true : false,
            emptyTable: 'Chưa có loại chứng chỉ',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại chứng chỉ</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Xét tốt nghiệp</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell content={item.ten} />
                    <TableCell content={item.kichHoat} type='checkbox' permission={permission}
                        onChanged={() => this.changeActive(item)} />
                    <TableCell content={item.isXetTotNghiep} type='checkbox' permission={permission}
                        onChanged={() => this.changeTotNghiep(item)} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách loại chứng chỉ khác',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/certificate-management'>Quản lý chứng chỉ</Link>,
                'Loại chứng chỉ khác'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} get={this.props.getDtDmLoaiChungChiAll} create={this.props.createDtDmLoaiChungChi} update={this.props.updateDtDmLoaiChungChi} />
            </>,
            backRoute: '/user/dao-tao/certificate-management',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmLoaiChungChi: state.daoTao.dtDmLoaiChungChi });
const mapActionsToProps = { getDtDmLoaiChungChiAll, createDtDmLoaiChungChi, updateDtDmLoaiChungChi };
export default connect(mapStateToProps, mapActionsToProps)(DtDmLoaiChungChiPage);