import React from 'react';
import { AdminPage, AdminModal, FormTextBox, FormSelect, renderDataTable, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import { getMonHocKhongTinhTB, createNhomMonHocKhongTinhTB, updateNhomMonHocKhongTinhTB, deleteNhomMonHocKhongTinhTB, createMonHocKhongTinhTB, deleteMonHocKhongTinhTB } from './redux';
import { Tooltip } from '@mui/material';


class ModalNhomMonHoc extends AdminModal {
    state = { isEdit: false }
    onShow = (item) => {
        if (item) this.setState({ isEdit: true });
        else this.setState({ isEdit: false });

        let { ma, ten } = item ? item : { ma: null, ten: null };
        this.ma.value(ma || '');
        this.ten.value(ten || '');
        this.setState(item);
    }

    onSubmit = () => {
        const data = {
            ma: this.ma.value(),
            ten: this.ten.value(),
        };
        if (data.ma == '') {
            T.notify('Mã nhóm bị trống!', 'danger');
            this.ma.focus();
        } else if (data.ten == '') {
            T.notify('Tên nhóm bị trống!', 'danger');
            this.ten.focus();
        } else {
            if (this.state.isEdit) {
                this.props.update(data.ma, data, this.hide);
            } else {
                this.props.create(data, (value) => {
                    if (value) this.ma.focus();
                    else this.hide();
                });
            }
        }
    }

    render = () => {
        let isEdit = this.state.isEdit;
        return this.renderModal({
            title: isEdit ? 'Chỉnh sửa nhóm môn học' : 'Tạo mới nhóm môn học',
            size: 'modal-xl',
            body: <div className='row'>
                <FormTextBox ref={e => this.ma = e} className='col-md-12' label='Mã nhóm' required readOnly={isEdit} />
                <FormTextBox ref={e => this.ten = e} className='col-md-12' label='Tên nhóm' required />
            </div>
        }
        );
    };
}

class ModalMonHoc extends AdminModal {

    onShow = (item) => {
        let { ma, ten } = item;
        this.ma.value(ma);
        this.ten.value(ten);
        this.setState(item);

        this.maMonHoc.value('');
        this.setState({ item });

    }

    onSubmit = () => {
        const data = {
            maNhom: this.ma.value(),
            maMonHoc: this.maMonHoc.value(),
        };
        data.maMonHoc = data.maMonHoc.join(', ');
        if (data.maMonHoc == '') {
            T.notify('Chưa chọn môn học!', 'danger');
            this.maMonHoc.focus();
        } else {
            this.props.createMon(data, (value) => {
                if (value) this.ma.focus();
                else this.hide();
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo mới môn học',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox ref={e => this.ma = e} className='col-md-4' label='Mã nhóm' required readOnly />
                <FormTextBox ref={e => this.ten = e} className='col-md-8' label='Tên nhóm' required readOnly />
                <FormSelect ref={e => this.maMonHoc = e} className='col-md-12' label='Môn học' data={SelectAdapter_DmMonHocAll()} required multiple />
            </div>
        }
        );
    };
}

class DtMonHocKhongTinhTB extends AdminPage {

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getMonHocKhongTinhTB();
        });
    }

    deleteNhom = (item) => {
        T.confirm('Xác nhận', `Bạn có muốn xóa nhóm môn học ${item.ten}`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteNhomMonHocKhongTinhTB(item.ma);
            }
        });
    }

    delete = (sub) => {
        T.confirm('Xác nhận', `Bạn có muốn xóa môn học ${T.parse(sub.tenMon)?.vi}`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteMonHocKhongTinhTB(sub.id);
            }
        });
    }

    render() {
        let list = this.props.monHocKTB && this.props.monHocKTB.items ? this.props.monHocKTB.items : [];
        const permission = this.getUserPermission('dtDmMonHocKhongTinhTb', ['write', 'delete', 'manage']);
        const table = renderDataTable({
            data: list,
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Không tìm thấy môn học',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã nhóm</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã môn học</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên môn học</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Khoa/Bộ môn</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => {
                let rows = [];
                rows.push(
                    <tr key={index}>
                        <TableCell className='text-dark' style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.ten} colSpan={2} />
                        <TableCell style={{ textAlign: 'right' }} type='buttons' content={item} permission={permission} colSpan={2}
                            onEdit={(e) => e.preventDefault() || this.modal.show(item)}
                            onDelete={(e) => e.preventDefault() || this.deleteNhom(item)}>
                            <Tooltip title='Tạo nhóm' arrow>
                                <button className='btn btn-success' onClick={() => this.monModal.show(item)}>
                                    <i className='fa fa-lg fa-plus' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                );
                if (item.submenus && item.submenus.length) {
                    item.submenus.forEach((sub, stt) => rows.push(
                        <tr key={`${index}-${stt}-1`}>
                            <TableCell style={{ textAlign: 'right' }} content={stt + 1} colSpan={2} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={sub.maMonHoc} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(sub.tenMon)?.vi} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={sub.tenKhoa} />
                            <TableCell style={{ textAlign: 'right' }} type='buttons' content={sub} permission={permission}
                                onDelete={(e) => e.preventDefault() || this.delete(sub)}
                            />
                        </tr>,
                    ));
                }
                return rows;
            },
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Môn học không tính trung bình',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Môn học không tính trung bình'
            ],
            content: <>
                <ModalNhomMonHoc ref={e => this.modal = e}
                    create={this.props.createNhomMonHocKhongTinhTB}
                    update={this.props.updateNhomMonHocKhongTinhTB}
                />
                <ModalMonHoc ref={e => this.monModal = e}
                    createMon={this.props.createMonHocKhongTinhTB}
                />
                <div className='tile'>{table}</div>
            </>,
            backRoute: '/user/dao-tao/data-dictionary',
            onCreate: (e) => e.preventDefault() || this.modal.show(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, monHocKTB: state.daoTao.monHocKTB });
const mapActionsToProps = { getMonHocKhongTinhTB, createNhomMonHocKhongTinhTB, updateNhomMonHocKhongTinhTB, deleteNhomMonHocKhongTinhTB, createMonHocKhongTinhTB, deleteMonHocKhongTinhTB };
export default connect(mapStateToProps, mapActionsToProps)(DtMonHocKhongTinhTB);
