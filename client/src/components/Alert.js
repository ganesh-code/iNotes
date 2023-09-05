import React from 'react'

export default function Alert(props) {

    return (
        props.alert && <div style={{
            position: 'absolute', zIndex: 10, top: '86px',
            right: '34px'
        }} className={`alert alert-${props.alert.type} m-0`} role="alert">
            <strong>{props.alert.type === 'danger' ? 'Error' : 'Success'}</strong> : {props.alert.msg}
        </div>

    )
}
