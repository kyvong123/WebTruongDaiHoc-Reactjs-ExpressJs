import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, renderTable, TableCell, getValue, FormTextBox } from 'view/component/AdminPage';
import { getAllCtsvThanhTich, getCtsvThanhTich, createCtsvThanhTich, updateCtsvThanhTich, deleteCtsvThanhTich } from './redux';

export class ThanhTichModal extends AdminModal {
    state = { loaiDoiTuong: '' }
    onShow = (item) => {
        const { id, ten } = item || {};
        this.setState({ id, item }, () => {
            this.ten.value(ten || '');
        });
    }

    onSubmit = () => {
        const data = {
            ten: getValue(this.ten)
        };
        T.confirm('Xác nhận ' + (this.state.id ? 'cập nhật' : 'tạo') + ' thành tích?', '', isConfirm => {
            if (isConfirm) {
                this.state.id ? this.props.update(this.state.id, data) : this.props.create(data);
                this.hide();
            }
        });
    }

    render = () => {
        const readOnly = !this.props.permission.write;
        return this.renderModal({
            title: (this.state.ma ? 'Cập nhật' : 'Tạo') + ' quyết định khen thưởng',
            body: <div className="row">
                <FormTextBox className='col-md-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />

            </div>
        });
    }
}

class AdminCtsvKhenThuongPage extends AdminPage {
    state = { page: null, filter: {}, heDaoTao: '', khoaSinhVien: '' };
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getAllCtsvThanhTich();
        });
    }



    render() {
        const permission = this.getUserPermission('ctsvKhenThuong');
        const list = this.props.ctsvThanhTich?.items;
        return this.renderPage({
            icon: 'fa fa-gift',
            title: 'Danh mục thành tích',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>
                    Công tác sinh viên
                </Link>,
                'Danh mục thành tích',
            ],
            content: (
                <>
                    <div className='tile'>{
                        renderTable({
                            getDataSource: () => list,
                            stickyHead: true,
                            renderHead: () => (<tr>
                                <th style={{ whiteSpace: 'nowrap' }}>#</th>
                                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Tên</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Kích hoạt</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                            </tr>),
                            renderRow: (item, index) => (<tr key={index}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.kichHoat} type='checkbox' onChanged={value => this.props.updateCtsvThanhTich(item.id, { kichHoat: value })} permission={permission} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' onEdit={() => this.modal.show(item)} onDelete={() => this.delete(item.id)} permission={permission} />
                            </tr>),
                        })
                    }</div>
                    <ThanhTichModal ref={e => this.modal = e} permission={permission} create={this.props.createCtsvThanhTich} update={this.props.updateCtsvThanhTich} />
                </>
            ),
            backRoute: '/user/ctsv/',
            // collapse: [
            //     { icon: 'fa-plus', permission: permission.write, name: 'Tạo lớp đơn lẻ', onClick: () => this.modal.show(), type: 'primary' },
            //     // { icon: 'fa-clone', permission: permission.write, name: 'Tạo lớp tự động', onClick: () => this.multipleCreateModal.show(this.props.dtLop.page.list), type: 'danger' },
            // ]
            onCreate: () => permission.write && this.modal.show()

        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvThanhTich: state.ctsv.ctsvThanhTich });
const mapActionsToProps = { getAllCtsvThanhTich, getCtsvThanhTich, createCtsvThanhTich, updateCtsvThanhTich, deleteCtsvThanhTich };
export default connect(mapStateToProps, mapActionsToProps)(AdminCtsvKhenThuongPage);