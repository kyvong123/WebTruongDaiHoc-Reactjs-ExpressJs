import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';
import { getDtDiemThanhPhanAll } from 'modules/mdDaoTao/dtDiemConfigThanhPhan/redux';
import { gvLichGiangDayUpdateTiLeDiem } from './redux';

class AdjustThanhPhanDiem extends AdminModal {

    state = { listDiem: [], listThanhPhanAll: {} }

    diem = {};
    loaiLamTron = {}

    componentDidMount() {
        this.onHidden(() => {
            this.diem = {};
            this.setState({ listDiem: [] });
        });
    }

    onShow = (item) => {
        let dataThanhPhanDiem = item ? item.dataThanhPhanDiem : [],
            { namHoc, hocKy } = this.props.dataHocPhan || { namHoc: '', hocKy: '' };

        this.props.getDtDiemThanhPhanAll({ namHoc, hocKy }, listThanhPhanAll => {
            this.setState({ listDiem: dataThanhPhanDiem, listThanhPhanAll: listThanhPhanAll.sort((a, b) => a.phanTramMacDinh - b.phanTramMacDinh) });
        });
    }

    onSubmit = () => {
        let { listThanhPhanAll } = this.state,
            listDiem = listThanhPhanAll.map(tp => {
                let { ma, phanTramMax, phanTramMin, loaiLamTron, loaiDiem, priority } = tp,
                    phanTram = this.diem[ma].value();
                return { phanTram, loaiThanhPhan: ma, phanTramMax, phanTramMin, loaiLamTron, tenThanhPhan: loaiDiem, priority };
            });

        listDiem = listDiem.filter(i => i.phanTram);
        if (!listDiem.find(i => i.loaiThanhPhan == 'CK')) return T.notify('Thành phần điểm phải có cuối kỳ!', 'danger');

        for (const tp of listDiem) {
            const { phanTram, phanTramMax, phanTramMin, tenThanhPhan } = tp;
            if (parseInt(phanTramMax) < phanTram || parseInt(phanTramMin) > phanTram) {
                return T.notify(`Phần trăm điểm của thành phần ${tenThanhPhan} không nằm trong khoảng quy định!`, 'danger');
            }
        }

        let sum = listDiem.reduce((x, y) => x + Number(y.phanTram), 0);
        if (sum != 100) return T.notify('Tổng phần trăm điểm phải là 100%', 'danger');

        T.alert('Đang cập nhật thành phần điểm!', 'warning', false, null, true);
        this.props.gvLichGiangDayUpdateTiLeDiem(this.props.dataHocPhan, listDiem, allRole => {
            this.hide();
            this.props.handleSetData(() => T.alert('Cập nhật thành công!', 'success', false, 500), allRole);
        });
    }

    render = () => {
        let { listDiem, listThanhPhanAll } = this.state;

        const loaiDiemConfigTable = (list) => {
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
                    let { phanTram, isLock } = listDiem.find(i => i.loaiThanhPhan == item.ma) || { phanTram: '', isLock: 0 };
                    return <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell content={item.ma} />
                        <TableCell content={item.loaiDiem} />
                        <TableCell style={{ width: 'auto%', whiteSpace: 'nowrap' }} content={`Từ ${item.phanTramMin}% đến ${item.phanTramMax}%`} />
                        <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' ref={e => this.diem[item.ma] = e} suffix='%' style={{ marginBottom: '0' }} placeholder='Phần trăm' allowNegative={false} value={phanTram} disabled={isLock} />} />
                        <TableCell style={{ textAlign: 'center' }} content={item.loaiLamTron} />
                    </tr>;
                }
            });
        };

        return this.renderModal({
            title: 'Cấu hình thành phần điểm',
            size: 'large',
            body: <div>
                <div className='col-md-12'>
                    {loaiDiemConfigTable(listThanhPhanAll)}
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, });
const mapActionsToProps = {
    gvLichGiangDayUpdateTiLeDiem, getDtDiemThanhPhanAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AdjustThanhPhanDiem);