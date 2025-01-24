import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllCtsvHoSoNhapHoc, createCtsvHoSoNhapHoc, updateCtsvHoSoNhapHoc, deleteCtsvHoSoNhapHoc } from './redux';
import { AdminModal, AdminPage, FormTextBox, TableCell, getValue, renderTable } from 'view/component/AdminPage';

export class CtsvHoSoNhapHocModal extends AdminModal {
    onShow = (item) => {
        this.setState({ id: item?.id, item }, () => {
            this.ten.value(item?.ten);
        });
    }

    onSubmit = () => {
        const data = {
            ten: getValue(this.ten),
        };
        let done = () => {
            this.hide();
            this.props.onSubmit && this.props.onSubmit();
        };
        this.state.id ? this.props.update(this.state.id, data, done) : this.props.create(data, done);
    }

    render = () => {
        const { id } = this.state;
        return this.renderModal({
            title: 'Tạo hồ sơ nhập học',
            body: <div className='row' key={id}>
                <FormTextBox ref={e => this.ten = e} className='col-md-12' label='Tên' />
            </div>
        });
    }
}


class DmHoSoNhapHocAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getAllCtsvHoSoNhapHoc();
        });
    }

    toggleActive = (value, id) => {
        this.props.updateCtsvHoSoNhapHoc(id, { kichHoat: value }, () => this.props.getAllCtsvHoSoNhapHoc());
    }

    render() {
        const items = this.props.hoSoNhapHoc?.items;
        const permission = this.getUserPermission('ctsvDmHoSoNhapHoc',);
        return this.renderPage({
            title: 'Hồ sơ nhập học',
            icon: 'fa fa-paperclip',
            backRoute: '/user/ctsv/tu-dien-du-lieu',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                <Link key={0} to='/user/ctsv/tu-dien-du-lieu'>Từ điển dữ liệu</Link>,
                'Danh mục hồ sơ nhập học'
            ],
            content: <>
                <div className='tile'>
                    {renderTable({
                        getDataSource: () => items,
                        renderHead: () => <tr>
                            <th>#</th>
                            <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Tên</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Theo tác</th>
                        </tr>,
                        renderRow: (item, index) => <tr key={item.id}>
                            <TableCell content={index + 1} />
                            <TableCell content={item.ten} />
                            <TableCell content={item.kichHoat} type='checkbox' permission={permission} onChanged={(value) => this.toggleActive(value, item.id)} />
                            <TableCell type='buttons' permission={permission} onEdit={() => this.modal.show(item)} />
                        </tr>
                    })}
                </div>
                <CtsvHoSoNhapHocModal ref={e => this.modal = e} create={this.props.createCtsvHoSoNhapHoc} update={this.props.updateCtsvHoSoNhapHoc} onSubmit={this.props.getAllCtsvHoSoNhapHoc} />
            </>,
            onCreate: permission.write ? () => this.modal.show() : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hoSoNhapHoc: state.ctsv.hoSoNhapHoc, quanHeNhapHoc: state.ctsv.quanHeNhapHoc });
const mapActionsToProps = { getAllCtsvHoSoNhapHoc, createCtsvHoSoNhapHoc, updateCtsvHoSoNhapHoc, deleteCtsvHoSoNhapHoc };
export default connect(mapStateToProps, mapActionsToProps)(DmHoSoNhapHocAdminPage);