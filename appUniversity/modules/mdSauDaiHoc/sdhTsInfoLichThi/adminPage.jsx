import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, getValue } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { FormSelect, FormTextBox, TableHead, FormCheckbox, TableCell, renderDataTable, FormTabs } from 'view/component/AdminPage';
import { createSdhTsDmPhongThi, getSdhDanhSachPhongThiPage, updateSdhTsDmPhongThi, deleteSdhTsDmPhongThi, deleteSdhTsDmPhongThiMultiple } from 'modules/mdSauDaiHoc/sdhTsDmPhongThi/redux';
import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmPhongByCoSo } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import DanhSachNganh from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/danhSachNganh';
import UnSchedledList from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/danhSachTsChuaXep';

import { getDanhSachMonThi, createSdhTsInfoLichThiMultiple, getSdhDanhSachLichThiPage } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/redux';
import DanhSachLichThiPage from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/danhSachPhong';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
class DanhMucPhongThiPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC', listChosen: [], checked: false, isKeySearch: false, isFixCol: false, isCoDinh: false };
    componentDidMount() {
        this.isCoDinh.value(this.state.isCoDinh);
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            this.getPage(undefined, undefined, '');
        });
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }
    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getPage(pageN, pageS, pageC, filter, done);
    }
    callBackParent() {
        if (this.state.listChosen && this.state.listChosen.length) {
            this.props.updateState(false, this.state.listChosen);
        } else this.props.updateState(true, this.state.listChosen);
    }
    onSort = (sortTerm, pageNumber, pageSize, pageCondition) =>
        this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    render() {
        let permission = this.props.permission;
        const { pageNumber, pageSize, pageTotal, totalItem, list } =
            this.props.sdhTsPhongThi && this.props.sdhTsPhongThi.page ?
                this.props.sdhTsPhongThi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu lịch thi',
            stickyHead: this.state.isCoDinh,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list,
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>
                        <FormCheckbox ref={e => this.checkAll = e} onChange={() => this.setState({ checked: !this.state.checked, listChosen: !this.state.checked ? list.filter(item => !item.sbd) : [] }, () => this.callBackParent())} checked={this.state.listChosen != 0 && this.state.listChosen == list.length} />
                    </th>
                    <TableHead keyCol='tenPhong' content='Tên cụm phòng thi' style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead keyCol='phong' content='Phòng' style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead keyCol='coSo' content='Cơ sở' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead keyCol='maxSize' content='Số lượng thí sinh tối đa từng phòng' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onSort={onSort}
                    />
                    <TableHead keyCol='thaoTac' content='Thao tác' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={this.state.listChosen.includes(item)} onChanged={value => {
                        let listChosen = value ? [...this.state.listChosen, item] : this.state.listChosen.filter(i => i.id != item.id);
                        listChosen.length == list.length ? this.setState({ listChosen, checked: true }, () => { this.checkAll.value(this.state.checked); this.callBackParent(); }) : this.setState({ listChosen, checked: false }, () => { this.checkAll.value(this.state.checked); this.callBackParent(); });
                    }} permission={permission} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.tenPhong} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.phong} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.coSo} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.maxSize} />
                    <TableCell type='buttons' permission={permission} content={item} onEdit={e => e.preventDefault() || this.props.modal.show(item)} onDelete={e => e.preventDefault() || this.props.delete(item.id, this.props.idDot)} />
                </tr>
            )
        });
        return <>
            <div style={{ marginBottom: '10px' }}>
                Kết quả: {<b>{totalItem}</b>} tổ hợp phòng thi
            </div>
            <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                <div className='title'>
                    <div style={{ gap: 10, display: 'inline-flex' }}>
                        <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                        <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                        <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                        <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                    </div>
                    <div style={{ gap: 10, display: this.state.listChosen.length ? 'flex' : 'none' }}>
                        <Tooltip title={`Xoá ${this.state.listChosen.length} thí sinh`} arrow>
                            <button className='btn btn-danger' type='button' onClick={() => this.props.deleteMultiple(this.state.listChosen, this.props.idDot)}>
                                <i className='fa fa-sm fa-trash' />
                            </button>
                        </Tooltip>
                    </div>
                </div>
                <div style={{ gap: 10 }} className='btn-group'>
                    <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                        getPage={this.getPage} />
                </div>
            </div>
            {table}
            <div style={{ textAlign: 'right' }}>
                <button className='btn btn-primary' type='button' onClick={() => this.props.modal.show()} disabled={!permission.write}>
                    <i className='fa fa-fw fa-lg fa-plus' />Tạo mới
                </button>
            </div>
        </>;
    }
}

class SdhThemPhongThiModal extends AdminModal {
    state = {};
    componentDidMount() {
        this.onHidden(this.onHide);
    }
    onHide = () => {
        this.setState({ id: null });
    }
    onShow = (item) => {
        const { tenPhong, phong, maxSize, coSo } = item ? item : { tenPhong: '', phong: '', coSo: '', maxSize: '' };
        this.tenPhong.value(tenPhong);
        this.coSo.value(coSo);
        this.phong.value(phong ? phong.split(',') : []);
        this.sucChua.value(maxSize);
        item && item.id ? this.setState({ id: item.id, phong: phong }) : null;
    }
    setVal = (value) => {
        this.coSo.value(value.id);
        this.setState({ coSo: value.id }, () => this.phong.value([]));
    }
    onSubmit = (e) => {
        e && e.preventDefault();
        let data = {
            tenPhong: getValue(this.tenPhong),
            phong: getValue(this.phong),
            coSo: this.state.coSo,
            maxSize: getValue(this.sucChua),
            idDot: this.props.idDot
        };
        if (Number(data.maxSize) >= this.state.sucChua ? Number(this.state.sucChua) : 0) {
            T.notify('Số lượng thí sinh vượt sức chứa của phòng', 'danger');
        } else {
            if (this.state.id) {
                data.phongCu = this.state.phong;
                this.props.update(this.state.id, data, this.props.idDot);
            } else this.props.create(data, this.props.idDot, item => this.setState({ phong: item.phong }));
            this.hide();
        }
    }
    render = () => {
        const permission = this.props.permission;
        return this.renderModal({
            title: this.state.id ? 'Chỉnh sửa thông tin lịch thi tuyển sinh' : 'Thêm lịch thi tuyển sinh',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' ref={e => this.tenPhong = e} label='Tên cụm phòng thi' className='col-md-12' readOnly={!permission.write} required />
                <FormSelect ref={e => this.coSo = e} label='Cơ sở' className='col-md-6' readOnly={!permission.write} onChange={value => this.setVal(value)} data={SelectAdapter_DmCoSo} required />
                <FormSelect multiple ref={e => this.phong = e} label='Phòng thi' className='col-md-6' readOnly={!permission.write} data={SelectAdapter_DmPhongByCoSo(this.state.coSo ? this.state.coSo : null)} required />
                <FormTextBox type='number' ref={e => this.sucChua = e} label='Số lượng thí sinh tối đa từng phòng' className='col-md-12' readOnly={!permission.write} required />
            </div>
        });
    }
}

class SdhTuyenSinhCaThi extends AdminPage {
    state = { col: true, dataPhong: [], colThiSinh: true };
    tabs = 1;
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.setState({ idDot: data.id });
                } else {
                    this.props.history.push('/user/sau-dai-hoc/dot-tuyen-sinh');
                }
            });
        });
    }
    updateState = (newValue, dataPhong) => {
        this.setState({ col: newValue, dataPhong });
    }
    updateStateThiSinh = (newValue, dataPhongDayDu) => {
        this.setState({ colThiSinh: newValue, dataPhongDayDu });
    }
    setVal = (value) => {
        this.nganh.value(value.id);
        this.setState({ selectedNganh: value.id, idSelectedNganh: value.idNganh }, () => this.monThi ? this.monThi.value(null) : null);
    }
    callBackChangeTabs = (idTab) => {
        this.danhSachLichThi.getPage(undefined, undefined, '');
        this.tabs.tabClick(null, idTab);
    }
    render() {
        const permission = this.getUserPermission('sdhTuyenSinhLichThi', ['read', 'write', 'delete']);
        const cauHinhPhongThi = {
            id: 1, title: 'Cấu hình phòng thi', component: <>
                <SdhThemPhongThiModal ref={e => this.sdhThemPhongThiModal = e
                } idDot={this.state.idDot} create={this.props.createSdhTsDmPhongThi} update={this.props.updateSdhTsDmPhongThi} permission={permission} />
                <div className='title'>
                    <div className='row'>
                        <div className='col-md-12' >
                            <div className='tile'>
                                <h4> Danh mục phòng thi </h4>
                                <div className='tile-body'>
                                    {this.state.idDot ? <DanhMucPhongThiPage col={this.state.col} updateState={this.updateState} getPage={this.props.getSdhDanhSachPhongThiPage} history={this.props.history} idDot={this.state.idDot} sdhTsPhongThi={this.props.sdhTsPhongThi ? this.props.sdhTsPhongThi : null} modal={this.sdhThemPhongThiModal} delete={this.props.deleteSdhTsDmPhongThi} deleteMultiple={this.props.deleteSdhTsDmPhongThiMultiple} permission={permission} /> : null}
                                </div>
                            </div>
                        </div>
                        <div className='col-md-12' style={this.state.col ? { display: 'none' } : null}>
                            <div className='tile'>
                                <h4> Danh sách ngành </h4>
                                <div className='tile-body'>
                                    {this.state.idDot ? <DanhSachNganh ref={e => this.danhSachNganh = e} callBackChangeTabs={this.callBackChangeTabs} idDot={this.state.idDot} listPhong={this.state.dataPhong ? this.state.dataPhong : []} modal={this.sdhTsTaoPhongThiModal} permission={permission} /> : null}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </>
        };

        const danhSachPhongThi = {
            id: 2, title: 'Danh sách phòng thi', component: <>
                <div className='title'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className='tile'>
                                <h4> Danh sách phòng thi </h4>
                                <div className='tile-body'>
                                    {this.state.idDot ? <DanhSachLichThiPage ref={e => this.danhSachLichThi = e} updateState={this.updateStateThiSinh} idDot={this.state.idDot} sdhTsLichThi={this.props.sdhTsLichThi ? this.props.sdhTsLichThi : null} permission={permission} /> : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        };
        const danhSachTsChuaXep = {
            id: 3, title: 'Danh sách thí sinh chưa xếp lịch thi', component: <>
                <div className='title'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className='tile'>
                                <h4> Danh sách thí sinh chưa xếp lịch thi</h4>
                                <div className='tile-body'>
                                    {this.state.idDot ? <UnSchedledList ref={e => this.danhSachTsChuaXep = e} idDot={this.state.idDot} permission={permission} callBackChangeTabs={this.callBackChangeTabs} /> : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        };
        const tabs = [cauHinhPhongThi, danhSachPhongThi, danhSachTsChuaXep];
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Cấu hình lịch thi tuyển sinh',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Lịch thi'
            ],
            content: <>
                <FormTabs ref={e => this.tabs = e} tabs={tabs} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhTsPhongThi: state.sdh.sdhTsPhongThi, sdhTsLichThi: state.sdh.sdhTsLichThi });
const mapActionsToProps = {
    getSdhTsProcessingDot, createSdhTsDmPhongThi, getSdhDanhSachPhongThiPage, updateSdhTsDmPhongThi, deleteSdhTsDmPhongThi, deleteSdhTsDmPhongThiMultiple, getDanhSachMonThi, createSdhTsInfoLichThiMultiple, getSdhDanhSachLichThiPage
};
export default connect(mapStateToProps, mapActionsToProps)(SdhTuyenSinhCaThi);
