import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, FormTabs, renderTable, TableCell, AdminModal, FormTextBox, getValue } from 'view/component/AdminPage';
import { getTccbCapEmailCanBoPage, xacNhanEmail } from './redux';
import { Tooltip } from '@mui/material';

class XacNhanCapEmail extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item) => {
        this.setState({ ...item }, () => {
            this.emailTruong.value(item.emailTruongSuggest || '');
        });
    }

    onSubmit = () => {
        const emailTruong = getValue(this.emailTruong);
        T.confirm('Thông báo', `Email ${emailTruong} sẽ được cấp cho cán bộ có MSCB ${this.state.mscb}`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.setState({ isSubmitting: true }, () => {
                    this.props.xacNhan(this.state.id, emailTruong, () => {
                        this.hide();
                        this.setState({ isSubmitting: false });
                        T.alert('Cấp email trường cho cán bộ thành công', 'success', false, 800);
                    });
                });
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: `Cấp email cán bộ - ${this.state.mscb}`,
            isLoading: this.state.isSubmitting,
            size: 'large',
            body: <div className='row'>
                <FormTextBox disabled={this.state.isSubmitting} className='col-md-12' ref={e => this.emailTruong = e} label='Email trường (đã cấp cho cán bộ)' />
            </div>
        });
    }
}

class tccbCapMaCanBoAdminPageEmail extends AdminPage {
    state = { filter: { checkEmail: 'CHUA_CAP' } }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
            this.getPage(undefined, undefined, '');
            this.tabPage.tabClick(null, 0);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTccbCapEmailCanBoPage(pageN, pageS, pageC, this.state.filter, done);
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbCapEmailCanBo && this.props.tccbCapEmailCanBo.page ?
            this.props.tccbCapEmailCanBo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, listTotalItem: [], list: [] };

        const mapTrangThai = {
            CHUA_CAP: 'Chưa cấp email',
            DA_CAP: 'Đã cấp email',
        };

        const renderTabs = (data) => <div className='tile'>{table(data)}</div>;

        const table = (data) => renderTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => data,
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã số cán bộ</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ và tên</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>{this.state.filter.checkEmail == 'CHUA_CAP' ? 'Email đề xuất' : 'Email'}</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại cán bộ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mscb || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hoVaTen?.toUpperCase()} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.emailTruong || item.emailTruongSuggest} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.loaiCanBo} />
                    <TableCell type='buttons' content={item}>
                        {this.state.filter.checkEmail == 'CHUA_CAP' &&
                            <Tooltip title='Xác nhận cấp email' arrow>
                                <button className='btn btn-success' onClick={e => e.preventDefault() || this.xacNhanEmail.show(item)}><i className='fa fa-lg fa-reply-all' content={item} /></button>
                            </Tooltip>
                        }
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Cấp email cán bộ',
            breadcrumb: [
                'Cấp email cán bộ'
            ],
            content: <>
                <FormTabs contentClassName='tile-body' ref={e => this.tabPage = e} onChange={tab => this.setState({ filter: { ...this.state.filter, checkEmail: Object.keys(mapTrangThai)[tab.tabIndex] } }, () => this.getPage())} tabs={Object.keys(mapTrangThai).map(item => {
                    const listData = list;
                    return Object({ title: <> {mapTrangThai[item]} </>, component: renderTabs(listData) });
                })} />
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                <XacNhanCapEmail ref={e => this.xacNhanEmail = e} xacNhan={this.props.xacNhanEmail} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbCapEmailCanBo: state.tccb.tccbCapEmailCanBo });
const mapActionsToProps = { getTccbCapEmailCanBoPage, xacNhanEmail };
export default connect(mapStateToProps, mapActionsToProps)(tccbCapMaCanBoAdminPageEmail);