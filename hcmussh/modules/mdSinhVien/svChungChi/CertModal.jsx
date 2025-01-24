import React from 'react';
import { connect } from 'react-redux';
import { AdminModal } from 'view/component/AdminPage';
import { Img } from 'view/component/HomePage';


export class CertImg extends React.Component {
    state = { fileName: '' }
    componentDidMount() {
        let { fileName } = this.props;
        this.setState({ fileName });
    }
    componentDidUpdate(prevProps) {
        if (this.props && prevProps.fileName != this.props.fileName) {
            let { fileName } = this.props;
            this.setState({ fileName });
        }
    }
    render() {
        let { fileName } = this.state;
        let src = T.url(`/api/sv/chung-chi/cert-image?fileName=${fileName}`);
        return fileName ? <Img id={'certImg'} src={src} style={{ display: 'block', height: 'auto', maxWidth: '95%' }} /> : <></>;
    }
}

class CertModal extends AdminModal {
    onShow = ({ fileName }) => {
        this.setState({ fileName });
    }

    render = () => {
        const { fileName } = this.state;
        return this.renderModal({
            title: 'Chi tiết ảnh chứng chỉ',
            size: 'large',
            body: <div style={{ maxHeight: '70vh', margin: 'auto', width: '98%' }} className='row'>
                <div className='d-inline-block col-md-12' style={{ maxHeight: 'inherit', overflow: 'auto' }}>
                    <div style={{ border: 'solid' }}>
                        <CertImg fileName={fileName} />
                    </div>
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CertModal);