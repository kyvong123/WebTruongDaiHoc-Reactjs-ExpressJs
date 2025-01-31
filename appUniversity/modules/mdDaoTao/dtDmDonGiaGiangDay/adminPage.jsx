import React from 'react';
import { AdminPage, AdminModal, FormSelect, renderTable, TableCell, FormTextBox, getValue } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getDtDmDonGiaGiangDayPage, createDonGiaGiangDay, deleteDonGiaGiangDay, updateDonGiaGiangDay } from './redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from '../dtSemester/redux';

// const DataHocVi = [{ id: '02', text: 'Thạc sĩ' }, { id: '03', text: 'Tiến sĩ' }];
// const DataHocHam = [{ id: '01', text: 'Giáo sư' }, { id: '02', text: 'Phó giáo sư' }];
class ModalDonGiaGiangDay extends AdminModal {
    onShow = (item, namHoc) => {
        if (!item) {
            this.ten.value('');
            this.namHoc.value(namHoc);
            this.heDaoTao.value('');
            this.donGia.value('');
            this.thanhChu.value('');
            this.setState({ isEdit: false });
        } else {
            this.ten.value(item.ten);
            this.namHoc.value(item.namHoc);
            this.heDaoTao.value(item.heDaoTao);
            this.donGia.value(item.donGia);
            this.setAmountText(item.donGia, this.thanhChu);
            this.setState({ isEdit: true, id: item.id });
        }
    }

    setAmountText = (value, where) => {
        if (Number.isInteger(value)) {
            where?.value(T.numberToVnText(value.toString()) + ' đồng');
        }
    }

    onChangeSoTien = () => {
        const soTien = this.donGia.value();
        if (soTien) {
            this.setAmountText(soTien, this.thanhChu);
        }
    }

    onSubmit = () => {
        let data = {
            ten: getValue(this.ten),
            namHoc: getValue(this.namHoc),
            heDaoTao: getValue(this.heDaoTao),
            donGia: getValue(this.donGia),
        };
        if (this.state.isEdit) {
            this.props.updateDonGiaGiangDay(this.state.id, data, this.hide);
        } else {
            this.props.createDonGiaGiangDay(data, this.hide);
        }
    };

    render = () => {
        return this.renderModal({
            title: this.state.isEdit ? 'Thay đổi đơn giá giảng dạy' : 'Thêm đơn giá giảng dạy',
            size: 'large',
            body: <div className='row'>
                {/* <FormTextBox readOnly={this.state.isEdit} type='text' className='col-md-12' label='Mã' ref={e => this.ma = e} required></FormTextBox> */}
                <FormTextBox className='col-md-12' label='Tên đơn giá' ref={e => this.ten = e} required></FormTextBox>
                <FormSelect className='col-md-6' label='Năm học' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} required></FormSelect>
                <FormSelect className='col-md-6' label='Loại hình đào tạo' ref={e => this.heDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} required></FormSelect>
                <FormTextBox type='number' className='col-md-12' label='Số tiền đơn giá' ref={e => this.donGia = e} required onChange={this.onChangeSoTien}></FormTextBox>
                <FormTextBox disabled label='Thành chữ' className='col-md-12' ref={e => this.thanhChu = e} readOnlyEmptyText='Chưa có dữ liệu đã trả' />
            </div >
        }
        );
    };
}

class DtDmDonGiaGiangDay extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(undefined, undefined, undefined, result => {
                if (!this.namHoc?.value()) {
                    this.namHoc.value(result.filter.namHoc);
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getDtDmDonGiaGiangDayPage(pageN, pageS, pageC, null, done);
    }

    getPageByNamHoc = () => {
        const { pageNumber, pageSize } = this.props.dtDmDonGiaGiangDay?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0 };
        this.props.getDtDmDonGiaGiangDayPage(pageNumber, pageSize, null, { namHoc: this.namHoc.value() });
    }

    delete = (item) => {
        T.confirm('Xác nhận', 'Bạn có muốn xóa đơn giá giảng dạy này!', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteDonGiaGiangDay(item.id);
            }
        });
    }

    render() {
        const permission = this.getUserPermission('dtDmDonGiaGiangDay', ['write', 'delete', 'manage']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtDmDonGiaGiangDay && this.props.dtDmDonGiaGiangDay.page ? this.props.dtDmDonGiaGiangDay.page :
            { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderTable({
            getDataSource: () => list || [],
            emptyTable: 'Chưa có dữ liệu đơn giá giảng dạy',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>STT</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học</th>
                    <th style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên đơn giá</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Số tiền đơn giá (VNĐ)</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} type='number' content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.ten} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenHeDaoTao} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.donGia} />
                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} permission={permission} onDelete={() => this.delete(item)} onEdit={() => this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Đơn giá giảng dạy',
            header: <><FormSelect ref={e => this.namHoc = e} style={{ width: '200px', marginBottom: '0', marginRight: 0 }} data={SelectAdapter_SchoolYear} placeholder='Năm học' onChange={
                () => this.getPageByNamHoc()
            } /> </>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/luong-giang-day'>Lương giảng dạy</Link>,
                'Đơn giá giảng dạy'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />

                <ModalDonGiaGiangDay ref={e => this.modal = e} createDonGiaGiangDay={this.props.createDonGiaGiangDay} deleteDonGiaGiangDay={this.props.deleteDonGiaGiangDay} updateDonGiaGiangDay={this.props.updateDonGiaGiangDay} />
            </>,
            backRoute: '/user/dao-tao/luong-giang-day',
            onCreate: (e) => e.preventDefault() || this.modal.show(null, this.namHoc.value()),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmDonGiaGiangDay: state.daoTao.dtDmDonGiaGiangDay });
const mapActionsToProps = { getDtDmDonGiaGiangDayPage, createDonGiaGiangDay, deleteDonGiaGiangDay, updateDonGiaGiangDay };
export default connect(mapStateToProps, mapActionsToProps)(DtDmDonGiaGiangDay);
