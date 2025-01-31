import React from 'react';
import { connect } from 'react-redux';
import { FormDatePicker, getValue, renderTable, TableCell, AdminPage } from 'view/component/AdminPage';
import { getDtDiemConfigFilter, createDtDiemConfig } from './redux.jsx';
import { getDmSvLoaiHinhDaoTaoAll } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { Tooltip } from '@mui/material';

class ConfigDiemSection extends AdminPage {
    state = { listLoaiHinh: [], dataConfig: [] }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDmSvLoaiHinhDaoTaoAll(items => this.setState({
                listLoaiHinh: items,
            }));
            this.props.getDtDiemConfigFilter(this.props.semester);
        });
    }

    selectNgayNhap = (item) => {
        let { editItem } = this.state,
            { dataFilter } = this.props.dtDiemConfig || { dataFilter: [] },
            { thoiGianNhap } = dataFilter?.find(i => i.loaiHinhDaoTao == item.ma) || { thoiGianNhap: '' };
        return editItem == item.ma ? <FormDatePicker ref={e => this.thoiGianNhap = e} className='mb-0' type='time-mask' value={thoiGianNhap} required /> : (thoiGianNhap ? T.dateToText(thoiGianNhap, 'dd/mm/yyyy HH:MM') : '');
    }

    selectNgayKetThucNhap = (item) => {
        let { editItem } = this.state,
            { dataFilter } = this.props.dtDiemConfig || { dataFilter: [] },
            { thoiGianKetThucNhap } = dataFilter?.find(i => i.loaiHinhDaoTao == item.ma) || { thoiGianKetThucNhap: '' };
        return editItem == item.ma ? <FormDatePicker ref={e => this.thoiGianKetThucNhap = e} className='mb-0' type='time-mask' value={thoiGianKetThucNhap} required /> : (thoiGianKetThucNhap ? T.dateToText(thoiGianKetThucNhap, 'dd/mm/yyyy HH:MM') : '');
    }

    table = (list) => renderTable({
        getDataSource: () => list, stickyHead: false,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: 'auto' }}>Mã</th>
                <th style={{ width: '30%' }}>Tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ẩn điểm</th>
                <th style={{ width: '35%', whiteSpace: 'nowrap' }}>Thời gian bắt <br /> đầu nhập điểm</th>
                <th style={{ width: '35%', whiteSpace: 'nowrap' }}>Thời gian kết <br /> thúc nhập điểm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>),
        renderRow: (item, index) => {
            let { editItem } = this.state, { dataFilter } = this.props.dtDiemConfig || { dataFilter: [] },
                { isAnDiem } = dataFilter?.find(i => i.loaiHinhDaoTao == item.ma) || { isAnDiem: false };
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.ma} />
                    <TableCell content={item.ten} />
                    <TableCell type='checkbox' content={isAnDiem} permission={{ write: true }} onChanged={value => this.handleAnDiem(value, item)} />
                    <TableCell content={this.selectNgayNhap(item)} />
                    <TableCell content={this.selectNgayKetThucNhap(item)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' content={item}
                        onEdit={() => {
                            if (editItem == item.ma) {
                                this.handleSaveEdit(item);
                            } else this.setState({ editItem: item.ma });
                        }}
                        permission={{ write: true }}>
                        {editItem == item.ma && <Tooltip title='Hủy chỉnh sửa' arrow>
                            <button className='btn btn-secondary' onClick={(e) => e && e.preventDefault() || this.setState({ editItem: null })}>
                                <i className={'fa fa-lg fa-ban'} />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            );
        },
    });

    handleAnDiem = (value, item) => {
        const data = {
            loaiHinhDaoTao: item.ma,
            isAnDiem: Number(value),
            ...this.props.semester,
        };
        this.props.createDtDiemConfig(data);
    }

    handleSaveEdit = (item) => {
        try {
            const data = {
                loaiHinhDaoTao: item.ma,
                thoiGianNhap: getValue(this.thoiGianNhap).getTime(),
                thoiGianKetThucNhap: getValue(this.thoiGianKetThucNhap).getTime(),
                ...this.props.semester,
            };
            if (data.thoiGianNhap > data.thoiGianKetThucNhap) {
                T.notify('Thời gian nhập phải nhỏ hơn thời gian kết thúc nhập', 'danger');
            } else {
                this.props.createDtDiemConfig(data, () => this.setState({ editItem: null }));
            }
        } catch (error) {
            console.error(error);
            T.notify('Vui lòng nhập thời gian nhập điểm', 'danger');
        }
    }

    render() {
        return (
            <div className='tile'>
                {this.table(this.state.listLoaiHinh)}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiemConfig: state.daoTao.dtDiemConfig });
const mapActionsToProps = {
    getDtDiemConfigFilter, createDtDiemConfig, getDmSvLoaiHinhDaoTaoAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ConfigDiemSection);