import React from 'react';
import { FormDatePicker, FormRichTextBox, FormTextBox, getValue, renderDataTable, TableCell } from 'view/component/AdminPage';
import { createGiaHan, getDrlKienNghi, updateGiaHan, deleteKienNghi } from './redux';
import { connect } from 'react-redux';
// import FileBox from 'view/component/FileBox';
// import { Img } from 'view/component/HomePage';
// import { SelectApdater_SvBoTieuChi } from 'modules/mdCongTacSinhVien/svBoTieuChi/redux';


const STATUS_ICON_MAPPER = {
    A: <i className='text-success fa fa-check pr-1' />,
    R: <i className='text-danger fa fa-ban pr-1' />,
    P: <i className='text-info fa fa-clock-o pr-1' />,
    null: <i className='text-secondary fa fa-plus-circle pr-1' />,
};

const STATUS_MAPPER = {
    A: <span className='text-success'><i className='fa fa-check pr-1' />Chấp nhận</span>,
    R: <span className='text-danger'><i className='fa fa-ban pr-1' />Từ chối</span>,
    P: <span className='text-info'><i className='fa fa-clock-o pr-1' />Đợi duyệt</span>,
    null: <span className='text-secondary'><i className='fa fa-plus-circle pr-1' />Chưa xử lý</span>,
};

class KienNghiComponent extends React.Component {
    state = { isNew: false, selected: null, dataKienNghi: {} }
    componentDidMount() {
        this.getData();
    }

    componentDidUpdate(prevProps) {
        const { namHoc, hocKy } = this.props;
        if (namHoc != prevProps.namHoc || hocKy != prevProps.hocKy) {
            this.getData();
        }
    }

    getData = () => {
        const { namHoc, hocKy } = this.props;
        this.props.getDrlKienNghi(namHoc, hocKy, (data) => {
            const items = data.items;
            this.setState({ id: null, listKienNghi: items, selected: items.length ? 0 : null, isNew: false });
            items.length && this.setData(items[0]);
        });
    }

    setData = (data) => {
        this.setState({ dataKienNghi: data }, () => {
            this.lyDoKienNghi.value(data.lyDoKienNghi || '');
            this.lyDoTuChoi?.value(data.lyDoTuChoi || '');
            this.timeSubmit?.value(data.timeSubmit || '');
            this.status?.value(STATUS_MAPPER[data.status] || '');
            this.timeEnd?.value(data.timeEnd);
        });
    }

    initForm = () => {
        this.lyDoKienNghi.value('');
        this.lyDoTuChoi.value('');
        this.lyDoKienNghi.focus();
    }

    submit = () => {
        try {
            const data = {
                lyDoKienNghi: getValue(this.lyDoKienNghi)
            };
            T.confirm('Xác nhận gửi đơn kiến nghị?', '', isConfirm => {
                if (isConfirm) {
                    this.props.createGiaHan(data, () => this.getData());
                }
            });
        } catch (error) {
            error.props && T.notify('Vui lòng trình bày lý do kiến nghị!', 'danger');
        }
    }

    componentForm = () => {
        return this.props.canGiaHan ? <>
            <div className='row'>
                <FormRichTextBox ref={e => this.lyDoKienNghi = e} className='col-auto flex-grow-1' required
                    label={'Vui lòng trình bày lý do bạn không thể đánh giá điểm rèn luyện đúng thời hạn'}
                    placeholder='Lý do kiến nghị'
                />
            </div>
            <div className='d-flex justify-content-between'>
                <button className='btn btn-success' onClick={e => e.preventDefault() || this.submit()}><i className='fa fa-paper-plane' />Gửi đến khoa</button>
            </div>
        </> : <p>Bạn không thể gia hạn vào lúc này!</p>;
    }

    componentInfo = () => {
        const { id, status, timeEnd } = this.state.dataKienNghi || {};
        return <div className='position-relative'>
            {this.state.selected == null ? this.componentForm() : <>
                <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 1000 }}>
                    {!status && <button className='btn btn-danger'
                        onClick={e => {
                            e.preventDefault();
                            T.confirm('Xác nhận thu hồi kiến nghị?', '', isConfirm => {
                                isConfirm && this.props.deleteKienNghi(id, () => this.getData());
                            });
                        }}
                    ><i className='fa fa-times' />Thu hồi</button>}
                    {this.props.canGiaHan && <button className='btn btn-warning'
                        onClick={e => {
                            e.preventDefault();
                            this.setState({ isNew: true, selected: null });
                            this.setData({});
                        }}
                    ><i className='fa fa-plus' />Tạo mới</button>}
                </div>
                <div className='row'>
                    <FormRichTextBox ref={e => this.lyDoKienNghi = e} className='col-10 ' required
                        label={'Lý do kiến nghị'}
                        placeholder='Lý do kiến nghị'
                        readOnly={!this.state.isNew}
                    />
                    {status == 'R' && <>
                        <FormRichTextBox className='col-md-6' label='Lý do từ chối' ref={e => this.lyDoTuChoi = e} readOnly />
                    </>}
                    {status == 'A' && timeEnd && <>
                        <FormDatePicker className='col-md-6' label='Thời gian gia hạn' ref={e => this.timeEnd = e} readOnly />
                    </>}
                </div>
                <div className='d-flex justify-content-between'>
                    <FormTextBox ref={e => this.status = e} label='Tình trạng' readOnly />
                    <FormDatePicker ref={e => this.timeSubmit = e} className='text-success' label='Gửi vào lúc' type='time-mask' readOnly />
                </div>
            </>}
        </div>;
    }

    componentLichSu = () => {
        const list = this.state.listKienNghi || [];
        return renderDataTable({
            data: list,
            emptyTable: '',
            divStyle: { height: 'calc(100vh/2)' },
            stickyHead: true,
            multipleTbody: true,
            renderHead: () => (<tr>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }} colSpan={2}>Lịch sử kiến nghị</th>
            </tr>),
            renderRow: (item, index) => (<tr key={index} style={{ backgroundColor: this.state.selected == index ? '#DCDCDC' : '', cursor: 'pointer' }}
                onClick={e => e.preventDefault() || this.setState({ selected: index, isNew: false }, () => this.setData(this.state.listKienNghi[index]))} >
                <TableCell style={{ whiteSpace: 'nowrap' }} content={STATUS_ICON_MAPPER[item.status]} />
                <TableCell style={{ whiteSpace: 'nowrap', width: '100%' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.timeSubmit} />
            </tr>)
        });
    }

    render() {
        return <>
            <div>
                <div className='row align-items-start pt-3'>
                    <div className='col-md-2'>
                        {this.componentLichSu()}
                    </div>
                    <div className='col-10'>
                        {this.componentInfo()}
                    </div>
                </div>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDrlKienNghi,
    deleteKienNghi,
    createGiaHan,
    updateGiaHan,
};

export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(KienNghiComponent);