import React from 'react';
import { connect } from 'react-redux';
import { FormSelect, TableCell, TableHead, renderDataTable, loadSpinner } from 'view/component/AdminPage';

import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { createDtDangKyHocPhan, getDtDangKyHocPhanAll, getStudent, getHocPhan, checkCondition, getDtDangKyHocPhanByStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';

import DssvHocPhanModal from 'modules/mdDaoTao/dtDangKyHocPhan/component/DssvHocPhanModal';
class HuyChuyenHocPhan extends React.Component {
    state = { listHocPhanChon: [], filter: {}, filterhp: {}, ksSearchHp: {}, sortTermHp: 'maHocPhan_ASC', isHpLoading: false, isShowSubj: false };
    listHocPhan = [];
    defaultSortTermHp = 'maHocPhan_ASC';

    getSemester = () => {
        let { namHoc, hocKy } = this.props.currentSemester;
        this.setState({
            namHoc, hocKy,
            filterhp: { ...this.state.filterhp, namHoc, hocKy }
        }, () => {
            if (this.state.isShowSubj) this.hocPhanFilter();
        });
    }

    getDataHp = () => {
        let filter = {
            ...this.state.filterhp,
            ...this.state.ksSearchHp,
            sort: this.state?.sortTermHp || this.defaultSortTermHp,
        };
        this.props.getHocPhan(filter, (value) => {
            this.setState({ listHocPhanChon: value, isShowSubj: true, isHpLoading: false });
        });
    }

    hocPhanFilter = () => {
        this.setState({ isHpLoading: true }, () => this.getDataHp());
    };

    handleKeySearchHp = (data) => {
        this.setState({ ksSearchHp: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getDataHp());
    }

    onSortHp = (sortTerm) => {
        this.setState({ sortTermHp: sortTerm }, () => this.getDataHp());
    }

    showModal = (e, item) => {
        e.preventDefault();
        this.dssvHocPhanModal.show(item);
    }

    renderListHocPhan = (list) => renderDataTable({
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: list.length > 12 ? true : false,
        divStyle: { height: '55vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                {/* <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}></th> */}
                <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Sĩ số' keyCol='siSo'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tín chỉ' keyCol='tinChi'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng tiết' keyCol='tongTiet'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVien'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Trợ giảng' keyCol='troGiang'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDau'
                    onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThuc'
                    onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng học phần' keyCol='tinhTrangHocPhan'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={(e) => this.showModal(e, hocPhan)}>
                                <TableCell style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                {/* <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={hocPhan.isChon} permission={{ write: true }}
                                    onChanged={() => this.showModal(e, hocPhan)} rowSpan={rowSpan}
                                /> */}
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.maLop} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(hocPhan.siSo ? hocPhan.siSo : '0') + '/' + (hocPhan.soLuongDuKien ? hocPhan.soLuongDuKien : '0')} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tenTinhTrang} rowSpan={rowSpan} />
                                {/* <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={rowSpan}>
                                    <Tooltip title={'Chỉnh sửa'} arrow>
                                        <button className='btn btn-primary' onClick={(e) => e && e.preventDefault() || this.showModal(e, hocPhan)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </button>
                                    </Tooltip>
                                </TableCell> */}
                            </tr>);
                    }
                    else {
                        rows.push(<tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        </tr>);
                    }
                }
            }
            return rows;
        },
    });

    backgroundColor = (item) => {
        if (item.isChon == true) {
            return '#cfe2ff';
        } else if (item.tinhTrang == 4) {
            return '#ea868f';
        } else {
            return '#ffffff';
        }
    }

    luuHpThanhCong = () => {
        this.setState({ isShowSubj: false }, () => {
            this.listHocPhan = [];
            this.loaiHinhDaoTao.value('');
            this.khoaDaoTao.value('');
            this.khoaSinhVien.value('');
        });
    }

    render() {
        let { listHocPhanChon } = this.state;
        return (
            <>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='row justify-content'>
                            <div className='col-md-12'>
                                <div className='row'>
                                    <h6 className='col-md-10 tile-title mb-0'>Danh sách học phần</h6>

                                    <div className='col-md-2'>
                                        <div className='rows' style={{ textAlign: 'right' }}>
                                            <button className='btn btn-success' onClick={(e) => {
                                                e.preventDefault() || this.hocPhanFilter();
                                            }} >
                                                <i className='fa fa-search' /> Tìm kiếm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <FormSelect ref={(e) => (this.loaiHinhDaoTao = e)} className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtDangKyHocPhan')}
                                onChange={(value) =>
                                    this.setState({
                                        filterhp: { ...this.state.filterhp, loaiHinhDaoTao: value?.id || '' },
                                    }, () => this.lopSV.value(''))
                                } allowClear
                            />
                            <FormSelect ref={(e) => (this.khoaDaoTao = e)} className='col-md-3' label='Khoa' data={SelectAdapter_DtDmDonVi()}
                                onChange={(value) =>
                                    this.setState({
                                        filterhp: { ...this.state.filterhp, khoaDaoTao: value?.id || '' },
                                    }, () => this.lopSV.value(''))
                                } allowClear
                            />
                            <FormSelect ref={(e) => (this.khoaSinhVien = e)} className='col-md-3' label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTaoFilter('dtDangKyHocPhan')}
                                onChange={(value) =>
                                    this.setState({
                                        filterhp: { ...this.state.filterhp, khoaSinhVien: value?.id || '' },
                                    }, () => this.lopSV.value(''))
                                } allowClear
                            />
                            <FormSelect ref={(e) => (this.lopSV = e)} className='col-md-3' label='Lớp' data={SelectAdapter_DtLop({
                                role: 'dtDangKyHocPhan',
                                khoaSinhVien: this.state.filterhp?.khoaSinhVien,
                                heDaoTao: this.state.filterhp?.loaiHinhDaoTao,
                                donVi: this.state.filterhp?.khoaDaoTao
                            })}
                                onChange={(value) =>
                                    this.setState({
                                        filterhp: { ...this.state.filterhp, lopSV: value?.id || '' },
                                    })
                                } allowClear
                            />
                            {this.state.isShowSubj ? <div className='col-md-12'>
                                {this.state.isHpLoading ? loadSpinner() : this.renderListHocPhan(listHocPhanChon)}
                                <DssvHocPhanModal ref={e => this.dssvHocPhanModal = e} filterhp={this.state.filterhp} luuThanhCong={this.luuHpThanhCong} />
                            </div> : <div className='col-md-12'>{this.state.isHpLoading ? loadSpinner() : null}</div>}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => ({ system: state.system, dtDangKyHocPhan: state.daoTao.dtDangKyHocPhan });
const mapActionsToProps = { getStudent, createDtDangKyHocPhan, getDtDangKyHocPhanAll, getHocPhan, checkCondition, getDtDangKyHocPhanByStudent };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(HuyChuyenHocPhan);