import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { createCongVanTrinhKy, searchCongVanTrinhKy } from './redux';

const { vanBanDi } = require('../constant');



class HcthCongVanTrinhKyUserPage extends AdminPage {

    state = { filter: {} };

    componentDidMount() {
        T.ready('/user', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanTrinhKy && this.props.hcthCongVanTrinhKy.page ? this.props.hcthCongVanTrinhKy.page : { pageNumber: 1, pageSize: 50 };
        let pageFilter = isInitial ? {} : {};
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', () => { });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.searchCongVanTrinhKy(pageN, pageS, pageC, this.state.filter, done);
    }


    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanTrinhKy && this.props.hcthCongVanTrinhKy.page ?
            this.props.hcthCongVanTrinhKy.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        const table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số văn bản</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Trích yếu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian ký</th>
                </tr>;
            },
            renderRow: (item, index) => {
                let signTypeItem = item.signType && vanBanDi.signType[item.signType];
                return <tr key={item.id}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} url={`/user/van-ban-di/${item.congVanId}`} content={item.soCongVan || 'Chưa có số văn bản'} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.trichYeu} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', color: signTypeItem ? signTypeItem.color : 'blue' }} content={signTypeItem?.text} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', color: item.signAt ? 'green' : (item?.vbdStatus == item?.signType) ? 'blue' : 'red' }} content={
                        <>
                            <i className={'fa mr-2 ' + (item.signAt ? 'fa-check-square' : (item?.vbdStatus == item?.signType) ? 'fa-pencil-square-o' : 'fa-clock-o')}></i>
                            <span style={{ fontWeight: 'bold', textAlign: 'center' }}>{item.signAt ? 'Đã ký' : (item?.vbdStatus == item?.signType) ? 'Sẵn sàng' : 'Chưa ký'}</span>
                        </>
                    } />

                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.signAt ? <span style={{ color: 'blue' }}> {T.dateToText(item.signAt, 'dd/mm/yyyy')}</span> : null} />
                </tr>;
            },
        });
        return this.renderPage({
            icon: 'fa fa-pencil-square-o',
            title: 'Văn bản trình ký',
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user/van-phong-dien-tu'
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanTrinhKy: state.hcth.hcthCongVanTrinhKy });
const mapActionsToProps = { createCongVanTrinhKy, searchCongVanTrinhKy };
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanTrinhKyUserPage);
