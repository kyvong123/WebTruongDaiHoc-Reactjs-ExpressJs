import React from 'react';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, getValue, FormSelect } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getDtDmHeSoKhoiLuongPage, createHeSoKhoiLuong, deleteHeSoKhoiLuong, updateHeSoKhoiLuong } from './redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import Pagination from 'view/component/Pagination';


class ModalHeSoKhoiLuong extends AdminModal {
    onShow = (item, namHoc) => {
        if (!item) {
            this.soLuongDuoi?.value('');
            this.soLuongTren?.value('');
            this.heSo?.value('');
            this.setState({ isEdit: false, namHoc });
        } else {
            this.setState({ isEdit: true, id: item.id, namHoc });
            this.soLuongDuoi?.value(item.soLuongDuoi);
            this.soLuongTren?.value(item.soLuongTren);
            this.heSo?.value(item.heSo);
        }
    }
    onSubmit = () => {
        let data = {
            soLuongDuoi: parseInt(getValue(this.soLuongDuoi)),
            soLuongTren: parseInt(getValue(this.soLuongTren)),
            namHoc: this.state.namHoc,
            heSo: getValue(this.heSo)
        };
        if (data.soLuongDuoi >= data.soLuongTren) {
            T.notify('Số lượng cận trên phải lớn hơn cận dưới', 'danger');
        } else {
            if (this.state.isEdit) {
                this.props.updateHeSoKhoiLuong(this.state.id, { heSo: data.heSo }, this.hide());
            } else {
                this.props.createHeSoKhoiLuong(data, this.hide());
            }
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm hệ số khối lượng',
            size: 'large',
            body: <div className='row'>
                <FormTextBox readOnly={this.state.isEdit} allowNegative={false} min='1' ref={e => this.soLuongDuoi = e} className='col-md-6' label='Số lượng sinh viên tối thiểu' type='number' required></FormTextBox>
                <FormTextBox readOnly={this.state.isEdit} allowNegative={false} min='1' ref={e => this.soLuongTren = e} className='col-md-6' label='Số lượng sinh viên tối đa' type='number' required></FormTextBox>
                <FormTextBox allowNegative={false} sep='2' ref={e => this.heSo = e} className='col-md-12' label='Hệ số khối lượng' step={0.1} decimalScale={1} type='number' required></FormTextBox>
            </div >
        }
        );
    };
}

class DtDmHeSoKhoiLuong extends AdminPage {
    roundToTwo = (num) => {
        return +(Math.round(num + 'e+1') + 'e-1');
    };
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(undefined, undefined, undefined, undefined, result => {
                if (!this.namHoc?.value()) {
                    this.namHoc.value(result.filter.namHoc);
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, filter, done) => {
        this.props.getDtDmHeSoKhoiLuongPage(pageN, pageS, pageC, filter, done);
    }
    getPageByNamHoc = () => {
        const { pageNumber, pageSize, pageTotal } = this.props.dtDmHeSoKhoiLuong?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0 };
        this.props.getDtDmHeSoKhoiLuongPage(pageNumber, pageSize, pageTotal, { namHoc: this.namHoc.value() });
    }
    delete = (item) => {
        T.confirm('Xác nhận', 'Bạn có muốn xóa hệ số khối lượng này!', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteHeSoKhoiLuong(item.id);
            }
        });
    }

    render() {
        const permission = this.getUserPermission('dtDmHeSoKhoiLuong', ['write', 'delete', 'manage']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtDmHeSoKhoiLuong?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderTable({
            getDataSource: () => list || [],
            emptyTable: 'Chưa có dữ liệu hệ số khối lượng',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>STT</th>
                    <th style={{ width: '30%', textAlign: 'left' }}>Số lượng sinh viên tối thiểu</th>
                    <th style={{ width: '30%', textAlign: 'left' }}>Số lượng sinh viên tối đa</th>
                    <th style={{ width: '20%', textAlign: 'left' }}>Hệ số khối lượng</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.soLuongDuoi} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.soLuongTren} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={this.roundToTwo(item.heSo)} />
                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} permission={permission} onDelete={() => this.delete(item)} onEdit={() => this.modal.show({ ...item, namHoc: this.namHoc.value() })} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Hệ số khối lượng',
            header: <><FormSelect ref={e => this.namHoc = e} style={{ width: '200px', marginBottom: '0', marginRight: 0 }} data={SelectAdapter_SchoolYear} placeholder='Năm học' onChange={
                () => this.getPageByNamHoc()
            } /> </>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/luong-giang-day'>Lương giảng dạy</Link>,
                'Hệ số khối lượng'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />

                <ModalHeSoKhoiLuong ref={e => this.modal = e} createHeSoKhoiLuong={this.props.createHeSoKhoiLuong} updateHeSoKhoiLuong={this.props.updateHeSoKhoiLuong} deleteHeSoKhoiLuong={this.props.deleteHeSoKhoiLuong} />
            </>,
            backRoute: '/user/dao-tao/luong-giang-day',
            onCreate: (e) => e.preventDefault() || this.modal.show(null, this.namHoc?.value()),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmHeSoKhoiLuong: state.daoTao.dtDmHeSoKhoiLuong });
const mapActionsToProps = { getDtDmHeSoKhoiLuongPage, createHeSoKhoiLuong, deleteHeSoKhoiLuong, updateHeSoKhoiLuong };
export default connect(mapStateToProps, mapActionsToProps)(DtDmHeSoKhoiLuong);
