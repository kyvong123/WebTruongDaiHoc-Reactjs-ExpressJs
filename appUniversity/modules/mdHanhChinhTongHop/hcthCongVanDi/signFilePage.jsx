import React from 'react';
import { connect } from 'react-redux';
import {
    getSignFiles
} from './redux/vanBanDiFile';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import CreateSession from './components/createSession';

class SignFilePage extends AdminPage {
    state = { filter: { signType: 'KY_XAC_THUC' }, detail: false, };
    checkBox = {}
    selected = {}

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });

    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    'Danh sách tập tin văn bản đi',
                ],
                backRoute: '/user/hcth',
                baseUrl: '/user/hcth/van-ban-di',
            };
        else
            return {
                readyUrl: '/user/van-phong-dien-tu',
                breadcrumb: [
                    <Link key={0} to='/user/'>...</Link>,
                    <Link key={1} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                    'Danh sách văn bản đi',
                ],
                backRoute: '/user',
                baseUrl: '/user/van-ban-di',
            };
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDi && this.props.hcthCongVanDi.signFiles ? this.props.hcthCongVanDi.signFiles : { pageNumber: 1, pageSize: 50 };
        const pageFilter = isInitial ? { signType: 'KY_XAC_THUC' } : { signType: 'KY_XAC_THUC' };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '');
        });
    };


    checkSelected = () => {
        for (let item of Object.values(this.selected)) {
            if (this.checkBox[item.id] && this.checkBox[item.id].value) {
                this.checkBox[item.id].value(true);
            }
        }
        this.checkSelectAll();
    }

    checkSelectAll = () => {
        if (this.props.hcthCongVanDi?.signFiles?.list?.find(item => !this.checkBox[item.id]?.value())) {
            this.selectAll.value(false);
        } else {
            this.selectAll.value(true);
        }
    }

    onCheck = (value, item) => {
        if (value) {
            this.selected[item.id] = item;
        } else {
            this.selected[item.id] = null;
        }
        this.checkSelectAll();
    }

    onCheckAll = (value) => {
        if (value) {
            this.props.hcthCongVanDi?.signFiles?.list?.map(item => {
                this.checkBox[item.id]?.value(true);
                this.selected[item.id] = item;
            });
        } else {
            this.props.hcthCongVanDi?.signFiles?.list?.forEach(item => {
                this.checkBox[item.id]?.value(false);
                this.selected[item.id] = null;
            });

        }
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getSignFiles(pageN, pageS, pageC, this.state.filter, () => {
            this.setState({ loading: false }, done);
            this.checkSelected();
        });
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa văn bản', 'Bạn có chắc chắn muốn xóa văn bản này?', true,
            isConfirm => isConfirm && this.props.deleteHcthCongVanDi(item.id));
    }

    render() {
        const { baseUrl, breadcrumb, backRoute } = this.getSiteSetting();
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDi && this.props.hcthCongVanDi.signFiles ?
            this.props.hcthCongVanDi.signFiles : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu văn bản đi',
            getDataSource: () => list,
            stickyHead: true,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            style: { maxHeight: '70vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}><FormCheckbox ref={e => this.selectAll = e} onChange={this.onCheckAll} /></th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '20%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Tên văn bản</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Số văn bản</th>
                    <th style={{ width: '80%', verticalAlign: 'middle' }}>Trích yếu</th>
                </tr>),
            renderRow: (item) => {
                return (
                    <tr key={item.R} >
                        <TableCell type='text' style={{ textAlign: 'center' }} content={<FormCheckbox ref={e => this.checkBox[item.id] = e} onChange={value => this.onCheck(value, item)} />} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.R} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.ten} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<Link to={`${baseUrl}/${item.vanBanId}`} target='_blank' rel='noreferrer noopener'>{item.soVanBan || 'Chưa có số văn bản'} </Link>} />
                        <TableCell type='text' contentClassName='multiple-lines' contentStyle={{ width: '100%', minWidth: '250px' }} content={item.trichYeu || ''} />
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-pencil-square-o',
            title: 'Ký xác thực văn bản đi',
            breadcrumb: breadcrumb,
            content: <>
                <div className='tile' style={{}}>
                    <div className='tile-body row'>
                        <div className='col-md-12'>{table}</div>
                    </div>
                </div>
                <CreateSession ref={e => this.createModal = e} baseUrl={baseUrl} />
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />

            </>,
            backRoute: backRoute,
            advanceSearch: <></>,
            onCreate: () => Object.values(this.selected).filter(item => item).length ? this.createModal.show(Object.values(this.selected).filter(item => item).sort((a, b) => a.R - b.R)) : T.notify('Vui lòng chọn ít nhất 1 tập tin văn bản', 'warning')
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi });
const mapActionsToProps = { getSignFiles };
export default connect(mapStateToProps, mapActionsToProps)(SignFilePage);
