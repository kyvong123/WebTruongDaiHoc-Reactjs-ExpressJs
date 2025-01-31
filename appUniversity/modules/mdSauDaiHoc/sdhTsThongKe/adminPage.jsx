
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import { getDataThongKeDetail, SelectAdapter_ThongKe, exportScanDanhSachCcnn } from 'modules/mdSauDaiHoc/sdhTsThongKe/redux';
import { SelectAdapter_TkPhanHe, SelectAdapter_TkHinhThuc, SelectAdapter_TkNganh, exportPhieuBao, exportPhieuBaoMultiple } from './redux';
import { SelectAdapter_BmdkMonThiNgoaiNgu } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { SelectAdapter_SdhLoaiChungChiNgoaiNgu } from 'modules/mdSauDaiHoc/sdhLoaiChungChiNgoaiNgu/redux';
import { SelectAdapter_DmKyLuat } from 'modules/mdSauDaiHoc/sdhTsKyLuat/redux';
import { getSdhTsDiemThiThiSinh } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';
import ExportPhongThiModal from './section/ExportPhongThiModal';
import { exportSdhTsTrungTuyenPdf } from 'modules/mdSauDaiHoc/sdhTsXetTrungTuyen/redux';
import { ProcessModal } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/processModal';
import { exportScanDanhSachDanPhong } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/redux';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';

import PreviewPdf from 'modules/mdSauDaiHoc/sdhTsDmBieuMau/PreviewPdf';

import { Tooltip } from '@mui/material';
import T from 'view/js/common';


class SdhTsThongKe extends AdminPage {
    state = { filter: { mucThongKe: '', idDot: '' }, note: '', process: 0 }
    exportLichThi = {};
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            const prevState = this.props.history?.location?.state;
            let { mucThongKe } = prevState ? prevState : { mucThongKe: 'tkXetDuyet' };
            if (mucThongKe) {
                if (['tkPhanHe', 'tkHinhThuc', 'tkNganh'].includes(mucThongKe)) {
                    mucThongKe = 'tkXetDuyet';
                }
            }
            this.props.getSdhTsProcessingDot(dot => {
                this.setState({ idDot: dot.id, tenDot: dot.ten, filter: { mucThongKe, dot: dot.id } }, () => {
                    this.loaiThongKe.value(mucThongKe);
                    this.props.getDataThongKeDetail(this.state.filter, () => {
                        this.preCheckLichThi();
                    });
                });
            });

            T.socket.on('export-ds-dan-phong-sdh-ts-one', ({ process }) => {
                this.setState({ process });
            });
            T.socket.on('export-trung-tuyen-done', ({ path, fileName }) => {
                this.processModal.hide();
                T.download(`/api/sdh/ts/thong-ke/download-export?outputPath=${path}`, fileName);
            });
            T.socket.on('export-ccnn-done', ({ buffer, requester }) => {
                if (requester == this.props.system.user.email) {
                    this.processModal.hide();
                    this.previewPdf.show(buffer);
                    // T.download(`/api/sdh/ts/thong-ke/download-export?outputPath=${path}`, fileName);
                }
            });
        });
    }
    componentWillUnmount() {
        T.socket.off('export-ds-dan-phong-sdh-ts-one');
        T.socket.off('export-trung-tuyen-done');
        T.socket.off('export-ccnn-done');
    }
    handleDataExport = (filter) => {
        const { mucThongKe } = filter;
        const idDot = this.state.idDot;
        if (mucThongKe == 'tkTrungTuyenByNganh') {
            const { phanHe, maNganh, hinhThuc } = filter;
            if (!(phanHe)) return T.notify('Vui lòng chọn thông tin export', 'danger');
            const data = { idDot, maPhanHe: phanHe, maNganh, hinhThuc };
            this.props.exportSdhTsTrungTuyenPdf(data, () => this.processModal.show());
        }
        if (mucThongKe == 'tkCcnnByLoai') {
            const { phanHe } = filter;
            if (!(phanHe)) return T.notify('Vui lòng chọn thông tin export', 'danger');
            const data = { idDot, maPhanHe: phanHe };
            this.props.exportScanDanhSachCcnn(data, () => this.processModal.show());
        }
        if (mucThongKe == 'tkLichThi') {
            let filter = { ...filter, dot: idDot };
            this.exportLichThi.show(filter);
        }
    }

    handleDownload = () => {
        let filter = this.state.filter;
        let permission = this.getUserPermission('sdhTsThongKe', ['manage']);
        let { mucThongKe, dot, phanHe, hinhThuc, nganh } = filter;
        const listData = this.props.sdhTsThongKe ? this.props.sdhTsThongKe.items : [];
        let listButton = [];
        if (mucThongKe == 'tkXetDuyet' && dot && phanHe && hinhThuc && !nganh && listData.length) {
            listButton.push({ icon: 'fa-print', permission, name: 'Export DS Dự thi', className: 'btn btn-success', onClick: e => this.downloadExcelDsts(e) });
        } if (mucThongKe == 'tkXetDuyet' && listData.length && listData.filter(item => item.lichThiByMon && T.parse(item.lichThByMon, []).length)) {
            listButton.push({ icon: 'fa-send', permission, name: 'Export Phiếu báo', className: 'btn btn-success', onClick: e => e.preventDefault() || this.handleDownloadPhieuBao() });
        } if (mucThongKe == 'tkLichThi' && listData.length) {
            listButton.push({ icon: 'fa-print', permission, name: 'Export danh sách phòng thi', type: 'success', onClick: e => e.preventDefault() || this.handleDataExport({ listPhong: listData.map(i => i.id), ...filter }) });
        } if (mucThongKe == 'tkCcnnByLoai' && listData.length) {
            listButton.push({ icon: 'fa-print', permission, name: 'Export danh sách đạt chuẩn ngoại ngữ ', type: 'success', onClick: e => e.preventDefault() || this.handleDataExport(filter) });
        }
        if (mucThongKe == 'tkTrungTuyenByNganh' && listData.length) {
            listButton.push({ icon: 'fa-print', permission, name: 'Export danh sách trúng tuyển ', type: 'success', onClick: e => e.preventDefault() || this.handleDataExport(filter) });
        }
        return listButton;
    }


    downloadExcelDsts = (e) => {
        e.preventDefault();
        let { maDot, tvtPhanHe, tvtHinhThuc } = this.props.sdhTsThongKe?.items[0] || '';
        maDot = maDot.replace('-', '_');
        //TODO: Dùng print preview
        T.handleDownload(`/api/sdh/ts-thong-ke/export-dsts?filter=${T.stringify(this.state.filter)}`, `DSTS_${maDot}_${tvtHinhThuc}_${tvtPhanHe}.xlsx`);
    }

    handleDownloadPhieuBao = (item) => {
        if (item) {
            this.props.exportPhieuBao({ ...item });
        } else {
            let data = this.props.sdhTsThongKe?.items || [];
            data = data.filter(item => Array.isArray(T.parse(item.lichThiByMon)) && T.parse(item.lichThiByMon).length);
            if (data.length) this.props.exportPhieuBaoMultiple(data, (fileName) => {
                //TODO: Dùng print preview
                T.download(`/api/sdh/ts-thong-ke/download-export?fileName=${fileName}`);
            });
        }
    }

    preCheckLichThi = () => {
        if (this.state.filter.mucThongKe == 'tkXetDuyet') {
            let items = this.props.sdhTsThongKe?.items || [];
            if (items[0].lichThiByMon) {
                items = items.map(item => ({ ...item, lichThiByMon: T.parse(item.lichThiByMon, []) }));
                for (let { lichThiByMon } of items) {
                    if (!lichThiByMon) {
                        this.setState({ note: 'Lưu ý: Tồn tại thí sinh chưa được xếp lịch thi, thao tác in phiếu báo dự thi sẽ bỏ qua những thí sinh này. Chi tiết xem bảng bên dưới' });
                        return;
                    }
                }
            }
        }
    }


    mucThongKe = [
        { id: 'tkXetDuyet', text: 'Đăng ký tuyển sinh (đã duyệt)', },
        { id: 'tkLichThi', text: 'Danh sách phòng thi' },
        { id: 'tkDknnByMon', text: 'Thi ngoại ngữ' },
        { id: 'tkCcnnByLoai', text: 'Chứng chỉ theo loại' },
        { id: 'tkKyLuatByMucDo', text: 'Kỷ luật theo mức độ' },
        { id: 'tkTrungTuyenByNganh', text: 'Trúng tuyển theo ngành' }
    ];

    onChangeSelect = (value, select) => {
        const setNull = (state, nullFields) => {
            let rs = this.state[state];
            for (let field in rs) {
                if (nullFields.includes(field)) {
                    rs[field] = '';
                }
            }
            return rs;
        };

        if (select == 'muc-thong-ke') {
            let nullF = ['dot', 'phanHe', 'hinhThuc', 'nganh', 'monThi', 'loaiChungChi', 'kyLuat'];
            let filter = setNull('filter', nullF);
            this.setState({ filter: { ...filter, mucThongKe: value?.id, dot: this.state.idDot } }, () => {
                this.selectDot?.value('');
                this.selectPh?.value('');
                this.selectHt?.value('');
                this.selectN?.value('');
                this.selectMt?.value('');
                this.selectLoaiChungChi?.value('');
                this.selectKyLuat?.value('');
                this.props.getDataThongKeDetail(this.state.filter);
            });
        }
        else if (select == 'phanHe') {
            let nullF = ['hinhThuc', 'nganh'];
            let filter = setNull('filter', nullF);
            this.setState({ filter: { ...filter, phanHe: value?.id, dot: this.state.idDot } }, () => {
                this.selectHt?.value('');
                this.selectN?.value('');
                this.selectMt?.value('');
                this.props.getDataThongKeDetail(this.state.filter);
            });
        }
        else if (select == 'hinhThuc') {
            this.setState({ filter: { ...this.state.filter, hinhThuc: value?.id, dot: this.state.idDot } }, () => {
                if (!this.state.filter.nganh) this.selectN?.value('');
                this.props.getDataThongKeDetail(this.state.filter);
            });
        }
        else if (select == 'nganh') {
            this.setState({ filter: { ...this.state.filter, maNganh: value?.id, dot: this.state.idDot } }, () => {
                this.selectMt?.value('');
                this.props.getDataThongKeDetail(this.state.filter);
            });
        }
        else {
            this.setState({ filter: { ...this.state.filter, [select]: value?.id, dot: this.state.idDot } }, () => {
                !this.state.filter.dot && this.selectDot?.value('');
                !this.state.filter.hinhThuc && this.selectHt?.value('');
                !this.state.filter.phanHe && this.selectPh?.value('');
                this.props.getDataThongKeDetail(this.state.filter);
            });
        }

    }

    renderSection = () => {
        let filter = this.state.filter;
        let { mucThongKe } = filter;
        let selectGroup = null, table = null, note = null;
        if (mucThongKe == 'tkXetDuyet') {
            note = <strong className='text-danger' style={{ paddingLeft: '15px', margin: '10px 0' }} > {this.state.note}</strong >;
            selectGroup =
                <div className='row'>
                    <FormSelect className='col-md-3' ref={e => this.selectPh = e} data={SelectAdapter_TkPhanHe(filter)} label='Phân Hệ'
                        onChange={value => this.onChangeSelect(value, 'phanHe')} allowClear />
                    <FormSelect className='col-md-3' ref={e => this.selectHt = e} data={SelectAdapter_TkHinhThuc(filter)} label='Hình thức'
                        onChange={value => this.onChangeSelect(value, 'hinhThuc')} allowClear />
                    <FormSelect className='col-md-3' ref={e => this.selectN = e} data={SelectAdapter_TkNganh(filter)} label='Ngành'
                        onChange={value => this.onChangeSelect(value, 'nganh')} allowClear />
                </div>;
        }
        if (mucThongKe == 'tkDknnByMon') {
            selectGroup =
                <div className='row'>
                    <FormSelect className='col-md-3' ref={e => this.selectMt = e} data={SelectAdapter_BmdkMonThiNgoaiNgu({ idDot: filter.dot })} label='Môn ngoại ngữ' onChange={value => this.onChangeSelect(value, 'monThi')} allowClear />
                </div>;
        }
        if (mucThongKe == 'tkCcnnByLoai') {
            selectGroup = <div className='row'>
                <FormSelect className='col-md-3' key={'tkLichThi-2'} ref={e => this.selectPh = e} data={SelectAdapter_ThongKe({ ...this.state.filter, selectType: 'phanHe' })} label='Phân Hệ'
                    onChange={value => this.onChangeSelect(value, 'phanHe')} allowClear />
                <FormSelect className='col-md-4' ref={e => this.selectLoaiChungChi = e} data={SelectAdapter_SdhLoaiChungChiNgoaiNgu} label='CCNN' placeholder='CCNN'
                    onChange={value => this.onChangeSelect(value, 'loaiChungChi')} allowClear />
            </div>;
        }

        if (mucThongKe == 'tkKyLuatByMucDo') {
            selectGroup =
                <div className='row'>
                    <FormSelect className='col-md-4' ref={e => this.selectKyLuat = e} data={SelectAdapter_DmKyLuat} label='Kỷ luật'
                        onChange={value => this.onChangeSelect(value, 'kyLuat')} allowClear />
                </div>;
        }
        if (mucThongKe == 'tkTrungTuyenByNganh') {
            selectGroup =
                <div className='row'>
                    <FormSelect className='col-md-3' ref={e => this.selectPh = e} data={SelectAdapter_TkPhanHe(filter)} label='Phân Hệ'
                        onChange={value => this.onChangeSelect(value, 'phanHe')} allowClear />
                    <FormSelect className='col-md-3' ref={e => this.selectHt = e} data={SelectAdapter_TkHinhThuc(filter)} label='Hình thức'
                        onChange={value => this.onChangeSelect(value, 'hinhThuc')} allowClear />
                    <FormSelect className='col-md-3' ref={e => this.selectN = e} data={SelectAdapter_TkNganh(filter)} label='Ngành'
                        onChange={value => this.onChangeSelect(value, 'nganh')} allowClear />
                </div>;
        }
        if (mucThongKe == 'tkLichThi') {
            selectGroup =
                <div className='row'>
                    <FormSelect className='col-md-3' key={'tkLichThi-2'} ref={e => this.selectPh = e} data={SelectAdapter_ThongKe({ ...this.state.filter, selectType: 'phanHe' })} label='Phân Hệ'
                        onChange={value => this.onChangeSelect(value, 'phanHe')} allowClear />
                    <FormSelect className='col-md-3' key={'tkLichThi-3'} ref={e => this.selectN = e} data={SelectAdapter_ThongKe({ ...this.state.filter, selectType: 'nganh' })} label='Ngành'
                        onChange={value => this.onChangeSelect(value, 'nganh')} allowClear />
                    <FormSelect className='col-md-3' key={'tkLichThi-4'} ref={e => this.selectMt = e} data={SelectAdapter_ThongKe({ ...this.state.filter, selectType: 'monThi' })} label='Môn thi'
                        onChange={value => this.onChangeSelect(value, 'monThi')} allowClear />
                </div>;
        }

        table = this.table(mucThongKe);

        return (
            <div className='tile'>
                <div className='row'>
                    {note}
                </div>
                {selectGroup}
                {table}
            </div>
        );
    }

    table = (mucThongKe) => {
        let permission = this.getUserPermission('sdhTsThongKe', ['manage']);
        let list = this.props.sdhTsThongKe && this.props.sdhTsThongKe.items?.length ? this.props.sdhTsThongKe.items : [];
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu',
            getDataSource: () => list,
            header: 'thead-light',
            stickyHead: true,
            className: 'table-fix-col',
            divStyle: { height: '55vh' },
            renderHead: () => {
                if (mucThongKe == 'tkXetDuyet')
                    return (
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>SBD</th>
                            <th style={{ width: '25%' }}>Họ</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Tên</th>
                            <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Giới tính</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Ngày sinh</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Tỉnh/Thành phố</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành dự tuyển</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Ngành tốt nghiệp</th>
                            {/*//BTKT = Bổ túc kiến thức (tham gia bổ túc kiến thức trước ngày thi tuyển sinh cho học viên tốt nghiệp đại học/thạc sĩ các ngành gần, ngành liên quan với ngành tuyển sinh), ko nằm trong scope dự kiến => tạm thêm một tuỳ chọn tick ở sdhTsThongTinCoBan adminEditPage. */}
                            <th style={{ width: 'auto' }}>BTKT</th>
                            <th style={{ width: 'auto' }}>Ngoại ngữ</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ưu tiên</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại chứng chỉ</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>);
                else if (mucThongKe == 'tkDknnByMon')
                    return (
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Họ</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Tên</th>
                            <th style={{ width: 'auto' }}>SBD</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Mã môn thi</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Ngôn ngữ</th>
                        </tr>);
                else if (mucThongKe == 'tkCcnnByLoai')
                    return (
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '25%' }}>Họ</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Tên</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>SBD</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Ngoại ngữ</th>
                            <th style={{ width: '25%' }}>CCNN</th>

                        </tr>);
                else if (mucThongKe == 'tkKyLuatByMucDo')
                    return (
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '25%' }}>Họ</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Tên</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>SBD</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Mã môn thi</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Môn thi</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Kỷ luật</th>
                        </tr>);
                else if (mucThongKe == 'tkTrungTuyenByNganh')
                    return (
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Họ</th>
                            <th style={{ width: '25%' }}>Tên</th>
                            <th style={{ width: '25%' }}>Mã ngành</th>
                            <th style={{ width: '25%' }}>Tên ngành</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>SBD</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Phân hệ</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Hình thức</th>
                        </tr>);
                else if (mucThongKe == 'tkLichThi')
                    return (
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Phòng thi</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Cơ sở</th>
                            <th style={{ width: '60%', textAlign: 'center' }}>Ngành dự tuyển</th>
                            <th style={{ width: '40%', textAlign: 'center' }}>Môn thi</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Ngày thi</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Thí sinh tối đa</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    );
            },
            renderRow: (item, index) => {
                if (mucThongKe == 'tkXetDuyet')
                    return (
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.sbd} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ten} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.parse(item.gioiTinh, { vi: '' }).vi} />
                            <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.ngaySinh} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhThanhPho} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganhTnThs || item.nganhTnDh} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.btkt == 1 ? <i className='fa fa-lg fa-check-square-o' /> : <i className='fa fa-lg  fa-square-o' />} />
                            <TableCell style={{ whiteSpace: !item.dknn ? 'nowrap' : '' }} content={item.ccnn ? 'XT Ngoại ngữ' : item.dknn} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.doiTuongUuTien} />
                            <TableCell content={item.ccnn} />
                            <TableCell content={`${item.ghiChuTTCB || ''} ${item.listGhiChuCCNN ? (',' + item.listGhiChuCCNN) : ''}`} />
                            <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'right' }} content={item}  >
                                {permission.manage && item.sbd && item.lichThiByMon && T.parse(item.lichThiByMon).length ?
                                    <Tooltip title={'In phiếu báo dự thi'} arrow>
                                        <button className='btn btn-secondary' style={{ backgroundColor: 'green' }} onClick={e => e.preventDefault() || this.handleDownloadPhieuBao(item)}>
                                            <i className='fa fa-lg fa-print' />
                                        </button>
                                    </Tooltip>
                                    : null
                                }
                            </TableCell>
                        </tr>
                    );
                if (mucThongKe == 'tkDknnByMon')
                    return (
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ten} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.sbd} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maMonThi} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngonNgu} />
                        </tr>
                    );

                if (mucThongKe == 'tkCcnnByLoai')
                    return (
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ten} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.sbd} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngonNgu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiChungChi} />
                        </tr>
                    );
                if (mucThongKe == 'tkKyLuatByMucDo')
                    return (
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ten} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.sbd} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maMonThi} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonThi} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maKyLuat} - ${item.kyLuat}`} />
                        </tr>
                    );
                if (mucThongKe == 'tkTrungTuyenByNganh')
                    return (
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ho} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.sbd} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenPhanHe} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenHinhThuc} />
                        </tr>
                    );
                if (mucThongKe == 'tkLichThi')
                    return (
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenPhong} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.coSo} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={!item.loaiMonThi || item.loaiMonThi == 'NN' ? item.tenMonThi : item.loaiMonThi} />
                            <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.ngayThi} />
                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={`${item.daSap ? item.daSap : 0} / ${item.maxSize}`} />
                            <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'right' }} content={''} >
                                {permission.manage ? <Tooltip title={'In phòng thi'} arrow>
                                    <button className='btn btn-warning' onClick={(e) => e.preventDefault() || this.handleDataExport({ listPhong: [item.id], ...this.state.filter })}>
                                        <i className='fa fa-lg fa-print' />
                                    </button>
                                </Tooltip> : ''}
                            </TableCell>


                        </tr>
                    );
            },
        });
        return <>
            <div style={{ marginBottom: '10px' }}>
                Kết quả: {<b>{list.length}</b>} thí sinh
            </div>
            {table}
        </>;
    }

    render() {

        const prevState = this.props.history?.location?.state;

        return this.renderPage({
            title: 'Thống kê',
            icon: 'fa fa-table',
            backRoute: prevState ? '/user/sau-dai-hoc/tuyen-sinh/dashboard' : '/user/sau-dai-hoc/tuyen-sinh',
            subTitle: 'Đợt ' + this.state.tenDot, //Thống kê theo đợt đang kích hoạt xử lý dữ liệu
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Thống kê'
            ],
            header: <div className='row'>
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
                <ExportPhongThiModal ref={e => this.exportLichThi = e} exportPdf={this.props.exportScanDanhSachDanPhong} processModal={this.processModal} />
                <FormSelect ref={e => this.loaiThongKe = e} style={{ width: '250px', marginBottom: '0', marginRight: '10px' }} data={this.mucThongKe} placeholder='Mục thống kê' onChange={value => this.onChangeSelect(value, 'muc-thong-ke')} />
            </div>,
            content: <>
                <PreviewPdf ref={e => this.previewPdf = e} />
                {this.renderSection()}

            </>
            ,
            collapse: this.handleDownload()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhTsThongKe: state.sdh.sdhTsThongKe });
const mapActionsToProps = {
    getSdhTsProcessingDot, getDataThongKeDetail, getSdhTsDiemThiThiSinh, exportPhieuBao, exportPhieuBaoMultiple, exportScanDanhSachDanPhong, exportScanDanhSachCcnn, exportSdhTsTrungTuyenPdf
};
export default connect(mapStateToProps, mapActionsToProps)(SdhTsThongKe);
