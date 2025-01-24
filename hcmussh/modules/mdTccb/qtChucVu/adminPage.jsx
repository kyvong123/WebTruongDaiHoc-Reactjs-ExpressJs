import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    AdminPage,
    TableCell,
    renderTable,
    AdminModal,
    FormTextBox,
    FormDatePicker,
    FormCheckbox,
    FormSelect,
    FormTabs
} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtChucVuPage, updateQtChucVuStaff,
    deleteQtChucVuStaff, createQtChucVuStaff, getQtChucVuGroupPage,
    getQtChucVuAll, getQtChucVuGroupPageByDonVi, checkDaSuDung
} from './redux';
import { SelectAdapter_DmChucVuV2, getDmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmBoMonTheoDonVi } from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_FwCanBo, getStaff } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { Tooltip } from '@mui/material';
import CreateRequest from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';
import { SelectAdapter_SoDangKyAlternative, getSo } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';

const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày ra quyết định bổ nhiệm' },
    { id: 3, text: 'Theo ngày ra quyết định thôi chức vụ' }
];

export class EditModal extends AdminModal {
    state = { shcc: null, stt: '', chucVuChinh: 0, thoiChucVu: 0, donVi: 0, capChucVu: 0, vanBanDaPhatHanh: false, idSoDangKy: '', cachLaySo: false };

    onShow = (item) => {
        let { stt, shcc, maChucVu, maDonVi, ngayRaQuyetDinh, ngayRaQd, soQd, chucVuChinh, maBoMon, thoiChucVu, soQdThoiChucVu, ngayRaQdThoiChucVu, capChucVu, idSoDangKy } = item ? item : {
            stt: '',
            shcc: '', maChucVu: '', maDonVi: '', ngayRaQuyetDinh: '', chucVuChinh: 0, maBoMon: '',
            ngayRaQd: '', soQd: '', thoiChucVu: 0, ngayRaQdThoiChucVu: '', soQdThoiChucVu: '', capChucVu: 0, idSoDangKy: 0
        };
        this.setState({ shcc, stt, item, chucVuChinh, thoiChucVu: thoiChucVu ? 1 : 0, capChucVu: capChucVu, cachLaySo: idSoDangKy == null ? true : false }, () => {
            this.shcc.value(shcc ? shcc : '');
            this.maChucVu.value(maChucVu ? maChucVu : '');
            this.maDonVi.value(maDonVi ? maDonVi : '');
            this.ngayRaQuyetDinh.value(ngayRaQd ? ngayRaQd : (ngayRaQuyetDinh ? ngayRaQuyetDinh : ''));
            this.chucVuChinh.value(chucVuChinh ? 1 : 0);
            this.maBoMon.value(maBoMon ? maBoMon : '');
            if (!shcc) {
                this.idSoDangKy.value(idSoDangKy ? idSoDangKy : '');
                this.state.cachLaySo && this.soQd.value(soQd ? soQd : '');
            }
            else {
                if (!idSoDangKy) this.soQd.value(soQd ? soQd : '');
                else this.idSoDangKy.value(idSoDangKy ? idSoDangKy : '');
                this.thoiChucVu.value(thoiChucVu ? 1 : 0);
                this.state.thoiChucVu ? this.soQdThoiChucVu.value(soQdThoiChucVu ? soQdThoiChucVu : '') : $('#soQdThoiChucVu').hide();
                this.state.thoiChucVu ? this.ngayRaQdThoiChucVu.value(ngayRaQdThoiChucVu ? ngayRaQdThoiChucVu : '') : $('#ngayRaQdThoiChucVu').hide();
            }
        });
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    checkChucVu = (changes) => {
        if (changes.chucVuChinh == this.state.chucVuChinh) {
            this.state.stt ? this.props.update(this.state.stt, changes, this.hide, false) : this.props.create(changes, this.hide);
            return;
        }
        T.confirm('Thông tin chức vụ chính', 'Đây sẽ là chức vụ chính của cán bộ', 'warning', true, isConfirm => {
            isConfirm && this.props.getQtChucVuAll(changes.shcc, data => {
                if (data) {
                    data.rows.forEach(item => {
                        if (item.chucVuChinh && item.stt != this.state.stt) {
                            this.props.update(item.stt, { chucVuChinh: 0 });
                        }
                    });
                }
                if (this.state.stt) {
                    this.props.update(this.state.stt, changes, this.hide, false);
                } else {
                    this.props.create(changes, this.hide, false);
                }
            });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        if (this.state.shcc) {
            const changes = {
                shcc: this.shcc.value(),
                maChucVu: this.maChucVu.value(),
                maDonVi: this.maDonVi.value(),
                ngayRaQd: Number(this.ngayRaQuyetDinh.value()),
                chucVuChinh: this.chucVuChinh.value() ? 1 : 0,
                maBoMon: this.maBoMon.value(),
                thoiChucVu: this.thoiChucVu.value() ? 1 : 0,
                soQdThoiChucVu: this.soQdThoiChucVu.value(),
                ngayRaQdThoiChucVu: Number(this.ngayRaQdThoiChucVu.value()),
            };
            if (this.state.cachLaySo) {
                changes.soQd = this.soQd.value();
                changes.idSoDangKy = null;
            }
            else {
                changes.idSoDangKy = this.idSoDangKy.value();
                changes.soQd = null;
            }
            this.props.update(this.state.stt, changes, this.hide);
        } else {
            const changes = {
                shcc: this.shcc.value(),
                maChucVu: this.maChucVu.value(),
                maDonVi: this.maDonVi.value(),
                ngayRaQd: Number(this.ngayRaQuyetDinh.value()),
                chucVuChinh: this.chucVuChinh.value() ? 1 : 0,
                maBoMon: this.maBoMon.value(),
            };
            this.state.cachLaySo ? (changes.soQd = this.soQd.value()) : (changes.idSoDangKy = this.idSoDangKy.value());

            this.props.checkDaSuDung(changes.idSoDangKy, changes.shcc, changes.maChucVu, (data) => {
                if (data.isExist) {
                    this.props.getSo(changes.idSoDangKy, (data) => {
                        const soCongVan = data.soCongVan;
                        this.props.getStaff(changes.shcc, (data) => {
                            const ho = data.item.ho,
                                ten = data.item.ten;
                            this.props.getDmChucVu(changes.maChucVu, (data) => {
                                const chucVu = data.ten;
                                T.confirm('', `<div>
                                    <div>Số quyết định ${soCongVan} đã được sử dụng cho cán bộ ${ho} ${ten} với chức vụ ${chucVu}.</div>
                                    <div>Bạn vẫn muốn tạo mới chức vụ này?</div>
                                </div>`, 'warning', true, isConfirm => {
                                    if (isConfirm) {
                                        this.props.create(changes, this.hide);
                                    }
                                });
                            });
                        });
                    });
                } else {
                    this.props.create(changes, this.hide);
                }
            });
        }
    }

    handleDonVi = (data) => {
        data && this.setState({ donVi: data.id }, () => {
            this.maBoMon.value('');
        });
    }

    checkChucVuSwitch = () => {
        if (this.state.chucVuChinh) {
            return true;
        }
        return false;
    }

    handleThoiChucVu = (value) => {
        value ? $('#soQdThoiChucVu').show() : $('#soQdThoiChucVu').hide();
        value ? $('#ngayRaQdThoiChucVu').show() : $('#ngayRaQdThoiChucVu').hide();
        this.setState({ thoiChucVu: value });
    }

    handleChucVu = (data) => {
        data && this.props.getDmChucVu(data.id, (item) => {
            this.setState({ capChucVu: item.isCapTruong });
        });
    }

    onShowRequestModal = () => {
        $(this.modal).modal('hide');
        setTimeout(() => {
            this.props.requestModal.show({
                onHide: () => $(this.modal).modal('show'), onCreateCallback: (data, done) => {
                    done && done();
                    data.soVanBan && this.idSoDangKy.value(data.soVanBan);
                },
                loaiVanBan: 42,
                lyDo: 'Quyết định nhân sự'
            });
        }, 300);
    }

    onHide = () => {
        !this.state.cachLaySo && (this.idSoDangKy.value(''));
    }

    handleCachLaySoQd = (value) => {
        this.setState({
            cachLaySo: value
        });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.shcc ? 'Cập nhật quá trình chức vụ' : 'Tạo mới quá trình chức vụ',
            size: 'large',
            body: <div className='row'>
                {this.state.cachLaySo == false && <>
                    <FormCheckbox
                        ref={e => this.vanBanDaPhatHanh = e}
                        label='Văn bản đã tồn tại bên Văn phòng điện tử'
                        className='col-md-12'
                        onChange={value => { this.setState({ vanBanDaPhatHanh: value }, () => this.idSoDangKy.value('')); }}
                        allowClear={true}
                    />
                    <FormSelect
                        ref={e => this.idSoDangKy = e}
                        className='col-md-12'
                        label={<div>Số quyết định bổ nhiệm <span className='text-danger'>*&nbsp;</span> <Link to='#' onClick={this.onShowRequestModal}>(Nhấn vào đây để thêm)</Link></div>}
                        data={SelectAdapter_SoDangKyAlternative([30], 'TRUONG', ['QĐ'], this.state.vanBanDaPhatHanh ? 1 : 0)}
                        placeholder='Số quyết định bổ nhiệm'
                    />
                </>}
                <FormCheckbox label='Nhập số quyết định bổ nhiệm' className='col-md-12' onChange={value => this.setState({ cachLaySo: value })} allowClear={true} />
                {this.state.cachLaySo == true && <FormTextBox className='col-md-12' type='text' ref={e => this.soQd = e} label='Số quyết định bổ nhiệm' readOnly={readOnly} />}
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} allowClear={true} readOnly={readOnly} />
                <FormDatePicker type='date-mask' className='col-md-12' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định bổ nhiệm' readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.maChucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV2} onChange={this.handleChucVu} allowClear={true} readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.maDonVi = e} label='Đơn vị của chức vụ' data={SelectAdapter_DmDonVi} onChange={this.handleDonVi} allowClear={true} readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.maBoMon = e} style={{ display: this.state.capChucVu ? 'none' : '' }} label='Bộ môn của chức vụ' data={SelectAdapter_DmBoMonTheoDonVi(this.state.donVi)} allowClear={true} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' ref={e => this.chucVuChinh = e} label='Chức vụ chính' readOnly={this.checkChucVuSwitch() || readOnly} />
                {this.state.shcc && <>
                    <FormCheckbox className='col-md-12' ref={e => this.thoiChucVu = e} onChange={this.handleThoiChucVu} label='Thôi giữ chức vụ' readOnly={readOnly} />
                    <div className='col-md-12' id='soQdThoiChucVu'><FormTextBox type='text' ref={e => this.soQdThoiChucVu = e} label='Số quyết định thôi chức vụ' readOnly={readOnly} /> </div>
                    <div className='col-md-12' id='ngayRaQdThoiChucVu'> <FormDatePicker type='date-mask' ref={e => this.ngayRaQdThoiChucVu = e} label='Ngày ra quyết định thôi chức vụ' readOnly={readOnly} /> </div>
                </>}
            </div>
        });
    }
}

class QtChucVu extends AdminPage {
    state = { filter: {}, timeType: 0 };

    componentDidMount() {
        T.clearSearchBox();
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getAllPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {

            });

            this.changeAdvancedSearch(false, true);
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtChucVu && this.props.qtChucVu.page ? this.props.qtChucVu.page : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const listDonVi = this.maDonVi?.value().toString() || '';
        const listShcc = this.mulCanBo?.value().toString() || '';
        const listChucVu = this.mulMaChucVu?.value().toString() || '';
        const gioiTinh = this.gioiTinh?.value() == '' ? null : this.gioiTinh?.value();
        const listChucDanh = this.mulMaChucDanh?.value().toString() || '';
        const thoiChucVu = this.thoiChucVu?.value() || null;
        const fromAge = this.fromAge?.value();
        const toAge = this.toAge?.value();
        const filterCookie = T.storage('pageQtChucVu').F;
        const pageFilter = (isInitial || isReset) ? filterCookie : { listDonVi, fromYear, toYear, listShcc, timeType, listChucVu, gioiTinh, listChucDanh, fromAge, toAge, thoiChucVu };
        this.setState({ filter: isReset ? {} : pageFilter }, () => {
            this.getAllPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || filterCookie.fromYear || '');
                    this.toYear?.value(filter.toYear || filterCookie.toYear || '');
                    this.maDonVi?.value(filter.listDonVi || filterCookie.listDonVi);
                    this.mulCanBo?.value(filter.listShcc || filterCookie.listShcc);
                    this.timeType?.value(filter.timeType || filterCookie.timeType);
                    this.mulMaChucVu?.value(filter.listChucVu || filterCookie.listChucVu);
                    this.gioiTinh?.value(filter.gioiTinh || filterCookie.gioiTinh);
                    this.mulMaChucDanh?.value(filter.listChucDanh || filterCookie.listChucDanh);
                    this.fromAge?.value(filter.fromAge || filterCookie.fromAge);
                    this.toAge?.value(filter.toAge || filterCookie.toAge);
                    Object.values(filterCookie).some(item => item && item != '' && item != 0) && typeof (filterCookie) !== 'string' && this.showAdvanceSearch();
                } else if (isReset) {
                    this.fromYear?.value('');
                    this.toYear?.value('');
                    this.maDonVi.value('');
                    this.mulCanBo.value('');
                    this.timeType.value('');
                    this.mulMaChucVu.value('');
                    this.gioiTinh.value('');
                    this.mulMaChucDanh.value('');
                    this.fromAge.value('');
                    this.toAge.value('');
                    this.hideAdvanceSearch();
                }
                else {
                    this.hideAdvanceSearch();
                }
            });
        });
    }

    getAllPage = (pageN, pageS, pageC, done) => {
        this.getPage(pageN, pageS, pageC, done);
        this.getGroupByShccPage(pageN, pageS, pageC, done);
        this.getGroupByDonViPage(pageN, pageS, pageC, done);
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtChucVuPage(pageN, pageS, pageC, this.state.filter, done);
    }

    getGroupByShccPage = (pageN, pageS, pageC, done) => {
        this.props.getQtChucVuGroupPage(pageN, pageS, pageC, this.state.filter, done);
    }

    getGroupByDonViPage = (pageN, pageS, pageC, done) => {
        this.props.getQtChucVuGroupPageByDonVi(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    list = (dsChucVu, dsDonVi, dsBomon) => {
        if (!dsChucVu) return '';
        let dsChucVuSplitted = dsChucVu.split('??');
        let dsDonViSplitted = dsDonVi.split('??');
        let dsBomonSplitted = dsBomon.split('??');
        const danhSach = [];
        for (let i = 0; i < dsChucVuSplitted.length; i++) {
            dsDonViSplitted[i] = dsDonViSplitted[i].trim();
            dsBomonSplitted[i] = dsBomonSplitted[i].trim();
            danhSach.push(<span key={i}>- {dsChucVuSplitted[i]}: {dsBomonSplitted[i] ? dsBomonSplitted[i] : (dsDonViSplitted[i] ? dsDonViSplitted[i] : '')}{i != dsChucVuSplitted.length - 1 ? <br /> : ''}</span>);
        }
        return danhSach;
    }

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', 'Bạn có chắc bạn muốn xóa chức vụ này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtChucVuStaff({ stt: item.stt, shcc: item.shcc }, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá chức vụ bị lỗi!', 'danger');
                else T.alert('Xoá chức vụ thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    checkTimeType = (value) => {
        this.setState({ timeType: value });
    }

    render() {
        const permission = this.getUserPermission('qtChucVu', ['read', 'write', 'delete', 'export', 'import']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtChucVu && this.props.qtChucVu.page ? this.props.qtChucVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let { pageNumber: groupByShccPageNumber, pageSize: groupByShccPageSize, pageTotal: groupByShccPageTotal, totalItem: groupByShccTotalItem, pageCondition: groupByShccPageCondition, list: groupByShccList } = this.props.qtChucVu && this.props.qtChucVu.pageGr ? this.props.qtChucVu.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let { pageNumber: groupByDonViPageNumber, pageSize: groupByDonViPageSize, pageTotal: groupByDonViPageTotal, totalItem: groupByDonViTotalItem, pageCondition: groupByDonViPageCondition, list: qtChucVuByDonViList } = this.props.qtChucVu && this.props.qtChucVu.pageGrByDonVi ? this.props.qtChucVu.pageGrByDonVi : { pageNumber: 1, pageSize: 25, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let fullTable = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh<br />nghề nghiệp</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Chức vụ</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Đơn vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quyết định<br />bổ nhiệm</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: item.chucVuChinh ? '#d4f2dc' : '' }}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{item.ho + ' ' + item.ten}</span><br />
                            <a href='#' onClick={() => this.modal.show(item)}>{item.shcc}</a>
                        </>
                    )}
                    />
                    <TableCell type='text' content={item.ngayRaQuyetDinh ? new Date(item.ngaySinh).ddmmyyyy() : ''} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.chucDanhNgheNghiep} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<b>{item.tenChucVu}</b>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>{item.tenBoMon ? <>{item.tenBoMon}<br /> </> : ''}  {item.tenDonVi}</>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>Số: {item.soQuyetDinh}</span><br />
                            <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQuyetDinh ? new Date(item.ngayRaQuyetDinh).ddmmyyyy() : ''}</span></span>
                        </>
                    )}
                    />

                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={permission.write ? () => this.modal.show(item) : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} onDelete={permission.delete ? this.delete : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} >
                        {permission.export && (
                            <Tooltip title='Xuất quá trình'>
                                <button type='button' className='btn btn-outline-primary' style={{ width: '45px' }} onClick={(e) => e.preventDefault() || this.downloadWord(item)}>
                                    <i className='fa fa-lg fa-file-word-o' />
                                </button>
                            </Tooltip>
                        )}
                    </TableCell>
                </tr>
            )
        });

        let fullPage = <>
            {fullTable}
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
        </>;

        let groupTable = renderTable({
            getDataSource: () => groupByShccList, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số chức vụ</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Chi tiết chức vụ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{item.ho + ' ' + item.ten}</span><br />
                            <a href='#' onClick={() => this.modal.show(item)}>{item.shcc}</a>
                        </>
                    )}
                    />
                    <TableCell type='text' content={item.soChucVu} style={{ textAlign: 'right' }} />
                    <TableCell type='text' content={this.list(item.danhSachChucVu, item.danhSachDonVi, item.danhSachBoMon)} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                        <Link className='btn btn-success' to={`/user/tccb/qua-trinh/chuc-vu/group/${item.shcc}`} >
                            <i className='fa fa-lg fa-compress' />
                        </Link>
                    </TableCell>
                </tr>
            )
        });

        let groupByShccPage = <>
            {groupTable}
            <Pagination style={{ marginLeft: '70px' }} pageNumber={groupByShccPageNumber} pageSize={groupByShccPageSize} pageTotal={groupByShccPageTotal} totalItem={groupByShccTotalItem} pageCondition={groupByShccPageCondition} getPage={this.getGroupByShccPage} />
        </>;

        let groupByDonViTable = renderTable({
            hover: false,
            getDataSource: () => qtChucVuByDonViList, stickyHead: true,
            renderHead: () => <React.Fragment>
                <tr>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>Tên đơn vị</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>Tên chức vụ</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap', textAlign: 'center' }} colSpan={7}>Thông tin quá trình chức vụ</th>
                </tr>
                <tr>
                    <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Tên bộ môn</th>
                    <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Số quyết định</th>
                    <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Ngày ra quyết định</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            </React.Fragment>,
            renderRow: (item, index) => {
                const tenChucVuList = Object.keys(item.itemGroup);
                return <React.Fragment key={index}>
                    <tr>
                        <TableCell content={item.tenDonVi} rowSpan={item.itemsNum} />
                        <TableCell content={tenChucVuList[0]} rowSpan={item.itemGroup[tenChucVuList[0]].length} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.itemGroup[tenChucVuList[0]][0].ho + ' ' + item.itemGroup[tenChucVuList[0]][0].ten}</span><br />
                                <a href='#' onClick={() => this.modal.show(item.itemGroup[tenChucVuList[0]][0])}>{item.itemGroup[tenChucVuList[0]][0].shcc}</a>
                            </>
                        )}
                        />
                        <TableCell content={item.itemGroup[tenChucVuList[0]][0].tenBoMon} />
                        <TableCell content={item.itemGroup[tenChucVuList[0]][0].soQuyetDinh} />
                        <TableCell content={item.itemGroup[tenChucVuList[0]][0].ngayRaQuyetDinh ? T.dateToText(item.itemGroup[tenChucVuList[0]][0].ngayRaQuyetDinh, 'dd/mm/yyyy') : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item.itemGroup[tenChucVuList[0]][0]} permission={permission}
                            onEdit={permission.write ? () => this.modal.show(item.itemGroup[tenChucVuList[0]][0]) : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} onDelete={permission.delete ? this.delete : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} >
                        </TableCell>
                    </tr>
                    {
                        item.itemGroup[tenChucVuList[0]].slice(1).map((qtChucVuItem, index2) => <tr key={index2}>
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                                <>
                                    <span>{qtChucVuItem.ho + ' ' + qtChucVuItem.ten}</span><br />
                                    <a href='#' onClick={() => this.modal.show(qtChucVuItem)}>{qtChucVuItem.shcc}</a>
                                </>
                            )}
                            />
                            <TableCell content={qtChucVuItem.tenBoMon} />
                            <TableCell content={qtChucVuItem.soQuyetDinh} />
                            <TableCell content={qtChucVuItem.ngayRaQuyetDinh ? T.dateToText(qtChucVuItem.ngayRaQuyetDinh, 'dd/mm/yyyy') : ''} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={qtChucVuItem} permission={permission}
                                onEdit={permission.write ? () => this.modal.show(qtChucVuItem) : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} onDelete={permission.delete ? this.delete : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} >
                            </TableCell>
                        </tr>)
                    }
                    {
                        tenChucVuList.slice(1).map((tenChucVuKey, index2) => <React.Fragment key={index2}>
                            <tr>
                                <TableCell content={tenChucVuKey} rowSpan={item.itemGroup[tenChucVuKey].length} />
                                <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                                    <>
                                        <span>{item.itemGroup[tenChucVuKey][0].ho + ' ' + item.itemGroup[tenChucVuKey][0].ten}</span><br />
                                        <a href='#' onClick={() => this.modal.show(item.itemGroup[tenChucVuKey][0])}>{item.itemGroup[tenChucVuKey][0].shcc}</a>
                                    </>
                                )}
                                />
                                <TableCell content={item.itemGroup[tenChucVuKey][0].tenBoMon} />
                                <TableCell content={item.itemGroup[tenChucVuKey][0].soQuyetDinh} />
                                <TableCell content={item.itemGroup[tenChucVuKey][0].ngayRaQuyetDinh ? T.dateToText(item.itemGroup[tenChucVuKey][0].ngayRaQuyetDinh, 'dd/mm/yyyy') : ''} />
                                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item.itemGroup[tenChucVuKey][0]} permission={permission}
                                    onEdit={permission.write ? () => this.modal.show(item.itemGroup[tenChucVuKey][0]) : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} onDelete={permission.delete ? this.delete : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} >
                                </TableCell>
                            </tr>
                            {
                                item.itemGroup[tenChucVuKey].slice(1).map((qtChucVuItem, index3) => <tr key={index3}>
                                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                                        <>
                                            <span>{qtChucVuItem.ho + ' ' + qtChucVuItem.ten}</span><br />
                                            <a href='#' onClick={() => this.modal.show(qtChucVuItem)}>{qtChucVuItem.shcc}</a>
                                        </>
                                    )}
                                    />
                                    <TableCell content={qtChucVuItem.tenBoMon} />
                                    <TableCell content={qtChucVuItem.soQuyetDinh} />
                                    <TableCell content={qtChucVuItem.ngayRaQuyetDinh ? T.dateToText(qtChucVuItem.ngayRaQuyetDinh, 'dd/mm/yyyy') : ''} />
                                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={qtChucVuItem} permission={permission}
                                        onEdit={permission.write ? () => this.modal.show(qtChucVuItem) : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} onDelete={permission.delete ? this.delete : () => T.notify('Vui lòng liên hệ phòng Tổ chức - cán bộ', 'warning')} >
                                    </TableCell>
                                </tr>)
                            }
                        </React.Fragment>)
                    }
                </React.Fragment>;
            }
        });

        let groupByDonViPage = <>
            {groupByDonViTable}
            <Pagination style={{ marginLeft: '70px' }} pageNumber={groupByDonViPageNumber} pageSize={groupByDonViPageSize} pageTotal={groupByDonViPageTotal} totalItem={groupByDonViTotalItem} pageCondition={groupByDonViPageCondition} getPage={this.getGroupByDonViPage} />
        </>;

        return this.renderPage({
            icon: 'fa fa-black-tie',
            title: ' Quá trình chức vụ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình chức vụ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-lg-4 col-md-12' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={value => { this.checkTimeType(value); }} />
                    {this.state.timeType != 0 && <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ' />}
                    {(this.state.timeType != 0) ? <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến' /> : <div className='col-lg-9' />}
                    <FormSelect className='col-12 col-md-4' multiple={true} ref={e => this.maDonVi = e} label='Theo đơn vị' data={SelectAdapter_DmDonVi} allowClear={true} minimumResultsForSearch={-1} placeHolder='Có thể chọn nhiều đơn vị' />
                    <FormSelect className='col-12 col-md-4' multiple={true} ref={e => this.mulCanBo = e} label='Theo cán bộ cụ thể' data={SelectAdapter_FwCanBo} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect ref={e => this.gioiTinh = e} label='Theo giới tính' className='col-12 col-md-4' data={[
                        { id: '01', text: 'Nam' },
                        { id: '02', text: 'Nữ' },
                    ]} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-md-3' multiple={true} ref={e => this.mulMaChucVu = e} label='Theo chức vụ' data={SelectAdapter_DmChucVuV2} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-md-3' multiple={true} ref={e => this.mulMaChucDanh = e} label='Theo chức danh nghề nghiệp' data={SelectAdapter_DmNgachCdnnV2} allowClear={true} minimumResultsForSearch={-1} />
                    <FormTextBox type='number' className='col-md-3' ref={e => this.fromAge = e} label='Từ độ tuổi' />
                    <FormTextBox type='number' className='col-md-3' ref={e => this.toAge = e} label='Tới độ tuổi' />
                    <div className='col-12'>
                        <div className='row justify-content-between'>
                            <div className='form-group col-md-12' style={{ textAlign: 'right' }}>
                                <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                                    <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                                </button>
                                <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                                    <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormTabs
                        tabs={[
                            { title: 'Hiển thị mặc định', component: fullPage },
                            { title: 'Hiển thị theo cán bộ', component: groupByShccPage },
                            { title: 'Hiển thị theo đơn vị', component: groupByDonViPage }
                        ]}
                    />
                </div>

                <EditModal
                    ref={e => this.modal = e}
                    readOnly={!permission.write}
                    getQtChucVuAll={this.props.getQtChucVuAll}
                    create={this.props.createQtChucVuStaff}
                    update={this.props.updateQtChucVuStaff}
                    getDmChucVu={this.props.getDmChucVu}
                    requestModal={this.requestModal}
                    getSo={this.props.getSo}
                    checkDaSuDung={this.props.checkDaSuDung}
                    getStaff={this.props.getStaff}
                />
                <CreateRequest ref={e => this.requestModal = e} onHide={this.onHideRequest} />
            </>,
            backRoute: '/user/tccb',


            collapse: [
                { icon: 'fa-plus', name: 'Tạo mới quá trình chức vụ', permission: permission && permission.write, type: 'info', onClick: (e) => this.showModal(e) },
                {
                    icon: 'fa-download', name: 'Xuất excel', permission: permission.export, type: 'success', onClick: (e) => {
                        e.preventDefault();
                        const { listDonVi, fromYear, toYear, listShcc, listChucVu, gioiTinh, listChucDanh } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, listCv: null, gioiTinh: null };
                        const thoiChucVu = 0;
                        const timeType = (this.state.timeType) ? this.state.timeType : 0;
                        T.handleDownload(`/api/tccb/qua-trinh/chuc-vu/download-excel/${listShcc ? listShcc : null}/${listDonVi ? listDonVi : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${timeType}/${listChucVu ? listChucVu : null}/${gioiTinh ? gioiTinh : null}/${thoiChucVu ? thoiChucVu : null}/${listChucDanh ? listChucDanh : null}`, 'chucvu.xlsx');
                    }
                },
                { icon: 'fa-pencil-square-o', name: 'Import dữ liệu bổ nhiệm/thôi chức vụ', permission: permission && permission.import, onClick: () => this.props.history.push('/user/tccb/qua-trinh/chuc-vu/import'), type: 'success' },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtChucVu: state.tccb.qtChucVu });
const mapActionsToProps = {
    getQtChucVuPage, deleteQtChucVuStaff, createQtChucVuStaff, updateQtChucVuStaff, getQtChucVuGroupPage, getQtChucVuAll, getDmChucVu, getQtChucVuGroupPageByDonVi, getSo, checkDaSuDung, getStaff
};
export default connect(mapStateToProps, mapActionsToProps)(QtChucVu);