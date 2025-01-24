import React from 'react';
import { connect } from 'react-redux';
import { getFiles, deleteFile } from '../redux/congTac';
import BaseCongTac from './BaseCongTac';
import FileBox from 'view/component/FileBox';

export class FileListComponent extends BaseCongTac {
    state = { editing: null, updatingOrdinal: false, items: [], }

    componentDidMount() {
        this.fileBox?.setData(T.stringify({ congTacId: this.props.id }));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.id != this.props.id)
            this.fileBox?.setData(T.stringify({ congTacId: this.props.id }));
    }

    onSave = (res) => {
        if (!res) {
            console.log(res);
        }
        else if (res.error) {
            T.alert(res.error.message || res.error, 'danger');
        } else {
            this.props.getFiles(this.props.id);
        }
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xác nhận', `Xóa tệp '${item.ten}'?`, true,
            isConfirm => isConfirm && this.props.deleteFile(item.id, item.ma));
    }


    renderSort = () => {
        const isEditable = !this.props.readOnly && this.getCongTacItemPermissionChecker().isEditable();
        const items = Array.from(this.getItem()?.files || []);
        items.sort((a, b) => a.ngayTao - b.ngayTao);
        return <div className='tile-body row w-100 pl-5'>
            <h3 className='col-md-12 tile-title mb-3'><i className='fa fa-file-o' /> Tệp tin đính kèm</h3>
            <FileBox className={'col-md-12 ' + (isEditable ? '' : 'd-none')} label='Tệp tin đính kèm' postUrl='/user/upload' uploadType='hcthCongTacFiles' uploadData='hcthCongTacFiles' success={this.onSave} ref={e => this.fileBox = e} />
            <div className='col-md-12 list-group text-dark p-3 sort-can-bo' ref={e => this.sortContainer = e}>
                {items.map((item, index) => <div key={index} id={item.id} className='list-group-item list-group-item-action d-flex justify-content-between align-items-center'>
                    <span><a href={'/api/hcth/cong-tac/files/download/' + item.id} download={item.ten}>{index + 1}. {item.ten}</a></span>
                    {isEditable && <div className='d-flex justify-content-center align-items-center' style={{ gap: 0 }}>
                        <button className='btn bg-transparent' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash text-danger hover-zoom' data-toggle='tooltip' title='Xóa' /></button>
                    </div>}
                </div>)}
            </div >
        </div>;
    }

    render() {
        return <div className='row' >
            {this.renderSort()}
        </div>;
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { deleteFile, getFiles };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(FileListComponent);
