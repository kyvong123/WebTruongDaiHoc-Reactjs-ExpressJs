import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, TableCell, renderTable, FormTextBox, FormTabs } from 'view/component/AdminPage';
import { SelectAdapter_ThanhPhanFilter } from 'modules/mdDaoTao/dtDiemConfigThanhPhan/redux';
import { updateThanhPhanDiemMulti } from 'modules/mdDaoTao/dtDiem/redux';


const dataDiemLamTron = ['0.1', '0.01', '0.5'];
class UpdateRateModal extends AdminModal {
    componentDidUpdate(prevProps) {
        if (T.stringify(prevProps.filter) != T.stringify(this.props.filter)) {
            this.loaiDiem.value('');
        }
    }

    state = { listDiem: [], dataCheck: [] }

    diem = {};
    loaiLamTron = {}

    onShow = () => {
        this.tab.tabClick(null, 0);
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        let { dataCheck, listDiem } = this.state;

        T.alert('Đang xử lý!', 'warning', false, null, true);
        this.props.updateThanhPhanDiemMulti(dataCheck.filter(i => i.isUpdate), listDiem, () => {
            this.hide();
            T.alert('Cập nhật thành phần điểm thành công', 'success');
        });
    };

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

    tableCheck = (list) => {
        return renderTable({
            getDataSource: () => list,
            stickyHead: list.length > 10,
            divStyle: { height: '70vh' },
            header: 'thead-light',
            emptyTable: '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã học phần</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thành phần điểm hiện tại</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tpDiemCur ? Object.keys(item.tpDiemCur).map((i, idx) => <div key={idx}>{i}: {item.tpDiemCur[i]}%</div>) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.isUpdate ? 'Thành công' : 'Thất bại, học phần đã có điểm'} />
                </tr>;
            }
        });
    }

    handleLoaiDiem = (value) => {
        if (value) {
            let { listDiem } = this.state;
            if (value.selected) {
                let { phanTramMacDinh: phanTram, phanTramMax, phanTramMin, loaiLamTron = 0.5 } = value.data;
                listDiem.push({
                    phanTram, phanTramMax, phanTramMin, loaiLamTron,
                    loaiThanhPhan: value.id, tenThanhPhan: value.text,
                });
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

    handleClick = (e) => {
        e && e.preventDefault();
        let { listDiem } = this.state, thanhPhan = {};
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
        listDiem.forEach(i => {
            thanhPhan[i.loaiThanhPhan] = i.phanTram.toString();
        });

        let dataCheck = [];
        this.props.listChosen.forEach(item => {
            let { maHocPhan, maMonHoc, tpDiemCur, namHoc, hocKy } = item, isUpdate = true;
            if (tpDiemCur) {
                tpDiemCur = T.parse(tpDiemCur);
                isUpdate = false;
            }
            dataCheck.push({ maHocPhan, maMonHoc, tpDiemCur, namHoc, hocKy, isUpdate });
        });
        this.setState({ selectTp: true, dataCheck }, () => this.tab.tabClick(e, 1));
    }

    render = () => {
        let { namFilter: namHoc, hocKyFilter: hocKy } = this.props.filter || {},
            { selectTp } = this.state;
        return this.renderModal({
            title: 'Cập nhật tỉ lệ điểm thành phần',
            size: 'large',
            isShowSubmit: selectTp,
            body: <>
                <FormTabs ref={e => this.tab = e} tabs={[
                    {
                        id: 'selectTp', title: 'Chọn thành phần', component: <div className='row'>
                            <br />
                            <FormSelect className='col-md-12' ref={e => this.loaiDiem = e} data={SelectAdapter_ThanhPhanFilter({ namHoc, hocKy })} multiple label='Thành phần điểm' onChange={this.handleLoaiDiem} required />

                            <div className='col-md-12'>
                                {this.loaiDiemConfigTable(this.state.listDiem)}
                            </div>
                        </div>
                    },
                    {
                        id: 'render', title: 'Kiểm tra dữ liệu', disabled: !selectTp, component: <div>
                            {this.tableCheck(this.state.dataCheck)}
                        </div>
                    }
                ]} onChange={tab => this.setState({ selectTp: !!tab.tabIndex })} />
            </>,
            postButtons: <button style={{ display: selectTp ? 'none' : '' }} type='button' className='btn btn-success' onClick={this.handleClick}>
                <i className='fa fa-fw fa-lg fa-arrow-right' /> Tiếp theo
            </button>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateThanhPhanDiemMulti };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(UpdateRateModal);