import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaChuyenVien, createDanhGiaGiangDayByUnit, deleteDanhGiaChuyenVienByUnit, getTccbKhungDanhGiaCanBoAll } from './redux/redux';
import { createTccbDanhGiaCaNhanDiemThuong, updateTccbDanhGiaCaNhanDiemThuong, deleteTccbDanhGiaCaNhanDiemThuong } from './redux/reduxDiemThuong';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { EditDiemThuongModal, EditNoiDungModal } from './listGiangDayModal';
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
    state = { danhGiaNam: {}, diemThuong: [], diemTru: [], nhiemVuKhac: [], nam: '', shcc: '' }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia-giang-day/:nam/:shcc');
            const nam = parseInt(route.parse(window.location.pathname)?.nam);
            const shcc = route.parse(window.location.pathname)?.shcc;
            this.setState({ nam, shcc }, () => this.load());
        });
    }

    load = (done) => {
        this.props.getTccbDanhGiaChuyenVien(this.state.shcc, this.state.nam, item => {
            const { danhGiaNam, diemThuong, diemTru, nhiemVuKhac, canBo } = item;
            this.props.getTccbKhungDanhGiaCanBoAll(this.state.nam, khungDanhGiaCanBo => {
                this.setState({ danhGiaNam, diemThuong, diemTru, nhiemVuKhac, canBo, khungDanhGiaCanBo }, () => done && done());
            });
        });
    }

    indexToAlpha = (num) => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        return `${alphabet[num]})`;
    }

    createNoiDung = (item, done) => {
        this.props.createDanhGiaGiangDayByUnit(item, () => this.load(done));
    }

    createDiemThuong = (item, done) => {
        this.props.createTccbDanhGiaCaNhanDiemThuong(item, () => this.load(done));
    }

    updateDiemThuong = (id, item, done) => {
        this.props.updateTccbDanhGiaCaNhanDiemThuong(id, item, () => this.load(done));
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
        let { danhGiaNam, diemThuong, diemTru, nhiemVuKhac, canBo, nam, shcc, khungDanhGiaCanBo } = this.state;
        let finalTuDanhGia = 0, finalDonVi = 0;
        danhGiaNam = danhGiaNam || {};
        const { ho, ten } = canBo || { ho: '', ten: '' };
        const currentDate = new Date().getTime();
        const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate <= danhGiaNam.donViBatDauDanhGia;
        const isUpdateDiemThuong = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
        const isHoiDongDanhGia = danhGiaNam.donViBatDauDanhGia && currentDate >= danhGiaNam.donViBatDauDanhGia;
        let percent = isHoiDongDanhGia ? '15%' : '30%';
        const updateList = form.map((item, index) => {
            if (index == 0) {
                // Đào tạo, đào tạo sau đại học
                let totalKhac = 0;
                let totalTuDanhGiaKhac = 0;
                let totalDonViKhac = 0;
                nhiemVuKhac.forEach(item => {
                    totalKhac += Number(item.diemLonNhat || 0);
                    totalTuDanhGiaKhac += Number(item.diemTuDanhGia || 0);
                    totalDonViKhac += Number(item.diemDonVi || 0);
                });
                finalTuDanhGia += totalTuDanhGiaKhac;
                finalDonVi += totalDonViKhac;
                totalKhac = totalKhac.toFixed(2);
                totalTuDanhGiaKhac = totalTuDanhGiaKhac.toFixed(2);
                totalDonViKhac = totalDonViKhac.toFixed(2);
                return { ...item, totalKhac, totalTuDanhGiaKhac, totalDonViKhac, nhiemVuKhac };
            }
            if (index == 1) {
                const total = Number(diemThuong.reduce((prev, cur) => prev + Number(cur.duyet ? (cur.diemQuyDinh || 0) : 0), 0)).toFixed(2);
                finalTuDanhGia += Number(total);
                finalDonVi += Number(total);
                return { ...item, diemThuong, total };
            }
            if (index == 2) {
                const total = Number(diemTru.reduce((prev, cur) => prev + Number(cur.diemQuyDinh || 0), 0)).toFixed(2);
                finalTuDanhGia -= Number(total);
                finalDonVi -= Number(total);
                return { ...item, diemTru, total };
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
            renderRow: (item, index) => {
                let content = null;
                if (index == 0) {
                    content = <>
                        {/* Nhiệm vụ 1: giảng dạy */}
                        <tr className='table-active'>
                            <TableCell style={{ textAlign: 'center' }} content={<b>1</b>} />
                            <TableCell content={<b>Nhiệm vụ giảng dạy</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
                        </tr>
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} content='a)' />
                            <TableCell content='Đào tạo' />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
                        </tr>
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} content='b)' />
                            <TableCell content='Đào tạo sau đại học' />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
                        </tr>
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>Tổng điểm nội dung 1</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            <TableCell style={{ textAlign: 'center' }} />
                        </tr>

                        {/* Nhiệm vụ 2: Nghiên cứu khoa học */}
                        <tr className='table-active'>
                            <TableCell style={{ textAlign: 'center' }} content={<b>2</b>} />
                            <TableCell content={<b>Nhiệm vụ nghiên cứu khoa học</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
                        </tr>
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>Tổng điểm nội dung 2</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            <TableCell style={{ textAlign: 'center' }} />
                        </tr>

                        {/* Nhiệm vụ 3: nhiệm vụ khác */}
                        <tr className='table-active'>
                            <TableCell style={{ textAlign: 'center' }} content={<b>3</b>} />
                            <TableCell content={<b>Nhiệm vụ khác</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            <TableCell type='buttons' style={{ textAlign: 'center' }}>
                                {isUpdate ? (
                                    <Tooltip title='Thêm công việc' arrow>
                                        <button className='btn btn-success' onClick={() => this.noiDungModal.show({ item: null })}>
                                            <i className='fa fa-lg fa-plus' />
                                        </button>
                                    </Tooltip>
                                ) : null}
                            </TableCell>
                        </tr>

                        {item.nhiemVuKhac.map((menu, sttMenu) => {
                            return <React.Fragment key={`${index}-${sttMenu}`}>
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
                                                <button className='btn btn-primary' onClick={() => this.noiDungModal.show({ item: menu })}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                        {isUpdate ? (
                                            <Tooltip title='Xóa đăng ký' arrow>
                                                <button className='btn btn-danger' onClick={(e) => this.deleteNoiDung(e, menu)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                    </TableCell>
                                </tr>
                                <tr>
                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={`Thời hạn hoàn thành công việc ${sttMenu + 1}`} />
                                    <TableCell style={{ textAlign: 'left' }} content={menu.thoiHan ? `${T.dateToText(menu.thoiHan, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
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
                            </React.Fragment>;
                        })}

                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>Tổng điểm nội dung 3</b>} />
                            <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.totalKhac} điểm`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.totalTuDanhGiaKhac} điểm`}</b>} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.totalDonViKhac} điểm`}</b>} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            <TableCell style={{ textAlign: 'center' }} />
                        </tr>
                    </>;
                }
                if (index == 1) {
                    content = <>
                        {item.diemThuong.map((noiDung, sttNoiDung) => {
                            return (
                                <tr key={`${index}-${sttNoiDung}`}>
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
                                        {isUpdateDiemThuong && noiDung.duyet == 0 ? (
                                            <Tooltip title='Cập nhật điểm thưởng' arrow>
                                                <button className='btn btn-primary' onClick={() => this.modalDiemThuong.show(noiDung)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                        {isUpdateDiemThuong && noiDung.tuDangKy && noiDung.duyet == 0 ? (
                                            <Tooltip title='Xóa điểm thưởng' arrow>
                                                <button className='btn btn-danger' onClick={() => this.deleteDiemThuong(noiDung)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                    </TableCell>
                                </tr>
                            );
                        })}
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>{`Tổng ${form[index].tieuChi}`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.total} điểm`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                        </tr>
                    </>;
                }
                if (index == 2) {
                    content = <>
                        {item.diemTru.map((noiDung, sttNoiDung) => {
                            return (
                                <tr key={`${index}-${sttNoiDung}`}>
                                    <TableCell style={{ textAlign: 'center' }} content={this.indexToAlpha(sttNoiDung)} />
                                    <TableCell content={noiDung.tenKyLuat} />
                                    <TableCell style={{ textAlign: 'right' }} content={`${Number(noiDung.diemQuyDinh || 0).toFixed(2)} điểm`} />
                                    <TableCell style={{ textAlign: 'right' }} />
                                    {isHoiDongDanhGia && <TableCell style={{ textAlign: 'right' }} />}
                                    {isHoiDongDanhGia && <TableCell style={{ whiteSpace: 'pre-wrap' }} />}
                                    <TableCell type='buttons' style={{ textAlign: 'center' }} />
                                </tr>
                            );
                        })}
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>{`Tổng ${form[index].tieuChi}`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.total} điểm`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                            {isHoiDongDanhGia && <TableCell style={{ textAlign: 'center' }} />}
                        </tr>
                    </>;
                }
                return (
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
                        {content}
                    </React.Fragment>
                );
            }
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
                <EditNoiDungModal ref={e => this.noiDungModal = e} nam={nam} shcc={shcc} create={this.createNoiDung} />
                <EditDiemThuongModal ref={e => this.modalDiemThuong = e} nam={nam} shcc={shcc} create={this.createDiemThuong} update={this.updateDiemThuong} load={this.load} />
            </>,
            backRoute: `/user/tccb/danh-gia-ca-nhan-form/${nam}`
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDanhGiaChuyenVien, createDanhGiaGiangDayByUnit, deleteDanhGiaChuyenVienByUnit, createTccbDanhGiaCaNhanDiemThuong, getTccbKhungDanhGiaCanBoAll, updateTccbDanhGiaCaNhanDiemThuong, deleteTccbDanhGiaCaNhanDiemThuong };
export default connect(mapStateToProps, mapActionsToProps)(FormChuyenVienDetails);