import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DangKyHocPhanStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { SelectAdapter_ChuongTrinhDaoTaoRole } from 'modules/mdDaoTao/dtChuongTrinhDaoTao/redux';
import { getDtSvChuongTrinhAll, createDtSvChuongTrinh, deleteDtSvChuongTrinh } from './redux';


class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.sinhVien.focus();
        });
        this.onHidden(() => {
            this.sinhVien.value('');
            this.chuongTrinh.value('');
            this.setState({ mssv: '', loaiHinhDaoTao: '', maCtdt: '' });
        });
        this.disabledClickOutside();
    }

    onChangeSV = e => {
        this.setState({ mssv: e.id, loaiHinhDaoTao: e.userData.loaiHinhDaoTao }, () => this.chuongTrinh.value(''));
    }

    onChangeCtdt = e => this.setState({ maCtdt: e.maCtdt })

    onSubmit = () => {
        let { mssv, maCtdt } = this.state;
        if (!maCtdt) return T.notify('Chưa có chương trình đào tạo!', 'danger');
        this.props.create({ mssv, maCtdt }, this.hide);
    }

    render = () => {
        let { loaiHinhDaoTao, mssv } = this.state;
        return this.renderModal({
            title: 'Tạo mới chương trình đào tạo',
            isShowSubmit: !!mssv,
            body: <div className='row'>
                <FormSelect ref={e => this.sinhVien = e} className='col-md-12' placeholder='Sinh viên' data={SelectAdapter_DangKyHocPhanStudent}
                    onChange={(e) => this.onChangeSV(e)} />
                <FormSelect ref={e => this.chuongTrinh = e} className='col-md-12' placeholder='Chương trình đào tạo' data={SelectAdapter_ChuongTrinhDaoTaoRole({ heDaoTao: loaiHinhDaoTao })}
                    required style={{ display: mssv ? '' : 'none' }} onChange={e => this.onChangeCtdt(e)} />
            </div>
        });
    };
}

class DtSvChuongTrinhDaoTao extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtSvChuongTrinhAll();
        });
    }

    delete = (item) => {
        T.confirm('Xóa sinh viên chương trình', `Bạn có chắc bạn muốn xóa chương trình đào tạo ${item.maCtdt} của sinh viên ${item.ho} ${item.ten} không?`, true, isConfirm => {
            isConfirm && this.props.deleteDtSvChuongTrinh(item.id);
        });
    }

    render() {
        let list = this.props.dtSvCtdt?.items || [];

        const table = renderTable({
            getDataSource: () => list,
            stickyHead: list && list.length > 10,
            emptyTable: 'Chưa có dữ liệu sinh viên chương trình đào tạo!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và tên</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Mã chương trình đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={`${item.ho} ${item.ten}`} />
                    <TableCell content={item.maCtdt} />
                    <TableCell type='buttons' content={item} permission={{ delete: true }}
                        onDelete={() => this.delete(item)} />
                </tr>
            )
        });

        return this.renderPage({
            title: 'Sinh viên chương trình đào tạo',
            icon: 'fa fa-university',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Sinh viên chương trình đào tạo'
            ],
            backRoute: '/user/dao-tao',
            content: <>
                <EditModal ref={e => this.modal = e} create={this.props.createDtSvChuongTrinh} />
                <div className='tile'>
                    {table}
                </div>
            </>,
            onCreate: e => e && e.preventDefault() || this.modal.show()
        });
    }
}
const mapStateToProps = state => ({ system: state.system, dtSvCtdt: state.daoTao.dtSvCtdt });
const mapActionsToProps = { getDtSvChuongTrinhAll, createDtSvChuongTrinh, deleteDtSvChuongTrinh };
export default connect(mapStateToProps, mapActionsToProps)(DtSvChuongTrinhDaoTao);