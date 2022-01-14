import React, { useState } from 'react';
import Layout from './components/Layout';
import './App.css';


import {
  applyPolyfills,
  defineCustomElements,
} from "@esri/calcite-components/dist/loader";


// As per calcite component documentation, define custom component
applyPolyfills().then(_ => {
  defineCustomElements(window);
})


const App = () => (
  <Layout />
);

export default App;
