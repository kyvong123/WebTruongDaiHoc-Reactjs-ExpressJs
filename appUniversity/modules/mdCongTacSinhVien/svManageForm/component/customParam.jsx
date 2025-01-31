import React from 'react';
import { connect } from 'react-redux';
import { TableCell, renderTable, FormTextBox, FormDatePicker, getValue, FormSelect } from 'view/component/AdminPage';
import { checkMssv } from 'modules/mdCongTacSinhVien/svManageForm/redux';
import { getDiemRenLuyen, SelectAdapter_DiemRenLuyenNamHoc } from 'modules/mdCongTacSinhVien/svDiemRenLuyen/redux';
import { Tooltip } from '@mui/material';

class ParamKetQuaDrl extends React.Component {
    state = {
        values: []
    }

    componentDidUpdate(prevProps) {
        if (prevProps.host?.mssv != this.props.host?.mssv) {
            this.input.value('');
            this.setState({ values: [] });
        }
    }

    value(value) {
        if (arguments.length) {
            const { param } = this.props;
            if (!Array.isArray(value))
                value = value ? [value] : [];
            this.setState({
                values: value.map(item => ({
                    namHoc: item[param.ma + '_namHoc'], hk1: item[param.ma + '_hk1'], hk2: item[param.ma + '_hk2']
                }))
            });
        } else {
            return this.getDataDangKy();
        }
    }

    getDataDangKy = () => {
        const { param } = this.props;
        // data = {};
        const _data = (this.state.values || []).map((val, index) => (
            { [param.ma + '_stt']: index + 1, [param.ma + '_namHoc']: val.namHoc, [param.ma + '_hk1']: val.hk1, [param.ma + '_hk2']: val.hk2 }));
        return _data;
    }

    onChangeInput = (value) => {
        value.selected ? this.addRow(value) : this.removeRow(value.id);
    }


    addRow = (value) => {
        try {
            const { id: namHoc } = value;
            const mssv = this.props.host?.mssv;
            this.props.getDiemRenLuyen(mssv, namHoc, item => {
                this.setState(prevState => {
                    let { values = [] } = prevState;
                    values = [item, ...values.filter(item => item.namHoc != namHoc)];
                    values.sort((a, b) => parseInt(a.namHoc) - parseInt(b.namHoc));
                    return { values };
                });
            });
        } catch (error) {
            console.log(error);
            T.notify(error.notify || 'Dữ liệu bị lỗi!', 'danger');
        }
    }

    removeRow = (namHoc) => {
        this.setState(prevState => ({ values: prevState.values.filter(item => item.namHoc != namHoc) }));
    }

    render() {
        const { param, readOnly = true, host } = this.props;
        // const currentYear = new Date().getFullYear();
        return (<React.Fragment>
            {!readOnly && <FormSelect ref={e => this.input = e} className='col-md-12' label='Năm học' data={(SelectAdapter_DiemRenLuyenNamHoc(host.mssv))} multiple onChange={this.onChangeInput} />}
            <p className='col-md-12'>Kết quả điểm rèn luyện {!readOnly && param.isRequired ? <span style={{ color: 'red' }}> *</span> : ''}</p>
            <div className='col-md-12'>
                {renderTable({
                    getDataSource: () => [{}],
                    renderHead: () => (<tr>
                        <th style={{ whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Năm học</th>
                        <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Điểm học kỳ 1</th>
                        <th style={{ whiteSpace: 'nowrap', width: '40%' }}>Điểm học kỳ 2</th>
                    </tr>),
                    renderRow: <>
                        {this.state.values?.map((item, index) => (<tr key={`item-${index}`}>
                            <td style={{ whiteSpace: 'nowrap' }}>{index + 1}</td>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namHoc} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hk1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hk2} />
                        </tr>))}
                    </>
                })}

            </div></React.Fragment>);
    }
}

class ParamDssv extends React.Component {
    state = { values: [] }

    value(value) {
        if (arguments.length) {
            const { param } = this.props;
            if (!Array.isArray(value))
                value = value ? [value] : [];
            this.setState({
                values: value.map(item => ({
                    mssv: item[param.ma + '_mssv'], hoTen: item[param.ma + '_hoTen'],
                }))
            });
        } else {
            return this.getDataDangKy();
        }
    }

    getDataDangKy = () => {
        const { param, host } = this.props,
            hostIndex = host && host.mssv ? 1 : 0;
        // data = {};
        const _data = host && host.mssv ? [
            { [param.ma + '_stt']: hostIndex, [param.ma + '_mssv']: host.mssv, [param.ma + '_hoTen']: host.hoTen },
        ] : [];
        _data.push(...(this.state.values || []).map((val, index) => (
            { [param.ma + '_stt']: index + hostIndex + 1, [param.ma + '_mssv']: val.mssv, [param.ma + '_hoTen']: val.hoTen })));
        return _data;
    }



    addSinhVien = (mssv) => {
        try {
            let { data: { size } } = this.props.param,
                values = this.state.values;
            if (size && values.length >= (size - (this.props.host ? 1 : 0))) {
                throw { notify: `Số lượng không được vượt quá ${size}!` };
            }
            if (!mssv) {
                throw { notify: 'Mssv bị trống!' };
            }
            this.props.checkMssv(mssv, data => {
                const host = this.props.host;
                if ((host && host.mssv == data.mssv) || this.state.values.some(sv => sv.mssv == data.mssv)) {
                    T.notify('MSSV đã tồn tại trong danh sách!', 'danger');
                } else {
                    this.setState(prevState => ({
                        values: [...prevState.values, {
                            mssv: data.mssv, hoTen: data.ho + ' ' + data.ten,
                        }]
                    }), () => this.mssv.value(''));
                }
            });
        } catch (error) {
            T.notify(error.notify || 'Dữ liệu bị lỗi!', 'danger');
        }
    }

    removeSinhVien = (mssv) => {
        this.setState(prevState => ({ values: prevState.values.filter(item => item.mssv != mssv) }));
    }

    render() {
        const { param, host = {}, readOnly = true } = this.props;
        return (<React.Fragment>
            <p className='col-md-12'>Danh sách sinh viên {param.data.size && `(Số lượng tối đa: ${param.data.size})`} {!readOnly && param.isRequired ? <span style={{ color: 'red' }}> *</span> : ''}</p>
            <div className='col-md-12'>
                {renderTable({
                    getDataSource: () => [{}],
                    renderHead: () => (<tr>
                        <th style={{ whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Họ tên</th>
                        {!readOnly && <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>}
                    </tr>),
                    renderRow: <>
                        {host.mssv && <tr>
                            <td style={{ whiteSpace: 'nowrap' }}>1</td>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={host.mssv} />
                            <TableCell style={{ whiteSpace: 'nowrap', width: '100%' }} content={host.hoTen} />
                            {!readOnly && <td></td>}
                        </tr>}
                        {this.state.values?.map((item, index) => (<tr key={`item-${index}`}>
                            <td style={{ whiteSpace: 'nowrap' }}>{index + (host.mssv ? 2 : 1)}</td>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                            <TableCell style={{ whiteSpace: 'nowrap', width: '100%' }} content={item.hoTen} />
                            {!readOnly && <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' onDelete={e => e.preventDefault() || this.removeSinhVien(item.mssv)} permission={{ delete: !readOnly }} />}
                        </tr>))}
                        {!readOnly && <tr>
                            <td colSpan={3}>
                                <FormTextBox ref={e => this.mssv = e} label={'MSSV'} style={{ whiteSpace: 'nowrap' }} onKeyDown={e => e.key == 'Enter' && (e.preventDefault() || this.addSinhVien(e.target.value))} />
                            </td>
                            <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons'>
                                {!readOnly && <Tooltip title='Thêm' ><button className='btn btn-success' onClick={e => e.preventDefault() || this.addSinhVien(this.mssv.value()) || this.getDataDangKy()} >
                                    <i className='fa fa-plus'></i>
                                </button></Tooltip>}
                            </TableCell>
                        </tr>}
                    </>
                })}

            </div></React.Fragment>);
    }
}

class ParamArray extends React.Component {
    state = { length: 1, values: [''] }
    input = [];

    value = function (value) {
        const param = this.props.param;
        if (arguments.length) {
            if (!Array.isArray(value)) {
                value = [value];
            }
            this.setState({ length: value.length }, () => {
                value.forEach((item, index) => {
                    this.input[index].value(item[param.ma + '_i'] || '');
                });
            });
        } else {
            return this.getDataDangKy();
        }
    }

    getDataDangKy = () => {
        const param = this.props.param;
        const data = Array.from({ length: this.state.length })
            .map((_, index) => ({ [param.ma + '_i']: getValue(this.input[index]) }))
            .filter(item => item[param.ma + '_i'] != null);
        return data;
    }

    addRow = (index, done) => {
        try {
            const { length } = this.state,
                { data: { size } } = this.props.param;
            if (size && length >= size) {
                throw { notify: `Số lượng không được vượt quá ${size}!` };
            }
            this.setState(prevState => ({ length: prevState.length + 1 }), () => {
                for (let i = this.state.length - 1; i > index; i--) {
                    const newValue = this.input[i - 1].value();
                    this.input[i].value(newValue);
                }
                this.input[index].value('');
                done && done();
            });
        } catch (error) {
            T.notify(error.notify || 'Hệ thống bị lỗi!', 'danger');
        }
    }

    removeRow = (index) => {
        try {
            const { length } = this.state;
            if (length == 1) {
                return;
            }
            for (let i = index; i < this.state.length - 1; i++) {
                const newValue = this.input[i + 1].value();
                this.input[i].value(newValue);
            }
            this.setState(prevState => ({ length: prevState.length - 1 }));
        } catch (error) {
            T.notify(error.notify || 'Hệ thống bị lỗi!', 'danger');
        }
    }

    render() {
        const { param, readOnly } = this.props;
        return <div className='col-md-12'>
            <p >{param.tenBien} {param.data.size && `(Số lượng tối đa: ${param.data.size})`} {!readOnly && param.isRequired ? <span style={{ color: 'red' }}> *</span> : ''}:</p>
            {Array.from({ length: this.state.length }).map((_, index) => (<div key={index} className='form-row'>
                <FormTextBox key={index} ref={e => this.input[index] = e}
                    className='col-auto flex-grow-1'
                    placeholder={param.tenBien}
                    onKeyDown={e => {
                        if (e.key == 'Enter') {
                            e.preventDefault();
                            this.addRow(index + 1, () => this.input[index + 1].focus());
                        }
                    }} required={index == 0 ? param.isRequired : true} readOnly={readOnly} />
                {!readOnly && <div className='form-group' >
                    <a href='#' className='btn btn-link' style={{ color: 'green' }} onClick={e => e.preventDefault() || this.addRow(index + 1)}><i className='fa fa-plus'></i></a>
                    <a href='#' className='btn btn-link' style={{ color: 'red' }} onClick={e => e.preventDefault() || this.removeRow(index)}><i className='fa fa-minus'></i></a>
                </div>}
            </div>
            ))}
        </div>;
    }
}

class ParamTable extends React.Component {
    state = { values: [] }

    value(value) {
        if (arguments) {
            if (!Array.isArray(value)) {
                value = value ? [value] : [];
            }

            this.setState({
                values: value?.map(item => {
                    const res = {};
                    Object.keys(item).forEach(k => {
                        // res[param.ma + '_' + k] = val[k];
                        res[k.split('_')[1]] = item[k];
                    });
                    return res;
                }) || []
            });
        } else {
            return this.getDataDangKy();
        }
    }

    getDataDangKy = () => {
        const param = this.props.param;
        const _data = (this.state.values || []).map((val, index) => {
            const res = { [param.ma + '_stt']: index + 1 };
            Object.keys(val).forEach(k => {
                res[param.ma + '_' + k] = val[k];
            });
            return res;
        });
        if (_data && _data.length) {
            return _data;
        } else {
            throw this[`${param.ma}_${param.data.cols[0].colMa}`];
        }
    }

    addValueTable = (paramInfo, done) => {
        try {
            const { ma, data: { size, cols } } = paramInfo;
            const value = {};
            let valid = false;
            cols.forEach(c => {
                value[c.colMa] = getValue(this[`${ma}_${c.colMa}`]);
                this[`${ma}_${c.colMa}`].value('');
                valid = valid || !!value[c.colMa];
            });
            if (!valid) throw { message: 'Dữ liệu trống' };
            const values = this.state.values || [];
            if (values.length < size) {
                values.push(value);
                this.setState({ values }, done);
            } else {
                T.notify('Vượt số lượng cho phép', 'danger');
            }
        } catch (error) {
            T.notify(error.message || 'Dữ liệu bị lỗi!', 'danger');
        }
    }

    removeValueTable = (ma, index) => {
        const values = this.state.values || [];
        values.splice(index, 1);
        this.setState({ values });
    }

    render() {
        const { param, readOnly = true } = this.props;
        return <div className='col-md-12'>
            {/* <p className='col-md-12'>{param.tenBien}</p> */}
            <p >{param.tenBien} {param.data.size && `(Số lượng tối đa: ${param.data.size})`} {!readOnly && param.isRequired ? <span style={{ color: 'red' }}> *</span> : ''}:</p>
            {renderTable({
                getDataSource: () => [{}],
                renderHead: () => (<tr>
                    <th style={{ whiteSpace: 'nowrap' }}>#</th>
                    {param.data.cols?.map((col, coln) => (
                        <th key={`header-${coln}`} style={{ whiteSpace: 'nowrap', width: coln == 1 ? '100%' : '' }}>{col.colText}</th>
                    ))}
                    {!readOnly && <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>}
                </tr>),
                renderRow: <>
                    {this.state.values?.map((item, index) => (<tr key={`item-${index}`}>
                        <td style={{ whiteSpace: 'nowrap' }}>{index + 1}</td>
                        {param.data.cols?.map((col, coln) => (
                            <td key={`col-${coln}`} style={{ whiteSpace: 'nowrap' }}>{item[col.colMa]}</td>
                        ))}
                        {!readOnly && <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' onDelete={e => e.preventDefault() || this.removeValueTable(param.ma, index)} permission={{ delete: !readOnly }} />}
                    </tr>))}
                    {!readOnly && <tr>
                        <td colSpan={param.data.cols.length + 1}>
                            {param.data.cols?.map((col, coln) => (
                                <FormTextBox key={`col-${col.colMa}`} ref={e => this[`${param.ma}_${col.colMa}`] = e} label={col.colText} style={{ whiteSpace: 'nowrap', width: coln == 1 ? '100%' : '' }} />
                            ))}
                        </td>
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons'>
                            <Tooltip title='Thêm' ><button className='btn btn-success' onClick={e => e.preventDefault() || this.addValueTable(param)} >
                                <i className='fa fa-plus'></i>
                            </button></Tooltip>
                        </TableCell>
                    </tr>}
                </>
            })}
        </div >;
    }
}

class ParamDate extends React.Component {
    state = { type: '' }

    componentDidMount() {
        this.setState({ dateType: this.props.type });
    }

    value = function (value) {
        if (arguments) {
            if (value && value != '') {
                const [d, m, y] = value.split('/'),
                    time = new Date(y, m - 1, d).getTime();

                this.input.value(time);
            } else {
                this.input.value('');
            }
        } else {
            return this.getDataDangKy();
        }
    }

    getDataDangKy = () => {
        const param = this.props.param,
            date = getValue(this.input),
            data = {},
            value = T.dateToText(date, date.getMonth() > 1 ? 'dd/m/yyyy' : 'dd/mm/yyyy'),
            [d, m, y] = value.split('/');
        Object.assign(data, {
            [param.ma]: value,
            [param.ma + '_d']: d,
            [param.ma + '_m']: m,
            [param.ma + '_y']: y,
        });
        return data;
    }



    render() {
        const { param, readOnly = false } = this.props;
        return <FormDatePicker ref={e => this.input = e} className='col-md-12' label={param.tenBien} readOnly={readOnly} required={param.isRequired} />;
    }
}



class CustomParamComponent extends React.Component {
    state = { selectValue: [] }

    value(value) {
        const { param } = this.props;
        if (arguments.length) {
            this[param.ma].value(value);
        } else {
            if (this[param.ma].getDataDangKy) {
                return this[param.ma].getDataDangKy();
            } else {
                return this[param.ma].value();
            }
        }
    }


    getDataDangKy = () => {
        const param = this.props.param,
            data = {};
        if (['3', '4', '5'].includes(param.type)) { //Array and Table like param
            data[param.ma] = this[param.ma].getDataDangKy();
            data[param.ma + '_soLuong'] = data[param.ma].length;
            data[param.ma + '_first'] = Object.values(data[param.ma][0])[0];
            data[param.ma + '_isOne'] = data[param.ma].length == 1;
        } else if (['6', '7',].includes(param.type)) { // Date param
            Object.assign(data, this[param.ma].getDataDangKy());
        } else {
            data[param.ma] = getValue(this[param.ma]);
        }
        return data;
    }

    render() {
        const { param, host, readOnly = false } = this.props;
        switch (param.type) {
            case '1':
                return (<FormTextBox type='text' label={param.tenBien} ref={e => this[param.ma] = e} className='form-group col-md-12' required={param.isRequired} readOnly={readOnly} />);
            case '2':
                return (<FormSelect label={param.tenBien} ref={e => this[param.ma] = e} data={param.data.map(param => ({ id: param.text, text: param.text }))} className='form-group col-md-12' required={param.isRequired} readOnly={readOnly} />);
            case '3':
                return <ParamArray ref={e => this[param.ma] = e} param={param} readOnly={readOnly} required={!!param.isRequired} />;
            case '4':
                return <ParamTable ref={e => this[param.ma] = e} param={param} readOnly={readOnly} required={!!param.isRequired} />;
            case '5':
                return <ParamDssv ref={e => this[param.ma] = e} param={param} host={host} readOnly={readOnly} checkMssv={this.props.checkMssv} required={!!param.isRequired} />;
            case '6':
                return <ParamDate ref={e => this[param.ma] = e} {...this.props} required={!!param.isRequired} />;
            case '7':
                return <ParamDate ref={e => this[param.ma] = e} type='long-date' {...this.props} required={!!param.isRequired} />;
            case '8':
                return <ParamKetQuaDrl ref={e => this[param.ma] = e} {...this.props} required={!!param.isRequired} readOnly={readOnly} getDiemRenLuyen={this.props.getDiemRenLuyen} host={host} />;
        }
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { checkMssv, getDiemRenLuyen };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CustomParamComponent);