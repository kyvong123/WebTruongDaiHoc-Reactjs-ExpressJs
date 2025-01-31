import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTextBox, FormSelect, renderDataTable, TableCell, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import { createNhomTuongDuong } from './redux';

class AddModal extends AdminModal {

    state = { datas: {}, rows: {} }

    componentDidMount() {
        $(document).ready(() => {
            this.onHidden(this.onHide);
        });
    }

    onHide = () => {
        this.maNhom.value('');
        this.setState({ datas: {}, rows: {}, maNhom: null });
    }

    onShow = (item) => {
        let maNhom = item ? item.maNhom : null,
            datas = {}, rows = {};
        if (maNhom) {
            const nhomDataMon = this.props.tuongDuong.nhomData.filter(i => i.maNhom == maNhom);
            nhomDataMon.forEach((i, idx) => {
                datas[idx] = {
                    maMon: i.maMon,
                    maMonTuongDuong: i.maMonTuongDuong,
                };
                rows[idx] = {};
            });
            this.setState({ maNhom, datas, rows }, () => {
                this.maNhom.value(maNhom);
                nhomDataMon.forEach((i, idx) => {
                    rows[idx].maMon.value(i.maMon);
                    rows[idx].maMonTuongDuong.value(i.maMonTuongDuong);
                });
            });
        }
    }

    onSubmit = () => {
        let maNhom = getValue(this.maNhom);
        let dataFull = Object.values(this.state.datas).filter(i => i.isDelete != 1);
        if (!dataFull.length) {
            return T.notify('Chưa có môn tương đương nào!', 'danger');
        }

        for (let data of dataFull) {
            if (data.maMon == null || data.maMonTuongDuong == null) {
                return T.notify('Vui lòng điền đầy đủ dữ liệu!', 'danger');
            }
        }

        if (dataFull.find(i => i.maMon == i.maMonTuongDuong)) return T.notify('Trùng môn gốc và môn tương đương!', 'danger');

        for (let data of dataFull) {
            let duplicate = dataFull.filter(i => i.id != data.id).find(i => i.maMon == data.maMon && i.maMonTuongDuong == data.maMonTuongDuong);
            if (duplicate) return T.notify(`Trùng dữ liệu môn ${data.maMon} và môn tương đương ${data.maMonTuongDuong}`, 'danger');
        }

        T.alert('Đang cập nhật nhóm tương đương. Vui lòng chờ trong giây lát!', 'info', false, null, true);
        this.props.createNhomTuongDuong(maNhom, dataFull, () => {
            T.alert('Cập nhật nhóm tương đương thành công', 'success', true, 5000);
        });
    }

    deleteState = (idx) => {
        let { datas } = this.state, dataIdx = datas[idx];
        this.setState({
            datas: {
                ...datas,
                [idx]: {
                    ...dataIdx, id: idx, isDelete: 1,
                }
            }
        });
    }

    reinitNewData = () => {
        ['maMonNew', 'maMonTuongDuongNew'].forEach(key => {
            this[key].value('');
        });
    }

    setEditState = (idx, key, value, done) => {
        let { datas, rows } = this.state, dataIdx = datas[idx], rowIdx = rows[idx];
        this.setState({
            datas: {
                ...datas,
                [idx]: {
                    ...dataIdx, [key]: value, id: idx
                }
            }, rows: {
                ...rows,
                [idx]: {
                    ...rowIdx, [key]: null,
                }
            }
        }, () => {
            done && done();
        });
    }

    render = () => {
        let { datas, rows } = this.state, list = Object.values(datas).filter(i => i.isDelete != 1);

        let table = renderDataTable({
            getDataSource: () => list,
            header: 'thead-light',
            stickyHead: false,
            multipleTbody: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Môn học gốc</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Môn học tương đương</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: <tbody>
                {list.map((item, index) => (
                    <tr key={index}>
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                        <TableCell content={<FormSelect ref={e => rows[index].maMon = e} className='mb-0' data={SelectAdapter_DmMonHocAll()} required value={item.maMon} onChange={e => this.setEditState(index, 'maMon', e.id, this.reinitNewData)} />} />
                        <TableCell content={<FormSelect ref={e => rows[index].maMonTuongDuong = e} className='mb-0' data={SelectAdapter_DmMonHocAll()} required value={item.maMonTuongDuong} onChange={e => this.setEditState(index, 'maMonTuongDuong', e.id, this.reinitNewData)} />} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' content={item}
                            onDelete={() => this.deleteState(index)}
                            permission={{ delete: true }} />
                    </tr>
                ))}
                <tr>
                    <TableCell />
                    <TableCell content={<FormSelect ref={e => this.maMonNew = e} className='mb-0' data={SelectAdapter_DmMonHocAll()} required onChange={e => this.setEditState(list.length, 'maMon', e.id, this.reinitNewData)} />} />
                    <TableCell content={<FormSelect ref={e => this.maMonTuongDuongNew = e} className='mb-0' data={SelectAdapter_DmMonHocAll()} required onChange={e => this.setEditState(list.length, 'maMonTuongDuong', e.id, this.reinitNewData)} />} />
                </tr>
            </tbody>
        });

        return this.renderModal({
            title: 'Tạo mới nhóm tương đương',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox ref={e => this.maNhom = e} disabled={this.state.maNhom} label='Mã nhóm tương đương' className='col-md-12' required />
                <div className='col-md-12'>
                    {table}
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tuongDuong: state.daoTao.tuongDuong });
const mapActionsToProps = { createNhomTuongDuong };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);