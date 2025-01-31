import React from 'react';
import { connect } from 'react-redux';
import { getSdhThangDiemKhoaAll, getSdhDiemThangDiem, createSdhThangDiemKhoaHv, updateSdhThangDiemKhoaHv } from './redux';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class SdhThangDiemKhoaHvPage extends AdminPage {
    state = { dataThangDiem: [], editIndex: null };
    idThangDiem = [];
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.getData();
        });
    }

    getData = () => {
        this.idThangDiem = [];
        this.props.getSdhDiemThangDiem(items => this.setState({ dataThangDiem: items.map(i => ({ id: i.id, text: i.ma })) }, () =>
            this.props.getSdhThangDiemKhoaAll(khoaHv => khoaHv?.forEach((j, index) => this.idThangDiem[index]?.value(j.idThangDiem)))));
    }

    edit = (item, index) => {
        if (this.state.editIndex != index) {
            this.setState({ editIndex: index });
        }
        else {
            let idThangDiem = this.idThangDiem[index].value();
            if (!idThangDiem) { this.setState({ editIndex: null }); return; }
            !item.id ? this.props.createSdhThangDiemKhoaHv(item.khoaHocVien, idThangDiem, () => this.setState({ editIndex: null })) : this.props.updateSdhThangDiemKhoaHv(item.id, idThangDiem, () => this.setState({ editIndex: null }));

        }
    }

    render() {
        const permission = this.getUserPermission('sdhDiemThangDiem', ['read', 'write', 'delete', 'manage']),
            list = this.props.sdhDiemThangDiem ? this.props.sdhDiemThangDiem.thangDiemKhoa : [];
        const editIndex = this.state.editIndex;
        const table = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            emptyTable: 'Không có dữ liệu khóa học viên',
            header: 'thead-light',
            renderHead: () => <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: '50%' }}>Khóa học viên</th>
                <th style={{ width: '50%' }}>Thang điểm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => (
                <tr>
                    <TableCell content={index + 1} />
                    <TableCell content={item.khoaHocVien} />
                    <TableCell content={<FormSelect className='mb-0' ref={e => this.idThangDiem[index] = e} data={this.state.dataThangDiem} value={item.idThangDiem} required readOnly={!permission.manage || index != this.state.editIndex} />} />
                    <TableCell type='buttons' content={item} permission={permission} >
                        {permission.manage && < Tooltip title={index == editIndex ? 'Hoàn tất' : 'Chỉnh sửa'} arrow>
                            <button className='btn btn-primary' onClick={(e) => e && e.preventDefault() || this.edit(item, index)}>
                                <i className={'fa fa-lg ' + (index == editIndex ? 'fa-check' : 'fa-edit')} />
                            </button>

                        </Tooltip>}
                        {index == editIndex && <Tooltip title='Hủy chỉnh sửa' arrow>
                            <button className='btn btn-danger' onClick={(e) => e && e.preventDefault() || this.setState({ editIndex: null })}>
                                <i className={'fa fa-lg fa-ban'} />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            )
        });
        return (
            <div className='tile'>{table}</div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDiemThangDiem: state.sdh.sdhDiemThangDiem });
const mapActionsToProps = { getSdhThangDiemKhoaAll, getSdhDiemThangDiem, createSdhThangDiemKhoaHv, updateSdhThangDiemKhoaHv };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SdhThangDiemKhoaHvPage);