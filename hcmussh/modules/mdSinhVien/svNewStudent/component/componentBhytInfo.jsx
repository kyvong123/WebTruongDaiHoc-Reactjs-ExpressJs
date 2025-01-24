import React from 'react';
import { connect } from 'react-redux';
import { SelectAdapter_DmCoSoKcbBhyt } from 'modules/mdDanhMuc/dmCoSoKcbBhyt/redux';
import { FormCheckbox, FormDatePicker, FormImageBox, FormRichTextBox, FormSelect, FormTextBox, getValue, renderTable, renderTimeline, TableCell } from 'view/component/AdminPage';
// import FileBox from 'view/component/FileBox';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
// import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { createSvBaoHiemYTeTanSinhVien, getSvBaoHiemYTeThongTin, huyDangKySvBaoHiemYTe, updateSvBaoHiemYTeBhyt } from 'modules/mdSinhVien/svManageBaoHiemYTe/redux';
import { geAlltDmDienDongBhyt } from 'modules/mdCongTacSinhVien/svDmDienDongBhyt/redux.jsx';
import { SelectAdapter_DmDienDongBhyt } from 'modules/mdCongTacSinhVien/svDmDienDongBhyt/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmQuanHeGiaDinh } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import { loadSpinner } from './common';
import { Img } from 'view/component/HomePage';

function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

// const DIEN_BHYT = {
//     '0': { ten: 'miễn đóng', soTien: 0 },
//     '12': { ten: 'diện 12 tháng', soTien: 680400 },
//     '15': { ten: 'diện 15 tháng', soTien: 850500 }
// };

class SvBhytInfo extends React.Component {
    state = {
        isLoading: true, dienDong: null, canEdit: 0, canDangKy: false, canUpdate: 0, coMaBhyt: true, isGiaHan: false, thoiGianBatDau: null, thoiGianKetThuc: null,
        maDotDangKy: null, timeLine: [], dataThanhVien: [], dataChuHo: {}, addIndex: null,
        filePath: null, matTruocCmnd: null, matSauCmnd: null
    };

    componentDidMount() {
        this.props.geAlltDmDienDongBhyt({ kichHoat: 1 });
        this.getThongTinBaoHiemYTe();

        T.socket.on('updateThanhToanBhyt', () => {
            this.getThongTinBaoHiemYTe();
        });
    }

    componentWillUnmount() {
        T.socket.off('updateThanhToanBhyt');
    }

    getThongTinBaoHiemYTe = () => {
        this.setState({ isLoading: true }, () => {
            this.props.getSvBaoHiemYTeThongTin((data) => {
                const { dataSinhVien } = data;
                const { thoiGianBatDau, thoiGianKetThuc, ma } = dataSinhVien.currentDotDangKy ? dataSinhVien.currentDotDangKy : { thoiGianBatDau: null, thoiGianKetThuc: null, ma: null };
                this.setState({
                    isLoading: false, dataSinhVien, coMaBhyt: true, canEdit: dataSinhVien.canEdit, thoiGianBatDau, thoiGianKetThuc, maDotDangKy: ma, thongTinDotDangKy: dataSinhVien.currentDotDangKy, lichSuDangKy: dataSinhVien.lichSuDangKy, dienDong: dataSinhVien.lichSuDangKy?.dienDong,
                    // filePath: dataSinhVien.lichSuDangKy?.matTruocThe 
                }, () => {
                    const now = new Date().getTime();
                    this.setState({ canDangKy: (this.checkThoiGian(now) && !this.state.lichSuDangKy && this.state.dataSinhVien.isValidKhoaHe), canUpdate: (this.checkThoiGian(now) && this.state.dataSinhVien.isValidKhoaHe) }, () => {
                        this.setTimeLine(() => {
                            if (this.state.lichSuDangKy) {
                                this.setThongTinBoSung(this.state.lichSuDangKy);
                            }
                        });
                    });
                });
                this.setFormValue(data.dataSinhVien);
            });
        });
    };

    setThongTinBoSung = (item) => {
        const { maDotDangKy, dataSinhVien } = this.state;
        if (item.dienDong == 0) {
            this.maBhxhHienTai?.value(item.maBhxhHienTai || dataSinhVien?.maBhxhHienTai || '');
            this.setTimeLine();
            // this.setState({ filePath: item.matTruocThe }, () => this.setTimeLine(
            // () => {
            //     this.matTruocThe.setData(`BHYTSV_FRONT:${maDotDangKy}`, this.state.filePath ? `/api/sv/bhyt/front?filePath=${this.state.filePath.split('/')[3]}&maDot=${this.state.filePath.split('/')[1]}&t=${new Date().getTime()}` : '');
            // }
            // ));
        } else {
            if (item.maBhxhHienTai || !item.benhVienDangKy) {
                this.setState({ coMaBhyt: true });
                this.isHaveMaBhyt?.value(0);
                this.maBhxhHienTai?.value(item.maBhxhHienTai || dataSinhVien?.maBhxhHienTai || '');
                this.noiKhamChuaBenh?.value(item.benhVienDangKy || dataSinhVien?.benhVienDangKy || '');
            } else {
                this.setState({
                    coMaBhyt: false, dataThanhVien: item.dataThanhVien?.map((item, index) => {
                        item.indexItem = index;
                        return item;
                    }),
                    matTruocCmnd: item.matTruocCmnd,
                    matSauCmnd: item.matSauCmnd,
                }, () => {
                    this.setTimeLine(() => {
                        const matTruocCmnd = item.matTruocCmnd?.split('/').pop();
                        const matSauCmnd = item.matSauCmnd?.split('/').pop();
                        this.matTruocCmnd?.setData(`svBhytUploadCmndTruoc:${maDotDangKy}`, matTruocCmnd ? `/api/sv/bhyt/cmnd/front?maDot=${maDotDangKy}&fileName=${matTruocCmnd}` : '');
                        this.matSauCmnd?.setData(`svBhytUploadCmndSau:${maDotDangKy}`, matSauCmnd ? `/api/sv/bhyt/cmnd/back?maDot=${maDotDangKy}&fileName=${matSauCmnd}` : '');
                        this.noiKhamChuaBenh?.value(item.benhVienDangKy || '');
                        if (item.dataChuHo) {
                            const { dataChuHo } = item;
                            this.isHaveMaBhyt?.value(1);
                            this.hoTenChuHo?.value(dataChuHo.hoTenChuHo || '');
                            this.cccdChuHo?.value(dataChuHo.cccdChuHo || '');
                            this.diaChiChuHo?.value(dataChuHo.maTinhChuHo || '', dataChuHo.maHuyenChuHo || '', dataChuHo.maXaChuHo || '', dataChuHo.soNhaChuHo || '');
                            this.dienThoaiChuHo?.value(dataChuHo.dienThoaiChuHo ? dataChuHo.dienThoaiChuHo : '');
                            this.ngaySinhChuHo?.value(dataChuHo.ngaySinhChuHo || '');
                            this.maHoGiaDinh?.value(dataChuHo.maHoGiaDinh || '');
                        }
                    });
                });
            }
        }
    };

    setThongTinChuHo = (item) => {
        this.setState({
            dataThanhVien: item.dataThanhVien?.map((item, index) => {
                item.indexItem = index;
                return item;
            })
        }, () => {
            this.setTimeLine(() => {
                let { maDotDangKy, matTruocCmnd, matSauCmnd } = this.state;
                matTruocCmnd = matTruocCmnd?.split('/')[1] ?? item.matTruocCmnd?.split('/')[1];
                matSauCmnd = matSauCmnd?.split('/')[1] ?? item.matSauCmnd?.split('/')[1];
                this.matTruocCmnd?.setData(`svBhytUploadCmndTruoc:${maDotDangKy}`, matTruocCmnd ? `/api/sv/bhyt/cmnd/front?maDot=${maDotDangKy}&fileName=${matTruocCmnd}` : '');
                this.matSauCmnd?.setData(`svBhytUploadCmndSau:${maDotDangKy}`, matSauCmnd ? `/api/sv/bhyt/cmnd/back?maDot=${maDotDangKy}&fileName=${matSauCmnd}` : '');

                this.noiKhamChuaBenh?.value(item.benhVienDangKy || '');
                if (item.dataChuHo) {
                    const { dataChuHo } = item;
                    this.isHaveMaBhyt?.value(1);
                    this.hoTenChuHo?.value(dataChuHo.hoTenChuHo || '');
                    this.cccdChuHo?.value(dataChuHo.cccdChuHo || '');
                    this.diaChiChuHo?.value(dataChuHo.maTinhChuHo || '', dataChuHo.maHuyenChuHo || '', dataChuHo.maXaChuHo || '', dataChuHo.soNhaChuHo || '');
                    this.dienThoaiChuHo?.value(dataChuHo.dienThoaiChuHo ? dataChuHo.dienThoaiChuHo : '');
                    this.ngaySinhChuHo?.value(dataChuHo.ngaySinhChuHo || '');
                    this.maHoGiaDinh?.value(dataChuHo.maHoGiaDinh || '');
                }
            });
        });
    }

    renderChoices = (item) => {
        const { canDangKy, dienDong } = this.state;
        return <div className={`btn ${this.state.dienDong == item.key ? 'btn-primary' : 'btn-outline-primary'}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', padding: '20px', color: `${this.state.dienDong == item.key ? '' : 'black'}`, borderRadius: '20px' }}
            onClick={() => this.setState({ dienDong: item.key }, () => this.setTimeLine())}>
            <h5 style={{ whiteSpace: 'normal' }}>{item.title}</h5>
            <ul style={{ whiteSpace: 'normal', width: '100%', textAlign: 'left', fontWeight: 'normal', paddingLeft: 10, listStyleType: 'disc' }}>
                {item.conditions.map((listItem, index) => <li key={index} dangerouslySetInnerHTML={{ __html: listItem }}></li>)}
                {!!item.soTien && <li><span
                    className='font-weight-bold'>Số tiền: </span>{item.soTien.toString().numberDisplay()} đồng</li>}
            </ul>
            <div style={{ textAlign: 'center' }}>
                {(canDangKy && dienDong == item.key) ? <div className='col-md-12 mt-5'>
                    {/* {(this.state.canEdit) ? <button className='btn btn-info mr-2' onClick={e => this.updateStudent(e)}>Cập nhật thông tin</button> : null} */}
                    <button className='btn btn-success' onClick={e => this.handleDangKiBhyt(e)}>Đăng ký {item.title}</button>
                </div> : null}
            </div>
        </div>;
    };

    componentDangKyMoi = (isDone) => {
        const { lichSuDangKy } = this.state;
        const { items: dmDienDongBhyt = [] } = this.props.dmDienDongBhyt || {};
        return (
            <>
                <b className='tile-title text-primary'>Đăng ký mức BHYT</b>
                {!isDone ? <>
                    <div className='row tile-body mt-1'>
                        <b className='col-md-12 mt-1'>Sinh viên tra cứu mã thẻ BHYT <a
                            href='https://baohiemxahoi.gov.vn/tracuu/Pages/tra-cuu-ho-gia-dinh.aspx' target='_blank' rel='noreferrer'>
                            tại đây
                        </a></b>

                        <b className='col-md-12 mt-1'>Sinh viên tra cứu hiệu lực sử dụng thẻ BHYT <a
                            href='https://baohiemxahoi.gov.vn/tracuu/Pages/tra-cuu-thoi-han-su-dung-the-bhyt.aspx' target='_blank' rel='noreferrer'>
                            tại đây
                        </a> hoặc trên ứng dụng VssID</b>
                        <div className='text-danger form-group col-md-12 mt-2'>* Vui lòng chọn <b>1 trong {dmDienDongBhyt.length} mức BHYT</b> để tiến hành đăng ký.</div>
                    </div><div className='row tile-body justify-content-center'>
                        {dmDienDongBhyt.map((item, index) => <div key={index} className='form-group col-md-4'>
                            {this.renderChoices({
                                key: item.ma, title: item.moTa, conditions: T.parse(item.ghiChu), soTien: item.soTien
                            })}
                        </div>)}
                    </div>
                </> : <div>
                    <h5 className='col-md-12 text-success'><i className='fa fa-check' /> Đã đăng ký {dmDienDongBhyt.find(item => item.ma == lichSuDangKy?.dienDong)?.ten.toLowerCase()}</h5>
                </div>}
            </>
        );
    };

    handleSize = (value) => {
        if (value && value.toString().length > 10) {
            this.maBhxhHienTai?.value(value.toString().substring(0, 10));
        }
    };

    handleSizeBhxh = (value, key) => {
        if (value && value.toString().length > 10) {
            this[key]?.value(value.toString().substring(0, 10));
        }
    };

    handleSizeMaHoGiaDinh = () => {
        const text = this.maHoGiaDinh.value();
        if (text && text.toString().length > 15) {
            this.maHoGiaDinh?.value(text.toString().substring(0, 15));
        }
    }

    handleSizeCccd = (value, key) => {
        if (value && value.toString().length > 12) {
            this[key]?.value(value.toString().substring(0, 12));
        }
    };

    handleSizeSdtCaNhan = (value, ref) => {
        if (value && value.toString().length > 10) {
            this[ref]?.value(value.toString().substring(0, 10));
        }
    };

    handleCheckBenhVien = (value) => {
        if (value.loaiDangKy == 1 && this.state.coMaBhyt == false) {
            T.notify(`${value.ten} không cho phép đăng ký mới. Vui lòng chọn cơ sở khác!`, 'danger');
            this.noiKhamChuaBenh?.value(null);
        } else if (value.loaiDangKy == 1 && this.state.coMaBhyt == true) {
            T.confirm('Lưu ý', `${value.ten} chỉ cho phép gia hạn đối với những thẻ BHYT đã đăng ký trước đó, không chấp nhận đăng ký mới hay đổi nơi khám chữa bệnh`, false, isConfirm => {
                if (!isConfirm) {
                    this.noiKhamChuaBenh?.value(null);
                }
            });
        }
    };

    componentThongTinCoBan = (isDone) => {
        const { lichSuDangKy, canUpdate } = this.state;
        return (
            <>
                <p className='tile-title font-weight-bold text-primary'>Thông tin đăng ký</p>
                {!isDone ? <div className='row tile-body'>
                    <FormTextBox type='text' className='col-md-3' ref={e => this.hoTen = e} label='Họ và tên' required readOnly />
                    <FormTextBox type='text' className='col-md-3' ref={e => this.mssv = e} label='MSSV' required readOnly />
                    <FormTextBox type='phone' className='col-md-3' ref={e => this.dienThoaiCaNhan = e} label='Số điện thoại cá nhân' required maxLength='10' />
                    <FormTextBox type='text' className='col-md-3' ref={e => this.cccd = e} label='Căn cước công dân' required maxLength='12' />
                    <FormSelect ref={e => this.lichSuDienDong = e} label={'Diện tham gia BHYT'} placeholder='Diện đăng ký BHYT' className='col-md-4' data={SelectAdapter_DmDienDongBhyt} required
                        readOnly />
                    {lichSuDangKy?.dienDong != 0 ? <p className='col-md-4'>Tình trạng: <strong className={lichSuDangKy?.isThanhToan ? 'text-success' : 'text-danger'}>{lichSuDangKy?.isThanhToan ? <>
                        <i className='fa fa-check mr-1'></i>Đã thanh toán
                    </> : <>
                        <i className='fa fa-clock-o mr-1'></i>Chưa thanh toán
                    </>}</strong></p> : null}
                    {(canUpdate && !lichSuDangKy?.isThanhToan) ? <div className='col-md-12 text-center'>
                        {/* {(this.state.canEdit) ? <button className='btn btn-info mr-2' onClick={e => this.updateStudent(e)}>Cập nhật thông tin</button> : null} */}
                        <button className='btn btn-danger' onClick={e => {
                            e.preventDefault();
                            T.confirm('Xác nhận hủy đăng ký BHYT', 'Tất cả thông tin đăng ký sẽ bị hủy. Bạn có chắc bạn muốn hủy đăng ký BHYT!', isConfirm => isConfirm && this.props.huyDangKySvBaoHiemYTe(lichSuDangKy?.id, () => {
                                this.getThongTinBaoHiemYTe();
                                this.props.onUnComplete && this.props.onUnComplete();
                            }));
                        }}><i className='fa fa-lg fa-times' /> Hủy/Chuyển đăng ký
                        </button>
                    </div> : null}
                </div> : null}
            </>
        );
    };

    thanhVienCell = () => this.state.dataThanhVien.map((item, index) =>
        <tr key={index}>
            <TableCell type='number' style={{ textAlign: 'center' }} content={item.indexItem + 1} />
            <TableCell content={item.hoTen} />
            <TableCell type='date' content={parseInt(item.ngaySinh)} dateFormat='dd/mm/yyyy' />
            <TableCell content={item.cccd} />
            <TableCell content={item.tenGioiTinh}></TableCell>
            <TableCell content={item.tenMoiQuanHeChuHo} />
            <TableCell content={item.maSoBhxh} />
            <TableCell content={item.sdtCaNhan} />
            <TableCell content={item.tenPhuongXa ? `${item.tenPhuongXa}, ${item.tenQuanHuyen}, ${item.tenTinhThanhPho}` : ''} />
            <TableCell content={item.ghiChu} />
            <TableCell
                type='buttons'
                content={item}
                permission={{ write: true, delete: true }}
                onEdit={() =>
                    this.setState({ addIndex: item.indexItem }, () => {
                        this.setTimeLine(() => {
                            ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'moiQuanHeChuHo', 'cccd', 'ghiChu', 'ngaySinh'].forEach((key) => {
                                this[key]?.value(item[key]);
                            });
                            this.gioiTinh?.value('0' + item.gioiTinh);
                            this.noiCapKhaiSinh?.value(item.maTinhNoiCapKhaiSinh, item.maHuyenNoiCapKhaiSinh, item.maXaNoiCapKhaiSinh);
                        });
                    })
                }
                onDelete={() => this.setState({ dataThanhVien: this.state.dataThanhVien.filter((item) => item.indexItem != index).map((item, index) => ({ ...item, indexItem: index })) }, () => this.setTimeLine())}
            />
        </tr>
    );

    getDataThanhVien = (indexItem) => {
        try {
            let data = {};
            const { maTinhThanhPho: maTinhNoiCapKhaiSinh, maQuanHuyen: maHuyenNoiCapKhaiSinh, maPhuongXa: maXaNoiCapKhaiSinh } = this.noiCapKhaiSinh?.value(),
                { tenPhuongXa, tenQuanHuyen, tenTinhThanhPho } = this.noiCapKhaiSinh.getText();
            ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'gioiTinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach((key) => {
                if (key == 'gioiTinh') data[key] = parseInt(getValue(this[key]));
                else data[key] = getValue(this[key]);
            });
            if (data.maSoBhxh && data.maSoBhxh.toString().length != 10) {
                this.maSoBhxh.focus();
                T.notify('Mã số BHXH phải chứa 10 ký tự!', 'danger');
                return false;
            } else if (data.sdtCaNhan?.length < 10) {
                T.notify('Số điện thoại phải chứa 10 ký tự!', 'danger');
                return false;
            } else {
                let tenGioiTinh = this.gioiTinh.data().text,
                    tenMoiQuanHeChuHo = this.moiQuanHeChuHo.data().text;
                data = Object.assign({}, data, { maTinhNoiCapKhaiSinh, maHuyenNoiCapKhaiSinh, maXaNoiCapKhaiSinh, tenPhuongXa, tenQuanHuyen, tenTinhThanhPho, tenGioiTinh, tenMoiQuanHeChuHo, indexItem });
                data.ngaySinh = getValue(this.ngaySinh).getTime();
                return data;
            }
        }
        catch (error) {
            T.notify('Vui lòng điền đủ các thông tin bắt buộc!', 'danger');
            error.props && error.focus();
            return false;
        }
    };

    updateThanhVien = (onSubmit = false, indexItem) => {
        const data = this.getDataThanhVien(indexItem),
            currentData = this.state.dataThanhVien;
        if (data) {
            this.setState({ addIndex: null }, () => this.setTimeLine());
            if (onSubmit) {
                return [...currentData, data];
            } else {
                if (currentData.some((item) => item.indexItem == indexItem)) {
                    this.setState(
                        {
                            dataThanhVien: this.state.dataThanhVien.map((item) => {
                                if (item.indexItem == indexItem) {
                                    item = { ...item, ...data };
                                }
                                return item;
                            })
                        },
                        () => {
                            ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'gioiTinh', 'ngaySinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach((key) => {
                                this[key]?.value('');
                            });
                            this.setTimeLine();
                        }
                    );
                } else {
                    this.setState({ dataThanhVien: [...this.state.dataThanhVien, data] }, () => {
                        ['hoTen', 'maSoBhxh', 'sdtCaNhan', 'gioiTinh', 'ngaySinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach((key) => {
                            this[key]?.value('');
                        });
                        this.setTimeLine();
                    });
                }
            }
        }
    };

    elementPhuLucGiaDinh = () => {
        let dataThanhVien = this.state.dataThanhVien || [];
        return (
            <div>
                <div className='row'>
                    <h4 className='col-12' style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                        PHỤ LỤC THÀNH VIÊN HỘ GIA ĐÌNH
                    </h4>
                    <h5 className='col-12'>1. Thông tin chủ hộ</h5>
                    <FormTextBox ref={(e) => (this.hoTenChuHo = e)} label='Họ và tên chủ hộ' className='col-md-3' required />
                    <FormDatePicker type='date-mask' ref={(e) => (this.ngaySinhChuHo = e)} label='Ngày sinh chủ hộ' className='col-md-3' required />
                    <FormTextBox ref={(e) => (this.cccdChuHo = e)} label='Căn cước công dân chủ hộ' className='col-md-3' onChange={e => this.handleSizeCccd(e.target.value, 'cccdChuHo')} required />
                    <FormTextBox ref={(e) => (this.dienThoaiChuHo = e)} type='phone' label='Số điện thoại chủ hộ' className='col-md-3' required
                        onChange={e => this.handleSizeSdtCaNhan(e.target.value, 'dienThoaiChuHo')} />

                    <ComponentDiaDiem label='Địa chỉ chủ hộ' ref={(e) => (this.diaChiChuHo = e)} className='form-group col-md-12' requiredSoNhaDuong />
                    <FormTextBox ref={e => this.maHoGiaDinh = e}
                        label={<span>Mã số hộ gia đình <a href={'https://baohiemxahoi.gov.vn/tracuu/Pages/tra-cuu-ho-gia-dinh.aspx'} target='_blank' rel='noreferrer'>(Tra cứu)</a></span>}
                        placeholder={'Mã số hộ gia đình'}
                        className='col-md-12'
                        smallText='Nếu như không có mã hộ gia đình phải kê khai bảng 2 đầy đủ.'
                        onChange={() => this.handleSizeMaHoGiaDinh()} />
                    <h5 className='col-12'>2. Bảng thông tin thành viên hộ gia đình:</h5>
                    <div className='col-12 my-3'>
                        {renderTable({
                            getDataSource: () => (dataThanhVien.length ? dataThanhVien : []),
                            emptyTable: 'Chưa có dữ liệu thành viên',
                            header: 'thead-light',
                            renderHead: () => (
                                <tr>
                                    <th style={{ width: 'auto' }}>STT</th>
                                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>CCCD/Hộ chiếu</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mối quan hệ với <br /> chủ hộ </th>
                                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã số BHXH</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số điện thoại</th>
                                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi cấp giấy khai sinh</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            ),
                            renderRow: (
                                <>
                                    {dataThanhVien.length ? this.thanhVienCell() : null}
                                </>
                            )
                        })}
                    </div>
                    <div className='col-md-12'>
                        {this.state.addIndex != null ? (this.state.addIndex == dataThanhVien.length ? this.addCell(dataThanhVien.length) : this.addCell(this.state.addIndex)) : null}
                    </div>
                    {this.state.canUpdate ? <div className='form-group col-md-12' style={{ textAlign: 'center', display: this.state.addIndex == null ? '' : 'none' }}>
                        <button className='btn btn-success mr-2' type='button' onClick={e => this.handleUpdateBhyt(e)}>
                            <i className='fa fa-sm fa-save' /> Hoàn tất thống kê
                        </button>
                        <button className='btn btn-info' type='button' onClick={(e) => e.preventDefault() || this.setState({ addIndex: dataThanhVien.length }, () => this.setTimeLine())}>
                            <i className='fa fa-sm fa-plus' /> Thêm thành viên
                        </button>
                    </div> : null}
                </div>
            </div>
        );
    };

    addCell = (index) => (
        <div className='row'>
            <FormTextBox ref={(e) => (this.hoTen = e)} label='Họ và tên thành viên' className='col-md-4' required />
            <FormDatePicker type='date-mask' ref={(e) => (this.ngaySinh = e)} label='Ngày sinh' className='col-md-4' required />
            <FormTextBox ref={(e) => (this.cccd = e)} label='CCCD/Hộ chiếu' className='col-md-4' onChange={e => this.handleSizeCccd(e.target.value, 'cccd')} required />
            <FormSelect ref={(e) => (this.gioiTinh = e)} label='Giới tính' data={SelectAdapter_DmGioiTinhV2} className='col-md-2'
                required />
            <FormSelect ref={(e) => (this.moiQuanHeChuHo = e)} label='Quan hệ với chủ hộ' data={SelectAdapter_DmQuanHeGiaDinh} className='col-md-2' required />
            <FormTextBox ref={(e) => (this.maSoBhxh = e)} label='Mã số BHXH (nếu có)' className='col-md-4'
                onChange={(e) => this.handleSizeBhxh(e.target.value, 'maSoBhxh')} />
            <FormTextBox ref={(e) => (this.sdtCaNhan = e)} type='phone' label='Số điện thoại' className='col-md-4'
                onChange={(e) => this.handleSizeSdtCaNhan(e.target.value, 'sdtCaNhan')} required />
            <ComponentDiaDiem ref={(e) => (this.noiCapKhaiSinh = e)} placeholder='Nơi cấp khai sinh' label='Nơi cấp khai sinh' className='col-md-12' />
            <FormRichTextBox ref={(e) => (this.ghiChu = e)} label='Ghi chú' className='col-md-12' />
            <div className='form-group col-md-12' style={{ textAlign: 'center' }}>
                <button className='btn btn-success mr-1' type='button' onClick={(e) => e.preventDefault() || this.updateThanhVien(false, index)}>
                    <i className='fa fa-lg fa-check' /> Thêm thành viên
                </button>
                <button className='btn btn-danger' type='button' onClick={(e) => e.preventDefault() || this.setState({ addIndex: null }, () => this.setTimeLine())}>
                    <i className='fa fa-lg fa-trash' /> Hủy
                </button>
            </div>
        </div>
    );

    // onSuccess = (data) => {
    //     this.setState({ filePath: data.image }, () => {
    //         T.notify('Upload thành công', 'success');
    //         this.setTimeLine(() => {
    //             this.matTruocThe.setData(`BHYTSV_FRONT:${this.state.maDotDangKy}`, this.state.filePath ? `/api/sv/bhyt/front?filePath=${this.state.filePath.split('/')[3]}&maDot=${this.state.filePath.split('/')[1]}&t=${new Date().getTime()}` : '');
    //         });
    //     });
    // };

    onSuccessCmndFront = (data) => {
        const { image = '' } = data || {},
            [maDot, fileName] = image.split('/');
        this.setState({ matTruocCmnd: image }, () => {
            T.notify('Upload thành công', 'success');
            this.setTimeLine(() => {
                this.matTruocCmnd.setData(`svBhytUploadCmndFront:${maDot}`, fileName ? `/api/sv/bhyt/cmnd/front?fileName=${fileName}&maDot=${maDot}&t=${new Date().getTime()}` : '');
            });
        });
    };

    onSuccessCmndBack = (data) => {
        const { image = '' } = data || {},
            [maDot, fileName] = image.split('/');
        this.setState({ matSauCmnd: image }, () => {
            T.notify('Upload thành công', 'success');
            this.setTimeLine(() => {
                this.matSauCmnd.setData(`svBhytUploadCmndBack:${maDot}`, fileName ? `/api/sv/bhyt/cmnd/back?fileName=${fileName}&maDot=${maDot}&t=${new Date().getTime()}` : '');
            });
        });
    };

    getDataChuHo = () => {
        try {
            const { soNhaDuong: soNhaChuHo, maQuanHuyen: maHuyenChuHo, maPhuongXa: maXaChuHo, maTinhThanhPho: maTinhChuHo } = this.diaChiChuHo.value();
            const dataChuHo = {
                hoTenChuHo: getValue(this.hoTenChuHo),
                dienThoaiChuHo: getValue(this.dienThoaiChuHo),
                ngaySinhChuHo: Number(this.ngaySinhChuHo?.value()),
                maHoGiaDinh: getValue(this.maHoGiaDinh),
                cccdChuHo: getValue(this.cccdChuHo),
                soNhaChuHo,
                maXaChuHo,
                maHuyenChuHo,
                maTinhChuHo
            };
            let thanhVien = this.state.dataThanhVien;
            if (thanhVien.length == 0) {
                return ({ error: 'Danh sách thành viên hộ gia đình trống!' });
            }

            if (!(soNhaChuHo && maHuyenChuHo && maTinhChuHo && maXaChuHo)) {
                return ({ error: 'Địa chỉ chủ hộ bị trống!' });
            } else if (this.cccdChuHo?.value().length < 12) {
                this.cccdChuHo?.focus();
                return ({ error: 'Căn cước công dân chủ hộ phải chứ đủ 12 ký tự!' });
            } else if (dataChuHo.dienThoaiChuHo?.length < 10) {
                this.dienThoaiChuHo?.focus();
                return ({ error: 'Số điện thoại phải chứa đủ 10 ký tự!' });
            }

            return {
                dataChuHo,
                dataThanhVien: thanhVien
            };
        } catch (error) {
            if (error.props) {
                error.focus && error.focus();
                return ({ error: `${error.props.placeholder || error.props.label || 'Dữ liệu'}` });
            }
            return { error };
        }

    };

    handleUpdateBhyt = (e) => {
        const { dienDong, coMaBhyt, lichSuDangKy, matTruocCmnd, matSauCmnd } = this.state;
        try {
            e.preventDefault();
            const thongTinBoSung = {
                maBhxhHienTai: coMaBhyt ? getValue(this.maBhxhHienTai) : null,
                benhVienDangKy: dienDong != 0 ? getValue(this.noiKhamChuaBenh) : null,
                // matTruocThe: dienDong == 0 ? filePath : null,
                cccd: getValue(this.cccd),
                dienThoaiCaNhan: getValue(this.dienThoaiCaNhan),
                coBhxh: coMaBhyt ? 1 : 0,
                matTruocCmnd, matSauCmnd
            };
            if (!coMaBhyt && dienDong != 0) {
                const dataChuHo = this.getDataChuHo();
                if (dataChuHo.error) {
                    T.notify(dataChuHo.error, 'danger');
                    return;
                } else {
                    thongTinBoSung.dataChuHo = dataChuHo.dataChuHo;
                    thongTinBoSung.dataThanhVien = dataChuHo.dataThanhVien;
                }
            }
            if (thongTinBoSung.cccd?.length < 12) {
                this.cccd?.focus();
                T.notify('Căn cước công dân phải đủ 12 ký tự!', 'danger');
            } else if (thongTinBoSung.dienThoaiCaNhan?.length < 10) {
                this.dienThoaiCaNhan?.focus();
                T.notify('Số điện thoại cá nhân phải đủ 10 ký tự!', 'danger');
            } else if (thongTinBoSung.maBhxhHienTai != null && thongTinBoSung.maBhxhHienTai.length != 10) {
                T.notify('Vui lòng nhập đủ 10 số cuối trên mặt thẻ BHYT!', 'danger');
            } else if (dienDong != 0 && !coMaBhyt && !matTruocCmnd) {
                T.notify('Vui lòng bổ sung hình ảnh MẶT TRƯỚC thẻ CMND hiện tại', 'danger');
            } else if (dienDong != 0 && !coMaBhyt && !matSauCmnd) {
                T.notify('Vui lòng bổ sung hình ảnh MẶT SAU thẻ CMND hiện tại', 'danger');
            } else {
                T.confirm('Lưu thông tin', 'Bạn có chắc muốn lưu thông tin bổ sung cho BHYT', isConfirm => isConfirm && this.props.updateSvBaoHiemYTeBhyt(lichSuDangKy?.id, thongTinBoSung, () => {
                    this.getThongTinBaoHiemYTe();
                    this.props.setDoneBhytInfo && this.props.setDoneBhytInfo();
                }));
            }
        }
        catch (error) {
            console.error(error);
            if (error.props) {
                error.focus();
                T.notify(`${error.props?.placeholder || error.props?.label || 'Dữ liệu'} bị trống!`, 'danger');
            }
        }
    };

    componentThongTinBoSungBhyt = () => {
        const { dienDong, filePath, thoiGianKetThuc } = this.state;
        return (
            <>
                <p className='tile-title font-weight-bold text-primary'>Kê khai thông tin Bảo hiểm y tế {thoiGianKetThuc ? <span className='text-danger'>(Đến ngày <span><i
                    className='fa fa-clock-o mr-1'></i>{formatDateFromTimestamp(thoiGianKetThuc)}</span>)</span> : ''}</p>
                <div className='row tile-body align-items-center' style={{ marginLeft: '-40px', padding: '10px', borderRadius: '10px', border: '1px solid #1488db' }}>
                    <div className={`col-md-${(this.state.coMaBhyt || this.state.dienDong == 0) ? '8' : '12'}`}>
                        <div className='row'>
                            {this.state.coMaBhyt &&
                                <FormTextBox ref={e => this.maBhxhHienTai = e}
                                    label={<span>Nhập mã số BHXH hay 10 số cuối trên thẻ BHYT <a href={'https://baohiemxahoi.gov.vn/tracuu/Pages/tra-cuu-ho-gia-dinh.aspx'} target='_blank'
                                        rel='noreferrer'>(Tra cứu)</a></span>} placeholder='Mã số BHXH hay 10 số cuối thẻ BHYT'
                                    className='col-md-12'
                                    required
                                    readOnly={''} onChange={e => this.handleSizeBhxh(e.target.value, 'maBhxhHienTai')} />}
                            {dienDong != 0 && !this.state.coMaBhyt && <FormCheckbox className='col-md-12 my-2' ref={e => this.isHaveMaBhyt = e} label='Nếu đã có mã BHXH, sinh viên vui lòng bấm vào đây'
                                onChange={() => this.setState({ coMaBhyt: !this.state.coMaBhyt }, () => {
                                    this.setTimeLine(() => {
                                        const { thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha, maBhxhHienTai, benhVienDangKy } = this.state.dataSinhVien;
                                        this.diaChiChuHo?.value(thuongTruMaTinh || '', thuongTruMaHuyen || '', thuongTruMaXa || '', thuongTruSoNha || '');
                                        if (!this.state.coMaBhyt) {
                                            this.setThongTinChuHo(this.state.lichSuDangKy);
                                        } else {
                                            this.maBhxhHienTai?.value(this.state.lichSuDangKy?.maBhxhHienTai || maBhxhHienTai || '');
                                            this.noiKhamChuaBenh?.value(this.state.lichSuDangKy?.benhVienDangKy || benhVienDangKy || '');
                                        }
                                    });
                                })} />}
                            {dienDong != 0 && <FormSelect ref={e => this.noiKhamChuaBenh = e} label='Đăng ký nơi khám chữa bệnh' placeholder='Đăng ký nơi khám chữa bệnh'
                                className='col-md-12 input-group'
                                data={SelectAdapter_DmCoSoKcbBhyt(0)} required readOnly={''} onChange={this.handleCheckBenhVien} />}
                        </div>
                    </div>
                    {(this.state.coMaBhyt || this.state.dienDong == 0) && <div className='col-md-4 text-center'>
                        <Img style={{ width: '100%', height: 'auto' }} src={'https://bhyt.hcmussh.edu.vn/TheBHYTMT_example.png'} alt='Ảnh mặt trước thẻ BHYT' />
                        <h6 className='font-weight-bold'>Ảnh mẫu thẻ BHYT</h6>
                    </div>}
                    <div className='col-md-12'>
                        <div className='row align-items-center'>
                            {(dienDong != 0) && <>
                                <div className='col-md-12 mb-3'>
                                    <div className='row'>
                                        {!this.state.coMaBhyt && <>
                                            <div className='col-md-6'>
                                                <FormImageBox label={filePath ? 'MẶT TRƯỚC CMND hiện tại' : 'Nhấp hoặc kéo ảnh vào khung dưới để tải lên MẶT TRƯỚC thẻ CMND hiện tại'} ref={e => this.matTruocCmnd = e}
                                                    uploadType='svBhytUploadCmndFront'
                                                    boxUploadStye={{ borderRadius: '10px' }} height='200px' onSuccess={this.onSuccessCmndFront}
                                                    description={
                                                        <div>
                                                            Độ lớn của file ảnh <b className='text-danger'>không quá 1MB</b>. Giảm kích thước file ảnh tại{' '}
                                                            <u><a href='https://www.iloveimg.com/compress-image' target='_blank' rel='noreferrer'>đây</a></u>
                                                        </div>
                                                    } />
                                            </div>
                                            <div className='col-md-6'>
                                                <FormImageBox label={filePath ? 'MẶT SAU CMND hiện tại' : 'Nhấp hoặc kéo ảnh vào khung dưới để tải lên MẶT SAU thẻ CMND hiện tại'} ref={e => this.matSauCmnd = e}
                                                    uploadType='svBhytUploadCmndBack'
                                                    boxUploadStye={{ borderRadius: '10px' }} height='200px' onSuccess={this.onSuccessCmndBack}
                                                    description={
                                                        <div>
                                                            Độ lớn của file ảnh <b className='text-danger'>không quá 1MB</b>. Giảm kích thước file ảnh tại{' '}
                                                            <u><a href='https://www.iloveimg.com/compress-image' target='_blank' rel='noreferrer'>đây</a></u>
                                                        </div>
                                                    } />
                                            </div>
                                            <div className='col-md-12'>
                                                {this.elementPhuLucGiaDinh()}
                                            </div>
                                        </>}
                                    </div>
                                </div>
                            </>}
                            {(this.state.coMaBhyt && this.state.canUpdate) &&
                                <div className='col-md-12 text-center'>
                                    <button className='btn btn-success' type='button' onClick={e => this.handleUpdateBhyt(e)}>
                                        <i className='fa fa-save' /> Hoàn tất kê khai
                                    </button>
                                </div>}
                            {dienDong != 0 && this.state.coMaBhyt && <FormCheckbox className='col-md-12 my-2' ref={e => this.isHaveMaBhyt = e} label='Nếu chưa có mã BHXH, sinh viên vui lòng bấm vào đây'
                                onChange={() => this.setState({ coMaBhyt: !this.state.coMaBhyt }, () => {
                                    this.setTimeLine(() => {
                                        const { thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha, maBhxhHienTai, benhVienDangKy } = this.state.dataSinhVien;
                                        this.diaChiChuHo?.value(thuongTruMaTinh || '', thuongTruMaHuyen || '', thuongTruMaXa || '', thuongTruSoNha || '');
                                        if (!this.state.coMaBhyt) {
                                            this.setThongTinChuHo(this.state.lichSuDangKy);
                                        } else {
                                            this.maBhxhHienTai?.value(this.state.lichSuDangKy?.maBhxhHienTai || maBhxhHienTai || '');
                                            this.noiKhamChuaBenh?.value(this.state.lichSuDangKy?.benhVienDangKy || benhVienDangKy || '');
                                        }
                                    });
                                })} />}
                        </div>
                    </div>
                    {/* {(this.state.coMaBhyt && this.state.dienDong != 0) && <div className='col-md-4 text-center'>
                        <Img style={{ width: '100%', height: 'auto' }} src={'https://bhyt.hcmussh.edu.vn/TheBHYTMT_example.png'} alt='Ảnh mặt trước thẻ BHYT' />
                        <h6 className='font-weight-bold'>Ảnh mẫu thẻ BHYT</h6>
                    </div>} */}
                </div>
            </>
        );
    };

    setTimeLine = (done) => {
        const { lichSuDangKy } = this.state;
        const timeLine = [
            {
                title: 'Đăng ký mới',
                isDone: lichSuDangKy ? 1 : 0,
                componentRender: <>
                    {this.componentDangKyMoi(lichSuDangKy ? 1 : 0)}
                </>,
                disable: !!lichSuDangKy
            },
            {
                title: 'Lịch sử đăng ký',
                isDone: 1,
                componentRender: <>
                    {this.componentThongTinCoBan(0)}
                </>,
                disable: lichSuDangKy ? 0 : 1
            },
            {
                title: 'Thông tin kê khai',
                isDone: 0,
                componentRender: <>
                    {this.componentThongTinBoSungBhyt(0)}
                </>,
                disable: lichSuDangKy ? 0 : 1
            }
        ];
        this.setState({
            timeLine
        }, () => done && done());
    };

    checkThoiGian = (itemTime) => {
        const { thoiGianBatDau, thoiGianKetThuc } = this.state;
        const start = new Date(thoiGianBatDau);
        const end = new Date(thoiGianKetThuc);
        const thoiGianDangKy = new Date(itemTime);
        const now = new Date();
        return (thoiGianDangKy >= start && thoiGianDangKy <= end && now <= thoiGianKetThuc);
    };

    setFormValue = (item) => {
        this.hoTen?.value(`${item.ho} ${item.ten}`);
        this.mssv?.value(item.mssv || '');
        this.dienThoaiCaNhan?.value(item.dienThoaiCaNhan || '');
        this.ngaySinh?.value(item.ngaySinh || '');
        this.cccd?.value(item.cccd || '');
        this.lichSuDienDong?.value(item.lichSuDangKy?.dienDong || '');
    };

    handleDangKiBhyt = (e) => {
        const { dienDong } = this.state;
        try {
            e.preventDefault();
            if (dienDong != null) {
                const svBaoHiemYTe = {
                    dienDong: dienDong,
                    namDangKy: Number(new Date().getFullYear()) + 1
                };
                T.confirm('Xác nhận đăng ký BHYT', `Bạn có chắc muốn đăng ký BHYT diện ${dienDong == 0 ? 'miễn đóng' : (dienDong + ' tháng')}!`, isConfirm => isConfirm && this.props.createSvBaoHiemYTeTanSinhVien(svBaoHiemYTe, () => {
                    this.getThongTinBaoHiemYTe();
                    this.props.onComplete && this.props.onComplete();
                }));
            } else {
                T.notify('Vui lòng chọn diện đăng ký BHYT', 'danger');
            }
        }
        catch (error) {
            console.error(error);
            T.notify(`${error.props.placeholder} bị trống!`, 'danger');
        }
    };


    renderStepBhyt = () => renderTimeline({
        getDataSource: () => this.state.timeLine.filter(item => !item.disable),
        className: 'mt-2',
        handleItem: (item) => ({
            component: <>
                {item.componentRender}
            </>,
            className: item.isDone ? 'success' : ''
        })
    });

    render() {
        return (this.state.isLoading ? loadSpinner() : <>
            <div className='tile'>
                <i className='mb-3'>Mọi thắc mắc, sinh viên vui lòng liên hệ Trạm y tế Trường (<a href='tel:02838293828'>028 38293828 - Nhánh 126</a>) hoặc Tổng đài hỗ trợ BHXH Việt Nam (<a
                    href='tel:19009068'>1900
                    9068</a>)
                    để được hỗ trợ kịp thời.</i>
                {this.renderStepBhyt()}
            </div>
        </>);
    }
}

const mapStateToProps = state => ({ system: state.system, svManageBhyt: state.student.svManageBhyt, dmDienDongBhyt: state.ctsv.dmDienDongBhyt });
const mapActionsToProps = { getSvBaoHiemYTeThongTin, createSvBaoHiemYTeTanSinhVien, huyDangKySvBaoHiemYTe, updateSvBaoHiemYTeBhyt, geAlltDmDienDongBhyt };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SvBhytInfo);