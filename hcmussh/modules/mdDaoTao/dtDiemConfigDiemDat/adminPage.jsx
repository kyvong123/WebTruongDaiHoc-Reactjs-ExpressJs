import React from 'react';
import { connect } from 'react-redux';
import { getDiemConfigDat, updateDiemSemesterDat, createDtDiemConfigDat, updateDtDiemConfigDat, deleteDtDiemConfigDat } from './redux';
import { AdminPage, FormTextBox, getValue, renderTable, TableCell, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import { Tooltip } from '@mui/material';


class DtDiemDatPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDiemConfigDat(this.props.semester);
        });
    }

    updateDiemDat = () => {
        const diemDat = getValue(this.diemDat);
        this.props.updateDiemSemesterDat(this.props.semester.idSemester, diemDat);
    }

    saveEditData = (item, newId) => {
        if (item) {
            try {
                let changes = {};
                changes['diemDat'] = getValue(this['diemDat']);

                this.props.updateDtDiemConfigDat(item.id, changes, this.props.semester, () => {
                    this.setState({ idEdit: newId });
                });
            } catch (error) {
                console.error(error);
                error && T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
            }
        } else {
            try {
                let data = {},
                    list = this.props.diemDat ? this.props.diemDat.configDiemDat : [];
                ['maMonHoc', 'diemDat'].forEach(key => {
                    data[key] = getValue(this[key + 'New']);
                });

                if (list.find(i => i.maMonHoc == data.maMonHoc)) {
                    T.notify('Môn học đã được cấu hình điểm đạt trong học kỳ!', 'danger');
                    return;
                }

                this.props.createDtDiemConfigDat(this.props.semester, data, () => {
                    ['maMonHoc', 'diemDat'].forEach(key => {
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
        <TableCell content={<FormTextBox ref={e => this.diemDat = e} value={item.diemDat} required className='mb-0' type='number' allowNegative={false} step={0.1} decimalScale={1} placeholder='Điểm đạt' min={0} max={10} />} />
        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
            <Tooltip title='Lưu'>
                <button className='btn btn-success' onClick={e => e.preventDefault() || this.saveEditData(item)}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </Tooltip>
        } />
    </>

    render() {
        let list = this.props.diemDat ? this.props.diemDat.configDiemDat : [],
            { idEdit } = this.state, isEmpty = false;

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
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã môn học</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn học</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm đạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: <tbody>
                {!isEmpty && list.map((item, index) => <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maMonHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />

                    {idEdit == item.id ? this.componentEdit(item) :
                        <>
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemDat} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' content={item}
                                onEdit={() => {
                                    if (idEdit) {
                                        this.saveEditData(list.find(i => i.id == idEdit), item.id);
                                    }
                                    else this.setState({ idEdit: item.id });
                                }}
                                onDelete={() => this.props.deleteDtDiemConfigDat(item.id, this.props.semester)}
                                permission={{ write: true, delete: true }} />
                        </>
                    }
                </tr>)}
                <tr>
                    <TableCell />
                    <TableCell colSpan={2} content={<FormSelect ref={e => this.maMonHocNew = e} data={SelectAdapter_DmMonHocAll()} required className='mb-0' placeholder='Thêm môn học mới' />} />
                    <TableCell content={<FormTextBox ref={e => this.diemDatNew = e} required className='mb-0' type='number' allowNegative={false} step={0.1} decimalScale={1} placeholder='Điểm đạt' min={0} max={10} />} />
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
                <div className='row'>
                    <FormTextBox label='Điểm đạt theo năm học và học kỳ' className='col-md-8' ref={e => this.diemDat = e} value={this.props.diemDat?.diemSemester || ''} type='number' allowNegative={false} step={0.1} decimalScale={1} min={0} max={10} />
                    <button className='btn btn-success col-md-2' style={{ margin: '2.1% 10px auto 10px' }} onClick={e => e && e.preventDefault() || this.updateDiemDat()}> <i className='fa fa-save' />Cập nhập điểm đạt</button>
                </div>
            </div>
            <div className='tile'>
                {table}
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, diemDat: state.daoTao.diemDat });
const mapActionsToProps = { updateDiemSemesterDat, getDiemConfigDat, createDtDiemConfigDat, updateDtDiemConfigDat, deleteDtDiemConfigDat };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemDatPage);