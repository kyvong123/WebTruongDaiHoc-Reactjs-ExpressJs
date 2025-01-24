import React from 'react';
import { connect } from 'react-redux';
import { createDmMonHocSdhMoi, getDmMonHocSdhMoiPage, updateDmMonHocSdhMoi, deleteDmMonHocSdhMoi, updateKhoaDmMonHocSdhMoi } from './redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_DmKhoaSdh, getDmKhoaSdhAll } from 'modules/mdSauDaiHoc/dmKhoaSauDaiHoc/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, FormTextBox, FormCheckbox, FormSelect, getValue, renderDataTable, TableHead, renderTable } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';


class EditKhoaModal extends AdminModal {
    state = { listMonHoc: [] };

    componentDidMount = () => {
        this.onHidden(() => {
            this.setState({ listMonHoc: [] }, () => this.khoaSdhMoi.value(''));
        });
    }

    onShow = (list) => {
        this.setState({ listMonHoc: list });
    };

    delete = (e, item) => {
        e.preventDefault();
        let { listMonHoc } = this.state;
        listMonHoc = listMonHoc.filter(mh => mh.ma != item.ma);
        this.setState({ listMonHoc });
    }

    monHocTable = (list) => renderTable({
        getDataSource: () => list,
        header: 'thead-light',
        stickyHead: list.length > 8,
        divStyle: { height: '50vh' },
        renderHead: () => <tr>
            <TableHead content='#' style={{ width: 'auto' }} />
            <TableHead content='Mã' style={{ width: '10%' }} />
            <TableHead content='Tên' style={{ width: '65%' }} />
            <TableHead content='Khoa/Bộ môn' style={{ width: '25%' }} />
            <TableHead content='Thao tác' style={{ width: 'auto' }} />
        </tr>,
        renderRow: (item, index) => <tr key={item.ma}>
            <TableCell content={index + 1} style={{ textAlign: 'right' }} />
            <TableCell content={item.ma} />
            <TableCell content={item.tenTiengViet} nowrap />
            <TableCell content={item.tenKhoa} nowrap />
            <TableCell content={item} type='buttons' permission={this.props.permission} onDelete={this.delete} />
        </tr>
    })

    onSubmit = (e) => {
        e.preventDefault();
        let { listMonHoc } = this.state,
            listMa = listMonHoc.map(item => item.ma),
            khoaSdh = getValue(this.khoaSdhMoi);
        this.setState({ isLoading: true }, () => {
            this.props.update(listMa.join(', '), khoaSdh, () => this.setState({ isLoading: false }, () => this.hide() || this.props.reset()));
        });
    }

    render = () => {
        let { listMonHoc, isLoading } = this.state;
        return this.renderModal({
            title: 'Cập nhật Khoa/Bộ môn',
            size: 'large',
            isShowSubmit: !!this.state.listMonHoc.length,
            isLoading,
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.khoaSdhMoi = e} data={SelectAdapter_DmKhoaSdh} label='Khoa/Bộ môn mới' required />
                <div className='col-md-12'>
                    {!!this.state.listMonHoc.length && this.monHocTable(listMonHoc)}
                </div>
            </div>
        });
    }
}
class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.tenTiengViet.focus();
        }));
    }

    onShow = (item) => {
        const { ma, tenTiengViet, tenTiengAnh, kichHoat, tcLyThuyet, tcThucHanh, khoa } = item ? item : { ma: '', tenTiengViet: '', tenTiengAnh: '', tcLyThuyet: '', tcThucHanh: '', kichHoat: 1, khoa: '' };
        this.setState({ ma: ma, item });
        this.ma.value(ma);
        this.tenTiengViet.value(tenTiengViet);
        this.tenTiengAnh.value(tenTiengAnh || '');
        this.tcLyThuyet.value(tcLyThuyet || 0);
        this.tcThucHanh.value(tcThucHanh || 0);
        this.kichHoat.value(kichHoat);
        this.khoaSdh.value(khoa);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            tenTiengViet: getValue(this.tenTiengViet),
            tenTiengAnh: getValue(this.tenTiengAnh),
            tcLyThuyet: getValue(this.tcLyThuyet),
            tcThucHanh: getValue(this.tcThucHanh),
            tietLt: getValue(this.tcLyThuyet) * 15,
            tietTh: getValue(this.tcThucHanh) * 15,
            tongTiet: getValue(this.tcLyThuyet) * 15 + getValue(this.tcThucHanh) * 15,
            tongTC: getValue(this.tcLyThuyet) + getValue(this.tcThucHanh),
            kichHoat: getValue(this.kichHoat),
            khoaSdh: getValue(this.khoaSdh)
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    }

    changeKichHoat = value => this.kichHoat.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật môn học mới (sau 2022)' : 'Tạo mới môn học mới (sau 2022)',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-6' ref={e => this.ma = e} label='Mã môn học' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox className='col-md-12' ref={e => this.tenTiengViet = e} label='Tên tiếng Việt' readOnly={readOnly} required />
                <FormTextBox className='col-md-12' ref={e => this.tenTiengAnh = e} label='Tên tiếng Anh' readOnly={readOnly} />
                <FormTextBox type='number' className='col-md-6' ref={e => this.tcLyThuyet = e} label='Tín chỉ lý thuyết' readOnly={readOnly} required />
                <FormTextBox type='number' className='col-md-6' ref={e => this.tcThucHanh = e} label='Tín chỉ thực hành' readOnly={readOnly} required />
                <FormSelect ref={e => this.khoaSdh = e} className='col-md-12' data={SelectAdapter_DmKhoaSdh} label='Khoa phụ trách' readOnly={readOnly} required />
            </div>
        });
    }
}

class DmMonHocSdhMoiPage extends AdminPage {
    //cập nhật multi môn vào khoa mới
    state = { sortTerm: 'tenTV_ASC', donViFilter: '', listChosen: [] }
    defaultSortTerm = 'tenTV_ASC'
    selectKichHoat = [
        { id: '1', text: 'Kích hoạt' },
        { id: '0', text: 'Chưa kích hoạt' },
    ]
    componentDidMount() {
        let route = T.routeMatcher('/user/sau-dai-hoc/mon-hoc-moi').parse(window.location.pathname);
        this.menu = route.menu == 'sau-dai-hoc' ? 'sau-dai-hoc' : 'category';
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getDmKhoaSdhAll(items => {
                this.getPage();
                this.setState({ dmKhoaSdh: items.map(i => ({ id: i.ma, text: i.ten })) });
            });
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText);
            T.showSearchBox();
        });

    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm, donViFilter: this.state.donViFilter };
        this.props.getDmMonHocSdhMoiPage(pageN, pageS, pageC, filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmMonHocSdhMoi(item.ma, { kichHoat: item.kichHoat });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục môn học mới (sau 2022)', 'Bạn có chắc bạn muốn xóa môn học này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMonHocSdhMoi(item.ma));
    }

    reset = () => {
        this.setState({ listChosen: [] }, () => this.checkAll.value(false));
    }

    searchAdvance = () => {
        const advance = {
            ma: getValue(this.ma),
            khoaSdh: getValue(this.khoaSdh),
            tenTiengViet: getValue(this.tenTiengViet),
            tenTiengAnh: getValue(this.tenTiengAnh)
        };
        this.props.getDmMonHocSdhMoiPage(undefined, undefined, '', undefined, advance);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    chooseAll = (value, list) => {
        let { listChosen } = this.state;
        if (value) {
            listChosen = listChosen.concat(list);
            listChosen = [...new Set(listChosen)];
        } else {
            listChosen = [];
        }
        this.setState({ listChosen });
    }

    chonMonHoc = (value, item) => {
        let { listChosen } = this.state;
        if (value) {
            listChosen.push(item);
            listChosen = [...new Set(listChosen)];
        } else {
            listChosen = listChosen.filter(mh => mh.ma != item.ma);
        }
        this.setState({ listChosen }, () => listChosen.length >= this.props.dmMonHocSdhMoi?.page.list?.length ? this.checkAll.value(true) : this.checkAll.value(false));
    }

    render() {
        const permission = this.getUserPermission('dmMonHocSdhMoi', ['manage', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.dmMonHocSdhMoi && this.props.dmMonHocSdhMoi.page ?
            this.props.dmMonHocSdhMoi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: '', totalItem: 0, list: null };
        const onKeySearch = this.handleKeySearch,
            onSort = this.onSort;
        let table = renderDataTable({
            emptyTable: 'Dữ liệu học phần trống',
            data: list,
            stickyHead: list && list.length > 8, style: { fontSize: '0.8rem' },
            divStyle: { height: '64vh' },
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Chọn<br />
                        <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.chooseAll(value, list)} readOnly={!permission.write} />
                    </th>
                    <TableHead keyCol='ma' content='Mã' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='tenTV' content='Tên tiếng Việt' onKeySearch={onKeySearch} onSort={onSort} />
                    {/* <TableHead keyCol='tenTA' content='Tên tiếng Anh' onKeySearch={onKeySearch} onSort={onSort} /> */}
                    <TableHead keyCol='tclt' content='TC Lý thuyết' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='tcth' content='TC Thực hành' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='tongTc' content='Tổng TC' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='tietLT' content='Tiết LT' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='tietTH' content='Tiết TH' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='tongTiet' content='Tổng tiết' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='khoa' content='Khoa' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='kichHoat' content='Kích hoạt' onKeySearch={onKeySearch} onSort={onSort} typeSearch='select' data={this.selectKichHoat} />
                    <TableHead content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center' }} type='checkbox' isCheck permission={permission} content={!!this.state.listChosen.includes(item)}
                        onChanged={value => this.chonMonHoc(value, item)} />
                    <TableCell type='link' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell content={item.tenTiengViet ? item.tenTiengViet : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tcLyThuyet ? item.tcLyThuyet : '0'} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tcThucHanh ? item.tcThucHanh : '0'} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tongTinChi ? item.tongTinChi : '0'} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tietLt ? item.tietLt : '0'} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tietTh ? item.tietTh : '0'} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tongTiet ? item.tongTiet : '0'} />
                    <TableCell content={item.tenKhoa ?? ''} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmMonHocSdhMoi(item.ma, { kichHoat: Number(value) })} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )

        });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục môn học mới (sau 2022) ',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                'Môn học mới (sau 2022)'
            ],
            header: <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
                T.clearSearchBox();
                this.setState({ donViFilter: value ? value.id : '' }, () => this.getPage());
            }} data={this.state.dmKhoaSdh} allowClear={true} />,
            content: <>
                <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 className='tile-title'>Danh sách môn học hiện tại</h4>
                        <div style={{ display: 'flex' }}>
                            {!!this.state.listChosen.length && <Tooltip title='Cập nhật Khoa/Bộ môn' arrow>
                                <button className='btn btn-primary' style={{ height: ' 34px' }} onClick={e => e.preventDefault() || this.editKhoaModal.show(this.state.listChosen)}>
                                    <i className='fa fa-lg fa-edit' />
                                </button>
                            </Tooltip>}
                            <Pagination style={{ marginLeft: '70px', position: 'initial' }} {...{ pageNumber, pageSize, pageTotal, pageCondition, totalItem }}
                                getPage={this.getPage} pageRange={3} done={() => this.checkAll.value(false)} />
                        </div>
                    </div>
                    {table}
                </div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmMonHocSdhMoi} update={this.props.updateDmMonHocSdhMoi} readOnly={!permission.write} />
                <EditKhoaModal ref={e => this.editKhoaModal = e} permission={permission} update={this.props.updateKhoaDmMonHocSdhMoi} reset={this.reset} readOnly={!permission.write} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            collapse: [
                { icon: 'fa-plus-square', name: 'Tạo môn học', permission: permission.write, type: 'info', onClick: e => this.showModal(e) },
                { icon: 'fa-upload', name: 'Import danh sách môn học', permission: permission.write, type: 'warning', onClick: e => e.preventDefault() || this.props.history.push('/user/sau-dai-hoc/mon-hoc-moi/upload') },
                { icon: 'fa-print', name: 'Tải về danh sách môn học', permission: permission.write, type: 'success', onClick: e => e.preventDefault() || T.download(T.url(`/api/sdh/mon-hoc-moi/download-danh-sach?filter=${this.state.filter}`)), },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmMonHocSdhMoi: state.sdh.dmMonHocSdhMoi });
const mapActionsToProps = { createDmMonHocSdhMoi, getDmMonHocSdhMoiPage, updateDmMonHocSdhMoi, deleteDmMonHocSdhMoi, getDmKhoaSdhAll, updateKhoaDmMonHocSdhMoi };
export default connect(mapStateToProps, mapActionsToProps)(DmMonHocSdhMoiPage);