import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { getSdhDiemConfigThanhPhanAll, updateSdhDiemThanhPhanItem, createSdhDiemThanhPhan, deleteSdhDiemThanhPhan } from './redux';
import { getSdhDmLoaiDiemAll } from '../sdhDmLoaiDiem/redux';
import { AdminPage, TableCell, FormTextBox, FormSelect, renderDataTable, getValue } from 'view/component/AdminPage';

const dataDiemLamTron = ['0.1', '0.01'];
class SdhDiemConfigThanhPhan extends AdminPage {
    state = { dataDmLoaiDiem: [], editIndex: null, data: [], configThanhPhan: [] };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhDiemConfigThanhPhanAll(this.props.semester, () => {
                this.filterDataDmLoaiThanhPhan();
            });
        });
    }

    filterDataDmLoaiThanhPhan = () => {
        let diemThanhPhan = (this.props.sdhDiemConfigThanhPhan?.items || []).map(item => item.ma);
        this.props.getSdhDmLoaiDiemAll(data => {
            let items = data.items;
            this.setState({ dataDmLoaiDiem: items.filter(item => !item.isDeleted && !diemThanhPhan.includes(item.ma)).map(item => ({ id: item.ma, text: item.ma + ': ' + item.ten })) }, () => this.maNew?.value(''));
        });
    }

    deleteThanhPhan = (item) => {
        T.confirm('Xóa điểm thành phần', `Bạn có chắc bạn muốn xóa thành phần ${item.loaiDiem ? `<b>${item.loaiDiem}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhDiemThanhPhan(item.id, this.props.semester, () => {
                this.filterDataDmLoaiThanhPhan();
                this.props.updateSelector();
            });
        });
    }

    defaultCheck = (phanTramMacDinh, phanTramMin, phanTramMax) => {
        if (Number(phanTramMacDinh) <= 0 || Number(phanTramMin) <= 0 || Number(phanTramMacDinh) <= 0 || Number(phanTramMax) <= 0) {
            T.notify('Phần trăm điểm phải lớn hơn 0 !', 'danger');
            return false;
        }
        else if (Number(phanTramMacDinh) > 100 || Number(phanTramMin) > 100 || Number(phanTramMacDinh) > 100 || Number(phanTramMax) > 100) {
            T.notify('Phần trăm điểm phải không được vượt quá 100!', 'danger');
            return false;
        }
        else if (Number(phanTramMacDinh) < Number(phanTramMin) || Number(phanTramMacDinh) > Number(phanTramMax)) {
            T.notify('Phần trăm mặc định phải nằm trong khoảng cho phép!', 'danger');
            return false;
        }
        else return true;

    }
    saveEditData = (item) => {
        try {
            let changes = {};
            ['phanTramMin', 'phanTramMax', 'phanTramMacDinh', 'loaiLamTron'].forEach(key => {
                changes[key] = Number(getValue(this[key]));
            });

            let { phanTramMacDinh, phanTramMin, phanTramMax } = changes;
            if (!this.defaultCheck(phanTramMacDinh, phanTramMin, phanTramMax)) return;
            let list = this.props.sdhDiemConfigThanhPhan.items?.filter(i => i.id != item.id);
            let sum = list.reduce((x, y) => { return x + parseInt(y.phanTramMacDinh); }, 0);
            if ((sum + parseInt(phanTramMacDinh)) > 100) {
                T.notify('Tổng phần trăm điểm phải là 100%', 'danger');
                return;
            }

            this.props.updateSdhDiemThanhPhanItem(item.id, changes, this.props.semester, () => {
                this.setState({ editIndex: null });
            });
        } catch (error) {
            error && T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
        }

    }

    newData = () => {
        try {
            let items = this.props.sdhDiemConfigThanhPhan?.items ? this.props.sdhDiemConfigThanhPhan.items : null;
            let data = {};
            ['ma', 'phanTramMin', 'phanTramMax', 'phanTramMacDinh', 'loaiLamTron'].forEach(key => {
                data[key] = getValue(this[key + 'New']);
            });
            data = { ...data, namHoc: this.props.semester.namHoc, hocKy: this.props.semester.hocKy };
            let { phanTramMacDinh, phanTramMin, phanTramMax } = data;
            if (!this.defaultCheck(phanTramMacDinh, phanTramMin, phanTramMax)) return;
            let sum = items ? items.reduce((x, y) => { return x + parseInt(y.phanTramMacDinh); }, 0) : 0;
            if ((sum + parseInt(phanTramMacDinh)) > 100) {
                T.notify('Tổng phần trăm điểm phải là 100%', 'danger');
                return;
            }
            this.props.createSdhDiemThanhPhan(this.props.semester, data, () => {
                this.filterDataDmLoaiThanhPhan();
                this.props.updateSelector();
                ['ma', 'phanTramMin', 'phanTramMax', 'phanTramMacDinh', 'loaiLamTron'].forEach(key => {
                    this[key + 'New'].value((key == 'ma' || key == 'loaiLamTron') ? '' : 0);
                });
            });
        } catch (error) {
            error && T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
        }
    }
    componentEdit = (item) => <>
        <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMin = e} className='mb-0' value={item.phanTramMin} required />} />
        <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMax = e} className='mb-0' value={item.phanTramMax} required />} />
        <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMacDinh = e} className='mb-0' value={item.phanTramMacDinh} required />} />
        <TableCell content={<FormSelect className='mb-0' ref={e => this.loaiLamTron = e} data={dataDiemLamTron} value={item.loaiLamTron} required />} />
        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
            <Tooltip title='Lưu'>
                <button className='btn btn-success' onClick={e => e.preventDefault() || this.saveEditData(item)}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </Tooltip>
        } />
    </>
    render() {
        const permission = this.getUserPermission('sdhDiemConfig');
        let { dataDmLoaiDiem, editIndex } = this.state, isEmpty = false,
            list = this.props.sdhDiemConfigThanhPhan ? this.props.sdhDiemConfigThanhPhan.items : [];
        if (!list.length || !Object.keys(list[0]).length) {
            list = [{}];
            isEmpty = true;
        }
        const table = renderDataTable({
            data: list,
            stickyHead: true,
            header: 'thead-light',
            multipleTbody: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Mã thành phần</th>
                    <th style={{ width: '40%' }}>Tên</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Phần trăm tối thiểu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phần trăm tối đa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Phần trăm mặc định</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Làm tròn</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: <tbody>
                {!isEmpty && list.length && list.map((item, index) => (
                    <tr key={index}>
                        <TableCell content={index + 1} />
                        <TableCell content={item.ma} />
                        <TableCell content={item.loaiDiem} />
                        {editIndex == index ? this.componentEdit(item) : <>
                            <TableCell content={item.phanTramMin} />
                            <TableCell content={item.phanTramMax} />
                            <TableCell content={item.phanTramMacDinh} />
                            <TableCell content={item.loaiLamTron} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' content={item}
                                onEdit={() => {
                                    if (editIndex == index) {
                                        this.saveEditData(item);
                                    }
                                    else this.setState({ editIndex: index });
                                }}
                                onDelete={() => this.deleteThanhPhan(item)}
                                permission={permission} />
                        </>}
                    </tr>))}

                {<tr style={{ display: dataDmLoaiDiem.length ? '' : 'none' }}>
                    <TableCell />
                    <TableCell colSpan={2} content={<FormSelect ref={e => this.maNew = e} data={dataDmLoaiDiem} required className='mb-0' placeholder='Thêm thành phần mới' />} />
                    <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMinNew = e} className='mb-0' value={0} required />} />
                    <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMaxNew = e} className='mb-0' value={0} required />} />
                    <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMacDinhNew = e} className='mb-0' value={0} required />} />
                    <TableCell content={<FormSelect ref={e => this.loaiLamTronNew = e} data={dataDiemLamTron} className='mb-0 input-group' required />} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <Tooltip title='Thêm'>
                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.newData()}>
                                <i className='fa fa-lg fa-plus' />
                            </button>
                        </Tooltip>
                    } />
                </tr>
                }
            </tbody>

        });
        return (<div className='tile'>{table}</div>);

    }
}


const mapStateToProps = state => ({ system: state.system, sdhDiemConfigThanhPhan: state.sdh.sdhDiemConfigThanhPhan });
const mapActionsToProps = { getSdhDiemConfigThanhPhanAll, getSdhDmLoaiDiemAll, updateSdhDiemThanhPhanItem, createSdhDiemThanhPhan, deleteSdhDiemThanhPhan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SdhDiemConfigThanhPhan);