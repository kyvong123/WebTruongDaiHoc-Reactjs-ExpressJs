import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { getSdhDiemConfigQuyCheAll, createSdhDiemQuyChe, updateSdhDiemQuyCheItem, deleteSdhDiemQuyChe } from './redux';
import { getSdhDiemDacBietTongKet } from '../sdhDiemDacBiet/redux';
import { getSdhDmLoaiDiemThi } from '../sdhDmLoaiDiem/redux';
import { getSdhDiemConfigThanhPhanAll } from '../sdhDiemConfigThanhPhan/redux';
import { AdminPage, TableCell, renderDataTable, FormCheckbox, FormSelect, getValue } from 'view/component/AdminPage';

class SdhDiemConfigQuyChe extends AdminPage {
    state = { dataDiemDacBiet: [], editIndex: null, listLoaiDiem: [] }
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.getData();
        });
    }

    getData = () => {
        this.props.getSdhDiemConfigThanhPhanAll(this.props.semester, items => {
            this.setState({ listLoaiDiem: items ? items.map(i => i.ma) : [] }, () => { this.loaiApDungNew?.value(''); });
        });
        this.props.getSdhDiemConfigQuyCheAll(this.props.semester, this.filterDataDiemDacBiet);
    };

    filterDataDiemDacBiet = () => {
        let diemDacBiet = (this.props.sdhDiemConfigQuyChe?.items || []).map(item => item.ma);
        this.props.getSdhDiemDacBietTongKet(items => {
            this.setState({ dataDiemDacBiet: items.filter(item => item.kichHoat && !diemDacBiet.includes(item.ma)).map(item => ({ id: item.ma, text: item.moTa })) }, () => this.maNew?.value(''));
        });
    }
    componentEdit = (item) => <>
        <TableCell content={<FormCheckbox ref={e => this.tinhTinChi = e} className='mb-0' value={item.tinhTinChi} />} />
        <TableCell content={<FormCheckbox ref={e => this.tinhTrungBinh = e} className='mb-0' value={item.tinhTrungBinh} />} />
        <TableCell content={<FormSelect ref={e => this.loaiApDung = e} className='mb-0' data={this.state.listLoaiDiem} multiple allowClear value={item.loaiApDung ? item.loaiApDung.split(', ') : []} required />} />
        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
            <Tooltip title='Lưu'>
                <button className='btn btn-success' onClick={e => e.preventDefault() || this.saveEditData(item)}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </Tooltip>
        } />
    </>
    deleteQuyChe = (item) => {
        T.confirm('Xóa điểm quy chế', `Bạn có chắc bạn muốn xóa điểm  ${item.moTa ? `<b>${item.moTa}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhDiemQuyChe(item.id, this.props.semester, () => this.filterDataDiemDacBiet());
        });
    }
    saveEditData = (item) => {
        try {
            let changes = {};
            changes['tinhTinChi'] = Number(getValue(this['tinhTinChi']));
            changes['tinhTrungBinh'] = Number(getValue(this['tinhTrungBinh']));
            changes['loaiApDung'] = getValue(this['loaiApDung']).join(', ');

            this.props.updateSdhDiemQuyCheItem(item.id, changes, this.props.semester, () => {
                this.setState({ editIndex: null });
            });
        } catch (error) {
            console.error(error);
            error && T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
        }

    }
    newData = () => {
        try {
            let data = {};
            ['ma'].forEach(key => {
                data[key] = getValue(this[key + 'New']);
            });
            data['tinhTinChi'] = Number(getValue(this['tinhTinChiNew']));
            data['tinhTrungBinh'] = Number(getValue(this['tinhTrungBinhNew']));

            data['loaiApDung'] = getValue(this['loaiApDungNew']).join(', ');

            this.props.createSdhDiemQuyChe(this.props.semester, data, () => {
                this.filterDataDiemDacBiet();
                ['ma', 'tinhTinChi', 'tinhTrungBinh', 'loaiApDung'].forEach(key => {
                    this[key + 'New'].value('');
                });
            });
        } catch (error) {
            console.error(error);
            error && T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
        }

    }

    render() {
        const permission = this.getUserPermission('sdhDiemConfig');
        let list = this.props.sdhDiemConfigQuyChe ? this.props.sdhDiemConfigQuyChe.items : [],
            { editIndex, dataDiemDacBiet } = this.state, isEmpty = false;

        if (!list.length || !Object.keys(list[0]).length) {
            list = [{}];
            isEmpty = true;
        }
        const table = renderDataTable({
            data: list,
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mô tả</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tính tín chỉ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tính trung bình</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Loại áp dụng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: <tbody>
                {!isEmpty && list.map((item, index) => <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.moTa} />

                    {editIndex == index ? this.componentEdit(item) :
                        <>
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinhTinChi ? <i className='fa fa-fw fa-lg fa-check' /> : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinhTrungBinh ? <i className='fa fa-fw fa-lg fa-check' /> : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.loaiApDung} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' content={item}
                                onEdit={() => {
                                    if (editIndex == index) {
                                        this.saveEditData(item, index);
                                    }
                                    else this.setState({ editIndex: index });
                                }}
                                onDelete={() => this.deleteQuyChe(item)}
                                permission={permission} />
                        </>
                    }
                </tr>)}
                <tr style={{ display: dataDiemDacBiet.length ? '' : 'none' }}>
                    <TableCell />
                    <TableCell colSpan={2} content={<FormSelect ref={e => this.maNew = e} data={dataDiemDacBiet} required className='mb-0' placeholder='Thêm loại điểm đặc biệt mới' />} />
                    <TableCell content={<FormCheckbox ref={e => this.tinhTinChiNew = e} className='mb-0' value={0} />} />
                    <TableCell content={<FormCheckbox ref={e => this.tinhTrungBinhNew = e} className='mb-0' value={0} />} />
                    <TableCell content={<FormSelect ref={e => this.loaiApDungNew = e} data={this.state.listLoaiDiem} multiple allowClear required className='mb-0' placeholder='Thêm loại điểm áp dụng' />} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <Tooltip title='Thêm'>
                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.newData()}>
                                <i className='fa fa-lg fa-plus' />
                            </button>
                        </Tooltip>
                    } />
                </tr>
            </tbody>
        });
        return (<div className='tile'>{table}</div>);

    }
}


const mapStateToProps = state => ({ system: state.system, sdhDiemConfigQuyChe: state.sdh.sdhDiemConfigQuyChe });
const mapActionsToProps = { getSdhDiemDacBietTongKet, getSdhDiemConfigQuyCheAll, createSdhDiemQuyChe, updateSdhDiemQuyCheItem, deleteSdhDiemQuyChe, getSdhDmLoaiDiemThi, getSdhDiemConfigThanhPhanAll };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SdhDiemConfigQuyChe);