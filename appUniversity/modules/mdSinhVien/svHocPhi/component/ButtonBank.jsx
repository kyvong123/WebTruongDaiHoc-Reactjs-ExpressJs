import { Tooltip } from '@mui/material';
import React from 'react';

export class ButtonBank extends React.Component {
    render = () => {
        const { title, onClick, imgSrc } = this.props;
        return (
            <Tooltip title={title} arrow placement='bottom'>
                <div className='col-md-3' >
                    <div style={{
                        backgroundImage: `url(${T.cdnDomain}${imgSrc}?t=${new Date().getTime()})`,
                        backgroundPosition: 'center center',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        height: '100px', width: '100%',
                        // border: '2px solid #78d5ef',
                        cursor: 'pointer'
                    }} onClick={e => e.preventDefault() || onClick()} />
                </div>
            </Tooltip>
        );
    }
}