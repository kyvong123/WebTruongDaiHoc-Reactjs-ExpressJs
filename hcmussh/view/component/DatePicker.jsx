import React from 'react';
import Datetime from 'react-datetime';
import InputMask from 'react-input-mask';
export class DatePicker extends React.Component {
    static defaultProps = { formType: 'datePicker', type: 'date' };

    mask = {
        'time-mask': '39/19/2099 h9:59',
        'date-mask': '39/19/2099',
        'year-mask': '2099',
        'month-mask': '19/2099',
        'date-month': '39/19'
    };

    format = {
        'time-mask': 'dd/mm/yyyy HH:MM',
        'date-mask': 'dd/mm/yyyy',
        'month-mask': 'mm/yyyy',
        'year-mask': 'yyyy',
        'date-month': 'dd/mm'
    };

    state = { value: '', readOnlyText: '', inputValue: '' };

    componentDidMount() {
        if (this.props.value !== undefined) this.value(this.props.value);
    }

    value = function (date) {
        const type = this.props.type;
        if (arguments.length) {
            if (type == 'date-month') {
                const value = date ? T.dateToText(new Date(date), this.format[type]) : '';
                this.setState({ value, readOnlyText: value });
            } else if (type.endsWith('-mask')) {
                const value = date ? T.dateToText(new Date(date), this.format[type]) : '';
                this.setState({ value, readOnlyText: value });
            } else {
                this.setState({
                    value: date ? new Date(date) : '',
                    readOnlyText: date ? T.dateToText(new Date(date), type == 'date' ? 'dd/mm/yyyy' : type == 'dd/mm' ? 'dd/mm' : 'dd/mm/yyyy HH:MM') : '',
                    inputValue: date ? T.dateToText(new Date(date), type == 'date' ? 'dd/mm/yyyy' : type == 'dd/mm' ? 'dd/mm' : 'dd/mm/yyyy HH:MM') : '',
                }, () => {
                    this.state.value == '' && $(this.inputRef).val('');
                });
            }
        } else {
            if (type == 'date-month') {
                const date = T.formatDate(this.state.value + '/' + this.props.year);
                if (date == null || Number.isNaN(date.getTime())) return '';
                return date;
            } else if (type.endsWith('-mask')) {
                const date = T.formatDate((type == 'month-mask' ? '01/' : (type == 'year-mask' ? '01/01/' : '')) + this.state.value);
                if (date == null || Number.isNaN(date.getTime())) return '';
                return date;
            } else {
                return this.state.value;
            }
        }
    }

    focus = () => {
        const type = this.props.type;
        if (type == 'date-month') {
            this.input.getInputDOMNode().focus();
        } else if (type.endsWith('-mask')) {
            this.input.getInputDOMNode().focus();
        } else {
            $(this.inputRef).focus();
        }
    }

    handleChange = event => {
        if (event.type == 'blur') this.props.onBlur && this.props.onBlur(event);
        else {
            const type = this.props.type;
            if (event && event.preventDefault) event.preventDefault();
            this.setState({
                value: (type.endsWith('-mask') || type == 'date-month') ? event.target.value : new Date(event),
                inputValue: typeof event == 'string' ? this.state.inputValue : T.convertDate(new Date(event), type == 'date' ? 'DD/MM/YYYY' : (type == 'dd/mm' ? 'DD/MM' : 'DD/MM/YYYY HH:mm'))
            }, () => {
                this.props.onChange && this.props.onChange(this.value());
            });
        }
    }
    handleInputChange = event => {
        let value = event.target.value;
        this.setState({
            inputValue: value,
        });
    }
    renderInput(props) {
        return (
            <InputMask {...props} />
        );
    }
    render() {
        let { label = '', type = 'date', className = '', readOnly = false, required = false, style = {}, readOnlyEmptyText = '', placeholder = '', disabled = false, onKeyDown = null, onBlur } = this.props;
        let inputProps = {
            ref: e => this.inputRef = e,
            className: 'form-control',
            mask: type == 'date' ? this.mask['date-mask'] : (type == 'dd/mm' ? this.mask[type] : this.mask['time-mask']),
            onChange: e => this.handleInputChange(e),
            onKeyDown: onKeyDown,
            style: { display: readOnly ? 'none' : '' },
            formatChars: { '2': '[12]', '0': '[089]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' },
            value: this.state.inputValue,
            placeholder: placeholder || label,
            readOnly, onBlur, disabled
        };

        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {label && <label onClick={() => this.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>}{readOnly && this.state.value ? <> {label && ':'} <b>{this.state.readOnlyText}</b></> : readOnly && readOnlyEmptyText && <b>: {readOnlyEmptyText}</b>}
                {(type.endsWith('-mask') || type == 'date-month') ? (
                    <InputMask ref={e => this.input = e} className='form-control' mask={this.mask[type]} onChange={this.handleChange} onKeyDown={onKeyDown} style={{ display: readOnly ? 'none' : '' }} formatChars={{ '2': '[12]', '0': '[089]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' }} value={this.state.value} readOnly={readOnly} placeholder={placeholder || label} onBlur={onBlur} />
                ) : (
                    <Datetime ref={e => this.input = e} timeFormat={type == 'time' ? 'HH:mm' : false} dateFormat={type == 'dd/mm' ? 'DD/MM' : 'DD/MM/YYYY'} renderInput={this.renderInput} inputProps={inputProps} value={this.state.value} onChange={e => this.handleChange(e)} closeOnSelect={true} updateOnView={type == 'time' ? 'time' : ''} />
                )}
            </div>);
    }
}