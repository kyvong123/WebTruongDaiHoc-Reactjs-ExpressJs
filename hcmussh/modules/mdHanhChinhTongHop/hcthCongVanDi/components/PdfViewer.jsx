import { Tooltip } from '@mui/material';
import { Buffer } from 'buffer';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import React from 'react';
import { Document, Page } from 'react-pdf';
import { AdminModal } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getFontAsync } from '../redux/vanBanDi';
// const { vanBanDi } = require('../../constant');


export default class PdfViewer extends AdminModal {

    state = { scale: 1, page: 1, pages: 0, height: 50, width: 50 }

    onShow = (props) => {
        this.setState({ ...props, page: props.pageNumber }, () => {
            const url = props.url || `/api/hcth/van-ban-di/file/${props.id}?format=base64&purpose=view`;
            T.get(url, {}, async (res) => {
                const buffer = Buffer.from(res.data, 'base64');
                T.get(`/api/hcth/chu-ky/download?format=base64&shcc=${this.state.shcc || ''}&width=${this.state.width * 4}&height=${this.state.height * 4}&background=0xFFF57F17`, {}, async (res) => {
                    const imgFile = Buffer.from(res.data, 'base64');
                    this.setState({ file: buffer, outFile: buffer, imgFile }, this.setBuffer);
                });
            });
        });
    }

    setBuffer = async () => {
        let { xCoordinate, yCoordinate, pageNumber, height, width, file, imgFile, isSoVanBan, fontSize } = this.state;
        if (pageNumber != null) {
            const document = await PDFDocument.load(file);
            const documentPages = document.getPages();
            const page = documentPages[pageNumber - 1];
            const { height: pageHeight } = page.getSize();

            if (isSoVanBan) {
                // const timesRomanFont = await document.embedFont(StandardFonts.TimesRoman);
                const font = await getFontAsync();
                document.registerFontkit(fontkit);

                const timesRomanFont = await document.embedFont('data:font/opentype;base64,' + font);
                fontSize = fontSize || 14;
                page.drawText(this.state.soVanBan, {
                    size: fontSize,
                    x: xCoordinate,//Math.round(xCoordinate - width / 4),
                    y: Math.round(pageHeight - yCoordinate),
                    color: rgb(0, 0, 0),
                    font: timesRomanFont,
                    lineHeight: fontSize + 10
                });
            } else {
                const jpgImage = await document.embedJpg(imgFile);

                page.drawImage(jpgImage, {
                    x: Math.round(xCoordinate - width / 2), y: Math.round(pageHeight - height / 2 - yCoordinate),
                    width: this.state.width, height: this.state.height,
                    opacity: 0.5
                });
            }

            this.setState({ outFile: await document.save() });
        }
    }

    onHide = () => {
        this.setState({ content: null });
    }

    handleClick = (event) => {
        let bounds = event.target.getBoundingClientRect();
        let x = event.clientX - bounds.left;
        let y = event.clientY - bounds.top;
        this.setState({ xCoordinate: Math.round(x / this.state.scale), yCoordinate: Math.round(y / this.state.scale), pageNumber: this.state.page }, this.setBuffer);
    }

    onSubmit = () => {
        // const { xCoordinate, yCoordinate, page } = this.state;
        this.state.submit && this.state.submit({ xCoordinate: this.state.xCoordinate, yCoordinate: this.state.yCoordinate, pageNumber: this.state.pageNumber });
        this.hide();
    }


    onHide = () => {
        // this.setState
    }

    onChangePage = () => {

    }

    onChangeScale = (value) => {
        const newValue = this.state.scale + value;
        if (newValue >= 0.5 && newValue <= 3)
            this.setState({ scale: newValue });
    }


    render = () => {
        return this.renderModal({
            title: this.props.fileName,
            isShowSubmit: this.state.xCoordinate != null && this.state.yCoordinate && this.state.pageNumber && !this.state.readOnly,
            style: { zIndex: 10000 },
            size: 'elarge',
            body: this.state.file && <div className='row' style={{ width: '100%', heigth: '60vh' }}>
                <div className='col-md-12 d-flex justify-content-between' style={{}}>
                    <div className='d-flex justify-content-start' style={{ gap: 10, flex: 2 }}>
                        <Tooltip title='Thu nhỏ' arrow>
                            <button className='btn btn-info' onClick={(e) => e.preventDefault() || e.stopPropagation() || this.onChangeScale(-0.25)}><i className='fa fa-lg fa-search-minus' /></button>
                        </Tooltip>
                        <Tooltip title='Phóng to' arrow>
                            <button className='btn btn-info' onClick={(e) => e.preventDefault() || e.stopPropagation() || this.onChangeScale(0.25)}><i className='fa fa-lg fa-search-plus' /></button>
                        </Tooltip>
                    </div>

                    <Pagination fixedSize style={{ position: 'unset', flex: 1 }} pageNumber={this.state.page} pageSize={1} pageTotal={this.state.pages} totalItem={this.state.pages} getPage={(pageNumber) => this.setState({ page: pageNumber })} />
                </div>

                <div className='col-md-12 d-flex justify-content-center' style={{ background: 'grey', padding: 10, marginTop: 10, minHeight: '70vh', maxHeight: '70vh', overflow: 'auto' }}>
                    <div className='d-flex' style={{ height: 'fit-content', width: 'fit-content', display: 'inline-block' }} >
                        {/* <div disabled style={{ pointerEvents: 'none', cursor: 'default' }}> */}
                        <Document onLoadSuccess={(data) => !this.state.pages && this.setState({ pages: data.numPages })} file={{ data: this.state.outFile }}>
                            <Page onClick={!this.state.readOnly ? (e) => this.handleClick(e) : null} scale={this.state.scale} pageNumber={this.state.page} />
                        </Document>
                        {/* </div> */}
                    </div>
                </div>
            </div>
        });
    }
}