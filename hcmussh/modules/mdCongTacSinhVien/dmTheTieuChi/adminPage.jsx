import React from 'react';
import { connect } from 'react-redux';
import { getDmTheTieuChiPage, createDmTheTieuChi, updateDmTheTieuChi, deleteDmTheTieuChi } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue, FormRichTextBox } from 'view/component/AdminPage';

class TheTieuChiModal extends AdminModal {
    onShow = (item) => {
        const { ma = '', ten = '', ghiChu = '', kichHoat } = item || {};
        this.setState({ ma, ten, ghiChu, kichHoat });
        this.ma.value(ma);
        this.ten.value(ten);
        this.ghiChu.value(ghiChu);
    };

    onSubmit = () => {
        let ma = getValue(this.ma),
            ten = getValue(this.ten),
            ghiChu = getValue(this.ghiChu);
        this.state.ma ? this.props.update(this.state.ma, { ten, ghiChu }) : this.props.create(ma, ten, ghiChu);
        this.hide();
    };


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật thẻ tiêu chí' : 'Tạo mới thẻ tiêu chí',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox className='col-md-12' ref={e => this.ten = e} label='Tên' required />
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class DmTheTieuChi extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.getData(null, null, null);
        });
    }

    getData = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getDmTheTieuChiPage(pageNumber, pageSize, pageCondition, done);
    }

    delete = (item) => {
        T.confirm('Xóa thẻ tiêu chí', 'Bạn có chắc bạn muốn xóa thẻ tiêu chí này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTheTieuChi(item.ma));
    };

    handleKichHoat = (item, value) => {
        let { ma } = item;
        this.props.updateDmTheTieuChi(ma, { ...item, kichHoat: value });
    }

    create = (ten, ghiChu) => {
        this.props.createDmTheTieuChi(ten, ghiChu);
    }

    render() {
        const permission = this.getUserPermission('dmTheTieuChi');
        let { pageNumber, pageSize, pageTotal, pageCondition, page = null } = this.props.dmTheTieuChi || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục thẻ tiêu chí',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh mục thẻ tiêu chí'
            ],
            content: <div className='tile'>
                {renderTable({
                    getDataSource: () => page || [],
                    emptyTable: 'Chưa có thẻ tiêu chí',
                    renderHead: () => (
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '35%' }}>Tên</th>
                            <th style={{ width: '65%' }}>Ghi chú</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    ), renderRow: (item, index) => {
                        return <tr key={index}>
                            <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell content={item.ma} />
                            <TableCell content={item.ten} />
                            <TableCell content={item.ghiChu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} type='checkbox' content={item.kichHoat} permission={permission} onChanged={value => this.handleKichHoat(item, value)} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' permission={permission}
                                onEdit={() => this.modal.show(item)}
                                onDelete={() => this.delete(item)}
                            // onDelete={() => this.delete(item.ma)} 
                            />
                        </tr>;
                    }
                })}
                <TheTieuChiModal ref={e => this.modal = e} update={this.props.updateDmTheTieuChi} create={this.props.createDmTheTieuChi} />
                <div style={{ marginBottom: '10px' }}>
                    <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageCondition, pageTotal }} getPage={this.props.getDmTheTieuChiPage} />
                </div>
            </div>,
            backRoute: '/user/ctsv/tu-dien-du-lieu',
            onCreate: () => permission.write && this.modal.show(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTheTieuChi: state.ctsv.dmTheTieuChi });
const mapActionsToProps = {
    getDmTheTieuChiPage, createDmTheTieuChi, updateDmTheTieuChi, deleteDmTheTieuChi
};
export default connect(mapStateToProps, mapActionsToProps)(DmTheTieuChi);