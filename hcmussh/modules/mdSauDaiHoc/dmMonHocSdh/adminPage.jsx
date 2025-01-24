import React from 'react';
import { connect } from 'react-redux';
import { createDmMonHocSdh, getDmMonHocSdhPage, updateDmMonHocSdh, deleteDmMonHocSdh } from './redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_DmKhoaSdh, getDmKhoaSdhAll } from 'modules/mdSauDaiHoc/dmKhoaSauDaiHoc/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.tenTiengViet.focus();
        }));
    }

    onShow = (item) => {
        const { ma, tenTiengViet, tenTiengAnh, kichHoat, tcLyThuyet, tcThucHanh, khoaSdh } = item ? item : { ma: '', tenTiengViet: '', tenTiengAnh: '', tcLyThuyet: '', tcThucHanh: '', kichHoat: 1, khoaSdh: '' };
        this.setState({ ma: ma, item });
        this.ma.value(ma);
        this.tenTiengViet.value(tenTiengViet);
        this.tenTiengAnh.value(tenTiengAnh || '');
        this.tcLyThuyet.value(tcLyThuyet || 0);
        this.tcThucHanh.value(tcThucHanh || 0);
        this.kichHoat.value(kichHoat);
        this.khoaSdh.value(khoaSdh);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            tenTiengViet: getValue(this.tenTiengViet),
            tenTiengAnh: getValue(this.tenTiengAnh),
            tcLyThuyet: getValue(this.tcLyThuyet),
            tcThucHanh: getValue(this.tcThucHanh),
            kichHoat: getValue(this.kichHoat) ? 1 : 0,
            khoaSdh: getValue(this.khoaSdh)
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    }

    changeKichHoat = value => this.kichHoat.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật môn học cũ (trước 2022)' : 'Tạo mới môn học cũ (trước 2022)',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-6' ref={e => this.ma = e} label='Mã môn học' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox className='col-md-12' ref={e => this.tenTiengViet = e} label='Tên tiếng Việt' readOnly={readOnly} required />
                <FormTextBox className='col-md-12' ref={e => this.tenTiengAnh = e} label='Tên tiếng Anh' readOnly={readOnly} />
                <FormTextBox type='number' className='col-md-3' ref={e => this.tcLyThuyet = e} label='Tín chỉ lý thuyết' readOnly={readOnly} required />
                <FormTextBox type='number' className='col-md-3' ref={e => this.tcThucHanh = e} label='Tín chỉ thực hành' readOnly={readOnly} required />
                <FormSelect ref={e => this.khoaSdh = e} className='col-md-6' data={SelectAdapter_DmKhoaSdh} label='Khoa phụ trách' readOnly={readOnly} required />
            </div>
        });
    }
}

class DmMonHocSdhPage extends AdminPage {
    state = { dmKhoaSdh: {}, ma: '', khoaSdh: '', tenTiengViet: '', tenTiengAnh: '' };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getDmKhoaSdhAll(items => {
                this.props.getDmMonHocSdhPage();
                let dmKhoaSdh = {};
                items.forEach(item => dmKhoaSdh[item.ma] = item.ten);
                this.setState({ dmKhoaSdh });
            });
            T.onSearch = (searchText) => this.props.getDmMonHocSdhPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.khoaSdh.value('');
                this.ma.value('');
                this.tenTiengViet.value('');
                this.tenTiengAnh.value('');
                this.props.getDmMonHocSdhPage();
            });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmMonHocSdh(item.ma, { kichHoat: item.kichHoat });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục môn học cũ (trước 2022)', 'Bạn có chắc bạn muốn xóa môn học này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMonHocSdh(item.ma));
    }

    searchAdvance = () => {
        const advance = {
            ma: getValue(this.ma),
            khoaSdh: getValue(this.khoaSdh),
            tenTiengViet: getValue(this.tenTiengViet),
            tenTiengAnh: getValue(this.tenTiengAnh)
        };
        this.props.getDmMonHocSdhPage(undefined, undefined, '', undefined, advance);
    }

    render() {
        const permission = this.getUserPermission('dmMonHocSdh', ['manage', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmMonHocSdh && this.props.dmMonHocSdh.page ?
            this.props.dmMonHocSdh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = renderTable({
            getDataSource: () => list, stickyHead: true,
            emptyTable: 'Không có danh sách môn học cũ (trước 2022)!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>STT</th>
                    <th style={{ width: 'auto', textAlign: 'right' }}>Mã</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên tiếng Việt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên tiếng Anh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>TC Lý thuyết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>TC Thực hành</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell content={item.tenTiengViet ? item.tenTiengViet : ''} />
                    <TableCell content={item.tenTiengAnh ? item.tenTiengAnh : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tcLyThuyet ? item.tcLyThuyet : '0'} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tcThucHanh ? item.tcThucHanh : '0'} />
                    <TableCell content={item.khoaSdh ? this.state.dmKhoaSdh[item.khoaSdh] : ''} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmMonHocSdh(item.ma, { kichHoat: Number(value) })} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục môn học cũ (trước 2022)',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                'Môn học cũ (trước 2022)'
            ],
            advanceSearch: <>
                {permission.manage && <div className='row'>
                    <FormSelect ref={e => this.khoaSdh = e} className='col-md-3' data={SelectAdapter_DmKhoaSdh} label='Khoa phụ trách' onChange={value => {
                        this.setState({ khoaSdh: value?.id });
                        this.searchAdvance();
                    }} allowClear />
                    <FormTextBox ref={e => this.ma = e} className='col-md-3' label="Mã" onChange={value => {
                        this.setState({ ma: value.target.value });
                        this.searchAdvance();
                    }} />
                    <FormTextBox ref={e => this.tenTiengViet = e} className='col-md-3' label="Tên Tiếng Việt" onChange={value => {
                        this.setState({ tenTiengViet: value.target.value });
                        this.searchAdvance();
                    }} />
                    <FormTextBox ref={e => this.tenTiengAnh = e} className='col-md-3' label="Tên Tiếng Anh" onChange={value => {
                        this.setState({ tenTiengAnh: value.target.value });
                        this.searchAdvance();
                    }} />
                </div>}
            </>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmMonHocSdhPage} style={{ marginLeft: '65px' }} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmMonHocSdh} update={this.props.updateDmMonHocSdh}
                    readOnly={!permission.write} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/sau-dai-hoc/mon-hoc/upload') : null,
            onExport: () => T.download(T.url(`/api/sdh/mon-hoc/download-danh-sach?ma=${this.state.ma}&khoaSdh=${this.state.khoaSdh}&tenTiengViet=${this.state.tenTiengViet}&tenTiengAnh=${this.state.tenTiengAnh}`)),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmMonHocSdh: state.sdh.dmMonHocSdh });
const mapActionsToProps = { createDmMonHocSdh, getDmMonHocSdhPage, updateDmMonHocSdh, deleteDmMonHocSdh, getDmKhoaSdhAll };
export default connect(mapStateToProps, mapActionsToProps)(DmMonHocSdhPage);