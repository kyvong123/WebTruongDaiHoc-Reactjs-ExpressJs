import React from 'react';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, renderDataTable, TableHead, TableCell, AdminModal, FormTextBox, FormSelect, getValue } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getDtKhoaDaoTaoPage, createDtKhoaDaoTao } from './redux';
import T from 'view/js/common';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtDmThoiGianDaoTaoAll } from 'modules/mdDaoTao/dtDmThoiGianDaoTao/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DtDmDotTrungTuyen } from 'modules/mdDaoTao/dtDmDotTrungTuyen/redux';
class Modal extends AdminModal {

    onShow = () => {
        this.maKhoa.value('');
        this.he.value('');
        this.thoiGian.value('');
        this.dotTuyenSinh.value('');
        this.namTuyenSinh.value('');
        this.bac.value('');
    }

    onSubmit = () => {
        const data = {
            maKhoa: getValue(this.maKhoa),
            he: getValue(this.he),
            thoiGian: getValue(this.thoiGian),
            namTuyenSinh: getValue(this.namTuyenSinh),
            dotTuyenSinh: getValue(this.dotTuyenSinh),
            bac: getValue(this.bac)
        };
        this.props.create(data, () => {
            this.hide();
        });
    }

    change = () => {
        let he = this.he.value() || '',
            namTuyenSinh = this.namTuyenSinh.value() || '',
            dotTuyenSinh = this.dotTuyenSinh.value() || '';
        if (!dotTuyenSinh) this.maKhoa.value(`${he}${namTuyenSinh}`);
        else this.maKhoa.value(`${he}${namTuyenSinh}-${dotTuyenSinh}`);

    }

    render = () => {
        return this.renderModal({
            title: 'Tạo khóa đào tạo',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.maKhoa = e} label='Mã khoá' readOnly required />

                <FormSelect ref={e => this.he = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình' className='col-md-12' required
                    onChange={() => this.change()} />

                <FormTextBox type='year' ref={e => this.namTuyenSinh = e} className='col-md-6' label='Năm tuyển sinh' required
                    onChange={() => this.change()} />
                <FormSelect ref={e => this.dotTuyenSinh = e} data={SelectAdapter_DtDmDotTrungTuyen} label='Đợt tuyển sinh' className='col-md-6' allowClear
                    onChange={() => this.change()} />

                <FormSelect ref={e => this.bac = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' className='col-md-6' required />
                <FormSelect ref={e => this.thoiGian = e} data={SelectAdapter_DtDmThoiGianDaoTaoAll} label='Thời gian đào tạo' className='col-md-6' required />
            </div>
        });
    }
}

class KhoaDaoTaoPage extends AdminPage {
    state = { filter: {}, sortTerm: 'namTuyenSinh_DESC' }
    defaultSortTerm = 'namTuyenSinh_DESC'
    componentDidMount() {
        T.ready('user/dao-tao', () => {
            this.getPage(undefined, undefined, '');
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtKhoaDaoTaoPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const permission = this.getUserPermission('dtKhoaDaoTao');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtKhoaDaoTao?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: list && list.length > 12 ? true : false,
            data: list,
            renderHead: () => <tr>
                <TableHead content='#' style={{ width: 'auto', textAlign: 'center' }} />
                <TableHead content='Mã khoá' keyCol='maKhoa' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Loại hình đào tạo' keyCol='tenHe' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Năm tuyển sinh' keyCol='namTuyenSinh' style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Bậc đào tạo' keyCol='tenBac' style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Thời gian đào tạo' keyCol='thoiGianDaoTao' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Đợt tuyển sinh' keyCol='dotTS' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} onKeySearch={this.handleKeySearch} onSort={this.onSort} />
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={(pageNumber - 1) * pageSize + index + 1} style={{ whiteSpace: 'nowrap', textAlign: 'right' }} />
                <TableCell content={item.maKhoa} style={{ whiteSpace: 'nowrap', textAlign: 'left' }} />
                <TableCell content={item.tenHe} style={{ whiteSpace: 'nowrap', textAlign: 'left' }} />
                <TableCell content={item.namTuyenSinh} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableCell content={item.tenBac} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableCell content={item.thoiGian} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableCell content={item.dotTuyenSinh} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
            </tr>
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Khoá đào tạo',
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />
                <Modal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtKhoaDaoTao} />
            </>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Khoá đào tạo'
            ],
            backRoute: '/user/dao-tao/data-dictionary',
            onCreate: (e) => e.preventDefault() || this.modal.show()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtKhoaDaoTao: state.daoTao.dtKhoaDaoTao });
const mapActionsToProps = { getDtKhoaDaoTaoPage, createDtKhoaDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(KhoaDaoTaoPage);
