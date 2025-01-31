import React from 'react';
import { AdminModal } from 'view/component/AdminPage';


export default class ReadOnlyPdf extends AdminModal {

    state = { scale: 1, page: 1, pages: 0, height: 50, width: 50, url: '' }

    onShow = ({ url, index, files }) => {
        this.setState({ url, showed: true, files: files || [], index }, () => { });

    }

    onHide = () => {
        this.setState({ showed: false });
    }


    onChangeScale = (value) => {
        const newValue = this.state.scale + value;
        if (newValue >= 0.5 && newValue <= 3)
            this.setState({ scale: newValue });
    }

    render = () => {
        return this.state.showed ? <div style={{ background: 'black', width: '100vw', height: '100vh', display: this.state.showed ? 'block' : 'none', position: 'fixed', top: 0, left: 0, zIndex: 1050 }}>
            <div style={{ width: '100%', height: '30px', }} className='d-flex align-items-center justify-content-between px-2'>
                {<div className='d-flex justify-content-end align-items-center pr-1' style={{ fontSize: '1.5rem' }}><i className='fa text-light fa-times-circle' onClick={() => this.setState({ showed: false })} /></div>}
                <div className='d-flex justify-content-between' style={{ flex: 1 }}>
                    {(this.state.files?.length && this.state.index != 0) ? <div className='d-flex justify-content-start align-items-center px-1' style={{ gap: 10, flex: 1 }} onClick={() => {
                        this.setState({ url: this.state.files[this.state.index - 1].linkFile, index: this.state.index - 1 });
                    }}>
                        <i className='fa text-light fa-chevron-circle-left' style={{ fontSize: '1.5rem' }} />
                        <div style={{ flex: 1, textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px', color: 'white' }}>
                            {this.state.files?.[this.state.index - 1]?.ten}
                        </div>
                    </div> : null}
                    {this.state.files?.length && this.state.index < (this.state.files.length - 1) && <div className='d-flex justify-content-start align-items-center px-1' style={{ gap: 10, flex: 1, flexDirection: 'row-reverse' }} onClick={() => {
                        this.setState({ url: this.state.files[this.state.index + 1].linkFile, index: this.state.index + 1 });
                    }}>
                        <i className='fa text-light fa-chevron-circle-right' style={{ fontSize: '1.5rem' }} />
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px', color: 'white' }}>
                            {this.state?.files[this.state.index + 1]?.ten}
                        </div>
                    </div>}
                </div>
            </div>
            <div style={{ width: '100%', height: 'calc(100vh - 30px)' }}>
                {this.state.showed && this.state.url && <iframe width='100%' height='100%' src={'/utils/view-pdf?file=' + encodeURI(this.state.url)} />}
            </div>
        </div> : null;
    }
}