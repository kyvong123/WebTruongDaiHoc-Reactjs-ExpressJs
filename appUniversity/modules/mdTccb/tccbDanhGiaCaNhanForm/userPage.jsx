import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaNamAll } from 'modules/mdTccb/tccbDanhGiaNam/redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class UserPage extends AdminPage {
    state = { items: [], mapper: {} }

    componentDidMount() {
        T.ready('/user', () => {
            this.props.getTccbDanhGiaNamAll((items, dmCongViec) => {
                // Mapper không tham gia giảng dạy
                const mapper = {};
                (dmCongViec || []).forEach(congViec => {
                    if (mapper[congViec.nam]) {
                        mapper[congViec.nam].push(...congViec.maChucDanh.split(','));
                    } else {
                        mapper[congViec.nam] = [...congViec.maChucDanh.split(',')];
                    }
                });
                this.setState({ items, mapper });
            });
        });
    }

    render() {
        console.log(this.state.mapper);
        const list = this.state.items;
        const userNgach = this.props.system && this.props.system.user && this.props.system.user.ngach || null;
        let table = renderTable({
            emptyTable: 'Không có dữ liệu năm',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời hạn tự đánh giá</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let link = '';
                if (userNgach == '01.003') {  // Chuyên viên
                    link = `/user/info/danh-gia-chuyen-vien/${item.nam}`;
                } else if (this.state.mapper[item.nam].includes(userNgach)) {
                    link = `/user/info/danh-gia-khong-giang-day/${item.nam}`;
                } else {
                    link = `/user/info/danh-gia-giang-day/${item.nam}`;
                }
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ textAlign: 'center' }} content={item.nam} type='link' url={link} />
                        <TableCell style={{ textAlign: 'center', color: `${Date.now() >= item.caNhanBatDauTuDanhGia && Date.now() <= item.caNhanKetThucTuDanhGia && 'green'}` }} content={item.caNhanBatDauTuDanhGia ? `${T.dateToText(item.caNhanBatDauTuDanhGia, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.caNhanKetThucTuDanhGia, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' onEdit={link} />
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: 'Đánh giá cá nhân',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Đánh giá cá nhân'
            ],
            content: <div className='tile'>{table}</div>,
            backRoute: '/user'
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDanhGiaNamAll };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);