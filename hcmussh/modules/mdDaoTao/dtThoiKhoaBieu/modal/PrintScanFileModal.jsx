import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, renderDataTable, FormCheckbox, TableCell, TableHead, getValue } from 'view/component/AdminPage';
import { checkStatusDtDiemScanFile, exportScanFileDtThoiKhoaBieu } from 'modules/mdDaoTao/dtDiem/redux';

class PrintScanFileModal extends AdminModal {
    componentDidMount() {
        this.onHidden(() => {
            this.listStudentMode = {};
            this.checkCol = {};
        });
        T.socket.on('export-scan-done', ({ mergedPath, userPrint, tabId }) => {
            if (userPrint == this.props.system.user.email && this.props.tabId == tabId) {
                this.props.hideProcessModal();
                let printTime = Date.now();
                printTime = new Date(printTime).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
                T.download(`/api/dt/diem/download-export?outputPath=${mergedPath}`, `${printTime}`);
                this.props.getDtDiemPage();
            }
        });

        T.socket.on('export-scan-error', ({ userPrint, error }) => {
            if (userPrint == this.props.system.user.email) {
                this.props.hideProcessModal();
                T.notify(error ? 'Xuất file bị lỗi hệ thống' : 'Xử lý bị gián đoạn. Vui lòng liên hệ với người phát triển', error ? 'danger' : 'warning');
            }
        });
    }
    componentWillUnmount() {
        T.socket.off('export-scan-file-done');
        T.socket.off('export-scan-done');
        T.socket.off('export-scan-error');
    }
    fullData = [
        { id: 0, text: 'Lớp không có sinh viên' },
        { id: 1, text: 'Xuất tất cả sinh viên' },
        { id: 2, text: 'Chỉ xuất sinh viên đã thanh toán HP' }
    ]
    listStudentMode = {}
    checkCol = {}

    onShow = ({ namHocHocPhi, hocKyHocPhi, kyThi }) => {
        this.setState({ total: 0, current: 0, listChosen: [], checkData: [] }, () => {
            let data = this.props.listChosen;
            this.setState({
                namHocHocPhi, hocKyHocPhi, kyThi, cheDoIn: 'pdf',
                listChosen: data.map(item => ({ ...item, checked: !!item.siSo })),
            }, () => {
                this.kyThi.value(kyThi);
                this.studentListMode.value(1);
                for (let i = 0; i < this.state.listChosen.length; i++) {
                    this.listStudentMode[this.state.listChosen[i].maHocPhan].value(Number(!!this.state.listChosen[i].siSo));
                    this.checkCol[i].value(1);
                }
            });
        });
    }


    onSubmit = () => {
        let listStudentMode = Object.keys(this.listStudentMode).filter(i => !!this.listStudentMode[i]).map(item => ({ maHocPhan: item, mode: getValue(this.listStudentMode[item]) })),
            { namHocHocPhi, hocKyHocPhi, listChosen } = this.state;
        let data = {
            listMaHocPhan: listChosen.filter(item => item.checked).map(item => item.maHocPhan),
            namHocHocPhi, hocKyHocPhi,
            kyThi: getValue(this.kyThi), cheDoIn: this.state.cheDoIn,
            printMode: 'EA', isThi: this.props.isThi,
            studentListMode: getValue(this.studentListMode),
            listStudentMode: Object.assign({}, ...listStudentMode.map((x) => ({ [x.maHocPhan]: x.mode }))),
            tabId: this.props.tabId,
        };
        if (data.listMaHocPhan.length) {
            if (this.state.cheDoIn == 'excel') {
                T.handleDownload(`/api/dt/diem/export-scan-excel?data=${T.stringify(data)}`);
                this.hide();
                this.props.getDtDiemPage();
            } else {
                this.props.exportScanFileDtThoiKhoaBieu(data, () => {
                    this.hide();
                    this.props.showProcessModal();
                    this.props.getDtDiemPage();
                });
            }
        }
    }

    sectionList = (data = null) => {
        return <div className='col-md-12'>
            {renderDataTable({
                data,
                divStyle: { height: '50vh' },
                stickyHead: data && data.length > 10,
                renderHead: () => {
                    const rows = [];
                    rows.push(<tr>
                        <TableHead rowSpan={2} content={'#'
                            // <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.setState({ listChosen: this.props.listChosen.map(item => !item.siSo ? item : ({ ...item, checked: value })) })} />
                        } style={{ verticalAlign: 'middle' }} />
                        <TableHead rowSpan={2} content='Lớp học phần' style={{ width: '10%', verticalAlign: 'middle' }} />
                        <TableHead rowSpan={2} content='Tên học phần' style={{ width: '45%', verticalAlign: 'middle' }} />
                        <TableHead rowSpan={2} content='Sĩ số' style={{ width: '5%', verticalAlign: 'middle' }} />
                        <TableHead colSpan={3} content='Số lần in' style={{ width: 'auto', textAlign: 'center' }} />
                        <TableHead rowSpan={2} content='Bộ lọc sinh viên' style={{ width: '25%', textAlign: 'center', verticalAlign: 'middle' }} />
                    </tr>);
                    rows.push(<tr>
                        <TableHead content='GK' style={{ width: '5%' }} />
                        <TableHead content='CK' style={{ width: '5%' }} />
                        <TableHead content='DS' style={{ width: '5%' }} />
                    </tr>);
                    return rows;
                },
                renderRow: (item, index) => {
                    return <tr key={`${item.maHocPhan}}_${index}`}>
                        <TableCell content={
                            <FormCheckbox ref={e => this.checkCol[index] = e} readOnly={!item.siSo} onChange={value =>
                                this.setState({
                                    listChosen: this.state.listChosen.map(ele => ele.maHocPhan == item.maHocPhan ? ({ ...ele, checked: value }) : ele)
                                })} />
                        } />
                        <TableCell content={item.maHocPhan} />
                        <TableCell content={JSON.parse(item.tenMonHoc)?.vi} />
                        <TableCell content={item.siSo || 0} />
                        <TableCell content={item.soLanInGk || 0} />
                        <TableCell content={item.soLanInCk || 0} />
                        <TableCell content={item.soLanInDs || 0} />
                        <TableCell content={
                            <FormSelect ref={e => this.listStudentMode[item.maHocPhan] = e} data={!item.siSo ? this.fullData : [this.fullData[1], this.fullData[2]]} style={{ marginBottom: '0' }} disabled={!item.siSo} />
                        } />
                    </tr>;
                }
            })}
        </div>;
    }

    render = () => {
        let listCoSiSo = (this.state?.listChosen || []).filter(item => !!item.siSo);
        return this.renderModal({
            title: 'Xuất danh sách lớp',
            size: 'elarge',
            isShowSubmit: listCoSiSo.filter(item => item.checked).length,
            submitText: `In ${listCoSiSo.filter(item => item.checked).length} lớp`,
            body: <div className='row' >
                <FormSelect className='col-md-4' ref={e => this.kyThi = e} data={[
                    { id: 'GK', text: 'Bảng điểm Giữa kỳ' },
                    { id: 'CK', text: 'Bảng điểm Cuối kì' },
                    { id: 'DS', text: 'Danh sách điểm danh' }
                ]} label='Loại' required onChange={value => this.setState({ kyThi: value.id }, () => value.id == 'DS' && this.cheDoIn?.value(this.state.cheDoIn))} />
                {this.state.kyThi == 'DS' && <FormSelect className='col-md-4' ref={e => this.cheDoIn = e} data={[
                    { id: 'pdf', text: 'In file pdf' },
                    { id: 'excel', text: 'In file excel' }
                ]} label='Chế độ In' required onChange={value => this.setState({ cheDoIn: value.id })} />}
                <FormSelect className={`col-md-${this.state.kyThi == 'DS' ? '4' : '8'}`} ref={e => this.studentListMode = e} data={[
                    { id: 1, text: 'In tất cả sinh viên' },
                    { id: 2, text: 'In danh sách sinh viên bổ sung' }
                ]} label='Bộ lọc sinh viên' onChange={({ id }) => {
                    for (let i = 0; i < this.state.listChosen.length; i++) {
                        let ele = this.state.listChosen[i];
                        if (!!ele.siSo && ele.checked) this.listStudentMode[ele.maHocPhan].value(id);
                    }
                }} required />
                {this.sectionList(this.state.listChosen)}
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    checkStatusDtDiemScanFile, exportScanFileDtThoiKhoaBieu
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(PrintScanFileModal);