import React from 'react';
import { connect } from 'react-redux';
import { getSdhDiemConfigBySemester, createSdhDiemConfig, updateSdhDiemConfig } from './redux';
import { AdminPage, TableCell, renderTable, FormDatePicker, getValue } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class SdhDiemConfigTime extends AdminPage {
    state = { editIndex: null }
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            const semester = this.props.semester;
            this.props.getSdhDiemConfigBySemester(semester.namHoc, semester.hocKy, items => this.setState({ items, idSemester: semester.maHocKy }));
        });
    }

    saveEdit = (item) => {
        try {
            const data = {
                loaiHinhDaoTao: item.loaiHinhDaoTao,
                thoiGianNhap: getValue(this.thoiGianNhap).getTime(),
                thoiGianKetThucNhap: getValue(this.thoiGianKetThucNhap).getTime(),
                ...this.props.semester,
                idSemester: this.state.idSemester,
            };
            if (data.thoiGianNhap > data.thoiGianKetThucNhap) {
                T.notify('Thời gian nhập phải nhỏ hơn thời gian kết thúc nhập', 'danger');
            } else if (!item.id) {
                this.props.createSdhDiemConfig(data, () => this.setState({ editIndex: null }));
            }
            else {
                this.props.updateSdhDiemConfig(item.id, data, () => this.setState({ editIndex: null }));
            }
        } catch (error) {
            console.error(error);
            T.notify('Vui lòng nhập thời gian nhập điểm', 'danger');
        }
    }
    selectNgayNhap = (item, index) => {
        let editIndex = this.state.editIndex;
        return editIndex == index ? <FormDatePicker ref={e => this.thoiGianNhap = e} className='mb-0' type='time-mask' value={item.thoiGianNhap || ''} required /> : (item.thoiGianNhap ? T.dateToText(item.thoiGianNhap, 'dd/mm/yyyy HH:MM') : '');
    }
    selectNgayKetThucNhap = (item, index) => {
        let editIndex = this.state.editIndex;
        return editIndex == index ? <FormDatePicker ref={e => this.thoiGianKetThucNhap = e} className='mb-0' type='time-mask' value={item.thoiGianKetThucNhap || ''} required /> : (item.thoiGianKetThucNhap ? T.dateToText(item.thoiGianKetThucNhap, 'dd/mm/yyyy HH:MM') : '');
    }
    render() {
        let data = this.props.sdhDiemConfig?.semester ? this.props.sdhDiemConfig.semester : [],
            editIndex = this.state.editIndex;
        const permission = this.getUserPermission('sdhDiemConfig');
        const table = renderTable({
            getDataSource: () => data,
            stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '10%' }}>Mã</th>
                    <th style={{ width: '30%' }}>Tên</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Thời gian bắt đầu nhập điểm</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Thời gian kết thúc nhập điểm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell content={item.tenVietTat} />
                        <TableCell content={item.ten} />
                        <TableCell content={this.selectNgayNhap(item, index)} />
                        <TableCell content={this.selectNgayKetThucNhap(item, index)} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item}
                            onEdit={() => {
                                if (editIndex == index) {
                                    this.saveEdit(item);
                                } else this.setState({ editIndex: index });
                            }}
                            permission={permission}>
                            {editIndex == index && <Tooltip title='Hủy chỉnh sửa' arrow>
                                <button className='btn btn-secondary' onClick={(e) => e && e.preventDefault() || this.setState({ editIndex: null })}>
                                    <i className={'fa fa-lg fa-ban'} />
                                </button>
                            </Tooltip>}
                        </TableCell>
                    </tr>
                );
            },
        });
        return (
            <div className='tile'>{table}</div>);
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDiemConfig: state.sdh.sdhDiemConfig });
const mapActionsToProps = { getSdhDiemConfigBySemester, createSdhDiemConfig, updateSdhDiemConfig };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SdhDiemConfigTime);