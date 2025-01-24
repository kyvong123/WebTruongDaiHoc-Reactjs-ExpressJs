import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { getScheduleSettings } from '../dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { AdminPage, AdminModal, renderDataTable, TableCell, TableHead, FormSelect, FormTextBox, FormDatePicker, getValue } from 'view/component/AdminPage';
import { getDtCauHinhDotXetTotNghiepPage, deleteDtCauHinhDotXetTotNghiep, createDtCauHinhDotXetTotNghiep, updateDtCauHinhDotXetTotNghiep } from './redux';

class EditModal extends AdminModal {

    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });
        this.onHidden(() => {
            this.ten.value('');
            this.namHoc.value('');
            this.hocKy.value('');
            this.ngayBatDau.value('');
            this.ngayKetThuc.value('');
        });
    }
    onShow = (item) => {
        let { id, ten, namHoc, hocKy, ngayBatDau, ngayKetThuc } = item ? item : { id: null, ten: '', namHoc: '', hocKy: null, ngayBatDau: '', ngayKetThuc: '' };

        if (!item) {
            let semester = this.props.currentSemester;
            namHoc = semester.namHoc;
            hocKy = semester.hocKy;
        }

        this.setState({ id, item });
        this.ten.value(ten);
        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);
        this.ngayBatDau.value(ngayBatDau);
        this.ngayKetThuc.value(ngayKetThuc);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            namHoc: getValue(this.namHoc),
            hocKy: getValue(this.hocKy),
            ngayBatDau: getValue(this.ngayBatDau).getTime(),
            ngayKetThuc: getValue(this.ngayKetThuc).getTime(),
        };
        if (changes.ngayBatDau > changes.ngayKetThuc) return T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc', 'danger');
        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật cấu hình đợt xét tốt nghiệp' : 'Tạo mới cấu hình đợt xét tốt nghiệp',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên đợt' readOnly={readOnly} required />
                <FormTextBox ref={e => this.namHoc = e} className='col-md-6' label='Năm học' type='scholastic' readOnly={this.state.id ? true : false} required />
                <FormSelect ref={e => this.hocKy = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} readOnly={this.state.id ? true : false} required />
                <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-6' label='Ngày bắt đầu' required />
                <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-6' label='Ngày kết thúc' required />
            </div>
        }
        );
    };
}

class DtCauHinhDotXetTotNghiepPage extends AdminPage {
    state = { length: 0, dssv: [], sortTerm: 'ten_ASC', items: [] }
    defaultSortTerm = 'ten_ASC'

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.setState({ filter: { ...this.state.filter, namFilter: namHoc, hocKyFilter: hocKy }, currentSemester: data.currentSemester }, () => {
                    this.getPage(undefined, undefined, '');
                });
            });
        });
    }

    componentWillUnmount() {
        // T.socket.off('dkhp-init-ctdt');
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtCauHinhDotXetTotNghiepPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    deleteDot = (e, item, done) => {
        e.preventDefault();
        T.confirm('Xóa đăng ký học phần', 'Bạn có chắc bạn muốn xóa đăng ký học phần này?', true, isConfirm =>
            isConfirm && this.props.deleteDtCauHinhDotDkhp(item.id));
        done && done();
    }

    checkCondition = () => {
        const permission = this.getUserPermission('dtCauHinhDotDkhp', ['write', 'delete', 'manage']);
        return permission;
    }

    render() {
        const permission = this.getUserPermission('dtCauHinhDotXetTotNghiep', ['write', 'delete', 'manage']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtCauHinhDotXetTotNghiep?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };

        let table = renderDataTable({
            emptyTable: 'Không tìm thấy đợt xét tốt nghiệp',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 9 ? true : false,
            divStyle: { height: '69vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên đợt' keyCol='ten' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Năm học' keyCol='namHoc' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học kỳ' keyCol='hocKy' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Modifier' keyCol='modifier' />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Time modified' keyCol='timeModified' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten}
                            type='link' onClick={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/dao-tao/graduation/setting/edit/${item.id}` })}
                        />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayBatDau} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKetThuc} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.modifier} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeModified} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={this.checkCondition(item)}
                            onEdit={(e) => e.preventDefault() || this.modal.show(item)}
                            onDelete={this.deleteDot} >
                        </TableCell>
                    </tr >
                );
            }
        });
        return this.renderPage({
            icon: 'fa fa-cogs',
            title: 'Cấu hình đợt xét tốt nghiệp',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/graduation'>Xét tốt nghiệp</Link>,
                'Cấu hình đợt xét tốt nghiệp'
            ],
            header: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} style={{ width: '150px', marginBottom: '0', marginRight: '10px' }} data={SelectAdapter_SchoolYear} placeholder='Năm học'
                    onChange={value => this.setState({ filter: { ...this.state.filter, namFilter: value.id } }, () => this.getPage())} />
                <FormSelect ref={e => this.hocKyFilter = e} style={{ width: '150px', marginBottom: '0', marginRight: '10px' }} data={SelectAdapter_DtDmHocKy} placeholder='Học kỳ'
                    onChange={value => this.setState({ filter: { ...this.state.filter, hocKyFilter: value?.id } }, () => this.getPage())} />
            </div>,
            content: (<>
                <div className='tile'>
                    <div>{table}</div>
                </div>

                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDtCauHinhDotXetTotNghiep} update={this.props.updateDtCauHinhDotXetTotNghiep}
                    currentSemester={this.state.currentSemester} />
            </>),
            backRoute: '/user/dao-tao/graduation',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtCauHinhDotXetTotNghiep: state.daoTao.dtCauHinhDotXetTotNghiep });
const mapActionsToProps = { getScheduleSettings, getDtCauHinhDotXetTotNghiepPage, deleteDtCauHinhDotXetTotNghiep, createDtCauHinhDotXetTotNghiep, updateDtCauHinhDotXetTotNghiep };
export default connect(mapStateToProps, mapActionsToProps)(DtCauHinhDotXetTotNghiepPage);