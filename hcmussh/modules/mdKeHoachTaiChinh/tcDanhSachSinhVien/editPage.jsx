import React from 'react';
import { AdminPage, FormDatePicker, FormSelect, FormTabs, FormTextBox, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { GetOneSinhVienPage, getDtDangKyHocPhanByStudent, downloadPhieuThuWord, updateCauHinhThongTin } from './redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_CtsvDmGioiTinh } from 'modules/mdCongTacSinhVien/ctsvDmGioiTinh/redux';
import { SelectAdapter_CtsvDmTinhTrangSinhVien } from 'modules/mdCongTacSinhVien/ctsvDmTinhTrangSinhVien/redux';
import { SectionHocPhi } from './component/sectionHocPhi';
import SyncPreviewModal from 'modules/mdKeHoachTaiChinh/tcHocPhiSubDetailLog/modal/SyncPreviewModal';
import DownloadPhieuThu from './modal/downloadPhieuThuModal';
import CauHinhThongTinModal from './modal/cauHinhThongTinModal';
// import ThongTinBaoLuuModal from './modal/thongTinBaoLuuModal';
import { syncPreview, syncData } from 'modules/mdKeHoachTaiChinh/tcHocPhiSubDetailLog/redux';


// const yearDatas = () => {
//     return Array.from({ length: 15 }, (_, i) => {
//         const year = i + new Date().getFullYear() - 14;
//         return { id: year, text: `${year} - ${year + 1}` };
//     });
// };

// const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

// class ThongTinBaoLuuModal extends AdminModal {
//     state = { isLoading: true, isSubmitting: false };

//     onShow = (mssv) => {
//         const dataSinhVien = this.props?.tcDanhSachSinhVien?.infoSinhVien;
//         this.setState({ mssv, cauHinh: dataSinhVien?.thongTinBaoLuu || [], infoSv: dataSinhVien?.infoSinhVien }, () => {
//             this.parseData();
//         });
//     }

//     parseData = () => {
//         this.setState({ isLoading: false }, () => {
//             // this.state.cauHinh.map(item => ['bacDaoTao', 'heDaoTao', 'nganhDaoTao', 'khoaSinhVien'].map(key => this[`${key}_${item.namHoc}_${item.hocKy}`].value(item[key] || '')));
//             this.mssv.value(this.state.infoSv.mssv);
//             this.hoVaTen.value(`${this.state.infoSv.ho} ${this.state.infoSv.ten}`.trim());
//             this.namTuyenSinh.value(this.state.infoSv.namTuyenSinh);
//             // this.bacDaoTao.value(this.state.infoSv.bacDaoTao);
//             // this.heDaoTao.value(this.state.infoSv.loaiHinhDaoTao);
//             // this.nganhDaoTao.value(this.state.infoSv.maNganh);
//             this.khoaSinhVien.value(this.state.infoSv.khoaSinhVien);
//         });
//     }

//     onAdd = () => {
//         let cauHinh = this.state.cauHinh;
//         let data = {
//             mssv: this.state.mssv,
//             namHoc: this.namHoc.value() || '',
//             hocKy: this.hocKy.value() || '',
//             soQuyetDinh: this.soQuyetDinh.value() || ''
//         };

//         if (!data.namHoc) {
//             T.notify('Chưa chọn năm học', 'danger');
//             this.namHoc.focus();
//         }
//         else if (!data.hocKy) {
//             T.notify('Chưa chọn học kỳ', 'danger');
//             this.hocKy.focus();
//         }
//         else {
//             if (cauHinh.some(item => parseInt(item.namHoc) == parseInt(data.namHoc) && parseInt(item.hocKy) == parseInt(data.hocKy))) {
//                 T.notify(`Đã tồn tại thông tin bảo lưu của năm học ${data.namHoc}, học kỳ ${data.hocKy}`, 'danger');
//             }
//             else {
//                 this.setState({ cauHinh: [...cauHinh, data] }, () => {
//                     this.namHoc.value('');
//                     this.hocKy.value('');
//                     this.soQuyetDinh.value('');
//                 });
//             }
//         }
//     }

//     onSubmit = () => {
//         this.setState({ isSubmitting: true }, () => {
//             this.props.updateBaoLuu(this.state.mssv, this.state.cauHinh, getValue(this.khoaSinhVien), () => {
//                 this.props.reload(() => {
//                     this.setState({ isSubmitting: false });
//                     T.notify('Cập nhật cấu hình thông tin sinh viên thành công!', 'success');
//                     this.hide();
//                 });
//             });
//         });
//     }

//     render = () => {
//         const table = renderTable({
//             header: 'thead-light',
//             emptyTable: 'Không có thông tin bảo lưu học phí',
//             getDataSource: () => this.state.cauHinh || [],
//             renderHead: () => (
//                 <tr>
//                     <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
//                     <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
//                     <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
//                     <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Số quyết định</th>
//                 </tr>),
//             renderRow: (item, index) => (
//                 <tr key={index}>
//                     <TableCell content={index + 1} />
//                     <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc}\n-\n${parseInt(item.namHoc) + 1}`} />
//                     <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`HK${item.hocKy}`} />
//                     <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
//                 </tr>
//             )
//         });

//         return this.renderModal({
//             title: 'Thông tin bảo lưu sinh viên',
//             size: 'elarge',
//             body: <>
//                 <div className='row'>
//                     <FormTextBox ref={e => this.mssv = e} label='MSSV' className='col-md-3' readOnly />
//                     <FormTextBox ref={e => this.hoVaTen = e} label='Họ và tên' className='col-md-3' readOnly />
//                     <FormTextBox ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' className='col-md-3' readOnly />
//                     <FormTextBox ref={e => this.khoaSinhVien = e} label='Khóa sinh viên' className='col-md-3' readOnly />
//                     {/* <h4 className='col-md-12' style={{ marginTop: '20px', marginBottom: '10px' }}>Thông tin định phí theo học kỳ</h4> */}
//                     <div className='col-md-12'> {table} </div>
//                     <div className='col-md-12' style={{ marginTop: '30px' }}>
//                         <div className='tile' style={{ marginBottom: '0' }}>
//                             <div className='row'>
//                                 <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={yearDatas()?.reverse() || []} ref={e => this.namHoc = e} label='Năm học' required />
//                                 <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={termDatas} ref={e => this.hocKy = e} label='Học kỳ' required />
//                                 <FormTextBox disabled={this.state.isSubmitting} className='col-md-4' ref={e => this.soQuyetDinh = e} label='Số quyết định' />
//                             </div>
//                         </div>
//                     </div>
//                 </div >
//             </>,
//             buttons: <>
//                 <button className='btn btn-success' onClick={this.onAdd}>
//                     <i className='fa fa-fw fa-lg fa-plus' /> Thêm
//                 </button>
//             </>,
//         });
//     }
// }

class DetailInfoSinhVien extends AdminPage {
    componentDidMount() {
        const route = T.routeMatcher('/user/finance/danh-sach-sinh-vien/:mssv');
        const mssv = route.parse(window.location.pathname)?.mssv;
        this.setState({ mssv }, () => this.setupData());
    }

    setupData = (done) => {
        const mssv = this.state.mssv;
        if (mssv) {
            this.props.GetOneSinhVienPage(mssv, data => {
                this.initDataStudent(data);
                done && done();
            });
            this.props.getDtDangKyHocPhanByStudent(mssv, {}, listHocPhan => this.setState({ listHocPhan }));
            this.formTab.tabClick(null, 1);
        }
    }

    initDataStudent = (data) => {
        if (data.infoSinhVien) {
            this?.mssv.value(data.infoSinhVien.mssv || '');
            this?.ho.value(data.infoSinhVien.ho || '');
            this?.ten.value(data.infoSinhVien.ten || '');
            this?.ngaySinh.value(data.infoSinhVien.ngaySinh || '');
            this?.gioiTinh.value(data.infoSinhVien.gioiTinh ? ('0' + String(data.infoSinhVien.gioiTinh)) : '');
            this?.noiSinhQuocGia.value(data.infoSinhVien.noiSinhQuocGia ? data.infoSinhVien.noiSinhQuocGia : 'VN');
            this?.ngayNhapHoc.value(data.infoSinhVien.ngayNhapHoc || '');
            this?.tinhTrang.value(data.infoSinhVien.tinhTrang || '');
            this?.lop.value(data.infoSinhVien.lop || '');
            this?.khoa.value(data.infoSinhVien.tenKhoa || '');
            this?.nganh.value(data.infoSinhVien.tenNganh || '');
            this?.loaiHinhDaoTao.value(data.infoSinhVien.tenLoaiHinh || '');
            this?.khoaGiaoDich.value(data.infoSinhVien.khoaGiaoDich ? 'Đang mở' : 'Đang khóa');
            this?.cmnd.value(data.infoSinhVien.cmnd || '');
        }

    }
    toBack = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    }

    secsionInfoSinhVien = () => {
        const readOnly = true;
        return (
            <>
                <div className='tile'>
                    <h3 className='tile-title' style={{ color: '#0139a6' }}>Thông tin cá nhân</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='form-group col-md-12'>
                                <div className='row'>
                                    <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-3' readOnly={readOnly} />
                                    <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-3' readOnly={readOnly} />
                                    <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-3' readOnly={readOnly} />
                                    <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='form-group col-md-3' readOnly={readOnly} />
                                    <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' className='form-group col-md-3' data={SelectAdapter_CtsvDmGioiTinh} readOnly={readOnly} />
                                    <FormSelect ref={e => this.noiSinhQuocGia = e} data={SelectAdapter_DmQuocGia} className='form-group col-md-3' readOnly={readOnly} label='Nơi sinh quốc gia' />
                                    <FormDatePicker type='date-mask' ref={e => this.ngayNhapHoc = e} readOnly={true} label='Ngày nhập học' className='col-md-3' />
                                    <FormTextBox ref={e => this.cmnd = e} label='CCCD/CMND' className='form-group col-md-3' readOnly={readOnly} />
                                    <FormSelect ref={e => this.tinhTrang = e} readOnly={true} label='Tình trạng sinh viên' className='col-md-3' data={SelectAdapter_CtsvDmTinhTrangSinhVien} />
                                    <FormTextBox ref={e => this.khoaGiaoDich = e} label='Tình trạng giao dịch' className='form-group col-md-3' readOnly={readOnly} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='tile-footer' style={{ padding: '0', marginBottom: '20px', marginTop: '10px' }} />
                    <h3 className='tile-title' style={{ color: '#0139a6' }}>Thông tin học tập</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='form-group col-md-12'>
                                <div className='row'>
                                    <FormTextBox ref={e => this.loaiHinhDaoTao = e} className='col-md-3' readOnly label='Loại hình đào tạo' />
                                    <FormTextBox ref={e => this.khoa = e} className='col-md-3' readOnly label='Khoa đào tạo' />
                                    <FormTextBox ref={e => this.nganh = e} className='col-md-3' readOnly label='Ngành đào tạo' />
                                    <FormTextBox ref={e => this.lop = e} className='col-md-3' readOnly label='Lớp sinh viên' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </>

        );
    }

    roundToTwo = (num) => {
        return +(Math.round(num + 'e+2') + 'e-2');
    }

    secsionMienGiam = () => {
        const infoMienGiam = this.props?.tcDanhSachSinhVien?.infoSinhVien?.infoMienGiam || [];
        let dataNamHoc = infoMienGiam.groupBy('namHoc');
        if (infoMienGiam.length) {
            const namHocKeys = Object.keys(dataNamHoc);
            return (<>{namHocKeys.sort((a, b) => b - a).map(namHoc => {
                const dataHocKy = dataNamHoc[namHoc].groupBy('hocKy');
                return Object.keys(dataHocKy).sort((a, b) => b - a).map((hocKy, i) => {
                    return (
                        <div className='tile' key={`${namHoc}-${hocKy}-${i}`}>
                            <h4 style={{ margin: '10px 0px ', color: '#0139a6' }}>Năm học {namHoc} - Học kỳ {hocKy}</h4>
                            <div className='tile-footer' style={{ padding: '0', marginBottom: '10px', marginTop: '0' }} />
                            <h5>Phần trăm miễn giảm học phí: <span style={{ color: '#FF5733' }}>{dataHocKy[hocKy][0]?.phanTramMienGiam}%</span></h5>
                            <h5>Số tiền đã giảm: <span style={{ color: '#FF5733' }}>{T.numberDisplay(dataHocKy[hocKy][0]?.soTienMienGiam)} VNĐ</span></h5>
                        </div>
                    );
                });
            })}</>);
        }
        else {
            return (<>
                <div className='tile'>
                    <h4 style={{ display: 'flex', justifyContent: 'center' }}>Sinh viên không có thông tin miễn giảm</h4>
                </div>
            </>);
        }


    }

    secsionHoanTra = () => {
        const infoHoanTra = this.props?.tcDanhSachSinhVien?.infoSinhVien?.infoHoanTra || [];
        const styleText = { color: '#CD5C5C' };
        let dataNamHoc = infoHoanTra.groupBy('namHoc');
        if (infoHoanTra.length) {
            const namHocKeys = Object.keys(dataNamHoc);
            return (<>{namHocKeys.sort((a, b) => b - a).map(key => {
                const dataHocKy = dataNamHoc[key].groupBy('hocKy');
                return Object.keys(dataHocKy).sort((a, b) => b - a).map((hocKy, i) => {
                    return (
                        <div className='tile' key={i}>
                            <h4 style={{ margin: '10px 0px ', color: '#0139a6' }}>Năm học {key}-{parseInt(key) + 1} - Học kỳ {hocKy}</h4>
                            <div className='tile-footer' style={{ padding: '0', marginBottom: '10px', marginTop: '0' }} />
                            <div className='row' >
                                <h5 className='col-md-4'>Số tài khoản: <span style={styleText}>{dataHocKy[hocKy][0].stk}</span></h5>
                                <h5 className='col-md-4'>Ngân hàng:  <span style={styleText}>{dataHocKy[hocKy][0].nganHang}</span></h5>
                                <h5 className='col-md-4'>Chủ tài khoản:  <span style={styleText}>{dataHocKy[hocKy][0].chuTaiKhoan}</span></h5>
                                <h5 className='col-md-4'>Số quyết định:  <span style={styleText}>{dataHocKy[hocKy][0].soQuyetDinh}</span></h5>
                                <h5 className='col-md-4'>Ngày ra quyết định:  <span style={styleText}>{T.dateToText(dataHocKy[hocKy][0].ngayRaQuyetDinh, 'dd/mm/yyyy')}</span></h5>
                                <h5 className='col-md-4'>Ngày hoàn trả: <span style={styleText}>{T.dateToText(dataHocKy[hocKy][0].ngayHoanTra, 'dd/mm/yyyy')}</span> </h5>
                                <h5 className='col-md-4'>Số tiền hoàn trả: <span style={styleText}>{dataHocKy[hocKy][0].lyDo}</span></h5>
                                <h5 className='col-md-4'>Số tiền hoàn trả: <span style={styleText}>{T.numberDisplay(dataHocKy[hocKy][0].soTien)} VNĐ</span></h5>
                                <h5 className='col-md-12'>Ghi chú: <span style={styleText}>{dataHocKy[hocKy][0].ghiChu}</span></h5>
                                <h5 className='col-md-12'>Tình trạng: {
                                    dataHocKy[hocKy][0].tinhTrangHoanTra ?
                                        <span style={{ color: '#ADFF2F' }}> <i className='fa fa-check-circle' aria-hidden='true'></i> Đã hoàn trả</span>
                                        :
                                        <span style={{ color: '	#CCCC00' }}> <i className='fa fa-spinner' aria-hidden='true'></i> Đang xét duyệt</span>
                                }</h5>
                            </div>
                        </div>
                    );
                });
            })}</>);
        } else {
            return (<>
                <div className='tile'>
                    <h4 style={{ display: 'flex', justifyContent: 'center' }}>Sinh viên không có thông tin hoàn trả</h4>
                </div>
            </>);
        }

    }

    listHocPhan = () => renderTable({
        getDataSource: () => Object.keys((this.state.listHocPhan || []).groupBy('namHoc')),
        emptyTable: 'Không có thông tin học phần đăng ký',
        header: 'thead-light',
        stickyHead: false,
        multipleTbody: true,
        renderHead: () => (
            <tr>
                <th style={{ width: '10%' }} colSpan={2}>#</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                <th style={{ width: '65%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian đăng ký</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày kết thúc</th>
            </tr>
        ),
        renderRow: (namHoc, index) => {
            let dataNamHoc = this.state.listHocPhan.groupBy('namHoc')[namHoc],
                dataHocKy = dataNamHoc.groupBy('hocKy');
            return (
                <tbody key={index}>
                    <tr>
                        <th colSpan={11} style={{ backgroundColor: '#fff' }}>Năm học {namHoc}</th>
                    </tr>
                    {Object.keys(dataHocKy).sort((a, b) => b - a).map((hocKy) =>
                        dataHocKy[hocKy].map((item, index) => {
                            return (
                                <tr key={`${namHoc}-${hocKy}-${index}`}>
                                    {index == 0 && <th rowSpan={dataHocKy[hocKy].length} style={{ backgroundColor: '#fff' }}>HK{hocKy}</th>}
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maHocPhan} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayDangKy} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayBatDau} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKetThuc} />
                                </tr>
                            );
                        })
                    )}
                </tbody>
            );
        }
    })

    secsionHocPhanDangKy = () => {
        return (<>
            {this.state.listHocPhan ? this.listHocPhan() : <div className='tile'>
                <h4 style={{ display: 'flex', justifyContent: 'center' }}>Sinh viên không có thông tin đăng ký học phần</h4>
            </div>}</>);
    }

    sectionHocPhiSinhVien = (data) => {
        return (<>
            <SectionHocPhi data={data} />
        </>);
    }

    syncPreview = () => {
        const item = { mssv: this.state?.mssv || '' };
        T.alert('Đang xử lý', 'warning', false, null, true);
        this.props.syncPreview(item, (res) => {
            T.alert('Lấy dữ liệu đồng bộ thành công', 'success', false, 1000);
            this.syncPreviewModal.show(res, item);
        });
    }

    render() {
        const data = this.props?.tcDanhSachSinhVien?.infoSinhVien || {};
        return this.renderPage({
            title: `Mô phỏng trang sinh viên ${data?.infoSinhVien?.ho || ''}  ${data?.infoSinhVien?.ten || ''} - ${data?.infoSinhVien?.mssv || ''}`,
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/finance'>Kế hoạch tài chính</Link>,
                'Danh sách sinh viên'
            ],
            content: data ? <>
                <FormTabs ref={e => this.formTab = e}
                    contentClassName='tile'
                    tabs={[
                        { id: 0, title: 'Thông tin sinh viên', component: data && this.secsionInfoSinhVien() },
                        { id: 1, title: 'Thông tin học phí', component: data && this.sectionHocPhiSinhVien(data) },
                        { id: 2, title: 'Thông tin miễn giảm', component: data && this.secsionMienGiam() },
                        { id: 3, title: 'Thông tin hoàn trả', component: data && this.secsionHoanTra() },
                        { id: 4, title: 'Lịch sử đăng ký học phần', component: this.secsionHocPhanDangKy() },
                    ]}
                />
                <SyncPreviewModal ref={e => this.syncPreviewModal = e} sync={this.props.syncData} reload={this.setupData} />
                <DownloadPhieuThu ref={e => this.downloadPhieuThuModal = e} downloadWord={this.props.downloadPhieuThuWord} />
                <CauHinhThongTinModal ref={e => this.cauHinhThongTinModal = e} updateCauHinh={this.props.updateCauHinhThongTin} reload={this.setupData} />
                {/* <ThongTinBaoLuuModal ref={e => this.thongTinBaoLuuModal = e} updateBaoLuu={this.props.updateCauHinhBaoLuu} reload={this.setupData} /> */}

            </> : loadSpinner(),
            backRoute: '/user/finance',
            buttons: [
                { className: 'btn-secondary', icon: 'fa fa-angle-double-down', tooltip: 'Đến cuối trang', onClick: (e) => e.preventDefault() || this.toBack() },
                { className: 'btn-warning', icon: 'fa-history', tooltip: 'Lịch sử giao dịch', onClick: (e) => e.preventDefault() || this.props.history.push(`/user/finance/invoice/${this.state.mssv}`) },
                { className: 'btn-success', icon: 'fa fa-lg fa-forward', tooltip: 'Đồng bộ học phí', onClick: e => e.preventDefault() || this.syncPreview() },
                { className: 'btn-primary', icon: 'fa fa-lg fa-file-text', tooltip: 'Phiếu xác nhận học phí', onClick: e => e.preventDefault() || this.downloadPhieuThuModal.show(data) },
                { className: 'btn-warning', icon: 'fa fa-lg fa-pencil', tooltip: 'Cấu hình thông tin định phí', onClick: e => e.preventDefault() || this.cauHinhThongTinModal.show(this.state.mssv) },
                // { className: 'btn-danger', icon: 'fa fa-lg fa-times', tooltip: 'Bảo lưu học phí', onClick: e => e.preventDefault() || this.thongTinBaoLuuModal.show(this.state.mssv) }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcDanhSachSinhVien: state.finance.tcDanhSachSinhVien });
const mapActionsToProps = {
    GetOneSinhVienPage, getDtDangKyHocPhanByStudent, syncPreview, syncData, downloadPhieuThuWord, updateCauHinhThongTin
};
export default connect(mapStateToProps, mapActionsToProps)(DetailInfoSinhVien);