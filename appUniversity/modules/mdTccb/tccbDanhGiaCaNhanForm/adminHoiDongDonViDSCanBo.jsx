import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { getTccbHoiDongDonViDanhGiaFormPage } from 'modules/mdTccb/tccbDanhGiaCaNhanForm/redux/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class AdminHoiDongDonViDSCanBo extends AdminPage {
    state = { nam: '', filterDonVi: null, filterLoaiCanBo: 'Tất cả' }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/hoi-dong-danh-gia-don-vi/:nam').parse(window.location.pathname);
            this.setState({ nam: route.nam }, () => {
                this.filterLoaiCanBo.value('Tất cả');
                this.filterDonVi.value(null);
                this.getPage();
            });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.showAdvanceSearch();
        });
    }

    getPage = (pageN, pageS, pageC) => {
        const filter = {
            filterLoaiCanBo: this.filterLoaiCanBo.value(),
            filterDonVi: this.filterDonVi.value()
        };
        this.props.getTccbHoiDongDonViDanhGiaFormPage(pageN, pageS, pageC, this.state.nam, filter, page => {
            T.setTextSearchBox(page.pageCondition || '');
        });
    }

    render() {
        const { nam } = this.state;
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbDanhGiaCaNhanForm && this.props.tccbDanhGiaCaNhanForm.page ?
            this.props.tccbDanhGiaCaNhanForm.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu cán bộ',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngạch</th>
                    <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chức danh</th>
                    <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại cán bộ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let link = '';
                if (item.loaiCanBo == 'Giảng viên và nghiên cứu viên tham gia giảng dạy') {
                    link = `/user/tccb/hoi-dong-danh-gia-giang-day/${nam}/${item.shcc}`;
                }
                if (item.loaiCanBo == 'Nghiên cứu viên không tham gia giảng dạy') {
                    link = `/user/tccb/hoi-dong-danh-gia-khong-giang-day/${nam}/${item.shcc}`;
                }
                if (item.loaiCanBo == 'Chuyên viên') {
                    link = `/user/tccb/hoi-dong-danh-gia-don-vi/${nam}/${item.shcc}`;
                }

                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell content={<>
                            <span>{`${item.ho} ${item.ten}`}<br /></span>
                            {item.shcc}
                        </>} style={{ whiteSpace: 'nowrap' }} type='link' url={link} />
                        <TableCell content={item.tenNgach} />
                        <TableCell content={item.tenChucDanh} />
                        <TableCell content={item.loaiCanBo} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} onEdit={link} />
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/danh-gia-ca-nhan-form'>Đơn vị đánh giá cá nhân</Link>,
                'Danh sách cán bộ'
            ],
            advanceSearch: <div className='row pb-2'>
                <FormSelect label='Loại cán bộ' ref={e => this.filterLoaiCanBo = e} className='col-md-6' data={['Tất cả', 'Giảng viên và nghiên cứu viên tham gia giảng dạy', 'Nghiên cứu viên không tham gia giảng dạy', 'Chuyên viên']} onChange={value => this.setState({ filterLoaiCanBo: value.text }, this.getPage)} />
                <FormSelect label='Đơn vị' ref={e => this.filterDonVi = e} className='col-md-6' data={SelectAdapter_DmDonVi} onChange={value => this.setState({ filterDonVi: value ? value.id : null }, this.getPage)} allowClear />
            </div>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
            </>,
            backRoute: '/user/tccb/danh-gia-ca-nhan-form',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaCaNhanForm: state.tccb.tccbDanhGiaCaNhanForm });
const mapActionsToProps = { getTccbHoiDongDonViDanhGiaFormPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminHoiDongDonViDSCanBo);