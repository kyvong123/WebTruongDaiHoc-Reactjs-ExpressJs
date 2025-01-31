import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaChuyenVienUser, createTccbDanhGiaChuyenVienUser, deleteTccbDanhGiaChuyenVienUser } from './redux/redux';
import { createTccbDanhGiaCaNhanDiemThuongUser, updateTccbDanhGiaCaNhanDiemThuongUser, deleteTccbDanhGiaCaNhanDiemThuongUser } from './redux/reduxDiemThuong';
import { getTccbKhungDanhGiaCanBoAll } from './redux/redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { EditDanhGiaModal, EditDiemThuongModal, EditNoiDungModal } from './listUserModal';
import { Tooltip } from '@mui/material';

const form = [
    {
        tieuChi: 'Điểm chuyên môn',
        diemLonNhat: 100
    },
    {
        tieuChi: 'Điểm thưởng',
        diemLonNhat: ''
    },
    {
        tieuChi: 'Điểm trừ',
        diemLonNhat: ''
    }
];

class FormChuyenVienDetails extends AdminPage {
    state = { item: '', nam: '' }

    componentDidMount() {
        T.ready('/user', () => {
            const route = T.routeMatcher('/user/info/danh-gia-chuyen-vien/:nam').parse(window.location.pathname);
            this.setState({ nam: route.nam }, () => {
                this.load();
            });
        });
    }

    load = (done) => {
        this.props.getTccbDanhGiaChuyenVienUser(this.state.nam, item => {
            this.props.getTccbKhungDanhGiaCanBoAll(this.state.nam, khungDanhGiaCanBo => {
                this.setState({ item, khungDanhGiaCanBo }, done);
            });
        });
    }

    indexToAlpha = (num) => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        return `${alphabet[num]})`;
    }

    createNoiDung = (item, done) => {
        this.props.createTccbDanhGiaChuyenVienUser(item, () => this.load(done));
    }

    deleteNoiDung = (item, isDotXuat) => {
        T.confirm('Xóa đăng ký', 'Bạn có chắc muốn xóa đăng ký này?', 'info', isConfirm => {
           isConfirm && this.props.deleteTccbDanhGiaChuyenVienUser(item.id, item.nam, isDotXuat, () => this.load());
        });
    }

    createDiemThuong = (item, done) => {
        this.props.createTccbDanhGiaCaNhanDiemThuongUser(item, () => this.load(done));
    }

    updateDiemThuong = (id, item, done) => {
        this.props.updateTccbDanhGiaCaNhanDiemThuongUser(id, item, () => this.load(done));
    }

    deleteDiemThuong = (id) => {
        T.confirm('Xóa điểm thưởng', 'Bạn có chắc muốn xóa điểm thưởng này?', 'info', isConfirm => {
            isConfirm && this.props.deleteTccbDanhGiaCaNhanDiemThuongUser(id, () => this.load());
        });
    }

    onDownloadMinhChung = (e, item) => {
        e.preventDefault();
        const extname = item.minhChung.substring(item.minhChung.lastIndexOf('.'));
        const tenFile = `${item.shcc} minh chứng ${item.tenKhenThuong}${extname}`;
        T.download(T.url('/api/tccb/danh-gia-ca-nhan-diem-thuong-minh-chung/' + item.id), tenFile);
    }

    render() {
        const user = this.props.system && this.props.system.user || {};
        const { item, nam, khungDanhGiaCanBo } = this.state;
        const list = item?.items || [];
        let finalTuDanhGia = 0, finalDonVi = 0;
        const danhGiaNamSetting = item?.danhGiaNam || {};
        const currentDate = new Date().getTime();
        const isDangKy = danhGiaNamSetting.nldBatDauDangKy && danhGiaNamSetting.nldKetThucDangKy && currentDate >= danhGiaNamSetting.nldBatDauDangKy && currentDate <= danhGiaNamSetting.nldKetThucDangKy;
        let isDangKyDotXuat = isDangKy;
        if (!isDangKyDotXuat && danhGiaNamSetting.caNhanBatDauTuDanhGia) {
            isDangKyDotXuat = currentDate < danhGiaNamSetting.caNhanBatDauTuDanhGia;
        }
        const isTuDanhGia = danhGiaNamSetting.caNhanBatDauTuDanhGia && danhGiaNamSetting.caNhanKetThucTuDanhGia && currentDate >= danhGiaNamSetting.caNhanBatDauTuDanhGia && currentDate <= danhGiaNamSetting.caNhanKetThucTuDanhGia;
        const isUpdateDiemThuong = !danhGiaNamSetting.donViBatDauDanhGia || currentDate < danhGiaNamSetting.donViBatDauDanhGia;
        const isHoiDongDanhGia = danhGiaNamSetting.donViBatDauDanhGia && currentDate >= danhGiaNamSetting.donViBatDauDanhGia;
        let percent = '';
        if (isTuDanhGia) {
            percent = isHoiDongDanhGia ? '15%' : '30%';
        } else {
            percent = isHoiDongDanhGia ? '20%' : '60%';
        }
        const updateList = form.map((item, index) => {
            if (index == 0) {
                const mucCon = list.filter(item => item.loaiCongViec == 0 || item.loaiCongViec == 1);
                finalTuDanhGia += Number(mucCon.reduce((prev, cur) => prev + Number(cur.totalTuDanhGia || 0), 0));
                finalDonVi += Number(mucCon.reduce((prev, cur) => prev + Number(cur.totalDonVi || 0), 0));
                return { ...item, mucCon };
            }
            if (index == 1) {
                const mucCon = list.filter(item => item.loaiCongViec == 2);
                const total = Number(mucCon.reduce((prev, cur) => prev + Number(cur.duyet ? (cur.diemQuyDinh || 0) : 0), 0)).toFixed(2);
                finalTuDanhGia += Number(total);
                finalDonVi += Number(total);
                return { ...item, mucCon, total };
            }
            if (index == 2) {
                const mucCon = list.filter(item => item.loaiCongViec == 3);
                const total = Number(mucCon.reduce((prev, cur) => prev + Number(cur.diemQuyDinh || 0), 0)).toFixed(2);
                finalTuDanhGia -= Number(total);
                finalDonVi -= Number(total);
                return { ...item, mucCon, total };
            }
        });
        let table = renderTable({
            emptyTable: 'Không có thông tin',
            getDataSource: () => updateList,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>TT</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Tiêu chí đánh giá</th>
                    <th style={{ width: percent, textAlign: 'center' }}>Điểm tối đa theo từng công việc</th>
                    {isTuDanhGia && <th style={{ width: percent, textAlign: 'center' }}>Điểm tự đánh giá của viên chức</th>}
                    {isHoiDongDanhGia && <th style={{ width: percent, textAlign: 'center' }}>Điểm của hội đồng đánh giá cấp đơn vị</th>}
                    {isHoiDongDanhGia && <th style={{ width: percent, textAlign: 'center' }}>Ý kiến của hội đồng đánh giá cấp đơn vị</th>}
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <React.Fragment key={index}>
                    <tr className='table-primary'>
                        <TableCell style={{ textAlign: 'center' }} content={<h5>{(index + 1).intToRoman()}</h5>} />
                        <TableCell content={<h5>{item.tieuChi}</h5>} />
                        <TableCell style={{ textAlign: 'right' }} content={<h5>{index == 0 && `${Number(item.diemLonNhat || 0).toFixed(2)} điểm`}</h5>} />
                        {isTuDanhGia && <TableCell />}
                        {isHoiDongDanhGia && <TableCell />}
                        {isHoiDongDanhGia && <TableCell />}
                        <TableCell type='buttons' style={{ textAlign: 'center' }}>
                            {index == 1 && isUpdateDiemThuong ? (
                                <Tooltip title='Thêm điểm thưởng' arrow>
                                    <button className='btn btn-success' onClick={() => this.modalDiemThuong.show({})}>
                                        <i className='fa fa-lg fa-plus' />
                                    </button>
                                </Tooltip>
                            ) : null}
                        </TableCell>
                    </tr>
                    {
                        item.mucCon.map((noiDung, sttNoiDung) => {
                            if (noiDung.loaiCongViec == 1) {
                                const hasDelete = isDangKy || (isDangKyDotXuat && noiDung.viecDotXuat);
                                const hasCreate = hasDelete;
                                const hasUpdate = hasDelete || isTuDanhGia;
                                return <React.Fragment key={`${index}-${sttNoiDung}`}>
                                    <tr className='table-active'>
                                        <TableCell style={{ textAlign: 'center' }} content={<b>{sttNoiDung + 1}</b>} />
                                        <TableCell content={<b>{noiDung.tieuDe}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${Number(noiDung.diemLonNhat || 0).toFixed(2)} điểm`}</b>} />
                                        {isTuDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        <TableCell type='buttons' style={{ textAlign: 'center' }}>
                                            {hasCreate ? (
                                                <Tooltip title='Thêm công việc' arrow>
                                                    <button className='btn btn-success' onClick={() => this.noiDungModal.show({ item: null, idFormChuyenVien: noiDung.id, loaiCongViec: 1, isDotXuat: noiDung.viecDotXuat })}>
                                                        <i className='fa fa-lg fa-plus' />
                                                    </button>
                                                </Tooltip>
                                            ) : null}
                                        </TableCell>
                                    </tr>
                                    {
                                        noiDung.submenus.map((menu, sttMenu) => {
                                            return <React.Fragment key={`${index}-${sttNoiDung}-${sttMenu}`}>
                                                <tr>
                                                    <TableCell style={{ textAlign: 'center' }} rowSpan={3} content={this.indexToAlpha(sttMenu)} />
                                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={<><i>{`Công việc ${sttMenu + 1}: ${menu.noiDung}`}</i><br />{menu.moTa}</>} />
                                                    <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemLonNhat || 0).toFixed(2)} điểm`} />
                                                    {isTuDanhGia && <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemTuDanhGia || 0).toFixed(2)} điểm`} />}
                                                    {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemDonVi || 0).toFixed(2)} điểm`} />}
                                                    {isHoiDongDanhGia && <TableCell style={{ whiteSpace: 'pre-wrap' }} content={menu.yKienDonVi} />}
                                                    <TableCell type='buttons' style={{ textAlign: 'center' }} rowSpan={3}>
                                                        {hasUpdate ? (
                                                            <Tooltip title='Chỉnh sửa nội dung' arrow>
                                                                <button className='btn btn-primary' onClick={() => this.noiDungModal.show({ item: menu, idFormChuyenVien: noiDung.id, loaiCongViec: 1, isDotXuat: noiDung.viecDotXuat })}>
                                                                    <i className='fa fa-lg fa-edit' />
                                                                </button>
                                                            </Tooltip>
                                                        ) : null}
                                                        {hasDelete ? (
                                                            <Tooltip title='Xóa đăng ký' arrow>
                                                                <button className='btn btn-danger' onClick={() => this.deleteNoiDung(menu, noiDung.viecDotXuat)}>
                                                                    <i className='fa fa-lg fa-trash' />
                                                                </button>
                                                            </Tooltip>
                                                        ) : null}
                                                    </TableCell>
                                                </tr>
                                                <tr>
                                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={`Thời hạn hoàn thành công việc ${sttMenu + 1}`} />
                                                    <TableCell style={{ textAlign: 'left' }} content={menu.thoiHan ? `${T.dateToText(menu.thoiHan, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                                                    {isTuDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                                    {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                                    {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                                </tr>
                                                <tr>
                                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={`Chất lượng hoàn thành công việc ${sttMenu + 1}`} />
                                                    <TableCell content={menu.chatLuong} />
                                                    {isTuDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                                    {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                                    {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                                </tr>
                                            </React.Fragment>;
                                        })
                                    }
                                    <tr>
                                        <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>{`Tổng điểm nội dung ${sttNoiDung + 1}`}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.total} điểm`}</b>} />
                                        {isTuDanhGia && <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.totalTuDanhGia} điểm`}</b>} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.totalDonVi} điểm`}</b>} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        <TableCell style={{ textAlign: 'center' }} />
                                    </tr>
                                </React.Fragment>;
                            }
                            if (noiDung.loaiCongViec == 0) {
                                return <React.Fragment key={`${index}-${sttNoiDung}`}>
                                    <tr className='table-active'>
                                        <TableCell style={{ textAlign: 'center' }} content={<b>{sttNoiDung + 1}</b>} />
                                        <TableCell content={<b>{noiDung.tieuDe}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${Number(noiDung.diemLonNhat || 0).toFixed(2)} điểm`}</b>} />
                                        {isTuDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        <TableCell style={{ textAlign: 'center' }} />
                                    </tr>
                                    {
                                        noiDung.submenus?.map((menu, sttMenu) => (
                                            <tr key={`${index}-${sttNoiDung}-${sttMenu}`}>
                                                <TableCell style={{ textAlign: 'center' }} content={this.indexToAlpha(sttMenu)} />
                                                <TableCell content={menu.tieuDe} />
                                                <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemLonNhat || 0).toFixed(2)} điểm`} />
                                                {isTuDanhGia && <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemTuDanhGia || 0).toFixed(2)} điểm`} />}
                                                {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemDonVi || 0).toFixed(2)} điểm`} />}
                                                {isHoiDongDanhGia && <TableCell style={{ whiteSpace: 'pre-wrap' }} content={menu.yKienDonVi} />}
                                                <TableCell type='buttons' style={{ textAlign: 'center' }}>
                                                    {isTuDanhGia ? (
                                                        <Tooltip title='Đánh giá' arrow>
                                                            <button className='btn btn-primary' onClick={() => this.danhGiaModal.show({ ...menu, loaiCongViec: 0 })}>
                                                                <i className='fa fa-lg fa-edit' />
                                                            </button>
                                                        </Tooltip>
                                                    ) : null}
                                                </TableCell>
                                            </tr>
                                        ))
                                    }
                                    <tr>
                                        <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>{`Tổng điểm nội dung ${sttNoiDung + 1}`}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.total} điểm`}</b>} />
                                        {isTuDanhGia && <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.totalTuDanhGia} điểm`}</b>} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.totalDonVi} điểm`}</b>} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        <TableCell style={{ textAlign: 'center' }} />
                                    </tr>
                                </React.Fragment>;
                            }
                            if (noiDung.loaiCongViec == 2) {
                                return <tr key={`${index}-${sttNoiDung}`}>
                                    <TableCell style={{ textAlign: 'center' }} content={this.indexToAlpha(sttNoiDung)} />
                                    <TableCell content={<>{noiDung.tenKhenThuong}{noiDung.tuDangKy ? <><br />{noiDung.minhChung ? <span className='text-success'>Đã có minh chứng</span> : <span className='text-danger'>Chưa có minh chứng</span>}</> : null}</>} />
                                    <TableCell style={{ textAlign: 'right' }} content={<span className={noiDung.duyet == 0 ? 'text-danger' : ''}>{Number(noiDung.diemQuyDinh || 0).toFixed(2)} điểm{noiDung.duyet == 0 ? <><br />Chưa được duyệt</> : null}</span>} />
                                    {isTuDanhGia && <TableCell style={{ textAlign: 'right' }} />}
                                    {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} />}
                                    {isHoiDongDanhGia && <TableCell style={{ whiteSpace: 'pre-wrap' }} />}
                                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                                        {noiDung.minhChung && noiDung.tuDangKy ? (
                                            <Tooltip title='Tải về minh chứng' arrow>
                                                <button className='btn btn-info' onClick={e => this.onDownloadMinhChung(e, noiDung)}>
                                                    <i className='fa fa-download' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                        {isUpdateDiemThuong && noiDung.duyet == 0 ? (
                                            <Tooltip title='Cập nhật điểm thưởng' arrow>
                                                <button className='btn btn-primary' onClick={() => this.modalDiemThuong.show(noiDung)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                        {isUpdateDiemThuong && noiDung.tuDangKy && noiDung.duyet == 0 ? (
                                            <Tooltip title='Xóa điểm thưởng' arrow>
                                                <button className='btn btn-danger' onClick={() => this.deleteDiemThuong(noiDung.id)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                    </TableCell>
                                </tr>;
                            }
                            if (noiDung.loaiCongViec == 3) {
                                return <tr key={`${index}-${sttNoiDung}`}>
                                    <TableCell style={{ textAlign: 'center' }} content={this.indexToAlpha(sttNoiDung)} />
                                    <TableCell content={noiDung.tenKyLuat} />
                                    <TableCell style={{ textAlign: 'right' }} content={`${Number(noiDung.diemQuyDinh || 0).toFixed(2)} điểm`} />
                                    {isTuDanhGia && <TableCell style={{ textAlign: 'right' }} />}
                                    {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} />}
                                    {isHoiDongDanhGia && <TableCell style={{ whiteSpace: 'pre-wrap' }} />}
                                    <TableCell type='buttons' style={{ textAlign: 'center' }} />
                                </tr>;
                            }
                        })
                    }
                    {
                        (index == 1 || index == 2) && (
                            <tr>
                                <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>{`Tổng ${form[index].tieuChi}`}</b>} />
                                <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.total} điểm`}</b>} />
                                <TableCell style={{ textAlign: 'right' }} />
                                {isTuDanhGia && <TableCell style={{ textAlign: 'right' }} />}
                                {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            </tr>
                        )
                    }
                </React.Fragment>

            )
        });

        const indexTuDanhGia = khungDanhGiaCanBo?.findIndex(item => item.tu <= finalTuDanhGia && finalTuDanhGia <= item.den);
        const indexDonVi = khungDanhGiaCanBo?.findIndex(item => item.tu <= finalDonVi && finalDonVi <= item.den);

        const listKetQua = [
            {
                tieuDe: 'Tổng điểm đạt được:',
                tuDanhGia: `${finalTuDanhGia.toFixed(2)} điểm`,
                donVi: `${finalDonVi.toFixed(2)} điểm`
            },
            {
                tieuDe: 'Kết luận về mức độ hoàn thành công việc:',
                tuDanhGia: indexTuDanhGia != undefined && indexTuDanhGia != -1 ? khungDanhGiaCanBo[indexTuDanhGia].mucDanhGia : '',
                donVi: indexDonVi != undefined && indexDonVi != -1 ? khungDanhGiaCanBo[indexDonVi].mucDanhGia : ''
            },
            {
                tieuDe: 'Kết quả xếp loại:',
                tuDanhGia: indexTuDanhGia != undefined && indexTuDanhGia != -1 ? `Loại ${khungDanhGiaCanBo[indexTuDanhGia].mucXepLoai}` : '',
                donVi: indexDonVi != undefined && indexDonVi != -1 ? `Loại ${khungDanhGiaCanBo[indexDonVi].mucXepLoai}` : ''
            }
        ];
        let tableKetQua = renderTable({
            emptyTable: 'Không có dữ liệu',
            getDataSource: () => listKetQua,
            renderHead: () => (
                <tr>
                    <th style={{ width: '100%', textAlign: 'center', verticalAlign: 'middle' }}>Kết quả</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Cá nhân tự đánh giá</th>
                    {isHoiDongDanhGia && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hội đồng đánh giá</th>}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tieuDe} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tuDanhGia} />
                    {isHoiDongDanhGia && <TableCell style={{ whiteSpace: 'nowrap' }} content={item.donVi} />}
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: `Thông tin đánh giá: ${user.lastName + ' ' + user.firstName} (${user.shcc})`,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/info/danh-gia-ca-nhan'>Đánh giá cá nhân</Link>,
                `Thông tin đánh giá năm ${nam}`
            ],
            content: <>
                <div className='tile'>{table}</div>
                {isTuDanhGia || isHoiDongDanhGia ? <div className='tile'>{tableKetQua}</div> : null}
                <EditNoiDungModal ref={e => this.noiDungModal = e} create={this.createNoiDung} isDangKy={isDangKy} isDangKyDotXuat={isDangKyDotXuat} isTuDanhGia={isTuDanhGia} nam={nam} />
                <EditDanhGiaModal ref={e => this.danhGiaModal = e} create={this.createNoiDung} nam={nam} />
                <EditDiemThuongModal ref={e => this.modalDiemThuong = e} create={this.createDiemThuong} update={this.updateDiemThuong} nam={nam} load={this.load} />
            </>,
            backRoute: '/user/info/danh-gia-ca-nhan'
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDanhGiaChuyenVienUser, createTccbDanhGiaChuyenVienUser, deleteTccbDanhGiaChuyenVienUser, updateTccbDanhGiaCaNhanDiemThuongUser, getTccbKhungDanhGiaCanBoAll, createTccbDanhGiaCaNhanDiemThuongUser, deleteTccbDanhGiaCaNhanDiemThuongUser };
export default connect(mapStateToProps, mapActionsToProps)(FormChuyenVienDetails);