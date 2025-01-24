import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTextBox, FormCheckbox, FormRichTextBox, getValue, FormFileBox, renderTable, TableCell, FormSelect, FormTabs } from 'view/component/AdminPage';
import { createSvDmFormType, updateSvDmFormType, SelectAdapter_CtsvDmFormTypeParamType } from './redux';
import { Chip, Tooltip } from '@mui/material';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

class AdjustFormTypeModal extends AdminModal {
    state = { dataParam: [], isLoading: false, selectParam: [], tableCols: [], isMultiple: false }
    customField = ['maBien', 'tenBien', 'type', 'isRequired']
    data = {}
    onHide = () => {
        // this.srcPath.setData()
    }
    onShow = (item) => {
        let { heDaoTao = '', kieuForm = '', namHoc = '', kichHoat = 1, ma = '', ten = '', chuThich = '', srcPath = '', timeModified = '', allowDownload = 0, multiple = 0, nProcessDay = 2, parameters = '', customParam = [], loaiHinhDaoTao = null, khoaSinhVien = null } = item || {};
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.chuThich.value(chuThich);
        this.heDaoTao.value(heDaoTao);
        this.kieuForm.value(kieuForm);
        this.loaiHinhDaoTao.value(loaiHinhDaoTao?.split(','));
        this.khoaSinhVien.value(khoaSinhVien?.split(','));
        this.namHoc.value(namHoc || T.cookie('svDmFormType:CurYear') || '');
        this.allowDownload.value(allowDownload || 0);
        this.isMultiple.value(multiple || 0);
        this.nProcessDay.value(nProcessDay);
        this.srcPath.setData('FormTypeUpload', !item);
        customParam.map(item => {
            item.maBien = item.ma;
            item.data = typeof (item.data) == 'string' ? JSON.parse(item.data) : item.data;
            return item;
        });
        this.setState({ typeParam: 'Text', isMultiple: Boolean(multiple), ma, ten, srcPath, timeModified, namHoc: namHoc || T.cookie('svDmFormType:CurYear') || '', parameters: parameters ? parameters.split(',') : [], dataParam: customParam }, () => {
            if (this.state.isMultiple) this.multiple.value(multiple || 0);
            this.load();
        });
    }

    load = (done) => {
        $('table.custom-param').sortable({
            items: '> tbody tr',
            helper: this.fixWidthHelper,
            start: (e, ui) => {
                $(this).attr('data-prevIndex', ui.item.index());
            },
            update: (e, ui) => {
                e.preventDefault();
                const newPriority = ui.item.index();
                const oldPriority = $(this).attr('data-prevIndex');
                const currentItem = this.state.dataParam[oldPriority];
                let newDataParam = [...this.state.dataParam];
                newDataParam.splice(oldPriority, 1);
                newDataParam.splice(newPriority, 0, currentItem);
                this.setState({ dataParam: newDataParam });
            }
        }).disableSelection();
        done && done();
    };

    onSubmit = () => {
        if (!this.state.srcPath) {
            T.notify('Vui lòng upload file form đã chèn biến', 'danger');
        } else {
            const data = {
                isSubmit: true,
                ma: getValue(this.ma),
                ten: getValue(this.ten),
                namHoc: getValue(this.namHoc),
                kichHoat: getValue(this.kichHoat),
                chuThich: getValue(this.chuThich),
                heDaoTao: getValue(this.heDaoTao),
                kieuForm: getValue(this.kieuForm),
                khoaSinhVien: getValue(this.khoaSinhVien).join(','),
                loaiHinhDaoTao: getValue(this.loaiHinhDaoTao).join(','),
                allowDownload: getValue(this.allowDownload) ? 1 : 0,
                multiple: this.multiple ? getValue(this.multiple) : 0,
                nProcessDay: getValue(this.nProcessDay),
                srcPath: this.state.srcPath,
                parameters: this.state.parameters ? this.state.parameters.join(',') : null,
                customParam: this.state.dataParam.map(item => {
                    item.data = JSON.stringify(item.data);
                    return item;
                }),
            };
            this.setState({ dataParam: [] });
            this.state.ma ? this.props.updateSvDmFormType(this.state.ma, data, this.hide) : this.props.createSvDmFormType(data, this.hide);
        }

    }

    onDownload = (e) => {
        e.preventDefault();
        T.handleDownload(`/api/ctsv/form-type/download?ma=${this.state.ma}`);
    }

    onUploadSuccess = (result) => {
        if (result.error) {
            T.notify(`Lỗi: ${result.error}`, 'danger');
            console.error(result.error);
        } else {
            T.notify('Upload thành công', 'success');
            this.setState({ ...result, srcPath: result.fileName });
        }
    }

    componentFormSetting = (readOnly, listParams = [], system) => (
        <div className='row'>
            <div className='form-group col-md-8'>
                <div className='row'>
                    <FormSelect ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} label='Năm học' className='col-md-3' />
                    <FormSelect ref={e => this.kieuForm = e} data={[{ id: 0, text: 'Chứng nhận' }, { id: 1, text: 'Quyết định ra' }, { id: 2, text: 'Quyết định vào' }, { id: 3, text: 'Quyết định khác' }]} className='col-md-6' label='Loại form' required />
                    <FormCheckbox isSwitch ref={e => this.kichHoat = e} label='Kích hoạt' readOnly={readOnly} className='col-md-3' />
                    <FormTextBox ref={e => this.ma = e} label='Mã' smallText='Tối đa 10 ký tự' readOnly={readOnly} className='col-md-3' maxLength='10' required />
                    <FormTextBox ref={e => this.ten = e} label='Tên chứng nhận/quyết định' smallText='Hiển thị cho sinh viên' readOnly={readOnly} className='col-md-6' />
                    <FormTextBox ref={e => this.nProcessDay = e} label='Thời gian xử lý' smallText='Số ngày sinh viên sẽ đến nhận' type='number' readOnly={readOnly} className='col-md-3' required />
                    <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-6' label='Khóa sinh viên' data={SelectAdapter_DtKhoaDaoTao} multiple />
                    <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-6' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple />
                    <FormCheckbox ref={e => this.isMultiple = e} label='Đăng ký nhiều' readOnly={readOnly} className={this.state.isMultiple ? 'col-md-4' : 'col-md-12'} onChange={value => this.setState({ isMultiple: value })} />
                    <FormTextBox ref={e => this.multiple = e} label='Giới hạn đăng ký' readOnly={readOnly} defaultValue={4} type='number' style={{ display: this.state.isMultiple == true ? '' : 'none' }} className='col-md-8' />
                    <FormCheckbox ref={e => this.allowDownload = e} label='Cho phép sinh viên tải xuống ' readOnly={readOnly} className='col-md-4' />
                    <FormRichTextBox ref={e => this.chuThich = e} label='Chú thích' readOnly={readOnly} className='col-md-12' />
                    <FormSelect ref={e => this.heDaoTao = e} style={{ display: system.user.permissions.includes('developer:login') ? '' : 'none' }} data={SelectAdapter_DmSvBacDaoTao} className='col-md-12' label='Bậc' />
                    <FormFileBox ref={e => this.srcPath = e} background={'/img/word-document.png'} description='Nhấn vào hoặc kéo thả file đã gán biến vào đây. (.docx)' accept='.docx' uploadType='FormTypeUpload' onSuccess={this.onUploadSuccess} className='col-md-12' onDownload={this.state.srcPath ? e => this.onDownload(e) : null} postUrl={`/user/upload?namHoc=${this.state.namHoc}&ma=${this.state.ma}`} label={<span>File gốc<span style={{ display: this.state.timeModified ? '' : 'none' }} className='text-success'>: {T.dateToText(this.state.timeModified)}</span></span>} />
                </div>
            </div>
            <div className='form-group col-md-4'>
                {renderTable({
                    getDataSource: () => listParams,
                    stickyHead: true,
                    renderHead: () => <tr>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Biến</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Chú thích</th>
                    </tr>,
                    renderRow: (item, index) =>
                        <tr key={index} style={{ width: '100%', backgroundColor: this.state.parameters && this.state.parameters.includes(item.bien) ? '#90EE90' : '' }}>
                            <TableCell content={item.bien} style={{ width: '30%', whiteSpace: 'nowrap' }} />
                            <TableCell content={item.chuThich} style={{ width: '70%', whiteSpace: 'nowrap' }} />
                        </tr>
                })}
            </div>
        </div>
    );

    listBienCell = () => this.state.dataParam.map((item, index) => this.state.maEdit == item.maBien ? this.addCell(index) : (<tr key={index} style={{ background: 'white' }}>
        <TableCell content={index + 1} />
        <TableCell content={item.maBien} />
        <TableCell content={item.tenBien} />
        <TableCell content={
            (() => {
                switch (item.type) {
                    case '2':
                        return 'Lựa chọn';
                    case '3':
                        return 'Mảng';
                    case '4':
                        return 'Bảng';
                    case '5':
                        return 'DSSV';
                    case '6':
                        return 'Ngày';
                    case '8':
                        return 'Bảng điểm rèn luyện';
                    default:
                        return 'Chữ';
                }
            })()
        } />
        {(() => {
            switch (item.type) {
                case '2':
                    return <TableCell content={
                        item.data.map((param, index) => (<>
                            <p key={index}>{param.text}</p>
                        </>))
                    } />;
                case '3':
                    return <TableCell content={'Kích thước tối đa: ' + (item.data.size || 'Vô hạn')} />;
                case '4':
                    return <TableCell content={<>
                        <p><span>Cột: </span>{item.data?.cols.map((param, index) => <Chip key={index} label={`${param.colText} (${param.colMa})`}></Chip>)}</p>
                        <p>Kích thước tối đa: <span>{item.data?.size || 'Vô hạn'}</span></p>
                    </>} />;
                case '5':
                    return <TableCell content={'Kích thước tối đa: ' + (item.data.size || 'Vô hạn')} />;
                case '6':
                    return <td></td>;
                case '8':
                    return <td></td>;
                default:
                    return <TableCell content={item.data.text} />;
            }
        })()}
        <TableCell content={item.isRequired ? <i className='fa fa-check'></i> : ''} style={{ textAlign: 'center' }} />
        <TableCell type='buttons' content={item} style={{ background: 'white' }} permission={{ write: true, delete: true }}
            onEdit={() => this.setState({ maEdit: item.maBien, typeParam: item.type }, () => {
                this.customField.forEach(key => {
                    this[key]?.value(item[key]);
                });
                if (item.type == 2) {
                    this.setState({ selectParam: item.data });
                } else if (item.type == 4) {
                    this.data.size.value(item.data.size);
                    this.setState({ selectParam: item.data.cols });
                }
                else {
                    Object.keys(item.data).forEach(_item => {
                        this.data[_item].value(item.data[_item]);
                    });
                }
            })}
            onDelete={() => this.deleteParam(item.maBien)} />
    </tr>))

    deleteParam = (maBien) => {
        this.setState(prevState => ({ dataParam: prevState.dataParam.filter(item => item.maBien != maBien), maEdit: null }));
    }

    fixWidthHelper = (e, ui) => {
        $('table.custom-param tbody').each(function () {
            $(this).width($(this).width());
            $(this).children().each(function () {
                $(this).width($(this).width());
                $(this).children().each(function () {
                    $(this).width($(this).width());
                });
            });
        });
        return ui;
    }


    componentCustomParam = () => {
        let dataParam = this.state.dataParam;
        return (
            <div className='row'>
                <h5 className='col-12' style={{ textAlign: 'center', marginBottom: '1rem' }}>Danh sách các biến</h5>
                <div className='form-group col-12'>
                    {renderTable({
                        getDataSource: () => dataParam.length ? dataParam : [{}],
                        header: 'thead-light',
                        className: 'table-fix-col custom-param',
                        renderHead: () => (<tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã biến</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên hiển thị</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại biến</th>
                            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Lựa chọn/Dữ liệu</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bắt buộc</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>),
                        renderRow: <>
                            {dataParam.length ? this.listBienCell() : null}
                            {(this.state.maEdit != null && this.state.maEdit == 'new') ? this.addCell(dataParam.length) : null}
                        </>
                    })}
                </div>
                <div className='form-group col-md-12' style={{ textAlign: 'center', display: this.state.addIndex == null ? '' : 'none' }}>
                    <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.setState({ maEdit: 'new' }, () => { $('table.custom-param').sortable('disable'); })}>
                        <i className='fa fa-sm fa-plus' /> Thêm biến mới
                    </button>
                </div>
            </div>);
    };

    getDataParam = () => {
        try {
            let data = {};
            this.customField.forEach(key => {
                data[key] = getValue(this[key]);
                if (this[key].props.formType == 'checkBox') {
                    data[key] = data[key] ? 1 : 0;
                }
            });
            data.data = {};
            if (data.type == 2) {
                data.data = this.state.selectParam;
            }
            else if (data.type == 4) {
                data.data = {
                    size: getValue(this.data.size),
                    cols: this.state.selectParam
                };
            }
            else {
                Object.keys(this.data).forEach(key => {
                    this.data[key] && (data.data[key] = getValue(this.data[key]));
                });
            }
            data = Object.assign({}, data);
            return data;
        } catch (error) {
            console.error(error);
            T.notify('Vui lòng điền đầy đủ thông tin!', 'danger');
            return false;
        }
    }

    addParam = (onSubmit = false) => {
        const data = this.getDataParam(),
            currentData = this.state.dataParam;
        $('table.custom-param').sortable('enable');
        if (data) {
            this.setState({ addIndex: null });
            if (onSubmit) {
                return [...currentData, data];
            } else {
                if (data.maBien.startsWith('<') && data.maBien.endsWith('>')) {
                    if (currentData.some(item => (item.maBien == data.maBien && item.maBien != this.state.maEdit))) {
                        T.notify(`Mã biến ${data.maBien} đã tồn tại`, 'danger');
                        this.setState({ dataParam: currentData, selectParam: [], maEdit: null, typeParam: 'Text' }, () => {
                            this.customField.forEach(key => {
                                this[key]?.value('');
                            });
                        });
                    }
                    else if (currentData.some(item => item.maBien == this.state.maEdit)) {
                        for (let i = 0, n = currentData.length; i < n; i++) {
                            if (currentData[i].maBien == this.state.maEdit) {
                                currentData[i] = { ...data };
                                break;
                            }
                        }
                        this.setState({ dataParam: currentData, selectParam: [], maEdit: null, typeParam: 'Text' }, () => {
                            this.customField.forEach(key => {
                                this[key]?.value('');
                            });
                        });
                    } else {
                        this.setState({ dataParam: [...this.state.dataParam, data], selectParam: [], maEdit: null, typeParam: 'Text' }, () => {
                            this.customField.forEach(key => {
                                this[key]?.value('');
                            });
                        });
                    }
                } else {
                    T.notify(`Mã biến ${data.maBien} không hợp lệ. Mã hợp lệ e.g &lt;lyDo&gt;`, 'danger');
                }
            }
        }
    }

    addSelectParam = () => {
        const currentSelectParam = this.state.selectParam;
        try {
            const addSelect = getValue(this.data.selectData);
            if (currentSelectParam.some(item => (item.text == addSelect))) {
                T.notify(`Lựa chọn ${addSelect} đã tồn tại`, 'danger');
            }
            else {
                this.setState({ selectParam: [...currentSelectParam, { text: addSelect }] });
            }
            this.data.selectData.value('');
        } catch (error) {
            T.notify('Dữ liệu trống', 'danger');
        }
    }

    addTableParam = () => {
        const currentSelectParam = this.state.selectParam;
        try {
            const addColMa = getValue(this.data.colMa);
            const addColText = getValue(this.data.colText);
            if (currentSelectParam.some(item => (item.colMa == addColMa))) {
                T.notify(`Lựa chọn ${addColMa} đã tồn tại`, 'danger');
            }
            else {
                this.setState({ selectParam: [...currentSelectParam, { colMa: addColMa, colText: addColText }] });
            }
            this.data.colMa.value('');
            this.data.colText.value('');
        } catch (error) {
            T.notify('Dữ liệu trống', 'danger');
        }
    }

    deleteTableParam = (colMa) => {
        this.setState(prevState => ({ selectParam: prevState.selectParam.filter(param => param.colMa != colMa) }));
    }



    changeTypeParam = (value) => {
        // let type = value.text === 'Chữ' ? 'Text' : 'Select';
        this.data = {};
        this.setState({ typeParam: value.id, selectParam: [] });
    }

    addCell = (index) => (<tr style={{ background: 'white' }} key={index}>
        <TableCell content={index + 1} />
        <TableCell content={
            <FormTextBox ref={e => this.maBien = e} placeholder='Mã biến' smallText='Vd: <lyDo>' style={{ marginBottom: 0, width: '100px' }} required />
        } />
        <TableCell content={
            <FormTextBox ref={e => this.tenBien = e} placeholder='Tên biến' smallText='Vd: Lý do' style={{ marginBottom: 0, width: '120px' }} required />
        } />
        <TableCell content={
            <FormSelect ref={e => this.type = e} data={SelectAdapter_CtsvDmFormTypeParamType} onChange={this.changeTypeParam} style={{ marginBottom: 0, width: '120px' }} required />
        } />
        {(() => {
            switch (this.state.typeParam) {
                case '2': //Select
                    return <TableCell style={{ textAlign: 'center' }} content={
                        <>
                            {this.state.selectParam.length != 0 && this.editSelectCell()}
                            <FormTextBox ref={e => this.data.selectData = e} placeholder='Data' style={{ marginBottom: 3, marginTop: 3 }} required onKeyDown={e => e.key == 'Enter' && (e.preventDefault() || this.addSelectParam())} />
                            <button className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.addSelectParam()}>
                                <i className='fa fa-sm fa-plus' /> Thêm lựa chọn
                            </button>
                        </>
                    } />;
                case '3': //Array
                    return <TableCell content={
                        <FormTextBox smallText='Kích thước tối đa' ref={e => this.data.size = e} type='number' placeholder='Data' style={{ marginBottom: 0 }} />
                    } />;
                case '4': //Table
                    return <TableCell content={<>
                        <table><tbody>
                            {this.state.selectParam.length ? this.state.selectParam.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ whiteSpace: 'nowrap', width: 'auto' }}>{item.colMa}</td>
                                    <td style={{ whiteSpace: 'nowrap', width: '100%' }}>{item.colText}</td>
                                    <td width={'auto'} style={{ background: 'white' }}>
                                        <button className='btn btn-danger inline' type='button' onClick={e => e.preventDefault() || this.deleteTableParam(item.colMa)}>
                                            <i className='fa fa-md fa-trash' />
                                        </button>
                                    </td>
                                </tr>
                            )) : null}
                        </tbody></table>
                        <div className='row'>
                            <div className='col-md-12 d-flex'>
                                <FormTextBox style={{ width: '45%' }} ref={e => this.data.colMa = e} placeholder='Tên biến' onKeyDown={e => e.key == 'Enter' && (e.preventDefault() || this.addTableParam())} />
                                <FormTextBox style={{ width: '45%' }} ref={e => this.data.colText = e} placeholder='Tên cột' onKeyDown={e => e.key == 'Enter' && (e.preventDefault() || this.addTableParam())} />
                                <Tooltip title='Thêm cột'>
                                    <button className='btn btn-success' style={{ marginBottom: '1em' }} type='button' onClick={e => e.preventDefault() || this.addTableParam()}>
                                        <i className='fa fa-sm fa-plus' />
                                    </button>
                                </Tooltip>
                            </div>
                            <FormTextBox className='col-md-12' ref={e => this.data.size = e} placeholder='Kích thước tối đa' type='number' />
                        </div></>} />;
                case '5':
                    return <TableCell content={
                        <FormTextBox smallText='Kích thước tối đa' ref={e => this.data.size = e} type='number' placeholder='Data' style={{ marginBottom: 0 }} />
                    } />;
                case '6':
                    return <td></td>;
                case '8':
                    return <td></td>;
                default: //Text
                    return <TableCell content={
                        <FormTextBox smallText='Giá trị mặc định' ref={e => this.data.text = e} placeholder='Data' style={{ marginBottom: 0 }} />
                    } />;
            }
        })()}
        <TableCell content={<FormCheckbox ref={e => this.isRequired = e} />} style={{ textAlign: 'center' }} />
        <TableCell style={{ textAlign: 'center' }} type='buttons'>
            <button className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.addParam(false)}>
                <i className='fa fa-lg fa-check' />
            </button>
            <button className='btn btn-danger' type='button' onClick={e => e.preventDefault() || this.setState({ maEdit: null }, () => $('table.custom-param').sortable('enable'))}>
                <i className='fa fa-lg fa-trash' />
            </button>
        </TableCell>
    </tr>)

    editSelectCell = () => {
        return (
            <table><tbody>
                {this.state.selectParam.map((item, index) => (
                    <tr key={`select-${index}`} style={{ background: 'white' }}>
                        <td width={'100%'} style={{ textAlign: 'left' }}><p className='inline'>{item.text}</p></td>
                        <td width={'auto'} style={{ background: 'white' }}>
                            <button className='btn btn-danger inline' type='button' onClick={e => e.preventDefault() || this.deleteSelectChoice(item.text)}>
                                <i className='fa fa-md fa-trash' />
                            </button>
                        </td>
                    </tr>))}
            </tbody></table>
        );
    }

    deleteSelectChoice = (selectChoice) => {
        this.setState({ selectParam: this.state.selectParam.filter(item => item.text != selectChoice) });
    }


    render = () => {
        const { readOnly, listParams = [], system } = this.props;
        return this.renderModal({
            title: 'Điều chỉnh',
            size: 'elarge',
            body:
                <>
                    <FormTabs
                        tabs={[
                            { id: 12, title: 'Tạo form', component: this.componentFormSetting(readOnly, listParams, system) },
                            { id: 15, title: 'Trường tùy chỉnh', component: this.componentCustomParam() },
                        ]}
                    />
                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svDmFormType: state.ctsv.svDmFormType });
const mapActionsToProps = {
    createSvDmFormType, updateSvDmFormType
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AdjustFormTypeModal);

