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
    theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
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
        const result = [[hit.region.name], [formatLongitudeLatitude(hit.longitude, hit.latitude)]]
        if (hit.value) {
            result.push(['Population', '', `${(hit.value / (1000 * 1000)).toFixed(1)} million`])
        } else {
            result.push('No population data available')
        }
        return result
    })

// Add Legend to show color look-up range.
mapChart
    .addLegendBox()
    // Dispose example UI elements automatically if they take too much space. This is to avoid bad UI on mobile / etc. devices.
    .setAutoDispose({
        type: 'max-width',
        maxWidth: 0.3,
    })
    .add(mapChart)

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
