import React from 'react';
import { connect } from 'react-redux';
import { createDmDoiTuongMienGiam, updateDmDoiTuongMienGiam, deleteDmDoiTuongMienGiam, getDmDoiTuongMienGiamPage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue, FormCheckbox, FormRichTextBox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, dinhMuc, kichHoat, thoiGian } = item ? item : { ma: '', ten: '', dinhMuc: '', kichHoat: 1, thoiGian: '' };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.dinhMuc.value(dinhMuc);
        this.thoiGian.value(thoiGian);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            dinhMuc: getValue(this.dinhMuc),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            thoiGian: getValue(this.thoiGian)
        };
        if (changes.dinhMuc > 100) {
            this.dinhMuc.focus();
            T.notify('Định mức không được quá 100', 'danger');
        }
        else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật đối tượng miễn giảm' : 'Tạo mới đối tượng miễn giảm',
            body: <div className='row'>
                <FormTextBox type='number' className='col-md-12' ref={e => this.ma = e} label='Mã'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên'
                    readOnly={readOnly} required />
                <FormTextBox type='number' className='col-md-12' ref={e => this.dinhMuc = e} label='Định mức miễn giảm (%)'
                    readOnly={readOnly} required />
                <FormSelect className='col-md-12' ref={e => this.thoiGian = e} label='Thời gian áp dụng'
                    readOnly={readOnly} data={[{id: 'TK', text: 'Toàn khóa'}, {id: 'NTC', text: 'Năm tài chính (01/01 - 31/12)'}]} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmDoiTuongMienGiamPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.onSearch = (searchText) => this.props.getDmDoiTuongMienGiamPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmDoiTuongMienGiamPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa đối tượng miễn giảm', 'Bạn có chắc bạn muốn xóa đối tượng miễn giảm này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmDoiTuongMienGiam(item.ma));
    };

    changeActive = item => this.props.updateDmDoiTuongMienGiam(item.ma, { kichHoat: Number(!item.kichHoat) });


    render() {
        const permission = this.getUserPermission('dmDoiTuongMienGiam');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmDoiTuongMienGiam && this.props.dmDoiTuongMienGiam.page ?
            this.props.dmDoiTuongMienGiam.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >STT</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Mã</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }} >Tên</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }} >Định mức</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }} >Thời gian áp dụng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index+1} style={{ textAlign: 'center' }} />
                    <TableCell type='text' content={item.ma ? item.ma : 0} />
                    <TableCell type="link" content={item.ten ? item.ten : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={(item.dinhMuc ? item.dinhMuc : 0) + '%'} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.thoiGian ? (item.thoiGian == 'TK' ? 'Toàn khóa' : 'Năm tài chính') : ''} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                        onChanged={() => this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục đối tượng miễn giảm',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh mục đối tượng miễn giảm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmDoiTuongMienGiamPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDmDoiTuongMienGiam} update={this.props.updateDmDoiTuongMienGiam} />
            </>,
            backRoute: '/user/ctsv',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmDoiTuongMienGiam: state.ctsv.dmDoiTuongMienGiam });
const mapActionsToProps = { createDmDoiTuongMienGiam, updateDmDoiTuongMienGiam, deleteDmDoiTuongMienGiam, getDmDoiTuongMienGiamPage };
export default connect(mapStateToProps, mapActionsToProps)(DmDoiTuongMienGiamPage);