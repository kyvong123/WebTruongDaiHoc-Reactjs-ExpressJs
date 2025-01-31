import { getDmLoaiDonViAll } from 'modules/mdDanhMuc/dmLoaiDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import CountUp from 'view/js/countUp';
import { createNhiemVu, deleteNhiemVu, getHcthNhiemVuPage, getStatisticPage, searchNhiemVu, updateNhiemVu } from './redux';
const { vaiTro } = require('../constant');

class DashboardIcon extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value)
            setTimeout(() => {
                const endValue = this.props.value ? parseInt(this.props.value) : 0;
                new CountUp(this.valueElement, prevProps.value, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
            }, 100);
    }

    render() {
        let isShow = true;
        if (this.props.isShowValue != undefined) {
            if (this.props.isShowValue == false) isShow = false;
        }
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>
                        {this.props.title}
                    </h4>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class statisticPage extends AdminPage {
    trangThai = {
        READ: { id: 'READ', text: 'Đã đọc', color: 'blue' },
        COMPLETED: { id: 'COMPLETED', text: 'Đã hoàn thành', color: '#149414' }
    }

    state = {
        filter: {},
        isLoading: true
    }

    componentDidMount() {
        T.ready('/user/hcth/nhiem-vu', () => {
            if (this.getUserShcc()) {
                this.canBo?.value(this.getUserShcc());
            }
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthNhiemVu && this.props.hcthNhiemVu.statisticPage ? this.props.hcthNhiemVu.statisticPage : { pageNumber: 1, pageSize: 50 };

        let shccCanBo = this.canBo?.value() || null;

        const pageFilter = isInitial ? { shccCanBo: this.getUserShcc() } : { shccCanBo };

        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                const filter = page.filter || {};
                this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter, isLoading: false });
            });
        });
    }

    getUserShcc = () => this.props.system?.user?.shcc;

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getStatisticPage(pageN, pageS, pageC, this.state.filter, done);
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, totalNhiemVu, totalReadNhiemVu, totalCompletedNhiemVu } = this.props.hcthNhiemVu && this.props.hcthNhiemVu.statisticPage ?
            this.props.hcthNhiemVu.statisticPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        const table = renderTable({
            getDataSource: () => this.props.hcthNhiemVu?.statisticPage?.list,
            emptyTable: 'Chưa có dữ liệu',
            stickyHead: true,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tiêu đề</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Vai trò</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người giao</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                </tr>;
            },
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' contentClassName='multiple-lines' contentStyle={{ width: '100%', minWidth: '300px' }} content={item.tieuDe || 'Chưa có tiêu đề'}
                            onClick={() => window.location.assign(`/user/hcth/nhiem-vu/${item.id}`)} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: vaiTro[item.vaiTro]?.color }} content={vaiTro[item.vaiTro]?.text} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoTenCanBo?.normalizedName()} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: this.trangThai[item.trangThai]?.color }} content={this.trangThai[item.trangThai]?.text || 'Chưa có'} />
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Thống kê nhiệm vụ',
            header: <>
                <FormSelect onChange={() => this.changeAdvancedSearch()} ref={e => this.canBo = e} placeholder='Chọn cán bộ' data={SelectAdapter_FwCanBo} style={{ margin: 0, minWidth: '250px' }} />
            </>,
            content: this.state.isLoading ? loadSpinner() : (<>
                <div className='row'>
                    <div className='col-md-4'>
                        <DashboardIcon type='primary' icon='fa-bars' title='Tổng nhiệm vụ' value={totalNhiemVu || 0} />
                    </div>
                    <div className='col-md-4'>
                        <DashboardIcon type='primary' icon='fa-ban' title='Nhiệm vụ đã đọc' value={totalReadNhiemVu || 0} />
                    </div>
                    <div className='col-md-4'>
                        <DashboardIcon type='primary' icon='fa-list-alt' title='Nhiệm vụ đã hoàn thành' value={totalCompletedNhiemVu || 0} />
                    </div>
                </div>
                <div className="tile">
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>),
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                <Link key={1} to='/user/hcth/nhiem-vu'>Danh sách nhiệm vụ</Link>,
                'Thống kê',
            ],
            backRoute: '/user/hcth/nhiem-vu',
        });
    }

}

const mapStateToProps = state => ({ system: state.system, hcthNhiemVu: state.hcth.hcthNhiemVu });
const mapActionsToProps = { getHcthNhiemVuPage, searchNhiemVu, createNhiemVu, updateNhiemVu, deleteNhiemVu, getDmLoaiDonViAll, getStatisticPage };
export default connect(mapStateToProps, mapActionsToProps)(statisticPage);
