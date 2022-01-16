import React, { useState } from 'react'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import Field from '@arcgis/core/layers/support/Field'
import * as promiseUtils from '@arcgis/core/core/promiseUtils'


const getMeasurementByNotation = async (notation) => {
    const _url = `http://environment.data.gov.uk/water-quality/id/sampling-point/${notation}/measurements`
    const res = await fetch(_url)
    const result = await res.json()
    const measurements = result.items
    return measurements.map(d => {
        return { ['determinand']: d['determinand']['label'], ["result"]: d.result }
    })
}

const queryWaterQuality = async (point, dist) => {
    const res = await fetch(`http://environment.data.gov.uk/water-quality/id/sampling-point?lat=${point.y}&long=${point.x}&dist=${dist}&samplingPointStatus=open`)
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
        const graphic = new Graphic({
            geometry: geom,
            symbol: symbol,
            attributes: { notation: d.notation, label: d.label }
        })
        graphics.push(graphic)
    });



    return promiseUtils.eachAlways(graphics.map(g => {
        return getMeasurementByNotation(g.attributes.notation).then(infos => {
            const _inf = infos.reduce((prev, cur) => {
                return [...prev, { fieldName: cur['determinand'] }]
            }, [])
            infos.forEach(d => {
                g.attributes[d['determinand']] = d['result']
            })

            g.popupTemplate = {
                title: '{label}: {notation}',
                content: [
                    {
                        type: 'fields',
                        fieldInfos: _inf
                    }
                ]
            }
            return g
        })
    }))
}

const graphicsToFeatureLayer = graphics => {

    const _fl = new FeatureLayer({
        source: graphics,
        objectIdField: "OBJECTID",
        fields: [
            new Field({ name: "OBJECTID", type: "oid", }),
            new Field({ name: "label", type: "string", }),
            new Field({ name: "notation", type: "string", }),
        ]
        ,
        popupTemplate: {

            title: (e) => {
                console.log("Hello")
                return `{label}`
            },
            content: (e) => {
                return `
                <h3>Hello World!</h3>
                `

            }
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