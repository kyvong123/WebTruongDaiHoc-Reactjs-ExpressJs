import React from 'react';
import './HomePage.css';
export class Img extends React.Component {
    render() {
        let { src, alt, className, style, width, height, onClick, onLoad, loading, id, onLoading } = this.props;
        if (!onLoading) onLoading = false;
        if (src && !(src.startsWith('http') || src.startsWith('/api'))) src = T.cdnDomain + src;
        const finalProps = { src };
        if (id) finalProps.id = id;
        if (alt) finalProps.alt = alt;
        if (className) finalProps.className = className;
        if (style) finalProps.style = style;
        if (width) finalProps.width = width;
        if (height) finalProps.height = height;
        if (onClick) finalProps.onClick = onClick;
        if (onLoad) finalProps.onLoad = onLoad;
        if (loading) finalProps.loading = loading;
        return <React.Fragment>

            {onLoading ?
                <div className='imgSpiner' style={{ fontSize: '24px' }} ></div>
                :
                <img {...finalProps} />
            }
        </React.Fragment>;
    }
}
