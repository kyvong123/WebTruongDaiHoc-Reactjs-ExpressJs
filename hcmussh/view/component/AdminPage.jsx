import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import FileBox from 'view/component/FileBox';
import Editor from 'view/component/CkEditor4';
import Datetime from 'react-datetime';
import InputMask from 'react-input-mask';
import NumberFormat from 'react-number-format';
import 'react-datetime/css/react-datetime.css';
import Tooltip from '@mui/material/Tooltip';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import { Img } from './HomePage';
import { AdminSelect } from './AdminSelect';
import ImageMultiBox from 'view/component/ImageMultiBox';
export { EaseDateRangePicker } from './EaseDatePicker';

// Table components ---------------------------------------------------------------------------------------------------
export class TableCell extends React.Component { // type = number | date | link | image | checkbox | buttons | text (default)
    render() {
        let { type = 'text', content = '', permission = {}, className = '', style = {}, contentStyle = {}, alt = '', display = true, rowSpan = 1, colSpan = 1, dateFormat, contentClassName = '', onClick = null, nowrap = false, id = null, row = null, onKeyPress = null, dataToggle = '', dataTarget = '', ariaExpanded = '', ariaControls = '' } = this.props;
        if (style == null) style = {};
        if (nowrap) style = { whiteSpace: 'nowrap' };
        if (display != true) {
            return null;
        } else if (type == 'number') {
            return <td id={id} className={className} style={{ textAlign: 'right', ...style }} rowSpan={rowSpan}
                colSpan={colSpan}>{content && !isNaN(content) ? T.numberDisplay(content) : content}</td>;
        } else if (type == 'date') {
            if (!isNaN(Number(content))) content = Number(content);
            return <td id={id} className={className} style={{ ...style }} rowSpan={rowSpan}
                colSpan={colSpan}>{content ? (dateFormat ? T.dateToText(content, dateFormat) : new Date(content).getText()) : ''}</td>;
        } else if (type == 'link') {
            let url = this.props.url ? this.props.url.trim() : '',
                onClick = this.props.onClick;
            if (onClick) {
                return <td id={id} className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan}><a href='#' style={contentStyle}
                    onClick={e => e.preventDefault() || onClick(e)}>{content}</a></td>;
            } else {
                return url.startsWith('http://') || url.startsWith('https://') ?
                    <td className={className} style={{ textAlign: 'left', ...style }} rowSpan={rowSpan} colSpan={colSpan}><a href={url} target='_blank' rel='noreferrer'
                        style={contentStyle}>{content}</a></td> :
                    <td className={className} style={{ textAlign: 'left', ...style }} rowSpan={rowSpan} colSpan={colSpan}><Link to={url} style={contentStyle}>{content}</Link></td>;
            }
        } else if (type == 'image') {
            return content ?
                <td id={id} style={{ textAlign: 'center', ...style }} className={className} rowSpan={rowSpan} colSpan={colSpan}><Img src={content} alt={alt}
                    style={{ height: this.props.height || '32px' }} /></td> :
                <td id={id} style={{ textAlign: 'center', ...style }} className={className} rowSpan={rowSpan} colSpan={colSpan}>{alt}</td>;
        } else if (type == 'checkbox') {
            return this.props.isCheck ? (<td id={id} className={'animated-checkbox ' + className} style={{ textAlign: 'center', ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                <label>
                    <input type='checkbox' checked={content} onChange={() => permission.write && this.props.onChanged && this.props.onChanged(content ? 0 : 1)} disabled={!permission.write} />
                    <span className={'label-text'} />
                </label>
            </td>) :
                (<td id={id} style={{ textAlign: 'center', ...style }} className={'toggle ' + className} rowSpan={rowSpan} colSpan={colSpan}>
                    <label>
                        <input type='checkbox' checked={content} onChange={() => permission.write && this.props.onChanged && this.props.onChanged(content ? 0 : 1)} disabled={!permission.write} />
                        <span className='button-indecator' />
                    </label>
                </td>);
        } else if (type == 'buttons') {
            const { onSwap, onEdit, onDelete, children } = this.props;
            return (
                <td id={id} className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan}>
                    <div className='btn-group'>
                        {children}
                        {permission.write && onSwap ?
                            <a className='btn btn-warning' href='#' onClick={e => e.preventDefault() || onSwap(e, content, true)}><i className='fa fa-lg fa-arrow-up' /></a> : null}
                        {permission.write && onSwap ?
                            <a className='btn btn-warning' href='#' onClick={e => e.preventDefault() || onSwap(e, content, false)}><i className='fa fa-lg fa-arrow-down' /></a> : null}
                        {onEdit && typeof onEdit == 'function' ?
                            <Tooltip title={permission.write ? 'Chỉnh sửa' : 'Xem'} arrow placeholder='bottom'>
                                <a className='btn btn-primary' href='#' onClick={e => e.preventDefault() || onEdit(e, content)}><i className={'fa fa-lg ' + (permission.write ? 'fa-edit' : 'fa-eye')} /></a>
                            </Tooltip> : null
                        }
                        {onEdit && typeof onEdit != 'function' ?
                            <Tooltip title='Chỉnh sửa' arrow placeholder='bottom'>
                                <Link to={onEdit} className='btn btn-primary'><i className='fa fa-lg fa-edit' /></Link>
                            </Tooltip> : null}
                        {permission.delete && onDelete ?
                            <Tooltip title='Xóa' arrow placeholder='bottom'>
                                <a className='btn btn-danger' href='#' onClick={e => e.preventDefault() || onDelete(e, content)}><i className='fa fa-lg fa-trash' /></a>
                            </Tooltip> : null}
                    </div>
                </td>);
        } else {
            return <td onKeyPress={onKeyPress} id={id} row={row} className={className} style={{ ...style }} rowSpan={rowSpan} colSpan={colSpan} onClick={onClick} data-toggle={dataToggle} data-target={dataTarget} aria-expanded={ariaExpanded} aria-controls={ariaControls}>
                <div style={contentStyle} className={contentClassName}>{content}</div>
            </td>;
        }
    }
}

export class TableHeader extends React.Component {
    state = {
        type: 0,
        filter: {}
    };

    sortSwitcher = [
        { className: 'fa fa-sort', value: null },
        { className: 'fa fa-sort-desc', value: 'DESC' },
        { className: 'fa fa-sort-asc', value: 'ASC' }
    ];

    onSortChange = (e, done) => {
        e.preventDefault();
        this.setState({ type: (this.state.type + 1) % 3 }, () => {
            done && done(this.sortSwitcher[this.state.type].value);
        });
    };


    render() {
        let
            { style, className, children, sort, isSorted = true, onSort } = this.props,
            type = this.state.type,
            sortType = isSorted ? this.sortSwitcher[type] : this.sortSwitcher[0];

        return (
            <th style={style} className={className}>
                {
                    sort ? <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                        <span style={{ flex: 1 }}>
                            {children}
                        </span>
                        <i className={sortType.className} onClick={(e) => this.onSortChange(e, onSort)} />
                    </div>
                        : children
                }
            </th>
        );
    }
}

export class TableHead extends React.Component {
    state = {};

    componentWillUnmount() {
        if (this.props.typeSearch == 'admin-select') {
            $('html, body').css({
                'overflow': 'auto',
                'height': 'auto'
            });
        }
    }

    delayTextFilter = (key) => {
        const timeOutId = this.state.timeOutId;
        try {
            timeOutId && clearTimeout(timeOutId);
        }
        catch (e) {
            this.setState({ timeOutId: null });
        }
        const newTimeOutId = setTimeout(() => this.props.onKeySearch(key), 1000);
        this.setState({ timeOutId: newTimeOutId });
    };

    onKeySearch = (key) => {
        let value = this.searchBox.value();
        try {
            switch (this.props.typeSearch) {
                case 'year':
                case 'date':
                    value = value?.setHours(0, 0, 0) || '';
                    break;
                default:
                    break;
            }
        }
        catch (error) {
            value = '';
        }
        this.props.onKeySearch && this.delayTextFilter(`ks_${key}:${value || ''}`);
    };
    reloadAjax = () => {
        this.props.typeSearch == 'admin-select' && this.searchBox.value('');
    };

    onSortChange = (key) => {
        let cur = $(`#${key}`).attr('aria-sort'), sortTerm = '';
        $(`.table-head-title:not(#${key})`).attr('aria-sort', 'none');
        switch (cur) {
            case null || 'none':
                $(`#${key}`).attr('aria-sort', 'descending');
                sortTerm = key + '_DESC';
                break;
            case 'descending':
                $(`#${key}`).attr('aria-sort', 'ascending');
                sortTerm = key + '_ASC';
                break;
            case 'ascending':
                $(`#${key}`).attr('aria-sort', 'none');
                sortTerm = null;
                break;
        }
        this.props.onSort && this.props.onSort(sortTerm);
    };

    render() {
        const { content = '', keyCol = '', style = {}, onKeySearch = null, typeSearch = 'text', rowSpan, colSpan, className = '' } = this.props;
        let searchBox = null;
        switch (typeSearch) {
            case 'select':
                searchBox = <FormSelect className='input-group' ref={e => this.searchBox = e} style={{ marginBottom: 0, marginTop: '5px', fontWeight: 'normal' }} data={this.props.data}
                    onChange={() => this.onKeySearch(keyCol)} allowClear={true} placeholder={this.props.content || 'Bộ lọc'} />;
                break;
            case 'admin-select':
                searchBox = <AdminSelect dropdownParent={this.props.dropdownParent} className='input-group' ref={e => this.searchBox = e} style={{ marginBottom: 0, marginTop: '5px', fontWeight: 'normal' }} data={this.props.data}
                    onChange={() => this.onKeySearch(keyCol)} allowClear={true} placeholder={this.props.content || 'Bộ lọc'} />;
                break;
            case 'year':
            case 'date':
                searchBox = <FormDatePicker type={`${typeSearch}-mask`} ref={e => this.searchBox = e} className='input-group'
                    style={{ marginBottom: 0, marginTop: '5px', minWidth: typeSearch == 'year' ? '60px' : '100px' }}
                    onKeyDown={e => e.code == 'Enter' && this.onKeySearch(keyCol)} />;
                break;
            default:
                searchBox = <FormTextBox className='input-group' style={{ marginTop: '5px', marginBottom: 0 }} ref={e => this.searchBox = e} onChange={() => this.onKeySearch(keyCol)} />;
        }
        return <th className={className + ' table-head'} style={{ whiteSpace: 'nowrap', ...style }} rowSpan={rowSpan || 1} colSpan={colSpan || 1}>
            <div className='table-head-title' id={keyCol} aria-sort='none'>
                <span className='content-head' style={{ whiteSpace: 'nowrap', display: 'inline' }}>{content}</span>
                {this.props.onSort && <span className='sort-head' onClick={e => e.preventDefault() || this.onSortChange(keyCol)} />}
            </div>
            {onKeySearch && searchBox}
        </th>;
    }
}

export function renderDataTable({
    data = [], style = {}, stickyHead = true, className = '', renderHead = () => null, renderRow = () => null, divStyle = {}, loadingText = 'Đang tải', customClassName = ''
}) {
    const table = (
        <table className={'table table-bordered table-responsive ' + className} style={{ margin: 0, ...style }}>
            <thead className='thead-light'>{renderHead()}</thead>
            {!data ? <caption className='overlay' style={{ minHeight: '120px' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h3 className='l-text'>{loadingText}</h3>
            </caption> :
                (data.length && typeof renderRow == 'function' ? <tbody>
                    {data.map(renderRow)}
                </tbody> : renderRow)
            }
        </table>
    );
    const properties = {};
    properties.className = customClassName;
    if (stickyHead) {
        properties.className += ' tile-table-fix-head';
        properties.style = Object.assign({}, divStyle);
    } else {
        properties.style = { marginBottom: 8 };
    }
    return <div {...properties}>{table}</div>;

}

export function renderTable({
    style = {}, className = '', getDataSource = () => null, loadingText = 'Đang tải...', emptyTable = 'Chưa có dữ liệu!', stickyHead = false, bodyClassName = '',
    renderHead = () => null, renderRow = () => null, header = 'thead-dark', loadingOverlay = true, loadingClassName = '', loadingStyle = {}, multipleTbody = false, divStyle = {},
    hover = true
}) {
    const list = getDataSource();
    if (list == null) {
        return (
            <div className={(loadingOverlay ? 'overlay' : '') + loadingClassName} style={{ minHeight: '120px', ...loadingStyle }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h3 className='l-text'>{loadingText}</h3>
            </div>);
    } else if (list.length) {
        const table = (
            <table className={`table ${hover ? 'table-hover' : ''} table-bordered table-responsive ` + className} style={{ margin: 0, ...style }}>
                <thead className={header}>{renderHead()}</thead>
                {
                    multipleTbody ? <>{typeof renderRow == 'function' ? list.map(renderRow) : renderRow}</> : <tbody className={bodyClassName}>{typeof renderRow == 'function' ? list.map(renderRow) : renderRow}</tbody>
                }
            </table>
        );

        const properties = {};
        if (stickyHead) {
            properties.className = 'tile-table-fix-head';
            properties.style = Object.assign({}, divStyle);
        } else {
            properties.style = { marginBottom: 8 };
        }
        return <div {...properties}>{table}</div>;
    } else {
        return <b>{emptyTable}</b>;
    }
}

export const loadSpinner = (loadingText = 'Đang tải') => {
    return (
        <div className='tile'>
            <div className='overlay' style={{ minHeight: '120px' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h3 className='l-text'>{loadingText}</h3>
            </div>
        </div>
    );
};

// Element ------------------------------------------------------------------------------------------
export function renderComment({
    renderAvatar = () => null, renderName = () => null, renderContent = () => null, renderTime = () => null, getDataSource = () => null, loadingText = 'Đang tải ...',
    emptyComment = 'Chưa có phản hồi', getItemStyle = () => {
    }
}) {
    const list = getDataSource();
    if (list == null) {
        return (
            <div className='d-flex justify-content-center align-item-center' style={{ minHeight: '120px' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h3 className='l-text'>{loadingText}</h3>
            </div>);
    } else if (list.length) {
        const
            contentStyle = {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                backgroundColor: '#E3E3E3',
                padding: '10px 10px 10px 10px',
                borderRadius: '5px'
            },
            flexRow = {
                display: 'flex',
                flexDirection: 'row',
                gap: '15px'
            };
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                {
                    list.map((item, index) => {
                        return (
                            <div key={index} style={flexRow}>
                                <div>{renderAvatar(item)}</div>
                                <div style={{ ...contentStyle, ...getItemStyle(item) }}>
                                    <div style={{ borderBottom: '1px solid #000000 ', paddingLeft: '5px', ...flexRow }}>
                                        <b style={{ flex: 1, whiteSpace: 'nowrap' }}>{renderName(item)}</b>
                                        <span style={{ whiteSpace: 'nowrap' }}>{renderTime(item)}</span>
                                    </div>
                                    <div style={{ paddingTop: '5px' }}>{renderContent(item)}</div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    } else
        return <b>{emptyComment}</b>;
}

export const renderTimeline = ({
    className = '', style = {},
    handleItem = () => ({}), getDataSource = () => null, loadingText = 'Đang tải ...', emptyTimeline = 'Chưa có dữ liệu'
}) => {
    const list = getDataSource();
    if (list == null)
        return (
            <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '120px' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h3 className='l-text'>{loadingText}</h3>
            </div>);
    else if (list && list.length > 0) {
        return (
            <div className={'history-container ' + className} style={style}>
                <ul className='sessions'>
                    {list.map((item, index) => {
                        const { component = null, style = {}, className = '' } = handleItem(item, index);
                        return <li key={index} style={style} className={className + ' history-item'}>{component}</li>;
                    })}
                </ul>
            </div>
        );
    } else {
        return <b>{emptyTimeline}</b>;
    }
};

// Form components ----------------------------------------------------------------------------------------------------
export class FormUpload extends React.Component {
    state = { listFile: [], listFileName: [], allImageUploaded: [] };

    onSelectFileChanged = (event) => {
        this.formUpload.classList.add('dz-started');
        let files = event.target.files;
        if (files && files.length) {
            this.onUploadFile(Object.values(files));
        }
        event.target.value = '';
    };

    handleClick = (e) => {
        e?.stopPropagation();
        this.upload.click();
    };

    setActiveDropzone = (isActive) => this.formUpload.classList[isActive ? 'add' : 'remove']('dz-drag-hover');

    onDrop = (event) => {
        event.preventDefault();
        this.setActiveDropzone(false);
        this.formUpload.classList.add('dz-started');
        if (event.dataTransfer.items) {
            if (event.dataTransfer.items.length > 0) {
                const items = event.dataTransfer.items, files = [];
                for (let i = 0; i < items.length; i++) {
                    if (items[i].kind == 'file') {
                        files.push(items[i].getAsFile());
                    }
                }
                this.onUploadFile(files);
            }
            event.dataTransfer.items.clear();
        } else {
            if (event.dataTransfer.files.length > 0) {
                const items = event.dataTransfer.files, files = [];
                for (let i = 0; i < items.length; i++) {
                    files.push(items[i]);
                }
                this.onUploadFile(files);
            }
            event.dataTransfer.clearData();
        }
    };

    handleSize = (size) => {
        size = size / 1000;
        let calSize = (size / 1024).toFixed(1);
        return calSize != '0.0' ? <span><strong>{calSize}</strong> MB</span> : <span><strong>{Number(size).toFixed(1)}</strong> KB</span>;
    };

    showFilesUploaded = (files, isReset) => {
        if (isReset) {
            this.setState({ listFile: [] });
            this.formUpload.classList.remove('dz-started');
        } else {
            this.setState({
                listFile: [...this.state.listFile, ...files.map(item => ({ ...item, uploadDone: true }))]
            }, () => {
                if (this.state.listFile.length == 0) {
                    this.formUpload.classList.remove('dz-started');
                }
            });
        }
    };

    onUploadFile = (files) => {
        if (files && files.length) {
            this.setState({ listFile: [...this.state.listFile, ...files] });
            const { onPercent, uploadType, postUrl = '/user/upload', onComplete, onSuccess, onError, userData } = this.props;
            this.setState({ isUploading: true });
            let updateUploadPercent = percent => {
                onPercent && onPercent(percent);
                this.setState({ process: percent + '%' });
            };

            const formData = new FormData();
            files.forEach(file => formData.append(uploadType, file));
            userData && formData.append('userData', userData);

            $.ajax({
                method: 'POST',
                url: postUrl || '/user/upload',
                dataType: 'json',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                xhr: () => {
                    const xhr = new window.XMLHttpRequest();

                    xhr.upload.addEventListener('progress', evt => {
                        if (evt.lengthComputable) {
                            updateUploadPercent((100 * evt.loaded / evt.total).toFixed(2));
                        }
                    }, false);

                    xhr.addEventListener('progress', evt => {
                        if (evt.lengthComputable) {
                            updateUploadPercent((100 * evt.loaded / evt.total).toFixed(2));
                        }
                    }, false);

                    return xhr;
                },
                complete: () => {
                    this.setState({ process: '0%', listFile: this.state.listFile.filter(item => item.uploadDone) });
                    onComplete && onComplete();
                },
                success: data => {
                    onSuccess && onSuccess(data);
                },
                error: error => {
                    this.setState({ process: '0%' });
                    onError && onError(error);
                }
            });

        }
    };

    onDragOver = (event) => event.preventDefault();

    onDragEnter = (event) => {
        event.preventDefault();
        this.setActiveDropzone(true);
    };

    onDragLeave = (event) => {
        event.preventDefault();
        this.setActiveDropzone(false);
    };

    render() {
        let { listFile } = this.state,
            { uploadType = 'UploadFile', accept, isDownload, isDelete } = this.props;
        return <div>
            <form id={uploadType} ref={e => this.formUpload = e} action='#' className='dropzone dz-clickable' onClick={this.handleClick} onDragOver={this.onDragOver} onDragEnter={this.onDragEnter}
                onDragLeave={this.onDragLeave} onDrop={this.onDrop}>
                <div className='fallback'>
                    <input style={{ display: 'none' }} accept={accept} name={uploadType} type='file' multiple={true} ref={e => this.upload = e} onChange={this.onSelectFileChanged} />
                </div>
                <div className='dz-message'>
                    <i className='display-4 text-muted fa fa-lg fa-cloud-upload' />
                    <h5>Drop files here or click to upload.</h5>
                </div>
                {listFile.map(({ name, size, uploadDone }, index) => <div key={index} className={'dz-preview dz-file-preview dz-processing ' + (this.state.process == '100.00%' ? 'dz-complete ' : '')}
                    onClick={e => e.stopPropagation()}>
                    <div className='dz-image'>
                        <img data-dz-thumbnail />
                    </div>
                    <div className='dz-details'>
                        <div className='dz-size' data-dz-size>
                            {this.handleSize(size)}
                        </div>
                        <div className='dz-filename'><span data-dz-name>{name}</span></div>
                    </div>
                    <div className='dz-progress' style={{ display: uploadDone ? 'none' : '' }}>
                        <span className='dz-upload' data-dz-uploadprogress style={{ width: this.state.process }} />
                    </div>
                    <div className='dz-utils' style={{ display: isDelete || isDownload ? '' : 'none' }}>
                        <div>
                            <a href='#' style={{ display: isDownload ? '' : 'none' }} onClick={() => console.log('Download')}>
                                <i className='fa fa-2x fa-cloud-download text-success' />
                            </a>
                            <a href='#' style={{ display: isDelete ? '' : 'none' }} onClick={e => e.stopPropagation() || console.log('Delete')}>
                                <i className='fa fa-2x fa-times-circle text-danger' />
                            </a>
                        </div>
                    </div>
                </div>)}
            </form>
        </div>;
    }
}

export class FormTabs extends React.Component {
    randomKey = T.randomPassword(8);
    state = { tabIndex: 0 };

    componentDidMount() {
        $(document).ready(() => {
            let { id, changeOnLoad = true } = this.props;
            let tabIndex = parseInt(T.cookie(id || 'tab'));
            if (isNaN(tabIndex) || tabIndex < 0 || tabIndex >= $(this.tabs).children().length) tabIndex = 0;
            this.setState({ tabIndex }, () => {
                changeOnLoad && setTimeout(() => {
                    this.props.onChange && this.props.onChange({ tabIndex });
                }, 250);
            });
        });
    }

    onSelectTab = (e, tabIndex) => {
        e && e.preventDefault();
        T.cookie(this.props.id || 'tab', tabIndex);
        this.setState({ tabIndex }, () => this.props.onChange && this.props.onChange({ tabIndex }));
    };

    selectedTabIndex = () => this.state.tabIndex;

    tabClick = (e, index) => {
        e && e.preventDefault();
        this.onSelectTab(e, index);
        $(`a[href='#${(this.props.id || 'tab')}_${index}${this.randomKey}']`).trigger('click');
    };

    render() {
        const { style = {}, tabClassName = '', contentClassName = '', tabs = [], header = null, className = '' } = this.props,
            id = this.props.id || 'tab',
            tabLinks = [], tabPanes = [];
        tabs.forEach((item, index) => {
            const tabId = id + '_' + index + this.randomKey,
                className = (index == this.state.tabIndex ? ' active show' : ''),
                disabled = item.disabled ? 'disabled ' : '';
            tabLinks.push(<li key={index} className={'nav-item ' + disabled + className}>
                <a className={'nav-link ' + disabled} data-toggle='tab' href={'#' + tabId} onClick={e => this.onSelectTab(e, index)}>{item.title}</a>
            </li>);
            tabPanes.push(<div key={index} className={'tab-pane fade' + className} id={tabId}>{item.component}</div>);
        });

        return <div style={style} className={className}>
            <ul ref={e => this.tabs = e} className={'nav nav-tabs ' + tabClassName}>{tabLinks}</ul>
            <div className={'tab-content ' + contentClassName} style={{ position: 'relative' }}>
                {header}
                {tabPanes}
            </div>
        </div>;
    }
}

export class FormCheckbox extends React.Component {
    static defaultProps = { formType: 'checkBox' };
    state = { checked: false };

    componentDidMount() {
        if (this.props.value !== undefined) this.value(this.props.value);
    }

    value = (checked) => {
        if (checked != null) {
            this.setState({ checked });
        } else {
            return this.state.checked;
        }
    };

    onCheck = () => this.props.readOnly || this.setState({ checked: !this.state.checked }, () => this.props.onChange && this.props.onChange(this.state.checked));

    render() {
        let { className = '', label, style, isSwitch = false, trueClassName = 'text-primary', falseClassName = 'text-secondary', inline = true, labelStyle = {}, labelClassName = '' } = this.props;
        if (style == null) style = {};
        return isSwitch ? (
            <div className={className} style={{ display: inline ? 'inline-flex' : '', ...style }}>
                <label style={{ cursor: 'pointer' }} onClick={this.onCheck}>{label ? <>{label} :</> : ''}&nbsp;</label>
                <div className='toggle'>
                    <label style={{ marginBottom: 0 }}>
                        <input type='checkbox' disabled={this.props.readOnly} checked={this.state.checked} onChange={this.onCheck} /><span className='button-indecator' />
                    </label>
                </div>
            </div>) : (
            <div className={'animated-checkbox ' + className} style={style}>
                <label style={labelStyle} className={labelClassName || ''}>
                    <input type='checkbox' disabled={this.props.readOnly} checked={this.state.checked} onChange={this.onCheck} />
                    <span className={'label-text ' + (this.props.readOnly ? 'text-secondary' : (this.state.checked ? trueClassName : falseClassName))} onChange={this.onCheck}>{label}</span>
                </label>
            </div>
        );
    }
}

class FormNumberBox extends React.Component {
    exactValue = null;
    state = { value: '' };

    componentDidMount() {
        if (this.props.value != null && this.props.value != undefined) this.value(this.props.value);
        if (this.props.defaultValue != null && this.props.defaultValue != undefined) this.value(this.props.defaultValue);
    }

    componentDidUpdate(prevProps) {
        if ((this.props.value != null && this.props.value != undefined) && (this.props.value != prevProps.value || this.props.value != this.exactValue)) this.value(this.props.value);
    }

    value = function (text) {
        if (arguments.length) {
            this.exactValue = null;
            this.setState({ value: text }, () => {
                if (this.exactValue == null) this.exactValue = this.state.value;
            });
        } else {
            return this.exactValue;
        }
    };

    focus = () => this.input.focus();

    checkMinMax = (val) => {
        const { min = '', max = '' } = this.props;
        if (!isNaN(parseFloat(min)) || !isNaN(parseFloat(max))) { // Có properties min hoặc max
            if (!isNaN(parseFloat(min)) && val < parseFloat(min)) { // Có properties min và val < min
                return min.toString();
            }
            if (!isNaN(parseFloat(max)) && val > parseFloat(max)) { // Có properties max và val > max
                return max.toString();
            }
            return false;
        } else {
            return false;
        }
    };

    render() {
        let { smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, onChange = null, required = false, step = false, prefix = '', suffix = '', onKeyPress = null, autoFormat = true, disabled, allowNegative = true, decimalScale, onBlur = null, inputClassName = '' } = this.props,
            readOnlyText = '';
        if (this.exactValue != undefined && this.exactValue != null) {
            readOnlyText = this.exactValue;
        } else if (this.state.value != undefined && this.state.value != null) {
            readOnlyText = this.state.value;
        }


        const properties = {
            className: 'form-control ' + inputClassName,
            allowNegative,
            placeholder: placeholder || label,
            value: (this.exactValue != undefined && this.exactValue != null) ? this.exactValue : this.state.value,
            thousandSeparator: autoFormat ? ',' : null,
            decimalSeparator: step ? '.' : false,
            decimalScale: decimalScale || 0,
            onValueChange: (val, e) => {
                if (e.event) {
                    const newValue = this.checkMinMax(val.floatValue);
                    if (newValue != false) {
                        this.setState({ value: newValue });
                    } else {
                        this.exactValue = (val.floatValue == undefined || val.floatValue == null) ? '' : val.floatValue;
                        onChange && onChange(val.floatValue);
                    }
                }
            },
            onKeyPress: e => onKeyPress && onKeyPress(e),
            getInputRef: e => this.input = e
        };

        if (onBlur) properties.onBlur = () => onBlur(this.value());

        readOnlyText = (readOnlyText != null && readOnlyText != '' && readOnlyText != undefined) ? T.numberDisplay(readOnlyText, ',') : '';
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ?
                <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText}</b></> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{readOnlyText}</b> : '';
        }

        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {displayElement}
                <NumberFormat disabled={disabled} prefix={prefix} suffix={suffix} style={{ display: readOnly ? 'none' : 'block' }} {...properties} />
                {smallText ? <small>{smallText}</small> : null}
            </div>);
    }
}

class FormYearBox extends React.Component {
    state = { value: '' };
    mask = {
        'year': '2099',
        'scholastic': '2099 - 2099'
    };

    value = function (value) {
        if (arguments.length) {
            this.setState({ value: value.toString() });
        } else {
            return this.state.value.includes('_') ? '' : this.state.value;
        }
    };

    focus = () => this.input.getInputDOMNode().focus();

    handleChange = event => {
        event.preventDefault && event.preventDefault();
        this.setState({ value: event.target.value }, () => {
            this.props.onChange && this.props.onChange(this.state.value);
        });
    };

    render() {
        let { smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, required = false, type = 'year' } = this.props,
            readOnlyText = this.state.value;
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.focus()}>{label}{!readOnly && required ?
                <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText}</b></> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{readOnlyText}</b> : '';
        }

        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {displayElement}
                <InputMask ref={e => this.input = e} className='form-control' mask={this.mask[type]} onChange={this.handleChange} style={{ display: readOnly ? 'none' : '' }}
                    formatChars={{ '2': '[12]', '0': '[089]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' }} value={this.state.value} readOnly={readOnly}
                    placeholder={placeholder || label} onKeyDown={this.props.onKeyDown} />
                {smallText ? <small>{smallText}</small> : null}
            </div>);
    }
}

export class FormTextBox extends React.Component {
    static defaultProps = { formType: 'textBox' }
    state = { value: '', isValid: true };
    componentDidMount() {
        if (this.props.value !== undefined) this.value(this.props.value);
    }

    value = function (text) {
        if (arguments.length) {
            if (this.props.type == 'number' || this.props.type == 'year' || this.props.type == 'scholastic') {
                this.input.value(text);
            } else {
                this.setState({ value: text });
            }
        } else {
            if (this.props.type == 'number' || this.props.type == 'year' || this.props.type == 'scholastic') {
                return this.input.value();
            }
            return this.state.value;
        }
    };

    focus = () => this.input.focus();
    clear = () => this.input.clear();
    valid = (isValid) => this.setState({ isValid });

    render() {
        let { type = 'text', smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, onChange = null, onBlur = null, required = false, readOnlyEmptyText = '', disabled = false, inputClassName = '', inputStyle = {}, maxLength = null, readOnlyClassName = '' } = this.props,
            readOnlyText = this.state.value;

        type = type.toLowerCase(); // type = text | number | email | password | phone | year
        if (type == 'number') {
            return <FormNumberBox ref={e => this.input = e} {...this.props} />;
        } else if (type == 'year' || type == 'scholastic') {
            return <FormYearBox ref={e => this.input = e} {...this.props} />;
        } else {
            const properties = {
                type,
                className: 'form-control ' + (this.state.isValid ? '' : 'is-invalid ') + inputClassName,
                placeholder: placeholder || label,
                value: this.state.value,
                maxLength,
                onChange: e => this.setState({ value: e.target.value }, () => (onChange && onChange(e)))
            };
            if (onBlur) properties.onBlur = () => onBlur(this.value());
            if (type == 'password') properties.autoComplete = 'new-password';
            if (type == 'phone') {
                if (readOnlyText) readOnlyText = T.mobileDisplay(readOnlyText);
                properties.onKeyPress = e => ((!/[0-9]/.test(e.key)) && e.preventDefault());
            }
            let displayElement = '';
            if (label) {
                displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ?
                    <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b className={readOnlyClassName}>{readOnlyText || readOnlyEmptyText}</b></> : ''}</>;
            } else {
                displayElement = readOnly ? <b>{readOnlyText || readOnlyEmptyText}</b> : '';
            }

            return (
                <div className={'form-group ' + (className || '')} style={style}>
                    {displayElement}
                    <input disabled={disabled} ref={e => this.input = e} style={{ display: readOnly ? 'none' : 'block', ...inputStyle }}{...properties} onKeyDown={this.props.onKeyDown} />
                    {smallText ? <small>{smallText}</small> : null}
                </div>);
        }
    }
}

export class FormRichTextBox extends React.Component {
    static defaultProps = { formType: 'richTextBox' };
    state = { value: '' };

    value = (text) => {
        if (text === '' || text) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    };

    focus = () => this.input.focus();

    clear = () => this.input.clear();

    render() {
        const { style = {}, rows = 3, label = '', placeholder = '', className = '', readOnly = false, onChange = null, required = false, readOnlyEmptyText = '', icon = '' } = this.props;
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly && this.state.value ? <>: <br />
                <b style={{ whiteSpace: 'pre-wrap' }}>{this.state.value}</b></> :
                (readOnly && readOnlyEmptyText) ? <b>{readOnlyEmptyText}</b> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{this.state.value}</b> : '';
        }
        return (
            <div className={'form-group ' + (className ? className : '')} style={style}>
                {displayElement}
                <textarea ref={e => this.input = e} className='form-control' style={{ display: readOnly ? 'none' : 'block', position: 'relative' }} placeholder={placeholder ? placeholder : label}
                    value={this.state.value} rows={rows} onChange={e => this.setState({ value: e.target.value }) || onChange && onChange(e)} />
                {icon}
            </div>);
    }
}

export class FormRichTextBoxV2 extends React.Component {
    static defaultProps = { formType: 'richTextBox' };
    state = { value: '' };

    constructor(props) {
        super(props);
        this.state = { curLen: 0, maxLen: this.props.maxLen ?? 2000 };
    }

    value = (text) => {
        if (text === '' || text) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    };

    focus = () => this.input.focus();

    clear = () => this.input.clear();

    render() {
        const { style = {}, rows = 3, label = '', placeholder = '', className = '', readOnly = false, onChange = null, required = false, readOnlyEmptyText = '', icon = '' } = this.props;
        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly && this.state.value ? <>: <br />
                <b style={{ whiteSpace: 'pre-wrap' }}>{this.state.value}</b></> :
                (readOnly && readOnlyEmptyText) ? <b>{readOnlyEmptyText}</b> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{this.state.value}</b> : '';
        }
        return (
            <div className={'form-group ' + (className ? className : '')} style={style}>
                {displayElement}
                <textarea ref={e => this.input = e} className='form-control' style={{ display: readOnly ? 'none' : 'block', position: 'relative' }} placeholder={placeholder ? placeholder : label}
                    value={this.state.value} rows={rows}
                    onChange={e => {
                        if (e.target.value.length <= this.state.maxLen) {
                            this.setState({ value: e.target.value, curLen: e.target.value.length }) || onChange && onChange(e);
                        }
                    }}
                />
                {icon}
                <span style={{
                    color: 'coral',
                    position: 'absolute',
                    bottom: '5px',
                    right: '20px',
                }} id="charNum">{this.state.curLen}/{this.state.maxLen} Ký tự</span>
            </div>);
    }
}

export class FormEditor extends React.Component {
    static defaultProps = { formType: 'editor' };
    state = { value: '' };

    html = (text) => {
        if (text === '' || text) {
            this.input.html(text);
            this.setState({ value: text });
        } else {
            return this.input.html();
        }
    };

    value = this.html;

    text = () => this.input.text();

    focus = () => this.input.focus();

    render() {
        let { height = '400px', label = '', className = '', readOnly = false, uploadUrl = '', smallText = '', required = false, style } = this.props;
        className = 'form-group' + (className ? ' ' + className : '');
        return (
            <div className={className} style={style}>
                <label>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly && this.state.value ? <br /> : ''}
                <p style={{ width: '100%', fontWeight: 'bold', display: readOnly ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: this.state.value }} />
                {!readOnly && smallText ? <small className='form-text text-muted'>{smallText}</small> : null}
                <div style={{ display: readOnly ? 'none' : 'block' }}>
                    <Editor ref={e => this.input = e} height={height} placeholder={label} uploadUrl={uploadUrl} />
                </div>
            </div>);
    }
}

export class FormSelect extends React.Component {
    static defaultProps = { formType: 'selectBox' };
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
                'overflow-x': 'hidden'
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
            $('.select2-dropdown').css('z-index', 1051);
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
            'overflow-x': 'auto'
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
    };

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
    };

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
    };

    valid = (isValid) => {
        const selection = $(this.input).parent('div').children('span.select2').children('span.selection').children('span.select2-selection');
        if (!isValid) {
            selection.addClass('is-invalid');
        } else {
            selection.removeClass('is-invalid');
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
                {label ? <label style={labelStyle} onClick={this.focus}>{label}{!readOnly && required ?
                    <span style={{ color: 'red' }}> *</span> : ''}{readOnly ? ':' : ''}</label> : null} {readOnly ? (readOnlyNormal ? (this.state.valueText || readOnlyEmptyText) :
                        <b>{this.data()?.text || this.state.valueText || readOnlyEmptyText}</b>) : ''}

                <div style={{ width: '100%', display: readOnly ? 'none' : 'inline-flex' }}>
                    <select ref={e => this.input = e} multiple={multiple} disabled={readOnly || disabled} />
                </div>
            </div>
        );
    };
}

export class FormDatePicker extends React.Component {
    static defaultProps = { formType: 'datePicker', type: 'date' };

    mask = {
        'hour-mask': 'h9:59',
        'time-mask': '39/19/2099 h9:59',
        'date-mask': '39/19/2099',
        'year-mask': '2099',
        'month-mask': '19/2099',
        'date-month': '39/19'
    };

    format = {
        'hour-mask': 'hh:MM',
        'time-mask': 'dd/mm/yyyy HH:MM',
        'date-mask': 'dd/mm/yyyy',
        'month-mask': 'mm/yyyy',
        'year-mask': 'yyyy',
        'date-month': 'dd/mm'
    };

    state = { value: '', readOnlyText: '', isValid: true };

    componentDidMount() {
        if (this.props.value !== undefined) this.value(this.props.value);
    }

    value = function (date) {
        const type = this.props.type;
        if (arguments.length) {
            if (type == 'date-month') {
                const value = date ? T.dateToText(new Date(date), this.format[type]) : '';
                this.setState({ value, readOnlyText: value });
            } else if (type == 'hour-mask') {
                this.setState({ value: date, readOnlyText: date });
            } else if (type.endsWith('-mask')) {
                const value = date ? T.dateToText(new Date(date), this.format[type]) : '';
                this.setState({ value, readOnlyText: value });
            } else {
                this.setState({
                    value: date ? new Date(date) : '',
                    readOnlyText: date ? T.dateToText(new Date(date), type == 'date' ? 'dd/mm/yyyy' : type == 'dd/mm' ? 'dd/mm' : 'dd/mm/yyyy HH:MM') : ''
                }, () => {
                    this.state.value == '' && $(this.inputRef).val('');
                });
            }
        } else {
            if (type == 'date-month') {
                const date = T.formatDate(this.state.value + '/' + this.props.year);
                if (date == null || Number.isNaN(date.getTime())) return '';
                return date;
            } else if (type == 'hour-mask') {
                return this.state.value;
            } else if (type.endsWith('-mask')) {
                const date = T.formatDate((type == 'month-mask' ? '01/' : (type == 'year-mask' ? '01/01/' : '')) + this.state.value);
                if (date == null || Number.isNaN(date.getTime())) return '';
                return date;
            } else {
                return this.state.value;
            }
        }
    };

    focus = () => {
        const type = this.props.type;
        if (type == 'date-month') {
            this.input.getInputDOMNode().focus();
        } else if (type.endsWith('-mask')) {
            this.input.getInputDOMNode().focus();
        } else {
            $(this.inputRef).focus();
        }
    };

    valid = (isValid) => this.setState({ isValid });

    handleChange = event => {
        if (event.type == 'blur') this.props.onBlur && this.props.onBlur(event);
        else {
            const type = this.props.type;
            if (event && event.preventDefault) event.preventDefault();
            this.setState({ value: (type.endsWith('-mask') || type == 'date-month') ? event.target.value : (!isNaN(new Date(event).getTime()) ? new Date(event) : '') }, () => {
                this.props.onChange && this.props.onChange(this.value());
            });
        }
    };

    render() {
        let { label = '', type = 'date', className = '', readOnly = false, required = false, style = {}, readOnlyEmptyText = '', placeholder = '', disabled = false, onKeyDown = null, onBlur, newLine = false } = this.props; // type = date || time || date-mask || time-mask || month-mask
        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {label && <label onClick={() => this.focus()}>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>}{readOnly && this.state.value ? <> {label && ':'} {newLine && <br />}
                    <b>{this.state.readOnlyText}</b></> : readOnly && readOnlyEmptyText && <b>: {readOnlyEmptyText}</b>}
                {(type.endsWith('-mask') || type == 'date-month') ? (
                    <InputMask disabled={disabled} ref={e => this.input = e} className={'form-control ' + (this.state.isValid ? '' : 'is-invalid ')} mask={this.mask[type]} onChange={this.handleChange} onKeyDown={onKeyDown} style={{ display: readOnly ? 'none' : '' }} formatChars={{ '2': '[12]', '0': '[089]', '1': '[01]', '3': '[0-3]', '9': '[0-9]', '5': '[0-5]', 'h': '[0-2]' }} value={this.state.value} readOnly={readOnly} placeholder={placeholder || label} onBlur={onBlur} />
                ) : (
                    <Datetime ref={e => this.input = e} timeFormat={type == 'time' ? 'HH:mm' : false} dateFormat={type == 'dd/mm' ? 'DD/MM' : 'DD/MM/YYYY'}
                        inputProps={{ placeholder: placeholder || label, ref: e => this.inputRef = e, readOnly: readOnly, disabled, style: { display: readOnly ? 'none' : '' } }}
                        value={this.state.value} onChange={e => this.handleChange(e)} closeOnSelect={true} />
                )}
            </div>);
    }
}

export class FormImageBox extends React.Component {
    setData = (data, image) => this.imageBox.setData(data, image);

    render() {
        let { label = '', className = '', style = {}, boxUploadStye = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', image = null, onDelete = null, onSuccess = null, isProfile = null, description = null, height = '' } = this.props;
        return (
            <div className={'form-group ' + className} style={style}>
                <label>{label}&nbsp;</label>
                {!readOnly && image && onDelete ?
                    <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
                <ImageBox ref={e => this.imageBox = e} postUrl={postUrl} uploadType={uploadType} image={image} readOnly={readOnly} success={data => onSuccess && onSuccess(data)} isProfile={isProfile}
                    description={description} style={boxUploadStye} height={height} />
            </div>);
    }
}

export class FormImageMultiBox extends React.Component {
    clear = () => {
        this.imageBox.clear();
    }
    render() {
        let { label = '', className = '', style = {}, boxUploadStye = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', image = null, onDelete = null, onSuccess = null, isProfile = null, description = null, height = '', maxImgNum = null } = this.props;

        return (
            <div className={'form-group ' + className} style={style}>
                <label>{label}&nbsp;</label>
                {!readOnly && image && onDelete ?
                    <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
                <ImageMultiBox ref={e => this.imageBox = e} postUrl={postUrl} uploadType={uploadType} image={image} readOnly={readOnly} success={data => onSuccess && onSuccess(data)} isProfile={isProfile}
                    description={description} style={boxUploadStye} height={height} maxImgNum={maxImgNum} />
            </div>
        );
    }
}

export class FormFileBox extends React.Component {
    setData = (data, reset = true) => this.fileBox.setData(data, reset);

    render() {
        let { label = '', className = '', pending = false, style = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', onDelete = null, onSuccess = null, onDownload = null, description = null, accept = '', background = '' } = this.props;
        return (
            <div className={'form-group ' + className} style={style}>
                {label && <label>{label}&nbsp;</label>}
                {!readOnly && onDelete ? <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
                {!readOnly && onDownload ? <a href='#' className='text-success' style={{ float: 'right' }} onClick={onDownload}><i className='fa fa-fw fa-lg fa-download' /></a> : null}
                <FileBox ref={e => this.fileBox = e} pending={pending} postUrl={postUrl} uploadType={uploadType} readOnly={readOnly} success={data => onSuccess && onSuccess(data)}
                    description={description} accept={accept} background={background} />
            </div>);
    }
}

export class FormCollapsedBox extends React.Component {
    state = { collapsedState: '' };

    render() {
        const { title = '', className = '', style = {}, titleStyle = {}, body = null } = this.props;
        const { collapsedState } = this.state;
        return (
            <div className={'form-group ' + className} style={style}>
                <div className='tile'>
                    <h3 className='tile-title' onClick={() => this.setState({ collapsedState: collapsedState ? '' : 'show' })}
                        style={{ cursor: 'pointer', margin: 5, fontWeight: 'normal', ...titleStyle }}>{title}</h3>
                    <div className={'collapse ' + collapsedState}>
                        <div className='tile-body'>{body}</div>
                    </div>
                </div>
            </div>);
    }
}

export class FormColorPicker extends React.Component {
    static defaultProps = { formType: 'colorPicker' };
    state = { value: '' };

    componentDidMount() {
        const _this = this;
        $(this.input).minicolors({
            control: $(this).attr('data-control') || 'hue',
            defaultValue: $(this).attr('data-defaultValue') || '',
            format: $(this).attr('data-format') || 'hex',
            keywords: $(this).attr('data-keywords') || '',
            inline: $(this).attr('data-inline') === 'true',
            letterCase: $(this).attr('data-letterCase') || 'lowercase',
            opacity: $(this).attr('data-opacity'),
            position: $(this).attr('data-position') || 'bottom left',
            swatches: $(this).attr('data-swatches') ? $(this).attr('data-swatches').split('|') : [],
            change: function (value) {
                if (!value || value.length != 7) value = '';
                _this.setState({ value });
            },
            theme: 'bootstrap'
        });
    }

    value = function (text) {
        if (arguments.length) {
            this.setState({ value: text }, () => {
                $(this.input).minicolors('value', this.state.value);
            });
        } else {
            return this.state.value;
        }
    };

    focus = () => this.input.focus();

    render() {
        let { smallText = '', label = '', placeholder = '', className = '', style = {}, readOnly = false, onChange = null, required = false, readOnlyEmptyText = '' } = this.props,
            readOnlyText = this.state.value;
        const properties = {
            type: 'text',
            className: 'form-control',
            placeholder: placeholder || label,
            value: this.state.value,
            onChange: e => this.setState({ value: e.target.value }, () => (onChange && onChange(e)))
        };

        let displayElement = '';
        if (label) {
            displayElement = <><label onClick={() => this.input.focus()}>{label}{!readOnly && required ?
                <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText || readOnlyEmptyText}</b></> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{readOnlyText || readOnlyEmptyText}</b> : '';
        }

        return (
            <div className={'form-group ' + (className || '')} style={style}>
                {displayElement}
                <input ref={e => this.input = e} style={{ display: readOnly ? 'none' : 'block' }}{...properties} />
                {smallText ? <small>{smallText}</small> : null}
            </div>);
    }
}

export function getValue(input) {
    const data = input.value();
    if (!input.props || !input.props.required) return data;
    const formType = input.props.formType;
    switch (formType) {
        case 'textBox': {
            if ((data && data !== '') || data === 0) return data.toString().trim();
            throw input;
        }

        case 'richTextBox':
        case 'editor':
        case 'colorPicker':
        case 'datePicker': {
            if (data && data !== '') return data;
            throw input;
        }

        case 'selectBox': {
            const multiple = input.props.multiple || false;
            if (!!multiple && data && Array.isArray(data) && data.length) return data;
            if (!multiple && data) return data;
            throw input;
        }

        default:
            return data;
    }
}

// Page components ----------------------------------------------------------------------------------------------------
export class CirclePageButton extends React.Component {
    render() {
        const {
            type = 'back', style = {}, to = '', tooltip = '', customIcon = '', customClassName = 'btn-warning', onClick = () => {
            }
        } = this.props; // type = back | save | create | delete | export | import | custom
        const properties = {
            type: 'button',
            style: { position: 'fixed', right: '10px', bottom: '10px', zIndex: 500, ...style },
            onClick
        };
        let result = null;
        if (type == 'save') {
            result = <button {...properties} className='btn btn-primary btn-circle'><i className='fa fa-lg fa-save' /></button>;
        } else if (type == 'search') {
            result = <button {...properties} className='btn btn-primary btn-circle'><i className='fa fa-lg fa-search' /></button>;
        } else if (type == 'create') {
            result = <button {...properties} className='btn btn-info btn-circle'><i className='fa fa-lg fa-plus' /></button>;
        } else if (type == 'export') {
            result = <button {...properties} className='btn btn-success btn-circle'><i className='fa fa-lg fa-file-excel-o' /></button>;
        } else if (type == 'import') {
            result = <button {...properties} className='btn btn-success btn-circle'><i className='fa fa-lg fa-cloud-upload' /></button>;
        } else if (type == 'refresh') {
            result = <button {...properties} className='btn btn-warning btn-circle'><i className='fa fa-lg fa-refresh' /></button>;
        } else if (type == 'delete') {
            result = <button {...properties} className='btn btn-danger btn-circle'><i className='fa fa-lg fa-trash' /></button>;
        } else if (type == 'custom') {
            result = <button {...properties} className={'btn btn-circle ' + customClassName}><i className={'fa fa-lg ' + customIcon} /></button>;
        } else {
            if (typeof to == 'string') {
                result = (
                    <Link to={to} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px', zIndex: 500, ...style }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>);
            } else {
                result = <button style={{ position: 'fixed', bottom: '10px', zIndex: 500, ...style }} onClick={to} className='btn btn-circle btn-secondary'><i className='fa fa-lg fa-reply' /></button>;
            }
        }
        return tooltip ?
            <Tooltip title={tooltip} arrow placement='top'>{result}</Tooltip> :
            result;
    }
}

export class AdminModal extends React.Component {
    state = { display: '' };
    _data = {};

    componentWillUnmount() {
        this.hide();
    }

    onShown = (modalShown) => {
        $(this.modal).on('shown.bs.modal', () => modalShown());
    };

    onHidden = (modalHidden) => {
        $(this.modal).on('hidden.bs.modal', () => modalHidden());
    };

    show = (item, multiple = null) => {
        if (this.onShow) {
            if (multiple != null) this.onShow(item, multiple);
            else this.onShow(item);
        }
        $(this.modal).modal('show');
    };

    hide = () => {
        this.onHide && this.onHide();
        $(this.modal).modal('hide');
    };

    data = (key, value) => {
        if (value === '' || value) {
            this._data[key] = value;
        } else {
            return this._data[key];
        }
    };

    submit = (e) => {
        try {
            this.onSubmit(e);
        }
        catch (input) {
            console.error(input);
            if (input && input.props) {
                T.notify((input.props.label || 'Dữ liệu') + ' bị trống!', 'danger');
                input.focus();
            }
        }
    };

    disabledClickOutside = () => {
        $(this.modal).modal({ backdrop: 'static', keyboard: false, show: false });
    };

    renderModal = ({ title, body, size, buttons, postButtons, isLoading = false, submitText = 'Lưu', isShowSubmit = true, style = {}, showCloseButton = true, center = false }) => {
        const { readOnly = false } = this.props;
        return (
            <div className='modal fade' role='dialog' ref={e => this.modal = e} style={style}>
                <form className={'modal-dialog' + (center ? ' modal-dialog-centered' : '') + (size == 'large' ? ' modal-lg' : (size == 'elarge' ? ' modal-xl' : ''))} role='document' onSubmit={e => {
                    e.preventDefault() || this.onSubmit && this.submit(e);
                }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{title}</h5>
                            {showCloseButton && <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>}
                        </div>
                        <div className='modal-body'>{body}</div>
                        <div className='modal-footer'>
                            {buttons}
                            <button type='button' className='btn btn-secondary' data-dismiss='modal' style={{ display: showCloseButton ? '' : 'none' }}>
                                <i className='fa fa-fw fa-lg fa-times' />Đóng
                            </button>
                            {postButtons}
                            {!isShowSubmit || readOnly == true || !this.onSubmit ? null :
                                <button type='submit' className='btn btn-primary' disabled={isLoading}>
                                    {isLoading ? <i className='fa fa-spin fa-lg fa-spinner' /> : <i className='fa fa-fw fa-lg fa-save' />} {submitText}
                                </button>}
                        </div>
                    </div>
                </form>
            </div>);
    };

    render = () => null;
}

export class AdminPage extends React.Component {
    state = {};

    componentWillUnmount() {
        T.onSearch = null;
        T.onAdvanceSearchHide = null;

        this.willUnmount();
    }

    willUnmount = () => {
    };

    getCurrentPermissions = () => this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];

    getUserPermission = (prefix, listPermissions = ['read', 'write', 'delete']) => {
        const permission = {}, currentPermissions = this.getCurrentPermissions();
        listPermissions.forEach(item => permission[item] = currentPermissions.includes(`${prefix}:${item}`));
        return permission;
    };

    showAdvanceSearch = () => $(this.advanceSearchBox).addClass('show');

    hideAdvanceSearch = () => {
        $(this.advanceSearchBox).removeClass('show');
        $(this.advanceSearchBox).addClass('hide');
    };

    renderPage = ({ icon, title, subTitle, header, breadcrumb, advanceSearch, advanceSearchTitle = 'Tìm kiếm nâng cao', content, backRoute, onCreate, onSave, onExport, onImport, onRefresh, buttons = null, collapse = null, hideTitleSection = false }) => {
        T.title(title);
        const typeMapper = {
            'info': {
                color: 'white', backgroundColor: 'info.main', '&:hover': {
                    color: 'info.main',
                    backgroundColor: 'white'
                }
            },
            'primary': {
                color: 'white', backgroundColor: 'primary.main', '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'white'
                }
            },
            'success': {
                color: 'white', backgroundColor: 'success.main', '&:hover': {
                    color: 'success.main',
                    backgroundColor: 'white'
                }
            },
            'warning': {
                color: 'white', backgroundColor: 'warning.main', '&:hover': {
                    color: 'warning.main',
                    backgroundColor: 'white'
                }
            },
            'danger': {
                color: 'white', backgroundColor: 'error.main', '&:hover': {
                    color: 'error.main',
                    backgroundColor: 'white'
                }
            },
            'secondary': {
                color: 'white', backgroundColor: 'secondary.main', '&:hover': {
                    color: 'secondary.main',
                    backgroundColor: 'white'
                }
            }, 'purple': {
                color: 'white', backgroundColor: '#b8328d', '&:hover': {
                    color: '#b8328d',
                    backgroundColor: 'white'
                }
            }, 'excel': {
                color: 'white', backgroundColor: '#107a40', '&:hover': {
                    color: '#107a40',
                    backgroundColor: 'white'
                }
            }
        };

        let right = 10, createButton, saveButton, exportButton, importButton, refreshButton, customButtons, collapseButtons;
        if (onCreate) {
            createButton = <CirclePageButton type='create' onClick={onCreate} style={{ right }} tooltip='Tạo mới' />;
            right += 60;
        }
        if (onSave) {
            saveButton = <CirclePageButton type='save' onClick={onSave} style={{ right }} tooltip='Lưu' />;
            right += 60;
        }
        if (onExport) {
            exportButton = <CirclePageButton type='export' onClick={onExport} style={{ right }} tooltip='Export' />;
            right += 60;
        }
        if (onImport) {
            importButton = <CirclePageButton type='import' onClick={onImport} style={{ right }} tooltip='Import' />;
            right += 60;
        }
        if (onRefresh) {
            refreshButton = <CirclePageButton type='refresh' onClick={onRefresh} style={{ right }} />;
            right += 60;
        }
        if (buttons) {
            if (Array.isArray(buttons)) {
                if (buttons.length)
                    customButtons = buttons.map((item, index) => {
                        if (item) {
                            right += 60;
                            return <CirclePageButton key={index} type='custom' customClassName={item.className} customIcon={item.icon} onClick={item.onClick} style={{ right: right - 60 }}
                                tooltip={item.tooltip} />;
                        }
                    });
            } else {
                customButtons = <CirclePageButton type='custom' customClassName={buttons.className} customIcon={buttons.icon} onClick={buttons.onClick} style={{ right: right }} tooltip={buttons.tooltip} />;
                right += 60;
            }
        }
        if (!onCreate && !onSave && !onExport && !onImport && !buttons && collapse && collapse.length && collapse.some(action => action.permission)) {
            collapseButtons =
                <SpeedDial
                    className='collapsant'
                    ariaLabel='Công cụ'
                    direction='left'
                    // onOpen={() => this.setState({ open: true })}
                    // onClose={() => this.setState({ open: false })}
                    onClick={() => this.setState({ open: !this.state.open })}
                    open={!!this.state.open}
                    icon={<i className='fa fa-lg fa-cog' />}
                >
                    {collapse.map(action => (
                        action.permission && <SpeedDialAction
                            sx={Object.assign({}, typeMapper[action.type], action.style || {})}
                            key={action.name}
                            icon={<i className={'fa fa-lg ' + action.icon} />}
                            tooltipTitle={action.name}
                            onClick={action.onClick}
                            componentsProps={{
                                tooltip: {
                                    sx: Object.assign({}, typeMapper[action.type], { fontSize: '0.9rem' })
                                }
                            }}
                        />
                    ))}
                </SpeedDial>;
        }

        return (
            <main className='app-content'>
                <div className='app-title' style={{ display: hideTitleSection == true ? 'none' : '' }}>
                    <div>
                        <h1><i className={icon} /> {title}</h1>
                        <div>{subTitle}</div>
                    </div>
                    <ul className='app-breadcrumb breadcrumb' style={{ alignItems: 'center' }}>
                        <div style={{ display: 'flex', marginRight: '15px' }}>{header}</div>
                        {breadcrumb != null ? <Link to='/user'><i className='fa fa-home fa-lg' /></Link> : ''}
                        {breadcrumb != null ? breadcrumb.map((item, index) => <span key={index}>&nbsp;/&nbsp;{item}</span>) : ''}
                    </ul>
                </div>
                <div className='app-advance-search' ref={e => this.advanceSearchBox = e}>
                    <h5>{advanceSearchTitle}</h5>
                    <div style={{ width: '100%' }}>{advanceSearch}</div>
                </div>
                {content}
                {backRoute ? <CirclePageButton type='back' to={backRoute} /> : null}
                {refreshButton} {importButton} {exportButton} {saveButton} {createButton} {customButtons} {collapseButtons}
            </main>);
    };

    render() {
        return null;
    }
}

export class TooltipButton extends Component {
    render() {
        const { tooltip = '', onClick = () => { }, icon, color = 'primary' } = this.props;
        return <Tooltip title={tooltip} arrow placeholder='bottom'>
            <button className={`btn btn-${color}`} type='button' onClick={e => onClick(e)}><i className={`fa fa-lg ${icon}`} /></button>
        </Tooltip>;
    }
}
