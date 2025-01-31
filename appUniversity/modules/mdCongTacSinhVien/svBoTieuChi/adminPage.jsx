import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormTextBox, FormCheckbox, getValue, AdminModal, FormRichTextBox, FormSelect, FormTabs } from 'view/component/AdminPage';
import { getAllSvBoTieuChi, updateSvBoTieuChi, createSvBoTieuChi, updateSvBoTieuChiSort, deleteSvBoTieuChi, SelectApdater_SvBoTieuChi, updateSvBoTieuChiSwap, updateSvBoTieuChiDaXoa, deleteBoTieuChi } from './redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmTheTieuChi } from 'modules/mdCongTacSinhVien/dmTheTieuChi/redux';

// const TcGroup = 0, TcSelect = 1, TcRange = 2, TcScalar = 3, TcLinkSuKien = 4;
const TcGroup = 0, TcSelect = 1, TcRange = 2, TcScalar = 3;


class BoTieuChiModal extends AdminModal {
    state = { oldDiemMax: 0, loaiTc: TcGroup }

    onShow = (item) => {
        const { ma, maCha, ten, diemMax, totalMax, coMinhChung, ghiChu, diemMaxCha, loaiTc = 0, theTieuChi = null, lienKetBhyt = false } = item || {};
        const lienKetSuKien = theTieuChi ? true : false;
        this.ten.value(ten || '');
        this.loaiTc.value(loaiTc || 0);
        this.coMinhChung.value(coMinhChung || 0);
        this.ghiChu.value(ghiChu || '');
        // this.theTieuChi.value(theTieuChi.split(','));
        if (loaiTc != 0) {
            this.lienKetSuKien?.value(lienKetSuKien);
            this.lienKetBhyt?.value(lienKetBhyt);
        }
        
        this.setState({ ma, maCha, totalMax, diemMaxCha, diemMax: diemMax ? T.parse(diemMax) : null, item, loaiTc, lienKetSuKien }, () => {
            if (loaiTc == TcRange) {
                const [minVal, maxVal] = T.parse(diemMax);
                this.diemLower.value(minVal);
                this.diemUpper.value(maxVal);
                // } else if (loaiTc == TcLinkSuKien) {
                //     this.diemMax.value(diemMax);
                //     this.theTieuChi.value(theTieuChi.split(','));
            } else if ([TcGroup, TcScalar].includes(loaiTc)) {
                this.diemMax.value(diemMax);
            }
            if (lienKetSuKien) this.theTieuChi?.value(theTieuChi.split(','));
        });
    }

    onSubmit = () => {
        try {
            const action = this.state.ma ? 'Cập nhật' : 'Tạo';
            const data = {
                maCha: this.state.maCha,
                ten: getValue(this.ten),
                loaiTc: getValue(this.loaiTc),
                coMinhChung: getValue(this.coMinhChung) ? 1 : 0,
                ghiChu: getValue(this.ghiChu),
                idBo: this.props.idBo,
            };
            if (this.state.loaiTc == TcRange) {
                data.diemMax = T.stringify([getValue(this.diemLower), getValue(this.diemUpper)]);
            } else if (this.state.loaiTc == TcSelect) {
                data.diemMax = T.stringify(this.state.diemMax);
            } else {
                data.diemMax = getValue(this.diemMax);
            }

            if (this.state.loaiTc != TcGroup) {
                data.lienKetBhyt = getValue(this.lienKetBhyt) ? 1 : 0;
            }

            if (this.state.lienKetSuKien == true){
                data.theTieuChi = getValue(this.theTieuChi).toString();
            }

            T.confirm(action + ' bộ biêu chí', 'Bạn có muốn ' + action + ' tiêu chí này?', isConfirmed => isConfirmed && (
                this.state.ma ?
                    this.props.update(this.state.ma, data, this.hide) :
                    this.props.create(data, this.hide)
            ));
        } catch (error) {
            console.error(error);
            if (error.props) {
                T.notify(`${error.props.label} bị trống!`, 'danger');
            }
        }
    }

    //Action
    deleteDiem = (item) => {
        let currentDiem = [...this.state.diemMax];
        currentDiem = currentDiem.filter(can => can.diem != item.diem);
        this.setState({ diemMax: currentDiem });
    }
    addDiem = () => {
        try {
            const data = {
                diem: getValue(this.newDiem),
                text: getValue(this.newText)
            };
            let currentDiem = this.state.diemMax && this.state.diemMax.length ? [...this.state.diemMax] : [];
            currentDiem.push(data);
            currentDiem.sort((a, b) => parseInt(a.diem) - parseInt(b.diem));
            this.setState({ diemMax: currentDiem }, () => {
                this.newDiem.value('');
                this.newText.value('');
            });
        } catch (input) {
            console.error(input);
            T.notify(`${input.props.header} bị trống!`, 'danger');
        }
    }

    render = () => {
        const readOnly = !this.props.permission.write;
        return this.renderModal({
            title: (this.state.ma ? 'Cập nhật' : 'Tạo') + ' Bộ tiêu chí',
            body: <div className="row">
                <FormTextBox ref={e => this.ten = e} className='col-md-12' label='Tên' required readOnly={readOnly} />
                <FormSelect ref={e => this.loaiTc = e} className='col-md-12' label='Loại tiêu chí' data={[
                    { id: 0, text: 'Nhóm' },
                    { id: 1, text: 'Lựa chọn' },
                    { id: 2, text: 'Khoảng' },
                    { id: 3, text: 'Đơn trị' },
                    // { id: 4, text: 'Liên kết sự kiện' }
                ]} onChange={value => { this.setState({ loaiTc: value.id }); this.lienKetSuKien.value(false); }} required readOnly={readOnly || !!this.state.ma} />
                {[TcScalar, TcGroup].includes(parseInt(this.state.loaiTc)) && <FormTextBox ref={e => this.diemMax = e} type='number' className='col-md-12' label='Điểm tối đa' required readOnly={readOnly} />}
                {this.state.loaiTc == TcRange && <>
                    <FormTextBox ref={e => this.diemLower = e} type='number' className='col-md-6' label='Khoảng đầu' required readOnly={readOnly} />
                    <FormTextBox ref={e => this.diemUpper = e} type='number' className='col-md-6' label='Khoảng cuối' required readOnly={readOnly} />
                </>}
                {this.state.loaiTc == TcSelect && <>
                    <div className='col-md-12'>
                        {renderTable({
                            getDataSource: () => this.state.diemMax && this.state.diemMax.length ? this.state.diemMax : [{}],
                            renderHead: () => (<tr>
                                <th style={{ whiteSpace: 'nowrap' }}>Số điểm</th>
                                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Ghi chú</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                            </tr>),
                            renderRow: <>
                                {this.state.diemMax && this.state.diemMax.length ? this.state.diemMax.map((item, index) => (<tr key={index}>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diem} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.text} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons'>
                                        {!readOnly && <Tooltip title='Xóa' arrow placeholder='bottom'>
                                            <a className='btn btn-danger' href='#' onClick={e => e.preventDefault() || this.deleteDiem(item)}><i className='fa fa-lg fa-trash' /></a>
                                        </Tooltip>}
                                    </TableCell>
                                </tr>)) : null}
                                {!readOnly && <tr>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormTextBox ref={e => this.newDiem = e} header='Số điểm' type='number' required />} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormTextBox ref={e => this.newText = e} header='Ghi chú' required />} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons'>
                                        <Tooltip title='Thêm' arrow placeholder='bottom'>
                                            <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.addDiem()}><i className='fa fa-lg fa-plus' /></a>
                                        </Tooltip>
                                    </TableCell>
                                </tr>}
                            </>
                        })}
                    </div>
                </>
                }
                {/* {this.state.loaiTc == TcLinkSuKien && <>
                    <FormTextBox ref={e => this.diemMax = e} type='number' className='col-md-12' label='Điểm tối đa' required readOnly={readOnly} />
                </>} */}
                {/* <FormTextBox ref={e => this.diemMax = e} type='number' className='col-md-12' label='Điểm tối đa' required /> */}
                {this.state.loaiTc != TcGroup && <>
                    <FormCheckbox ref={e => this.lienKetSuKien = e} className='col-md-6' label='Liên kết sự kiện' readOnly={readOnly} onChange={(value) => { this.setState({ lienKetSuKien: value }); this.lienKetBhyt?.value(false); this.theTieuChi?.value(''); }} />
                </>}
                {this.state.loaiTc == TcSelect && <FormCheckbox ref={e => this.lienKetBhyt = e} className='col-md-6' label='Liên kết bảo hiểm y tế' readOnly={readOnly} onChange={() => { this.setState({ lienKetSuKien: false }); this.lienKetSuKien?.value(false); }} />}
                {this.state.lienKetSuKien && <FormSelect ref={e => this.theTieuChi = e} data={SelectAdapter_DmTheTieuChi} className='col-md-12' label='Thẻ tiêu chí' multiple required readOnly={readOnly} />}

                <FormCheckbox ref={e => this.coMinhChung = e} className='col-md-12' label='Yêu cầu minh chứng' readOnly={readOnly} />
                <FormRichTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú' readOnly={readOnly} />
            </div>,
            submitText: this.state.ma ? 'Cập nhật' : 'Tạo'
        });
    }
}

class TieuChiItemCollapse extends React.Component {
    state = { isExpand: true }
    expand = () => {
        this.setState({ isExpand: true });
    };

    handelExpand = () => {
        this.setState(prevState => ({
            isExpand: !prevState.isExpand
        }));
    }

    handleDelete = (ma) => {
        const data = {
            isDelete: 1,
            idBo: this.props.idBo
        };
        T.confirm('Xóa dữ liệu tiêu chí', 'Bạn có chắc muốn xóa dữ liệu tiêu chí này?', isConfirmed => isConfirmed && (
            this.props.deleteBoTieuChi(ma, data, this.hide)));
    }

    handleUndo = (ma) => {
        const data = {
            isDelete: 0,
            idBo: this.props.idBo
        };
        T.confirm('Hoàn tác dữ liệu tiêu chí', 'Bạn có chắc muốn hoàn tác dữ liệu tiêu chí này?', isConfirmed => isConfirmed && (
            this.props.updateSvBoTieuChiDaXoa(ma, data, this.hide)));
    }

    render() {
        const { item, prefix, index = 0, permission, level = 0, isDeleted, ...props } = this.props;

        return <>
            <tr className={(item.loaiTc == TcGroup ? 'font-weight-bold ' : '') + ` muc-${item.maCha || ''}`} >
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={`${prefix}${index + 1}`} />
                <TableCell style={{ width: 'auto' }} type={item.loaiTc == 0 ? 'link' : ''} onClick={e => e.preventDefault() || this.handelExpand()} content={<div style={{ paddingLeft: `${level * 1.5}em`, display: 'inline-block' }}>
                    <span className='pr-2'>{item.ten}</span>
                    {item.ghiChu && <Tooltip title={item.ghiChu} arrow placeholder='right'><i className="pr-2 fa fa-info-circle"></i></Tooltip>}
                    {/* {item.subItems.length ? <span className='badge badge-danger'>{item.subItems.length}</span> : null} */}
                </div>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                    item.loaiTc == TcSelect ? T.parse(item.diemMax).map((_item) => _item.diem).join('/')
                        : item.loaiTc == TcRange ? T.parse(item.diemMax).join('-')
                            : item.diemMax
                } />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diemMax + ' ' + item.loaiTc} /> */}
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.subItems.length ? '' : item.coMinhChung ? <i className='fa fa-check text-success'></i> : ''} />
                {/* {!isDeleted ?
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='checkbox' content={item.kichHoat} permission={permission} onChanged={value => this.props.update(item.ma, { kichHoat: value })} /> : null} */}
                {!isDeleted ? <>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='checkbox' content={item.kichHoat} permission={permission} onChanged={value => this.props.update(item.ma, { kichHoat: value })} />
                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} onDelete={() => this.handleDelete(item.ma)} onSwap={(e, content, isUp) => this.props.onSwap(e, content, index, isUp)} content={item} permission={permission}>
                        {this.props.permission.write && item.loaiTc == TcGroup && <Tooltip title='Thêm' arrow placeholder='bottom'>
                            <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.props.showModal({ maCha: item.ma, totalMaxCha: 0, diemMaxCha: item.diemMax })}><i className={'fa fa-lg  fa-plus'} /></a>
                        </Tooltip>}
                        <Tooltip title={permission.write ? 'Chỉnh sửa' : 'Xem'} arrow placeholder='bottom'>
                            <a className='btn btn-primary' href='#' onClick={e => e.preventDefault() || this.props.showModal(item)}><i className={'fa fa-lg ' + (permission.write ? 'fa-edit' : 'fa-eye')} /></a>
                        </Tooltip>
                        {/* <Tooltip title='Sắp xếp' arrow placeholder='bottom'>
						<button className='btn btn-light sort-handler'><i className={'fa fa-lg fa-sort'} /></button>
					</Tooltip> */}
                    </TableCell>
                </>
                    : (item.maCha == null || level == 0) &&
                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item} permission={permission}>
                        <Tooltip title={'Hoàn tác'} arrow placeholder='bottom'>
                            <a className='btn btn-danger' href='#' onClick={() => this.handleUndo(item.ma)}><i className={'fa fa-lg fa-undo'} /></a>
                        </Tooltip>
                    </TableCell>}
            </tr>
            {this.state.isExpand && <TieuChiGroup list={item.subItems} prefix={`${prefix}${index + 1}.`} level={level + 1} permission={permission} {...props} isDeleted={isDeleted} />}
        </>;
    }
}

class TieuChiGroup extends React.Component {
    state = { isExpand: [] }
    list = []

    collapse = () => this.setState({ isExpand: false });

    delete = (ma) => {
        T.confirm('Xác nhận xóa tiêu chí?', '', isConfirm => {
            if (isConfirm) {
                this.props.delete(ma);
            }
        });
    }

    onSwap = (e, content, index, isUp) => {
        if (content.kichHoat == 1) {
            const dest = this.props.list[isUp ? index - 1 : index + 1];
            if (dest && dest.kichHoat == 1) {
                const { ma: srcMa, stt: srcStt } = content;
                const { ma: destMa, stt: destStt } = dest;
                this.props.updateSwap(srcMa, destMa, srcStt, destStt);
            }
        }
    }

    handelExpand = () => {
        this.setState(prevState => ({
            isExpand: !prevState.isExpand
        }));
    }

    render() {
        // const { list, permission, level = 0, prefix = '', ...props } = this.props;
        const { list, prefix = '', ...props } = this.props;

        // const list = this.state.list || [];
        return this.state.isExpand && list.map((item, index) => (
            <TieuChiItemCollapse key={`${prefix}${index + 1}`} item={item} prefix={prefix} index={index} {...props} onSwap={this.onSwap} />
        ));
    }
}

class BoTieuChiAdminPage extends AdminPage {
    state = { editId: null, maCha: null, isSorting: false, isExpand: true, idBo: null, tab: 0 };

    componentDidMount() {
        this.load();
    }

    setFixWidthHelper = () => {
        $('table.bo-tieu-chi thead tr *, table.bo-tieu-chi tbody.tieu-chi-cha tr *, table.bo-tieu-chi tbody.total tr *').each(function () {
            $(this).width($(this).width());
        });
    }

    load = (done) => {
        const router = T.routeMatcher('/user/ctsv/bo-tieu-chi/:id');
        const id = router.parse(window.location.pathname).id;
        this.props.getAllSvBoTieuChi(id, this.state.tab, data => {
            const { dataBotieuChi, items } = data;
            this.setState({ list: items, idBo: dataBotieuChi.id, title: dataBotieuChi.ten, canEdit: dataBotieuChi.canEdit });
            done && done();
        });
    }

    componentTieuChiDanhGia = (permission) => {
        const list = this.state.list || [];
        let diemTc = list.filter(item => !item.maCha && item.kichHoat == 1).reduce((cur, item) => cur + parseInt(item.diemMax), 0);
        return renderTable({
            getDataSource: () => list || [],
            multipleTbody: true,
            className: 'bo-tieu-chi',
            stickyHead: true,
            renderHead: () => (<tr>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Tiêu chí</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Điểm tối đa</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Cần minh chứng</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Kích hoạt</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thao tác</th>
            </tr>),
            renderRow: <>
                <tbody className='#bo-tieu-chi'>
                    <TieuChiGroup list={list} permission={permission} showModal={this.modal?.show} update={this.update} deleteBoTieuChi={this.deleteBoTieuChi} expand={this.state.isExpand} delete={(ma, done) => this.props.deleteSvBoTieuChi(ma, () => this.load(done))} updateSwap={this.updateSwap} />
                </tbody>
                <tfoot className='total'>
                    <tr>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'left' }} colSpan='2'><b>Tổng cộng điểm</b></th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'left', ...(diemTc >= 100 ? { color: 'green' } : { color: 'red' }) }} colSpan='4'>{Math.min(100, diemTc)}{diemTc >= 100 ? <i className='fa fa-check pl-3'></i> : null}</th>
                    </tr>
                </tfoot>
            </>,
        });
    }

    componentTieuChiDaXoa = (permission) => {
        const list = this.state.list || [];
        return renderTable({
            getDataSource: () => list || [],
            multipleTbody: true,
            className: 'bo-tieu-chi',
            stickyHead: true,
            renderHead: () => (<tr>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Tiêu chí</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Điểm tối đa</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Cần minh chứng</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thao tác</th>
            </tr>),
            renderRow: <>
                <tbody className='#bo-tieu-chi'>
                    <TieuChiGroup list={list} permission={permission} showModal={this.modal?.show} update={this.update} updateSvBoTieuChiDaXoa={this.updateSvBoTieuChiDaXoa} deleteBoTieuChi={this.deleteBoTieuChi} expand={this.state.isExpand} delete={(ma, done) => this.props.deleteSvBoTieuChi(ma, () => this.load(done))} updateSwap={this.updateSwap} isDeleted={true} />
                </tbody>
            </>,
        });
    }

    create = (data, done) => this.props.createSvBoTieuChi(data, () => this.load(done));

    update = (ma, changes, done) => this.props.updateSvBoTieuChi(ma, changes, () => this.load(done));

    deleteBoTieuChi = (ma, changes, done) => this.props.deleteBoTieuChi(ma, changes, () => this.load(done));

    updateSvBoTieuChiDaXoa = (ma, changes, done) => this.props.updateSvBoTieuChiDaXoa(ma, changes, () => this.load(done));

    updateSort = (ma, maCha, oldIndex, newIndex, done) => this.props.updateSvBoTieuChiSort(ma, maCha, oldIndex, newIndex, () => this.load(done))

    updateSwap = (srcMa, destMa, srcStt, destStt, done) => this.props.updateSvBoTieuChiSwap(srcMa, destMa, srcStt, destStt, () => this.load(done))

    render() {
        const permission = this.getUserPermission('ctsvBoTieuChi', ['manage', 'write', 'delete']);
        if (!this.state.canEdit) {
            permission.write = false;
            permission.delete = false;
        }

        return this.renderPage({
            title: this.state.title || 'Bộ tiêu chí',
            icon: 'fa fa-book',
            // content: <div className="tile">
            //     {this.componentTable(permission)}
            //     <BoTieuChiModal ref={e => this.modal = e} idBo={this.state.idBo} update={this.update} create={this.create} permission={permission} />
            // </div>,
            content: (
                <>
                    <FormTabs
                        contentClassName='tile'
                        ref={e => this.tabs = e}
                        // onChange={this.onChangeTab}
                        onChange={({ tabIndex }) => {
                            this.setState({ isLoading: true, tab: tabIndex }, this.load);
                        }}
                        tabs={[
                            { id: 0, title: 'Tiêu chí đánh giá', component: this.componentTieuChiDanhGia(permission) },
                            { id: 1, title: 'Tiêu chí đã xóa', component: this.componentTieuChiDaXoa(permission) },
                        ]}
                    />
                    <BoTieuChiModal ref={e => this.modal = e} idBo={this.state.idBo} update={this.update} create={this.create} updateSvBoTieuChiDaXoa={this.updateSvBoTieuChiDaXoa} deleteBoTieuChi={this.deleteBoTieuChi} permission={permission} />
                </>
            ),
            backRoute: '/user/ctsv/bo-tieu-chi',
            breadcrumb: [
                <Link key={1} to='/user/ctsv'>Công tác sinh viên</Link>,
                <Link key={2} to='/user/ctsv/bo-tieu-chi'>Danh sách bộ tiêu chí</Link>,
                'Bộ tiêu chí đánh giá'
            ],
            onCreate: () => this.modal.show()
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvBoTieuChi: state.ctsv.ctsvBoTieuChi });
const mapActionsToProps = { getAllSvBoTieuChi, updateSvBoTieuChi, createSvBoTieuChi, updateSvBoTieuChiSort, deleteSvBoTieuChi, SelectApdater_SvBoTieuChi, updateSvBoTieuChiSwap, updateSvBoTieuChiDaXoa, deleteBoTieuChi };
export default connect(mapStateToProps, mapActionsToProps)(BoTieuChiAdminPage);