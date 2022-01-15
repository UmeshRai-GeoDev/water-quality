import React, { useState } from 'react'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import Field from '@arcgis/core/layers/support/Field'

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
        const symbol = {
            type: "text",
            color: "#7A003C",
            text: "\ue651",
            font: {
                size: 20,
                family: "CalciteWebCoreIcons"
            }
        }

        const attrs = {
            url: d['@id'],
            notation: d.notation
        }
        const graphic = new Graphic({
            geometry: geom,

            attributes: {
                // OBJECTID: 0,
                url: "test"
            },
            symbol: symbol,
        })
        graphics.push(graphic)
    });
    return graphics
}

const graphicsToFeatureLayer = graphics => {
    console.log(graphics)
    const _fl = new FeatureLayer({
        source: graphics,
        objectIdField: "OBJECTID",
        fields: [
            new Field({ name: "OBJECTID", type: "oid", })
        ],
        popupTemplate: {
            title: (d) => {
                console.log(d)
                return "hello World"
            },
            content: `<h1>${d['id']}</h1>`
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
    // _fl.set({
    //     fields: [
    //         new Field({ name: "OBJECTID", type: "oid" }),
    //         new Field({ name: "url", type: "string", alias: "URL" }),
    //         new Field({ name: "notation", type: "string" }),

    //         // {
    //         //     name: "notation",
    //         //     type: "string"
    //         // },
    //         // {
    //         //     name: "url",
    //         //     type: "string"
    //         // },
    //     ],
    // })
    return _fl

}





export { queryWaterQuality, graphicsToFeatureLayer }