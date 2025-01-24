
import React from 'react';

import { AdminModal, renderTable, TableCell, FormTabs } from 'view/component/AdminPage';

export class SubDetail extends AdminModal {
    componentDidMount() {
        this.onHidden(this.onHide);
    }
    onShow = (items, data) => {
        this.formTab.tabClick(null, 0);
        this.props.getSubDetailHocPhi(data, result => {
            this.setState({ hocPhiSubDetail: result.subDetail, listDetail: items.hocPhiDetail, item: items.item, data });
        });
    }
    onHide = () => {
        const data = {
            mssv: this.state.data?.mssv || '',
            namHoc: this.state.data?.namHoc || '',
            hocKy: this.state.data?.hocKy || '',
            hoTenSinhVien: this.state.data?.hoTenSinhVien || ''
        };
        this.state.data && this.props.editModal.show(data);
    }
    roundToTwo = (num) => {
        return +(Math.round(num + 'e+2') + 'e-2');
    }

    handleTinhPhi = (item, data) => {
        if (item.maHocPhan && item.status != 2) {
            T.confirm('Thay đổi loại tính phí', 'Bạn có chắc bạn muốn thay đổi loại tính phí cho học phần này và định phí lại cho sinh viên?', true, isConfirm => {
                isConfirm && T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                isConfirm && this.props.updateLoaiTinhPhi(item, () => {
                    item.tinhPhi = item.tinhPhi ? 0 : 1;
                    this.setState({ listDetail: data });
                    T.alert('Thay đổi loại tính phí thành công', 'success', false, 1000);
                    this.hide();
                });
            });
        } else {
            T.notify('Môn học được chọn không hợp lệ', 'danger');
        }
    }
    tableSubDetail = (data) => {
        const objRender = {
            '2': {
                color: 'red',
                content: 'Đã hủy'
            },
            '3': {
                color: 'green',
                content: 'Bổ sung'
            }
        };
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#0275d8', color: '#fff' });
        return renderTable({
            getDataSource: () => data?.sort((a, b) => a.status - b.status) || [],

            stickyHead: true,
            emptyTable: 'Chưa có dữ liệu học phí!',
            // style: { height: '70vh' },
            renderHead: () => (<tr>
                <th style={style()}>STT</th>
                <th style={style('100%')}>Khoản thu</th>
                <th style={style('auto')}>Số tín chỉ</th>
                <th style={style('auto')}>Số tiết</th>
                <th style={style('auto')}>Đơn giá (VNĐ)</th>
                <th style={style('auto', 'right')}>Số tiền (VNĐ)</th>
                <th style={style('auto', 'center')}>Ngày đăng ký</th>
                <th style={style('auto', 'center')}>Tình trạng</th>
                <th style={style('auto', 'center')}>Tính phí</th>
            </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={`${index}-hocPhi`} style={{ padding: item.status == 3 ? '4px' : '' }}>
                        <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                        {
                            (item.status == 3 || item.status == 2) ?
                                <TableCell style={{ textAlign: 'left', position: 'relative', padding: '0.8rem' }} content={
                                    <div>
                                        <span style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '0.7rem', ...objRender[item.status], fontStyle: 'italic' }}>*{`${objRender[item.status].content}`}</span>
                                        <span style={{ position: 'relative', bottom: '-5px' }}>&nbsp;&nbsp;{item.status ? `${item.maHocPhan ? `${item.maHocPhan}: ` : ''} ${T.parse(item.tenLoaiPhi, { vi: '' }).vi} ${item.loaiDangKy ? `(${item.loaiDangKy})` : ''}` : item.tenLoaiPhi}</span>
                                    </div>
                                }>

                                </TableCell>
                                :
                                <TableCell style={{ textAlign: 'left', position: 'relative', padding: '0.6rem' }} content={
                                    <div>
                                        {/* <span style={{ position: 'absolute', top: '4px', left: '4px', fontSize: '0.6rem' }}>&nbsp;&nbsp;&nbsp;</span> */}
                                        <span style={{ marginTop: '1.0rem' }}>&nbsp;&nbsp;{item.status ? `${item.maHocPhan ? `${item.maHocPhan}: ` : ''} ${T.parse(item.tenLoaiPhi, { vi: '' }).vi} ${item.loaiDangKy ? `(${item.loaiDangKy})` : ''}` : item.tenLoaiPhi}</span>
                                    </div>
                                }>

                                </TableCell>
                        }
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.tongTinChi} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.tongSoTiet} />
                        <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} type='text' content={item.tongTinChi && item.soTien ? T.numberDisplay(this.roundToTwo(parseInt(item.soTien) / parseInt(item.tongTinChi))) : ''} />
                        <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap', color: item.soTien != null ? '' : 'green' }} type={item.soTien != null ? 'number' : 'text'} content={item.soTien != null ? item.soTien : 'Chưa được định phí'} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={item.thoiGianDangKy ? T.dateToText(item.thoiGianDangKy, 'dd/mm/yyyy') : ''} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', color: item.tinhTrangDong ? 'green' : 'red' }} type='text' content={item.tinhTrangDong ? 'Đã nộp' : 'Chưa nộp'} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} permission={{ write: true }} isCheck={true} onChanged={() => this.handleTinhPhi(item, data)} type='checkbox' content={item.tinhPhi} />
                    </tr>
                );
            }
        });
    }

    tableTamThu = (item, listDetail) => {
        let data = listDetail.filter(subItem => subItem.idLoaiPhi == item.tamThu);
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#0275d8', color: '#fff' });
        return renderTable({
            getDataSource: () => data || [],
            emptyTable: 'Chưa có dữ liệu học phí!',
            stickyHead: true,
            // style: { height: '70vh' },
            renderHead: () => (<tr>
                <th style={style()}>STT</th>
                <th style={style('100%')}>Loại phí</th>
                <th style={style('auto', 'right')}>Tổng thu (VNĐ)</th>
            </tr>),
            renderRow: (item, index) => {

                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.tenLoaiPhi} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='number' content={item.soTien} />
                    </tr>
                );
            }
        });
    }
    render = () => {
        const hocPhiSubDetail = this.state.hocPhiSubDetail;
        const item = this.state.item;
        const listDetail = this.state.listDetail;
        return this.renderModal({
            title: `Chi tiết học phí theo môn học sinh viên ${this.state.data?.hoTenSinhVien || ''} - ${this.state.data?.mssv || ''}`,
            size: 'large',
            stickyHead: hocPhiSubDetail,
            // style: { height: '70vh' },
            body:
                <React.Fragment>

                    <FormTabs ref={e => this.formTab = e}
                        contentClassName='tile'
                        tabs={[
                            {
                                id: 0, title: 'Chi tiết', component: <>{this.tableSubDetail(hocPhiSubDetail)}
                                    <div style={{ textAlign: 'right' }}>
                                        <div>Tổng học phí: <b>{T.numberDisplay(Number(this.state?.item?.soTien)) || ''} VNĐ </b></div>
                                    </div>
                                </>
                            },
                            { id: 1, title: 'Tạm thu', component: listDetail ? this.tableTamThu(item, listDetail) : '' }
                        ]}
                    />

                </React.Fragment>,


        });
    }
}