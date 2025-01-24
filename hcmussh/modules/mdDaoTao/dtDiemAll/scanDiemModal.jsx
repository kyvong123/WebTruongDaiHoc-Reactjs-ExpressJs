import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTabs, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { ResultScanImg } from 'modules/mdDaoTao/dtDiem/section/SectionDetailResult';
import { dtDiemAllGetDataScan, dtDiemAllResaveDataScan } from './redux';

class ScanDiemModal extends AdminModal {
    state = { dataScan: [] }

    onShow = (dataHocPhan) => {
        this.props.dtDiemAllGetDataScan(dataHocPhan.maHocPhan, dataScan => this.setState({ dataHocPhan, dataScan }));
    }

    renderGrade = (gradeResult) => {
        return renderDataTable({
            stickyHead: true,
            divStyle: { maxHeight: '65vh', maxWidth: '100%' },
            data: gradeResult,
            renderHead: () => <tr>
                <TableHead content='#' style={{ width: 'auto' }} />
                <TableHead content='MSSV' style={{ width: '30%' }} />
                <TableHead content='Họ và tên' style={{ width: '50%' }} />
                <TableHead content='Tên' style={{ width: '20%' }} />
                <TableHead content='V' />
                <TableHead content='Điểm' style={{ width: 'auto' }} />
            </tr>,
            renderRow: (item, index) => {
                let isFalse = !item.isMissed && isNaN(parseFloat(item.grade));
                return <tr key={index} style={{ fontSize: '0.8rem', }}>
                    <TableCell style={{ textAlign: 'center', backgroundColor: isFalse ? '#ffcccb' : '' }} content={item.indexInFile} />
                    <TableCell content={<strong>{item.mssv}</strong>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'center' }} content={item.isMissed ? 'x' : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.grade} />
                </tr>;
            }
        });
    }

    handleSave = (data) => {
        T.confirm('Cảnh báo', 'Thao tác này sẽ lưu đè dữ liệu điểm hiện tại!', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang cập nhật điểm sinh viên!', 'warning', false, null, true);
                this.props.dtDiemAllResaveDataScan(data, this.state.dataHocPhan, this.props.save);
            }
        });
    }

    content = (data) => {
        const { fileName: filename, idResult: selectedId, idSemester, idFolder, gradeResult } = data;
        return <div style={{ maxHeight: '70vh' }} className='row'>
            <div className='d-inline-block col-md-7' style={{ maxHeight: 'inherit', overflow: 'auto' }}>
                <div style={{ border: 'solid' }}>
                    <ResultScanImg {...{ filename, selectedId, idSemester, idFolder }} />
                </div>
            </div>
            <div className='d-inline-block col-md-5' style={{ maxHeight: 'inherit' }}>
                <div>
                    <button style={{ height: 'fit-content' }} className='btn btn-success' type='button' onClick={() => this.handleSave({ ...data })}>
                        <i className='fa fa-save' />Lưu dữ liệu
                    </button>
                </div>
                {this.renderGrade(gradeResult)}
            </div>
        </div>;
    }

    render = () => {
        const { dataScan } = this.state, tabs = [];

        dataScan.forEach(data => tabs.push({
            title: `Ảnh ${data.fileName} folder ${data.folderName}`,
            component: this.content(data),
        }));

        return this.renderModal({
            title: 'Lấy lại dữ liệu scan',
            size: 'elarge',
            body: <div>
                <FormTabs tabs={tabs} />
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { dtDiemAllGetDataScan, dtDiemAllResaveDataScan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ScanDiemModal);