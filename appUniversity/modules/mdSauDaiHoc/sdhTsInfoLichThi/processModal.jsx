import React from 'react';

import { AdminModal } from 'view/component/AdminPage';


export class ProcessModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
        this.setState({ process: this.props.process });
    }

    componentDidUpdate(prev) {
        if (prev.process != this.props.process) this.setState({ process: this.props.process });
    }
    onHide = () => {
        this.setState({ process: '0%' });
    }
    render = () => {
        return this.renderModal({
            showCloseButton: false,
            title: this.props.title || '',
            style: { paddingTop: '10%', },
            body: <div style={{ minHeight: '150px' }}>
                <div className='overlay' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className='m-loader mb-2 mt-2'>
                        <svg className='m-circular' viewBox='25 25 50 50'>
                            <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                        </svg>
                    </div>
                    <h3 className='l-text mb-3'>Loading {this.state.process || '...'}</h3>
                    <b>{this.props.caption || 'Vui lòng đừng rời khỏi trang'}</b>
                </div>
            </div>
        });
    }
}