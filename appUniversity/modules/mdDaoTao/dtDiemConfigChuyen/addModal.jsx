import React from 'react';
import { connect } from 'react-redux';
import { } from './redux';
import { AdminModal, TableCell, renderDataTable, FormTextBox, FormSelect, getValue } from 'view/component/AdminPage';
// import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_XepLoai } from 'modules/mdDaoTao/dtDiemDmXepLoai/redux';
import { createDtDiemChuyen } from './redux';

class AddModal extends AdminModal {

    state = { datas: {}, rows: {} }

    componentDidMount() {
        $(document).ready(() => {
            this.onHidden(this.onHide);
        });
    }

    onHide = () => {
        this.maThangDiem.value('');
        this.setState({ datas: {}, rows: {}, maThangDiem: null });
    }

    onShow = (item) => {
        let maThangDiem = item ? item.maThangDiem : null;
        if (maThangDiem) {
            let datas = {}, rows = {};
            let dataThangDiem = this.props.dataThangDiem.filter(i => i.maThangDiem == maThangDiem);
            dataThangDiem.sort((a, b) => parseFloat(a.min) - parseFloat(b.min));
            dataThangDiem.forEach((i, idx) => {
                let loaiHe = T.parse(i.loaiHe);
                let listHeDiem = {};
                this.props.listHeDiem.forEach(he => {
                    listHeDiem[`He:${he.id}`] = loaiHe[he.id];
                });
                datas[idx] = {
                    min: parseFloat(i.min),
                    max: parseFloat(i.max),
                    xepLoai: i.idXepLoai,
                    listHeDiem,
                };
                rows[idx] = {};
            });
            this.setState({ maThangDiem, datas, rows }, () => {
                this.maThangDiem.value(maThangDiem);
                dataThangDiem.forEach((i, idx) => {
                    rows[idx].min.value(i.min);
                    rows[idx].max.value(i.max);
                    rows[idx].xepLoai.value(i.idXepLoai);
                    let loaiHe = T.parse(i.loaiHe);
                    this.props.listHeDiem.forEach(he => {
                        rows[idx][`${he.id}:${he.giaTri}`].value(loaiHe[he.id]);
                    });
                });
            });
        }
    }

    onSubmit = () => {
        let maThangDiem = getValue(this.maThangDiem);
        let dataFull = Object.values(this.state.datas).filter(i => i.isDelete != 1);
        if (!dataFull.length) {
            T.notify('Chưa có thang điểm 10 nào!', 'danger');
            return;
        }
        for (let data of dataFull) {
            if (data.min == null || data.max == null || data.xepLoai == null) {
                T.notify('Vui lòng điền đầy đủ dữ liệu!', 'danger');
                return;
            } else {
                for (let he of this.props.listHeDiem) {
                    if (data.listHeDiem[`He:${he.id}`] == null) {
                        T.notify('Vui lòng điền đầy đủ dữ liệu!', 'danger');
                        return;
                    }
                }
            }
        }

        for (let data of dataFull) {
            if (data.min <= data.max) {
                let notDup = dataFull.filter(i => i.id != data.id).every(item => {
                    let { min: imin, max: imax } = item, { min, max } = data;
                    return imax <= min || imin >= max;
                });
                if (!notDup) {
                    T.notify('Khoảng thang điểm 10 bị trùng!', 'danger');
                    return;
                }
            } else {
                T.notify('Khoảng giá trị không hợp lệ!', 'danger');
                return;
            }
        }
        this.props.createDtDiemChuyen(maThangDiem, this.state.datas, this.hide);
    }

    reinitNewData = () => {
        ['minNew', 'maxNew', 'xepLoaiNew'].forEach(key => {
            this[key].value('');
        });
        this.props.listHeDiem.forEach((_, index) => {
            this[`giaTriNew${index}`].value('');
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

    handleHe = (e, he, index, done) => {
        let { datas, rows } = this.state, dataIdx = datas[index] || {}, rowIdx = rows[index];
        let value = '';
        if (he.giaTri) {
            value = e;
        } else {
            value = e.target.value;
        }
        this.setState({
            datas: {
                ...datas,
                [index]: {
                    ...dataIdx,
                    ['listHeDiem']: {
                        ...dataIdx['listHeDiem'], [`He:${he.id}`]: value,
                    },
                }
            }, rows: {
                ...rows,
                [index]: {
                    ...rowIdx, [`${he.id}:${he.giaTri}`]: null,
                }
            }
        }, () => {
            done && done();
        });
    }

    render = () => {
        let { listHeDiem } = this.props, width = 50 / (listHeDiem.length + 1);
        let { datas, rows } = this.state, list = Object.values(datas).filter(i => i.isDelete != 1);

        let table = renderDataTable({
            getDataSource: () => list,
            header: 'thead-light',
            stickyHead: false,
            multipleTbody: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thang điểm 10</th>
                    {listHeDiem.map((item, index) => (<th key={index} style={{ width: `${width}%`, whiteSpace: 'nowrap' }}>{item.ten}</th>))}
                    <th style={{ width: `${width}%`, whiteSpace: 'nowrap' }}>Xếp loại</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: <tbody>
                {list.map((item, index) => (
                    <tr key={index}>
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                        <TableCell content={<div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div className='col-md-1'>Từ</div> <FormTextBox ref={e => rows[index].min = e} type='number' min={0} max={10} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} value={item.min} onChange={e => this.setEditState(index, 'min', e, this.reinitNewData)} />
                            <div className='col-md-1'>Đến dưới</div> <FormTextBox ref={e => rows[index].max = e} type='number' min={0} max={10} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} value={item.max} onChange={e => this.setEditState(index, 'max', e, this.reinitNewData)} /> </div>
                        } />
                        {listHeDiem.map((he, idx) => (
                            <TableCell key={idx} content={<FormTextBox ref={e => rows[index][`${he.id}:${he.giaTri}`] = e} type={he.giaTri ? 'number' : 'text'} min={0} max={parseFloat(he.giaTri)} className='mb-0' value={datas[index]['listHeDiem'] ? datas[index]['listHeDiem'][`He:${he.id}`] : ''} required step={0.5} decimalScale={2} allowNegative={false} onChange={e => this.handleHe(e, he, index, this.reinitNewData)} />} />
                        ))}
                        <TableCell content={<FormSelect ref={e => rows[index].xepLoai = e} className='mb-0' data={SelectAdapter_XepLoai} required value={item.xepLoai} onChange={e => this.setEditState(index, 'xepLoai', e.id, this.reinitNewData)} />} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' content={item}
                            onDelete={() => this.deleteState(index)}
                            permission={{ delete: true }} />
                    </tr>
                ))}
                <tr>
                    <TableCell />
                    <TableCell content={<div className='d-flex align-items-center'>
                        <label className='col-md-1'>Từ</label> <FormTextBox className='mb-0 col-md-5' type='number' min={0} max={10} ref={e => this.minNew = e} required step={0.5} decimalScale={2} allowNegative={false} onChange={e => this.setEditState(list.length, 'min', e, this.reinitNewData)} />
                        <label className='col-md-1'>Đến dưới</label> <FormTextBox style={{ width: '80px' }} type='number' min={0} max={10} ref={e => this.maxNew = e} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} onChange={e => this.setEditState(list.length, 'max', e, this.reinitNewData)} />
                    </div>
                    } />
                    {listHeDiem.map((item, index) => (
                        <TableCell key={index} content={<FormTextBox ref={e => this[`giaTriNew${index}`] = e} type={item.giaTri ? 'number' : 'text'} min={0} max={parseFloat(item.giaTri)} className='mb-0' required step={0.5} decimalScale={2} allowNegative={false} onChange={e => this.handleHe(e, item, list.length, this.reinitNewData)} />} />
                    ))}
                    <TableCell content={<FormSelect ref={e => this.xepLoaiNew = e} className='mb-0' data={SelectAdapter_XepLoai} required onChange={e => this.setEditState(list.length, 'xepLoai', e.id, this.reinitNewData)} />} />
                </tr>
            </tbody>
        });

        return this.renderModal({
            title: 'Tạo mới thang điểm',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox ref={e => this.maThangDiem = e} disabled={this.state.maThangDiem} label='Mã thang điểm' className='col-md-12' required />
                <div className='col-md-12'>
                    {table}
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDtDiemChuyen };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);