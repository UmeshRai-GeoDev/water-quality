import React, { useEffect, useRef, useState } from 'react'
import WebMap from '@arcgis/core/WebMap'
import MapView from '@arcgis/core/views/MapView'
import Search from '@arcgis/core/widgets/Search'
import { CalciteButton, CalciteSlider } from '@esri/calcite-components-react'
import "@esri/calcite-components/dist/calcite/calcite.css";
import { graphicsToFeatureLayer, queryWaterQuality } from '../utils/mapHelper'

const destroyWidget = (widget, searchContainer) => {

    if (widget) {
        try {
            widget.destroy()
        } catch (TypeError) {
            console.log("Widget already destroyed")
        }
    }
}
const webMap = new WebMap({
    basemap: 'gray-vector'
})

const MapSection = () => {

    const [searchResultPoint, setSearchResultPoint] = useState()
    const [samplePointsFL, setSamplePointsFL] = useState()
    const [searchDistance, setsearchDistance] = useState(1)
    const [searchWidget, setsearchWidget] = useState()
    const [mapView, setMapView] = useState()
    const mapContainer = useRef()
    const searchContainer = useRef()

    const btnClickHandler = async () => {
        const samplePointsGraphics = await queryWaterQuality(searchResultPoint, searchDistance)
        const fl = graphicsToFeatureLayer(samplePointsGraphics)
        setSamplePointsFL(fl)
    }

    useEffect(() => {
        const searchWidget = new Search({ view: mapView, container: searchContainer.current, popupEnabled: false })
        searchWidget.on("search-complete", (e) => {
            const x = e.results[0]["results"][0].feature.geometry.longitude
            const y = e.results[0]["results"][0].feature.geometry.latitude
            setSearchResultPoint({ x, y })
        })
        searchWidget.on("search-clear", () => {
            setSearchResultPoint(null)
            webMap.removeAll()
        })
        return () => searchWidget.destroy()

    }, [mapView, searchContainer.current])

    useEffect(() => {
        if (!mapContainer.current) return

        const view = new MapView({
            center: [-115, 34.02],
            zoom: 5,
            container: mapContainer.current,
            map: webMap
        });

        setMapView(view);
    }, [])

    // useEffect(() => {
    //     if (!searchWidget) return
    //     searchWidget.view = mapView
    // }, [mapView])

    useEffect(() => {
        webMap.removeAll()
        if (!samplePointsFL) return
        if (samplePointsFL) webMap.add(samplePointsFL)

        samplePointsFL.queryExtent().then(res => {
            console.log(res.extent)
            mapView.goTo(res.extent)
        })
    }, [samplePointsFL])

    // view.whenLayerView(layer).then(function(layerView){
    //     layerView.watch("updating", function(val){
    //       // wait for the layer view to finish updating
    //       if(!val){
    //       }
    //     });
    //   });


    return (
        <section style={{ padding: "2em" }}>
            <section style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '4em',
                marginBottom: '20px'
            }}>
                <div ref={searchContainer} style={{ margin: '0em' }}></div>
                <div>
                    <span>Distance (in miles)</span>
                    <CalciteSlider value={searchDistance} onCalciteSliderInput={e => setsearchDistance(e.target.value)} step={0.5} max={5} min={0} labelHandles={true} ></CalciteSlider>
                </div>
                {searchResultPoint ?
                    <CalciteButton onClick={btnClickHandler} style={{ height: '40px' }}>Check Water Quality</CalciteButton> :
                    <CalciteButton disabled onClick={btnClickHandler} style={{ height: '40px' }}>Check Water Quality</CalciteButton>
                }
            </section>

            <div ref={mapContainer} style={{ height: '400px', width: '100%' }} />
        </section>
    )
}

export default MapSection