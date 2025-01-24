import React from 'react';
import { AdminModal, FormTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import { Tooltip } from '@mui/material';
export class ShareTietModal extends AdminModal {

    onShow = (item, filter) => {
        const newItem = { ...item };
        this.setState({ item, data: [newItem], ...filter, maHocPhan: item.maHocPhan }, this.setData);
    }
    onSubmit = () => {
        const data = {
            item: this.state.item,
            maHocPhan: this.state.maHocPhan,
            list: this.state.data,
            namHoc: this.state.namHoc,
            hocKy: this.state.hocKy
        };
        this.props.updateChiaTiet(data, this.hide);
    }
    setData = () => {
        this.state?.data.map((item, index) => {
            this[`giangVien_${index}`]?.value(item?.idGiangVien);
            this[`soTietDuocChia_${index}`]?.value(item?.soTietDuocChia);
            this[`tongSoSinhVien_${index}`]?.value(item?.soLuongSinhVien);
        });

    }
    handleChangeGiangVien = (index) => {
        this.state.data[index].idGiangVien = this[`giangVien_${index}`]?.value();
    }
    handleChangeSoTietDuocChia = (index) => {
        this.state.data[index].soTietDuocChia = parseInt(this[`soTietDuocChia_${index}`]?.value());
    }
    handleChangeTongSoSinhVien = (index) => {
        this.state.data[index].soLuongSinhVien = parseInt(this[`tongSoSinhVien_${index}`]?.value());
    }
    chiaTiet = (soTietCanChia, soGiangVien) => {
        let soTietDu = parseInt(soTietCanChia) % parseInt(soGiangVien);
        let soTietCoBan = (soTietCanChia - soTietDu) / parseInt(soGiangVien);
        let result = [];
        for (let index = 0; index < soGiangVien; index++) {
            if (soTietDu > 0) {
                result[index] = soTietCoBan + 1;
                soTietDu--;
            } else {
                result[index] = soTietCoBan;
            }

        }
        return result;
    }
    splitRow = (item, indexRow, done) => {
        let tempObject = { ...item };
        const listChiaTiet = this.chiaTiet(this.state.data[indexRow].soTietDuocChia, 2);
        item.soTietDuocChia = listChiaTiet[0];
        tempObject.soTietDuocChia = listChiaTiet[1];
        this.state.data.splice(indexRow + 1, 0, tempObject);
        this.setState({ data: this.state.data }, done);
    }
    deleteRow = (item, indexRow, done) => {
        let tempObject = { ...item };
        if (indexRow == 0) {
            T.notify('Không thể xóa hàng gốc!', 'danger');
        } else {
            this.state.data[indexRow - 1].soTietDuocChia += tempObject.soTietDuocChia;
            this.state.data.splice(indexRow, 1);
            this.setState({ data: this.state.data }, done);
        }
    }
    render = () => {
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#0275d8', color: '#fff' });
        let table = renderTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => this.state.data || [],
            renderHead: () => (
                <tr>
                    <th style={style()}>STT</th>
                    <th style={style('100%')}>Giảng viên</th>
                    <th style={style('100%')}>Tổng số sinh viên</th>
                    <th style={style('100%')}>Số tiết được chia</th>
                    <th style={style('100%')}>Tách hàng</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={index + 1} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={<FormSelect data={SelectAdapter_FwCanBoGiangVien} ref={e => this[`giangVien_${index}`] = e} className='col-md-12' style={{ margin: 0, padding: 0 }} onChange={() => this.handleChangeGiangVien(index)}></FormSelect>} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={<FormTextBox type='number' allowNegative={false} ref={e => this[`tongSoSinhVien_${index}`] = e} className='col-md-12' style={{ margin: 0, padding: 0 }} onChange={() => this.handleChangeTongSoSinhVien(index)}></FormTextBox>} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={<FormTextBox type='number' allowNegative={false} ref={e => this[`soTietDuocChia_${index}`] = e} style={{ margin: 0, padding: 0 }} onChange={() => this.handleChangeSoTietDuocChia(index)}></FormTextBox>} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='buttons'>
                        <Tooltip title='Chia lại tiết giảng viên' arrow>
                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.splitRow(item, index, () => this.setData())}>
                                <i className='fa fa-pie-chart' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Xóa hàng' arrow>
                            <button className='btn btn-danger' onClick={e => e.preventDefault() || this.deleteRow(item, index, () => this.setData())}>
                                <i className='fa fa-minus' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr >
            )
        });

        const item = this.state.item || null;
        return this.renderModal({
            title: `Điều chỉnh số Tiết của Giảng viên ${item?.ho} ${item?.ten} - Môn ${T.parse(item?.tenMonHoc)?.vi || ''} (${item?.maHocPhan}) `,
            size: 'elarge',
            body: <div className=''>
                {table}
            </div>
        });
    }
}