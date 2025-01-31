import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SelectAdapter_TcDotDong } from 'modules/mdKeHoachTaiChinh/tcDotDong/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_TcLoaiPhi } from 'modules/mdKeHoachTaiChinh/tcLoaiPhi/redux';
// import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { getListLoaiPhi, capNhatSoTien, getAllHeDaoTao, getCauHinhDotDongBacHe, luuCauHinhDotDongBacHe, xoaCauHinhDotDongBacHe, apDungDotDongPreview, apDungDotDong, getInfoSinhVien, rollBackDotDong } from './redux';
import { AdminPage, TableCell, renderTable, FormSelect, FormTextBox, FormTabs } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import ApDungDotDongPreviewModal from './modal/apDungDotDongPreviewModal';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

// const apDungType = [{ id: 1, text: 'Áp dụng theo từng sinh viên' }, { id: 2, text: 'Áp dụng theo danh sách excel' }, { id: 3, text: 'Áp dụng theo bậc/loại hình đào tạo' }];
class tcDotDongDetailPage extends AdminPage {
    state = { isSubmitting: false, changeSoTien: false };

    componentDidMount() {
        T.ready('/user/finance', () => {
            let idDotDong = parseInt(window.location.search.substring(1).split('=')[1]);
            this.setState({ idDotDong }, () => {
                this.dotDong.value(idDotDong);
                this.getListLoaiPhi(true);
            });
            this.props.getAllHeDaoTao(item => {
                this.setState({ listHeDaoTao: item || [] });
            });
        });
    }

    getListLoaiPhi = (start) => {
        this.props.getListLoaiPhi({ id: this.state.idDotDong, start }, (item) => {
            this.setState({ listLoaiPhi: item || [] }, () => {
                this.state.listLoaiPhi.forEach(ele => {
                    ele.soTien && this[`soTien_${ele.loaiPhi}`].value(ele.soTien);
                });
            });
        });
    }

    capNhatSoTien = () => {
        if (this.state.changeSoTien == 1) {
            if (this.state.listLoaiPhi.some(item => (item.isHocPhi && this[`soTien_${item.loaiPhi}`].value()))) {
                T.notify('Không thể cài đặt số tiền cho học phí', 'danger');
            }
            else {
                const data = this.state.listLoaiPhi.map(item => [{ idDotDong: item.idDotDong, loaiPhi: item.loaiPhi }, { soTien: this[`soTien_${item.loaiPhi}`].value() || '' }]);
                this.props.capNhatSoTien(data, () => {
                    let listLoaiPhi = this.state.listLoaiPhi;
                    listLoaiPhi.forEach(item => {
                        this[`soTien_${item.loaiPhi}`].value('');
                    });
                    this.getListLoaiPhi();
                    this.setState({ changeSoTien: !this.state.changeSoTien });
                });
            }
        }
        else {
            this.setState({ changeSoTien: !this.state.changeSoTien });
        }
    }

    onChangeValue = () => {
        const khoaSinhVien = this.khoaSinhVien?.value() || '';
        const idDotDong = this.dotDong?.value() || '';
        const bacDaoTao = this.bacDaoTao?.value() || '';

        if (khoaSinhVien && idDotDong && bacDaoTao) {
            this.props.getCauHinhDotDongBacHe({ idDotDong, khoaSinhVien, bacDaoTao }, data => {
                this.clearData();
                for (let item of data) {
                    this[`loaiPhi_${item.heDaoTao}`]?.value(item.loaiPhi);
                }
            });
        }
    }

    clearData = () => {
        for (let item of this.state.listHeDaoTao) {
            this[`loaiPhi_${item.ma}`]?.value('');
        }
    }

    refresh = () => {
        this.clearData();
        this.onChangeValue();
    }

    onSave = (item) => {
        let data = {
            idDotDong: this.state.idDotDong,
            bacDaoTao: this.bacDaoTao?.value() || '',
            heDaoTao: item.ma,
            khoaSinhVien: this.khoaSinhVien?.value() || '',
            loaiPhi: this[`loaiPhi_${item.ma}`].value() || '',
        };
        if (!data.bacDaoTao) {
            T.notify('Vui lòng chọn bậc đào tạo', 'danger');
            this.bacDaoTao.focus();
        }
        else if (!data.khoaSinhVien) {
            T.notify('Vui lòng chọn khóa sinh viên', 'danger');
            this.khoaSinhVien.focus();
        }
        else if (!(data.loaiPhi && data.loaiPhi.length)) {
            T.notify('Vui lòng chọn loại phí', 'danger');
            this[`loaiPhi_${item.ma}`].focus();
        }
        else if (data.loaiPhi.some(item => this.state.listLoaiPhi.map(item => item.loaiPhi).indexOf(Number(item)) < 0)) {
            T.notify('Loại phí không tồn tại trong đợt đóng này', 'danger');
            this[`loaiPhi_${item.ma}`].focus();
        }
        else {
            data.loaiPhi = data.loaiPhi.toString();
            this.props.luuCauHinhDotDongBacHe(data, () => this.props.getCauHinhDotDongBacHe({
                idDotDong: data.idDotDong,
                khoaSinhVien: data.khoaSinhVien,
                bacDaoTao: data.bacDaoTao
            }, () => T.notify('Lưu cấu hình đợt đóng thành công!', 'success')));
        }

    }

    onDelete = (item) => {
        const data = {
            idDotDong: this.state.idDotDong,
            bacDaoTao: this.bacDaoTao?.value() || '',
            heDaoTao: item.ma,
            khoaSinhVien: this.khoaSinhVien?.value() || '',
            loaiPhi: this[`loaiPhi_${item.ma}`].value() || '',
        };
        if (!data.bacDaoTao) {
            T.notify('Vui lòng chọn bậc đào tạo', 'danger');
            this.bacDaoTao.focus();
        }
        else if (!data.khoaSinhVien) {
            T.notify('Vui lòng chọn khóa sinh viên', 'danger');
            this.khoaSinhVien.focus();
        }
        else {
            data.loaiPhi = data.loaiPhi.toString();
            T.confirm('Xóa cấu hình đợt đóng', `Bạn có chắc bạn muốn xóa cấu hình đợt đóng cho hệ ${item.ten}?`, true, isConfirm =>
                isConfirm && this.props.xoaCauHinhDotDongBacHe(data, () => {
                    this.props.getCauHinhDotDongBacHe({ idDotDong: data.idDotDong, khoaSinhVien: data.khoaSinhVien, bacDaoTao: data.bacDaoTao });
                    setTimeout(this.refresh(), 1000);
                })
            );
        }
    }

    applyAll = (ghiDe = null) => {
        const data = {
            khoaSinhVien: this.khoaSinhVien?.value() || '',
            bacDaoTao: this.bacDaoTao?.value() || '',
            loaiPhi: this.state?.listLoaiPhi || ''
        };

        if (!data.bacDaoTao) {
            T.notify('Vui lòng chọn bậc đào tạo', 'danger');
            this.bacDaoTao.focus();
        }
        else if (!data.khoaSinhVien) {
            T.notify('Vui lòng chọn khóa sinh viên', 'danger');
            this.khoaSinhVien.focus();
        }
        else {
            let loaiPhi = this.state?.listLoaiPhi || '';
            loaiPhi = loaiPhi.map(item => item.loaiPhi);
            for (let item of this.state.listHeDaoTao) {
                let listLoaiPhi = this[`loaiPhi_${item.ma}`]?.value() || [];
                if (ghiDe || !listLoaiPhi.length) {
                    loaiPhi && this[`loaiPhi_${item.ma}`]?.value(loaiPhi);
                }
            }
        }
    }

    saveAll = () => {
        for (let item of this.state.listHeDaoTao) {
            let data = {
                idDotDong: this.state.idDotDong,
                bacDaoTao: this.bacDaoTao?.value() || '',
                heDaoTao: item.ma,
                khoaSinhVien: this.khoaSinhVien?.value() || '',
                loaiPhi: this[`loaiPhi_${item.ma}`].value() || '',
            };
            if (!data.bacDaoTao) {
                T.notify('Vui lòng chọn bậc đào tạo', 'danger');
                this.bacDaoTao.focus();
            }
            else if (!data.khoaSinhVien) {
                T.notify('Vui lòng chọn khóa sinh viên', 'danger');
                this.khoaSinhVien.focus();
            }
            else if (data.loaiPhi.some(item => this.state.listLoaiPhi.map(item => item.loaiPhi).indexOf(Number(item)) < 0)) {
                T.notify('Loại phí không tồn tại trong đợt đóng này', 'danger');
                this[`loaiPhi_${item.ma}`].focus();
            }
            else {
                data.loaiPhi = data.loaiPhi.toString();
                data.loaiPhi && this.props.luuCauHinhDotDongBacHe(data, () => this.props.getCauHinhDotDongBacHe({
                    idDotDong: data.idDotDong,
                    khoaSinhVien: data.khoaSinhVien,
                    bacDaoTao: data.bacDaoTao
                }));
            }
        }
        T.notify('Lưu cấu hình đợt đóng thành công!', 'success');
    }

    apDungBacHePreview = (item) => {
        const data = {
            idDotDong: this.state.idDotDong,
            bacDaoTao: this.bacDaoTao?.value() || '',
            heDaoTao: item.ma,
            khoaSinhVien: this.khoaSinhVien?.value() || '',
            loaiPhi: this.props.tcDotDong?.detail?.filter(ele => ele.heDaoTao == item.ma)[0]?.loaiPhi || [],
            apDung: 1,
            taiApDung: 1,
            imssv: null
        };

        const listLoaiPhiNull = data.loaiPhi.filter(ele => this.state.listLoaiPhi.find(subEle => subEle.loaiPhi == ele).isHocPhi == 0 && !this[`soTien_${ele}`].value());

        if (!data.bacDaoTao) {
            T.notify('Vui lòng chọn bậc đào tạo', 'danger');
            this.bacDaoTao.focus();
        }
        else if (!data.khoaSinhVien) {
            T.notify('Vui lòng chọn khóa sinh viên', 'danger');
            this.khoaSinhVien.focus();
        }
        else if (!(data.loaiPhi && data.loaiPhi.length)) {
            if (this[`loaiPhi_${item.ma}`].value().length > 0) {
                T.notify('Vui lòng lưu cấu hình trước khi áp dụng', 'danger');
            }
            else {
                T.notify('Vui lòng chọn loại phí', 'danger');
                this[`loaiPhi_${item.ma}`].focus();
            }
        }
        else if (listLoaiPhiNull.length > 0) {
            T.notify(`Loại phí ${listLoaiPhiNull.map(ele => this.state.listLoaiPhi.find(subEle => subEle.loaiPhi == ele).tenLoaiPhi).join(', ')} chưa được cấu hình số tiền`, 'danger');
        }
        else {
            this.setState({ isSubmitting: true }, () => {
                this.props.apDungDotDongPreview(data, res => {
                    this.previewModal.show({ data: res, filter: data });
                    this.setState({ isSubmitting: false });
                });
            });
        }
    }

    apDungPreview = () => {
        let data = {
            idDotDong: this.state.idDotDong,
            bacDaoTao: null,
            heDaoTao: null,
            khoaSinhVien: null,
            loaiPhi: this.state.listLoaiPhi.filter(item => item.isHocPhi || this[`soTien_${item.loaiPhi}`].value()).map(item => item.loaiPhi) || [],
            apDung: 1,
            taiApDung: 1,
            imssv: this.sinhVien.value() || '',
        };

        if (!data.loaiPhi || !data.loaiPhi.length) {
            T.notify('Vui lòng cấu hình số tiền cho các loại phí', 'danger');
        }
        else {
            this.props.getInfoSinhVien(data.imssv, res => {
                data.bacDaoTao = res.bacDaoTao;
                data.heDaoTao = res.loaiHinhDaoTao;
                data.khoaSinhVien = res.khoaSinhVien;
                this.setState({ isSubmitting: true }, () => {
                    this.props.apDungDotDongPreview(data, res => {
                        this.previewModal.show({ data: res, filter: data });
                        this.setState({ isSubmitting: false });
                    });
                });
            });
        }
    }

    rollBackBacHe = (item) => {
        const data = {
            idDotDong: this.state.idDotDong,
            bacDaoTao: this.bacDaoTao?.value() || '',
            heDaoTao: item.ma || '',
            khoaSinhVien: this.khoaSinhVien?.value() || '',
            imssv: null,
        };
        if (!data.bacDaoTao) {
            T.notify('Vui lòng chọn bậc đào tạo', 'danger');
            this.bacDaoTao.focus();
        }
        else if (!data.khoaSinhVien) {
            T.notify('Vui lòng chọn khóa sinh viên', 'danger');
            this.khoaSinhVien.focus();
        }
        else {
            T.confirm('Hoàn tác đợt đóng', 'Bạn có chắc chắn muốn hoàn tác tất cả các loại phí không?', true, isConfirm => {
                isConfirm && this.props.rollBackDotDong(data, () => {
                    T.notify('Hoàn tác đợt đóng thành công', 'success');
                });
            });
        }
    }

    rollBack = () => {
        const data = {
            idDotDong: this.state.idDotDong,
            bacDaoTao: null,
            heDaoTao: null,
            khoaSinhVien: null,
            imssv: this.sinhVien?.value() || '',
        };
        if (!data.imssv) {
            T.notify('Vui lòng chọn sinh viên', 'danger');
            this.sinhVien.focus();
        }
        else {
            T.confirm('Hoàn tác đợt đóng', 'Bạn có chắc chắn muốn hoàn tác tất cả các loại phí không?', true, isConfirm => {
                isConfirm && this.props.rollBackDotDong(data, () => {
                    this.sinhVien.value('');
                    T.notify('Hoàn tác đợt đóng thành công', 'success');
                });
            });
        }
    }

    apDungBacHeTab = () => {
        let listHeDaoTao = renderTable({
            emptyTable: 'Không có dữ liệu hệ đào tạo',
            getDataSource: () => this.state.listHeDaoTao, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Hệ đào tạo</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại phí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }}
                        content={<FormSelect disabled={this.state.isSubmitting} ref={e => this[`loaiPhi_${item.ma}`] = e} data={SelectAdapter_TcLoaiPhi} className='col-md-12' style={{ margin: 0, padding: 0 }} multiple />}
                    />
                    <TableCell type='buttons' content={item}>
                        <Tooltip title='Hoàn tác đợt đóng' arrow >
                            <button className='btn btn-warning' onClick={e => e.preventDefault() || this.rollBackBacHe(item)}>
                                <i className='fa fa-lg fa-rotate-left' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Áp dụng đợt đóng' arrow >
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.apDungBacHePreview(item)}>
                                <i className='fa fa-lg fa-forward' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Xóa cấu hình' arrow >
                            <button className='btn btn-danger' onClick={e => e.preventDefault() || this.onDelete(item)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Lưu cấu hình' arrow >
                            <button className='btn btn-primary' onClick={e => e.preventDefault() || this.onSave(item)}>
                                <i className='fa fa-lg fa-save' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return (
            <div className='tile row' style={{ margin: '0 0 30px 0' }}>
                <div className='col-md-12' style={{ marginTop: 20 }}>
                    <div className='tile'>
                        <div className='row'>
                            <FormSelect disabled={this.state.isSubmitting} className='col-md-6' data={SelectAdapter_DmSvBacDaoTao} ref={e => this.bacDaoTao = e} onChange={this.onChangeValue} label='Bậc đào tạo' required />
                            <FormSelect disabled={this.state.isSubmitting} className='col-md-6' data={yearDatas()?.reverse()} ref={e => this.khoaSinhVien = e} onChange={this.onChangeValue} label='Khóa sinh viên' required />
                        </div>
                    </div>
                </div>

                {this.state.idDotDong && <div className='col-md-12'>
                    <div className='d-flex justify-content-between'>
                        <h4 className='tile-title'>Danh sách hệ đào tạo</h4>
                        {/* <div className='form-group col-md-3 d-flex align-items-end justify-content-end'><FormCheckbox isSwitch label={'Thao tác nhanh'} ref={e => this.thaoTacNhanh = e} onChange={value => this.setState({ thaoTacNhanh: value })} /></div> */}
                        <div className='form-group col-md-4 d-flex align-items-end justify-content-end' style={{ padding: 0 }}>
                            {/* <FormCheckbox isSwitch style={{ marginRight: '20px' }} label={'Thao tác nhanh'} ref={e => this.thaoTacNhanh = e} onChange={value => this.setState({ thaoTacNhanh: value })} /> */}
                            <span><button disabled={this.state.isSubmitting} className='btn btn-success' onClick={e => e.preventDefault() || this.refresh()}>
                                <i className='fa fa-lg fa-refresh' />
                            </button></span>
                        </div>
                    </div>
                    {/* <div className='tile'>
                        <div className='row'> */}
                    {/* <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' onClick={e => e.preventDefault() || this.refresh()}>
                                    <i className='fa fa-lg fa-refresh' />
                                </button>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.applyAll()}>
                                    Cập nhật toàn bộ
                                </button>
                            </div> */}
                    {/* </div> */}
                    {/* </div> */}
                    {listHeDaoTao}
                    <div className='col-md-12 d-flex align-items-end justify-content-end' style={{ padding: '15px 0 0 0' }}>
                        <span><button disabled={this.state.isSubmitting} style={{ marginLeft: '10px' }} className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.applyAll()}>
                            Cập nhật
                        </button></span>
                        <span><button disabled={this.state.isSubmitting} style={{ marginLeft: '10px' }} className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.applyAll(true)}>
                            Cập nhật (ghi đè)
                        </button></span>
                        <span><button disabled={this.state.isSubmitting} style={{ marginLeft: '10px' }} className='btn btn-primary' type='button' onClick={e => e.preventDefault() || this.saveAll()}>
                            Lưu
                        </button></span>
                    </div>
                </div>}
            </div>
        );
    }

    apDungSinhVienTab = () => {
        return (
            <div className='tile row' style={{ margin: '0 0 30px 0' }}>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-12' data={SelectAdapter_FwStudent} ref={e => this.sinhVien = e} label='Sinh viên' />
                <div className='col-md-12' style={{ textAlign: 'right' }}>
                    <button className='btn btn-danger' style={{ marginRight: '20px' }} type='button' onClick={e => e.preventDefault() || this.rollBack()}>
                        Hoàn tác
                    </button>
                    <button className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.apDungPreview()}>
                        Áp dụng
                    </button>
                </div>
            </div>
        );
    }

    apDungNhomSinhVienTab = () => {
        return (
            <div className='tile row' style={{ margin: '0 0 30px 0' }}>
                <h5 className='tile-title col-md-12'>Áp dụng theo danh sách</h5>
                <FormSelect className='col-md-12' data={SelectAdapter_FwStudent} ref={e => this.listsinhVien = e} label='Sinh viên' />
            </div>
        );
    }

    render() {
        let listLoaiPhi = renderTable({
            emptyTable: 'Không có dữ liệu loại phí',
            getDataSource: () => this.state.listLoaiPhi || [], stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại phí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại phí tạm thu</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền (VNĐ)</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học phí</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenLoaiPhi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenTamThu} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                        content={<FormTextBox disabled={this.state.isSubmitting} ref={e => this[`soTien_${item.loaiPhi}`] = e} type='number' className='col-md-12' style={{ margin: 0, padding: 0 }} readOnly={!this.state.changeSoTien} />}
                    />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.isHocPhi ? <i className='fa fa-lg fa-check' /> : ''} />
                </tr>
            )
        });



        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Cấu hình đợt đóng',
            breadcrumb: [<Link key={0} to='/user/finance/dot-dong'>Đợt đóng</Link>, 'Cấu hình đợt đóng'],
            content: <>
                <div className='tile row' style={{ margin: '0 0 30px 0', paddingTop: '20px' }}>
                    <FormSelect className='col-md-6' data={SelectAdapter_TcDotDong} ref={e => this.dotDong = e} label='Đợt đóng' readOnly />
                    <div className='col-md-6' style={{ textAlign: 'right' }}>
                        <button className={'btn btn-warning'} type='button' onClick={e => e.preventDefault() || this.props.history.push('/user/finance/dinh-muc')}>Cập nhật định mức</button>
                    </div>
                    <div className='col-md-12'>
                        <h5 className='tile-title'>Danh sách loại phí</h5>
                        {listLoaiPhi}
                    </div>
                    <div className='col-md-12' style={{ textAlign: 'right', marginTop: '10px' }}>
                        <button className={!this.state.changeSoTien ? 'btn btn-success' : 'btn btn-primary'} type='button' onClick={e => e.preventDefault() || this.capNhatSoTien()}>
                            {this.state.changeSoTien && <i className='fa fa-fw fa-lg fa-save' />}
                            {!this.state.changeSoTien ? 'Cập nhật số tiền' : 'Lưu'}
                        </button>
                    </div>
                </div>

                <FormTabs tabs={[
                    { title: 'Theo bậc/hệ', component: this.apDungBacHeTab() },
                    { title: 'Theo sinh viên', component: this.apDungSinhVienTab() },
                    // { title: 'Theo nhóm sinh viên', component: <div></div> }
                ]} />

                <ApDungDotDongPreviewModal ref={e => this.previewModal = e} getPage={this.props.tcDotDong} apDung={this.props.apDungDotDong} />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcDotDong: state.finance.tcDotDong });
const mapActionsToProps = {
    getListLoaiPhi, capNhatSoTien, getAllHeDaoTao, getCauHinhDotDongBacHe, luuCauHinhDotDongBacHe, xoaCauHinhDotDongBacHe, apDungDotDongPreview, apDungDotDong, getInfoSinhVien, rollBackDotDong
};
export default connect(mapStateToProps, mapActionsToProps)(tcDotDongDetailPage);

