import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTextBox, FormCheckbox, FormRichTextBox, getValue, FormFileBox, renderTable, TableCell, FormTabs } from 'view/component/AdminPage';
import { createFormVanBan, updateFormVanBan } from './redux';
// import { Chip, Tooltip } from '@mui/material';

class AdjustFormVanBanModal extends AdminModal {
    state = { dataParam: [], isLoading: false, selectParam: [], tableCols: [] }
    customField = ['maBien', 'tenBien']
    data = {}
    onShow = (item) => {
        let { ma, ten, kichHoat, chuThich, srcPath, timeModified, parameters, customParam } = item ? item : { ma: '', ten: '', kichHoat: 0, chuThich: '', srcPath: '', timeModified: '', parameters: '', customParam: [] };
        this.ma.value(ma || '');
        this.ten.value(ten || '');
        this.kichHoat.value(kichHoat || '');
        this.chuThich.value(chuThich || '');
        this.srcPath.setData('FormVanBanUpload', !item);
        customParam.map(item => {
            item.maBien = item.ma;
            item.data = typeof (item.data) == 'string' ? JSON.parse(item.data) : item.data;
            return item;
        });
        this.setState({ ma, ten, kichHoat, srcPath, timeModified, parameters: parameters ? parameters.split(',') : [], dataParam: customParam }, () => {
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

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    onSubmit = () => {
        if (!this.state.srcPath) {
            T.notify('Vui lòng upload file form đã chèn biến', 'danger');
        } else {
            const data = {
                ma: getValue(this.ma),
                ten: getValue(this.ten),
                kichHoat: getValue(this.kichHoat),
                chuThich: getValue(this.chuThich),
                srcPath: this.state.srcPath,
                parameters: this.state.parameters ? this.state.parameters.join(',') : null,
                customParam: this.state.dataParam.map(item => {
                    item.data = JSON.stringify(item.data);
                    return item;
                }),
            };
            this.setState({ dataParam: [] });
            this.state.ma ? this.props.updateFormVanBan(this.state.ma, data, this.hide) : this.props.createFormVanBan(data, this.hide);
        }

    }

    onDownload = (e) => {
        e.preventDefault();
        T.handleDownload(`/api/tccb/form-van-ban/download?ma=${this.state.ma}`);
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

    componentFormSetting = (readOnly, listParams) => (
        <div className='row'>
            <div className='form-group col-md-8'>
                <div className='row'>
                    <FormTextBox ref={e => this.ma = e} label='Mã form văn bản' readOnly={readOnly} className='col-md-4' required />
                    <FormTextBox ref={e => this.ten = e} label='Tên form văn bản' readOnly={readOnly} className='col-md-8' required />
                    <FormRichTextBox ref={e => this.chuThich = e} label='Chú thích' readOnly={readOnly} className='col-md-12' />
                    <FormCheckbox isSwitch ref={e => this.kichHoat = e} label='Kích hoạt' readOnly={readOnly} className='col-md-4' onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                    <FormFileBox ref={e => this.srcPath = e} background={'/img/word-document.png'} description='Nhấn vào hoặc kéo thả file đã gán biến vào đây. (.docx)' accept='.docx' uploadType='FormVanBanUpload' onSuccess={this.onUploadSuccess} className='col-md-12' onDownload={this.state.srcPath ? e => this.onDownload(e) : null} postUrl={`/user/upload?ma=${this.state.ma}`} label={<span>File gốc<span style={{ display: this.state.timeModified ? '' : 'none' }} className='text-success'>: {T.dateToText(this.state.timeModified)}</span></span>} />
                </div>
            </div>
            <div className='form-group col-md-4'>
                {renderTable({
                    getDataSource: () => listParams ? listParams : [],
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
        <TableCell type='buttons' content={item} style={{ background: 'white' }} permission={{ write: true, delete: true }}
            onEdit={() => this.setState({ maEdit: item.maBien }, () => {
                this.customField.forEach(key => {
                    this[key]?.value(item[key]);
                });
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
                            <th style={{ width: '240px', whiteSpace: 'nowrap' }}>STT</th>
                            <th style={{ width: '240px', whiteSpace: 'nowrap' }}>Mã biến</th>
                            <th style={{ width: '480px', whiteSpace: 'nowrap' }}>Tên hiển thị</th>
                            <th style={{ width: '240px', whiteSpace: 'nowrap' }}>Thao tác</th>
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
                if (this[key].props.formVanBan == 'checkBox') {
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
                        this.setState({ dataParam: currentData, selectParam: [], maEdit: null }, () => {
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
                        this.setState({ dataParam: currentData, selectParam: [], maEdit: null }, () => {
                            this.customField.forEach(key => {
                                this[key]?.value('');
                            });
                        });
                    } else {
                        this.setState({ dataParam: [...this.state.dataParam, data], selectParam: [], maEdit: null }, () => {
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

    addCell = (index) => (<tr style={{ background: 'white' }} key={index}>
        <TableCell content={index + 1} />
        <TableCell content={
            <FormTextBox ref={e => this.maBien = e} placeholder='Mã biến' smallText='Vd: <lyDo>' style={{ marginBottom: 0, width: '230px' }} required />
        } />
        <TableCell content={
            <FormTextBox ref={e => this.tenBien = e} placeholder='Tên biến' smallText='Vd: Lý do' style={{ marginBottom: 0, width: '450px' }} required />
        } />
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
        const listParams = this.props.formVanBan?.items?.listParams;
        const { readOnly } = this.props;
        return this.renderModal({
            title: !this.state.ma ? 'Tạo mới' : 'Điều chỉnh',
            size: 'elarge',
            body:
                <>
                    <FormTabs
                        tabs={[
                            { id: 12, title: 'Tạo form', component: this.componentFormSetting(readOnly, listParams) },
                            { id: 15, title: 'Trường tùy chỉnh', component: this.componentCustomParam() },
                        ]}
                    />
                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, formVanBan: state.tccb.formVanBan });
const mapActionsToProps = {
    createFormVanBan, updateFormVanBan
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AdjustFormVanBanModal);