import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaChuyenVien, createDanhGiaChuyenVienByUnit, updateDanhGiaChuyenVienByUnit, deleteDanhGiaChuyenVienByUnit, getTccbKhungDanhGiaCanBoAll } from './redux/redux';
import { createTccbDanhGiaCaNhanDiemThuong, updateTccbDanhGiaCaNhanDiemThuong, deleteTccbDanhGiaCaNhanDiemThuong } from './redux/reduxDiemThuong';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { EditDiemThuongModal, EditNoiDungModal } from './listModal';
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
    state = { item: '', nam: '', shcc: '' }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia-chuyen-vien/:nam/:shcc');
            const nam = parseInt(route.parse(window.location.pathname)?.nam);
            const shcc = route.parse(window.location.pathname)?.shcc;
            this.setState({ nam, shcc }, () => this.load());
        });
    }

    load = (done) => {
        this.props.getTccbDanhGiaChuyenVien(this.state.shcc, this.state.nam, item => {
            this.props.getTccbKhungDanhGiaCanBoAll(this.state.nam, khungDanhGiaCanBo => {
                this.setState({ item, khungDanhGiaCanBo }, () => done && done());
            });
        });
    }

    indexToAlpha = (num) => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        return `${alphabet[num]})`;
    }

    createNoiDung = (item, done) => {
        this.props.createDanhGiaChuyenVienByUnit(item, () => this.load(done));
    }

    createDiemThuong = (item, done) => {
        this.props.createTccbDanhGiaCaNhanDiemThuong(item, () => this.load(done));
    }

    updateDiemThuong = (id, item, done) => {
        this.props.updateTccbDanhGiaCaNhanDiemThuong(id, item, () => this.load(done));
    }

    updateNoiDung = (id, changes, done) => {
        this.props.updateDanhGiaChuyenVienByUnit(id, changes, () => this.load(done));
    }

    deleteNoiDung = (e, item) => {
        e.preventDefault();
        if (item.id) {
            T.confirm('Xóa nội dung', 'Bạn có chắc muốn xóa nội dung này?', true, isConfirm =>
                isConfirm && this.props.deleteDanhGiaChuyenVienByUnit(item.id, () => this.load()));
        }
    }

    deleteDiemThuong = (e, item) => {
        e.preventDefault();
        if (item.id) {
            T.confirm('Xóa điểm thưởng', 'Bạn có chắc muốn xóa điểm thưởng này?', true, isConfirm =>
                isConfirm && this.props.deleteTccbDanhGiaCaNhanDiemThuong(item.id, this.load));
        }
    }

    onDownloadMinhChung = (e, item) => {
        e.preventDefault();
        const extname = item.minhChung.substring(item.minhChung.lastIndexOf('.'));
        const tenFile = `${item.shcc} minh chứng ${item.tenKhenThuong}${extname}`;
        T.download(T.url('/api/tccb/danh-gia-ca-nhan-diem-thuong-minh-chung/' + item.id), tenFile);
    }

    render() {
        const { item, nam, shcc, khungDanhGiaCanBo } = this.state;
        const list = item?.items || [];
        const { ho, ten } = item?.canBo || { ho: '', ten: '' };
        let finalTuDanhGia = 0, finalDonVi = 0;
        const danhGiaNamSetting = item?.danhGiaNam || {};
        const currentDate = new Date().getTime();
        const isUpdate = !danhGiaNamSetting.donViBatDauDanhGia || currentDate <= danhGiaNamSetting.donViBatDauDanhGia;
        const isUpdateDiemThuong = !danhGiaNamSetting.donViBatDauDanhGia || currentDate < danhGiaNamSetting.donViBatDauDanhGia;
        const isHoiDongDanhGia = danhGiaNamSetting.donViBatDauDanhGia && currentDate >= danhGiaNamSetting.donViBatDauDanhGia;
        let percent = isHoiDongDanhGia ? '15%' : '30%';
        const updateList = form.map((item, index) => {
            if (index == 0) {
                const mucCon = list.filter(item => item.loaiCongViec == 0 || item.loaiCongViec == 1);
                finalTuDanhGia += Number(mucCon.reduce((prev, cur) => prev + Number(cur.totalTuDanhGia || 0), 0)),
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
                    <th style={{ width: percent, textAlign: 'center' }}>Điểm tự đánh giá của viên chức</th>
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
                        <TableCell style={{ textAlign: 'center' }} />
                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                        <TableCell type='buttons' style={{ textAlign: 'center' }}>
                            {index == 1 && isUpdateDiemThuong ? (
                                <Tooltip title='Thêm điểm thưởng' arrow>
                                    <button className='btn btn-success' onClick={() => this.modalDiemThuong.show(null)}>
                                        <i className='fa fa-lg fa-plus' />
                                    </button>
                                </Tooltip>
                            ) : null}
                        </TableCell>
                    </tr>
                    {
                        item.mucCon.map((noiDung, sttNoiDung) => {
                            if (noiDung.loaiCongViec == 1) {
                                return <React.Fragment key={`${index}-${sttNoiDung}`}>
                                    <tr className='table-secondary'>
                                        <TableCell style={{ textAlign: 'center' }} content={<b>{sttNoiDung + 1}</b>} />
                                        <TableCell content={<b>{noiDung.tieuDe}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${Number(noiDung.diemLonNhat || 0).toFixed(2)} điểm`}</b>} />
                                        <TableCell style={{ textAlign: 'center' }} />
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        <TableCell type='buttons' style={{ textAlign: 'center' }}>
                                            {isUpdate ? (
                                                <Tooltip title='Thêm nội dung' arrow>
                                                    <button className='btn btn-success' onClick={() => this.noiDungModal.show({ idFormChuyenVien: noiDung.id, item: null })}>
                                                        <i className='fa fa-lg fa-plus' />
                                                    </button>
                                                </Tooltip>
                                            ) : null}
                                        </TableCell>
                                    </tr>
                                    {noiDung.submenus.map((menu, sttMenu) => (
                                        <React.Fragment key={`${index}-${sttNoiDung}-${sttMenu}`}>
                                            <tr>
                                                <TableCell style={{ textAlign: 'center' }} rowSpan={3} content={this.indexToAlpha(sttMenu)} />
                                                <TableCell style={{ whiteSpace: 'pre-wrap' }} content={<><i>{`Công việc ${sttMenu + 1}: ${menu.noiDung}`}</i><br />{menu.moTa}</>} />
                                                <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemLonNhat || 0).toFixed(2)} điểm`} />
                                                <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemTuDanhGia || 0).toFixed(2)} điểm`} />
                                                {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemDonVi || 0).toFixed(2)} điểm`} />}
                                                {isHoiDongDanhGia && <TableCell style={{ whiteSpace: 'pre-wrap' }} content={menu.yKienDonVi} />}
                                                <TableCell type='buttons' style={{ textAlign: 'center' }} rowSpan={3}>
                                                    {isUpdate ? (
                                                        <Tooltip title='Chỉnh sửa nội dung' arrow>
                                                            <button className='btn btn-primary' onClick={() => this.noiDungModal.show({ item: menu, idFormChuyenVien: noiDung.id })}>
                                                                <i className='fa fa-lg fa-edit' />
                                                            </button>
                                                        </Tooltip>
                                                    ) : null}
                                                    {isUpdate ? (
                                                        <Tooltip title='Xoá nội dung' arrow>
                                                            <button className='btn btn-danger' onClick={e => this.deleteNoiDung(e, menu)}>
                                                                <i className='fa fa-lg fa-trash' />
                                                            </button>
                                                        </Tooltip>
                                                    ) : null}
                                                </TableCell>
                                            </tr>
                                            <tr>
                                                <TableCell style={{ whiteSpace: 'pre-wrap' }} content={`Thời hạn hoàn thành công việc ${sttMenu + 1}`} />
                                                <TableCell style={{ textAlign: 'center' }} content={menu.thoiHan ? `${T.dateToText(menu.thoiHan, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                                                <TableCell style={{ textAlign: 'center' }} />
                                                {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                                {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                            </tr>
                                            <tr>
                                                <TableCell style={{ whiteSpace: 'pre-wrap' }} content={`Chất lượng hoàn thành công việc ${sttMenu + 1}`} />
                                                <TableCell content={menu.chatLuong} />
                                                <TableCell style={{ textAlign: 'center' }} />
                                                {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                                {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                    <tr>
                                        <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>{`Tổng điểm nội dung ${sttNoiDung + 1}`}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.total} điểm`}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.totalTuDanhGia} điểm`}</b>} />
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.totalDonVi} điểm`}</b>} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        <TableCell style={{ textAlign: 'center' }} />
                                    </tr>
                                </React.Fragment>;
                            }
                            if (noiDung.loaiCongViec == 0) {
                                return <React.Fragment key={`${index}-${sttNoiDung}`}>
                                    <tr>
                                        <TableCell style={{ textAlign: 'center' }} content={<b>{sttNoiDung + 1}</b>} />
                                        <TableCell content={<b>{noiDung.tieuDe}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${Number(noiDung.diemLonNhat || 0).toFixed(2)} điểm`}</b>} />
                                        <TableCell style={{ textAlign: 'center' }} />
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                                        <TableCell style={{ textAlign: 'center' }} />
                                    </tr>
                                    {noiDung.submenus?.map((menu, sttMenu) => (
                                        <tr key={`${index}-${sttNoiDung}-${sttMenu}`}>
                                            <TableCell style={{ textAlign: 'center' }} content={this.indexToAlpha(sttMenu)} />
                                            <TableCell content={menu.tieuDe} />
                                            <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemLonNhat || 0).toFixed(2)} điểm`} />
                                            <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemTuDanhGia || 0).toFixed(2)} điểm`} />
                                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemDonVi || 0).toFixed(2)} điểm`} />}
                                            {isHoiDongDanhGia && <TableCell style={{ whiteSpace: 'pre-wrap' }} content={menu.yKienDonVi} />}
                                            <TableCell type='buttons' style={{ textAlign: 'right' }} />
                                        </tr>
                                    ))}
                                    <tr>
                                        <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>{`Tổng điểm nội dung ${sttNoiDung + 1}`}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.total} điểm`}</b>} />
                                        <TableCell style={{ textAlign: 'right' }} content={<b>{`${noiDung.totalTuDanhGia} điểm`}</b>} />
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
                                    <TableCell style={{ textAlign: 'right' }} />
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
                                        {isUpdateDiemThuong && noiDung.tuDangKy ? (
                                            <Tooltip title='Cập nhật điểm thưởng' arrow>
                                                <button className='btn btn-primary' onClick={() => this.modalDiemThuong.show(noiDung)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                        {isUpdateDiemThuong && noiDung.tuDangKy ? (
                                            <Tooltip title='Xoá điểm thưởng' arrow>
                                                <button className='btn btn-danger' onClick={e => this.deleteDiemThuong(e, noiDung)}>
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
                                    <TableCell style={{ textAlign: 'right' }} />
                                    {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} />}
                                    {isHoiDongDanhGia && <TableCell style={{ whiteSpace: 'pre-wrap' }} />}
                                    <TableCell type='buttons' />
                                </tr>;
                            }
                        })
                    }
                    {(index == 1 || index == 2) && (
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>{`Tổng ${form[index].tieuChi}`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.total} điểm`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                        </tr>
                    )}
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
            title: `Thông tin đánh giá: ${ho + ' ' + ten} (${shcc})`,
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/danh-gia-ca-nhan-form'>Đơn vị đánh giá cá nhân</Link>,
                <Link key={2} to={`/user/tccb/danh-gia-ca-nhan-form/${nam}`}>Danh sách cán bộ</Link>,
                `Thông tin đánh giá năm ${nam}`
            ],
            content: <>
                <div className='tile'>{table}</div>
                <div className='tile'>{tableKetQua}</div>
                <EditNoiDungModal ref={e => this.noiDungModal = e} nam={nam} shcc={shcc} create={this.createNoiDung} update={this.updateNoiDung} />
                <EditDiemThuongModal ref={e => this.modalDiemThuong = e} nam={nam} shcc={shcc} create={this.createDiemThuong} update={this.updateDiemThuong} load={this.load} />
            </>,
            backRoute: `/user/tccb/danh-gia-ca-nhan-form/${nam}`
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDanhGiaChuyenVien, createDanhGiaChuyenVienByUnit, updateDanhGiaChuyenVienByUnit, deleteDanhGiaChuyenVienByUnit, createTccbDanhGiaCaNhanDiemThuong, getTccbKhungDanhGiaCanBoAll, updateTccbDanhGiaCaNhanDiemThuong, deleteTccbDanhGiaCaNhanDiemThuong };
export default connect(mapStateToProps, mapActionsToProps)(FormChuyenVienDetails);