
import React from 'react';

import { AdminModal, renderTable, TableCell, FormTabs } from 'view/component/AdminPage';

export class SubDetail extends AdminModal {

    onShow = (items, data) => {
        this.formTab.tabClick(null, 0);
        this.props.getSubDetailHocPhi(data, result => {
            this.setState({ hocPhiSubDetail: result.subDetail, listDetail: items.hocPhiDetail, item: items.item, data, khoaSinhVien: result.khoaSinhVien });
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
    onClickModal = (e, item) => {
        e.preventDefault();
        this.props.subModal.show(
            {
                item,
                hocPhiDetail: this.props.tcHocPhi?.hocPhiDetail
            },
            {
                mssv: this.state.mssv,
                namHoc: this.state.namHoc,
                hocKy: this.state.hocKy,
                idDotDong: item.idDotDong,
                hoTenSinhVien: this.state.hoTenSinhVien
            }
        );
        this.hide();

    }
    tableSubDetail = (data) => {
        let fullZero = data?.find(item => item.soTien != 0) ? false : true;
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#0275d8', color: '#fff' });
        return renderTable({
            emptyTable: 'Không có dữ liệu môn đã đăng ký!',
            header: 'thead-light',
            getDataSource: () => data,
            renderHead: () => (
                <tr>
                    <th style={style()}>STT</th>
                    <th style={style('100%')}>Tên Môn Học</th>
                    <th style={style('auto')}>Số chỉ</th>
                    {this.state.khoaSinhVien && parseInt(this.state.khoaSinhVien) < 2022 && <th style={style('auto')}>Số tiết</th>}
                    {!fullZero && <th style={style('auto')}>Đơn giá (VNĐ)</th>}
                    {!fullZero && <th style={style('auto', 'right')}>Số tiền (VNĐ)</th>}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTinChi} />
                    {this.state.khoaSinhVien && parseInt(this.state.khoaSinhVien) < 2022 && <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTinChi ? parseInt(item.soTinChi) * 15 : ''} />}
                    {!fullZero && <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='number' content={Number(item.soTien) / Number(item.soTinChi)} />}
                    {!fullZero && <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.soTien || 0} />}
                </tr>
            )
        });
    }

    tableTamThu = (item, listDetail) => {
        let data = listDetail.filter(subItem => subItem.idLoaiPhi == item.tamThu);
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#0275d8', color: '#fff' });
        return renderTable({
            getDataSource: () => data || [],
            emptyTable: 'Chưa có dữ liệu học phí!',
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
            title: `Chi tiết học phí theo môn học sinh viên ${this.state.data?.hoTenSinhVien || ''} - ${this.state.data?.mssv || ''} `,
            size: 'large',
            body:
                <>

                    <FormTabs ref={e => this.formTab = e}
                        contentClassName='tile'
                        tabs={[
                            {
                                id: 0, title: 'Chi tiết', component: < >{this.tableSubDetail(hocPhiSubDetail)}
                                    <div style={{ textAlign: 'right' }}>
                                        <div>Tổng học phí: <b>{T.numberDisplay(Number(this.state?.item?.soTien)) || ''} VNĐ </b></div>
                                    </div>
                                </>
                            },
                            { id: 1, title: 'Tạm thu', component: listDetail ? this.tableTamThu(item, listDetail) : '' }
                        ]}
                    />

                </>,
        });
    }
}