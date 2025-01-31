import React from 'react';
import { connect } from 'react-redux';
import { FormTextBox } from 'view/component/AdminPage';
import { createNote, deleteNote, updateNote } from '../redux/lichCongTac';
import BaseCongTac from './BaseCongTac';

class LuuY extends BaseCongTac {
    state = { editing: null, updatingOrdinal: false, items: [], }


    onSave = (e, item) => {
        e.preventDefault();
        const value = this.editRef.value();
        if (!value) {
            return T.notify('Nội dung lưu ý trống', 'danger');
        }
        if (!this.state.editing) {
            this.props.createNote(this.props.id, value, () => this.setState({ editing: null }));
        } else {
            this.props.updateNote(item.id, value, () => this.setState({ editing: null }));
        }
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa lưu ý', `Xóa lưu ý "${item.noiDung}"?`, true,
            isConfirm => isConfirm && this.props.deleteNote(item.id, item.lichId));
    }


    renderSort = () => {
        const isEditable = this.getLichPermission().isEditable();
        const items = Array.from(this.getLichItem()?.luuY || []);
        if (isEditable && !this.state.editing) items.push({ noiDung: '', id: null });
        return <>
            <div className="col-md-12 list-group text-dark p-3 sort-can-bo" ref={e => this.sortContainer = e}>
                {items.map((item, index) => <div key={index} id={item.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    {this.state.editing == item.id ? <FormTextBox className='w-100 m-0 p-0 mr-2' placeholder='Nhập lưu ý' ref={e => this.editRef = e} /> : <span>- {item.noiDung}</span>}
                    {isEditable && <div className='d-flex justify-content-center align-items-center' style={{ gap: 0 }}>
                        {item.id && this.state.editing != item.id && <>
                            <button className='btn bg-transparent' onClick={() => this.setState({ editing: item.id }, () => this.editRef.value(item.noiDung))} ><i className='fa fa-lg fa-pencil text-primary hover-zoom' data-toggle='tooltip' title='Chỉnh sửa' /></button>
                            <button className='btn bg-transparent' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash text-danger hover-zoom' data-toggle='tooltip' title='Xóa' /></button>
                        </>}
                        {!item.id && <button className='btn bg-transparent' onClick={this.onSave}><i className='fa fa-lg fa-check text-success hover-zoom' data-toggle='tooltip' title='Lưu' /></button>}
                        {item.id && this.state.editing == item.id && <button className='btn bg-transparent' onClick={(e) => this.onSave(e, item)}><i className='fa fa-lg fa-save text-primary hover-zoom' data-toggle='tooltip' title='Lưu' /></button>}
                        {item.id && this.state.editing == item.id && <button className='btn bg-transparent' onClick={() => this.setState({ editing: null })}><i className='fa fa-lg fa-times text-danger hover-zoom' data-toggle='tooltip' title='Hủy thay đổi' /></button>}
                    </div>}
                </div>)}
            </div >
        </>;
    }

    render() {
        return <div className='row' >
            {this.renderSort()}
        </div>;
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { createNote, updateNote, deleteNote };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(LuuY);
