import React, { Component } from 'react';
import { connect } from 'react-redux';
import { renderDataTable, TableHead, TableCell, FormTabs } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { xepLoaiHocBongMapper } from '../editPage';
import { addSinhVienHbkk, deleteSinhVienHbkk } from '../redux/redux';
import { getLichSuHbkkDssv, forwardLichSuHbkkDssv } from '../redux/lichSuHocBong';
import { getSvDssvHocBongKkhtPageConLai, getSvDssvHocBongKkhtPageChinhThuc, ctsvHocBongPhanBoConLai } from '../redux/dssvHocBongRedux';
import Pagination from 'view/component/Pagination';

export class LichSuHocBongDetail extends Component {
    state = { dssvDatDieuKien: [], filterDssvDatDieuKien: [], dssvLichSuHbkk: [], filterLichSuHbkk: {}, filterDanhSachConLai: {} }

    componentDidMount() {
        const { idLichSu } = this.props;
        // this.getLichSuHbkkDssv(idLichSu, {}, dieuKien.dsNhom.map(nhom => nhom.idQuery));
        this.props.getSvDssvHocBongKkhtPageChinhThuc(idLichSu);
        this.props.getSvDssvHocBongKkhtPageConLai(idLichSu, 1, 50);
    }

    kyLuatMapper = (danhSachKyLuat, danhSachNgayXuLy, soKyLuat) => {
        if (soKyLuat == 0) return [];
        let danhSachKyLuats = danhSachKyLuat.split('??');
        let danhSachNgayXuLys = danhSachNgayXuLy.split('??');
        let results = [];
        for (let i = 0; i < soKyLuat; i++) {
            danhSachKyLuats[i] = danhSachKyLuats[i]?.trim();
            danhSachNgayXuLys[i] = danhSachNgayXuLys[i]?.trim();
        }
        for (let i = 0; i < soKyLuat; i++) {
            let s = danhSachKyLuats[i],
                t = danhSachNgayXuLys[i] ? T.dateToText(Number(danhSachNgayXuLys[i]), 'dd/mm/yyyy HH:MM') : '';
            results.push(<div key={results.length}> <span>
                {i + 1}. {s} {t ? `(${t})` : ''}
            </span></div>);
        }
        return results;
    }

    handleKeySearchSvDat = (data) => {
        const { dssvDatDieuKien } = this.state;
        this.setState({ filterDssvDieuKien: { ...this.state.filterDssvDieuKien, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            const { ks_mssv, ks_hoTen, ks_tenKhoa, ks_tenNganh } = this.state.filterDssvDieuKien;
            this.setState({
                filterDssvDatDieuKien: dssvDatDieuKien.filter(sv => (
                    sv.mssv.toLowerCase().includes(ks_mssv !== undefined ? ks_mssv.toLowerCase() : '')
                    && sv.hoTen.toLowerCase().includes(ks_hoTen !== undefined ? ks_hoTen.toLowerCase() : '')
                    && sv.tenKhoa.toLowerCase().includes(ks_tenKhoa !== undefined ? ks_tenKhoa.toLowerCase() : '')
                    && sv.tenNganh.toLowerCase().includes(ks_tenNganh !== undefined ? ks_tenNganh.toLowerCase() : '')
                ))
            });
        });
    }

    handleKeySearchLichSuHbkk = (data) => {
        const [key, value] = data.split(':');
        this.setState({ filterLichSuHbkk: { ...this.state.filterLichSuHbkk, [key]: value } }, () => {
            this.props.getSvDssvHocBongKkhtPageChinhThuc(this.props.idLichSu, this.state.filterLichSuHbkk);
        });
    }

    handleKeySearchDanhSachConLai = (data) => {
        const [key, value] = data.split(':');
        this.setState({ filterDanhSachConLai: { ...this.state.filterDanhSachConLai, [key]: value } }, () => {
            this.props.getSvDssvHocBongKkhtPageConLai(this.props.idLichSu, undefined, undefined, undefined, this.state.filterDanhSachConLai);
        });
    }


    getLichSuHbkkDssv = (idLichSuDs) => {
        const { filterLichSuHbkk, filterDanhSachConLai } = this.state;
        this.props.getSvDssvHocBongKkhtPageChinhThuc(idLichSuDs, filterLichSuHbkk);
        this.props.getSvDssvHocBongKkhtPageConLai(idLichSuDs, undefined, undefined, undefined, filterDanhSachConLai);
    }

    phanBoConLai = (idLichSu) => {
        const { kinhPhiConLai } = this.props.lichSuHocBong ?? {};
        // const kinhPhiThatSu = Math.max(0, kinhPhiConLai - kinhPhiPhatSinh);
        if (!kinhPhiConLai || kinhPhiConLai <= 0) return T.alert('Không còn kinh phí để phân chia!<br/>', 'error');
        T.confirm('Xác nhận thao tác?', `Kinh phí còn lại: </br><span class="text-danger"><b>${T.numberDisplay(kinhPhiConLai)} VNĐ</b></span>`, isConfirm => {
            if (!isConfirm) return;
            T.alert('Vui lòng đợi giây lát!', 'warning');
            this.props.ctsvHocBongPhanBoConLai(idLichSu, () => {
                this.getLichSuHbkkDssv(idLichSu);
                this.props.onChange && this.props.onChange();
            });
        });
    }

    downloadExcel = (idLichSu) => {
        T.customConfirm('Xác nhận tải danh sách', '', 'warning', false, {
            all: { text: 'Tải tất cả', className: 'bg-primary' },
            official: { text: 'Tải được nhận', className: 'bg-success' },
        }, option => {
            if (option == 'official') {
                T.handleDownload(`/api/ctsv/lich-su-hbkk/dssv/download-excel?id=${JSON.stringify(idLichSu)}`);
            } else if (option == 'all') {
                T.handleDownload(`/api/ctsv/lich-su-hbkk/dssv/download-excel-all?id=${JSON.stringify(idLichSu)}`);
            }
        });
    }

    congBoDanhSach = (idLichSu) => {
        T.customConfirm('Bạn có muốn gửi thông báo đến phòng tài chính?', '', null, false, {
            no: { text: 'Không', value: 0, className: 'bg-danger' },
            yes: { text: 'Có', value: 1, className: 'bg-success' },
        }, notify => notify != null && this.props.forwardLichSuHbkkDssv(idLichSu, 1, notify));
    }

    thuHoiDanhSach = (idLichSu) => {
        T.confirm('Xác nhận thu hồi danh sách?', '', isConfirm => isConfirm && this.props.forwardLichSuHbkkDssv(idLichSu, 0, 0));
    }

    componentLichSuHbkkDssvDuKien = (dieuKien, idLichSu) => {
        const { listChinhThuc } = this.props.svDssvHocBongKkht ?? {};
        const { kichHoat, tcHandled } = this.props.lichSuHocBong ?? {};
        return (<div>
            <div className='d-flex justify-content-between align-items-baseline'>
                <h5 className='font-weight-bold text-primary'>Danh sách sinh viên nhận học bổng </h5>
                <div className='d-flex justify-content-end align-items-baseline'>
                    {listChinhThuc?.length ? <>
                        {kichHoat == 1 && <button className='btn btn-primary' type='button' onClick={() => this.congBoDanhSach(idLichSu)}><i className='fa fa-share mr-1' />Chuyển tiếp</button>}
                        {kichHoat == 2 && <button className='btn btn-danger' type='button' disabled={tcHandled} onClick={() => this.thuHoiDanhSach(idLichSu)}><i className='fa fa-undo mr-1' />Thu hồi</button>}
                        <button className='btn btn-success' type='button' onClick={() => this.downloadExcel(idLichSu)}><i className='fa fa-file-excel-o mr-1' />Xuất Excel</button>
                    </> : null}
                </div>
            </div>

            {renderDataTable({
                data: listChinhThuc,
                header: 'thead-light',
                stickyHead: listChinhThuc?.length > 12,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>STT</th>
                        <TableHead style={{ width: '10%', whiteSpace: 'nowrap' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearchLichSuHbkk} />
                        <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Họ Tên' keyCol='hoTen' onKeySearch={this.handleKeySearchLichSuHbkk} />
                        {/* <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Ngành' keyCol='tenNganh' onKeySearch={this.handleKeySearchLichSuHbkk} /> */}
                        {dieuKien.loaiDieuKien == 0 ? <TableHead style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }} content='Khoa' keyCol='tenKhoa' onKeySearch={this.handleKeySearchLichSuHbkk} /> :
                            <TableHead style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }} content='Ngành' keyCol='tenNganh' onKeySearch={this.handleKeySearchLichSuHbkk} />}
                        <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Khóa sinh viên</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Xếp loại</th>
                        <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                        <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐRL</th>
                        <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tín chỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kỷ luật</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Học bổng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kinh phí</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (<tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    {dieuKien.loaiDieuKien == 0 ? <TableCell content={item.tenKhoa || ''} /> : <TableCell content={item.tenNganh || ''} />}
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={xepLoaiHocBongMapper[item.tinhTrangXetHocBong || '']} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.dtb || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.drl || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinChiDangKy || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soKyLuat ? this.kyLuatMapper(item.danhSachKyLuat, item.danhSachNgayXuLy, item.soKyLuat) : ''} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTienNhan || ''} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: item.totalUse > (item.kinhPhiKhoa ? item.kinhPhiKhoa : item.kinhPhiNganh) ? '#f7de97' : '' }}
                        content={<><b>{T.numberDisplay(item.totalUse || '')}</b>/{T.numberDisplay((item.kinhPhiKhoa ? item.kinhPhiKhoa : item.kinhPhiNganh) || '')}</>} />
                    <TableCell type='buttons'>
                        <>
                            <Tooltip title='Xóa' arrow>
                                <button className='btn btn-danger' disabled={kichHoat == 2} onClick={e => {
                                    e.preventDefault();
                                    T.confirm('Xóa sinh viên', 'Bạn có muốn xóa sinh viên ra khỏi danh sách', isConfirm =>
                                        isConfirm && this.props.deleteSinhVienHbkk(item.id, () => {
                                            this.getLichSuHbkkDssv(idLichSu);
                                            this.props.onChange && this.props.onChange();
                                        })
                                    );
                                }}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>
                        </>
                    </TableCell>
                </tr>)
            })}
        </div>);
    }

    componentDssvConLai = (dieuKien, idLichSu) => {
        const { pageNumber, pageSize, pageTotal, list } = this.props.svDssvHocBongKkht?.pageConLai || {};
        const { dtbHocKyMin = '', drlHocKyMin = '', soTinChiHocKy = '' } = this.props.svDotXetHocBongKkht?.data || {};
        const { kichHoat, tcHandled } = this.props.lichSuHocBong ?? {};
        return (<div>
            <div className='d-flex justify-content-between align-items-baseline'>
                <h5 className='text-primary'>Danh sách sinh viên không nhận học bổng</h5>
                <div className='d-flex justify-content-end align-items-baseline' style={{ gap: '1rem' }}>
                    <button className='btn btn-primary' type='button' disabled={tcHandled} onClick={() => this.phanBoConLai(idLichSu)}><i className='fa fa-sort-amount-desc' />Phân bổ còn lại</button>
                    <Pagination style={{ position: '', right: 0 }} {...{ pageNumber, pageSize, pageTotal }} getPage={(pageNumber, pageSize) => this.props.getSvDssvHocBongKkhtPageConLai(idLichSu, pageNumber, pageSize)} />
                </div>
            </div>
            {renderDataTable({
                data: list,
                header: 'thead-light',
                stickyHead: list?.length > 12,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                        <TableHead style={{ width: '10%', textAlign: 'left', whiteSpace: 'nowrap' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearchDanhSachConLai} />
                        <TableHead style={{ width: '15%', textAlign: 'left', whiteSpace: 'nowrap' }} content='Họ Tên' keyCol='hoTen' onKeySearch={this.handleKeySearchDanhSachConLai} />
                        {dieuKien.loaiDieuKien == 0 ? <TableHead style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }} content='Khoa' keyCol='tenKhoa' onKeySearch={this.handleKeySearchDanhSachConLai} /> :
                            <TableHead style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }} content='Ngành' keyCol='tenNganh' onKeySearch={this.handleKeySearchDanhSachConLai} />}
                        <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Xếp loại</th>
                        <th style={{ width: '5%', textAlign: 'center', whiteSpace: 'nowrap' }}>ĐTB</th>
                        <th style={{ width: '5%', textAlign: 'center', whiteSpace: 'nowrap' }}>ĐRL</th>
                        <th style={{ width: '5%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tín chỉ</th>
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                        <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Học bổng</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Lũy tiến/Lý do không đạt</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (<tr key={index}>
                    <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell content={item.mssv || ''} />
                    <TableCell content={item.hoTen || ''} />
                    {dieuKien.loaiDieuKien == 0 ? <TableCell content={item.tenKhoa || ''} /> : <TableCell content={item.tenNganh || ''} />}
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={xepLoaiHocBongMapper[item.loaiHocBong] || ''} />
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={<><strong className={` ${item.diemTrungBinh < dtbHocKyMin ? 'text-danger pb-1' : ''}`}>{item.diemTrungBinh ?? ''}</strong>/<small className='text-muted'>{dtbHocKyMin}</small></>} />
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={<><strong className={` ${item.diemRenLuyen < drlHocKyMin ? 'text-danger pb-1' : ''}`}>{item.diemRenLuyen ?? ''}</strong>/<small className='text-muted'>{drlHocKyMin}</small></>} />
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={<><strong className={` ${item.tinChiDangKy < soTinChiHocKy ? 'text-danger pb-1' : ''}`}>{item.tinChiDangKy ?? ''}</strong>/<small className='text-muted'>{soTinChiHocKy}</small></>} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soKyLuat ? this.kyLuatMapper(item.danhSachKyLuat, item.danhSachNgayXuLy, item.soKyLuat) : ''} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tienHocBong || ''} />
                    {item.datHocBong == 1 ?
                        <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={<><b>{T.numberDisplay(item.totalUse || '0')}</b>/{T.numberDisplay((item.kinhPhiKhoa ? item.kinhPhiKhoa : item.kinhPhiNganh) || '')}</>} /> :
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.lyDoKhongDat ? <span className='text-danger'><i className='fa fa-times mr-1' /><b>{item.lyDoKhongDat}</b></span> : ''} />}
                    <TableCell type='buttons'>
                        {item.datHocBong == 1 &&
                            <Tooltip title='Thêm vào danh sách' arrow>
                                <button className='btn btn-success' disabled={kichHoat == 2} onClick={e => {
                                    e.preventDefault();
                                    T.confirm('Thêm sinh viên', 'Bạn có muốn thêm sinh viên vào danh sách', isConfirm =>
                                        isConfirm && this.props.addSinhVienHbkk({
                                            mssv: item.mssv,
                                            idLichSuDs: idLichSu,
                                            soTienNhan: item.tienHocBong,
                                            tinChiDangKy: item.tinChiDangKy,
                                            tinhTrangXetHocBong: item.loaiHocBong,
                                            dtb: item.diemTrungBinh,
                                            drl: item.diemRenLuyen
                                        }, () => {
                                            this.getLichSuHbkkDssv(idLichSu, {}, dieuKien.dsNhom.map(nhom => nhom.idQuery));
                                            this.props.onChange && this.props.onChange();
                                        })
                                    );
                                }}>
                                    <i className='fa fa-lg fa-plus' />
                                </button>
                            </Tooltip>}
                    </TableCell>
                </tr>)
            })}
        </div >);
    }

    render() {
        const { dieuKien, idLichSu } = this.props;
        return <FormTabs id='dsHocBong'
            contentClassName='mt-3'
            header={<><a className='btn btn-link text-secondary position-absolute' style={{ top: '-3.5rem', right: '0' }} href='#' onClick={(e) => e.preventDefault() || this.props.onHide()}><i className='fa fa-times'></i></a></>}
            tabs={[
                { title: 'Nhận học bổng', component: this.componentLichSuHbkkDssvDuKien(dieuKien, idLichSu) },
                { title: 'Còn lại', component: this.componentDssvConLai(dieuKien, idLichSu) },
            ]} />;
    }
}

const mapStateToProps = (state) => ({ system: state.system, svDssvHocBongKkht: state.ctsv.svDssvHocBongKkht, svDotXetHocBongKkht: state.ctsv.svDotXetHocBongKkht });

const mapDispatchToProps = { addSinhVienHbkk, getLichSuHbkkDssv, deleteSinhVienHbkk, getSvDssvHocBongKkhtPageConLai, getSvDssvHocBongKkhtPageChinhThuc, ctsvHocBongPhanBoConLai, forwardLichSuHbkkDssv };

export default connect(mapStateToProps, mapDispatchToProps)(LichSuHocBongDetail);