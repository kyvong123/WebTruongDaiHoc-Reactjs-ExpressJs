import React from 'react';
import { connect } from 'react-redux';
import { renderDataTable, TableCell, TableHead, AdminModal, loadSpinner, FormSelect, FormRichTextBox } from 'view/component/AdminPage';

import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getDtDangKyHocPhan, getHocPhan, updateDtDangKyHocPhan, getHocPhanCheckDiemLichThi } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
class DkttHocPhanModal extends AdminModal {
    state = { isUpdate: false, hocPhanChon: null, filter: [], filterhp: {}, ksSearch: {} }

    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(this.onHide);
    }

    onShow = (item) => {
        delete this.state.listHocPhan;
        let isUpdate = item.hocPhan.isUpdate,
            filterhp = {
                ...this.props.currentSemester,
                khoaDaoTao: item.hocPhan.khoaDangKy,
                loaiHinhDaoTao: item.hocPhan.loaiHinhDaoTao,
            };

        this.loaiHinhDaoTao.value(filterhp && filterhp.loaiHinhDaoTao ? filterhp.loaiHinhDaoTao : '');
        this.khoaDaoTao.value(filterhp && filterhp.khoaDaoTao ? filterhp.khoaDaoTao : '');
        this.khoaSinhVien.value(filterhp && filterhp.khoaSinhVien ? filterhp.khoaSinhVien : '');
        this.lopSV.value(filterhp && filterhp.lopSV ? filterhp.lopSV : '');

        this.setState({ isUpdate, sinhVien: item.sinhVien, filterhp, hocPhan: item.hocPhan }, () => {
            this.hocPhanFilter();
        });
    }

    hocPhanFilter = () => {
        let { filterhp, isUpdate, hocPhan } = this.state,
            filter = { ...filterhp, sort: 'maHocPhan_ASC' };

        this.props.getHocPhan(filter, (value) => {
            let currHocPhan = isUpdate ? hocPhan.maHocPhan : null,
                listHocPhan = value.filter(e => e.maHocPhan != hocPhan.maHocPhan);
            this.setState({ listHocPhan, currHocPhan });
        });

    };

    handleKeySearchHP = (data) => {
        let { isUpdate, hocPhan } = this.state;
        this.setState({ ksSearch: { [data.split(':')[0]]: data.split(':')[1] } }, () => {
            let filter = {
                ...this.state.filterhp,
                ...this.state.ksSearch,
                sort: 'maHocPhan_ASC'
            };
            this.props.getHocPhan(filter, (value) => {
                let currHocPhan = isUpdate ? hocPhan.maHocPhan : null,
                    listHocPhan = value.filter(e => e.maHocPhan != hocPhan.maHocPhan);
                this.setState({ listHocPhan, currHocPhan });
            });
        });
    }

    onHide = () => {
        this.setState({ hocPhanChon: null }, () => {
            this.ghiChu?.value('');
        });
    }

    checkTrung = (item) => {
        const { ngayBatDau: iNgayBatDau, ngayKetThuc: iNgayKetThuc, soTietBuoi: iSoTietBuoi, thu: iThu, tietBatDau: iTietBatDau } = item;
        this.props.dataKetQua.forEach(ketQuaDangKy => {
            if (ketQuaDangKy.maMonHoc != item.maMonHoc) {
                const { thu, tietBatDau, soTietBuoi, ngayBatDau, ngayKetThuc } = ketQuaDangKy;
                if (!(iNgayKetThuc < ngayBatDau || iNgayBatDau > ngayKetThuc)) {
                    let tietKetThuc = tietBatDau + soTietBuoi - 1;
                    let iTietKetThuc = iTietBatDau + iSoTietBuoi - 1;
                    if (thu == iThu && !(iTietKetThuc < tietBatDau || iTietBatDau > tietKetThuc)) {
                        this.setState({ hocPhanChon: item.maHocPhan, isTrung: item.maHocPhan }, () => T.notify(`Học phần này bị trùng lịch với ${ketQuaDangKy.maHocPhan} rồi!`, 'danger'));
                    }
                }
            }
        });
    }

    chuyenHocPhan = (item) => {
        let { hocPhanChon, listHocPhan } = this.state,
            isCheck = hocPhanChon == item.maHocPhan,
            soLuongDuKien = item.soLuongDuKien || 100;
        if (!isCheck && item.siSo > soLuongDuKien) {
            T.notify('Học phần đã quá số lượng dự kiến', 'warning');
        }
        if (!hocPhanChon) {
            item.siSo = item.siSo + 1;
            hocPhanChon = item.maHocPhan;
            this.checkTrung(item);
        } else if (isCheck) {
            hocPhanChon = null;
            item.siSo = item.siSo - 1;
        } else {
            item.siSo = item.siSo + 1;
            let index = listHocPhan.findIndex(hp => hp.maHocPhan == hocPhanChon);
            listHocPhan[index].siSo = listHocPhan[index].siSo - 1;
            hocPhanChon = item.maHocPhan;
            this.checkTrung(item);
        }
        this.setState({ hocPhanChon, listHocPhan });
    }

    onSave = () => {
        let { sinhVien, hocPhanChon, currHocPhan } = this.state;
        if (hocPhanChon) {
            this.props.getHocPhanCheckDiemLichThi([hocPhanChon], '1', value => {
                let { lichThi } = value;
                if (lichThi.length) T.alert('Học phần đã có lịch thi . Bạn không thể chuyển vào học phần này!', 'warning', false, 2000);
                else {
                    T.confirm('Xác nhận', `Bạn sẽ đăng ký học phần ${hocPhanChon} thay cho ${currHocPhan}?`, 'warning', true, isConfirm => {
                        if (isConfirm) {
                            T.alert('Đang xử lý', 'warning', false, null, true);
                            let condition = { currMaHocPhan: currHocPhan, newMaHocPhan: hocPhanChon, ghiChu: this.ghiChu.value() };

                            this.props.updateDtDangKyHocPhan(condition, [sinhVien.mssv], (data) => {
                                if (data.listSuccess.length) {
                                    T.alert('Chuyển lớp thành công', 'success', false, 1000);
                                    this.props.getHocPhanByStudent();
                                    this.setState({ hocPhanChon: null });
                                    this.hide();
                                } else T.alert('Chuyển lớp thất bại', 'warning', false, 500);

                            });
                        }
                    });
                }
            });
        } else {
            T.notify('Bạn chưa chọn học phần mới nào!!', 'warning');
        }
    }

    loading = () => {
        return loadSpinner() || <></>;
    }

    table = (list) => renderDataTable({
        emptyTable: 'Không tìm thấy học phần nào!',
        data: list || null,
        stickyHead: list?.length > 15,
        header: 'thead-light',
        divStyle: { height: '55vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Chọn</th>
                <TableHead style={{ width: '30%', minWidth: 'auto', maxWidth: 'auto' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearchHP} />
                <TableHead content='Tên môn học' style={{ width: '70%', minWidth: 'auto', maxWidth: 'auto' }} keyCol='tenMonHoc' onKeySearch={this.handleKeySearchHP} />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Lớp' keyCol='lop' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='TC' keyCol='phong' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Phòng' keyCol='phong' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Thứ' keyCol='thu' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Tiết' keyCol='tiet' />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Cơ sở' keyCol='coSo' />
                <th style={{ width: 'auto' }}>Giảng viên</th>
                <th style={{ width: 'auto' }}>Trợ giảng</th>
                <th style={{ width: 'auto' }}>Bắt đầu</th>
                <th style={{ width: 'auto' }}>Kết thúc</th>
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Sĩ số' keyCol='siSo' />
            </tr>),
        renderRow: (item, index) => {
            let isCheck = this.state.hocPhanChon == item.maHocPhan,
                isTrung = this.state.isTrung == item.maHocPhan;
            return (
                <tr key={index} style={{ backgroundColor: item.tinhTrang == 4 ? '#ffcccb' : (isCheck ? (isTrung ? '#f7de97' : '#90EE90') : '') }}>
                    <TableCell type='checkbox' isCheck content={isCheck} permission={{ write: true }} onChanged={() => this.chuyenHocPhan(item)} />
                    <TableCell style={{ width: 'auto' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell content={item.maLop?.split(',').map((item, i) => <div key={i}>{item}</div>)} nowrap />
                    <TableCell type='number' content={item.tongTinChi} />

                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell type='number' content={item.thu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tietBatDau ? `${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}` : ''} />
                    <TableCell type='number' content={item.coSo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.ngayBatDau} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.ngayKetThuc} />
                    <TableCell type='number' content={(item.siSo || 0) + '/' + (item.soLuongDuKien || 100)} />
                </tr >
            );
        }
    });

    render = () => {
        let { currHocPhan, hocPhan } = this.state,
            tenMonHoc = null;
        if (hocPhan) tenMonHoc = T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi;
        return this.renderModal({
            title: `Chuyển học phần ${currHocPhan}: ${tenMonHoc}`,
            size: 'elarge',
            body: <>
                <div className='row'>
                    <FormSelect ref={(e) => (this.loaiHinhDaoTao = e)} className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtDangKyHocPhan')}
                        onChange={(value) =>
                            this.setState({
                                filterhp: { ...this.state.filterhp, loaiHinhDaoTao: value?.id || '' },
                            }, () => this.lopSV.value(''))
                        } allowClear
                    />
                    <FormSelect ref={(e) => (this.khoaDaoTao = e)} className='col-md-3' label='Khoa' data={SelectAdapter_DtDmDonVi(1)}
                        onChange={(value) =>
                            this.setState({
                                filterhp: { ...this.state.filterhp, khoaDaoTao: value?.id || '' },
                            }, () => this.lopSV.value(''))
                        } allowClear
                    />
                    <FormSelect ref={(e) => (this.khoaSinhVien = e)} className='col-md-2' label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTaoFilter('dtDangKyHocPhan')}
                        onChange={(value) =>
                            this.setState({
                                filterhp: { ...this.state.filterhp, khoaSinhVien: value?.id || '' },
                            }, () => this.lopSV.value(''))
                        } allowClear
                    />
                    <FormSelect ref={(e) => (this.lopSV = e)} className='col-md-2' label='Lớp' data={SelectAdapter_DtLop({
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
                    <div className='col-md-2'>
                        <div className='rows' style={{ textAlign: 'right', marginTop: '25px' }}>
                            <button className='btn btn-success' onClick={(e) => {
                                e.preventDefault() || this.hocPhanFilter();
                            }} >
                                <i className='fa fa-search' /> Tìm kiếm
                            </button>
                        </div>
                    </div>
                    <div className='col-md-12'>
                        {this.state.listHocPhan ? <>
                            {this.table(this.state.listHocPhan)}
                            <FormRichTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú' />
                        </> : loadSpinner()}
                    </div>
                </div>

            </>,
            buttons: this.state.isUpdate && <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.onSave()}>
                <i className='fa fa-fw fa-lg fa-save' />Lưu
            </button>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyHocPhan: state.daoTao.dtDangKyHocPhan });
const mapActionsToProps = { getDtDangKyHocPhan, updateDtDangKyHocPhan, getHocPhan, getHocPhanCheckDiemLichThi };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DkttHocPhanModal);
