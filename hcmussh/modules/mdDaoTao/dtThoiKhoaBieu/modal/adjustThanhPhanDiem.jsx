import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_ThanhPhanFilter } from 'modules/mdDaoTao/dtDiemConfigThanhPhan/redux';
import { UpdateThanhPhanDiem } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';


const dataDiemLamTron = ['0.1', '0.01', '0.5'];
class AdjustThanhPhanDiem extends AdminModal {
    state = { listDiem: [] }

    diem = {};
    loaiLamTron = {}

    componentDidMount() {
        this.onHidden(() => {
            this.diem = {};
            this.setState({ listDiem: [] });
        });
    }

    onShow = (item) => {
        let dataThanhPhanDiem = item ? item.dataThanhPhanDiem : [];
        this.setState({ listDiem: dataThanhPhanDiem }, () => {
            let loaiDiem = dataThanhPhanDiem.map(e => e.loaiThanhPhan);
            this.loaiDiem.value(loaiDiem);
            for (let diem of dataThanhPhanDiem) {
                this.diem[diem.loaiThanhPhan].value(diem.phanTram);
                this.loaiLamTron[diem.loaiThanhPhan].value(diem.loaiLamTron);
            }
        });
    }

    onSubmit = () => {
        let { listDiem } = this.state;
        if (listDiem.some(i => i.phanTram == null || i.phanTram == '')) {
            T.notify('Vui lòng điền đầy đủ dữ liệu phần trăm điểm!', 'danger');
            return;
        }

        for (const tp of listDiem) {
            const { phanTram, phanTramMax, phanTramMin, tenThanhPhan } = tp;
            if (parseInt(phanTramMax) < phanTram || parseInt(phanTramMin) > phanTram) {
                T.notify(`Phần trăm điểm của thành phần ${tenThanhPhan} vượt quá khoảng quy định!`, 'danger');
                return;
            }
        }

        let sum = listDiem.reduce((x, y) => { return x + y.phanTram; }, 0);
        if (sum != 100) {
            T.notify('Tổng phần trăm điểm phải là 100%', 'danger');
            return;
        }

        T.alert('Đang cập nhật thành phần điểm!', 'warning', false, null, true);
        this.props.UpdateThanhPhanDiem(this.props.dataHocPhan, listDiem, () => {
            this.hide();
            this.props.setData([this.props.dataHocPhan], () => T.alert('Cập nhật thành công!', 'success', false, 500));
        });
    }

    handleLoaiDiem = (value) => {
        if (value) {
            let { listDiem } = this.state;
            if (value.selected) {
                let thanhPhan = this.props.dataThanhPhan.find(i => i.loaiThanhPhan == value.id);
                let data = {
                    loaiThanhPhan: value.id,
                    tenThanhPhan: value.text,
                    phanTram: '',
                    loaiLamTron: 0.5,
                    phanTramMax: thanhPhan?.phanTramMax || 100,
                    phanTramMin: thanhPhan?.phanTramMin || 0,
                };
                listDiem.push(data);
            } else listDiem = listDiem.filter(e => e.loaiThanhPhan != value.id);
            this.setState({ listDiem });
        }
    }

    handleChange = (value, item) => {
        let { listDiem } = this.state;
        let index = listDiem.findIndex(tp => tp.loaiThanhPhan == item.loaiThanhPhan);
        listDiem[index].phanTram = value;
        this.setState({ listDiem });
    }

    loaiDiemConfigTable = (list) => {
        return renderTable({
            getDataSource: () => list,
            header: 'thead-light',
            emptyTable: '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên thành phần điểm</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Khoảng phần trăm cho phép</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Phần trăm</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại làm tròn</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.loaiThanhPhan} />
                    <TableCell content={item.tenThanhPhan} />
                    <TableCell style={{ width: 'auto%', whiteSpace: 'nowrap' }} content={`Từ ${item.phanTramMin}% đến ${item.phanTramMax}%`} />
                    <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' suffix='%' style={{ marginBottom: '0' }} ref={e => this.diem[item.loaiThanhPhan] = e} placeholder='Phần trăm' required allowNegative={false} onChange={e => this.handleChange(e, item)} value={item.phanTram} />} />
                    <TableCell content={<FormSelect ref={e => this.loaiLamTron[item.loaiThanhPhan] = e} data={dataDiemLamTron} className='mb-0' onChange={(value) => item.loaiLamTron = value.id} required />} />
                </tr>;
            }
        });
    }

    render = () => {
        let { listDiem } = this.state, { namHoc, hocKy } = this.props.dataHocPhan || { namHoc: '', hocKy: '' };

        return this.renderModal({
            title: 'Cấu hình thành phần điểm',
            size: 'large',
            body: <div>
                <FormSelect className='col-md-12' ref={e => this.loaiDiem = e} data={SelectAdapter_ThanhPhanFilter({ namHoc, hocKy })} multiple label='Thành phần điểm' onChange={this.handleLoaiDiem} required />

                <div className='col-md-12'>
                    {this.loaiDiemConfigTable(listDiem)}
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, });
const mapActionsToProps = {
    UpdateThanhPhanDiem
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AdjustThanhPhanDiem);