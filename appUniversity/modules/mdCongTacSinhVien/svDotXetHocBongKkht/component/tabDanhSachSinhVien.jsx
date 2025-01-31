import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TableCell, renderTable, renderDataTable, TableHead, loadSpinner } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import LichSuHocBongDetail from './danhSachKhongNhan';
import { xepLoaiHocBongMapper } from '../editPage';
import { getSvDssvTheoDieuKien } from '../redux/redux';
import { updateLichSuHbkkDssv, delelteLichSuDssvHbkk, getAllLichSuDssvHbkk, createLichSuDssvHbkk } from '../redux/lichSuHocBong';

export class DanhSachHocBongDuKienTab extends Component {
    state = { isLoading: false, dssvFilterDieuKien: [], lichSuDsHocBong: [], idLichSuEdit: null, dssvDieuKien: [], filterDssvDieuKien: [], }

    getDssvTheoDieuKien = (done) => {
        this.setState({ isLoading: true });
        const { dieuKien } = this.props;
        this.getLichSuDssvHbkk(dieuKien.id);
        this.props.getSvDssvTheoDieuKien(dieuKien.id, (data) => this.setState({
            dssvDieuKien: data,
            dssvFilterDieuKien: data
        }));

        done && done();
    }

    changeActiveDsLichSuHbkk = (item) => {
        this.props.updateLichSuHbkkDssv(item.id, { kichHoat: Number(!item.kichHoat) }, () => this.getLichSuDssvHbkk(item.idDieuKien, () => this.props.onChange && this.props.onChange()));
    }

    deleteLichSuDsHbkk = (item) => {
        if (item.kichHoat == 2) return T.notify('Không thể xóa danh sách đã công bố', 'danger');
        T.confirm('Xóa danh sách', 'Bạn có chắc muốn xóa danh sách này ?', isConfirm => {
            if (isConfirm) {
                this.setState({ idLichSuEdit: this.state.idLichSuEdit == item.id ? null : this.state.idLichSuEdit });
                this.props.delelteLichSuDssvHbkk(item.id, () => this.getDssvTheoDieuKien(() => this.props.onChange && this.props.onChange()));
            }
        });
    };

    getLichSuDssvHbkk = (idDieuKien, done) => {
        this.props.getAllLichSuDssvHbkk(idDieuKien, (items) => {
            this.setState({ isLoading: false, isTcHandled: items?.some(item => item.tcHandled) });
            done && done(items);
        });
    }

    handleKeySearch = (data) => {
        const { dssvDieuKien } = this.state;
        this.setState({ filterDssvDieuKien: { ...this.state.filterDssvDieuKien, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            const { ks_mssv, ks_hoTen, ks_tenKhoa, ks_tenNganh } = this.state.filterDssvDieuKien;
            this.setState({
                dssvFilterDieuKien: dssvDieuKien.filter(sv => (
                    sv.mssv.toLowerCase().includes(ks_mssv !== undefined ? ks_mssv.toLowerCase() : '')
                    && sv.hoTen.toLowerCase().includes(ks_hoTen !== undefined ? ks_hoTen.toLowerCase() : '')
                    && sv.tenKhoa.toLowerCase().includes(ks_tenKhoa !== undefined ? ks_tenKhoa.toLowerCase() : '')
                    && sv.tenNganh.toLowerCase().includes(ks_tenNganh !== undefined ? ks_tenNganh.toLowerCase() : '')
                ))
            });
        });
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

    saveLichSuDssvHbkk = (dieuKien) => {

        const { dssvDieuKien } = this.state;
        if (dssvDieuKien.length) {
            T.confirm('Lưu danh sách', 'Bạn có chắc muốn lưu lại danh sách này', isConfirm => {
                if (isConfirm) {
                    this.setState({ isLoading: true });
                    this.props.createLichSuDssvHbkk(dieuKien.id, this.state.dssvDieuKien, () => {
                        this.getLichSuDssvHbkk(dieuKien.id
                        );
                    });
                }
            });
        } else {
            T.notify('Không tìm thấy danh sách sinh viên cho cấu hình này', 'danger');
        }
    }

    componentLichSu = () => {
        const { dieuKien, permission, svLichSuHocBongKkht } = this.props;
        const { lichSuDsHocBong = [] } = svLichSuHocBongKkht ?? {};
        const { idLichSuEdit, isTcHandled } = this.state;
        return renderTable({
            getDataSource: () => lichSuDsHocBong || [],
            stickyHead: (lichSuDsHocBong && lichSuDsHocBong.length > 12) ? true : false,
            emptyTable: '',
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'left' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Người lưu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày lưu</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Tổng kinh phí</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Đã sử dụng</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Còn lại</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Phát sinh</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Tổng sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => (
                <tbody key={index}>
                    <tr style={{ background: 'white' }}>
                        <TableCell type='text' style={{ textAlign: 'left' }} content={index + 1} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={<>{item.kichHoat == 2 ? <i className='fa fa-lg fa-legal mr-3 text-warning'></i> : null} {item.staffModified} </>} />
                        <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'norwap' }} content={item.timeModified} dateFormat='dd/mm/yyyy HH:MM:ss' />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={T.numberDisplay(item.tongKinhPhi || '0')} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={T.numberDisplay(item.daSuDung || '0')} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={T.numberDisplay(item.kinhPhiConLai || '0')} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={T.numberDisplay(item.kinhPhiPhatSinh || '0')} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.tongSinhVien} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={{ ...permission, write: permission.write && !isTcHandled }} onChanged={() => this.changeActiveDsLichSuHbkk(item)} />
                        <TableCell type='buttons'>
                            <>
                                <Tooltip title='Xem chi tiết' arrow>
                                    <button className='btn btn-info' type='button' onClick={() => {
                                        this.setState({ idLichSuEdit: item.id, filterLichSuHbkk: {} });
                                    }}>
                                        <i className='fa fa-lg fa-pencil' />
                                    </button>
                                </Tooltip>
                                <Tooltip title='Xóa' arrow>
                                    <button className='btn btn-danger' type='button' onClick={() => { this.deleteLichSuDsHbkk(item); }}>
                                        <i className='fa fa-lg fa-trash' />
                                    </button>
                                </Tooltip>
                            </>
                        </TableCell>
                    </tr>
                    {idLichSuEdit == item.id ? <>
                        <tr style={{ background: 'white' }}>
                            <TableCell colSpan={10} content={
                                <LichSuHocBongDetail dieuKien={dieuKien} idLichSu={item.id} lichSuHocBong={item}
                                    onChange={() => {
                                        this.getLichSuDssvHbkk(dieuKien.id, () => this.props.onChange && this.props.onChange());
                                    }}
                                    onHide={() => this.setState({ idLichSuEdit: null })}
                                />
                            } />
                        </tr>
                    </> : null}
                </tbody>
            )
        });
    }

    componentDssv = () => {
        const { dieuKien } = this.props;
        const { dssvFilterDieuKien } = this.state;
        return renderDataTable({
            data: dssvFilterDieuKien,
            emptyTable: '',
            header: 'thead-light',
            stickyHead: dssvFilterDieuKien && dssvFilterDieuKien.length > 12,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <TableHead style={{ width: '10%', textAlign: 'left', whiteSpace: 'nowrap' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '15%', textAlign: 'left', whiteSpace: 'nowrap' }} content='Họ Tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                    {dieuKien.loaiDieuKien == 0 ? <TableHead style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }} content='Khoa' keyCol='tenKhoa' onKeySearch={this.handleKeySearch} /> :
                        <TableHead style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }} content='Ngành' keyCol='tenNganh' onKeySearch={this.handleKeySearch} />}
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Xếp loại</th>
                    <th style={{ width: '5%', textAlign: 'center', whiteSpace: 'nowrap' }}>ĐTB</th>
                    <th style={{ width: '5%', textAlign: 'center', whiteSpace: 'nowrap' }}>ĐRL</th>
                    <th style={{ width: '5%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tín chỉ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Học bổng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Lũy tiến</th>
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell content={index + 1} />
                        <TableCell content={item.mssv || ''} />
                        <TableCell content={item.hoTen || ''} />
                        {dieuKien.loaiDieuKien == 0 ? <TableCell content={item.tenKhoa || ''} /> : <TableCell content={item.tenNganh || ''} />}
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={xepLoaiHocBongMapper[item.loaiHocBong] || ''} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.diemTrungBinh ?? ''} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.diemRenLuyen ?? ''} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tinChiDangKy ?? ''} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soKyLuat ? this.kyLuatMapper(item.danhSachKyLuat, item.danhSachNgayXuLy, item.soKyLuat) : ''} />
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tienHocBong || ''} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={<><b>{T.numberDisplay(item.totalUse || '')}</b>/{T.numberDisplay((item.kinhPhiKhoa ? item.kinhPhiKhoa : item.kinhPhiNganh) || '')}</>} />
                    </tr>
                );
            }
        });
    }

    render() {
        const { dieuKien, svLichSuHocBongKkht } = this.props;
        const { lichSuDsHocBong } = svLichSuHocBongKkht ?? {};
        const { idLichSuEdit, isLoading } = this.state;
        return isLoading ? loadSpinner() : (<>
            {lichSuDsHocBong?.length > 0 &&
                <div className='mt-3'>
                    <h5>Danh sách đã lưu</h5>
                    {this.componentLichSu()}
                </div>}
            {idLichSuEdit == null && <div className='mt-3'>
                <div className='d-flex justify-content-between align-items-baseline'>
                    <h5>Kết quả lọc được</h5>
                    <div className='d-flex justify-content-end' style={{ gap: '0.5rem' }}>
                        <button className='btn btn-success' type='button' onClick={() => this.saveLichSuDssvHbkk(dieuKien)}>
                            <i className='fa fa-bookmark' />Lưu kết quả đã lọc
                        </button>
                    </div>
                </div>
                {this.componentDssv()}
            </div>}
            {/* <p>Tải xuống danh sách trên tại <span className='text-warning' style={{ cursor: 'pointer' }} onClick={() => this.downloadDssv(dieuKien)}>đây</span></p> */}
        </>);
    }
}

const mapStateToProps = (state) => ({ system: state.system, svLichSuHocBongKkht: state.ctsv.svLichSuHocBongKkht });

const mapDispatchToProps = { updateLichSuHbkkDssv, delelteLichSuDssvHbkk, getAllLichSuDssvHbkk, createLichSuDssvHbkk, getSvDssvTheoDieuKien };

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(DanhSachHocBongDuKienTab);