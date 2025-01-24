import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaCaNhanFormPage } from './redux/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';

class TccbDanhGiaPheDuyetTruongDetails extends AdminPage {
    state = { nam: '', filterLoaiCanBo: 'Tất cả' }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia-ca-nhan-form/:nam');
            const nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.setState({ nam });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage();
            this.filterLoaiCanBo.value('Tất cả');
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        const filter = {
            filterLoaiCanBo: this.state.filterLoaiCanBo
        };
        this.props.getTccbDanhGiaCaNhanFormPage(pageN, pageS, pageC, filter, done);
    }

    render() {
        const { nam } = this.state;
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list, tenDonVi } = this.props.tccbDanhGiaCaNhanForm && this.props.tccbDanhGiaCaNhanForm.page ?
            this.props.tccbDanhGiaCaNhanForm.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [], tenDonVi: '' };
        let table = renderTable({
            emptyTable: 'Không có dữ cán bộ',
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
                    link = `/user/tccb/danh-gia-giang-day/${nam}/${item.shcc}`;
                }
                if (item.loaiCanBo == 'Nghiên cứu viên không tham gia giảng dạy') {
                    link = `/user/tccb/danh-gia-khong-giang-day/${nam}/${item.shcc}`;
                }
                if (item.loaiCanBo == 'Chuyên viên') {
                    link = `/user/tccb/danh-gia-chuyen-vien/${nam}/${item.shcc}`;
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
            title: `Danh sách cán bộ: ${tenDonVi}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/danh-gia-ca-nhan-form'>Đơn vị đánh giá cá nhân</Link>,
                `Danh sách cán bộ: ${tenDonVi}`
            ],
            content: <>
                <div className='tile'>
                    <div className='d-flex flex-row'>
                        <FormSelect style={{ width: '300px' }} className='p-2' placeholder='Loại cán bộ' ref={e => this.filterLoaiCanBo = e} data={['Tất cả', 'Giảng viên và nghiên cứu viên tham gia giảng dạy', 'Nghiên cứu viên không tham gia giảng dạy', 'Chuyên viên']} onChange={value => this.setState({ filterLoaiCanBo: value.text }, this.getPage)} />
                    </div>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user/tccb/danh-gia-ca-nhan-form',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaCaNhanForm: state.tccb.tccbDanhGiaCaNhanForm });
const mapActionsToProps = { getTccbDanhGiaCaNhanFormPage };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaPheDuyetTruongDetails);