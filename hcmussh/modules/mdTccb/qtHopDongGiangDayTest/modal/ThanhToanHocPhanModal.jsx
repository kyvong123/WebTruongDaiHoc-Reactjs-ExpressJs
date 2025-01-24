
import React from 'react';
import { AdminModal, FormSelect, renderTable, TableCell, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmMonHoc } from 'modules/mdDaoTao/dmMonHoc/redux';
export class ThanhToanHocPhanModal extends AdminModal {
    onShow = (item) => {
        this.setState({ shcc: item.nguoiDuocThue, maHopDong: item.maHopDong });
        this.soHopDong?.value(item.soHopDong);
        this.props.getHocPhanTheoCanBo(item.nguoiDuocThue, null, data => {
            this.setState({ item: data.item.filter(item => !item.tinhTrangThanhToan) });
        }
        )
    };

    onSubmit = () => {
        const listHocPhan = this.state.listHocPhan.filter(item => !item.tinhTrangThanhToan),
            listHocPhanExport = listHocPhan.filter(item => {
                this[`isExport_${item.maHopDongChiTiet}`].value(false);
                return item.export;
            });
        if (!listHocPhan)
            T.notify('Vui lòng chọn học phần cần thanh toán !', 'danger');
        else {
            if (listHocPhan.length == listHocPhanExport.length && listHocPhanExport[0].maHopDong) {
                this.props.updateHopDongGiangDayTest(this.state.maHopDong, { tinhTrangThanhToan: 1 });
            }
            Promise.all(listHocPhanExport.map(item => {
                this.props.updateHocPhanGiangDay(item.lop, item.nguoiDuocThue, { tinhTrangThanhToan: 1 }, item.loaiHinhDaoTao);
            }));
            this.props.getPage();
            this.hide();
        }
    }

    onCheckBox = (id, value) => {
        let listHocPhan = this.state.item,
            tongThucNhan = 0;
        const idx = listHocPhan.findIndex(item => item.maHopDongChiTiet == id);

        if (idx >= 0) {
            listHocPhan[idx] = { ...listHocPhan[idx], ...value };
        }
        tongThucNhan = listHocPhan.filter(item => item.export).reduce((tong, item) => tong + item.thucNhan, 0);
        this.setState({ listHocPhan, tongThucNhan });
    }

    render = () => {
        let table = renderTable({
            emptyTable: 'Không có học phần giảng dạy',
            getDataSource: () => this.state.item,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}> STT</th>
                    <th style={{ minwidth: 60, width: 'auto', textAlign: 'center' }} >Thanh toán hợp đồng </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Mã môn học </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Tên môn học </th>
                    <th style={{ minwidth: 60, width: 'auto', textAlign: 'center' }} >Năm học'</th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Học kỳ </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Lớp </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Số sinh viên </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Tổng số tiết </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Số tín chỉ </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Hệ số chất lượng </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Hệ số khối lượng </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Tổng hệ số </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Mức thù lao </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Thành tiền  </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Khấu trừ thuế TNCN </th>
                    <th style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} >Thực nhận </th>

                </tr >
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                        content={<FormCheckbox ref={e => this[`isExport_${item.maHopDongChiTiet}`] = e} onChange={() => this.onCheckBox(item.maHopDongChiTiet, { export: this[`isExport_${item.maHopDongChiTiet}`]?.value() })} />}
                    />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hocKy} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soSinhVien} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soTiet} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soTinChi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heSoChatLuong?.toFixed(1)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heSoKhoiLuong?.toFixed(1)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heSo?.toFixed(1)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.donGia?.toString().numberDisplay()} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.thanhTien?.toString().numberDisplay()} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.thue?.toString().numberDisplay()} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.thucNhan?.toString().numberDisplay()} />
                </tr >
            ),
        });

        return this.renderModal({
            title: 'Thanh toán học phần giảng dạy',
            size: 'elarge',
            body:
                <div className='row' >
                    <FormTextBox className='col-12 col-md-6' ref={e => this.soHopDong = e} label='Số hợp đồng' readOnly required />
                    <FormSelect onChange={() => this.props.getHocPhanTheoCanBo(this.state.shcc, this.tenMonHoc.value(), data => this.setState({ data }))} className='col-12 col-md-6' ref={e => this.tenMonHoc = e} data={SelectAdapter_DmMonHoc} label='Tên môn học' required />
                    <div className='col-md-12'>
                        <div className='tile'>{table}</div>
                    </div>
                    <div className='col-md-9'></div><div className='col-md-3'><b>Tổng số tiền: {this.state.tongThucNhan?.toString()?.numberDisplay() || 0} Việt Nam đồng</b></div>
                </div>
        });
    }
}