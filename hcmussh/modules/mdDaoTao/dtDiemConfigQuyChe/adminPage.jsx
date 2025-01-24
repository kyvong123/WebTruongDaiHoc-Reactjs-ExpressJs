import React from 'react';
import { connect } from 'react-redux';
import { getDtDiemQuyCheAll, createDtDiemQuyChe, updateDtDiemQuyCheItem, deleteDtDiemQuyCheItem } from './redux';
import { AdminPage, TableCell, renderTable, FormSelect, getValue } from 'view/component/AdminPage';
import { getDtDiemDacBietAll } from 'modules/mdDaoTao/dtDiemDacBiet/redux';
import { getDtDmLoaiDiemAll } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';
import { Tooltip } from '@mui/material';


class DtDiemQuyChePage extends AdminPage {

    rows = {};
    state = { datas: {}, dataDiemDacBiet: [], listHe: [] };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtDmLoaiDiemAll(data => {
                let listHe = data.filter(i => i.isThi && i.kichHoat);
                listHe = listHe.map(i => ({ id: i.ma, text: i.ten }));
                this.setState({ listHe });
            });
            this.props.getDtDiemQuyCheAll(this.props.semester, this.filterDataDiemDacBiet);
        });
    }

    filterDataDiemDacBiet = () => {
        let diemDacBiet = (this.props.diemQuyChe?.items || []).map(item => item.ma);
        this.props.getDtDiemDacBietAll(items => {
            this.setState({ dataDiemDacBiet: items.filter(item => item.kichHoat && !diemDacBiet.includes(item.ma)).map(item => ({ id: item.ma, text: item.moTa })) }, () => this.maNew?.value(''));
        });
    }

    saveEditData = (item, newId) => {
        if (item) {
            try {
                let changes = {};
                // changes['tinhTinChi'] = Number(getValue(this['tinhTinChi']));
                // changes['tinhTrungBinh'] = Number(getValue(this['tinhTrungBinh']));
                changes['loaiApDung'] = getValue(this['loaiApDung']).join(', ');

                this.props.updateDtDiemQuyCheItem(item.id, changes, this.props.semester, () => {
                    this.setState({ idEdit: newId });
                });
            } catch (error) {
                console.error(error);
                error && T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
            }
        } else {
            try {
                let data = {};
                ['ma'].forEach(key => {
                    data[key] = getValue(this[key + 'New']);
                });
                // data['tinhTinChi'] = Number(getValue(this['tinhTinChiNew']));
                // data['tinhTrungBinh'] = Number(getValue(this['tinhTrungBinhNew']));

                data['loaiApDung'] = getValue(this['loaiApDungNew']).join(', ');

                this.props.createDtDiemQuyChe(this.props.semester, data, () => {
                    this.filterDataDiemDacBiet();
                    ['ma', 'loaiApDung'].forEach(key => {
                        this[key + 'New'].value('');
                    });
                });
            } catch (error) {
                console.error(error);
                error && T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
            }
        }
    }

    componentEdit = (item) => <>
        {/* <TableCell content={<FormCheckbox ref={e => this.tinhTinChi = e} className='mb-0' value={item.tinhTinChi} />} />
        <TableCell content={<FormCheckbox ref={e => this.tinhTrungBinh = e} className='mb-0' value={item.tinhTrungBinh} />} /> */}
        <TableCell content={<FormSelect ref={e => this.loaiApDung = e} className='mb-0' data={this.state.listHe} multiple allowClear value={item.loaiApDung ? item.loaiApDung.split(', ') : []} required />} />
        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
            <Tooltip title='Lưu'>
                <button className='btn btn-success' onClick={e => e.preventDefault() || this.saveEditData(item)}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </Tooltip>
        } />
    </>


    render() {
        let list = this.props.diemQuyChe ? this.props.diemQuyChe.items : [],
            { idEdit, dataDiemDacBiet } = this.state, isEmpty = false;

        if (!list.length || !Object.keys(list[0]).length) {
            list = [{}];
            isEmpty = true;
        }

        let table = renderTable({
            getDataSource: () => list,
            header: 'thead-light',
            stickyHead: list.length > 20,
            multipleTbody: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mô tả</th>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tính tín chỉ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tính trung bình</th> */}
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Loại áp dụng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: <tbody>
                {!isEmpty && list.map((item, index) => <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.moTa} />

                    {idEdit == item.id ? this.componentEdit(item) :
                        <>
                            {/* <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinhTinChi ? <i className='fa fa-fw fa-lg fa-check' /> : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinhTrungBinh ? <i className='fa fa-fw fa-lg fa-check' /> : ''} /> */}
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.loaiApDung} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' content={item}
                                onEdit={() => {
                                    if (idEdit) {
                                        this.saveEditData(list.find(i => i.id == idEdit), item.id);
                                    }
                                    else this.setState({ idEdit: item.id });
                                }}
                                onDelete={() => this.props.deleteDtDiemQuyCheItem(item.id, this.props.semester, () => this.filterDataDiemDacBiet())}
                                permission={{ write: true, delete: true }} />
                        </>
                    }
                </tr>)}
                <tr style={{ display: dataDiemDacBiet.length ? '' : 'none' }}>
                    <TableCell />
                    <TableCell colSpan={2} content={<FormSelect ref={e => this.maNew = e} data={dataDiemDacBiet} required className='mb-0' placeholder='Thêm loại điểm đặc biệt mới' />} />
                    {/* <TableCell content={<FormCheckbox ref={e => this.tinhTinChiNew = e} className='mb-0' value={0} />} />
                    <TableCell content={<FormCheckbox ref={e => this.tinhTrungBinhNew = e} className='mb-0' value={0} />} /> */}
                    <TableCell content={<FormSelect ref={e => this.loaiApDungNew = e} data={this.state.listHe} multiple allowClear required className='mb-0' placeholder='Thêm loại điểm áp dụng' />} />
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

const mapStateToProps = state => ({ system: state.system, diemQuyChe: state.daoTao.diemQuyChe });
const mapActionsToProps = { getDtDiemQuyCheAll, createDtDiemQuyChe, updateDtDiemQuyCheItem, deleteDtDiemQuyCheItem, getDtDiemDacBietAll, getDtDmLoaiDiemAll };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemQuyChePage);