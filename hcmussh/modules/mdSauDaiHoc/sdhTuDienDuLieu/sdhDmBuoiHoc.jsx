import React from 'react';
import { connect } from 'react-redux';
import { getDtDmBuoiHocAll, deleteDtDmBuoiHoc, createDtDmBuoiHoc, updateDtDmBuoiHoc } from 'modules/mdDaoTao/dtDmBuoiHoc/redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });
    }
    onShow = (item) => {
        let { id, ten, kichHoat, loaiHinh } = item ? item : { id: null, ten: '', kichHoat: 1, loaiHinh: '' };
        this.setState({ id, ten, item });
        this.ten.value(ten);
        this.loaiHinh.value(loaiHinh.split(','));
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            loaiHinh: getValue(this.loaiHinh).join(','),
            kichHoat: Number(getValue(this.kichHoat))
        };
        this.state.ten ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ten ? 'Cập nhật buổi học' : 'Tạo mới buổi học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-6' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormSelect ref={e => this.loaiHinh = e} label='Hệ đào tạo' readOnly={readOnly} data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} className='col-6' multiple />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} required />
            </div>
        }
        );
    };
}

class SdhDmBuoiHocPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getDtDmBuoiHocAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa Buổi học', `Bạn có chắc bạn muốn xóa Buổi học ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteDtDmBuoiHoc(item.id);
        });
    }

    render() {
        const permission = this.getUserPermission('dtDmBuoiHoc');
        let list = this.props.dtDmBuoiHoc && this.props.dtDmBuoiHoc.items ? this.props.dtDmBuoiHoc.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu Buổi học!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%' }}>Tên</th>
                    <th style={{ width: '80%' }}>Hệ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.tenLoaiHinh.join(', ')} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateDtDmBuoiHoc(item.id, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Buổi học',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/data-dictionary'>Từ điển dữ liệu</Link>,
                'Buổi học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtDmBuoiHoc} update={this.props.updateDtDmBuoiHoc} />
            </>,
            backRoute: '/user/sau-dai-hoc/data-dictionary',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }


}

const mapStateToProps = state => ({ system: state.system, dtDmBuoiHoc: state.daoTao.dtDmBuoiHoc, sdhDmBuoiHoc: state.sdhDmBuoiHoc });
const mapActionsToProps = { getDtDmBuoiHocAll, deleteDtDmBuoiHoc, createDtDmBuoiHoc, updateDtDmBuoiHoc };
export default connect(mapStateToProps, mapActionsToProps)(SdhDmBuoiHocPage);