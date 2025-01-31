import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTabs } from 'view/component/AdminPage';
import { ResultScanImg } from 'modules/mdDaoTao/dtDiem/section/SectionDetailResult';
import { getFileScan } from './redux';

class ScanDiemModal extends AdminModal {
    state = { dataScan: [] }

    componentDidMount() {
        this.onHidden(() => this.setState({ dataScan: [] }));
    }

    onShow = ({ mssv, maHocPhan, isAnDiem }) => {
        !isAnDiem && this.props.getFileScan(mssv, maHocPhan, dataScan => this.setState({ dataScan }));
    }

    content = (data) => {
        const { fileName: filename, idSemester, idFolder } = data;
        return <div style={{ maxHeight: '70vh' }} className='row'>
            <div className='d-inline-block col-md-12' style={{ maxHeight: 'inherit', overflow: 'auto' }}>
                <div style={{ border: 'solid' }}>
                    <ResultScanImg {...{ filename, selectedId: filename, idSemester, idFolder }} />
                </div>
            </div>
        </div>;
    }

    render = () => {
        const { dataScan } = this.state, tabs = [];
        dataScan.forEach((data, index) => tabs.push({
            title: `Ảnh scan ${index + 1}`,
            component: this.content(data),
        }));

        return this.renderModal({
            title: 'Chi tiết ảnh scan',
            size: 'large',
            body: <div>
                {
                    tabs.length ? <FormTabs tabs={tabs} /> : 'Chưa có dữ liệu'
                }
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getFileScan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ScanDiemModal);