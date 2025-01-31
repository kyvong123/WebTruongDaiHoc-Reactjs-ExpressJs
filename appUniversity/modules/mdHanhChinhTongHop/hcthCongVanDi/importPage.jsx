import { Tooltip } from '@mui/material';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmLoaiVanBan } from 'modules/mdDanhMuc/dmLoaiVanBan/redux/dmLoaiVanBan';
import { SelectAdapter_FwCanBoByDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { SelectAdapter_HcthVanBanDiStatusSystem } from '../hcthVanBanDiStatusSystem/redux/statusSystem';
import { getResult, create } from './redux/importPage';
const columnData = Array.from(Array(26).keys()).map(item => String.fromCharCode(65 + item));
import moment from 'moment';
import { SelectAdapter_HcthQuySo } from '../hcthPhanCapQuySo/redux/quySo';


class ImportPage extends AdminPage {
    state = { remove: [] }
    componentDidMount() {
        T.ready('/user/hcth', () => {
            this.soVanBanColumn?.value('A');
            this.ngayGuiColumn?.value('B');
            this.ngayKyColumn?.value('C');
            this.trichYeuColumn?.value('D');
            this.shccColumn?.value('G');
            this.loaiVanBanColumn?.value('H');
            this.index?.value(2);
        });
    }

    handleFile = () => {
        this.setState({ uploading: true });
        this.fileBox.onUploadFile({});
    }

    getResult = (data) => {
        if (data.error) {
            T.notify(data.error.message || data.error, 'danger');
            this.setState({ uploading: false });

        } else {
            this.props.getResult(data.fileName, {
                getResult: this.soVanBanColumn.value(),
                ngayGuiColumn: this.ngayGuiColumn.value(),
                ngayKyColumn: this.ngayKyColumn.value(),
                trichYeuColumn: this.trichYeuColumn.value(),
                shccColumn: this.shccColumn.value(),
                loaiVanBanColumn: this.loaiVanBanColumn.value(),
                index: this.index.value(),
                donVi: this.donVi.value(),
                quySo: this.quySo.value(),
            }, (items) => this.setState({ items, uploading: false }), () => this.setState({ uploading: false }));
        }
    }

    onEdit = (index, item) => {
        this.setState({ updateIndex: index }, () => {
            this.soVanBan?.value(item.soVanBan);
            this.soDi?.value(item.soDi);
            this.canBo?.value(item.shcc);
            this.trichYeu?.value(item.trichYeu);
            this.ngayGui?.value(item.ngayGui ? new Date(item.ngayGui) : '');
            this.ngayDi?.value(item.ngayDi ? new Date(item.ngayDi) : '');
            this.loaiVanBan?.value(item.loaiVanBanItem ? item.loaiVanBanItem.id : '');
        });
    }

    onRemove = (index) => {
        const current = this.state.remove;
        current.push(index);
        this.setState({ remove: current });
    }

    onSaveUpdate = (index, oldItem) => {
        const item = {
            ...oldItem,
            soVanBan: this.soVanBan.value(),
            soDi: this.soDi?.value(),
            canBo: this.canBo?.data(),
            shcc: this.canBo?.value(),
            trichYeu: this.trichYeu?.value(),
            ngayGui: this.ngayGui?.value(),
            ngayKy: this.ngayKy?.value(),
            loaiVanBan: this.loaiVanBan?.data()?.id,
            loaiVanBanItem: this.loaiVanBan?.data(),
        };
        item.ngayGui && (item.ngayGui = item.ngayGui.getTime());
        item.ngayKy && (item.ngayKy = item.ngayKy.getTime());
        item.loaiVanBanItem && (item.loaiVanBanItem = { ten: item.loaiVanBanItem.text, id: item.loaiVanBanItem.id, ma: item.loaiVanBanItem.ma });
        item.canBo && (item.canBo = { shcc: item.canBo.shcc, ten: item.canBo.text, });
        // item.loaiVanBanItem && (item.loaiVanBanItem = { ten: item.loaiVanBanItem.text, id: item.loaiVanBanItem.id, ma: item.loaiVanBanItem.ma });
        this.setState({
            items: [...this.state.items.slice(0, index), item, ...this.state.items.slice(index + 1)], updateIndex: null
        });
    }

    onSubmit = () => {
        const data = {
            items: this.state.items.filter((item, index) => !this.state.remove.includes(index)),
            donVi: this.state.donVi,
            systemId: this.systemId.value(),
            quySo: this.quySo.value(),
        };
        this.setState({ saving: true }, () => {
            this.props.create(data, () => this.setState({ saving: false }), () => this.setState({ saving: false }));
        });
    }

    onRecover = (index) => {
        this.setState({ remove: this.state.remove.filter(item => item != index) });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-upload',
            title: 'Cập nhật danh sách văn bản',
            content: <div>
                <div className="tile">
                    <div className="tile-body row">
                        <div className="col-md-12">
                            <FileBox pending className='' ref={e => this.fileBox = e} label='Tải lên tập tin văn bản' postUrl='/user/upload' uploadType='hcthVanBanDiImport' userData='hcthVanBanDiImport' style={{ width: '100%', backgroundColor: '#fdfdfd' }} success={this.getResult} />
                        </div>
                        <FormSelect className='col-md-6' label='Đơn vị' data={SelectAdapter_DmDonVi} ref={e => this.donVi = e} onChange={value => this.setState({ donVi: value.id })} />
                        <FormTextBox className='col-md-6' label='Dòng dữ liệu bắt đầu' type='number' ref={e => this.index = e} />
                        <FormSelect key={`${'TRUONG'}-${this.state.donVi}-${1}`} ref={e => this.systemId = e} className='col-md-6' label='Quy trình phát hành' data={SelectAdapter_HcthVanBanDiStatusSystem([this.state.donViGui], 'TRUONG', 1)} required />
                        <FormSelect className='col-md-6' label='Quỹ số' ref={e => this.quySo = e} data={SelectAdapter_HcthQuySo} />
                        <h3 className='form-group col-md-12'>Thông tin cột dữ liệu</h3>
                        <FormSelect className='col-md-3' label='Số văn bản' ref={e => this.soVanBanColumn = e} data={columnData} />
                        <FormSelect className='col-md-3' label='Ngày gửi' ref={e => this.ngayGuiColumn = e} data={columnData} />
                        <FormSelect className='col-md-3' label='Ngày ký' ref={e => this.ngayKyColumn = e} data={columnData} />
                        <FormSelect className='col-md-3' label='Trích yếu' ref={e => this.trichYeuColumn = e} data={columnData} />
                        <FormSelect className='col-md-3' label='Mã số cán bộ(VD. 000.0000)' ref={e => this.shccColumn = e} data={columnData} />
                        <FormSelect className='col-md-3' label='Loại văn bản' ref={e => this.loaiVanBanColumn = e} data={columnData} />
                        <div className="col-md-12 d-flex justify-content-end">
                            <button className='btn btn-success' onClick={(e) => e.preventDefault() || (!this.state.uploading && this.handleFile())}>
                                <i className={this.state.uploading ? 'fa fa-spin fa-spinner' : 'fa fa-upload'} />Bắt đầu xử lý dữ liệu
                            </button>
                        </div>
                    </div>
                </div>
                {this.state.items && <div className='tile'>
                    <div className="d-flex form-group justify-content-between">
                        <h3 className="tile-header">Kết quả</h3>
                        <button className='btn btn-primary' onClick={e => e.preventDefault() || this.onSubmit()}>
                            <i className={this.state.saving ? 'fa fa-spin fa-spinner' : 'fa fa-lg fa-save'} /> Lưu
                        </button>
                    </div>
                    <div className="tile-body row">
                        <div className="col-md-12">

                            {renderTable({
                                getDataSource: () => this.state.items,
                                stickyHead: true,
                                style: { maxHeight: '70vh' },
                                renderHead: () => <tr>
                                    <th style={{ whiteSpace: 'nowrap', width: 'auto', textAlign: 'center' }}>#</th>
                                    <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Số văn bản</th>
                                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Số đi</th>
                                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày gửi</th>
                                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày ký</th>
                                    <th style={{ whiteSpace: 'nowrap', width: '80%' }}>Trích yếu</th>
                                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Loại văn bản</th>
                                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Cán bộ xử lý</th>
                                    <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thao tác</th>
                                </tr>,
                                renderRow: (item, index) => {
                                    const isRemove = this.state.remove.includes(index);
                                    if (this.state.updateIndex != index)
                                        return <tr key={index} className={isRemove ? 'table-danger' : ''}>
                                            <TableCell content={index + 1} />
                                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soVanBan} />
                                            <TableCell content={item.soDi} />
                                            <TableCell content={item.ngayGui && moment(new Date(item.ngayGui)).format('DD/MM/YYYY')} />
                                            <TableCell content={item.ngayKy && moment(new Date(item.ngayKy)).format('DD/MM/YYYY')} />
                                            <TableCell content={item.trichYeu} />
                                            <TableCell content={item.loaiVanBanItem && item.loaiVanBanItem.ten} />
                                            <TableCell content={item.canBo && `${item.canBo.ho || ''} ${item.canBo.ten || ''}`.normalizedName()} />
                                            <TableCell type='buttons' >
                                                <Tooltip title='Chinh sửa'>
                                                    <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.onEdit(index, item)}>
                                                        <i className='fa fa-pencil' />
                                                    </button>
                                                </Tooltip>
                                                {!isRemove && <Tooltip title='Xóa'>
                                                    <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.onRemove(index, item)}>
                                                        <i className='fa fa-trash' />
                                                    </button>
                                                </Tooltip>}
                                                {isRemove && <Tooltip title='Phục hồi'>
                                                    <button className='btn btn-warning' onClick={(e) => e.preventDefault() || this.onRecover(index, item)}>
                                                        <i className='fa fa-history' />
                                                    </button>
                                                </Tooltip>}
                                            </TableCell>
                                        </tr>;
                                    else {
                                        return <tr key={index} className='table-primary'>
                                            <TableCell content={index + 1} />
                                            <TableCell content={<FormTextBox ref={e => this.soVanBan = e} />} />
                                            <TableCell style={{ minWidth: '80px' }} content={<FormTextBox ref={e => this.soDi = e} />} />
                                            <TableCell style={{ minWidth: '150px' }} content={<FormDatePicker ref={e => this.ngayGui = e} />} />
                                            <TableCell style={{ minWidth: '150px' }} content={<FormDatePicker type='date' ref={e => this.ngayKy = e} />} />
                                            <TableCell content={<FormTextBox ref={e => this.trichYeu = e} />} />
                                            <TableCell content={<FormSelect ref={e => this.loaiVanBan = e} data={SelectAdapter_DmLoaiVanBan} />} />
                                            <TableCell content={<FormSelect ref={e => this.canBo = e} data={SelectAdapter_FwCanBoByDonVi([this.state.donVi])} />} />
                                            <TableCell type='buttons' >
                                                <Tooltip title='Lưu'>
                                                    <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.onSaveUpdate(index, item)}>
                                                        <i className='fa fa-save' />
                                                    </button>
                                                </Tooltip>
                                            </TableCell>
                                        </tr>;
                                    }
                                }
                            })}
                        </div>
                    </div>
                </div>}
            </div>
        });
    }
}


const stateToProps = (state) => ({ system: state.system });
const actionToProps = { getResult, create };
export default connect(stateToProps, actionToProps)(ImportPage);