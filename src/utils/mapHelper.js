import React, { useState } from 'react'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'

const queryWaterQuality = async (point, dist) => {
    console.log(point, dist)
    const res = await fetch(`http://environment.data.gov.uk/water-quality/id/sampling-point?lat=${point.y}&long=${point.x}&dist=${dist}`)
    const water_sample_points = await res.json()
    const graphics = []

    water_sample_points.items && water_sample_points.items.forEach(d => {
        const geom = new Point({
            latitude: d.lat,
            longitude: d.long
        })

        const graphic = new Graphic({
            geometry: geom,
            attributes: {
                label: d.label,
                area: d.area.label,
                url: d['@id']
            }
        })
        graphics.push(graphic)
    });
    return graphics
}

const graphicsToFeatureLayer = graphics => {
    return new FeatureLayer({
        source: graphics,
        objectIdField: "OBJECTID",
        fields: [
            {
                name: "OBJECTID",
                type: "oid"
            },
            {
                name: "url",
                type: "string"
            }
        ],
        popupTemplate: {
            title: (event) => {
                return locator
                    .locationToAddress({
                        location: event.graphic.geometry
                    })
                    .then((response) => {
                        return response.address;
                    })
                    .catch((error) => {
                        return "The middle of nowhere";
                    });
            },
            content: "<img src='{url}'>"
        },
        renderer: {
            type: "simple",
            symbol: {
                type: "text",
                color: "#7A003C",
                text: "\ue651",
                font: {
                    size: 20,
                    family: "CalciteWebCoreIcons"
                }
            }
        }
    });

}





export { queryWaterQuality, graphicsToFeatureLayer }