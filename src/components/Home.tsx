import React from 'react';
import Header from './Header';
import { Button } from 'react-bootstrap';

function Home() {
    return (
        <div className='App'>
            <Header />
            <div className='main-section'>
                <h2>Welcome to <b>description.pics</b></h2>
                <h4 className='mt-4'>You can upload a picture and help training our model, or you can request a description for your image.</h4>
            </div>
            <Button className="home-button" type="button" href="/upload-picture">Upload picture</Button>
            <Button className="home-button" type="button" href="/scan-picture">Get description</Button>
        </div>
    )
}

export default Home;