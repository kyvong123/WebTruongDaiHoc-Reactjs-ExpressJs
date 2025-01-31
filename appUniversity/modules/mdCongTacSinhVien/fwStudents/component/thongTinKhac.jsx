import React, { Component } from 'react';
import { FormRichTextBox, FormDatePicker, renderTable, TableCell, getValue } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';

export class ThongTinKhacComponent extends Component {
    state = { ghiChu: [], editIndex: null }

    setUpData = (ghiChu = []) => {
        this.setState({ ghiChu });
    }

    getData = () => {
        return this.state.ghiChu.length ? this.state.ghiChu : 0;
    }

    setData = ({ thoiGian = '', noiDung = '' }) => {
        this.thoiGian?.value(thoiGian);
        this.noiDung?.value(noiDung);
    }

    save = () => {
        try {
            const { editIndex, ghiChu } = this.state,
                thoiGian = this.thoiGian.value();
            const data = {
                thoiGian: thoiGian ? thoiGian.getTime() : '',
                noiDung: getValue(this.noiDung),
            };
            if (typeof editIndex == 'number') ghiChu[editIndex] = data;
            else ghiChu.push(data);
            this.setState({ ghiChu: [...ghiChu], editIndex: null }, () => this.setData({}));
        } catch (error) {
            console.log(error);
            error.props && T.notify(`${error.props.placeholder || 'Dữ liệu'} bị trống!`, 'danger');
        }
    }

    editRow = (index) => {
        return <tr>
            <td>{typeof index == 'number' ? index + 1 : ''}</td>
            <td><FormDatePicker ref={e => this.thoiGian = e} placeholder='Thời gian' type='date-mask' /></td>
            <td><FormRichTextBox ref={e => this.noiDung = e} className='col-md-12' placeholder='Nội dung' rows='5' required /></td>
            <TableCell type='buttons'>
                <Tooltip title='Lưu' ><button type='button' className='btn btn-success' onClick={() => this.save()}><i className={`fa fa-${index == undefined ? 'plus' : 'check'}`} /></button></Tooltip>
                {index != null && <Tooltip title='Hủy' ><button type='button' className='btn btn-danger' onClick={() => this.setState({ editIndex: null })}><i className='fa fa-times' /></button></Tooltip>}
            </TableCell>
        </tr>;
    }

    render() {
        const { readOnly = false } = this.props;
        const { ghiChu = [], editIndex = null } = this.state || {};
        return <>
            {renderTable({
                getDataSource: () => [{}],
                renderHead: () => <tr>
                    <th>#</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: '90%' }}>Nội dung</th>
                    {!readOnly && <th style={{ width: '90%' }}>Thao tác</th>}
                </tr>,
                renderRow: <>
                    {ghiChu.map((item, index) => editIndex == index ? this.editRow(index) : <tr key={index}>
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.thoiGian} />
                        <TableCell style={{ whiteSpace: 'pre-line' }} content={item.noiDung} />
                        {!readOnly && <TableCell type='buttons'>
                            <Tooltip title='Chỉnh sửa'><button type='button' className='btn btn-info' onClick={() => this.setState({ editIndex: index }, () => this.setData(item))}><i className='fa fa-pencil'></i></button></Tooltip>
                            <Tooltip title='Xóa'><button type='button' className='btn btn-danger' onClick={() => this.setState({ ghiChu: [...ghiChu.filter((_, i) => i != index)] })}><i className='fa fa-trash'></i></button></Tooltip>
                        </TableCell>}
                    </tr>)}
                    {!readOnly && editIndex === null && this.editRow()}
                </>
            })}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ThongTinKhacComponent);