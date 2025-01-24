import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableHead, TableCell } from 'view/component/AdminPage';
import { getAllFormVanBan, updateFormVanBan, createFormVanBan } from './redux';
import EditModal from './editModal';

class FormVanBanPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
        });
        this.getPage();
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getAllFormVanBan(pageN, pageS, pageC, this.state.filter, done);
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    };

    render() {
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
        const permission = this.getUserPermission('formVanBan', ['read', 'write', 'delete', 'manage', 'export']);
        let list = this.props.formVanBan?.items?.data;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list || [],
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Mã' keyCol='ma' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '360px', textAlign: 'center' }} content='Tên' keyCol='ten' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Chú thích' keyCol='chuThich' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Kích hoạt' keyCol='kichHoat' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.chuThich} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={(value) => this.props.updateFormVanBan(item.ma, { kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => (permission.write ? this.editModal.show(item) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))}></TableCell>
                </tr>
            ),
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Form văn bản',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Tổ chức cán bộ
                </Link>,
                'Form văn bản',
            ],
            content: (
                <>
                    <div className='tile'>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='btn-group'>
                                <EditModal ref={(e) => (this.editModal = e)} readOnly={!permission.write} update={this.props.updateFormVanBan} />
                            </div>
                        </div>
                        {table}
                    </div>
                </>
            ),
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? () => this.editModal.show(null) : null,
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, formVanBan: state.tccb.formVanBan });
const mapActionsToProps = { getAllFormVanBan, updateFormVanBan, createFormVanBan };
export default connect(mapStateToProps, mapActionsToProps)(FormVanBanPage);
