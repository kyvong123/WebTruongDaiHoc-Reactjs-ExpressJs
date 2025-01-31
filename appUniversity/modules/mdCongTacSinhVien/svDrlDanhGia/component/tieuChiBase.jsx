import React from 'react';
import { TableCell, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { Tooltip, Popper } from '@mui/material';

const TcTitle = 0, TcSelect = 1, TcRange = 2, TcScalar = 3, TcLinkSuKien = 4;

export default class TieuChiCell extends React.Component {
    state = { isEdit: false, lyDo: '' };


    // renderMapper = {
    //     [TcTitle]: <TieuChiTitle ref={e => this.cell = e} {...this.props} />,
    //     [TcSelect]: <TieuChiSelect ref={e => this.cell = e} {...this.props} />,
    //     [TcRange]: <TieuChiRange ref={e => this.cell = e}  {...this.props} />,
    //     [TcScalar]: <TieuChiScalar ref={e => this.cell = e}  {...this.props} />,
    //     [TcLinkSuKien]: <TieuChiSuKien ref={e => this.cell = e}  {...this.props} />,
    // }
    renderMapper = (loaiTc, props) => {
        let mapper = {
            [TcTitle]: <TieuChiTitle ref={e => this.cell = e} {...props} />,
            [TcSelect]: <TieuChiSelect ref={e => this.cell = e} {...props} />,
            [TcRange]: <TieuChiRange ref={e => this.cell = e}  {...props} />,
            [TcScalar]: <TieuChiScalar ref={e => this.cell = e}  {...props} />,
            [TcLinkSuKien]: <TieuChiSuKien ref={e => this.cell = e}  {...props} />,
        };
        return mapper[loaiTc];
    }

    value = function (value) {
        if (arguments.length) {
            this.cell.value(value);
        } else {
            return this.cell.value();
        }
    }

    valueLyDo = function (value) {
        if (arguments.length) {
            this.setState({ lyDo: value });
        } else {
            return this.state.lyDo;
        }
    }

    setLyDoForm = (e, isEdit) => {
        if (isEdit) {
            this.setState({ isEdit, lyDoEditElement: e.currentTarget }, () => this.lyDoDanhGiaForm.value(this.state.lyDo ?? ''));
        } else {
            this.setState({ isEdit, lyDoEditElement: null, lyDo: this.lyDoDanhGiaForm.value() ?? '' });
        }
    }

    renderLyDo = () => {
        const { readOnly = true, showLyDo = true } = this.props;
        const lyDo = this.state.lyDo || this.props.lyDo;
        if (readOnly) {
            if (lyDo)
                return <Tooltip title={lyDo}><i className='text-primary fa fa-lg fa-question-circle' style={{ position: 'absolute', top: '0.3rem', right: '0.05rem' }} /></Tooltip>;
        } else if (showLyDo && this.state.lyDo) {
            if (this.state.isEdit) {
                return <Tooltip title={'Lưu'}><button className='btn btn-sm btn-success mb-1 ml-1' onClick={(e) => this.setLyDoForm(e, false)}><i className='fa fa-check mr-0' ></i></button></Tooltip>;
            } else {
                return <Tooltip title={<>
                    <b>Lý do: </b><br />
                    {this.state.lyDo ?? 'Chưa xác định'}
                </>} placement='left'><button className='btn btn-sm btn-primary mb-1 ml-1' onClick={(e) => this.setLyDoForm(e, true)}><i className='fa fa-commenting' ></i></button></Tooltip>;
            }
        }
    }

    render() {
        const { loaiTc } = this.props;
        return <>
            <TableCell style={{ textAlign: 'center' }} content={<div className='position-relative'>
                {loaiTc == TcTitle && <TieuChiTitle ref={e => this.cell = e} {...this.props} />}
                {loaiTc == TcSelect && <TieuChiSelect ref={e => this.cell = e} {...this.props} />}
                {loaiTc == TcRange && <TieuChiRange ref={e => this.cell = e}  {...this.props} />}
                {loaiTc == TcScalar && <TieuChiScalar ref={e => this.cell = e}  {...this.props} />}
                {loaiTc == TcLinkSuKien && <TieuChiSuKien ref={e => this.cell = e}  {...this.props} />}
                {/* {(lyDo != null || this.state.lyDo != null) && <>
                </>} */}
                {this.renderLyDo()}
                <Popper open={this.state.isEdit} anchorEl={this.state.lyDoEditElement} placement='left' keepMounted disablePortal>
                    <div className='tile bg-light m-1 d-flex align-items-end'>
                        <FormTextBox ref={e => this.lyDoDanhGiaForm = e} placeholder='Vui lòng điền lý do' className='text-sm mr-2 mb-0' inputStyle={{ whiteSpace: 'nowrap', minWidth: '150px', height: 'auto' }} />
                        <Tooltip title='Hủy'><button className='btn btn-sm btn-danger mb-1 ml-1' type='button' onClick={() => this.setState({ isEdit: false })}><i className='fa fa-times mr-0' ></i></button></Tooltip>
                    </div>
                </Popper>
            </div>} />
        </>;

    }
}

class TieuChiBase extends React.Component {
    state = { value: 0 };
    value = function (value) {
        if (arguments.length) {
            this.setState({ value });
            this.cell.value(value);
        } else {
            return this.cell.value();
        }
    }

    renderLyDo = () => {
        const item = this.props.item ?? {};
        <Tooltip title={item.lyDo}><i className='text-primary fa fa-lg fa-question-circle ml-1' style={{ position: 'absolute', top: '0.3rem' }} /></Tooltip>;
    }

    render() { return null; }

}

class TieuChiRange extends TieuChiBase {
    checkRange = (val) => {
        const { item } = this.props,
            range = JSON.parse(item.diemMax);
        setTimeout(() => {
            if (val) {
                const [minVal, maxVal] = range;
                if (val < parseInt(minVal)) {
                    this.value(minVal);
                    val = minVal;
                } if (val > parseInt(maxVal)) {
                    this.value(maxVal);
                    val = maxVal;
                }
            } else {
                val = 0;
            }
            this.props.onChange && this.props.onChange(val);
        }, 500);
    }

    render() {
        // const item = this.props.item;
        const { readOnly = true } = this.props;
        return <>
            <span style={{ display: readOnly ? '' : 'none' }}>{this.state.value}</span>
            <FormTextBox className='mb-0' type='number' inputClassName='text-center' style={{ display: readOnly ? 'none' : '' }}
                onChange={(value) => this.checkRange(value)}
                ref={e => this.cell = e} readOnly={readOnly} />
        </>;
    }
}

class TieuChiSelect extends TieuChiBase {

    render() {
        const { readOnly = true, item } = this.props;
        return <>
            <span style={{ display: readOnly ? '' : 'none' }}>{this.state.value}</span>
            <FormSelect className='mb-0' minimumResultsForSearch={-1} style={{ display: readOnly ? 'none' : '' }}
                onChange={(e) => this.props.onChange(e)}
                ref={e => this.cell = e} data={[0, ...JSON.parse(item.diemMax, '[]').map(item => item.diem)]} readOnly={readOnly} />
        </>;
    }
}

class TieuChiTitle extends TieuChiBase {


    render() {
        return <FormTextBox className='mb-0' type='number' ref={e => this.cell = e} readOnly={true} inputStyle={{ fontWeight: '100' }} />;
    }
}

class TieuChiScalar extends TieuChiBase {

    checkValue = (value) => {
        if (this.props.item.diemMax && value > this.props.item.diemMax) {
            value = this.props.item?.diemMax;
            this.cell.value = (this.props.item?.diemMax);
        }
        this.props.onChange && this.props.onChange(value);
    }

    render() {
        const { readOnly = true } = this.props;
        return <>
            <span style={{ display: readOnly ? '' : 'none' }}>{this.state.value}</span>
            <FormTextBox className='mb-0' type='number' style={{ display: readOnly ? 'none' : '' }} inputClassName='text-center' onChange={(e) => this.props.onChange && this.props.onChange(e)} ref={e => this.cell = e} readOnly={readOnly} />
        </>;
    }
}

class TieuChiSuKien extends TieuChiBase {
    render() {
        const { readOnly = true } = this.props;
        return <>
            <span style={{ display: readOnly ? '' : 'none' }}>{this.state.value || this.props.value}</span>
            <FormTextBox className='mb-0' type='number' style={{ display: readOnly ? 'none' : '' }} inputClassName='text-center' value={this.state.value || this.props.value} onChange={(e) => this.props.onChange && this.props.onChange(e)} ref={e => this.cell = e} readOnly={readOnly} />
        </>;
    }
}
