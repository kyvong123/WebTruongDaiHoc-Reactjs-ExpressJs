import { SelectAdapter_DmKhoaSdh } from 'modules/mdSauDaiHoc/dmKhoaSauDaiHoc/redux';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormCheckbox, FormSelect, FormTextBox, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmNganhSdh } from '../dmNganhSauDaiHoc/redux';
import { SelectAdapter_SdhCauTrucKhungDaoTao } from '../sdhCauTrucKhungDaoTao/redux';
import { SelectAdapter_DmMonHocSdhMoi } from '../sdhDmMonHocMoi/redux';
import { SelectAdapter_DotDangKySdh } from '../sdhDotDangKy/redux';
import { getSdhDangKyHocPhanPage, deleteSdhDangKyHocPhanMultiple } from './redux';

class GhiChuModal extends AdminModal {

    onShow = (item) => {
        this.setState({ item });
    }

    onSubmit = () => {
        let { item } = this.state;
        if (!this.lyDo.value() || this.lyDo.value() == '') {
            T.notify('Vui lòng nhập lý do!', 'danger');
        } else {
            T.confirm('Cảnh báo', `Bạn có chắc muốn hủy đăng ký học phần ${item.maHocPhan}?`, 'warning', true, isConfirm => {
                if (isConfirm) {
                    T.alert('Đang xử lý', 'warning', false, null, true);
                    this.props.delete(item, (value) => {
                        if (value && value.message) T.alert('Xóa học phần thất bại', 'warning', false, 1000);
                        else T.alert('Huỷ học phần thành công', 'success', false, 1000);
                        this.lyDo.value('');
                        this.props.getSdhDangKyHocPhanPage();
                    });
                    this.hide();
                }
            });
        }
    }

    render = () => {
        let { hocPhan } = this.state, tenHP = '';
        if (hocPhan) {
            tenHP = T.parse(hocPhan?.tenMonHoc, { vi: '' })?.vi;
        }
        return this.renderModal({
            title: `Lý do xoá học phần ${hocPhan?.maHocPhan}: ${tenHP}`,
            size: 'large',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.lyDo = e} type='text' className='col-md-12' label='Lý do' />
                </div>
            </>,
            isShowSubmit: false,
            buttons: <button type='submit' className='btn btn-danger'>
                <i className='fa fa-fw fa-lg fa-trash' /> Xoá
            </button>
        });
    }
}

class SdhDangKyHocPhan extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhDangKyHocPhanPage();
            T.showSearchBox(() => {
                this.listKhoa?.value('');
                this.listNganh?.value('');
                this.listKhungDaoTao?.value('');
                this.listDotDangKy?.value('');

            });
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50 };
        this.getHocPhanDangKyPage(pageNumber, pageSize, page => page && this.hideAdvanceSearch());
        const listKhoa = this.listKhoa.value()?.toString() || '';
        const listNganh = this.listNganh.value()?.toString() || '';
        const listKhungDaoTao = this.listKhungDaoTao.value()?.toString() || '';
        const listDotDangKy = this.listDotDangKy.value()?.toString() || '';
        const pageFilter = isInitial ? null : { listKhoa, listNganh, listKhungDaoTao, listDotDangKy };

        this.setState({ filter: pageFilter }, () => {
            this.getHocPhanDangKyPage(pageNumber, pageSize, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    let { listKhoa, listNganh, listKhungDaoTao, listDotDangKy } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.listKhoa?.value(filter.listKhoa || '');
                    this.listNganh?.value(filter.listNganh || '');
                    this.listKhungDaoTao?.value(filter.listKhungDaoTao || '');
                    this.listDotDangKy?.value(filter.listDotDangKy || '');
                    if (!$.isEmptyObject(filter) && filter && ({ listKhoa, listNganh, listKhungDaoTao, listDotDangKy })) this.showAdvanceSearch();
                }
            });
        });
    }
    handleKeySearch = (data, pageNumber, pageSize) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getHocPhanDangKyPage(pageNumber, pageSize);
        });
    }
    getHocPhanDangKyPage = (pageNumber, pageSize, done) => this.props.getSdhDangKyHocPhanPage(pageNumber, pageSize, this.state.filter, done);

    hanldeDeleteHocPhan = (e, item) => {
        const changes = { maHocPhan: item.maHocPhan, mssv: item.mssv, idDotDangKy: item.dotDangKy };
        this.modal.show(changes);
        // T.confirm('Xác nhận', `Bạn có chắc muốn xoá đăng ký môn ${item.tenMonHoc} của sinh viên ${item.ho} ${item.ten}`, 'warning', true, isConfirm => isConfirm && this.props.deleteSdhDangKyHocPhanMultiple(changes));

    }
    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.sdhDangKyHocPhan && this.props.sdhDangKyHocPhan.all && this.props.sdhDangKyHocPhan.all || {
            pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: []
        };
        const permission = this.getUserPermission('sdhDangKyHocPhan', ['read', 'write', 'delete']);
        let table = () => renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên đăng ký học phần',
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: list,
            stickyHead: list.length > 12 ? true : false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '10%' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                    <TableHead content='Họ và tên lót' style={{ with: '20%' }} keyCol='ho' onKeySearch={this.handleKeySearch} />
                    <TableHead content='Tên' keyCol='ten' onKeySearch={this.handleKeySearch} />
                    <TableHead typeSearch='select' style={{ width: '20%', whiteSpace: 'nowrap' }} content='Môn học' data={SelectAdapter_DmMonHocSdhMoi} keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap' }} content='Thứ' keyCol='thu' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap' }} content='Tiết bắt đầu' keyCol='tietBatDau' onKeySearch={this.handleKeySearch} />
                    <TableHead typeSearch='select' style={{ width: '10%', whiteSpace: 'nowrap' }} content='Giảng viên' keyCol='giangVien' data={SelectAdapter_FwCanBoGiangVien} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap' }} content='Năm' keyCol='nam' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Học kỳ' keyCol='hocKy' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => {
                const numHP = item.data.length;
                return (
                    <Fragment key={index}>{
                        numHP > 1 ? [
                            <tr key={index}>
                                <TableCell rowSpan={numHP} type='number' content={index + 1} />
                                <TableCell rowSpan={numHP} type='link' url={`sinh-vien/item/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.data[0].mssv} />
                                <TableCell rowSpan={numHP} style={{ whiteSpace: 'nowrap' }} content={item.data[0].ho || ''} />
                                <TableCell rowSpan={numHP} style={{ whiteSpace: 'nowrap' }} content={item.data[0].ten || ''} />
                                <TableCell rowSpan={numHP} style={{ whiteSpace: 'nowrap' }} content={item.data[0].tenMonHoc} />
                                <TableCell rowSpan={numHP} style={{ whiteSpace: 'nowrap' }} content={item.data[0].maHocPhan || ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].dmThu || ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].batDau && item.data[0].batDau + ' : ' + item.data[0].ketThuc && item.data[0].batDau || ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].donVi && item.data[0].donVi.getFirstLetters().toUpperCase() + ': ' + item.data[0].trinhDo + '.' + item.data[0].giangVien || ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].nam || ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].hocKy || ''} />
                                <TableCell rowSpan={numHP} type='buttons' style={{ textAlign: 'center' }} content={item.data[0]} permission={permission}
                                    onDelete={(e) => this.hanldeDeleteHocPhan(e, item.data[0])} />
                            </tr>,
                            item.data.map((hp, idx) => {
                                if (idx > 0) {
                                    return <tr key={idx} style={{ backgroundColor: 'white' }}>
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={hp.dmThu || ''} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={hp.batDau && hp.batDau + ' : ' + hp.ketThuc && hp.batDau || ''} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={hp.donVi && hp.donVi.getFirstLetters().toUpperCase() + ': ' + hp.trinhDo + '.' + hp.giangVien || ''} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={hp.nam || ''} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={hp.hocKy || ''} />

                                    </tr>;
                                }
                            }),
                        ] : <tr key={index}>
                            <TableCell type='number' content={index + 1} />
                            <TableCell type='link' url={`sinh-vien/item/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.data[0].mssv} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].ho || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].ten || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].tenMonHoc} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].maHocPhan || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].dmThu || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].batDau && item.data[0].batDau + ' : ' + item.data[0].ketThuc && item.data[0].batDau || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].donVi && item.data[0].donVi.getFirstLetters().toUpperCase() + ': ' + item.data[0].trinhDo + '.' + item.data[0].giangVien || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].nam || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].hocKy || ''} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item.data[0]} permission={permission}
                                onDelete={(e) => this.hanldeDeleteHocPhan(e, item.data[0])} />
                        </tr>}
                    </Fragment>
                );
            }
        });
        return this.renderPage({
            title: 'Danh sách đăng ký học phần',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user'>Sau đại học</Link>,
                'Danh sách đăng ký học phần'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect multiple ref={e => this.listKhoa = e} data={SelectAdapter_DmKhoaSdh} label='Lọc theo khoa' className='col-md-3' minimumResultsForSearch={-1} allowClear />
                    <FormSelect multiple ref={e => this.listNganh = e} data={SelectAdapter_DmNganhSdh()} label='Lọc theo ngành' className='col-md-3' minimumResultsForSearch={-1} allowClear />
                    <FormSelect multiple ref={e => this.listKhungDaoTao = e} data={SelectAdapter_SdhCauTrucKhungDaoTao} label='Khung đào tạo' className='col-md-3' minimumResultsForSearch={-1} allowClear />
                    <FormSelect ref={e => this.listDotDangKy = e} data={SelectAdapter_DotDangKySdh} label='Đợt đăng ký' className='col-md-3' minimumResultsForSearch={-1} allowClear />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.setState({ filter: {} }, () => this.changeAdvancedSearch(true))} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' />Reset
                    </button>
                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-lg fa-search-plus' />Tìm kiếm
                    </button>
                </div>
            </>,
            content:
                <>
                    <div className='tile'>
                        <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} đăng ký học phần</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                            <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ quickAction: value })} style={{ marginBottom: '0' }} />
                            <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition: {} }}
                                getPage={this.props.getSdhDangKyHocPhanPage} pageRange={3} />
                        </div>
                        <div>{table()}</div>
                    </div>
                    <GhiChuModal ref={e => this.modal = e} getSdhDangKyHocPhanPage={this.props.getSdhDangKyHocPhanPage} delete={this.props.deleteSdhDangKyHocPhanMultiple} />
                </>
            ,
            backRoute: '/user/sau-dai-hoc',
            collapse: [
                { icon: 'fa-plus', name: 'Create', permission: permission.write, onClick: () => this.props.history.push('/user/sau-dai-hoc/dang-ky-hoc-phan/chi-tiet'), type: 'primary' }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDangKyHocPhan: state.sdh.sdhDangKyHocPhan });
const mapActionsToProps = { getSdhDangKyHocPhanPage, deleteSdhDangKyHocPhanMultiple };
export default connect(mapStateToProps, mapActionsToProps)(SdhDangKyHocPhan);
