import React from 'react';
import moment from 'moment';

export class EaseDateRangePicker extends React.Component {
    state = {}
    picker = null;

    componentDidUpdate(prevProps) {
        let change = false;
        if (this.props.minDate != prevProps.minDate) {
            change = true;
        }
        if (this.props.maxDate != prevProps.maxDate) {
            change = true;
        }
        if (change) {
            this.generatePicker();
            this.picker.renderAll();
        }
    }

    generatePicker = () => {
        if (this.picker) this.picker.destroy();
        const _update = this.update;
        const { readOnly = false, disabled = false, format = 'DD/MM/YYYY', zIndex = 10, middleWare = null, onChange, withTime, maxYear = new Date().getFullYear() + 3, inline = false, minDate = null, maxDate = null } = this.props;
        this.picker = new easepick.create({// eslint-disable-line
            element: this.input,
            css: [
                '/css/easepicker.css',
            ],
            zIndex, format, readOnly: readOnly || disabled, inline,
            AmpPlugin: {
                dropdown: { months: true, years: true, maxYear },
                darkMode: false,
                resetButton: true
            },
            LockPlugin: { minDate, maxDate, },
            plugins: ['AmpPlugin', 'RangePlugin', 'LockPlugin', ...(withTime ? ['TimePlugin'] : [])],
            setup(picker) {
                picker.on('clear', () => {
                    _update(null, null, () => {
                        onChange && onChange(null, null);
                    });
                });
                picker.on('select', (e) => {
                    let { start, end } = e.detail;
                    let [_start, _end] = middleWare ? middleWare(new Date(start), new Date(end)) : [start, end];
                    if (!(start == _start) || !(end == _end)) {
                        picker.setStartDate(_start);
                        picker.setEndDate(_end);
                        start = _start;
                        end = _end;
                    }
                    _update(start, end, () => {
                        onChange && onChange(start, end);
                    });
                });
            },
        });
    }

    componentDidMount() {
        $(document).ready(() => {
            this.generatePicker();
        });
    }

    value = function (start, end) {
        if (arguments.length) {
            if (start != null) {
                this.picker.setStartDate(new Date(start));
                this.setState({ start: new Date(start) });
            }
            if (end != null) {
                this.picker.setEndDate(new Date(end));
                this.setState({ end: new Date(end) });
            }
            this.picker.renderAll();
        } else {
            return [this.state.start, this.state.end];
        }
    };


    update = (start, end, done) => {
        this.setState({ start, end }, done);
    }

    focus = () => {
        // this.picker.focus();
        this.input.click();
    }

    render() {
        const { style = {}, className = '', label, readOnly = false, required = false, readOnlyEmptyText = '', placeholder = '', inputClassName = '', disabled = false, format = 'DD/MM/YYYY' } = this.props;
        const readOnlyText = `${this.state.start ? moment(this.state.start).format(format) : ''} - ${this.state.end ? moment(this.state.end).format(format) : ''}`;
        return <div className={'form-group ' + className} style={{ ...style, }}>
            <>{label ? <label onClick={() => !(readOnly || disabled) && this.focus()}>{label}{!readOnly && required ?
                <span style={{ color: 'red' }}> *</span> : ''}</label> : null}{readOnly ? <>: <b>{readOnlyText || readOnlyEmptyText}</b></> : ''}</>
            {!!disabled && <input className={'form-control ' + inputClassName} placeholder={placeholder || label} disabled value={readOnlyText} />}
            <input ref={e => this.input = e} className={(readOnly || disabled ? 'd-none' : 'ease-date-picker-input-enable') + ' form-control ' + inputClassName} placeholder={placeholder || label} />
        </div >;
    }
}