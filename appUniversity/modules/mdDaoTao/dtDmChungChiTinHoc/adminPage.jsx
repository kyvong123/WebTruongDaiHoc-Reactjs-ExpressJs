import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDtDmChungChiTinHocAll, createDtDmChungChiTinHoc, updateDtDmChungChiTinHoc, deleteDtDmChungChiTinHoc } from './redux';
import { AdminPage, AdminModal, TableCell, renderDataTable, FormTextBox, FormCheckbox, getValue, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DtDmLoaiChungChi } from 'modules/mdDaoTao/dtDmLoaiChungChi/redux';
class EditModal extends AdminModal {

    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item :
            { ma: '', ten: '', kichHoat: 1 };
        this.setState({ ma, item }, () => {
            this.ma.value(ma);
            this.ten.value(ten);
            this.kichHoat.value(kichHoat);
        });
    };


    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            loaiChungChi: getValue(this.loai),
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            kichHoat: Number(getValue(this.kichHoat))
        };

        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        let readMa = readOnly;
        if (this.state.ma) readMa = true;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật chứng chỉ tin học' : 'Tạo mới chứng chỉ tin học',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-4' ref={e => this.loai = e} label='Loại chứng chỉ' data={SelectAdapter_DtDmLoaiChungChi} readOnly={readOnly} required />
                <FormTextBox className='col-4' ref={e => this.ma = e} label='Mã chứng chỉ' readOnly={readMa} required />
                <FormTextBox type='text' className='col-4' ref={e => this.ten = e} label='Tên chứng chỉ' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} required />
            </div>
        }
        );
    };
}

class DtDmChungChiTinHocPage extends AdminPage {
    componentDidMount() {
        T.showSearchBox();
        this.props.getDtDmChungChiTinHocAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const permission = this.getUserPermission('dtDmChungChiTinHoc', ['manage', 'write', 'delete']);
        let items = this.props.dtDmChungChiTinHoc ? this.props.dtDmChungChiTinHoc.items : null;
        const table = renderDataTable({
            data: items ? Object.keys(items.groupBy('loaiChungChi')) : null,
            header: 'thead-light',
            stickyHead: items && items.length > 10,
            emptyTable: 'Không có chứng chỉ tin học',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên loại chứng chỉ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã chứng chỉ</th>
                    <th style={{ width: '60%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên chứng chỉ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const rows = [];
                let chungChi = items ? items.groupBy('loaiChungChi')[item] : [], rowSpan = chungChi.length;
                for (let i = 0; i < rowSpan; i++) {
                    let cert = chungChi[i];
                    if (i == 0) {
                        rows.push(<tr key={rows.length}>
                            <TableCell content={index + 1} rowSpan={rowSpan} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={cert.tenLoaiChungChi} rowSpan={rowSpan} />
                            <TableCell style={{ textAlign: 'center' }} content={cert.ma} />
                            <TableCell content={cert.ten} />
                            <TableCell type='checkbox' content={cert.kichHoat} permission={permission}
                                onChanged={value => this.props.updateDtDmChungChiTinHoc(cert.ma, { kichHoat: value ? 1 : 0 })} />
                            <TableCell type='buttons' content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                        </tr>);
                    } else {
                        rows.push(<tr key={rows.length}>
                            <TableCell style={{ textAlign: 'center' }} content={cert.ma} />
                            <TableCell content={cert.ten} />
                            <TableCell type='checkbox' content={cert.kichHoat} permission={permission}
                                onChanged={value => this.props.updateDtDmChungChiTinHoc(cert.ma, { kichHoat: value ? 1 : 0 })} />
                            <TableCell type='buttons' content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} />
                        </tr>);
                    }
                }
                return rows;
            }
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách chứng chỉ khác',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/certificate-management'>Quản lý chứng chỉ</Link>,
                'Danh sách chứng chỉ khác'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtDmChungChiTinHoc} update={this.props.updateDtDmChungChiTinHoc}
                />
            </>,
            backRoute: '/user/dao-tao/certificate-management',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmChungChiTinHoc: state.daoTao.dtDmChungChiTinHoc });
const mapActionsToProps = { getDtDmChungChiTinHocAll, createDtDmChungChiTinHoc, updateDtDmChungChiTinHoc, deleteDtDmChungChiTinHoc };
export default connect(mapStateToProps, mapActionsToProps)(DtDmChungChiTinHocPage);