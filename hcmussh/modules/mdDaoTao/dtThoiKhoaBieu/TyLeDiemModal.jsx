import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDtDmLoaiDiemAll } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';

const dataDiemLamTron = ['0.1', '0.01', '0.5'];
class TyLeDiemModal extends AdminModal {

    state = { listDiem: [], maMonHoc: [], configThanhPhan: [] }

    diem = {};
    loaiLamTron = {}

    componentDidMount = () => {
        this.disabledClickOutside();
        this.onHidden(() => {
            this.setState({ loaiDiem: [] }, () => {
                this.diem = {};
                this.loaiLamTron = {};
            });
        });
    }

    onShow = (item) => {
        const { maMonHoc, configThanhPhan } = item;
        this.props.getDtDmLoaiDiemAll(dmLoaiDiem => {

            this.setState({ maMonHoc: maMonHoc.filter(i => i.isChon), configThanhPhan: configThanhPhan.map(i => ({ id: i.ma, text: dmLoaiDiem.find(ld => ld.ma == i.ma)?.ten || i.ma, phanTramMin: i.phanTramMin, phanTramMax: i.phanTramMax, loaiLamTron: i.loaiLamTron })) });
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
        this.props.handleTyLe({ listMon: this.state.maMonHoc.map(i => i.ma), tyLeDiem: listDiem.map(i => ({ loaiThanhPhan: i.loaiThanhPhan, loaiLamTron: i.loaiLamTron, phanTram: i.phanTram })) });
    }

    handleLoaiDiem = (value) => {
        if (value) {
            let { listDiem } = this.state;
            if (value.selected) {
                let data = {
                    loaiThanhPhan: value.id,
                    tenThanhPhan: value.text,
                    phanTram: '',
                    loaiLamTron: 0.5,
                    phanTramMin: value.phanTramMin,
                    phanTramMax: value.phanTramMax,
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

    table = (list) => {
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
                const phanTramMin = item.loaiThanhPhan == 'CK' ? 50 : 0,
                    phanTramMax = item.loaiThanhPhan != 'CK' ? 50 : 100;
                return <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.loaiThanhPhan} />
                    <TableCell content={item.tenThanhPhan} />
                    <TableCell style={{ width: 'auto%', whiteSpace: 'nowrap' }} content={`Từ ${phanTramMin}% đến ${phanTramMax}%`} />
                    <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' suffix='%' style={{ marginBottom: '0' }} ref={e => this.diem[item.loaiThanhPhan] = e} placeholder='Phần trăm' required allowNegative={false} onChange={e => this.handleChange(e, item)} value={item.phanTram} />} />
                    <TableCell content={<FormSelect ref={e => this.loaiLamTron[item.loaiThanhPhan] = e} data={dataDiemLamTron} className='mb-0' onChange={(value) => item.loaiLamTron = value.id} required value={item.loaiLamTron} />} />
                </tr>;
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Cấu hình tỷ lệ điểm',
            size: 'large',
            body: <div>
                <FormSelect className='col-md-12' ref={e => this.loaiDiem = e} data={this.state.configThanhPhan} multiple label='Thành phần điểm' onChange={this.handleLoaiDiem} required />

                <div className='col-md-12'>
                    {this.table(this.state.listDiem)}
                </div>
            </div>,
        });
    };
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtDmLoaiDiemAll };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(TyLeDiemModal);