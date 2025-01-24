import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, getValue } from 'view/component/AdminPage';
import { getPageDmDaiHoc, getDmDaiHoc, createDmDaiHoc, updateDmDaiHoc, deleteDmDaiHoc } from './redux';
import Pagination from 'view/component/Pagination';




class DaiHocModal extends AdminModal {
    onShow = (item) => {
        const { ma = '', tenTruong = '' } = item || {};
        this.setState({ ma, item });
        this.ma.value(ma);
        this.tenTruong.value(tenTruong || '');
    }

    onSubmit = () => {
        const data = {
            tenTruong: getValue(this.tenTruong)
        };
        this.state.ma ? this.props.update(this.state.ma, data, this.hide()) : this.props.create(data, this.hide());
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật dữ liệu đại học' : 'Tạo dữ liệu đại học',
            body: <div className="row">
                <FormTextBox ref={e => this.ma = e} className='col-md-12' label='Mã' readOnly />
                <FormTextBox ref={e => this.tenTruong = e} className='col-md-12' label='Tên trường' required readOnly={readOnly} />
            </div>
        });
    }
}


class AdminDaiHocPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getPageDmDaiHoc();
        });
    }

    handleDelete = (ma) => {
        T.confirm('Xóa dữ liệu đại học', 'Bạn có chắc muốn xóa dữ liệu đại học này?', isConfirmed => isConfirmed && this.props.deleteDmDaiHoc(ma));
    }
    downloadExcel = () => {
        T.notify('Danh sách sẽ được tải xuống sau vài giây', 'info');
        T.download('/api/ctsv/dm-dai-hoc/export-excel');
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal } = this.props.dmDaiHoc?.page || {},
            list = this.props.dmDaiHoc?.page?.list || [],
            permission = this.getUserPermission('ctsvDaiHoc');
        return this.renderPage({
            title: 'Danh mục đại học',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh mục đại học'
            ],
            content:
                <div className="tile">
                    {renderTable({
                        getDataSource: () => list,
                        renderHead: () => (<tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên trường</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>),
                        renderRow: (item, index) =>
                        (<tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTruong} />
                            <TableCell type='checkbox' style={{ whiteSpace: 'nowrap' }} content={item.kichHoat ? 1 : 0} permission={permission} onChanged={value => this.props.updateDmDaiHoc(item.ma, { kichHoat: value })} />
                            <TableCell type='buttons' style={{ width: 'auto', whiteSpace: 'nowrap' }} permission={permission} onEdit={() => this.modal.show(item)} onDelete={() => this.handleDelete(item.ma)} />
                        </tr>)
                    })}
                    <Pagination {...{ pageNumber, pageSize, pageCondition, pageTotal }} getPage={this.props.getPageDmDaiHoc} />
                    <DaiHocModal ref={e => this.modal = e} create={this.props.createDmDaiHoc} update={this.props.updateDmDaiHoc} readOnly={!permission.write} />
                </div>,

            onCreate: () => permission.write && this.modal.show(),
            onExport: () => this.downloadExcel(),
            
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dmDaiHoc: state.ctsv.dmDaiHoc });
const mapActionsToProps = {
    getPageDmDaiHoc, getDmDaiHoc, createDmDaiHoc, updateDmDaiHoc, deleteDmDaiHoc
};

export default connect(mapStateToProps, mapActionsToProps)(AdminDaiHocPage);