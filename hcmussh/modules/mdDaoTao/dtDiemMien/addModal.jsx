import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, renderDataTable, TableCell, TableHead, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmMonHoc } from 'modules/mdDaoTao/dmMonHoc/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { addDtDiemMien } from './redux';
class AddModal extends AdminModal {
    state = { listMaMonHoc: [], mssv: null, selectedStu: false }
    namHoc = {}
    hocKy = {}
    onShow = () => {
        this.sinhVien.value('');
        this.maMonHoc.value('');
        this.setState({ listMaMonHoc: [], mssv: null, selectedStu: false });
    };

    getListMonHoc = (item) => {
        let value = this.maMonHoc.value();
        this.setState({ listMaMonHoc: value }, () => {
            if (item.selected) {
                this.namHoc[item.id].value('');
                this.hocKy[item.id].value('');
            }
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        let { listMaMonHoc, mssv } = this.state,
            list = [],
            check = true;
        for (let maMonHoc of listMaMonHoc) {
            let data = {
                mssv, maMonHoc,
                namHoc: this.namHoc[maMonHoc].value(),
                hocKy: this.hocKy[maMonHoc].value(),
            };
            if (data.namHoc == null) {
                check = false;
                T.notify('Chưa chọn năm học!', 'danger');
                this.namHoc[maMonHoc].focus();
                break;
            } else if (data.hocKy == null) {
                check = false;
                T.notify('Chưa chọn học kỳ!', 'danger');
                this.hocKy[maMonHoc].focus();
                break;
            } else list.push(data);
        }
        if (check) {
            this.props.addDtDiemMien(list, () => {
                this.hide();
                this.setState({ listMaMonHoc: [], mssv: null, selectedStu: false }, () => {
                    this.namHoc = {};
                    this.hocKy = {};
                });
            });
        }
    }

    render = () => {
        let { selectedStu, listMaMonHoc } = this.state;
        let table = renderDataTable({
            emptyTable: 'Không tìm thấy môn học',
            data: listMaMonHoc,
            header: 'thead-light',
            stickyHead: listMaMonHoc && listMaMonHoc.length > 9 ? true : false,
            divStyle: { height: '40vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã môn học' />
                    <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>

                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} >
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormSelect style={{ marginBottom: '0' }} ref={e => this.namHoc[item] = e} data={SelectAdapter_SchoolYear} placeholder='Năm học' />} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormSelect style={{ marginBottom: '0' }} ref={e => this.hocKy[item] = e} data={SelectAdapter_DtDmHocKy} placeholder='Học kỳ' />} />

                    </tr >
                );
            }
        });
        return this.renderModal({
            title: 'Cập nhật điểm miễn sinh viên',
            size: 'elarge',
            body:
                <>
                    <div className='row'>
                        <FormSelect ref={e => this.sinhVien = e} className='col-md-12' label='Chọn sinh viên' data={SelectAdapter_FwStudent} required
                            onChange={value => this.setState({ mssv: value.id, selectedStu: true })} />
                    </div>
                    <div className='row' style={{ display: selectedStu ? '' : 'none' }}>
                        <FormSelect ref={e => this.maMonHoc = e} className='col-md-12' label='Chọn môn học' data={SelectAdapter_DmMonHoc} required multiple
                            onChange={(value) => this.getListMonHoc(value)} />
                        <div className='col-md-12'>
                            {table}
                        </div>

                    </div>

                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    addDtDiemMien
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);