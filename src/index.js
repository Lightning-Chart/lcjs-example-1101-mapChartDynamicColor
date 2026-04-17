/*
 * LightningChart JS that showcases MapChart with dynamic region coloring
 * based on an external data set (country population).
 */
// Import LightningChartJS
const lcjs = require('@lightningchart/lcjs')

// Extract required parts from LightningChartJS.
const { lightningChart, MapTypes, PalettedFill, LUT, ColorRGBA, formatLongitudeLatitude, regularColorSteps, Themes } = lcjs

const mapChart = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        }).Map({
    theme: (() => {
    const t = Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
    const smallView = Math.min(window.innerWidth, window.innerHeight) < 500
    if (!window.__lcjsDebugOverlay) {
        window.__lcjsDebugOverlay = document.createElement('div')
        window.__lcjsDebugOverlay.style.cssText = 'position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;z-index:99999;font:12px monospace;pointer-events:none'
        if (document.body) document.body.appendChild(window.__lcjsDebugOverlay)
        setInterval(() => {
            if (!window.__lcjsDebugOverlay.parentNode && document.body) document.body.appendChild(window.__lcjsDebugOverlay)
            window.__lcjsDebugOverlay.textContent = window.innerWidth + 'x' + window.innerHeight + ' dpr=' + window.devicePixelRatio + ' small=' + (Math.min(window.innerWidth, window.innerHeight) < 500)
        }, 500)
    }
    return t && smallView ? lcjs.scaleTheme(t, 0.5) : t
})(),
    type: MapTypes.Europe,
})
const theme = mapChart.getTheme()

mapChart
    .setTitle('Population by country (2018)')
    .setFillStyle(
        new PalettedFill({
            lut: new LUT({
                steps: regularColorSteps(5 * 1000 * 1000, 100 * 1000 * 1000, theme.examples.badGoodColorPalette.reverse(), {
                    formatLabels: (value) => `${(value / (1000 * 1000)).toFixed(0)} Million`,
                }),
                interpolate: true,
                // This property is used to specify fallback color for regions which have no data.
                color: ColorRGBA(255, 255, 255),
            }),
        }),
    )
    .setCursorFormatting((_, hit) => {
        const result = [
            [{ text: hit.region.name, rowFillStyle: mapChart.getTheme().cursorResultTableHeaderBackgroundFillStyle }],
            [formatLongitudeLatitude(hit.longitude, hit.latitude)],
        ]
        if (hit.value) {
            result.push(['Population', '', `${(hit.value / (1000 * 1000)).toFixed(1)} million`])
        } else {
            result.push('No population data available')
        }
        return result
    })

// Load population data.
fetch(new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'examples/assets/1101/population_eu_2018.json')
    .then((r) => r.json())
    .then((populationData) => {
        // Data is Europe countries population in year 2018.
        // Format is:
        // Array<{ "Country Code": string, "Value": number }>

        // Map data to format expected by Europe MapChart.
        const regionValuesData = populationData.map((item) => ({
            ISO_A3: item['Country Code'],
            value: item['Value'],
        }))
        mapChart.invalidateRegionValues(regionValuesData)
    })
