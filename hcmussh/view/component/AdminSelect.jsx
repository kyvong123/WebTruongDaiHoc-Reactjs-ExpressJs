import React from 'react';

export class AdminSelect extends React.Component {
    static defaultProps = { formType: 'selectBox' }
    state = { valueText: '', hasInit: false, tempData: '' };
    hasInit = false;

    componentDidMount() {
        if ($('.input-group').has(this.input)[0])
            $('html, body').css({
                'overflow': 'auto',
                'height': '100%'
            });
        if ($('.app-title').has(this.input)[0] || $('.app-advance-search').has(this.input)[0])
            $('html').css({
                'overflow-x': 'hidden',
            });
        const { value, placeholder, label } = this.props;
        const dropdownParent = this.props.dropdownParent || $('.input-group').has(this.input)[0] || $('.modal-body').has(this.input)[0] || $('.tile-body').has(this.input)[0] || $('.tile').has(this.input)[0] || $('.app-title').has(this.input)[0] || $('.app-advance-search').has(this.input)[0];
        $(this.input).select2({ placeholder: placeholder || label, dropdownParent });
        $(this.input).on('select2:select', e => this.onSelect(e));
        $(this.input).on('select2:unselect', e => this.onUnSelect(e));
        $(this.input).on('select2:open', () => {
            !this.hasInit && setTimeout(() => {
                this.value(null);
                setTimeout(this.focus, 50);
            }, 50);
            $('.select2-dropdown').css('z-index', 1);
        });
        value && this.value(value);
    }
    componentDidUpdate(prevProps) {
        if (this.props.value !== undefined && this.props.value != prevProps.value) this.value(this.props.value);
    }

    componentWillUnmount() {
        $(this.input).off('select2:select');
        $(this.input).off('select2:unselect');
        $(this.input).off('select2:open');
        $('html').css({
            'overflow-x': 'auto',
        });
    }

    onSelect = (e) => {
        const { isPopup, onChange } = this.props;
        if (isPopup) {
            let element = e.params.data.element;
            let $element = $(element);
            let resultOption = $('.select2-results__options');
            let values = $(this.input).val();
            if (values != null || values.length) {
                resultOption.find('li[aria-selected=true]').hide();
                $element.detach();
                $(this.input).append($element);
            }
        }
        onChange && onChange(e.params.data);
    }

    onUnSelect = (e) => {
        e.preventDefault();
        e.stopPropagation();
        $(this.input).select2('open');
        const { multiple, onChange, isPopup } = this.props;
        if (isPopup) {
            let resultOption = $('.select2-results__options');
            let values = $(this.input).val();
            if (values != null || values.length) {
                resultOption.find('li[aria-selected=true]').hide();
            } else {
                resultOption.find('li[aria-selected=true]').show();
            }
        }
        if (multiple) {
            onChange && onChange(e.params.data);
        } else {
            onChange && onChange(null);
        }
    }

    focus = () => (!this.props.readOnly && !this.props.disabled) && $(this.input).select2('open');

    clear = () => $(this.input).val('').trigger('change') && $(this.input).html('');

    value = function (value, done = null) {
        if (typeof done == 'boolean') done = null;
        const dropdownParent = this.props.dropdownParent || $('.input-group').has(this.input)[0] || $('.modal-body').has(this.input)[0] || $('.tile-body').has(this.input)[0] || $('.tile').has(this.input)[0] || $('.app-title').has(this.input)[0] || $('.app-advance-search').has(this.input)[0];
        if (arguments.length) {
            this.clear();
            let hasInit = this.hasInit;
            if (!hasInit) this.hasInit = true;
            const { multiple, data, label, placeholder, minimumResultsForSearch = 1, allowClear = false, closeOnSelect = !multiple, isPopup } = this.props,
                options = { placeholder: placeholder || label, dropdownParent, minimumResultsForSearch, allowClear, closeOnSelect, isPopup };

            if (Array.isArray(data)) {
                options.data = data;
                $(this.input).select2(options).val(value).trigger('change');
                done && done();
            } else {
                options.ajax = { ...data, delay: 500 };
                $(this.input).select2(options);
                if (value) {
                    if (this.props.multiple) {
                        if (!Array.isArray(value)) {
                            value = [value];
                        }

                        const promiseList = value.map(item => {
                            return new Promise(resolve => {
                                if (item.hasOwnProperty('id') && item.hasOwnProperty('text')) {
                                    const option = new Option(item.text, item.id, true, true);
                                    $(this.input).append(option).trigger('change');
                                    resolve(item.text);
                                } else if ((typeof item == 'string' || typeof item == 'number') && data.fetchOne) {
                                    data.fetchOne(item, _item => {
                                        const option = new Option(_item.text, _item.id, true, true);
                                        $(this.input).append(option).trigger('change');
                                        resolve(_item.text);
                                    });
                                } else {
                                    const option = new Option(item, item, true, true);
                                    $(this.input).append(option).trigger('change');
                                    resolve(item);
                                }
                            });
                        });
                        Promise.all(promiseList).then(valueTexts => {
                            // Async set readOnlyText
                            done && done();
                            this.setState({ valueText: valueTexts.join(', ') });
                        });
                    } else {
                        if ((typeof value == 'string' || typeof value == 'number') && data.fetchOne) {
                            data.fetchOne(value, _item => {
                                const option = new Option(_item.text, _item.id, true, true);
                                $(this.input).append(option).trigger('change');
                                done && done(_item);
                                // Async set readOnlyText
                                this.setState({ valueText: _item.text });
                            });
                        } else if (value.hasOwnProperty('id') && value.hasOwnProperty('text')) {
                            $(this.input).select2('trigger', 'select', { data: value });
                            done && done();
                        } else {
                            $(this.input).select2('trigger', 'select', { data: { id: value, text: value } });
                            done && done();
                        }
                    }
                } else {
                    $(this.input).val(null).trigger('change');
                    this.setState({ valueText: '' }, () => {
                        done && done();
                    });
                }
            }

            // Set readOnly text
            if (!this.props.multiple) {
                if (!data || !data.fetchOne) {
                    this.setState({ valueText: $(this.input).find(':selected').text() });
                }
            }
        } else {
            return $(this.input).val();
        }
    }

    data = () => {
        const inputData = $(this.input).select2('data');
        if (inputData) {
            if (this.props.multiple) {
                return inputData.map(item => ({ id: item.id, text: item.text }));
            } else {
                return inputData[0];
            }
        }
    };

    render = () => {
        const { className = '', style = {}, labelStyle = {}, label = '', multiple = false, readOnly = false, required = false, readOnlyEmptyText = '', readOnlyNormal = false, disabled = false } = this.props;
        return (
            <div className={'form-group admin-form-select ' + className} style={style}>
                {label ? <label style={labelStyle} onClick={this.focus}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}{readOnly ? ':' : ''}</label> : null} {readOnly ? (readOnlyNormal ? (this.state.valueText || readOnlyEmptyText) : <b>{this.data()?.text || this.state.valueText || readOnlyEmptyText}</b>) : ''}

                <div style={{ width: '100%', display: readOnly ? 'none' : 'inline-flex' }}>
                    <select ref={e => this.input = e} multiple={multiple} disabled={readOnly || disabled} />
                </div>
            </div>
        );
    }
}