import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, FormTextBox, TableCell, getValue, renderDataTable } from 'view/component/AdminPage';
import { getSvChungChi, svChungChiCreate } from 'modules/mdDaoTao/dtMoPhongDangKy/redux';
import CertModal from 'modules/mdSinhVien/svChungChi/CertModal';
import FileBox from 'view/component/FileBox';
import { SelectAdapter_DtDmChungChiTinHoc } from 'modules/mdDaoTao/dtDmChungChiTinHoc/redux';
import { SelectAdapter_DtDmNgoaiNgu } from 'modules/mdDaoTao/dtDmNgoaiNgu/redux';
import { SelectAdapter_DtDmChungChiNgoaiNguFilter } from 'modules/mdDaoTao/dtChungChiSinhVien/redux';
import { getDtDmLoaiChungChiAll } from 'modules/mdDaoTao/dtDmLoaiChungChi/redux';
import { Tooltip } from '@mui/material';

class ChungChiSection extends AdminPage {
    state = { dataChungChi: {}, stuInfo: {} }

    mapperStatus = {
        0: { icon: 'fa fa-lg fa-file-o', text: 'Đang xử lý', color: 'orange' },
        1: { icon: 'fa fa-lg fa-check-circle', text: 'Hoàn tất', color: 'green' },
        null: { icon: '', text: '', color: '' },
    }

    setValue = (mssv) => {
        this.props.getSvChungChi(mssv, ({ dataChungChi, stuInfo }) => {
            this.setState({ dataChungChi, stuInfo: stuInfo[0] }, () => {
                const { lop, ho, ten } = stuInfo[0];
                this.hoTen.value(ho + ' ' + ten);
                this.mssv.value(mssv);
                this.lop.value(lop);
            });
        });
        this.props.getDtDmLoaiChungChiAll(data => {
            let dataLoaiChungChi = data.filter(i => i.kichHoat).map(item => ({ id: item.ma, text: item.ten }));
            dataLoaiChungChi.push({ id: 'NN', text: 'Chứng chỉ ngoại ngữ' });
            this.setState({ dataLoaiChungChi });
        });
    }

    handleUploadSuccess = (result) => {
        if (result.message) {
            T.alert(result.message || 'Xảy ra lỗi trong quá trình import', 'error', true);
        } else {
            this.setState({ fileName: result.fileName }, () => T.notify('Upload ảnh thành công', 'success'));
        }
    }

    handleConfirm = () => {
        let { fileName, dataChungChi } = this.state,
            { certNgoaiNgu, otherCert } = dataChungChi;
        try {
            const data = {
                loaiChungChi: getValue(this.loaiChungChi),
                chungChi: getValue(this.chungChi),
                ngayCap: getValue(this.ngayCap),
                noiCap: getValue(this.noiCap),
                ngoaiNgu: this.ngoaiNgu?.value(),
                cccd: getValue(this.cccd),
                soHieuVanBang: this.soHieuVanBang.value()
            };

            if (!fileName) return T.notify('Chưa có dữ liệu ảnh', 'danger');
            data.fileName = fileName;
            data.ngayCap = data.ngayCap.getTime();
            T.confirm('Xác nhận', 'Bạn có chắc muốn đăng ký chứng chỉ này không?', true, isConfirm => {
                if (isConfirm) {
                    this.props.svChungChiCreate(data, (res) => {
                        if (res.chungChiNgoaiNgu) certNgoaiNgu = [res, ...certNgoaiNgu];
                        else otherCert = [res, ...otherCert];
                        T.notify('Đăng ký chứng chỉ thành công!', 'success');
                        this.loaiChungChi.value('');
                        this.ngoaiNgu?.value('');
                        this.chungChi.value('');
                        this.ngayCap.value(0);
                        this.noiCap.value('');
                        this.cccd.value('');
                        this.soHieuVanBang.value('');
                        this.setState({ fileName: '', loaiChungChi: '', maNgoaiNgu: '', chungChi: '', dataChungChi: { certNgoaiNgu, otherCert } });
                    });
                }
            });
        } catch (input) {
            if (input && input.props) {
                T.notify((input.props.label || 'Dữ liệu') + ' bị trống!', 'danger');
                input.focus();
            }
        }
    }

    handleDelete = ({ idCc, chungChiNgoaiNgu, chungChiKhac }) => {
        T.confirm('Xác nhận', 'Bạn có chắc muốn hủy đăng ký chứng chỉ này không?', true, isConfirm => {
            if (isConfirm) {
                let { dataChungChi } = this.state,
                    { certNgoaiNgu, otherCert } = dataChungChi;
                certNgoaiNgu = chungChiNgoaiNgu ? certNgoaiNgu.filter(i => i.idCc != idCc) : certNgoaiNgu;
                otherCert = chungChiKhac ? otherCert.filter(i => i.idCc != idCc) : otherCert;
                this.setState({ dataChungChi: { certNgoaiNgu, otherCert } });
                T.notify('Hủy đăng ký chứng chỉ thành công!', 'success');
            }
        });
    }

    table = (list) => renderDataTable({
        emptyTable: 'Không có dữ liệu sinh viên',
        stickyHead: list.length > 15,
        header: 'thead-light',
        loadingStyle: { backgroundColor: 'white' },
        // divStyle: { height: '70vh' },
        data: list,
        renderHead: () => <tr>
            <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
            <th style={{ width: '20%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Loại chứng chỉ</th>
            <th style={{ width: '20%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Chứng chỉ</th>
            <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Ngày cấp</th>
            <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Nơi cấp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian đăng ký</th>
            <th style={{ width: '20%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Tình trạng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày trả kết quả</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Kết quả</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            const icon = this.mapperStatus[item.status].icon,
                text = this.mapperStatus[item.status].text,
                color = this.mapperStatus[item.status].color;
            const ketQua = item.status ? (item.isTotNghiep ? 'Đủ điều kiện xét tốt nghiệp' : (item.chungChiKhac ? 'Không đủ điều kiện' : (item.isJuniorStudent ? 'Đủ chuẩn ngoại ngữ năm ba' : (item.isDangKy ? 'Đủ điều kiện đăng ký học phần' : 'Không đủ điều kiện')))) : '';

            return (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.chungChiNgoaiNgu ? 'Chứng chỉ ngoại ngữ' : item.loaiChungChi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.chungChi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(Number(item.ngayCap), 'dd/mm/yyyy')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.noiCap} />
                    <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap' }} content={T.dateToText(Number(item.timeCreated), 'HH:MM:ss dd/mm/yyyy')} />
                    <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                    <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap' }} content={item.timeModified ? T.dateToText(item.timeModified, 'HH:MM:ss dd/mm/yyyy') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', color: (item.isNotQualified || !item.isTotNghiep || !item.isJuniorStudent || !item.isDangKy) ? 'red' : 'green', fontWeight: 'bold' }} content={ketQua} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap' }} content={item}>
                        <Tooltip title='Xem chi tiết' style={{ display: item.fileName ? '' : 'none' }} arrow>
                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                <i className='fa fa-lg fa-search' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Hủy đăng ký' style={{ display: !item.status ? '' : 'none' }} arrow>
                            <button className='btn btn-danger' onClick={e => e.preventDefault() || this.handleDelete(item)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>
                    </TableCell>

                </tr>
            );
        }
    });

    render() {
        const { loaiChungChi, maNgoaiNgu, fileName, stuInfo, dataChungChi } = this.state,
            filterSv = { khoa: stuInfo.khoa, khoaSinhVien: stuInfo.khoaSinhVien || stuInfo.namTuyenSinh, loaiHinhDaoTao: stuInfo.loaiHinhDaoTao },
            { certNgoaiNgu = [], otherCert = [] } = dataChungChi || {};

        return <div>
            <CertModal ref={e => this.modal = e} />
            <div className='tile'>
                <div className='tile-body row'>
                    <h5 className='col-md-12'>THÔNG TIN SINH VIÊN</h5>
                    <FormTextBox className='col-md-3' ref={e => this.mssv = e} label='Mã số sinh viên' disabled />
                    <FormTextBox className='col-md-6' ref={e => this.hoTen = e} label='Họ và tên' disabled />
                    <FormTextBox className='col-md-3' ref={e => this.lop = e} label='Lớp' disabled />

                    <hr style={{ width: '95%' }} />

                    <h5 className='col-md-12'>THÔNG TIN ĐĂNG KÝ CHỨNG CHỈ</h5>
                    <div className='col-md-12'>
                        <div className='row'>
                            <FormSelect className='col-md-6' ref={e => this.loaiChungChi = e} label='Loại chứng chỉ' data={this.state.dataLoaiChungChi} required onChange={e => this.setState({ loaiChungChi: e.id }, () => {
                                this.ngoaiNgu?.value('');
                                this.chungChi?.value('');
                            })} />
                            <div className='col-md-6' style={{ display: loaiChungChi ? 'flex' : 'none', gap: 10, justifyContent: 'flex-end' }}>
                                <button className='btn btn-warning' style={{ margin: 'auto 0' }} type='button' onClick={e => e && e.preventDefault() || this.handleConfirm()}>
                                    <i className='fa fa-fw fa-lg fa-arrow-circle-down' /> Xác nhận đăng ký
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6' style={{ display: loaiChungChi ? '' : 'none' }}>
                        <div className='row'>
                            {loaiChungChi == 'NN' && <FormSelect className='col-md-6' ref={e => this.ngoaiNgu = e} label='Ngoại ngữ' data={SelectAdapter_DtDmNgoaiNgu} required onChange={e => this.setState({ maNgoaiNgu: e.id }, () => this.chungChi.value(''))} />}

                            <FormSelect className='col-md-6' ref={e => this.chungChi = e} label='Chứng chỉ' data={loaiChungChi == 'NN' ? SelectAdapter_DtDmChungChiNgoaiNguFilter({ maNgoaiNgu, sv: filterSv }) : SelectAdapter_DtDmChungChiTinHoc(loaiChungChi)} required
                                onChange={e => this.setState({ chungChi: loaiChungChi == 'NN' ? e.text : e.id })}
                            />
                            <FormDatePicker className='col-md-6' ref={e => this.ngayCap = e} type='date' label='Ngày cấp' required />
                            <FormTextBox className='col-md-6' ref={e => this.noiCap = e} label='Nơi cấp' required />
                            <FormTextBox className='col-md-6' ref={e => this.soHieuVanBang = e} label='Số hiệu văn bằng' />
                            <FormTextBox className='col-md-6' ref={e => this.cccd = e} label='CCCD/Hộ chiếu' required />

                            <div className='col-md-12' style={{ margin: 'auto' }}>
                                <label >Upload file minh chứng<span style={{ color: 'red' }}> *</span></label>
                                <FileBox uploadType='MoPhongCertFile' accept='image' userData='MoPhongCertFile' success={this.handleUploadSuccess} ref={e => this.uploadForm = e} postUrl={`/user/upload?mssv=${stuInfo.mssv}&loaiChungChi=${this.state.loaiChungChi}${loaiChungChi == 'NN' ? `&maNgoaiNgu=${this.state.maNgoaiNgu}` : ''}&chungChi=${this.state.chungChi}`} ajax={true} />
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6' style={{ display: loaiChungChi ? '' : 'none' }} >
                        <h5>ẢNH MINH CHỨNG</h5>
                        <div style={{ height: '100%' }}>
                            {fileName ? <div style={{ height: '80%', backgroundImage: `url(${T.url(`/api/sv/chung-chi/cert-image?fileName=${fileName}`)})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain' }} /> : <i>Chưa có ảnh minh chứng</i>}
                        </div>
                    </div>
                </div>
            </div>
            <div className='tile'>
                <h5 className='tile-title'>Kết quả đăng ký</h5>
                <div className='tile-body'>
                    {this.table([...certNgoaiNgu, ...otherCert].sort((a, b) => b.timeCreated - a.timeCreated))}
                </div>
            </div>
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, hocPhan: state.daoTao.hocPhan });
const mapActionsToProps = { getSvChungChi, svChungChiCreate, getDtDmLoaiChungChiAll };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ChungChiSection);