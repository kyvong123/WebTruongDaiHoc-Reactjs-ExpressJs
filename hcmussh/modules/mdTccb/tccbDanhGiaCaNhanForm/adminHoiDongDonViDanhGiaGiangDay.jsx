import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaChuyenVien, getTccbKhungDanhGiaCanBoAll, tccbHoiDongDanhGiaChuyenVien, tccbHoiDongDanhGiaDuyetDiemThuong } from './redux/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
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

class DanhGiaModal extends AdminModal {
    state = { item: null };

    componentDidMount() {
        this.onShown(() => this.diemDonVi.focus());
    }

    onShow = item => {
        this.setState({ item }, () => {
            this.noiDung.value(item.noiDung || '');
            this.moTa.value(item.moTa || '');
            this.diemLonNhat.value(item.diemLonNhat ? Number(item.diemLonNhat).toFixed(2) : '');
            this.diemTuDanhGia.value(item.diemTuDanhGia ? Number(item.diemTuDanhGia).toFixed(2) : '');
            this.diemDonVi.value(item.diemDonVi ? Number(item.diemDonVi).toFixed(2) : '');
            this.yKienDonVi.value(item.yKienDonVi || '');
        });
    }

    onSubmit = () => {
        const changes = {
            diemDonVi: this.diemDonVi.value() ? Number(this.diemDonVi.value()) : '',
            yKienDonVi: this.yKienDonVi.value(),
            loaiCongViec: 1
        };
        if (this.state.item) {
            this.props.danhGia(this.state.item.id, changes, () => this.hide());
        } else {
            this.hide();
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Cập nhật đánh giá',
            body: <>
                <FormTextBox ref={e => this.noiDung = e} label='Nội dung' readOnly />
                <FormRichTextBox ref={e => this.moTa = e} style={{ whiteSpace: 'break-spaces' }} readOnly />
                <FormTextBox ref={e => this.diemLonNhat = e} label='Điểm tối đa' readOnly />
                <FormTextBox ref={e => this.diemTuDanhGia = e} label='Điểm tự đánh giá của chuyên viên' readOnly />
                <FormTextBox ref={e => this.diemDonVi = e} label='Điểm đánh giá' />
                <FormRichTextBox ref={e => this.yKienDonVi = e} label='Ý kiến' rows={5} />
            </>
        });
    }
}

class DanhGiaFitModal extends AdminModal {
    state = { item: {} };

    componentDidMount() {
        this.onShown(() => this.diemDonVi.focus());
    }

    onShow = item => {
        this.setState({ item }, () => {
            const { tieuDe, diemLonNhat, diemTuDanhGia, diemDonVi, yKienDonVi } = item;
            this.tieuDe.value(tieuDe || '');
            this.diemLonNhat.value(diemLonNhat ? Number(diemLonNhat).toFixed(2) : '');
            this.diemTuDanhGia.value(diemTuDanhGia ? Number(diemTuDanhGia).toFixed(2) : '');
            this.diemDonVi.value(diemDonVi ? Number(diemDonVi).toFixed(2) : '');
            this.yKienDonVi.value(yKienDonVi || '');
        });
    }

    onSubmit = () => {
        const { shcc, nam } = this.props;
        const { id, idFormChuyenVien } = this.state.item;
        const diemDonVi = this.diemDonVi.value() ? Number(this.diemDonVi.value()).toFixed(2) : '';
        const yKienDonVi = this.yKienDonVi.value();
        if (id) {
            this.props.danhGia(id, { diemDonVi, yKienDonVi, loaiCongViec: 0, idFormChuyenVien, shcc, nam }, () => this.hide());
        } else {
            this.props.danhGia(null, { diemDonVi, yKienDonVi, loaiCongViec: 0, idFormChuyenVien, shcc, nam }, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Cập nhật đánh giá',
            body: <>
                <FormTextBox ref={e => this.tieuDe = e} readOnly />
                <FormTextBox ref={e => this.diemLonNhat = e} label='Điểm tối đa' readOnly />
                <FormTextBox ref={e => this.diemTuDanhGia = e} label='Điểm tự đánh giá của chuyên viên' readOnly />
                <FormTextBox ref={e => this.diemDonVi = e} label='Điểm đánh giá' />
                <FormRichTextBox ref={e => this.yKienDonVi = e} label='Ý kiến' rows={5} />
            </>
        });
    }
}

class FormChuyenVienDetails extends AdminPage {
    state = { danhGiaNam: {}, diemThuong: [], diemTru: [], nhiemVuKhac: [], nam: '', shcc: '' }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/hoi-dong-danh-gia-giang-day/:nam/:shcc');
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

    danhGia = (id, changes, done) => {
        this.props.tccbHoiDongDanhGiaChuyenVien(id, changes, () => this.load(done));
    }

    onDownloadMinhChung = (e, item) => {
        e.preventDefault();
        const extname = item.minhChung.substring(item.minhChung.lastIndexOf('.'));
        const tenFile = `${item.shcc} minh chứng ${item.tenKhenThuong}${extname}`;
        T.download(T.url('/api/tccb/danh-gia-ca-nhan-diem-thuong-minh-chung/' + item.id), tenFile);
    }

    duyetDiemThuong = (id, duyet) => {
        this.props.tccbHoiDongDanhGiaDuyetDiemThuong(id, { duyet }, () => this.load());
    }

    render() {
        let { danhGiaNam, diemThuong, diemTru, nhiemVuKhac, canBo, nam, shcc, khungDanhGiaCanBo } = this.state;
        let finalTuDanhGia = 0, finalDonVi = 0;
        danhGiaNam = danhGiaNam || {};
        const { ho, ten } = canBo || { ho: '', ten: '' };
        const currentDate = new Date().getTime();
        const isHoiDongDanhGia = danhGiaNam.donViBatDauDanhGia && danhGiaNam.donViKetThucDanhGia && currentDate >= danhGiaNam.donViBatDauDanhGia && currentDate <= danhGiaNam.donViKetThucDanhGia;
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
                    <th style={{ width: '15%', textAlign: 'center' }}>Điểm tối đa theo từng công việc</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Điểm tự đánh giá của viên chức</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Điểm của hội đồng đánh giá cấp đơn vị</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Ý kiến của hội đồng đánh giá cấp đơn vị</th>
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
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
                        </tr>
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} content='a)' />
                            <TableCell content='Đào tạo' />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
                        </tr>
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} content='b)' />
                            <TableCell content='Đào tạo sau đại học' />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
                        </tr>
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>Tổng điểm nội dung 1</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                        </tr>

                        {/* Nhiệm vụ 2: Nghiên cứu khoa học */}
                        <tr className='table-active'>
                            <TableCell style={{ textAlign: 'center' }} content={<b>2</b>} />
                            <TableCell content={<b>Nhiệm vụ nghiên cứu khoa học</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
                        </tr>
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>Tổng điểm nội dung 2</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                        </tr>

                        {/* Nhiệm vụ 3: nhiệm vụ khác */}
                        <tr className='table-active'>
                            <TableCell style={{ textAlign: 'center' }} content={<b>3</b>} />
                            <TableCell content={<b>Nhiệm vụ khác</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
                        </tr>

                        {item.nhiemVuKhac.map((menu, sttMenu) => {
                            return <React.Fragment key={`${index}-${sttMenu}`}>
                                <tr>
                                    <TableCell style={{ textAlign: 'center' }} rowSpan={3} content={this.indexToAlpha(sttMenu)} />
                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={<><i>{`Công việc ${sttMenu + 1}: ${menu.noiDung}`}</i><br />{menu.moTa}</>} />
                                    <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemLonNhat || 0).toFixed(2)} điểm`} />
                                    <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemTuDanhGia || 0).toFixed(2)} điểm`} />
                                    <TableCell style={{ textAlign: 'right' }} content={`${Number(menu.diemDonVi || 0).toFixed(2)} điểm`} />
                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={menu.yKienDonVi} />
                                    <TableCell type='buttons' style={{ textAlign: 'center' }} rowSpan={3}>
                                        {isHoiDongDanhGia ? (
                                            <Tooltip title='Đánh giá' arrow>
                                                <button className='btn btn-primary' onClick={() => this.danhGiaModal.show(menu)}>
                                                    <i className='fa fa-lg fa-commenting-o' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                    </TableCell>
                                </tr>
                                <tr>
                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={`Thời hạn hoàn thành công việc ${sttMenu + 1}`} />
                                    <TableCell style={{ textAlign: 'center' }} content={menu.thoiHan ? `${T.dateToText(menu.thoiHan, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                                    <TableCell style={{ textAlign: 'center' }} />
                                    <TableCell style={{ textAlign: 'center' }} />
                                    <TableCell style={{ textAlign: 'center' }} />
                                </tr>
                                <tr>
                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={`Chất lượng hoàn thành công việc ${sttMenu + 1}`} />
                                    <TableCell content={menu.chatLuong} />
                                    <TableCell style={{ textAlign: 'center' }} />
                                    <TableCell style={{ textAlign: 'center' }} />
                                    <TableCell style={{ textAlign: 'center' }} />
                                </tr>
                            </React.Fragment>;
                        })}

                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>Tổng điểm nội dung 3</b>} />
                            <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.totalKhac} điểm`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.totalTuDanhGiaKhac} điểm`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.totalDonViKhac} điểm`}</b>} />
                            <TableCell style={{ textAlign: 'center' }} />
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
                                    <TableCell style={{ textAlign: 'right' }} />
                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} />
                                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                                        {noiDung.minhChung && noiDung.tuDangKy ? (
                                            <Tooltip title='Tải về minh chứng' arrow>
                                                <button className='btn btn-info' onClick={e => this.onDownloadMinhChung(e, noiDung)}>
                                                    <i className='fa fa-download' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                        {isHoiDongDanhGia && noiDung.tuDangKy && noiDung.duyet == 0 ? (
                                            <Tooltip title='Duyệt' arrow>
                                                <button className='btn btn-success' onClick={() => this.duyetDiemThuong(noiDung.id, 1)}>
                                                    <i className='fa fa-check' />
                                                </button>
                                            </Tooltip>
                                        ) : null}
                                        {isHoiDongDanhGia && noiDung.tuDangKy && noiDung.duyet == 1 ? (
                                            <Tooltip title='Bỏ duyệt' arrow>
                                                <button className='btn btn-danger' onClick={() => this.duyetDiemThuong(noiDung.id, 0)}>
                                                    <i className='fa fa-times' />
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
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
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
                                    <TableCell style={{ textAlign: 'right' }} />
                                    <TableCell style={{ whiteSpace: 'pre-wrap' }} />
                                    <TableCell type='buttons' />
                                </tr>
                            );
                        })}
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} colSpan={2} content={<b>{`Tổng ${form[index].tieuChi}`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} content={<b>{`${item.total} điểm`}</b>} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'right' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
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
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell style={{ textAlign: 'center' }} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} />
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
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hội đồng đánh giá</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tieuDe} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tuDanhGia} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.donVi} />
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
                <DanhGiaModal ref={e => this.danhGiaModal = e} danhGia={this.danhGia} />
                <DanhGiaFitModal ref={e => this.danhGiaFitModal = e} nam={nam} shcc={shcc} danhGia={this.danhGia} />
            </>,
            backRoute: `/user/tccb/hoi-dong-danh-gia-don-vi/${nam}`
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDanhGiaChuyenVien, getTccbKhungDanhGiaCanBoAll, tccbHoiDongDanhGiaChuyenVien, tccbHoiDongDanhGiaDuyetDiemThuong };
export default connect(mapStateToProps, mapActionsToProps)(FormChuyenVienDetails);