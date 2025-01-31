import React from 'react';
import { connect } from 'react-redux';
import { getDtDiemThanhPhanAll, createDtDiemThanhPhan, updateDtDiemThanhPhanItem, deleteDtDiemThanhPhanItem } from './redux';
import { getDtDmLoaiDiemAll } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';
import { AdminPage, TableCell, renderDataTable, FormTextBox, FormSelect, getValue, FormCheckbox } from 'view/component/AdminPage';
// import { SelectAdapter_LoaiDiem } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';
import { Tooltip } from '@mui/material';

const dataDiemLamTron = ['0.1', '0.01', '0.5'];

class DtDiemThanhPhanPage extends AdminPage {

    rows = {};
    state = { datas: {}, dataDmLoaiDiem: [] };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {

            this.props.getDtDiemThanhPhanAll(this.props.semester, () => {
                this.filterDataDmLoaiThanhPhan();
            });
        });
    }

    filterDataDmLoaiThanhPhan = () => {
        let diemThanhPhan = (this.props.diemThanhPhan?.items || []).map(item => item.ma);
        this.props.getDtDmLoaiDiemAll(items => {
            this.setState({ dataDmLoaiDiem: items.filter(item => item.kichHoat && !diemThanhPhan.includes(item.ma)).map(item => ({ id: item.ma, text: item.ma + ': ' + item.ten })) }, () => this.maNew?.value(''));
        });
    }

    saveEditData = (item, newId) => {
        if (item) {
            try {
                let changes = {};
                ['phanTramMin', 'phanTramMax', 'phanTramMacDinh', 'loaiLamTron', 'isLock'].forEach(key => {
                    changes[key] = Number(getValue(this[key]));
                });

                let { phanTramMacDinh, phanTramMin, phanTramMax } = changes;
                if (phanTramMacDinh < phanTramMin || phanTramMacDinh > phanTramMax) {
                    T.notify('Phần trăm mặc định phải nằm trong khoảng cho phép!', 'danger');
                    return;
                }

                let list = this.props.diemThanhPhan.items.filter(i => i.id != item.id);
                let sum = list.reduce((x, y) => { return x + parseInt(y.phanTramMacDinh); }, 0);
                if ((sum + parseInt(phanTramMacDinh)) != 100) {
                    T.notify('Tổng phần trăm điểm phải là 100%', 'warning');
                }

                this.props.updateDtDiemThanhPhanItem(item.id, changes, this.props.semester, () => {
                    this.setState({ idEdit: newId });
                });
            } catch (error) {
                error && T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
            }
        } else {
            try {
                let data = {};
                ['ma', 'phanTramMin', 'phanTramMax', 'phanTramMacDinh', 'loaiLamTron', 'isLock'].forEach(key => {
                    data[key] = getValue(this[key + 'New']);
                });
                data.isLock = Number(data.isLock);

                let { phanTramMacDinh, phanTramMin, phanTramMax } = data;
                if (Number(phanTramMacDinh) < Number(phanTramMin) || Number(phanTramMacDinh) > Number(phanTramMax)) {
                    T.notify('Phần trăm mặc định phải nằm trong khoảng cho phép!', 'danger');
                    return;
                }

                let sum = this.props.diemThanhPhan.items.reduce((x, y) => { return x + parseInt(y.phanTramMacDinh); }, 0);
                if ((sum + parseInt(phanTramMacDinh)) != 100) {
                    T.notify('Tổng phần trăm điểm phải là 100%', 'warning');
                }

                this.props.createDtDiemThanhPhan(this.props.semester, data, () => {
                    this.filterDataDmLoaiThanhPhan();
                    ['ma', 'phanTramMin', 'phanTramMax', 'phanTramMacDinh', 'loaiLamTron', 'isLock'].forEach(key => {
                        this[key + 'New'].value((key == 'ma' || key == 'loaiLamTron') ? '' : 0);
                    });
                });
            } catch (error) {
                error && T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
            }
        }
    }

    componentEdit = (item) => <>
        <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMin = e} className='mb-0' value={item.phanTramMin} required />} />
        <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMax = e} className='mb-0' value={item.phanTramMax} required />} />
        <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMacDinh = e} className='mb-0' value={item.phanTramMacDinh} required />} />
        <TableCell content={<FormSelect className='mb-0' ref={e => this.loaiLamTron = e} data={dataDiemLamTron} value={item.loaiLamTron} required />} />
        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<FormCheckbox isSwitch ref={e => this.isLock = e} value={item.isLock} permission={{ write: true }} className='mb-0' />} />
        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
            <Tooltip title='Lưu'>
                <button className='btn btn-success' onClick={e => e.preventDefault() || this.saveEditData(item)}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </Tooltip>
        } />
    </>

    handleLock = (value, item) => {
        this.props.updateDtDiemThanhPhanItem(item.id, { isLock: Number(value) }, this.props.semester);
    }

    render() {
        let list = this.props.diemThanhPhan ? this.props.diemThanhPhan.items : [],
            { idEdit, dataDmLoaiDiem } = this.state, isEmpty = false;

        if (!list.length || !Object.keys(list[0]).length) {
            list = [{}];
            isEmpty = true;
        }

        let table = renderDataTable({
            data: list,
            header: 'thead-light',
            // divStyle: { position: 'relative' },
            // stickyHead: list.length > 20,
            multipleTbody: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã thành phần</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Thành phần điểm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phần trăm tối thiểu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phần trăm tối đa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phần trăm mặc định</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Làm tròn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khóa chỉnh sửa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: <tbody>
                {!isEmpty && list.map((item, index) => <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiDiem} />
                    {idEdit == item.id ? this.componentEdit(item) :
                        <>
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phanTramMin} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phanTramMax} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phanTramMacDinh} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.loaiLamTron} />
                            <TableCell type='checkbox' content={item.isLock} permission={{ write: true }} onChanged={value => this.handleLock(value, item)} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' content={item}
                                onEdit={() => {
                                    if (idEdit) {
                                        this.saveEditData(list.find(i => i.id == idEdit), item.id);
                                    }
                                    else this.setState({ idEdit: item.id });
                                }}
                                onDelete={() => this.props.deleteDtDiemThanhPhanItem(item.id, this.props.semester, () => this.filterDataDmLoaiThanhPhan())}
                                permission={{ write: true, delete: true }} />
                        </>}
                </tr>)}
                <tr style={{ display: dataDmLoaiDiem.length ? '' : 'none' }}>
                    <TableCell />
                    <TableCell colSpan={2} content={<FormSelect ref={e => this.maNew = e} data={dataDmLoaiDiem} required className='mb-0' placeholder='Thêm thành phần mới' />} />
                    <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMinNew = e} className='mb-0' value={0} required />} />
                    <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMaxNew = e} className='mb-0' value={0} required />} />
                    <TableCell content={<FormTextBox type='number' suffix='%' ref={e => this.phanTramMacDinhNew = e} className='mb-0' value={0} required />} />
                    <TableCell content={<FormSelect ref={e => this.loaiLamTronNew = e} data={dataDiemLamTron} className='mb-0 input-group' required />} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<FormCheckbox isSwitch ref={e => this.isLockNew = e} permission={{ write: true }} className='mb-0' />} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <Tooltip title='Thêm'>
                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.saveEditData()}>
                                <i className='fa fa-lg fa-plus' />
                            </button>
                        </Tooltip>
                    } />
                </tr>
            </tbody>
        });

        return <>
            <div className='tile'>
                {table}
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, diemThanhPhan: state.daoTao.diemThanhPhan });
const mapActionsToProps = { getDtDiemThanhPhanAll, createDtDiemThanhPhan, getDtDmLoaiDiemAll, updateDtDiemThanhPhanItem, deleteDtDiemThanhPhanItem };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemThanhPhanPage);