import React from 'react';
import { connect } from 'react-redux';
import { FormSelect, FormRichTextBox, FormTextBox, renderTable, TableCell, FormDatePicker } from 'view/component/AdminPage';
import { SelectAdapter_CanBoHuongDan } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { FormChildren } from 'modules/mdSauDaiHoc/sdhTsThiSinhHoSo/FormChildren';
import { getSdhTsThiSinhDeTai } from 'modules/mdSauDaiHoc/sdhTsDeTai/redux';
import { deleteSdhTsCbhd } from 'modules/mdSauDaiHoc/sdhTsCanBoHuongDan/redux';

import DataBaiBaoCbhd from './componentBaiBaoCbhd';
import { BaiBaoModal } from 'modules/mdSauDaiHoc/sdhTsCongTrinhCbhd/BaiBaoModal';
class DataDeTai extends React.Component {
    state = { data: {}, tempBaiBao: [] };
    selectVaiTro = [{ id: 'Cán bộ hướng dẫn chính', text: 'Cán bộ hướng dẫn chính' }, { id: 'Cán bộ hướng dẫn phụ', text: 'Cán bộ hướng dẫn phụ' }, { id: 'Cán bộ hướng dẫn độc lập', text: 'Cán bộ hướng dẫn độc lập' }];
    tempBaiBao = {};
    componentDidMount() {
        this.getData();
    }
    onEdit = (item) => {
        this.modalTempBaiBao.show(item);
    }
    componentBaiBao = (idCbhd) => {
        const { data } = this.state;
        const dataCongTrinhCbhd = data.deTaiCbhd || this.state.tempBaiBao;
        const tableBaiBaoCbhd = renderTable({
            getDataSource: () => idCbhd != 'Temp' ? dataCongTrinhCbhd.filter(item => item.idCbhd == idCbhd) : this.state.tempBaiBao,
            stickyHead: false,
            emptyTable: '',
            header: 'light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%' }}>Bài báo</th>
                    <th style={{ width: '20%' }}>Tạp chí</th>
                    <th style={{ width: '20%' }}>Chỉ số</th>
                    <th style={{ width: '20%' }}>Thời gian đăng</th>
                    <th style={{ width: '20%' }}>Điểm</th>
                    <th style={{ width: 'auto' }}>Thao tác</th>

                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'left' }} content={item.tenTapChi} />
                    <TableCell style={{ textAlign: 'left' }} content={item.chiSo} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'left' }} content={item.ngayDang} />
                    <TableCell type='number' style={{ textAlign: 'left' }} content={item.diem} />
                    <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'center' }}
                        permission={{
                            write: !this.state.lock ? true : false,
                            delete: !this.state.lock ? (dataCongTrinhCbhd.filter(item => item.idCbhd == idCbhd).length > 1 ? true : false) : false
                        }}
                        content={item}
                        onEdit={e => e.preventDefault() || this.onEdit(item)}
                        onDelete={e => e.preventDefault() || T.confirm('Xóa bài báo', 'Bạn có xác nhận Xóa bài báo?', true, isConfirm => {
                            if (isConfirm) {
                                if (idCbhd != 'Temp') {
                                    this.props.deleteBaiBao(item);
                                } else {
                                    const tempBaiBao = this.state.tempBaiBao.filter(i => i.idBaiBao != item.idBaiBao);
                                    this.setState({ tempBaiBao });
                                }

                            }
                        })} />

                </tr>
            )
        });
        return <div className='tile-sub col-md-12'> {tableBaiBaoCbhd}
            {idCbhd == 'Temp' ?
                <div className='row'>
                    <FormTextBox ref={e => this['tenTemp'] = e} label='Tên bài báo' className='col-md-12' required />
                    <FormTextBox ref={e => this['tenTapChiTemp'] = e} label='Tên tạp chí' className='col-md-12' required />
                    <FormTextBox ref={e => this['chiSoTemp'] = e} label='Chỉ số tạp chí' className='col-md-4' required />
                    <FormDatePicker ref={e => this['ngayDangTemp'] = e} type='month-mask' label='Thời gian đăng (mm/yyyy)' className='col-md-4' required />
                    <FormTextBox type='number' step={true} decimalScale={2} max={100} ref={e => this['diemTemp'] = e} label='Điểm bài báo' className='col-md-4' />
                    <div className='col-md-12 d-flex justify-content-end'>
                        <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => e.preventDefault() || this.handleTempBaiBao()}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm bài báo
                        </button>
                    </div>
                </div> : dataCongTrinhCbhd?.filter(ele => ele.idCbhd == idCbhd).length > 0 && dataCongTrinhCbhd?.filter(ele => ele.idCbhd == idCbhd).length < 5 ?
                    <div className='d-flex justify-content-end'>
                        <button type='button' className='btn btn-primary rounded-0' data-dismiss='modal' onClick={(e) => { e.preventDefault() || this.modalBaiBao.show({ idCbhd }); }}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm
                        </button>
                    </div> : null}
        </div>;
    }
    getData = () => {
        this.props.getSdhTsThiSinhDeTai(this.props.idThiSinh, (items) => this.setState({ data: items }, () => this.setVal(items)));
    }
    validation = (selector) => {
        const data = selector && selector.value() || '';
        const isRequired = selector && selector.props?.required;
        if (selector && selector.props?.id && isRequired && !T.validateEmail(data)) throw selector;
        if (data) return data;
        if (isRequired) throw selector;
        return '';
    };
    handleCbhd = (idCbhd, action) => {
        const [ghiChu, vaiTro, shcc] = [
            this['ghiChuCbhd' + idCbhd].value() || '',
            this['vaiTro' + idCbhd]?.value() || '',
            this['shcc' + idCbhd]?.value() || '',
        ];
        let condition = (vaiTro && shcc) || ghiChu;
        if (!condition) {
            T.notify('Vui lòng điền đầy đủ thông tin người hướng dẫn');
            return;
        }
        let changes = {
            idThiSinh: this.props.idThiSinh,
            hoTen: ghiChu?.split('. ').join(' ').split(' - ')[0]?.trim() || '',
            vaiTro: vaiTro || ghiChu?.split('.').join(' ').split(' - ')[1]?.trim() || '',
            shcc: shcc || ''
        };
        let another = this.state.data.listCbhd.find(({ id }) => id != idCbhd);
        if (another && another.shcc && another.shcc == changes.shcc) {
            T.notify('Không thể đăng ký một cán bộ hướng dẫn hai lần', 'danger');
            return;
        }
        // else if (changes.vaiTro && changes.vaiTro != 'Đồng hướng dẫn' && another?.vaiTro == changes.vaiTro) {
        //     T.notify('Không thể tồn tại cùng lúc hai vai trò ngoài đồng hướng dẫn', 'danger');
        //     return;
        // } 
        else {
            let struct = { dataDeTai: { dataCbhd: { ...changes } } };
            action == 'update' ? this.props.updateThiSinh(idCbhd, struct) :
                T.confirm('Xóa người hướng dẫn', 'Bạn có xác nhận xoá người hướng dẫn cho thí sinh này bao gồm các thông tin bài báo kèm theo?', true, isConfirm => isConfirm && this.props.deleteSdhTsCbhd(idCbhd, () => this.getData()));
        }
    }
    updateTempBaiBao = (action = 'update', changes, doneModal) => {//submit temp trên modal  dùng để update
        T.notify(`${action} bài báo thành công!`, 'success');
        this.setState({ tempBaiBao: [this.state.tempBaiBao.filter(i => i.idBaiBao != changes.idBaiBao), changes] }, () => doneModal && doneModal());
    }

    handleTempBaiBao = () => {//temp trên form dùng để add
        const { tempBaiBao } = this.state || { tempBaiBao: [] };
        let idBaiBao = tempBaiBao.length + 1;
        const [ten, tenTapChi, chiSo, ngayDang, diem, ghiChu, vaiTro, shcc] = [
            this['tenTemp']?.value() || '',
            this['tenTapChiTemp']?.value() || '',
            this['chiSoTemp']?.value() || '',
            this['ngayDangTemp']?.value() ? this['ngayDangTemp'].value().getTime() : '',
            this['diemTemp']?.value() || '',
            this['ghiChuCbhdTemp']?.value() || '',
            this['vaiTroTemp']?.value() || '',
            this['shccTemp']?.value() || ''
        ];
        const preCondition = ghiChu || (vaiTro && shcc);
        let condition = ten && tenTapChi && chiSo && ngayDang && diem;
        if (!preCondition) {
            T.notify('Vui lòng điền đầy đủ thông tin người hướng dẫn');
            return;
        } else {
            if (!condition) {
                T.notify('Vui lòng điền đầy đủ thông tin bài báo');
                return;
            }
            else {
                const data = { idBaiBao, ten, tenTapChi, chiSo, ngayDang, diem };
                this.setState({ tempBaiBao: [...this.state.tempBaiBao, data] }, () => {
                    for (const key in data) {
                        this[key + 'Temp']?.value('');
                    }
                });
            }
        }

    };
    handleTempCbhd = () => {
        const [ghiChu, vaiTro, shcc] = [this['ghiChuCbhdTemp']?.value(), this['vaiTroTemp']?.value(), this['shccTemp']?.value()];
        const preCondition = this.props.tenDeTai || this.state.data.tenDeTai;
        let condition = ghiChu || (vaiTro && shcc);
        let data = {
            idThiSinh: this.props.idThiSinh,
            hoTen: ghiChu && ghiChu?.split('. ').join(' ').split(' - ')[0]?.trim(),
            vaiTro: vaiTro || ghiChu && ghiChu?.split('.').join(' ').split(' - ')[1]?.trim(),
            shcc
        };
        if (!preCondition) { //Đăng ký ncs mới
            T.notify('Tên đề tài chưa được lưu!');
            return;
        }
        if (!condition) {
            T.notify('Vui lòng điền đầy đủ thông tin người hướng dẫn');
            return;
        } else {
            const curCbhd = this.state.data?.listCbhd;
            if (curCbhd.length) {
                if (curCbhd.find(i => i.shcc == data.shcc)) {
                    T.notify('Không thể đăng ký một cán bộ hướng dẫn hai lần', 'danger');
                    return;
                }
                // else if (curCbhd.find(i => data.vaiTro != 'Đồng hướng dẫn' && i.vaiTro == data.vaiTro)) {
                //     T.notify('Không thể có cùng vai trò ngoài đồng hướng dẫn', 'danger');
                //     return;
                // }
            }
            if (!this.state.tempBaiBao.length) {
                T.notify('Vui lòng điền đầy đủ thông tin bài báo');
                return;
            }
            else {
                const dataCongTrinhCbhd = this.state.tempBaiBao;
                const changes = { dataDeTai: { dataCongTrinhCbhd, dataCbhd: data } };
                this.props.updateThiSinh('Temp', changes, () => {
                    this.setState({
                        tempBaiBao: []
                    }, () => this.getData());
                });
            }
        }

    }
    setVal = (data) => {
        const { tenDeTai, listCbhd } = data;
        this.tenDeTai?.value(tenDeTai);
        if (listCbhd.length)
            for (const cbhd of listCbhd) {
                let idCbhd = cbhd.id;
                for (const key in cbhd) {
                    if (key == 'shcc' && !cbhd[key]) { //cán bộ ngoài trường không có shcc chỉ có họ tên
                        this['ghiChuCbhd' + idCbhd].value(`${cbhd.hoTen} - ${cbhd.vaiTro}`);
                        break;
                    }
                    this[key + idCbhd]?.value(cbhd[key] || '');
                }
            }
    }
    render() {
        const { data } = this.state;
        const { onShow, readOnly, permissionDangKy } = this.props;
        const dataCbhd = data.listCbhd || [];
        const formOld = (idCbhd) => {
            return <div className='row'>
                <h5 className='tile-sub col-md-12' style={{ marginBottom: '5px' }}>Thông tin nguời hướng dẫn</h5><br />
                <strong className='col-md-12 text-danger' style={{ paddingLeft: 15 }}>Trường hợp không tìm thấy cán bộ hướng dẫn (CBHD) hoặc CBHD là cán bộ ngoài trường, vui lòng nhập ở ghi chú theo mẫu</strong><br />
                <FormSelect ref={e => this['shcc' + idCbhd] = e} label='Cán bộ hướng dẫn' data={SelectAdapter_CanBoHuongDan} className='col-md-6' allowClear readOnly={readOnly} />
                <FormSelect ref={e => this['vaiTro' + idCbhd] = e} label='Vai trò' data={this.selectVaiTro} className='col-md-6' readOnly={readOnly} allowClear />
                <FormRichTextBox ref={e => this['ghiChuCbhd' + idCbhd] = e} maxLength={1999} label='Ghi chú' placeholder='<Chức danh cao nhất> <Học vị cao nhất> <Họ và tên> - <Vai trò>. Vd: PGS TS Nguyễn Văn A - Cán bộ hướng dẫn chính' className='col-md-12' readOnly={readOnly} />
                {readOnly ? '' : <div className='col-md-12 d-flex justify-content-end' style={{ marginTop: 15, marginBottom: 15 }}>
                    <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => e.preventDefault() || this.handleCbhd(idCbhd, 'update')} >
                        <i className='fa fa-fw fa-lg fa-save' />Lưu
                    </button>
                    <button type='button' className='btn btn-danger rounded-0' data-dismiss='modal' onClick={(e) => e.preventDefault() || this.handleCbhd(idCbhd, 'delete')} >
                        <i className='fa fa-fw fa-lg fa-trash' />Xoá
                    </button>
                </div>}
                <h5 className='tile-sub col-md-12' style={{ margin: '5px 5px', color: 'orange' }}>Công trình nghiên cứu của người hướng dẫn</h5><br />
                <DataBaiBaoCbhd readOnly={readOnly} idCbhd={idCbhd} />
            </div>;
        };
        const formNew = () => {
            let idCbhd = 'Temp';
            return <div className='row'>
                <FormSelect ref={e => this['shcc' + idCbhd] = e} label='Cán bộ hướng dẫn' data={SelectAdapter_CanBoHuongDan} className='col-md-6' allowClear readOnly={false} />
                <FormSelect ref={e => this['vaiTro' + idCbhd] = e} label='Vai trò' data={this.selectVaiTro} className='col-md-6' readOnly={false} allowClear />
                <FormRichTextBox ref={e => this['ghiChuCbhd' + idCbhd] = e} maxLength={1999} label='Ghi chú' placeholder='<Chức danh cao nhất> <Học vị cao nhất> <Họ và tên> - <Vai trò>. Vd: PGS TS Nguyễn Văn A - Cán bộ hướng dẫn chính' className='col-md-12' readOnly={false} />
                <h5 className='tile-sub col-md-12' style={{ margin: '5px 5px', color: 'green' }}>Công trình nghiên cứu của người hướng dẫn</h5><br />
                {this.componentBaiBao(idCbhd)}
                <div className='col-md-12 d-flex justify-content-center' style={{ marginTop: 15 }}>
                    <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => e.preventDefault() || this.handleTempCbhd(idCbhd)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Lưu người hướng dẫn
                    </button>
                </div>
                <BaiBaoModal ref={e => this.modalTempBaiBao = e} readOnly={readOnly || !permissionDangKy} temp={true} setData={this.updateTempBaiBao} />
                <BaiBaoModal idCbhd={idCbhd} />
            </div>;
        };

        if (dataCbhd.length == 0) {
            return <div className='col-md-12' style={{ marginTop: 5 }}>
                {!readOnly ? <div className='tile'>
                    <h5 className='text-primary' style={{ color: 'green' }}>Thêm mới người hướng dẫn</h5>
                    {formNew()}
                </div> : ''}</div>;
        } else if (dataCbhd.length == 1) {
            return <div className='col-md-12' style={{ marginTop: 5 }}>
                <BaiBaoModal ref={e => this.modalBaiBao = e} readOnly={readOnly} getData={this.getData} create={this.props.createSdhTsCongTrinhCbhd} update={this.props.updateSdhTsCongTrinhCbhd} />
                <FormChildren title='Chỉnh sửa người hướng dẫn' className='tile' titleClassName='tile-title' titleSize='h5' titleStyle={{ color: 'orange' }} showing={onShow?.sub?.old} content={formOld(dataCbhd[0].id)} />
                {!readOnly ? <FormChildren title='Thêm mới người hướng dẫn' className='tile' titleClassName='tile-title' titleSize='h5' titleStyle={{ color: 'green' }} showing={onShow?.sub?.new} content={formNew(this.temp)} /> : ''}
            </div>;
        } else {
            return <div className='col-md-12' style={{ marginTop: 5 }}>
                <div className='tile'>
                    <BaiBaoModal ref={e => this.modalBaiBao = e} readOnly={readOnly} getData={this.getData} create={this.props.createSdhTsCongTrinhCbhd} update={this.props.updateSdhTsCongTrinhCbhd} />
                    <h5 style={{ color: 'orange' }}>Chỉnh sửa người hướng dẫn</h5>
                    {dataCbhd.map(i => formOld(i.id))}
                </div>
            </div>;
        }
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhTsThiSinhDeTai, deleteSdhTsCbhd
};
export default connect(mapStateToProps, mapActionsToProps)(DataDeTai);
