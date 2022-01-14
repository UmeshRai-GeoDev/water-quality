import React from 'react'
import Header from './Header'
import './Layout.css'
import MapSection from './MapSection'

const Layout = () => {
    return (
        <div className='container'>
            <Header></Header>
            <MapSection></MapSection>
        </div>
    )
}

export default Layout
