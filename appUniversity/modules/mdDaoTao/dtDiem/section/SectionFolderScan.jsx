import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormCheckbox, FormTextBox, getValue } from 'view/component/AdminPage';
import { FolderSection } from '../adminPage';
import { getAllDtDiemFolderScan, createDtDiemFolderScan } from '../redux';

class CreateFolderScan extends AdminModal {
    state = { isPrivate: 0 }
    handleTypePass = (e) => {
        let value = e.target.value;
        if (value && value.length > 8) this.pass.value(value.substring(0, 8));
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            folderName: getValue(this.folderName),
            isPrivate: this.state.isPrivate ? 1 : 0,
            pass: getValue(this.pass)
        };
        this.props.createDtDiemFolderScan(this.props.idSemester, data, this.hide);
    }

    render = () => {
        let isLock = false; // More
        return this.renderModal({
            title: 'Tạo gói scan mới',
            style: { marginTop: '30vh' },
            body: <div className='row'>
                <FormTextBox ref={e => this.folderName = e
                } className='col-md-12' label='Tên gói' required />
                <FormCheckbox ref={e => this.isPrivate = e} className='col-md-12' isSwitch label='Bảo mật gói scan' onChange={isPrivate => this.setState({ isPrivate }, () => {
                    if (!isPrivate) {
                        this.pass.value('');
                    }
                })} style={{ display: isLock ? '' : 'none' }} />
                <FormTextBox type='password' ref={e => this.pass = e} label='Mật khẩu' smallText='Độ dài 8 ký tự.' className='col-md-12' required={this.state.isPrivate} style={{ display: (isLock && this.state.isPrivate) ? '' : 'none' }} onChange={e => this.handleTypePass(e)} />
            </div >
        });
    }
}
class SectionFolderScan extends AdminPage {
    componentDidMount() {
    }

    setData = ({ idSemester, namHoc, hocKy }) => {
        this.setState({ namHoc, hocKy, idSemester }, () => {
            this.props.getAllDtDiemFolderScan(idSemester);
        });
    }
    render() {
        let folderScanList = this.props.dtDiem?.folderScanList || {},
            { idSemester, namHoc, hocKy } = this.state;
        let isReady = idSemester && folderScanList,
            data = folderScanList[idSemester] || [];
        return <div className='row mr-0 ml-0'>
            <div className='col-md-12' style={{ textAlign: 'right', marginBottom: '10px' }}>
                <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.createFolder.show()}>
                    <i className='fa fa-lg fa-plus' /> Tạo gói scan mới
                </button>
            </div>
            {(isReady && data.length) ? data.map((item, index) => {
                return <React.Fragment key={index}>
                    <FolderSection title={item.folderName} type='primary' onClick={() => this.props.history.push({ pathname: '/user/dao-tao/grade-manage/import/scan', state: { idSemester, idFolder: item.id, namHoc, hocKy } })} description={<><div className='text-primary'>{item.modifier.replace(/@.*$/, '')}</div><div>{T.dateToText(item.lastModified, 'HH:MM:ss dd/mm/yy')}</div></>} />
                </React.Fragment>;
            }) : <>Chưa có gói scan nào</>}
            <hr className='col-md-12' />
            <CreateFolderScan ref={e => this.createFolder = e} createDtDiemFolderScan={this.props.createDtDiemFolderScan} idSemester={idSemester} />
        </div>;
    }

}
const mapStateToProps = state => ({ system: state.system, dtDiem: state.daoTao.dtDiem });
const mapActionsToProps = { getAllDtDiemFolderScan, createDtDiemFolderScan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionFolderScan);