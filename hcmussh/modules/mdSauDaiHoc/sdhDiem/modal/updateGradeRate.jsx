import React from 'react';
import { connect } from 'react-redux';
import { updateSdhConfigMulti } from '../redux';
import { getSdhDiemConfigThanhPhanAll } from '../../sdhDiemConfigThanhPhan/redux';
import { FormSelect, AdminModal, renderTable, TableCell, FormTextBox, FormTabs } from 'view/component/AdminPage';
import { getSdhDmLoaiDiemThi } from '../../sdhDmLoaiDiem/redux';

class RateModel extends AdminModal {

    state = { dmLoaiDiem: [], dataThanhPhan: [], listThanhPhan: [], selectTpDone: false }
    diem = [];
    loaiLamTron = [];
    onShow = () => {
        this.props.getSdhDmLoaiDiemThi(items => this.setState({ dmLoaiDiem: items && items.map(i => ({ id: i.ma, text: i.ten })) }));
        this.tab.tabClick(null, 0);

    }

    onHide = () => {
        this.diem = this.loaiLamTron = [];
        this.setState({ dataThanhPhan: [], listThanhPhan: [] });
    }

    handleLoaiDiem = (value) => {
        let listThanhPhan = [...this.state.listThanhPhan],
            dataThanhPhan = this.props.dataThanhPhan;
        if (value.selected) {
            if (!dataThanhPhan[value.id]) {
                listThanhPhan.push({ ma: value.id, loaiDiem: value.text, loaiLamTron: 0.1, phanTramMin: '10', phanTramMax: '100', phanTramMacDinh: '0' });
            }
            else {
                listThanhPhan.push({ ...dataThanhPhan[value.id] });
            }
        }
        else {
            listThanhPhan = listThanhPhan.filter(i => i.ma != value.id);
        }
        this.setState({ listThanhPhan });
    }

    handleChange = (value, item) => {
        let { listThanhPhan } = this.state;
        let index = listThanhPhan.findIndex(tp => tp.ma == item.ma);
        listThanhPhan[index].phanTram = value;
        this.setState({ listThanhPhan });
    }

    handleCheck = (e) => {
        e && e.preventDefault();
        let { listThanhPhan } = this.state, thanhPhanDiem = {};

        if (listThanhPhan.length == 0) {
            T.notify('Hãy chọn phần trăm điểm trước tiên!', 'danger');
            return;
        }
        if (listThanhPhan.some(i => !i.phanTram)) {
            T.notify('Vui lòng điền đầy đủ dữ liệu phần trăm điểm!', 'danger');
            return;
        }
        for (const tp of listThanhPhan) {
            const { phanTram, phanTramMax, phanTramMin, loaiDiem, ma } = tp;
            thanhPhanDiem[ma] = phanTram;
            if (Number(phanTramMax) < phanTram || Number(phanTramMin) > phanTram) {
                T.notify(`Phần trăm điểm của thành phần ${loaiDiem} ngoài khoảng quy định!`, 'danger');
                return;
            }
        }
        let sum = listThanhPhan.reduce((x, y) => { return x + y.phanTram; }, 0);
        if (sum != 100) {
            T.notify('Tổng phần trăm điểm phải là 100%', 'danger');
            return;
        }
        if (!thanhPhanDiem['CK']) {
            T.notify('Chưa có thành phần điểm cuối kì!', 'danger');
            return;
        }
        if (thanhPhanDiem['CK'] < 50) {
            T.notify('Phần trăm cuối kì không được ít hơn 50%!', 'danger');
            return;
        }
        this.setState({ selectTpDone: true, listThanhPhan }, () => {
            this.tab.tabClick(e, 1);
        });
    }

    onSubmit = () => {
        const { listDiemHocPhan, chosenList } = this.props;
        let updateList = listDiemHocPhan.filter(i => chosenList.includes(i.maHocPhan)).map(item => ({ maMonHoc: item.maMonHoc, maHocPhan: item.maHocPhan }));
        const listThanhPhan = this.state.listThanhPhan.map(item => ({ loaiDiem: item.ma, phanTramDiem: item.phanTram.toString(), loaiLamTron: item.loaiLamTron }));
        this.props.updateSdhConfigMulti(updateList, listThanhPhan, () => { this.props.resetSelected(); this.hide(); });
    }

    renderLoaiDiem = () => {

        const listThanhPhan = this.state.listThanhPhan,
            dataDiemLamTron = [0.1, 0.01],
            table = renderTable({
                getDataSource: () => listThanhPhan,
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
                        <TableCell content={item.ma} />
                        <TableCell content={item.loaiDiem} />
                        <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={`Từ ${item.phanTramMin}% đến ${item.phanTramMax}%`} />
                        <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' suffix='%' style={{ marginBottom: '0' }} ref={e => this.diem[item.ma] = e} placeholder='Phần trăm' required allowNegative={false} onChange={value => this.handleChange(value, item)} value={item.phanTram} />} />
                        <TableCell content={<FormSelect ref={e => this.loaiLamTron[item.ma] = e} data={dataDiemLamTron} className='mb-0' onChange={(value) => item.loaiLamTron = value.id} value={item.loaiLamTron} required />} />
                    </tr>;
                }
            });
        return table;
    }

    renderAfterCheck = () => {
        const { listDiemHocPhan, chosenList, defaultConfig } = this.props,
            { listThanhPhan } = this.state;
        let listUpdate = listDiemHocPhan.filter(i => chosenList.includes(i.maHocPhan));
        const table = renderTable({
            getDataSource: () => listUpdate,
            header: 'thead-light',
            emptyTable: '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã học phần</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Phần trăm hiện tại</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Phần trăm cập nhật</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let config = JSON.parse(item.config);
                return <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={config ? Object.keys(config).map(key => <div key={key}>{key} : {config[key].phanTramDiem}%</div>)
                        : !config && defaultConfig ? Object.keys(defaultConfig).map(key => <div key={key}>{key} : {defaultConfig[key].phanTramMacDinh}%</div>) : ''} />
                    <TableCell content={listThanhPhan.map((item, index) => <div key={index}> {item.ma}: {item.phanTram} %</div>)} />
                    <TableCell content={item.isExist ? 'Học phần đã được nhập điểm' : 'Thành công'} />
                </tr>;
            }
        });
        return table;
    }

    render = () => {
        const { selectTpDone } = this.state;
        return this.renderModal({
            title: 'Cập nhật thành phần điểm',
            size: 'elarge',
            isShowSubmit: selectTpDone,
            body:
                <>
                    <FormTabs ref={e => this.tab = e} tabs={[
                        {
                            id: 'selectTp', title: 'Chọn thành phần', component: <div className='row'>
                                <br />

                                <FormSelect ref={e => this.selectedTp = e} className='col-md-12' data={this.state.dmLoaiDiem} multiple onChange={value => this.handleLoaiDiem(value)} label='Thành phần điểm' required />

                                {this.state.listThanhPhan ? <div className='col-md-12'>{this.renderLoaiDiem()} </div> : null}
                            </div>
                        },
                        {
                            id: 'render', title: 'Kiểm tra dữ liệu', disabled: !selectTpDone, component: <div>
                                {this.renderAfterCheck()}
                            </div>
                        }
                    ]} onChange={tab => this.setState({ selectTpDone: tab.tabIndex })} />

                </>,
            postButtons: <button style={{ display: selectTpDone ? 'none' : '' }} type='button' className='btn btn-success' onClick={this.handleCheck}>
                <i className='fa fa-fw fa-lg fa-arrow-right' /> Tiếp theo
            </button>
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSdhDiemConfigThanhPhanAll, getSdhDmLoaiDiemThi, updateSdhConfigMulti };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(RateModel);