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
        webMap.removeAll()
        queryWaterQuality(searchResultPoint, searchDistance).then(samplePointsGraphics => {
            mapView.goTo(samplePointsGraphics.map(d => d.value))
            samplePointsGraphics.forEach(g => {
                const _fields = new Set(Object.keys(g.value.attributes))
                console.log(_fields)
                g.popupTemplate = {
                    title: '{label}',
                    content: [
                        {
                            type: 'fields',
                            fieldInfos: [..._fields].map(d => {
                                return { fieldName: d }
                            })
                        }
                    ]
                }
                mapView.graphics.add(g.value)
            })
        })

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
            map: webMap,
            popup: {
                dockEnabled: true,
                dockOptions: {
                    // Disables the dock button from the popup
                    buttonEnabled: true,
                    // Ignore the default sizes that trigger responsive docking
                    breakpoint: true
                }
            }
        });

        view.on("click", function (event) {
            // Search for graphics at the clicked location. View events can be used
            // as screen locations as they expose an x,y coordinate that conforms
            // to the ScreenPoint definition.
        });

        setMapView(view);
    }, [])


    useEffect(() => {
        webMap.removeAll()
        if (!samplePointsFL) return
        // if (samplePointsFL) webMap.add(samplePointsFL)

        samplePointsFL.queryExtent().then(res => {
            mapView.goTo(res.extent)
        })
    }, [samplePointsFL])




    return (
        <section style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <section style={{
                padding: '2em',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '4em',
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

            <div ref={mapContainer} style={{ minHeight: '400px', width: '100%', flexGrow: 1 }} />
        </section>
    )
}

export default MapSection