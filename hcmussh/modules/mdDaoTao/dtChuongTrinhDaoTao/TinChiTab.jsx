import React from 'react';
import { AdminPage, AdminModal, renderDataTable, TableCell, TableHead, FormTextBox, FormSelect } from 'view/component/AdminPage';
import { getDtKhungDaoTao, checkTinChiCtdt, createTinChiCtdt, SelectAdapter_ChuongTrinhDaoTaoFilterV2, createTinChiCtdtMultiple } from './redux';
import { getDtCauTrucKhungDaoTao } from 'modules/mdDaoTao/dtCauTrucKhungDaoTao/redux';
import { connect } from 'react-redux';

class CopyModal extends AdminModal {
    onShow = (maKhung, items) => {
        this.setState({ maKhung, items }, () => {
            this.ctdt.value('');
        });

    };

    onSubmit = (e) => {
        e.preventDefault();
        let { items } = this.state,
            listCtdt = this.ctdt.data();
        listCtdt = listCtdt.map(e => {
            return e.text.split(': ')[0];
        });
        T.confirm('Cảnh báo', 'Bạn có chắc muốn sao chép cấu hình tín chỉ vào các CTDT này?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.create(listCtdt, items, (value) => {
                    if (!value.error) T.alert('Sao chép cấu hình tín chỉ thành công', 'success', false, 1000);
                    else T.alert('Sao chép cấu hình tín chỉ thất bại', 'warning', false, 1000);
                    this.hide();
                    this.ctdt.value('');
                });
            }
        });
    };

    render = () => {
        let { maKhung } = this.state;
        return this.renderModal({
            title: 'Cập nhật cấu hình tín chỉ cho CTDT',
            submitText: 'Xác nhận',
            body: <div>
                <FormSelect ref={e => this.ctdt = e} label='Chọn chương trình đào tạo' data={SelectAdapter_ChuongTrinhDaoTaoFilterV2({ maKhung })} required multiple />
            </div>
        });
    }
}
class TinChiTab extends AdminPage {
    state = { isNew: false, isOld: false, maCtdt: '', idCtdt: null }
    tinChiBb = {}
    tinChiTc = {}
    tongTinChi = {}

    getCtdt = (item) => {
        if (item == 'new') this.setState({ isNew: true });
        else {
            this.props.getDtKhungDaoTao(item, value => {
                this.setState({ idCtdt: item, maKhung: value.maKhung, maCtdt: value.maCtdt }, () => this.getKhung(value.maKhung));
            });
        }
    }

    getKhung = (item) => {
        this.props.getDtCauTrucKhungDaoTao(item, value => {
            let data = [],
                mucCha = T.parse(value.mucCha, { chuongTrinhDaoTao: {} }).chuongTrinhDaoTao,
                mucCon = T.parse(value.mucCon, { chuongTrinhDaoTao: {} }).chuongTrinhDaoTao;

            Object.keys(mucCha).forEach(key => {
                if (mucCon[key] && mucCon[key].length) mucCha[key].children = mucCon[key];
                data.push(mucCha[key]);
            });

            if (!data.length) data.push({});
            else {
                let item = { id: 'T', text: 'Tổng tín chỉ' };
                data.push(item);
            }

            this.setState({ data, isNew: false }, () => {
                let { maCtdt } = this.state;
                if (maCtdt) {
                    this.props.checkTinChiCtdt(maCtdt, (value) => {
                        if (value && value.length) this.setDataOld(value);
                        else this.setDataNew();
                    });
                } else this.setDataNew();
            });
        });
    }

    setDataNew = () => {
        let { data } = this.state;
        data.forEach((item, index) => {
            if (item.id == 'T') {
                this.tinChiBb['T'].value('0');
                this.tinChiTc['T'].value('0');
                this.tongTinChi['T'].value('0');
            } else {
                this.tinChiBb[index].value('0');
                this.tinChiTc[index].value('0');
                this.tongTinChi[index].value('0');

                if (item.children && item.children.length) {
                    item.children.forEach((sub, stt) => {
                        let i = index + '_' + stt;
                        this.tinChiBb[i].value('0');
                        this.tinChiTc[i].value('0');
                        this.tongTinChi[i].value('0');
                    });
                }
            }
        });
        this.setState({ isOld: false });
    }

    setDataOld = (value) => {
        let { data } = this.state,
            tinChiTcSum = 0, tinChiBbSum = 0, tongTinChiSum = 0,
            khoiCha = value.filter(e => e.idKhoiCha == null),
            khoiCon = value.filter(e => e.idKhoiCha != null);

        data.forEach((item, index) => {
            if (item.id != 'T') {
                let khoi = khoiCha.filter(e => e.viTriKhoiKienThuc == index)[0],
                    idKhoiCha = khoi.idKhoiKienThuc + '-' + khoi.viTriKhoiKienThuc,
                    listKhoiCon = khoiCon.filter(e => e.idKhoiCha == idKhoiCha);

                tinChiTcSum = tinChiTcSum + khoi.tinChiBatBuoc;
                tinChiBbSum = tinChiBbSum + khoi.tinChiTuChon;
                tongTinChiSum = tongTinChiSum + khoi.tongSoTinChi;

                this.tinChiBb[index].value(khoi.tinChiBatBuoc || '0');
                this.tinChiTc[index].value(khoi.tinChiTuChon || '0');
                this.tongTinChi[index].value(khoi.tongSoTinChi || '0');

                if (listKhoiCon && listKhoiCon.length) {
                    listKhoiCon.forEach((sub, stt) => {
                        let i = index + '_' + stt;

                        this.tinChiBb[i].value(sub.tinChiBatBuoc || '0');
                        this.tinChiTc[i].value(sub.tinChiTuChon || '0');
                        this.tongTinChi[i].value(sub.tongSoTinChi || '0');
                    });
                }
            }
        });
        this.tinChiBb['T'].value(tinChiTcSum || '0');
        this.tinChiTc['T'].value(tinChiBbSum || '0');
        this.tongTinChi['T'].value(tongTinChiSum || '0');
        this.setState({ isOld: true });
    }

    changeTinChiPar = (index) => {
        let { data } = this.state, tinChiTcSum = 0, tinChiBbSum = 0, tongTinChiSum = 0,
            tinChiTc = this.tinChiTc[index].value(),
            tinChiBb = this.tinChiBb[index].value(),
            tongTinChi = this.tongTinChi[index].value();
        tongTinChi = (tinChiTc == '0' ? 0 : tinChiTc) + (tinChiBb == '0' ? 0 : tinChiBb);
        this.tongTinChi[index].value(tongTinChi == 0 ? '0' : tongTinChi);

        data.forEach((item, i) => {
            if (i == index) {
                tinChiTcSum = tinChiTcSum + (tinChiTc == '0' ? 0 : tinChiTc);
                tinChiBbSum = tinChiBbSum + (tinChiBb == '0' ? 0 : tinChiBb);
                tongTinChiSum = tongTinChiSum + (tongTinChi == '0' ? 0 : tongTinChi);
            } else if (item.id != 'T') {
                let tinChiTcPar = this.tinChiTc[i].value(),
                    tinChiBbPar = this.tinChiBb[i].value(),
                    tongTinChiPar = this.tongTinChi[i].value();
                tinChiTcSum = tinChiTcSum + (tinChiTcPar == '0' ? 0 : tinChiTcPar);
                tinChiBbSum = tinChiBbSum + (tinChiBbPar == '0' ? 0 : tinChiBbPar);
                tongTinChiSum = tongTinChiSum + (tongTinChiPar == '0' ? 0 : tongTinChiPar);
            }
        });
        this.tinChiTc['T'].value(tinChiTcSum == 0 ? '0' : tinChiTcSum);
        this.tinChiBb['T'].value(tinChiBbSum == 0 ? '0' : tinChiBbSum);
        this.tongTinChi['T'].value(tongTinChiSum == 0 ? '0' : tongTinChiSum);
    }

    changeTinChiChil = (i, index) => {
        let { data } = this.state, tinChiTcSum = 0, tinChiBbSum = 0, tongTinChiSum = 0,
            tinChiTc = this.tinChiTc[i].value(),
            tinChiBb = this.tinChiBb[i].value(),
            tongTinChi = this.tongTinChi[i].value();
        tongTinChi = (tinChiTc == '0' ? 0 : tinChiTc) + (tinChiBb == '0' ? 0 : tinChiBb);
        this.tongTinChi[i].value(tongTinChi == 0 ? '0' : tongTinChi);

        data.forEach((item, l) => {
            let tinChiTcPar = 0, tinChiBbPar = 0, tongTinChiPar = 0;
            if (l == index) {
                if (item.children && item.children.length) {
                    item.children.forEach((sub, stt) => {
                        let m = l + '_' + stt;
                        if (m == i) {
                            tinChiTcPar = tinChiTcPar + (tinChiTc == '0' ? 0 : tinChiTc);
                            tinChiBbPar = tinChiBbPar + (tinChiBb == '0' ? 0 : tinChiBb);
                            tongTinChiPar = tongTinChiPar + (tongTinChi == '0' ? 0 : tongTinChi);
                        } else {
                            let tinChiTcChil = this.tinChiTc[m].value(),
                                tinChiBbChil = this.tinChiBb[m].value(),
                                tongTinChiChil = this.tongTinChi[m].value();
                            tinChiTcPar = tinChiTcPar + (tinChiTcChil == '0' ? 0 : tinChiTcChil);
                            tinChiBbPar = tinChiBbPar + (tinChiBbChil == '0' ? 0 : tinChiBbChil);
                            tongTinChiPar = tongTinChiPar + (tongTinChiChil == '0' ? 0 : tongTinChiChil);
                        }
                    });
                }
                this.tinChiTc[l].value(tinChiTcPar == 0 ? '0' : tinChiTcPar);
                this.tinChiBb[l].value(tinChiBbPar == 0 ? '0' : tinChiBbPar);
                this.tongTinChi[l].value(tongTinChiPar == 0 ? '0' : tongTinChiPar);
            } else if (item.id != 'T') {
                tinChiTcPar = this.tinChiTc[l].value();
                tinChiBbPar = this.tinChiBb[l].value();
                tongTinChiPar = this.tongTinChi[l].value();
            }

            tinChiTcSum = tinChiTcSum + (tinChiTcPar == '0' ? 0 : tinChiTcPar);
            tinChiBbSum = tinChiBbSum + (tinChiBbPar == '0' ? 0 : tinChiBbPar);
            tongTinChiSum = tongTinChiSum + (tongTinChiPar == '0' ? 0 : tongTinChiPar);

            this.tinChiTc['T'].value(tinChiTcSum == 0 ? '0' : tinChiTcSum);
            this.tinChiBb['T'].value(tinChiBbSum == 0 ? '0' : tinChiBbSum);
            this.tongTinChi['T'].value(tongTinChiSum == 0 ? '0' : tongTinChiSum);
        });
    }

    onSave = () => {
        let items = [],
            { data, maKhung, maCtdt } = this.state;

        data.forEach((item, index) => {
            if (item.id != 'T') {
                let value = {
                    maKhung, maCtdt,
                    viTriKhoiKienThuc: index,
                    idKhoiKienThuc: item.id,
                    idKhoiCha: null,
                    tinChiTuChon: parseInt(this.tinChiTc[index].value()) || 0,
                    tinChiBatBuoc: parseInt(this.tinChiBb[index].value()) || 0,
                    tongSoTinChi: parseInt(this.tongTinChi[index].value()) || 0,
                };
                items.push(value);

                if (item.children && item.children.length) {
                    item.children.forEach((sub, stt) => {
                        let i = index + '_' + stt,
                            subValue = {
                                maKhung, maCtdt,
                                viTriKhoiKienThuc: sub.id,
                                idKhoiKienThuc: sub.value.id,
                                idKhoiCha: item.id + '-' + index,
                                tinChiTuChon: parseInt(this.tinChiTc[i].value()) || 0,
                                tinChiBatBuoc: parseInt(this.tinChiBb[i].value()) || 0,
                                tongSoTinChi: parseInt(this.tongTinChi[i].value()) || 0,
                            };
                        items.push(subValue);
                    });
                }
            }
        });
        this.props.createTinChiCtdt(items);
    }

    onCopy = () => {
        let items = [],
            { data, maKhung } = this.state;

        data.forEach((item, index) => {
            if (item.id != 'T') {
                let value = {
                    maKhung,
                    maCtdt: null,
                    viTriKhoiKienThuc: index,
                    idKhoiKienThuc: item.id,
                    idKhoiCha: null,
                    tinChiTuChon: parseInt(this.tinChiTc[index].value()) || 0,
                    tinChiBatBuoc: parseInt(this.tinChiBb[index].value()) || 0,
                    tongSoTinChi: parseInt(this.tongTinChi[index].value()) || 0,
                };
                items.push(value);

                if (item.children && item.children.length) {
                    item.children.forEach((sub, stt) => {
                        let i = index + '_' + stt,
                            subValue = {
                                maKhung,
                                maCtdt: null,
                                viTriKhoiKienThuc: sub.id,
                                idKhoiKienThuc: sub.value.id,
                                idKhoiCha: item.id + '-' + index,
                                tinChiTuChon: parseInt(this.tinChiTc[i].value()) || 0,
                                tinChiBatBuoc: parseInt(this.tinChiBb[i].value()) || 0,
                                tongSoTinChi: parseInt(this.tongTinChi[i].value()) || 0,
                            };
                        items.push(subValue);
                    });
                }
            }
        });
        this.copyModal.show(maKhung, items);
    }

    render() {
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage', 'import', 'export']);

        let { isNew, isOld, data } = this.state,
            readOnly = !permission.write;
        readOnly = !permission.manage;

        let table = renderDataTable({
            data: data,
            emptyTable: 'Khung đào tạo chưa có khối kiến thức',
            header: 'thead-light',
            stickyHead: true,
            divStyle: { height: '65vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'right' }} />
                    <TableHead style={{ width: '55%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên khối' />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Số tín chỉ tự chọn' />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Số tín chỉ bắt buộc' />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng số tín chỉ' />
                </tr>),
            renderRow: (item, index) => {
                let rows = [],
                    readPar = false;
                if (item.children && item.children.length) readPar = true;
                if (!readPar) readPar = readOnly;
                if (item.id == 'T') {
                    rows.push(
                        <tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right', marginBottom: '0' }} content={<h5>{item.text}</h5>} colSpan={3} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.tinChiTc['T'] = e}
                                    placeholder='Tín chỉ tự chọn' required readOnly={true}
                                />} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.tinChiBb['T'] = e}
                                    placeholder='Tín chỉ bắt buộc' required readOnly={true}
                                />} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.tongTinChi['T'] = e}
                                    placeholder='Tổng tín chỉ' required readOnly={true}
                                />} />
                        </tr>
                    );
                } else {
                    rows.push(
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'right' }} content={index} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.text} colSpan={2} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.tinChiTc[index] = e}
                                    placeholder='Tín chỉ tự chọn' required readOnly={readPar} onChange={() => this.changeTinChiPar(index)}
                                />} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.tinChiBb[index] = e}
                                    placeholder='Tín chỉ bắt buộc' required readOnly={readPar} onChange={() => this.changeTinChiPar(index)}
                                />} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.tongTinChi[index] = e}
                                    placeholder='Tổng tín chỉ' required readOnly={true}
                                />} />
                        </tr>
                    );
                    if (item.children && item.children.length) {
                        item.children.forEach((sub, stt) => {
                            let i = index + '_' + stt;
                            rows.push(
                                <tr key={`${index}-${stt}-1`}>
                                    <TableCell style={{ textAlign: 'right' }} content={stt + 1} colSpan={2} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={sub.value.text} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                        <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.tinChiTc[i] = e}
                                            placeholder='Tín chỉ tự chọn' required onChange={() => this.changeTinChiChil(i, index)} readOnly={readOnly}
                                        />} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                        <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.tinChiBb[i] = e}
                                            placeholder='Tín chỉ bắt buộc' required onChange={() => this.changeTinChiChil(i, index)} readOnly={readOnly}
                                        />} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                        <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.tongTinChi[i] = e}
                                            placeholder='Tổng tín chỉ' required readOnly={true}
                                        />} />
                                </tr >,
                            );
                        });
                    }
                }
                return rows;
            }
        });
        return (<>
            {isNew ? <h5>Chương trình đào tạo chưa có khung!</h5> :
                <div>
                    <div className='rows mb-2' style={{ textAlign: 'right', display: readOnly ? 'none' : '' }}>
                        {isOld ?
                            <button className='btn btn-primary mr-2' onClick={(e) => {
                                e.preventDefault() || this.onCopy();
                            }} >
                                <i className='fa fa-clone' /> Áp cấu hình cho CTDT
                            </button> : null}
                        <button className='btn btn-success' onClick={(e) => {
                            e.preventDefault() || this.onSave();
                        }} >
                            <i className='fa fa-save' /> Lưu thay đổi
                        </button>
                    </div>
                    {table}
                </div>
            }
            <CopyModal ref={e => this.copyModal = e} create={this.props.createTinChiCtdtMultiple} />
        </>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDtKhungDaoTao, getDtCauTrucKhungDaoTao, checkTinChiCtdt, createTinChiCtdt, createTinChiCtdtMultiple
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(TinChiTab);
