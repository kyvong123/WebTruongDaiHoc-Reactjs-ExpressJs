import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormTabs } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtKhenThuongAllUserPage, updateQtKhenThuongAllUserPage,
    deleteQtKhenThuongAllUserPage, createQtKhenThuongAllUserPage,
} from './redux';

import { getDonViFromList } from 'modules/mdDanhMuc/dmDonVi/redux';

import { SelectAdapter_DmKhenThuongKyHieuV2 } from 'modules/mdDanhMuc/dmKhenThuongKyHieu/redux';
import { SelectAdapter_DmKhenThuongChuThichV2 } from 'modules/mdDanhMuc/dmKhenThuongChuThich/redux';
import { getDmKhenThuongLoaiDoiTuongAll } from 'modules/mdDanhMuc/dmKhenThuongLoaiDoiTuong/redux';

class EditModal extends AdminModal {
    state = { id: '', doiTuong: '' };
    componentDidMount() {
        this.props.getLoaiDoiTuong(items => {
            if (items) {
                this.loaiDoiTuongTable = [];
                items.forEach(item => this.loaiDoiTuongTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
    }

    onShow = (item) => {
        let { id, namDatDuoc, maThanhTich, maChuThich, diemThiDua, soQuyetDinh } = item && item.item ? item.item : {
            id: '', namDatDuoc: '', maThanhTich: '', maChuThich: '', diemThiDua: '', soQuyetDinh: ''
        };

        this.setState({
            id: id, loaiDoiTuong: this.props.loaiDoiTuong,
            ma: item.ma
        });

        setTimeout(() => {
            this.namDatDuoc.value(namDatDuoc || '');
            this.thanhTich.value(maThanhTich || '');
            this.chuThich.value(maChuThich || '');
            this.diemThiDua.value(diemThiDua);
            this.soQuyetDinh.value(soQuyetDinh || '');
        }, 100);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            loaiDoiTuong: this.state.loaiDoiTuong,
            ma: this.state.ma,
            namDatDuoc: this.namDatDuoc.value(),
            thanhTich: this.thanhTich.value(),
            chuThich: this.chuThich.value(),
            diemThiDua: this.diemThiDua.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
        };
        if (!this.thanhTich.value()) {
            T.notify('Thành tích trống', 'danger');
            this.thanhTich.focus();
        } else this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình khen thưởng' : 'Tạo mới quá trình khen thưởng',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-4' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-8' ref={e => this.thanhTich = e} label='Thành tích' data={SelectAdapter_DmKhenThuongKyHieuV2} readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.namDatDuoc = e} label='Năm đạt được (yyyy)' type='year' readOnly={readOnly} />
                <FormSelect className='col-md-8' ref={e => this.chuThich = e} label='Chú thích' data={SelectAdapter_DmKhenThuongChuThichV2} readOnly={readOnly} />
                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={readOnly} />
            </div>
        });
    }
}

class _KhenThuongTable extends AdminPage {
    componentDidMount() {
        const shcc = this.props.system?.user?.staff?.shcc;
        if (this.props.loaiDoiTuong == '03') {
            this.setState({ filter: { listDv: this.props.donVi.ma, loaiDoiTuong: '03', fromYear: null, toYear: null, listThanhTich: '' } }, this.getPage);
        } else if (this.props.loaiDoiTuong == '02') {
            this.setState({ filter: { listDv: '', listShcc: shcc, loaiDoiTuong: '02', fromYear: null, toYear: null, listThanhTich: '' } }, this.getPage);
        } else {
            this.setState({ filter: { listDv: '', loaiDoiTuong: '01', fromYear: null, toYear: null, listThanhTich: '' } }, this.getPage);
        }
    }

    getPage = (pageN, pageS, pageC) => {
        this.props.getQtKhenThuongAllUserPage(pageN, pageS, pageC, this.state.filter, (page) => this.setState({ page }));
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.state.page || {};

        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Thành tích</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm đạt được</th>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Điểm thi đua</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={(item.soQuyetDinh || '')} />
                    <TableCell type='text' content={(item.tenThanhTich)} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={(item.namDatDuoc)} />
                    <TableCell type='text' style={{ textAlign: 'right' }} content={item.diemThiDua} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={this.props.permission}
                        onEdit={() => this.modal.show({ item, ma: this.props.shcc })} onDelete={this.delete} />
                </tr>
            )
        });
        return <div className="col-md-12">
            <div style={{ marginBottom: '10px' }}>Tìm thấy: <b>{totalItem}</b> kết quả.</div>
            {table}
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                getPage={this.getPage} />
        </div>;
    }
}

const KhenThuongTable = connect(state => ({ system: state.system, qtKhenThuongAll: state.tccb.qtKhenThuongAll }), { getQtKhenThuongAllUserPage }, false, { forwardRef: true })(_KhenThuongTable);


class QtKhenThuongAllUserPage extends AdminPage {
    state = { filter: {}, dsDonVi: [] };
    componentDidMount() {
        T.ready('/user', () => {
            // const staff = this.props.system?.user?.staff || {};
            this.props.getDonViFromList(this.getDsDonVi(), (items) => this.setState({ dsDonVi: items }));
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtKhenThuongAllUserPage(pageN, pageS, pageC, this.state.filter, done);
    }


    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, ma: this.state.filter.ma });
    }

    getDsDonVi = () => {
        const data = new Set([]);
        this.props.system?.user?.staff?.listChucVu?.forEach(item => {
            data.add(item.maDonVi);
        });
        this.props.system?.user?.staff?.maDonVi && data.add(this.props.system.user.staff.maDonVi);
        return Array.from(data);
    }

    delete = (e, item) => {
        T.confirm('Xóa khen thưởng', 'Bạn có chắc bạn muốn xóa khen thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKhenThuongAllUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá khen thưởng bị lỗi!', 'danger');
                else T.alert('Xoá khen thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: false,
                delete: false
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';

        return this.renderPage({
            icon: 'fa fa-gift',
            title: 'Quá trình khen thưởng',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Khen thưởng'
            ],
            content: <>
                <div className='tile'>
                    <FormTabs tabs={[
                        { title: 'Cá nhân', component: <KhenThuongTable permission={permission} loaiDoiTuong={'02'} shcc={shcc} /> },
                        { title: 'Trường', component: <KhenThuongTable loaiDoiTuong={'01'} permission={permission} shcc={shcc} /> },
                        ...this.state.dsDonVi.map(item => ({ title: item.ten, component: <KhenThuongTable permission={permission} loaiDoiTuong={'03'} donVi={item} shcc={shcc} /> })),
                    ]} />
                </div>
                <EditModal ref={e => this.modal = e}
                    create={this.props.createQtKhenThuongAllUserPage} update={this.props.updateQtKhenThuongAllUserPage}
                    loaiDoiTuong={this.state.filter.loaiDoiTuong} readOnly={!permission.write}
                    getLoaiDoiTuong={this.props.getDmKhenThuongLoaiDoiTuongAll}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKhenThuongAll: state.tccb.qtKhenThuongAll });
const mapActionsToProps = {
    getQtKhenThuongAllUserPage, deleteQtKhenThuongAllUserPage, createQtKhenThuongAllUserPage,
    updateQtKhenThuongAllUserPage, getDmKhenThuongLoaiDoiTuongAll, getDonViFromList
};
export default connect(mapStateToProps, mapActionsToProps)(QtKhenThuongAllUserPage);