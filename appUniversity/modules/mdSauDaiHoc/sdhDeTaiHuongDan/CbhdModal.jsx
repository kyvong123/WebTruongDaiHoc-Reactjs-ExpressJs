import React from 'react';
import { SelectAdapter_CanBoHuongDan } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { AdminModal, TableCell, renderTable, FormSelect, FormRichTextBox } from 'view/component/AdminPage';
import { BaiBaoModal } from 'modules/mdSauDaiHoc/sdhTsBaiBao/BaiBaoModal';

export class CbhdModal extends AdminModal {
    state = { baiBao: [], shcc: '', item: '' }
    componentDidMount() {
        $(this.modal).modal({ backdrop: 'static', keyboard: false, show: false });
    }
    onShow = (item) => {
        console.log(item);
        let { shcc } = item || { shcc: '' };
        if (!this.props.temp) {
            this.setState({ shcc, item, baiBao: item.baiBao }, () => {
                if (shcc) {
                    for (const prop in item) {
                        if (prop == 'baiBao') {
                            continue;
                        }
                        this[prop]?.value(item[prop] || '');
                    }
                } else {
                    this.shcc.value('');
                    this.vaiTro.value('');
                    this.ghiChu.value('');
                }
            });
        } else {
            this.setState({ shcc, item }, () => {
                if (shcc) {
                    for (const prop in item) {
                        if (prop == 'baiBao') {
                            continue;
                        }
                        this[prop]?.value(item[prop] || '');
                    }
                } else {
                    this.shcc.value('');
                    this.vaiTro.value('');
                    this.ghiChu.value('');
                }
            });
        }

    }
    handleBaiBao = (action, transferData, done) => {
        let idCbhd = this.shcc.value();
        let cbhd = this.state.cbhds.find(i => i.idCbhd == idCbhd);
        let { baiBao } = cbhd;
        if (action == 'create') {
            let idBaiBao = Number(baiBao?.length || 0) + 1;
            baiBao = baiBao.filter(i => i.idBaiBao != idBaiBao);
            baiBao.push({ idBaiBao, transferData });
            this.setState({ cbhds: [...this.state.cbhds.filter(i => i.idCbhd != idCbhd), { ...cbhd, baiBao }], }, () => done && done());
        }
    }

    onSubmit = () => {
        // e.preventDefault();
        // const changes = {
        //     tenDeTai: getValue(this.tenDeTai),
        //     ghiChu: getValue(this.ghiChu),
        //     shccs: getValue(this.shccs),
        //     ghiChu: this.state.item.isXetDuyet,
        // };
        // if (!this.props.temp) {
        //     changes.idThiSinh = this.state.item.idThiSinh;
        //     this.state.idDeTai ? this.props.update(this.state.idDeTai, changes, () => {
        //         this.props.permission && this.props.getData();
        //         this.hide();
        //     }) : this.props.create(changes, () => {
        //         this.props.permission && this.props.getData();
        //         this.hide();
        //     });
        // } else {
        //     changes.idDeTai = this.state.idDeTai;
        //     changes.listCbhd = this.shccs.data()?.map(item => ({ tenCbhd: item.text }));
        //     this.props.setData(this.state.idDeTai ? 'update' : 'create', changes, () => this.hide());//set temp not database
        // }
    }
    selectVaiTro = [{ id: 'Cán bộ hướng dẫn chính', text: 'Cán bộ hướng dẫn chính' }, { id: 'Cán bộ hướng dẫn phụ', text: 'Cán bộ hướng dẫn phụ' }, { id: 'Cán bộ hướng dẫn độc lập', text: 'Cán bộ hướng dẫn độc lập' }]; //phân biệt 1 2 và đồng hướng dẫn;

    render = () => {
        const readOnly = this.props.readOnly;
        let tableBaiBao = renderTable({
            getDataSource: () => this.state.baiBao || [],
            stickyHead: false,
            emptyTable: 'Chưa có thông tin bài báo được thêm',
            header: 'light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '45%' }}>Tên bài báo</th>
                    <th style={{ width: '45%' }}>Ghi chú</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell content={item.tenBaiBao} />
                    <TableCell content={item.ghiChu} />
                    <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'center' }} permission={{ write: true, delete: true }} content={item} onEdit={e => e.preventDefault() || this.onEdit(item)} onDelete={e => e.preventDefault() || T.confirm('Xoá bài báo', 'Bạn có xác nhận xoá bài báo trên?', true, isConfirm => isConfirm && this.props.deleteSdhTsBaiBao(item.idBaiBao, () => this.getData()))} />
                </tr>
            )
        });
        return this.renderModal({
            title: this.state.idDeTai ? 'Cập nhật thông tin người hướng dẫn' : 'Thêm thông tin người hướng dẫn',
            size: 'large',

            body:
                <div className='row'>
                    <BaiBaoModal ref={e => this.modalBaiBao = e} modalCbhd={this} readOnly={false} temp={true} setData={this.handleBaiBao} />
                    <h5 className='tile-sub col-md-12' style={{ marginBottom: '5px' }}>Thông tin nguời hướng dẫn</h5><br />
                    <strong className='text-danger' style={{ paddingLeft: 15 }}>Trường hợp không tìm thấy cán bộ hướng dẫn (CBHD) hoặc cán bộ ngoài trường, vui lòng nhập ở ghi chú theo mẫu</strong><br />
                    <FormSelect ref={e => this.shcc = e} label='Cán bộ hướng dẫn' data={SelectAdapter_CanBoHuongDan} className='col-md-6' allowClear readOnly={readOnly} />
                    <FormSelect ref={e => this.vaiTro = e} label='Vai trò' data={this.selectVaiTro} className='col-md-6' readOnly={readOnly} allowClear />
                    <FormRichTextBox ref={e => this.ghiChu = e} maxLength={1999} label='Ghi chú' placeholder='<Chức danh cao nhất> <Học vị cao nhất> <Họ và tên> - <Vai trò>. Vd: PGS TS Nguyễn Văn A - Cán bộ hướng dẫn 1' className='col-md-12' readOnly={false} />
                    <h5 className='tile-sub col-md-12' style={{ marginBottom: '5px' }}><i className='fa fa-sign-in' aria-hidden='true'>Công trình nghiên cứu khoa học</i></h5><br />
                    <div className='col-md-12'>
                        {tableBaiBao}
                    </div>
                    {this.state.baiBao.length <= 5 ? <div className='col-md-12 d-flex justify-content-begin'>
                        <button type='button' className='btn btn-success rounded-0' data-dismiss='modal' onClick={(e) => e.preventDefault() || this.modalBaiBao.show(this.state.item)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm bài báo
                        </button>
                    </div> : null}
                    {/* <FormTextBox ref={e => this.tenBaiBao = e} label='Tên bài báo' className='col-md-12' required />
                    <FormTextBox ref={e => this.tenTapChi = e} label='Tên tạp chí' className='col-md-12' required />
                    <FormTextBox ref={e => this.chiSo = e} label='Chỉ số tạp chí' className='col-md-4' required />
                    <FormTextBox ref={e => this.thoiGianDang = e} label='Thời gian đăng' className='col-md-4' required />
                    <FormTextBox ref={e => this.diemBaiBao = e} label='Điểm bài báo' className='col-md-4' required /> */}
                </div>
        });
    }
}