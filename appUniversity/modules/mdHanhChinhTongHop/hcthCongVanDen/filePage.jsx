import React from 'react';
import { Document, Page } from 'react-pdf';
import { AdminPage, loadSpinner } from 'view/component/AdminPage';
import { Buffer } from 'buffer';
import { Tooltip } from '@mui/material';



export default class ReadOnlyPdf extends AdminPage {
    state = { scale: 1, page: 1, pages: 0, height: 50, width: 50 }
    componentDidMount() {
        const queryParams = new URLSearchParams(window.location.search);
        const info = T.parse(queryParams.get('info'));
        this.setState({ ...info, url: `/api/hcth/van-ban-den/download/${info.ma}/${info.tenFile}` }, () => {
            T.get(`${this.state.url}?format=base64`, {}, async (res) => {
                const buffer = Buffer.from(res.data, 'base64');
                this.setState({ buffer });
            }, () => {
                setTimeout(this.hide, 500);
                T.notify('Tải file thất bại', 'danger');
            });
        });
    }

    onChangeScale = (value) => {
        const newValue = this.state.scale + value;
        if (newValue >= 0.5 && newValue <= 3)
            this.setState({ scale: newValue });
    }

    render = () => {
        return this.renderPage({
            title: this.state.ten,
            icon: 'fa fa-caret-square-o-left',
            header:
                <div className='d-flex justify-content-start' style={{ gap: 10, flex: 2 }}>
                    <a className='btn btn-success' target="_blank" rel="noreferrer noopener" href={this.state.url} download><i className='fa fa-lg fa-download' /></a>

                    <Tooltip title='Thu nhỏ' arrow>
                        <button className='btn btn-info' onClick={() => this.onChangeScale(-0.25)}><i className='fa fa-lg fa-search-minus' /></button>
                    </Tooltip>
                    <Tooltip title='Phóng to' arrow>
                        <button className='btn btn-info' onClick={() => this.onChangeScale(0.25)}><i className='fa fa-lg fa-search-plus' /></button>
                    </Tooltip>
                </div>,
            content: this.state.buffer ?

                <div className='tile col-md-12 d-flex justify-content-center' style={{ background: 'grey', overflowX: 'auto' }}>
                    {/* <div className='d-flex' style={{ height: 'fit-content', width: 'fit-content', display: 'inline-block' }} > */}
                    <Document style={{ paddingTop: 10, gap: 10 }} onLoadSuccess={(data) => !this.state.pages && this.setState({ pages: data.numPages })} file={{ data: this.state.buffer }}>
                        {Array.from(Array(this.state.pages).keys()).map((index) => <Page className='pt-3' key={index} scale={this.state.scale} pageNumber={index + 1} />)}
                    </Document>
                    {/* </div> */}
                </div>

                : loadSpinner()
        });
    }
}