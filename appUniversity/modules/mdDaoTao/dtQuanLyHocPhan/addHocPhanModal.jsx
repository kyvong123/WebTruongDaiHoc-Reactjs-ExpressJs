import React from 'react';
import { connect } from 'react-redux';
import { FormSelect, TableHead, TableCell, AdminModal, renderDataTable, FormTabs } from 'view/component/AdminPage';
import { createDtDangKyHocPhan, getDtDangKyHocPhanAll, updateDtDangKyHocPhan, deleteDtDangKyHocPhan } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { getHocPhan } from './redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from '../dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from '../dtDmHocKy/redux';
import T from 'view/js/common';
import { SelectAdapter_DtKhoaDaoTao } from '../dtKhoaDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDtDangKyHocPhanByStudent, checkCondition } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';



class AddHocPhanModal extends AdminModal {
    state = { listHocPhan: [], listHocPhanDKy: [], filter: {}, isShowSubmit: false, isSearch: false };
    loaiDangKy = {
        'KH': 'Theo kế hoạch',
        'NKH': 'Ngoài kế hoạch',
        'NCTDT': 'Ngoài chương trình đào tạo',
        'CT': 'Cải thiện',
        'HL': 'Học lại',
        'HV': 'Học vượt',
    }

    componentDidMount() {
        this.tab.tabClick(null, 0);
        this.onShown(() => {
            this.loaiHinhDaoTao.focus();
        });
        this.onHidden(() => {
            this.setState({ listHocPhanDKy: [], isShowSubmit: false });
            this.props.getThoiKhoaBieu();
            this.props.getLichSu();
        });
    }

    onShow = (item) => {
        const { curNamHoc, curHocKy } = item;
        this.namHoc.value(curNamHoc);
        this.hocKy.value(curHocKy);
        this.setState({ filter: { namHoc: curNamHoc, hocKy: curHocKy } }, () => this.getData());
    }

    getData = () => {
        let { namHoc, hocKy } = this.state.filter;
        this.props.getDtDangKyHocPhanByStudent(this.props.mssv, { namHoc, hocKy }, value => this.setState({ listHocPhanDKy: value }));
    }

    getDataHocPhan = () => {
        let { khoaDaoTao, loaiHinhDaoTao } = this.state.filter;
        if (!loaiHinhDaoTao) {
            T.notify('Loại hình đào tạo bị trống!', 'danger');
            this.loaiHinhDaoTaoHp.focus();
        } else if (!khoaDaoTao) {
            T.notify('Khoa bị trống!', 'danger');
            this.khoaDaoTaoHp.focus();
        } else {
            this.props.getHocPhan(this.state.filter, this.props.mssv, (value) => {
                this.setState({ listHocPhan: value, isSearch: true });
            });
        }

    };

    renderDangKyMoi = () => {
        return (
            <>
                <div className='row'>
                    <FormSelect ref={(e) => (this.loaiHinhDaoTao = e)} className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} required
                        onChange={(value) =>
                            this.setState({
                                filter: { ...this.state.filter, loaiHinhDaoTao: value?.id || '' },
                            }, () => this.lopSVHp.value(''))
                        }
                    />
                    <FormSelect ref={(e) => (this.khoaDaoTao = e)} className='col-md-3' label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} required
                        onChange={(value) =>
                            this.setState({
                                filter: { ...this.state.filter, khoaDaoTao: value?.id || '' },
                            }, () => this.lopSVHp.value(''))
                        }
                    />
                    <FormSelect ref={(e) => (this.khoaSinhVien = e)} className='col-md-3' label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTao}
                        onChange={(value) =>
                            this.setState({
                                filter: { ...this.state.filter, khoaSinhVien: value?.id || '' },
                            }, () => this.lopSVHp.value(''))
                        } allowClear
                    />
                    <FormSelect ref={(e) => (this.lopSVHp = e)} className='col-md-3' label='Lớp' data={SelectAdapter_DtLopFilter({
                        khoaSinhVien: this.state.filter?.khoaSinhVien,
                        heDaoTao: this.state.filter?.loaiHinhDaoTao,
                        donVi: this.state.filter?.khoaDaoTao
                    })}
                        onChange={(value) =>
                            this.setState({
                                filter: { ...this.state.filter, lopSV: value?.id || '' },
                            })
                        } allowClear
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'end' }} className='form-group col-md-12' >
                    <button className='btn btn-success' onClick={(e) => {
                        e.preventDefault() || this.getDataHocPhan();
                    }} >
                        <i className='fa fa-lg fa-search-plus' /> Tìm kiếm
                    </button>
                </div>

                {this.state.isSearch ?
                    <div className='row'>
                        <div className='col-md-12'>
                            <label>Danh sách học phần:</label>
                            {this.renderListHocPhan(this.state.listHocPhan)}
                        </div>
                    </div>
                    : <div />
                }
            </>
        );
    }

    checkDieuKien = (item) => {
        let mssv = this.props.mssv,
            maHocPhan = item.maHocPhan;
        let { filter, listHocPhanDKy } = this.state;
        let { namHoc, hocKy } = filter;
        listHocPhanDKy = listHocPhanDKy.filter(e =>
            e.maMonHoc == item.maMonHoc &&
            e.khoaDangKy == item.khoaDangKy &&
            e.khoaSinhVien == item.khoaSinhVien &&
            e.loaiHinhDaoTao == item.loaiHinhDaoTao);
        if (listHocPhanDKy.length == 1) {
            let hocPhan = listHocPhanDKy[0];
            T.confirm('Cảnh báo', `Bạn sẽ đăng ký học phần ${maHocPhan} thay cho ${hocPhan.maHocPhan}?`, 'warning', true, isConfirm => {
                if (isConfirm) {
                    T.alert('Đang xử lý', 'warning', false, null, true);
                    let condition = { mssv, maHocPhan: hocPhan.maHocPhan },
                        changes = { maHocPhan },
                        filter = { tenMonHoc: T.parse(item.tenMonHoc, { vi: '' })?.vi, namHoc, hocKy };
                    this.props.updateDtDangKyHocPhan(condition, changes, filter, (value) => {
                        if (value) T.alert('Chuyển lớp thất bại', 'warning', false, 1000);
                        else {
                            T.alert('Chuyển lớp thành công', 'success', false, 1000);
                            this.getDataHocPhan();
                            this.getData();
                        }
                    });
                }
            });
        } else {
            const list = { listMSSV: mssv, itemHocPhan: maHocPhan + ', ' + item.siSo };
            this.props.checkCondition(list, (items) => {
                let message = items.listMess[0];
                if (message.isDangKy == false) T.alert(`Sinh viên không thể đăng ký học phần ${message.maHocPhan}`, 'warning', false, 1000);
                else {
                    T.confirm(`Bạn có muốn đăng ký học phần ${message.maHocPhan}?`, `<div>${message.maLoaiDKy && this.loaiDangKy[message.maLoaiDKy] ? `Loại đăng ký: ${this.loaiDangKy[message.maLoaiDKy]}<br />` : ''}  ${message.ghiChu ? `Ghi chú: ${message.ghiChu}` : ''}</div>`, 'warning', true, isConfirm => {
                        if (isConfirm) {
                            T.alert('Đang xử lý', 'warning', false, null, true);
                            let filter = { namHoc, hocKy };
                            this.props.createDtDangKyHocPhan(items.listMess, filter, (value) => {
                                if (value) T.alert('Đăng ký thất bại', 'warning', false, 1000);
                                else {
                                    T.alert('Đăng ký thành công', 'success', false, 1000);
                                    this.getDataHocPhan();
                                    this.getData();
                                }
                            });
                        }
                    });
                }
            });
        }
    }

    huyHocPhan = (item) => {
        T.confirm('Cảnh báo', `Bạn có chắc muốn hủy đăng ký học phần ${item.maHocPhan}?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xử lý', 'warning', false, null, true);
                let mssv = this.props.mssv;
                let { namHoc, hocKy } = this.state.filter;
                let filter = {
                    tenMonHoc: T.parse(item.tenMonHoc, { vi: '' })?.vi,
                    namHoc, hocKy,
                    ghiChu: ''
                };
                this.props.deleteDtDangKyHocPhan(item.maHocPhan, mssv, filter, () => {
                    T.alert('Huỷ học phần thành công', 'success', false, 1000);
                    this.getData();
                });
            }
        });
    }

    // renderListHocPhan = (list) => renderDataTable({
    //     data: list,
    //     emptyTable: 'Không tìm thấy học phần!',
    //     header: 'thead-light',
    //     divStyle: { height: '40vh' },
    //     stickyHead: list.length > 7,
    //     renderHead: () => (
    //         <tr>
    //             <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
    //             <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
    //             <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên</th>
    //             <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Phòng</th>
    //             <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày BD</th>
    //             <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày KT</th>
    //             <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
    //             <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tiết</th>
    //             <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Giảng viên</th>
    //             <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Trợ giảng</th>
    //             <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Sĩ số</th>
    //         </tr>
    //     ),
    //     renderRow: (item, index) => {
    //         const isDangKy = this.state.listHocPhanDKy.some(cur => cur.maHocPhan == item.maHocPhan);
    //         return (
    //             <tr key={index} style={{ backgroundColor: isDangKy ? '#98fb98' : '', cursor: isDangKy ? '' : 'pointer' }} onClick={() => isDangKy ? {} : this.checkDieuKien(item)} >
    //                 <TableCell style={{ textAlign: 'right' }} content={index + 1} />
    //                 <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maHocPhan} />
    //                 <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
    //                 <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.phong} />
    //                 <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayBatDau} />
    //                 <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKetThuc} />
    //                 <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu} />
    //                 <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietBatDau ? `${item.tietBatDau} - ${parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1}` : ''} />
    //                 <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
    //                 <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
    //                 <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={(item.siSo || '0') + '/' + (item.soLuongDuKien || '100')} />
    //             </tr>
    //         );
    //     },
    // });

    renderListHocPhan = (list) => renderDataTable({
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: list.length > 12 ? true : false,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <TableHead style={{ width: '30%' }} content='Mã học phần' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHP}
                />
                <TableHead style={{ width: '50%' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHP}
                />
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                <th style={{ width: 'auto' }}>TC</th>
                <th style={{ width: 'auto' }}>Tổng tiết</th>
                <th style={{ width: 'auto' }}>Phòng</th>
                <th style={{ width: 'auto' }}>Thứ</th>
                <th style={{ width: 'auto' }}>Tiết</th>
                <th style={{ width: 'auto' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trợ giảng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Sĩ số</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TTHP</th>
            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    const isDangKy = this.state.listHocPhanDKy.some(cur => cur.maHocPhan == hocPhan.maHocPhan);
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: isDangKy ? '#98fb98' : '', cursor: isDangKy ? '' : 'pointer' }} onClick={() => isDangKy ? {} : this.checkDieuKien(hocPhan)}>
                                <TableCell style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maLop} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={(hocPhan.siSo ? hocPhan.siSo : '0') + '/' + (hocPhan.soLuongDuKien ? hocPhan.soLuongDuKien : '0')} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tenTinhTrang} rowSpan={rowSpan} />
                            </tr>);
                    }
                    else {
                        rows.push(<tr key={rows.length} style={{ backgroundColor: isDangKy ? '#98fb98' : '', cursor: isDangKy ? '' : 'pointer' }} onClick={() => isDangKy ? {} : this.checkDieuKien(hocPhan)}>
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

    render = () => {
        let { listHocPhanDKy } = this.state;
        let table = renderDataTable({
            data: listHocPhanDKy,
            emptyTable: 'Không có học phần được đăng ký',
            header: 'thead-light',
            divStyle: { height: '40vh' },
            stickyHead: listHocPhanDKy.length > 10,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thứ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tiết</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Giảng viên</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Trợ giảng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}></th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phong} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayBatDau} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKetThuc} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietBatDau ? `${item.tietBatDau} - ${parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1}` : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell type='buttons' content={item} permission={{ delete: true }} onDelete={() => this.huyHocPhan(item)} />
                    </tr>
                );
            },
        });

        return this.renderModal({
            title: 'Đăng ký học phần trực tiếp',
            size: 'elarge',
            isShowSubmit: this.state.isShowSubmit,
            body: (
                <>
                    <div className='row'>
                        <FormSelect ref={(e) => (this.namHoc = e)} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear}
                            onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value?.id || '' } }, () => {
                                this.state.isSearch ? this.getDataHocPhan() : {};
                                this.getData();
                            })} allowClear
                        />
                        <FormSelect ref={(e) => (this.hocKy = e)} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy}
                            onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value?.id || '' } }, () => {
                                this.state.isSearch ? this.getDataHocPhan() : {};
                                this.getData();
                            })} allowClear
                        />
                    </div>

                    <FormTabs ref={e => this.tab = e} tabs={[
                        { title: 'Kết quả đăng ký', component: table },
                        { title: 'Đăng ký mới', component: this.renderDangKyMoi() },
                    ]} />
                </>
            ),
        });
    };
}

const mapStateToProps = (state) => ({ system: state.system, });
const mapActionsToProps = { createDtDangKyHocPhan, getDtDangKyHocPhanAll, getHocPhan, getDtDangKyHocPhanByStudent, updateDtDangKyHocPhan, checkCondition, deleteDtDangKyHocPhan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddHocPhanModal);