import React from 'react';
import { AdminPage, TableCell, TableHead, renderDataTable, AdminModal, FormRichTextBox, FormTextBox, FormSelect, FormDatePicker, getValue, FormEditor } from 'view/component/AdminPage';
import { getGiangVienBuPage, giangVienBuVerify, giangVienBuCancel } from 'modules/mdDaoTao/dtQuanLyNghiBu/redux';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmPhongBaoBuFilter } from 'modules/mdDanhMuc/dmPhong/redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { getEmailSettings } from 'modules/mdDaoTao/dtSettings/redux';


class Note extends AdminModal {
    componentDidMount() {
        this.onHidden(() => {
            this.setState({ isWait: 0 });
        });
    }

    onShow = (item) => {
        this.setState({ item });
    }

    onSubmit = () => {
        const ghiChu = this.lyDo.value();
        if (!ghiChu.trim()) return T.alert('Vui lòng nhập lý do!', 'error', false, 2000);

        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn từ chối lịch bù này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const { userCreated, idTuan, ngayHoc, thu, tietBatDau, soTietBuoi, phong, maHocPhan } = this.state.item;
                this.setState({ isWait: 1 });
                this.props.giangVienBuCancel({ userCreated, ghiChu, idTuan, ngayHoc, thu, tietBatDau, soTietBuoi, phong, maHocPhan }, () => {
                    this.props.getData();
                    this.lyDo.value('');
                    this.hide();
                });
            }
        });
    }

    render = () => {
        let { isWait } = this.state;

        return this.renderModal({
            title: 'Ghi chú',
            isShowSubmit: false,
            body: <div className='row'>
                <FormRichTextBox ref={e => this.lyDo = e} type='text' className='col-md-12' label='Lý do' required />
            </div>,
            postButtons: <button type='submit' className='btn btn-danger' disabled={isWait}>
                <i className={isWait ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-fw fa-lg fa-power-off'} /> Từ chối
            </button>
        });
    }
}

class XetDuyetModal extends AdminModal {

    state = { emailSetting: {} }
    componentDidMount() {
        this.props.getEmailSettings(['baoBuTitle', 'baoBuEditorText', 'baoBuEditorHtml'], value => this.setState({ emailSetting: value }));
    }

    onShow = (item) => {
        let { ngayHoc, thu, tietBatDau, soTietBuoi, coSo, ngayNghi, thuNghi, soTietNghi, tietNghi, tenGiangVien, tenMonHoc, maHocPhan, ghiChu } = item;

        this.setState({
            ngayHoc, thu, tietBatDau, soTietBuoi, coSo, ngayNghi, thuNghi, soTietNghi, tietNghi, tenGiangVien, item, isWait: false,
            tenMonHoc, maHocPhan, isMail: false,
        }, () => {
            const { emailSetting } = this.state;
            this.ngayNghi.value(`Ngày ${T.dateToText(ngayNghi, 'dd/mm/yyyy')}, thứ ${thuNghi == 8 ? 'CN' : thuNghi}, tiết ${tietNghi} - ${tietNghi + soTietNghi - 1}, tuần ${new Date(ngayNghi).getWeek()}`);
            this.ngayBatDau.value(ngayHoc);
            this.thu.value(thu);
            this.tietBatDau.value(tietBatDau);
            this.soTiet.value(soTietBuoi);
            this.coSo.value(coSo);
            this.phong.value('');
            this.giangVien.value(tenGiangVien);
            this.ghiChu.value(ghiChu);

            let noiDung = emailSetting['baoBuEditorHtml'].replaceAll('{tenMonHoc}', T.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan).replaceAll('{teacher}', tenGiangVien || '').replaceAll('{thoiGianBu}', `Ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng `);
            this.subject.value(emailSetting['baoBuTitle'].replaceAll('{tenMonHoc}', T.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan));
            this.noiDung.html(noiDung);
        });
    }

    onSubmit = () => {
        let { userCreated, idTuan, ngayHoc, thu, tietBatDau, soTietBuoi, maHocPhan } = this.state.item,
            phong = getValue(this.phong),
            noiDung = this.noiDung?.value(),
            subject = this.subject?.value(),
            mailCc = this.mailCc?.value();

        if (mailCc && !T.validateEmail(mailCc)) return T.alert('Email không hợp lệ!', 'error', false, 2000);

        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn xác nhận lịch bù này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.setState({ isWait: true });
                this.props.giangVienBuVerify({
                    userCreated, idTuan, ngayHoc, thu, tietBatDau, soTietBuoi, phong, maHocPhan,
                    noiDung, subject, mailCc,
                }, () => {
                    this.props.getData();
                    this.hide();
                    this.subject?.value('');
                    this.noiDung?.value('');
                });
            }
        });
    }

    render = () => {
        let { coSo, ngayHoc, tietBatDau, soTietBuoi, isWait, tenMonHoc, maHocPhan, tenGiangVien, thu, emailSetting } = this.state;

        return this.renderModal({
            title: 'Xét duyệt lịch bù',
            size: 'large',
            isLoading: isWait,
            body: <div className='row'>
                <FormTextBox ref={e => this.ngayNghi = e} readOnly={true} className='col-md-12' label='Ngày nghỉ' />
                <FormSelect ref={e => this.coSo = e} className='col-md-2' label='Cơ sở' data={SelectAdapter_DmCoSo} onChange={e => this.setState({ coSo: e.id }, () => this.phong.value(''))} />
                <FormDatePicker ref={e => this.ngayBatDau = e} readOnly className='col-md-3' label='Ngày bù' type='date' />
                <FormSelect ref={e => this.thu = e} readOnly className='col-md-2' label='Thứ' data={SelectAdapter_DtDmThu} />
                <FormSelect ref={e => this.tietBatDau = e} readOnly className='col-md-5' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(coSo)} minimumResultsForSearch={-1} />
                <FormTextBox type='number' ref={e => this.soTiet = e} readOnly className='col-md-2' label='Số tiết bù' />
                <FormTextBox ref={e => this.giangVien = e} className='col-md-5' label='Giảng viên' readOnly />
                <FormSelect ref={e => this.phong = e} className='col-md-5' label='Phòng' data={SelectAdapter_DmPhongBaoBuFilter({ coSo, ngayHoc, tietBatDau, soTietBuoi })} required onChange={e => this.setState({ phong: e.id }, () => {
                    let noiDung = emailSetting['baoBuEditorHtml'].replaceAll('{tenMonHoc}', T.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan).replaceAll('{teacher}', tenGiangVien || '').replaceAll('{thoiGianBu}', `Ngày ${T.dateToText(ngayHoc, 'dd/mm/yyyy')}, thứ ${thu}, tiết ${tietBatDau} - ${parseInt(tietBatDau) + parseInt(soTietBuoi) - 1}, phòng ${e.id}`);
                    this.noiDung.html(noiDung);
                })} />
                <FormTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú (Đề xuất của giảng viên)' readOnly />
                <FormTextBox ref={e => this.mailCc = e} className='col-md-12' label='MailCC' />
                <FormTextBox ref={e => this.subject = e} className='col-md-12' label='Tiêu đề' readOnly />
                <FormEditor ref={e => this.noiDung = e} className='col-md-12' label='Nội dung' readOnly height={400} />
            </div>,
        });
    }
}

class GiangVienBuSection extends AdminPage {
    state = { filter: {} }

    getData = () => {
        this.getPageBu(1, 50, null);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPageBu(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, sort: sortTerm } }, () => this.getPageBu(pageNumber, pageSize, pageCondition));
    }

    getPageBu = (pageN, pageS, pageC, done) => {
        this.props.getGiangVienBuPage(pageN, pageS, pageC, { ...this.props.filter, ...this.state.filter }, page => {
            this.setState({ pageBu: page });
            done && done();
        });
    }

    mapperStatus = {
        0: { icon: 'fa fa-lg fa-file-o', text: 'Đang xử lý', color: 'orange' },
        1: { icon: 'fa fa-lg fa-check-circle', text: 'Đã duyệt', color: 'green' },
        2: { icon: 'fa fa-lg fa-ban', text: 'Từ chối', color: 'red' },
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.state.pageBu || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null },
            user = this.props.system.user;

        let table = (list) => renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list, stickyHead: list?.length > 15,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Sĩ số' keyCol='siSo' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bù' typeSearch='date' keyCol='ngayBu' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Cơ sở' keyCol='coSo' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <TableHead style={{ minWidth: '150px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Tình trạng' keyCol='status' typeSearch='admin-select'
                        data={[{ id: 0, text: 'Đang xử lý' }, { id: 1, text: 'Đã duyệt' }, { id: 2, text: 'Từ chối' }]} onKeySearch={this.handleKeySearch} dropdownParent={document.body} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày nghỉ' typeSearch='date' keyCol='ngayNghi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ nghỉ' keyCol='thuNghi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết nghỉ' keyCol='tietNghi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Người đăng ký' keyCol='userMod' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian đăng ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                const icon = this.mapperStatus[item.status].icon,
                    text = this.mapperStatus[item.status].text,
                    color = this.mapperStatus[item.status].color;
                return (
                    <tr key={index} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.siSo} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenCoSo, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu == 8 ? 'Chủ nhật' : item.thu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}`} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={`${T.dateToText(item.thoiGianBatDau, 'HH:MM')} - ${T.dateToText(item.thoiGianKetThuc, 'HH:MM')}`} />
                        <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayNghi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thuNghi == 8 ? 'Chủ nhật' : item.thuNghi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(item.tietNghi && item.soTietNghi) ? `${item.tietNghi} - ${item.tietNghi + item.soTietNghi - 1}` : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenGiangVien} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeCreated} />
                        <TableCell type='buttons' style={{ textAlign: 'center', display: item.status || (!Number(user?.isPhongDaoTao) && !user.permissions.includes('developer:login')) ? 'none' : '' }} content={item}>
                            <Tooltip title='Duyệt lịch bù' arrow>
                                <button className='btn btn-success' onClick={e => e.preventDefault() || this.xetDuyet.show(item)}>
                                    <i className='fa fa-lg fa-check-square-o' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Từ chối lịch bù' arrow>
                                <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.note.show(item)}>
                                    <i className='fa fa-lg fa-ban' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr >
                );
            }
        });

        return (
            <>
                <XetDuyetModal ref={e => this.xetDuyet = e} giangVienBuVerify={this.props.giangVienBuVerify} getData={this.getPageBu} getEmailSettings={this.props.getEmailSettings} />
                <Note ref={e => this.note = e} giangVienBuCancel={this.props.giangVienBuCancel} getData={this.getPageBu} />
                <div className='d-flex'>
                    {<button className='btn btn-info' type='button' style={{ width: 'fit-content', margin: '10px' }} onClick={() => T.handleDownload(`/api/dt/thoi-khoa-bieu-giang-vien/export-lich-bu?filter=${T.stringify(this.props.filter)}`)}>
                        <i className='fa fa-lg fa-download' /> Export lịch bù
                    </button>}
                </div>
                {table(list)}

                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPageBu} pageRange={5} />
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getGiangVienBuPage, giangVienBuVerify, giangVienBuCancel, getEmailSettings };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(GiangVienBuSection);
