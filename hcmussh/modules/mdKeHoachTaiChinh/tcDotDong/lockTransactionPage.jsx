import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getAllKhoaGiaoDich, createKhoaGiaoDichBacHe, moKhoaSinhVien } from './redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormSelect, FormTextBox, FormDatePicker, FormTabs } from 'view/component/AdminPage';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';

const Adapter_KhoaSinhVien = () => {
    return Array.from({ length: 8 }, (_, i) => i + new Date().getFullYear() - 7);
};

class EditModal extends AdminModal {
    onShow = (filter) => {
        this.bacDaoTao.value(filter.bacDaoTao);
        this.heDaoTao.value(filter.heDaoTao);
        this.khoaSinhVien.value(filter.khoaSinhVien);
        this.ngayBatDau.value('');
        this.ngayKetThuc.value('');
        this.ghiChu.value('');
    }

    onSubmit = () => {
        let data = {
            bacDaoTao: this.bacDaoTao.value(),
            heDaoTao: this.heDaoTao.value(),
            khoaSinhVien: this.khoaSinhVien.value(),
            ngayBatDau: this.ngayBatDau.value(),
            ngayKetThuc: this.ngayKetThuc.value(),
            ghiChu: this.ghiChu.value(),
        };
        data.ngayBatDau && (data.ngayBatDau = data.ngayBatDau.setHours(0, 0, 0, 0));
        data.ngayKetThuc && (data.ngayKetThuc = data.ngayKetThuc.setHours(23, 59, 59, 999));

        if (!data.ngayBatDau) {
            T.notify('Vui lòng chọn ngày bắt đầu mở cổng giao dịch', 'danger');
            this.ngayBatDau.focus();
        }
        else if (!data.ngayKetThuc) {
            T.notify('Vui lòng chọn ngày đóng cổng giao dịch', 'danger');
            this.ngayKetThuc.focus();
        }
        else if (data.ngayBatDau > data.ngayKetThuc) {
            T.notify('Vui lòng kiểm tra lại khoảng thời gian mở cổng giao dịch', 'danger');
            this.ngayKetThuc.focus();
        }
        else {
            this.setState({ isSubmitting: true }, () => {
                this.props.create(data, () => {
                    this.props.getPage();
                    this.setState({ isSubmitting: false });
                    // this.hide();
                });
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm cấu hình khóa giao dịch',
            size: 'large',
            body: <div className='row'>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={SelectAdapter_DmSvBacDaoTao} ref={e => this.bacDaoTao = e} label='Bậc đào tạo' allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={SelectAdapter_DmSvLoaiHinhDaoTao} ref={e => this.heDaoTao = e} label='Hệ đào tạo' allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={Adapter_KhoaSinhVien()?.reverse() || []} ref={e => this.khoaSinhVien = e} label='Khóa sinh viên' allowClear />
                <FormDatePicker disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' required />
                <FormDatePicker disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.ngayKetThuc = e} label='Ngày kết thúc' required />
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' />
            </div>
        });
    }
}

class tcDotDongLockingPage extends AdminPage {
    state = { isSubmitting: false, changeSoTien: false };

    componentDidMount() {
        T.ready('/user/finance', () => {
            this.setState({ filter: { bacDaoTao: '', heDaoTao: '', khoaSinhVien: '' } }, () => {
                this.props.getAllKhoaGiaoDich(this.state.filter, item => {
                    this.setState({ list: item || [] });
                });
            });
        });
    }

    getPageKhoaGiaoDichFilter = () => {
        let bacDaoTao = this.bacDaoTao?.value() || '';
        let heDaoTao = this.heDaoTao?.value() || '';
        let khoaSinhVien = this.khoaSinhVien?.value() || '';
        this.setState({ filter: { bacDaoTao, heDaoTao, khoaSinhVien } }, () => {
            this.props.getAllKhoaGiaoDich(this.state.filter, item => {
                this.setState({ list: item || [] });
            });
        });
    }

    showEditModal = (e) => {
        e.preventDefault();
        this.editModal.show(this.state.filter);
    }

    moKhoaSinhVien = () => {
        const sinhVien = this.sinhVien?.data()?.text || '';
        const mssv = this.sinhVien.value() || '';
        if (!sinhVien) {
            T.notify('Vui lòng nhập thông tin sinh viên!', 'danger');
        }
        else {
            T.confirm('Mở cổng giao dịch', `Bạn có đồng ý mở cổng giao dịch cho sinh viên ${sinhVien}? `, true, isConfirm => {
                isConfirm && this.props.moKhoaSinhVien(mssv);
            });
        }
    }

    apDungBacHeTab = () => {
        let listBacHe = renderTable({
            emptyTable: 'Không có dữ liệu hệ đào tạo',
            getDataSource: () => this.state.list, stickyHead: this.state.list?.length > 20,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Bậc đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Hệ đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Khóa sinh viên</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày bắt đầu</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày kết thúc</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenBac} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenHe} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.khoaSinhVien} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayBatDau ? T.dateToText(new Date(parseInt(item.ngayBatDau)), 'dd/mm/yyyy') : ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayKetThuc ? T.dateToText(new Date(parseInt(item.ngayKetThuc)), 'dd/mm/yyyy') : ''} />
                </tr>
            )
        });

        return (
            <div className='tile row' style={{ margin: '0 0 30px 0' }}>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={SelectAdapter_DmSvBacDaoTao} ref={e => this.bacDaoTao = e} label='Bậc đào tạo' allowClear onChange={this.getPageKhoaGiaoDichFilter} />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={SelectAdapter_DmSvLoaiHinhDaoTao} ref={e => this.heDaoTao = e} label='Hệ đào tạo' allowClear onChange={this.getPageKhoaGiaoDichFilter} />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={Adapter_KhoaSinhVien()?.reverse() || []} ref={e => this.khoaSinhVien = e} label='Khóa sinh viên' allowClear onChange={this.getPageKhoaGiaoDichFilter} />
                <div className='col-md-12' style={{ margin: '10px 0 30px 0' }}>
                    {listBacHe}
                </div>
            </div>
        );
    }

    apDungSinhVienTab = () => {
        return (
            <div className='tile row' style={{ margin: '0 0 30px 0' }}>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-12' data={SelectAdapter_FwStudent} ref={e => this.sinhVien = e} label='Sinh viên' />
                <div className='col-md-12' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.moKhoaSinhVien()}>
                        Mở thanh toán
                    </button>
                </div>
            </div>
        );
    }

    render() {
        const permission = this.getUserPermission('tcDotDongHocPhi', ['manage', 'write', 'delete']);
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quản lý khóa giao dịch',
            breadcrumb: [<Link key={0} to='/user/finance/dot-dong'>Đợt đóng</Link>, 'Khóa giao dịch'],
            content: <>
                <FormTabs tabs={[
                    { title: 'Theo bậc/hệ', component: this.apDungBacHeTab() },
                    { title: 'Theo sinh viên', component: this.apDungSinhVienTab() },
                ]} />

                <EditModal ref={e => this.editModal = e} create={this.props.createKhoaGiaoDichBacHe} getPage={this.getPageKhoaGiaoDichFilter} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showEditModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcDotDong: state.finance.tcDotDong });
const mapActionsToProps = {
    getAllKhoaGiaoDich, createKhoaGiaoDichBacHe, moKhoaSinhVien
};
export default connect(mapStateToProps, mapActionsToProps)(tcDotDongLockingPage);

